// ============================================================
// services/alerts-service.ts — Serviço de Alertas
// Orquestra repository para operações de alertas.
// ============================================================

import {
  acknowledgeAlert as ackAlert,
  getAlerts,
} from "@/repositories/metrics-repository";

/**
 * Retorna alertas ordenados por severidade e timestamp.
 */
export function listAlerts(limit: number) {
  return getAlerts(limit);
}

/**
 * Marca um alerta como reconhecido.
 * Retorna true se encontrado, false se não existe.
 */
export function acknowledgeAlert(id: number): boolean {
  const result = ackAlert(id);
  return result.changes > 0;
}
