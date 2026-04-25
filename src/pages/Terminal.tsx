import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";
import { PracticeBox } from "@/components/ui/PracticeBox";

export default function Terminal() {
  return (
    <PageContainer
      title="Terminal Essencial"
      subtitle="Comandos fundamentais do Linux em ordem cronológica — primeiro navegar, depois ler, depois buscar, depois automatizar."
      difficulty="iniciante"
      timeToRead="25 min"
    >
      <AlertBox type="info" title="Esta página assume que você já passou pelo básico">
        Se você nunca abriu um terminal, comece em{" "}
        <Link href="/comece-aqui">
          <a className="underline font-semibold text-primary">
            Comece Aqui
          </a>
        </Link>
        . Se você nunca criou nem editou um arquivo no terminal, faça antes a
        página{" "}
        <Link href="/primeiros-arquivos">
          <a className="underline font-semibold text-primary">
            Primeiros Arquivos
          </a>
        </Link>
        . Aqui aprofundamos comandos de leitura, busca, pipes e processos —{" "}
        <strong>todos os exemplos usam arquivos seus</strong> que você já criou.
      </AlertBox>

      <h2>Preparando o laboratório</h2>
      <p>
        Antes de qualquer prática, recrie a sua pasta de testes com alguns
        arquivos de exemplo. Tudo o que vier abaixo vai usar esses arquivos.
      </p>
      <CodeBlock
        language="bash"
        code={`cd ~
mkdir -p lab && cd lab

# Cria 3 arquivos com conteúdo diferente
echo "kali" > usuarios.txt
echo "root" >> usuarios.txt
echo "admin" >> usuarios.txt
echo "wallyson" >> usuarios.txt

cat > log.txt << 'EOF'
2026-04-25 10:00 INFO sistema iniciado
2026-04-25 10:01 INFO usuário kali logou
2026-04-25 10:02 ERROR falha ao conectar banco
2026-04-25 10:03 WARN tentativa de login admin
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:05 INFO usuário kali deslogou
EOF

# Confirma
ls -lh
# -rw-r--r-- 1 kali kali 271 Apr 25 16:30 log.txt
# -rw-r--r-- 1 kali kali  24 Apr 25 16:30 usuarios.txt`}
      />

      <h2>1. Navegação — sempre saiba onde está</h2>
      <p>
        Em qualquer comando, você precisa saber: <strong>onde estou?</strong>{" "}
        e <strong>o que tem aqui?</strong>
      </p>
      <CodeBlock
        language="bash"
        code={`# Onde estou?
pwd

# O que tem aqui?
ls

# Mudar de diretório
cd /home/kali       # caminho absoluto
cd lab              # relativo ao diretório atual
cd ..               # subir um nível
cd ~                # ir para a home (~ = atalho de /home/seu_user)
cd -                # voltar ao diretório anterior
cd                  # sem nada também volta para a home`}
      />

      <h3>ls — principais flags úteis (não só -la)</h3>
      <ParamsTable
        title="ls — flags mais usadas no dia a dia"
        params={[
          {
            flag: "-l",
            desc: "Formato longo: permissões, dono, grupo, tamanho, data e nome.",
            exemplo: "ls -l",
          },
          {
            flag: "-a",
            desc: "Inclui arquivos ocultos (que começam com '.').",
            exemplo: "ls -a",
          },
          {
            flag: "-A",
            desc: "Como -a, mas sem mostrar '.' e '..'.",
            exemplo: "ls -A",
          },
          {
            flag: "-h",
            desc: "Tamanhos legíveis (K, M, G). Combina com -l.",
            exemplo: "ls -lh",
          },
          {
            flag: "-S",
            desc: "Ordena por tamanho (maior primeiro).",
            exemplo: "ls -lhS",
          },
          {
            flag: "-t",
            desc: "Ordena por data de modificação (mais recente primeiro).",
            exemplo: "ls -lt",
          },
          {
            flag: "-r",
            desc: "Inverte a ordem da listagem.",
            exemplo: "ls -ltr",
          },
          {
            flag: "-R",
            desc: "Recursivo — entra em todas as subpastas.",
            exemplo: "ls -R /etc",
          },
          {
            flag: "-d",
            desc: "Lista a própria pasta (não o conteúdo dela).",
            exemplo: "ls -ld /etc",
          },
          {
            flag: "-i",
            desc: "Mostra o número do inode de cada arquivo.",
            exemplo: "ls -li",
          },
          {
            flag: "-1",
            desc: "Um arquivo por linha (útil para pipes).",
            exemplo: "ls -1 | wc -l",
          },
          {
            flag: "-X",
            desc: "Ordena alfabeticamente pela extensão.",
            exemplo: "ls -lX",
          },
          {
            flag: "-F",
            desc: "Adiciona um caractere indicando o tipo (/ pasta, * executável, @ link).",
            exemplo: "ls -F",
          },
          {
            flag: "--color=auto",
            desc: "Cores por tipo de arquivo (já é o padrão no Kali).",
          },
          {
            flag: "-Z",
            desc: "Mostra contexto SELinux (avançado).",
          },
        ]}
      />

      <PracticeBox
        title="1 — Domine o ls"
        goal="Ver os arquivos do lab de 4 jeitos diferentes."
        command={`cd ~/lab
ls
ls -la
ls -lhS
ls -lt`}
        expected={`log.txt  usuarios.txt
total 16K
drwxr-xr-x 2 kali kali 4.0K Apr 25 16:30 .
drwx------ 18 kali kali 4.0K Apr 25 16:30 ..
-rw-r--r-- 1 kali kali  271 Apr 25 16:30 log.txt
-rw-r--r-- 1 kali kali   24 Apr 25 16:30 usuarios.txt
-rw-r--r-- 1 kali kali 271 Apr 25 16:30 log.txt
-rw-r--r-- 1 kali kali  24 Apr 25 16:30 usuarios.txt
-rw-r--r-- 1 kali kali 271 Apr 25 16:30 log.txt
-rw-r--r-- 1 kali kali  24 Apr 25 16:30 usuarios.txt`}
        verify="Você viu o mesmo conteúdo em 4 formatos diferentes — simples, detalhado com ocultos, ordenado por tamanho e por data."
      />

      <h2>2. Pedindo ajuda — você não precisa decorar nada</h2>
      <p>
        Toda ferramenta tem três caminhos para você descobrir o que ela faz:
      </p>
      <CodeBlock
        language="bash"
        code={`# 1) Ajuda rápida (resumida)
ls --help
grep --help

# 2) Manual completo (rola a tela; q para sair)
man ls
man grep

# 3) Versão simplificada com exemplos práticos (precisa instalar)
sudo apt install -y tldr
tldr ls
tldr find`}
      />

      <h3>Como ler o --help</h3>
      <div className="my-6 bg-card border border-border rounded-xl p-5 space-y-4">
        <pre className="text-xs font-mono text-muted-foreground bg-background/50 rounded p-4 overflow-x-auto whitespace-pre-wrap m-0">{`Usage: ferramenta [opções] <alvo>
       ferramenta [opções] -iL arquivo.txt

Options:
  -h, --help          show this help message and exit
  -v, --verbose       increase output verbosity
  -p PORT, --port PORT  target port (default: 80)
  -o FILE             output file
  -t THREADS          number of threads (default: 10)`}</pre>
        <ul className="text-sm space-y-1.5 m-0 pl-5">
          <li>
            <code>[opções]</code> → colchetes = opcional.
          </li>
          <li>
            <code>{"<alvo>"}</code> → ângulos = obrigatório.
          </li>
          <li>
            <code>-h, --help</code> → forma curta e longa, escolha uma.
          </li>
          <li>
            <code>PORT</code> → maiúsculo = você substitui pelo valor real.
          </li>
          <li>
            <code>(default: 80)</code> → o que acontece se você não passar a
            opção.
          </li>
        </ul>
      </div>

      <h2>3. Lendo arquivos</h2>
      <p>
        Agora que você tem <code>~/lab/log.txt</code>, esses comandos fazem
        sentido:
      </p>
      <CodeBlock
        language="bash"
        code={`# Tudo de uma vez
cat log.txt
cat -n log.txt          # com número de linha

# Paginado (use com arquivos grandes)
less log.txt
# ↑ ↓ rolam, espaço avança página, /palavra busca, q sai

# Primeiras linhas
head log.txt            # 10 primeiras (padrão)
head -n 3 log.txt       # 3 primeiras

# Últimas linhas
tail log.txt
tail -n 2 log.txt       # 2 últimas
tail -f log.txt         # acompanha em tempo real (Ctrl+C para sair)`}
      />

      <PracticeBox
        title="2 — Leia o seu próprio log"
        goal="Usar 4 comandos diferentes para ler o mesmo arquivo."
        command={`cd ~/lab
cat -n log.txt
head -n 2 log.txt
tail -n 2 log.txt
less log.txt
# (use as setas, depois aperte q para sair)`}
        expected={`     1  2026-04-25 10:00 INFO sistema iniciado
     2  2026-04-25 10:01 INFO usuário kali logou
     3  2026-04-25 10:02 ERROR falha ao conectar banco
     4  2026-04-25 10:03 WARN tentativa de login admin
     5  2026-04-25 10:04 ERROR timeout na API externa
     6  2026-04-25 10:05 INFO usuário kali deslogou
2026-04-25 10:00 INFO sistema iniciado
2026-04-25 10:01 INFO usuário kali logou
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:05 INFO usuário kali deslogou`}
        verify="Você viu o arquivo numerado, depois só as 2 primeiras, depois só as 2 últimas, e depois navegou nele paginado."
      />

      <h2>4. Buscando — find e grep</h2>

      <h3>4.1. find — encontrar arquivos por critério</h3>
      <CodeBlock
        language="bash"
        code={`# Pelo nome
find ~ -name "*.txt" 2>/dev/null

# Pelo tipo
find /etc -type f -name "*.conf" 2>/dev/null    # arquivos
find /etc -type d -name "ssh" 2>/dev/null        # pastas

# Pelo tamanho
find ~ -size +1M                                 # > 1 MB
find ~ -size -10k                                # < 10 KB

# Por data de modificação
find ~ -mtime -1                                 # nas últimas 24h
find ~ -mtime +30                                # há mais de 30 dias

# Por permissão (essencial em escalação de privilégio!)
find / -perm -4000 2>/dev/null                   # SUID
find / -perm -2000 2>/dev/null                   # SGID

# Executar comando em cada resultado
find ~/lab -name "*.txt" -exec wc -l {} \\;`}
      />

      <ParamsTable
        title="find — flags essenciais"
        params={[
          {
            flag: "-name 'padrão'",
            desc: "Nome com wildcards (*, ?). Aspas evitam que o shell expanda.",
            exemplo: "find / -name '*.php' 2>/dev/null",
          },
          {
            flag: "-iname 'padrão'",
            desc: "Como -name, mas ignora maiúsculas/minúsculas.",
            exemplo: "find / -iname 'PASSWORD*'",
          },
          {
            flag: "-type X",
            desc: "f = arquivo, d = diretório, l = link simbólico, b = block device.",
            exemplo: "find /etc -type f",
          },
          {
            flag: "-perm -4000",
            desc: "Bit SUID — vital em pentest (busca binários executáveis como root).",
            exemplo: "find / -perm -4000 2>/dev/null",
          },
          {
            flag: "-user nome",
            desc: "Arquivos de um usuário específico.",
            exemplo: "find / -user root -type f",
          },
          {
            flag: "-size +N[ckMG]",
            desc: "Maiores (+) ou menores (-) que N caracteres/k/M/G.",
            exemplo: "find / -size +100M",
          },
          {
            flag: "-mtime ±N",
            desc: "Modificados há N dias (mais ou menos).",
            exemplo: "find /var -mtime -1",
          },
          {
            flag: "-exec CMD {} \\;",
            desc: "Executa CMD em cada arquivo achado. {} = nome do arquivo.",
            exemplo: "find . -name '*.bak' -exec rm {} \\;",
          },
          {
            flag: "2>/dev/null",
            desc: "Joga erros de 'permission denied' fora — limpa a saída.",
          },
        ]}
      />

      <h3>4.2. grep — buscar dentro do conteúdo</h3>
      <CodeBlock
        language="bash"
        code={`# Linhas com a palavra
grep ERROR log.txt
grep INFO log.txt

# Sem distinguir caixa
grep -i "error" log.txt

# Mostrar número da linha
grep -n ERROR log.txt

# Inverter — mostrar o que NÃO bate
grep -v INFO log.txt

# Recursivo em uma pasta inteira
grep -r "kali" ~/lab/

# Várias palavras (regex)
grep -E "ERROR|WARN" log.txt

# Contar quantas linhas batem
grep -c ERROR log.txt`}
      />

      <PracticeBox
        title="3 — Caça aos erros"
        goal="Encontrar todas as linhas de ERROR e WARN no seu log."
        command={`cd ~/lab
grep ERROR log.txt
grep -E "ERROR|WARN" log.txt
grep -c ERROR log.txt`}
        expected={`2026-04-25 10:02 ERROR falha ao conectar banco
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:02 ERROR falha ao conectar banco
2026-04-25 10:03 WARN tentativa de login admin
2026-04-25 10:04 ERROR timeout na API externa
2`}
        verify="Você viu primeiro só ERROR (2 linhas), depois ERROR ou WARN (3 linhas) e depois a contagem (2)."
      />

      <ParamsTable
        title="grep — flags essenciais"
        params={[
          { flag: "-i", desc: "Ignora maiúsculas/minúsculas." },
          { flag: "-n", desc: "Mostra o número da linha." },
          { flag: "-v", desc: "Inverte: mostra linhas que NÃO batem." },
          { flag: "-r / -R", desc: "Busca recursiva em todos os arquivos." },
          {
            flag: "-l",
            desc: "Mostra apenas os nomes dos arquivos que contêm o padrão.",
          },
          { flag: "-c", desc: "Conta quantas linhas batem (não as ocorrências)." },
          {
            flag: "-E",
            desc: "Regex extendida (permite |, +, ? sem escape).",
          },
          {
            flag: "-o",
            desc: "Mostra apenas a parte que casou, não a linha inteira.",
          },
          {
            flag: "-A N / -B N / -C N",
            desc: "Mostra N linhas de contexto Antes/Depois/Cercando o match.",
            exemplo: "grep -C 2 ERROR log.txt",
          },
          {
            flag: "--color=auto",
            desc: "Destaca o match em cor (já é padrão no Kali).",
          },
        ]}
      />

      <h2>5. Pipes e redirecionamento — combinando comandos</h2>
      <p>
        O verdadeiro poder do shell é juntar comandos pequenos. O{" "}
        <code>|</code> (pipe) passa a saída de um para a entrada do próximo.
      </p>
      <CodeBlock
        language="bash"
        code={`# Quantas linhas tem o log?
cat log.txt | wc -l
# 6

# Quais usuários únicos?
cat usuarios.txt | sort | uniq

# Top 3 IPs mais frequentes em um log de acesso
cat /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -3

# Contar processos por usuário
ps aux | awk '{print $1}' | sort | uniq -c | sort -rn`}
      />

      <ParamsTable
        title="Operadores de redirecionamento"
        params={[
          {
            flag: ">",
            desc: "Salva saída em arquivo. SOBRESCREVE se existir.",
            exemplo: "ls > lista.txt",
          },
          {
            flag: ">>",
            desc: "Adiciona saída ao final do arquivo (sem apagar).",
            exemplo: "echo 'fim' >> lista.txt",
          },
          {
            flag: "<",
            desc: "Usa o arquivo como entrada de um comando.",
            exemplo: "wc -l < log.txt",
          },
          {
            flag: "2>",
            desc: "Redireciona apenas erros (stderr) para arquivo.",
            exemplo: "find / -name x 2> erros.txt",
          },
          {
            flag: "2>/dev/null",
            desc: "Joga os erros fora.",
            exemplo: "find / -name x 2>/dev/null",
          },
          {
            flag: "&> arq",
            desc: "Salva saída e erros no mesmo arquivo.",
            exemplo: "comando &> tudo.txt",
          },
          {
            flag: "|",
            desc: "Pipe — saída do anterior vira entrada do próximo.",
            exemplo: "cat log | grep ERROR",
          },
          {
            flag: "tee arq",
            desc: "Mostra na tela E salva no arquivo.",
            exemplo: "ls | tee saida.txt",
          },
        ]}
      />

      <PracticeBox
        title="4 — Encadeie 4 comandos"
        goal="Pegar só os usuários do log, ordenar e contar quantos únicos."
        command={`cd ~/lab
grep "usuário" log.txt | awk '{print $5}' | sort | uniq -c`}
        expected={`      2 kali`}
        verify="Saiu uma linha mostrando '2 kali' — significa que o usuário kali aparece 2 vezes nas mensagens de log que mencionam 'usuário'."
      />

      <h2>6. Manipulação de texto — awk, sed, cut, sort, uniq</h2>
      <CodeBlock
        language="bash"
        code={`# cut — pegar colunas (separador padrão é TAB)
cut -d: -f1 /etc/passwd       # primeiro campo, separador :
cut -d, -f1,3 dados.csv        # colunas 1 e 3

# sort — ordenar
sort usuarios.txt              # alfabético
sort -r usuarios.txt           # reverso
sort -n numeros.txt            # numérico
sort -k2 dados.txt             # por 2ª coluna

# uniq — remover duplicatas (precisa estar ordenado!)
sort usuarios.txt | uniq
sort usuarios.txt | uniq -c    # com contagem
sort usuarios.txt | uniq -d    # só os duplicados

# wc — contar
wc -l log.txt                  # linhas
wc -w log.txt                  # palavras
wc -c log.txt                  # bytes

# tr — substituir/remover caracteres
echo "ola mundo" | tr 'a-z' 'A-Z'   # MAIÚSCULAS
echo "a-b-c" | tr '-' ' '            # troca - por espaço

# awk — processar colunas (super poderoso)
awk '{print $1}' log.txt              # 1ª coluna (data)
awk '{print $3, $4}' log.txt          # 3ª e 4ª (nível e mensagem)
awk -F: '{print $1, $7}' /etc/passwd  # com separador :

# sed — substituir
sed 's/ERROR/FALHA/g' log.txt         # mostra com troca
sed -i 's/ERROR/FALHA/g' log.txt      # SALVA a troca no arquivo (CUIDADO)`}
      />

      <PracticeBox
        title="5 — Extraia só o nível do log"
        goal="Usar awk para mostrar apenas a coluna do nível (INFO/ERROR/WARN) de cada linha."
        command={`cd ~/lab
awk '{print $3}' log.txt | sort | uniq -c | sort -rn`}
        expected={`      3 INFO
      2 ERROR
      1 WARN`}
        verify="Você contou quantas vezes cada nível apareceu — 3 INFO, 2 ERROR, 1 WARN — em uma linha de comando só."
      />

      <h2>7. Processos e tarefas</h2>
      <CodeBlock
        language="bash"
        code={`# Listar processos
ps aux                        # todos os processos
ps aux | grep firefox         # filtrar por nome
top                           # interativo (q para sair)
htop                          # bonito (sudo apt install htop)

# Matar processo
kill 1234                     # PID 1234 (sinal padrão TERM)
kill -9 1234                  # SIGKILL (forçado)
killall firefox               # mata todos com esse nome
pkill -f "python script.py"   # por padrão na linha de comando

# Rodar em segundo plano
comando &                     # em background
jobs                          # lista jobs
fg %1                         # traz o job 1 para frente
bg %1                         # joga o job 1 para o fundo
nohup comando &               # continua mesmo se você sair

# Tempo de execução
time ls -R /etc > /dev/null`}
      />

      <h2>8. Atalhos do terminal — economize horas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-6">
        {[
          ["Tab", "Autocompletar nome de arquivo/comando"],
          ["Tab Tab", "Mostrar todas as opções possíveis"],
          ["↑ / ↓", "Navegar pelo histórico de comandos"],
          ["Ctrl + R", "Buscar no histórico (digite parte do comando)"],
          ["Ctrl + C", "Cancelar comando em execução"],
          ["Ctrl + Z", "Suspender (volte com fg, mande para fundo com bg)"],
          ["Ctrl + D", "EOF / fechar terminal / logout"],
          ["Ctrl + L", "Limpar a tela (igual a clear)"],
          ["Ctrl + A", "Cursor para o início da linha"],
          ["Ctrl + E", "Cursor para o fim da linha"],
          ["Ctrl + U", "Apagar tudo do cursor até o início"],
          ["Ctrl + K", "Apagar tudo do cursor até o fim"],
          ["Ctrl + W", "Apagar a palavra anterior"],
          ["Alt + .", "Cola o último argumento do comando anterior"],
          ["!!", "Repete o último comando inteiro"],
          ["sudo !!", "Repete o último comando com sudo"],
          ["!nmap", "Repete o último comando que começou com nmap"],
          ["history", "Lista todo o histórico"],
        ].map(([key, action], i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm bg-card border border-border rounded-lg p-2"
          >
            <code className="px-2 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs whitespace-nowrap">
              {key}
            </code>
            <span className="text-muted-foreground text-xs">{action}</span>
          </div>
        ))}
      </div>

      <PracticeBox
        title="6 — Use 5 atalhos diferentes"
        goal="Treinar autocompletar, histórico e edição de linha."
        steps={[
          "Digite cd ~/L e pressione Tab → completa para cd ~/lab.",
          "Pressione ↑ várias vezes — você vê seus comandos anteriores.",
          "Aperte Ctrl+R, digite grep — ele busca o último comando com grep.",
          "Digite um comando longo, aperte Ctrl+A para ir ao começo, Ctrl+E para ir ao fim.",
          "Aperte !! para repetir o último.",
        ]}
        verify="Você usou Tab, setas, Ctrl+R, Ctrl+A/E e !! sem digitar nada de novo. Bem-vindo ao mundo dos shells eficientes."
      />

      <h2>9. Limpando — sempre desfaça depois</h2>
      <CodeBlock
        language="bash"
        code={`# Apague o lab quando terminar de praticar
cd ~
rm -r lab

# Limpe a tela
clear   # ou Ctrl+L

# Limpe o histórico (opcional, antes de fechar)
history -c`}
      />

      <AlertBox type="success" title="Você dominou o terminal essencial">
        Aqui você fez tudo o que um pentester faz no dia-a-dia: navega,
        encontra arquivos, busca padrões, encadeia comandos com pipes,
        manipula texto e gerencia processos. Próximo passo:{" "}
        <Link href="/filesystem">
          <a className="underline font-semibold text-primary">
            Sistema de Arquivos
          </a>
        </Link>{" "}
        para entender a estrutura do Linux por dentro, ou{" "}
        <Link href="/redes">
          <a className="underline font-semibold text-primary">
            Redes no Kali
          </a>
        </Link>{" "}
        para sair do seu computador.
      </AlertBox>
    </PageContainer>
  );
}
