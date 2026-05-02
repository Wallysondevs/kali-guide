import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Crunch() {
  return (
    <PageContainer
      title="crunch — Gerador de wordlists"
      subtitle="Cria listas de senhas por comprimento, charset, padrão (mask) ou regras customizadas."
      difficulty="iniciante"
      timeToRead="9 min"
      prompt="passwords/crunch"
    >
      <h2>Sintaxe</h2>
      <OutputBlock label="estrutura do comando" type="muted">
{`crunch <min> <max> [charset] [opções]

  min     comprimento mínimo
  max     comprimento máximo
  charset string com caracteres permitidos (ou alias do /etc/crunch/charset.lst)`}
      </OutputBlock>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "crunch 4 4 abc",
            out: `Crunch will now generate the following amount of data: 405 bytes
0 MB
0 GB
0 TB
0 PB
Crunch will now generate the following number of lines: 81 

aaaa
aaab
aaac
aaba
aabb
aabc
[...]
cccc`,
            outType: "info",
          },
        ]}
      />

      <h2>Comprimento e charset</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "todas as combinações de 6 dígitos",
            cmd: "crunch 6 6 0123456789 -o pin6.txt",
            out: `Crunch will now generate the following amount of data: 7000000 bytes
6 MB
0 GB
Crunch will now generate the following number of lines: 1000000 

crunch: 100% completed generating output`,
            outType: "success",
          },
          {
            cmd: "wc -l pin6.txt && head pin6.txt",
            out: `1000000 pin6.txt
000000
000001
000002
000003
[...]`,
            outType: "default",
          },
          {
            comment: "8 chars com letras minúsculas + dígitos",
            cmd: "crunch 8 8 abcdefghijklmnopqrstuvwxyz0123456789 -o lab.txt",
            out: `Crunch will now generate the following amount of data: 25389989363712 bytes
24214149 MB
23645 GB
23 TB         ← 23 TB de wordlist! Use mask em vez disso`,
            outType: "warning",
          },
        ]}
      />

      <h2>Charset aliases (/etc/crunch/charset.lst)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "head -20 /etc/crunch/charset.lst",
            out: `# charset configuration file for winrtgen v1.2 by Massimiliano Montoro (mao@oxid.it)
# compatible with rainbowcrack 1.1 and later by Zhu Shuanglei <shuanglei@hotmail.com>

numeric                 = [0123456789]
numeric-space           = [0123456789 ]
symbols14               = [!@#$%^&*()-_+=]
symbols-all             = [!@#$%^&*()-_+= <>,.;:'"/\\\\]
ualpha                  = [ABCDEFGHIJKLMNOPQRSTUVWXYZ]
ualpha-space            = [ABCDEFGHIJKLMNOPQRSTUVWXYZ ]
ualpha-numeric          = [ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]
lalpha                  = [abcdefghijklmnopqrstuvwxyz]
lalpha-numeric          = [abcdefghijklmnopqrstuvwxyz0123456789]
mixalpha                = [ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz]
mixalpha-numeric        = [ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789]`,
            outType: "info",
          },
          {
            cmd: "crunch 8 8 -f /etc/crunch/charset.lst mixalpha-numeric -o lista.txt",
            out: `Crunch will now generate the following amount of data: 1881676411587328 bytes
1794457 GB           ← 1.7 PB. Use só com -t mask
1752 TB`,
            outType: "warning",
          },
        ]}
      />

      <h2>Mask (-t) — o segredo da eficiência</h2>
      <p>
        Em vez de gerar TUDO, use uma máscara que descreve o padrão da senha.
      </p>
      <CommandTable
        title="Caracteres da máscara -t"
        variations={[
          { cmd: "@", desc: "Letras minúsculas (a-z).", output: "Padrão." },
          { cmd: ",", desc: "Letras MAIÚSCULAS (A-Z).", output: "Use vírgula." },
          { cmd: "%", desc: "Dígitos (0-9).", output: "Igual a ?d do hashcat." },
          { cmd: "^", desc: "Símbolos.", output: "Charset 4 do crunch." },
          { cmd: "(literal)", desc: "Qualquer outro char fica fixo.", output: "Empresa@@@@%%%%" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "padrão Empresa-AAAA (5 letras maiúsculas)",
            cmd: "crunch 12 12 -t Empresa-,,,, -o emp.txt | head -5",
            out: `Empresa-AAAA
Empresa-AAAB
Empresa-AAAC
Empresa-AAAD
Empresa-AAAE`,
            outType: "info",
          },
          {
            comment: "padrão clássico 'Senha + ano + caracter'",
            cmd: "crunch 10 10 -t Senha%%%%^ -o senhas.txt",
            out: `Crunch will now generate the following amount of data: 252000000 bytes
240 MB
Crunch will now generate the following number of lines: 22500000`,
            outType: "default",
          },
          {
            comment: "padrão telefone BR (11)9XXXX-XXXX",
            cmd: "crunch 13 13 -t (11)9%%%%-%%%% | head -5",
            out: `(11)90000-0000
(11)90000-0001
(11)90000-0002
(11)90000-0003
(11)90000-0004`,
            outType: "muted",
          },
          {
            comment: "padrão com placeholder customizado (-d 2 = repetições <=2)",
            cmd: "crunch 6 6 abc -d 2@",
            out: "(impede aaaaaa, aaaaba etc — gera mais variado)",
            outType: "default",
          },
        ]}
      />

      <h2>Permutar palavras conhecidas (-p)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "crunch 1 1 -p admin senha 2024",
            out: `2024adminsenha
2024senhaadmin
admin2024senha
adminsenha2024
senha2024admin
senhaadmin2024`,
            outType: "info",
          },
          {
            comment: "também aceita arquivo (-q)",
            cmd: "echo -e 'admin\\nsenha\\n2024' > base.txt && crunch 1 1 -q base.txt",
            out: `2024adminsenha
2024senhaadmin
admin2024senha
adminsenha2024
senha2024admin
senhaadmin2024`,
            outType: "default",
          },
        ]}
      />

      <h2>Particionar saídas grandes (-b)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "split em arquivos de 100 MB cada (suporta KB/MB/GB)",
            cmd: "crunch 8 8 -t Senha%%% -o START -b 100mb",
            out: `Crunch will now generate the following amount of data: 9000 bytes
0 MB
[...]
Generated file: Senha000-Senha999.txt (9000 lines)`,
            outType: "default",
          },
          {
            comment: "saídas pre-determinadas (-c quantos por arquivo)",
            cmd: "crunch 6 6 abc -o START -c 100",
            out: "(cria muitos arquivos com 100 linhas cada: aaa-aaad.txt, aaae-aaah.txt, ...)",
            outType: "muted",
          },
        ]}
      />

      <h2>Stream direto para hashcat/john (sem salvar)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "evita gerar 23 TB no disco",
            cmd: "crunch 8 8 -t Empresa%%% | hashcat -a 0 -m 1000 ntlm.txt",
            out: `(hashcat lê linha a linha do stdin)
Speed.#1.........:    98.4 GH/s
Recovered........: 1/1 (100.00%)`,
            outType: "success",
          },
          {
            cmd: "crunch 8 8 -t -2024 ?l?l?l?l | john --stdin --format=NT ntlm.txt",
            out: "(equivalente para john)",
            outType: "default",
          },
        ]}
      />

      <h2>Iniciar/terminar em pontos específicos (-s, -e)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "iniciar a partir de uma palavra (útil para retomar)",
            cmd: "crunch 5 5 abcde -s acbcd | head -5",
            out: `acbcd
acbce
acbda
acbdb
acbdc`,
            outType: "info",
          },
          {
            comment: "parar em um ponto",
            cmd: "crunch 5 5 abcde -e acbdf | tail -3",
            out: `acbdd
acbde
acbdf`,
            outType: "default",
          },
        ]}
      />

      <h2>Alternativas mais poderosas</h2>
      <CommandTable
        title="Quando NÃO usar crunch"
        variations={[
          { cmd: "cupp -i", desc: "Wordlist personalizada interativa (nome, sobrenome, pet, datas).", output: "Para pentest de pessoa específica." },
          { cmd: "cewl https://empresa.com -d 3 -m 6 -w cewl.txt", desc: "Spider que extrai palavras únicas do site.", output: "Vocabulário real da empresa." },
          { cmd: "mentalist", desc: "GUI de geração com regras visuais (atom, append, substitute).", output: "GitHub: sc0tfree/mentalist" },
          { cmd: "hashcat -a 3 -O ?u?l?l?l?l?l?l?d", desc: "Mask attack direto na GPU.", output: "MUITO mais rápido que crunch + wordlist." },
          { cmd: "hashcat -a 6/7 + rules", desc: "Wordlist + mutação na GPU.", output: "Combina wordlist real (rockyou) com regras." },
        ]}
      />

      <PracticeBox
        title="Wordlist customizada para pentest interno"
        goal="Gerar uma wordlist focada no padrão de senha provável da ACME Corp."
        steps={[
          "Padrão típico: 'Acme' + ano + special char.",
          "Combine padrões em série e concatene.",
          "Estime tamanho ANTES de gerar (-c 0).",
        ]}
        command={`# 1) padrão Acme + ano + caracter
crunch 9 9 -t Acme%%%%^ -o acme1.txt

# 2) padrão acme + 4 chars alfanuméricos
crunch 8 8 -t acme%%%% -o acme2.txt

# 3) combinar com palavras-chave
echo -e "ACME\\nacme\\nAcme\\nadmin\\nti2024" > base.txt
crunch 1 1 -q base.txt > acme_perm.txt

# 4) consolidar e deduplicar
cat acme1.txt acme2.txt acme_perm.txt | sort -u > wordlist_acme.txt
wc -l wordlist_acme.txt`}
        expected={`Crunch will now generate ... lines: 90000
Crunch will now generate ... lines: 10000
[...]
~120000 wordlist_acme.txt`}
        verify="O arquivo final wordlist_acme.txt deve ter ao menos 100k linhas, sem duplicatas. Use direto em hashcat/hydra."
      />

      <AlertBox type="info" title="Crunch é didático, mas hashcat é mais rápido">
        Para hashes ofensivos, prefira <strong>hashcat -a 3 (mask)</strong> — gera e testa
        ao mesmo tempo, na GPU, sem tocar disco. Crunch é melhor para gerar
        wordlists permanentes para reuso (ex: Wi-Fi WPA2 com handshake gravado).
      </AlertBox>
    </PageContainer>
  );
}
