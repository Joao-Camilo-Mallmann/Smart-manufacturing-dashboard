// ============================================================
// AlertsPanel.tsx — Painel de alertas recentes
// Ordenado por severidade (CRITICAL > WARNING > INFO)
// ============================================================

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Alert, AlertLevel } from "../../types";

interface Props {
  alerts: Alert[];
}

const alertConfig: Record<
  AlertLevel,
  {
    icon: React.ReactNode;
    bgClass: string;
    borderColor: string;
    textClass: string;
  }
> = {
  CRITICAL: {
    icon: <AlertTriangle size={16} />,
    bgClass: "bg-alert-critical/10",
    borderColor: "#DC2626",
    textClass: "text-alert-critical",
  },
  WARNING: {
    icon: <AlertCircle size={16} />,
    bgClass: "bg-alert-warning/10",
    borderColor: "#F59E0B",
    textClass: "text-alert-warning",
  },
  INFO: {
    icon: <Info size={16} />,
    bgClass: "bg-alert-info/10",
    borderColor: "#3B82F6",
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
      className="animate-fade-in rounded-xl p-4 sm:p-5 flex flex-col"
      style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-alert-warning" />
          <h2
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Alertas Recentes
          </h2>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: "var(--bg-hover)",
            color: "var(--text-secondary)",
          }}
        >
          {alerts.length}
        </span>
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle size={32} className="text-state-running mb-2" />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nenhum alerta recente
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = alertConfig[alert.level];
            return (
              <div
                key={alert.id}
                className={`animate-slide-up flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${config.bgClass} ${
                  alert.acknowledged ? "opacity-60" : ""
                }`}
                style={{ borderLeft: `3px solid ${config.borderColor}` }}
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
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {alert.message}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
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
