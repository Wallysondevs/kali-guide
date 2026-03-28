import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Gobuster() {
  return (
    <PageContainer
      title="Gobuster"
      subtitle="Enumeração rápida de diretórios, arquivos, subdomínios e buckets S3."
      difficulty="iniciante"
      timeToRead="10 min"
    >
      <h2>Consultando a ajuda do Gobuster</h2>
      <CodeBlock language="bash" code={`# Ajuda geral
gobuster --help

# Ajuda de um modo específico
gobuster dir --help     # ajuda do modo diretório
gobuster dns --help     # ajuda do modo subdomínio
gobuster vhost --help   # ajuda do modo virtual host

# Exemplo de saída do gobuster dir --help (em inglês → traduzido abaixo)
# Usage:
#   gobuster dir [flags]
# Flags:
#   -u, --url string            → URL alvo
#   -w, --wordlist string       → caminho para a wordlist
#   -x, --extensions string     → extensões de arquivo
#   -t, --threads int           → número de threads (padrão 10)
#   -o, --output string         → arquivo de saída
#   -k, --no-tls-validation     → ignorar erros SSL`} />

      <AlertBox type="info" title="Como ler o --help do Gobuster">
        O Gobuster divide seus modos em subcomandos: <code>dir</code>, <code>dns</code>, <code>vhost</code>, <code>s3</code>, <code>fuzz</code>. Cada um tem suas próprias flags. Use <code>gobuster MODO --help</code> para ver as flags específicas do modo.
      </AlertBox>

      <h2>Modos de operação</h2>
      <CodeBlock language="bash" code={`# Modo dir — enumeração de diretórios/arquivos
gobuster dir -u http://alvo.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Modo dns — enumeração de subdomínios
gobuster dns -d alvo.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Modo vhost — descoberta de virtual hosts
gobuster vhost -u http://alvo.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Modo fuzz — fuzzing genérico (substitui FUZZ na URL)
gobuster fuzz -u http://alvo.com/FUZZ -w wordlist.txt`} />

      <ParamsTable
        title="Flags do modo dir — explicadas em português"
        params={[
          { flag: "-u URL", desc: "URL alvo obrigatória. Inclua o protocolo (http:// ou https://) e qualquer caminho base.", exemplo: "gobuster dir -u http://192.168.1.1 -w lista.txt" },
          { flag: "-w WORDLIST", desc: "Caminho para a wordlist (lista de palavras). Quanto maior, mais diretórios serão testados — mas mais demorado.", exemplo: "-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt" },
          { flag: "-x EXTENSÕES", desc: "Extensões de arquivo para testar junto com cada palavra. Separe por vírgula. Essencial para encontrar arquivos específicos.", exemplo: "-x php,html,txt,bak,conf,xml,sql" },
          { flag: "-t THREADS", desc: "Número de threads paralelas. Padrão é 10. Aumente para acelerar (ex: -t 50), mas cuidado com servidores frágeis.", exemplo: "-t 50" },
          { flag: "-o ARQUIVO", desc: "Salva os resultados encontrados em um arquivo.", exemplo: "-o resultado_gobuster.txt" },
          { flag: "-k", desc: "Ignora erros de certificado SSL/TLS inválido. Essencial para sites HTTPS com cert autoassinado.", exemplo: "gobuster dir -u https://alvo.com -w lista.txt -k" },
          { flag: "-s CÓDIGOS", desc: "Códigos de status HTTP a considerar como encontrado. Padrão é 200,204,301,302,307,401,403.", exemplo: "-s 200,301,302" },
          { flag: "-b CÓDIGOS", desc: "Codes de status para excluir (blacklist). Útil para ignorar redirects ou 403.", exemplo: "-b 301,302,403" },
          { flag: "-U / -P", desc: "Usuário e senha para autenticação HTTP Basic. Permite enumerar diretórios em áreas protegidas.", exemplo: "-U admin -P senha123" },
          { flag: "-c COOKIE", desc: "Envia cookies com cada requisição. Permite enumerar áreas que requerem sessão autenticada.", exemplo: "-c 'PHPSESSID=abc123; role=admin'" },
          { flag: "--proxy URL", desc: "Roteia o tráfego por um proxy HTTP. Útil para ver as requisições no Burp Suite.", exemplo: "--proxy http://127.0.0.1:8080" },
          { flag: "-r", desc: "Segue redirecionamentos HTTP. Por padrão o Gobuster não segue — ative se estiver perdendo resultados.", exemplo: "gobuster dir -u http://alvo -w lista.txt -r" },
          { flag: "--timeout DURAÇÃO", desc: "Tempo máximo de espera por resposta. Padrão é 10s.", exemplo: "--timeout 30s" },
          { flag: "-a USER-AGENT", desc: "Define o User-Agent da requisição. Útil para imitar um browser.", exemplo: "-a 'Mozilla/5.0'" },
          { flag: "--add-slash", desc: "Adiciona / ao final de cada palavra testada. Útil para encontrar diretórios que só respondem com barra.", exemplo: "--add-slash" },
          { flag: "-q", desc: "Modo quieto — não exibe o banner inicial e status. Saída mais limpa para parsear.", exemplo: "gobuster dir -u alvo -w lista.txt -q" },
        ]}
      />

      <h2>Enumeração de diretórios na prática</h2>
      <CodeBlock language="bash" code={`# Básico — rápido para CTF inicial
gobuster dir -u http://192.168.1.1 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt \
  -t 50 -o recon_dir.txt

# Completo com extensões — mais lento mas abrangente
gobuster dir -u http://alvo.com \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,html,txt,bak,conf,xml,sql,zip,json \
  -t 30 -o resultado.txt

# HTTPS com certificado inválido
gobuster dir -u https://alvo.com \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -k -t 30

# Com sessão autenticada (cookie)
gobuster dir -u http://alvo.com/painel/ \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt \
  -c "session=abc123" -t 20

# Via proxy Burp Suite (ver requests)
gobuster dir -u http://alvo.com \
  -w wordlist.txt \
  --proxy http://127.0.0.1:8080`} />

      <ParamsTable
        title="Flags do modo dns — enumeração de subdomínios"
        params={[
          { flag: "-d DOMÍNIO", desc: "Domínio alvo (sem http://). Obrigatório no modo dns.", exemplo: "gobuster dns -d empresa.com -w lista.txt" },
          { flag: "-w WORDLIST", desc: "Wordlist de subdomínios para testar.", exemplo: "-w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt" },
          { flag: "-i", desc: "Mostra os endereços IP resolvidos para cada subdomínio encontrado.", exemplo: "gobuster dns -d empresa.com -w lista.txt -i" },
          { flag: "-r DNS_SERVER", desc: "Usa um servidor DNS específico para as consultas (ex: servidor interno da empresa).", exemplo: "-r 192.168.1.53" },
          { flag: "--wildcard", desc: "Ativa detecção e supressão de wildcards DNS (quando o servidor resolve qualquer subdomínio)." },
          { flag: "-t THREADS", desc: "Threads paralelas para consultas DNS. Aumente para domínios grandes.", exemplo: "-t 100" },
        ]}
      />

      <h2>Enumeração de subdomínios</h2>
      <CodeBlock language="bash" code={`# Básico
gobuster dns -d empresa.com \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -t 50

# Mostrar IPs dos subdomínios encontrados
gobuster dns -d empresa.com \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt \
  -i -t 50`} />

      <h2>Wordlists recomendadas</h2>
      <div className="space-y-2 my-6">
        {[
          { path: "/usr/share/wordlists/dirbuster/directory-list-2.3-small.txt", desc: "Rápida (~80k entradas). Use primeiro para ter resultado logo." },
          { path: "/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt", desc: "Padrão (~220k). Bom equilíbrio entre velocidade e cobertura." },
          { path: "/usr/share/seclists/Discovery/Web-Content/common.txt", desc: "SecLists comum — caminhos mais vistos na web." },
          { path: "/usr/share/seclists/Discovery/Web-Content/big.txt", desc: "SecLists grande — mais completo." },
          { path: "/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt", desc: "Raft — diretórios reais coletados da internet." },
          { path: "/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt", desc: "5k subdomínios mais comuns. Rápido para DNS." },
        ].map((wl, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3">
            <code className="text-primary text-xs font-mono break-all">{wl.path}</code>
            <p className="text-xs text-muted-foreground mt-1">{wl.desc}</p>
          </div>
        ))}
      </div>

      <h2>ffuf — Alternativa mais poderosa</h2>
      <CodeBlock language="bash" code={`# Instalar ffuf
sudo apt install -y ffuf

# Fuzzing de diretórios (FUZZ é o placeholder)
ffuf -u http://alvo.com/FUZZ -w wordlist.txt -mc 200,301,302

# Filtrar por tamanho de resposta (excluir 404 com tamanho específico)
ffuf -u http://alvo.com/FUZZ -w wordlist.txt -fs 4242

# Fuzzing de subdomínios
ffuf -u http://FUZZ.alvo.com -w lista.txt -H "Host: FUZZ.alvo.com" -mc 200

# Fuzzing de parâmetros GET
ffuf -u "http://alvo.com/page?FUZZ=test" -w params.txt`} />

      <ParamsTable
        title="ffuf — flags principais em português"
        params={[
          { flag: "-u URL", desc: "URL com o placeholder FUZZ onde será inserido cada valor da wordlist.", exemplo: "-u http://alvo.com/FUZZ" },
          { flag: "-w WORDLIST", desc: "Wordlist a usar. Você pode usar múltiplas com -w lista1.txt:W1 -w lista2.txt:W2 e os placeholders W1, W2 na URL.", exemplo: "-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt" },
          { flag: "-mc CÓDIGO", desc: "Match por código de status HTTP. Mostra apenas respostas com esses códigos.", exemplo: "-mc 200,301,302" },
          { flag: "-fs TAMANHO", desc: "Filter Size — esconde respostas com esse tamanho em bytes. Muito útil para ignorar páginas de erro genéricas.", exemplo: "-fs 1234" },
          { flag: "-fw PALAVRAS", desc: "Filter Words — esconde respostas com esse número de palavras.", exemplo: "-fw 42" },
          { flag: "-t THREADS", desc: "Threads paralelas. Padrão é 40. Aumente para mais velocidade.", exemplo: "-t 100" },
          { flag: "-H 'Header'", desc: "Adiciona um header HTTP customizado. Muito usado para fuzzing de subdomain.", exemplo: "-H 'Host: FUZZ.alvo.com'" },
          { flag: "-o ARQUIVO -of FORMAT", desc: "Salva resultado em arquivo. Formatos: json, ejson, html, md, csv.", exemplo: "-o resultado.json -of json" },
          { flag: "-c", desc: "Ativa colorização da saída.", exemplo: "ffuf -u http://alvo/FUZZ -w lista.txt -c" },
        ]}
      />

      <AlertBox type="success" title="Dica CTF">
        Em CTFs, comece com a wordlist <code>common.txt</code> (rápida), depois <code>directory-list-2.3-medium.txt</code>. 
        Sempre teste com extensões <code>-x php,html,txt</code> quando souber a linguagem do servidor.
      </AlertBox>
    </PageContainer>
  );
}
