import { ViewTransition, type ReactNode } from "react";

export function SharedElement({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  if (!ViewTransition) return children;

  return (
    <ViewTransition name={name} share="shared-element" default="none">
      {children}
    </ViewTransition>
  );
}
