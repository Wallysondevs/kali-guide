import{j as e}from"./index-Bd5otbF3.js";import{P as t}from"./PageContainer-BFcnvssG.js";import{A as r}from"./AlertBox-CL6YULjX.js";import{C as o}from"./CommandTable-BxJEHhQ9.js";import{O as s}from"./OutputBlock-Bcu7q20v.js";import{T as a,P as i}from"./PracticeBox-Pst8IaIf.js";function p(){return e.jsxs(t,{title:"Maltego — visualização gráfica de OSINT",subtitle:"GUI de investigação que liga entidades (pessoas, domínios, emails, IPs) por transformações.",difficulty:"intermediario",timeToRead:"11 min",children:[e.jsx("h2",{children:"Conceitos"}),e.jsx("p",{children:"Maltego trabalha com 3 pilares:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Entidade"}),": nó do grafo (Domínio, Pessoa, Email, IP, URL, Empresa, etc.)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transformação"}),": função que recebe uma entidade e devolve novas (ex: Domain → Subdomains)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hub"}),": pacote de transformações (Maltego CE, PassiveTotal, Shodan, Have I Been Pwned, VirusTotal)."]})]}),e.jsx("h2",{children:"Setup"}),e.jsx(a,{path:"~",lines:[{cmd:"sudo apt install -y maltego",out:"(já vem no kali-tools-information-gathering)",outType:"muted"},{cmd:"maltego &",out:"(abre a interface gráfica)",outType:"info"}]}),e.jsx("p",{children:"No primeiro start o Maltego pede um cadastro gratuito no site da Maltego (Community Edition, CE). Depois você seleciona transformations Hub items para instalar."}),e.jsx("h2",{children:"Hub items recomendados (CE = grátis)"}),e.jsx(o,{title:"Pacotes de transformações úteis",variations:[{cmd:"Maltego Standard Transforms",desc:"Pacote básico (DNS, WHOIS, certificate, etc.).",output:"Pré-instalado em CE."},{cmd:"Have I Been Pwned (Public)",desc:"Email → Breaches.",output:"Sem chave (CE)."},{cmd:"PassiveTotal (free tier)",desc:"DNS histórico, WHOIS histórico, certificados.",output:"Pede API key gratuita."},{cmd:"Shodan (CE)",desc:"IP → Portas/Banners.",output:"Pede chave Shodan."},{cmd:"VirusTotal (Public API)",desc:"Domain/URL/Hash → reputação.",output:"Pede chave VT."},{cmd:"ATT&CK MISP",desc:"Indicadores → técnicas MITRE ATT&CK.",output:"Para Threat Intel."},{cmd:"Censys",desc:"IP/Hostname → Censys data.",output:"Pede chave Censys."},{cmd:"Hunchly",desc:"Captura web durante investigação.",output:"Para CSI/forense."}]}),e.jsx("h2",{children:"Workflow visual típico"}),e.jsx(s,{label:"grafo de investigação típico (Maltego)",type:"muted",children:`         ┌─── Domain: empresa.com ───┐
         │                            │
   Domain → Subdomains          Domain → MX
         │                            │
   ├─ www.empresa.com            mail.empresa.com
   ├─ api.empresa.com                  │
   ├─ vpn.empresa.com            DNS A → 200.150.10.45
   └─ ──────                            │
        │                          IP → Shodan ports
        │                                │
   DNS A → 200.150.10.42            22, 25, 587, 993
        │                                │
   IP → ASN/Whois                  Banner → Postfix 3.7
        │
   AS27699 (Telefonica BR)
        │
   ASN → All Netblocks
        │
   200.150.0.0/16, 200.151.0.0/22, ...

         ┌─── Email: ana@empresa.com ───┐
   Email → HIBP Breaches
         │
   ├─ Canva (2019)
   ├─ LinkedIn (2020)
   └─ MyFitnessPal (2018)`}),e.jsx("h2",{children:"Transformações mais usadas"}),e.jsx(o,{title:"Transformações que valem decorar",variations:[{cmd:"Domain → To DNS Name",desc:"MX, NS, SOA, CNAME.",output:"Vai puxando registros."},{cmd:"Domain → To Subdomains [crtsh]",desc:"Subs via Certificate Transparency.",output:"Mais completo + offline-friendly."},{cmd:"DNS Name → To IP Address",desc:"Resolve hostname.",output:"Resultado vira nova entidade IP."},{cmd:"IP → To Netblock [whois]",desc:"Bloco e empresa donos do IP.",output:"Identifica cloud/colo/ISP."},{cmd:"Netblock → To Domains [Reverse DNS]",desc:"Quais hosts no bloco.",output:"Mapeia patrimônio inteiro."},{cmd:"Email → To Breaches [HIBP]",desc:"Em quais leaks o email apareceu.",output:"Mostra breaches + datas."},{cmd:"Email → To Domains",desc:"Outros domínios usando o mesmo MX.",output:"Achar empresas relacionadas."},{cmd:"Person → To Email Addresses",desc:"Tenta combinar nomes em emails.",output:"padrao first.last@dominio.com"},{cmd:"Image → Get Metadata",desc:"EXIF (GPS, modelo).",output:"Combina com OSINT visual."},{cmd:"Phrase → Search [search engines]",desc:"Pesquisa string.",output:"Inicia investigação ampla."}]}),e.jsx("h2",{children:"maltego-trx (transformações custom em Python)"}),e.jsx(a,{path:"~",lines:[{cmd:"pip install maltego-trx",out:"Successfully installed maltego-trx-1.6.0",outType:"muted"},{cmd:"maltego-trx start projeto-acme",out:`[*] Created Maltego TRX project at projeto-acme/
[*] Files:
    projeto-acme/
    ├── project.py
    ├── server.py
    ├── transforms/
    │   └── GreetPerson.py
    └── requirements.txt`,outType:"success"},{cmd:"cat projeto-acme/transforms/GreetPerson.py",out:`from maltego_trx.entities import Phrase
from maltego_trx.transform import DiscoverableTransform

class GreetPerson(DiscoverableTransform):
    @classmethod
    def create_entities(cls, request, response):
        person_name = request.Value
        response.addEntity(Phrase, f"Hello {person_name}!")`,outType:"info"}]}),e.jsx("h3",{children:"Transformação custom: domínio → emails de OSINT"}),e.jsx(s,{label:"transforms/DomainToEmails.py",type:"default",children:`from maltego_trx.entities import EmailAddress
from maltego_trx.transform import DiscoverableTransform
import requests

class DomainToEmails(DiscoverableTransform):
    @classmethod
    def create_entities(cls, request, response):
        domain = request.Value
        # Exemplo: hunter.io API
        url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key=SUA_CHAVE"
        try:
            r = requests.get(url, timeout=10).json()
            for e in r.get("data", {}).get("emails", []):
                ent = response.addEntity(EmailAddress, e["value"])
                ent.addProperty("source", "hunter.io")
                ent.addProperty("confidence", str(e.get("confidence", 0)))
        except Exception as ex:
            response.addUIMessage(f"Erro: {ex}")`}),e.jsx(a,{path:"~/projeto-acme",lines:[{cmd:"python3 project.py runserver",out:`[*] Maltego TRX server running on http://0.0.0.0:8080
[*] Endpoints:
    /run/DomainToEmails
    /run/GreetPerson`,outType:"info"}]}),e.jsxs("p",{children:["Depois você importa esse servidor local como um ",e.jsx("strong",{children:"iTDS (internal Transform Distribution Server)"}),"no Maltego (Settings → Transform Hub → Add iTDS). Suas transformations aparecem ao lado das oficiais."]}),e.jsx("h2",{children:"Casebook (relatório nativo)"}),e.jsxs("p",{children:["Maltego permite exportar o grafo + notas em Casebook (formato proprietário, abre no próprio Maltego) ou em PDF/PNG/JSON via ",e.jsx("strong",{children:"Investigate → Generate Report"}),"."]}),e.jsx(o,{title:"Formatos de export",variations:[{cmd:".mtgx",desc:"Grafo nativo Maltego (compactado).",output:"Para abrir em outro Maltego."},{cmd:".mtgl",desc:"Casebook (grafo + linha do tempo + notas).",output:"Para casos de longa duração."},{cmd:".png / .pdf",desc:"Exporta o grafo como imagem.",output:"Para report final."},{cmd:".csv",desc:"Tabela de entidades com properties.",output:"Para análise externa."},{cmd:".json",desc:"Schema completo da investigação.",output:"Útil para automação."}]}),e.jsx(i,{title:"Investigação visual de empresa fictícia",goal:"Construir o grafo de relacionamento entre o domínio raiz, subs, IPs, ASN e emails.",steps:["Abra Maltego CE → New Graph (Ctrl+T).","Arraste a entidade 'Domain' e digite empresa.com.","Botão direito → All Transforms → To Subdomains [crtsh].","Selecione todos os subdomínios → All Transforms → Resolve to IP Address.","Selecione os IPs → All Transforms → To Netblock [whois].","Adicione uma entidade Email manual e rode To Breaches [HIBP]."],command:`# Ações são GUI, mas você pode preparar os dados em CLI:
DOMAIN="empresa.com"
curl -s "https://crt.sh/?q=%25.$DOMAIN&output=json" | jq -r '.[].name_value' | sort -u > subs.txt
cat subs.txt | dnsx -silent -a -resp > ips.txt

# No Maltego, importe ips.txt como entidades IPv4Address (drag & drop).`,expected:`(você acaba com um grafo com ~20 nós ligados:
   1 Domain  →  N Subdomains  →  M IPv4Address  →  K Netblock/AS)`,verify:"Cada vez que você arrasta o transformation 'To Netblock' o nó IP ganha um pai com o ASN/empresa — útil para identificar concentração em uma cloud."}),e.jsxs(r,{type:"info",title:"Maltego brilha em correlação humana",children:["Se você só quer dados, ferramentas CLI (subfinder + amass + dnsx) são mais rápidas. Maltego ganha quando a investigação envolve ",e.jsx("strong",{children:"pessoas, empresas, redes sociais"})," ","— visualizar quem está conectado a quem é o diferencial."]})]})}export{p as default};
