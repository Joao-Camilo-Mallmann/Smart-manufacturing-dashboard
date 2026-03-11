import HeaderBar from "@/components/layout/HeaderBar";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Layout/HeaderBar",
  component: HeaderBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HeaderBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Conectado: Story = {
  args: {
    isConnected: true,
  },
};

export const Desconectado: Story = {
  args: {
    isConnected: false,
  },
};

export const EmManutencao: Story = {
  name: "Em Manutenção",
  args: {
    isConnected: true,
  },
};
