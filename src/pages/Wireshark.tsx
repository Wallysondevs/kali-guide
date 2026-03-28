import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Wireshark() {
  return (
    <PageContainer
      title="Wireshark & tshark"
      subtitle="Análise de tráfego de rede em tempo real e a partir de capturas. Essencial para forense e pentest."
      difficulty="intermediario"
      timeToRead="12 min"
    >
      <h2>Ajuda do tshark (versão CLI)</h2>
      <CodeBlock language="bash" code={`# O Wireshark tem interface gráfica — para linha de comando, use o tshark
tshark --help
tshark -h | less

# Ver opções de interface
tshark -D              # listar interfaces disponíveis

# O tshark --help mostra (traduzido abaixo):
# -i <interface>       → interface de captura
# -f <filtro>          → filtro de captura (BPF)
# -Y <filtro>          → filtro de exibição (display filter)
# -r <arquivo>         → ler de arquivo .pcap
# -w <arquivo>         → salvar captura em arquivo
# -c <contagem>        → número máximo de pacotes
# -T <tipo>            → formato de saída`} />

      <AlertBox type="info" title="Wireshark (GUI) vs tshark (CLI)">
        O Wireshark é a interface gráfica — ótima para análise visual e interativa. 
        O <strong>tshark</strong> é a versão de linha de comando do mesmo motor — ideal para automação, 
        servidores sem interface gráfica e scripts. Os filtros são idênticos nos dois.
      </AlertBox>

      <h2>Capturando tráfego</h2>
      <CodeBlock language="bash" code={`# Ver interfaces disponíveis
sudo tshark -D
sudo wireshark -D

# Capturar tudo na interface eth0
sudo tshark -i eth0

# Capturar e salvar em arquivo
sudo tshark -i eth0 -w captura.pcap

# Capturar com filtro BPF (antes da captura)
sudo tshark -i eth0 -f "port 80"
sudo tshark -i eth0 -f "host 192.168.1.1"
sudo tshark -i eth0 -f "tcp port 443"

# Limitar número de pacotes
sudo tshark -i eth0 -c 1000 -w captura.pcap

# Capturar apenas por tempo (30 segundos)
sudo tshark -i eth0 -a duration:30 -w captura.pcap`} />

      <ParamsTable
        title="tshark — flags de captura explicadas em português"
        params={[
          { flag: "-i INTERFACE", desc: "Interface de rede a capturar. Use -D para listar as disponíveis. Ex: eth0, wlan0, lo (loopback).", exemplo: "tshark -i eth0" },
          { flag: "-D", desc: "Lista todas as interfaces de rede disponíveis para captura, com numeração.", exemplo: "tshark -D" },
          { flag: "-w ARQUIVO", desc: "Salva os pacotes capturados em um arquivo .pcap (formato padrão). Pode ser aberto depois no Wireshark.", exemplo: "-w captura.pcap" },
          { flag: "-r ARQUIVO", desc: "Lê pacotes de um arquivo .pcap existente ao invés de capturar ao vivo.", exemplo: "tshark -r captura.pcap" },
          { flag: "-f 'FILTRO'", desc: "Filtro de captura (BPF — Berkeley Packet Filter). Aplicado durante a captura. Sintaxe diferente do filtro de exibição.", exemplo: "-f 'port 80 and host 192.168.1.1'" },
          { flag: "-c NÚMERO", desc: "Para a captura após capturar N pacotes.", exemplo: "-c 500" },
          { flag: "-a duration:N", desc: "Para automaticamente após N segundos de captura.", exemplo: "-a duration:60" },
          { flag: "-b filesize:N", desc: "Cria um novo arquivo de captura a cada N KB (ring buffer).", exemplo: "-b filesize:1000" },
        ]}
      />

      <h2>Filtros de exibição (Display Filters)</h2>
      <CodeBlock language="bash" code={`# Filtros de exibição — aplicados APÓS capturar (mais poderosos)
# Podem ser usados no Wireshark GUI ou com tshark -Y

# Por protocolo
tshark -r captura.pcap -Y "http"
tshark -r captura.pcap -Y "dns"
tshark -r captura.pcap -Y "ftp"
tshark -r captura.pcap -Y "tcp"
tshark -r captura.pcap -Y "udp"

# Por IP
tshark -r captura.pcap -Y "ip.addr == 192.168.1.1"
tshark -r captura.pcap -Y "ip.src == 192.168.1.100"
tshark -r captura.pcap -Y "ip.dst == 8.8.8.8"

# Por porta
tshark -r captura.pcap -Y "tcp.port == 80"
tshark -r captura.pcap -Y "tcp.dstport == 443"

# Combinando filtros
tshark -r captura.pcap -Y "http and ip.src == 192.168.1.5"
tshark -r captura.pcap -Y "tcp.port == 80 or tcp.port == 443"
tshark -r captura.pcap -Y "not arp and not dns"`} />

      <ParamsTable
        title="Filtros de exibição mais usados — explicados"
        params={[
          { flag: "http", desc: "Exibe apenas pacotes HTTP (requisições e respostas web na porta 80).", exemplo: 'tshark -r cap.pcap -Y "http"' },
          { flag: "http.request.method == GET", desc: "Filtra apenas requisições HTTP GET.", exemplo: '-Y "http.request.method == GET"' },
          { flag: "http.request.uri contains login", desc: "Pacotes HTTP cuja URL contém a palavra 'login'.", exemplo: '-Y "http.request.uri contains \\"login\\""' },
          { flag: "dns", desc: "Exibe apenas consultas e respostas DNS.", exemplo: '-Y "dns"' },
          { flag: "dns.qry.name contains empresa", desc: "Consultas DNS para domínios que contêm 'empresa'.", exemplo: '-Y "dns.qry.name contains \\"empresa\\""' },
          { flag: "ftp", desc: "Protocolo FTP — login, comandos e respostas.", exemplo: '-Y "ftp"' },
          { flag: "ftp-data", desc: "Dados transferidos via FTP (arquivos). Separado dos comandos FTP.", exemplo: '-Y "ftp-data"' },
          { flag: "ip.addr == X.X.X.X", desc: "Tráfego de OU para o IP especificado (origem ou destino).", exemplo: '-Y "ip.addr == 192.168.1.1"' },
          { flag: "ip.src == X.X.X.X", desc: "Apenas pacotes originados do IP.", exemplo: '-Y "ip.src == 10.0.0.5"' },
          { flag: "ip.dst == X.X.X.X", desc: "Apenas pacotes destinados ao IP.", exemplo: '-Y "ip.dst == 8.8.8.8"' },
          { flag: "tcp.port == N", desc: "Tráfego TCP na porta especificada (origem ou destino).", exemplo: '-Y "tcp.port == 8080"' },
          { flag: "tcp.flags.syn == 1", desc: "Pacotes com flag SYN — útil para identificar handshakes e port scans.", exemplo: '-Y "tcp.flags.syn == 1 and tcp.flags.ack == 0"' },
          { flag: "frame contains 'PALAVRA'", desc: "Pacotes que contêm determinada string em qualquer campo.", exemplo: '-Y "frame contains \\"password\\""' },
          { flag: "not arp", desc: "Exclui pacotes ARP (muito comum e poluem a análise).", exemplo: '-Y "not arp and not icmp"' },
        ]}
      />

      <h2>tshark — extraindo dados</h2>
      <CodeBlock language="bash" code={`# Extrair campos específicos (-T fields -e campo)
tshark -r captura.pcap -T fields -e ip.src -e ip.dst -e tcp.dstport

# Extrair URLs HTTP acessadas
tshark -r captura.pcap -Y "http.request" \
  -T fields -e http.host -e http.request.uri

# Extrair credenciais HTTP (POST)
tshark -r captura.pcap -Y "http.request.method == POST" \
  -T fields -e http.host -e http.file_data

# Extrair consultas DNS
tshark -r captura.pcap -Y "dns.flags.response == 0" \
  -T fields -e dns.qry.name

# Extrair arquivos transferidos via HTTP
# No Wireshark GUI: File → Export Objects → HTTP`} />

      <ParamsTable
        title="tshark — flags de saída e extração"
        params={[
          { flag: "-Y 'FILTRO'", desc: "Aplica filtro de exibição (display filter) na leitura do arquivo ou captura ao vivo.", exemplo: '-Y "http and ip.src == 192.168.1.1"' },
          { flag: "-T fields", desc: "Modo de saída por campos específicos. Use junto com -e para definir quais campos.", exemplo: "-T fields -e ip.src -e tcp.dstport" },
          { flag: "-e CAMPO", desc: "Campo específico a extrair. Pode usar múltiplos -e. Use tab-complete no Wireshark para descobrir nomes.", exemplo: "-e http.host -e http.request.uri" },
          { flag: "-T json", desc: "Saída em formato JSON — ótimo para processar com jq ou scripts Python.", exemplo: "-T json | jq '.[]._source.layers.http'" },
          { flag: "-T pdml", desc: "XML detalhado de todos os campos de cada pacote.", exemplo: "-T pdml > pacotes.xml" },
          { flag: "-E separator=,", desc: "Define o separador entre campos no modo -T fields. Padrão é tab.", exemplo: "-E separator=," },
          { flag: "-q", desc: "Modo quieto — não exibe estatísticas ao final.", exemplo: "-q" },
          { flag: "-z ESTATÍSTICA", desc: "Gera estatísticas: io,stat / conv,tcp / http,tree / dns / etc.", exemplo: "-z http,tree (mostra métodos HTTP usados)" },
          { flag: "-x", desc: "Exibe a saída em hexadecimal e ASCII (hex dump).", exemplo: "-x" },
        ]}
      />

      <h2>Análise de credenciais em texto claro</h2>
      <CodeBlock language="bash" code={`# Senhas FTP (em texto claro)
tshark -r captura.pcap -Y "ftp" -T fields -e ftp.request.command -e ftp.request.arg
# Procure por PASS → argumento é a senha

# Senhas Telnet (em texto claro)
tshark -r captura.pcap -Y "telnet" -T fields -e telnet.data

# Formulários HTTP POST (login web sem HTTPS)
tshark -r captura.pcap -Y "http.request.method == POST" \
  -T fields -e http.file_data

# Seguir um stream TCP completo (equivalente ao "Follow TCP Stream" do Wireshark)
tshark -r captura.pcap -q -z follow,tcp,ascii,0`} />

      <h2>Filtros BPF de captura</h2>
      <ParamsTable
        title="Filtros BPF (-f) — sintaxe e exemplos"
        params={[
          { flag: "port N", desc: "Captura tráfego na porta N (qualquer protocolo).", exemplo: "-f 'port 80'" },
          { flag: "host IP", desc: "Captura tráfego de/para um IP específico.", exemplo: "-f 'host 192.168.1.1'" },
          { flag: "net 192.168.1.0/24", desc: "Captura tráfego de/para toda uma sub-rede.", exemplo: "-f 'net 192.168.1.0/24'" },
          { flag: "tcp", desc: "Apenas tráfego TCP.", exemplo: "-f 'tcp'" },
          { flag: "udp port 53", desc: "Apenas DNS (UDP na porta 53).", exemplo: "-f 'udp port 53'" },
          { flag: "not port 22", desc: "Exclui tráfego SSH (útil para não capturar sua própria sessão).", exemplo: "-f 'not port 22'" },
          { flag: "src host IP", desc: "Tráfego originado de um IP específico.", exemplo: "-f 'src host 10.0.0.5'" },
          { flag: "dst port N", desc: "Tráfego destinado a uma porta específica.", exemplo: "-f 'dst port 3389'" },
        ]}
      />

      <AlertBox type="success" title="Dica CTF">
        Em CTFs, a primeira coisa a fazer com um .pcap é: <strong>Statistics → Protocol Hierarchy</strong> 
        (no Wireshark GUI) para ver quais protocolos têm mais tráfego. Depois filtre o que parece suspeito. 
        Em seguida: <strong>File → Export Objects</strong> para extrair arquivos transferidos.
      </AlertBox>
    </PageContainer>
  );
}
