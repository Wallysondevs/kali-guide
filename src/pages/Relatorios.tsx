import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Relatorios() {
  return (
    <PageContainer
      title="Relatórios de Pentest"
      subtitle="Como documentar e comunicar os resultados de um teste de penetração de forma profissional."
      difficulty="avancado"
      timeToRead="10 min"
    >
      <h2>Por que o relatório é crucial?</h2>
      <p>
        Um pentest sem relatório não tem valor. O relatório é o entregável principal para o cliente — 
        é o que justifica o investimento e direciona as correções. Um bom relatório separa 
        um profissional de um scriptkiddie.
      </p>

      <h2>Estrutura de um relatório profissional</h2>
      <div className="space-y-3 my-6">
        {[
          { num: "01", title: "Página de capa", desc: "Nome do cliente, data, classificação (Confidencial), logo" },
          { num: "02", title: "Sumário Executivo", desc: "2-3 parágrafos para a diretoria. Sem técnico. O que foi encontrado e qual risco ao negócio?" },
          { num: "03", title: "Sumário de Vulnerabilidades", desc: "Tabela com todas as vulnerabilidades, severidade e status" },
          { num: "04", title: "Escopo e Metodologia", desc: "O que foi testado, quando, como e quais limitações" },
          { num: "05", title: "Vulnerabilidades Detalhadas", desc: "Para cada vulns: descrição, evidência, risco, recomendação" },
          { num: "06", title: "Apêndices", desc: "Saída de ferramentas, evidências completas, referências" },
        ].map((sec, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="min-w-[40px] text-primary font-mono text-lg font-bold">{sec.num}</div>
            <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3">
              <div className="font-bold text-sm text-foreground">{sec.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{sec.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Classificação de severidade (CVSS)</h2>
      <div className="space-y-2 my-6">
        {[
          { level: "Crítico", score: "9.0–10.0", color: "bg-red-500/20 border-red-500/30 text-red-400", desc: "Exploração remota, sem autenticação, acesso root. Ex: RCE, SQLi com admin" },
          { level: "Alto", score: "7.0–8.9", color: "bg-orange-500/20 border-orange-500/30 text-orange-400", desc: "Impacto alto mas com condições. Ex: escalação de privilégio, SSRF" },
          { level: "Médio", score: "4.0–6.9", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400", desc: "Impacto limitado ou requer interação. Ex: XSS refletido, IDOR limitado" },
          { level: "Baixo", score: "0.1–3.9", color: "bg-blue-500/20 border-blue-500/30 text-blue-400", desc: "Pouco impacto. Ex: informações de versão, headers faltando" },
          { level: "Informativo", score: "0.0", color: "bg-muted/30 border-border text-muted-foreground", desc: "Sem risco imediato mas boa prática a corrigir. Ex: cookies sem HttpOnly" },
        ].map((sev, i) => (
          <div key={i} className={`border rounded-lg px-4 py-3 ${sev.color}`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{sev.level}</span>
              <span className="font-mono text-xs">{sev.score}</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{sev.desc}</p>
          </div>
        ))}
      </div>

      <h2>Template de vulnerabilidade</h2>
      <CodeBlock language="markdown" code={`## VUL-001: SQL Injection na Tela de Login

**Severidade:** Crítico (CVSS 9.8)
**Componente:** /api/v1/auth/login
**CVE:** N/A (vulnerability original)
**Status:** Aberto

### Descrição
O parâmetro 'username' do endpoint de autenticação não sanitiza a entrada 
do usuário, permitindo injeção SQL. Um atacante pode contornar a autenticação 
ou extrair o banco de dados completo.

### Evidência / Prova de Conceito
Request:
  POST /api/v1/auth/login HTTP/1.1
  Host: cliente.com.br
  Content-Type: application/json
  
  {"username": "admin'--", "password": "qualquer"}

Response:
  HTTP/1.1 200 OK
  {"token": "eyJ...", "user": {"id": 1, "role": "admin"}}

Comandos utilizados:
  sqlmap -u "https://cliente.com.br/api/v1/auth/login" \\
    --data='{"username":"*","password":"x"}' \\
    --level=5 --risk=3

### Impacto ao Negócio
Comprometimento total do banco de dados de usuários (140.000 registros), 
incluindo dados pessoais (CPF, email, telefone). Violação da LGPD.
Acesso administrativo ao sistema sem credenciais válidas.

### Recomendação
1. **Imediato:** Usar prepared statements / parameterized queries em todas as queries
2. **Curto prazo:** Implementar WAF para detecção/bloqueio de SQLi
3. **Médio prazo:** Code review de todo o código de acesso a banco de dados

Referências:
- OWASP A03:2021 - Injection
- CWE-89: SQL Injection`} />

      <h2>Ferramentas para gerar relatórios</h2>
      <CodeBlock language="bash" code={`# Serpico — gerador de relatórios de pentest
git clone https://github.com/SerpicoProject/Serpico
cd Serpico && bundle install
ruby serpico.rb

# Dradis — plataforma colaborativa de pentest
sudo apt install -y dradis

# Magic Tree — gestão de dados de pentest
# Download: gremwell.com/blog/magic_tree_104

# PlexTrac — plataforma SaaS moderna

# Pandoc — converter Markdown para PDF/Word
sudo apt install -y pandoc texlive-xetex
pandoc relatorio.md -o relatorio.pdf --pdf-engine=xelatex`} />

      <AlertBox type="info" title="Dica: Documente durante o teste">
        Faça screenshots e salve outputs de cada etapa durante o pentest. 
        É muito mais fácil documentar ao longo do processo do que tentar reconstruir após. 
        Use o <strong>CherryTree</strong> ou <strong>Obsidian</strong> para anotações em tempo real.
      </AlertBox>
    </PageContainer>
  );
}
