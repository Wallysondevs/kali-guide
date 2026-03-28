import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function John() {
  return (
    <PageContainer
      title="John the Ripper"
      subtitle="O clássico crackeador de hashes de senhas para uso offline."
      difficulty="intermediario"
      timeToRead="8 min"
    >
      <h2>Introdução</h2>
      <p>
        O <strong>John the Ripper</strong> (JtR) é um dos crackeadores de senhas mais conhecidos. 
        Funciona <strong>offline</strong>, aplicando ataques de dicionário, brute force e regras em hashes. 
        O Kali inclui o <em>John the Ripper Jumbo</em>, que suporta mais de 400 tipos de hash.
      </p>

      <h2>Quebrando senhas Linux</h2>
      <CodeBlock language="bash" code={`# Combinar /etc/passwd + /etc/shadow
sudo unshadow /etc/passwd /etc/shadow > hashes.txt

# Quebrar com rockyou
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt

# Ver senhas já quebradas
john hashes.txt --show

# Quebrar usando regras (mais variações)
john hashes.txt --wordlist=rockyou.txt --rules=best64
john hashes.txt --wordlist=rockyou.txt --rules=jumbo`} />

      <h2>Identificar e especificar formato</h2>
      <CodeBlock language="bash" code={`# John detecta automaticamente, ou especifique:
john hashes.txt --format=md5crypt         # Linux MD5
john hashes.txt --format=sha512crypt      # Linux SHA-512
john hashes.txt --format=bcrypt           # bcrypt
john hashes.txt --format=NT              # Windows NTLM
john hashes.txt --format=LM              # Windows LM
john hashes.txt --format=sha256          # SHA-256
john hashes.txt --format=raw-md5         # MD5 puro
john hashes.txt --format=nt              # Windows Net NTLM

# Listar todos os formatos suportados
john --list=formats
john --list=formats | grep -i md5`} />

      <h2>Extratores de hash (ferramentas *2john)</h2>
      <p>
        O John inclui utilitários para extrair hashes de vários tipos de arquivo:
      </p>
      <CodeBlock language="bash" code={`# ZIP protegido por senha
zip2john arquivo.zip > zip_hash.txt
john zip_hash.txt --wordlist=rockyou.txt

# RAR protegido
rar2john arquivo.rar > rar_hash.txt
john rar_hash.txt --wordlist=rockyou.txt

# PDF protegido
pdf2john arquivo.pdf > pdf_hash.txt
john pdf_hash.txt --wordlist=rockyou.txt

# SSH key com passphrase
ssh2john id_rsa > ssh_hash.txt
john ssh_hash.txt --wordlist=rockyou.txt

# KeePass (banco de senhas)
keepass2john banco.kdbx > keepass_hash.txt
john keepass_hash.txt --wordlist=rockyou.txt

# TrueCrypt/VeraCrypt
tcpdump2john volume.tc > tc_hash.txt

# Microsoft Word/Excel
office2john documento.docx > office_hash.txt
john office_hash.txt --wordlist=rockyou.txt`} />

      <h2>Modos de ataque</h2>
      <CodeBlock language="bash" code={`# 1. Wordlist (dicionário)
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt

# 2. Wordlist + regras (mutações)
john hashes.txt --wordlist=rockyou.txt --rules

# 3. Incremental (brute force total — muito lento)
john hashes.txt --incremental

# 4. Incremental apenas dígitos
john hashes.txt --incremental=digits

# 5. Incremental alfanumérico
john hashes.txt --incremental=alnum

# 6. Modo "single" (usa info do arquivo passwd)
john hashes.txt --single

# Sessão nomeada (pausar e retomar)
john hashes.txt --session=crack1
john --restore=crack1`} />

      <h2>Trabalhando com hashes NTLM (Windows)</h2>
      <CodeBlock language="bash" code={`# Hashes NTLM do Windows (ex: obtidos via Mimikatz ou secretsdump)
# Formato típico: usuario:RID:LMHASH:NTHASH:::
# admin:1001:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::

# Extrair só os hashes NT para um arquivo
cat ntlm_hashes.txt | awk -F: '{print $4}' > nt_only.txt

# Quebrar NTLM
john ntlm_hashes.txt --format=NT --wordlist=rockyou.txt

# Com hashcat (GPU — muito mais rápido):
hashcat -m 1000 ntlm_hashes.txt rockyou.txt`} />

      <AlertBox type="success" title="John vs Hashcat">
        O John é mais simples e ótimo para hashes de arquivos (zip, ssh, pdf). 
        Para hashes de senhas em volume (NTLM, bcrypt), o <strong>Hashcat com GPU</strong> é muito mais rápido.
      </AlertBox>
    </PageContainer>
  );
}
