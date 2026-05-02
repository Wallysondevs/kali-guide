import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ZapProxy() {
  return (
    <PageContainer
      title="OWASP ZAP — Proxy open-source"
      subtitle="Alternativa gratuita ao Burp Pro: Active Scanner, Spider/Ajax, Fuzzer, automação CLI."
      difficulty="iniciante"
      timeToRead="14 min"
      prompt="web/zap"
    >
      <h2>Por que ZAP</h2>
      <p>
        <strong>OWASP ZAP</strong> (Zed Attack Proxy) é o concorrente open-source do Burp.
        Tem Active Scanner gratuito, suporte a APIs REST, automação por CLI/Docker e roda em CI/CD.
        Para times que não podem comprar Burp Pro, é a referência.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y zaproxy",
            out: "(também vem com kali-tools-web)",
            outType: "muted",
          },
          {
            cmd: "zaproxy &",
            out: "(abre interface. primeira vez pergunta se quer salvar sessão)",
            outType: "info",
          },
        ]}
      />

      <h2>3 modos de operação</h2>
      <CommandTable
        title="Manual / Automated / API"
        variations={[
          { cmd: "Desktop GUI", desc: "Igual ao Burp: HUD, History, Sites, Spider, Active Scan.", output: "Padrão." },
          { cmd: "Daemon (-daemon)", desc: "Sem GUI, controlado via API REST.", output: "Para automação." },
          { cmd: "Docker", desc: "owasp/zap2docker-stable + scripts baseline / full / api.", output: "Padrão em CI/CD." },
        ]}
      />

      <h2>Configurar browser</h2>
      <p>Igual ao Burp: <code>127.0.0.1:8080</code>. ZAP também tem CA própria — instale para HTTPS.</p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "exportar o cert da ZAP",
            cmd: "(GUI) Tools → Options → Dynamic SSL Certificate → Save",
            out: "(salva owasp_zap_root_ca.cer)",
            outType: "muted",
          },
          {
            comment: "importar no Firefox via certutil",
            cmd: "certutil -A -n 'OWASP ZAP CA' -t 'TC,,' -i ~/owasp_zap_root_ca.cer -d sql:$HOME/.mozilla/firefox/*.default-release/",
            out: "(silencioso)",
            outType: "default",
          },
        ]}
      />

      <h2>Spider e Ajax Spider</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "spider clássico (HTTP) — segue links",
            cmd: "(GUI) Right-click site → Attack → Spider → Start Scan",
            out: `[Spider] URLs Found: 142
                Resources: HTML 87, JS 31, CSS 12, IMG 12
                Time: 0:00:14`,
            outType: "info",
          },
          {
            comment: "ajax spider — abre browser real e clica em SPA (React/Vue/Angular)",
            cmd: "(GUI) Right-click → Attack → Ajax Spider → Start",
            out: `[Ajax Spider] (Headless Chrome rodando...)
                URLs found: 47
                JS routes detected: /dashboard, /profile, /settings`,
            outType: "success",
          },
        ]}
      />

      <h2>Active Scanner</h2>
      <p>Roda 100+ checks: SQLi, XSS, command injection, path traversal, SSRF, headers, etc.</p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "(GUI) Right-click site → Attack → Active Scan → Start Scan",
            out: `[Active Scan] Progress: 100% (78/78 plugins)
[High] SQL Injection — /login (parameter: username)
[High] Cross Site Scripting (Reflected) — /search (parameter: q)
[Medium] Cookie No HttpOnly Flag — session
[Medium] Cookie Without Secure Flag — session
[Medium] Missing Anti-CSRF Tokens — /transfer
[Low] X-Frame-Options Header Not Set
[Low] X-Content-Type-Options Header Missing
[Info] Modern Web Application detected`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fuzzer</h2>
      <p>Equivalente ao Intruder: marca posições e dispara payloads.</p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) capture um request",
            cmd: "(History) right-click GET /api/user/123 → Attack → Fuzz",
            out: "(abre janela do Fuzzer)",
            outType: "muted",
          },
          {
            comment: "2) marque o '123' como FUZZ position",
            cmd: "(GUI) selecione 123 → Add → Payloads → Numeric range 1-200",
            out: "(adiciona 200 payloads)",
            outType: "default",
          },
          {
            comment: "3) Start Fuzzer",
            cmd: "Start Fuzzer",
            out: `Task    Code    Reason  RTT     Size
1       200     OK      54ms    1.2 KB
2       403     Forbid  61ms    412 B
3       200     OK      48ms    1.4 KB    ← diferente!
4       403     Forbid  55ms    412 B
[...]`,
            outType: "warning",
          },
        ]}
      />

      <h2>ZAP CLI / Docker em CI/CD</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "scan rápido (baseline) — 1-2 min, só checks passivos + spider rápido",
            cmd: "docker run -t owasp/zap2docker-stable zap-baseline.py -t https://app.local",
            out: `Total of 23 URLs
PASS: Cookie No HttpOnly Flag [10010]
PASS: Cookie Without Secure Flag [10011]
PASS: Cross-Domain JavaScript Source File Inclusion [10017]
WARN-NEW: Missing Anti-clickjacking Header [10020]
WARN-NEW: Cross-Domain Misconfiguration [10098]
FAIL-NEW: 0      FAIL-INPROG: 0      WARN-NEW: 2     WARN-INPROG: 0      INFO: 0     IGNORE: 0       PASS: 25`,
            outType: "info",
          },
          {
            comment: "scan completo (full) — 30+ min, com Active Scanner",
            cmd: `docker run -v $(pwd):/zap/wrk:rw -t owasp/zap2docker-stable \\
  zap-full-scan.py -t https://app.local -r relatorio.html`,
            out: `[...]
[Active Scan] 100% complete
Generated report: /zap/wrk/relatorio.html

Summary:
 HIGH: 2
 MEDIUM: 5
 LOW: 12
 INFORMATIONAL: 7`,
            outType: "warning",
          },
          {
            comment: "scan de API definida por OpenAPI/Swagger",
            cmd: `docker run -t owasp/zap2docker-stable \\
  zap-api-scan.py -t https://app.local/openapi.json -f openapi`,
            out: `[Imported 47 endpoints from OpenAPI spec]
[Active Scan] testing each endpoint...
HIGH: SQL Injection in GET /users?id=
MEDIUM: BOLA — /api/orders/{id} (acesso a outros usuários)`,
            outType: "error",
          },
        ]}
      />

      <h2>Automation Framework (yaml)</h2>
      <CodeBlock
        language="yaml"
        title="zap.yaml — pipeline declarativo"
        code={`env:
  contexts:
    - name: "prod"
      urls:
        - "https://app.local"
      includePaths:
        - "https://app.local/.*"
      authentication:
        method: "form"
        parameters:
          loginPageUrl: "https://app.local/login"
          loginRequestUrl: "https://app.local/api/login"
          loginRequestBody: "username={%username%}&password={%password%}"
        verification:
          method: "response"
          loggedInRegex: "logout"
      users:
        - name: "wallyson"
          credentials:
            username: "wallyson"
            password: "Senha@123"

jobs:
  - type: "passiveScan-config"
  - type: "spider"
    parameters:
      context: "prod"
      user: "wallyson"
      maxDuration: 5
  - type: "spiderAjax"
    parameters:
      context: "prod"
      maxDuration: 5
  - type: "activeScan"
    parameters:
      context: "prod"
      user: "wallyson"
  - type: "report"
    parameters:
      template: "modern"
      reportFile: "zap_relatorio.html"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "zap.sh -cmd -autorun zap.yaml",
            out: `[INFO] Starting ZAP 2.16.0
[INFO] Loading automation plan
[INFO] Job spider: completed (54 URLs)
[INFO] Job spiderAjax: completed (12 URLs)
[INFO] Job activeScan: 100%
[INFO] Job report: zap_relatorio.html written
[INFO] Total alerts: 23 (HIGH: 1, MEDIUM: 4, LOW: 11, INFO: 7)`,
            outType: "success",
          },
        ]}
      />

      <h2>API REST do ZAP</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "rodar ZAP em modo daemon",
            cmd: "zap.sh -daemon -port 8090 -config api.disablekey=true &",
            out: "(roda em background na porta 8090)",
            outType: "muted",
          },
          {
            cmd: "curl 'http://localhost:8090/JSON/spider/action/scan/?url=https://app.local'",
            out: `{"scan":"3"}`,
            outType: "default",
          },
          {
            cmd: "curl 'http://localhost:8090/JSON/spider/view/status/?scanId=3'",
            out: `{"status":"45"}`,
            outType: "default",
          },
          {
            cmd: "curl 'http://localhost:8090/JSON/core/view/alerts/?baseurl=https://app.local'",
            out: `{
  "alerts": [
    {
      "name": "SQL Injection",
      "risk": "High",
      "url": "https://app.local/login",
      "param": "username",
      "evidence": "1 OR 1=1--"
    },
    [...]
  ]
}`,
            outType: "warning",
          },
        ]}
      />

      <h2>Burp vs ZAP — quando usar qual</h2>
      <CommandTable
        title="Comparativo prático"
        variations={[
          { cmd: "Trabalho manual", desc: "Burp tem UX mais fluida (Repeater, Intruder).", output: "Vencedor: Burp" },
          { cmd: "Active Scanner grátis", desc: "ZAP tem; Burp CE não.", output: "Vencedor: ZAP" },
          { cmd: "CI/CD automation", desc: "ZAP Docker + automation framework.", output: "Vencedor: ZAP" },
          { cmd: "API REST", desc: "ZAP tem API completa nativa.", output: "Vencedor: ZAP" },
          { cmd: "Plugins/extensões", desc: "Burp tem mais plugins de qualidade.", output: "Vencedor: Burp" },
          { cmd: "Custo", desc: "ZAP free; Burp Pro $449/ano.", output: "Vencedor: ZAP" },
          { cmd: "Speed do scanner", desc: "Burp Pro mais rápido + menos falsos positivos.", output: "Vencedor: Burp Pro" },
        ]}
      />

      <PracticeBox
        title="Scan automatizado com ZAP no juice-shop"
        goal="Rodar full scan no OWASP Juice Shop (vulnerável de propósito) e gerar relatório."
        steps={[
          "Suba o juice-shop com docker.",
          "Rode zap-full-scan.py apontando para o juice-shop.",
          "Abra o relatório HTML gerado.",
          "Confirme pelo menos os achados HIGH (XSS, SQLi).",
        ]}
        command={`docker network create zap-net
docker run -d --name juice --network zap-net -p 3000:3000 bkimminich/juice-shop

docker run -t --network zap-net -v $(pwd):/zap/wrk:rw owasp/zap2docker-stable \\
  zap-full-scan.py -t http://juice:3000 -r juice_report.html

# Limpar
docker rm -f juice && docker network rm zap-net`}
        expected={`[Active Scan] complete
Generated report: /zap/wrk/juice_report.html

Summary:
 HIGH: 4    (SQL Injection, XSS reflected, XSS persistent, Path Traversal)
 MEDIUM: 8
 LOW: 14`}
        verify="Abra juice_report.html e confirme as categorias HIGH com URLs e evidências de payload."
      />

      <AlertBox type="info" title="ZAP é referência em DevSecOps">
        Como roda em Docker e tem automation framework declarativo, ZAP é a escolha
        natural para colocar scans de segurança rodando todo deploy do CI/CD —
        algo que Burp Pro também faz, mas custando mais e exigindo licença por agente.
      </AlertBox>
    </PageContainer>
  );
}
