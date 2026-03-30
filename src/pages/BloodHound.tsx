import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function BloodHound() {
    return (
      <PageContainer
        title="BloodHound — Análise de Active Directory"
        subtitle="Visualize graficamente as relações e caminhos de ataque em ambientes Active Directory."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="danger" title="Para uso em ambientes autorizados">
          BloodHound mapeia toda a estrutura de um AD. Use apenas em pentests com escopo aprovado.
        </AlertBox>

        <h2>O que é BloodHound?</h2>
        <p>
          BloodHound usa teoria de grafos para revelar relações ocultas em um Active Directory.
          Identifica automaticamente caminhos de ataque que levariam à comprometimento do Domain Admin —
          até mesmo em ADs bem configurados.
        </p>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# BloodHound requer Neo4j (banco de dados de grafos)\nsudo apt install bloodhound neo4j -y\n\n# Iniciar Neo4j\nsudo neo4j start\n\n# Acessar painel Neo4j (configurar senha)\n# http://localhost:7474\n# Usuário: neo4j / Senha padrão: neo4j\n# Definir nova senha!\n\n# Iniciar BloodHound\nbloodhound &'} />

        <h2>Coleta de Dados com SharpHound</h2>
        <CodeBlock language="bash" code={'# SharpHound é o coletor (executar na máquina Windows do AD)\n# Baixar: https://github.com/BloodHoundAD/BloodHound/tree/master/Collectors\n\n# Coletar tudo (requer credenciais de domínio)\n.\\SharpHound.exe -c All\n\n# Coletar apenas sessões (menos barulho)\n.\\SharpHound.exe -c Session\n\n# Via PowerShell (SharpHound.ps1)\nImport-Module .\\SharpHound.ps1\nInvoke-BloodHound -CollectionMethod All\n\n# Via Impacket (do Kali, sem acesso local à máquina)\nimpacket-bloodhound-python -d DOMINIO.local -u usuario -p senha -ns IP_DC -c all'} />

        <h2>Importar Dados no BloodHound</h2>
        <CodeBlock language="bash" code={'# SharpHound gera um ZIP com arquivos JSON\n# No BloodHound GUI:\n# 1. Clicar em "Upload Data" (botão de upload)\n# 2. Selecionar o arquivo ZIP gerado pelo SharpHound\n# 3. Aguardar importação\n\n# Verificar no Neo4j\n# http://localhost:7474\n# MATCH (n) RETURN count(n)  # contar nós importados'} />

        <h2>Queries Essenciais</h2>
        <CodeBlock language="bash" code={'# No BloodHound GUI — aba "Analysis":\n\n# Caminhos para Domain Admins\n# "Find Shortest Paths to Domain Admins"\n# "Find all Paths from Kerberoastable Users to Domain Admins"\n\n# Usuários de alto valor\n# "Find Principals with DCSync Rights"\n# "Find Computers where Domain Users are Local Admin"\n\n# Queries Cypher avançadas (aba "Raw Query"):\n# Todos os Domain Admins:\nMATCH (u:User)-[:MemberOf*1..]->(g:Group {name:"DOMAIN ADMINS@DOMINIO.LOCAL"}) RETURN u.name\n\n# Usuários Kerberoastáveis:\nMATCH (u:User {hasspn:true}) RETURN u.name\n\n# Computers com Local Admin para Domain Users:\nMATCH (g:Group {name:"DOMAIN USERS@DOMINIO.LOCAL"})-[:AdminTo]->(c:Computer) RETURN c.name'} />

        <h2>BloodHound Community Edition (v2)</h2>
        <CodeBlock language="bash" code={'# BloodHound CE — versão mais moderna com Docker\n# https://github.com/SpecterOps/BloodHound\n\ncurl -L https://ghst.ly/getbhce | docker compose -f - up\n\n# Acessar: http://localhost:8080'} />

        <AlertBox type="success" title="Atacando o que o BloodHound encontrou">
          BloodHound identifica paths, mas você ainda precisa executar os ataques.
          Paths comuns: Kerberoasting → quebrar hash → usar credencial → Domain Admin.
          Use o Impacket para a maioria das ações pós-BloodHound.
        </AlertBox>
      </PageContainer>
    );
  }
  