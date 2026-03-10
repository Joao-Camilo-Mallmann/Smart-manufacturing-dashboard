// ============================================================
// index.ts — Ponto de entrada do backend
// 1. Inicializa banco de dados (cria tabelas)
// 2. Inicia o simulador em paralelo (setInterval)
// 3. Inicia Express na porta 3001 com CORS habilitado
// ============================================================

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import alertsRouter from "./controllers/alerts";
import healthRouter from "./controllers/health";
import metricsRouter from "./controllers/metrics";
import { initDatabase } from "./database/connection";
import { startSimulator } from "./services/simulator";

// Carrega as variáveis de ambiente do .env
dotenv.config();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

// 1. Inicializar banco de dados
initDatabase();

// 2. Configurar Express
const app = express();
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

// 3. Registrar rotas
app.use("/api/metrics", metricsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/health", healthRouter);

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

// 4. Iniciar servidor + simulador em paralelo
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);

  // Inicia o simulador DEPOIS do servidor estar pronto
  startSimulator();
});

export default app;
