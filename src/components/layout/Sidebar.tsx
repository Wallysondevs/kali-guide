import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BookOpen, Terminal, Shield, Settings, FileText, Users,
  Network, X, Package, Code, FolderOpen, Key,
  Globe, Wrench, ChevronRight, Search, Layers, Wifi,
  Lock, HardDrive, Zap, Bug, Eye, Radio, Database,
  Server, AlertTriangle, Award, FileSearch, Cpu
} from "lucide-react";

const NAVIGATION = [
  {
    title: "Introdução",
    items: [
      { path: "/", label: "Início", icon: BookOpen },
      { path: "/historia", label: "O que é Kali Linux", icon: Shield },
      { path: "/instalacao", label: "Instalação", icon: HardDrive },
      { path: "/interface", label: "Interface & Desktop", icon: Layers },
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
    title: "Redes",
    items: [
      { path: "/redes", label: "Redes no Kali", icon: Network },
      { path: "/nmap", label: "Nmap", icon: Search },
      { path: "/wireshark", label: "Wireshark", icon: Eye },
      { path: "/ssh", label: "SSH", icon: Key },
    ]
  },
  {
    title: "Pentest Web",
    items: [
      { path: "/burpsuite", label: "Burp Suite", icon: Globe },
      { path: "/sqlmap", label: "SQLMap", icon: Database },
      { path: "/nikto", label: "Nikto", icon: AlertTriangle },
      { path: "/gobuster", label: "Gobuster", icon: Search },
    ]
  },
  {
    title: "Quebra de Senhas",
    items: [
      { path: "/hydra", label: "Hydra", icon: Zap },
      { path: "/john", label: "John the Ripper", icon: Key },
      { path: "/hashcat", label: "Hashcat", icon: Cpu },
    ]
  },
  {
    title: "Exploração",
    items: [
      { path: "/metasploit", label: "Metasploit", icon: Bug },
      { path: "/msfvenom", label: "MSFVenom", icon: Code },
    ]
  },
  {
    title: "Wireless",
    items: [
      { path: "/aircrack", label: "Aircrack-ng", icon: Wifi },
      { path: "/wifiphisher", label: "Wifiphisher", icon: Radio },
    ]
  },
  {
    title: "Anonimato",
    items: [
      { path: "/proxychains", label: "Proxychains", icon: Network },
      { path: "/tor", label: "Tor & Anonimato", icon: Shield },
    ]
  },
  {
    title: "Avançado",
    items: [
      { path: "/forense", label: "Forense Digital", icon: FileSearch },
      { path: "/ctf", label: "CTF — Dicas", icon: Award },
      { path: "/relatorios", label: "Relatórios de Pentest", icon: FileText },
      { path: "/referencias", label: "Referências", icon: BookOpen },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between lg:justify-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold mt-0 mb-0 pb-0 border-0 leading-tight">Kali Linux</h2>
                <p className="text-xs text-muted-foreground">Guia Completo</p>
              </div>
            </Link>
            <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-8">
            {NAVIGATION.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 mt-0 border-0 pb-0">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.items.map((item, i) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={i}>
                        <Link
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "opacity-70")} />
                          {item.label}
                          {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
