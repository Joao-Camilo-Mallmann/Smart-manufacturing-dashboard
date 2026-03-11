import ThemeToggle from "@/components/common/ThemeToggle";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Common/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-stw-dark p-6 rounded-2xl inline-block">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
