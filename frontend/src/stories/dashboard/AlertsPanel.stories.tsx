import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { AlertLevel, type Alert } from "@/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const now = new Date().toISOString();
const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();

const sampleAlerts: Alert[] = [
  {
    id: 1,
    level: AlertLevel.CRITICAL,
    message: "Temperatura acima do limite crítico (105°C)",
    component: "Sensor T-01",
    timestamp: now,
    acknowledged: false,
  },
  {
    id: 2,
    level: AlertLevel.WARNING,
    message: "RPM abaixo do esperado (800 rpm)",
    component: "Motor M-01",
    timestamp: fiveMinAgo,
    acknowledged: false,
  },
  {
    id: 3,
    level: AlertLevel.INFO,
    message: "Manutenção preventiva agendada",
    component: "Sistema",
    timestamp: tenMinAgo,
    acknowledged: true,
  },
];

const meta = {
  title: "Dashboard/AlertsPanel",
  component: AlertsPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof AlertsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComAlertas: Story = {
  args: { alerts: sampleAlerts },
};

export const SemAlertas: Story = {
  args: { alerts: [] },
};

export const ApenasCriticos: Story = {
  name: "Apenas Críticos",
  args: {
    alerts: sampleAlerts.filter((a) => a.level === "CRITICAL"),
  },
};
