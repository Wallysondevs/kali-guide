import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Masscan() {
    return (
      <PageContainer
        title="Masscan"
        subtitle="O scanner de portas mais rápido do mundo — capaz de varrer a internet inteira em 6 minutos."
        difficulty="intermediario"
        timeToRead="8 min"
      >
        <AlertBox type="danger" title="Atenção ao uso em redes">
          Masscan gera tráfego intenso e pode ser detectado facilmente. Use apenas em redes e sistemas
          com autorização explícita. Taxas altas podem causar instabilidade em roteadores e firewalls.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'sudo apt install masscan -y\n\n# Verificar versão\nmasscan --version'} />

        <h2>Sintaxe e Exemplos Básicos</h2>
        <CodeBlock language="bash" code={'# Varrer porta 80 em uma rede inteira\nsudo masscan 192.168.1.0/24 -p 80\n\n# Varrer múltiplas portas\nsudo masscan 10.0.0.0/8 -p 22,80,443,3389\n\n# Varrer faixa de portas\nsudo masscan 192.168.1.0/24 -p 1-1000\n\n# Varrer todas as portas (65535)\nsudo masscan 192.168.1.0/24 -p 0-65535'} />

        <h2>Controle de Velocidade</h2>
        <CodeBlock language="bash" code={'# --rate: pacotes por segundo (padrão: 100)\n# Em redes locais pode ir até 1.000.000\n# Em redes externas, seja conservador (1000-10000)\n\nsudo masscan 192.168.1.0/24 -p 1-65535 --rate 1000\nsudo masscan 10.0.0.0/24 -p 80,443 --rate 100000\n\n# Para varredura furtiva (lenta):\nsudo masscan 192.168.1.100 -p 1-1000 --rate 10'} />

        <h2>Salvar e Retomar Varreduras</h2>
        <CodeBlock language="bash" code={'# Salvar resultados\nsudo masscan 192.168.1.0/24 -p 1-1000 -oG resultados.txt\nsudo masscan 192.168.1.0/24 -p 1-1000 -oX resultados.xml\nsudo masscan 192.168.1.0/24 -p 1-1000 -oJ resultados.json\n\n# Salvar estado para retomar depois\nsudo masscan 10.0.0.0/8 -p 80 --rate 1000 --resume-filename estado.conf\n\n# Retomar varredura interrompida\nsudo masscan --resume estado.conf'} />

        <h2>Combinando com Nmap</h2>
        <CodeBlock language="bash" code={'# Masscan para descoberta rápida, Nmap para detalhes\n\n# 1. Varredura rápida com Masscan\nsudo masscan 192.168.1.0/24 -p 1-65535 --rate 10000 -oG masscan_output.txt\n\n# 2. Extrair IPs únicos\ngrep "Host:" masscan_output.txt | awk \'{print $2}\' | sort -u > hosts.txt\n\n# 3. Varredura detalhada com Nmap nos hosts encontrados\nnmap -sV -sC -A -iL hosts.txt -oA nmap_detalhado\n\n# Script automatizado:\nfor ip in $(grep "Host:" masscan_output.txt | awk \'{print $2}\' | sort -u); do\n  nmap -sV -sC $ip -p $(grep "Host: $ip" masscan_output.txt | grep -oP "Ports: \\d+" | grep -oP "\\d+") >> nmap_results.txt\ndone'} />

        <AlertBox type="success" title="Masscan vs Nmap">
          Use Masscan para descoberta inicial rápida (qual IP tem qual porta aberta),
          depois Nmap para identificar serviços, versões e vulnerabilidades. Os dois juntos
          são imbatíveis!
        </AlertBox>
      </PageContainer>
    );
  }
  