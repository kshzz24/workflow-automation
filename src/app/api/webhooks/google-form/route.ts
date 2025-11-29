import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };
    // trigger an inngest job

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      },
    });

    return NextResponse.json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Google form webhook error", error);
    return NextResponse.json(
      { error: "Failed to process form submission" },
      { status: 500 }
    );
  }
}
