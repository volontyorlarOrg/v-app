import { createServer } from "node:http";

const PORT = Number(process.env.STUB_PORT ?? 3212);
const APP_URL = process.env.E2E_APP_URL ?? "http://127.0.0.1:3211";
const FAIL_PATHS = (process.env.STUB_FAIL_PATHS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const FAILING_SEARCH = "__fail__";
const SERVER_ERROR = { statusCode: 500, message: "Internal server error" };
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.STUB_ACCESS_TTL ?? 259_200);
const DAY = 86_400_000;
const START = Date.now();

function at(days, hour = 9) {
  const base = new Date(START);
  base.setUTCHours(hour - 5, 0, 0, 0);
  return new Date(base.getTime() + days * DAY).toISOString();
}

const organizations = {
  reading: {
    id: "org-reading",
    name: "Chilonzor Reading Corners",
    slug: "reading",
    logoUrl: null,
    verified: true,
  },
  green: {
    id: "org-green",
    name: "Green Corridor Group",
    slug: "green",
    logoUrl: null,
    verified: false,
  },
  desk: {
    id: "org-desk",
    name: "Volunteer Support Desk",
    slug: "desk",
    logoUrl: null,
    verified: true,
  },
  sport: {
    id: "org-sport",
    name: "City Sports Day Team",
    slug: "sport",
    logoUrl: null,
    verified: true,
  },
};

const opportunities = [
  {
    id: "opp-book-drive",
    slug: "winter-book-drive",
    title: "Winter book drive",
    description:
      "Sort donated books, label them and pack them for the reading corners.",
    requirements: ["Be 15 or older", "Free on the collection day"],
    organization: organizations.reading,
    region: "tashkent-city",
    city: "Tashkent",
    locationName: "Chilonzor library",
    format: "onsite",
    status: "open",
    startsAt: at(12, 10),
    endsAt: at(12, 14),
    applicationDeadline: at(5, 18),
    capacity: 20,
    estimatedTotalHours: 4,
    accepted: 4,
    questions: [
      {
        id: "q-why",
        prompt: "Why does this matter to you?",
        helpText: "Two or three sentences.",
        type: "long_text",
        required: true,
        maxLength: 600,
        options: null,
      },
    ],
    sourcedByYvc: true,
  },
  {
    id: "opp-riverbank",
    slug: "riverbank-clean-up",
    title: "Riverbank clean-up",
    description: "Gloves and bags are provided. Wear shoes you can get muddy.",
    requirements: [],
    organization: organizations.green,
    region: "samarkand",
    city: "Samarkand",
    locationName: null,
    format: "onsite",
    status: "open",
    startsAt: at(10, 8),
    endsAt: at(10, 12),
    applicationDeadline: at(2, 18),
    capacity: null,
    estimatedTotalHours: 4,
    accepted: 0,
    questions: [],
    sourcedByYvc: false,
  },
  {
    id: "opp-translation",
    slug: "remote-translation-support",
    title: "Remote translation support",
    description: "Work from home in your own time over two weeks.",
    requirements: ["Comfortable writing in two of the three languages"],
    organization: organizations.desk,
    region: "tashkent-region",
    city: null,
    locationName: null,
    format: "remote",
    status: "open",
    startsAt: at(14, 9),
    endsAt: null,
    applicationDeadline: at(7, 18),
    capacity: 10,
    estimatedTotalHours: 12,
    accepted: 2,
    questions: [
      {
        id: "q-pair",
        prompt: "Which language pair suits you best?",
        helpText: null,
        type: "single_select",
        required: true,
        maxLength: null,
        options: [
          { value: "uz-ru", label: "Uzbek and Russian" },
          { value: "uz-en", label: "Uzbek and English" },
          { value: "ru-en", label: "Russian and English" },
        ],
      },
      {
        id: "q-tools",
        prompt: "Which tools have you used?",
        helpText: null,
        type: "multi_select",
        required: false,
        maxLength: null,
        options: [
          { value: "docs", label: "Google Docs" },
          { value: "sheets", label: "Spreadsheets" },
        ],
      },
    ],
    sourcedByYvc: false,
  },
  {
    id: "opp-marathon",
    slug: "city-marathon-water-stations",
    title: "City marathon water stations",
    description: "Shifts of three hours. Breakfast provided.",
    requirements: ["Arrive by 6:30"],
    organization: organizations.sport,
    region: "tashkent-city",
    city: "Tashkent",
    locationName: "Navoiy Park",
    format: "onsite",
    status: "open",
    startsAt: at(3, 6),
    endsAt: at(3, 10),
    applicationDeadline: at(1, 18),
    capacity: 60,
    estimatedTotalHours: 4,
    accepted: 12,
    acceptanceMode: "automatic",
    questions: [],
    sourcedByYvc: true,
  },
  {
    id: "opp-read-aloud",
    slug: "read-aloud-day",
    title: "Read-aloud day",
    description: "Books are provided.",
    requirements: [],
    organization: organizations.reading,
    region: "fergana",
    city: "Fergana",
    locationName: null,
    format: "onsite",
    status: "open",
    startsAt: at(-1, 9),
    endsAt: at(-1, 12),
    applicationDeadline: at(-2, 18),
    capacity: 8,
    estimatedTotalHours: 3,
    accepted: 8,
    questions: [],
    sourcedByYvc: false,
  },
];

function serializeOpportunity(item, detail) {
  const spotsRemaining =
    item.capacity === null ? undefined : Math.max(0, item.capacity - item.accepted);
  const base = {
    id: item.id,
    slug: item.slug,
    title: item.title,
    organization: item.organization,
    region: item.region,
    city: item.city ?? undefined,
    format: item.format,
    status:
      spotsRemaining === 0
        ? "full"
        : item.status === "open" && new Date(item.applicationDeadline) <= new Date()
          ? "closed"
          : item.status,
    startsAt: item.startsAt,
    endsAt: item.endsAt ?? undefined,
    applicationDeadline: item.applicationDeadline,
    imageUrl: undefined,
    capacity: item.capacity ?? undefined,
    estimatedTotalHours: item.estimatedTotalHours ?? undefined,
    spotsRemaining,
    acceptanceMode: item.acceptanceMode ?? "manual",
  };
  if (!detail) return base;
  return {
    ...base,
    description: item.description,
    requirements: item.requirements,
    locationName: item.locationName ?? undefined,
    questions: item.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      helpText: question.helpText ?? undefined,
      type: question.type,
      required: question.required,
      maxLength: question.maxLength ?? undefined,
      options: question.options ?? undefined,
    })),
    sourcedByYvc: item.sourcedByYvc,
  };
}

function applicable(item) {
  return item.status === "open" && new Date(item.applicationDeadline) > new Date();
}

const REQUIRED_PROFILE_FIELDS = [
  "fullName",
  "bio",
  "region",
  "city",
  "school",
  "gradeYear",
  "languages",
  "phone",
  "telegram",
];

function missingForApplying(state) {
  const profile = state.profile;
  const filled = (field) => {
    if (!profile) return false;
    if (field === "fullName") return profile.fullName.trim().length >= 2;
    if (field === "region") return Boolean(profile.region);
    if (field === "languages") return profile.languages.length > 0;
    return profile[field].trim().length > 0;
  };
  return [
    ...(state.account.usernameSource === "generated" ? ["username"] : []),
    ...REQUIRED_PROFILE_FIELDS.filter((field) => !filled(field)),
  ];
}

function refuseUnready(response, state) {
  const fields = missingForApplying(state);
  if (fields.length === 0) return false;
  send(response, 409, {
    code: state.profile ? "profileIncomplete" : "profileRequired",
    fields,
  });
  return true;
}

function freshAccount() {
  return {
    email: null,
    emailVerified: false,
    telegramIdentity: null,
    username: "dilnoza_k",
    usernameSource: "generated",
    usernameEditable: true,
    avatarUrl: null,
    authMethods: { telegram: false, google: false, password: false },
  };
}

function counterparty(displayName, authMethods) {
  return { displayName, authMethods };
}

function seededMergeRequests() {
  const asking = counterparty("Bekzod Rustamov", {
    telegram: true,
    google: true,
    password: false,
  });
  return [
    {
      id: "merge-incoming",
      status: "pending",
      direction: "incoming",
      requestedVia: "google",
      createdAt: at(0, 9),
      expiresAt: at(1, 9),
      counterparty: asking,
    },
    {
      id: "merge-reauth",
      status: "pending",
      direction: "incoming",
      requestedVia: "telegram",
      createdAt: at(0, 8),
      expiresAt: at(1, 8),
      counterparty: asking,
    },
    {
      id: "merge-expired",
      status: "pending",
      direction: "incoming",
      requestedVia: "password",
      createdAt: at(-1, 8),
      expiresAt: at(1, 7),
      counterparty: asking,
    },
  ];
}

function freshState() {
  return {
    account: { ...freshAccount(), usernameSource: "custom" },
    mergeRequests: seededMergeRequests(),
    connectStates: new Set(),
    googleConnectStates: new Set(),
    user: {
      id: "user-dilnoza",
      displayName: "Dilnoza Karimova",
      roles: ["volunteer"],
      createdAt: at(-40),
    },
    profile: {
      fullName: "Dilnoza Karimova",
      bio: "",
      school: "Academic lyceum No. 2",
      gradeYear: "2",
      region: "tashkent-city",
      city: "Tashkent",
      languages: ["uz", "ru", "en"],
      skills: ["translation", "reading aloud"],
      phone: "",
      phoneVerified: false,
      telegram: "dilnoza_k",
      instagram: "dilnoza.codes",
      linkedin: "https://www.linkedin.com/in/dilnoza-k",
      links: ["https://portfolio.example/dilnoza"],
      updatedAt: at(-3),
    },
    preferences: {
      notifyTelegram: true,
      notifyEmail: false,
      remindDeadlines: true,
      notifyDecisions: true,
      profileToOrganisers: true,
      levelPublic: false,
      publicProfileEnabled: true,
    },
    applications: [
      {
        id: "app-book-drive",
        status: "draft",
        opportunityId: "opp-book-drive",
        createdAt: at(-1, 20),
        updatedAt: at(-1, 20),
        submittedAt: null,
        reviewedAt: null,
        withdrawnAt: null,
        answers: [],
        profileSnapshot: null,
        reviewerNote: null,
        attendance: null,
      },
      {
        id: "app-riverbank",
        status: "accepted",
        opportunityId: "opp-riverbank",
        createdAt: at(-6, 19),
        updatedAt: at(-4, 11),
        submittedAt: at(-6, 19),
        reviewedAt: at(-4, 11),
        withdrawnAt: null,
        answers: [],
        profileSnapshot: {
          fullName: "Dilnoza Karimova",
          bio: "Student volunteer interested in community projects.",
          region: "tashkent-city",
          city: "Tashkent",
          school: "Academic lyceum No. 2",
          gradeYear: "2",
          languages: ["uz", "ru", "en"],
          skills: ["translation", "reading aloud"],
          phone: "",
          telegram: "dilnoza_k",
          links: [],
        },
        reviewerNote: null,
        attendance: {
          id: "attendance-riverbank",
          outcome: "awaiting_confirmation",
          scheduledHours: 4,
          confirmedHours: null,
          resolvedAt: null,
        },
      },
    ],
    saved: ["opp-riverbank", "opp-translation"],
    record: {
      counts: {
        attended: 5,
        acceptedResolved: 6,
        acceptedUnconfirmed: 1,
        standoutReviews: false,
      },
      level: "active",
      hours: 22,
      hoursVerified: true,
    },
    history: [
      {
        id: "h-read-aloud",
        opportunityTitle: "Read-aloud day",
        organization: "Chilonzor Reading Corners",
        eventDate: at(-1, 9),
        outcome: "awaiting_confirmation",
        hours: undefined,
      },
      {
        id: "h-sorting",
        opportunityTitle: "Winter clothing sorting day",
        organization: "Volunteer Support Desk",
        eventDate: at(-12, 9),
        outcome: "attended",
        hours: 4,
      },
      {
        id: "h-archive",
        opportunityTitle: "Photo archive digitisation",
        organization: "Chilonzor Reading Corners",
        eventDate: at(-20, 9),
        outcome: "attended",
        hours: 6,
      },
    ],
    notifications: [
      {
        id: "n-accepted",
        kind: "application.reviewed",
        title: "Application update",
        body: "Your application status is now accepted.",
        data: {
          applicationId: "app-riverbank",
          userId: "user-dilnoza",
          status: "accepted",
        },
        readAt: null,
        createdAt: at(-4, 11),
      },
      {
        id: "n-received",
        kind: "application.submitted",
        title: "Application received",
        body: "Your application was submitted successfully.",
        data: { applicationId: "app-riverbank", volunteerId: "user-dilnoza" },
        readAt: at(-6, 20),
        createdAt: at(-6, 19),
      },
      {
        id: "n-archive",
        kind: "attendance.resolved",
        title: "Attendance update",
        body: "Your attendance was marked attended.",
        data: {
          attendanceId: "h-archive",
          userId: "user-dilnoza",
          outcome: "attended",
        },
        readAt: at(-19, 12),
        createdAt: at(-19, 12),
      },
      {
        id: "n-merge",
        kind: "account.merge.requested",
        title: "bekzod@example.org asked to join dilnoza@example.org",
        body: "Merge request merge-incoming is waiting.",
        data: null,
        readAt: at(-1, 20),
        createdAt: at(-1, 19),
      },
    ],
  };
}

function newAccountState(email, fullName) {
  const state = freshState();
  state.user = {
    id: `user-new-${issued + 1}`,
    displayName: String(fullName ?? "").trim(),
    roles: ["volunteer"],
    createdAt: new Date().toISOString(),
  };
  state.account = {
    ...freshAccount(),
    email: email ?? null,
    username: `user_new_${issued + 1}`,
    usernameSource: "generated",
    authMethods: { telegram: false, google: false, password: true },
  };
  state.mergeRequests = [];
  state.profile = null;
  state.applications = [];
  state.saved = [];
  state.record = {
    counts: {
      attended: 0,
      acceptedResolved: 0,
      acceptedUnconfirmed: 0,
      standoutReviews: false,
    },
    level: "newcomer",
    hours: 0,
    hoursVerified: true,
  };
  state.history = [];
  state.notifications = [];
  return state;
}

const sessions = new Map();
const refreshTokens = new Map();
const pendingStates = new Set();
const googleChallenges = new Set();
const SEEDED_EMAIL = "dilnoza@example.org";
const SEEDED_PASSWORD = "seven purple lanterns";
const passwordAccounts = new Map([[SEEDED_EMAIL, SEEDED_PASSWORD]]);
let issued = 0;
let started = 0;
let challenged = 0;
let connectStarted = 0;
let connectChallenged = 0;
let merged = 0;

function issueSession(state) {
  issued += 1;
  const accessToken = `e2e-access-${issued}`;
  const refreshToken = `e2e-refresh-${issued}`;
  sessions.set(accessToken, state);
  refreshTokens.set(refreshToken, state);
  return {
    userId: state.user.id,
    accessToken,
    accessTokenExpiresAt: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    displayName: state.user.displayName,
    roles: state.user.roles,
  };
}

function passwordState(email) {
  const state = freshState();
  state.account.email = email;
  state.account.authMethods.password = true;
  return state;
}

function requesterState() {
  const state = freshState();
  state.user = {
    id: "user-bekzod",
    displayName: "Bekzod Rustamov",
    roles: ["volunteer"],
    createdAt: at(-60),
  };
  state.profile = {
    ...state.profile,
    fullName: "Bekzod Rustamov",
    telegram: "bekzod_r",
  };
  state.account = {
    email: "bekzod@example.org",
    emailVerified: true,
    telegramIdentity: { username: "bekzod_r", linkedAt: at(-60) },
    username: "bekzod_r",
    usernameSource: "telegram",
    usernameEditable: true,
    avatarUrl: null,
    authMethods: { telegram: true, google: true, password: false },
  };
  state.mergeRequests = [];
  return state;
}

function serializeAccount(state) {
  return { id: state.user.id, authMethods: state.account.authMethods };
}

function connectionOutcome(state, provider, code) {
  if (code === "connect-conflict") {
    return { status: 409, body: { code: "accountConnectionConflict" } };
  }
  if (code === "connect-pending") {
    return { status: 409, body: { code: "accountMergeAlreadyPending" } };
  }
  if (code === "connect-unavailable") {
    return { status: 503, body: { code: "accountLinkingUnavailable" } };
  }
  if (code === "connect-already") {
    return {
      status: 200,
      body: { outcome: "alreadyLinked", account: serializeAccount(state) },
    };
  }
  if (code === "connect-approval") {
    merged += 1;
    const request = {
      id: `merge-outgoing-${merged}`,
      status: "pending",
      direction: "outgoing",
      requestedVia: provider,
      createdAt: new Date().toISOString(),
      expiresAt: at(1, 12),
      counterparty: counterparty("Bekzod Rustamov", {
        telegram: true,
        google: false,
        password: true,
      }),
    };
    state.mergeRequests.push(request);
    return {
      status: 200,
      body: { outcome: "approvalRequired", mergeRequest: request },
    };
  }

  if (provider === "telegram") {
    state.account.authMethods.telegram = true;
    state.account.telegramIdentity = {
      username: "dilnoza_k",
      linkedAt: new Date().toISOString(),
    };
  }
  if (provider === "google") {
    state.account.authMethods.google = true;
    state.account.email = state.account.email ?? "dilnoza@example.org";
  }
  return { status: 200, body: { outcome: "linked", account: serializeAccount(state) } };
}

function findMergeRequest(state, id) {
  return state.mergeRequests.find((candidate) => candidate.id === id);
}

function resolveMergeRequest(state, id, resolution) {
  const request = findMergeRequest(state, id);
  if (!request) return { status: 404, body: { code: "accountMergeRequestNotFound" } };
  if (request.status !== "pending") {
    return { status: 409, body: { code: "accountMergeRequestNotPending" } };
  }
  if (id === "merge-expired" || new Date(request.expiresAt) <= new Date()) {
    request.status = "expired";
    return { status: 409, body: { code: "accountMergeRequestExpired" } };
  }
  if (resolution === "cancel" && request.direction !== "outgoing") {
    return { status: 409, body: { code: "accountMergeRequestNotPending" } };
  }
  if (resolution !== "cancel" && request.direction !== "incoming") {
    return { status: 409, body: { code: "accountMergeRequestNotPending" } };
  }
  if (resolution === "approve" && id === "merge-reauth") {
    return { status: 403, body: { code: "recentAuthenticationRequired" } };
  }

  request.status =
    resolution === "approve"
      ? "completed"
      : resolution === "reject"
        ? "rejected"
        : "cancelled";
  request.decidedAt = new Date().toISOString();
  if (resolution === "approve") request.completedAt = request.decidedAt;

  if (resolution !== "approve") return { status: 200, body: { request } };

  return {
    status: 200,
    body: { outcome: "merged", request, session: issueSession(requesterState()) },
  };
}

function serializeApplication(state, item, detail) {
  const opportunity = opportunities.find(
    (candidate) => candidate.id === item.opportunityId,
  );
  const summary = {
    id: item.id,
    status: item.status,
    opportunity: serializeOpportunity(opportunity, false),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    submittedAt: item.submittedAt ?? undefined,
    reviewedAt: item.reviewedAt ?? undefined,
    withdrawnAt: item.withdrawnAt ?? undefined,
    attendance: item.attendance ?? undefined,
  };
  if (!detail) return summary;
  return {
    ...summary,
    answers: item.answers,
    profileSnapshot: item.profileSnapshot ?? undefined,
    reviewerNote: item.reviewerNote ?? undefined,
  };
}

function validateAnswers(opportunity, answers, requireComplete) {
  const errors = {};
  const byId = new Map(
    opportunity.questions.map((question) => [question.id, question]),
  );
  for (const key of Object.keys(answers)) {
    if (!byId.has(key)) errors[`answers.${key}`] = ["Unknown question"];
  }
  for (const question of opportunity.questions) {
    const value = answers[question.id];
    const empty = value === undefined || value === "" || value.length === 0;
    if (requireComplete && question.required && empty) {
      errors[`answers.${question.id}`] = ["Answer is required"];
      continue;
    }
    if (value === undefined) continue;
    const multi = question.type === "multi_select";
    if ((multi && !Array.isArray(value)) || (!multi && Array.isArray(value))) {
      errors[`answers.${question.id}`] = ["Answer has the wrong type"];
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

const leaderboardRoster = Array.from({ length: 29 }, (_, index) => ({
  displayName: `Volunteer ${String(index + 1).padStart(2, "0")}`,
  username: `volunteer_${String(index + 1).padStart(2, "0")}`,
  avatarUrl: null,
  profileVisible: true,
  xp: 3000 - index * 90,
}));

const VIEWER_XP = 320;
const VOLUNTEERS_WITHOUT_HANDLE = 12;
const GENERATED_USERNAME = /^user_[0-9a-f]{20}$/;

function leaderboard(state, query) {
  const rows = [
    ...leaderboardRoster,
    {
      displayName: state.user.displayName,
      username: state.account.username,
      avatarUrl: state.account.avatarUrl,
      profileVisible: state.preferences.publicProfileEnabled,
      xp: VIEWER_XP,
    },
  ]
    .sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username))
    .map((row, index) => ({
      rank: index + 1,
      ...row,
      isCurrentUser: row.username === state.account.username,
    }));

  const page = Math.max(1, Number(query.get("page") ?? 1));
  const pageSize = Math.max(1, Number(query.get("pageSize") ?? 25));
  const offset = (page - 1) * pageSize;

  return {
    items: rows.slice(offset, offset + pageSize),
    page,
    pageSize,
    total: rows.length,
    volunteerTotal: rows.length + VOLUNTEERS_WITHOUT_HANDLE,
    viewer: (() => {
      const row = rows.find((candidate) => candidate.isCurrentUser);
      return row
        ? {
            rank: row.rank,
            displayName: row.displayName,
            username: row.username,
            avatarUrl: row.avatarUrl,
            profileVisible: row.profileVisible,
            xp: row.xp,
          }
        : null;
    })(),
    scoring: {
      attendedEventXp: 50,
      confirmedHourXp: 10,
      rounding: "nearest-total",
    },
  };
}

function send(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(body === undefined ? "" : JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function listOpportunities(query) {
  const q = (query.get("q") ?? "").toLowerCase();
  const region = query.get("region");
  const format = query.get("format");
  const openOnly = query.get("openOnly") === "true";
  const sort = query.get("sort") ?? "deadline";
  const page = Number(query.get("page") ?? 1);
  const pageSize = Number(query.get("pageSize") ?? 12);

  let items = opportunities.filter(
    (item) =>
      (!q ||
        `${item.title} ${item.description} ${item.organization.name}`
          .toLowerCase()
          .includes(q)) &&
      (!region || item.region === region) &&
      (!format || item.format === format) &&
      (!openOnly || applicable(item)),
  );
  const time = (item) =>
    new Date(sort === "startDate" ? item.startsAt : item.applicationDeadline).getTime();
  items = items.sort((a, b) => {
    const openA = applicable(a) ? 0 : 1;
    const openB = applicable(b) ? 0 : 1;
    return openA - openB || time(a) - time(b);
  });
  const offset = (page - 1) * pageSize;
  return {
    items: items
      .slice(offset, offset + pageSize)
      .map((item) => serializeOpportunity(item, false)),
    page,
    pageSize,
    total: items.length,
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const method = request.method ?? "GET";
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const writes = ["POST", "PUT", "PATCH"].includes(method);
  const json = request.headers["content-type"]?.startsWith("application/json");
  const body = writes && json ? await readJson(request) : {};
  if (writes && !json) {
    for await (const _chunk of request) void _chunk;
  }

  if (path === "/" || path === "/health/live")
    return send(response, 200, { status: "ok" });
  if (FAIL_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)))
    return send(response, 500, SERVER_ERROR);

  if (path === "/auth/telegram/authorize" && method === "POST") {
    started += 1;
    const state = `e2e-state-${String(started).padStart(4, "0")}-minted-by-the-stub`;
    pendingStates.add(state);
    const authorizationUrl = `http://127.0.0.1:${PORT}/oauth/auth?state=${encodeURIComponent(state)}`;
    return send(response, 201, { authorizationUrl, state, expiresAt: at(0, 23) });
  }
  if (path === "/oauth/auth" && method === "GET") {
    const callback = new URL("/api/auth/telegram/callback", APP_URL);
    callback.searchParams.set("code", "e2e-code");
    callback.searchParams.set("state", url.searchParams.get("state") ?? "");
    response.writeHead(302, { location: callback.toString() });
    return response.end();
  }
  if (path === "/auth/telegram/callback" && method === "POST") {
    if (!pendingStates.delete(body.state))
      return send(response, 401, { code: "invalidLoginState" });
    if (body.code === "no-phone") return send(response, 403, { code: "phoneRequired" });
    if (body.code !== "e2e-code")
      return send(response, 401, { code: "invalidAuthorizationCode" });
    const opened = freshState();
    opened.account.authMethods.telegram = true;
    opened.account.telegramIdentity = { username: "dilnoza_k", linkedAt: at(-40) };
    opened.account.usernameSource = "telegram";
    opened.account.usernameEditable = true;
    return send(response, 201, issueSession(opened));
  }
  if (path === "/oauth/connect" && method === "GET") {
    const callback = new URL("/api/auth/connect/telegram/callback", APP_URL);
    callback.searchParams.set("code", url.searchParams.get("code") ?? "connect-link");
    callback.searchParams.set("state", url.searchParams.get("state") ?? "");
    response.writeHead(302, { location: callback.toString() });
    return response.end();
  }
  if (path === "/auth/google/challenge" && method === "POST") {
    challenged += 1;
    const suffix = String(challenged).padStart(4, "0");
    const state = `e2e-google-state-${suffix}-minted-by-the-stub`;
    googleChallenges.add(state);
    return send(response, 201, {
      state,
      nonce: `e2e-google-nonce-${suffix}-minted`,
      expiresAt: at(0, 23),
    });
  }
  if (path === "/auth/google/complete" && method === "POST") {
    if (!googleChallenges.delete(body.state))
      return send(response, 401, { code: "invalidGoogleState" });
    if (body.credential !== "e2e-google-id-token")
      return send(response, 401, { code: "invalidGoogleCredential" });
    const opened = freshState();
    opened.account.email = SEEDED_EMAIL;
    opened.account.emailVerified = true;
    opened.account.authMethods.google = true;
    return send(response, 200, issueSession(opened));
  }
  if (path === "/auth/password/signup" && method === "POST") {
    if (body.email === SEEDED_EMAIL)
      return send(response, 409, { code: "emailUnavailable" });
    if (String(body.password ?? "").length < 15)
      return send(response, 422, { code: "weakPassword" });
    passwordAccounts.set(body.email, body.password);
    return send(response, 201, {
      ...issueSession(newAccountState(body.email, body.fullName)),
      isNewUser: true,
    });
  }
  if (path === "/auth/password/login" && method === "POST") {
    if (passwordAccounts.get(body.email) !== body.password) {
      return send(response, 401, { code: "invalidCredentials" });
    }
    return send(response, 200, issueSession(passwordState(body.email)));
  }
  if (path === "/auth/refresh" && method === "POST") {
    const state = refreshTokens.get(body.refreshToken);
    if (!state) return send(response, 401, { code: "invalidRefreshToken" });
    refreshTokens.delete(body.refreshToken);
    return send(response, 201, issueSession(state));
  }
  if (path === "/opportunities" && method === "GET")
    return url.searchParams.get("q") === FAILING_SEARCH
      ? send(response, 500, SERVER_ERROR)
      : send(response, 200, listOpportunities(url.searchParams));
  if (path.startsWith("/opportunities/") && method === "GET") {
    const item = opportunities.find(
      (candidate) => candidate.slug === path.slice("/opportunities/".length),
    );
    return item
      ? send(response, 200, serializeOpportunity(item, true))
      : send(response, 404, { code: "opportunityNotFound" });
  }

  const token = (request.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const state = sessions.get(token);
  if (!state) return send(response, 401, { code: "unauthenticated" });

  if (path === "/auth/logout" && method === "POST") {
    sessions.delete(token);
    return send(response, 201, { loggedOut: true });
  }
  if (path === "/auth/password/change" && method === "POST") {
    const currentEmail = state.account.email;
    if (state.account.authMethods.password) {
      if (!currentEmail || passwordAccounts.get(currentEmail) !== body.currentPassword)
        return send(response, 401, { code: "invalidCredentials" });
      if (body.newPassword === body.currentPassword)
        return send(response, 422, { code: "passwordUnchanged" });
    } else {
      const requestedEmail = currentEmail ?? body.email;
      if (!requestedEmail) return send(response, 422, { code: "emailRequired" });
      if (passwordAccounts.has(requestedEmail) && requestedEmail !== currentEmail)
        return send(response, 409, { code: "emailAlreadyRegistered" });
      state.account.email = requestedEmail;
      state.account.authMethods.password = true;
    }
    passwordAccounts.set(state.account.email, body.newPassword);
    return send(response, 200, issueSession(state));
  }
  if (path === "/leaderboard" && method === "GET") {
    return send(response, 200, leaderboard(state, url.searchParams));
  }
  const publicProfileMatch = /^\/public\/profiles\/([^/]+)$/.exec(path);
  if (publicProfileMatch && method === "GET") {
    const username = decodeURIComponent(publicProfileMatch[1]).toLowerCase();
    const rosterEntry = leaderboardRoster.find((row) => row.username === username);
    const isViewer = username === state.account.username;
    if (!rosterEntry && !isViewer) {
      return send(response, 404, { code: "publicProfileNotFound" });
    }
    if (isViewer && !state.preferences.publicProfileEnabled) {
      return send(response, 404, { code: "publicProfileNotFound" });
    }
    const profile = isViewer ? state.profile : null;
    return send(response, 200, {
      displayName: profile?.fullName ?? rosterEntry.displayName,
      username,
      avatarUrl: isViewer ? state.account.avatarUrl : rosterEntry.avatarUrl,
      bio: profile?.bio ?? "Community volunteer and student.",
      region: profile?.region ?? "tashkent-city",
      city: profile?.city ?? "Tashkent",
      school: profile?.school ?? "Academic lyceum No. 2",
      gradeYear: profile?.gradeYear ?? "2",
      languages: profile?.languages ?? ["uz", "ru", "en"],
      phone: profile?.phone || "+998 90 123 45 67",
      telegram: profile?.telegram ?? username,
      instagram: profile?.instagram ?? "volontyorlar.uz",
      linkedin: profile?.linkedin ?? "https://www.linkedin.com/in/volontyorlar-uz",
      links: profile?.links ?? ["https://portfolio.example/volunteer"],
      joinedAt: state.user.createdAt,
      level: isViewer ? state.record.level : "active",
      xp: isViewer ? VIEWER_XP : rosterEntry.xp,
      stats: {
        attendedEvents: isViewer ? state.record.counts.attended : 5,
        confirmedHours: isViewer ? (state.record.hours ?? 0) : 18,
      },
    });
  }
  if (path === "/me/username" && method === "PUT") {
    const requested = String(body.username ?? "");
    if (!/^[a-z0-9_]{5,32}$/.test(requested)) {
      return send(response, 422, {
        code: "validationFailed",
        errors: { username: ["usernameCharacters"] },
      });
    }
    if (GENERATED_USERNAME.test(requested)) {
      return send(response, 409, { code: "usernameReserved" });
    }
    if (leaderboardRoster.some((row) => row.username === requested)) {
      return send(response, 409, { code: "usernameUnavailable" });
    }
    if (
      ["leaderboard", "settings", "profile", "profiles", "admin"].includes(requested)
    ) {
      return send(response, 409, { code: "usernameReserved" });
    }
    state.account.username = requested;
    state.account.usernameSource = "custom";
    state.account.usernameEditable = true;
    return send(response, 200, {
      username: requested,
      usernameSource: "custom",
      usernameEditable: true,
    });
  }
  if (path === "/me" && method === "GET") {
    return send(response, 200, {
      ...state.user,
      email: state.account.email ?? null,
      emailVerified: state.account.emailVerified,
      username: state.account.username,
      usernameSource: state.account.usernameSource,
      usernameEditable: state.account.usernameEditable,
      avatarUrl: state.account.avatarUrl,
      publicProfileEnabled: state.preferences.publicProfileEnabled,
      authMethods: state.account.authMethods,
      telegramIdentity: state.account.telegramIdentity,
      preferences: state.preferences,
    });
  }

  if (path === "/me/account-connections/telegram/authorize" && method === "POST") {
    connectStarted += 1;
    const connectState = `e2e-connect-state-${String(connectStarted).padStart(4, "0")}-minted-by-the-stub`;
    state.connectStates.add(connectState);
    return send(response, 201, {
      authorizationUrl: `http://127.0.0.1:${PORT}/oauth/connect?state=${encodeURIComponent(connectState)}`,
      state: connectState,
      expiresAt: at(0, 23),
    });
  }
  if (path === "/me/account-connections/telegram/complete" && method === "POST") {
    if (!state.connectStates.delete(body.state)) {
      return send(response, 401, { code: "invalidLoginState" });
    }
    const outcome = connectionOutcome(state, "telegram", body.code);
    return send(response, outcome.status, outcome.body);
  }
  if (path === "/me/account-connections/google/challenge" && method === "POST") {
    connectChallenged += 1;
    const suffix = String(connectChallenged).padStart(4, "0");
    const connectState = `e2e-connect-google-${suffix}-minted-by-the-stub`;
    state.googleConnectStates.add(connectState);
    return send(response, 201, {
      state: connectState,
      nonce: `e2e-connect-nonce-${suffix}-minted`,
      expiresAt: at(0, 23),
    });
  }
  if (path === "/me/account-connections/google/complete" && method === "POST") {
    if (!state.googleConnectStates.delete(body.state)) {
      return send(response, 401, { code: "invalidGoogleState" });
    }
    const outcome = connectionOutcome(state, "google", body.credential);
    return send(response, outcome.status, outcome.body);
  }
  if (path === "/me/account-connections/password/verify" && method === "POST") {
    if (!body.email || !body.password) {
      return send(response, 422, { code: "validationFailed" });
    }
    if (passwordAccounts.get(body.email) !== body.password) {
      return send(response, 401, { code: "invalidCredentials" });
    }
    const outcome = connectionOutcome(
      state,
      "password",
      body.email === SEEDED_EMAIL ? "connect-approval" : "connect-link",
    );
    if (outcome.body.outcome === "linked") {
      state.account.email = body.email;
      state.account.authMethods.password = true;
      outcome.body.account = serializeAccount(state);
    }
    return send(response, outcome.status, outcome.body);
  }
  if (path === "/me/account-merge-requests" && method === "GET") {
    const pending = state.mergeRequests.filter(
      (request) =>
        request.status === "pending" && new Date(request.expiresAt) > new Date(),
    );
    return send(response, 200, {
      incoming: pending.filter((request) => request.direction === "incoming"),
      outgoing: pending.filter((request) => request.direction === "outgoing"),
    });
  }
  const mergeMatch =
    /^\/me\/account-merge-requests\/([^/]+)(?:\/(approve|reject|cancel))?$/.exec(path);
  if (mergeMatch) {
    const [, id, resolution] = mergeMatch;
    if (!resolution && method === "GET") {
      const request = findMergeRequest(state, id);
      return request
        ? send(response, 200, request)
        : send(response, 404, { code: "accountMergeRequestNotFound" });
    }
    if (resolution && method === "POST") {
      const outcome = resolveMergeRequest(state, id, resolution);
      return send(response, outcome.status, outcome.body);
    }
  }
  if (path === "/me/preferences" && method === "GET")
    return send(response, 200, state.preferences);
  if (path === "/me/preferences" && method === "PUT") {
    Object.assign(state.preferences, body);
    return send(response, 200, state.preferences);
  }
  if (path === "/me/avatar" && method === "PUT") {
    state.account.avatarUrl = `http://127.0.0.1:${PORT}/avatar.webp`;
    return send(response, 200, { avatarUrl: state.account.avatarUrl });
  }
  if (path === "/me/avatar" && method === "DELETE") {
    state.account.avatarUrl = null;
    return send(response, 200, { avatarUrl: null });
  }
  if (path === "/profile" && method === "GET") {
    return state.profile
      ? send(response, 200, state.profile)
      : send(response, 404, { code: "profileNotFound" });
  }
  if (path === "/profile" && method === "PUT") {
    if (typeof body.fullName !== "string" || body.fullName.trim().length < 2) {
      return send(response, 422, {
        code: "validationFailed",
        errors: { fullName: ["fullName must be longer than or equal to 2 characters"] },
      });
    }
    state.profile = {
      ...(state.profile ?? {}),
      ...body,
      fullName: body.fullName.trim(),
      phoneVerified: false,
      updatedAt: new Date().toISOString(),
    };
    state.user.displayName = state.profile.fullName;
    return send(response, 200, state.profile);
  }
  if (path === "/record" && method === "GET") return send(response, 200, state.record);
  if (path === "/record/history" && method === "GET")
    return send(response, 200, { items: state.history, total: state.history.length });
  if (path === "/notifications" && method === "GET") {
    return send(response, 200, {
      items: state.notifications,
      unread: state.notifications.filter((item) => item.readAt === null).length,
    });
  }
  if (path === "/notifications/read-all" && method === "POST") {
    let updated = 0;
    for (const item of state.notifications)
      if (item.readAt === null) {
        item.readAt = new Date().toISOString();
        updated += 1;
      }
    return send(response, 201, { updated });
  }
  if (path === "/saved" && method === "GET") {
    const items = state.saved.map((id) =>
      serializeOpportunity(
        opportunities.find((item) => item.id === id),
        false,
      ),
    );
    return send(response, 200, { items, total: items.length });
  }
  if (path === "/saved" && method === "POST") {
    if (!opportunities.some((item) => item.id === body.opportunityId))
      return send(response, 404, { code: "opportunityNotFound" });
    if (!state.saved.includes(body.opportunityId))
      state.saved.unshift(body.opportunityId);
    return send(response, 201, {
      opportunityId: body.opportunityId,
      savedAt: new Date().toISOString(),
    });
  }
  if (path.startsWith("/saved/") && method === "DELETE") {
    const id = path.slice("/saved/".length);
    state.saved = state.saved.filter((candidate) => candidate !== id);
    return send(response, 200, { opportunityId: id, saved: false });
  }
  if (path === "/applications" && method === "GET") {
    const items = [...state.applications]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((item) => serializeApplication(state, item, false));
    return send(response, 200, { items, total: items.length });
  }
  if (path === "/applications/by-opportunity" && method === "GET") {
    const item = state.applications.find(
      (candidate) => candidate.opportunityId === url.searchParams.get("opportunityId"),
    );
    return item
      ? send(response, 200, serializeApplication(state, item, true))
      : send(response, 404, { code: "applicationNotFound" });
  }
  if (path === "/applications" && method === "POST") {
    const existing = state.applications.find(
      (candidate) => candidate.opportunityId === body.opportunityId,
    );
    if (existing)
      return send(response, 201, serializeApplication(state, existing, true));
    const opportunity = opportunities.find(
      (candidate) => candidate.id === body.opportunityId,
    );
    if (!opportunity) return send(response, 404, { code: "opportunityNotFound" });
    if (!applicable(opportunity))
      return send(response, 409, { code: "opportunityUnavailable" });
    if (refuseUnready(response, state)) return;
    const item = {
      id: `app-${opportunity.slug}`,
      status: "draft",
      opportunityId: opportunity.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: null,
      reviewedAt: null,
      withdrawnAt: null,
      answers: [],
      profileSnapshot: null,
      reviewerNote: null,
      attendance: null,
    };
    state.applications.push(item);
    return send(response, 201, serializeApplication(state, item, true));
  }
  const applicationMatch =
    /^\/applications\/([^/]+)(?:\/(draft|submit|withdraw))?$/.exec(path);
  if (applicationMatch) {
    const [, id, action] = applicationMatch;
    const item = state.applications.find((candidate) => candidate.id === id);
    if (!item) return send(response, 404, { code: "applicationNotFound" });
    const opportunity = opportunities.find(
      (candidate) => candidate.id === item.opportunityId,
    );
    if (!action && method === "GET")
      return send(response, 200, serializeApplication(state, item, true));
    if (
      (action === "draft" && method === "PATCH") ||
      (action === "submit" && method === "POST")
    ) {
      if (item.status !== "draft")
        return send(response, 409, { code: "applicationNotEditable" });
      const answers = body.answers ?? {};
      const errors = validateAnswers(opportunity, answers, action === "submit");
      if (errors) return send(response, 400, { code: "invalidAnswers", errors });
      if (action === "submit" && refuseUnready(response, state)) return;
      item.answers = Object.entries(answers).map(([questionId, value]) => {
        const question = opportunity.questions.find(
          (candidate) => candidate.id === questionId,
        );
        return { questionId, prompt: question?.prompt, type: question?.type, value };
      });
      item.updatedAt = new Date().toISOString();
      if (action === "submit") {
        const automatic = opportunity.acceptanceMode === "automatic";
        if (
          automatic &&
          opportunity.capacity !== null &&
          opportunity.accepted >= opportunity.capacity
        ) {
          return send(response, 409, { code: "opportunityUnavailable" });
        }
        item.status = automatic ? "accepted" : "submitted";
        item.submittedAt = item.updatedAt;
        if (automatic) {
          item.reviewedAt = item.updatedAt;
          item.attendance = {
            id: `attendance-${opportunity.slug}`,
            outcome: "awaiting_confirmation",
            scheduledHours: opportunity.estimatedTotalHours,
            confirmedHours: null,
            resolvedAt: null,
          };
        }
        item.profileSnapshot = {
          username: state.account.username,
          fullName: state.profile.fullName,
          bio: state.profile.bio,
          region: state.profile.region,
          city: state.profile.city,
          school: state.profile.school,
          gradeYear: state.profile.gradeYear,
          languages: state.profile.languages,
          phone: state.profile.phone,
          telegram: state.profile.telegram,
          instagram: state.profile.instagram,
          linkedin: state.profile.linkedin,
          links: state.profile.links,
        };
      }
      return send(response, 200, serializeApplication(state, item, true));
    }
    if (action === "withdraw" && method === "POST") {
      if (!["submitted", "under_review", "accepted"].includes(item.status)) {
        return send(response, 409, { code: "applicationCannotBeWithdrawn" });
      }
      if (
        item.status === "accepted" &&
        (new Date(opportunity.startsAt) <= new Date() ||
          item.attendance?.outcome !== "awaiting_confirmation")
      ) {
        return send(response, 409, { code: "applicationCannotBeWithdrawn" });
      }
      item.status = "withdrawn";
      item.withdrawnAt = new Date().toISOString();
      item.updatedAt = item.withdrawnAt;
      return send(response, 201, serializeApplication(state, item, true));
    }
  }

  return send(response, 404, { code: "notFound" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`stub backend listening on http://127.0.0.1:${PORT}`);
});
