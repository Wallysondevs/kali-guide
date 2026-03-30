import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Volatility() {
    return (
      <PageContainer
        title="Volatility — Análise de Memória RAM"
        subtitle="Analise dumps de memória RAM para encontrar processos maliciosos, artefatos de malware e credenciais."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="info" title="Forense de memória volátil">
          RAM contém informações preciosas que não existem no disco: senhas em texto claro,
          processos escondidos, conexões de rede ativas, artefatos de malware e muito mais.
          Volatility é o padrão da indústria para análise de memória.
        </AlertBox>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Volatility 3 (recomendado — Python 3)\nsudo apt install volatility3 -y\n# ou\npip3 install volatility3\n\n# Volatility 2 (ainda muito usado em CTFs)\nsudo apt install volatility -y\n\n# Verificar instalação\nvol -h\nvol3 -h'} />

        <h2>Identificar o Profile (Volatility 2)</h2>
        <CodeBlock language="bash" code={'# Identificar o sistema operacional do dump\nvol.py -f memoria.dmp imageinfo\nvol.py -f memoria.dmp kdbgscan\n\n# Exemplos de profiles:\n# Win7SP1x64, Win10x64_19041, WinXPSP3x86'} />

        <h2>Análise de Processos</h2>
        <CodeBlock language="bash" code={'# Volatility 3 (não precisa de profile)\nvol -f memoria.dmp windows.pslist\nvol -f memoria.dmp windows.pstree  # árvore de processos\nvol -f memoria.dmp windows.psscan  # detectar processos ocultos\n\n# Comparar pslist e psscan (diferença = processo oculto!)\nvol -f memoria.dmp windows.pslist | awk \'{print $2}\' | sort > pslist.txt\nvol -f memoria.dmp windows.psscan | awk \'{print $2}\' | sort > psscan.txt\ndiff pslist.txt psscan.txt'} />

        <h2>Análise de Rede</h2>
        <CodeBlock language="bash" code={'# Conexões de rede\nvol -f memoria.dmp windows.netstat\nvol -f memoria.dmp windows.netscan\n\n# Volatility 2\nvol.py -f memoria.dmp --profile=Win7SP1x64 connections\nvol.py -f memoria.dmp --profile=Win7SP1x64 netscan'} />

        <h2>Extração de Credenciais</h2>
        <CodeBlock language="bash" code={'# Extrair hashes de senha\nvol -f memoria.dmp windows.hashdump\n\n# Credenciais LSASS (Mimikatz-like)\nvol -f memoria.dmp windows.lsadump\n\n# Volatility 2 + mimikatz plugin\nvol.py -f memoria.dmp --profile=Win7SP1x64 mimikatz'} />

        <h2>Análise de Malware</h2>
        <CodeBlock language="bash" code={'# DLLs carregadas por processo\nvol -f memoria.dmp windows.dlllist --pid 1234\n\n# Verificar injeção de DLL / código\nvol -f memoria.dmp windows.malfind\n\n# Dump de processo específico\nvol -f memoria.dmp windows.dumpfiles --pid 1234 --output-dir /tmp/dumps/\n\n# Strings do processo\nvol -f memoria.dmp windows.strings --pid 1234'} />

        <h2>Análise de Arquivos e Registro</h2>
        <CodeBlock language="bash" code={'# Listar arquivos abertos\nvol -f memoria.dmp windows.filescan\n\n# Extrair arquivo específico\nvol -f memoria.dmp windows.dumpfiles --physaddr ENDERECO --output-dir /tmp/\n\n# Análise de registro\nvol -f memoria.dmp windows.registry.hivelist\nvol -f memoria.dmp windows.registry.printkey --key "SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run"'} />

        <AlertBox type="success" title="Para CTFs de forense">
          Volatility 3 é geralmente mais fácil (sem profile manual). Comece com windows.pslist,
          windows.netscan e windows.malfind para identificar comportamento suspeito rapidamente.
        </AlertBox>
      </PageContainer>
    );
  }
  