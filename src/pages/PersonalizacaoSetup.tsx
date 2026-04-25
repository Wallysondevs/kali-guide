import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { ParamsTable } from "@/components/ui/ParamsTable";
import { ArrowRight } from "lucide-react";

export default function PersonalizacaoSetup() {
  return (
    <PageContainer
      title="Personalização & Uso Diário — Custom Setup do Kali"
      subtitle="Como deixar o Kali com a sua cara: trocar ambiente gráfico, shell, temas, instalar navegadores e programas comuns. E por que ele NÃO é o sistema certo para o dia a dia."
      difficulty="iniciante"
      timeToRead="25 min"
    >
      <AlertBox type="danger" title="Antes de tudo: Kali NÃO é um sistema para uso diário">
        <p>
          O Kali Linux é uma distribuição <strong>especializada em segurança
          ofensiva</strong>. Ele roda como <code>root</code> em muitas
          situações, vem com mais de 600 ferramentas de ataque pré-instaladas
          e tem decisões de design que <strong>aumentam o risco</strong> em
          uso comum (atualizações frequentes podem quebrar pacotes, falta de
          hardening focado em desktop, drivers de placa de vídeo nem sempre
          ideais para jogos, etc.).
        </p>
        <p>
          Para uso doméstico (navegar, e-mail, vídeo, trabalho, jogos), o
          recomendado é uma distro estável: <strong>Ubuntu</strong>,{" "}
          <strong>Linux Mint</strong>, <strong>Fedora</strong> ou{" "}
          <strong>Pop!_OS</strong>. Se você precisa do Kali e do desktop ao
          mesmo tempo, o ideal é rodar Kali em <strong>VM</strong> (VirtualBox,
          VMware, QEMU/KVM) dentro de uma distro normal, ou usar{" "}
          <strong>WSL2</strong> no Windows.
        </p>
        <p>
          Dito isso — se você quer mesmo deixar seu Kali bonito e usar para
          coisas comuns, esta página te ensina como, com os <strong>cuidados
          necessários</strong>.
        </p>
      </AlertBox>

      <h2>1. Antes de mexer em qualquer coisa: faça backup</h2>
      <p>
        Personalizar significa instalar e remover pacotes, mexer em
        configuração, trocar ambiente gráfico. Qualquer coisa pode dar
        errado. Faça uma <strong>foto (snapshot)</strong> da sua VM antes,
        ou um backup das configurações que importam:
      </p>
      <CodeBlock
        language="bash"
        code={`# Backup das configurações do seu usuário (arquivos .config, .ssh, etc.)
mkdir -p ~/backups
tar czf ~/backups/dotfiles-$(date +%Y-%m-%d).tar.gz \\
  ~/.config ~/.ssh ~/.bashrc ~/.zshrc ~/.profile 2>/dev/null

# Confira o tamanho
ls -lh ~/backups/

# Liste o que está dentro
tar tzf ~/backups/dotfiles-*.tar.gz | head -20`}
      />
      <AlertBox type="info" title="Em VM, use snapshot">
        Se você está em VirtualBox/VMware, antes de fazer mudanças grandes
        (trocar de XFCE para KDE, por exemplo), tire um <strong>snapshot</strong>{" "}
        da VM. Se algo quebrar, você restaura em 10 segundos. É a maior vantagem
        de rodar Kali em VM.
      </AlertBox>

      <h2>2. Descobrir o que você tem agora</h2>
      <p>
        Antes de trocar, confirme o ambiente atual. Cole isso no terminal:
      </p>
      <CodeBlock
        language="bash"
        code={`echo "=== Ambiente atual ==="
echo "Desktop:           $XDG_CURRENT_DESKTOP"
echo "Sessão:            $DESKTOP_SESSION"
echo "Servidor gráfico:  $XDG_SESSION_TYPE"
echo "Shell:             $SHELL"
echo ""
echo "=== Display Manager (tela de login) ==="
cat /etc/X11/default-display-manager 2>/dev/null
echo ""
echo "=== Versão do Kali ==="
cat /etc/os-release | grep PRETTY_NAME`}
      />
      <p>
        No Kali padrão você verá <code>XFCE</code>, <code>x11</code>,{" "}
        <code>/usr/sbin/lightdm</code> e <code>/usr/bin/zsh</code>. Anote isso
        antes de mudar — se algo der errado, é o estado para o qual você quer
        voltar.
      </p>

      <h2>3. Trocar o ambiente gráfico (XFCE → KDE, GNOME, MATE...)</h2>
      <p>
        O Kali oferece <strong>meta-pacotes</strong> prontos para cada
        ambiente gráfico. Você não precisa configurar nada manualmente — é só
        instalar e escolher na tela de login.
      </p>

      <h3>Ambientes disponíveis</h3>
      <ParamsTable
        title="Meta-pacotes de desktop do Kali"
        params={[
          { flag: "kali-desktop-xfce", desc: "XFCE — leve, padrão do Kali. Boa performance.", exemplo: "sudo apt install kali-desktop-xfce" },
          { flag: "kali-desktop-gnome", desc: "GNOME — moderno, polido. Pesa mais.", exemplo: "sudo apt install kali-desktop-gnome" },
          { flag: "kali-desktop-kde", desc: "KDE Plasma — cheio de recursos, parecido com Windows.", exemplo: "sudo apt install kali-desktop-kde" },
          { flag: "kali-desktop-mate", desc: "MATE — tradicional, fork do GNOME 2. Estável.", exemplo: "sudo apt install kali-desktop-mate" },
          { flag: "kali-desktop-lxde", desc: "LXDE — super leve. Bom para PC antigo / pouca RAM.", exemplo: "sudo apt install kali-desktop-lxde" },
          { flag: "kali-desktop-i3", desc: "i3 — tiling window manager. Só teclado, para avançados.", exemplo: "sudo apt install kali-desktop-i3" },
          { flag: "kali-desktop-enlightenment", desc: "Enlightenment — visual diferente, animações.", exemplo: "sudo apt install kali-desktop-enlightenment" },
        ]}
      />

      <h3>Como trocar passo a passo</h3>
      <CodeBlock
        language="bash"
        code={`# 1) Atualize o sistema antes (sempre)
sudo apt update && sudo apt full-upgrade -y

# 2) Veja o que está disponível (caso queira confirmar)
apt search kali-desktop

# 3) Instale o ambiente novo (NÃO remove o antigo)
sudo apt install -y kali-desktop-kde

# 4) Faça logout (ou reinicie)
# No XFCE: clique no canto superior direito > Log Out
# Pelo terminal:
sudo systemctl restart lightdm
# (isso vai te jogar de volta na tela de login)`}
      />

      <p>
        Na tela de login, antes de digitar a senha, procure um{" "}
        <strong>ícone de engrenagem</strong> ou um <strong>menu suspenso</strong>{" "}
        no canto. Clique e escolha a sessão (<code>Plasma (X11)</code>,{" "}
        <code>GNOME</code>, <code>Xfce Session</code>, etc.). Faça login
        normalmente. Pronto, está no ambiente novo.
      </p>

      <PracticeBox
        title="Instalar e testar o KDE Plasma sem perder o XFCE"
        goal="Ter dois ambientes instalados e poder escolher um deles na tela de login. Você sempre consegue voltar ao XFCE."
        steps={[
          "Tire um snapshot da VM (se estiver em VM) — isso é seu plano de fuga.",
          "Atualize o sistema: sudo apt update && sudo apt full-upgrade -y",
          "Instale o KDE: sudo apt install -y kali-desktop-kde (vai baixar 1-3 GB)",
          "Quando terminar, faça logout pelo menu do XFCE.",
          "Na tela de login, procure o ícone de engrenagem perto do nome de usuário.",
          "Selecione 'Plasma (X11)' e faça login.",
          "Explore o KDE. Para voltar: logout, escolha 'Xfce Session', login.",
        ]}
        verify="Faça logout e login várias vezes alternando entre XFCE e KDE para confirmar que ambos funcionam. Se algum não abrir, restaure o snapshot ou rode: sudo dpkg --configure -a && sudo apt install --reinstall kali-desktop-xfce"
      />

      <h3>Trocar o display manager (a tela de login)</h3>
      <p>
        Cada ambiente tem um <strong>display manager</strong> preferido. O
        XFCE usa <code>lightdm</code>, o GNOME usa <code>gdm3</code>, o KDE
        usa <code>sddm</code>. Quando você instala um novo ambiente, o
        sistema pode te perguntar qual usar. Para mudar depois:
      </p>
      <CodeBlock
        language="bash"
        code={`# Reabre a tela de seleção do display manager
sudo dpkg-reconfigure lightdm
# (escolha entre lightdm, gdm3, sddm com as setas)

# Confirme qual está ativo agora
cat /etc/X11/default-display-manager`}
      />

      <h3>Como remover um ambiente que você não quer mais</h3>
      <AlertBox type="danger" title="NUNCA remova o ambiente que você está usando">
        Se você quer remover o XFCE, faça <strong>primeiro</strong> login no
        novo ambiente. Senão você fica sem interface gráfica e só consegue
        voltar pelo terminal (Ctrl+Alt+F2). Confirme que o novo está
        funcionando bem por uns dias antes de remover o antigo.
      </AlertBox>
      <CodeBlock
        language="bash"
        code={`# Só depois de testar bem o novo ambiente:
sudo apt remove --purge kali-desktop-xfce
sudo apt autoremove --purge`}
      />

      <h2>4. kali-tweaks — o canivete suíço oficial</h2>
      <p>
        O Kali tem uma ferramenta interativa que cuida de várias
        personalizações sem você precisar decorar comando. Roda assim:
      </p>
      <CodeBlock language="bash" code={`sudo kali-tweaks`} />
      <p>
        Abre um menu com setas e Enter. As opções incluem:
      </p>
      <ul>
        <li><strong>Metapackages</strong> — instala/remove conjuntos de ferramentas (kali-linux-large, kali-linux-everything, etc.)</li>
        <li><strong>Network Repositories</strong> — habilita repositório experimental ou bleeding-edge</li>
        <li><strong>Shell &amp; Prompt</strong> — troca entre zsh e bash, ajusta o prompt</li>
        <li><strong>Hardening</strong> — desabilita serviços inseguros</li>
        <li><strong>Virtualization</strong> — instala drivers para VirtualBox, VMware, QEMU</li>
      </ul>

      <h2>5. Trocar e personalizar o shell</h2>
      <p>
        O Kali vem com <strong>zsh</strong> como shell padrão (com aquele
        prompt colorido bonito). Mas você pode preferir <code>bash</code>{" "}
        (mais comum em scripts) ou <code>fish</code> (autocompletar muito
        inteligente).
      </p>

      <h3>Ver qual shell você usa</h3>
      <CodeBlock
        language="bash"
        code={`echo $SHELL          # mostra o shell padrão do seu usuário
cat /etc/shells      # lista todos os shells instalados`}
      />

      <h3>Trocar para outro shell</h3>
      <CodeBlock
        language="bash"
        code={`# Instale o shell que quer (se não estiver instalado)
sudo apt install -y bash zsh fish

# Troque o shell padrão (precisa fazer logout depois)
chsh -s /usr/bin/bash    # voltar para bash
chsh -s /usr/bin/zsh     # zsh (padrão Kali)
chsh -s /usr/bin/fish    # fish

# Confirme — fechar e reabrir o terminal
echo $SHELL`}
      />

      <h3>Personalizar o prompt do zsh com starship</h3>
      <p>
        <code>starship</code> é um prompt moderno, escrito em Rust, que
        funciona em qualquer shell e mostra automaticamente: pasta atual,
        branch git, versão de linguagem do projeto, tempo do último comando, etc.
      </p>
      <CodeBlock
        language="bash"
        code={`# Instalar starship
curl -sS https://starship.rs/install.sh | sh

# Habilitar no zsh
echo 'eval "$(starship init zsh)"' >> ~/.zshrc

# Habilitar no bash (se você usa bash)
echo 'eval "$(starship init bash)"' >> ~/.bashrc

# Recarregar
source ~/.zshrc

# Personalizar (opcional)
mkdir -p ~/.config && starship preset nerd-font-symbols -o ~/.config/starship.toml`}
      />

      <h2>6. Temas, ícones e visual</h2>
      <p>
        Cada ambiente gráfico tem seu próprio sistema de temas. O essencial:
      </p>

      <h3>No XFCE</h3>
      <CodeBlock
        language="bash"
        code={`# Instalar coleção de temas e ícones
sudo apt install -y arc-theme papirus-icon-theme numix-icon-theme

# Aplicar via interface
xfce4-appearance-settings   # Temas e fontes
xfce4-settings-manager      # Painel completo de ajustes`}
      />

      <h3>No GNOME e KDE</h3>
      <CodeBlock
        language="bash"
        code={`# GNOME: instale o gnome-tweaks (controle fino)
sudo apt install -y gnome-tweaks
gnome-tweaks

# KDE: já tem painel completo
systemsettings5    # ou: kcmshell5`}
      />

      <h3>Wallpapers e fontes</h3>
      <CodeBlock
        language="bash"
        code={`# Wallpapers extras
sudo apt install -y kali-wallpapers-2024 kali-wallpapers-legacy

# Fontes Microsoft (LibreOffice/navegador ficam parecidos com Windows)
sudo apt install -y ttf-mscorefonts-installer

# Nerd Fonts (boas para terminal com starship/powerline)
sudo apt install -y fonts-firacode fonts-jetbrains-mono`}
      />

      <h2 className="border-t pt-8 mt-12">Parte 2 — Uso Doméstico (com cuidado)</h2>

      <AlertBox type="warning" title="Reforçando: Kali não é para uso diário">
        Se você chegou até aqui só por curiosidade, ótimo, vai ver como
        instalar coisas comuns. Mas <strong>não use seu Kali para entrar no
        seu banco, fazer compras com cartão ou guardar arquivos pessoais
        importantes</strong>. Use uma distro de uso comum para isso. Se quer
        Kali no notebook de todo dia, no mínimo crie um <strong>usuário
        comum sem privilégios de root</strong> e desabilite serviços de
        ataque que não usa.
      </AlertBox>

      <h2>7. Navegadores — Chromium vem por padrão, mas você pode mais</h2>
      <p>
        O Kali já vem com <strong>Firefox ESR</strong> e <strong>Chromium</strong>{" "}
        (a versão open-source do Chrome). Quase tudo que o Chrome faz, o
        Chromium faz. Mas se você precisa do Chrome de verdade (por causa
        de extensão proprietária, DRM de Netflix etc.):
      </p>

      <h3>Google Chrome</h3>
      <CodeBlock
        language="bash"
        code={`# Baixar o pacote oficial .deb
cd /tmp
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Instalar (vai baixar dependências automaticamente)
sudo apt install -y ./google-chrome-stable_current_amd64.deb

# Abrir
google-chrome &

# Para atualizar no futuro: o Chrome adiciona seu próprio repositório,
# então um simples sudo apt update && sudo apt upgrade já cuida disso.`}
      />

      <h3>Brave (privacidade)</h3>
      <CodeBlock
        language="bash"
        code={`# Adicionar a chave e o repositório oficial do Brave
sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg \\
  https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" \\
  | sudo tee /etc/apt/sources.list.d/brave-browser-release.list

sudo apt update
sudo apt install -y brave-browser`}
      />

      <h3>Firefox versão completa (não-ESR)</h3>
      <CodeBlock
        language="bash"
        code={`# O Firefox normal (não-ESR) costuma ser mais novo. Use o tarball oficial:
cd /tmp
wget -O firefox.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64&lang=pt-BR"

# Extrair em /opt
sudo tar -xjf firefox.tar.bz2 -C /opt/

# Criar atalho
sudo ln -sf /opt/firefox/firefox /usr/local/bin/firefox-latest

# Rodar
firefox-latest &`}
      />

      <PracticeBox
        title="Instalar o Chrome do zero"
        goal="Sair do Chromium e ter o Chrome real instalado, com sincronização de conta Google funcionando."
        steps={[
          "Abra o terminal.",
          "Vá para a pasta de downloads temporários: cd /tmp",
          "Baixe o pacote: wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb",
          "Instale: sudo apt install -y ./google-chrome-stable_current_amd64.deb",
          "Abra: google-chrome & (o & faz rodar em segundo plano sem travar o terminal)",
          "Faça login com sua conta Google se quiser sincronizar abas/senhas/extensões.",
        ]}
        verify="Rode dpkg -l google-chrome-stable. Se aparecer 'ii  google-chrome-stable' no início da linha, está instalado. No menu de aplicativos, deve aparecer 'Google Chrome'."
      />

      <h2>8. Programas comuns do dia a dia</h2>
      <p>
        Tudo aqui vem do repositório oficial do Debian/Kali — um simples{" "}
        <code>sudo apt install</code> resolve.
      </p>

      <h3>Escritório</h3>
      <CodeBlock
        language="bash"
        code={`# LibreOffice — substituto completo do Microsoft Office
sudo apt install -y libreoffice libreoffice-l10n-pt-br libreoffice-help-pt-br

# OnlyOffice — interface mais parecida com Office moderno (precisa adicionar repositório)
# Veja: https://www.onlyoffice.com/download-desktop.aspx

# Visualizador de PDF leve
sudo apt install -y evince     # PDF com anotações
sudo apt install -y okular     # Mais recursos (KDE)`}
      />

      <h3>Comunicação</h3>
      <CodeBlock
        language="bash"
        code={`# Telegram
sudo apt install -y telegram-desktop

# Discord (pacote oficial .deb)
cd /tmp
wget -O discord.deb "https://discord.com/api/download?platform=linux&format=deb"
sudo apt install -y ./discord.deb

# Thunderbird (e-mail)
sudo apt install -y thunderbird thunderbird-l10n-pt-br

# Signal (mais privacidade que WhatsApp)
sudo apt install -y signal-desktop`}
      />
      <AlertBox type="info" title="WhatsApp no Linux">
        Não existe WhatsApp Desktop oficial para Linux. Use{" "}
        <strong>WhatsApp Web</strong> direto no Chrome/Brave, ou apps
        não-oficiais como <code>whatsapp-for-linux</code> (cuidado com
        segurança ao usar clientes não-oficiais para conta pessoal).
      </AlertBox>

      <h3>Mídia (vídeo, áudio, imagem)</h3>
      <CodeBlock
        language="bash"
        code={`# Reprodutor de vídeo universal
sudo apt install -y vlc

# Player de música
sudo apt install -y rhythmbox    # tipo iTunes
sudo apt install -y audacious    # leve, tipo Winamp

# Spotify (precisa do repositório oficial)
curl -sS https://download.spotify.com/debian/pubkey_C85668DF69375001.gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/spotify.gpg
echo "deb http://repository.spotify.com stable non-free" | sudo tee /etc/apt/sources.list.d/spotify.list
sudo apt update
sudo apt install -y spotify-client

# Edição de imagem
sudo apt install -y gimp                  # tipo Photoshop
sudo apt install -y inkscape              # tipo Illustrator (vetorial)
sudo apt install -y darktable             # revelação de RAW (fotografia)

# Captura/edição de vídeo e gravação de tela
sudo apt install -y obs-studio            # gravação/streaming
sudo apt install -y kdenlive              # edição não-linear
sudo apt install -y kazam                 # screen recording simples`}
      />

      <h3>Editores de código e dev</h3>
      <CodeBlock
        language="bash"
        code={`# VS Code (Microsoft) — pacote oficial
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/packages.microsoft.gpg
echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update
sudo apt install -y code

# Editores leves alternativos
sudo apt install -y geany             # IDE leve
sudo apt install -y neovim            # vim moderno

# Git já vem instalado, mas configure:
git config --global user.name  "Seu Nome"
git config --global user.email "voce@exemplo.com"`}
      />

      <h3>Jogos (sim, dá para jogar no Linux)</h3>
      <CodeBlock
        language="bash"
        code={`# Steam (precisa habilitar arquitetura 32-bit primeiro)
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y steam

# Lutris (gerencia jogos não-Steam, GOG, Epic, emuladores)
sudo apt install -y lutris

# Wine (rodar programas Windows)
sudo apt install -y wine winetricks

# Proton-GE (versão melhorada do Proton para mais compatibilidade no Steam)
# Instalação manual via ProtonUp-Qt:
# https://github.com/DavidoTek/ProtonUp-Qt`}
      />
      <AlertBox type="warning" title="Drivers de placa de vídeo">
        Para jogar com performance, instale os drivers proprietários da NVIDIA{" "}
        (<code>sudo apt install nvidia-driver</code>) ou os drivers Mesa
        atualizados para AMD (já vêm). No Kali, isso pode ser mais
        complicado que em distros como o Pop!_OS — outro motivo para usar
        Kali em VM e jogar na distro principal.
      </AlertBox>

      <h3>Atalhos para apps comuns</h3>
      <ParamsTable
        title="Equivalentes Linux dos apps que você já conhece"
        params={[
          { flag: "Microsoft Office", desc: "LibreOffice (libre, abre .docx/.xlsx) ou OnlyOffice (visual mais parecido).", exemplo: "sudo apt install libreoffice" },
          { flag: "Adobe Photoshop", desc: "GIMP (livre) ou Krita (foco em pintura digital).", exemplo: "sudo apt install gimp krita" },
          { flag: "Adobe Illustrator", desc: "Inkscape (vetorial, ótimo).", exemplo: "sudo apt install inkscape" },
          { flag: "Adobe Premiere", desc: "Kdenlive ou DaVinci Resolve (gratuito, baixar do site).", exemplo: "sudo apt install kdenlive" },
          { flag: "Notepad++", desc: "Geany, gedit, mousepad ou VS Code.", exemplo: "sudo apt install geany" },
          { flag: "WinRAR / 7-Zip", desc: "p7zip (linha de comando) e file-roller (interface gráfica).", exemplo: "sudo apt install p7zip-full file-roller" },
          { flag: "Spotify", desc: "Spotify oficial (Linux) — instala via repositório próprio.", exemplo: "veja seção de mídia acima" },
          { flag: "iTunes", desc: "Rhythmbox, Clementine ou Strawberry.", exemplo: "sudo apt install rhythmbox" },
          { flag: "OBS Studio", desc: "Mesmo nome, mesma coisa — pacote oficial.", exemplo: "sudo apt install obs-studio" },
          { flag: "OneNote", desc: "Joplin (sincroniza com Nextcloud/Dropbox) ou Obsidian.", exemplo: "sudo apt install joplin" },
        ]}
      />

      <PracticeBox
        title="Setup mínimo de produtividade em 5 comandos"
        goal="Deixar o Kali pronto para usar como desktop comum: navegador, escritório, comunicação, mídia."
        steps={[
          "Atualize tudo primeiro: sudo apt update && sudo apt full-upgrade -y",
          "Rode o comando combinado abaixo (um único apt install com vários pacotes).",
          "Aguarde a instalação terminar (uns 5-15 minutos dependendo da internet).",
          "Verifique abrindo cada um pelo menu de aplicativos.",
        ]}
        command={`sudo apt install -y \\
  libreoffice libreoffice-l10n-pt-br \\
  vlc gimp inkscape \\
  telegram-desktop thunderbird \\
  firefox-esr ttf-mscorefonts-installer \\
  gnome-disk-utility gparted \\
  htop neofetch tree`}
        verify="Abra o menu de aplicativos e procure: 'LibreOffice Writer', 'VLC', 'GIMP'. Se aparecerem, instalou. No terminal, rode neofetch para ver um resumo bonito do seu sistema."
      />

      <h2>9. Backup do seu setup com dotfiles</h2>
      <p>
        Depois de personalizar tudo (prompt, temas, atalhos do editor,
        configuração do tmux...), você não quer perder isso se reinstalar.
        A solução é guardar seus arquivos de configuração (os{" "}
        <strong>dotfiles</strong>, que começam com <code>.</code>) em um
        repositório git.
      </p>
      <CodeBlock
        language="bash"
        code={`# Criar pasta para os dotfiles
mkdir -p ~/dotfiles
cd ~/dotfiles
git init

# Copiar (ou mover) os arquivos importantes
cp ~/.zshrc        ~/dotfiles/zshrc
cp ~/.bashrc       ~/dotfiles/bashrc
cp -r ~/.config/starship.toml ~/dotfiles/ 2>/dev/null

# Versionar
git add .
git commit -m "Meus dotfiles iniciais"

# (Opcional) subir para o GitHub
git remote add origin https://github.com/SEU_USUARIO/dotfiles.git
git branch -M main
git push -u origin main

# Restaurar em outra máquina:
# git clone https://github.com/SEU_USUARIO/dotfiles.git ~/dotfiles
# ln -sf ~/dotfiles/zshrc ~/.zshrc`}
      />

      <h2>10. Setup mínimo (PC fraco) e setup pesado (PC bom)</h2>

      <h3>PC com pouca RAM (4 GB ou menos): perfil leve</h3>
      <CodeBlock
        language="bash"
        code={`# Trocar XFCE por LXQt/LXDE (consome metade da RAM)
sudo apt install -y kali-desktop-lxde

# Remover serviços pesados não usados
sudo systemctl disable bluetooth.service cups.service

# Navegador leve no lugar do Chrome
sudo apt install -y midori   # ou: surf, falkon

# Editor de texto leve
sudo apt install -y mousepad

# Resultado típico: sistema usa 400-700 MB de RAM ocioso`}
      />

      <h3>PC com bastante RAM (16 GB+): perfil completo</h3>
      <CodeBlock
        language="bash"
        code={`# KDE Plasma com efeitos
sudo apt install -y kali-desktop-kde

# Pacote completo de ferramentas Kali (cuidado: ~10 GB)
sudo apt install -y kali-linux-large

# Suporte a containers para isolar projetos
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER

# Multiplos workspaces virtuais já vêm habilitados no KDE
# Atalhos: Ctrl+F1, Ctrl+F2, ... para alternar`}
      />

      <h2>11. Atalhos de teclado úteis</h2>
      <ParamsTable
        title="Atalhos universais (funcionam na maioria dos ambientes)"
        params={[
          { flag: "Ctrl + Alt + T", desc: "Abrir terminal", exemplo: "configurável em Settings > Keyboard" },
          { flag: "Super (tecla Windows)", desc: "Abrir menu / overview de janelas", exemplo: "GNOME, KDE" },
          { flag: "Alt + Tab", desc: "Alternar entre janelas abertas", exemplo: "—" },
          { flag: "Alt + F2", desc: "Lançador de comandos rápido", exemplo: "—" },
          { flag: "Ctrl + Alt + F2..F6", desc: "Mudar para console TTY (sem interface gráfica)", exemplo: "Ctrl+Alt+F1 ou F7 volta para a interface" },
          { flag: "PrintScreen", desc: "Screenshot da tela inteira", exemplo: "—" },
          { flag: "Super + Setas", desc: "Mover janela para metades da tela (snap)", exemplo: "Super+← / Super+→" },
          { flag: "Ctrl + Alt + L", desc: "Bloquear sessão (quando sair do PC)", exemplo: "—" },
        ]}
      />

      <h2>Próximos passos</h2>
      <div className="grid sm:grid-cols-2 gap-4 not-prose mt-6">
        <Link href="/comece-aqui">
          <a className="block rounded-xl border border-border bg-card hover:bg-card/70 p-5 transition-colors">
            <div className="text-xs uppercase font-semibold text-primary mb-2 tracking-wider">Voltar</div>
            <div className="font-bold mb-1">Do Zero Absoluto</div>
            <div className="text-sm text-muted-foreground">Revisar fundamentos do terminal</div>
            <ArrowRight className="w-4 h-4 mt-3 text-primary" />
          </a>
        </Link>
        <Link href="/pacotes">
          <a className="block rounded-xl border border-border bg-card hover:bg-card/70 p-5 transition-colors">
            <div className="text-xs uppercase font-semibold text-primary mb-2 tracking-wider">Aprofundar</div>
            <div className="font-bold mb-1">Gerência de Pacotes</div>
            <div className="text-sm text-muted-foreground">Entender apt, dpkg e repositórios a fundo</div>
            <ArrowRight className="w-4 h-4 mt-3 text-primary" />
          </a>
        </Link>
      </div>
    </PageContainer>
  );
}
