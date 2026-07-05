import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Shield, Terminal, Network, Lock, Bug, Wifi, Award,
  ChevronRight, AlertTriangle, ShieldAlert, Scale, Play, GraduationCap,
} from "lucide-react";
import { KaliLogo } from "@/components/ui/KaliLogo";
import { COURSE, TOTAL_LESSONS, MODULES, useProgress } from "@/lib/course";

const sections = [
  { icon: Shield, title: "Comece Aqui (do zero)", desc: "Nunca abriu um terminal? Comece por aqui — sem nenhum pré-requisito.", href: "/comece-aqui", color: "bg-primary/10 text-primary" },
  { icon: Terminal, title: "Primeiros Arquivos", desc: "Crie, edite e apague arquivos antes de aprender a lê-los.", href: "/primeiros-arquivos", color: "bg-violet-500/10 text-violet-400" },
  { icon: Network, title: "Redes & Reconhecimento", desc: "Configure rede, descubra IPs, varredura com Nmap e Wireshark.", href: "/redes", color: "bg-cyan-500/10 text-cyan-400" },
  { icon: Bug, title: "Exploração", desc: "Metasploit, MSFVenom e técnicas de exploração em laboratório.", href: "/metasploit", color: "bg-red-500/10 text-red-400" },
  { icon: Lock, title: "Quebra de Senhas", desc: "Hydra, John the Ripper e Hashcat — em hashes seus, claro.", href: "/hydra", color: "bg-orange-500/10 text-orange-400" },
  { icon: Wifi, title: "Wireless", desc: "Aircrack-ng, Reaver e ataques Wi-Fi (na sua própria rede).", href: "/aircrack", color: "bg-green-500/10 text-green-400" },
  { icon: Network, title: "Pentest Web", desc: "Burp Suite, SQLMap, OWASP Top 10 — em alvos autorizados.", href: "/owasp-top10", color: "bg-yellow-500/10 text-yellow-400" },
  { icon: Award, title: "CTF & Bug Bounty", desc: "Onde praticar tudo isso de forma legal e ainda ganhar dinheiro.", href: "/ctf", color: "bg-pink-500/10 text-pink-400" },
];

const DEMO = [
  { d: 0,    t: "comment", x: "# lab autorizado — alvo: 10.10.10.5 (VM host-only)" },
  { d: 500,  t: "cmd",     x: "nmap -sV -sC 10.10.10.5" },
  { d: 1200, t: "out",     x: "Starting Nmap 7.96 ( https://nmap.org )" },
  { d: 1700, t: "out",     x: "22/tcp  open  ssh      OpenSSH 9.9p1" },
  { d: 2100, t: "out",     x: "80/tcp  open  http     Apache httpd 2.4.65" },
  { d: 2600, t: "ok",      x: "Service detection performed. ✓" },
  { d: 3200, t: "comment", x: "# e quando algo falha, o curso mostra o erro REAL:" },
  { d: 3800, t: "cmd",     x: "msfconsole -q -x 'use exploit/multi/handler; run'" },
  { d: 4500, t: "err",     x: "[-] Handler failed to bind to 10.10.10.5:4444" },
  { d: 5000, t: "warn",    x: "→ porta em uso / sem rota. Você aprende a diagnosticar e corrigir." },
];

const COLOR: Record<string, string> = {
  cmd: "text-[hsl(var(--kali-fg))]",
  out: "text-[hsl(var(--kali-fg))]/75",
  ok: "text-[hsl(var(--kali-green))]",
  err: "text-[hsl(var(--kali-red))]",
  warn: "text-[hsl(var(--kali-yellow))]",
  comment: "text-[hsl(var(--kali-dim))] italic",
};

function KaliPrompt() {
  return (
    <span className="select-none">
      <span className="text-[hsl(var(--kali-blue))]">┌──(</span>
      <span className="text-[hsl(var(--kali-blue))]">kali</span>
      <span className="text-[hsl(var(--kali-magenta))]">㉿</span>
      <span className="text-[hsl(var(--kali-blue))]">kali</span>
      <span className="text-[hsl(var(--kali-blue))]">)-[</span>
      <span className="text-[hsl(var(--kali-cyan))]">~</span>
      <span className="text-[hsl(var(--kali-blue))]">]</span>
      <br />
      <span className="text-[hsl(var(--kali-blue))]">└─</span>
      <span className="text-[hsl(var(--kali-magenta))]">$</span>{" "}
    </span>
  );
}

export default function Home() {
  const { count, percent, has } = useProgress();
  const continueLesson = COURSE.find((l) => !has(l.path)) ?? COURSE[0];
  const started = count > 0;
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = DEMO.map((l, i) => window.setTimeout(() => setVisible(i + 1), l.d));
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4">
        <div className="aurora" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="orb w-72 h-72 bg-primary/20 top-6 -left-10" />
        <div className="orb w-72 h-72 bg-[hsl(var(--kali-magenta))]/20 top-24 right-0" style={{ animationDelay: "3s" }} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* AVISO LEGAL — sempre no topo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="mb-10 rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/15 to-red-500/5 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-3 bg-red-500/20 border-b border-red-500/30">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-red-300">Aviso legal — leia antes de tudo</span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed m-0">
                Este guia ensina <strong>segurança ofensiva</strong> para fins <strong>educacionais e defensivos</strong>.
                Usar estas técnicas em sistemas que não são seus, sem <strong>autorização por escrito</strong>, é{" "}
                <strong className="text-red-300">crime</strong> (no Brasil, Art. 154-A do Código Penal, Lei 12.737/2012 e Lei 14.155/2021).
                Pratique <strong>somente</strong> em laboratório isolado ou plataformas autorizadas (TryHackMe, HackTheBox, PortSwigger).
              </p>
              <Link href="/aviso-legal">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-sm font-semibold transition-colors">
                  <Scale className="w-4 h-4" /> Ler o capítulo de Aviso Legal & Ética <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
            {/* Coluna texto */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2.5 mb-6">
                <KaliLogo size={48} />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Kali 2026 · Curso PT-BR
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.05]">
                Curso de <span className="text-gradient-kali">Kali Linux</span><br />do zero ao pentest
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Sem pré-requisitos e na prática: você executa os comandos, vê as saídas reais,
                os erros e as falhas — e aprende a resolver cada um, de forma ética e autorizada.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href={started ? continueLesson.path : "/comece-aqui"}>
                  <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shine">
                    <Play className="w-5 h-5" /> {started ? "Continuar o curso" : "Começar do zero"}
                  </button>
                </Link>
                <a href="#trilha" className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold hover:border-primary/40 transition-all flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Ver a trilha
                </a>
              </div>

              {started && (
                <div className="mt-8 max-w-sm">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-muted-foreground">seu progresso</span>
                    <span className="text-primary font-bold">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full transition-[width] duration-500" style={{ width: `${percent}%`, background: "linear-gradient(90deg, hsl(var(--kali-cyan)), hsl(var(--kali-magenta)))" }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{count} de {TOTAL_LESSONS} tópicos concluídos</p>
                </div>
              )}
            </motion.div>

            {/* Coluna terminal ao vivo */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-2xl" />
              <div className="relative rounded-xl border border-white/10 overflow-hidden shadow-2xl kali-scanlines" style={{ background: "hsl(var(--kali-bg))" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5" style={{ background: "hsl(var(--kali-bg-2))" }}>
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="flex-1 text-center text-xs font-mono text-[hsl(var(--kali-dim))]">kali@kali: ~</span>
                </div>
                <div className="p-4 font-mono text-[12.5px] leading-relaxed min-h-[300px]">
                  {DEMO.slice(0, visible).map((l, i) => (
                    <div key={i} className={`whitespace-pre-wrap break-words ${COLOR[l.t]}`}>
                      {l.t === "cmd" && <KaliPrompt />}
                      <span>{l.x}</span>
                    </div>
                  ))}
                  {visible >= DEMO.length && <span className="kali-cursor" />}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="border-y border-border bg-card/40 relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: `${TOTAL_LESSONS}`, l: "Tópicos práticos" },
            { n: `${MODULES.length}`, l: "Módulos" },
            { n: "PT-BR", l: "Em Português" },
            { n: "2026", l: "Kali atualizado" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-black text-foreground mb-1">{s.n}</div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TRILHA (destaques) ---------------- */}
      <section id="trilha" className="py-20 px-4 max-w-6xl mx-auto relative z-10 scroll-mt-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 border-0 before:content-none">Sua trilha de aprendizado</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {MODULES.length} módulos em ordem, do primeiro comando ao pentest de Active Directory.
            Marque cada tópico como concluído e acompanhe seu progresso na barra lateral.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
              >
                <Link href={s.href}>
                  <div className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                    <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 text-sm mt-0 border-0">{s.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- CTA FINAL ---------------- */}
      <section className="pb-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="orb w-56 h-56 bg-primary/10 left-1/2 -translate-x-1/2 top-0" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 mt-0 border-0 before:content-none">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Mesmo se você nunca abriu um terminal na vida, a primeira página foi feita para você — de forma legal e ética.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/comece-aqui">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  Começar do zero <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/aviso-legal">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:border-primary/40 transition-colors">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Ver o Aviso Legal primeiro
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
