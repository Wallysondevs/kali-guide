import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Instalacao() {
  return (
    <PageContainer
      title="Instalação do Kali Linux"
      subtitle="Guia completo para instalar o Kali em VM, dual boot, live boot e WSL."
      difficulty="iniciante"
      timeToRead="10 min"
    >
      <h2>Opções de Instalação</h2>
      <p>
        Existem várias formas de usar o Kali Linux. Cada uma tem seus prós e contras dependendo 
        do seu caso de uso:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { title: "🖥️ Máquina Virtual (VM)", best: "Melhor para iniciantes", desc: "Roda dentro do Windows/macOS usando VirtualBox ou VMware. Seguro e isolado.", pros: "Fácil, seguro, snapshots", cons: "Desempenho reduzido" },
          { title: "⚡ Dual Boot", best: "Melhor desempenho", desc: "Instala ao lado do Windows/macOS. Boot selecionado na inicialização.", pros: "Desempenho nativo", cons: "Risco de perda de dados" },
          { title: "💾 Live Boot (USB)", best: "Portátil e temporário", desc: "Executa direto do pendrive sem instalar. Nada é salvo por padrão.", pros: "Portátil, não instala nada", cons: "Dados perdidos ao desligar" },
          { title: "🪟 WSL 2 (Windows)", best: "Windows + Kali", desc: "Windows Subsystem for Linux 2. Linha de comando do Kali no Windows.", pros: "Integração Windows", cons: "Sem GUI nativa (Win-KeX resolve)" },
        ].map((opt, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold text-foreground mb-1 mt-0 border-0 text-base">{opt.title}</h3>
            <div className="text-xs text-primary font-medium mb-2">{opt.best}</div>
            <p className="text-sm text-muted-foreground mb-3">{opt.desc}</p>
            <div className="text-xs space-y-1">
              <div className="text-green-400">✓ {opt.pros}</div>
              <div className="text-red-400">✗ {opt.cons}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>1. Instalação em Máquina Virtual (recomendado)</h2>
      <h3>Requisitos mínimos</h3>
      <ul>
        <li>RAM: 2 GB (4 GB recomendado)</li>
        <li>Espaço em disco: 20 GB (50 GB recomendado)</li>
        <li>Processador com suporte a virtualização (VT-x/AMD-V)</li>
      </ul>

      <h3>Passo a passo com VirtualBox</h3>
      <p>
        A Offensive Security disponibiliza imagens pré-configuradas (VirtualBox/VMware) prontas para uso.
        É muito mais rápido que instalar manualmente!
      </p>
      <ol>
        <li>Baixe o <strong>VirtualBox</strong> em <code>virtualbox.org</code></li>
        <li>Acesse <code>kali.org/get-kali</code> e baixe a imagem para <strong>Virtual Machines</strong></li>
        <li>Importe o arquivo <code>.ova</code> no VirtualBox: Arquivo → Importar Appliance</li>
        <li>Inicie a VM. Usuário padrão: <code>kali</code> / Senha: <code>kali</code></li>
      </ol>

      <AlertBox type="warning" title="Altere a senha padrão!">
        Após a primeira inicialização, troque imediatamente a senha padrão com <code>passwd</code>.
      </AlertBox>

      <h2>2. Instalação via WSL 2 (Windows)</h2>
      <CodeBlock language="powershell" title="PowerShell (como Administrador)" code={`# Instalar WSL 2
wsl --install

# Instalar Kali Linux especificamente
wsl --install -d kali-linux

# Iniciar o Kali
kali

# Instalar ferramentas básicas dentro do Kali WSL
sudo apt update && sudo apt install -y kali-linux-default`} />

      <h3>Win-KeX: Interface Gráfica no WSL</h3>
      <CodeBlock language="bash" code={`# Instalar Win-KeX para interface gráfica
sudo apt install -y kali-win-kex

# Iniciar modo window
kex --win -s

# Iniciar modo seamless (janelas integradas ao Windows)
kex --sl -s

# Iniciar modo Enhanced (melhor desempenho)
kex --esm --ip -s`} />

      <h2>3. Instalação em Dual Boot</h2>
      <AlertBox type="danger" title="Cuidado com o Dual Boot">
        O dual boot pode resultar em perda de dados se feito incorretamente. 
        Faça backup de todos os seus dados antes de prosseguir. 
        Recomendamos testar primeiro em VM.
      </AlertBox>
      <ol>
        <li>Baixe a ISO do Kali em <code>kali.org/get-kali</code> (Installer)</li>
        <li>Use o <strong>Rufus</strong> (Windows) ou <strong>Balena Etcher</strong> para criar o USB bootável</li>
        <li>Reduza a partição do Windows no Gerenciador de Disco</li>
        <li>Boot pelo USB (F12, F2 ou Del no BIOS)</li>
        <li>Siga o instalador gráfico do Kali</li>
        <li>O GRUB será configurado automaticamente para dual boot</li>
      </ol>

      <h2>Primeiras configurações após instalar</h2>
      <CodeBlock language="bash" code={`# Atualizar o sistema
sudo apt update && sudo apt full-upgrade -y

# Instalar suite completa de ferramentas
sudo apt install -y kali-linux-default

# Ou suite grande (mais ferramentas)
sudo apt install -y kali-linux-large

# Instalar drivers adicionais
sudo apt install -y kali-linux-firmware

# Instalar ferramenta extra VirtualBox Guest Additions
sudo apt install -y virtualbox-guest-x11

# Configurar idioma para Português
sudo dpkg-reconfigure locales

# Configurar fuso horário
sudo timedatectl set-timezone America/Sao_Paulo`} />

      <h2>Verificando a instalação</h2>
      <CodeBlock language="bash" code={`# Verificar sistema operacional
uname -a
cat /etc/os-release

# Verificar memória disponível
free -h

# Verificar espaço em disco
df -h

# Verificar interfaces de rede
ip a

# Listar ferramentas de pentest instaladas
dpkg -l | grep kali`} />

      <AlertBox type="success" title="Instalação concluída!">
        Com o Kali instalado e atualizado, você está pronto para explorar as ferramentas. 
        O próximo passo é se familiarizar com o terminal e o sistema de arquivos.
      </AlertBox>
    </PageContainer>
  );
}
