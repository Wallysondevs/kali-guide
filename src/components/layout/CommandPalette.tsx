import { useEffect, useMemo, useState } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { Check, CornerDownLeft, Hash } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { COURSE, TOTAL_LESSONS, useProgress } from "@/lib/course";

/** Evento global para abrir a busca de qualquer lugar da interface. */
export const EVENTO_ABRIR_BUSCA = "kali:abrir-busca";

/** Remove acentos para que "exploracao" encontre "Exploração". */
function semAcento(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const [, navegar] = useHashLocation();
  const { has } = useProgress();

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      const digitando =
        !!alvo &&
        (alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.isContentEditable);

      // Ctrl+K / Cmd+K alterna a busca
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((v) => !v);
        return;
      }
      // "/" abre a busca, como no vim e no man
      if (e.key === "/" && !digitando && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setAberto(true);
      }
    }

    function aoPedirAbertura() {
      setAberto(true);
    }

    window.addEventListener("keydown", aoTeclar);
    window.addEventListener(EVENTO_ABRIR_BUSCA, aoPedirAbertura);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener(EVENTO_ABRIR_BUSCA, aoPedirAbertura);
    };
  }, []);

  // Agrupa os tópicos por módulo, mantendo a ordem da trilha.
  const grupos = useMemo(() => {
    const mapa = new Map<string, typeof COURSE>();
    for (const licao of COURSE) {
      const atual = mapa.get(licao.module);
      if (atual) atual.push(licao);
      else mapa.set(licao.module, [licao]);
    }
    return Array.from(mapa.entries());
  }, []);

  function ir(path: string) {
    setAberto(false);
    navegar(path);
  }

  return (
    <CommandDialog open={aberto} onOpenChange={setAberto}>
      <CommandInput placeholder={`Buscar entre ${TOTAL_LESSONS} tópicos...`} />
      <CommandList className="max-h-[65vh] kali-scroll">
        <CommandEmpty>
          <span className="font-mono text-sm text-[hsl(var(--kali-dim))]">
            Nenhum tópico encontrado.
          </span>
        </CommandEmpty>

        {grupos.map(([modulo, itens], gIdx) => (
          <CommandGroup
            key={modulo}
            heading={`${String(gIdx + 1).padStart(2, "0")} · ${modulo}`}
          >
            {itens.map((licao) => {
              const feito = has(licao.path);
              return (
                <CommandItem
                  key={licao.path}
                  value={`${licao.label} ${licao.module} ${licao.path} ${semAcento(
                    licao.label,
                  )} ${semAcento(licao.module)}`}
                  onSelect={() => ir(licao.path)}
                  className="font-mono text-[13px] gap-2"
                >
                  {feito ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--kali-green))]" />
                  ) : (
                    <Hash className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--kali-dim))]" />
                  )}
                  <span className="flex-1 truncate">{licao.label}</span>
                  <span className="text-[10px] text-[hsl(var(--kali-dim))] shrink-0">
                    {licao.path}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>

      <div className="flex items-center justify-between gap-3 border-t border-white/5 px-3 py-2 font-mono text-[10px] text-[hsl(var(--kali-dim))]">
        <span className="flex items-center gap-1.5">
          <CornerDownLeft className="w-3 h-3" /> abrir
        </span>
        <span>↑ ↓ navegar</span>
        <span>esc fechar</span>
      </div>
    </CommandDialog>
  );
}
