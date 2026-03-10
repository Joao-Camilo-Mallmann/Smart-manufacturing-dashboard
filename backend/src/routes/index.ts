// ============================================================
// routes/index.ts — Registro centralizado de rotas
// Mapeia prefixos de URL para controllers.
// ============================================================

import alertsRouter from "@/controllers/alerts";
import healthRouter from "@/controllers/health";
import metricsRouter from "@/controllers/metrics";
import { Router } from "express";

const router = Router();

router.use("/metrics", metricsRouter);
router.use("/alerts", alertsRouter);
router.use("/health", healthRouter);

export default router;
