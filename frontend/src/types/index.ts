// ============================================================
// types.ts — Interfaces TypeScript compartilhadas (Frontend)
// Espelha os contratos do backend para tipagem forte.
// ============================================================

export enum MachineState {
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  MAINTENANCE = "MAINTENANCE",
  ERROR = "ERROR",
}

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export enum Trend {
  UP = "up",
  DOWN = "down",
  STABLE = "stable",
}

export interface OEEMetrics {
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface MachineMetrics {
  temperature: number;
  rpm: number;
  uptime: number;
  efficiency: number;
}

export interface MetricTrends {
  temperature: Trend;
  rpm: Trend;
  efficiency: Trend;
  oee: Trend;
}

export interface MachineStatus {
  id: string;
  timestamp: string;
  state: MachineState;
  metrics: MachineMetrics;
  oee: OEEMetrics;
  trends: MetricTrends;
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
