import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";
import { ArrowRight } from "lucide-react";

export default function ComeceAqui() {
  return (
    <PageContainer
      title="Comece Aqui — do Zero Absoluto"
      subtitle="Você nunca abriu um terminal? Perfeito. Esta é a sua porta de entrada para o mundo do Kali Linux e da segurança ofensiva — sem pular etapas, sem exigir conhecimento prévio."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <AlertBox type="danger" title="Antes de tudo: leia o Aviso Legal">
        Este guia ensina técnicas reais de segurança ofensiva. Usar essas técnicas
        fora de um ambiente autorizado é <strong>crime no Brasil</strong> (Lei
        12.737/2012, conhecida como Lei Carolina Dieckmann, e Lei 14.155/2021).
        Antes de avançar, leia o capítulo{" "}
        <Link href="/aviso-legal">
          <a className="underline font-semibold">Aviso Legal &amp; Ética</a>
        </Link>
        . É curto, mas obrigatório.
      </AlertBox>

      <h2>Quem é o Wallyson — e por que esse guia existe</h2>
      <p>
        Oi. Eu sou o <strong>Wallyson</strong>, dev brasileiro, e venho usando
        Linux há mais de uma década. Comecei como muita gente: medo de quebrar
        o sistema, traumatizado pelas telas pretas dos filmes, achando que
        "hacker" era coisa de gênio. <strong>Não é.</strong> É método, repetição
        e curiosidade.
      </p>
      <p>
        Esse guia é o material que eu queria ter tido quando comecei: explicações
        em <strong>português claro</strong>, exemplos com <strong>IPs e nomes
        brasileiros</strong> (empresa.com.br, ana.silva, joao.lopes…), e cada
        comando mostrando <strong>exatamente o que aparece na tela</strong> —
        nada de "rode isso aqui e descubra sozinho".
      </p>

      <OutputBlock label="o que esse guia NÃO é" type="muted">
{`✗ Não é um curso de "vire pentester em 7 dias"
✗ Não é receita de bolo para invadir o ex
✗ Não é dump de comando sem contexto
✗ Não é tradução automática do man page

✓ É um caminho linear: zero → terminal → redes → recon → exploração
✓ É baseado em LABS — você executa, não só lê
✓ É focado em CARREIRA: pentest profissional, bug bounty, blue team
✓ É opinativo: indico O QUE usar e POR QUÊ, não 50 ferramentas equivalentes`}
      </OutputBlock>

      <h2>O que você vai aprender (mapa do guia)</h2>
      <p>
        O guia está dividido em <strong>blocos progressivos</strong>. Cada bloco
        depende do anterior — não pula. Estimativa total: 60–90 horas de estudo
        ativo (ler + executar + repetir).
      </p>

      <CommandTable
        title="Trilha recomendada (do iniciante ao avançado)"
        variations={[
          {
            cmd: "1. Fundamentos",
            desc: "Terminal, filesystem, usuários, permissões, redes, serviços.",
            output: "20-25h. Base obrigatória. Sem isso, nada faz sentido depois.",
          },
          {
            cmd: "2. Ferramentas core",
            desc: "Nmap, Hydra, John, Hashcat, Metasploit, Burp, Wireshark.",
            output: "15-20h. As 'mãos' do pentester. Use em cada lab.",
          },
          {
            cmd: "3. Recon & OSINT",
            desc: "TheHarvester, Maltego, Shodan, Recon-ng, Google Dorks.",
            output: "8-10h. Antes de atacar, você precisa saber QUEM é o alvo.",
          },
          {
            cmd: "4. Web pentest",
            desc: "OWASP Top 10, SQLMap, XSS, CSRF, SSRF, LFI/RFI, ZAP.",
            output: "15-20h. Onde está 80% do bug bounty hoje.",
          },
          {
            cmd: "5. Redes & MITM",
            desc: "ARP spoofing, Ettercap, Responder, Aircrack, Bluetooth.",
            output: "10h. Atacar o cabo/Wi-Fi/sinal antes do app.",
          },
          {
            cmd: "6. Active Directory",
            desc: "Impacket, BloodHound, Kerberoasting, CrackMapExec.",
            output: "12-15h. 90% das empresas brasileiras rodam AD.",
          },
          {
            cmd: "7. Pós-exploração",
            desc: "Privesc Linux/Windows, túneis SSH, proxychains, persistência.",
            output: "10h. Entrou? Agora vira root e mantém acesso.",
          },
          {
            cmd: "8. Forense & relatório",
            desc: "Autopsy, Volatility, anti-forense, redação de laudo.",
            output: "5-8h. O cliente paga pelo PDF, não pelo shell.",
          },
        ]}
      />

      <h2>O que você precisa antes de começar</h2>
      <CommandTable
        title="Pré-requisitos"
        variations={[
          {
            cmd: "Computador com 8GB+ RAM",
            desc: "Pode ser laptop antigo. Kali em VM precisa de 4GB livres.",
            output: "Se tem 4GB total, dá. Lento, mas dá.",
          },
          {
            cmd: "20GB de disco livre",
            desc: "Para a VM do Kali + wordlists + screenshots de lab.",
            output: "Wordlists boas (rockyou.txt) sozinhas pesam 130MB.",
          },
          {
            cmd: "Internet estável",
            desc: "Para baixar imagem do Kali (~4GB) e atualizações de pacote.",
            output: "Banda larga residencial brasileira já basta.",
          },
          {
            cmd: "Inglês básico de leitura",
            desc: "Mensagens de erro vêm em inglês. man pages vêm em inglês.",
            output: "Não precisa falar — só conseguir ler com Google Tradutor do lado.",
          },
          {
            cmd: "Paciência",
            desc: "Vai dar erro. Vai travar. Vai precisar reinstalar.",
            output: "É parte do jogo. Quem não erra não aprende terminal.",
          },
        ]}
      />

      <AlertBox type="info" title="Não tem PC potente?">
        Vai de <strong>Kali em USB live</strong> (boota direto do pendrive, não
        precisa instalar) ou usa o <strong>Kali Linux NetHunter no Android</strong>{" "}
        (desempenho limitado mas funciona). Detalhes em{" "}
        <Link href="/instalacao">
          <a className="underline">Instalação</a>
        </Link>{" "}
        e{" "}
        <Link href="/nethunter">
          <a className="underline">NetHunter</a>
        </Link>
        .
      </AlertBox>

      <h2>O que é o terminal (e por que ele importa)</h2>
      <p>
        O <strong>terminal</strong> (também chamado de "shell", "console" ou
        "linha de comando") é um programa onde você digita <em>comandos</em> e o
        computador responde com texto. É como conversar com o sistema operacional
        sem usar o mouse.
      </p>
      <p>
        No Windows existe o <code>CMD</code> e o <code>PowerShell</code>. No Mac
        e no Linux existe o <strong>Bash</strong> ou o <strong>Zsh</strong>. No
        Kali Linux, o padrão é o <strong>Zsh</strong> (mas a maioria dos
        comandos é igual ao Bash).
      </p>
      <p>
        <strong>Por que profissionais de segurança vivem no terminal?</strong>{" "}
        Porque quase toda ferramenta séria do Kali — Nmap, Metasploit, Hydra,
        SQLMap, CrackMapExec — só funciona por linha de comando. Aprender o
        terminal não é opcional: é o alicerce de tudo o que vem depois.
      </p>

      <h2>Anatomia do prompt do Kali</h2>
      <OutputBlock label="prompt padrão do Kali Zsh" type="info">
{`┌──(wallyson㉿kali)-[~]
└─$ 

   wallyson  → seu nome de usuário (quem está logado)
   ㉿        → separador decorativo (Kali usa esse caractere)
   kali      → nome do computador (hostname)
   [~]       → diretório onde você está agora (~ = sua pasta pessoal)
   $         → você é usuário comum
   #         → se aparecer #, você é root (administrador) — CUIDADO`}
      </OutputBlock>

      <AlertBox type="warning" title="Cuidado com $ vs #">
        Se o prompt mostrar <code>#</code>, você está rodando como{" "}
        <strong>root</strong>. Root pode apagar o sistema inteiro com um
        comando errado. Use <code>sudo</code> apenas quando precisar, em vez de
        logar como root o tempo todo.
      </AlertBox>

      <h2>Seu primeiro comando — quem sou eu, onde estou</h2>
      <p>
        Vamos começar pelo mais inofensivo. Abra o terminal (
        <code>Ctrl + Alt + T</code>) e execute:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) descobrir o nome de usuário logado",
            cmd: "whoami",
            out: "wallyson",
            outType: "info",
          },
          {
            comment: "2) descobrir onde você está no filesystem",
            cmd: "pwd",
            out: "/home/wallyson",
            outType: "info",
          },
          {
            comment: "3) data e hora do sistema (pega timezone do Brasil)",
            cmd: "date",
            out: "Sex 25 Abr 2026 15:42:08 -03",
            outType: "info",
          },
          {
            comment: "4) versão completa do kernel + arquitetura",
            cmd: "uname -a",
            out: "Linux kali 6.10.0-kali3-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.10.7-1kali1 (2026-09-15) x86_64 GNU/Linux",
            outType: "default",
          },
          {
            comment: "5) versão da distro (vai dizer 'Kali GNU/Linux Rolling')",
            cmd: "cat /etc/os-release | head -5",
            out: `PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION="2026.1"
VERSION_ID="2026.1"
VERSION_CODENAME="kali-rolling"`,
            outType: "muted",
          },
          {
            comment: "6) há quanto tempo a maquina está ligada + load",
            cmd: "uptime",
            out: " 15:43:22 up  1:02,  1 user,  load average: 0.18, 0.12, 0.10",
            outType: "default",
          },
        ]}
      />

      <p>
        <strong>O que aconteceu aí em cima:</strong> 6 comandos diferentes, e
        nenhum deles "fez" nada destrutivo. Eles só <em>perguntaram</em> coisas
        ao sistema. Isso é metade do trabalho de qualquer pentest:{" "}
        <strong>perguntar antes de agir</strong>.
      </p>

      <AlertBox type="success" title="Você acabou de usar o terminal">
        Esses comandos te ensinaram três perguntas universais que toda
        investigação em segurança começa fazendo: <strong>quem sou eu?</strong>{" "}
        (whoami), <strong>onde estou?</strong> (pwd), <strong>o que é essa
        máquina?</strong> (uname/os-release). Decora esse padrão.
      </AlertBox>

      <h2>As 5 regras de ouro do terminal</h2>
      <CommandTable
        title="Leia, releia, decora"
        variations={[
          {
            cmd: "1. Só digite depois do prompt",
            desc: "Tudo que vem antes do $ ou # é informativo, não é para copiar.",
            output: "Iniciante copia '└─$ ls' inteiro e pergunta por que deu erro.",
          },
          {
            cmd: "2. Enter executa",
            desc: "O comando não roda até apertar Enter. Pode editar antes à vontade.",
            output: "Use Home/End/setas para mover o cursor na linha.",
          },
          {
            cmd: "3. Diferencia maiúsc/minúsc",
            desc: "LS ≠ ls. Quase tudo no Linux é minúsculo.",
            output: "'LS' → 'command not found'. 'ls' → lista arquivos.",
          },
          {
            cmd: "4. Sem erro = sucesso",
            desc: "Comandos bem sucedidos frequentemente NÃO imprimem nada.",
            output: "Silêncio é boa notícia. Mensagem normalmente é problema.",
          },
          {
            cmd: "5. Tab e setas ↑↓",
            desc: "Tab autocompleta nomes; setas navegam o histórico de comandos.",
            output: "Vai te economizar centenas de horas em 1 ano de uso.",
          },
        ]}
      />

      <h2>Onde estou? Para onde posso ir?</h2>
      <p>
        O Linux organiza tudo em uma <strong>árvore de diretórios</strong>. A
        raiz se chama <code>/</code> (uma única barra). Sua pasta pessoal é{" "}
        <code>/home/wallyson</code>. Você navega com três comandos:
      </p>

      <CommandTable
        title="Navegação básica"
        variations={[
          { cmd: "pwd", desc: "Mostra o diretório onde você está agora.", output: "/home/wallyson" },
          { cmd: "ls", desc: "Lista o conteúdo do diretório atual.", output: "Desktop  Documents  Downloads  Pictures" },
          { cmd: "ls -la", desc: "Lista incluindo arquivos ocultos (que começam com '.') e detalhes.", output: "drwxr-xr-x 18 wallyson wallyson 4096 Apr 25 15:42 ." },
          { cmd: "cd /etc", desc: "Entra na pasta de configurações do sistema.", output: "(silencioso. Use pwd para confirmar.)" },
          { cmd: "cd ..", desc: "Sobe um nível na árvore (para a pasta pai).", output: "Se estava em /etc/apache2 → vai para /etc." },
          { cmd: "cd ~", desc: "Volta para sua pasta pessoal (/home/wallyson).", output: "Atalho universal. Funciona de qualquer lugar." },
          { cmd: "cd -", desc: "Volta para o ÚLTIMO diretório onde você esteve.", output: "Como Alt+Tab entre janelas, mas para pastas." },
        ]}
      />

      <h2>Como pedir ajuda — você nunca precisa decorar</h2>
      <p>
        Toda ferramenta séria do Linux tem documentação embutida. Você não
        precisa saber tudo de cor. Você precisa saber{" "}
        <strong>como descobrir</strong>:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "ajuda rápida (resumo das flags)",
            cmd: "ls --help | head -15",
            out: `Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not ignore entries starting with . except . and ..
  -B, --ignore-backups       do not list implied entries ending with ~
  -c                         with -lt: sort by, and show, ctime
  -d, --directory            list directories themselves, not their contents
  -h, --human-readable       with -l and -s, print sizes like 1K 234M 2G
  -l                         use a long listing format
  -R, --recursive            list subdirectories recursively
  -S                         sort by file size, largest first
  -t                         sort by modification time, newest first`,
            outType: "muted",
          },
          {
            comment: "manual completo (use as setas para rolar, q para sair)",
            cmd: "man nmap",
            out: `NMAP(1)                       Nmap Reference Guide                      NMAP(1)

NAME
       nmap - Network exploration tool and security / port scanner

SYNOPSIS
       nmap [Scan Type...] [Options] {target specification}

DESCRIPTION
       Nmap ("Network Mapper") is an open source tool for network exploration...
       
(use 'q' para sair, '/' para buscar, 'n' para próxima ocorrência)`,
            outType: "default",
          },
          {
            comment: "tldr — versão simplificada com EXEMPLOS reais",
            cmd: "sudo apt install -y tldr && tldr nmap",
            out: `nmap

  Network exploration tool and security / port scanner.
  More information: https://nmap.org.

  - Scan the top 1000 ports of a host with default options:
    nmap host

  - Scan all 65535 ports:
    nmap -p- host

  - Service version + OS detection:
    sudo nmap -sV -O host

  - Aggressive scan (faster, more noisy):
    nmap -A host`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="info" title="Tab é seu melhor amigo">
        Não digite nomes inteiros. Digite as primeiras letras e pressione{" "}
        <code>Tab</code>. O terminal completa pra você. Se houver ambiguidade,
        pressione <code>Tab</code> duas vezes para ver as opções. Isso vale para
        comandos, arquivos, pastas e até flags.
      </AlertBox>

      <h2>Ordem recomendada de leitura</h2>
      <OutputBlock label="trilha sequencial — siga nessa ordem" type="success">
{`Semana 1-2  ▸  Aviso Legal → Comece Aqui (você está aqui!)
            ▸  História do Kali → Instalação → Interface
            ▸  Terminal → Primeiros Arquivos → Filesystem
            ▸  Pacotes (apt) → Usuários → Permissões → Serviços

Semana 3-4  ▸  Redes → SSH → Tor → Proxychains
            ▸  Personalização Setup → Docker no Kali

Semana 5-6  ▸  OSINT → Google Dorks → TheHarvester → Maltego
            ▸  Shodan → Recon-ng → Nmap (capítulo central!)
            ▸  Masscan → Whatweb → Nikto

Semana 7-8  ▸  OWASP Top 10 → Burp Suite → ZAP Proxy
            ▸  SQLMap → XSS Manual → CSRF → SSRF
            ▸  LFI/RFI → Command Injection → WebShells

Semana 9-10 ▸  Hydra → John → Hashcat → Crunch → Seclists
            ▸  Metasploit (capítulo grande!) → Msfvenom
            ▸  Buffer Overflow → CVE Research → Searchsploit

Semana 11-12 ▸ ARP Spoofing → Ettercap → Wireshark
             ▸ Aircrack → Reaver → Wifiphisher
             ▸ Bluetooth → Phishing → SET → BeEF

Semana 13-14 ▸ Active Directory:
             ▸  Enum4linux → Responder → Impacket
             ▸  CrackMapExec → Kerberoasting → BloodHound

Semana 15-16 ▸ Pós-exploração:
             ▸  Privesc Linux → Privesc Windows → SSH Tunneling
             ▸  Netcat → Payload Obfuscation → Post Exploração

Semana 17+   ▸ Especialização — escolha 1:
             ▸  Forense (Autopsy, Volatility, Anti-forense, Steg)
             ▸  Mobile Pentest (NetHunter)
             ▸  API/Cloud Pentest
             ▸  Reverse Engineering / CTF / Bug Bounty

Sempre       ▸ Relatórios → Metodologia → Referências`}
      </OutputBlock>

      <h2>Como tirar o máximo desse guia</h2>
      <CommandTable
        title="Método de estudo"
        variations={[
          {
            cmd: "Leia → Execute → Quebre",
            desc: "Não pula a parte de executar. Você só aprende digitando.",
            output: "Leitura passiva = 10% retenção. Lab ativo = 75%+.",
          },
          {
            cmd: "1 capítulo por dia",
            desc: "Não tenta engolir 5 ferramentas por noite.",
            output: "Spaced repetition: 30min/dia > 5h/semana.",
          },
          {
            cmd: "Anote em md",
            desc: "Mantenha um cheatsheet pessoal com seus comandos preferidos.",
            output: "Use Obsidian, VS Code ou um arquivo .md no GitHub seu.",
          },
          {
            cmd: "Refaça os labs",
            desc: "1 vez não basta. Refaça depois de 3 dias e depois de 1 mês.",
            output: "Memória muscular. Você precisa digitar nmap sem pensar.",
          },
          {
            cmd: "Use ambiente isolado",
            desc: "Suba VMs vulneráveis (Metasploitable, DVWA, HTB).",
            output: "Nunca, jamais, em nenhuma hipótese, mire em alvos sem RoE.",
          },
        ]}
      />

      <h2>Onde praticar de forma legal</h2>
      <CommandTable
        title="Plataformas para treinar sem virar réu"
        variations={[
          { cmd: "TryHackMe", desc: "Trilhas guiadas para iniciante e intermediário.", output: "Plano grátis serve. Pago US$10/mês destrava o que importa." },
          { cmd: "HackTheBox", desc: "Máquinas reais, mais difíceis. Cenário pro de OSCP.", output: "Tem versão acadêmica e CTF semanal." },
          { cmd: "OverTheWire", desc: "Wargame clássico para aprender Linux + cripto + binex.", output: "Bandit é OBRIGATÓRIO antes de qualquer outra coisa." },
          { cmd: "PortSwigger Web Security", desc: "Lab oficial de Web. Grátis. Melhor recurso de OWASP do mundo.", output: "Termina o programa = você está nível pleno em web." },
          { cmd: "VulnHub", desc: "VMs vulneráveis para baixar e rodar local.", output: "Sem internet, sem custo, sem registro." },
          { cmd: "DVWA / Metasploitable / OWASP Juice Shop", desc: "Aplicações vulneráveis para subir no seu PC.", output: "Docker em 1 comando: docker run dvwa/dvwa." },
          { cmd: "Bug Bounty (HackerOne, BugCrowd)", desc: "Empresas pagam para você achar bug — DENTRO do escopo.", output: "Comece pequeno: programas com 'Hall of Fame' antes de cash." },
        ]}
      />

      <PracticeBox
        title="Lab 0 — Confirme que você consegue executar"
        goal="Garantir que você abre o terminal, executa 4 comandos sem erro, e entende a saída de cada um. Esse é o teste de pré-aptidão para o resto do guia."
        steps={[
          "Abra o terminal: Ctrl + Alt + T (ou ícone na barra superior).",
          "Digite whoami e pressione Enter — anote o nome.",
          "Digite pwd e pressione Enter — anote o caminho.",
          "Digite uname -r e pressione Enter — anote a versão do kernel.",
          "Digite history | tail -5 — você verá os 5 últimos comandos digitados (ou seja: você executou pelo menos 4 coisas hoje).",
        ]}
        command={`whoami
pwd
uname -r
history | tail -5`}
        expected={`wallyson
/home/wallyson
6.10.0-kali3-amd64
  101  whoami
  102  pwd
  103  uname -r
  104  history | tail -5`}
        verify="Você viu 4 saídas distintas, todas começando com o que você esperava (seu user, sua pasta, versão do kernel, lista do histórico). Se algum comando deu 'command not found', você não está no Kali — confirme que abriu o terminal certo."
      />

      <AlertBox type="success" title="Pronto para o próximo passo">
        Se o lab acima funcionou, você está pronto. Você já sabe abrir o
        terminal, ler o prompt, identificar onde está e pedir ajuda. Agora vamos
        criar arquivos com as próprias mãos no próximo capítulo —{" "}
        <strong>sem isso, não dá pra aprender cat, less, grep, find</strong> e
        toda a manipulação de texto que você vai usar em pentest todo dia.
      </AlertBox>

      <h2>Próximo passo</h2>
      <p>
        Sequência sugerida (clica e segue):
      </p>
      <ul>
        <li>
          <Link href="/aviso-legal">
            <a className="underline font-semibold text-primary">Aviso Legal &amp; Ética</a>
          </Link>{" "}
          — leia ANTES de qualquer comando ofensivo. Curto e obrigatório.
        </li>
        <li>
          <Link href="/historia">
            <a className="underline font-semibold text-primary">História do Kali</a>
          </Link>{" "}
          — 5 minutos de contexto. Vale.
        </li>
        <li>
          <Link href="/instalacao">
            <a className="underline font-semibold text-primary">Instalação</a>
          </Link>{" "}
          — VirtualBox, VMware, USB live, WSL2 ou bare metal.
        </li>
        <li>
          <Link href="/interface">
            <a className="underline font-semibold text-primary">Interface</a>
          </Link>{" "}
          — passeio pelo XFCE/menu/atalhos.
        </li>
        <li>
          <Link href="/terminal">
            <a className="underline font-semibold text-primary">Terminal (capítulo profundo)</a>
          </Link>{" "}
          — pipes, redirecionamento, jobs, variáveis. Aqui mora o ouro.
        </li>
      </ul>

      <div className="mt-10 flex justify-end">
        <Link href="/aviso-legal">
          <button className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Ir para Aviso Legal <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </PageContainer>
  );
}
