import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function VPN() {
  return (
    <PageContainer
      title="VPN no Kali — OpenVPN, WireGuard, kill-switch"
      subtitle="HackTheBox, TryHackMe, OffSec PG, redes corporativas de cliente: pentest hoje começa em uma VPN. Saber configurar, isolar e cortar trafego é OPSEC básico."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Por que se importar com a VPN</h2>
      <p>
        Em pentest profissional, a VPN é a porta. Se ela cair sem kill-switch, seu
        IP residencial vaza no log do alvo. Se você esquecer split tunneling, sua
        Netflix passa pelo lab. Se você não isolar interfaces, seu C2 pode tentar sair
        pelo gateway errado. VPN configurada errada = pentester pego pela própria pegada.
      </p>

      <h2>OpenVPN — o padrão histórico</h2>
      <p>
        OpenVPN roda em userspace (libssl), interface <code>tun0</code>/<code>tap0</code>,
        usa OpenSSL para crypto. É o que HTB e THM entregam por default.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y openvpn openvpn-systemd-resolved",
            out: `Reading package lists... Done
openvpn is already the newest version (2.6.12-1).`,
            outType: "muted",
          },
          {
            comment: "uso clássico — foreground, segura o terminal",
            cmd: "sudo openvpn --config htb.ovpn",
            out: `2026-04-03 10:11:42 OpenVPN 2.6.12 [git:makepkg/...] x86_64-pc-linux-gnu
2026-04-03 10:11:42 library versions: OpenSSL 3.4.0, LZO 2.10
2026-04-03 10:11:42 TCP/UDP: Preserving recently used remote address: [AF_INET]edge-eu-vip-1.htb.eu:1337
2026-04-03 10:11:42 UDPv4 link local: (not bound)
2026-04-03 10:11:42 UDPv4 link remote: [AF_INET]185.181.1.10:1337
2026-04-03 10:11:43 [HackTheBox] Peer Connection Initiated with [AF_INET]185.181.1.10:1337
2026-04-03 10:11:44 TUN/TAP device tun0 opened
2026-04-03 10:11:44 net_iface_mtu_set: mtu 1500 set dev tun0
2026-04-03 10:11:44 net_addr_v4_add: 10.10.14.50/23 dev tun0
2026-04-03 10:11:44 Initialization Sequence Completed`,
            outType: "success",
          },
          {
            comment: "em outro terminal, confirme",
            cmd: "ip -br a show tun0",
            out: "tun0  UNKNOWN  10.10.14.50/23",
            outType: "info",
          },
          {
            cmd: "ping -c2 10.10.10.1",
            out: `PING 10.10.10.1 (10.10.10.1) 56(84) bytes of data.
64 bytes from 10.10.10.1: icmp_seq=1 ttl=63 time=42.1 ms
64 bytes from 10.10.10.1: icmp_seq=2 ttl=63 time=41.8 ms`,
            outType: "success",
          },
        ]}
      />

      <h3>OpenVPN como serviço (background)</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "copie o .ovpn para o lugar certo",
            cmd: "sudo cp htb.ovpn /etc/openvpn/client/htb.conf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo systemctl enable --now openvpn-client@htb",
            out: "Created symlink /etc/systemd/system/multi-user.target.wants/openvpn-client@htb.service ...",
            outType: "success",
          },
          {
            cmd: "systemctl status openvpn-client@htb --no-pager",
            out: `● openvpn-client@htb.service - OpenVPN tunnel for htb
     Loaded: loaded (/usr/lib/systemd/system/openvpn-client@.service)
     Active: active (running) since Fri 2026-04-03 10:14:18 -03; 12s ago
   Main PID: 18241 (openvpn)
     Status: "Initialization Sequence Completed"`,
            outType: "info",
          },
          {
            cmd: "journalctl -u openvpn-client@htb -f",
            out: "(acompanha logs, Ctrl+C sai)",
            outType: "muted",
          },
        ]}
      />

      <h2>Anatomia de um .ovpn</h2>
      <CodeBlock
        language="bash"
        title="htb.ovpn (anotado)"
        code={`client                                 # somos cliente, não servidor
dev tun                                # interface túnel ip (não tap/L2)
proto udp                              # UDP é mais rápido; .ovpn de TCP existe
remote edge-eu-vip-1.htb.eu 1337       # endpoint do servidor

resolv-retry infinite
nobind                                 # não bind em porta local fixa
persist-key
persist-tun
remote-cert-tls server                 # checa certificado peer

cipher AES-256-CBC                     # depreciado mas comum em legacy
auth SHA512
verb 3

# === credenciais ===
<ca>
-----BEGIN CERTIFICATE-----
MIID...                                # CA do provedor
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIID...                                # seu cert
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIE...                                # SUA private key — guarde!
-----END PRIVATE KEY-----
</key>
<tls-auth>
-----BEGIN OpenVPN Static key V1-----
abcd...                                # HMAC anti-DoS
-----END OpenVPN Static key V1-----
</tls-auth>
key-direction 1`}
      />

      <AlertBox type="warning" title="Trate o .ovpn como senha">
        <p>
          Quem tem o seu <code>.ovpn</code> pode entrar no lab passando por VOCÊ —
          IP, sessões existentes, tudo. Permissões devem ser{" "}
          <code>chmod 600</code>. Não suba pra GitHub. Não cole no Discord.
        </p>
      </AlertBox>

      <h2>WireGuard — o padrão moderno</h2>
      <p>
        WireGuard vive no kernel desde 5.6, é 4000 linhas de código (vs 100k do OpenVPN),
        usa Curve25519/ChaCha20-Poly1305. Conexão é stateless (UDP), reconecta
        instantaneamente após mudança de rede. THM e algumas redes de cliente
        já entregam <code>.conf</code> WireGuard.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y wireguard wireguard-tools",
            out: "(já vem em quase toda Kali rolling)",
            outType: "muted",
          },
          {
            comment: "gerar par de chaves",
            cmd: "wg genkey | tee privatekey | wg pubkey > publickey",
            out: "(silencioso — agora você tem privatekey e publickey)",
            outType: "muted",
          },
          {
            cmd: "cat privatekey publickey",
            out: `qN8r7c6yJ2PqW3eYzG4HxLkA9mFjV0sR1tBcD5uVwI0=
mP2x4t6yU8nBfLh1qZ7sJaR3vK0wD9eC5rA2tWyXi8E=`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="ini"
        title="/etc/wireguard/lab.conf"
        code={`[Interface]
PrivateKey = qN8r7c6yJ2PqW3eYzG4HxLkA9mFjV0sR1tBcD5uVwI0=
Address    = 10.66.66.5/32
DNS        = 10.66.66.1

[Peer]
PublicKey  = SERVIDOR_PUBKEY_AQUI=
Endpoint   = vpn.lab.local:51820
AllowedIPs = 10.0.0.0/8, 172.16.0.0/12   # SPLIT TUNNEL — só lab
# Para FULL tunnel (tudo via VPN), use:  AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25                 # mantém NAT aberto`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo wg-quick up lab",
            out: `[#] ip link add lab type wireguard
[#] wg setconf lab /dev/fd/63
[#] ip -4 address add 10.66.66.5/32 dev lab
[#] ip link set mtu 1420 up dev lab
[#] resolvconf -a lab -m 0 -x
[#] ip -4 route add 10.0.0.0/8 dev lab
[#] ip -4 route add 172.16.0.0/12 dev lab`,
            outType: "success",
          },
          {
            cmd: "sudo wg show lab",
            out: `interface: lab
  public key: mP2x4t6yU8nBfLh1qZ7sJaR3vK0wD9eC5rA2tWyXi8E=
  private key: (hidden)
  listening port: 47352

peer: SERVIDOR_PUBKEY_AQUI=
  endpoint: 203.0.113.10:51820
  allowed ips: 10.0.0.0/8, 172.16.0.0/12
  latest handshake: 4 seconds ago
  transfer: 1.45 KiB received, 1.96 KiB sent
  persistent keepalive: every 25 seconds`,
            outType: "info",
          },
          {
            cmd: "sudo wg-quick down lab",
            out: "(desliga e remove rotas adicionadas)",
            outType: "muted",
          },
          {
            comment: "service mode (sobe no boot)",
            cmd: "sudo systemctl enable --now wg-quick@lab",
            out: "Created symlink ...",
            outType: "default",
          },
        ]}
      />

      <h2>Split tunnel vs Full tunnel</h2>
      <CommandTable
        title="Quando usar cada um"
        variations={[
          {
            cmd: "Split (AllowedIPs = subnet do alvo)",
            desc: "Só tráfego do lab passa pela VPN. Resto sai pelo seu link normal.",
            output: "✓ Performance\n✓ Streaming/voz não trava\n✗ Risco de vazar IP real se digitar IP errado",
          },
          {
            cmd: "Full (AllowedIPs = 0.0.0.0/0)",
            desc: "TUDO sai pela VPN. Sua conexão vira a do servidor.",
            output: "✓ OPSEC máxima\n✓ Único IP exposto = exit node\n✗ Latência alta\n✗ Bloqueia VoIP/streaming local",
          },
          {
            cmd: "Híbrido (lab + Tor + 0.0.0.0/0)",
            desc: "Pentest crítico: lab via VPN, resto via Tor.",
            output: "Use namespaces (ip netns) para garantir.",
          },
        ]}
      />

      <h2>Kill-switch — não vaze IP residencial</h2>
      <p>
        O conceito é simples: se a interface VPN cair, o firewall bloqueia TODO o
        tráfego de saída por interfaces que não sejam ela. Sem VPN = sem internet,
        garantido.
      </p>

      <CodeBlock
        language="bash"
        title="vpn-killswitch.sh (UFW + ip rule)"
        code={`#!/usr/bin/env bash
# Kill-switch agressivo: nada sai sem ser pelo tun0
# Permite SOMENTE: loopback, DHCP local, conexão pro endpoint da VPN, e tun0.

set -euo pipefail
VPN_ENDPOINT="185.181.1.10"   # IP do servidor VPN
VPN_PORT="1337"
LOCAL_NET="192.168.0.0/16"    # ajuste pra sua LAN

# limpa
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default deny outgoing

# essencial
sudo ufw allow out on lo
sudo ufw allow out to $LOCAL_NET                       # LAN, pra SSH local etc
sudo ufw allow out to 224.0.0.0/4                       # multicast
sudo ufw allow out to $VPN_ENDPOINT port $VPN_PORT      # endpoint da VPN
sudo ufw allow out on tun0                              # uma vez na VPN, libera

# DNS — bloqueia plain mas deixa via tun0
sudo ufw deny out 53
sudo ufw allow out on tun0 to any port 53

sudo ufw enable
sudo ufw status verbose`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ./vpn-killswitch.sh",
            out: `Resetting all rules to installed defaults. Proceed with operation (y|n)? y
Default outgoing policy changed to 'deny'
Rule added
Status: active

To                         Action      From
--                         ------      ----
Anywhere on lo             ALLOW OUT   Anywhere
192.168.0.0/16             ALLOW OUT   Anywhere
185.181.1.10 1337          ALLOW OUT   Anywhere
Anywhere on tun0           ALLOW OUT   Anywhere`,
            outType: "warning",
          },
          {
            comment: "teste: derrube a VPN e tente curl externa",
            cmd: "sudo systemctl stop openvpn-client@htb && curl -m5 https://api.ipify.org",
            out: `curl: (28) Failed to connect to api.ipify.org port 443 after 5001 ms: Couldn't connect to server`,
            outType: "error",
          },
          {
            comment: "perfeito — sem VPN, sem internet. Restabeleça VPN:",
            cmd: "sudo systemctl start openvpn-client@htb && sleep 3 && curl -s https://api.ipify.org",
            out: "10.10.14.50",
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Alternativa kernel-pure: ip rule + table">
        <p>
          Pra setup elegante use <code>ip rule</code> e <code>ip route table</code>{" "}
          dedicadas. WireGuard inclusive já faz isso com{" "}
          <code>Table = off</code> no <code>.conf</code> + suas próprias rotas.
        </p>
      </AlertBox>

      <h2>Multiplas VPNs — namespaces de rede</h2>
      <p>
        Cenário real: você está conectado em 2 clientes diferentes ao mesmo tempo.
        IPs sobrepostos (todo cliente usa <code>192.168.1.0/24</code>). Solução:
        <code>ip netns</code> isola pilhas TCP/IP completas.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ip netns add cliente-a",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo ip netns list",
            out: "cliente-a",
            outType: "info",
          },
          {
            comment: "rodar a VPN do cliente A DENTRO do namespace",
            cmd: "sudo ip netns exec cliente-a openvpn --config cliente-a.ovpn &",
            out: "(VPN só existe dentro do namespace cliente-a)",
            outType: "default",
          },
          {
            comment: "abrir um shell no namespace e rodar tools",
            cmd: "sudo ip netns exec cliente-a bash",
            out: `# dentro do namespace você só vê tun0_a
# ip a → mostra apenas a interface do cliente A
# nmap rodado aqui SAI APENAS por essa VPN`,
            outType: "warning",
          },
        ]}
      />

      <h2>Diagnóstico de VPN quebrada</h2>
      <CommandTable
        title="Checklist quando 'a VPN não conecta'"
        variations={[
          {
            cmd: "ping <endpoint>",
            desc: "O servidor VPN responde sequer?",
            output: "Falha → firewall bloqueia ICMP (não conclusivo). Tente nc.",
          },
          {
            cmd: "nc -uvz vpn.lab.com 1194",
            desc: "Porta UDP do OpenVPN aberta? (-u UDP, -v verbose, -z só scan)",
            output: "Connection succeeded → ok. Connection refused → bloqueio.",
          },
          {
            cmd: "sudo tcpdump -i any -n udp port 1194",
            desc: "Vê pacotes saindo? Vê pacotes voltando?",
            output: "Só TX = pacote sendo dropado no caminho.",
          },
          {
            cmd: "ip route get 10.10.10.1",
            desc: "Para onde a sua rota envia o IP do alvo?",
            output: "Deve ser 'dev tun0'. Se vai por eth0 = rota não foi instalada.",
          },
          {
            cmd: "sudo journalctl -u openvpn-client@htb -n50",
            desc: "Erro de cert? Erro de auth? TLS handshake fail?",
            output: "TLS Error: TLS handshake failed → cert errado/expirado.",
          },
          {
            cmd: "openvpn --show-ciphers",
            desc: "Cipher suportado pelo seu binário (incompatibilidade legacy).",
            output: "Lista todos. Se .ovpn pede um que não existe, conexão morre.",
          },
          {
            cmd: "wg show",
            desc: "WireGuard: ' latest handshake' deve ser recente.",
            output: "'(none)' = handshake nunca aconteceu. Cheque pubkey/endpoint.",
          },
        ]}
      />

      <PracticeBox
        title="Sobe HTB VPN, valida conectividade, ativa kill-switch"
        goal="Conectar OpenVPN do HTB, verificar IP atribuído, garantir que tráfego do alvo SAI por tun0, ativar kill-switch e confirmar que sem VPN nada vaza."
        steps={[
          "Coloque o .ovpn em /etc/openvpn/client/htb.conf e suba o service.",
          "Confirme tun0 com IP 10.10.14.x.",
          "Verifique que ping em IP do HTB sai por tun0 (ip route get).",
          "Ative kill-switch ufw com regras só para tun0 + endpoint.",
          "Teste: derrube VPN, curl external, deve falhar. Suba VPN, deve funcionar.",
          "Bonus: rode 'curl ifconfig.me' — deve devolver o IP de saida do HTB, não o seu residencial.",
        ]}
        command={`sudo systemctl restart openvpn-client@htb
ip -br a show tun0
ip route get 10.10.10.1
sudo ufw status verbose
sudo systemctl stop openvpn-client@htb && curl -m5 https://api.ipify.org; echo "exit=$?"
sudo systemctl start openvpn-client@htb && sleep 3
curl -s https://api.ipify.org`}
        expected={`tun0  UNKNOWN  10.10.14.50/23
10.10.10.1 dev tun0 src 10.10.14.50

Status: active
Default: deny (incoming), deny (outgoing)
[..regras ufw..]

curl: (28) Failed to connect to api.ipify.org port 443 after 5001 ms
exit=28

185.181.1.10`}
        verify="Sem VPN: curl falha (kill-switch funcionando). Com VPN: ifconfig.me retorna o IP do servidor VPN, NUNCA seu IP residencial. Se aparecer seu IP real, kill-switch está furado."
      />

      <AlertBox type="danger" title="Ordem de operação importa">
        <p>
          Conecte VPN PRIMEIRO, ative kill-switch DEPOIS. Se você ativar kill-switch
          antes, perde acesso ao endpoint da VPN (porque está bloqueado!) e fica
          ilhado. Sempre teste o teardown também: <code>ufw disable</code> deve te
          devolver internet rapidamente em caso de pânico.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
