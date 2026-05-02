import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function LVM() {
  return (
    <PageContainer
      title="LVM — Logical Volume Manager"
      subtitle="Camada flexível entre o disco bruto e o filesystem. Cria, redimensiona e tira snapshots de volumes a quente."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Por que LVM (e por que pentester deveria saber)</h2>
      <p>
        LVM separa o disco físico do sistema de arquivos em três camadas: <strong>PV</strong>{" "}
        (Physical Volume = partição/disco), <strong>VG</strong> (Volume Group = pool agrupando
        vários PVs) e <strong>LV</strong> (Logical Volume = "partição" lógica formatável).
        Isso permite redimensionar a quente, juntar discos diferentes em um único pool e — o
        recurso mais útil para um lab Kali — <strong>tirar snapshots</strong> antes de operações
        arriscadas (recompilar kernel, instalar driver não-assinado, testar rootkit em VM).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver se o kernel já tem suporte e se o lvm2 está instalado",
            cmd: "lsmod | grep dm_mod && which lvm",
            out: `dm_mod                184320  20 dm_log,dm_mirror,dm_thin_pool
/usr/sbin/lvm`,
            outType: "success",
          },
          {
            cmd: "sudo apt install -y lvm2",
            out: "lvm2 já é a versão mais nova (2.03.23-1).",
            outType: "muted",
          },
        ]}
      />

      <h2>Visão geral: do disco ao filesystem</h2>
      <CodeBlock
        language="bash"
        title="hierarquia LVM"
        code={`/dev/sdb                       <- disco físico
   └── /dev/sdb1   (PV)        <- Physical Volume (criado com pvcreate)
        └── vg_lab (VG)        <- Volume Group (criado com vgcreate)
              ├── lv_targets   <- Logical Volume (formatado com mkfs.ext4)
              ├── lv_loot      <- outro LV (pode ser ext4, xfs, btrfs...)
              └── lv_snap      <- snapshot de outro LV`}
      />

      <h2>Criar PV / VG / LV do zero</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) identificar o disco vazio que vai virar PV",
            cmd: "lsblk",
            out: `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0   100G  0 disk
├─sda1   8:1    0    99G  0 part /
└─sda2   8:2    0     1G  0 part [SWAP]
sdb      8:16   0    50G  0 disk`,
            outType: "info",
          },
          {
            comment: "2) criar PV no disco inteiro (sem tabela de partição)",
            cmd: "sudo pvcreate /dev/sdb",
            out: `Physical volume "/dev/sdb" successfully created.`,
            outType: "success",
          },
          {
            comment: "3) criar VG agrupando esse PV",
            cmd: "sudo vgcreate vg_lab /dev/sdb",
            out: `Volume group "vg_lab" successfully created`,
            outType: "success",
          },
          {
            comment: "4) criar dois LVs dentro do VG",
            cmd: "sudo lvcreate -L 20G -n lv_targets vg_lab && sudo lvcreate -L 10G -n lv_loot vg_lab",
            out: `Logical volume "lv_targets" created.
Logical volume "lv_loot" created.`,
            outType: "success",
          },
          {
            cmd: "sudo mkfs.ext4 /dev/vg_lab/lv_targets && sudo mkfs.ext4 /dev/vg_lab/lv_loot",
            out: `Creating filesystem with 5242880 4k blocks and 1310720 inodes
Filesystem UUID: 7a3b...
done`,
            outType: "info",
          },
          {
            cmd: "sudo mkdir -p /mnt/{targets,loot} && sudo mount /dev/vg_lab/lv_targets /mnt/targets && sudo mount /dev/vg_lab/lv_loot /mnt/loot",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Inspecionar o que existe</h2>
      <CommandTable
        title="comandos de leitura LVM"
        variations={[
          { cmd: "sudo pvs", desc: "Resumo de PVs (uma linha por PV).", output: "PV         VG     Fmt  Attr PSize  PFree\n/dev/sdb   vg_lab lvm2 a--  50.00g 20.00g" },
          { cmd: "sudo pvdisplay /dev/sdb", desc: "Detalhe completo de um PV (UUID, alocado, livre).", output: "PV Size: 50.00 GiB / Allocated PE: 7680 / Free PE: 5120" },
          { cmd: "sudo vgs", desc: "Resumo de VGs.", output: "VG     #PV #LV #SN Attr   VSize  VFree\nvg_lab   1   2   0 wz--n- 50.00g 20.00g" },
          { cmd: "sudo vgdisplay vg_lab", desc: "Detalhe do VG (extents, política).", output: "PE Size: 4.00 MiB / Total PE: 12800 / Free PE: 5120" },
          { cmd: "sudo lvs", desc: "Resumo de LVs.", output: "LV         VG     Attr       LSize\nlv_targets vg_lab -wi-ao---- 20.00g\nlv_loot    vg_lab -wi-ao---- 10.00g" },
          { cmd: "sudo lvdisplay vg_lab/lv_targets", desc: "Detalhe do LV (path, status, UUID).", output: "LV Path: /dev/vg_lab/lv_targets / LV Status: available" },
          { cmd: "sudo lsblk -f", desc: "Visão hierárquica com filesystem.", output: "sdb            LVM2_member\n├─vg_lab-lv_targets ext4\n└─vg_lab-lv_loot    ext4" },
        ]}
      />

      <h2>Estender um LV (a quente, sem reboot)</h2>
      <p>
        Cenário: o LV de loot encheu durante uma operação. Você adiciona espaço sem desmontar,
        sem reboot, sem perder nada.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "df -h /mnt/loot",
            out: `Filesystem                     Size  Used Avail Use% Mounted on
/dev/mapper/vg_lab-lv_loot     9.8G  9.5G  300M  97% /mnt/loot`,
            outType: "warning",
          },
          {
            comment: "1) estender o LV em +5G",
            cmd: "sudo lvextend -L +5G /dev/vg_lab/lv_loot",
            out: `Size of logical volume vg_lab/lv_loot changed from 10.00 GiB (2560 extents) to 15.00 GiB (3840 extents).
Logical volume vg_lab/lv_loot successfully resized.`,
            outType: "success",
          },
          {
            comment: "2) crescer o ext4 (online, sem desmontar)",
            cmd: "sudo resize2fs /dev/vg_lab/lv_loot",
            out: `resize2fs 1.47.1 (20-May-2024)
Filesystem at /dev/vg_lab/lv_loot is mounted on /mnt/loot; on-line resizing required
The filesystem on /dev/vg_lab/lv_loot is now 3932160 (4k) blocks long.`,
            outType: "success",
          },
          {
            comment: "atalho: -r faz lvextend + resize2fs em um comando",
            cmd: "sudo lvextend -L +5G -r /dev/vg_lab/lv_loot",
            out: "(equivalente aos dois passos acima)",
            outType: "info",
          },
          {
            cmd: "df -h /mnt/loot",
            out: `Filesystem                     Size  Used Avail Use% Mounted on
/dev/mapper/vg_lab-lv_loot      15G  9.5G  5.0G  66% /mnt/loot`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Reduzir LV é perigoso">
        <p>
          <code>lvreduce</code> + <code>resize2fs</code> para diminuir só funciona <strong>offline</strong>{" "}
          (desmontar primeiro) e <strong>SEMPRE reduza o filesystem antes do LV</strong>, ou os
          dados são truncados. XFS não suporta shrink. Faça backup antes.
        </p>
      </AlertBox>

      <h2>Snapshots — o killer feature para lab Kali</h2>
      <p>
        Snapshot LVM é uma "foto" copy-on-write do LV. A foto inicial é instantânea e ocupa quase
        nada; só cresce conforme o original é modificado. Use antes de instalar driver wifi
        custom, recompilar kernel, mexer em <code>/etc</code> ou testar exploit de PrivEsc local.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) tira snapshot de 2G do LV alvo (origin)",
            cmd: "sudo lvcreate -L 2G -s -n lv_targets_snap /dev/vg_lab/lv_targets",
            out: `Logical volume "lv_targets_snap" created.`,
            outType: "success",
          },
          {
            cmd: "sudo lvs",
            out: `LV              VG     Attr       LSize  Pool Origin
lv_loot         vg_lab -wi-ao---- 15.00g
lv_targets      vg_lab owi-aos--- 20.00g
lv_targets_snap vg_lab swi-a-s---  2.00g      lv_targets`,
            outType: "info",
          },
          {
            comment: "fazer estrago no original",
            cmd: "sudo rm -rf /mnt/targets/* && echo CHAOS > /mnt/targets/test.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "2) reverter para o snapshot (merge — precisa desmontar primeiro)",
            cmd: "sudo umount /mnt/targets && sudo lvconvert --merge /dev/vg_lab/lv_targets_snap",
            out: `Merging of volume vg_lab/lv_targets_snap started.
vg_lab/lv_targets: Merged: 100.00%`,
            outType: "success",
          },
          {
            cmd: "sudo mount /dev/vg_lab/lv_targets /mnt/targets && ls /mnt/targets",
            out: `(arquivos originais de volta. test.txt sumiu.)`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Snapshot enche → snapshot inválido">
        <p>
          Se o snapshot encher (mais mudanças que o tamanho reservado), ele vira inválido e é
          descartado pelo kernel. Para um lab onde você vai instalar muita coisa, dimensione o
          snapshot generosamente (10-20% do origin no mínimo) ou use <code>lvextend</code> nele
          antes que estoure.
        </p>
      </AlertBox>

      <h2>Adicionar um disco ao VG (expandir o pool)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "novo disco /dev/sdc apareceu (USB externo, novo HD virtual)",
            cmd: "sudo pvcreate /dev/sdc && sudo vgextend vg_lab /dev/sdc",
            out: `Physical volume "/dev/sdc" successfully created.
Volume group "vg_lab" successfully extended`,
            outType: "success",
          },
          {
            cmd: "sudo vgs",
            out: `VG     #PV #LV #SN Attr   VSize   VFree
vg_lab   2   3   0 wz--n- 100.00g 65.00g`,
            outType: "info",
          },
          {
            comment: "agora você pode lvextend usando o espaço novo do sdc",
            cmd: "sudo lvextend -L +30G -r /dev/vg_lab/lv_targets",
            out: "Size of logical volume vg_lab/lv_targets changed to 50.00 GiB.",
            outType: "success",
          },
        ]}
      />

      <h2>Remover (na ordem certa)</h2>
      <CommandTable
        title="ordem reversa de criação"
        variations={[
          { cmd: "sudo umount /mnt/loot", desc: "1) Desmontar.", output: "" },
          { cmd: "sudo lvremove /dev/vg_lab/lv_loot", desc: "2) Apagar o LV.", output: "Do you really want to remove active logical volume vg_lab/lv_loot? [y/n]: y" },
          { cmd: "sudo vgremove vg_lab", desc: "3) Apagar o VG (se vazio).", output: "Volume group \"vg_lab\" successfully removed" },
          { cmd: "sudo pvremove /dev/sdb /dev/sdc", desc: "4) Apagar o PV.", output: "Labels on physical volume \"/dev/sdb\" successfully wiped." },
          { cmd: "sudo wipefs -a /dev/sdb", desc: "5) Limpar assinaturas residuais (opcional, anti-forense).", output: "/dev/sdb: 8 bytes were erased at offset 0x00000218 (LVM2_member)" },
        ]}
      />

      <PracticeBox
        title="Ciclo completo: criar VG, snapshot, reverter"
        goal="Em uma VM Kali com /dev/sdb vazio, fazer um ciclo completo: PV→VG→LV→mount→snapshot→destruir→reverter."
        steps={[
          "Criar PV em /dev/sdb e VG vg_test.",
          "Criar LV de 5G chamado lv_data, formatar ext4, montar em /mnt/data.",
          "Escrever um arquivo importante.txt no mount.",
          "Tirar snapshot lv_data_snap de 1G.",
          "Apagar tudo no /mnt/data.",
          "Desmontar e fazer merge do snapshot.",
          "Remontar e confirmar que importante.txt voltou.",
        ]}
        command={`sudo pvcreate /dev/sdb
sudo vgcreate vg_test /dev/sdb
sudo lvcreate -L 5G -n lv_data vg_test
sudo mkfs.ext4 /dev/vg_test/lv_data
sudo mkdir -p /mnt/data && sudo mount /dev/vg_test/lv_data /mnt/data
echo "credenciais do C2" | sudo tee /mnt/data/importante.txt

sudo lvcreate -L 1G -s -n lv_data_snap /dev/vg_test/lv_data

sudo rm -rf /mnt/data/*
ls /mnt/data   # vazio

sudo umount /mnt/data
sudo lvconvert --merge /dev/vg_test/lv_data_snap
sudo mount /dev/vg_test/lv_data /mnt/data
cat /mnt/data/importante.txt`}
        expected={`Physical volume "/dev/sdb" successfully created.
Volume group "vg_test" successfully created
Logical volume "lv_data" created.
Logical volume "lv_data_snap" created.
Merging of volume vg_test/lv_data_snap started.
vg_test/lv_data: Merged: 100.00%
credenciais do C2`}
        verify="Se o cat no fim mostra o conteúdo original, o snapshot funcionou e você tem um botão de undo para o lab inteiro."
      />

      <AlertBox type="success" title="Receita de lab Kali à prova de bala">
        <p>
          Coloque <code>/</code>, <code>/home</code> e <code>/var</code> em LVs separados dentro
          de um único VG. Antes de qualquer operação arriscada (instalar driver, testar rootkit
          em userland, recompilar libc), tire snapshot dos três. Se algo quebrar, faça merge no
          rescue mode e está tudo intacto. Mais barato que reinstalar.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
