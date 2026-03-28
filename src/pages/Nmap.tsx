import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Nmap() {
  return (
    <PageContainer
      title="Nmap — Network Mapper"
      subtitle="A ferramenta de varredura de rede mais poderosa do mundo, essencial em qualquer pentest."
      difficulty="intermediario"
      timeToRead="15 min"
    >
      <AlertBox type="danger" title="Use apenas em redes autorizadas">
        Varreduras Nmap sem autorização são ilegais em muitos países. 
        Sempre obtenha autorização por escrito antes de qualquer scan.
      </AlertBox>

      <h2>Consultando a ajuda do Nmap</h2>
      <CodeBlock language="bash" code={`# Ver ajuda completa (muito longa — use less para paginar)
nmap --help
nmap --help | less

# Ver a versão instalada
nmap --version

# Ajuda rápida sobre scripts NSE
nmap --script-help all | less`} />

      <AlertBox type="info" title="Lendo o --help do Nmap em Português">
        A saída do <code>nmap --help</code> está em inglês. Abaixo traduzimos e explicamos cada categoria de flags mais importantes para você.
      </AlertBox>

      <h2>Tipos de scan (-s)</h2>
      <CodeBlock language="bash" code={`sudo nmap -sS 192.168.1.1   # TCP SYN (padrão)
nmap -sT 192.168.1.1        # TCP Connect (sem root)
sudo nmap -sU 192.168.1.1   # UDP
nmap -sV 192.168.1.1        # versão de serviços
sudo nmap -O 192.168.1.1    # detecção de OS
sudo nmap -A 192.168.1.1    # tudo (-sV -O -sC --traceroute)`} />

      <ParamsTable
        title="Tipos de scan (-s) — explicados em português"
        params={[
          { flag: "-sS", desc: "TCP SYN Scan (scan furtivo). Envia pacote SYN, analisa resposta. Não completa o handshake TCP — menos detectável. Requer root/sudo.", exemplo: "sudo nmap -sS 192.168.1.1" },
          { flag: "-sT", desc: "TCP Connect Scan. Completa o handshake TCP normalmente. Não requer root, mas é mais barulhento e detectável.", exemplo: "nmap -sT 192.168.1.1" },
          { flag: "-sU", desc: "UDP Scan. Escaneia portas UDP (53=DNS, 161=SNMP, 67=DHCP). Muito mais lento que TCP. Essencial — muitos serviços críticos usam UDP.", exemplo: "sudo nmap -sU -p 53,161 alvo" },
          { flag: "-sN", desc: "TCP Null Scan. Envia pacote sem nenhuma flag TCP. Burla alguns firewalls. Requer root.", exemplo: "sudo nmap -sN alvo" },
          { flag: "-sF", desc: "FIN Scan. Envia apenas a flag FIN. Pode bypassar firewalls que só filtram SYN.", exemplo: "sudo nmap -sF alvo" },
          { flag: "-sX", desc: "Xmas Scan. Envia pacote com flags FIN, URG e PUSH — parece uma 'árvore de Natal'. Burla alguns sistemas.", exemplo: "sudo nmap -sX alvo" },
          { flag: "-sV", desc: "Version Detection. Identifica a versão exata dos serviços rodando em cada porta (ex: Apache 2.4.7, OpenSSH 8.2). Fundamental para encontrar vulnerabilidades.", exemplo: "nmap -sV 192.168.1.1" },
          { flag: "-O", desc: "OS Detection. Tenta identificar o sistema operacional do alvo com base na resposta TCP/IP. Requer root.", exemplo: "sudo nmap -O 192.168.1.1" },
          { flag: "-A", desc: "Aggressive Mode. Ativa: -sV (versões), -O (OS), -sC (scripts padrão) e --traceroute. O mais completo — mais detectável.", exemplo: "sudo nmap -A 192.168.1.1" },
          { flag: "-sn", desc: "Ping Scan (sem port scan). Só descobre quais hosts estão ativos na rede. Muito rápido para varrer sub-redes.", exemplo: "sudo nmap -sn 192.168.1.0/24" },
          { flag: "-sC", desc: "Executa scripts NSE padrão (--script=default). Descobre informações extras sobre serviços.", exemplo: "nmap -sC 192.168.1.1" },
        ]}
      />

      <h2>Definindo alvos e portas</h2>
      <CodeBlock language="bash" code={`nmap 192.168.1.1                     # IP único
nmap 192.168.1.1-10                  # range de IPs
nmap 192.168.1.0/24                  # sub-rede
nmap -iL hosts.txt                   # lista de hosts

nmap -p 80 192.168.1.1               # porta específica
nmap -p 80,443,8080 192.168.1.1      # múltiplas
nmap -p 1-1000 192.168.1.1           # range
nmap -p- 192.168.1.1                  # TODAS (65535 portas)
nmap --top-ports 100 192.168.1.1     # 100 mais comuns
nmap -F 192.168.1.1                   # fast (100 portas)`} />

      <ParamsTable
        title="Especificação de alvos e portas — explicados"
        params={[
          { flag: "-iL arquivo.txt", desc: "Lê a lista de alvos de um arquivo de texto (um IP/host por linha). Ideal para testar múltiplos alvos.", exemplo: "nmap -iL alvos.txt" },
          { flag: "-p PORTA", desc: "Define a(s) porta(s) a escanear. Aceita: porta única, lista separada por vírgula, range com hífen ou -p- para todas.", exemplo: "nmap -p 22,80,443 alvo" },
          { flag: "-p-", desc: "Escaneia TODAS as 65535 portas TCP. Lento mas completo — nunca deixe porta aberta passar despercebida.", exemplo: "nmap -p- --min-rate 5000 alvo" },
          { flag: "-F", desc: "Fast scan — escaneia apenas as 100 portas mais comuns. Bem mais rápido que o padrão (top 1000).", exemplo: "nmap -F alvo" },
          { flag: "--top-ports N", desc: "Escaneia as N portas mais comuns. Bom equilíbrio entre velocidade e cobertura.", exemplo: "nmap --top-ports 500 alvo" },
          { flag: "--exclude IP", desc: "Exclui um IP do scan. Útil para não varrer gateways ou hosts críticos.", exemplo: "nmap 192.168.1.0/24 --exclude 192.168.1.1" },
          { flag: "-Pn", desc: "Pula a fase de descoberta de host (assume que está online). Necessário quando o alvo bloqueia ping (ICMP).", exemplo: "nmap -Pn 192.168.1.1" },
          { flag: "-PR", desc: "ARP Ping — usa ARP para descobrir hosts na rede local. Mais confiável que ICMP na LAN.", exemplo: "sudo nmap -PR 192.168.1.0/24" },
        ]}
      />

      <h2>Velocidade e performance</h2>
      <CodeBlock language="bash" code={`sudo nmap -T4 192.168.1.1             # agressivo (redes rápidas)
sudo nmap --min-rate 5000 192.168.1.1 # mínimo 5000 pacotes/s
sudo nmap -p- --min-rate 5000 -T4 alvo # scan rápido completo`} />

      <ParamsTable
        title="Velocidade (-T) e performance — explicados"
        params={[
          { flag: "-T0 (Paranoid)", desc: "Extremamente lento. Um pacote a cada 5 minutos. Evade sistemas de detecção de intrusão (IDS) avançados.", exemplo: "sudo nmap -T0 alvo" },
          { flag: "-T1 (Sneaky)", desc: "Muito lento. 1 pacote a cada 15 segundos. Difícil de detectar.", exemplo: "sudo nmap -T1 alvo" },
          { flag: "-T2 (Polite)", desc: "Lento. Reduz carga na rede. Bom para redes lentas ou frágeis.", exemplo: "sudo nmap -T2 alvo" },
          { flag: "-T3 (Normal)", desc: "Velocidade padrão do Nmap. Bom equilíbrio entre velocidade e discreção.", exemplo: "nmap -T3 alvo" },
          { flag: "-T4 (Aggressive)", desc: "Rápido. Assume boa conexão. Ideal para pentests em redes corporativas. Mais detectável.", exemplo: "sudo nmap -T4 alvo" },
          { flag: "-T5 (Insane)", desc: "Máxima velocidade. Pode perder resultados em redes lentas. Muito barulhento.", exemplo: "sudo nmap -T5 alvo" },
          { flag: "--min-rate N", desc: "Mínimo de N pacotes por segundo. Complementa ou substitui o -T. Mais previsível.", exemplo: "nmap --min-rate 5000 alvo" },
          { flag: "--max-retries N", desc: "Máximo de tentativas por porta. Padrão é 10. Reduza para acelerar o scan.", exemplo: "nmap --max-retries 2 alvo" },
        ]}
      />

      <h2>Scripts NSE (Nmap Scripting Engine)</h2>
      <CodeBlock language="bash" code={`nmap -sC 192.168.1.1                           # scripts padrão
nmap --script=vuln 192.168.1.1                  # vulnerabilidades
nmap --script=smb-vuln-ms17-010 alvo            # EternalBlue
nmap --script=http-title alvo                   # título do site
nmap --script=ftp-anon alvo                     # FTP anônimo`} />

      <ParamsTable
        title="Scripts NSE por categoria — o que cada uma faz"
        params={[
          { flag: "--script=default / -sC", desc: "Executa scripts considerados seguros e informativos. Descobre versões, banners, informações básicas de serviços.", exemplo: "nmap -sC alvo" },
          { flag: "--script=vuln", desc: "Verifica vulnerabilidades conhecidas (CVEs) nos serviços detectados. Pode ser barulhoso.", exemplo: "nmap --script=vuln alvo" },
          { flag: "--script=auth", desc: "Testa credenciais padrão e métodos de autenticação dos serviços.", exemplo: "nmap --script=auth alvo" },
          { flag: "--script=discovery", desc: "Coleta informações adicionais: DNS, SNMP, NetBIOS, broadcast, etc.", exemplo: "nmap --script=discovery alvo" },
          { flag: "--script=safe", desc: "Apenas scripts considerados seguros (não invasivos). Bom para não perturbar serviços.", exemplo: "nmap --script=safe alvo" },
          { flag: "--script=exploit", desc: "Scripts que tentam explorar vulnerabilidades. Use com extrema cautela!", exemplo: "nmap --script=exploit alvo" },
          { flag: "--script=smb-vuln-ms17-010", desc: "Verifica se o alvo é vulnerável ao EternalBlue (WannaCry). Porta 445.", exemplo: "nmap --script=smb-vuln-ms17-010 -p 445 alvo" },
          { flag: "--script=http-title", desc: "Obtém o título da página web do alvo. Rápido para identificar tipo de aplicação.", exemplo: "nmap --script=http-title -p 80 alvo" },
          { flag: "--script=ftp-anon", desc: "Verifica se o FTP aceita login anônimo — vulnerabilidade comum.", exemplo: "nmap --script=ftp-anon -p 21 alvo" },
        ]}
      />

      <h2>Evasão de firewall/IDS</h2>
      <ParamsTable
        title="Técnicas de evasão — explicadas"
        params={[
          { flag: "-f", desc: "Fragmenta os pacotes em pedaços de 8 bytes. Alguns firewalls não remontam e deixam passar.", exemplo: "sudo nmap -f alvo" },
          { flag: "--mtu N", desc: "Define o tamanho do fragmento manualmente. Deve ser múltiplo de 8.", exemplo: "sudo nmap --mtu 16 alvo" },
          { flag: "-D RND:10", desc: "Decoy (chamariz). Envia o scan de 10 IPs falsos junto com o seu. O alvo não sabe qual é o real.", exemplo: "sudo nmap -D RND:10 alvo" },
          { flag: "-S IP_FALSO", desc: "Spoof do IP de origem — finge ser outro IP. Use com -e para especificar a interface.", exemplo: "sudo nmap -S 192.168.1.50 alvo" },
          { flag: "--source-port 53", desc: "Usa a porta 53 (DNS) como origem. Muitos firewalls permitem tráfego de/para DNS.", exemplo: "sudo nmap --source-port 53 alvo" },
          { flag: "--spoof-mac 0", desc: "Gera um endereço MAC aleatório para o scan. 0 = aleatório, ou especifique um.", exemplo: "sudo nmap --spoof-mac 0 alvo" },
          { flag: "--scan-delay N", desc: "Adiciona N milissegundos de espera entre cada pacote. Menos detectável mas muito mais lento.", exemplo: "nmap --scan-delay 500ms alvo" },
        ]}
      />

      <h2>Saída e resultados</h2>
      <ParamsTable
        title="Formatos de saída (-o) — explicados"
        params={[
          { flag: "-oN arquivo.txt", desc: "Normal output — legível por humanos. Igual ao que aparece na tela.", exemplo: "nmap alvo -oN scan.txt" },
          { flag: "-oX arquivo.xml", desc: "XML output — pode ser importado no Metasploit (db_import) ou convertido para HTML.", exemplo: "nmap alvo -oX scan.xml" },
          { flag: "-oG arquivo.gnmap", desc: "Grepable output — formatado para filtrar com grep/awk. Útil em scripts.", exemplo: "nmap alvo -oG scan.gnmap" },
          { flag: "-oA prefixo", desc: "All formats — gera os três formatos acima de uma vez com o mesmo prefixo de nome.", exemplo: "nmap alvo -oA resultado_scan" },
          { flag: "-v", desc: "Verboso — mostra progresso em tempo real durante o scan.", exemplo: "nmap -v alvo" },
          { flag: "-vv", desc: "Mais verboso — exibe ainda mais detalhes sobre cada porta.", exemplo: "nmap -vv alvo" },
          { flag: "--open", desc: "Mostra apenas portas abertas nos resultados. Filtra portas fechadas/filtradas.", exemplo: "nmap --open alvo" },
          { flag: "--reason", desc: "Exibe o motivo pelo qual cada porta foi classificada como aberta/fechada/filtrada.", exemplo: "nmap --reason alvo" },
        ]}
      />

      <h2>Comandos prontos para CTF e pentest</h2>
      <CodeBlock language="bash" code={`# Scan rápido inicial (CTF)
sudo nmap -sC -sV -p- -T4 IP_ALVO -oA scan_inicial

# Descoberta de hosts na rede
sudo nmap -sn 192.168.1.0/24 --open

# Scan completo de uma máquina
sudo nmap -A -p- --min-rate 5000 IP_ALVO

# Verificar EternalBlue (MS17-010)
sudo nmap --script=smb-vuln-ms17-010 -p 445 IP_ALVO

# UDP nas portas mais importantes
sudo nmap -sU -p 53,67,68,69,111,161,500 IP_ALVO`} />

      <AlertBox type="success" title="Dica: Combine com outras ferramentas">
        Após o Nmap, use os resultados para direcionar: 
        Metasploit para exploração, Hydra para senhas fracas, Burp Suite para serviços web descobertos.
      </AlertBox>
    </PageContainer>
  );
}
