// ============================================================
// types.ts — Interfaces TypeScript compartilhadas (Backend)
// Define o contrato de dados entre backend, banco de dados e API.
// ============================================================

/** Estados válidos da máquina industrial */
export type MachineState = "RUNNING" | "STOPPED" | "MAINTENANCE" | "ERROR";

/** Níveis de severidade de alertas */
export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

/** Métricas de eficiência (OEE) */
export interface OEEMetrics {
  overall: number; // OEE geral (availability × performance × quality)
  availability: number; // tempo RUNNING / tempo planejado
  performance: number; // rpm médio real / rpm teórico máximo
  quality: number; // peças boas / peças totais
}

/** Leitura completa do estado da máquina */
export interface MachineStatus {
  id: string;
  timestamp: Date;
  state: MachineState;
  metrics: {
    temperature: number;
    rpm: number;
    uptime: number; // horas de operação
    efficiency: number; // eficiência instantânea (%)
  };
  oee: OEEMetrics;
}

/** Alerta operacional */
export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  component: string;
  timestamp: Date;
  acknowledged: boolean;
}

/** Ponto do histórico de métricas (para gráficos) */
export interface MetricHistory {
  timestamp: Date;
  temperature: number;
  rpm: number;
  efficiency: number;
}

/** Estado interno do simulador */
export interface SimulatorState {
  currentState: MachineState;
  temperature: number;
  rpm: number;
  uptime: number;
  efficiency: number;
  oee: OEEMetrics;
  totalCycles: number;
  runningCycles: number;
  goodParts: number;
  totalParts: number;
  lastRpmZeroCycles: number; // conta ciclos com RPM=0 em RUNNING
}

/** Transições válidas da máquina de estados */
export const VALID_TRANSITIONS: Record<MachineState, MachineState[]> = {
  STOPPED: ["RUNNING"],
  RUNNING: ["STOPPED", "ERROR"],
  ERROR: ["MAINTENANCE"],
  MAINTENANCE: ["STOPPED", "RUNNING"],
};

/** Probabilidades de transição por estado (soma deve ser ~1.0) */
export const TRANSITION_PROBABILITIES: Record<
  MachineState,
  { stay: number; transitions: { to: MachineState; prob: number }[] }
> = {
  RUNNING: {
    stay: 0.93,
    transitions: [
      { to: "STOPPED", prob: 0.04 },
      { to: "ERROR", prob: 0.03 },
    ],
  },
  STOPPED: {
    stay: 0.85,
    transitions: [{ to: "RUNNING", prob: 0.15 }],
  },
  ERROR: {
    stay: 0.7,
    transitions: [{ to: "MAINTENANCE", prob: 0.3 }],
  },
  MAINTENANCE: {
    stay: 0.75,
    transitions: [
      { to: "STOPPED", prob: 0.1 },
      { to: "RUNNING", prob: 0.15 },
    ],
  },
};

/** Constantes de threshold operacional */
export const THRESHOLDS = {
  temperature: {
    normal: 80,
    warning: 85,
    coldAnomaly: 20,
  },
  rpm: {
    min: 800,
    max: 1500,
  },
  alertCooldownMs: 60_000, // 60 segundos entre alertas iguais
  maxVisibleAlerts: 20,
} as const;

/** Constantes do simulador */
export const SIMULATOR_CONFIG = {
  intervalMs: 3000, // ciclo de 3 segundos
  rpmTheoretical: 1500, // RPM teórico máximo
  ambientTemperature: 25, // temperatura ambiente (°C)
} as const;
