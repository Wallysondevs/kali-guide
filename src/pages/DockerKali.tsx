import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function DockerKali() {
    return (
      <PageContainer
        title="Docker & Laboratórios de Pentest"
        subtitle="Monte labs de pentest com Docker e automatize ambientes de prática seguros e isolados."
        difficulty="intermediario"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="Labs seguros e reproduzíveis">
          Docker permite criar ambientes vulneráveis controlados para praticar sem riscos.
          DVWA, Metasploitable, e outras VMs vulneráveis rodam perfeitamente em containers.
        </AlertBox>

        <h2>Docker no Kali Linux</h2>
        <CodeBlock language="bash" code={'# Instalar Docker\nsudo apt update\nsudo apt install docker.io docker-compose -y\nsudo systemctl start docker\nsudo systemctl enable docker\n\n# Adicionar usuário ao grupo docker (opcional)\nsudo usermod -aG docker $USER\nnewgrp docker\n\n# Verificar\ndocker --version\ndocker run hello-world'} />

        <h2>DVWA — Ambiente Web Vulnerável</h2>
        <CodeBlock language="bash" code={'# Subir DVWA com Docker\ndocker pull vulnerables/web-dvwa\ndocker run -d -p 80:80 vulnerables/web-dvwa\n\n# Acessar: http://localhost/\n# Login: admin / password\n\n# Ou com Docker Compose:\ncat > docker-compose.yml << EOF\nversion: \'3\'\nservices:\n  dvwa:\n    image: vulnerables/web-dvwa\n    ports:\n      - "8080:80"\nEOF\ndocker-compose up -d'} />

        <h2>Metasploitable 2</h2>
        <CodeBlock language="bash" code={'# Metasploitable no Docker\ndocker pull tleemcjr/metasploitable2\ndocker run -d -p 80:80 -p 21:21 -p 22:22 -p 23:23 -p 25:25 \\\n  -p 3306:3306 -p 5432:5432 tleemcjr/metasploitable2\n\n# Acessar serviços:\n# SSH: ssh msfadmin@localhost (senha: msfadmin)\n# Web: http://localhost (DVWA, TWiki, phpMyAdmin, etc.)\n# FTP: ftp localhost\n\n# Praticar:\nmsfconsole\nuse exploit/unix/ftp/vsftpd_234_backdoor\nset RHOSTS 127.0.0.1\nrun'} />

        <h2>Kali Docker Image</h2>
        <CodeBlock language="bash" code={'# Usar imagem oficial do Kali no Docker\ndocker pull kalilinux/kali-rolling\n\n# Container interativo\ndocker run -it kalilinux/kali-rolling /bin/bash\n\n# Container com rede do host (acesso total à rede)\ndocker run -it --net=host kalilinux/kali-rolling /bin/bash\n\n# Instalar ferramentas no container\napt update && apt install -y nmap metasploit-framework\n\n# Salvar container como imagem customizada\ndocker commit CONTAINER_ID meu-kali-custom\ndocker run -it meu-kali-custom /bin/bash'} />

        <h2>Lab Completo com Docker Compose</h2>
        <CodeBlock language="bash" code={'# Lab de pentest completo\ncat > docker-compose.yml << \'COMPOSEEOF\'\nversion: \'3\'\nservices:\n  attacker:\n    image: kalilinux/kali-rolling\n    networks:\n      - pentest_net\n    tty: true\n    stdin_open: true\n    command: /bin/bash\n  \n  victim-web:\n    image: vulnerables/web-dvwa\n    networks:\n      pentest_net:\n        ipv4_address: 10.10.10.100\n  \n  victim-linux:\n    image: tleemcjr/metasploitable2\n    networks:\n      pentest_net:\n        ipv4_address: 10.10.10.101\n\nnetworks:\n  pentest_net:\n    driver: bridge\n    ipam:\n      config:\n        - subnet: 10.10.10.0/24\nCOMPOSEEOF\n\ndocker-compose up -d\n# Entrar no Kali atacante:\ndocker-compose exec attacker /bin/bash'} />

        <AlertBox type="success" title="Plataformas de prática online">
          Além de Docker local, use: TryHackMe (guiado, iniciantes), HackTheBox (mais desafiador),
          PentesterLab (foco em web), PortSwigger Academy (gratuito, excelente para web).
        </AlertBox>
      </PageContainer>
    );
  }
  