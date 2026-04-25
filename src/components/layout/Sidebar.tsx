import { Link, useLocation } from "wouter";
  import { useHashLocation } from "wouter/use-hash-location";
  import { cn } from "@/lib/utils";
  import {
    BookOpen, Terminal, Shield, Settings, FileText, Users,
    Network, X, Package, Code, FolderOpen, Key,
    Globe, Wrench, ChevronRight, Search, Layers, Wifi,
    Lock, HardDrive, Zap, Bug, Eye, Radio, Database,
    Server, AlertTriangle, Award, FileSearch, Cpu,
    Crosshair, Map, Fingerprint, Biohazard, ShieldAlert,
    Flame, Skull, Target, Activity, Swords, Brain,
    MonitorSmartphone, Container, BookMarked, Trophy,
    Telescope, Link2, Radar, Scan, GitBranch, Binary,
    Cloud, Smartphone, Hash, FileCode, Webhook
  } from "lucide-react";

  const NAVIGATION = [
    {
      title: "🚀 Comece Aqui",
      items: [
        { path: "/", label: "Início", icon: BookOpen },
        { path: "/aviso-legal", label: "Aviso Legal & Ética", icon: ShieldAlert },
        { path: "/comece-aqui", label: "Do Zero Absoluto", icon: Zap },
        { path: "/primeiros-arquivos", label: "Primeiros Arquivos", icon: FileText },
      ]
    },
    {
      title: "Introdução",
      items: [
        { path: "/historia", label: "O que é Kali Linux", icon: Shield },
        { path: "/instalacao", label: "Instalação", icon: HardDrive },
        { path: "/interface", label: "Interface & Desktop", icon: Layers },
        { path: "/metodologia", label: "Metodologia de Pentest", icon: Map },
      ]
    },
    {
      title: "Terminal & Sistema",
      items: [
        { path: "/terminal", label: "Terminal Essencial", icon: Terminal },
        { path: "/filesystem", label: "Sistema de Arquivos", icon: FolderOpen },
        { path: "/permissoes", label: "Permissões", icon: Lock },
      ]
    },
    {
      title: "Gerenciamento",
      items: [
        { path: "/pacotes", label: "Gerência de Pacotes", icon: Package },
        { path: "/usuarios", label: "Usuários e Grupos", icon: Users },
        { path: "/servicos", label: "Serviços (systemd)", icon: Server },
      ]
    },
    {
      title: "OSINT & Reconhecimento",
      items: [
        { path: "/osint", label: "OSINT — Visão Geral", icon: Telescope },
        { path: "/theharvester", label: "theHarvester", icon: Search },
        { path: "/shodan", label: "Shodan", icon: Radar },
        { path: "/google-dorks", label: "Google Dorks (GHDB)", icon: Globe },
        { path: "/recon-ng", label: "Recon-ng", icon: Network },
        { path: "/maltego", label: "Maltego", icon: Link2 },
        { path: "/dnsenum", label: "DNSenum & DNSrecon", icon: Database },
      ]
    },
    {
      title: "Varredura & Enumeração",
      items: [
        { path: "/redes", label: "Redes no Kali", icon: Network },
        { path: "/nmap", label: "Nmap", icon: Search },
        { path: "/masscan", label: "Masscan", icon: Scan },
        { path: "/netcat", label: "Netcat", icon: Activity },
        { path: "/wireshark", label: "Wireshark", icon: Eye },
        { path: "/enum4linux", label: "Enum4linux (SMB)", icon: Fingerprint },
        { path: "/whatweb", label: "WhatWeb", icon: Globe },
        { path: "/ssh", label: "SSH", icon: Key },
      ]
    },
    {
      title: "Pentest Web",
      items: [
        { path: "/owasp-top10", label: "OWASP Top 10", icon: ShieldAlert },
        { path: "/burpsuite", label: "Burp Suite", icon: Globe },
        { path: "/zap", label: "OWASP ZAP", icon: Zap },
        { path: "/sqlmap", label: "SQLMap", icon: Database },
        { path: "/xss", label: "XSS Manual", icon: Code },
        { path: "/lfi-rfi", label: "LFI & RFI", icon: FolderOpen },
        { path: "/nikto", label: "Nikto", icon: AlertTriangle },
        { path: "/gobuster", label: "Gobuster", icon: Search },
        { path: "/beef", label: "BeEF", icon: Biohazard },
          { path: "/ssrf", label: "SSRF", icon: Globe },
          { path: "/csrf", label: "CSRF", icon: ShieldAlert },
          { path: "/command-injection", label: "Command Injection", icon: Terminal },
          { path: "/webshells", label: "Web Shells", icon: FileCode },
          { path: "/api-pentest", label: "Pentest de APIs", icon: Webhook },
          { path: "/deserialization", label: "Deserialization", icon: Code },
        ]
      },
      {
        title: "Quebra de Senhas",
      items: [
        { path: "/hydra", label: "Hydra", icon: Zap },
        { path: "/john", label: "John the Ripper", icon: Key },
        { path: "/hashcat", label: "Hashcat", icon: Cpu },
        { path: "/crunch", label: "Crunch & CeWL", icon: FileText },
          { path: "/seclists", label: "SecLists & Wordlists", icon: Hash },
        ]
      },
      {
        title: "Exploração",
      items: [
        { path: "/metasploit", label: "Metasploit", icon: Bug },
        { path: "/msfvenom", label: "MSFVenom", icon: Code },
        { path: "/searchsploit", label: "Searchsploit", icon: Search },
        { path: "/buffer-overflow", label: "Buffer Overflow", icon: Binary },
        { path: "/pos-exploracao", label: "Pós-Exploração", icon: Skull },
        { path: "/set", label: "SET (Eng. Social)", icon: Brain },
          { path: "/phishing", label: "Phishing Avançado", icon: Target },
          { path: "/payload-obfuscation", label: "Evasão de AV", icon: Shield },
        ]
      },
      {
        title: "Escalação de Privilégios",
      items: [
        { path: "/privesc-linux", label: "PrivEsc — Linux", icon: Flame },
        { path: "/privesc-windows", label: "PrivEsc — Windows", icon: ShieldAlert },
      ]
    },
    {
      title: "Redes & MITM",
      items: [
        { path: "/arp-spoofing", label: "ARP Spoofing & MITM", icon: Swords },
        { path: "/ettercap", label: "Ettercap", icon: Activity },
        { path: "/responder", label: "Responder (NTLM)", icon: Target },
      ]
    },
    {
      title: "Active Directory",
      items: [
        { path: "/bloodhound", label: "BloodHound", icon: Crosshair },
        { path: "/impacket", label: "Impacket", icon: Code },
        { path: "/kerberoasting", label: "Kerberoasting & PtH", icon: Key },
          { path: "/crackmapexec", label: "CrackMapExec / NetExec", icon: Crosshair },
        ]
      },
      {
        title: "Pivoting & Tunelamento",
      items: [
        { path: "/ssh-tunneling", label: "SSH Tunneling & Chisel", icon: GitBranch },
        { path: "/proxychains", label: "Proxychains", icon: Network },
        { path: "/tor", label: "Tor & Anonimato", icon: Shield },
      ]
    },
    {
      title: "Wireless",
      items: [
        { path: "/aircrack", label: "Aircrack-ng", icon: Wifi },
        { path: "/wifiphisher", label: "Wifiphisher", icon: Radio },
        { path: "/reaver", label: "Reaver (WPS)", icon: Lock },
          { path: "/bluetooth", label: "Bluetooth Hacking", icon: Radio },
        ]
      },
      {
        title: "Forense Digital",
      items: [
        { path: "/forense", label: "Forense — Visão Geral", icon: FileSearch },
        { path: "/autopsy", label: "Autopsy (Disco)", icon: HardDrive },
        { path: "/volatility", label: "Volatility (RAM)", icon: Cpu },
        { path: "/steganografia", label: "Esteganografia", icon: Eye },
          { path: "/anti-forense", label: "Anti-Forense", icon: Flame },
        ]
      },
      {
        title: "Scripting & Automação",
      items: [
        { path: "/bash-pentest", label: "Bash para Pentest", icon: Terminal },
        { path: "/python-hacking", label: "Python para Hacking", icon: Code },
          { path: "/powershell-pentest", label: "PowerShell Ofensivo", icon: Terminal },
        ]
      },
      {
        title: "Kali Avançado",
      items: [
        { path: "/nethunter", label: "Kali NetHunter (Mobile)", icon: MonitorSmartphone },
        { path: "/docker-kali", label: "Docker & Labs", icon: Container },
          { path: "/openvas", label: "OpenVAS / GVM", icon: Bug },
          { path: "/cloud-pentest", label: "Cloud Pentest", icon: Cloud },
          { path: "/mobile-pentest", label: "Mobile Pentest", icon: Smartphone },
          { path: "/reverse-engineering", label: "Engenharia Reversa", icon: Binary },
        ]
      },
      {
        title: "Referências & Carreira",
      items: [
        { path: "/cve", label: "Pesquisa de CVEs", icon: AlertTriangle },
        { path: "/bug-bounty", label: "Bug Bounty", icon: Trophy },
        { path: "/ctf", label: "CTF — Dicas", icon: Award },
        { path: "/relatorios", label: "Relatórios de Pentest", icon: FileText },
        { path: "/referencias", label: "Referências", icon: BookMarked },
      ]
    }
  ];

  interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }

  export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [location] = useHashLocation();

    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 overflow-y-auto transition-transform duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight">Kali Linux</h1>
                <p className="text-xs text-muted-foreground">Guia Completo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-4">
            {NAVIGATION.map((section) => (
              <div key={section.title}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {section.title}
                </h2>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link href={item.path}>
                          <a
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 leading-tight">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3" />}
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border mt-4">
            <p className="text-xs text-muted-foreground text-center">
              Guia Completo de Kali Linux
            </p>
            <p className="text-xs text-muted-foreground text-center">
              90 tópicos • Pentest Profissional
            </p>
          </div>
        </aside>
      </>
    );
  }
  