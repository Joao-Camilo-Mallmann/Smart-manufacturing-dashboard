// ============================================================
// AlertsPanel.tsx — Painel de alertas recentes (estilo STW)
// Card com cantos super arredondados e hierarquia visual limpa
// ============================================================

import beepSoundUrl from "@/assets/beep-warning.mp3";
import type { Alert, AlertLevel } from "@/types";
import { timeAgo } from "@/utils/formatters";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useEffect, useRef } from "react";

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
    bgClass: "alert-critical-surface",
    borderClass: "border-l-alert-critical",
    textClass: "text-alert-critical",
  },
  WARNING: {
    icon: <AlertCircle size={16} />,
    bgClass: "bg-alert-warning/8",
    borderClass: "border-l-alert-warning",
    textClass: "text-alert-warning",
  },
  INFO: {
    icon: <Info size={16} />,
    bgClass: "bg-alert-info/8",
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

export default function AlertsPanel({ alerts }: Props) {
  const lastCriticalIdRef = useRef<number | null>(null);
  const visibleAlerts = alerts.slice(0, 5);

  useEffect(() => {
    const highestCriticalId = alerts
      .filter((a) => a.level === "CRITICAL" && !a.acknowledged)
      .reduce((max, a) => Math.max(max, a.id), 0);

    if (lastCriticalIdRef.current === null) {
      // Setup initial load
      lastCriticalIdRef.current = highestCriticalId;
    } else if (highestCriticalId > lastCriticalIdRef.current) {
      // Play audio on new critical alert
      try {
        const audio = new Audio(beepSoundUrl);
        audio.play().catch((err) => {
          console.warn("Autoplay bloqueado pelo navegador:", err);
        });
      } catch (e) {
        console.error("Erro ao tocar áudio:", e);
      }
      lastCriticalIdRef.current = highestCriticalId;
    }
  }, [alerts]);
  return (
    <div
      id="alerts-panel"
      className="card-stw animate-fade-in p-5 sm:p-6 flex flex-col"
      aria-label="Painel de alertas recentes"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-alert-warning/10 text-alert-warning">
            <AlertTriangle size={18} />
          </div>
          <h2 className="font-bold text-base text-content tracking-tight">
            Alertas Recentes
          </h2>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-surface-hover text-content-secondary">
          {alerts.length}
        </span>
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 pr-1" aria-live="polite" aria-relevant="additions">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <CheckCircle size={36} className="text-state-running mb-3" />
            <p className="text-sm text-content-muted font-medium">
              Nenhum alerta recente
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5 list-none m-0 p-0">
            {visibleAlerts.map((alert) => {
              const config = alertConfig[alert.level];
              return (
                <li
                  key={alert.id}
                  className={`animate-slide-up flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 border-l-3 ${config.bgClass} ${config.borderClass} ${
                    alert.acknowledged ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 shrink-0 ${config.textClass}`}
                    aria-hidden="true"
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[0.65rem] font-bold uppercase tracking-wider ${config.textClass}`}
                      >
                        {alert.level}
                      </span>
                      <span className="text-[0.65rem] text-content-muted">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm leading-snug text-content font-medium">
                      {alert.message}
                    </p>
                    <p className="text-xs mt-1 text-content-muted">
                      {alert.component} • {timeAgo(alert.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {alerts.length > visibleAlerts.length && (
          <p className="text-xs text-content-muted mt-3 font-medium">
            Mostrando os 5 alertas mais recentes para manter a visualização da
            TV limpa.
          </p>
        )}
      </div>
    </div>
  );
}
