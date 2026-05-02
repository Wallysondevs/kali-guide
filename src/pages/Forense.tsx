import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Forense() {
  return (
    <PageContainer
      title="Forense Digital — visão geral"
      subtitle="Cadeia de custódia, imagem bit a bit, hash de integridade, montagem read-only, timeline."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Princípios da cadeia de custódia</h2>
      <ol>
        <li><strong>Não modifique a evidência</strong>: monte read-only, use write blockers físicos.</li>
        <li><strong>Hash antes e depois</strong>: SHA-256 da evidência prova integridade.</li>
        <li><strong>Trabalhe SEMPRE em uma cópia</strong>: a evidência original fica selada.</li>
        <li><strong>Documente tudo</strong>: comandos, timestamps, ferramentas, versões.</li>
      </ol>

      <h2>Imagem bit a bit (dd / dcfldd / ewfacquire)</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            comment: "dd clássico — sem feedback",
            cmd: "sudo dd if=/dev/sdb of=evidencia.dd bs=4M conv=noerror,sync status=progress",
            out: `15032385536 bytes (15 GB, 14 GiB) copied, 142 s, 105 MB/s
3818+0 records in
3818+0 records out
16022896640 bytes (16 GB, 15 GiB) copied, 152.2 s, 105 MB/s`,
            outType: "info",
          },
          {
            comment: "dcfldd — feedback + hash inline (recomendado)",
            cmd: `sudo dcfldd if=/dev/sdb of=evidencia.dd hash=sha256 hashlog=evidencia.sha256 bs=4M`,
            out: `28672 blocks (114688Mb) written.
Total (sha256): 8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...
3818+0 records in
3818+0 records out`,
            outType: "success",
          },
          {
            comment: "EWF (Expert Witness Format) — comprime + hash + metadata",
            cmd: "sudo ewfacquire /dev/sdb",
            out: `ewfacquire 20240701

Acquiry parameters required, please provide the necessary input
Image path and filename: evidencia
Case number: 001-2026
Description: Disco do suspeito X
Examiner name: Wallyson Lopes
Evidence number: E001
Notes: Disco extraído do laptop XYZ em 2026-04-03 14:00
Media type (auto, fixed, removable, optical, memory, [auto]): fixed
Media characteristics: physical
Use compression (none, empty-block, fast, best, [empty-block]): best
Acquiry start offset (0): 0
Number of bytes to acquire (default is all): 
Evidence segment file size (in bytes [1.4 GB]): 
Block size (sectors per read [64]): 
Error granularity (sectors per read [64]): 
Number of retries on read error [2]: 
Wipe sectors on read error (mimic EnCase like behavior) (yes, no, [no]): no

The following information was provided:
Image path and filename:    evidencia.E01
[...]
Continue acquisition with these values (yes, no) [yes]: yes

Acquiry started at: Fri Apr  3 14:23:11 2026
Status: at 12% (1932735283 out of 16022896640 bytes)
        completed in 14 second(s) with 138 MB/s
        approximately 1 minute(s) and 41 second(s) remaining

[...]
Acquiry completed at: Fri Apr  3 14:24:50 2026
Written: 16 GB
MD5 hash:    a82c34d4c1...
SHA1 hash:   8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b...`,
            outType: "warning",
          },
        ]}
      />

      <h2>Validar hash</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            cmd: "sudo sha256sum /dev/sdb",
            out: "8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b1234567890abcdef...  /dev/sdb",
            outType: "info",
          },
          {
            cmd: "sha256sum evidencia.dd",
            out: "8c6f4a3d7e9c1b5f2a8c6f4a3d7e9c1b1234567890abcdef...  evidencia.dd",
            outType: "success",
          },
          {
            comment: "ambos iguais = imagem íntegra. Documente isso no laudo.",
            cmd: "echo \"Hash original e cópia coincidem em $(date)\" >> caderno.log",
            out: "",
            outType: "muted",
          },
        ]}
      />

      <h2>Montar read-only</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            comment: "1) identificar partições da imagem",
            cmd: "mmls evidencia.dd",
            out: `DOS Partition Table
Offset Sector: 0
Units are in 512-byte sectors

      Slot      Start        End          Length       Description
000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)
001:  -------   0000000000   0000002047   0000002048   Unallocated
002:  000:000   0000002048   0000206847   0000204800   FAT16 (0x0e)
003:  000:001   0000206848   0031293439   0031086592   NTFS / exFAT (0x07)
004:  -------   0031293440   0031293439   0000000000   Unallocated`,
            outType: "info",
          },
          {
            comment: "2) calcular offset (start * 512)",
            cmd: "echo $((206848 * 512))",
            out: "105906176",
            outType: "default",
          },
          {
            comment: "3) montar a partição NTFS read-only",
            cmd: "mkdir mnt && sudo mount -o ro,loop,offset=105906176,show_sys_files,streams_interface=windows evidencia.dd mnt/",
            out: "(silencioso = sucesso)",
            outType: "success",
          },
          {
            cmd: "ls mnt/",
            out: `\\$Recycle.Bin   \\$WINDOWS.~BT   Documents and Settings   PerfLogs   Program Files   Program Files (x86)
ProgramData   Recovery   System Volume Information   Users   Windows`,
            outType: "default",
          },
          {
            comment: "4) navegar como leitura. Não escreve nada na imagem.",
            cmd: "ls mnt/Users/",
            out: `Administrator   Default   Default User   desktop.ini   Public   suspeito`,
            outType: "default",
          },
        ]}
      />

      <h2>Triagem rápida — scrounge & strings</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            comment: "buscar emails na imagem inteira",
            cmd: "strings -a evidencia.dd | grep -E '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' | sort -u | head",
            out: `admin@empresa.com
ana.silva@empresa.com
contato@gmail.com
joao.dev@hotmail.com
maria@empresa.com`,
            outType: "warning",
          },
          {
            comment: "buscar URLs",
            cmd: "strings -a evidencia.dd | grep -Eo 'https?://[^[:space:]\"]+' | sort -u | head",
            out: `https://drive.google.com/drive/folders/abc123
https://mega.nz/folder/xyz456
https://onlyfiles.io/private/secret-zip-789
https://wormhole.app/transfer/...`,
            outType: "warning",
          },
          {
            comment: "buscar coordenadas GPS / chaves AWS / private SSH",
            cmd: "grep -aE '(AKIA[0-9A-Z]{16}|-----BEGIN.*PRIVATE KEY-----|[+-]?[0-9]{1,3}\\.[0-9]{4,}, *[+-]?[0-9]{1,3}\\.[0-9]{4,})' evidencia.dd | head",
            out: `AKIA<EXEMPLO_FAKE_6>                       (AWS access key ID)
-----BEGIN OPENSSH PRIVATE KEY-----        (chave privada exposta)
-23.5453,-46.6428                          (coordenadas, São Paulo)`,
            outType: "error",
          },
        ]}
      />

      <h2>File carving (recuperar arquivos apagados)</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            cmd: "sudo apt install -y foremost scalpel testdisk",
            out: "(3 ferramentas — escolha pela situação)",
            outType: "muted",
          },
          {
            cmd: "foremost -i evidencia.dd -o saida_foremost",
            out: `Processing: evidencia.dd
|*|

Foremost finished at Fri Apr 3 14:48:21 2026

(saida_foremost/ contém:)
audit.txt        gif/             jpg/             ole/
zip/             pdf/             rar/             rif/
exe/             htm/             mov/             txt/`,
            outType: "info",
          },
          {
            cmd: "ls saida_foremost/jpg/ | head -5",
            out: `00000234.jpg     00000235.jpg     00000236.jpg     00000237.jpg     00000238.jpg`,
            outType: "default",
          },
          {
            cmd: "wc -l saida_foremost/audit.txt && head saida_foremost/audit.txt",
            out: `1234 saida_foremost/audit.txt
Foremost version 1.5.7 by Jesse Kornblum, Kris Kendall, and Nick Mikus

Audit File

Foremost started at Fri Apr 3 14:43:11 2026
Invocation: foremost -i evidencia.dd -o saida_foremost 
Output directory: /home/wallyson/casos/caso-001/saida_foremost
Configuration file: /etc/foremost.conf

File: evidencia.dd
Start: Fri Apr  3 14:43:11 2026
Length: 16 GB (16022896640 bytes)

Num	 Name (bs=512)	     Size	 File Offset	 Comment
0:	00000234.jpg 	      245 KB	 412348928	`,
            outType: "default",
          },
        ]}
      />

      <h2>Sleuthkit — análise por arquivo/inode</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            comment: "fls = file listing (inclui apagados marcados com *)",
            cmd: "fls -r -o 206848 evidencia.dd | head -10",
            out: `r/r 5: $AttrDef
r/r 6: $BadClus
r/r 7: $Bitmap
r/r 8: $Boot
d/d 11: $Extend
r/r 9: $LogFile
r/r 0: $MFT
r/r 4: $MFTMirr
r/r 10: $Secure
r/r 12: $UpCase
* r/r 1234: arquivo_secreto.docx     ← APAGADO`,
            outType: "warning",
          },
          {
            comment: "icat = ler conteúdo de um inode (ressuscitar arquivo apagado)",
            cmd: "icat -o 206848 evidencia.dd 1234 > arquivo_secreto.docx",
            out: "(salva o conteúdo bruto do arquivo apagado em disco)",
            outType: "success",
          },
          {
            cmd: "file arquivo_secreto.docx",
            out: "arquivo_secreto.docx: Microsoft Word 2007+",
            outType: "info",
          },
        ]}
      />

      <h2>Timeline (Plaso/log2timeline)</h2>
      <Terminal
        path="~/casos/caso-001"
        lines={[
          {
            cmd: "sudo apt install -y plaso-tools",
            out: "(log2timeline.py + psort.py)",
            outType: "muted",
          },
          {
            cmd: "log2timeline.py --partition all timeline.plaso evidencia.dd",
            out: `Source path             : evidencia.dd
Source type             : storage media image
Processing started.

Found a partition: p1, Type: ntfs, Offset 105906176
Processing source.

Number of warnings: 12
Number of errors: 0

Processing completed.`,
            outType: "info",
          },
          {
            cmd: "psort.py -o l2tcsv -w timeline.csv timeline.plaso",
            out: `[INFO] (MainProcess) Loading container...
[INFO] (MainProcess) Sorting events.
[INFO] (MainProcess) Output writer: l2tcsv
[INFO] (MainProcess) [psort] Storage processing finished.
Number of events processed: 421847`,
            outType: "success",
          },
          {
            comment: "agora você tem CSV com TODOS os eventos do disco em ordem cronológica",
            cmd: "head -5 timeline.csv",
            out: `date,time,timezone,MACB,source,sourcetype,type,user,host,short,desc,...
04/03/2026,12:14:23,UTC,M...,FILE,NTFS,Created,suspeito,DESKTOP-XYZ,arquivo_secreto.docx criado,/Users/suspeito/Documents/arquivo_secreto.docx,...
04/03/2026,12:14:42,UTC,M...,FILE,NTFS,Modified,suspeito,DESKTOP-XYZ,Editado,/Users/suspeito/Documents/arquivo_secreto.docx,...`,
            outType: "default",
          },
        ]}
      />

      <h2>Stack forense Kali</h2>
      <CommandTable
        title="Ferramentas por categoria"
        variations={[
          { cmd: "Aquisição", desc: "dd, dcfldd, ewfacquire (.E01), guymager.", output: "Imagem bit a bit." },
          { cmd: "Inspeção FS", desc: "sleuthkit (mmls, fls, icat), TSK + autopsy GUI.", output: "Página: Autopsy" },
          { cmd: "Carving", desc: "foremost, scalpel, photorec, bulk_extractor.", output: "Recuperar arquivos apagados." },
          { cmd: "Memória", desc: "volatility 3, dwarf2json.", output: "Página: Volatility" },
          { cmd: "Logs Windows", desc: "evtxtools, python-evtx, EVTX-ATTACK-SAMPLES.", output: "Para parsear .evtx." },
          { cmd: "Logs Linux", desc: "auditd, journalctl, syslog parse.", output: "Útil em compromise IR." },
          { cmd: "Browser", desc: "hindsight (Chrome), libfwsi-tools.", output: "Histórico, downloads, cookies." },
          { cmd: "Mobile", desc: "ALEAPP (Android), iLEAPP (iOS).", output: "Plataformas mobile." },
          { cmd: "Disk metadata", desc: "exiftool, file, binwalk.", output: "Metadados de qualquer arquivo." },
          { cmd: "Timeline", desc: "log2timeline / plaso, mactime.", output: "Linha do tempo de eventos." },
        ]}
      />

      <CodeBlock
        language="bash"
        title="checklist primeiro caso forense"
        code={`# 1. Documentar contexto (quem, quando, onde)
echo "Caso 001 — Aquisição em $(date) por $(whoami)" > caderno.log
hwinfo --disk >> caderno.log

# 2. Hash do dispositivo original (sem modificar)
sudo sha256sum /dev/sdb | tee -a caderno.log

# 3. Aquisição com hash inline
sudo dcfldd if=/dev/sdb of=evidencia.dd hash=sha256 hashlog=evidencia.sha256 bs=4M

# 4. Validar hash da cópia
sha256sum evidencia.dd | tee -a caderno.log

# 5. Selar a evidência original. A partir daqui só trabalhe na cópia.
sudo umount /dev/sdb1 2>/dev/null
echo "Evidência selada em $(date). Cópia em evidencia.dd. Hashes batem." >> caderno.log

# 6. Montar read-only
mkdir mnt
mmls evidencia.dd
sudo mount -o ro,loop,offset=$((START_SECTOR * 512)) evidencia.dd mnt/

# 7. Triagem rápida
strings -a evidencia.dd > strings.txt
foremost -i evidencia.dd -o carved/

# 8. Análise dirigida pelo caso (timeline, registros, browser, etc.)
log2timeline.py --partition all timeline.plaso evidencia.dd
psort.py -o l2tcsv -w timeline.csv timeline.plaso`}
      />

      <PracticeBox
        title="Mini caso — pendrive simulado"
        goal="Praticar fluxo completo de aquisição → carving → triagem em um pendrive seu (sem dados sensíveis)."
        steps={[
          "Insira um pendrive (NÃO MONTE).",
          "Identifique device com lsblk.",
          "Faça hash do device original.",
          "Aquisição com dcfldd.",
          "Valide hash da cópia.",
          "Rode foremost em cima da cópia.",
        ]}
        command={`lsblk
DEV=/dev/sdb     # ajuste!

sudo sha256sum $DEV | tee hash_original.txt

sudo dcfldd if=$DEV of=pendrive.dd hash=sha256 hashlog=pendrive.hash bs=4M

sha256sum pendrive.dd | tee hash_copia.txt
diff <(awk '{print $1}' hash_original.txt) <(awk '{print $1}' hash_copia.txt) \\
  && echo "INTEGRIDADE OK" || echo "ERRO! HASHES DIFEREM"

mkdir carved
foremost -i pendrive.dd -o carved/
ls carved/`}
        expected={`(hashes idênticos)
INTEGRIDADE OK

(foremost):
Processing: pendrive.dd
audit.txt        jpg/             pdf/             zip/

(carved/jpg, /pdf etc terão arquivos previamente apagados que ainda estavam no espaço livre)`}
        verify="Veja em carved/audit.txt quantos arquivos foram recuperados. Pendrives usados costumam ter centenas de fotos antigas no espaço livre."
      />

      <AlertBox type="danger" title="Sempre trabalhe em cópia">
        Modificar a evidência original (mesmo sem querer, ao montar RW) anula a cadeia
        de custódia em juízo. Use <code>mount -o ro</code> sempre, ou hardware write blocker
        (Tableau Forensic Bridge, FastBloc).
      </AlertBox>
    </PageContainer>
  );
}
