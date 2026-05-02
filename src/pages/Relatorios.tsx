import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

const sections = [
  { num: "01", title: "Capa", desc: "Cliente, data, autor, classificação (Confidencial), versão." },
  { num: "02", title: "Sumário Executivo", desc: "1-2 páginas para a diretoria. ZERO técnico. Risco ao negócio." },
  { num: "03", title: "Sumário de Vulnerabilidades", desc: "Tabela: ID, título, severidade, CVSS, status." },
  { num: "04", title: "Escopo & Metodologia", desc: "O que foi testado, quando, como, RoE, limitações." },
  { num: "05", title: "Findings detalhados", desc: "Cada um: descrição, PoC, evidência, impacto, fix." },
  { num: "06", title: "Apêndices", desc: "Saída de tools, comandos exatos, payloads, referências." },
];

const sevs = [
  { level: "Crítico", score: "9.0–10.0", desc: "RCE não-auth, data breach total. Fix em 24-72h.", color: "border-red-500/30 bg-red-500/10 text-red-400" },
  { level: "Alto", score: "7.0–8.9", desc: "Privesc, SSRF, dados sensíveis acessíveis com pouco esforço.", color: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  { level: "Médio", score: "4.0–6.9", desc: "XSS refletido, IDOR limitado, weak crypto.", color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
  { level: "Baixo", score: "0.1–3.9", desc: "Info disclosure (versões, headers).", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  { level: "Informativo", score: "0.0", desc: "Boa prática. Sem risco direto.", color: "border-border bg-muted/30 text-muted-foreground" },
];

export default function Relatorios() {
  return (
    <PageContainer
      title="Relatórios de pentest"
      subtitle="Estrutura padrão, scoring CVSS, template de finding, ferramentas de automação (Serpico, Dradis, Pwndoc), exportação MD→PDF."
      difficulty="avancado"
      timeToRead="14 min"
      prompt="docs/report"
    >
      <h2>Por que o relatório É o pentest</h2>
      <p>
        Sem relatório, o pentest não tem valor. O cliente paga pela <strong>capacidade de
        decisão</strong> — relatório legível pela diretoria, técnico para o time de segurança,
        com ROI claro de cada finding. Pentest amador entrega txt do nmap. Profissional entrega
        PDF de 80 páginas que vira projeto de remediation.
      </p>

      <h2>Estrutura padrão</h2>
      <div className="space-y-3 my-6">
        {sections.map((s, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="min-w-[40px] text-primary font-mono text-lg font-bold">{s.num}</div>
            <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3">
              <div className="font-bold text-sm text-foreground">{s.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Severidade — escala CVSS 3.1</h2>
      <div className="space-y-2 my-6">
        {sevs.map((s, i) => (
          <div key={i} className={`border rounded-lg px-4 py-3 ${s.color}`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{s.level}</span>
              <span className="font-mono text-xs">{s.score}</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{s.desc}</p>
          </div>
        ))}
      </div>

      <Terminal
        path="~"
        lines={[
          {
            comment: "calcular CVSS pela linha de comando (cvss-calc)",
            cmd: "pip install cvss && python3 -c \"from cvss import CVSS3; c=CVSS3('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'); print(c.scores())\"",
            out: `(9.8, 9.8, 5.9)        # base, temporal, environmental
                       # 9.8 = CRÍTICO`,
            outType: "warning",
          },
          {
            cmd: "python3 -c \"from cvss import CVSS3; c=CVSS3('CVSS:3.1/AV:L/AC:H/PR:H/UI:R/S:U/C:L/I:L/A:N'); print(c.scores(),c.severities())\"",
            out: `(2.5, 2.5, 2.5) ('Low', 'Low', 'Low')`,
            outType: "info",
          },
        ]}
      />

      <h2>Template de finding (markdown)</h2>
      <CodeBlock
        language="markdown"
        title="findings/F-001-sqli-login.md"
        code={`---
id: F-001
titulo: SQL Injection no endpoint de autenticação
severidade: Crítico
cvss: "9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)"
componente: /api/v1/auth/login
status: Aberto
data: 2026-04-03
autor: Wallyson Lopes
---

## Descrição

O parâmetro \`username\` do endpoint POST /api/v1/auth/login não é sanitizado
antes de ser concatenado em uma query SQL. Um atacante não autenticado pode
contornar a autenticação e extrair o conteúdo do banco de dados.

## Passos para reproduzir

1. Capture um login normal no Burp Suite
2. Modifique o body para incluir payload SQLi:

\`\`\`http
POST /api/v1/auth/login HTTP/1.1
Host: cliente.com.br
Content-Type: application/json

{"username":"admin' OR '1'='1","password":"qualquer"}
\`\`\`

3. Servidor responde 200 OK com token de admin:

\`\`\`json
{"token":"eyJhbGciOiJIUzI1NiIs...","user":{"id":1,"role":"admin"}}
\`\`\`

4. Confirmação automatizada com sqlmap (Anexo B):

\`\`\`bash
sqlmap -u "https://cliente.com.br/api/v1/auth/login" \\
  --data='{"username":"*","password":"x"}' \\
  --level=5 --risk=3 --batch --dbs
\`\`\`

Result: 14 databases dumpáveis, incluindo \`prod_users\` (140k registros).

## Evidências

- ![print_burp.png](../evidencias/F-001-burp.png)
- ![print_sqlmap.png](../evidencias/F-001-sqlmap.png)
- [request.har](../evidencias/F-001-request.har)

## Impacto ao Negócio

- Comprometimento total do banco de usuários (140.000 registros)
- Vazamento de PII: CPF, e-mail, telefone, endereço → **violação LGPD Art. 46**
- Acesso administrativo sem credenciais válidas
- Possível pivot para outros sistemas via reuso de senhas

**Multa LGPD estimada:** até 2% do faturamento (limitado a R$ 50 milhões)
**Custo de notificação:** ~R$ 12/usuário × 140.000 = R$ 1,68M

## Recomendação

### Imediato (24-72h)
1. Substituir todas as queries por **prepared statements** (PDO/parameterized)
2. Reset de senha forçado para todos os 140k usuários
3. Habilitar WAF em frente ao endpoint (regras OWASP CRS)

### Médio prazo (30 dias)
4. Code review completo do módulo de autenticação
5. Pentest de retest após fix
6. Notificação à ANPD se houver indício de exfiltração prévia

### Longo prazo
7. SAST no pipeline CI/CD (Semgrep, SonarQube)
8. Treinamento OWASP Top 10 para equipe de dev

## Referências

- [OWASP A03:2021 Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [LGPD Art. 46](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)`}
      />

      <h2>Sumário Executivo (sample)</h2>
      <OutputBlock label="primeiras 2 páginas — para diretoria" type="default">
{`SUMÁRIO EXECUTIVO

A Empresa contratou a [Sua Empresa] para realizar teste de intrusão (pentest)
nos sistemas web de produção entre 15/03/2026 e 28/03/2026. Foram avaliados
3 sistemas críticos: portal do cliente, API mobile e painel administrativo.

ACHADOS PRINCIPAIS

Foram identificadas 12 vulnerabilidades, distribuídas em:
  • 2 Críticas    (RCE no portal, SQLi no login)
  • 4 Altas       (privesc, SSRF, IDOR sensitive, JWT none)
  • 5 Médias
  • 1 Baixa

CONCLUSÃO

O ambiente apresenta RISCO ELEVADO de violação de dados pessoais (LGPD).
A vulnerabilidade F-001 (SQLi no login) permite acesso completo aos 140 mil
registros de usuários, sem qualquer autenticação ou rastreio. Estimamos
exposição financeira de R$ 1,68M a R$ 50M apenas neste finding.

Recomendamos:
  1. Bloqueio TEMPORÁRIO do endpoint vulnerável (24h)
  2. Implementação dos fixes técnicos (prazo 7 dias)
  3. Re-teste após correções (incluído no contrato)
  4. Avaliação jurídica sobre notificação à ANPD

Próximos passos detalhados na Seção 5 (Findings) e roadmap (Anexo A).

________________________
Wallyson Lopes (OSCP, OSCE)
Líder técnico do engagement
3 de abril de 2026`}
      </OutputBlock>

      <h2>Ferramentas para acelerar</h2>
      <CommandTable
        title="O que usar"
        variations={[
          { cmd: "Obsidian / CherryTree", desc: "Notas DURANTE o pentest.", output: "Markdown estruturado, screenshots." },
          { cmd: "Pwndoc", desc: "Web app open-source para gerar reports.", output: "Templates docx + audit trail." },
          { cmd: "Dradis CE", desc: "Plataforma colaborativa.", output: "Time todo edita o mesmo report." },
          { cmd: "SysReptor", desc: "Moderno, opinionated, BR-friendly.", output: "Mantido pela syslifters." },
          { cmd: "Serpico", desc: "Clássico (2014) ainda usado.", output: "Templates customizáveis." },
          { cmd: "Pandoc + LaTeX", desc: "Markdown → PDF profissional.", output: "Para quem prefere git/CLI." },
          { cmd: "PlexTrac (SaaS)", desc: "Pago, completo, integrações.", output: "Empresas grandes." },
        ]}
      />

      <h2>Pipeline MD → PDF (Pandoc)</h2>
      <Terminal
        path="~/cliente-x/relatorio"
        lines={[
          {
            cmd: "ls",
            out: `00-capa.md
01-sumario-executivo.md
02-escopo-metodologia.md
03-sumario-vulns.md
findings/
  F-001-sqli-login.md
  F-002-rce-upload.md
  F-003-jwt-none.md
  [...]
evidencias/
  F-001-burp.png
  F-001-sqlmap.png
  [...]
template.tex
build.sh`,
            outType: "info",
          },
          {
            cmd: "cat build.sh",
            out: `#!/bin/bash
set -euo pipefail

# 1) concatenar tudo na ordem
cat 00-capa.md \\
    01-sumario-executivo.md \\
    02-escopo-metodologia.md \\
    03-sumario-vulns.md \\
    findings/F-*.md \\
    99-anexos.md > _full.md

# 2) gerar PDF com template customizado
pandoc _full.md \\
  --from markdown \\
  --pdf-engine=xelatex \\
  --template=template.tex \\
  --toc --toc-depth=3 \\
  --highlight-style=monochrome \\
  --metadata title="Pentest Relatório — Cliente X" \\
  --metadata author="Wallyson Lopes" \\
  --metadata date="$(date +%Y-%m-%d)" \\
  -o relatorio-final-$(date +%Y%m%d).pdf

echo "[+] gerado: relatorio-final-$(date +%Y%m%d).pdf"`,
            outType: "default",
          },
          {
            cmd: "./build.sh",
            out: `[+] gerado: relatorio-final-20260403.pdf
-rw-r--r-- 1 wallyson wallyson 4.2M Apr  3 23:14 relatorio-final-20260403.pdf`,
            outType: "success",
          },
          {
            comment: "verificação: todos os assets embutidos? PDF/A? cifrado por senha?",
            cmd: "qpdf --is-encrypted relatorio-final-20260403.pdf || qpdf --encrypt 'senha' '' 256 -- relatorio-final-20260403.pdf relatorio-final-cifrado.pdf",
            out: `qpdf: relatorio-final-20260403.pdf is not encrypted
(cifrando...)
qpdf: relatorio-final-cifrado.pdf criado com AES-256`,
            outType: "info",
          },
        ]}
      />

      <h2>Comunicação ao cliente</h2>
      <OutputBlock label="o que dizer/fazer ALÉM do PDF" type="info">
{`1. Reunião de kickoff (antes do pentest)
   - Apresenta time, escopo, RoE, contatos de emergência

2. Daily/weekly status (durante)
   - Slack/email curto: % completo, achados preliminares CRÍTICOS

3. Urgent disclosure (durante, se C/H)
   - Crítico achado no D+1 = ligação imediata + email + ticket
   - NÃO espera o relatório final para reportar RCE

4. Reunião de entrega (após)
   - Walkthrough do relatório com time técnico (45 min)
   - Walkthrough executivo com diretoria (15 min, slides)

5. Suporte à remediação (incluído ou opcional)
   - Tira dúvida sobre fix
   - Re-teste após correção

6. Re-teste formal
   - 30/60 dias após relatório
   - Fee reduzido (já tem contexto)
   - Resultado vira anexo do relatório original`}
      </OutputBlock>

      <PracticeBox
        title="Escreva 1 finding completo (1h)"
        goal="Praticar template em situação real: documente o XSS armazenado de DVWA local."
        steps={[
          "Suba DVWA local (docker run -d -p 8080:80 vulnerables/web-dvwa).",
          "Configure security=low. Vá em XSS Stored.",
          "Insira payload <script>alert(document.cookie)</script>.",
          "Capture: request no Burp, response, screenshot do alert.",
          "Escreva F-001-xss-livro.md seguindo o template exato acima.",
          "Gere PDF com: pandoc F-001*.md -o finding.pdf --pdf-engine=xelatex",
        ]}
        command={`docker run -d -p 8080:80 vulnerables/web-dvwa
# (configurar DVWA via browser, security=low, login admin/password)

# capturar payload no Burp + tirar 2 screenshots

# escrever finding (use template acima)
cat > F-001-xss-stored.md <<'EOF'
---
id: F-001
titulo: Stored XSS em /vulnerabilities/xss_s/
severidade: Alto
cvss: "8.7"
[...]
EOF

# gerar PDF
pandoc F-001-xss-stored.md \\
  --pdf-engine=xelatex \\
  --highlight-style=monochrome \\
  -o F-001-finding.pdf`}
        expected={`-rw-r--r-- 1 wallyson wallyson 312K Apr  3 23:42 F-001-finding.pdf`}
        verify="Abra o PDF: deve ter sumário, formatação consistente, código colorido, screenshots embutidos. Esse é o nível mínimo profissional."
      />

      <AlertBox type="warning" title="Screenshots ÚTEIS, não decorativos">
        Cada screenshot deve provar UMA afirmação ("o servidor retornou 200 com token de admin").
        Borre <strong>tudo</strong> que for PII (e-mails reais, CPFs, IPs internos NÃO autorizados).
        Use ferramentas como <code>flameshot</code> ou <code>shutter</code> com blur built-in.
      </AlertBox>

      <AlertBox type="info" title="Documente DURANTE, escreve DEPOIS">
        90% do esforço de relatório é reconstruir o que foi feito. Use Obsidian em janela
        sempre aberta com 1 nota por finding. Cole comandos + outputs em tempo real. No final,
        copia/cola pra template e fica pronto em 1/3 do tempo.
      </AlertBox>
    </PageContainer>
  );
}
