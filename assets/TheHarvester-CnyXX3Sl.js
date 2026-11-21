import{j as e}from"./index-Bd5otbF3.js";import{P as a}from"./PageContainer-BFcnvssG.js";import{A as s}from"./AlertBox-CL6YULjX.js";import{C as r}from"./CommandTable-BxJEHhQ9.js";import{T as o,P as t}from"./PracticeBox-Pst8IaIf.js";function u(){return e.jsxs(a,{title:"theHarvester — emails, hosts e subdomínios",subtitle:"Coleta passiva (e ativa) de informação de funcionários a partir de search engines, PGP, certificados e redes sociais.",difficulty:"iniciante",timeToRead:"10 min",children:[e.jsx("h2",{children:"Setup"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo apt install -y theharvester",out:"(já vem no kali-tools-information-gathering)",outType:"muted"},{cmd:"theHarvester -h | head -20",out:`theHarvester 4.6.0
Coded by Christian Martorella
Edge-Security Research
cmartorella@edge-security.com

usage: theHarvester [-h] -d DOMAIN [-l LIMIT] [-S START] [-p] [-s] [--screenshot SCREENSHOT]
                    [-v] [-e DNS_SERVER] [-t] [-r [DNS_RESOLVE]] [-n] [-c] [-f FILENAME]
                    [-b SOURCE]`,outType:"info"}]}),e.jsx("h2",{children:"Primeira coleta"}),e.jsx(o,{path:"~",lines:[{cmd:"theHarvester -d kali.org -b duckduckgo,bing,crtsh,certspotter -l 500",out:`*******************************************************************
*  _   _                                            _             *
* | |_| |__   ___    /\\  /\\__ _ _ ____   _____  ___| |_ ___ _ __  *
* | __| '_ \\ / _ \\  / /_/ / _\` | '__\\ \\ / / _ \\/ __| __/ _ \\ '__| *
* | |_| | | |  __/ / __  / (_| | |   \\ V /  __/\\__ \\ ||  __/ |    *
*  \\__|_| |_|\\___| \\/ /_/ \\__,_|_|    \\_/ \\___||___/\\__\\___|_|    *
*                                                                 *
* theHarvester 4.6.0                                              *
* Coded by Christian Martorella                                   *
*                                                                 *
*******************************************************************

[*] Target: kali.org

[*] Searching DuckDuckGo.
[*] Searching Bing.
[*] Searching crtsh.
[*] Searching certspotter.

[*] ASNs found: 1
--------------------
AS40695

[*] Hosts found: 18
---------------------
bugs.kali.org:192.124.249.10
docs.kali.org:104.21.50.71
forums.kali.org:104.21.50.71
http.kali.org:104.21.50.71
kali.org:192.124.249.10
mirror.kali.org:104.21.50.71
old.kali.org:104.21.50.71
www.kali.org:192.124.249.10

[*] Emails found: 4
---------------------
contact@kali.org
devel@kali.org
forums@kali.org
press@kali.org`,outType:"success"}]}),e.jsx("h2",{children:"Sources disponíveis"}),e.jsx(r,{title:"Principais -b sources (passivos = sem tocar no alvo)",variations:[{cmd:"anubis",desc:"API anubisdb (subdomínios).",output:"Sem chave necessária."},{cmd:"bing",desc:"Microsoft Bing search.",output:"Pode precisar API key."},{cmd:"bingapi",desc:"Bing Search API (paid).",output:"Configurar em api-keys.yaml."},{cmd:"censys",desc:"Hosts/certificados pelo Censys.io.",output:"Pede API key (free tier ok)."},{cmd:"crtsh",desc:"Certificate Transparency (crt.sh).",output:"Não pede chave. ESSENCIAL."},{cmd:"duckduckgo",desc:"Busca DDG.",output:"Sem chave."},{cmd:"github-code",desc:"Procura email/hosts em código GitHub.",output:"Pede token GitHub."},{cmd:"hackertarget",desc:"DNS, recon via API hackertarget.",output:"Free tier limitado."},{cmd:"hunter",desc:"hunter.io (emails de funcionários).",output:"Pede API key."},{cmd:"intelx",desc:"intelx.io (leaks).",output:"Pede API key."},{cmd:"shodan",desc:"Hosts pelo Shodan.",output:"Pede API key."},{cmd:"subdomainfinderc99",desc:"API c99.nl (subdomínios).",output:"Pede API key."},{cmd:"all",desc:"Roda TUDO de uma vez.",output:"Pode demorar 5-15 min."}]}),e.jsx("h2",{children:"Configurando API keys"}),e.jsx(o,{path:"~",lines:[{cmd:"ls /etc/theHarvester/api-keys.yaml 2>/dev/null || ls ~/.theHarvester/api-keys.yaml",out:"/etc/theHarvester/api-keys.yaml",outType:"default"},{cmd:"sudo nano /etc/theHarvester/api-keys.yaml",out:"(abre editor, adicione suas chaves)",outType:"muted"}]}),e.jsx(o,{path:"~",lines:[{cmd:"cat /etc/theHarvester/api-keys.yaml",out:`apikeys:
  bing:
    key:
  censys:
    id: c4f7e2a1-...
    secret: zXk2Lm9P...
  github:
    key: ghp_xXxXxXxXxXxXxXxXxXxXxX
  hunter:
    key: 0a1b2c3d4e5f...
  shodan:
    key: ABCDxyz123...`,outType:"info"}]}),e.jsx("h2",{children:"Gerar relatório (HTML/JSON)"}),e.jsx(o,{path:"~",lines:[{cmd:"theHarvester -d empresa.com -b all -l 1000 -f relatorio_empresa",out:`[*] Searching anubis.
[*] Searching bing.
[*] Searching censys.
[*] Searching crtsh.
[*] Searching duckduckgo.
[*] Searching hackertarget.
[*] Searching shodan.
[*] Searching wayback.
[...]
[*] Reporting started.
[*] Saving JSON output to: relatorio_empresa.json
[*] Saving XML output to: relatorio_empresa.xml`,outType:"success"},{cmd:"ls relatorio_empresa.*",out:"relatorio_empresa.json    relatorio_empresa.xml",outType:"default"},{comment:"extrair só emails do JSON com jq",cmd:"jq -r '.emails[]' relatorio_empresa.json | sort -u",out:`admin@empresa.com
ana.silva@empresa.com
contato@empresa.com
joao.dev@empresa.com
maria.ti@empresa.com
suporte@empresa.com`,outType:"info"}]}),e.jsx("h2",{children:"Resolver IP de cada host encontrado"}),e.jsx(o,{path:"~",lines:[{cmd:"theHarvester -d empresa.com -b crtsh -l 500 -r",out:`[*] Searching crtsh.

[*] IPs found: 3
-----------------
200.150.10.42
200.150.10.45
200.150.10.50

[*] Hosts found: 12
---------------------
api.empresa.com:200.150.10.45
mail.empresa.com:200.150.10.42
vpn.empresa.com:200.150.10.50
www.empresa.com:200.150.10.42
[...]`,outType:"info"}]}),e.jsx("h2",{children:"DNS brute force (ativo)"}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"-c"})," roda DNS brute force ATIVO (consultas DNS contra os NS do alvo). Já é coleta ativa, mas como passa por DNS é discreta."]}),e.jsx(o,{path:"~",lines:[{cmd:"theHarvester -d empresa.com -b crtsh -c -l 500",out:`[*] Performing DNS brute force.

[*] Hosts found after DNS brute force:
---------------------------------------
admin.empresa.com:200.150.10.42
api.empresa.com:200.150.10.45
backup.empresa.com:200.150.10.51
beta.empresa.com:200.150.10.49
cdn.empresa.com:200.150.10.42
dev.empresa.com:200.150.10.99
git.empresa.com:200.150.10.99
homolog.empresa.com:200.150.10.99
internal.empresa.com:10.10.10.5
jira.empresa.com:200.150.10.99
m.empresa.com:200.150.10.42
old.empresa.com:200.150.10.42
staging.empresa.com:200.150.10.99
vpn.empresa.com:200.150.10.50`,outType:"warning"}]}),e.jsx("h2",{children:"Combinando com outras ferramentas"}),e.jsx(o,{path:"~",lines:[{comment:"1) coleta passiva → emails",cmd:"theHarvester -d empresa.com -b crtsh,duckduckgo -l 500 -f harvest && jq -r '.emails[]' harvest.json > emails.txt",out:"(silencioso. emails.txt agora tem N emails)",outType:"muted"},{comment:"2) checar quais emails caíram em leaks",cmd:"for e in $(cat emails.txt); do h8mail -t $e --no-color 2>/dev/null | grep -E '\\[\\+\\]'; done",out:`[+] HIBP — joao.dev@empresa.com — 3 breaches (Canva, LinkedIn, Adobe)
[+] HIBP — maria.ti@empresa.com — 1 breach (DailyQuiz)
[+] HIBP — admin@empresa.com — 7 breaches`,outType:"error"},{comment:"3) hosts → input para nmap",cmd:`jq -r '.hosts[] | split(":")[0]' harvest.json | sort -u > hosts.txt && nmap -iL hosts.txt -sV --top-ports 100 -oA scan`,out:"(roda scan em todos os hosts encontrados)",outType:"info"}]}),e.jsx(t,{title:"Coleta OSINT completa (passiva)",goal:"A partir de um domínio, gerar uma lista de emails + subdomínios + IPs sem tocar no alvo.",steps:["Rode theHarvester com sources passivos: crtsh, certspotter, duckduckgo, anubis.","Salve em JSON.","Extraia emails, hosts e IPs separadamente com jq.","Gere um arquivo .csv para anexar no report."],command:`DOMAIN="kali.org"
theHarvester -d $DOMAIN -b crtsh,certspotter,duckduckgo,anubis -l 500 -f osint_$DOMAIN

echo "===== EMAILS ====="
jq -r '.emails[]' osint_$DOMAIN.json | sort -u

echo "===== HOSTS ====="
jq -r '.hosts[]' osint_$DOMAIN.json | sort -u

echo "===== IPS ====="
jq -r '.ips[]' osint_$DOMAIN.json | sort -u`,expected:`===== EMAILS =====
contact@kali.org
devel@kali.org
forums@kali.org
press@kali.org

===== HOSTS =====
bugs.kali.org:192.124.249.10
docs.kali.org:104.21.50.71
[...]
===== IPS =====
104.21.50.71
192.124.249.10`,verify:"O JSON deve ter campos .emails, .hosts e .ips populados (não vazios) para um domínio com presença pública."}),e.jsxs(s,{type:"info",title:"Quanto mais sources, mais completo (e lento)",children:["Coleta com ",e.jsx("code",{children:"-b all"})," pode demorar 10+ minutos e bater em rate-limit de várias APIs. Para reconhecimento rápido use ",e.jsx("code",{children:"crtsh,duckduckgo,anubis"})," ","— funciona sem API key e cobre 80% do que você quer ver."]})]})}export{u as default};
