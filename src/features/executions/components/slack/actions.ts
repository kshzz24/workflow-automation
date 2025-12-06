"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { slackTriggerChannel } from "@/inngest/channels/slack-trigger";

export type SlackToken = Realtime.Token<
  typeof slackTriggerChannel,
  ["status"]
>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: slackTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
