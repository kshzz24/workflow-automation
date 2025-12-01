"use server";

import { openAiTriggerChannel } from "@/inngest/channels/open-ai-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type OpenAiToken = Realtime.Token<
  typeof openAiTriggerChannel,
  ["status"]
>;

export async function fetchOpenAiRealtimeToken(): Promise<OpenAiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: openAiTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
