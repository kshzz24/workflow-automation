"use server";

import { geminiTriggerChannel } from "@/inngest/channels/gemini-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type GeminiToken = Realtime.Token<
  typeof geminiTriggerChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
