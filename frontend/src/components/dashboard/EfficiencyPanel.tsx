// ============================================================
// EfficiencyPanel.tsx — Painel de métricas de eficiência (OEE)
// Exibe OEE, availability, performance e quality com barras
// ============================================================

import { Gauge } from "lucide-react";
import type { OEEMetrics } from "../../types";

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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-secondary">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-surface-hover">
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
  if (value >= 85) return "#22C55E"; // Excelente
  if (value >= 70) return "#1485C8"; // Bom
  if (value >= 50) return "#F59E0B"; // Aceitável
  return "#EF4444"; // Crítico
}

export default function EfficiencyPanel({ oee }: Props) {
  const overallColor = getOEEColor(oee.overall);

  return (
    <div
      id="efficiency-panel"
      className="animate-fade-in rounded-xl p-4 sm:p-5 bg-surface shadow-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Gauge size={20} className="text-stw-primary" />
        <h2 className="font-semibold text-base text-content">
          Métricas de Eficiência
        </h2>
      </div>

      {/* OEE Principal (destaque) */}
      <div
        className="text-center p-4 rounded-xl mb-5"
        style={{
          background: `${overallColor}11`,
          border: `2px solid ${overallColor}33`,
        }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-1 text-content-muted">
          OEE Geral
        </p>
        <p className="text-4xl font-bold" style={{ color: overallColor }}>
          {oee.overall.toFixed(1)}%
        </p>
      </div>

      {/* Barras individuais */}
      <div className="space-y-4">
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
