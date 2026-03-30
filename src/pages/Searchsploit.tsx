import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Searchsploit() {
    return (
      <PageContainer
        title="Searchsploit & Exploit-DB"
        subtitle="Busque exploits offline na base de dados mais completa do mundo diretamente do terminal."
        difficulty="intermediario"
        timeToRead="8 min"
      >
        <AlertBox type="info" title="Exploit-DB offline">
          Searchsploit é a interface CLI do Exploit-DB, disponível offline no Kali Linux.
          Contém dezenas de milhares de exploits, shellcodes e papers.
        </AlertBox>

        <h2>Instalação e Atualização</h2>
        <CodeBlock language="bash" code={'# Já instalado no Kali\nsearchsploit --version\n\n# Atualizar a base de dados\nsudo searchsploit -u\n\n# Verificar localização da base\nsearchsploit --help | grep "Database"'} />

        <h2>Busca Básica</h2>
        <CodeBlock language="bash" code={'# Busca por software\nsearchsploit apache\nsearchsploit wordpress\nsearchsploit "openssh 7.2"\n\n# Busca por CVE\nsearchsploit "CVE-2021-44228"\nsearchsploit "CVE-2017-0144"  # EternalBlue\n\n# Excluir resultados (ex: exploits DoS)\nsearchsploit apache | grep -v DoS\n\n# Busca por tipo\nsearchsploit -t "remote" apache'} />

        <h2>Filtros e Opções Avançadas</h2>
        <CodeBlock language="bash" code={'# -w: mostrar URL do exploit-db.com\nsearchsploit -w apache struts\n\n# --id: mostrar EDB-ID\nsearchsploit --id apache\n\n# -t: buscar apenas no título\nsearchsploit -t "apache 2.4.49"\n\n# -e: busca exata\nsearchsploit -e "Apache 2.4.49"\n\n# Formato JSON\nsearchsploit -j apache | python3 -m json.tool | head -50'} />

        <h2>Copiar e Usar Exploits</h2>
        <CodeBlock language="bash" code={'# Copiar exploit para diretório atual\nsearchsploit -m 47138  # pelo ID do exploit\nsearchsploit -m exploits/linux/webapps/47138.py\n\n# Ver conteúdo sem copiar\nsearchsploit -x 47138\n\n# Abrir no editor\nsearchsploit -x exploits/linux/webapps/47138.py | less\n\n# Caminho completo dos exploits\nsearchsploit -p 47138'} />

        <h2>Integração com Nmap</h2>
        <CodeBlock language="bash" code={'# Converter resultado do Nmap para busca no Searchsploit\nnmap -sV 192.168.1.10 -oX nmap_output.xml\nsearchsploit --nmap nmap_output.xml\n\n# Isso busca automaticamente pelos serviços e versões encontrados!'} />

        <AlertBox type="success" title="Exploit-DB online">
          Também acesse https://www.exploit-db.com para busca mais completa com filtros
          avançados, comentários da comunidade e detalhes sobre cada exploit.
        </AlertBox>
      </PageContainer>
    );
  }
  