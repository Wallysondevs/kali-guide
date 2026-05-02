import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function VSCode() {
  return (
    <PageContainer
      title="VS Code (e VSCodium) no Kali"
      subtitle="O editor que você vai abrir 100x por dia: editar exploit, testar requests REST, debugar Python e ainda fazer SSH remoto sem largar o Kali."
      difficulty="iniciante"
      timeToRead="14 min"
    >
      <h2>VS Code vs VSCodium — qual instalar</h2>
      <p>
        <strong>VS Code</strong> (Microsoft) tem telemetria habilitada por default e algumas
        extensões só rodam nele (Remote Tunnels, Live Share). <strong>VSCodium</strong> é o mesmo
        editor compilado sem telemetria e com marketplace alternativo (Open VSX). Para pentest
        profissional, VSCodium é a escolha mais limpa — mas o original também serve se você
        desativar telemetria nas settings.
      </p>

      <h2>Instalação no Kali</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "VS Code oficial via repo Microsoft",
            cmd: "curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /etc/apt/keyrings/packages.microsoft.gpg",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: 'echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list',
            out: "deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main",
            outType: "info",
          },
          {
            cmd: "sudo apt update && sudo apt install -y code",
            out: `Setting up code (1.95.3-1731513102) ...
update-alternatives: using /usr/bin/code to provide /usr/bin/editor`,
            outType: "success",
          },
          {
            comment: "alternativa: VSCodium (sem telemetria)",
            cmd: "wget -qO- https://gitlab.com/paulcarroty/vscodium-deb-rpm-repo/raw/master/pub.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/vscodium.gpg",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: 'echo "deb [signed-by=/etc/apt/keyrings/vscodium.gpg] https://download.vscodium.com/debs vscodium main" | sudo tee /etc/apt/sources.list.d/vscodium.list && sudo apt update && sudo apt install codium',
            out: "Setting up codium (1.95.3.24319) ...",
            outType: "success",
          },
          {
            cmd: "code --version",
            out: `1.95.3
f1a4fb101478ce6ec82fe9627c43efbf9e98c813
x64`,
            outType: "info",
          },
        ]}
      />

      <h2>CLI do code/codium — atalhos do terminal</h2>
      <CommandTable
        title="Use a CLI direto do shell, sem mexer no mouse"
        variations={[
          { cmd: "code .", desc: "Abre o diretório atual no VS Code.", output: "Janela nova com o workspace = pasta corrente." },
          { cmd: "code arquivo.py", desc: "Abre arquivo isolado.", output: "Substitui nano/vim para edições rápidas." },
          { cmd: "code -d antes.py depois.py", desc: "Diff visual entre dois arquivos.", output: "Equivalente a meld/vimdiff." },
          { cmd: "code -g exploit.py:42:8", desc: "Abre arquivo na linha:coluna.", output: "Ótimo pra clicar em stack traces no terminal." },
          { cmd: "code -r /opt/lab", desc: "Reusa janela existente em vez de abrir nova.", output: "Mantém o workspace organizado." },
          { cmd: "code -w commit_msg.txt", desc: "Bloqueia o shell até fechar (--wait). Use como $EDITOR.", output: "git config --global core.editor 'code -w'" },
          { cmd: "code --list-extensions", desc: "Lista extensões instaladas.", output: "Salve com > extensions.txt para replicar setup." },
          { cmd: "cat extensions.txt | xargs -L1 code --install-extension", desc: "Instala todas em batch.", output: "Sincroniza setup entre Kali host e VM." },
          { cmd: "code --user-data-dir=/tmp/vscode-test", desc: "Sandbox: roda com profile limpo.", output: "Útil para testar extensão suspeita." },
        ]}
      />

      <h2>Extensões obrigatórias para pentest</h2>
      <CommandTable
        title="Stack mínima do operador"
        variations={[
          {
            cmd: "ms-python.python",
            desc: "Python: linting, debug, venv detection, Jupyter inline.",
            output: "code --install-extension ms-python.python",
          },
          {
            cmd: "ms-vscode-remote.remote-ssh",
            desc: "Edita arquivos em targets via SSH como se fossem locais.",
            output: "code --install-extension ms-vscode-remote.remote-ssh",
          },
          {
            cmd: "humao.rest-client",
            desc: "Dispara HTTP (GET/POST/PUT) direto do .http — substitui Postman.",
            output: "code --install-extension humao.rest-client",
          },
          {
            cmd: "ms-vscode.hexeditor",
            desc: "Editor hex nativo — abre payload.bin, shellcode, dumps.",
            output: "code --install-extension ms-vscode.hexeditor",
          },
          {
            cmd: "redhat.vscode-yaml",
            desc: "Schema validation pra phishlets, docker-compose, GitHub Actions.",
            output: "code --install-extension redhat.vscode-yaml",
          },
          {
            cmd: "yzhang.markdown-all-in-one",
            desc: "Markdown poderoso pra escrever relatório de pentest.",
            output: "code --install-extension yzhang.markdown-all-in-one",
          },
          {
            cmd: "13xforever.language-x86-64-assembly",
            desc: "Sintaxe NASM/Intel para shellcode, exploit dev.",
            output: "code --install-extension 13xforever.language-x86-64-assembly",
          },
          {
            cmd: "ms-azuretools.vscode-docker",
            desc: "Atalhos para subir/derrubar containers de lab (DVWA, Juice Shop).",
            output: "code --install-extension ms-azuretools.vscode-docker",
          },
        ]}
      />

      <h2>Workflow real: editor + terminal lado a lado</h2>
      <p>
        O segredo é não trocar de janela. Atalho <kbd>Ctrl+`</kbd> abre terminal integrado;{" "}
        <kbd>Ctrl+\</kbd> divide o editor; <kbd>Ctrl+Shift+5</kbd> divide o terminal.
        Resultado: exploit à esquerda, listener no terminal de baixo, request REST à direita.
      </p>

      <CodeBlock
        language="json"
        title="~/.config/Code/User/keybindings.json (atalhos pentest)"
        code={`[
  {
    "key": "ctrl+alt+r",
    "command": "rest-client.request",
    "when": "editorTextFocus && editorLangId == 'http'"
  },
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.terminal.new"
  },
  {
    "key": "ctrl+alt+s",
    "command": "workbench.action.terminal.split"
  },
  {
    "key": "f1",
    "command": "workbench.action.tasks.runTask",
    "args": "Run exploit"
  }
]`}
      />

      <h2>REST Client: substituindo Postman</h2>
      <p>
        Crie um arquivo <code>requests.http</code> e dispare requisições com{" "}
        <kbd>Ctrl+Alt+R</kbd>. Suporta variáveis, environments, autenticação JWT e response
        salvada como variável. Versionável em git, ao contrário do Postman.
      </p>

      <CodeBlock
        language="http"
        title="lab/api-pentest.http"
        code={`@host = http://alvo.tld
@token = {{login.response.body.access_token}}

### 1. Login (captura token automaticamente)
# @name login
POST {{host}}/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

### 2. Endpoint autenticado usando o token capturado
GET {{host}}/api/users/me
Authorization: Bearer {{token}}

### 3. Teste de IDOR — trocar o id
GET {{host}}/api/users/2
Authorization: Bearer {{token}}

### 4. SQLi básica no campo search
GET {{host}}/api/products?search=' OR 1=1--
Authorization: Bearer {{token}}

### 5. SSRF — força fetch interno
POST {{host}}/api/preview
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
}`}
      />

      <h2>Remote SSH: editar no alvo sem dropar arquivos pesados</h2>
      <p>
        Conseguiu shell estável e SSH no alvo? Em vez de subir/baixar arquivos com{" "}
        <code>scp</code>, abra a sessão diretamente no VS Code. O servidor instala um agente
        leve em <code>~/.vscode-server/</code> e tudo flui como local — terminal, debugger,
        extensões.
      </p>

      <CodeBlock
        language="bash"
        title="~/.ssh/config"
        code={`Host htb-target
  HostName 10.10.10.42
  User root
  Port 22
  IdentityFile ~/.ssh/id_pivot
  ServerAliveInterval 60

Host pivot-via-jump
  HostName 10.10.10.99
  User www-data
  IdentityFile ~/.ssh/id_pivot
  ProxyJump htb-target`}
      />

      <Terminal
        path="~"
        lines={[
          {
            comment: "abre VS Code já conectado ao alvo",
            cmd: "code --remote ssh-remote+htb-target /var/www/html",
            out: `Installing VS Code Server on remote (linux-x64)...
Successfully installed Server (commit f1a4fb1) at /root/.vscode-server/
Connected!`,
            outType: "success",
          },
          {
            comment: "todos os terminais que você abrir agora rodam NO ALVO",
            cmd: "(no terminal integrado) hostname && id",
            out: `target-prod-01
uid=0(root) gid=0(root)`,
            outType: "warning",
          },
        ]}
      />

      <AlertBox type="warning" title="Remote SSH dropa ~150MB no alvo">
        Em uma engagement séria isso pode disparar EDR ou encher disco do alvo. Para alvos
        sensíveis, prefira <code>sshfs</code> + editor local, ou copie o exploit, edite local,
        e refaça scp.
      </AlertBox>

      <h2>Tasks customizadas — automatize o ciclo "edit → run"</h2>
      <p>
        Aperte <kbd>F1</kbd> e roda o exploit. Aperte <kbd>F5</kbd> e roda o debugger Python no
        ponto de breakpoint. Coloque tudo em <code>.vscode/tasks.json</code> dentro do projeto.
      </p>

      <CodeBlock
        language="json"
        title=".vscode/tasks.json"
        code={`{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run exploit",
      "type": "shell",
      "command": "python3 \${file} 10.10.10.42",
      "presentation": { "panel": "dedicated", "clear": true },
      "problemMatcher": []
    },
    {
      "label": "Subir listener nc",
      "type": "shell",
      "command": "nc -lvnp 9001",
      "isBackground": true,
      "presentation": { "panel": "new" }
    },
    {
      "label": "Subir HTTP server (payloads)",
      "type": "shell",
      "command": "python3 -m http.server 8080 --directory \${workspaceFolder}/payloads",
      "isBackground": true
    }
  ]
}`}
      />

      <h2>Settings: produtividade + privacidade</h2>
      <CodeBlock
        language="json"
        title="~/.config/Code/User/settings.json"
        code={`{
  "telemetry.telemetryLevel": "off",
  "update.mode": "manual",
  "workbench.colorTheme": "Default Dark Modern",
  "editor.fontFamily": "'JetBrainsMono Nerd Font', 'Fira Code', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.minimap.enabled": false,
  "editor.formatOnSave": true,
  "editor.renderWhitespace": "boundary",
  "files.trimTrailingWhitespace": true,
  "terminal.integrated.fontFamily": "'JetBrainsMono Nerd Font'",
  "terminal.integrated.defaultProfile.linux": "zsh",
  "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/bin/python",
  "rest-client.environmentVariables": {
    "$shared": {},
    "lab":  { "host": "http://10.10.10.42" },
    "prod": { "host": "https://target.tld" }
  },
  "git.confirmSync": false,
  "explorer.confirmDelete": false
}`}
      />

      <PracticeBox
        title="Setup de dia 1 — exploit Python rodável com F1"
        goal="Criar workspace com venv, scanner socket simples e task que dispara via tecla — fluxo idêntico ao de qualquer engagement."
        steps={[
          "Crie a pasta lab-vscode e abra com code .",
          "Crie venv e ative.",
          "Crie scanner.py com socket scan básico.",
          "Crie .vscode/tasks.json com a task 'Run exploit'.",
          "Aperte F1 → Tasks: Run Task → Run exploit e observe a saída.",
        ]}
        command={`mkdir -p ~/lab/lab-vscode && cd ~/lab/lab-vscode
python3 -m venv .venv && source .venv/bin/activate

cat > scanner.py <<'EOF'
import socket, sys
host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
for port in (21, 22, 80, 443, 3306, 8080):
    s = socket.socket(); s.settimeout(0.4)
    if s.connect_ex((host, port)) == 0:
        print(f"[+] {host}:{port} aberto")
    s.close()
EOF

mkdir -p .vscode
cat > .vscode/tasks.json <<'EOF'
{
  "version": "2.0.0",
  "tasks": [{
    "label": "Run exploit",
    "type": "shell",
    "command": "python3 \${file} 127.0.0.1"
  }]
}
EOF

code . scanner.py`}
        expected={`[+] 127.0.0.1:22 aberto
[+] 127.0.0.1:80 aberto`}
        verify="Se a task abriu um terminal e imprimiu as portas abertas locais, o ciclo edit-run está funcionando. Replique tasks.json em todo projeto novo."
      />

      <AlertBox type="info" title="Esconda evidências em engagements">
        Em projetos sensíveis, use <code>code --user-data-dir=/tmp/op-X</code> para isolar o
        profile. Quando terminar, <code>rm -rf /tmp/op-X</code> e some todo histórico —
        nenhuma extensão fica registrada no perfil principal.
      </AlertBox>
    </PageContainer>
  );
}
