import { useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Caminho do arquivo / título (ex: "/etc/apache2/sites-available/default.conf"). */
  title?: string;
}

/**
 * Apelidos: nomes que usamos nas páginas -> nome real da gramática do Prism.
 */
const ALIASES: Record<string, string> = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  apache: "apacheconf",
  dockerfile: "docker",
  "ssh-config": "ini",
  conf: "ini",
  cfg: "ini",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  console: "bash",
  yml: "yaml",
  ps1: "powershell",
  md: "markdown",
};

/**
 * Gramáticas que o Prism carrega sob demanda. Qualquer coisa fora daqui
 * (text, vim, asm, ...) é mostrada sem realce, sem baixar chunk nenhum.
 */
const SUPPORTED = new Set([
  "apacheconf",
  "bash",
  "c",
  "cypher",
  "docker",
  "graphql",
  "http",
  "ini",
  "javascript",
  "json",
  "lua",
  "markdown",
  "markup",
  "nginx",
  "nim",
  "php",
  "powershell",
  "python",
  "rust",
  "sql",
  "toml",
  "yaml",
]);

/**
 * Bloco para mostrar conteúdo de arquivo (config, código fonte, etc.).
 * Para comandos executáveis com saída, use <Terminal />.
 */
export function CodeBlock({ code, language = "bash", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const key = language.toLowerCase();
  const grammar = ALIASES[key] ?? key;
  const highlight = SUPPORTED.has(grammar);
  const body = code.trim();

  return (
    <div
      className="my-6 rounded-xl overflow-hidden border border-white/5 shadow-lg"
      style={{ background: "hsl(var(--kali-bg))" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-white/5"
        style={{ background: "hsl(var(--kali-bg-2))" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <FileCode2 className="w-3.5 h-3.5 text-[hsl(var(--kali-cyan))]/70" />
            {title ? (
              <span className="text-[hsl(var(--kali-cyan))]">{title}</span>
            ) : (
              <span className="text-gray-500 lowercase">{language}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Copiar código"
          aria-label="Copiar código"
        >
          {copied ? (
            <Check className="w-4 h-4 text-[hsl(var(--kali-green))]" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="kali-scroll p-4 text-sm font-mono overflow-x-auto">
        {highlight ? (
          <SyntaxHighlighter
            language={grammar}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: 0,
              background: "transparent",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
            wrapLines={true}
          >
            {body}
          </SyntaxHighlighter>
        ) : (
          <pre
            className="m-0 p-0 text-gray-300"
            style={{ fontSize: "13px", lineHeight: 1.6, background: "transparent" }}
          >
            {body}
          </pre>
        )}
      </div>
    </div>
  );
}
