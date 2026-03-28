import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "info" | "warning" | "danger" | "success";

interface AlertBoxProps {
  type?: AlertType;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const styles = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  danger: "bg-red-500/10 border-red-500/20 text-red-400",
  success: "bg-green-500/10 border-green-500/20 text-green-400",
};

const icons = {
  info: Info,
  warning: TriangleAlert,
  danger: AlertCircle,
  success: CheckCircle2,
};

export function AlertBox({ type = "info", title, children, className }: AlertBoxProps) {
  const Icon = icons[type];

  return (
    <div className={cn("rounded-xl border p-5 my-6 flex gap-4 items-start", styles[type], className)}>
      <Icon className="w-6 h-6 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h5 className="font-semibold text-foreground mb-1">{title}</h5>
        <div className="text-sm opacity-90 leading-relaxed text-foreground/80">
          {children}
        </div>
      </div>
    </div>
  );
}
