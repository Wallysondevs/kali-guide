import { Link, useLocation } from "wouter";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const [location] = useLocation();
  // ex.: "/rota-que-nao-existe" -> "rota-que-nao-existe"
  const cmd = (location || "/").replace(/^\//, "") || "pagina";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-[#1a1b26]">
          {/* barra de titulo do terminal */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#24283b] border-b border-black/30">
            <span className="w-3 h-3 rounded-full bg-[#f7768e]" />
            <span className="w-3 h-3 rounded-full bg-[#e0af68]" />
            <span className="w-3 h-3 rounded-full bg-[#9ece6a]" />
            <span className="ml-3 text-xs text-gray-400 font-mono">
              kali@guia: ~
            </span>
          </div>
          {/* corpo do terminal */}
          <div className="p-5 font-mono text-sm leading-relaxed">
            <p className="text-[#9ece6a]">
              kali@guia<span className="text-gray-400">:</span>
              <span className="text-[#7aa2f7]">~</span>
              <span className="text-gray-400">$ </span>
              <span className="text-gray-100 break-all">{cmd}</span>
            </p>
            <p className="text-[#f7768e] mt-2">
              bash: {cmd}: command not found
            </p>
            <p className="text-gray-500 mt-1">
              # código de saída: 127 — essa página não existe ou foi movida
            </p>
            <p className="text-gray-400 mt-4">
              Tente <span className="text-[#e0af68]">help</span> no menu lateral,
              ou volte para o início:
            </p>
            <p className="text-[#9ece6a] mt-2">
              kali@guia<span className="text-gray-400">:</span>
              <span className="text-[#7aa2f7]">~</span>
              <span className="text-gray-400">$ </span>
              <span className="inline-block w-2 h-4 align-middle bg-gray-100 animate-pulse" />
            </p>
          </div>
        </div>

        {/* acoes */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
              <Home className="w-4 h-4" />
              cd ~ (voltar ao início)
            </button>
          </Link>
          <Link href="/trilhas">
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-colors">
              <Search className="w-4 h-4" />
              ver trilhas de estudo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
