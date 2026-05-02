import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Particoes() {
  return (
    <PageContainer
      title="Particionamento — fdisk, parted, gparted, cfdisk"
      subtitle="MBR vs GPT, criar partições em USB para Kali Live persistente, redimensionar a quente e recuperar partições perdidas com testdisk."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Por que particionar importa para o pentester</h2>
      <p>
        Particionamento é a base de qualquer storage que você vai usar — do pendrive de Kali Live
        com persistência (lab portátil), passando pelo HD criptografado com LUKS para guardar
        loot, até a recuperação de uma partição que você ou um cliente apagou por engano. Saber
        usar <strong>fdisk</strong>, <strong>parted</strong>, <strong>cfdisk</strong>,{" "}
        <strong>gparted</strong> e <strong>testdisk</strong> é diferença entre perder uma
        engagement e salvar o dia.
      </p>

      <h2>MBR vs GPT — qual usar e quando</h2>
      <CommandTable
        title="Tabelas de partição: MBR (legacy) vs GPT (UEFI moderno)"
        variations={[
          { cmd: "MBR (msdos)", desc: "Suporta até 4 partições primárias OU 3 primárias + 1 estendida com várias lógicas. Limite de 2 TB.", output: "Use só em hardware antigo BIOS sem UEFI." },
          { cmd: "GPT", desc: "Até 128 partições, suporta discos acima de 2 TB, replica tabela no fim do disco (resiliente).", output: "Padrão para qualquer disco/USB moderno." },
          { cmd: "Boot mode = BIOS", desc: "Combina com MBR. Bootloader em /dev/sdX (446 bytes do MBR).", output: "Kali Live antigo, máquinas pré-2012." },
          { cmd: "Boot mode = UEFI", desc: "Exige GPT + partição EFI (FAT32, ~512 MiB, flag esp).", output: "Padrão atual." },
          { cmd: "Hybrid MBR", desc: "GPT com cópia MBR para compatibilidade dual-boot.", output: "Evite — quebra fácil." },
        ]}
      />

      <h2>Visão geral do disco</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "lista discos e partições com tamanhos amigáveis",
            cmd: "lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS,LABEL",
            out: `NAME   SIZE TYPE FSTYPE      MOUNTPOINTS  LABEL
sda    100G disk
├─sda1   1G part vfat        /boot/efi
├─sda2  90G part ext4        /
└─sda3   9G part swap        [SWAP]
sdb     32G disk
├─sdb1   8G part iso9660                  Kali Live
├─sdb2   1G part vfat                     EFI
└─sdb3  23G part ext4                     persistence`,
            outType: "info",
          },
          {
            comment: "ver UUID/PARTUUID/LABEL — útil para fstab",
            cmd: "sudo blkid /dev/sdb3",
            out: `/dev/sdb3: LABEL="persistence" UUID="3a7b-..." TYPE="ext4" PARTUUID="abcd-..."`,
            outType: "default",
          },
          {
            comment: "tabela bruta (mostra MBR vs GPT)",
            cmd: "sudo fdisk -l /dev/sdb",
            out: `Disk /dev/sdb: 28.86 GiB, 30988320768 bytes
Disklabel type: gpt
Disk identifier: 4F2A...
Device     Start      End  Sectors Size Type
/dev/sdb1   2048 16779263 16777216   8G Microsoft basic data
/dev/sdb2 16779264 18876415  2097152   1G EFI System
/dev/sdb3 18876416 60506111 41629696  19.9G Linux filesystem`,
            outType: "success",
          },
        ]}
      />

      <h2>fdisk — interativo, MBR e GPT</h2>
      <CommandTable
        title="atalhos do menu fdisk (teclas)"
        variations={[
          { cmd: "m", desc: "Help completo do menu.", output: "Lista todos os comandos disponíveis." },
          { cmd: "p", desc: "Print: mostra a tabela atual em memória.", output: "Antes de gravar, sempre revise com p." },
          { cmd: "n", desc: "Nova partição (pergunta nº, primeira/última setor).", output: "Aceite defaults ou use +5G para tamanho." },
          { cmd: "d", desc: "Deletar partição.", output: "Pede o número da partição." },
          { cmd: "t", desc: "Mudar o tipo (Linux=83, swap=82, EFI=ef, LVM=8e).", output: "L lista todos os tipos." },
          { cmd: "g", desc: "Cria nova tabela GPT vazia (DESTROI tudo).", output: "Use para converter MBR→GPT do zero." },
          { cmd: "o", desc: "Cria nova tabela MBR vazia (DESTROI tudo).", output: "Use para converter GPT→MBR." },
          { cmd: "w", desc: "Write — grava as mudanças no disco.", output: "Antes disso nada é persistido." },
          { cmd: "q", desc: "Quit sem gravar.", output: "Saída de emergência se errar." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "criar tabela GPT + partição ext4 de 8G no USB",
            cmd: "sudo fdisk /dev/sdb",
            out: `Welcome to fdisk (util-linux 2.39.3).
Command (m for help): g
Created a new GPT disklabel.
Command (m for help): n
Partition number (1-128, default 1):
First sector (2048-60506111, default 2048):
Last sector, +/-sectors or +size{K,M,G,T,P} (default 60506111): +8G
Created a new partition 1 of type 'Linux filesystem' and of size 8 GiB.
Command (m for help): w
The partition table has been altered.`,
            outType: "success",
          },
          {
            comment: "kernel reler a tabela sem reboot",
            cmd: "sudo partprobe /dev/sdb && lsblk /dev/sdb",
            out: `NAME   SIZE TYPE FSTYPE
sdb     32G disk
└─sdb1   8G part`,
            outType: "info",
          },
        ]}
      />

      <h2>parted — script-friendly, GPT-first</h2>
      <CodeBlock
        language="bash"
        title="parted em modo batch (sem interativo)"
        code={`# zera tabela e cria GPT
sudo parted -s /dev/sdb mklabel gpt

# cria partição EFI (FAT32, 512 MiB)
sudo parted -s /dev/sdb mkpart EFI fat32 1MiB 513MiB
sudo parted -s /dev/sdb set 1 esp on

# cria partição Linux com o resto do disco
sudo parted -s /dev/sdb mkpart kali ext4 513MiB 100%

# inspeciona
sudo parted /dev/sdb print
# Number  Start   End     Size    File system  Name  Flags
#  1      1049kB  538MB   537MB   fat32        EFI   boot, esp
#  2      538MB   30.99GB 30.45GB ext4         kali

# formata
sudo mkfs.vfat -F32 -n EFI /dev/sdb1
sudo mkfs.ext4 -L kali /dev/sdb2`}
      />

      <h2>cfdisk — TUI amigável</h2>
      <p>
        Quem não gosta do prompt cego do fdisk usa <code>cfdisk</code> — interface ncurses com
        setas, igual aos instaladores antigos. Mesmo poder, menos chance de errar. Sempre que
        possível mostre a tabela atual antes de mexer.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo cfdisk /dev/sdb",
            out: `                       Disk: /dev/sdb
            Size: 28.86 GiB, 30988320768 bytes
                  Label: gpt, identifier: 4F2A...

  Device          Start      End  Sectors  Size Type
> Free space       2048 60506111 60504064 28.9G
  [ New ] [ Quit ] [ Help ] [ Write ] [ Dump ]`,
            outType: "info",
          },
        ]}
      />

      <h2>Cenário pentest: Kali Live USB com persistência</h2>
      <p>
        O lab portátil clássico do pentester: pendrive bootável de Kali que mantém arquivos,
        configs, wordlists e loot entre reboots. Receita: gravar a ISO, criar uma 3ª partição
        ext4/ext3 com label <strong>persistence</strong>, e adicionar <code>persistence.conf</code>{" "}
        com <code>/ union</code>.
      </p>

      <CodeBlock
        language="bash"
        title="Kali Live persistente em /dev/sdb"
        code={`# 1) gravar ISO no pendrive (DESTROI tudo no sdb)
sudo dd if=kali-linux-2025.3-live-amd64.iso of=/dev/sdb bs=4M status=progress conv=fsync

# 2) parted cria partição extra usando o espaço livre que sobrou após a ISO
sudo parted /dev/sdb print free
# anote o "End" da última partição (ex.: 4500MB) e o tamanho total

sudo parted /dev/sdb mkpart persistence ext4 4500MB 100%

# 3) formata com label EXATAMENTE "persistence"
sudo mkfs.ext4 -L persistence /dev/sdb3

# 4) habilita persistência montando temporariamente
sudo mkdir -p /mnt/usb
sudo mount /dev/sdb3 /mnt/usb
echo "/ union" | sudo tee /mnt/usb/persistence.conf
sudo umount /mnt/usb

# 5) reboot pelo USB e selecione "Live USB Persistence" no menu`}
      />

      <AlertBox type="warning" title="dd na partição errada = adeus disco">
        <p>
          Sempre confirme com <code>lsblk</code> antes de rodar <code>dd</code>. Use{" "}
          <code>{`of=/dev/sdb`}</code> (sem número), nunca <code>of=/dev/sda</code> se sda for
          seu sistema. Adicione <code>status=progress</code> para ver progresso.
        </p>
      </AlertBox>

      <h2>Redimensionar partição (a quente quando possível)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "encolher partição NTFS de 200G para 120G (cliente cedeu HD)",
            cmd: "sudo ntfsresize --info /dev/sda3",
            out: `NTFS volume version: 3.1
Cluster size       : 4096 bytes
Current volume size: 214748364800 bytes (215 GB)
Current device size: 214748364800 bytes (215 GB)
Checking filesystem consistency ...
You might resize at 89234567168 bytes or 89235 MB (freeing 125513 MB).`,
            outType: "info",
          },
          {
            cmd: "sudo ntfsresize --size 120G /dev/sda3",
            out: `Resizing NTFS partition...
Successfully resized NTFS on device '/dev/sda3'.`,
            outType: "success",
          },
          {
            comment: "depois ajuste a TABELA com parted",
            cmd: "sudo parted /dev/sda resizepart 3 120GB",
            out: "Information: You may need to update /etc/fstab.",
            outType: "muted",
          },
          {
            comment: "para ext4 montado: resize2fs aceita online",
            cmd: "sudo resize2fs /dev/mapper/vg_lab-lv_loot",
            out: "Filesystem at /dev/mapper/vg_lab-lv_loot is mounted; on-line resizing required",
            outType: "info",
          },
        ]}
      />

      <h2>gparted — GUI quando o cliente assiste</h2>
      <p>
        Em engagements onsite que envolvem manipulação de disco (forense, recovery, montagem de
        evidência), <code>sudo gparted</code> é mais à prova de erro humano: vê tudo na tela,
        permite enfileirar várias operações e só aplica quando você clica em <strong>Apply</strong>.
        Para áudito mostra que você não digitou comando destrutivo às cegas.
      </p>

      <h2>Recovery — testdisk</h2>
      <p>
        Cenário real: cliente apagou a tabela de partição do HD externo onde estavam os logs do
        SIEM. <strong>testdisk</strong> escaneia o disco em busca de assinaturas de partição e
        reconstrói a tabela. Salva carreiras.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y testdisk",
            out: "Setting up testdisk (7.2-1) ...",
            outType: "muted",
          },
          {
            cmd: "sudo testdisk /dev/sdc",
            out: `TestDisk 7.2, Data Recovery Utility
Select a media:
>Disk /dev/sdc - 1000 GB / 931 GiB - WDC WD10EZEX

Please select the partition table type:
>[Intel ]  Intel/PC partition
 [EFI GPT]  EFI GPT partition map

[Analyse] -> [Quick Search] -> [Deeper Search]
* HPFS - NTFS              0  32 33 60800  76 60 976500000
P MS Data                   0  32 33 60800  76 60 976500000

Structure: Ok.  Use Up/Down to set partition characteristics:
P=Primary  D=Deleted   Enter to continue
[Write] -> Confirm with Y -> Reboot`,
            outType: "warning",
          },
          {
            comment: "depois confirme",
            cmd: "sudo fdisk -l /dev/sdc",
            out: "Disk /dev/sdc: 931.5 GiB ... Disklabel type: dos\n/dev/sdc1   ...   ntfs",
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="photorec é o irmão do testdisk">
        <p>
          Quando a partição não tem mais como ser reconstruída, <code>photorec</code> (mesmo
          pacote) faz <strong>file carving</strong>: escaneia o disco bloco a bloco procurando
          headers conhecidos (JPG, PDF, DOCX, ZIP) e remonta os arquivos pela assinatura. Saída
          fica numa pasta separada — você perde nomes/estrutura mas recupera o conteúdo.
        </p>
      </AlertBox>

      <PracticeBox
        title="Particionar e formatar pendrive de 8 GiB para loot criptografado"
        goal="Criar GPT, uma única partição ext4 ocupando o disco todo, com label loot, e formatar."
        steps={[
          "Identifique o pendrive com lsblk (geralmente sdb).",
          "Crie tabela GPT com parted.",
          "Crie partição loot ext4 ocupando 100% do disco.",
          "Formate com mkfs.ext4 e label loot.",
          "Monte em /mnt/loot e teste escrita.",
        ]}
        command={`lsblk
sudo parted -s /dev/sdb mklabel gpt
sudo parted -s /dev/sdb mkpart loot ext4 1MiB 100%
sudo partprobe /dev/sdb
sudo mkfs.ext4 -L loot /dev/sdb1
sudo mkdir -p /mnt/loot
sudo mount /dev/sdb1 /mnt/loot
echo "engagement-2026-04" | sudo tee /mnt/loot/README.txt
sudo umount /mnt/loot`}
        expected={`Created a new GPT disklabel on /dev/sdb.
Created a new partition.
Creating filesystem with 1966080 4k blocks and 491520 inodes
Filesystem UUID: 7a3b...
engagement-2026-04`}
        verify="lsblk -f /dev/sdb deve mostrar FSTYPE=ext4 e LABEL=loot."
      />

      <AlertBox type="success" title="Próximo passo: cifrar o pendrive">
        <p>
          Loot em pendrive sem cifra é negligência. Veja a página <strong>LUKS</strong> para
          envelopar essa partição com cryptsetup antes de formatar — assim, se o disco cair na
          mão errada, conteúdo continua inacessível.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
