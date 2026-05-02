import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import Home from "@/pages/Home";
import ComeceAqui from "@/pages/ComeceAqui";
import PrimeirosArquivos from "@/pages/PrimeirosArquivos";
import PersonalizacaoSetup from "@/pages/PersonalizacaoSetup";
import AvisoLegal from "@/pages/AvisoLegal";
import Historia from "@/pages/Historia";
import Instalacao from "@/pages/Instalacao";
import Interface from "@/pages/Interface";
import TerminalPage from "@/pages/Terminal";
import Filesystem from "@/pages/Filesystem";
import Permissoes from "@/pages/Permissoes";
import Pacotes from "@/pages/Pacotes";
import Usuarios from "@/pages/Usuarios";
import Servicos from "@/pages/Servicos";
import Redes from "@/pages/Redes";
import Nmap from "@/pages/Nmap";
import Wireshark from "@/pages/Wireshark";
import SSH from "@/pages/SSH";
import Burpsuite from "@/pages/Burpsuite";
import Sqlmap from "@/pages/Sqlmap";
import Nikto from "@/pages/Nikto";
import Gobuster from "@/pages/Gobuster";
import Hydra from "@/pages/Hydra";
import John from "@/pages/John";
import Hashcat from "@/pages/Hashcat";
import Metasploit from "@/pages/Metasploit";
import Msfvenom from "@/pages/Msfvenom";
import Aircrack from "@/pages/Aircrack";
import Wifiphisher from "@/pages/Wifiphisher";
import Proxychains from "@/pages/Proxychains";
import Tor from "@/pages/Tor";
import Forense from "@/pages/Forense";
import CTF from "@/pages/CTF";
import Relatorios from "@/pages/Relatorios";
import Referencias from "@/pages/Referencias";
import OSINT from "@/pages/OSINT";
import TheHarvester from "@/pages/TheHarvester";
import Shodan from "@/pages/Shodan";
import GoogleDorks from "@/pages/GoogleDorks";
import ReconNg from "@/pages/ReconNg";
import Maltego from "@/pages/Maltego";
import Dnsenum from "@/pages/Dnsenum";
import Masscan from "@/pages/Masscan";
import Netcat from "@/pages/Netcat";
import Enum4linux from "@/pages/Enum4linux";
import Whatweb from "@/pages/Whatweb";
import OwaspTop10 from "@/pages/OwaspTop10";
import XSSManual from "@/pages/XSSManual";
import LfiRfi from "@/pages/LfiRfi";
import BeEF from "@/pages/BeEF";
import ZapProxy from "@/pages/ZapProxy";
import Crunch from "@/pages/Crunch";
import CVEResearch from "@/pages/CVEResearch";
import PrivescLinux from "@/pages/PrivescLinux";
import PrivescWindows from "@/pages/PrivescWindows";
import Searchsploit from "@/pages/Searchsploit";
import PostExploracao from "@/pages/PostExploracao";
import SET from "@/pages/SET";
import BufferOverflow from "@/pages/BufferOverflow";
import Reaver from "@/pages/Reaver";
import ARPSpoofing from "@/pages/ARPSpoofing";
import Ettercap from "@/pages/Ettercap";
import Responder from "@/pages/Responder";
import BloodHound from "@/pages/BloodHound";
import Impacket from "@/pages/Impacket";
import Kerberoasting from "@/pages/Kerberoasting";
import SSHTunneling from "@/pages/SSHTunneling";
import Volatility from "@/pages/Volatility";
import Steganografia from "@/pages/Steganografia";
import Autopsy from "@/pages/Autopsy";
import BashPentest from "@/pages/BashPentest";
import PythonHacking from "@/pages/PythonHacking";
import NetHunter from "@/pages/NetHunter";
import DockerKali from "@/pages/DockerKali";
import Metodologia from "@/pages/Metodologia";
import BugBounty from "@/pages/BugBounty";
import OpenVAS from "@/pages/OpenVAS";
import SSRF from "@/pages/SSRF";
import CSRF from "@/pages/CSRF";
import CommandInjection from "@/pages/CommandInjection";
import WebShells from "@/pages/WebShells";
import APIPentest from "@/pages/APIPentest";
import CloudPentest from "@/pages/CloudPentest";
import MobilePentest from "@/pages/MobilePentest";
import CrackMapExec from "@/pages/CrackMapExec";
import Seclists from "@/pages/Seclists";
import PayloadObfuscation from "@/pages/PayloadObfuscation";
import AntiForense from "@/pages/AntiForense";
import Phishing from "@/pages/Phishing";
import Deserialization from "@/pages/Deserialization";
import PowershellPentest from "@/pages/PowershellPentest";
import ReverseEngineering from "@/pages/ReverseEngineering";
import WirelessBluetooth from "@/pages/WirelessBluetooth";

// === Expansão Linux + Pentest avançado (73 novas) ===
import Apt from "@/pages/Apt";
import SnapFlatpak from "@/pages/SnapFlatpak";
import Dpkg from "@/pages/Dpkg";
import PPA from "@/pages/PPA";
import AppImage from "@/pages/AppImage";
import CodigoFonte from "@/pages/CodigoFonte";
import Boot from "@/pages/Boot";
import Kernel from "@/pages/Kernel";
import Hardware from "@/pages/Hardware";
import Compressao from "@/pages/Compressao";
import Disco from "@/pages/Disco";
import Particoes from "@/pages/Particoes";
import LVM from "@/pages/LVM";
import LUKS from "@/pages/LUKS";
import Fstab from "@/pages/Fstab";
import Backup from "@/pages/Backup";
import Timeshift from "@/pages/Timeshift";
import Processos from "@/pages/Processos";
import Cron from "@/pages/Cron";
import JournalCtl from "@/pages/JournalCtl";
import IOStat from "@/pages/IOStat";
import ManPages from "@/pages/ManPages";
import Localizacao from "@/pages/Localizacao";
import ShellBash from "@/pages/ShellBash";
import VariaveisAmbiente from "@/pages/VariaveisAmbiente";
import Aliases from "@/pages/Aliases";
import ExpansoesBash from "@/pages/ExpansoesBash";
import Redirecionamento from "@/pages/Redirecionamento";
import Avancado from "@/pages/Avancado";
import ScriptsBash from "@/pages/ScriptsBash";
import Zsh from "@/pages/Zsh";
import Vim from "@/pages/Vim";
import Navegacao from "@/pages/Navegacao";
import ManipulacaoArquivos from "@/pages/ManipulacaoArquivos";
import Visualizacao from "@/pages/Visualizacao";
import Multimedia from "@/pages/Multimedia";
import Wine from "@/pages/Wine";
import Troubleshooting from "@/pages/Troubleshooting";
import AmbienteGrafico from "@/pages/AmbienteGrafico";
import Netplan from "@/pages/Netplan";
import DNS from "@/pages/DNS";
import VPN from "@/pages/VPN";
import Samba from "@/pages/Samba";
import Docker from "@/pages/Docker";
import DockerCompose from "@/pages/DockerCompose";
import KVM from "@/pages/KVM";
import Nginx from "@/pages/Nginx";
import Apache from "@/pages/Apache";
import PHP from "@/pages/PHP";
import MySQL from "@/pages/MySQL";
import PostgreSQL from "@/pages/PostgreSQL";
import AppArmor from "@/pages/AppArmor";
import Fail2Ban from "@/pages/Fail2Ban";
import GPG from "@/pages/GPG";
import Seguranca from "@/pages/Seguranca";
import PythonCore from "@/pages/Python";
import NodeJS from "@/pages/NodeJS";
import Git from "@/pages/Git";
import Java from "@/pages/Java";
import VSCode from "@/pages/VSCode";
import Ansible from "@/pages/Ansible";
import Pwncat from "@/pages/Pwncat";
import Chisel from "@/pages/Chisel";
import Sliver from "@/pages/Sliver";
import Havoc from "@/pages/Havoc";
import Mythic from "@/pages/Mythic";
import Mimikatz from "@/pages/Mimikatz";
import Rubeus from "@/pages/Rubeus";
import SharpHound from "@/pages/SharpHound";
import Evilginx from "@/pages/Evilginx";
import Gophish from "@/pages/Gophish";
import Wfuzz from "@/pages/Wfuzz";
import AtomicRedTeam from "@/pages/AtomicRedTeam";

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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/comece-aqui" component={ComeceAqui} />
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
