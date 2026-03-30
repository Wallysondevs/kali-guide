import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Enum4linux() {
    return (
      <PageContainer
        title="Enum4linux — Enumeração SMB/NetBIOS"
        subtitle="Extraia informações detalhadas de sistemas Windows e Samba via protocolo SMB."
        difficulty="intermediario"
        timeToRead="10 min"
      >
        <AlertBox type="warning" title="Requer acesso à rede SMB">
          Enum4linux tenta conexões ativas na porta 445/139 do alvo.
          Use apenas em sistemas com autorização explícita.
        </AlertBox>

        <h2>O que o Enum4linux Descobre?</h2>
        <p>
          Enum4linux é um wrapper para rpcclient, smbclient e net. Extrai: usuários e grupos,
          compartilhamentos SMB, informações de domínio, política de senhas, membros do grupo Administrators,
          e muito mais — muitas vezes sem precisar de credenciais válidas (sessão nula).
        </p>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Já no Kali:\nwhich enum4linux\n\n# Versão mais moderna (enum4linux-ng)\nsudo apt install enum4linux-ng -y\n# ou:\ngit clone https://github.com/cddmp/enum4linux-ng\npip3 install -r enum4linux-ng/requirements.txt'} />

        <h2>Enumeração Completa</h2>
        <CodeBlock language="bash" code={'# Enumeração completa (tudo)\nenum4linux -a 192.168.1.10\n\n# Apenas usuários\nenum4linux -U 192.168.1.10\n\n# Apenas compartilhamentos\nenum4linux -S 192.168.1.10\n\n# Grupos e membros\nenum4linux -G 192.168.1.10\n\n# Informações do domínio\nenum4linux -n 192.168.1.10\n\n# Política de senhas\nenum4linux -P 192.168.1.10\n\n# Com credenciais\nenum4linux -u admin -p senha123 -a 192.168.1.10\n\n# Salvar resultado\nenum4linux -a 192.168.1.10 | tee enum4linux_output.txt'} />

        <h2>Enum4linux-ng (Versão Moderna)</h2>
        <CodeBlock language="bash" code={'# Enumeração completa\nenum4linux-ng -A 192.168.1.10\n\n# Com credenciais\nenum4linux-ng -A -u admin -p senha123 192.168.1.10\n\n# Saída em YAML e JSON\nenum4linux-ng -A -oA resultado_smb 192.168.1.10\n\n# Verbose\nenum4linux-ng -A -v 192.168.1.10'} />

        <h2>Enumerar SMB Manualmente (smbclient)</h2>
        <CodeBlock language="bash" code={'# Listar compartilhamentos sem senha\nsmbclient -L //192.168.1.10 -N\n\n# Conectar a um compartilhamento\nsmbclient //192.168.1.10/public -N\n\n# Comandos dentro do smbclient:\n# ls           — listar arquivos\n# get arquivo  — baixar arquivo\n# put arquivo  — enviar arquivo\n# recurse      — modo recursivo\n# mget *       — baixar tudo\n\n# Montar compartilhamento SMB localmente\nsudo mount -t cifs //192.168.1.10/dados /mnt/smb -o username=admin,password=senha'} />

        <AlertBox type="success" title="Combinando ferramentas">
          Após descobrir usuários com Enum4linux, use-os com Hydra para brute force,
          ou com Impacket para ataques Kerberos em ambientes Active Directory.
        </AlertBox>
      </PageContainer>
    );
  }
  