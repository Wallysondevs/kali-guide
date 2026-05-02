import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function GPG() {
  return (
    <PageContainer
      title="GPG — assinatura e criptografia"
      subtitle="GnuPG é o canivete suíço da criptografia: assinar binários, criptografar relatório de pentest, verificar tarballs antes de compilar."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Por que GPG no Kali</h2>
      <p>
        Em pentest profissional, o entregável final (<strong>relatório com vulnerabilidades reais</strong>,
        screenshots de loot, hashes de senhas) <strong>nunca</strong> sai do laboratório em texto puro.
        GPG é o padrão de fato pra criptografar arquivos pra um destinatário específico (chave pública dele)
        e pra assinar payloads/scripts entregues ao cliente. Também é como você verifica
        que um <code>.iso</code> do Kali ou tarball do GitHub não foi adulterado.
      </p>

      <CommandTable
        title="Conceitos rápidos antes de tocar"
        variations={[
          { cmd: "chave pública (.asc, .pub)", desc: "Distribuída pra todos. Quem encripta com ela só você decifra.", output: "Compartilhe à vontade." },
          { cmd: "chave privada (.gpg, ~/.gnupg/private-keys)", desc: "Sua. Decifra mensagens e assina arquivos.", output: "NUNCA sai da sua máquina." },
          { cmd: "fingerprint", desc: "Hash SHA-1/SHA-256 da chave, 40 hex chars. Usado pra identificar.", output: "AB1C 23DE 45F6 ..." },
          { cmd: "keyring", desc: "Banco local de chaves conhecidas (suas + de terceiros).", output: "~/.gnupg/pubring.kbx" },
          { cmd: "trust level", desc: "Quão certo você está que a chave pertence à pessoa.", output: "ultimate, full, marginal, never" },
          { cmd: "subkey", desc: "Chave derivada da master, usada no dia-a-dia (assinar/encriptar).", output: "Master fica offline em cofre." },
        ]}
      />

      <h2>Gerar seu primeiro par de chaves</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "gpg --version",
            out: `gpg (GnuPG) 2.4.5
libgcrypt 1.10.3
Home: /home/wallyson/.gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH, CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2`,
            outType: "info",
          },
          {
            comment: "modo interativo: escolhe tipo, tamanho, expiração",
            cmd: "gpg --full-generate-key",
            out: `Please select what kind of key you want:
   (1) RSA and RSA
   (9) ECC (sign and encrypt) *default*
Your selection? 9
Please select which elliptic curve you want:
   (1) Curve 25519 *default*
Your selection? 1
Please specify how long the key should be valid.
         0 = key does not expire
        2y = key expires in 2 years
Key is valid for? (0) 2y
Real name: Wallyson Pentest
Email address: wallyson@redteam.local
Comment: ops-key-2026
You selected this USER-ID:
    "Wallyson Pentest (ops-key-2026) <wallyson@redteam.local>"

gpg: revocation certificate stored as '/home/wallyson/.gnupg/openpgp-revocs.d/AB1C23DE45F6...rev'
public and secret key created and signed.

pub   ed25519 2026-04-03 [SC] [expires: 2028-04-03]
      AB1C23DE45F6789012345678901234567890ABCD
uid                      Wallyson Pentest (ops-key-2026) <wallyson@redteam.local>
sub   cv25519 2026-04-03 [E] [expires: 2028-04-03]`,
            outType: "success",
          },
          {
            comment: "modo rápido sem prompts (CI / scripting)",
            cmd: "gpg --batch --passphrase '' --quick-gen-key 'Lab Key <lab@local>' ed25519 default 1y",
            out: "(silencioso, gera chave em segundos)",
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="warning" title="Entropia">
        Em VM Kali fresca, gerar chave pode travar esperando entropia. Instale <code>haveged</code>{" "}
        ou <code>rng-tools</code> pra acelerar:{" "}
        <code>sudo apt install haveged && sudo systemctl enable --now haveged</code>.
      </AlertBox>

      <h2>Listar, exportar, importar</h2>
      <CommandTable
        title="Operações de keyring"
        variations={[
          { cmd: "gpg --list-keys", desc: "Lista chaves públicas que você conhece.", output: "pub ed25519 ... uid Wallyson <...>" },
          { cmd: "gpg --list-secret-keys --keyid-format LONG", desc: "Suas privadas com IDs longos (úteis pra scripts).", output: "sec ed25519/AB1C23DE45F67890 ..." },
          { cmd: "gpg --fingerprint wallyson@redteam.local", desc: "Mostra fingerprint completa pra verificar com o dono.", output: "AB1C 23DE 45F6 7890 ..." },
          { cmd: "gpg --export -a wallyson@redteam.local > pub.asc", desc: "Exporta pública em ASCII (compartilhar).", output: "-----BEGIN PGP PUBLIC KEY BLOCK-----" },
          { cmd: "gpg --export-secret-keys -a > backup-priv.asc", desc: "Exporta PRIVADA. Trate como joia da coroa.", output: "-----BEGIN PGP PRIVATE KEY BLOCK-----" },
          { cmd: "gpg --import cliente.asc", desc: "Importa chave pública de outra pessoa.", output: "gpg: key ABCD: public key 'Cliente <c@x.com>' imported" },
          { cmd: "gpg --delete-key 'Cliente'", desc: "Remove pública.", output: "Confirma e apaga." },
          { cmd: "gpg --delete-secret-keys 'Cliente'", desc: "Remove privada (precisa apagar antes da pública).", output: "Pede confirmação." },
        ]}
      />

      <h2>Criptografar arquivo pro cliente</h2>
      <Terminal
        path="~/engagement"
        lines={[
          {
            comment: "importa a chave pública do cliente (recebida fora-de-banda)",
            cmd: "gpg --import cliente_acme.asc",
            out: `gpg: key 9F8E7D6C5B4A3210: public key "Acme Security <sec@acme.corp>" imported
gpg: Total number processed: 1
gpg:               imported: 1`,
            outType: "info",
          },
          {
            cmd: "ls -lh",
            out: `total 14M
-rw------- 1 wallyson wallyson  47K Apr  3 18:21 ntds_dump.txt
-rw------- 1 wallyson wallyson  12M Apr  3 18:22 relatorio_final.pdf
-rw------- 1 wallyson wallyson 1.8M Apr  3 18:22 screenshots_loot.tar.gz`,
            outType: "default",
          },
          {
            comment: "encripta pra Acme — só a privada deles abre",
            cmd: "gpg --encrypt --armor --recipient sec@acme.corp relatorio_final.pdf",
            out: "(silencioso → cria relatorio_final.pdf.asc)",
            outType: "muted",
          },
          {
            comment: "alvo binário (menor) com múltiplos destinatários",
            cmd: "gpg -e -r sec@acme.corp -r ciso@acme.corp ntds_dump.txt",
            out: "(cria ntds_dump.txt.gpg)",
            outType: "success",
          },
          {
            comment: "encripta E assina ao mesmo tempo (autoria + sigilo)",
            cmd: "gpg --sign --encrypt --armor -r sec@acme.corp screenshots_loot.tar.gz",
            out: `You need a passphrase to unlock the secret key for
user: "Wallyson Pentest <wallyson@redteam.local>"
[passphrase]
(cria screenshots_loot.tar.gz.asc — sigilo + autenticidade)`,
            outType: "warning",
          },
          {
            cmd: "ls *.asc *.gpg",
            out: `ntds_dump.txt.gpg
relatorio_final.pdf.asc
screenshots_loot.tar.gz.asc`,
            outType: "info",
          },
        ]}
      />

      <h2>Decriptar (você é o destinatário)</h2>
      <Terminal
        path="~/inbox"
        lines={[
          {
            cmd: "ls",
            out: "credenciais_handoff.txt.gpg",
            outType: "default",
          },
          {
            comment: "auto-detecta destinatário e usa sua privada",
            cmd: "gpg --output credenciais_handoff.txt --decrypt credenciais_handoff.txt.gpg",
            out: `gpg: encrypted with cv25519 key, ID AB1C23DE45F67890, created 2026-04-03
      "Wallyson Pentest (ops-key-2026) <wallyson@redteam.local>"
[passphrase]
gpg: Signature made Fri 03 Apr 2026 19:14:02 -03
gpg:                using EDDSA key 9F8E7D6C5B4A3210
gpg: Good signature from "Acme Security <sec@acme.corp>" [unknown]`,
            outType: "success",
          },
          {
            comment: "decripta na stdout (pra pipar pra outro comando)",
            cmd: "gpg -d credenciais_handoff.txt.gpg | grep -i 'admin'",
            out: `[passphrase]
admin@acme.corp:Welcome2026!
domain_admin:Sup3rS3cret#2026`,
            outType: "warning",
          },
        ]}
      />

      <h2>Assinatura — verificar binário do GitHub</h2>
      <p>
        Sempre que baixar uma ferramenta do <code>releases</code> do GitHub (Sliver, Havoc, Chisel, etc.),
        verifique a assinatura. <strong>Hash MD5/SHA256 sozinho não basta</strong> se o atacante adulterou
        o servidor: ele troca o binário E o hash. Assinatura GPG só funciona se ele também tiver a chave privada.
      </p>

      <Terminal
        path="~/tools"
        lines={[
          {
            cmd: "ls sliver*",
            out: `sliver-server_linux
sliver-server_linux.sig
maintainer-key.asc`,
            outType: "default",
          },
          {
            cmd: "gpg --import maintainer-key.asc",
            out: `gpg: key 7A1B2C3D4E5F6A7B: public key "BishopFox <sliver@bishopfox.com>" imported
gpg: Total number processed: 1`,
            outType: "info",
          },
          {
            cmd: "gpg --verify sliver-server_linux.sig sliver-server_linux",
            out: `gpg: Signature made Fri 28 Mar 2026 10:21:14 -03
gpg:                using RSA key 7A1B2C3D4E5F6A7B
gpg: Good signature from "BishopFox <sliver@bishopfox.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 7A1B 2C3D 4E5F 6A7B ...`,
            outType: "warning",
          },
          {
            comment: "compare a fingerprint MANUALMENTE com a publicada no site oficial",
            cmd: "gpg --fingerprint sliver@bishopfox.com",
            out: "7A1B 2C3D 4E5F 6A7B  C8D9 E0F1 A2B3 C4D5  E6F7 8901",
            outType: "info",
          },
        ]}
      />

      <h2>Servidores de chaves</h2>
      <CommandTable
        title="Buscar / publicar chaves"
        variations={[
          { cmd: "gpg --keyserver keys.openpgp.org --search-keys joaohacker@x.com", desc: "Busca chave por email no keyserver moderno (sem SKS).", output: "(1) João Hacker <joaohacker@x.com> 2048R/ABCD..." },
          { cmd: "gpg --keyserver hkps://keys.openpgp.org --recv-keys 7A1B2C3D4E5F6A7B", desc: "Importa direto pelo fingerprint.", output: "gpg: key ...: public key imported" },
          { cmd: "gpg --send-keys AB1C23DE45F67890", desc: "Publica sua pública pro keyserver default.", output: "gpg: sending key ... to hkps://keys.openpgp.org" },
          { cmd: "curl https://github.com/wallyson.gpg | gpg --import", desc: "GitHub publica chave em /<user>.gpg — atalho prático.", output: "gpg: imported." },
        ]}
      />

      <h2>Edição e revogação</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "gpg --edit-key wallyson@redteam.local",
            out: `gpg> trust
Please decide how far you trust this user...
   1 = I don't know
   5 = I trust ultimately
Your decision? 5
gpg> expire
Key is valid for? (0) 3y
gpg> save`,
            outType: "info",
          },
          {
            comment: "se chave foi comprometida → publique revogação imediatamente",
            cmd: "gpg --output revoke.asc --gen-revoke wallyson@redteam.local",
            out: `Create a revocation certificate for this key? (y/N) y
Please select the reason for the revocation:
  0 = No reason specified
  1 = Key has been compromised
Your decision? 1
Please enter the description: chave roubada em incidente abr/2026
Reason for revocation: Key has been compromised
ASCII armored output forced.
Revocation certificate created.`,
            outType: "error",
          },
          {
            cmd: "gpg --import revoke.asc && gpg --send-keys AB1C23DE45F67890",
            out: "gpg: key AB1C...: \"Wallyson Pentest\" revocation certificate imported",
            outType: "warning",
          },
        ]}
      />

      <h2>Arquivo de configuração</h2>
      <CodeBlock
        language="ini"
        title="~/.gnupg/gpg.conf"
        code={`# Defaults agressivos pra 2026
personal-cipher-preferences AES256 AES192 AES
personal-digest-preferences SHA512 SHA384 SHA256
personal-compress-preferences ZLIB BZIP2 ZIP Uncompressed
default-preference-list SHA512 SHA384 SHA256 AES256 AES192 AES ZLIB BZIP2 ZIP Uncompressed
cert-digest-algo SHA512
s2k-digest-algo SHA512
s2k-cipher-algo AES256
charset utf-8
fixed-list-mode
no-comments
no-emit-version
no-greeting
keyid-format 0xlong
list-options show-uid-validity
verify-options show-uid-validity
with-fingerprint
require-cross-certification
no-symkey-cache
use-agent
throw-keyids
keyserver hkps://keys.openpgp.org`}
      />

      <h2>Symmetric (sem chaves, só passphrase)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "AES-256 com passphrase — útil pra exfil rápida",
            cmd: "gpg --symmetric --cipher-algo AES256 loot.tar.gz",
            out: `[passphrase]
[passphrase confirm]
(cria loot.tar.gz.gpg)`,
            outType: "warning",
          },
          {
            cmd: "gpg --output loot.tar.gz --decrypt loot.tar.gz.gpg",
            out: `gpg: AES256.CFB encrypted data
gpg: encrypted with 1 passphrase
[passphrase]`,
            outType: "info",
          },
          {
            comment: "passphrase via stdin (scripts de exfil)",
            cmd: "echo 'S3cret!' | gpg --batch --yes --passphrase-fd 0 --symmetric -o saida.gpg loot.tar.gz",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Encripte um relatório falso pra você mesmo e decifre"
        goal="Validar geração de chave + encrypt/decrypt round-trip antes de usar com cliente real."
        steps={[
          "Gere uma chave 'Test <test@local>' rápida via --quick-gen-key.",
          "Crie um arquivo relatorio.txt com conteúdo simulado.",
          "Encripte armored com -r test@local.",
          "Apague o original.",
          "Decifre e confira que o conteúdo bate.",
        ]}
        command={`gpg --batch --passphrase 'lab123' --quick-gen-key 'Test <test@local>' ed25519 default 1y
echo "ACME engagement - admin:Welcome2026 - 12 vulns - PoC anexa" > relatorio.txt
gpg --pinentry-mode loopback --passphrase 'lab123' -e -a -r test@local relatorio.txt
shred -u relatorio.txt
gpg --pinentry-mode loopback --passphrase 'lab123' -d relatorio.txt.asc`}
        expected={`pub   ed25519 2026-04-03 [SC] [expires: 2027-04-03]
      ...
ACME engagement - admin:Welcome2026 - 12 vulns - PoC anexa`}
        verify="A última linha deve ser idêntica ao conteúdo original. Round-trip OK = você está pronto pra usar com cliente."
      />

      <AlertBox type="danger" title="Backup e proteção da privada">
        Sua privada + passphrase = identidade criptográfica. Backup em pen drive criptografado
        (LUKS), guardado offline. NUNCA commit em git público (use{" "}
        <code>gitleaks</code> antes de push). Use subkeys pra que a master nunca toque máquina online.
      </AlertBox>
    </PageContainer>
  );
}
