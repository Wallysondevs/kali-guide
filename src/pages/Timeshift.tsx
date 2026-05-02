import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Timeshift() {
  return (
    <PageContainer
      title="Timeshift — snapshots de sistema"
      subtitle="O 'System Restore' do Linux. Use ANTES de mexer no kernel, instalar driver não-assinado ou testar exploit local de PrivEsc no seu lab."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Quando Timeshift salva sua noite</h2>
      <p>
        Você vai recompilar driver wifi para entrar em monitor mode. Vai dar{" "}
        <code>apt full-upgrade</code> no Kali rolling depois de 2 meses. Vai testar um exploit de
        PrivEsc local em <code>/proc</code>. Vai mexer em <code>/etc/network/interfaces</code> via
        SSH (e perder a sessão se errar). Em todos esses casos, um <strong>snapshot Timeshift</strong>{" "}
        antes te dá um botão de "voltar para 5 minutos atrás" sem reinstalar nada.
      </p>

      <AlertBox type="info" title="Timeshift não é backup de dados pessoais">
        <p>
          Timeshift restaura <strong>arquivos de sistema</strong> (<code>/etc</code>,{" "}
          <code>/usr</code>, <code>/var</code>, etc.) — por padrão exclui <code>/home</code>.
          Para seus arquivos use rsync/borg/restic (veja{" "}
          <code>/storage/backup</code>). Os dois se complementam.
        </p>
      </AlertBox>

      <h2>Instalar e escolher backend</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y timeshift",
            out: `Setting up timeshift (24.06.4-1) ...`,
            outType: "muted",
          },
          {
            comment: "ver os dois backends disponíveis",
            cmd: "timeshift --help | head -20",
            out: `Timeshift v24.06.4
Syntax:
  timeshift --check
  timeshift --create [OPTIONS]
  timeshift --restore [OPTIONS]
  timeshift --delete [OPTIONS]
  timeshift --list-snapshots
  timeshift --list-devices

Backends:
  --rsync     usa rsync + hardlinks (qualquer FS)
  --btrfs     snapshots nativos btrfs (instantâneo, copy-on-write)`,
            outType: "info",
          },
        ]}
      />

      <h2>RSYNC vs BTRFS — qual escolher</h2>
      <CommandTable
        title="comparação dos dois backends"
        variations={[
          { cmd: "RSYNC", desc: "Funciona em qualquer filesystem (ext4, xfs, etc.). Snapshot leva minutos. Usa hardlinks para economizar espaço.", output: "Default no Kali. Bom para 99% dos casos." },
          { cmd: "BTRFS", desc: "Só funciona se / estiver em btrfs com subvolumes @ e @home. Snapshot instantâneo (copy-on-write). Restaura via reboot.", output: "Mais rápido, mas exige instalação BTRFS desde o início." },
        ]}
      />

      <h2>Setup inicial via CLI</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) listar discos para escolher onde guardar",
            cmd: "sudo timeshift --list-devices",
            out: `Mounted Devices:
==================================================================
Device           UUID                                  Size  Mount
/dev/sda1        8b1f3c2a-4d6e-4f89-9a1b-cc7d2e3f4a56   99G  /
/dev/sdb1        9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9   50G`,
            outType: "info",
          },
          {
            comment: "2) configurar (atalho — também tem GUI sudo timeshift-gtk)",
            cmd: "sudo timeshift --rsync --snapshot-device /dev/sdb1 --check",
            out: `Snapshot device: /dev/sdb1
Mount point: /run/timeshift/backup
Estimating system size...
System size: 8.4 GB
Free space: 38.2 GB on backup device
Backup device is OK`,
            outType: "success",
          },
        ]}
      />

      <h2>Criar e listar snapshots</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "snapshot ondemand antes de uma operação arriscada",
            cmd: "sudo timeshift --create --comments 'antes de recompilar driver rtl88xx' --tags D",
            out: `First run mode (config file not found)
Selected default snapshot type: RSYNC
Mounted /dev/sdb1 at /run/timeshift/backup
Estimating system size...

Creating new snapshot...(RSYNC)
Saving to device: /dev/sdb1, mounted at path: /run/timeshift/backup
Synching files with rsync...
Created control file: /run/timeshift/backup/timeshift/snapshots/2026-04-03_15-22-44/info.json
RSYNC Snapshot saved successfully (4m 12s)
Tagged snapshot '2026-04-03_15-22-44': ondemand
------------------------------------------------------------------------------`,
            outType: "success",
          },
          {
            cmd: "sudo timeshift --list",
            out: `Device : /dev/sdb1
UUID   : 9f8a37e2-1b4d-4c81-a72f-8ccb1e3b51d9
Path   : /run/timeshift/backup
Mode   : RSYNC
Status : OK

3 snapshots, 35.8 GB free

Num     Name                 Tags  Description
------------------------------------------------------------------------------
0    >  2026-04-01_03-00-12  D     daily auto
1    >  2026-04-02_03-00-08  D     daily auto
2    >  2026-04-03_15-22-44  O     antes de recompilar driver rtl88xx`,
            outType: "info",
          },
        ]}
      />

      <h2>Tags de snapshot</h2>
      <CommandTable
        title="tipos de tag"
        variations={[
          { cmd: "B (Boot)", desc: "Criado automaticamente após cada boot.", output: "Bom para reverter se driver novo quebrar tela." },
          { cmd: "H (Hourly)", desc: "Por hora.", output: "Caro em espaço, raramente vale a pena." },
          { cmd: "D (Daily)", desc: "Diário (default em muitos setups).", output: "Sweet spot." },
          { cmd: "W (Weekly)", desc: "Semanal.", output: "Bom para histórico longo." },
          { cmd: "M (Monthly)", desc: "Mensal.", output: "Arquivamento." },
          { cmd: "O (On-demand)", desc: "Manual via --create.", output: "Use sempre antes de risco." },
        ]}
      />

      <h2>Restaurar — modo rsync (live)</h2>
      <p>
        Diferente do BTRFS (que reverte por reboot atômico), o backend rsync restaura{" "}
        <strong>sobrescrevendo o sistema atual</strong>. Para o sistema rodando você não pode
        restaurar <code>/</code> de dentro dele — você precisa estar em um Live USB Kali ou
        trocar para outro init.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "tentar restaurar de dentro do sistema atual (vai pedir reboot e rodar antes do init)",
            cmd: "sudo timeshift --restore --snapshot '2026-04-03_15-22-44' --target /dev/sda1",
            out: `WARNING: Targeting the same device as the running system.
Timeshift will mount the snapshot device at /tmp/timeshift-restore and run rsync.
The system will reboot automatically when restore completes.

Continue? [y/N]: y

Restoring snapshot 2026-04-03_15-22-44...
Synching files (rsync)...
[3m 22s]

App config (timeshift): preserved
Restore completed without errors. Rebooting...`,
            outType: "warning",
          },
          {
            comment: "alternativa: bootar Kali Live USB e restaurar de fora",
            cmd: "sudo timeshift-gtk   # GUI, pede para selecionar snapshot e dispositivo alvo",
            out: "(GUI gráfica, mais segura para iniciantes)",
            outType: "muted",
          },
        ]}
      />

      <h2>Excluir/incluir paths customizados</h2>
      <p>
        Por padrão, Timeshift exclui <code>/home</code>, <code>/root</code>,{" "}
        <code>/var/cache</code>, <code>/tmp</code>, <code>/var/log</code> e mountpoints
        externos. Você pode customizar via config:
      </p>

      <CodeBlock
        language="json"
        title="/etc/timeshift/timeshift.json (trecho)"
        code={`{
  "exclude": [
    "/home/wallyson/loot/**",
    "/home/wallyson/.cache/**",
    "+ /etc/**",
    "+ /usr/local/bin/**"
  ],
  "exclude-apps": [
    "Mozilla/Firefox/Cache",
    "google-chrome/Default/Cache"
  ]
}`}
      />

      <p>
        Sintaxe: linha começando com <code>+</code> = INCLUI explicitamente (sobrepõe exclusão
        default), sem prefixo = EXCLUI. <code>**</code> = recursivo.
      </p>

      <h2>Agendar automático</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo timeshift --rsync --snapshot-device /dev/sdb1 --schedule-monthly --schedule-weekly --schedule-daily --schedule-boot",
            out: `Schedule level updated:
  monthly:  enabled  (keep 2)
  weekly:   enabled  (keep 3)
  daily:    enabled  (keep 5)
  boot:     enabled  (keep 5)
  hourly:   disabled
  ondemand: keep 1`,
            outType: "success",
          },
          {
            comment: "ver o cron que ele criou",
            cmd: "cat /etc/cron.d/timeshift-hourly",
            out: `# Created by timeshift-autosnap
0 */1 * * * root /usr/bin/timeshift --check --scripted --quiet`,
            outType: "muted",
          },
        ]}
      />

      <h2>Apagar snapshots</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo timeshift --delete --snapshot '2026-04-01_03-00-12'",
            out: `Removing snapshot 2026-04-01_03-00-12...
Deleted snapshot 2026-04-01_03-00-12`,
            outType: "default",
          },
          {
            cmd: "sudo timeshift --delete-all",
            out: `Deleting all snapshots...
Deleted: 2026-04-02_03-00-08
Deleted: 2026-04-03_15-22-44
All snapshots deleted.`,
            outType: "warning",
          },
        ]}
      />

      <h2>timeshift-autosnap-apt — snapshot antes de cada apt</h2>
      <p>
        Hook que dispara um snapshot automático antes de toda operação <code>apt</code>. No
        Kali rolling onde quebras durante upgrade são mais comuns, isso vale ouro.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar (no Kali geralmente está no repo, no Debian puro precisa do .deb)",
            cmd: "sudo apt install -y timeshift-autosnap",
            out: "Setting up timeshift-autosnap",
            outType: "muted",
          },
          {
            comment: "config",
            cmd: "cat /etc/timeshift-autosnap.conf",
            out: `# se a versão do timeshift suporta a flag --comments, usá-la
useComments=true

# máximo de snapshots auto-criados a manter
maxSnapshots=3

# pular snapshot se o último é de menos de 5 min atrás
skipAutosnap=true`,
            outType: "info",
          },
          {
            cmd: "sudo apt update && sudo apt install -y nmap",
            out: `==> timeshift-autosnap: creating snapshot before apt operation...
==> Snapshot created: 2026-04-03_15-45-22 (apt: install nmap)
Setting up nmap (7.94+git20240403.5ae9eed5d+ds-1)`,
            outType: "success",
          },
        ]}
      />

      <h2>Recovery real-world</h2>
      <p>Cenário: você instalou um driver wifi não-assinado, sistema não inicia mais (kernel panic ao carregar módulo).</p>

      <CodeBlock
        language="bash"
        title="recovery via Kali Live USB"
        code={`# 1) Boot do Kali Live USB
# 2) Instalar timeshift no live (não persiste, ok):
sudo apt update && sudo apt install -y timeshift

# 3) Identificar disco do sistema "morto" e disco com snapshots
sudo lsblk -f
# /dev/sda1 = sistema quebrado
# /dev/sdb1 = onde timeshift guardou snapshots

# 4) Restaurar via GUI
sudo timeshift-gtk
#   → "Snapshots are stored on" → /dev/sdb1
#   → escolher snapshot pré-driver
#   → "Target device" → /dev/sda1
#   → confirmar (vai sobrescrever / com rsync)

# 5) Reboot, remover USB. Sistema volta para o estado pré-driver.`}
      />

      <PracticeBox
        title="Ciclo seguro: snapshot → quebrar → restaurar"
        goal="Em VM Kali descartável: tirar snapshot, quebrar /etc/sudoers de propósito, restaurar e validar."
        steps={[
          "Configurar Timeshift apontando para /dev/sdb (segundo disco da VM).",
          "Criar snapshot ondemand com tag 'baseline'.",
          "Quebrar /etc/sudoers (sintaxe inválida → sudo deixa de funcionar).",
          "Confirmar que sudo está quebrado.",
          "Restaurar (vai exigir reboot).",
          "Após reboot, validar que sudo voltou.",
        ]}
        command={`# 1) setup
sudo timeshift --rsync --snapshot-device /dev/sdb1 --check

# 2) baseline
sudo timeshift --create --comments 'baseline pre-experiment' --tags O

# 3) sabotar (CUIDADO: faça em VM!)
echo 'wallyson ALL=(ALL) GARBAGE_TOKEN_HERE' | sudo tee -a /etc/sudoers

# 4) confirmar quebra
sudo -k && sudo whoami
# >>> sudo: parse error in /etc/sudoers near line N

# 5) restaurar
sudo timeshift --restore --snapshot '<NOME_DO_BASELINE>' --target /dev/sda1 --yes
# (vai rebootar)

# 6) após reboot
sudo whoami
# >>> root  (voltou ao normal)`}
        expected={`Created control file: ...info.json
RSYNC Snapshot saved successfully
sudo: parse error in /etc/sudoers near line ...
Restore completed without errors. Rebooting...
root`}
        verify="Se você fez sozinho em VM, sabe usar a ferramenta sob estresse. Em hardware real, tenha sempre Kali Live USB no bolso para o cenário em que o boot quebra."
      />

      <AlertBox type="warning" title="Timeshift NÃO substitui backup off-site">
        <p>
          Os snapshots ficam no MESMO disco (ou disco anexado à máquina). Se o disco morrer
          fisicamente, ou alguém roubar o laptop, ou ransomware criptografar tudo, os snapshots
          vão junto. Use Timeshift para <em>operações arriscadas locais</em>, e borg/restic em
          bucket criptografado para <em>desastre</em>. Os dois juntos = paz.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
