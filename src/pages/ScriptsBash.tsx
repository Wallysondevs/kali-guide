import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ScriptsBash() {
  return (
    <PageContainer
      title="Scripts em Bash"
      subtitle="Do shebang ao shellcheck — automatize recon, varredura e pós-exploração com scripts robustos."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>Por que escrever scripts (e não só one-liners)</h2>
      <p>
        Em pentest, você repete a mesma sequência dezenas de vezes: <strong>nmap → nikto → gobuster
        → curl</strong> contra cada host de uma lista. Um script bem feito economiza horas e
        documenta o que foi feito (importante para o relatório). Bash é universal: roda em
        qualquer Linux, qualquer container, qualquer reverse shell.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "which bash && bash --version | head -1",
            out: `/usr/bin/bash
GNU bash, version 5.2.32(1)-release (x86_64-pc-linux-gnu)`,
            outType: "info",
          },
        ]}
      />

      <h2>Anatomia de um script profissional</h2>
      <CodeBlock
        language="bash"
        title="~/tools/recon.sh"
        code={`#!/usr/bin/env bash
# recon.sh — varredura inicial em um host
# uso: ./recon.sh <ip> [output_dir]

set -euo pipefail
IFS=$'\\n\\t'

readonly TARGET="\${1:?uso: $0 <ip> [output]}"
readonly OUTDIR="\${2:-./loot/$TARGET}"

mkdir -p "$OUTDIR"

log()  { printf '\\033[1;36m[*]\\033[0m %s\\n' "$*"; }
ok()   { printf '\\033[1;32m[+]\\033[0m %s\\n' "$*"; }
warn() { printf '\\033[1;33m[!]\\033[0m %s\\n' "$*" >&2; }
die()  { printf '\\033[1;31m[x]\\033[0m %s\\n' "$*" >&2; exit 1; }

trap 'warn "interrompido"; exit 130' INT TERM

command -v nmap >/dev/null || die "nmap não instalado"

log "scanning $TARGET ..."
nmap -sCV -T4 -oA "$OUTDIR/nmap" "$TARGET" >/dev/null
ok   "nmap salvo em $OUTDIR/nmap.*"

mapfile -t PORTS < <(awk -F/ '/^[0-9]+\\/tcp.*open/{print $1}' "$OUTDIR/nmap.gnmap" 2>/dev/null || true)
ok "portas abertas: \${PORTS[*]:-nenhuma}"`}
      />

      <h3>Por que <code>set -euo pipefail</code></h3>
      <CommandTable
        title="Strict mode (sempre use)"
        variations={[
          { cmd: "set -e", desc: "Aborta no primeiro comando que retornar != 0.", output: "Evita continuar após erro silencioso." },
          { cmd: "set -u", desc: "Erro ao usar variável não definida.", output: "Pega typo em $TARTGET vs $TARGET." },
          { cmd: "set -o pipefail", desc: "Pipe falha se QUALQUER etapa falhar.", output: "false | true → falha (sem pipefail seria sucesso)." },
          { cmd: "set -x", desc: "Debug: imprime cada comando antes de executar.", output: "+ nmap -sV 10.10.10.5" },
          { cmd: "IFS=$'\\n\\t'", desc: "Trava o separador (segurança contra nomes com espaço).", output: "for f in $files quebra menos." },
          { cmd: "trap '...' INT TERM EXIT", desc: "Limpa recursos ao sair.", output: "Mata listeners, remove tempfiles." },
        ]}
      />

      <h2>Argumentos: $@, $*, $#</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat args.sh",
            out: `#!/usr/bin/env bash
echo "nome script: $0"
echo "qtd args:    $#"
echo "todos (\\$@): $@"
echo "primeiro:    $1"
echo "último:      \${@: -1}"
for a in "$@"; do echo " - $a"; done`,
            outType: "default",
          },
          {
            cmd: "./args.sh 10.10.10.5 80 443",
            out: `nome script: ./args.sh
qtd args:    3
todos ($@): 10.10.10.5 80 443
primeiro:    10.10.10.5
último:      443
 - 10.10.10.5
 - 80
 - 443`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title='SEMPRE entre aspas: "$@" e não $@'>
        <p>
          Sem aspas, um arg com espaço (ex: <code>"my file"</code>) vira dois. Com <code>"$@"</code>
          cada argumento mantém integridade. Vale para <code>"$var"</code> em qualquer comando
          que receba caminho/string vinda de fora.
        </p>
      </AlertBox>

      <h2>Parsing de flags com getopts</h2>
      <CodeBlock
        language="bash"
        title="parser.sh"
        code={`#!/usr/bin/env bash
set -euo pipefail

VERBOSE=0
PORT=80
TARGET=""

usage() {
  cat <<EOF
uso: $0 [-v] [-p porta] -t alvo
  -t  alvo (obrigatório)
  -p  porta (default: 80)
  -v  verbose
EOF
  exit 1
}

while getopts ":t:p:vh" opt; do
  case "$opt" in
    t) TARGET="$OPTARG" ;;
    p) PORT="$OPTARG" ;;
    v) VERBOSE=1 ;;
    h) usage ;;
    \\?) echo "flag inválida: -$OPTARG" >&2; usage ;;
    :)  echo "-$OPTARG exige valor" >&2; usage ;;
  esac
done

[[ -z "$TARGET" ]] && usage
(( VERBOSE )) && echo "[v] alvo=$TARGET porta=$PORT"
curl -sI "http://$TARGET:$PORT" | head -1`}
      />

      <h2>Arrays e arrays associativos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: `cat arrays.sh`,
            out: `#!/usr/bin/env bash
# array indexado
PORTS=(21 22 80 443 8080)
echo "total: \${#PORTS[@]}"
echo "primeiro: \${PORTS[0]}"
echo "fatia 1-3: \${PORTS[@]:1:3}"

for p in "\${PORTS[@]}"; do
  echo "scan porta $p"
done

# array associativo (declare -A)
declare -A SVC
SVC[21]="ftp"; SVC[22]="ssh"; SVC[3389]="rdp"
echo "porta 22 = \${SVC[22]}"
for k in "\${!SVC[@]}"; do
  echo "$k -> \${SVC[$k]}"
done`,
            outType: "default",
          },
          {
            cmd: "bash arrays.sh",
            out: `total: 5
primeiro: 21
fatia 1-3: 22 80 443
scan porta 21
scan porta 22
scan porta 80
scan porta 443
scan porta 8080
porta 22 = ssh
21 -> ftp
22 -> ssh
3389 -> rdp`,
            outType: "success",
          },
        ]}
      />

      <h2>Funções</h2>
      <CodeBlock
        language="bash"
        title="lib_log.sh — biblioteca reutilizável"
        code={`#!/usr/bin/env bash
# carregue com: source lib_log.sh

readonly C_RST='\\033[0m'
readonly C_RED='\\033[1;31m'
readonly C_GRN='\\033[1;32m'
readonly C_YLW='\\033[1;33m'
readonly C_CYN='\\033[1;36m'

log()   { printf "%b[*]%b %s\\n" "$C_CYN" "$C_RST" "$*"; }
ok()    { printf "%b[+]%b %s\\n" "$C_GRN" "$C_RST" "$*"; }
warn()  { printf "%b[!]%b %s\\n" "$C_YLW" "$C_RST" "$*" >&2; }
fail()  { printf "%b[x]%b %s\\n" "$C_RED" "$C_RST" "$*" >&2; exit 1; }

is_up() {
  local host="$1"
  ping -c1 -W1 "$host" >/dev/null 2>&1
}

http_code() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$1"
}`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "source lib_log.sh && is_up 10.10.10.5 && ok 'host vivo'",
            out: "[+] host vivo",
            outType: "success",
          },
        ]}
      />

      <h2>Traps: cleanup garantido</h2>
      <CodeBlock
        language="bash"
        title="listener.sh"
        code={`#!/usr/bin/env bash
set -euo pipefail

PORT="\${1:-4444}"
TMP="$(mktemp -d)"
LOG="$TMP/session.log"

cleanup() {
  echo "[*] limpando..."
  pkill -P $$ 2>/dev/null || true
  [[ -d "$TMP" ]] && rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

echo "[+] listener na porta $PORT — log em $LOG"
nc -lvnp "$PORT" | tee "$LOG"`}
      />

      <h2>Script-modelo: ping sweep paralelo</h2>
      <CodeBlock
        language="bash"
        title="sweep.sh — varredura ICMP /24"
        code={`#!/usr/bin/env bash
set -euo pipefail

readonly NET="\${1:-10.10.10}"
readonly TIMEOUT=1
readonly JOBS=50

scan_one() {
  local ip="$1"
  if ping -c1 -W"$TIMEOUT" "$ip" >/dev/null 2>&1; then
    printf '\\033[1;32m[+]\\033[0m %s up\\n' "$ip"
  fi
}
export -f scan_one
export TIMEOUT

seq 1 254 | xargs -I{} -P "$JOBS" bash -c 'scan_one "$NET.{}"' _ "$NET"

echo "[*] sweep concluído"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "./sweep.sh 10.10.10",
            out: `[+] 10.10.10.1 up
[+] 10.10.10.5 up
[+] 10.10.10.10 up
[+] 10.10.10.254 up
[*] sweep concluído`,
            outType: "success",
          },
        ]}
      />

      <h2>Debug: bash -x e shellcheck</h2>
      <CommandTable
        title="Debug toolkit"
        variations={[
          { cmd: "bash -x script.sh", desc: "Executa imprimindo cada linha (xtrace).", output: "+ TARGET=10.10.10.5" },
          { cmd: "bash -n script.sh", desc: "Só sintaxe, não executa.", output: "(silencioso = ok)" },
          { cmd: "PS4='+ \\$LINENO: ' bash -x ...", desc: "Mostra número de linha no trace.", output: "+ 12: ping -c1 ..." },
          { cmd: "shellcheck script.sh", desc: "Linter — pega 90% dos bugs comuns.", output: "SC2086: Double quote to prevent globbing." },
          { cmd: "set -x ... set +x", desc: "Liga/desliga trace só em um trecho.", output: "Útil dentro de função problemática." },
          { cmd: "trap 'echo ERR linha $LINENO' ERR", desc: "Imprime onde falhou.", output: "ERR linha 47" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "shellcheck recon.sh",
            out: `In recon.sh line 18:
nmap -sCV -T4 -oA $OUTDIR/nmap $TARGET
                   ^------^ SC2086: Double quote to prevent globbing and word splitting.
                                ^----^ SC2086

For more information:
  https://www.shellcheck.net/wiki/SC2086`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Scanner de portas em Bash puro (sem nmap)"
        goal="Escrever um TCP connect scan usando apenas /dev/tcp do bash — útil em shell minimalista pós-explo onde não há nmap."
        steps={[
          "Crie scan.sh com strict mode.",
          "Receba host e range de portas como args.",
          "Use timeout + bash -c para tentar conectar em /dev/tcp/host/porta.",
          "Imprima só portas abertas em verde.",
        ]}
        command={`cat > scan.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
HOST="\${1:?uso: $0 <host> <porta-inicio> <porta-fim>}"
START="\${2:-1}"
END="\${3:-1024}"

for ((p=START; p<=END; p++)); do
  (timeout 1 bash -c "echo > /dev/tcp/$HOST/$p" 2>/dev/null) \\
    && printf '\\033[1;32m[+]\\033[0m %s:%s OPEN\\n' "$HOST" "$p" &
  (( p % 50 == 0 )) && wait
done
wait
EOF
chmod +x scan.sh
./scan.sh scanme.nmap.org 20 100`}
        expected={`[+] scanme.nmap.org:22 OPEN
[+] scanme.nmap.org:80 OPEN`}
        verify="O script só usa builtins do bash + timeout — funciona em qualquer Linux que tenha /dev/tcp habilitado (Bash compilado com --enable-net-redirections, padrão na maioria das distros)."
      />

      <AlertBox type="info" title="Estilo importa">
        <p>
          Use <strong>shellcheck</strong> sempre. Indente com 2 espaços. Funções em snake_case.
          Constantes em UPPER. Se um script passa de ~300 linhas, considere reescrever em
          Python — bash não tem tipos, debug fica caro.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
