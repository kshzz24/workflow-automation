import { useQueryStates } from "nuqs";
import { WorkflowParams } from "../params";

export const useWorkflowParams = () => {
  return useQueryStates(WorkflowParams);
};
