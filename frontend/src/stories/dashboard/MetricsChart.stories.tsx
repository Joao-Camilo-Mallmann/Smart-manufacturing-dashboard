import MetricsChart from "@/components/dashboard/MetricsChart";
import type { MetricHistory } from "@/types";
import { MachineState } from "@/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

// Gera dados fictícios para o gráfico
function generateHistory(count: number): MetricHistory[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 5000).toISOString(),
    temperature: 70 + Math.sin(i / 5) * 10 + Math.random() * 3,
    rpm: 1100 + Math.cos(i / 7) * 200 + Math.random() * 50,
    efficiency: 85 + Math.sin(i / 10) * 8 + Math.random() * 2,
    state: MachineState.RUNNING,
    oee_overall: 88,
    oee_availability: 95,
    oee_performance: 91,
    oee_quality: 97,
  }));
}

const meta = {
  title: "Dashboard/MetricsChart",
  component: MetricsChart,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { history: generateHistory(60) },
};

export const PoucosDados: Story = {
  name: "Poucos Dados",
  args: { history: generateHistory(10) },
};

export const MuitosDados: Story = {
  name: "Muitos Dados",
  args: { history: generateHistory(200) },
};
