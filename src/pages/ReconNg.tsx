import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function ReconNg() {
    return (
      <PageContainer
        title="Recon-ng"
        subtitle="Framework modular de OSINT com dezenas de módulos para reconhecimento automatizado."
        difficulty="intermediario"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="O Metasploit do OSINT">
          Recon-ng funciona de forma similar ao Metasploit — módulos, workspaces, banco de dados local.
          Ideal para campanhas longas de reconhecimento onde você quer organizar e correlacionar dados.
        </AlertBox>

        <h2>Instalação e Início</h2>
        <CodeBlock language="bash" code={'sudo apt install recon-ng -y\n\n# Iniciar o console\nrecon-ng\n\n# Criar e usar um workspace\n[recon-ng] > workspaces create empresa_alvo\n[recon-ng] > workspaces load empresa_alvo\n\n# Adicionar o domínio alvo ao banco de dados\n[recon-ng] > db insert domains\n> domínio: empresa.com.br'} />

        <h2>Instalar e Gerenciar Módulos</h2>
        <CodeBlock language="bash" code={'# Listar módulos disponíveis\n[recon-ng] > marketplace list\n[recon-ng] > marketplace list recon\n\n# Buscar módulo específico\n[recon-ng] > marketplace search domains-hosts\n\n# Instalar módulo\n[recon-ng] > marketplace install recon/domains-hosts/brute_hosts\n[recon-ng] > marketplace install recon/domains-contacts/whois_pocs\n[recon-ng] > marketplace install recon/hosts-hosts/shodan_ip\n\n# Ver módulos instalados\n[recon-ng] > modules list'} />

        <h2>Usando Módulos de Reconhecimento</h2>
        <CodeBlock language="bash" code={'# Enumeração de subdomínios via brute force\n[recon-ng] > modules load recon/domains-hosts/brute_hosts\n[recon-ng] > info  # ver opções\n[recon-ng] > options set SOURCE empresa.com.br\n[recon-ng] > run\n\n# Busca por e-mails via WHOIS\n[recon-ng] > modules load recon/domains-contacts/whois_pocs\n[recon-ng] > options set SOURCE empresa.com.br\n[recon-ng] > run\n\n# Integração com Shodan\n[recon-ng] > keys add shodan_api SUA_CHAVE\n[recon-ng] > modules load recon/hosts-hosts/shodan_ip\n[recon-ng] > run'} />

        <h2>Banco de Dados e Consultas</h2>
        <CodeBlock language="bash" code={'# Ver dados coletados\n[recon-ng] > show domains\n[recon-ng] > show hosts\n[recon-ng] > show contacts\n[recon-ng] > show credentials\n\n# Consulta SQL direta\n[recon-ng] > db query SELECT * FROM hosts WHERE ip_address IS NOT NULL\n[recon-ng] > db query SELECT email FROM contacts'} />

        <h2>Gerar Relatório</h2>
        <CodeBlock language="bash" code={'# Módulos de relatório\n[recon-ng] > marketplace install reporting/html\n[recon-ng] > marketplace install reporting/csv\n\n# Gerar relatório HTML\n[recon-ng] > modules load reporting/html\n[recon-ng] > options set FILENAME /root/relatorio_empresa.html\n[recon-ng] > options set CREATOR \"Pentester\"\n[recon-ng] > options set CUSTOMER \"Empresa SA\"\n[recon-ng] > run'} />

        <AlertBox type="success" title="Workflow completo com Recon-ng">
          1. Criar workspace → 2. Adicionar domínio → 3. Rodar módulos de DNS e WHOIS →
          4. Rodar módulos de hosts/IPs → 5. Correlacionar com Shodan → 6. Exportar relatório.
        </AlertBox>
      </PageContainer>
    );
  }
  