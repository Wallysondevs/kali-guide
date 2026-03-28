import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Interface() {
  return (
    <PageContainer
      title="Interface & Desktop"
      subtitle="Ambientes gráficos disponíveis no Kali Linux e dicas de customização."
      difficulty="iniciante"
      timeToRead="5 min"
    >
      <h2>Ambientes Gráficos (DE)</h2>
      <p>
        O Kali Linux suporta vários ambientes de desktop. O padrão atual é o <strong>XFCE</strong> 
        (desde a versão 2019.4), conhecido por ser leve e eficiente — perfeito para VMs.
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

      <h2>Instalando outros ambientes</h2>
      <CodeBlock language="bash" code={`# Instalar GNOME
sudo apt install -y kali-desktop-gnome

# Instalar KDE Plasma
sudo apt install -y kali-desktop-kde

# Instalar i3 (window manager tiling)
sudo apt install -y i3 i3status i3lock

# Alternar entre DEs (usar update-alternatives)
sudo update-alternatives --config x-session-manager`} />

      <h2>Atalhos do XFCE (padrão)</h2>
      <div className="space-y-2 my-6">
        {[
          ["Super / Windows", "Abre o menu de aplicativos"],
          ["Ctrl + Alt + T", "Abre o terminal"],
          ["Alt + F4", "Fecha a janela atual"],
          ["Alt + Tab", "Alterna entre janelas"],
          ["Ctrl + Alt + Seta", "Navega entre workspaces"],
          ["Alt + F2", "Abre caixa de execução rápida"],
          ["Print Screen", "Captura de tela"],
          ["Super + D", "Mostrar/ocultar área de trabalho"],
        ].map(([key, action], i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <code className="px-2 py-1 bg-muted rounded text-primary font-mono text-xs whitespace-nowrap">{key}</code>
            <span className="text-muted-foreground">{action}</span>
          </div>
        ))}
      </div>

      <h2>Terminal: o coração do Kali</h2>
      <p>
        No Kali Linux, o terminal é a ferramenta principal. Os emuladores de terminal mais usados:
      </p>
      <CodeBlock language="bash" code={`# Abrir terminal (vários disponíveis)
# xfce4-terminal (padrão XFCE)
# gnome-terminal (para GNOME)
# konsole (para KDE)
# tilix — terminal com splits
# qterminal — leve e rápido

# Instalar Tilix (terminal com múltiplos painéis)
sudo apt install -y tilix

# Instalar Terminator (alternativa popular)
sudo apt install -y terminator`} />

      <h2>Modo Undercover (Windows 10)</h2>
      <p>
        O Kali tem um modo especial que faz a interface parecer o Windows 10, útil para 
        uso discreto em ambientes públicos.
      </p>
      <CodeBlock language="bash" code={`# Ativar modo undercover
kali-undercover

# Executar novamente para desativar
kali-undercover`} />

      <h2>Customizando o Terminal</h2>
      <CodeBlock language="bash" code={`# Instalar Oh My Zsh (shell produtivo)
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Instalar Powerlevel10k (tema bonito para zsh)
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Editar ~/.zshrc e definir:
# ZSH_THEME="powerlevel10k/powerlevel10k"

# Configurar p10k
p10k configure

# Instalar Neovim (editor moderno)
sudo apt install -y neovim`} />

      <AlertBox type="info" title="Shell padrão: ZSH">
        O Kali Linux usa <strong>Zsh</strong> como shell padrão (desde 2020.4), não o Bash. 
        O Zsh tem autocompletar melhorado, histórico mais inteligente e é muito mais produtivo.
      </AlertBox>

      <h2>Múltiplos Monitores e HiDPI</h2>
      <CodeBlock language="bash" code={`# Configurar displays (XFCE)
xfce4-display-settings

# Configurar resolução via linha de comando
xrandr --output HDMI-1 --mode 1920x1080 --right-of eDP-1

# Escala HiDPI (para monitores 4K)
xrandr --output eDP-1 --scale 1.25x1.25

# Verificar monitores disponíveis
xrandr --listmonitors`} />
    </PageContainer>
  );
}
