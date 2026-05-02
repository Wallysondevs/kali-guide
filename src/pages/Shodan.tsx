import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Shodan() {
  return (
    <PageContainer
      title="Shodan — Mecanismo de busca de servidores"
      subtitle="Indexa portas e banners de toda a internet IPv4. CLI, API e dorks de busca."
      difficulty="iniciante"
      timeToRead="13 min"
    >
      <h2>O que é Shodan</h2>
      <p>
        Enquanto o Google indexa <em>conteúdo web</em>, o <strong>Shodan</strong> indexa{" "}
        <em>banners de serviço</em>: cada SSH, MySQL, Modbus, RDP, IP-cam, ICS exposto
        na internet vira pesquisável por porta, país, organização, versão.
      </p>

      <h2>Setup da CLI</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y python3-shodan",
            out: "(também: pip install shodan)",
            outType: "muted",
          },
          {
            cmd: "shodan init API_KEY_AQUI",
            out: "Successfully initialized",
            outType: "success",
          },
          {
            cmd: "shodan info",
            out: `Query credits available: 95
Scan credits available: 90`,
            outType: "info",
          },
        ]}
      />

      <h2>Buscas básicas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "shodan search --limit 5 'apache country:BR'",
            out: `IP             Port  Hostname               Banner
200.150.42.10  80    web1.empresa.com.br    HTTP/1.1 200 OK\\r\\nServer: Apache/2.4.41 (Ubuntu)
177.32.18.5    443   site.gov.br            HTTP/1.1 200 OK\\r\\nServer: Apache/2.4.52
189.45.12.99   8080  -                      HTTP/1.1 401 Unauthorized\\r\\nServer: Apache-Coyote/1.1
200.98.4.21    80    cliente.local          HTTP/1.1 200 OK\\r\\nServer: Apache/2.2.34
187.4.231.55   80    -                      HTTP/1.1 403 Forbidden\\r\\nServer: Apache/2.4.6 (CentOS)`,
            outType: "info",
          },
          {
            cmd: "shodan count 'apache country:BR'",
            out: "412847",
            outType: "default",
          },
          {
            comment: "ver detalhes completos de UM host",
            cmd: "shodan host 200.150.42.10",
            out: `200.150.42.10
Hostnames:              web1.empresa.com.br
City:                   São Paulo
Country:                Brazil
Organization:           Vivo Empresas
Updated:                2026-04-02T18:23:14
Number of open ports:   3

Ports:
  22/tcp  OpenSSH
        SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.10
  80/tcp  Apache httpd 2.4.41
        HTTP/1.1 200 OK
        Server: Apache/2.4.41 (Ubuntu)
        Date: Wed, 02 Apr 2026 18:22:47 GMT
        Last-Modified: Mon, 31 Mar 2026 14:21:08 GMT
  443/tcp Apache httpd 2.4.41
        |-- SSL Certificate
        |   Issuer:  Let's Encrypt R3
        |   Subject: CN=web1.empresa.com.br
        |   Valid:   2026-02-15 → 2026-05-16`,
            outType: "success",
          },
        ]}
      />

      <h2>Filtros (dorks) essenciais</h2>
      <CommandTable
        title="Filtros mais usados"
        variations={[
          { cmd: "port:22", desc: "Hosts com SSH aberto.", output: "Combine com country/org." },
          { cmd: "country:BR", desc: "Filtra por país (ISO-2).", output: "country:US, country:RU, etc." },
          { cmd: "city:\"São Paulo\"", desc: "Filtra por cidade.", output: "Use aspas para nomes com espaço." },
          { cmd: "org:\"Telefonica Brasil\"", desc: "ASN/organização.", output: "Achar todos os IPs de uma operadora." },
          { cmd: "asn:AS27699", desc: "Por ASN.", output: "AS = sistema autônomo." },
          { cmd: "hostname:.empresa.com.br", desc: "Tudo que tem esse hostname.", output: "Subdomínios indexados." },
          { cmd: "net:200.150.0.0/16", desc: "Por bloco IP.", output: "Útil para inventário próprio." },
          { cmd: "product:OpenSSH", desc: "Por produto detectado.", output: "product:nginx, product:Apache" },
          { cmd: "version:1.27.1", desc: "Versão exata.", output: "Combinar com product." },
          { cmd: "vuln:CVE-2024-3094", desc: "Hosts vulneráveis a CVE específico (paid).", output: "Alvo de bug bounty/red team." },
          { cmd: "ssl.cert.subject.cn:*.empresa.com", desc: "Certificado com aquele CN.", output: "Achar subdomínios via TLS." },
          { cmd: "http.title:\"Login\"", desc: "Páginas com 'Login' no <title>.", output: "Use com http.html_hash." },
          { cmd: "tag:vpn", desc: "Hosts marcados como VPN.", output: "tag:cdn, tag:cloud, tag:database" },
        ]}
      />

      <h2>Exemplos práticos de busca</h2>
      <CodeBlock
        language="text"
        title="dorks que valem ouro (use com responsabilidade)"
        code={`# Câmeras IP expostas SEM autenticação
"Server: yawcam" port:8081
"netcam" http.title:"webcamXP"
NETSurveillance uc-httpd

# RDP exposto na internet
port:3389
port:3389 country:BR

# MongoDB sem autenticação (CVE clássico)
"MongoDB Server Information" port:27017 -authentication

# Elasticsearch aberto
port:9200 json

# Redis sem senha
port:6379 -authentication

# ICS / SCADA (Modbus, S7, BACnet)
port:502
port:102 product:"Siemens"
port:47808 BACnet

# Painéis de admin sem TLS
http.title:"phpmyadmin" -ssl
http.title:"admin login"
http.html:"Powered by Webmin"

# Workplace exposto
"x-jenkins"
"PROFTPD" 530 Login incorrect

# Servidores de jogo
"Minecraft" port:25565
product:"Source Engine" port:27015`}
      />

      <h2>Saída em JSON e download</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "salvar resultados em JSON (1 query credit por 100 resultados)",
            cmd: "shodan download mongo_open 'product:MongoDB -authentication country:BR' --limit 100",
            out: `Search query:                       product:MongoDB -authentication country:BR
Total number of results:            1247
Query credits left:                 89
Output file:                        mongo_open.json.gz

  Saving the results to file: mongo_open.json.gz`,
            outType: "warning",
          },
          {
            cmd: "shodan parse mongo_open.json.gz --fields ip_str,port,hostnames,product --separator ';' | head -5",
            out: `200.42.10.5;27017;mongo-prod.acme.com.br;MongoDB
177.99.4.22;27017;;MongoDB
200.150.20.18;27017;db.cliente.com;MongoDB
189.45.7.99;27017;;MongoDB
177.32.5.41;27017;mongo01;MongoDB`,
            outType: "info",
          },
        ]}
      />

      <h2>Scan ativo (paid feature)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1 scan credit por IP",
            cmd: "shodan scan submit 200.150.42.10",
            out: `Successfully submitted scan: 8M2bGJaQYaJxpLbk
Run "shodan scan status" to see the status of your scan.`,
            outType: "info",
          },
          {
            cmd: "shodan scan status 8M2bGJaQYaJxpLbk",
            out: `8M2bGJaQYaJxpLbk    DONE    1     2026-04-03T11:42:18`,
            outType: "success",
          },
          {
            cmd: "shodan host 200.150.42.10 --history | tail -10",
            out: `History last 30 days:
  2026-04-03 — 22, 80, 443
  2026-03-21 — 22, 80, 443, 8080
  2026-03-08 — 22, 80, 443
  2026-02-15 — 22, 80, 443`,
            outType: "default",
          },
        ]}
      />

      <h2>Shodan via API (Python)</h2>
      <CodeBlock
        language="python"
        title="shodan_api.py — busca + alerta"
        code={`#!/usr/bin/env python3
import shodan, json
from os import environ

API = shodan.Shodan(environ.get("SHODAN_API_KEY"))

# Buscar e iterar
for r in API.search_cursor("port:22 product:OpenSSH country:BR"):
    print(f"{r['ip_str']}:{r['port']}  -> {r['data'].splitlines()[0]}")

# Info de host
host = API.host("200.150.42.10")
print(json.dumps({
    "ip": host["ip_str"],
    "org": host["org"],
    "ports": host["ports"],
    "vulns": host.get("vulns", [])
}, indent=2))

# Criar alerta (paid: API plus)
alert = API.create_alert("monitor-empresa", ["200.150.0.0/16"])
API.add_alert_trigger(alert["id"], ["new_service", "vulnerable"])`}
      />

      <h2>InternetDB — endpoint gratuito</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "endpoint público gratuito (sem chave)",
            cmd: "curl -s https://internetdb.shodan.io/200.150.42.10 | jq .",
            out: `{
  "ip": "200.150.42.10",
  "ports": [22, 80, 443],
  "cpes": [
    "cpe:/a:openbsd:openssh:8.9p1",
    "cpe:/a:apache:http_server:2.4.41"
  ],
  "hostnames": ["web1.empresa.com.br"],
  "tags": ["cloud"],
  "vulns": []
}`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Inventário externo do seu próprio domínio"
        goal="Listar tudo que o Shodan vê sobre os IPs que pertencem ao seu negócio."
        steps={[
          "Identifique os blocos IP que são seus (consulta WHOIS).",
          "Use shodan search com net:.",
          "Salve em JSON e extraia portas + serviços.",
          "Compare com o que VOCÊ acha que tem aberto.",
        ]}
        command={`MEU_NET="200.150.0.0/24"

shodan search --limit 200 "net:$MEU_NET" --fields ip_str,port,product,hostnames \\
  --separator '|'

shodan download meu_inv "net:$MEU_NET" --limit 200
shodan parse meu_inv.json.gz --fields ip_str,port,product | sort -u`}
        expected={`200.150.0.10|22|OpenSSH|web1.acme.com.br
200.150.0.10|443|nginx|web1.acme.com.br
200.150.0.15|3389|Microsoft Terminal Service|
200.150.0.20|6379|Redis||(SEM AUTH — risco!)`}
        verify="Investigue qualquer porta que NÃO deveria estar exposta (banco, cache, RDP)."
      />

      <AlertBox type="warning" title="Shodan vê tudo o que está exposto">
        Se algo da sua empresa cai aqui sem você saber, você tem um problema. Use periodicamente
        para auditar o perímetro externo da sua organização — antes que um atacante o faça.
      </AlertBox>
    </PageContainer>
  );
}
