import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import {
  acknowledgementSchema,
  notificationListSchema,
  type NotificationList,
} from "@/lib/api/schemas";

export const listNotifications = cache(function listNotifications(): Promise<NotificationList> {
  return authed("/notifications", { schema: notificationListSchema });
});

export function markAllNotificationsRead() {
  return authed("/notifications/read-all", {
    method: "POST",
    schema: acknowledgementSchema,
  });
}
