import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Metodologia() {
    return (
      <PageContainer
        title="Metodologia de Pentest Profissional"
        subtitle="Siga um processo estruturado para entregar resultados profissionais e defensáveis em testes de penetração."
        difficulty="intermediario"
        timeToRead="16 min"
      >
        <AlertBox type="info" title="Um pentest sem metodologia não é um pentest">
          A diferença entre um hacker e um pentester profissional é a metodologia.
          Documentar cada passo, seguir um escopo definido e entregar relatórios claros
          é o que as empresas pagam.
        </AlertBox>

        <h2>Fases do Pentest (PTES)</h2>
        <CodeBlock language="bash" code={'# Penetration Testing Execution Standard (PTES)\n# https://www.pentest-standard.org\n\n# Fase 1: Pre-engagement (Pré-engajamento)\n# - Definir escopo (quais IPs/domínios/sistemas)\n# - Assinar contrato e NDA\n# - Definir janela de tempo\n# - Ponto de contato do cliente\n# - Regras de engajamento\n\n# Fase 2: Intelligence Gathering (Coleta de Inteligência)\n# - OSINT passivo (WHOIS, DNS, theHarvester, Shodan)\n# - Reconhecimento ativo (nmap, whatweb)\n# - Mapeamento de tecnologias\n\n# Fase 3: Threat Modeling (Modelagem de Ameaças)\n# - Priorizar alvos de maior valor\n# - Avaliar probabilidade e impacto\n\n# Fase 4: Vulnerability Analysis (Análise de Vulnerabilidades)\n# - Scan automático (Nessus, OpenVAS, Nuclei)\n# - Análise manual\n# - Validação das vulnerabilidades encontradas\n\n# Fase 5: Exploitation (Exploração)\n# - Explorar vulnerabilidades no escopo\n# - Sem causar danos ou interrupção de serviço\n\n# Fase 6: Post-Exploitation\n# - Demonstrar impacto (acesso a dados sensíveis)\n# - Movimentação lateral\n# - Evidências (screenshots, logs)\n\n# Fase 7: Reporting (Relatório)\n# - Executivo (para gerência)\n# - Técnico (para TI)\n# - Prioridade e plano de remediação'} />

        <h2>Documento de Escopo</h2>
        <CodeBlock language="bash" code={'# O que deve estar no escopo (Rules of Engagement):\n\n# IPs/Domínios autorizados:\n# - 192.168.1.0/24\n# - webapp.empresa.com\n# - api.empresa.com\n\n# Tipos de teste autorizados:\n# [x] Varredura de portas\n# [x] Exploração de vulnerabilidades web\n# [x] Escalação de privilégios\n# [ ] Ataques DDoS — PROIBIDO\n# [ ] Engenharia social — PROIBIDO (neste escopo)\n\n# Janela de tempo:\n# Início: 2024-03-01 08:00 BRT\n# Fim: 2024-03-05 18:00 BRT\n\n# Ponto de contato:\n# Nome: João Silva\n# Telefone: (11) 99999-9999\n# E-mail: joao@empresa.com.br\n\n# Condição para interrupção imediata:\n# Se encontrar dados de clientes expostos → notificar imediatamente'} />

        <h2>Ferramentas para Estruturar o Pentest</h2>
        <CodeBlock language="bash" code={'# Dradis — plataforma de colaboração para pentest\ngem install dradis\ndradis\n\n# Faraday — workspace colaborativo\npip3 install faraday-cli\nfaraday-client\n\n# CherryTree — notes organizadas\nsudo apt install cherrytree -y\n\n# Keepnote / Obsidian — documentação\n\n# Nuclei — scanner de vulnerabilidades moderno\nsudo apt install nuclei -y\nnuclei -u https://alvo.com -t cves/\nnuclei -l urls.txt -t nuclei-templates/ -severity high,critical'} />

        <h2>Checklist por Fase</h2>
        <CodeBlock language="bash" code={'# RECONHECIMENTO\n# [ ] WHOIS do domínio\n# [ ] DNS enumeration\n# [ ] Subdomínios (amass, subfinder, crt.sh)\n# [ ] E-mails (theHarvester, hunter.io)\n# [ ] Tecnologias (whatweb, wappalyzer)\n# [ ] Google Dorks\n# [ ] Shodan\n# [ ] Vazamentos (HaveIBeenPwned, dehashed)\n\n# VARREDURA\n# [ ] Nmap full port scan\n# [ ] Nmap service version (-sV)\n# [ ] Nmap scripts (-sC)\n# [ ] Nikto (web)\n# [ ] Gobuster/feroxbuster (directories)\n\n# EXPLORAÇÃO WEB\n# [ ] OWASP Top 10\n# [ ] SQLi (SQLMap + manual)\n# [ ] XSS\n# [ ] LFI/RFI\n# [ ] IDOR\n# [ ] SSRF\n# [ ] Auth bypass\n\n# RELATÓRIO\n# [ ] Executive Summary\n# [ ] Vulnerabilidades por criticidade\n# [ ] Evidências (screenshots, comandos)\n# [ ] CVSS scores\n# [ ] Recomendações de remediação'} />

        <AlertBox type="success" title="Certificações relevantes">
          OSCP (Offensive Security Certified Professional) — a mais reconhecida.
          CEH (Certified Ethical Hacker), eJPT (eLearnSecurity Junior Pentester — gratuito para começar),
          PNPT (Practical Network Penetration Tester — muito prático).
        </AlertBox>
      </PageContainer>
    );
  }
  