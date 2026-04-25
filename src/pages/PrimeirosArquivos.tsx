import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { ArrowRight } from "lucide-react";

export default function PrimeirosArquivos() {
  return (
    <PageContainer
      title="Primeiros Arquivos — Crie, Edite e Apague"
      subtitle="Antes de aprender a ler arquivos com cat, less ou grep, você precisa ter arquivos seus para experimentar. Aqui criamos eles do zero."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <AlertBox type="info" title="Por que esta página existe">
        A maioria dos guias de Linux começa ensinando <code>cat arquivo.txt</code>
        {" "}sem nunca explicar como aquele arquivo apareceu. Isso confunde
        iniciantes. Aqui vamos primeiro criar arquivos e só depois aprender
        a ler, buscar e manipular o conteúdo deles.
      </AlertBox>

      <h2>1. Onde criar — uma pasta de testes</h2>
      <p>
        Nunca crie arquivos de teste em qualquer lugar. Crie uma{" "}
        <strong>pasta dedicada</strong> dentro da sua pasta pessoal. Assim,
        quando quiser limpar tudo, você apaga só essa pasta — sem risco de
        derrubar arquivo importante por engano.
      </p>
      <CodeBlock
        language="bash"
        code={`# Vá para a sua pasta pessoal (atalho ~)
cd ~

# Confirme onde está
pwd
# Saída: /home/kali

# Crie a pasta "lab"
mkdir lab

# Entre nela
cd lab

# Confirme novamente
pwd
# Saída: /home/kali/lab`}
      />

      <PracticeBox
        title="1 — Sua pasta de laboratório"
        goal="Criar uma pasta chamada lab dentro de /home/kali e entrar nela."
        command={`cd ~
mkdir lab
cd lab
pwd`}
        expected={`/home/kali/lab`}
        verify="O comando pwd respondeu com /home/kali/lab e o ls (sem nada para listar) não mostrou nada — significa que a pasta está vazia. Está pronto."
      />

      <h2>2. Três jeitos de criar um arquivo</h2>

      <h3>2.1. touch — cria um arquivo vazio</h3>
      <p>
        O <code>touch</code> cria um arquivo de tamanho zero. É o jeito mais
        simples. Se o arquivo já existir, ele só atualiza a data de
        modificação.
      </p>
      <CodeBlock
        language="bash"
        code={`# Cria um arquivo vazio
touch nota.txt

# Pode criar vários de uma vez
touch arquivo1.txt arquivo2.txt arquivo3.txt

# Verifica
ls -lh
# -rw-r--r-- 1 kali kali 0 Apr 25 15:50 arquivo1.txt
# -rw-r--r-- 1 kali kali 0 Apr 25 15:50 arquivo2.txt
# -rw-r--r-- 1 kali kali 0 Apr 25 15:50 arquivo3.txt
# -rw-r--r-- 1 kali kali 0 Apr 25 15:50 nota.txt
#
# O 0 entre o grupo (kali) e a data é o tamanho em bytes.`}
      />

      <h3>2.2. echo {">"} — cria um arquivo com texto</h3>
      <p>
        O <code>echo</code> imprime texto na tela. Quando você redireciona
        com <code>{">"}</code>, esse texto vai para um arquivo em vez da tela.
        Se o arquivo existir, ele <strong>sobrescreve</strong> tudo.
      </p>
      <CodeBlock
        language="bash"
        code={`# Cria nota.txt com uma linha (e sobrescreve se existir!)
echo "Aprendendo Kali Linux" > nota.txt

# Adiciona uma linha no final (não sobrescreve!)
echo "Hoje vou estudar comandos básicos" >> nota.txt

# Adiciona mais uma
echo "Praticar é tudo" >> nota.txt`}
      />

      <AlertBox type="warning" title="Cuidado: > apaga, >> adiciona">
        <code>{">"}</code> sobrescreve o arquivo inteiro sem perguntar.{" "}
        <code>{">>"}</code> adiciona ao final, preservando o que estava antes.
        Confundir os dois é um erro clássico que destrói horas de trabalho.
      </AlertBox>

      <h3>2.3. nano — editor de texto interativo</h3>
      <p>
        Para escrever vários parágrafos, use o <code>nano</code>. Ele abre
        uma tela que você navega com as setas e digita normalmente.
      </p>
      <CodeBlock
        language="bash"
        code={`# Abre (ou cria) o arquivo no editor
nano diario.txt`}
      />
      <p>Os atalhos do nano aparecem na parte de baixo da tela. Os mais usados:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-6">
        {[
          ["Ctrl + O", "Salvar (depois Enter para confirmar o nome)"],
          ["Ctrl + X", "Sair (pergunta se quer salvar antes)"],
          ["Ctrl + K", "Recortar a linha atual"],
          ["Ctrl + U", "Colar"],
          ["Ctrl + W", "Buscar texto"],
          ["Ctrl + G", "Ajuda completa"],
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

      <AlertBox type="info" title="O símbolo ^ no nano">
        Na barra inferior do nano, <code>^</code> significa <code>Ctrl</code>.
        Então <code>^X</code> = <code>Ctrl + X</code>. Não é Shift+6, é a tecla
        Control.
      </AlertBox>

      <PracticeBox
        title="2 — Crie arquivos pelos três métodos"
        goal="Comparar touch, echo e nano criando três arquivos diferentes."
        steps={[
          "Use touch para criar vazio.txt.",
          "Use echo > para criar uma_linha.txt com a frase 'Bash é vida'.",
          "Abra nano paragrafos.txt, digite duas linhas, salve com Ctrl+O e saia com Ctrl+X.",
          "Liste tudo com ls -lh para ver os tamanhos diferentes.",
        ]}
        command={`touch vazio.txt
echo "Bash é vida" > uma_linha.txt
nano paragrafos.txt
# (digite duas linhas, Ctrl+O, Enter, Ctrl+X)
ls -lh`}
        expected={`-rw-r--r-- 1 kali kali  87 Apr 25 16:02 paragrafos.txt
-rw-r--r-- 1 kali kali  12 Apr 25 16:01 uma_linha.txt
-rw-r--r-- 1 kali kali   0 Apr 25 16:00 vazio.txt`}
        verify="Os três arquivos aparecem no ls com tamanhos diferentes (0 bytes para o vazio, alguns bytes para o uma_linha, mais para o paragrafos)."
      />

      <h2>3. Agora sim: ler o que você criou</h2>
      <p>
        Você tem arquivos. Agora os comandos de leitura fazem sentido.
      </p>

      <h3>3.1. cat — mostra o arquivo inteiro de uma vez</h3>
      <CodeBlock
        language="bash"
        code={`# Conteúdo direto na tela
cat nota.txt
# Aprendendo Kali Linux
# Hoje vou estudar comandos básicos
# Praticar é tudo

# Com números de linha
cat -n nota.txt
#      1  Aprendendo Kali Linux
#      2  Hoje vou estudar comandos básicos
#      3  Praticar é tudo

# Junta vários arquivos (literalmente "concatenate" — daí o nome)
cat nota.txt uma_linha.txt`}
      />

      <h3>3.2. less — leitura paginada (para arquivos grandes)</h3>
      <p>
        Quando o arquivo tem centenas de linhas, <code>cat</code> derrama tudo
        na tela. Use <code>less</code>:
      </p>
      <CodeBlock
        language="bash"
        code={`# Abre uma "tela cheia" navegável
less /etc/services

# Dentro do less:
# ↑ ↓        — uma linha por vez
# Espaço     — uma página para frente
# b          — uma página para trás
# /palavra   — busca
# n          — próxima ocorrência
# G          — fim do arquivo
# g          — começo
# q          — sair`}
      />

      <h3>3.3. head e tail — começo e fim</h3>
      <CodeBlock
        language="bash"
        code={`# Primeiras 10 linhas (padrão)
head nota.txt

# Primeiras 3 linhas
head -n 3 /etc/passwd

# Últimas 10 linhas (padrão)
tail nota.txt

# Últimas 5 linhas
tail -n 5 /var/log/syslog

# Acompanhar um arquivo em tempo real (ótimo para logs ao vivo)
sudo tail -f /var/log/auth.log
# Pressione Ctrl + C para parar`}
      />

      <PracticeBox
        title="3 — Crie e leia"
        goal="Criar um arquivo com 5 linhas e usar 3 comandos de leitura diferentes."
        command={`cd ~/lab
echo "Linha 1" > musicas.txt
echo "Linha 2" >> musicas.txt
echo "Linha 3" >> musicas.txt
echo "Linha 4" >> musicas.txt
echo "Linha 5" >> musicas.txt

cat musicas.txt
head -n 2 musicas.txt
tail -n 2 musicas.txt`}
        expected={`Linha 1
Linha 2
Linha 3
Linha 4
Linha 5
Linha 1
Linha 2
Linha 4
Linha 5`}
        verify="cat mostrou as 5 linhas, head mostrou as 2 primeiras, tail mostrou as 2 últimas."
      />

      <h2>4. Copiar, mover, renomear, apagar</h2>
      <CodeBlock
        language="bash"
        code={`# Copiar — original continua existindo
cp nota.txt nota_backup.txt

# Copiar uma pasta inteira (precisa de -r, "recursivo")
cp -r lab lab_copia

# Mover (também serve para renomear)
mv nota_backup.txt backup_da_nota.txt
mv backup_da_nota.txt /tmp/      # move para outra pasta

# Apagar arquivo — irreversível, sem lixeira!
# Use -i para o sistema PERGUNTAR antes de apagar (recomendado para iniciante)
rm -i vazio.txt

# Apagar pasta vazia (só funciona se estiver vazia mesmo)
rmdir pasta_vazia

# Apagar pasta com conteúdo — sempre com -i para confirmar cada arquivo
rm -ri lab_copia

# Quando ganhar confiança, pode usar -r sem -i:
# rm -r lab_copia
#
# A flag -f ("force") pula TODAS as perguntas e ignora erros.
# NÃO use -f como iniciante. Erros com -rf são irreversíveis.`}
      />

      <AlertBox type="danger" title="Por que esta página NÃO ensina rm -rf">
        <p>
          Não existe lixeira no terminal. Um <code>rm</code> bem-sucedido apaga
          <strong> para sempre</strong>. A combinação <code>-rf</code> apaga
          tudo recursivamente <strong>sem perguntar nada</strong> e sem parar
          em erros.
        </p>
        <p>
          Como iniciante, use sempre <code>rm -i</code> (pergunta antes de cada
          arquivo) ou <code>rm -ri</code> para pastas. Existem casos famosos de
          gente que rodou <code>rm -rf /</code> e destruiu o sistema inteiro,
          ou que apagou anos de trabalho com um espaço a mais no caminho. Você
          aprenderá <code>-rf</code> mais tarde, quando souber o que está
          fazendo.
        </p>
      </AlertBox>

      <h2>5. Uma estrutura de pastas mais séria</h2>
      <CodeBlock
        language="bash"
        code={`# Cria uma árvore de pastas de uma vez (-p cria os intermediários)
mkdir -p projeto/notas/2026
mkdir -p projeto/scripts
mkdir -p projeto/relatorios

# Veja a estrutura
ls -R projeto

# Saída:
# projeto:
# notas  relatorios  scripts
#
# projeto/notas:
# 2026
#
# projeto/notas/2026:
#
# projeto/relatorios:
#
# projeto/scripts:`}
      />

      <p>
        Se você tiver o <code>tree</code> instalado, dá para visualizar como
        gráfico:
      </p>
      <CodeBlock
        language="bash"
        code={`# Instalar tree
sudo apt install -y tree

# Mostrar como árvore
tree projeto

# Saída:
# projeto
# ├── notas
# │   └── 2026
# ├── relatorios
# └── scripts`}
      />

      <h2>6. Permissões — quem pode ler, escrever, executar</h2>
      <p>
        Cada arquivo tem três classes de "donos" (proprietário, grupo,
        todos) e três permissões (ler, escrever, executar). Você vê isso
        no <code>ls -l</code>:
      </p>
      <CodeBlock
        language="bash"
        code={`ls -l nota.txt
# -rw-r--r-- 1 kali kali 87 Apr 25 16:10 nota.txt
#  ↑↑↑↑↑↑↑↑↑
#  │└┴┘└┴┘└┴┘
#  │ u  g  o
#  │ rw- r-- r--
#  │
#  └── tipo: - = arquivo, d = pasta, l = link

# Trocar permissões (modo numérico)
chmod 644 nota.txt   # rw- r-- r-- (padrão para arquivos)
chmod 755 script.sh  # rwx r-x r-x (executável por todos)
chmod 700 segredo    # rwx --- ---  (só você)

# Modo simbólico
chmod +x script.sh   # adiciona execução para todos
chmod u+w arquivo    # adiciona escrita para o dono`}
      />

      <PracticeBox
        title="4 — Permissões na prática"
        goal="Tornar um arquivo executável e depois rodá-lo."
        steps={[
          "Crie um script com echo: echo 'echo Olá mundo' > ola.sh.",
          "Tente rodar: ./ola.sh — vai dar erro de permissão.",
          "Dê permissão de execução: chmod +x ola.sh.",
          "Tente rodar de novo: ./ola.sh — agora funciona.",
        ]}
        command={`echo 'echo Olá mundo' > ola.sh
./ola.sh
chmod +x ola.sh
./ola.sh`}
        expected={`bash: ./ola.sh: Permission denied
Olá mundo`}
        verify="A primeira tentativa deu erro, depois do chmod +x o script rodou e imprimiu 'Olá mundo'."
      />

      <h2>7. Limpando o seu laboratório</h2>
      <p>
        Quando terminar de praticar, jogue tudo fora para começar limpo
        amanhã:
      </p>
      <CodeBlock
        language="bash"
        code={`# Volte para a pasta pessoal
cd ~

# Apague a pasta de testes inteira
rm -r lab

# Confirme
ls`}
      />

      <h2>8. Próximo passo</h2>
      <p>
        Agora que você sabe criar e manipular arquivos, está pronto para o{" "}
        <Link href="/terminal">
          <a className="underline font-semibold text-primary">
            Terminal Essencial
          </a>
        </Link>
        : pipes, redirecionamento, busca avançada, expressões regulares,
        atalhos. Tudo isso vai fazer sentido porque você tem arquivos para
        experimentar.
      </p>

      <div className="mt-8 flex justify-end">
        <Link href="/terminal">
          <button className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Ir para Terminal Essencial <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </PageContainer>
  );
}
