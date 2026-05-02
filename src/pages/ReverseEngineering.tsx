import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ReverseEngineering() {
  return (
    <PageContainer
      title="Engenharia reversa"
      subtitle="ELF/PE, file/strings, Ghidra, radare2, gdb-pwndbg, IDA Free, decompiladores. Análise estática + dinâmica."
      difficulty="avancado"
      timeToRead="20 min"
      prompt="re/main"
    >
      <h2>Triagem inicial — sempre nessa ordem</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "file challenge",
            out: `challenge: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=abc..., for GNU/Linux 3.2.0, not stripped, with debug_info`,
            outType: "info",
          },
          {
            comment: "informações: 64-bit, dinâmico, NÃO stripped, debug INFO presente. JÚNIA!",
            cmd: "checksec --file=challenge",
            out: `RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols       FORTIFY  Fortified   Fortifiable  FILE
Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   122 Symbols   Yes      0          1            challenge`,
            outType: "warning",
          },
          {
            cmd: "strings -n 8 challenge | head -30",
            out: `/lib64/ld-linux-x86-64.so.2
__libc_start_main
__cxa_finalize
__libc_start_main@GLIBC_2.34
puts
fgets
strcmp
stdin
GLIBC_2.34
GLIBC_2.2.5
challenge.c
Welcome to the challenge!
Enter the secret password: 
S3cr3t_P@ss_2026!         ← BINGO!
ACCESS GRANTED!
Wrong password.
[ANSI X3.4-1968]
GNU C99 11.4.0`,
            outType: "success",
          },
        ]}
      />

      <h2>Caso 1 — Strings achou (challenge fácil)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "./challenge",
            out: `Welcome to the challenge!
Enter the secret password: S3cr3t_P@ss_2026!
ACCESS GRANTED!`,
            outType: "success",
          },
          {
            cmd: "echo 'lesson: SEMPRE rode strings antes de Ghidra'",
            out: "(50% dos challenges easy se resolvem em strings + grep)",
            outType: "muted",
          },
        ]}
      />

      <h2>Caso 2 — Strings ofuscado</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "./crackme2",
            out: `Welcome.
> teste
WRONG`,
            outType: "muted",
          },
          {
            cmd: "strings crackme2 | grep -iE 'pass|secret|flag|key' | head",
            out: "(silencioso — ofuscado)",
            outType: "default",
          },
          {
            comment: "abrir no radare2",
            cmd: "r2 -A crackme2",
            out: `[Cannot find function 'entry0'] Analysis: aaaa
[x] Analyze all flags starting with sym. and entry0 (aa)
[x] Analyze function calls (aac)
[x] Analyze len bytes of instructions for references (aar)
[x] Type matching analysis for all functions (aaft)
[x] Use -AA or aaaa to perform additional experimental analysis
 -- Take a look at /etc/radarerc to set startup commands
[0x000010e0]> `,
            outType: "info",
          },
          {
            cmd: "(r2) afl | head",
            out: `0x000010e0    1     46 entry0
0x00001120    4     49 sym.deregister_tm_clones
0x00001160    4     66 sym.register_tm_clones
0x000011a0    5     58 sym.__do_global_dtors_aux
0x000011e0    1     19 entry.init0
0x00001050    1     11 sym.imp.printf
0x00001260   10    342 sym.main
0x00001500    3    142 sym.check_password    ← interessante!
0x000015a0    1    214 sym.deobfuscate       ← deobfuscate!`,
            outType: "warning",
          },
          {
            cmd: "(r2) pdf @sym.deobfuscate",
            out: `;-- sym.deobfuscate:
0x000015a0      55             push rbp
0x000015a1      4889e5         mov rbp, rsp
0x000015a4      48897df8       mov qword [rbp - 8], rdi
0x000015a8      c745f4000000   mov dword [rbp - 0xc], 0
0x000015af      eb22           jmp 0x15d3
;  loop XOR cada byte com 0x42
0x000015b1      488b45f8       mov rax, qword [rbp - 8]
0x000015b5      8b55f4         mov edx, dword [rbp - 0xc]
0x000015b8      4863d2         movsxd rdx, edx
0x000015bb      4801c2         add rdx, rax
0x000015be      0fb602         movzx eax, byte [rdx]
0x000015c1      83f042         xor eax, 0x42                   ← XOR com 0x42!
0x000015c4      8802           mov byte [rdx], al`,
            outType: "info",
          },
          {
            cmd: "(r2) iz | head -20",
            out: `nth paddr      vaddr      len size section type  string
000 0x00002008 0x00002008  16  17 .rodata ascii Welcome.\\n
001 0x00002019 0x00002019   3   4 .rodata ascii > 
002 0x0000201d 0x0000201d  18  19 .rodata ascii \\x00#52#08&PA0,4 ← string XORada!
003 0x00002030 0x00002030   6   7 .rodata ascii WRONG\\n
004 0x00002037 0x00002037   8   9 .rodata ascii CORRECT\\n`,
            outType: "warning",
          },
          {
            comment: "deobfuscar manualmente em python",
            cmd: 'python3 -c "print(\'\'.join(chr(b ^ 0x42) for b in bytes.fromhex(\'003352300853265041303234\')))"',
            out: `Bs0pJ\\x18d\\x12brv     ← errado, faltou tirar bytes finais`,
            outType: "muted",
          },
          {
            comment: "ver o blob exato no .rodata e xor",
            cmd: "(r2) px 16 @0x0000201d",
            out: `- offset -   0 1  2 3  4 5  6 7  8 9  A B  C D  E F  0123456789ABCDEF
0x0000201d  0033 5230 0853 2650 4130 3234 0000 0000  .3R0.S&PA024....`,
            outType: "info",
          },
          {
            cmd: 'python3 -c "data=bytes([0x00,0x33,0x52,0x30,0x08,0x53,0x26,0x50,0x41,0x30,0x32,0x34]); print(\'\'.join(chr(b ^ 0x42) for b in data))"',
            out: `\\x42qpr\\x4aP12345678`,
            outType: "muted",
          },
          {
            comment: "alternativa: ver diretamente em runtime — gdb breakpoint após deobfuscate",
            cmd: "gdb ./crackme2 -ex 'break *deobfuscate+98' -ex run -ex 'x/20s $rdi' -ex quit",
            out: `Breakpoint 1, 0x0000555555555610 in deobfuscate ()
0x55555555803d:  "Br1lh4nt3M1nd!"           ← password real!`,
            outType: "success",
          },
          {
            cmd: "./crackme2",
            out: `Welcome.
> Br1lh4nt3M1nd!
CORRECT`,
            outType: "success",
          },
        ]}
      />

      <h2>Ghidra — decompilação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ghidra &",
            out: "(GUI Java abre. Workflow:)",
            outType: "muted",
          },
          {
            cmd: "echo 'workflow Ghidra'",
            out: `1. File → New Project → Non-Shared
2. File → Import File → seu binário
3. Duplo click → CodeBrowser
4. Auto-analyze (default options) → 10s-2min
5. Symbol Tree → Functions → main → duplo click
6. Painel direito = decompile DECENTE em C
7. Edite var/func names (L = rename) — anote o que descobre`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="c"
        title="Ghidra decompile do crackme2 — main()"
        code={`undefined8 main(void)
{
  long lVar1;
  char input [128];
  
  setvbuf(stdout,NULL,2,0);
  puts("Welcome.");
  printf("> ");
  fgets(input,128,stdin);
  input[strcspn(input,"\\n")] = '\\0';
  
  // deobfuscate copia static + xor cada byte com 0x42
  char password [16];
  memcpy(password, &DAT_00002030 /* 003352300853265041303234 */, 12);
  for (int i = 0; i < 12; i++) {
    password[i] ^= 0x42;     // ← XOR
  }
  password[12] = '\\0';
  
  if (strcmp(input, password) == 0) {
    puts("CORRECT");
    return 0;
  }
  puts("WRONG");
  return 1;
}`}
      />

      <h2>gdb-pwndbg — análise dinâmica</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "gdb ./crackme2",
            out: `pwndbg: loaded 142 pwndbg commands and 47 shell commands.
Reading symbols from ./crackme2...
pwndbg> `,
            outType: "info",
          },
          {
            cmd: "(pwndbg) info functions",
            out: `Non-debugging symbols:
0x00000000000010e0  _start
0x0000000000001260  main
0x0000000000001500  check_password
0x00000000000015a0  deobfuscate
[...]`,
            outType: "default",
          },
          {
            cmd: "(pwndbg) break strcmp",
            out: "Breakpoint 1 at 0x1040",
            outType: "muted",
          },
          {
            cmd: "(pwndbg) run",
            out: `Welcome.
> teste

Breakpoint 1, __strcmp_avx2 () at ../sysdeps/x86_64/multiarch/strcmp-avx2.S:99

  *RDI  0x7fffffffe5d0 ◂— 'teste'                     ← seu input
  *RSI  0x7fffffffe5b0 ◂— 'Br1lh4nt3M1nd!'            ← password real!
   RBP  0x7fffffffe700 ◂— 0x0
   RSP  0x7fffffffe590 —▸ 0x555555555431 (main+457)`,
            outType: "success",
          },
          {
            cmd: "(pwndbg) x/s $rsi",
            out: "0x7fffffffe5b0:  \"Br1lh4nt3M1nd!\"",
            outType: "success",
          },
        ]}
      />

      <h2>PE Windows — Ghidra + ILSpy</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "file dropper.exe",
            out: "dropper.exe: PE32+ executable (console) x86-64, for MS Windows, 8 sections",
            outType: "info",
          },
          {
            comment: "C# .NET? usar ILSpy/dnSpy (decompila para C# legível)",
            cmd: "file -b dropper.exe | grep -i .NET || pip install dnSpy-Sharpener",
            out: "(se .NET, dnSpy é melhor que Ghidra)",
            outType: "muted",
          },
          {
            comment: "PE imports — quais APIs?",
            cmd: "rabin2 -i dropper.exe | head -20",
            out: `[Imports]
nth vaddr      bind   type   lib                  name
1   0x140004080 NONE   FUNC   KERNEL32.dll         CreateProcessA
2   0x140004088 NONE   FUNC   KERNEL32.dll         VirtualAlloc        ← shellcode!
3   0x140004090 NONE   FUNC   KERNEL32.dll         WriteProcessMemory  ← injection!
4   0x140004098 NONE   FUNC   KERNEL32.dll         CreateRemoteThread  ← classic injection
5   0x1400040a0 NONE   FUNC   WININET.dll          InternetOpenA       ← C2!
6   0x1400040a8 NONE   FUNC   WININET.dll          InternetReadFile`,
            outType: "warning",
          },
          {
            cmd: "rabin2 -z dropper.exe | grep -iE 'http|\\.exe|\\.dll' | head",
            out: `38   0x00004220  0x140004220  29   30  http://c2.atacante[.]com/key.bin
42   0x00004240  0x140004240  18   19  C:\\Users\\Public\\evil.exe
43   0x00004260  0x140004260  12   13  amsi.dll`,
            outType: "warning",
          },
        ]}
      />

      <h2>Anti-debug / packer detection</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ver se está empacotado (UPX, Themida, VMProtect)",
            cmd: "upx -t suspicious.exe && upx -l suspicious.exe",
            out: `   File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
    142841 ->     38241   26.77%    win64/pe     suspicious.exe
[OK] suspicious.exe                                        [packed]`,
            outType: "warning",
          },
          {
            cmd: "upx -d suspicious.exe -o unpacked.exe",
            out: `[+] unpacked successfully → unpacked.exe (142841 bytes)`,
            outType: "success",
          },
          {
            cmd: "diec suspicious.exe",
            out: `Detect It Easy 3.10
File: suspicious.exe
Type: PE64
Compiler: VS2022
Packer: Themida v3.0+              ← packer comercial — bem mais difícil
Sections: 5 (CODE, .rsrc, .reloc, .themida, .boot)`,
            outType: "error",
          },
        ]}
      />

      <CommandTable
        title="Ferramentas por linguagem/formato"
        variations={[
          { cmd: "Ghidra", desc: "Tudo (ELF/PE/MachO/etc.). Decompile pra C.", output: "Gratuito (NSA). Padrão do mercado." },
          { cmd: "IDA Free", desc: "Concorrente comercial.", output: "Mais polido. Pago tem decompiler poderoso." },
          { cmd: "radare2 / Cutter", desc: "CLI/GUI open. Análise dinâmica + estática.", output: "Cutter = GUI do r2." },
          { cmd: "gdb + pwndbg", desc: "Debugger Linux com pluggin.", output: "Para análise dinâmica + exploit dev." },
          { cmd: "x64dbg", desc: "Debugger Windows x64.", output: "Padrão para PE." },
          { cmd: "dnSpy / ILSpy", desc: "Apps .NET (C#, F#).", output: "Decompile pra C# quase original." },
          { cmd: "jadx / jd-gui", desc: "Apps Java/Android.", output: "JAR/DEX → Java." },
          { cmd: "Hopper", desc: "macOS/iOS.", output: "Pago mas excelente p/ MachO." },
          { cmd: "binwalk", desc: "Firmware embedded.", output: "Encontra FS embutido." },
          { cmd: "Frida", desc: "Hook de runtime.", output: "Modifica binário em execução." },
        ]}
      />

      <h2>Roteiro de análise — checklist</h2>
      <OutputBlock label="o que fazer em cada novo binário" type="info">
{`[ ] file <bin>                          # arch / linkage / stripped?
[ ] checksec --file=<bin>                # NX, ASLR, PIE, canary, RELRO
[ ] strings -n 8 <bin> | grep -iE 'pass|flag|key|http|/tmp|secret'
[ ] strings -e l <bin>                   # UTF-16 (Windows wchar)
[ ] rabin2 -i <bin>                      # imports (APIs)
[ ] rabin2 -z <bin>                      # strings em .data/.rodata
[ ] ltrace ./<bin>                       # libcalls em runtime
[ ] strace ./<bin>                       # syscalls em runtime
[ ] ghidra OU r2 -AA <bin>               # decompile
[ ] localizar main / WinMain
[ ] gdb com break em strcmp/strncmp/memcmp
[ ] documentar funções renomeadas
[ ] PoC do bypass / extração de flag`}
      </OutputBlock>

      <PracticeBox
        title="Lab: resolva 1 crackme em 15 min"
        goal="Praticar pipeline completo num crackme público."
        steps={[
          "Baixe um crackme do crackmes.one (level 1).",
          "file → strings → checksec.",
          "Se strings tem a flag → done.",
          "Senão → r2 -AA → list functions → ler main.",
          "GDB break em strcmp para ver password em runtime.",
        ]}
        command={`# pegar crackme
wget https://crackmes.one/static/crackme/example.zip
unzip example.zip && cd example

file ./challenge
checksec --file=./challenge
strings -n 8 ./challenge | grep -iE 'flag|pass|secret'

# se não achou
r2 -A ./challenge
# (r2) afl
# (r2) pdg @sym.main
# Q

# dinâmico
gdb ./challenge -ex 'break strcmp' -ex run`}
        expected={`Welcome to challenge
> teste
Breakpoint 1, __strcmp_avx2 ()
RSI: "S3cr3tP@ss"      ← achou em 30 segundos!`}
        verify="Anote o tempo. Em 1 mês de prática diária, easy crackme = < 5 min."
      />

      <AlertBox type="info" title="Ordem de aprendizado">
        Comece em <strong>Linux ELF C nativo</strong> (mais simples). Depois <strong>PE C/C++</strong>.
        Depois <strong>.NET (decompila quase 1:1)</strong>. Por último <strong>Android/Java</strong>
        (jadx) e <strong>iOS</strong>. Reverse de malware moderno (packed + obfuscated +
        anti-VM) é especialização — várias semanas só pra UM sample.
      </AlertBox>
    </PageContainer>
  );
}
