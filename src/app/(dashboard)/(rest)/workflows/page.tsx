import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import React, { Suspense } from "react";
import {
  WorkflowsContainers,
  WorkflowsList,
} from "@/features/workflows/components/workflows";

const Page = async () => {
  await requireAuth();
  prefetchWorkflows();
  return (
    <WorkflowsContainers>
      <HydrateClient>
        <ErrorBoundary fallback={<p>Error</p>}>
          <Suspense fallback={<p>Loading</p>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainers>
  );
};

export default Page;
