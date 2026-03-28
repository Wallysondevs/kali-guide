import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Historia() {
  return (
    <PageContainer
      title="O que é Kali Linux"
      subtitle="A história, origem e propósito do sistema operacional mais usado em segurança ofensiva."
      difficulty="iniciante"
      timeToRead="6 min"
    >
      <h2>Origens: de BackTrack ao Kali</h2>
      <p>
        O Kali Linux é uma distribuição Linux baseada em Debian, desenvolvida e mantida pela <strong>Offensive Security</strong>. 
        Seu predecessor direto foi o <strong>BackTrack Linux</strong>, que existiu de 2006 a 2013 como referência em segurança. 
        Em março de 2013, a Offensive Security lançou o <strong>Kali Linux 1.0</strong>, uma reconstrução completa do BackTrack 
        com uma base mais sólida, integração com Debian e uma filosofia de desenvolvimento aberta.
      </p>

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
            <div className="min-w-[60px] text-primary font-mono text-sm font-bold pt-0.5">{item.year}</div>
            <div className="flex-1 text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">{item.event}</div>
          </div>
        ))}
      </div>

      <h2>Para que serve o Kali Linux?</h2>
      <p>
        O Kali Linux é projetado especificamente para <strong>profissionais de segurança</strong>. Ele vem com mais de 
        600 ferramentas pré-instaladas para:
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
        O Kali Linux roda por padrão como root e não é otimizado para uso cotidiano. 
        Use-o em um ambiente dedicado (VM, dual boot ou live boot) e apenas para fins profissionais e educacionais.
      </AlertBox>

      <h2>Kali vs. outras distros de segurança</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">Distro</th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">Base</th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">Foco</th>
              <th className="text-left px-4 py-2 font-semibold text-foreground border border-border">Público</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Kali Linux", "Debian", "Pentest / Ofensivo", "Profissionais"],
              ["Parrot OS", "Debian", "Pentest / Privacidade", "Iniciantes e Profis"],
              ["BlackArch", "Arch", "Pentest avançado", "Avançados"],
              ["Tails", "Debian", "Privacidade / Anonimato", "Jornalistas / Ativistas"],
              ["DEFT", "Ubuntu", "Forense Digital", "Investigadores"],
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

      <h2>Verificando a versão instalada</h2>
      <CodeBlock language="bash" code={`# Verificar versão do Kali Linux
cat /etc/os-release

# Verificar versão do kernel
uname -r

# Informações completas do sistema
uname -a

# Versão do Kali
lsb_release -a`} />

      <AlertBox type="info" title="Filosofia Open Source">
        O Kali Linux é completamente gratuito e open source. Todo o código-fonte está disponível no 
        GitLab da Offensive Security. Você também pode criar sua própria versão customizada do Kali.
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
      </ul>
    </PageContainer>
  );
}
