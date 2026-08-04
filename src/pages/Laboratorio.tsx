import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Laboratorio() {
  return (
    <PageContainer
      title="Monte seu laboratório"
      subtitle="VirtualBox com rede isolada, snapshots, e alvos vulneráveis (Metasploitable, DVWA) para treinar sem quebrar a lei"
      difficulty="iniciante"
      timeToRead="18 min"
    >
      <h2>Por que um laboratório</h2>
      <p>
        Você <strong>não treina pentest na internet</strong>. Escanear ou
        atacar sistemas sem autorização é crime, mesmo “só para aprender”. A
        solução é um lab próprio: máquinas virtuais numa rede isolada onde você
        pode quebrar tudo, restaurar e repetir. É seguro, gratuito e você
        controla o cenário.
      </p>
      <AlertBox type="danger" title="A regra de ouro">
        Só ataque o que é seu ou o que você tem permissão explícita por escrito
        para testar. Lab local, plataformas autorizadas (HTB/THM) e programas de
        bug bounty dentro do escopo — nada além disso.
      </AlertBox>

      <h2>1. O hipervisor: VirtualBox</h2>
      <p>
        O VirtualBox roda suas VMs. Alternativas são VMware Workstation Player e
        (se preferir bare-metal) o Proxmox, mas para começar o VirtualBox é
        grátis e suficiente.
      </p>
      <CommandTable
        title="Instalação (host Debian/Ubuntu)"
        variations={[
          { cmd: "sudo apt update && sudo apt install virtualbox", desc: "Instala o VirtualBox" },
          { cmd: "sudo apt install virtualbox-ext-pack", desc: "Extension pack (USB, RDP); opcional" },
          { cmd: "sudo usermod -aG vboxusers $USER", desc: "Seu usuário no grupo (relogue depois)" },
        ]}
      />
      <AlertBox type="info" title="Precisa de virtualização na BIOS">
        Ative <strong>VT-x</strong> (Intel) ou <strong>AMD-V</strong> na BIOS/UEFI.
        Sem isso as VMs de 64 bits não sobem ou ficam lentas.
      </AlertBox>

      <h2>2. Rede isolada — o passo que protege você</h2>
      <p>
        O erro clássico é deixar a VM vulnerável em modo <em>bridge</em>, exposta
        na sua rede de casa. Use <strong>Host-Only</strong> (ou <strong>Rede
        Interna</strong>): as VMs se enxergam entre si e o Kali as ataca, mas
        elas <strong>não alcançam a internet nem seus outros dispositivos</strong>.
      </p>
      <OutputBlock type="info" label="Modos de rede do VirtualBox">
        <p><strong>NAT</strong> — VM acessa a internet, mas fica isolada de outras VMs. Bom só para baixar updates.</p>
        <p><strong>Host-Only</strong> — rede privada entre host e VMs; sem internet. <em>Ideal para os alvos.</em></p>
        <p><strong>Rede Interna</strong> — só entre VMs, nem o host entra. Máximo isolamento.</p>
        <p><strong>Bridge</strong> — VM vira um host na sua LAN real. <strong>Nunca</strong> use para máquina vulnerável.</p>
      </OutputBlock>
      <PracticeBox
        title="Criar a rede host-only"
        goal="Uma rede privada 192.168.56.0/24 para o lab"
        command={`# GUI: File > Tools > Network Manager > Host-only > Create
# ou pela linha de comando:
VBoxManage hostonlyif create
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0
# depois, em cada VM: Settings > Network > Adapter 1 > Host-only Adapter > vboxnet0`}
        expected="Kali e alvos na mesma faixa 192.168.56.x, sem saída para internet"
        verify="Do Kali: ping no IP do alvo funciona; ping em 8.8.8.8 falha"
      />
      <AlertBox type="warning" title="Truque prático">
        Deixe <strong>dois adaptadores</strong> no Kali: Adapter 1 em Host-Only
        (para atacar o lab) e Adapter 2 em NAT (para baixar ferramentas). Nos
        alvos vulneráveis, só Host-Only.
      </AlertBox>

      <h2>3. Snapshots — seu botão de desfazer</h2>
      <p>
        Antes de explorar uma máquina, tire um <strong>snapshot</strong>. Se
        você corromper o alvo (ou o próprio Kali) com um exploit, restaura em
        segundos em vez de reinstalar tudo.
      </p>
      <CommandTable
        title="Snapshots por linha de comando"
        variations={[
          { cmd: 'VBoxManage snapshot "Kali" take limpo', desc: "Cria um snapshot chamado 'limpo'" },
          { cmd: 'VBoxManage snapshot "Kali" list', desc: "Lista os snapshots da VM" },
          { cmd: 'VBoxManage snapshot "Kali" restore limpo', desc: "Volta ao estado 'limpo' (VM desligada)" },
        ]}
      />
      <AlertBox type="info" title="Rotina saudável">
        1 snapshot “base limpa” logo após instalar e atualizar o Kali. Outro
        antes de cada laboratório pesado. Assim você nunca perde o ambiente.
      </AlertBox>

      <h2>4. Alvos vulneráveis</h2>
      <p>Máquinas feitas de propósito para serem invadidas. Baixe, importe e ataque.</p>
      <OutputBlock type="muted" label="Catálogo para começar">
        <p><strong>Metasploitable 2</strong> — Linux cheio de serviços vulneráveis; clássico para Metasploit e enumeração.</p>
        <p><strong>Metasploitable 3</strong> — versões Windows e Ubuntu mais modernas (montadas via Packer/Vagrant).</p>
        <p><strong>DVWA</strong> — Damn Vulnerable Web App: SQLi, XSS, upload, command injection com nível de dificuldade ajustável.</p>
        <p><strong>OWASP Juice Shop / bWAPP / WebGoat</strong> — alvos web modernos para treinar o OWASP Top 10.</p>
        <p><strong>VulnHub</strong> — centenas de VMs prontas (formato .ova) estilo “capture the flag”.</p>
      </OutputBlock>
      <PracticeBox
        title="Subir o Metasploitable 2"
        goal="Primeiro alvo rodando na rede host-only"
        command={`# 1. baixe o Metasploitable2-Linux.zip (SourceForge) e extraia o .vmdk
# 2. VirtualBox: New > Linux/Other Linux 64 > use disco existente (o .vmdk)
# 3. Network > Host-only Adapter > vboxnet0
# 4. login padrao: msfadmin / msfadmin
# 5. descubra o IP dentro da VM:
ip addr | grep 192.168.56`}
        expected="Metasploitable com IP 192.168.56.x, alcançável do Kali"
        verify="Do Kali: nmap -sV 192.168.56.X mostra dezenas de portas abertas"
      />
      <PracticeBox
        title="DVWA rapidíssimo com Docker"
        goal="App web vulnerável sem montar VM inteira"
        command={`docker run --rm -it -p 8080:80 vulnerables/web-dvwa
# acesse http://localhost:8080  (login admin/password)
# em DVWA Security, comece em 'Low' e suba conforme evolui`}
        expected="DVWA aberto no navegador, pronto para SQLi/XSS/upload"
        verify="A página de login do DVWA carrega em http://localhost:8080"
      />

      <h2>5. Plataformas online (autorizadas)</h2>
      <p>
        Quando quiser cenários prontos e progressão guiada, sem manter VMs, use
        plataformas que <strong>autorizam o ataque</strong> na infraestrutura
        delas:
      </p>
      <OutputBlock type="info" label="Onde praticar de graça/barato">
        <p><strong>TryHackMe</strong> — trilhas guiadas, ótimo para começar; roda no navegador.</p>
        <p><strong>Hack The Box</strong> — máquinas mais desafiadoras; use a VPN deles.</p>
        <p><strong>PortSwigger Web Security Academy</strong> — labs de web gratuitos, referenciados neste curso.</p>
        <p><strong>PentesterLab / VulnHub</strong> — exercícios extras por tema.</p>
      </OutputBlock>
      <Terminal
        path="~"
        lines={[
          { comment: "conectar na VPN do Hack The Box", cmd: "sudo openvpn seu-usuario.ovpn", out: "Initialization Sequence Completed", outType: "success" },
          { comment: "agora as maquinas do HTB respondem", cmd: "ping 10.10.10.10", out: "64 bytes from 10.10.10.10: icmp_seq=1 ttl=63", outType: "muted" },
        ]}
      />

      <h2>Checklist do lab pronto</h2>
      <OutputBlock type="success" label="Antes de começar a treinar">
        <p>☑ VirtualBox instalado, VT-x/AMD-V ligado</p>
        <p>☑ Rede <strong>host-only</strong> criada (192.168.56.0/24)</p>
        <p>☑ Kali atualizado, com snapshot “limpo”</p>
        <p>☑ Pelo menos 1 alvo (Metasploitable ou DVWA) na host-only</p>
        <p>☑ Confirmado: alvo <strong>sem</strong> acesso à internet</p>
        <p>☑ Conta no TryHackMe ou HTB para cenários extras</p>
      </OutputBlock>
    </PageContainer>
  );
}
