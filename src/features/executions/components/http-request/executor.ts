import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  nodeId,
  step,
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError("Endpoint is required");
  }

  if (!data.variableName) {
    throw new NonRetriableError("Variable name is required");
  }

  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint;
    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }
    const response = await ky(endpoint!, options);
    const contentType = response.headers.get("content-type");
    let responseData;
    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }

    return {
      ...context,
      ...responsePayload,
    };
  });

  return result;
};
