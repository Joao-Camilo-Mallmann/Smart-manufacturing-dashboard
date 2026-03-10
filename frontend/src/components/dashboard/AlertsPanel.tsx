// ============================================================
// AlertsPanel.tsx — Painel de alertas recentes
// Ordenado por severidade (CRITICAL > WARNING > INFO)
// ============================================================

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Alert, AlertLevel } from "../../types";

interface Props {
  alerts: Alert[];
}

interface AlertConfig {
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const alertConfig: Record<AlertLevel, AlertConfig> = {
  CRITICAL: {
    icon: <AlertTriangle size={16} />,
    bgClass: "bg-alert-critical/10",
    borderClass: "border-l-alert-critical",
    textClass: "text-alert-critical",
  },
  WARNING: {
    icon: <AlertCircle size={16} />,
    bgClass: "bg-alert-warning/10",
    borderClass: "border-l-alert-warning",
    textClass: "text-alert-warning",
  },
  INFO: {
    icon: <Info size={16} />,
    bgClass: "bg-alert-info/10",
    borderClass: "border-l-alert-info",
    textClass: "text-alert-info",
  },
};

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

function timeAgo(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    return `${Math.floor(diff / 3600)}h atrás`;
  } catch {
    return "";
  }
}

export default function AlertsPanel({ alerts }: Props) {
  return (
    <div
      id="alerts-panel"
      className="animate-fade-in rounded-xl p-4 sm:p-5 flex flex-col bg-surface shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-alert-warning" />
          <h2 className="font-semibold text-base text-content">
            Alertas Recentes
          </h2>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-surface-hover text-content-secondary">
          {alerts.length}
        </span>
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle size={32} className="text-state-running mb-2" />
            <p className="text-sm text-content-muted">Nenhum alerta recente</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = alertConfig[alert.level];
            return (
              <div
                key={alert.id}
                className={`animate-slide-up flex items-start gap-3 p-3 rounded-lg transition-all duration-200 border-l-3 ${config.bgClass} ${config.borderClass} ${
                  alert.acknowledged ? "opacity-60" : ""
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${config.textClass}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-bold uppercase ${config.textClass}`}
                    >
                      {alert.level}
                    </span>
                    <span className="text-xs text-content-muted">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-snug text-content">
                    {alert.message}
                  </p>
                  <p className="text-xs mt-1 text-content-muted">
                    {alert.component} • {timeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
