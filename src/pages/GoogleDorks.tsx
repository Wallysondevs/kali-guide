import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function GoogleDorks() {
    return (
      <PageContainer
        title="Google Dorks (GHDB)"
        subtitle="Use operadores avançados do Google para encontrar informações sensíveis expostas publicamente."
        difficulty="iniciante"
        timeToRead="10 min"
      >
        <AlertBox type="info" title="Completamente legal">
          Google Dorks usa apenas a busca normal do Google com operadores avançados.
          As informações encontradas são publicamente indexadas. A responsabilidade está
          em como você usa o que encontra.
        </AlertBox>

        <h2>Operadores Fundamentais</h2>
        <CodeBlock language="bash" code={'# site: — limitar busca a um domínio\nsite:exemplo.com.br\nsite:exemplo.com filetype:pdf\n\n# filetype: / ext: — tipo de arquivo específico\nsite:empresa.com filetype:xlsx\nsite:empresa.com ext:sql\nsite:empresa.com filetype:env\n\n# intitle: — palavra no título da página\nintitle:"index of" site:empresa.com\nintitle:"painel administrativo"\n\n# inurl: — palavra na URL\ninurl:admin site:empresa.com\ninurl:login site:empresa.com.br\ninurl:wp-admin site:empresa.com\n\n# intext: — texto no conteúdo da página\nintext:"senha" site:empresa.com filetype:txt\nintext:"password" site:empresa.com filetype:log\n\n# cache: — versão em cache do Google\ncache:empresa.com\n\n# related: — sites relacionados\nrelated:empresa.com'} />

        <h2>Dorks para Encontrar Arquivos Sensíveis</h2>
        <CodeBlock language="bash" code={'# Arquivos de configuração\nsite:empresa.com filetype:env\nsite:empresa.com filetype:cfg\nsite:empresa.com "DB_PASSWORD"\nsite:empresa.com "api_key"\n\n# Bancos de dados\nsite:empresa.com filetype:sql\nsite:empresa.com filetype:sql "INSERT INTO users"\n\n# Planilhas com dados\nsite:empresa.com filetype:xlsx\nsite:empresa.com filetype:csv "email,senha"\n\n# Logs\nsite:empresa.com filetype:log\nsite:empresa.com ext:log "error"\n\n# Backup files\nsite:empresa.com filetype:bak\nsite:empresa.com filetype:old\nsite:empresa.com "backup" filetype:zip\n\n# Arquivos de senhas\nsite:empresa.com filetype:txt "password"\nsite:empresa.com filetype:ini "[passwords]"'} />

        <h2>Dorks para Painéis e Logins</h2>
        <CodeBlock language="bash" code={'# Painéis de administração\nsite:empresa.com inurl:admin\nsite:empresa.com inurl:administrator\nsite:empresa.com inurl:wp-admin\nsite:empresa.com inurl:phpmyadmin\nsite:empresa.com intitle:"login" inurl:admin\n\n# Câmeras e dispositivos\nsite:empresa.com inurl:/view/index.shtml\nintitle:"Network Camera" inurl:ViewerFrame\n\n# Sistemas de monitoramento\nintitle:"Zabbix" inurl:zabbix\nintitle:"Grafana" inurl:login\nintitle:"Jenkins" inurl:login'} />

        <h2>GitHub Dorks</h2>
        <CodeBlock language="bash" code={'# Buscar no GitHub por informações sensíveis\n# (use o GitHub Advanced Search: https://github.com/search/advanced)\n\n# Procurar por senhas em repositórios\n"empresa.com" password\n"empresa.com" secret\n"empresa.com" api_key\n\n# Chaves AWS expostas\n"AKIA" "empresa.com"\n\n# Tokens de acesso\nfilename:.env "DB_PASSWORD"\nfilename:config.php "password"\nfilename:credentials aws_access_key_id'} />

        <h2>GHDB — Google Hacking Database</h2>
        <CodeBlock language="bash" code={'# Acesse: https://www.exploit-db.com/google-hacking-database\n# Banco de dados com milhares de dorks prontos\n\n# Categorias:\n# - Vulnerable Files\n# - Sensitive Directories\n# - Sensitive Online Shopping Info\n# - Network or Vulnerability Data\n# - Pages Containing Login Portals\n# - Error Messages\n\n# Ferramenta: googler (busca no terminal)\nsudo apt install googler\ngoogler --count 20 "site:empresa.com filetype:pdf"\n\n# Ferramenta: goohak (automação de dorks)\ngit clone https://github.com/1N3/goohak\npython3 goohak/goohak.py'} />

        <AlertBox type="success" title="Próximos passos após os dorks">
          Com os arquivos e URLs encontrados, você pode: (1) checar credenciais vazadas,
          (2) encontrar subdomínios não descobertos anteriormente, (3) identificar tecnologias
          desatualizadas, e (4) mapear a superfície de ataque.
        </AlertBox>
      </PageContainer>
    );
  }
  