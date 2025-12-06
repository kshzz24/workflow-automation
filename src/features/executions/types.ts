import { Realtime } from "@inngest/realtime";
import { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest>;
export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  context: WorkflowContext;
  nodeId: string;
  step: StepTools;
  publish: Realtime.PublishFn;
  userId: string;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;
