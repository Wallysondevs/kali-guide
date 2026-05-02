import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Git() {
  return (
    <PageContainer
      title="Git no Kali — clonar tools, salvar notas, caçar segredos vazados"
      subtitle="Workflow básico, repo privado de notas de engagement, gitleaks/trufflehog em .git exposto, recuperar commits apagados."
      difficulty="iniciante"
      timeToRead="18 min"
    >
      <h2>Git pra quem faz pentest</h2>
      <p>
        Você usa git diariamente em três frentes: (1) <strong>clonar ferramentas</strong> do GitHub
        (impacket, sliver, BloodHound), (2) versionar suas <strong>notas, scripts e payloads</strong>{" "}
        em repo privado (GitHub/GitLab/Gitea local), (3) <strong>atacar git mal configurado</strong>:
        repos públicos com segredos no histórico, <code>.git/</code> exposto em web servers,
        forks de funcionários expondo código interno.
      </p>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "git --version",
            out: "git version 2.45.2",
            outType: "info",
          },
          {
            comment: "config global obrigatória",
            cmd: "git config --global user.name 'Wallyson' && git config --global user.email 'pentest@local'",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "git config --global init.defaultBranch main && git config --global pull.rebase true",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "git config --global --list",
            out: `user.name=Wallyson
user.email=pentest@local
init.defaultbranch=main
pull.rebase=true
core.editor=vim
color.ui=auto`,
            outType: "default",
          },
        ]}
      />

      <h2>Comandos essenciais</h2>
      <CommandTable
        title="Cheatsheet diária"
        variations={[
          { cmd: "git clone <url>", desc: "Baixa repo + histórico completo.", output: "Cloning into 'impacket'..." },
          { cmd: "git clone --depth 1 <url>", desc: "Shallow: só o último commit. 5-50x mais rápido.", output: "Pra tools que você só vai compilar." },
          { cmd: "git status -sb", desc: "Status compacto + branch atual.", output: "## main...origin/main\\n M arquivo.tsx" },
          { cmd: "git add -p", desc: "Adiciona em pedaços (revisa hunk a hunk).", output: "Stage this hunk [y,n,q,a,d,s,e,?]?" },
          { cmd: "git commit -m 'msg'", desc: "Commita staged.", output: "[main 8a3f2c1] msg" },
          { cmd: "git commit --amend --no-edit", desc: "Junta novas mudanças no último commit.", output: "Sem novo commit, sobrescreve." },
          { cmd: "git log --oneline --graph --all -20", desc: "Visualiza árvore.", output: "* 8a3f2c1 (HEAD -> main) commit recente" },
          { cmd: "git diff HEAD~3", desc: "Diff dos últimos 3 commits.", output: "Mostra TUDO que mudou desde então." },
          { cmd: "git stash && git stash pop", desc: "Salva mudanças não-commitadas, recupera depois.", output: "Pra trocar de branch sem perder trabalho." },
          { cmd: "git reflog", desc: "TODOS os HEADs que sua repo já teve. Salva-vidas.", output: "Mesmo após reset --hard, tá lá." },
        ]}
      />

      <h2>Workflow: notas privadas de engagement</h2>
      <Terminal
        path="~/notes"
        lines={[
          {
            cmd: "git init pentest-acme-2026 && cd pentest-acme-2026",
            out: "Initialized empty Git repository in /home/wallyson/notes/pentest-acme-2026/.git/",
            outType: "info",
          },
          {
            cmd: "mkdir -p {recon,exploits,loot,reports} && touch README.md",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            comment: ".gitignore CRÍTICO: sem isso, vc commita senha",
            cmd: "cat > .gitignore <<'EOF'\n*.pcap\n*.cap\n*.kdbx\n*.pem\n*.key\n*_id_rsa*\nloot/raw/\n.env\nsecrets.txt\nEOF",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "git add . && git commit -m 'init: estrutura engagement Acme'",
            out: `[main (root-commit) f1e2d3c] init: estrutura engagement Acme
 2 files changed, 9 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md`,
            outType: "success",
          },
          {
            comment: "remote privado em Gitea local (preferível a GitHub pra dados sensíveis)",
            cmd: "git remote add origin git@gitea.local:wallyson/pentest-acme-2026.git",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "git push -u origin main",
            out: `Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Writing objects: 100% (4/4), 412 bytes | 412.00 KiB/s, done.
Total 4 (delta 0), reused 0 (delta 0)
To gitea.local:wallyson/pentest-acme-2026.git
 * [new branch]      main -> main`,
            outType: "success",
          },
        ]}
      />

      <AlertBox type="danger" title="NUNCA push de loot pra GitHub público">
        Mesmo em repo "private", a chave do GitHub deles é deles. Hash de senha de cliente em GitHub
        SaaS pode quebrar contrato e levar processo. Use Gitea/Gogs auto-hospedado em VM separada,
        ou ao menos GitHub Enterprise on-prem.
      </AlertBox>

      <h2>Branching e merge</h2>
      <Terminal
        path="~/pentest-acme-2026"
        lines={[
          {
            cmd: "git checkout -b exploit/cve-2024-12345",
            out: "Switched to a new branch 'exploit/cve-2024-12345'",
            outType: "info",
          },
          {
            cmd: "echo 'PoC inicial' > exploits/poc.py && git add . && git commit -m 'wip: poc'",
            out: "[exploit/cve-2024-12345 a7b8c9d] wip: poc",
            outType: "muted",
          },
          {
            cmd: "git checkout main && git merge exploit/cve-2024-12345 --no-ff -m 'merge: PoC validado'",
            out: `Merge made by the 'ort' strategy.
 exploits/poc.py | 1 +
 1 file changed, 1 insertion(+)`,
            outType: "success",
          },
          {
            cmd: "git branch -d exploit/cve-2024-12345",
            out: "Deleted branch exploit/cve-2024-12345 (was a7b8c9d).",
            outType: "muted",
          },
          {
            comment: "rebase: limpa histórico antes de mergear",
            cmd: "git rebase -i HEAD~5",
            out: `pick a1b2c3d wip 1
squash e4f5g6h wip 2
squash 7h8i9j0 wip 3
pick k1l2m3n feat: scanner final
(salva → vira só 2 commits limpos)`,
            outType: "warning",
          },
        ]}
      />

      <h2>Desfazendo coisas</h2>
      <CommandTable
        title="Quando você quebrou"
        variations={[
          { cmd: "git restore arquivo.txt", desc: "Descarta mudança não-commitada.", output: "Volta ao estado do último commit." },
          { cmd: "git restore --staged arquivo.txt", desc: "Tira do stage (mantém edição).", output: "Equivale ao git reset HEAD." },
          { cmd: "git reset --soft HEAD~1", desc: "Desfaz último commit, mantém mudanças staged.", output: "Pra refazer mensagem ou agrupar." },
          { cmd: "git reset --hard HEAD~1", desc: "DELETA último commit + mudanças. Cuidado.", output: "git reflog ainda salva." },
          { cmd: "git revert <commit>", desc: "Cria NOVO commit que desfaz outro. Seguro pra histórico público.", output: "Reversão sem reescrever." },
          { cmd: "git cherry-pick <hash>", desc: "Aplica commit específico de outra branch.", output: "Pega o fix sem mergear tudo." },
          { cmd: "git reflog && git reset --hard HEAD@{2}", desc: "Volta pra HEAD anterior (após reset acidental).", output: "Salva-vidas." },
        ]}
      />

      <h2>Atacando git exposto na web</h2>
      <p>
        Cenário comum: dev publicou app PHP/Node sem mover <code>.git/</code> pro fora do docroot.
        Resultado: você baixa o repo inteiro, vê histórico, encontra credenciais commitadas.
      </p>

      <Terminal
        path="~/recon"
        lines={[
          {
            comment: "1) descobrir se .git existe",
            cmd: "curl -s -o /dev/null -w '%{http_code}\\n' https://target.com/.git/HEAD",
            out: "200",
            outType: "warning",
          },
          {
            cmd: "curl -s https://target.com/.git/HEAD",
            out: "ref: refs/heads/main",
            outType: "error",
          },
          {
            comment: "2) baixar tudo com git-dumper",
            cmd: "pipx install git-dumper && git-dumper https://target.com/.git/ ./target-git",
            out: `[-] Testing https://target.com/.git/HEAD [200]
[-] Testing https://target.com/.git/ [403]
[-] Fetching .git recursively
[-] Fetching common files
[-] Finding refs/
[-] Finding packed objects
[-] Finding objects
[-] Fetching objects: 100% [1842 files]
[+] Sanitizing repository
[+] Running git checkout
HEAD is now at 8c3a91f deploy v2.4`,
            outType: "success",
          },
          {
            cmd: "cd target-git && git log --oneline | head -10",
            out: `8c3a91f deploy v2.4
a72bf01 fix: remove db credentials  ← suspeito
6e3c12d add admin panel
b1a2c3d initial`,
            outType: "info",
          },
          {
            comment: "3) ver o que estava ANTES do 'remove credentials'",
            cmd: "git show a72bf01 -- config/database.php",
            out: `-$DB_PASS = "Acme@2024!Rds";
-$DB_HOST = "prod-db.acme.internal";
+$DB_PASS = getenv('DB_PASS');
+$DB_HOST = getenv('DB_HOST');`,
            outType: "error",
          },
        ]}
      />

      <h2>gitleaks & trufflehog — caça segredos automatizada</h2>
      <Terminal
        path="~/target-git"
        lines={[
          {
            cmd: "wget -qO- https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz | tar xz gitleaks && sudo mv gitleaks /usr/local/bin/",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "gitleaks detect --source . --verbose --report-format json --report-path leaks.json",
            out: `    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     password = "Acme@2024!Rds"
Secret:      Acme@2024!Rds
RuleID:      generic-api-key
Entropy:     3.4
File:        config/database.php
Line:        12
Commit:      a72bf01...
Author:      João Dev <joao@acme.corp>
Date:        2024-08-12

Finding:     AWS_SECRET = "wJalrXUt..."
RuleID:      aws-access-token
File:        deploy/secrets.yml
Commit:      6e3c12d
[...]
8:00AM INF 4 leaks found in 142 commits`,
            outType: "error",
          },
          {
            comment: "trufflehog: foca em segredos VERIFICADOS (chama API real pra confirmar)",
            cmd: "trufflehog git file://. --only-verified",
            out: `Found verified result 🐷🔑
Detector Type: AWS
Decoder Type: PLAIN
Raw result: AKIAIOSFODNN7EXAMPLE
File: deploy/secrets.yml
Email: joao@acme.corp
Repository: file://.
Commit: 6e3c12d
Verified: true
[+] AWS account: 123456789012, user: deploy-user`,
            outType: "warning",
          },
        ]}
      />

      <h2>Recuperando objetos "apagados"</h2>
      <p>
        Mesmo após <code>git rm</code> + commit, o blob original continua no <code>.git/objects/</code>{" "}
        até o próximo <code>gc --aggressive</code>. Atacante (ou você no recon) pode recuperar.
      </p>

      <Terminal
        path="~/target-git"
        lines={[
          {
            cmd: "git fsck --lost-found",
            out: `Checking object directories: 100% (256/256), done.
dangling blob 5f4dcc3b5aa765d61d8327deb882cf99
dangling blob a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8
dangling commit 7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f`,
            outType: "warning",
          },
          {
            cmd: "git show 5f4dcc3b5aa765d61d8327deb882cf99",
            out: `# Backup do .env removido por engano
DB_PASSWORD=Welcome2024!
JWT_SECRET=changeme-in-prod
STRIPE_KEY=sk_live_4eC39H...`,
            outType: "error",
          },
          {
            comment: "lista TODOS os objetos do repo",
            cmd: "git rev-list --objects --all | wc -l",
            out: "1842",
            outType: "info",
          },
          {
            comment: "procura pattern em TUDO que já esteve no repo",
            cmd: "git rev-list --all | xargs git grep -l 'AKIA' 2>/dev/null",
            out: `8c3a91f:deploy/secrets.yml
6e3c12d:deploy/old-secrets.yml
a72bf01:deploy/secrets.yml.bak`,
            outType: "warning",
          },
        ]}
      />

      <h2>SSH keys + repo privado</h2>
      <CodeBlock
        language="ini"
        title="~/.ssh/config"
        code={`# Hosts git separados — chave dedicada por contexto
Host github-pessoal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_pessoal
    IdentitiesOnly yes

Host github-pentest
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_pentest
    IdentitiesOnly yes

Host gitea.local
    HostName gitea.lab.local
    Port 2222
    User git
    IdentityFile ~/.ssh/id_ed25519_lab
    IdentitiesOnly yes`}
      />

      <Terminal
        path="~"
        lines={[
          {
            cmd: "ssh-keygen -t ed25519 -C 'pentest-2026' -f ~/.ssh/id_ed25519_pentest -N ''",
            out: `Generating public/private ed25519 key pair.
Your identification has been saved in /home/wallyson/.ssh/id_ed25519_pentest
Your public key has been saved in /home/wallyson/.ssh/id_ed25519_pentest.pub
The key fingerprint is:
SHA256:XYZabc123... pentest-2026`,
            outType: "info",
          },
          {
            cmd: "git clone git@github-pentest:wallyson/red-team-notes.git",
            out: `Cloning into 'red-team-notes'...
warning: You appear to have cloned an empty repository.`,
            outType: "success",
          },
        ]}
      />

      <h2>Hooks pra evitar leak</h2>
      <CodeBlock
        language="bash"
        title=".git/hooks/pre-commit (impede push de segredos)"
        code={`#!/usr/bin/env bash
# Pre-commit local: roda gitleaks antes de cada commit.
set -e

if ! command -v gitleaks >/dev/null; then
  echo "[!] gitleaks não instalado, pulando check"
  exit 0
fi

if gitleaks protect --staged --no-banner --redact -v; then
  echo "[+] sem segredos detectados"
  exit 0
else
  echo
  echo "[!!!] SEGREDO DETECTADO no que você ia commitar."
  echo "[!!!] revise as linhas acima. pra forçar (não recomendado): git commit --no-verify"
  exit 1
fi`}
      />

      <PracticeBox
        title="Pipeline mini: detecte segredo antes que escape"
        goal="Configurar pre-commit + tentar commitar segredo + ver o hook abortar."
        steps={[
          "Instale gitleaks.",
          "Crie repo limpo e copie o hook acima.",
          "Tente commitar arquivo com AWS key.",
          "Veja o commit abortar.",
        ]}
        command={`mkdir test-leak && cd test-leak && git init -q
cp ../seu-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

cat > config.yml <<EOF
aws_secret: AKIAIOSFODNN7EXAMPLE
aws_token: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EOF

git add config.yml
git commit -m "deploy config" 2>&1 | tail -10`}
        expected={`Finding:     aws_secret: AKIA...
RuleID:      aws-access-token
File:        config.yml

[!!!] SEGREDO DETECTADO no que você ia commitar.
[!!!] revise as linhas acima. pra forçar (não recomendado): git commit --no-verify`}
        verify="O commit NÃO acontece. Confirme com git log → 'fatal: your current branch does not have any commits yet'."
      />

      <AlertBox type="info" title="Padrões de recon git extras">
        Em bug bounty, sempre teste essas URLs no alvo: <code>/.git/config</code>,{" "}
        <code>/.git/HEAD</code>, <code>/.gitignore</code>, <code>/.gitlab-ci.yml</code>,{" "}
        <code>/.github/workflows/deploy.yml</code>. CI configs vazam secrets, paths internos e
        cadeia de deploy completa.
      </AlertBox>
    </PageContainer>
  );
}
