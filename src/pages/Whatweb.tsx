import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Whatweb() {
  return (
    <PageContainer
      title="WhatWeb — fingerprinting de tecnologia web"
      subtitle="Identifica CMS, frameworks, plugins, servidores e versões a partir do tráfego HTTP."
      difficulty="iniciante"
      timeToRead="8 min"
      prompt="recon/whatweb"
    >
      <h2>Por que importa</h2>
      <p>
        Saber a versão exata do WordPress, Apache, Drupal ou Joomla muda tudo: você consegue
        rapidamente bater na <a href="#/searchsploit">searchsploit</a> ou{" "}
        <a href="#/cve-research">CVE</a> e ver se há exploit público.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "whatweb --version",
            out: `WhatWeb version 0.5.5 ( https://www.morningstarsecurity.com/research/whatweb )`,
            outType: "info",
          },
        ]}
      />

      <h2>Primeira varredura</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "whatweb https://kali.org",
            out: `https://kali.org [200 OK] Cloudflare, Country[UNITED STATES][US], HTML5, HTTPServer[cloudflare], HTTrack[3.49-2], IP[192.124.249.10], Open-Graph-Protocol[website], Strict-Transport-Security[max-age=31536000; includeSubDomains; preload], Title[Kali Linux | Penetration Testing and Ethical Hacking Linux Distribution], UncommonHeaders[cf-cache-status,report-to,nel,server-timing,cf-ray,alt-svc], WordPress[6.6.2], X-Powered-By[WordPress.com VIP]`,
            outType: "success",
          },
          {
            cmd: "whatweb -v https://wordpress.org/news/",
            out: `WhatWeb report for https://wordpress.org/news/
Status    : 200 OK
Title     : News – WordPress.org
IP        : 198.143.164.252
Country   : UNITED STATES, US

Summary   : HTML5, JQuery[3.7.0], MetaGenerator[WordPress 6.7-RC1-58999], Script[application/json], Title[News – WordPress.org], WordPress[6.7-RC1]

Detected Plugins:
[ JQuery ]
        A fast, concise, JavaScript Library that simplifies how to traverse HTML 
        documents, handle events, perform animations.
        Version      : 3.7.0
        
[ MetaGenerator ]
        This plugin keeps track of meta tags with the name "generator". 
        String       : WordPress 6.7-RC1-58999

[ WordPress ]
        WordPress is a blog tool, publishing platform and CMS.
        Module       : Detected from Meta Generator
        Version      : 6.7-RC1`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Flags principais"
        variations={[
          { cmd: "-v", desc: "Verbose: mostra plugin a plugin com versão.", output: "Sempre use em alvos importantes." },
          { cmd: "-a 3", desc: "Aggression level (1=passivo, 3=intermediário, 4=heavy).", output: "Mais alto = mais ruidoso." },
          { cmd: "-p plus,minus", desc: "Forçar/excluir plugins.", output: "-p +Apache" },
          { cmd: "-l", desc: "Lista todos os plugins disponíveis (~1700+).", output: "whatweb -l | wc -l" },
          { cmd: "-i hosts.txt", desc: "Lê alvos de arquivo.", output: "Para varrer lista grande." },
          { cmd: "--log-brief saida.txt", desc: "Saída resumida em arquivo.", output: "1 linha por host." },
          { cmd: "--log-verbose saida.txt", desc: "Saída completa.", output: "Detalhe igual ao -v." },
          { cmd: "--log-json saida.json", desc: "JSON estruturado.", output: "Para automação." },
          { cmd: "--log-xml saida.xml", desc: "XML.", output: "Para importar em outras tools." },
          { cmd: "-U \"Mozilla/5.0\"", desc: "User-Agent custom.", output: "Para imitar browser real." },
          { cmd: "-H \"Cookie: session=xyz\"", desc: "Header custom.", output: "Para acessar áreas autenticadas." },
        ]}
      />

      <h2>Varredura em massa</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat alvos.txt",
            out: `https://www.empresa.com
https://api.empresa.com
https://blog.empresa.com
https://shop.empresa.com
https://help.empresa.com`,
            outType: "default",
          },
          {
            cmd: "whatweb -i alvos.txt --log-brief web_stack.txt --log-json web_stack.json",
            out: `https://www.empresa.com [200 OK] HTML5, HTTPServer[nginx/1.27.1], JQuery[3.6.0], Script[text/javascript]
https://api.empresa.com [200 OK] HTTPServer[nginx/1.27.1], X-Powered-By[Express], Cookies[connect.sid]
https://blog.empresa.com [200 OK] HTML5, HTTPServer[Apache/2.4.41], MetaGenerator[WordPress 6.6.2], WordPress[6.6.2]
https://shop.empresa.com [200 OK] HTML5, HTTPServer[nginx], MetaGenerator[Magento Commerce], Magento[2.4.5]
https://help.empresa.com [200 OK] HTML5, HTTPServer[cloudflare], MetaGenerator[Zendesk]`,
            outType: "success",
          },
          {
            cmd: "jq -r '.[] | [.target, .plugins | to_entries | map(.key)[]] | @csv' web_stack.json | head -5",
            out: `"https://www.empresa.com","HTML5","HTTPServer","JQuery","Script"
"https://api.empresa.com","HTTPServer","X-Powered-By","Cookies"
"https://blog.empresa.com","HTML5","HTTPServer","MetaGenerator","WordPress"
"https://shop.empresa.com","HTML5","HTTPServer","MetaGenerator","Magento"
"https://help.empresa.com","HTML5","HTTPServer","MetaGenerator"`,
            outType: "info",
          },
        ]}
      />

      <h2>Combo com httpx</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "httpx é mais rápido para descobrir hosts vivos; whatweb dá detalhe",
            cmd: "subfinder -d empresa.com -silent | httpx -silent -title -tech-detect | tee alive.txt",
            out: `https://www.empresa.com [200] [Empresa - Início] [nginx,react,bootstrap]
https://api.empresa.com [200] [API ACME] [nginx,nodejs,express]
https://blog.empresa.com [200] [Blog] [Apache,WordPress:6.6.2,jquery]
https://admin.empresa.com [302] [Login] [nginx,php]`,
            outType: "info",
          },
          {
            comment: "agora whatweb -v só nos que valem investigação",
            cmd: "awk '{print $1}' alive.txt | grep -v 'cdn\\|asset' | whatweb --log-verbose detalhes.txt -",
            out: "(silencioso. detalhes.txt cresce)",
            outType: "muted",
          },
        ]}
      />

      <h2>Identificando vetor de ataque rápido</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "whatweb -v https://blog.empresa.com",
            out: `WhatWeb report for https://blog.empresa.com
Status    : 200 OK

Detected Plugins:
[ Apache ]
        Version      : 2.4.41 (Ubuntu)

[ WordPress ]
        Version      : 5.7.2          ← VERSÃO ANTIGA

[ JQuery ]
        Version      : 1.12.4         ← VERSÃO ANTIGA (CVE-2020-11023)`,
            outType: "warning",
          },
          {
            comment: "agora você sabe exatamente o que procurar",
            cmd: "searchsploit wordpress 5.7",
            out: `------------------------------------------------------- ----------------------------------------
 Exploit Title                                         |  Path
------------------------------------------------------- ----------------------------------------
WordPress Plugin All-in-One SEO Pack 4.1.5.2 - Auth.   | php/webapps/50953.txt
WordPress Plugin Backup Migration 1.3.7 - RCE          | php/webapps/51985.py
WordPress Plugin Elementor 3.6.2 - Auth. RCE           | php/webapps/50801.py
WordPress Plugin File Manager 6.9 - Unauth. RCE        | php/webapps/49178.rb
WordPress Plugin WP Sync DB 1.6 - SQL Injection        | php/webapps/49327.txt
[...]`,
            outType: "error",
          },
          {
            cmd: "wpscan --url https://blog.empresa.com --enumerate vp",
            out: `[+] WordPress version 5.7.2 identified (Outdated, released on 2021-05-12)
[+] WordPress theme in use: twentytwenty
[+] Enumerating Vulnerable Plugins (via Passive Methods)

[i] No plugins Found.

[+] Enumerating Themes Vulnerabilities
[i] WordPress core 5.7.2 vulnerabilities:
 | Title: WordPress 5.4 to 5.8 - SSRF (CVE-2022-3590)
 | Title: WordPress < 5.8.3 - Object Injection (CVE-2022-21663)
 | Title: WordPress < 5.8.3 - SQL Injection (CVE-2022-21661)`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Stack survey de N alvos"
        goal="Para uma lista de URLs, gerar um inventário CSV com tecnologia identificada por host."
        steps={[
          "Coloque URLs em alvos.txt (uma por linha).",
          "Rode whatweb com --log-json.",
          "Use jq para gerar CSV.",
          "Para cada CMS antigo (WordPress<6, Drupal<10, Joomla<4), rode searchsploit.",
        ]}
        command={`whatweb -i alvos.txt --log-json out.json --log-brief brief.txt
jq -r '.[] | [.target, (.plugins | keys | join(";"))] | @csv' out.json > tech.csv

# Mostrar só hosts com WordPress
grep -i 'WordPress' brief.txt`}
        expected={`https://www.empresa.com [200 OK] HTML5,HTTPServer[nginx],JQuery[3.6.0]
https://blog.empresa.com [200 OK] WordPress[6.6.2],HTTPServer[Apache/2.4.41]
https://shop.empresa.com [200 OK] Magento[2.4.5],HTTPServer[nginx]

(tech.csv com 1 linha por alvo + colunas de tecnologia)`}
        verify="Procure no CSV qualquer linha com versão antiga (WordPress<6.0, Magento<2.4.4, Drupal<10) — vetores prováveis."
      />

      <AlertBox type="info" title="Detecção é heurística">
        O WhatWeb identifica por meta-tags, headers HTTP, cookies e regex em HTML. Aplicações
        bem configuradas escondem versão (server tokens off, WordPress security plugins).
        Combine sempre com <strong>nuclei</strong>, <strong>nmap NSE</strong> e teste manual.
      </AlertBox>
    </PageContainer>
  );
}
