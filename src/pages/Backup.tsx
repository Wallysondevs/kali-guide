import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Backup() {
  return (
    <PageContainer
      title="Backup — rsync, tar, borg, restic"
      subtitle="Estratégias de backup do dia-a-dia até dedup criptografado. Essencial para sobreviver a um C2 explodindo no meio de um engagement."
      difficulty="intermediario"
      timeToRead="18 min"
    >
      <h2>Por que pentester precisa de backup sério</h2>
      <p>
        Sua máquina de C2 morre no meio do engagement. Você perde: implants gerados, sessions
        ativas, screenshots, notas, certificados de redirector, wordlists customizadas. <strong>Backup
        não é opcional</strong>. Mas backup pentester tem requisitos especiais: precisa ser
        <strong>criptografado</strong> (loot é confidencial), <strong>incremental</strong> (não
        dá para upload de 50G todo dia) e <strong>versionado</strong> (rollback se você
        sobrescreveu um implant funcionando).
      </p>

      <AlertBox type="warning" title="Regra 3-2-1">
        <p>
          <strong>3</strong> cópias dos dados, em <strong>2</strong> mídias diferentes, sendo{" "}
          <strong>1</strong> off-site. Para pentester: laptop (1) + HD externo LUKS (2) + bucket
          S3/Wasabi criptografado com restic (3, off-site). Sem isso, um <code>rm -rf</code> bêbado
          encerra sua semana.
        </p>
      </AlertBox>

      <h2>rsync — o canivete suíço</h2>
      <p>
        <strong>rsync</strong> é o padrão para sync local ou via SSH. Faz delta (só transfere o
        que mudou), preserva permissões/timestamps/symlinks, suporta excludes e — combinado com
        <code>--link-dest</code> — faz snapshots por hardlink praticamente sem custo de espaço.
      </p>

      <CommandTable
        title="rsync: flags essenciais"
        variations={[
          { cmd: "-a (archive)", desc: "= -rlptgoD: recursivo, links, perms, timestamps, group, owner, devices.", output: "Quase sempre você quer -a." },
          { cmd: "-v / -vv", desc: "Verbose (uma vez = sumário; duas = lista cada arquivo).", output: "Útil para debug." },
          { cmd: "-z", desc: "Compressão durante transferência (útil só em rede lenta).", output: "Ignore em rede local 1Gbps+." },
          { cmd: "-P", desc: "= --partial --progress: barra de progresso e retoma transferência cortada.", output: "Sempre use em transferências longas." },
          { cmd: "-h", desc: "Tamanhos human-readable (1.2G em vez de 1234567890).", output: "Quase obrigatório para ler a saída." },
          { cmd: "-n / --dry-run", desc: "Simula. Nada é transferido. CRUCIAL antes de --delete.", output: "rsync -avhn ... mostra exatamente o que faria." },
          { cmd: "--delete", desc: "Apaga no destino o que não existe na origem (sync verdadeiro).", output: "PERIGOSO sem -n primeiro." },
          { cmd: "--exclude='*.log'", desc: "Pula padrão. Pode ter múltiplos --exclude.", output: "--exclude-from=ignore.txt para vários patterns." },
          { cmd: "--link-dest=DIR", desc: "Hardlink arquivos não-modificados para DIR (snapshot incremental barato).", output: "Base do estilo Time Machine no Linux." },
          { cmd: "-e 'ssh -p 2222'", desc: "Customiza comando de transporte (porta SSH alternativa, key específica).", output: "rsync -ave 'ssh -i ~/.ssh/c2_key' src/ user@host:/dst/" },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "backup local: ~/loot → HD externo LUKS montado",
            cmd: "rsync -avhP --delete --exclude='*.tmp' ~/loot/ /mnt/loot/backup/",
            out: `sending incremental file list
loot/notes/
loot/notes/engagement-acme.md
        12,438 100%    1.18MB/s    0:00:00 (xfr#1, to-chk=14/16)
loot/dumps/
loot/dumps/ntds.dit
    23,456,789 100%   85.40MB/s    0:00:00 (xfr#2, to-chk=12/16)
[...]
sent 89.2M bytes  received 1.2K bytes  17.84M bytes/sec
total size is 89.2M  speedup is 1.00`,
            outType: "success",
          },
          {
            comment: "backup remoto via SSH (servidor de C2 → laptop)",
            cmd: "rsync -avhPz -e 'ssh -i ~/.ssh/c2_key -p 2222' c2admin@c2.opfor.io:/srv/sliver/ ~/backup/sliver/",
            out: `sending incremental file list
sliver/configs/
sliver/configs/server.cfg
sliver/sessions.db
[...]
total size is 412.3M  speedup is 1.04`,
            outType: "info",
          },
          {
            comment: "snapshot incremental estilo Time Machine",
            cmd: "rsync -avh --delete --link-dest=/backup/2026-04-02 ~/loot/ /backup/2026-04-03/",
            out: `(arquivos não-modificados são hardlinks → ocupam 0 bytes adicionais)
total size is 89.2M  speedup is 89.20`,
            outType: "warning",
          },
        ]}
      />

      <h2>Excludes: arquivo de regras</h2>
      <CodeBlock
        language="bash"
        title="~/.config/rsync-ignore.txt"
        code={`# caches gigantes que não interessam
**/__pycache__/
**/node_modules/
**/.cache/
**/.venv/

# tudo de tmp
*.tmp
*.swp
*~
.DS_Store

# logs antigos
*.log.*
*.gz

# meu próprio backup local não entra no backup remoto
backup/`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "rsync -avhP --delete --exclude-from=~/.config/rsync-ignore.txt ~/ /mnt/backup/laptop/",
            out: "(transferência limpa, sem lixo)",
            outType: "muted",
          },
        ]}
      />

      <h2>Script de snapshot diário (cron)</h2>
      <CodeBlock
        language="bash"
        title="~/bin/snapshot-loot.sh"
        code={`#!/usr/bin/env bash
set -euo pipefail

SRC="$HOME/loot/"
DEST_BASE="/mnt/loot/snapshots"
TODAY="$(date +%Y-%m-%d)"
LATEST="$DEST_BASE/latest"
NEW="$DEST_BASE/$TODAY"

mkdir -p "$DEST_BASE"

# se existe um "latest", usa como base de hardlink
if [ -d "$LATEST" ]; then
    rsync -ah --delete \\
          --link-dest="$LATEST" \\
          --exclude-from="$HOME/.config/rsync-ignore.txt" \\
          "$SRC" "$NEW/"
else
    rsync -ah --delete \\
          --exclude-from="$HOME/.config/rsync-ignore.txt" \\
          "$SRC" "$NEW/"
fi

# atualiza ponteiro 'latest'
rm -f "$LATEST"
ln -s "$NEW" "$LATEST"

# mantém apenas últimos 14 snapshots
cd "$DEST_BASE"
ls -1d 20*/ 2>/dev/null | sort | head -n -14 | xargs -r rm -rf

echo "[OK] snapshot $TODAY criado em $NEW"`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "chmod +x ~/bin/snapshot-loot.sh && (crontab -l; echo '0 3 * * * /home/wallyson/bin/snapshot-loot.sh >> /home/wallyson/.snapshot.log 2>&1') | crontab -",
            out: "(silencioso = cron diário às 3h da manhã)",
            outType: "success",
          },
        ]}
      />

      <h2>tar — empacotar e mover</h2>
      <CommandTable
        title="tar: variações úteis"
        variations={[
          { cmd: "tar -czvf bkp.tar.gz dir/", desc: "Criar gzip (rápido, compressão moderada).", output: "Bom default para upload pequeno." },
          { cmd: "tar -cJvf bkp.tar.xz dir/", desc: "Criar xz (lento mas comprime mais).", output: "Bom para arquivos de longo prazo." },
          { cmd: "tar --use-compress-program=zstd -cvf bkp.tar.zst dir/", desc: "zstd (rápido + bom ratio, moderno).", output: "Ideal para backups grandes." },
          { cmd: "tar -tvf bkp.tar.gz", desc: "Listar conteúdo sem extrair.", output: "Confere antes de restore." },
          { cmd: "tar -xzvf bkp.tar.gz -C /restore/", desc: "Extrair em diretório específico.", output: "" },
          { cmd: "tar -czvf - dir/ | ssh host 'cat > /backup/bkp.tar.gz'", desc: "Stream para outro host (sem disco intermediário).", output: "Útil em exfil/backup direto SSH." },
          { cmd: "tar --listed-incremental=snap.snar -czvf bkp1.tar.gz dir/", desc: "Backup incremental tar puro (level 0+).", output: "Cada execução grava só o diff. Pouca gente usa." },
        ]}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "comparação prática de algoritmos no mesmo input (loot ~500MB)",
            cmd: "for alg in gzip bzip2 xz zstd; do echo \"== $alg ==\"; time tar --use-compress-program=$alg -cf /tmp/bkp.$alg ~/loot/; ls -lh /tmp/bkp.$alg; done",
            out: `== gzip ==
real    0m11.4s   /tmp/bkp.gzip   312M
== bzip2 ==
real    1m02.8s  /tmp/bkp.bzip2   281M
== xz ==
real    2m45.1s  /tmp/bkp.xz      241M
== zstd ==
real    0m04.2s  /tmp/bkp.zstd   289M`,
            outType: "info",
          },
        ]}
      />

      <p>
        Conclusão prática: <strong>zstd</strong> ganha em quase todo cenário moderno (rápido +
        comprime quase como xz). Use <code>xz -9</code> só para arquivamento de longo prazo.
      </p>

      <h2>borg — backup deduplicado e criptografado</h2>
      <p>
        <strong>BorgBackup</strong> é o que você quer para backup sério: dedup global (blocos
        idênticos só uma vez), compressão integrada, criptografia AES-256, append-only mode
        (cliente comprometido não destrói archives antigos no servidor).
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y borgbackup",
            out: "borgbackup já é a versão mais nova.",
            outType: "muted",
          },
          {
            comment: "1) inicializar repo (criptografia keyfile-blake2)",
            cmd: "borg init --encryption=keyfile-blake2 /mnt/loot/borgrepo",
            out: `Enter new passphrase:
Enter same passphrase again:
By default repositories initialized with this version will produce security
errors if written to with an older version (up to and including Borg 1.0.8).
IMPORTANT: you will need both KEY AND PASSPHRASE to access this repo!`,
            outType: "warning",
          },
          {
            comment: "2) primeiro backup (full implícito, mas com dedup)",
            cmd: "borg create --stats --progress /mnt/loot/borgrepo::engagement-acme-{now} ~/loot ~/notes",
            out: `------------------------------------------------------------------------------
Archive name: engagement-acme-2026-04-03T14:22:18
Time (start): Fri, 2026-04-03 14:22:18
Duration: 12.4 seconds
Number of files: 1842
Utilization of max. archive size: 0%
------------------------------------------------------------------------------
                       Original size      Compressed size    Deduplicated size
This archive:                412.3 MB             318.7 MB            312.1 MB
All archives:                412.3 MB             318.7 MB            312.1 MB
                       Unique chunks         Total chunks
Chunk index:                    8421                 8421
------------------------------------------------------------------------------`,
            outType: "success",
          },
          {
            comment: "3) backup do dia seguinte (só envia o diff!)",
            cmd: "borg create --stats /mnt/loot/borgrepo::engagement-acme-{now} ~/loot ~/notes",
            out: `------------------------------------------------------------------------------
This archive:                418.7 MB             324.1 MB              6.4 MB
All archives:                831.0 MB             642.8 MB            318.5 MB
------------------------------------------------------------------------------`,
            outType: "info",
          },
          {
            cmd: "borg list /mnt/loot/borgrepo",
            out: `engagement-acme-2026-04-03T14:22:18  Fri, 2026-04-03 14:22:18 [a3f2...]
engagement-acme-2026-04-04T14:25:01  Sat, 2026-04-04 14:25:01 [b1c9...]`,
            outType: "default",
          },
          {
            comment: "restaurar arquivo específico de archive específico",
            cmd: "borg extract /mnt/loot/borgrepo::engagement-acme-2026-04-03T14:22:18 home/wallyson/loot/dumps/ntds.dit",
            out: "(extrai mantendo a estrutura relativa)",
            outType: "muted",
          },
          {
            comment: "rotação automática (manter 7 diários, 4 semanais, 6 mensais)",
            cmd: "borg prune --keep-daily=7 --keep-weekly=4 --keep-monthly=6 /mnt/loot/borgrepo",
            out: `Keeping archive: engagement-acme-2026-04-04T14:25:01
Pruning archive: engagement-acme-2026-03-15T14:21:43`,
            outType: "warning",
          },
        ]}
      />

      <h2>restic — alternativa moderna (Go, single binary, S3-friendly)</h2>
      <p>
        <strong>restic</strong> tem filosofia parecida com borg mas binário único Go e suporte
        nativo a S3, B2, Azure, GCS, REST server. Ideal para off-site em bucket criptografado.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y restic",
            out: "Setting up restic (0.16.4-1)",
            outType: "muted",
          },
          {
            comment: "1) repo em bucket S3 (Wasabi, Backblaze B2, AWS, MinIO)",
            cmd: "export RESTIC_REPOSITORY=s3:s3.wasabisys.com/pentest-bkp && export RESTIC_PASSWORD=$(pass show backup/restic) && restic init",
            out: `created restic repository abc123def456 at s3:s3.wasabisys.com/pentest-bkp

Please note that knowledge of your password is required to access
the repository. Losing your password means that your data is
irrecoverably lost.`,
            outType: "success",
          },
          {
            cmd: "restic backup ~/loot ~/notes --tag engagement-acme --exclude-file ~/.config/restic-ignore",
            out: `repository abc123de opened (version 2, compression level auto)
using parent snapshot 7d4f1a2e
[0:42] 100.00%  1842 files  412.3 MiB, total 412.3 MiB

Files:        1842 new,      0 changed,      0 unmodified
Dirs:           42 new,      0 changed,      0 unmodified
Added to the repository: 312.1 MiB (218.4 MiB stored)

snapshot 8e2f5a91 saved`,
            outType: "info",
          },
          {
            cmd: "restic snapshots --tag engagement-acme",
            out: `ID        Time                 Host         Tags               Paths
----------------------------------------------------------------------
8e2f5a91  2026-04-03 14:30:15  kali-laptop  engagement-acme    /home/wallyson/loot
                                                               /home/wallyson/notes`,
            outType: "default",
          },
          {
            cmd: "restic restore 8e2f5a91 --target /tmp/restore --include /home/wallyson/loot/dumps",
            out: `restoring <Snapshot 8e2f5a91> to /tmp/restore
[0:08] 100.00%  84 files  84.2 MiB, total 84.2 MiB`,
            outType: "warning",
          },
          {
            cmd: "restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune",
            out: `Applying Policy: keep 7 daily, 4 weekly, 6 monthly snapshots
keep 11 snapshots, remove 23 snapshots
[3:42] 100.00%  cleaning up`,
            outType: "muted",
          },
        ]}
      />

      <AlertBox type="success" title="rsync vs borg vs restic — qual usar?">
        <p>
          <strong>rsync</strong>: cópia simples, 1 → 1, hardlink snapshots quando o destino é
          confiável. <strong>borg</strong>: melhor ratio dedup/compress, append-only, repo local
          ou via SSH. <strong>restic</strong>: igual ao borg em filosofia mas com backends de
          nuvem nativos. Combinação real-world: rsync para HD externo do dia + restic para S3
          off-site semanal.
        </p>
      </AlertBox>

      <h2>Verificar integridade (sempre)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "borg check --verify-data /mnt/loot/borgrepo",
            out: `Starting repository check
Starting repository index check
Completed repository check, no problems found.
Starting archive consistency check...
Analyzing archive engagement-acme-2026-04-04T14:25:01 (1/2)
Analyzing archive engagement-acme-2026-04-03T14:22:18 (2/2)
Archive consistency check complete, no problems found.`,
            outType: "success",
          },
          {
            cmd: "restic check --read-data-subset=10%",
            out: `using temporary cache in /tmp/restic-check-cache-918273
created new cache in /tmp/restic-check-cache-918273
create exclusive lock for repository
load indexes
check all packs
check snapshots, trees and blobs
read 10% of data packs
no errors were found`,
            outType: "info",
          },
        ]}
      />

      <PracticeBox
        title="Setup de backup tier 1 — em 5 minutos"
        goal="Configurar restic para backup diário criptografado em bucket S3 (ou MinIO local de teste), com retenção e verificação."
        steps={[
          "Subir MinIO local em Docker (ou usar S3 real).",
          "Inicializar repo restic.",
          "Backup com tag.",
          "Configurar systemd timer diário.",
          "Validar com restic check.",
        ]}
        command={`# 1) MinIO de teste (substitua por bucket S3 real em produção)
docker run -d --name minio -p 9000:9000 \\
  -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=admin12345 \\
  minio/minio server /data

# criar bucket
docker exec minio mc alias set local http://127.0.0.1:9000 admin admin12345
docker exec minio mc mb local/pentest-bkp

# 2) variáveis de ambiente
export AWS_ACCESS_KEY_ID=admin
export AWS_SECRET_ACCESS_KEY=admin12345
export RESTIC_REPOSITORY=s3:http://127.0.0.1:9000/pentest-bkp
export RESTIC_PASSWORD='senha-forte-aqui'

# 3) init + primeiro backup
restic init
restic backup ~/loot --tag manual-test

# 4) listar e validar
restic snapshots
restic check`}
        expected={`created restic repository ... at s3:http://127.0.0.1:9000/pentest-bkp
Files:        N new
snapshot xxxxxxxx saved
no errors were found`}
        verify="Você consegue listar snapshots, fazer restore parcial e o check passa sem erro. Agora replique apontando para Wasabi/B2 com credenciais reais."
      />

      <AlertBox type="danger" title="Senha do repo = tudo">
        <p>
          Se você perder a senha do borg/restic, os dados estão{" "}
          <strong>irrecuperavelmente perdidos</strong>. Não é exagero. Use um password manager
          (pass, KeePassXC, Bitwarden) e tenha cópia física em local seguro.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
