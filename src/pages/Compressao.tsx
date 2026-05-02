import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Compressao() {
  return (
    <PageContainer
      title="Compressão de arquivos"
      subtitle="tar, gzip, bzip2, xz, zstd, zip e 7z — quando usar cada um, sintaxe básica e combinações com tar para empacotar diretórios."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>Visão geral</h2>
      <p>
        Em Linux há duas tarefas distintas e complementares: <strong>arquivar</strong> (juntar
        vários arquivos em um único contêiner, preservando permissões e estrutura) e{" "}
        <strong>comprimir</strong> (reduzir o tamanho em bytes). O <code>tar</code> é o
        arquivador padrão; já <code>gzip</code>, <code>bzip2</code>, <code>xz</code> e{" "}
        <code>zstd</code> são compressores de fluxo que operam em um único arquivo. A combinação
        clássica <code>.tar.gz</code> empacota com <code>tar</code> e comprime com{" "}
        <code>gzip</code> em um único pipeline. Os formatos <code>zip</code> e <code>7z</code>{" "}
        fazem ambas as coisas, sendo úteis para troca com sistemas Windows.
      </p>

      <h2>Detectar o formato antes de extrair</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "nunca confie só na extensão; o file inspeciona os magic bytes",
            cmd: "file backup.bin pacote.tgz dump.xz",
            out: `backup.bin: Zip archive data, at least v2.0 to extract
pacote.tgz: gzip compressed data, from Unix, original size 4096
dump.xz:    XZ compressed data, checksum CRC64`,
            outType: "info",
          },
        ]}
      />

      <h2>tar — o arquivador</h2>
      <CommandTable
        title="opções essenciais do tar"
        variations={[
          { cmd: "tar -cf saida.tar dir/", desc: "Cria arquivo (sem compressão).", output: "-c create, -f file" },
          { cmd: "tar -xf entrada.tar", desc: "Extrai no diretório atual.", output: "-x extract" },
          { cmd: "tar -tvf arquivo.tar", desc: "Lista o conteúdo sem extrair.", output: "-t list, -v verbose" },
          { cmd: "tar -czf saida.tar.gz dir/", desc: "Cria + comprime com gzip.", output: ".tar.gz / .tgz" },
          { cmd: "tar -cjf saida.tar.bz2 dir/", desc: "Cria + comprime com bzip2.", output: "Mais lento, melhor razão." },
          { cmd: "tar -cJf saida.tar.xz dir/", desc: "Cria + comprime com xz (LZMA2).", output: "Razão excelente, lento." },
          { cmd: "tar --zstd -cf saida.tar.zst dir/", desc: "Cria + comprime com zstd.", output: "Equilíbrio velocidade/razão." },
          { cmd: "tar -xzf pacote.tgz -C /tmp/", desc: "Extrai em diretório específico.", output: "-C muda o cwd da extração." },
          { cmd: "tar --exclude='*.log' -czf bk.tgz dir/", desc: "Exclui padrões da arquivação.", output: "Pode repetir --exclude N vezes." },
          { cmd: "tar -czf - dir/ | ssh host 'cat > bk.tgz'", desc: "Stream para outro host via pipe.", output: "Usa stdout (-f -)." },
        ]}
      />

      <Terminal
        path="~/projeto"
        lines={[
          {
            cmd: "tar -czf configs.tar.gz /etc/nginx /etc/ssh",
            out: "tar: Removing leading '/' from member names",
            outType: "muted",
          },
          {
            cmd: "tar -tzf configs.tar.gz | head -5",
            out: `etc/nginx/
etc/nginx/nginx.conf
etc/nginx/sites-available/
etc/ssh/
etc/ssh/sshd_config`,
            outType: "info",
          },
        ]}
      />

      <h2>Compressores de fluxo</h2>
      <CommandTable
        title="gzip / bzip2 / xz / zstd"
        variations={[
          { cmd: "gzip arquivo.log", desc: "Comprime e SUBSTITUI pelo .gz.", output: "Use -k para manter o original." },
          { cmd: "gunzip arquivo.log.gz", desc: "Descomprime (= gzip -d).", output: "Aceita também via stdin." },
          { cmd: "gzip -9 arquivo", desc: "Nível máximo (1=rápido, 9=melhor).", output: "Custo de CPU não-linear." },
          { cmd: "bzip2 -k arquivo", desc: "BWT, melhor que gzip, mais lento.", output: "Extensão .bz2" },
          { cmd: "xz -T0 arquivo", desc: "Excelente razão; -T0 usa todas as threads.", output: ".xz; ótimo para distribuir tarballs." },
          { cmd: "zstd -19 arquivo", desc: "Compressão moderna do Facebook.", output: "Velocidade de gzip com razão de xz." },
          { cmd: "zcat arquivo.log.gz", desc: "Lê comprimido sem descomprimir em disco.", output: "Variantes: bzcat, xzcat, zstdcat." },
          { cmd: "zgrep ERRO arquivo.log.gz", desc: "grep direto em comprimido.", output: "Há também zless, zdiff, zmore." },
        ]}
      />

      <AlertBox type="info" title="Comparação prática">
        <p>
          Para o mesmo conteúdo de texto típico (logs, código-fonte), a ordem aproximada por{" "}
          <strong>razão de compressão</strong> é: <code>xz</code> ≥ <code>zstd -19</code> &gt;{" "}
          <code>bzip2</code> &gt; <code>gzip</code>. Já por <strong>velocidade de compressão</strong>:{" "}
          <code>zstd</code> (default) &gt; <code>gzip</code> &gt; <code>bzip2</code> &gt;{" "}
          <code>xz</code>. Para descompressão, <code>zstd</code> e <code>gzip</code> são muito
          rápidos; <code>xz</code> exige mais CPU. Em backups grandes vale a pena medir com seu
          dataset real.
        </p>
      </AlertBox>

      <h2>zip e 7z (interoperabilidade)</h2>
      <CommandTable
        title="zip / unzip / 7z"
        variations={[
          { cmd: "zip -r pacote.zip dir/", desc: "Empacota recursivamente.", output: "Para enviar a usuários Windows." },
          { cmd: "zip -e secreto.zip arquivo", desc: "Cria com senha (criptografia fraca, legacy).", output: "Use 7z -p para AES-256." },
          { cmd: "unzip pacote.zip -d /tmp/destino", desc: "Extrai em diretório alvo.", output: "-d destination" },
          { cmd: "unzip -l pacote.zip", desc: "Lista conteúdo sem extrair.", output: "Mostra tamanho e data." },
          { cmd: "7z a pacote.7z dir/", desc: "Adiciona/cria com 7z (LZMA2).", output: "Razão semelhante a xz." },
          { cmd: "7z l pacote.7z", desc: "Lista conteúdo.", output: "Mostra método de compressão." },
          { cmd: "7z x pacote.7z -o/tmp/", desc: "Extrai mantendo estrutura. Note: -o sem espaço.", output: "Pacote: p7zip-full" },
        ]}
      />

      <h2>Pipeline: comprimindo direto na rede</h2>
      <CodeBlock
        language="bash"
        title="empacotar e enviar sem criar arquivo intermediário"
        code={`# do servidor de origem para o de destino, comprimindo no caminho
tar -cf - /var/www | zstd -T0 | ssh backup@nas "cat > /backups/www-$(date +%F).tar.zst"

# extração remota (do destino, puxando)
ssh app@web "tar -cf - /etc/app | xz -T0" | xz -d | tar -xf - -C /tmp/restore`}
      />

      <h2>Conferindo integridade</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "tar -t valida estrutura; gzip -t valida o stream comprimido",
            cmd: "gzip -t configs.tar.gz && echo OK",
            out: "OK",
            outType: "success",
          },
          {
            cmd: "xz -t backup.tar.xz && echo OK",
            out: "OK",
            outType: "success",
          },
          {
            comment: "checksum publicado junto do release",
            cmd: "sha256sum -c configs.tar.gz.sha256",
            out: "configs.tar.gz: OK",
            outType: "info",
          },
        ]}
      />

      <h2>Excluindo padrões</h2>
      <CodeBlock
        language="bash"
        title="backup de /home sem caches e logs"
        code={`tar --exclude='*/node_modules' \\
    --exclude='*/.cache' \\
    --exclude='*/__pycache__' \\
    --exclude='*.log' \\
    -czf /backups/home-$(date +%F).tar.gz /home/ana`}
      />

      <PracticeBox
        title="Backup compactado de /etc"
        goal="Gerar um arquivo .tar.zst do diretório de configuração, listar seu conteúdo e validar a integridade."
        steps={[
          "Garantir que zstd está instalado (apt install zstd).",
          "Criar /backups com permissões adequadas.",
          "Empacotar /etc excluindo arquivos voláteis com tar+zstd.",
          "Listar o conteúdo do arquivo gerado.",
          "Conferir a integridade do stream zstd.",
          "Gerar e arquivar um sha256sum ao lado do backup.",
        ]}
        command={`sudo apt install -y zstd
sudo mkdir -p /backups && sudo chown $USER /backups

tar --zstd --exclude='/etc/shadow' -cf /backups/etc-$(date +%F).tar.zst /etc

tar --zstd -tf /backups/etc-$(date +%F).tar.zst | head
zstd -t /backups/etc-$(date +%F).tar.zst && echo OK
sha256sum /backups/etc-$(date +%F).tar.zst > /backups/etc-$(date +%F).tar.zst.sha256`}
        expected={`tar: Removing leading '/' from member names
etc/
etc/hostname
etc/hosts
...
/backups/etc-2026-04-03.tar.zst: 24876543 bytes
OK`}
        verify="O comando zstd -t responde OK e o arquivo .sha256 fica armazenado junto do backup para validação futura."
      />

      <AlertBox type="warning" title="Cuidado com caminhos absolutos">
        <p>
          Por padrão o <code>tar</code> remove a barra inicial dos caminhos para evitar
          sobrescrever arquivos do sistema na extração. Se quiser preservar caminhos absolutos,
          use <code>{`tar -P`}</code> (não recomendado em backups que serão restaurados em outras
          máquinas). Sempre extraia em diretório de teste antes de restaurar sobre arquivos vivos.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
