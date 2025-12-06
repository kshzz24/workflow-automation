import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import ky from "ky";
import { slackTriggerChannel } from "@/inngest/channels/slack-trigger";

Handlebars.registerHelper("json", function (context) {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  context,
  nodeId,
  step,

  publish,
}) => {
  await publish(
    slackTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  if (!data.variableName) {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }
  if (!data.webhookUrl) {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Webhook URL is required");
  }
  if (!data.content) {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Content is required");
  }

  try {
    const result = await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content,
        },
      });

      if (!data.variableName) {
        await publish(
          slackTriggerChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Variable name is required");
      }
      if (!data.webhookUrl) {
        await publish(
          slackTriggerChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Webhook URL is required");
      }
      if (!data.content) {
        await publish(
          slackTriggerChannel().status({
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
      slackTriggerChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
