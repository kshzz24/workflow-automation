import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { openAiTriggerChannel } from "@/inngest/channels/open-ai-trigger";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", function (context) {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type OpenAiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  context,
  nodeId,
  step,
  userId,
  publish,
}) => {
  await publish(
    openAiTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.model) {
    await publish(
      openAiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Model is required");
  }
  if (!data.credentialId) {
    await publish(
      openAiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential is required");
  }
  if (!data.variableName) {
    await publish(
      openAiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }

  if (!data.userPrompt) {
    await publish(
      openAiTriggerChannel().status({
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
        userId,
        id: data.credentialId,
      },
    });
  });

  if (!credential) {
    await publish(
      openAiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential not found");
  }

  const credentialValue = credential.value;

  const openAi = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openAi("gpt-4"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openAiTriggerChannel().status({
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
      openAiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
