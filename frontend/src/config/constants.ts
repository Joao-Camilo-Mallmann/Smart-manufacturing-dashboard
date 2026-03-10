// ============================================================
// config/constants.ts — Constantes de configuração do Frontend
// URL base da API e configurações visuais do branding.
// ============================================================

/** Intervalo de polling em milissegundos */
export const POLLING_INTERVAL_MS = 3000;

/** Limites de pontos no gráfico */
export const CHART_HISTORY_LIMIT = 120;

/** Cores do branding STW */
export const BRAND_COLORS = {
  primary: "#1485C8",
  dark: "#081653",
  secondary: "#0C24A8",
  corporate: "#005A87",
  light: "#0085C8",
} as const;

/** Cores de estado */
export const STATE_COLORS = {
  RUNNING: "#22C55E",
  STOPPED: "#6B7280",
  MAINTENANCE: "#EAB308",
  ERROR: "#EF4444",
} as const;

/** Cores de alerta */
export const ALERT_COLORS = {
  INFO: "#3B82F6",
  WARNING: "#F59E0B",
  CRITICAL: "#DC2626",
} as const;

/** Thresholds visuais para metric cards */
export const VISUAL_THRESHOLDS = {
  temperature: { warning: 80, critical: 85, max: 100 },
  rpm: { max: 1500 },
  efficiency: { max: 100 },
} as const;
