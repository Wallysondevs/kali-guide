import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Navegacao() {
  return (
    <PageContainer
      title="Navegação no shell"
      subtitle="cd, pushd, fzf, fd, broot — atravessar o filesystem do Kali (e do alvo) na velocidade do pensamento."
      difficulty="iniciante"
      timeToRead="16 min"
    >
      <h2>cd, pwd, ls — o básico que todo mundo já sabe (ou acha que sabe)</h2>
      <CommandTable
        title="Comandos elementares com pegadinhas"
        variations={[
          { cmd: "cd", desc: "Sem args, vai para $HOME.", output: "= cd ~" },
          { cmd: "cd -", desc: "Volta para o diretório anterior (toggle).", output: "/var/www → /tmp → cd - → /var/www" },
          { cmd: "cd ..", desc: "Sobe um nível.", output: "cd ../.. sobe dois." },
          { cmd: "cd ~user", desc: "Vai para o HOME de outro usuário.", output: "cd ~root → /root (se permitido)" },
          { cmd: "pwd", desc: "Print working directory.", output: "/home/wallyson/labs/htb" },
          { cmd: "pwd -P", desc: "Resolve symlinks (caminho REAL no disco).", output: "/mnt/nvme/labs/htb (se /home/.../labs era symlink)" },
          { cmd: "ls -lah", desc: "Long, all (inclui ocultos), human-readable.", output: "drwxr-xr-x ... 4.2K Apr 3 09:12 .git" },
          { cmd: "ls -lt | head", desc: "Ordena por data, mais recente primeiro.", output: "Útil para ver o que foi modificado." },
          { cmd: "ls -lS", desc: "Ordena por tamanho.", output: "" },
          { cmd: "ls -R", desc: "Recursivo.", output: "Use com cuidado em /." },
        ]}
      />

      <h2>pushd / popd / dirs — pilha de diretórios</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "pushd /etc",
            out: "/etc ~",
            outType: "info",
          },
          {
            cmd: "pushd /var/log",
            out: "/var/log /etc ~",
            outType: "info",
          },
          {
            cmd: "pushd /tmp",
            out: "/tmp /var/log /etc ~",
            outType: "info",
          },
          {
            cmd: "dirs -v",
            out: ` 0  /tmp
 1  /var/log
 2  /etc
 3  ~`,
            outType: "default",
          },
          {
            comment: "popd remove o topo da pilha e cd para o anterior",
            cmd: "popd",
            out: "/var/log /etc ~",
            outType: "info",
          },
          {
            comment: "pula direto para o índice 2",
            cmd: "pushd +2",
            out: "~ /var/log /etc",
            outType: "info",
          },
        ]}
      />

      <p>
        Em pentest, você vive entre <code>/tmp</code> (loot), <code>~/tools</code>,
        <code>/opt/&lt;ferramenta&gt;</code> e o diretório do engagement. <code>pushd</code> evita
        digitar caminhos longos repetidamente.
      </p>

      <h2>autocd e CDPATH</h2>
      <CodeBlock
        language="bash"
        title="~/.bashrc ou ~/.zshrc"
        code={`# autocd: digitar só o nome de um dir já entra nele
shopt -s autocd          # bash
# setopt autocd          # zsh

# CDPATH: lista de "diretórios base" para cd
export CDPATH=".:$HOME:$HOME/labs:$HOME/tools:/opt"

# agora 'cd htb' funciona de qualquer lugar se ~/labs/htb existir`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "cd htb",
            out: "/home/wallyson/labs/htb",
            outType: "info",
          },
          {
            cmd: "cd metasploit-framework",
            out: "/opt/metasploit-framework",
            outType: "info",
          },
        ]}
      />

      <h2>find vs locate vs fd</h2>
      <CommandTable
        title="3 ferramentas, 3 filosofias"
        variations={[
          { cmd: "find / -name 'flag.txt' 2>/dev/null", desc: "Sempre disponível, percorre tudo, lento.", output: "/root/flag.txt" },
          { cmd: "find / -type f -size +100M -mtime -7", desc: "Filtros poderosos: tipo, tamanho, data.", output: "Achou só arquivos > 100M modificados nos últimos 7 dias." },
          { cmd: "find / -perm -u+s 2>/dev/null", desc: "SUID files — clássico de PrivEsc Linux.", output: "/usr/bin/sudo\\n/usr/bin/passwd\\n..." },
          { cmd: 'find . -name "*.bak" -delete', desc: "Combinada com -exec ou -delete.", output: "Cuidado." },
          { cmd: "locate flag.txt", desc: "Instantâneo (usa banco). Atualize com sudo updatedb.", output: "/root/flag.txt\\n/var/backups/flag.txt" },
          { cmd: "sudo updatedb", desc: "Reconstroi o banco do locate.", output: "Roda em background diariamente." },
          { cmd: "fd flag", desc: "fd = alternativa moderna, regex por default, respeita .gitignore.", output: "labs/htb/blue/flag.txt" },
          { cmd: "fd -e py exploit", desc: "Filtra por extensão.", output: "exploits/cve-2024.py\\nexploits/sql-exploit.py" },
          { cmd: "fd -t f -x grep -l 'BEGIN PRIVATE' {}", desc: "Combine com -x para xargs implícito.", output: "Acha private keys SSH/TLS espalhadas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install fd-find -y && sudo ln -sf /usr/bin/fdfind /usr/local/bin/fd",
            out: `Setting up fd-find (9.0.0-3) ...
(symlink criado)`,
            outType: "success",
          },
          {
            cmd: "fd --version",
            out: "fd 9.0.0",
            outType: "info",
          },
        ]}
      />

      <h2>fzf — fuzzy finder universal</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install fzf -y",
            out: "Setting up fzf (0.55.0-1) ...",
            outType: "info",
          },
          {
            comment: "ative no shell",
            cmd: "echo 'source /usr/share/doc/fzf/examples/key-bindings.bash' >> ~/.bashrc",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "ou para zsh:",
            cmd: "echo 'source /usr/share/doc/fzf/examples/key-bindings.zsh' >> ~/.zshrc",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Atalhos fzf após instalado"
        variations={[
          { cmd: "Ctrl+R", desc: "Busca fuzzy no histórico (substitui o reverse-i-search).", output: "Pesquisa interativa em todo ~/.bash_history." },
          { cmd: "Ctrl+T", desc: "Insere caminho de arquivo escolhido fuzzy no comando atual.", output: "vim <Ctrl+T> → escolhe arquivo → insere." },
          { cmd: "Alt+C", desc: "cd para diretório fuzzy.", output: "Lista subdir, escolhe, cd." },
          { cmd: "fzf --preview 'cat {}'", desc: "Preview ao lado.", output: "Combine com bat para syntax highlighting." },
          { cmd: "fd -t f | fzf", desc: "Pipe qualquer lista para fzf.", output: "Funciona com docker ps, kubectl get, etc." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "exemplo: encontrar e abrir um arquivo .conf rapidamente",
            cmd: "vim $(fd -e conf | fzf --preview 'bat --color=always {}')",
            out: `> nginx
  /etc/nginx/nginx.conf
  /etc/nginx/conf.d/default.conf
  /etc/nginx/sites-available/phishing.conf
  ┌─────────── preview ───────────┐
  │ user www-data;                │
  │ worker_processes auto;        │
  │ ...                           │
  └───────────────────────────────┘`,
            outType: "default",
          },
        ]}
      />

      <h2>z / zoxide — cd que aprende</h2>
      <p>
        Substitui o <code>cd</code> tradicional registrando frequência + recência. Após visitar
        <code>~/labs/htb/blue</code> uma vez, basta <code>z blue</code> de qualquer lugar.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install zoxide -y && echo 'eval \"$(zoxide init bash)\"' >> ~/.bashrc",
            out: "Setting up zoxide (0.9.4-1) ...",
            outType: "info",
          },
          {
            cmd: "z labs",
            out: "/home/wallyson/labs",
            outType: "success",
          },
          {
            cmd: "zi",
            out: `> blue
  /home/wallyson/labs/htb/blue
  /home/wallyson/labs/htb/forge
  (interactive selection com fzf)`,
            outType: "default",
          },
        ]}
      />

      <h2>broot — árvore navegável</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install broot -y && br --install",
            out: `Broot needs to install some shell functions...
Successfully installed.`,
            outType: "info",
          },
          {
            cmd: "br",
            out: `~/labs/htb
├── blue/
│   ├── flag.txt
│   ├── nmap.gnmap
│   └── poc.py
├── forge/
└── lame/
   └── recon/
> █`,
            outType: "default",
          },
        ]}
      />

      <h2>mc — Midnight Commander</h2>
      <p>
        Two-pane file manager TUI (estilo Norton Commander). Excelente quando você está em SSH
        sem GUI e precisa copiar/comparar arquivos rapidamente. Inclui visualizador hex, editor
        embutido e suporte a SFTP.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install mc -y && mc",
            out: `┌── Left ──────────┐ ┌── Right ─────────┐
│ ..               │ │ ..                │
│ /tools           │ │ /loot             │
│ /labs            │ │ flag.txt          │
│ recon.sh*        │ │ nmap.xml          │
└──────────────────┘ └──────────────────┘
1Help  2Menu  3View  4Edit  5Copy  6Move  7Mkdir  8Del  9Pull  10Quit`,
            outType: "default",
          },
        ]}
      />

      <h2>Atalhos de linha do shell que mudam o jogo</h2>
      <CommandTable
        title="Readline keybindings (Bash/Zsh padrão emacs)"
        variations={[
          { cmd: "Ctrl+A / Ctrl+E", desc: "Início / fim da linha.", output: "" },
          { cmd: "Ctrl+L", desc: "Limpa a tela (= clear).", output: "" },
          { cmd: "Ctrl+U / Ctrl+K", desc: "Apaga até o início / fim da linha.", output: "Ctrl+U útil quando digitou senha errada e quer limpar tudo." },
          { cmd: "Ctrl+W", desc: "Apaga palavra anterior.", output: "" },
          { cmd: "Ctrl+R", desc: "Reverse search no histórico.", output: "Ctrl+R de novo para próxima ocorrência." },
          { cmd: "Ctrl+G", desc: "Cancela busca.", output: "" },
          { cmd: "Alt+. (ou Esc + .)", desc: "Insere o último argumento do comando anterior.", output: "Repete para args ainda mais antigos." },
          { cmd: "Ctrl+Y", desc: "Yank: cola o que foi 'kill'ado por Ctrl+U/K/W.", output: "Clipboard separado do sistema." },
          { cmd: "Ctrl+C", desc: "Cancela linha atual sem executar.", output: "" },
          { cmd: "Ctrl+D", desc: "EOF: fecha shell se linha vazia.", output: "Mais educado que digitar exit." },
          { cmd: "!!", desc: "Repete o último comando.", output: "sudo !! = roda o último com sudo." },
          { cmd: "!$", desc: "Último argumento do último comando.", output: "ls /etc/nginx → cd !$ → cd /etc/nginx" },
          { cmd: "!nmap", desc: "Último comando que começa com 'nmap'.", output: "" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /etc/nginx/sites-available/",
            out: `default  phishing.conf  evilginx.conf`,
            outType: "default",
          },
          {
            cmd: "sudo vim !$/phishing.conf",
            out: "(abre /etc/nginx/sites-available/phishing.conf)",
            outType: "muted",
          },
          {
            cmd: "sudo !!",
            out: "(re-executa o vim sob sudo)",
            outType: "info",
          },
        ]}
      />

      <h2>Symlinks: navegar com cabeça</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ln -s /opt/metasploit-framework ~/msf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -l ~/msf",
            out: "lrwxrwxrwx 1 wallyson wallyson 26 Apr 3 09:12 /home/wallyson/msf -> /opt/metasploit-framework",
            outType: "info",
          },
          {
            cmd: "cd ~/msf && pwd",
            out: "/home/wallyson/msf",
            outType: "default",
          },
          {
            cmd: "cd ~/msf && pwd -P",
            out: "/opt/metasploit-framework",
            outType: "default",
          },
        ]}
      />

      <AlertBox type="warning" title="Symlink trap em pentest">
        <p>
          Symlinks podem ser vetor de ataque (TOCTOU, symlink race em <code>/tmp</code>). E em
          recon de loot, sempre rode <code>find -type l</code> para mapear symlinks antes de
          copiar uma árvore — você pode acabar copiando <code>/etc/shadow</code> sem perceber.
        </p>
      </AlertBox>

      <PracticeBox
        title="Setup de ferramentas de navegação rápida"
        goal="Em uma VM Kali, instalar fd, fzf, zoxide e configurar autocd + CDPATH para HTB/THM workflow."
        steps={[
          "Instale fd-find, fzf e zoxide via apt.",
          "Crie ~/labs/htb e ~/labs/thm (vazios).",
          "Edite ~/.bashrc adicionando: shopt -s autocd; CDPATH=.:~/labs:/opt; e source dos key-bindings do fzf; e eval do zoxide.",
          "Reinicie shell.",
          "Teste: cd htb (deve funcionar), depois Ctrl+R para buscar comando antigo, depois 'fd -e conf' em /etc.",
        ]}
        command={`sudo apt install -y fd-find fzf zoxide bat
sudo ln -sf /usr/bin/fdfind /usr/local/bin/fd
mkdir -p ~/labs/{htb,thm}

cat >> ~/.bashrc <<'EOF'
shopt -s autocd
export CDPATH=".:$HOME/labs:/opt"
source /usr/share/doc/fzf/examples/key-bindings.bash
eval "$(zoxide init bash)"
alias ls='ls --color=auto'
alias ll='ls -lah'
alias cat='batcat --paging=never --style=plain'
EOF

exec bash
cd htb && pwd
fd -e conf . /etc | head -5`}
        expected={`/home/wallyson/labs/htb
/etc/nginx/nginx.conf
/etc/wpa_supplicant/wpa_supplicant.conf
/etc/dpkg/dpkg.cfg.d/...`}
        verify="Se cd htb funcionou de qualquer lugar e fd retornou .conf rapidamente, seu workflow está turbinado."
      />

      <AlertBox type="info" title="Em jump host de cliente, mantenha o conservador">
        <p>
          Ferramentas modernas (fd, fzf, zoxide, broot) são ótimas no SEU Kali. Em servidor do
          cliente: assuma só <code>cd</code>, <code>ls</code>, <code>find</code>, <code>grep</code>.
          Não instale nada na máquina do alvo (regra de ouro: mínimo footprint).
        </p>
      </AlertBox>
    </PageContainer>
  );
}
