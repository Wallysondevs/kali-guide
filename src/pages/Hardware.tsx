import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Hardware() {
  return (
    <PageContainer
      title="Inventário de hardware"
      subtitle="Saber o que tem dentro da máquina importa para escolher driver, ferramenta e até técnica de pentest (ex: chip wifi suporta injeção?)."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Visão geral rápida</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "inxi -Fxz",
            out: `System:    Kernel: 6.11.0-kali1-amd64 x86_64 bits: 64 Desktop: Xfce 4.20.0
           Distro: Kali GNU/Linux Rolling
Machine:   Type: Laptop System: Dell product: XPS 15 9520 v: 1.5.0
           Mobo: Dell model: 0NHWMR v: A00 serial: <filter> UEFI: Dell v: 1.21.0
CPU:       Info: 14-core (6-mt/8-st) model: 12th Gen Intel Core i7-12700H bits: 64
           cache: L1: 1.2 MiB L2: 11.5 MiB L3: 24 MiB
Graphics:  Device-1: Intel Alder Lake-P GT2 driver: i915 v: kernel
           Device-2: NVIDIA GA107M [GeForce RTX 3050 Ti] driver: nvidia v: 550.107.02
Network:   Device-1: Intel Alder Lake-P PCH CNVi WiFi driver: iwlwifi v: kernel
Drives:    Local Storage: total: 1.86 TiB used: 612.4 GiB (32.1%)
           ID-1: /dev/nvme0n1 vendor: SK hynix model: PC711 size: 953.87 GiB`,
            outType: "info",
          },
        ]}
      />

      <h2>CPU</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "lscpu | head -15",
            out: `Architecture:             x86_64
  CPU op-mode(s):         32-bit, 64-bit
  Address sizes:          46 bits physical, 48 bits virtual
  Byte Order:             Little Endian
CPU(s):                   20
  On-line CPU(s) list:    0-19
Vendor ID:                GenuineIntel
  Model name:             12th Gen Intel(R) Core(TM) i7-12700H
    CPU family:           6
    Model:                154
    Thread(s) per core:   2
    Core(s) per socket:   14
    Socket(s):            1
    Stepping:             3
    CPU max MHz:          4700.0000`,
            outType: "default",
          },
          {
            comment: "flags do processador (importante: vmx/svm = virtualização, aes = AES-NI)",
            cmd: "lscpu | grep -E 'Flags|Virtualization'",
            out: `Virtualization:           VT-x
Flags:                    fpu vme de pse tsc msr pae mce cx8 apic ... vmx ssse3 sse4_1 sse4_2 aes avx avx2`,
            outType: "success",
          },
        ]}
      />

      <h2>Memória</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "free -h",
            out: `               total        used        free      shared  buff/cache   available
Mem:            31Gi       7.4Gi        18Gi       412Mi       6.1Gi        23Gi
Swap:          8.0Gi          0B       8.0Gi`,
            outType: "info",
          },
          {
            comment: "detalhe dos pentes (precisa de root)",
            cmd: "sudo dmidecode --type memory | grep -E 'Size:|Type:|Speed:|Manufacturer:' | head",
            out: `	Size: 16384 MB
	Type: DDR5
	Speed: 4800 MT/s
	Manufacturer: Samsung
	Size: 16384 MB
	Type: DDR5
	Speed: 4800 MT/s
	Manufacturer: Samsung`,
            outType: "success",
          },
        ]}
      />

      <h2>Discos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE,LABEL",
            out: `NAME        SIZE TYPE MOUNTPOINT FSTYPE LABEL
nvme0n1   953.9G disk
├─nvme0n1p1  512M part /boot/efi  vfat   EFI
├─nvme0n1p2  944G part /          ext4
└─nvme0n1p3  9.4G part [SWAP]     swap`,
            outType: "default",
          },
          {
            cmd: "sudo smartctl -H /dev/nvme0n1",
            out: `=== START OF SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED`,
            outType: "success",
          },
          {
            cmd: "sudo smartctl -A /dev/nvme0n1 | head -15",
            out: `SMART/Health Information (NVMe Log 0x02)
Critical Warning:                   0x00
Temperature:                        43 Celsius
Available Spare:                    100%
Available Spare Threshold:          10%
Percentage Used:                    8%
Data Units Read:                    47,123,891 [24.1 TB]
Data Units Written:                 18,453,221 [9.4 TB]
Power On Hours:                     2,341
Unsafe Shutdowns:                   12`,
            outType: "info",
          },
        ]}
      />

      <h2>USB</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "lsusb",
            out: `Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 003: ID 0bda:8812 Realtek Semiconductor Corp. RTL8812AU 802.11a/b/g/n/ac WLAN Adapter
Bus 001 Device 002: ID 8087:0033 Intel Corp. AX211 Bluetooth
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub`,
            outType: "info",
          },
          {
            comment: "RTL8812AU = chip favorito de pentester wifi (suporta monitor + injection)",
            cmd: "lsusb -t",
            out: `/:  Bus 02.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/4p, 5000M
/:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/12p, 480M
    |__ Port 1: Dev 2, If 0, Class=Wireless, Driver=btusb, 12M
    |__ Port 2: Dev 3, If 0, Class=Vendor Specific Class, Driver=88XXau, 480M`,
            outType: "success",
          },
          {
            cmd: "lsusb -v -d 0bda:8812 2>/dev/null | grep -E 'iManufacturer|iProduct'",
            out: `  iManufacturer           1 Realtek
  iProduct                2 802.11ac NIC`,
            outType: "muted",
          },
        ]}
      />

      <h2>PCI</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "lspci | grep -E 'Network|VGA|Audio'",
            out: `00:02.0 VGA compatible controller: Intel Corporation Alder Lake-P GT2 [Iris Xe Graphics] (rev 0c)
00:14.3 Network controller: Intel Corporation Alder Lake-P PCH CNVi WiFi (rev 01)
00:1f.3 Audio device: Intel Corporation Alder Lake PCH-P High Definition Audio Controller (rev 01)
01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1)`,
            outType: "info",
          },
          {
            comment: "qual driver está em uso pra cada device",
            cmd: "lspci -k | grep -A 2 'Network controller'",
            out: `00:14.3 Network controller: Intel Corporation Alder Lake-P PCH CNVi WiFi (rev 01)
	Subsystem: Intel Corporation Wi-Fi 6E AX211 160MHz
	Kernel driver in use: iwlwifi
	Kernel modules: iwlwifi`,
            outType: "success",
          },
        ]}
      />

      <h2>Sumário das principais ferramentas</h2>
      <CommandTable
        title="hwinfo, lshw, dmidecode, sensors..."
        variations={[
          { cmd: "lshw -short", desc: "Resumo legível em árvore.", output: "H/W path        Device       Class          Description" },
          { cmd: "sudo lshw -class network -short", desc: "Filtra por classe.", output: "/0/100/14.3      wlp0s20f3    network        Wi-Fi 6E AX211" },
          { cmd: "lspci -nn", desc: "PCI com IDs hex (útil p/ Google de driver).", output: "00:14.3 ... [8086:51f0]" },
          { cmd: "lsusb -v", desc: "Verbose USB (descritores, interfaces, endpoints).", output: "Pesado, redirecione p/ less." },
          { cmd: "dmidecode -t bios", desc: "Versão da BIOS/UEFI.", output: "Vendor: Dell, Version: 1.21.0" },
          { cmd: "dmidecode -t baseboard", desc: "Modelo da placa-mãe.", output: "Manufacturer: Dell, Product Name: 0NHWMR" },
          { cmd: "hwinfo --short", desc: "Tudo bem resumido (instale com apt install hwinfo).", output: "cpu: ...  graphics card: ..." },
          { cmd: "sensors", desc: "Temperaturas (após sudo sensors-detect).", output: "Core 0: +52.0°C  fan1: 2400 RPM" },
          { cmd: "upower -i $(upower -e | grep BAT)", desc: "Estado da bateria.", output: "state: discharging\\npercentage: 78%\\ntime to empty: 4.2h" },
          { cmd: "lsblk -d -o NAME,ROTA,MODEL,TRAN", desc: "Disco SSD vs HDD vs USB.", output: "ROTA=0 (SSD), 1 (HDD)" },
          { cmd: "free -m -t", desc: "Memória + total RAM+swap.", output: "Total: ..." },
        ]}
      />

      <h2>Sensores e temperatura</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo sensors-detect --auto",
            out: `# sensors-detect revision $Revision$
# System: Dell Inc. XPS 15 9520
Driver \`coretemp':
  * Chip \`Intel digital thermal sensor' (confidence: 9)
Now follows a summary of the probes I have just done.
To load everything that is needed, add this to /etc/modules:
#----cut here----
coretemp
nct6775
#----cut here----`,
            outType: "info",
          },
          {
            cmd: "sensors",
            out: `coretemp-isa-0000
Adapter: ISA adapter
Package id 0:  +52.0°C  (high = +100.0°C, crit = +100.0°C)
Core 0:        +50.0°C  (high = +100.0°C, crit = +100.0°C)
Core 1:        +49.0°C
Core 2:        +51.0°C

acpitz-acpi-0
Adapter: ACPI interface
temp1:        +47.5°C  (crit = +119.0°C)`,
            outType: "success",
          },
          {
            comment: "monitor contínuo (Ctrl+C para sair)",
            cmd: "watch -n 2 sensors",
            out: "(refresh a cada 2 segundos)",
            outType: "muted",
          },
        ]}
      />

      <h2>Bateria (laptop em engagement longo)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "upower -e",
            out: `/org/freedesktop/UPower/devices/line_power_AC
/org/freedesktop/UPower/devices/battery_BAT0
/org/freedesktop/UPower/devices/DisplayDevice`,
            outType: "info",
          },
          {
            cmd: "upower -i /org/freedesktop/UPower/devices/battery_BAT0",
            out: `  native-path:          BAT0
  vendor:               SMP
  model:                DELL 7M0T6XX
  state:                discharging
  warning-level:        none
  energy:               45.2 Wh
  energy-empty:         0 Wh
  energy-full:          58.4 Wh
  energy-full-design:   86.0 Wh
  energy-rate:          11.3 W
  voltage:              12.418 V
  time to empty:        4.0 hours
  percentage:           77%
  capacity:             67.9%
  technology:           lithium-polymer`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="info" title="Por que isso importa para pentester?">
        <p>
          <strong>USB wifi adapter:</strong> nem todo chip suporta monitor mode + injection.{" "}
          <code>lsusb</code> + Google do ID (ex: 0bda:8812) confirma se a Alfa que você comprou é
          autêntica. <strong>CPU flags:</strong> <code>aes</code> = LUKS rápido,{" "}
          <code>vmx/svm</code> = você consegue rodar VM com virt-manager.{" "}
          <strong>SMART:</strong> antes de uma operação longa, valide que o disco do laptop não
          vai morrer no meio do engagement.
        </p>
      </AlertBox>

      <PracticeBox
        title="Faça um snapshot do hardware do alvo"
        goal="Coletar inventário completo da máquina e salvar em arquivo (útil em pós-exploração para entender o ambiente)."
        steps={[
          "Rode inxi com flag -Fxz (ofusca dados sensíveis).",
          "Salve a saída em /tmp/inventory.txt.",
          "Adicione lspci, lsusb e dmidecode.",
          "Compacte tudo num único arquivo.",
        ]}
        command={`inxi -Fxz > /tmp/inventory.txt
echo "=== PCI ===" >> /tmp/inventory.txt && lspci -nn >> /tmp/inventory.txt
echo "=== USB ===" >> /tmp/inventory.txt && lsusb >> /tmp/inventory.txt
echo "=== DMI ===" >> /tmp/inventory.txt && sudo dmidecode -t system -t baseboard -t bios >> /tmp/inventory.txt
gzip /tmp/inventory.txt
ls -lh /tmp/inventory.txt.gz`}
        expected={`-rw-r--r-- 1 wallyson wallyson 4.7K Apr  3 09:55 /tmp/inventory.txt.gz`}
        verify="Arquivo .gz com inventário completo, pronto para anexar ao relatório."
      />
    </PageContainer>
  );
}
