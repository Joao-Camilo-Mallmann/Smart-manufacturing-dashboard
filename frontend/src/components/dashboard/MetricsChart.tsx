// ============================================================
// MetricsChart.tsx — Gráfico histórico Chart.js (estilo STW)
// Card super arredondado com gráfico de temperatura e RPM
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
        backgroundColor: "rgba(239, 68, 68, 0.06)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#EF4444",
        borderWidth: 2.5,
        yAxisID: "y",
      },
      {
        label: "RPM",
        data: history.map((h) => h.rpm),
        borderColor: "#1485C8",
        backgroundColor: "rgba(20, 133, 200, 0.06)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#1485C8",
        borderWidth: 2.5,
        yAxisID: "y1",
      },
    ],
  };

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.08)"
    : "rgba(0, 80, 138, 0.06)";
  const textColor = isDark ? "#94A3B8" : "#4A5568";

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
          padding: 24,
          font: { size: 12, family: "Montserrat", weight: 600 as const },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#0f1a2e" : "#FFFFFF",
        titleColor: isDark ? "#E2E8F0" : "#1A202C",
        bodyColor: isDark ? "#94A3B8" : "#4A5568",
        borderColor: isDark ? "#1e3a5f" : "#BCD4E6",
        borderWidth: 1,
        cornerRadius: 12,
        padding: 14,
        titleFont: { family: "Montserrat", weight: 600 as const },
        bodyFont: { family: "Montserrat" },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 10, family: "Montserrat" } },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Temperatura (°C)",
          color: "#EF4444",
          font: { size: 11, family: "Montserrat", weight: 600 as const },
        },
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 10, family: "Montserrat" } },
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
          font: { size: 11, family: "Montserrat", weight: 600 as const },
        },
        grid: { drawOnChartArea: false },
        ticks: { color: textColor, font: { size: 10, family: "Montserrat" } },
        min: 0,
        max: 2000,
      },
    },
    animation: {
      duration: 500,
    },
  };

  return (
    <div id="metrics-chart" className="card-stw animate-fade-in p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 rounded-xl bg-stw-primary/8 text-stw-primary">
          <BarChart3 size={18} />
        </div>
        <h2 className="font-bold text-base text-content tracking-tight">
          Gráfico de Métricas
        </h2>
      </div>
      <div className="h-75">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}
