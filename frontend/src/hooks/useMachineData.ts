// ============================================================
// hooks/useMachineData.ts — Custom hook de polling
// Encapsula toda a lógica de comunicação com o backend.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAlerts,
  fetchCurrentMetrics,
  fetchHistory,
} from "../services/api";
import type { Alert, MachineStatus, MetricHistory } from "../types";

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL);

interface MachineData {
  status: MachineStatus | null;
  history: MetricHistory[];
  alerts: Alert[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useMachineData(): MachineData {
  const [status, setStatus] = useState<MachineStatus | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Carga inicial: busca histórico e alertas completos
  const loadInitialData = useCallback(async () => {
    try {
      const [historyData, alertsData, currentData] = await Promise.all([
        fetchHistory(120),
        fetchAlerts(),
        fetchCurrentMetrics(),
      ]);
      setHistory(historyData);
      setAlerts(alertsData);
      setStatus(currentData);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError("Falha ao carregar dados iniciais");
      console.error("❌ Erro na carga inicial:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling: busca métricas atuais e alertas a cada ciclo
  const pollData = useCallback(async () => {
    try {
      const [currentData, alertsData] = await Promise.all([
        fetchCurrentMetrics(),
        fetchAlerts(),
      ]);

      setStatus(currentData);
      setAlerts(alertsData);

      // Adiciona ponto ao histórico (mantém janela de 120 pontos)
      setHistory((prev) => {
        const newPoint: MetricHistory = {
          timestamp: currentData.timestamp,
          temperature: currentData.metrics.temperature,
          rpm: currentData.metrics.rpm,
          efficiency: currentData.metrics.efficiency,
          state: currentData.state,
          oee_overall: currentData.oee.overall,
          oee_availability: currentData.oee.availability,
          oee_performance: currentData.oee.performance,
          oee_quality: currentData.oee.quality,
        };
        const updated = [...prev, newPoint];
        return updated.length > 120 ? updated.slice(-120) : updated;
      });

      // Reconexão detectada
      if (!isConnected) {
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      setIsConnected(false);
      setError("Conexão perdida com o servidor");
      console.error("❌ Polling falhou:", err);
    }
  }, [isConnected]);

  useEffect(() => {
    loadInitialData();

    intervalRef.current = window.setInterval(pollData, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadInitialData, pollData]);

  return { status, history, alerts, isConnected, isLoading, error };
}
