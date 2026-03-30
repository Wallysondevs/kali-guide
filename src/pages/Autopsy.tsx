import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Autopsy() {
    return (
      <PageContainer
        title="Autopsy & Forense de Disco"
        subtitle="Analise imagens de disco, recupere arquivos deletados e investigue evidências digitais como um perito forense."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="info" title="Ferramenta padrão de forense digital">
          Autopsy é usado por policiais, investigadores digitais e peritos forenses no mundo inteiro.
          É gratuito, open-source, e suporta Windows, Linux e macOS.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Kali Linux\nsudo apt install autopsy -y\n\n# Iniciar (interface web)\nautopsy\n# Acessar: http://localhost:9999/autopsy\n\n# Versão 4 (GUI Java — mais moderna)\n# Baixar de: https://www.sleuthkit.org/autopsy/download.php\njava -jar autopsy.jar'} />

        <h2>Criar Imagem de Disco</h2>
        <CodeBlock language="bash" code={'# dd — criar imagem bit a bit\nsudo dd if=/dev/sdb of=/mnt/evidencias/disco.img bs=4096 status=progress\n\n# dc3dd — versão forense do dd (com hash)\nsudo dc3dd if=/dev/sdb of=/tmp/evidence.img hash=sha256 log=/tmp/evidence.log\n\n# FTK Imager (alternativa, Windows)\n# Imagens .E01, .dd, .raw\n\n# Verificar integridade com hash\nsha256sum disco.img > disco.img.sha256\nmd5sum disco.img >> disco.img.md5'} />

        <h2>Análise com Sleuth Kit (CLI)</h2>
        <CodeBlock language="bash" code={'# Sleuth Kit é a base do Autopsy (ferramentas CLI)\n\n# Listar partições\nmmls disco.img\n\n# Listar arquivos\nfls -r -o OFFSET disco.img\n\n# Recuperar arquivo deletado\nicat -o OFFSET disco.img INODE > arquivo_recuperado.jpg\n\n# Análise de timeline\nmactime -b body.txt -d > timeline.csv\n\n# String dump\nstrings disco.img | grep -i "password\\|senha\\|credential"\n\n# Arquivos por tipo\nsorter -s -o OFFSET disco.img'} />

        <h2>Autopsy GUI — Workflow Completo</h2>
        <CodeBlock language="bash" code={'# 1. Criar novo caso\n# File → New Case → nome, local, examinador\n\n# 2. Adicionar fonte de dados\n# Add Data Source → Disk Image → selecionar .img ou .E01\n\n# 3. Selecionar módulos de ingestão:\n# [x] Recent Activity (histórico de browser, USB, etc.)\n# [x] Hash Lookup (identificar arquivos maliciosos)\n# [x] File Type Identification\n# [x] Email Parser\n# [x] Keyword Search\n# [x] Deleted Files Recovery\n\n# 4. Aguardar análise (pode levar horas para discos grandes)\n\n# 5. Investigar:\n# - File Types → Images (todas as imagens)\n# - Deleted Files (arquivos recuperados)\n# - Web History (sites visitados)\n# - Recent Documents\n# - Timeline View'} />

        <h2>Foremost e Scalpel — Recuperação de Arquivos</h2>
        <CodeBlock language="bash" code={'# Foremost — recuperar arquivos por assinatura de cabeçalho\nsudo apt install foremost -y\nforemost -t jpg,pdf,docx -i disco.img -o /tmp/recovered/\n\n# Scalpel — alternativa ao Foremost\nsudo apt install scalpel -y\n# Editar /etc/scalpel/scalpel.conf para habilitar tipos\nscalpel disco.img -o /tmp/scalpel_output/\n\n# PhotoRec — recuperação de fotos e documentos\nsudo apt install testdisk -y\nphotorec disco.img  # interface interativa\n\n# Binwalk — arquivos embutidos\nbinwalk -e disco.img'} />

        <AlertBox type="success" title="Cadeia de custódia">
          Em investigações forenses legais, NUNCA trabalhe na evidência original.
          Sempre crie uma cópia (imagem) e trabalhe na cópia.
          Documente TUDO: hashes, datas, quem manipulou a evidência. Isso é a cadeia de custódia.
        </AlertBox>
      </PageContainer>
    );
  }
  