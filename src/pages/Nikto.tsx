import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Nikto() {
  return (
    <PageContainer
      title="Nikto"
      subtitle="Scanner de vulnerabilidades em servidores web — rápido e direto ao ponto."
      difficulty="iniciante"
      timeToRead="5 min"
    >
      <h2>O que é o Nikto?</h2>
      <p>
        O <strong>Nikto</strong> é um scanner de servidores web open source que verifica mais de 6.700 arquivos e 
        programas potencialmente perigosos, versões desatualizadas de software, configurações incorretas 
        e problemas específicos de servidores. É uma ferramenta de reconhecimento ativo.
      </p>

      <h2>Uso básico</h2>
      <CodeBlock language="bash" code={`# Scan básico
nikto -h http://192.168.1.1
nikto -h http://alvo.com

# HTTPS
nikto -h https://alvo.com
nikto -h alvo.com -ssl

# Porta específica
nikto -h alvo.com -p 8080
nikto -h 192.168.1.1 -p 443 -ssl

# Múltiplos hosts (arquivo)
nikto -h hosts.txt`} />

      <h2>Opções comuns</h2>
      <CodeBlock language="bash" code={`# Salvar resultado
nikto -h http://alvo.com -o resultado.txt
nikto -h http://alvo.com -o resultado.html -Format html
nikto -h http://alvo.com -o resultado.xml -Format xml

# Usar proxy (Burp Suite)
nikto -h http://alvo.com -useproxy http://127.0.0.1:8080

# Com autenticação
nikto -h http://alvo.com -id admin:senha

# Cookie de sessão
nikto -h http://alvo.com -cookies "PHPSESSID=abc123"

# Evasão de IDS
nikto -h http://alvo.com -evasion 1     # aleatório maiúsc/minúsc URL
nikto -h http://alvo.com -evasion 2     # diretório duplo
nikto -h http://alvo.com -evasion 3     # reverse traversal
# 1-9 disponíveis, combinações com vírgula: -evasion 1,6

# Limite de tempo
nikto -h http://alvo.com -maxtime 120   # 2 minutos máximo`} />

      <h2>O que o Nikto detecta</h2>
      <div className="space-y-2 my-6">
        {[
          "Arquivos e diretórios perigosos (shell.php, .htpasswd, admin/)",
          "Software desatualizado (Apache, IIS, Nginx, PHP, WordPress)",
          "Configurações incorretas (directory listing, métodos HTTP inseguros)",
          "Problemas de headers HTTP (falta de X-Frame-Options, CSP, HSTS)",
          "Arquivos de backup e configuração expostos (.bak, .conf, .sql)",
          "Vulnerabilidades conhecidas de versões específicas (CVEs)",
          "Credenciais padrão em interfaces web",
          "CGI e scripts perigosos",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-1">•</span>
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      <h2>Interpretando resultados</h2>
      <CodeBlock language="bash" code={`# Exemplo de saída do Nikto:
# - Target: 192.168.1.1:80
# - Start Time: 2024-01-01 10:00:00
#
# + Server: Apache/2.4.7 (Ubuntu)
# + /: The anti-clickjacking X-Frame-Options header is not present.
# + /phpMyAdmin/: phpMyAdmin directory found
# + /backup/: Directory indexing found.
# + /admin/config.php: PHP Config file may contain database IDs and passwords.
# + Apache/2.4.7 appears to be outdated (current is at least Apache/2.4.54).
# + /test.php: This might be interesting.
# + 6544 requests: 0 error(s) and 8 item(s) reported`} />

      <AlertBox type="info" title="Nikto é ruidoso">
        O Nikto envia muitas requisições e é facilmente detectado por IDS/WAF. 
        Para scans mais discretos, prefira o Gobuster ou ferramenta de crawling 
        com menor footprint. Use Nikto no reconhecimento inicial.
      </AlertBox>

      <h2>Combinando com outras ferramentas</h2>
      <CodeBlock language="bash" code={`# Fluxo recomendado de recon web:
# 1. Nmap para descobrir serviços web
nmap -sV -p 80,443,8080,8443 alvo.com

# 2. Nikto para scan rápido de vulnerabilidades
nikto -h http://alvo.com -o nikto_result.txt

# 3. Gobuster para enumeração de diretórios
gobuster dir -u http://alvo.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# 4. Burp Suite para análise manual profunda
burpsuite`} />
    </PageContainer>
  );
}
