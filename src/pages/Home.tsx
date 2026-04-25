import { Link } from "wouter";
import {
  Shield,
  Terminal,
  Network,
  Lock,
  Bug,
  Wifi,
  Award,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Scale,
} from "lucide-react";

const sections = [
  {
    icon: Shield,
    title: "Comece Aqui (do zero)",
    desc: "Você nunca abriu um terminal? Comece por aqui — sem nenhum pré-requisito.",
    href: "/comece-aqui",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Terminal,
    title: "Primeiros Arquivos",
    desc: "Crie, edite e apague arquivos antes de aprender a lê-los.",
    href: "/primeiros-arquivos",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: Network,
    title: "Redes & Reconhecimento",
    desc: "Configure rede, descubra IPs, faça varredura com Nmap e Wireshark.",
    href: "/redes",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Bug,
    title: "Exploração",
    desc: "Metasploit, MSFVenom e técnicas de exploração em laboratório.",
    href: "/metasploit",
    color: "bg-red-500/10 text-red-500",
  },
  {
    icon: Lock,
    title: "Quebra de Senhas",
    desc: "Hydra, John the Ripper e Hashcat — em hashes seus, claro.",
    href: "/hydra",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Wifi,
    title: "Wireless",
    desc: "Aircrack-ng, Reaver e ataques em redes Wi-Fi (na sua própria).",
    href: "/aircrack",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Network,
    title: "Pentest Web",
    desc: "Burp Suite, SQLMap, OWASP Top 10 — em alvos autorizados.",
    href: "/owasp-top10",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    icon: Award,
    title: "CTF & Bug Bounty",
    desc: "Onde praticar tudo isso de forma legal e ainda ganhar dinheiro.",
    href: "/ctf",
    color: "bg-pink-500/10 text-pink-500",
  },
];

const stats = [
  { value: "90+", label: "Tópicos" },
  { value: "100+", label: "Práticas guiadas" },
  { value: "PT-BR", label: "Em Português" },
  { value: "Grátis", label: "Open Source" },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      {/* AVISO LEGAL — em destaque, no topo */}
      <div className="mb-10 rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/15 to-red-500/5 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-red-500/20 border-b border-red-500/30">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span className="text-sm font-bold uppercase tracking-wider text-red-300">
            Aviso legal — leia antes de tudo
          </span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-foreground/90 leading-relaxed m-0">
            Este guia ensina técnicas reais de <strong>segurança ofensiva</strong>.
            Usá-las em sistemas que não são seus, sem autorização escrita, é{" "}
            <strong className="text-red-300">crime no Brasil</strong> (Lei
            12.737/2012, Lei Carolina Dieckmann), com pena de{" "}
            <strong>1 a 5 anos</strong> de reclusão. A LGPD, o Marco Civil e a
            Lei 14.155/2021 também se aplicam. Lá fora as penas chegam a 10 anos.
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed m-0">
            Pratique <strong>somente</strong> em laboratório isolado (VMs
            vulneráveis em rede host-only) ou em plataformas autorizadas (TryHackMe,
            HackTheBox, PortSwigger, PicoCTF). Para qualquer alvo real, exija{" "}
            <strong>autorização por escrito</strong>. Sem exceção.
          </p>
          <Link href="/aviso-legal">
            <button className="inline-flex items-center gap-2 px-4 py-2 mt-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-sm font-semibold transition-colors">
              <Scale className="w-4 h-4" />
              Ler o capítulo completo de Aviso Legal & Ética
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <div className="text-center mb-16 mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Guia Completo em Português Brasileiro
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Kali Linux <span className="text-primary">do Zero Absoluto</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Sem pré-requisitos. Sem pular etapas. Com{" "}
          <strong className="text-foreground">exercícios práticos guiados</strong>{" "}
          em ordem cronológica — você cria o arquivo antes de aprender a lê-lo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="text-3xl font-extrabold text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Sua trilha de aprendizado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link href={s.href} key={i}>
                <div className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <div
                    className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1 text-sm mt-0 border-0">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3 mt-0 border-0">
          Pronto para começar?
        </h2>
        <p className="text-muted-foreground mb-6">
          Mesmo se você nunca abriu um terminal na vida, a primeira página foi
          feita para você.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/comece-aqui">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Começar do zero <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/aviso-legal">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:border-primary/40 transition-colors">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Ver o Aviso Legal primeiro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
