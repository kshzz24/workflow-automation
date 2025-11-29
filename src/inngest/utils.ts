import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";
import { inngest } from "./client";

export const topoSort = (nodes: Node[], connections: Connection[]) => {
  if (connections.length === 0) return nodes;

  const edges: [string, string][] = connections.map((connection) => {
    return [connection.fromNodeId, connection.toNodeId];
  });

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow has a cycle");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  await inngest.send({
    name: "workflows/execute.workflow",
    data,
  });
};
