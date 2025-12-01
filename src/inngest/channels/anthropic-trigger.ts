import { channel, topic } from "@inngest/realtime";

export const ANTHROPIC_CHANNEL_NAME = "anthropic-execution";

export const anthropicTriggerChannel = channel(ANTHROPIC_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
