import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export function RollingNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  let order = 0;

  return (
    <span className={cn("rolling-number", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="rolling-number-track">
        {Array.from(value, (character, index) => {
          if (!/\d/.test(character)) return <span key={index}>{character}</span>;
          const style = { "--digit": character, "--order": order++ } as CSSProperties;
          return (
            <span key={index} className="rolling-digit" style={style}>
              <span className="rolling-digit-final">{character}</span>
              <span className="rolling-digit-strip">
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
