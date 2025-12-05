"use client";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { OpenAiDialog, OpenAiFormTypeValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/open-ai-trigger";
import { fetchOpenAiRealtimeToken } from "./actions";

type OpenAiNodeData = {
  model?: any;
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

type OpenAiNodeDataType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeDataType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const nodeData = props.data;

  const handleSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: OpenAiFormTypeValues) => {
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
    ? `${nodeData.model || "gpt-4"}:${nodeData.userPrompt.slice(0, 50)}...`
    : "Not Configured";

  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={"/openai.svg"}
        status={nodeStatus}
        name={"OpenAI"}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";
