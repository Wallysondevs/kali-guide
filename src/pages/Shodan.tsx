import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Shodan() {
    return (
      <PageContainer
        title="Shodan"
        subtitle="O motor de busca dos dispositivos conectados à internet — câmeras, roteadores, servidores industriais e muito mais."
        difficulty="intermediario"
        timeToRead="10 min"
      >
        <AlertBox type="warning" title="Use com responsabilidade">
          Shodan indexa dispositivos públicos. Acessar dispositivos sem autorização é crime.
          Use Shodan apenas para reconhecimento OSINT do seu escopo de pentest.
        </AlertBox>

        <h2>O que é o Shodan?</h2>
        <p>
          Shodan é um motor de busca que varre a internet inteira e indexa banners de serviços
          (HTTP, FTP, SSH, Telnet, etc.) de milhões de dispositivos. Permite encontrar servidores
          vulneráveis, câmeras expostas, sistemas SCADA/ICS e dispositivos IoT mal configurados.
        </p>

        <h2>Filtros Essenciais</h2>
        <CodeBlock language="bash" code={'# Busca simples por produto\nshodan search "apache"\nshodan search "nginx 1.14"\n\n# Filtros principais:\n# hostname:     domínio do host\n# net:          faixa de IPs (CIDR)\n# port:         porta aberta\n# country:      código do país (BR, US, etc)\n# org:          organização/empresa\n# product:      software específico\n# version:      versão do software\n# os:           sistema operacional\n# vuln:         CVE específico\n\n# Exemplos de filtros combinados:\nshodan search "port:22 country:BR product:OpenSSH"\nshodan search "hostname:empresa.com.br"\nshodan search "net:200.100.50.0/24"\nshodan search "org:\"Empresa SA\" port:3389"'} />

        <h2>CLI do Shodan</h2>
        <CodeBlock language="bash" code={'# Instalar CLI\npip3 install shodan\n\n# Configurar com sua API key\nshodan init SUA_API_KEY\n\n# Buscar e salvar\nshodan search --fields ip_str,port,org,hostnames "produto:"Apache" country:BR" > apache_br.txt\n\n# Informações sobre um IP específico\nshodan host 8.8.8.8\nshodan host 192.168.1.1\n\n# Estatísticas de uma busca\nshodan count "apache country:BR"\nshodan stats --facets country "apache"\n\n# Download massivo (requer conta paga)\nshodan download --limit 1000 resultado_apache "apache country:BR"\nshodan parse --fields ip_str,port resultado_apache.json.gz'} />

        <h2>Buscas Especializadas (Dorks do Shodan)</h2>
        <CodeBlock language="bash" code={'# Câmeras IP expostas\nshodan search "product:\"webcam\" country:BR"\nshodan search "Server: yawcam"\nshodan search "webcamXP"\n\n# Painéis de controle expostos\nshodan search "http.title:\"router\" country:BR"\nshodan search "http.title:\"admin\" port:80 country:BR"\n\n# Sistemas SCADA/ICS\nshodan search "port:502"  # Modbus\nshodan search "port:102"  # Siemens S7\nshodan search "port:44818" # EtherNet/IP\n\n# Banco de dados expostos\nshodan search "port:27017" # MongoDB sem autenticação\nshodan search "port:6379 country:BR" # Redis\nshodan search "port:9200" # Elasticsearch\n\n# Dispositivos com vulnerabilidades\nshodan search "vuln:CVE-2021-44228" # Log4Shell\nshodan search "vuln:CVE-2017-0144"  # EternalBlue'} />

        <h2>Integração com Scripts</h2>
        <CodeBlock language="bash" code={'# Script Python básico\npython3 << \'EOF\'\nimport shodan\n\napi = shodan.Shodan(\'SUA_API_KEY\')\n\ntry:\n    resultados = api.search(\'hostname:empresa.com\')\n    print(f"Total: {resultados[\'total\']} hosts")\n    for r in resultados[\'matches\']:\n        print(f"IP: {r[\'ip_str\']} - Porta: {r[\'port\']}")\n        print(f"Org: {r.get(\'org\', \'N/A\')}")\n        print("---")\nexcept shodan.APIError as e:\n    print(f"Erro: {e}")\nEOF'} />

        <AlertBox type="success" title="Shodan é gratuito com limites">
          Conta gratuita: 100 resultados por busca, 1 download/mês.
          Conta Student (US$ 5): acesso completo. Vale muito a pena para pentests!
        </AlertBox>
      </PageContainer>
    );
  }
  