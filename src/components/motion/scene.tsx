import {
  Fragment,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type SceneVariant = "rise" | "stagger" | "wipe" | "group";
export type SceneTrigger = "enter" | "full";

type SceneProps<T extends ElementType> = {
  as?: T;
  variant?: SceneVariant;
  trigger?: SceneTrigger;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Scene<T extends ElementType = "div">({
  as,
  variant = "rise",
  trigger = "enter",
  className,
  children,
  ...rest
}: SceneProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag data-scene={trigger} className={cn(`scene-${variant}`, className)} {...rest}>
      {children}
    </Tag>
  );
}

export function SplitWords({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      <span className="scene-word" style={{ "--i": index } as CSSProperties}>
        <span>{word}</span>
      </span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ));
}
