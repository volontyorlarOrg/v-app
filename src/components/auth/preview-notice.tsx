import { PreviewNote } from "@/components/app/preview-note";

export function PreviewNotice({ chip, body }: { chip: string; body: string }) {
  return (
    <PreviewNote
      chip={chip}
      body={body}
      className="enter-rise mt-6 [--enter-delay:600ms]"
    />
  );
}
