import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Boot() {
  return (
    <PageContainer
      title="Boot, GRUB2 e recuperação"
      subtitle="GRUB é a primeira coisa que roda no computador. Saber tocar nele te tira de qualquer enrascada — inclusive a do alvo."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>O que acontece quando você liga a máquina</h2>
      <p>
        Em PC moderno o fluxo é: <strong>UEFI/BIOS</strong> → <strong>GRUB2</strong> (bootloader) →{" "}
        <strong>kernel Linux + initramfs</strong> → <strong>systemd</strong> (PID 1) → seu login.
        O GRUB é o ponto onde você consegue passar parâmetros pro kernel ANTES dele subir — e é
        aqui que mora a recuperação (e algumas técnicas de PrivEsc físico).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /boot/",
            out: `config-6.11.0-kali1-amd64
grub
initrd.img-6.11.0-kali1-amd64
System.map-6.11.0-kali1-amd64
vmlinuz-6.11.0-kali1-amd64`,
            outType: "info",
          },
          {
            comment: "EFI mostra que estamos em UEFI",
            cmd: "ls /sys/firmware/efi 2>/dev/null && echo UEFI || echo BIOS legado",
            out: `config_table efivars fw_platform_size fw_vendor runtime systab
UEFI`,
            outType: "success",
          },
        ]}
      />

      <h2>Anatomia do /etc/default/grub</h2>
      <p>Esse é o arquivo MESTRE. Mexa aqui, depois rode <code>update-grub</code>.</p>

      <CodeBlock
        language="bash"
        title="/etc/default/grub"
        code={`# Tempo (em segundos) do menu GRUB. -1 = espera infinita; 0 = pula direto.
GRUB_TIMEOUT=5

# Distro mostrada nas entradas do menu.
GRUB_DISTRIBUTOR="Kali GNU/Linux"

# Parâmetros padrão passados ao kernel em TODA boot normal.
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"

# Parâmetros sempre passados (mesmo em recovery).
GRUB_CMDLINE_LINUX=""

# Esconder menu (descomentar para acelerar boot)
#GRUB_TIMEOUT_STYLE=hidden

# Resolução do GRUB no console
GRUB_GFXMODE=1024x768`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "depois de qualquer alteração em /etc/default/grub",
            cmd: "sudo update-grub",
            out: `Sourcing file \`/etc/default/grub'
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.11.0-kali1-amd64
Found initrd image: /boot/initrd.img-6.11.0-kali1-amd64
Found memtest86+ 64bit EFI image: /boot/memtest86+x64.efi
done`,
            outType: "success",
          },
        ]}
      />

      <h2>Parâmetros úteis do kernel</h2>
      <CommandTable
        title="GRUB_CMDLINE_LINUX e edição na hora (tecla 'e' no menu)"
        variations={[
          { cmd: "quiet splash", desc: "Esconde mensagens, mostra splash bonito.", output: "Default Kali — para debug, REMOVA." },
          { cmd: "init=/bin/bash", desc: "Pula o systemd e cai direto num shell root sem senha.", output: "PrivEsc físico clássico — exige acesso ao GRUB." },
          { cmd: "single", desc: "Boot em modo single-user (rescue.target).", output: "Em alguns sistemas dá shell root sem senha." },
          { cmd: "nomodeset", desc: "Desabilita KMS — usa quando driver de vídeo falha.", output: "Salva live USB em hardware exótico." },
          { cmd: "rd.break", desc: "Quebra o initramfs antes do switch_root (RHEL).", output: "Para resetar root password sem live USB." },
          { cmd: "systemd.unit=rescue.target", desc: "Manda systemd subir em rescue ao invés de graphical.", output: "Equivalente moderno ao 'single'." },
          { cmd: "selinux=0 enforcing=0", desc: "Desliga SELinux (em distros que têm).", output: "Útil para entender bug de policy." },
          { cmd: "noapic noacpi", desc: "Desabilita APIC/ACPI — boot com hardware quebrado.", output: "Último recurso." },
          { cmd: "loglevel=7 debug", desc: "Verbose total no console.", output: "Diagnóstico de boot quebrado." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver os parâmetros que o kernel atual recebeu",
            cmd: "cat /proc/cmdline",
            out: "BOOT_IMAGE=/boot/vmlinuz-6.11.0-kali1-amd64 root=UUID=8a4f-... ro quiet splash",
            outType: "info",
          },
        ]}
      />

      <h2>Editar uma entrada na hora (sem alterar o disco)</h2>
      <p>
        No menu GRUB, navegue até a entrada → tecle <strong>e</strong> → procure a linha que
        começa com <code>linux</code> (vmlinuz) → adicione/altere parâmetros → <strong>Ctrl+X</strong> ou <strong>F10</strong> para bootar.
        Mudança VOLÁTIL, vale só para essa boot.
      </p>

      <AlertBox type="warning" title="Acesso físico = jogo acabado (defesa)">
        <p>
          Se um atacante chega ao GRUB, ele edita a linha do kernel e adiciona{" "}
          <code>init=/bin/bash</code>. No próximo boot, cai direto num shell root sem senha,
          remonta o disco como rw (<code>mount -o remount,rw /</code>) e <code>passwd root</code>.
        </p>
        <p>
          Defesa: <strong>senha no GRUB</strong> (<code>grub-mkpasswd-pbkdf2</code> + edição em
          <code> /etc/grub.d/40_custom</code>) e <strong>disco criptografado</strong> (LUKS) —
          sem a senha do disco, o init=/bin/bash trick é inútil.
        </p>
      </AlertBox>

      <h2>Modo recovery</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "todas as entradas que o GRUB conhece",
            cmd: "grep -E 'menuentry |submenu ' /boot/grub/grub.cfg | cut -d\"'\" -f2",
            out: `Kali GNU/Linux
Advanced options for Kali GNU/Linux
Kali GNU/Linux, with Linux 6.11.0-kali1-amd64
Kali GNU/Linux, with Linux 6.11.0-kali1-amd64 (recovery mode)`,
            outType: "info",
          },
          {
            comment: "no recovery, escolha 'root' = shell root sem senha (se não houver passwd em single)",
            cmd: "# (saída interativa do menu Recovery)",
            out: `clean         Try to make free space
dpkg          Repair broken packages
fsck          Check all file systems
network       Enable networking
root          Drop to root shell prompt
system-summary  System summary
resume        Resume normal boot`,
            outType: "muted",
          },
        ]}
      />

      <h2>Reparar GRUB com chroot via Live Kali (cenário pentester)</h2>
      <p>
        Cenário: você compilou um kernel custom no alvo e ele não boota. Ou o cliente "matou"
        o GRUB de uma VM. Você boota a Live Kali, monta o sistema e refaz o GRUB.
      </p>

      <Terminal
        path="/"
        lines={[
          {
            comment: "1) ver discos e particoes",
            cmd: "sudo lsblk -f",
            out: `NAME   FSTYPE   LABEL UUID                                 MOUNTPOINTS
sda
├─sda1 vfat     EFI   2C18-9F84
├─sda2 ext4           8a4f0c12-ad65-44e1-83c8-a7c3be0b9132
└─sda3 swap           bc9b5a6d-8c7a-44a5-9f0b-1234567890ab`,
            outType: "info",
          },
          {
            comment: "2) montar o sistema do alvo",
            cmd: "sudo mount /dev/sda2 /mnt && sudo mount /dev/sda1 /mnt/boot/efi",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "3) bind mounts para chroot funcionar",
            cmd: "for d in dev dev/pts proc sys run; do sudo mount --bind /$d /mnt/$d; done",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo chroot /mnt /bin/bash",
            out: "root@kali:/#",
            outType: "warning",
          },
          {
            comment: "dentro do chroot — reinstalar grub no disco e regerar config",
            cmd: "grub-install /dev/sda && update-grub",
            out: `Installing for x86_64-efi platform.
Installation finished. No error reported.
Generating grub configuration file ...
done`,
            outType: "success",
          },
          {
            cmd: "exit && sudo umount -R /mnt && sudo reboot",
            out: "(reboot)",
            outType: "muted",
          },
        ]}
      />

      <h2>Resetar senha root (você esqueceu — ou um cliente esqueceu)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "no menu GRUB, edite a entrada (tecla 'e') e adicione no fim da linha 'linux':",
            cmd: "init=/bin/bash",
            noPrompt: true,
            out: "(boot vai cair num shell root, com / montado read-only)",
            outType: "warning",
          },
          {
            cmd: "mount -o remount,rw /",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "passwd root",
            out: `New password:
Retype new password:
passwd: password updated successfully`,
            outType: "success",
          },
          {
            cmd: "exec /sbin/init",
            out: "(continua o boot normal — agora com nova senha root)",
            outType: "info",
          },
        ]}
      />

      <h2>Ferramentas extras de boot</h2>
      <CommandTable
        title="Diagnóstico de boot"
        variations={[
          { cmd: "systemd-analyze", desc: "Tempo total de boot.", output: "Startup finished in 1.832s (kernel) + 4.213s (userspace) = 6.045s" },
          { cmd: "systemd-analyze blame", desc: "Quem demorou mais.", output: "2.103s NetworkManager-wait-online.service\\n  812ms apt-daily.service" },
          { cmd: "systemd-analyze critical-chain", desc: "Caminho crítico do boot.", output: "graphical.target @4.213s\\n  └─multi-user.target @4.212s" },
          { cmd: "journalctl -b", desc: "Logs do boot atual.", output: "Tudo desde o kernel até o login." },
          { cmd: "journalctl -b -1", desc: "Logs do boot ANTERIOR (precisa journal persistente).", output: "Para investigar crash." },
          { cmd: "dmesg -T", desc: "Mensagens do kernel com timestamp humano.", output: "[Sat Apr  3 09:10:44 2026] usb 1-2: new high-speed USB device" },
        ]}
      />

      <PracticeBox
        title="Habilite logs persistentes E meça o boot"
        goal="Permitir que journalctl -b -1 funcione após reboot e medir o tempo de inicialização."
        steps={[
          "Crie /var/log/journal (jornal persistente).",
          "Reinicie o serviço do journald.",
          "Reboote uma vez para popular.",
          "Liste os boots conhecidos e meça o atual.",
        ]}
        command={`sudo mkdir -p /var/log/journal
sudo systemctl restart systemd-journald
sudo reboot
# após o reboot:
journalctl --list-boots
systemd-analyze
systemd-analyze blame | head -10`}
        expected={`-1 4f3c... Sat 2026-04-03 09:10:42 UTC—Sat 2026-04-03 09:42:11 UTC
 0 8a1b... Sat 2026-04-03 09:42:33 UTC—Sat 2026-04-03 09:51:08 UTC

Startup finished in 1.832s (kernel) + 4.213s (userspace) = 6.045s
graphical.target reached after 4.213s in userspace.

2.103s NetworkManager-wait-online.service
 812ms apt-daily-upgrade.service
 654ms snapd.service`}
        verify="journalctl -b -1 deve devolver os logs do boot anterior. systemd-analyze blame mostra os 'gargalos'."
      />

      <AlertBox type="info" title="GRUB não-EFI vs EFI">
        <p>
          Em <strong>UEFI</strong>: o binário do GRUB fica em <code>/boot/efi/EFI/kali/grubx64.efi</code> e
          a config em <code>/boot/grub/grub.cfg</code>. Reinstalar:{" "}
          <code>grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=kali</code>.
        </p>
        <p>
          Em <strong>BIOS legado</strong>: GRUB fica no MBR do disco. Reinstalar:{" "}
          <code>grub-install /dev/sda</code> (note: o disco, não a partição).
        </p>
      </AlertBox>
    </PageContainer>
  );
}
