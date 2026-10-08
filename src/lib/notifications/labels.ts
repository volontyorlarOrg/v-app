export function notificationLabels(t: (key: string) => string) {
  return {
    close: t("notifications.close"),
    unread: t("notifications.unreadLabel"),
    allRead: t("notifications.allRead"),
    marking: t("notifications.marking"),
    readError: t("notifications.readError"),
    emptyBody: t("notifications.emptyBody"),
    new: t("notifications.new"),
    viewDetails: t("notifications.viewDetails"),
  };
}

export type NotificationLabels = ReturnType<typeof notificationLabels>;
