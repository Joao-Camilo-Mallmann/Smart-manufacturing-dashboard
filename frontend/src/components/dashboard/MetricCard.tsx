// ============================================================
// MetricCard.tsx — Card de métrica estilo STW
// Cantos super arredondados, borda azulada, hierarquia limpa
// ============================================================

import { Trend } from "@/types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

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
  return "text-content"; /* Adaptive to dark mode white */
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
  const barClass = getBarColor(numValue, thresholdWarning, thresholdCritical);
  const progressPercent = maxValue
    ? Math.min((numValue / maxValue) * 100, 100)
    : undefined;

  return (
    <div id={id} className="card-stw animate-fade-in p-5 sm:p-6">
      {/* Label estilo STW */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-stw-primary/8 text-stw-primary">
            {icon}
          </div>
          <span className="label-stw">{title}</span>
        </div>
        <div className="p-1 rounded-full bg-surface-hover">
          {getTrendIcon(trend)}
        </div>
      </div>

      {/* Valor principal */}
      <div
        className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${colorClass}`}
      >
        {typeof value === "number" ? value.toFixed(1) : value}
        <span className="text-base font-medium ml-1.5 text-content-muted">
          {unit}
        </span>
      </div>

      {/* Barra de progresso */}
      {progressPercent !== undefined && (
        <div
          role="progressbar"
          aria-valuenow={Math.round(numValue)}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${title}: ${Math.round(numValue)} de ${maxValue} ${unit}`}
          className="mt-4 h-2 rounded-full overflow-hidden bg-surface-hover"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Máximo */}
      {maxValue && (
        <p className="text-xs mt-2 text-content-muted font-medium">
          Máx: {maxValue} {unit}
        </p>
      )}
    </div>
  );
}
