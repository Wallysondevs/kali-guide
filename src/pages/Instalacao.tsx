import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Instalacao() {
  return (
    <PageContainer
      title="Instalação do Kali Linux"
      subtitle="VM (VirtualBox/VMware), WSL2 + Win-KeX, dual boot, live USB e Raspberry Pi — passo a passo, com outputs reais."
      difficulty="iniciante"
      timeToRead="15 min"
      prompt="setup/install"
    >
      <h2>Opções de Instalação</h2>
      <p>
        Existem várias formas de usar o Kali Linux. Cada uma tem prós e contras dependendo do
        seu caso de uso, hardware e nível de experiência:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { title: "🖥️ Máquina Virtual (VM)", best: "Melhor para iniciantes", desc: "Roda dentro do Windows/macOS usando VirtualBox ou VMware. Seguro e isolado.", pros: "Fácil, seguro, snapshots", cons: "Desempenho reduzido" },
          { title: "⚡ Dual Boot", best: "Melhor desempenho", desc: "Instala ao lado do Windows/macOS. Boot selecionado na inicialização.", pros: "Desempenho nativo", cons: "Risco de perda de dados" },
          { title: "💾 Live Boot (USB)", best: "Portátil e temporário", desc: "Executa direto do pendrive sem instalar. Nada é salvo por padrão.", pros: "Portátil, não instala nada", cons: "Dados perdidos ao desligar" },
          { title: "🪟 WSL 2 (Windows)", best: "Windows + Kali", desc: "Windows Subsystem for Linux 2. Linha de comando do Kali no Windows.", pros: "Integração Windows", cons: "Sem GUI nativa (Win-KeX resolve)" },
          { title: "🍓 Raspberry Pi", best: "ARM / portátil", desc: "Kali rodando em um SBC. Excelente para drop boxes e labs físicos.", pros: "Barato, pequeno, headless", cons: "Hardware limitado" },
          { title: "🐳 Docker", best: "Efêmero / CI", desc: "Container kalilinux/kali-rolling para tasks isoladas e descartáveis.", pros: "Sem overhead de VM", cons: "Sem kernel próprio" },
        ].map((opt, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold text-foreground mb-1 mt-0 border-0 text-base">{opt.title}</h3>
            <div className="text-xs text-primary font-medium mb-2">{opt.best}</div>
            <p className="text-sm text-muted-foreground mb-3">{opt.desc}</p>
            <div className="text-xs space-y-1">
              <div className="text-green-400">✓ {opt.pros}</div>
              <div className="text-red-400">✗ {opt.cons}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>Requisitos mínimos</h2>
      <CommandTable
        title="Hardware recomendado por modo"
        variations={[
          { cmd: "VM (VirtualBox/VMware)", desc: "Host Windows/macOS/Linux com virtualização habilitada (VT-x/AMD-V no BIOS).", output: "RAM: 4 GB host (2 GB VM) | Disco: 40 GB livres | CPU: 2 cores" },
          { cmd: "Bare metal / dual boot", desc: "Instalação tradicional no disco.", output: "RAM: 2 GB (4+ recomendado) | Disco: 20 GB (50+ recomendado) | CPU: x86_64" },
          { cmd: "WSL 2", desc: "Windows 10 build 19041+ ou Windows 11.", output: "Habilitar 'Plataforma de Máquina Virtual' no Painel" },
          { cmd: "Raspberry Pi", desc: "Pi 3B+, 4, 5 ou Zero 2W.", output: "microSD 16+ GB (32 GB recomendado) | Imagem ARM oficial" },
          { cmd: "Docker", desc: "Engine 20+ em qualquer host Linux/Windows/macOS.", output: "1 GB RAM, espaço para layers da imagem (~1 GB)" },
        ]}
      />

      <h2>1. Verificar suporte a virtualização (host)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Linux: checar VT-x / AMD-V",
            cmd: "egrep -c '(vmx|svm)' /proc/cpuinfo",
            out: `8                       (>0 = CPU suporta virtualização)`,
            outType: "success",
          },
          {
            comment: "checar se KVM/virtualização está habilitada no kernel",
            cmd: "lscpu | grep -i virtual",
            out: `Virtualization:                  VT-x
Virtualization type:             full`,
            outType: "info",
          },
          {
            comment: "Windows (PowerShell): checar Hyper-V e virtualização",
            cmd: "systeminfo | findstr /i \"Hyper Virtuali\"",
            out: `Hyper-V Requirements:      VM Monitor Mode Extensions: Yes
                           Virtualization Enabled In Firmware: Yes
                           Second Level Address Translation: Yes
                           Data Execution Prevention Available: Yes`,
            outType: "success",
          },
        ]}
      />

      <h2>2. Instalação em VM (VirtualBox) — recomendado</h2>
      <p>
        A Offensive Security disponibiliza imagens <strong>pré-configuradas</strong>{" "}
        (VirtualBox/VMware) prontas para uso. É <em>muito</em> mais rápido que instalar
        manualmente do ISO!
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) baixar e verificar checksum (Linux)",
            cmd: "wget https://cdimage.kali.org/kali-2025.2/kali-linux-2025.2-virtualbox-amd64.7z",
            out: `--2026-04-03 22:14:18-- https://cdimage.kali.org/kali-2025.2/kali-linux-2025.2-virtualbox-amd64.7z
Resolving cdimage.kali.org... 192.99.200.113
Connecting to cdimage.kali.org... connected.
HTTP request sent, awaiting response... 200 OK
Length: 3812412124 (3.6G) [application/x-7z-compressed]
Saving to: 'kali-linux-2025.2-virtualbox-amd64.7z'

kali-linux-2025.2-virtualbox-amd64.7z   100%[===================>]   3.55G  11.2MB/s    in 5m 24s
2026-04-03 22:19:42 (11.2 MB/s) - saved [3812412124/3812412124]`,
            outType: "info",
          },
          {
            cmd: "sha256sum kali-linux-2025.2-virtualbox-amd64.7z",
            out: `c1e07adc59f6c3eaa7a02e7a4e5f5cc18e2c3f4a5b6c7d8e9f0a1b2c3d4e5f60  kali-linux-2025.2-virtualbox-amd64.7z`,
            outType: "default",
          },
          {
            comment: "comparar com o hash publicado em kali.org/get-kali",
            cmd: "echo 'c1e07adc59f6c3eaa7a02e7a4e5f5cc18e2c3f4a5b6c7d8e9f0a1b2c3d4e5f60  kali-linux-2025.2-virtualbox-amd64.7z' | sha256sum -c",
            out: "kali-linux-2025.2-virtualbox-amd64.7z: OK",
            outType: "success",
          },
          {
            comment: "2) extrair e importar no VirtualBox",
            cmd: "7z x kali-linux-2025.2-virtualbox-amd64.7z",
            out: `7-Zip [64] 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov

Extracting archive: kali-linux-2025.2-virtualbox-amd64.7z
[...]
Everything is Ok
Folders: 1
Files: 3
Size:       18421321024
Compressed: 3812412124`,
            outType: "info",
          },
          {
            cmd: "VBoxManage import kali-linux-2025.2-virtualbox-amd64/kali-linux-2025.2-virtualbox-amd64.vbox",
            out: `0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%
Successfully imported the appliance.`,
            outType: "success",
          },
          {
            comment: "3) iniciar a VM",
            cmd: "VBoxManage startvm 'Kali Linux 2025.2'",
            out: `Waiting for VM "Kali Linux 2025.2" to power on...
VM "Kali Linux 2025.2" has been successfully started.`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Credenciais padrão da imagem pré-built">
        Usuário: <code>kali</code> / Senha: <code>kali</code>. <strong>Troque imediatamente</strong>{" "}
        com <code>passwd</code> após o primeiro login. Para imagens novas (2024.4+), pode pedir
        para criar usuário no boot inicial.
      </AlertBox>

      <h2>3. Pós-instalação na VM — Guest Additions</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "habilita clipboard, drag&drop, fullscreen automático, pasta compartilhada",
            cmd: "sudo apt update && sudo apt install -y virtualbox-guest-x11 virtualbox-guest-utils",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  virtualbox-guest-utils virtualbox-guest-x11
Setting up virtualbox-guest-utils (7.0.18-2) ...
Setting up virtualbox-guest-x11 (7.0.18-2) ...
Created symlink /etc/systemd/system/multi-user.target.wants/vboxservice.service`,
            outType: "success",
          },
          {
            comment: "para VMware Workstation/Fusion, em vez disso:",
            cmd: "sudo apt install -y open-vm-tools open-vm-tools-desktop",
            out: `The following NEW packages will be installed:
  open-vm-tools open-vm-tools-desktop
Setting up open-vm-tools (12.4.0-2) ...`,
            outType: "info",
          },
          {
            cmd: "sudo reboot",
            out: "(VM reinicia)",
            outType: "muted",
          },
          {
            comment: "depois do reboot — confirmar que carregou",
            cmd: "lsmod | grep -E 'vbox|vmw'",
            out: `vboxguest             471040  6 vboxsf
vboxsf                102400  0
vboxvideo              45056  2`,
            outType: "default",
          },
        ]}
      />

      <h2>4. WSL 2 (Windows) — Kali no Windows</h2>
      <Terminal
        path="C:\\Users\\wallyson"
        host="WIN11"
        user="wallyson"
        lines={[
          {
            comment: "PowerShell COMO ADMINISTRADOR — instala WSL 2 do zero",
            cmd: "wsl --install",
            out: `Installing: Virtual Machine Platform
Virtual Machine Platform has been installed.
Installing: Windows Subsystem for Linux
Windows Subsystem for Linux has been installed.
Installing: Ubuntu                                              ← padrão; vamos trocar
Ubuntu has been installed.
The requested operation is successful. Changes will not be effective
until the system is rebooted.`,
            outType: "info",
          },
          {
            comment: "listar distros disponíveis",
            cmd: "wsl --list --online",
            out: `The following is a list of valid distributions that can be installed.
Install using 'wsl.exe --install <Distro>'.

NAME                                   FRIENDLY NAME
Ubuntu                                 Ubuntu
Debian                                 Debian GNU/Linux
kali-linux                             Kali Linux Rolling
Ubuntu-24.04                           Ubuntu 24.04 LTS
openSUSE-Tumbleweed                    openSUSE Tumbleweed
SUSE-Linux-Enterprise-15-SP6           SUSE Linux Enterprise 15 SP6
OracleLinux_9_1                        Oracle Linux 9.1`,
            outType: "default",
          },
          {
            comment: "instalar especificamente o Kali",
            cmd: "wsl --install -d kali-linux",
            out: `Downloading: Kali Linux Rolling
Installing: Kali Linux Rolling
Distribution successfully installed. It can be launched via 'wsl.exe -d kali-linux'

Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers
Enter new UNIX username: wallyson
New password: ********
Retype new password: ********
passwd: password updated successfully
Installation successful!`,
            outType: "success",
          },
          {
            comment: "confirmar versão WSL 2 (não WSL 1)",
            cmd: "wsl -l -v",
            out: `  NAME          STATE           VERSION
* kali-linux    Running         2
  Ubuntu        Stopped         2`,
            outType: "info",
          },
        ]}
      />

      <h3>Dentro do Kali WSL — atualizar e instalar ferramentas</h3>
      <Terminal
        path="~"
        host="kali-wsl"
        lines={[
          {
            cmd: "sudo apt update && sudo apt full-upgrade -y",
            out: `Hit:1 http://kali.download/kali kali-rolling InRelease
Get:2 http://kali.download/kali kali-rolling/main amd64 Packages [19.8 MB]
Fetched 19.8 MB in 4s (4.521 kB/s)
Reading package lists... Done
Building dependency tree... Done
142 packages can be upgraded. Run 'apt list --upgradable' to see them.
[...]
Setting up linux-image-amd64 (6.11.5-1kali1) ...
Setting up base-files (2025.2.0) ...`,
            outType: "success",
          },
          {
            comment: "metapacote enxuto (~600 MB) — recomendado pra WSL",
            cmd: "sudo apt install -y kali-linux-headless",
            out: `The following NEW packages will be installed:
  kali-linux-headless nmap nikto sqlmap hydra john metasploit-framework
  burpsuite-community wireshark-cli (+312 dependências)
Need to get 1.842 MB of archives.
After this operation, 4.842 MB of additional disk space will be used.
[...]
Setting up metasploit-framework (6.4.21-0kali1) ...
Setting up nmap (7.94-1) ...`,
            outType: "info",
          },
          {
            cmd: "lsb_release -a && uname -a",
            out: `No LSB modules are available.
Distributor ID: Kali
Description:    Kali GNU/Linux Rolling
Release:        2025.2
Codename:       kali-rolling
Linux DESKTOP-ABC123 5.15.153.1-microsoft-standard-WSL2 #1 SMP Fri Mar 29 23:14:13 UTC 2024 x86_64 GNU/Linux`,
            outType: "default",
          },
        ]}
      />

      <h2>5. Win-KeX — interface gráfica do Kali no Windows</h2>
      <p>
        O <strong>Win-KeX</strong> ("Kali Desktop EXperience for Windows") roda toda a GUI do
        Kali dentro de uma janela no Windows ou em modo "seamless" (cada janela do Kali parece
        nativa do Windows).
      </p>

      <Terminal
        path="~"
        host="kali-wsl"
        lines={[
          {
            cmd: "sudo apt install -y kali-win-kex",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  kali-win-kex tigervnc-standalone-server tigervnc-common xfce4 xfce4-goodies
  pulseaudio (+184 dependências)
Need to get 121 MB of archives.
After this operation, 521 MB of additional disk space will be used.
[...]
Setting up tigervnc-standalone-server (1.13.1+dfsg-2) ...
Setting up kali-win-kex (2.3.0) ...`,
            outType: "success",
          },
          {
            comment: "1ª vez: define senha do VNC",
            cmd: "kex --win -s",
            out: `Setting up Win-KeX...
You will require a password to access your desktops.

Password: ********
Verify:   ********
Would you like to enter a view-only password (y/n)? n

Starting Win-KeX in window mode...
✓ TigerVNC server started on display :1
✓ Audio server started
Launching window...`,
            outType: "info",
          },
          {
            comment: "modo seamless (janelas integradas ao Windows)",
            cmd: "kex --sl -s",
            out: `Starting Win-KeX in seamless mode...
✓ Audio enabled
✓ Sound on Windows side
✓ Drag and drop enabled
(janelas do Kali aparecem direto na barra de tarefas do Windows)`,
            outType: "success",
          },
          {
            comment: "modo Enhanced Session (mais rápido, com áudio)",
            cmd: "kex --esm --ip -s",
            out: `Starting Win-KeX in Enhanced Session Mode...
✓ Multi-monitor support enabled
✓ Audio redirection enabled
✓ Clipboard sync enabled`,
            outType: "info",
          },
          {
            comment: "parar tudo",
            cmd: "kex --stop",
            out: `Stopping Win-KeX...
✓ Killing VNC server on display :1
✓ Killing audio server
Done.`,
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Modos do Win-KeX"
        variations={[
          { cmd: "kex --win -s", desc: "Window mode — desktop completo dentro de uma janela.", output: "Mais simples; ocupa só uma janela do Windows." },
          { cmd: "kex --sl -s", desc: "Seamless — cada app vira janela nativa do Windows.", output: "Aparece na barra de tarefas; sem desktop separado." },
          { cmd: "kex --esm --ip -s", desc: "Enhanced Session — máximo desempenho + áudio + clipboard.", output: "Usa RDP, recomendado para uso prolongado." },
          { cmd: "kex --stop", desc: "Para todos os modos rodando.", output: "Encerra VNC + áudio + sessão." },
        ]}
      />

      <h2>6. Dual Boot (Kali + Windows)</h2>
      <AlertBox type="danger" title="Faça backup ANTES">
        Dual boot pode resultar em <strong>perda total de dados</strong> se feito incorretamente.
        Faça backup completo do Windows e teste primeiro em VM. Desabilite o{" "}
        <strong>Fast Boot</strong> e o <strong>BitLocker</strong> antes de mexer nas partições.
      </AlertBox>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) gravar ISO no pendrive (8 GB+) — Linux",
            cmd: "sudo dd if=kali-linux-2025.2-installer-amd64.iso of=/dev/sdb bs=4M status=progress conv=fsync",
            out: `4292870144 bytes (4.3 GB, 4.0 GiB) copied, 184 s, 23.3 MB/s
1024+0 records in
1024+0 records out
4294967296 bytes (4.3 GB, 4.0 GiB) copied, 187.421 s, 22.9 MB/s`,
            outType: "warning",
          },
          {
            comment: "2) verificar que gravou direito",
            cmd: "lsblk /dev/sdb",
            out: `NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sdb      8:16   1 14.5G  0 disk 
├─sdb1   8:17   1  4.3G  0 part 
└─sdb2   8:18   1  3.5M  0 part`,
            outType: "info",
          },
        ]}
      />

      <h3>No Windows: reduzir partição (Disk Management)</h3>
      <OutputBlock label="passos no Windows" type="default">
{`1. Win + R → diskmgmt.msc
2. Clique direito na partição C: → "Reduzir Volume..."
3. Reduza pelo menos 30 GB (50 GB recomendado para Kali)
4. NÃO formate o espaço livre — deixe "Não Alocado"
5. Reinicie e boot pelo USB (F12, F2 ou Del no BIOS)
6. No instalador do Kali:
   - Idioma: Português (Brasil)
   - Localização: São Paulo
   - Particionamento: "Manual" → use o espaço livre
       /        ext4   25 GB
       swap            4 GB
       /home    ext4   resto
   - GRUB: instalar em /dev/sda (MBR) ou /dev/sda1 (EFI)
7. O GRUB detecta o Windows automaticamente`}
      </OutputBlock>

      <h2>7. Live USB (sem instalar nada)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Windows: use Rufus ou Balena Etcher (GUI)",
            cmd: "(no Windows) rufus.exe → kali-linux-2025.2-live-amd64.iso → /dev/sdX",
            out: `Selected image: kali-linux-2025.2-live-amd64.iso (4.2 GB)
Target: USB Drive (E:) [16 GB]
Partition scheme: GPT  |  Target system: UEFI
Format: FAT32

Writing image... [###########---] 78%
Done! Eject and boot from this USB.`,
            outType: "info",
          },
          {
            comment: "Linux: balena etcher CLI ou dd",
            cmd: "sudo dd if=kali-linux-2025.2-live-amd64.iso of=/dev/sdb bs=4M status=progress oflag=sync",
            out: `4242538496 bytes (4.2 GB, 4.0 GiB) copied, 182 s, 23.3 MB/s`,
            outType: "warning",
          },
          {
            comment: "boot opções no live USB",
            cmd: "(GRUB do live)",
            out: `Kali GNU/Linux Live (Live system, amd64)
Kali GNU/Linux Live Failsafe mode
Kali GNU/Linux Live (forensic mode)             ← NÃO toca em discos do host!
Kali GNU/Linux Live with USB persistence        ← grava mudanças no USB
Kali GNU/Linux Live with USB Encrypted Persistence
Kali GNU/Linux Installer
Kali GNU/Linux Installer with speech synthesis`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="info" title="Modo Forense">
        O modo <strong>forensic</strong> não monta automaticamente nenhum disco interno e não usa
        swap — perfeito para investigação de evidências sem alterar dados originais (preserva
        cadeia de custódia).
      </AlertBox>

      <h2>8. Raspberry Pi (ARM)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "baixar imagem ARM oficial",
            cmd: "wget https://kali.download/arm-images/kali-2025.2/kali-linux-2025.2-raspberry-pi-arm64.img.xz",
            out: `--2026-04-03 22:14:18 https://kali.download/arm-images/kali-2025.2/kali-linux-2025.2-raspberry-pi-arm64.img.xz
Length: 2412412124 (2.2G)
[================================>] 100% in 3m 21s
Saved: 'kali-linux-2025.2-raspberry-pi-arm64.img.xz'`,
            outType: "info",
          },
          {
            cmd: "xz -d kali-linux-2025.2-raspberry-pi-arm64.img.xz",
            out: "(descompactando — gera ~7 GB de .img)",
            outType: "muted",
          },
          {
            comment: "gravar no microSD (cuidado: /dev/sdX correto!)",
            cmd: "sudo dd if=kali-linux-2025.2-raspberry-pi-arm64.img of=/dev/mmcblk0 bs=4M status=progress conv=fsync",
            out: `7321321024 bytes (7.3 GB, 6.8 GiB) copied, 412 s, 17.8 MB/s
1745+0 records in
1745+0 records out
7340032000 bytes (7.3 GB, 6.8 GiB) copied, 421.421 s, 17.4 MB/s`,
            outType: "warning",
          },
          {
            comment: "expandir filesystem para usar todo o cartão (após 1º boot)",
            cmd: "sudo kalipi-config",
            out: `┌─────┤ kalipi-config ├─────┐
│ 1 Expand Filesystem      │   ← este!
│ 2 Change User Password   │
│ 3 Localisation Options   │
│ 4 Interfacing Options    │
│ 5 Advanced Options       │
│ 6 Update                 │
└──────────────────────────┘`,
            outType: "info",
          },
          {
            comment: "verificar temperatura do Pi (importante!)",
            cmd: "vcgencmd measure_temp && vcgencmd measure_clock arm",
            out: `temp=58.4'C
frequency(48)=1500000000`,
            outType: "default",
          },
        ]}
      />

      <h2>9. Primeiras configurações pós-instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) atualizar tudo (rolling release — sempre faça)",
            cmd: "sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y",
            out: `Hit:1 http://kali.download/kali kali-rolling InRelease
Reading package lists... Done
142 packages can be upgraded. Run 'apt list --upgradable' to see them.
[...]
The following packages will be REMOVED:
  linux-image-6.11.0-kali1-amd64 (substituído por 6.11.0-kali3)
0 upgraded, 0 newly installed, 1 to remove.`,
            outType: "success",
          },
          {
            comment: "2) escolher metapacote certo para seu caso",
            cmd: "sudo apt install -y kali-linux-default",
            out: `The following NEW packages will be installed:
  kali-linux-default kali-tools-top10 metasploit-framework burpsuite
  wireshark nmap sqlmap hydra john aircrack-ng (+482 dependências)
Need to get 4.821 MB of archives.
After this operation, 12.421 MB of additional disk space will be used.
[...]
Setting up kali-linux-default (2025.2.0) ...`,
            outType: "info",
          },
          {
            comment: "3) trocar senha padrão (kali/kali → SUA senha forte)",
            cmd: "passwd",
            out: `Changing password for wallyson.
Current password: ********
New password: ************
Retype new password: ************
passwd: password updated successfully`,
            outType: "warning",
          },
          {
            comment: "4) idioma e fuso (Brasil)",
            cmd: "sudo dpkg-reconfigure locales && sudo timedatectl set-timezone America/Sao_Paulo",
            out: `Generating locales (this might take a while)...
  pt_BR.UTF-8... done
Generation complete.

(timezone agora é America/Sao_Paulo)`,
            outType: "default",
          },
          {
            cmd: "timedatectl",
            out: `               Local time: Thu 2026-04-03 22:14:18 -03
           Universal time: Fri 2026-04-04 01:14:18 UTC
                 Time zone: America/Sao_Paulo (-03, -0300)
 System clock synchronized: yes
               NTP service: active`,
            outType: "info",
          },
        ]}
      />

      <h2>10. Metapacotes do Kali</h2>
      <CommandTable
        title="Quais ferramentas instalar?"
        variations={[
          { cmd: "kali-linux-headless", desc: "Sem GUI. Só CLI. ~600 MB.", output: "Ideal para WSL, servidor, drop box." },
          { cmd: "kali-linux-default", desc: "Top 100 ferramentas + GUI. ~4 GB.", output: "Padrão da imagem ISO. Recomendado." },
          { cmd: "kali-linux-large", desc: "Tudo do default + 200 extras. ~8 GB.", output: "Para quem quer tudo à mão." },
          { cmd: "kali-linux-everything", desc: "TODAS as ferramentas. ~15 GB.", output: "Raramente necessário." },
          { cmd: "kali-tools-top10", desc: "Apenas as 10 mais usadas (nmap, msf, burp...).", output: "Mais leve que default." },
          { cmd: "kali-tools-web", desc: "Categoria web (sqlmap, burp, dirb, gobuster...).", output: "Pentest web especializado." },
          { cmd: "kali-tools-wireless", desc: "Aircrack, kismet, reaver, wifite...", output: "Pentest WiFi especializado." },
          { cmd: "kali-tools-forensics", desc: "Autopsy, volatility, foremost, ddrescue...", output: "Forense digital." },
          { cmd: "kali-tools-passwords", desc: "John, hashcat, hydra, crunch...", output: "Cracking de senha." },
        ]}
      />

      <h2>11. Verificando a instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "uname -a && lsb_release -a",
            out: `Linux kali 6.11.0-kali3-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 (2025-02-14) x86_64 GNU/Linux
No LSB modules are available.
Distributor ID: Kali
Description:    Kali GNU/Linux Rolling
Release:        2025.2
Codename:       kali-rolling`,
            outType: "info",
          },
          {
            cmd: "free -h && df -h /",
            out: `               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       1.3Gi       4.8Gi        82Mi       1.6Gi       6.4Gi
Swap:          2.0Gi          0B       2.0Gi
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        49G  8.4G   38G  19% /`,
            outType: "default",
          },
          {
            cmd: "ip -br a",
            out: `lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             192.168.1.42/24 fe80::a00:27ff:fe42:1234/64
docker0          DOWN           172.17.0.1/16`,
            outType: "info",
          },
          {
            comment: "contar quantas ferramentas Kali estão instaladas",
            cmd: "dpkg -l | grep -E '^ii.*kali-' | wc -l",
            out: "147",
            outType: "success",
          },
          {
            comment: "smoke test: nmap funciona?",
            cmd: "nmap -V | head -2",
            out: `Nmap version 7.94 ( https://nmap.org )
Platform: x86_64-pc-linux-gnu`,
            outType: "default",
          },
          {
            comment: "msfconsole abre?",
            cmd: "msfconsole -q -x 'version; exit'",
            out: `Framework: 6.4.21-dev
Console  : 6.4.21-dev`,
            outType: "info",
          },
        ]}
      />

      <OutputBlock label="checklist final" type="success">
{`✓ Sistema atualizado (apt full-upgrade)
✓ Senha padrão trocada (passwd)
✓ Locale pt_BR + fuso America/Sao_Paulo
✓ Metapacote escolhido (kali-linux-default ou outro)
✓ Guest Additions / VMware Tools / Win-KeX (se VM/WSL)
✓ Snapshot da VM em "estado limpo" (para restaurar quando quiser)
✓ SSH desabilitado por padrão (segurança):  systemctl status ssh
✓ Firewall checado:  sudo ufw status verbose`}
      </OutputBlock>

      <PracticeBox
        title="Lab: Kali em VM (VirtualBox) do zero"
        goal="Subir uma VM Kali pré-configurada, atualizar, instalar Guest Additions, tirar snapshot."
        steps={[
          "Baixe a imagem VirtualBox em kali.org/get-kali (~3.5 GB).",
          "Verifique o SHA256 contra o hash publicado no site.",
          "Importe o .ova/.vbox no VirtualBox (File → Import Appliance).",
          "Aumente RAM para 4 GB e CPU para 2 cores nas configurações.",
          "Inicie a VM. Login: kali / kali. Troque a senha com `passwd`.",
          "Atualize: sudo apt update && sudo apt full-upgrade -y.",
          "Instale Guest Additions: sudo apt install virtualbox-guest-x11.",
          "Reinicie. Tire um SNAPSHOT chamado 'limpo-atualizado'.",
        ]}
        command={`# checagens depois do reboot
uname -a
lsb_release -a
free -h
df -h
ip -br a
lsmod | grep vbox
sudo apt list --installed 2>/dev/null | grep -E 'kali-linux|nmap|metasploit' | head`}
        expected={`Linux kali 6.11.0-kali3-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 x86_64
Distributor ID: Kali  |  Release: 2025.2  |  Codename: kali-rolling

Mem: 4.0Gi total  |  Disk: 49G size, 8.4G used
eth0  UP  10.0.2.15/24

vboxguest  471040  6 vboxsf
vboxsf     102400  0

kali-linux-default/kali-rolling 2025.2.0 amd64
nmap/kali-rolling 7.94-1 amd64
metasploit-framework/kali-rolling 6.4.21-0kali1 amd64`}
        verify="Snapshot criado? VBoxManage snapshot 'Kali Linux 2025.2' list — deve mostrar 'limpo-atualizado'. Pode quebrar a VM à vontade e restaurar."
      />

      <AlertBox type="success" title="Instalação concluída!">
        Com o Kali instalado, atualizado e com snapshot, está pronto para começar. Próximos
        passos: aprender o desktop (página <strong>Interface</strong>), os comandos básicos do
        terminal e o sistema de arquivos do Linux.
      </AlertBox>
    </PageContainer>
  );
}
