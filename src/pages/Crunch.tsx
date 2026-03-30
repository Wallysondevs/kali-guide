import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Crunch() {
    return (
      <PageContainer
        title="Crunch & CeWL — Geradores de Wordlists"
        subtitle="Crie wordlists personalizadas baseadas em padrões ou no conteúdo de sites alvo."
        difficulty="iniciante"
        timeToRead="10 min"
      >
        <AlertBox type="info" title="Wordlists personalizadas superam wordlists genéricas">
          Usar uma wordlist baseada na empresa alvo, seus funcionários e terminologias específicas
          aumenta MUITO as chances de sucesso em ataques de senha.
        </AlertBox>

        <h2>Crunch — Wordlists por Padrão</h2>
        <CodeBlock language="bash" code={'# Sintaxe: crunch TAMANHO_MIN TAMANHO_MAX [CHARSET] [OPÇÕES]\n\n# Gerar todas combinações de 4-6 caracteres numéricos\ncrunch 4 6 0123456789\n\n# Apenas letras minúsculas, 6 caracteres\ncrunch 6 6 abcdefghijklmnopqrstuvwxyz\n\n# Letras + números, 8 caracteres\ncrunch 8 8 abcdefghijklmnopqrstuvwxyz0123456789 -o wordlist.txt\n\n# Com padrão específico (@ = lowercase, , = uppercase, % = number, ^ = symbol)\ncrunch 8 8 -t Empresa%%  # Empresa + 2 dígitos\ncrunch 10 10 -t João%%%%@ # João + 4 números + 1 letra\n\n# Usando charsets predefinidos\ncrunch 8 8 -f /usr/share/crunch/charset.lst lalpha-numeric\n\n# Salvar em arquivo\ncrunch 6 8 0123456789 -o /tmp/numeros.txt\ncrunch 4 4 -t brasil% -o pines_br.txt'} />

        <h2>CeWL — Wordlist do Site Alvo</h2>
        <CodeBlock language="bash" code={'# CeWL vasculha um site e cria wordlist com palavras encontradas\n\n# Uso básico (profundidade 2, palavras de 6+ letras)\ncewl https://www.empresa.com.br -d 2 -m 6\n\n# Salvar em arquivo\ncewl https://www.empresa.com.br -d 3 -m 5 -w empresa_wordlist.txt\n\n# Incluir e-mails encontrados\ncewl https://www.empresa.com.br -d 2 -e -o emails.txt\n\n# Mais profundidade + incluir números\ncewl https://www.empresa.com.br -d 4 -m 4 --with-numbers -w wordlist.txt\n\n# Ver estatísticas\ncewl https://www.empresa.com.br -d 2 -m 5 --count\n\n# Com proxy\ncewl https://www.empresa.com.br -d 2 --proxy http://127.0.0.1:8080'} />

        <h2>Cupp — Wordlist por Perfil</h2>
        <CodeBlock language="bash" code={'# CUPP (Common User Passwords Profiler)\nsudo apt install cupp -y\n\n# Modo interativo — perguntas sobre o alvo\ncupp -i\n# Nome, sobrenome, apelido, data de nascimento, empresa,\n# nome do pet, parceiro, filhos → gera wordlist personalizada\n\n# Combinar com existente\ncupp -w existing_wordlist.txt'} />

        <h2>Wordlists Prontas no Kali</h2>
        <CodeBlock language="bash" code={'# Listar wordlists disponíveis\nls /usr/share/wordlists/\n\n# rockyou.txt (mais famosa — 14 milhões de senhas)\nwc -l /usr/share/wordlists/rockyou.txt\n\n# Descomprimir se necessário\ngunzip /usr/share/wordlists/rockyou.txt.gz\n\n# SecLists (coleção massiva)\nsudo apt install seclists -y\nls /usr/share/seclists/Passwords/\nls /usr/share/seclists/Discovery/Web-Content/\n\n# Wordlists para nomes de arquivos web\n/usr/share/seclists/Discovery/Web-Content/common.txt\n/usr/share/seclists/Discovery/Web-Content/big.txt'} />

        <h2>Manipular e Combinar Wordlists</h2>
        <CodeBlock language="bash" code={'# Remover duplicatas e ordenar\nsort wordlist.txt | uniq > wordlist_clean.txt\n\n# Combinar duas wordlists\ncat list1.txt list2.txt | sort | uniq > combined.txt\n\n# Hashcat — mutações de wordlist (rules)\nhashcat -a 0 -m 0 hash.txt wordlist.txt -r /usr/share/hashcat/rules/best64.rule\n\n# Adicionar número ao final de cada palavra\nwhile read word; do\n  for n in {1..99}; do echo "${word}${n}"; done\ndone < wordlist.txt > wordlist_numbers.txt\n\n# Adicionar @ no lugar de a\nsed \'s/a/@/g\' wordlist.txt > wordlist_leet.txt'} />

        <AlertBox type="success" title="Estratégia de wordlist">
          Para senhas corporativas, combine: CeWL do site + nome da empresa + ano atual + símbolos comuns.
          Ex: Empresa2024! — é surpreendentemente comum em ambientes reais.
        </AlertBox>
      </PageContainer>
    );
  }
  