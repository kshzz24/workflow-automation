"use client";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import type { Node, NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo } from "react";
// import { WorkflowNode } from "@/components/workflow-node";
// import { BaseHandle } from "@/components/react-flow/base-handle";
// import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";

type HttpRequestNodeData = {
  endpoint?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  [key: string]: unknown;
  body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;
export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} :${nodeData.endpoint}`
    : "Not Configured";
  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        name={nodeData?.endpoint || "HTTP Request"}
        description={description}
        onSettings={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
