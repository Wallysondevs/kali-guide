import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Redes() {
  return (
    <PageContainer
      title="Redes no Kali"
      subtitle="Interfaces, IP/rota, DNS, portas, NAT e modos de placa wifi — base de TUDO em pentest."
      difficulty="iniciante"
      timeToRead="18 min"
    >
      <h2>Descobrir interfaces e IPs</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ip addr show",
            out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 08:00:27:a4:b1:c9 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.42/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86147sec preferred_lft 86147sec
    inet6 fe80::a00:27ff:fea4:b1c9/64 scope link
       valid_lft forever preferred_lft forever
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP
    link/ether 08:00:27:de:ad:be brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.108/24 brd 192.168.1.255 scope global dynamic wlan0`,
            outType: "info",
          },
          {
            comment: "atalho mais resumido",
            cmd: "ip -br -c addr",
            out: `lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             192.168.1.42/24 fe80::a00:27ff:fea4:b1c9/64
wlan0            UP             192.168.1.108/24`,
            outType: "default",
          },
        ]}
      />

      <CommandTable
        title="Comandos modernos vs legados"
        variations={[
          { cmd: "ip addr  /  ip a", desc: "Endereços IP de cada interface (substitui ifconfig).", output: "Mais detalhado e suporta IPv6 nativamente." },
          { cmd: "ip route  /  ip r", desc: "Tabela de rotas (substitui route -n).", output: "default via 192.168.1.1 dev eth0" },
          { cmd: "ip link", desc: "Camada link (MAC, MTU, status UP/DOWN).", output: "= ifconfig só do link" },
          { cmd: "ss -tulpn", desc: "Sockets/portas abertas (substitui netstat).", output: "Mostra TCP/UDP listening + processo." },
          { cmd: "nmcli", desc: "Controla o NetworkManager (wifi, vpn, conexões).", output: "Padrão de fato no Kali desktop." },
        ]}
      />

      <h2>Configurar IP estático e DHCP</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "DHCP rápido (libera + pede novamente)",
            cmd: "sudo dhclient -r eth0 && sudo dhclient eth0",
            out: "(silencioso. ip addr deve mostrar IP novo em eth0)",
            outType: "default",
          },
          {
            comment: "definir IP estático manualmente (perde no reboot)",
            cmd: "sudo ip addr add 192.168.50.10/24 dev eth0",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
          {
            cmd: "sudo ip route add default via 192.168.50.1",
            out: "(silencioso. agora o gateway saiu para 192.168.50.1)",
            outType: "muted",
          },
          {
            cmd: "ip route",
            out: `default via 192.168.50.1 dev eth0
192.168.50.0/24 dev eth0 proto kernel scope link src 192.168.50.10
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.108`,
            outType: "info",
          },
          {
            comment: "remover IP",
            cmd: "sudo ip addr del 192.168.50.10/24 dev eth0",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h3>Persistir com NetworkManager (CLI)</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nmcli connection show",
            out: `NAME                UUID                                  TYPE      DEVICE
Wired connection 1  37c03f23-1e4c-3a78-be51-9c8c8d79f0a0  ethernet  eth0
HomeWifi            ad3c1845-cc54-4bf4-a3a9-5ed11f6a1db1  wifi      wlan0`,
            outType: "default",
          },
          {
            comment: "criar conexão estática que SOBE no boot",
            cmd: `sudo nmcli con add type ethernet con-name lab-static ifname eth0 \\
  ip4 192.168.50.10/24 gw4 192.168.50.1`,
            out: "Connection 'lab-static' (8a72b9f0-...) successfully added.",
            outType: "success",
          },
          {
            cmd: "sudo nmcli con mod lab-static ipv4.dns \"1.1.1.1 8.8.8.8\" ipv4.method manual",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo nmcli con up lab-static",
            out: "Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)",
            outType: "success",
          },
        ]}
      />

      <h2>DNS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat /etc/resolv.conf",
            out: `# Generated by NetworkManager
nameserver 1.1.1.1
nameserver 8.8.8.8
search localdomain`,
            outType: "default",
          },
          {
            cmd: "dig hackthebox.com +short",
            out: `104.18.20.243
104.18.21.243`,
            outType: "info",
          },
          {
            cmd: "dig MX gmail.com +short",
            out: `5 gmail-smtp-in.l.google.com.
10 alt1.gmail-smtp-in.l.google.com.
20 alt2.gmail-smtp-in.l.google.com.
30 alt3.gmail-smtp-in.l.google.com.
40 alt4.gmail-smtp-in.l.google.com.`,
            outType: "default",
          },
          {
            cmd: "host -a kali.org | head -8",
            out: `Trying "kali.org"
;; opcode: QUERY, status: NOERROR, id: 23981
;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 0

;; ANSWER SECTION:
kali.org.		180	IN	A	192.124.249.10
kali.org.		180	IN	NS	apollo.ns.cloudflare.com.
kali.org.		180	IN	NS	britney.ns.cloudflare.com.`,
            outType: "default",
          },
        ]}
      />

      <h2>Rede local — descobrir hosts</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ip route",
            out: `default via 192.168.1.1 dev eth0 proto dhcp
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.42`,
            outType: "default",
          },
          {
            comment: "descobrir vivos com nmap (-sn = no port scan, só ping ARP)",
            cmd: "sudo nmap -sn 192.168.1.0/24",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for 192.168.1.1
Host is up (0.0021s latency).
MAC Address: 24:5E:BE:1A:2C:01 (Zyxel Communications)
Nmap scan report for 192.168.1.42
Host is up.
Nmap scan report for 192.168.1.50
Host is up (0.0034s latency).
MAC Address: B0:35:9F:D3:7E:18 (Apple)
Nmap scan report for 192.168.1.108
Host is up (0.0011s latency).
MAC Address: 08:00:27:DE:AD:BE (PCS Computer Systems GmbH)
Nmap done: 256 IP addresses (4 hosts up) scanned in 4.21 seconds`,
            outType: "success",
          },
          {
            comment: "alternativa pura — arp-scan é mais rápido na LAN",
            cmd: "sudo arp-scan --localnet",
            out: `Interface: eth0, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.10.0
192.168.1.1     24:5e:be:1a:2c:01     Zyxel Communications Corporation
192.168.1.50    b0:35:9f:d3:7e:18     Apple, Inc.
192.168.1.108   08:00:27:de:ad:be     PCS Computer Systems GmbH

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan: 256 hosts scanned in 1.789 seconds (143.10 hosts/sec). 3 responded`,
            outType: "info",
          },
        ]}
      />

      <h2>Portas e serviços abertos</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "portas LOCAIS escutando",
            cmd: "sudo ss -tulpn",
            out: `Netid State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process
udp   UNCONN 0      0       127.0.0.53%lo:53         0.0.0.0:*          users:(("systemd-resolved",pid=719,fd=14))
tcp   LISTEN 0      4096    127.0.0.53%lo:53         0.0.0.0:*          users:(("systemd-resolved",pid=719,fd=15))
tcp   LISTEN 0      128           0.0.0.0:22         0.0.0.0:*          users:(("sshd",pid=1024,fd=3))
tcp   LISTEN 0      80          127.0.0.1:5432       0.0.0.0:*          users:(("postgres",pid=843,fd=6))
tcp   LISTEN 0      128              [::]:22            [::]:*          users:(("sshd",pid=1024,fd=4))`,
            outType: "info",
          },
          {
            comment: "portas REMOTAS de um alvo (4 portas mais comuns)",
            cmd: "nmap -p 22,80,443,3306 scanme.nmap.org",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.18s latency).

PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  closed   https
3306/tcp filtered mysql

Nmap done: 1 IP address (1 host up) scanned in 1.84 seconds`,
            outType: "success",
          },
        ]}
      />

      <h2>WiFi: do gerenciado ao monitor mode</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "iwconfig 2>/dev/null",
            out: `lo        no wireless extensions.
eth0      no wireless extensions.
wlan0     IEEE 802.11  ESSID:"HomeWifi"
          Mode:Managed  Frequency:2.437 GHz  Access Point: 24:5E:BE:1A:2C:01
          Bit Rate=72.2 Mb/s   Tx-Power=20 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:off
          Link Quality=70/70  Signal level=-31 dBm`,
            outType: "info",
          },
          {
            comment: "parar processos que mexem na placa",
            cmd: "sudo airmon-ng check kill",
            out: `Killing these processes:
    PID Name
   1234 wpa_supplicant
   1235 NetworkManager`,
            outType: "warning",
          },
          {
            cmd: "sudo airmon-ng start wlan0",
            out: `PHY     Interface       Driver          Chipset
phy0    wlan0           rt2800usb       Ralink Technology, Corp. RT5370
                (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)
                (mac80211 station mode vif disabled for [phy0]wlan0)`,
            outType: "success",
          },
          {
            cmd: "iwconfig wlan0mon | head -5",
            out: `wlan0mon  IEEE 802.11  Mode:Monitor  Frequency:2.437 GHz  Tx-Power=20 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:off`,
            outType: "info",
          },
          {
            comment: "voltar ao normal quando terminar",
            cmd: "sudo airmon-ng stop wlan0mon && sudo systemctl start NetworkManager",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Roteamento e NAT (laboratório)</h2>
      <CodeBlock
        language="bash"
        title="rotas e NAT manuais (Kali como gateway de uma VM isolada)"
        code={`# Habilitar IP forward
sudo sysctl -w net.ipv4.ip_forward=1

# Persistir
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.d/99-pentest.conf

# NAT (masquerade) saindo de eth0 para tudo que vier de eth1
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Adicionar rota para uma rede que não está no DHCP
sudo ip route add 10.10.10.0/24 via 192.168.1.50

# Remover rota
sudo ip route del 10.10.10.0/24`}
      />

      <h2>Diagnóstico</h2>
      <CommandTable
        title="Ferramentas de troubleshooting"
        variations={[
          { cmd: "ping -c 4 1.1.1.1", desc: "Conectividade IP pura.", output: "64 bytes from 1.1.1.1: icmp_seq=1 ttl=58 time=14.2 ms" },
          { cmd: "ping -c 4 google.com", desc: "Conectividade + DNS funcionando.", output: "Se IP pinga mas nome não, é DNS." },
          { cmd: "traceroute 8.8.8.8", desc: "Caminho até o destino, hop a hop.", output: " 1  192.168.1.1  1.234 ms\\n 2  100.64.0.1  8.92 ms\\n 3  *  *  *" },
          { cmd: "mtr 8.8.8.8", desc: "Traceroute ao vivo + perda por hop.", output: "Mostra perda de pacote em tempo real." },
          { cmd: "nmcli device wifi list", desc: "Lista WiFis ao alcance.", output: "BSSID  SSID  MODE  CHAN  RATE  SIGNAL  BARS  SECURITY" },
          { cmd: "tcpdump -i eth0 -nn port 80", desc: "Sniffa pacotes HTTP em texto cru.", output: "10:21:03.142 IP 192.168.1.42.51220 > 142.251.179.139.80: Flags [S]..." },
        ]}
      />

      <PracticeBox
        title="Identifique o pentester na rede"
        goal="Com sua máquina ligada, descobrir o IP do gateway e mapear hosts vivos da LAN."
        steps={[
          "Veja seu IP atual.",
          "Identifique o gateway padrão.",
          "Faça arp-scan no /24 da sua rede.",
          "Para cada host vivo, faça uma varredura rápida de portas com nmap.",
        ]}
        command={`ip -br addr
ip route | grep default
sudo arp-scan --localnet
sudo nmap -sV -F $(ip route | awk '/default/ {print $1}' | head -1)`}
        expected={`eth0    UP    192.168.1.42/24
default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.42 metric 100
192.168.1.1     24:5e:be:1a:2c:01     Zyxel Communications
192.168.1.50    b0:35:9f:d3:7e:18     Apple, Inc.

PORT     STATE  SERVICE  VERSION
22/tcp   open   ssh      OpenSSH 9.6p1
80/tcp   open   http     nginx 1.27.1`}
        verify="Ao final você deve ter: IP da máquina, gateway, lista de IPs vivos da LAN e portas abertas em pelo menos um deles."
      />

      <AlertBox type="warning" title="Pratique só na sua rede">
        Mapear hosts e portas em uma rede que não é sua é considerado scanning não-autorizado
        em vários países. Em laboratório (HTB, THM, sua LAN doméstica, sua VPN) está liberado.
      </AlertBox>
    </PageContainer>
  );
}
