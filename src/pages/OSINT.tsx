import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function OSINT() {
  return (
    <PageContainer
      title="OSINT — Visão Geral"
      subtitle="Open Source INTelligence — coleta passiva de informação a partir de fontes públicas."
      difficulty="iniciante"
      timeToRead="14 min"
      prompt="recon/osint"
    >
      <h2>O que é OSINT</h2>
      <p>
        <strong>OSINT</strong> é tudo que você descobre sem tocar diretamente no alvo: registros públicos,
        DNS, WHOIS, certificados TLS, leaks de credencial, posts em redes sociais, código no GitHub,
        bancos de imagens, registros de empresa.
      </p>
      <p>
        É a primeira fase de qualquer pentest sério: 60% do trabalho está em conhecer o alvo
        antes de mandar o primeiro pacote.
      </p>

      <h2>WHOIS, DNS e ASN</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "whois kali.org | head -20",
            out: `   Domain Name: KALI.ORG
   Registry Domain ID: 1737832059_DOMAIN_ORG-VRSN
   Registrar WHOIS Server: whois.gandi.net
   Registrar URL: http://www.gandi.net
   Updated Date: 2024-09-12T11:23:14Z
   Creation Date: 2012-08-14T15:31:11Z
   Registry Expiry Date: 2025-08-14T15:31:11Z
   Registrar: Gandi SAS
   Registrar IANA ID: 81
   Registrar Abuse Contact Email: abuse@support.gandi.net
   Registrar Abuse Contact Phone: +33.170377661
   Domain Status: clientTransferProhibited
   Name Server: APOLLO.NS.CLOUDFLARE.COM
   Name Server: BRITNEY.NS.CLOUDFLARE.COM
   DNSSEC: signed`,
            outType: "info",
          },
          {
            cmd: "dig kali.org ANY +short",
            out: `192.124.249.10
2604:a880:4:1d0::e1:f000
v=spf1 ip4:192.124.249.10 ip6:2604:a880:4:1d0::e1:f000 ~all
0 issue "letsencrypt.org"
britney.ns.cloudflare.com.
apollo.ns.cloudflare.com.`,
            outType: "default",
          },
          {
            comment: "qual ISP/empresa hospeda esse IP?",
            cmd: "whois -h whois.cymru.com \" -v 192.124.249.10\"",
            out: `AS      | IP               | BGP Prefix          | CC | Registry | Allocated  | AS Name
40695   | 192.124.249.10   | 192.124.249.0/24    | US | ARIN     | 2014-04-28 | OFFENSIVE-SECURITY, US`,
            outType: "success",
          },
        ]}
      />

      <h2>Subdomínios e certificados</h2>
      <p>
        Cada certificado TLS emitido entra no log público de <strong>Certificate Transparency</strong>.
        Isso vaza subdomínios mesmo de empresas que tentam esconder.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "curl -s 'https://crt.sh/?q=%25.kali.org&output=json' | jq -r '.[].name_value' | sort -u | head -10",
            out: `*.docs.kali.org
*.kali.org
bugs.kali.org
docs.kali.org
forums.kali.org
http.kali.org
kali.org
www.kali.org`,
            outType: "info",
          },
          {
            comment: "alternativa com a ferramenta dedicada",
            cmd: "subfinder -d kali.org -silent",
            out: `kali.org
http.kali.org
docs.kali.org
forums.kali.org
www.kali.org
bugs.kali.org
gitlab.com.kali.org
old.kali.org
pkg.kali.org`,
            outType: "default",
          },
          {
            comment: "amass faz combinação de fontes (mais lento, mais completo)",
            cmd: "amass enum -passive -d kali.org -o subs.txt && wc -l subs.txt",
            out: "147 subs.txt",
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Ferramentas OSINT no Kali"
        variations={[
          { cmd: "theHarvester", desc: "Emails, subdomínios, hosts a partir de search engines.", output: "Página dedicada: theHarvester" },
          { cmd: "shodan / censys", desc: "Mecanismos de busca de hosts/serviços expostos na internet.", output: "Página: Shodan" },
          { cmd: "sherlock", desc: "Busca o mesmo username em centenas de redes sociais.", output: "sherlock wallysondevs" },
          { cmd: "h8mail", desc: "Procura emails em vazamentos públicos (HIBP, Snusbase).", output: "h8mail -t alvo@empresa.com" },
          { cmd: "spiderfoot", desc: "Plataforma OSINT all-in-one (200+ módulos).", output: "spiderfoot -l 127.0.0.1:5001" },
          { cmd: "recon-ng", desc: "Framework modular tipo Metasploit, mas para OSINT.", output: "Página: Recon-ng" },
          { cmd: "maltego", desc: "GUI gráfica de análise (links/transformações).", output: "Página: Maltego" },
          { cmd: "exiftool", desc: "Metadados (EXIF) de fotos, PDFs, docs Office.", output: "exiftool foto.jpg | grep GPS" },
          { cmd: "wayback", desc: "Snapshots históricos do site em archive.org.", output: "waybackurls dominio.com | sort -u" },
        ]}
      />

      <h2>Google Dorks</h2>
      <p>
        Operadores de busca que filtram resultados — descobrem painéis admin, .env vazados,
        backups esquecidos. Veja a página dedicada{" "}
        <a href="#/google-dorks"><strong>Google Dorks (GHDB)</strong></a>.
      </p>

      <CodeBlock
        language="text"
        title="dorks rápidos para reconhecimento"
        code={`# Subdomínios
site:*.empresa.com -www

# Painéis de login
site:empresa.com inurl:admin
site:empresa.com inurl:login

# Arquivos sensíveis
site:empresa.com filetype:pdf "confidencial"
site:empresa.com filetype:env
site:empresa.com filetype:sql

# Documentos com metadados
site:empresa.com filetype:docx OR filetype:xlsx

# Erros expondo tecnologia
site:empresa.com intext:"sql syntax error"
site:empresa.com intext:"mysql_fetch_array"

# Diretórios listados
site:empresa.com intitle:"Index of /"`}
      />

      <h2>People search — funcionários</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "username em 400+ redes sociais",
            cmd: "sherlock wallysondevs --print-found",
            out: `[*] Checking username wallysondevs on:
[+] GitHub: https://github.com/wallysondevs
[+] LinkedIn: https://linkedin.com/in/wallysondevs
[+] X (Twitter): https://x.com/wallysondevs
[+] Instagram: https://instagram.com/wallysondevs
[+] Replit: https://replit.com/@wallysondevs
[+] Reddit: https://reddit.com/user/wallysondevs

[*] Search completed with 6 results`,
            outType: "info",
          },
          {
            comment: "achar email de funcionário pelo padrão",
            cmd: "theHarvester -d empresa.com -b duckduckgo,bing,crtsh -l 500",
            out: `[*] Target: empresa.com 

[*] Searching DuckDuckGo.
[*] Searching Bing.
[*] Searching crtsh.

[*] No IPs found.

[*] Emails found: 23
----------------------
contato@empresa.com
joao.silva@empresa.com
maria.santos@empresa.com
[...]

[*] Hosts found: 18
---------------------
www.empresa.com:200.150.10.42
mail.empresa.com:200.150.10.45
vpn.empresa.com:200.150.10.50`,
            outType: "success",
          },
        ]}
      />

      <h2>Vazamentos de credencial</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "checar se um email está em algum leak conhecido",
            cmd: "h8mail -t alvo@empresa.com",
            out: `╭─[ ⠿ ] [Connecting...] HIBP
╰─[ ✔ ] HIBP — alvo@empresa.com — appeared in 4 breaches:
        2019-05 — Canva
        2020-12 — LinkedIn (ScrapedAPI)
        2021-04 — Facebook (533M leak)
        2023-11 — DailyQuiz

╭─[ ⠿ ] [Connecting...] Snusbase
╰─[ ✔ ] Snusbase — 12 hashed passwords for alvo@empresa.com (use -p para pegar)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Metadados em arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "EXIF de uma foto pode entregar GPS, modelo de câmera, software",
            cmd: "exiftool foto-publicada.jpg | head -20",
            out: `ExifTool Version Number         : 13.00
File Name                       : foto-publicada.jpg
File Size                       : 4.2 MB
Make                            : Apple
Camera Model Name               : iPhone 14 Pro
Software                        : 17.4.1
Date/Time Original              : 2026:03:12 14:23:01
Lens Model                      : iPhone 14 Pro back triple camera 6.86mm f/1.78
Image Width                     : 4032
Image Height                    : 3024
GPS Latitude                    : 23 deg 32' 51.24" S
GPS Longitude                   : 46 deg 38' 9.96" W
GPS Position                    : 23 deg 32' 51.24" S, 46 deg 38' 9.96" W
GPS Altitude                    : 745.2 m Above Sea Level
City                            : São Paulo
State                           : SP
Country                         : Brazil`,
            outType: "warning",
          },
          {
            comment: "PDF — autor e software original",
            cmd: "exiftool relatorio.pdf | grep -iE 'author|creator|producer'",
            out: `Author                          : Maria Souza (TI)
Creator                         : Microsoft® Word para Microsoft 365
Producer                        : Microsoft® Word para Microsoft 365`,
            outType: "info",
          },
        ]}
      />

      <h2>Wayback Machine — versões antigas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "waybackurls empresa.com | head -10",
            out: `https://empresa.com/admin
https://empresa.com/admin/login.php?error=1
https://empresa.com/api/v1/users
https://empresa.com/backup.zip
https://empresa.com/dev/test.php
https://empresa.com/internal/relatorio.pdf
https://empresa.com/staging/.env
https://empresa.com/wp-config.php.bak`,
            outType: "warning",
          },
          {
            comment: "filtrar só os arquivos sensíveis",
            cmd: "waybackurls empresa.com | grep -iE '\\.env$|\\.zip$|\\.bak$|\\.sql$|\\.git'",
            out: `https://empresa.com/backup.zip
https://empresa.com/staging/.env
https://empresa.com/wp-config.php.bak
https://empresa.com/.git/config
https://empresa.com/dump.sql.gz`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Faça um perfil OSINT de você mesmo"
        goal="Veja o que está exposto sobre o seu próprio nome/username — base ética para depois aplicar em alvos autorizados."
        steps={[
          "Procure seu username principal no sherlock.",
          "Veja seu email no h8mail (HIBP é gratuito).",
          "Liste os subdomínios do seu site pessoal pelo crt.sh.",
          "Veja o histórico do seu site no Wayback Machine.",
        ]}
        command={`USER="seu-username"
EMAIL="voce@seu-email.com"
DOMAIN="seudominio.com"

sherlock $USER --print-found
h8mail -t $EMAIL
curl -s "https://crt.sh/?q=%25.$DOMAIN&output=json" | jq -r '.[].name_value' | sort -u
curl -s "http://web.archive.org/cdx/search/cdx?url=$DOMAIN/*&output=text&fl=original" | head -20`}
        expected={`(varia por pessoa — mas é provável que apareça mais do que você esperava)`}
        verify="Confirme: 1) quantas redes sociais te listam, 2) se aparece em algum leak, 3) quais subdomínios estão expostos."
      />

      <AlertBox type="info" title="OSINT é passivo — mas a ETAPA SEGUINTE não">
        OSINT puro (consultar fontes públicas) é legal em quase todo lugar.
        Mas a partir do momento em que você <em>conecta</em> ao alvo (varredura, dirbusting,
        teste de credencial) já entra na zona regulada — exija autorização por escrito.
      </AlertBox>
    </PageContainer>
  );
}
