// ============================================================
// MetricsChart.tsx — Gráfico histórico Chart.js (estilo STW)
// Card premium com gradientes, crosshair e tooltip avançado
// Eixo X com timestamps reais (HH:mm:ss) — JS nativo
// ============================================================

import { formatTimestamp } from "@/utils/formatters";
import type { MetricHistory } from "@/types/index";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import type { ChartArea } from "chart.js";
import { Activity, BarChart3 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ── Plugin: Crosshair vertical no hover ──
const crosshairPlugin = {
  id: "crosshair",
  afterDraw(chart: ChartJS) {
    const tooltip = chart.tooltip;
    if (!tooltip || !tooltip.getActiveElements().length) return;

    const ctx = chart.ctx;
    const x = tooltip.caretX;
    const topY = chart.scales.y.top;
    const bottomY = chart.scales.y.bottom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = document.documentElement.classList.contains("dark")
      ? "rgba(148, 163, 184, 0.25)"
      : "rgba(0, 80, 138, 0.15)";
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  },
};

ChartJS.register(crosshairPlugin);

// ── Helper: gradiente vertical ──
function createGradient(
  ctx: CanvasRenderingContext2D,
  area: ChartArea,
  colorStart: string,
  colorEnd: string,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

// ── Plugin: aplica gradientes nos backgrounds dos datasets ──
const gradientPlugin = {
  id: "gradientBg",
  beforeDraw(chart: ChartJS) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const isDark = document.documentElement.classList.contains("dark");

    // Dataset 0 = Temperatura (vermelho)
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].backgroundColor = createGradient(
        ctx,
        chartArea,
        isDark ? "rgba(239, 68, 68, 0.20)" : "rgba(239, 68, 68, 0.15)",
        isDark ? "rgba(239, 68, 68, 0.00)" : "rgba(239, 68, 68, 0.01)",
      );
    }
    // Dataset 1 = RPM (azul)
    if (chart.data.datasets[1]) {
      chart.data.datasets[1].backgroundColor = createGradient(
        ctx,
        chartArea,
        isDark ? "rgba(20, 133, 200, 0.20)" : "rgba(20, 133, 200, 0.15)",
        isDark ? "rgba(20, 133, 200, 0.00)" : "rgba(20, 133, 200, 0.01)",
      );
    }
  },
};

ChartJS.register(gradientPlugin);

interface Props {
  history: MetricHistory[];
}

export default function MetricsChart({ history }: Props) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Atualizar quando tema muda
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (chartRef.current) chartRef.current.update();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = document.documentElement.classList.contains("dark");

  // Labels com timestamp real
  const labels = useMemo(
    () =>
      history.map((h, idx) => {
        if (idx % 10 === 0 || idx === history.length - 1) {
          return formatTimestamp(h.timestamp);
        }
        return "";
      }),
    [history],
  );



  const data = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: history.map((h) => h.temperature),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.10)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#FFFFFF",
        pointHoverBorderColor: "#EF4444",
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
        yAxisID: "y",
      },
      {
        label: "RPM",
        data: history.map((h) => h.rpm),
        borderColor: "#1485C8",
        backgroundColor: "rgba(20, 133, 200, 0.10)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#FFFFFF",
        pointHoverBorderColor: "#1485C8",
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
        yAxisID: "y1",
      },
    ],
  };

  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.06)"
    : "rgba(0, 80, 138, 0.05)";
  const textColor = isDark ? "#94A3B8" : "#718096";
  const axisLineColor = isDark
    ? "rgba(148, 163, 184, 0.12)"
    : "rgba(0, 80, 138, 0.08)";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: "rectRounded",
          pointStyleWidth: 16,
          padding: 20,
          font: { size: 12, family: "Montserrat", weight: 600 as const },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark
          ? "rgba(15, 26, 46, 0.95)"
          : "rgba(255, 255, 255, 0.97)",
        titleColor: isDark ? "#E2E8F0" : "#1A202C",
        bodyColor: isDark ? "#CBD5E1" : "#4A5568",
        borderColor: isDark ? "rgba(30, 58, 95, 0.6)" : "rgba(188, 212, 230, 0.8)",
        borderWidth: 1,
        cornerRadius: 14,
        padding: { top: 12, bottom: 12, left: 16, right: 16 },
        titleFont: { family: "Montserrat", weight: 700 as const, size: 13 },
        bodyFont: { family: "Montserrat", size: 12 },
        titleMarginBottom: 8,
        bodySpacing: 6,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const idx = items[0]?.dataIndex;
            if (idx != null && history[idx]) {
              return `⏱ ${formatTimestamp(history[idx].timestamp)}`;
            }
            return "";
          },
          label: (item: TooltipItem<"line">) => {
            const icon = item.datasetIndex === 0 ? "🌡" : "⚙️";
            const unit = item.datasetIndex === 0 ? "°C" : "rpm";
            const val = item.parsed.y ?? 0;
            return ` ${icon}  ${item.dataset.label}: ${val.toFixed(1)} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        border: { color: axisLineColor },
        grid: { color: gridColor, drawTicks: false },
        ticks: {
          color: textColor,
          font: { size: 10, family: "Montserrat", weight: 500 as const },
          maxRotation: 35,
          autoSkip: true,
          maxTicksLimit: 10,
          padding: 8,
        },
        title: {
          display: true,
          text: "Horário",
          color: isDark ? "#64748B" : "#A0AEC0",
          font: { size: 11, family: "Montserrat", weight: 600 as const },
          padding: { top: 8 },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        border: { dash: [4, 4], color: axisLineColor },
        title: {
          display: true,
          text: "Temperatura (°C)",
          color: "#EF4444",
          font: { size: 11, family: "Montserrat", weight: 600 as const },
          padding: { bottom: 8 },
        },
        grid: { color: gridColor, drawTicks: false },
        ticks: {
          color: textColor,
          font: { size: 10, family: "Montserrat" },
          padding: 8,
          callback: (value: number | string) => `${value}°`,
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        border: { dash: [4, 4], color: axisLineColor },
        title: {
          display: true,
          text: "RPM",
          color: "#1485C8",
          font: { size: 11, family: "Montserrat", weight: 600 as const },
          padding: { bottom: 8 },
        },
        grid: { drawOnChartArea: false, drawTicks: false },
        ticks: {
          color: textColor,
          font: { size: 10, family: "Montserrat" },
          padding: 8,
        },
        min: 0,
        max: 2000,
      },
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart" as const,
    },
  };

  // Subtítulo: intervalo de tempo visível
  const timeRange = useMemo(() => {
    if (history.length < 2) return "";
    const first = formatTimestamp(history[0].timestamp);
    const last = formatTimestamp(history[history.length - 1].timestamp);
    return `${first} — ${last}`;
  }, [history]);

  return (
    <div id="metrics-chart" className="card-stw animate-fade-in p-5 sm:p-7">
      {/* Header do card */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-stw-primary/10 text-stw-primary">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base text-content tracking-tight">
              Gráfico de Métricas
            </h2>
            {timeRange && (
              <p className="text-xs text-content-muted mt-0.5 font-medium">
                {timeRange}
              </p>
            )}
          </div>
        </div>
        {/* Badge de pontos */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stw-primary/8 text-stw-primary">
          <Activity size={13} />
          <span className="text-xs font-semibold">{history.length} pontos</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80 sm:h-96">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}

