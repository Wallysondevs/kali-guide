import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";
  import { ParamsTable } from "@/components/ui/ParamsTable";

  export default function TheHarvester() {
    return (
      <PageContainer
        title="theHarvester"
        subtitle="Colete e-mails, subdomínios, IPs e nomes de hosts usando múltiplas fontes públicas."
        difficulty="iniciante"
        timeToRead="8 min"
      >
        <AlertBox type="info" title="Ferramenta padrão de reconhecimento">
          theHarvester está instalado no Kali Linux por padrão e é uma das primeiras ferramentas
          usadas em qualquer pentest profissional. Coleta dados de forma passiva — sem contato direto com o alvo.
        </AlertBox>

        <h2>Instalação e Atualização</h2>
        <CodeBlock language="bash" code={'# Já instalado no Kali:\nwhich theHarvester\n\n# Atualizar via pip (para versão mais recente)\npip3 install theHarvester --upgrade\n\n# Ou via apt:\nsudo apt update && sudo apt install theharvester -y'} />

        <h2>Sintaxe Básica</h2>
        <CodeBlock language="bash" code={'theHarvester -d DOMINIO -b FONTE [opções]\n\n# Exemplos básicos:\ntheHarvester -d exemplo.com.br -b google\ntheHarvester -d exemplo.com.br -b bing\ntheHarvester -d exemplo.com.br -b all -l 500'} />

        <h2>Fontes Disponíveis</h2>
        <CodeBlock language="bash" code={'# Ver todas as fontes disponíveis:\ntheHarvester --list-providers\n\n# Principais fontes gratuitas:\n# google, bing, yahoo, duckduckgo\n# crtsh           — certificados SSL (ótimo para subdomínios!)\n# dnsdumpster     — análise de DNS\n# shodan          — requer API key\n# hunter          — e-mails (requer API key)\n# linkedin        — requer API key\n\n# Usar múltiplas fontes:\ntheHarvester -d empresa.com -b google,bing,crtsh,dnsdumpster'} />

        <h2>Opções Avançadas</h2>
        <CodeBlock language="bash" code={'# -l: limite de resultados (padrão 500)\ntheHarvester -d empresa.com -b google -l 1000\n\n# -f: salvar em HTML e XML\ntheHarvester -d empresa.com -b all -f resultado_empresa\n\n# -n: fazer resolução DNS dos hosts encontrados\ntheHarvester -d empresa.com -b bing -n\n\n# -c: buscar servidores virtuais\ntheHarvester -d empresa.com -b bing -c\n\n# -t: fazer TLD expansion (descobrir outros TLDs)\ntheHarvester -d empresa -b bing -t\n\n# Executar reconhecimento completo:\ntheHarvester -d empresa.com.br \\\n  -b google,bing,crtsh,dnsdumpster,yahoo \\\n  -l 500 -n -f relatorio_empresa'} />

        <AlertBox type="warning" title="APIs necessárias para algumas fontes">
          Fontes como Shodan, Hunter.io e LinkedIn requerem chaves de API gratuitas.
          Configure-as em <code>~/.theHarvester/api-keys.yaml</code>.
        </AlertBox>

        <h2>Configurar API Keys</h2>
        <CodeBlock language="bash" code={'# Editar arquivo de configuração:\nmkdir -p ~/.theHarvester\nnano ~/.theHarvester/api-keys.yaml\n\n# Conteúdo do arquivo:\n# shodan:\n#   key: SUA_CHAVE_SHODAN\n# hunter:\n#   key: SUA_CHAVE_HUNTER\n\n# Obter chaves gratuitas:\n# Shodan: https://account.shodan.io/register\n# Hunter.io: https://hunter.io/users/sign_up'} />

        <h2>Interpretando os Resultados</h2>
        <CodeBlock language="bash" code={'# Exemplo de saída típica:\n# [*] Hosts found: 23\n#   mail.empresa.com : 192.168.1.10\n#   vpn.empresa.com  : 200.150.100.50\n#   dev.empresa.com  : 10.0.0.5\n\n# [*] Emails found: 12\n#   joao.silva@empresa.com\n#   maria@empresa.com\n\n# O que fazer com isso:\n# 1. IPs → varredura com Nmap\n# 2. E-mails → ataques de phishing ou verificação de vazamentos\n# 3. Subdomínios → mais reconhecimento, Gobuster, Nikto'} />

        <AlertBox type="success" title="Dica de workflow">
          Combine theHarvester com Subfinder e Amass para máxima cobertura de subdomínios.
          Cada ferramenta usa fontes diferentes e os resultados se complementam.
        </AlertBox>
      </PageContainer>
    );
  }
  