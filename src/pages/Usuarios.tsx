import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Usuarios() {
  return (
    <PageContainer
      title="Usuários e Grupos"
      subtitle="/etc/passwd, /etc/shadow, useradd, sudoers — gestão de identidade no Linux."
      difficulty="iniciante"
      timeToRead="12 min"
      prompt="sistema/usuarios"
    >
      <h2>Onde os usuários ficam armazenados</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "head -5 /etc/passwd",
            out: `root:x:0:0:root:/root:/usr/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync`,
            outType: "info",
          },
        ]}
      />

      <OutputBlock label="formato de /etc/passwd" type="muted">
{`root:x:0:0:root:/root:/usr/bin/zsh
│   │ │ │ │    │     └─ shell de login
│   │ │ │ │    └─────── home directory
│   │ │ │ └──────────── descrição (GECOS)
│   │ │ └────────────── GID (grupo primário)
│   │ └──────────────── UID (root sempre = 0)
│   └────────────────── senha (x = está em /etc/shadow)
└────────────────────── nome de login`}
      </OutputBlock>

      <Terminal
        path="~"
        lines={[
          {
            comment: "/etc/shadow tem os hashes de senha, só root lê",
            cmd: "sudo head -3 /etc/shadow",
            out: `root:$y$j9T$Z6F8pQa.../...:19821:0:99999:7:::
daemon:*:19821:0:99999:7:::
bin:*:19821:0:99999:7:::`,
            outType: "warning",
          },
          {
            cmd: "sudo head -3 /etc/group",
            out: `root:x:0:
daemon:x:1:
bin:x:2:`,
            outType: "default",
          },
        ]}
      />

      <CommandTable
        title="Tipos de hash em /etc/shadow"
        variations={[
          { cmd: "$y$...", desc: "yescrypt (padrão Debian/Kali atual). Forte e lento.", output: "Hashcat: -m 32500" },
          { cmd: "$6$...", desc: "SHA-512 (legacy ~2010-2020).", output: "Hashcat: -m 1800 / John: sha512crypt" },
          { cmd: "$1$...", desc: "MD5 (legado, fraco).", output: "Hashcat: -m 500 / John: md5crypt" },
          { cmd: "*  ou !", desc: "Conta sem senha (não pode logar com password).", output: "Usado para serviços (daemon, www-data)." },
          { cmd: "(vazio)", desc: "Sem senha — login direto. PERIGO.", output: "Edite/remova imediatamente." },
        ]}
      />

      <h2>Criar e remover usuários</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "useradd é low-level. -m cria home, -s define shell",
            cmd: "sudo useradd -m -s /bin/bash maria",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
          {
            cmd: "sudo passwd maria",
            out: `New password: 
Retype new password: 
passwd: password updated successfully`,
            outType: "success",
          },
          {
            comment: "atalho interativo do Debian/Kali (faz tudo de uma vez)",
            cmd: "sudo adduser carlos",
            out: `Adding user 'carlos' ...
Adding new group 'carlos' (1002) ...
Adding new user 'carlos' (1002) with group 'carlos' ...
Creating home directory '/home/carlos' ...
Copying files from '/etc/skel' ...
New password: 
Retype new password: 
passwd: password updated successfully
Changing the user information for carlos
Enter the new value, or press ENTER for the default
        Full Name []: Carlos Silva
        Room Number []: 
        Work Phone []: 
        Home Phone []: 
        Other []: 
Is the information correct? [Y/n] Y`,
            outType: "info",
          },
          {
            comment: "remover usuário (mantém o home)",
            cmd: "sudo userdel maria",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "remover usuário + apagar /home/maria",
            cmd: "sudo userdel -r maria",
            out: "(silencioso)",
            outType: "warning",
          },
        ]}
      />

      <h2>Modificar usuários (usermod)</h2>
      <CommandTable
        title="Operações comuns com usermod"
        variations={[
          { cmd: "sudo usermod -aG sudo wallyson", desc: "Adiciona ao grupo 'sudo' (poder de virar root).", output: "wallyson agora pode usar sudo." },
          { cmd: "sudo usermod -aG docker,wireshark wallyson", desc: "Adiciona a vários grupos de uma vez (-a = append, -G = grupos).", output: "Sem -a, ele REMOVE dos outros grupos." },
          { cmd: "sudo usermod -L maria", desc: "Trava (lock) a conta — não pode mais logar com senha.", output: "passwd entry vira !$y$... em /etc/shadow." },
          { cmd: "sudo usermod -U maria", desc: "Desbloqueia.", output: "Remove o ! do shadow." },
          { cmd: "sudo usermod -s /usr/sbin/nologin maria", desc: "Bloqueia shell de login (mas não outros serviços).", output: "Login responde 'This account is currently not available.'" },
          { cmd: "sudo usermod -d /home/nova maria", desc: "Muda home directory (use com -m para mover).", output: "Movimento: -m -d /home/nova" },
        ]}
      />

      <h2>Grupos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "groups wallyson",
            out: "wallyson : wallyson sudo audio video plugdev kali-trusted netdev wireshark",
            outType: "info",
          },
          {
            cmd: "id wallyson",
            out: `uid=1000(wallyson) gid=1000(wallyson) groups=1000(wallyson),27(sudo),29(audio),44(video),46(plugdev),113(wireshark)`,
            outType: "default",
          },
          {
            comment: "criar grupo novo",
            cmd: "sudo groupadd -g 1500 pentesters",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo usermod -aG pentesters wallyson",
            out: "(precisa fazer logout/login para o grupo entrar em vigor)",
            outType: "warning",
          },
          {
            comment: "ativar grupo na sessão atual SEM relogar",
            cmd: "newgrp pentesters",
            out: "(abre subshell já com o grupo ativo)",
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Grupos importantes do Kali"
        variations={[
          { cmd: "sudo", desc: "Membros podem usar sudo (escalar para root).", output: "Configurado em /etc/sudoers como %sudo ALL=(ALL) ALL" },
          { cmd: "wireshark", desc: "Captura pacotes em interfaces sem ser root.", output: "Necessário para Wireshark/tshark sem sudo." },
          { cmd: "docker", desc: "Equivale a root (pode montar / via container).", output: "Privilégio sensível — só dê a quem confia." },
          { cmd: "kali-trusted", desc: "Acesso a recursos especiais do Kali (PolicyKit).", output: "Usuários da instalação default já estão dentro." },
          { cmd: "plugdev / dialout", desc: "Acesso a USB e portas seriais.", output: "Necessário para hardware (HackRF, RTL-SDR)." },
          { cmd: "audio / video", desc: "Acesso a áudio e câmera.", output: "Padrão para usuários desktop." },
        ]}
      />

      <h2>sudo — escalando para root</h2>
      <p>
        <strong>sudo</strong> permite executar comandos como outro usuário (geralmente root).
        Configurado em <code>/etc/sudoers</code>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo whoami",
            out: `[sudo] password for wallyson: 
root`,
            outType: "info",
          },
          {
            comment: "ver TUDO que você pode fazer com sudo",
            cmd: "sudo -l",
            out: `Matching Defaults entries for wallyson on kali:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User wallyson may run the following commands on kali:
    (ALL : ALL) ALL`,
            outType: "warning",
          },
          {
            comment: "abrir shell de root",
            cmd: "sudo -i",
            out: "root@kali:~# ",
            outType: "error",
          },
          {
            comment: "rodar comando como OUTRO usuário (não root)",
            cmd: "sudo -u www-data whoami",
            out: "www-data",
            outType: "default",
          },
        ]}
      />

      <h3>Editando /etc/sudoers com segurança</h3>
      <CodeBlock
        language="bash"
        title="visudo — sempre use este, NUNCA edite /etc/sudoers direto"
        code={`# Abre o sudoers no $EDITOR e valida antes de salvar
sudo visudo

# Sintaxe principal:
# usuario  HOST=(QUEM_PODE_VIRAR)  COMANDOS

# Permitir que 'maria' rode QUALQUER coisa como root pedindo senha
maria   ALL=(ALL:ALL) ALL

# Permitir que o grupo 'pentesters' rode SEM senha
%pentesters  ALL=(ALL) NOPASSWD: ALL

# Permitir só comandos específicos
backup  ALL=(root) NOPASSWD: /usr/bin/rsync, /bin/tar

# Snippet em arquivo separado (preferido):
# sudo visudo -f /etc/sudoers.d/pentesters`}
      />

      <AlertBox type="danger" title="NUNCA edite /etc/sudoers com nano direto">
        Um erro de sintaxe em <code>/etc/sudoers</code> trava o sudo do sistema inteiro
        e você não consegue mais virar root. Sempre use <code>sudo visudo</code> — ele valida
        antes de salvar e recusa erros.
      </AlertBox>

      <h2>Trocar senha e expiração</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "passwd",
            out: `Changing password for wallyson.
Current password: 
New password: 
Retype new password: 
passwd: password updated successfully`,
            outType: "success",
          },
          {
            comment: "info de expiração da conta",
            cmd: "sudo chage -l wallyson",
            out: `Last password change                                    : Mar 12, 2026
Password expires                                       : never
Password inactive                                      : never
Account expires                                        : never
Minimum number of days between password change         : 0
Maximum number of days between password change         : 99999
Number of days of warning before password expires      : 7`,
            outType: "info",
          },
          {
            comment: "forçar troca de senha no próximo login",
            cmd: "sudo chage -d 0 maria",
            out: "(silencioso. maria precisará trocar a senha ao logar)",
            outType: "default",
          },
        ]}
      />

      <PracticeBox
        title="Crie um usuário pentester com sudo NOPASSWD em ferramentas específicas"
        goal="Criar 'audit' que pode rodar nmap e tcpdump como root sem senha, mas nada mais."
        steps={[
          "Crie o usuário audit com home directory.",
          "Defina uma senha forte.",
          "Crie /etc/sudoers.d/audit liberando só os comandos desejados.",
          "Teste e confirme.",
        ]}
        command={`sudo adduser --gecos "" --disabled-password audit
sudo passwd audit
echo "audit ALL=(root) NOPASSWD: /usr/bin/nmap, /usr/bin/tcpdump" | \\
  sudo tee /etc/sudoers.d/audit
sudo chmod 0440 /etc/sudoers.d/audit
sudo -l -U audit`}
        expected={`Matching Defaults entries for audit on kali:
    env_reset, mail_badpass, secure_path=...

User audit may run the following commands on kali:
    (root) NOPASSWD: /usr/bin/nmap
    (root) NOPASSWD: /usr/bin/tcpdump`}
        verify={`Tente "sudo -u audit sudo nmap -sV 127.0.0.1" — funciona. "sudo -u audit sudo cat /etc/shadow" — falha.`}
      />

      <AlertBox type="info" title="Veja também">
        O abuso de sudo NOPASSWD em comandos errados (vim, find, awk, less) é um vetor
        clássico de privesc — está na página <a href="#/privesc-linux"><strong>PrivEsc — Linux</strong></a>.
      </AlertBox>
    </PageContainer>
  );
}
