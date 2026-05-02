import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Dnsenum() {
  return (
    <PageContainer
      title="DNS Enumeration — dnsenum, dnsrecon, dig"
      subtitle="Descubra zone transfer, subdomínios, MX, SPF, NS e infra DNS do alvo."
      difficulty="iniciante"
      timeToRead="12 min"
      prompt="recon/dns"
    >
      <h2>Por que enumerar DNS</h2>
      <p>
        DNS é a camada de roteamento da internet. Cada subdomínio é uma porta de entrada
        em potencial. Enumerar DNS revela ambientes de homologação (<code>dev.</code>,{" "}
        <code>staging.</code>, <code>old.</code>), serviços internos esquecidos, mail relay,
        VPNs e arquitetura de cloud.
      </p>

      <h2>dig — registro a registro</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "dig kali.org +short",
            out: `192.124.249.10`,
            outType: "info",
          },
          {
            cmd: "dig kali.org NS +short",
            out: `apollo.ns.cloudflare.com.
britney.ns.cloudflare.com.`,
            outType: "default",
          },
          {
            cmd: "dig kali.org MX +short",
            out: `10 mail.kali.org.`,
            outType: "default",
          },
          {
            cmd: "dig kali.org TXT +short",
            out: `"v=spf1 include:_spf.google.com ~all"
"google-site-verification=Z9...x4"
"MS=ms12345678"`,
            outType: "default",
          },
          {
            cmd: "dig kali.org CAA +short",
            out: `0 issue \"letsencrypt.org\"
0 issue \"digicert.com\"
0 iodef \"mailto:security@kali.org\"`,
            outType: "info",
          },
          {
            comment: "PTR (DNS reverso) — IP → nome",
            cmd: "dig -x 192.124.249.10 +short",
            out: "kali.org.",
            outType: "default",
          },
          {
            comment: "ANY de uma vez (alguns NS bloqueiam)",
            cmd: "dig kali.org ANY +noall +answer",
            out: `kali.org.    180   IN  A      192.124.249.10
kali.org.    300   IN  MX     10 mail.kali.org.
kali.org.    300   IN  NS     apollo.ns.cloudflare.com.
kali.org.    300   IN  NS     britney.ns.cloudflare.com.
kali.org.    300   IN  TXT    "v=spf1 include:_spf.google.com ~all"`,
            outType: "success",
          },
        ]}
      />

      <h2>Zone Transfer (AXFR) — o santo graal</h2>
      <p>
        Se um servidor DNS responder a uma transferência de zona não autorizada,
        ele entrega TODA a configuração DNS do domínio: cada subdomínio, IP,
        registro interno. Erro grave de configuração — felizmente raro hoje.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "dig axfr @ns1.zonetransfer.me zonetransfer.me",
            out: `; <<>> DiG 9.20.0-Debian <<>> axfr @ns1.zonetransfer.me zonetransfer.me
; (1 server found)
;; global options: +cmd
zonetransfer.me.   7200  IN   SOA    nsztm1.digi.ninja. robin.digi.ninja. 2019100801 172800 900 1209600 3600
zonetransfer.me.   7200  IN   NS     nsztm1.digi.ninja.
zonetransfer.me.   7200  IN   NS     nsztm2.digi.ninja.
zonetransfer.me.   7200  IN   A      5.196.105.14
zonetransfer.me.   7200  IN   MX     0 ASPMX.L.GOOGLE.COM.
zonetransfer.me.   7200  IN   MX     10 ALT1.ASPMX.L.GOOGLE.COM.
asfdbauthdns.zonetransfer.me. 7900  IN  AFSDB  1 asfdbbox.zonetransfer.me.
canberra-office.zonetransfer.me. 7200 IN A   202.14.81.230
dc-office.zonetransfer.me.    7200 IN  A      143.228.181.132
deadbeef.zonetransfer.me.     7201 IN  AAAA   dead:beaf::
dr.zonetransfer.me.           300  IN  LOC    53 20 56.558 N 1 38 33.526 W 0.00m 1m 10000m 10m
home.zonetransfer.me.         7200 IN  A      127.0.0.1
office.zonetransfer.me.       7200 IN  A      4.23.39.254
[...]
;; Query time: 142 msec
;; SERVER: nsztm1.digi.ninja#53(ns1.zonetransfer.me)
;; XFR size: 49 records (messages 1, bytes 1841)`,
            outType: "warning",
          },
          {
            comment: "domínios protegidos respondem assim",
            cmd: "dig axfr @apollo.ns.cloudflare.com kali.org",
            out: `; Transfer failed.`,
            outType: "muted",
          },
        ]}
      />

      <h2>dnsenum — tudo de uma vez</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "dnsenum kali.org",
            out: `dnsenum VERSION:1.3
-----   kali.org   -----

Host's addresses:
__________________
kali.org.                    180      IN    A    192.124.249.10

Name Servers:
______________
apollo.ns.cloudflare.com.    37892    IN    A    173.245.59.10
britney.ns.cloudflare.com.   37892    IN    A    108.162.193.10

Mail (MX) Servers:
___________________
mail.kali.org.               300      IN    A    192.124.249.10

Trying Zone Transfers and getting Bind Versions:
_________________________________________________
Trying Zone Transfer for kali.org on apollo.ns.cloudflare.com ...
AXFR record query failed: NOTAUTH

Brute forcing with /usr/share/dnsenum/dns.txt:
_______________________________________________
www.kali.org.       180   IN    A   192.124.249.10
docs.kali.org.      300   IN    A   104.21.50.71
forums.kali.org.    300   IN    A   104.21.50.71
bugs.kali.org.      300   IN    A   192.124.249.10
[...]

kali.org class C netranges:
___________________________
192.124.249.0/24

Performing reverse lookup on 256 ip addresses:
_______________________________________________
192.124.249.10.in-addr.arpa.   86400  IN  PTR  kali.org.

done.`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags úteis do dnsenum"
        variations={[
          { cmd: "-f wordlist.txt", desc: "Wordlist customizada para brute force.", output: "Sem -f usa /usr/share/dnsenum/dns.txt" },
          { cmd: "--threads 10", desc: "Paraleliza (default 5).", output: "Mais rápido em wordlists grandes." },
          { cmd: "-r", desc: "Recursivo: subdomínios de subdomínios.", output: "Cuidado: estoura cota DNS." },
          { cmd: "-o saida.xml", desc: "Salva XML.", output: "Bom para report." },
          { cmd: "-s 50", desc: "Pega N páginas do Google.", output: "Para descobrir subs adicionais." },
          { cmd: "--noreverse", desc: "Pula reverse DNS.", output: "Mais rápido." },
        ]}
      />

      <h2>dnsrecon — alternativa robusta</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "tipo std: NS, MX, SOA, A, AAAA, TXT, SRV",
            cmd: "dnsrecon -d kali.org -t std",
            out: `[*] std: Performing General Enumeration against: kali.org...
[*] DNSSEC is not configured for kali.org
[*]      SOA apollo.ns.cloudflare.com 173.245.59.10
[*]      NS apollo.ns.cloudflare.com 173.245.59.10
[*]      NS britney.ns.cloudflare.com 108.162.193.10
[*]      MX mail.kali.org 192.124.249.10
[*]      A kali.org 192.124.249.10
[*]      TXT kali.org "v=spf1 include:_spf.google.com ~all"
[*] Enumerating SRV Records
[+] 0 Records Found`,
            outType: "info",
          },
          {
            comment: "tipo brt: brute force de subdomínio",
            cmd: "dnsrecon -d kali.org -t brt -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt",
            out: `[*] Performing host and subdomain brute force against kali.org
[+]      A bugs.kali.org 192.124.249.10
[+]      A docs.kali.org 104.21.50.71
[+]      A forums.kali.org 104.21.50.71
[+]      A http.kali.org 104.21.50.71
[+]      A www.kali.org 192.124.249.10
[+]      A old.kali.org 104.21.50.71
[+]      A pkg.kali.org 104.21.50.71
[+] 7 Records Found`,
            outType: "success",
          },
          {
            comment: "tipo axfr: tenta transferência em todos os NS",
            cmd: "dnsrecon -d zonetransfer.me -t axfr",
            out: `[*] Testing NS Servers for Zone Transfer
[*]      Checking for Zone Transfer for zonetransfer.me name servers
[*]      Resolving SOA Record
[+]      SOA nsztm1.digi.ninja 81.4.108.41
[*]      Resolving NS Records
[*]      NS Servers found:
[*]            NS nsztm1.digi.ninja 81.4.108.41
[*]            NS nsztm2.digi.ninja 167.88.42.94
[*]      Removing any duplicate NS server IP Addresses
[*] 
[*]      Trying NS server 81.4.108.41
[+]      81.4.108.41 Has port 53 TCP Open
[+]      Zone Transfer was successful!!
[+]            NS nsztm1.digi.ninja 81.4.108.41
[+]            NS nsztm2.digi.ninja 167.88.42.94
[+]            MX 0 ASPMX.L.GOOGLE.COM 142.250.31.27
[+]            A zonetransfer.me 5.196.105.14
[+]            A canberra-office.zonetransfer.me 202.14.81.230
[+]            A dc-office.zonetransfer.me 143.228.181.132
[+]            A home.zonetransfer.me 127.0.0.1
[+]            A internal.zonetransfer.me 127.0.0.1
[+]            A office.zonetransfer.me 4.23.39.254
[+] 49 Records Found`,
            outType: "warning",
          },
        ]}
      />

      <h2>fierce — semi-clássico</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "fierce --domain kali.org --subdomain-file /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt",
            out: `NS: apollo.ns.cloudflare.com. britney.ns.cloudflare.com.
SOA: apollo.ns.cloudflare.com. (173.245.59.10)
Zone: failure
Wildcard: failure
Found: bugs.kali.org. (192.124.249.10)
Found: docs.kali.org. (104.21.50.71)
Found: forums.kali.org. (104.21.50.71)
Found: http.kali.org. (104.21.50.71)
Nearby:
  192.124.249.9: kali.docs.kali.org.
  192.124.249.11: mirror.kali.org.

Done with Fierce scan: https://github.com/mschwager/fierce
Found 4 entries.`,
            outType: "info",
          },
        ]}
      />

      <h2>Subfinder + Amass — o moderno</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "subfinder -d kali.org -all -silent | tee subs_passivos.txt",
            out: `kali.org
http.kali.org
docs.kali.org
forums.kali.org
www.kali.org
bugs.kali.org
gitlab.com.kali.org
old.kali.org
pkg.kali.org
mirror.kali.org`,
            outType: "default",
          },
          {
            comment: "amass passivo — 50+ fontes",
            cmd: "amass enum -passive -d kali.org -o subs_amass.txt && wc -l subs_amass.txt",
            out: "152 subs_amass.txt",
            outType: "success",
          },
          {
            comment: "validar quais REALMENTE resolvem",
            cmd: "cat subs_amass.txt | dnsx -silent -a -resp | head -10",
            out: `bugs.kali.org [192.124.249.10]
docs.kali.org [104.21.50.71]
forums.kali.org [104.21.50.71]
http.kali.org [104.21.50.71]
kali.org [192.124.249.10]
mirror.kali.org [104.21.50.71]
old.kali.org [104.21.50.71]
pkg.kali.org [104.21.50.71]
www.kali.org [192.124.249.10]`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Pipeline DNS completo"
        goal="A partir de um domínio, gerar uma lista de subdomínios verificados (vivos), prontos para httpx/nmap."
        steps={[
          "Coleta passiva com subfinder + amass.",
          "Combinar e deduplicar.",
          "Resolver com dnsx (só os vivos).",
          "Probar serviços HTTP com httpx.",
        ]}
        command={`DOMAIN="empresa.com"

subfinder -d $DOMAIN -all -silent > raw1.txt
amass enum -passive -d $DOMAIN -o raw2.txt 2>/dev/null

cat raw1.txt raw2.txt | sort -u > all_subs.txt
echo "Total único: $(wc -l < all_subs.txt)"

# Resolver
cat all_subs.txt | dnsx -silent -a -resp > vivos.txt
echo "Resolveram: $(wc -l < vivos.txt)"

# Quais respondem HTTP?
cat all_subs.txt | httpx -silent -title -tech-detect -status-code | tee web_alive.txt`}
        expected={`Total único: 147
Resolveram: 89
https://www.empresa.com [200] [Empresa - Inicio] [nginx,bootstrap]
https://api.empresa.com [200] [API ACME] [nginx,react]
https://admin.empresa.com [302] [Login] [Apache,PHP,WordPress]
[...]`}
        verify="O arquivo final web_alive.txt vira input direto para nuclei/burp para a próxima fase do pentest."
      />

      <AlertBox type="info" title="Para domínio com Cloudflare/Akamai">
        Resolução pública mostra IPs do CDN, não do servidor real. Para achar o IP de origem
        consulte: histórico de Censys/Shodan, leaks de SPF/MX, headers HTTP, DNS-SPF antigo.
        Veja a página <a href="#/recon-ng"><strong>Recon-ng</strong></a> e{" "}
        <a href="#/maltego"><strong>Maltego</strong></a> para correlação avançada.
      </AlertBox>
    </PageContainer>
  );
}
