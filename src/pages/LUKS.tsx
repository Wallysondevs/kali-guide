import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function LUKS() {
  return (
    <PageContainer
      title="LUKS — criptografia de disco"
      subtitle="Padrão Linux para FDE (Full Disk Encryption). Essencial para HD de loot, USB persistente e laptop de pentester apreendido."
      difficulty="intermediario"
      timeToRead="17 min"
    >
      <h2>Por que LUKS importa em pentest</h2>
      <p>
        Você é pentester. No seu HD externo tem creds capturadas, dump de NTDS, screenshots de
        sistemas comprometidos, relatório do cliente. Se esse HD cair em mãos erradas (perda,
        roubo, apreensão na alfândega), <strong>tudo</strong> vai aparecer no jornal — e você
        vira processo. <strong>LUKS</strong> (Linux Unified Key Setup) é o padrão de FDE no
        Linux: AES-XTS por padrão, suporta múltiplos slots de chave, header recuperável,
        integrado com cryptsetup e systemd-cryptsetup.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "cryptsetup --version",
            out: "cryptsetup 2.7.5 flags: UDEV BLKID KEYRING FIPS KERNEL_CAPI HW_OPAL",
            outType: "info",
          },
          {
            cmd: "cat /proc/crypto | grep -E 'name|driver' | head -10",
            out: `name         : aes
driver       : aes-aesni
name         : xts(aes)
driver       : xts-aes-aesni`,
            outType: "muted",
          },
        ]}
      />

      <h2>Criptografar um HD externo de loot</h2>
      <AlertBox type="danger" title="Vai apagar TUDO">
        <p>
          <code>luksFormat</code> destrói qualquer dado anterior no dispositivo. Confirme com{" "}
          <code>lsblk</code> que você está atacando o disco certo. Errar aqui é catastrófico.
        </p>
      </AlertBox>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) identificar o disco — sdc é o USB de 64G",
            cmd: "lsblk -o NAME,SIZE,MODEL,MOUNTPOINTS",
            out: `NAME   SIZE MODEL                MOUNTPOINTS
sda    100G QEMU HARDDISK
├─sda1  99G                      /
└─sda2   1G                      [SWAP]
sdc     64G SanDisk Ultra USB`,
            outType: "info",
          },
          {
            comment: "2) (opcional, paranoia) zerar com dados aleatórios antes",
            cmd: "sudo dd if=/dev/urandom of=/dev/sdc bs=4M status=progress",
            out: "(MUITO lento, mas garante que setores 'apagados' não vazam padrão)",
            outType: "muted",
          },
          {
            comment: "3) formatar como LUKS2 com argon2id (KDF moderno)",
            cmd: "sudo cryptsetup luksFormat --type luks2 --pbkdf argon2id /dev/sdc",
            out: `WARNING!
========
This will overwrite data on /dev/sdc irrevocably.

Are you sure? (Type 'yes' in capital letters): YES
Enter passphrase for /dev/sdc:
Verify passphrase:
Key slot 0 created.
Command successful.`,
            outType: "warning",
          },
          {
            comment: "4) abrir (mapeia em /dev/mapper/loot)",
            cmd: "sudo cryptsetup luksOpen /dev/sdc loot",
            out: `Enter passphrase for /dev/sdc:`,
            outType: "default",
          },
          {
            cmd: "ls /dev/mapper/",
            out: "control  loot",
            outType: "info",
          },
          {
            comment: "5) criar filesystem dentro do container desbloqueado",
            cmd: "sudo mkfs.ext4 -L LOOT /dev/mapper/loot",
            out: `Creating filesystem with 16777216 4k blocks
Filesystem UUID: 9f8a-...
done`,
            outType: "success",
          },
          {
            cmd: "sudo mkdir -p /mnt/loot && sudo mount /dev/mapper/loot /mnt/loot",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "df -h /mnt/loot",
            out: `Filesystem         Size  Used Avail Use% Mounted on
/dev/mapper/loot    63G   28K   60G   1% /mnt/loot`,
            outType: "success",
          },
        ]}
      />

      <h2>Fechar e desconectar com segurança</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ordem certa: desmonta → fecha LUKS → unplug físico",
            cmd: "sudo umount /mnt/loot && sudo cryptsetup luksClose loot",
            out: "(silencioso. Se tudo certo, /dev/mapper/loot some.)",
            outType: "success",
          },
          {
            comment: "verificar se realmente fechou",
            cmd: "ls /dev/mapper/ && lsblk /dev/sdc",
            out: `control
NAME SIZE FSTYPE      MOUNTPOINTS
sdc   64G crypto_LUKS`,
            outType: "info",
          },
        ]}
      />

      <h2>Gestão de slots de chave (até 8 senhas)</h2>
      <p>
        LUKS2 tem 32 slots, mas tipicamente usa-se 8. Cada slot é uma senha (ou keyfile)
        independente que destrava o mesmo volume. Útil para ter senha do dia-a-dia + senha de
        recovery guardada num cofre.
      </p>

      <CommandTable
        title="cryptsetup: keys e slots"
        variations={[
          { cmd: "sudo cryptsetup luksDump /dev/sdc", desc: "Mostra todos os slots, KDF, cipher, UUID.", output: "Version: 2\nLUKS header information\nKeyslots:\n  0: luks2 (in use)\n  1: luks2 (in use)" },
          { cmd: "sudo cryptsetup luksAddKey /dev/sdc", desc: "Adiciona NOVA senha em slot livre (pede a antiga + nova).", output: "Enter any existing passphrase: ***\nEnter new passphrase: ***\nKey slot 1 created." },
          { cmd: "sudo cryptsetup luksRemoveKey /dev/sdc", desc: "Remove uma senha (pede a senha que será removida).", output: "Enter passphrase to be deleted: ***" },
          { cmd: "sudo cryptsetup luksKillSlot /dev/sdc 1", desc: "Mata slot específico SEM precisar saber a senha dele (precisa de outra válida).", output: "Enter any remaining passphrase: ***\nKeyslot 1 destroyed." },
          { cmd: "sudo cryptsetup luksChangeKey /dev/sdc -S 0", desc: "Troca a senha do slot 0.", output: "Enter passphrase for keyslot to be changed:" },
          { cmd: "sudo cryptsetup luksAddKey /dev/sdc /root/keyfile.bin", desc: "Adiciona keyfile binário em vez de senha.", output: "Use para automação (ex: USB de boot que destrava sozinho)." },
        ]}
      />

      <h2>Backup do header — vital</h2>
      <p>
        O header LUKS contém os slots criptografados. Se ele corromper (bad block, dd errado,
        firmware), <strong>todo o dado vira lixo aleatório irrecuperável</strong>, mesmo com a
        senha. Faça backup do header SEMPRE depois de criar e guarde em local diferente
        (criptografado, em pen drive separado).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo cryptsetup luksHeaderBackup /dev/sdc --header-backup-file /root/sdc.luksheader",
            out: "(silencioso = sucesso)",
            outType: "success",
          },
          {
            cmd: "sudo file /root/sdc.luksheader && sudo ls -lh /root/sdc.luksheader",
            out: `/root/sdc.luksheader: LUKS encrypted file, ver 2 [, , sha256] UUID: 9f8a...
-rw------- 1 root root 16M Apr  3 11:22 /root/sdc.luksheader`,
            outType: "info",
          },
          {
            comment: "restaurar (em caso de header corrompido)",
            cmd: "sudo cryptsetup luksHeaderRestore /dev/sdc --header-backup-file /root/sdc.luksheader",
            out: `WARNING!
========
Device /dev/sdc already contains LUKS header. Replacing header will destroy existing keyslots.

Are you sure? (Type 'yes' in capital letters): YES`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="warning" title="Backup de header = chave mestra">
        <p>
          Quem tem header backup + senha = acesso total. Sempre criptografe o backup do header
          (gpg, ou guarde dentro de outro container LUKS) e mantenha em local físico separado do
          disco original.
        </p>
      </AlertBox>

      <h2>Persistência criptografada em USB Kali Live</h2>
      <p>
        Cenário clássico: você quer um Kali Live USB que aceita persistência (instalações,
        config, ferramentas extras) mas onde a partição de persistência é criptografada — se
        perder o pen drive, ninguém vê seu loot.
      </p>

      <CodeBlock
        language="bash"
        title="setup persistência LUKS no Kali Live USB"
        code={`# /dev/sdb1 = boot do Kali (já gravado com dd ou Etcher)
# /dev/sdb3 = nova partição que vai virar persistência criptografada

# 1) criar partição extra com fdisk/parted no espaço livre
sudo parted /dev/sdb -- mkpart primary ext4 5GiB 100%

# 2) formatar como LUKS
sudo cryptsetup luksFormat --type luks1 /dev/sdb3   # luks1 = max compat com initrd
sudo cryptsetup luksOpen /dev/sdb3 kali_persist
sudo mkfs.ext4 -L persistence /dev/mapper/kali_persist

# 3) configurar persistência
sudo mkdir -p /mnt/kp && sudo mount /dev/mapper/kali_persist /mnt/kp
echo "/ union" | sudo tee /mnt/kp/persistence.conf
sudo umount /mnt/kp && sudo cryptsetup luksClose kali_persist

# 4) Boot do Kali Live com a opção "Encrypted Persistence" — pede a senha no boot.`}
      />

      <h2>Detalhes de header e cipher</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo cryptsetup luksDump /dev/sdc",
            out: `LUKS header information
Version:        2
Epoch:          3
Metadata area:  16384 [bytes]
UUID:           9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9
Label:          (no label)
Subsystem:      (no subsystem)
Flags:          (no flags)

Data segments:
  0: crypt
        offset: 16777216 [bytes]
        length: (whole device)
        cipher: aes-xts-plain64
        sector: 4096 [bytes]

Keyslots:
  0: luks2
        Key:        512 bits
        Priority:   normal
        Cipher:     aes-xts-plain64
        Cipher key: 512 bits
        PBKDF:      argon2id
        Time cost:  9
        Memory:     1048576
        Threads:    4
        Salt:       7e f1 ...
        AF stripes: 4000`,
            outType: "info",
          },
          {
            comment: "benchmark de cipher para escolher o mais rápido para sua CPU",
            cmd: "cryptsetup benchmark",
            out: `# Tests are approximate using memory only (no storage IO).
PBKDF2-sha256       1845832 iterations per second for 256-bit key
argon2id          7 iterations, 1048576 memory, 4 parallel threads (CPUs) for 256-bit key

#     Algorithm |       Key |      Encryption |      Decryption
        aes-cbc        256b      1184.5 MiB/s      4280.2 MiB/s
        aes-xts        512b      3892.7 MiB/s      3914.1 MiB/s
   serpent-xts        512b       110.4 MiB/s       115.8 MiB/s`,
            outType: "muted",
          },
        ]}
      />

      <h2>Auto-mount no boot via crypttab + fstab</h2>
      <CodeBlock
        language="ini"
        title="/etc/crypttab"
        code={`# <name>     <device>                                 <key file>  <options>
loot         UUID=9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9   none        luks,discard,nofail`}
      />

      <CodeBlock
        language="ini"
        title="/etc/fstab (parte LUKS)"
        code={`/dev/mapper/loot   /mnt/loot   ext4   defaults,nofail   0  2`}
      />

      <p>
        Com isso, no boot o systemd pede a senha do <code>loot</code> e monta em <code>/mnt/loot</code>.
        Se quiser destravar sem prompt, gere um keyfile (<code>dd if=/dev/urandom of=/root/loot.key bs=4096 count=1</code>),
        adicione com <code>luksAddKey</code>, e troque o campo <code>none</code> no crypttab pelo path do keyfile
        (e proteja com <code>chmod 600</code>).
      </p>

      <PracticeBox
        title="Container LUKS dentro de um arquivo (sem partição inteira)"
        goal="Criar container criptografado de 1G como arquivo (loot.img). Útil para esconder dump dentro de pasta normal."
        steps={[
          "Criar arquivo zerado de 1G.",
          "Tratar como loop device.",
          "Formatar como LUKS, abrir, formatar ext4.",
          "Montar, copiar dados sensíveis, desmontar e fechar.",
        ]}
        command={`# 1) arquivo container
dd if=/dev/zero of=loot.img bs=1M count=1024 status=progress

# 2) loop device
sudo losetup -f --show loot.img
# saída: /dev/loop0

# 3) LUKS no loop
sudo cryptsetup luksFormat --type luks2 /dev/loop0
sudo cryptsetup luksOpen /dev/loop0 secret_loot
sudo mkfs.ext4 /dev/mapper/secret_loot

# 4) montar e usar
sudo mkdir -p /mnt/secret && sudo mount /dev/mapper/secret_loot /mnt/secret
echo "ntds.dit dump aqui" | sudo tee /mnt/secret/notes.txt

# 5) fechar (ordem inversa)
sudo umount /mnt/secret
sudo cryptsetup luksClose secret_loot
sudo losetup -d /dev/loop0

# loot.img agora é um arquivo opaco de 1G — só destrava com a senha
file loot.img`}
        expected={`Key slot 0 created.
Command successful.
Creating filesystem with 262144 4k blocks
loot.img: LUKS encrypted file, ver 2 [aes, xts-plain64, sha256] UUID: ...`}
        verify="O arquivo loot.img pode viver dentro de ~/Documents/, vai parecer um blob aleatório qualquer e só destrava com cryptsetup + senha."
      />

      <AlertBox type="info" title="LUKS vs VeraCrypt vs ZFS native encryption">
        <p>
          <strong>LUKS</strong>: padrão Linux, integração total com systemd/cryptsetup, header
          recuperável. <strong>VeraCrypt</strong>: cross-platform (abre no Windows também), mais
          lento, plausible deniability com hidden volume. <strong>ZFS native</strong>: por
          dataset, integra com snapshots/send-receive, mas só ZFS. Para Linux puro, LUKS ganha;
          para HD que precisa abrir no Windows também, VeraCrypt.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
