import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Permissoes() {
  return (
    <PageContainer
      title="Permissões de Arquivo"
      subtitle="O modelo rwx, chmod, chown, SUID/SGID e ACLs — base de toda escalação de privilégios."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Anatomia de uma permissão</h2>
      <p>
        Cada arquivo no Linux tem três grupos de permissões: <strong>dono</strong> (user),
        <strong> grupo</strong> e <strong>outros</strong>. Cada grupo tem 3 bits: <code>r</code> (read), 
        <code>w</code> (write), <code>x</code> (execute).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls -l /etc/shadow /usr/bin/passwd /tmp /etc/hosts",
            out: `-rw-r-----  1 root shadow  1247 Mar 12 14:02 /etc/shadow
-rwsr-xr-x  1 root root   68208 Jan 14 09:11 /usr/bin/passwd
drwxrwxrwt 21 root root    4096 Apr 03 08:33 /tmp
-rw-r--r--  1 root root     220 Jan 14 09:11 /etc/hosts`,
            outType: "info",
          },
        ]}
      />

      <OutputBlock label="lendo as permissões" type="muted">
{`-rw-r-----  1 root shadow  1247 ...
│└┬┘└┬┘└┬┘
│ │  │  └─ outros: ---  (nada)
│ │  └──── grupo : r--  (lê)
│ └─────── dono  : rw-  (lê, escreve)
└───────── tipo  : -    (arquivo regular)
                 d = diretório
                 l = link simbólico
                 s = socket
                 c = character device
                 b = block device`}
      </OutputBlock>

      <h2>Notação numérica (octal)</h2>
      <p>Cada bit vale: <code>r=4</code>, <code>w=2</code>, <code>x=1</code>. Some para um número de 0 a 7.</p>

      <CommandTable
        title="Permissões mais usadas"
        variations={[
          { cmd: "0644", desc: "rw-r--r-- — arquivo de texto padrão (configs, html).", output: "Dono lê/escreve, todos leem." },
          { cmd: "0600", desc: "rw------- — arquivo privado (chaves SSH, .env).", output: "Só o dono acessa." },
          { cmd: "0755", desc: "rwxr-xr-x — script ou binário executável.", output: "Dono total, grupo+outros executam e leem." },
          { cmd: "0700", desc: "rwx------ — pasta privada (~/.ssh).", output: "Só o dono entra." },
          { cmd: "0775", desc: "rwxrwxr-x — pasta de equipe.", output: "Dono e grupo escrevem; outros leem." },
          { cmd: "0777", desc: "rwxrwxrwx — TUDO para todo mundo. Risco grave.", output: "Use só em /tmp ou nunca." },
          { cmd: "1777", desc: "drwxrwxrwt — sticky bit (tipo /tmp): só o dono apaga.", output: "Bit 1xxx = sticky." },
          { cmd: "4755", desc: "rwsr-xr-x — SUID: roda como dono do binário.", output: "Bit 4xxx = SUID. Vetor clássico de privesc." },
          { cmd: "2755", desc: "rwxr-sr-x — SGID: arquivos novos herdam o grupo.", output: "Bit 2xxx = SGID." },
        ]}
      />

      <h2>chmod — mudando permissões</h2>
      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "touch script.sh && ls -l script.sh",
            out: "-rw-r--r-- 1 wallyson wallyson 0 Apr 03 08:40 script.sh",
            outType: "default",
          },
          {
            comment: "modo numérico — define exato",
            cmd: "chmod 755 script.sh && ls -l script.sh",
            out: "-rwxr-xr-x 1 wallyson wallyson 0 Apr 03 08:40 script.sh",
            outType: "success",
          },
          {
            comment: "modo simbólico — adiciona/remove",
            cmd: "chmod g-x,o-x script.sh && ls -l script.sh",
            out: "-rwxr--r-- 1 wallyson wallyson 0 Apr 03 08:40 script.sh",
            outType: "default",
          },
          {
            comment: "u=user, g=group, o=others, a=all",
            cmd: "chmod u+x,g+w,o-r script.sh && ls -l script.sh",
            out: "-rwxrw---- 1 wallyson wallyson 0 Apr 03 08:40 script.sh",
            outType: "default",
          },
          {
            comment: "recursivo em diretório (-R aplica em tudo dentro)",
            cmd: "chmod -R 750 ~/projetos/app",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
        ]}
      />

      <CommandTable
        title="Sintaxe simbólica do chmod"
        variations={[
          { cmd: "chmod u+x file", desc: "Adiciona execução ao DONO.", output: "rw-r--r-- → rwxr--r--" },
          { cmd: "chmod g-w file", desc: "Remove escrita do GRUPO.", output: "rwxrwxr-x → rwxr-xr-x" },
          { cmd: "chmod o=r file", desc: "Define outros = só leitura.", output: "qualquer → ---r--" },
          { cmd: "chmod a+x file", desc: "Adiciona execução para TODOS.", output: "rw-r--r-- → rwxr-xr-x" },
          { cmd: "chmod -R 700 ~/.ssh", desc: "Recursivo (-R) — pasta + tudo dentro.", output: "Todos os arquivos viram 700." },
        ]}
      />

      <h2>chown — mudando dono/grupo</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "ls -l /var/www/html/",
            out: `total 4
-rw-r--r-- 1 root root 612 Jan 14 09:11 index.html`,
            outType: "default",
          },
          {
            comment: "www-data passa a ser o dono (precisa de sudo)",
            cmd: "sudo chown www-data:www-data /var/www/html/index.html",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -l /var/www/html/index.html",
            out: "-rw-r--r-- 1 www-data www-data 612 Jan 14 09:11 /var/www/html/index.html",
            outType: "success",
          },
          {
            comment: "recursivo + só grupo (deixa o dono)",
            cmd: "sudo chown -R :www-data /var/www/html",
            out: "(silencioso. ':grupo' muda só o grupo)",
            outType: "muted",
          },
        ]}
      />

      <h2>SUID, SGID, sticky bit</h2>
      <p>
        Bits especiais: aparecem como <code>s</code> ou <code>t</code> no <code>ls -l</code>.
        São o <strong>vetor #1</strong> de escalação de privilégios em PrivEsc Linux.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "encontrar TODOS os binários SUID do sistema",
            cmd: "find / -perm -4000 -type f 2>/dev/null",
            out: `/usr/bin/passwd
/usr/bin/su
/usr/bin/sudo
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/mount
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device`,
            outType: "warning",
          },
          {
            comment: "binário com SUID roda como o DONO dele (geralmente root)",
            cmd: "ls -l /usr/bin/passwd",
            out: "-rwsr-xr-x 1 root root 68208 Jan 14 09:11 /usr/bin/passwd",
            outType: "info",
          },
          {
            comment: "definir SUID manualmente",
            cmd: "sudo chmod u+s /usr/local/bin/meu_binario",
            out: "(o 's' aparecerá no lugar do 'x' do dono)",
            outType: "default",
          },
        ]}
      />

      <AlertBox type="danger" title="SUID = porta de privesc">
        Se você (atacante) achar um binário com SUID + bug de execução (ex.: <code>find -exec</code>,
        <code> nmap --interactive</code>, <code>vim</code>, <code>tar</code>, <code>cp</code>),
        consegue virar root. Veja a página{" "}
        <a href="#/privesc-linux"><strong>PrivEsc — Linux</strong></a> e{" "}
        <a href="https://gtfobins.github.io" target="_blank" rel="noreferrer">GTFOBins</a>.
      </AlertBox>

      <h2>umask — máscara padrão</h2>
      <p>
        Quando você cria um arquivo, ele recebe permissões = <code>0666 - umask</code>.
        Para diretórios, <code>0777 - umask</code>.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "umask",
            out: "0022",
            outType: "info",
          },
          {
            comment: "0666 - 022 = 0644 (rw-r--r-- para arquivos novos)",
            cmd: "touch teste && ls -l teste",
            out: "-rw-r--r-- 1 wallyson wallyson 0 Apr 03 08:50 teste",
            outType: "default",
          },
          {
            comment: "umask mais restritivo (privacidade total)",
            cmd: "umask 0077 && touch privado && ls -l privado",
            out: "-rw------- 1 wallyson wallyson 0 Apr 03 08:50 privado",
            outType: "success",
          },
        ]}
      />

      <h2>ACL — permissões finas</h2>
      <p>O modelo rwx é grosseiro (só 3 escopos). ACLs permitem dar permissão a usuários/grupos específicos.</p>

      <Terminal
        path="~/lab"
        lines={[
          {
            cmd: "sudo apt install -y acl",
            out: "(já vem instalado no Kali padrão)",
            outType: "muted",
          },
          {
            cmd: "touch relatorio.pdf",
            out: "(criado, dono = wallyson)",
            outType: "muted",
          },
          {
            comment: "dar leitura para o usuário 'maria' especificamente",
            cmd: "setfacl -m u:maria:r relatorio.pdf",
            out: "(silencioso)",
            outType: "default",
          },
          {
            cmd: "ls -l relatorio.pdf",
            out: "-rw-r--r--+ 1 wallyson wallyson 0 Apr 03 08:55 relatorio.pdf",
            outType: "info",
          },
          {
            comment: "o '+' indica que tem ACL extra. Veja com getfacl",
            cmd: "getfacl relatorio.pdf",
            out: `# file: relatorio.pdf
# owner: wallyson
# group: wallyson
user::rw-
user:maria:r--
group::r--
mask::r--
other::r--`,
            outType: "success",
          },
          {
            cmd: "setfacl -x u:maria relatorio.pdf",
            out: "(remove a ACL específica de maria)",
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Auditoria de SUID — encontre vetores de privesc"
        goal="Listar todos os SUID do sistema e comparar com a lista 'segura' do GTFOBins."
        steps={[
          "Busque arquivos com SUID em todo o sistema, escondendo erros.",
          "Salve a saída em um arquivo para análise.",
          "Compare manualmente com gtfobins.github.io para identificar binários que permitem virar root.",
        ]}
        command={`find / -perm -4000 -type f -exec ls -la {} \\; 2>/dev/null | tee /tmp/suid_audit.txt
wc -l /tmp/suid_audit.txt`}
        expected={`-rwsr-xr-x 1 root root 68208 Jan 14 09:11 /usr/bin/passwd
-rwsr-xr-x 1 root root 87768 Jan 14 09:11 /usr/bin/sudo
-rwsr-xr-x 1 root root 35192 Jan 14 09:11 /usr/bin/su
[...]
12 /tmp/suid_audit.txt`}
        verify="Para cada binário não-padrão (não passwd, su, sudo, mount, ping, newgrp, gpasswd), procure em GTFOBins."
      />

      <CodeBlock
        language="bash"
        title="permissoes-comuns.sh — receitas de produção"
        code={`# Chaves SSH — DONO apenas
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
chmod 644 ~/.ssh/known_hosts

# Web (Apache/Nginx) com www-data como dono
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \\;
sudo find /var/www/html -type f -exec chmod 644 {} \\;

# Pasta compartilhada de equipe (grupo "devs")
sudo chgrp -R devs /srv/projeto
sudo chmod -R 2770 /srv/projeto   # SGID + grupo escreve, outros nada

# Arquivos sensíveis (.env, certificados)
chmod 600 .env
chmod 600 *.pem`}
      />

      <AlertBox type="warning" title="chmod 777 quase nunca é a resposta">
        Se um app não tem permissão para escrever, a solução certa é <strong>mudar o dono/grupo</strong>{" "}
        com <code>chown</code>, não abrir tudo para o mundo. <code>chmod 777</code> em qualquer
        coisa fora de <code>/tmp</code> é um cheiro de problema mal resolvido.
      </AlertBox>
    </PageContainer>
  );
}
