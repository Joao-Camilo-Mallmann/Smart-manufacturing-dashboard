// ============================================================
// core/rules-engine.ts — Motor de Regras (Rules Engine)
// Avalia thresholds e gera alertas com cooldown.
// Isolado da infraestrutura — testável independentemente.
// ============================================================

import { AlertLevel, MachineState, THRESHOLDS } from "../config/types";
import { getDatabase } from "../database/connection";

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
 * Insere um alerta no banco de dados se o cooldown permitir.
 */
function insertAlert(
  level: AlertLevel,
  message: string,
  component: string,
): void {
  const key = `${component}:${message}`;
  if (!canFireAlert(key)) return;

  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO alerts (level, message, component)
    VALUES (?, ?, ?)
  `,
  ).run(level, message, component);

  markAlertFired(key);
}

/**
 * Avalia todas as regras de threshold e gera alertas quando necessário.
 * Chamada a cada ciclo do simulador.
 */
export function evaluateThresholds(
  state: MachineState,
  temperature: number,
  rpm: number,
  previousState: MachineState,
): void {
  // --- Regras de Temperatura ---
  if (temperature > THRESHOLDS.temperature.warning) {
    insertAlert(
      AlertLevel.CRITICAL,
      `Temperatura crítica: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature > THRESHOLDS.temperature.normal) {
    insertAlert(
      AlertLevel.WARNING,
      `Temperatura elevada: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature < THRESHOLDS.temperature.coldAnomaly) {
    insertAlert(
      AlertLevel.INFO,
      `Anomalia de temperatura fria: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  }

  // --- Regras de RPM (somente quando RUNNING) ---
  if (state === MachineState.RUNNING) {
    if (rpm > THRESHOLDS.rpm.max) {
      insertAlert(
        AlertLevel.CRITICAL,
        `RPM acima do limite: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm < THRESHOLDS.rpm.min && rpm > 0) {
      insertAlert(
        AlertLevel.WARNING,
        `RPM abaixo do normal: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm === 0) {
      insertAlert(AlertLevel.CRITICAL, "RPM zerado em operação", "sensor_rpm");
    }
  }

  // --- Regra de transição para ERROR ---
  if (state === MachineState.ERROR && previousState !== MachineState.ERROR) {
    insertAlert(
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
    insertAlert(
      AlertLevel.INFO,
      "Manutenção iniciada na máquina",
      "estado_maquina",
    );
  }
}

/**
 * Limpa o mapa de cooldowns (para testes).
 */
export function clearCooldowns(): void {
  alertCooldowns.clear();
}
