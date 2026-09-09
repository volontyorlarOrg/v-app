import { describe, expect, it } from "vitest";

import {
  MERGE_NOTIFICATION_KINDS,
  isMergeNotificationKind,
  mergeNotificationName,
} from "@/lib/notifications/types";

describe("merge notifications", () => {
  it("recognises every kind the backend sends about joining accounts", () => {
    for (const kind of MERGE_NOTIFICATION_KINDS) {
      expect(isMergeNotificationKind(kind), kind).toBe(true);
      expect(mergeNotificationName(kind), kind).toBe(kind.split(".").at(-1));
    }
  });

  it("recognises a kind it has no copy for yet without inventing one", () => {
    expect(mergeNotificationName("account.merge.reopened")).toBe("other");
    expect(mergeNotificationName("account.merge")).toBe("other");
  });

  it("leaves every other notification to the backend's own title", () => {
    for (const kind of ["application.accepted", "account.mergers", "", "merge"]) {
      expect(isMergeNotificationKind(kind), kind).toBe(false);
      expect(mergeNotificationName(kind), kind).toBeNull();
    }
  });
});
