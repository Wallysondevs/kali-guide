import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ManipulacaoArquivos() {
  return (
    <PageContainer
      title="Manipulação de arquivos"
      subtitle="cp, mv, rm, ln, stat, chattr, shred — preserve metadados, proteja do oponente, apague sem deixar pista."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>cp — não é só cópia</h2>
      <CommandTable
        title="cp essencial"
        variations={[
          { cmd: "cp src dst", desc: "Cópia simples.", output: "" },
          { cmd: "cp -r dir/ destino/", desc: "Recursivo (diretórios).", output: "" },
          { cmd: "cp -a src dst", desc: "ARCHIVE: preserva mode, ownership, timestamps, ACL, xattr, symlinks.", output: "Use SEMPRE em backup/loot." },
          { cmd: "cp -p src dst", desc: "Preserva timestamps + permissões (mas não recursivo).", output: "Subset de -a." },
          { cmd: "cp -i src dst", desc: "Pergunta antes de sobrescrever.", output: "cp: overwrite 'dst'? y" },
          { cmd: "cp -n src dst", desc: "NEVER overwrite (no-clobber).", output: "Silencioso se dst existe." },
          { cmd: "cp -u src dst", desc: "Update: só copia se src é mais novo.", output: "Bom para sync incremental rápido." },
          { cmd: "cp -v src dst", desc: "Verbose.", output: "'src' -> 'dst'" },
          { cmd: "cp -L src dst", desc: "Segue symlinks (copia o conteúdo apontado).", output: "" },
          { cmd: "cp -P src dst", desc: "NÃO segue symlinks (copia o link).", output: "Default é o oposto." },
        ]}
      />

      <Terminal
        path="~/loot"
        lines={[
          {
            comment: "exfiltrar /etc/* preservando permissões originais para análise forense em casa",
            cmd: "sudo cp -a /etc /home/wallyson/loot/etc-snapshot",
            out: "(silencioso = sucesso)",
            outType: "muted",
          },
          {
            cmd: "ls -la loot/etc-snapshot/shadow",
            out: "-rw-r----- 1 root shadow 1247 Apr  3 09:12 loot/etc-snapshot/shadow",
            outType: "info",
          },
        ]}
      />

      <h2>mv — mover/renomear (atômico no mesmo FS)</h2>
      <CommandTable
        title="mv flags úteis"
        variations={[
          { cmd: "mv old new", desc: "Renomeia (no mesmo diretório).", output: "" },
          { cmd: "mv arq dir/", desc: "Move para dir/.", output: "" },
          { cmd: "mv -i src dst", desc: "Pergunta antes de sobrescrever.", output: "" },
          { cmd: "mv -n src dst", desc: "Não sobrescreve.", output: "" },
          { cmd: "mv -b src dst", desc: "Backup do dst antes (cria dst~).", output: "" },
          { cmd: "mv *.log /var/log/old/", desc: "Glob aceito.", output: "" },
        ]}
      />

      <AlertBox type="info" title="mv entre filesystems != atômico">
        <p>
          <code>mv</code> dentro do mesmo filesystem é só renomear inode (instantâneo, atômico).
          Entre filesystems (ex: <code>/tmp</code> tmpfs → <code>/home</code> ext4) ele faz
          <strong>cp + rm</strong> internamente. Em scripts, isso pode quebrar invariantes que
          assumem atomicidade. Use <code>rsync --remove-source-files</code> para mv robusto
          cross-FS com progresso.
        </p>
      </AlertBox>

      <h2>rm — destruir (com cuidado)</h2>
      <CommandTable
        title="rm flags"
        variations={[
          { cmd: "rm arq", desc: "Remove arquivo.", output: "" },
          { cmd: "rm -i arq", desc: "Pergunta.", output: "rm: remove 'arq'? y" },
          { cmd: "rm -f arq", desc: "Force: ignora não-existente, não pergunta.", output: "" },
          { cmd: "rm -r dir/", desc: "Recursivo (deleta diretório).", output: "" },
          { cmd: "rm -rf dir/", desc: "O combo nuclear.", output: "Sem volta." },
          { cmd: "rm -v *.tmp", desc: "Verbose: mostra o que apagou.", output: "removed 'a.tmp'\\nremoved 'b.tmp'" },
          { cmd: "rm -- -arquivo", desc: "-- separa flags de nome (arquivo começando com -).", output: "" },
        ]}
      />

      <AlertBox type="danger" title="rm não vai pra Lixeira">
        <p>
          Não há <code>undelete</code> no Linux. Use <code>trash-cli</code>
          (<code>sudo apt install trash-cli</code>, depois <code>trash arq</code>) ou crie alias
          <code>alias rm='rm -i'</code>. Em pentest engagement, NUNCA rode <code>rm -rf</code>
          em diretório do cliente — você não tem direito de destruir dados.
        </p>
      </AlertBox>

      <h2>mkdir / rmdir / touch</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "mkdir -p loot/htb/blue/{nmap,web,creds}",
            out: "(silencioso — cria árvore inteira de uma vez)",
            outType: "muted",
          },
          {
            cmd: "tree loot",
            out: `loot
└── htb
    └── blue
        ├── creds
        ├── nmap
        └── web

5 directories, 0 files`,
            outType: "info",
          },
          {
            cmd: "touch loot/htb/blue/nmap/{tcp,udp,vuln}.txt",
            out: "(cria 3 arquivos vazios)",
            outType: "muted",
          },
          {
            comment: "também muda timestamps de arquivo existente",
            cmd: "touch -t 202001011200 loot/htb/blue/nmap/tcp.txt",
            out: "(timestamp setado para 2020-01-01 12:00 — útil para anti-forense)",
            outType: "warning",
          },
          {
            comment: "rmdir só apaga diretório VAZIO",
            cmd: "rmdir loot/htb/blue/creds",
            out: "(silencioso = ok)",
            outType: "muted",
          },
        ]}
      />

      <h2>ln — links simbólicos e hard links</h2>
      <CommandTable
        title="Tipos de link"
        variations={[
          { cmd: "ln src hardlink", desc: "Hard link: mesmo inode. Não atravessa FS. Não funciona em diretório.", output: "stat mostra mesmo inode." },
          { cmd: "ln -s src symlink", desc: "Symbolic link: ponteiro de texto. Funciona em qualquer coisa.", output: "ls -l mostra link → src" },
          { cmd: "ln -sf src dst", desc: "Force: substitui dst se já existir.", output: "Sem -f, erro 'File exists'." },
          { cmd: "readlink -f symlink", desc: "Resolve recursivamente até o target real.", output: "/opt/metasploit-framework" },
          { cmd: "find /etc -type l", desc: "Lista todos symlinks.", output: "/etc/mtab → /proc/self/mounts" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo 'segredo' > original.txt && ln original.txt hard && ln -s original.txt soft",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -li original.txt hard soft",
            out: `2097152 -rw-r--r-- 2 wallyson wallyson 8 Apr 3 09:12 hard
2097152 -rw-r--r-- 2 wallyson wallyson 8 Apr 3 09:12 original.txt
2097158 lrwxrwxrwx 1 wallyson wallyson 12 Apr 3 09:12 soft -> original.txt`,
            outType: "info",
          },
          {
            comment: "rm original — hard ainda tem o conteúdo, soft fica quebrado",
            cmd: "rm original.txt && cat hard && cat soft",
            out: `segredo
cat: soft: No such file or directory`,
            outType: "warning",
          },
        ]}
      />

      <h2>stat — toda info de um arquivo</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "stat /etc/shadow",
            out: `  File: /etc/shadow
  Size: 1247           Blocks: 8          IO Block: 4096   regular file
Device: 254,0  Inode: 1834           Links: 1
Access: (0640/-rw-r-----)  Uid: (    0/    root)   Gid: (   42/  shadow)
Access: 2026-04-03 09:00:01.000000000 -0300
Modify: 2026-04-02 18:45:33.000000000 -0300
Change: 2026-04-02 18:45:33.000000000 -0300
 Birth: 2025-08-12 22:14:01.000000000 -0300`,
            outType: "info",
          },
          {
            comment: "formato custom",
            cmd: "stat -c '%n %a %U:%G %s' /etc/passwd /etc/shadow",
            out: `/etc/passwd 644 root:root 3247
/etc/shadow 640 root:shadow 1247`,
            outType: "default",
          },
        ]}
      />

      <p>
        Os 4 timestamps (<strong>atime</strong>=acesso, <strong>mtime</strong>=modificação de
        conteúdo, <strong>ctime</strong>=mudança de inode/perm, <strong>btime</strong>=criação)
        são fundamentais em forense. Em pós-explo defensiva (red team avoidance), você quer
        evitar mexer em mtime/ctime.
      </p>

      <h2>chattr — atributos extras (anti-tampering)</h2>
      <CommandTable
        title="chattr +i e amigos"
        variations={[
          { cmd: "sudo chattr +i arq", desc: "IMMUTABLE: nem root pode editar/apagar/renomear.", output: "Anti-tampering forte." },
          { cmd: "sudo chattr -i arq", desc: "Remove imutabilidade.", output: "" },
          { cmd: "sudo chattr +a arq.log", desc: "APPEND ONLY: só dá pra acrescentar (logs anti-modificação).", output: "" },
          { cmd: "lsattr arq", desc: "Lista atributos.", output: "----i---------e--- arq" },
          { cmd: "sudo chattr +s arq", desc: "Secure delete (em FS que suportam).", output: "Sobrescreve antes de apagar." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "ATAQUE: backdoor user em /etc/passwd e prevenir admin de remover",
            cmd: "echo 'evil:x:0:0::/root:/bin/bash' | sudo tee -a /etc/passwd",
            out: "evil:x:0:0::/root:/bin/bash",
            outType: "warning",
          },
          {
            cmd: "sudo chattr +i /etc/passwd",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "agora nem root consegue editar",
            cmd: "sudo sed -i '/evil/d' /etc/passwd",
            out: "sed: cannot rename /etc/sedXXXXXX: Operation not permitted",
            outType: "error",
          },
          {
            comment: "DEFESA: detectar imutáveis",
            cmd: "sudo lsattr /etc/passwd /etc/shadow /etc/sudoers",
            out: `----i---------e--- /etc/passwd
--------------e--- /etc/shadow
--------------e--- /etc/sudoers`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="danger" title="chattr +i é IoC clássico">
        <p>
          Quando blue team faz threat hunt, <code>{`lsattr -R /etc /var/spool/cron 2>/dev/null | grep '^----i'`}</code>
          é uma das primeiras buscas. Se você usa <code>+i</code> em red team engagement, documente
          no relatório e remova ao final. Em CTFs e labs, é fair game.
        </p>
      </AlertBox>

      <h2>shred — sobrescrever antes de apagar</h2>
      <CommandTable
        title="Apagar com 'segurança'"
        variations={[
          { cmd: "shred arq", desc: "Sobrescreve 3 vezes com random.", output: "Não apaga o arquivo (sem -u)." },
          { cmd: "shred -u arq", desc: "Sobrescreve E unlink (apaga).", output: "" },
          { cmd: "shred -uvz -n 7 arq", desc: "7 passes, verbose, último é zeros.", output: "shred: arq: pass 1/7 (random)..." },
          { cmd: "shred -u /dev/sdb", desc: "Wipe de bloco inteiro.", output: "Pode levar horas. Para SSD não funciona como esperado." },
          { cmd: "wipe -rf dir/", desc: "Alternativa que entende diretórios.", output: "apt install wipe." },
          { cmd: "srm arq", desc: "Secure rm (pacote secure-delete).", output: "apt install secure-delete." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "echo 'creds_db_admin: hunter2' > leaked.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "shred -uvz -n 3 leaked.txt",
            out: `shred: leaked.txt: pass 1/4 (random)...
shred: leaked.txt: pass 2/4 (random)...
shred: leaked.txt: pass 3/4 (random)...
shred: leaked.txt: pass 4/4 (000000)...
shred: leaked.txt: removing
shred: leaked.txt: renamed to 0000000000
shred: 0000000000: renamed to 000000000
shred: 000000000: removed`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="warning" title="shred não funciona em SSD/COW">
        <p>
          Em SSDs (wear-leveling), filesystems COW (btrfs, zfs) e jornaling (ext3/4), shred
          não garante nada — o controlador escreve em blocos diferentes. Para wipe real:
          <code>blkdiscard /dev/sdb</code> (TRIM em SSD), <code>cryptsetup erase</code> em LUKS,
          ou destruição física. Para um único arquivo sensível: criptografe ANTES de criar
          (LUKS / age / GPG) e jamais escreva o plaintext em disco.
        </p>
      </AlertBox>

      <h2>Permissões e ACL — preserva no copy</h2>
      <CodeBlock
        language="bash"
        title="snapshot.sh — backup que NÃO perde permissões"
        code={`#!/usr/bin/env bash
set -euo pipefail

SRC="\${1:?uso: $0 <src> <dst>}"
DST="\${2}"

# rsync com -aAX preserva: archive, ACLs, xattrs (incluindo capabilities)
rsync -aAXv --info=progress2 "$SRC/" "$DST/"

# verificar que tudo foi preservado
diff <(getfacl -R "$SRC" 2>/dev/null | sort) \\
     <(getfacl -R "$DST" 2>/dev/null | sort) \\
  && echo "[+] ACLs idênticas"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "getfacl /etc/sudoers",
            out: `# file: etc/sudoers
# owner: root
# group: root
user::r--
group::r--
other::---`,
            outType: "default",
          },
          {
            cmd: "getcap /usr/bin/ping",
            out: "/usr/bin/ping cap_net_raw=ep",
            outType: "info",
          },
        ]}
      />

      <h2>find -exec / xargs — operações em massa</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "deletar todos .swp do Vim que ficaram para trás",
            cmd: "find ~ -name '.*.swp' -type f -delete",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: "achar e copiar todas chaves SSH para um lugar",
            cmd: "find / -name 'id_rsa' -type f 2>/dev/null -exec cp -a {} /tmp/loot/ \\;",
            out: `(silencioso — copiou todas para /tmp/loot)`,
            outType: "warning",
          },
          {
            comment: "mais rápido com xargs (paralelo)",
            cmd: "find / -name '*.kdbx' -type f 2>/dev/null | xargs -I{} -P4 cp -a {} /tmp/loot/",
            out: "(silencioso, 4 cópias em paralelo)",
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Loot consolidado preservando metadados + cleanup com shred"
        goal="Coletar artefatos sensíveis simulados, copiar com -a (preservando perms/timestamps), validar com diff, depois destruir o original com shred."
        steps={[
          "Crie /tmp/target/ simulando dados sensíveis (chaves, configs).",
          "Copie tudo para /tmp/loot/ preservando metadados.",
          "Compare ACLs e permissões.",
          "Apague originais com shred -uz.",
          "Confirme que sumiram.",
        ]}
        command={`mkdir -p /tmp/target/.ssh
echo "BEGIN PRIVATE KEY..." > /tmp/target/.ssh/id_rsa
chmod 600 /tmp/target/.ssh/id_rsa
echo "db_pass=hunter2" > /tmp/target/.env

mkdir -p /tmp/loot
sudo cp -aRv /tmp/target/. /tmp/loot/

stat -c '%n %a %U:%G' /tmp/target/.ssh/id_rsa /tmp/loot/.ssh/id_rsa
diff <(find /tmp/target -printf '%p %m\\n' | sort) \\
     <(find /tmp/loot   -printf '%p %m\\n' | sed 's|/tmp/loot|/tmp/target|' | sort) \\
  && echo "[+] estrutura idêntica"

shred -uvz /tmp/target/.ssh/id_rsa /tmp/target/.env
ls -la /tmp/target/.ssh/ /tmp/target/`}
        expected={`/tmp/target/.ssh/id_rsa 600 wallyson:wallyson
/tmp/loot/.ssh/id_rsa 600 wallyson:wallyson
[+] estrutura idêntica
shred: /tmp/target/.ssh/id_rsa: pass 1/4 (random)...
shred: /tmp/target/.ssh/id_rsa: removing
total 0`}
        verify="loot mantém perms 600 e ownership; originais não existem mais. Em pentest real, o loot vai criptografado (gpg/age) antes de sair da rede."
      />

      <AlertBox type="info" title="Resumo: ferramenta certa para a tarefa">
        <p>
          <strong>cp -a</strong> para backup/loot. <strong>rsync -aAX</strong> para sync e
          backup grande. <strong>mv</strong> dentro do mesmo FS para rename atômico.
          <strong> rm -rf</strong> só onde você TEM CERTEZA. <strong>chattr +i</strong> para
          travar arquivo (cuidado: red flag forense). <strong>shred</strong> para HDD; em SSD
          criptografe antes ou use <code>blkdiscard</code>.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
