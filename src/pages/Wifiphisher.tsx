import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Wifiphisher() {
  return (
    <PageContainer
      title="Wifiphisher"
      subtitle="Ataques de engenharia social em redes Wi-Fi — Evil Twin e phishing de credenciais."
      difficulty="avancado"
      timeToRead="8 min"
    >
      <AlertBox type="danger" title="Somente com autorização expressa">
        O Wifiphisher cria APs falsos e intercepta tráfego. Isso é crime severo se feito sem autorização. 
        Use apenas em laboratórios próprios ou com contrato de pentest assinado.
      </AlertBox>

      <h2>O que é o Wifiphisher?</h2>
      <p>
        O <strong>Wifiphisher</strong> é uma ferramenta de segurança que automatiza ataques 
        <em> Evil Twin</em> — criando um ponto de acesso falso idêntico ao legítimo para 
        capturar credenciais via phishing, sem necessidade de brute force.
      </p>

      <h2>Requisitos</h2>
      <CodeBlock language="bash" code={`# Instalar Wifiphisher
sudo apt install -y wifiphisher

# Necessita de 2 adaptadores wireless:
# 1. Para o Evil Twin AP (wlan0)
# 2. Para o beacon flooding/jamming (wlan1 — modo monitor)
# OU apenas 1 adaptador com certas funcionalidades

# Verificar adaptadores
sudo iw dev`} />

      <h2>Usando o Wifiphisher</h2>
      <CodeBlock language="bash" code={`# Iniciar (seleciona rede interativamente)
sudo wifiphisher

# Escolher rede alvo e cenário:
# 1 - Firmware Upgrade Page (atualização de firmware)
# 2 - Network Manager Connect (rede corporativa)
# 3 - Browser Plugin Update (atualização de plugin)
# 4 - OAuth Login Page (login Google/Facebook)
# 5 - WiFi Connect (captive portal)

# Especificar rede diretamente
sudo wifiphisher -e "NomeRedaWifi" -p firmware-upgrade

# Usar interfaces específicas
sudo wifiphisher -aI wlan0 -jI wlan1 -e "TargetSSID"

# Com logging
sudo wifiphisher --logging --logpath /tmp/wifiphisher.log`} />

      <h2>Cenários disponíveis</h2>
      <div className="space-y-3 my-6">
        {[
          { name: "firmware-upgrade", desc: "Simula atualização de firmware do roteador. Pede a senha Wi-Fi para 'confirmar'." },
          { name: "oauth-login", desc: "Página de login OAuth falsa (Google, Facebook). Captura credenciais de rede social." },
          { name: "wifi-connect", desc: "Portal captivo simples solicitando senha Wi-Fi." },
          { name: "network-manager-connect", desc: "Simula pop-up de rede corporativa do Windows." },
          { name: "browser-plugin-update", desc: "Simula atualização de plugin do browser. Pode distribuir malware." },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <code className="text-primary text-sm font-mono">{s.name}</code>
            <p className="text-xs text-muted-foreground mt-2">{s.desc}</p>
          </div>
        ))}
      </div>

      <h2>Como o ataque funciona</h2>
      <ol>
        <li><strong>Scanning:</strong> Wifiphisher escaneia redes próximas</li>
        <li><strong>Evil Twin:</strong> Cria um AP com o mesmo SSID (nome) da rede alvo</li>
        <li><strong>Jamming:</strong> Envia pacotes de deautenticação para desconectar clientes da rede legítima</li>
        <li><strong>Associação:</strong> Vítimas se conectam ao AP falso (sinal mais forte)</li>
        <li><strong>Phishing:</strong> Portal HTTP captura credenciais ou executa ações</li>
        <li><strong>Resultado:</strong> Senha Wi-Fi exibida no terminal do atacante</li>
      </ol>

      <h2>Criando cenário customizado</h2>
      <CodeBlock language="bash" code={`# Templates ficam em:
ls /usr/share/wifiphisher/phishing-pages/

# Criar novo cenário
mkdir /usr/share/wifiphisher/phishing-pages/meu-ataque/
# Criar template HTML customizado

# Estrutura básica:
# config.ini — configuração do cenário
# index.html — página de phishing
# static/ — arquivos estáticos (CSS, JS, imagens)`} />
    </PageContainer>
  );
}
