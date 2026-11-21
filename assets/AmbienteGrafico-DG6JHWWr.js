import{j as e}from"./index-Bd5otbF3.js";import{P as i}from"./PageContainer-BFcnvssG.js";import{A as s}from"./AlertBox-CL6YULjX.js";import{C as o}from"./CodeBlock-C2J-D4l6.js";import{C as t}from"./CommandTable-BxJEHhQ9.js";import{T as a,P as n}from"./PracticeBox-Pst8IaIf.js";function p(){return e.jsxs(i,{title:"Ambientes Gráficos no Kali",subtitle:"Xfce (default), GNOME, KDE, i3wm: trocar de DE, autostart, display managers, sem quebrar o Kali.",difficulty:"iniciante",timeToRead:"14 min",children:[e.jsx("h2",{children:"O que vem por padrão"}),e.jsxs("p",{children:["Desde 2019, o Kali troca o GNOME pelo ",e.jsx("strong",{children:"Xfce"})," como ambiente padrão: leve, rápido, customizável e funciona bem em VM com pouca RAM. O display manager (a tela de login) é o ",e.jsx("strong",{children:"LightDM"}),". Sessão é"," ",e.jsx("code",{children:"xfce"})," sob X11. Wayland tem suporte experimental mas Kali ainda padroniza X11 porque várias ferramentas pentest dependem disso (xdotool, xclip, screenshot scripts, BurpSuite Java SWT antigo)."]}),e.jsx(a,{path:"~",lines:[{cmd:"echo $XDG_CURRENT_DESKTOP $XDG_SESSION_TYPE",out:"XFCE x11",outType:"info"},{cmd:"loginctl show-session $(loginctl | awk '/ana/{print $1}') -p Type -p Desktop",out:`Type=x11
Desktop=xfce`,outType:"default"},{cmd:"wmctrl -m",out:`Name: Xfwm4
Class: N/A
PID: N/A
Window manager's "showing the desktop" mode: OFF`,outType:"muted"}]}),e.jsx("h2",{children:"Display managers — quem desenha a tela de login"}),e.jsx(t,{title:"DMs disponíveis no Debian/Kali",variations:[{cmd:"lightdm",desc:"Default Kali. Leve, GTK, suporta múltiplas sessões.",output:"Use sempre que possível."},{cmd:"gdm3",desc:"Display manager do GNOME. Mais pesado, integrado a GNOME Shell.",output:"Vem se você instalar 'kali-desktop-gnome'."},{cmd:"sddm",desc:"DM oficial do KDE Plasma. Tema bonito por padrão.",output:"Acompanha 'kali-desktop-kde'."},{cmd:"ly",desc:"DM TUI (texto). Roda em console, baixíssimo overhead.",output:"Bom para Kali em VPS / SSH-only."},{cmd:"startx (sem DM)",desc:"Sem login manager — você loga no tty1 e digita 'startx'.",output:"Mais minimal possível."}]}),e.jsx(a,{path:"~",lines:[{comment:"qual DM está ativo agora",cmd:"cat /etc/X11/default-display-manager",out:"/usr/sbin/lightdm",outType:"info"},{cmd:"systemctl status display-manager --no-pager | head -5",out:`● lightdm.service - Light Display Manager
     Loaded: loaded (/lib/systemd/system/lightdm.service; enabled)
     Active: active (running) since Fri 2026-04-05 09:01:11 -03; 7h ago`,outType:"success"},{comment:"trocar para o gdm3 (depois de instalar)",cmd:"sudo dpkg-reconfigure gdm3",out:"(abre menu textual perguntando qual DM usar; reinicie depois)",outType:"warning"}]}),e.jsx("h2",{children:"Instalando outros DEs sem quebrar o Kali"}),e.jsxs("p",{children:["Kali oferece metapacotes para cada DE. ",e.jsx("strong",{children:"Nunca"}),' instale "gnome" puro do Debian — instale a versão do Kali, que vem com tweak para tema, ícones e o wallpaper Kali certo.']}),e.jsx(o,{language:"bash",title:"metapacotes oficiais",code:`# atualizar primeiro
sudo apt update

# adicionar GNOME (instala gdm3 junto)
sudo apt install -y kali-desktop-gnome

# adicionar KDE Plasma
sudo apt install -y kali-desktop-kde

# i3 (window manager tiling, leve)
sudo apt install -y kali-desktop-i3

# Mate, LXDE, Enlightenment também:
sudo apt install -y kali-desktop-mate
sudo apt install -y kali-desktop-lxde
sudo apt install -y kali-desktop-e17

# REMOVER um DE (cuidado: confira que vai sobrar pelo menos um)
sudo apt purge kali-desktop-gnome
sudo apt autoremove --purge`}),e.jsx(s,{type:"warning",title:"Não rode 'apt purge xfce4' achando que vai virar GNOME",children:e.jsxs("p",{children:["Os metapacotes ",e.jsx("code",{children:"kali-desktop-*"})," têm dependências em cadeia para ferramentas Kali (menus, atalhos, perfis). Se você fizer purge agressivo do Xfce sem antes instalar outro DE, vai bootar num shell preto sem GUI. Sempre instale o novo, reinicie, escolha a sessão na tela de login, teste 1-2 dias, e SÓ DEPOIS remova o antigo."]})}),e.jsx("h2",{children:"Trocando de sessão na tela de login"}),e.jsx(a,{path:"~",lines:[{cmd:"ls /usr/share/xsessions/",out:`gnome-classic.desktop
gnome.desktop
i3.desktop
kali-default.desktop
plasma.desktop
xfce.desktop`,outType:"info"},{comment:"qual sessão você usa por padrão (lightdm)",cmd:"cat /var/cache/lightdm/dmrc/ana.dmrc 2>/dev/null",out:`[Desktop]
Session=xfce`,outType:"default"}]}),e.jsx("p",{children:'No login, clique no ícone de engrenagem ao lado do botão "Login" no LightDM (ou canto superior direito no GDM3). Selecione a sessão (Xfce, GNOME, KDE, i3) e logue. Sua escolha é lembrada para próximas sessões.'}),e.jsx("h2",{children:"Autostart — abrir tools no login"}),e.jsxs("p",{children:["Tem ferramenta que você quer rodando sempre que entra (ex: ",e.jsx("code",{children:"burpsuite"})," ","em background, ",e.jsx("code",{children:"polybar"}),", agente VPN, listener netcat de teste). Coloque um ",e.jsx("code",{children:".desktop"})," em ",e.jsx("code",{children:"~/.config/autostart/"}),"."]}),e.jsx(o,{language:"ini",title:"~/.config/autostart/burpsuite.desktop",code:`[Desktop Entry]
Type=Application
Name=Burp Suite (auto)
Comment=Sobe o Burp em background no login
Exec=/usr/bin/burpsuite --user-config-file=/home/ana/.BurpSuite/UserConfigCommunity.json
Icon=/opt/BurpSuite/burpsuite_community.svg
Terminal=false
X-GNOME-Autostart-enabled=true
X-XFCE-Autostart-enabled=true
NoDisplay=false`}),e.jsx(a,{path:"~",lines:[{cmd:"ls ~/.config/autostart/",out:`burpsuite.desktop
nm-applet.desktop
xfce4-power-manager-plugin-autostart.desktop`,outType:"info"},{comment:"no GNOME tem ferramenta GUI também",cmd:"gnome-tweaks",out:"(abre Tweaks → Startup Applications)",outType:"muted"},{comment:"ALTERNATIVA: rodar comando ao logar no shell (não DE)",cmd:"tail -3 ~/.bash_profile",out:`# auto-iniciar tmux na sessão SSH
if [[ -z "$TMUX" && "$SSH_CONNECTION" ]]; then
  tmux attach -t main || tmux new -s main
fi`,outType:"default"}]}),e.jsx("h2",{children:"X11 vs Wayland"}),e.jsx(t,{title:"diferenças práticas",variations:[{cmd:"X11",desc:"Default Kali. Permite xdotool, xclip, screenshot fácil, key-loggers.",output:"Tudo de pentest funciona."},{cmd:"Wayland",desc:"Mais seguro: app NÃO consegue ler janela do vizinho ou injetar input sem permissão.",output:"Quebra muita ferramenta legacy."},{cmd:"xclip / xsel",desc:"Manipula clipboard X11 (essencial em scripts).",output:"Em Wayland use wl-copy / wl-paste."},{cmd:"scrot / xfce4-screenshooter",desc:"Screenshot via X11.",output:"Em Wayland use grim+slurp."},{cmd:"xdotool",desc:"Simula teclado/mouse — base de keyloggers e automação.",output:"Em Wayland precisa wtype + portal autorização."},{cmd:"Forwarding X11 via SSH",desc:"ssh -X user@host abre GUI remota.",output:"Wayland forwarding é WIP."}]}),e.jsx(a,{path:"~",lines:[{cmd:"echo $XDG_SESSION_TYPE",out:"x11",outType:"info"},{comment:"verificar de onde gnome carregou (se mudar pra wayland, gdm3 oferece sessão wayland)",cmd:"loginctl show-session $XDG_SESSION_ID -p Type",out:"Type=x11",outType:"default"},{comment:"manter X11 default no GDM3 mesmo se aparecer wayland",cmd:"sudo sed -i 's/#WaylandEnable=false/WaylandEnable=false/' /etc/gdm3/daemon.conf",out:"(em seguida sudo systemctl restart gdm3)",outType:"warning"}]}),e.jsx("h2",{children:"i3wm — para quem quer só teclado"}),e.jsx("p",{children:"Window manager tiling. Sem barra inútil, sem ícones, controle total via atalhos. Pesa <100MB, ideal pra notebook fraco ou maximizar foco em terminal/Burp."}),e.jsx(o,{language:"bash",title:"atalhos i3 essenciais (Mod = Super/Windows)",code:`# launcher
Mod+d           dmenu (lança qualquer programa)
Mod+Enter       abre terminal

# foco / movimento
Mod+j/k/l/;     foca esquerda/baixo/cima/direita
Mod+Shift+j     move janela
Mod+1..0        muda de workspace 1..10
Mod+Shift+1     joga janela pro workspace 1

# layout
Mod+e           split horizontal/vertical (alterna)
Mod+f           fullscreen
Mod+s           stacking layout
Mod+w           tabbed layout
Mod+Shift+space toggle floating (boa pra Burp)

# sair
Mod+Shift+q     fecha janela (= xkill)
Mod+Shift+e     logout
Mod+Shift+r     reload config (~/.config/i3/config)`}),e.jsx("h2",{children:"Troubleshooting de DE"}),e.jsx(a,{path:"~",lines:[{comment:"tela cinza / Xfce sem barra após update",cmd:"xfce4-panel --restart &",out:"(restaura o painel sem reiniciar a sessão)",outType:"muted"},{comment:"GNOME freezou — mata o shell, ele se reinicia sozinho",cmd:"killall -3 gnome-shell",out:"(GNOME Shell volta em 2-3s)",outType:"info"},{comment:"resetar configs do Xfce do usuário (perde personalização)",cmd:"rm -rf ~/.config/xfce4 ~/.cache/sessions && xfce4-session-logout --logout",out:"(no próximo login, Xfce vira do zero)",outType:"warning"},{comment:"checar se DE crashou — log fica aqui",cmd:"journalctl --user -b | grep -E 'crash|segfault|killed' | tail",out:`Apr 05 14:22:01 kali xfsettingsd[3221]: gtk_widget_show: assertion 'GTK_IS_WIDGET (widget)' failed
Apr 05 14:22:03 kali systemd[2103]: app-xfce-session.scope: Killed by signal 9.`,outType:"warning"}]}),e.jsx("h2",{children:"Sessão remota — XRDP e VNC"}),e.jsx(o,{language:"bash",title:"acessar Kali via RDP (do Windows ou cliente RDP)",code:`# instalar XRDP
sudo apt install -y xrdp

# por padrão XRDP tenta usar a sessão Xfce do usuário
sudo systemctl enable --now xrdp

# liberar firewall (se UFW ativo)
sudo ufw allow 3389/tcp

# do Windows: mstsc → Kali_IP:3389 → user/senha
# do Linux:   xfreerdp /u:ana /p:'senha' /v:kali.local /size:1600x900 +clipboard

# IMPORTANTE: você não pode estar logado fisicamente no Xfce ao mesmo tempo
# que se conecta por XRDP — a sessão entra em conflito. Faça logout local antes.`}),e.jsx(n,{title:"Instalar GNOME paralelo ao Xfce, alternar e voltar",goal:"Praticar o ciclo completo: instalar segundo DE, escolher na tela de login, voltar ao Xfce sem quebrar nada.",steps:["Instale o metapacote kali-desktop-gnome.","Reinicie a tela de login.","Escolha 'GNOME' no seletor de sessão e logue.","Brinque um pouco, depois faça logout.","Volte para a sessão 'Xfce' e logue novamente — sua sessão Xfce deve estar intacta."],command:`# instalar (~1.5GB de download, leva alguns minutos)
sudo apt update && sudo apt install -y kali-desktop-gnome

# verificar sessões disponíveis
ls /usr/share/xsessions/

# reiniciar o display manager (FECHA todas suas janelas!)
sudo systemctl restart display-manager

# (no login, clique no ícone de engrenagem e escolha GNOME)
# (após testar, faça logout e logue de novo escolhendo Xfce)

# verificar que voltou para Xfce
echo $XDG_CURRENT_DESKTOP`,expected:`Reading package lists... Done
Setting up kali-desktop-gnome (2025.1.0) ...
gnome-classic.desktop
gnome.desktop
kali-default.desktop
plasma.desktop  (se já tinha KDE)
xfce.desktop
# (após troca e volta para Xfce)
XFCE`,verify:"Você conseguiu logar nos dois DEs sem precisar reinstalar nada e o $XDG_CURRENT_DESKTOP confirma o ambiente atual."}),e.jsx(s,{type:"info",title:"Para o operador pentester",children:e.jsxs("p",{children:["Em VM Kali pra trabalho, fique com ",e.jsx("strong",{children:"Xfce + X11"}),": máxima compatibilidade com BurpSuite, Wireshark, ferramentas de screenshot/clipboard automation. Reserve GNOME/KDE pra notebook pessoal. ",e.jsx("code",{children:"i3wm"})," brilha em CTF/labs onde você quer 4 terminais lado-a-lado sem encostar no mouse. Para uso headless (Kali em VPS de C2 redirector), desinstale tudo de DE e use só CLI + tmux."]})})]})}export{p as default};
