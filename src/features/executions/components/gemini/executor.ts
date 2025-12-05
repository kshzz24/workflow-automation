import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { geminiTriggerChannel } from "@/inngest/channels/gemini-trigger";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", function (context) {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);
  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(
    geminiTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.model) {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Model is required");
  }
  if (!data.variableName) {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }

  if (!data.credentialId) {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential is required");
  }

  if (!data.userPrompt) {
    await publish(
      geminiTriggerChannel().status({
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
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError("Credential not found");
  }
  // const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

  const google = createGoogleGenerativeAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.0-flash"),
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
      geminiTriggerChannel().status({
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
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
