import { FlaskConical } from "lucide-react";
import { Surface } from "@/components/ui/surface";

export function SampleDataNotice({ message }: { message: string }) {
  return (
    <Surface
      tone="structure"
      padding="sm"
      role="note"
      className="flex items-start gap-3"
    >
      <FlaskConical
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-blue-deep"
      />
      <p className="text-xs leading-6 text-blue-deep">{message}</p>
    </Surface>
  );
}
