import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Tor() {
  return (
    <PageContainer
      title="Tor & Anonimato"
      subtitle="Como usar a rede Tor no Kali Linux para privacidade e anonimato operacional."
      difficulty="intermediario"
      timeToRead="8 min"
    >
      <h2>O que é o Tor?</h2>
      <p>
        O <strong>Tor (The Onion Router)</strong> é uma rede de anonimato que encaminha o tráfego 
        por múltiplos nós (relays) criptografados. Cada relay conhece apenas o anterior e o próximo, 
        dificultando o rastreamento da origem real.
      </p>

      <h2>Instalando e usando o Tor</h2>
      <CodeBlock language="bash" code={`# Instalar Tor
sudo apt install -y tor torbrowser-launcher

# Iniciar o serviço Tor
sudo systemctl start tor
sudo systemctl enable tor

# Verificar status
sudo systemctl status tor

# Tor Browser (versão customizada do Firefox)
torbrowser-launcher

# Verificar IP via Tor
curl --proxy socks5h://127.0.0.1:9050 https://check.torproject.org/api/ip`} />

      <h2>Configuração do Tor</h2>
      <CodeBlock language="bash" code={`# Arquivo de configuração
sudo nano /etc/tor/torrc

# Configurações úteis:
# SocksPort 9050                    # porta SOCKS padrão
# ControlPort 9051                  # controle da rede
# Log notice file /var/log/tor/tor.log

# Forçar novo circuito (novo IP)
echo -e 'AUTHENTICATE ""\nSIGNAL NEWNYM\nQUIT' | nc 127.0.0.1 9051

# Ou instalar stem para controle
pip install stem

# Script Python para trocar circuito
python3 -c "
from stem import Signal
from stem.control import Controller
with Controller.from_port(port=9051) as ctrl:
    ctrl.authenticate()
    ctrl.signal(Signal.NEWNYM)
print('Novo circuito solicitado!')
"`} />

      <h2>Tor + Proxychains (todas as ferramentas)</h2>
      <CodeBlock language="bash" code={`# Configurar proxychains para Tor
grep -n "socks5" /etc/proxychains4.conf
# Deve ter: socks5  127.0.0.1 9050

# Garantir dynamic_chain está ativo
grep "dynamic_chain" /etc/proxychains4.conf

# Testar
proxychains curl https://check.torproject.org/api/ip
proxychains curl ifconfig.io

# Navegar anonimamente
proxychains firefox https://duckduckgo.com`} />

      <h2>Nyx — Monitor da rede Tor</h2>
      <CodeBlock language="bash" code={`# Instalar Nyx (antigo arm)
sudo apt install -y nyx

# Iniciar monitor
sudo nyx

# Mostra: circuitos ativos, banda, logs, configuração`} />

      <h2>Serviços .onion (Dark Web)</h2>
      <CodeBlock language="bash" code={`# Acessar .onion via curl
curl --proxy socks5h://127.0.0.1:9050 http://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/

# Criar seu próprio serviço .onion (Hidden Service)
# Editar /etc/tor/torrc:
# HiddenServiceDir /var/lib/tor/meu_servico/
# HiddenServicePort 80 127.0.0.1:8080

# Reiniciar Tor e ver o endereço .onion gerado
sudo systemctl restart tor
sudo cat /var/lib/tor/meu_servico/hostname`} />

      <AlertBox type="warning" title="Limitações do Tor">
        O Tor não é invulnerável: tráfego muito volumoso, uso de cookies/JavaScript, 
        correlação de tempo e erros operacionais podem deanonymizar o usuário. 
        Para anonimato real, combine com boas práticas de OPSEC.
      </AlertBox>

      <h2>OPSEC — Boas práticas de anonimato</h2>
      <div className="space-y-2 my-6">
        {[
          "Use sempre o Tor Browser (não configure o Firefox comum para Tor)",
          "Não faça login em contas pessoais durante operações anônimas",
          "Desative JavaScript quando possível (.onion)",
          "Não abra arquivos PDF/Office baixados via Tor (podem revelar IP real)",
          "Use Tails OS para operações que exigem anonimato máximo",
          "Não use Torrent via Tor (UDP vaza IP real)",
          "Não acesse HTTP sem TLS (exit node pode ver o conteúdo)",
          "Considere usar VPN antes do Tor (VPN → Tor) para ocultar uso do Tor do ISP",
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span className="text-muted-foreground">{tip}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
