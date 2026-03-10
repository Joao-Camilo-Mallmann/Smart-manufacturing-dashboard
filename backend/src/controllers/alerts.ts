// ============================================================
// controllers/alerts.ts — Controller de alertas operacionais
// Interface REST: delega para o repositório de dados.
// ============================================================

import { Request, Response, Router } from "express";
import { THRESHOLDS } from "../config/types";
import {
  getAlerts,
  acknowledgeAlert as ackAlert,
} from "../repositories/metrics-repository";

const router = Router();

/**
 * GET /api/alerts
 * Retorna os últimos alertas ordenados por severidade e timestamp.
 * Query param: ?limit=20 (padrão: 20)
 */
router.get("/", (_req: Request, res: Response) => {
  try {
    const limit = Math.min(
      parseInt(_req.query.limit as string) || THRESHOLDS.maxVisibleAlerts,
      100,
    );

    const rows = getAlerts(limit);
    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar alertas:", error);
    res.status(500).json({ error: "Erro interno ao buscar alertas" });
  }
});

/**
 * PATCH /api/alerts/:id/acknowledge
 * Marca um alerta como reconhecido.
 */
router.patch("/:id/acknowledge", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = ackAlert(id);

    if (result.changes === 0) {
      res.status(404).json({ error: "Alerta não encontrado" });
      return;
    }

    res.json({ success: true, message: `Alerta ${id} reconhecido` });
  } catch (error) {
    console.error("❌ Erro ao reconhecer alerta:", error);
    res.status(500).json({ error: "Erro interno ao reconhecer alerta" });
  }
});

export default router;
