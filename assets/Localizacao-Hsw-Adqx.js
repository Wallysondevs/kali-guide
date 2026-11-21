import{j as e}from"./index-Bd5otbF3.js";import{P as i}from"./PageContainer-BFcnvssG.js";import{A as s}from"./AlertBox-CL6YULjX.js";import{C as a}from"./CodeBlock-C2J-D4l6.js";import{C as o}from"./CommandTable-BxJEHhQ9.js";import{T as t,P as r}from"./PracticeBox-Pst8IaIf.js";function p(){return e.jsxs(i,{title:"Locale e tempo",subtitle:"Idioma do sistema, codificação UTF-8, fuso horário e sincronização de relógio com NTP/chrony.",difficulty:"iniciante",timeToRead:"13 min",children:[e.jsx("h2",{children:"Visão geral"}),e.jsxs("p",{children:["Dois aspectos do sistema operacional afetam silenciosamente quase todo software:"," ",e.jsx("strong",{children:"locale"})," (idioma, formato de números/datas e codificação de caracteres) e"," ",e.jsx("strong",{children:"tempo"})," (fuso horário e sincronização de relógio). Configurá-los corretamente evita acentos quebrados em arquivos, ordenações inesperadas, logs com timestamps inconsistentes e falhas de autenticação em protocolos sensíveis ao relógio."]}),e.jsx("h2",{children:"Locale — idioma e codificação"}),e.jsx(o,{title:"comandos de locale",variations:[{cmd:"locale",desc:"Mostra as variáveis de locale ativas na sessão.",output:"LANG, LC_CTYPE, LC_NUMERIC, LC_TIME..."},{cmd:"locale -a",desc:"Lista todos os locales gerados/instalados.",output:"Procure pt_BR.utf8, en_US.utf8."},{cmd:"locale -m",desc:"Lista charmaps disponíveis (UTF-8, ISO-8859-1).",output:"UTF-8 deve ser o padrão."},{cmd:"sudo dpkg-reconfigure locales",desc:"Interface ncurses para escolher e gerar locales.",output:"Define LANG do sistema em /etc/default/locale."},{cmd:"sudo locale-gen pt_BR.UTF-8",desc:"Gera um locale específico sem o menu interativo.",output:"Adiciona à lista de /etc/locale.gen."},{cmd:"sudo update-locale LANG=pt_BR.UTF-8",desc:"Persiste a variável LANG em /etc/default/locale.",output:"Vale para próximas sessões."}]}),e.jsx(t,{path:"~",lines:[{cmd:"locale",out:`LANG=pt_BR.UTF-8
LANGUAGE=
LC_CTYPE="pt_BR.UTF-8"
LC_NUMERIC="pt_BR.UTF-8"
LC_TIME="pt_BR.UTF-8"
LC_COLLATE="pt_BR.UTF-8"
LC_MONETARY="pt_BR.UTF-8"
LC_MESSAGES="pt_BR.UTF-8"
LC_PAPER="pt_BR.UTF-8"
LC_ALL=`,outType:"info"},{comment:"verifica se o locale desejado já foi gerado",cmd:"locale -a | grep -i pt_br",out:`pt_BR
pt_BR.utf8`,outType:"success"}]}),e.jsx("h2",{children:"Hierarquia das variáveis"}),e.jsxs("p",{children:["A precedência (do menos forte para o mais forte) é: ",e.jsx("code",{children:"LANG"})," → variáveis"," ",e.jsx("code",{children:"LC_*"})," individuais → ",e.jsx("code",{children:"LC_ALL"}),". Definir ",e.jsx("code",{children:"LC_ALL"})," ","sobrescreve tudo e é útil para forçar comportamento previsível em scripts. Em produção, configure ",e.jsx("code",{children:"LANG"})," em ",e.jsx("code",{children:"/etc/default/locale"})," e deixe os demais derivados."]}),e.jsx(a,{language:"bash",title:"forçando um locale apenas para um comando",code:`# saída numérica com ponto decimal (útil em pipelines/POSIX)
LC_ALL=C sort -n valores.txt

# datas em inglês para parsing previsível
LC_TIME=C date

# UTF-8 garantido em scripts cron, que nascem com locale POSIX vazio
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8`}),e.jsx("h2",{children:"Por que o locale POSIX/C importa"}),e.jsx(o,{title:"diferenças observáveis",variations:[{cmd:"LC_ALL=C ls",desc:"Ordena por byte (maiúsculas antes de minúsculas).",output:"Comportamento previsível em scripts."},{cmd:"LC_ALL=pt_BR.UTF-8 ls",desc:"Ordena ignorando caixa, usando regras do português.",output:"Bom para humanos, ruim para diff."},{cmd:"LC_NUMERIC=pt_BR.UTF-8 printf '%.2f\\n' 1234.5",desc:"Formata como 1234,50 (vírgula decimal).",output:"Pode quebrar parsing posterior."},{cmd:"LC_NUMERIC=C printf '%.2f\\n' 1234.5",desc:"Formata como 1234.50 (ponto decimal).",output:"Padrão portável."},{cmd:"LC_TIME=C date '+%a'",desc:"Mostra Mon, Tue, Wed... em inglês.",output:"Indispensável para parse com awk."}]}),e.jsx(s,{type:"warning",title:"Acentos quebrados são quase sempre locale errado",children:e.jsxs("p",{children:["Se um arquivo aparece com caracteres como ",e.jsx("code",{children:"cÃ¢mera"})," ou"," ",e.jsx("code",{children:"configura\\xc3\\xa7\\xc3\\xa3o"}),", há quase sempre uma incompatibilidade entre codificação real do arquivo e o ",e.jsx("code",{children:"LANG/LC_CTYPE"})," do terminal. Verifique com"," ",e.jsx("code",{children:"file -i arquivo.txt"})," e converta com"," ",e.jsxs("code",{children:["iconv -f ISO-8859-1 -t UTF-8 entrada.txt ",">"," saida.txt"]}),"."]})}),e.jsx("h2",{children:"Fuso horário — timedatectl"}),e.jsx(o,{title:"timedatectl",variations:[{cmd:"timedatectl status",desc:"Mostra fuso, hora local, UTC, RTC, NTP ativo.",output:"Visão completa em uma tela."},{cmd:"timedatectl list-timezones",desc:"Lista todos os fusos disponíveis.",output:"Use grep para filtrar."},{cmd:"sudo timedatectl set-timezone America/Sao_Paulo",desc:"Define o fuso horário do sistema.",output:"Atualiza /etc/localtime e /etc/timezone."},{cmd:"sudo timedatectl set-ntp true",desc:"Liga sincronização NTP via systemd-timesyncd.",output:"Forma simples de manter o relógio em dia."},{cmd:"sudo timedatectl set-time '2026-04-03 10:00:00'",desc:"Define manualmente (apenas com NTP off).",output:"Útil em ambientes air-gapped."},{cmd:"sudo timedatectl set-local-rtc 0",desc:"Mantém o RTC em UTC (recomendado).",output:"Evita conflito com Windows em dual boot."}]}),e.jsx(t,{path:"~",lines:[{cmd:"timedatectl status",out:`               Local time: Fri 2026-04-03 09:42:18 -03
           Universal time: Fri 2026-04-03 12:42:18 UTC
                 RTC time: Fri 2026-04-03 12:42:18
                Time zone: America/Sao_Paulo (-03, -0300)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no`,outType:"info"},{comment:"filtrando fusos do Brasil",cmd:"timedatectl list-timezones | grep -i america/sao",out:"America/Sao_Paulo",outType:"success"}]}),e.jsx("h2",{children:"Sincronização de relógio"}),e.jsxs("p",{children:["Há duas implementações comuns de cliente NTP: ",e.jsx("code",{children:"systemd-timesyncd"})," (cliente SNTP simples, padrão em muitas distros) e ",e.jsx("code",{children:"chrony"})," (mais completo, recomendado para servidores e redes corporativas). Apenas um deve estar ativo por vez."]}),e.jsx(o,{title:"systemd-timesyncd",variations:[{cmd:"systemctl status systemd-timesyncd",desc:"Estado do serviço.",output:"Mostra servidor em uso e drift."},{cmd:"timedatectl show-timesync --all",desc:"Detalhes técnicos da sincronização.",output:"Inclui Frequency e ServerAddress."},{cmd:"sudo systemctl restart systemd-timesyncd",desc:"Força re-sincronização imediata.",output:"Bom após mudar /etc/systemd/timesyncd.conf."}]}),e.jsx(a,{language:"ini",title:"/etc/systemd/timesyncd.conf",code:`[Time]
NTP=a.st1.ntp.br b.st1.ntp.br c.st1.ntp.br
FallbackNTP=pool.ntp.org
RootDistanceMaxSec=5
PollIntervalMinSec=32
PollIntervalMaxSec=2048`}),e.jsx(o,{title:"chrony",variations:[{cmd:"sudo apt install -y chrony",desc:"Instala o cliente chrony.",output:"Substitui systemd-timesyncd."},{cmd:"chronyc sources -v",desc:"Lista servidores NTP configurados e estado.",output:"Mostra reachability e offset."},{cmd:"chronyc tracking",desc:"Estado atual: drift, stratum, último ajuste.",output:"Resposta detalhada para diagnóstico."},{cmd:"sudo chronyc makestep",desc:"Ajuste imediato (em vez de slew gradual).",output:"Útil em primeiro boot."}]}),e.jsx(t,{path:"~",lines:[{cmd:"chronyc sources -v",out:`MS Name/IP address         Stratum Poll Reach LastRx Last sample
=============================================================================
^* a.st1.ntp.br                  1   6   377    23  -132us[ -210us] +/- 5.4ms
^- b.st1.ntp.br                  1   6   377    19   +1.2ms[+1.2ms] +/- 6.8ms
^? c.st1.ntp.br                  1   6   001    25   +0.8ms[+0.8ms] +/- 9.0ms`,outType:"info"},{cmd:"chronyc tracking",out:`Reference ID    : 200.160.7.193 (a.st1.ntp.br)
Stratum         : 2
System time     : 0.000123 seconds slow of NTP time
Last offset     : -0.000142 seconds
RMS offset      : 0.000201 seconds
Frequency       : 12.345 ppm slow
Update interval : 64.2 seconds
Leap status     : Normal`,outType:"success"}]}),e.jsx(s,{type:"info",title:"Por que sincronizar o relógio importa",children:e.jsxs("p",{children:["Logs distribuídos só são correlacionáveis com timestamps consistentes — um servidor atrasado quebra a ordem cronológica de eventos no SIEM. Protocolos de autenticação como ",e.jsx("strong",{children:"Kerberos"})," exigem que o relógio das partes esteja a no máximo"," ",e.jsx("strong",{children:"5 minutos de diferença"})," (clock skew) ou os tickets são rejeitados. Certificados TLS validam ",e.jsx("code",{children:"notBefore"}),"/",e.jsx("code",{children:"notAfter"})," contra o relógio local: um clock muito desatualizado faz tudo aparecer “expirado”. NTP é infraestrutura básica."]})}),e.jsx("h2",{children:"Comando legado — ntpdate"}),e.jsx(t,{path:"~",lines:[{comment:"ajuste manual avulso, fora do daemon (raro hoje)",cmd:"sudo ntpdate -u a.st1.ntp.br",out:" 3 Apr 09:55:01 ntpdate[14821]: adjust time server 200.160.7.193 offset +0.001234 sec",outType:"muted"}]}),e.jsx(r,{title:"Configurar pt_BR.UTF-8 e fuso de São Paulo",goal:"Deixar o sistema em português brasileiro UTF-8, fuso America/Sao_Paulo e relógio sincronizado via NTP.",steps:["Gerar o locale pt_BR.UTF-8 e definir como LANG do sistema.","Definir o fuso horário com timedatectl.","Habilitar sincronização NTP.","Conferir status final do relógio e a saída de locale.","Reabrir a sessão (logout/login) para aplicar variáveis."],command:`sudo locale-gen pt_BR.UTF-8
sudo update-locale LANG=pt_BR.UTF-8 LC_ALL=

sudo timedatectl set-timezone America/Sao_Paulo
sudo timedatectl set-ntp true

timedatectl status
locale`,expected:`Generating locales (this might take a while)...
  pt_BR.UTF-8... done
Generation complete.
               Local time: Fri 2026-04-03 10:01:14 -03
                Time zone: America/Sao_Paulo (-03, -0300)
System clock synchronized: yes
              NTP service: active
LANG=pt_BR.UTF-8`,verify:"Após logout/login, locale deve mostrar LANG=pt_BR.UTF-8 e timedatectl status confirmar fuso e sincronização ativos."}),e.jsx(s,{type:"warning",title:"Cron e systemd timers herdam locale POSIX",children:e.jsxs("p",{children:["Tarefas agendadas costumam rodar com locale ",e.jsx("code",{children:"C"}),"/",e.jsx("code",{children:"POSIX"}),", não com o do seu shell interativo. Se um script depende de UTF-8 ou de mensagens em português, defina ",e.jsx("code",{children:"LANG"})," e ",e.jsx("code",{children:"LC_ALL"})," explicitamente no início do script ou na unit, em vez de assumir herança do ambiente."]})})]})}export{p as default};
