import { useState, useEffect } from "react";
  import { Switch, Route, Router as WouterRouter } from "wouter";
  import { useHashLocation } from "wouter/use-hash-location";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

  import { Sidebar } from "@/components/layout/Sidebar";
  import { Header } from "@/components/layout/Header";

  // Páginas existentes
  import Home from "@/pages/Home";
  import Historia from "@/pages/Historia";
  import Instalacao from "@/pages/Instalacao";
  import Interface from "@/pages/Interface";
  import Terminal from "@/pages/Terminal";
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

  // NOVAS PÁGINAS — OSINT & Reconhecimento
  import OSINT from "@/pages/OSINT";
  import TheHarvester from "@/pages/TheHarvester";
  import Shodan from "@/pages/Shodan";
  import GoogleDorks from "@/pages/GoogleDorks";
  import ReconNg from "@/pages/ReconNg";
  import Maltego from "@/pages/Maltego";
  import Dnsenum from "@/pages/Dnsenum";

  // NOVAS PÁGINAS — Varredura Avançada
  import Masscan from "@/pages/Masscan";
  import Netcat from "@/pages/Netcat";
  import Enum4linux from "@/pages/Enum4linux";
  import Whatweb from "@/pages/Whatweb";

  // NOVAS PÁGINAS — Pentest Web Avançado
  import OwaspTop10 from "@/pages/OwaspTop10";
  import XSSManual from "@/pages/XSSManual";
  import LfiRfi from "@/pages/LfiRfi";
  import BeEF from "@/pages/BeEF";
  import ZapProxy from "@/pages/ZapProxy";

  // NOVAS PÁGINAS — Senhas e Wordlists
  import Crunch from "@/pages/Crunch";
  import CVEResearch from "@/pages/CVEResearch";

  // NOVAS PÁGINAS — Escalação de Privilégios
  import PrivescLinux from "@/pages/PrivescLinux";
  import PrivescWindows from "@/pages/PrivescWindows";

  // NOVAS PÁGINAS — Exploração Avançada
  import Searchsploit from "@/pages/Searchsploit";
  import PostExploracao from "@/pages/PostExploracao";
  import SET from "@/pages/SET";
  import BufferOverflow from "@/pages/BufferOverflow";

  // NOVAS PÁGINAS — Wireless Avançado
  import Reaver from "@/pages/Reaver";

  // NOVAS PÁGINAS — Redes & MITM
  import ARPSpoofing from "@/pages/ARPSpoofing";
  import Ettercap from "@/pages/Ettercap";
  import Responder from "@/pages/Responder";

  // NOVAS PÁGINAS — Active Directory
  import BloodHound from "@/pages/BloodHound";
  import Impacket from "@/pages/Impacket";
  import Kerberoasting from "@/pages/Kerberoasting";

  // NOVAS PÁGINAS — Pivoting
  import SSHTunneling from "@/pages/SSHTunneling";

  // NOVAS PÁGINAS — Forense Avançado
  import Volatility from "@/pages/Volatility";
  import Steganografia from "@/pages/Steganografia";
  import Autopsy from "@/pages/Autopsy";

  // NOVAS PÁGINAS — Scripting
  import BashPentest from "@/pages/BashPentest";
  import PythonHacking from "@/pages/PythonHacking";

  // NOVAS PÁGINAS — Kali Avançado
  import NetHunter from "@/pages/NetHunter";
  import DockerKali from "@/pages/DockerKali";

  // NOVAS PÁGINAS — Metodologia
  import Metodologia from "@/pages/Metodologia";
  import BugBounty from "@/pages/BugBounty";

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
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    );
  }

  function Router() {
    return (
      <Layout>
        <Switch>
          {/* Existentes */}
          <Route path="/" component={Home} />
          <Route path="/historia" component={Historia} />
          <Route path="/instalacao" component={Instalacao} />
          <Route path="/interface" component={Interface} />
          <Route path="/terminal" component={Terminal} />
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

          {/* OSINT */}
          <Route path="/osint" component={OSINT} />
          <Route path="/theharvester" component={TheHarvester} />
          <Route path="/shodan" component={Shodan} />
          <Route path="/google-dorks" component={GoogleDorks} />
          <Route path="/recon-ng" component={ReconNg} />
          <Route path="/maltego" component={Maltego} />
          <Route path="/dnsenum" component={Dnsenum} />

          {/* Varredura */}
          <Route path="/masscan" component={Masscan} />
          <Route path="/netcat" component={Netcat} />
          <Route path="/enum4linux" component={Enum4linux} />
          <Route path="/whatweb" component={Whatweb} />

          {/* Web Avançado */}
          <Route path="/owasp-top10" component={OwaspTop10} />
          <Route path="/xss" component={XSSManual} />
          <Route path="/lfi-rfi" component={LfiRfi} />
          <Route path="/beef" component={BeEF} />
          <Route path="/zap" component={ZapProxy} />

          {/* Senhas */}
          <Route path="/crunch" component={Crunch} />
          <Route path="/cve" component={CVEResearch} />

          {/* Privesc */}
          <Route path="/privesc-linux" component={PrivescLinux} />
          <Route path="/privesc-windows" component={PrivescWindows} />

          {/* Exploração */}
          <Route path="/searchsploit" component={Searchsploit} />
          <Route path="/pos-exploracao" component={PostExploracao} />
          <Route path="/set" component={SET} />
          <Route path="/buffer-overflow" component={BufferOverflow} />

          {/* Wireless */}
          <Route path="/reaver" component={Reaver} />

          {/* MITM */}
          <Route path="/arp-spoofing" component={ARPSpoofing} />
          <Route path="/ettercap" component={Ettercap} />
          <Route path="/responder" component={Responder} />

          {/* Active Directory */}
          <Route path="/bloodhound" component={BloodHound} />
          <Route path="/impacket" component={Impacket} />
          <Route path="/kerberoasting" component={Kerberoasting} />

          {/* Pivoting */}
          <Route path="/ssh-tunneling" component={SSHTunneling} />

          {/* Forense */}
          <Route path="/volatility" component={Volatility} />
          <Route path="/steganografia" component={Steganografia} />
          <Route path="/autopsy" component={Autopsy} />

          {/* Scripting */}
          <Route path="/bash-pentest" component={BashPentest} />
          <Route path="/python-hacking" component={PythonHacking} />

          {/* Kali Avançado */}
          <Route path="/nethunter" component={NetHunter} />
          <Route path="/docker-kali" component={DockerKali} />

          {/* Metodologia */}
          <Route path="/metodologia" component={Metodologia} />
          <Route path="/bug-bounty" component={BugBounty} />

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
  