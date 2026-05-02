import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SnapFlatpak() {
  return (
    <PageContainer
      title="Snap & Flatpak"
      subtitle="Empacotamento universal: quando faz sentido no Kali e quando vai te dar dor de cabeça."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>Por que existem (além do APT)</h2>
      <p>
        APT entrega pacotes <strong>linkados ao sistema</strong>: dependências
        compartilhadas, libs versionadas pelo Debian/Kali. Isso é eficiente, mas amarra
        a versão do app ao ciclo da distro. <strong>Snap</strong> (Canonical) e{" "}
        <strong>Flatpak</strong> (independente) propõem o oposto: cada app vem
        empacotado com TODAS as dependências, isolado em sandbox.
      </p>
      <p>
        No Kali isso quase nunca é necessário (a base já tem ~600 ferramentas
        pentest). Mas para apps GUI fora do mundo pentest (Bitwarden, Obsidian,
        Element, GIMP novo) Flatpak pode salvar o dia sem misturar repo.
      </p>

      <CommandTable
        title="Resumo comparativo"
        variations={[
          { cmd: "Origem", desc: "Snap = Canonical. Flatpak = projeto comunitário (Red Hat origina).", output: "Flatpak é o padrão de fato no mundo Linux desktop." },
          { cmd: "Store", desc: "Snap = snapcraft.io (centralizado). Flatpak = flathub.org + repos múltiplos.", output: "Flatpak é federado." },
          { cmd: "Sandbox", desc: "Snap usa AppArmor. Flatpak usa bubblewrap + portals XDG.", output: "Ambos rodam em sandbox por padrão." },
          { cmd: "Tamanho", desc: "Pacotes gordos (carregam runtime).", output: "App de 5MB pode virar 300MB." },
          { cmd: "Daemon", desc: "Snap exige snapd rodando. Flatpak não tem daemon.", output: "Flatpak é mais leve em recursos." },
          { cmd: "Auto-update", desc: "Snap atualiza sozinho (pode ser desativado). Flatpak só com flatpak update.", output: "Snap auto-update pode quebrar engagement!" },
        ]}
      />

      <h2>Instalando snapd no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt update && sudo apt install -y snapd",
            out: `Setting up snapd (2.66.1+24.10) ...
Created symlink /etc/systemd/system/multi-user.target.wants/snapd.service.
Created symlink /etc/systemd/system/sockets.target.wants/snapd.socket.`,
            outType: "info",
          },
          {
            cmd: "sudo systemctl enable --now snapd snapd.socket",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
          {
            comment: "AppArmor é necessário no Kali para sandbox de Snap",
            cmd: "sudo systemctl enable --now apparmor",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "snap version",
            out: `snap    2.66.1+24.10
snapd   2.66.1+24.10
series  16
kali    2025.1
kernel  6.12.0-kali2-amd64`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Snap clássico no Kali pode dar trabalho">
        <p>
          Snap foi projetado para Ubuntu. No Kali (Debian-based) muitos snaps
          "classic" (sem confinamento) precisam do symlink{" "}
          <code>/snap → /var/lib/snapd/snap</code> e do AppArmor ativo. Faltou um deles
          e o snap não roda.
        </p>
        <Terminal
          path="~"
          lines={[
            { cmd: "sudo ln -s /var/lib/snapd/snap /snap", out: "(symlink criado)", outType: "muted" },
          ]}
        />
      </AlertBox>

      <h2>Snap: ciclo de vida</h2>
      <CommandTable
        title="snap CLI essencial"
        variations={[
          { cmd: "snap find obsidian", desc: "Buscar na store.", output: "obsidian   1.6.7   ...   Knowledge base app" },
          { cmd: "sudo snap install obsidian --classic", desc: "Instalar (classic = sem sandbox).", output: "obsidian 1.6.7 from James Coyle installed" },
          { cmd: "snap list", desc: "Lista instalados.", output: "Name      Version   Rev   Tracking         Publisher    Notes" },
          { cmd: "snap info obsidian", desc: "Detalhes (channels, revisions).", output: "channels: latest/stable, latest/candidate, latest/beta, latest/edge" },
          { cmd: "sudo snap refresh", desc: "Atualiza todos os snaps.", output: "Equivalente a apt upgrade." },
          { cmd: "sudo snap refresh --hold", desc: "Adia auto-refresh por 90 dias.", output: "CRÍTICO em engagement: trava update silencioso." },
          { cmd: "sudo snap remove obsidian --purge", desc: "Remove pacote E dados (~/snap/obsidian/).", output: "obsidian removed" },
          { cmd: "snap connections obsidian", desc: "Lista plugs/slots (permissões da sandbox).", output: "interface       plug                 slot" },
        ]}
      />

      <h2>Channels e confinamento Snap</h2>
      <p>
        Cada snap tem 4 trilhas (channels): <code>stable</code>, <code>candidate</code>,{" "}
        <code>beta</code>, <code>edge</code>. Pra usar versão de teste:
      </p>

      <Terminal
        path="~"
        lines={[
          { cmd: "sudo snap install code --classic --channel=insiders/stable", out: "code (insiders/stable) ... installed", outType: "info" },
          { cmd: "sudo snap refresh code --channel=stable", out: "code refreshed (channel changed)", outType: "default" },
          {
            comment: "ver confinamento",
            cmd: "snap list --all | awk 'NR==1 || /classic|jailmode/'",
            out: `Name      Version  Rev    Tracking       Publisher        Notes
code      1.95.3   181    latest/stable  vscode✓          classic
firefox   132.0    5187   latest/stable  mozilla✓         -`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Modos de confinamento"
        variations={[
          { cmd: "strict", desc: "Sandbox completo. App só vê o que é permitido por interfaces.", output: "Default. Mais seguro." },
          { cmd: "classic", desc: "SEM sandbox: o app enxerga o sistema todo (igual a um pacote APT).", output: "Necessário para IDEs (VS Code, IntelliJ)." },
          { cmd: "devmode", desc: "Sandbox em modo permissivo (loga violações em vez de bloquear).", output: "Para desenvolvedores debugando snap próprio." },
          { cmd: "jailmode", desc: "Força strict mesmo num snap classic.", output: "Sai como 'cannot operate'." },
        ]}
      />

      <h2>Flatpak: setup e Flathub</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y flatpak",
            out: `Setting up flatpak (1.16.0-1) ...
Created symlink /etc/systemd/user/sockets.target.wants/p11-kit-server.socket.`,
            outType: "info",
          },
          {
            comment: "adicionar o Flathub (repo padrão)",
            cmd: "flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
            out: "(silencioso ou 'flathub already exists')",
            outType: "muted",
          },
          {
            cmd: "flatpak remotes",
            out: `Name     Options
flathub  system,xa.title=Flathub`,
            outType: "info",
          },
        ]}
      />

      <h2>Flatpak: workflow</h2>
      <CommandTable
        title="flatpak CLI essencial"
        variations={[
          { cmd: "flatpak search bitwarden", desc: "Buscar app.", output: "Bitwarden   Password manager   com.bitwarden.desktop   stable   flathub" },
          { cmd: "flatpak install flathub com.bitwarden.desktop", desc: "Instalar do Flathub.", output: "Required runtime: org.freedesktop.Platform/x86_64/24.08" },
          { cmd: "flatpak list", desc: "Lista instalados.", output: "Name        Application ID         Version   Branch" },
          { cmd: "flatpak run com.bitwarden.desktop", desc: "Executar.", output: "(abre janela)" },
          { cmd: "flatpak update", desc: "Atualiza tudo (manual — sem auto-update).", output: "Looking for updates… Nothing to do." },
          { cmd: "flatpak uninstall com.bitwarden.desktop --delete-data", desc: "Remove app e dados em ~/.var/app/.", output: "Uninstalling com.bitwarden.desktop/x86_64/stable" },
          { cmd: "flatpak uninstall --unused", desc: "Remove runtimes órfãos.", output: "Liberta GBs." },
          { cmd: "flatpak info com.bitwarden.desktop", desc: "Detalhes (runtime, sdk, sha).", output: "Runtime: org.freedesktop.Platform/x86_64/24.08" },
        ]}
      />

      <h2>Runtimes & SDKs no Flatpak</h2>
      <p>
        Cada app Flatpak depende de um <strong>runtime</strong> (conjunto base de
        bibliotecas, ex: <code>org.freedesktop.Platform</code>,{" "}
        <code>org.gnome.Platform</code>, <code>org.kde.Platform</code>). Várias apps
        compartilham o mesmo runtime, então o "tamanho extra" é diluído.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "flatpak list --runtime",
            out: `Name                          Application ID                         Version    Branch  Installation
Freedesktop Platform          org.freedesktop.Platform               24.08.7    24.08   system
GL                            org.freedesktop.Platform.GL.default    24.08      24.08   system
GNOME Application Platform    org.gnome.Platform                     47         47      system`,
            outType: "info",
          },
        ]}
      />

      <h2>Permissões — override</h2>
      <p>
        Flatpak isola o app: por padrão, <code>com.foo.Bar</code> não enxerga{" "}
        <code>~/Documents</code>. Para casos legítimos (Bitwarden lendo seu
        ~/.ssh/id_rsa pra preencher campo? NÃO) use overrides com cuidado:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver permissões atuais",
            cmd: "flatpak info --show-permissions com.bitwarden.desktop",
            out: `[Context]
shared=network;ipc;
sockets=x11;wayland;
filesystems=xdg-download;`,
            outType: "default",
          },
          {
            comment: "dar acesso a ~/Documents (escopo: usuário)",
            cmd: "flatpak override --user --filesystem=~/Documents com.bitwarden.desktop",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "remover permissão",
            cmd: "flatpak override --user --nofilesystem=~/Documents com.bitwarden.desktop",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "GUI para gerenciar permissões",
            cmd: "flatpak install flathub com.github.tchx84.Flatseal",
            out: "Flatseal — editor visual de overrides (recomendado).",
            outType: "info",
          },
        ]}
      />

      <h2>Quando usar no Kali (perspectiva pentester)</h2>
      <CommandTable
        title="Decisão prática"
        variations={[
          { cmd: "Use APT", desc: "100% das ferramentas pentest (nmap, burpsuite, metasploit, ...).", output: "Otimizadas, integradas, atualizadas pelo time Kali." },
          { cmd: "Use Flatpak", desc: "Apps GUI desktop (Element, Signal, Bitwarden, OBS).", output: "Não polui repo Kali, sandbox extra." },
          { cmd: "Use Snap", desc: "Casos específicos (chromium classic) ou app não disponível em Flatpak.", output: "Aceite o overhead do snapd." },
          { cmd: "EVITE", desc: "Snap/Flatpak para ferramenta pentest 'porque a versão é mais nova'.", output: "Sandbox quebra coisa: scapy não vê interface raw, hashcat não vê GPU." },
        ]}
      />

      <AlertBox type="danger" title="Sandbox e ferramentas ofensivas: incompatível">
        <p>
          Ferramentas que exigem <code>CAP_NET_RAW</code> (scapy, nmap raw,
          tcpdump), GPU (hashcat), ptrace (gdb) ou monitor mode Wi-Fi vão{" "}
          <strong>falhar silenciosa ou ruidosamente</strong> dentro de Snap/Flatpak.
          Isso é por design da sandbox.
        </p>
        <p>
          Para qualquer coisa que toque kernel/driver/rede crua: APT ou compilação do
          source.
        </p>
      </AlertBox>

      <h2>Auto-update: o vilão silencioso</h2>
      <CodeBlock
        language="bash"
        title="Travar auto-refresh do snapd em engagement"
        code={`# Adia auto-refresh por 90 dias (max permitido)
sudo snap refresh --hold

# Confirmar:
snap refresh --time
# Output:
#   timer: 00:00~24:00/4
#   last: today at 09:14 BRT
#   hold: forever (use 'snap refresh' to unhold)

# Para liberar depois:
sudo snap refresh --unhold`}
      />

      <PracticeBox
        title="Instalar Bitwarden via Flatpak com permissão limitada"
        goal="Instalar Bitwarden, restringir a APENAS rede + clipboard, validar que ele não vê seu ~/Documents."
        steps={[
          "Adicione o Flathub (se ainda não tiver).",
          "Instale o Bitwarden.",
          "Liste permissões padrão.",
          "Bloqueie acesso a ~/Documents explicitamente.",
          "Rode e confirme que abre normalmente.",
        ]}
        command={`flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub com.bitwarden.desktop
flatpak info --show-permissions com.bitwarden.desktop
flatpak override --user --nofilesystem=home com.bitwarden.desktop
flatpak run com.bitwarden.desktop &`}
        expected={`[Context]
shared=network;ipc;
sockets=x11;wayland;
filesystems=xdg-download;

(Bitwarden abre — mas tentativas de "open file" não veem $HOME)`}
        verify="Tente abrir um arquivo via menu do Bitwarden: ele não conseguirá listar seu /home, prova de que a sandbox respeitou o override."
      />

      <AlertBox type="info" title="Resumo prático">
        <p>
          1) No Kali, <strong>APT é rei</strong> para tudo que é ferramenta ofensiva.
          <br />
          2) <strong>Flatpak</strong> para apps GUI extras (Bitwarden, Element).
          <br />
          3) <strong>Snap</strong> só se for inevitável; segure auto-refresh em
          engagement.
          <br />
          4) Para ferramenta pentest com requisitos de kernel/rede,{" "}
          <strong>NUNCA</strong> empacotada.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
