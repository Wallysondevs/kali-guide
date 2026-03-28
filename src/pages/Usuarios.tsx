import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Usuarios() {
  return (
    <PageContainer
      title="Usuários e Grupos"
      subtitle="Gerenciamento de usuários, grupos e autenticação no Kali Linux."
      difficulty="iniciante"
      timeToRead="7 min"
    >
      <h2>Estrutura de usuários</h2>
      <p>
        O Linux tem dois tipos de usuários: o <strong>superusuário root</strong> (UID 0) e 
        os <strong>usuários comuns</strong> (UID ≥ 1000). Usuários do sistema têm UID entre 1 e 999.
      </p>
      <CodeBlock language="bash" code={`# Informações do usuário atual
whoami              # nome do usuário
id                  # uid, gid e grupos
groups              # grupos que pertence

# Ver todos os usuários
cat /etc/passwd     # formato: nome:x:uid:gid:info:home:shell
getent passwd       # inclui LDAP/NIS

# Usuários com shell válido (potenciais alvos!)
cat /etc/passwd | grep -v '/nologin\|/false'

# Usuários com senha definida
sudo cat /etc/shadow | grep -v '!'`} />

      <h2>Gerenciar usuários</h2>
      <CodeBlock language="bash" code={`# Criar usuário
sudo useradd -m -s /bin/bash novouser
sudo useradd -m -G sudo -s /bin/bash admin    # com grupo sudo

# Definir senha
sudo passwd novouser

# Modificar usuário
sudo usermod -s /bin/zsh novouser              # mudar shell
sudo usermod -aG sudo novouser                 # adicionar ao grupo sudo
sudo usermod -L novouser                       # bloquear conta
sudo usermod -U novouser                       # desbloquear conta

# Remover usuário
sudo userdel novouser                          # mantém home
sudo userdel -r novouser                       # remove home também

# Trocar de usuário
su - novouser              # troca para novouser
sudo -u novouser comando   # roda comando como novouser
sudo -i                    # shell de root`} />

      <h2>Grupos</h2>
      <CodeBlock language="bash" code={`# Ver grupos
cat /etc/group              # todos os grupos
groups kali                 # grupos do usuário kali

# Grupos importantes no Kali:
# sudo — pode usar sudo
# wireshark — pode capturar pacotes
# docker — pode usar Docker
# disk — acesso ao disco bruto (PERIGOSO!)

# Criar grupo
sudo groupadd pentesters

# Adicionar usuário ao grupo
sudo gpasswd -a kali wireshark
sudo usermod -aG pentesters kali

# Remover usuário do grupo
sudo gpasswd -d kali pentesters

# Aplicar mudança de grupo sem logout
newgrp wireshark`} />

      <AlertBox type="warning" title="Grupo Wireshark">
        No Kali, você precisa estar no grupo <code>wireshark</code> para capturar pacotes sem root. 
        Adicione com: <code>sudo gpasswd -a $USER wireshark</code> e faça logout/login.
      </AlertBox>

      <h2>sudo e escalação</h2>
      <CodeBlock language="bash" code={`# Ver o que você pode executar com sudo
sudo -l

# Exemplo de saída perigosa (pentest):
# (ALL) NOPASSWD: /usr/bin/vim
# → pode abrir shell com: sudo vim -c '!/bin/bash'

# Verificar sudoers
sudo cat /etc/sudoers
sudo ls /etc/sudoers.d/

# Comandos comuns que podem escalar privilégio via sudo:
# sudo vim → :!/bin/bash
# sudo less arquivo → !bash
# sudo python3 → import os; os.system("/bin/bash")
# sudo find → -exec /bin/bash ;
# sudo awk → 'BEGIN {system("/bin/bash")}'`} />

      <h2>Autenticação SSH e chaves</h2>
      <CodeBlock language="bash" code={`# Gerar par de chaves SSH
ssh-keygen -t ed25519 -C "kali@pentest"
ssh-keygen -t rsa -b 4096 -C "kali@pentest"

# Copiar chave pública para servidor
ssh-copy-id usuario@192.168.1.100

# Ou manualmente:
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Permissões corretas para SSH
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519

# Ver chaves autorizadas (possível backdoor em pentest!)
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys`} />

      <h2>Arquivos de histórico (info para pentest)</h2>
      <CodeBlock language="bash" code={`# Histórico de comandos (encontrar credenciais!)
cat ~/.bash_history
cat ~/.zsh_history

# Limpar histórico
history -c
> ~/.bash_history

# Histórico com timestamps
HISTTIMEFORMAT="%d/%m/%y %T " history

# Arquivos de configuração com credenciais comuns:
cat ~/.gitconfig
cat ~/.mysql_history
cat ~/.psql_history
cat ~/.pgpass
find / -name "*.conf" -readable 2>/dev/null | xargs grep -l "password" 2>/dev/null`} />
    </PageContainer>
  );
}
