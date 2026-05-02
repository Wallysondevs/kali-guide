import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Wireshark() {
  return (
    <PageContainer
      title="Wireshark + tshark — Análise de pacotes"
      subtitle="GUI e CLI do Wireshark. Capture, filtre, decodifique e extraia evidências de tráfego."
      difficulty="intermediário"
      timeToRead="22 min"
      prompt="recon/wireshark"
    >
      <h2>Setup — capture sem ser root</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y wireshark tshark",
            out: `[...]
Configuring wireshark-common
─────────────────────────────────
Should non-superusers be able to capture packets?
  <Yes>  <No>`,
            outType: "warning",
          },
          {
            comment: "responda Yes — depois adicione SEU usuário ao grupo",
            cmd: "sudo usermod -aG wireshark $USER && newgrp wireshark",
            out: "(necessário fazer logout/login OU rodar 'newgrp wireshark' na sessão)",
            outType: "default",
          },
          {
            cmd: "groups | tr ' ' '\\n' | grep wireshark",
            out: "wireshark",
            outType: "success",
          },
        ]}
      />

      <h2>Capturar pela CLI (tshark)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -D",
            out: `1. eth0
2. wlan0
3. lo (Loopback)
4. any
5. bluetooth-monitor
6. nflog
7. nfqueue`,
            outType: "info",
          },
          {
            comment: "captura simples — ao vivo, em eth0",
            cmd: "sudo tshark -i eth0 -c 5",
            out: `Capturing on 'eth0'
    1 0.000000 192.168.1.42 → 1.1.1.1      ICMP 98 Echo (ping) request id=0x0c45
    2 0.014531 1.1.1.1      → 192.168.1.42 ICMP 98 Echo (ping) reply   id=0x0c45
    3 1.000123 192.168.1.42 → 1.1.1.1      ICMP 98 Echo (ping) request id=0x0c46
    4 1.014891 1.1.1.1      → 192.168.1.42 ICMP 98 Echo (ping) reply   id=0x0c46
    5 2.000456 192.168.1.42 → 8.8.8.8      DNS  85 Standard query 0x1234 A google.com
5 packets captured`,
            outType: "default",
          },
          {
            comment: "salvar em arquivo .pcap",
            cmd: "sudo tshark -i eth0 -w captura.pcap",
            out: `Capturing on 'eth0'
^C141 packets captured`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags principais do tshark"
        variations={[
          { cmd: "-i eth0", desc: "Interface (ou 'any' para todas).", output: "Veja com -D." },
          { cmd: "-c 100", desc: "Para depois de capturar 100 pacotes.", output: "Útil para análises pontuais." },
          { cmd: "-w arquivo.pcap", desc: "Salva em arquivo binário (formato pcap).", output: "Sem -w, mostra na tela." },
          { cmd: "-r arquivo.pcap", desc: "Lê arquivo já gravado.", output: "Para análise offline." },
          { cmd: "-Y 'http.request'", desc: "Display filter (linguagem do Wireshark).", output: "Filtra DEPOIS da captura." },
          { cmd: "-f 'tcp port 80'", desc: "Capture filter (BPF — igual tcpdump).", output: "Filtra DURANTE a captura (mais leve)." },
          { cmd: "-n", desc: "Não resolve nomes (DNS, MAC).", output: "Mais rápido em capturas grandes." },
          { cmd: "-V", desc: "Verbose: dissecação completa do pacote.", output: "Equivale a 'expand all' na GUI." },
          { cmd: "-T fields -e ip.src -e ip.dst", desc: "Saída tabular de campos.", output: "Pipeline para awk/sort/uniq." },
          { cmd: "-z io,stat,1", desc: "Estatísticas (1 segundo de janela).", output: "Tabela tempo × bytes/pacotes." },
        ]}
      />

      <h2>Capture filters (BPF)</h2>
      <CodeBlock
        language="bash"
        title="filtros BPF mais usados (vão em -f '...')"
        code={`# Por host
host 192.168.1.50
src host 10.0.0.5
dst host 10.0.0.5

# Por porta
port 80
tcp port 443
udp port 53

# Por protocolo
icmp
arp
not arp and not stp        # tira ruído da rede

# Combinar
host 192.168.1.50 and not port 22
(tcp port 80 or tcp port 443) and host scanme.nmap.org

# Por tamanho/conteúdo
greater 1500
tcp[tcpflags] & tcp-syn != 0     # só SYN
ether src AA:BB:CC:DD:EE:FF`}
      />

      <h2>Display filters (Wireshark/tshark -Y)</h2>
      <CommandTable
        title="Filtros de display essenciais"
        variations={[
          { cmd: "ip.addr == 192.168.1.50", desc: "Pacotes de OU para esse IP.", output: "Use ip.src ou ip.dst para direção." },
          { cmd: "tcp.port == 22", desc: "Tráfego SSH.", output: "tcp.dstport==22 / tcp.srcport==22" },
          { cmd: "http.request.method == \"POST\"", desc: "Só POSTs HTTP.", output: "http.request.uri contains \"login\"" },
          { cmd: "http.response.code == 200", desc: "Respostas 200 OK.", output: "http.response.code >= 400" },
          { cmd: "dns.qry.name contains \"google\"", desc: "Consultas DNS por algo.", output: "Útil para detectar exfil DNS." },
          { cmd: "tls.handshake.type == 1", desc: "Client Hello (vê SNI).", output: "tls.handshake.extensions_server_name" },
          { cmd: "tcp.analysis.retransmission", desc: "Pacotes retransmitidos (lentidão).", output: "Diagnóstico de rede." },
          { cmd: "tcp.flags.syn == 1 and tcp.flags.ack == 0", desc: "Só SYNs (port scans).", output: "Detecta SYN scan." },
          { cmd: "frame contains \"password\"", desc: "Qualquer frame com a string.", output: "Caça credenciais em texto puro." },
        ]}
      />

      <h2>Análise prática 1 — credenciais HTTP em texto puro</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -r login_capture.pcap -Y 'http.request.method == \"POST\"' -T fields -e http.host -e http.request.uri -e urlencoded-form.value",
            out: `app.local    /login    admin
app.local    /login    SuperSenh@2024!
app.local    /api/auth maria.silva
app.local    /api/auth xyz789`,
            outType: "warning",
          },
          {
            comment: "extrair só os USER/PASS de Basic Auth",
            cmd: "tshark -r login_capture.pcap -Y 'http.authbasic' -T fields -e http.authbasic",
            out: `Basic YWRtaW46YWRtaW4=`,
            outType: "default",
          },
          {
            cmd: "echo YWRtaW46YWRtaW4= | base64 -d",
            out: "admin:admin",
            outType: "error",
          },
        ]}
      />

      <h2>Análise prática 2 — handshake TCP</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -r captura.pcap -Y 'tcp.flags.syn == 1 and tcp.stream eq 0' -T fields -e tcp.flags.str -e tcp.seq -e tcp.ack",
            out: `0x0002 (SYN)            0           0
0x0012 (SYN, ACK)       0           1
0x0010 (ACK)            1           1`,
            outType: "info",
          },
        ]}
      />

      <OutputBlock label="lendo o 3-way handshake" type="muted">
{`Cliente → Servidor:  SYN     seq=0       ack=0      "quero conversar"
Servidor → Cliente:  SYN-ACK seq=0       ack=1      "ok, eu também"
Cliente → Servidor:  ACK     seq=1       ack=1      "estabelecido"
                            ──────────────────────
                            agora vai a aplicação (HTTP, SSH, etc.)`}
      </OutputBlock>

      <h2>Análise prática 3 — DNS exfiltration</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -r exfil.pcap -Y 'dns.qry.name' -T fields -e dns.qry.name | sort -u | head -10",
            out: `c2VjcmV0LWxpbmUtMQ.evil.com
c2VjcmV0LWxpbmUtMg.evil.com
c2VjcmV0LWxpbmUtMw.evil.com
c2VjcmV0LWxpbmUtNA.evil.com
c2VjcmV0LWxpbmUtNQ.evil.com`,
            outType: "warning",
          },
          {
            comment: "decodifica o que foi exfiltrado por subdomínio (b64)",
            cmd: "tshark -r exfil.pcap -Y 'dns.qry.name' -T fields -e dns.qry.name | awk -F. '{print $1}' | base64 -d 2>/dev/null",
            out: `secret-line-1
secret-line-2
secret-line-3
secret-line-4
secret-line-5`,
            outType: "error",
          },
        ]}
      />

      <h2>Estatísticas e rankings</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -r captura.pcap -q -z conv,tcp",
            out: `================================================================================
TCP Conversations
Filter:<No Filter>
                                               |       <-      | |       ->      | |     Total     |    Relative    |   Duration   |
                                               | Frames  Bytes | | Frames  Bytes | | Frames  Bytes |      Start     |              |
192.168.1.42:51234   <-> 142.251.179.139:443   |     12  9,847 | |     11  1,623 | |     23 11,470 |      0.001234  |       0.4123 |
192.168.1.42:51235   <-> 142.251.179.142:443   |      8  5,231 | |      8  1,212 | |     16  6,443 |      0.231541  |       0.2014 |`,
            outType: "info",
          },
          {
            cmd: "tshark -r captura.pcap -q -z http,tree",
            out: `===================================================================
HTTP/Packet Counter:
Topic / Item                       Count    Average    Min val    Max val    Rate (ms)
-------------------------------------------------------------------------------------
Total HTTP Packets                 142      -          -          -          0.0142
 HTTP Request Packets              71       -          -          -          0.0071
  GET                              52
  POST                             18
  HEAD                             1
 HTTP Response Packets             71       -          -          -          0.0071
  2xx Success                      62
  3xx Redirection                  5
  4xx Client Error                 4`,
            outType: "default",
          },
        ]}
      />

      <h2>Extrair arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "tshark -r http_download.pcap --export-objects http,./extraidos/",
            out: `(silencioso. ./extraidos/ vai conter tudo que foi baixado por HTTP)`,
            outType: "muted",
          },
          {
            cmd: "ls extraidos/",
            out: `index.html         logo.png        report.pdf        secret.zip`,
            outType: "success",
          },
          {
            cmd: "file extraidos/*",
            out: `extraidos/index.html: HTML document, ASCII text
extraidos/logo.png:   PNG image data, 800 x 600, 8-bit/color RGBA
extraidos/report.pdf: PDF document, version 1.7
extraidos/secret.zip: Zip archive data, at least v2.0 to extract`,
            outType: "info",
          },
        ]}
      />

      <h2>Wireshark GUI — atalhos essenciais</h2>
      <CommandTable
        title="Atalhos do Wireshark"
        variations={[
          { cmd: "Ctrl+E", desc: "Iniciar/parar captura.", output: "Botão verde/vermelho da toolbar." },
          { cmd: "Ctrl+F", desc: "Abrir busca.", output: "Por string, hex ou regex." },
          { cmd: "Ctrl+Shift+F", desc: "Salvar display filter como botão.", output: "Bookmarks de filtros." },
          { cmd: "Botão direito → Follow → TCP Stream", desc: "Reconstrói toda a conversa.", output: "Mostra request/response em texto unificado." },
          { cmd: "Botão direito → Decode As", desc: "Força um protocolo (ex.: tcp.port==4444 → HTTP).", output: "Útil para tráfego em portas não-padrão." },
          { cmd: "Statistics → Conversations", desc: "Quem fala com quem, em qual protocolo.", output: "Ranking por bytes." },
          { cmd: "Statistics → Endpoints", desc: "Lista de IPs/portas únicos.", output: "Identifica top talkers." },
          { cmd: "File → Export Specified Packets", desc: "Salva subset filtrado em novo .pcap.", output: "Para enviar evidência." },
        ]}
      />

      <PracticeBox
        title="Capture um login HTTP de laboratório"
        goal="Capturar e extrair credenciais que trafegam em HTTP simples (sem TLS) — só em alvo seu."
        steps={[
          "Suba um servidor HTTP simples local com formulário de login.",
          "Capture eth0 (ou lo) com tshark gravando em login.pcap.",
          "Faça um POST de login no formulário.",
          "Pare a captura e extraia o request POST com tshark + display filter.",
        ]}
        command={`# 1) servidor de teste
python3 -c "
from http.server import BaseHTTPRequestHandler, HTTPServer
class H(BaseHTTPRequestHandler):
  def do_POST(self):
    n=int(self.headers.get('Content-Length','0'))
    print('POST body:', self.rfile.read(n))
    self.send_response(200); self.end_headers()
HTTPServer(('0.0.0.0',8080), H).serve_forever()" &

# 2) captura
sudo tshark -i lo -f 'port 8080' -w login.pcap &
TSHARK=$!

# 3) login (cliente)
curl -X POST http://127.0.0.1:8080/login \\
  -d 'user=admin&pass=segredo123'

# 4) finaliza captura e analisa
sleep 1; sudo kill $TSHARK
tshark -r login.pcap -Y 'http.request.method == "POST"' -V | grep -E 'user=|pass='`}
        expected={`POST body: b'user=admin&pass=segredo123'
[...]
    Form item: "user" = "admin"
    Form item: "pass" = "segredo123"`}
        verify="A linha 'pass=segredo123' deve aparecer em texto puro — exatamente por isso HTTP simples está banido em produção."
      />

      <AlertBox type="danger" title="Sniffing exige autorização">
        Capturar tráfego em rede que não é sua — mesmo que aberta — é interceptação.
        Lab e suas próprias redes domésticas/lab estão liberados. Em qualquer outro contexto
        é necessária autorização escrita.
      </AlertBox>
    </PageContainer>
  );
}
