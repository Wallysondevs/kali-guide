import{j as o}from"./index-Bd5otbF3.js";import{P as n}from"./PageContainer-BFcnvssG.js";import{A as s}from"./AlertBox-CL6YULjX.js";import{C as t}from"./CodeBlock-C2J-D4l6.js";import{C as a}from"./CommandTable-BxJEHhQ9.js";import{T as e,P as r}from"./PracticeBox-Pst8IaIf.js";function l(){return o.jsxs(n,{title:"Proxychains — força qualquer programa por SOCKS",subtitle:"Roteia TCP de qualquer comando por proxies (Tor, SSH -D, Burp, ntlmrelayx). Essencial para pivoting e anonimato.",difficulty:"intermediario",timeToRead:"10 min",children:[o.jsx("h2",{children:"Como funciona"}),o.jsxs("p",{children:["Proxychains usa ",o.jsx("code",{children:"LD_PRELOAD"})," para interceptar chamadas ",o.jsx("code",{children:"connect()"}),"do programa alvo e redirecioná-las pelo proxy configurado. Funciona com QUASE qualquer ferramenta TCP (nmap -sT, ssh, curl, sqlmap, nikto, firefox). Não funciona com UDP nem com programas que fazem raw sockets (nmap -sS, scapy, ping ICMP)."]}),o.jsx("h2",{children:"Setup"}),o.jsx(e,{path:"~",lines:[{cmd:"sudo apt install -y proxychains4",out:`Reading package lists... Done
proxychains4 is already the newest version (4.16-4).
0 upgraded, 0 newly installed, 0 to remove.`,outType:"muted"},{cmd:"which proxychains4 proxychains",out:`/usr/bin/proxychains4
/usr/bin/proxychains       (alias do mesmo binário)`,outType:"info"},{cmd:"cat /etc/proxychains4.conf | grep -v '^#' | grep -v '^$'",out:`dynamic_chain
proxy_dns
remote_dns_subnet 224
tcp_read_time_out 15000
tcp_connect_time_out 8000
[ProxyList]
socks4 127.0.0.1 9050`,outType:"default"}]}),o.jsx("h2",{children:"Modos de chain"}),o.jsx(a,{title:"Edite /etc/proxychains4.conf — descomente UMA linha",variations:[{cmd:"dynamic_chain",desc:"Tenta cada proxy em ordem; pula os offline.",output:"Recomendado. Mais flexível."},{cmd:"strict_chain",desc:"TODOS proxies em ordem; falha se 1 estiver offline.",output:"Default. Mais previsível."},{cmd:"random_chain",desc:"Pega N proxies aleatórios da lista.",output:"Bom para anonimato. Set chain_len também."},{cmd:"round_robin_chain",desc:"Rotaciona ordem entre conexões.",output:"Distribui carga."},{cmd:"proxy_dns",desc:"Resolve DNS pelo proxy (não vaza).",output:"SEMPRE deixe ON."},{cmd:"quiet_mode",desc:"Não imprime [proxychains] [...] em cada conn.",output:"Equivale a -q."}]}),o.jsx("h2",{children:"Configurar proxies (sintaxe)"}),o.jsx(t,{language:"bash",title:"/etc/proxychains4.conf — seção [ProxyList]",code:`# tipo  host           porta   [user]    [pass]
socks5   127.0.0.1      9050              # Tor
socks5   127.0.0.1      1080              # SSH -D 1080
socks5   192.168.1.50   1080  ana   xyz   # SOCKS com auth
http     192.168.1.10   8080              # Burp
http     proxy.empresa  3128  user  pwd   # corporate proxy

# usar SOMENTE 1 ativo de cada vez para começar.
# múltiplos = chain real (sai do último IP).`}),o.jsx("h2",{children:"Caso 1 — Anonimato com Tor"}),o.jsx(e,{path:"~",lines:[{cmd:"sudo systemctl start tor && sudo ss -lntp | grep tor",out:`LISTEN  0  4096  127.0.0.1:9050  0.0.0.0:*  users:(("tor",pid=4421))
LISTEN  0  4096  127.0.0.1:9051  0.0.0.0:*  users:(("tor",pid=4421))`,outType:"info"},{cmd:"curl -s ifconfig.io",out:"203.0.113.42         (seu IP real)",outType:"muted"},{cmd:"proxychains4 -q curl -s ifconfig.io",out:"185.220.101.42        (exit node Tor — Holanda)",outType:"success"},{comment:"rodar de novo sai por OUTRO exit node",cmd:"for i in 1 2 3; do proxychains4 -q curl -s ifconfig.io; done",out:`185.220.101.42
204.85.191.30
51.83.45.12`,outType:"info"},{comment:"ver país do exit",cmd:"proxychains4 -q curl -s ipinfo.io | jq",out:`{
  "ip": "204.85.191.30",
  "city": "Stockholm",
  "country": "SE",
  "org": "AS62597 NFO Hosting"
}`,outType:"default"}]}),o.jsx("h2",{children:"Caso 2 — Pivot via SSH dinâmico"}),o.jsx(e,{path:"~",lines:[{comment:"abrir SOCKS5 no jumphost da DMZ",cmd:"ssh -D 1080 -N -f ana@jumphost.empresa.com",out:"(silencioso, vai pra background)",outType:"muted"},{comment:"trocar /etc/proxychains4.conf pra apontar pra 1080",cmd:"sudo sed -i 's/^socks4.*9050/socks5 127.0.0.1 1080/' /etc/proxychains4.conf",out:"(agora chain = socks5 1080)",outType:"info"},{cmd:"proxychains4 -q nmap -sT -Pn --top-ports=20 192.168.50.10",out:`Starting Nmap 7.96 ( https://nmap.org )
Nmap scan report for 192.168.50.10
Host is up.
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
139/tcp  open     netbios-ssn
445/tcp  open     microsoft-ds
3306/tcp open     mysql
5432/tcp open     postgresql

Nmap done: 1 IP address (1 host up) scanned in 6.42 seconds`,outType:"warning"},{comment:"atenção: -sS (SYN) NÃO funciona via proxychains. SEMPRE -sT (full TCP connect)",cmd:"proxychains4 -q sqlmap -u http://192.168.50.10/login.php --forms --batch",out:`[*] starting @ 22:41:11

[INFO] testing connection to the target URL
[INFO] testing if the target URL content is stable
[INFO] testing if POST parameter 'username' is dynamic
[INFO] heuristic (parsing) test shows that POST parameter 'username' might be injectable

POST parameter 'username' is vulnerable. Do you want to keep testing the others?`,outType:"error"}]}),o.jsx("h2",{children:"Caso 3 — Cadeia múltipla (red team)"}),o.jsx(t,{language:"bash",title:"/etc/proxychains4.conf — chain Tor → SSH → Burp",code:`dynamic_chain
proxy_dns

[ProxyList]
socks5  127.0.0.1  9050     # Tor (3 hops da rede onion)
socks5  127.0.0.1  1080     # SSH -D para hop 1
socks5  127.0.0.1  1081     # SSH -D para hop 2
http    127.0.0.1  8080     # Burp Suite (intercepta no fim)`}),o.jsx(e,{path:"~",lines:[{cmd:"proxychains4 firefox http://alvo-final.com",out:`[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.16
[proxychains] Dynamic chain  ...  127.0.0.1:9050  ...  127.0.0.1:1080  ...  127.0.0.1:1081  ...  127.0.0.1:8080  ...  alvo-final.com:80  ...  OK`,outType:"info"}]}),o.jsx("p",{children:"Acima você está fazendo: tráfego sai pelo Tor (3 hops anonimização) → entra num SSH tunel A → entra noutro SSH tunel B → passa pelo Burp (que intercepta) → atinge o alvo. Cada hop SÓ vê o anterior e o próximo. Latência muito alta mas anonimato/intercepção máxima."}),o.jsx("h2",{children:"Caso 4 — proxychains com Metasploit pivot"}),o.jsx(e,{path:"~",lines:[{comment:"1) na sessão meterpreter já obtida, rotear rede interna",cmd:"(meterpreter) run autoroute -s 192.168.50.0/24",out:`[*] Adding a route to 192.168.50.0/255.255.255.0...
[+] Route added`,outType:"default"},{comment:"2) subir SOCKS server no msf",cmd:"msf6> use auxiliary/server/socks_proxy",out:"(loaded)",outType:"muted"},{cmd:"msf6> set SRVPORT 1080; set VERSION 5; run -j",out:`[*] Starting the SOCKS proxy server
[*] SOCKS5 listener started on 0.0.0.0:1080`,outType:"info"},{comment:"3) /etc/proxychains4.conf já está em socks5 127.0.0.1 1080. usar normal:",cmd:"proxychains4 -q curl http://192.168.50.20/admin",out:`<html><title>Painel admin (interno)</title>
<form action="/login"...`,outType:"warning"},{cmd:"proxychains4 -q hydra -l admin -P rockyou.txt 192.168.50.30 ssh",out:`Hydra v9.5
[DATA] attacking ssh://192.168.50.30:22/
[STATUS] 60.00 tries/min, 60 tries in 00:01h, 14344332 to do
[22][ssh] host: 192.168.50.30  login: admin  password: P@ssw0rd123!
[STATUS] attack finished for 192.168.50.30 (valid pair found)`,outType:"error"}]}),o.jsx("h2",{children:"Limitações importantes"}),o.jsx(a,{title:"O que NÃO funciona",variations:[{cmd:"Pacotes UDP",desc:"DNS UDP, traceroute UDP, ntp.",output:"Use proxy_dns ou tunel UDP separado."},{cmd:"Raw sockets",desc:"nmap -sS, scapy, hping3.",output:"Use -sT (TCP connect) sempre."},{cmd:"ICMP (ping)",desc:"Ping não passa por proxy TCP.",output:"Use nmap -PS para 'ping' TCP."},{cmd:"Programas estáticos",desc:"Binários sem libc dinâmica.",output:"LD_PRELOAD não engata."},{cmd:"Programas que fazem fork+exec de outros binários",desc:"Browser modernos podem escapar.",output:"Use SOCKS nativo do firefox."},{cmd:"Throughput alto",desc:"Latência adiciona em cada hop.",output:"Tor adiciona ~500ms+."}]}),o.jsx("h2",{children:"Alternativas modernas"}),o.jsx(a,{title:"Quando proxychains não basta",variations:[{cmd:"tsocks",desc:"Mais antigo, parecido.",output:"Em desuso."},{cmd:"torsocks",desc:"Wrapper específico para Tor.",output:"Mais seguro contra leak."},{cmd:"redsocks",desc:"TCP→SOCKS via iptables.",output:"Transparent — para a máquina toda."},{cmd:"sshuttle -r host net/24",desc:"VPN-like via SSH.",output:"Sem precisar wrapper. Funciona com UDP."},{cmd:"wireguard",desc:"VPN moderna.",output:"Performance >> tudo acima."},{cmd:"FoxyProxy (firefox)",desc:"Plugin browser.",output:"SOCKS nativo, sem wrapper."}]}),o.jsx(r,{title:"Lab: pivot por SSH + nmap interno",goal:"Praticar a chain inteira: SSH -D no jumphost → proxychains → nmap rede interna.",steps:["Suba 2 containers numa rede docker custom: 'jump' (com sshd) e 'interno' (com nginx).","Da SUA máquina, jump é acessível. interno NÃO é.","ssh -D 1080 -N -f user@jump.","Configure proxychains4.conf para socks5 127.0.0.1 1080.","proxychains4 nmap -sT -Pn -p 80 interno → deve achar a porta!"],command:`docker network create labnet
docker run -d --name interno --network labnet nginx:alpine
docker run -d --name jump --network labnet -p 2222:22 \\
  -e USER_NAME=lab -e USER_PASSWORD=lab -e PUBLIC_KEY="$(cat ~/.ssh/id_rsa.pub)" \\
  ghcr.io/linuxserver/openssh-server

# 1) IP do interno (só pelo jump)
docker network inspect labnet | grep -A2 interno

# 2) tunel SOCKS pelo jump
ssh -D 1080 -N -f -p 2222 -i ~/.ssh/id_rsa lab@127.0.0.1

# 3) atacar interno via tunel
proxychains4 -q nmap -sT -Pn -p 80 172.18.0.2  # IP do container interno`,expected:`Nmap scan report for 172.18.0.2
Host is up.
PORT   STATE SERVICE
80/tcp open  http`,verify:"Sem o tunel SSH ativo (kill do PID), o nmap falha porque interno não é acessível diretamente."}),o.jsxs(s,{type:"info",title:"Mais simples: sshuttle",children:["Para 90% dos casos, ",o.jsx("code",{children:"sshuttle -r user@jump rede/24"})," é melhor — não precisa configurar proxychains, funciona com TODA ferramenta (incluindo ping/UDP), e libera automático ao parar. Use proxychains quando precisar de chain real ou intercepção no Burp."]})]})}export{l as default};
