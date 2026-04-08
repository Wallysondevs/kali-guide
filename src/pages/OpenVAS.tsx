import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function OpenVAS() {
  return (
    <PageContainer
      title="OpenVAS / GVM — Scanner de Vulnerabilidades"
      subtitle="Use o OpenVAS (Greenbone Vulnerability Management) para identificar vulnerabilidades em redes e sistemas de forma automatizada. Guia completo com instalação, configuração, tipos de scan, interpretação de resultados e automação via CLI."
      difficulty="intermediario"
      timeToRead="35 min"
    >
      <h2>O que é OpenVAS?</h2>
      <p>
        O <strong>OpenVAS</strong> (Open Vulnerability Assessment Scanner) é o scanner de vulnerabilidades
        open-source mais utilizado no mundo. Ele faz parte do framework <strong>GVM (Greenbone Vulnerability
        Management)</strong>, que inclui:
      </p>
      <ul>
        <li><strong>OpenVAS Scanner</strong> — o motor que executa os testes (NVTs — Network Vulnerability Tests)</li>
        <li><strong>gvmd</strong> (Greenbone Vulnerability Manager Daemon) — gerencia scans, alvos, relatórios e políticas</li>
        <li><strong>gsad</strong> (Greenbone Security Assistant Daemon) — interface web para gerenciamento</li>
        <li><strong>OSPd</strong> (Open Scanner Protocol Daemon) — protocolo de comunicação entre componentes</li>
        <li><strong>Community Feed</strong> — banco de dados com +70.000 NVTs (testes de vulnerabilidade) atualizados diariamente</li>
      </ul>
      <p>
        O OpenVAS testa cada porta e serviço do alvo contra milhares de vulnerabilidades conhecidas (CVEs),
        verificando versões de software, configurações inseguras, credenciais padrão, e falhas exploráveis.
        Cada resultado inclui severidade CVSS, descrição detalhada, e recomendação de correção.
      </p>

      <AlertBox type="warning" title="Uso ético obrigatório">
        Escaneie apenas sistemas que você tem autorização expressa para testar. Scanners de vulnerabilidade
        geram tráfego intenso (milhares de requisições) e podem ser detectados por IDS/IPS como atividade
        maliciosa. Em pentests profissionais, o scan de vulnerabilidades deve estar explicitamente no escopo.
      </AlertBox>

      <h2>Instalação Completa no Kali</h2>
      <CodeBlock
        title="Instalar, configurar e inicializar o GVM/OpenVAS"
        code={`# ═══════════════════════════════════════════════════
# PASSO 1: Instalar todos os componentes do GVM
# ═══════════════════════════════════════════════════
sudo apt update && sudo apt install gvm -y
# Instala: openvas-scanner, gvmd, gsad, ospd-openvas,
#          greenbone-feed-sync, gvm-tools, notus-scanner

# ═══════════════════════════════════════════════════
# PASSO 2: Configuração inicial (primeira execução)
# ═══════════════════════════════════════════════════
# ATENÇÃO: Este processo demora 20-40 minutos!
# Ele faz: criar banco PostgreSQL, baixar NVT feeds,
#          gerar certificados SSL, criar usuário admin
sudo gvm-setup

# No final da execução, ele mostra algo como:
# ┌──────────────────────────────────────────┐
# │  Admin user created.                      │
# │  Username: admin                          │
# │  Password: 4f2c1a8b-9e3d-4a7f-b6c2-...  │
# └──────────────────────────────────────────┘
# ⚠️ ANOTE ESSA SENHA! Ela é gerada aleatoriamente.

# ═══════════════════════════════════════════════════
# PASSO 3: Verificar se tudo está funcionando
# ═══════════════════════════════════════════════════
sudo gvm-check-setup
# Verifica cada componente e mostra OK ou FAIL:
# Step 1: Checking OpenVAS Scanner ...         OK
# Step 2: Checking gvmd ...                    OK
# Step 3: Checking gsad ...                    OK
# Step 4: Checking NVTs ...                    OK
# Step 5: Checking PostgreSQL ...              OK

# Se algum falhar, o output mostra exatamente o que corrigir.
# Problema comum: NVTs não sincronizados
# Solução: sudo greenbone-feed-sync --type GVMD_DATA
#          sudo greenbone-feed-sync --type SCAP
#          sudo greenbone-feed-sync --type CERT

# ═══════════════════════════════════════════════════
# PASSO 4: Iniciar os serviços
# ═══════════════════════════════════════════════════
sudo gvm-start
# Inicia: ospd-openvas, gvmd, gsad
# Output:
# [*] Starting OpenVAS Scanner ...         [OK]
# [*] Starting Greenbone Vulnerability Manager ...  [OK]
# [*] Starting Greenbone Security Assistant ...      [OK]

# ═══════════════════════════════════════════════════
# PASSO 5: Acessar a interface web
# ═══════════════════════════════════════════════════
# Abra no navegador:
# https://127.0.0.1:9392
#
# Login: admin
# Senha: (a senha gerada no passo 2)
#
# ⚠️ O certificado SSL é self-signed, aceite o aviso.
# Se não carregar, aguarde 1-2 min (gvmd pode estar
# ainda carregando os NVTs).

# ═══════════════════════════════════════════════════
# OPCIONAL: Mudar a senha do admin
# ═══════════════════════════════════════════════════
sudo gvmd --user=admin --new-password=MinhaSenhaForte123!
# Útil porque a senha gerada é difícil de memorizar.

# ═══════════════════════════════════════════════════
# OPCIONAL: Criar outro usuário
# ═══════════════════════════════════════════════════
sudo gvmd --create-user=pentester --password=P3nt3st!
# Criar com role específico:
sudo gvmd --create-user=auditor --role=Observer`}
      />

      <h2>Conceitos Fundamentais</h2>
      <p>Antes de fazer scans, entenda os conceitos chave:</p>
      <CodeBlock
        title="Terminologia do OpenVAS"
        code={`# ═══════════════════════════════════════════════════
# TARGET (Alvo)
# ═══════════════════════════════════════════════════
# Define O QUE será escaneado.
# Pode ser: IP único, range CIDR, lista de IPs, hostname.
# Inclui: porta list, credenciais SSH/SMB (para scan autenticado),
#         e método de verificação se o host está vivo.

# ═══════════════════════════════════════════════════
# SCAN CONFIG (Configuração de Scan)
# ═══════════════════════════════════════════════════
# Define COMO será escaneado. Configurações pré-definidas:
#
# 1. "Discovery"
#    - Apenas descobre hosts e serviços ativos
#    - NÃO testa vulnerabilidades
#    - Rápido: ~2 min por host
#    - Uso: mapeamento inicial da rede
#
# 2. "Host Discovery"
#    - Ainda mais leve que Discovery
#    - Apenas verifica se hosts estão online
#    - Uso: inventário de rede
#
# 3. "Full and fast"  ← RECOMENDADO para a maioria dos casos
#    - Testa TODAS as vulnerabilidades aplicáveis
#    - Otimizado: pula testes que o alvo claramente não suporta
#    - Ex: não testa CVEs de IIS em servidor Linux
#    - Tempo: ~15-30 min por host (depende dos serviços)
#
# 4. "Full and fast ultimate"
#    - Como "Full and fast" mas inclui testes que podem
#      causar DoS (negação de serviço) no alvo
#    - ⚠️ PODE DERRUBAR SERVIÇOS! Usar com cuidado
#    - Tempo: ~20-45 min por host
#
# 5. "Full and deep"
#    - Teste COMPLETO, sem otimizações
#    - Testa TUDO, mesmo coisas improváveis
#    - Muito lento: ~1-3 horas por host
#    - Uso: auditoria formal completa
#
# 6. "Full and deep ultimate"
#    - Combina "deep" com testes destrutivos
#    - ⚠️ PODE CAUSAR CRASH NOS SERVIÇOS!
#    - Tempo: ~2-5 horas por host
#    - Uso: teste de resiliência

# ═══════════════════════════════════════════════════
# TASK (Tarefa)
# ═══════════════════════════════════════════════════
# Combina TARGET + SCAN CONFIG + SCANNER para criar
# uma unidade de trabalho executável. Pode ser:
# - Executada imediatamente ou agendada
# - Repetida periodicamente (scans recorrentes)
# - Cada execução gera um REPORT

# ═══════════════════════════════════════════════════
# NVT (Network Vulnerability Test)
# ═══════════════════════════════════════════════════
# Cada NVT é um teste individual para uma vulnerabilidade.
# Escritos em NASL (Nessus Attack Scripting Language).
# Total: +70.000 NVTs no Community Feed.
# Cada NVT tem: OID (identificador), família, CVE associado,
#               CVSS score, e script de teste.

# ═══════════════════════════════════════════════════
# CVSS (Common Vulnerability Scoring System)
# ═══════════════════════════════════════════════════
# Escala de 0.0 a 10.0 que mede severidade:
#  0.0       = Informativo (Log)
#  0.1 - 3.9 = Low  (verde)  — risco mínimo
#  4.0 - 6.9 = Medium (amarelo) — risco moderado
#  7.0 - 8.9 = High (laranja) — risco sério, corrigir em dias
#  9.0 - 10.0 = Critical (vermelho) — ação IMEDIATA necessária`}
      />

      <h2>Criando e Executando um Scan</h2>

      <h3>Via Interface Web (Passo a Passo)</h3>
      <CodeBlock
        title="Workflow completo na interface web"
        code={`# ═══════════════════════════════════════════════════
# PASSO 1: Criar um Target (Alvo)
# ═══════════════════════════════════════════════════
# Menu: Configuration → Targets → ícone ⊕ (New Target)
#
# Campos:
# ┌─────────────────────────────────────────────────┐
# │ Name:         "Servidor Web Lab"                 │
# │ Comment:      "Servidor Apache na DMZ"           │
# │                                                   │
# │ Hosts:                                            │
# │   Manual: 192.168.1.100                          │
# │   Ou range: 192.168.1.0/24                       │
# │   Ou lista: 192.168.1.10, 192.168.1.20           │
# │   Ou arquivo: (upload de lista .txt)              │
# │                                                   │
# │ Exclude Hosts: 192.168.1.1  (excluir o gateway)  │
# │                                                   │
# │ Port List: ▼                                      │
# │   "All IANA assigned TCP" (4590 portas)           │
# │   "All IANA assigned TCP and UDP" (mais completo) │
# │   "All TCP (1-65535)" (mais lento, mais completo) │
# │   "All TCP and Nmap top 1000" (bom equilíbrio)    │
# │   "OpenVAS Default" (top ~4000 portas)            │
# │                                                   │
# │ Alive Test: ▼                                     │
# │   "ICMP & ARP Ping" — verifica se host está vivo  │
# │   "Consider Alive" — assume que está vivo (útil   │
# │   quando ICMP está bloqueado por firewall)         │
# │   "ICMP Ping" — apenas ICMP                       │
# │   "TCP-SYN Service Ping" — SYN em portas comuns   │
# │                                                   │
# │ ┌─ Credenciais (para scan AUTENTICADO) ──────┐   │
# │ │ SSH: (selecionar credencial SSH previamente │   │
# │ │      criada em Configuration → Credentials) │   │
# │ │ SMB: (para scan Windows autenticado)        │   │
# │ │ ESXi: (para scan VMware)                    │   │
# │ │ SNMP: (para scan de dispositivos de rede)   │   │
# │ └────────────────────────────────────────────┘   │
# └─────────────────────────────────────────────────┘
# Clicar "Create"

# ═══════════════════════════════════════════════════
# PASSO 2: Criar uma Task (Tarefa de Scan)
# ═══════════════════════════════════════════════════
# Menu: Scans → Tasks → ícone ⊕ (New Task)
#
# ┌─────────────────────────────────────────────────┐
# │ Name:         "Scan Completo — Lab"              │
# │ Comment:      "Pentest Q1 2024"                  │
# │                                                   │
# │ Scan Targets: ▼ "Servidor Web Lab" (do passo 1) │
# │                                                   │
# │ Scanner: ▼ "OpenVAS Default"                     │
# │                                                   │
# │ Scan Config: ▼                                   │
# │   "Full and fast" ← ESCOLHA ESTE para começar    │
# │                                                   │
# │ Network Source Interface: (vazio = default)       │
# │                                                   │
# │ Order for target hosts: ▼                         │
# │   "Sequential" — escaneia IPs em ordem            │
# │   "Random" — ordem aleatória (mais furtivo)       │
# │   "Reverse" — do maior para o menor               │
# │                                                   │
# │ Maximum concurrently executed NVTs per host: 4    │
# │ Maximum concurrently scanned hosts: 20            │
# │ (↑ Aumentar = mais rápido mas mais agressivo)     │
# │                                                   │
# │ ☐ Add results to Asset Management                │
# │ ☐ Apply Overrides                                │
# │ Minimum QoD: 70% (Quality of Detection)           │
# │ ↑ 70% = padrão. Diminuir para ver mais resultados │
# │   mas com mais falsos positivos.                   │
# │   Aumentar para 90%+ = menos falsos positivos     │
# └─────────────────────────────────────────────────┘
# Clicar "Create"

# ═══════════════════════════════════════════════════
# PASSO 3: Iniciar o Scan
# ═══════════════════════════════════════════════════
# Na lista de Tasks, clicar no ícone ▶ (Start)
# Status muda para: Requested → Running (X%)
# O scan pode levar de 5 minutos a várias horas.
#
# Durante a execução você pode:
# - Ver progresso em tempo real (% e barra)
# - Ver resultados parciais clicando no relatório
# - Parar o scan (ícone ■) se necessário
# - Retomar (ícone ▶) de onde parou`}
      />

      <h3>Scan Autenticado vs Não-Autenticado</h3>
      <CodeBlock
        title="Diferença entre scans autenticados e não-autenticados"
        code={`# ═══════════════════════════════════════════════════
# SCAN NÃO-AUTENTICADO (padrão)
# ═══════════════════════════════════════════════════
# O scanner testa o alvo "de fora", como um atacante externo.
# Detecta: portas abertas, serviços expostos, banners de versão,
#          vulnerabilidades acessíveis remotamente.
# NÃO detecta: software interno, patches instalados, configurações
#              locais, vulnerabilidades que requerem acesso local.
# Ideal para: teste de perímetro, visão do atacante externo.

# ═══════════════════════════════════════════════════
# SCAN AUTENTICADO (muito mais completo)
# ═══════════════════════════════════════════════════
# O scanner faz login no alvo via SSH (Linux) ou SMB (Windows)
# e examina o sistema internamente.
# Detecta TUDO do scan não-autenticado MAIS:
# - Pacotes instalados e suas versões exatas
# - Patches de segurança ausentes
# - Configurações do sistema inseguras
# - Permissões de arquivo incorretas
# - Serviços locais vulneráveis
# - Credenciais fracas em serviços internos
#
# Resultado: encontra 3x a 10x mais vulnerabilidades!
# Ideal para: auditoria interna, compliance, hardening.

# Como configurar credenciais:
# 1. Menu: Configuration → Credentials → New Credential
#
# Para SSH:
# ┌──────────────────────────────────────┐
# │ Name: "SSH Admin Lab"                │
# │ Type: Username + Password            │
# │ Username: root                       │
# │ Password: ********                   │
# │ Ou: Username + SSH Key (mais seguro) │
# │ Private Key: (upload da chave)       │
# │ Passphrase: ********                 │
# └──────────────────────────────────────┘
#
# Para SMB (Windows):
# ┌──────────────────────────────────────┐
# │ Name: "SMB Admin Lab"               │
# │ Type: Username + Password            │
# │ Username: Administrator              │
# │ Password: ********                   │
# │ ⚠️ Para domínio: DOMAIN\\\\user       │
# └──────────────────────────────────────┘
#
# Depois, associar a credencial ao Target (passo 1 do scan).`}
      />

      <h2>Interpretando Resultados em Detalhe</h2>
      <CodeBlock
        title="Como ler e entender cada resultado"
        code={`# Após o scan completar, vá em: Scans → Reports → (clique no relatório)
#
# ═══════════════════════════════════════════════════
# VISÃO GERAL DO RELATÓRIO
# ═══════════════════════════════════════════════════
# O relatório mostra um resumo com barras coloridas:
#
# Severity    Count    Exemplos comuns
# ─────────   ─────    ──────────────────────────────
# Critical      3      CVE-2021-44228 (Log4Shell)
# High         12      CVE-2023-22515 (Confluence)
# Medium       28      TLS 1.0 habilitado
# Low           8      Banner de versão exposto
# Log          45      Porta aberta, serviço detectado
#
# ═══════════════════════════════════════════════════
# DETALHES DE CADA VULNERABILIDADE
# ═══════════════════════════════════════════════════
# Clicando em uma vulnerabilidade, você vê:
#
# ┌─────────────────────────────────────────────────┐
# │ Name: Apache HTTP Server 2.4.49 - Path          │
# │       Traversal / RCE (CVE-2021-41773)           │
# │                                                   │
# │ Severity: 9.8 (Critical) ████████████████████░   │
# │                                                   │
# │ Host: 192.168.1.100                              │
# │ Port: 80/tcp                                      │
# │                                                   │
# │ QoD: 97% (Quality of Detection)                  │
# │ ↑ 97% = quase certeza que é real (não é FP)      │
# │ ↑ 70% = provável mas pode ser falso positivo     │
# │ ↑ 30% = baixa confiança, verificar manualmente   │
# │                                                   │
# │ Summary:                                          │
# │ Apache HTTP Server 2.4.49 é vulnerável a          │
# │ path traversal que permite leitura de arquivos    │
# │ arbitrários e, se mod_cgi estiver habilitado,     │
# │ execução remota de código (RCE).                  │
# │                                                   │
# │ Impact:                                           │
# │ Um atacante remoto não-autenticado pode ler       │
# │ qualquer arquivo do sistema (ex: /etc/shadow)     │
# │ e potencialmente executar comandos como o          │
# │ usuário do Apache.                                │
# │                                                   │
# │ Solution:                                         │
# │ Atualizar Apache HTTP Server para versão ≥ 2.4.51 │
# │                                                   │
# │ Detection Result:                                 │
# │ Installed version: 2.4.49                         │
# │ Fixed version:     2.4.51                         │
# │ Detection method:  Banner check (HTTP)            │
# │                                                   │
# │ References:                                       │
# │ CVE: CVE-2021-41773, CVE-2021-42013               │
# │ URL: https://httpd.apache.org/security/...         │
# │ CERT: DFN-CERT-2021-2095                           │
# └─────────────────────────────────────────────────┘

# ═══════════════════════════════════════════════════
# FILTROS ÚTEIS PARA ANÁLISE
# ═══════════════════════════════════════════════════
# Na barra de filtro do relatório:
#
# severity>7.0
#   → Mostra apenas Critical e High (ação urgente)
#
# severity>7.0 and qod>80
#   → Alta severidade E alta confiança (sem falsos positivos)
#
# host=192.168.1.100
#   → Apenas resultados de um host específico
#
# vulnerability~"Apache"
#   → Vulnerabilidades com "Apache" no nome
#
# solution_type="VendorFix"
#   → Apenas as que têm patch disponível
#
# cvss_base>8.0 sort=severity rows=100
#   → Top 100 mais críticas, ordenadas por severidade

# ═══════════════════════════════════════════════════
# EXPORTAR RELATÓRIO
# ═══════════════════════════════════════════════════
# Menu: Scans → Reports → (selecionar) → Export ↓
#
# Formatos disponíveis:
# - PDF    → para enviar ao cliente (mais profissional)
# - CSV    → para análise em Excel/planilha
# - XML    → para integração com outras ferramentas
# - TXT    → texto simples
# - ITG    → formato de compliance
#
# Dica: Use PDF para o relatório do cliente
#       e CSV para sua análise interna.`}
      />

      <h2>Automação via Linha de Comando</h2>
      <CodeBlock
        title="gvm-cli — controle total via terminal"
        code={`# ═══════════════════════════════════════════════════
# INSTALAR gvm-tools
# ═══════════════════════════════════════════════════
sudo apt install gvm-tools
# Inclui: gvm-cli, gvm-script, gvm-pyshell

# ═══════════════════════════════════════════════════
# AUTENTICAÇÃO
# ═══════════════════════════════════════════════════
# Método 1: Socket (local, mais rápido)
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_version/>'
# Retorna versão do GMP (Greenbone Management Protocol)

# Método 2: TLS (remoto)
gvm-cli --gmp-username admin --gmp-password SENHA tls \\
  --hostname 192.168.1.100 --port 9390 \\
  --xml '<get_version/>'

# ═══════════════════════════════════════════════════
# LISTAR RECURSOS EXISTENTES
# ═══════════════════════════════════════════════════

# Listar targets (alvos)
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_targets/>'
# Retorna XML com todos os targets, incluindo IDs

# Listar scan configs
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_configs/>'
# Anote o ID da config desejada (ex: Full and fast)

# Listar scanners
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_scanners/>'

# Listar tarefas
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_tasks/>'

# Listar relatórios
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_reports/>'

# ═══════════════════════════════════════════════════
# CRIAR E EXECUTAR SCAN VIA CLI
# ═══════════════════════════════════════════════════

# Passo 1: Criar target
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<create_target>
    <name>Lab Server CLI</name>
    <hosts>192.168.1.100</hosts>
    <port_list id="PORT_LIST_ID"/>
    <alive_tests>ICMP and ARP Ping</alive_tests>
  </create_target>'
# Retorna: <create_target_response id="TARGET_ID" .../>
# ⚠️ Anote o TARGET_ID retornado!

# Passo 2: Criar task
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<create_task>
    <name>Scan CLI Full</name>
    <config id="CONFIG_ID"/>
    <target id="TARGET_ID"/>
    <scanner id="SCANNER_ID"/>
  </create_task>'
# Retorna: <create_task_response id="TASK_ID" .../>

# Passo 3: Iniciar scan
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<start_task task_id="TASK_ID"/>'
# Retorna: <start_task_response>
#            <report_id>REPORT_ID</report_id>
#          </start_task_response>

# Passo 4: Verificar progresso
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_tasks task_id="TASK_ID"/>'
# Procurar: <status>Running</status> <progress>45</progress>

# Passo 5: Obter relatório quando completar
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_reports report_id="REPORT_ID"
    filter="severity>4.0 rows=100 sort-reverse=severity"
    format_id="FORMAT_ID"/>'`}
      />

      <h2>Script Python para Automação</h2>
      <CodeBlock
        title="Automatizar scans com Python e gvm-tools"
        code={`# Instalar biblioteca Python
pip install gvm-tools python-gvm

# ═══════════════════════════════════════════════════
# Script completo: criar target, scan, e obter resultados
# ═══════════════════════════════════════════════════
cat << 'PYEOF' > scan_automatico.py
#!/usr/bin/env python3
"""
Scan automatizado com OpenVAS/GVM via Python.
Uso: python3 scan_automatico.py 192.168.1.100
"""
import sys
import time
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform

TARGET_IP = sys.argv[1] if len(sys.argv) > 1 else "192.168.1.100"
GVM_USER = "admin"
GVM_PASS = "SENHA_AQUI"

# IDs padrão do GVM (podem variar na sua instalação)
# Use get_configs/get_scanners/get_port_lists para encontrar
SCAN_CONFIG_FULL_FAST = "daba56c8-73ec-11df-a475-002264764cea"
OPENVAS_SCANNER = "08b69003-5fc2-4037-a479-93b440211c73"
PORT_LIST_ALL_TCP = "33d0cd82-57c6-11e1-8ed1-406186ea4fc5"

connection = UnixSocketConnection()
transform = EtreeTransform()

with Gmp(connection, transform=transform) as gmp:
    gmp.authenticate(GVM_USER, GVM_PASS)
    print(f"[+] Autenticado como {GVM_USER}")

    # 1. Criar Target
    target_resp = gmp.create_target(
        name=f"Auto-scan {TARGET_IP}",
        hosts=[TARGET_IP],
        port_list_id=PORT_LIST_ALL_TCP,
        alive_test=gmp.types.AliveTest.ICMP_AND_ARP_PING
    )
    target_id = target_resp.get('id')
    print(f"[+] Target criado: {target_id}")

    # 2. Criar Task
    task_resp = gmp.create_task(
        name=f"Scan {TARGET_IP} - {time.strftime('%Y-%m-%d')}",
        config_id=SCAN_CONFIG_FULL_FAST,
        target_id=target_id,
        scanner_id=OPENVAS_SCANNER
    )
    task_id = task_resp.get('id')
    print(f"[+] Task criada: {task_id}")

    # 3. Iniciar Scan
    start_resp = gmp.start_task(task_id)
    report_id = start_resp[0].text  # report_id
    print(f"[+] Scan iniciado! Report ID: {report_id}")

    # 4. Monitorar progresso
    while True:
        task_info = gmp.get_task(task_id)
        status = task_info.find('.//status').text
        progress = task_info.find('.//progress')
        prog_val = progress.text if progress is not None else "?"
        print(f"    Status: {status} | Progresso: {prog_val}%")

        if status in ("Done", "Stopped"):
            break
        time.sleep(30)  # Verificar a cada 30 segundos

    # 5. Obter Resultados
    print(f"\\n[+] Scan completo! Obtendo resultados...")
    results = gmp.get_results(
        filter_string=f"report_id={report_id} "
                      f"severity>0 sort-reverse=severity rows=200"
    )

    print(f"\\n{'='*60}")
    print(f"RELATÓRIO DE VULNERABILIDADES — {TARGET_IP}")
    print(f"{'='*60}")

    for result in results.findall('.//result'):
        name = result.find('name').text
        severity = result.find('severity').text
        host = result.find('host').text
        port = result.find('port').text
        desc = result.find('.//description')
        desc_text = desc.text[:200] if desc is not None and desc.text else "N/A"

        sev_float = float(severity)
        if sev_float >= 9.0:
            level = "CRITICAL"
        elif sev_float >= 7.0:
            level = "HIGH"
        elif sev_float >= 4.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        print(f"\\n[{level}] {severity} — {name}")
        print(f"  Host: {host}:{port}")
        print(f"  Desc: {desc_text}...")

PYEOF

# Executar:
# python3 scan_automatico.py 192.168.1.100`}
      />

      <h2>Comparação: OpenVAS vs Nessus vs Qualys</h2>
      <CodeBlock
        title="Quando usar cada scanner"
        code={`# ┌──────────────┬─────────────┬─────────────┬────────────┐
# │              │  OpenVAS    │   Nessus    │   Qualys   │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ Custo        │ GRATUITO    │ Pago        │ Pago       │
# │              │ Open-source │ $3,590/ano  │ Enterprise │
# │              │             │ (Pro)       │            │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ NVTs/Plugins │ +70.000     │ +200.000    │ +75.000    │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ Interface    │ Web (lenta) │ Web (boa)   │ Cloud      │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ Compliance   │ Básico      │ PCI, HIPAA  │ PCI, HIPAA │
# │              │             │ NIST, SOX   │ NIST, SOX  │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ API/CLI      │ GMP (XML)   │ REST API    │ REST API   │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ Falso Pos.   │ Médio       │ Baixo       │ Baixo      │
# ├──────────────┼─────────────┼─────────────┼────────────┤
# │ Ideal para   │ Aprendizado │ Pentest     │ Corporate  │
# │              │ CTF, Lab    │ Profissional│ Auditoria  │
# │              │ Orçamento 0 │ Consultoria │ Compliance │
# └──────────────┴─────────────┴─────────────┴────────────┘
#
# Resumo:
# - Estudante/CTF → OpenVAS (gratuito, completo o suficiente)
# - Pentester freelancer → Nessus Essentials (gratuito até 16 IPs)
# - Empresa/consultoria → Nessus Professional ou Qualys`}
      />

      <h2>Troubleshooting Comum</h2>
      <CodeBlock
        title="Problemas frequentes e soluções"
        code={`# ═══════════════════════════════════════════════════
# PROBLEMA: Interface web não carrega (porta 9392)
# ═══════════════════════════════════════════════════
# Verificar se os serviços estão rodando:
sudo systemctl status ospd-openvas
sudo systemctl status gvmd
sudo systemctl status gsad
# Se algum está parado:
sudo gvm-start

# ═══════════════════════════════════════════════════
# PROBLEMA: Scan fica em 0% ou "Requested" para sempre
# ═══════════════════════════════════════════════════
# Os NVTs podem não estar carregados ainda.
# Verificar:
sudo greenbone-feed-sync --type GVMD_DATA
sudo greenbone-feed-sync --type SCAP
sudo greenbone-feed-sync --type CERT
# Depois reiniciar:
sudo gvm-stop && sudo gvm-start

# ═══════════════════════════════════════════════════
# PROBLEMA: "Failed to find scan config"
# ═══════════════════════════════════════════════════
# Configs não foram importadas. Sincronizar feeds:
sudo greenbone-feed-sync
# Aguardar 5-10 min para o gvmd processar

# ═══════════════════════════════════════════════════
# PROBLEMA: Scan muito lento
# ═══════════════════════════════════════════════════
# 1. Usar "Full and fast" em vez de "Full and deep"
# 2. Reduzir Port List (usar "Top 1000" em vez de "All")
# 3. Aumentar concurrent NVTs: 4 → 8
# 4. Aumentar concurrent hosts: 20 → 30
# ⚠️ Mais concorrência = mais agressivo na rede

# ═══════════════════════════════════════════════════
# PROBLEMA: Muitos falsos positivos
# ═══════════════════════════════════════════════════
# 1. Aumentar QoD mínimo: 70% → 90%
# 2. Fazer scan AUTENTICADO (reduz FPs drasticamente)
# 3. Criar Overrides para marcar FPs conhecidos:
#    Scans → Reports → (resultado) → Override → False Positive
# 4. Usar Notes para documentar exceções`}
      />
    </PageContainer>
  );
}
