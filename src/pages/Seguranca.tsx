import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Seguranca() {
  return (
    <PageContainer
      title="Hardening do Kali — UFW, sudoers, lynis, firejail"
      subtitle="Kali vem destravado de propósito. Antes de levar pra cliente ou expor na internet, feche tudo que não precisa."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>Por que Kali é 'inseguro' por default</h2>
      <p>
        Kali não é um SO de produção, é uma <strong>oficina ofensiva</strong>. Por isso vem com:
        SSH desabilitado mas com chaves estáticas históricas, root permissivo, firewall desligado,
        AppArmor em modo complain, e dezenas de daemons (Postgres, Apache, Nginx) prontos pra subir
        com config exemplo. Antes de conectar essa máquina na rede do cliente — ou pior, expor IP
        público pra C2 callback — você <strong>precisa</strong> fazer hardening.
      </p>

      <AlertBox type="warning" title="Cuidado: ferramenta defensiva pode quebrar ferramenta ofensiva">
        UFW bloqueando inbound vai matar listeners (msfconsole, nc -lvnp).
        AppArmor enforce em apparmor_profiles pode bloquear scripts em /tmp.
        Faça hardening em <strong>perfis</strong>: máquina de listener vs máquina de teste.
      </AlertBox>

      <h2>UFW — firewall amigável</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install ufw -y",
            out: "ufw is already the newest version (0.36.2-6).",
            outType: "muted",
          },
          {
            cmd: "sudo ufw status verbose",
            out: "Status: inactive",
            outType: "warning",
          },
          {
            comment: "policy padrão: bloqueia tudo entrada, libera saída",
            cmd: "sudo ufw default deny incoming && sudo ufw default allow outgoing",
            out: `Default incoming policy changed to 'deny'
Default outgoing policy changed to 'allow'`,
            outType: "info",
          },
          {
            comment: "permita SSH ANTES de habilitar (senão você se tranca)",
            cmd: "sudo ufw allow from 10.10.0.0/16 to any port 22 proto tcp",
            out: "Rules updated",
            outType: "success",
          },
          {
            comment: "rate-limit SSH (anti brute force passivo)",
            cmd: "sudo ufw limit 22/tcp",
            out: "Rule added (limit: 6 hits in 30s)",
            outType: "info",
          },
          {
            cmd: "sudo ufw allow 8080/tcp comment 'meu listener C2'",
            out: "Rules updated",
            outType: "success",
          },
          {
            cmd: "sudo ufw enable",
            out: `Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup`,
            outType: "warning",
          },
          {
            cmd: "sudo ufw status numbered",
            out: `Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     LIMIT IN    Anywhere
[ 2] 8080/tcp                   ALLOW IN    Anywhere       # meu listener C2
[ 3] 22 (v6)                    LIMIT IN    Anywhere (v6)
[ 4] 8080/tcp (v6)              ALLOW IN    Anywhere (v6)`,
            outType: "default",
          },
          {
            comment: "log policy → /var/log/ufw.log",
            cmd: "sudo ufw logging medium",
            out: "Logging enabled",
            outType: "info",
          },
          {
            cmd: "sudo ufw delete 2",
            out: "Rule deleted",
            outType: "muted",
          },
        ]}
      />

      <h2>iptables / nftables — quando UFW não chega</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali já migrou pra nftables como backend (iptables-nft)",
            cmd: "sudo iptables -L -n -v",
            out: `Chain INPUT (policy ACCEPT 42 packets, 3142 bytes)
 pkts bytes target     prot opt in     out     source               destination         
   18  1080 ufw-before-input  0    --  *      *       0.0.0.0/0            0.0.0.0/0           
    0     0 ufw-after-input   0    --  *      *       0.0.0.0/0            0.0.0.0/0           
[...]`,
            outType: "info",
          },
          {
            comment: "regra crua: SNAT pra C2 sair com IP específico",
            cmd: "sudo iptables -t nat -A POSTROUTING -s 10.10.10.0/24 -o eth0 -j SNAT --to 203.0.113.50",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "nftables nativo (sintaxe nova)",
            cmd: "sudo nft list ruleset | head -15",
            out: `table inet filter {
        chain input {
                type filter hook input priority filter; policy drop;
                ct state established,related accept
                iif "lo" accept
                tcp dport 22 accept
        }
        chain forward {
                type filter hook forward priority filter; policy drop;
        }
        chain output {
                type filter hook output priority filter; policy accept;
        }
}`,
            outType: "default",
          },
          {
            comment: "salvar regras pra persistir reboot",
            cmd: "sudo iptables-save | sudo tee /etc/iptables/rules.v4",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Sudoers — controle de privilégio</h2>
      <p>
        Em pentest, <code>sudo -l</code> no alvo é o primeiro check pra PrivEsc. Aqui você aprende
        a configurar pro lado defensor (e a entender exatamente quais entradas explorar do outro lado).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "SEMPRE edite com visudo (valida sintaxe antes de salvar)",
            cmd: "sudo visudo",
            out: "(abre /etc/sudoers no editor)",
            outType: "muted",
          },
          {
            cmd: "sudo -l",
            out: `User wallyson may run the following commands on kali:
    (ALL : ALL) ALL
    (root) NOPASSWD: /usr/bin/tcpdump
    (root) NOPASSWD: /usr/sbin/wireshark`,
            outType: "warning",
          },
        ]}
      />

      <CodeBlock
        language="bash"
        title="/etc/sudoers.d/wallyson-pentest"
        code={`# Drop-in (NÃO edite /etc/sudoers diretamente)
# Permite ferramentas de captura sem senha — workflow ágil
wallyson ALL=(root) NOPASSWD: /usr/bin/tcpdump
wallyson ALL=(root) NOPASSWD: /usr/sbin/wireshark
wallyson ALL=(root) NOPASSWD: /usr/sbin/airodump-ng
wallyson ALL=(root) NOPASSWD: /usr/sbin/airmon-ng

# Bloqueia explicitamente edição da própria policy (anti-tamper)
wallyson ALL=(ALL) !/usr/sbin/visudo, !/bin/su

# Audit: tudo que rodar com sudo vai pro syslog
Defaults logfile=/var/log/sudo.log
Defaults log_input,log_output
Defaults timestamp_timeout=15
Defaults passwd_tries=3
Defaults badpass_message="Tentativa registrada."`}
      />

      <CommandTable
        title="Padrões PERIGOSOS no sudoers (use pra atacar)"
        variations={[
          { cmd: "(ALL) NOPASSWD: /usr/bin/find", desc: "find tem -exec → root shell instantâneo.", output: "sudo find /etc -exec /bin/sh \\;" },
          { cmd: "(ALL) NOPASSWD: /usr/bin/vim", desc: "Vim com :!sh → escape.", output: "sudo vim → :!sh" },
          { cmd: "(ALL) NOPASSWD: /usr/bin/awk", desc: "BEGIN{system}.", output: "sudo awk 'BEGIN{system(\"/bin/sh\")}'" },
          { cmd: "(ALL) NOPASSWD: /usr/bin/less", desc: "Less !sh.", output: "sudo less /etc/passwd → !sh" },
          { cmd: "ENV_KEEP+=\"LD_PRELOAD\"", desc: "Permite carregar lib maliciosa.", output: "Compile shell.so e LD_PRELOAD=./shell.so sudo qualquer." },
          { cmd: "(ALL) NOPASSWD: ALL", desc: "Equivale a senha=root.", output: "sudo su -" },
        ]}
      />

      <AlertBox type="info" title="GTFOBins">
        Decorou? <code>gtfobins.github.io</code> tem TODA binária com técnica de escape sudo/SUID
        documentada. Em PrivEsc Linux, é a primeira aba aberta sempre.
      </AlertBox>

      <h2>PAM — quem pode logar e como</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /etc/pam.d/",
            out: `chfn          common-auth      cron       login     other      runuser-l  sshd
chpasswd      common-password  groupadd   newusers  passwd     samba      su
chsh          common-session   gnome-screensaver-accounts polkit-1  sudo
common-account  cron-daily      gnome-keyring usermod  sudo-i
runuser`,
            outType: "default",
          },
          {
            comment: "ex: força senha forte via pwquality",
            cmd: "sudo apt install -y libpam-pwquality && sudo grep pwquality /etc/pam.d/common-password",
            out: "password requisite pam_pwquality.so retry=3 minlen=12 difok=4 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1",
            outType: "info",
          },
          {
            comment: "trava conta após N tentativas (faillock)",
            cmd: "sudo grep faillock /etc/pam.d/common-auth",
            out: `auth required pam_faillock.so preauth silent deny=5 unlock_time=1800
auth [default=die] pam_faillock.so authfail deny=5 unlock_time=1800
auth sufficient pam_faillock.so authsucc`,
            outType: "warning",
          },
        ]}
      />

      <h2>Lynis — auditoria automática</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install lynis -y",
            out: "Setting up lynis (3.1.1-1) ...",
            outType: "muted",
          },
          {
            cmd: "sudo lynis audit system",
            out: `[+] Initializing program
  - Detecting OS              [ DONE ]
  - Checking profiles         [ DONE ]
[...]
[+] Authentication
  - PAM module pam_cracklib.so   [ NOT FOUND ]
  - PAM module pam_pwquality.so  [ FOUND ]
  - Checking sudoers file        [ FOUND ]
  - Check sudoers file (perms)   [ OK ]
[+] Hardening
  - Installed compiler            [ FOUND ]    [WARNING: gcc available to non-root]
  - Installed malware scanner     [ NOT FOUND ]

[ Lynis 3.1.1 Results ]
- Tests performed: 248
- Plugins enabled: 2
- Warnings (5):
   ! Reboot required (kernel updated)
   ! No password set for single user mode
   ! /tmp not on separate partition
   ! Couldn't find 2 responsive nameservers
   ! No firewall configured
- Suggestions (37):
   * Set GRUB2 password
   * Install AIDE for file integrity
   * Configure minimum password age
   ...
- Hardening index: 64 [############        ]`,
            outType: "warning",
          },
          {
            cmd: "sudo lynis show details TEST-ID-AUTH-9230",
            out: "(mostra detalhes + sugestão exata pra remediar aquele teste)",
            outType: "info",
          },
        ]}
      />

      <h2>Firejail — sandbox por processo</h2>
      <p>
        Roda binário desconhecido (sample de malware, AppImage de fonte duvidosa) em namespace isolado:
        sem acesso a $HOME, sem rede (opcional), com filesystem readonly.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install firejail firejail-profiles -y",
            out: "Setting up firejail (0.9.72-3) ...",
            outType: "muted",
          },
          {
            comment: "roda firefox em sandbox padrão",
            cmd: "firejail firefox",
            out: `Reading profile /etc/firejail/firefox.profile
Parent pid 12420, child pid 12421
Child process initialized in 14.21 ms`,
            outType: "info",
          },
          {
            comment: "isolamento agressivo: sem rede, sem $HOME",
            cmd: "firejail --net=none --private --noprofile ./suspicious_binary",
            out: `Parent pid 13001, child pid 13002
Setting up an empty home directory
Networking disabled
Child process initialized in 22.4 ms`,
            outType: "warning",
          },
          {
            comment: "ver o que rodou em sandbox",
            cmd: "firejail --list",
            out: `12420:wallyson:firejail firefox
13001:wallyson:firejail --net=none --private ./suspicious_binary`,
            outType: "default",
          },
        ]}
      />

      <h2>SSH — endurecer o daemon</h2>
      <CodeBlock
        language="ini"
        title="/etc/ssh/sshd_config (overrides)"
        code={`Port 22022
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
UsePAM yes

# Lista branca de usuários
AllowUsers wallyson@10.10.0.* operador@*

# Algoritmos modernos só
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512
KexAlgorithms curve25519-sha256@libssh.org,curve25519-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

LoginGraceTime 30
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 0
LogLevel VERBOSE`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo sshd -t && sudo systemctl restart ssh",
            out: "(silencioso = config ok)",
            outType: "success",
          },
          {
            comment: "audit do daemon ativo",
            cmd: "sudo ss -tlnp | grep sshd",
            out: "LISTEN 0 128 0.0.0.0:22022 0.0.0.0:* users:((\"sshd\",pid=14820,fd=3))",
            outType: "info",
          },
        ]}
      />

      <h2>AIDE — integridade de arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install aide -y && sudo aideinit",
            out: `Running aide --init...
End timestamp: 2026-04-03 21:14:02
Number of entries: 142841
The new database has been written.
Please run 'cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db'`,
            outType: "info",
          },
          {
            cmd: "sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "depois de uns dias, checa o que mudou",
            cmd: "sudo aide --check | head -20",
            out: `AIDE 0.18.6 found differences between database and filesystem!!
Start timestamp: 2026-04-04 09:00:01

Summary:
  Total number of entries:    142849
  Added entries:                    8
  Removed entries:                  0
  Changed entries:                  3

Added entries:
f++++++++++++++++: /etc/cron.d/persistence
f++++++++++++++++: /usr/local/bin/.svchost
Changed entries:
f   p.....TS.....: /etc/passwd
f   ...........: /etc/sudoers`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Hardening rápido em 5 minutos"
        goal="Aplicar baseline mínimo: firewall, ssh-key only, sudo log, lynis baseline."
        steps={[
          "Habilite UFW deny-incoming + allow SSH limitado.",
          "Desabilite PasswordAuthentication no SSH.",
          "Force log de tudo via sudo.",
          "Rode lynis e salve o índice base.",
        ]}
        command={`sudo ufw default deny incoming
sudo ufw allow from 10.10.0.0/16 to any port 22 proto tcp
sudo ufw limit 22/tcp
sudo ufw --force enable

sudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh

echo 'Defaults log_input,log_output' | sudo tee -a /etc/sudoers.d/audit
sudo lynis audit system --quick | grep "Hardening index"`}
        expected={`Firewall is active and enabled on system startup
[ Hardening index ] = 71`}
        verify="O índice deve subir 5-10 pontos comparado ao default (~64). Repita lynis depois de cada mudança."
      />

      <AlertBox type="danger" title="Lembre-se: você é o atacante também">
        Tudo que você endurece aqui vai aparecer do outro lado em <code>sudo -l</code>,{" "}
        <code>cat /etc/sudoers</code>, <code>iptables -L</code> dos alvos.
        Estudar defesa ativa = saber exatamente o que procurar quando vira PrivEsc.
      </AlertBox>
    </PageContainer>
  );
}
