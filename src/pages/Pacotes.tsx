import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Pacotes() {
  return (
    <PageContainer
      title="Gerência de Pacotes"
      subtitle="Como instalar, atualizar e gerenciar ferramentas no Kali Linux com APT e pip."
      difficulty="iniciante"
      timeToRead="7 min"
    >
      <h2>APT — O gerenciador principal</h2>
      <p>
        O <strong>APT (Advanced Package Tool)</strong> é o gerenciador de pacotes do Kali (baseado em Debian). 
        É a forma primária de instalar e atualizar ferramentas.
      </p>
      <CodeBlock language="bash" code={`# Atualizar lista de pacotes (repositórios)
sudo apt update

# Atualizar todos os pacotes instalados
sudo apt upgrade -y

# Upgrade completo (pode remover pacotes obsoletos)
sudo apt full-upgrade -y

# Instalar pacote
sudo apt install -y nmap

# Instalar múltiplos pacotes
sudo apt install -y nmap wireshark metasploit-framework hydra

# Remover pacote
sudo apt remove nmap

# Remover + arquivos de configuração
sudo apt purge nmap

# Remover dependências órfãs
sudo apt autoremove`} />

      <h2>Busca e informações</h2>
      <CodeBlock language="bash" code={`# Buscar pacote
apt search "sql injection"
apt search nmap

# Informações de um pacote
apt show nmap
apt info wireshark

# Listar pacotes instalados
dpkg -l
dpkg -l | grep kali
dpkg -l | grep -i metasploit

# Verificar se está instalado
dpkg -l nmap

# Listar arquivos de um pacote
dpkg -L nmap

# Qual pacote instalou um arquivo
dpkg -S /usr/bin/nmap`} />

      <h2>Ferramentas Kali pré-definidas</h2>
      <CodeBlock language="bash" code={`# Meta-pacotes do Kali (coleções de ferramentas)
sudo apt install -y kali-linux-default   # ~600 MB — ferramentas básicas
sudo apt install -y kali-linux-large     # ~3 GB — mais ferramentas
sudo apt install -y kali-linux-everything # ~15 GB — TUDO

# Por categoria:
sudo apt install -y kali-tools-web       # pentest web
sudo apt install -y kali-tools-wireless  # ataques wireless
sudo apt install -y kali-tools-forensics # forense digital
sudo apt install -y kali-tools-passwords # quebra de senhas
sudo apt install -y kali-tools-exploitation # exploração
sudo apt install -y kali-tools-sniffing-spoofing  # sniffing

# Ver todos os meta-pacotes disponíveis
apt search kali-tools`} />

      <h2>pip — Python packages</h2>
      <p>
        Muitas ferramentas de segurança são escritas em Python. O <code>pip</code> instala pacotes Python:
      </p>
      <CodeBlock language="bash" code={`# Instalar pacote Python
pip install impacket
pip install scapy
pip install requests beautifulsoup4
pip3 install pwntools

# Atualizar pacote
pip install --upgrade impacket

# Listar instalados
pip list
pip show impacket

# Instalar de requirements.txt
pip install -r requirements.txt

# Ambiente virtual Python (isolar dependências)
python3 -m venv venv
source venv/bin/activate
pip install ferramenta
deactivate`} />

      <h2>Instalação manual de ferramentas</h2>
      <CodeBlock language="bash" code={`# Clonar e instalar do GitHub
git clone https://github.com/usuario/ferramenta.git
cd ferramenta
pip install -r requirements.txt
python3 ferramenta.py

# Compilar do fonte (C/C++)
sudo apt install -y build-essential
./configure
make
sudo make install

# Instalar .deb manualmente
sudo dpkg -i pacote.deb
sudo apt -f install   # corrigir dependências quebradas

# AppImage (executável portable)
chmod +x ferramenta.AppImage
./ferramenta.AppImage`} />

      <h2>Repositórios do Kali</h2>
      <CodeBlock language="bash" code={`# Ver repositórios configurados
cat /etc/apt/sources.list
ls /etc/apt/sources.list.d/

# Repositório oficial do Kali Rolling
# deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware

# Adicionar chave GPG
wget -q -O - https://archive.kali.org/archive-key.asc | sudo apt-key add -

# Usar mirrors brasileiros (mais rápido)
# deb http://kali.download/kali kali-rolling main contrib non-free`} />

      <AlertBox type="info" title="Mantenha o sistema atualizado">
        Execute <code>sudo apt update && sudo apt full-upgrade</code> regularmente. 
        O Kali é um rolling release — sempre tem atualizações de ferramentas e segurança disponíveis.
      </AlertBox>

      <h2>Ferramentas essenciais que não vêm por padrão</h2>
      <CodeBlock language="bash" code={`# Coleção SecLists (wordlists)
sudo apt install -y seclists

# Impacket (Active Directory)
sudo apt install -y python3-impacket

# CrackMapExec (lateral movement)
sudo apt install -y crackmapexec

# LinPEAS / WinPEAS (escalação de privilégio)
wget https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh
chmod +x linpeas.sh

# Gobuster
sudo apt install -y gobuster

# ffuf (fuzzing web)
sudo apt install -y ffuf

# nuclei (scanner de vulnerabilidades)
sudo apt install -y nuclei`} />
    </PageContainer>
  );
}
