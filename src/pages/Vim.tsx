import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Vim() {
  return (
    <PageContainer
      title="Vim — o editor que está em todo lugar"
      subtitle="Domine o suficiente para editar /etc/passwd em uma reverse shell sem GUI, sem mouse e sem entrar em pânico."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Por que aprender Vim (mesmo se você ama VS Code)</h2>
      <p>
        Em pentest, mais cedo ou mais tarde você cai numa <strong>reverse shell</strong> em uma
        máquina onde só existe <code>vi</code>/<code>vim</code>. Você precisa editar
        <code>/etc/cron.d/job</code>, um <code>.bashrc</code> para persistência ou um arquivo de
        configuração de webshell. Não há nano. Não há scp. Não há GUI. <strong>Saber sair do
        Vim</strong> não é meme — é skill obrigatória.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "which vi vim && vim --version | head -1",
            out: `/usr/bin/vi
/usr/bin/vim
VIM - Vi IMproved 9.1 (2024 Jan 02, compiled Mar 12 2024)`,
            outType: "info",
          },
        ]}
      />

      <h2>Os 3 modos (e como NÃO se confundir)</h2>
      <CommandTable
        title="Modos do Vim"
        variations={[
          { cmd: "Normal (default)", desc: "Você navega e dá comandos. Cada tecla é um atalho.", output: "Aperte ESC para voltar aqui SEMPRE que se perder." },
          { cmd: "Insert (i, a, o)", desc: "Você digita texto normalmente.", output: "Indicador no rodapé: -- INSERT --" },
          { cmd: "Visual (v, V, Ctrl+v)", desc: "Você seleciona texto (char/linha/bloco).", output: "Indicador: -- VISUAL --, -- VISUAL LINE --" },
          { cmd: "Command (:)", desc: "Você dá comando ex (:w, :q, :%s/...)", output: "Cursor pula para a barra inferior." },
          { cmd: "Replace (R)", desc: "Sobrescreve enquanto digita.", output: "-- REPLACE -- (raro de usar)" },
        ]}
      />

      <h2>Sair do Vim (a pergunta mais Googlada do mundo)</h2>
      <CommandTable
        title="Modo command (aperte : antes)"
        variations={[
          { cmd: ":w", desc: "Salva (write).", output: '"arquivo.txt" 47L, 1283B written' },
          { cmd: ":q", desc: "Sai (quit). Falha se houve mudanças.", output: "E37: No write since last change" },
          { cmd: ":wq  ou  :x  ou  ZZ", desc: "Salva E sai.", output: "ZZ é em modo normal (sem :)." },
          { cmd: ":q!", desc: "Sai DESCARTANDO mudanças.", output: "Use quando estraga tudo." },
          { cmd: ":wqa", desc: "Salva e sai de TODOS buffers/splits.", output: "Útil quando :sp aberto." },
          { cmd: ":w !sudo tee %", desc: "Salva como root mesmo sem ter aberto com sudo.", output: "Salvador em /etc/* quando esqueceu sudo." },
        ]}
      />

      <h2>Navegação (modo normal)</h2>
      <CommandTable
        title="Movimento — sem flechas, mais rápido"
        variations={[
          { cmd: "h j k l", desc: "Esquerda / Baixo / Cima / Direita.", output: "Mãos não saem da home row." },
          { cmd: "w / W", desc: "Próxima palavra (W ignora pontuação).", output: "5w = pula 5 palavras." },
          { cmd: "b / B", desc: "Palavra anterior.", output: "" },
          { cmd: "0 / ^ / $", desc: "Início linha / primeiro não-branco / fim linha.", output: "" },
          { cmd: "gg / G", desc: "Topo / fim do arquivo.", output: "10G = vai para linha 10." },
          { cmd: ":42", desc: "Pula para linha 42.", output: "" },
          { cmd: "Ctrl+d / Ctrl+u", desc: "Página meia para baixo / cima.", output: "Ctrl+f / Ctrl+b = página inteira." },
          { cmd: "f<char>  /  t<char>", desc: "Pula para próximo <char> / até antes dele.", output: "fx pula para o próximo 'x'. ; repete." },
          { cmd: "% ", desc: "Pula para parêntese/chave correspondente.", output: "Útil em código." },
          { cmd: "*", desc: "Busca a palavra sob o cursor (próxima ocorrência).", output: "# = ocorrência anterior." },
        ]}
      />

      <h2>Edição básica</h2>
      <CommandTable
        title="Inserir, deletar, copiar, colar"
        variations={[
          { cmd: "i / a", desc: "Insert antes / depois do cursor.", output: "I = início linha; A = fim linha." },
          { cmd: "o / O", desc: "Abre nova linha abaixo / acima e entra em insert.", output: "Mais rápido que A + Enter." },
          { cmd: "x", desc: "Deleta caractere sob cursor.", output: "5x = deleta 5 chars." },
          { cmd: "dd", desc: "Deleta (= recorta) linha.", output: "5dd = 5 linhas. Vai pro registrador." },
          { cmd: "dw / d$ / d0", desc: "Deleta palavra / até fim / até início linha.", output: "" },
          { cmd: "yy", desc: "Copia (yank) linha.", output: "5yy = 5 linhas." },
          { cmd: "p / P", desc: "Cola depois / antes do cursor.", output: "" },
          { cmd: "u  /  Ctrl+r", desc: "Undo / Redo.", output: "Vim tem undo árvore (não linear)." },
          { cmd: ".", desc: "Repete o ÚLTIMO comando.", output: "Combinação matadora: dw...." },
          { cmd: "r<char>", desc: "Substitui 1 char sem entrar em insert.", output: "rA troca o char por 'A'." },
          { cmd: "cw", desc: "Apaga palavra E entra em insert.", output: "(change word)" },
        ]}
      />

      <h2>Busca e substituição</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vim /etc/cron.d/persist",
            out: `# /etc/cron.d/persist
*/5 * * * * www-data /tmp/.payload.sh
~
~
"/etc/cron.d/persist" 2L, 59B`,
            outType: "default",
          },
          {
            cmd: "/payload",
            out: "(busca a palavra 'payload' — n vai para próxima, N volta)",
            outType: "muted",
          },
          {
            cmd: ":%s/www-data/root/g",
            out: "1 substitution on 1 line",
            outType: "warning",
          },
          {
            comment: "%s = todas linhas, /g = todas ocorrências, /c = pede confirmação",
            cmd: ":%s/old/new/gc",
            out: "replace with new (y/n/a/q/l/^E/^Y)?",
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Sintaxe do :s (substitute)"
        variations={[
          { cmd: ":s/foo/bar/", desc: "Linha atual, primeira ocorrência.", output: "" },
          { cmd: ":s/foo/bar/g", desc: "Linha atual, todas ocorrências.", output: "" },
          { cmd: ":%s/foo/bar/g", desc: "Arquivo todo, todas ocorrências.", output: "% = todas as linhas." },
          { cmd: ":%s/foo/bar/gc", desc: "Idem com confirmação por ocorrência.", output: "y/n/a(ll)/q(uit)" },
          { cmd: ":10,20s/foo/bar/g", desc: "Só linhas 10 a 20.", output: "" },
          { cmd: ":g/erro/d", desc: "Deleta toda linha que contém 'erro'.", output: "Útil para limpar logs." },
          { cmd: ":g!/^#/d", desc: "Deleta linhas que NÃO começam com #.", output: "" },
        ]}
      />

      <h2>Buffers, splits e tabs</h2>
      <CommandTable
        title="Trabalhar com vários arquivos"
        variations={[
          { cmd: ":e arquivo.txt", desc: "Abre arquivo no buffer atual.", output: "" },
          { cmd: ":sp arquivo", desc: "Split horizontal.", output: "Ctrl+w j/k para alternar." },
          { cmd: ":vsp arquivo", desc: "Split vertical (lado a lado).", output: "Ctrl+w h/l para alternar." },
          { cmd: "Ctrl+w w", desc: "Próximo split.", output: "Ctrl+w c = fecha split atual." },
          { cmd: ":tabnew arq", desc: "Nova aba.", output: "gt / gT = próxima/anterior aba." },
          { cmd: ":ls / :buffers", desc: "Lista buffers abertos.", output: "1 %a 'recon.sh'  2 #  'notes.md'" },
          { cmd: ":b<n>  ou  :b nome", desc: "Pula para buffer.", output: ":b2 ou :b notes" },
          { cmd: ":bd", desc: "Fecha buffer atual.", output: "" },
        ]}
      />

      <h2>.vimrc — config mínima de pentester</h2>
      <CodeBlock
        language="vim"
        title="~/.vimrc"
        code={`" --- básico ---
set nocompatible
syntax on
filetype plugin indent on
set number relativenumber
set ruler showcmd
set cursorline
set hidden
set mouse=a
set clipboard=unnamedplus

" --- busca ---
set ignorecase smartcase
set incsearch hlsearch

" --- indent ---
set expandtab
set tabstop=2 softtabstop=2 shiftwidth=2
set autoindent smartindent

" --- arquivo ---
set encoding=utf-8
set fileformat=unix
set undofile
set undodir=~/.vim/undo

" --- backup OFF (em pentest, não deixar .swp na máquina do alvo) ---
set nobackup nowritebackup noswapfile

" --- atalhos ---
let mapleader = " "
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>
nnoremap <leader>/ :nohlsearch<CR>
nnoremap <leader>n :set relativenumber!<CR>

" --- mostrar whitespace problemático ---
set list listchars=tab:»·,trail:·,nbsp:␣

" --- cores ---
colorscheme desert`}
      />

      <AlertBox type="warning" title=".swp file = você foi visto">
        <p>
          Por padrão o Vim cria <code>.arquivo.swp</code> ao editar. Em uma máquina invadida,
          esse arquivo entrega que alguém (você) abriu o arquivo e fica em disco mesmo se você
          fechar mal. Use <code>vim -n</code> ou configure <code>set noswapfile</code> no
          <code>.vimrc</code>. O mesmo vale para <code>.viminfo</code> que guarda histórico.
        </p>
      </AlertBox>

      <h2>Plugins com vim-plug</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim",
            out: `  % Total    % Received % Xferd  Average Speed
100 39391  100 39391    0     0  98.4k      0 --:--:-- --:--:-- 98.6k`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="vim"
        title="~/.vimrc — bloco de plugins"
        code={`call plug#begin('~/.vim/plugged')

Plug 'preservim/nerdtree'           " árvore de arquivos
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'             " :Files, :Rg, :Buffers
Plug 'tpope/vim-commentary'         " gcc comenta linha
Plug 'tpope/vim-surround'           " ysiw" envolve com aspas
Plug 'jiangmiao/auto-pairs'
Plug 'morhetz/gruvbox'              " theme
Plug 'vim-airline/vim-airline'

call plug#end()

colorscheme gruvbox
set background=dark

" abrir nerdtree com Ctrl+n
nnoremap <C-n> :NERDTreeToggle<CR>
nnoremap <C-p> :Files<CR>
nnoremap <leader>f :Rg<Space>`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "dentro do vim",
            cmd: ":PlugInstall",
            out: `Updated. Elapsed time: 4.231231 sec.
- Finishing ... Done!
- nerdtree: OK
- fzf.vim: OK
- vim-commentary: OK
- gruvbox: OK
- vim-airline: OK`,
            outType: "success",
          },
        ]}
      />

      <h2>Editar config remoto via reverse shell</h2>
      <p>
        Cenário comum: você ganhou shell em www-data e precisa editar
        <code>/etc/cron.d/exploit</code> para escalar privilégio (cron rodando como root). A
        shell é <code>/bin/sh</code> meia-boca, sem TTY. Antes de qualquer Vim, faça upgrade:
      </p>

      <Terminal
        path="/var/www"
        user="www-data"
        host="vuln-target"
        lines={[
          {
            comment: "shell ruim — Vim vai dar erro de TERM",
            cmd: "vim /etc/passwd",
            out: `Vim: Warning: Output is not to a terminal
Vim: Warning: Input is not from a terminal`,
            outType: "error",
          },
          {
            comment: "upgrade da shell",
            cmd: 'python3 -c "import pty;pty.spawn(\'/bin/bash\')"',
            out: "(prompt agora é interativo)",
            outType: "info",
          },
          {
            comment: "definir TERM",
            cmd: "export TERM=xterm-256color && stty rows 40 cols 120",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "agora Vim funciona",
            cmd: "vim /tmp/test.sh",
            out: "(tela cheia, navegação normal)",
            outType: "success",
          },
        ]}
      />

      <h2>Vim como vetor de PrivEsc (sudo vim)</h2>
      <Terminal
        path="~"
        user="lowpriv"
        host="target"
        lines={[
          {
            cmd: "sudo -l",
            out: `User lowpriv may run the following commands on target:
    (root) NOPASSWD: /usr/bin/vim`,
            outType: "warning",
          },
          {
            comment: "sudo permite vim → escape de shell pelo Vim = root",
            cmd: "sudo vim -c ':!/bin/bash'",
            out: `# id
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
          {
            comment: "ou dentro do vim normal",
            cmd: ":!whoami",
            out: "root",
            outType: "error",
          },
        ]}
      />

      <AlertBox type="danger" title="GTFOBins: vim sudo = root instantâneo">
        <p>
          Sempre que <code>sudo -l</code> mostrar <code>vim</code>, <code>vi</code>,
          <code>nano</code>, <code>less</code>, <code>more</code>, <code>man</code>, <code>find</code>,
          <code>awk</code> — você tem PrivEsc imediato. Consulte
          <code> https://gtfobins.github.io/</code>.
        </p>
      </AlertBox>

      <h2>Macros — automatizar edição repetitiva</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "qa = grava macro no registrador 'a'. Faça as ações. q = para de gravar. @a = executa.",
            cmd: "vim hosts.txt",
            out: `10.10.10.1
10.10.10.5
10.10.10.10
10.10.10.20`,
            outType: "default",
          },
          {
            comment: "no vim: posicione no início, qa, I'http://', ESC, A:80', ESC, j, q",
            cmd: "(@a aplicado em todas linhas com 4@a)",
            out: `http://10.10.10.1:80
http://10.10.10.5:80
http://10.10.10.10:80
http://10.10.10.20:80`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Edite /etc/passwd em uma reverse shell sem entrar em pânico"
        goal="Simular o cenário: abrir Vim numa shell ruim, editar arquivo, sair salvando, sem deixar .swp."
        steps={[
          "Abra um terminal local fingindo ser shell ruim: TERM=dumb vim /tmp/teste.txt.",
          "Veja o erro, depois export TERM=xterm.",
          "Edite o arquivo: i, digite 3 linhas, ESC, :wq.",
          "Confirme que NÃO ficou .swp se você usou -n.",
          "Pratique: vim -n -c 'set noswapfile|set nobackup' /tmp/teste.txt.",
        ]}
        command={`echo "user:x:1000:1000::/home/user:/bin/bash" > /tmp/teste.txt
vim -n -c 'set noswapfile' /tmp/teste.txt
# dentro: i, edite, ESC, :wq
ls -la /tmp/.teste.txt.swp 2>&1 || echo "sem .swp = OK"`}
        expected={`ls: cannot access '/tmp/.teste.txt.swp': No such file or directory
sem .swp = OK`}
        verify="Em pentest: SEMPRE vim -n em arquivos do alvo. Zero rastro de .swp."
      />

      <AlertBox type="info" title="Vim cheatsheet de bolso (top 20)">
        <p>
          <code>i</code> insert | <code>ESC</code> sai insert | <code>:wq</code> salva+sai |
          <code>:q!</code> abandona | <code>dd</code> recorta linha | <code>yy</code> copia |
          <code>p</code> cola | <code>u</code> undo | <code>Ctrl+r</code> redo | <code>/foo</code>
          busca | <code>n</code>/<code>N</code> próxima/anterior | <code>:%s/a/b/g</code> replace
          all | <code>gg</code>/<code>G</code> topo/fim | <code>:42</code> linha 42 |
          <code>v</code> visual | <code>.</code> repete | <code>:!cmd</code> shell.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
