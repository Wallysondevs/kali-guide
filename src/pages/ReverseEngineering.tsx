import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ReverseEngineering() {
  return (
    <PageContainer
      title="Engenharia Reversa — Fundamentos"
      subtitle="Introdução à engenharia reversa de binários: análise estática, dinâmica, Ghidra, radare2 e técnicas de disassembly."
      difficulty="avancado"
      timeToRead="20 min"
    >
      <h2>O que é Engenharia Reversa?</h2>
      <p>
        Engenharia reversa é o processo de analisar software compilado para entender seu funcionamento
        sem ter acesso ao código-fonte. Em segurança, é usado para análise de malware, pesquisa de
        vulnerabilidades e CTFs.
      </p>

      <h2>Análise Inicial</h2>
      <CodeBlock
        title="Identificar o binário"
        code={`# Tipo de arquivo
file binary
# binary: ELF 64-bit LSB executable, x86-64, dynamically linked

# Strings legíveis
strings binary | head -50
strings binary | grep -i "password\\|flag\\|key\\|secret"

# Informações do ELF
readelf -h binary          # Header
readelf -S binary          # Seções
readelf -l binary          # Segmentos
readelf -d binary          # Dependências dinâmicas

# Verificar proteções
checksec --file=binary
# RELRO: Full
# Stack Canary: found
# NX: enabled
# PIE: enabled
# ASLR: enabled

# Bibliotecas linkadas
ldd binary

# Syscalls
ltrace ./binary            # Library calls
strace ./binary            # System calls`}
      />

      <h2>Ghidra — Disassembler/Decompiler</h2>
      <CodeBlock
        title="Análise com Ghidra"
        code={`# Instalar Ghidra (já vem no Kali)
sudo apt install ghidra

# Iniciar
ghidra

# Workflow:
# 1. File → New Project
# 2. Import File → selecionar binário
# 3. Analyze → Auto-analyze (aceitar defaults)
# 4. Navegar pelo código

# Janelas importantes:
# - Listing: código assembly
# - Decompiler: código C reconstruído
# - Symbol Tree: funções e variáveis
# - Data Type Manager: tipos de dados

# Atalhos úteis:
# G        — Go to address
# L        — Label/rename
# ;        — Add comment
# Ctrl+E   — Edit function signature
# X        — Cross-references (xrefs)

# Dicas:
# - Comece pela main()
# - Renomeie variáveis e funções
# - Procure por strings interessantes
# - Siga cross-references`}
      />

      <h2>radare2 — Análise via Terminal</h2>
      <CodeBlock
        title="Usar radare2"
        code={`# Instalar
sudo apt install radare2

# Abrir binário
r2 -A binary               # Abrir com análise automática
# -A = analyze all

# Comandos básicos
afl                         # Listar funções
pdf @ main                  # Disassembly da main
axt @ sym.func              # Cross-references to
axf @ sym.func              # Cross-references from
iz                          # Strings na seção data
izz                         # Todas as strings
s main                      # Seek para main
V                           # Visual mode
VV                          # Graph mode

# Debugging com r2
r2 -d binary                # Abrir em modo debug
db main                     # Breakpoint na main
dc                          # Continue
ds                          # Step
dso                         # Step over
dr                          # Show registers
px 32 @ rsp                 # Print hex 32 bytes no stack

# Cutter — GUI do radare2
sudo apt install cutter
cutter binary`}
      />

      <h2>GDB — Debugging</h2>
      <CodeBlock
        title="Análise dinâmica com GDB"
        code={`# GDB com extensão pwndbg ou gef
sudo apt install gdb
pip install pwndbg
# Ou: pip install gef

# Iniciar debugging
gdb ./binary

# Com pwndbg/gef:
gdb -q ./binary

# Comandos essenciais
(gdb) break main              # Breakpoint
(gdb) run                     # Executar
(gdb) run arg1 arg2           # Com argumentos
(gdb) next                    # Próxima linha (step over)
(gdb) step                    # Step into
(gdb) continue                # Continuar
(gdb) info registers          # Ver registradores
(gdb) x/20wx $rsp             # Examinar stack (20 words hex)
(gdb) x/s 0xaddress           # Examinar como string
(gdb) disassemble main        # Disassembly
(gdb) set {int}0xaddr = 1337  # Modificar memória
(gdb) print variable           # Ver variável

# Breakpoint condicional
(gdb) break *0x401234 if $rax == 0x41
(gdb) watch *0xaddress        # Data breakpoint

# Examinar formato
(gdb) x/10i $rip              # 10 instruções
(gdb) x/20bx $rsp             # 20 bytes em hex
(gdb) x/4gx $rsp              # 4 quadwords em hex`}
      />

      <h2>Aplicação em CTFs</h2>
      <CodeBlock
        title="Padrões comuns em CTFs"
        code={`# 1. Verificação de senha/flag
# Procurar strcmp, strncmp, memcmp
strings binary | grep -i flag
r2 -A binary -c 'afl~cmp'

# 2. XOR encoding
# Procurar loops com XOR
# Em Ghidra: buscar por ^ (XOR operator) no decompiler

# 3. Angr — solver automático
pip install angr
python3 << 'PYEOF'
import angr
proj = angr.Project('./binary')
state = proj.factory.entry_state()
simgr = proj.factory.simgr(state)
simgr.explore(find=0x401234, avoid=0x401200)
if simgr.found:
    print(simgr.found[0].posix.dumps(0))  # stdin
PYEOF

# 4. Patching de binário
# Em r2:
r2 -w binary                 # Abrir para escrita
s 0x401234                   # Ir para o endereço
wa nop                       # Escrever NOP
wa jmp 0x401300              # Mudar jump`}
      />
    </PageContainer>
  );
}
