import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Troubleshooting() {
  return (
    <PageContainer
      title="Troubleshooting — Quando Nada Funciona"
      subtitle="strace, ltrace, gdb básico, journalctl -xe, dmesg, lsof: o checklist de quem está num CTF às 3 da manhã."
      difficulty="intermediario"
      timeToRead="17 min"
    >
      <h2>O fluxo mental</h2>
      <p>
        Antes de abrir 12 ferramentas, faça 4 perguntas: (1) <strong>O que aconteceu?</strong>{" "}
        (mensagem de erro, exit code, comportamento esperado vs. observado);{" "}
        (2) <strong>O que mudou?</strong> (atualização, instalei pacote, mexi em config);
        (3) <strong>Quando começou?</strong> (sempre, depois do boot, esporádico);{" "}
        (4) <strong>Como reproduzo?</strong> (passo mínimo). Sem isso, qualquer ferramenta
        é shotgun debugging.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "exit code do último comando (a primeira coisa que você olha)",
            cmd: "ls /naoexiste; echo \"exit=$?\"",
            out: `ls: cannot access '/naoexiste': No such file or directory
exit=2`,
            outType: "warning",
          },
          {
            comment: "0 = sucesso, 1 = erro genérico, 2 = misuse, 126 = sem permissão de exec, 127 = comando não achado, 130 = Ctrl+C",
            cmd: "false; echo $?",
            out: "1",
            outType: "error",
          },
        ]}
      />

      <h2>journalctl — primeira parada para serviço quebrado</h2>
      <CommandTable
        title="journalctl em modo debug"
        variations={[
          { cmd: "journalctl -xe", desc: "Últimas entradas + explicações detalhadas (-x). É o primeiro comando depois de um failed.", output: "-- Subject: A start job has finished with a failure ..." },
          { cmd: "journalctl -u nginx -n 100 --no-pager", desc: "100 últimas linhas só do nginx, sem pager.", output: "Mostra todo o ciclo do serviço." },
          { cmd: "journalctl -u nginx -f", desc: "Tail -f do journal de um serviço.", output: "Acompanha em tempo real." },
          { cmd: "journalctl -p err -b", desc: "Só erros (priority<=err) desde o boot atual.", output: "Filtra ruído INFO/DEBUG." },
          { cmd: "journalctl --since '5 min ago'", desc: "Janela temporal humana.", output: "Aceita 'today', '2 hours ago', '2026-04-05 10:00:00'." },
          { cmd: "journalctl -k -b", desc: "Só kernel desde último boot (= dmesg).", output: "Caçar OOM kill, oops, panic." },
          { cmd: "journalctl --list-boots", desc: "Lista boots (-1 = anterior, -2 = retrasado).", output: "Use -b -1 para ver o boot que crashou." },
          { cmd: "journalctl --disk-usage", desc: "Quanto o journal está consumindo.", output: "Archived journals take up 1.3G ..." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo systemctl restart bluetooth",
            out: `Job for bluetooth.service failed because the control process exited with error code.
See "systemctl status bluetooth.service" and "journalctl -xeu bluetooth.service" for details.`,
            outType: "error",
          },
          {
            cmd: "journalctl -xeu bluetooth.service --no-pager | tail -20",
            out: `Apr 05 16:32:01 kali bluetoothd[3221]: Bluetooth daemon 5.66
Apr 05 16:32:01 kali bluetoothd[3221]: src/main.c:parse_config() Parsing main.conf
Apr 05 16:32:01 kali bluetoothd[3221]: profiles/audio/avdtp.c:session_cb() AVDTP setup error
Apr 05 16:32:01 kali bluetoothd[3221]: Failed to set mode: Blocked through rfkill (0x12)
Apr 05 16:32:01 kali systemd[1]: bluetooth.service: Main process exited, code=exited, status=1/FAILURE
░░ The unit bluetooth.service has entered the 'failed' state with result 'exit-code'.
░░ Subject: Unit failed
░░ Defined-By: systemd`,
            outType: "warning",
          },
          {
            comment: "achou: rfkill bloqueou. solução:",
            cmd: "rfkill list && sudo rfkill unblock bluetooth && sudo systemctl restart bluetooth",
            out: `0: hci0: Bluetooth
	Soft blocked: yes
	Hard blocked: no
(serviço inicia)`,
            outType: "success",
          },
        ]}
      />

      <h2>dmesg — kernel ring buffer</h2>
      <p>
        Quando o problema é hardware (USB não detectada, GPU travou, OOM killer matou
        processo), <code>dmesg</code> tem a resposta antes do journal.
      </p>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo dmesg -T --level=err,warn | tail -10",
            out: `[Sat Apr  5 14:22:01 2026] usb 1-2: device descriptor read/64, error -71
[Sat Apr  5 14:22:02 2026] usb 1-2: device not accepting address 5, error -32
[Sat Apr  5 15:01:11 2026] Out of memory: Killed process 13412 (chromium) total-vm:4187232kB
[Sat Apr  5 15:01:11 2026] oom_reaper: reaped process 13412 (chromium), now anon-rss:0kB
[Sat Apr  5 15:32:54 2026] segfault at 7f3a 1234 ip 00007f3a... in libc.so.6`,
            outType: "warning",
          },
          {
            comment: "tail -f no kernel buffer",
            cmd: "sudo dmesg -wT",
            out: "(fica esperando novas mensagens; plugue um USB e veja aparecer)",
            outType: "muted",
          },
        ]}
      />

      <h2>strace — system calls em tempo real</h2>
      <p>
        Quando um binário falha sem mensagem útil, <code>strace</code> mostra cada syscall
        que ele faz. Você descobre arquivos faltando, permissão negada, conexão falhando,
        em segundos.
      </p>

      <CommandTable
        title="strace cookbook"
        variations={[
          { cmd: "strace ls /tmp", desc: "Trace básico (saída enorme, vai pro stderr).", output: "openat(AT_FDCWD, \"/tmp\", ...) = 3" },
          { cmd: "strace -e openat,read,write ./app", desc: "Filtra syscalls — só I/O.", output: "Reduz drasticamente o ruído." },
          { cmd: "strace -e trace=file ./app", desc: "Atalho para todas syscalls de arquivo.", output: "open, openat, stat, lstat, access..." },
          { cmd: "strace -e trace=network curl https://x.com", desc: "Só syscalls de rede.", output: "socket, connect, sendto, recvfrom..." },
          { cmd: "strace -p 12847", desc: "Anexa em PID já rodando.", output: "Caça travamento de daemon." },
          { cmd: "strace -f -p 12847", desc: "-f segue forks/threads.", output: "Essencial para servidores que forka." },
          { cmd: "strace -c ls /usr/bin", desc: "Sumário ao final: contagem por syscall (-c).", output: "Tabela: % time, calls, errors, syscall" },
          { cmd: "strace -o trace.log ./app", desc: "Saída pra arquivo.", output: "Não polui terminal." },
          { cmd: "strace -tt -T ./app", desc: "Timestamps + duração de cada syscall.", output: "Achar a syscall lenta." },
          { cmd: "strace -y ./app", desc: "Mostra path real de cada FD.", output: "openat(...) = 3</etc/passwd>" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "binário falha silencioso — strace conta o porquê",
            cmd: "./meu-tool",
            out: "Segmentation fault (core dumped)",
            outType: "error",
          },
          {
            cmd: "strace -e trace=file ./meu-tool 2>&1 | grep -E 'ENOENT|EACCES' | head",
            out: `openat(AT_FDCWD, "/etc/meu-tool/config.yaml", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/meu-tool/templates/", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/var/log/meu-tool/", O_RDWR|O_CREAT) = -1 EACCES (Permission denied)`,
            outType: "warning",
          },
          {
            comment: "outra clássica: HTTP request lento — quem é o culpado, DNS ou TCP?",
            cmd: "strace -e trace=network -tt -T curl -s https://google.com -o /dev/null 2>&1 | head -10",
            out: `15:22:01.001234 socket(AF_INET, SOCK_DGRAM|SOCK_NONBLOCK, IPPROTO_IP) = 5 <0.000031>
15:22:01.001456 connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("8.8.8.8")}, 16) = 0 <0.000017>
15:22:01.001543 sendto(5, ..., 28, MSG_NOSIGNAL, NULL, 0) = 28 <0.000051>
15:22:04.523111 recvfrom(5, ..., 1024, 0, ...) = 44 <3.521368>   # 3.5s no DNS = problema`,
            outType: "warning",
          },
        ]}
      />

      <h2>ltrace — chamadas de biblioteca</h2>
      <p>
        Análogo ao strace mas para funções de biblioteca (libc, OpenSSL, etc.). Útil para
        analisar binários onde a lógica está em chamadas de libc, não em syscalls puras.
      </p>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ltrace -e 'strcmp+strncmp+memcmp' ./checa-senha",
            out: `(./checa-senha "admin")
strcmp("admin", "root") = -1
strcmp("admin", "wallyson") = -19
strcmp("admin", "h4xx0r_pass") = -32
+++ exited (status 1) +++

(./checa-senha "h4xx0r_pass")
strcmp("h4xx0r_pass", "root") = 4
strcmp("h4xx0r_pass", "wallyson") = -15
strcmp("h4xx0r_pass", "h4xx0r_pass") = 0   # <- senha correta
+++ exited (status 0) +++`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="ltrace = pwn rápido em CTF">
        <p>
          Em CTFs de binário fácil, <code>ltrace ./bin</code> frequentemente revela a
          flag direto, porque a comparação <code>strcmp(input, "FLAG_REAL")</code> aparece
          no log. Tente sempre antes de abrir Ghidra.
        </p>
      </AlertBox>

      <h2>gdb — quando precisa olhar de verdade</h2>
      <CodeBlock
        language="bash"
        title="gdb cheatsheet mínimo"
        code={`# carregar binário
gdb ./crashbin
# anexar em PID rodando
gdb -p 12847
# rodar com argumentos
(gdb) run --debug input.txt

# breakpoint
(gdb) b main                # quebra no símbolo main
(gdb) b *0x4011a0           # quebra em endereço
(gdb) b auth.c:42           # quebra em arquivo:linha (precisa -g)

# pós-crash
(gdb) bt                    # backtrace (stack do crash)
(gdb) bt full               # backtrace com locals
(gdb) info registers        # rax, rbx, rip, rsp, ...
(gdb) x/20wx $rsp           # examine 20 words em hex no stack
(gdb) x/s 0x404010          # string no endereço
(gdb) disas main            # disassembly da função

# step
(gdb) ni                    # next instruction (não entra em call)
(gdb) si                    # step in (entra em call)
(gdb) c                     # continue
(gdb) finish                # roda até retornar da função

# memória / heap
(gdb) info proc mappings    # mapa de regiões (texto, heap, stack, libs)

# core dump
ulimit -c unlimited         # habilita core
./crashbin                   # crasha, gera core
gdb ./crashbin core         # análise post-mortem`}
      />

      <h2>lsof — quem está usando o quê</h2>
      <CommandTable
        title="lsof — files e sockets"
        variations={[
          { cmd: "sudo lsof -i :8080", desc: "Quem está escutando (ou conectado em) a porta 8080.", output: "node 12847 wallyson 22u IPv4 ... TCP *:8080 (LISTEN)" },
          { cmd: "sudo lsof -i tcp -sTCP:LISTEN", desc: "Todos os listeners TCP.", output: "Lista de daemons + portas." },
          { cmd: "sudo lsof -p 12847", desc: "Tudo aberto pelo PID 12847.", output: "Bibliotecas, FDs, sockets, mmap..." },
          { cmd: "sudo lsof /var/log/auth.log", desc: "Quem abriu este arquivo agora?", output: "Útil pra saber se safe deletar." },
          { cmd: "sudo lsof | grep deleted", desc: "Arquivos APAGADOS mas ainda abertos (consumindo disco invisível).", output: "Mata-fome de espaço escondido." },
          { cmd: "sudo lsof -u www-data", desc: "Tudo aberto pelo usuário.", output: "Bom para auditar processo web." },
          { cmd: "sudo lsof +D /opt/app", desc: "Recursivo dentro de uma pasta.", output: "Quem está mexendo em /opt/app?" },
          { cmd: "sudo lsof -i @10.0.0.5", desc: "Conexões pra/de um IP específico.", output: "Caça beacon de C2." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "df diz disco cheio, du diz que tem espaço — clássico arquivo deletado preso",
            cmd: "df -h /var",
            out: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda3        50G   49G   12M 100% /var`,
            outType: "error",
          },
          {
            cmd: "sudo du -sh /var/* 2>/dev/null | sort -h | tail",
            out: `8.0K    /var/cache
12K     /var/local
124M    /var/log
3.2G    /var/lib`,
            outType: "warning",
          },
          {
            comment: "soma 4G mas df diz 49G — alguém apagou um log enorme com daemon ainda escrevendo",
            cmd: "sudo lsof | grep '(deleted)' | head",
            out: `apache2  3221  www-data  2w  REG  8,3  44973256704  /var/log/apache2/access.log.1 (deleted)`,
            outType: "warning",
          },
          {
            comment: "solução: reiniciar o daemon (libera o FD e o disco)",
            cmd: "sudo systemctl restart apache2 && df -h /var",
            out: `/dev/sda3        50G  3.4G   45G   8% /var`,
            outType: "success",
          },
        ]}
      />

      <h2>systemd-analyze — boot lento?</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "systemd-analyze",
            out: `Startup finished in 4.821s (kernel) + 12.443s (userspace) = 17.265s
graphical.target reached after 12.180s in userspace.`,
            outType: "info",
          },
          {
            cmd: "systemd-analyze blame | head",
            out: `8.221s NetworkManager-wait-online.service
3.142s plymouth-quit-wait.service
1.521s snapd.service
 921ms accounts-daemon.service
 412ms systemd-journal-flush.service
 311ms systemd-logind.service`,
            outType: "warning",
          },
          {
            comment: "NetworkManager-wait-online é o vilão clássico — pode desabilitar",
            cmd: "sudo systemctl disable NetworkManager-wait-online.service",
            out: "Removed symlink /etc/systemd/system/network-online.target.wants/NetworkManager-wait-online.service.",
            outType: "success",
          },
        ]}
      />

      <h2>Checklist mestre: "nada funciona"</h2>
      <CodeBlock
        language="bash"
        title="~/diag.sh — health check de 30 segundos"
        code={`#!/usr/bin/env bash
echo "=== uptime / load ==="
uptime

echo -e "\\n=== memória ==="
free -h

echo -e "\\n=== disco ==="
df -h | grep -vE '^tmpfs|^udev'

echo -e "\\n=== top 5 processos por CPU ==="
ps aux --sort=-%cpu | head -6

echo -e "\\n=== top 5 por memória ==="
ps aux --sort=-%mem | head -6

echo -e "\\n=== serviços falhos ==="
systemctl --failed --no-pager

echo -e "\\n=== últimos erros do kernel ==="
sudo dmesg -T --level=err,warn | tail -10

echo -e "\\n=== conexões TCP estabelecidas ==="
ss -tnp | head -10

echo -e "\\n=== últimas linhas auth.log ==="
sudo tail -5 /var/log/auth.log

echo -e "\\n=== arquivos deleted segurando disco ==="
sudo lsof 2>/dev/null | grep '(deleted)' | head -5

echo -e "\\n=== boot tempo ==="
systemd-analyze`}
      />

      <PracticeBox
        title="Investigue um serviço que não inicia"
        goal="Praticar o fluxo completo: status → journal → strace → solução."
        steps={[
          "Force um erro: edite a config do nginx para apontar para um arquivo que não existe.",
          "Tente reiniciar e veja a falha.",
          "Use journalctl -xeu nginx para a mensagem detalhada.",
          "Se quiser ir mais fundo, rode com strace para ver a syscall que falhou.",
          "Reverta a config e confirme que voltou.",
        ]}
        command={`# induzir falha
sudo sed -i 's|root /var/www/html;|root /naoexiste;|' /etc/nginx/sites-enabled/default
sudo systemctl restart nginx; echo "exit=$?"

# diagnóstico
sudo systemctl status nginx --no-pager | head
sudo journalctl -xeu nginx --no-pager | tail -10

# strace do nginx -t (test config)
sudo strace -e openat -f nginx -t 2>&1 | grep ENOENT | head -3

# fix
sudo sed -i 's|root /naoexiste;|root /var/www/html;|' /etc/nginx/sites-enabled/default
sudo systemctl restart nginx && echo OK`}
        expected={`exit=1
● nginx.service - A high performance web server
     Active: failed (Result: exit-code)
nginx[12999]: nginx: [emerg] open() "/naoexiste" failed (2: No such file or directory)
openat(AT_FDCWD, "/naoexiste", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = -1 ENOENT (No such file or directory)
OK`}
        verify="Você viu (1) o exit code 1, (2) a mensagem 'No such file or directory' no journal e (3) confirmou via strace exatamente qual openat falhou."
      />

      <AlertBox type="info" title="Memorize esta ordem">
        <p>
          1. <code>systemctl status &lt;svc&gt;</code> →{" "}
          2. <code>journalctl -xeu &lt;svc&gt; --no-pager</code> →{" "}
          3. <code>sudo dmesg -T | tail</code> →{" "}
          4. <code>strace -e file &lt;cmd&gt;</code> →{" "}
          5. <code>lsof -p &lt;pid&gt;</code> →{" "}
          6. <code>ss -tnp / df -h / free -h</code>. 90% dos problemas em Linux/Kali são
          resolvidos parando entre 1 e 4.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
