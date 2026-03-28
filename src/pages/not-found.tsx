import { Link } from "wouter";
import { Shield, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Esta seção ainda não existe ou foi movida. Use o menu lateral para navegar.
      </p>
      <Link href="/">
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
          <Home className="w-4 h-4" />
          Voltar ao início
        </button>
      </Link>
    </div>
  );
}
