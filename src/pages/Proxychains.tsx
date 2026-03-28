import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Proxychains() {
  return (
    <PageContainer
      title="Proxychains"
      subtitle="Roteie o tráfego de qualquer aplicativo por uma cadeia de proxies para privacidade e pivoting."
      difficulty="intermediario"
      timeToRead="7 min"
    >
      <h2>O que é o Proxychains?</h2>
      <p>
        O <strong>Proxychains</strong> força qualquer aplicativo TCP a passar por proxies 
        (SOCKS4/5, HTTP) configurados. Muito útil para pivoting em pentest, 
        anonimato e bypass de restrições de rede.
      </p>

      <h2>Configuração básica</h2>
      <CodeBlock language="bash" code={`# Arquivo de configuração
sudo nano /etc/proxychains4.conf

# Tipos de encadeamento:
# strict_chain — usa proxies em ordem, todos devem funcionar
# dynamic_chain — pula proxies offline (mais flexível)
# random_chain — usa proxies em ordem aleatória

# Exemplo de configuração:
[ProxyList]
# socks5 host porta
socks5 127.0.0.1 9050    # Tor (porta padrão)
socks5 127.0.0.1 1080    # SSH tunnel ou outros
# socks4 10.0.0.1 1080
# http 192.168.1.1 8080`} />

      <h2>Usando o Proxychains</h2>
      <CodeBlock language="bash" code={`# Prefixar qualquer comando com proxychains
proxychains curl http://meuip.io
proxychains nmap -sT 192.168.1.1         # TCP scan via proxy
proxychains ssh usuario@10.0.0.50        # SSH via proxy
proxychains python3 script.py

# Firefox via proxychains
proxychains firefox https://site.com

# Opção verbose (ver conexões)
proxychains -q curl http://meuip.io      # quieto
proxychains4 curl http://meuip.io        # proxychains4 (mais novo)`} />

      <h2>Pivoting com SSH + Proxychains</h2>
      <AlertBox type="info" title="Caso de uso: Pivoting em pentest">
        Após comprometer um servidor, crie um túnel SSH dinâmico e use o Proxychains 
        para alcançar redes internas inacessíveis diretamente.
      </AlertBox>
      <CodeBlock language="bash" code={`# Cenário de pivoting:
# Atacante → (via SSH) → Servidor comprometido (10.0.0.5) → Rede interna (192.168.1.0/24)

# 1. Criar túnel SOCKS via SSH
ssh -D 1080 -N -f usuario@10.0.0.5

# 2. Configurar proxychains para usar o tunnel
echo "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf

# 3. Escanear rede interna via pivô
proxychains nmap -sT -Pn 192.168.1.0/24
proxychains nmap -sT -Pn -p 22,80,443,445 192.168.1.0/24

# 4. Conectar a serviços internos
proxychains ssh admin@192.168.1.50       # SSH interno
proxychains psql -h 192.168.1.10 -U postgres  # PostgreSQL interno
proxychains curl http://192.168.1.20/admin    # web interno

# Múltiplos saltos (pivoting em cadeia)
ssh -D 1080 -N usuario@hop1
proxychains ssh -D 1081 usuario@hop2
# Adicionar 127.0.0.1 1081 ao proxychains para o terceiro salto`} />

      <h2>Usando com Metasploit</h2>
      <CodeBlock language="bash" code={`# No msfconsole, após obter sessão Meterpreter:
# Configurar rota para rede interna
route add 192.168.1.0/24 SESSION_ID

# Ou usar auxiliary de proxy SOCKS
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run -j

# Configurar proxychains para usar 127.0.0.1:1080
# E agora use proxychains nmap, etc.`} />

      <h2>Proxychains com Tor</h2>
      <CodeBlock language="bash" code={`# Iniciar serviço Tor
sudo systemctl start tor

# Tor escuta em 127.0.0.1:9050 por padrão

# Verificar que Tor está funcionando
curl --proxy socks5h://127.0.0.1:9050 https://check.torproject.org/api/ip

# Configurar proxychains para Tor
cat /etc/proxychains4.conf | grep socks5
# socks5  127.0.0.1 9050

# Usar qualquer ferramenta via Tor
proxychains curl ifconfig.io
proxychains firefox`} />
    </PageContainer>
  );
}
