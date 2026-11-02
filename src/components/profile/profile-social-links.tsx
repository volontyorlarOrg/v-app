import { createLucideIcon, Send, type LucideIcon } from "lucide-react";

import type {
  ProfileSocialLink,
  ProfileSocialPlatform,
} from "@/lib/profile/social-links";

const Instagram = createLucideIcon("instagram", [
  [
    "rect",
    { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "frame" },
  ],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "lens" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "dot" }],
]);

const Linkedin = createLucideIcon("linkedin", [
  [
    "path",
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z",
      key: "people",
    },
  ],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "stem" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "dot" }],
]);

const ICONS: Record<ProfileSocialPlatform, LucideIcon> = {
  telegram: Send,
  instagram: Instagram,
  linkedin: Linkedin,
};

export function ProfileSocialLinks({
  links,
  label,
  platformLabels,
}: {
  links: readonly ProfileSocialLink[];
  label: string;
  platformLabels: Record<ProfileSocialPlatform, string>;
}) {
  if (links.length === 0) return null;

  return (
    <ul
      aria-label={label}
      className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:items-start"
    >
      {links.map((link) => {
        const Icon = ICONS[link.platform];
        return (
          <li key={link.platform} className="max-w-full min-w-0">
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`${platformLabels[link.platform]}: @${link.handle}`}
              className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg text-sm font-semibold text-primary-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">@{link.handle}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
