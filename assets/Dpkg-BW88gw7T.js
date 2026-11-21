import{j as e}from"./index-Bd5otbF3.js";import{P as a}from"./PageContainer-BFcnvssG.js";import{A as t}from"./AlertBox-CL6YULjX.js";import{C as s}from"./CodeBlock-C2J-D4l6.js";import{C as r}from"./CommandTable-BxJEHhQ9.js";import{T as o,P as i}from"./PracticeBox-Pst8IaIf.js";function m(){return e.jsxs(a,{title:"dpkg — o motor por trás do APT",subtitle:"Instalar .deb manualmente, investigar pacotes, recompactar binários, divertir libs e desbloquear sistemas em estado quebrado.",difficulty:"intermediario",timeToRead:"16 min",children:[e.jsx("h2",{children:"O que dpkg é (e o que NÃO é)"}),e.jsxs("p",{children:[e.jsx("code",{children:"dpkg"})," é o instalador ",e.jsx("em",{children:"low-level"})," de pacotes ",e.jsx("code",{children:".deb"}),". Ele NÃO resolve dependências — se faltar uma lib, simplesmente falha. O APT é quem orquestra: baixa ",e.jsx("code",{children:".deb"}),", calcula ordem correta, chama"," ",e.jsx("code",{children:"dpkg"})," com cada arquivo na sequência certa."]}),e.jsxs("p",{children:["Por que aprender ",e.jsx("code",{children:"dpkg"}),"? Porque há cenários onde o APT não te ajuda:",e.jsx("strong",{children:" instalar um .deb baixado direto"})," (ex: Burp Suite Pro, ferramenta de C2 distribuída como .deb, payload empacotado), inspecionar arquivos de um ",e.jsx("code",{children:".deb"})," antes de rodar, recuperar de um upgrade quebrado."]}),e.jsx("h2",{children:"Comandos fundamentais"}),e.jsx(r,{title:"dpkg one-liners de sobrevivência",variations:[{cmd:"sudo dpkg -i pacote.deb",desc:"Instala um .deb (sem resolver deps).",output:"Se faltar lib: 'dependency problems'."},{cmd:"sudo apt install -f",desc:"Conserto pós dpkg -i: APT resolve deps faltando.",output:"Sequência canônica: dpkg -i; apt install -f."},{cmd:"sudo dpkg -r nome-pacote",desc:"Remove o pacote (mantém configs em /etc).",output:"Equivalente a apt remove."},{cmd:"sudo dpkg --purge nome-pacote",desc:"Remove pacote E arquivos de config.",output:"Equivalente a apt purge."},{cmd:"dpkg -l",desc:"Lista TODOS pacotes instalados.",output:"Status: ii (installed), rc (removed but config), iU (unpacked broken)..."},{cmd:"dpkg -l 'nmap*'",desc:"Filtra por glob.",output:"ii  nmap  7.95+dfsg-3  amd64  The Network Mapper"},{cmd:"dpkg -L nome-pacote",desc:"Lista TODOS arquivos que o pacote instalou.",output:"Útil para 'onde foi parar o binário do X?'."},{cmd:"dpkg -S /usr/bin/nmap",desc:"Reverso: qual pacote dono deste arquivo?",output:"nmap: /usr/bin/nmap"},{cmd:"dpkg -s nome-pacote",desc:"Status detalhado (versão, tamanho, depends).",output:"Status: install ok installed"},{cmd:"dpkg-deb -I pacote.deb",desc:"Info de um .deb (sem instalar).",output:"Package: foo; Version: 1.0; Maintainer: ..."},{cmd:"dpkg-deb -c pacote.deb",desc:"Lista arquivos DENTRO do .deb (sem instalar).",output:"Como tar -tvf, mas pra .deb."},{cmd:"dpkg-deb -x pacote.deb destino/",desc:"Extrai conteúdo do .deb para um dir.",output:"ÚTIL para inspecionar payload .deb suspeito."}]}),e.jsx("h2",{children:"Instalando um .deb baixado"}),e.jsx(o,{path:"~",lines:[{cmd:"wget https://download.sysinternals.com/files/SysinternalsSuite.deb -O ss.deb",out:`--2026-04-12 11:21:45--  https://download.sysinternals.com/files/SysinternalsSuite.deb
HTTP request sent, awaiting response... 200 OK
Length: 8423921 (8.0M) [application/octet-stream]
Saving to: 'ss.deb'

ss.deb              100%[==============================>]   8.03M  4.21MB/s    in 2.0s

2026-04-12 11:21:48 (4.21 MB/s) - 'ss.deb' saved [8423921/8423921]`,outType:"info"},{comment:"ANTES de instalar: o que tem dentro?",cmd:"dpkg-deb -I ss.deb",out:` new Debian package, version 2.0.
 size 8423921 bytes: control archive=2841 bytes.
     441 bytes,    11 lines      control
     189 bytes,     3 lines      md5sums

 Package: sysinternals-suite
 Version: 1.0
 Architecture: amd64
 Maintainer: Microsoft <opensource@microsoft.com>
 Depends: libc6, wine64 | wine32`,outType:"default"},{cmd:"sudo dpkg -i ss.deb",out:`Selecting previously unselected package sysinternals-suite.
(Reading database ... 412384 files currently installed.)
Preparing to unpack ss.deb ...
Unpacking sysinternals-suite (1.0) ...
dpkg: dependency problems prevent configuration of sysinternals-suite:
 sysinternals-suite depends on wine64 | wine32; however:
  Package wine64 is not installed.

dpkg: error processing package sysinternals-suite (--install):
 dependency problems - leaving unconfigured`,outType:"error"},{comment:"APT entra para limpar a sujeira do dpkg",cmd:"sudo apt install -f",out:`The following additional packages will be installed:
  wine wine64 libwine ...
After this operation, 412 MB of additional disk space will be used.
[...]
Setting up sysinternals-suite (1.0) ...`,outType:"success"}]}),e.jsx("h2",{children:"Estados de pacote em dpkg -l"}),e.jsx(s,{language:"text",title:"A coluna de 2 letras do dpkg -l",code:`+++-=========-=========-============-====================================
||/ Name      Version   Architecture Description
+++-=========-=========-============-====================================
ii  nmap      7.95+...  amd64        The Network Mapper

  ^^
  ||
  |+--- Status atual:
  |    n = not-installed
  |    i = installed
  |    c = config-files only (removido com -r, sem --purge)
  |    U = unpacked (mas não configurado — broken!)
  |    F = half-configured
  |    H = half-installed
  |    W = trigger-awaited
  |
  +---- Status desejado:
       u = unknown
       i = install
       h = hold
       r = remove
       p = purge

Combinações que importam:
  ii  → tudo OK, instalado
  rc  → removido, mas config sobreviveu (apt purge limpa)
  iU  → DESEJA instalar, está só unpacked = QUEBRADO
  iF  → instalado mas config falhou = QUEBRADO`}),e.jsx(o,{path:"~",lines:[{comment:"encontrar pacotes em estado quebrado (i? algo)",cmd:"dpkg -l | awk '/^[a-z][^i]/ {print $2, $3}'",out:`iU  metasploit-framework  6.4.42-0kali1
rc  python3.11            3.11.10-1`,outType:"warning"}]}),e.jsx("h2",{children:"Salvar / restaurar lista de pacotes"}),e.jsx("p",{children:"Cenário: você customizou um Kali com 60 ferramentas extras e quer reproduzir em outra VM (ou após formato)."}),e.jsx(o,{path:"~",lines:[{comment:"exportar lista de tudo que está marcado para 'install'",cmd:"dpkg --get-selections > /tmp/meus_pacotes.list",out:"(silencioso, ~3000 linhas)",outType:"muted"},{cmd:"head -5 /tmp/meus_pacotes.list",out:`accountsservice                                 install
acl                                             install
adduser                                         install
aircrack-ng                                     install
amass                                           install`,outType:"info"},{comment:"no novo Kali — restaurar",cmd:"sudo dpkg --set-selections < /tmp/meus_pacotes.list",out:"(silencioso)",outType:"muted"},{cmd:"sudo apt-get dselect-upgrade",out:"(APT instala tudo que está marcado mas ainda não está)",outType:"success"}]}),e.jsx("h2",{children:"Recompactar / criar .deb"}),e.jsxs("p",{children:["Cenário ofensivo: você tem um ",e.jsx("code",{children:".deb"})," de uma tool e quer instrumentar (adicionar um postinst que faça algo no momento da instalação) para um cenário de simulação de supply chain."]}),e.jsx(o,{path:"~",lines:[{comment:"extrair tudo (binários + DEBIAN/control + scripts)",cmd:"dpkg-deb -R original.deb /tmp/work/",out:"(extrai em estrutura completa)",outType:"info"},{cmd:"ls /tmp/work/DEBIAN/",out:"control     md5sums     postinst    postrm      preinst",outType:"default"},{cmd:"cat /tmp/work/DEBIAN/control",out:`Package: foo
Version: 1.0
Architecture: amd64
Maintainer: legitimate@vendor.com
Depends: libc6
Description: Foo tool`,outType:"default"},{comment:"edite o que precisar, depois recompacte",cmd:"dpkg-deb --build /tmp/work/ /tmp/foo-modificado.deb",out:"dpkg-deb: building package 'foo' in '/tmp/foo-modificado.deb'.",outType:"warning"}]}),e.jsxs(t,{type:"danger",title:"Hooks de pacote = vetor histórico de ataque",children:[e.jsxs("p",{children:[e.jsx("code",{children:"preinst"}),", ",e.jsx("code",{children:"postinst"}),", ",e.jsx("code",{children:"prerm"}),","," ",e.jsx("code",{children:"postrm"})," são scripts executados ",e.jsx("strong",{children:"como root"})," durante a instalação. Esse é o ponto que ataques a supply chain e .deb maliciosos exploram. SEMPRE inspecione um .deb baixado de fonte não-oficial:"]}),e.jsx(o,{path:"~",lines:[{cmd:"dpkg-deb -e suspeito.deb /tmp/control && cat /tmp/control/postinst",out:"(leia o script LINHA POR LINHA)",outType:"warning"}]})]}),e.jsx("h2",{children:"dpkg-divert — desviar um arquivo"}),e.jsxs("p",{children:[e.jsx("code",{children:"dpkg-divert"})," renomeia um arquivo gerenciado por pacote para um nome alternativo, e o pacote NUNCA mais sobrescreve o original. Cenário prático: você modificou ",e.jsx("code",{children:"/usr/bin/sudo"})," com um wrapper de log de comando (auditoria caseira). Sem divert, o próximo apt upgrade do"," ",e.jsx("code",{children:"sudo"})," apaga seu wrapper."]}),e.jsx(o,{path:"~",lines:[{cmd:"sudo dpkg-divert --add --rename --divert /usr/bin/sudo.real /usr/bin/sudo",out:`Adding 'local diversion of /usr/bin/sudo to /usr/bin/sudo.real'
Renaming 'sudo' to 'sudo.real'`,outType:"info"},{comment:"agora ponha seu wrapper em /usr/bin/sudo",cmd:"ls -la /usr/bin/sudo*",out:`lrwxrwxrwx 1 root root   17 Apr 12 11:34 /usr/bin/sudo -> /usr/local/bin/sudo-wrapper
-rwsr-xr-x 1 root root 234856 Mar 14 09:12 /usr/bin/sudo.real`,outType:"warning"},{comment:"para remover o divert",cmd:"sudo dpkg-divert --rename --remove /usr/bin/sudo",out:"Removing 'local diversion of /usr/bin/sudo to /usr/bin/sudo.real'",outType:"muted"}]}),e.jsx("h2",{children:"Resgatar sistema em estado broken"}),e.jsxs("p",{children:["Se você reiniciou no meio de um upgrade, ou um pacote falhou no postinst, o dpkg fica com pacotes em status ",e.jsx("code",{children:"iU"})," ou ",e.jsx("code",{children:"iF"}),". O sistema pode até continuar bootando, mas ",e.jsx("code",{children:"apt"})," recusa qualquer operação até consertar."]}),e.jsx(o,{path:"~",lines:[{cmd:"sudo apt update",out:"E: dpkg was interrupted, you must manually run 'sudo dpkg --configure -a' to correct the problem.",outType:"error"},{comment:"fluxo canônico de cura",cmd:"sudo dpkg --configure -a",out:`Setting up libc6:amd64 (2.41-1) ...
Setting up python3.12 (3.12.7-1) ...
Setting up postgresql-16 (16.4-2) ...`,outType:"info"},{cmd:"sudo apt install -f",out:"0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.",outType:"success"},{comment:"se um pacote ESPECÍFICO continua quebrado",cmd:"sudo dpkg --configure --force-confnew metasploit-framework",out:"Setting up metasploit-framework (6.4.42-0kali1) ...",outType:"warning"},{comment:"último recurso: forçar remoção do pacote teimoso",cmd:"sudo dpkg --remove --force-remove-reinstreq metasploit-framework",out:"(NUNCA use sem entender o motivo do iF/iU)",outType:"error"}]}),e.jsx("h2",{children:"Forensics rápido com dpkg"}),e.jsx("p",{children:"Pós-comprometimento (no LADO DEFENSIVO), dpkg ajuda a saber o que foi modificado em relação ao pacote original."}),e.jsx(o,{path:"~",lines:[{comment:"dpkg --verify checa md5sums do pacote vs disco",cmd:"sudo dpkg --verify",out:`??5??????   /usr/bin/sudo
missing     /etc/cron.d/passwd_check`,outType:"warning"},{comment:"?5? = md5 não bate. ??M = atributos modificados.",cmd:"dpkg -V coreutils",out:"(silencioso = OK; qualquer linha = arquivo alterado)",outType:"muted"},{comment:"checar se um binário pertence a UM pacote do repo",cmd:"dpkg -S /usr/bin/python3.12",out:"python3.12-minimal: /usr/bin/python3.12",outType:"info"},{comment:"se NADA aparecer = binário NÃO veio de pacote (suspeito)",cmd:"dpkg -S /tmp/.suspicious_binary",out:"dpkg-query: no path found matching pattern /tmp/.suspicious_binary",outType:"error"}]}),e.jsx(i,{title:"Inspecionar um .deb antes de instalar",goal:"Baixar um .deb genérico, listar metadata e arquivos sem instalar, ler scripts de pré/pós-instalação.",steps:["Baixe um .deb (ex: tor browser launcher).","Mostre o control (metadata).","Liste todos os arquivos que o pacote vai instalar.","Extraia DEBIAN/ e leia postinst."],command:`apt download tor
ls *.deb
DEB=$(ls tor_*.deb | head -1)

dpkg-deb -I "$DEB"
echo "---"
dpkg-deb -c "$DEB" | head
echo "---"
mkdir -p /tmp/inspect
dpkg-deb -e "$DEB" /tmp/inspect/
ls /tmp/inspect/
cat /tmp/inspect/postinst 2>/dev/null | head -20`,expected:` Package: tor
 Version: 0.4.8.13-1
 Maintainer: Peter Palfrader
 Depends: adduser, ...
---
drwxr-xr-x root/root         0 ./etc/
drwxr-xr-x root/root         0 ./etc/tor/
-rw-r--r-- root/root      8421 ./etc/tor/torrc
-rwxr-xr-x root/root    348201 ./usr/bin/tor
---
control  md5sums  postinst  postrm  preinst  prerm
#!/bin/sh
set -e
case "$1" in
    configure) ...`,verify:"Você consegue ver TODA a estrutura do .deb sem ele tocar no sistema. Esse fluxo é mandatório para .deb baixado de fonte não-oficial."}),e.jsx(t,{type:"info",title:"Mantra para sobreviver",children:e.jsxs("p",{children:["1) ",e.jsx("code",{children:"dpkg -i"})," falhou? → ",e.jsx("code",{children:"sudo apt install -f"}),e.jsx("br",{}),"2) Sistema travou no upgrade? → ",e.jsx("code",{children:"sudo dpkg --configure -a"}),e.jsx("br",{}),"3) Achou um .deb suspeito? →"," ",e.jsx("code",{children:"dpkg-deb -I; dpkg-deb -c; dpkg-deb -e"})," (NUNCA -i sem ler).",e.jsx("br",{}),"4) Quer saber quem é o dono de um arquivo? → ",e.jsx("code",{children:"dpkg -S /caminho"}),e.jsx("br",{}),"5) Quer saber TODOS arquivos de um pacote? → ",e.jsx("code",{children:"dpkg -L pacote"})]})})]})}export{m as default};
