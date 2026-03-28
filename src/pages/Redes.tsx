import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Redes() {
  return (
    <PageContainer
      title="Redes no Kali Linux"
      subtitle="Configuração de rede, monitoramento e ferramentas básicas de rede para pentest."
      difficulty="iniciante"
      timeToRead="9 min"
    >
      <h2>Interfaces de rede</h2>
      <CodeBlock language="bash" code={`# Listar todas as interfaces
ip a
ip link show

# Trazer interface up/down
sudo ip link set eth0 up
sudo ip link set eth0 down

# Configurar IP estático
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip route add default via 192.168.1.1

# Obter IP via DHCP
sudo dhclient eth0

# Interfaces wireless
ip a | grep wlan
iwconfig              # info wireless (modo antigo)
iw dev               # info wireless (modo novo)`} />

      <h2>Diagnóstico de rede</h2>
      <CodeBlock language="bash" code={`# Ping e conectividade
ping -c 4 8.8.8.8          # testa conectividade
ping -c 4 192.168.1.1      # testa gateway
ping -c 4 google.com       # testa DNS + internet

# Rastreamento de rota
traceroute google.com
tracepath google.com       # alternativa sem root

# DNS
nslookup google.com        # consulta básica
dig google.com             # detalhada
dig google.com MX          # registros de email
dig @8.8.8.8 google.com   # usando Google DNS
host -a google.com         # todos os registros
whois google.com           # informações do domínio

# Portas e conexões abertas
ss -tulpn                  # sockets TCP/UDP com processos
ss -tulpn | grep :80       # quem usa porta 80
netstat -tulpn             # equivalente (mais antigo)
lsof -i :80                # processo na porta 80
lsof -i TCP                # todas conexões TCP`} />

      <h2>Descoberta de hosts na rede</h2>
      <CodeBlock language="bash" code={`# ARP scan (rápido na rede local)
sudo arp-scan -l                        # rede local
sudo arp-scan 192.168.1.0/24           # sub-rede específica

# netdiscover (sem nmap)
sudo netdiscover -r 192.168.1.0/24
sudo netdiscover -i eth0               # interface específica

# Ping sweep manual
for i in $(seq 1 254); do ping -c 1 -W 1 192.168.1.$i | grep "bytes from" & done
wait

# fping (mais eficiente)
sudo apt install -y fping
fping -a -g 192.168.1.0/24 2>/dev/null   # apenas hosts ativos`} />

      <h2>Captura de tráfego</h2>
      <CodeBlock language="bash" code={`# tcpdump — captura básica
sudo tcpdump -i eth0                    # capturar interface
sudo tcpdump -i eth0 -n                 # sem resolver DNS
sudo tcpdump -i eth0 port 80           # filtrar porta 80
sudo tcpdump -i eth0 host 192.168.1.1  # filtrar IP
sudo tcpdump -i eth0 -w captura.pcap   # salvar em arquivo
sudo tcpdump -r captura.pcap           # ler arquivo

# Filtros avançados
sudo tcpdump -i eth0 'tcp port 80 and host 192.168.1.1'
sudo tcpdump -i eth0 'not port 22'     # excluir SSH
sudo tcpdump -i eth0 -A port 80        # mostrar payload ASCII

# Ler com Wireshark
wireshark captura.pcap`} />

      <h2>Configuração de rede para pentest</h2>
      <CodeBlock language="bash" code={`# Modo promíscuo (capturar todo tráfego da rede)
sudo ip link set eth0 promisc on
sudo ip link set eth0 promisc off

# Spoofing de MAC address
sudo ip link set eth0 down
sudo ip link set eth0 address 00:11:22:33:44:55
sudo ip link set eth0 up

# Usando macchanger
sudo apt install -y macchanger
sudo macchanger -r eth0           # MAC aleatório
sudo macchanger -m 00:11:22:33:44:55 eth0  # MAC específico
sudo macchanger -s eth0           # mostrar MAC atual

# IP forwarding (para man-in-the-middle)
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
sudo sysctl -w net.ipv4.ip_forward=1      # temporário
# Permanente: editar /etc/sysctl.conf`} />

      <AlertBox type="warning" title="ARP Poisoning — somente em ambientes autorizados">
        Técnicas como ARP spoofing e IP forwarding só devem ser usadas em redes onde você tem 
        autorização explícita. Em redes de terceiros, isso é crime.
      </AlertBox>

      <h2>Ferramentas de reconhecimento passivo</h2>
      <CodeBlock language="bash" code={`# theHarvester (coleta de emails, subdomínios, IPs)
theHarvester -d empresa.com -b all

# Maltego (ferramenta gráfica de OSINT)
maltego

# Shodan (internet-wide scanning)
# Instalar CLI
pip install shodan
shodan init SUA_API_KEY
shodan search "apache" --fields ip_str,port
shodan host 192.168.1.1

# recon-ng (framework de reconhecimento)
recon-ng
# dentro: marketplace install all
# marketplace load recon/domains-hosts/hackertarget

# OSINT Framework
# Consulte: osintframework.com`} />

      <h2>Proxy e interceptação</h2>
      <CodeBlock language="bash" code={`# Configurar proxy no navegador para Burp Suite
# Proxy: 127.0.0.1:8080

# proxychains — encaminhar tráfego por proxies
cat /etc/proxychains4.conf
# Adicionar: socks5 127.0.0.1 9050 (Tor)
proxychains nmap -sT 192.168.1.1
proxychains curl http://site.com

# Configurar Tor
sudo systemctl start tor
# Tor SOCKS proxy em 127.0.0.1:9050`} />
    </PageContainer>
  );
}
