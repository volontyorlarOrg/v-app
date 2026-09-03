import type { LinkedIdentities, Preferences } from "@/lib/account/types";
import type { ActivityEntry } from "@/lib/activity/types";
import type { ApplicationDetail } from "@/lib/applications/status";
import { tashkentInstant } from "@/lib/datetime";
import type { Notification } from "@/lib/notifications/types";
import type { OpportunityDetail } from "@/lib/opportunities/types";
import type { VolunteerProfile } from "@/lib/profile/completion";
import type { ParticipationEntry, VolunteerRecord } from "@/lib/record/levels";

import { SAMPLE_ORGANIZATIONS, sampleOpportunities } from "./opportunities";

export type SampleVolunteer = {
  firstName: string;
  fullName: string;
  initials: string;
  profile: VolunteerProfile;
  record: VolunteerRecord;
  applications: ApplicationDetail[];
  savedSlugs: string[];
  saved: OpportunityDetail[];
  closingSoon: OpportunityDetail[];
  activity: ActivityEntry[];
  history: ParticipationEntry[];
  notifications: Notification[];
  preferences: Preferences;
  identities: LinkedIdentities;
};

const SAVED_SLUGS = ["riverbank-clean-up", "school-science-fair-mentors"];
const CLOSING_SOON_SLUGS = [
  "remote-translation-support",
  "city-marathon-water-stations",
  "winter-book-drive",
];

export function sampleVolunteer(now: Date = new Date()): SampleVolunteer {
  const at = (days: number, hour: number) => tashkentInstant(now, days, hour);
  const catalogue = sampleOpportunities(now);
  const opportunity = (slug: string): OpportunityDetail => {
    const found = catalogue.find((candidate) => candidate.slug === slug);
    if (!found) throw new Error(`Unknown sample opportunity: ${slug}`);
    return found;
  };

  return {
    firstName: "Dilnoza",
    fullName: "Dilnoza Karimova",
    initials: "DK",
    profile: {
      fullName: "Dilnoza Karimova",
      bio: "",
      region: "tashkent-city",
      school: "Academic lyceum No. 2",
      gradeYear: "2",
      city: "Tashkent",
      languages: ["uz", "ru", "en"],
      skills: ["translation", "reading aloud", "first aid basics"],
      phone: "",
      telegram: "dilnoza_k",
      links: [],
    },
    record: {
      counts: {
        attended: 5,
        acceptedResolved: 6,
        acceptedUnconfirmed: 1,
        standoutReviews: false,
      },
      hours: 22,
      hoursVerified: false,
    },
    applications: [
      {
        id: "app-book-drive",
        status: "draft",
        opportunity: opportunity("winter-book-drive"),
        createdAt: at(-1, 20),
        updatedAt: at(-1, 20),
        answers: [
          {
            prompt: opportunity("winter-book-drive").questions[0]!.prompt,
            value: {
              uz: "Mahallamizdagi kitob burchagi bolalarga kerak, men uni toʻldirishga yordam bermoqchiman.",
              ru: "В нашей махалле детям нужен читальный уголок, и я хочу помочь его наполнить.",
              en: "The reading corner in my neighbourhood matters to the children there, and I want to help fill it.",
            },
          },
        ],
      },
      {
        id: "app-digital-tutors",
        status: "under_review",
        opportunity: opportunity("digital-skills-tutors"),
        createdAt: at(-3, 19),
        updatedAt: at(-2, 11),
        submittedAt: at(-3, 19),
        reviewedAt: at(-2, 11),
        answers: [
          {
            prompt: opportunity("digital-skills-tutors").questions[0]!.prompt,
            value: {
              uz: "Ha, barcha olti haftaga vaqt ajrata olaman.",
              ru: "Да, могу все шесть недель.",
              en: "Yes, I can commit to all six weeks.",
            },
          },
          {
            prompt: opportunity("digital-skills-tutors").questions[1]!.prompt,
            value: {
              uz: "Buvimga video qoʻngʻiroq qilishni oʻrgatdim: avval bitta tugmani koʻrsatdim, keyin u oʻzi takrorladi.",
              ru: "Я научила бабушку видеозвонкам: сначала показала одну кнопку, потом она повторила сама.",
              en: "I taught my grandmother video calls: I showed one button first, then she repeated it herself.",
            },
          },
        ],
      },
      {
        id: "app-read-aloud",
        status: "accepted",
        opportunity: opportunity("read-aloud-day"),
        createdAt: at(-9, 18),
        updatedAt: at(-4, 15),
        submittedAt: at(-9, 18),
        reviewedAt: at(-6, 10),
        decidedAt: at(-4, 15),
        answers: [],
      },
      {
        id: "app-tree-planting",
        status: "accepted",
        opportunity: opportunity("district-park-planting"),
        createdAt: at(-6, 21),
        updatedAt: at(-4, 9),
        submittedAt: at(-6, 21),
        reviewedAt: at(-5, 12),
        decidedAt: at(-4, 9),
        answers: [],
      },
      {
        id: "app-science-fair",
        status: "rejected",
        opportunity: opportunity("school-science-fair-mentors"),
        createdAt: at(-14, 17),
        updatedAt: at(-12, 10),
        submittedAt: at(-14, 17),
        reviewedAt: at(-13, 9),
        decidedAt: at(-12, 10),
        answers: [
          {
            prompt: opportunity("school-science-fair-mentors").questions[0]!.prompt,
            value: {
              uz: "Loyihani oʻz soʻzlarim bilan qayta aytib berishni soʻrayman va qayerda tushunmaganimni aytaman.",
              ru: "Попрошу пересказать проект своими словами и скажу, где именно не поняла.",
              en: "I would ask them to retell the project in their own words and say exactly where I lost the thread.",
            },
          },
        ],
      },
    ],
    savedSlugs: SAVED_SLUGS,
    saved: SAVED_SLUGS.map(opportunity),
    closingSoon: CLOSING_SOON_SLUGS.map(opportunity),
    activity: [
      {
        id: "act-confirmed",
        kind: "attendanceConfirmed",
        at: at(-2, 14),
        subject: {
          uz: "Dam olish kuni oziq-ovqat toʻplamlarini joylash",
          ru: "Упаковка продуктовых наборов в выходной",
          en: "Weekend food parcel packing",
        },
      },
      {
        id: "act-submitted",
        kind: "applicationSubmitted",
        at: at(-3, 19),
        subject: opportunity("digital-skills-tutors").title,
      },
      {
        id: "act-accepted",
        kind: "applicationAccepted",
        at: at(-4, 9),
        subject: opportunity("district-park-planting").title,
      },
      {
        id: "act-saved",
        kind: "opportunitySaved",
        at: at(-6, 22),
        subject: opportunity("riverbank-clean-up").title,
      },
      {
        id: "act-level",
        kind: "levelReached",
        at: at(-15, 12),
        subject: { uz: "Faol", ru: "Активный", en: "Active" },
      },
    ],
    history: [
      {
        id: "hist-parcels",
        opportunityTitle: {
          uz: "Dam olish kuni oziq-ovqat toʻplamlarini joylash",
          ru: "Упаковка продуктовых наборов в выходной",
          en: "Weekend food parcel packing",
        },
        organization: SAMPLE_ORGANIZATIONS.aid.name,
        eventDate: at(-3, 10),
        outcome: "attended",
        hours: 4,
      },
      {
        id: "hist-autumn-cleanup",
        opportunityTitle: {
          uz: "Kuzgi bogʻ tozalash",
          ru: "Осенняя уборка парка",
          en: "Autumn park clean-up",
        },
        organization: SAMPLE_ORGANIZATIONS.green.name,
        eventDate: at(-9, 9),
        outcome: "attended",
        hours: 3,
      },
      {
        id: "hist-inventory",
        opportunityTitle: {
          uz: "Kutubxona javonlari inventarizatsiyasi",
          ru: "Инвентаризация библиотечных полок",
          en: "Library shelf inventory",
        },
        organization: SAMPLE_ORGANIZATIONS.reading.name,
        eventDate: at(-16, 14),
        outcome: "attended",
        hours: 5,
      },
      {
        id: "hist-open-day",
        opportunityTitle: {
          uz: "Maktab ochiq eshiklar kuni yordamchilari",
          ru: "Помощники на дне открытых дверей школы",
          en: "School open day helpers",
        },
        organization: SAMPLE_ORGANIZATIONS.forum.name,
        eventDate: at(-23, 9),
        outcome: "awaiting_confirmation",
        hours: 4,
      },
      {
        id: "hist-city-run",
        opportunityTitle: {
          uz: "Shahar yugurishida suv punkti",
          ru: "Пункт воды на городском забеге",
          en: "City run water station",
        },
        organization: SAMPLE_ORGANIZATIONS.sport.name,
        eventDate: at(-30, 7),
        outcome: "attended",
        hours: 3,
      },
      {
        id: "hist-fair",
        opportunityTitle: {
          uz: "Xayriya yarmarkasini tayyorlash",
          ru: "Подготовка благотворительной ярмарки",
          en: "Charity fair setup",
        },
        organization: SAMPLE_ORGANIZATIONS.aid.name,
        eventDate: at(-37, 15),
        outcome: "excused",
      },
      {
        id: "hist-corner",
        opportunityTitle: {
          uz: "Kitob burchagi ochilishi",
          ru: "Открытие читального уголка",
          en: "Reading corner opening",
        },
        organization: SAMPLE_ORGANIZATIONS.reading.name,
        eventDate: at(-45, 11),
        outcome: "attended",
        hours: 7,
      },
    ],
    notifications: [
      {
        id: "ntf-confirmed",
        kind: "attendanceConfirmed",
        at: at(-2, 14),
        unread: true,
        subject: {
          uz: "Dam olish kuni oziq-ovqat toʻplamlarini joylash",
          ru: "Упаковка продуктовых наборов в выходной",
          en: "Weekend food parcel packing",
        },
      },
      {
        id: "ntf-deadline",
        kind: "deadlineSoon",
        at: at(-1, 9),
        unread: true,
        subject: opportunity("remote-translation-support").title,
      },
      {
        id: "ntf-review",
        kind: "applicationUnderReview",
        at: at(-2, 11),
        unread: true,
        subject: opportunity("digital-skills-tutors").title,
      },
      {
        id: "ntf-accepted",
        kind: "applicationAccepted",
        at: at(-4, 9),
        unread: false,
        subject: opportunity("district-park-planting").title,
      },
      {
        id: "ntf-new",
        kind: "newOpportunity",
        at: at(-5, 16),
        unread: false,
        subject: opportunity("city-marathon-water-stations").title,
      },
    ],
    preferences: {
      notifyTelegram: true,
      notifyEmail: false,
      remindDeadlines: true,
      notifyDecisions: true,
      profileToOrganisers: true,
      levelPublic: false,
    },
    identities: {
      telegram: { username: "dilnoza_k" },
      google: null,
      email: { address: "dilnoza@example.org", verified: true },
    },
  };
}

export function sampleApplication(
  id: string,
  now: Date = new Date(),
): ApplicationDetail | null {
  return (
    sampleVolunteer(now).applications.find((application) => application.id === id) ??
    null
  );
}
