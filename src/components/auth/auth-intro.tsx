import { SplitWords } from "@/components/motion/scene";

export function AuthIntro({ title }: { title: string }) {
  return (
    <div className="hero-copy">
      <h1 className="page-display enter-words [--enter-delay:120ms]">
        <SplitWords text={title} />
      </h1>
    </div>
  );
}
