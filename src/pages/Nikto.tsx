import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Nikto() {
  return (
    <PageContainer
      title="Nikto — scanner web rápido"
      subtitle="Varredura clássica de servidores web: arquivos perigosos, configurações default, versões antigas."
      difficulty="iniciante"
      timeToRead="9 min"
    >
      <h2>O que faz</h2>
      <p>
        Nikto roda 7000+ checks pré-definidos contra servidores web: arquivos sensíveis comuns
        (<code>/admin</code>, <code>/.env</code>, <code>/server-status</code>), versões com CVE,
        opções perigosas do servidor (PUT/DELETE habilitados), headers ausentes.
        É <strong>barulhento</strong> — fácil de detectar por IDS — mas rápido.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "nikto -Version",
            out: `-Nikto v2.5.0
+ Nikto plugins:
+ 7008 server checks loaded
+ Last update: 2024-12-17`,
            outType: "info",
          },
        ]}
      />

      <h2>Scan básico</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nikto -h https://app.local",
            out: `- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          200.150.10.42
+ Target Hostname:    app.local
+ Target Port:        443
+ SSL Info:           Subject:  /CN=app.local
                      Ciphers:  TLS_AES_256_GCM_SHA384
                      Issuer:   /C=US/O=Let's Encrypt/CN=R3
+ Start Time:         2026-04-03 12:34:18 (GMT-3)
---------------------------------------------------------------------------
+ Server: Apache/2.4.41 (Ubuntu)
+ /robots.txt: contains 7 entries which should be manually viewed.
+ Apache/2.4.41 appears to be outdated (current is at least Apache/2.4.62).
+ Allowed HTTP Methods: GET, POST, OPTIONS, HEAD, TRACE
+ OSVDB-877: HTTP TRACE method is active, suggesting the host is vulnerable to XST
+ /admin/: This might be interesting...
+ /backup/: Directory indexing found.
+ /server-status: Apache server-status interface found (pass protected).
+ /phpmyadmin/: phpMyAdmin directory found
+ /phpinfo.php: Output from the phpinfo() function was found.
+ /wp-content/plugins/akismet/readme.txt: WordPress plugin found.
+ /.git/HEAD: Git repository found in document root.
+ /.env: .env configuration file accessible.
+ Cookie PHPSESSID created without the httponly flag
+ Cookie PHPSESSID created without the secure flag
+ X-Frame-Options header is not present.
+ X-Content-Type-Options header is not present.
+ Content-Security-Policy header is not present.
+ ETag header found on server, inode: 1234, size: 5678
+ Strict-Transport-Security HTTP header NOT set.
+ 8347 requests: 0 error(s) and 22 item(s) reported on remote host
+ End Time:           2026-04-03 12:38:42 (GMT-3) (264 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Flags principais"
        variations={[
          { cmd: "-h URL", desc: "Alvo (com http:// ou https://, ou só IP).", output: "Pode ser arquivo: -h hosts.txt" },
          { cmd: "-p 443,8080", desc: "Portas (lista ou range).", output: "Sem -p, detecta automaticamente." },
          { cmd: "-ssl", desc: "Força HTTPS.", output: "Por padrão detecta." },
          { cmd: "-Tuning N", desc: "Categoria de testes (1-9).", output: "Veja tabela abaixo." },
          { cmd: "-evasion 1-8", desc: "Técnicas de evasão de IDS.", output: "1=URL encoding, 4=premature URL ending, etc." },
          { cmd: "-useragent \"...\"", desc: "User-Agent custom.", output: "Por default usa 'Nikto'." },
          { cmd: "-id user:pass", desc: "Basic auth.", output: "Para áreas protegidas." },
          { cmd: "-Cookies \"name=value\"", desc: "Cookies.", output: "Para áreas autenticadas." },
          { cmd: "-Format html|xml|csv|txt", desc: "Formato de saída.", output: "html é mais legível para report." },
          { cmd: "-output saida.html", desc: "Arquivo de saída.", output: "Combine com -Format." },
          { cmd: "-Plugins all", desc: "Carregar plugins extras.", output: "list_plugins para ver tudo." },
          { cmd: "-update", desc: "Atualiza database.", output: "Roda periodicamente." },
        ]}
      />

      <h2>Tuning — o que testar</h2>
      <CommandTable
        title="-Tuning N"
        variations={[
          { cmd: "1", desc: "Interesting File / Seen in logs.", output: "Acha arquivos sensíveis." },
          { cmd: "2", desc: "Misconfiguration / Default File.", output: "Configs default." },
          { cmd: "3", desc: "Information Disclosure.", output: "Versões, banners." },
          { cmd: "4", desc: "Injection (XSS, etc).", output: "Testes ofensivos." },
          { cmd: "5", desc: "Remote File Retrieval — Inside Web Root.", output: "LFI dentro do site." },
          { cmd: "6", desc: "Denial of Service.", output: "PERIGOSO em produção." },
          { cmd: "7", desc: "Remote File Retrieval — Server Wide.", output: "LFI fora do webroot." },
          { cmd: "8", desc: "Command Execution / Remote Shell.", output: "RCE checks." },
          { cmd: "9", desc: "SQL Injection.", output: "Detecção básica de SQLi." },
          { cmd: "0", desc: "File Upload.", output: "Endpoints de upload." },
          { cmd: "x", desc: "Reverse Tuning Options (excluir).", output: "-Tuning x6 = tudo MENOS DoS." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "scan focado em arquivos sensíveis + info disclosure",
            cmd: "nikto -h https://app.local -Tuning 13",
            out: `+ /robots.txt: contains 12 entries
+ /.git/HEAD: Git repository found in document root.
+ /.env: .env configuration file accessible.
+ /backup.zip: Backup file found.
+ /phpinfo.php: phpinfo output exposed.
+ /server-status: Apache server-status interface found.
+ /wp-config.php.bak: Backup of WordPress config.`,
            outType: "warning",
          },
          {
            comment: "scan rápido — só info disclosure (Tuning 3)",
            cmd: "nikto -h https://app.local -Tuning 3 -maxtime 60s",
            out: "(termina em até 60s)",
            outType: "muted",
          },
        ]}
      />

      <h2>Saída em formatos úteis</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nikto -h https://app.local -Format html -output relatorio.html",
            out: "+ Wrote 22 issue(s) to relatorio.html",
            outType: "info",
          },
          {
            cmd: "nikto -h https://app.local -Format csv -output achados.csv",
            out: "+ Wrote 22 issue(s) to achados.csv",
            outType: "default",
          },
          {
            cmd: "nikto -h https://app.local -Format xml -output saida.xml",
            out: "(útil para importar em outras ferramentas)",
            outType: "muted",
          },
        ]}
      />

      <h2>Evasão de IDS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nikto -h https://app.local -evasion 1234 -useragent 'Mozilla/5.0'",
            out: `(usa: 1=Random URI encoding (non-UTF8) + 2=Directory self-reference + 3=Premature URL ending + 4=Prepend long random string)`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Técnicas de -evasion"
        variations={[
          { cmd: "1", desc: "Random URI encoding (non-UTF8).", output: "/admin → /%61%64%6d%69%6e" },
          { cmd: "2", desc: "Directory self-reference (/./).", output: "/admin → /./admin" },
          { cmd: "3", desc: "Premature URL ending.", output: "/admin → /admin?" },
          { cmd: "4", desc: "Prepend long random string.", output: "Confunde signatures simples." },
          { cmd: "5", desc: "Fake parameter.", output: "/admin?fake=1234" },
          { cmd: "6", desc: "TAB as request spacer.", output: "GET\\t/admin\\tHTTP/1.1" },
          { cmd: "7", desc: "Change case.", output: "GeT /AdMiN" },
          { cmd: "8", desc: "Use Windows path separator (\\).", output: "/admin\\file" },
        ]}
      />

      <h2>Múltiplos hosts</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat hosts.txt",
            out: `https://www.empresa.com
https://api.empresa.com
https://blog.empresa.com:8443
https://admin.empresa.com`,
            outType: "default",
          },
          {
            cmd: "nikto -h hosts.txt -Format csv -output todos.csv",
            out: `[*] Scanning https://www.empresa.com
[*] Scanning https://api.empresa.com
[*] Scanning https://blog.empresa.com:8443
[*] Scanning https://admin.empresa.com
+ Wrote 87 issues to todos.csv`,
            outType: "info",
          },
        ]}
      />

      <h2>Combinando com outras ferramentas</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) hosts vivos com httpx",
            cmd: "subfinder -d empresa.com -silent | httpx -silent | tee live.txt",
            out: `https://www.empresa.com
https://api.empresa.com
https://blog.empresa.com`,
            outType: "default",
          },
          {
            comment: "2) nikto em paralelo (-h list)",
            cmd: "nikto -h live.txt -Format html -output combo.html",
            out: "(roda nikto em sequência em todos)",
            outType: "muted",
          },
          {
            comment: "3) achados → input para nuclei (mais profundo)",
            cmd: "nuclei -l live.txt -t cves/ -severity high,critical",
            out: "[CVE-2024-3094] [http] [critical] https://blog.empresa.com - Apache 2.4.41 backdoor",
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Auditoria rápida do seu próprio site"
        goal="Em 5 minutos, identificar arquivos sensíveis, headers ruins e versões antigas no seu próprio site (autorizado)."
        steps={[
          "Confirme a porta correta com nmap.",
          "Rode nikto -Tuning 123 para focar nos achados de maior valor.",
          "Salve em HTML para report.",
          "Abra o relatório e priorize itens marcados como OSVDB.",
        ]}
        command={`SITE="https://meu-site-de-teste.local"

nmap -p 80,443,8080,8443 -sV $(echo $SITE | sed -E 's|https?://||' | cut -d/ -f1)
nikto -h $SITE -Tuning 123 -Format html -output minha_auditoria.html
firefox minha_auditoria.html &`}
        expected={`+ /robots.txt: contains 5 entries
+ /server-status: Apache server-status interface found.
+ /.git/HEAD: Git repository found in document root.
+ Apache/2.4.41 appears outdated.
+ Cookie PHPSESSID created without the httponly flag.

(o relatório HTML formatado ao final)`}
        verify="Cada item OSVDB-XXXX tem link de referência. Use-os para confirmar gravidade e priorizar correção."
      />

      <AlertBox type="warning" title="Nikto é muito barulhento">
        Por padrão envia milhares de requests com User-Agent 'Nikto'. Em pentest com WAF
        ativo, considere usar <code>-evasion</code> + <code>-useragent</code> custom +
        <code>-Pause N</code> entre requests, ou trocar por <strong>nuclei</strong>{" "}
        (mais moderno e flexível).
      </AlertBox>
    </PageContainer>
  );
}
