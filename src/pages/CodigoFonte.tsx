import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function CodigoFonte() {
  return (
    <PageContainer
      title="Compilando do código fonte"
      subtitle="Quando o pacote APT é antigo demais (ou inexistente): build-essential, configure/make, checkinstall, /opt + stow."
      difficulty="avancado"
      timeToRead="20 min"
    >
      <h2>Por que compilar do source?</h2>
      <p>
        Você precisa compilar quando: (1) a versão no APT está velha demais, (2) o
        projeto NÃO distribui <code>.deb</code>, (3) você quer aplicar um patch
        customizado (ex: para um exploit ou tool de pesquisa), (4) precisa de uma flag
        de build específica (suporte a CUDA, OpenMP, biblioteca opcional X).
      </p>
      <p>
        No mundo pentest isso é COMUM: muita ferramenta moderna (impacket forks, scripts
        de POC para CVE recente, drivers Wi-Fi para placas exóticas, custom hashcat com
        algoritmo experimental) só vem como repo Git.
      </p>

      <h2>Toolchain base: build-essential</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y build-essential",
            out: `The following NEW packages will be installed:
  binutils cpp dpkg-dev g++ gcc libc-dev-bin libc6-dev libgcc-13-dev
  libstdc++-13-dev linux-libc-dev make
0 upgraded, 11 newly installed, 0 to remove.
After this operation, 142 MB of additional disk space will be used.`,
            outType: "info",
          },
          {
            cmd: "gcc --version && make --version",
            out: `gcc (Debian 14.2.0-3) 14.2.0
GNU Make 4.4.1`,
            outType: "success",
          },
        ]}
      />

      <CommandTable
        title="Pacotes auxiliares essenciais"
        variations={[
          { cmd: "build-essential", desc: "gcc, g++, make, libc-dev, dpkg-dev. Sempre primeiro.", output: "Sem isso, nada compila." },
          { cmd: "cmake", desc: "Sistema de build moderno (KDE, OpenCV, hashcat, ...).", output: "Substituto comum do autotools." },
          { cmd: "ninja-build", desc: "Backend rápido para cmake.", output: "cmake -G Ninja" },
          { cmd: "pkg-config", desc: "Resolve flags de compilação (-I, -L) para libs do sistema.", output: "pkg-config --cflags openssl" },
          { cmd: "autoconf automake libtool", desc: "Gera o ./configure quando o repo só tem configure.ac.", output: "Use autoreconf -fiv para gerar." },
          { cmd: "checkinstall", desc: "Empacota o resultado do make install em .deb.", output: "Recomendado para tudo que vai rodar muitas vezes." },
          { cmd: "git", desc: "Para clonar o source.", output: "Quase tudo está em GitHub/GitLab hoje." },
          { cmd: "fakeroot", desc: "Simula permissões root sem ser root.", output: "Necessário para dpkg-buildpackage." },
        ]}
      />

      <h2>O ciclo clássico autotools: ./configure && make && make install</h2>
      <Terminal
        path="~/build"
        lines={[
          {
            cmd: "git clone https://github.com/aircrack-ng/aircrack-ng.git",
            out: `Cloning into 'aircrack-ng'...
remote: Enumerating objects: 41892, done.
remote: Counting objects: 100% (3812/3812), done.
Receiving objects: 100% (41892/41892), 12.42 MiB | 9.21 MiB/s, done.
Resolving deltas: 100% (32184/32184), done.`,
            outType: "info",
          },
          {
            cmd: "cd aircrack-ng",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "instalar dependências de build informadas pelo README",
            cmd: "sudo apt install -y libssl-dev libnl-3-dev libnl-genl-3-dev pkg-config libpcap-dev libsqlite3-dev libpcre2-dev libhwloc-dev",
            out: "(instala libs -dev necessárias para o build)",
            outType: "muted",
          },
          {
            comment: "gerar o ./configure (apenas se o repo não tiver pronto)",
            cmd: "autoreconf -i",
            out: `configure.ac:30: installing './compile'
configure.ac:14: installing './missing'`,
            outType: "default",
          },
          {
            cmd: "./configure --with-experimental --with-gcrypt --prefix=/opt/aircrack-ng",
            out: `checking for gcc... gcc
checking whether the C compiler works... yes
checking for OpenSSL... yes
checking for libnl-3.0... yes
[...]
config.status: creating Makefile
config.status: creating src/Makefile`,
            outType: "info",
          },
          {
            comment: "compilar usando todos os cores",
            cmd: "make -j$(nproc)",
            out: `make[1]: Entering directory '/home/wallyson/build/aircrack-ng/src'
  CC       aircrack-ng.o
  CC       cowpatty.o
  [...]
make[1]: Leaving directory '/home/wallyson/build/aircrack-ng/src'`,
            outType: "warning",
          },
          {
            cmd: "sudo make install",
            out: `make[1]: Entering directory '/home/wallyson/build/aircrack-ng/src'
  /usr/bin/install -c aircrack-ng /opt/aircrack-ng/bin/aircrack-ng
  /usr/bin/install -c airdecap-ng /opt/aircrack-ng/bin/airdecap-ng
  [...]`,
            outType: "success",
          },
          {
            cmd: "/opt/aircrack-ng/bin/aircrack-ng --help | head -3",
            out: `Aircrack-ng 1.7.0 (custom build) - (C) 2006-2024 Thomas d'Otreppe
https://www.aircrack-ng.org`,
            outType: "info",
          },
        ]}
      />

      <CommandTable
        title="Targets comuns do Makefile"
        variations={[
          { cmd: "make", desc: "Compila tudo (target 'all' implícito).", output: "Use -j$(nproc) para paralelizar." },
          { cmd: "make install", desc: "Copia binários para PREFIX (default: /usr/local/).", output: "Geralmente exige sudo." },
          { cmd: "make uninstall", desc: "Remove o que install colocou.", output: "Quando o autor implementou." },
          { cmd: "make clean", desc: "Apaga objetos e binários gerados (mantém ./configure).", output: "Para rebuild limpo." },
          { cmd: "make distclean", desc: "Apaga TUDO inclusive Makefile gerado.", output: "Para regenerar do zero." },
          { cmd: "make check", desc: "Roda testes (quando existem).", output: "Sanidade pré-instalação." },
        ]}
      />

      <h2>checkinstall — empacote o resultado em .deb</h2>
      <p>
        Problema do <code>make install</code>: ele espalha arquivos por todo lado SEM o
        dpkg saber. Você não consegue desinstalar limpo, não tem versão registrada,
        não aparece em <code>dpkg -l</code>. <strong>checkinstall</strong> resolve:
        substitui o <code>make install</code> e gera um <code>.deb</code> de verdade.
      </p>

      <Terminal
        path="~/build/aircrack-ng"
        lines={[
          {
            cmd: "sudo apt install -y checkinstall",
            out: "Setting up checkinstall (1.6.2+git20170426.d4a6181-3) ...",
            outType: "info",
          },
          {
            comment: "no lugar de 'sudo make install', rode:",
            cmd: "sudo checkinstall --pkgname=aircrack-ng-custom --pkgversion=1.7.0+custom --maintainer=wallyson@kali",
            out: `checkinstall 1.6.2

The package documentation directory ./doc-pak does not exist.
Should I create a default set of package docs?  [y]: y
[...]

This package will be built according to these values:
0 -  Maintainer: [ wallyson@kali ]
1 -  Summary: [ Custom build of aircrack-ng ]
2 -  Name:    [ aircrack-ng-custom ]
3 -  Version: [ 1.7.0+custom ]
4 -  Release: [ 1 ]
5 -  License: [ GPL ]
6 -  Group:   [ checkinstall ]
7 -  Architecture: [ amd64 ]
8 -  Source location: [ aircrack-ng ]

Enter a number to change any of them or press ENTER to continue:

[...]

**********************************************************************
 Done. The new package has been installed and saved to

 /home/wallyson/build/aircrack-ng/aircrack-ng-custom_1.7.0+custom-1_amd64.deb

 You can remove it from your system anytime using:

      dpkg -r aircrack-ng-custom

**********************************************************************`,
            outType: "success",
          },
          {
            cmd: "dpkg -l aircrack-ng-custom",
            out: `||/ Name                Version             Architecture Description
+++-===================-===================-============-============================
ii  aircrack-ng-custom  1.7.0+custom-1      amd64        Custom build of aircrack-ng`,
            outType: "info",
          },
          {
            comment: "remoção limpa, igual qualquer pacote APT",
            cmd: "sudo dpkg -r aircrack-ng-custom",
            out: "Removing aircrack-ng-custom (1.7.0+custom-1) ...",
            outType: "muted",
          },
        ]}
      />

      <h2>apt build-dep — instalar deps de build automaticamente</h2>
      <p>
        Em vez de adivinhar quais <code>libfoo-dev</code> são necessárias, você pode
        pedir ao APT para instalar as deps de BUILD do pacote oficial Debian/Kali. Isso
        exige <code>deb-src</code> habilitado em <code>sources.list</code>.
      </p>

      <CodeBlock
        language="bash"
        title="/etc/apt/sources.list — descomente a linha deb-src"
        code={`deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware
deb-src http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt update",
            out: `Get:1 http://http.kali.org/kali kali-rolling/main Sources [12.4 MB]`,
            outType: "info",
          },
          {
            cmd: "sudo apt build-dep aircrack-ng",
            out: `The following NEW packages will be installed:
  ethtool libnl-3-dev libnl-genl-3-dev libpcap-dev libpcre2-dev libsqlite3-dev
  libssl-dev libhwloc-dev pkg-config zlib1g-dev
0 upgraded, 10 newly installed, 0 to remove.`,
            outType: "success",
          },
          {
            comment: "baixar o source com a estrutura debian/ pronta",
            cmd: "apt source aircrack-ng",
            out: `Need to get 6,512 kB of source archives.
Get:1 http://http.kali.org/kali kali-rolling/main aircrack-ng 1:1.7-9 (dsc) [2,841 B]
[...]
Unpacking aircrack-ng (1:1.7-9) ...
gpgv: Signature made Wed 12 Jun 2024 14:21:04 BRT`,
            outType: "default",
          },
        ]}
      />

      <h2>dpkg-buildpackage — construir um .deb "à moda Debian"</h2>
      <p>
        Se o repo já vem com o diretório <code>debian/</code> (regras de build estilo
        Debian), você pode construir um <code>.deb</code> oficial-grade direto:
      </p>

      <Terminal
        path="~/build/aircrack-ng-1.7"
        lines={[
          {
            cmd: "ls debian/",
            out: `changelog  compat  control  copyright  patches/  rules  source/`,
            outType: "default",
          },
          {
            comment: "-us -uc = sem assinatura GPG, -b = só binário",
            cmd: "dpkg-buildpackage -us -uc -b -j$(nproc)",
            out: `dpkg-buildpackage: info: source package aircrack-ng
dpkg-buildpackage: info: source version 1:1.7-9
dpkg-buildpackage: info: source distribution kali-rolling
[...]
dpkg-deb: building package 'aircrack-ng' in '../aircrack-ng_1.7-9_amd64.deb'.`,
            outType: "success",
          },
          {
            cmd: "ls ..",
            out: `aircrack-ng-1.7/                   aircrack-ng_1.7-9_amd64.changes
aircrack-ng_1.7-9_amd64.buildinfo  aircrack-ng_1.7-9_amd64.deb
aircrack-ng_1.7-9.dsc              aircrack-ng_1.7.orig.tar.gz`,
            outType: "info",
          },
        ]}
      />

      <h2>Estrutura debian/ explicada</h2>
      <CommandTable
        title="Arquivos chave do diretório debian/"
        variations={[
          { cmd: "control", desc: "Metadata do pacote: nome, versão, deps, descrição.", output: "Editar para mudar Maintainer ou Depends." },
          { cmd: "rules", desc: "Makefile que orquestra o build (clean, build, install, binary).", output: "Aqui é onde você adiciona flag custom de compilação." },
          { cmd: "changelog", desc: "Histórico de versões. Atualize com dch -i.", output: "Versão NOVA cresce o número aqui." },
          { cmd: "patches/", desc: "Patches aplicados antes do build (formato quilt).", output: "Adicionar patch custom: dpkg-source --commit." },
          { cmd: "copyright", desc: "Licenças (formato DEP-5).", output: "Obrigatório para distribuição." },
          { cmd: "compat", desc: "Versão do debhelper.", output: "Geralmente >= 13." },
          { cmd: "source/format", desc: "3.0 (quilt) ou 3.0 (native).", output: "Quilt = source upstream + patches separados." },
        ]}
      />

      <CodeBlock
        language="bash"
        title="debian/rules — exemplo simplificado"
        code={`#!/usr/bin/make -f

%:
\tdh $@

override_dh_auto_configure:
\tdh_auto_configure -- --with-experimental --with-gcrypt

override_dh_auto_test:
\t# pula testes em build oficial
\ttrue`}
      />

      <h2>Alternativa elegante: /opt + GNU stow</h2>
      <p>
        Se você instala muita ferramenta custom e quer manter ORGANIZADO sem mexer no
        dpkg, use <strong>stow</strong>: cada tool fica em um subdir{" "}
        <code>/opt/&lt;nome&gt;/</code>, e <code>stow</code> cria symlinks no PATH.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y stow",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "compilar a tool com prefix em /opt/<nome>",
            cmd: "./configure --prefix=/opt/minhatool/1.0 && make -j$(nproc) && sudo make install",
            out: "(arquivos vão para /opt/minhatool/1.0/bin, lib, share, ...)",
            outType: "info",
          },
          {
            cmd: "ls /opt/minhatool/1.0/",
            out: `bin/  include/  lib/  share/`,
            outType: "default",
          },
          {
            comment: "stow cria symlinks /usr/local/bin/* -> /opt/minhatool/1.0/bin/*",
            cmd: "cd /opt && sudo stow --target=/usr/local minhatool/1.0",
            out: "(silencioso)",
            outType: "success",
          },
          {
            cmd: "which minhatool",
            out: "/usr/local/bin/minhatool",
            outType: "info",
          },
          {
            cmd: "ls -la /usr/local/bin/minhatool",
            out: "lrwxrwxrwx 1 root root 38 Apr 18 14:42 /usr/local/bin/minhatool -> ../../../opt/minhatool/1.0/bin/minhatool",
            outType: "default",
          },
          {
            comment: "para remover: stow -D",
            cmd: "cd /opt && sudo stow -D --target=/usr/local minhatool/1.0",
            out: "(symlinks somem; arquivos em /opt/minhatool/ permanecem)",
            outType: "warning",
          },
        ]}
      />

      <h2>Workflow recomendado para tools de pentest do GitHub</h2>
      <CodeBlock
        language="bash"
        title="instalar_tool_github.sh"
        code={`#!/usr/bin/env bash
set -euo pipefail

REPO_URL="$1"           # ex: https://github.com/projectdiscovery/nuclei
TOOL_NAME=$(basename "$REPO_URL" .git)
PREFIX="/opt/${"$"}{TOOL_NAME}"

echo "[*] Instalando $TOOL_NAME em $PREFIX"

# 1) clonar
sudo mkdir -p /opt/src
cd /opt/src
[ -d "$TOOL_NAME" ] || sudo git clone --depth 1 "$REPO_URL"
cd "$TOOL_NAME"

# 2) detectar tipo de build
if [ -f Makefile ]; then
  sudo make
  sudo make install PREFIX="$PREFIX"
elif [ -f setup.py ] || [ -f pyproject.toml ]; then
  sudo apt install -y pipx
  pipx install --force .
elif [ -f go.mod ]; then
  sudo apt install -y golang
  go build -o "$PREFIX/bin/$TOOL_NAME" .
elif [ -f Cargo.toml ]; then
  cargo build --release
  sudo install -Dm755 target/release/* "$PREFIX/bin/"
fi

echo "[+] OK. Adicione $PREFIX/bin ao PATH se necessário."`}
      />

      <h2>Dicas de troubleshooting de build</h2>
      <CommandTable
        title="Quando o ./configure falha"
        variations={[
          { cmd: "checking for X... no", desc: "Falta o pacote -dev correspondente.", output: "apt-cache search libX-dev" },
          { cmd: "config.log", desc: "Log COMPLETO de tudo que o configure tentou.", output: "less config.log + busca pelo erro." },
          { cmd: "make -n", desc: "Dry-run: mostra comandos sem executar.", output: "Para entender o que o make tentaria." },
          { cmd: "make V=1 / make VERBOSE=1", desc: "Build verboso (mostra gcc com todos flags).", output: "Para ver -I, -L, -D aplicados." },
          { cmd: "ldd binario", desc: "Pós-build: confirma que linkou contra as libs corretas.", output: "libssl.so.3 => /lib/x86_64-linux-gnu/libssl.so.3" },
        ]}
      />

      <PracticeBox
        title="Compilar uma tool simples e empacotar com checkinstall"
        goal="Compilar 'tree' do source, instalar em /opt via checkinstall, validar dpkg -l e remover limpo."
        steps={[
          "Instale build-essential e checkinstall.",
          "Baixe o source de tree (Debian).",
          "Compile com make.",
          "Use checkinstall em vez de make install.",
          "Confirme aparição em dpkg -l e remova.",
        ]}
        command={`sudo apt install -y build-essential checkinstall

mkdir -p ~/build && cd ~/build
apt source tree && cd tree-*

make -j$(nproc)

sudo checkinstall --default --pkgname=tree-custom --pkgversion=2.2.1+custom

dpkg -l tree-custom

sudo dpkg -r tree-custom`}
        expected={`gcc -O2 -Wall -fno-strict-aliasing -DLINUX  -c color.c
[...]
**********************************************************************
 Done. The new package has been installed and saved to
 /home/wallyson/build/tree-2.2.1/tree-custom_2.2.1+custom-1_amd64.deb
**********************************************************************

ii  tree-custom  2.2.1+custom-1  amd64  Custom build

(Removing tree-custom (2.2.1+custom-1) ...)`}
        verify="Se o dpkg -l mostrou 'ii tree-custom' e a remoção foi limpa via dpkg -r, você dominou o ciclo source → .deb gerenciado."
      />

      <AlertBox type="warning" title="NUNCA rode make install sem checkinstall ou stow">
        <p>
          <code>sudo make install</code> "puro" espalha arquivos por <code>/usr/local/</code>{" "}
          sem registro. Em 6 meses você não saberá o que veio de onde, conflitos com
          pacotes APT vão acontecer e desinstalação vira arqueologia.
        </p>
        <p>
          Regras de ouro:
          <br />
          1) <strong>checkinstall</strong> → quando quer um .deb gerenciado.
          <br />
          2) <strong>--prefix=/opt/tool/version + stow</strong> → para múltiplas tools
          isoladas.
          <br />
          3) <strong>pipx / cargo install / go install</strong> → quando a tool é
          Python/Rust/Go (cada um tem seu gerenciador).
        </p>
      </AlertBox>

      <AlertBox type="info" title="Pentest mindset: source = customização">
        <p>
          Compilar do source destrava poderes que o pacote não dá: aplicar patch para
          driver Wi-Fi exótico (RTL8812AU em monitor mode), construir hashcat com
          algoritmo experimental, gerar binário stripado/UPX para uso em alvo.
          Domine este fluxo — separa o operador do consumidor.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
