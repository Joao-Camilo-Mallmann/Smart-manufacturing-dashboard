// ============================================================
// utils/api.ts — Funções centralizadas de comunicação com API
// ============================================================

import type { Alert, MachineStatus, MetricHistory } from "../types";

const API_BASE = "/api";

/**
 * Fetch genérico com tratamento de erro.
 */
async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/** Busca métricas atuais da máquina */
export async function fetchCurrentMetrics(): Promise<MachineStatus> {
  return apiFetch<MachineStatus>("/metrics/current");
}

/** Busca histórico de métricas para gráficos */
export async function fetchHistory(limit = 120): Promise<MetricHistory[]> {
  return apiFetch<MetricHistory[]>(`/metrics/history?limit=${limit}`);
}

/** Busca lista de alertas recentes */
export async function fetchAlerts(limit = 20): Promise<Alert[]> {
  return apiFetch<Alert[]>(`/alerts?limit=${limit}`);
}

/** Reconhece um alerta */
export async function acknowledgeAlert(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(`Erro ao reconhecer alerta: ${response.statusText}`);
  }
}
