"use client";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { GeminiDialog, GeminiFormTypeValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGeminiRealtimeToken } from "./actions";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini-trigger";

type GeminiNodeData = {
  model?: any;
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

type GeminiNodeDataType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeDataType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const nodeData = props.data;

  const handleSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: GeminiFormTypeValues) => {
    setNodes((nodes) => {
      return nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      });
    });
    setDialogOpen(false);
  };

  const description = nodeData?.userPrompt
    ? `${nodeData.model || "gemini-1.5-flash"}:${nodeData.userPrompt.slice(
        0,
        50
      )}...`
    : "Not Configured";

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={"/gemini.svg"}
        status={nodeStatus}
        name={"Gemini"}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
