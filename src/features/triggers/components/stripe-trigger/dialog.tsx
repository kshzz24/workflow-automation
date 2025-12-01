"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;
  const copyToClipboard = async () => {
    try {
      navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (e) {
      console.log(e);
      toast.error("Failed to copy webhook URL");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your stripe dashboard to trigger this
            workflow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                type="text"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size={"icon"}
                onClick={copyToClipboard}
                variant={"outline"}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instruction</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your stripe dashboard</li>
              <li>Go to Developer {">"} Webhooks</li>
              <li>Click on Add endpoint</li>
              <li>Enter the webhook url provided above</li>
              <li>Save the endpoint</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0,5 rounded">
                  {"{{stripe.eventType}}"} - Event type
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0,5 rounded">
                  {"{{stripe.amount}}"} - Amount
                </code>
              </li>{" "}
              <li>
                <code className="bg-background px-1 py-0,5 rounded">
                  {"{{stripe.currency}}"} - Currency
                </code>
              </li>{" "}
              <li>
                <code className="bg-background px-1 py-0,5 rounded">
                  {"{{stripe.customerId}}"} - Customer ID
                </code>
              </li>
              <li>
                <code className="bg-background px-1 py-0,5 rounded">
                  {"{{json stripe}}"} - Full Event data as JSON
                </code>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
