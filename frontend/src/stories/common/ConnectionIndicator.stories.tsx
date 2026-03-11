import ConnectionIndicator from "@/components/common/ConnectionIndicator";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Common/ConnectionIndicator",
  component: ConnectionIndicator,
  tags: ["autodocs"],
} satisfies Meta<typeof ConnectionIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Conectado: Story = {
  args: { isConnected: true },
};

export const Desconectado: Story = {
  args: { isConnected: false },
};
