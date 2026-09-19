import type { Formats } from "next-intl";

export const formats = {
  dateTime: {
    day: { day: "numeric", month: "short" },
    date: { day: "numeric", month: "long" },
    monthYear: { month: "long", year: "numeric" },
    weekday: { weekday: "long", day: "numeric", month: "long" },
    time: { hour: "2-digit", minute: "2-digit" },
  },
} satisfies Formats;
