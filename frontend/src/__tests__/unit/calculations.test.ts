import { Trend } from "@/types";
import {
  getOEEColor,
  getProgressColor,
  getProgressPercent,
  getTrendLabel,
  getValueColor,
} from "@/utils/calculations";
import { describe, expect, it } from "vitest";

describe("getValueColor", () => {
  it("retorna erro acima do critical", () => {
    expect(getValueColor(90, 80, 85)).toBe("text-state-error");
  });

  it("retorna warning entre warning e critical", () => {
    expect(getValueColor(82, 80, 85)).toBe("text-state-maintenance");
  });

  it("retorna primário para valores normais", () => {
    expect(getValueColor(50, 80, 85)).toBe("text-stw-primary");
  });

  it("retorna primário sem thresholds definidos", () => {
    expect(getValueColor(50)).toBe("text-stw-primary");
  });
});

describe("getOEEColor", () => {
  it("retorna verde para OEE excelente (>= 85)", () => {
    expect(getOEEColor(90)).toBe("#22C55E");
  });

  it("retorna azul para OEE bom (70-84)", () => {
    expect(getOEEColor(75)).toBe("#1485C8");
  });

  it("retorna amarelo para OEE aceitável (50-69)", () => {
    expect(getOEEColor(55)).toBe("#F59E0B");
  });

  it("retorna vermelho para OEE crítico (< 50)", () => {
    expect(getOEEColor(30)).toBe("#EF4444");
  });
});

describe("getProgressPercent", () => {
  it("calcula porcentagem corretamente", () => {
    expect(getProgressPercent(50, 100)).toBe(50);
    expect(getProgressPercent(75, 100)).toBe(75);
  });

  it("limita a 100% quando valor excede máximo", () => {
    expect(getProgressPercent(150, 100)).toBe(100);
  });
});

describe("getProgressColor", () => {
  it("retorna vermelho acima do critical", () => {
    expect(getProgressColor(90, 80, 85)).toBe("#EF4444");
  });

  it("retorna amarelo entre warning e critical", () => {
    expect(getProgressColor(82, 80, 85)).toBe("#EAB308");
  });

  it("retorna azul para valores normais", () => {
    expect(getProgressColor(50, 80, 85)).toBe("#1485C8");
  });
});

describe("getTrendLabel", () => {
  it("retorna seta para cima", () => {
    expect(getTrendLabel(Trend.UP)).toBe("↑");
  });

  it("retorna seta para baixo", () => {
    expect(getTrendLabel(Trend.DOWN)).toBe("↓");
  });

  it("retorna seta para direita (estável)", () => {
    expect(getTrendLabel(Trend.STABLE)).toBe("→");
  });
});
