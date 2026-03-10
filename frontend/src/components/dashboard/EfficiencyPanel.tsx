// ============================================================
// EfficiencyPanel.tsx — Painel OEE (estilo STW)
// Card super arredondado com barras de eficiência
// ============================================================

import { Gauge } from "lucide-react";
import type { OEEMetrics } from "@/types";

interface Props {
  oee: OEEMetrics;
}

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
}

function MetricBar({ label, value, color }: MetricBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-content-secondary">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-surface-hover">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function getOEEColor(value: number): string {
  if (value >= 85) return "#22C55E";
  if (value >= 70) return "#1485C8";
  if (value >= 50) return "#F59E0B";
  return "#EF4444";
}

export default function EfficiencyPanel({ oee }: Props) {
  const overallColor = getOEEColor(oee.overall);

  return (
    <div id="efficiency-panel" className="card-stw animate-fade-in p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 rounded-xl bg-stw-primary/8 text-stw-primary">
          <Gauge size={18} />
        </div>
        <h2 className="font-bold text-base text-content tracking-tight">
          Métricas de Eficiência
        </h2>
      </div>

      {/* OEE Principal (destaque) */}
      <div
        className="text-center p-5 rounded-2xl mb-6"
        style={{
          background: `${overallColor}0D`,
          border: `2px solid ${overallColor}26`,
        }}
      >
        <p className="label-stw mb-2">OEE Geral</p>
        <p
          className="text-5xl font-extrabold tracking-tight"
          style={{ color: overallColor }}
        >
          {oee.overall.toFixed(1)}
          <span className="text-xl font-semibold ml-1">%</span>
        </p>
      </div>

      {/* Barras individuais */}
      <div className="space-y-5">
        <MetricBar
          label="Disponibilidade"
          value={oee.availability}
          color="#22C55E"
        />
        <MetricBar
          label="Performance"
          value={oee.performance}
          color="#1485C8"
        />
        <MetricBar label="Qualidade" value={oee.quality} color="#8B5CF6" />
      </div>
    </div>
  );
}
