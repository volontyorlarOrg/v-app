import { NextResponse } from "next/server";

export type RedirectStatus = 303 | 307;

export function relativeRedirect(path: string, status: RedirectStatus = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: path } });
}

export function withQuery(path: string, query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}
