// ============================================================
// core/oee-calculator.ts — Cálculo de OEE
// Lógica pura: calcula availability, performance, quality.
// Independente de infraestrutura — totalmente testável.
// ============================================================

import { OEEMetrics, SIMULATOR_CONFIG } from "../config/types";

/**
 * Clamp de valor entre 0 e 100 (percentual).
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Calcula as métricas de OEE com base no estado acumulado do simulador.
 *
 * - availability: proporção de ciclos em RUNNING vs total
 * - performance: rpm médio real vs rpm teórico máximo
 * - quality: peças boas vs peças totais (simulado)
 * - overall: availability × performance × quality
 */
export function calculateOEE(
  runningCycles: number,
  totalCycles: number,
  currentRpm: number,
  goodParts: number,
  totalParts: number,
): OEEMetrics {
  // Evita divisão por zero
  if (totalCycles === 0) {
    return { overall: 0, availability: 0, performance: 0, quality: 0 };
  }

  // Availability = tempo em RUNNING / tempo planejado
  const availability = clamp((runningCycles / totalCycles) * 100);

  // Performance = RPM médio real / RPM teórico máximo
  const performance = clamp(
    (currentRpm / SIMULATOR_CONFIG.rpmTheoretical) * 100,
  );

  // Quality = peças boas / peças totais
  const quality = totalParts > 0 ? clamp((goodParts / totalParts) * 100) : 95; // default se não há peças ainda

  // OEE = availability × performance × quality (normalizados 0-1, resultado em %)
  const overall = clamp(
    (availability / 100) * (performance / 100) * (quality / 100) * 100,
  );

  return {
    overall: parseFloat(overall.toFixed(1)),
    availability: parseFloat(availability.toFixed(1)),
    performance: parseFloat(performance.toFixed(1)),
    quality: parseFloat(quality.toFixed(1)),
  };
}

/**
 * Determina a tendência comparando valor atual vs anterior.
 * Retorna: 'up', 'down' ou 'stable'
 */
export function getTrend(
  current: number,
  previous: number,
): "up" | "down" | "stable" {
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "up" : "down";
}
