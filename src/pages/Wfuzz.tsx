import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Wfuzz() {
  return (
    <PageContainer
      title="Wfuzz e ffuf — fuzzing web em alta velocidade"
      subtitle="Substitua valores em qualquer parte da requisição (URL, header, body, cookie) por wordlist e filtre o ruído. ffuf é a alternativa Go moderna, mais rápida."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Wfuzz vs ffuf — qual usar</h2>
      <p>
        Ambos servem para o mesmo propósito: substituir uma <strong>keyword</strong>
        (por padrão <code>FUZZ</code>) em qualquer parte da requisição HTTP por
        cada linha de uma wordlist e filtrar o que importa.
      </p>
      <ul>
        <li><strong>wfuzz</strong> (Python) — sintaxe clássica, plugins ricos, mais lento, projeto com manutenção lenta.</li>
        <li><strong>ffuf</strong> (Go) — 5-10x mais rápido, output mais limpo, padrão de fato em CTF/HTB e bug bounty desde ~2020.</li>
      </ul>
      <p>Use ffuf por padrão. Wfuzz quando precisar de payload encoder específico ou compatibilidade com pipeline antigo.</p>

      <h2>Instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y wfuzz ffuf seclists",
            out: `wfuzz is already the newest version (3.1.0-3).
ffuf is already the newest version (2.1.0-2).
seclists is already the newest version (2024.3-1).`,
            outType: "success",
          },
          {
            cmd: "ls /usr/share/seclists/Discovery/Web-Content/ | head -10",
            out: `big.txt
common.txt
directory-list-2.3-medium.txt
directory-list-2.3-small.txt
quickhits.txt
raft-large-directories.txt
raft-large-files.txt
raft-medium-words.txt
raft-small-words.txt
RobotsDisallowed-Top1000.txt`,
            outType: "info",
          },
        ]}
      />

      <h2>Anatomia de uma requisição com FUZZ</h2>
      <p>
        A keyword <code>FUZZ</code> pode estar em <em>qualquer</em> parte:
      </p>
      <CodeBlock
        language="bash"
        title="onde colocar FUZZ"
        code={`# diretório
ffuf -u https://alvo.com/FUZZ        -w wordlist.txt

# extensão (com -e)
ffuf -u https://alvo.com/indexFUZZ   -w extensoes.txt

# parâmetro GET nome
ffuf -u 'https://alvo.com/api?FUZZ=test' -w params.txt

# parâmetro GET valor
ffuf -u 'https://alvo.com/api?id=FUZZ'   -w ids.txt

# subdomínio (vhost discovery)
ffuf -u https://alvo.com -H 'Host: FUZZ.alvo.com' -w subs.txt

# corpo POST (login bruteforce)
ffuf -u https://alvo.com/login -X POST \\
     -d 'user=admin&pass=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded' \\
     -w rockyou.txt

# header arbitrário
ffuf -u https://alvo.com/admin -H 'X-Forwarded-For: FUZZ' -w ips.txt

# múltiplas keywords (W1, W2 com -mode pitchfork ou clusterbomb)
ffuf -u 'https://alvo.com/W1?id=W2' -w users.txt:W1 -w ids.txt:W2 -mode clusterbomb`}
      />

      <h2>Directory bruteforce</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ffuf -u https://alvo.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -mc 200,301,302,403",
            out: `       /'___\\  /'___\\           /'___\\
      /\\ \\__/ /\\ \\__/  __  __  /\\ \\__/
      \\ \\ ,__\\\\ \\ ,__\\/\\ \\/\\ \\ \\ \\ ,__\\
       \\ \\ \\_/ \\ \\ \\_/\\ \\ \\_\\ \\ \\ \\ \\_/
        \\ \\_\\   \\ \\_\\  \\ \\____/  \\ \\_\\
         \\/_/    \\/_/   \\/___/    \\/_/
       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : https://alvo.com/FUZZ
 :: Wordlist         : FUZZ: raft-medium-directories.txt
 :: Matcher          : Response status: 200,301,302,403
________________________________________________

admin                   [Status: 301, Size: 178, Words: 7,  Lines: 8]
api                     [Status: 200, Size: 487, Words: 32, Lines: 19]
backup                  [Status: 403, Size: 277, Words: 20, Lines: 10]
images                  [Status: 301, Size: 178, Words: 7,  Lines: 8]
robots.txt              [Status: 200, Size: 142, Words: 11, Lines: 5]
:: Progress: [30000/30000] :: Job [1/1] :: 412 req/sec :: Errors: 0 ::`,
            outType: "success",
          },
        ]}
      />

      <h2>Filtros — sem eles você se afoga em 200</h2>
      <CommandTable
        title="matchers (-m*) e filters (-f*)"
        variations={[
          { cmd: "-mc 200,301", desc: "Match status code (mostra SÓ esses).", output: "Padrão = 200,204,301,302,307,401,403,405,500." },
          { cmd: "-fc 404", desc: "Filter status code (esconde 404).", output: "Combina com matchers." },
          { cmd: "-fs 1234", desc: "Filter size (esconde respostas com 1234 bytes — útil pra esconder soft-404).", output: "Use após observar tamanho da página falsa." },
          { cmd: "-fl 7", desc: "Filter lines (linhas).", output: "Soft-404 frequentemente tem N linhas fixas." },
          { cmd: "-fw 32", desc: "Filter words (palavras).", output: "Outra dimensão pra distinguir." },
          { cmd: "-mr 'admin|root'", desc: "Match regex no body.", output: "Mostra só responses que contém match." },
          { cmd: "-fr 'Not Found'", desc: "Filter regex.", output: "Esconde 'Not Found' textual." },
          { cmd: "-mt '<2000'", desc: "Match time response < 2000ms.", output: "Detectar timeout / blind injection." },
          { cmd: "-ms 100", desc: "Match size (oposto de -fs).", output: "Confirmar respostas idênticas (login válido vs inválido)." },
        ]}
      />

      <h2>Auto-calibração (anti soft-404)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ffuf testa caminhos garbage para entender a baseline e auto-filtra",
            cmd: "ffuf -u https://alvo.com/FUZZ -w common.txt -ac",
            out: `[Status: 200, Size: 4321, Words: 245, Lines: 90, Duration: 87ms]
:: Auto-calibration enabled (random seed)
:: 4 responses filtered (size: 4321)

admin                   [Status: 200, Size: 1287, Words: 78,  Lines: 22]
debug.php               [Status: 200, Size: 532,  Words: 41,  Lines: 18]
:: Progress: [4614/4614]`,
            outType: "warning",
          },
          {
            comment: "auto-cal hostname p/ vhost (basea numa palavra random)",
            cmd: "ffuf -u https://alvo.com -H 'Host: FUZZ.alvo.com' -w subs.txt -ac",
            out: `dev      [Status: 200, Size: 4287]
staging  [Status: 200, Size: 9821]
:: filtered baseline size 542`,
            outType: "info",
          },
        ]}
      />

      <h2>Recursão</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "encontrou /admin? entra automaticamente e fuzza /admin/FUZZ",
            cmd: "ffuf -u https://alvo.com/FUZZ -w common.txt -recursion -recursion-depth 2 -mc 200,301",
            out: `admin           [Status: 301]
api             [Status: 200]
[INFO] Adding new job to queue: https://alvo.com/admin/FUZZ
[INFO] Adding new job to queue: https://alvo.com/api/FUZZ

admin/login     [Status: 200]
admin/users     [Status: 200]
api/v1          [Status: 200]
api/swagger     [Status: 200]
[INFO] Adding new job: https://alvo.com/api/v1/FUZZ`,
            outType: "success",
          },
        ]}
      />

      <h2>Parameter discovery</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "wordlist Arjun ou Seclists/burp-parameter-names.txt",
            cmd: "ffuf -u 'https://alvo.com/page.php?FUZZ=test' -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -fs 4287",
            out: `debug                   [Status: 200, Size: 9821, Words: 412]
admin                   [Status: 200, Size: 5234, Words: 187]
file                    [Status: 200, Size: 7102, Words: 298]
:: Progress: [6453/6453]`,
            outType: "success",
          },
          {
            comment: "achou debug=test? testa valores",
            cmd: "ffuf -u 'https://alvo.com/page.php?debug=FUZZ' -w /usr/share/seclists/Fuzzing/special-chars.txt",
            out: `1            [Status: 200, Size: 18234]   # debug ligado, mais info!
true         [Status: 200, Size: 18234]
on           [Status: 200, Size: 18234]`,
            outType: "warning",
          },
        ]}
      />

      <h2>Vhost discovery</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ffuf -u https://192.0.2.10 -H 'Host: FUZZ.empresa.com' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -ac",
            out: `dev          [Status: 200, Size: 8421]
staging      [Status: 200, Size: 12087]
internal     [Status: 401, Size: 198]
admin-panel  [Status: 403, Size: 567]
:: filtered baseline size 322`,
            outType: "success",
          },
        ]}
      />

      <h2>Login bruteforce com filtro inteligente</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "primeiro: descobrir tamanho de uma resposta de senha errada",
            cmd: "curl -s -X POST https://alvo.com/login -d 'user=admin&pass=errada' | wc -c",
            out: "1247",
            outType: "info",
          },
          {
            comment: "fuzz filtrando esse tamanho",
            cmd: "ffuf -u https://alvo.com/login -X POST -d 'user=admin&pass=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded' -w rockyou.txt -fs 1247",
            out: `Welcome2024!         [Status: 302, Size: 0, Words: 0, Lines: 0]
:: Progress: [1284/14344386] :: 387 req/sec`,
            outType: "warning",
          },
        ]}
      />

      <h2>Wfuzz — sintaxe clássica</h2>
      <CodeBlock
        language="bash"
        title="wfuzz equivalents"
        code={`# diretório
wfuzz -c -z file,common.txt --hc 404 https://alvo.com/FUZZ

# parâmetro
wfuzz -c -z file,params.txt --hc 404 'https://alvo.com/page?FUZZ=test'

# encode payload em base64
wfuzz -c -z file,payloads.txt,base64 'https://alvo.com/?token=FUZZ'

# múltiplas wordlists (FUZZ, FUZ2Z, FUZ3Z)
wfuzz -c -z file,users.txt -z file,passwords.txt \\
      -d 'username=FUZZ&password=FUZ2Z' \\
      --hc 401 https://alvo.com/login

# hide responses with N words
wfuzz -c -z file,common.txt --hw 87 https://alvo.com/FUZZ

# baseline (BBB) — define um valor de referência
wfuzz -c -z file,subs.txt --hh BBB -H 'Host: FUZZ.alvo.com' https://alvo.com`}
      />

      <CommandTable
        title="wfuzz: flags úteis"
        variations={[
          { cmd: "-c", desc: "Output colorido.", output: "Sem isso é cinza chato." },
          { cmd: "-z file,WORDLIST", desc: "Define payload tipo file.", output: "Outros: range,1-100  / list,a-b-c  / stdin" },
          { cmd: "-z range,1-1000", desc: "Range numérico (IDs sequenciais).", output: "IDOR enumeration." },
          { cmd: "--hc 404,403", desc: "Hide codes.", output: "Esconde 404 e 403." },
          { cmd: "--hh 1247", desc: "Hide chars (size).", output: "Soft-404 filtering." },
          { cmd: "--hw 87", desc: "Hide words.", output: "Outra dimensão." },
          { cmd: "-t 50", desc: "Threads (cuidado com WAF).", output: "Padrão 10." },
          { cmd: "-p ip:port", desc: "Proxy (Burp).", output: "-p 127.0.0.1:8080" },
        ]}
      />

      <h2>Saídas estruturadas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ffuf -u https://alvo.com/FUZZ -w common.txt -mc 200 -of json -o results.json",
            out: "(silencioso, salva JSON estruturado)",
            outType: "muted",
          },
          {
            cmd: "jq '.results[] | {url, status, length}' results.json | head -20",
            out: `{"url":"https://alvo.com/admin","status":301,"length":178}
{"url":"https://alvo.com/api","status":200,"length":487}
{"url":"https://alvo.com/robots.txt","status":200,"length":142}`,
            outType: "info",
          },
          {
            comment: "formatos: json, csv, html, md, ejson",
            cmd: "ffuf -u https://alvo.com/FUZZ -w common.txt -of html -o report.html",
            out: "(gera report.html navegável)",
            outType: "default",
          },
        ]}
      />

      <h2>Performance & evasão</h2>
      <CommandTable
        title="ffuf — flags de performance e stealth"
        variations={[
          { cmd: "-t 200", desc: "Threads (alvo robusto aguenta; lab pequeno cai).", output: "Default 40." },
          { cmd: "-rate 50", desc: "Limite RPS (anti-WAF, anti-CloudFlare).", output: "Combine com -t 1 e use -p delay." },
          { cmd: "-p 0.1-0.5", desc: "Delay aleatório entre requests (sec).", output: "Reduz fingerprint." },
          { cmd: "-H 'User-Agent: Mozilla/5.0'", desc: "Imita browser real.", output: "Ffuf default UA é detectado." },
          { cmd: "-x http://127.0.0.1:8080", desc: "Proxy Burp p/ inspeção/replay.", output: "Útil em debug." },
          { cmd: "-x socks5://127.0.0.1:9050", desc: "Tor.", output: "Slow mas anônimo (combine com --rate 5)." },
          { cmd: "-recursion-strategy greedy", desc: "Recursão agressiva.", output: "Pode explodir; use depth-limit." },
          { cmd: "-timeout 5", desc: "Timeout por request.", output: "Evita stuck em endpoints lentos." },
        ]}
      />

      <PracticeBox
        title="Lab DVWA: descobrir endpoints escondidos + parâmetros"
        goal="Subir DVWA local, fazer dir bruteforce com ffuf, depois parameter discovery em página identificada."
        steps={[
          "docker run --rm -p 8080:80 vulnerables/web-dvwa",
          "Login admin/password, init DB.",
          "Rode ffuf no path raiz.",
          "Pegue um endpoint .php interessante e fuzz parameter names.",
          "Confirme com curl que o parâmetro descoberto altera resposta.",
        ]}
        command={`docker run --rm -d -p 8080:80 vulnerables/web-dvwa

ffuf -u http://localhost:8080/FUZZ \\
     -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \\
     -mc 200,301,302 -ac

# Após achar /vulnerabilities/sqli/
ffuf -u 'http://localhost:8080/vulnerabilities/sqli/?FUZZ=1' \\
     -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \\
     -fs 4287 \\
     -b 'PHPSESSID=abc; security=low'`}
        expected={`vulnerabilities    [Status: 301]
config             [Status: 200]
docs               [Status: 200]
hackable           [Status: 301]

id          [Status: 200, Size: 5108, Words: 234]
Submit      [Status: 200, Size: 5108, Words: 234]`}
        verify="Os parâmetros 'id' e 'Submit' aparecem com tamanho diferente da baseline = são processados pelo backend."
      />

      <AlertBox type="warning" title="Wordlist faz toda a diferença">
        <p>
          Wordlist genérica (common.txt) acha pouco. Em pentest sério use:
          <strong>raft-large-*</strong> (tudo Raft é raspagem de código real),
          <strong>directory-list-2.3-big.txt</strong> (DirBuster), e wordlists
          tecnologia-específicas em <code>/usr/share/seclists/Discovery/Web-Content/</code>
          (CMS-específicos: WordPress, Drupal, Laravel, etc.). Para parâmetros,
          <strong>burp-parameter-names.txt</strong> e <strong>Arjun's params.txt</strong>.
        </p>
      </AlertBox>

      <AlertBox type="info" title="Cuidado em produção">
        <p>
          Threads altas + recursão = DoS acidental. WAF (Cloudflare, AWS WAF)
          banem por taxa em segundos. Sempre comece com <code>-t 10 -rate 30</code>,
          aqueça o IP, e suba aos poucos. Muitas plataformas de bug bounty
          proíbem fuzzing automatizado sem coordenação prévia.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
