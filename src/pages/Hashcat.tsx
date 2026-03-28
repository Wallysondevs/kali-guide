import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Hashcat() {
  return (
    <PageContainer
      title="Hashcat"
      subtitle="Quebrando hashes com a GPU — a ferramenta mais rápida do mundo para cracking de senhas."
      difficulty="avancado"
      timeToRead="10 min"
    >
      <h2>Por que Hashcat?</h2>
      <p>
        O <strong>Hashcat</strong> usa a GPU para quebrar hashes em velocidade muito superior ao John the Ripper. 
        Uma GPU moderna pode testar <strong>bilhões de hashes por segundo</strong> para MD5 e NTLM, 
        tornando-o indispensável para cracking de senhas em escala.
      </p>

      <AlertBox type="info" title="GPU necessária para máxima velocidade">
        O Hashcat funciona via CPU, mas é otimizado para GPU (NVIDIA/AMD). 
        Em VMs sem GPU passthrough, use John the Ripper que é mais adequado para CPU.
      </AlertBox>

      <h2>Tipos de hash mais comuns</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left px-4 py-2 border border-border text-foreground">Modo (-m)</th>
              <th className="text-left px-4 py-2 border border-border text-foreground">Hash Type</th>
              <th className="text-left px-4 py-2 border border-border text-foreground">Exemplo</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["0", "MD5", "5d41402abc4b2a76b9719d911017c592"],
              ["100", "SHA1", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"],
              ["1000", "NTLM (Windows)", "8846f7eaee8fb117ad06bdd830b7586c"],
              ["1400", "SHA-256", "6b86b273..."],
              ["1800", "sha512crypt (Linux $6$)", "$6$salto$hash..."],
              ["3200", "bcrypt", "$2a$10$..."],
              ["5500", "NetNTLMv1", "(hash de rede)"],
              ["5600", "NetNTLMv2", "(hash de rede)"],
              ["13100", "Kerberoast (TGS)", "$krb5tgs$23$..."],
              ["18200", "AS-REP Roasting", "$krb5asrep$23$..."],
            ].map(([mode, type, example], i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-card" : ""}>
                <td className="px-4 py-2 font-mono text-primary border border-border">{mode}</td>
                <td className="px-4 py-2 text-foreground border border-border">{type}</td>
                <td className="px-4 py-2 text-muted-foreground font-mono text-xs border border-border">{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Ataques básicos</h2>
      <CodeBlock language="bash" code={`# Ataque de dicionário (-a 0)
hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt           # MD5
hashcat -m 1000 hashes.txt rockyou.txt                             # NTLM
hashcat -m 1800 hashes.txt rockyou.txt                             # Linux SHA-512
hashcat -m 3200 hashes.txt rockyou.txt                             # bcrypt

# Hash único na linha de comando
hashcat -m 0 5d41402abc4b2a76b9719d911017c592 rockyou.txt

# Forçar modo CPU (em VM sem GPU)
hashcat -m 0 hashes.txt rockyou.txt --force

# Ver progresso
hashcat -m 0 hashes.txt rockyou.txt --status

# Retomar sessão
hashcat --restore`} />

      <h2>Ataques com regras</h2>
      <CodeBlock language="bash" code={`# -a 0 com regras (wordlist + mutações)
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/rockyou-30000.rule
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/d3ad0ne.rule

# Múltiplas regras
hashcat -m 1000 hashes.txt rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule \
  -r /usr/share/hashcat/rules/toggles1.rule

# Listar regras disponíveis
ls /usr/share/hashcat/rules/`} />

      <h2>Ataque combinado e brute force</h2>
      <CodeBlock language="bash" code={`# Ataque de combinação (-a 1): word1 + word2
hashcat -m 1000 hashes.txt dict1.txt dict2.txt -a 1

# Brute force por máscara (-a 3)
# ?l = minúsculas, ?u = maiúsculas, ?d = dígitos, ?s = símbolos, ?a = todos

# 4 dígitos (PIN)
hashcat -m 1000 hashes.txt -a 3 ?d?d?d?d

# Senha de 8 chars minúsculas + dígitos
hashcat -m 1000 hashes.txt -a 3 ?l?l?l?l?l?l?d?d

# Padrão específico (começa com A maiúsculo)
hashcat -m 1000 hashes.txt -a 3 A?l?l?l?l?d?d

# Incremento de tamanho
hashcat -m 1000 hashes.txt -a 3 ?a?a?a?a?a?a --increment --increment-min=6`} />

      <h2>Kerberoasting e AD</h2>
      <CodeBlock language="bash" code={`# Quebrar TGS (Kerberoasting — obtido com Impacket/Rubeus)
hashcat -m 13100 kerberoast_hashes.txt rockyou.txt

# AS-REP Roasting (contas sem pré-autenticação)
hashcat -m 18200 asrep_hashes.txt rockyou.txt

# NetNTLMv2 (obtido com Responder)
hashcat -m 5600 netntlmv2.txt rockyou.txt

# Crackear secretsdump de um DC
hashcat -m 1000 ntds.dit.hashes rockyou.txt -r rules/best64.rule`} />

      <h2>Identificar tipo de hash</h2>
      <CodeBlock language="bash" code={`# hashid — identificar tipo de hash
hashid hash_aqui
hashid 5d41402abc4b2a76b9719d911017c592

# hash-identifier (alternativo)
hash-identifier

# Identificar automaticamente e rodar o hashcat certo
hashid -m "5d41402abc4b2a76b9719d911017c592"  # -m mostra o número do modo hashcat

# Exemplo de hash Linux Shadow:
# $6$ = sha512crypt (modo 1800)
# $5$ = sha256crypt (modo 7400)
# $1$ = md5crypt (modo 500)
# $2a$ ou $2b$ = bcrypt (modo 3200)`} />
    </PageContainer>
  );
}
