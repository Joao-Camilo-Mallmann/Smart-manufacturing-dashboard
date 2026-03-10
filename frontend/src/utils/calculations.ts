// ============================================================
// utils/calculations.ts — Lógica de cálculos no frontend
// Funções puras para tendências e cores por threshold.
// ============================================================

import { Trend } from "@/types";

/**
 * Retorna classe CSS para cor do valor baseado em thresholds.
 */
export function getValueColor(
  value: number,
  warning?: number,
  critical?: number,
): string {
  if (critical && value > critical) return "text-state-error";
  if (warning && value > warning) return "text-state-maintenance";
  return "text-stw-primary";
}

/**
 * Retorna a cor hexadecimal OEE baseada no valor.
 */
export function getOEEColor(value: number): string {
  if (value >= 85) return "#22C55E"; // Excelente
  if (value >= 70) return "#1485C8"; // Bom
  if (value >= 50) return "#F59E0B"; // Aceitável
  return "#EF4444"; // Crítico
}

/**
 * Calcula a porcentagem de progresso para barra visual.
 */
export function getProgressPercent(value: number, max: number): number {
  return Math.min((value / max) * 100, 100);
}

/**
 * Retorna a cor da barra de progresso baseada em thresholds.
 */
export function getProgressColor(
  value: number,
  warning?: number,
  critical?: number,
): string {
  if (critical && value > critical) return "#EF4444";
  if (warning && value > warning) return "#EAB308";
  return "#1485C8";
}

/**
 * Determina a label and direction indicator para trend.
 */
export function getTrendLabel(trend: Trend): string {
  switch (trend) {
    case Trend.UP:
      return "↑";
    case Trend.DOWN:
      return "↓";
    default:
      return "→";
  }
}
