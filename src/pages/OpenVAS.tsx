import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function OpenVAS() {
  return (
    <PageContainer
      title="OpenVAS / GVM — Scanner de Vulnerabilidades"
      subtitle="Use o OpenVAS (Greenbone Vulnerability Management) para identificar vulnerabilidades em redes e sistemas de forma automatizada."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>O que é OpenVAS?</h2>
      <p>
        O <strong>OpenVAS</strong> (Open Vulnerability Assessment Scanner) é um scanner de vulnerabilidades
        open-source, parte do framework <strong>GVM (Greenbone Vulnerability Management)</strong>. Ele testa
        milhares de CVEs conhecidas contra alvos na rede, gerando relatórios detalhados com severidade e remediação.
      </p>

      <AlertBox type="warning" title="Uso ético obrigatório">
        Escaneie apenas sistemas que você tem autorização para testar. Scanners de vulnerabilidade
        geram muito tráfego e podem ser detectados como ataques.
      </AlertBox>

      <h2>Instalação no Kali</h2>
      <CodeBlock
        title="Instalar e inicializar o GVM/OpenVAS"
        code={`# Instalar o GVM (inclui OpenVAS)
sudo apt update && sudo apt install gvm -y

# Configuração inicial (demora ~30 min na primeira vez)
sudo gvm-setup

# Anotar a senha do admin gerada no final!
# Admin password: XXXXXXXX

# Verificar se tudo está funcionando
sudo gvm-check-setup

# Iniciar os serviços
sudo gvm-start

# Acessar via navegador
# https://127.0.0.1:9392
# Login: admin / (senha gerada)`}
      />

      <h2>Usando o OpenVAS</h2>

      <h3>Criar um Alvo (Target)</h3>
      <CodeBlock
        title="Configurar alvo para scan"
        code={`# Via interface web:
# 1. Configuration → Targets → New Target
# 2. Nome: "Servidor Web Lab"
# 3. Hosts: 192.168.1.100  (ou range: 192.168.1.0/24)
# 4. Port List: All IANA assigned TCP (padrão)
# 5. Alive Test: ICMP & ARP Ping

# Via linha de comando (gvm-cli):
sudo apt install gvm-tools

# Autenticar
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<create_target>
    <name>Lab Server</name>
    <hosts>192.168.1.100</hosts>
  </create_target>'`}
      />

      <h3>Criar e Executar um Scan</h3>
      <CodeBlock
        title="Criar tarefa de scan"
        code={`# Via interface web:
# 1. Scans → Tasks → New Task
# 2. Nome: "Scan Completo Lab"
# 3. Scan Targets: (selecionar o target criado)
# 4. Scanner: OpenVAS Default
# 5. Scan Config:
#    - Full and fast (recomendado — rápido e eficaz)
#    - Full and deep (mais lento, mais completo)
#    - Discovery (apenas descoberta de hosts)
# 6. Clicar Start

# O scan pode levar de minutos a horas dependendo do alvo

# Via CLI:
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<create_task>
    <name>Full Scan</name>
    <config id="CONFIG_ID"/>
    <target id="TARGET_ID"/>
    <scanner id="SCANNER_ID"/>
  </create_task>'`}
      />

      <h3>Analisar Resultados</h3>
      <CodeBlock
        title="Interpretar resultados do scan"
        code={`# Classificação de severidade:
# Critical (9.0-10.0) — Exploração remota possível, ação imediata
# High (7.0-8.9)     — Risco sério, corrigir em dias
# Medium (4.0-6.9)   — Risco moderado, planejar correção
# Low (0.1-3.9)      — Risco baixo, informativo

# Para cada vulnerabilidade:
# - CVE ID (ex: CVE-2021-44228)
# - CVSS Score
# - Descrição do problema
# - Solução/remediação
# - Referências

# Exportar relatório:
# Scans → Reports → (selecionar) → Export
# Formatos: PDF, CSV, XML, TXT

# Filtrar por severidade:
# severity>7.0     — só Critical e High
# severity>4.0     — Medium ou acima`}
      />

      <h2>Scan via Linha de Comando</h2>
      <CodeBlock
        title="Automação com gvm-cli e gvm-pyshell"
        code={`# Listar targets
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_targets/>'

# Listar scans/tasks
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_tasks/>'

# Listar resultados de um scan
gvm-cli --gmp-username admin --gmp-password SENHA socket \\
  --xml '<get_results task_id="TASK_ID"/>'

# Script Python com gvm-tools
pip install gvm-tools

python3 << 'PYEOF'
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform

connection = UnixSocketConnection()
transform = EtreeTransform()

with Gmp(connection, transform=transform) as gmp:
    gmp.authenticate('admin', 'SENHA')
    
    # Listar tarefas
    tasks = gmp.get_tasks()
    for task in tasks.findall('.//task'):
        print(f"Task: {task.find('name').text}")
        print(f"  Status: {task.find('status').text}")
PYEOF`}
      />

      <h2>OpenVAS vs Nessus</h2>
      <CodeBlock
        title="Comparação rápida"
        code={`# OpenVAS (GVM)
# ✓ Open-source e gratuito
# ✓ Comunidade ativa
# ✓ Feed de vulnerabilidades gratuito (Community Feed)
# ✗ Interface mais lenta
# ✗ Menos plugins que Nessus

# Nessus (Tenable)
# ✓ Interface mais polida
# ✓ Mais plugins e detecções
# ✓ Compliance checks (PCI-DSS, HIPAA)
# ✗ Versão gratuita limitada a 16 IPs
# ✗ Licença cara para uso profissional

# Para CTFs e aprendizado: OpenVAS é perfeito
# Para pentest profissional: considere ambos`}
      />
    </PageContainer>
  );
}
