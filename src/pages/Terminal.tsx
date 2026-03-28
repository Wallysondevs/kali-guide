import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Terminal() {
  return (
    <PageContainer
      title="Terminal Essencial"
      subtitle="Comandos fundamentais do Linux que todo usuário do Kali precisa dominar."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <AlertBox type="info" title="Por que o terminal é essencial">
        No Kali Linux, a maioria das ferramentas de segurança só funciona via linha de comando. 
        Dominar o terminal não é opcional — é o primeiro passo para qualquer profissional de segurança.
      </AlertBox>

      <h2>Como usar o --help e o manual</h2>
      <p>
        Toda ferramenta do Linux tem documentação embutida. Antes de pesquisar no Google, consulte o 
        <strong> --help</strong> da própria ferramenta ou o <strong>man</strong> (manual completo). 
        Abaixo explicamos cada recurso em português:
      </p>

      <h3>--help ou -h: ajuda rápida</h3>
      <CodeBlock language="bash" code={`# A maioria das ferramentas aceita --help ou -h
nmap --help
gobuster --help
hydra -h
sqlmap --help

# O --help mostra:
# - Uso básico (Usage/Uso)
# - Lista de flags e parâmetros com descrição curta
# - Exemplos de uso
# - Versão da ferramenta

# Exemplo de saída do nmap --help (traduzido):
# Usage: nmap [Scan Type(s)] [Options] {target specification}
# ↳ Modo de usar: nmap [Tipo de scan] [Opções] {alvo}

# -sS: TCP SYN scan (scan padrão, requer root)
# -sT: TCP Connect scan (não requer root)
# -sU: UDP scan
# -p <porto>: especificar porta(s)
# -v: verbose (mais detalhes na saída)

# Dica: rolar a saída com less
nmap --help | less
# Pressione: Espaço para avançar, q para sair, /palavra para buscar`} />

      <h3>man: o manual completo</h3>
      <CodeBlock language="bash" code={`# Abrir o manual de uma ferramenta
man nmap
man ls
man grep
man curl

# Navegar no manual:
# ↑ / ↓ — rolar linha a linha
# Espaço / b — avançar/voltar página
# /palavra — buscar no manual (ex: /-p para encontrar a flag -p)
# n — próxima ocorrência da busca
# N — ocorrência anterior
# g — ir para o início
# G — ir para o fim
# q — sair

# Ir direto para uma seção
man -k "port scan"     # buscar manuais por palavra-chave
man 1 ls               # seção 1 = comandos de usuário
man 5 passwd           # seção 5 = formatos de arquivo

# Quando não há man page, tente:
info nmap              # alternativa ao man
tldr nmap              # versão simplificada (instale: apt install tldr)`} />

      <h3>Como interpretar a saída do --help</h3>
      <div className="my-6 bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Exemplo de saída típica de --help:</p>
          <pre className="text-xs font-mono text-muted-foreground bg-background/50 rounded p-4 overflow-x-auto whitespace-pre-wrap">{`Usage: ferramenta [opções] <alvo>
       ferramenta [opções] -iL arquivo.txt

Options:
  -h, --help          show this help message and exit
  -v, --verbose       increase output verbosity
  -p PORT, --port PORT  target port (default: 80)
  -o FILE             output file
  -t THREADS          number of threads (default: 10)
  --timeout SECONDS   request timeout in seconds`}</pre>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { label: "Usage:", desc: "Mostra a sintaxe básica. Colchetes [] = opcional, <> = obrigatório" },
            { label: "-h, --help", desc: "Flags curtas (-h) e longas (--help) fazem a mesma coisa. Use a que preferir." },
            { label: "PORT", desc: "Valor em MAIÚSCULAS indica que você deve substituir por um valor real (ex: -p 443)" },
            { label: "(default: 80)", desc: "Valor padrão usado se você não especificar essa opção" },
            { label: "increase output verbosity", desc: "Gera mais informações na tela — útil para debug" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <code className="text-primary text-xs font-mono whitespace-nowrap min-w-[130px]">{item.label}</code>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <ParamsTable
        title="Flags universais que aparecem em quase toda ferramenta"
        params={[
          { flag: "-h / --help", desc: "Exibe ajuda da ferramenta e sai. Sempre o primeiro recurso quando não sabe usar." },
          { flag: "-v / --verbose", desc: "Modo verboso — mostra mais detalhes do que está acontecendo internamente. Muito útil para depurar." },
          { flag: "-vv / -vvv", desc: "Nível extra de verbosidade. Quanto mais 'v', mais detalhado (usado em nmap, netcat, etc.)." },
          { flag: "-o / --output", desc: "Salva o resultado em um arquivo em vez de só exibir na tela." },
          { flag: "-q / --quiet", desc: "Modo silencioso — exibe o mínimo possível. Útil em scripts." },
          { flag: "--version", desc: "Exibe a versão instalada da ferramenta." },
          { flag: "-n", desc: "Geralmente desabilita resolução DNS (mais rápido). Ex: nmap -n, curl -n." },
          { flag: "--no-color", desc: "Remove cores da saída (útil para redirecionar para arquivo)." },
          { flag: "-t / --threads", desc: "Número de threads paralelas. Mais threads = mais rápido, mas mais barulhento." },
          { flag: "--timeout", desc: "Tempo máximo de espera por resposta (em segundos). Evita a ferramenta travar." },
        ]}
      />

      <h2>Navegação no sistema</h2>
      <CodeBlock language="bash" code={`# Mostrar diretório atual
pwd

# Listar arquivos
ls
ls -la          # detalhado + ocultos
ls -lh          # tamanhos legíveis
ls -lS          # ordenado por tamanho

# Mudar de diretório
cd /home/kali   # caminho absoluto
cd ..           # subir um nível
cd ~            # ir para home
cd -            # voltar ao anterior

# Criar diretórios
mkdir pasta
mkdir -p a/b/c  # cria todos os necessários

# Remover (CUIDADO!)
rm arquivo.txt
rm -r pasta/    # remove diretório recursivamente
rm -rf pasta/   # força remoção (sem confirmação)`} />

      <ParamsTable
        title="ls — listar arquivos"
        params={[
          { flag: "-l", desc: "Formato longo: exibe permissões, dono, tamanho, data e nome de cada arquivo." },
          { flag: "-a", desc: "Mostra arquivos ocultos (que começam com ponto, como .bashrc, .ssh/)." },
          { flag: "-h", desc: "Tamanhos legíveis (K, M, G ao invés de bytes).", exemplo: "ls -lh" },
          { flag: "-S", desc: "Ordena por tamanho (maior primeiro).", exemplo: "ls -lSh" },
          { flag: "-t", desc: "Ordena por data de modificação (mais recente primeiro).", exemplo: "ls -lt" },
          { flag: "-r", desc: "Inverte a ordem de listagem.", exemplo: "ls -ltr" },
          { flag: "-R", desc: "Recursivo — lista subdiretórios também.", exemplo: "ls -R /etc" },
        ]}
      />

      <h2>Visualizando arquivos</h2>
      <CodeBlock language="bash" code={`# Mostrar conteúdo
cat arquivo.txt
cat -n arquivo.txt   # com números de linha

# Paginação
less arquivo.txt     # navegar com setas, q para sair
more arquivo.txt     # mais simples

# Primeiras/últimas linhas
head -n 20 arquivo.txt    # primeiras 20 linhas
tail -n 20 arquivo.txt    # últimas 20 linhas
tail -f /var/log/syslog   # seguir em tempo real (logs!)

# Strings legíveis de arquivo binário
strings binario.exe

# Ver arquivo em hex
xxd arquivo.bin | head -20`} />

      <ParamsTable
        title="tail — ver fim de arquivo (muito usado para logs)"
        params={[
          { flag: "-n NÚMERO", desc: "Exibe as últimas N linhas do arquivo.", exemplo: "tail -n 50 syslog" },
          { flag: "-f", desc: "Segue o arquivo em tempo real — ideal para monitorar logs ao vivo. Pressione Ctrl+C para parar.", exemplo: "tail -f /var/log/auth.log" },
          { flag: "-F", desc: "Como -f mas continua seguindo mesmo se o arquivo for rotacionado (reiniciado).", exemplo: "tail -F /var/log/nginx/access.log" },
          { flag: "-c BYTES", desc: "Exibe os últimos N bytes ao invés de linhas.", exemplo: "tail -c 100 arquivo" },
        ]}
      />

      <h2>Busca e pesquisa</h2>
      <CodeBlock language="bash" code={`# Encontrar arquivos
find / -name "*.txt" 2>/dev/null
find /home -type f -name "*.conf"
find / -perm -4000 2>/dev/null        # arquivos SUID (pentest!)

# Pesquisar dentro de arquivos
grep "password" /etc/passwd
grep -r "admin" /var/www/html/        # recursivo
grep -i "senha" arquivo.txt           # case-insensitive
grep -v "comentário" arquivo.conf     # inverte (exclui linhas)
grep -n "erro" log.txt                # mostra números de linha`} />

      <ParamsTable
        title="grep — buscar padrões em arquivos"
        params={[
          { flag: "-r / -R", desc: "Busca recursiva em todos os arquivos do diretório.", exemplo: "grep -r 'password' /var/www" },
          { flag: "-i", desc: "Ignora maiúsculas/minúsculas (case-insensitive).", exemplo: "grep -i 'admin' users.txt" },
          { flag: "-v", desc: "Inverte a busca — mostra linhas que NÃO contêm o padrão.", exemplo: "grep -v '#' config.conf" },
          { flag: "-n", desc: "Mostra o número da linha onde o padrão foi encontrado.", exemplo: "grep -n 'error' app.log" },
          { flag: "-l", desc: "Mostra apenas o nome dos arquivos que contêm o padrão.", exemplo: "grep -rl 'senha' /home" },
          { flag: "-c", desc: "Conta quantas linhas contêm o padrão.", exemplo: "grep -c 'FAILED' auth.log" },
          { flag: "-E", desc: "Expressão regular extendida (permite |, +, ?, etc).", exemplo: "grep -E 'root|admin' passwd" },
          { flag: "-o", desc: "Exibe apenas a parte correspondente, não a linha inteira.", exemplo: "grep -oE '[0-9]+\\.[0-9]+' log" },
          { flag: "--color", desc: "Destaca em cor o padrão encontrado (já habilitado por padrão no Kali)." },
        ]}
      />

      <ParamsTable
        title="find — encontrar arquivos por critério"
        params={[
          { flag: "-name 'padrão'", desc: "Busca por nome exato ou com wildcard.", exemplo: "find / -name '*.php'" },
          { flag: "-type f", desc: "Somente arquivos regulares (f=file, d=directory, l=symlink).", exemplo: "find /etc -type f" },
          { flag: "-perm -4000", desc: "Arquivos com bit SUID ativo — essencial em escalação de privilégio!", exemplo: "find / -perm -4000 2>/dev/null" },
          { flag: "-user USUÁRIO", desc: "Arquivos pertencentes ao usuário.", exemplo: "find / -user root" },
          { flag: "-size +10M", desc: "Arquivos maiores que 10MB. Use k, M, G como sufixo.", exemplo: "find / -size +100M" },
          { flag: "-mtime -7", desc: "Arquivos modificados nos últimos 7 dias.", exemplo: "find /var -mtime -1" },
          { flag: "-exec CMD {} \\;", desc: "Executa um comando para cada arquivo encontrado.", exemplo: "find / -name '*.conf' -exec grep -l 'pass' {} \\;" },
          { flag: "2>/dev/null", desc: "Redireciona erros de 'permissão negada' para /dev/null (não aparece na tela)." },
        ]}
      />

      <h2>Redirecionamento e pipes</h2>
      <CodeBlock language="bash" code={`# Redirecionar saída para arquivo
ls -la > resultado.txt          # sobrescreve
ls -la >> resultado.txt         # adiciona ao final
comando 2> erros.txt            # redireciona erros
comando > saida.txt 2>&1        # saída + erros juntos
comando 2>/dev/null             # descarta erros

# Pipes: passar saída de um para outro
cat /etc/passwd | grep root
nmap -sn 192.168.1.0/24 | grep "Nmap scan"

# tee: escreve na tela E em arquivo
nmap 192.168.1.1 | tee scan_result.txt`} />

      <h2>Atalhos do terminal</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-6">
        {[
          ["Ctrl + C", "Cancela o comando atual"],
          ["Ctrl + Z", "Suspende o processo (volta com fg)"],
          ["Ctrl + D", "Fecha o terminal (logout)"],
          ["Ctrl + L", "Limpa a tela (igual clear)"],
          ["Ctrl + A", "Move cursor para início da linha"],
          ["Ctrl + E", "Move cursor para fim da linha"],
          ["Ctrl + R", "Busca no histórico de comandos"],
          ["↑ / ↓", "Navega pelo histórico"],
          ["Tab", "Autocompletar"],
          ["Tab Tab", "Mostrar opções de autocompletar"],
          ["!!", "Repete o último comando"],
          ["!nmap", "Repete o último comando que começa com nmap"],
        ].map(([key, action], i) => (
          <div key={i} className="flex items-center gap-3 text-sm bg-card border border-border rounded-lg p-2">
            <code className="px-2 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs whitespace-nowrap">{key}</code>
            <span className="text-muted-foreground text-xs">{action}</span>
          </div>
        ))}
      </div>

      <h2>Manipulação de texto</h2>
      <CodeBlock language="bash" code={`# awk: processar colunas
cat /etc/passwd | awk -F: '{print $1, $3}'     # nome e UID

# sed: substituição
sed 's/velho/novo/g' arquivo.txt
sed -i 's/velho/novo/g' arquivo.txt              # edita in-place

# cut: recortar colunas
cat /etc/passwd | cut -d: -f1                   # campo 1 (login)

# sort e uniq
cat ips.txt | sort | uniq                        # remove duplicatas
cat ips.txt | sort | uniq -c | sort -rn          # conta ocorrências`} />

      <ParamsTable
        title="Operadores de redirecionamento"
        params={[
          { flag: ">", desc: "Redireciona a saída padrão para um arquivo. SOBRESCREVE o arquivo se já existir.", exemplo: "nmap alvo > resultado.txt" },
          { flag: ">>", desc: "Adiciona a saída ao final do arquivo sem sobrescrever.", exemplo: "echo 'log' >> registro.txt" },
          { flag: "2>", desc: "Redireciona apenas os erros (stderr) para um arquivo.", exemplo: "nmap alvo 2> erros.txt" },
          { flag: "2>/dev/null", desc: "Descarta todos os erros (envia para o buraco negro /dev/null). Muito usado para limpar output.", exemplo: "find / -name 'pass' 2>/dev/null" },
          { flag: "2>&1", desc: "Combina erros com a saída padrão. Assim tudo vai para o mesmo lugar.", exemplo: "comando > tudo.txt 2>&1" },
          { flag: "|", desc: "Pipe — passa a saída de um comando como entrada do próximo.", exemplo: "ps aux | grep apache" },
          { flag: "tee", desc: "Exibe na tela E salva em arquivo ao mesmo tempo.", exemplo: "nmap alvo | tee scan.txt" },
        ]}
      />
    </PageContainer>
  );
}
