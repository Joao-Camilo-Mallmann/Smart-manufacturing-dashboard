// ============================================================
// routes/health.ts — Rota de health check
// ============================================================

import { Request, Response, Router } from "express";

const startTime = Date.now();
const router = Router();

/**
 * GET /api/health
 * Retorna o status do servidor e uptime.
 */
router.get("/", (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  res.json({
    status: "ok",
    uptime: uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
  });
});

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default router;
