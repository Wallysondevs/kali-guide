import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Burpsuite() {
  return (
    <PageContainer
      title="Burp Suite"
      subtitle="A ferramenta definitiva para teste de segurança em aplicações web."
      difficulty="intermediario"
      timeToRead="12 min"
    >
      <h2>O que é o Burp Suite?</h2>
      <p>
        O <strong>Burp Suite</strong> é uma plataforma integrada para testes de segurança em aplicações web. 
        Desenvolvido pela PortSwigger, é a ferramenta padrão da indústria para pentesters web. 
        Existe em versão Community (gratuita) e Professional (paga).
      </p>

      <h2>Iniciando o Burp Suite</h2>
      <CodeBlock language="bash" code={`# Iniciar o Burp Suite
burpsuite

# Ou via menu de aplicativos:
# Kali → Web Application Analysis → Burp Suite`} />

      <h2>Módulos principais</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { name: "Proxy", desc: "Intercepta e modifica requisições HTTP/S entre browser e servidor" },
          { name: "Repeater", desc: "Reenvia e modifica requisições manualmente para testar comportamentos" },
          { name: "Intruder", desc: "Automatiza ataques com payloads (fuzzing, brute force)" },
          { name: "Scanner", desc: "Escaneia automaticamente vulnerabilidades (Pro)" },
          { name: "Decoder", desc: "Codifica/decodifica dados (Base64, URL, HTML, Hex)" },
          { name: "Comparer", desc: "Compara duas respostas HTTP lado a lado" },
          { name: "Sequencer", desc: "Analisa aleatoriedade de tokens de sessão" },
          { name: "Extender", desc: "Instala extensões (BApp Store)" },
        ].map((mod, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="font-bold text-primary text-sm mb-1">{mod.name}</div>
            <p className="text-xs text-muted-foreground">{mod.desc}</p>
          </div>
        ))}
      </div>

      <h2>Configurando o Proxy</h2>
      <p>O Burp funciona como um proxy intermediário. Configure seu browser para usá-lo:</p>
      <CodeBlock language="bash" code={`# 1. Burp Suite → Proxy → Options
# Listening on: 127.0.0.1:8080 (padrão)

# 2. Configurar browser (Firefox):
# Preferências → Rede → Configurações → Manual proxy:
# HTTP Proxy: 127.0.0.1  Porta: 8080
# Also use this proxy for HTTPS: marcado

# 3. Instalar certificado CA do Burp (para HTTPS):
# Com proxy configurado, acesse: http://burpsuite
# Baixe e instale o certificado no Firefox:
# Preferências → Privacidade → Ver Certificados → Importar

# Usando FoxyProxy (extensão Firefox) — mais prático
# Adicione perfil "Burp" com 127.0.0.1:8080 e alterne facilmente`} />

      <h2>Interceptando requisições</h2>
      <CodeBlock language="bash" code={`# No Burp Suite → Proxy → Intercept
# Clique "Intercept is on" para interceptar

# Exemplo de requisição capturada:
# POST /login HTTP/1.1
# Host: alvo.com
# Content-Type: application/x-www-form-urlencoded
# 
# username=admin&password=teste123

# Modificar e enviar: clique "Forward"
# Dropar requisição: clique "Drop"
# Enviar para Repeater: botão direito → "Send to Repeater"
# Enviar para Intruder: botão direito → "Send to Intruder"`} />

      <h2>Repeater — Testando manualmente</h2>
      <CodeBlock language="bash" code={`# No Repeater:
# 1. Receba a requisição do Proxy
# 2. Modifique o que quiser
# 3. Clique "Send"
# 4. Analise a resposta

# Exemplo - testando SQL Injection manualmente:
# username=admin'--&password=qualquer
# username=' OR '1'='1&password=qualquer
# username=admin&password=1' OR '1'='1

# Testando XSS:
# username=<script>alert(1)</script>
# username=<img src=x onerror=alert(1)>`} />

      <h2>Intruder — Ataques automatizados</h2>
      <CodeBlock language="bash" code={`# Tipos de ataque no Intruder:
# Sniper: um payload em uma posição (brute force simples)
# Battering Ram: mesmo payload em múltiplas posições
# Pitchfork: payloads diferentes em posições diferentes (credenciais)
# Cluster Bomb: combinação de todos os payloads (senha spray)

# Configuração para brute force de login:
# 1. Capture requisição de login
# 2. Send to Intruder
# 3. Marque posições: username=§admin§&password=§senha§
# 4. Ataque: Cluster Bomb
# 5. Payload set 1: lista de usuários
# 6. Payload set 2: rockyou.txt (wordlist)
# 7. Start Attack!

# Na Community Edition: sem throttle, mas mais lento
# Na Pro: muito mais rápido e com mais opções`} />

      <h2>Extensões essenciais (BApp Store)</h2>
      <CodeBlock language="bash" code={`# Extensões gratuitas do BApp Store (Extender → BApp Store):

# Active Scan++ — melhora o scanner automático
# Autorize — testa controle de acesso/IDOR
# JWT Editor — modifica tokens JWT
# Hackvertor — transformações e encoding
# Logger++ — log avançado de requisições
# Turbo Intruder — intruder extremamente rápido (Python)
# HTTP Request Smuggler — detecta smuggling
# param miner — descobre parâmetros ocultos
# CORS* — detecta misconfiguração CORS`} />

      <h2>Vulnerabilidades comuns para testar</h2>
      <CodeBlock language="bash" code={`# SQL Injection (no Repeater/Intruder)
' OR '1'='1
' UNION SELECT NULL--
admin'--
1; DROP TABLE users--

# XSS Refletido
<script>alert('XSS')</script>
<img src=x onerror=alert(document.cookie)>
"><svg onload=alert(1)>

# IDOR (Insecure Direct Object Reference)
GET /api/user/1/profile → trocar para /api/user/2/profile

# SSRF (Server-Side Request Forgery)
url=http://169.254.169.254/latest/meta-data/   # AWS metadata
url=http://127.0.0.1:8080/admin

# Verificar JWT
# No Decoder: decodifique o token Base64
# Tente alg:none attack, trocar alg RS256 por HS256`} />

      <AlertBox type="info" title="Aprenda mais: PortSwigger Web Security Academy">
        A PortSwigger oferece um laboratório gratuito com centenas de desafios práticos em 
        <strong> portswigger.net/web-security</strong> — o melhor recurso para aprender pentest web.
      </AlertBox>
    </PageContainer>
  );
}
