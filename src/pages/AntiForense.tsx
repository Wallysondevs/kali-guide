import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function AntiForense() {
  return (
    <PageContainer
      title="Anti-Forense — Técnicas de Limpeza de Rastros"
      subtitle="Entenda técnicas anti-forense para limpar logs, modificar timestamps, secure delete, e evasão de análise. Inclui perspectiva defensiva (blue team) para detectar uso dessas técnicas."
      difficulty="avancado"
      timeToRead="25 min"
    >
      <h2>O que é Anti-Forense?</h2>
      <p>
        <strong>Anti-forense</strong> são técnicas usadas para dificultar ou impossibilitar a análise
        forense após um ataque. Inclui: limpar logs, apagar arquivos de forma irrecuperável,
        modificar timestamps, ofuscar dados, e evadir ferramentas de análise. Em pentests
        profissionais, é importante documentar sua presença mas também demonstrar ao cliente
        que um atacante real poderia limpar seus rastros.
      </p>

      <AlertBox type="danger" title="Use com responsabilidade">
        Em pentests reais, NUNCA limpe rastros sem autorização. O objetivo é DEMONSTRAR que é
        possível, não realmente ocultar sua atividade. Sempre mantenha seus próprios logs e
        documente todas as ações para o relatório.
      </AlertBox>

      <h2>Limpeza de Logs no Linux</h2>
      <CodeBlock
        title="Manipular logs do sistema Linux"
        code={`# ═══════════════════════════════════════════════════
# LOGS PRINCIPAIS DO LINUX E ONDE FICAM
# ═══════════════════════════════════════════════════
# /var/log/auth.log      — logins, sudo, SSH (Debian/Ubuntu)
# /var/log/secure         — logins, sudo, SSH (RHEL/CentOS)
# /var/log/syslog         — mensagens gerais do sistema
# /var/log/kern.log       — mensagens do kernel
# /var/log/apache2/       — logs do Apache (access.log, error.log)
# /var/log/nginx/         — logs do Nginx
# /var/log/lastlog        — último login de cada usuário (binário)
# /var/log/wtmp           — histórico de logins (binário)
# /var/log/btmp           — tentativas de login falhas (binário)
# /var/log/faillog        — registro de falhas de login
# /var/run/utmp           — usuários logados agora (binário)
# ~/.bash_history         — histórico de comandos do usuário

# ═══════════════════════════════════════════════════
# LIMPAR HISTÓRICO DE COMANDOS
# ═══════════════════════════════════════════════════

# Evitar que comandos sejam gravados (ANTES de fazer qualquer coisa):
unset HISTFILE
# HISTFILE controla onde o histórico é salvo
# Sem HISTFILE → comandos não são persistidos no disco

# Alternativa: enviar histórico para /dev/null
export HISTFILE=/dev/null
# Tudo é "salvo" em /dev/null (descartado)

# Limitar tamanho do histórico:
export HISTSIZE=0
# Histórico em memória = 0 linhas

# Não gravar duplicatas e comandos com espaço:
export HISTCONTROL=ignoreboth
# ignorespace = comandos com espaço no início são ignorados
# ignoredups = duplicatas consecutivas ignoradas
# ignoreboth = ambos

# Prefixar comandos com espaço (não grava no histórico):
 whoami                    # ← espaço antes do comando
 cat /etc/shadow           # ← não aparece no history
# Funciona se HISTCONTROL=ignorespace ou ignoreboth

# Limpar histórico atual:
history -c                 # Limpa histórico em memória
history -w                 # Grava (vazio) no arquivo
# Ou diretamente:
cat /dev/null > ~/.bash_history
# Substitui conteúdo do arquivo por vazio

# ═══════════════════════════════════════════════════
# LIMPAR LOGS ESPECÍFICOS
# ═══════════════════════════════════════════════════

# Limpar auth.log completamente:
cat /dev/null > /var/log/auth.log
# ⚠️ Log vazio é SUSPEITO! Melhor remover linhas específicas:

# Remover APENAS suas linhas do log:
sed -i '/192.168.1.50/d' /var/log/auth.log
# -i = editar in-place (modifica o arquivo)
# '/192.168.1.50/d' = deletar linhas contendo seu IP

# Remover suas sessões SSH:
sed -i '/192.168.1.50/d' /var/log/auth.log
sed -i '/192.168.1.50/d' /var/log/syslog

# ═══════════════════════════════════════════════════
# LIMPAR REGISTROS DE LOGIN (binários)
# ═══════════════════════════════════════════════════

# wtmp (quem logou e quando):
# Visualizar:
last
# root   pts/0  192.168.1.50  Tue Jan 15 10:30  still logged in
# Limpar completamente (gera arquivo vazio):
cat /dev/null > /var/log/wtmp

# utmp (quem está logado AGORA):
cat /dev/null > /var/run/utmp
# Depois: 'w' e 'who' não mostram ninguém logado

# btmp (tentativas de login falhas):
cat /dev/null > /var/log/btmp

# lastlog (último login de cada usuário):
cat /dev/null > /var/log/lastlog

# ═══════════════════════════════════════════════════
# LIMPAR LOGS DO APACHE/NGINX
# ═══════════════════════════════════════════════════
# Remover seus requests dos logs web:
sed -i '/192.168.1.50/d' /var/log/apache2/access.log
sed -i '/192.168.1.50/d' /var/log/nginx/access.log
# Remove linhas com seu IP dos logs de acesso`}
      />

      <h2>Manipulação de Timestamps</h2>
      <CodeBlock
        title="Alterar datas de criação e modificação de arquivos"
        code={`# ═══════════════════════════════════════════════════
# TIMESTAMPS NO LINUX (MACTIME)
# ═══════════════════════════════════════════════════
# Cada arquivo tem 3 timestamps:
# - mtime (Modification time) — quando conteúdo foi modificado
# - atime (Access time) — quando foi lido/acessado
# - ctime (Change time) — quando metadados mudaram (permissões, etc.)
# ⚠️ ctime NÃO pode ser alterado com ferramentas normais!

# Ver timestamps de um arquivo:
stat /var/www/html/shell.php
# Access: 2024-01-15 10:30:00.000000000
# Modify: 2024-01-15 10:30:00.000000000
# Change: 2024-01-15 10:30:00.000000000

# ═══════════════════════════════════════════════════
# ALTERAR TIMESTAMPS COM TOUCH
# ═══════════════════════════════════════════════════

# Copiar timestamps de OUTRO arquivo (mais furtivo):
touch -r /var/www/html/index.html /var/www/html/shell.php
# -r = reference file
# shell.php terá os mesmos mtime e atime que index.html
# → Parece que foi criado junto com os outros arquivos!

# Definir data específica:
touch -t 202301150830.00 /var/www/html/shell.php
# -t = timestamp no formato YYYYMMDDhhmm.ss
# → Muda para 15 Jan 2023, 08:30:00

# Alterar apenas mtime:
touch -m -t 202301150830.00 /var/www/html/shell.php
# -m = apenas modification time

# Alterar apenas atime:
touch -a -t 202301150830.00 /var/www/html/shell.php
# -a = apenas access time

# ═══════════════════════════════════════════════════
# TIMESTOMPING EM WINDOWS (com Meterpreter)
# ═══════════════════════════════════════════════════
# No Meterpreter:
meterpreter> timestomp C:\\backdoor.exe -f C:\\Windows\\system32\\calc.exe
# -f = copiar timestamps de calc.exe para backdoor.exe
# backdoor.exe parece ter sido criado com o Windows!

# Definir data específica:
meterpreter> timestomp C:\\backdoor.exe -m "01/15/2023 08:30:00"
# -m = modification time
# -a = access time
# -c = creation time (SIM, Windows permite mudar!)
# -e = entry modified time (NTFS MFT)`}
      />

      <h2>Deleção Segura de Arquivos</h2>
      <CodeBlock
        title="Apagar arquivos de forma irrecuperável"
        code={`# ═══════════════════════════════════════════════════
# POR QUE rm NÃO É SUFICIENTE
# ═══════════════════════════════════════════════════
# 'rm' apenas remove a referência ao arquivo no sistema de arquivos.
# Os DADOS permanecem no disco até serem sobrescritos!
# Ferramentas forenses (foremost, scalpel, photorec) podem
# recuperar arquivos "deletados" facilmente.

# ═══════════════════════════════════════════════════
# SHRED — Sobrescrever antes de deletar
# ═══════════════════════════════════════════════════
shred -vfz -n 5 arquivo_sensivel.txt
# -v = verbose (mostra progresso)
# -f = force (muda permissões se necessário)
# -z = zero (sobrescreve com zeros no final para parecer vazio)
# -n 5 = número de passadas de sobrescrita
#   Passada 1: dados aleatórios
#   Passada 2: dados aleatórios
#   ...
#   Passada 5: dados aleatórios
#   Final: zeros (por causa do -z)
# Depois: rm arquivo_sensivel.txt

# Shred + delete em um comando:
shred -vfzun 3 arquivo.txt
# -u = unlink (deletar após sobrescrever)
# -n 3 = 3 passadas (suficiente para HDD)
# ⚠️ Em SSDs, shred pode não ser eficaz devido ao
#    wear leveling (controller do SSD redireciona writes)

# ═══════════════════════════════════════════════════
# WIPE — Alternativa ao shred
# ═══════════════════════════════════════════════════
sudo apt install wipe
wipe -rfi arquivo.txt
# -r = recursivo (para diretórios)
# -f = force
# -i = verbose

# Limpar espaço livre do disco:
sfill -v /
# Sobrescreve todo o espaço livre (não os arquivos existentes)
# Impede recuperação de arquivos previamente deletados com rm

# ═══════════════════════════════════════════════════
# LIMPAR MEMÓRIA (SWAP E RAM)
# ═══════════════════════════════════════════════════
# Senhas e dados sensíveis podem estar na memória/swap:
swapoff -a                     # Desativar swap
shred -vfz -n 1 /dev/sda2     # Sobrescrever partição swap
mkswap /dev/sda2               # Recriar swap limpa
swapon -a                      # Reativar

# Limpar PageFile no Windows (Meterpreter):
# reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management" /v ClearPageFileAtShutdown /t REG_DWORD /d 1 /f`}
      />

      <h2>Detecção Anti-Forense (Blue Team)</h2>
      <CodeBlock
        title="Como detectar que alguém usou anti-forense"
        code={`# ═══════════════════════════════════════════════════
# INDICADORES DE ANTI-FORENSE
# ═══════════════════════════════════════════════════

# 1. Logs com gaps (lacunas temporais):
# Se auth.log pula de 10:00 para 14:00 → linhas foram deletadas!
# Comparar com outros logs (syslog, kernel) para confirmar

# 2. Arquivos com timestamps inconsistentes:
# mtime de 2023 mas ctime de hoje → timestomping!
# ctime NUNCA pode ser anterior ao mtime com operação normal

# 3. wtmp/utmp vazios ou truncados:
# Arquivo com tamanho 0 → foi limpo intencionalmente
# Verificar: ls -la /var/log/wtmp

# 4. .bash_history vazio ou simbólico para /dev/null:
ls -la /root/.bash_history
# Se é symlink para /dev/null → anti-forense ativo!
# Se tamanho 0 → foi limpo

# 5. HISTFILE não definido:
echo $HISTFILE
# Se vazio → alguém fez unset HISTFILE

# 6. Ferramentas de anti-forense instaladas:
which shred wipe srm secure-delete
# Se essas ferramentas foram instaladas recentemente → suspeito

# ═══════════════════════════════════════════════════
# DEFESAS CONTRA ANTI-FORENSE
# ═══════════════════════════════════════════════════
# 1. Enviar logs para servidor remoto (syslog-ng, rsyslog)
#    → Atacante não pode limpar logs no servidor remoto
# 2. Usar SIEM (Splunk, ELK, Wazuh) para centralizar logs
# 3. File Integrity Monitoring (AIDE, OSSEC, Tripwire)
#    → Detecta modificação de timestamps e arquivos
# 4. Auditd para monitorar operações de arquivo
# 5. Snapshots e backups regulares do filesystem`}
      />
    </PageContainer>
  );
}
