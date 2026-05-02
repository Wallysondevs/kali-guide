import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Volatility() {
  return (
    <PageContainer
      title="Volatility 3 — análise forense de memória"
      subtitle="Extrai processos, conexões, hashes, malware, drivers, registry hives a partir de dump RAM."
      difficulty="intermediario"
      timeToRead="15 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y volatility3",
            out: "(versão 2.x ainda existe como 'volatility' separado)",
            outType: "muted",
          },
          {
            cmd: "vol -h | head -10",
            out: `usage: vol [-h] [-c CONFIG] [--parallelism [{processes,threads,off}]] [-e EXTEND] [-p PLUGIN_DIRS]
           [-s SYMBOL_DIRS] [-v] [-l LOG] [-o OUTPUT_DIR] [-q] [-r RENDERER] [-f FILE]
           [--write-config] [--save-config SAVE_CONFIG] [--clear-cache] [--cache-path CACHE_PATH]
           [--single-location SINGLE_LOCATION] [--single-swap-locations SINGLE_SWAP_LOCATIONS]
           plugin ...

Volatility 3 Framework 2.7.0`,
            outType: "info",
          },
        ]}
      />

      <h2>Capturar RAM</h2>
      <CommandTable
        title="Ferramentas de aquisição de memória"
        variations={[
          { cmd: "Linux: AVML", desc: "Acquire Volatile Memory for Linux (Microsoft).", output: "sudo ./avml dump.lime" },
          { cmd: "Linux: LiME", desc: "Linux Memory Extractor (kernel module).", output: "Compila + insmod." },
          { cmd: "Windows: WinPmem", desc: "Acquisição leve.", output: "winpmem.exe -o memory.raw" },
          { cmd: "Windows: DumpIt", desc: "Comodo, 1 click → .raw.", output: "Padrão IR." },
          { cmd: "Windows: Magnet RAM Capture", desc: "GUI gratuita.", output: "Magnet Forensics." },
          { cmd: "VMware: vmss → vmem", desc: "Suspend a VM e converta o snapshot.", output: "vmss2core para .raw" },
          { cmd: "VirtualBox: dumpvmcore", desc: "VBoxManage debugvm <vm> dumpvmcore --filename mem.raw", output: "Em VMs paradas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ./avml /casos/dumps/lab.lime",
            out: `[INFO ] Created snapshot dump file: /casos/dumps/lab.lime (4.0 GB)`,
            outType: "success",
          },
          {
            cmd: "sha256sum /casos/dumps/lab.lime",
            out: "8c6f4a3d7e9c1b5f2a8c6f4a3d...  /casos/dumps/lab.lime",
            outType: "info",
          },
        ]}
      />

      <h2>Detecção de OS / perfil</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f /casos/dumps/lab.lime windows.info",
            out: `Volatility 3 Framework 2.7.0
Progress:  100.00               PDB scanning finished                                      
Variable        Value
Kernel Base     0xf8049a800000
DTB             0x1ad000
Symbols         file:///usr/share/volatility3/symbols/windows/ntkrnlmp.pdb/...
Is64Bit         True
IsPAE           False
layer_name      0 WindowsIntel32e
memory_layer    1 LimePager
KdDebuggerDataBlock     0xf8049af2a3a0
NTBuildLab      19041.1.amd64fre.vb_release.191206-1406
CSDVersion      0
KdVersionBlock  0xf8049af1e918
Major/Minor     15.19041
MachineType     34404
KeNumberProcessors      4
SystemTime      2026-04-03 14:42:18
NtSystemRoot    C:\\WINDOWS
NtProductType   NtProductWinNt
NtMajorVersion  10
NtMinorVersion  0
PE MajorOperatingSystemVersion  10
PE MinorOperatingSystemVersion  0
PE Machine      34404
PE TimeDateStamp        Fri Sep  6 06:55:06 2024`,
            outType: "info",
          },
        ]}
      />

      <h2>Lista de processos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f lab.lime windows.pslist",
            out: `PID    PPID    ImageFileName       Offset(V)        Threads    Handles    SessionId    Wow64    CreateTime              ExitTime
4      0       System              0xb603b1880040   142        -          N/A          False    2026-04-03 13:42:18     N/A
84     4       Registry            0xb603b1d0e040   4          -          N/A          False    2026-04-03 13:42:14     N/A
356    4       smss.exe            0xb603b3a13040   2          -          N/A          False    2026-04-03 13:42:18     N/A
552    540     csrss.exe           0xb603b4c12140   12         -          0            False    2026-04-03 13:42:24     N/A
672    540     wininit.exe         0xb603b4f60080   1          -          0            False    2026-04-03 13:42:25     N/A
752    672     services.exe        0xb603b5012080   8          -          0            False    2026-04-03 13:42:25     N/A
784    672     lsass.exe           0xb603b50710c0   12         -          0            False    2026-04-03 13:42:25     N/A
[...]
3142   1842    chrome.exe          0xb603b8f02080   28         -          1            False    2026-04-03 14:21:12     N/A
3284   1842    explorer.exe        0xb603b9d40140   58         -          1            False    2026-04-03 14:11:04     N/A
4521   3284    powershell.exe      0xb603baf00100   8          -          1            False    2026-04-03 14:34:42     N/A
4823   4521    suspicious.exe      0xb603bbe40080   3          -          1            False    2026-04-03 14:39:11     N/A   ← !!`,
            outType: "warning",
          },
          {
            comment: "árvore (parent → child)",
            cmd: "vol -f lab.lime windows.pstree",
            out: `*** explorer.exe (3284)
**** chrome.exe (3142)
**** notepad.exe (3892)
**** powershell.exe (4521)
***** suspicious.exe (4823)         ← rodado por powershell humano
****** mshta.exe (5012)              ← descida suspeita: htm execution`,
            outType: "error",
          },
        ]}
      />

      <h2>Conexões de rede</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f lab.lime windows.netstat",
            out: `Offset             Proto    LocalAddr    LocalPort    ForeignAddr     ForeignPort    State        PID    Owner
0xb603baf12080     TCPv4    0.0.0.0      135          0.0.0.0         0              LISTENING    900    svchost.exe
0xb603baf12180     TCPv4    0.0.0.0      445          0.0.0.0         0              LISTENING    4      System
0xb603baf12280     TCPv4    192.168.1.50 3389         0.0.0.0         0              LISTENING    5212   svchost.exe
0xb603baf12380     TCPv4    192.168.1.50 49214        142.251.179.139 443            ESTABLISHED  3142   chrome.exe
0xb603baf12480     TCPv4    192.168.1.50 49245        45.32.118.88    4444           ESTABLISHED  4823   suspicious.exe   ← C2!
0xb603baf12580     TCPv4    192.168.1.50 49251        45.32.118.88    8080           ESTABLISHED  4823   suspicious.exe`,
            outType: "error",
          },
        ]}
      />

      <h2>Dump de hashes (SAM)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f lab.lime windows.hashdump",
            out: `User                    rid    lmhash                           nthash
Administrator           500    aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
Guest                   501    aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
DefaultAccount          503    aad3b435b51404eeaad3b435b51404ee 31d6cfe0d16ae931b73c59d7e0c089c0
WDAGUtilityAccount      504    aad3b435b51404eeaad3b435b51404ee 599e9d87e0e94042e527ec80a324c43c
wallyson                1001   aad3b435b51404eeaad3b435b51404ee c1e07adc59f6c3eaa7a02e7a4e5f5cc1`,
            outType: "warning",
          },
          {
            comment: "lsadump = secrets do LSA (cached creds, RDP, Wi-Fi)",
            cmd: "vol -f lab.lime windows.lsadump",
            out: `Key             Secret
DefaultPassword 50 00 40 00 73 00 73 00 77 00 30 00 72 00 64 00   P.@.s.s.w.0.r.d.
DPAPI_SYSTEM    01 00 00 00 73 d4 1f c2 ...
NL$KM           ...`,
            outType: "error",
          },
        ]}
      />

      <h2>Dump de processo + análise</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "mkdir dumps && vol -f lab.lime -o dumps windows.pslist.PsList --pid 4823 --dump",
            out: `[+] Dumped suspicious.exe.4823.0xb603bbe40080.dmp (124 KB) → dumps/`,
            outType: "info",
          },
          {
            cmd: "strings -n 8 dumps/suspicious.exe.4823.0xb603bbe40080.dmp | grep -E 'http|cmd|powershell|\\\\\\\\.\\\\pipe' | head -10",
            out: `http://45.32.118.88:8080/beacon
http://45.32.118.88:4444/checkin
cmd.exe /c whoami /all
powershell -ep bypass -nop -e WwBOAGUAdAAuAFMA...
\\\\.\\pipe\\msf-pipe-12345
TEMP\\update.bin
schtasks /create /sc minute /mo 5 /tn "WindowsUpdate"`,
            outType: "error",
          },
          {
            comment: "extrair DLLs carregadas pelo processo",
            cmd: "vol -f lab.lime windows.dlllist --pid 4823",
            out: `0xb603bbe40080  suspicious.exe  C:\\Users\\wallyson\\Desktop\\update.exe
                                C:\\Windows\\System32\\ntdll.dll
                                C:\\Windows\\System32\\kernel32.dll
                                C:\\Windows\\System32\\KERNELBASE.dll
                                C:\\Windows\\System32\\msvcrt.dll
                                C:\\Windows\\System32\\ws2_32.dll       ← networking
                                C:\\Users\\wallyson\\AppData\\Local\\Temp\\msf.dll  ← suspeita!`,
            outType: "warning",
          },
        ]}
      />

      <h2>Detecção de malware</h2>
      <CommandTable
        title="Plugins de detecção"
        variations={[
          { cmd: "windows.malfind", desc: "Páginas de memória com PE injetado e RWX.", output: "Detecta DLL injection, shellcode injection." },
          { cmd: "windows.hollowprocesses", desc: "Process hollowing (svchost falso).", output: "Compara MZ header com on-disk." },
          { cmd: "windows.driverirp", desc: "IRP hijack em drivers (rootkit).", output: "Hooks suspeitos." },
          { cmd: "windows.ssdt", desc: "SSDT (System Service Descriptor Table) hooks.", output: "Detecta rootkit kernel." },
          { cmd: "windows.modules / driverscan", desc: "Drivers carregados (vs lista).", output: "Comparar com baseline." },
          { cmd: "windows.cmdline", desc: "Linha de comando completa de cada processo.", output: "Detecta -e bypass, base64 encoded." },
          { cmd: "windows.envars", desc: "Variáveis de ambiente.", output: "Configs maliciosas." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f lab.lime windows.malfind | head -50",
            out: `PID  Process            Start VPN          End VPN            Tag    Protection                       CommitCharge    PrivateMemory    File output
4823 suspicious.exe     0x2000000          0x20fffff          VadS   PAGE_EXECUTE_READWRITE           1               1                Disabled

Hexdump:
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00   ................
fc 48 83 e4 f0 e8 c0 00 00 00 41 51 41 50 52 51   .H........AQAPRQ
56 48 31 d2 65 48 8b 52 60 48 8b 52 18 48 8b 52   VH1.eH.R\`H.R.H.R   ← shellcode típico do msfvenom!
20 48 8b 72 50 48 0f b7 4a 4a 4d 31 c9 48 31 c0    H.rPH..JJM1.H1.

Disassembly:
0x2000000:      cld
0x2000001:      and rsp, 0xfffffffffffffff0
0x2000005:      call 0x20000ca
0x200000a:      pop r10
0x200000c:      pop r8
0x200000e:      pop rdx
[...]`,
            outType: "error",
          },
          {
            cmd: "vol -f lab.lime windows.cmdline | grep -i 'powershell\\|encoded\\|base64' ",
            out: `PID    Process            Args
4521   powershell.exe     -ExecutionPolicy Bypass -NoProfile -EncodedCommand SQBuAH...
6712   powershell.exe     -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AC...`,
            outType: "warning",
          },
        ]}
      />

      <h2>Registry hives</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "vol -f lab.lime windows.registry.hivelist",
            out: `Offset                  FileFullPath
0xb603b21f4000         \\REGISTRY\\MACHINE\\SYSTEM
0xb603b22b8000         \\REGISTRY\\MACHINE\\SOFTWARE
0xb603b23c4000         \\REGISTRY\\MACHINE\\SAM
0xb603b24c4000         \\REGISTRY\\MACHINE\\SECURITY
0xb603b2bc8000         \\Device\\HarddiskVolume3\\Windows\\ServiceProfiles\\NetworkService\\NTUSER.DAT
0xb603b2dc4000         \\Users\\wallyson\\NTUSER.DAT`,
            outType: "info",
          },
          {
            comment: "buscar persistência: Run keys",
            cmd: "vol -f lab.lime windows.registry.printkey --key 'Software\\Microsoft\\Windows\\CurrentVersion\\Run'",
            out: `Custom   2026-04-03 14:42 UTC   REG_SZ   "C:\\Users\\wallyson\\AppData\\Roaming\\Update\\update.exe"     ← persistência malicious!
OneDrive 2024-08-15 09:11 UTC   REG_SZ   "C:\\Users\\wallyson\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe /background"
SecurityHealth  2024-01-14 11:23 UTC   REG_SZ   "C:\\Windows\\System32\\SecurityHealthSystray.exe"`,
            outType: "error",
          },
        ]}
      />

      <h2>Volatility 2 vs 3</h2>
      <CommandTable
        title="Diferenças importantes"
        variations={[
          { cmd: "Profile (vol2)", desc: "Necessário descobrir profile com kdbgscan.", output: "vol --profile=Win10x64_19041 -f mem ..." },
          { cmd: "Auto-detection (vol3)", desc: "Descobre OS sozinho via simbolos.", output: "Mais simples." },
          { cmd: "Plugin namespace", desc: "vol2: pslist; vol3: windows.pslist.PsList.", output: "Reorganizado." },
          { cmd: "Plugins comuns", desc: "Ambos têm os principais.", output: "Use vol3 sempre que possível." },
          { cmd: "Linux/macOS", desc: "Ambos suportam, vol3 mais ativo.", output: "linux.pslist, mac.pslist" },
        ]}
      />

      <PracticeBox
        title="Resolva um caso simulado"
        goal="Baixar um dump de memória público e identificar processo malicioso, conexão C2 e persistência."
        steps={[
          "Baixe um dump público (ex: Memory CTF da SANS).",
          "Rode windows.info para identificar OS.",
          "windows.pstree para árvore de processos.",
          "windows.netstat para conexões anômalas.",
          "windows.malfind nos PIDs suspeitos.",
          "windows.registry.printkey nas Run keys.",
        ]}
        command={`# Exemplo com dump público
wget https://download.csiac.org/wp-content/uploads/sites/3/2017/06/SANS-DFIR-Memory-CTF.zip

DUMP=mem.lime

vol -f $DUMP windows.info
vol -f $DUMP windows.pstree | tee pstree.txt
vol -f $DUMP windows.netstat | tee netstat.txt
vol -f $DUMP windows.cmdline | tee cmdline.txt
vol -f $DUMP windows.malfind | tee malfind.txt

# Em pstree procure: processo filho de explorer com nome estranho
# Em netstat procure: conexão para IP estranho
# Em malfind procure: PAGE_EXECUTE_READWRITE com shellcode (FC 48 83 E4 ...)`}
        expected={`(Em pstree)
explorer.exe → cmd.exe → svchost.exe (PID em /Users/, não em /Windows/System32/)

(Em netstat)
suspicious.exe   ESTABLISHED   45.32.118.88:4444   ← C2

(Em malfind)
suspicious.exe   PAGE_EXECUTE_READWRITE   FC 48 83 E4 F0 E8 ...   ← msf shellcode`}
        verify="Identificar pelo menos 1 processo + 1 conexão + 1 chave de Run = sucesso na investigação."
      />

      <AlertBox type="info" title="Cuidado com o tempo">
        Memória é volátil — capture na hora do incidente. Reboot apaga tudo.
        Em IR (Incident Response), o playbook padrão é: 1) capturar memória, 2) capturar
        disco, 3) só então deslogar/desligar.
      </AlertBox>
    </PageContainer>
  );
}
