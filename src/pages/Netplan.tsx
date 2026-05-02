import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Netplan() {
  return (
    <PageContainer
      title="Netplan, NetworkManager & ip — configurar rede de verdade"
      subtitle="No Kali o default é NetworkManager, em servidores Ubuntu é Netplan, e por baixo de tudo está iproute2. Saber pivotar entre os três é o que separa quem 'tem internet' de quem domina a interface de ataque."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Quem controla quem</h2>
      <p>
        Toda distro moderna tem uma camada de <em>backend</em> (kernel + iproute2) e uma camada
        de <em>orquestração</em> que escreve nessa camada. No Kali o orquestrador padrão é
        o <strong>NetworkManager</strong> (com as CLIs <code>nmcli</code> e <code>nmtui</code>).
        No Ubuntu Server, o <strong>Netplan</strong> gera arquivos para systemd-networkd ou para
        o próprio NetworkManager. E no fundo, sempre, está o <code>ip</code> do iproute2.
      </p>
      <p>
        Como pentester você precisa dos três: <code>ip</code> para mexer rápido (MAC spoof,
        VLAN tag, secondary IP), <code>nmcli</code> para deixar persistente no Kali e
        <code>netplan</code> para entender o target Ubuntu que vai administrar (ou owna).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "quem está dirigindo a rede agora?",
            cmd: "systemctl is-active NetworkManager systemd-networkd",
            out: `active
inactive`,
            outType: "info",
          },
          {
            cmd: "nmcli general status",
            out: `STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled`,
            outType: "success",
          },
        ]}
      />

      <h2>iproute2 — a base de tudo</h2>
      <p>
        O comando <code>ip</code> substituiu <code>ifconfig</code>, <code>route</code>,
        <code>arp</code> e <code>iwconfig</code> (este último só pra wifi). Mexer com
        <code>ip</code> não persiste após reboot, mas é instantâneo — ideal para um pivot rápido.
      </p>

      <CommandTable
        title="ip — comandos do dia a dia ofensivo"
        variations={[
          {
            cmd: "ip -c a",
            desc: "Lista interfaces e IPs (-c colore).",
            output: "1: lo  inet 127.0.0.1/8\n2: eth0  inet 192.168.56.10/24\n3: wlan0  state DOWN",
          },
          {
            cmd: "ip -br a",
            desc: "Versão de uma linha por interface — ideal para script.",
            output: "lo   UNKNOWN  127.0.0.1/8\neth0 UP       192.168.56.10/24\nwlan0 DOWN",
          },
          {
            cmd: "ip link set eth0 down && ip link set eth0 up",
            desc: "Ciclar interface (necessário após mudar MAC).",
            output: "(silencioso)",
          },
          {
            cmd: "ip addr add 10.10.14.50/23 dev tun0",
            desc: "Adicionar IP secundário (típico após conectar VPN HTB).",
            output: "(silencioso — confira com ip a)",
          },
          {
            cmd: "ip addr del 10.10.14.50/23 dev tun0",
            desc: "Remover IP.",
            output: "(silencioso)",
          },
          {
            cmd: "ip route",
            desc: "Tabela de rotas (substitui route -n).",
            output: "default via 192.168.56.1 dev eth0 proto dhcp metric 100",
          },
          {
            cmd: "ip route add 172.16.0.0/24 via 10.10.14.1 dev tun0",
            desc: "Rota estática para subnet do alvo via VPN.",
            output: "(silencioso)",
          },
          {
            cmd: "ip neigh",
            desc: "Cache ARP — substitui arp -a.",
            output: "192.168.56.1 dev eth0 lladdr 0a:00:27:00:00:01 REACHABLE",
          },
          {
            cmd: "ip -s link show eth0",
            desc: "Estatísticas (RX/TX bytes, errors, drops) da interface.",
            output: "RX: bytes packets errors dropped...\nTX: ...",
          },
        ]}
      />

      <h2>NetworkManager via nmcli</h2>
      <p>
        O <code>nmcli</code> é a CLI persistente do Kali. Cada conexão criada vira um arquivo em
        <code>/etc/NetworkManager/system-connections/</code> e sobrevive a reboot.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver dispositivos e conexões ativas",
            cmd: "nmcli device status",
            out: `DEVICE  TYPE      STATE                   CONNECTION
eth0    ethernet  connected               Wired connection 1
wlan0   wifi      disconnected            --
lo      loopback  unmanaged               --`,
            outType: "info",
          },
          {
            cmd: "nmcli connection show",
            out: `NAME                 UUID                                  TYPE      DEVICE
Wired connection 1   3b1f5c4a-...                          ethernet  eth0
htb-vpn              a7e8c2d1-...                          vpn       --`,
            outType: "default",
          },
          {
            comment: "criar conexão Ethernet com IP estático persistente",
            cmd: "sudo nmcli connection add type ethernet ifname eth0 con-name lab-static \\\n  ipv4.method manual ipv4.addresses 192.168.56.50/24 \\\n  ipv4.gateway 192.168.56.1 ipv4.dns 1.1.1.1",
            out: "Connection 'lab-static' (b2c8d9e0-...) successfully added.",
            outType: "success",
          },
          {
            cmd: "sudo nmcli connection up lab-static",
            out: "Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)",
            outType: "success",
          },
          {
            comment: "voltar ao DHCP é so apagar a conexao manual e subir a default",
            cmd: "sudo nmcli connection modify lab-static ipv4.method auto ipv4.addresses '' ipv4.gateway ''",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h3>Wifi com nmcli</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nmcli device wifi list",
            out: `IN-USE  BSSID              SSID            MODE   CHAN  RATE        SIGNAL  BARS  SECURITY
        AA:BB:CC:11:22:33  PENTEST-LAB     Infra  6     270 Mbit/s  88      ▂▄▆█  WPA2
        AA:BB:CC:11:22:34  COFFEE_FREE     Infra  11    130 Mbit/s  62      ▂▄▆_  --`,
            outType: "info",
          },
          {
            cmd: "sudo nmcli device wifi connect PENTEST-LAB password 'Welcome2024!'",
            out: "Device 'wlan0' successfully activated with 'a1b2-...'.",
            outType: "success",
          },
        ]}
      />

      <h2>MAC spoofing com macchanger e nmcli</h2>
      <p>
        Trocar de MAC é hábito básico em pentest físico (acesso a rede via porta de switch),
        em wifi (evitar bloqueio por MAC), e em ataques NAC bypass.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ip link show eth0 | grep ether",
            out: "    link/ether 08:00:27:1a:2b:3c brd ff:ff:ff:ff:ff:ff",
            outType: "default",
          },
          {
            comment: "via iproute2 — efêmero, não persiste",
            cmd: "sudo ip link set dev eth0 down\nsudo ip link set dev eth0 address 02:11:22:33:44:55\nsudo ip link set dev eth0 up",
            out: "(silencioso — confirme com ip link)",
            outType: "muted",
          },
          {
            comment: "via macchanger — gera MAC plausível (mesmo OUI de fabricante real)",
            cmd: "sudo macchanger -A eth0",
            out: `Current MAC:   08:00:27:1a:2b:3c (CADMUS COMPUTER SYSTEMS)
Permanent MAC: 08:00:27:1a:2b:3c (CADMUS COMPUTER SYSTEMS)
New MAC:       00:1c:b3:77:e0:11 (Apple, Inc.)`,
            outType: "success",
          },
          {
            comment: "MAC randomizado a cada conexão wifi (anti-tracking)",
            cmd: "sudo nmcli connection modify 'Wired connection 1' 802-3-ethernet.cloned-mac-address random",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo nmcli connection modify PENTEST-LAB 802-11-wireless.cloned-mac-address random",
            out: "(silencioso — Wifi agora subirá com MAC novo a cada reconexão)",
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="warning" title="Cuidado com persistent vs cloned MAC">
        <p>
          <code>permanent</code> é o MAC gravado em ROM da placa.{" "}
          <code>cloned-mac-address</code> é o que NetworkManager apresenta. Se você setar
          via <code>ip link</code> mas o NM derrubar e subir a conexão, ele vai
          sobrescrever — sempre prefira configurar pelo NM se quer persistência.
        </p>
      </AlertBox>

      <h2>VLAN tagging via ip</h2>
      <p>
        Em pentest físico você frequentemente acha uma porta com 802.1Q tagged — só
        responde se você falar a VLAN certa. <code>ip link add</code> resolve sem precisar
        de switch managed:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "criar sub-interface VLAN 100 sobre eth0",
            cmd: "sudo ip link add link eth0 name eth0.100 type vlan id 100\nsudo ip link set eth0.100 up\nsudo dhclient eth0.100",
            out: `(silencioso)
(silencioso)
(silencioso) - se houver DHCP na VLAN, agora você tem IP nela`,
            outType: "muted",
          },
          {
            cmd: "ip -br a show eth0.100",
            out: "eth0.100  UP  10.50.100.42/24",
            outType: "success",
          },
          {
            comment: "varrer apenas a VLAN nova",
            cmd: "sudo nmap -sn 10.50.100.0/24",
            out: `Nmap scan report for srv-files.lab (10.50.100.10)
Host is up (0.00031s latency).
Nmap scan report for srv-dc.lab (10.50.100.20)
Host is up (0.00029s latency).
Nmap done: 256 IP addresses (2 hosts up) scanned in 1.96 seconds`,
            outType: "info",
          },
          {
            comment: "remover quando terminar",
            cmd: "sudo ip link delete eth0.100",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Netplan — o jeito Ubuntu Server</h2>
      <p>
        No Kali você quase nunca usa Netplan, mas o alvo Linux que você vai pivotar usa.
        Netplan é só YAML em <code>/etc/netplan/*.yaml</code> que gera config para
        <code>networkd</code> ou <code>NetworkManager</code> (renderer).
      </p>

      <CodeBlock
        language="yaml"
        title="/etc/netplan/01-static.yaml"
        code={`network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      dhcp4: false
      addresses:
        - 192.168.56.50/24
      routes:
        - to: default
          via: 192.168.56.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 9.9.9.9
    enp0s8:
      dhcp4: true
  vlans:
    vlan100:
      id: 100
      link: enp0s3
      addresses:
        - 10.50.100.50/24
`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "valide ANTES de aplicar — netplan generate só renderiza",
            cmd: "sudo netplan generate",
            out: "(silencioso — gera /run/systemd/network/...)",
            outType: "muted",
          },
          {
            comment: "aplicar — tem rollback automático: 'try'",
            cmd: "sudo netplan try",
            out: `Do you want to keep these settings?

Press ENTER before the timeout to accept the new configuration

Changes will revert in  120 seconds`,
            outType: "warning",
          },
          {
            cmd: "sudo netplan apply",
            out: "(silencioso — aplica imediatamente, SEM rollback)",
            outType: "default",
          },
          {
            cmd: "networkctl status enp0s3",
            out: `● 2: enp0s3
       Link File: /usr/lib/systemd/network/99-default.link
    Network File: /run/systemd/network/10-netplan-enp0s3.network
            Type: ether
           State: routable (configured)
            Path: pci-0000:00:03.0
          Driver: e1000
          Vendor: Intel Corporation
        HW Addr: 08:00:27:1a:2b:3c
             MTU: 1500
         Address: 192.168.56.50
         Gateway: 192.168.56.1`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="danger" title="netplan apply pode te trancar fora de SSH">
        <p>
          Em servidor remoto NUNCA rode <code>netplan apply</code> direto. Use
          <code>netplan try</code> — se você não confirmar em 120s, ele reverte sozinho.
          Já vi pentester desconectar uma sessão de C2 por ter mexido em interface errada.
        </p>
      </AlertBox>

      <h2>/etc/network/interfaces (legado)</h2>
      <p>
        Em Debian antigo, Raspberry Pi OS, alguns Ubuntu Core e em containers minimalistas
        ainda existe <code>ifupdown</code> com o histórico <code>/etc/network/interfaces</code>.
        Como pentester você cai nele em IoT/embedded e em targets com kernel pequeno.
      </p>

      <CodeBlock
        language="bash"
        title="/etc/network/interfaces"
        code={`# loopback
auto lo
iface lo inet loopback

# DHCP simples
auto eth0
iface eth0 inet dhcp

# IP estático
auto eth1
iface eth1 inet static
    address 10.20.30.40
    netmask 255.255.255.0
    gateway 10.20.30.1
    dns-nameservers 1.1.1.1 9.9.9.9
    # rota extra
    post-up ip route add 172.16.0.0/16 via 10.20.30.254 || true
    pre-down ip route del 172.16.0.0/16 || true
`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ifup eth1 && sudo ifdown eth1 && sudo ifup eth1",
            out: "(silencioso quando dá certo — equivalente ao restart)",
            outType: "muted",
          },
        ]}
      />

      <h2>Diagnóstico de rede que SALVA pentest</h2>
      <CommandTable
        title="Quando 'não tem internet' — checklist"
        variations={[
          {
            cmd: "ip a",
            desc: "Tem IP? Se não, problema é DHCP/cabo/wifi.",
            output: "Sem inet em eth0 → ninguém te deu IP.",
          },
          {
            cmd: "ip route",
            desc: "Tem default gateway?",
            output: "Sem 'default via' → você sai pra lugar nenhum.",
          },
          {
            cmd: "ping -c2 192.168.1.1",
            desc: "Gateway responde? (camada 2/3 LAN)",
            output: "Falhou → problema local. Funcionou → seu LAN ok.",
          },
          {
            cmd: "ping -c2 1.1.1.1",
            desc: "Internet por IP funciona?",
            output: "Sim e DNS falha → problema é resolv.conf.",
          },
          {
            cmd: "getent hosts kali.org",
            desc: "Resolução DNS via NSS funciona?",
            output: "Vazio → DNS quebrado. Veja /etc/resolv.conf.",
          },
          {
            cmd: "ss -tunlp",
            desc: "Quem está escutando portas (TCP/UDP) com PID.",
            output: "tcp LISTEN 0 128 0.0.0.0:22 ... users:((\"sshd\",pid=812,fd=3))",
          },
          {
            cmd: "sudo tcpdump -i eth0 -n -c 20",
            desc: "Captura 20 pacotes pra ver se HÁ tráfego.",
            output: "Sem tráfego → cabo/driver. Com tráfego → problema é mais acima.",
          },
        ]}
      />

      <PracticeBox
        title="Conecta o Kali numa VLAN tagged e roda recon nela"
        goal="Simular acesso físico a uma porta trunk: criar sub-interface VLAN, pegar IP, varrer."
        steps={[
          "Confirme a interface principal e o estado atual (ip -br a).",
          "Crie sub-interface VLAN 50 sobre eth0 (id 50).",
          "Suba a interface e tente DHCP (assumindo que existe servidor na VLAN).",
          "Verifique IP recebido e rode arp-scan na VLAN nova.",
          "Quando terminar, derrube e remova a sub-interface (limpeza = OPSEC).",
        ]}
        command={`ip -br a
sudo ip link add link eth0 name eth0.50 type vlan id 50
sudo ip link set eth0.50 up
sudo dhclient -v eth0.50
ip -br a show eth0.50
sudo arp-scan --interface=eth0.50 --localnet
sudo ip link delete eth0.50`}
        expected={`eth0     UP   192.168.56.10/24
eth0.50  UP   10.50.50.43/24

Interface: eth0.50, type: EN10MB, MAC: 08:00:27:1a:2b:3c, IPv4: 10.50.50.43
Starting arp-scan 1.10.0 with 254 hosts
10.50.50.1   00:0c:29:11:22:33  VMware, Inc.
10.50.50.10  00:50:56:aa:bb:cc  VMware, Inc.

3 packets received by filter`}
        verify="Se você ver hosts na VLAN nova, confirma que o switch está enviando frames tagged na sua porta — você acabou de pular para outra zona de rede sem precisar de switch managed."
      />

      <AlertBox type="info" title="OPSEC: limpe interfaces criadas">
        <p>
          Depois de testes em cliente, REMOVA todo IP secundário, sub-interface VLAN
          e altere MAC para o original. Auditor de blue team vai notar uma interface
          <code>eth0.50</code> aparecendo nos logs do switch.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
