import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { authed } from "@/lib/api/session.server";

import { legalStateSchema } from "./schemas";

export const getLegalState = cache(() =>
  authed("/me/legal", { schema: legalStateSchema }),
);

export async function ensureLegalConsent() {
  const state = await getLegalState();
  if (!state.accepted) redirect("/consent");
}
