import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PPA() {
  return (
    <PageContainer
      title="PPAs e repositórios extras"
      subtitle="Adicionar repos terceiros sem detonar o Kali: chave GPG no jeito moderno, /etc/apt/sources.list.d/, pinning de prioridade."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>O que é um repositório extra (e por que isso é perigoso)</h2>
      <p>
        Um repositório APT é só um servidor HTTP servindo arquivos <code>Packages</code>{" "}
        e <code>.deb</code> assinados com uma chave GPG. Adicionar um repo terceiro
        significa <strong>confiar</strong> que o dono daquela chave nunca vai te servir
        algo malicioso — porque <code>apt install</code> roda <code>postinst</code> como
        root.
      </p>
      <p>
        No mundo Ubuntu existe a abstração "PPA" (Personal Package Archive) hospedada
        em Launchpad. No Kali (Debian-based) o termo "PPA" é usado de forma frouxa para
        qualquer repo terceiro, mas o mecanismo é genérico: um <code>.list</code> em{" "}
        <code>/etc/apt/sources.list.d/</code> + uma chave em{" "}
        <code>/etc/apt/keyrings/</code>.
      </p>

      <h2>O jeito moderno (correto): /etc/apt/keyrings/</h2>
      <p>
        Até ~2022 o padrão era <code>apt-key add</code>. Esse comando está{" "}
        <strong>deprecated</strong> e não deve mais ser usado. Chaves vão diretas em{" "}
        <code>/etc/apt/keyrings/</code> (ou <code>trusted.gpg.d/</code>) e o arquivo{" "}
        <code>.list</code> referencia explicitamente qual chave assina aquele repo.
      </p>

      <CodeBlock
        language="bash"
        title="Padrão moderno: adicionar repo do Docker no Kali"
        code={`#!/usr/bin/env bash
set -euo pipefail

# 1) Garantir dirs e dependências
sudo install -m 0755 -d /etc/apt/keyrings
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# 2) Baixar e converter a chave para keyring binário
curl -fsSL https://download.docker.com/linux/debian/gpg \\
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3) Escrever o sources file APONTANDO para a chave
# (codename é trixie; Kali rolling segue Debian testing)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
https://download.docker.com/linux/debian trixie stable" \\
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4) Atualizar índice
sudo apt update`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "validar que o repo apareceu no apt update",
            cmd: "sudo apt update 2>&1 | grep docker",
            out: `Get:5 https://download.docker.com/linux/debian trixie InRelease [48.9 kB]
Get:6 https://download.docker.com/linux/debian trixie/stable amd64 Packages [42.1 kB]`,
            outType: "success",
          },
        ]}
      />

      <h2>add-apt-repository (atalho)</h2>
      <p>
        Pacote <code>software-properties-common</code> oferece o helper{" "}
        <code>add-apt-repository</code>. Ele cria o <code>.list</code> automaticamente.
        No Kali funciona, mas com pegadinhas:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y software-properties-common",
            out: "Setting up software-properties-common (0.99.x) ...",
            outType: "info",
          },
          {
            comment: "ATENÇÃO: PPAs de Launchpad só são válidos no Ubuntu",
            cmd: "sudo add-apt-repository ppa:wireshark-dev/stable",
            out: `Cannot add PPA: 'ppa:~wireshark-dev/ubuntu/stable'.
Please check that the PPA name or format is correct.`,
            outType: "error",
          },
          {
            comment: "uso correto no Debian/Kali: URL completa",
            cmd: "sudo add-apt-repository \"deb [signed-by=/etc/apt/keyrings/foo.gpg] https://repo.exemplo.com/debian trixie main\"",
            out: "(adiciona em /etc/apt/sources.list)",
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="warning" title="PPAs do Launchpad NÃO funcionam direto no Kali">
        <p>
          PPAs <code>ppa:foo/bar</code> são compilados contra versões específicas do
          Ubuntu (<em>focal</em>, <em>jammy</em>, <em>noble</em>...). No Kali você tem
          <strong> libc, libssl, libstdc++ DIFERENTES</strong>. Tentar instalar um .deb
          de PPA Ubuntu no Kali geralmente resulta em conflito de dependência fatal.
        </p>
        <p>
          Se o autor não distribui repo Debian, o caminho é compilar do source (veja
          página "Código fonte").
        </p>
      </AlertBox>

      <h2>Anatomia de /etc/apt/sources.list.d/</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /etc/apt/sources.list.d/",
            out: `docker.list
hashicorp.list
postgresql.list
signal.list`,
            outType: "info",
          },
          {
            cmd: "cat /etc/apt/sources.list.d/docker.list",
            out: `deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian trixie stable`,
            outType: "default",
          },
          {
            comment: "para DESATIVAR temporariamente um repo: comente ou renomeie",
            cmd: "sudo mv /etc/apt/sources.list.d/docker.list /etc/apt/sources.list.d/docker.list.disabled",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Sintaxe completa de uma linha 'deb'"
        variations={[
          { cmd: "deb", desc: "Pacotes binários (.deb pré-compilados).", output: "deb-src para fontes." },
          { cmd: "[arch=amd64,arm64]", desc: "Restringe arquiteturas. Sem isso, APT tenta tudo.", output: "Útil para repos que só têm amd64." },
          { cmd: "[signed-by=/etc/apt/keyrings/x.gpg]", desc: "OBRIGATÓRIO no padrão moderno: chave que assina o repo.", output: "Sem isso → 'NO_PUBKEY'." },
          { cmd: "[trusted=yes]", desc: "Aceita repo SEM verificar assinatura.", output: "NUNCA use em repo público." },
          { cmd: "URL", desc: "Base do repo (ex: https://download.docker.com/linux/debian).", output: "Geralmente termina sem barra." },
          { cmd: "suite", desc: "Codename (trixie, bookworm) ou alias (stable, testing).", output: "Kali rolling = trixie atualmente." },
          { cmd: "componentes", desc: "main, contrib, non-free, stable, beta...", output: "Cada repo escolhe seus." },
        ]}
      />

      <h2>Identificar uma chave GPG</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "gpg --show-keys /etc/apt/keyrings/docker.gpg",
            out: `pub   rsa4096 2017-02-22 [SCEA]
      9DC858229FC7DD38854AE2D88D81803C0EBFCD88
uid                      Docker Release (CE deb) <docker@docker.com>
sub   rsa4096 2017-02-22 [S]`,
            outType: "info",
          },
          {
            comment: "comparar fingerprint com o site oficial do projeto",
            cmd: "gpg --show-keys --keyid-format long /etc/apt/keyrings/docker.gpg | grep -i '[A-F0-9]\\{40\\}'",
            out: "      9DC858229FC7DD38854AE2D88D81803C0EBFCD88",
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="danger" title="SEMPRE verifique o fingerprint contra o site oficial">
        <p>
          Antes de salvar a chave em <code>/etc/apt/keyrings/</code>, abra o site
          oficial do projeto (HTTPS) e compare o fingerprint completo (40 chars hex).
          Adicionar a chave errada = aceitar QUALQUER pacote assinado por um atacante
          que controla um mirror.
        </p>
      </AlertBox>

      <h2>Pinning para evitar conflito Kali ↔ repo terceiro</h2>
      <p>
        Cenário concreto: você adicionou o repo do PostgreSQL (PGDG) que oferece o
        Postgres 17. Mas o Kali tem Postgres 16 em <code>main</code>. Sem pinning, APT
        pode misturar libs e quebrar tudo.
      </p>

      <CodeBlock
        language="ini"
        title="/etc/apt/preferences.d/00-prefer-kali"
        code={`# REGRA PADRÃO: Kali é a fonte preferida para tudo
Package: *
Pin: release o=Kali
Pin-Priority: 990

# EXCEÇÃO: pacotes do PostgreSQL — usar PGDG para postgresql-17 e plugins
Package: postgresql-17 postgresql-client-17 postgresql-contrib-17
Pin: origin apt.postgresql.org
Pin-Priority: 700

# EXCEÇÃO: tudo do Docker oficial
Package: docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
Pin: origin download.docker.com
Pin-Priority: 700

# Tudo o resto vindo de repos terceiros = baixa prioridade
Package: *
Pin: release o=Debian
Pin-Priority: 100`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "checar a política aplicada a um pacote específico",
            cmd: "apt-cache policy docker-ce",
            out: `docker-ce:
  Installed: 5:27.3.1-1~debian.12~bookworm
  Candidate: 5:27.3.1-1~debian.12~bookworm
  Version table:
 *** 5:27.3.1-1~debian.12~bookworm 700
        500 https://download.docker.com/linux/debian trixie/stable amd64 Packages
        100 /var/lib/dpkg/status`,
            outType: "info",
          },
          {
            comment: "regra geral: priority >= 1000 força downgrade; 100-989 é normal",
            cmd: "apt-cache policy",
            out: `Package files:
 100 /var/lib/dpkg/status
     release a=now
 700 https://download.docker.com/linux/debian trixie/stable amd64 Packages
     release o=Docker,a=stable,n=trixie,c=stable,b=amd64
 990 http://http.kali.org/kali kali-rolling/main amd64 Packages
     release v=2025.1,o=Kali,a=kali-rolling,n=kali-rolling,c=main,b=amd64`,
            outType: "default",
          },
        ]}
      />

      <h2>Casos de uso práticos no Kali pentest</h2>
      <CommandTable
        title="Repos que valem a pena no Kali"
        variations={[
          { cmd: "Docker oficial", desc: "Versão atual do Docker Engine (mais nova que docker.io do Debian).", output: "Para subir labs DVWA/Juice Shop." },
          { cmd: "Brave / Chrome", desc: "Browser hardenizado para OSINT separado do Firefox.", output: "Mantido pelo fornecedor." },
          { cmd: "Signal Desktop", desc: "Comunicação segura com cliente.", output: "Repo oficial ou Flatpak." },
          { cmd: "VS Code (Microsoft)", desc: "Editor para escrever scripts/exploits.", output: "Versão oficial sempre atualizada." },
          { cmd: "PostgreSQL PGDG", desc: "Versão major mais nova que o Kali oferece.", output: "Quando precisa de feature de v17+." },
          { cmd: "HashiCorp", desc: "Terraform, Vault, Consul.", output: "Para automação de infra ofensiva (lab AWS)." },
          { cmd: "Kali experimental", desc: "Repo do próprio Kali, mas com versões em teste.", output: "Comente após uso. Pode quebrar coisa." },
        ]}
      />

      <h2>Removendo um repo com segurança</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) ver pacotes instalados desse repo",
            cmd: "apt-cache policy docker-ce | grep -A1 Version",
            out: `  Installed: 5:27.3.1-1~debian.12~bookworm`,
            outType: "info",
          },
          {
            comment: "2) remover (downgrade para versão Kali ou desinstalar)",
            cmd: "sudo apt purge docker-ce docker-ce-cli containerd.io",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "3) tirar o sources.list e a chave",
            cmd: "sudo rm /etc/apt/sources.list.d/docker.list /etc/apt/keyrings/docker.gpg",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo apt update",
            out: "(repo Docker some da lista)",
            outType: "success",
          },
        ]}
      />

      <h2>Kali experimental (próprio Kali)</h2>
      <p>
        O Kali tem um repo paralelo chamado <code>kali-experimental</code> com versões
        sob teste (ex: nova versão de Burp ou nmap antes de cair em rolling).
      </p>

      <CodeBlock
        language="bash"
        title="/etc/apt/sources.list.d/kali-experimental.list"
        code={`# DESATIVADO por padrão. Use com pinning baixo (priority 100).
deb http://http.kali.org/kali kali-experimental main contrib non-free non-free-firmware`}
      />

      <CodeBlock
        language="ini"
        title="/etc/apt/preferences.d/99-kali-experimental"
        code={`Package: *
Pin: release a=kali-experimental
Pin-Priority: 100`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar APENAS nmap do experimental (resto fica do rolling)",
            cmd: "sudo apt install -t kali-experimental nmap",
            out: `The following packages will be upgraded:
  nmap
1 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Adicionar Docker oficial com pinning"
        goal="Adicionar o repo Docker no jeito moderno (keyring + signed-by) com pinning prioridade 700, validar policy."
        steps={[
          "Instale prerequisitos.",
          "Baixe a chave GPG, dearmore para /etc/apt/keyrings/.",
          "Crie /etc/apt/sources.list.d/docker.list com signed-by.",
          "Crie pinning em /etc/apt/preferences.d/.",
          "apt update + apt-cache policy docker-ce.",
        ]}
        command={`sudo install -m 0755 -d /etc/apt/keyrings
sudo apt update && sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian trixie stable" \\
  | sudo tee /etc/apt/sources.list.d/docker.list

cat <<'EOF' | sudo tee /etc/apt/preferences.d/00-docker
Package: docker-ce docker-ce-cli containerd.io
Pin: origin download.docker.com
Pin-Priority: 700
EOF

sudo apt update
apt-cache policy docker-ce`}
        expected={`Get:5 https://download.docker.com/linux/debian trixie InRelease [48.9 kB]
docker-ce:
  Installed: (none)
  Candidate: 5:27.3.1-1~debian.12~bookworm
  Version table:
     5:27.3.1-1~debian.12~bookworm 700
        500 https://download.docker.com/linux/debian trixie/stable amd64 Packages`}
        verify="O repo Docker aparece no apt update e a policy mostra prioridade 700, garantindo que docker-ce vem do repo oficial e não conflita com o docker.io do Kali."
      />

      <AlertBox type="info" title="Resumo das regras de ouro">
        <p>
          1) Chave GPG SEMPRE em <code>/etc/apt/keyrings/</code>, nunca{" "}
          <code>apt-key add</code>.
          <br />
          2) <code>signed-by=</code> é OBRIGATÓRIO no <code>.list</code>.
          <br />
          3) Pinning impede o repo terceiro de "puxar" libs base e quebrar Kali.
          <br />
          4) Verifique fingerprint contra o site oficial via HTTPS.
          <br />
          5) PPAs Ubuntu raramente funcionam no Kali — busque repo Debian-compatível ou
          compile do source.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
