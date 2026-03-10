// ============================================================
// controllers/metrics.ts — Controller de métricas (current e history)
// Interface REST: recebe request, delega para serviço.
// ============================================================

import { getCurrentMetrics, getHistory } from "@/services/metrics-service";
import { Request, Response, Router } from "express";

const router = Router();

/**
 * GET /api/metrics/current
 * Retorna a leitura mais recente + estado + OEE + tendências.
 */
router.get("/current", (_req: Request, res: Response) => {
  try {
    res.json(getCurrentMetrics());
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
    res.json(getHistory(limit));
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro interno ao buscar histórico" });
  }
});

export default router;
