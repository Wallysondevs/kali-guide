import{j as e}from"./index-CAFCz3B4.js";import{P as t}from"./PageContainer-CxmWgrx_.js";import{A as i}from"./AlertBox-Dze8I6Zt.js";import{C as o}from"./CommandTable-CZCYoWRB.js";import{O as a}from"./OutputBlock-PlIt9_KT.js";import{T as s,P as r}from"./PracticeBox-BDRu97pg.js";function p(){return e.jsxs(t,{title:"Autopsy — GUI forense (TSK)",subtitle:"Interface gráfica para Sleuthkit. Casos, ingest modules, timeline, keyword search, web/mobile artifacts.",difficulty:"intermediario",timeToRead:"13 min",children:[e.jsx("h2",{children:"Setup"}),e.jsx(s,{path:"~",lines:[{comment:"no Kali há a versão antiga (CLI web). Para a moderna (Java GUI), baixe do site",cmd:"wget https://github.com/sleuthkit/autopsy/releases/download/autopsy-4.21.0/autopsy-4.21.0.zip",out:"(autopsy-4.21.0.zip — 521 MB)",outType:"muted"},{cmd:"unzip autopsy-4.21.0.zip && cd autopsy-4.21.0 && bash unix_setup.sh",out:`------------------------------------------------------------
Sleuthkit Java requirements:
  - Java 17 OpenJDK
  - testdisk
  - libafflib
  - libewf
[+] All dependencies satisfied
[+] Setup complete. Run with: bin/autopsy`,outType:"info"},{cmd:"bin/autopsy &",out:"(abre Java GUI)",outType:"default"}]}),e.jsx("h2",{children:"Workflow básico"}),e.jsx("h3",{children:"1. Criar caso"}),e.jsx(a,{label:"New Case → preencher",type:"default",children:`Case Name:           Caso-001-Suspeito-X
Case Number:         2026-001
Examiner:            Ana Lopes
Description:         Análise do laptop XYZ apreendido em 2026-04-03
Case Type:           Single-user / Multi-user
Base Directory:      /home/ana/casos/`}),e.jsx("h3",{children:"2. Adicionar fonte de dados"}),e.jsx(a,{label:"Add Data Source — opções",type:"info",children:`☐ Disk Image or VM File   (.dd, .E01, .vmdk, .vhd)
☐ Local Disk              (montagem direta — read-only forçado)
☐ Logical Files           (pasta com arquivos extraídos)
☐ Unallocated Space Image File`}),e.jsx("h3",{children:"3. Selecionar Ingest Modules"}),e.jsx(o,{title:"Os módulos mais úteis",variations:[{cmd:"Hash Lookup",desc:"Compara cada arquivo contra NSRL e hashsets known-bad.",output:"Identifica software conhecido + malware."},{cmd:"File Type Identification",desc:"Detecta tipo real do arquivo pelo magic.",output:"Pega .jpg renomeado para .doc."},{cmd:"Extension Mismatch Detector",desc:"Flagra arquivos com ext errada.",output:"Vetor para esconder evidência."},{cmd:"Embedded File Extractor",desc:"Extrai zip/rar/docx/jar para análise interna.",output:"Recursivo."},{cmd:"Picture Analyzer",desc:"Identifica imagens, lê EXIF.",output:"GPS, modelo da câmera."},{cmd:"Encryption Detection",desc:"Acha arquivos cifrados (alta entropia).",output:"Para flagrar TrueCrypt, etc."},{cmd:"PhotoRec Carver",desc:"File carving completo no espaço livre.",output:"Recupera apagados."},{cmd:"Keyword Search",desc:"Indexa texto. Buscas em livre depois.",output:"Cria index Solr."},{cmd:"Recent Activity",desc:"Browser history, downloads, registry, recent docs.",output:"Onde 80% dos casos resolvem."},{cmd:"Email Parser",desc:"Parsea PST/MBOX/EML.",output:"Extrai threads inteiras."},{cmd:"iLEAPP / ALEAPP",desc:"iOS / Android artifact parser.",output:"Para mobile forensics."},{cmd:"Plaso (timeline)",desc:"Gera timeline 'super' (todos os eventos).",output:"Mais completo que Recent Activity."}]}),e.jsx("h2",{children:"Recent Activity — onde investigar primeiro"}),e.jsx("p",{children:'Esse módulo mostra o "diário" do usuário: o que abriu, baixou, navegou, conectou.'}),e.jsx(a,{label:"categorias do Recent Activity",type:"warning",children:`Web History
  ├ URLs visitadas (com timestamp e count)
  ├ Cookies
  ├ Downloads (URL origem + path local + tamanho + hash)
  ├ Form data (nome, email, endereço, senhas salvas)
  ├ Bookmarks
  └ Search queries

Recent Documents (.lnk, jumplists, MRU)
  ├ Documents abertos via Word/Excel
  ├ Files acessados via menu Iniciar
  └ Apps usados

Installed Programs (Registry Uninstall)
  └ Lista do "Add/Remove Programs"

Operating System
  ├ User accounts (SAM)
  ├ Login history (Security log)
  ├ Network adapters configurados
  └ USB devices conectados (com timestamp + serial)

Run Programs (UserAssist + AppCompatCache)
  └ Programas executados e quantas vezes

Shell Bags
  └ Pastas que o usuário navegou via Explorer (mesmo se já apagadas)`}),e.jsx("h2",{children:"Timeline view"}),e.jsx("p",{children:'View → Timeline. Mostra eventos por hora/dia/semana com filtros (file system, web, registry, etc). Use para construir narrativa: "às 14:23, o usuário baixou X; às 14:42 instalou; às 15:01 conectou USB Y...".'}),e.jsx(a,{label:"exemplo de timeline filtrada",type:"info",children:`📅 03/04/2026
  09:11:23  WEB        Acessou https://transferwise.com/login
  09:14:08  WEB        POST → /api/auth (login OK)
  09:18:42  FS         Baixou backup_clientes.zip (4.2 GB) → ~/Downloads
  09:19:01  FS         Extraiu para /Documents/loot/
  09:23:14  USB        Conectou pendrive Kingston DT100 G3 (S/N: 60A44C...)
  09:23:42  FS         Copiou /Documents/loot/* → /media/usuario/USB/
  09:25:01  WEB        Acessou https://wormhole.app
  09:25:08  WEB        POST → /transfer (4.2 GB)
  09:26:11  USB        Disconnected USB`}),e.jsx("h2",{children:"Keyword search"}),e.jsx(s,{path:"~",lines:[{comment:"Tools → Keyword Search → busca em todo material indexado",cmd:"(GUI)",out:`Search for: "fatura cliente"

Results:
  📄 Documents/proposta-cliente-acme.docx (Word 2019)
     "Esta fatura cliente refere-se ao período..."
  📄 Outlook.pst → Inbox → 2026-03-14
     "Segue fatura cliente em anexo, vencimento 30/04..."
  🌐 Browser History → 2026-03-15 09:42
     URL: https://app.empresa.com/billing/fatura-cliente?id=1234`,outType:"info"}]}),e.jsx("h3",{children:"Listas de keywords pré-definidas"}),e.jsx(a,{label:"Tools → Keyword Search → Manage Lists",type:"default",children:`Built-in lists:
  • Phone Numbers           (\\d{3}-?\\d{3}-?\\d{4})
  • IP Addresses            (\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})
  • Email Addresses         ([\\w.+-]+@[\\w-]+\\.[\\w.-]+)
  • URLs
  • Credit Card Numbers     (validação Luhn)

Custom (você adiciona):
  • CPF                     (\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2})
  • CNPJ
  • Senhas comuns
  • Termos do caso (ex: "ACME", nome do suspeito, IPs específicos)`}),e.jsx("h2",{children:"Análise de arquivos extraídos"}),e.jsx("p",{children:'No painel "File Views" → "By Extension" → categorias automáticas:'}),e.jsx(a,{label:"categorização automática",type:"muted",children:`📷 Images (147)
  ├ Pictures (jpeg, png, gif)        → click → preview + EXIF
  └ Drawings (vsd, pdn)

📄 Documents (89)
  ├ Office (doc, docx, xls, xlsx, ppt, pptx)
  ├ PDF (54)
  └ HTML / XML / Plain Text

🎬 Videos (12)
  └ mp4, mov, avi

🔉 Audio (23)
  └ mp3, wav, ogg, m4a

📦 Archives (18)
  ├ .zip (3)
  ├ .rar (5)
  ├ .7z (1)
  └ .gz / .tar (9)

⚠️ Encryption Suspected (2)
  ├ secret.dat              (entropy 7.98)
  └ wallet.enc              (entropy 7.99)

🔧 Executable (47)
  ├ Windows .exe / .dll
  ├ Linux ELF
  └ Scripts (.bat, .ps1, .sh)`}),e.jsx("h2",{children:"Tagging e relatório"}),e.jsxs("p",{children:["Em qualquer item, botão direito → ",e.jsx("strong",{children:"Add Tag"}),' com categoria ("Bookmark", "Notable Item", custom). Depois: ',e.jsx("strong",{children:"Generate Report"})," ","→ seleciona o que vai (HTML/PDF/Excel/Body/Snapshot)."]}),e.jsx(a,{label:"seções típicas do report",type:"success",children:`📋 Case Information
  Case ID, examiner, dates, data sources, hashes

📊 Summary
  Total files, types, tagged items, hits

🔍 Tagged Items
  Por categoria, com snapshot, path, timestamp, hash

📅 Timeline
  Lista de eventos no período relevante

🌐 Web Artifacts
  Histórico, downloads, search history

💼 Recent Documents

🔌 USB Devices Connected

🏷️ Custom Tags

📁 Appendix — file paths complete`}),e.jsx("h2",{children:"Multi-user (Colab)"}),e.jsx("p",{children:"Autopsy 4.x suporta caso multi-user com banco PostgreSQL central + Solr. Vários peritos trabalham no mesmo caso simultaneamente."}),e.jsx(o,{title:"Componentes do multi-user",variations:[{cmd:"PostgreSQL",desc:"Metadata do caso (pode ser RDS).",output:"Banco principal."},{cmd:"Solr",desc:"Index de keyword search.",output:"Para busca rápida."},{cmd:"ActiveMQ",desc:"Sync de mudanças entre peritos.",output:"Notificação em tempo real."},{cmd:"File share (NFS/SMB)",desc:"Storage compartilhado das fontes.",output:"Para imagens grandes."}]}),e.jsx(r,{title:"Caso prático no Autopsy",goal:"Resolver um caso simulado: pendrive com 'evidência' (fotos, documentos, downloads de teste).",steps:["Crie um pendrive de teste copiando alguns docs/fotos seus, depois apagando metade.","Faça uma imagem dd dele.","Crie um caso novo no Autopsy.","Adicione a imagem como Data Source.","Marque ALL ingest modules e rode.","Vá em Recent Activity, Web History, File Views/Images.","Tag pelo menos 3 itens como 'Notable'.","Generate Report → HTML."],command:`# 1) preparar pendrive de teste
DEV=/dev/sdb
sudo dd if=$DEV of=teste.dd bs=4M status=progress

# 2) abrir Autopsy
bin/autopsy &
# Wizard: New Case → Caso-Teste-001
# Add Data Source → Disk Image → teste.dd
# Ingest Modules: All
# Aguardar (10-30 min dependendo do tamanho)

# 3) explorar painéis: Tree → Data Sources → Views → Recent Activity
# 4) Tools → Generate Report → HTML → Save`,expected:`Case 'Caso-Teste-001' creation finished.
Adding data source...
Ingest Module: Hash Lookup ............ Complete
Ingest Module: File Type Identification Complete
Ingest Module: Picture Analyzer ....... Complete
Ingest Module: Recent Activity ........ Complete
[...]

(no Tree, navegue: Recent Activity → Web Bookmarks, Recent Documents)
(File Views → By Mime Type → image/jpeg → 142 hits)`,verify:"O report HTML deve abrir num browser e mostrar todos os itens taggeados com snapshot e metadata."}),e.jsx(i,{type:"info",title:"Autopsy é referência mundial",children:"Cursos certificados de Forense Digital usam Autopsy. Mantém compatibilidade com formatos do EnCase (E01) e FTK Imager (DD). É open-source — alternativa gratuita a EnCase Forensic e FTK Examiner (~US$ 4-8k cada)."})]})}export{p as default};
