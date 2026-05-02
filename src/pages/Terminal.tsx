import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function TerminalPage() {
  return (
    <PageContainer
      title="Terminal Essencial — mastery de bash no Kali"
      subtitle="Navegação, leitura, busca, pipes, redirecionamento, awk/sed, job control, history, brace expansion, set -euxo. Tudo o que separa um operador júnior de um sênior."
      difficulty="iniciante"
      timeToRead="35 min"
    >
      <AlertBox type="info" title="Esta página assume o básico">
        Se você nunca abriu um terminal, comece em{" "}
        <Link href="/comece-aqui">
          <a className="underline font-semibold text-primary">Comece Aqui</a>
        </Link>
        . Se nunca criou nem editou arquivo no terminal, faça antes{" "}
        <Link href="/primeiros-arquivos">
          <a className="underline font-semibold text-primary">Primeiros Arquivos</a>
        </Link>
        . Aqui aprofundamos pipes, redirecionamento, awk/sed, history e job
        control — <strong>tudo testado em arquivos seus</strong>.
      </AlertBox>

      <h2>bash vs zsh — qual você está rodando?</h2>
      <p>
        O Kali 2020+ vem com <strong>zsh</strong> como shell padrão (com tema
        oh-my-zsh). Quase tudo aqui é compatível com bash, mas algumas
        sintaxes mudam (globs, expansões). Sempre confira em qual está.
      </p>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo $0",
            out: "-zsh",
            outType: "info",
          },
          {
            comment: "verificar shell padrão do usuário",
            cmd: "getent passwd wallyson | cut -d: -f7",
            out: "/usr/bin/zsh",
            outType: "default",
          },
          {
            comment: "shells instalados no sistema",
            cmd: "cat /etc/shells",
            out: `# /etc/shells: valid login shells
/bin/sh
/usr/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/usr/bin/dash
/bin/dash
/usr/bin/zsh
/bin/zsh`,
            outType: "muted",
          },
          {
            comment: "trocar shell em definitivo",
            cmd: "chsh -s /bin/bash wallyson",
            out: "Senha: \nShell alterado.",
            outType: "success",
          },
          {
            comment: "abrir bash dentro do zsh sem trocar default",
            cmd: "bash --version | head -1",
            out: "GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)",
            outType: "info",
          },
        ]}
      />

      <h2>Preparando o laboratório</h2>
      <p>
        Tudo o que vem abaixo usa estes arquivos. Crie agora e mantenha aberto.
      </p>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cd ~ && mkdir -p lab && cd lab",
            out: "(silencioso — você está em /home/wallyson/lab)",
            outType: "muted",
          },
          {
            comment: "criar 4 usuários (alguns repetidos para uniq)",
            cmd: "printf 'kali\\nroot\\nadmin\\nwallyson\\nana.silva\\njoao.lopes\\nana.silva\\nkali\\n' > usuarios.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "cat usuarios.txt",
            out: `kali
root
admin
wallyson
ana.silva
joao.lopes
ana.silva
kali`,
            outType: "default",
          },
          {
            comment: "criar log com heredoc",
            cmd: `cat > log.txt << 'EOF'
2026-04-25 10:00 INFO sistema iniciado
2026-04-25 10:01 INFO usuário kali logou
2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:03 WARN tentativa de login admin de 200.158.42.18
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:05 INFO usuário ana.silva logou de 192.168.1.42
2026-04-25 10:06 WARN brute force detectado de 45.155.205.12
2026-04-25 10:07 ERROR conexão recusada por firewall
2026-04-25 10:08 INFO usuário kali deslogou
EOF`,
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -lh",
            out: `total 8.0K
-rw-r--r-- 1 wallyson wallyson 472 Apr 25 16:30 log.txt
-rw-r--r-- 1 wallyson wallyson  62 Apr 25 16:30 usuarios.txt`,
            outType: "info",
          },
        ]}
      />

      <h2>1. Navegação — sempre saiba onde está</h2>
      <Terminal
        path="~/lab"
        lines={[
          { cmd: "pwd", out: "/home/wallyson/lab", outType: "info" },
          {
            cmd: "ls",
            out: "log.txt  usuarios.txt",
            outType: "default",
          },
          {
            comment: "caminho absoluto",
            cmd: "cd /etc",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "pwd",
            out: "/etc",
            outType: "default",
          },
          {
            comment: "voltar para o diretório anterior",
            cmd: "cd -",
            out: "/home/wallyson/lab",
            outType: "info",
          },
          {
            comment: "subir um nível",
            cmd: "cd .. && pwd",
            out: "/home/wallyson",
            outType: "default",
          },
          {
            comment: "atalho ~ = home; cd sem nada também volta pra home",
            cmd: "cd ~ && pwd",
            out: "/home/wallyson",
            outType: "default",
          },
          {
            cmd: "cd ~/lab",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h3>ls — variações que você vai usar todo dia</h3>
      <CommandTable
        title="ls — flags essenciais"
        variations={[
          { cmd: "ls -l", desc: "Formato longo com permissões, dono, tamanho.", output: "-rw-r--r-- 1 wallyson wallyson 472 Apr 25 16:30 log.txt" },
          { cmd: "ls -la", desc: "Inclui ocultos (.bashrc, .ssh, ...).", output: "drwxr-xr-x 2 wallyson wallyson 4096 Apr 25 16:30 .\ndrwx------ 18 wallyson wallyson 4096 Apr 25 16:30 .." },
          { cmd: "ls -lh", desc: "Tamanhos legíveis (K, M, G).", output: "472   62" },
          { cmd: "ls -lhS", desc: "Ordena por tamanho (maior primeiro).", output: "log.txt  472\nusuarios.txt 62" },
          { cmd: "ls -lt", desc: "Ordena por data de modificação.", output: "Mais novo primeiro." },
          { cmd: "ls -ltr", desc: "Inverte: mais antigo primeiro.", output: "Útil para ver o último arquivo criado por baixo." },
          { cmd: "ls -R /etc/ssh", desc: "Recursivo — entra em subpastas.", output: "/etc/ssh:\nmoduli  ssh_config  sshd_config  ssh_host_rsa_key" },
          { cmd: "ls -ld /etc", desc: "Lista a própria pasta, não o conteúdo.", output: "drwxr-xr-x 142 root root 12288 Apr 25 16:30 /etc" },
          { cmd: "ls -1", desc: "Um arquivo por linha (ideal para pipe).", output: "log.txt\nusuarios.txt" },
          { cmd: "ls -i", desc: "Mostra inode de cada arquivo.", output: "131073 log.txt  131074 usuarios.txt" },
          { cmd: "ls --color=auto -F", desc: "Cor + indicador de tipo (/, *, @).", output: "scripts/  binario*  link@  arquivo" },
        ]}
      />

      <h2>2. Pedindo ajuda — você não precisa decorar nada</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ajuda rápida (resumida)",
            cmd: "ls --help | head -10",
            out: `Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not ignore implied . and ..
      --author               with -l, print the author of each file
  -b, --escape               print C-style escaped nongraphic characters`,
            outType: "info",
          },
          {
            comment: "manual completo (q sai, /palavra busca)",
            cmd: "man grep",
            out: `GREP(1)                    General Commands Manual                   GREP(1)

NAME
       grep - print lines that match patterns

SYNOPSIS
       grep [OPTION...] PATTERNS [FILE...]
       grep [OPTION...] -e PATTERNS ... [FILE...]
[...rola com setas; q para sair]`,
            outType: "muted",
          },
          {
            comment: "tldr — exemplos práticos (instalar uma vez)",
            cmd: "sudo apt install -y tldr && tldr find",
            out: `find
  Find files or directories under the given directory tree, recursively.

  - Find files by extension:
    find {{root_path}} -name '{{*.ext}}'

  - Find files matching multiple path/name patterns:
    find {{root_path}} -path '{{**/path/**/*.ext}}' -or -name '{{*pattern*}}'

  - Find directories matching a given name, in case-insensitive mode:
    find {{root_path}} -type d -iname '{{*lib*}}'`,
            outType: "success",
          },
          {
            comment: "qual binário está sendo executado?",
            cmd: "which grep && type grep",
            out: `/usr/bin/grep
grep is /usr/bin/grep`,
            outType: "default",
          },
        ]}
      />

      <h2>3. Lendo arquivos — cat / less / head / tail</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "cat log.txt",
            out: `2026-04-25 10:00 INFO sistema iniciado
2026-04-25 10:01 INFO usuário kali logou
2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:03 WARN tentativa de login admin de 200.158.42.18
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:05 INFO usuário ana.silva logou de 192.168.1.42
2026-04-25 10:06 WARN brute force detectado de 45.155.205.12
2026-04-25 10:07 ERROR conexão recusada por firewall
2026-04-25 10:08 INFO usuário kali deslogou`,
            outType: "default",
          },
          {
            cmd: "cat -n log.txt | head -3",
            out: `     1  2026-04-25 10:00 INFO sistema iniciado
     2  2026-04-25 10:01 INFO usuário kali logou
     3  2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50`,
            outType: "info",
          },
          {
            comment: "primeiras N",
            cmd: "head -n 2 log.txt",
            out: `2026-04-25 10:00 INFO sistema iniciado
2026-04-25 10:01 INFO usuário kali logou`,
            outType: "default",
          },
          {
            comment: "últimas N",
            cmd: "tail -n 2 log.txt",
            out: `2026-04-25 10:07 ERROR conexão recusada por firewall
2026-04-25 10:08 INFO usuário kali deslogou`,
            outType: "default",
          },
          {
            comment: "tail -f acompanha em tempo real (Ctrl+C sai)",
            cmd: "tail -f /var/log/auth.log",
            out: `Apr 25 16:42:01 kali sshd[4421]: Failed password for root from 45.155.205.12 port 5142 ssh2
Apr 25 16:42:08 kali sshd[4421]: Failed password for root from 45.155.205.12 port 5143 ssh2
Apr 25 16:42:15 kali sshd[4421]: Failed password for ana.silva from 200.158.42.18 port 49214 ssh2
^C`,
            outType: "warning",
          },
          {
            comment: "less — paginado, navegável",
            cmd: "less log.txt",
            out: `(↑/↓ rola, espaço avança página, /ERROR busca, n próximo, q sai)`,
            outType: "muted",
          },
        ]}
      />

      <h2>4. Buscando — find e grep</h2>

      <h3>find — encontrar arquivos por critério</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "por nome (aspas evitam expansão pelo shell)",
            cmd: "find ~ -name '*.txt' 2>/dev/null",
            out: `/home/wallyson/lab/log.txt
/home/wallyson/lab/usuarios.txt
/home/wallyson/Documents/notas.txt`,
            outType: "info",
          },
          {
            comment: "case insensitive",
            cmd: "find /etc -iname 'PASSWORD*' 2>/dev/null",
            out: `/etc/pam.d/passwd
/etc/passwd
/etc/passwd-`,
            outType: "default",
          },
          {
            comment: "por tipo: f=arquivo, d=diretório, l=link",
            cmd: "find /etc -type d -name 'ssh*' 2>/dev/null",
            out: `/etc/ssh
/etc/ssh/sshd_config.d`,
            outType: "default",
          },
          {
            comment: "SUID — vital em escalação de privilégio",
            cmd: "find / -perm -4000 -type f 2>/dev/null | head -10",
            out: `/usr/bin/sudo
/usr/bin/su
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/mount
/usr/bin/umount
/usr/bin/pkexec
/usr/bin/newgrp
/usr/bin/gpasswd`,
            outType: "warning",
          },
          {
            comment: "modificados nas últimas 24h",
            cmd: "find /var/log -mtime -1 -type f 2>/dev/null | head -5",
            out: `/var/log/auth.log
/var/log/syslog
/var/log/kern.log
/var/log/daemon.log
/var/log/apache2/access.log`,
            outType: "info",
          },
          {
            comment: "por tamanho",
            cmd: "find ~ -size +10M 2>/dev/null",
            out: `/home/wallyson/Downloads/kali-linux-2026.1-installer.iso
/home/wallyson/.cache/mozilla/firefox/abc.profile/cache2/entries/0E3A7B.bin`,
            outType: "default",
          },
          {
            comment: "-exec executa comando em cada resultado ({} = nome)",
            cmd: "find ~/lab -name '*.txt' -exec wc -l {} \\;",
            out: `9 /home/wallyson/lab/log.txt
8 /home/wallyson/lab/usuarios.txt`,
            outType: "info",
          },
          {
            comment: "+ é mais eficiente que ; (passa todos juntos)",
            cmd: "find ~/lab -name '*.txt' -exec wc -l {} +",
            out: ` 9 /home/wallyson/lab/log.txt
 8 /home/wallyson/lab/usuarios.txt
17 total`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="find — flags essenciais"
        variations={[
          { cmd: "-name 'padrão'", desc: "Por nome com wildcards.", output: "find / -name '*.php'" },
          { cmd: "-iname 'padrão'", desc: "Como -name, ignora caixa.", output: "find / -iname 'PASSWORD*'" },
          { cmd: "-type X", desc: "f=arquivo, d=dir, l=link, b=block.", output: "find /etc -type f" },
          { cmd: "-perm -4000", desc: "SUID — busca binários executáveis como root.", output: "/usr/bin/sudo, /usr/bin/passwd" },
          { cmd: "-perm -2000", desc: "SGID — executa com grupo dono.", output: "/usr/bin/wall" },
          { cmd: "-user nome", desc: "Arquivos de um usuário específico.", output: "find / -user wallyson" },
          { cmd: "-group nome", desc: "Arquivos de um grupo.", output: "find /var -group www-data" },
          { cmd: "-size +N[ckMG]", desc: "Maiores (+) ou menores (-) que N.", output: "find / -size +100M" },
          { cmd: "-mtime ±N", desc: "Modificados há N dias.", output: "find /var -mtime -1" },
          { cmd: "-exec CMD {} \\;", desc: "Executa CMD em cada resultado.", output: "find . -name '*.bak' -exec rm {} \\;" },
          { cmd: "-exec CMD {} +", desc: "Mesmo, mas todos em um exec só.", output: "Mais eficiente." },
          { cmd: "2>/dev/null", desc: "Joga 'permission denied' fora.", output: "Limpa a saída." },
        ]}
      />

      <h3>grep — buscar dentro do conteúdo</h3>
      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "grep ERROR log.txt",
            out: `2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "warning",
          },
          {
            comment: "ignorar caixa + número da linha",
            cmd: "grep -in 'error' log.txt",
            out: `3:2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
5:2026-04-25 10:04 ERROR timeout na API externa
8:2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "info",
          },
          {
            comment: "inverter — o que NÃO bate",
            cmd: "grep -v INFO log.txt",
            out: `2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:03 WARN tentativa de login admin de 200.158.42.18
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:06 WARN brute force detectado de 45.155.205.12
2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "default",
          },
          {
            comment: "regex extendida (ERE)",
            cmd: "grep -E 'ERROR|WARN' log.txt | wc -l",
            out: "5",
            outType: "info",
          },
          {
            comment: "PCRE (Perl) — lookahead, \\d, \\w, etc.",
            cmd: "grep -P '\\b(\\d{1,3}\\.){3}\\d{1,3}\\b' log.txt -o",
            out: `192.168.1.50
200.158.42.18
192.168.1.42
45.155.205.12`,
            outType: "warning",
          },
          {
            comment: "contexto: 1 linha antes e depois do match",
            cmd: "grep -C 1 brute log.txt",
            out: `2026-04-25 10:05 INFO usuário ana.silva logou de 192.168.1.42
2026-04-25 10:06 WARN brute force detectado de 45.155.205.12
2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "info",
          },
          {
            comment: "recursivo em pasta",
            cmd: "grep -rn 'kali' /etc/ 2>/dev/null | head -3",
            out: `/etc/hosts:1:127.0.0.1\tlocalhost kali
/etc/hostname:1:kali
/etc/issue:1:Kali GNU/Linux Rolling \\n \\l`,
            outType: "default",
          },
          {
            comment: "só nomes de arquivos que batem",
            cmd: "grep -rl 'wallyson' ~ 2>/dev/null | head -5",
            out: `/home/wallyson/.bashrc
/home/wallyson/.zshrc
/home/wallyson/.gitconfig
/home/wallyson/lab/usuarios.txt`,
            outType: "default",
          },
        ]}
      />

      <CommandTable
        title="grep — flags essenciais"
        variations={[
          { cmd: "-i", desc: "Ignora maiúsculas/minúsculas.", output: "grep -i error" },
          { cmd: "-n", desc: "Mostra número da linha.", output: "3:2026-04-25..." },
          { cmd: "-v", desc: "Inverte: linhas que NÃO batem.", output: "Útil para filtrar ruído." },
          { cmd: "-r / -R", desc: "Recursivo (R segue links).", output: "grep -r 'TODO' ./src" },
          { cmd: "-l", desc: "Só nomes de arquivos com match.", output: "Para alimentar outra ferramenta." },
          { cmd: "-c", desc: "Conta linhas que batem.", output: "grep -c ERROR log.txt → 3" },
          { cmd: "-E", desc: "Regex extendida (|, +, ? sem escape).", output: "grep -E 'foo|bar'" },
          { cmd: "-P", desc: "PCRE — \\d, \\w, lookahead.", output: "grep -P '\\d{4}'" },
          { cmd: "-o", desc: "Só a parte que casou (não a linha toda).", output: "Ideal para extrair IPs/emails." },
          { cmd: "-A N / -B N / -C N", desc: "N linhas Antes/Depois/Cercando.", output: "grep -C 2 ERROR log.txt" },
          { cmd: "-w", desc: "Match de palavra inteira.", output: "grep -w ana (não casa anabela)" },
          { cmd: "--color=auto", desc: "Destaca match em cor.", output: "Padrão no Kali via alias." },
        ]}
      />

      <h2>5. Redirecionamento — &gt;, &gt;&gt;, 2&gt;, &amp;&gt;, &lt;</h2>
      <p>
        Cada processo tem 3 streams: <code>stdin</code> (0),{" "}
        <code>stdout</code> (1), <code>stderr</code> (2). Você pode redirecionar
        cada um separadamente.
      </p>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "> sobrescreve stdout para arquivo",
            cmd: "ls > lista.txt && cat lista.txt",
            out: `lista.txt
log.txt
usuarios.txt`,
            outType: "default",
          },
          {
            comment: ">> append (sem apagar)",
            cmd: "echo 'fim do dia' >> lista.txt && tail -1 lista.txt",
            out: "fim do dia",
            outType: "info",
          },
          {
            comment: "2> redireciona SÓ stderr",
            cmd: "find / -name x 2> erros.txt | head -3",
            out: `(stdout vazio na tela)
(stderr foi para erros.txt)`,
            outType: "muted",
          },
          {
            cmd: "head -3 erros.txt",
            out: `find: '/proc/1/task/1/fd/6': Permission denied
find: '/proc/1/task/1/fdinfo/6': Permission denied
find: '/root': Permission denied`,
            outType: "warning",
          },
          {
            comment: "2>/dev/null joga erros fora",
            cmd: "find /etc -name shadow 2>/dev/null",
            out: `/etc/pam.d/shadow
/etc/shadow`,
            outType: "default",
          },
          {
            comment: "&> manda stdout E stderr para o mesmo arquivo (bash)",
            cmd: "find /etc -name shadow &> tudo.log && wc -l tudo.log",
            out: "2 tudo.log",
            outType: "info",
          },
          {
            comment: "equivalente POSIX: > arq 2>&1",
            cmd: "find /etc -name shadow > tudo.log 2>&1",
            out: "(igual ao anterior, funciona em qualquer shell)",
            outType: "muted",
          },
          {
            comment: "< usa arquivo como entrada de comando",
            cmd: "wc -l < log.txt",
            out: "9",
            outType: "info",
          },
          {
            comment: "tee — mostra na tela E salva no arquivo",
            cmd: "ls -la | tee saida.txt | head -3",
            out: `total 24
drwxr-xr-x 2 wallyson wallyson 4096 Apr 25 16:30 .
drwx------ 18 wallyson wallyson 4096 Apr 25 16:30 ..`,
            outType: "default",
          },
          {
            comment: "tee -a faz append em vez de sobrescrever",
            cmd: "echo 'novo' | sudo tee -a /etc/motd",
            out: "novo\n(append em arquivo que precisa de root)",
            outType: "warning",
          },
          {
            comment: "/dev/null = lixeira; descarta tudo",
            cmd: "comando_que_polui_a_tela > /dev/null 2>&1",
            out: "(silêncio total. Útil em scripts e cron)",
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Operadores de redirecionamento"
        variations={[
          { cmd: "comando > arq", desc: "stdout para arq (sobrescreve).", output: "ls > lista.txt" },
          { cmd: "comando >> arq", desc: "stdout para arq (append).", output: "echo x >> log.txt" },
          { cmd: "comando 2> arq", desc: "stderr para arq.", output: "find / 2> erros.txt" },
          { cmd: "comando 2>&1", desc: "stderr → onde stdout estiver indo.", output: "cmd > all.txt 2>&1" },
          { cmd: "comando &> arq", desc: "stdout + stderr juntos (bash/zsh).", output: "make &> build.log" },
          { cmd: "comando < arq", desc: "arq como stdin.", output: "wc -l < log.txt" },
          { cmd: "comando << EOF ... EOF", desc: "Heredoc — input multilinha inline.", output: "cat << EOF\\nlinha1\\nEOF" },
          { cmd: "cmd1 | cmd2", desc: "stdout do cmd1 vira stdin do cmd2.", output: "ls | grep foo" },
          { cmd: "cmd1 |& cmd2", desc: "stdout+stderr para cmd2.", output: "make |& less" },
          { cmd: "cmd | tee arq", desc: "Pipe + salva.", output: "ls | tee saida.txt" },
          { cmd: "> /dev/null 2>&1", desc: "Descarta tudo.", output: "Em cron, scripts." },
        ]}
      />

      <h2>6. Pipes — combinando comandos pequenos</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "quantas linhas no log?",
            cmd: "cat log.txt | wc -l",
            out: "9",
            outType: "info",
          },
          {
            comment: "sem cat (UUOC) — wc lê direto",
            cmd: "wc -l log.txt",
            out: "9 log.txt",
            outType: "muted",
          },
          {
            comment: "usuários únicos do arquivo",
            cmd: "sort usuarios.txt | uniq",
            out: `admin
ana.silva
joao.lopes
kali
root
wallyson`,
            outType: "default",
          },
          {
            comment: "com contagem",
            cmd: "sort usuarios.txt | uniq -c | sort -rn",
            out: `      2 kali
      2 ana.silva
      1 wallyson
      1 root
      1 joao.lopes
      1 admin`,
            outType: "info",
          },
          {
            comment: "top 3 IPs no log (extrai com grep -P)",
            cmd: "grep -oP '\\b(\\d{1,3}\\.){3}\\d{1,3}\\b' log.txt | sort | uniq -c | sort -rn | head -3",
            out: `      1 45.155.205.12
      1 200.158.42.18
      1 192.168.1.50`,
            outType: "warning",
          },
          {
            comment: "contar processos por usuário",
            cmd: "ps aux | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn | head -5",
            out: `     142 wallyson
      48 root
      12 systemd+
       8 messagebus
       4 _laurel`,
            outType: "info",
          },
        ]}
      />

      <h2>7. Command substitution — $(...) e backticks</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "$(comando) coloca a saída no lugar",
            cmd: 'echo "hoje é $(date +%Y-%m-%d)"',
            out: "hoje é 2026-04-25",
            outType: "info",
          },
          {
            comment: "criar diretório com data no nome",
            cmd: "mkdir backup-$(date +%Y%m%d-%H%M)",
            out: "(silencioso — criou backup-20260425-1633)",
            outType: "muted",
          },
          {
            cmd: "ls -d backup-*",
            out: "backup-20260425-1633",
            outType: "default",
          },
          {
            comment: "salvar saída em variável",
            cmd: 'IP=$(curl -s ifconfig.io) && echo "Meu IP: $IP"',
            out: "Meu IP: 187.84.42.108",
            outType: "info",
          },
          {
            comment: "encadear: quantos arquivos .conf existem?",
            cmd: 'echo "Total: $(find /etc -name \'*.conf\' 2>/dev/null | wc -l) arquivos .conf"',
            out: "Total: 421 arquivos .conf",
            outType: "default",
          },
          {
            comment: "backticks — sintaxe antiga (evite, não aninha bem)",
            cmd: "echo `whoami`",
            out: "wallyson",
            outType: "muted",
          },
          {
            comment: "$(()) é aritmética inteira",
            cmd: "echo $((10 * 24 * 3600))",
            out: "864000",
            outType: "info",
          },
        ]}
      />

      <h2>8. xargs — quando -exec não basta</h2>
      <p>
        <code>xargs</code> pega entrada de pipe e transforma em argumentos de
        comando. Indispensável quando a ferramenta não lê stdin.
      </p>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "ls não lê stdin — xargs resolve",
            cmd: "find . -name '*.txt' | xargs ls -lh",
            out: `-rw-r--r-- 1 wallyson wallyson  62 Apr 25 16:30 ./usuarios.txt
-rw-r--r-- 1 wallyson wallyson 472 Apr 25 16:30 ./log.txt
-rw-r--r-- 1 wallyson wallyson  35 Apr 25 16:33 ./lista.txt`,
            outType: "default",
          },
          {
            comment: "-I {} permite usar nome do arquivo no meio",
            cmd: 'find . -name "*.txt" | xargs -I {} cp {} {}.bak',
            out: "(criou .txt.bak para cada .txt)",
            outType: "muted",
          },
          {
            cmd: "ls *.bak",
            out: "lista.txt.bak  log.txt.bak  usuarios.txt.bak",
            outType: "info",
          },
          {
            comment: "-print0 + xargs -0 lida com espaços/quebras nos nomes",
            cmd: "find . -name '*.bak' -print0 | xargs -0 rm -v",
            out: `removed './lista.txt.bak'
removed './log.txt.bak'
removed './usuarios.txt.bak'`,
            outType: "warning",
          },
          {
            comment: "-P 4 paraleliza em 4 processos",
            cmd: "cat dominios.txt | xargs -P 4 -I {} curl -s -o /dev/null -w '%{http_code} {}\\n' https://{}",
            out: `200 google.com
200 github.com
404 dominio-morto.com.br
301 cnn.com`,
            outType: "info",
          },
          {
            comment: "-n 1 → 1 argumento por chamada",
            cmd: "echo 'a b c d' | xargs -n 1 echo 'item:'",
            out: `item: a
item: b
item: c
item: d`,
            outType: "default",
          },
        ]}
      />

      <h2>9. cut, sort, uniq, wc, tr — manipulação rápida</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "cut — pegar colunas. -d separador, -f campos",
            cmd: "cut -d: -f1,7 /etc/passwd | head -5",
            out: `root:/bin/bash
daemon:/usr/sbin/nologin
bin:/usr/sbin/nologin
sys:/usr/sbin/nologin
sync:/bin/sync`,
            outType: "default",
          },
          {
            comment: "cut por caractere",
            cmd: "echo 'abcdef' | cut -c2-4",
            out: "bcd",
            outType: "info",
          },
          {
            comment: "sort com várias chaves",
            cmd: "sort -t: -k3 -n /etc/passwd | head -3",
            out: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin`,
            outType: "default",
          },
          {
            comment: "uniq SÓ funciona em arquivo já ORDENADO",
            cmd: "sort usuarios.txt | uniq -d",
            out: `ana.silva
kali`,
            outType: "warning",
          },
          {
            comment: "wc — linhas, palavras, bytes",
            cmd: "wc log.txt",
            out: "  9  72 472 log.txt",
            outType: "info",
          },
          {
            comment: "tr — substituir/remover caracteres",
            cmd: "echo 'Pentest no Kali' | tr 'a-z' 'A-Z'",
            out: "PENTEST NO KALI",
            outType: "default",
          },
          {
            cmd: "echo 'a-b-c-d' | tr '-' '\\n'",
            out: `a
b
c
d`,
            outType: "default",
          },
          {
            comment: "remover caracteres",
            cmd: 'echo "telefone (11) 98765-4321" | tr -d "() -"',
            out: "telefone1198765432",
            outType: "info",
          },
        ]}
      />

      <h2>10. awk — processar colunas com lógica</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "imprimir 1ª coluna",
            cmd: "awk '{print $1}' log.txt | head -3",
            out: `2026-04-25
2026-04-25
2026-04-25`,
            outType: "default",
          },
          {
            comment: "múltiplas colunas com separador",
            cmd: 'awk \'{print $3, "|", $5}\' log.txt | head -3',
            out: `INFO | sistema
INFO | usuário
ERROR | falha`,
            outType: "info",
          },
          {
            comment: "filtrar por condição (linhas com ERROR)",
            cmd: 'awk \'$3=="ERROR" {print $0}\' log.txt',
            out: `2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "warning",
          },
          {
            comment: "separador customizado (-F:)",
            cmd: "awk -F: '$3<10 {print $1, $3}' /etc/passwd",
            out: `root 0
daemon 1
bin 2
sys 3
sync 4
games 5
man 6
lp 7`,
            outType: "default",
          },
          {
            comment: "BEGIN, END e contadores",
            cmd: "awk 'BEGIN{n=0} /ERROR/ {n++} END{print \"Total ERROR:\", n}' log.txt",
            out: "Total ERROR: 3",
            outType: "success",
          },
          {
            comment: "soma valores de uma coluna",
            cmd: 'ls -l | awk \'NR>1 {soma+=$5} END {print "Total:", soma, "bytes"}\'',
            out: "Total: 4710 bytes",
            outType: "info",
          },
          {
            comment: "associative array — agrupar e contar",
            cmd: "awk '{count[$3]++} END {for (k in count) print count[k], k}' log.txt | sort -rn",
            out: `      4 INFO
      3 ERROR
      2 WARN`,
            outType: "success",
          },
        ]}
      />

      <h2>11. sed — substituição em texto</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "substituir 1ª ocorrência por linha",
            cmd: "sed 's/ERROR/FALHA/' log.txt | grep FALHA",
            out: `2026-04-25 10:02 FALHA falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:04 FALHA timeout na API externa
2026-04-25 10:07 FALHA conexão recusada por firewall`,
            outType: "info",
          },
          {
            comment: "/g = global (todas as ocorrências da linha)",
            cmd: "echo 'aaa-bbb-aaa' | sed 's/a/X/g'",
            out: "XXX-bbb-XXX",
            outType: "default",
          },
          {
            comment: "case insensitive",
            cmd: "echo 'Hello WORLD' | sed 's/world/Kali/gi'",
            out: "Hello Kali",
            outType: "info",
          },
          {
            comment: "-i SALVA no arquivo (CUIDADO — sempre com .bak)",
            cmd: "sed -i.bak 's/INFO/OK/g' log.txt && grep OK log.txt | head -2",
            out: `2026-04-25 10:00 OK sistema iniciado
2026-04-25 10:01 OK usuário kali logou`,
            outType: "warning",
          },
          {
            cmd: "ls log.txt*",
            out: "log.txt  log.txt.bak",
            outType: "muted",
          },
          {
            comment: "restaurar do .bak",
            cmd: "mv log.txt.bak log.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "deletar linhas (d)",
            cmd: "sed '/INFO/d' log.txt",
            out: `2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:03 WARN tentativa de login admin de 200.158.42.18
2026-04-25 10:04 ERROR timeout na API externa
2026-04-25 10:06 WARN brute force detectado de 45.155.205.12
2026-04-25 10:07 ERROR conexão recusada por firewall`,
            outType: "default",
          },
          {
            comment: "imprimir só linhas 2-4",
            cmd: "sed -n '2,4p' log.txt",
            out: `2026-04-25 10:01 INFO usuário kali logou
2026-04-25 10:02 ERROR falha ao conectar banco mysql://192.168.1.50
2026-04-25 10:03 WARN tentativa de login admin de 200.158.42.18`,
            outType: "info",
          },
          {
            comment: "regex captura: troca data por DD/MM/YYYY",
            cmd: "sed -E 's|^([0-9]{4})-([0-9]{2})-([0-9]{2})|\\3/\\2/\\1|' log.txt | head -2",
            out: `25/04/2026 10:00 INFO sistema iniciado
25/04/2026 10:01 INFO usuário kali logou`,
            outType: "success",
          },
        ]}
      />

      <h2>12. Brace expansion — geração rápida no shell</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "lista literal",
            cmd: "echo arquivo_{1,2,3}.txt",
            out: "arquivo_1.txt arquivo_2.txt arquivo_3.txt",
            outType: "info",
          },
          {
            comment: "range numérico",
            cmd: "echo {1..5}",
            out: "1 2 3 4 5",
            outType: "default",
          },
          {
            comment: "range com passo",
            cmd: "echo {0..20..5}",
            out: "0 5 10 15 20",
            outType: "default",
          },
          {
            comment: "range alfabético",
            cmd: "echo {a..e}",
            out: "a b c d e",
            outType: "default",
          },
          {
            comment: "criar 5 pastas de uma vez",
            cmd: "mkdir -p projeto/{src,docs,tests,bin,assets}",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls projeto",
            out: "assets  bin  docs  src  tests",
            outType: "info",
          },
          {
            comment: "backup rápido com {,.bak}",
            cmd: "cp /etc/hosts{,.bak} 2>&1 || sudo cp /etc/hosts{,.bak}",
            out: "(equivale a: cp /etc/hosts /etc/hosts.bak)",
            outType: "muted",
          },
          {
            comment: "varredura de portas/IPs com brace",
            cmd: "for ip in 192.168.1.{1..5}; do ping -c1 -W1 $ip &>/dev/null && echo \"$ip up\"; done",
            out: `192.168.1.1 up
192.168.1.2 up
192.168.1.5 up`,
            outType: "success",
          },
          {
            comment: "produto cartesiano (combina)",
            cmd: "echo {dev,prod}-{web,db}.empresa.com.br",
            out: "dev-web.empresa.com.br dev-db.empresa.com.br prod-web.empresa.com.br prod-db.empresa.com.br",
            outType: "warning",
          },
        ]}
      />

      <h2>13. Glob patterns — wildcards do shell</h2>
      <CommandTable
        title="Padrões glob (interpretados pelo shell ANTES do comando rodar)"
        variations={[
          { cmd: "*", desc: "Qualquer sequência (não . inicial).", output: "ls *.txt" },
          { cmd: "?", desc: "Exatamente 1 caractere.", output: "ls log?.txt → log1, logA" },
          { cmd: "[abc]", desc: "Um caractere do conjunto.", output: "ls log[12].txt" },
          { cmd: "[!abc]", desc: "Negação — qualquer EXCETO.", output: "ls [!.]*  (sem ocultos)" },
          { cmd: "[a-z]", desc: "Range.", output: "ls [a-c]*.txt" },
          { cmd: "{a,b,c}", desc: "Brace expansion (não é glob, mas combina).", output: "ls *.{txt,log}" },
          { cmd: "** (globstar)", desc: "Recursivo. Precisa shopt -s globstar (bash) / setopt globstarshort (zsh).", output: "ls **/*.txt" },
          { cmd: ".*", desc: "Só ocultos.", output: "ls -d .*" },
        ]}
      />

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "ls *.txt",
            out: "lista.txt  log.txt  usuarios.txt",
            outType: "default",
          },
          {
            cmd: "ls [lu]*.txt",
            out: "lista.txt  log.txt  usuarios.txt",
            outType: "info",
          },
          {
            comment: "habilitar globstar e usar **",
            cmd: "shopt -s globstar && ls -d ~/lab/**/*.txt 2>/dev/null",
            out: `/home/wallyson/lab/lista.txt
/home/wallyson/lab/log.txt
/home/wallyson/lab/usuarios.txt`,
            outType: "success",
          },
        ]}
      />

      <h2>14. History — !! e Ctrl+R são ouro</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "history | tail -5",
            out: ` 1042  ls -la
 1043  cat log.txt
 1044  grep ERROR log.txt
 1045  ps aux | grep nginx
 1046  history | tail -5`,
            outType: "default",
          },
          {
            comment: "!! repete o último comando",
            cmd: "!!",
            out: `history | tail -5
 1042  ls -la
 1043  cat log.txt
 [...]`,
            outType: "info",
          },
          {
            comment: "sudo !! — repete com sudo (comum esquecer sudo)",
            cmd: "apt update",
            out: "Reading package lists... E: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)",
            outType: "error",
          },
          {
            cmd: "sudo !!",
            out: `sudo apt update
[sudo] senha para wallyson: 
Hit:1 http://kali.download/kali kali-rolling InRelease`,
            outType: "success",
          },
          {
            comment: "!N executa o comando N do histórico",
            cmd: "!1043",
            out: "cat log.txt\n(executa de novo)",
            outType: "muted",
          },
          {
            comment: "!cat — último comando que começou com 'cat'",
            cmd: "!cat",
            out: "cat log.txt",
            outType: "info",
          },
          {
            comment: "!$ = último argumento do comando anterior",
            cmd: "ls -la /etc/ssh/sshd_config && cat !$",
            out: "cat /etc/ssh/sshd_config",
            outType: "default",
          },
          {
            comment: "Ctrl+R busca interativa no histórico",
            cmd: "(aperte Ctrl+R, digite 'grep')",
            out: "(reverse-i-search)`grep`: grep ERROR log.txt",
            outType: "muted",
          },
        ]}
      />

      <h2>15. Job control — fg, bg, jobs, &amp;</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            comment: "& joga em background",
            cmd: "sleep 100 &",
            out: "[1] 12421",
            outType: "info",
          },
          {
            cmd: "sleep 200 &",
            out: "[2] 12422",
            outType: "info",
          },
          {
            cmd: "jobs",
            out: `[1]-  Running                 sleep 100 &
[2]+  Running                 sleep 200 &`,
            outType: "default",
          },
          {
            comment: "fg %2 traz o job 2 pra frente",
            cmd: "fg %2",
            out: "sleep 200\n^Z\n[2]+  Stopped                 sleep 200",
            outType: "warning",
          },
          {
            comment: "Ctrl+Z suspende processo em foreground",
            cmd: "(processo está STOPPED)",
            out: "(use bg para rodar em background, ou fg para retomar)",
            outType: "muted",
          },
          {
            comment: "bg %2 retoma em background",
            cmd: "bg %2",
            out: "[2]+ sleep 200 &",
            outType: "success",
          },
          {
            comment: "matar job",
            cmd: "kill %1",
            out: "[1]-  Terminated              sleep 100",
            outType: "warning",
          },
          {
            comment: "disown — desconecta job da shell (não morre ao logout)",
            cmd: "disown -h %2",
            out: "(silencioso — job continua mesmo se você fechar terminal)",
            outType: "info",
          },
          {
            comment: "nohup — alternativa: roda imune a SIGHUP",
            cmd: "nohup ./script_longo.sh &> out.log &",
            out: `[1] 12525
nohup: redirecting stderr to stdout`,
            outType: "default",
          },
        ]}
      />

      <h2>16. Processos — ps, top, htop, kill</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ps aux | head -5",
            out: `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 168432 12244 ?        Ss   16:00   0:01 /sbin/init splash
root           2  0.0  0.0      0     0 ?        S    16:00   0:00 [kthreadd]
wallyson    1421  1.2  3.4 894212 138224 ?       Sl   16:01   0:42 /usr/lib/firefox/firefox
wallyson    1842  0.4  1.1 142884 44120 pts/0    Ss   16:14   0:02 zsh`,
            outType: "default",
          },
          {
            comment: "filtrar por nome",
            cmd: "ps aux | grep -i firefox | grep -v grep",
            out: `wallyson    1421  1.2  3.4 894212 138224 ?  Sl  16:01  0:42 /usr/lib/firefox/firefox
wallyson    1488  0.6  2.1 612442  88122 ?  Sl  16:01  0:18 /usr/lib/firefox/firefox -contentproc -childID 1`,
            outType: "info",
          },
          {
            comment: "tree — árvore de processos",
            cmd: "pstree -p wallyson | head -8",
            out: `zsh(1842)─┬─firefox(1421)─┬─Web Content(1488)
          │                ├─Web Content(1502)
          │                └─{firefox}(1422)
          ├─pstree(12701)
          └─tmux(2814)─┬─zsh(2815)
                      └─zsh(2890)`,
            outType: "default",
          },
          {
            comment: "matar — TERM (15) é gentil; KILL (9) é forçado",
            cmd: "kill 12525",
            out: "(envia SIGTERM — processo pode limpar e sair)",
            outType: "muted",
          },
          {
            cmd: "kill -9 12525",
            out: "(envia SIGKILL — kernel mata na hora)",
            outType: "warning",
          },
          {
            cmd: "killall firefox",
            out: "(mata todos chamados firefox)",
            outType: "warning",
          },
          {
            cmd: "pkill -f 'python script_longo.py'",
            out: "(mata por linha de comando completa)",
            outType: "info",
          },
        ]}
      />

      <h2>17. trap — capturar sinais em scripts</h2>
      <CodeBlock
        language="bash"
        title="cleanup.sh — usar trap para limpar ao sair"
        code={`#!/bin/bash
set -euo pipefail

TMP=$(mktemp -d)
echo "[+] dir temporário: $TMP"

# trap roda ANTES de sair, mesmo se Ctrl+C
cleanup() {
  echo "[!] limpando $TMP"
  rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

# trabalho real
cp -r /etc/ssh "$TMP/"
sleep 30   # se você der Ctrl+C aqui, cleanup roda
echo "[ok] terminou"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "bash cleanup.sh",
            out: `[+] dir temporário: /tmp/tmp.aBcD123
^C
[!] limpando /tmp/tmp.aBcD123`,
            outType: "info",
          },
        ]}
      />

      <h2>18. set -euxo pipefail — modo paranóico em scripts</h2>
      <CommandTable
        title="Flags do set para bash defensivo"
        variations={[
          { cmd: "set -e", desc: "Sai do script no primeiro erro (exit code != 0).", output: "Sem isso, scripts continuam após falhas silenciosas." },
          { cmd: "set -u", desc: "Erro se usar variável não definida.", output: "Pega typos: $USRER → erro em vez de string vazia." },
          { cmd: "set -x", desc: "Ecoa cada comando antes de rodar (debug).", output: "+ ls /tmp\n+ grep foo arquivo.txt" },
          { cmd: "set -o pipefail", desc: "Falha do pipe inteiro se QUALQUER etapa falhar.", output: "Sem isso, só o último comando importa." },
          { cmd: "set -euxo pipefail", desc: "Combo padrão para script de produção.", output: "Sempre na primeira linha após shebang." },
          { cmd: "set +x", desc: "Desliga o que -x ligou.", output: "Use ao redor de blocos sensíveis (senhas)." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "bash -c 'set -e; falso_comando; echo nunca'",
            out: `bash: line 1: falso_comando: command not found`,
            outType: "error",
          },
          {
            cmd: "bash -c 'set -u; echo $NAO_DEFINIDA'",
            out: `bash: NAO_DEFINIDA: unbound variable`,
            outType: "error",
          },
          {
            comment: "sem pipefail — exit é 0 mesmo com falha no meio do pipe",
            cmd: "bash -c 'falso_comando | grep x; echo \"exit=$?\"'",
            out: `bash: falso_comando: command not found
exit=0`,
            outType: "warning",
          },
          {
            comment: "com pipefail — exit reflete a falha",
            cmd: "bash -c 'set -o pipefail; falso_comando | grep x; echo \"exit=$?\"'",
            out: `bash: falso_comando: command not found
exit=127`,
            outType: "success",
          },
        ]}
      />

      <h2>19. Atalhos do terminal — economize horas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-6">
        {[
          ["Tab", "Autocompletar nome de arquivo/comando"],
          ["Tab Tab", "Mostrar todas as opções possíveis"],
          ["↑ / ↓", "Navegar pelo histórico"],
          ["Ctrl + R", "Buscar no histórico (interativo)"],
          ["Ctrl + C", "Cancelar comando em execução"],
          ["Ctrl + Z", "Suspender (volte com fg, mande pro fundo com bg)"],
          ["Ctrl + D", "EOF / fechar terminal / logout"],
          ["Ctrl + L", "Limpar a tela (igual a clear)"],
          ["Ctrl + A", "Cursor para o início da linha"],
          ["Ctrl + E", "Cursor para o fim da linha"],
          ["Ctrl + U", "Apagar do cursor até o início"],
          ["Ctrl + K", "Apagar do cursor até o fim"],
          ["Ctrl + W", "Apagar palavra anterior"],
          ["Alt + .", "Cola último argumento do comando anterior"],
          ["!!", "Repete último comando"],
          ["sudo !!", "Repete último comando com sudo"],
          ["!nmap", "Repete último comando que começou com nmap"],
          ["!$", "Último argumento do comando anterior"],
        ].map(([key, action], i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm bg-card border border-border rounded-lg p-2"
          >
            <code className="px-2 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs whitespace-nowrap">
              {key}
            </code>
            <span className="text-muted-foreground text-xs">{action}</span>
          </div>
        ))}
      </div>

      <h2>20. Limpando — sempre desfaça depois</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cd ~ && rm -rf lab projeto backup-* tudo.log erros.txt",
            out: "(silencioso — removeu tudo do lab)",
            outType: "muted",
          },
          {
            cmd: "clear   # ou Ctrl+L",
            out: "(tela limpa)",
            outType: "default",
          },
          {
            comment: "limpar histórico (antes de fechar terminal sensível)",
            cmd: "history -c && history -w",
            out: "(silencioso — histórico zerado em memória e em disco)",
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Pipeline completo — top 3 IPs atacantes do auth.log"
        goal="Encadear grep → awk → sort → uniq → sort → head para extrair os 3 IPs que mais tentaram SSH inválido."
        steps={[
          "Rode o pipeline contra /var/log/auth.log (ou o log de exemplo se não tiver acesso).",
          "Cada etapa filtra/transforma; combine 5 comandos em uma linha só.",
          "O resultado deve ser legível e ordenado por número de tentativas.",
        ]}
        command={`grep 'Failed password' /var/log/auth.log \\
  | grep -oP '\\b(\\d{1,3}\\.){3}\\d{1,3}\\b' \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -3`}
        expected={`    142 45.155.205.12
     88 200.158.42.18
     31 91.240.118.42`}
        verify="A primeira coluna é a contagem de tentativas; a segunda é o IP. Esses são os atacantes mais agressivos contra seu SSH — candidatos a fail2ban/iptables."
      />

      <AlertBox type="success" title="Você dominou o terminal essencial">
        Aqui você fez o que separa um operador júnior de um sênior: encadeia
        comandos pequenos com pipes, usa redirecionamento corretamente, escreve
        scripts defensivos com <code>set -euxo pipefail</code> e{" "}
        <code>trap</code>, extrai dados com awk/sed sem abrir editor, paraleliza
        com <code>xargs -P</code>. Próximo passo:{" "}
        <Link href="/filesystem">
          <a className="underline font-semibold text-primary">
            Sistema de Arquivos
          </a>
        </Link>{" "}
        para entender a estrutura do Linux por dentro, ou{" "}
        <Link href="/bash-pentest">
          <a className="underline font-semibold text-primary">
            Bash para Pentest
          </a>
        </Link>{" "}
        para automação de recon.
      </AlertBox>
    </PageContainer>
  );
}
