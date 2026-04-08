import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Seclists() {
  return (
    <PageContainer
      title="SecLists & Wordlists"
      subtitle="Domine wordlists e payloads: SecLists, rockyou, wordlists customizadas e geração de listas para cada situação de pentest."
      difficulty="iniciante"
      timeToRead="15 min"
    >
      <h2>O que são Wordlists?</h2>
      <p>
        Wordlists são listas de palavras usadas para brute force, fuzzing, enumeração de diretórios,
        quebra de senhas e discovery. A <strong>SecLists</strong> é a coleção mais completa e usada
        em pentests profissionais.
      </p>

      <h2>SecLists — A Coleção Definitiva</h2>
      <CodeBlock
        title="Instalar e navegar SecLists"
        code={`# Instalar SecLists no Kali
sudo apt install seclists

# Localização
ls /usr/share/seclists/

# Estrutura:
# Discovery/         — diretórios, subdomínios, APIs
# Fuzzing/           — payloads de fuzzing
# Passwords/         — wordlists de senhas
# Usernames/         — listas de usernames
# Payloads/          — payloads de injeção
# Pattern-Matching/  — expressões regulares
# Miscellaneous/     — diversos`}
      />

      <h3>Wordlists mais Usadas</h3>
      <CodeBlock
        title="As wordlists essenciais"
        code={`# === SENHAS ===
# rockyou.txt — 14 milhões de senhas reais (a mais famosa)
/usr/share/wordlists/rockyou.txt
# Se compactada: sudo gunzip /usr/share/wordlists/rockyou.txt.gz

# Top senhas mais comuns
/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt
/usr/share/seclists/Passwords/Common-Credentials/best1050.txt

# Senhas por padrão
/usr/share/seclists/Passwords/Default-Credentials/default-passwords.csv

# === DIRETÓRIOS WEB ===
# Pequena (rápida)
/usr/share/seclists/Discovery/Web-Content/common.txt
# Média (boa cobertura)
/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
# Grande (completa)
/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-big.txt
# Raft (alternativa popular)
/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt

# === SUBDOMÍNIOS ===
/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
/usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt

# === APIs ===
/usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt

# === USERNAMES ===
/usr/share/seclists/Usernames/top-usernames-shortlist.txt
/usr/share/seclists/Usernames/Names/names.txt

# === PAYLOADS ===
# XSS
/usr/share/seclists/Fuzzing/XSS/XSS-BruteLogic.txt
# SQLi
/usr/share/seclists/Fuzzing/SQLi/Generic-SQLi.txt
# LFI
/usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt`}
      />

      <h2>Criar Wordlists Customizadas</h2>
      <CodeBlock
        title="Gerar wordlists sob medida"
        code={`# CeWL — gerar wordlist a partir de website
cewl https://alvo.com -d 3 -m 5 -w custom-words.txt
# -d 3: profundidade de crawl
# -m 5: tamanho mínimo da palavra

# Incluir emails
cewl https://alvo.com -e -w words.txt --email_file emails.txt

# Crunch — gerar por padrão
# Gerar todas combinações de 8 chars com letras minúsculas
crunch 8 8 abcdefghijklmnopqrstuvwxyz -o wordlist.txt

# Gerar com padrão: empresa + 4 dígitos
crunch 11 11 -t empresa%%%% -o empresa-wordlist.txt
# @=minúsculas ,=maiúsculas %=números ^=especiais

# Combinar palavras
# empresa2024, Empresa2024!, empresa2024#
cat << 'EOF' > base.txt
empresa
Empresa
EMPRESA
EOF
hashcat --stdout -a 6 base.txt '?d?d?d?d' > combined.txt
# Ou manualmente com loops bash

# CUPP — gerar wordlist baseada em info pessoal
sudo apt install cupp
cupp -i
# Responder perguntas sobre o alvo (nome, aniversário, pet, etc.)
# Gera wordlist personalizada`}
      />

      <h2>Uso Prático com Ferramentas</h2>
      <CodeBlock
        title="Exemplos de uso com ferramentas do Kali"
        code={`# Gobuster — diretórios
gobuster dir -u https://alvo.com -w /usr/share/seclists/Discovery/Web-Content/common.txt

# ffuf — fuzzing rápido
ffuf -u https://alvo.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt

# Hydra — brute force de login
hydra -l admin -P /usr/share/wordlists/rockyou.txt alvo.com http-post-form "/login:user=^USER^&pass=^PASS^:Invalid"

# John — quebra de hash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# Hashcat — quebra de hash (GPU)
hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt

# Nmap — brute force
nmap --script=http-brute -p 80 alvo.com

# Subdomínios
subfinder -d alvo.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt`}
      />

      <h2>Dicas para Wordlists</h2>
      <CodeBlock
        title="Boas práticas"
        code={`# 1. Comece pequeno, aumente se necessário
# common.txt → medium → big → custom

# 2. Combine listas
cat list1.txt list2.txt | sort -u > combined.txt

# 3. Remover duplicatas
sort wordlist.txt | uniq > wordlist-unique.txt

# 4. Filtrar por tamanho
awk 'length >= 6 && length <= 12' wordlist.txt > filtered.txt

# 5. Adicionar regras (hashcat)
# Primeira letra maiúscula + número no final
hashcat --stdout wordlist.txt -r /usr/share/hashcat/rules/best64.rule > mutated.txt

# 6. Wordlists por idioma/região
# Para alvos brasileiros:
# - Nomes brasileiros comuns
# - Senhas em português (amor, senha, brasil, etc.)
# - Padrões: nome+ano, time+numero`}
      />
    </PageContainer>
  );
}
