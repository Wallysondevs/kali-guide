import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function John() {
  return (
    <PageContainer
      title="John the Ripper — cracking offline"
      subtitle="Quebra hashes (shadow, NTLM, MD5, bcrypt, Kerberos, ZIP) usando wordlists, regras e bruteforce."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Versão Jumbo (a única que importa)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "john --version",
            out: `John the Ripper 1.9.0-jumbo-1+bleeding-aec1328d6c 2024-09-15 13:24:11 +0200 OMP [linux-gnu 64-bit x86_64 AVX2 AC]`,
            outType: "info",
          },
          {
            cmd: "john --list=formats | head -20",
            out: `descrypt, bsdicrypt, md5crypt, md5crypt-long, bcrypt, scrypt, LM, AFS, tripcode,
AndroidBackup, adxcrypt, agilekeychain, aix-ssha1, aix-ssha256, aix-ssha512,
andOTP, ansible, argon2, as400-des, as400-ssha1, asa-md5, AxCrypt, AzureAD,
BestCrypt, BestCryptVer4, bfegg, bitcoin, BitLocker, BKS, Blackberry-ES10,
blockchain, Bitwarden, ChaCha, Citrix_NS10, ClipperZ, cloudkeychain,
cq, CRC32, CryptoSafe, dahua, Dexter, Django, DMD5, DMG, dnssec, dominosec,
dragonfly3-32, dragonfly3-64, dragonfly4-32, dragonfly4-64, Drupal7, eCryptfs,
[...]
NT, NetNTLMv1, NetNTLMv2, NetNTLMv2-NT, mscash, mscash2, krb5pa-md5, krb5pa-sha1,
krb5tgs, kerberoasted, RAR5, raw-MD4, raw-MD5, raw-SHA1, raw-SHA256, raw-SHA512`,
            outType: "default",
          },
        ]}
      />

      <h2>Cracking de /etc/shadow</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "1) preparar input juntando passwd + shadow",
            cmd: "sudo unshadow /etc/passwd /etc/shadow > shadow.txt",
            out: "(silencioso. shadow.txt fica no formato que john entende)",
            outType: "muted",
          },
          {
            cmd: "head -3 shadow.txt",
            out: `root:$y$j9T$6hL...:0:0:root:/root:/usr/bin/zsh
daemon:*:1:1:daemon:/usr/sbin:/usr/sbin/nologin
wallyson:$y$j9T$Z6F8pQa.../...:1000:1000:Wallyson Lopes,,,:/home/wallyson:/usr/bin/zsh`,
            outType: "info",
          },
          {
            comment: "2) attack: john detecta o formato sozinho (yescrypt aqui)",
            cmd: "john --wordlist=/usr/share/wordlists/rockyou.txt shadow.txt",
            out: `Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (yescrypt [pwhash 4x])
Cost 1 (N) is 4096 for all loaded hashes
Cost 2 (r) is 32 for all loaded hashes
Cost 3 (p) is 1 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status

Senha@123      (wallyson)
1g 0:00:00:14 DONE (2026-04-03 14:21) 0.06992g/s 287.4p/s 287.4c/s 574.8C/s 123456..whatever
Use the "--show" option to display all of the cracked passwords reliably
Session completed.`,
            outType: "success",
          },
          {
            cmd: "john --show shadow.txt",
            out: `wallyson:Senha@123:1000:1000:Wallyson Lopes,,,:/home/wallyson:/usr/bin/zsh

1 password hash cracked, 1 left`,
            outType: "info",
          },
        ]}
      />

      <h2>Modos de ataque</h2>
      <CommandTable
        title="--mode / --rules / --incremental"
        variations={[
          { cmd: "(default sem flag)", desc: "Single (usa GECOS/login como senha) → wordlist.list → incremental.", output: "Bom para 'tudo de uma vez'." },
          { cmd: "--wordlist=lista.txt", desc: "Só wordlist.", output: "Mais comum em CTF." },
          { cmd: "--wordlist=lista.txt --rules=Best64", desc: "Wordlist + mutação (l33t, append digits).", output: "12-15x mais coverage." },
          { cmd: "--wordlist=lista.txt --rules=All", desc: "Aplica TODAS as regras (lento).", output: "Use quando wordlist for pequena." },
          { cmd: "--incremental=Lower", desc: "Brute force só letras minúsculas.", output: "Combinatório." },
          { cmd: "--incremental=Alnum", desc: "Letras + dígitos.", output: "Próximo passo." },
          { cmd: "--mask=?l?l?l?d?d?d", desc: "Máscara estrutural (3 letras + 3 dígitos).", output: "Quando você sabe o formato." },
          { cmd: "--single", desc: "Tenta variações do username/GECOS.", output: "wallyson → Wallyson, wallyson123, wallyson!." },
          { cmd: "--show", desc: "Mostra senhas já crackeadas.", output: "Não recracka, lê do pot file." },
          { cmd: "--show=left", desc: "Mostra hashes ainda NÃO crackeados.", output: "Para continuar trabalhando neles." },
        ]}
      />

      <h2>Regras (mutações)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "john --list=rules | head -10",
            out: `Single, Wordlist, Extra, NT, Jumbo, KoreLogic, Best64, T0XlC, T0XlCv1, OneRuleToRuleThemAll,
SpiderLab, hashcat, dive, OneRuleToRuleThemAllRules, leetspeak, append_digit_3, ...`,
            outType: "info",
          },
          {
            comment: "Best64 é um clássico (64 regras curadas)",
            cmd: "john --wordlist=top1000.txt --rules=Best64 hashes.txt",
            out: "(testa cada palavra com 64 mutações: l33t, capitalize, append digits, etc.)",
            outType: "muted",
          },
          {
            comment: "OneRuleToRuleThemAll — 52k regras, mais coverage",
            cmd: "john --wordlist=top1000.txt --rules=OneRuleToRuleThemAll hashes.txt",
            out: "(extremamente lento mas pega coisas exóticas)",
            outType: "warning",
          },
        ]}
      />

      <h3>Regras customizadas</h3>
      <CodeBlock
        language="ini"
        title="/etc/john/john.conf — adicionar regras minhas"
        code={`[List.Rules:Wallyson]
# capitaliza primeira letra + append 1 dígito
c $0
c $1
c $2
c $3
c $4
c $5
c $6
c $7
c $8
c $9

# leetspeak básico
sa@
se3
si1
so0
sl1

# append dígitos da virada de ano
$2 $0 $2 $4
$2 $0 $2 $5
$2 $0 $2 $6
$! $0 $!`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "john --wordlist=base.txt --rules=Wallyson hashes.txt",
            out: "(usa as suas regras)",
            outType: "default",
          },
        ]}
      />

      <h2>Hashes específicos</h2>
      <CommandTable
        title="Format hint (--format=...)"
        variations={[
          { cmd: "--format=raw-md5", desc: "MD5 puro (sem salt).", output: "5f4dcc3b5aa765d61d8327deb882cf99 = 'password'" },
          { cmd: "--format=raw-sha1", desc: "SHA-1 puro.", output: "Útil para tokens." },
          { cmd: "--format=raw-sha256", desc: "SHA-256 puro.", output: "Pra hashes de API." },
          { cmd: "--format=md5crypt", desc: "$1$ Linux (MD5 + salt).", output: "Antigo /etc/shadow." },
          { cmd: "--format=sha512crypt", desc: "$6$ Linux.", output: "Padrão antes do yescrypt." },
          { cmd: "--format=yescrypt", desc: "$y$ Linux atual.", output: "Padrão Debian/Kali atual." },
          { cmd: "--format=bcrypt", desc: "$2y$ ou $2a$ (hash de senhas web).", output: "Lento de proposito." },
          { cmd: "--format=NT", desc: "NTLM (Windows).", output: "32 chars hex." },
          { cmd: "--format=netntlmv2", desc: "NetNTLMv2 (Responder/SMB challenge).", output: "Capturado em ataques na rede." },
          { cmd: "--format=krb5tgs", desc: "Kerberoasted ticket.", output: "$krb5tgs$23$*user$DOMAIN$..." },
          { cmd: "--format=krb5asrep", desc: "AS-REP roastable.", output: "$krb5asrep$..." },
          { cmd: "--format=zip", desc: "ZIP cifrado.", output: "Use zip2john primeiro." },
          { cmd: "--format=rar", desc: "RAR cifrado.", output: "Use rar2john primeiro." },
          { cmd: "--format=PDF", desc: "PDF protegido.", output: "Use pdf2john.pl primeiro." },
        ]}
      />

      <h2>Conversores *2john</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "zip2john arquivo_secreto.zip > zip.hash",
            out: `arquivo_secreto.zip:$pkzip2$1*1*2*0*40*32*abc...:::::arquivo_secreto.zip`,
            outType: "info",
          },
          {
            cmd: "john --wordlist=/usr/share/wordlists/rockyou.txt zip.hash",
            out: `Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 8 OpenMP threads

senha2024        (arquivo_secreto.zip)
1g 0:00:00:00 DONE (2026-04-03 14:34)`,
            outType: "success",
          },
          {
            cmd: "rar2john arquivo.rar > rar.hash",
            out: "(formato $RAR3$* ou $RAR5$*)",
            outType: "muted",
          },
          {
            cmd: "/usr/share/john/pdf2john.pl protegido.pdf > pdf.hash",
            out: "protegido.pdf:$pdf$2*3*128*-1028*1*16*abc...",
            outType: "muted",
          },
          {
            cmd: "ssh2john ~/.ssh/id_rsa > ssh.hash && john --wordlist=top10k.txt ssh.hash",
            out: `Cost 1 (KDF/cipher) is 1 (aes-128-cbc) for all loaded hashes
minha_senha_ssh   (id_rsa)
1g 0:00:00:01 DONE`,
            outType: "warning",
          },
        ]}
      />

      <h2>Sessions e resume</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "salvar progresso com --session",
            cmd: "john --session=lab1 --wordlist=rockyou.txt hashes.txt",
            out: `(running. Ctrl+C interrompe — mas estado salvo)`,
            outType: "muted",
          },
          {
            cmd: "john --status=lab1",
            out: `0g 0:00:01:23  3/3 0g/s 14823p/s 14823c/s 14823C/s 12345..senha999`,
            outType: "info",
          },
          {
            cmd: "john --restore=lab1",
            out: "(continua de onde parou)",
            outType: "default",
          },
        ]}
      />

      <h2>Pot file</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "cat ~/.john/john.pot",
            out: `$y$j9T$Z6F8pQa.../...:Senha@123
$pkzip2$1*...:senha2024
$ssh2$2,16$...:minha_senha_ssh`,
            outType: "info",
          },
          {
            comment: "limpar pot e recomeçar",
            cmd: "rm ~/.john/john.pot",
            out: "(silencioso. cuidado: perde tudo o que já foi crackeado)",
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Rachar um ZIP protegido em laboratório"
        goal="Gerar um zip com senha fraca, extrair o hash, crackear com john."
        steps={[
          "Crie um arquivo qualquer.",
          "Empacote em zip com senha 'admin123' (do top100).",
          "Extraia o hash com zip2john.",
          "Use john com rockyou.",
        ]}
        command={`echo "conteudo secreto" > segredo.txt
zip -e -P 'admin123' arquivo.zip segredo.txt
zip2john arquivo.zip > zip.hash
john --wordlist=/usr/share/wordlists/rockyou.txt zip.hash
john --show zip.hash`}
        expected={`Loaded 1 password hash (PKZIP [32/64])
admin123        (arquivo.zip)
1g 0:00:00:00 DONE

arquivo.zip:admin123

1 password hash cracked, 0 left`}
        verify="O comando '--show' deve mostrar a senha crackeada."
      />

      <AlertBox type="info" title="John é melhor para diversidade; Hashcat para velocidade">
        John tem mais formatos suportados (ZIP, PDF, KeePass, ASR-REP, etc) e regras avançadas.
        <strong> Hashcat</strong> é melhor quando você precisa de GPU brutal (NTLM, bcrypt em larga escala).
        Use os dois — um pot file pode até ser convertido entre eles.
      </AlertBox>
    </PageContainer>
  );
}
