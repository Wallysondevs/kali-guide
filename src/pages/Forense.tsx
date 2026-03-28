import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Forense() {
  return (
    <PageContainer
      title="Forense Digital"
      subtitle="Coleta, preservação e análise de evidências digitais com ferramentas do Kali Linux."
      difficulty="avancado"
      timeToRead="10 min"
    >
      <h2>Princípios da Forense Digital</h2>
      <p>
        A forense digital segue a <strong>cadeia de custódia</strong> — toda evidência deve ser 
        coletada de forma que sua integridade seja preservada e verificável. 
        O princípio de Locard: "todo contato deixa rastros".
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[
          { icon: "🔒", title: "Preservar integridade", desc: "Nunca trabalhe na evidência original. Sempre faça cópia forense." },
          { icon: "📋", title: "Documentar tudo", desc: "Registre cada ação com timestamp, hash e razão." },
          { icon: "#️⃣", title: "Verificar hashes", desc: "MD5/SHA-256 da evidência original e da cópia devem ser idênticos." },
          { icon: "⚖️", title: "Ordem de volatilidade", desc: "Colete dados mais voláteis primeiro: RAM > swap > disco > logs." },
        ].map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="font-bold text-sm mb-1">{p.title}</div>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      <h2>Criando imagem forense do disco</h2>
      <CodeBlock language="bash" code={`# dd — ferramenta clássica de cópia bit-a-bit
sudo dd if=/dev/sdb of=imagem.img bs=4M status=progress

# dcfldd — versão forense do dd (com hash e progresso)
sudo apt install -y dcfldd
sudo dcfldd if=/dev/sdb of=imagem.img bs=4M hash=md5,sha256 hashlog=hashes.txt

# ddrescue — para discos com setores ruins
sudo apt install -y gddrescue
sudo ddrescue /dev/sdb imagem.img mapa.log

# Verificar integridade com hash
md5sum imagem.img > imagem.md5
sha256sum imagem.img > imagem.sha256

# Montar imagem em modo somente leitura
sudo mkdir /mnt/evidencia
sudo mount -o ro,loop imagem.img /mnt/evidencia`} />

      <h2>Autopsy — Plataforma forense gráfica</h2>
      <CodeBlock language="bash" code={`# Iniciar o Autopsy
sudo autopsy

# Abrir no browser: http://127.0.0.1:9999/autopsy

# Autopsy analisa:
# → Imagens de disco (E01, dd, raw)
# → Recuperação de arquivos apagados
# → Análise de timeline
# → Extração de metadata
# → Análise de hash (NSRL database)
# → Palavras-chave
# → Artefatos do navegador`} />

      <h2>Volatility — Forense de memória RAM</h2>
      <CodeBlock language="bash" code={`# Instalar Volatility 3
sudo apt install -y volatility3
# ou: pip install volatility3

# Informações básicas do dump
vol -f dump.mem windows.info        # Windows
vol -f dump.mem linux.info          # Linux

# Listar processos
vol -f dump.mem windows.pslist
vol -f dump.mem windows.pstree

# Conexões de rede
vol -f dump.mem windows.netstat

# Cmdline de processos (ver comandos executados!)
vol -f dump.mem windows.cmdline

# Extrair arquivos da memória
vol -f dump.mem windows.filescan
vol -f dump.mem windows.dumpfiles --pid 1234

# Hashes de credenciais
vol -f dump.mem windows.hashdump

# Detectar malware
vol -f dump.mem windows.malfind

# Adquirir RAM de sistema vivo
sudo apt install -y avml lime-forensics
# AVML (Linux): sudo avml /tmp/memory.lime
# LiME (Linux): insmod lime.ko "path=/tmp/dump.mem format=lime"`} />

      <h2>Recuperação de arquivos apagados</h2>
      <CodeBlock language="bash" code={`# Foremost — carving por assinatura
sudo apt install -y foremost
sudo foremost -t all -i imagem.img -o /tmp/recuperados/

# Scalpel — alternativa ao foremost
sudo apt install -y scalpel
sudo scalpel imagem.img -o /tmp/scalpel_output/

# PhotoRec — recuperação de fotos e outros arquivos
sudo apt install -y testdisk
sudo photorec imagem.img

# Binwalk — extrair arquivos de binários/firmwares
sudo apt install -y binwalk
binwalk firmware.bin                      # analisar
binwalk -e firmware.bin                   # extrair`} />

      <h2>Análise de logs e artefatos</h2>
      <CodeBlock language="bash" code={`# Análise de logs do Windows (arquivo EVTX)
sudo apt install -y python3-evtx
python3 -m evtx /mnt/evidencia/Windows/System32/winevt/Logs/Security.evtx

# Extrair histórico do navegador
# Chrome: /Home/Usuario/AppData/Local/Google/Chrome/User Data/Default/History
# Firefox: /Home/Usuario/AppData/Roaming/Mozilla/Firefox/Profiles/*/places.sqlite

sqlite3 places.sqlite "SELECT url, title, visit_count FROM moz_places ORDER BY visit_count DESC LIMIT 20;"

# Análise de prefetch Windows
sudo apt install -y python3-libpff
# Tool: PECmd.exe (Zimmerman Tools) para análise completa

# Linha de tempo com mactime
sudo apt install -y sleuthkit
fls -r -m / imagem.img > bodyfile.txt
mactime -b bodyfile.txt -d > timeline.csv`} />
    </PageContainer>
  );
}
