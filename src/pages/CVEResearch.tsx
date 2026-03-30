import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function CVEResearch() {
    return (
      <PageContainer
        title="Pesquisa de CVEs e Vulnerabilidades"
        subtitle="Encontre, avalie e explore vulnerabilidades conhecidas (CVEs) usando fontes oficiais e ferramentas especializadas."
        difficulty="intermediario"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="Conhecer CVEs = vantagem competitiva">
          Um pentester que conhece os CVEs recentes, sabe avaliá-los e aplicá-los corretamente
          está muito à frente da concorrência. CVEs são o "cardápio" do pentest.
        </AlertBox>

        <h2>Fontes Oficiais de CVEs</h2>
        <CodeBlock language="bash" code={'# NVD (National Vulnerability Database)\n# https://nvd.nist.gov/vuln/search\n# - Busca por produto, versão, CVSS score\n# - Dados detalhados: CVSS, CWE, referências\n\n# Mitre CVE List\n# https://cve.mitre.org/cve/search_cve_list.html\n\n# CISA Known Exploited Vulnerabilities\n# https://www.cisa.gov/known-exploited-vulnerabilities-catalog\n# - CVEs com exploits confirmados em uso real!\n\n# Vendor Advisories:\n# Microsoft: https://msrc.microsoft.com/update-guide\n# RedHat: https://access.redhat.com/security/cve\n# Ubuntu: https://ubuntu.com/security/cves'} />

        <h2>Ferramentas de Busca por CVE</h2>
        <CodeBlock language="bash" code={'# Searchsploit — busca local\nsearchsploit "CVE-2021-44228"\nsearchsploit apache 2.4.49\n\n# vulners.com API\ncurl "https://vulners.com/api/v3/burp/software/?software=Apache+HTTPD&version=2.4.49&type=software"\n\n# NIST NVD API\ncurl "https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=log4shell" | python3 -m json.tool\n\n# CVEdetails.com — interface amigável\n# https://www.cvedetails.com/product/18/Apache-Http-Server.html?vendor_id=45\n\n# Nuclei — scanner com templates CVE\nnuclei -u https://alvo.com -t cves/2023/\nnuclei -l hosts.txt -t cves/ -severity critical,high'} />

        <h2>CVSS — Avaliando a Criticidade</h2>
        <CodeBlock language="bash" code={'# CVSS (Common Vulnerability Scoring System)\n# Score de 0.0 a 10.0:\n\n# 0.0          — Nenhum\n# 0.1-3.9      — Baixo (Low)\n# 4.0-6.9      — Médio (Medium)\n# 7.0-8.9      — Alto (High)\n# 9.0-10.0     — Crítico (Critical)\n\n# Fatores do CVSS v3.1:\n# Base Score:\n# - Attack Vector: Network/Adjacent/Local/Physical\n# - Attack Complexity: Low/High\n# - Privileges Required: None/Low/High\n# - User Interaction: None/Required\n# - Scope: Unchanged/Changed\n# - Confidentiality/Integrity/Availability Impact\n\n# Calculadora online:\n# https://www.first.org/cvss/calculator/3.1'} />

        <h2>Identificar Versões e Buscar CVEs</h2>
        <CodeBlock language="bash" code={'# 1. Identificar versões com Nmap\nnmap -sV -sC 192.168.1.10\n# Apache httpd 2.4.49\n# OpenSSH 8.2p1\n\n# 2. Buscar CVEs para cada serviço\nsearchsploit apache 2.4.49\nsearchsploit openssh 8.2\n\n# 3. Verificar no NVD\ncurl "https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=cpe:2.3:a:apache:http_server:2.4.49"\n\n# 4. Nuclei automatizado\nnuclei -u http://192.168.1.10 -t cves/ -t technologies/'} />

        <h2>PoC — Prova de Conceito</h2>
        <CodeBlock language="bash" code={'# Encontrar PoC público\n# GitHub: pesquisar por CVE\n# git clone https://github.com/user/CVE-2021-44228-poc\n\n# Exploit-DB\nsearchsploit -x EDB-ID\n\n# PacketStorm\n# https://packetstormsecurity.com/\n\n# Awesome-CVE (PoCs categorizados)\n# https://github.com/trickest/cve\n\n# Validar PoC antes de usar:\n# - Ler o código completo\n# - Entender o que faz\n# - Verificar se não é malicioso (malware disfarçado de PoC)\n# - Testar em ambiente isolado primeiro'} />

        <h2>Automação de Busca por CVE</h2>
        <CodeBlock language="bash" code={'#!/bin/bash\n# cve_search.sh — buscar CVEs para serviços identificados\n\n# Extrair versões do nmap\nVERSOES=$(cat nmap_output.txt | grep -oP "(apache|nginx|openssh|php|wordpress)[\\w\\s\\./]*" | sort -u)\n\necho "$VERSOES" | while read versao; do\n  echo "\n[*] Buscando CVEs para: $versao"\n  searchsploit "$versao" --colour | head -20\ndone'} />

        <AlertBox type="success" title="VulnHub, HackTheBox e CVEs">
          Máquinas do HackTheBox e VulnHub frequentemente envolvem CVEs específicos.
          Aprender a pesquisar CVEs é essencial para resolver essas máquinas.
          Comece praticando com CVEs conhecidos antes de tentar 0-days.
        </AlertBox>
      </PageContainer>
    );
  }
  