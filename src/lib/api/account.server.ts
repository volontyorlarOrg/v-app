import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import { meSchema } from "@/lib/api/schemas";

export const getMe = cache(function getMe() {
  return authed("/me", { schema: meSchema });
});
