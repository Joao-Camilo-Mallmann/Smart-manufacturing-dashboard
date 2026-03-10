// ============================================================
// repositories/metrics-repository.ts — Camada de Dados
// Queries SQL isoladas para métricas e alertas.
// ============================================================

import { getDatabase } from "../database/connection";

/**
 * Insere uma leitura de métrica no banco de dados.
 */
export function insertMetric(
  state: string,
  temperature: number,
  rpm: number,
  uptime: number,
  efficiency: number,
  oeeOverall: number,
  oeeAvailability: number,
  oeePerformance: number,
  oeeQuality: number,
): void {
  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO metric_history (state, temperature, rpm, uptime, efficiency, oee_overall, oee_availability, oee_performance, oee_quality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    state,
    temperature,
    rpm,
    uptime,
    efficiency,
    oeeOverall,
    oeeAvailability,
    oeePerformance,
    oeeQuality,
  );
}

/**
 * Busca a leitura anterior para tendências.
 */
export function getPreviousMetric() {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT temperature, rpm, efficiency, oee_overall
    FROM metric_history
    ORDER BY id DESC
    LIMIT 1 OFFSET 1
  `,
    )
    .get() as
    | {
        temperature: number;
        rpm: number;
        efficiency: number;
        oee_overall: number;
      }
    | undefined;
}

/**
 * Busca as últimas N leituras para o gráfico.
 */
export function getMetricHistory(limit: number) {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT timestamp, temperature, rpm, efficiency,
           oee_overall, oee_availability, oee_performance, oee_quality,
           state
    FROM metric_history
    ORDER BY id DESC
    LIMIT ?
  `,
    )
    .all(limit);
  return rows.reverse();
}

/**
 * Insere um alerta no banco de dados.
 */
export function insertAlert(
  level: string,
  message: string,
  component: string,
): void {
  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO alerts (level, message, component)
    VALUES (?, ?, ?)
  `,
  ).run(level, message, component);
}

/**
 * Busca alertas ordenados por severidade e timestamp.
 */
export function getAlerts(limit: number) {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT id, timestamp, level, message, component, acknowledged
    FROM alerts
    ORDER BY
      CASE level
        WHEN 'CRITICAL' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'INFO' THEN 3
      END ASC,
      id DESC
    LIMIT ?
  `,
    )
    .all(limit);
}

/**
 * Marca um alerta como reconhecido.
 */
export function acknowledgeAlert(id: string) {
  const db = getDatabase();
  return db
    .prepare(
      `
    UPDATE alerts SET acknowledged = 1 WHERE id = ?
  `,
    )
    .run(id);
}
