import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import Home from "@/pages/Home";
const ComeceAqui = lazy(() => import("@/pages/ComeceAqui"));
const Glossario = lazy(() => import("@/pages/Glossario"));
const PrimeirosArquivos = lazy(() => import("@/pages/PrimeirosArquivos"));
const PersonalizacaoSetup = lazy(() => import("@/pages/PersonalizacaoSetup"));
const AvisoLegal = lazy(() => import("@/pages/AvisoLegal"));
const Historia = lazy(() => import("@/pages/Historia"));
const Instalacao = lazy(() => import("@/pages/Instalacao"));
const Interface = lazy(() => import("@/pages/Interface"));
const TerminalPage = lazy(() => import("@/pages/Terminal"));
const Filesystem = lazy(() => import("@/pages/Filesystem"));
const Permissoes = lazy(() => import("@/pages/Permissoes"));
const Pacotes = lazy(() => import("@/pages/Pacotes"));
const Usuarios = lazy(() => import("@/pages/Usuarios"));
const Servicos = lazy(() => import("@/pages/Servicos"));
const Redes = lazy(() => import("@/pages/Redes"));
const Nmap = lazy(() => import("@/pages/Nmap"));
const Wireshark = lazy(() => import("@/pages/Wireshark"));
const SSH = lazy(() => import("@/pages/SSH"));
const Burpsuite = lazy(() => import("@/pages/Burpsuite"));
const Sqlmap = lazy(() => import("@/pages/Sqlmap"));
const Nikto = lazy(() => import("@/pages/Nikto"));
const Gobuster = lazy(() => import("@/pages/Gobuster"));
const Hydra = lazy(() => import("@/pages/Hydra"));
const John = lazy(() => import("@/pages/John"));
const Hashcat = lazy(() => import("@/pages/Hashcat"));
const Metasploit = lazy(() => import("@/pages/Metasploit"));
const Msfvenom = lazy(() => import("@/pages/Msfvenom"));
const Aircrack = lazy(() => import("@/pages/Aircrack"));
const Wifiphisher = lazy(() => import("@/pages/Wifiphisher"));
const Proxychains = lazy(() => import("@/pages/Proxychains"));
const Tor = lazy(() => import("@/pages/Tor"));
const Forense = lazy(() => import("@/pages/Forense"));
const CTF = lazy(() => import("@/pages/CTF"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Referencias = lazy(() => import("@/pages/Referencias"));
const OSINT = lazy(() => import("@/pages/OSINT"));
const TheHarvester = lazy(() => import("@/pages/TheHarvester"));
const Shodan = lazy(() => import("@/pages/Shodan"));
const GoogleDorks = lazy(() => import("@/pages/GoogleDorks"));
const ReconNg = lazy(() => import("@/pages/ReconNg"));
const Maltego = lazy(() => import("@/pages/Maltego"));
const Dnsenum = lazy(() => import("@/pages/Dnsenum"));
const Masscan = lazy(() => import("@/pages/Masscan"));
const Netcat = lazy(() => import("@/pages/Netcat"));
const Enum4linux = lazy(() => import("@/pages/Enum4linux"));
const Whatweb = lazy(() => import("@/pages/Whatweb"));
const OwaspTop10 = lazy(() => import("@/pages/OwaspTop10"));
const XSSManual = lazy(() => import("@/pages/XSSManual"));
const LfiRfi = lazy(() => import("@/pages/LfiRfi"));
const BeEF = lazy(() => import("@/pages/BeEF"));
const ZapProxy = lazy(() => import("@/pages/ZapProxy"));
const Crunch = lazy(() => import("@/pages/Crunch"));
const CVEResearch = lazy(() => import("@/pages/CVEResearch"));
const PrivescLinux = lazy(() => import("@/pages/PrivescLinux"));
const PrivescWindows = lazy(() => import("@/pages/PrivescWindows"));
const Searchsploit = lazy(() => import("@/pages/Searchsploit"));
const PostExploracao = lazy(() => import("@/pages/PostExploracao"));
const SET = lazy(() => import("@/pages/SET"));
const BufferOverflow = lazy(() => import("@/pages/BufferOverflow"));
const Reaver = lazy(() => import("@/pages/Reaver"));
const ARPSpoofing = lazy(() => import("@/pages/ARPSpoofing"));
const Ettercap = lazy(() => import("@/pages/Ettercap"));
const Responder = lazy(() => import("@/pages/Responder"));
const BloodHound = lazy(() => import("@/pages/BloodHound"));
const Impacket = lazy(() => import("@/pages/Impacket"));
const Kerberoasting = lazy(() => import("@/pages/Kerberoasting"));
const SSHTunneling = lazy(() => import("@/pages/SSHTunneling"));
const Volatility = lazy(() => import("@/pages/Volatility"));
const Steganografia = lazy(() => import("@/pages/Steganografia"));
const Autopsy = lazy(() => import("@/pages/Autopsy"));
const BashPentest = lazy(() => import("@/pages/BashPentest"));
const PythonHacking = lazy(() => import("@/pages/PythonHacking"));
const NetHunter = lazy(() => import("@/pages/NetHunter"));
const DockerKali = lazy(() => import("@/pages/DockerKali"));
const Metodologia = lazy(() => import("@/pages/Metodologia"));
const BugBounty = lazy(() => import("@/pages/BugBounty"));
const OpenVAS = lazy(() => import("@/pages/OpenVAS"));
const SSRF = lazy(() => import("@/pages/SSRF"));
const SSTI = lazy(() => import("@/pages/SSTI"));
const XXE = lazy(() => import("@/pages/XXE"));
const JWT = lazy(() => import("@/pages/JWT"));
const CSRF = lazy(() => import("@/pages/CSRF"));
const CommandInjection = lazy(() => import("@/pages/CommandInjection"));
const WebShells = lazy(() => import("@/pages/WebShells"));
const APIPentest = lazy(() => import("@/pages/APIPentest"));
const CloudPentest = lazy(() => import("@/pages/CloudPentest"));
const MobilePentest = lazy(() => import("@/pages/MobilePentest"));
const CrackMapExec = lazy(() => import("@/pages/CrackMapExec"));
const Seclists = lazy(() => import("@/pages/Seclists"));
const PayloadObfuscation = lazy(() => import("@/pages/PayloadObfuscation"));
const AntiForense = lazy(() => import("@/pages/AntiForense"));
const Phishing = lazy(() => import("@/pages/Phishing"));
const Deserialization = lazy(() => import("@/pages/Deserialization"));
const PowershellPentest = lazy(() => import("@/pages/PowershellPentest"));
const ReverseEngineering = lazy(() => import("@/pages/ReverseEngineering"));
const WirelessBluetooth = lazy(() => import("@/pages/WirelessBluetooth"));

// === Expansão Linux + Pentest avançado (73 novas) ===
const Apt = lazy(() => import("@/pages/Apt"));
const SnapFlatpak = lazy(() => import("@/pages/SnapFlatpak"));
const Dpkg = lazy(() => import("@/pages/Dpkg"));
const PPA = lazy(() => import("@/pages/PPA"));
const AppImage = lazy(() => import("@/pages/AppImage"));
const CodigoFonte = lazy(() => import("@/pages/CodigoFonte"));
const Boot = lazy(() => import("@/pages/Boot"));
const Kernel = lazy(() => import("@/pages/Kernel"));
const Hardware = lazy(() => import("@/pages/Hardware"));
const Compressao = lazy(() => import("@/pages/Compressao"));
const Disco = lazy(() => import("@/pages/Disco"));
const Particoes = lazy(() => import("@/pages/Particoes"));
const LVM = lazy(() => import("@/pages/LVM"));
const LUKS = lazy(() => import("@/pages/LUKS"));
const Fstab = lazy(() => import("@/pages/Fstab"));
const Backup = lazy(() => import("@/pages/Backup"));
const Timeshift = lazy(() => import("@/pages/Timeshift"));
const Processos = lazy(() => import("@/pages/Processos"));
const Cron = lazy(() => import("@/pages/Cron"));
const JournalCtl = lazy(() => import("@/pages/JournalCtl"));
const IOStat = lazy(() => import("@/pages/IOStat"));
const ManPages = lazy(() => import("@/pages/ManPages"));
const Localizacao = lazy(() => import("@/pages/Localizacao"));
const ShellBash = lazy(() => import("@/pages/ShellBash"));
const VariaveisAmbiente = lazy(() => import("@/pages/VariaveisAmbiente"));
const Aliases = lazy(() => import("@/pages/Aliases"));
const ExpansoesBash = lazy(() => import("@/pages/ExpansoesBash"));
const Redirecionamento = lazy(() => import("@/pages/Redirecionamento"));
const Avancado = lazy(() => import("@/pages/Avancado"));
const ScriptsBash = lazy(() => import("@/pages/ScriptsBash"));
const Zsh = lazy(() => import("@/pages/Zsh"));
const Vim = lazy(() => import("@/pages/Vim"));
const Navegacao = lazy(() => import("@/pages/Navegacao"));
const ManipulacaoArquivos = lazy(() => import("@/pages/ManipulacaoArquivos"));
const Visualizacao = lazy(() => import("@/pages/Visualizacao"));
const Multimedia = lazy(() => import("@/pages/Multimedia"));
const Wine = lazy(() => import("@/pages/Wine"));
const Troubleshooting = lazy(() => import("@/pages/Troubleshooting"));
const AmbienteGrafico = lazy(() => import("@/pages/AmbienteGrafico"));
const Netplan = lazy(() => import("@/pages/Netplan"));
const DNS = lazy(() => import("@/pages/DNS"));
const VPN = lazy(() => import("@/pages/VPN"));
const Samba = lazy(() => import("@/pages/Samba"));
const Docker = lazy(() => import("@/pages/Docker"));
const DockerCompose = lazy(() => import("@/pages/DockerCompose"));
const KVM = lazy(() => import("@/pages/KVM"));
const Nginx = lazy(() => import("@/pages/Nginx"));
const Apache = lazy(() => import("@/pages/Apache"));
const PHP = lazy(() => import("@/pages/PHP"));
const MySQL = lazy(() => import("@/pages/MySQL"));
const PostgreSQL = lazy(() => import("@/pages/PostgreSQL"));
const AppArmor = lazy(() => import("@/pages/AppArmor"));
const Fail2Ban = lazy(() => import("@/pages/Fail2Ban"));
const GPG = lazy(() => import("@/pages/GPG"));
const Seguranca = lazy(() => import("@/pages/Seguranca"));
const PythonCore = lazy(() => import("@/pages/Python"));
const NodeJS = lazy(() => import("@/pages/NodeJS"));
const Git = lazy(() => import("@/pages/Git"));
const Java = lazy(() => import("@/pages/Java"));
const VSCode = lazy(() => import("@/pages/VSCode"));
const Ansible = lazy(() => import("@/pages/Ansible"));
const Pwncat = lazy(() => import("@/pages/Pwncat"));
const Chisel = lazy(() => import("@/pages/Chisel"));
const Sliver = lazy(() => import("@/pages/Sliver"));
const Havoc = lazy(() => import("@/pages/Havoc"));
const Mythic = lazy(() => import("@/pages/Mythic"));
const Mimikatz = lazy(() => import("@/pages/Mimikatz"));
const Rubeus = lazy(() => import("@/pages/Rubeus"));
const SharpHound = lazy(() => import("@/pages/SharpHound"));
const Evilginx = lazy(() => import("@/pages/Evilginx"));
const Gophish = lazy(() => import("@/pages/Gophish"));
const Wfuzz = lazy(() => import("@/pages/Wfuzz"));
const AtomicRedTeam = lazy(() => import("@/pages/AtomicRedTeam"));

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useHashLocation();
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function CarregandoTopico() {
  return (
    <div className="flex items-center justify-center py-24 px-6">
      <div className="font-mono text-sm text-[hsl(var(--kali-dim))]">
        <span className="text-[hsl(var(--kali-green))]">●</span> carregando tópico
        <span className="kali-cursor">_</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<CarregandoTopico />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/comece-aqui" component={ComeceAqui} />
        <Route path="/glossario" component={Glossario} />
        <Route path="/primeiros-arquivos" component={PrimeirosArquivos} />
        <Route path="/personalizacao-setup" component={PersonalizacaoSetup} />
        <Route path="/aviso-legal" component={AvisoLegal} />
        <Route path="/historia" component={Historia} />
        <Route path="/instalacao" component={Instalacao} />
        <Route path="/interface" component={Interface} />
        <Route path="/terminal" component={TerminalPage} />
        <Route path="/filesystem" component={Filesystem} />
        <Route path="/permissoes" component={Permissoes} />
        <Route path="/pacotes" component={Pacotes} />
        <Route path="/usuarios" component={Usuarios} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/redes" component={Redes} />
        <Route path="/nmap" component={Nmap} />
        <Route path="/wireshark" component={Wireshark} />
        <Route path="/ssh" component={SSH} />
        <Route path="/burpsuite" component={Burpsuite} />
        <Route path="/sqlmap" component={Sqlmap} />
        <Route path="/nikto" component={Nikto} />
        <Route path="/gobuster" component={Gobuster} />
        <Route path="/hydra" component={Hydra} />
        <Route path="/john" component={John} />
        <Route path="/hashcat" component={Hashcat} />
        <Route path="/metasploit" component={Metasploit} />
        <Route path="/msfvenom" component={Msfvenom} />
        <Route path="/aircrack" component={Aircrack} />
        <Route path="/wifiphisher" component={Wifiphisher} />
        <Route path="/proxychains" component={Proxychains} />
        <Route path="/tor" component={Tor} />
        <Route path="/forense" component={Forense} />
        <Route path="/ctf" component={CTF} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/referencias" component={Referencias} />

        <Route path="/osint" component={OSINT} />
        <Route path="/theharvester" component={TheHarvester} />
        <Route path="/shodan" component={Shodan} />
        <Route path="/google-dorks" component={GoogleDorks} />
        <Route path="/recon-ng" component={ReconNg} />
        <Route path="/maltego" component={Maltego} />
        <Route path="/dnsenum" component={Dnsenum} />

        <Route path="/masscan" component={Masscan} />
        <Route path="/netcat" component={Netcat} />
        <Route path="/enum4linux" component={Enum4linux} />
        <Route path="/whatweb" component={Whatweb} />

        <Route path="/owasp-top10" component={OwaspTop10} />
        <Route path="/xss" component={XSSManual} />
        <Route path="/lfi-rfi" component={LfiRfi} />
        <Route path="/beef" component={BeEF} />
        <Route path="/zap" component={ZapProxy} />

        <Route path="/crunch" component={Crunch} />
        <Route path="/cve" component={CVEResearch} />

        <Route path="/privesc-linux" component={PrivescLinux} />
        <Route path="/privesc-windows" component={PrivescWindows} />

        <Route path="/searchsploit" component={Searchsploit} />
        <Route path="/pos-exploracao" component={PostExploracao} />
        <Route path="/set" component={SET} />
        <Route path="/buffer-overflow" component={BufferOverflow} />

        <Route path="/reaver" component={Reaver} />

        <Route path="/arp-spoofing" component={ARPSpoofing} />
        <Route path="/ettercap" component={Ettercap} />
        <Route path="/responder" component={Responder} />

        <Route path="/bloodhound" component={BloodHound} />
        <Route path="/impacket" component={Impacket} />
        <Route path="/kerberoasting" component={Kerberoasting} />

        <Route path="/ssh-tunneling" component={SSHTunneling} />

        <Route path="/volatility" component={Volatility} />
        <Route path="/steganografia" component={Steganografia} />
        <Route path="/autopsy" component={Autopsy} />

        <Route path="/bash-pentest" component={BashPentest} />
        <Route path="/python-hacking" component={PythonHacking} />

        <Route path="/nethunter" component={NetHunter} />
        <Route path="/docker-kali" component={DockerKali} />

        <Route path="/metodologia" component={Metodologia} />
        <Route path="/bug-bounty" component={BugBounty} />

        <Route path="/openvas" component={OpenVAS} />
        <Route path="/ssrf" component={SSRF} />
        <Route path="/ssti" component={SSTI} />
        <Route path="/xxe" component={XXE} />
        <Route path="/jwt" component={JWT} />
        <Route path="/csrf" component={CSRF} />
        <Route path="/command-injection" component={CommandInjection} />
        <Route path="/webshells" component={WebShells} />
        <Route path="/api-pentest" component={APIPentest} />
        <Route path="/cloud-pentest" component={CloudPentest} />
        <Route path="/mobile-pentest" component={MobilePentest} />
        <Route path="/crackmapexec" component={CrackMapExec} />
        <Route path="/seclists" component={Seclists} />
        <Route path="/payload-obfuscation" component={PayloadObfuscation} />
        <Route path="/anti-forense" component={AntiForense} />
        <Route path="/phishing" component={Phishing} />
        <Route path="/deserialization" component={Deserialization} />
        <Route path="/powershell-pentest" component={PowershellPentest} />
        <Route path="/reverse-engineering" component={ReverseEngineering} />
        <Route path="/bluetooth" component={WirelessBluetooth} />

        {/* === Expansão Linux + Pentest === */}
        <Route path="/apt" component={Apt} />
        <Route path="/snap-flatpak" component={SnapFlatpak} />
        <Route path="/dpkg" component={Dpkg} />
        <Route path="/ppa" component={PPA} />
        <Route path="/appimage" component={AppImage} />
        <Route path="/codigo-fonte" component={CodigoFonte} />
        <Route path="/boot" component={Boot} />
        <Route path="/kernel" component={Kernel} />
        <Route path="/hardware" component={Hardware} />
        <Route path="/compressao" component={Compressao} />
        <Route path="/disco" component={Disco} />
        <Route path="/particoes" component={Particoes} />
        <Route path="/lvm" component={LVM} />
        <Route path="/luks" component={LUKS} />
        <Route path="/fstab" component={Fstab} />
        <Route path="/backup" component={Backup} />
        <Route path="/timeshift" component={Timeshift} />
        <Route path="/processos" component={Processos} />
        <Route path="/cron" component={Cron} />
        <Route path="/journalctl" component={JournalCtl} />
        <Route path="/iostat" component={IOStat} />
        <Route path="/man-pages" component={ManPages} />
        <Route path="/localizacao" component={Localizacao} />
        <Route path="/shell-bash" component={ShellBash} />
        <Route path="/variaveis-ambiente" component={VariaveisAmbiente} />
        <Route path="/aliases" component={Aliases} />
        <Route path="/expansoes-bash" component={ExpansoesBash} />
        <Route path="/redirecionamento" component={Redirecionamento} />
        <Route path="/bash-avancado" component={Avancado} />
        <Route path="/scripts-bash" component={ScriptsBash} />
        <Route path="/zsh" component={Zsh} />
        <Route path="/vim" component={Vim} />
        <Route path="/navegacao" component={Navegacao} />
        <Route path="/manipulacao-arquivos" component={ManipulacaoArquivos} />
        <Route path="/visualizacao" component={Visualizacao} />
        <Route path="/multimedia" component={Multimedia} />
        <Route path="/wine" component={Wine} />
        <Route path="/troubleshooting" component={Troubleshooting} />
        <Route path="/ambiente-grafico" component={AmbienteGrafico} />
        <Route path="/netplan" component={Netplan} />
        <Route path="/dns" component={DNS} />
        <Route path="/vpn" component={VPN} />
        <Route path="/samba" component={Samba} />
        <Route path="/docker" component={Docker} />
        <Route path="/docker-compose" component={DockerCompose} />
        <Route path="/kvm" component={KVM} />
        <Route path="/nginx" component={Nginx} />
        <Route path="/apache" component={Apache} />
        <Route path="/php" component={PHP} />
        <Route path="/mysql" component={MySQL} />
        <Route path="/postgresql" component={PostgreSQL} />
        <Route path="/apparmor" component={AppArmor} />
        <Route path="/fail2ban" component={Fail2Ban} />
        <Route path="/gpg" component={GPG} />
        <Route path="/seguranca" component={Seguranca} />
        <Route path="/python" component={PythonCore} />
        <Route path="/nodejs" component={NodeJS} />
        <Route path="/git" component={Git} />
        <Route path="/java" component={Java} />
        <Route path="/vscode" component={VSCode} />
        <Route path="/ansible" component={Ansible} />
        <Route path="/pwncat" component={Pwncat} />
        <Route path="/chisel" component={Chisel} />
        <Route path="/sliver" component={Sliver} />
        <Route path="/havoc" component={Havoc} />
        <Route path="/mythic" component={Mythic} />
        <Route path="/mimikatz" component={Mimikatz} />
        <Route path="/rubeus" component={Rubeus} />
        <Route path="/sharphound" component={SharpHound} />
        <Route path="/evilginx" component={Evilginx} />
        <Route path="/gophish" component={Gophish} />
        <Route path="/wfuzz" component={Wfuzz} />
        <Route path="/atomic-red-team" component={AtomicRedTeam} />

        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
