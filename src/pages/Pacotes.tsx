import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Pacotes() {
  return (
    <PageContainer
      title="Gerência de Pacotes"
      subtitle="APT, dpkg, pip, meta-pacotes Kali — instalar, remover e manter ferramentas atualizadas."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <h2>APT — o gerenciador principal</h2>
      <p>
        O <strong>APT (Advanced Package Tool)</strong> é o gerenciador de pacotes do Kali (baseado em Debian). 
        Ele lida com download, dependências, atualização e remoção de software.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) sempre comece atualizando a lista de pacotes (não instala nada)",
            cmd: "sudo apt update",
            out: `Hit:1 http://kali.download/kali kali-rolling InRelease
Get:2 http://kali.download/kali kali-rolling/main amd64 Packages [19.6 MB]
Get:3 http://kali.download/kali kali-rolling/main amd64 Contents (deb) [44.1 MB]
Fetched 63.7 MB in 8s (7,961 kB/s)
Reading package lists... Done
Building dependency tree... Done
All packages are up to date.`,
            outType: "info",
          },
          {
            comment: "2) atualiza pacotes sem remover nada",
            cmd: "sudo apt upgrade -y",
            out: `Reading package lists... Done
Building dependency tree... Done
The following packages will be upgraded:
  burpsuite hashcat metasploit-framework nmap python3-impacket
5 upgraded, 0 newly installed, 0 to remove.
Need to get 184 MB of archives.
After this operation, 12.4 MB of additional disk space will be used.
[...] 
Setting up nmap (7.95+dfsg1-1) ...
Processing triggers for man-db (2.13.0-1) ...`,
            outType: "success",
          },
          {
            comment: "3) full-upgrade: pode remover obsoletos (recomendado no Kali rolling)",
            cmd: "sudo apt full-upgrade -y",
            out: `The following NEW packages will be installed:
  libssl3t64 python3-pycparser
The following packages will be REMOVED:
  libssl1.1
0 upgraded, 2 newly installed, 1 to remove.`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Operações básicas com APT"
        variations={[
          { cmd: "sudo apt install nmap", desc: "Instala um pacote individual.", output: "Setting up nmap (7.95+dfsg1-1) ...\nDone." },
          { cmd: "sudo apt install -y nmap wireshark hydra", desc: "Instala vários pacotes sem perguntar (-y).", output: "3 newly installed, 0 to remove." },
          { cmd: "sudo apt remove nmap", desc: "Remove o binário, mantém configs.", output: "Removing nmap (7.95+dfsg1-1) ..." },
          { cmd: "sudo apt purge nmap", desc: "Remove pacote + arquivos de configuração.", output: "Purging configuration files for nmap ..." },
          { cmd: "sudo apt autoremove", desc: "Remove dependências órfãs.", output: "0 upgraded, 0 newly installed, 4 to remove." },
          { cmd: "sudo apt clean", desc: "Esvazia o cache local em /var/cache/apt/archives/.", output: "(silencioso = sucesso, libera ~500MB)" },
        ]}
      />

      <h2>Buscar e inspecionar pacotes</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "apt search 'sql injection'",
            out: `Sorting... Done
Full Text Search... Done
sqlmap/kali-rolling 1.8.10-1 all
  automatic SQL injection and database takeover tool

jsql-injection/kali-rolling 0.92-0kali2 all
  Java tool for automatic SQL database injection

nosqlmap/kali-rolling 0.7-0kali3 all
  Automated NoSQL database enumeration and web app exploitation tool`,
            outType: "info",
          },
          {
            cmd: "apt show nmap",
            out: `Package: nmap
Version: 7.95+dfsg1-1
Priority: optional
Section: net
Maintainer: Kali Developers <devel@kali.org>
Installed-Size: 26.4 MB
Depends: libc6, libgcc-s1, liblua5.4-0, libpcap0.8, libpcre2-8-0, libssh2-1, libssl3
Homepage: https://nmap.org/
Description: The Network Mapper
 Nmap is a utility for network exploration or security auditing. [...]`,
            outType: "default",
          },
          {
            comment: "verifica se um pacote já está instalado",
            cmd: "dpkg -l | grep -i metasploit",
            out: `ii  metasploit-framework  6.4.42-0kali1  amd64  Penetration testing framework`,
            outType: "success",
          },
        ]}
      />

      <h2>Meta-pacotes do Kali</h2>
      <p>
        Kali agrupa centenas de ferramentas em <strong>meta-pacotes</strong> temáticos. Instale só o que for usar.
      </p>

      <CommandTable
        title="Principais meta-pacotes"
        variations={[
          { cmd: "kali-linux-default", desc: "~600 MB — set padrão (vem na ISO).", output: "+ ~150 ferramentas: nmap, metasploit, burpsuite, wireshark, hydra, john, sqlmap, etc." },
          { cmd: "kali-linux-large", desc: "~3 GB — adiciona muitas ferramentas extras.", output: "+ ~300 ferramentas adicionais (RE, mobile, AD, OSINT)." },
          { cmd: "kali-linux-everything", desc: "~15 GB — TUDO que existe no Kali.", output: "Praticamente todo o repositório kali-tools-*." },
          { cmd: "kali-tools-web", desc: "Pentest web (burp, zap, sqlmap, nikto, gobuster, ffuf, wpscan).", output: "~15 ferramentas focadas em web." },
          { cmd: "kali-tools-wireless", desc: "Wireless (aircrack-ng, reaver, kismet, wifite).", output: "~12 ferramentas wifi/bluetooth." },
          { cmd: "kali-tools-passwords", desc: "Cracking (hydra, john, hashcat, medusa, cewl, crunch).", output: "~10 ferramentas de quebra de senha." },
          { cmd: "kali-tools-forensics", desc: "Forense (autopsy, volatility, sleuthkit, foremost).", output: "~14 ferramentas de análise forense." },
          { cmd: "kali-tools-exploitation", desc: "Exploração (metasploit, beef, set, msfvenom).", output: "Frameworks de exploração e pós-exploração." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar um meta-pacote inteiro",
            cmd: "sudo apt install -y kali-tools-web",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  burpsuite cadaver cewl commix dirb dirbuster ffuf gobuster httprint
  jsql-injection nikto skipfish sqlmap webscarab webshells whatweb
  wpscan zaproxy
0 upgraded, 17 newly installed, 0 to remove.
Need to get 412 MB of archives.
After this operation, 1,847 MB of additional disk space will be used.`,
            outType: "success",
          },
        ]}
      />

      <h2>pip — pacotes Python</h2>
      <p>
        Muitas ferramentas modernas (Impacket, pwntools, Scapy) são distribuídas via <code>pip</code>. 
        Desde o Debian 12, é obrigatório usar <code>--break-system-packages</code> ou um <strong>venv</strong>.
      </p>

      <Terminal
        path="~/projetos/lab"
        lines={[
          {
            comment: "ambiente virtual isolado (recomendado)",
            cmd: "python3 -m venv venv && source venv/bin/activate",
            out: "(seu prompt agora vai mostrar (venv) na frente)",
            outType: "muted",
          },
          {
            user: "wallyson",
            host: "kali",
            path: "~/projetos/lab",
            cmd: "pip install impacket pwntools scapy",
            out: `Collecting impacket
  Downloading impacket-0.12.0.tar.gz (1.4 MB)
Collecting pwntools
  Downloading pwntools-4.13.1.tar.gz (1.2 MB)
Collecting scapy
  Downloading scapy-2.6.1.tar.gz (1.3 MB)
[...]
Successfully installed impacket-0.12.0 pwntools-4.13.1 scapy-2.6.1`,
            outType: "success",
          },
          {
            cmd: "pip list | head -8",
            out: `Package           Version
----------------- -------
cryptography      43.0.3
impacket          0.12.0
pwntools          4.13.1
pycparser         2.22
pyserial          3.5
scapy             2.6.1`,
            outType: "default",
          },
          {
            cmd: "deactivate",
            out: "(volta para o prompt normal — o venv fica salvo na pasta venv/)",
            outType: "muted",
          },
        ]}
      />

      <h2>Instalação manual (Git + Make)</h2>
      <p>Muitas ferramentas de segurança ficam fora do APT. Você clona, compila e roda direto.</p>

      <Terminal
        path="~/tools"
        lines={[
          {
            cmd: "git clone https://github.com/carlospolop/PEASS-ng.git",
            out: `Cloning into 'PEASS-ng'...
remote: Enumerating objects: 7842, done.
remote: Counting objects: 100% (1247/1247), done.
remote: Total 7842 (delta 1056), reused 1054 (delta 1054), pack-reused 6595
Receiving objects: 100% (7842/7842), 26.18 MiB | 8.20 MiB/s, done.
Resolving deltas: 100% (5103/5103), done.`,
            outType: "info",
          },
          {
            cmd: "ls PEASS-ng/linPEAS/",
            out: `builder  linpeas.sh  linpeas_fat.sh  README.md  sh_tools  src`,
            outType: "default",
          },
          {
            cmd: "chmod +x PEASS-ng/linPEAS/linpeas.sh",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
        ]}
      />

      <h3>Compilando do fonte (C/C++)</h3>
      <CodeBlock
        language="bash"
        title="build.sh — receita típica autotools/make"
        code={`# 1) dependências de compilação
sudo apt install -y build-essential autoconf libtool pkg-config

# 2) configurar
./configure --prefix=/usr/local

# 3) compilar
make -j$(nproc)

# 4) instalar (precisa de root)
sudo make install

# 5) (opcional) registrar no ldconfig
sudo ldconfig`}
      />

      <h2>Repositórios e mirrors</h2>
      <CodeBlock
        language="bash"
        title="/etc/apt/sources.list"
        code={`# Kali Rolling — repositório oficial
deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware

# Repositório de fontes (para apt source)
# deb-src http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver os repositórios atuais",
            cmd: "cat /etc/apt/sources.list",
            out: `# See https://www.kali.org/docs/general-use/kali-linux-sources-list-repositories/
deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware`,
            outType: "default",
          },
          {
            comment: "trocar para um mirror brasileiro (mais rápido)",
            cmd: "sudo sed -i 's|http.kali.org|kali.download|g' /etc/apt/sources.list && sudo apt update",
            out: `Get:1 http://kali.download/kali kali-rolling InRelease [41.5 kB]
[...]
Reading package lists... Done`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Setup completo de um Kali recém-instalado"
        goal="Atualizar tudo e instalar o conjunto padrão de ferramentas + extras úteis."
        steps={[
          "Atualize a lista de pacotes (apt update).",
          "Faça full-upgrade para deixar tudo na última versão.",
          "Instale o meta-pacote default + ferramentas web + wordlists.",
          "Limpe caches para liberar espaço.",
        ]}
        command={`sudo apt update && sudo apt full-upgrade -y \\
  && sudo apt install -y kali-linux-default kali-tools-web seclists git tmux zsh \\
  && sudo apt autoremove -y && sudo apt clean`}
        expected={`Setting up seclists (2024.4-0kali1) ...
Setting up tmux (3.5a-3) ...
Processing triggers for man-db (2.13.0-1) ...
Done.`}
        verify="Rode `which nmap sqlmap burpsuite hydra john hashcat` — todos devem responder com /usr/bin/."
      />

      <AlertBox type="info" title="Kali é Rolling Release">
        Não existe "Kali 2025.1 estável final" — o sistema está sempre atualizando.
        Rode <code>sudo apt update && sudo apt full-upgrade -y</code> pelo menos uma vez por semana
        para receber correções de segurança e novas versões de ferramentas.
      </AlertBox>

      <AlertBox type="warning" title="Não use pip install sudo">
        <code>sudo pip install</code> mistura pacotes Python do APT com pacotes do pip e
        quebra o sistema. Sempre use <strong>venv</strong> ou <code>pipx</code> para ferramentas globais.
      </AlertBox>
    </PageContainer>
  );
}
