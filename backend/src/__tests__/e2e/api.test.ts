// ============================================================
// api.test.ts — Testes E2E da API REST
// Valida os endpoints usando supertest contra o app Express.
// ============================================================

import app from "@/app";
import { closeDatabase, initDatabase } from "@/database/connection";
import { insertAlert, insertMetric } from "@/repositories/metrics-repository";
import request from "supertest";

beforeAll(() => {
  initDatabase();

  // Insere dados de seed para garantir respostas não-vazias
  insertMetric("RUNNING", 72.5, 1200, 5.5, 88.3, 75.0, 90.0, 85.0, 95.0);
  insertMetric("RUNNING", 74.0, 1250, 5.51, 87.1, 74.5, 89.5, 84.0, 94.0);
  insertAlert("WARNING", "Temperatura acima de 80°C", "Temperatura");
});

afterAll(() => {
  closeDatabase();
});

describe("GET /", () => {
  it("retorna informações da API", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Dashboard Industrial API");
    expect(res.body).toHaveProperty("version", "1.0.0");
    expect(res.body.endpoints).toBeInstanceOf(Array);
  });
});

describe("GET /api/health", () => {
  it("retorna status ok com uptime", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("timestamp");
  });
});

describe("GET /api/metrics/current", () => {
  it("retorna leitura atual com shape correto", async () => {
    const res = await request(app).get("/api/metrics/current");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("state");
    expect(res.body).toHaveProperty("metrics");
    expect(res.body.metrics).toHaveProperty("temperature");
    expect(res.body.metrics).toHaveProperty("rpm");
    expect(res.body).toHaveProperty("oee");
    expect(res.body).toHaveProperty("trends");
  });
});

describe("GET /api/metrics/history", () => {
  it("retorna array de histórico", async () => {
    const res = await request(app).get("/api/metrics/history");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("respeita o parâmetro limit", async () => {
    const res = await request(app).get("/api/metrics/history?limit=1");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/alerts", () => {
  it("retorna array de alertas", async () => {
    const res = await request(app).get("/api/alerts");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("PATCH /api/alerts/:id/acknowledge", () => {
  it("retorna 404 para alerta inexistente", async () => {
    const res = await request(app).patch("/api/alerts/99999/acknowledge");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("reconhece alerta existente com sucesso", async () => {
    // Busca o primeiro alerta para pegar o ID real
    const alertsRes = await request(app).get("/api/alerts");
    const firstAlert = alertsRes.body[0];

    const res = await request(app).patch(
      `/api/alerts/${firstAlert.id}/acknowledge`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});
