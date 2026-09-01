import "server-only";

import { z } from "zod";
import { authedApi } from "@/lib/api/client.server";
import { requireSession } from "@/lib/auth/session.server";
import { recordCountsSchema } from "./levels";

/**
 * Volunteer record reads.
 *
 * The backend supplies raw counts; the *level* is derived here through
 * `features/record/levels.ts`. That keeps a single formula rather than letting
 * a server-computed label and a client-computed one drift apart — and it means
 * a threshold change is one edit, not a coordinated deploy.
 *
 * `hours` is carried through but explicitly marked unverified until the
 * backend states how hours are confirmed.
 */

export const volunteerRecordSchema = z.object({
  counts: recordCountsSchema,
  /** Recorded hours. Meaning is not yet defined — see docs/features. */
  hours: z.number().nonnegative().optional(),
  hoursVerified: z.boolean().default(false),
});

export type VolunteerRecord = z.infer<typeof volunteerRecordSchema>;

export const ATTENDANCE_OUTCOMES = [
  "attended",
  "excused",
  "cancelled",
  "awaiting_confirmation",
] as const;

export const participationEntrySchema = z.object({
  id: z.string().min(1),
  opportunityTitle: z.string().min(1),
  organizationName: z.string().min(1),
  eventDate: z.iso.datetime({ offset: true }),
  outcome: z.enum(ATTENDANCE_OUTCOMES),
});

export type ParticipationEntry = z.infer<typeof participationEntrySchema>;

const historySchema = z.object({ items: z.array(participationEntrySchema) });

export async function getMyRecord(): Promise<VolunteerRecord> {
  const session = await requireSession();

  return authedApi("/record", session.accessToken, {
    schema: volunteerRecordSchema,
  });
}

export async function getMyParticipationHistory() {
  const session = await requireSession();

  return authedApi("/record/history", session.accessToken, {
    schema: historySchema,
  });
}
