import { PageContainer } from "@/components/layout/PageContainer";

const categories = [
  {
    title: "🎓 Plataformas de Aprendizado",
    items: [
      { name: "Hack The Box", url: "hackthebox.com", desc: "Máquinas e labs de pentest — padrão da indústria" },
      { name: "TryHackMe", url: "tryhackme.com", desc: "Ideal para iniciantes com paths guiados" },
      { name: "PortSwigger Web Security Academy", url: "portswigger.net/web-security", desc: "Labs gratuitos de pentest web" },
      { name: "OverTheWire", url: "overthewire.org/wargames", desc: "Wargames via SSH — excelente para Linux" },
      { name: "VulnHub", url: "vulnhub.com", desc: "VMs vulneráveis para praticar offline" },
      { name: "PicoCTF", url: "picoctf.org", desc: "CTF educacional para iniciantes" },
    ]
  },
  {
    title: "📚 Documentação Oficial",
    items: [
      { name: "Kali Linux Docs", url: "kali.org/docs", desc: "Documentação oficial do Kali Linux" },
      { name: "Offensive Security Blog", url: "offsec.com/blog", desc: "Artigos técnicos da criadora do Kali" },
      { name: "OWASP Testing Guide", url: "owasp.org/www-project-web-security-testing-guide", desc: "Guia completo de pentest web" },
      { name: "Metasploit Unleashed", url: "metasploit.help.rapid7.com", desc: "Curso gratuito de Metasploit" },
      { name: "Nmap Reference Guide", url: "nmap.org/book/man.html", desc: "Referência completa do Nmap" },
      { name: "Hashcat Wiki", url: "hashcat.net/wiki", desc: "Documentação do Hashcat com modos e regras" },
    ]
  },
  {
    title: "🔧 Ferramentas Online",
    items: [
      { name: "CyberChef", url: "gchq.github.io/CyberChef", desc: "Encoder/decoder universal — essencial em CTF" },
      { name: "Shodan", url: "shodan.io", desc: "Motor de busca para dispositivos na internet" },
      { name: "Have I Been Pwned", url: "haveibeenpwned.com", desc: "Verificar e-mails em vazamentos" },
      { name: "VirusTotal", url: "virustotal.com", desc: "Análise de arquivos e URLs suspeitos" },
      { name: "GTFOBins", url: "gtfobins.github.io", desc: "Escalação de privilégio com binários Unix" },
      { name: "LOLBAS", url: "lolbas-project.github.io", desc: "Equivalente ao GTFOBins para Windows" },
    ]
  },
  {
    title: "📖 Recursos de Estudo",
    items: [
      { name: "PayloadsAllTheThings", url: "github.com/swisskyrepo/PayloadsAllTheThings", desc: "Repositório de payloads para todas as vulnerabilidades" },
      { name: "HackTricks", url: "book.hacktricks.xyz", desc: "O maior gitbook de técnicas de hacking" },
      { name: "SecLists", url: "github.com/danielmiessler/SecLists", desc: "Coleção de wordlists para pentest" },
      { name: "0xdf Hacks Stuff", url: "0xdf.gitlab.io", desc: "Writeups detalhados de HackTheBox" },
      { name: "Ippsec YouTube", url: "youtube.com/@ippsec", desc: "Walkthroughs de HTB com explicações profundas" },
      { name: "IppSec Search", url: "ippsec.rocks", desc: "Buscar por técnica nos vídeos do IppSec" },
    ]
  },
  {
    title: "🏅 Certificações",
    items: [
      { name: "OSCP (OffSec)", url: "offsec.com/courses/pen-200", desc: "A mais respeitada em pentest. Prova prática de 24h" },
      { name: "CEH (EC-Council)", url: "eccouncil.org/programs/certified-ethical-hacker-ceh", desc: "Certified Ethical Hacker — amplamente reconhecida" },
      { name: "eJPT (INE)", url: "ine.com/learning/certifications/internal/elearnsecurity-junior-penetration-tester", desc: "Junior Pentest — ótima para começar" },
      { name: "PNPT (TCM Security)", url: "certifications.tcm-sec.com/pnpt", desc: "Practical Network Pentest — exame realista" },
      { name: "CompTIA Security+", url: "comptia.org/certifications/security", desc: "Base de segurança — bem reconhecida no mercado" },
      { name: "CompTIA PenTest+", url: "comptia.org/certifications/pentest", desc: "Pentest pela CompTIA — nível intermediário" },
    ]
  },
  {
    title: "🇧🇷 Comunidade Brasileira",
    items: [
      { name: "GTS — Grupo de Trabalho em Segurança", url: "gts.org.br", desc: "Evento técnico de segurança no Brasil" },
      { name: "H2HC", url: "h2hc.com.br", desc: "Hackers to Hackers Conference — maior evento BR" },
      { name: "DEFCON Groups Brasil", url: "defcon.org/html/defcon-groups", desc: "Grupos locais do DEFCON no Brasil" },
      { name: "Roadsec", url: "roadsec.com.br", desc: "Evento itinerante de segurança" },
    ]
  }
];

export default function Referencias() {
  return (
    <PageContainer
      title="Referências e Recursos"
      subtitle="Tudo que você precisa para continuar aprendendo — plataformas, ferramentas, certificações e comunidade."
      difficulty="iniciante"
      timeToRead="3 min"
    >
      <div className="space-y-10">
        {categories.map((cat, ci) => (
          <div key={ci}>
            <h2>{cat.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.items.map((item, ii) => (
                <a
                  key={ii}
                  href={`https://${item.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200 no-underline block"
                >
                  <div className="font-bold text-sm text-primary group-hover:underline">{item.name}</div>
                  <div className="text-xs text-muted-foreground/70 font-mono mt-0.5">{item.url}</div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center">
        <h2 className="mt-0 border-0 pb-0 text-xl">Continue aprendendo! 🚀</h2>
        <p className="text-muted-foreground">
          O campo de segurança evolui constantemente. Pratique diariamente no HTB ou THM, 
          participe de CTFs e contribua com a comunidade. O melhor hacker é aquele que nunca para de aprender.
        </p>
      </div>
    </PageContainer>
  );
}
