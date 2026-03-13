// ============================================================
// App.tsx — Dashboard Industrial (estilo STW)
// Layout clean, espaçoso, com tipografia Montserrat
// ============================================================

import AlertsPanel from "@/components/dashboard/AlertsPanel";
import EfficiencyPanel from "@/components/dashboard/EfficiencyPanel";
import MetricCard from "@/components/dashboard/MetricCard";
import MetricsChart from "@/components/dashboard/MetricsChart";
import HeaderBar from "@/components/layout/HeaderBar";
import { useMachineData } from "@/hooks/useMachineData";
import type { MachineMetrics, MetricTrends, OEEMetrics } from "@/types";
import { MachineState, Trend } from "@/types";
import { formatUptime } from "@/utils/formatters";
import { Clock, Gauge, Thermometer, Zap } from "lucide-react";
import StatusBadge from "./components/common/StatusBadge";

const DEFAULT_METRICS: MachineMetrics = {
  temperature: 0,
  rpm: 0,
  uptime: 0,
  efficiency: 0,
};

const DEFAULT_OEE: OEEMetrics = {
  overall: 0,
  availability: 0,
  performance: 0,
  quality: 0,
};

const DEFAULT_TRENDS: MetricTrends = {
  temperature: Trend.STABLE,
  rpm: Trend.STABLE,
  efficiency: Trend.STABLE,
  oee: Trend.STABLE,
};

function App() {
  const { status, history, alerts, isConnected, isLoading } = useMachineData();
  const isProdEnv = import.meta.env.PROD;
  const backendHealthUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/health`
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <div className="animate-spin w-14 h-14 border-4 border-stw-primary border-t-transparent rounded-full mx-auto mb-5" />
          <p className="text-lg font-bold text-content tracking-tight">
            Carregando dashboard...
          </p>
          <p className="text-sm text-content-muted mt-1">
            Conectando ao servidor de monitoramento
          </p>
          {isProdEnv && (
            <div className="mt-3 max-w-md mx-auto space-y-2">
              <p className="text-xs text-content-muted">
                Ambiente de produção em plano gratuito no Render: o backend pode
                levar alguns segundos para iniciar (cold start).
              </p>
              <p className="text-xs text-state-error font-semibold">
                Para funcionar na primeira carga, acesse o backend no navegador
                para acordar o servico
                {backendHealthUrl ? (
                  <>
                    :{" "}
                    <a
                      href={backendHealthUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {backendHealthUrl}
                    </a>
                    .
                  </>
                ) : (
                  " (endpoint /api/health)."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const machineState = status?.state ?? MachineState.STOPPED;
  const metrics = status?.metrics ?? DEFAULT_METRICS;
  const oee = status?.oee ?? DEFAULT_OEE;
  const trends = status?.trends ?? DEFAULT_TRENDS;

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Skip link — acessibilidade por teclado */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Header */}
      <HeaderBar isConnected={isConnected} />

      {/* Conteúdo principal */}
      <main
        id="main-content"
        className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8"
        aria-label="Painel de monitoramento industrial"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-stw-primary" />
            <span className="text-sm font-semibold text-content uppercase tracking-widest">
              Status da Máquina
            </span>
          </div>
          <StatusBadge state={machineState} />
        </div>

        {/* Metric Cards — Grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <MetricCard
            id="card-temperature"
            title="Temperatura"
            value={metrics.temperature}
            unit="°C"
            trend={trends.temperature}
            icon={<Thermometer size={18} />}
            maxValue={100}
            thresholdWarning={80}
            thresholdCritical={85}
          />
          <MetricCard
            id="card-rpm"
            title="RPM"
            value={metrics.rpm}
            unit="rpm"
            trend={trends.rpm}
            icon={<Gauge size={18} />}
            maxValue={1500}
          />
          <MetricCard
            id="card-uptime"
            title="Tempo de Operação"
            value={formatUptime(metrics.uptime)}
            unit=""
            trend={Trend.STABLE}
            icon={<Clock size={18} />}
          />
          <MetricCard
            id="card-efficiency"
            title="Eficiência"
            value={metrics.efficiency}
            unit="%"
            trend={trends.efficiency}
            icon={<Zap size={18} />}
            maxValue={100}
          />
        </div>

        {/* Gráfico de Métricas */}
        <MetricsChart history={history} />

        {/* Alertas + Eficiência */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <AlertsPanel alerts={alerts} />
          <EfficiencyPanel oee={oee} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-content-muted font-medium tracking-wide">
        Dashboard de Monitoramento Industrial — Atualização a cada 3 segundos
      </footer>
    </div>
  );
}

export default App;
