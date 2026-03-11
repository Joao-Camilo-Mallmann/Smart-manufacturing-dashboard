import MetricCard from "@/components/dashboard/MetricCard";
import { Trend } from "@/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock, Gauge, Thermometer, Zap } from "lucide-react";

const meta = {
  title: "Dashboard/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  argTypes: {
    trend: {
      control: "select",
      options: Object.values(Trend),
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Temperatura: Story = {
  args: {
    id: "card-temp",
    title: "Temperatura",
    value: 78.5,
    unit: "°C",
    trend: Trend.UP,
    icon: <Thermometer size={20} />,
    maxValue: 120,
    thresholdWarning: 80,
    thresholdCritical: 100,
  },
};

export const RPM: Story = {
  args: {
    id: "card-rpm",
    title: "RPM",
    value: 1200,
    unit: "rpm",
    trend: Trend.DOWN,
    icon: <Gauge size={20} />,
    maxValue: 1500,
  },
};

export const TempoOperacao: Story = {
  name: "Tempo de Operação",
  args: {
    id: "card-uptime",
    title: "Tempo de Operação",
    value: "5h 23m",
    unit: "",
    trend: Trend.STABLE,
    icon: <Clock size={20} />,
  },
};

export const Eficiencia: Story = {
  name: "Eficiência",
  args: {
    id: "card-efficiency",
    title: "Eficiência",
    value: 92.3,
    unit: "%",
    trend: Trend.UP,
    icon: <Zap size={20} />,
    maxValue: 100,
  },
};

export const ValorCritico: Story = {
  name: "Valor Crítico",
  args: {
    id: "card-crit",
    title: "Temperatura",
    value: 105,
    unit: "°C",
    trend: Trend.UP,
    icon: <Thermometer size={20} />,
    maxValue: 120,
    thresholdWarning: 80,
    thresholdCritical: 100,
  },
};
