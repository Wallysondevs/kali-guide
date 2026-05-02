import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Gobuster() {
  return (
    <PageContainer
      title="Gobuster + ffuf — força bruta de diretórios e VHosts"
      subtitle="Descobre paths escondidos, subdomínios, virtual hosts e parâmetros via wordlist."
      difficulty="iniciante"
      timeToRead="13 min"
      prompt="web/gobuster"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y gobuster ffuf seclists",
            out: "(seclists = 100MB de wordlists)",
            outType: "muted",
          },
          {
            cmd: "ls /usr/share/seclists/Discovery/Web-Content/ | head -10",
            out: `big.txt
common.txt
directory-list-2.3-medium.txt
directory-list-2.3-small.txt
raft-large-directories.txt
raft-large-files.txt
raft-medium-directories.txt
raft-small-words.txt
quickhits.txt
api/`,
            outType: "info",
          },
        ]}
      />

      <h2>gobuster — modo dir</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: `gobuster dir -u https://app.local -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 50 -o gobuster.txt`,
            out: `===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     https://app.local
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
2026/04/03 13:01:14 Starting gobuster in directory enumeration mode
===============================================================
/.git                 (Status: 301) [Size: 178] [--> /.git/]
/.htaccess            (Status: 403) [Size: 199]
/admin                (Status: 301) [Size: 178] [--> /admin/]
/api                  (Status: 200) [Size: 542]
/backup               (Status: 200) [Size: 1245]
/css                  (Status: 301) [Size: 178] [--> /css/]
/dashboard            (Status: 302) [Size: 0]   [--> /login]
/images               (Status: 301) [Size: 178] [--> /images/]
/index.html           (Status: 200) [Size: 4521]
/js                   (Status: 301) [Size: 178] [--> /js/]
/login                (Status: 200) [Size: 1842]
/phpmyadmin           (Status: 301) [Size: 178] [--> /phpmyadmin/]
/robots.txt           (Status: 200) [Size: 412]
/server-status        (Status: 403) [Size: 199]
/uploads              (Status: 301) [Size: 178] [--> /uploads/]
===============================================================
2026/04/03 13:03:42 Finished
===============================================================`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags úteis (modo dir)"
        variations={[
          { cmd: "-u URL", desc: "Alvo.", output: "https://app.local" },
          { cmd: "-w wordlist.txt", desc: "Wordlist.", output: "common.txt para começar; raft/big depois." },
          { cmd: "-t 50", desc: "Threads (default 10).", output: "Em LAN: 50-100. Internet: 20-30." },
          { cmd: "-x php,html,bak,zip", desc: "Extensões para tentar em cada palavra.", output: "/admin → /admin.php /admin.html ..." },
          { cmd: "-s 200,204,301,302,307,401,403", desc: "Status codes a aceitar.", output: "Default exclui 404. Inclua 401/403 para achar protegidos." },
          { cmd: "-b 404,500", desc: "Status codes a IGNORAR (blacklist).", output: "Útil quando alvo retorna 200 falso." },
          { cmd: "-k", desc: "Aceita certificados self-signed (HTTPS).", output: "Lab/CTF." },
          { cmd: "-H 'Cookie: x=y'", desc: "Header customizado (pode repetir).", output: "Para áreas autenticadas." },
          { cmd: "-a 'UA'", desc: "User-Agent.", output: "Bypass de WAFs simples." },
          { cmd: "--proxy http://127.0.0.1:8080", desc: "Roteia pelo Burp.", output: "Para inspecionar." },
          { cmd: "-r", desc: "Segue redirect.", output: "Vê o destino real." },
          { cmd: "-o saida.txt", desc: "Output.", output: "Limpa, sem cores." },
          { cmd: "--no-error", desc: "Não mostra erros (timeout).", output: "Output mais limpo." },
        ]}
      />

      <h2>gobuster — modo dns / vhost / s3</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "DNS — brute force de subdomínios",
            cmd: "gobuster dns -d empresa.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50",
            out: `===============================================================
[+] Domain:     empresa.com
[+] Threads:    50
[+] Wordlist:   /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
===============================================================
Found: www.empresa.com
Found: mail.empresa.com
Found: api.empresa.com
Found: admin.empresa.com
Found: dev.empresa.com
Found: staging.empresa.com
Found: vpn.empresa.com
Found: webmail.empresa.com
===============================================================`,
            outType: "info",
          },
          {
            comment: "VHOST — Host header brute force",
            cmd: "gobuster vhost -u https://200.150.10.42 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 30 --append-domain",
            out: `===============================================================
Found: admin.200.150.10.42 Status: 200 [Size: 4521]
Found: api.200.150.10.42 Status: 200 [Size: 9821]
Found: dev.200.150.10.42 Status: 200 [Size: 1245]
===============================================================`,
            outType: "warning",
          },
          {
            comment: "S3 buckets — descobre AWS S3 com brute force",
            cmd: "gobuster s3 -w /usr/share/seclists/Discovery/Web-Content/common.txt",
            out: `bucket1.s3.amazonaws.com  [Status: 200] (PUBLIC LISTING!)
bucket-backup.s3.amazonaws.com  [Status: 403]`,
            outType: "default",
          },
        ]}
      />

      <h2>ffuf — fuzzer mais flexível</h2>
      <p>
        ffuf usa <code>FUZZ</code> como placeholder em qualquer lugar (URL, header, body).
        Mais rápido e flexível que gobuster para casos avançados.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "directory busting (mesmo do gobuster)",
            cmd: "ffuf -u 'https://app.local/FUZZ' -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 50 -mc 200,301,302,401,403",
            out: `        /'___\\  /'___\\           /'___\\
       /\\ \\__/ /\\ \\__/  __  __  /\\ \\__/
       \\ \\ ,__\\\\ \\ ,__\\/\\ \\/\\ \\ \\ \\ ,__\\
        \\ \\ \\_/ \\ \\ \\_/\\ \\ \\_\\ \\ \\ \\ \\_/
         \\ \\_\\   \\ \\_\\  \\ \\____/  \\ \\_\\
          \\/_/    \\/_/   \\/___/    \\/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : https://app.local/FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/.../raft-medium-directories.txt
 :: Threads          : 50
 :: Matcher          : Response status: 200,301,302,401,403
________________________________________________

admin                   [Status: 301, Size: 178, Words: 7, Lines: 8]
api                     [Status: 200, Size: 542, Words: 12, Lines: 5]
backup                  [Status: 200, Size: 1245, Words: 89, Lines: 23]
dashboard               [Status: 302, Size: 0, Words: 1, Lines: 1]
.git                    [Status: 301, Size: 178, Words: 7, Lines: 8]

:: Progress: [30000/30000] :: Job [1/1] :: 412 req/sec :: Errors: 0 ::`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="ffuf — modos avançados"
        variations={[
          { cmd: "Subdomain (-H 'Host: FUZZ.alvo.com')", desc: "Vhost discovery.", output: "Combine com -fs (filter size) para tirar 'sem hit'." },
          { cmd: "Parameter discovery", desc: "Acha GET/POST params escondidos.", output: "ffuf -u 'site/?FUZZ=test' -w params.txt" },
          { cmd: "Authentication brute", desc: "Login form fuzzing.", output: "ffuf -u site/login -X POST -d 'u=admin&p=FUZZ' -w pass.txt" },
          { cmd: "Multiple FUZZ keywords", desc: "FUZZUSER, FUZZPASS, etc.", output: "Cluster bomb com -w lista1:FUZZ1 -w lista2:FUZZ2" },
          { cmd: "Recursive (-recursion)", desc: "Recursivo: encontrou /admin → fuzza /admin/.", output: "-recursion-depth 2" },
        ]}
      />

      <h2>ffuf — exemplo: descobrir parâmetro escondido</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ffuf -u 'https://app.local/api/user?FUZZ=admin' -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -fs 412",
            out: `:: Wordlist: FUZZ: burp-parameter-names.txt (6453 words)
:: Filter: Response size: 412

debug                   [Status: 200, Size: 1284, Words: 89, Lines: 23]
admin                   [Status: 200, Size: 1284, Words: 89, Lines: 23]
isAdmin                 [Status: 200, Size: 2451, Words: 142, Lines: 41]   ← achado!
role                    [Status: 200, Size: 1284, Words: 89, Lines: 23]

:: Progress: [6453/6453] :: 510 req/sec`,
            outType: "warning",
          },
          {
            cmd: "curl 'https://app.local/api/user?isAdmin=true' -H 'Authorization: Bearer xxx'",
            out: `{
  "id": 99,
  "name": "wallyson",
  "role": "admin",            ← agora vê o role admin!
  "permissions": ["read", "write", "delete"]
}`,
            outType: "error",
          },
        ]}
      />

      <h2>ffuf — VHost discovery</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: `ffuf -u 'https://200.150.10.42/' -H 'Host: FUZZ.empresa.com' \\
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \\
  -fs 4521 -mc 200,301,302`,
            out: `(filtra response com tamanho 4521 = página default)

admin                   [Status: 200, Size: 9821]   ← vhost diferente!
api                     [Status: 200, Size: 542]
dev                     [Status: 200, Size: 8714]
staging                 [Status: 200, Size: 1245]`,
            outType: "info",
          },
          {
            comment: "agora confirmar via Host header",
            cmd: "curl -H 'Host: dev.empresa.com' https://200.150.10.42/ -k | head",
            out: "<h1>DEV environment - DO NOT TOUCH</h1>...",
            outType: "warning",
          },
        ]}
      />

      <h2>Wordlists recomendadas</h2>
      <CommandTable
        title="Da SecLists, por situação"
        variations={[
          { cmd: "Web-Content/common.txt (4600 entries)", desc: "Boa para scan rápido.", output: "Termina em < 1 min." },
          { cmd: "Web-Content/raft-medium-directories.txt", desc: "Padrão para diretórios.", output: "30k entries — equilíbrio." },
          { cmd: "Web-Content/raft-large-directories.txt", desc: "Mais completa.", output: "62k entries." },
          { cmd: "Web-Content/api/objects.txt", desc: "Endpoints típicos de API REST.", output: "/users, /products, /orders..." },
          { cmd: "Web-Content/api/api-endpoints.txt", desc: "Versionado /v1/, /v2/.", output: "Para fuzzing de API." },
          { cmd: "DNS/subdomains-top1million-5000.txt", desc: "Top 5000 subs.", output: "Padrão para gobuster dns." },
          { cmd: "DNS/subdomains-top1million-110000.txt", desc: "110k subs.", output: "Mais lento, mais completo." },
          { cmd: "Discovery/Web-Content/burp-parameter-names.txt", desc: "Param discovery.", output: "6453 names." },
          { cmd: "Usernames/Names/names.txt", desc: "Nomes para enum de usuário.", output: "Para spraying." },
          { cmd: "Passwords/rockyou.txt", desc: "14 milhões de senhas (legacy mas eficaz).", output: "PADRÃO em CTF/lab." },
        ]}
      />

      <PracticeBox
        title="Recon completo de um site web"
        goal="Sair do zero (URL) até ter: subdomínios + vhosts + diretórios escondidos + parâmetros."
        steps={[
          "Brute force de subdomínios via DNS.",
          "Para cada sub vivo, scan de diretórios.",
          "Para o IP do alvo, vhost discovery via Host header.",
          "Em endpoints API encontrados, parameter discovery com ffuf.",
        ]}
        command={`DOMAIN="empresa.com"

# 1) subdomínios
gobuster dns -d $DOMAIN -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50 -o subs.txt
grep '^Found' subs.txt | awk '{print $2}' > subs_clean.txt

# 2) hosts vivos
cat subs_clean.txt | httpx -silent | tee live.txt

# 3) directory busting em cada
for U in $(cat live.txt); do
  echo "[*] Scanning $U"
  gobuster dir -u $U -w /usr/share/seclists/Discovery/Web-Content/common.txt -q -t 30 -o "dir_$(echo $U | sed 's|/|_|g').txt"
done

# 4) param discovery em endpoint API
ffuf -u "https://api.$DOMAIN/v1/user?FUZZ=test" \\
     -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \\
     -fs 412 -mc 200`}
        expected={`Found: www.empresa.com
Found: api.empresa.com
Found: admin.empresa.com
Found: staging.empresa.com

[*] Scanning https://api.empresa.com
/v1                  (Status: 200) [Size: 542]
/docs                (Status: 200) [Size: 4521]
/swagger.json        (Status: 200) [Size: 18342]    ← spec da API!`}
        verify="O arquivo dir_*.txt para cada subdomínio deve ter ao menos 5 paths novos. /swagger.json ou /openapi.json em api.* é jackpot."
      />

      <AlertBox type="info" title="gobuster vs ffuf">
        <strong>gobuster</strong>: simples, ótimo para casos básicos (dir, dns, vhost, s3).
        <br />
        <strong>ffuf</strong>: mais rápido, mais flexível com filtros e <code>FUZZ</code> em
        qualquer posição. Para param/header/body fuzz, ffuf é imbatível.
      </AlertBox>
    </PageContainer>
  );
}
