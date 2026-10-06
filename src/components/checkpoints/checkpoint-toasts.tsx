"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export type CheckpointToast = {
  id: string;
  title: string;
  body: string;
};

const shown = new Set<string>();

export function CheckpointToasts({ items }: { items: readonly CheckpointToast[] }) {
  useEffect(() => {
    for (const item of items) {
      if (shown.has(item.id)) continue;
      shown.add(item.id);
      toast.success(item.title, { id: item.id, description: item.body });
    }
  }, [items]);

  return null;
}
