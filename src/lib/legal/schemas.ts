import { z } from "zod";

import { LEGAL_REQUEST_KINDS } from "./constants";

export const admissionSchema = z.object({
  token: z.string().min(32),
  expiresAt: z.string(),
});

export const receiptSchema = z.object({ id: z.string(), status: z.string() });

export const legalStateSchema = z.object({
  version: z.string(),
  accepted: z.boolean(),
  leaderboard: z.boolean(),
  publicProfile: z.boolean(),
});

export const legalRequestsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(LEGAL_REQUEST_KINDS),
      message: z.string(),
      status: z.enum(["open", "resolved", "cancelled"]),
      resolution: z.string().nullable(),
      createdAt: z.string(),
      resolvedAt: z.string().nullable(),
    }),
  ),
});

export type LegalState = z.infer<typeof legalStateSchema>;
export type LegalRequests = z.infer<typeof legalRequestsSchema>;
