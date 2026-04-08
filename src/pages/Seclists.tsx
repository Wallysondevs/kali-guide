import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Seclists() {
  return (
    <PageContainer
      title="SecLists — Wordlists para Pentest"
      subtitle="Guia completo do repositório SecLists. Conheça cada diretório, as wordlists mais importantes, quando usar cada uma, e como combinar com ferramentas como ffuf, Gobuster, Hydra e Burp."
      difficulty="iniciante"
      timeToRead="25 min"
    >
      <h2>O que é SecLists?</h2>
      <p>
        <strong>SecLists</strong> é a maior coleção de wordlists para segurança ofensiva, mantida por
        Daniel Miessler. Contém listas para: fuzzing de diretórios, senhas, usernames, subdomínios,
        payloads de injeção, padrões de APIs, e muito mais. É a wordlist padrão da indústria e
        já vem instalada no Kali Linux.
      </p>

      <h2>Estrutura de Diretórios — Guia Completo</h2>
      <CodeBlock
        title="Cada diretório do SecLists explicado em detalhe"
        code={`# ═══════════════════════════════════════════════════
# LOCALIZAÇÃO NO KALI
# ═══════════════════════════════════════════════════
ls /usr/share/seclists/
# Discovery/        — Descoberta de conteúdo web
# Fuzzing/          — Payloads de fuzzing e injeção
# IOCs/             — Indicadores de Compromisso
# Miscellaneous/    — Listas diversas
# Passwords/        — Senhas e credenciais
# Pattern-Matching/ — Regras de regex
# Payloads/         — Payloads de ataque
# Usernames/        — Listas de nomes de usuário

# Se não estiver instalado:
sudo apt install seclists

# ═══════════════════════════════════════════════════
# 1. Discovery/ — DESCOBERTA DE CONTEÚDO
# ═══════════════════════════════════════════════════
ls /usr/share/seclists/Discovery/
# DNS/            — Subdomínios
# Infrastructure/ — Infraestrutura
# SNMP/           — SNMP community strings
# Web-Content/    — Diretórios e arquivos web

# ─── DNS (subdomínios) ───────────────────────────
# subdomains-top1million-5000.txt  (5000 subdomínios mais comuns)
# subdomains-top1million-20000.txt (20.000 subdomínios)
# subdomains-top1million-110000.txt (110.000 — mais completa)
# bitquark-subdomains-top100000.txt (alternativa de 100K)
# namelist.txt (lista de nomes — útil para subdomínios)
#
# QUANDO USAR:
# → Enumeração de subdomínios com ferramentas como:
ffuf -u "http://FUZZ.empresa.com" \\
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \\
  -mc 200
# → Começar com 5000, se precisar mais usar 20K ou 110K

# ─── Web-Content (diretórios e arquivos) ─────────
# directory-list-2.3-small.txt    (~87K palavras — rápido)
# directory-list-2.3-medium.txt   (~220K palavras — equilibrado)
# directory-list-2.3-big.txt      (~1.2M palavras — completo)
# common.txt                      (~4.7K — o mais rápido)
# raft-large-directories.txt      (~62K — diretórios específicos)
# raft-large-files.txt            (~37K — arquivos específicos)
# raft-large-words.txt            (~120K — palavras genéricas)
#
# QUANDO USAR CADA UMA:
# → common.txt = scan inicial rápido (~30 seg)
# → directory-list-2.3-medium.txt = padrão para a maioria
# → big.txt = quando medium não encontrou o que procura

# Exemplo com Gobuster:
gobuster dir -u http://alvo.com \\
  -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt \\
  -x php,txt,html \\
  -t 50
# -x = extensões para testar
# -t = threads (velocidade)

# ─── Web-Content/api/ (endpoints de API) ─────────
# api-endpoints.txt         — endpoints REST comuns
# objects.txt               — nomes de objetos
# actions.txt               — ações (create, delete, etc.)
# common-api-endpoints-mazen160.txt — coletânea expandida
# swagger.txt               — paths de documentação Swagger

# ═══════════════════════════════════════════════════
# 2. Passwords/ — LISTAS DE SENHAS
# ═══════════════════════════════════════════════════
ls /usr/share/seclists/Passwords/
# Common-Credentials/     — Credenciais comuns
# Default-Credentials/    — Senhas padrão de dispositivos
# Leaked-Databases/       — Senhas de vazamentos reais
# Permutations/           — Variações de senhas
# Software/               — Senhas default de software
# WiFi-WPA/               — Senhas comuns de WiFi
# darkweb2017-top10000.txt — Top 10K de vazamentos dark web
# xato-net-10-million-passwords.txt — 10M senhas reais

# ─── Mais importantes ────────────────────────────
# rockyou.txt (NÃO está no SecLists, mas no Kali):
ls /usr/share/wordlists/rockyou.txt
# 14 MILHÕES de senhas reais do vazamento RockYou (2009)
# A wordlist mais usada para cracking de senhas!
# ⚠️ Precisa descompactar: sudo gzip -d /usr/share/wordlists/rockyou.txt.gz

# darkweb2017-top10000.txt — top 10K senhas da dark web
# Tamanho ideal para spray de senhas (rápido mas eficaz)

# Common-Credentials/top-passwords-shortlist.txt — top ~100
# Ideal para: teste rápido de senhas mais comuns

# Default-Credentials/default-passwords.csv
# Formato: produto,username,password
# Ex: cisco,admin,admin | mysql,root,(vazio) | tomcat,admin,tomcat

# Uso com Hydra (bruteforce de login):
hydra -l admin -P /usr/share/seclists/Passwords/darkweb2017-top10000.txt \\
  ssh://192.168.1.100
# -l = username fixo
# -P = arquivo de senhas

# ═══════════════════════════════════════════════════
# 3. Fuzzing/ — PAYLOADS DE INJEÇÃO
# ═══════════════════════════════════════════════════
ls /usr/share/seclists/Fuzzing/
# LFI/                 — Payloads para Local File Inclusion
# SQLi/                — Payloads para SQL Injection
# SSI/                 — Server Side Includes
# XSS/                 — Cross-Site Scripting
# command-injection-commix.txt — OS Command Injection
# special-chars.txt    — Caracteres especiais para fuzzing
# Unicode.txt          — Caracteres Unicode para bypass
# fuzz-Bo0oM.txt       — Lista genérica de fuzzing

# ─── LFI (Local File Inclusion) ──────────────────
# LFI-Jhaddix.txt — a lista mais completa de LFI
# Inclui variações com:
# ../../../etc/passwd
# ....//....//....//etc/passwd
# %2e%2e%2f%2e%2e%2fetc%2fpasswd
# /etc/passwd%00     (null byte)
# E centenas de variações de path traversal

# Uso com ffuf:
ffuf -u "http://alvo.com/page?file=FUZZ" \\
  -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt \\
  -mc 200 -fs 0
# -fs 0 = filtrar respostas vazias

# ─── XSS ─────────────────────────────────────────
# xss-payload-list.txt — payloads XSS abrangentes
# Inclui: <script>alert(1)</script>, <img onerror=...>,
# <svg onload=...>, bypasses de WAF, encoding, etc.

# ─── SQLi ─────────────────────────────────────────
# Auth_Bypass.txt — payloads de bypass de login SQL
# Generic-BlindSQLi.fuzzdb.txt — blind SQLi payloads
# Generic-SQLi.txt — payloads genéricos

# ═══════════════════════════════════════════════════
# 4. Usernames/ — NOMES DE USUÁRIO
# ═══════════════════════════════════════════════════
# Names/names.txt — milhares de nomes próprios
# xato-net-10-million-usernames.txt — 10M usernames reais
# top-usernames-shortlist.txt — top ~20 (admin, root, user, etc.)
# cirt-default-usernames.txt — usernames padrão de dispositivos

# Uso para user enumeration:
ffuf -u "http://alvo.com/api/user/FUZZ" \\
  -w /usr/share/seclists/Usernames/top-usernames-shortlist.txt \\
  -mc 200`}
      />

      <h2>Wordlists Customizadas</h2>
      <CodeBlock
        title="Criar e otimizar wordlists para o alvo"
        code={`# ═══════════════════════════════════════════════════
# CEWL — Gerar wordlist a partir do site alvo
# ═══════════════════════════════════════════════════
cewl https://empresa.com -d 3 -m 5 -w custom-words.txt
# -d 3 = profundidade de crawling (3 níveis de links)
# -m 5 = tamanho mínimo da palavra (5 caracteres)
# -w = arquivo de saída
#
# CeWL visita o site e extrai TODAS as palavras.
# Ideal para: gerar lista baseada no vocabulário da empresa
# Ex: nomes de produtos, cidades, terminologia específica

# Com emails:
cewl https://empresa.com -d 3 -e --email_file emails.txt
# -e = extrair emails
# Útil para enumerar funcionários

# ═══════════════════════════════════════════════════
# CRUNCH — Gerar wordlists por padrão
# ═══════════════════════════════════════════════════
# Gerar todas combinações de 8 caracteres a-z:
crunch 8 8 abcdefghijklmnopqrstuvwxyz -o palavras.txt
# 8 8 = min e max tamanho
# ⚠️ Isso gera ~209 BILHÕES de combinações! Cuidado.

# Padrão mais útil (senhas tipo Empresa2024):
crunch 11 11 -t Empresa20%% -o senhas.txt
# -t = template
# %% = dois dígitos (00-99)
# Gera: Empresa2000 até Empresa2099

# Padrões:
# @ = letras minúsculas (a-z)
# , = letras maiúsculas (A-Z)
# % = números (0-9)
# ^ = símbolos (!@#$...)

# Gerar senhas tipo Nome+Ano+Símbolo:
crunch 12 12 -t ,@@@@@@20%%^ -o senhas.txt
# ,=maiúscula, @@@@@=minúsculas, 20%%=ano, ^=símbolo

# ═══════════════════════════════════════════════════
# COMBINAR E OTIMIZAR WORDLISTS
# ═══════════════════════════════════════════════════
# Juntar múltiplas listas:
cat lista1.txt lista2.txt lista3.txt | sort -u > combinada.txt
# sort -u = ordenar e remover duplicatas

# Filtrar por tamanho:
awk 'length >= 6 && length <= 16' combinada.txt > filtrada.txt
# Senhas entre 6 e 16 caracteres

# Aplicar regras (hashcat-style):
# Adicionar "!" no final de cada palavra:
sed 's/$/!/' wordlist.txt > wordlist_excl.txt
# Capitalizar primeira letra:
sed 's/^./\\U&/' wordlist.txt > wordlist_cap.txt
# Adicionar ano:
for word in $(cat wordlist.txt); do
  echo "$word"
  echo "\${word}2024"
  echo "\${word}2024!"
  echo "\${word}@2024"
done > wordlist_expanded.txt`}
      />
    </PageContainer>
  );
}
