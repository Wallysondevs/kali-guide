import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Apt() {
  return (
    <PageContainer
      title="APT em profundidade"
      subtitle="Como o gerenciador de pacotes do Kali realmente funciona — cache, pinning, holds, debug e por que não quebrar a base ofensiva."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>O que é o APT (e o que está embaixo)</h2>
      <p>
        <strong>APT</strong> (<em>Advanced Package Tool</em>) é o front-end de alto nível
        do Debian/Kali. Ele NÃO instala nada sozinho: ele resolve dependências, baixa{" "}
        <code>.deb</code> e delega ao <strong>dpkg</strong> a instalação de fato. Quem
        manda no disco é o <code>dpkg</code>; o APT é o "cérebro".
      </p>
      <p>
        Existem três comandos do "ecossistema apt" que confundem todo mundo:{" "}
        <code>apt</code>, <code>apt-get</code> e <code>aptitude</code>. Saber quando usar
        cada um é o pulo do gato pra não detonar uma instalação Kali em meio a um
        engagement.
      </p>

      <CommandTable
        title="apt vs apt-get vs aptitude"
        variations={[
          { cmd: "apt", desc: "UI moderna, colorida, com barra de progresso. Pensada para humanos no terminal.", output: "Recomendado no dia a dia." },
          { cmd: "apt-get", desc: "Interface antiga, estável, sem cores. Saída previsível: ideal para scripts e automação.", output: "Use em Ansible, cron, Dockerfile." },
          { cmd: "apt-cache", desc: "Apenas consulta o índice local: search, show, depends, rdepends, policy.", output: "Não modifica nada no sistema." },
          { cmd: "aptitude", desc: "Front-end interativo (TUI ncurses) com resolvedor próprio. Bom em conflitos complexos.", output: "Não vem por padrão: sudo apt install aptitude" },
          { cmd: "apt-mark", desc: "Marcar pacotes (hold, unhold, auto, manual). Crucial para pinning.", output: "Veja seção 'Hold' abaixo." },
        ]}
      />

      <h2>O cache e o índice</h2>
      <p>
        Quando você roda <code>apt update</code>, o APT baixa os arquivos{" "}
        <code>Packages</code> (índice por repositório) e atualiza o cache local em{" "}
        <code>/var/lib/apt/lists/</code>. Sem isso, <code>apt install</code> trabalha com
        informação velha e pode tentar baixar versões que não existem mais no mirror.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "atualiza só o índice (não instala nada ainda)",
            cmd: "sudo apt update",
            out: `Hit:1 http://http.kali.org/kali kali-rolling InRelease
Get:2 http://http.kali.org/kali kali-rolling/main amd64 Packages [20.4 MB]
Get:3 http://http.kali.org/kali kali-rolling/main amd64 Contents (deb) [47.8 MB]
Fetched 68.2 MB in 9s (7,580 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
1432 packages can be upgraded. Run 'apt list --upgradable' to see them.`,
            outType: "info",
          },
          {
            comment: "onde o índice fica fisicamente",
            cmd: "ls /var/lib/apt/lists/ | head -5",
            out: `http.kali.org_kali_dists_kali-rolling_InRelease
http.kali.org_kali_dists_kali-rolling_main_binary-amd64_Packages.lz4
http.kali.org_kali_dists_kali-rolling_main_Contents-amd64.lz4
lock
partial`,
            outType: "default",
          },
          {
            comment: "tamanho do cache de .deb baixados",
            cmd: "du -sh /var/cache/apt/archives/",
            out: "1.7G    /var/cache/apt/archives/",
            outType: "warning",
          },
          {
            comment: "limpar .deb antigos para liberar espaço",
            cmd: "sudo apt clean",
            out: "(silencioso — esvazia /var/cache/apt/archives/)",
            outType: "muted",
          },
        ]}
      />

      <h2>sources.list — de onde vem o pacote</h2>
      <p>
        O Kali usa <strong>kali-rolling</strong>, uma rolling release baseada em Debian
        testing. O arquivo principal é <code>/etc/apt/sources.list</code>, mas
        repositórios extras vão em <code>/etc/apt/sources.list.d/*.list</code> (veja a
        página de PPA).
      </p>

      <CodeBlock
        language="bash"
        title="/etc/apt/sources.list (Kali padrão)"
        code={`# Repositório oficial Kali Rolling
deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware

# Source packages (descomente se for compilar do código fonte)
# deb-src http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware`}
      />

      <CommandTable
        title="Componentes (main, contrib, non-free, non-free-firmware)"
        variations={[
          { cmd: "main", desc: "Software 100% livre (DFSG). Núcleo da distro.", output: "nmap, bash, openssl..." },
          { cmd: "contrib", desc: "Livre, mas depende de algo non-free.", output: "Ex: drivers que precisam de blob fechado." },
          { cmd: "non-free", desc: "Software com licença restritiva.", output: "Ferramentas comerciais empacotadas, drivers." },
          { cmd: "non-free-firmware", desc: "Firmwares binários (Wi-Fi, Bluetooth).", output: "Sem isso, várias placas Wi-Fi não funcionam — fatal pra wireless pentest." },
        ]}
      />

      <h2>Simulação --dry-run (o melhor amigo do paranoico)</h2>
      <p>
        Antes de qualquer <code>apt upgrade</code> sério (especialmente em VM de produção
        ou Kali persistente de operação), <strong>simule</strong>. O APT mostra o que
        VAI fazer sem tocar no disco.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -s nmap",
            out: `Reading package lists... Done
Building dependency tree... Done
nmap is already the newest version (7.95+dfsg-3).
0 upgraded, 0 newly installed, 0 to remove and 1432 not upgraded.`,
            outType: "info",
          },
          {
            comment: "simulando upgrade completo",
            cmd: "sudo apt -s full-upgrade | tail -8",
            out: `Inst libc6 [2.40-3] (2.41-1 Debian:testing [amd64]) [...]
Conf libc6 (2.41-1 Debian:testing [amd64])
Inst linux-image-6.12-amd64 (6.12.5-1kali1 Kali:kali-rolling [amd64])
Conf linux-image-6.12-amd64 (6.12.5-1kali1 Kali:kali-rolling [amd64])
Inst metasploit-framework (6.4.42-0kali1 Kali:kali-rolling [amd64])
Conf metasploit-framework (6.4.42-0kali1 Kali:kali-rolling [amd64])
0 upgraded, 184 newly installed, 12 to remove and 0 not upgraded.`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="warning" title="apt upgrade vs full-upgrade vs dist-upgrade">
        <p>
          <code>apt upgrade</code> NUNCA remove pacotes. Se um upgrade exigir remoção
          (mudança de dependência), ele segura. Em rolling Kali isso{" "}
          <strong>quebra a base</strong> com o tempo (pacotes congelam).
        </p>
        <p>
          Use <code>sudo apt full-upgrade</code> (ou <code>dist-upgrade</code>, alias
          antigo) regularmente. Eles aceitam remover/instalar o que for necessário.
          <strong> No Kali, full-upgrade é a única forma correta de manter o sistema.</strong>
        </p>
      </AlertBox>

      <h2>Hold — congelar versão de um pacote</h2>
      <p>
        Cenário pentester: você usa uma versão específica do <code>metasploit-framework</code>{" "}
        que tem um módulo customizado, ou está com uma POC pra um CVE que só roda em
        determinada versão de uma lib. Você precisa impedir que o próximo upgrade troque
        isso.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt-mark hold metasploit-framework",
            out: "metasploit-framework set on hold.",
            outType: "success",
          },
          {
            cmd: "apt-mark showhold",
            out: "metasploit-framework",
            outType: "info",
          },
          {
            comment: "agora upgrades pulam esse pacote",
            cmd: "sudo apt -s full-upgrade | grep -i metasploit",
            out: `The following packages have been kept back:
  metasploit-framework`,
            outType: "warning",
          },
          {
            comment: "para liberar quando terminar o engagement",
            cmd: "sudo apt-mark unhold metasploit-framework",
            out: "Canceled hold on metasploit-framework.",
            outType: "muted",
          },
        ]}
      />

      <h2>Pinning — preferências finas</h2>
      <p>
        Para controle ainda mais granular (priorizar repo Debian para pacote X, mas
        manter Kali para o resto), edite <code>/etc/apt/preferences</code> ou crie
        arquivos em <code>/etc/apt/preferences.d/</code>.
      </p>

      <CodeBlock
        language="ini"
        title="/etc/apt/preferences.d/99-prefer-kali"
        code={`# Tudo do Kali tem prioridade alta
Package: *
Pin: release o=Kali
Pin-Priority: 990

# Pacotes específicos vindos do Debian backports (ex: GPU driver novo)
Package: nvidia-driver nvidia-driver-libs
Pin: release o=Debian,a=bookworm-backports
Pin-Priority: 700

# Tudo o resto do Debian é mais baixo (evita misturar acidentalmente)
Package: *
Pin: release o=Debian
Pin-Priority: 100`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "checar prioridade aplicada num pacote",
            cmd: "apt-cache policy nmap",
            out: `nmap:
  Installed: 7.95+dfsg-3
  Candidate: 7.95+dfsg-3
  Version table:
 *** 7.95+dfsg-3 990
        500 http://http.kali.org/kali kali-rolling/main amd64 Packages
        100 /var/lib/dpkg/status`,
            outType: "info",
          },
        ]}
      />

      <h2>autoremove e órfãos</h2>
      <p>
        Quando você instala <code>foo</code>, o APT também instala dependências marcadas
        como "automaticamente instaladas". Quando <code>foo</code> for removido, essas
        dependências viram órfãs.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt autoremove --purge",
            out: `Reading package lists... Done
The following packages will be REMOVED:
  libgtk-3-common* libwebrtc-audio-processing-1-3* python3-cairo*
0 upgraded, 0 newly installed, 8 to remove and 0 not upgraded.
After this operation, 84.3 MB disk space will be freed.
Do you want to continue? [Y/n]`,
            outType: "warning",
          },
          {
            comment: "--purge também apaga arquivos de config (~/.config sobrevive)",
            cmd: "sudo apt purge libssh-4",
            out: `The following packages will be REMOVED:
  libssh-4*
After this operation, 1,233 kB disk space will be freed.`,
            outType: "default",
          },
        ]}
      />

      <h2>Conserto de estado quebrado</h2>
      <p>
        Conexão caiu no meio de um <code>apt install</code>? Sistema reiniciou no meio
        de um upgrade? O dpkg fica em "estado inconsistente". A sequência de cura é
        sempre a mesma:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) terminar configurações pendentes",
            cmd: "sudo dpkg --configure -a",
            out: `Setting up libpython3.12-stdlib:amd64 (3.12.7-1) ...
Setting up python3.12 (3.12.7-1) ...
Setting up python3 (3.12.7-1) ...`,
            outType: "info",
          },
          {
            comment: "2) consertar dependências quebradas",
            cmd: "sudo apt install -f",
            out: `Reading package lists... Done
Building dependency tree... Done
Correcting dependencies... Done
0 upgraded, 0 newly installed, 0 to remove.`,
            outType: "success",
          },
          {
            comment: "3) atualizar normalmente",
            cmd: "sudo apt update && sudo apt full-upgrade",
            out: "(reseguir o caminho normal)",
            outType: "muted",
          },
        ]}
      />

      <h2>Debug verboso</h2>
      <CommandTable
        title="Quando 'não dá pra entender o erro'"
        variations={[
          { cmd: "apt -o Debug::pkgProblemResolver=true install foo", desc: "Mostra como o solver tenta resolver dependências.", output: "Útil quando 'unable to resolve dependencies'." },
          { cmd: "apt -o Debug::Acquire::http=true update", desc: "Imprime cada request HTTP que o APT faz.", output: "Diagnóstico de mirror lento/quebrado." },
          { cmd: "apt -o APT::Sandbox::User=root update", desc: "Roda update sem sandbox (debug de permissões).", output: "Não use em produção." },
          { cmd: "apt-cache depends nmap", desc: "Lista dependências diretas.", output: "Depends: libpcap0.8t64, libssl3t64, ..." },
          { cmd: "apt-cache rdepends openssl", desc: "Reverso: quem depende deste pacote.", output: "Antes de remover algo crítico, sempre confira." },
          { cmd: "dpkg -L nmap | head", desc: "Quais arquivos vieram do pacote nmap.", output: "/usr/bin/nmap, /usr/share/nmap/scripts/, ..." },
          { cmd: "dpkg -S /usr/bin/nmap", desc: "Reverso: qual pacote dono deste arquivo.", output: "nmap: /usr/bin/nmap" },
        ]}
      />

      <h2>Workflow recomendado em Kali persistente de operação</h2>
      <CodeBlock
        language="bash"
        title="manutencao_semanal.sh"
        code={`#!/usr/bin/env bash
set -euo pipefail

# Snapshot LVM/Timeshift ANTES (veja seção Storage)
echo "[*] Atualizando indice..."
sudo apt update

echo "[*] Simulando full-upgrade..."
sudo apt -s full-upgrade | tee /tmp/apt-sim.log

read -p "[?] Confirma o full-upgrade? [y/N] " ok
[[ "$ok" == "y" ]] || exit 0

sudo apt full-upgrade -y
sudo apt autoremove --purge -y
sudo apt clean

echo "[+] Pacotes hold ativos:"
apt-mark showhold

echo "[+] Manutencao concluida."`}
      />

      <PracticeBox
        title="Investigar e congelar uma versão"
        goal="Descobrir a versão atual do hashcat, listar versões disponíveis, segurar (hold), e validar que upgrades respeitam o hold."
        steps={[
          "Veja a versão instalada e candidata.",
          "Marque hold no hashcat.",
          "Simule um full-upgrade e confirme que hashcat aparece em 'kept back'.",
          "Libere o hold quando terminar.",
        ]}
        command={`apt-cache policy hashcat
sudo apt-mark hold hashcat
apt-mark showhold
sudo apt -s full-upgrade | grep -E "hashcat|kept back"
sudo apt-mark unhold hashcat`}
        expected={`hashcat:
  Installed: 6.2.6+ds1-1+b3
  Candidate: 6.2.6+ds1-1+b3
hashcat set on hold.
hashcat
The following packages have been kept back:
  hashcat
Canceled hold on hashcat.`}
        verify="Se hashcat apareceu em 'kept back' durante o hold e SAIU dessa lista após o unhold, o pinning está funcionando."
      />

      <AlertBox type="danger" title="NÃO faça apt upgrade num Kali rolling esquecido">
        <p>
          Kali ficar 6 meses sem atualizar e você rodar <code>apt full-upgrade</code> de
          uma vez = catástrofe garantida (centenas de pacotes, conflitos de toolkit GTK,
          quebra de drivers Wi-Fi). Atualize semanalmente OU use snapshot LVM/Timeshift
          antes.
        </p>
        <p>
          Em engagement crítico, NÃO atualize nada. Espere terminar. Versão estável
          {" > "}versão nova.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
