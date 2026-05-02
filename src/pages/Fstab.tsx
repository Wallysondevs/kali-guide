import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Fstab() {
  return (
    <PageContainer
      title="/etc/fstab — montagem persistente"
      subtitle="A tabela que diz ao kernel o que montar no boot, onde, com qual filesystem e quais opções. Errar aqui pode quebrar o boot inteiro."
      difficulty="intermediario"
      timeToRead="15 min"
    >
      <h2>O arquivo</h2>
      <p>
        <code>/etc/fstab</code> (file systems table) lista todos os filesystems que devem ser
        montados automaticamente no boot. O <strong>systemd-fstab-generator</strong> lê esse
        arquivo e gera units <code>.mount</code> dinamicamente. Sintaxe simples, mas um typo aqui
        e o sistema não sobe — você cai em <em>emergency mode</em> com <code>/</code> read-only.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat /etc/fstab",
            out: `# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a device.
#
# <file system>                          <mount point>  <type>  <options>           <dump>  <pass>
UUID=8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56 /             ext4    errors=remount-ro    0       1
UUID=A4E2-1B7F                            /boot/efi     vfat    umask=0077           0       1
UUID=5e8a7b1c-9d3e-4a8b-b1c5-7e2f9a3d4e1b none          swap    sw                   0       0
tmpfs                                    /tmp           tmpfs   defaults,nosuid,size=2G  0   0`,
            outType: "info",
          },
        ]}
      />

      <h2>Os 6 campos</h2>
      <CommandTable
        title="anatomia de uma linha de fstab"
        variations={[
          { cmd: "1. <file system>", desc: "Identificador do dispositivo: UUID=, LABEL=, /dev/sdXN, PARTUUID=, ou pseudo-FS (tmpfs, none).", output: "Preferido: UUID. Imune a reordenação de discos." },
          { cmd: "2. <mount point>", desc: "Diretório onde será montado. Precisa existir (mkdir -p antes).", output: "Ex: / , /boot/efi , /mnt/loot" },
          { cmd: "3. <type>", desc: "Tipo de filesystem: ext4, xfs, btrfs, vfat, ntfs, tmpfs, swap, cifs, nfs, auto.", output: "auto = blkid detecta sozinho." },
          { cmd: "4. <options>", desc: "Opções separadas por vírgula. defaults = rw,suid,dev,exec,auto,nouser,async.", output: "Ex: defaults,noatime,nofail" },
          { cmd: "5. <dump>", desc: "Backup com utilitário dump(8). Quase ninguém usa. 0 = não.", output: "Sempre 0 hoje em dia." },
          { cmd: "6. <pass>", desc: "Ordem do fsck no boot. 0=skip, 1=root, 2=outros.", output: "Sempre 1 para / e 2 para os demais reais." },
        ]}
      />

      <h2>Por que usar UUID e não /dev/sdXN</h2>
      <p>
        Se você plugar um pen drive antes do boot, <code>/dev/sda</code> pode virar{" "}
        <code>/dev/sdb</code> e tudo no fstab quebra. UUID é uma string única do filesystem que
        viaja com ele independente da ordem de detecção do kernel. <strong>Sempre prefira UUID</strong>{" "}
        (ou LABEL, que é a versão "humana" mas pode duplicar entre discos).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "descobrir UUID e tipo de cada partição",
            cmd: "sudo blkid",
            out: `/dev/sda1: UUID="8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="b7a31e2f-01"
/dev/sda2: UUID="5e8a7b1c-9d3e-4a8b-b1c5-7e2f9a3d4e1b" TYPE="swap" PARTUUID="b7a31e2f-02"
/dev/sdb1: LABEL="LOOT" UUID="9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9" TYPE="ext4"
/dev/sdc1: UUID="A4E2-1B7F" TYPE="vfat" LABEL="USB-PHISH"`,
            outType: "info",
          },
          {
            comment: "alternativas: lsblk -f mostra tudo de uma vez visualmente",
            cmd: "lsblk -f",
            out: `NAME   FSTYPE   FSVER LABEL      UUID                                 MOUNTPOINTS
sda
├─sda1 ext4     1.0              8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56 /
└─sda2 swap     1                5e8a7b1c-9d3e-4a8b-b1c5-7e2f9a3d4e1b [SWAP]
sdb
└─sdb1 ext4     1.0   LOOT       9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9
sdc
└─sdc1 vfat     FAT32 USB-PHISH  A4E2-1B7F`,
            outType: "muted",
          },
        ]}
      />

      <h2>Opções de mount mais úteis</h2>
      <CommandTable
        title="cheatsheet de opções"
        variations={[
          { cmd: "defaults", desc: "Atalho: rw,suid,dev,exec,auto,nouser,async.", output: "Bom default para discos do sistema." },
          { cmd: "ro / rw", desc: "Read-only / read-write.", output: "ro útil para anti-tampering em disco de evidência forense." },
          { cmd: "noatime", desc: "Não atualiza timestamp de leitura. SSD agradece.", output: "Performance + economia de write em SSD." },
          { cmd: "nodiratime", desc: "Mesma coisa, só para diretórios.", output: "Já incluso em noatime na maioria dos kernels modernos." },
          { cmd: "noexec", desc: "Bloqueia execução de binários nesse mount.", output: "Hardening: /tmp, /var/tmp, /home às vezes." },
          { cmd: "nosuid", desc: "Ignora bit setuid em arquivos do mount.", output: "Anti-PrivEsc via binários SUID em mount externo." },
          { cmd: "nodev", desc: "Ignora device files no mount.", output: "Hardening tier 1." },
          { cmd: "nofail", desc: "Se falhar a montagem, não trava o boot.", output: "ESSENCIAL para discos USB/removíveis." },
          { cmd: "x-systemd.automount", desc: "Lazy mount: só monta quando alguém acessa o path.", output: "Bom para NFS lentos ou USB esporádico." },
          { cmd: "user", desc: "Permite usuário comum montar/desmontar (sem sudo).", output: "Útil em /mnt/usb." },
          { cmd: "discard", desc: "TRIM contínuo (SSD).", output: "Alternativa: cron semanal com fstrim -av." },
          { cmd: "errors=remount-ro", desc: "Se filesystem falhar, remonta como read-only em vez de panic.", output: "Padrão para / em ext4." },
          { cmd: "uid=1000,gid=1000", desc: "Define dono fixo (vfat/ntfs/exfat não têm permissões nativas).", output: "Sem isso, USB FAT vira do root." },
        ]}
      />

      <h2>Exemplo realista — pentester</h2>
      <CodeBlock
        language="ini"
        title="/etc/fstab (Kali com HD de loot LUKS, USB de wordlists, tmpfs)"
        code={`# <file system>                                <mount>             <type>   <options>                                                  <dump> <pass>

# raiz e EFI
UUID=8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56     /                   ext4     errors=remount-ro,noatime                                  0      1
UUID=A4E2-1B7F                                /boot/efi           vfat     umask=0077                                                 0      1
UUID=5e8a7b1c-9d3e-4a8b-b1c5-7e2f9a3d4e1b     none                swap     sw                                                         0      0

# /tmp em RAM (rápido + some no shutdown — bom para anti-forense)
tmpfs                                         /tmp                tmpfs    defaults,nosuid,nodev,size=4G,mode=1777                    0      0

# HD externo de loot (LUKS, mapeado via crypttab → /dev/mapper/loot)
/dev/mapper/loot                              /mnt/loot           ext4     defaults,nofail,x-systemd.automount,noatime                0      2

# USB de wordlists (LABEL fixo, montagem lazy, read-only para não corromper)
LABEL=WORDLISTS                               /mnt/wordlists      ext4     ro,nofail,user,x-systemd.automount                         0      0

# share SMB do servidor de C2 interno (credenciais em arquivo separado)
//10.10.10.5/c2_share                         /mnt/c2             cifs     credentials=/root/.smbcreds,uid=1000,gid=1000,nofail,_netdev 0    0`}
      />

      <h2>Aplicar mudanças sem reboot</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) testar sintaxe ANTES de qualquer coisa (não há comando 'fstab -t' nativo, mas mount -fav simula)",
            cmd: "sudo mount -fav",
            out: `/                        : ignored
/boot/efi                : already mounted
none                     : ignored
/tmp                     : already mounted
/mnt/loot                : successfully mounted
/mnt/wordlists           : successfully mounted`,
            outType: "success",
          },
          {
            comment: "2) montar tudo que está marcado como auto e ainda não está montado",
            cmd: "sudo mount -a",
            out: "(silencioso = sucesso. Erros aqui ANTES de reboot evitam catástrofe.)",
            outType: "muted",
          },
          {
            comment: "3) systemd precisa saber que houve mudança nas units geradas",
            cmd: "sudo systemctl daemon-reload",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "findmnt --verify",
            out: `/             [W] target is not a mountpoint  (já montado, é normal)
/mnt/loot     OK`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="danger" title="Boot quebrado por fstab errado">
        <p>
          Se você reiniciar com fstab errado e o boot travar, vai cair em{" "}
          <strong>emergency mode</strong> com <code>/</code> read-only e prompt pedindo senha do
          root. Para reparar:
        </p>
        <CodeBlock
          language="bash"
          title="recovery em emergency mode"
          code={`# remontar / como rw
mount -o remount,rw /

# editar fstab
nano /etc/fstab     # comentar a linha ofensora com #

# testar antes de reboot
mount -fav

# se OK, reboot
systemctl reboot`}
        />
        <p>
          Se nem isso funcionar, boot via Kali Live USB → <code>chroot</code> no disco →
          editar fstab → reboot.
        </p>
      </AlertBox>

      <h2>Pseudo-filesystems comuns</h2>
      <CommandTable
        title="filesystems que não são 'discos'"
        variations={[
          { cmd: "tmpfs", desc: "RAM-backed FS. Rápido. Sumindo no shutdown — bom para anti-forense de cache.", output: "tmpfs /tmp tmpfs defaults,size=2G 0 0" },
          { cmd: "proc", desc: "Interface do kernel exposta como FS (/proc).", output: "Já montado pelo initrd. Raramente em fstab." },
          { cmd: "sysfs", desc: "Devices do kernel (/sys).", output: "Idem proc." },
          { cmd: "devpts", desc: "PTYs de terminais (/dev/pts).", output: "Já montado." },
          { cmd: "swap", desc: "Espaço de swap em partição/arquivo.", output: "UUID=... none swap sw 0 0" },
          { cmd: "overlay", desc: "Filesystem em camadas (Docker, Kali Live).", output: "Usado internamente, raro em fstab manual." },
        ]}
      />

      <h2>Swap em arquivo (sem partição dedicada)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile",
            out: `Setting up swapspace version 1, size = 4 GiB
no label, UUID=cc31aaee-7b62-4c2a-9a31-7d1f6e2a85d0`,
            outType: "success",
          },
          {
            cmd: "sudo swapon /swapfile && swapon --show",
            out: `NAME      TYPE  SIZE USED PRIO
/swapfile file    4G   0B   -2`,
            outType: "info",
          },
          {
            comment: "para persistir no boot, adicionar ao fstab",
            cmd: "echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab",
            out: "/swapfile none swap sw 0 0",
            outType: "muted",
          },
        ]}
      />

      <h2>Bind mounts (montar diretório dentro de outro)</h2>
      <CodeBlock
        language="ini"
        title="/etc/fstab (bind mount exemplo)"
        code={`# expor /home/wallyson/loot dentro de chroot de teste em /srv/chroot/loot
/home/wallyson/loot   /srv/chroot/loot   none   bind,nofail   0  0`}
      />

      <PracticeBox
        title="Quebrar e reparar — sim, de propósito"
        goal="Em uma VM Kali descartável, treinar o ciclo: editar fstab errado → reboot → cair em emergency → reparar. Sem essa prática você vai gelar quando acontecer de verdade."
        steps={[
          "Fazer backup do fstab atual (cp /etc/fstab /etc/fstab.bak).",
          "Adicionar uma linha intencionalmente ruim: UUID inexistente sem nofail.",
          "Reboot.",
          "Vai cair em emergency mode → entrar com senha de root.",
          "Remontar / como rw, restaurar backup.",
          "Reboot e validar que voltou.",
        ]}
        command={`# antes do reboot
sudo cp /etc/fstab /etc/fstab.bak
echo 'UUID=00000000-0000-0000-0000-000000000000 /mnt/fake ext4 defaults 0 2' | sudo tee -a /etc/fstab
sudo reboot

# em emergency mode (após reboot que vai falhar)
mount -o remount,rw /
cp /etc/fstab.bak /etc/fstab
mount -fav     # confirmar que está OK agora
systemctl reboot`}
        expected={`[FAILED] Failed to mount /mnt/fake.
[DEPEND] Dependency failed for Local File Systems.
You are in emergency mode...
Give root password for maintenance (or press Ctrl-D to continue):
# após reparo:
/mnt/fake : ignored (or removed line)
System rebooting normally.`}
        verify="Se você fez sozinho, sabe reparar em produção. Faça PELO MENOS uma vez antes de mexer em fstab de máquina importante."
      />

      <AlertBox type="info" title="nofail é seu amigo">
        <p>
          Para qualquer disco que <strong>não é o root</strong> (USB, HD externo, share de
          rede), <strong>sempre</strong> use <code>nofail</code>. Custa nada, e impede que o
          boot quebre se o disco não estiver presente. Combine com{" "}
          <code>x-systemd.automount</code> para montagem lazy (só quando acessar o path).
        </p>
      </AlertBox>
    </PageContainer>
  );
}
