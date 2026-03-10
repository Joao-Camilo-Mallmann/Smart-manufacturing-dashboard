// ============================================================
// utils/formatters.ts — Formatadores de exibição
// Funções puras para transformar dados em strings legíveis.
// ============================================================

/**
 * Formata horas decimais em string legível (ex: "5h 23m")
 */
export function formatUptime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours % 1) * 60);
  return `${h}h ${m}m`;
}

/**
 * Formata timestamp ISO em hora local legível (ex: "21:35:33")
 */
export function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

/**
 * Retorna uma string relativa ao tempo (ex: "5min atrás")
 */
export function timeAgo(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    return `${Math.floor(diff / 3600)}h atrás`;
  } catch {
    return "";
  }
}

/**
 * Formata número com casas decimais fixas
 */
export function formatMetric(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
