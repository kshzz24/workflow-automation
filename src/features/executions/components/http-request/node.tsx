"use client";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { HttpRequestDialog, HttpRequestFormTypeValues } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  variableName?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;
export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = "initial";
  const nodeData = props.data;

  const handleSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: HttpRequestFormTypeValues) => {
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

  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} :${nodeData.endpoint}`
    : "Not Configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        status={nodeStatus}
        name={nodeData?.endpoint || "HTTP Request"}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
