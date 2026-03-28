import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function SSH() {
  return (
    <PageContainer
      title="SSH — Secure Shell"
      subtitle="Protocolo de acesso remoto seguro — essencial para pentest, administração e CTFs."
      difficulty="iniciante"
      timeToRead="12 min"
    >
      <h2>Consultando a ajuda do SSH</h2>
      <CodeBlock language="bash" code={`# Ajuda básica (muitas opções)
ssh --help
man ssh              # manual completo e detalhado

# Ajuda do ssh-keygen (gerar chaves)
ssh-keygen --help
man ssh-keygen

# Ajuda do scp (transferência de arquivos)
man scp

# Ajuda do ssh-copy-id (copiar chave pública)
ssh-copy-id --help`} />

      <AlertBox type="info" title="Como ler o --help do SSH">
        O SSH tem MUITAS opções (-L, -R, -D, -J, etc.) que não aparecem claramente no --help resumido. 
        Use <code>man ssh</code> para a documentação completa. Abaixo explicamos as principais em português.
      </AlertBox>

      <h2>Conexão básica</h2>
      <CodeBlock language="bash" code={`# Conectar com senha
ssh usuario@192.168.1.1
ssh usuario@servidor.com

# Porta diferente (padrão é 22)
ssh -p 2222 usuario@192.168.1.1

# Com chave privada
ssh -i chave_privada.pem usuario@192.168.1.1
ssh -i ~/.ssh/id_rsa usuario@servidor.com

# Modo verboso (ótimo para debug de conexão)
ssh -v usuario@servidor.com    # verboso
ssh -vv usuario@servidor.com   # mais verboso
ssh -vvv usuario@servidor.com  # máximo detalhe`} />

      <ParamsTable
        title="ssh — flags principais explicadas em português"
        params={[
          { flag: "-p PORTA", desc: "Conecta em uma porta diferente da padrão (22). Muito útil em CTFs onde o SSH está em porta alternativa.", exemplo: "ssh -p 2222 user@alvo" },
          { flag: "-i CHAVE", desc: "Especifica a chave privada a usar para autenticação. O arquivo deve ter permissão 600.", exemplo: "ssh -i id_rsa user@alvo" },
          { flag: "-v / -vv / -vvv", desc: "Modo verboso (verbose). Exibe detalhes do processo de autenticação. Essencial para depurar erros de conexão. Mais v's = mais detalhes.", exemplo: "ssh -v user@alvo" },
          { flag: "-o OPÇÃO=VALOR", desc: "Passa uma opção de configuração diretamente. Evita editar o arquivo ~/.ssh/config.", exemplo: "ssh -o StrictHostKeyChecking=no user@alvo" },
          { flag: "-o StrictHostKeyChecking=no", desc: "Não pede confirmação ao conectar pela primeira vez em um host desconhecido. Útil em scripts e CTFs.", exemplo: "ssh -o StrictHostKeyChecking=no user@alvo" },
          { flag: "-l USUÁRIO", desc: "Especifica o usuário (alternativo a usuario@host).", exemplo: "ssh -l admin 192.168.1.1" },
          { flag: "-q", desc: "Modo quieto — suprime mensagens de aviso. Útil em scripts.", exemplo: "ssh -q user@alvo comando" },
          { flag: "-t", desc: "Força alocação de pseudo-terminal (PTY). Necessário para comandos interativos via SSH.", exemplo: "ssh -t user@alvo sudo bash" },
          { flag: "-T", desc: "Desativa alocação de TTY. Usado para conexões não interativas (transferências de dados).", exemplo: "ssh -T git@github.com" },
          { flag: "-N", desc: "Não executa comando remoto — usado apenas para tunneling (port forwarding). Mantém o túnel aberto.", exemplo: "ssh -N -L 8080:localhost:80 user@alvo" },
          { flag: "-f", desc: "Coloca o SSH em background após autenticar. Geralmente usado com -N para túneis.", exemplo: "ssh -f -N -L 8080:localhost:80 user@alvo" },
          { flag: "-4 / -6", desc: "Força IPv4 ou IPv6.", exemplo: "ssh -4 user@alvo" },
        ]}
      />

      <h2>Port Forwarding (Tunneling)</h2>
      <CodeBlock language="bash" code={`# -L: Local Port Forward
# Redireciona PORTA_LOCAL → HOST_REMOTO:PORTA_REMOTA via servidor SSH
ssh -L PORTA_LOCAL:DESTINO:PORTA_DESTINO usuario@SERVIDOR_SSH

# Exemplos práticos:
# Acessar MySQL interno (porta 3306) via SSH
ssh -L 3306:localhost:3306 user@192.168.1.1
# Agora: mysql -h 127.0.0.1 -P 3306 se conecta ao MySQL remoto

# Acessar serviço web interno
ssh -L 8080:192.168.2.10:80 user@192.168.1.1
# Abra: http://localhost:8080 no browser

# -R: Remote Port Forward (tunnel reverso)
# Expõe PORTA_LOCAL sua para o servidor remoto
ssh -R PORTA_REMOTA:localhost:PORTA_LOCAL usuario@SERVIDOR
# Útil para receber conexões quando você está atrás de NAT/firewall

# -D: Dynamic SOCKS proxy
# Cria um proxy SOCKS5 local para rotear tráfego via SSH
ssh -D 1080 user@192.168.1.1
# Configure seu browser para usar SOCKS5 proxy em 127.0.0.1:1080`} />

      <ParamsTable
        title="Port Forwarding — explicado em detalhes"
        params={[
          { flag: "-L [bind:]PORTA_LOCAL:HOST:PORTA", desc: "Local Forward — tráfego na PORTA_LOCAL da sua máquina é redirecionado para HOST:PORTA através do servidor SSH. Você acessa serviços internos do servidor.", exemplo: "ssh -L 8080:10.0.0.5:80 user@salto" },
          { flag: "-R [bind:]PORTA_REMOTA:HOST:PORTA", desc: "Remote Forward — expõe um serviço local para o servidor remoto. Útil para receber reverse shells quando está atrás de NAT.", exemplo: "ssh -R 4444:localhost:4444 user@servidor" },
          { flag: "-D [bind:]PORTA", desc: "Dynamic SOCKS Proxy — cria um proxy SOCKS5 local. Rota todo o tráfego configurado via a conexão SSH (pivoting).", exemplo: "ssh -D 1080 user@alvo" },
          { flag: "-J HOST_SALTO", desc: "Jump Host — conecta ao destino final passando por um host intermediário (proxy/bastion). Substitui ProxyJump.", exemplo: "ssh -J usuario@bastion user@alvo_interno" },
          { flag: "-N", desc: "Não executa nenhum comando remoto — apenas mantém o túnel aberto. Essencial com -L, -R e -D.", exemplo: "ssh -N -L 3306:localhost:3306 user@alvo" },
          { flag: "-f", desc: "Coloca a sessão SSH em background. Combine com -N para túneis sem precisar manter o terminal aberto.", exemplo: "ssh -fN -L 8080:localhost:80 user@alvo" },
        ]}
      />

      <h2>Chaves SSH — geração e configuração</h2>
      <CodeBlock language="bash" code={`# Gerar par de chaves (pública + privada)
ssh-keygen -t rsa -b 4096 -C "comentario"
ssh-keygen -t ed25519 -C "email@exemplo.com"    # mais moderno e seguro

# Gera dois arquivos:
# ~/.ssh/id_rsa       → CHAVE PRIVADA (NUNCA compartilhe!)
# ~/.ssh/id_rsa.pub   → chave pública (pode compartilhar — vai no servidor)

# Copiar chave pública para um servidor
ssh-copy-id usuario@192.168.1.1
ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@servidor.com

# Adicionar chave ao agente SSH (para não digitar passphrase toda hora)
eval $(ssh-agent)
ssh-add ~/.ssh/id_rsa

# Ajustar permissões corretas (necessário!)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub`} />

      <ParamsTable
        title="ssh-keygen — flags explicadas"
        params={[
          { flag: "-t TIPO", desc: "Tipo de algoritmo: rsa (mais compatível), ed25519 (mais seguro e rápido), ecdsa, dsa.", exemplo: "ssh-keygen -t ed25519" },
          { flag: "-b BITS", desc: "Tamanho da chave RSA em bits. Mínimo recomendado: 2048. Melhor: 4096.", exemplo: "ssh-keygen -t rsa -b 4096" },
          { flag: "-C 'COMENTÁRIO'", desc: "Adiciona um comentário à chave (normalmente seu email ou descrição do uso).", exemplo: "ssh-keygen -t ed25519 -C 'pentest@kali'" },
          { flag: "-f ARQUIVO", desc: "Nome do arquivo de saída. Padrão: ~/.ssh/id_rsa", exemplo: "ssh-keygen -f ~/.ssh/chave_ctf" },
          { flag: "-N 'PASSPHRASE'", desc: "Define a passphrase (senha da chave). Use '' para chave sem senha.", exemplo: "ssh-keygen -N '' -f /tmp/chave" },
          { flag: "-p", desc: "Muda a passphrase de uma chave existente.", exemplo: "ssh-keygen -p -f ~/.ssh/id_rsa" },
          { flag: "-y -f CHAVE", desc: "Exibe a chave pública a partir de uma chave privada.", exemplo: "ssh-keygen -y -f chave_privada" },
        ]}
      />

      <h2>Arquivo de configuração ~/.ssh/config</h2>
      <CodeBlock language="bash" code={`# Criar/editar o arquivo de config
nano ~/.ssh/config

# Exemplo de configuração:
Host servidor-principal
    HostName 192.168.1.100
    User kali
    Port 22
    IdentityFile ~/.ssh/id_rsa

Host ctf-htb
    HostName 10.10.10.100
    User root
    Port 22
    IdentityFile ~/.ssh/hackthebox.pem
    StrictHostKeyChecking no

Host tuneldb
    HostName 192.168.1.1
    User admin
    LocalForward 3306 localhost:3306
    # Agora: ssh tuneldb → túnel MySQL automático

# Após configurar, usar é simples:
ssh servidor-principal
ssh ctf-htb`} />

      <h2>Transferência de arquivos</h2>
      <CodeBlock language="bash" code={`# scp — cópia segura via SSH
# Enviar arquivo para servidor
scp arquivo.txt usuario@192.168.1.1:/home/usuario/

# Baixar arquivo do servidor
scp usuario@192.168.1.1:/etc/passwd ./

# Copiar diretório inteiro
scp -r pasta/ usuario@servidor.com:/home/usuario/

# Com porta diferente (atenção: é -P maiúsculo no scp!)
scp -P 2222 arquivo.txt usuario@servidor.com:/tmp/

# sftp — modo interativo de transferência
sftp usuario@192.168.1.1
# Comandos dentro do sftp:
# ls, cd, pwd → navegação no servidor
# lls, lcd, lpwd → navegação LOCAL
# get arquivo → baixar
# put arquivo → enviar
# bye / exit → sair`} />

      <ParamsTable
        title="scp — flags explicadas"
        params={[
          { flag: "-P PORTA", desc: "Porta SSH (atenção: P maiúsculo, diferente do ssh que usa p minúsculo!).", exemplo: "scp -P 2222 arquivo user@alvo:/tmp/" },
          { flag: "-r", desc: "Copia recursivamente (diretórios e subdiretórios).", exemplo: "scp -r pasta/ user@alvo:/home/user/" },
          { flag: "-i CHAVE", desc: "Usa chave privada específica para autenticação.", exemplo: "scp -i chave.pem arquivo user@alvo:/tmp/" },
          { flag: "-v", desc: "Modo verboso — mostra detalhes da transferência.", exemplo: "scp -v arquivo user@alvo:/tmp/" },
          { flag: "-C", desc: "Ativa compressão durante a transferência. Útil para arquivos de texto grandes.", exemplo: "scp -C arquivo user@alvo:/tmp/" },
          { flag: "-3", desc: "Copia entre dois servidores remotos passando pelo seu computador (sem conexão direta entre eles).", exemplo: "scp -3 user1@host1:/arquivo user2@host2:/destino" },
        ]}
      />

      <h2>Técnicas de pentest com SSH</h2>
      <CodeBlock language="bash" code={`# Verificar métodos de autenticação aceitos
ssh -v usuario@alvo 2>&1 | grep "Authentication"

# Tentar login com usuário inválido para identificar SO
ssh invalido@alvo 2>&1

# Verificar algoritmos suportados
nmap -p 22 --script=ssh2-enum-algos alvo
nmap -p 22 --script=ssh-auth-methods --script-args="ssh.user=root" alvo

# Procurar chaves privadas em um sistema comprometido
find / -name "id_rsa" 2>/dev/null
find / -name "*.pem" 2>/dev/null
find / -name "authorized_keys" 2>/dev/null

# Ajustar permissão e usar chave encontrada
chmod 600 id_rsa_encontrada
ssh -i id_rsa_encontrada usuario@alvo`} />
    </PageContainer>
  );
}
