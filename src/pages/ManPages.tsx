import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ManPages() {
  return (
    <PageContainer
      title="Documentação no terminal"
      subtitle="man, info, --help, apropos, whatis, tldr, navi — ler man page rápido vale mais que decorar comando."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Por que isso importa em pentest</h2>
      <p>
        Em uma engagement você cai numa shell limitada de um host estranho. Sem internet,
        sem stackoverflow, sem ChatGPT. <strong>Tudo</strong> que você sabe sobre uma flag
        está naquela máquina — em man pages e <code>--help</code>. Saber ler isso em 30
        segundos diferencia o pentester sênior do júnior que fica refém do navegador.
      </p>

      <h2>man — manual oficial</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "man nmap | head -20",
            out: `NMAP(1)                                 Nmap Reference Guide                                 NMAP(1)

NAME
       nmap - Network exploration tool and security / port scanner

SYNOPSIS
       nmap [Scan Type...] [Options] {target specification}

DESCRIPTION
       Nmap (\"Network Mapper\") is an open source tool for network exploration and security
       auditing. It was designed to rapidly scan large networks, although it works fine against
       single hosts. Nmap uses raw IP packets in novel ways to determine what hosts are available
       on the network, what services (application name and version) those hosts are offering, what
       operating systems (and OS versions) they are running, what type of packet filters/firewalls
       are in use, and dozens of other characteristics.

       The output from Nmap is a list of scanned targets, with supplemental information on each
       depending on the options used. Key among that information is the "interesting ports
       table". The output then differentiates each port by service and protocol.`,
            outType: "info",
          },
        ]}
      />

      <h2>As 9 seções do manual</h2>
      <CommandTable
        title="quando uma palavra existe em mais de uma seção"
        variations={[
          { cmd: "man 1 ...", desc: "Comandos de usuário (executáveis no PATH).", output: "ls, nmap, curl, vim, ssh." },
          { cmd: "man 2 ...", desc: "Syscalls (chamadas direto pro kernel).", output: "open(2), execve(2), socket(2)." },
          { cmd: "man 3 ...", desc: "Funções de biblioteca C (libc).", output: "printf(3), malloc(3), strncpy(3)." },
          { cmd: "man 4 ...", desc: "Special files / devices em /dev.", output: "tty(4), random(4), null(4)." },
          { cmd: "man 5 ...", desc: "Formatos de arquivo de configuração.", output: "passwd(5), crontab(5), sshd_config(5)." },
          { cmd: "man 6 ...", desc: "Jogos.", output: "Praticamente vazio em distros modernas." },
          { cmd: "man 7 ...", desc: "Convenções e miscelânea (regex, ascii).", output: "regex(7), unicode(7), capabilities(7)." },
          { cmd: "man 8 ...", desc: "Comandos de administração de sistema.", output: "iptables(8), mount(8), useradd(8)." },
          { cmd: "man 9 ...", desc: "Rotinas internas do kernel.", output: "Raro fora de docs do kernel." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "passwd existe em duas seções: ferramenta E formato de arquivo",
            cmd: "man -k '^passwd$'",
            out: `passwd (1)           - change user password
passwd (1ssl)        - compute password hashes
passwd (5)           - the password file`,
            outType: "info",
          },
          {
            cmd: "man 5 passwd | head -8",
            out: `PASSWD(5)              File Formats Manual              PASSWD(5)

NAME
       passwd - the password file

DESCRIPTION
       The /etc/passwd file is a text file that describes user
       login accounts for the system. It should have read permission
       allowed for all users (many utilities, like ls(1), use it...`,
            outType: "default",
          },
        ]}
      />

      <h2>Navegação dentro do man (less)</h2>
      <CodeBlock
        language="bash"
        title="atalhos do less — funcionam em man, journalctl, git log..."
        code={`# Movimento
SPACE    avança 1 tela
b        volta 1 tela
d / u    avança/volta meia tela
G        vai pro fim
gg / 1G  vai pro início
N G      vai pra linha N (ex: 100G)

# Busca
/texto   busca pra frente
?texto   busca pra trás
n        próxima ocorrência
N        ocorrência anterior
&texto   FILTRA — mostra só linhas com 'texto'

# Marcadores
ma       marca posição como 'a'
'a       volta pra marca 'a'

# Saída
q        sai
h        ajuda completa do less

# Especial em man
\\-iU       case-insensitive
\\<inicio   word boundary inicial
[Pp]ort    classe de char`}
      />

      <h2>Encontrar man page certa</h2>
      <CommandTable
        title="apropos / whatis / man -k"
        variations={[
          { cmd: "whatis nmap", desc: "Resumo de uma linha (lê NAME do man).", output: "nmap (1) - Network exploration tool and security / port scanner" },
          { cmd: "apropos firewall", desc: "Procura na descrição de TODAS as man pages.", output: "iptables (8) - administration tool for IPv4 packet filtering and NAT\\nufw (8)      - program for managing a netfilter firewall" },
          { cmd: "man -k password", desc: "= apropos. Útil pra descobrir o que existe.", output: "openssl-passwd (1ssl), passwd (1), passwd (5), shadow (5)..." },
          { cmd: "man -K 'CVE-'", desc: "GREP no CONTEÚDO de TODAS as man pages (lento).", output: "Útil pra achar tools que mencionam CVEs específicas." },
          { cmd: "man -f passwd", desc: "= whatis.", output: "passwd (1), passwd (5)..." },
          { cmd: "man -wK proxychains", desc: "Lista os arquivos das man pages que casam.", output: "/usr/share/man/man1/proxychains.1.gz" },
        ]}
      />

      <h2>--help, -h e ajuda inline</h2>
      <p>
        Tools modernas (especialmente Go/Rust) muitas vezes nem instalam man page —
        a documentação inteira está em <code>--help</code>. Saber direcionar isso
        é fundamental:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ffuf --help 2>&1 | head -10",
            out: `Fuzz Faster U Fool - v2.1.0

HTTP OPTIONS:
  -H              Header \`"Name: Value"\`, separated by colon. Multiple -H flags are accepted.
  -X              HTTP method to use
  -b              Cookie data \`"NAME1=VALUE1; NAME2=VALUE2"\` for copy as curl functionality.
  -d              POST data
  -r              Follow redirects
  -recursion      Scan recursively. Only FUZZ keyword is supported, and URL (-u) has to end in it.`,
            outType: "info",
          },
          {
            comment: "filtrar com grep -A pra ver flag + descricao + exemplos",
            cmd: "nmap --help 2>&1 | grep -A1 -i 'evasion'",
            out: `FIREWALL/IDS EVASION AND SPOOFING:
  -f; --mtu <val>: fragment packets (optionally w/ given MTU)
  -D <decoy1,decoy2[,ME],...>: Cloak a scan with decoys
  -S <IP_Address>: Spoof source address`,
            outType: "warning",
          },
          {
            comment: "fzf+grep para busca interativa em --help (game changer)",
            cmd: "nmap --help | fzf --no-sort --reverse",
            out: "(abre TUI fuzzy-search dentro da própria saída de --help)",
            outType: "muted",
          },
        ]}
      />

      <h2>info — manuais GNU expandidos</h2>
      <p>
        Algumas tools GNU (coreutils, gcc, gdb, bash) têm <strong>info pages</strong>: hipertexto
        em terminal, mais detalhado que o man. Navegação parecida com Emacs.
      </p>

      <CodeBlock
        language="bash"
        title="atalhos do info"
        code={`SPACE / DEL  próxima/anterior tela
n / p        próximo/anterior nó (capítulo)
u            sobe um nível
TAB          pula entre links
ENTER        segue link
l            volta (history)
s            busca
g <nó>       vai pra nó especifico
q            sai`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "info do bash é EXAUSTIVO (200+ páginas) — vale a pena pra entender expansões",
            cmd: "info bash 'Shell Parameter Expansion'",
            out: "(abre direto na seção de expansões — \\${var:-default}, \\${var//pattern/repl}, etc.)",
            outType: "default",
          },
        ]}
      />

      <h2>tldr — exemplos rápidos da comunidade</h2>
      <p>
        <code>tldr</code> é um projeto comunitário com cheatsheets de uma página por comando.
        Em vez do man verboso, você vê 5 exemplos práticos. Em Kali: <code>sudo apt install tldr</code>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "tldr update",
            out: "Successfully updated local database",
            outType: "muted",
          },
          {
            cmd: "tldr nmap",
            out: `nmap

  Network exploration tool and security / port scanner.
  More information: https://nmap.org.

  - Check if a target is up using a TCP SYN scan to common ports:
    sudo nmap -sS target

  - Check if specific ports are open on one or more targets:
    nmap -p port1,port2,...,portN target1,target2,...,targetN

  - Scan ports in a range on one or more targets:
    nmap -p 1-1023 target

  - Run default scripts and identify service versions on common ports:
    sudo nmap -sC -sV target

  - Try to determine the operating system of a target:
    sudo nmap -O target

  - Aggressive scan: OS detection, version detection, script scanning, traceroute:
    sudo nmap -A target`,
            outType: "info",
          },
        ]}
      />

      <h2>navi — cheatsheets executáveis</h2>
      <p>
        <code>navi</code> (denisidoro/navi) é tipo o tldr, mas <em>interativo</em>: escolhe
        o comando no fzf, ele pede os parâmetros, executa.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y navi && navi --print",
            out: `(abre fzf TUI com TODOS os cheats; navega, escolhe, ele preenche e roda)`,
            outType: "default",
          },
        ]}
      />

      <h2>Atualizar o índice de busca (mandb)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "depois de instalar tools novas (especialmente custom), atualize o mandb",
            cmd: "sudo mandb",
            out: `Purging old database entries in /usr/share/man...
Processing manual pages under /usr/share/man...
Updating index cache for path \`/usr/share/man/man1'. Wait...
Updating index cache for path \`/usr/share/man/man8'. Wait...
12 man subdirectories contained newer manual pages.
198 manual pages were added.
0 stray cats were added.
0 old database entries were ignored.`,
            outType: "success",
          },
          {
            comment: "ler man page de arquivo arbitrario (usado quando voce baixa tool sem instalar)",
            cmd: "man ./tool.1",
            out: "(lê a man page no caminho especificado, sem precisar instalar)",
            outType: "muted",
          },
        ]}
      />

      <h2>Truques de man avançados</h2>
      <CommandTable
        title="combinações que valem ouro"
        variations={[
          { cmd: "MANPAGER='vim -M +MANPAGER -' man nmap", desc: "Lê man no vim (search regex Vim, splits, syntax).", output: "Setar MANPAGER no .bashrc deixa default." },
          { cmd: "man -P 'less -isR' nmap", desc: "Força pager específico (case-insens, smartcase, raw).", output: "Útil em sistemas onde MANPAGER vem mal config." },
          { cmd: "man -t nmap | ps2pdf - nmap.pdf", desc: "Gera PDF da man page.", output: "Para anexar em relatório de pentest." },
          { cmd: "man -L pt_BR.UTF-8 ls", desc: "Tenta ler tradução PT-BR (precisa man-pages-pt-br).", output: "Maioria das tools de pentest só tem em inglês." },
          { cmd: "MANWIDTH=100 man nmap", desc: "Força largura específica (útil em terminal apertado).", output: "Default é a largura do terminal." },
          { cmd: "man --regex '^net'", desc: "Regex no nome do comando.", output: "netcat, netstat, netplan, nettle..." },
          { cmd: "man -a passwd", desc: "Mostra TODAS as seções em sequência.", output: "Sai do passwd(1), entra no passwd(5)." },
        ]}
      />

      <h2>Quando man não existe ou está mentindo</h2>
      <CommandTable
        title="alternativas em ordem de preferência"
        variations={[
          { cmd: "tool --help", desc: "Quase sempre existe. Tools Go/Rust raramente têm man.", output: "Usage: tool [OPTIONS] ..." },
          { cmd: "tool -h", desc: "Atalho padrão.", output: "Cuidado: em alguns tools -h é diferente de --help." },
          { cmd: "help <builtin>", desc: "Builtins do bash (cd, export, set, history, jobs).", output: "help cd → mostra ajuda do cd builtin." },
          { cmd: "type comando", desc: "Diz se é builtin, alias, função ou binário em PATH.", output: "type cd → 'cd is a shell builtin'" },
          { cmd: "which / whereis", desc: "Localiza binário no filesystem.", output: "Pra ler o script (se for shell) com cat." },
          { cmd: "tool --version", desc: "Saber a versão pra checar CVEs.", output: "Útil em enumeração de host comprometido." },
          { cmd: "strings $(which tool) | head -100", desc: "Quando NÃO TEM nada disso.", output: "Strings hardcoded no binário às vezes revelam flags ocultas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "investigar binário misterioso (sem man, sem --help)",
            cmd: "file /opt/custom/scanner && strings /opt/custom/scanner | grep -E '^-[a-zA-Z-]+$' | head",
            out: `/opt/custom/scanner: ELF 64-bit LSB executable, x86-64, dynamically linked
-h
--help
-v
-target
-port
-output
-debug
-threads`,
            outType: "warning",
          },
        ]}
      />

      <h2>Aliases pessoais que fazem diferença</h2>
      <CodeBlock
        language="bash"
        title="adicionar em ~/.bashrc ou ~/.zshrc"
        code={`# Vim como pager do man (busca regex completa)
export MANPAGER='vim -M +MANPAGER -'
# OU bat (mais bonito)
# export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# tldr first, man fallback
howto() {
  tldr "$1" 2>/dev/null || man "$1"
}

# Procurar flag rapidamente
manflag() {
  man "$1" 2>/dev/null | grep -E "^\\s+-+$2" -A 2
}
# uso: manflag nmap O   -> mostra ajuda da flag -O do nmap

# Listar todos os scripts NSE do nmap por categoria
nse() {
  ls /usr/share/nmap/scripts/ | grep -i "$1"
}`}
      />

      <PracticeBox
        title="Achar a flag certa em 60 segundos"
        goal="Sem usar internet, descobrir como o nmap envia pacotes fragmentados E como combinar com decoy."
        steps={[
          "Use apropos pra confirmar que existe man do nmap.",
          "Abra man nmap e pule pra seção FIREWALL/IDS EVASION.",
          "Identifique a flag de fragmentação E a de decoy.",
          "Monte o comando final.",
          "(Bônus) Olhe man -k 'evasion' pra ver outras tools.",
        ]}
        command={`apropos nmap | head -3
man nmap                         # depois: /FIREWALL/IDS EVASION + ENTER
# anote: -f (fragmenta), -D (decoys)
echo "comando final:"
echo "sudo nmap -f -D 10.0.0.5,10.0.0.7,ME -sS -p 80,443 alvo.com"`}
        expected={`nmap (1)             - Network exploration tool and security / port scanner

FIREWALL/IDS EVASION AND SPOOFING:
  -f; --mtu <val>: fragment packets (optionally w/ given MTU)
  -D <decoy1,decoy2[,ME],...>: Cloak a scan with decoys

comando final:
sudo nmap -f -D 10.0.0.5,10.0.0.7,ME -sS -p 80,443 alvo.com`}
        verify="Você conseguiu sem abrir o navegador. Cronometre — meta: < 60 segundos do apropos até o comando montado."
      />

      <AlertBox type="info" title="Hábito de profissional">
        Antes de pesquisar uma flag no Google, abra a man page. 90% das vezes a resposta
        está lá em 30 segundos. E em pentest internal sem acesso à internet, esse hábito
        deixa de ser preferência e vira sobrevivência.
      </AlertBox>
    </PageContainer>
  );
}
