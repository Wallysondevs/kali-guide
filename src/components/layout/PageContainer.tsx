import { ReactNode, useEffect, useState } from "react";
import { DifficultyBadge } from "../ui/DifficultyBadge";
import { motion } from "framer-motion";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  difficulty?: "iniciante" | "intermediario" | "avancado";
  timeToRead?: string;
  children: ReactNode;
}

export function PageContainer({ title, subtitle, difficulty, timeToRead, children }: PageContainerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {difficulty && <DifficultyBadge level={difficulty} />}
            {timeToRead && (
              <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                ⏱ {timeToRead} de leitura
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>

        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
