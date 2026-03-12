import {
  formatMetric,
  formatTimestamp,
  formatUptime,
  timeAgo,
} from "@/utils/formatters";

describe("formatUptime", () => {
  it("formata horas decimais corretamente", () => {
    expect(formatUptime(5.5)).toBe("5h 30m");
    expect(formatUptime(0.25)).toBe("0h 15m");
    expect(formatUptime(1)).toBe("1h 0m");
  });

  it("retorna 0h 0m para valores inválidos", () => {
    expect(formatUptime(0)).toBe("0h 0m");
    expect(formatUptime(NaN)).toBe("0h 0m");
  });
});

describe("formatTimestamp", () => {
  it("formata timestamp ISO em hora local", () => {
    const result = formatTimestamp("2025-01-15T14:30:45.000Z");
    // Verifica formato HH:MM:SS (independente do fuso)
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it("retorna string original para input inválido", () => {
    expect(formatTimestamp("invalid")).toBe("invalid");
  });
});

describe("timeAgo", () => {
  it("retorna segundos atrás para timestamps recentes", () => {
    const now = new Date().toISOString();
    const result = timeAgo(now);
    expect(result).toMatch(/^\d+s atrás$/);
  });

  it("retorna string vazia para input inválido", () => {
    expect(timeAgo("invalid")).toBe("");
  });
});

describe("formatMetric", () => {
  it("formata número com 1 casa decimal por padrão", () => {
    expect(formatMetric(72.456)).toBe("72.5");
    expect(formatMetric(100)).toBe("100.0");
  });

  it("respeita o parâmetro de casas decimais", () => {
    expect(formatMetric(72.456, 2)).toBe("72.46");
  });

  it('retorna "0" para valores inválidos', () => {
    expect(formatMetric(NaN)).toBe("0");
  });
});
