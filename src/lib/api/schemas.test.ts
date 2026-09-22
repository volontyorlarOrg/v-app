import { describe, expect, it } from "vitest";

import {
  applicationDetailSchema,
  applicationListSchema,
  authMethodsSchema,
  connectionOutcomeSchema,
  historySchema,
  leaderboardSchema,
  meSchema,
  mergeApprovalSchema,
  mergeRequestListSchema,
  mergeRequestSchema,
  mergeResolutionSchema,
  notificationListSchema,
  opportunityDetailSchema,
  opportunityListSchema,
  profileSchema,
  publicProfileSchema,
  recordSchema,
  savedListSchema,
  usernameSummarySchema,
} from "@/lib/api/schemas";

const organization = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Volontyorlar",
  slug: "volontyorlar",
  logoUrl: null,
  verified: true,
};

const summary = {
  id: "20000000-0000-4000-8000-000000000001",
  slug: "community-library-day",
  title: "Community library day",
  summary: "Help at a library.",
  organization,
  region: "tashkent-city",
  city: undefined,
  format: "onsite",
  status: "open",
  startsAt: "2026-09-20T05:00:00.000Z",
  endsAt: undefined,
  applicationDeadline: "2026-09-15T18:00:00.000Z",
  imageUrl: undefined,
  capacity: 20,
  spotsRemaining: 19,
};

describe("opportunity schemas", () => {
  it("reads a list exactly as the backend serialises it", () => {
    const parsed = opportunityListSchema.parse({
      items: [summary],
      page: 1,
      pageSize: 12,
      total: 1,
    });
    expect(parsed.items[0]?.organization.logoUrl).toBeUndefined();
    expect(parsed.items[0]?.city).toBeUndefined();
    expect(parsed.items[0]?.acceptanceMode).toBe("manual");
    expect(parsed.items[0]).not.toHaveProperty("summary");
    expect(parsed.total).toBe(1);
  });

  it("renames the backend's detail fields to the interface vocabulary", () => {
    const parsed = opportunityDetailSchema.parse({
      ...summary,
      description: "Long text.",
      requirements: ["Be 16+"],
      locationName: null,
      questions: [
        {
          id: "q1",
          prompt: "Why?",
          helpText: null,
          type: "single_select",
          required: true,
          maxLength: undefined,
          options: [{ value: "a", label: "A" }, { value: "b" }],
        },
      ],
      sourcedByYvc: true,
    });
    expect(parsed.sourcedByTeam).toBe(true);
    expect("sourcedByYvc" in parsed).toBe(false);
    expect(parsed.questions[0]?.helpText).toBeUndefined();
    expect(parsed.questions[0]?.options).toEqual([
      { value: "a", label: "A" },
      { value: "b", label: "b" },
    ]);
  });

  it("rejects a region the interface does not know", () => {
    expect(
      opportunityListSchema.safeParse({
        items: [{ ...summary, region: "atlantis" }],
        total: 1,
      }).success,
    ).toBe(false);
  });
});

describe("application schemas", () => {
  it("keeps summary dates optional and reads answers of any shape", () => {
    const parsed = applicationDetailSchema.parse({
      id: "30000000-0000-4000-8000-000000000001",
      status: "submitted",
      opportunity: summary,
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z",
      submittedAt: "2026-09-02T10:00:00.000Z",
      answers: [
        { questionId: "q1", value: "text" },
        { questionId: "q2", value: ["a", "b"], prompt: "Pick", type: "multi_select" },
        { questionId: null, value: 5 },
      ],
      profileSnapshot: {
        fullName: "Dilnoza",
        region: "tashkent-city",
        school: "",
        phone: "",
        telegram: "d",
      },
      reviewerNote: undefined,
    });
    expect(parsed.reviewedAt).toBeUndefined();
    expect(parsed.answers.map((answer) => answer.value)).toEqual([
      "text",
      ["a", "b"],
      "",
    ]);
    expect(parsed.answers[1]?.prompt).toBe("Pick");
    expect(parsed.profileSnapshot?.fullName).toBe("Dilnoza");
  });

  it("reads the list envelope", () => {
    const parsed = applicationListSchema.parse({
      items: [
        {
          id: "a",
          status: "draft",
          opportunity: summary,
          createdAt: "2026-09-01T10:00:00.000Z",
          updatedAt: "2026-09-01T10:00:00.000Z",
        },
      ],
      total: 1,
    });
    expect(parsed.items[0]?.status).toBe("draft");
  });
});

describe("account schemas", () => {
  it("reads the profile with a null region", () => {
    const parsed = profileSchema.parse({
      fullName: "Dilnoza Karimova",
      bio: "",
      school: "Lyceum",
      gradeYear: "2",
      region: null,
      city: "",
      languages: ["uz"],
      phone: "",
      phoneVerified: false,
      telegram: "dilnoza",
      instagram: "dilnoza.codes",
      linkedin: "https://www.linkedin.com/in/dilnoza-k",
      links: [],
      updatedAt: "2026-09-01T10:00:00.000Z",
    });
    expect(parsed.region).toBeNull();
  });

  it("reads the complete public profile contract", () => {
    const parsed = publicProfileSchema.parse({
      displayName: "Dilnoza Karimova",
      username: "dilnoza_k",
      avatarUrl: "https://cdn.example/dilnoza.jpg",
      bio: "Volunteer and student.",
      region: "tashkent-city",
      city: "Tashkent",
      school: "Academic Lyceum",
      gradeYear: "2",
      languages: ["uz", "ru", "en"],
      phone: "+998901234567",
      telegram: "dilnoza_k",
      instagram: "dilnoza.codes",
      linkedin: "https://www.linkedin.com/in/dilnoza-k",
      links: ["https://portfolio.example/dilnoza"],
      joinedAt: "2026-09-01T10:00:00.000Z",
      level: "active",
      xp: 240,
      stats: { attendedEvents: 5, confirmedHours: 18 },
    });
    expect(parsed.phone).toBe("+998901234567");
    expect(parsed.instagram).toBe("dilnoza.codes");
    expect(parsed.links).toEqual(["https://portfolio.example/dilnoza"]);
  });

  it("reads /me and ignores the fields it does not use", () => {
    const parsed = meSchema.parse({
      id: "u1",
      displayName: null,
      roles: ["volunteer"],
      createdAt: "2026-09-01T10:00:00.000Z",
      username: "dilnoza_k",
      usernameSource: "generated",
      usernameEditable: true,
      telegramIdentity: { username: null, linkedAt: "2026-09-01T10:00:00.000Z" },
      preferences: { userId: "u1", notifyTelegram: true, createdAt: "x" },
    });
    expect(parsed.displayName).toBeUndefined();
    expect(parsed.telegramIdentity?.username).toBeUndefined();
  });
});

describe("record and notification schemas", () => {
  it("reads the record, the history and the saved list", () => {
    expect(
      recordSchema.parse({
        counts: {
          attended: 5,
          acceptedResolved: 6,
          acceptedUnconfirmed: 1,
          standoutReviews: false,
        },
        level: "active",
        hours: undefined,
        hoursVerified: true,
      }).hours,
    ).toBeUndefined();
    expect(
      historySchema.parse({
        items: [
          {
            id: "h1",
            opportunityTitle: "Read-aloud day",
            organization: "Reading Corners",
            eventDate: "2026-06-16T04:00:00.000Z",
            outcome: "attended",
            hours: 3,
          },
        ],
        total: 1,
      }).items[0]?.outcome,
    ).toBe("attended");
    expect(savedListSchema.parse({ items: [summary], total: 1 }).items).toHaveLength(1);
  });

  it("turns the backend's readAt into an unread flag", () => {
    const parsed = notificationListSchema.parse({
      items: [
        {
          id: "n1",
          kind: "application.submitted",
          title: "Application received",
          body: "",
          data: null,
          readAt: null,
          createdAt: "2026-09-01T10:00:00.000Z",
          userId: "u1",
        },
        {
          id: "n2",
          kind: "application.accepted",
          title: "Accepted",
          body: "See you there.",
          readAt: "2026-09-02T10:00:00.000Z",
          createdAt: "2026-09-01T11:00:00.000Z",
        },
      ],
      unread: 1,
    });
    expect(parsed.items.map((item) => item.unread)).toEqual([true, false]);
    expect(parsed.items[0]?.at).toBe("2026-09-01T10:00:00.000Z");
  });
});

const account = {
  id: "40000000-0000-4000-8000-000000000001",
  authMethods: { telegram: true, google: true, password: true },
};

const username = {
  username: "dilnoza_k",
  usernameSource: "telegram" as const,
  usernameEditable: true,
};

const pendingRequest = {
  id: "50000000-0000-4000-8000-000000000001",
  status: "pending",
  direction: "incoming",
  requestedVia: "google",
  createdAt: "2026-09-09T08:00:00.000Z",
  expiresAt: "2026-09-10T08:00:00.000Z",
  counterparty: {
    displayName: "Bekzod Rustamov",
    authMethods: { telegram: true, google: false, password: false },
  },
};

describe("the account schema", () => {
  it("reads the email and every sign-in method the backend reports", () => {
    const parsed = meSchema.parse({
      id: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      ...username,
      email: "dilnoza@example.org",
      emailVerified: true,
      telegramIdentity: { username: "dilnoza_k" },
      authMethods: { telegram: true, google: false, password: true },
    });

    expect(parsed.email).toBe("dilnoza@example.org");
    expect(parsed.emailVerified).toBe(true);
    expect(parsed.authMethods).toEqual({
      telegram: true,
      google: false,
      password: true,
    });
    expect(parsed.telegramIdentity?.username).toBe("dilnoza_k");
  });

  it("refuses an auth-methods object that leaves a provider out", () => {
    expect(authMethodsSchema.safeParse({ google: true }).success).toBe(false);
    expect(
      authMethodsSchema.safeParse({ telegram: true, google: false, password: false })
        .success,
    ).toBe(true);
  });

  it("reads the older identity shape as a connected Telegram method", () => {
    const parsed = meSchema.parse({
      id: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      ...username,
      telegramIdentity: { username: "dilnoza_k" },
    });

    expect(parsed.authMethods).toEqual({
      telegram: true,
      google: false,
      password: false,
    });
  });

  it("reads the leaderboard handle and where it came from", () => {
    const parsed = meSchema.parse({
      id: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      username: "dilnoza_k",
      usernameSource: "telegram",
      usernameEditable: true,
    });

    expect(parsed.username).toBe("dilnoza_k");
    expect(parsed.usernameSource).toBe("telegram");
  });

  it("requires every account to carry its username contract", () => {
    expect(
      meSchema.safeParse({
        id: "u1",
        createdAt: "2026-01-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("refuses a handle the backend should never have stored", () => {
    for (const username of ["Dilnoza", "no", "with space", "dash-ed"]) {
      expect(
        meSchema.safeParse({
          id: "u1",
          createdAt: "2026-01-01T00:00:00.000Z",
          username,
          usernameSource: "custom",
          usernameEditable: true,
        }).success,
        username,
      ).toBe(false);
    }
  });

  it("refuses a source outside the three the backend defines", () => {
    expect(
      meSchema.safeParse({
        id: "u1",
        createdAt: "2026-01-01T00:00:00.000Z",
        username: "dilnoza_k",
        usernameSource: "imported",
        usernameEditable: true,
      }).success,
    ).toBe(false);
  });

  it("refuses an account with no id", () => {
    expect(meSchema.safeParse({ createdAt: "2026-01-01T00:00:00.000Z" }).success).toBe(
      false,
    );
  });
});

describe("the leaderboard schema", () => {
  const entry = {
    rank: 1,
    displayName: "Dilnoza Karimova",
    username: "dilnoza_k",
    avatarUrl: null,
    profileVisible: true,
    xp: 1200,
    isCurrentUser: true,
  };
  const scoring = {
    attendedEventXp: 50,
    confirmedHourXp: 10,
    rounding: "nearest-total" as const,
  };
  const board = {
    items: [entry],
    viewer: {
      rank: 1,
      displayName: "Dilnoza Karimova",
      username: "dilnoza_k",
      avatarUrl: null,
      profileVisible: true,
      xp: 1200,
    },
    page: 1,
    pageSize: 25,
    total: 1,
    scoring,
  };

  it("reads a page exactly as the backend serialises it", () => {
    const parsed = leaderboardSchema.parse({
      items: [
        { ...entry, isCurrentUser: false },
        {
          rank: 2,
          displayName: "Bekzod Rustamov",
          username: "bekzod_r",
          avatarUrl: null,
          profileVisible: true,
          xp: 0,
          isCurrentUser: true,
        },
      ],
      page: 2,
      pageSize: 25,
      total: 143,
      viewer: {
        rank: 57,
        displayName: "Bekzod Rustamov",
        username: "bekzod_r",
        avatarUrl: null,
        profileVisible: true,
        xp: 0,
      },
      scoring,
    });

    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[1]?.isCurrentUser).toBe(true);
    expect(parsed.items[1]?.xp).toBe(0);
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(25);
    expect(parsed.total).toBe(143);
    expect(parsed.viewer.rank).toBe(57);
    expect(parsed.scoring).toEqual(scoring);
  });

  it("accepts the documented public display name and refuses private row fields", () => {
    expect(
      leaderboardSchema.safeParse({
        ...board,
        items: [{ ...entry, displayName: "Dilnoza" }],
      }).success,
    ).toBe(true);
    expect(
      leaderboardSchema.safeParse({
        ...board,
        items: [{ ...entry, id: "private-user-id" }],
      }).success,
    ).toBe(false);
  });

  it("refuses a rank or an experience total that cannot be true", () => {
    for (const broken of [
      { ...entry, rank: 0 },
      { ...entry, rank: 1.5 },
      { ...entry, xp: -1 },
      { ...entry, xp: 12.5 },
    ]) {
      expect(
        leaderboardSchema.safeParse({ ...board, items: [broken] }).success,
        JSON.stringify(broken),
      ).toBe(false);
    }
  });

  it("refuses a page whose total is missing", () => {
    expect(leaderboardSchema.safeParse({ items: [entry] }).success).toBe(false);
  });
});

describe("the username mutation schema", () => {
  it("requires the backend username summary", () => {
    expect(usernameSummarySchema.parse(username)).toEqual(username);
    expect(
      usernameSummarySchema.safeParse({
        username: "dilnoza_k",
        usernameSource: "telegram",
      }).success,
    ).toBe(false);
  });
});

describe("connection outcomes", () => {
  it("accepts a direct link", () => {
    const parsed = connectionOutcomeSchema.parse({ outcome: "linked", account });
    expect(parsed.outcome).toBe("linked");
    expect(parsed.outcome === "linked" && parsed.account.id).toBe(account.id);
  });

  it("accepts an identity that was already linked", () => {
    const parsed = connectionOutcomeSchema.parse({ outcome: "alreadyLinked", account });
    expect(parsed.outcome).toBe("alreadyLinked");
  });

  it("accepts an outcome that needs the other account to approve", () => {
    const parsed = connectionOutcomeSchema.parse({
      outcome: "approvalRequired",
      mergeRequest: { ...pendingRequest, direction: "outgoing" },
    });
    expect(parsed.outcome === "approvalRequired" && parsed.mergeRequest.status).toBe(
      "pending",
    );
  });

  it("refuses an unknown outcome, a linked outcome with no account, and an approval with no request", () => {
    expect(connectionOutcomeSchema.safeParse({ outcome: "merged" }).success).toBe(
      false,
    );
    expect(connectionOutcomeSchema.safeParse({ outcome: "linked" }).success).toBe(
      false,
    );
    expect(
      connectionOutcomeSchema.safeParse({ outcome: "approvalRequired", account })
        .success,
    ).toBe(false);
  });
});

describe("merge requests", () => {
  it("reads a request in both directions, with the account on the other side", () => {
    for (const direction of ["incoming", "outgoing"] as const) {
      const parsed = mergeRequestSchema.parse({ ...pendingRequest, direction });
      expect(parsed.direction).toBe(direction);
      expect(parsed.expiresAt).toBe(pendingRequest.expiresAt);
      expect(parsed.requestedVia).toBe("google");
      expect(parsed.counterparty.displayName).toBe("Bekzod Rustamov");
      expect(parsed.counterparty.authMethods.telegram).toBe(true);
    }
  });

  it("reads the list as the two sides the backend separates", () => {
    const parsed = mergeRequestListSchema.parse({
      incoming: [pendingRequest],
      outgoing: [{ ...pendingRequest, id: "out-1", direction: "outgoing" }],
    });
    expect(parsed.incoming.map((item) => item.id)).toEqual([pendingRequest.id]);
    expect(parsed.outgoing.map((item) => item.id)).toEqual(["out-1"]);
  });

  it("refuses a list that is missing a side", () => {
    expect(mergeRequestListSchema.safeParse({ incoming: [] }).success).toBe(false);
    expect(mergeRequestListSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it("refuses an unknown status, direction, provider or missing counterparty", () => {
    expect(
      mergeRequestSchema.safeParse({ ...pendingRequest, status: "merged" }).success,
    ).toBe(false);
    expect(
      mergeRequestSchema.safeParse({ ...pendingRequest, direction: "sideways" })
        .success,
    ).toBe(false);
    expect(
      mergeRequestSchema.safeParse({ ...pendingRequest, requestedVia: "apple" })
        .success,
    ).toBe(false);
    const withoutCounterparty = { ...pendingRequest, counterparty: undefined };
    expect(mergeRequestSchema.safeParse(withoutCounterparty).success).toBe(false);
  });

  it("reads what a rejection and a cancellation return", () => {
    const parsed = mergeResolutionSchema.parse({
      request: {
        ...pendingRequest,
        status: "rejected",
        decidedAt: "2026-09-09T09:00:00.000Z",
      },
    });
    expect(parsed.request.status).toBe("rejected");
    expect(mergeResolutionSchema.safeParse({}).success).toBe(false);
  });

  it("reads an approval with the session the backend issued", () => {
    const parsed = mergeApprovalSchema.parse({
      outcome: "merged",
      request: { ...pendingRequest, status: "completed" },
      session: {
        userId: "u1",
        accessToken: "access",
        refreshToken: "refresh",
        accessTokenExpiresAt: 1_800_000_000,
      },
    });

    expect(parsed.session.accessToken).toBe("access");
    expect(parsed.request.status).toBe("completed");
  });

  it("refuses an approval that carries no session to write", () => {
    expect(
      mergeApprovalSchema.safeParse({
        outcome: "merged",
        request: { ...pendingRequest, status: "completed" },
      }).success,
    ).toBe(false);
    expect(
      mergeApprovalSchema.safeParse({
        outcome: "merged",
        request: { ...pendingRequest, status: "completed" },
        session: { userId: "u1" },
      }).success,
    ).toBe(false);
  });
});
