import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Avancado() {
  return (
    <PageContainer
      title="Bash avançado — one-liners matadores"
      subtitle="xargs, find -exec, parallel, awk/sed/cut/tr, comm/join/paste, column. Os comandos que separam o iniciante do operador."
      difficulty="avancado"
      timeToRead="17 min"
    >
      <h2>Por que dominar isto</h2>
      <p>
        Em pentest você vive processando listas: hosts, URLs, hashes, hosts vivos,
        wordlists, domínios. Saber emendar <code>find</code>, <code>xargs</code>,
        <code> awk</code>, <code>sed</code> e <code>parallel</code> em pipelines é o que
        transforma "1h olhando arquivo no editor" em "5s de comando que cospe a resposta".
      </p>

      <h2>xargs — converte stdin em argumentos</h2>
      <p>
        Muitos comandos não aceitam input via pipe (eles esperam ARGS). <code>xargs</code>
        resolve isso lendo a stdin e construindo a linha de comando.
      </p>

      <CommandTable
        title="xargs essenciais"
        variations={[
          { cmd: "echo 'a b c' | xargs", desc: "Junta tudo em uma linha (consolidate).", output: "a b c" },
          { cmd: "ls *.bak | xargs rm", desc: "Aplica rm em cada arquivo (passa todos juntos).", output: "Equivalente a rm a.bak b.bak c.bak..." },
          { cmd: "xargs -n 1", desc: "Um argumento por execução.", output: "echo a b c | xargs -n1 → 3 chamadas" },
          { cmd: "xargs -I {} cp {} /backup/", desc: "Placeholder {} no meio do comando.", output: "Posicionamento custom (não só no fim)." },
          { cmd: "xargs -P 10", desc: "Roda até 10 processos em PARALELO.", output: "Acelera muito tarefas IO-bound." },
          { cmd: "xargs -0 / -d '\\n'", desc: "Delimitador alternativo (NUL ou newline).", output: "Combine com find -print0 pra nomes com espaço." },
          { cmd: "xargs -t", desc: "Modo verbose: imprime o comando antes de executar.", output: "Debug." },
          { cmd: "xargs -p", desc: "Pergunta ANTES de cada execução.", output: "Safety net pra rm." },
          { cmd: "xargs -a arquivo", desc: "Lê de arquivo em vez de stdin.", output: "Bom em scripts." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "matar todos os processos do usuário 'low'",
            cmd: "ps -u low -o pid= | xargs -r kill -9",
            out: "(silencioso)",
            outType: "warning",
          },
          {
            comment: "curl em massa — 5 paralelos",
            cmd: "cat urls.txt | xargs -P 5 -n 1 curl -s -o /dev/null -w '%{http_code} %{url}\\n'",
            out: `200 https://target.com/
404 https://target.com/admin
301 https://target.com/login
500 https://target.com/api
403 https://target.com/.git/`,
            outType: "info",
          },
          {
            comment: "renomear todos .txt pra .bak preservando nome",
            cmd: "ls *.txt | xargs -I {} mv {} {}.bak",
            out: "(silencioso — a.txt → a.txt.bak, etc)",
            outType: "muted",
          },
        ]}
      />

      <h2>find -exec vs find | xargs</h2>
      <p>
        Ambos atingem o mesmo fim mas com semântica diferente. Memorize: <code>-exec ... \\;</code>
        é <strong>uma execução por arquivo</strong>; <code>-exec ... +</code> é
        <strong> agrupado</strong> (igual xargs).
      </p>

      <CodeBlock
        language="bash"
        title="find: as 4 formas equivalentes"
        code={`# 1. -exec ... \\;          (uma chamada por arquivo, lento mas seguro)
find /var/log -name '*.log' -exec gzip {} \\;

# 2. -exec ... +            (agrupado, rápido)
find /var/log -name '*.log' -exec gzip {} +

# 3. xargs com NUL          (lida com nomes com espaço/quote)
find /var/log -name '*.log' -print0 | xargs -0 gzip

# 4. -delete                (atalho específico para rm)
find /tmp -mtime +30 -type f -delete

# Encontre ARQUIVOS SUID em todo /  — useful para PrivEsc enum
find / -perm -4000 -type f 2>/dev/null

# Encontre arquivos modificados nas últimas 2h (busca por backdoor recente)
find / -newermt '2 hours ago' -type f -not -path '/proc/*' -not -path '/sys/*' 2>/dev/null

# Limpar artifacts num engagement
find /tmp /var/tmp /dev/shm -user $USER -type f -exec shred -u {} \\;`}
      />

      <h2>GNU parallel — xargs com esteróides</h2>
      <p>
        <code>parallel</code> é a ferramenta para paralelizar tarefas. Sintaxe parecida com
        xargs mas com features superiores: ETA, progress bar, balanceamento, retomada.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y parallel",
            out: "Setting up parallel (20240222+ds-2) ...",
            outType: "muted",
          },
          {
            comment: "ping sweep paralelo — 50 jobs simultâneos",
            cmd: "seq 1 254 | parallel -j 50 'ping -c1 -W1 10.10.10.{} &>/dev/null && echo UP 10.10.10.{}'",
            out: `UP 10.10.10.1
UP 10.10.10.5
UP 10.10.10.10
UP 10.10.10.50`,
            outType: "success",
          },
          {
            comment: "rodar nmap em vários alvos (1 por vez por --jobs 1, com progresso)",
            cmd: "cat alvos.txt | parallel --bar -j 4 'nmap -sV -p 80,443 {} -oN scan_{}.txt'",
            out: `Computers / CPU cores / Max jobs to run
1:local / 8 / 4

Computer:jobs running/jobs completed/%of started jobs/Average seconds to complete
ETA: 12s Left: 8 AVG: 4.0s  local:4/4/100%/4.0s`,
            outType: "info",
          },
          {
            comment: "produto cartesiano — combina duas listas",
            cmd: "parallel echo {1}@{2} ::: admin user root ::: gmail.com proton.me",
            out: `admin@gmail.com
admin@proton.me
user@gmail.com
user@proton.me
root@gmail.com
root@proton.me`,
            outType: "default",
          },
        ]}
      />

      <h2>awk — processamento por colunas</h2>
      <p>
        Linguagem completa para texto estruturado. Use SEMPRE que precisar pegar a "Nª
        coluna" ou aplicar lógica condicional por linha.
      </p>

      <CodeBlock
        language="bash"
        title="awk one-liners essenciais"
        code={`# Coluna N de cada linha
ps aux | awk '{print $1, $11}'

# Soma da memória de processos do user www-data
ps aux | awk '$1=="www-data" {sum += $4} END {print sum"%"}'

# Última coluna (NF = number of fields)
echo "a b c d" | awk '{print $NF}'         # → d
echo "a b c d" | awk '{print $(NF-1)}'     # → c

# Filtro condicional + ação
df -h | awk '$5+0 > 80 {print $6": "$5}'   # partições com >80% uso

# Trocar separador (FS = input, OFS = output)
awk -F: '{print $1, $7}' /etc/passwd       # user:shell
awk -F: -v OFS=' → ' '{print $1, $7}' /etc/passwd

# Contar linhas únicas (sem usar sort+uniq)
awk '!seen[$0]++' arquivo.txt

# Linha N específica (sed-style mas em awk)
awk 'NR==42' arquivo

# Range de linhas
awk 'NR>=10 && NR<=20' arquivo

# Imprimir entre dois marcadores (BEGIN..END inclusivo)
awk '/INICIO/,/FIM/' log.txt

# Modificar e somar coluna 3 multiplicando por 1024
awk '{$3 *= 1024; print}' arquivo

# CSV: reverter ordem das colunas
awk -F, '{print $3","$2","$1}' tabela.csv

# Histograma de status HTTP no acesslog do Apache
awk '{print $9}' /var/log/apache2/access.log | sort | uniq -c | sort -rn`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "extrair só os IPs de um log de tentativas de login",
            cmd: "awk '/Failed password/ {print $(NF-3)}' /var/log/auth.log | sort -u | head",
            out: `192.168.1.50
203.0.113.5
45.33.32.156
178.62.193.42`,
            outType: "info",
          },
          {
            comment: "top 5 IPs por número de tentativas",
            cmd: "awk '/Failed password/ {print $(NF-3)}' /var/log/auth.log | sort | uniq -c | sort -rn | head -5",
            out: `   1247 178.62.193.42
    893 45.33.32.156
    402 192.168.1.50
    156 203.0.113.5
     12 91.205.45.7`,
            outType: "warning",
          },
        ]}
      />

      <h2>sed — substituir e editar fluxos</h2>
      <CodeBlock
        language="bash"
        title="sed cheatsheet"
        code={`# Substituir primeira ocorrência por linha
sed 's/foo/bar/' arquivo

# Todas (g = global)
sed 's/foo/bar/g' arquivo

# Case-insensitive
sed 's/foo/bar/gi' arquivo

# IN-PLACE (modifica o arquivo) — fazer backup com -i.bak é boa prática
sed -i.bak 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf

# Apagar linhas que casam
sed '/^#/d' arquivo                         # remove linhas começadas com #
sed '/^\\s*$/d' arquivo                      # remove linhas vazias/só whitespace

# Imprimir só uma linha específica (e suprimir o resto)
sed -n '42p' arquivo

# Range
sed -n '10,20p' arquivo

# Múltiplos comandos (-e ou ;)
sed -e 's/foo/bar/' -e 's/baz/qux/' arquivo
sed 's/foo/bar/; s/baz/qux/' arquivo

# Capturar grupos (regex estendida com -E ou -r)
sed -E 's/(\\w+)@(\\w+)/\\2:\\1/' emails.txt   # admin@target → target:admin

# Adicionar texto antes/depois (a = after, i = insert, c = change)
sed '3a\\NOVA LINHA' arquivo                # depois da linha 3
sed '/PADRAO/i\\COMENTARIO' arquivo         # antes da linha que casa

# Substituir só a partir da linha N
sed '50,$ s/old/new/g' arquivo`}
      />

      <h2>cut, tr, sort, uniq, wc</h2>
      <CommandTable
        title="o exército suíço de manipulação de texto"
        variations={[
          { cmd: "cut -d: -f1,5 /etc/passwd", desc: "Coluna 1 e 5 separadas por :.", output: "root:root\nwallyson:Wallyson Dev" },
          { cmd: "cut -c1-10 arquivo", desc: "Caracteres 1 a 10 de cada linha.", output: "Útil pra colunas de largura fixa." },
          { cmd: "tr 'a-z' 'A-Z'", desc: "Substitui chars (translate).", output: "echo hello | tr 'a-z' 'A-Z' → HELLO" },
          { cmd: "tr -d '\\r'", desc: "Remove o \\r de arquivos Windows.", output: "Salva sua sanity." },
          { cmd: "tr -s ' '", desc: "Squeeze: comprime espaços repetidos em um.", output: "Útil antes de cut com -d ' '." },
          { cmd: "sort", desc: "Ordena. -n numérico, -r reverso, -u único, -k4 por coluna 4.", output: "ps aux | sort -k4 -rn | head" },
          { cmd: "uniq", desc: "Remove DUPLICATAS CONSECUTIVAS (sempre depois de sort).", output: "uniq -c conta ocorrências." },
          { cmd: "wc -l arquivo", desc: "Conta linhas. -w palavras, -c bytes.", output: "Combo clássico: cmd | wc -l" },
          { cmd: "head / tail", desc: "Primeiras/últimas N linhas. tail -f acompanha.", output: "tail -F sobrevive a logrotate." },
          { cmd: "rev", desc: "Inverte cada linha caractere a caractere.", output: "echo 'oi mundo' | rev → odnum io" },
          { cmd: "shuf", desc: "Ordena aleatoriamente (perfeito pra wordlists).", output: "shuf -n 10 wordlist.txt" },
          { cmd: "nl", desc: "Numera linhas (mais flexível que cat -n).", output: "nl -ba arquivo" },
        ]}
      />

      <h2>comm, join, paste — combinar arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo 'a\\nb\\nc\\nd' > A.txt; echo 'b\\nd\\ne\\nf' > B.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "comm: 3 colunas (só A, só B, ambos) — exige sorted",
            cmd: "comm <(sort A.txt) <(sort B.txt)",
            out: `a
\tb
\t\tc
\t\td
\t\te
\tf`,
            outType: "info",
          },
          {
            comment: "só interseção (-12 = suprime colunas 1 e 2)",
            cmd: "comm -12 <(sort A.txt) <(sort B.txt)",
            out: `b
d`,
            outType: "success",
          },
          {
            comment: "diferença A - B",
            cmd: "comm -23 <(sort A.txt) <(sort B.txt)",
            out: `a
c`,
            outType: "warning",
          },
          {
            comment: "paste: junta lado a lado",
            cmd: "paste users.txt passwords.txt",
            out: `admin\tadmin123
root\troot
user\tuser`,
            outType: "default",
          },
          {
            comment: "paste -d gera 'user:senha' direto pra Hydra",
            cmd: "paste -d: users.txt passwords.txt",
            out: `admin:admin123
root:root
user:user`,
            outType: "info",
          },
        ]}
      />

      <h2>column — formatar tabelas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "mount | column -t",
            out: `proc                       on  /proc                          type  proc       (rw,nosuid,nodev,noexec,relatime)
sys                        on  /sys                           type  sysfs      (rw,nosuid,nodev,noexec,relatime)
/dev/sda1                  on  /                              type  ext4       (rw,relatime,errors=remount-ro)
tmpfs                      on  /run                           type  tmpfs      (rw,nosuid,nodev,size=3267476k)`,
            outType: "info",
          },
          {
            comment: "CSV bonito",
            cmd: "column -t -s, < dados.csv",
            out: `nome      idade  cargo
Alice     32     pentester
Bob       28     redteam
Charlie   45     ciso`,
            outType: "default",
          },
        ]}
      />

      <h2>One-liners de ouro pro pentester</h2>
      <CodeBlock
        language="bash"
        title="cole na hora — funcionam sem mudança"
        code={`# Top 10 portas com mais hosts abertos num scan nmap -oG
awk '/Ports:/ {print $0}' nmap.gnmap | grep -oE '[0-9]+/open' | sort | uniq -c | sort -rn | head

# Extrair só IPs de qualquer arquivo
grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b' arquivo | sort -u

# Extrair emails
grep -oE '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' arquivo | sort -u

# Subdomínios únicos a partir de um JSON do amass
jq -r '.name' amass.json | awk -F. '{print $(NF-1)"."$NF}' | sort -u

# Hosts vivos a partir de saída de masscan
masscan 10.0.0.0/8 -p 80,443 --rate 10000 -oG out.gnmap
awk '/Host:/ {print $2}' out.gnmap | sort -u > vivos.txt

# Spray de senhas (4 paralelos)
parallel -j 4 'crackmapexec smb {1} -u admin -p {2} 2>/dev/null | grep -i success' \\
  ::: \$(cat hosts.txt) ::: 'Admin123!' 'P@ssword1' 'Welcome2024'

# Top 50 directories no acesslog (depois do gobuster, ver o que pegou)
awk '$9==200 {print $7}' access.log | awk -F? '{print $1}' | sort | uniq -c | sort -rn | head -50

# Diff de duas saídas nmap (achar serviço NOVO entre rescans)
diff <(awk '/^[0-9]/' antes.nmap) <(awk '/^[0-9]/' depois.nmap)

# Decodifica TODOS base64 plausíveis num arquivo
grep -oE '[A-Za-z0-9+/]{20,}={0,2}' arquivo | while read s; do
  d=\$(echo "\$s" | base64 -d 2>/dev/null) && [ -n "\$d" ] && echo ">> \$s -> \$d"
done

# Gera 1000 senhas aleatórias 16-char
LC_ALL=C tr -dc 'A-Za-z0-9!@#\$%' < /dev/urandom | fold -w 16 | head -1000`}
      />

      <h2>set -euo pipefail (script defensivo)</h2>
      <CodeBlock
        language="bash"
        title="o cabeçalho que todo script sério tem"
        code={`#!/usr/bin/env bash
set -euo pipefail
IFS=\$'\\n\\t'

# -e            : sai no primeiro comando que falhar
# -u            : variável não definida = erro (em vez de string vazia)
# -o pipefail   : pipeline falha se QUALQUER etapa falhar (não só a última)
# IFS=\$'\\n\\t'   : evita expansões problemáticas com espaço em filenames

# Bonus: cleanup automático ao sair
trap 'rm -f "\$tmp"' EXIT
tmp=\$(mktemp)
echo "trabalhando em \$tmp"
# ... resto do script ...`}
      />

      <PracticeBox
        title="Pipeline completo: parse log → top 10 atacantes"
        goal="Construir um one-liner que descubra os 10 IPs com mais Failed password no auth.log."
        steps={[
          "Filtrar linhas com 'Failed password'.",
          "Extrair o IP (penúltima coluna se for usuário válido, ajustar com awk/grep).",
          "Contar e ordenar.",
          "Pegar os 10 primeiros.",
        ]}
        command={`# Aqui assumimos auth.log; em sistemas modernos use journalctl
sudo journalctl -u ssh --since '7 days ago' \\
  | grep 'Failed password' \\
  | grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b' \\
  | sort | uniq -c | sort -rn | head -10`}
        expected={`   1827 45.33.32.156
   1209 178.62.193.42
    644 91.205.45.7
    402 192.168.1.50
    187 203.0.113.5
    103 8.8.8.8
     54 159.65.1.42
     22 1.1.1.1
     11 51.91.42.13
      4 10.0.0.5`}
        verify="A saída lista 10 IPs ordenados por nº de tentativas. Você pode jogar diretamente em fail2ban-client set sshd banip <IP> ou em iptables."
      />

      <AlertBox type="info" title="Próximos passos">
        Quer ir além? Estude <code>jq</code> (JSON), <code>yq</code> (YAML),
        <code> ripgrep</code> (rg, MUITO mais rápido que grep), <code>fd</code>
        (alternativa moderna ao find), <code>fzf</code> (fuzzy finder), <code>bat</code>
        (cat com syntax highlight). Esses junto com tudo aqui formam o setup CLI
        definitivo de pentester.
      </AlertBox>
    </PageContainer>
  );
}
