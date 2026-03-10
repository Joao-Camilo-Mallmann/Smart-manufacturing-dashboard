// ============================================================
// core/rules-engine.ts — Motor de Regras (Rules Engine)
// Avalia thresholds e retorna alertas com cooldown.
// Camada PURA — sem dependências de infraestrutura.
// ============================================================

import {
  AlertEvent,
  AlertLevel,
  MachineState,
  THRESHOLDS,
} from "@/config/types";

/** Mapa de cooldown: chave do evento → timestamp do último disparo */
const alertCooldowns: Map<string, number> = new Map();

/**
 * Verifica se um alerta pode ser disparado (cooldown expirado).
 */
function canFireAlert(key: string): boolean {
  const lastFired = alertCooldowns.get(key);
  if (!lastFired) return true;
  return Date.now() - lastFired >= THRESHOLDS.alertCooldownMs;
}

/**
 * Registra o disparo de um alerta no cooldown.
 */
function markAlertFired(key: string): void {
  alertCooldowns.set(key, Date.now());
}

/**
 * Adiciona um alerta à lista se o cooldown permitir.
 */
function pushAlert(
  alerts: AlertEvent[],
  level: AlertLevel,
  message: string,
  component: string,
): void {
  const key = `${component}:${message}`;
  if (!canFireAlert(key)) return;

  alerts.push({ level, message, component });
  markAlertFired(key);
}

/**
 * Avalia todas as regras de threshold e retorna alertas gerados.
 * Camada pura — não persiste nada, apenas retorna dados.
 * A persistência é responsabilidade do serviço chamador.
 */
export function evaluateThresholds(
  state: MachineState,
  temperature: number,
  rpm: number,
  previousState: MachineState,
): AlertEvent[] {
  const alerts: AlertEvent[] = [];

  // --- Regras de Temperatura ---
  if (temperature > THRESHOLDS.temperature.warning) {
    pushAlert(
      alerts,
      AlertLevel.CRITICAL,
      `Temperatura crítica: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature > THRESHOLDS.temperature.normal) {
    pushAlert(
      alerts,
      AlertLevel.WARNING,
      `Temperatura elevada: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature < THRESHOLDS.temperature.coldAnomaly) {
    pushAlert(
      alerts,
      AlertLevel.INFO,
      `Anomalia de temperatura fria: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  }

  // --- Regras de RPM (somente quando RUNNING) ---
  if (state === MachineState.RUNNING) {
    if (rpm > THRESHOLDS.rpm.max) {
      pushAlert(
        alerts,
        AlertLevel.CRITICAL,
        `RPM acima do limite: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm < THRESHOLDS.rpm.min && rpm > 0) {
      pushAlert(
        alerts,
        AlertLevel.WARNING,
        `RPM abaixo do normal: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm === 0) {
      pushAlert(
        alerts,
        AlertLevel.CRITICAL,
        "RPM zerado em operação",
        "sensor_rpm",
      );
    }
  }

  // --- Regra de transição para ERROR ---
  if (state === MachineState.ERROR && previousState !== MachineState.ERROR) {
    pushAlert(
      alerts,
      AlertLevel.CRITICAL,
      "Máquina entrou em estado de ERRO",
      "estado_maquina",
    );
  }

  // --- Regra de entrada em MAINTENANCE ---
  if (
    state === MachineState.MAINTENANCE &&
    previousState !== MachineState.MAINTENANCE
  ) {
    pushAlert(
      alerts,
      AlertLevel.INFO,
      "Manutenção iniciada na máquina",
      "estado_maquina",
    );
  }

  return alerts;
}

/**
 * Limpa o mapa de cooldowns (para testes).
 */
export function clearCooldowns(): void {
  alertCooldowns.clear();
}
