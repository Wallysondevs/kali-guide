import { Link } from "wouter";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Scale, Gavel, BookOpen, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

export default function AvisoLegal() {
  return (
    <PageContainer
      title="Aviso Legal &amp; Ética — Leia Antes de Tudo"
      subtitle="Este guia ensina técnicas reais de segurança ofensiva. Esta página explica onde elas são legais, onde são crime, e como praticar sem ir para a cadeia."
      difficulty="iniciante"
      timeToRead="10 min"
    >
      <AlertBox type="danger" title="Este aviso não é figurativo">
        Tudo o que está escrito a partir daqui pode ser usado para invadir
        sistemas alheios. <strong>Fazer isso sem autorização é crime no Brasil
        e em praticamente todo o mundo.</strong> Não importa se foi "só para
        testar", "só para mostrar", "rapidinho" ou se "o site era inseguro".
        Você é responsável pelos comandos que executa.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <Gavel className="w-6 h-6 text-primary" /> 1. O que diz a lei brasileira
      </h2>

      <div className="my-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Lei 12.737/2012 — "Lei
            Carolina Dieckmann"
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-2">
            Acrescentou o <strong>Art. 154-A</strong> ao Código Penal:
          </p>
          <blockquote className="border-l-4 border-primary/40 pl-4 text-sm text-muted-foreground italic">
            "Invadir dispositivo informático alheio, conectado ou não à rede
            de computadores, mediante violação indevida de mecanismo de
            segurança e com o fim de obter, adulterar ou destruir dados ou
            informações sem autorização expressa ou tácita do titular do
            dispositivo (...)"
          </blockquote>
          <p className="text-sm text-foreground/90 mt-3 mb-0">
            <strong>Pena:</strong> reclusão de 1 a 4 anos + multa. Aumenta se
            houver prejuízo, vazamento ou se a vítima for autoridade.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Lei 14.155/2021 — Crimes
            cibernéticos
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Aumentou as penas de invasão de dispositivo (até{" "}
            <strong>5 anos</strong> em casos graves) e tipificou novos crimes
            como fraude eletrônica (Art. 171, §2º-A) com pena de 4 a 8 anos.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> LGPD — Lei 13.709/2018
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Manipular, vazar ou expor dados pessoais sem base legal pode
            gerar multas de até <strong>R$ 50 milhões</strong> ou 2% do
            faturamento da empresa. Para pessoas físicas, abre caminho para
            ações cíveis e criminais.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold mt-0 mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Marco Civil da Internet
            — Lei 12.965/2014
          </h3>
          <p className="text-sm text-foreground/90 mt-0 mb-0">
            Define direitos e deveres do usuário e do provedor. Logs de
            conexão são obrigatórios e podem ser usados para te identificar
            mesmo se você usar VPN comercial brasileira.
          </p>
        </div>
      </div>

      <h2 className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" /> 2. E lá fora?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[
          {
            pais: "EUA",
            lei: "Computer Fraud and Abuse Act (CFAA)",
            pena: "Até 10 anos por acesso não autorizado",
          },
          {
            pais: "Reino Unido",
            lei: "Computer Misuse Act 1990",
            pena: "Até 10 anos + multa ilimitada",
          },
          {
            pais: "União Europeia",
            lei: "GDPR + leis nacionais",
            pena: "Multas até 4% do faturamento global",
          },
          {
            pais: "Portugal",
            lei: "Lei do Cibercrime (Lei 109/2009)",
            pena: "Até 5 anos por acesso ilegítimo",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs uppercase font-semibold text-primary tracking-wider mb-1">
              {item.pais}
            </p>
            <p className="text-sm font-semibold text-foreground mt-0 mb-1">
              {item.lei}
            </p>
            <p className="text-xs text-muted-foreground mt-0 mb-0">
              {item.pena}
            </p>
          </div>
        ))}
      </div>

      <AlertBox type="warning" title="Não existe 'só por curiosidade'">
        Promotor não vai aceitar "eu só queria ver se conseguia". Se você
        invadiu, você cometeu o crime. A intenção pode reduzir a pena, mas
        não elimina o crime.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-primary" /> 3. Onde praticar
        legalmente
      </h2>
      <p>
        Existem ambientes <strong>desenhados para você atacar</strong>. Use só
        eles enquanto estiver aprendendo. São gratuitos ou baratíssimos e
        cobrem 99% do que você quer testar.
      </p>

      <h3>3.1. Plataformas online (CTF e laboratórios)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {[
          {
            nome: "TryHackMe",
            url: "https://tryhackme.com",
            desc: "Trilhas guiadas do absoluto zero. Ideal para começar.",
          },
          {
            nome: "Hack The Box",
            url: "https://hackthebox.com",
            desc: "Máquinas reais para invadir. Mais avançado.",
          },
          {
            nome: "PortSwigger Web Security Academy",
            url: "https://portswigger.net/web-security",
            desc: "Tudo de pentest web. Gratuito e excelente.",
          },
          {
            nome: "PicoCTF",
            url: "https://picoctf.org",
            desc: "Desafios de segurança feitos pela CMU. Muito didáticos.",
          },
          {
            nome: "OverTheWire",
            url: "https://overthewire.org/wargames/",
            desc: "Wargames clássicos: Bandit, Natas, etc. Comece pelo Bandit.",
          },
          {
            nome: "Root-Me",
            url: "https://www.root-me.org",
            desc: "Centenas de desafios de várias categorias.",
          },
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

      <h3>3.2. Máquinas vulneráveis para baixar (rodar local)</h3>
      <p>
        Baixe estas VMs e rode em <strong>VirtualBox</strong> ou{" "}
        <strong>VMware</strong> em modo <em>host-only</em> (rede isolada,
        sem acesso à internet). Assim você ataca sem risco para ninguém.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {[
          { nome: "Metasploitable 2 / 3", desc: "Linux propositalmente fraco." },
          { nome: "DVWA", desc: "Damn Vulnerable Web Application." },
          { nome: "OWASP Juice Shop", desc: "Loja online com falhas modernas." },
          { nome: "VulnHub", desc: "Catálogo enorme: vulnhub.com" },
          { nome: "OWASP WebGoat", desc: "Aulas guiadas de pentest web." },
          {
            nome: "bWAPP",
            desc: "buggy Web Application — 100+ vulnerabilidades.",
          },
        ].map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-bold text-foreground mt-0 mb-1">
              {p.nome}
            </p>
            <p className="text-xs text-muted-foreground mt-0 mb-0">{p.desc}</p>
          </div>
        ))}
      </div>

      <AlertBox type="info" title="Como isolar o seu laboratório">
        No VirtualBox: <strong>Settings → Network → Host-only Adapter</strong>.
        Crie uma rede host-only no menu <em>File → Host Network Manager</em>.
        Coloque o Kali e a VM vulnerável na mesma rede host-only.{" "}
        <strong>Não use modo Bridged</strong> para alvos vulneráveis — eles
        ficariam expostos na sua rede de casa.
      </AlertBox>

      <h2 className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-primary" /> 4. Antes de testar
        em qualquer alvo real
      </h2>
      <p>
        Se você for fazer um pentest em um sistema que <strong>não é seu</strong>
        {" "}(empresa cliente, programa de bug bounty, sistema de um amigo),
        você precisa de:
      </p>

      <ol>
        <li>
          <strong>Autorização por escrito</strong> assinada por alguém com poder
          para autorizar (geralmente CISO, CTO ou dono).
        </li>
        <li>
          <strong>Escopo definido:</strong> quais IPs, domínios, aplicações
          podem ser testados. O que está fora.
        </li>
        <li>
          <strong>Janela temporal:</strong> entre quais datas e horários.
        </li>
        <li>
          <strong>Tipos de teste permitidos:</strong> só caixa-preta? Pode
          fazer DoS? Pode usar engenharia social?
        </li>
        <li>
          <strong>Contato de emergência:</strong> quem chamar se algo cair.
        </li>
        <li>
          <strong>Acordo de confidencialidade (NDA):</strong> tudo o que você
          encontrar é segredo.
        </li>
      </ol>

      <p>
        Para programas de bug bounty (HackerOne, Bugcrowd, Intigriti) a
        autorização é o próprio <em>scope</em> publicado pela empresa. Leia
        o escopo <strong>antes</strong> de começar e respeite-o à risca.
      </p>

      <h2>5. Modelo de termo de autorização (mínimo viável)</h2>
      <p>
        Use isso só como ponto de partida — sempre revise com um advogado
        antes de assinar com cliente.
      </p>
      <CodeBlock
        language="text"
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

      <h2>6. Checklist ético rápido</h2>
      <p>
        Antes de digitar <code>Enter</code> em qualquer comando que toca um
        sistema fora da sua máquina, responda mentalmente:
      </p>
      <div className="my-6 space-y-2">
        {[
          "Eu tenho autorização EXPLÍCITA por escrito para mexer neste alvo?",
          "Esse alvo está dentro do escopo combinado?",
          "Estou dentro da janela temporal autorizada?",
          "Esse comando pode causar indisponibilidade? Ele está permitido?",
          "Se algo der errado, eu sei quem chamar?",
          "Estou registrando tudo (logs, prints, comandos) para o relatório?",
        ].map((q, i) => (
          <div
            key={i}
            className="flex items-start gap-3 text-sm bg-card border border-border rounded-lg p-3"
          >
            <span className="text-primary font-bold">☐</span>
            <span className="text-foreground/90">{q}</span>
          </div>
        ))}
      </div>

      <AlertBox type="success" title="Resumo em uma linha">
        Pratique em <strong>laboratório isolado</strong> ou em{" "}
        <strong>plataformas autorizadas</strong>. Para sistemas reais,{" "}
        <strong>autorização escrita ou nada</strong>. Sem exceção.
      </AlertBox>

      <p className="mt-8">
        Agora que você entendeu a parte legal e ética, pode começar a
        aprender com segurança. Volte para o{" "}
        <Link href="/comece-aqui">
          <a className="underline font-semibold text-primary">
            Comece Aqui
          </a>
        </Link>{" "}
        ou pule para a{" "}
        <Link href="/instalacao">
          <a className="underline font-semibold text-primary">
            Instalação do Kali
          </a>
          .
        </Link>
      </p>
    </PageContainer>
  );
}
