import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Maltego() {
    return (
      <PageContainer
        title="Maltego — OSINT Visual e Relações"
        subtitle="Visualize e correlacione informações de OSINT de forma gráfica, mapeando relações entre entidades."
        difficulty="intermediario"
        timeToRead="10 min"
      >
        <AlertBox type="info" title="O Google do pentest">
          Maltego transforma dados OSINT em grafos visuais que revelam relações ocultas.
          Excelente para investigar empresas, pessoas e infraestrutura.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Já no Kali Linux\nmaltego\n\n# Ou baixar de: https://www.maltego.com/downloads/\n\n# Conta necessária (gratuita):\n# Registrar em: https://www.maltego.com/ce-registration/\n# Maltego CE = versão gratuita (Community Edition)'} />

        <h2>Conceitos Fundamentais</h2>
        <CodeBlock language="bash" code={'# Entidades: elementos OSINT (domínio, IP, e-mail, pessoa, etc.)\n# Transforms: ações que conectam entidades\n# Grafo: visualização das conexões\n\n# Fluxo típico:\n# 1. Arrastar entidade "Domain" para o grafo\n# 2. Digitar: empresa.com.br\n# 3. Clicar com botão direito → Run Transform\n# 4. Escolher: To DNS Name (subdomínios)\n# 5. Escolher: To IP Address\n# 6. Em IPs: Run Transform → To AS Number\n# 7. Ir expandindo o grafo...'} />

        <h2>Transforms Principais</h2>
        <CodeBlock language="bash" code={'# Para Domain (domínio):\n# - To DNS Name (subdomínios)\n# - To IP Address (IPs do domínio)\n# - To Email Address (e-mails encontrados)\n# - To Netblock (bloco de IPs)\n# - To Website (sites relacionados)\n\n# Para Person (pessoa):\n# - To Email Address\n# - To Phone Number\n# - To Social Network Profile\n# - To Alias\n\n# Para IP Address:\n# - To Netblock\n# - To AS Number\n# - To DNS Name (PTR)\n# - To Organization'} />

        <h2>Maltego CE vs Pro</h2>
        <CodeBlock language="bash" code={'# CE (gratuito):\n# - Máximo 12 entidades por transform\n# - Salvar grafos\n# - Transforms básicos\n\n# Pro (pago):\n# - Entidades ilimitadas\n# - Transforms premium (Shodan, VirusTotal, Have I Been Pwned)\n# - API integrations\n\n# Alternativas gratuitas para visualização:\n# Gephi (grafo genérico)\n# SpiderFoot (OSINT automatizado com visualização)\n\n# SpiderFoot\npip3 install spiderfoot\nspiderfoot -l 127.0.0.1:5001\n# Acessar: http://localhost:5001'} />

        <AlertBox type="success" title="SpiderFoot — alternativa gratuita e poderosa">
          SpiderFoot (https://github.com/smicallef/spiderfoot) oferece OSINT automatizado similar
          ao Maltego, completamente gratuito, com interface web e 200+ módulos de coleta.
        </AlertBox>
      </PageContainer>
    );
  }
  