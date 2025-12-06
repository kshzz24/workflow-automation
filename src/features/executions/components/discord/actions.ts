"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { discordTriggerChannel } from "@/inngest/channels/discord-trigger";

export type DiscordToken = Realtime.Token<
  typeof discordTriggerChannel,
  ["status"]
>;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: discordTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
