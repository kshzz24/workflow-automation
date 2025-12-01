"use client";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { AnthropicDialog, AnthropicFormTypeValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic-trigger";
import { fetchAnthropicRealtimeToken } from "./actions";

type AnthropicNodeData = {
  model?: any;
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeDataType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeDataType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const nodeData = props.data;

  const handleSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: AnthropicFormTypeValues) => {
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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={"/anthropic.svg"}
        status={nodeStatus}
        name={"Anthropic"}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
