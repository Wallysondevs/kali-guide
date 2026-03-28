import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "bash", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-border shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {title && <span className="ml-2 text-xs font-mono text-gray-400">{title}</span>}
          {!title && <span className="ml-2 text-xs font-mono text-gray-500 lowercase">{language}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 text-sm font-mono overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: 0, background: "transparent" }}
          wrapLines={true}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
