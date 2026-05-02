import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Multimedia() {
  return (
    <PageContainer
      title="Multimídia & OSINT em Mídia"
      subtitle="ffmpeg, ImageMagick, exiftool e sox: manipular áudio/vídeo/imagem e extrair metadados que delatam alvos."
      difficulty="intermediario"
      timeToRead="16 min"
    >
      <h2>Por que isto é OSINT puro</h2>
      <p>
        Toda foto tirada por celular, todo PDF gerado pelo Word, toda gravação de Zoom carrega{" "}
        <strong>metadados</strong> — geolocalização GPS, modelo do dispositivo, software,
        usuário do sistema, datas. Em OSINT/recon de alvo, <code>exiftool</code> é tão
        importante quanto <code>nmap</code>. Já <code>ffmpeg</code> e <code>imagemagick</code>{" "}
        servem para preparar evidências de pentest (cortar vídeo de PoC, redimensionar
        screenshot para o relatório, gerar deepfake básico para teste de phishing por vídeo).
      </p>

      <h2>exiftool — o canivete suíço de metadados</h2>
      <Terminal
        path="~/recon"
        lines={[
          {
            cmd: "sudo apt install -y libimage-exiftool-perl",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "exiftool foto_alvo.jpg",
            out: `ExifTool Version Number         : 12.76
File Name                       : foto_alvo.jpg
Directory                       : .
File Size                       : 4.2 MB
File Modification Date/Time     : 2026:03:18 14:32:09-03:00
File Type                       : JPEG
MIME Type                       : image/jpeg
Make                            : Apple
Camera Model Name               : iPhone 15 Pro
Software                        : 17.4.1
Date/Time Original              : 2026:03:18 14:32:09
Lens Model                      : iPhone 15 Pro back triple camera 6.86mm f/1.78
GPS Latitude                    : 23 deg 33' 1.20" S
GPS Longitude                   : 46 deg 38' 32.40" W
GPS Altitude                    : 760.4 m Above Sea Level
GPS Date/Time                   : 2026:03:18 17:32:08Z
Owner Name                      : Joao da Silva
Image Description               : reuniao trimestral RH
Subject                         : interno`,
            outType: "warning",
          },
          {
            comment: "alvo postou foto — agora você sabe iPhone, iOS exato, GPS E o nome do dono",
            cmd: "exiftool -GPS:all -coordFormat '%.6f' foto_alvo.jpg",
            out: `GPS Latitude                    : -23.550333
GPS Longitude                   : -46.642333
GPS Altitude                    : 760.4 m
# cole no Google Maps: -23.550333, -46.642333  (Av. Paulista, SP)`,
            outType: "warning",
          },
        ]}
      />

      <CommandTable
        title="exiftool — comandos essenciais"
        variations={[
          { cmd: "exiftool *.jpg", desc: "Dump completo de todos JPG da pasta.", output: "Centenas de campos por arquivo." },
          { cmd: "exiftool -s -G arq.jpg", desc: "Mostra grupo (EXIF/IPTC/XMP) e nome curto. Bom para automação.", output: "[EXIF] GPSLatitude : ..." },
          { cmd: "exiftool -j arq.jpg > meta.json", desc: "Saída JSON — pipe pra jq, banco, etc.", output: "JSON pronto para script." },
          { cmd: "exiftool -csv *.jpg > batch.csv", desc: "Tabela CSV de batch (ótimo para Excel/relatório).", output: "Uma linha por arquivo." },
          { cmd: "exiftool -if '$GPSLatitude' -filename -GPSPosition *.jpg", desc: "Lista SÓ os JPGs com GPS embutido.", output: "Filtra os que vão expor localização." },
          { cmd: "exiftool -all= -overwrite_original arq.jpg", desc: "REMOVE todos metadados (sanitiza imagem antes de publicar).", output: "Use ANTES de subir foto sua." },
          { cmd: "exiftool '-GPSLongitude=' '-GPSLatitude=' arq.jpg", desc: "Remove só o GPS, mantém resto.", output: "Sanitização cirúrgica." },
          { cmd: "exiftool -Comment='owned' arq.jpg", desc: "Escreve um comentário (testar steg simples).", output: "Modificou só o campo Comment." },
          { cmd: "exiftool -r -ext jpg /pasta", desc: "Recursivo, só JPG. Útil em scrap de site inteiro.", output: "Varre toda a árvore." },
          { cmd: "exiftool documento.pdf", desc: "Funciona em PDF, DOCX, MP3, MP4, etc.", output: "Author: jsilva, Producer: Microsoft Word..." },
        ]}
      />

      <Terminal
        path="~/recon/empresa-alvo"
        lines={[
          {
            comment: "scrapeou 80 PDFs do site da empresa — quem escreveu cada um?",
            cmd: "exiftool -T -FileName -Author -Creator -Producer *.pdf | head -10",
            out: `whitepaper-2025.pdf	jsilva	Microsoft Word	Adobe PDF Library 17.0
relatorio-q4.pdf	mferreira	Microsoft Word	Adobe PDF Library 17.0
manual-tecnico.pdf	carlos.santos	LaTeX	pdfTeX-1.40.25
politica-rh.pdf	rh-admin	Microsoft Word	Microsoft Office PDF
edital-2026.pdf	ana.paula	LibreOffice 7.6	-`,
            outType: "warning",
          },
          {
            comment: "agora tenho 5 usernames internos para spear phishing",
            cmd: "exiftool -T -Author *.pdf | sort -u",
            out: `ana.paula
carlos.santos
jsilva
mferreira
rh-admin`,
            outType: "info",
          },
        ]}
      />

      <AlertBox type="warning" title="Metadados em PDF expõem usernames">
        <p>
          O campo <code>Author</code> de PDFs gerados pelo Word é geralmente o{" "}
          <strong>username do Windows do autor</strong>. Empresas costumam ter padrão tipo{" "}
          <code>primeiro.ultimo</code> ou inicial+sobrenome. Pegar 20 PDFs públicos do site
          do alvo e rodar <code>exiftool -Author</code> te dá um dicionário de usernames
          válidos para spray no Outlook 365 ou VPN corporativa.
        </p>
      </AlertBox>

      <h2>ImageMagick — converter, recortar, montar</h2>
      <CommandTable
        title="convert / mogrify / identify"
        variations={[
          { cmd: "identify foto.jpg", desc: "Tipo, tamanho, profundidade.", output: "foto.jpg JPEG 4032x3024 8-bit sRGB 4.2MB" },
          { cmd: "convert foto.png foto.jpg", desc: "Converter formato (PNG → JPG).", output: "Cria foto.jpg." },
          { cmd: "convert foto.jpg -resize 50% small.jpg", desc: "Redimensiona pela metade.", output: "Mantém aspect ratio." },
          { cmd: "convert foto.jpg -resize 1280x720 hd.jpg", desc: "Redimensiona até caber em 1280x720.", output: "Não força distorção." },
          { cmd: "convert foto.jpg -crop 800x600+100+50 cut.jpg", desc: "Recorta 800x600 a partir de (100,50).", output: "Útil para focar em parte da tela." },
          { cmd: "convert foto.jpg -quality 60 small.jpg", desc: "Reduz qualidade JPEG (compressão).", output: "Cai de 4.2MB para ~400KB." },
          { cmd: "convert *.png saida.pdf", desc: "Junta várias imagens num único PDF.", output: "Gera relatório em uma linha." },
          { cmd: "convert relatorio.pdf -density 300 page-%02d.png", desc: "Explode PDF em PNGs (1 por página).", output: "page-00.png, page-01.png, ..." },
          { cmd: "mogrify -resize 800 *.jpg", desc: "Redimensiona em batch IN PLACE.", output: "Sobrescreve! Faça backup antes." },
          { cmd: "convert -size 800x100 xc:red banner.png", desc: "Cria imagem do zero (background vermelho).", output: "Útil para template phishing." },
          { cmd: "composite logo.png foto.jpg out.jpg", desc: "Sobrepõe logo na foto (watermark).", output: "Pode ser usado em fake banner." },
        ]}
      />

      <Terminal
        path="~/relatorio"
        lines={[
          {
            comment: "preparei 30 screenshots de PoC — preciso reduzir todas pra caber no PDF",
            cmd: "ls *.png | wc -l && du -sh .",
            out: `30
84M	.`,
            outType: "info",
          },
          {
            cmd: "mkdir small && for f in *.png; do convert \"$f\" -resize 1200 -quality 80 \"small/$f\"; done",
            out: "(processa cada arquivo)",
            outType: "muted",
          },
          {
            cmd: "du -sh small/",
            out: "12M	small/",
            outType: "success",
          },
          {
            comment: "monta todas num PDF único de evidências",
            cmd: "convert small/*.png evidencias-pentest.pdf",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "ls -lah evidencias-pentest.pdf",
            out: "-rw-r--r-- 1 wallyson wallyson 11M Apr  5 15:42 evidencias-pentest.pdf",
            outType: "success",
          },
        ]}
      />

      <h2>ffmpeg — vídeo e áudio universal</h2>
      <p>
        <code>ffmpeg</code> é a Suíça de mídia. Converter formato, cortar, comprimir,
        extrair áudio, fazer screen-record de PoC, criar GIF animado de vídeo de
        exploração para o relatório.
      </p>

      <CommandTable
        title="ffmpeg cookbook"
        variations={[
          { cmd: "ffmpeg -i video.mp4", desc: "Mostra info (duration, codec, resolution).", output: "Stream #0:0 Video: h264 1920x1080..." },
          { cmd: "ffmpeg -i in.mov out.mp4", desc: "Converte container/codec automaticamente.", output: "Reencoda para H.264/AAC." },
          { cmd: "ffmpeg -i in.mp4 -ss 00:00:10 -t 30 cut.mp4", desc: "Corta 30s a partir do segundo 10.", output: "-ss início, -t duração." },
          { cmd: "ffmpeg -i in.mp4 -an silent.mp4", desc: "Remove áudio.", output: "Vídeo limpo de voz acidental." },
          { cmd: "ffmpeg -i in.mp4 -vn audio.mp3", desc: "Extrai SÓ o áudio para MP3.", output: "Bom para transcrever depois." },
          { cmd: "ffmpeg -i in.mp4 -vf scale=720:-1 small.mp4", desc: "Reescala para 720p mantendo proporção.", output: "Encolhe arquivo bastante." },
          { cmd: "ffmpeg -i in.mp4 -r 10 -vf scale=640:-1 demo.gif", desc: "Vídeo → GIF de 10fps, 640px.", output: "GIF de PoC para colar em chat." },
          { cmd: "ffmpeg -f x11grab -i :0.0 -framerate 25 rec.mp4", desc: "Grava sua tela (Linux).", output: "Screencast da exploração." },
          { cmd: "ffmpeg -i in.mp4 -ss 5 -vframes 1 thumb.jpg", desc: "Captura UMA frame no segundo 5 (thumbnail).", output: "Capa de relatório." },
          { cmd: "ffmpeg -i a.mp4 -i b.mp4 -filter_complex hstack out.mp4", desc: "Lado a lado (split-screen).", output: "Comparativo before/after." },
          { cmd: "ffmpeg -i in.mp4 -c:v libx264 -crf 28 small.mp4", desc: "Re-encoda com qualidade reduzida (CRF maior = pior/menor).", output: "Comprime pra mandar por email." },
        ]}
      />

      <Terminal
        path="~/poc"
        lines={[
          {
            comment: "gravei screencast de 8min da exploração; preciso recortar 30s e gerar GIF",
            cmd: "ffmpeg -i full-poc.mkv -ss 02:14 -t 28 -c:v libx264 -crf 23 cut-poc.mp4",
            out: `Input #0, matroska,webm
  Duration: 00:08:42.50, start: 0.000000, bitrate: 4218 kb/s
  Stream #0:0: Video: h264 (High), yuv420p, 1920x1080, 60 fps
[libx264 @ 0x...] frame=  840 fps= 87 q=23.0 size=    8192kB
video:7912kB audio:0kB muxing overhead: 1.221%`,
            outType: "info",
          },
          {
            cmd: "ffmpeg -i cut-poc.mp4 -vf 'fps=12,scale=720:-1:flags=lanczos' -loop 0 demo.gif",
            out: `[gif @ 0x...] frame=  336 fps= 71 q=-0.0 size=    6144kB time=00:00:28.00`,
            outType: "muted",
          },
          {
            cmd: "ls -lah demo.gif cut-poc.mp4",
            out: `-rw-r--r-- 1 wallyson wallyson 5.9M Apr  5 15:55 demo.gif
-rw-r--r-- 1 wallyson wallyson 7.7M Apr  5 15:54 cut-poc.mp4`,
            outType: "success",
          },
        ]}
      />

      <h2>sox — manipulação de áudio</h2>
      <p>
        Em engenharia social por voz (vishing) ou para limpar gravações coletadas
        de conferências, <code>sox</code> faz boa parte do trabalho sem GUI.
      </p>

      <CodeBlock
        language="bash"
        title="sox — receitas comuns"
        code={`# instalar
sudo apt install -y sox libsox-fmt-all

# info do arquivo
soxi gravacao.wav

# converter formato
sox in.mp3 out.wav

# normalizar volume (deixa todo arquivo no mesmo nível)
sox in.wav out.wav norm -1

# cortar 0:30 começando aos 1:00
sox in.wav out.wav trim 60 30

# remover silêncio do início e fim
sox in.wav out.wav silence 1 0.1 1% reverse silence 1 0.1 1% reverse

# concatenar dois áudios
sox a.wav b.wav junto.wav

# mudar pitch (1200 = 1 oitava acima); -200 deixa voz mais grave
sox in.wav voz_grave.wav pitch -200

# acelerar/desacelerar SEM mudar pitch
sox in.wav rapida.wav tempo 1.4

# converter para 16kHz mono (formato pra speech-to-text)
sox in.wav -r 16000 -c 1 stt-input.wav`}
      />

      <h2>Steganografia básica em mídia</h2>
      <Terminal
        path="~/steg"
        lines={[
          {
            comment: "embute texto secreto numa imagem usando steghide",
            cmd: "echo 'flag{exfil_via_steg}' > segredo.txt",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "steghide embed -cf cover.jpg -ef segredo.txt -p Senha123",
            out: `embedding "segredo.txt" in "cover.jpg"... done`,
            outType: "success",
          },
          {
            comment: "cover.jpg parece intacta — mas tem dados escondidos",
            cmd: "file cover.jpg && ls -l cover.jpg",
            out: `cover.jpg: JPEG image data, JFIF standard 1.01, ..., 1920x1080
-rw-r--r-- 1 wallyson wallyson 487231 Apr  5 16:10 cover.jpg`,
            outType: "info",
          },
          {
            comment: "do outro lado, extrair",
            cmd: "steghide extract -sf cover.jpg -p Senha123",
            out: `wrote extracted data to "segredo.txt".`,
            outType: "success",
          },
          {
            comment: "binwalk pega arquivos zip/exe escondidos depois do EOF do JPEG",
            cmd: "binwalk -e payload-disfarcado.png",
            out: `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------
0             0x0             PNG image, 1280 x 720, 8-bit/color RGBA
14821         0x39E5          Zip archive data, at least v2.0 to extract, name: payload.exe
14955         0x3A6B          End of Zip archive`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="OSINT — extrair indicadores de uma pasta de fotos"
        goal="Dado um conjunto de fotos públicas do alvo, listar dispositivos, GPS e horários para construir um perfil."
        steps={[
          "Crie uma pasta fotos/ com alguns JPGs (use os do seu próprio celular para testar).",
          "Rode exiftool em batch e exporte para CSV.",
          "Filtre quais têm GPS.",
          "Plote os pontos GPS num mapa colando no Google Maps ou kml.",
        ]}
        command={`mkdir -p ~/osint-fotos && cd ~/osint-fotos
# coloque algumas .jpg suas aqui ou baixe samples
exiftool -csv -Make -Model -Software -DateTimeOriginal \\
         -GPSLatitude -GPSLongitude *.jpg > metadata.csv
echo "--- com GPS ---"
exiftool -if '$GPSLatitude' -p '\\$filename | \\$GPSPosition' *.jpg
echo "--- timeline ---"
exiftool -T -DateTimeOriginal -FileName *.jpg | sort`}
        expected={`SourceFile,Make,Model,Software,DateTimeOriginal,GPSLatitude,GPSLongitude
IMG_0123.jpg,Apple,iPhone 15 Pro,17.4.1,2026:03:18 14:32:09,23 deg 33' 1.20" S,46 deg 38' 32.40" W
IMG_0124.jpg,Apple,iPhone 15 Pro,17.4.1,2026:03:18 16:42:11,,
--- com GPS ---
IMG_0123.jpg | 23 deg 33' 1.20" S, 46 deg 38' 32.40" W
--- timeline ---
2026:03:18 14:32:09	IMG_0123.jpg
2026:03:18 16:42:11	IMG_0124.jpg`}
        verify="O CSV bate com o tipo do dispositivo e quem tirou a foto, e a coluna GPS te dá um endereço aproximado dos pontos."
      />

      <AlertBox type="danger" title="Ética / OPSEC do operador">
        <p>
          (1) Use estas técnicas apenas em escopo autorizado de OSINT/pentest.{" "}
          (2) Como <strong>operador</strong>, sempre rode <code>exiftool -all=</code> em
          screenshots, fotos ou PDFs antes de entregá-los ao cliente — você não quer que o
          relatório carregue seu username, GPS de casa ou nome do laptop. (3) Para vídeos
          de PoC, lembre que o nome de janela e wallpaper do seu desktop também aparecem;
          considere gravar dentro de uma VM dedicada.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
