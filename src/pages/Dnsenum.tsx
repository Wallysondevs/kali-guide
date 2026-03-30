import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Dnsenum() {
    return (
      <PageContainer
        title="DNSenum & DNSrecon — Enumeração DNS"
        subtitle="Descubra subdomínios, servidores de e-mail, transferências de zona e toda a infraestrutura DNS do alvo."
        difficulty="iniciante"
        timeToRead="10 min"
      >
        <AlertBox type="info" title="DNS revela muito sobre uma empresa">
          A enumeração DNS pode revelar subdomínios esquecidos, servidores internos
          expostos, provedores de e-mail e muito mais — tudo de forma passiva.
        </AlertBox>

        <h2>dig — Consultas DNS Manuais</h2>
        <CodeBlock language="bash" code={'# Registros básicos\ndig empresa.com A          # endereço IPv4\ndig empresa.com AAAA       # endereço IPv6\ndig empresa.com MX         # servidores de e-mail\ndig empresa.com NS         # nameservers\ndig empresa.com TXT        # registros de texto (SPF, DKIM, etc.)\ndig empresa.com SOA        # Start of Authority\ndig empresa.com ANY        # todos os tipos\n\n# Consultar servidor específico\ndig @8.8.8.8 empresa.com A\ndig @ns1.empresa.com empresa.com ANY\n\n# Resolução reversa (IP → domínio)\ndig -x 200.100.50.10\n\n# Zone Transfer (AXFR) — se mal configurado, revela tudo!\ndig @ns1.empresa.com empresa.com AXFR\ndig @ns2.empresa.com empresa.com AXFR'} />

        <h2>dnsrecon</h2>
        <CodeBlock language="bash" code={'# Enumeração padrão\ndnsrecon -d empresa.com\n\n# Brute force de subdomínios\ndnsrecon -d empresa.com -D /usr/share/wordlists/dnsmap.txt -t brt\n\n# Zone transfer\ndnsrecon -d empresa.com -t axfr\n\n# Reverse lookup em faixa de IPs\ndnsrecon -r 200.100.50.0/24\n\n# Cache snooping\ndnsrecon -d empresa.com -t snoop -n 8.8.8.8\n\n# Google para subdomínios\ndnsrecon -d empresa.com -t goo\n\n# Salvar resultados\ndnsrecon -d empresa.com -j /tmp/dns_results.json\ndnsrecon -d empresa.com -x /tmp/dns_results.xml'} />

        <h2>dnsenum</h2>
        <CodeBlock language="bash" code={'# Instalado no Kali\ndnsenum empresa.com\n\n# Com wordlist de subdomínios\ndnsenum empresa.com --file /usr/share/wordlists/dnsmap.txt\n\n# Tentar zone transfer + brute force\ndnsenum empresa.com -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt\n\n# Análise completa\ndnsenum empresa.com --noreverse --threads 10'} />

        <h2>Ferramentas Modernas de Subdomain Discovery</h2>
        <CodeBlock language="bash" code={'# Subfinder — passivo, usa APIs\nsubfinder -d empresa.com\nsubfinder -d empresa.com -o subdomains.txt\nsubfinder -d empresa.com -v  # verbose\n\n# Amass — passivo + ativo\namass enum -passive -d empresa.com\namass enum -active -d empresa.com\namass enum -d empresa.com -o amass_results.txt\n\n# Descoberta via certificados SSL (crt.sh)\ncurl -s "https://crt.sh/?q=%25.empresa.com&output=json" | \\\n  python3 -m json.tool | grep name_value | sort -u\n\n# Combinar tudo\nfor sub in $(cat all_subs.txt); do\n  host "$sub" 2>/dev/null | grep "has address" && echo "$sub"\ndone'} />

        <h2>Encontrar IPs dos Subdomínios</h2>
        <CodeBlock language="bash" code={'# Resolver subdomínios para IPs\nmassdns -r resolvers.txt -t A -o S subdomains.txt\n\n# httpx — verificar quais têm servidor web\ncat subdomains.txt | httpx -status-code -title -o alive_subs.txt\n\n# Visualizar com aquatone\ncat alive_subs.txt | aquatone -out screenshots/'} />

        <AlertBox type="success" title="Subdomínios esquecidos = alvos fáceis">
          Subdomínios de dev/staging/test frequentemente têm segurança menor que produção.
          Ex: dev.empresa.com, staging.empresa.com, admin.empresa.com, old.empresa.com
        </AlertBox>
      </PageContainer>
    );
  }
  