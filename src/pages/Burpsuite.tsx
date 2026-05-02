import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Burpsuite() {
  return (
    <PageContainer
      title="Burp Suite — Proxy de interceptação"
      subtitle="A Suíça do pentest web: proxy, repeater, intruder, scanner. Community e Pro."
      difficulty="iniciante"
      timeToRead="22 min"
      prompt="web/burp"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y burpsuite",
            out: "(já vem no kali-tools-web)",
            outType: "muted",
          },
          {
            cmd: "burpsuite &",
            out: `(abre interface gráfica. selecione "Temporary project" → "Use Burp defaults" → Start Burp)`,
            outType: "info",
          },
        ]}
      />

      <h2>Configurar o navegador</h2>
      <p>
        O Burp por padrão escuta em <code>127.0.0.1:8080</code>. O navegador precisa enviar
        o tráfego HTTP/HTTPS para lá. Há 3 formas:
      </p>

      <CommandTable
        title="Conectar browser ao Burp"
        variations={[
          { cmd: "Burp Browser embutido", desc: "Botão 'Open Browser' na aba Proxy → Intercept.", output: "Já configurado, sem CA pra instalar. RECOMENDADO." },
          { cmd: "Firefox + FoxyProxy", desc: "Extensão FoxyProxy → 127.0.0.1:8080 (HTTP+HTTPS).", output: "Toggle on/off rápido." },
          { cmd: "Chrome + system proxy", desc: "Setup proxy no SO (Settings → Network).", output: "Afeta TODO tráfego (cuidado)." },
        ]}
      />

      <h3>Instalar a CA do Burp (para HTTPS)</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) com Burp aberto, baixe a CA",
            cmd: "curl -x http://127.0.0.1:8080 http://burp/cert -o burp.der",
            out: "(silencioso. salva o certificado em burp.der)",
            outType: "info",
          },
          {
            cmd: "openssl x509 -inform DER -in burp.der -out burp.pem",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "2) instale no Firefox: Settings → Privacy → Certificates → Import → marque 'identify websites'",
            cmd: "(no firefox)",
            out: "(faça pelo GUI)",
            outType: "muted",
          },
          {
            comment: "ou via certutil para perfil",
            cmd: "certutil -A -n 'Burp CA' -t 'TC,,' -i burp.pem -d sql:$HOME/.mozilla/firefox/*.default-release/",
            out: "",
            outType: "default",
          },
        ]}
      />

      <h2>Tabs principais</h2>
      <CommandTable
        title="As 8 tabs que importam"
        variations={[
          { cmd: "Proxy", desc: "Intercepta requests/responses em tempo real.", output: "Onde tudo começa." },
          { cmd: "Target → Site map", desc: "Árvore do que foi visto + filtros (in scope only).", output: "Rg em request/response." },
          { cmd: "Target → Scope", desc: "Define quais hosts você vai testar.", output: "Mantém Burp focado." },
          { cmd: "Repeater", desc: "Edita 1 request e re-envia N vezes.", output: "Onde 80% do trabalho manual acontece." },
          { cmd: "Intruder", desc: "Fuzzing automatizado de parâmetros.", output: "Pro = sem rate limit. CE = lento." },
          { cmd: "Decoder", desc: "Encode/decode (base64, URL, hex, HTML).", output: "Útil para payloads." },
          { cmd: "Comparer", desc: "Diff word/byte entre 2 responses.", output: "Diferenciar 'usuário existe' de 'não existe'." },
          { cmd: "Logger", desc: "Histórico completo (todos os tools).", output: "Auditoria de tudo que Burp viu." },
          { cmd: "Extender / BApp Store", desc: "Plugins (Pro).", output: "Active Scan++, Authorize, Logger++..." },
        ]}
      />

      <h2>Workflow básico</h2>

      <h3>1. Definir Scope</h3>
      <p>
        Sem scope, o Burp captura ruído de toda a internet (ads, telemetria). Vá em{" "}
        <strong>Target → Scope → Add</strong> e coloque o(s) host(s) do alvo. Marque{" "}
        "Show only in-scope items" no Site map e Proxy History.
      </p>

      <h3>2. Crawl manual</h3>
      <p>Navegue MANUALMENTE pelo site com proxy ligado. Login, formulários, downloads, qualquer ação que dispare request. O Burp vai populando o Site map.</p>

      <h3>3. Mande requests interessantes para Repeater</h3>
      <p>Botão direito em qualquer request → <strong>Send to Repeater</strong>. Lá você edita e re-envia.</p>

      <h2>Repeater — exemplo prático</h2>
      <OutputBlock label="Request original capturado" type="default">
{`POST /api/profile HTTP/2
Host: app.local
Cookie: session=eyJ1c2VyX2lkIjogOTl9
Content-Type: application/json
Content-Length: 42

{"id": 99, "email": "wallyson@me.com"}`}
      </OutputBlock>

      <p>No Repeater, troque o ID:</p>

      <OutputBlock label="Request modificado (IDOR test)" type="warning">
{`POST /api/profile HTTP/2
Host: app.local
Cookie: session=eyJ1c2VyX2lkIjogOTl9
Content-Type: application/json
Content-Length: 43

{"id": 100, "email": "wallyson@me.com"}    ← id de outro user`}
      </OutputBlock>

      <OutputBlock label="Response — atualizou o email do usuário 100!" type="error">
{`HTTP/2 200 OK
Content-Type: application/json
Content-Length: 73

{"updated": true, "user_id": 100, "email": "wallyson@me.com"}`}
      </OutputBlock>

      <h2>Intruder — fuzzing automatizado</h2>

      <h3>Modos de attack</h3>
      <CommandTable
        title="Os 4 attack types"
        variations={[
          { cmd: "Sniper", desc: "1 payload set, varia 1 posição por vez.", output: "Para fuzzing de 1 parâmetro." },
          { cmd: "Battering ram", desc: "1 payload set, varia TODAS as posições com mesmo valor.", output: "Para casar user==password." },
          { cmd: "Pitchfork", desc: "N payload sets paralelos (1:1).", output: "Para user+password de listas casadas." },
          { cmd: "Cluster bomb", desc: "N payload sets em produto cartesiano.", output: "Para user × password (todas combinações)." },
        ]}
      />

      <h3>Exemplo: brute force em formulário</h3>
      <OutputBlock label="Request → Send to Intruder. Marque entre §...§ os pontos a fuzzar." type="info">
{`POST /login HTTP/2
Host: app.local
Content-Type: application/x-www-form-urlencoded

username=§admin§&password=§password§`}
      </OutputBlock>

      <p>
        Attack type = <strong>Cluster bomb</strong>. Position 1 (username) = lista de
        usuários; Position 2 (password) = rockyou. Start Attack.
      </p>

      <OutputBlock label="resultado: ordene por Length da response" type="success">
{`#  | Status | Length | Username | Password
1  | 200    | 1421   | admin    | 123456     ← length diferente — login OK
2  | 200    | 1142   | admin    | password
3  | 200    | 1142   | admin    | qwerty
4  | 200    | 1142   | jsmith   | 123456
5  | 200    | 1421   | jsmith   | jsmith2024 ← outro hit
[...]`}
      </OutputBlock>

      <h2>Match and Replace global</h2>
      <CodeBlock
        language="text"
        title="Proxy → Options → Match and Replace"
        code={`# Trocar User-Agent em todo request
Match:    ^User-Agent:.*$
Replace:  User-Agent: Mozilla/5.0 (Burp) PenTesterBot/1.0
Type:     Request header

# Tirar header de CSP da response (para testar XSS sem CSP atrapalhar)
Match:    ^Content-Security-Policy:.*$
Replace:  X-Was-CSP: (removed by burp)
Type:     Response header

# Remover X-Frame-Options para testar clickjacking
Match:    ^X-Frame-Options:.*$
Replace:  X-Was-XFO: (removed by burp)
Type:     Response header`}
      />

      <h2>Decoder — encode/decode</h2>
      <CommandTable
        title="Operações úteis"
        variations={[
          { cmd: "Base64", desc: "Decodar Authorization: Basic.", output: "YWRtaW46cGFzc3dvcmQ= → admin:password" },
          { cmd: "URL", desc: "%20%2F → espaço/.", output: "Útil em payload de SQLi." },
          { cmd: "HTML", desc: "&lt;script&gt; ↔ <script>.", output: "Para XSS." },
          { cmd: "Hex", desc: "0x41 ↔ A.", output: "Manipulação binária." },
          { cmd: "Hash → MD5/SHA1/SHA256", desc: "Calcula hash.", output: "Útil para forjar tokens." },
          { cmd: "Smart decode", desc: "Tenta detectar e decodar em camadas.", output: "Quando vc não sabe o que é." },
        ]}
      />

      <h2>Comparer</h2>
      <p>
        Útil para descobrir se um endpoint distingue "usuário existe" de "usuário não existe".
        Mande 2 responses para Comparer → "Words" → o que diferir é o sinal.
      </p>

      <h2>BApps essenciais (Pro)</h2>
      <CommandTable
        title="Plugins do BApp Store"
        variations={[
          { cmd: "Active Scan++", desc: "Mais checks no Active Scan (CRLF, host injection, SSRF).", output: "Free, instala em 1 click." },
          { cmd: "Logger++", desc: "Log persistente, busca avançada, filtros, export.", output: "Indispensável." },
          { cmd: "Authorize", desc: "Testa Broken Access Control automaticamente.", output: "Compara request com/sem cookie." },
          { cmd: "Param Miner", desc: "Descobre parâmetros HTTP escondidos (cache poisoning, hidden inputs).", output: "Famoso pelo achado de Web Cache Deception." },
          { cmd: "Turbo Intruder", desc: "Intruder Python, com 30000+ req/s.", output: "Race conditions." },
          { cmd: "JWT Editor", desc: "Edita/assina JWT direto no Repeater.", output: "Crítico para APIs com JWT." },
          { cmd: "GraphQL Raider", desc: "Suporte a GraphQL (introspection, mutations).", output: "Essencial em APIs GraphQL." },
          { cmd: "Reflector", desc: "Detecta inputs refletidos em response.", output: "Sinaliza candidatos a XSS." },
        ]}
      />

      <h2>burpcommander / Pro CLI</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Burp Pro pode rodar headless (sem GUI) para CI/CD",
            cmd: 'java -jar -Xmx4g burpsuite_pro.jar --project-file=projeto.burp --config-file=config.json --user-config-file=user.json --unpause-spider-and-scanner',
            out: "(roda em background, scan agendado)",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Capture o login do PortSwigger Web Security Academy"
        goal="Praticar interceptação, repeater, encoder e match/replace em laboratório legal."
        steps={[
          "Crie conta gratuita em portswigger.net/web-security.",
          "Abra o lab 'Username enumeration via different responses'.",
          "Configure o Burp Browser e ative interceptação.",
          "Capture o request POST /login.",
          "Mande para Intruder, ataque Cluster bomb com lista candidatos × senhas.",
          "Identifique o usuário válido pela diferença de response Length.",
          "Repita ataque agora com o usuário válido para achar a senha.",
        ]}
        command={`# Tudo é GUI, mas o equivalente em curl seria:
for U in $(cat candidate-usernames.txt); do
  R=$(curl -s -o /dev/null -w '%{size_download}' -X POST \\
       https://lab.web-security-academy.net/login \\
       -d "username=$U&password=invalid")
  echo "$U $R"
done | sort -k2 -n | head -5
# o usuário válido geralmente tem response com tamanho DIFERENTE`}
        expected={`(no Intruder, o status code ou length difere para 1 usuário no meio da lista
 — esse é o usuário válido)`}
        verify="Após achar o usuário, refaça o ataque variando só a senha — uma deve ter resposta 302 (login OK), as demais 200 (login falho)."
      />

      <AlertBox type="info" title="Burp CE vs Pro">
        <strong>Community</strong>: Repeater, Decoder, Comparer e Proxy completos.
        Intruder com rate-limit artificial e SEM Active Scanner.
        <br />
        <strong>Pro</strong> (US$ 449/ano): Intruder full-speed, Active/Passive Scanner,
        BApp Store completo, Project files persistentes, Search avançada.
      </AlertBox>

      <AlertBox type="warning" title="Cuidado com cookies de sessão real">
        Se você ativa o proxy e navega no seu Gmail, o Burp vê o cookie. Use sempre
        perfil dedicado de browser (ou o Burp Browser embutido) — nunca o seu perfil normal.
      </AlertBox>
    </PageContainer>
  );
}
