"use server";

import { anthropicTriggerChannel } from "@/inngest/channels/anthropic-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type AnthropicToken = Realtime.Token< 
  typeof anthropicTriggerChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: anthropicTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
