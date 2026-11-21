import{j as e}from"./index-Bd5otbF3.js";import{P as i}from"./PageContainer-BFcnvssG.js";import{A as o}from"./AlertBox-CL6YULjX.js";import{C as a}from"./CodeBlock-C2J-D4l6.js";import{C as n}from"./CommandTable-BxJEHhQ9.js";import{T as t,P as s}from"./PracticeBox-Pst8IaIf.js";function m(){return e.jsxs(i,{title:"Netplan, NetworkManager & ip — configurar rede de verdade",subtitle:"No Kali o default é NetworkManager, em servidores Ubuntu é Netplan, e por baixo de tudo está iproute2. Saber pivotar entre os três é o que separa quem 'tem internet' de quem domina a interface de ataque.",difficulty:"intermediario",timeToRead:"22 min",children:[e.jsx("h2",{children:"Quem controla quem"}),e.jsxs("p",{children:["Toda distro moderna tem uma camada de ",e.jsx("em",{children:"backend"})," (kernel + iproute2) e uma camada de ",e.jsx("em",{children:"orquestração"})," que escreve nessa camada. No Kali o orquestrador padrão é o ",e.jsx("strong",{children:"NetworkManager"})," (com as CLIs ",e.jsx("code",{children:"nmcli"})," e ",e.jsx("code",{children:"nmtui"}),"). No Ubuntu Server, o ",e.jsx("strong",{children:"Netplan"})," gera arquivos para systemd-networkd ou para o próprio NetworkManager. E no fundo, sempre, está o ",e.jsx("code",{children:"ip"})," do iproute2."]}),e.jsxs("p",{children:["Como pentester você precisa dos três: ",e.jsx("code",{children:"ip"})," para mexer rápido (MAC spoof, VLAN tag, secondary IP), ",e.jsx("code",{children:"nmcli"})," para deixar persistente no Kali e",e.jsx("code",{children:"netplan"})," para entender o target Ubuntu que vai administrar (ou owna)."]}),e.jsx(t,{path:"~",lines:[{comment:"quem está dirigindo a rede agora?",cmd:"systemctl is-active NetworkManager systemd-networkd",out:`active
inactive`,outType:"info"},{cmd:"nmcli general status",out:`STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled`,outType:"success"}]}),e.jsx("h2",{children:"iproute2 — a base de tudo"}),e.jsxs("p",{children:["O comando ",e.jsx("code",{children:"ip"})," substituiu ",e.jsx("code",{children:"ifconfig"}),", ",e.jsx("code",{children:"route"}),",",e.jsx("code",{children:"arp"})," e ",e.jsx("code",{children:"iwconfig"})," (este último só pra wifi). Mexer com",e.jsx("code",{children:"ip"})," não persiste após reboot, mas é instantâneo — ideal para um pivot rápido."]}),e.jsx(n,{title:"ip — comandos do dia a dia ofensivo",variations:[{cmd:"ip -c a",desc:"Lista interfaces e IPs (-c colore).",output:`1: lo  inet 127.0.0.1/8
2: eth0  inet 192.168.56.10/24
3: wlan0  state DOWN`},{cmd:"ip -br a",desc:"Versão de uma linha por interface — ideal para script.",output:`lo   UNKNOWN  127.0.0.1/8
eth0 UP       192.168.56.10/24
wlan0 DOWN`},{cmd:"ip link set eth0 down && ip link set eth0 up",desc:"Ciclar interface (necessário após mudar MAC).",output:"(silencioso)"},{cmd:"ip addr add 10.10.14.50/23 dev tun0",desc:"Adicionar IP secundário (típico após conectar VPN HTB).",output:"(silencioso — confira com ip a)"},{cmd:"ip addr del 10.10.14.50/23 dev tun0",desc:"Remover IP.",output:"(silencioso)"},{cmd:"ip route",desc:"Tabela de rotas (substitui route -n).",output:"default via 192.168.56.1 dev eth0 proto dhcp metric 100"},{cmd:"ip route add 172.16.0.0/24 via 10.10.14.1 dev tun0",desc:"Rota estática para subnet do alvo via VPN.",output:"(silencioso)"},{cmd:"ip neigh",desc:"Cache ARP — substitui arp -a.",output:"192.168.56.1 dev eth0 lladdr 0a:00:27:00:00:01 REACHABLE"},{cmd:"ip -s link show eth0",desc:"Estatísticas (RX/TX bytes, errors, drops) da interface.",output:`RX: bytes packets errors dropped...
TX: ...`}]}),e.jsx("h2",{children:"NetworkManager via nmcli"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"nmcli"})," é a CLI persistente do Kali. Cada conexão criada vira um arquivo em",e.jsx("code",{children:"/etc/NetworkManager/system-connections/"})," e sobrevive a reboot."]}),e.jsx(t,{path:"~",lines:[{comment:"ver dispositivos e conexões ativas",cmd:"nmcli device status",out:`DEVICE  TYPE      STATE                   CONNECTION
eth0    ethernet  connected               Wired connection 1
wlan0   wifi      disconnected            --
lo      loopback  unmanaged               --`,outType:"info"},{cmd:"nmcli connection show",out:`NAME                 UUID                                  TYPE      DEVICE
Wired connection 1   3b1f5c4a-...                          ethernet  eth0
htb-vpn              a7e8c2d1-...                          vpn       --`,outType:"default"},{comment:"criar conexão Ethernet com IP estático persistente",cmd:`sudo nmcli connection add type ethernet ifname eth0 con-name lab-static \\
  ipv4.method manual ipv4.addresses 192.168.56.50/24 \\
  ipv4.gateway 192.168.56.1 ipv4.dns 1.1.1.1`,out:"Connection 'lab-static' (b2c8d9e0-...) successfully added.",outType:"success"},{cmd:"sudo nmcli connection up lab-static",out:"Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)",outType:"success"},{comment:"voltar ao DHCP é so apagar a conexao manual e subir a default",cmd:"sudo nmcli connection modify lab-static ipv4.method auto ipv4.addresses '' ipv4.gateway ''",out:"(silencioso)",outType:"muted"}]}),e.jsx("h3",{children:"Wifi com nmcli"}),e.jsx(t,{path:"~",lines:[{cmd:"nmcli device wifi list",out:`IN-USE  BSSID              SSID            MODE   CHAN  RATE        SIGNAL  BARS  SECURITY
        AA:BB:CC:11:22:33  PENTEST-LAB     Infra  6     270 Mbit/s  88      ▂▄▆█  WPA2
        AA:BB:CC:11:22:34  COFFEE_FREE     Infra  11    130 Mbit/s  62      ▂▄▆_  --`,outType:"info"},{cmd:"sudo nmcli device wifi connect PENTEST-LAB password 'Welcome2024!'",out:"Device 'wlan0' successfully activated with 'a1b2-...'.",outType:"success"}]}),e.jsx("h2",{children:"MAC spoofing com macchanger e nmcli"}),e.jsx("p",{children:"Trocar de MAC é hábito básico em pentest físico (acesso a rede via porta de switch), em wifi (evitar bloqueio por MAC), e em ataques NAC bypass."}),e.jsx(t,{path:"~",lines:[{cmd:"ip link show eth0 | grep ether",out:"    link/ether 08:00:27:1a:2b:3c brd ff:ff:ff:ff:ff:ff",outType:"default"},{comment:"via iproute2 — efêmero, não persiste",cmd:`sudo ip link set dev eth0 down
sudo ip link set dev eth0 address 02:11:22:33:44:55
sudo ip link set dev eth0 up`,out:"(silencioso — confirme com ip link)",outType:"muted"},{comment:"via macchanger — gera MAC plausível (mesmo OUI de fabricante real)",cmd:"sudo macchanger -A eth0",out:`Current MAC:   08:00:27:1a:2b:3c (CADMUS COMPUTER SYSTEMS)
Permanent MAC: 08:00:27:1a:2b:3c (CADMUS COMPUTER SYSTEMS)
New MAC:       00:1c:b3:77:e0:11 (Apple, Inc.)`,outType:"success"},{comment:"MAC randomizado a cada conexão wifi (anti-tracking)",cmd:"sudo nmcli connection modify 'Wired connection 1' 802-3-ethernet.cloned-mac-address random",out:"(silencioso)",outType:"muted"},{cmd:"sudo nmcli connection modify PENTEST-LAB 802-11-wireless.cloned-mac-address random",out:"(silencioso — Wifi agora subirá com MAC novo a cada reconexão)",outType:"muted"}]}),e.jsx(o,{type:"warning",title:"Cuidado com persistent vs cloned MAC",children:e.jsxs("p",{children:[e.jsx("code",{children:"permanent"})," é o MAC gravado em ROM da placa."," ",e.jsx("code",{children:"cloned-mac-address"})," é o que NetworkManager apresenta. Se você setar via ",e.jsx("code",{children:"ip link"})," mas o NM derrubar e subir a conexão, ele vai sobrescrever — sempre prefira configurar pelo NM se quer persistência."]})}),e.jsx("h2",{children:"VLAN tagging via ip"}),e.jsxs("p",{children:["Em pentest físico você frequentemente acha uma porta com 802.1Q tagged — só responde se você falar a VLAN certa. ",e.jsx("code",{children:"ip link add"})," resolve sem precisar de switch managed:"]}),e.jsx(t,{path:"~",lines:[{comment:"criar sub-interface VLAN 100 sobre eth0",cmd:`sudo ip link add link eth0 name eth0.100 type vlan id 100
sudo ip link set eth0.100 up
sudo dhclient eth0.100`,out:`(silencioso)
(silencioso)
(silencioso) - se houver DHCP na VLAN, agora você tem IP nela`,outType:"muted"},{cmd:"ip -br a show eth0.100",out:"eth0.100  UP  10.50.100.42/24",outType:"success"},{comment:"varrer apenas a VLAN nova",cmd:"sudo nmap -sn 10.50.100.0/24",out:`Nmap scan report for srv-files.lab (10.50.100.10)
Host is up (0.00031s latency).
Nmap scan report for srv-dc.lab (10.50.100.20)
Host is up (0.00029s latency).
Nmap done: 256 IP addresses (2 hosts up) scanned in 1.96 seconds`,outType:"info"},{comment:"remover quando terminar",cmd:"sudo ip link delete eth0.100",out:"(silencioso)",outType:"muted"}]}),e.jsx("h2",{children:"Netplan — o jeito Ubuntu Server"}),e.jsxs("p",{children:["No Kali você quase nunca usa Netplan, mas o alvo Linux que você vai pivotar usa. Netplan é só YAML em ",e.jsx("code",{children:"/etc/netplan/*.yaml"})," que gera config para",e.jsx("code",{children:"networkd"})," ou ",e.jsx("code",{children:"NetworkManager"})," (renderer)."]}),e.jsx(a,{language:"yaml",title:"/etc/netplan/01-static.yaml",code:`network:
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
`}),e.jsx(t,{path:"~",lines:[{comment:"valide ANTES de aplicar — netplan generate só renderiza",cmd:"sudo netplan generate",out:"(silencioso — gera /run/systemd/network/...)",outType:"muted"},{comment:"aplicar — tem rollback automático: 'try'",cmd:"sudo netplan try",out:`Do you want to keep these settings?

Press ENTER before the timeout to accept the new configuration

Changes will revert in  120 seconds`,outType:"warning"},{cmd:"sudo netplan apply",out:"(silencioso — aplica imediatamente, SEM rollback)",outType:"default"},{cmd:"networkctl status enp0s3",out:`● 2: enp0s3
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
         Gateway: 192.168.56.1`,outType:"info"}]}),e.jsx(o,{type:"danger",title:"netplan apply pode te trancar fora de SSH",children:e.jsxs("p",{children:["Em servidor remoto NUNCA rode ",e.jsx("code",{children:"netplan apply"})," direto. Use",e.jsx("code",{children:"netplan try"})," — se você não confirmar em 120s, ele reverte sozinho. Já vi pentester desconectar uma sessão de C2 por ter mexido em interface errada."]})}),e.jsx("h2",{children:"/etc/network/interfaces (legado)"}),e.jsxs("p",{children:["Em Debian antigo, Raspberry Pi OS, alguns Ubuntu Core e em containers minimalistas ainda existe ",e.jsx("code",{children:"ifupdown"})," com o histórico ",e.jsx("code",{children:"/etc/network/interfaces"}),". Como pentester você cai nele em IoT/embedded e em targets com kernel pequeno."]}),e.jsx(a,{language:"bash",title:"/etc/network/interfaces",code:`# loopback
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
`}),e.jsx(t,{path:"~",lines:[{cmd:"sudo ifup eth1 && sudo ifdown eth1 && sudo ifup eth1",out:"(silencioso quando dá certo — equivalente ao restart)",outType:"muted"}]}),e.jsx("h2",{children:"Diagnóstico de rede que SALVA pentest"}),e.jsx(n,{title:"Quando 'não tem internet' — checklist",variations:[{cmd:"ip a",desc:"Tem IP? Se não, problema é DHCP/cabo/wifi.",output:"Sem inet em eth0 → ninguém te deu IP."},{cmd:"ip route",desc:"Tem default gateway?",output:"Sem 'default via' → você sai pra lugar nenhum."},{cmd:"ping -c2 192.168.1.1",desc:"Gateway responde? (camada 2/3 LAN)",output:"Falhou → problema local. Funcionou → seu LAN ok."},{cmd:"ping -c2 1.1.1.1",desc:"Internet por IP funciona?",output:"Sim e DNS falha → problema é resolv.conf."},{cmd:"getent hosts kali.org",desc:"Resolução DNS via NSS funciona?",output:"Vazio → DNS quebrado. Veja /etc/resolv.conf."},{cmd:"ss -tunlp",desc:"Quem está escutando portas (TCP/UDP) com PID.",output:'tcp LISTEN 0 128 0.0.0.0:22 ... users:(("sshd",pid=812,fd=3))'},{cmd:"sudo tcpdump -i eth0 -n -c 20",desc:"Captura 20 pacotes pra ver se HÁ tráfego.",output:"Sem tráfego → cabo/driver. Com tráfego → problema é mais acima."}]}),e.jsx(s,{title:"Conecta o Kali numa VLAN tagged e roda recon nela",goal:"Simular acesso físico a uma porta trunk: criar sub-interface VLAN, pegar IP, varrer.",steps:["Confirme a interface principal e o estado atual (ip -br a).","Crie sub-interface VLAN 50 sobre eth0 (id 50).","Suba a interface e tente DHCP (assumindo que existe servidor na VLAN).","Verifique IP recebido e rode arp-scan na VLAN nova.","Quando terminar, derrube e remova a sub-interface (limpeza = OPSEC)."],command:`ip -br a
sudo ip link add link eth0 name eth0.50 type vlan id 50
sudo ip link set eth0.50 up
sudo dhclient -v eth0.50
ip -br a show eth0.50
sudo arp-scan --interface=eth0.50 --localnet
sudo ip link delete eth0.50`,expected:`eth0     UP   192.168.56.10/24
eth0.50  UP   10.50.50.43/24

Interface: eth0.50, type: EN10MB, MAC: 08:00:27:1a:2b:3c, IPv4: 10.50.50.43
Starting arp-scan 1.10.0 with 254 hosts
10.50.50.1   00:0c:29:11:22:33  VMware, Inc.
10.50.50.10  00:50:56:aa:bb:cc  VMware, Inc.

3 packets received by filter`,verify:"Se você ver hosts na VLAN nova, confirma que o switch está enviando frames tagged na sua porta — você acabou de pular para outra zona de rede sem precisar de switch managed."}),e.jsx(o,{type:"info",title:"OPSEC: limpe interfaces criadas",children:e.jsxs("p",{children:["Depois de testes em cliente, REMOVA todo IP secundário, sub-interface VLAN e altere MAC para o original. Auditor de blue team vai notar uma interface",e.jsx("code",{children:"eth0.50"})," aparecendo nos logs do switch."]})})]})}export{m as default};
