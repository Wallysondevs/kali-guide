import { Link } from "wouter";
import { Shield, Terminal, Network, Lock, Bug, Wifi, Award, ChevronRight } from "lucide-react";

const sections = [
  { icon: Shield, title: "Introdução", desc: "O que é Kali Linux, história e instalação.", href: "/historia", color: "bg-blue-500/10 text-blue-500" },
  { icon: Terminal, title: "Terminal & Sistema", desc: "Comandos essenciais, filesystem e permissões.", href: "/terminal", color: "bg-violet-500/10 text-violet-500" },
  { icon: Network, title: "Redes", desc: "Nmap, Wireshark, SSH e análise de rede.", href: "/nmap", color: "bg-cyan-500/10 text-cyan-500" },
  { icon: Bug, title: "Exploração", desc: "Metasploit, MSFVenom e técnicas de exploração.", href: "/metasploit", color: "bg-red-500/10 text-red-500" },
  { icon: Lock, title: "Quebra de Senhas", desc: "Hydra, John the Ripper e Hashcat.", href: "/hydra", color: "bg-orange-500/10 text-orange-500" },
  { icon: Wifi, title: "Wireless", desc: "Aircrack-ng e ataques em redes Wi-Fi.", href: "/aircrack", color: "bg-green-500/10 text-green-500" },
  { icon: Network, title: "Pentest Web", desc: "Burp Suite, SQLMap, Nikto e Gobuster.", href: "/burpsuite", color: "bg-yellow-500/10 text-yellow-500" },
  { icon: Award, title: "CTF & Relatórios", desc: "Dicas de CTF e escrita de relatórios.", href: "/ctf", color: "bg-primary/10 text-primary" },
];

const stats = [
  { value: "600+", label: "Ferramentas" },
  { value: "30", label: "Capítulos" },
  { value: "PT-BR", label: "Em Português" },
  { value: "Grátis", label: "Open Source" },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="text-center mb-16 mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Guia Completo em Português Brasileiro
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Kali Linux{" "}
          <span className="text-primary">do Zero</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Do básico ao avançado — aprenda a usar o sistema operacional mais poderoso 
          para testes de penetração, forense digital e segurança ofensiva.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">O que você vai aprender</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link href={s.href} key={i}>
                <div className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1 text-sm mt-0 border-0">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
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
        <h2 className="text-2xl font-bold mb-3 mt-0 border-0">Pronto para começar?</h2>
        <p className="text-muted-foreground mb-6">
          Comece pela história do Kali Linux e instale o sistema do jeito certo.
        </p>
        <Link href="/historia">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Começar agora <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-sm text-red-400 font-medium text-center">
          ⚠️ <strong className="text-foreground">Aviso Legal:</strong> Este guia é para fins educacionais e de aprendizado legítimo em ambientes controlados. 
          Nunca utilize estas técnicas sem autorização expressa. Use de forma ética e legal.
        </p>
      </div>
    </div>
  );
}
