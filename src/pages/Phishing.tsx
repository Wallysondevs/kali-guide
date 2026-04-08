import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Phishing() {
  return (
    <PageContainer
      title="Phishing — Engenharia Social por Email"
      subtitle="Configure e execute campanhas de phishing controladas com GoPhish. Inclui setup de infraestrutura (domínio, SMTP, SPF/DKIM), criação de templates convincentes, e análise de resultados."
      difficulty="intermediario"
      timeToRead="30 min"
    >
      <h2>Phishing em Pentest</h2>
      <p>
        Campanhas de phishing em pentests testam a <strong>resistência humana</strong> da organização.
        O objetivo é medir: quantos funcionários clicam em links maliciosos, quantos fornecem
        credenciais, e quão rápido o SOC (Security Operations Center) detecta a campanha.
      </p>

      <AlertBox type="warning" title="Autorização obrigatória">
        Phishing DEVE estar explicitamente no escopo do pentest. Coordene com o cliente: quais
        departamentos testar, quantos emails, se o SOC será notificado previamente, e quais dados
        coletar (apenas cliques? ou também credenciais?). Nunca colete senhas REAIS.
      </AlertBox>

      <h2>GoPhish — Configuração Completa</h2>
      <CodeBlock
        title="Instalar, configurar e usar GoPhish"
        code={`# ═══════════════════════════════════════════════════
# INSTALAR GOPHISH
# ═══════════════════════════════════════════════════
# Baixar última versão:
wget https://github.com/gophish/gophish/releases/latest/download/gophish-v0.12.1-linux-64bit.zip
unzip gophish-v0.12.1-linux-64bit.zip -d /opt/gophish
cd /opt/gophish
chmod +x gophish

# Editar config.json ANTES de iniciar:
cat config.json
# {
#   "admin_server": {
#     "listen_url": "0.0.0.0:3333",    ← Painel admin (mudar para 127.0.0.1 em produção)
#     "use_tls": true,
#     "cert_path": "gophish_admin.crt",
#     "key_path": "gophish_admin.key"
#   },
#   "phish_server": {
#     "listen_url": "0.0.0.0:80",      ← Servidor de phishing (onde as vítimas acessam)
#     "use_tls": false
#   }
# }

# Iniciar GoPhish:
./gophish
# Output:
# time="2024-01-15T10:00:00Z" msg="Starting admin server at https://0.0.0.0:3333"
# time="2024-01-15T10:00:00Z" msg="Starting phishing server at http://0.0.0.0:80"
# time="2024-01-15T10:00:00Z" msg="Admin credentials: admin / SENHA_GERADA"
#                                                       ↑ ANOTAR!

# Acessar painel admin:
# https://SEU_IP:3333
# Login: admin / SENHA_GERADA
# Mudar senha no primeiro login!

# ═══════════════════════════════════════════════════
# CONFIGURAR PERFIL DE ENVIO (Sending Profile)
# ═══════════════════════════════════════════════════
# Menu: Sending Profiles → New Profile
#
# ┌────────────────────────────────────────────────┐
# │ Name: "SMTP Campanha"                          │
# │                                                 │
# │ Interface Type: SMTP                            │
# │                                                 │
# │ From: "TI Empresa" <ti@empresa-support.com>     │
# │ ↑ O nome e email que aparece para a vítima      │
# │ ↑ Use algo convincente!                          │
# │                                                 │
# │ Host: smtp.sendgrid.net:587                     │
# │ ↑ Servidor SMTP para envio                      │
# │ ↑ Opções: SendGrid, Mailgun, Amazon SES,        │
# │ ↑ ou seu próprio SMTP                           │
# │                                                 │
# │ Username: apikey                                │
# │ Password: SG.xxxxxxxxxxxxx                      │
# │ ↑ Credenciais do serviço de email               │
# │                                                 │
# │ ☑ Ignore Certificate Errors                    │
# └────────────────────────────────────────────────┘
# Clicar "Send Test Email" para verificar!

# ═══════════════════════════════════════════════════
# CONFIGURAR PÁGINA DE PHISHING (Landing Page)
# ═══════════════════════════════════════════════════
# Menu: Landing Pages → New Page
#
# ┌────────────────────────────────────────────────┐
# │ Name: "Login Office 365"                       │
# │                                                 │
# │ ☑ Capture Submitted Data                      │
# │ ↑ Registra o que a vítima digitar nos campos    │
# │                                                 │
# │ ☐ Capture Passwords                           │
# │ ↑ DESMARCAR em testes éticos! Não capturar      │
# │   senhas reais — registrar apenas que submeteu   │
# │                                                 │
# │ Redirect to: https://login.microsoftonline.com  │
# │ ↑ Após submeter, redirecionar para o site REAL   │
# │ ↑ A vítima acha que "errou a senha" e tenta      │
# │ ↑ novamente no site legítimo                     │
# │                                                 │
# │ HTML: [Import Site] → URL do site a clonar       │
# │ ↑ GoPhish clona o HTML do site automaticamente!  │
# │ ↑ Ex: https://login.microsoftonline.com           │
# └────────────────────────────────────────────────┘

# ═══════════════════════════════════════════════════
# CRIAR TEMPLATE DE EMAIL
# ═══════════════════════════════════════════════════
# Menu: Email Templates → New Template
#
# Campos:
# Name: "Reset de Senha Urgente"
# Subject: "Ação necessária: sua senha expira em 24 horas"
#
# HTML Body (exemplo convincente):
# <html>
# <body style="font-family: Arial;">
#   <div style="max-width: 600px; margin: 0 auto;">
#     <img src="https://logo.empresa.com/logo.png" width="200">
#     <h2>Aviso de Segurança</h2>
#     <p>Olá {{.FirstName}},</p>
#     <p>Detectamos que sua senha corporativa expira em
#        <strong>24 horas</strong>.</p>
#     <p>Para manter o acesso aos sistemas, atualize sua
#        senha clicando no botão abaixo:</p>
#     <a href="{{.URL}}" style="background:#0078d4;
#        color:white; padding:12px 24px; text-decoration:none;
#        border-radius:4px; display:inline-block;">
#       Atualizar Senha
#     </a>
#     <p style="color:#666; font-size:12px; margin-top:20px;">
#       Este é um email automático do departamento de TI.<br>
#       Em caso de dúvidas, contate suporte@empresa.com
#     </p>
#   </div>
# </body>
# </html>
#
# Variáveis disponíveis no GoPhish:
# {{.FirstName}}  — primeiro nome do alvo
# {{.LastName}}   — sobrenome
# {{.Email}}      — email
# {{.Position}}   — cargo
# {{.From}}       — remetente configurado
# {{.URL}}        — link de tracking (OBRIGATÓRIO!)
# {{.TrackingURL}} — pixel de tracking (imagem 1x1)
# {{.Tracker}}    — código de tracking

# ═══════════════════════════════════════════════════
# CRIAR GRUPO DE ALVOS
# ═══════════════════════════════════════════════════
# Menu: Users & Groups → New Group
# Name: "Departamento Financeiro"
# Import CSV com colunas:
# First Name, Last Name, Email, Position
# João,Silva,joao.silva@empresa.com,Analista Financeiro
# Maria,Santos,maria.santos@empresa.com,Gerente

# ═══════════════════════════════════════════════════
# LANÇAR CAMPANHA
# ═══════════════════════════════════════════════════
# Menu: Campaigns → New Campaign
# Name: "Phishing Test Q1"
# Email Template: "Reset de Senha Urgente"
# Landing Page: "Login Office 365"
# Sending Profile: "SMTP Campanha"
# URL: http://SEU_SERVIDOR (ou https:// com certificado)
# Groups: "Departamento Financeiro"
# Send Emails By: (opcional — enviar todos de uma vez ou espaçados)
# Launch Date: (imediato ou agendado)
#
# Clicar "Launch Campaign"!`}
      />

      <h2>Infraestrutura de Phishing Profissional</h2>
      <CodeBlock
        title="Domínio, SPF, DKIM e DMARC para máxima entregabilidade"
        code={`# ═══════════════════════════════════════════════════
# ESCOLHER DOMÍNIO CONVINCENTE
# ═══════════════════════════════════════════════════
# O domínio é CRUCIAL para credibilidade. Técnicas:
#
# 1. Typosquatting (erro de digitação):
#    empresa.com → empressa.com, empre5a.com, empresa-ti.com
#
# 2. Homoglyph (caracteres similares):
#    empresa.com → enpresa.com (m→n), ernpresa.com (m→rn)
#
# 3. Subdomain trust:
#    empresa.support.com, empresa-login.com
#
# 4. TLD switching:
#    empresa.com → empresa.net, empresa.org, empresa.co
#
# Registrar em: Namecheap, GoDaddy, Porkbun

# ═══════════════════════════════════════════════════
# CONFIGURAR DNS (SPF, DKIM, DMARC)
# ═══════════════════════════════════════════════════
# Sem esses registros, emails vão para SPAM!

# SPF (Sender Policy Framework) — diz quais IPs podem enviar:
# Tipo: TXT
# Nome: @
# Valor: v=spf1 include:sendgrid.net ~all
# ↑ Permite SendGrid enviar em nome do domínio

# DKIM (DomainKeys Identified Mail) — assinatura criptográfica:
# Configurar no provedor de email (SendGrid, Mailgun)
# Eles fornecem o registro DNS para adicionar

# DMARC (Domain-based Message Authentication):
# Tipo: TXT
# Nome: _dmarc
# Valor: v=DMARC1; p=none; sp=none
# p=none → não rejeitar emails que falham (para teste)

# ═══════════════════════════════════════════════════
# TESTAR ENTREGABILIDADE
# ═══════════════════════════════════════════════════
# Antes de enviar para os alvos, testar:
# 1. Enviar para seu próprio email (Gmail, Outlook)
# 2. Verificar se chegou na caixa de entrada (não spam)
# 3. Verificar headers do email:
#    SPF: PASS
#    DKIM: PASS
#    DMARC: PASS
# 4. Usar: https://www.mail-tester.com — dá nota de 1-10`}
      />

      <h2>Análise de Resultados</h2>
      <CodeBlock
        title="Interpretar e reportar resultados da campanha"
        code={`# ═══════════════════════════════════════════════════
# MÉTRICAS NO GOPHISH
# ═══════════════════════════════════════════════════
# Dashboard → selecionar campanha:
#
# Emails Sent:     50  (total enviados)
# Emails Opened:   35  (70% — abriram o email)
# Links Clicked:   22  (44% — clicaram no link!)
# Data Submitted:  15  (30% — inseriram dados no form!)
# Reported:         3  (6% — reportaram ao SOC)
#
# Timeline mostra QUANDO cada ação aconteceu:
# 10:01 - joao@empresa.com - Email Opened
# 10:02 - joao@empresa.com - Clicked Link
# 10:03 - joao@empresa.com - Submitted Data
#          → Dados capturados: username=joao.silva

# ═══════════════════════════════════════════════════
# PARA O RELATÓRIO DE PENTEST
# ═══════════════════════════════════════════════════
# Incluir no relatório:
# 1. Metodologia (template usado, domínio, timing)
# 2. Estatísticas (% de abertura, clique, submit)
# 3. Tempo até primeiro clique
# 4. Tempo até SOC detectar (se aplicável)
# 5. Departamentos mais vulneráveis
# 6. Recomendações:
#    - Treinamento de awareness (obrigatório)
#    - Simulações regulares de phishing
#    - Implementar MFA (reduz impacto de credenciais roubadas)
#    - Configurar DMARC no modo reject para o domínio real
#    - Email gateway com sandbox de URLs
#    - Botão "Report Phishing" no cliente de email`}
      />

      <h2>Outras Técnicas de Phishing</h2>
      <CodeBlock
        title="Vishing, smishing, e spear phishing"
        code={`# ═══════════════════════════════════════════════════
# SPEAR PHISHING (direcionado)
# ═══════════════════════════════════════════════════
# Phishing customizado para UM indivíduo específico.
# Pesquisar no LinkedIn, Twitter, site da empresa:
# - Nome do chefe direto (enviar "como" o chefe)
# - Projetos atuais (referência contextual)
# - Fornecedores (se passar por fornecedor)
# - Interesses pessoais (engenharia social)
#
# Exemplo: "Oi João, o Pedro me pediu para enviar o
# relatório Q1 atualizado. Pode revisar? [link]"
# → Muito mais eficaz que phishing genérico!

# ═══════════════════════════════════════════════════
# VISHING (Voice Phishing — por telefone)
# ═══════════════════════════════════════════════════
# Ligar se passando por:
# - TI: "Preciso resetar sua senha, me confirma a atual?"
# - Suporte: "Detectamos atividade suspeita na sua conta"
# - Banco: "Precisamos confirmar uma transação"
#
# Ferramentas:
# - Spoofcard — falsificar caller ID
# - Google Voice — número descartável

# ═══════════════════════════════════════════════════
# SMISHING (SMS Phishing)
# ═══════════════════════════════════════════════════
# SMS é mais eficaz que email (taxa de abertura ~98%!):
# "Seu pacote está retido. Rastreio: http://link-malicioso"
# "Sua conta será bloqueada. Confirme: http://link"

# ═══════════════════════════════════════════════════
# EVILGINX — PHISHING COM BYPASS DE MFA
# ═══════════════════════════════════════════════════
# Evilginx é um proxy reverso que intercepta sessões.
# A vítima faz login REAL (com MFA) → Evilginx captura
# o cookie de sessão APÓS o MFA → atacante usa o cookie.
#
# Instalação:
# https://github.com/kgretzky/evilginx2
# Configurar "phishlet" para o serviço alvo (O365, Gmail, etc.)
# ⚠️ Extremamente poderoso — use com muita responsabilidade!`}
      />
    </PageContainer>
  );
}
