import{j as e}from"./index-BofgBnE-.js";import{P as r}from"./PageContainer-B5fVeNJT.js";import{A as o}from"./AlertBox-B_JSQKUS.js";import{C as n}from"./CodeBlock-CaRmq6e3.js";import{C as s}from"./CommandTable-Ck2MUBHP.js";import{O as t}from"./OutputBlock-CumPmTZt.js";import{T as a,P as i}from"./PracticeBox-BgVTSfiK.js";function v(){return e.jsxs(r,{title:"OpenVAS / GVM — scanner de vulnerabilidades",subtitle:"Greenbone Vulnerability Management: setup, NVT feeds, targets, scan configs (Full and fast, deep), tasks agendadas, relatórios HTML/PDF/XML/CSV e CLI via gvm-cli.",difficulty:"intermediario",timeToRead:"35 min",children:[e.jsx("h2",{children:"O que é o OpenVAS"}),e.jsxs("p",{children:[e.jsx("strong",{children:"OpenVAS"})," (Open Vulnerability Assessment Scanner) é o scanner de vulnerabilidades open-source mais usado no mundo, parte do framework"," ",e.jsx("strong",{children:"GVM (Greenbone Vulnerability Management)"}),". O motor testa cada porta e serviço do alvo contra +70.000 NVTs (Network Vulnerability Tests) atualizados diariamente, retornando severidade CVSS, descrição e correção para cada achado."]}),e.jsx(t,{label:"componentes do GVM",type:"muted",children:`openvas-scanner   — motor que executa os NVTs (testes em NASL)
gvmd              — daemon que gerencia tasks, targets, reports, policies
gsad              — Greenbone Security Assistant (web UI na porta 9392)
ospd-openvas      — Open Scanner Protocol bridge entre gvmd e openvas
notus-scanner     — checa CVEs em pacotes via SSH/SMB (scan autenticado)
greenbone-feed-sync — atualiza NVT, SCAP, CERT e GVMD_DATA feeds
gvm-tools         — CLI: gvm-cli, gvm-script (automação via XML/GMP)`}),e.jsx(o,{type:"warning",title:"Uso ético obrigatório",children:"Escaneie apenas o que você tem autorização EXPRESSA para testar. Um scan completo gera milhares de requisições por host, é facilmente detectado por IDS/IPS e pode derrubar serviços frágeis. Em pentest profissional, vulnerability scanning precisa estar explicitamente no escopo do RoE assinado."}),e.jsx("h2",{children:"Instalação no Kali (passo a passo)"}),e.jsx(a,{path:"~",lines:[{comment:"1) instala TODOS os componentes do GVM",cmd:"sudo apt update && sudo apt install -y gvm",out:`Reading package lists... Done
The following NEW packages will be installed:
  gvm gvmd gsad openvas-scanner ospd-openvas notus-scanner
  greenbone-feed-sync gvm-tools postgresql-15 redis-server
0 upgraded, 142 newly installed.
Need to get 218 MB of archives.
After this operation, 612 MB of additional disk space will be used.`,outType:"muted"},{comment:"2) setup inicial — DEMORA 20-40 min (baixa NVTs, cria DB, gera certs, cria admin)",cmd:"sudo gvm-setup",out:`[*] Starting PostgreSQL service
[*] Creating gvmd database
[*] Migrating database schema
[*] Synchronizing GVMD data feed (Greenbone Community Feed)...
[####################] 100%  (24.318 NVTs baixados)
[*] Synchronizing SCAP feed (CVEs, CPEs, OVAL)...
[####################] 100%  (218.401 CVEs)
[*] Synchronizing CERT feed (CERT-Bund, DFN-CERT)...
[####################] 100%
[*] Generating certificates ...
[*] Creating admin user
+-------------------------------------------+
| User created with password '4f2c1a8b-9e3d-4a7f-b6c2-7891e2cd3a05'. |
+-------------------------------------------+
[+] Done. ANOTE A SENHA acima — não será mostrada de novo!`,outType:"warning"},{comment:"3) verificar saúde de cada componente",cmd:"sudo gvm-check-setup",out:`gvm-check-setup 22.4.0
  Test completeness and readiness of GVM-22.4

Step 1: Checking OpenVAS (Scanner)...
        OK: OpenVAS Scanner is present in version 22.7.9.
Step 2: Checking gvmd...
        OK: gvmd is present in version 22.6.1.
Step 3: Checking Greenbone Security Assistant (GSA)...
        OK: GSA is present in version 22.5.3.
Step 4: Checking PostgreSQL DB and user...
        OK: PostgreSQL 15.x active (database 'gvmd' exists, user '_gvm' has access).
Step 5: Checking NVTs / SCAP / CERT data...
        OK: 88.421 NVTs loaded, 218.401 CVEs, 32.518 CERT advisories.
Step 6: Checking ports...
        OK: gsad listening on TCP/9392 (HTTPS, self-signed).
        OK: gvmd listening on UNIX socket /run/gvmd/gvmd.sock.

It seems like your GVM-22.4 installation is OK.`,outType:"success"},{comment:"4) iniciar serviços (ospd-openvas, gvmd, gsad)",cmd:"sudo gvm-start",out:`[>] Please wait for the GVM services to start.
[>] You might need to refresh your browser once it opens.
[>] Web UI URL:  https://127.0.0.1:9392

[*] Starting ospd-openvas              [ OK ]
[*] Starting gvmd                      [ OK ]
[*] Starting gsad                      [ OK ]`,outType:"info"},{comment:"5) checar portas (gsad=9392 HTTPS)",cmd:"ss -lntp | grep -E ':(9390|9392)'",out:`LISTEN  0  4096  127.0.0.1:9392  0.0.0.0:*  users:(("gsad",pid=8421))
LISTEN  0  4096  127.0.0.1:9390  0.0.0.0:*  users:(("gvmd",pid=8418))   ← GMP (CLI)`,outType:"default"}]}),e.jsx("h2",{children:"Acesso à interface web"}),e.jsx(a,{path:"~",lines:[{comment:"abrir no Firefox; aceitar o cert self-signed",cmd:"firefox https://127.0.0.1:9392 &",out:`[1] 8901
(login: admin / 4f2c1a8b-9e3d-4a7f-b6c2-7891e2cd3a05)`,outType:"muted"},{comment:"trocar senha do admin (a gerada é difícil de lembrar)",cmd:"sudo gvmd --user=admin --new-password='Kali@OpenVAS2026!'",out:"(silencioso — sucesso)",outType:"success"},{comment:"criar usuário read-only para auditor externo",cmd:"sudo gvmd --create-user=auditor --role=Observer --password='Audit@2026'",out:"User created with password 'Audit@2026'.",outType:"info"},{comment:"criar pentester (role completo, pode fazer scans)",cmd:"sudo gvmd --create-user=ana.silva --password='AnaPent@2026!'",out:"User created with password 'AnaPent@2026!'.",outType:"info"},{cmd:"sudo gvmd --get-users",out:`admin
auditor
ana.silva`,outType:"default"}]}),e.jsx("h2",{children:"Atualizar feeds NVT/SCAP/CERT"}),e.jsxs("p",{children:["Os feeds são atualizados pela Greenbone diariamente. Rode ",e.jsx("code",{children:"greenbone-feed-sync"})," ","toda semana para ter NVTs novos (CVEs recém-publicados)."]}),e.jsx(a,{path:"~",lines:[{cmd:"sudo greenbone-feed-sync --type GVMD_DATA",out:`🔄 Downloading the GVMD data...
[####################] 100%   (124 MB)
✓ GVMD data successfully synchronized.`,outType:"success"},{cmd:"sudo greenbone-feed-sync --type SCAP",out:`🔄 Downloading SCAP data (CVEs, CPEs, OVAL)...
[####################] 100%   (842 MB)
✓ SCAP data successfully synchronized.
  Updated: 218.401 → 219.142 CVEs (+741 novas).`,outType:"success"},{cmd:"sudo greenbone-feed-sync --type CERT",out:`🔄 Downloading CERT-Bund / DFN-CERT advisories...
[####################] 100%
✓ CERT data successfully synchronized.`,outType:"success"},{comment:"rodar tudo via cron semanalmente",cmd:"sudo crontab -l | tail -5",out:`# Atualizar feeds GVM toda terça às 03:00
0 3 * * 2 /usr/bin/greenbone-feed-sync --type GVMD_DATA
5 3 * * 2 /usr/bin/greenbone-feed-sync --type SCAP
10 3 * * 2 /usr/bin/greenbone-feed-sync --type CERT
15 3 * * 2 /usr/bin/systemctl restart gvmd`,outType:"info"}]}),e.jsx("h2",{children:"Conceitos fundamentais"}),e.jsx(s,{title:"Glossário do GVM (saber antes de scanear)",variations:[{cmd:"Target",desc:"O QUE escanear: IP, range CIDR, lista, hostname. Inclui port list, alive test, credenciais.",output:"Ex: '192.168.50.0/24' + 'All TCP and Nmap top 1000' + ICMP & ARP Ping."},{cmd:"Scan Config",desc:"COMO escanear. Define quais NVTs rodar e como.",output:"Discovery / Host Discovery / Full and fast / Full and fast ultimate / Full and deep."},{cmd:"Task",desc:"Combina Target + Scan Config + Scanner. Unidade executável.",output:"Pode ser one-shot ou agendada (Schedule)."},{cmd:"Report",desc:"Resultado de uma execução de Task. Exportável em HTML/PDF/XML/CSV/TXT.",output:"Inclui severity, QoD, hosts, NVTs disparados."},{cmd:"NVT (Network Vuln Test)",desc:"Cada teste individual. Escrito em NASL. ~88.000 no feed.",output:"Cada NVT tem: OID, família, CVE associado, CVSS, script de detecção."},{cmd:"QoD (Quality of Detection)",desc:"Confiança de que o achado é real (não é FP). 0-100%.",output:"97% = quase certeza. 70% = padrão. 30% = checar manualmente."},{cmd:"CVSS",desc:"Severidade 0.0–10.0. None/Low/Medium/High/Critical.",output:"9.0+ = corrigir AGORA. 7.0–8.9 = dias. 4.0–6.9 = sprint. <4 = backlog."},{cmd:"Port List",desc:"Quais portas TCP/UDP escanear no Target.",output:"All IANA TCP (4590) / All TCP (65535) / Nmap top 1000 / OpenVAS Default."},{cmd:"Alive Test",desc:"Como detectar se host está vivo antes de escanear.",output:"ICMP & ARP Ping / Consider Alive / TCP-SYN Service Ping."}]}),e.jsx("h2",{children:"Scan Configs — qual escolher"}),e.jsx(s,{title:"Scan Configs prontos do Greenbone",variations:[{cmd:"Discovery",desc:"Apenas descobre hosts, portas e serviços. NÃO testa vulnerabilidades.",output:"~2 min/host. Use para mapeamento inicial da rede."},{cmd:"Host Discovery",desc:"Mais leve ainda — apenas verifica se hosts estão online.",output:"<30s/host. Inventário de rede."},{cmd:"Full and fast",desc:"RECOMENDADO. Testa todas as vulnerabilidades aplicáveis (otimizado).",output:"~15-30 min/host. Pula NVTs claramente inaplicáveis (ex: IIS em Linux)."},{cmd:"Full and fast ultimate",desc:"Como Full and fast + testes que podem causar DoS.",output:"~20-45 min/host. ⚠️ Pode derrubar serviços frágeis."},{cmd:"Full and deep",desc:"Auditoria completa, sem otimizações. Roda TUDO mesmo improvável.",output:"1-3 horas/host. Use para compliance/auditoria formal."},{cmd:"Full and deep ultimate",desc:"Deep + testes destrutivos. Combina o pior dos dois.",output:"2-5 horas/host. ⚠️ Pode crashar serviços. Só com autorização."},{cmd:"System Discovery",desc:"Detecta SO, fingerprint de OS, traceroute.",output:"Útil para classificar inventário antes de scan completo."}]}),e.jsx("h2",{children:"Workflow web — criar Target, Task, executar, ler Report"}),e.jsx(t,{label:"passo 1 — criar Target em Configuration → Targets → ⊕",type:"info",children:`Name:           Servidores Lab Empresa
Comment:        Subnet de homologação - escopo Q2/2026

Hosts (manual): 192.168.50.10, 192.168.50.20, 192.168.50.30
  ou range:     192.168.50.0/24
  ou file:      hosts.txt (um por linha)

Exclude Hosts:  192.168.50.1            (excluir gateway)
                192.168.50.5            (excluir impressora frágil)

Port List:      ▼ All TCP and Nmap top 1000 UDP    (bom equilíbrio)
                  All IANA assigned TCP            (4590 TCP, sem UDP)
                  All TCP                          (65535 TCP - LENTO)
                  OpenVAS Default                  (top ~4.000)

Alive Test:     ▼ ICMP & ARP Ping                 (padrão)
                  Consider Alive                  (firewall bloqueia ICMP)
                  ICMP Ping                       (só ICMP)
                  TCP-SYN Service Ping            (SYN nas portas comuns)

Credenciais (scan AUTENTICADO — opcional):
  SSH (Linux):   ana-ssh-prod        (criada em Configuration → Credentials)
  SMB (Windows): admin-smb-empresa
  ESXi:          —
  SNMP v3:       —

Reverse Lookup Only:    ☐
Reverse Lookup Unify:   ☐

[ Create ]`}),e.jsx(t,{label:"passo 2 — criar Task em Scans → Tasks → ⊕",type:"info",children:`Name:                       Scan Q2 - Servidores Lab
Comment:                     Pentest interno trimestral

Scan Targets:           ▼   Servidores Lab Empresa     (do passo 1)

Alterable Task:             ☐  (se ☑, pode editar config após começar)

Schedule:               ▼   Once
                            Every Monday 02:00
                            Every Sunday 22:00

Add results to
Asset Management:           ☑  (popula AM com hosts/serviços encontrados)

Apply Overrides:            ☑
Min QoD:                    70%

Auto-delete Reports:    ▼   Do not automatically delete
                            Keep last 5 reports

Scanner:                ▼   OpenVAS Default
Scan Config:            ▼   Full and fast        ← comece com este

Network Source Iface:       (vazio = padrão)

Order for target hosts: ▼   Sequential
                            Random              (mais furtivo)
                            Reverse

Maximum concurrent NVTs/host:    4
Maximum concurrent hosts:        20

[ Create ]`}),e.jsx(a,{path:"~",lines:[{comment:"verificar status da task pelo CLI gvm-cli",cmd:"gvm-cli --gmp-username admin --gmp-password 'Kali@OpenVAS2026!' socket --xml '<get_tasks/>' | xmllint --xpath '//task/name/text() | //task/status/text()' -",out:`Scan Q2 - Servidores Lab
Running 42%

Inventário Mensal
Done

Scan DMZ Externa
Requested`,outType:"info"},{cmd:"sudo journalctl -u gvmd -f --since '5 min ago'",out:`gvmd[8418]: md   main:MESSAGE: Slave got new task '7c1b...': starting
gvmd[8418]: md openvas: launching scan on 192.168.50.10
gvmd[8418]: md openvas: 192.168.50.10 progress 12% (NVT 1.3.6.1.4.1.25623.1.0.10330)
gvmd[8418]: md openvas: 192.168.50.10 host vulnerable: CVE-2021-41773 (Critical)
gvmd[8418]: md openvas: 192.168.50.10 progress 38%`,outType:"warning"}]}),e.jsx("h2",{children:"Lendo um Report — anatomia do achado"}),e.jsx(t,{label:"exemplo de vulnerability detectada",type:"error",children:`╔════════════════════════════════════════════════════════════════════╗
║ Apache HTTP Server 2.4.49 — Path Traversal/RCE (CVE-2021-41773)     ║
╠════════════════════════════════════════════════════════════════════╣
║ Severity:       9.8 (Critical)   ████████████████████░             ║
║ QoD:            97% — Banner check (HTTP)                           ║
║ Host:           192.168.50.10                                        ║
║ Port:           80/tcp                                               ║
║ NVT OID:        1.3.6.1.4.1.25623.1.0.150164                         ║
║ Family:         Web Servers                                          ║
║ First seen:     2026-04-04 14:21:33                                  ║
╠════════════════════════════════════════════════════════════════════╣
║ Summary:                                                             ║
║   O Apache HTTP Server 2.4.49 está vulnerável a path traversal       ║
║   que permite leitura arbitrária de arquivos. Se mod_cgi estiver     ║
║   habilitado, escala para Remote Code Execution (RCE).               ║
║                                                                      ║
║ Impact:                                                              ║
║   Atacante remoto não-autenticado pode ler /etc/shadow e executar    ║
║   comandos como o usuário do Apache (www-data).                      ║
║                                                                      ║
║ Solution:                                                            ║
║   Atualizar Apache HTTPD para versão >= 2.4.51                       ║
║                                                                      ║
║ Detection Result:                                                    ║
║   Installed version: 2.4.49                                          ║
║   Fixed version:     2.4.51                                          ║
║   Detection method:  HTTP banner (Server: header)                    ║
║                                                                      ║
║ References:                                                          ║
║   CVE: CVE-2021-41773, CVE-2021-42013                                ║
║   URL: https://httpd.apache.org/security/vulnerabilities_24.html     ║
║   CERT: DFN-CERT-2021-2095                                           ║
║   Exploit-DB: 50383                                                  ║
╚════════════════════════════════════════════════════════════════════╝`}),e.jsx("h2",{children:"Exportar relatórios — HTML / PDF / XML / CSV"}),e.jsx(a,{path:"~",lines:[{comment:"listar reports e pegar o ID",cmd:"gvm-cli --gmp-username admin --gmp-password 'Kali@OpenVAS2026!' socket --xml '<get_reports/>' | xmllint --xpath '//report/@id' - | head",out:`id="d2b7a912-4c1e-4f7b-91a2-baf67a01ec88"
id="3a1f88c0-12d3-4ba0-9e21-7a4b1c882bde"
id="9c2d4f81-6b3e-4d75-87a1-12c441ba7d09"`,outType:"default"},{comment:"exportar como PDF (formato '910200ca-dc05-11e1-954f-406186ea4fc5' = PDF)",cmd:`gvm-cli --gmp-username admin --gmp-password 'Kali@OpenVAS2026!' socket --xml '<get_reports report_id="d2b7a912-4c1e-4f7b-91a2-baf67a01ec88" format_id="c402cc3e-b531-11e1-9163-406186ea4fc5"/>' > scan-q2.html`,out:"(scan-q2.html — 1.4 MB; abre no browser, navegação por host/severity)",outType:"info"},{comment:"PDF (cliente formal)",cmd:"gvm-cli ... format_id='910200ca-dc05-11e1-954f-406186ea4fc5' ... | base64 -d > scan-q2.pdf",out:"(scan-q2.pdf — 842 KB; logo Greenbone, capa, sumário executivo)",outType:"info"},{comment:"CSV (importar em planilha / SIEM)",cmd:"gvm-cli ... format_id='c1645568-627a-11e3-a660-406186ea4fc5' ...",out:`IP,Hostname,Port,Severity,QoD,CVE,Summary,Solution
192.168.50.10,web01,80/tcp,9.8,97,CVE-2021-41773,"Apache HTTPD 2.4.49 path traversal","Update >= 2.4.51"
192.168.50.10,web01,443/tcp,7.5,80,CVE-2023-44487,"HTTP/2 Rapid Reset","Update nginx/openssl"
192.168.50.20,db01,3306/tcp,5.3,70,CVE-2022-21539,"MySQL InnoDB DoS","Update 8.0.30+"
[...142 linhas]`,outType:"warning"},{comment:"XML (parsear em Python / integrar com DefectDojo)",cmd:"gvm-cli ... format_id='a994b278-1f62-11e1-96ac-406186ea4fc5' ... > scan-q2.xml",out:`<?xml version="1.0"?>
<report id="d2b7a912-...">
  <result>
    <host>192.168.50.10</host>
    <port>80/tcp</port>
    <nvt oid="1.3.6.1.4.1.25623.1.0.150164">
      <name>Apache HTTPD 2.4.49 Path Traversal</name>
      <cvss_base>9.8</cvss_base>
      <refs>
        <ref type="cve" id="CVE-2021-41773"/>
      </refs>
    </nvt>
    <severity>9.8</severity>
    <qod><value>97</value></qod>
  </result>
  [...]
</report>`,outType:"muted"}]}),e.jsx("h2",{children:"Scan autenticado (descobre 3-10x mais)"}),e.jsx("p",{children:'Scan não-autenticado vê o alvo "de fora". Scan autenticado faz login (SSH/SMB) e examina o sistema por dentro: pacotes instalados, patches faltantes, configs inseguras, permissões erradas. Detecta MUITO mais.'}),e.jsx(a,{path:"~",lines:[{comment:"criar credencial SSH em Configuration → Credentials → ⊕",cmd:"(via UI ou via CLI):",out:`Name:        ssh-ana-prod
Type:        Username + Password   (ou Username + SSH Key)
Username:    ana.silva
Password:    AnaPent@2026!
Auto-generate: ☐  (não — você está informando manualmente)`,outType:"default"},{comment:"associar credencial ao Target (editar Target → SSH Credential dropdown)",cmd:"(no Target 'Servidores Lab Empresa'):",out:`Credentials for authenticated checks
  SSH:        ▼ ssh-ana-prod   on port: 22
  SMB:        ▼ smb-admin-empresa
  ESXi:       —
  SNMP v3:    —`,outType:"info"},{comment:"depois do scan rodar, comparar contagem",cmd:"echo 'antes (não-auth) vs depois (auth):'",out:`192.168.50.10 (web01-debian12):
  Não-autenticado:   8 findings   (3 high, 5 medium)
  Autenticado:      47 findings   (1 critical, 12 high, 18 med, 16 low)
                                  └─ pacotes desatualizados:
                                     openssl 3.0.2 → 3.0.13 (CVE-2024-0727)
                                     curl 7.81 → 8.4 (CVE-2023-38545)
                                     sudo 1.9.9 → 1.9.15 (CVE-2023-22809)
                                     [...]`,outType:"warning"}]}),e.jsx("h2",{children:"gvm-cli — automação total via XML/GMP"}),e.jsx(a,{path:"~",lines:[{cmd:"gvm-cli --help",out:`usage: gvm-cli [-h] [-c CONFIG] [--log [LEVEL]]
               [--timeout TIMEOUT] [--gmp-username USERNAME]
               [--gmp-password PASSWORD] [-V]
               CONNECTION_TYPE ...

Connection types:
  socket    UNIX Socket (local — /run/gvmd/gvmd.sock)
  ssh       SSH                                       
  tls       TLS                                       `,outType:"default"},{comment:"listar todos targets",cmd:"gvm-cli socket --gmp-username admin --gmp-password '...' --xml '<get_targets/>' | xmllint --format -",out:`<get_targets_response>
  <target id="b1c2d3e4-...">
    <name>Servidores Lab Empresa</name>
    <hosts>192.168.50.10,192.168.50.20,192.168.50.30</hosts>
    <max_hosts>3</max_hosts>
  </target>
  <target id="f4e5d6c7-...">
    <name>DMZ Externa</name>
    <hosts>203.0.113.0/28</hosts>
    <max_hosts>16</max_hosts>
  </target>
</get_targets_response>`,outType:"info"},{comment:"criar Target via XML (script-friendly)",cmd:`gvm-cli socket --xml '<create_target><name>Subnet RH</name><hosts>192.168.51.0/24</hosts><port_list id="4a4717fe-57d2-11e1-9a26-406186ea4fc5"/></create_target>'`,out:`<create_target_response status="201" status_text="OK, resource created"
                       id="9b81f2a3-bc12-4dc1-8b3a-22e1f6c8a01d"/>`,outType:"success"},{comment:"iniciar uma task pelo ID",cmd:`gvm-cli socket --xml '<start_task task_id="7c1b2a8f-..."/>'`,out:'<start_task_response status="202" status_text="OK, request submitted"/>',outType:"success"},{comment:"stop / pause / resume",cmd:`gvm-cli socket --xml '<stop_task task_id="7c1b2a8f-..."/>'`,out:'<stop_task_response status="202" status_text="OK"/>',outType:"muted"}]}),e.jsx("h2",{children:"Scripts de automação (gvm-script)"}),e.jsx(n,{language:"python",title:"~/scans/weekly-scan.py — automação completa",code:`#!/usr/bin/env python3
"""
Roda toda segunda às 02:00 via cron:
  - Cria scan na subnet 192.168.50.0/24
  - Aguarda concluir
  - Exporta relatório PDF
  - Manda por e-mail para o time de segurança
"""
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
from datetime import datetime
import smtplib, time, base64

USERNAME = "admin"
PASSWORD = "Kali@OpenVAS2026!"
SUBNET   = "192.168.50.0/24"
EMAIL_TO = "soc@empresa.com.br"

PORT_LIST_ID    = "4a4717fe-57d2-11e1-9a26-406186ea4fc5"  # All IANA TCP
SCAN_CONFIG_ID  = "daba56c8-73ec-11df-a475-002264764cea"  # Full and fast
SCANNER_ID      = "08b69003-5fc2-4037-a479-93b440211c73"  # OpenVAS Default
PDF_FORMAT_ID   = "910200ca-dc05-11e1-954f-406186ea4fc5"

with Gmp(connection=UnixSocketConnection(), transform=EtreeTransform()) as gmp:
    gmp.authenticate(USERNAME, PASSWORD)

    target_name = f"Auto-{datetime.now():%Y-%m-%d}"
    t = gmp.create_target(name=target_name, hosts=[SUBNET], port_list_id=PORT_LIST_ID)
    target_id = t.get("id")

    task = gmp.create_task(
        name=f"Weekly {target_name}",
        config_id=SCAN_CONFIG_ID,
        target_id=target_id,
        scanner_id=SCANNER_ID,
    )
    task_id = task.get("id")
    gmp.start_task(task_id)

    while True:
        s = gmp.get_task(task_id).find(".//status").text
        if s == "Done": break
        print(f"[*] status: {s}")
        time.sleep(60)

    report_id = gmp.get_task(task_id).find(".//last_report/report").get("id")
    report = gmp.get_report(report_id, report_format_id=PDF_FORMAT_ID)
    pdf_b64 = report.find(".//report").text
    open("/tmp/scan.pdf", "wb").write(base64.b64decode(pdf_b64))
    print("[+] PDF salvo em /tmp/scan.pdf — enviar por e-mail")
`}),e.jsx("h2",{children:"OpenVAS vs Nessus vs Qualys"}),e.jsx(s,{title:"Comparação rápida (use o que cabe no orçamento e escopo)",variations:[{cmd:"OpenVAS / GVM",desc:"Open-source, Greenbone Community Feed grátis. Self-hosted.",output:"Custo: R$0 (CE) / pago (Enterprise Feed). NVTs: ~88k. UI lenta. Rico em CLI."},{cmd:"Nessus Professional",desc:"Tenable. ~3.500 USD/ano por scanner. Padrão do mercado corporativo.",output:"+200k plugins, UI excelente, suporte 24/7. Limitação 1 scanner por licença."},{cmd:"Nessus Essentials",desc:"Free, limitado a 16 IPs. Bom para estudo/lab caseiro.",output:"Mesmo motor do Pro, sem compliance e sem agendamento."},{cmd:"Qualys VMDR",desc:"Cloud-only. Caríssimo. Padrão em Fortune 500.",output:"Agentes leves nos hosts, dashboard executivo, integração SIEM."},{cmd:"Rapid7 InsightVM",desc:"Antigo Nexpose. Cloud + on-prem. Bom Asset Management.",output:"Integração nativa com Metasploit (também Rapid7)."},{cmd:"Nuclei",desc:"Open-source moderno (templates YAML). Rápido, focado em web.",output:"Não substitui OpenVAS para infra/SO, mas complementar excelente."}]}),e.jsx(o,{type:"info",title:"Quando usar OpenVAS na vida real",children:e.jsxs("ul",{className:"list-disc pl-5 space-y-1",children:[e.jsx("li",{children:"Empresa pequena/média sem orçamento para Nessus/Qualys."}),e.jsx("li",{children:"Pentest interno onde o cliente quer baseline antes do trabalho manual."}),e.jsx("li",{children:"Auditoria periódica de compliance (PCI-DSS exige scan trimestral)."}),e.jsx("li",{children:"Lab pessoal e estudo — feed grátis tem 90% das CVEs do Nessus."}),e.jsx("li",{children:"Como complemento ao Nessus em ambientes onde quer 2 fontes de verdade."})]})}),e.jsx("h2",{children:"Troubleshooting comum"}),e.jsx(s,{title:"Erros típicos e como resolver",variations:[{cmd:"gsad não abre na 9392",desc:"Provavelmente gvmd ainda carregando NVTs (1ª inicialização demora).",output:"sudo journalctl -u gvmd -f → aguardar 'Loaded NVTs'."},{cmd:"Login falha com a senha gerada",desc:"Senha contém caracteres que o shell interpretou no setup.",output:"sudo gvmd --user=admin --new-password='NovaSenha123!'."},{cmd:"Scan trava em 1%",desc:"ospd-openvas não está rodando ou socket errado.",output:"sudo systemctl restart ospd-openvas gvmd && sudo gvm-check-setup."},{cmd:"Feeds desatualizados (NVTs antigos)",desc:"greenbone-feed-sync não rodou ou rate-limited.",output:"sudo greenbone-feed-sync --type GVMD_DATA && sleep 60 && SCAP && CERT."},{cmd:"Erro 'No such scanner OpenVAS Default'",desc:"ospd-openvas socket não foi registrado em gvmd.",output:"sudo gvmd --modify-scanner=$ID --scanner-host=/run/ospd/ospd-openvas.sock."},{cmd:"Scan derruba serviço (timeout no banco)",desc:"Full and fast ultimate em produção sem janela.",output:"Mude para Full and fast (sem ultimate). Reduza max concurrent NVTs."},{cmd:"PostgreSQL não inicia",desc:"Port 5432 ocupada ou cluster corrompido.",output:"sudo pg_lsclusters && sudo systemctl restart postgresql."}]}),e.jsx("h2",{children:"Parar / reiniciar serviços"}),e.jsx(a,{path:"~",lines:[{cmd:"sudo gvm-stop",out:`[*] Stopping gsad             [ OK ]
[*] Stopping gvmd             [ OK ]
[*] Stopping ospd-openvas     [ OK ]`,outType:"muted"},{cmd:"sudo gvm-start",out:`[*] Starting ospd-openvas     [ OK ]
[*] Starting gvmd             [ OK ]
[*] Starting gsad             [ OK ]
[>] Web UI: https://127.0.0.1:9392`,outType:"success"},{cmd:"sudo systemctl status gvmd ospd-openvas gsad --no-pager | head -30",out:`● gvmd.service - Greenbone Vulnerability Manager daemon (gvmd)
     Loaded: loaded (/lib/systemd/system/gvmd.service; enabled)
     Active: active (running) since Thu 2026-04-04 14:21:08 -03; 1h 42min ago

● ospd-openvas.service - OSPd Wrapper for OpenVAS
     Active: active (running) since Thu 2026-04-04 14:21:05 -03; 1h 42min ago

● gsad.service - Greenbone Security Assistant daemon (gsad)
     Active: active (running) since Thu 2026-04-04 14:21:11 -03; 1h 42min ago`,outType:"info"}]}),e.jsx(i,{title:"Lab: scan completo + relatório PDF de uma VM Metasploitable",goal:"Subir Metasploitable 2 (vulnerável de propósito), criar Target+Task no OpenVAS, executar Full and fast e exportar PDF.",steps:["Baixe Metasploitable 2 (sourceforge) e suba no VirtualBox em rede host-only (192.168.56.0/24).","No Kali, garanta GVM rodando (sudo gvm-start) e UI em https://127.0.0.1:9392.","Configuration → Targets → ⊕ → Hosts: 192.168.56.101, Port List: All IANA TCP, Alive: Consider Alive.","Scans → Tasks → ⊕ → Target acima, Scan Config: Full and fast.","Clique ▶ (Start). Aguarde ~20-30 minutos.","Quando terminar, clique no Report e exporte como PDF.","Conte quantos Critical/High/Medium apareceram."],command:`# 1) garantir que o GVM está de pé
sudo gvm-start
ss -lntp | grep 9392

# 2) verificar acesso à VM Metasploitable
ping -c 2 192.168.56.101
nmap -Pn -p- --top-ports 100 192.168.56.101 | head

# 3) criar Target via CLI (alternativa à UI)
gvm-cli --gmp-username admin --gmp-password 'Kali@OpenVAS2026!' socket --xml \\
  '<create_target>
    <name>Lab-Metasploitable</name>
    <hosts>192.168.56.101</hosts>
    <port_list id="4a4717fe-57d2-11e1-9a26-406186ea4fc5"/>
    <alive_tests>Consider Alive</alive_tests>
   </create_target>'

# 4) criar Task (Full and fast = daba56c8-73ec-11df-a475-002264764cea)
gvm-cli ... --xml '<create_task>
    <name>Scan Metasploitable</name>
    <config id="daba56c8-73ec-11df-a475-002264764cea"/>
    <target id="UUID_DO_TARGET_ACIMA"/>
    <scanner id="08b69003-5fc2-4037-a479-93b440211c73"/>
   </create_task>'

# 5) iniciar e acompanhar
gvm-cli ... --xml '<start_task task_id="UUID_DA_TASK"/>'
watch -n 30 "gvm-cli ... --xml '<get_tasks task_id=\\"UUID\\"/>' | grep -i progress"`,expected:`Scan finalizado em ~25 min.
Achados típicos no Metasploitable 2:

  Critical (10.0)  vsftpd 2.3.4 backdoor (CVE-2011-2523)
  Critical (10.0)  UnrealIRCd 3.2.8.1 backdoor
  Critical  (9.8)  Samba usermap_script RCE (CVE-2007-2447)
  High      (9.0)  distcc daemon CVE-2004-2687
  High      (8.5)  PHP CGI argument injection (CVE-2012-1823)
  High      (7.5)  rlogin/rsh sem autenticação
  Medium    (5.0)  TLS 1.0/SSLv3 habilitados
  Low       (3.0)  Banner com versões expostas
  [...] ~50 findings totais`,verify:"Exporte como PDF (format_id=910200ca-dc05-11e1-954f-406186ea4fc5) e abra: deve ter capa, sumário e seções por host. CTF: tente explorar o vsftpd 2.3.4 com Metasploit (use exploit/unix/ftp/vsftpd_234_backdoor) — o OpenVAS já te entregou o CVE."}),e.jsxs(o,{type:"success",title:"Próximos passos",children:["Depois de dominar OpenVAS, integre os reports XML no ",e.jsx("strong",{children:"DefectDojo"})," ou"," ",e.jsx("strong",{children:"Faraday"})," para gestão de vulnerabilidades em escala. Para web especificamente, complemente com ",e.jsx("strong",{children:"Nuclei"})," e ",e.jsx("strong",{children:"ZAP"})," (a próxima página). Em ambientes Windows, considere ",e.jsx("strong",{children:"Nessus"})," ou ",e.jsx("strong",{children:"Qualys"})," que detectam mais CVEs específicas de produtos Microsoft."]})]})}export{v as default};
