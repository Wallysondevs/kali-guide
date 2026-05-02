import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Interface() {
  return (
    <PageContainer
      title="Interface & Desktop"
      subtitle="Ambientes gráficos do Kali (XFCE, GNOME, KDE, i3), kali-undercover, terminais alternativos e customização do shell."
      difficulty="iniciante"
      timeToRead="10 min"
    >
      <h2>Ambientes Gráficos (DE) disponíveis</h2>
      <p>
        O Kali Linux suporta vários ambientes de desktop. O padrão atual é o <strong>XFCE</strong>{" "}
        (desde 2019.4), conhecido por ser leve e eficiente — perfeito para VMs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { name: "XFCE", status: "Padrão atual", desc: "Leve, rápido e eficiente. Ideal para VMs e hardware limitado.", ram: "~300 MB" },
          { name: "GNOME", status: "Disponível", desc: "Moderno e elegante. Mais recursos, consome mais memória.", ram: "~700 MB" },
          { name: "KDE Plasma", status: "Disponível", desc: "Altamente customizável. Visual moderno, parecido com Windows.", ram: "~600 MB" },
          { name: "i3/i3-gaps", status: "Avançado", desc: "Window manager em mosaico. Extremamente produtivo para linha de comando.", ram: "~100 MB" },
        ].map((de, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground mt-0 border-0 text-base">{de.name}</h3>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{de.status}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{de.desc}</p>
            <div className="text-xs text-muted-foreground">RAM: <span className="text-foreground font-mono">{de.ram}</span></div>
          </div>
        ))}
      </div>

      <h2>Identificar o DE atual</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "qual sessão está ativa agora?",
            cmd: "echo $XDG_CURRENT_DESKTOP",
            out: "XFCE",
            outType: "info",
          },
          {
            cmd: "echo $DESKTOP_SESSION",
            out: "lightdm-xsession",
            outType: "default",
          },
          {
            comment: "versão do Kali e kernel",
            cmd: "lsb_release -a && uname -a",
            out: `No LSB modules are available.
Distributor ID: Kali
Description:    Kali GNU/Linux Rolling
Release:        2025.2
Codename:       kali-rolling
Linux kali 6.11.0-kali3-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 (2025-02-14) x86_64 GNU/Linux`,
            outType: "success",
          },
          {
            comment: "uso de memória do DE",
            cmd: "free -h",
            out: `               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       1.3Gi       4.8Gi        82Mi       1.6Gi       6.4Gi
Swap:          2.0Gi          0B       2.0Gi`,
            outType: "muted",
          },
        ]}
      />

      <h2>Instalando outros ambientes</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "GNOME completo (~1.2 GB de pacotes)",
            cmd: "sudo apt update && sudo apt install -y kali-desktop-gnome",
            out: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  gnome-shell gnome-session gnome-terminal nautilus gdm3 kali-desktop-gnome
  (+182 dependências)
Need to get 412 MB of archives.
After this operation, 1.243 MB of additional disk space will be used.
[...]
Setting up gnome-shell (45.3-1) ...
Setting up gdm3 (45.0.1-3) ...
Setting up kali-desktop-gnome (2025.2.0) ...
Processing triggers for desktop-file-utils (0.27-1) ...`,
            outType: "success",
          },
          {
            comment: "KDE Plasma",
            cmd: "sudo apt install -y kali-desktop-kde",
            out: `The following NEW packages will be installed:
  plasma-desktop plasma-workspace konsole dolphin sddm kali-desktop-kde
  (+204 dependências)
Need to get 521 MB of archives.
After this operation, 1.621 MB of additional disk space will be used.
[...]
Setting up sddm (0.21.0-3) ...
Setting up kali-desktop-kde (2025.2.0) ...`,
            outType: "info",
          },
          {
            comment: "i3 — window manager tiling (super leve)",
            cmd: "sudo apt install -y i3 i3status i3lock dmenu rofi",
            out: `The following NEW packages will be installed:
  i3 i3-wm i3lock i3status dmenu rofi suckless-tools
Need to get 4.842 kB of archives.
[...]
Setting up i3-wm (4.23-1) ...
Setting up i3 (4.23-1) ...`,
            outType: "success",
          },
          {
            comment: "alternar DE no login (qual sessionmanager usar)",
            cmd: "sudo update-alternatives --config x-session-manager",
            out: `There are 3 choices for the alternative x-session-manager.

  Selection    Path                            Priority   Status
------------------------------------------------------------
* 0            /usr/bin/xfce4-session           50        auto mode
  1            /usr/bin/gnome-session           40        manual mode
  2            /usr/bin/startplasma-x11         30        manual mode
  3            /usr/bin/i3                      20        manual mode

Press <enter> to keep the current choice[*], or type selection number:`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="info" title="Login Manager (display manager)">
        Em vez de mexer no <code>x-session-manager</code>, você pode escolher o DE direto na tela
        de login: clique no ícone de engrenagem antes de digitar a senha. O Kali usa{" "}
        <strong>LightDM</strong> por padrão; instalar GNOME pode trocar para{" "}
        <strong>GDM3</strong> automaticamente.
      </AlertBox>

      <h2>Atalhos do XFCE (padrão)</h2>
      <div className="space-y-2 my-6">
        {[
          ["Super / Windows", "Abre o menu de aplicativos (whisker)"],
          ["Ctrl + Alt + T", "Abre o terminal (xfce4-terminal)"],
          ["Alt + F4", "Fecha a janela atual"],
          ["Alt + Tab", "Alterna entre janelas"],
          ["Ctrl + Alt + Seta", "Navega entre workspaces"],
          ["Alt + F2", "Abre caixa de execução rápida (xfrun4)"],
          ["Print Screen", "Captura de tela (xfce4-screenshooter)"],
          ["Super + D", "Mostrar/ocultar área de trabalho"],
          ["Super + L", "Bloqueia a tela (light-locker)"],
          ["Ctrl + Alt + Del", "Sair / desligar / reiniciar"],
        ].map(([key, action], i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <code className="px-2 py-1 bg-muted rounded text-primary font-mono text-xs whitespace-nowrap">{key}</code>
            <span className="text-muted-foreground">{action}</span>
          </div>
        ))}
      </div>

      <h2>kali-undercover — modo Windows 10</h2>
      <p>
        O Kali tem um modo especial que faz a interface parecer o Windows 10. Útil para uso
        discreto em ambientes públicos (cafés, salas de espera, transporte) onde a tela roxa do
        Kali chamaria atenção.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ativar — troca papel de parede, ícones, painel, tema",
            cmd: "kali-undercover",
            out: `Switching to undercover mode...
✓ Wallpaper changed
✓ Theme set to Windows-10
✓ Panel layout reorganized
✓ Icon theme set to Windows-10-Icons
✓ Cursor theme: Windows-10
Done. Run again to disable.`,
            outType: "success",
          },
          {
            comment: "executar de novo desativa",
            cmd: "kali-undercover",
            out: `Disabling undercover mode...
✓ Restored Kali defaults
Done.`,
            outType: "info",
          },
        ]}
      />

      <h2>Terminal: o coração do Kali</h2>
      <p>
        No Kali, o terminal é a ferramenta principal. O padrão no XFCE é o{" "}
        <code>xfce4-terminal</code>, mas há alternativas mais produtivas com splits e abas
        avançadas.
      </p>

      <CommandTable
        title="Emuladores de terminal mais usados"
        variations={[
          { cmd: "xfce4-terminal", desc: "Padrão do XFCE. Leve, abas, perfis.", output: "Já vem instalado." },
          { cmd: "gnome-terminal", desc: "Padrão do GNOME. Bom suporte a temas.", output: "Vem com kali-desktop-gnome." },
          { cmd: "konsole", desc: "Padrão do KDE. Splits, profiles, scripting via D-Bus.", output: "Vem com kali-desktop-kde." },
          { cmd: "tilix", desc: "Splits horizontais e verticais arrastáveis. GTK3.", output: "sudo apt install -y tilix" },
          { cmd: "terminator", desc: "Múltiplos painéis em grade. Layouts salvos.", output: "sudo apt install -y terminator" },
          { cmd: "alacritty", desc: "GPU-accelerated. Rápido demais. Config em YAML.", output: "sudo apt install -y alacritty" },
          { cmd: "kitty", desc: "GPU-accelerated. Tabs, splits, ligaduras de fonte.", output: "sudo apt install -y kitty" },
          { cmd: "qterminal", desc: "Leve, baseado em Qt. Vem com LXQt.", output: "sudo apt install -y qterminal" },
        ]}
      />

      <h2>Instalando alternativas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y tilix terminator alacritty",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  tilix tilix-common terminator alacritty
Need to get 3.421 kB of archives.
After this operation, 12.4 MB of additional disk space will be used.
[...]
Setting up tilix (1.9.6-2) ...
Setting up terminator (2.1.3-1) ...
Setting up alacritty (0.13.2-1) ...`,
            outType: "success",
          },
          {
            comment: "abrir tilix com layout split",
            cmd: "tilix --action=app-new-session",
            out: "(abre janela tilix)",
            outType: "muted",
          },
          {
            comment: "verificar atalhos do tilix",
            cmd: "gsettings list-recursively com.gexperts.Tilix.Keybindings | head -5",
            out: `com.gexperts.Tilix.Keybindings session-add-right '<Control><Alt>r'
com.gexperts.Tilix.Keybindings session-add-down '<Control><Alt>d'
com.gexperts.Tilix.Keybindings terminal-close '<Control><Shift>w'
com.gexperts.Tilix.Keybindings terminal-zoom-in '<Control>plus'
com.gexperts.Tilix.Keybindings terminal-zoom-out '<Control>minus'`,
            outType: "info",
          },
        ]}
      />

      <h2>Configuração do Alacritty</h2>
      <p>
        O <strong>Alacritty</strong> é configurado por arquivo TOML em{" "}
        <code>~/.config/alacritty/alacritty.toml</code>. Exemplo otimizado:
      </p>
      <CodeBlock
        language="toml"
        title="~/.config/alacritty/alacritty.toml"
        code={`[window]
opacity = 0.92
padding = { x = 8, y = 8 }
decorations = "full"
dynamic_title = true

[font]
size = 11.5
normal  = { family = "JetBrainsMono Nerd Font", style = "Regular" }
bold    = { family = "JetBrainsMono Nerd Font", style = "Bold" }
italic  = { family = "JetBrainsMono Nerd Font", style = "Italic" }

[colors.primary]
background = "#0b0e14"
foreground = "#bfbdb6"

[cursor]
style = { shape = "Beam", blinking = "On" }

[scrolling]
history = 50000`}
      />

      <h2>Shell padrão: Zsh</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "qual shell estou usando?",
            cmd: "echo $SHELL && cat /etc/passwd | grep $(whoami)",
            out: `/usr/bin/zsh
wallyson:x:1000:1000:Wallyson,,,:/home/wallyson:/usr/bin/zsh`,
            outType: "info",
          },
          {
            comment: "trocar para bash (se quiser voltar)",
            cmd: "chsh -s /bin/bash",
            out: `Password: ********
Shell trocado.
(reabrir terminal para aplicar)`,
            outType: "muted",
          },
          {
            comment: "voltar pro zsh (recomendado no Kali)",
            cmd: "chsh -s /usr/bin/zsh",
            out: "Password: ********\nShell trocado.",
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Por que Zsh é o padrão no Kali?">
        Desde o Kali <strong>2020.4</strong>, o shell padrão é o <strong>Zsh</strong> (não bash).
        Motivos: autocompletar muito mais inteligente, glob avançado (<code>**/*.txt</code>),
        histórico compartilhado entre abas, tema colorido por padrão (<code>kali-tweaks</code>),
        e ecossistema rico de plugins (oh-my-zsh, powerlevel10k).
      </AlertBox>

      <h2>Oh My Zsh + Powerlevel10k</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) instalar oh-my-zsh",
            cmd: 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
            out: `Cloning Oh My Zsh...
remote: Enumerating objects: 1421, done.
remote: Total 1421 (delta 0), reused 0 (delta 0), pack-reused 1421
Receiving objects: 100% (1421/1421), 3.42 MiB | 8.21 MiB/s, done.

         __                                     __
  ____  / /_     ____ ___  __  __   ____  _____/ /_
 / __ \\/ __ \\   / __ \`__ \\/ / / /  /_  / / ___/ __ \\
/ /_/ / / / /  / / / / / / /_/ /    / /_(__  ) / / /
\\____/_/ /_/  /_/ /_/ /_/\\__, /    /___/____/_/ /_/
                        /____/                       ....is now installed!

Looking for an existing zsh config...
[oh-my-zsh] You can now try it out by running: zsh`,
            outType: "success",
          },
          {
            comment: "2) clonar powerlevel10k",
            cmd: "git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k",
            out: `Cloning into '/home/wallyson/.oh-my-zsh/custom/themes/powerlevel10k'...
remote: Enumerating objects: 1342, done.
Receiving objects: 100% (1342/1342), 882.42 KiB | 4.21 MiB/s, done.
Resolving deltas: 100% (612/612), done.`,
            outType: "info",
          },
          {
            comment: "3) ativar o tema (editar ~/.zshrc)",
            cmd: 'sed -i \'s|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|\' ~/.zshrc && tail -3 ~/.zshrc',
            out: `ZSH_THEME="powerlevel10k/powerlevel10k"
plugins=(git sudo command-not-found history-substring-search)
source $ZSH/oh-my-zsh.sh`,
            outType: "default",
          },
          {
            comment: "4) configurar (wizard interativo)",
            cmd: "p10k configure",
            out: `This is Powerlevel10k configuration wizard. You are about to
configure your prompt. It will ask you a few questions and
configure your prompt to your preference.

(?)  Does this look like a diamond (rotated square)? ◇
        Reference: https://...

  (y) Yes.
  (n) No.
  (q) Quit and do nothing.

Choice [ynq]:`,
            outType: "warning",
          },
        ]}
      />

      <h2>Plugins úteis para Zsh</h2>
      <CommandTable
        title="Plugins recomendados em ~/.zshrc"
        variations={[
          { cmd: "git", desc: "Aliases e funções git (gst, gco, gp, gl…).", output: "Built-in no oh-my-zsh." },
          { cmd: "sudo", desc: "Aperte ESC duas vezes para prefixar 'sudo' no comando atual.", output: "Built-in." },
          { cmd: "history-substring-search", desc: "Setas ↑/↓ filtram histórico pelo texto digitado.", output: "Built-in." },
          { cmd: "zsh-autosuggestions", desc: "Sugestões em cinza (do histórico). →  para aceitar.", output: "git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions" },
          { cmd: "zsh-syntax-highlighting", desc: "Colore comandos válidos/inválidos enquanto digita.", output: "git clone https://github.com/zsh-users/zsh-syntax-highlighting $ZSH_CUSTOM/plugins/zsh-syntax-highlighting" },
          { cmd: "fzf", desc: "Fuzzy finder. Ctrl+R busca no histórico de forma incrível.", output: "sudo apt install -y fzf" },
          { cmd: "z", desc: "Pula direto para diretórios mais usados (z proj).", output: "Built-in no oh-my-zsh." },
          { cmd: "command-not-found", desc: "Sugere o pacote a instalar quando você erra um comando.", output: "Built-in." },
        ]}
      />

      <h2>Editor: do nano ao Neovim</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali já vem com nano e vim-tiny",
            cmd: "which nano vim && nano --version | head -1",
            out: `/usr/bin/nano
/usr/bin/vim
 GNU nano, version 7.2`,
            outType: "info",
          },
          {
            comment: "instalar Neovim (mais moderno)",
            cmd: "sudo apt install -y neovim && nvim --version | head -2",
            out: `The following NEW packages will be installed:
  neovim neovim-runtime libvterm0
Setting up neovim (0.9.5-7) ...

NVIM v0.9.5
Build type: Release`,
            outType: "success",
          },
          {
            comment: "tornar nvim padrão para 'editor' do sistema",
            cmd: "sudo update-alternatives --config editor",
            out: `There are 3 choices for the alternative editor.

  Selection    Path                Priority   Status
------------------------------------------------------------
* 0            /bin/nano            40        auto mode
  1            /usr/bin/vim.basic   30        manual mode
  2            /usr/bin/nvim        15        manual mode

Press <enter> to keep [*], or type selection number: 2
update-alternatives: using /usr/bin/nvim to provide /usr/bin/editor`,
            outType: "warning",
          },
        ]}
      />

      <h2>Múltiplos monitores e HiDPI (xrandr)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "xrandr --listmonitors",
            out: `Monitors: 2
 0: +*eDP-1 1920/344x1080/194+0+1080  eDP-1
 1: +HDMI-1 2560/598x1440/336+0+0  HDMI-1`,
            outType: "info",
          },
          {
            comment: "monitor secundário à direita",
            cmd: "xrandr --output HDMI-1 --mode 2560x1440 --right-of eDP-1",
            out: "(silencioso — aplica imediatamente)",
            outType: "muted",
          },
          {
            comment: "escala HiDPI (telas 4K ficam minúsculas sem isso)",
            cmd: "xrandr --output eDP-1 --scale 1.25x1.25",
            out: "(silencioso — texto e UI maiores)",
            outType: "default",
          },
          {
            comment: "GUI no XFCE",
            cmd: "xfce4-display-settings",
            out: "(abre janela de configuração de displays)",
            outType: "muted",
          },
        ]}
      />

      <OutputBlock label="dica de produtividade" type="info">
{`workspaces (XFCE):  Ctrl+Alt+→ / Ctrl+Alt+←
  - Configure 4 workspaces e atribua aplicativos:
      WS1: navegador + notas
      WS2: terminal + tmux
      WS3: Burp + browser proxy
      WS4: VPN + reverse shells

tmux (multiplexador dentro do terminal):
  prefix = Ctrl+B
  Ctrl+B "      → split horizontal
  Ctrl+B %      → split vertical
  Ctrl+B d      → detach (continua rodando!)
  tmux attach   → reanexar`}
      </OutputBlock>

      <PracticeBox
        title="Setup completo do shell em 2 minutos"
        goal="Deixar seu Zsh produtivo: oh-my-zsh + powerlevel10k + autosuggestions + syntax-highlighting + fzf."
        steps={[
          "Instale oh-my-zsh com o instalador oficial.",
          "Clone o powerlevel10k em $ZSH_CUSTOM/themes/.",
          "Edite ~/.zshrc e troque ZSH_THEME para 'powerlevel10k/powerlevel10k'.",
          "Clone os plugins zsh-autosuggestions e zsh-syntax-highlighting em $ZSH_CUSTOM/plugins/.",
          "Adicione ambos no array plugins=() do ~/.zshrc.",
          "Instale fzf via apt e rode `source ~/.zshrc`.",
          "Execute `p10k configure` e responda o wizard.",
        ]}
        command={`# tudo de uma vez
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \\
  \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

git clone https://github.com/zsh-users/zsh-autosuggestions \\
  \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting \\
  \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

sudo apt install -y fzf

sed -i 's|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|' ~/.zshrc
sed -i 's|^plugins=.*|plugins=(git sudo zsh-autosuggestions zsh-syntax-highlighting fzf)|' ~/.zshrc

exec zsh
p10k configure`}
        expected={`✓ oh-my-zsh instalado
✓ tema powerlevel10k ativo
✓ sugestões em cinza enquanto você digita
✓ comandos válidos em verde, inválidos em vermelho
✓ Ctrl+R abre busca fuzzy no histórico`}
        verify="Após `exec zsh`, digite 'cd ' e veja sugestões em cinza. Aperte Ctrl+R para testar o fzf no histórico."
      />

      <AlertBox type="success" title="Próximo passo">
        Com o desktop e o terminal afiados, está na hora de aprender o sistema de arquivos
        do Linux e os comandos essenciais. O terminal é onde 90% do trabalho de pentest acontece.
      </AlertBox>
    </PageContainer>
  );
}
