import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function OSINT() {
    return (
      <PageContainer
        title="OSINT — Inteligência de Fonte Aberta"
        subtitle="Colete informações públicas sobre alvos de forma legal, antes de qualquer teste de penetração."
        difficulty="intermediario"
        timeToRead="14 min"
      >
        <AlertBox type="info" title="OSINT é legal — se feito corretamente">
          OSINT (Open Source Intelligence) usa apenas informações publicamente disponíveis.
          Não envolve acesso não autorizado. É a fase de reconhecimento passivo em qualquer pentest profissional.
        </AlertBox>

        <h2>O que é OSINT?</h2>
        <p>
          OSINT é a arte de coletar, analisar e correlacionar informações públicas sobre um alvo —
          empresa, domínio, pessoa ou sistema — sem interagir diretamente com ele.
          Antes de qualquer ataque ativo, um pentester profissional passa horas (ou dias) em OSINT.
        </p>

        <h2>Fases do OSINT no Pentest</h2>
        <CodeBlock language="bash" code={'# Fase 1 — Definir o escopo\n# O que você quer descobrir?\n# - Endereços de e-mail dos funcionários?\n# - Subdomínios da empresa?\n# - Tecnologias usadas no site?\n# - Histórico de vazamentos?\n\n# Fase 2 — Coleta passiva (sem contato direto)\n# Motores de busca, WHOIS, Shodan, redes sociais\n\n# Fase 3 — Análise e correlação\n# Cruzar dados para montar o mapa do alvo\n\n# Fase 4 — Documentação\n# Registrar tudo antes de avançar para reconhecimento ativo'} />

        <h2>WHOIS — Quem registrou o domínio?</h2>
        <CodeBlock language="bash" code={'whois exemplo.com.br\nwhois 192.168.1.1\n\n# Alternativa online: https://registro.br/cgi-bin/whois/\n\n# Buscar informações de ASN (Autonomous System Number)\nwhois -h whois.radb.net AS1234'} />

        <h2>DNS Recon Manual</h2>
        <CodeBlock language="bash" code={'# Registros básicos\ndig exemplo.com ANY\ndig exemplo.com MX\ndig exemplo.com NS\ndig exemplo.com TXT\n\n# Resolver IP de subdomínio\nnslookup mail.exemplo.com\nhost -a exemplo.com\n\n# Zone Transfer (se mal configurado, revela todos os subdomínios)\ndig @ns1.exemplo.com exemplo.com AXFR\n\n# Descoberta de subdomínios com subfinder (instalar se não tiver)\nsubfinder -d exemplo.com -o subdomains.txt\n\n# Amass — reconhecimento passivo e ativo\namass enum -passive -d exemplo.com\namass enum -active -d exemplo.com -o amass_output.txt'} />

        <h2>Pesquisa por E-mails</h2>
        <CodeBlock language="bash" code={'# TheHarvester (ver página dedicada)\ntheHarvester -d exemplo.com -b all\n\n# Hunter.io (API gratuita)\ncurl "https://api.hunter.io/v2/domain-search?domain=exemplo.com&api_key=SUA_CHAVE"\n\n# Verificar vazamentos de e-mail\ncurl "https://haveibeenpwned.com/api/v3/breachedaccount/email@exemplo.com" \\\n  -H "hibp-api-key: SUA_CHAVE"'} />

        <h2>Redes Sociais e LinkedIn</h2>
        <CodeBlock language="bash" code={'# Busca no Google por funcionários da empresa\n# site:linkedin.com "Exemplo SA" "engenheiro"\n\n# Maltego (ver página dedicada)\n# Reconhecimento visual de relações entre entidades\n\n# Instagram / Twitter scraping (legal com APIs públicas)\n# Verificar nomes de usuário, localização, padrões de senha\n\n# Sherlock — buscar username em 300+ plataformas\npip3 install sherlock-project\nsherlock nomeusuario\nsherlock --timeout 10 nomeusuario -o resultados.txt'} />

        <h2>Metadados de Arquivos</h2>
        <CodeBlock language="bash" code={'# exiftool — extrair metadados de imagens, PDFs, documentos\nsudo apt install exiftool\n\n# Analisar arquivo local\nexiftool documento.pdf\nexiftool foto.jpg\n\n# Baixar PDFs do site e analisar em lote\nwget -r -l 1 -A pdf https://www.exemplo.com/docs/\nexiftool *.pdf | grep -i "author\\|creator\\|producer\\|company"\n\n# Metadados podem revelar:\n# - Nome de usuário do sistema operacional\n# - Software usado (e versão)\n# - Localização GPS de fotos'} />

        <h2>Vazamentos de Dados (Breach Data)</h2>
        <CodeBlock language="bash" code={'# Have I Been Pwned — verificar e-mails vazados\ncurl "https://haveibeenpwned.com/api/v3/breachedaccount/usuario@exemplo.com"\n\n# DeHashed — busca em banco de dados de vazamentos\n# https://www.dehashed.com/ (requer conta)\n\n# Pastebin e sites similares\n# Buscar: "exemplo.com" site:pastebin.com\n\n# Ferramentas de CLI\npip3 install h8mail\nh8mail -t email@alvo.com'} />

        <AlertBox type="success" title="Dica profissional">
          Crie um mapa mental do alvo à medida que coleta informações. Ferramentas como CherryTree,
          Obsidian ou até papel e caneta ajudam a correlacionar dados. Um bom OSINT pode revelar
          funcionários com senhas vazadas, servidores esquecidos e muito mais — sem nenhuma interação direta.
        </AlertBox>

        <h2>Ferramentas OSINT no Kali</h2>
        <CodeBlock language="bash" code={'# Verificar o que já está instalado\nkali-tools-information-gathering\n\n# Principais ferramentas disponíveis:\n# theHarvester     — e-mails, subdomínios, IPs\n# maltego          — reconhecimento visual/gráfico\n# recon-ng         — framework modular de OSINT\n# shodan           — busca em dispositivos conectados\n# whois            — informações de registro\n# dnsenum/dnsrecon — enumeração de DNS\n# subfinder/amass  — descoberta de subdomínios\n# exiftool         — metadados de arquivos\n# metagoofil       — metadados de docs públicos'} />
      </PageContainer>
    );
  }
  