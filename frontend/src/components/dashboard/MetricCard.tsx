// ============================================================
// MetricCard.tsx — Card de métrica com valor, tendência e cor
// Exibe temperatura, RPM, uptime ou eficiência.
// ============================================================

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Trend } from "../../types";

interface Props {
  id: string;
  title: string;
  value: string | number;
  unit: string;
  trend: Trend;
  icon: React.ReactNode;
  maxValue?: number;
  thresholdWarning?: number;
  thresholdCritical?: number;
}

function getTrendIcon(trend: Trend) {
  switch (trend) {
    case Trend.UP:
      return <TrendingUp size={16} className="text-state-running" />;
    case Trend.DOWN:
      return <TrendingDown size={16} className="text-state-error" />;
    default:
      return <Minus size={16} className="text-content-muted" />;
  }
}

function getValueColor(
  value: number,
  warning?: number,
  critical?: number,
): string {
  if (critical && value > critical) return "text-state-error";
  if (warning && value > warning) return "text-state-maintenance";
  return "text-stw-primary";
}

function getBorderColor(
  value: number,
  warning?: number,
  critical?: number,
): string {
  if (critical && value > critical) return "border-l-state-error";
  if (warning && value > warning) return "border-l-state-maintenance";
  return "border-l-stw-primary";
}

function getBarColor(
  value: number,
  warning?: number,
  critical?: number,
): string {
  if (critical && value > critical) return "bg-state-error";
  if (warning && value > warning) return "bg-state-maintenance";
  return "bg-stw-primary";
}

export default function MetricCard({
  id,
  title,
  value,
  unit,
  trend,
  icon,
  maxValue,
  thresholdWarning,
  thresholdCritical,
}: Props) {
  const numValue = typeof value === "number" ? value : parseFloat(value);
  const colorClass = getValueColor(
    numValue,
    thresholdWarning,
    thresholdCritical,
  );
  const borderClass = getBorderColor(
    numValue,
    thresholdWarning,
    thresholdCritical,
  );
  const barClass = getBarColor(numValue, thresholdWarning, thresholdCritical);
  const progressPercent = maxValue
    ? Math.min((numValue / maxValue) * 100, 100)
    : undefined;

  return (
    <div
      id={id}
      className={`animate-fade-in rounded-xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] bg-surface shadow-card border-l-4 ${borderClass}`}
    >
      {/* Header: ícone + título */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-stw-primary/10 text-stw-primary">
            {icon}
          </div>
          <span className="text-sm font-medium text-content-secondary">
            {title}
          </span>
        </div>
        {getTrendIcon(trend)}
      </div>

      {/* Valor principal */}
      <div className={`text-2xl sm:text-3xl font-bold ${colorClass} mb-1`}>
        {typeof value === "number" ? value.toFixed(1) : value}
        <span className="text-sm font-normal ml-1 text-content-muted">
          {unit}
        </span>
      </div>

      {/* Barra de progresso (se maxValue definido) */}
      {progressPercent !== undefined && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-surface-hover">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Máximo (se definido) */}
      {maxValue && (
        <p className="text-xs mt-1 text-content-muted">
          Máx: {maxValue} {unit}
        </p>
      )}
    </div>
  );
}
