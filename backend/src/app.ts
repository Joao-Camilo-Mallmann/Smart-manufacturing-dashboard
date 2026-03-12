// ============================================================
// app.ts — Configuração do Express (sem side-effects)
// Exporta o app configurado para uso em index.ts e nos testes.
// ============================================================

import { errorHandler } from "@/middleware/error-handler";
import routes from "@/routes";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);
app.use(express.json());

// Registrar rotas
app.use("/api", routes);

// Rota raiz informativa
app.get("/", (_req, res) => {
  res.json({
    name: "Dashboard Industrial API",
    version: "1.0.0",
    endpoints: [
      "GET /api/metrics/current",
      "GET /api/metrics/history",
      "GET /api/alerts",
      "PATCH /api/alerts/:id/acknowledge",
      "GET /api/health",
    ],
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

export default app;
