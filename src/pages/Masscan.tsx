import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Masscan() {
  return (
    <PageContainer
      title="Masscan — varredura em escala de internet"
      subtitle="Sintaxe parecida com nmap, mas com TCP stack próprio: 10 milhões de pacotes/s."
      difficulty="intermediário"
      timeToRead="10 min"
      prompt="recon/masscan"
    >
      <h2>Por que masscan</h2>
      <p>
        O <strong>nmap</strong> é o canivete suíço — versão, OS, NSE. O <strong>masscan</strong> é o
        martelo bruto: faz <em>asynchronous SYN scan</em> com TCP/IP stack próprio.
        Em hardware decente, varre uma <strong>/8 inteira</strong> (16 milhões de IPs)
        em poucos minutos.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y masscan",
            out: "(já vem no Kali default)",
            outType: "muted",
          },
          {
            cmd: "masscan --version",
            out: `Masscan version 1.3.2 ( https://github.com/robertdavidgraham/masscan )
Compiled on: Mar 14 2025`,
            outType: "info",
          },
        ]}
      />

      <h2>Primeira varredura</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo masscan 192.168.1.0/24 -p22,80,443 --rate 1000",
            out: `Starting masscan 1.3.2 ( https://github.com/robertdavidgraham/masscan )
Initiating SYN Stealth Scan
Scanning 256 hosts [3 ports/host]
Discovered open port 22/tcp on 192.168.1.50
Discovered open port 80/tcp on 192.168.1.50
Discovered open port 443/tcp on 192.168.1.50
Discovered open port 22/tcp on 192.168.1.108
Discovered open port 80/tcp on 192.168.1.1
rate:  984.21-kpps, 100.00% done, waiting -10 secs   `,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Flags principais"
        variations={[
          { cmd: "-p22,80,443", desc: "Lista de portas (separe com vírgula).", output: "Pode usar ranges: -p1-65535" },
          { cmd: "--top-ports 100", desc: "Top portas (igual ao nmap).", output: "Atalho útil." },
          { cmd: "--rate 10000", desc: "Pacotes por segundo (PADRÃO 100 — muito baixo).", output: "Em fibra: --rate 100000+" },
          { cmd: "--banners", desc: "Captura banner básico do serviço.", output: "Pega 'SSH-2.0-OpenSSH_9.6p1' direto." },
          { cmd: "-iL hosts.txt", desc: "Lê alvos de arquivo.", output: "Um IP/CIDR por linha." },
          { cmd: "--excludefile excl.txt", desc: "Não escaneia esses IPs (gov, .mil etc).", output: "Mantém-se dentro do escopo." },
          { cmd: "-oG out.gnmap", desc: "Saída no formato greppable do nmap.", output: "Pode importar em outras ferramentas." },
          { cmd: "-oJ out.json", desc: "Saída JSON.", output: "Para parse com jq." },
          { cmd: "--source-port 40000", desc: "Define porta de origem.", output: "Útil contra firewalls com filtro de origem." },
          { cmd: "--router-mac AA:BB:CC:DD:EE:FF", desc: "Define MAC do gateway manualmente.", output: "Usar quando masscan não autodetecta." },
        ]}
      />

      <h2>Combo masscan + nmap (boa prática)</h2>
      <p>
        Use o masscan para encontrar <em>onde está aberto</em>, depois jogue o nmap em cima
        para fazer detection de versão/script. É 100x mais rápido que rodar nmap puro.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) masscan TODAS as portas em rate alto",
            cmd: "sudo masscan 10.10.10.0/24 -p1-65535 --rate 10000 -oG masscan.gnmap",
            out: `Discovered open port 22/tcp on 10.10.10.5
Discovered open port 80/tcp on 10.10.10.5
Discovered open port 3306/tcp on 10.10.10.5
Discovered open port 8080/tcp on 10.10.10.7
Discovered open port 443/tcp on 10.10.10.12
rate: 9824.31-kpps, 100.00% done, waiting -5 secs`,
            outType: "info",
          },
          {
            cmd: "cat masscan.gnmap | grep -oE '[0-9.]+:[0-9]+'",
            out: `10.10.10.5:22
10.10.10.5:80
10.10.10.5:3306
10.10.10.7:8080
10.10.10.12:443`,
            outType: "default",
          },
          {
            comment: "2) extrair hosts e portas",
            cmd: `HOSTS=$(grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' masscan.gnmap | sort -u | tr '\\n' ',')
PORTS=$(grep -oE '[0-9]+/open' masscan.gnmap | grep -oE '[0-9]+' | sort -un | tr '\\n' ',')
echo "Hosts: $HOSTS"
echo "Ports: $PORTS"`,
            out: `Hosts: 10.10.10.12,10.10.10.5,10.10.10.7
Ports: 22,80,443,3306,8080`,
            outType: "default",
          },
          {
            comment: "3) deep scan com nmap só nas portas que masscan achou",
            cmd: "sudo nmap -sV -sC -p $PORTS $HOSTS -oA deep_scan",
            out: `Nmap scan report for 10.10.10.5
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp   open  http    Apache 2.4.52
3306/tcp open  mysql   MySQL 5.7.41
[...]`,
            outType: "success",
          },
        ]}
      />

      <h2>Banners — fingerprinting rápido</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo masscan -p22,80,443 192.168.1.0/24 --rate 5000 --banners -oJ banners.json",
            out: `Discovered open port 22/tcp on 192.168.1.50
Banner on port 22/tcp on 192.168.1.50: [ssh] SSH-2.0-OpenSSH_9.6p1 Ubuntu-3
Discovered open port 80/tcp on 192.168.1.50
Banner on port 80/tcp on 192.168.1.50: [http] HTTP/1.1 200 OK\\x0d\\x0aServer: nginx/1.27.1
Banner on port 80/tcp on 192.168.1.50: [title] Welcome to nginx!`,
            outType: "info",
          },
          {
            cmd: "jq '.[] | select(.ports[].service != null) | {ip, port: .ports[0].port, service: .ports[0].service}' banners.json",
            out: `{
  "ip": "192.168.1.50",
  "port": 22,
  "service": {"name": "ssh", "banner": "SSH-2.0-OpenSSH_9.6p1 Ubuntu-3"}
}
{
  "ip": "192.168.1.50",
  "port": 80,
  "service": {"name": "http", "banner": "HTTP/1.1 200 OK..Server: nginx/1.27.1"}
}`,
            outType: "default",
          },
        ]}
      />

      <h2>Excluir alvos sensíveis</h2>
      <OutputBlock label="exclude.txt — sempre tenha um" type="muted">
{`# IANA reserved
0.0.0.0/8
127.0.0.0/8
169.254.0.0/16
224.0.0.0/3

# Critical Infrastructure (DOD, gov)
6.0.0.0/8
7.0.0.0/8
22.0.0.0/8
192.0.2.0/24
198.51.100.0/24

# Adicione aqui IPs que NÃO podem ser escaneados`}
      </OutputBlock>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo masscan 10.0.0.0/8 -p443 --rate 100000 --excludefile exclude.txt -oG https-internet.gnmap",
            out: `Starting masscan 1.3.2
Initiating SYN Stealth Scan
Scanning 16777216 hosts [1 port/host]
Excluding 12 ranges
[...]
rate:  98.4-kpps, 28.42% done, ETA: 0:02:14`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Achar todos os SSH da sua LAN em segundos"
        goal="Identificar todos os hosts com porta 22 aberta + capturar a versão do SSH."
        steps={[
          "Rode masscan na porta 22 com --banners.",
          "Salve em JSON.",
          "Use jq para listar IP + versão.",
        ]}
        command={`sudo masscan 192.168.1.0/24 -p22 --banners --rate 5000 -oJ ssh_hosts.json
jq -r '.[] | select(.ports[0].service.name=="ssh") | [.ip, .ports[0].service.banner] | @tsv' ssh_hosts.json`}
        expected={`192.168.1.1	SSH-2.0-OpenSSH_9.2p1 Debian-2+deb12u3
192.168.1.50	SSH-2.0-OpenSSH_9.6p1 Ubuntu-3
192.168.1.108	SSH-2.0-OpenSSH_9.6p1`}
        verify="O JSON deve ter ao menos 1 entrada com .ports[0].service.banner começando em 'SSH-2.0-'."
      />

      <AlertBox type="warning" title="--rate alto requer interface dedicada">
        Para --rate 1.000.000+ você precisa de NIC sem queue compartilhada (PF_RING, DPDK).
        Em LAN doméstica, mantenha-se em --rate 10000~100000 para não saturar o roteador.
      </AlertBox>

      <AlertBox type="danger" title="masscan ignora roteamento e firewall do SO">
        Como tem TCP stack próprio, masscan envia SYN diretamente — algumas configurações
        de iptables ou estados do kernel são ignoradas. Sempre teste em um host de
        confiança antes de varrer redes externas.
      </AlertBox>
    </PageContainer>
  );
}
