import { BrandMark } from "@/components/brand/logo";
import { SplitWords } from "@/components/motion/scene";

export function AuthIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="hero-copy">
      <BrandMark className="enter-rise size-12 text-primary" />
      <h1 className="page-display enter-words mt-6 [--enter-delay:120ms]">
        <SplitWords text={title} />
      </h1>
      <p className="enter-rise mt-4 text-lead text-pretty text-ink-muted [--enter-delay:480ms]">
        {lead}
      </p>
    </div>
  );
}
