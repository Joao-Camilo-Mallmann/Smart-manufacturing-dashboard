// ============================================================
// types.ts — Interfaces TypeScript compartilhadas (Frontend)
// Espelha os contratos do backend para tipagem forte.
// ============================================================

export type MachineState = "RUNNING" | "STOPPED" | "MAINTENANCE" | "ERROR";
export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";
export type Trend = "up" | "down" | "stable";

export interface OEEMetrics {
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface MachineStatus {
  id: string;
  timestamp: string;
  state: MachineState;
  metrics: {
    temperature: number;
    rpm: number;
    uptime: number;
    efficiency: number;
  };
  oee: OEEMetrics;
  trends: {
    temperature: Trend;
    rpm: Trend;
    efficiency: Trend;
    oee: Trend;
  };
}

export interface Alert {
  id: number;
  level: AlertLevel;
  message: string;
  component: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface MetricHistory {
  timestamp: string;
  temperature: number;
  rpm: number;
  efficiency: number;
  state: MachineState;
  oee_overall: number;
  oee_availability: number;
  oee_performance: number;
  oee_quality: number;
}
