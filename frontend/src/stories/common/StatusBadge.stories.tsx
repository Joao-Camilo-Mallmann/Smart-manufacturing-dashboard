import StatusBadge from "@/components/common/StatusBadge";
import { MachineState } from "@/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Common/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: Object.values(MachineState),
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ligada: Story = {
  args: { state: MachineState.RUNNING },
};

export const Desligada: Story = {
  args: { state: MachineState.STOPPED },
};

export const Manutencao: Story = {
  args: { state: MachineState.MAINTENANCE },
};

export const Erro: Story = {
  args: { state: MachineState.ERROR },
};
