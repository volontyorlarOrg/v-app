export const LEADERBOARD_PAGE_SIZE = 25;

export const PAGE_WINDOW = 5;

export type PageRange = { first: number; last: number };

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  range: PageRange;
  previous: number | null;
  next: number | null;
  pages: readonly number[];
};

function positiveInteger(value: number, fallback: number): number {
  return Number.isFinite(value) && Math.floor(value) > 0 ? Math.floor(value) : fallback;
}

export function pageCount(total: number, pageSize: number): number {
  const size = positiveInteger(pageSize, LEADERBOARD_PAGE_SIZE);
  const counted = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  return Math.max(1, Math.ceil(counted / size));
}

export function clampPage(page: number, count: number): number {
  return Math.min(Math.max(positiveInteger(page, 1), 1), Math.max(1, count));
}

export function pageWindow(
  page: number,
  count: number,
  span: number = PAGE_WINDOW,
): number[] {
  const total = Math.max(1, count);
  const width = Math.min(Math.max(1, span), total);
  const start = Math.min(Math.max(1, page - Math.floor(width / 2)), total - width + 1);
  return Array.from({ length: width }, (_, index) => start + index);
}

export function paginate(input: {
  page: number;
  pageSize: number;
  total: number;
}): Pagination {
  const pageSize = positiveInteger(input.pageSize, LEADERBOARD_PAGE_SIZE);
  const total =
    Number.isFinite(input.total) && input.total > 0 ? Math.floor(input.total) : 0;
  const count = pageCount(total, pageSize);
  const page = clampPage(input.page, count);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;

  return {
    page,
    pageSize,
    total,
    pageCount: count,
    range: { first, last: total === 0 ? 0 : Math.min(page * pageSize, total) },
    previous: page > 1 ? page - 1 : null,
    next: page < count ? page + 1 : null,
    pages: pageWindow(page, count),
  };
}
