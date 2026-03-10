// ============================================================
// core/state-policy.ts — Política de Estados da Máquina
// Valida transições e gerencia probabilidades configuráveis.
// ============================================================

import {
  MachineState,
  TRANSITION_PROBABILITIES,
  VALID_TRANSITIONS,
} from "../config/types";

/**
 * Verifica se uma transição de estado é válida.
 */
export function isValidTransition(
  from: MachineState,
  to: MachineState,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Calcula o próximo estado da máquina baseado em probabilidades.
 * Usa random walk para variar o estado de forma realista.
 */
export function getNextState(currentState: MachineState): MachineState {
  const config = TRANSITION_PROBABILITIES[currentState];
  const roll = Math.random();

  // Verifica se fica no estado atual
  if (roll < config.stay) {
    return currentState;
  }

  // Calcula qual transição acontece
  let cumulative = config.stay;
  for (const transition of config.transitions) {
    cumulative += transition.prob;
    if (roll < cumulative) {
      return transition.to;
    }
  }

  // Fallback: permanece no estado atual
  return currentState;
}

/**
 * Força uma transição específica (para testes ou comandos manuais).
 * Retorna o novo estado se válido, ou null se transição inválida.
 */
export function forceTransition(
  from: MachineState,
  to: MachineState,
): MachineState | null {
  if (isValidTransition(from, to)) {
    return to;
  }
  return null;
}
