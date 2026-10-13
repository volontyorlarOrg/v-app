import { MapPinned } from "lucide-react";

export type RegionNoteLabels = {
  title: string;
  region: { term: string; text: string };
  hometownRegion: { term: string; text: string };
};

type RegionNoteKey =
  | "regionNote.title"
  | "regionNote.region"
  | "regionNote.hometownRegion"
  | "fields.region"
  | "fields.hometownRegion";

/** Builds the note from the `profile` messages, so its terms always match the field labels. */
export function regionNoteLabels(t: (key: RegionNoteKey) => string): RegionNoteLabels {
  return {
    title: t("regionNote.title"),
    region: { term: t("fields.region"), text: t("regionNote.region") },
    hometownRegion: {
      term: t("fields.hometownRegion"),
      text: t("regionNote.hometownRegion"),
    },
  };
}

export function RegionNote({ labels }: { labels: RegionNoteLabels }) {
  return (
    <aside
      role="note"
      aria-label={labels.title}
      className="rounded-lg border border-primary/50 bg-surface-soft px-4 py-3.5"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-primary-ink">
        <MapPinned aria-hidden="true" className="size-4 shrink-0" />
        {labels.title}
      </p>
      <dl className="mt-3 grid gap-3 text-sm leading-relaxed sm:grid-cols-2 sm:gap-5">
        {[labels.region, labels.hometownRegion].map((item) => (
          <div key={item.term}>
            <dt className="font-semibold text-ink">{item.term}</dt>
            <dd className="mt-0.5 text-ink-muted">{item.text}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
