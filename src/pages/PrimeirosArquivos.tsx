import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PrimeirosArquivos() {
  return (
    <PageContainer
      title="Primeiros Arquivos — FHS, navegação e permissões"
      subtitle="Estrutura do sistema (FHS), comandos de navegação e leitura, permissões ugo+rwx, SUID/SGID/sticky e links — tudo que você precisa antes de pôr a mão em ferramentas ofensivas."
      difficulty="iniciante"
      timeToRead="18 min"
    >
      <AlertBox type="info" title="Por que esta página vem ANTES de Nmap, Hydra & cia">
        Pentest é 70% navegar em filesystem, ler logs e mexer em arquivos de
        configuração. Se você não entende <code>/etc/passwd</code>,{" "}
        <code>/var/log/auth.log</code> ou o que <code>chmod 4755</code> faz,
        nenhuma ferramenta vai te salvar. Esta página é o alicerce.
      </AlertBox>

      <h2>1. Filesystem Hierarchy Standard (FHS)</h2>
      <p>
        Todo Linux segue o <strong>FHS</strong> — uma convenção que diz onde
        cada coisa deve ficar. Memorize estas 11 pastas e você lê o sistema
        como um mapa:
      </p>

      <OutputBlock label="árvore raiz do Kali (saída de: ls -l /)" type="info">
{`drwxr-xr-x   2 root root  4096 Apr  4 09:12 bin     → executáveis essenciais (ls, cat, bash) — symlink p/ /usr/bin no Kali moderno
drwxr-xr-x   4 root root  4096 Apr  4 09:12 boot    → kernel (vmlinuz), initrd, GRUB
drwxr-xr-x  20 root root  4500 Apr  4 14:21 dev     → arquivos-dispositivo (/dev/sda, /dev/null, /dev/random)
drwxr-xr-x 134 root root 12288 Apr  4 14:18 etc     → configuração SYSTEM-WIDE (passwd, hosts, ssh, apache2)
drwxr-xr-x   3 root root  4096 Apr  4 09:14 home    → /home/wallyson, /home/ana — pastas pessoais
drwxr-xr-x  19 root root  4096 Apr  4 09:12 lib     → bibliotecas .so usadas por /bin e /sbin
drwx------   2 root root 16384 Apr  4 09:11 lost+found
drwxr-xr-x   3 root root  4096 Apr  4 09:12 media   → mounts removíveis (USB, CD-ROM)
drwxr-xr-x   2 root root  4096 Apr  4 09:12 mnt     → mounts manuais temporários
drwxr-xr-x   8 root root  4096 Apr  4 09:13 opt     → softwares "extras" (BurpSuite, IDA, etc.)
dr-xr-xr-x 412 root root     0 Apr  4 14:21 proc    → VIRTUAL — info do kernel/processos
drwx------  12 root root  4096 Apr  4 12:48 root    → home do usuário root
drwxr-xr-x  35 root root   980 Apr  4 14:21 run     → estado runtime (PIDs, sockets)
drwxr-xr-x   2 root root 12288 Apr  4 09:12 sbin    → executáveis do superuser (fdisk, iptables) — symlink p/ /usr/sbin
drwxr-xr-x   2 root root  4096 Apr  4 09:12 srv     → dados servidos (raro no Kali)
dr-xr-xr-x  13 root root     0 Apr  4 14:21 sys     → VIRTUAL — interface ao kernel/hardware
drwxrwxrwt  18 root root  4096 Apr  4 14:18 tmp     → temporário (limpa no boot) — sticky bit "t"
drwxr-xr-x  14 root root  4096 Apr  4 09:13 usr     → programas user-installed (/usr/bin, /usr/share)
drwxr-xr-x  14 root root  4096 Apr  4 09:14 var     → dados que MUDAM (logs, mail, www, db)`}
      </OutputBlock>

      <CommandTable
        title="As pastas que você VAI usar todo dia em pentest"
        variations={[
          {
            cmd: "/etc",
            desc: "Configurações globais — sempre o primeiro lugar para olhar credenciais expostas.",
            output: "/etc/passwd, /etc/shadow, /etc/sudoers, /etc/ssh/sshd_config, /etc/apache2/",
          },
          {
            cmd: "/home/<user>",
            desc: "Home dos usuários — chaves SSH, .bash_history, dotfiles.",
            output: "~/.ssh/id_rsa, ~/.bash_history, ~/.config/, ~/.aws/credentials",
          },
          {
            cmd: "/var/log",
            desc: "Logs — auth.log mostra quem logou, syslog mostra erros do kernel.",
            output: "auth.log, syslog, apache2/access.log, nginx/error.log",
          },
          {
            cmd: "/var/www",
            desc: "Raiz do servidor web (Apache/nginx default).",
            output: "/var/www/html/index.php — alvo clássico de RCE.",
          },
          {
            cmd: "/tmp",
            desc: "Temporário — escrita por todos. Atacantes deixam payloads aqui.",
            output: "drwxrwxrwt 1777 — note o 't' (sticky bit).",
          },
          {
            cmd: "/proc/<pid>",
            desc: "Processo vivo: cmdline, environ, fd, status — útil para LPE.",
            output: "/proc/self/environ vaza ENV vars (LFI clássico).",
          },
          {
            cmd: "/opt",
            desc: "Softwares 'soltos' — onde Burp, ZAP, IDA são tradicionalmente instalados.",
            output: "/opt/BurpSuitePro/, /opt/idafree-9.0/",
          },
          {
            cmd: "/usr/share",
            desc: "Wordlists, scripts NSE, exploits — todo o arsenal do Kali mora aqui.",
            output: "/usr/share/wordlists/rockyou.txt, /usr/share/nmap/scripts/",
          },
        ]}
      />

      <h2>2. Onde estou? Para onde vou? — pwd, cd, ls</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "pwd — print working directory (onde você está)",
            cmd: "pwd",
            out: "/home/wallyson",
            outType: "info",
          },
          {
            comment: "cd sem argumento volta para a HOME",
            cmd: "cd /var/log && pwd",
            out: "/var/log",
            outType: "info",
          },
          {
            cmd: "cd && pwd",
            out: "/home/wallyson",
            outType: "info",
          },
          {
            comment: "cd - volta para o diretório ANTERIOR",
            cmd: "cd /etc && cd - ",
            out: "/home/wallyson",
            outType: "muted",
          },
          {
            comment: ".. = pai, . = atual, ~ = home, ~ana = home da Ana",
            cmd: "cd .. && pwd && cd ~ana 2>&1",
            out: `/home
bash: cd: /home/ana: Permission denied`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="ls — flags que você VAI digitar mil vezes"
        variations={[
          { cmd: "ls", desc: "Listagem simples, só nomes.", output: "Documentos  Downloads  lab  scripts" },
          {
            cmd: "ls -l",
            desc: "Long format — permissões, dono, tamanho, data.",
            output: "-rw-r--r-- 1 wallyson wallyson  142 Apr  4 14:18 nota.txt",
          },
          {
            cmd: "ls -la",
            desc: "Inclui ocultos (dotfiles).",
            output: "drwx------ 2 wallyson wallyson 4096 Apr  4 09:14 .ssh",
          },
          {
            cmd: "ls -lh",
            desc: "Tamanhos human-readable (K/M/G).",
            output: "-rw-r--r-- 1 wallyson wallyson 1.4M Apr  4 14:18 dump.bin",
          },
          {
            cmd: "ls -lt",
            desc: "Ordena por data de modificação (mais recente primeiro).",
            output: "Útil para ver o que foi mexido por último.",
          },
          {
            cmd: "ls -lS",
            desc: "Ordena por tamanho (maior primeiro).",
            output: "Achar o arquivo gigante que está enchendo o disco.",
          },
          {
            cmd: "ls -R /etc/ssh",
            desc: "Recursivo — lista subpastas inteiras.",
            output: "Cuidado em árvores grandes (/var/lib).",
          },
          {
            cmd: "ls -li",
            desc: "Mostra inode (número do arquivo no FS).",
            output: "12648430 -rw-r--r-- 1 wallyson wallyson 142 nota.txt",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls -lah ~",
            out: `total 84K
drwx------ 18 wallyson wallyson 4.0K Apr  4 14:18 .
drwxr-xr-x  3 root     root     4.0K Apr  4 09:14 ..
-rw-------  1 wallyson wallyson  214 Apr  4 12:48 .bash_history
-rw-r--r--  1 wallyson wallyson  220 Apr  4 09:14 .bash_logout
-rw-r--r--  1 wallyson wallyson 5.5K Apr  4 09:14 .bashrc
drwx------  3 wallyson wallyson 4.0K Apr  4 12:11 .config
drwx------  2 wallyson wallyson 4.0K Apr  4 14:18 .ssh
drwxr-xr-x  2 wallyson wallyson 4.0K Apr  4 09:14 Documentos
drwxr-xr-x  2 wallyson wallyson 4.0K Apr  4 09:14 Downloads
drwxr-xr-x  4 wallyson wallyson 4.0K Apr  4 13:42 lab
-rw-r--r--  1 wallyson wallyson  142 Apr  4 14:18 nota.txt`,
            outType: "info",
          },
        ]}
      />

      <h2>3. Lendo conteúdo — cat, less, head, tail</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "cat — joga TUDO na tela (ruim para arquivo grande)",
            cmd: "cat /etc/hostname",
            out: "kali",
            outType: "default",
          },
          {
            cmd: "cat -n nota.txt",
            out: `     1  Aprendendo Kali Linux
     2  Hoje vou estudar comandos básicos
     3  Praticar é tudo`,
            outType: "default",
          },
          {
            comment: "concatenar de verdade (origem do nome)",
            cmd: "cat parte1.txt parte2.txt > completo.txt",
            outType: "muted",
          },
          {
            comment: "head — primeiras N linhas (default 10)",
            cmd: "head -n 5 /etc/passwd",
            out: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync`,
            outType: "info",
          },
          {
            comment: "tail — últimas N (ótimo p/ logs)",
            cmd: "sudo tail -n 3 /var/log/auth.log",
            out: `Apr  4 14:18:42 kali sshd[4421]: Accepted publickey for wallyson from 192.168.0.42 port 51288 ssh2
Apr  4 14:18:42 kali sshd[4421]: pam_unix(sshd:session): session opened for user wallyson(uid=1000)
Apr  4 14:19:01 kali CRON[4498]: pam_unix(cron:session): session opened for user root(uid=0)`,
            outType: "warning",
          },
          {
            comment: "tail -f acompanha em TEMPO REAL (Ctrl+C sai)",
            cmd: "sudo tail -f /var/log/auth.log",
            out: `... (linhas vão aparecendo conforme o sistema escreve)
Apr  4 14:19:14 kali sudo: wallyson : TTY=pts/0 ; PWD=/home/wallyson ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
^C`,
            outType: "warning",
          },
        ]}
      />

      <p>
        Quando o arquivo tem centenas de linhas, <code>cat</code> derrama tudo
        e você perde o início. Use <code>less</code>:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "less /etc/services",
            out: `# Network services, Internet style
#
tcpmux          1/tcp                           # TCP port service multiplexer
echo            7/tcp
echo            7/udp
discard         9/tcp           sink null
discard         9/udp           sink null
[...]
:`,
            outType: "default",
          },
        ]}
      />

      <CommandTable
        title="Atalhos dentro do less"
        variations={[
          { cmd: "↑ ↓", desc: "Linha por linha." },
          { cmd: "Espaço / b", desc: "Página para frente / para trás." },
          { cmd: "g / G", desc: "Pular para o INÍCIO / FIM do arquivo." },
          { cmd: "/padrao", desc: "Buscar 'padrao' (regex). 'n' = próxima ocorrência, 'N' = anterior." },
          { cmd: "&padrao", desc: "FILTRA — mostra só linhas que casam." },
          { cmd: "F", desc: "Equivalente a tail -f dentro do less." },
          { cmd: "v", desc: "Abre o arquivo no $EDITOR (vim por padrão)." },
          { cmd: "q", desc: "Sai." },
        ]}
      />

      <h2>4. Procurando arquivos — find, locate, which, whereis</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "find — busca em tempo real, MUITO poderoso",
            cmd: "find /etc -name '*.conf' -type f | head -5",
            out: `/etc/adduser.conf
/etc/ca-certificates.conf
/etc/debconf.conf
/etc/deluser.conf
/etc/fuse.conf`,
            outType: "info",
          },
          {
            comment: "por dono — todos arquivos do user 'ana'",
            cmd: "sudo find / -user ana 2>/dev/null",
            out: `/home/ana
/home/ana/.bashrc
/home/ana/relatorio.docx
/tmp/ana-temp.log`,
            outType: "warning",
          },
          {
            comment: "por permissão — clássico para achar SUID (PrivEsc!)",
            cmd: "find / -perm -4000 -type f 2>/dev/null | head",
            out: `/usr/bin/sudo
/usr/bin/su
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/mount
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/lib/openssh/ssh-keysign`,
            outType: "warning",
          },
          {
            comment: "por tamanho > 100MB",
            cmd: "find /var -size +100M -type f 2>/dev/null",
            out: `/var/lib/mysql/ibdata1
/var/log/journal/0a1b2c/system.journal`,
            outType: "info",
          },
          {
            comment: "modificado nas últimas 24h",
            cmd: "find /etc -mtime -1 -type f",
            out: `/etc/resolv.conf
/etc/cups/printers.conf
/etc/passwd-`,
            outType: "info",
          },
          {
            comment: "executar comando para CADA hit (-exec ... \\;)",
            cmd: "find . -name '*.tmp' -exec rm -i {} \\;",
            outType: "muted",
          },
          {
            comment: "locate — instantâneo (usa banco indexado)",
            cmd: "sudo updatedb && locate rockyou.txt",
            out: `/usr/share/wordlists/rockyou.txt.gz`,
            outType: "success",
          },
          {
            comment: "which — mostra QUAL binário será executado",
            cmd: "which python3 nmap bash",
            out: `/usr/bin/python3
/usr/bin/nmap
/usr/bin/bash`,
            outType: "info",
          },
          {
            comment: "whereis — bin + man + source",
            cmd: "whereis nmap",
            out: `nmap: /usr/bin/nmap /usr/share/nmap /usr/share/man/man1/nmap.1.gz`,
            outType: "info",
          },
          {
            comment: "type — diz se é builtin, alias ou binário (mais correto que which)",
            cmd: "type cd ls ll",
            out: `cd is a shell builtin
ls is aliased to 'ls --color=auto'
ll is aliased to 'ls -alF'`,
            outType: "default",
          },
        ]}
      />

      <h2>5. Identificando arquivos — file, stat</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "file — adivinha o tipo pelo CONTEÚDO (magic bytes), não pela extensão",
            cmd: "file /bin/ls /etc/passwd nota.txt /tmp/captura.pcap imagem.jpg",
            out: `/bin/ls:        ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked
/etc/passwd:    ASCII text
nota.txt:       UTF-8 Unicode text
/tmp/captura.pcap: pcapng capture file - version 1.0
imagem.jpg:     JPEG image data, JFIF standard 1.01, resolution (DPI), density 96x96`,
            outType: "info",
          },
          {
            comment: "shell script renomeado para .txt? file pega",
            cmd: "file backup.txt",
            out: "backup.txt: Bourne-Again shell script, ASCII text executable",
            outType: "warning",
          },
          {
            comment: "stat — TUDO sobre um arquivo (timestamps, inode, blocos)",
            cmd: "stat nota.txt",
            out: `  File: nota.txt
  Size: 142             Blocks: 8          IO Block: 4096   regular file
Device: 802h/2050d      Inode: 12648430    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/wallyson)   Gid: ( 1000/wallyson)
Access: 2026-04-04 14:18:01.234567890 -0300
Modify: 2026-04-04 14:18:01.234567890 -0300
Change: 2026-04-04 14:18:01.234567890 -0300
 Birth: 2026-04-04 14:17:55.123456789 -0300`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="info" title="Os 3 timestamps que confundem todo iniciante">
        <strong>Access (atime)</strong> — última vez que o conteúdo foi LIDO.{" "}
        <strong>Modify (mtime)</strong> — última vez que o CONTEÚDO foi
        alterado. <strong>Change (ctime)</strong> — última vez que o
        <em> inode</em> mudou (renome, chmod, chown). Anti-forense usa{" "}
        <code>touch -d</code> para mascarar mtime/atime, mas ctime é mais
        difícil de forjar.
      </AlertBox>

      <h2>6. Espaço em disco — du, df</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "df — disco LIVRE por filesystem montado",
            cmd: "df -h",
            out: `Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           791M  1.6M  789M   1% /run
/dev/sda1        78G   42G   33G  57% /
tmpfs           3.9G   84M  3.8G   3% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda2       488M  124M  339M  27% /boot
tmpfs           791M  120K  791M   1% /run/user/1000`,
            outType: "info",
          },
          {
            comment: "du — tamanho de uma PASTA específica",
            cmd: "du -sh ~/Downloads ~/lab /var/log",
            out: `1.2G    /home/wallyson/Downloads
124M    /home/wallyson/lab
sudo: 842M /var/log`,
            outType: "info",
          },
          {
            comment: "ranking — quem está enchendo a /home?",
            cmd: "du -sh /home/* 2>/dev/null | sort -h",
            out: `42M     /home/joao.lopes
214M    /home/ana.silva
1.4G    /home/wallyson`,
            outType: "warning",
          },
          {
            comment: "ncdu — interface interativa (sudo apt install ncdu)",
            cmd: "ncdu /var",
            out: `--- /var --------------------------------------------------------
  481.2 MiB [##########] /lib
  214.8 MiB [####      ] /log
   92.3 MiB [#         ] /cache
   18.4 MiB [          ] /backups
    4.2 MiB [          ] /spool
[use ↑↓ p/ navegar, d p/ deletar, q p/ sair]`,
            outType: "default",
          },
        ]}
      />

      <h2>7. Quem está usando o quê — lsof, mount</h2>

      <Terminal
        path="~"
        lines={[
          {
            comment: "lsof = LiSt Open Files — TUDO no Linux é arquivo, inclusive sockets",
            cmd: "sudo lsof -i :22",
            out: `COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
sshd     842 root    3u  IPv4  18421      0t0  TCP *:ssh (LISTEN)
sshd     842 root    4u  IPv6  18423      0t0  TCP *:ssh (LISTEN)
sshd    4421 root    4u  IPv4  44218      0t0  TCP kali:ssh->192.168.0.42:51288 (ESTABLISHED)`,
            outType: "info",
          },
          {
            comment: "que processo está com /var/log/syslog aberto?",
            cmd: "sudo lsof /var/log/syslog",
            out: `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME
rsyslogd  421 root    7w   REG    8,1   142840 1024218 /var/log/syslog`,
            outType: "info",
          },
          {
            comment: "mount sem argumento mostra TUDO montado",
            cmd: "mount | grep -E 'sda|tmpfs' | head -4",
            out: `/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)
/dev/sda2 on /boot type ext4 (rw,relatime)
tmpfs on /run type tmpfs (rw,nosuid,nodev,size=809848k,mode=755)
tmpfs on /tmp type tmpfs (rw,nosuid,nodev)`,
            outType: "default",
          },
          {
            comment: "montar um pendrive USB",
            cmd: "sudo mount /dev/sdb1 /mnt && ls /mnt",
            out: `relatorio.pdf  fotos/  setup.exe`,
            outType: "info",
          },
          {
            cmd: "sudo umount /mnt",
            outType: "muted",
          },
        ]}
      />

      <h2>8. Permissões — ugo+rwx (o coração do Linux)</h2>

      <OutputBlock label="anatomia da string '-rwxr-xr--'" type="info">
{`  -    rwx     r-x     r--
  │    │       │       └── outros (o)  → r-- = só leitura
  │    │       └────────── grupo (g)   → r-x = leitura + execução
  │    └────────────────── dono  (u)   → rwx = leitura + escrita + execução
  └─────────────────────── tipo
                            -  arquivo regular
                            d  diretório
                            l  link simbólico
                            c  device de caractere (tty)
                            b  device de bloco (disco)
                            s  socket
                            p  pipe nomeado (FIFO)`}
      </OutputBlock>

      <CommandTable
        title="Modo numérico (octal) — soma de bits"
        variations={[
          { cmd: "r = 4", desc: "leitura", output: "ler conteúdo de arquivo / listar diretório" },
          { cmd: "w = 2", desc: "escrita", output: "modificar arquivo / criar e remover dentro de diretório" },
          { cmd: "x = 1", desc: "execução", output: "rodar binário / ENTRAR em diretório (cd)" },
          { cmd: "0", desc: "nada", output: "---" },
          { cmd: "5 = r+x", desc: "leitura + execução", output: "r-x" },
          { cmd: "6 = r+w", desc: "leitura + escrita", output: "rw-" },
          { cmd: "7 = r+w+x", desc: "tudo", output: "rwx" },
          { cmd: "644", desc: "arquivo padrão", output: "rw-r--r--  (você lê/escreve, resto só lê)" },
          { cmd: "755", desc: "executável padrão", output: "rwxr-xr-x  (você tudo, resto lê/executa)" },
          { cmd: "700", desc: "PRIVADO", output: "rwx------  (só você — chave SSH usa isso)" },
          { cmd: "777", desc: "tudo aberto (NUNCA use)", output: "rwxrwxrwx  (mundo escreve = bug de segurança)" },
        ]}
      />

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "ls -l script.sh",
            out: "-rw-r--r-- 1 wallyson wallyson 42 Apr  4 14:32 script.sh",
            outType: "default",
          },
          {
            comment: "sem 'x' não roda",
            cmd: "./script.sh",
            out: "bash: ./script.sh: Permission denied",
            outType: "error",
          },
          {
            comment: "modo NUMÉRICO",
            cmd: "chmod 755 script.sh && ls -l script.sh",
            out: "-rwxr-xr-x 1 wallyson wallyson 42 Apr  4 14:32 script.sh",
            outType: "success",
          },
          {
            comment: "modo SIMBÓLICO — u/g/o (+/-/=) r/w/x",
            cmd: "chmod g-w,o-rx privado.txt && ls -l privado.txt",
            out: "-rw------- 1 wallyson wallyson 12 Apr  4 14:33 privado.txt",
            outType: "info",
          },
          {
            comment: "RECURSIVO em pasta",
            cmd: "chmod -R 700 ~/.ssh && ls -ld ~/.ssh",
            out: "drwx------ 2 wallyson wallyson 4096 Apr  4 14:34 /home/wallyson/.ssh",
            outType: "success",
          },
          {
            comment: "chown — trocar dono (precisa root)",
            cmd: "sudo chown ana.silva:ana.silva relatorio.pdf",
            outType: "muted",
          },
          {
            cmd: "ls -l relatorio.pdf",
            out: "-rw-r--r-- 1 ana.silva ana.silva 84122 Apr  4 14:34 relatorio.pdf",
            outType: "info",
          },
          {
            comment: "trocar SÓ o grupo",
            cmd: "sudo chgrp pentest /opt/ferramentas",
            outType: "muted",
          },
        ]}
      />

      <h2>9. Bits especiais — SUID, SGID, Sticky</h2>

      <p>
        Existem 3 bits "especiais" que vão ANTES dos 3 dígitos normais. São o
        prato cheio de toda PrivEsc Linux:
      </p>

      <CommandTable
        title="Os 3 bits especiais"
        variations={[
          {
            cmd: "SUID (4xxx)",
            desc: "Quando executado, o processo roda com a IDENTIDADE DO DONO, não do usuário que chamou. Aparece como 's' onde seria 'x' do dono.",
            output: "-rwsr-xr-x 1 root root 67K /usr/bin/passwd  ← qualquer user roda como root",
          },
          {
            cmd: "SGID (2xxx)",
            desc: "Igual SUID, mas para GRUPO. Em diretório, faz arquivos novos herdarem o grupo da pasta.",
            output: "-rwxr-sr-x 1 root tty 35K /usr/bin/wall  ← roda com grupo 'tty'",
          },
          {
            cmd: "Sticky (1xxx)",
            desc: "Só o DONO (ou root) pode deletar — mesmo que outros tenham 'w' na pasta. É o que protege /tmp.",
            output: "drwxrwxrwt 18 root root 4096 /tmp  ← note o 't' no fim",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "achar SUID = primeiro passo de qualquer enum LPE",
            cmd: "find / -perm -u=s -type f 2>/dev/null",
            out: `/usr/bin/sudo
/usr/bin/su
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/mount
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/pkexec       ← CVE-2021-4034 (PwnKit) se versão antiga!
/usr/bin/find         ← SUID find = root via -exec /bin/sh \\;
/usr/lib/dbus-1.0/dbus-daemon-launch-helper`,
            outType: "warning",
          },
          {
            comment: "checar contra GTFOBins (binários SUID exploráveis)",
            cmd: "echo 'find . -exec /bin/sh -p \\; -quit'  # se /usr/bin/find for SUID = shell de root",
            outType: "muted",
          },
          {
            comment: "criar SUID manualmente",
            cmd: "sudo cp /bin/bash /tmp/rootbash && sudo chmod 4755 /tmp/rootbash && ls -l /tmp/rootbash",
            out: "-rwsr-xr-x 1 root root 1396520 Apr  4 14:42 /tmp/rootbash",
            outType: "error",
          },
          {
            comment: "como user comum — vira root",
            cmd: "/tmp/rootbash -p && id",
            out: `uid=1000(wallyson) gid=1000(wallyson) euid=0(root) groups=1000(wallyson)`,
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="SUID em script ≠ funciona">
        Linux IGNORA SUID em scripts (#!/bin/bash, .py) por segurança. Só
        funciona em binários compilados (ELF). É por isso que privesc via SUID
        precisa de C compilado ou de um binário GTFOBins-able.
      </AlertBox>

      <h2>10. Hardlinks vs Symlinks</h2>

      <OutputBlock label="conceito" type="muted">
{`HARD LINK (ln origem destino)
  - Mais um NOME para o mesmo INODE
  - Mesmo conteúdo, mesma permissão, mesmo dono
  - Apagar o original NÃO afeta o link (FS conta referências)
  - Não atravessa filesystems (mesmo /dev)
  - Não funciona em diretório (kernel proíbe)

SYMLINK (ln -s origem destino)
  - Atalho — arquivo NOVO que aponta para um caminho
  - Inode próprio, tipo 'l'
  - Apagar o original = link quebra (dangling)
  - Atravessa filesystems
  - Funciona em diretório`}
      </OutputBlock>

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "echo 'conteudo original' > original.txt",
            outType: "muted",
          },
          {
            comment: "HARD LINK",
            cmd: "ln original.txt hard.txt && ls -li original.txt hard.txt",
            out: `12648430 -rw-r--r-- 2 wallyson wallyson 18 Apr  4 14:50 hard.txt
12648430 -rw-r--r-- 2 wallyson wallyson 18 Apr  4 14:50 original.txt`,
            outType: "info",
          },
          {
            comment: "MESMO inode (12648430), contador de links = 2",
            cmd: "rm original.txt && cat hard.txt",
            out: "conteudo original",
            outType: "success",
          },
          {
            comment: "SYM LINK",
            cmd: "echo 'novo' > arquivo.txt && ln -s arquivo.txt sym.txt && ls -li arquivo.txt sym.txt",
            out: `12648431 -rw-r--r-- 1 wallyson wallyson  5 Apr  4 14:51 arquivo.txt
12648432 lrwxrwxrwx 1 wallyson wallyson 11 Apr  4 14:51 sym.txt -> arquivo.txt`,
            outType: "info",
          },
          {
            comment: "apagando original = link QUEBRA",
            cmd: "rm arquivo.txt && cat sym.txt",
            out: "cat: sym.txt: No such file or directory",
            outType: "error",
          },
          {
            comment: "ls -l mostra symlink quebrado",
            cmd: "ls -l sym.txt",
            out: "lrwxrwxrwx 1 wallyson wallyson 11 Apr  4 14:51 sym.txt -> arquivo.txt",
            outType: "warning",
          },
          {
            comment: "uso real — apontar /usr/bin/python para /usr/bin/python3",
            cmd: "ls -l /usr/bin/python 2>/dev/null || sudo ln -sf /usr/bin/python3 /usr/bin/python",
            outType: "default",
          },
        ]}
      />

      <h2>11. Criando, copiando, movendo, apagando</h2>

      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "criar arquivos vazios",
            cmd: "touch a.txt b.txt c.txt && ls",
            out: "a.txt  b.txt  c.txt",
            outType: "default",
          },
          {
            comment: "criar com texto inline (sobrescreve!)",
            cmd: "echo 'primeira linha' > nota.txt && cat nota.txt",
            out: "primeira linha",
            outType: "info",
          },
          {
            comment: ">> APENDA, > SOBRESCREVE — confundir = perda de dado",
            cmd: "echo 'segunda linha' >> nota.txt && cat nota.txt",
            out: `primeira linha
segunda linha`,
            outType: "info",
          },
          {
            comment: "criar pasta + intermediárias com -p",
            cmd: "mkdir -p projeto/relatorios/2026/abril && tree projeto",
            out: `projeto
└── relatorios
    └── 2026
        └── abril`,
            outType: "default",
          },
          {
            comment: "copiar — preservando metadata com -a",
            cmd: "cp -av nota.txt backup_nota.txt",
            out: "'nota.txt' -> 'backup_nota.txt'",
            outType: "info",
          },
          {
            comment: "copiar pasta inteira — precisa de -r",
            cmd: "cp -r projeto projeto_v2",
            outType: "muted",
          },
          {
            comment: "mv = move OU renomeia (mesma operação)",
            cmd: "mv backup_nota.txt /tmp/ && mv nota.txt anotacao.txt",
            outType: "muted",
          },
          {
            comment: "rm — IRREVERSÍVEL, sem lixeira",
            cmd: "rm -i a.txt b.txt",
            out: `rm: remove regular empty file 'a.txt'? y
rm: remove regular empty file 'b.txt'? y`,
            outType: "warning",
          },
          {
            comment: "pasta vazia",
            cmd: "rmdir projeto/relatorios/2026/abril",
            outType: "muted",
          },
          {
            comment: "pasta com conteúdo — -r recursivo, -i pergunta, -f força",
            cmd: "rm -ri projeto_v2",
            out: `rm: descend into directory 'projeto_v2'? y
rm: descend into directory 'projeto_v2/relatorios'? y
rm: remove directory 'projeto_v2/relatorios/2026'? y
rm: remove directory 'projeto_v2/relatorios'? y
rm: remove directory 'projeto_v2'? y`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="danger" title="rm -rf — o comando que destrói carreiras">
        <p>
          Sem lixeira no terminal. <code>rm -rf</code> apaga recursivamente
          sem perguntar e sem parar em erros. Casos famosos:{" "}
          <code>rm -rf /</code> (apaga o SO), <code>rm -rf $VAR/</code> com
          $VAR vazio = <code>rm -rf /</code>, espaço extra em{" "}
          <code>rm -rf / opt/x</code>.
        </p>
        <p>
          Como iniciante: SEMPRE <code>rm -i</code>. Quando ganhar confiança,
          use <code>trash-cli</code> (pacote <code>trash-cli</code>) que move
          para uma lixeira real.
        </p>
      </AlertBox>

      <h2>12. Editor — nano (rapidinho)</h2>

      <p>
        Para editar configs do dia-a-dia, <code>nano</code> é o caminho.{" "}
        <code>vim</code> e <code>emacs</code> são para depois.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "nano /etc/hosts",
            out: `(abre tela do nano com o arquivo)
  GNU nano 7.2     /etc/hosts                              Modified

127.0.0.1       localhost
127.0.1.1       kali
::1             localhost ip6-localhost ip6-loopback

^G Help    ^O Write Out  ^W Where Is   ^K Cut    ^T Execute
^X Exit    ^R Read File  ^\\ Replace    ^U Paste  ^J Justify`,
            outType: "default",
          },
        ]}
      />

      <CommandTable
        title="Atalhos do nano (^ = Ctrl)"
        variations={[
          { cmd: "Ctrl+O", desc: "Salvar (Write Out)." },
          { cmd: "Ctrl+X", desc: "Sair (pergunta se quer salvar)." },
          { cmd: "Ctrl+W", desc: "Buscar texto." },
          { cmd: "Ctrl+\\", desc: "Buscar e substituir." },
          { cmd: "Ctrl+K / Ctrl+U", desc: "Recortar linha / Colar." },
          { cmd: "Ctrl+_", desc: "Pular para linha N." },
          { cmd: "Ctrl+G", desc: "Ajuda completa." },
        ]}
      />

      <h2>13. Curingas (globbing) e expansão de chaves</h2>

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "ls",
            out: "doc1.txt  doc2.txt  foto.jpg  README.md  script.sh",
            outType: "default",
          },
          {
            comment: "* casa qualquer coisa",
            cmd: "ls *.txt",
            out: "doc1.txt  doc2.txt",
            outType: "info",
          },
          {
            comment: "? casa exatamente 1 caractere",
            cmd: "ls doc?.txt",
            out: "doc1.txt  doc2.txt",
            outType: "info",
          },
          {
            comment: "[abc] casa um caractere de um set",
            cmd: "ls doc[12].txt",
            out: "doc1.txt  doc2.txt",
            outType: "info",
          },
          {
            comment: "expansão de chaves — gera múltiplos comandos",
            cmd: "touch arquivo_{a,b,c,d}.log && ls *.log",
            out: "arquivo_a.log  arquivo_b.log  arquivo_c.log  arquivo_d.log",
            outType: "success",
          },
          {
            comment: "ranges",
            cmd: "mkdir backup_{2023..2025} && ls -d backup_*",
            out: "backup_2023  backup_2024  backup_2025",
            outType: "success",
          },
          {
            comment: "combinar — sufixos múltiplos por arquivo",
            cmd: "cp script.sh{,.bak}",
            out: "(equivale a: cp script.sh script.sh.bak)",
            outType: "muted",
          },
        ]}
      />

      <h2>14. Limpando o laboratório</h2>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "cd ~ && du -sh lab",
            out: "184M    lab",
            outType: "info",
          },
          {
            comment: "remoção segura com confirmação",
            cmd: "rm -ri lab",
            out: `rm: descend into directory 'lab'? y
[...]
rm: remove directory 'lab'? y`,
            outType: "warning",
          },
          {
            cmd: "ls ~ | grep lab",
            out: "(vazio — pasta foi)",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Lab final: explore, identifique, proteja"
        goal="Criar uma estrutura de lab, aplicar permissões diferentes em cada arquivo, validar com find e stat, e por fim achar SUID no sistema."
        steps={[
          "Crie ~/lab com 3 subpastas (scripts, dados, secret).",
          "Em scripts/ ponha um shell script com chmod 755.",
          "Em dados/ ponha um .txt com chmod 644.",
          "Em secret/ ponha um arquivo com chmod 600 (só você).",
          "Use find para listar arquivos com permissão 600 dentro do lab.",
          "Use stat para confirmar dono e modos.",
          "Liste os SUID do sistema com find / -perm -4000 — anote 3 conhecidos.",
        ]}
        command={`mkdir -p ~/lab/{scripts,dados,secret}
echo '#!/bin/bash
echo "Olá $(whoami)"' > ~/lab/scripts/hello.sh
chmod 755 ~/lab/scripts/hello.sh

echo "dados publicos" > ~/lab/dados/lista.txt
chmod 644 ~/lab/dados/lista.txt

echo "senha do banco: SqlEmpresa2025!@" > ~/lab/secret/segredo.txt
chmod 600 ~/lab/secret/segredo.txt

find ~/lab -type f -perm 600
stat ~/lab/secret/segredo.txt
find / -perm -4000 -type f 2>/dev/null | head -5`}
        expected={`/home/wallyson/lab/secret/segredo.txt

  File: /home/wallyson/lab/secret/segredo.txt
  Size: 33              Blocks: 8          IO Block: 4096   regular file
Access: (0600/-rw-------)  Uid: ( 1000/wallyson)   Gid: ( 1000/wallyson)

/usr/bin/sudo
/usr/bin/su
/usr/bin/passwd
/usr/bin/mount
/usr/bin/umount`}
        verify="O find achou só o segredo.txt (única perm 600), o stat confirmou dono = wallyson + modo 600, e a lista de SUID veio com sudo, su, passwd, mount, umount."
      />

      <h2>15. Próximo passo</h2>
      <p>
        Você sabe o mapa do sistema, lê arquivos, controla permissões e
        entende o que separa um usuário comum de root. Bora pro{" "}
        <strong>Terminal Essencial</strong> — pipes, redirecionamento,{" "}
        <code>grep</code>/<code>awk</code>/<code>sed</code> e atalhos do Bash
        — agora tudo isso vai fazer sentido porque você tem onde aplicar.
      </p>

      <AlertBox type="success" title="Marcador de progresso">
        Se você consegue olhar para <code>-rwsr-xr-x 1 root root</code> e
        explicar em uma frase o que aquele <code>s</code> significa, você já
        está à frente de 80% dos iniciantes em pentest Linux.
      </AlertBox>
    </PageContainer>
  );
}
