import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { ArrowRight, ShieldAlert } from "lucide-react";

export default function ComeceAqui() {
  return (
    <PageContainer
      title="Comece Aqui — do Zero Absoluto"
      subtitle="Você nunca abriu um terminal? Perfeito. Esta página é o seu primeiro passo. Não pula etapas, não exige conhecimento prévio."
      difficulty="iniciante"
      timeToRead="12 min"
    >
      <AlertBox type="danger" title="Antes de tudo: leia o Aviso Legal">
        Este guia ensina técnicas reais de segurança ofensiva. Usar essas
        técnicas fora de um ambiente autorizado é <strong>crime no Brasil</strong>
        {" "}(Lei 12.737/2012, Lei Carolina Dieckmann). Antes de avançar, leia o
        capítulo{" "}
        <Link href="/aviso-legal">
          <a className="underline font-semibold">Aviso Legal &amp; Ética</a>
        </Link>
        . É curto, mas obrigatório.
      </AlertBox>

      <h2>1. O que é o terminal (e por que ele importa)</h2>
      <p>
        O <strong>terminal</strong> (também chamado de "shell", "console" ou
        "linha de comando") é um programa onde você escreve <em>comandos</em>{" "}
        e o computador responde com texto. É como conversar com o sistema
        operacional sem usar o mouse.
      </p>
      <p>
        No Windows existe o <code>CMD</code> e o <code>PowerShell</code>. No
        Mac e no Linux existe o <strong>Bash</strong> ou o <strong>Zsh</strong>.
        No Kali Linux, o padrão é o <strong>Zsh</strong> (mas a maioria dos
        comandos é igual ao Bash).
      </p>

      <p>
        <strong>Por que profissionais de segurança vivem no terminal?</strong>{" "}
        Porque quase toda ferramenta séria do Kali (Nmap, Metasploit, Hydra,
        SQLMap, etc.) só funciona por linha de comando. Aprender o terminal
        não é opcional — é o alicerce de tudo o que vem depois.
      </p>

      <h2>2. Como abrir o terminal no Kali</h2>
      <p>Você tem três caminhos:</p>
      <ul>
        <li>
          <strong>Atalho do teclado:</strong> pressione{" "}
          <code>Ctrl</code> + <code>Alt</code> + <code>T</code>.
        </li>
        <li>
          <strong>Ícone na barra superior:</strong> procure o ícone preto com
          um <code>$</code> ou <code>{">_"}</code>.
        </li>
        <li>
          <strong>Menu de aplicativos:</strong> clique no menu do Kali e
          procure "Terminal" ou "QTerminal".
        </li>
      </ul>
      <p>
        Quando abrir, vai aparecer uma janela preta (ou colorida) com algo
        parecido com isso:
      </p>
      <pre className="text-sm font-mono bg-black/60 text-green-400 p-4 rounded-lg overflow-x-auto">
{`┌──(kali㉿kali)-[~]
└─$ `}
      </pre>

      <h2>3. Anatomia do prompt — leia antes de digitar</h2>
      <p>
        Aquela linha esquisita que aparece é chamada de <strong>prompt</strong>.
        Cada parte tem significado:
      </p>

      <div className="my-6 bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="font-mono text-sm bg-black/40 text-green-400 p-3 rounded">
          kali@kali:~$
        </div>
        <ul className="text-sm space-y-2 m-0">
          <li>
            <code className="text-primary">kali</code> →{" "}
            <strong>seu nome de usuário</strong> (quem está logado).
          </li>
          <li>
            <code className="text-primary">@</code> → separador.
          </li>
          <li>
            <code className="text-primary">kali</code> (depois do @) →{" "}
            <strong>nome do computador</strong> (hostname).
          </li>
          <li>
            <code className="text-primary">:</code> → separador.
          </li>
          <li>
            <code className="text-primary">~</code> →{" "}
            <strong>diretório onde você está agora</strong>. O caractere{" "}
            <code>~</code> é um atalho para "minha pasta pessoal" (em geral{" "}
            <code>/home/kali</code>).
          </li>
          <li>
            <code className="text-primary">$</code> →{" "}
            <strong>você é um usuário comum</strong>. Se aparecer{" "}
            <code>#</code> no lugar, você é o <strong>root</strong>{" "}
            (administrador) — tome muito cuidado.
          </li>
        </ul>
      </div>

      <AlertBox type="info" title="Cuidado com $ vs #">
        Se você ver <code>#</code>, você está rodando como <strong>root</strong>.
        Root pode apagar o sistema inteiro com um comando errado. Use{" "}
        <code>sudo</code> apenas quando precisar, em vez de logar como root.
      </AlertBox>

      <h2>4. As 5 regras de ouro do terminal</h2>
      <ol>
        <li>
          <strong>Você só pode digitar depois do prompt.</strong> Tudo o que
          aparece antes do <code>$</code> ou <code>#</code> é informativo.
        </li>
        <li>
          <strong>Pressione Enter para executar.</strong> O comando não roda
          até você apertar <code>Enter</code>.
        </li>
        <li>
          <strong>Diferencia maiúsculas/minúsculas.</strong>{" "}
          <code>LS</code> não é a mesma coisa que <code>ls</code>. Quase tudo é
          minúsculo no Linux.
        </li>
        <li>
          <strong>Nada de erro = sucesso.</strong> Comandos bem-sucedidos
          frequentemente não imprimem nada. Silêncio é boa notícia.
        </li>
        <li>
          <strong>Use Tab para autocompletar e ↑/↓ para o histórico.</strong>{" "}
          Isso vai te economizar horas.
        </li>
      </ol>

      <h2>5. Seu primeiro comando: descobrindo quem você é</h2>
      <p>
        Vamos começar com o comando mais inofensivo que existe:{" "}
        <code>whoami</code> ("quem sou eu"). Ele só imprime o nome do usuário
        logado.
      </p>

      <PracticeBox
        title="1 — whoami, pwd, date"
        goal="Executar três comandos seguros e entender a saída de cada um."
        steps={[
          "Abra o terminal (Ctrl + Alt + T).",
          "Digite whoami e pressione Enter.",
          "Digite pwd e pressione Enter.",
          "Digite date e pressione Enter.",
        ]}
        command={`whoami
pwd
date`}
        expected={`kali
/home/kali
Sex 25 Abr 2026 15:42:08 -03`}
        verify="Você viu três linhas de saída diferentes, uma para cada comando, e o prompt voltou após cada execução."
      />

      <p>
        <strong>O que cada comando fez:</strong>
      </p>
      <ul>
        <li>
          <code>whoami</code> mostrou o seu nome de usuário —{" "}
          <strong>kali</strong>.
        </li>
        <li>
          <code>pwd</code> ("print working directory") mostrou{" "}
          <strong>onde você está agora</strong>. Você está em{" "}
          <code>/home/kali</code>, que é a sua pasta pessoal.
        </li>
        <li>
          <code>date</code> mostrou data e hora do sistema.
        </li>
      </ul>

      <AlertBox type="success" title="Você acabou de usar o terminal">
        Parabéns. Esses três comandos já te ensinaram três coisas: identidade
        (quem você é), localização (onde você está) e estado (que horas são).
        Toda investigação em segurança começa com essas três perguntas.
      </AlertBox>

      <h2>6. Mais comandos úteis e inofensivos</h2>
      <CodeBlock
        language="bash"
        code={`# Versão e arquitetura do sistema
uname -a

# Informações da distribuição (Kali, Debian, etc.)
cat /etc/os-release

# Quantos usuários estão logados agora
who

# Há quanto tempo o sistema está ligado
uptime

# Calendário do mês atual
cal

# Limpar a tela (também: Ctrl + L)
clear`}
      />

      <PracticeBox
        title="2 — Inspecione seu sistema"
        goal="Coletar informações básicas do seu próprio sistema. É a primeira coisa que se faz em qualquer máquina nova."
        steps={[
          "Execute uname -a — anote o nome do kernel.",
          "Execute cat /etc/os-release — anote a versão do Kali.",
          "Execute uptime — anote há quanto tempo a máquina está ligada.",
        ]}
        command={`uname -a
cat /etc/os-release | head -3
uptime`}
        expected={`Linux kali 6.10.0-kali3-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.10.7-1kali1 (2026-09-15) x86_64 GNU/Linux
PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2026.1"
 15:43:22 up  1:02,  1 user,  load average: 0.18, 0.12, 0.10`}
        verify="Os três comandos rodaram sem erro e você sabe agora a versão do seu Kali e há quanto tempo a máquina está ligada."
      />

      <h2>7. Onde estou? Para onde posso ir?</h2>
      <p>
        O Linux organiza tudo em uma <strong>árvore de diretórios</strong>. A
        raiz se chama <code>/</code> (apenas a barra). A sua pasta pessoal é{" "}
        <code>/home/kali</code>. Você pode caminhar por essa árvore com três
        comandos:
      </p>
      <ul>
        <li>
          <code>pwd</code> — mostra onde você está.
        </li>
        <li>
          <code>ls</code> — lista o que tem no diretório atual.
        </li>
        <li>
          <code>cd PASTA</code> — entra na pasta. <code>cd ..</code> sobe um
          nível. <code>cd ~</code> volta para a sua pasta pessoal. <code>cd -</code>{" "}
          volta ao último diretório.
        </li>
      </ul>

      <PracticeBox
        title="3 — Caminhe pela árvore de diretórios"
        goal="Entrar e sair de várias pastas e sempre saber onde está."
        steps={[
          "pwd — confirme que está em /home/kali.",
          "ls — veja o que tem na sua pasta.",
          "cd / — vá para a raiz.",
          "ls — veja as pastas principais do sistema.",
          "cd /etc — entre na pasta de configurações.",
          "ls — veja quantos arquivos existem ali.",
          "cd ~ — volte para a sua pasta pessoal.",
          "pwd — confirme que voltou para /home/kali.",
        ]}
        command={`pwd
ls
cd /
ls
cd /etc
ls | head -10
cd ~
pwd`}
        expected={`/home/kali
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos
bin   dev   home   lib32  libx32  mnt  proc  run   srv  tmp  var
boot  etc   lib    lib64  media   opt  root  sbin  sys  usr
NetworkManager  X11  acpi  adduser.conf  alsa  alternatives
apache2  apparmor  apt  audisp  audit  avahi
/home/kali`}
        verify="Você passou por 3 diretórios diferentes (/home/kali → / → /etc → /home/kali) e em cada parada o ls mostrou conteúdo diferente."
      />

      <AlertBox type="info" title="Atalho que vai te salvar: Tab">
        Não digite nomes de pasta inteiros. Digite as primeiras letras e
        pressione <code>Tab</code>. O terminal completa para você. Se houver
        ambiguidade, pressione <code>Tab</code> duas vezes para ver as opções.
      </AlertBox>

      <h2>8. Como pedir ajuda — você nunca precisa decorar</h2>
      <p>
        Toda ferramenta séria do Linux tem documentação embutida. Você não
        precisa saber tudo de cor. Você precisa saber{" "}
        <strong>como descobrir</strong>:
      </p>

      <CodeBlock
        language="bash"
        code={`# Ajuda rápida (resumida)
ls --help
cd --help          # nem sempre funciona, cd é interno do shell
pwd --help

# Manual completo (use as setas para rolar, q para sair)
man ls
man cd
man bash

# Versão simplificada com exemplos (instale antes: sudo apt install tldr)
tldr ls
tldr find`}
      />

      <PracticeBox
        title="4 — Use o manual"
        goal="Descobrir uma flag do ls que você ainda não conhece."
        steps={[
          "Execute man ls.",
          "Aperte / e digite size para procurar a palavra 'size'.",
          "Pressione n para ir para a próxima ocorrência.",
          "Aperte q para sair.",
          "Tente usar a flag que você descobriu. Por exemplo: ls -lh.",
        ]}
        verify="Você abriu um manual, navegou nele, saiu sem fechar o terminal, e usou uma nova flag."
      />

      <h2>9. Próximo passo</h2>
      <p>
        Você já sabe abrir o terminal, ler o prompt, identificar onde está e
        navegar. Mas <strong>ainda não criou nenhum arquivo</strong>. E você
        não pode aprender comandos como <code>cat</code>, <code>less</code> ou{" "}
        <code>grep</code> sem ter um arquivo seu para testar.
      </p>
      <p>
        Por isso o próximo capítulo é{" "}
        <Link href="/primeiros-arquivos">
          <a className="underline font-semibold text-primary">
            Primeiros Arquivos
          </a>
        </Link>
        : você vai criar, escrever, ler, copiar, mover e apagar arquivos com
        as próprias mãos. Só depois disso vamos aprofundar no Terminal.
      </p>

      <div className="mt-8 flex justify-end">
        <Link href="/primeiros-arquivos">
          <button className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Ir para Primeiros Arquivos <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </PageContainer>
  );
}
