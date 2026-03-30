import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function ZapProxy() {
    return (
      <PageContainer
        title="OWASP ZAP — Scanner Web Gratuito"
        subtitle="Alternativa gratuita e poderosa ao Burp Suite para identificar vulnerabilidades em aplicações web."
        difficulty="intermediario"
        timeToRead="10 min"
      >
        <AlertBox type="info" title="100% gratuito e open-source">
          ZAP (Zed Attack Proxy) é mantido pela OWASP e é completamente gratuito,
          diferente do Burp Suite Pro. Excelente para iniciantes e profissionais.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# No Kali Linux\nsudo apt install zaproxy -y\n\n# Ou baixar diretamente:\n# https://www.zaproxy.org/download/\n\n# Iniciar GUI\nzaproxy &\n\n# Modo headless (automação)\nzap.sh -daemon -port 8090 -host 127.0.0.1'} />

        <h2>Proxy Interceptador</h2>
        <CodeBlock language="bash" code={'# ZAP funciona como proxy entre seu browser e o alvo\n\n# 1. Configurar ZAP para ouvir na porta 8080\n# ZAP > Tools > Options > Local Proxies > Port: 8080\n\n# 2. Configurar browser para usar o proxy\n# Firefox: Configurações > Proxy > Manual\n#   HTTP Proxy: 127.0.0.1  Porta: 8080\n\n# 3. Instalar certificado ZAP (para HTTPS)\n# ZAP > Tools > Options > Dynamic SSL Certificates\n# Exportar e importar no Firefox\n\n# 4. Navegar no site alvo\n# O ZAP intercepta e registra todo o tráfego'} />

        <h2>Spider e Active Scan</h2>
        <CodeBlock language="bash" code={'# Spider (descobrir URLs)\n# Clicar com botão direito no site → Attack → Spider\n# Ou: ZAP > Tools > Spider\n\n# Active Scan (encontrar vulnerabilidades)\n# Após spider, clicar com botão direito → Attack → Active Scan\n# ZAP testará automaticamente:\n# - SQL Injection\n# - XSS\n# - Path Traversal\n# - Buffer Overflow\n# - e muito mais\n\n# Linha de comando (automação)\nzap-cli start\nzap-cli open-url https://alvo.com\nzap-cli spider https://alvo.com\nzap-cli active-scan https://alvo.com\nzap-cli report -o relatorio.html -f html'} />

        <h2>API Rest do ZAP</h2>
        <CodeBlock language="bash" code={'# ZAP tem API REST completa para automação\n\n# Iniciar com API habilitada\nzap.sh -daemon -port 8090 -config api.key=minha-chave\n\n# Usar a API\ncurl "http://127.0.0.1:8090/JSON/spider/action/scan/?apikey=minha-chave&url=https://alvo.com"\ncurl "http://127.0.0.1:8090/JSON/ascan/action/scan/?apikey=minha-chave&url=https://alvo.com"\ncurl "http://127.0.0.1:8090/JSON/alert/view/alerts/?apikey=minha-chave"\n\n# Integrar em CI/CD\npython3 zap-scan.py  # usar python-owasp-zap-v2.4'} />

        <h2>ZAP vs Burp Suite</h2>
        <CodeBlock language="bash" code={'# ZAP:\n# ✅ Gratuito e open-source\n# ✅ Ótimo para automação e CI/CD\n# ✅ Active scanning gratuito\n# ✅ API REST completa\n# ❌ Interface menos polida\n# ❌ Menos extensões que Burp\n\n# Burp Suite Community:\n# ✅ Interface excelente\n# ✅ Intruder básico gratuito\n# ✅ Extensões (Burp BApp Store)\n# ❌ Active Scan apenas no Pro (US$ 449/ano)\n# ❌ Intruder gratuito muito lento\n\n# Recomendação:\n# Aprenda os dois! Burp para análise manual e ZAP para automação'} />

        <AlertBox type="success" title="PortSwigger Academy — aprender Burp/web sec">
          Mesmo sendo focada no Burp Suite, a PortSwigger Academy (https://portswigger.net/web-security)
          é o melhor recurso GRATUITO para aprender segurança web. Tem labs práticos para cada
          vulnerabilidade do OWASP Top 10 e muito mais.
        </AlertBox>
      </PageContainer>
    );
  }
  