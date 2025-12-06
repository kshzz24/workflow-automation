import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { discordTriggerChannel } from "@/inngest/channels/discord-trigger";
import ky from "ky";

Handlebars.registerHelper("json", function (context) {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  context,
  nodeId,
  step,

  publish,
}) => {
  await publish(
    discordTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  if (!data.variableName) {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }
  if (!data.webhookUrl) {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Webhook URL is required");
  }
  if (!data.content) {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Content is required");
  }

  try {
    const result = await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      if (!data.variableName) {
        await publish(
          discordTriggerChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Variable name is required");
      }
      if (!data.webhookUrl) {
        await publish(
          discordTriggerChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Webhook URL is required");
      }
      if (!data.content) {
        await publish(
          discordTriggerChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Content is required");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
