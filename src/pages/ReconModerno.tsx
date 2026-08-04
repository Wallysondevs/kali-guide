import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ReconModerno() {
  return (
    <PageContainer
      title="Recon moderno — subfinder → httpx → katana → nuclei"
      subtitle="A pipeline da ProjectDiscovery: da descoberta de subdomínios até o scan de vulnerabilidades, tudo encadeado"
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>A ideia: recon como esteira</h2>
      <p>
        Recon moderno não é rodar uma ferramenta — é uma
        <strong> esteira</strong> onde a saída de cada passo alimenta o
        próximo. Você descobre <em>subdomínios</em>, filtra os que estão
        <em> vivos</em>, <em>rastreia</em> URLs e endpoints e só então
        <em> escaneia</em>. Tudo texto puro, um por linha, encaixável com pipe.
      </p>
      <OutputBlock type="info" label="A pipeline em uma linha mental">
        <p><strong>subfinder</strong> → quais subdomínios existem?</p>
        <p><strong>httpx</strong> → quais respondem HTTP/HTTPS?</p>
        <p><strong>katana</strong> → quais URLs e endpoints eles expõem?</p>
        <p><strong>nuclei</strong> → algum é vulnerável?</p>
      </OutputBlock>
      <AlertBox type="warning" title="Escopo sempre">
        Recon já gera tráfego e já é detectável. Só rode contra domínios que
        você possui ou que estão no escopo escrito de um bug bounty/contrato.
      </AlertBox>

      <h2>1. Instalação do arsenal</h2>
      <CommandTable
        title="Ferramentas ProjectDiscovery (via Go)"
        variations={[
          { cmd: "go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest", desc: "Descoberta passiva de subdomínios" },
          { cmd: "go install github.com/projectdiscovery/httpx/cmd/httpx@latest", desc: "Probe HTTP rápido" },
          { cmd: "go install github.com/projectdiscovery/katana/cmd/katana@latest", desc: "Crawler moderno" },
          { cmd: "go install github.com/projectdiscovery/dnsx/cmd/dnsx@latest", desc: "Resolução/brute DNS" },
          { cmd: "go install github.com/tomnomnom/anew@latest", desc: "Anexa só linhas novas a um arquivo (dedup incremental)" },
        ]}
      />
      <AlertBox type="info" title="subfinder rende mais com API keys">
        Coloque chaves (Shodan, Censys, VirusTotal, SecurityTrails...) em
        <code> ~/.config/subfinder/provider-config.yaml</code>. Sem elas ele
        funciona, mas encontra bem menos.
      </AlertBox>

      <h2>2. subfinder — achar subdomínios</h2>
      <CommandTable
        title="Uso"
        variations={[
          { cmd: "subfinder -d alvo.com -silent", desc: "Só os subdomínios, limpo para pipe" },
          { cmd: "subfinder -d alvo.com -all -o subs.txt", desc: "Todas as fontes; salva em arquivo" },
          { cmd: "subfinder -dL dominios.txt -silent", desc: "Vários domínios de uma lista" },
          { cmd: "subfinder -d alvo.com -recursive", desc: "Recursivo em subdomínios que rendem mais" },
        ]}
      />
      <Terminal
        path="~/recon"
        lines={[
          { comment: "descoberta passiva", cmd: "subfinder -d alvo.com -silent | tee subs.txt | wc -l", out: "api.alvo.com\ndev.alvo.com\nvpn.alvo.com\n...\n147", outType: "muted" },
        ]}
      />

      <h2>3. httpx — quem está vivo</h2>
      <p>
        Nem todo subdomínio responde. O <strong>httpx</strong> testa cada um e
        ainda enriquece com status, título, tecnologia e redirecionamento.
      </p>
      <CommandTable
        title="Flags úteis"
        variations={[
          { cmd: "httpx -silent", desc: "Só as URLs vivas (para pipe)" },
          { cmd: "httpx -sc -title -tech-detect", desc: "Status code, título e tecnologia detectada" },
          { cmd: "httpx -mc 200,401,403", desc: "Só mantém esses status (match-code)" },
          { cmd: "httpx -ip -cdn", desc: "Mostra IP e marca se está atrás de CDN" },
        ]}
      />
      <Terminal
        path="~/recon"
        lines={[
          { comment: "filtra vivos + info", cmd: "cat subs.txt | httpx -silent -sc -title -tech-detect", out: "https://api.alvo.com [200] [API v2] [nginx]\nhttps://dev.alvo.com [401] [Login] [Apache]", outType: "warning" },
        ]}
      />

      <h2>4. katana — rastrear URLs</h2>
      <p>
        O <strong>katana</strong> navega os hosts vivos e extrai URLs,
        parâmetros, endpoints de JavaScript e formulários — exatamente o que
        alimenta um bom scan depois.
      </p>
      <CommandTable
        title="Modos"
        variations={[
          { cmd: "katana -u https://alvo.com -silent", desc: "Crawl padrão" },
          { cmd: "katana -u https://alvo.com -jc", desc: "Faz parsing de JS (js-crawl) para achar endpoints escondidos" },
          { cmd: "katana -u https://alvo.com -d 3", desc: "Profundidade de crawl = 3" },
          { cmd: "katana -list vivos.txt -kf all -silent", desc: "Usa known-files (robots.txt, sitemap) e uma lista de hosts" },
        ]}
      />

      <h2>5. A pipeline completa</h2>
      <PracticeBox
        title="Da raiz ao achado, encadeado"
        goal="Uma linha que vai de subdomínio a vulnerabilidade"
        command={`subfinder -d alvo.com -silent \\
  | httpx -silent \\
  | katana -silent -jc \\
  | nuclei -s critical,high -rl 100 -o achados.txt`}
        expected="achados.txt com os problemas críticos/altos dos endpoints rastreados"
        verify="Cada linha traz template-id, severidade e a URL exata"
      />
      <AlertBox type="info" title="Separe as etapas em campanhas reais">
        Em alvos grandes, salve a saída de cada passo em arquivo (com
        <code> anew</code>) em vez de um pipe único. Assim você reprocessa sem
        refazer tudo e monitora o crescimento da superfície.
      </AlertBox>
      <CodeBlock
        language="bash"
        code={`# versao por etapas, incremental e re-executável
subfinder -d alvo.com -silent | anew subs.txt
cat subs.txt | httpx -silent | anew vivos.txt
cat vivos.txt | katana -silent -jc | anew urls.txt
cat urls.txt | nuclei -s critical,high -o achados.txt`}
      />

      <h2>6. Extras que valem ouro</h2>
      <OutputBlock type="muted" label="Para ampliar a superfície">
        <p><strong>gau / waybackurls</strong> — puxam URLs históricas do Wayback e de outras fontes.</p>
        <p><strong>dnsx</strong> — resolve em massa e faz brute de subdomínio com wordlist.</p>
        <p><strong>naabu</strong> — port scan rápido antes do httpx quando quer portas fora de 80/443.</p>
        <p><strong>notify</strong> — manda os achados para Slack/Discord/Telegram automaticamente.</p>
      </OutputBlock>
      <Terminal
        path="~/recon"
        lines={[
          { comment: "portas fora do comum antes do httpx", cmd: "naabu -host alvo.com -top-ports 1000 -silent | httpx -silent", out: "http://alvo.com:8080\nhttps://alvo.com:8443", outType: "muted" },
        ]}
      />

      <h2>Boas práticas</h2>
      <OutputBlock type="success" label="Recon que rende">
        <p><strong>Comece passivo</strong> (subfinder, gau) antes de tocar no alvo ativamente.</p>
        <p><strong>Use anew</strong> para acompanhar o que é novo entre campanhas — subdomínio novo é alvo quente.</p>
        <p><strong>Respeite rate limit</strong> no httpx/nuclei para não ser bloqueado nem derrubar nada.</p>
        <p><strong>Guarde tudo datado</strong>; recon é contínuo, não um evento único.</p>
        <p><strong>Valide na mão</strong> os achados do nuclei antes de reportar.</p>
      </OutputBlock>
    </PageContainer>
  );
}
