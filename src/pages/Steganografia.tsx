import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Steganografia() {
    return (
      <PageContainer
        title="Esteganografia — Segredos em Arquivos"
        subtitle="Encontre e extraia dados ocultos em imagens, áudios e outros arquivos — técnica muito comum em CTFs."
        difficulty="intermediario"
        timeToRead="12 min"
      >
        <AlertBox type="info" title="Muito comum em CTFs">
          Esteganografia esconde informações dentro de arquivos aparentemente normais.
          É frequente em CTFs e também usada por malwares para C2 e exfiltração.
        </AlertBox>

        <h2>Primeiros Passos — Identificar o Arquivo</h2>
        <CodeBlock language="bash" code={'# Verificar tipo real do arquivo\nfile imagem.jpg\nfile imagem.png\n\n# Strings no arquivo\nstrings imagem.jpg\nstrings imagem.jpg | grep -i "password\\|flag\\|secret\\|key"\n\n# Hexdump — ver bytes raw\nxxd imagem.jpg | head -50\nxxd imagem.jpg | grep -i "flag"\n\n# Metadados\nexiftool imagem.jpg\nexiftool -all imagem.jpg'} />

        <h2>Binwalk — Arquivos Embutidos</h2>
        <CodeBlock language="bash" code={'# Detectar arquivos embutidos\nbinwalk imagem.jpg\nbinwalk -e imagem.jpg    # extrair automaticamente\nbinwalk -Me imagem.jpg   # extração recursiva\n\n# Exemplos de resultados:\n# JPEG image data → arquivo principal\n# Zip archive data → ZIP escondido dentro da imagem!\n# ELF 64-bit → binário embutido'} />

        <h2>Steghide — Esteganografia em JPEG</h2>
        <CodeBlock language="bash" code={'# Esconder arquivo dentro de imagem\nsteghide embed -cf imagem.jpg -sf arquivo_secreto.txt\nsteghide embed -cf imagem.jpg -sf secreto.txt -p "minha_senha"\n\n# Extrair\nsteghide extract -sf imagem.jpg\nsteghide extract -sf imagem.jpg -p "minha_senha"\n\n# Verificar se há dados ocultos (sem extrair)\nsteghide info imagem.jpg\n\n# Força bruta na senha do steghide\nstegseek imagem.jpg /usr/share/wordlists/rockyou.txt'} />

        <h2>Zsteg — Esteganografia em PNG</h2>
        <CodeBlock language="bash" code={'# Instalar\ngem install zsteg\n\n# Análise automática\nzsteg imagem.png\nzsteg -a imagem.png  # tentar todos os métodos\n\n# LSB (Least Significant Bit) — técnica mais comum\nzsteg -b 1 -o xy -v imagem.png\n\n# Extrair dados específicos\nzsteg -e "b1,r,lsb,xy" imagem.png > dados_extraidos'} />

        <h2>Ferramentas Adicionais</h2>
        <CodeBlock language="bash" code={'# stegsolve — análise visual de LSB\nwget http://www.caesum.com/handbook/Stegsolve.jar\njava -jar Stegsolve.jar\n\n# outguess — esteganografia em JPEG\noutguess -r imagem.jpg output.txt\noutguess -k "senha" -r imagem.jpg output.txt\n\n# jsteg / jphide — outros formatos JPEG\napt install jsteg\n\n# Áudios — audacity (visual)\n# WAV com dados ocultos → espectrograma no Audacity\nsox audio.wav -n spectrogram -o espectrograma.png\n\n# stegsnow — espaços em branco em texto\nstegsnow -C -m "minha mensagem" arquivo.txt arquivo_steganografado.txt\nstegsnow -C arquivo_steganografado.txt'} />

        <h2>Checklist de Esteganografia em CTF</h2>
        <CodeBlock language="bash" code={'# Checklist rápido:\n# 1. file ARQUIVO              — tipo real?\n# 2. strings ARQUIVO           — strings visíveis?\n# 3. exiftool ARQUIVO          — metadados?\n# 4. binwalk -e ARQUIVO        — arquivos embutidos?\n# 5. steghide info ARQUIVO     — dados ocultos? (JPEG)\n# 6. zsteg ARQUIVO             — LSB? (PNG)\n# 7. xxd ARQUIVO | tail        — dados no final do arquivo?\n# 8. stegseek ARQUIVO wordlist — brute force senha?'} />

        <AlertBox type="success" title="Recurso online">
          StegOnline (https://stegonline.georgeom.net) oferece várias ferramentas de esteganografia
          online, incluindo análise LSB visual e extração de planos de bits.
        </AlertBox>
      </PageContainer>
    );
  }
  