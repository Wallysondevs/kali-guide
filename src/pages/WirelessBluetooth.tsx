import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function WirelessBluetooth() {
  return (
    <PageContainer
      title="Wireless: Bluetooth + outras tecnologias"
      subtitle="bluetoothctl, hcitool, l2ping, BLE, RFID/NFC, SDR (RTL-SDR), Zigbee."
      difficulty="intermediário"
      timeToRead="14 min"
      prompt="wireless/bluetooth"
    >
      <h2>Bluetooth Classic — bluez stack</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y bluez bluez-tools bluez-hcidump bluez-deprecated",
            out: "(stack oficial Linux)",
            outType: "muted",
          },
          {
            cmd: "hciconfig",
            out: `hci0:	Type: Primary  Bus: USB
	BD Address: 5C:F3:70:8A:21:42  ACL MTU: 1021:8  SCO MTU: 64:1
	UP RUNNING 
	RX bytes:1842 acl:0 sco:0 events:78 errors:0
	TX bytes:1241 acl:0 sco:0 commands:54 errors:0`,
            outType: "info",
          },
          {
            comment: "ligar adaptador",
            cmd: "sudo hciconfig hci0 up && sudo hciconfig hci0 piscan",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Descoberta — hcitool / bluetoothctl</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo hcitool scan",
            out: `Scanning ...
        AC:67:5D:11:42:F8       JBL Flip 6
        F8:30:02:8A:21:11       Wallyson's iPhone
        D4:90:9C:42:88:7E       MX Master 3
        20:34:FB:89:42:01       BT Speaker
        FC:4C:E5:11:22:33       SmartBand_X3`,
            outType: "info",
          },
          {
            comment: "info detalhado de um dispositivo",
            cmd: "sudo hcitool info AC:67:5D:11:42:F8",
            out: `Requesting information ...
        BD Address:  AC:67:5D:11:42:F8
        Device Name: JBL Flip 6
        LMP Version: 5.2 (0xb)  LMP Subversion: 0x100c
        Manufacturer: Qualcomm Technologies International, Ltd. (Q.T.I.L) (29)
        Features page 0: 0xff 0xff 0x8d 0xfe 0xdb 0xff 0x7b 0x87
        Features page 1: 0x07 0x00 0x00 0x00 0x00 0x00 0x00 0x00
        Features page 2: 0x09 0x00 0x00 0x00 0x00 0x00 0x00 0x00`,
            outType: "default",
          },
          {
            cmd: "sdptool browse AC:67:5D:11:42:F8",
            out: `Browsing AC:67:5D:11:42:F8 ...
Service Name: Hands-Free Gateway
Service RecHandle: 0x10000
Service Class ID List:
  "Handsfree Gateway" (0x111f)
  "Generic Audio" (0x1203)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 1`,
            outType: "info",
          },
        ]}
      />

      <h2>bluetoothctl — interativo moderno</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "bluetoothctl",
            out: `Agent registered
[bluetooth]#`,
            outType: "muted",
          },
        ]}
      />
      <Terminal
        user=""
        host="bluetooth"
        path=""
        prompt="]#"
        lines={[
          {
            cmd: "scan on",
            out: `Discovery started
[CHG] Controller 5C:F3:70:8A:21:42 Discovering: yes
[NEW] Device AC:67:5D:11:42:F8 JBL Flip 6
[NEW] Device F8:30:02:8A:21:11 Wallyson's iPhone
[NEW] Device D4:90:9C:42:88:7E MX Master 3`,
            outType: "info",
          },
          {
            cmd: "devices",
            out: `Device AC:67:5D:11:42:F8 JBL Flip 6
Device F8:30:02:8A:21:11 Wallyson's iPhone
Device D4:90:9C:42:88:7E MX Master 3`,
            outType: "default",
          },
          {
            cmd: "info AC:67:5D:11:42:F8",
            out: `Device AC:67:5D:11:42:F8 (public)
        Name: JBL Flip 6
        Alias: JBL Flip 6
        Class: 0x002c0414 (2884116)
        Icon: audio-card
        Paired: no
        Bonded: no
        Trusted: no
        Blocked: no
        Connected: no
        UUID: Headset                   (00001108-0000-1000-8000-00805f9b34fb)
        UUID: Audio Sink                (0000110b-0000-1000-8000-00805f9b34fb)
        UUID: Hands-Free                (0000111e-0000-1000-8000-00805f9b34fb)`,
            outType: "info",
          },
          {
            cmd: "pair AC:67:5D:11:42:F8",
            out: `Attempting to pair with AC:67:5D:11:42:F8
[CHG] Device AC:67:5D:11:42:F8 Connected: yes
Request confirmation
[agent] Confirm passkey 482917 (yes/no): yes
[CHG] Device AC:67:5D:11:42:F8 Paired: yes
Pairing successful`,
            outType: "success",
          },
        ]}
      />

      <h2>Ataque — l2ping (DoS clássico)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ping em camada L2CAP — flood pode derrubar dispositivos antigos",
            cmd: "sudo l2ping -i hci0 -s 600 -f AC:67:5D:11:42:F8",
            out: `Ping: AC:67:5D:11:42:F8 from 5C:F3:70:8A:21:42 (data size 600) ...
600 bytes from AC:67:5D:11:42:F8 id 0 time 8.42ms
600 bytes from AC:67:5D:11:42:F8 id 1 time 12.18ms
600 bytes from AC:67:5D:11:42:F8 id 2 time 9.82ms
[...]
^C
1421 sent, 1338 received, 5% loss`,
            outType: "warning",
          },
        ]}
      />

      <h2>Bluetooth Low Energy (BLE)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo hcitool lescan",
            out: `LE Scan ...
F0:50:8B:11:42:F8 (unknown)
F0:50:8B:11:42:F8 SmartBand_X3
4C:65:A8:42:88:11 (unknown)
4C:65:A8:42:88:11 Beacon-IoT-Sensor
B8:27:EB:42:11:99 (unknown)
B8:27:EB:42:11:99 RaspberryPi-Zero-W`,
            outType: "info",
          },
          {
            cmd: "sudo gatttool -b F0:50:8B:11:42:F8 --interactive",
            out: `[F0:50:8B:11:42:F8][LE]> connect
Attempting to connect to F0:50:8B:11:42:F8
Connection successful`,
            outType: "success",
          },
        ]}
      />
      <Terminal
        user=""
        host="LE"
        path=""
        prompt=">"
        lines={[
          {
            cmd: "primary",
            out: `attr handle: 0x0001, end grp handle: 0x0007 uuid: 00001800-0000-1000-8000-00805f9b34fb (Generic Access)
attr handle: 0x0008, end grp handle: 0x000c uuid: 00001801-0000-1000-8000-00805f9b34fb (Generic Attribute)
attr handle: 0x000d, end grp handle: 0x002a uuid: 0000180f-0000-1000-8000-00805f9b34fb (Battery Service)
attr handle: 0x002b, end grp handle: 0xffff uuid: 0000180a-0000-1000-8000-00805f9b34fb (Device Information)`,
            outType: "info",
          },
          {
            cmd: "char-read-uuid 0x2a19",
            out: "handle: 0x000f   value: 4a    ← bateria 74%",
            outType: "default",
          },
          {
            cmd: "char-read-uuid 0x2a29",
            out: `handle: 0x002d   value: 58 69 61 6f 6d 69 20 49 6e 63    ← "Xiaomi Inc"`,
            outType: "default",
          },
        ]}
      />

      <h2>btlejack / Wireshark BLE</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "captura BLE com adaptador especial (BBC micro:bit)",
            cmd: "sudo btlejack -s",
            out: `[i] Detected sniffer:
 > BBC micro:bit (Adafruit) (firmware version 5)
[i] Listing connections in advertising state...

[+] Detected connection 0x4f8a21:
    Master MAC:    08:00:27:de:ad:be (random)
    Slave MAC:     F0:50:8B:11:42:F8 (public)
    AA:            0xaf9b8c42`,
            outType: "info",
          },
          {
            cmd: "sudo btlejack -f 0xaf9b8c42 -x output.pcap",
            out: `[i] Capturing connection 0xaf9b8c42 to output.pcap`,
            outType: "warning",
          },
        ]}
      />

      <h2>RFID/NFC — Proxmark3 e libnfc</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y libnfc-bin libnfc-examples",
            out: "(precisa de leitor compatível: ACR122U, PN532)",
            outType: "muted",
          },
          {
            cmd: "nfc-list",
            out: `nfc-list uses libnfc 1.8.0
NFC device: ACS / ACR122U PICC Interface opened

1 ISO14443A passive target(s) found:
ISO/IEC 14443A (106 kbps) target:
    ATQA (SENS_RES): 00  04
       UID (NFCID1): 4a  82  6f  c1
      SAK (SEL_RES): 08`,
            outType: "info",
          },
          {
            cmd: "sudo nfc-mfclassic R u 0 dump.mfd default-keys.txt",
            out: `Sector: 0, type A, probed key: ffffffffffff
Sector: 1, type A, probed key: ffffffffffff
[...]
Sector: 15, type B, probed key: ffffffffffff
Reading sector |################################| 1024 bytes
Done, 1024 bytes saved.`,
            outType: "success",
          },
          {
            cmd: "xxd dump.mfd | head -5",
            out: `00000000: 4a82 6fc1 9b08 0400 c2bb 9bd5 1003 7700  J.o...........w.
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: ffff ffff ffff ff07 8069 ffff ffff ffff  .........i......
00000040: 4d49 4e c4 0001 0001 0000 0000 0000 0000  MIN.............`,
            outType: "default",
          },
        ]}
      />

      <h2>SDR — RTL-SDR (radio definida por software)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y rtl-sdr gqrx-sdr gnuradio gr-osmosdr",
            out: "(stack para receber 24 MHz a 1.7 GHz)",
            outType: "muted",
          },
          {
            cmd: "rtl_test",
            out: `Found 1 device(s):
  0:  Realtek, RTL2838UHIDIR, SN: 00000001

Using device 0: Generic RTL2832U OEM
Found Rafael Micro R820T tuner
Supported gain values (29): 0.0 0.9 1.4 2.7 3.7 7.7 8.7 12.5 ...
[R82XX] PLL not locked!
Sampling at 2048000 S/s.

Info: This tool will continuously read from the device, and report if`,
            outType: "info",
          },
          {
            comment: "captura FM em 89.1 MHz (decodifica)",
            cmd: "rtl_fm -f 89.1M -M wbfm -s 200000 -r 48000 - | aplay -r 48000 -f S16_LE",
            out: "(rádio FM tocando — confirma que SDR funciona)",
            outType: "default",
          },
          {
            comment: "GQRX — interface visual (waterfall)",
            cmd: "gqrx &",
            out: "(GUI: tunável de 24M a 1.7G, vê telecomunicações, ADS-B avião, controle remoto)",
            outType: "muted",
          },
        ]}
      />

      <h2>Zigbee / Z-Wave / LoRa</h2>
      <CommandTable
        title="Stack para IoT moderno"
        variations={[
          { cmd: "Killerbee", desc: "Suíte Zigbee — sniffing + injection.", output: "Precisa Atmel RZUSBStick." },
          { cmd: "scapy-radio", desc: "Scapy + GNU Radio para 802.15.4.", output: "Para Zigbee custom packet crafting." },
          { cmd: "Z-Stick (UZB7)", desc: "Adaptador Z-Wave para Linux.", output: "Sniffing com OpenZWave." },
          { cmd: "LoRa (HackRF / RFM95)", desc: "868/915 MHz LoRa packet sniff.", output: "Para attaques contra agro-IoT." },
        ]}
      />

      <PracticeBox
        title="BLE recon — descubra dispositivos por perto"
        goal="Listar dispositivos BLE ao alcance, identificar fabricante e ler informações públicas (bateria, temperatura)."
        steps={[
          "Habilite o adaptador Bluetooth.",
          "Faça LE scan.",
          "Para um dispositivo aberto (sem pareamento), liste services com gatttool.",
          "Leia características conhecidas (bateria 0x2a19, modelo 0x2a24, fabricante 0x2a29).",
        ]}
        command={`sudo hciconfig hci0 up
sudo hcitool lescan --duplicates &
sleep 10
sudo kill %1

# Conecte em UM dispositivo descoberto (substitua MAC)
TARGET=F0:50:8B:11:42:F8
sudo gatttool -b $TARGET --primary
sudo gatttool -b $TARGET --char-read --uuid 0x2a19   # battery
sudo gatttool -b $TARGET --char-read --uuid 0x2a29   # manufacturer`}
        expected={`(scan)
F0:50:8B:11:42:F8 SmartBand_X3
4C:65:A8:42:88:11 Beacon-IoT-Sensor

(read)
handle: 0x000f   value: 4a       (74% battery)
handle: 0x002d   value: 58 69 61 6f 6d 69 20 49 6e 63   ("Xiaomi Inc")`}
        verify="Você só conseguirá ler chars públicas (sem pairing). Para chars protegidas precisa de bonding (com PIN)."
      />

      <AlertBox type="warning" title="BLE moderno: Secure Connections + chars privadas">
        BLE 4.2+ usa Secure Connections (ECDH) — passive sniff não revela payload.
        Mas muitos dispositivos baratos ainda usam Just Works pairing (sem MITM protection)
        e expõem chars críticas sem auth — vetor de IoT pentest.
      </AlertBox>
    </PageContainer>
  );
}
