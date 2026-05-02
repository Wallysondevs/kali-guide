import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ReconNg() {
  return (
    <PageContainer
      title="Recon-ng — framework modular de OSINT"
      subtitle="Estilo Metasploit, mas para coleta de inteligência: workspaces, módulos, banco SQLite, relatórios."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y recon-ng",
            out: "(já vem no kali-tools-information-gathering)",
            outType: "muted",
          },
          {
            cmd: "recon-ng",
            out: `    _/_/_/    _/_/_/_/    _/_/_/    _/_/_/    _/      _/            _/      _/    _/_/_/
   _/    _/  _/        _/        _/    _/  _/_/    _/            _/_/    _/  _/
  _/_/_/    _/_/_/    _/        _/    _/  _/  _/  _/  _/_/_/_/  _/  _/  _/  _/  _/_/
 _/    _/  _/        _/        _/    _/  _/    _/_/            _/    _/_/  _/    _/
_/    _/  _/_/_/_/    _/_/_/    _/_/_/    _/      _/            _/      _/    _/_/_/

                          /\\
                         / \\\\ /\\
    Sponsored by...     /\\  //\\\\/  \\
                       /  \\///\\/    \\/\\
                       \\\\\\\\\\\\\\///\\/\\///
    BLACK HILLS \\   //\\\\\\\\\\\\\\///\\/\\\\
                  \\///\\\\///\\/\\///

[recon-ng v5.1.2, Tim Tomes (@lanmaster53)]

[80] Recon modules
[8]  Reporting modules
[2]  Import modules
[2]  Exploitation modules
[2]  Discovery modules

[recon-ng][default] >`,
            outType: "info",
          },
        ]}
      />

      <h2>Workspaces</h2>
      <Terminal
        user="recon-ng"
        host="default"
        path=""
        lines={[
          {
            cmd: "workspaces create acme",
            out: "[recon-ng][acme] >",
            outType: "muted",
          },
          {
            cmd: "workspaces list",
            out: `+----------+
| Workspaces |
+----------+
| default  |
| acme     |
| htb      |
+----------+`,
            outType: "info",
          },
          {
            cmd: "db schema",
            out: `+----------------+
| Table          |
+----------------+
| companies      |
| contacts       |
| credentials    |
| domains        |
| hosts          |
| leaks          |
| locations      |
| netblocks      |
| ports          |
| profiles       |
| pushpins       |
| repositories   |
| vulnerabilities|
+----------------+`,
            outType: "default",
          },
        ]}
      />

      <h2>Marketplace de módulos</h2>
      <Terminal
        user="recon-ng"
        host="acme"
        path=""
        lines={[
          {
            cmd: "marketplace search hackertarget",
            out: `+--------------------------------------------------------------+
| Path                                | Version | Status     | Updated   | D | K |
+--------------------------------------------------------------+
| recon/companies-multi/whois_miner   | 1.1     | not installed | 2020-04 |   |   |
| recon/domains-hosts/hackertarget    | 1.1     | installed     | 2020-04 |   |   |
+--------------------------------------------------------------+`,
            outType: "info",
          },
          {
            cmd: "marketplace install recon/domains-hosts/hackertarget",
            out: `[*] Module installed: recon/domains-hosts/hackertarget
[*] Reloading modules...`,
            outType: "success",
          },
          {
            cmd: "marketplace search subdomain",
            out: `+--------------------------------------------------------------+
| Path                                          | Status        |
+--------------------------------------------------------------+
| recon/domains-hosts/bing_domain_web           | not installed |
| recon/domains-hosts/brute_hosts               | not installed |
| recon/domains-hosts/certificate_transparency  | installed     |
| recon/domains-hosts/google_site_web           | not installed |
| recon/domains-hosts/hackertarget              | installed     |
| recon/domains-hosts/threatcrowd               | installed     |
+--------------------------------------------------------------+`,
            outType: "default",
          },
        ]}
      />

      <h2>Workflow típico</h2>
      <Terminal
        user="recon-ng"
        host="acme"
        path=""
        lines={[
          {
            comment: "1) inserir o domínio alvo no banco",
            cmd: "db insert domains",
            out: `domain (TEXT): kali.org
notes (TEXT): 
[*] 1 row affected.`,
            outType: "muted",
          },
          {
            cmd: "show domains",
            out: `+----+------------+-------+---------------------+
| rowid | domain  | notes | module              |
+----+------------+-------+---------------------+
|  1 | kali.org   |       | user_defined        |
+----+------------+-------+---------------------+`,
            outType: "info",
          },
          {
            comment: "2) usar módulo de CT",
            cmd: "modules load recon/domains-hosts/certificate_transparency",
            out: "[recon-ng][acme][certificate_transparency] >",
            outType: "default",
          },
          {
            cmd: "info",
            out: `      Name: Certificate Transparency Search
      Path: modules/recon/domains-hosts/certificate_transparency.py
   Version: 2.0
   
Description:
  Uses the crt.sh Censys Certificate Transparency search to discover hostnames.

Options:
  Name    Current Value  Required  Description
  ------  -------------  --------  -----------
  SOURCE  default        yes       source of input (see 'show info' for details)`,
            outType: "muted",
          },
          {
            cmd: "run",
            out: `─────────────
KALI.ORG
─────────────
[*] [host] kali.org (<blank>)
[*] [host] www.kali.org (<blank>)
[*] [host] bugs.kali.org (<blank>)
[*] [host] docs.kali.org (<blank>)
[*] [host] forums.kali.org (<blank>)
[*] [host] http.kali.org (<blank>)
[*] [host] mirror.kali.org (<blank>)

-------SUMMARY-------
[*] 7 total (7 new) hosts found.`,
            outType: "success",
          },
          {
            cmd: "back",
            out: "[recon-ng][acme] >",
            outType: "muted",
          },
        ]}
      />

      <h2>Resolver hosts e enriquecer</h2>
      <Terminal
        user="recon-ng"
        host="acme"
        path=""
        lines={[
          {
            cmd: "modules load recon/hosts-hosts/resolve",
            out: "[recon-ng][acme][resolve] >",
            outType: "muted",
          },
          {
            cmd: "run",
            out: `[*] kali.org => 192.124.249.10
[*] www.kali.org => 192.124.249.10
[*] bugs.kali.org => 192.124.249.10
[*] docs.kali.org => 104.21.50.71
[*] forums.kali.org => 104.21.50.71

-------SUMMARY-------
[*] 5 hosts resolved.`,
            outType: "success",
          },
          {
            cmd: "back; show hosts",
            out: `+----+------------------+----------------+----------+--------+--------+--------------+
| ro | host             | ip_address     | region   | country| latitu | longitude    |
+----+------------------+----------------+----------+--------+--------+--------------+
|  1 | kali.org         | 192.124.249.10 |          |        |        |              |
|  2 | www.kali.org     | 192.124.249.10 |          |        |        |              |
|  3 | bugs.kali.org    | 192.124.249.10 |          |        |        |              |
|  4 | docs.kali.org    | 104.21.50.71   |          |        |        |              |
|  5 | forums.kali.org  | 104.21.50.71   |          |        |        |              |
+----+------------------+----------------+----------+--------+--------+--------------+`,
            outType: "info",
          },
        ]}
      />

      <h2>API keys</h2>
      <Terminal
        user="recon-ng"
        host="acme"
        path=""
        lines={[
          {
            cmd: "keys list",
            out: `+--------------------+--------+
| Name               | Value  |
+--------------------+--------+
| bing_api           |        |
| censysio_id        |        |
| censysio_secret    |        |
| github_api         |        |
| hashes_api         |        |
| hunter_io          |        |
| shodan_api         |        |
| virustotal_api     |        |
+--------------------+--------+`,
            outType: "default",
          },
          {
            cmd: "keys add shodan_api ABCDxyz123...",
            out: "[*] Key 'shodan_api' added.",
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Módulos mais úteis"
        variations={[
          { cmd: "recon/domains-hosts/certificate_transparency", desc: "crt.sh — subdomínios via CT.", output: "Sem chave. Sempre rode primeiro." },
          { cmd: "recon/domains-hosts/hackertarget", desc: "Free tier do hackertarget.", output: "Sem chave. Limitado." },
          { cmd: "recon/domains-hosts/google_site_web", desc: "Google site: scraping.", output: "Pode bater rate-limit." },
          { cmd: "recon/domains-hosts/shodan_hostname", desc: "Shodan por hostname.", output: "Pede shodan_api." },
          { cmd: "recon/domains-contacts/whois_pocs", desc: "Pessoa de contato no WHOIS.", output: "Sem chave." },
          { cmd: "recon/companies-contacts/bing_linkedin_cache", desc: "Funcionários no LinkedIn (cache).", output: "Pede bing_api." },
          { cmd: "recon/contacts-credentials/hibp_paste", desc: "Email em pastes (Pastebin etc).", output: "Pede hibp_api." },
          { cmd: "recon/contacts-credentials/hibp_breach", desc: "Email em breaches públicos.", output: "Pede hibp_api." },
          { cmd: "recon/hosts-ports/shodan_ip", desc: "Portas de cada IP via Shodan.", output: "Pede shodan_api." },
          { cmd: "recon/netblocks-companies/whois_orgs", desc: "Empresas em um netblock.", output: "Útil para mapear cloud." },
          { cmd: "discovery/info_disclosure/interesting_files", desc: "Tenta achar arquivos sensíveis.", output: "Web crawl ativo." },
          { cmd: "reporting/csv", desc: "Exporta tabela em CSV.", output: "Para anexar no report." },
          { cmd: "reporting/html", desc: "Gera relatório HTML.", output: "Visual, com gráficos." },
        ]}
      />

      <h2>Relatórios</h2>
      <Terminal
        user="recon-ng"
        host="acme"
        path=""
        lines={[
          {
            cmd: "modules load reporting/html",
            out: "[recon-ng][acme][html] >",
            outType: "muted",
          },
          {
            cmd: "options set FILENAME /tmp/report_acme.html; options set CREATOR Wallyson; options set CUSTOMER ACME",
            out: `FILENAME => /tmp/report_acme.html
CREATOR  => Wallyson
CUSTOMER => ACME`,
            outType: "default",
          },
          {
            cmd: "run",
            out: `[*] Report generated at '/tmp/report_acme.html'.`,
            outType: "success",
          },
          {
            cmd: "back; modules load reporting/csv",
            out: "[recon-ng][acme][csv] >",
            outType: "muted",
          },
          {
            cmd: "options set TABLE hosts; options set FILENAME /tmp/hosts.csv; run",
            out: "[*] 5 records added to '/tmp/hosts.csv'.",
            outType: "info",
          },
        ]}
      />

      <OutputBlock label="estrutura do report HTML gerado" type="muted">
{`/tmp/report_acme.html
├── Sumário (totals)
├── Domains (1)
├── Hosts (5)
├── Contacts (0)
├── Credentials (0)
└── Generated by Wallyson on 2026-04-03`}
      </OutputBlock>

      <h2>Tudo em script (resource file)</h2>
      <OutputBlock label="acme.rc — sequência reproduzível" type="default">
{`workspaces create acme
db insert domains kali.org

modules load recon/domains-hosts/certificate_transparency
run
back

modules load recon/hosts-hosts/resolve
run
back

modules load reporting/html
options set FILENAME /tmp/report_acme.html
options set CREATOR Wallyson
options set CUSTOMER ACME
run`}
      </OutputBlock>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "recon-ng -r acme.rc",
            out: `(roda os comandos do arquivo, depois sai)
[*] Report generated at '/tmp/report_acme.html'.`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Recon-ng full pipe — domínio até relatório"
        goal="Coletar subdomínios + IPs + portas + report HTML, tudo num script reproduzível."
        steps={[
          "Crie o workspace.",
          "Insira o domínio alvo.",
          "Rode CT + hackertarget + threatcrowd.",
          "Resolva os hosts.",
          "Se tiver shodan_api, rode shodan_ip para enriquecer com portas.",
          "Gere relatório HTML.",
        ]}
        command={`cat > /tmp/full.rc << 'EOF'
workspaces create alvo
db insert domains alvo.com

modules load recon/domains-hosts/certificate_transparency
run
back

modules load recon/domains-hosts/hackertarget
run
back

modules load recon/hosts-hosts/resolve
run
back

modules load reporting/html
options set FILENAME /tmp/relatorio_alvo.html
options set CREATOR seu_nome
options set CUSTOMER alvo
run
EOF

recon-ng -r /tmp/full.rc`}
        expected={`[*] [host] alvo.com
[*] [host] www.alvo.com
[*] alvo.com => 200.150.10.42
[*] www.alvo.com => 200.150.10.42
[*] Report generated at '/tmp/relatorio_alvo.html'.`}
        verify="O HTML deve ter as seções Domains/Hosts populadas e abrir corretamente em um navegador."
      />

      <AlertBox type="info" title="Recon-ng vs theHarvester">
        <strong>theHarvester</strong> é one-shot rápido; <strong>Recon-ng</strong> é
        framework com banco — você acumula dados de várias fontes na mesma "investigação"
        (workspace) ao longo do tempo. Use Recon-ng quando o trabalho for de dias ou semanas.
      </AlertBox>
    </PageContainer>
  );
}
