// ============================================================
// index.ts — Ponto de entrada do backend
// 1. Inicializa banco de dados (cria tabelas)
// 2. Inicia o simulador em paralelo (setInterval)
// 3. Inicia Express na porta 3001 com CORS habilitado
// ============================================================

import app from "@/app";
import { initDatabase } from "@/database/connection";
import { startSimulator } from "@/services/simulator";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do .env
dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

// 1. Inicializar banco de dados
initDatabase();

// 2. Iniciar servidor + simulador em paralelo
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);

  // Inicia o simulador DEPOIS do servidor estar pronto
  startSimulator();
});

export default app;
