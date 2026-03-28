import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function CTF() {
  return (
    <PageContainer
      title="CTF — Capture The Flag"
      subtitle="Guia completo para iniciantes e intermediários em competições de hacking ético."
      difficulty="intermediario"
      timeToRead="12 min"
    >
      <h2>O que é CTF?</h2>
      <p>
        <strong>CTF (Capture The Flag)</strong> são competições de segurança onde participantes 
        resolvem desafios para encontrar "flags" — strings secretas como <code>FLAG{exemplo_aqui}</code>. 
        É a melhor forma de aprender hacking de forma legal e gamificada.
      </p>

      <h2>Plataformas de prática</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { name: "Hack The Box (HTB)", url: "hackthebox.com", level: "★★★★", desc: "Máquinas reais para hackear. Padrão da indústria." },
          { name: "TryHackMe (THM)", url: "tryhackme.com", level: "★★", desc: "Ideal para iniciantes. Guiado e com teoria." },
          { name: "PicoCTF", url: "picoctf.org", level: "★★", desc: "Para estudantes. Desafios bem explicados." },
          { name: "CTFtime", url: "ctftime.org", level: "★★★", desc: "Calendário de CTFs globais e rankings." },
          { name: "PortSwigger Web Academy", url: "portswigger.net/web-security", level: "★★★", desc: "Labs de pentest web gratuitos." },
          { name: "OverTheWire", url: "overthewire.org", level: "★★", desc: "Wargames via SSH. Ótimo para Linux." },
          { name: "VulnHub", url: "vulnhub.com", level: "★★★", desc: "VMs para baixar e hackear offline." },
          { name: "Root-Me", url: "root-me.org", level: "★★★", desc: "Plataforma francesa com muitos desafios." },
        ].map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="font-bold text-sm text-foreground">{p.name}</div>
              <span className="text-xs text-primary">{p.level}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{p.url}</div>
            <p className="text-xs text-muted-foreground mt-2">{p.desc}</p>
          </div>
        ))}
      </div>

      <h2>Categorias de desafios CTF</h2>
      <CodeBlock language="bash" code={`# Web — Vulnerabilidades em aplicações web
# SQLi, XSS, SSRF, IDOR, JWT, RCE via web

# Crypto — Criptografia
# RSA, AES, Caesar, Vigenère, hash exploitation

# Pwn/Binary — Exploração de binários
# Buffer Overflow, ROP chains, format strings

# Reversing — Engenharia reversa
# Análise de executáveis (ELF, PE), decompilação

# Forensics — Análise forense
# PCAP, imagens de disco, esteganografia

# OSINT — Inteligência de fontes abertas
# Geolocalização de imagens, metadados, redes sociais

# Misc — Miscelânea
# Steganografia, codificações, lógica`} />

      <h2>Ferramentas essenciais por categoria</h2>
      <h3>Crypto</h3>
      <CodeBlock language="bash" code={`# Decodificação rápida
echo "aGVsbG8=" | base64 -d                  # Base64
echo "68656c6c6f" | xxd -r -p               # Hex

# CyberChef (online): gchq.github.io/CyberChef

# RSA (factorization)
sudo apt install -y rsatool
# factordb.com — banco de fatorizações conhecidas

# Análise de frequência (Caesar, substituição)
python3 -c "
texto = 'khoor'
for shift in range(26):
    dec = ''.join(chr((ord(c)-97-shift)%26+97) if c.isalpha() else c for c in texto)
    print(f'{shift:2d}: {dec}')
"`} />

      <h3>Esteganografia</h3>
      <CodeBlock language="bash" code={`# steghide — esconde dados em imagens JPEG
sudo apt install -y steghide
steghide extract -sf imagem.jpg                # extrair (pede senha)
steghide info imagem.jpg                       # informações

# stegseek — brute force de steghide
sudo apt install -y stegseek
stegseek imagem.jpg /usr/share/wordlists/rockyou.txt

# strings — texto visível em arquivos
strings imagem.png | grep -i "flag\|ctf\|{" 

# binwalk — arquivos escondidos
binwalk imagem.png
binwalk -e imagem.png                          # extrair

# exiftool — metadados
sudo apt install -y exiftool
exiftool imagem.jpg                            # ver metadados
exiftool -all:all imagem.jpg                   # completo

# Zsteg (imagens PNG/BMP)
gem install zsteg
zsteg imagem.png`} />

      <h3>Forensics (PCAP)</h3>
      <CodeBlock language="bash" code={`# Wireshark para análise visual
wireshark captura.pcap

# tshark para scripts
tshark -r captura.pcap -Y "http" -T fields -e http.request.full_uri
tshark -r captura.pcap --export-objects "http,/tmp/objetos"

# Strings em pcap
strings captura.pcap | grep -i "flag\|ctf"

# Follow TCP stream
tshark -r captura.pcap -q -z follow,tcp,raw,0`} />

      <h2>Metodologia para máquinas HTB/THM</h2>
      <CodeBlock language="bash" code={`# 1. Reconhecimento inicial
nmap -sC -sV -p- -T4 IP_ALVO -oA scan

# 2. Enumerar serviços web encontrados
gobuster dir -u http://IP_ALVO -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt
nikto -h http://IP_ALVO

# 3. Verificar vulnerabilidades
searchsploit "nome do serviço versão"        # exploits conhecidos
google: "CVE-XXXX-XXXX exploit github"

# 4. Exploração inicial (foothold)
# Burp Suite para web, Metasploit para outros

# 5. Escalação de privilégios
# Linux:
./linpeas.sh
sudo -l
find / -perm -4000 2>/dev/null             # SUID
cat /etc/crontab                           # cron
ps aux                                      # processos
# Windows:
.\winpeas.exe
whoami /priv`} />

      <h2>Dicas de CTF</h2>
      <div className="space-y-2 my-6">
        {[
          "Leia o desafio com atenção — a dica geralmente está no nome ou descrição",
          "Em web, inspecione o código-fonte (Ctrl+U), cookies e headers",
          "Tente 'strings' em qualquer arquivo binário antes de ferramentas complexas",
          "Google é seu amigo — pesquise o erro exato ou a tecnologia",
          "Leia writeups de CTFs anteriores para aprender técnicas novas",
          "Em criptografia, identifique o algoritmo antes de tentar quebrar",
          "Keep notes detalhadas — você vai esquecer o que já tentou",
          "Colabore com a equipe — CTF em time é muito mais eficiente",
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
            <span className="text-muted-foreground">{tip}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
