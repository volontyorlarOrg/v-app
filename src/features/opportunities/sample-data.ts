import type { OpportunityDetail } from "./schemas";

/**
 * SAMPLE DATA — NOT REAL OPPORTUNITIES.
 *
 * There is no YVC backend yet. Rather than ship an application that renders an
 * empty page and cannot be tested, this module provides a small illustrative
 * set behind the `YVC_ENABLE_SAMPLE_DATA` flag (off by default).
 *
 * Rules that keep this honest:
 *   - Every organisation name below is fictional. Real YVC partners
 *     (O'ZLIDEP, the Youth Affairs Agency, the Uzbekistan Volunteer
 *     Association, the Republican Children's Library) are deliberately NOT
 *     used, because presenting a fabricated event as theirs would misrepresent
 *     a real organisation.
 *   - The UI renders a visible sample-data notice whenever this source is
 *     active. See `SampleDataNotice`.
 *   - Dates are generated relative to now, so the deadline states stay
 *     exercisable without anyone editing fixtures.
 *
 * When a real API exists, delete this file and the flag with it.
 */

function daysFromNow(days: number, hour = 18): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function sampleOpportunities(): OpportunityDetail[] {
  return [
    {
      id: "smp-001",
      slug: "winter-book-drive-tashkent",
      title: "Winter book drive for neighbourhood reading corners",
      summary:
        "Sort, label, and deliver donated books to eight reading corners across the city over one weekend.",
      description:
        "Volunteers meet on Saturday morning to sort donated books by age group, label them, and pack them for delivery. On Sunday, teams of three deliver the boxes to reading corners and help set up the shelves. No prior experience is needed — a short briefing covers everything. Lunch is provided on both days.",
      organization: {
        id: "org-sample-1",
        name: "Sample Community Reading Initiative",
        verified: true,
      },
      region: "tashkent-city",
      city: "Tashkent",
      locationName: "Central meeting point, Chilonzor",
      format: "onsite",
      status: "open",
      startsAt: daysFromNow(12, 9),
      endsAt: daysFromNow(13, 17),
      applicationDeadline: daysFromNow(7),
      capacity: 40,
      spotsRemaining: 14,
      sourcedByYvc: true,
      requirements: [
        "Available both Saturday and Sunday",
        "Comfortable lifting boxes up to 10 kg",
        "Age 16 or older",
      ],
      questions: [
        {
          id: "q-motivation",
          prompt: "Why do you want to join this book drive?",
          helpText: "A few honest sentences are better than a long essay.",
          type: "long_text",
          required: true,
          maxLength: 800,
        },
        {
          id: "q-availability",
          prompt: "Which days can you attend?",
          type: "multi_select",
          required: true,
          options: [
            { value: "saturday", label: "Saturday" },
            { value: "sunday", label: "Sunday" },
          ],
        },
      ],
    },
    {
      id: "smp-002",
      slug: "river-cleanup-samarkand",
      title: "Riverbank clean-up and waste audit",
      summary:
        "A one-day clean-up along the riverbank, with a simple waste count that feeds a local recycling proposal.",
      description:
        "Teams walk a marked 2 km stretch, collect litter, and record what they find on a one-page tally sheet. The counts go into a proposal for additional bins. Gloves, bags, and tally sheets are provided. Wear closed shoes.",
      organization: {
        id: "org-sample-2",
        name: "Sample Green Corridor Group",
        verified: false,
      },
      region: "samarkand",
      city: "Samarkand",
      locationName: "Riverside park entrance",
      format: "onsite",
      status: "open",
      startsAt: daysFromNow(5, 8),
      applicationDeadline: daysFromNow(2),
      capacity: 60,
      spotsRemaining: 31,
      sourcedByYvc: true,
      requirements: ["Closed shoes", "Age 14 or older with guardian consent"],
      questions: [
        {
          id: "q-experience",
          prompt: "Have you taken part in a clean-up before? Tell us briefly.",
          type: "short_text",
          required: false,
          maxLength: 200,
        },
      ],
    },
    {
      id: "smp-003",
      slug: "remote-translation-support",
      title: "Remote translation support for volunteer guides",
      summary:
        "Translate short volunteer guides between Uzbek, Russian, and English. Roughly four hours over two weeks.",
      description:
        "We have a set of one-page guides for new volunteers that exist only in Uzbek. Translators pick up one guide at a time, translate it, and a second volunteer reviews it. Work is asynchronous — there are no scheduled calls.",
      organization: {
        id: "org-sample-3",
        name: "Sample Volunteer Support Desk",
        verified: true,
      },
      region: "tashkent-city",
      format: "remote",
      status: "open",
      startsAt: daysFromNow(3, 9),
      endsAt: daysFromNow(17, 18),
      applicationDeadline: daysFromNow(1),
      sourcedByYvc: false,
      requirements: [
        "Fluent in at least two of Uzbek, Russian, English",
        "About four hours across two weeks",
      ],
      questions: [
        {
          id: "q-languages",
          prompt: "Which language pairs can you translate between?",
          type: "short_text",
          required: true,
          maxLength: 200,
        },
        {
          id: "q-sample",
          prompt:
            "Translate this sentence into your strongest second language: \"Volunteers should arrive fifteen minutes early.\"",
          helpText: "This is a short check, not a test with a right answer.",
          type: "long_text",
          required: true,
          maxLength: 400,
        },
      ],
    },
    {
      id: "smp-004",
      slug: "school-science-fair-mentors",
      title: "Mentors for a regional school science fair",
      summary:
        "Sit with school teams for two afternoons and help them prepare a clear five-minute presentation.",
      description:
        "Each mentor is paired with two school teams. You will not judge and you do not need a science background — the job is to listen to their explanation and help them make it clearer. A briefing pack is sent a week before.",
      organization: {
        id: "org-sample-4",
        name: "Sample Regional Education Forum",
        verified: true,
      },
      region: "fergana",
      city: "Fergana",
      locationName: "Regional education centre",
      format: "hybrid",
      status: "open",
      startsAt: daysFromNow(25, 13),
      endsAt: daysFromNow(26, 18),
      applicationDeadline: daysFromNow(18),
      capacity: 20,
      spotsRemaining: 20,
      sourcedByYvc: true,
      requirements: ["Available two consecutive afternoons", "Age 18 or older"],
      questions: [
        {
          id: "q-approach",
          prompt:
            "A team explains their project and you do not understand it. What do you do?",
          type: "long_text",
          required: true,
          maxLength: 600,
        },
      ],
    },
    {
      id: "smp-005",
      slug: "winter-clothing-sort-bukhara",
      title: "Winter clothing sorting day",
      summary:
        "Sort and size donated winter clothing for distribution. One afternoon, indoors.",
      description:
        "Donated coats, boots, and knitwear arrive unsorted. Volunteers check condition, group items by size, and pack them into labelled crates. Tea and snacks provided.",
      organization: {
        id: "org-sample-5",
        name: "Sample Neighbourhood Aid Point",
        verified: false,
      },
      region: "bukhara",
      city: "Bukhara",
      format: "onsite",
      status: "full",
      startsAt: daysFromNow(9, 14),
      applicationDeadline: daysFromNow(4),
      capacity: 25,
      spotsRemaining: 0,
      sourcedByYvc: true,
      requirements: ["Age 15 or older"],
      questions: [],
    },
    {
      id: "smp-006",
      slug: "digital-skills-tutors-namangan",
      title: "Digital skills tutors for older residents",
      summary:
        "Weekly one-hour sessions teaching phone and internet basics at a community centre.",
      description:
        "A six-week commitment, one hour per week. You will work with the same one or two people each week, covering messaging, video calls, and spotting scam messages. Lesson outlines are provided; you do not prepare material yourself.",
      organization: {
        id: "org-sample-6",
        name: "Sample Community Learning Centre",
        verified: true,
      },
      region: "namangan",
      city: "Namangan",
      locationName: "Community centre, second floor",
      format: "onsite",
      status: "open",
      startsAt: daysFromNow(20, 16),
      endsAt: daysFromNow(62, 17),
      applicationDeadline: daysFromNow(14),
      capacity: 12,
      spotsRemaining: 5,
      sourcedByYvc: false,
      requirements: [
        "Able to commit six consecutive weeks",
        "Patient, and comfortable explaining the same thing twice",
      ],
      questions: [
        {
          id: "q-commitment",
          prompt: "Can you commit to all six weeks? If not, which weeks work?",
          type: "short_text",
          required: true,
          maxLength: 300,
        },
        {
          id: "q-teaching",
          prompt: "Describe a time you explained something technical to someone.",
          type: "long_text",
          required: true,
          maxLength: 800,
        },
      ],
    },
    {
      id: "smp-007",
      slug: "archive-digitisation-closed",
      title: "Photo archive digitisation (closed)",
      summary:
        "Scanning and captioning a local photo archive. Applications for this round have closed.",
      description:
        "This entry exists so the closed state is visible in the interface. Applications closed and the team is full.",
      organization: {
        id: "org-sample-7",
        name: "Sample Local History Room",
        verified: false,
      },
      region: "khorezm",
      city: "Urgench",
      format: "onsite",
      status: "closed",
      startsAt: daysFromNow(-4, 10),
      applicationDeadline: daysFromNow(-11),
      sourcedByYvc: true,
      requirements: [],
      questions: [],
    },
  ];
}
