import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-border px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground w-64">
          <span className="text-primary font-mono font-bold">$</span>
          <span>kali — Guia Completo</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Alternar tema"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
