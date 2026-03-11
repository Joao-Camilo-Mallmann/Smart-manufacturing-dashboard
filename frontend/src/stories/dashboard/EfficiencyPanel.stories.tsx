import EfficiencyPanel from "@/components/dashboard/EfficiencyPanel";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Dashboard/EfficiencyPanel",
  component: EfficiencyPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof EfficiencyPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alto: Story = {
  args: {
    oee: {
      overall: 92.5,
      availability: 96.0,
      performance: 94.2,
      quality: 98.1,
    },
  },
};

export const Medio: Story = {
  name: "Médio",
  args: {
    oee: {
      overall: 72.0,
      availability: 80.0,
      performance: 85.0,
      quality: 90.0,
    },
  },
};

export const Baixo: Story = {
  args: {
    oee: {
      overall: 45.0,
      availability: 55.0,
      performance: 60.0,
      quality: 70.0,
    },
  },
};
