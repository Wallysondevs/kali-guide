import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function Whatweb() {
    return (
      <PageContainer
        title="WhatWeb & Identificação de Tecnologias"
        subtitle="Identifique automaticamente CMS, frameworks, servidores e tecnologias usadas em sites alvo."
        difficulty="iniciante"
        timeToRead="8 min"
      >
        <AlertBox type="info" title="Reconhecimento passivo com toque ativo">
          Identificar tecnologias é crucial para saber quais vulnerabilidades buscar.
          WhatWeb faz isso com precisão usando mais de 1800 plugins.
        </AlertBox>

        <h2>Instalação e Uso Básico</h2>
        <CodeBlock language="bash" code={'# Já instalado no Kali\nwhatweb https://exemplo.com\n\n# Nível de verbose (-v, -a)\n# 1 = quiet, 3 = verbose, 4 = debug\nwhatweb -v https://exemplo.com\nwhatweb -a 3 https://exemplo.com\n\n# Salvar output\nwhatweb https://exemplo.com --log-brief=resultado.txt\nwhatweb https://exemplo.com --log-json=resultado.json'} />

        <h2>Varredura em Múltiplos Hosts</h2>
        <CodeBlock language="bash" code={'# Lista de URLs\nwhatweb -i urls.txt\n\n# Faixa de IPs\nwhatweb 192.168.1.0/24\n\n# Múltiplos URLs\nwhatweb https://site1.com https://site2.com https://site3.com\n\n# Com agressividade (mais requisições = mais dados)\nwhatweb -a 4 https://exemplo.com  # máximo, bem ruidoso'} />

        <h2>O que o WhatWeb Detecta?</h2>
        <CodeBlock language="bash" code={'# Exemplos de saída:\n# https://wordpress.site.com\n# WhatWeb report for https://wordpress.site.com\n# Status    : 200 OK\n# Title     : Meu Blog\n# IP        : 192.168.1.100\n# Country   : BRAZIL, BR\n\n# WordPress[6.4.2]\n# Apache[2.4.51]\n# PHP[8.1.0]\n# MySQL\n# jQuery[3.6.0]\n# Bootstrap[5.3.0]\n# Google-Analytics[UA-12345678-1]\n\n# Ação pós-whatweb:\n# WordPress 6.4.2 → wpscan para vulnerabilidades WP\n# Apache 2.4.51   → searchsploit apache 2.4.51\n# PHP 8.1.0       → checar CVEs de PHP 8.1.x'} />

        <h2>Alternativas</h2>
        <CodeBlock language="bash" code={'# Wappalyzer (extensão de browser — muito visual)\n# https://www.wappalyzer.com\n\n# BuiltWith (online)\n# https://builtwith.com\n\n# Netcraft\n# https://searchdns.netcraft.com\n\n# Retire.js (JavaScript vulnerável)\nnpm install -g retire\nretire --js https://exemplo.com\n\n# Nuclei com template de tech detection\nnuclei -u https://exemplo.com -t technologies/'} />

        <AlertBox type="success" title="Combinando com Shodan">
          Use as tecnologias encontradas pelo WhatWeb para criar buscas específicas no Shodan.
          Ex: encontrou Apache 2.4.49 → Shodan: "Server: Apache/2.4.49 country:BR"
          → todos os sites vulneráveis no Brasil!
        </AlertBox>
      </PageContainer>
    );
  }
  