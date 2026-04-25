import { ReactNode } from "react";
import { FlaskConical, CheckCircle2 } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface PracticeBoxProps {
  title: string;
  goal?: string;
  steps?: string[];
  command?: string;
  expected?: string;
  verify?: string;
  children?: ReactNode;
}

export function PracticeBox({
  title,
  goal,
  steps,
  command,
  expected,
  verify,
  children,
}: PracticeBoxProps) {
  return (
    <div className="my-8 rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-primary/10 border-b border-primary/20">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-foreground m-0 border-0 text-base">
          Pratique: {title}
        </h4>
      </div>

      <div className="p-5 space-y-4">
        {goal && (
          <div>
            <p className="text-xs uppercase font-semibold text-primary mb-1 tracking-wider">
              Objetivo
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed m-0">
              {goal}
            </p>
          </div>
        )}

        {steps && steps.length > 0 && (
          <div>
            <p className="text-xs uppercase font-semibold text-primary mb-2 tracking-wider">
              Passo a passo
            </p>
            <ol className="text-sm text-foreground/90 space-y-1.5 list-decimal pl-5 m-0">
              {steps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {command && (
          <div>
            <p className="text-xs uppercase font-semibold text-primary mb-1 tracking-wider">
              Comandos para executar
            </p>
            <CodeBlock language="bash" code={command} />
          </div>
        )}

        {expected && (
          <div>
            <p className="text-xs uppercase font-semibold text-green-500 mb-1 tracking-wider">
              Saída esperada
            </p>
            <pre className="text-xs font-mono text-green-300 bg-black/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed m-0">
              {expected}
            </pre>
          </div>
        )}

        {verify && (
          <div className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-green-300 leading-relaxed m-0">
              <strong className="text-green-400">Como verificar: </strong>
              {verify}
            </p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
