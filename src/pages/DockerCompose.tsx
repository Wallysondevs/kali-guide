import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function DockerCompose() {
  return (
    <PageContainer
      title="Docker Compose"
      subtitle="Sobe uma stack inteira (web + db + redis) num único arquivo. Perfeito pra labs multi-tier e infra C2."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Por que Compose existe</h2>
      <p>
        Subir DVWA é fácil. Subir <strong>OWASP Juice Shop + Postgres + Redis +
        proxy reverso</strong> com 4 <code>docker run</code> é bagunça. O{" "}
        <code>docker-compose.yml</code> declara TUDO num só YAML: services, redes,
        volumes, variáveis. Para Red Team isso vira ouro: stack de C2 (
        <em>teamserver + redirector nginx + Postgres</em>) reproduzível em qualquer
        VPS.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y docker-compose-v2",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "novo binário é 'docker compose' (subcommand), não 'docker-compose'",
            cmd: "docker compose version",
            out: "Docker Compose version v2.27.1+ds1-0+deb12u1",
            outType: "info",
          },
        ]}
      />

      <AlertBox type="warning" title="V1 morreu, V2 é subcomando">
        <p>
          Tutoriais antigos usam <code>docker-compose up</code> (com hífen, V1
          em Python). A versão atual é <code>docker compose up</code> (com
          espaço, plugin Go). Sintaxe do YAML é compatível mas <code>version: "3"</code>{" "}
          no topo virou opcional.
        </p>
      </AlertBox>

      <h2>Estrutura de um docker-compose.yml</h2>
      <CodeBlock
        language="yaml"
        title="docker-compose.yml — lab web vulnerável"
        code={`services:
  juice:
    image: bkimminich/juice-shop
    container_name: juice
    ports:
      - "3000:3000"
    networks:
      - lab
    restart: unless-stopped

  dvwa:
    image: vulnerables/web-dvwa
    container_name: dvwa
    ports:
      - "8080:80"
    networks:
      - lab
    depends_on:
      - mysql

  mysql:
    image: mysql:5.7
    container_name: dvwa-db
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_PASSWORD:-vulnerables}
      MYSQL_DATABASE: dvwa
    volumes:
      - dvwa_db:/var/lib/mysql
    networks:
      - lab

  attacker:
    image: kalilinux/kali-rolling
    container_name: attacker
    command: sleep infinity
    networks:
      - lab
    cap_add:
      - NET_ADMIN
      - NET_RAW

networks:
  lab:
    driver: bridge

volumes:
  dvwa_db:`}
      />

      <h2>Ciclo de vida</h2>
      <CommandTable
        title="docker compose — comandos essenciais"
        variations={[
          { cmd: "docker compose up", desc: "Sobe TUDO em foreground (logs no terminal).", output: "Bom para debug." },
          { cmd: "docker compose up -d", desc: "Detached: vai pro background.", output: "[+] Running 4/4" },
          { cmd: "docker compose ps", desc: "Lista só os services do projeto atual.", output: "NAME IMAGE STATUS PORTS" },
          { cmd: "docker compose logs -f juice", desc: "Tail de um service específico.", output: "juice | info: Server listening on port 3000" },
          { cmd: "docker compose exec dvwa bash", desc: "Entra no service (não precisa do container ID).", output: "root@dvwa:/#" },
          { cmd: "docker compose stop", desc: "Para containers (mantém estado).", output: "(rápido — não destrói nada)" },
          { cmd: "docker compose down", desc: "Para E remove containers/networks.", output: "Volumes nomeados FICAM (use -v para apagar)." },
          { cmd: "docker compose down -v", desc: "Down + apaga volumes (perde dados).", output: "Reset total do lab." },
          { cmd: "docker compose pull", desc: "Atualiza todas as images.", output: "Pra puxar nova versão sem mexer no compose." },
          { cmd: "docker compose build --no-cache", desc: "Rebuild ignorando cache.", output: "Útil quando alterou Dockerfile." },
          { cmd: "docker compose restart juice", desc: "Reinicia um service só.", output: "Sem afetar outros." },
          { cmd: "docker compose config", desc: "Mostra YAML resolvido (com .env aplicado).", output: "Validador de sintaxe + debug de variáveis." },
        ]}
      />

      <h2>Subindo a stack</h2>
      <Terminal
        path="~/labs/web"
        lines={[
          {
            cmd: "ls",
            out: `docker-compose.yml
.env`,
            outType: "muted",
          },
          {
            cmd: "docker compose up -d",
            out: `[+] Running 8/8
 ✔ Network web_lab          Created
 ✔ Volume "web_dvwa_db"     Created
 ✔ Container dvwa-db        Started
 ✔ Container juice          Started
 ✔ Container attacker       Started
 ✔ Container dvwa           Started`,
            outType: "success",
          },
          {
            cmd: "docker compose ps",
            out: `NAME       IMAGE                       COMMAND                  SERVICE    STATUS         PORTS
attacker   kalilinux/kali-rolling      "sleep infinity"         attacker   Up 7 seconds
dvwa       vulnerables/web-dvwa        "/main.sh"               dvwa       Up 7 seconds   0.0.0.0:8080->80/tcp
dvwa-db    mysql:5.7                   "docker-entrypoint.s…"   mysql      Up 8 seconds   3306/tcp
juice      bkimminich/juice-shop       "docker-entrypoint.s…"   juice      Up 7 seconds   0.0.0.0:3000->3000/tcp`,
            outType: "info",
          },
          {
            comment: "DNS interno: services se acham pelo nome",
            cmd: "docker compose exec attacker bash -c 'apt update -qq && apt install -y -qq curl && curl -s http://dvwa/login.php | head -3'",
            out: `<html>
<head>
<title>Damn Vulnerable Web Application (DVWA) v1.0.7 :: Login</title>`,
            outType: "warning",
          },
        ]}
      />

      <h2>Arquivo .env</h2>
      <p>
        Variáveis sensíveis (senhas, tokens) ficam em <code>.env</code> ao lado
        do compose. Adicione em <code>.gitignore</code> e versione apenas{" "}
        <code>.env.example</code>.
      </p>

      <CodeBlock
        language="ini"
        title=".env"
        code={`MYSQL_PASSWORD=Sup3r$ecreto!
JUICE_PORT=3000
DVWA_PORT=8080
KALI_TAG=latest`}
      />

      <Terminal
        path="~/labs/web"
        lines={[
          {
            cmd: "docker compose config | head -15",
            out: `name: web
services:
  attacker:
    cap_add:
      - NET_ADMIN
      - NET_RAW
    command: sleep infinity
    container_name: attacker
    image: kalilinux/kali-rolling
    networks:
      lab: null
  dvwa:
    container_name: dvwa
    depends_on:
      mysql:
        condition: service_started`,
            outType: "default",
          },
        ]}
      />

      <h2>Healthchecks</h2>
      <p>
        <code>depends_on</code> sozinho só garante a ordem de boot — não espera
        o serviço estar pronto. Combine com <strong>healthcheck</strong>:
      </p>

      <CodeBlock
        language="yaml"
        title="healthcheck — espera mysql aceitar conexão"
        code={`services:
  mysql:
    image: mysql:5.7
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-p\${MYSQL_PASSWORD}"]
      interval: 5s
      timeout: 3s
      retries: 10

  dvwa:
    image: vulnerables/web-dvwa
    depends_on:
      mysql:
        condition: service_healthy`}
      />

      <h2>Stack C2 ofensiva (exemplo redirector + teamserver)</h2>
      <CodeBlock
        language="yaml"
        title="docker-compose.yml — redirector nginx + sliver"
        code={`services:
  redirector:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - c2net
    restart: always

  sliver:
    image: ghcr.io/bishopfox/sliver-server:latest
    container_name: sliver
    volumes:
      - sliver_data:/root/.sliver
    networks:
      - c2net
    restart: always
    # NUNCA exponha porta do sliver direto — só pelo redirector

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks:
      - c2net

networks:
  c2net:
    internal: false

volumes:
  sliver_data:
  pg_data:`}
      />

      <AlertBox type="danger" title="Operacional Sec (OpSec)">
        <p>
          Em engagement real <strong>não exponha</strong> portas do C2 para a
          internet. O redirector na frente (nginx/Apache) faz <code>proxy_pass</code>{" "}
          condicional: tráfego do beacon vai pro teamserver, qualquer outro
          request vai pra um decoy (página corporativa fake). E sempre TLS
          válido (Let's Encrypt no redirector, não no C2).
        </p>
      </AlertBox>

      <h2>Profiles — sobe só parte da stack</h2>
      <CodeBlock
        language="yaml"
        title="profiles para subir só ataque OU só defesa"
        code={`services:
  dvwa:
    profiles: ["target"]
    image: vulnerables/web-dvwa

  attacker:
    profiles: ["red"]
    image: kalilinux/kali-rolling

  splunk:
    profiles: ["blue"]
    image: splunk/splunk:latest`}
      />

      <Terminal
        path="~/labs"
        lines={[
          {
            cmd: "docker compose --profile target --profile red up -d",
            out: "(sobe só dvwa + attacker, não o splunk)",
            outType: "info",
          },
        ]}
      />

      <h2>Override por ambiente</h2>
      <p>
        Compose carrega automaticamente <code>docker-compose.override.yml</code>{" "}
        se existir. Útil para diferenças local vs servidor:
      </p>

      <CodeBlock
        language="yaml"
        title="docker-compose.override.yml (LOCAL)"
        code={`services:
  juice:
    ports:
      - "3001:3000"   # local quero porta diferente
    environment:
      DEBUG: "true"`}
      />

      <PracticeBox
        title="Lab completo: DVWA + MariaDB + attacker pronto pra atacar"
        goal="Criar um docker-compose.yml mínimo, subir, e do container attacker rodar sqlmap contra DVWA via DNS interno."
        steps={[
          "Crie pasta lab/ e o YAML conforme abaixo.",
          "docker compose up -d.",
          "Faça login no DVWA (admin/password) via http://localhost:8080.",
          "Execute sqlmap dentro do attacker contra o DVWA.",
        ]}
        command={`mkdir lab && cd lab
cat > docker-compose.yml <<'EOF'
services:
  dvwa:
    image: vulnerables/web-dvwa
    ports: ["8080:80"]
    networks: [lab]
  attacker:
    image: kalilinux/kali-rolling
    command: sleep infinity
    networks: [lab]
networks:
  lab:
EOF
docker compose up -d
docker compose exec attacker bash -c \\
  "apt update -qq && apt install -y -qq sqlmap && sqlmap -u 'http://dvwa/vulnerabilities/sqli/?id=1&Submit=Submit' --cookie='security=low; PHPSESSID=abcd' --batch --dbs"`}
        expected={`[INFO] testing connection to the target URL
[INFO] testing if the target URL content is stable
[INFO] GET parameter 'id' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable
available databases [2]:
[*] dvwa
[*] information_schema`}
        verify="sqlmap dentro do container attacker conseguiu explorar SQLi no DVWA pelo DNS interno 'dvwa'."
      />

      <AlertBox type="info" title="docker compose top + stats">
        <p>
          <code>docker compose top</code> mostra processos de cada service.{" "}
          <code>docker stats</code> mostra CPU/RAM/IO em tempo real — útil pra ver
          se o lab tá derretendo o seu Kali host.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
