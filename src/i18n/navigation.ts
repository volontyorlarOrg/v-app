import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives.
 *
 * Use these instead of `next/link` and `next/navigation` anywhere inside
 * `app/[locale]`. They keep the active locale on the URL, which is what makes
 * the language switcher route-preserving and shared links stable.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
