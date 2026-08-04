import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Nuclei() {
  return (
    <PageContainer
      title="Nuclei — scanner de vulnerabilidades por templates"
      subtitle="Instalação, execução, filtros por severidade/tag, workflows e como escrever seu próprio template YAML"
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>O que é o Nuclei</h2>
      <p>
        O <strong>Nuclei</strong> (ProjectDiscovery) é um scanner rápido e
        baseado em <strong>templates YAML</strong>. Em vez de lógica
        engessada, cada checagem é um arquivo que descreve a request e como
        reconhecer a resposta vulnerável. São milhares de templates da
        comunidade — CVEs, exposições, más configurações, tomadas de conta.
      </p>
      <AlertBox type="warning" title="Só no que você tem permissão">
        Nuclei dispara centenas de requests com payloads reais. Rode apenas
        contra alvos autorizados (seu lab, bug bounty no escopo, cliente com
        contrato). Fora disso é crime.
      </AlertBox>

      <h2>1. Instalação e atualização</h2>
      <CommandTable
        title="Setup"
        variations={[
          { cmd: "sudo apt install nuclei", desc: "Vem no Kali; simples mas pode estar atrasado" },
          { cmd: "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest", desc: "Última versão (recomendado); precisa do Go" },
          { cmd: "nuclei -update", desc: "Atualiza o binário" },
          { cmd: "nuclei -update-templates", desc: "Baixa/atualiza os templates da comunidade (~/.local/nuclei-templates)" },
        ]}
      />
      <Terminal
        path="~"
        lines={[
          { comment: "primeira coisa: atualizar templates", cmd: "nuclei -update-templates", out: "[INF] Successfully downloaded nuclei-templates (v10.x). GitHub repository at ~/.local/nuclei-templates", outType: "success" },
        ]}
      />

      <h2>2. Primeiro scan</h2>
      <p>O uso básico é apontar para um alvo. O Nuclei escolhe os templates automaticamente.</p>
      <CommandTable
        title="Execução básica"
        variations={[
          { cmd: "nuclei -u https://alvo.com", desc: "Escaneia um único alvo com todos os templates" },
          { cmd: "nuclei -l hosts.txt", desc: "Lista de alvos (um por linha)" },
          { cmd: "nuclei -u https://alvo.com -o resultado.txt", desc: "Salva a saída em arquivo" },
          { cmd: "nuclei -u https://alvo.com -j -o out.json", desc: "Saída JSON (para parsear depois)" },
        ]}
      />
      <Terminal
        path="~"
        lines={[
          { comment: "scan simples", cmd: "nuclei -u https://alvo.com", out: "[INF] Templates loaded: 8500\n[tech-detect] [http] [info] https://alvo.com [nginx]\n[CVE-2021-44228] [http] [critical] https://alvo.com/api [log4j]\n[git-config] [http] [medium] https://alvo.com/.git/config", outType: "warning" },
        ]}
      />

      <h2>3. Filtrar o que roda</h2>
      <p>
        Rodar tudo é barulhento e lento. Filtre por <strong>severidade</strong>,
        <strong> tag</strong> ou caminho de template para mirar o que importa.
      </p>
      <CommandTable
        title="Filtros"
        variations={[
          { cmd: "nuclei -u <alvo> -s critical,high", desc: "Só severidade crítica e alta" },
          { cmd: "nuclei -u <alvo> -tags cve,rce", desc: "Só templates com essas tags" },
          { cmd: "nuclei -u <alvo> -t http/cves/2024/", desc: "Só os templates dessa pasta" },
          { cmd: "nuclei -u <alvo> -et http/fuzzing/", desc: "Exclui uma pasta (-et = exclude-templates)" },
          { cmd: "nuclei -u <alvo> -id CVE-2021-44228", desc: "Roda um template específico pelo id" },
        ]}
      />
      <OutputBlock type="info" label="Níveis de severidade">
        <p><code>info</code> — detecção de tecnologia, banners (ruído)</p>
        <p><code>low / medium</code> — exposições, más configs</p>
        <p><code>high / critical</code> — RCE, SQLi, tomada de conta: comece por aqui</p>
      </OutputBlock>

      <h2>4. Controle de velocidade</h2>
      <p>Para não derrubar o alvo (nem ser bloqueado), ajuste concorrência e taxa.</p>
      <CommandTable
        title="Rate limiting"
        variations={[
          { cmd: "-rl 150", desc: "rate-limit: máx. de requests por segundo (padrão 150)" },
          { cmd: "-c 25", desc: "concurrency: templates rodando em paralelo" },
          { cmd: "-bs 25", desc: "bulk-size: alvos processados por template ao mesmo tempo" },
          { cmd: "-timeout 10", desc: "timeout por request em segundos" },
          { cmd: "-retries 2", desc: "tentativas em caso de falha de rede" },
        ]}
      />

      <h2>5. Anatomia de um template</h2>
      <p>
        Entender o YAML deixa você ler, ajustar e escrever checagens. Um
        template tem <strong>id</strong>, <strong>info</strong> (metadados) e um
        bloco de protocolo (<code>http</code>, <code>dns</code>,
        <code>tcp</code>...) com os <strong>matchers</strong>.
      </p>
      <CodeBlock
        language="yaml"
        code={`id: exemplo-arquivo-exposto

info:
  name: .env exposto
  author: voce
  severity: high
  tags: exposure,config

http:
  - method: GET
    path:
      - "{{BaseURL}}/.env"
    matchers-condition: and
    matchers:
      - type: word          # a resposta contem essas palavras?
        words:
          - "DB_PASSWORD"
          - "APP_KEY"
        condition: or
      - type: status         # e o status e 200?
        status:
          - 200`}
      />
      <AlertBox type="info" title="Matchers e extractors">
        <strong>Matchers</strong> decidem se é vulnerável (word, regex, status,
        binary, dsl). <strong>Extractors</strong> puxam dados da resposta (uma
        versão, um token) para o relatório. <code>matchers-condition: and</code>
        exige que todos batam.
      </AlertBox>

      <h2>6. Escreva e teste seu template</h2>
      <PracticeBox
        title="Template custom do zero"
        goal="Detectar um endpoint sensível específico do seu alvo"
        command={`# 1. salve o YAML acima em meu-template.yaml
# 2. valide a sintaxe
nuclei -t meu-template.yaml -validate
# 3. rode só ele contra o lab
nuclei -u http://alvo-lab.local -t meu-template.yaml -v
# 4. debug: veja request/response cruas
nuclei -u http://alvo-lab.local -t meu-template.yaml -debug`}
        expected="[exemplo-arquivo-exposto] [high] http://alvo-lab.local/.env"
        verify="Confirme manualmente com curl que o arquivo realmente vaza segredos"
      />

      <h2>7. No pipeline de recon</h2>
      <p>
        O maior poder do Nuclei aparece encadeado após a descoberta de hosts.
        Fluxo clássico da ProjectDiscovery:
      </p>
      <PracticeBox
        title="subfinder → httpx → nuclei"
        goal="Achar subdomínios vivos e escanear todos de uma vez"
        command={`subfinder -d alvo.com -silent \\
  | httpx -silent \\
  | nuclei -s critical,high -rl 100 -o achados.txt`}
        expected="Lista consolidada só com achados críticos/altos dos hosts vivos"
        verify="Cada linha em achados.txt deve ter template-id, severidade e URL"
      />
      <AlertBox type="info" title="Workflows">
        Com <code>-w workflow.yaml</code> você encadeia templates
        condicionalmente: só roda os templates de WordPress <em>se</em> a
        detecção de tecnologia achar WordPress. Menos ruído, mais foco.
      </AlertBox>

      <h2>8. Boas práticas</h2>
      <OutputBlock type="success" label="Rodar bem">
        <p><strong>Atualize os templates</strong> antes de cada campanha.</p>
        <p><strong>Comece por critical,high</strong> e só depois desça a severidade.</p>
        <p><strong>Respeite o rate limit</strong> — alvos em produção caem fácil.</p>
        <p><strong>Valide na mão</strong> — Nuclei aponta, você confirma. Falso positivo existe.</p>
        <p><strong>Use -j / JSON</strong> para integrar com seu fluxo e evitar retrabalho.</p>
      </OutputBlock>
      <AlertBox type="danger" title="Lado defensivo">
        Times de defesa também usam Nuclei: rode contra a própria superfície
        exposta em CI/CD para pegar CVE e vazamento de config antes do atacante.
      </AlertBox>
    </PageContainer>
  );
}
