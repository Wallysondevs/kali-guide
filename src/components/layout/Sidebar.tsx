import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { cn } from "@/lib/utils";
import {
  BookOpen, Terminal, Shield, Settings, FileText, Users,
  Network, X, Package, Code, FolderOpen, Key,
  Globe, ChevronRight, Search, Layers, Wifi,
  Lock, HardDrive, Zap, Bug, Eye, Radio, Database,
  Server, AlertTriangle, Award, FileSearch, Cpu,
  Crosshair, Map, Fingerprint, Biohazard, ShieldAlert,
  Flame, Skull, Target, Activity, Swords, Brain,
  MonitorSmartphone, Container, BookMarked, Trophy,
  Telescope, Link2, Radar, Scan, GitBranch, Binary,
  Cloud, Smartphone, Hash, FileCode, Webhook, Dot,
} from "lucide-react";

const NAVIGATION = [
  {
    title: "Comece Aqui",
    items: [
      { path: "/", label: "Início", icon: BookOpen },
      { path: "/aviso-legal", label: "Aviso Legal & Ética", icon: ShieldAlert },
      { path: "/comece-aqui", label: "Do Zero Absoluto", icon: Zap },
      { path: "/primeiros-arquivos", label: "Primeiros Arquivos", icon: FileText },
      { path: "/personalizacao-setup", label: "Personalização", icon: Settings },
    ],
  },
  {
    title: "Introdução",
    items: [
      { path: "/historia", label: "O que é Kali Linux", icon: Shield },
      { path: "/instalacao", label: "Instalação", icon: HardDrive },
      { path: "/interface", label: "Interface & Desktop", icon: Layers },
      { path: "/metodologia", label: "Metodologia de Pentest", icon: Map },
    ],
  },
  {
    title: "Terminal & Sistema",
    items: [
      { path: "/terminal", label: "Terminal Essencial", icon: Terminal },
      { path: "/filesystem", label: "Sistema de Arquivos", icon: FolderOpen },
      { path: "/permissoes", label: "Permissões", icon: Lock },
    ],
  },
  {
    title: "Gerenciamento",
    items: [
      { path: "/pacotes", label: "Gerência de Pacotes", icon: Package },
      { path: "/usuarios", label: "Usuários e Grupos", icon: Users },
      { path: "/servicos", label: "Serviços (systemd)", icon: Server },
    ],
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
    ],
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
    ],
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
    ],
  },
  {
    title: "Quebra de Senhas",
    items: [
      { path: "/hydra", label: "Hydra", icon: Zap },
      { path: "/john", label: "John the Ripper", icon: Key },
      { path: "/hashcat", label: "Hashcat", icon: Cpu },
      { path: "/crunch", label: "Crunch & CeWL", icon: FileText },
      { path: "/seclists", label: "SecLists & Wordlists", icon: Hash },
    ],
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
    ],
  },
  {
    title: "Escalação de Privilégios",
    items: [
      { path: "/privesc-linux", label: "PrivEsc — Linux", icon: Flame },
      { path: "/privesc-windows", label: "PrivEsc — Windows", icon: ShieldAlert },
    ],
  },
  {
    title: "Redes & MITM",
    items: [
      { path: "/arp-spoofing", label: "ARP Spoofing & MITM", icon: Swords },
      { path: "/ettercap", label: "Ettercap", icon: Activity },
      { path: "/responder", label: "Responder (NTLM)", icon: Target },
    ],
  },
  {
    title: "Active Directory",
    items: [
      { path: "/bloodhound", label: "BloodHound", icon: Crosshair },
      { path: "/impacket", label: "Impacket", icon: Code },
      { path: "/kerberoasting", label: "Kerberoasting & PtH", icon: Key },
      { path: "/crackmapexec", label: "CrackMapExec / NetExec", icon: Crosshair },
    ],
  },
  {
    title: "Pivoting & Tunelamento",
    items: [
      { path: "/ssh-tunneling", label: "SSH Tunneling & Chisel", icon: GitBranch },
      { path: "/proxychains", label: "Proxychains", icon: Network },
      { path: "/tor", label: "Tor & Anonimato", icon: Shield },
    ],
  },
  {
    title: "Wireless",
    items: [
      { path: "/aircrack", label: "Aircrack-ng", icon: Wifi },
      { path: "/wifiphisher", label: "Wifiphisher", icon: Radio },
      { path: "/reaver", label: "Reaver (WPS)", icon: Lock },
      { path: "/bluetooth", label: "Bluetooth Hacking", icon: Radio },
    ],
  },
  {
    title: "Forense Digital",
    items: [
      { path: "/forense", label: "Forense — Visão Geral", icon: FileSearch },
      { path: "/autopsy", label: "Autopsy (Disco)", icon: HardDrive },
      { path: "/volatility", label: "Volatility (RAM)", icon: Cpu },
      { path: "/steganografia", label: "Esteganografia", icon: Eye },
      { path: "/anti-forense", label: "Anti-Forense", icon: Flame },
    ],
  },
  {
    title: "Scripting & Automação",
    items: [
      { path: "/bash-pentest", label: "Bash para Pentest", icon: Terminal },
      { path: "/python-hacking", label: "Python para Hacking", icon: Code },
      { path: "/powershell-pentest", label: "PowerShell Ofensivo", icon: Terminal },
    ],
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
    ],
  },
  {
    title: "Pacotes (Profundo)",
    items: [
      { path: "/apt", label: "APT internals", icon: Package },
      { path: "/dpkg", label: "dpkg low-level", icon: Package },
      { path: "/ppa", label: "Repos & PPA", icon: GitBranch },
      { path: "/snap-flatpak", label: "Snap & Flatpak", icon: Package },
      { path: "/appimage", label: "AppImage", icon: Package },
      { path: "/codigo-fonte", label: "Compilar do source", icon: Code },
    ],
  },
  {
    title: "Sistema, Kernel & Hardware",
    items: [
      { path: "/boot", label: "Boot & GRUB", icon: Zap },
      { path: "/kernel", label: "Kernel & módulos", icon: Cpu },
      { path: "/hardware", label: "Hardware (lshw/lspci)", icon: HardDrive },
      { path: "/compressao", label: "Compressão", icon: Package },
      { path: "/disco", label: "Diagnóstico de disco", icon: HardDrive },
      { path: "/particoes", label: "Particionamento", icon: HardDrive },
    ],
  },
  {
    title: "Storage & Backup",
    items: [
      { path: "/lvm", label: "LVM", icon: Layers },
      { path: "/luks", label: "LUKS (criptografia)", icon: Lock },
      { path: "/fstab", label: "fstab", icon: FileText },
      { path: "/backup", label: "Backup (rsync/borg)", icon: HardDrive },
      { path: "/timeshift", label: "Timeshift", icon: HardDrive },
    ],
  },
  {
    title: "Processos & Logs",
    items: [
      { path: "/processos", label: "Processos", icon: Activity },
      { path: "/cron", label: "Cron & agendamento", icon: Activity },
      { path: "/journalctl", label: "journalctl", icon: FileSearch },
      { path: "/iostat", label: "I/O & monitoring", icon: Activity },
      { path: "/man-pages", label: "Man pages & help", icon: BookOpen },
      { path: "/localizacao", label: "Locale & timezone", icon: Globe },
    ],
  },
  {
    title: "Bash (Shell)",
    items: [
      { path: "/shell-bash", label: "Shell Bash", icon: Terminal },
      { path: "/variaveis-ambiente", label: "Variáveis & PATH", icon: Code },
      { path: "/aliases", label: "Aliases & funções", icon: Code },
      { path: "/expansoes-bash", label: "Expansões", icon: Code },
      { path: "/redirecionamento", label: "Redirecionamento", icon: Terminal },
      { path: "/bash-avancado", label: "One-liners avançado", icon: Terminal },
    ],
  },
  {
    title: "Editores & Scripts",
    items: [
      { path: "/scripts-bash", label: "Scripts Bash", icon: FileCode },
      { path: "/zsh", label: "Zsh & OMZ", icon: Terminal },
      { path: "/vim", label: "Vim", icon: FileCode },
      { path: "/navegacao", label: "Navegação no shell", icon: FolderOpen },
      { path: "/manipulacao-arquivos", label: "Manipulação de arquivos", icon: FolderOpen },
    ],
  },
  {
    title: "Files, Multimedia & GUI",
    items: [
      { path: "/visualizacao", label: "Visualizar arquivos", icon: Eye },
      { path: "/multimedia", label: "Multimedia & exiftool", icon: FileSearch },
      { path: "/wine", label: "Wine", icon: MonitorSmartphone },
      { path: "/troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
      { path: "/ambiente-grafico", label: "Ambiente Gráfico", icon: MonitorSmartphone },
    ],
  },
  {
    title: "Redes (Profundo)",
    items: [
      { path: "/netplan", label: "Netplan & NM", icon: Network },
      { path: "/dns", label: "DNS", icon: Globe },
      { path: "/vpn", label: "VPN (OpenVPN/WG)", icon: Shield },
      { path: "/samba", label: "Samba & SMB", icon: Network },
    ],
  },
  {
    title: "Containers & Servidores Web",
    items: [
      { path: "/docker", label: "Docker", icon: Container },
      { path: "/docker-compose", label: "Docker Compose", icon: Container },
      { path: "/kvm", label: "KVM/QEMU/libvirt", icon: Server },
      { path: "/nginx", label: "Nginx", icon: Server },
      { path: "/apache", label: "Apache", icon: Server },
      { path: "/php", label: "PHP", icon: Code },
    ],
  },
  {
    title: "Bancos & Hardening",
    items: [
      { path: "/mysql", label: "MySQL/MariaDB", icon: Database },
      { path: "/postgresql", label: "PostgreSQL", icon: Database },
      { path: "/apparmor", label: "AppArmor", icon: Shield },
      { path: "/fail2ban", label: "Fail2Ban", icon: Shield },
    ],
  },
  {
    title: "Defensiva & Dev",
    items: [
      { path: "/gpg", label: "GPG", icon: Key },
      { path: "/seguranca", label: "UFW/iptables/sudoers", icon: Shield },
      { path: "/python", label: "Python", icon: Code },
      { path: "/nodejs", label: "Node.js", icon: Code },
      { path: "/git", label: "Git", icon: GitBranch },
    ],
  },
  {
    title: "Dev Tooling Pentest",
    items: [
      { path: "/java", label: "Java (JDK)", icon: Code },
      { path: "/vscode", label: "VS Code", icon: FileCode },
      { path: "/ansible", label: "Ansible", icon: Server },
      { path: "/pwncat", label: "Pwncat-cs", icon: Terminal },
      { path: "/chisel", label: "Chisel (pivot)", icon: GitBranch },
    ],
  },
  {
    title: "C2 Frameworks",
    items: [
      { path: "/sliver", label: "Sliver C2", icon: Skull },
      { path: "/havoc", label: "Havoc", icon: Skull },
      { path: "/mythic", label: "Mythic", icon: Skull },
    ],
  },
  {
    title: "AD Tooling",
    items: [
      { path: "/mimikatz", label: "Mimikatz", icon: Key },
      { path: "/rubeus", label: "Rubeus", icon: Key },
      { path: "/sharphound", label: "SharpHound", icon: Crosshair },
    ],
  },
  {
    title: "Phishing, Fuzzing & Detection",
    items: [
      { path: "/evilginx", label: "Evilginx2", icon: Target },
      { path: "/gophish", label: "Gophish", icon: Target },
      { path: "/wfuzz", label: "Wfuzz & ffuf", icon: Search },
      { path: "/atomic-red-team", label: "Atomic Red Team", icon: Swords },
    ],
  },
  {
    title: "Referências & Carreira",
    items: [
      { path: "/cve", label: "Pesquisa de CVEs", icon: AlertTriangle },
      { path: "/bug-bounty", label: "Bug Bounty", icon: Trophy },
      { path: "/ctf", label: "CTF — Dicas", icon: Award },
      { path: "/relatorios", label: "Relatórios de Pentest", icon: FileText },
      { path: "/referencias", label: "Referências", icon: BookMarked },
    ],
  },
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

      {/* Sidebar — janela tipo terminal Kali */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 z-50 overflow-y-auto kali-scroll transition-transform duration-300 border-r border-[hsl(var(--kali-cyan))]/15",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ background: "hsl(var(--kali-bg))" }}
      >
        {/* Header tipo title-bar de terminal */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 z-10"
          style={{ background: "hsl(var(--kali-bg-2))" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-mono font-bold text-sm leading-tight text-[hsl(var(--kali-cyan))]">
                kali@dragon
              </h1>
              <p className="text-[10px] text-[hsl(var(--kali-dim))] font-mono leading-tight">
                /usr/share/guide
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini prompt */}
        <div
          className="px-4 py-2 border-b border-white/5 font-mono text-[11px]"
          style={{ background: "hsl(var(--kali-bg))" }}
        >
          <span className="text-[hsl(var(--kali-blue))]">┌──(</span>
          <span className="text-[hsl(var(--kali-blue))]">root</span>
          <span className="text-[hsl(var(--kali-magenta))]">㉿</span>
          <span className="text-[hsl(var(--kali-blue))]">kali</span>
          <span className="text-[hsl(var(--kali-blue))]">)</span>
          <br />
          <span className="text-[hsl(var(--kali-blue))]">└─</span>
          <span className="text-[hsl(var(--kali-magenta))]">#</span>{" "}
          <span className="text-[hsl(var(--kali-fg))]">ls</span>{" "}
          <span className="text-[hsl(var(--kali-cyan))]">/topicos</span>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-5 pb-8">
          {NAVIGATION.map((section, sIdx) => (
            <div key={section.title}>
              <h2 className="text-[10px] font-mono font-semibold text-[hsl(var(--kali-cyan))]/80 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <span className="text-[hsl(var(--kali-magenta))]">
                  [{String(sIdx + 1).padStart(2, "0")}]
                </span>
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
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-mono transition-colors",
                            isActive
                              ? "bg-[hsl(var(--kali-cyan))]/15 text-[hsl(var(--kali-cyan))] font-semibold"
                              : "text-[hsl(var(--kali-fg))]/75 hover:text-[hsl(var(--kali-cyan))] hover:bg-white/5"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {isActive ? (
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-[hsl(var(--kali-magenta))]" />
                          ) : (
                            <Dot className="w-3.5 h-3.5 flex-shrink-0 text-[hsl(var(--kali-dim))]" />
                          )}
                          <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                          <span className="flex-1 leading-tight truncate">
                            {item.label}
                          </span>
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer estilo prompt */}
        <div className="px-4 py-3 border-t border-white/5 font-mono text-[10px] sticky bottom-0" style={{ background: "hsl(var(--kali-bg-2))" }}>
          <p className="text-[hsl(var(--kali-dim))] m-0 leading-tight">
            <span className="text-[hsl(var(--kali-green))]">●</span> 160+ tópicos
          </p>
          <p className="text-[hsl(var(--kali-dim))] m-0 leading-tight">
            <span className="text-[hsl(var(--kali-cyan))]">$</span> Pentest Profissional PT-BR
          </p>
        </div>
      </aside>
    </>
  );
}
