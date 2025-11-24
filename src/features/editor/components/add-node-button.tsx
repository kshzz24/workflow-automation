"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { memo } from "react";

export const AddNodeButton = memo(() => {
  return (
    <Button
      size={"icon"}
      onClick={() => {}}
      variant={"outline"}
      className="bg-background"
    >
      <PlusIcon />
    </Button>
  );
});

AddNodeButton.displayName = "AddNodeButton";
