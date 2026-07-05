import { useSyncExternalStore } from "react";

export interface Lesson { path: string; label: string; }
export interface Module { title: string; lessons: Lesson[]; }

// Ordem oficial do curso — espelha a navegação da Sidebar (gerado a partir dela).
export const MODULES: Module[] = [
  {
    title: "Comece Aqui",
    lessons: [
      { path: "/aviso-legal", label: "Aviso Legal & Ética" },
      { path: "/comece-aqui", label: "Do Zero Absoluto" },
      { path: "/primeiros-arquivos", label: "Primeiros Arquivos" },
      { path: "/personalizacao-setup", label: "Personalização" }
    ],
  },
  {
    title: "Introdução",
    lessons: [
      { path: "/historia", label: "O que é Kali Linux" },
      { path: "/instalacao", label: "Instalação" },
      { path: "/interface", label: "Interface & Desktop" },
      { path: "/metodologia", label: "Metodologia de Pentest" }
    ],
  },
  {
    title: "Terminal & Sistema",
    lessons: [
      { path: "/terminal", label: "Terminal Essencial" },
      { path: "/filesystem", label: "Sistema de Arquivos" },
      { path: "/permissoes", label: "Permissões" }
    ],
  },
  {
    title: "Gerenciamento",
    lessons: [
      { path: "/pacotes", label: "Gerência de Pacotes" },
      { path: "/usuarios", label: "Usuários e Grupos" },
      { path: "/servicos", label: "Serviços (systemd)" }
    ],
  },
  {
    title: "OSINT & Reconhecimento",
    lessons: [
      { path: "/osint", label: "OSINT — Visão Geral" },
      { path: "/theharvester", label: "theHarvester" },
      { path: "/shodan", label: "Shodan" },
      { path: "/google-dorks", label: "Google Dorks (GHDB)" },
      { path: "/recon-ng", label: "Recon-ng" },
      { path: "/maltego", label: "Maltego" },
      { path: "/dnsenum", label: "DNSenum & DNSrecon" }
    ],
  },
  {
    title: "Varredura & Enumeração",
    lessons: [
      { path: "/redes", label: "Redes no Kali" },
      { path: "/nmap", label: "Nmap" },
      { path: "/masscan", label: "Masscan" },
      { path: "/netcat", label: "Netcat" },
      { path: "/wireshark", label: "Wireshark" },
      { path: "/enum4linux", label: "Enum4linux (SMB)" },
      { path: "/whatweb", label: "WhatWeb" },
      { path: "/ssh", label: "SSH" }
    ],
  },
  {
    title: "Pentest Web",
    lessons: [
      { path: "/owasp-top10", label: "OWASP Top 10" },
      { path: "/burpsuite", label: "Burp Suite" },
      { path: "/zap", label: "OWASP ZAP" },
      { path: "/sqlmap", label: "SQLMap" },
      { path: "/xss", label: "XSS Manual" },
      { path: "/lfi-rfi", label: "LFI & RFI" },
      { path: "/nikto", label: "Nikto" },
      { path: "/gobuster", label: "Gobuster" },
      { path: "/beef", label: "BeEF" },
      { path: "/ssrf", label: "SSRF" },
      { path: "/csrf", label: "CSRF" },
      { path: "/command-injection", label: "Command Injection" },
      { path: "/webshells", label: "Web Shells" },
      { path: "/api-pentest", label: "Pentest de APIs" },
      { path: "/deserialization", label: "Deserialization" }
    ],
  },
  {
    title: "Quebra de Senhas",
    lessons: [
      { path: "/hydra", label: "Hydra" },
      { path: "/john", label: "John the Ripper" },
      { path: "/hashcat", label: "Hashcat" },
      { path: "/crunch", label: "Crunch & CeWL" },
      { path: "/seclists", label: "SecLists & Wordlists" }
    ],
  },
  {
    title: "Exploração",
    lessons: [
      { path: "/metasploit", label: "Metasploit" },
      { path: "/msfvenom", label: "MSFVenom" },
      { path: "/searchsploit", label: "Searchsploit" },
      { path: "/buffer-overflow", label: "Buffer Overflow" },
      { path: "/pos-exploracao", label: "Pós-Exploração" },
      { path: "/set", label: "SET (Eng. Social)" },
      { path: "/phishing", label: "Phishing Avançado" },
      { path: "/payload-obfuscation", label: "Evasão de AV" }
    ],
  },
  {
    title: "Escalação de Privilégios",
    lessons: [
      { path: "/privesc-linux", label: "PrivEsc — Linux" },
      { path: "/privesc-windows", label: "PrivEsc — Windows" }
    ],
  },
  {
    title: "Redes & MITM",
    lessons: [
      { path: "/arp-spoofing", label: "ARP Spoofing & MITM" },
      { path: "/ettercap", label: "Ettercap" },
      { path: "/responder", label: "Responder (NTLM)" }
    ],
  },
  {
    title: "Active Directory",
    lessons: [
      { path: "/bloodhound", label: "BloodHound" },
      { path: "/impacket", label: "Impacket" },
      { path: "/kerberoasting", label: "Kerberoasting & PtH" },
      { path: "/crackmapexec", label: "CrackMapExec / NetExec" }
    ],
  },
  {
    title: "Pivoting & Tunelamento",
    lessons: [
      { path: "/ssh-tunneling", label: "SSH Tunneling & Chisel" },
      { path: "/proxychains", label: "Proxychains" },
      { path: "/tor", label: "Tor & Anonimato" }
    ],
  },
  {
    title: "Wireless",
    lessons: [
      { path: "/aircrack", label: "Aircrack-ng" },
      { path: "/wifiphisher", label: "Wifiphisher" },
      { path: "/reaver", label: "Reaver (WPS)" },
      { path: "/bluetooth", label: "Bluetooth Hacking" }
    ],
  },
  {
    title: "Forense Digital",
    lessons: [
      { path: "/forense", label: "Forense — Visão Geral" },
      { path: "/autopsy", label: "Autopsy (Disco)" },
      { path: "/volatility", label: "Volatility (RAM)" },
      { path: "/steganografia", label: "Esteganografia" },
      { path: "/anti-forense", label: "Anti-Forense" }
    ],
  },
  {
    title: "Scripting & Automação",
    lessons: [
      { path: "/bash-pentest", label: "Bash para Pentest" },
      { path: "/python-hacking", label: "Python para Hacking" },
      { path: "/powershell-pentest", label: "PowerShell Ofensivo" }
    ],
  },
  {
    title: "Kali Avançado",
    lessons: [
      { path: "/nethunter", label: "Kali NetHunter (Mobile)" },
      { path: "/docker-kali", label: "Docker & Labs" },
      { path: "/openvas", label: "OpenVAS / GVM" },
      { path: "/cloud-pentest", label: "Cloud Pentest" },
      { path: "/mobile-pentest", label: "Mobile Pentest" },
      { path: "/reverse-engineering", label: "Engenharia Reversa" }
    ],
  },
  {
    title: "Pacotes (Profundo)",
    lessons: [
      { path: "/apt", label: "APT internals" },
      { path: "/dpkg", label: "dpkg low-level" },
      { path: "/ppa", label: "Repos & PPA" },
      { path: "/snap-flatpak", label: "Snap & Flatpak" },
      { path: "/appimage", label: "AppImage" },
      { path: "/codigo-fonte", label: "Compilar do source" }
    ],
  },
  {
    title: "Sistema, Kernel & Hardware",
    lessons: [
      { path: "/boot", label: "Boot & GRUB" },
      { path: "/kernel", label: "Kernel & módulos" },
      { path: "/hardware", label: "Hardware (lshw/lspci)" },
      { path: "/compressao", label: "Compressão" },
      { path: "/disco", label: "Diagnóstico de disco" },
      { path: "/particoes", label: "Particionamento" }
    ],
  },
  {
    title: "Storage & Backup",
    lessons: [
      { path: "/lvm", label: "LVM" },
      { path: "/luks", label: "LUKS (criptografia)" },
      { path: "/fstab", label: "fstab" },
      { path: "/backup", label: "Backup (rsync/borg)" },
      { path: "/timeshift", label: "Timeshift" }
    ],
  },
  {
    title: "Processos & Logs",
    lessons: [
      { path: "/processos", label: "Processos" },
      { path: "/cron", label: "Cron & agendamento" },
      { path: "/journalctl", label: "journalctl" },
      { path: "/iostat", label: "I/O & monitoring" },
      { path: "/man-pages", label: "Man pages & help" },
      { path: "/localizacao", label: "Locale & timezone" }
    ],
  },
  {
    title: "Bash (Shell)",
    lessons: [
      { path: "/shell-bash", label: "Shell Bash" },
      { path: "/variaveis-ambiente", label: "Variáveis & PATH" },
      { path: "/aliases", label: "Aliases & funções" },
      { path: "/expansoes-bash", label: "Expansões" },
      { path: "/redirecionamento", label: "Redirecionamento" },
      { path: "/bash-avancado", label: "One-liners avançado" }
    ],
  },
  {
    title: "Editores & Scripts",
    lessons: [
      { path: "/scripts-bash", label: "Scripts Bash" },
      { path: "/zsh", label: "Zsh & OMZ" },
      { path: "/vim", label: "Vim" },
      { path: "/navegacao", label: "Navegação no shell" },
      { path: "/manipulacao-arquivos", label: "Manipulação de arquivos" }
    ],
  },
  {
    title: "Files, Multimedia & GUI",
    lessons: [
      { path: "/visualizacao", label: "Visualizar arquivos" },
      { path: "/multimedia", label: "Multimedia & exiftool" },
      { path: "/wine", label: "Wine" },
      { path: "/troubleshooting", label: "Troubleshooting" },
      { path: "/ambiente-grafico", label: "Ambiente Gráfico" }
    ],
  },
  {
    title: "Redes (Profundo)",
    lessons: [
      { path: "/netplan", label: "Netplan & NM" },
      { path: "/dns", label: "DNS" },
      { path: "/vpn", label: "VPN (OpenVPN/WG)" },
      { path: "/samba", label: "Samba & SMB" }
    ],
  },
  {
    title: "Containers & Servidores Web",
    lessons: [
      { path: "/docker", label: "Docker" },
      { path: "/docker-compose", label: "Docker Compose" },
      { path: "/kvm", label: "KVM/QEMU/libvirt" },
      { path: "/nginx", label: "Nginx" },
      { path: "/apache", label: "Apache" },
      { path: "/php", label: "PHP" }
    ],
  },
  {
    title: "Bancos & Hardening",
    lessons: [
      { path: "/mysql", label: "MySQL/MariaDB" },
      { path: "/postgresql", label: "PostgreSQL" },
      { path: "/apparmor", label: "AppArmor" },
      { path: "/fail2ban", label: "Fail2Ban" }
    ],
  },
  {
    title: "Defensiva & Dev",
    lessons: [
      { path: "/gpg", label: "GPG" },
      { path: "/seguranca", label: "UFW/iptables/sudoers" },
      { path: "/python", label: "Python" },
      { path: "/nodejs", label: "Node.js" },
      { path: "/git", label: "Git" }
    ],
  },
  {
    title: "Dev Tooling Pentest",
    lessons: [
      { path: "/java", label: "Java (JDK)" },
      { path: "/vscode", label: "VS Code" },
      { path: "/ansible", label: "Ansible" },
      { path: "/pwncat", label: "Pwncat-cs" },
      { path: "/chisel", label: "Chisel (pivot)" }
    ],
  },
  {
    title: "C2 Frameworks",
    lessons: [
      { path: "/sliver", label: "Sliver C2" },
      { path: "/havoc", label: "Havoc" },
      { path: "/mythic", label: "Mythic" }
    ],
  },
  {
    title: "AD Tooling",
    lessons: [
      { path: "/mimikatz", label: "Mimikatz" },
      { path: "/rubeus", label: "Rubeus" },
      { path: "/sharphound", label: "SharpHound" }
    ],
  },
  {
    title: "Phishing, Fuzzing & Detection",
    lessons: [
      { path: "/evilginx", label: "Evilginx2" },
      { path: "/gophish", label: "Gophish" },
      { path: "/wfuzz", label: "Wfuzz & ffuf" },
      { path: "/atomic-red-team", label: "Atomic Red Team" }
    ],
  },
  {
    title: "Referências & Carreira",
    lessons: [
      { path: "/cve", label: "Pesquisa de CVEs" },
      { path: "/bug-bounty", label: "Bug Bounty" },
      { path: "/ctf", label: "CTF — Dicas" },
      { path: "/relatorios", label: "Relatórios de Pentest" },
      { path: "/referencias", label: "Referências" }
    ],
  }
];

export const COURSE: (Lesson & { module: string; index: number })[] = MODULES.flatMap(
  (m) => m.lessons.map((l) => ({ ...l, module: m.title })),
).map((l, index) => ({ ...l, index }));

export const TOTAL_LESSONS = COURSE.length;

export function lessonAt(path: string) {
  const i = COURSE.findIndex((l) => l.path === path);
  if (i === -1) return null;
  return {
    current: COURSE[i],
    prev: i > 0 ? COURSE[i - 1] : null,
    next: i < COURSE.length - 1 ? COURSE[i + 1] : null,
    position: i + 1,
  };
}

const KEY = "kali-curso-progresso";
const listeners = new Set<() => void>();
function readLS(): string[] { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function writeLS(paths: string[]) { localStorage.setItem(KEY, JSON.stringify(paths)); listeners.forEach((fn) => fn()); }
export function toggleDone(path: string) { const cur = readLS(); writeLS(cur.includes(path) ? cur.filter((p) => p !== path) : [...cur, path]); }
export function isDone(path: string) { return readLS().includes(path); }
function subscribe(fn: () => void) { listeners.add(fn); window.addEventListener("storage", fn); return () => { listeners.delete(fn); window.removeEventListener("storage", fn); }; }
let cache: string[] = []; let cacheRaw = "";
function snapshot(): string[] {
  const raw = localStorage.getItem(KEY) || "[]";
  if (raw !== cacheRaw) { cacheRaw = raw; try { cache = JSON.parse(raw); } catch { cache = []; } }
  return cache;
}
export function useProgress() {
  const done = useSyncExternalStore(subscribe, snapshot, () => cache);
  return { done, count: done.length, percent: TOTAL_LESSONS ? Math.round((done.length / TOTAL_LESSONS) * 100) : 0, has: (path: string) => done.includes(path), toggle: toggleDone };
}
