import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function KVM() {
  return (
    <PageContainer
      title="KVM / QEMU / libvirt"
      subtitle="Virtualização nativa Linux. Para testar payloads em VMs Windows isoladas, montar lab AD inteiro e snapshotar antes de executar malware."
      difficulty="avancado"
      timeToRead="20 min"
    >
      <h2>Por que KVM e não VirtualBox?</h2>
      <p>
        <strong>KVM</strong> é módulo do kernel Linux: vira o seu CPU em
        hypervisor de verdade (tipo 1 quando há suporte VT-x/AMD-V).{" "}
        <strong>QEMU</strong> emula o hardware, <strong>libvirt</strong> é a API
        unificada e <strong>virt-manager</strong> a GUI. Resultado: VMs com
        performance ~nativa, suporte a PCI passthrough, snapshots LVM/qcow2 e
        gerenciamento por CLI scriptável — tudo que VirtualBox faz pela metade.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "checa se a CPU suporta virtualização",
            cmd: "grep -E -c '(vmx|svm)' /proc/cpuinfo",
            out: "16",
            outType: "info",
          },
          {
            cmd: "lscpu | grep Virtualization",
            out: "Virtualization:                       VT-x",
            outType: "success",
          },
          {
            cmd: "kvm-ok",
            out: `INFO: /dev/kvm exists
KVM acceleration can be used`,
            outType: "success",
          },
        ]}
      />

      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager virtinst ovmf cpu-checker",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  qemu-kvm qemu-system-x86 libvirt-daemon-system virt-manager virtinst ovmf
0 upgraded, 28 newly installed, 0 to remove.
Need to get 184 MB of archives.`,
            outType: "info",
          },
          {
            comment: "adiciona seu user aos grupos certos",
            cmd: "sudo usermod -aG libvirt,kvm $USER && newgrp libvirt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo systemctl enable --now libvirtd",
            out: "Created symlink /etc/systemd/system/multi-user.target.wants/libvirtd.service → /usr/lib/systemd/system/libvirtd.service.",
            outType: "success",
          },
          {
            cmd: "virsh list --all",
            out: ` Id   Name   State
--------------------`,
            outType: "muted",
          },
        ]}
      />

      <h2>virsh — CLI do libvirt</h2>
      <CommandTable
        title="virsh — comandos essenciais"
        variations={[
          { cmd: "virsh list --all", desc: "Lista todas as VMs (ligadas e desligadas).", output: "Id Name State" },
          { cmd: "virsh start <vm>", desc: "Liga a VM.", output: "Domain 'win10-lab' started" },
          { cmd: "virsh shutdown <vm>", desc: "Desliga gracioso (envia ACPI).", output: "(equivale a 'shutdown' dentro do guest)" },
          { cmd: "virsh destroy <vm>", desc: "Mata FORÇADO (puxa o cabo).", output: "Não corrompe disco com qcow2 mas use com critério." },
          { cmd: "virsh reboot <vm>", desc: "Reinício gracioso.", output: "" },
          { cmd: "virsh snapshot-create-as <vm> snap1", desc: "Cria snapshot live.", output: "Domain snapshot snap1 created" },
          { cmd: "virsh snapshot-list <vm>", desc: "Lista snapshots.", output: "Name   Creation Time   State" },
          { cmd: "virsh snapshot-revert <vm> snap1", desc: "Volta para snapshot (DESCARTA mudanças).", output: "Essencial antes de executar malware no guest." },
          { cmd: "virsh dominfo <vm>", desc: "Info detalhada (RAM, CPU, UUID).", output: "Id, Name, OS Type, State..." },
          { cmd: "virsh domifaddr <vm>", desc: "IP da VM (DHCP do libvirt).", output: "Name MAC address Protocol Address" },
          { cmd: "virsh console <vm>", desc: "Console serial (Ctrl+] para sair).", output: "Sem GUI — útil em servidor headless." },
          { cmd: "virsh net-list --all", desc: "Lista as redes virtuais (default = NAT 192.168.122.0/24).", output: "Name State Autostart" },
          { cmd: "virsh edit <vm>", desc: "Edita XML da VM (chama $EDITOR).", output: "Para tweaks que a GUI não expõe." },
          { cmd: "virsh undefine <vm> --remove-all-storage", desc: "Apaga VM + discos.", output: "DESTRUTIVO." },
        ]}
      />

      <h2>Criar VM Windows pra testar payload</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "baixe a ISO de avaliação Win10/11 da MS antes",
            cmd: "ls /var/lib/libvirt/images/",
            out: `Win10_22H2_BrazilianPortuguese_x64.iso  virtio-win.iso`,
            outType: "muted",
          },
          {
            cmd: "sudo virt-install \\\n  --name win10-lab \\\n  --ram 4096 \\\n  --vcpus 2 \\\n  --disk path=/var/lib/libvirt/images/win10-lab.qcow2,size=60,format=qcow2 \\\n  --cdrom /var/lib/libvirt/images/Win10_22H2_BrazilianPortuguese_x64.iso \\\n  --os-variant win10 \\\n  --network network=default \\\n  --graphics spice \\\n  --boot uefi",
            out: `Starting install...
Creating domain... |
Domain is still running. Installation may be in progress.
You can reconnect to the console to complete the installation process.`,
            outType: "success",
          },
        ]}
      />

      <h2>qcow2 e snapshots — fluxo de teste de malware</h2>
      <p>
        O grande poder do KVM em pentest: <strong>snapshot antes de detonar
        payload</strong>, observa, reverte instantâneo. Sem reinstalar Windows
        a cada teste.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "antes de testar uma payload nova",
            cmd: "virsh snapshot-create-as win10-lab clean-state --description 'Win10 limpo, sem AV'",
            out: "Domain snapshot clean-state created",
            outType: "success",
          },
          {
            comment: "executa o payload no guest, observa, anota IOCs...",
            cmd: "virsh snapshot-list win10-lab",
            out: ` Name          Creation Time               State
----------------------------------------------------
 clean-state   2026-04-03 15:22:11 -0300   running
 with-edr      2026-04-03 15:55:42 -0300   running`,
            outType: "info",
          },
          {
            comment: "volta pra antes do payload",
            cmd: "virsh snapshot-revert win10-lab clean-state",
            out: "(silencioso — VM reverteu em ~3s)",
            outType: "success",
          },
        ]}
      />

      <h2>qemu-img — manipular disks direto</h2>
      <CommandTable
        title="qemu-img"
        variations={[
          { cmd: "qemu-img create -f qcow2 disk.qcow2 50G", desc: "Cria disco esparso de 50G (ocupa só o que usa).", output: "Formatting 'disk.qcow2', fmt=qcow2 cluster_size=65536" },
          { cmd: "qemu-img info disk.qcow2", desc: "Tamanho real, formato, snapshots.", output: "virtual size: 50 GiB / disk size: 12 GiB" },
          { cmd: "qemu-img convert -O qcow2 disco.vmdk disco.qcow2", desc: "Converte de VMware (vmdk) para qcow2.", output: "Útil pra migrar VMs do VMware/VirtualBox." },
          { cmd: "qemu-img convert -O vdi disco.qcow2 disco.vdi", desc: "Converte pra VirtualBox.", output: "" },
          { cmd: "qemu-img resize disk.qcow2 +20G", desc: "Aumenta o disco em 20G.", output: "Image resized." },
          { cmd: "qemu-img snapshot -l disk.qcow2", desc: "Lista snapshots dentro do qcow2 (interno).", output: "ID TAG VM SIZE DATE VM CLOCK" },
        ]}
      />

      <h2>Networks — NAT, bridge e isolated</h2>
      <CodeBlock
        language="xml"
        title="rede 'lab-isolated' (sem internet)"
        code={`<network>
  <name>lab-isolated</name>
  <bridge name='virbr10' stp='on' delay='0'/>
  <ip address='10.66.66.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='10.66.66.100' end='10.66.66.200'/>
    </dhcp>
  </ip>
</network>`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "virsh net-define lab-isolated.xml && virsh net-start lab-isolated && virsh net-autostart lab-isolated",
            out: `Network lab-isolated defined from lab-isolated.xml
Network lab-isolated started
Network lab-isolated marked as autostarted`,
            outType: "success",
          },
          {
            comment: "anexar VM existente à rede isolada",
            cmd: "virsh attach-interface --domain win10-lab --type network --source lab-isolated --model virtio --config",
            out: "Interface attached successfully",
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Detonar malware? Use rede isolada">
        <p>
          A rede <code>default</code> do libvirt faz NAT pra internet. Se
          você vai detonar uma sample real, mova a VM pra uma rede{" "}
          <code>isolated</code> (sem <code>&lt;forward&gt;</code>) ou pra um
          INETSim/FakeNet. Senão a malware liga pro C2 real e queima a operação.
        </p>
      </AlertBox>

      <h2>Lab AD completo (DC + Win10 + Kali)</h2>
      <p>
        Stack típica para treinar Kerberoasting / AS-REP / DCSync:
      </p>

      <CodeBlock
        language="bash"
        title="provisionar lab AD"
        code={`# 1. Domain Controller (Win Server 2022 trial)
sudo virt-install --name dc01 --ram 4096 --vcpus 2 \\
  --disk size=60,format=qcow2 \\
  --cdrom /var/lib/libvirt/images/SERVER_EVAL_x64FRE_pt-br.iso \\
  --os-variant win2k22 --network network=lab-isolated --graphics spice --boot uefi

# 2. Workstation Win10 joinada
sudo virt-install --name ws01 --ram 4096 --vcpus 2 \\
  --disk size=50,format=qcow2 \\
  --cdrom /var/lib/libvirt/images/Win10_22H2.iso \\
  --os-variant win10 --network network=lab-isolated --graphics spice --boot uefi

# 3. Atacante Kali
sudo virt-install --name kali-attacker --ram 4096 --vcpus 2 \\
  --disk size=40,format=qcow2 \\
  --cdrom /var/lib/libvirt/images/kali-linux-2025.1-installer-amd64.iso \\
  --os-variant kali --network network=lab-isolated --graphics spice`}
      />

      <h2>GPU passthrough (overview)</h2>
      <p>
        Para rodar <strong>Hashcat</strong> em VM com performance nativa de GPU
        (ou jogos / análise de malware com aceleração 3D), KVM faz PCI
        passthrough. Requer: CPU IOMMU (Intel VT-d / AMD-Vi), GPU em IOMMU group
        isolado, kernel parameters <code>intel_iommu=on iommu=pt</code> ou{" "}
        <code>amd_iommu=on</code>, vfio-pci binding. Tópico denso — dedique uma
        sessão.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "for d in /sys/kernel/iommu_groups/*/devices/*; do n=${d#*/iommu_groups/*}; n=${n%%/*}; printf 'IOMMU Group %s ' \"$n\"; lspci -nns \"${d##*/}\"; done | head -10",
            out: `IOMMU Group 0 00:00.0 Host bridge [0600]: Intel Corporation 12th Gen Core Processor Host Bridge [8086:4660]
IOMMU Group 1 00:01.0 PCI bridge [0604]: Intel Corporation 12th Gen Core Processor PCIe Controller [8086:460d]
IOMMU Group 1 01:00.0 VGA compatible controller [0300]: NVIDIA Corporation AD102 [GeForce RTX 4090] [10de:2684]
IOMMU Group 1 01:00.1 Audio device [0403]: NVIDIA Corporation AD102 HDA [10de:22ba]`,
            outType: "info",
          },
        ]}
      />

      <h2>vs. VirtualBox / VMware</h2>
      <CommandTable
        title="comparativo"
        variations={[
          { cmd: "Performance", desc: "KVM com virtio chega a ~95% do nativo. VirtualBox é mais devagar.", output: "" },
          { cmd: "Snapshots", desc: "qcow2 + virsh snapshot são instantâneos e empilháveis. VBox tb tem mas mais lento.", output: "" },
          { cmd: "GPU passthrough", desc: "KVM faz nativo. VBox: zero. VMware Workstation: parcial.", output: "" },
          { cmd: "Automação", desc: "virsh + virt-install são scriptáveis. VBox tem VBoxManage mas menos elegante.", output: "" },
          { cmd: "GUI desktop", desc: "VirtualBox ainda ganha pra usuário casual. virt-manager é bom mas técnico.", output: "" },
          { cmd: "Compatibilidade Mac/Win host", desc: "KVM SÓ Linux host. VBox/VMware multiplataforma.", output: "" },
          { cmd: "Drag & drop / Shared folders", desc: "VBox tem nativo. KVM: usa virtio-9p / spice channel.", output: "" },
        ]}
      />

      <PracticeBox
        title="Snapshot before-payload, executar simulado, revert"
        goal="Provar o fluxo seguro de testar uma 'payload' (touch arquivo) numa VM, observar e reverter."
        steps={[
          "Tenha uma VM Linux qualquer já criada (ex: debian-test).",
          "Crie snapshot 'pristine'.",
          "Conecte ssh, crie um arquivo simulando IOC.",
          "Reverta para 'pristine'.",
          "Reconecte e prove que o arquivo sumiu.",
        ]}
        command={`virsh snapshot-create-as debian-test pristine
ssh user@$(virsh domifaddr debian-test | awk '/ipv4/{print $4}' | cut -d/ -f1) "touch /tmp/iocsim && ls /tmp/iocsim"
virsh snapshot-revert debian-test pristine
sleep 5
ssh user@$(virsh domifaddr debian-test | awk '/ipv4/{print $4}' | cut -d/ -f1) "ls /tmp/iocsim 2>&1 || echo 'IOC sumiu — snapshot OK'"`}
        expected={`Domain snapshot pristine created
/tmp/iocsim
ls: cannot access '/tmp/iocsim': No such file or directory
IOC sumiu — snapshot OK`}
        verify="O ls após o revert falhou — prova que o snapshot reverteu o estado completo do disk e RAM."
      />

      <AlertBox type="info" title="cockpit-machines: web GUI">
        <p>
          Para administrar VMs remotamente sem expor virt-manager via X11
          forwarding, instale <code>cockpit cockpit-machines</code> e acesse{" "}
          <code>https://kali:9090</code>. Roda VMs por navegador.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
