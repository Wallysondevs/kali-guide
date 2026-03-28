import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Filesystem() {
  return (
    <PageContainer
      title="Sistema de Arquivos Linux"
      subtitle="Entenda a estrutura hierárquica do sistema de arquivos do Linux e onde encontrar o que procura."
      difficulty="iniciante"
      timeToRead="8 min"
    >
      <h2>Hierarquia do Sistema (FHS)</h2>
      <p>
        O Linux segue o <strong>Filesystem Hierarchy Standard (FHS)</strong>. 
        Diferente do Windows, tudo parte de uma raiz <code>/</code> — 
        não há letras de drive como C:\.
      </p>

      <div className="space-y-2 my-6">
        {[
          { path: "/", desc: "Raiz do sistema — tudo começa aqui" },
          { path: "/bin", desc: "Binários essenciais (ls, cat, cp, etc.)" },
          { path: "/sbin", desc: "Binários do sistema (ifconfig, reboot)" },
          { path: "/etc", desc: "Arquivos de configuração do sistema" },
          { path: "/home", desc: "Diretórios dos usuários (/home/kali)" },
          { path: "/root", desc: "Home do superusuário root" },
          { path: "/var", desc: "Dados variáveis: logs, bases de dados, emails" },
          { path: "/tmp", desc: "Arquivos temporários (apagados no reboot)" },
          { path: "/usr", desc: "Programas e utilitários do usuário" },
          { path: "/opt", desc: "Software opcional/externo instalado manualmente" },
          { path: "/proc", desc: "Sistema de arquivos virtual com info do kernel" },
          { path: "/dev", desc: "Dispositivos de hardware (discos, USB, etc.)" },
          { path: "/media", desc: "Pontos de montagem para mídias removíveis" },
          { path: "/mnt", desc: "Pontos de montagem temporários" },
          { path: "/lib", desc: "Bibliotecas compartilhadas do sistema" },
          { path: "/boot", desc: "Kernel, initrd e arquivos de boot" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 text-sm">
            <code className="min-w-[100px] text-primary font-mono bg-primary/5 px-2 py-1 rounded text-xs">{item.path}</code>
            <span className="text-muted-foreground pt-1">{item.desc}</span>
          </div>
        ))}
      </div>

      <h2>Arquivos importantes para pentest</h2>
      <CodeBlock language="bash" code={`# Informações de usuários
cat /etc/passwd           # lista de usuários
cat /etc/shadow           # hashes de senhas (requer root)
cat /etc/group            # grupos do sistema

# Configurações de rede
cat /etc/hosts            # mapeamento IP → hostname local
cat /etc/resolv.conf      # servidores DNS
cat /etc/network/interfaces  # configuração de rede

# Logs importantes (fonte de informação!)
cat /var/log/auth.log     # tentativas de login (SSH, sudo, etc.)
cat /var/log/syslog       # log geral do sistema
cat /var/log/apache2/access.log   # acessos ao Apache
cat /var/log/nginx/access.log     # acessos ao Nginx

# Cron jobs (tarefas agendadas — escalação de privilégio!)
cat /etc/crontab
ls -la /etc/cron.d/
crontab -l                # cron do usuário atual
sudo crontab -l           # cron do root`} />

      <AlertBox type="warning" title="Arquivo /etc/shadow — hashes de senhas">
        O <code>/etc/shadow</code> contém os hashes das senhas de todos os usuários. 
        Só o root pode ler. Em testes de penetração, obter esse arquivo é um objetivo crítico 
        pois permite quebrar senhas offline com John ou Hashcat.
      </AlertBox>

      <h2>Operações com arquivos</h2>
      <CodeBlock language="bash" code={`# Copiar e mover
cp origem.txt destino.txt
cp -r pasta_origem/ pasta_destino/
mv arquivo.txt /tmp/

# Links simbólicos (atalhos)
ln -s /usr/share/wordlists /wordlists   # link simbólico
ln arquivo hardlink                      # hard link

# Verificar tipo de arquivo
file binario
file imagem.png
file /bin/ls

# Tamanho de diretório
du -sh /var/log/
du -sh /usr/share/wordlists/

# Montar/desmontar dispositivos
sudo mount /dev/sdb1 /mnt/usb
sudo umount /mnt/usb

# Verificar dispositivos montados
df -h
mount | grep /dev/sd`} />

      <h2>Wordlists do Kali</h2>
      <p>
        O Kali inclui wordlists muito úteis para testes de segurança. A mais famosa é a <strong>rockyou.txt</strong>:
      </p>
      <CodeBlock language="bash" code={`# Localizar wordlists
ls /usr/share/wordlists/

# Descompactar rockyou (vem comprimida)
sudo gzip -d /usr/share/wordlists/rockyou.txt.gz

# Verificar tamanho
wc -l /usr/share/wordlists/rockyou.txt
# Saída: 14344392 senhas!

# Outras wordlists importantes
ls /usr/share/wordlists/dirbuster/     # enumeração de diretórios
ls /usr/share/seclists/                # coleção SecLists (instale: apt install seclists)

# Instalar SecLists (coleção enorme)
sudo apt install -y seclists
ls /usr/share/seclists/`} />

      <h2>Espaço e Uso de Disco</h2>
      <CodeBlock language="bash" code={`# Uso do disco
df -h                          # espaço por partição
df -i                          # uso de inodes

# Maiores diretórios
du -sh /* 2>/dev/null | sort -rh | head -20

# Encontrar arquivos grandes
find / -size +100M 2>/dev/null | head -20
find /var -size +50M 2>/dev/null

# Limpar cache apt
sudo apt clean
sudo apt autoremove

# Limpar logs antigos
sudo journalctl --vacuum-size=100M`} />

      <AlertBox type="info" title="Dica de pentest: PATH injection">
        Em testes de penetração, sempre verifique a variável <code>PATH</code> e diretórios 
        world-writable no PATH. Isso pode levar à escalação de privilégios via PATH hijacking.
      </AlertBox>
    </PageContainer>
  );
}
