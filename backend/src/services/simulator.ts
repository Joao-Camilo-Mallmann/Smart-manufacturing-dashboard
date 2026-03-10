// ============================================================
// services/simulator.ts — Motor de Simulação (Random Walk)
// Orquestra as camadas: gera dado → avalia no Core → salva via Repository.
// Roda a cada 3 segundos via setInterval.
// ============================================================

import { calculateOEE } from "@/core/oee-calculator";
import { getNextState } from "@/core/state-policy";
import { evaluateThresholds } from "@/core/rules-engine";
import { insertMetric } from "@/repositories/metrics-repository";
import { SIMULATOR_CONFIG, SimulatorState, MachineState } from "@/config/types";

/** Estado interno do simulador (em memória) */
let state: SimulatorState = {
  currentState: MachineState.RUNNING,
  temperature: 70, // temperatura inicial (°C)
  rpm: 1200, // RPM inicial
  uptime: 0, // horas acumuladas
  efficiency: 85, // eficiência instantânea (%)
  oee: { overall: 0, availability: 0, performance: 0, quality: 0 },
  totalCycles: 0,
  runningCycles: 0,
  goodParts: 0,
  totalParts: 0,
  lastRpmZeroCycles: 0,
};

/**
 * Random walk: varia valor dentro de um delta, respeitando min/max.
 */
function randomWalk(
  current: number,
  delta: number,
  min: number,
  max: number,
): number {
  const change = (Math.random() - 0.5) * 2 * delta;
  return Math.max(min, Math.min(max, current + change));
}

/**
 * Simula um ciclo de leitura da máquina.
 * Comportamento varia por estado conforme regras de negócio.
 */
function simulateCycle(): void {
  const previousState = state.currentState;

  // 1. Decidir próximo estado (transição probabilística)
  state.currentState = getNextState(state.currentState);
  state.totalCycles++;

  // 2. Simular métricas conforme estado atual
  switch (state.currentState) {
    case MachineState.RUNNING:
      // Operação normal: temperatura 60-90°C, RPM 800-1500
      state.temperature = randomWalk(state.temperature, 2, 55, 92);
      state.rpm = randomWalk(state.rpm, 50, 750, 1550);
      state.uptime += SIMULATOR_CONFIG.intervalMs / 3_600_000; // converte ms para horas
      state.efficiency = randomWalk(state.efficiency, 3, 70, 99);
      state.runningCycles++;

      // Simula produção de peças
      const partsProduced = Math.floor(Math.random() * 5) + 1;
      state.totalParts += partsProduced;
      // Quality entre 90-100% das peças são boas
      const defectRate = 0.02 + Math.random() * 0.08;
      state.goodParts += Math.max(
        0,
        partsProduced - Math.floor(partsProduced * defectRate),
      );

      // Reset do contador de RPM zero
      if (state.rpm > 0) state.lastRpmZeroCycles = 0;
      else state.lastRpmZeroCycles++;
      break;

    case MachineState.STOPPED:
      // Máquina parada: temperatura desce, RPM tende a 0
      state.temperature = randomWalk(
        state.temperature,
        1.5,
        SIMULATOR_CONFIG.ambientTemperature,
        state.temperature,
      );
      state.rpm = Math.max(0, state.rpm - Math.random() * 200);
      state.efficiency = Math.max(0, state.efficiency - 1);
      break;

    case MachineState.MAINTENANCE:
      // Manutenção: RPM 0, temperatura estável ~30°C
      state.rpm = 0;
      state.temperature = randomWalk(state.temperature, 0.5, 28, 35);
      state.efficiency = randomWalk(state.efficiency, 1, 80, 95);
      break;

    case MachineState.ERROR:
      // Erro: queda abrupta de RPM, possível pico térmico
      state.rpm = Math.max(0, state.rpm * 0.3); // queda abrupta
      state.temperature = randomWalk(
        state.temperature,
        5,
        state.temperature - 2,
        95,
      );
      state.efficiency = Math.max(0, state.efficiency - 10);
      break;
  }

  // 3. Calcular OEE
  state.oee = calculateOEE(
    state.runningCycles,
    state.totalCycles,
    state.rpm,
    state.goodParts,
    state.totalParts,
  );

  // 4. Avaliar thresholds e gerar alertas
  evaluateThresholds(
    state.currentState,
    state.temperature,
    state.rpm,
    previousState,
  );

  // 5. Persistir leitura via Repository
  insertMetric(
    state.currentState,
    parseFloat(state.temperature.toFixed(1)),
    parseFloat(state.rpm.toFixed(0)),
    parseFloat(state.uptime.toFixed(2)),
    parseFloat(state.efficiency.toFixed(1)),
    state.oee.overall,
    state.oee.availability,
    state.oee.performance,
    state.oee.quality,
  );
}

/**
 * Inicia o motor de simulação em background.
 * Retorna o ID do intervalo para cleanup.
 */
export function startSimulator(): NodeJS.Timeout {
  console.log(
    `🏭 Simulador iniciado (ciclo: ${SIMULATOR_CONFIG.intervalMs}ms)`,
  );

  // Gera uma leitura inicial imediatamente
  simulateCycle();

  // Inicia o loop em background
  return setInterval(simulateCycle, SIMULATOR_CONFIG.intervalMs);
}

/**
 * Retorna o estado atual do simulador (para a rota /current).
 */
export function getCurrentState(): SimulatorState {
  return { ...state };
}
