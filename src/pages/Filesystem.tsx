import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Filesystem() {
  return (
    <PageContainer
      title="Sistema de Arquivos"
      subtitle="Hierarquia padrão do Linux (FHS), navegação, manipulação de arquivos e diretórios."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>A árvore do Linux (FHS)</h2>
      <p>
        Tudo no Linux é arquivo. A raiz é <code>/</code> e abaixo dela existem diretórios padronizados.
        Conhecê-los é o primeiro passo para se mover com confiança.
      </p>

      <Terminal
        path="/"
        lines={[
          {
            cmd: "ls -lah /",
            out: `total 76K
drwxr-xr-x  19 root root  4.0K Mar 12 14:02 .
drwxr-xr-x  19 root root  4.0K Mar 12 14:02 ..
lrwxrwxrwx   1 root root     7 Jan 14 09:11 bin -> usr/bin
drwxr-xr-x   4 root root  4.0K Mar 12 14:02 boot
drwxr-xr-x  20 root root  4.4K Apr 02 16:11 dev
drwxr-xr-x 137 root root   12K Apr 03 08:03 etc
drwxr-xr-x   3 root root  4.0K Jan 14 09:13 home
lrwxrwxrwx   1 root root     7 Jan 14 09:11 lib -> usr/lib
drwx------   2 root root   16K Jan 14 09:11 lost+found
drwxr-xr-x   2 root root  4.0K Jan 14 09:11 media
drwxr-xr-x   2 root root  4.0K Jan 14 09:11 mnt
drwxr-xr-x   3 root root  4.0K Mar 12 13:55 opt
dr-xr-xr-x 312 root root     0 Apr 03 08:03 proc
drwx------  10 root root  4.0K Apr 02 22:48 root
drwxr-xr-x  44 root root  1.2K Apr 03 08:03 run
lrwxrwxrwx   1 root root     8 Jan 14 09:11 sbin -> usr/sbin
drwxr-xr-x   3 root root  4.0K Jan 14 09:11 srv
dr-xr-xr-x  13 root root     0 Apr 03 08:03 sys
drwxrwxrwt  21 root root  4.0K Apr 03 08:33 tmp
drwxr-xr-x  14 root root  4.0K Jan 14 09:13 usr
drwxr-xr-x  13 root root  4.0K Mar 12 14:02 var`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Diretórios essenciais (FHS)"
        variations={[
          { cmd: "/bin", desc: "Binários essenciais (ls, cat, cp). Hoje é symlink para /usr/bin.", output: "lrwxrwxrwx /bin -> usr/bin" },
          { cmd: "/sbin", desc: "Binários administrativos (fdisk, iptables). Symlink → /usr/sbin.", output: "lrwxrwxrwx /sbin -> usr/sbin" },
          { cmd: "/etc", desc: "Configurações do sistema (passwd, network, services).", output: "/etc/passwd /etc/shadow /etc/hosts /etc/ssh/" },
          { cmd: "/home", desc: "Pasta pessoal de cada usuário não-root.", output: "/home/wallyson/  /home/maria/" },
          { cmd: "/root", desc: "Home do superusuário root (NÃO fica em /home).", output: "drwx------ 10 root root /root" },
          { cmd: "/var", desc: "Dados variáveis: logs, cache, mail, web.", output: "/var/log/  /var/www/  /var/cache/" },
          { cmd: "/var/log", desc: "Logs do sistema (auth.log, syslog, apache2/).", output: "auth.log  syslog  kern.log" },
          { cmd: "/tmp", desc: "Temporários — apagados a cada boot.", output: "world-writable (drwxrwxrwt)" },
          { cmd: "/proc", desc: "Pseudo-FS dos processos (/proc/<pid>/, /proc/cpuinfo).", output: "Não está no disco; é gerado em memória." },
          { cmd: "/sys", desc: "Pseudo-FS do kernel (devices, módulos).", output: "Interface com o kernel em runtime." },
          { cmd: "/usr", desc: "Programas instalados (bin, lib, share, local).", output: "/usr/bin/nmap  /usr/share/wordlists/" },
          { cmd: "/opt", desc: "Software de terceiros (BurpSuite, ferramentas custom).", output: "/opt/burpsuite/  /opt/metasploit-framework/" },
          { cmd: "/dev", desc: "Arquivos de dispositivos (sda, tty, null, random).", output: "/dev/sda /dev/null /dev/random /dev/tty0" },
          { cmd: "/mnt /media", desc: "Pontos de montagem (pendrives, partições extras).", output: "/media/wallyson/USB/" },
        ]}
      />

      <h2>Navegação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "pwd",
            out: "/home/wallyson",
            outType: "info",
          },
          {
            cmd: "cd /etc/ssh && pwd",
            out: "/etc/ssh",
            outType: "default",
          },
          {
            comment: "voltar pro home com til (~) ou só 'cd' sem argumento",
            cmd: "cd ~ && pwd",
            out: "/home/wallyson",
            outType: "default",
          },
          {
            comment: "subir um nível",
            cmd: "cd .. && pwd",
            out: "/home",
            outType: "default",
          },
          {
            comment: "voltar para o último diretório",
            cmd: "cd - ",
            out: "/home/wallyson",
            outType: "muted",
          },
        ]}
      />

      <h2>Listar arquivos com detalhes</h2>
      <CommandTable
        title="Variações de ls"
        variations={[
          { cmd: "ls", desc: "Lista simples (sem ocultos).", output: "Documents  Downloads  Pictures  tools" },
          { cmd: "ls -a", desc: "Inclui arquivos ocultos (que começam com .).", output: ".bashrc  .config  .ssh  Documents" },
          { cmd: "ls -l", desc: "Formato longo: permissões, dono, tamanho, data.", output: "-rw-r--r-- 1 wallyson wallyson 220 Jan 14 09:11 .bashrc" },
          { cmd: "ls -lh", desc: "Tamanhos legíveis (K, M, G).", output: "-rw-r--r-- 1 wallyson wallyson 4.2K Mar 12 .zshrc" },
          { cmd: "ls -lt", desc: "Ordena por data (mais recente primeiro).", output: "Útil para achar o último arquivo modificado." },
          { cmd: "ls -lhS", desc: "Ordena por tamanho.", output: "Mostra arquivos grandes primeiro." },
          { cmd: "ls -laR /etc/ssh", desc: "Recursivo: entra em todos os subdiretórios.", output: "Lista a árvore inteira da pasta." },
          { cmd: "ls /etc/*.conf", desc: "Glob: todos os .conf direto em /etc.", output: "/etc/host.conf /etc/nsswitch.conf /etc/resolv.conf" },
        ]}
      />

      <h2>Criar, copiar, mover, apagar</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "mkdir -p projeto/{docs,src,tests}",
            out: "(silencioso = sucesso. -p cria pais, {} cria várias de uma vez)",
            outType: "muted",
          },
          {
            cmd: "tree projeto",
            out: `projeto
├── docs
├── src
└── tests

4 directories, 0 files`,
            outType: "info",
          },
          {
            cmd: "touch projeto/src/main.py projeto/docs/README.md",
            out: "(silencioso. cria arquivos vazios ou atualiza timestamp)",
            outType: "muted",
          },
          {
            cmd: "cp projeto/docs/README.md projeto/docs/INSTALL.md",
            out: "(silencioso. cp copia)",
            outType: "muted",
          },
          {
            comment: "copiar diretório inteiro precisa de -r",
            cmd: "cp -r projeto backup_projeto",
            out: "(silencioso. agora você tem dois)",
            outType: "muted",
          },
          {
            cmd: "mv projeto/src/main.py projeto/src/app.py",
            out: "(mv = mover OU renomear)",
            outType: "muted",
          },
          {
            cmd: "rm projeto/docs/INSTALL.md",
            out: "(apaga arquivo)",
            outType: "warning",
          },
          {
            comment: "apagar diretório precisa de -r (CUIDADO: -rf é irreversível)",
            cmd: "rm -rf backup_projeto",
            out: "(apagado sem confirmação. NÃO existe lixeira no terminal!)",
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="rm -rf não tem volta">
        O terminal Linux <strong>não tem lixeira</strong>. <code>rm -rf /</code> apaga
        todo o sistema. Sempre confira o caminho antes (use <code>ls</code> antes de <code>rm</code>) e
        prefira <code>rm -i</code> (interativo) quando estiver inseguro.
      </AlertBox>

      <h2>Ler e inspecionar arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat /etc/os-release",
            out: `PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2025.1"
VERSION="2025.1"
VERSION_CODENAME=kali-rolling
ID=kali
ID_LIKE=debian
HOME_URL="https://www.kali.org/"
SUPPORT_URL="https://forums.kali.org/"
BUG_REPORT_URL="https://bugs.kali.org/"
ANSI_COLOR="1;31"`,
            outType: "info",
          },
          {
            cmd: "head -3 /etc/passwd",
            out: `root:x:0:0:root:/root:/usr/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin`,
            outType: "default",
          },
          {
            cmd: "tail -2 /var/log/auth.log",
            out: `2026-04-03T08:33:14.121Z kali sshd[2103]: Accepted publickey for wallyson from 192.168.1.5
2026-04-03T08:33:14.245Z kali systemd-logind[718]: New session 4 of user wallyson.`,
            outType: "default",
          },
          {
            comment: "less é o melhor para arquivos grandes (q = sair, / = buscar)",
            cmd: "less /var/log/syslog",
            out: "(abre paginador interativo)",
            outType: "muted",
          },
        ]}
      />

      <h2>Buscar arquivos e conteúdo</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "find: por nome",
            cmd: 'find /etc -name "*.conf" -type f 2>/dev/null | head -5',
            out: `/etc/host.conf
/etc/nsswitch.conf
/etc/resolv.conf
/etc/sysctl.conf
/etc/ssh/ssh_config`,
            outType: "info",
          },
          {
            comment: "find: arquivos modificados nas últimas 24h",
            cmd: "find /var/log -mtime -1 -type f",
            out: `/var/log/auth.log
/var/log/syslog
/var/log/kern.log
/var/log/apache2/access.log`,
            outType: "default",
          },
          {
            comment: "grep: buscar texto dentro de arquivos",
            cmd: 'grep -r "PermitRootLogin" /etc/ssh/',
            out: `/etc/ssh/sshd_config:#PermitRootLogin prohibit-password
/etc/ssh/sshd_config:PermitRootLogin no`,
            outType: "success",
          },
          {
            cmd: "locate sqlmap | head -3",
            out: `/usr/bin/sqlmap
/usr/share/sqlmap
/usr/share/doc/sqlmap`,
            outType: "default",
          },
          {
            comment: "locate usa um banco — atualize antes",
            cmd: "sudo updatedb",
            out: "(silencioso, ~5s)",
            outType: "muted",
          },
        ]}
      />

      <h2>Espaço em disco</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "df -h",
            out: `Filesystem      Size  Used Avail Use% Mounted on
udev            3.8G     0  3.8G   0% /dev
tmpfs           781M  1.8M  779M   1% /run
/dev/sda1        78G   34G   41G  46% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda2       488M  192M  271M  42% /boot
tmpfs           781M   72K  781M   1% /run/user/1000`,
            outType: "info",
          },
          {
            comment: "du: tamanho de uma pasta",
            cmd: "du -sh /usr/share/wordlists/",
            out: "1.2G\t/usr/share/wordlists/",
            outType: "warning",
          },
          {
            cmd: "du -sh /var/log/* | sort -h | tail -5",
            out: `12K\t/var/log/dpkg.log
4.2M\t/var/log/journal
8.1M\t/var/log/syslog
14M\t/var/log/auth.log
26M\t/var/log/apache2`,
            outType: "default",
          },
        ]}
      />

      <PracticeBox
        title="Mapeie sua pasta de trabalho"
        goal="Criar um diretório padrão para projetos de pentest e popular com subpastas úteis."
        steps={[
          "Crie ~/pentest com subpastas para cada cliente/projeto.",
          "Dentro de cada projeto: scans/, loot/, reports/, screenshots/.",
          "Use tree para visualizar.",
        ]}
        command={`mkdir -p ~/pentest/{lab-htb,lab-thm,cliente-acme}/{scans,loot,reports,screenshots}
tree ~/pentest -L 2`}
        expected={`/home/wallyson/pentest
├── cliente-acme
│   ├── loot
│   ├── reports
│   ├── scans
│   └── screenshots
├── lab-htb
│   ├── loot
│   ├── reports
│   ├── scans
│   └── screenshots
└── lab-thm
    ├── loot
    ├── reports
    ├── scans
    └── screenshots

15 directories, 0 files`}
        verify="A árvore acima deve aparecer. Se 'tree' não estiver instalado: sudo apt install -y tree."
      />

      <AlertBox type="info" title="Tudo é arquivo (literalmente)">
        No Linux, dispositivos (<code>/dev/sda</code>), processos (<code>/proc/1234</code>),
        configurações do kernel (<code>/sys/class/net/</code>) e até pipes
        são representados como arquivos. Isso permite usar as mesmas ferramentas
        (cat, grep, find, less) para inspecionar qualquer coisa.
      </AlertBox>
    </PageContainer>
  );
}
