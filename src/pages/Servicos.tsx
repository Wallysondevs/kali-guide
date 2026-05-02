import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Servicos() {
  return (
    <PageContainer
      title="Serviços com systemd"
      subtitle="Iniciar, parar, habilitar serviços, ler logs no journal e criar units customizadas."
      difficulty="iniciante"
      timeToRead="14 min"
      prompt="sistema/services"
    >
      <h2>Por que systemd importa</h2>
      <p>
        <strong>systemd</strong> é o init/processo 1 de praticamente toda distro Linux moderna,
        Kali incluso. Ele inicia serviços no boot, gerencia dependências, paraleliza inicialização
        e centraliza logs no <strong>journald</strong>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "systemctl --version",
            out: `systemd 256 (256.7-2)
+PAM +AUDIT +SELINUX +APPARMOR +IMA +SMACK +SECCOMP +GCRYPT +GNUTLS +OPENSSL +ACL +BLKID +CURL +ELFUTILS +FIDO2 +IDN2 -IDN +IPTC +KMOD +LIBCRYPTSETUP +LIBFDISK +PCRE2 -PWQUALITY +P11KIT +QRENCODE +TPM2 +BZIP2 +LZ4 +XZ +ZLIB +ZSTD +BPF_FRAMEWORK +XKBCOMMON +UTMP +SYSVINIT default-hierarchy=unified`,
            outType: "info",
          },
          {
            cmd: "ps -p 1 -o comm=",
            out: "systemd",
            outType: "success",
          },
        ]}
      />

      <h2>Operações básicas</h2>
      <CommandTable
        title="systemctl: ciclo de vida de serviços"
        variations={[
          { cmd: "sudo systemctl start ssh", desc: "Inicia AGORA (não roda no próximo boot).", output: "(silencioso = sucesso)" },
          { cmd: "sudo systemctl stop ssh", desc: "Para AGORA.", output: "(silencioso)" },
          { cmd: "sudo systemctl restart ssh", desc: "Reinicia (stop + start).", output: "(silencioso)" },
          { cmd: "sudo systemctl reload ssh", desc: "Recarrega config sem matar conexões (se o serviço suportar).", output: "Mais suave que restart." },
          { cmd: "sudo systemctl enable ssh", desc: "Habilita no boot (cria symlink em /etc/systemd/system/.../).", output: "Created symlink /etc/systemd/system/sshd.service.wants/ssh.service" },
          { cmd: "sudo systemctl disable ssh", desc: "Desabilita do boot (mantém parado).", output: "Removed symlink ..." },
          { cmd: "sudo systemctl enable --now ssh", desc: "Atalho: habilita E inicia agora.", output: "Created symlink + started." },
          { cmd: "sudo systemctl mask ssh", desc: "PROÍBE start (mesmo manual). Aponta para /dev/null.", output: "Use para travar serviço perigoso." },
        ]}
      />

      <h2>Inspecionar status</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo systemctl start ssh",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "systemctl status ssh",
            out: `● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; disabled; preset: disabled)
     Active: active (running) since Fri 2026-04-03 09:12:01 -03; 5s ago
   Main PID: 12847 (sshd)
      Tasks: 1 (limit: 9418)
     Memory: 1.4M (peak: 1.6M)
        CPU: 17ms
     CGroup: /system.slice/ssh.service
             └─12847 "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"

Apr 03 09:12:01 kali systemd[1]: Starting ssh.service - OpenBSD Secure Shell server...
Apr 03 09:12:01 kali sshd[12847]: Server listening on 0.0.0.0 port 22.
Apr 03 09:12:01 kali sshd[12847]: Server listening on :: port 22.
Apr 03 09:12:01 kali systemd[1]: Started ssh.service - OpenBSD Secure Shell server.`,
            outType: "success",
          },
          {
            comment: "saída boolean para scripts",
            cmd: "systemctl is-active ssh && echo OK",
            out: `active
OK`,
            outType: "info",
          },
          {
            cmd: "systemctl is-enabled ssh",
            out: "disabled",
            outType: "warning",
          },
        ]}
      />

      <h2>Listar tudo</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "todas as units carregadas (rodando ou não)",
            cmd: "systemctl list-units --type=service | head -10",
            out: `  UNIT                                LOAD   ACTIVE SUB     DESCRIPTION
  apparmor.service                    loaded active exited  Load AppArmor profiles
  cron.service                        loaded active running Regular background program processing daemon
  dbus.service                        loaded active running D-Bus System Message Bus
  haveged.service                     loaded active running Entropy daemon using the HAVEGE algorithm
  NetworkManager.service              loaded active running Network Manager
  postgresql.service                  loaded active running PostgreSQL RDBMS
  rsyslog.service                     loaded active running System Logging Service
  ssh.service                         loaded active running OpenBSD Secure Shell server
  systemd-journald.service            loaded active running Journal Service`,
            outType: "default",
          },
          {
            comment: "só as falhas",
            cmd: "systemctl --failed",
            out: `  UNIT                  LOAD   ACTIVE SUB    DESCRIPTION
● bluetooth.service     loaded failed failed Bluetooth service

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state.
SUB    = The low-level unit activation state.

1 loaded units listed.`,
            outType: "error",
          },
          {
            comment: "tudo que vai subir no boot",
            cmd: "systemctl list-unit-files --state=enabled | head -8",
            out: `UNIT FILE                                 STATE   PRESET 
apache2.service                           enabled enabled
cron.service                              enabled enabled
NetworkManager.service                    enabled enabled
postgresql.service                        enabled enabled
ssh.service                               enabled enabled
tor.service                               enabled enabled

6 unit files listed.`,
            outType: "info",
          },
        ]}
      />

      <h2>Logs com journalctl</h2>
      <CommandTable
        title="journalctl: filtros essenciais"
        variations={[
          { cmd: "journalctl -u ssh", desc: "Todos os logs do serviço ssh.", output: "Apr 03 09:12 kali sshd[12847]: Server listening on 0.0.0.0 port 22." },
          { cmd: "journalctl -u ssh -f", desc: "Tail -f equivalente: acompanha em tempo real.", output: "(fica na tela esperando novas linhas)" },
          { cmd: "journalctl -u ssh --since \"1 hour ago\"", desc: "Janela temporal relativa.", output: "Filtra os eventos da última hora." },
          { cmd: "journalctl -p err -b", desc: "Só erros desde o último boot (-b = boot atual).", output: "-p: 0=emerg, 3=err, 4=warn, 6=info, 7=debug" },
          { cmd: "journalctl -k", desc: "Só mensagens do kernel (= dmesg).", output: "Útil para debug de hardware." },
          { cmd: "journalctl --disk-usage", desc: "Quanto espaço o journal está ocupando.", output: "Archived and active journals take up 1.3G in the file system." },
          { cmd: "sudo journalctl --vacuum-time=7d", desc: "Apaga logs com mais de 7 dias.", output: "Vacuuming done, freed 412.7M of archived journals." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "investigando uma falha de SSH",
            cmd: "journalctl -u ssh -p warning --since today",
            out: `Apr 03 09:34:12 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:14 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:16 kali sshd[12947]: Failed password for invalid user admin from 192.168.1.50 port 51220 ssh2
Apr 03 09:34:16 kali sshd[12947]: PAM 3 more authentication failures; logname= uid=0 euid=0 tty=ssh ruser= rhost=192.168.1.50  user=admin
Apr 03 09:34:18 kali sshd[12947]: Disconnecting invalid user admin 192.168.1.50 port 51220: Too many authentication failures`,
            outType: "warning",
          },
        ]}
      />

      <h2>Criando seu próprio serviço</h2>
      <p>Útil para deixar uma ferramenta (ex: listener Metasploit, API custom) rodando como serviço.</p>

      <CodeBlock
        language="ini"
        title="/etc/systemd/system/meu-listener.service"
        code={`[Unit]
Description=Meu listener custom em Python
After=network.target

[Service]
Type=simple
User=wallyson
WorkingDirectory=/home/wallyson/tools/listener
ExecStart=/usr/bin/python3 /home/wallyson/tools/listener/server.py
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "depois de criar o arquivo, recarregue o systemd",
            cmd: "sudo systemctl daemon-reload",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo systemctl enable --now meu-listener.service",
            out: `Created symlink /etc/systemd/system/multi-user.target.wants/meu-listener.service → /etc/systemd/system/meu-listener.service.`,
            outType: "success",
          },
          {
            cmd: "systemctl status meu-listener",
            out: `● meu-listener.service - Meu listener custom em Python
     Loaded: loaded (/etc/systemd/system/meu-listener.service; enabled)
     Active: active (running) since Fri 2026-04-03 09:45:11 -03; 3s ago
   Main PID: 13412 (python3)
      Tasks: 1
     Memory: 9.4M
     CGroup: /system.slice/meu-listener.service
             └─13412 /usr/bin/python3 /home/wallyson/tools/listener/server.py`,
            outType: "info",
          },
        ]}
      />

      <h2>Targets (runlevels modernos)</h2>
      <CommandTable
        title="systemd targets equivalentes a runlevels"
        variations={[
          { cmd: "graphical.target", desc: "Multi-user + GUI (padrão do Kali desktop).", output: "Equivale ao antigo runlevel 5." },
          { cmd: "multi-user.target", desc: "Sem GUI, com rede (servidor headless).", output: "Equivale ao runlevel 3." },
          { cmd: "rescue.target", desc: "Single-user + filesystems montados.", output: "Para recuperação." },
          { cmd: "emergency.target", desc: "Apenas / montado read-only e shell.", output: "Para emergência total." },
          { cmd: "reboot.target", desc: "Reinicia.", output: "= sudo reboot" },
          { cmd: "poweroff.target", desc: "Desliga.", output: "= sudo poweroff" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "systemctl get-default",
            out: "graphical.target",
            outType: "info",
          },
          {
            comment: "trocar para texto puro (servidor)",
            cmd: "sudo systemctl set-default multi-user.target",
            out: `Removed "/etc/systemd/system/default.target".
Created symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/multi-user.target.`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Suba PostgreSQL para o Metasploit funcionar"
        goal="Garantir que o PostgreSQL está rodando e habilitado, e ligá-lo ao msfdb."
        steps={[
          "Verifique status do postgresql.",
          "Habilite e inicie no boot.",
          "Inicialize o banco do Metasploit.",
          "Confirme conexão dentro do msfconsole.",
        ]}
        command={`sudo systemctl status postgresql --no-pager
sudo systemctl enable --now postgresql
sudo msfdb init
msfconsole -q -x "db_status; exit"`}
        expected={`● postgresql.service - PostgreSQL RDBMS
     Active: active (exited)
[+] Starting database
[+] Creating database user 'msf'
[+] Creating databases 'msf' and 'msf_test'
[+] Creating configuration file '/usr/share/metasploit-framework/config/database.yml'
[*] Connected to msf. Connection type: postgresql.`}
        verify="Dentro do msfconsole o comando db_status deve responder 'Connected to msf'."
      />

      <AlertBox type="info" title="Onde os arquivos ficam">
        <p>
          Units do sistema: <code>/usr/lib/systemd/system/</code> (vêm com pacotes APT).
          <br />
          Units custom/sobrescritas: <code>/etc/systemd/system/</code> (sua área).
          <br />
          Units do usuário (sem sudo): <code>~/.config/systemd/user/</code>.
        </p>
        <p>
          Sempre rode <code>sudo systemctl daemon-reload</code> depois de editar/criar units.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
