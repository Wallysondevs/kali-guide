import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Zsh() {
  return (
    <PageContainer
      title="Zsh — o shell padrão do Kali"
      subtitle="Por que o Kali abandonou o Bash e como turbinar o Zsh com Oh My Zsh, plugins e Powerlevel10k."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Por que Zsh no Kali</h2>
      <p>
        Desde 2020.4 o <strong>Zsh é o shell default</strong> de novos usuários no Kali. Ele é
        compatível com a maior parte da sintaxe Bash, mas adiciona: autosuggestions, syntax
        highlighting, globbing avançado (<code>**/*.txt</code>), histórico compartilhado entre
        terminais, prompt customizável e correção de typos. Para quem passa o dia em terminal
        fazendo recon, é diferença real de produtividade.
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
            cmd: "zsh --version",
            out: "zsh 5.9 (x86_64-debian-linux-gnu)",
            outType: "info",
          },
          {
            cmd: "cat /etc/passwd | grep $USER",
            out: "wallyson:x:1000:1000:Wallyson,,,:/home/wallyson:/usr/bin/zsh",
            outType: "default",
          },
        ]}
      />

      <h2>Trocar para Zsh (e voltar)</h2>
      <CommandTable
        title="Mudança de shell"
        variations={[
          { cmd: "chsh -s $(which zsh)", desc: "Define Zsh como shell de login para o seu usuário.", output: "(reinicia sessão depois)" },
          { cmd: "chsh -s /bin/bash", desc: "Volta para Bash.", output: "Útil se algum script de cliente assume bash." },
          { cmd: "sudo chsh -s $(which zsh) root", desc: "Trocar shell do root.", output: "Cuidado: scripts de boot esperam sh/bash." },
          { cmd: "cat /etc/shells", desc: "Lista shells válidos do sistema.", output: "/bin/bash\\n/bin/zsh\\n/bin/dash" },
          { cmd: "exec zsh", desc: "Trocar AGORA na sessão atual sem logout.", output: "Substitui o processo do shell." },
        ]}
      />

      <h2>Anatomia da config Zsh</h2>
      <CommandTable
        title="Arquivos do Zsh (ordem de leitura)"
        variations={[
          { cmd: "/etc/zsh/zshenv", desc: "Sempre, primeiro. Variáveis de ambiente globais.", output: "Para TODOS shells (login, interativo, script)." },
          { cmd: "~/.zshenv", desc: "Mesmo, por usuário.", output: "Use para PATH, EDITOR, LANG." },
          { cmd: "/etc/zsh/zprofile + ~/.zprofile", desc: "Só em login shells.", output: "Equivale a .bash_profile." },
          { cmd: "/etc/zsh/zshrc + ~/.zshrc", desc: "Só interativo. Aliases, plugins, prompt.", output: "Onde 99% da sua config vai." },
          { cmd: "~/.zlogin", desc: "Após zshrc, em login shells.", output: "Quase nunca usado." },
          { cmd: "~/.zlogout", desc: "Ao sair de login shell.", output: "Limpeza, lock, etc." },
        ]}
      />

      <h2>Oh My Zsh</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "instalação one-liner",
            cmd: 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
            out: `Cloning Oh My Zsh...
Looking for an existing zsh config...
Found ~/.zshrc. Backing up to ~/.zshrc.pre-oh-my-zsh
Using the Oh My Zsh template file and adding it to ~/.zshrc.

         __                                     __
  ____  / /_     ____ ___  __  __   ____  _____/ /_
 / __ \\/ __ \\   / __ \`__ \\/ / / /  /_  / / ___/ __ \\
/ /_/ / / / /  / / / / / / /_/ /    / /_(__  ) / / /
\\____/_/ /_/  /_/ /_/ /_/\\__, /    /___/____/_/ /_/
                        /____/

→ Now type 'omz help' to learn how to customize OMZ.`,
            outType: "success",
          },
          {
            cmd: "ls ~/.oh-my-zsh/themes | wc -l",
            out: "150",
            outType: "info",
          },
        ]}
      />

      <AlertBox type="warning" title="Curl | sh em produção?">
        <p>
          Em pentest engagement, NUNCA rode <code>curl | sh</code> de URL externa em máquina do
          cliente. Em sua máquina pessoal, leia o script antes:
          <code>curl -fsSL https://.../install.sh | less</code>.
        </p>
      </AlertBox>

      <h2>Plugins essenciais</h2>
      <CodeBlock
        language="bash"
        title="~/.zshrc — trecho de plugins"
        code={`# theme: usaremos powerlevel10k (ver abaixo)
ZSH_THEME="powerlevel10k/powerlevel10k"

# plugins ativos
plugins=(
  git              # aliases gst, gco, gpu, gp, glog
  sudo             # ESC ESC = prepende sudo no comando atual
  history          # h, hsi (history search interactive)
  z                # cd inteligente baseado em frequência
  fzf              # fuzzy finder em CTRL+R, CTRL+T
  zsh-autosuggestions
  zsh-syntax-highlighting
  docker
  kubectl
  python
)

source $ZSH/oh-my-zsh.sh

# aliases pentest
alias ll='ls -lah'
alias ports='ss -tulnp'
alias myip='curl -s ifconfig.me'
alias serve='python3 -m http.server 8000'
alias rs='rlwrap nc -lvnp 4444'
alias scan='sudo nmap -sCV -T4'`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar os plugins externos",
            cmd: "git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions",
            out: `Cloning into '~/.oh-my-zsh/custom/plugins/zsh-autosuggestions'...
Receiving objects: 100% (2389/2389), 599.41 KiB | 4.20 MiB/s, done.`,
            outType: "info",
          },
          {
            cmd: "git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting",
            out: `Cloning into '~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting'...`,
            outType: "info",
          },
          {
            cmd: "exec zsh",
            out: "(novo shell carregado com plugins ativos)",
            outType: "muted",
          },
        ]}
      />

      <h2>Powerlevel10k</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k",
            out: `Cloning into '~/.oh-my-zsh/custom/themes/powerlevel10k'...
Receiving objects: 100% (1247/1247), 2.81 MiB | 9.42 MiB/s, done.`,
            outType: "info",
          },
          {
            comment: "depois de setar ZSH_THEME, o wizard roda automático",
            cmd: "p10k configure",
            out: `This is Powerlevel10k configuration wizard.
You are seeing it because you haven't configured Powerlevel10k.

Choose prompt style:
  (1) Lean.       (2) Classic.   (3) Rainbow.    (4) Pure.
Choice [1234rq]:`,
            outType: "default",
          },
        ]}
      />

      <h2>Histórico (compartilhado entre abas)</h2>
      <CodeBlock
        language="bash"
        title="~/.zshrc — config de histórico"
        code={`HISTFILE=~/.zsh_history
HISTSIZE=50000
SAVEHIST=50000

setopt EXTENDED_HISTORY        # salva timestamp
setopt INC_APPEND_HISTORY      # grava na hora, não ao fechar
setopt SHARE_HISTORY           # compartilha entre abas em tempo real
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE       # comando começando com espaço NÃO grava
setopt HIST_VERIFY             # !!  pede confirmação antes de executar
setopt HIST_REDUCE_BLANKS

# em pentest: NÃO loggar comando com senha — preceda com espaço
# alias para apagar histórico atual sem deixar rastro
alias nohist='unset HISTFILE && history -p'`}
      />

      <AlertBox type="danger" title="Zsh history em pentest engagement">
        <p>
          O <code>~/.zsh_history</code> é um <strong>diário forense</strong> do que você fez na
          máquina do cliente. Em jump host de cliente, considere <code>HISTFILE=/dev/null</code>
          ou <code>unset HISTFILE</code> antes de qualquer comando ofensivo. Comandos com espaço
          inicial não são gravados (com <code>HIST_IGNORE_SPACE</code>).
        </p>
      </AlertBox>

      <h2>Globbing avançado</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "setopt extended_glob",
            out: "(habilita padrões avançados)",
            outType: "muted",
          },
          {
            comment: "todos .py recursivo (Bash precisaria de globstar)",
            cmd: "ls **/*.py",
            out: `tools/scan.py
tools/exploit/cve-2024-1234.py
labs/htb/blue/poc.py`,
            outType: "default",
          },
          {
            comment: "exclusão (^pattern)",
            cmd: "ls *.txt~temp.txt",
            out: "notes.txt  loot.txt  passwords.txt",
            outType: "info",
          },
          {
            comment: "qualifiers: arquivos modificados nos últimos 2 dias",
            cmd: "ls -l **/*(.m-2)",
            out: `-rw-r--r-- 1 wallyson wallyson 1247 Apr  3 09:12 nmap.gnmap
-rw-r--r-- 1 wallyson wallyson 8294 Apr  4 14:33 web.txt`,
            outType: "default",
          },
          {
            comment: "só executáveis",
            cmd: "ls *(*)",
            out: "exploit.sh  scan.py  recon.sh",
            outType: "default",
          },
        ]}
      />

      <h2>Atalhos do shell que pagam o preço de migrar</h2>
      <CommandTable
        title="Keybindings + features"
        variations={[
          { cmd: "↑ (após digitar prefixo)", desc: "Busca histórico que começa com o que você digitou.", output: "Digite 'nm' + ↑ → percorre só comandos nmap." },
          { cmd: "Ctrl+R", desc: "Fuzzy search no histórico (com plugin fzf).", output: "Lista interativa, type para filtrar." },
          { cmd: "Tab Tab", desc: "Autocomplete de flags com descrição: nmap -<TAB><TAB>.", output: "-A  enable OS detection, version, script scanning..." },
          { cmd: "Esc Esc", desc: "Plugin sudo: prepende sudo no último comando.", output: "Esqueceu sudo? duas teclas." },
          { cmd: "z htb", desc: "Plugin z: pula para diretório frequente cujo nome contém 'htb'.", output: "/home/wallyson/labs/htb" },
          { cmd: "Alt+.", desc: "Insere o último argumento do comando anterior.", output: "Igual Bash, útil em sequência cd /tmp/foo; ls Alt+." },
          { cmd: "take novodir", desc: "mkdir + cd em um comando.", output: "(plugin built-in OMZ)" },
        ]}
      />

      <h2>Migrando aliases do Bash</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "grep -E '^(alias|export)' ~/.bashrc ~/.bash_aliases 2>/dev/null > ~/.zsh_legacy",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "echo 'source ~/.zsh_legacy' >> ~/.zshrc && exec zsh",
            out: "(aliases do bash agora carregam no zsh)",
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Setup completo Zsh + OMZ + p10k + plugins pentest"
        goal="Em uma VM Kali fresca, instalar Zsh com Powerlevel10k, autosuggestions e syntax-highlighting em menos de 5 minutos."
        steps={[
          "Verifique se zsh já é o shell.",
          "Instale Oh My Zsh.",
          "Clone os 3 plugins/temas externos.",
          "Edite ~/.zshrc e ative.",
          "Rode p10k configure e escolha Rainbow.",
        ]}
        command={`echo $SHELL  # deve mostrar /usr/bin/zsh

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

ZSH_CUSTOM=\${ZSH_CUSTOM:-~/.oh-my-zsh/custom}
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting $ZSH_CUSTOM/plugins/zsh-syntax-highlighting

sed -i 's|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|' ~/.zshrc
sed -i 's|^plugins=.*|plugins=(git sudo z fzf zsh-autosuggestions zsh-syntax-highlighting)|' ~/.zshrc

exec zsh
p10k configure`}
        expected={`(novo prompt colorido com hostname, branch git, exit code, tempo de execução)`}
        verify="Digite 'nma' e pressione → (seta direita) — autosuggestion deve completar com algum comando nmap anterior."
      />

      <AlertBox type="info" title="Bash continua sendo a lingua franca de scripts">
        <p>
          Use Zsh como shell <em>interativo</em> (terminal aberto). Para scripts (<code>#!/usr/bin/env bash</code>),
          mantenha Bash — funciona em qualquer Linux do planeta, inclusive Alpine de container e
          shell minimalista de target hackeado.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
