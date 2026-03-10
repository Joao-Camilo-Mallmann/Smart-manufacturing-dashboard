// ============================================================
// core/rules-engine.ts — Motor de Regras (Rules Engine)
// Avalia thresholds e gera alertas com cooldown.
// Isolado da infraestrutura — testável independentemente.
// ============================================================

import { getDatabase } from "../database/connection";
import { AlertLevel, MachineState, THRESHOLDS } from "../config/types";

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
      "CRITICAL",
      `Temperatura crítica: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature > THRESHOLDS.temperature.normal) {
    insertAlert(
      "WARNING",
      `Temperatura elevada: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  } else if (temperature < THRESHOLDS.temperature.coldAnomaly) {
    insertAlert(
      "INFO",
      `Anomalia de temperatura fria: ${temperature.toFixed(1)}°C`,
      "sensor_temperatura",
    );
  }

  // --- Regras de RPM (somente quando RUNNING) ---
  if (state === "RUNNING") {
    if (rpm > THRESHOLDS.rpm.max) {
      insertAlert(
        "CRITICAL",
        `RPM acima do limite: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm < THRESHOLDS.rpm.min && rpm > 0) {
      insertAlert(
        "WARNING",
        `RPM abaixo do normal: ${rpm.toFixed(0)}`,
        "sensor_rpm",
      );
    } else if (rpm === 0) {
      insertAlert("CRITICAL", "RPM zerado em operação", "sensor_rpm");
    }
  }

  // --- Regra de transição para ERROR ---
  if (state === "ERROR" && previousState !== "ERROR") {
    insertAlert(
      "CRITICAL",
      "Máquina entrou em estado de ERRO",
      "estado_maquina",
    );
  }

  // --- Regra de entrada em MAINTENANCE ---
  if (state === "MAINTENANCE" && previousState !== "MAINTENANCE") {
    insertAlert("INFO", "Manutenção iniciada na máquina", "estado_maquina");
  }
}

/**
 * Limpa o mapa de cooldowns (para testes).
 */
export function clearCooldowns(): void {
  alertCooldowns.clear();
}
