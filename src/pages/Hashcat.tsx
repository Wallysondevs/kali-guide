import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Hashcat() {
  return (
    <PageContainer
      title="Hashcat — cracking GPU"
      subtitle="O cracker mais rápido do mundo. Aceita 350+ tipos de hash. CPU, GPU AMD/NVIDIA, Apple Metal."
      difficulty="intermediário"
      timeToRead="18 min"
      prompt="passwords/hashcat"
    >
      <h2>Verificar hardware</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "hashcat -V",
            out: "v6.2.6",
            outType: "info",
          },
          {
            cmd: "hashcat -I",
            out: `hashcat (v6.2.6) starting in benchmark mode...

OpenCL Info:
=============

OpenCL Platform ID #1
  Vendor..: NVIDIA Corporation
  Name....: NVIDIA CUDA
  Version.: OpenCL 3.0 CUDA 12.4

  Backend Device ID #1
    Type...........: GPU
    Vendor.ID......: 32
    Vendor.........: NVIDIA Corporation
    Name...........: NVIDIA GeForce RTX 4090
    Version........: OpenCL 3.0 CUDA
    Processor(s)...: 128
    Clock..........: 2520
    Memory.Total...: 24564 MB (limited to 6141 MB allocatable in one block)
    Memory.Free....: 23842 MB
    Local.Memory...: 96 KB`,
            outType: "success",
          },
          {
            cmd: "hashcat -b -m 1000",
            out: `* Device #1: NVIDIA GeForce RTX 4090, 23842/24564 MB, 128MCU

Benchmark relevant options:
===========================
* --optimized-kernel-enable

Hashmode: 1000 - NTLM

Speed.#1.........:  186.4 GH/s

Started: 2026-04-03 14:42:11
Stopped: 2026-04-03 14:42:23`,
            outType: "warning",
          },
        ]}
      />

      <h2>Modos de hash mais usados (-m)</h2>
      <CommandTable
        title="Cheatsheet -m"
        variations={[
          { cmd: "0", desc: "MD5 puro.", output: "5f4dcc3b5aa765d61d8327deb882cf99" },
          { cmd: "100", desc: "SHA1 puro.", output: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8" },
          { cmd: "1400", desc: "SHA-256 puro.", output: "Tokens, JWT, etc." },
          { cmd: "1700", desc: "SHA-512 puro.", output: "Hashes longos." },
          { cmd: "1000", desc: "NTLM (Windows hashes do mimikatz, hashdump).", output: "32 hex chars." },
          { cmd: "5500", desc: "NetNTLMv1 (raro).", output: "Capturado por Responder em LAN." },
          { cmd: "5600", desc: "NetNTLMv2 (Responder!).", output: "USER::DOMAIN:challenge:hash:..." },
          { cmd: "1800", desc: "sha512crypt $6$ (Linux antigo).", output: "/etc/shadow legacy." },
          { cmd: "32500", desc: "yescrypt $y$ (Linux atual).", output: "/etc/shadow Kali/Debian 12+." },
          { cmd: "500", desc: "md5crypt $1$.", output: "Linux pré-2010." },
          { cmd: "3200", desc: "bcrypt $2*$ (apps web).", output: "MUITO lento de propósito." },
          { cmd: "13100", desc: "Kerberos 5 TGS-REP (kerberoasting).", output: "$krb5tgs$23$*user$DOMAIN$..." },
          { cmd: "18200", desc: "Kerberos 5 AS-REP (asreproasting).", output: "$krb5asrep$..." },
          { cmd: "22000", desc: "WPA-PBKDF2 + WPA-PMKID (modo unificado wifi).", output: "Use hcxpcapngtool." },
          { cmd: "9200", desc: "PBKDF2-SHA256 (Cisco IOS, 1Password).", output: "Slow." },
          { cmd: "13400", desc: "KeePass 1.x e 2.x.", output: "Use keepass2john." },
          { cmd: "11600", desc: "7-Zip cifrado.", output: "Use 7z2hashcat." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "hashcat --example-hashes -m 5600 | head -8",
            out: `MODE: 5600
TYPE: NetNTLMv2
HASH: admin::N46iSNekpT:08ca45b7d7ea58ee:88dcbe4446168966a153a0064958dac6:5c7830315c7a37323b41514f54653...
PASS: hashcat`,
            outType: "info",
          },
        ]}
      />

      <h2>Modos de attack (-a)</h2>
      <CommandTable
        title="Os 4 modos principais"
        variations={[
          { cmd: "-a 0 (straight)", desc: "Wordlist puro.", output: "hashcat -a 0 -m 1000 ntlm.txt rockyou.txt" },
          { cmd: "-a 1 (combinator)", desc: "Combina 2 wordlists (palavra1+palavra2).", output: "hashcat -a 1 -m 1000 ntlm.txt animais.txt cores.txt" },
          { cmd: "-a 3 (mask)", desc: "Brute force estrutural por máscara.", output: "?l?l?l?l?l?l?d?d (6 letras + 2 dígitos)" },
          { cmd: "-a 6 (hybrid wordlist+mask)", desc: "Wordlist + máscara no fim.", output: "rockyou.txt + ?d?d?d (palavra + 3 dígitos)" },
          { cmd: "-a 7 (hybrid mask+wordlist)", desc: "Máscara no início + wordlist.", output: "?u + rockyou.txt" },
          { cmd: "-a 9 (associated)", desc: "Salt-aware wordlist + senha = salt.", output: "Útil em sites onde user==senha." },
        ]}
      />

      <h3>Charsets nas máscaras</h3>
      <OutputBlock label="placeholders de máscara" type="muted">
{`?l = abcdefghijklmnopqrstuvwxyz       (lower)
?u = ABCDEFGHIJKLMNOPQRSTUVWXYZ       (upper)
?d = 0123456789                       (digits)
?h = 0123456789abcdef                 (hex lower)
?H = 0123456789ABCDEF                 (hex upper)
?s = !"#$%&'()*+,-./:;<=>?@[\\]^_'{|}~ (special)
?a = ?l?u?d?s                          (all)
?b = 0x00 - 0xff                       (binary, raw)

Você pode definir custom: -1 ?l?d   (set custom 1 = letras + digitos)
                          -2 ?u?d   (set custom 2 = MAIÚSCULAS + digitos)
exemplo:  -a 3 -1 ?l?u?d  ?1?1?1?1?1?1?1?1   (8 chars de letra+digito)`}
      </OutputBlock>

      <h2>Wordlist puro</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "hashcat -a 0 -m 1000 ntlm_hashes.txt /usr/share/wordlists/rockyou.txt",
            out: `hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 CUDA 12.4) - Platform #1 [NVIDIA Corporation]
================================================================
* Device #1: NVIDIA GeForce RTX 4090, 23842/24564 MB, 128MCU

Hashes: 5 digests; 5 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates

aab3b9f5e98caf17765f9c91d6cf9bc2:Welcome2024!
[...]

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 1000 (NTLM)
Time.Started.....: Wed Apr  3 14:51:14 2026 (3 secs)
Speed.#1.........:   186.7 GH/s (47.21ms) @ Accel:512 Loops:1 Thr:32 Vec:1
Recovered........: 5/5 (100.00%) Digests
Progress.........: 14344386/14344386 (100.00%)
Started: Wed Apr 3 14:51:14 2026
Stopped: Wed Apr 3 14:51:17 2026`,
            outType: "success",
          },
        ]}
      />

      <h2>Wordlist + rules</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls /usr/share/hashcat/rules/ | head",
            out: `best64.rule
combinator.rule
d3ad0ne.rule
dive.rule
generated2.rule
hybrid/
leetspeak.rule
OneRuleToRuleThemAll.rule
rockyou-30000.rule
specific.rule
T0XlCv1.rule
toggles1.rule`,
            outType: "info",
          },
          {
            cmd: "hashcat -a 0 -m 1000 ntlm.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule",
            out: `Speed.#1.........:    11.94 GH/s
Recovered........: 18/20 (90.00%) Digests`,
            outType: "warning",
          },
          {
            comment: "OneRule é o estado da arte (52k regras curadas)",
            cmd: "hashcat -a 0 -m 1000 ntlm.txt rockyou.txt -r /usr/share/hashcat/rules/OneRuleToRuleThemAll.rule",
            out: "(MUITO lento mas pega exóticos)",
            outType: "muted",
          },
        ]}
      />

      <h2>Mask attack — quando você sabe o formato</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "8 chars: letra+letra+letra+letra+letra+digito+digito+especial",
            cmd: "hashcat -a 3 -m 1000 ntlm.txt ?l?l?l?l?l?d?d?s",
            out: `Speed.#1.........:    186.4 GH/s
Recovered........: 1/1 (100.00%)
Welcome24!`,
            outType: "success",
          },
          {
            comment: "padrão 'Empresa-2024' (custom + ano)",
            cmd: "hashcat -a 3 -m 1000 ntlm.txt 'Empresa-?d?d?d?d'",
            out: `Empresa-2024:1234567890abcdef...
Recovered........: 1/1 (100.00%)`,
            outType: "warning",
          },
          {
            comment: "8 chars de [letra+digito] — ?1 = custom set 1",
            cmd: "hashcat -a 3 -m 1000 ntlm.txt -1 ?l?d ?1?1?1?1?1?1?1?1",
            out: "(brute force em 36^8 = ~2.8 trilhões — ~4h em RTX 4090 para NTLM)",
            outType: "info",
          },
          {
            comment: "incremental: testa de 4 a 8 chars",
            cmd: "hashcat -a 3 -m 1000 ntlm.txt --increment --increment-min 4 --increment-max 8 ?a?a?a?a?a?a?a?a",
            out: "(começa com 4 chars, vai até 8 — TODO o teclado)",
            outType: "default",
          },
        ]}
      />

      <h2>Hybrid attack</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "wordlist + ano (?d?d?d?d no fim)",
            cmd: "hashcat -a 6 -m 1000 ntlm.txt /usr/share/wordlists/rockyou.txt ?d?d?d?d",
            out: "(testa cada palavra do rockyou seguida de 0000-9999. ENORME mas inteligente)",
            outType: "warning",
          },
          {
            comment: "Maiúscula + wordlist (?u + palavra)",
            cmd: "hashcat -a 7 -m 1000 ntlm.txt ?u /usr/share/wordlists/rockyou.txt",
            out: "(testa A+palavra, B+palavra, ..., Z+palavra)",
            outType: "default",
          },
        ]}
      />

      <h2>Performance flags</h2>
      <CommandTable
        title="Tunings"
        variations={[
          { cmd: "-O", desc: "Optimized kernel — limita senha a ~31 chars mas roda 2-5x mais rápido.", output: "Use SEMPRE em senhas humanas." },
          { cmd: "-w 3", desc: "Workload profile (1-4). 3=high, 4=insane (trava o sistema).", output: "Lab dedicado: -w 4." },
          { cmd: "--force", desc: "Ignora aviso de driver desconhecido.", output: "Nuvem (AWS GPU) precisa." },
          { cmd: "-d 1,2", desc: "Usar GPUs específicas (multi-GPU).", output: "0=CPU, 1=GPU1, 2=GPU2." },
          { cmd: "-S", desc: "Modo slow-hash (bcrypt, scrypt) — mantém GPU saturada.", output: "Para hashes lentos." },
          { cmd: "--session=meu_session", desc: "Salva estado.", output: "Pra retomar com --restore." },
          { cmd: "--restore", desc: "Continua de onde parou.", output: "Tudo de --session é restaurado." },
          { cmd: "--status --status-timer 10", desc: "Mostra status a cada 10s.", output: "Útil em ataques longos." },
          { cmd: "--remove", desc: "Remove hashes crackeados do arquivo input.", output: "Pra rodar próxima rodada só nos restantes." },
        ]}
      />

      <h2>Output e potfile</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "hashcat -m 1000 ntlm.txt --show",
            out: `aab3b9f5e98caf17765f9c91d6cf9bc2:Welcome2024!
b1a3aacc1981ddc8d4a7d80ca2ef6c7d:Senha@123
51c0f3c5b7f9cb7d5d46f5a2e9e16e2b:P@ssword!
50f1f1c6b9b8a7d4e2c3d5e1f5a3c2b1:admin
`,
            outType: "info",
          },
          {
            cmd: "cat ~/.local/share/hashcat/hashcat.potfile | head -3",
            out: `aab3b9f5e98caf17765f9c91d6cf9bc2:Welcome2024!
b1a3aacc1981ddc8d4a7d80ca2ef6c7d:Senha@123
51c0f3c5b7f9cb7d5d46f5a2e9e16e2b:P@ssword!`,
            outType: "default",
          },
          {
            cmd: "hashcat -m 1000 ntlm.txt -a 0 rockyou.txt --left -o left_only.txt",
            out: "(salva em left_only.txt SÓ os hashes que NÃO foram crackeados)",
            outType: "muted",
          },
        ]}
      />

      <h2>Crackear NTLM dump (Windows)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "formato hashdump padrão: usuario:RID:LM_HASH:NTLM_HASH:::",
            cmd: "cat ntds.dump | head -3",
            out: `Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1e07adc59f6c3eaa7a02e7a4e5f5cc1:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:e3a17a13ec8d6c5ed5d8b2f5e6ad9e1f:::
jsmith:1108:aad3b435b51404eeaad3b435b51404ee:88846f7eaee8fb117ad06bdd830b7586:::`,
            outType: "default",
          },
          {
            comment: "extrair só os NTLM",
            cmd: "cut -d: -f4 ntds.dump > ntlms.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "hashcat -m 1000 ntlms.txt /usr/share/wordlists/rockyou.txt -O",
            out: `Speed.#1.........:    186.4 GH/s
Recovered........: 247/2841 (8.69%) Digests`,
            outType: "warning",
          },
          {
            comment: "depois: combinar credenciais para spray",
            cmd: "hashcat -m 1000 ntlms.txt --show | awk -F: '{print $2}' | sort -u",
            out: `Welcome2024!
Senha@123
P@ssword!
[...]`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Lab completo: gera hash, cracka, valida"
        goal="Criar 5 hashes NTLM de senhas conhecidas, jogar no hashcat e validar 100%."
        steps={[
          "Use python para gerar 5 NTLM de senhas escolhidas.",
          "Salve em hashes.txt.",
          "Rode hashcat com rockyou.",
          "Confirme com --show.",
        ]}
        command={`python3 -c "
import hashlib
for p in ['password', '123456', 'qwerty', 'iloveyou', 'admin']:
  h = hashlib.new('md4', p.encode('utf-16le')).hexdigest()
  print(h)
" > hashes.txt
cat hashes.txt

hashcat -a 0 -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt -O
hashcat -m 1000 hashes.txt --show`}
        expected={`8846f7eaee8fb117ad06bdd830b7586
32ed87bdb5fdc5e9cba88547376818d4
[...]

Recovered........: 5/5 (100.00%) Digests

8846f7eaee8fb117ad06bdd830b7586:password
32ed87bdb5fdc5e9cba88547376818d4:123456
[...]`}
        verify="100% recovered confirma a sanidade do setup. Use o mesmo fluxo para hashes reais coletados em pentest."
      />

      <AlertBox type="info" title="Sem GPU? -O + --force ainda funciona em CPU">
        Hashcat roda em CPU também (mas 100-1000x mais lento). Para sessions longas
        considere AWS p3.2xlarge (V100) ou g5.xlarge (A10) — alugar GPU por hora é barato.
      </AlertBox>
    </PageContainer>
  );
}
