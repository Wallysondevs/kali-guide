import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

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
