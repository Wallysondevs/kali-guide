import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SSH() {
  return (
    <PageContainer
      title="SSH — Conexão Remota Segura"
      subtitle="Cliente, servidor, chaves, agentes, tunelamento e hardening — o canivete do pentester."
      difficulty="iniciante"
      timeToRead="20 min"
    >
      <h2>Conexão básica</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ssh wallyson@192.168.1.50",
            out: `The authenticity of host '192.168.1.50 (192.168.1.50)' can't be established.
ED25519 key fingerprint is SHA256:XKF/4xXp8aQRSm8mLZ9rz7qVKKLZxX9...
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.1.50' (ED25519) to the list of known hosts.
wallyson@192.168.1.50's password: 
Linux target 6.1.0-23-amd64 #1 SMP Debian 6.1.99-1 (2024-07-15) x86_64

Last login: Fri Apr  3 09:58:24 2026 from 192.168.1.42
wallyson@target:~$`,
            outType: "info",
          },
          {
            comment: "outros formatos válidos",
            cmd: "ssh -p 2222 root@10.10.10.5",
            out: "(porta customizada com -p)",
            outType: "muted",
          },
          {
            cmd: "ssh wallyson@bastion.cliente.com -i ~/.ssh/cliente_ed25519",
            out: "(usando chave privada específica com -i)",
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Flags essenciais do cliente ssh"
        variations={[
          { cmd: "-p 2222", desc: "Porta diferente da 22.", output: "ssh -p 2222 user@host" },
          { cmd: "-i ~/.ssh/key", desc: "Chave privada específica.", output: "Útil quando você tem várias." },
          { cmd: "-l usuario", desc: "Usuário (alternativa a user@host).", output: "ssh -l root host = ssh root@host" },
          { cmd: "-v / -vv / -vvv", desc: "Verbosity (debug). Tripla quase sempre acha o problema.", output: "Mostra negociação cripto, auth, etc." },
          { cmd: "-N", desc: "Não abre shell (só túnel).", output: "Combinado com -L/-R/-D." },
          { cmd: "-f", desc: "Background depois de autenticar.", output: "Para túneis persistentes." },
          { cmd: "-C", desc: "Compressão (útil em links lentos).", output: "Bom para X11/SCP em link 3G." },
          { cmd: "-J bastion@host", desc: "ProxyJump: pula por um bastion.", output: "ssh -J bastion@a.com user@b.com" },
          { cmd: "-o StrictHostKeyChecking=no", desc: "Aceita fingerprint sem perguntar (cuidado!).", output: "Útil em scripts/CI." },
        ]}
      />

      <h2>Chaves SSH (sem senha, com segurança)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ED25519 é o algoritmo moderno recomendado",
            cmd: "ssh-keygen -t ed25519 -C \"wallyson@kali\"",
            out: `Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/wallyson/.ssh/id_ed25519): 
Enter passphrase (empty for no passphrase): ********
Enter same passphrase again: ********
Your identification has been saved in /home/wallyson/.ssh/id_ed25519
Your public key has been saved in /home/wallyson/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:Pj9aPxX7kKKxLZ9mqRSm8mLZ9rz7qVKK wallyson@kali
The key's randomart image is:
+--[ED25519 256]--+
|    .o.+oE.      |
|   . .o.* o      |
|  o = .o.+ . .   |
| . O.* +.+.* .   |
|  =+B B So+ +    |
|   *.= o oo=     |
|  o B + ..o o    |
|   = + .  .      |
|    .            |
+----[SHA256]-----+`,
            outType: "success",
          },
          {
            cmd: "ls -l ~/.ssh/",
            out: `-rw------- 1 wallyson wallyson  411 Apr  3 10:05 id_ed25519
-rw-r--r-- 1 wallyson wallyson   95 Apr  3 10:05 id_ed25519.pub
-rw-r--r-- 1 wallyson wallyson  178 Apr  3 09:55 known_hosts`,
            outType: "info",
          },
          {
            cmd: "cat ~/.ssh/id_ed25519.pub",
            out: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPj9aPxX7kKKxLZ9mqRSm8mLZ9rz7qVKK wallyson@kali",
            outType: "default",
          },
        ]}
      />

      <h3>Copiar chave para o servidor</h3>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ssh-copy-id automatiza tudo",
            cmd: "ssh-copy-id -i ~/.ssh/id_ed25519.pub wallyson@192.168.1.50",
            out: `/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/wallyson/.ssh/id_ed25519.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
wallyson@192.168.1.50's password: 

Number of key(s) added: 1

Now try logging into the machine, with: "ssh 'wallyson@192.168.1.50'"
and check to make sure that only the key(s) you wanted were added.`,
            outType: "success",
          },
          {
            cmd: "ssh wallyson@192.168.1.50",
            out: `Enter passphrase for key '/home/wallyson/.ssh/id_ed25519': 
Linux target 6.1.0-23-amd64 ...
wallyson@target:~$`,
            outType: "info",
          },
        ]}
      />

      <h3>ssh-agent — digite a passphrase só uma vez</h3>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "eval \"$(ssh-agent -s)\"",
            out: "Agent pid 14523",
            outType: "muted",
          },
          {
            cmd: "ssh-add ~/.ssh/id_ed25519",
            out: `Enter passphrase for /home/wallyson/.ssh/id_ed25519: 
Identity added: /home/wallyson/.ssh/id_ed25519 (wallyson@kali)`,
            outType: "success",
          },
          {
            cmd: "ssh-add -l",
            out: "256 SHA256:Pj9aPxX7kKKxLZ9mqRSm8mLZ9rz7qVKK wallyson@kali (ED25519)",
            outType: "info",
          },
          {
            comment: "agora as próximas conexões não pedem passphrase",
            cmd: "ssh wallyson@192.168.1.50 'whoami'",
            out: "wallyson",
            outType: "default",
          },
        ]}
      />

      <h2>SCP e SFTP — transferir arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "enviar arquivo local → remoto",
            cmd: "scp loot.zip wallyson@192.168.1.50:/tmp/",
            out: `loot.zip                                100%   42MB  18.4MB/s   00:02`,
            outType: "info",
          },
          {
            comment: "baixar remoto → local",
            cmd: "scp wallyson@192.168.1.50:/etc/passwd ./passwd_target",
            out: `passwd_target                           100% 2147     1.2MB/s   00:00`,
            outType: "default",
          },
          {
            comment: "diretório inteiro (-r)",
            cmd: "scp -r reports/ wallyson@192.168.1.50:/home/wallyson/",
            out: `report1.pdf                             100%  1.2MB  ...
report2.pdf                             100%  876KB ...`,
            outType: "default",
          },
          {
            comment: "rsync é mais rápido para muitos arquivos",
            cmd: "rsync -avz --progress reports/ wallyson@192.168.1.50:/home/wallyson/reports/",
            out: `sending incremental file list
report1.pdf
      1,234,567 100%  18.42MB/s    0:00:00 (xfr#1, to-chk=1/2)
report2.pdf
        897,432 100%  14.21MB/s    0:00:00 (xfr#0, to-chk=0/2)
sent 2,135,103 bytes  received 84 bytes  854,074.80 bytes/sec`,
            outType: "success",
          },
        ]}
      />

      <h2>Servidor SSH (sshd)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo systemctl enable --now ssh",
            out: `Created symlink /etc/systemd/system/ssh.service.wants/ssh.service.
Synchronizing state of ssh.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.`,
            outType: "success",
          },
          {
            cmd: "sudo ss -tlnp | grep ssh",
            out: `LISTEN 0  128         0.0.0.0:22         0.0.0.0:*   users:(("sshd",pid=14823,fd=3))
LISTEN 0  128            [::]:22            [::]:*   users:(("sshd",pid=14823,fd=4))`,
            outType: "info",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="/etc/ssh/sshd_config — configuração HARDENED"
        code={`# Trocar porta padrão (defesa em profundidade, não real segurança)
Port 2222

# Apenas IPv4 (se não usa IPv6)
# AddressFamily inet

# Banner antes do login
Banner /etc/ssh/banner

# Login de root: nunca, ou só com chave
PermitRootLogin no
# PermitRootLogin prohibit-password   # alternativa: só chave

# Senha NÃO — só chaves SSH
PasswordAuthentication no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
UsePAM yes

# Chaves
PubkeyAuthentication yes
AuthorizedKeysFile     .ssh/authorized_keys

# Limite de tentativas e tempo
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Restringir usuários
AllowUsers wallyson admin
# Ou por grupo:
# AllowGroups ssh-users

# Algoritmos modernos apenas
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Desabilitar X11 e túneis se não usa
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
PermitTunnel no

# Logs verbosos
LogLevel VERBOSE`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "validar a sintaxe ANTES de reiniciar",
            cmd: "sudo sshd -t",
            out: "(silencioso = OK. erro = mostra a linha errada)",
            outType: "muted",
          },
          {
            cmd: "sudo systemctl restart ssh",
            out: "(silencioso)",
            outType: "default",
          },
          {
            comment: "testar de outro terminal SEM fechar a sessão atual!",
            cmd: "ssh -p 2222 wallyson@192.168.1.50",
            out: "Welcome to Kali ...",
            outType: "success",
          },
        ]}
      />

      <h2>Túneis SSH (port forwarding)</h2>
      <CommandTable
        title="Os 3 modos de túnel"
        variations={[
          { cmd: "-L 8080:web.interna:80", desc: "LOCAL → REMOTO. Cliente abre porta local que sai pelo servidor.", output: "Acessa http://localhost:8080 e cai no http da web.interna." },
          { cmd: "-R 4444:127.0.0.1:5900", desc: "REVERSO. Servidor abre porta que volta pro cliente.", output: "Útil para callback de uma máquina interna sem porta aberta." },
          { cmd: "-D 1080", desc: "SOCKS proxy dinâmico (-D porta).", output: "Configure firefox/proxychains apontando 127.0.0.1:1080 e tudo sai pelo servidor." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "exemplo prático: acessar painel HTTP interno via SSH",
            cmd: "ssh -L 8080:192.168.10.5:80 -N -f wallyson@bastion.empresa.com",
            out: "(roda em background. agora curl http://localhost:8080 vai pro 192.168.10.5:80)",
            outType: "success",
          },
          {
            cmd: "curl -s http://localhost:8080 | head -3",
            out: `<!DOCTYPE html>
<html lang="en">
<title>Painel Interno - ACME Corp</title>`,
            outType: "info",
          },
          {
            comment: "matar o túnel quando terminar",
            cmd: "pkill -f 'ssh -L 8080'",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <p>
        Para tunelamento avançado (chisel, sshuttle, dynamic SOCKS) veja a página{" "}
        <a href="#/ssh-tunneling"><strong>SSH Tunneling & Chisel</strong></a> e{" "}
        <a href="#/proxychains"><strong>Proxychains</strong></a>.
      </p>

      <h2>~/.ssh/config — apelidos</h2>
      <CodeBlock
        language="ssh-config"
        title="~/.ssh/config — torne sua vida fácil"
        code={`# Padrões para todos
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    HashKnownHosts yes

# Apelido simples
Host htb
    HostName 10.10.14.42
    User htb-student
    IdentityFile ~/.ssh/htb_ed25519

# Bastion + ProxyJump
Host bastion
    HostName bastion.acme.com
    User wallyson
    IdentityFile ~/.ssh/acme_ed25519

Host interno-*
    User wallyson
    ProxyJump bastion
    IdentityFile ~/.ssh/acme_ed25519

# Agora você só digita "ssh htb" ou "ssh interno-db01"`}
      />

      <PracticeBox
        title="Setup SSH endurecido com chaves + porta nova"
        goal="Configurar um SSH 'pronto para internet' bloqueando senha, root, e usando porta alternativa."
        steps={[
          "Gere uma chave ED25519 com passphrase.",
          "Copie para o servidor com ssh-copy-id.",
          "Edite /etc/ssh/sshd_config: Port 2222, PermitRootLogin no, PasswordAuthentication no.",
          "Valide com sshd -t e reinicie o serviço.",
          "Teste o login com a nova porta. Tente login com senha — deve falhar.",
        ]}
        command={`ssh-keygen -t ed25519 -C "$(whoami)@kali"
ssh-copy-id -i ~/.ssh/id_ed25519.pub wallyson@servidor.com
sudo sed -i 's/^#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/^#PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl restart ssh
ssh -p 2222 wallyson@servidor.com`}
        expected={`Linux servidor 6.1.0-23-amd64 ...
Last login: Fri Apr  3 10:31:14 2026 from 192.168.1.42
wallyson@servidor:~$`}
        verify="Tente ssh -o PreferredAuthentications=password wallyson@servidor.com — deve recusar com 'Permission denied (publickey)'."
      />

      <AlertBox type="danger" title="Não trave seu SSH antes de testar">
        <strong>Sempre</strong> mantenha uma sessão aberta enquanto edita
        <code>sshd_config</code>. Se a nova config quebrar, você ainda tem a sessão antiga
        para reverter. Testar a sintaxe com <code>sudo sshd -t</code> também é obrigatório
        antes do <code>systemctl restart</code>.
      </AlertBox>
    </PageContainer>
  );
}
