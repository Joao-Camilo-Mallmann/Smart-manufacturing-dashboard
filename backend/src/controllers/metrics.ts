// ============================================================
// controllers/metrics.ts — Controller de métricas (current e history)
// Interface REST: recebe request, delega para serviço/repositório.
// ============================================================

import { Request, Response, Router } from "express";
import { getTrend } from "@/core/oee-calculator";
import { getCurrentState } from "@/services/simulator";
import {
  getPreviousMetric,
  getMetricHistory,
} from "@/repositories/metrics-repository";

const router = Router();

/**
 * GET /api/metrics/current
 * Retorna a leitura mais recente + estado + OEE + tendências.
 */
router.get("/current", (_req: Request, res: Response) => {
  try {
    const state = getCurrentState();
    // Busca a leitura anterior para calcular tendência (via Repository)
    const previous = getPreviousMetric();

    const response = {
      id: `machine-001`,
      timestamp: new Date().toISOString(),
      state: state.currentState,
      metrics: {
        temperature: parseFloat(state.temperature.toFixed(1)),
        rpm: parseFloat(state.rpm.toFixed(0)),
        uptime: parseFloat(state.uptime.toFixed(2)),
        efficiency: parseFloat(state.efficiency.toFixed(1)),
      },
      oee: state.oee,
      trends: {
        temperature: previous
          ? getTrend(state.temperature, previous.temperature)
          : "stable",
        rpm: previous ? getTrend(state.rpm, previous.rpm) : "stable",
        efficiency: previous
          ? getTrend(state.efficiency, previous.efficiency)
          : "stable",
        oee: previous
          ? getTrend(state.oee.overall, previous.oee_overall)
          : "stable",
      },
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Erro ao buscar métricas atuais:", error);
    res.status(500).json({ error: "Erro interno ao buscar métricas" });
  }
});

/**
 * GET /api/metrics/history
 * Retorna as últimas N leituras para alimentar os gráficos.
 * Query param: ?limit=120 (padrão: 120)
 */
router.get("/history", (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 120, 500);
    const rows = getMetricHistory(limit);

    // Inverter para ordem cronológica (mais antigo primeiro)
    res.json(rows.reverse());
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro interno ao buscar histórico" });
  }
});

export default router;
