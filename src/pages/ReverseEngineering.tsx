import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ReverseEngineering() {
  return (
    <PageContainer
      title="Engenharia Reversa — Análise de Binários"
      subtitle="Fundamentos de engenharia reversa com Ghidra, radare2, GDB e ltrace. Inclui análise estática e dinâmica, identificação de vulnerabilidades em binários, e bypass de proteções."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>O que é Engenharia Reversa?</h2>
      <p>
        <strong>Engenharia reversa</strong> é o processo de analisar um programa compilado (binário)
        para entender seu funcionamento interno sem acesso ao código-fonte. Em pentest, é usada para:
        encontrar vulnerabilidades em software (buffer overflow, format string), analisar malware,
        entender protocolos proprietários, e bypass de proteções (serial key, DRM, anti-cheat).
      </p>

      <h2>Ferramentas Essenciais</h2>
      <CodeBlock
        title="Instalar e configurar as principais ferramentas"
        code={`# ═══════════════════════════════════════════════════
# GHIDRA — Disassembler/Decompiler (NSA)
# ═══════════════════════════════════════════════════
# Ghidra é GRATUITO, poderoso, e possui decompiler
# (converte assembly → pseudo-C legível!)
sudo apt install ghidra
# Ou baixar: https://ghidra-sre.org/

# Iniciar:
ghidra &
# 1. File → New Project → (nome) → OK
# 2. File → Import File → selecionar binário
# 3. Analisar automaticamente (Yes)
# 4. Double-click no programa → abre Code Browser
#
# Interface do Code Browser:
# ┌──────┬──────────────┬────────────────┐
# │ Left │   Center     │     Right      │
# │      │              │                │
# │Symbol│ Listing      │ Decompiler     │
# │Tree  │ (Assembly)   │ (Pseudo-C)     │
# │      │              │                │
# │Func  │ 0040120a MOV │ void main() {  │
# │List  │ 0040120f CALL│   if (x == 5)  │
# │      │ 00401214 CMP │     system(cmd)│
# └──────┴──────────────┴────────────────┘
# Esquerda: lista de funções e símbolos
# Centro: código assembly (disassembly)
# Direita: código C decompilado (Ghidra gera automaticamente!)

# ═══════════════════════════════════════════════════
# RADARE2 — Disassembler de linha de comando
# ═══════════════════════════════════════════════════
sudo apt install radare2

# Abrir binário para análise:
r2 -A programa
# -A = analisar automaticamente (funções, refs, etc.)

# Comandos essenciais do r2:
# afl         = listar todas as funções encontradas
# afl~main    = buscar função "main"
# s main      = ir para a função main
# pdf         = print disassembly da função atual
# pdf @main   = disassembly da main
# axt main    = quem chama main? (cross-references TO)
# axf main    = o que main chama? (cross-references FROM)
# iz          = listar todas as strings
# iz~password = buscar strings com "password"
# px 100      = hexdump de 100 bytes na posição atual
# V           = modo visual (interface TUI)
# VV          = modo visual de grafos (fluxo de controle)
# q           = sair

# ═══════════════════════════════════════════════════
# GDB — Debugger
# ═══════════════════════════════════════════════════
sudo apt install gdb gdb-peda
# gdb-peda = plugin que melhora o GDB com cores e comandos extras

# Iniciar debug:
gdb ./programa

# Comandos GDB essenciais:
# run (r)             = executar o programa
# break main (b main) = breakpoint na função main
# break *0x401234     = breakpoint no endereço
# continue (c)        = continuar execução até próximo break
# next (n)            = executar próxima instrução (step over)
# step (s)            = executar próxima instrução (step into)
# info registers (i r)= mostrar todos os registradores
# x/20x $rsp          = examinar 20 words na stack (hex)
# x/s 0x401234        = examinar como string
# print $rax          = ver valor do registrador RAX
# disas main          = disassembly da main
# set {int}0x601040=5 = escrever valor na memória
# quit (q)            = sair

# ═══════════════════════════════════════════════════
# FERRAMENTAS AUXILIARES
# ═══════════════════════════════════════════════════

# file — identificar tipo de binário:
file programa
# programa: ELF 64-bit LSB executable, x86-64, dynamically linked
# ELF = formato Linux | PE = formato Windows | Mach-O = macOS
# 64-bit = arquitetura | dynamically linked = usa libs externas

# strings — extrair strings do binário:
strings programa | grep -i "pass\\|flag\\|key\\|secret\\|admin"
# Encontra strings hardcoded como senhas e flags!
# Em CTFs, a flag pode estar literalmente nas strings!

# ltrace — monitorar chamadas de biblioteca:
ltrace ./programa
# Mostra CADA chamada de função de biblioteca:
# strcmp("input", "senha_secreta") = 0
# ↑ strcmp compara duas strings — a "senha_secreta" é revelada!

# strace — monitorar chamadas de sistema:
strace ./programa
# Mostra chamadas ao kernel: open, read, write, connect, etc.
# Útil para ver quais arquivos o programa acessa

# objdump — disassembly rápido:
objdump -d programa | less
# -d = disassemble
# Menos poderoso que r2/Ghidra, mas rápido para olhar`}
      />

      <h2>Análise Estática — Passo a Passo</h2>
      <CodeBlock
        title="Metodologia de análise estática com exemplos"
        code={`# ═══════════════════════════════════════════════════
# PASSO 1: Informações básicas
# ═══════════════════════════════════════════════════
file programa              # Tipo, arquitetura, linkage
checksec --file=programa    # Proteções habilitadas:
# RELRO:    Full RELRO       (protege GOT/PLT)
# Stack:    Canary found      (stack canary — protege stack)
# NX:       NX enabled        (stack não-executável)
# PIE:      PIE enabled       (endereços randomizados)
# ↑ Quanto mais proteções, mais difícil de explorar

# PASSO 2: Strings interessantes
strings programa | grep -iE "pass|flag|key|secret|admin|root|login|http|sql"

# PASSO 3: Importações (funções de biblioteca usadas)
objdump -T programa   # Funções importadas (dynamic symbols)
# Funções perigosas que indicam vulnerabilidades:
# gets()        → buffer overflow GARANTIDO (sem limit check)
# strcpy()      → buffer overflow (sem size check)
# sprintf()     → buffer overflow
# scanf("%s")   → buffer overflow
# printf(input) → format string vulnerability
# system()      → command injection se input não sanitizado
# exec*()       → command injection

# PASSO 4: Abrir no Ghidra e focar em:
# - Função main() → entender o fluxo principal
# - Chamadas a gets/strcpy/system → vulnerabilidades
# - Comparações de strings → senhas/flags hardcoded
# - Funções que processam input do usuário`}
      />

      <h2>Análise Dinâmica com GDB</h2>
      <CodeBlock
        title="Debugar binários e encontrar vulnerabilidades"
        code={`# ═══════════════════════════════════════════════════
# EXEMPLO: Bypass de verificação de senha
# ═══════════════════════════════════════════════════

# Programa hipotético que pede senha:
# $ ./crackme
# Enter password: teste
# Wrong password!

# No GDB:
gdb ./crackme
(gdb) break main
(gdb) run
# Executa até main()

(gdb) disas main
# Procurar por instruções de comparação (cmp, test)
# e saltos condicionais (je, jne, jz, jnz)
# Ex:
#   0x40120a: call strcmp      ← compara strings
#   0x40120f: test eax, eax   ← resultado da comparação
#   0x401211: jne 0x401230    ← se NÃO igual, pula para "Wrong"
#   0x401213: ...             ← se igual, continua para "Correct"

# Opção 1: Descobrir a senha
(gdb) break *0x40120a        # Break ANTES do strcmp
(gdb) run
# Enter password: AAAA
# Breakpoint hit!
(gdb) x/s $rsi              # Segundo argumento do strcmp
# 0x402010: "s3cr3t_p4ss!"   ← A SENHA!

# Opção 2: Bypass sem saber a senha
(gdb) break *0x401211        # Break no JNE (salto condicional)
(gdb) run
# Enter password: qualquer
(gdb) set $eflags = 0x246    # Setar zero flag → JNE não salta
(gdb) continue
# "Correct password!"        ← Bypass sem saber a senha!

# Alternativa: mudar o salto
(gdb) set *(unsigned char*)0x401211 = 0x74
# Muda JNE (0x75) para JE (0x74) → lógica invertida

# ═══════════════════════════════════════════════════
# BUFFER OVERFLOW BÁSICO
# ═══════════════════════════════════════════════════

# Programa vulnerável:
# void vuln() {
#   char buf[64];
#   gets(buf);    ← buffer overflow! Sem limit check
# }

# 1. Encontrar o offset para sobrescrever RIP:
# Gerar pattern:
python3 -c "from pwn import *; print(cyclic(200))" | ./programa
# Segfault! GDB mostra o valor de RIP sobrescrito.

# 2. Calcular offset:
python3 -c "from pwn import *; print(cyclic_find(0x61616168))"
# → 72 (significa que 72 bytes até chegar ao RIP)

# 3. Criar exploit:
python3 -c "
from pwn import *
buf  = b'A' * 72              # Preencher buffer
buf += p64(0x00401156)         # Endereço da função win()
print(buf.decode('latin-1'))
" | ./programa
# Sobrescreve RIP com endereço da função desejada!`}
      />

      <h2>Proteções de Binários e Bypass</h2>
      <CodeBlock
        title="Entender e contornar proteções modernas"
        code={`# ═══════════════════════════════════════════════════
# PROTEÇÕES COMUNS
# ═══════════════════════════════════════════════════

# 1. Stack Canary (Stack Cookie)
# Valor aleatório colocado entre variáveis locais e RIP
# Se o canary é sobrescrito (buffer overflow) → programa aborta
# Bypass: leak do canary via format string ou info disclosure

# 2. NX (No-Execute) / DEP (Data Execution Prevention)
# Stack e heap NÃO são executáveis
# Não pode injetar shellcode na stack e executar
# Bypass: ROP (Return-Oriented Programming) — usar gadgets
# do próprio código para construir execução

# 3. ASLR (Address Space Layout Randomization)
# Endereços de stack, heap, e libs são randomizados a cada execução
# Não pode hardcodar endereços no exploit
# Bypass: info leak para descobrir endereço base, ret2plt

# 4. PIE (Position Independent Executable)
# Código do programa também é randomizado (não só libs)
# Bypass: info leak do endereço do programa

# 5. RELRO (Relocation Read-Only)
# Partial: GOT é writable (pode sobrescrever entradas GOT)
# Full: GOT é read-only após carregamento (mais seguro)

# Verificar proteções:
checksec --file=programa
# RELRO:    Partial RELRO
# Stack:    No canary found     ← SEM proteção de stack!
# NX:       NX enabled
# PIE:      No PIE              ← Endereços fixos!

# ═══════════════════════════════════════════════════
# ROP (Return-Oriented Programming) — Conceito
# ═══════════════════════════════════════════════════
# Quando NX está habilitado, não pode executar shellcode na stack.
# Solução: usar "gadgets" — pequenos trechos de código que
# terminam em RET, já existentes no binário.
#
# Cada gadget faz UMA operação:
# pop rdi; ret    → coloca valor da stack em RDI
# pop rsi; ret    → coloca valor em RSI
# ret             → retorna para o próximo endereço na stack
#
# Encadeando gadgets na stack, pode-se:
# 1. Colocar "/bin/sh" em RDI (primeiro argumento)
# 2. Chamar system() com RDI apontando para "/bin/sh"
# → system("/bin/sh") → shell!

# Encontrar gadgets:
ROPgadget --binary programa --ropchain
# Encontra gadgets E sugere ROP chain automaticamente!

# Com ropper:
ropper --file programa --search "pop rdi; ret"
# Busca gadgets específicos`}
      />
    </PageContainer>
  );
}
