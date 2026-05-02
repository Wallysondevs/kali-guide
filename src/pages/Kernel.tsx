import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Kernel() {
  return (
    <PageContainer
      title="Kernel, módulos e DKMS"
      subtitle="Entender qual kernel você tem, carregar/descarregar módulos e recompilar drivers (ex: chip wifi para monitor mode)."
      difficulty="avancado"
      timeToRead="18 min"
    >
      <h2>Identificar o kernel</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "uname -a",
            out: "Linux kali 6.11.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 (2024-10-29) x86_64 GNU/Linux",
            outType: "info",
          },
          {
            cmd: "uname -r",
            out: "6.11.0-kali1-amd64",
            outType: "success",
          },
          {
            cmd: "cat /proc/version",
            out: "Linux version 6.11.0-kali1-amd64 (devel@kali.org) (gcc-13 (Debian 13.2.0-25) 13.2.0, GNU ld (GNU Binutils for Debian) 2.43.1) #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 (2024-10-29)",
            outType: "default",
          },
          {
            cmd: "ls /lib/modules/",
            out: "6.11.0-kali1-amd64",
            outType: "muted",
          },
        ]}
      />

      <h2>Atualizar kernel e instalar headers</h2>
      <p>
        Headers são essenciais para compilar módulos externos (drivers, VirtualBox, DKMS).
        No Kali eles já costumam vir, mas em VM minimal não.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt update && sudo apt install -y linux-image-amd64 linux-headers-amd64",
            out: `linux-image-6.11.0-kali1-amd64 is already the newest version (6.11.5-1kali1).
The following NEW packages will be installed:
  linux-headers-6.11.0-kali1-amd64 linux-headers-6.11.0-kali1-common
0 upgraded, 3 newly installed.`,
            outType: "success",
          },
          {
            comment: "depois de instalar nova versão, sempre regere o initramfs e o GRUB",
            cmd: "sudo update-initramfs -u -k all && sudo update-grub",
            out: `update-initramfs: Generating /boot/initrd.img-6.11.0-kali1-amd64
Generating grub configuration file ...
done`,
            outType: "info",
          },
        ]}
      />

      <h2>Listar módulos carregados</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "lsmod | head -10",
            out: `Module                  Size  Used by
rfcomm                 90112  2
nft_chain_nat          12288  3
xt_MASQUERADE          12288  1
nf_conntrack          196608  2 nf_nat,xt_MASQUERADE
nf_defrag_ipv6         24576  1 nf_conntrack
xt_addrtype            12288  2
nft_compat             20480  4
nft_counter            12288  3
nf_tables             294912  19 nft_compat,nft_counter,nft_chain_nat
libcrc32c              12288  4 nf_conntrack,nf_nat,nf_tables,raid456`,
            outType: "info",
          },
          {
            cmd: "modinfo nf_conntrack | head -8",
            out: `filename:       /lib/modules/6.11.0-kali1-amd64/kernel/net/netfilter/nf_conntrack.ko.xz
license:        GPL
alias:          ip_conntrack
description:    Connection tracking module for IPv4 and IPv6
author:         Patrick McHardy <kaber@trash.net>
depends:        nf_defrag_ipv6,nf_defrag_ipv4,libcrc32c
intree:         Y
name:           nf_conntrack`,
            outType: "default",
          },
        ]}
      />

      <h2>Carregar e descarregar módulos</h2>
      <CommandTable
        title="modprobe / rmmod / depmod"
        variations={[
          { cmd: "sudo modprobe iwlwifi", desc: "Carrega módulo + dependências.", output: "Resolve depmod automaticamente." },
          { cmd: "sudo modprobe -r iwlwifi", desc: "Remove módulo (com deps).", output: "Mais seguro que rmmod direto." },
          { cmd: "sudo rmmod iwlwifi", desc: "Remove só esse módulo (falha se em uso).", output: "rmmod: ERROR: Module iwlwifi is in use" },
          { cmd: "sudo modprobe -v vboxdrv", desc: "Verbose: mostra depmod, insmod e parâmetros.", output: "insmod /lib/modules/.../vboxdrv.ko.xz" },
          { cmd: "sudo modprobe iwlwifi debug=0xFFFFFFFF", desc: "Carrega com parâmetro custom.", output: "Habilita debug verboso no dmesg." },
          { cmd: "sudo depmod -a", desc: "Recalcula deps depois de copiar .ko manualmente.", output: "Necessário para módulos out-of-tree." },
          { cmd: "echo 'blacklist nouveau' | sudo tee /etc/modprobe.d/blacklist-nouveau.conf", desc: "Impede que módulo carregue no boot.", output: "Comum p/ trocar nouveau por nvidia." },
          { cmd: "sudo modprobe --first-time mod", desc: "Falha se já estiver carregado.", output: "Útil para checar duplicidade." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver se a placa wireless suporta monitor mode",
            cmd: "iw list | grep -A 5 'Supported interface modes'",
            out: `	Supported interface modes:
		 * IBSS
		 * managed
		 * AP
		 * AP/VLAN
		 * monitor
		 * mesh point`,
            outType: "success",
          },
          {
            comment: "ativar modo monitor (essencial para airodump-ng)",
            cmd: "sudo airmon-ng start wlan0",
            out: `PHY     Interface       Driver          Chipset
phy0    wlan0           rt2800usb       Ralink RT5572

  (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)
  (mac80211 station mode vif disabled for [phy0]wlan0)`,
            outType: "warning",
          },
        ]}
      />

      <h2>DKMS — drivers que sobrevivem a upgrade de kernel</h2>
      <p>
        Sem DKMS, todo upgrade de kernel quebra seu driver compilado manualmente.
        DKMS recompila automaticamente para cada novo kernel.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "dkms status",
            out: `realtek-rtl88xxau/5.13.6, 6.11.0-kali1-amd64, x86_64: installed
v4l2loopback/0.13.2, 6.11.0-kali1-amd64, x86_64: installed`,
            outType: "info",
          },
          {
            comment: "cenário pentest: instalar driver do alfa awus036ach (rtl88xx) p/ injection",
            cmd: "sudo apt install -y realtek-rtl88xxau-dkms",
            out: `Building module:
Cleaning build area...
'make' -j8 KERNELRELEASE=6.11.0-kali1-amd64 KVER=6.11.0-kali1-amd64...(bad exit status: 2)
ERROR (dkms apport): kernel package linux-headers-6.11.0-kali1-amd64 is not supported`,
            outType: "warning",
          },
          {
            comment: "se falhar com kernel novo, force a recompilação",
            cmd: "sudo dkms autoinstall",
            out: `Building module:
DKMS: install completed.`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="dkms — comandos essenciais"
        variations={[
          { cmd: "dkms status", desc: "Lista o que está instalado e em qual kernel.", output: "rtl88xxau/5.13.6: installed" },
          { cmd: "sudo dkms add -m driver -v 1.2.3", desc: "Registra um driver no DKMS (depois de copiar p/ /usr/src/).", output: "Creating symlink..." },
          { cmd: "sudo dkms build -m driver -v 1.2.3", desc: "Compila para o kernel rodando.", output: "Building module..." },
          { cmd: "sudo dkms install -m driver -v 1.2.3", desc: "Instala em /lib/modules.", output: "Running module version sanity check." },
          { cmd: "sudo dkms remove driver/1.2.3 --all", desc: "Remove de todos os kernels.", output: "Cleaning..." },
          { cmd: "sudo dkms autoinstall", desc: "Recompila tudo p/ o kernel atual.", output: "Comando salvador após upgrade." },
        ]}
      />

      <h2>sysctl — kernel parameters em runtime</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sysctl -a 2>/dev/null | grep -E '(ip_forward|rp_filter|randomize)' | head",
            out: `net.ipv4.conf.all.rp_filter = 1
net.ipv4.ip_forward = 0
kernel.randomize_va_space = 2`,
            outType: "info",
          },
          {
            comment: "habilitar IP forwarding (essencial p/ ARP spoofing, MITM, redirector)",
            cmd: "sudo sysctl -w net.ipv4.ip_forward=1",
            out: "net.ipv4.ip_forward = 1",
            outType: "warning",
          },
          {
            comment: "para PERSISTIR após reboot, escreva em /etc/sysctl.d/",
            cmd: "echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-pentest.conf",
            out: "net.ipv4.ip_forward=1",
            outType: "muted",
          },
          {
            comment: "DESABILITAR ASLR (para debugar exploits previsíveis em CTF)",
            cmd: "sudo sysctl -w kernel.randomize_va_space=0",
            out: "kernel.randomize_va_space = 0",
            outType: "warning",
          },
        ]}
      />

      <CodeBlock
        language="ini"
        title="/etc/sysctl.d/99-pentest.conf — perfil ofensivo persistente"
        code={`# Roteamento (necessário para ARP spoof / MITM / redirector C2)
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1

# Não responde a ICMP redirects falsos
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# core dumps grandes para análise pós-crash
kernel.core_pattern = /tmp/core_%e.%p
fs.suid_dumpable = 1

# limite de inotify (precisa pra rodar VS Code + várias tools)
fs.inotify.max_user_watches = 524288`}
      />

      <h2>Recompilar driver wifi (caso real: rtl88xxau)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y build-essential dkms git linux-headers-$(uname -r)",
            out: "(...) 0 upgraded, 0 newly installed, 0 to remove.",
            outType: "muted",
          },
          {
            cmd: "git clone https://github.com/aircrack-ng/rtl8812au.git /tmp/rtl8812au",
            out: `Cloning into '/tmp/rtl8812au'...
remote: Enumerating objects: 18432, done.
Receiving objects: 100% (18432/18432), 12.4 MiB | 8.2 MiB/s, done.`,
            outType: "info",
          },
          {
            cmd: "cd /tmp/rtl8812au && sudo make dkms_install",
            out: `Creating symlink /var/lib/dkms/8812au/5.13.6/source -> /usr/src/8812au-5.13.6
DKMS: add completed.
Building module:
DKMS: install completed.`,
            outType: "success",
          },
          {
            cmd: "sudo modprobe 88XXau && lsmod | grep 88XXau",
            out: "88XXau               2310144  0",
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Cuidado com kernels backport">
        <p>
          Drivers DKMS quebram quando você troca para kernel muito novo (ex: instalar um do
          backports). Sempre rode <code>sudo dkms autoinstall</code> + <code>sudo update-initramfs -u</code>
          após upgrade. Se o driver wifi for crítico para seu engagement, mantenha um snapshot
          do sistema (LVM/Timeshift) ANTES de mexer no kernel.
        </p>
      </AlertBox>

      <PracticeBox
        title="Habilite IP forwarding (modo router) e teste"
        goal="Configurar Kali para rotear pacotes entre interfaces — pré-requisito de qualquer MITM/ARP spoof."
        steps={[
          "Ver estado atual de ip_forward.",
          "Ativar e persistir.",
          "Confirmar com sysctl.",
          "Validar lendo /proc.",
        ]}
        command={`sysctl net.ipv4.ip_forward
sudo sysctl -w net.ipv4.ip_forward=1
echo 'net.ipv4.ip_forward = 1' | sudo tee /etc/sysctl.d/99-forward.conf
sudo sysctl -p /etc/sysctl.d/99-forward.conf
cat /proc/sys/net/ipv4/ip_forward`}
        expected={`net.ipv4.ip_forward = 0
net.ipv4.ip_forward = 1
net.ipv4.ip_forward = 1
net.ipv4.ip_forward = 1
1`}
        verify="O último '1' confirma. Pronto para arpspoof / bettercap / responder em modo MITM."
      />
    </PageContainer>
  );
}
