import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Disco() {
  return (
    <PageContainer
      title="Diagnóstico de armazenamento"
      subtitle="df, du, lsblk, blkid, fdisk, parted, ncdu, iostat e smartctl — descobrir o que está ocupando espaço, o estado dos discos e a saúde do hardware."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <h2>Visão geral</h2>
      <p>
        Diagnosticar problemas de disco em Linux geralmente começa por uma de três perguntas:
        “quanto espaço resta em cada filesystem?”, “quem está consumindo esse espaço?” ou “o
        disco físico está saudável?”. Cada pergunta tem ferramentas específicas. Este guia
        organiza o ferramental do nível mais alto (filesystem) ao mais baixo (controlador SATA/NVMe).
      </p>

      <h2>Espaço por filesystem — df</h2>
      <CommandTable
        title="df — disk free"
        variations={[
          { cmd: "df -h", desc: "Espaço usado/livre por filesystem montado, em unidades humanas.", output: "Tamanho em K/M/G/T." },
          { cmd: "df -hT", desc: "Inclui o tipo do filesystem (ext4, xfs, tmpfs).", output: "Útil para identificar pseudo-FS." },
          { cmd: "df -i", desc: "Mostra inodes em vez de bytes.", output: "Disco pode encher por inodes mesmo com bytes livres." },
          { cmd: "df -h /var", desc: "Mostra somente o filesystem que contém o caminho.", output: "Bom para checar partições específicas." },
          { cmd: "df --output=source,fstype,size,used,avail,pcent,target", desc: "Customiza colunas para scripts.", output: "Ideal para parsing." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "df -hT",
            out: `Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda1      ext4    98G   42G   51G  46% /
tmpfs          tmpfs  3.9G  120M  3.8G   4% /dev/shm
/dev/sdb1      ext4   500G  487G   13G  98% /var/log
efivarfs       efivar 192K   85K   103K 46% /sys/firmware/efi/efivars`,
            outType: "warning",
          },
          {
            comment: "verificando inodes — comum com muitos arquivos pequenos",
            cmd: "df -i /var/log",
            out: `Filesystem      Inodes  IUsed  IFree IUse% Mounted on
/dev/sdb1      33M     32M    1M    97% /var/log`,
            outType: "warning",
          },
        ]}
      />

      <h2>Quem ocupa esse espaço — du e ncdu</h2>
      <CommandTable
        title="du — disk usage"
        variations={[
          { cmd: "du -sh /var/log", desc: "Soma total do diretório, formato humano.", output: "-s summary, -h human" },
          { cmd: "du -sh /var/log/*", desc: "Tamanho de cada item dentro do diretório.", output: "Bom para detectar arquivos isolados grandes." },
          { cmd: "du -h --max-depth=1 /var | sort -h", desc: "Top-down ordenado: começa pelos maiores.", output: "Padrão para “quem está enchendo /var?”." },
          { cmd: "du -h --threshold=100M /home", desc: "Mostra apenas itens acima do limiar.", output: "Reduz ruído em árvores grandes." },
          { cmd: "du -ch *.log | tail -1", desc: "Total de uma seleção (-c).", output: "Útil em pipelines com find." },
          { cmd: "ncdu /var", desc: "Interface interativa, navegável, top-down.", output: "Pacote: ncdu" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo du -h --max-depth=1 /var 2>/dev/null | sort -h | tail -5",
            out: `412M  /var/cache
1.2G  /var/lib
3.4G  /var/spool
4.1G  /var/log
9.3G  /var`,
            outType: "info",
          },
          {
            comment: "encontrar arquivos individuais maiores que 500M",
            cmd: "sudo find /var -type f -size +500M -exec ls -lh {} \\;",
            out: `-rw-r----- 1 root adm 1.2G Apr  3 09:14 /var/log/journal/system.journal
-rw-r--r-- 1 mysql mysql 870M Apr  3 09:00 /var/lib/mysql/ibdata1`,
            outType: "info",
          },
        ]}
      />

      <h2>Block devices e partições</h2>
      <CommandTable
        title="lsblk, blkid, fdisk, parted"
        variations={[
          { cmd: "lsblk", desc: "Árvore de discos, partições e mountpoints.", output: "Visão imediata da topologia." },
          { cmd: "lsblk -f", desc: "Inclui FSTYPE, LABEL, UUID e MOUNTPOINTS.", output: "Substitui muitos usos de blkid." },
          { cmd: "lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINTS,MODEL", desc: "Customiza colunas.", output: "Útil para inventário." },
          { cmd: "sudo blkid", desc: "Lista UUID e tipo de cada partição.", output: "Indispensável para escrever /etc/fstab." },
          { cmd: "sudo fdisk -l", desc: "Lista tabela de partições (MBR/GPT).", output: "Mostra setor inicial/final, tipo." },
          { cmd: "sudo parted -l", desc: "Equivalente moderno; suporte completo a GPT.", output: "Em alguns ambientes substitui o fdisk." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "lsblk -f",
            out: `NAME   FSTYPE FSVER LABEL UUID                                 MOUNTPOINTS
sda
├─sda1 ext4   1.0   root  8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56 /
└─sda2 swap   1           5e8a7b1c-9d3e-4a8b-b1c5-7e2f9a3d4e1b [SWAP]
sdb
└─sdb1 ext4   1.0   data  9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9 /var/log
nvme0n1
└─nvme0n1p1 vfat FAT32 BOOT A4E2-1B7F /boot/efi`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="info" title="Pseudo-filesystems no df">
        <p>
          O <code>df</code> mostra também filesystems virtuais (<code>tmpfs</code>,{" "}
          <code>devtmpfs</code>, <code>proc</code>, <code>sysfs</code>). Eles não consomem disco;
          são interfaces do kernel. Use <code>{`df -hT --type=ext4 --type=xfs --type=btrfs`}</code>{" "}
          para enxergar somente filesystems reais.
        </p>
      </AlertBox>

      <h2>Latência e throughput — iostat</h2>
      <CommandTable
        title="iostat (pacote sysstat)"
        variations={[
          { cmd: "iostat -x 1", desc: "Estatísticas estendidas a cada 1s.", output: "Métricas: r/s, w/s, await, %util." },
          { cmd: "iostat -x 1 5", desc: "5 amostras de 1 segundo e encerra.", output: "Boa para snapshots em scripts." },
          { cmd: "iostat -dx /dev/sda 2", desc: "Apenas device e atualizando a cada 2s.", output: "Útil para isolar um disco." },
          { cmd: "iostat -h", desc: "Saída em unidades humanas.", output: "Mais legível em terminais largos." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "iostat -x 2 2 | tail -10",
            out: `Device r/s   w/s  rkB/s   wkB/s  rrqm/s wrqm/s  await  %util
sda    12.4 89.6 312.0  4123.0 0.0     8.4    7.42   18.30
sdb    0.0  142  0.0    11320  0.0     31.0   24.85  91.40`,
            outType: "warning",
          },
        ]}
      />

      <p>
        Valores de <strong>%util</strong> próximos de 100% indicam saturação do dispositivo;{" "}
        <strong>await</strong> é a latência média (em ms) por requisição. Em SSDs saudáveis
        espera-se <code>await</code> baixo (poucos ms) mesmo sob carga; em HDDs valores em torno
        de 10–20 ms são normais.
      </p>

      <h2>Saúde do disco — SMART</h2>
      <CommandTable
        title="smartctl (pacote smartmontools)"
        variations={[
          { cmd: "sudo smartctl -i /dev/sda", desc: "Identificação: modelo, firmware, capacidade.", output: "Confere se SMART está habilitado." },
          { cmd: "sudo smartctl -H /dev/sda", desc: "Veredito geral: PASSED ou FAILED.", output: "Resposta rápida go/no-go." },
          { cmd: "sudo smartctl -a /dev/sda", desc: "Todos os atributos (idade, setores realocados, temperatura).", output: "Para investigação detalhada." },
          { cmd: "sudo smartctl -t short /dev/sda", desc: "Inicia self-test rápido (poucos minutos).", output: "Use long para teste completo." },
          { cmd: "sudo smartctl -l selftest /dev/sda", desc: "Histórico de self-tests.", output: "Inclui resultado e LBA da falha." },
          { cmd: "sudo nvme smart-log /dev/nvme0", desc: "Equivalente para discos NVMe (pacote nvme-cli).", output: "Mostra wear e temperatura." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo smartctl -H /dev/sda",
            out: `=== START OF READ SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED`,
            outType: "success",
          },
          {
            cmd: "sudo smartctl -A /dev/sda | grep -E 'Reallocated|Pending|Power_On_Hours|Temperature'",
            out: `  5 Reallocated_Sector_Ct   0x0033   100  100  010    Pre-fail  Always   -   0
  9 Power_On_Hours          0x0032   095  095  000    Old_age   Always   -   18324
194 Temperature_Celsius     0x0022   071  058  000    Old_age   Always   -   29
197 Current_Pending_Sector  0x0032   100  100  000    Old_age   Always   -   0`,
            outType: "info",
          },
        ]}
      />

      <h2>O que fazer quando o disco enche</h2>
      <CodeBlock
        language="bash"
        title="receita: localizar grandes consumidores em /var"
        code={`# 1) confirma qual filesystem está cheio
df -hT

# 2) desce um nível por vez, começando em /
sudo du -h --max-depth=1 / 2>/dev/null | sort -h | tail

# 3) entra no maior diretório identificado e repete
sudo du -h --max-depth=1 /var 2>/dev/null | sort -h | tail

# 4) opcional: navegação interativa
sudo ncdu /var

# 5) procura arquivos individuais grandes
sudo find / -xdev -type f -size +500M -exec ls -lh {} \\;

# 6) limpeza típica
sudo journalctl --vacuum-size=500M
sudo apt clean`}
      />

      <PracticeBox
        title="Diagnóstico completo de armazenamento"
        goal="Levantar um relatório de espaço, top-5 consumidores em /var e estado SMART do disco principal."
        steps={[
          "Coletar visão geral com df -hT (bytes) e df -i (inodes).",
          "Listar topologia com lsblk -f.",
          "Identificar os cinco maiores subdiretórios de /var.",
          "Conferir veredito SMART do disco do sistema.",
          "Capturar uma amostra de iostat para verificar saturação.",
        ]}
        command={`df -hT
df -i
lsblk -f
sudo du -h --max-depth=1 /var 2>/dev/null | sort -h | tail -5
sudo smartctl -H /dev/sda
iostat -x 1 3`}
        expected={`Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda1      ext4    98G   42G   51G  46% /
...
SMART overall-health self-assessment test result: PASSED
Device r/s w/s ... %util
sda    12  89  ...  18.30`}
        verify="Os comandos devem produzir, em ordem: tabela de espaço, tabela de inodes, árvore de devices, top-5 de /var, veredito SMART e amostras de iostat."
      />

      <AlertBox type="warning" title="Cuidado com du em /">
        <p>
          Rodar <code>du -h /</code> sem filtros percorre <code>/proc</code>, <code>/sys</code>{" "}
          e mountpoints de rede, gerando ruído. Use <code>--one-file-system</code> ou o flag{" "}
          <code>{`-x`}</code> do <code>find</code> para permanecer no filesystem corrente. E
          sempre execute como <code>sudo</code> em diretórios protegidos para evitar contagem
          parcial silenciosa.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
