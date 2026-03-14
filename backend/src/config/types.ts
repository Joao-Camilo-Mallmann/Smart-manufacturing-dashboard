/** Estados válidos da máquina industrial */
export enum MachineState {
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  MAINTENANCE = "MAINTENANCE",
  ERROR = "ERROR",
}

/** Níveis de severidade de alertas */
export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

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

/** Evento de alerta gerado pelo rules-engine (dados puros, sem persistência) */
export interface AlertEvent {
  level: AlertLevel;
  message: string;
  component: string;
}

/** Resposta da rota /api/metrics/current */
export interface MetricResponse {
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
    temperature: string;
    rpm: string;
    efficiency: string;
    oee: string;
  };
}

/** Resposta da rota /api/alerts */
export interface AlertResponse {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  component: string;
  acknowledged: number;
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
  [MachineState.STOPPED]: [MachineState.RUNNING],
  [MachineState.RUNNING]: [MachineState.STOPPED, MachineState.ERROR],
  [MachineState.ERROR]: [MachineState.MAINTENANCE],
  [MachineState.MAINTENANCE]: [MachineState.STOPPED, MachineState.RUNNING],
};

/** Probabilidades de transição por estado (soma deve ser ~1.0) */
export const TRANSITION_PROBABILITIES: Record<
  MachineState,
  { stay: number; transitions: { to: MachineState; prob: number }[] }
> = {
  [MachineState.RUNNING]: {
    stay: 0.93,
    transitions: [
      { to: MachineState.STOPPED, prob: 0.04 },
      { to: MachineState.ERROR, prob: 0.03 },
    ],
  },
  [MachineState.STOPPED]: {
    stay: 0.85,
    transitions: [{ to: MachineState.RUNNING, prob: 0.15 }],
  },
  [MachineState.ERROR]: {
    stay: 0.7,
    transitions: [{ to: MachineState.MAINTENANCE, prob: 0.3 }],
  },
  [MachineState.MAINTENANCE]: {
    stay: 0.75,
    transitions: [
      { to: MachineState.STOPPED, prob: 0.1 },
      { to: MachineState.RUNNING, prob: 0.15 },
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

import dotenv from "dotenv";
dotenv.config();

/**
 * Lê número do ambiente com fallback seguro para evitar NaN em runtime.
 */
function getEnvNumber(
  key: string,
  fallback: number,
  validator?: (value: number) => boolean,
): number {
  const rawValue = process.env[key];
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  if (validator && !validator(parsedValue)) {
    return fallback;
  }

  return parsedValue;
}

/** Constantes do simulador */
export const SIMULATOR_CONFIG = {
  intervalMs: getEnvNumber("SIMULATOR_INTERVAL_MS", 3000, (value) => value > 0),
  rpmTheoretical: getEnvNumber(
    "SIMULATOR_RPM_THEORETICAL",
    1500,
    (value) => value > 0,
  ),
  ambientTemperature: getEnvNumber("SIMULATOR_AMBIENT_TEMP", 25),
} as const;
