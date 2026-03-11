import HeaderBar from "@/components/layout/HeaderBar";
import { MachineState } from "@/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Layout/HeaderBar",
  component: HeaderBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    machineState: {
      control: "select",
      options: Object.values(MachineState),
    },
  },
} satisfies Meta<typeof HeaderBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Conectado: Story = {
  args: {
    machineState: MachineState.RUNNING,
    isConnected: true,
  },
};

export const Desconectado: Story = {
  args: {
    machineState: MachineState.ERROR,
    isConnected: false,
  },
};

export const EmManutencao: Story = {
  name: "Em Manutenção",
  args: {
    machineState: MachineState.MAINTENANCE,
    isConnected: true,
  },
};
