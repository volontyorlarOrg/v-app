import { describe, expect, it } from "vitest";

import {
  LEADERBOARD_PAGE_SIZE,
  clampPage,
  pageCount,
  pageWindow,
  paginate,
} from "@/lib/leaderboard/pagination";

describe("page counting", () => {
  it("counts the pages a total needs", () => {
    expect(pageCount(0, 25)).toBe(1);
    expect(pageCount(25, 25)).toBe(1);
    expect(pageCount(26, 25)).toBe(2);
    expect(pageCount(143, 25)).toBe(6);
  });

  it("falls back to the default size rather than dividing by nothing", () => {
    expect(pageCount(50, 0)).toBe(Math.ceil(50 / LEADERBOARD_PAGE_SIZE));
    expect(pageCount(50, Number.NaN)).toBe(Math.ceil(50 / LEADERBOARD_PAGE_SIZE));
  });

  it("keeps a requested page inside the pages that exist", () => {
    expect(clampPage(0, 6)).toBe(1);
    expect(clampPage(-3, 6)).toBe(1);
    expect(clampPage(4, 6)).toBe(4);
    expect(clampPage(99, 6)).toBe(6);
    expect(clampPage(Number.NaN, 6)).toBe(1);
  });
});

describe("the window of page numbers", () => {
  it("shows every page while they fit", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("centres on the current page in the middle of a long list", () => {
    expect(pageWindow(10, 20)).toEqual([8, 9, 10, 11, 12]);
  });

  it("stays inside the first and last page at either end", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(20, 20)).toEqual([16, 17, 18, 19, 20]);
  });
});

describe("pagination read from the backend's own page, size and total", () => {
  it("describes a page in the middle", () => {
    const pagination = paginate({ page: 3, pageSize: 25, total: 143 });
    expect(pagination).toMatchObject({
      page: 3,
      pageCount: 6,
      previous: 2,
      next: 4,
      range: { first: 51, last: 75 },
    });
  });

  it("ends the range on the total rather than on a full page", () => {
    expect(paginate({ page: 6, pageSize: 25, total: 143 }).range).toEqual({
      first: 126,
      last: 143,
    });
  });

  it("offers no step beyond the pages that exist", () => {
    const only = paginate({ page: 1, pageSize: 25, total: 4 });
    expect(only.previous).toBeNull();
    expect(only.next).toBeNull();
    expect(only.pages).toEqual([1]);
  });

  it("reads an empty leaderboard as one page with an empty range", () => {
    expect(paginate({ page: 2, pageSize: 25, total: 0 })).toMatchObject({
      page: 1,
      pageCount: 1,
      range: { first: 0, last: 0 },
    });
  });
});
