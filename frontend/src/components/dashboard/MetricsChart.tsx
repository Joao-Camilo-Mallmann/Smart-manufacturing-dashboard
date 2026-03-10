// ============================================================
// MetricsChart.tsx — Gráfico histórico com Chart.js
// Exibe linhas de temperatura e RPM em tempo real.
// ============================================================

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
import { BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import type { MetricHistory } from "../../types";

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

interface Props {
  history: MetricHistory[];
}

export default function MetricsChart({ history }: Props) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Atualizar quando tema muda
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (chartRef.current) {
        chartRef.current.update();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const labels = history.map((_, idx) => {
    if (idx % 10 === 0) return `${idx}`;
    return "";
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: history.map((h) => h.temperature),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "RPM",
        data: history.map((h) => h.rpm),
        borderColor: "#1485C8",
        backgroundColor: "rgba(20, 133, 200, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        yAxisID: "y1",
      },
    ],
  };

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(0, 0, 0, 0.06)";
  const textColor = isDark ? "#94A3B8" : "#6B7280";

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
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        titleColor: isDark ? "#F1F5F9" : "#222222",
        bodyColor: isDark ? "#94A3B8" : "#6B7280",
        borderColor: isDark ? "#334155" : "#D9D9D9",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 10 } },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Temperatura (°C)",
          color: "#EF4444",
          font: { size: 11 },
        },
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 10 } },
        min: 0,
        max: 100,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "RPM",
          color: "#1485C8",
          font: { size: 11 },
        },
        grid: { drawOnChartArea: false },
        ticks: { color: textColor, font: { size: 10 } },
        min: 0,
        max: 2000,
      },
    },
    animation: {
      duration: 400,
    },
  };

  return (
    <div
      id="metrics-chart"
      className="animate-fade-in rounded-xl p-4 sm:p-6"
      style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-stw-primary" />
        <h2
          className="font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Gráfico de Métricas
        </h2>
      </div>
      <div style={{ height: "300px" }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}
