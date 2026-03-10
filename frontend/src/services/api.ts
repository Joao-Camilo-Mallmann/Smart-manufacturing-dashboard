import api from "@/plugins/axios";
import type { Alert, MachineStatus, MetricHistory } from "@/types";

/** Busca métricas atuais da máquina */
export async function fetchCurrentMetrics(): Promise<MachineStatus> {
  const response = await api.get<MachineStatus>("/metrics/current");
  return response.data;
}

/** Busca histórico de métricas para gráficos */
export async function fetchHistory(limit = 120): Promise<MetricHistory[]> {
  const response = await api.get<MetricHistory[]>(
    `/metrics/history?limit=${limit}`,
  );
  return response.data;
}

/** Busca lista de alertas recentes */
export async function fetchAlerts(limit = 20): Promise<Alert[]> {
  const response = await api.get<Alert[]>(`/alerts?limit=${limit}`);
  return response.data;
}

/** Reconhece um alerta */
export async function acknowledgeAlert(id: number): Promise<void> {
  await api.patch(`/alerts/${id}/acknowledge`);
}
