import { PageContainer } from "@/components/layout/PageContainer";
  import { AlertBox } from "@/components/ui/AlertBox";
  import { CodeBlock } from "@/components/ui/CodeBlock";

  export default function SET() {
    return (
      <PageContainer
        title="SET — Social Engineering Toolkit"
        subtitle="Framework completo para simular ataques de engenharia social: phishing, clone de sites e muito mais."
        difficulty="avancado"
        timeToRead="12 min"
      >
        <AlertBox type="danger" title="Ferramenta de alto impacto — use apenas com autorização">
          SET simula ataques reais de engenharia social. Usar contra pessoas sem consentimento
          é crime. Use apenas em pentests com escopo que inclui engenharia social.
        </AlertBox>

        <h2>Instalação e Início</h2>
        <CodeBlock language="bash" code={'# Já no Kali Linux\nsetoolkit\n\n# Como root\nsudo setoolkit\n\n# Instalar/atualizar manualmente\ngit clone https://github.com/trustedsec/social-engineer-toolkit\ncd social-engineer-toolkit && pip3 install -r requirements.txt\npython3 setup.py'} />

        <h2>Clone de Site para Phishing (Credential Harvester)</h2>
        <CodeBlock language="bash" code={'# Menu do SET:\n# 1) Social-Engineering Attacks\n# 2) Website Attack Vectors\n# 3) Credential Harvester Attack Method\n# 2) Site Cloner\n\n# Digite o IP do servidor (Kali)\n# Digite a URL para clonar: https://www.banco.com.br\n\n# SET clona o site e intercepta credenciais!\n# Resultado em: /var/www/ e /root/.set/reports/'} />

        <h2>Spear Phishing por E-mail</h2>
        <CodeBlock language="bash" code={'# Menu do SET:\n# 1) Social-Engineering Attacks\n# 1) Spear-Phishing Attack Vectors\n# 1) Perform a Mass Email Attack\n\n# Configurar servidor de e-mail:\nnano /etc/setoolkit/set.config\n# SENDMAIL_PATH ou GMAIL settings\n\n# Exemplo de e-mail de phishing com PDF malicioso:\n# SET pode gerar PDF com exploit automático via Metasploit'} />

        <h2>Engenharia Social via QR Code</h2>
        <CodeBlock language="bash" code={'# Gerar QR Code que aponta para site falso\nsudo apt install qrencode -y\n\n# QR Code para URL de phishing\nqrencode -o qr_phishing.png "http://SEU_IP/fake-login"\n\n# Exibir QR\ndisplay qr_phishing.png\n\n# Combinar com SET credential harvester:\n# 1. Clonar site legítimo com SET\n# 2. Gerar QR Code com IP do SET\n# 3. Imprimir/enviar QR Code como "acesso rápido"'} />

        <h2>Pretexting — Cenários Comuns</h2>
        <CodeBlock language="bash" code={'# Cenários típicos em pentests de engenharia social:\n\n# 1. IT Support\n# "Olá, sou da TI. Precisamos que você acesse esse link para atualizar seu certificado digital."\n\n# 2. CEO Fraud (BEC)\n# E-mail falso do CEO pedindo transferência urgente\n\n# 3. Entrega de Encomenda\n# "Sua encomenda está retida. Clique aqui para rastreamento"\n\n# 4. Atualização de Software\n# Popup falso de update com malware\n\n# Documentar TUDO para o relatório:\n# - Pretexto usado\n# - Taxa de sucesso\n# - Tempo para primeiro clique\n# - Quantos forneceram credenciais'} />

        <h2>GoPhish — Phishing Profissional</h2>
        <CodeBlock language="bash" code={'# GoPhish: plataforma profissional de simulação de phishing\nwget https://github.com/gophish/gophish/releases/latest/download/gophish-linux-64bit.zip\nunzip gophish-linux-64bit.zip\nchmod +x gophish\nsudo ./gophish\n\n# Acessar painel: https://localhost:3333\n# Login padrão: admin / (ver output do terminal)\n\n# Funcionalidades:\n# - Templates de e-mail HTML\n# - Landing pages clonadas\n# - Grupos de alvos (CSV)\n# - Dashboard com métricas em tempo real\n# - Relatórios automáticos'} />

        <AlertBox type="success" title="Relatório de engenharia social">
          Documente: quantos clicaram no link, quantos forneceram credenciais, em quanto tempo,
          qual departamento foi mais vulnerável. Esses dados são essenciais para o cliente
          justificar treinamentos de conscientização.
        </AlertBox>
      </PageContainer>
    );
  }
  