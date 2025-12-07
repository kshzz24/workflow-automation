import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { anthropicTriggerChannel } from "@/inngest/channels/anthropic-trigger";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", function (context) {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  nodeId,
  step,
  userId,
  publish,
}) => {
  await publish(
    anthropicTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.model) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Model is required");
  }
  if (!data.credentialId) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential is required");
  }

  if (!data.variableName) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }

  if (!data.userPrompt) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("User name is required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = data.userPrompt
    ? Handlebars.compile(data.userPrompt)(context)
    : "";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential not found");
  }

  const credentialValue = credential.value;

  const anthropic = createAnthropic({
    apiKey: decrypt(credentialValue),
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-3-5-haiku-20241022"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
