// ============================================================
// StatusBadge.tsx — Indicador visual do estado da máquina
// Exibe RUNNING/STOPPED/MAINTENANCE/ERROR com cores e animação
// ============================================================

import type { MachineState } from "@/types";
import { Activity, AlertTriangle, Power, Wrench } from "lucide-react";

interface Props {
  state: MachineState;
}

const stateConfig: Record<
  MachineState,
  {
    label: string;
    bgClass: string;
    textClass: string;
    icon: React.ReactNode;
    animate: string;
  }
> = {
  RUNNING: {
    label: "Ligada",
    bgClass: "bg-state-running/35",
    textClass: "text-state-running",
    icon: <Activity size={18} />,
    animate: "animate-pulse-slow",
  },
  STOPPED: {
    label: "Desligada",
    bgClass: "bg-state-stopped/35",
    textClass: "text-state-stopped",
    icon: <Power size={18} />,
    animate: "",
  },
  MAINTENANCE: {
    label: "Manutenção",
    bgClass: "bg-state-maintenance/35",
    textClass: "text-state-maintenance",
    icon: <Wrench size={18} />,
    animate: "",
  },
  ERROR: {
    label: "Erro",
    bgClass: "bg-state-error/35",
    textClass: "text-state-error",
    icon: <AlertTriangle size={18} />,
    animate: "animate-pulse",
  },
};

export default function StatusBadge({ state }: Props) {
  const config = stateConfig[state];

  return (
    <div
      id="status-badge"
      role="status"
      aria-live="polite"
      aria-label={`Estado da máquina: ${config.label}`}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${config.bgClass} ${config.textClass} ${config.animate} transition-all duration-300`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
