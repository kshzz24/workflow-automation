import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

export const ExecutionWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();

  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId });
  };

  return (
    <Button
      size={"lg"}
      disabled={executeWorkflow.isPending}
      onClick={handleExecute}
    >
      Execute Workflow
      <FlaskConicalIcon className="size-4" />
    </Button>
  );
};
