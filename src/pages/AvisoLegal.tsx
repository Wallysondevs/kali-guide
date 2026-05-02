import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";
import { Scale, Gavel, BookOpen, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

export default function AvisoLegal() {
  return (
    <PageContainer
      title="Aviso Legal & Ética — Leia Antes de Tudo"
      subtitle="Este guia ensina técnicas reais de segurança ofensiva. Esta página explica onde elas são legais, onde são crime, e como praticar sem ir para a cadeia."
      difficulty="iniciante"
      timeToRead="14 min"
      prompt="legal/aviso"
    >
      <AlertBox type="danger" title="Este aviso não é figurativo">
        Tudo o que está escrito a partir daqui pode ser usado para invadir sistemas alheios.{" "}
        <strong>Fazer isso sem autorização é crime no Brasil e em praticamente todo o mundo.</strong>{" "}
        Não importa se foi "só para testar", "só para mostrar", "rapidinho" ou se "o site era
        inseguro". Você é responsável pelos comandos que executa.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <Gavel className="w-6 h-6 text-primary" /> 1. O que diz a lei brasileira
      </h2>

      <div className="my-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Lei 12.737/2012 — "Lei Carolina Dieckmann"
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-2">
            Acrescentou o <strong>Art. 154-A</strong> ao Código Penal:
          </p>
          <blockquote className="border-l-4 border-primary/40 pl-4 text-sm text-muted-foreground italic">
            "Invadir dispositivo informático alheio, conectado ou não à rede de computadores,
            mediante violação indevida de mecanismo de segurança e com o fim de obter, adulterar ou
            destruir dados ou informações sem autorização expressa ou tácita do titular do
            dispositivo (...)"
          </blockquote>
          <p className="text-sm text-foreground/90 mt-3 mb-0">
            <strong>Pena:</strong> reclusão de 1 a 4 anos + multa. Aumenta se houver prejuízo,
            vazamento ou se a vítima for autoridade.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Lei 14.155/2021 — Crimes cibernéticos
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Aumentou as penas de invasão de dispositivo (até <strong>5 anos</strong> em casos
            graves) e tipificou novos crimes como fraude eletrônica (Art. 171, §2º-A) com pena de 4
            a 8 anos.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> CP Art. 313-A e 313-B — Sistemas públicos
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            <strong>313-A:</strong> Inserir dados falsos em sistema da administração pública —
            reclusão de 2 a 12 anos + multa.<br />
            <strong>313-B:</strong> Modificar ou alterar sistema de informações sem autorização —
            detenção de 3 meses a 2 anos + multa.<br />
            Atacar gov.br, prefeituras, autarquias = caso federal, foro de polícia federal.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> LGPD — Lei 13.709/2018
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Manipular, vazar ou expor dados pessoais sem base legal pode gerar multas de até{" "}
            <strong>R$ 50 milhões</strong> ou 2% do faturamento da empresa. A ANPD (Autoridade
            Nacional de Proteção de Dados) é o órgão fiscalizador. Para pessoas físicas, abre
            caminho para ações cíveis e criminais.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Marco Civil da Internet — Lei 12.965/2014
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Define direitos e deveres do usuário e do provedor. Logs de conexão são obrigatórios e
            podem ser usados para te identificar mesmo se você usar VPN comercial brasileira.
          </p>
        </div>
      </div>

      <h2>2. Comparando: comando autorizado vs comando criminoso</h2>
      <p>
        O <strong>mesmo comando técnico</strong> pode ser pentest legítimo ou crime de invasão. O
        que muda é <strong>contrato + escopo + autorização</strong>. Veja:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "✅ AUTORIZADO — empresa cliente assinou contrato, IP está no escopo",
            cmd: "nmap -sV -sC 198.51.100.42   # IP listado no anexo A do RoE",
            out: `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for portal.cliente.com.br (198.51.100.42)
Host is up (0.012s latency).
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1
80/tcp  open  http     nginx 1.18.0
443/tcp open  ssl/http nginx 1.18.0

[+] Resultado salvo em ./relatorio/recon/nmap-portal.txt
[+] Logado em ./logs/comandos.log com timestamp e hash da autorização`,
            outType: "success",
          },
          {
            comment: "❌ CRIME — mesmo comando, alvo aleatório, sem autorização. Art. 154-A CP.",
            cmd: "nmap -sV -sC 200.123.45.67   # 'só queria testar'",
            out: `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for vitima-aleatoria.com (200.123.45.67)
[...]

(o que você NÃO vê:)
  - logs do ISP correlacionam IP+horário ao seu CPF
  - alvo abre BO; PF requisita logs ao seu provedor (Marco Civil obriga 1 ano de retenção)
  - 6 meses depois: mandado de busca, apreensão de equipamentos
  - você responde em liberdade, mas com processo + advogado caro
  - condenação típica em 1ª instância: 1 a 4 anos + multa (154-A)`,
            outType: "error",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "✅ AUTORIZADO — bug bounty, target.com está no scope público da HackerOne",
            cmd: "sqlmap -u 'https://target.com/api/v1/users?id=1' --risk=1 --level=1",
            out: `[*] starting @ 02:14:21
[INFO] testing connection to the target URL
[INFO] checking if the target is protected by some kind of WAF/IPS
[INFO] testing if the target URL content is stable
[INFO] target URL content is stable

[+] reportado via HackerOne em 2 horas. Bounty: $1500.`,
            outType: "success",
          },
          {
            comment: "❌ CRIME — mesma URL, mas target.com não tem programa de bounty",
            cmd: "sqlmap -u 'https://lojaaleatoria.com.br/produto?id=1' --batch",
            out: `[INFO] sqlmap got SQL injection vulnerability in 'id' parameter

(consequências:)
  - dump de dados pessoais = LGPD (multa até R$ 50 mi pra empresa, dolo civil pra você)
  - invasão de dispositivo = Art. 154-A (1-4 anos)
  - se houver fraude posterior = Art. 171 §2º-A (4-8 anos)
  - se for sistema gov = Art. 313-B (até 2 anos, federal)`,
            outType: "error",
          },
        ]}
      />

      <AlertBox type="warning" title="A diferença está em UM PAPEL">
        Tecnicamente os comandos são idênticos. Juridicamente, a única coisa que separa o pentester
        do criminoso é a <strong>autorização escrita assinada pelo titular do sistema</strong>.
        Sempre tenha o PDF assinado em mãos ANTES de digitar o primeiro Enter.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" /> 3. E lá fora?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[
          { pais: "EUA", lei: "Computer Fraud and Abuse Act (CFAA)", pena: "Até 10 anos por acesso não autorizado" },
          { pais: "Reino Unido", lei: "Computer Misuse Act 1990", pena: "Até 10 anos + multa ilimitada" },
          { pais: "União Europeia", lei: "GDPR + leis nacionais", pena: "Multas até 4% do faturamento global" },
          { pais: "Portugal", lei: "Lei do Cibercrime (Lei 109/2009)", pena: "Até 5 anos por acesso ilegítimo" },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-primary tracking-wider mb-1">{item.pais}</p>
            <p className="text-sm font-semibold text-foreground mt-0 mb-1">{item.lei}</p>
            <p className="text-xs text-muted-foreground mt-0 mb-0">{item.pena}</p>
          </div>
        ))}
      </div>

      <AlertBox type="warning" title="Não existe 'só por curiosidade'">
        Promotor não vai aceitar "eu só queria ver se conseguia". Se você invadiu, você cometeu o
        crime. A intenção pode reduzir a pena, mas não elimina o crime.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-primary" /> 4. Onde praticar legalmente
      </h2>
      <p>
        Existem ambientes <strong>desenhados para você atacar</strong>. Use só eles enquanto estiver
        aprendendo. São gratuitos ou baratíssimos e cobrem 99% do que você quer testar.
      </p>

      <h3>4.1. Plataformas online (CTF e laboratórios)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {[
          { nome: "TryHackMe", url: "https://tryhackme.com", desc: "Trilhas guiadas do absoluto zero. Ideal para começar." },
          { nome: "Hack The Box", url: "https://hackthebox.com", desc: "Máquinas reais para invadir. Mais avançado." },
          { nome: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", desc: "Tudo de pentest web. Gratuito e excelente." },
          { nome: "PicoCTF", url: "https://picoctf.org", desc: "Desafios de segurança feitos pela CMU. Muito didáticos." },
          { nome: "OverTheWire", url: "https://overthewire.org/wargames/", desc: "Wargames clássicos: Bandit, Natas, etc. Comece pelo Bandit." },
          { nome: "Root-Me", url: "https://www.root-me.org", desc: "Centenas de desafios de várias categorias." },
        ].map((p, i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-colors no-underline"
          >
            <p className="text-sm font-bold text-foreground mt-0 mb-1 flex items-center gap-1">
              {p.nome} <ExternalLink className="w-3 h-3 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground mt-0 mb-0">{p.desc}</p>
          </a>
        ))}
      </div>

      <h3>4.2. Máquinas vulneráveis para baixar (rodar local)</h3>
      <p>
        Baixe estas VMs e rode em <strong>VirtualBox</strong> ou <strong>VMware</strong> em modo{" "}
        <em>host-only</em> (rede isolada, sem acesso à internet). Assim você ataca sem risco para
        ninguém.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {[
          { nome: "Metasploitable 2 / 3", desc: "Linux propositalmente fraco." },
          { nome: "DVWA", desc: "Damn Vulnerable Web Application." },
          { nome: "OWASP Juice Shop", desc: "Loja online com falhas modernas." },
          { nome: "VulnHub", desc: "Catálogo enorme: vulnhub.com" },
          { nome: "OWASP WebGoat", desc: "Aulas guiadas de pentest web." },
          { nome: "bWAPP", desc: "buggy Web Application — 100+ vulnerabilidades." },
        ].map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-bold text-foreground mt-0 mb-1">{p.nome}</p>
            <p className="text-xs text-muted-foreground mt-0 mb-0">{p.desc}</p>
          </div>
        ))}
      </div>

      <AlertBox type="info" title="Como isolar o seu laboratório">
        No VirtualBox: <strong>Settings → Network → Host-only Adapter</strong>. Crie uma rede
        host-only no menu <em>File → Host Network Manager</em>. Coloque o Kali e a VM vulnerável na
        mesma rede host-only. <strong>Não use modo Bridged</strong> para alvos vulneráveis — eles
        ficariam expostos na sua rede de casa.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-primary" /> 5. Antes de testar em qualquer alvo real
      </h2>
      <p>
        Se você for fazer um pentest em um sistema que <strong>não é seu</strong> (empresa cliente,
        programa de bug bounty, sistema de um amigo), você precisa de:
      </p>

      <ol>
        <li><strong>Autorização por escrito</strong> assinada por alguém com poder para autorizar (geralmente CISO, CTO ou dono).</li>
        <li><strong>Escopo definido:</strong> quais IPs, domínios, aplicações podem ser testados. O que está fora.</li>
        <li><strong>Janela temporal:</strong> entre quais datas e horários.</li>
        <li><strong>Tipos de teste permitidos:</strong> só caixa-preta? Pode fazer DoS? Pode usar engenharia social?</li>
        <li><strong>Contato de emergência:</strong> quem chamar se algo cair.</li>
        <li><strong>Acordo de confidencialidade (NDA):</strong> tudo o que você encontrar é segredo.</li>
      </ol>

      <p>
        Para programas de bug bounty (HackerOne, Bugcrowd, Intigriti) a autorização é o próprio{" "}
        <em>scope</em> publicado pela empresa. Leia o escopo <strong>antes</strong> de começar e
        respeite-o à risca.
      </p>

      <h2>6. Rules of Engagement (RoE) — anatomia</h2>
      <CommandTable
        title="Cláusulas obrigatórias num documento de RoE"
        variations={[
          { cmd: "Identificação", desc: "Razão social + CNPJ do contratante e do pentester (PF/PJ).", output: "Sem isso, contrato é nulo." },
          { cmd: "Escopo IN", desc: "IPs, domínios, apps, APIs explicitamente autorizados.", output: "Listar em anexo. Atualizar por escrito se mudar." },
          { cmd: "Escopo OUT", desc: "O que está fora — terceiros, parceiros, BGP upstream.", output: "Atacar fora = quebra de contrato + crime." },
          { cmd: "Janela", desc: "Data/hora início + fim. Fuso horário explícito.", output: "Fora da janela = sem cobertura legal." },
          { cmd: "Técnicas permitidas", desc: "Recon, exploração, social, phishing, DoS, físico.", output: "Default: só técnico. Resto exige opt-in." },
          { cmd: "Limites de impacto", desc: "Pode derrubar produção? Modificar dados? Persistir?", output: "Em geral: leitura sim, escrita só com aprovação." },
          { cmd: "Contato emergencial", desc: "Nome + tel 24h do CISO/SOC do cliente.", output: "Para parar tudo se algo quebrar." },
          { cmd: "Comunicação", desc: "Canal seguro: Signal, ProtonMail, PGP.", output: "Nada por WhatsApp / e-mail comum." },
          { cmd: "Custódia de dados", desc: "Como proteger e por quanto tempo guardar evidências.", output: "Disco cifrado, prazo + destruição segura." },
          { cmd: "Entregáveis", desc: "Relatório executivo + técnico + apresentação.", output: "Modelo PTES ou OWASP Testing Guide." },
          { cmd: "Cláusula de não-divulgação", desc: "NDA mútuo, prazo (5-10 anos típico).", output: "Multa contratual + ação cível em caso de leak." },
          { cmd: "Limitação de responsabilidade", desc: "Cap de indenização (geralmente 1-3x o valor do contrato).", output: "Protege pentester de lawsuits desproporcionais." },
        ]}
      />

      <h2>7. Modelo de termo de autorização (mínimo viável)</h2>
      <p>
        Use isso só como ponto de partida — sempre revise com um advogado antes de assinar com
        cliente.
      </p>
      <CodeBlock
        language="text"
        title="termo-autorizacao-pentest.txt"
        code={`AUTORIZAÇÃO PARA TESTE DE INTRUSÃO

A empresa CONTRATANTE [Razão Social, CNPJ XX.XXX.XXX/0001-XX], doravante
"CLIENTE", autoriza FULANO DE TAL [CPF, endereço], doravante "PENTESTER",
a realizar testes de penetração nos seguintes ativos:

  Escopo (in-scope):
    - example.com.br e subdomínios listados no anexo A
    - Faixa IP 198.51.100.0/24
    - Aplicação web "Portal do Cliente"

  Fora do escopo (out-of-scope):
    - Qualquer ativo de terceiros (provedores de pagamento, etc.)
    - Funcionários (engenharia social não permitida)

  Janela: 25/04/2026 09:00 a 02/05/2026 18:00 (BRT)

  Tipos de teste permitidos:
    - Reconhecimento, varredura, exploração técnica
    - NÃO permitido: ataques de negação de serviço, social engineering

  Contato de emergência (24h): Maria CISO — +55 11 9XXXX-XXXX

  O CLIENTE declara ser o legítimo titular dos ativos listados e ter
  poderes para autorizar este teste. O PENTESTER se compromete a
  não acessar dados além do necessário para comprovação, a manter
  total confidencialidade e a entregar relatório técnico ao final.

  Local, data.
  ____________________________     ____________________________
  CLIENTE                          PENTESTER`}
      />

      <h2>8. Notificação à ANPD em caso de incidente</h2>
      <p>
        Se durante o pentest você descobrir um vazamento <strong>real</strong> (não simulado) de
        dados pessoais que já estava acontecendo, o cliente tem obrigação legal de comunicar à ANPD
        em prazo razoável (orientação atual: até 3 dias úteis após confirmação). Você como
        pentester deve documentar e escalar imediatamente — <strong>não é seu papel</strong>{" "}
        notificar diretamente.
      </p>

      <OutputBlock label="fluxo de incidente durante pentest" type="info">
{`pentester acha vazamento real
       │
       ▼
[STOP] parar exploração imediatamente
       │
       ▼
documentar evidência mínima necessária (timestamp, URL, sample anonimizado)
       │
       ▼
notificar contato de emergência do cliente (canal seguro)
       │
       ▼
cliente decide: containment + DPO + ANPD (até 3 dias úteis)
       │
       ▼
pentester fornece dados técnicos para investigação
       │
       ▼
NÃO publicar, NÃO comentar, NÃO postar no Twitter`}
      </OutputBlock>

      <AlertBox type="danger" title="Fluxo errado = você vira réu">
        Tirar print, postar no LinkedIn pra mostrar achado, mandar pra colega "olha que doido" —{" "}
        <strong>tudo isso é vazamento secundário</strong>. Quem vazou primeiro pode até ser
        co-responsável, mas você quem multiplicou. ANPD pune ambos.
      </AlertBox>

      <h2>9. Checklist ético rápido</h2>
      <p>
        Antes de digitar <code>Enter</code> em qualquer comando que toca um sistema fora da sua
        máquina, responda mentalmente:
      </p>
      <div className="my-6 space-y-2">
        {[
          "Eu tenho autorização EXPLÍCITA por escrito para mexer neste alvo?",
          "Esse alvo está dentro do escopo combinado?",
          "Estou dentro da janela temporal autorizada?",
          "Esse comando pode causar indisponibilidade? Ele está permitido?",
          "Se algo der errado, eu sei quem chamar?",
          "Estou registrando tudo (logs, prints, comandos) para o relatório?",
          "Os dados que vou extrair estão sob NDA + custódia segura?",
          "Caso ache vazamento real, sei pra quem escalar?",
        ].map((q, i) => (
          <div key={i} className="flex items-start gap-3 text-sm bg-card border border-border rounded-lg p-3">
            <span className="text-primary font-bold">☐</span>
            <span className="text-foreground/90">{q}</span>
          </div>
        ))}
      </div>

      <h2>10. Responsabilidade do pentester</h2>
      <CommandTable
        title="O que você é obrigado a fazer (e não fazer)"
        variations={[
          { cmd: "DEVE — minimização", desc: "Coletar só o necessário para provar a falha.", output: "Achou SQLi? 1 registro como PoC basta. NÃO dumpe a base inteira." },
          { cmd: "DEVE — confidencialidade", desc: "Tratar tudo como segredo industrial.", output: "Disco cifrado (LUKS), senhas em KeePassXC, NDA assinado." },
          { cmd: "DEVE — registro auditável", desc: "Logar comandos com timestamp.", output: "script(1), tee, asciinema. Hash SHA256 do log no fim." },
          { cmd: "DEVE — comunicação clara", desc: "Reportar ASAP achados críticos.", output: "Não esperar relatório final pra avisar de RCE em prod." },
          { cmd: "DEVE — destruir evidências", desc: "Após entrega + prazo de retenção, destruir.", output: "shred -uvz, BleachBit, ou disco físico para forno." },
          { cmd: "NÃO — exfiltrar além do necessário", desc: "Mesmo autorizado, copiar base inteira é abuso.", output: "Vira responsabilidade civil + LGPD." },
          { cmd: "NÃO — usar credenciais fora do teste", desc: "Achou senha admin? Use só na janela.", output: "Logar fora da janela = acesso não autorizado." },
          { cmd: "NÃO — atacar fora do escopo", desc: "Subdomain do parceiro é fora.", output: "'Achei sem querer' não cola. Pare e reporte." },
          { cmd: "NÃO — divulgar publicamente", desc: "Sem opt-in escrito do cliente.", output: "Talk em conferência? Anonimizar tudo + autorização explícita." },
          { cmd: "NÃO — guardar dados após contrato", desc: "Backups eternos = bomba relógio.", output: "Cláusula de retenção define prazo. Cumpra." },
        ]}
      />

      <h2>11. Logging do seu próprio trabalho</h2>
      <Terminal
        path="~/projetos/pentest-cliente-x"
        lines={[
          {
            comment: "abre um shell que loga TUDO automaticamente",
            cmd: "script -a -f logs/sessao-$(date +%Y%m%d-%H%M).log",
            out: "Script started, output log file is 'logs/sessao-20260403-2342.log'.",
            outType: "success",
          },
          {
            comment: "todo comando agora vai pro log com timestamp via PROMPT_COMMAND",
            cmd: "export PROMPT_COMMAND='echo \"### $(date -Iseconds) ###\"'",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "ao terminar a sessão",
            cmd: "exit && sha256sum logs/sessao-20260403-2342.log",
            out: `Script done.
a3f9c1e2b4d8...e5f6  logs/sessao-20260403-2342.log`,
            outType: "info",
          },
          {
            comment: "alternativa visual: asciinema (record + replay)",
            cmd: "asciinema rec logs/sessao.cast --title 'pentest-cliente-x dia 3'",
            out: `asciinema: recording asciicast to logs/sessao.cast
asciinema: press <ctrl-d> or type "exit" when you're done`,
            outType: "default",
          },
        ]}
      />

      <PracticeBox
        title="Monte seu kit pré-engagement"
        goal="Antes de começar QUALQUER pentest pago, ter os documentos e o ambiente prontos."
        steps={[
          "Crie pasta projetos/cliente-X com subpastas: contrato/, recon/, exploit/, loot/, logs/, relatorio/.",
          "Coloque PDF do contrato + RoE + NDA assinados em contrato/ (com hash SHA256 anotado).",
          "Configure script(1) ou asciinema para logar todas as sessões.",
          "Crie LUKS container para loot/ — nada de dados em plaintext.",
          "Liste in-scope/out-of-scope em scope.md no root do projeto.",
          "Salve contato de emergência do cliente em emergency.txt no root.",
        ]}
        command={`mkdir -p projetos/cliente-x/{contrato,recon,exploit,loot,logs,relatorio}
cd projetos/cliente-x

# verificar contratos
sha256sum contrato/*.pdf > contrato/SHA256SUMS

# loot encriptado
fallocate -l 5G loot.img
sudo cryptsetup luksFormat loot.img
sudo cryptsetup open loot.img cliente-x-loot
sudo mkfs.ext4 /dev/mapper/cliente-x-loot
sudo mount /dev/mapper/cliente-x-loot loot/

# escopo no root
cat > scope.md <<EOF
# IN
- 198.51.100.0/24
- *.cliente.com.br

# OUT
- payment.parceiro.com (terceiro)
- VPNs corporativas
EOF

# começar sessão logada
script -a -f logs/dia1-$(date +%Y%m%d).log`}
        expected={`projetos/cliente-x/
├── contrato/
│   ├── SHA256SUMS
│   ├── contrato.pdf
│   ├── nda.pdf
│   └── roe.pdf
├── emergency.txt
├── scope.md
├── loot/        (mount LUKS encrypted)
├── logs/
│   └── dia1-20260403.log
├── recon/
├── exploit/
└── relatorio/`}
        verify="Mostre o pacote ao cliente no kickoff. Se ele aprovar a estrutura, está blindado: dados isolados, contratos auditáveis, sessões logadas. Em caso de litígio, é prova de boa-fé."
      />

      <AlertBox type="success" title="Resumo em uma linha">
        Pratique em <strong>laboratório isolado</strong> ou em{" "}
        <strong>plataformas autorizadas</strong>. Para sistemas reais,{" "}
        <strong>autorização escrita ou nada</strong>. Sem exceção.
      </AlertBox>

      <p className="mt-8">
        Agora que você entendeu a parte legal e ética, pode começar a aprender com segurança. Volte
        para o{" "}
        <Link href="/comece-aqui">
          <a className="underline font-semibold text-primary">Comece Aqui</a>
        </Link>{" "}
        ou pule para a{" "}
        <Link href="/instalacao">
          <a className="underline font-semibold text-primary">Instalação do Kali</a>.
        </Link>
      </p>
    </PageContainer>
  );
}
