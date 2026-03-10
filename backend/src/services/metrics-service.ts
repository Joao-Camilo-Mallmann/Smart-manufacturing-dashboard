// ============================================================
// services/metrics-service.ts — Serviço de Métricas
// Orquestra core + repository para montar respostas de métricas.
// ============================================================

import { MetricResponse } from "@/config/types";
import { getTrend } from "@/core/oee-calculator";
import {
  getMetricHistory,
  getPreviousMetric,
} from "@/repositories/metrics-repository";
import { getCurrentState } from "@/services/simulator";

/**
 * Retorna a leitura atual com OEE e tendências calculadas.
 */
export function getCurrentMetrics(): MetricResponse {
  const state = getCurrentState();
  const previous = getPreviousMetric();

  return {
    id: "machine-001",
    timestamp: new Date().toISOString(),
    state: state.currentState,
    metrics: {
      temperature: parseFloat(state.temperature.toFixed(1)),
      rpm: parseFloat(state.rpm.toFixed(0)),
      uptime: parseFloat(state.uptime.toFixed(2)),
      efficiency: parseFloat(state.efficiency.toFixed(1)),
    },
    oee: state.oee,
    trends: {
      temperature: previous
        ? getTrend(state.temperature, previous.temperature)
        : "stable",
      rpm: previous ? getTrend(state.rpm, previous.rpm) : "stable",
      efficiency: previous
        ? getTrend(state.efficiency, previous.efficiency)
        : "stable",
      oee: previous
        ? getTrend(state.oee.overall, previous.oee_overall)
        : "stable",
    },
  };
}

/**
 * Retorna o histórico de métricas em ordem cronológica.
 */
export function getHistory(limit: number) {
  return getMetricHistory(limit);
}
