// ============================================================
// database.ts — Conexão e criação automática de tabelas SQLite
// Usa better-sqlite3 (síncrono) para máxima previsibilidade.
// ============================================================

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "industrial.db");

let db: Database.Database;

/**
 * Inicializa o banco SQLite e cria as tabelas se não existirem.
 * Chamado uma vez no boot do servidor.
 */
export function initDatabase(): Database.Database {
  // Garante que o diretório data/ existe
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Habilitar WAL mode para melhor performance de escrita
  db.pragma("journal_mode = WAL");

  // Criar tabela de histórico de métricas
  db.exec(`
    CREATE TABLE IF NOT EXISTS metric_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      state            TEXT    NOT NULL CHECK(state IN ('RUNNING','STOPPED','MAINTENANCE','ERROR')),
      temperature      REAL    NOT NULL,
      rpm              REAL    NOT NULL,
      uptime           REAL    NOT NULL,
      efficiency       REAL    NOT NULL,
      oee_overall      REAL    NOT NULL DEFAULT 0,
      oee_availability REAL    NOT NULL DEFAULT 0,
      oee_performance  REAL    NOT NULL DEFAULT 0,
      oee_quality      REAL    NOT NULL DEFAULT 0
    );
  `);

  // Criar tabela de alertas operacionais
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      level        TEXT    NOT NULL CHECK(level IN ('INFO','WARNING','CRITICAL')),
      message      TEXT    NOT NULL,
      component    TEXT    NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0
    );
  `);

  console.log("✅ Banco de dados SQLite inicializado:", DB_PATH);
  return db;
}

/** Retorna a instância do banco de dados */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error(
      "Banco de dados não inicializado. Chame initDatabase() primeiro.",
    );
  }
  return db;
}

/** Fecha a conexão com o banco (para testes e shutdown) */
export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
