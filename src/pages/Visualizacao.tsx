import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Visualizacao() {
  return (
    <PageContainer
      title="Visualização de Arquivos"
      subtitle="cat, less, head, tail, xxd, strings, file: ler texto, binário e identificar tipos no terreno do pentest."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <h2>Por que isso importa em pentest</h2>
      <p>
        Depois de exfiltrar arquivos de um alvo (loot, dumps, binários suspeitos, configs)
        você precisa decidir <strong>rápido</strong> o que tem em mãos. É binário ou texto?
        Tem strings interessantes (URLs, senhas, comandos)? É um ELF Linux ou um PE Windows?
        Esta página cobre as ferramentas básicas que todo operador usa antes de mandar o
        artefato para análise mais profunda em <code>radare2</code>, <code>ghidra</code> ou{" "}
        <code>binwalk</code>.
      </p>

      <h2>cat, tac e nl — texto puro</h2>
      <CommandTable
        title="cat e variantes"
        variations={[
          { cmd: "cat /etc/passwd", desc: "Imprime o arquivo inteiro no stdout.", output: "root:x:0:0:root:/root:/bin/bash\\nwallyson:x:1000:1000:..." },
          { cmd: "cat -n script.sh", desc: "Numera todas as linhas (incluindo vazias).", output: "  1  #!/bin/bash\\n  2  echo hi" },
          { cmd: "cat -A config.cfg", desc: "Mostra TAB ($I), CR ($M) e quebras ($) — caça bug de encoding.", output: "value=test^M$" },
          { cmd: "cat file1 file2 > juntos.txt", desc: "Concatena dois arquivos no terceiro.", output: "(silencioso)" },
          { cmd: "tac access.log", desc: "Igual ao cat mas de baixo para cima — log mais novo primeiro.", output: "Reverso linha por linha." },
          { cmd: "nl -ba script.py", desc: "Numera linhas (incluindo vazias) — para dar referência em relatório.", output: "  1\\t#!/usr/bin/env python3" },
          { cmd: "cat /dev/null > log.txt", desc: "Trunca arquivo (zera). Útil para limpar log de teste.", output: "(arquivo agora tem 0 bytes)" },
        ]}
      />

      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "captura de exfil de um web server comprometido",
            cmd: "ls -lah",
            out: `total 1.4M
-rw-r--r-- 1 wallyson wallyson  847 Apr  5 14:22 db_creds.env
-rw-r--r-- 1 wallyson wallyson  12K Apr  5 14:22 wp-config.php
-rw-r--r-- 1 wallyson wallyson 1.1M Apr  5 14:23 backup.tar.gz
-rwxr-xr-x 1 wallyson wallyson 287K Apr  5 14:24 implant.elf`,
            outType: "info",
          },
          {
            cmd: "cat db_creds.env",
            out: `DB_HOST=10.10.20.15
DB_USER=app_admin
DB_PASS=Pr0d_M0ng0!2024
DB_NAME=customers
REDIS_URL=redis://10.10.20.16:6379
JWT_SECRET=a3f2e9d0c8b7a6f5e4d3c2b1a0998877`,
            outType: "success",
          },
        ]}
      />

      <h2>less e more — paginação</h2>
      <p>
        <code>cat</code> em arquivos de 50k linhas é um pesadelo. Use <code>less</code>
        (versão moderna). Ele é interativo: <code>/</code> busca, <code>n</code> próximo
        match, <code>g</code> vai pro topo, <code>G</code> pro fim, <code>q</code> sai.
      </p>
      <CommandTable
        title="less em ação"
        variations={[
          { cmd: "less /var/log/auth.log", desc: "Abre paginado, navega com setas/PgUp/PgDn.", output: "Pressione q para sair." },
          { cmd: "less +F /var/log/syslog", desc: "Modo follow (= tail -f). Ctrl+C sai do follow, q sai do less.", output: "Atualiza em tempo real." },
          { cmd: "less +G huge.log", desc: "Abre já no fim do arquivo.", output: "Pula direto pro último evento." },
          { cmd: "less -N script.py", desc: "Mostra número de linha à esquerda.", output: "  1 #!/usr/bin/env python3" },
          { cmd: "less -S long.csv", desc: "Não quebra linha (chop). Use ←/→ para rolar lateral.", output: "Ideal para CSV/log estruturado." },
          { cmd: "less -R color.log", desc: "Interpreta sequências ANSI de cor (logs com cor).", output: "Mantém o colorido do journalctl." },
          { cmd: "zless backup.gz", desc: "Versão para arquivos comprimidos. Existe também xzless, bzless.", output: "Não precisa descompactar antes." },
        ]}
      />

      <h2>head e tail — pontas do arquivo</h2>
      <Terminal
        path="~/loot"
        lines={[
          {
            cmd: "head /var/log/apache2/access.log",
            out: `10.0.0.5 - - [05/Apr/2026:09:12:01 +0000] "GET / HTTP/1.1" 200 4521 "-" "Mozilla/5.0"
10.0.0.7 - - [05/Apr/2026:09:12:03 +0000] "GET /favicon.ico HTTP/1.1" 200 1150 "-" "Mozilla/5.0"
10.0.0.9 - - [05/Apr/2026:09:12:08 +0000] "POST /login HTTP/1.1" 302 0 "https://app.local/login"
[...]`,
            outType: "default",
          },
          {
            comment: "primeiras 3 linhas",
            cmd: "head -n 3 /etc/passwd",
            out: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin`,
            outType: "info",
          },
          {
            comment: "primeiros 200 bytes (binário)",
            cmd: "head -c 200 implant.elf | xxd | head -5",
            out: `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 c052 4000 0000 0000  ..>......R@.....
00000020: 4000 0000 0000 0000 6804 0000 0000 0000  @.......h.......`,
            outType: "warning",
          },
          {
            comment: "últimas 50 linhas + tail follow",
            cmd: "tail -n 50 /var/log/auth.log",
            out: `Apr  5 14:22:01 kali sshd[12847]: Accepted publickey for wallyson from 10.0.0.10
Apr  5 14:22:35 kali sudo: wallyson : TTY=pts/0 ; PWD=/home/wallyson ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow`,
            outType: "warning",
          },
          {
            comment: "monitorar log em tempo real (= less +F)",
            cmd: "tail -f /var/log/auth.log",
            out: "(fica esperando novas linhas; Ctrl+C para sair)",
            outType: "muted",
          },
          {
            comment: "monitorar VÁRIOS arquivos ao mesmo tempo",
            cmd: "tail -F /var/log/auth.log /var/log/syslog",
            out: "==> /var/log/auth.log <==\\n...\\n==> /var/log/syslog <==\\n...",
            outType: "info",
          },
        ]}
      />

      <h2>file e stat — identificação rápida</h2>
      <p>
        Antes de "rodar", <strong>identifique</strong>. <code>file</code> usa magic bytes
        para descobrir o tipo real, ignorando extensão (que pode ser fake).
      </p>

      <Terminal
        path="~/loot"
        lines={[
          {
            cmd: "file *",
            out: `backup.tar.gz: gzip compressed data, last modified: Sat Apr  5 14:23:11 2026, from Unix
db_creds.env: ASCII text
implant.elf:  ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=7e3a..., for GNU/Linux 3.2.0, stripped
suspicious.jpg: PE32+ executable (GUI) x86-64, for MS Windows
wp-config.php: PHP script, ASCII text`,
            outType: "info",
          },
          {
            comment: "WHOA — suspicious.jpg na real é um EXE Windows!",
            cmd: "xxd suspicious.jpg | head -2",
            out: `00000000: 4d5a 9000 0300 0000 0400 0000 ffff 0000  MZ..............
00000010: b800 0000 0000 0000 4000 0000 0000 0000  ........@.......`,
            outType: "warning",
          },
          {
            cmd: "stat implant.elf",
            out: `  File: implant.elf
  Size: 293872          Blocks: 576        IO Block: 4096   regular file
Device: 8,1     Inode: 1573122     Links: 1
Access: (0755/-rwxr-xr-x)  Uid: ( 1000/wallyson)   Gid: ( 1000/wallyson)
Access: 2026-04-05 14:24:01.123456789 -0300
Modify: 2026-04-05 14:24:01.123456789 -0300
Change: 2026-04-05 14:24:02.456789012 -0300
 Birth: 2026-04-05 14:24:01.123456789 -0300`,
            outType: "default",
          },
        ]}
      />

      <AlertBox type="warning" title="Anti-forense: timestamps mentem">
        <p>
          <code>stat</code> mostra Access/Modify/Change/Birth. <code>touch -d "2020-01-01"
          arquivo</code> reescreve <strong>Access e Modify</strong> mas <strong>NÃO</strong> o
          Change (ctime), que só muda quando o inode é alterado. Em forense, ctime é o
          timestamp <em>menos</em> mentível. Como atacante, lembre-se disso. Como blue team,
          confie mais no ctime.
        </p>
      </AlertBox>

      <h2>xxd e hexdump — bytes crus</h2>
      <p>
        Quando você precisa olhar exatamente o que está em cada byte (cabeçalhos de
        arquivo, payloads ofuscados, dump de memória), use um hex viewer.
      </p>

      <CommandTable
        title="xxd / hexdump"
        variations={[
          { cmd: "xxd payload.bin", desc: "Hex + ASCII lado a lado, formato canônico.", output: "00000000: 7f45 4c46 0201 0100  .ELF...." },
          { cmd: "xxd -l 64 payload.bin", desc: "Só os primeiros 64 bytes (= -length).", output: "Útil para inspecionar magic bytes." },
          { cmd: "xxd -s 0x100 payload.bin", desc: "Skip — começa do offset 0x100.", output: "Pula cabeçalho fixo." },
          { cmd: "xxd -c 8 payload.bin", desc: "Muda colunas (8 bytes/linha em vez de 16).", output: "Layout mais compacto." },
          { cmd: "xxd -p payload.bin", desc: "Modo plain — só hex, sem offset/ASCII.", output: "Bom para colar em script." },
          { cmd: "echo 'hello' | xxd", desc: "Vê o que tem dentro de uma string (incl. newline).", output: "00000000: 6865 6c6c 6f0a       hello." },
          { cmd: "xxd -r dump.hex > restored.bin", desc: "REVERTE: hex → binário (reconstrói arquivo).", output: "Útil para reconstruir payload colado." },
          { cmd: "hexdump -C arquivo", desc: "Versão BSD, formato canônico igual ao xxd.", output: "Sintaxe alternativa." },
        ]}
      />

      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "magic bytes comuns que você precisa reconhecer de cor",
            cmd: "for f in *.suspicious; do echo \"=== $f ===\"; xxd \"$f\" | head -1; done",
            out: `=== a.suspicious ===
00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
=== b.suspicious ===
00000000: 4d5a 9000 0300 0000 0400 0000 ffff 0000  MZ..............
=== c.suspicious ===
00000000: 504b 0304 1400 0900 0800 4d5a 9000       PK........MZ..
=== d.suspicious ===
00000000: 1f8b 0808 7e3a 0e66 0003 6261 636b 7570  ....~:.f..backup
=== e.suspicious ===
00000000: 2350 4446 2d31 2e34 0a25 e2e3 cfd3 0a31  #PDF-1.4.%.....1`,
            outType: "warning",
          },
          {
            comment: "decodificando: 7f45 4c46=ELF, 4d5a=MZ(PE Windows), 504b=ZIP, 1f8b=GZIP, 2550=PDF",
            cmd: "echo \"a=Linux ELF, b=Windows PE, c=ZIP/JAR/APK/DOCX, d=GZIP, e=PDF\"",
            out: "a=Linux ELF, b=Windows PE, c=ZIP/JAR/APK/DOCX, d=GZIP, e=PDF",
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="cheatsheet de magic bytes (decore)"
        code={`# ============== EXECUTÁVEIS ==============
# 7F 45 4C 46            ELF (Linux/BSD/Android binary)
# 4D 5A                  PE / DOS .exe / .dll (MZ = Mark Zbikowski)
# CA FE BA BE            Java .class (também macOS Mach-O multi-arch)
# FE ED FA CE/CF         macOS Mach-O (32/64 bit)
# CF FA ED FE            macOS Mach-O 64-bit little endian

# ============== ARQUIVOS / COMPACTAÇÃO ==============
# 50 4B 03 04            ZIP, JAR, APK, DOCX, ODF, EPUB
# 1F 8B 08               GZIP
# 42 5A 68               BZIP2 (BZh)
# FD 37 7A 58 5A 00      XZ
# 28 B5 2F FD            ZSTD
# 75 73 74 61 72         TAR (offset 0x101: "ustar")
# 52 61 72 21 1A 07      RAR

# ============== DOCUMENTOS / MÍDIA ==============
# 25 50 44 46            PDF (%PDF)
# D0 CF 11 E0 A1 B1 1A E1   MS Office antigo (.doc/.xls/.ppt)
# FF D8 FF               JPEG (FF D8 FF E0/E1/EE)
# 89 50 4E 47 0D 0A 1A 0A   PNG
# 47 49 46 38            GIF (GIF8)
# 49 49 2A 00            TIFF little-endian
# 25 21 50 53            PostScript

# ============== CONTAINERS DE PAYLOAD ==============
# 7B 5C 72 74 66         RTF (\\rtf) — vetor comum de exploit
# 53 51 4C 69 74 65      SQLite database
`}
      />

      <h2>strings — texto dentro de binário</h2>
      <p>
        <code>strings</code> extrai sequências ASCII (≥4 chars por padrão) de qualquer
        arquivo. É a primeira ferramenta de análise estática: pega URLs hard-coded, comandos,
        nomes de função, mensagens de debug, chaves API esquecidas.
      </p>

      <Terminal
        path="~/loot"
        lines={[
          {
            cmd: "strings implant.elf | head -20",
            out: `/lib64/ld-linux-x86-64.so.2
libc.so.6
__libc_start_main
exit
fork
socket
connect
htons
inet_pton
recv
send
execve
/bin/sh
GLIBC_2.2.5
GCC: (Debian 12.2.0-14) 12.2.0
.shstrtab
.interp
.note.gnu.property
.note.gnu.build-id`,
            outType: "info",
          },
          {
            comment: "filtros úteis: IPs, URLs, paths suspeitos",
            cmd: "strings implant.elf | grep -E '([0-9]{1,3}\\.){3}[0-9]{1,3}|https?://|\\.onion'",
            out: `10.10.20.5
http://c2.evilcorp.org/checkin
http://c2.evilcorp.org/task
abcdef1234567890.onion
192.168.1.1`,
            outType: "warning",
          },
          {
            comment: "string mínima de N chars (-n) — reduz ruído",
            cmd: "strings -n 10 implant.elf | grep -i pass",
            out: `password: %s
SetPassword
PasswordExpire
basic_auth_password`,
            outType: "warning",
          },
          {
            comment: "strings UTF-16 (binários Windows costumam usar)",
            cmd: "strings -e l malware.exe | head -10",
            out: `kernel32.dll
ntdll.dll
CreateRemoteThread
VirtualAllocEx
WriteProcessMemory
http://evil.tld/beacon`,
            outType: "warning",
          },
          {
            comment: "offsets — útil para localizar e patchar",
            cmd: "strings -t x implant.elf | grep evilcorp",
            out: `   1a4f0 c2.evilcorp.org`,
            outType: "info",
          },
        ]}
      />

      <h2>od e wc — bytes e estatísticas</h2>
      <CommandTable
        title="od (octal dump) e wc"
        variations={[
          { cmd: "od -c arquivo | head", desc: "Mostra bytes como caracteres (com \\n, \\t visíveis).", output: "Útil para ver controle/whitespace." },
          { cmd: "od -An -tx1 arquivo", desc: "Sem offset, hex byte a byte.", output: "Equivalente a hexdump simples." },
          { cmd: "wc -l auth.log", desc: "Conta linhas.", output: "  47892 auth.log" },
          { cmd: "wc -c file", desc: "Conta bytes (= ls -l + tamanho).", output: "  293872 implant.elf" },
          { cmd: "wc -w doc.txt", desc: "Conta palavras.", output: "  1247 doc.txt" },
          { cmd: "wc -l < rockyou.txt", desc: "Conta sem mostrar nome (do stdin).", output: "14344384" },
          { cmd: "find . -type f | wc -l", desc: "Quantos arquivos no diretório (recursivo).", output: "  847" },
        ]}
      />

      <h2>Combos de pentester</h2>
      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "extrair credenciais de qualquer arquivo numa pasta",
            cmd: "grep -REn '(password|passwd|pwd|secret|api[_-]?key|token)\\s*[=:]' . 2>/dev/null | head",
            out: `./db_creds.env:3:DB_PASS=Pr0d_M0ng0!2024
./wp-config.php:23:define('DB_PASSWORD', 'wpr00t!2024');
./settings.py:12:SECRET_KEY = 'django-insecure-x9f3...'
./config.json:5:    "api_key": "sk-proj-aB3xY9..."`,
            outType: "warning",
          },
          {
            comment: "achar todos arquivos com magic byte ELF (binários Linux)",
            cmd: "find /tmp /var/tmp /dev/shm -type f -exec head -c 4 {} \\; -exec echo \" {}\" \\; 2>/dev/null | grep ELF",
            out: `.ELF /tmp/.x
.ELF /dev/shm/kdmtmpflush`,
            outType: "warning",
          },
          {
            comment: "tail follow do auth.log filtrando só Failed/Accepted (caçar bruteforce em tempo real)",
            cmd: "tail -F /var/log/auth.log | grep --line-buffered -E 'Failed|Accepted'",
            out: `Apr  5 14:32:01 kali sshd[12999]: Failed password for invalid user admin from 10.0.0.99
Apr  5 14:32:03 kali sshd[12999]: Failed password for invalid user admin from 10.0.0.99
Apr  5 14:32:05 kali sshd[12999]: Accepted password for backup from 10.0.0.99 port 51220 ssh2`,
            outType: "warning",
          },
          {
            comment: "extrair só URLs de um dump web",
            cmd: "strings dump.bin | grep -Eo 'https?://[a-zA-Z0-9./?=_-]+' | sort -u",
            out: `http://10.10.20.5/api/v1/users
http://internal.corp.local/admin
https://evilcorp-c2.duckdns.org/checkin`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Triage de loot exfiltrado"
        goal="Em 60 segundos, classificar 5 arquivos desconhecidos e extrair indicadores de cada um."
        steps={[
          "Crie uma pasta loot/ com 5 arquivos: um ELF, um PE, um ZIP, um PDF e um texto com credenciais.",
          "Rode file * para identificar todos.",
          "Rode strings nos binários e grepe por http, password, IP.",
          "Conte linhas do texto e mostre as 3 primeiras.",
          "Liste tamanhos com ls -lah ordenado por tamanho.",
        ]}
        command={`mkdir -p ~/loot && cd ~/loot
cp /bin/ls ./suspect.bin
echo 'PASSWORD=Hunter2!2024' > creds.txt
echo 'API_TOKEN=sk-test-abc123' >> creds.txt

file *
echo "--- strings filtradas ---"
strings suspect.bin | grep -Ei 'pass|http|/etc|sock' | head -5
echo "--- creds ---"
head -3 creds.txt
wc -l creds.txt
ls -lahS`}
        expected={`creds.txt:    ASCII text
suspect.bin:  ELF 64-bit LSB pie executable, x86-64, ...
--- strings filtradas ---
/etc/group
/etc/passwd
listxattr
--- creds ---
PASSWORD=Hunter2!2024
API_TOKEN=sk-test-abc123
2 creds.txt
total 148K
-rwxr-xr-x 1 wallyson wallyson 142K Apr  5 15:01 suspect.bin
-rw-r--r-- 1 wallyson wallyson   45 Apr  5 15:01 creds.txt`}
        verify="file identificou ELF e ASCII corretamente, strings extraiu paths internos e creds.txt mostrou as 2 chaves."
      />

      <AlertBox type="info" title="Próximos passos">
        <p>
          Quando <code>strings</code> e <code>xxd</code> não bastam, evolua para{" "}
          <code>radare2 -A binario</code>, <code>ghidra</code>, <code>binwalk -e firmware.bin</code>{" "}
          (extrai conteúdo embutido) e <code>floss</code> (strings ofuscadas em malware Windows).
          Para PCAP de rede comece com <code>tcpdump -nnr cap.pcap | head</code> antes de abrir
          no Wireshark.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
