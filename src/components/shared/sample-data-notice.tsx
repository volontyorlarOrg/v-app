import { FlaskConical } from "lucide-react";
import { Surface } from "@/components/ui/surface";

/**
 * Shown whenever the app is serving built-in sample opportunities.
 *
 * This is not decorative. The handoff forbids presenting fabricated content as
 * real product data, and there is no YVC backend yet — so any deployment
 * running on sample data says so, on every page that shows it, in the user's
 * own language.
 *
 * It disappears on its own once `YVC_API_BASE_URL` is set, because the sample
 * source is then never selected.
 */
export function SampleDataNotice({ message }: { message: string }) {
  return (
    <Surface
      tone="quiet"
      padding="sm"
      role="note"
      className="flex items-start gap-3 border-amber/40 bg-amber/5"
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber" />
      <p className="text-xs leading-6 text-amber">{message}</p>
    </Surface>
  );
}
