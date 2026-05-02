import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Localizacao() {
  return (
    <PageContainer
      title="Locale e tempo"
      subtitle="Idioma do sistema, codificação UTF-8, fuso horário e sincronização de relógio com NTP/chrony."
      difficulty="iniciante"
      timeToRead="13 min"
    >
      <h2>Visão geral</h2>
      <p>
        Dois aspectos do sistema operacional afetam silenciosamente quase todo software:{" "}
        <strong>locale</strong> (idioma, formato de números/datas e codificação de caracteres) e{" "}
        <strong>tempo</strong> (fuso horário e sincronização de relógio). Configurá-los
        corretamente evita acentos quebrados em arquivos, ordenações inesperadas, logs com
        timestamps inconsistentes e falhas de autenticação em protocolos sensíveis ao relógio.
      </p>

      <h2>Locale — idioma e codificação</h2>
      <CommandTable
        title="comandos de locale"
        variations={[
          { cmd: "locale", desc: "Mostra as variáveis de locale ativas na sessão.", output: "LANG, LC_CTYPE, LC_NUMERIC, LC_TIME..." },
          { cmd: "locale -a", desc: "Lista todos os locales gerados/instalados.", output: "Procure pt_BR.utf8, en_US.utf8." },
          { cmd: "locale -m", desc: "Lista charmaps disponíveis (UTF-8, ISO-8859-1).", output: "UTF-8 deve ser o padrão." },
          { cmd: "sudo dpkg-reconfigure locales", desc: "Interface ncurses para escolher e gerar locales.", output: "Define LANG do sistema em /etc/default/locale." },
          { cmd: "sudo locale-gen pt_BR.UTF-8", desc: "Gera um locale específico sem o menu interativo.", output: "Adiciona à lista de /etc/locale.gen." },
          { cmd: "sudo update-locale LANG=pt_BR.UTF-8", desc: "Persiste a variável LANG em /etc/default/locale.", output: "Vale para próximas sessões." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "locale",
            out: `LANG=pt_BR.UTF-8
LANGUAGE=
LC_CTYPE="pt_BR.UTF-8"
LC_NUMERIC="pt_BR.UTF-8"
LC_TIME="pt_BR.UTF-8"
LC_COLLATE="pt_BR.UTF-8"
LC_MONETARY="pt_BR.UTF-8"
LC_MESSAGES="pt_BR.UTF-8"
LC_PAPER="pt_BR.UTF-8"
LC_ALL=`,
            outType: "info",
          },
          {
            comment: "verifica se o locale desejado já foi gerado",
            cmd: "locale -a | grep -i pt_br",
            out: `pt_BR
pt_BR.utf8`,
            outType: "success",
          },
        ]}
      />

      <h2>Hierarquia das variáveis</h2>
      <p>
        A precedência (do menos forte para o mais forte) é: <code>LANG</code> → variáveis{" "}
        <code>LC_*</code> individuais → <code>LC_ALL</code>. Definir <code>LC_ALL</code>{" "}
        sobrescreve tudo e é útil para forçar comportamento previsível em scripts. Em produção,
        configure <code>LANG</code> em <code>/etc/default/locale</code> e deixe os demais
        derivados.
      </p>

      <CodeBlock
        language="bash"
        title="forçando um locale apenas para um comando"
        code={`# saída numérica com ponto decimal (útil em pipelines/POSIX)
LC_ALL=C sort -n valores.txt

# datas em inglês para parsing previsível
LC_TIME=C date

# UTF-8 garantido em scripts cron, que nascem com locale POSIX vazio
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8`}
      />

      <h2>Por que o locale POSIX/C importa</h2>
      <CommandTable
        title="diferenças observáveis"
        variations={[
          { cmd: "LC_ALL=C ls", desc: "Ordena por byte (maiúsculas antes de minúsculas).", output: "Comportamento previsível em scripts." },
          { cmd: "LC_ALL=pt_BR.UTF-8 ls", desc: "Ordena ignorando caixa, usando regras do português.", output: "Bom para humanos, ruim para diff." },
          { cmd: "LC_NUMERIC=pt_BR.UTF-8 printf '%.2f\\n' 1234.5", desc: "Formata como 1234,50 (vírgula decimal).", output: "Pode quebrar parsing posterior." },
          { cmd: "LC_NUMERIC=C printf '%.2f\\n' 1234.5", desc: "Formata como 1234.50 (ponto decimal).", output: "Padrão portável." },
          { cmd: "LC_TIME=C date '+%a'", desc: "Mostra Mon, Tue, Wed... em inglês.", output: "Indispensável para parse com awk." },
        ]}
      />

      <AlertBox type="warning" title="Acentos quebrados são quase sempre locale errado">
        <p>
          Se um arquivo aparece com caracteres como <code>cÃ¢mera</code> ou{" "}
          <code>configura\xc3\xa7\xc3\xa3o</code>, há quase sempre uma incompatibilidade entre
          codificação real do arquivo e o <code>LANG/LC_CTYPE</code> do terminal. Verifique com{" "}
          <code>file -i arquivo.txt</code> e converta com{" "}
          <code>iconv -f ISO-8859-1 -t UTF-8 entrada.txt {`>`} saida.txt</code>.
        </p>
      </AlertBox>

      <h2>Fuso horário — timedatectl</h2>
      <CommandTable
        title="timedatectl"
        variations={[
          { cmd: "timedatectl status", desc: "Mostra fuso, hora local, UTC, RTC, NTP ativo.", output: "Visão completa em uma tela." },
          { cmd: "timedatectl list-timezones", desc: "Lista todos os fusos disponíveis.", output: "Use grep para filtrar." },
          { cmd: "sudo timedatectl set-timezone America/Sao_Paulo", desc: "Define o fuso horário do sistema.", output: "Atualiza /etc/localtime e /etc/timezone." },
          { cmd: "sudo timedatectl set-ntp true", desc: "Liga sincronização NTP via systemd-timesyncd.", output: "Forma simples de manter o relógio em dia." },
          { cmd: "sudo timedatectl set-time '2026-04-03 10:00:00'", desc: "Define manualmente (apenas com NTP off).", output: "Útil em ambientes air-gapped." },
          { cmd: "sudo timedatectl set-local-rtc 0", desc: "Mantém o RTC em UTC (recomendado).", output: "Evita conflito com Windows em dual boot." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "timedatectl status",
            out: `               Local time: Fri 2026-04-03 09:42:18 -03
           Universal time: Fri 2026-04-03 12:42:18 UTC
                 RTC time: Fri 2026-04-03 12:42:18
                Time zone: America/Sao_Paulo (-03, -0300)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no`,
            outType: "info",
          },
          {
            comment: "filtrando fusos do Brasil",
            cmd: "timedatectl list-timezones | grep -i america/sao",
            out: "America/Sao_Paulo",
            outType: "success",
          },
        ]}
      />

      <h2>Sincronização de relógio</h2>
      <p>
        Há duas implementações comuns de cliente NTP: <code>systemd-timesyncd</code> (cliente
        SNTP simples, padrão em muitas distros) e <code>chrony</code> (mais completo,
        recomendado para servidores e redes corporativas). Apenas um deve estar ativo por vez.
      </p>

      <CommandTable
        title="systemd-timesyncd"
        variations={[
          { cmd: "systemctl status systemd-timesyncd", desc: "Estado do serviço.", output: "Mostra servidor em uso e drift." },
          { cmd: "timedatectl show-timesync --all", desc: "Detalhes técnicos da sincronização.", output: "Inclui Frequency e ServerAddress." },
          { cmd: "sudo systemctl restart systemd-timesyncd", desc: "Força re-sincronização imediata.", output: "Bom após mudar /etc/systemd/timesyncd.conf." },
        ]}
      />

      <CodeBlock
        language="ini"
        title="/etc/systemd/timesyncd.conf"
        code={`[Time]
NTP=a.st1.ntp.br b.st1.ntp.br c.st1.ntp.br
FallbackNTP=pool.ntp.org
RootDistanceMaxSec=5
PollIntervalMinSec=32
PollIntervalMaxSec=2048`}
      />

      <CommandTable
        title="chrony"
        variations={[
          { cmd: "sudo apt install -y chrony", desc: "Instala o cliente chrony.", output: "Substitui systemd-timesyncd." },
          { cmd: "chronyc sources -v", desc: "Lista servidores NTP configurados e estado.", output: "Mostra reachability e offset." },
          { cmd: "chronyc tracking", desc: "Estado atual: drift, stratum, último ajuste.", output: "Resposta detalhada para diagnóstico." },
          { cmd: "sudo chronyc makestep", desc: "Ajuste imediato (em vez de slew gradual).", output: "Útil em primeiro boot." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "chronyc sources -v",
            out: `MS Name/IP address         Stratum Poll Reach LastRx Last sample
=============================================================================
^* a.st1.ntp.br                  1   6   377    23  -132us[ -210us] +/- 5.4ms
^- b.st1.ntp.br                  1   6   377    19   +1.2ms[+1.2ms] +/- 6.8ms
^? c.st1.ntp.br                  1   6   001    25   +0.8ms[+0.8ms] +/- 9.0ms`,
            outType: "info",
          },
          {
            cmd: "chronyc tracking",
            out: `Reference ID    : 200.160.7.193 (a.st1.ntp.br)
Stratum         : 2
System time     : 0.000123 seconds slow of NTP time
Last offset     : -0.000142 seconds
RMS offset      : 0.000201 seconds
Frequency       : 12.345 ppm slow
Update interval : 64.2 seconds
Leap status     : Normal`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="info" title="Por que sincronizar o relógio importa">
        <p>
          Logs distribuídos só são correlacionáveis com timestamps consistentes — um servidor
          atrasado quebra a ordem cronológica de eventos no SIEM. Protocolos de autenticação
          como <strong>Kerberos</strong> exigem que o relógio das partes esteja a no máximo{" "}
          <strong>5 minutos de diferença</strong> (clock skew) ou os tickets são rejeitados.
          Certificados TLS validam <code>notBefore</code>/<code>notAfter</code> contra o relógio
          local: um clock muito desatualizado faz tudo aparecer “expirado”. NTP é infraestrutura
          básica.
        </p>
      </AlertBox>

      <h2>Comando legado — ntpdate</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ajuste manual avulso, fora do daemon (raro hoje)",
            cmd: "sudo ntpdate -u a.st1.ntp.br",
            out: " 3 Apr 09:55:01 ntpdate[14821]: adjust time server 200.160.7.193 offset +0.001234 sec",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Configurar pt_BR.UTF-8 e fuso de São Paulo"
        goal="Deixar o sistema em português brasileiro UTF-8, fuso America/Sao_Paulo e relógio sincronizado via NTP."
        steps={[
          "Gerar o locale pt_BR.UTF-8 e definir como LANG do sistema.",
          "Definir o fuso horário com timedatectl.",
          "Habilitar sincronização NTP.",
          "Conferir status final do relógio e a saída de locale.",
          "Reabrir a sessão (logout/login) para aplicar variáveis.",
        ]}
        command={`sudo locale-gen pt_BR.UTF-8
sudo update-locale LANG=pt_BR.UTF-8 LC_ALL=

sudo timedatectl set-timezone America/Sao_Paulo
sudo timedatectl set-ntp true

timedatectl status
locale`}
        expected={`Generating locales (this might take a while)...
  pt_BR.UTF-8... done
Generation complete.
               Local time: Fri 2026-04-03 10:01:14 -03
                Time zone: America/Sao_Paulo (-03, -0300)
System clock synchronized: yes
              NTP service: active
LANG=pt_BR.UTF-8`}
        verify="Após logout/login, locale deve mostrar LANG=pt_BR.UTF-8 e timedatectl status confirmar fuso e sincronização ativos."
      />

      <AlertBox type="warning" title="Cron e systemd timers herdam locale POSIX">
        <p>
          Tarefas agendadas costumam rodar com locale <code>C</code>/<code>POSIX</code>, não com
          o do seu shell interativo. Se um script depende de UTF-8 ou de mensagens em
          português, defina <code>LANG</code> e <code>LC_ALL</code> explicitamente no início do
          script ou na unit, em vez de assumir herança do ambiente.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
