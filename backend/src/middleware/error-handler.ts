// ============================================================
// middleware/error-handler.ts — Middleware centralizado de erros
// Captura erros não tratados nos controllers e retorna JSON.
// ============================================================

import { NextFunction, Request, Response } from "express";

/**
 * Middleware de tratamento de erros global.
 * Registrar como último app.use() no index.ts.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("❌ Erro não tratado:", err.message);
  res.status(500).json({ error: "Erro interno do servidor" });
}
