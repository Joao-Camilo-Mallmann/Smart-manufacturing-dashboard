// ============================================================
// App.tsx — Componente principal do Dashboard Industrial
// Organiza o layout do dashboard com grid responsivo.
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-stw-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg font-medium text-content">
            Carregando dashboard...
          </p>
          <p className="text-sm text-content-muted">
            Conectando ao servidor de monitoramento
          </p>
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
      {/* Header */}
      <HeaderBar machineState={machineState} isConnected={isConnected} />

      {/* Conteúdo principal */}
      <main className="max-w-screen-2xl mx-24 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Metric Cards — Grid responsivo: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Gráfico de Métricas — Full width */}
        <MetricsChart history={history} />

        {/* Alertas + Eficiência — Side by side em desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <AlertsPanel alerts={alerts} />
          <EfficiencyPanel oee={oee} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-content-muted">
        Dashboard de Monitoramento Industrial • Atualização a cada 3 segundos
      </footer>
    </div>
  );
}

export default App;
