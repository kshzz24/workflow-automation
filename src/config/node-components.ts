import { InitialNode } from "@/components/initial-node";
import { OpenAiNode } from "@/features/executions/components/open-ai/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTrigger } from "@/features/triggers/components/stripe-trigger/node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.STRIPE_TRIGGER]: StripeTrigger,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
