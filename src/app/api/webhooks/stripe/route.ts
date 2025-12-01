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
    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      eventData: body.data,
      livemode: body.livemode,
      request: body.request,
      raw: body?.data?.object,
    };
    // trigger an inngest job

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });

    return NextResponse.json({
      message: "Stripe event submitted successfully",
    });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json(
      { error: "Failed to process stripe event" },
      { status: 500 }
    );
  }
}
