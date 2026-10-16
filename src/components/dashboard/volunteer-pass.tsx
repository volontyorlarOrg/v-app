import Image from "next/image";

import { BrandIcon, BrandWordmark } from "@/components/brand/logo";
import { LEVEL_ICONS } from "@/components/levels/level-glyph";
import type { Level } from "@/lib/record/levels";

export type PassHolder = {
  name: string;
  initials: string;
  avatarUrl?: string;
  role: string;
  level: { key: Level; name: string } | null;
};

export function VolunteerPass({ holder }: { holder: PassHolder }) {
  const LevelIcon = holder.level ? LEVEL_ICONS[holder.level.key] : null;

  return (
    <div className="volunteer-pass">
      <span className="volunteer-pass-strap" />
      <span className="volunteer-pass-clip" />
      <div className="volunteer-pass-card">
        <div className="volunteer-pass-brand">
          <BrandIcon className="volunteer-pass-icon" />
          <BrandWordmark className="volunteer-pass-wordmark text-knockout" />
        </div>
        <div className="volunteer-pass-photo">
          {holder.avatarUrl ? (
            <Image
              unoptimized
              src={holder.avatarUrl}
              alt=""
              width={192}
              height={192}
              className="size-full object-cover"
            />
          ) : (
            <span className="volunteer-pass-initials">{holder.initials}</span>
          )}
        </div>
        <p className="volunteer-pass-name">{holder.name}</p>
        <p className="volunteer-pass-role">{holder.role}</p>
        {holder.level && LevelIcon ? (
          <p className="volunteer-pass-level">
            <LevelIcon />
            {holder.level.name}
          </p>
        ) : null}
      </div>
    </div>
  );
}
