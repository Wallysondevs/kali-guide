import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Tor() {
  return (
    <PageContainer
      title="Tor — anonimato e .onion"
      subtitle="Daemon Tor, Tor Browser, hidden services, controle via stem, OPSEC para anonimato real."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>Como funciona (em 30s)</h2>
      <OutputBlock label="onion routing" type="muted">
{`Você → Guard relay → Middle relay → Exit relay → Destino

Cada hop:
  - Conhece SÓ o anterior e o próximo
  - Decifra UMA camada de criptografia (cebola — onion)
  - Não sabe a origem real nem o destino final

Circuito muda a cada 10 minutos por padrão.
~7000 relays ativos no mundo (consenso publico).
Latência típica: 300-1500ms vs ~30ms direto.`}
      </OutputBlock>

      <h2>Instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y tor torbrowser-launcher nyx",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  tor torbrowser-launcher nyx tor-geoipdb
Need to get 6.842 kB of archives.
[...]
Setting up tor (0.4.8.10-1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/tor.service
Setting up nyx (2.1.0-2) ...`,
            outType: "success",
          },
          {
            cmd: "sudo systemctl start tor && sudo systemctl enable tor",
            out: "Synchronizing state of tor.service with SysV service script...",
            outType: "muted",
          },
          {
            cmd: "ss -lntp | grep -i tor",
            out: `LISTEN  0  4096  127.0.0.1:9050  0.0.0.0:*  users:(("tor",pid=4421))   ← SOCKS
LISTEN  0  4096  127.0.0.1:9051  0.0.0.0:*  users:(("tor",pid=4421))   ← Control`,
            outType: "info",
          },
          {
            comment: "log do bootstrap (verificar 100%)",
            cmd: "sudo tail -20 /var/log/tor/log",
            out: `Apr 03 23:14:21.000 [notice] Tor 0.4.8.10 opening log file.
Apr 03 23:14:21.000 [notice] Bootstrapped 5%: Connecting
Apr 03 23:14:23.000 [notice] Bootstrapped 10%: Finishing handshake with directory server
Apr 03 23:14:25.000 [notice] Bootstrapped 80%: Connecting to the Tor network
Apr 03 23:14:26.000 [notice] Bootstrapped 90%: Establishing a Tor circuit
Apr 03 23:14:27.000 [notice] Bootstrapped 100% (done): Done   ← pronto!`,
            outType: "success",
          },
        ]}
      />

      <h2>Verificar que está mesmo no Tor</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "curl -s ifconfig.io",
            out: "187.84.42.108            (seu IP REAL — direto, sem Tor)",
            outType: "muted",
          },
          {
            comment: "via Tor (socks5h = resolve DNS pelo Tor também — sem leak!)",
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 ifconfig.io",
            out: "185.220.101.42          (exit node Tor)",
            outType: "success",
          },
          {
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 https://check.torproject.org/api/ip",
            out: `{"IsTor":true,"IP":"185.220.101.42"}`,
            outType: "success",
          },
          {
            comment: "geo do exit",
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 ipinfo.io | jq '{ip,city,country,org}'",
            out: `{
  "ip": "185.220.101.42",
  "city": "Frankfurt",
  "country": "DE",
  "org": "AS208294 zwiebeltoralf e.V."   ← provedor Tor conhecido
}`,
            outType: "info",
          },
        ]}
      />

      <h2>Tor Browser</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1ª vez: baixa o tarball oficial automaticamente",
            cmd: "torbrowser-launcher",
            out: `Tor Browser Launcher
By Micah Lee
Version 0.3.7

Downloading and installing Tor Browser for the first time.
[##############################################] 100%

Verifying Signature... ✓
Extracting Tor Browser to ~/.local/share/torbrowser/tbb/x86_64/tor-browser/...
Launching Tor Browser`,
            outType: "info",
          },
          {
            comment: "atalho direto (sem launcher)",
            cmd: "~/.local/share/torbrowser/tbb/x86_64/tor-browser/Browser/start-tor-browser",
            out: "(abre janela Tor Browser)",
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="warning" title="Tor Browser ≠ Firefox + proxy">
        Tor Browser é um Firefox-ESR <strong>customizado pesado</strong>: HTTPS-Only forçado,
        NoScript, anti-fingerprinting (canvas, WebGL, fonts), letterboxing (resolução fake),
        first-party isolation. Configurar Firefox normal apontando pro Tor proxy <strong>NÃO É
        SEGURO</strong> — você é fingerprintável trivialmente.
      </AlertBox>

      <h2>Controlar o Tor (NEWNYM = novo circuito)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) habilitar ControlPort com auth (uma vez)",
            cmd: "sudo nano /etc/tor/torrc",
            out: `# adicionar/descomentar:
ControlPort 9051
HashedControlPassword 16:872860B76453A77D60CA2BB8C1A7042072093276A3D701AD684053EC4C
# (gerar com: tor --hash-password 'minhasenha')

CookieAuthentication 1`,
            outType: "default",
          },
          {
            cmd: "sudo systemctl restart tor",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "2) trocar circuito via netcat",
            cmd: "echo -e 'AUTHENTICATE \"minhasenha\"\\nSIGNAL NEWNYM\\nQUIT' | nc 127.0.0.1 9051",
            out: `250 OK
250 OK
250 closing connection`,
            outType: "success",
          },
          {
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 ifconfig.io",
            out: "204.85.191.30           (NOVO exit, era 185.220.101.42)",
            outType: "info",
          },
          {
            comment: "3) via Python stem (mais limpo, programático)",
            cmd: "pip install stem && python3 -c 'from stem import Signal; from stem.control import Controller\nwith Controller.from_port(port=9051) as c:\n  c.authenticate(\"minhasenha\")\n  c.signal(Signal.NEWNYM)\n  print(\"novo circuito ok\")'",
            out: "novo circuito ok",
            outType: "success",
          },
        ]}
      />

      <h2>Nyx — monitor de relays/circuitos em tempo real</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo nyx",
            out: `┌─ Tor 0.4.8.10 ──────────────────────────────────────────────────────────┐
│ Tor (pid 4421)        Bandwidth (KiB/s):   ▁▂▃▅▇█▇▅▃▂▁                  │
│ wallyson@kali         Recv:  142.3 KiB/s   Sent:  31.8 KiB/s             │
│ Sock OK   ControlOK   Total:  84.2 MiB     32.1 MiB                       │
└──────────────────────────────────────────────────────────────────────────┘
┌─ Connections (24 active) ──────────────────────────────────────────────┐
│ ↑↓  185.220.101.42:443    DE  zwiebeltoralf  GUARD  ESTAB  4m12s         │
│ ↑↓  204.85.191.30:9001    SE  PrivacyTOR     MIDDLE ESTAB  3m41s         │
│ ↑↓  51.83.45.12:443       FR  HighwayRelay   EXIT   ESTAB  1m08s         │
│ ↑↓  185.40.4.97:9001      RO  artikel10      MIDDLE ESTAB  6m21s         │
└──────────────────────────────────────────────────────────────────────────┘
┌─ Log ──────────────────────────────────────────────────────────────────┐
│ [NOTICE] We now have enough directory information to build circuits.    │
│ [NOTICE] Bootstrapped 100% (done): Done                                 │
│ [INFO]   New control connection opened from 127.0.0.1                    │
│ [INFO]   Have tried resolving or connecting to address 185.220.101.42... │
└──────────────────────────────────────────────────────────────────────────┘
 [m] menu   [p] page   [q] quit`,
            outType: "info",
          },
        ]}
      />

      <h2>Acessar .onion (clearnet → darknet)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "via curl (use socks5h para DNS via Tor)",
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 http://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/ | head -3",
            out: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>DuckDuckGo — Privacy, simplified.</title>
<meta name="description" content="The Internet privacy company">`,
            outType: "info",
          },
          {
            comment: "outros .onion conhecidos seguros (jornalistas, gov, cripto)",
            cmd: "echo 'Onions oficiais:'; cat <<EOF\nNYT       www.nytimes3xbfgragh.onion\nBBC       www.bbcnewsv2vjtpsuy.onion\nProtonMail protonmailrmez3lotccipshtkleegetolb73fuirgj7r4o4vfu7ozyd.onion\nFacebook  facebookcorewwwi.onion\nDDG       duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion\nEOF",
            out: `Onions oficiais:
NYT       www.nytimes3xbfgragh.onion
BBC       www.bbcnewsv2vjtpsuy.onion
ProtonMail protonmailrmez3lotccipshtkleegetolb73fuirgj7r4o4vfu7ozyd.onion
Facebook  facebookcorewwwi.onion
DDG       duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion`,
            outType: "default",
          },
        ]}
      />

      <h2>Hidden Service — hospedar SEU .onion</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) servir um conteúdo qualquer local",
            cmd: "mkdir -p /tmp/site && echo '<h1>Meu site .onion</h1>' > /tmp/site/index.html && cd /tmp/site && python3 -m http.server 8000 &",
            out: "Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...",
            outType: "muted",
          },
          {
            comment: "2) registrar como hidden service no torrc",
            cmd: "echo -e 'HiddenServiceDir /var/lib/tor/meu_servico/\\nHiddenServicePort 80 127.0.0.1:8000' | sudo tee -a /etc/tor/torrc",
            out: `HiddenServiceDir /var/lib/tor/meu_servico/
HiddenServicePort 80 127.0.0.1:8000`,
            outType: "info",
          },
          {
            cmd: "sudo systemctl restart tor && sleep 5 && sudo cat /var/lib/tor/meu_servico/hostname",
            out: `2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion`,
            outType: "success",
          },
          {
            cmd: "curl -s --proxy socks5h://127.0.0.1:9050 http://2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion",
            out: "<h1>Meu site .onion</h1>",
            outType: "success",
          },
          {
            comment: "compartilhar esse hostname com quem quiser. funciona globalmente, sem porta aberta na sua casa",
            cmd: "(qualquer pessoa do mundo no Tor Browser)",
            out: "→ http://2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion",
            outType: "info",
          },
        ]}
      />

      <h2>Proxychains + Tor para todas as ferramentas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "head -1 /etc/proxychains4.conf && grep ^socks /etc/proxychains4.conf",
            out: `# proxychains.conf  VER 4.x
socks5  127.0.0.1  9050`,
            outType: "info",
          },
          {
            cmd: "proxychains4 -q nmap -sT -Pn -p 80 scanme.nmap.org",
            out: `Nmap scan report for scanme.nmap.org (45.33.32.156)
PORT   STATE SERVICE
80/tcp open  http`,
            outType: "warning",
          },
          {
            cmd: "proxychains4 -q ssh user@meuserver.com",
            out: `(SSH passa pelo Tor — útil para SSH a partir de país que bloqueia)
user@meuserver.com's password:`,
            outType: "default",
          },
        ]}
      />

      <h2>OPSEC — anonimato real</h2>
      <CommandTable
        title="O que vaza você mesmo no Tor"
        variations={[
          { cmd: "JavaScript habilitado", desc: "Fingerprint via canvas/WebGL/fonts/audio.", output: "Tor Browser desativa por padrão em modo Safer." },
          { cmd: "Login em conta pessoal", desc: "Você se identifica trivialmente.", output: "Crie identidade nova SÓ para uso Tor." },
          { cmd: "PDFs/Office abertos", desc: "Embed remote = vaza IP REAL.", output: "Abra só dentro do Tails offline." },
          { cmd: "BitTorrent via Tor", desc: "Cliente envia IP real no announce UDP.", output: "PROIBIDO. Mata anonimato." },
          { cmd: "WebRTC", desc: "Vaza IP local + ISP.", output: "Tor Browser desabilita." },
          { cmd: "DNS leak", desc: "Sistema resolve fora do Tor.", output: "socks5h:// (com 'h') ou Tails." },
          { cmd: "Tempo de uso (correlation)", desc: "Logs de ISP + logs de exit.", output: "Mitigado por: VPN antes do Tor." },
          { cmd: "Estilo de escrita / horários", desc: "Análise estilométrica.", output: "OPSEC humano — mais difícil." },
        ]}
      />

      <h2>Stack máxima — Tails OS</h2>
      <OutputBlock label="quando OPSEC tem que ser perfeito" type="warning">
{`Tails (The Amnesic Incognito Live System)
  - SO live (USB) — não escreve no disco
  - TODO tráfego forçado pelo Tor (firewall não deixa nada vazar)
  - Memoria limpa no shutdown
  - Vem com Tor Browser, KeePassXC, OnionShare, Pidgin OTR
  - Persistent storage opcional (criptografado)
  - Update via apt-get internamente para tools

Download: tails.net (verificar PGP signature OFFLINE!)
Boot: USB com 8GB+ → desktop em ~3 min

Quem usa: jornalistas, ativistas, denunciantes
Snowden recomendou. CIA quer banir.`}
      </OutputBlock>

      <PracticeBox
        title="Lab: hidden service + visitar pelo Tor Browser"
        goal="Subir um site .onion próprio e visitá-lo pelo Tor Browser na mesma máquina."
        steps={[
          "Servir conteúdo local em python -m http.server 8000.",
          "Configurar HiddenService no /etc/tor/torrc.",
          "Restart tor; pegar hostname.",
          "Abrir Tor Browser; navegar até o .onion gerado.",
          "Verificar que conteúdo aparece.",
        ]}
        command={`mkdir -p /tmp/onion_site
echo '<h1>Meu serviço Tor</h1><p>Funciona!</p>' > /tmp/onion_site/index.html
cd /tmp/onion_site && python3 -m http.server 8000 &

sudo bash -c 'cat >> /etc/tor/torrc <<EOF
HiddenServiceDir /var/lib/tor/lab/
HiddenServicePort 80 127.0.0.1:8000
EOF'

sudo systemctl restart tor
sleep 5
sudo cat /var/lib/tor/lab/hostname
# copiar URL → abrir no Tor Browser`}
        expected={`abc123def456ghi789jkl012mno345pqr678stu901vwx234yzd.onion

(no Tor Browser)
Meu serviço Tor
Funciona!`}
        verify="Quando terminar: sudo rm -rf /var/lib/tor/lab/ + remover linhas do torrc + restart."
      />

      <AlertBox type="info" title="Tor não é mágica">
        Tor protege LOCALIZAÇÃO. Não protege CONTEÚDO se você for desleixado: login em conta
        pessoal, PDFs com tracker, abrir mesma sessão fora do Tor. Para anonimato real, separe
        IDENTIDADES (Tor / clearnet) e use Tails OS quando importar.
      </AlertBox>
    </PageContainer>
  );
}
