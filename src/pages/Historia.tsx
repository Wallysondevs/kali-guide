import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Historia() {
  return (
    <PageContainer
      title="O que é Kali Linux"
      subtitle="A história, origem e propósito do sistema operacional mais usado em segurança ofensiva."
      difficulty="iniciante"
      timeToRead="8 min"
      prompt="intro/historia"
    >
      <h2>Origens: de BackTrack ao Kali</h2>
      <p>
        O Kali Linux é uma distribuição Linux baseada em Debian, desenvolvida e mantida pela{" "}
        <strong>Offensive Security</strong>. Seu predecessor direto foi o{" "}
        <strong>BackTrack Linux</strong>, que existiu de 2006 a 2013 como referência em segurança.
        Em março de 2013, a Offensive Security lançou o <strong>Kali Linux 1.0</strong>, uma
        reconstrução completa do BackTrack com uma base mais sólida, integração com Debian e uma
        filosofia de desenvolvimento aberta.
      </p>

      <OutputBlock label="genealogia rápida" type="muted">
{`Whoppix (2004)
  └─ WHAX (2005)
       └─ BackTrack 1 (2006)   ← união Whax + Auditor Security
            └─ BackTrack 4 (2009)   ← migração para Debian
                 └─ BackTrack 5 R3 (2012)   ← último BT
                      └─ Kali Linux 1.0 (mar/2013)   ← rebranded, reconstruído
                           └─ Kali 2.0 "Sana" (ago/2015)
                                └─ Kali Rolling (jan/2016)   ← rolling release
                                     └─ Kali Purple (mar/2023)   ← variante Blue Team
                                          └─ Kali 2024.x ... 2025.x (continuum)`}
      </OutputBlock>

      <h2>Linha do Tempo</h2>
      <div className="space-y-3 my-6">
        {[
          { year: "2006", event: "Lançamento do BackTrack 1, unindo Whax e IWHAX" },
          { year: "2009", event: "BackTrack 4 baseado em Debian — grande evolução" },
          { year: "2013", event: "Kali Linux 1.0 lançado pela Offensive Security" },
          { year: "2015", event: "Kali Rolling — atualização contínua (rolling release)" },
          { year: "2019", event: "Kali Linux 2019.4 — novo tema undercover e GNOME padrão" },
          { year: "2020", event: "Kali Linux 2020.1 — pacote default reduzido, Win-KeX para WSL" },
          { year: "2023", event: "Kali Purple — variante defensiva (Blue Team)" },
          { year: "2024", event: "Kali Linux 2024.x com Python 3.12 e ferramentas atualizadas" },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="min-w-[60px] text-primary font-mono text-sm font-bold pt-0.5">
              {item.year}
            </div>
            <div className="flex-1 text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
              {item.event}
            </div>
          </div>
        ))}
      </div>

      <h2>Para que serve o Kali Linux?</h2>
      <p>
        O Kali Linux é projetado especificamente para <strong>profissionais de segurança</strong>.
        Ele vem com mais de 600 ferramentas pré-instaladas para:
      </p>
      <ul>
        <li><strong>Testes de penetração (Pentest)</strong> — avaliações de segurança autorizadas</li>
        <li><strong>Forense digital</strong> — análise de evidências digitais</li>
        <li><strong>Engenharia reversa</strong> — análise de malware e software</li>
        <li><strong>Pesquisa de vulnerabilidades</strong> — descoberta de novas falhas</li>
        <li><strong>Red Team</strong> — simulação de ataques reais</li>
        <li><strong>CTF (Capture The Flag)</strong> — competições de hacking ético</li>
      </ul>

      <AlertBox type="warning" title="Kali Linux NÃO é para uso diário">
        O Kali Linux roda por padrão como root e não é otimizado para uso cotidiano. Use-o em um
        ambiente dedicado (VM, dual boot ou live boot) e apenas para fins profissionais e
        educacionais.
      </AlertBox>

      <h2>Variantes oficiais do Kali</h2>
      <CommandTable
        title="Sabores mantidos pela Offensive Security"
        variations={[
          {
            cmd: "Kali Linux (default)",
            desc: "ISO instalável padrão, XFCE como DE.",
            output: "Mais usado. ~3.4 GB. Pentest geral.",
          },
          {
            cmd: "Kali Light",
            desc: "ISO mínima sem ferramentas pré-instaladas.",
            output: "~1.1 GB. Você instala só o que precisa.",
          },
          {
            cmd: "Kali Everything",
            desc: "ISO com TODAS as ferramentas dos metapacotes.",
            output: "~12 GB. Para uso offline em campo.",
          },
          {
            cmd: "Kali Live",
            desc: "Boota direto do USB, sem instalar.",
            output: "Persistência opcional via partição encrypted.",
          },
          {
            cmd: "Kali Purple",
            desc: "Variante Blue Team (defensiva).",
            output: "100+ ferramentas SOC/SIEM/IR. Lançado 2023.",
          },
          {
            cmd: "Kali NetHunter",
            desc: "Versão para Android (rooted ou não).",
            output: "Pentest de campo via celular. USB HID, Wi-Fi inj.",
          },
          {
            cmd: "Kali ARM",
            desc: "Imagens para Raspberry Pi, Pinebook, etc.",
            output: "Drop-box pentest portátil.",
          },
          {
            cmd: "Kali WSL",
            desc: "Roda dentro do Windows via WSL2 + Win-KeX.",
            output: "GUI Kali sobre Windows sem dual boot.",
          },
        ]}
      />

      <h2>Kali vs. outras distros de segurança</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">
                Distro
              </th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">
                Base
              </th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">
                Foco
              </th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">
                Público
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Kali Linux", "Debian", "Pentest / Ofensivo", "Profissionais"],
              ["Parrot OS", "Debian", "Pentest / Privacidade", "Iniciantes e Profis"],
              ["BlackArch", "Arch", "Pentest avançado", "Avançados"],
              ["Tails", "Debian", "Privacidade / Anonimato", "Jornalistas / Ativistas"],
              ["DEFT", "Ubuntu", "Forense Digital", "Investigadores"],
              ["CAINE", "Ubuntu", "Forense Digital", "Peritos / Polícia"],
              ["Pentoo", "Gentoo", "Pentest hardcore", "Power users Gentoo"],
            ].map(([distro, base, foco, publico], i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-card" : ""}>
                <td className="px-4 py-2 font-mono text-primary border border-border">{distro}</td>
                <td className="px-4 py-2 text-muted-foreground border border-border">{base}</td>
                <td className="px-4 py-2 text-muted-foreground border border-border">{foco}</td>
                <td className="px-4 py-2 text-muted-foreground border border-border">{publico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Identificando a versão instalada</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "arquivo padrão do systemd com info da distro",
            cmd: "cat /etc/os-release",
            out: `PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2025.1"
VERSION="2025.1"
VERSION_CODENAME=kali-rolling
ID=kali
ID_LIKE=debian
HOME_URL="https://www.kali.org/"
SUPPORT_URL="https://forums.kali.org/"
BUG_REPORT_URL="https://bugs.kali.org/"
ANSI_COLOR="1;31"`,
            outType: "info",
          },
          {
            comment: "padrão LSB — funciona em quase toda distro",
            cmd: "lsb_release -a",
            out: `No LSB modules are available.
Distributor ID: Kali
Description:    Kali GNU/Linux Rolling
Release:        2025.1
Codename:       kali-rolling`,
            outType: "success",
          },
          {
            comment: "kernel + arquitetura + hostname",
            cmd: "uname -a",
            out: `Linux kali 6.11.0-kali4-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.11.5-1kali1 (2025-01-08) x86_64 GNU/Linux`,
            outType: "default",
          },
          {
            comment: "só kernel",
            cmd: "uname -r",
            out: "6.11.0-kali4-amd64",
            outType: "muted",
          },
          {
            comment: "ferramenta debian para listar info de distros",
            cmd: "distro-info --all 2>/dev/null | head -5 || echo 'distro-info não instalado'",
            out: `warty
hoary
breezy
dapper
edgy`,
            outType: "muted",
          },
        ]}
      />

      <h2>Verificando o repositório e a fonte oficial</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "arquivo de fontes APT — confirma se é Kali real",
            cmd: "cat /etc/apt/sources.list",
            out: `# See https://www.kali.org/docs/general-use/kali-linux-sources-list-repositories/
deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware

# Additional line for source packages
# deb-src http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware`,
            outType: "info",
          },
          {
            comment: "qual mirror está respondendo",
            cmd: "curl -sI http://http.kali.org/kali/dists/kali-rolling/Release | head -3",
            out: `HTTP/1.1 200 OK
Server: nginx
Date: Sat, 08 Mar 2025 03:14:21 GMT`,
            outType: "default",
          },
          {
            comment: "chave pública do repositório (verificação de integridade)",
            cmd: "apt-key list 2>/dev/null | grep -A1 Kali || cat /etc/apt/trusted.gpg.d/kali-archive-keyring.gpg | gpg --list-packets 2>/dev/null | head -4",
            out: `pub   rsa4096 2024-06-18 [SC] [expires: 2027-06-17]
      ED444FF07D8D0BF6 Kali Linux Repository <devel@kali.org>`,
            outType: "success",
          },
          {
            comment: "quantidade de pacotes 'kali' instalados",
            cmd: "dpkg -l | grep -c '^ii  kali-'",
            out: "47",
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="info" title="Filosofia Open Source">
        O Kali Linux é completamente gratuito e open source. Todo o código-fonte está disponível no
        GitLab da Offensive Security (gitlab.com/kalilinux). Você também pode criar sua própria
        versão customizada com o <code>kali-archive-keyring</code> e o repo Debian + overlay Kali.
      </AlertBox>

      <h2>Certificações da Offensive Security</h2>
      <p>
        A Offensive Security, criadora do Kali, oferece certificações reconhecidas mundialmente:
      </p>
      <ul>
        <li><strong>OSCP</strong> (Offensive Security Certified Professional) — a mais respeitada em pentest</li>
        <li><strong>OSWP</strong> (Offensive Security Wireless Professional)</li>
        <li><strong>OSEP</strong> (Offensive Security Experienced Penetration Tester)</li>
        <li><strong>OSED</strong> (Offensive Security Exploit Developer)</li>
        <li><strong>OSWE</strong> (Offensive Security Web Expert)</li>
        <li><strong>OSCE³</strong> (Certified Expert — combinação OSEP + OSED + OSWE)</li>
      </ul>

      <PracticeBox
        title="Identifique sua versão do Kali"
        goal="Confirmar que você está rodando Kali Rolling, descobrir kernel, mirror e validar a chave do repositório."
        steps={[
          "Rode cat /etc/os-release e copie VERSION_ID.",
          "Rode uname -r para o kernel.",
          "Verifique sources.list — deve apontar para http.kali.org.",
          "Liste os metapacotes Kali instalados.",
          "Compare com a release atual em www.kali.org/releases/.",
        ]}
        command={`echo "=== Distro ==="; grep PRETTY_NAME /etc/os-release
echo "=== Kernel ==="; uname -r
echo "=== Mirror ==="; grep -v '^#' /etc/apt/sources.list | grep -v '^$'
echo "=== Metapacotes ==="; dpkg -l | awk '/^ii  kali-/ {print $2}' | head -10`}
        expected={`=== Distro ===
PRETTY_NAME="Kali GNU/Linux Rolling"
=== Kernel ===
6.11.0-kali4-amd64
=== Mirror ===
deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware
=== Metapacotes ===
kali-archive-keyring
kali-defaults
kali-desktop-xfce
kali-linux-core
kali-linux-default
kali-linux-headless
kali-menu
kali-themes
kali-tweaks
kali-wallpapers-2024`}
        verify="Se PRETTY_NAME contém 'Kali' e o sources.list aponta para http.kali.org, é Kali oficial. Caso contrário, pode ser um derivado ou imagem comprometida — re-baixe do site oficial."
      />

      <AlertBox type="success" title="TL;DR">
        Kali = Debian + 600 ferramentas + filosofia ofensiva. Nasceu em 2013 como sucessor do
        BackTrack, virou rolling em 2016, ganhou variante defensiva (Purple) em 2023. Use em VM,
        live USB ou WSL — nunca como SO principal.
      </AlertBox>
    </PageContainer>
  );
}
