import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function GoogleDorks() {
  return (
    <PageContainer
      title="Google Dorks (GHDB)"
      subtitle="Operadores de busca avançada — encontram painéis, .env, backups e dados sensíveis indexados pelo Google."
      difficulty="iniciante"
      timeToRead="11 min"
    >
      <h2>Operadores essenciais do Google</h2>
      <CommandTable
        title="Os operadores que mudam tudo"
        variations={[
          { cmd: "site:empresa.com", desc: "Restringe ao domínio.", output: "site:*.empresa.com pega subdomínios." },
          { cmd: "inurl:admin", desc: "URL contém o termo.", output: "inurl:login.php / inurl:wp-admin" },
          { cmd: "intitle:\"Index of\"", desc: "Tag <title> contém o termo.", output: "Listagem de diretório aberta." },
          { cmd: "intext:\"password\"", desc: "Texto da página contém.", output: "Combine com filetype." },
          { cmd: "filetype:pdf", desc: "Só esse tipo de arquivo.", output: "filetype:env, filetype:sql, filetype:log" },
          { cmd: "ext:bak", desc: "Por extensão (alternativa a filetype).", output: "ext:old, ext:backup, ext:swp" },
          { cmd: "cache:url", desc: "Versão em cache do Google.", output: "Vê o que foi indexado mesmo se já tirou." },
          { cmd: "related:site.com", desc: "Sites parecidos.", output: "Bom para mapeamento de cadeia." },
          { cmd: "-termo", desc: "EXCLUIR (subtração).", output: "site:empresa.com -www" },
          { cmd: "\"frase exata\"", desc: "Match literal entre aspas.", output: "Para banner errors específicos." },
          { cmd: "OR / |", desc: "Alternativa.", output: "(login | logon | signin)" },
          { cmd: "*", desc: "Wildcard (1 palavra qualquer).", output: "\"powered by * cms\"" },
          { cmd: "AROUND(N)", desc: "Termos a até N palavras de distância.", output: "admin AROUND(3) password" },
        ]}
      />

      <h2>Dorks de RECON — descobrir tecnologia</h2>
      <CodeBlock
        language="text"
        title="recon de stack"
        code={`# Versão de software exposta em rodapé
site:empresa.com intext:"Powered by"
site:empresa.com intext:"Powered by WordPress"
site:empresa.com intext:"Joomla! 3"
site:empresa.com intext:"Drupal 7"

# Erros revelando tecnologia
site:empresa.com intext:"SQL syntax error"
site:empresa.com intext:"Warning: mysql_"
site:empresa.com intext:"PHP Parse error"
site:empresa.com intext:"Microsoft OLE DB Provider"
site:empresa.com intext:"Fatal error: Uncaught"

# Endpoints típicos por framework
site:empresa.com inurl:wp-login.php
site:empresa.com inurl:administrator/index.php   (Joomla)
site:empresa.com inurl:phpmyadmin
site:empresa.com inurl:adminer.php
site:empresa.com inurl:user/login                (Drupal)
site:empresa.com inurl:.git
site:empresa.com inurl:/server-status

# WAF / CDN
site:empresa.com -inurl:cdn -inurl:assets`}
      />

      <h2>Dorks de PAINÉIS — login expostos</h2>
      <CodeBlock
        language="text"
        title="painéis de admin/gerenciamento"
        code={`# Genéricos
intitle:"Login" inurl:admin
intitle:"Admin Login"
intitle:"Sign In" inurl:admin

# Por software conhecido
intitle:"phpMyAdmin" inurl:setup
intitle:"Webmin"
intitle:"Tomcat Manager"
intitle:"Jenkins" inurl:8080
intitle:"GitLab" inurl:users/sign_in
intitle:"Grafana" inurl:login
intitle:"Nagios"
intitle:"Cisco IOS" inurl:admin
intitle:"Synology DiskStation"

# Câmeras
intitle:"webcamXP 5"
intitle:"Network Camera NetworkCamera"
inurl:"/view.shtml"
inurl:"axis-cgi/mjpg"`}
      />

      <h2>Dorks de DADOS sensíveis</h2>
      <CodeBlock
        language="text"
        title="vazamentos clássicos"
        code={`# .env, configs em git
site:empresa.com filetype:env
site:empresa.com filetype:env "DB_PASSWORD"
site:empresa.com inurl:.git/config
site:empresa.com filetype:yml "secret"

# Backups esquecidos
site:empresa.com ext:sql
site:empresa.com ext:bak
site:empresa.com ext:old
site:empresa.com ext:swp     (vim swap)

# Logs deixados públicos
site:empresa.com filetype:log
site:empresa.com ext:log "PHP Notice"

# Indexes abertos
site:empresa.com intitle:"Index of /admin"
site:empresa.com intitle:"Index of /backup"
site:empresa.com intitle:"Index of /database"
site:empresa.com intitle:"Index of /logs"

# Documentos com metadados (autor, software)
site:empresa.com filetype:pdf "confidencial"
site:empresa.com filetype:docx
site:empresa.com filetype:xlsx
site:empresa.com filetype:pptx`}
      />

      <h2>Dorks de SENHAS expostas</h2>
      <CodeBlock
        language="text"
        title="reservar para autorização — apenas auditoria do próprio domínio"
        code={`# Configs com senha
intext:"DB_PASSWORD" filetype:env
intext:"AWS_SECRET_ACCESS_KEY" ext:env
intext:"client_secret" filetype:json

# Listagem de senhas em texto puro (URGENTE em report)
filetype:txt "username:" "password:"
filetype:csv "email" "password"
inurl:wp-config.php intext:"DB_PASSWORD"

# Tokens
intext:"ghp_" ext:env       (GitHub PAT)
intext:"sk-" ext:env        (Stripe / OpenAI keys)
intext:"AKIA" filetype:env  (AWS access key id)`}
      />

      <h2>Operadores — sintaxe combinada</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "exemplo prático: encontrar painel WordPress sem TLS",
            cmd: "(no Google) site:*.gov.br inurl:wp-login.php -inurl:https",
            out: "(retorna logins WP em HTTP — alvo trivial de MitM)",
            outType: "warning",
          },
          {
            comment: "PDFs internos com 'confidencial' que escaparam",
            cmd: "(no Google) site:empresa.com filetype:pdf (confidencial OR \"uso interno\" OR restrito)",
            out: "(varia por empresa — quase sempre encontra ALGUMA coisa)",
            outType: "warning",
          },
        ]}
      />

      <h2>GHDB — Google Hacking Database</h2>
      <p>
        A <a href="https://www.exploit-db.com/google-hacking-database" target="_blank" rel="noreferrer">
        GHDB</a> é mantida pela Offensive Security (mesma do Kali) e tem 7000+ dorks
        organizados por categoria.
      </p>

      <CommandTable
        title="Categorias da GHDB"
        variations={[
          { cmd: "Footholds", desc: "Pontos de entrada que dão shell ou RCE.", output: "Webshells, painéis sem auth." },
          { cmd: "Files Containing Usernames", desc: "Listagens de usuários, .htpasswd.", output: "Útil para spraying." },
          { cmd: "Sensitive Directories", desc: "/admin, /backup, /private indexados.", output: "Acesso direto ao sensitive." },
          { cmd: "Web Server Detection", desc: "Pegar versão do servidor.", output: "Apache, IIS, nginx versions." },
          { cmd: "Vulnerable Files", desc: "Arquivos com vuln conhecida.", output: "phpinfo.php, test.php." },
          { cmd: "Vulnerable Servers", desc: "Versões de servidor com CVE pública.", output: "Combinar com searchsploit." },
          { cmd: "Error Messages", desc: "Stack traces revelando paths/banco.", output: "MySQL syntax, .NET unhandled." },
          { cmd: "Files Containing Juicy Info", desc: "PII, financial, internal docs.", output: "filetype:xls 'salary'" },
          { cmd: "Files Containing Passwords", desc: "Senhas em texto puro.", output: "Reportar IMEDIATAMENTE no escopo." },
          { cmd: "Sensitive Online Shopping Info", desc: "Dados de transação expostos.", output: "Cartões, CVV em logs." },
          { cmd: "Network or Vulnerability Data", desc: "Configs de rede.", output: "Cisco running-config, etc." },
          { cmd: "Pages Containing Login Portals", desc: "Painéis indexados.", output: "Phishing-bait reverso." },
          { cmd: "Various Online Devices", desc: "Câmeras, impressoras, IoT.", output: "Use Shodan também." },
          { cmd: "Advisories and Vulnerabilities", desc: "Avisos publicados.", output: "Confirmar com searchsploit." },
        ]}
      />

      <h2>Automação — cuidado com rate-limit</h2>
      <p>
        O Google bloqueia rapidamente queries automatizadas. Use:
      </p>
      <CommandTable
        title="Alternativas para scraping em escala"
        variations={[
          { cmd: "Bing API", desc: "Cota free + paga, sem CAPTCHA frequente.", output: "Mais flexível para scripts." },
          { cmd: "DuckDuckGo HTML", desc: "html.duckduckgo.com — não bloqueia tanto.", output: "Bom para coleta moderada." },
          { cmd: "SerpAPI", desc: "Wrapper pago do Google.", output: "Pratique sem ban." },
          { cmd: "googler / ddgr", desc: "CLI clients (apt install).", output: "googler -n 5 'site:kali.org filetype:pdf'" },
          { cmd: "shodan + censys", desc: "Para tudo que envolve serviços/portas.", output: "Mais preciso que Google." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "googler -n 5 \"site:kali.org filetype:pdf\"",
            out: `1 The Ultimate Kali Linux Book - Second Edition
  https://kali.training/downloads/Kali-Linux-Revealed-1st-edition.pdf
  Comprehensive guide to mastering Kali Linux 2024.

2 Introduction to Penetration Testing - Kali
  https://kali.org/docs/intro/intro.pdf
  Official intro PDF — basic methodology and tooling.
[...]`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Auditoria do seu próprio domínio com dorks"
        goal="Encontrar arquivos sensíveis SEUS que o Google indexou inadvertidamente."
        steps={[
          "Liste no Google: site:seudominio.com ext:env OR ext:bak OR ext:sql OR ext:log.",
          "Procure: site:seudominio.com intitle:\"Index of\".",
          "Procure: site:seudominio.com inurl:.git.",
          "Para cada achado: bloqueie via robots.txt + remova do servidor + use Search Console (Remove URL).",
        ]}
        command={`# Cole no Google Search:
site:seudominio.com (ext:env | ext:bak | ext:sql | ext:log | ext:swp | ext:old)
site:seudominio.com intitle:"Index of"
site:seudominio.com inurl:.git
site:seudominio.com inurl:wp-config

# Verifique também:
# https://search.google.com/search-console
# https://www.google.com/webmasters/tools/removals`}
        expected={`(o resultado IDEAL é "Sem resultados" — qualquer hit é ação imediata)`}
        verify="Configure robots.txt + Search Console para que arquivos sensíveis nunca mais apareçam."
      />

      <AlertBox type="danger" title="Acessar é diferente de ver">
        Ver um arquivo sensível indexado pelo Google em um site que não é seu, sem autorização,
        ainda é acesso não autorizado se você abrir o link. Use dorks como inteligência —
        para confirmar o achado em campo, exija autorização escrita.
      </AlertBox>
    </PageContainer>
  );
}
