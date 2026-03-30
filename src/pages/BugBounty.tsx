import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function BugBounty() {
    return (
      <PageContainer
        title="Bug Bounty — Ganhe Dinheiro Achando Bugs"
        subtitle="Aprenda a participar de programas de bug bounty, encontrar vulnerabilidades reais e receber recompensas."
        difficulty="intermediario"
        timeToRead="14 min"
      >
        <AlertBox type="success" title="Legal e lucrativo!">
          Bug bounty é a forma 100% legal de aplicar habilidades de pentest.
          Plataformas como HackerOne e Bugcrowd pagam de US$ 100 a US$ 100.000+ por vulnerabilidades.
        </AlertBox>

        <h2>Plataformas de Bug Bounty</h2>
        <CodeBlock language="bash" code={'# Principais plataformas:\n\n# HackerOne — https://hackerone.com\n# - Maior plataforma, mais programas\n# - Inclui: Google, Twitter, Uber, Shopify, DoD\n\n# Bugcrowd — https://bugcrowd.com\n# - Boa quantidade de programas\n\n# Intigriti — https://intigriti.com\n# - Popular na Europa\n\n# Open Bug Bounty — https://openbugbounty.org\n# - XSS e injeções em sites não participantes (responsível)\n\n# Programas privados (sem plataforma):\n# - Google VRP: https://bughunters.google.com\n# - Facebook: https://www.facebook.com/whitehat\n# - Microsoft: https://www.microsoft.com/en-us/msrc/bounty'} />

        <h2>Como Começar</h2>
        <CodeBlock language="bash" code={'# 1. Criar perfil nas plataformas\n# 2. Escolher um programa com escopo aberto e recompensas baixas (para aprender)\n# 3. Ler o programa COMPLETAMENTE:\n#    - O que está no escopo (in-scope)\n#    - O que está fora do escopo (out-of-scope)\n#    - O que já foi reportado (duplicatas)\n#    - Tipos de vulnerabilidades que aceitam\n\n# Ferramentas para bug bounty:\n# Reconhecimento:\nbashsudo apt install subfinder amass httpx -y\nsubfinder -d empresa.com | httpx -status-code\n\n# Encontrar parâmetros para fuzzing:\nparamspider -d empresa.com\ngau empresa.com | grep "?"  # Get All URLs\n\n# Ferramentas específicas:\nkiterunner  # API enumeration\nffuf         # fuzzing\nferoxbuster  # directory brute'} />

        <h2>Metodologia de Bug Bounty</h2>
        <CodeBlock language="bash" code={'#!/bin/bash\n# bb_recon.sh — recon básico para bug bounty\n\nDOMINIO="$1"\n\n# 1. Subdomínios\nsubfinder -d "$DOMINIO" -o subs.txt\namass enum -passive -d "$DOMINIO" >> subs.txt\nsort subs.txt | uniq > subs_unique.txt\n\n# 2. Verificar quais estão online\ncat subs_unique.txt | httpx -status-code -o alive.txt\n\n# 3. Screenshots de todos\ncat alive.txt | gowitness scan -o screenshots/\n\n# 4. Nuclei em todos\nnuclei -l alive.txt -t cves/ -t misconfiguration/ -severity medium,high,critical\n\n# 5. WAF detection\ncat alive.txt | wafw00f -a'} />

        <h2>Escribendo um Bom Relatório</h2>
        <CodeBlock language="bash" code={'# Estrutura de um relatório de bug bounty de qualidade:\n\n# Título: Claro e específico\n# ❌ "SQL Injection no site"\n# ✅ "SQL Injection não autenticado no endpoint /api/search permite extração do banco de dados"\n\n# Severidade: Usar CVSS score ou escala da plataforma\n# Critical: RCE, SQLi com exfiltração, auth bypass admin\n# High: SQLi, stored XSS, IDOR com dados sensíveis\n# Medium: Reflected XSS, CSRF, auth bypass parcial\n# Low: Open redirect, rate limiting ausente\n\n# Passos para Reproduzir (detalhados):\n# 1. Acesse https://app.com/search\n# 2. Insira no campo de busca: \' OR 1=1--\n# 3. Observe o erro de SQL na resposta\n# 4. [screenshot aqui]\n\n# Impacto:\n# "Um atacante pode extrair todos os dados do banco, incluindo senhas e dados de clientes"\n\n# Prova de Conceito:\n# Payload exato, URL, headers, resposta\n\n# Remediação sugerida:\n# "Use prepared statements / parameterized queries"'} />

        <h2>Dicas para Maximizar Recompensas</h2>
        <CodeBlock language="bash" code={'# 1. Foque em impacto, não em quantidade\n# Um RCE vale mais que 50 reflected XSS\n\n# 2. Encadeie vulnerabilidades\n# SSRF + metadata access = maior impacto\n# Reflected XSS + CSRF = account takeover\n\n# 3. Teste APIs modernas (GraphQL, REST)\n# Menos testadas, mais chance de achar bugs\n\n# 4. Foque em login/auth/reset de senha\n# Account takeover = sempre alta recompensa\n\n# 5. Automatize o recon, manualize a exploração\n# Ferramentas acham o óbvio. Sua criatividade acha o oculto\n\n# 6. Leia os relatórios públicos do HackerOne\n# https://hackerone.com/hacktivity\n# Aprenda como outros pesquisadores acham bugs'} />

        <AlertBox type="info" title="Seja ético — siga as regras do programa">
          Sempre leia e respeite as regras do programa. Nunca exfiltrar dados reais de usuários.
          Reportar imediatamente se encontrar dados sensíveis. A comunidade de bug bounty
          é pequena — reputação importa muito.
        </AlertBox>
      </PageContainer>
    );
  }
  