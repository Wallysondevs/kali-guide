import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";

export default function Redes() {
  return (
    <PageContainer
      title="Redes no Kali Linux"
      subtitle="Configuração de rede, descoberta de IPs, monitoramento e ferramentas básicas para reconhecimento."
      difficulty="iniciante"
      timeToRead="20 min"
    >
      <AlertBox type="warning" title="Tudo abaixo é potencialmente invasivo">
        Comandos como <code>arp-scan</code>, <code>tcpdump</code>,{" "}
        <code>arp-spoofing</code> e <code>nmap -A</code> só podem ser
        executados em redes <strong>suas</strong> ou onde você tem{" "}
        <strong>autorização escrita</strong>. Em rede de café, hotel,
        condomínio ou empresa de terceiros é crime (Lei 12.737/2012).
      </AlertBox>

      <h2>1. Como descobrir o IP de um site (DNS lookup)</h2>
      <p>
        Antes de qualquer varredura, você quase sempre precisa saber{" "}
        <strong>qual IP</strong> está por trás do nome de um site (
        <code>example.com</code> → <code>93.184.215.14</code>). Isso se chama{" "}
        <strong>resolução de DNS</strong> e é completamente legal — o sistema
        faz isso toda vez que você abre um navegador.
      </p>

      <h3>1.1. dig — a ferramenta padrão</h3>
      <CodeBlock
        language="bash"
        code={`# IP do site (registro A — IPv4)
dig +short example.com
# 93.184.215.14

# IPv6 (registro AAAA)
dig +short example.com AAAA
# 2606:2800:21f:cb07:6820:80da:af6b:8b2c

# Saída completa com TTL, autoridade etc.
dig example.com

# Especificar o servidor DNS (use Google DNS)
dig @8.8.8.8 example.com

# Servidores de email do domínio (registro MX)
dig +short example.com MX

# Servidores DNS autoritativos do domínio (registro NS)
dig +short example.com NS

# DNS reverso — IP → nome
dig +short -x 93.184.215.14
# example.com.

# Tudo de uma vez (ANY pode ser bloqueado por alguns servidores)
dig example.com ANY +noall +answer`}
      />

      <h3>1.2. host — versão simples e rápida</h3>
      <CodeBlock
        language="bash"
        code={`# Resolução básica
host example.com
# example.com has address 93.184.215.14
# example.com has IPv6 address 2606:2800:21f:cb07:6820:80da:af6b:8b2c
# example.com mail is handled by 0 .

# Tudo (todos os tipos de registro)
host -a example.com

# Só um tipo
host -t MX example.com
host -t NS example.com
host -t TXT example.com   # registros TXT (SPF, DKIM, etc.)`}
      />

      <h3>1.3. nslookup — clássico, ainda funciona</h3>
      <CodeBlock
        language="bash"
        code={`# Modo simples
nslookup example.com

# Especificar servidor DNS
nslookup example.com 1.1.1.1   # usa Cloudflare

# Modo interativo
nslookup
> server 8.8.8.8
> example.com
> set type=MX
> example.com
> exit`}
      />

      <h3>1.4. whois — quem é dono do domínio</h3>
      <CodeBlock
        language="bash"
        code={`# Informações de registro do domínio
whois example.com

# Você vê: registrador, datas (criação/expiração), servidores DNS,
# muitas vezes nome/email do dono (alguns ocultam por privacidade).

# Whois de IP (qual organização possui aquela faixa)
whois 93.184.215.14`}
      />

      <PracticeBox
        title="1 — Descubra o IP de example.com"
        goal="Usar 3 comandos diferentes para resolver o mesmo nome."
        command={`dig +short example.com
host example.com
nslookup example.com | grep "Address" | tail -1`}
        expected={`93.184.215.14
example.com has address 93.184.215.14
example.com has IPv6 address 2606:2800:21f:cb07:6820:80da:af6b:8b2c
example.com mail is handled by 0 .
Address: 93.184.215.14`}
        verify="Os três comandos deram o mesmo IP (93.184.215.14). Você acabou de fazer reconhecimento DNS — primeira fase de qualquer pentest."
      />

      <AlertBox type="info" title="Por que usamos example.com">
        <code>example.com</code>, <code>example.org</code> e{" "}
        <code>example.net</code> são domínios <strong>reservados pela IANA</strong>{" "}
        para documentação e exemplos. Pode usar à vontade — não pertencem a
        ninguém de verdade.
      </AlertBox>

      <h3>1.5. Descobrindo subdomínios</h3>
      <p>
        Um site real geralmente tem dezenas de subdomínios (
        <code>mail.empresa.com</code>, <code>admin.empresa.com</code>,{" "}
        <code>staging.empresa.com</code>...). Descobri-los é parte do
        reconhecimento.
      </p>
      <CodeBlock
        language="bash"
        code={`# dnsenum — força bruta de subdomínios + transferência de zona
dnsenum example.com

# fierce — varredura DNS clássica
fierce --domain example.com

# subfinder (passivo, usa fontes públicas)
subfinder -d example.com

# amass (mais completo, demora mais)
amass enum -d example.com

# Em fontes públicas via curl (rápido e silencioso)
curl -s "https://crt.sh/?q=%25.example.com&output=json" \\
  | jq -r '.[].name_value' | sort -u`}
      />

      <h3>1.6. Geolocalização e ASN do IP</h3>
      <CodeBlock
        language="bash"
        code={`# Descobrir país, cidade e provedor de um IP
curl -s https://ipinfo.io/93.184.215.14
# {
#   "ip": "93.184.215.14",
#   "city": "Los Angeles",
#   "region": "California",
#   "country": "US",
#   "org": "AS15133 Edgecast Inc."
# }

# Ou na linha de comando direto
curl -s ipinfo.io/93.184.215.14/country  # só o país
curl -s ipinfo.io/93.184.215.14/org       # só a organização

# Seu próprio IP público
curl -s ifconfig.me
curl -s ipinfo.io`}
      />

      <h2>2. Interfaces de rede do seu Kali</h2>
      <CodeBlock
        language="bash"
        code={`# Listar todas as interfaces (moderno)
ip a              # ou: ip address
ip link show

# Modo antigo (ainda funciona)
ifconfig          # precisa: sudo apt install net-tools

# Subir/derrubar interface
sudo ip link set eth0 up
sudo ip link set eth0 down

# IP estático (manual)
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip route add default via 192.168.1.1

# Remover IP
sudo ip addr del 192.168.1.100/24 dev eth0

# Pedir IP via DHCP
sudo dhclient eth0
sudo dhclient -r eth0       # libera o IP

# Ver tabela de rotas
ip route
ip route show

# Wireless
iwconfig                    # info wireless (clássico)
iw dev                      # info wireless (moderno)
nmcli device wifi list      # redes Wi-Fi visíveis`}
      />

      <PracticeBox
        title="2 — Descubra sua própria rede"
        goal="Saber qual é o seu IP, gateway e DNS."
        command={`ip a | grep "inet " | grep -v 127.0.0.1
ip route | grep default
cat /etc/resolv.conf | grep nameserver`}
        expected={`    inet 192.168.1.42/24 brd 192.168.1.255 scope global dynamic noprefixroute eth0
default via 192.168.1.1 dev eth0 proto dhcp metric 100
nameserver 192.168.1.1
nameserver 8.8.8.8`}
        verify="Você descobriu seu IP local (192.168.1.42), seu gateway (192.168.1.1, normalmente o roteador) e quem resolve seu DNS."
      />

      <h2>3. Diagnóstico — está conectado?</h2>
      <CodeBlock
        language="bash"
        code={`# Conectividade pura (com gateway)
ping -c 4 192.168.1.1

# Internet por IP (sem depender de DNS)
ping -c 4 8.8.8.8

# Internet com DNS (testa resolução também)
ping -c 4 google.com

# Caminho até um destino
traceroute google.com
mtr google.com           # tracert + ping em tempo real (q para sair)

# Quem está usando cada porta no SEU sistema
ss -tulpn
netstat -tulpn           # equivalente antigo

# Quem está conectado a uma porta específica
ss -tn dst :443          # conexões TCP para porta 443
lsof -i :22              # processo na porta 22`}
      />

      <h2>4. Descoberta de hosts vivos na sua rede</h2>
      <AlertBox type="warning" title="Só na sua rede ou em laboratório">
        Os comandos abaixo enviam pacotes para vários hosts. Em uma rede que
        não é sua, isso já configura "varredura" e pode ser detectado e/ou
        criminalizado. Use no seu Wi-Fi ou no seu laboratório.
      </AlertBox>

      <CodeBlock
        language="bash"
        code={`# arp-scan — rapidíssimo na rede local
sudo arp-scan -l                       # toda a sua rede
sudo arp-scan 192.168.1.0/24           # faixa específica

# netdiscover (modo passivo é totalmente discreto)
sudo netdiscover -p -i eth0            # passivo
sudo netdiscover -r 192.168.1.0/24     # ativo

# fping — paralelo, muito rápido
sudo apt install -y fping
fping -a -g 192.168.1.0/24 2>/dev/null

# nmap descoberta de hosts (sem scan de portas)
sudo nmap -sn 192.168.1.0/24`}
      />

      <h2>5. Captura de tráfego</h2>
      <CodeBlock
        language="bash"
        code={`# tcpdump — captura básica
sudo tcpdump -i eth0                   # toda a interface
sudo tcpdump -i eth0 -n                # sem resolver DNS (mais rápido)
sudo tcpdump -i eth0 port 80           # só porta 80
sudo tcpdump -i eth0 host 1.1.1.1      # só com 1.1.1.1
sudo tcpdump -i eth0 -w captura.pcap   # salvar arquivo

# Filtros mais finos
sudo tcpdump -i eth0 'tcp port 80 and host 1.1.1.1'
sudo tcpdump -i eth0 'not port 22'     # ignorar SSH
sudo tcpdump -i eth0 -A port 80        # ver payload em ASCII

# Abrir o pcap no Wireshark
wireshark captura.pcap`}
      />

      <h2>6. Tornar-se mais discreto (em laboratório!)</h2>
      <CodeBlock
        language="bash"
        code={`# Modo promíscuo (capturar tudo na rede)
sudo ip link set eth0 promisc on
sudo ip link set eth0 promisc off

# Trocar o MAC address
sudo ip link set eth0 down
sudo ip link set eth0 address 00:11:22:33:44:55
sudo ip link set eth0 up

# Com macchanger (mais simples)
sudo apt install -y macchanger
sudo macchanger -r eth0                # MAC aleatório
sudo macchanger -p eth0                # devolve o original
sudo macchanger -s eth0                # mostra o atual

# IP forwarding (para MITM)
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward`}
      />

      <h2>7. Proxies e anonimato</h2>
      <CodeBlock
        language="bash"
        code={`# Proxychains: encadear conexões através de proxies
sudoedit /etc/proxychains4.conf
# Na última linha adicione, por exemplo:
#   socks5 127.0.0.1 9050     (Tor)

# Subir o Tor
sudo systemctl start tor
sudo systemctl status tor

# Usar uma ferramenta atrás do Tor
proxychains curl https://check.torproject.org
proxychains nmap -sT -Pn 192.0.2.10`}
      />

      <AlertBox type="info" title="Próximos passos">
        Agora que você sabe descobrir IPs, mapear sua rede e capturar tráfego,
        a página de <strong>Nmap</strong> mostra como fazer varredura de
        portas e fingerprint de serviços. Antes de qualquer scan em alvo
        externo, releia o aviso legal.
      </AlertBox>
    </PageContainer>
  );
}
