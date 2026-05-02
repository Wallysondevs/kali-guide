import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Nmap() {
  return (
    <PageContainer
      title="Nmap — Scanner #1 do mundo"
      subtitle="Descoberta de hosts, varredura de portas, fingerprinting de serviços, NSE scripts e evasão."
      difficulty="iniciante"
      timeToRead="25 min"
      prompt="recon/nmap"
    >
      <h2>Conferindo a versão</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "nmap --version",
            out: `Nmap version 7.95 ( https://nmap.org )
Platform: x86_64-pc-linux-gnu
Compiled with: liblua-5.4.6 openssl-3.3.2 nmap-libssh2-1.11.1 libz-1.3.1 libpcre2-10.44 nmap-libpcap-1.10.4 nmap-libdnet-1.12 ipv6
Compiled without:
Available nsock engines: epoll poll select`,
            outType: "info",
          },
        ]}
      />

      <h2>Descoberta de hosts (host discovery)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ping scan — só descobre QUEM está vivo, não escaneia portas",
            cmd: "sudo nmap -sn 192.168.1.0/24",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for 192.168.1.1
Host is up (0.0019s latency).
MAC Address: 24:5E:BE:1A:2C:01 (Zyxel Communications)
Nmap scan report for 192.168.1.42
Host is up.
Nmap scan report for 192.168.1.50
Host is up (0.0033s latency).
MAC Address: B0:35:9F:D3:7E:18 (Apple)
Nmap scan report for 192.168.1.108
Host is up (0.0011s latency).
MAC Address: 08:00:27:DE:AD:BE (PCS Computer Systems GmbH)
Nmap done: 256 IP addresses (4 hosts up) scanned in 4.21 seconds`,
            outType: "success",
          },
          {
            comment: "lista de alvos sem PINGAR (útil quando ICMP é bloqueado)",
            cmd: "nmap -sL 192.168.1.0/30",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for 192.168.1.0
Nmap scan report for 192.168.1.1
Nmap scan report for 192.168.1.2
Nmap scan report for 192.168.1.3
Nmap done: 4 IP addresses (0 hosts up) scanned in 0.04 seconds`,
            outType: "default",
          },
          {
            comment: "FORÇAR scan mesmo sem ping (alvos que filtram ICMP)",
            cmd: "sudo nmap -Pn -p 22,80,443 scanme.nmap.org",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.18s latency).

PORT    STATE  SERVICE
22/tcp  open   ssh
80/tcp  open   http
443/tcp closed https`,
            outType: "info",
          },
        ]}
      />

      <h2>Tipos de scan de porta</h2>
      <CommandTable
        title="Os principais -s* do nmap"
        variations={[
          { cmd: "-sS", desc: "SYN scan (stealth, half-open). PADRÃO quando você é root.", output: "Não fecha conexão; menos visível em logs do alvo." },
          { cmd: "-sT", desc: "TCP connect scan. PADRÃO quando NÃO é root. Aparece nos logs.", output: "Faz handshake completo." },
          { cmd: "-sU", desc: "UDP scan (lento, importa para DNS, SNMP, NTP).", output: "Combine com -sS para varrer TCP+UDP." },
          { cmd: "-sA", desc: "ACK scan — descobre regras de firewall (filtered vs unfiltered).", output: "Não diz se a porta está aberta, só se passa pelo firewall." },
          { cmd: "-sV", desc: "Version detection — fingerprinting de serviço.", output: "Diz nginx 1.27, OpenSSH 9.6p1, etc." },
          { cmd: "-sC", desc: "Roda os scripts NSE 'default' (auth, brute, discovery seguros).", output: "Equivale a --script=default." },
          { cmd: "-O", desc: "OS detection — palpita o sistema operacional.", output: "Linux 5.X kernel | Microsoft Windows Server 2019" },
          { cmd: "-A", desc: "AGRESSIVO: -sV + -O + -sC + traceroute. Bom em laboratório.", output: "Equivale a 'me dá tudo'." },
        ]}
      />

      <h2>Seleção de portas</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1 porta",
            cmd: "nmap -p 22 192.168.1.50",
            out: `PORT   STATE SERVICE
22/tcp open  ssh`,
            outType: "info",
          },
          {
            comment: "lista",
            cmd: "nmap -p 22,80,443,3306,5432,8080 192.168.1.50",
            out: `PORT     STATE  SERVICE
22/tcp   open   ssh
80/tcp   open   http
443/tcp  closed https
3306/tcp closed mysql
5432/tcp open   postgresql
8080/tcp open   http-proxy`,
            outType: "default",
          },
          {
            comment: "range",
            cmd: "nmap -p 1-1000 192.168.1.50",
            out: "(varre as primeiras 1000 portas TCP)",
            outType: "muted",
          },
          {
            comment: "TODAS as 65535 portas",
            cmd: "sudo nmap -p- -T4 192.168.1.50",
            out: "(LENTO mas completo. -T4 acelera)",
            outType: "warning",
          },
          {
            comment: "TCP + UDP juntos, top 100 portas",
            cmd: "sudo nmap -sS -sU --top-ports 100 192.168.1.50",
            out: `PORT      STATE         SERVICE
22/tcp    open          ssh
80/tcp    open          http
53/udp    open          domain
123/udp   open          ntp
161/udp   open|filtered snmp`,
            outType: "info",
          },
        ]}
      />

      <h2>O scan "padrão pentest"</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "varredura completa com versão e scripts default",
            cmd: "sudo nmap -sS -sV -sC -O -p- -T4 -oA scan_target scanme.nmap.org",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.184s latency).
Other addresses for scanme.nmap.org (not scanned): 2600:3c01::f03c:91ff:fe18:bb2f
Not shown: 65530 closed tcp ports (reset)

PORT      STATE SERVICE     VERSION
22/tcp    open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 ac:00:a0:1a:82:ff:cc:55:99:dc:67:2b:34:97:6b:75 (DSA)
|   2048 20:3d:2d:44:62:2a:b0:5a:9d:b5:b3:05:14:c2:a6:b2 (RSA)
|_  256 96:02:bb:5e:57:54:1c:4e:45:2f:56:4c:4a:24:b2:57 (ECDSA)
80/tcp    open  http        Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Go ahead and ScanMe!
9929/tcp  open  nping-echo  Nping echo
31337/tcp open  tcpwrapped
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19
Network Distance: 12 hops

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   1.05 ms   _gateway (192.168.1.1)
... 
12  185.2 ms  scanme.nmap.org (45.33.32.156)

Nmap done: 1 IP address (1 host up) scanned in 142.74 seconds`,
            outType: "success",
          },
          {
            cmd: "ls scan_target.*",
            out: `scan_target.gnmap   scan_target.nmap   scan_target.xml`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Formatos de saída (-o*)"
        variations={[
          { cmd: "-oN file.nmap", desc: "Texto humano (igual o que aparece na tela).", output: "Mais legível para reports." },
          { cmd: "-oG file.gnmap", desc: "Greppable: 1 host por linha, fácil de pipe.", output: "grep '/open/' scan.gnmap | awk ..." },
          { cmd: "-oX file.xml", desc: "XML — para importar em outras ferramentas.", output: "Serve para Metasploit (db_import) e ZenMap." },
          { cmd: "-oA basename", desc: "TODOS de uma vez (gnmap + nmap + xml).", output: "Padrão profissional." },
        ]}
      />

      <h2>NSE — Nmap Scripting Engine</h2>
      <p>O Nmap vem com 600+ scripts em <code>/usr/share/nmap/scripts/</code> para enumeração, brute force, vuln check, etc.</p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/nmap/scripts/ | wc -l",
            out: "619",
            outType: "info",
          },
          {
            comment: "categorias mais usadas: default, discovery, vuln, brute, exploit, safe",
            cmd: "ls /usr/share/nmap/scripts/ | grep -E '^(http|smb|ssh)-' | head -10",
            out: `http-aspnet-debug.nse
http-auth-finder.nse
http-auth.nse
http-config-backup.nse
http-cookie-flags.nse
http-default-accounts.nse
http-enum.nse
http-headers.nse
http-methods.nse
http-php-version.nse`,
            outType: "default",
          },
          {
            comment: "rodar todos os scripts vuln no alvo",
            cmd: "sudo nmap --script vuln -p 80,443 webgoat.local",
            out: `PORT    STATE SERVICE
80/tcp  open  http
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=webgoat.local
|   Found the following possible CSRF vulnerabilities: 
|     Path: http://webgoat.local:80/login
|     Form id: login
|_    Form action: /authenticate
| http-enum: 
|   /admin/: Possible admin folder
|   /backup/: Backup folder w/ directory listing
|_  /robots.txt: Robots file
| http-slowloris-check: 
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|_    Risk factor: High`,
            outType: "warning",
          },
          {
            comment: "scripts específicos por nome",
            cmd: "nmap --script smb-enum-shares,smb-enum-users -p 445 192.168.1.50",
            out: `PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-enum-shares: 
|   account_used: <blank>
|   \\\\192.168.1.50\\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service
|     Anonymous access: READ/WRITE
|   \\\\192.168.1.50\\public: 
|     Type: STYPE_DISKTREE
|     Anonymous access: READ
| smb-enum-users:
|   ACME\\Administrator
|   ACME\\guest
|_  ACME\\jsmith`,
            outType: "success",
          },
        ]}
      />

      <h2>Timing e performance</h2>
      <CommandTable
        title="Templates de timing (-T0 a -T5)"
        variations={[
          { cmd: "-T0 paranoid", desc: "Lentíssimo, evade IDS. 1 probe a cada 5 minutos.", output: "Use só em alvo monitorado por SOC." },
          { cmd: "-T1 sneaky", desc: "Lento. 15s entre probes.", output: "Furtivo." },
          { cmd: "-T2 polite", desc: "Reduz uso de banda/CPU do alvo.", output: "Para alvos frágeis (impressoras, IoT)." },
          { cmd: "-T3 normal", desc: "PADRÃO se nada for especificado.", output: "Bom equilíbrio." },
          { cmd: "-T4 aggressive", desc: "Rápido em rede LAN/cabeada.", output: "Padrão de pentest CTF." },
          { cmd: "-T5 insane", desc: "MÁXIMO. Pode perder pacotes.", output: "Só LAN super-confiável." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ajustar timing finamente",
            cmd: "sudo nmap -p- --min-rate 5000 --max-retries 1 192.168.1.50",
            out: "(varre as 65535 portas em ~13s em LAN)",
            outType: "info",
          },
        ]}
      />

      <h2>Evasão e ofuscação</h2>
      <CodeBlock
        language="bash"
        title="técnicas de evasão de IDS/firewall"
        code={`# Fragmentar pacotes (-f, --mtu)
sudo nmap -f -p 22 alvo

# Spoof source IP (precisa estar na mesma rede ou rotear de volta)
sudo nmap -S 192.168.1.99 -e eth0 -Pn alvo

# Decoys: disfarça o atacante real entre IPs falsos
sudo nmap -D RND:10 -p 22,80 alvo

# Source port (alguns firewalls confiam em :53, :88)
sudo nmap --source-port 53 -p 22,80 alvo

# Random ordem de hosts e portas
sudo nmap --randomize-hosts -p- alvo`}
      />

      <PracticeBox
        title="Pentest típico em laboratório"
        goal="Mapear todas as portas TCP de um alvo + versão de cada serviço + scripts default."
        steps={[
          "Confirme que o host está vivo (ou use -Pn).",
          "Faça uma 'discovery scan' rápida nas top 1000 portas.",
          "Faça um 'full scan' em todas as 65535 portas.",
          "Em cima das portas abertas: -sV -sC + scripts vuln.",
          "Salve em todos os formatos para depois importar no msfconsole.",
        ]}
        command={`# 1) descoberta rápida
sudo nmap -sS --top-ports 1000 -T4 -oA quick 10.10.10.5

# 2) extrair portas abertas
PORTS=$(grep '/open/' quick.gnmap | grep -oE '[0-9]+/open' | cut -d/ -f1 | tr '\\n' ',' | sed 's/,$//')
echo "Portas abertas: $PORTS"

# 3) deep scan só nelas
sudo nmap -sS -sV -sC -O -p $PORTS --script vuln -T4 -oA deep 10.10.10.5`}
        expected={`Starting Nmap 7.95
Nmap scan report for 10.10.10.5
PORT     STATE SERVICE   VERSION
22/tcp   open  ssh       OpenSSH 8.9p1 Ubuntu
80/tcp   open  http      Apache 2.4.52
3306/tcp open  mysql     MySQL 5.7.41
[...]
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel`}
        verify="No msfconsole, rode `db_import deep.xml` — todos os hosts/portas/serviços viram registros no workspace."
      />

      <AlertBox type="danger" title="Scanning é regulado">
        Em vários países (incluindo o Brasil em casos com agravantes) varrer um IP que
        não é seu, sem autorização escrita, configura crime. Use sempre laboratório isolado,
        plataformas legais (THM, HTB, scanme.nmap.org) ou autorização formal por escrito.
      </AlertBox>
    </PageContainer>
  );
}
