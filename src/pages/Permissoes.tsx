import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Permissoes() {
  return (
    <PageContainer
      title="Permissões de Arquivos"
      subtitle="Entenda o sistema de permissões do Linux — fundamental para segurança e escalação de privilégios."
      difficulty="iniciante"
      timeToRead="8 min"
    >
      <h2>Lendo permissões</h2>
      <p>
        Cada arquivo Linux tem permissões para três entidades: <strong>dono (u)</strong>, <strong>grupo (g)</strong> e <strong>outros (o)</strong>. 
        São três ações: <strong>leitura (r=4)</strong>, <strong>escrita (w=2)</strong> e <strong>execução (x=1)</strong>.
      </p>
      <CodeBlock language="bash" code={`ls -la /etc/passwd
# -rw-r--r-- 1 root root 2823 Jan 1 00:00 /etc/passwd
# │││ │││ │││
# │││ │││ └── outros: r-- (só leitura = 4)
# │││ └────── grupo:  r-- (só leitura = 4)
# │└────────── dono:  rw- (leitura+escrita = 6)
# └─────────── tipo: - (arquivo regular), d (diretório), l (link)

# Forma numérica: 644
# dono=6(rw), grupo=4(r), outros=4(r)`} />

      <h2>Alterando permissões</h2>
      <CodeBlock language="bash" code={`# chmod — alterar permissões
chmod 755 script.sh           # rwxr-xr-x
chmod 644 arquivo.txt         # rw-r--r--
chmod 600 chave.pem           # rw------- (só o dono)
chmod +x script.sh            # adiciona execução para todos
chmod -x script.sh            # remove execução
chmod u+x,g-w arquivo         # dono+execução, grupo-escrita

# chown — alterar dono/grupo
sudo chown root arquivo.txt           # muda dono para root
sudo chown kali:kali arquivo.txt      # muda dono e grupo
sudo chown -R kali /home/kali/pasta   # recursivo

# chgrp — alterar grupo
sudo chgrp sudo arquivo.txt`} />

      <h2>Bits especiais: SUID, SGID e Sticky Bit</h2>
      <AlertBox type="danger" title="SUID — Ponto crítico em escalação de privilégios">
        Arquivos com SUID de root rodam com privilégios de root, independente de quem executa. 
        São um vetor clássico de escalação de privilégios!
      </AlertBox>
      <CodeBlock language="bash" code={`# SUID (4000) — executa com permissão do dono
chmod 4755 programa     # rws (s = SUID ativo)
ls -la /usr/bin/passwd  # -rwsr-xr-x (SUID de root!)

# Encontrar todos os SUID de root (pentest!)
find / -perm -4000 -user root 2>/dev/null
find / -perm -u=s -type f 2>/dev/null

# SGID (2000) — executa com permissão do grupo
chmod 2755 programa     # rwxr-sr-x

# Sticky Bit (1000) — só o dono pode deletar (ex: /tmp)
chmod 1777 /tmp         # drwxrwxrwt
ls -la / | grep tmp     # drwxrwxrwt

# Combinando: SUID + rwxr-xr-x = 4755
chmod 4755 arquivo      # rwsr-xr-x`} />

      <h2>Capabilities</h2>
      <CodeBlock language="bash" code={`# Ver capabilities de um binário
getcap /usr/bin/python3
getcap -r / 2>/dev/null    # encontrar todas as capabilities

# Exemplos perigosos de capabilities para pentest:
# cap_setuid — pode trocar UID (→ root!)
# cap_net_raw — pode criar raw sockets (Wireshark sem root)
# cap_sys_ptrace — pode tracer processos

# Adicionar capability (root)
sudo setcap cap_net_raw+ep /usr/bin/tcpdump

# Remover capabilities
sudo setcap -r /usr/bin/arquivo`} />

      <h2>ACLs (Access Control Lists)</h2>
      <CodeBlock language="bash" code={`# Ver ACLs
getfacl arquivo.txt

# Adicionar ACL para usuário específico
setfacl -m u:www-data:r arquivo.txt

# Remover ACL
setfacl -x u:www-data arquivo.txt

# ACL default (herança para novos arquivos)
setfacl -d -m g:desenvolvedores:rw pasta/`} />

      <h2>sudo — executar como root</h2>
      <CodeBlock language="bash" code={`# Executar comando como root
sudo apt update
sudo systemctl restart apache2

# Entrar como root
sudo -i          # shell de root
sudo su -        # alternativa
su root          # trocar para root (pede senha do root)

# Ver o que você pode fazer com sudo
sudo -l

# Editar sudoers (SEMPRE use visudo!)
sudo visudo

# Exemplos no /etc/sudoers:
# kali ALL=(ALL:ALL) ALL          # tudo como root
# kali ALL=(ALL) NOPASSWD: ALL    # sem senha (perigoso!)
# kali ALL=(ALL) NOPASSWD: /usr/bin/nmap  # só nmap sem senha`} />
    </PageContainer>
  );
}
