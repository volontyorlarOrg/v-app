import { NextResponse, type NextRequest } from "next/server";

import { searchInstitutions } from "@/lib/api/directories.server";

const DISTRICT_ID = /^\d{7}$/;

export async function GET(request: NextRequest) {
  const districtId = request.nextUrl.searchParams.get("district") ?? "";
  if (!DISTRICT_ID.test(districtId)) {
    return NextResponse.json({ code: "validationFailed" }, { status: 422 });
  }
  try {
    const items = await searchInstitutions({ type: "school", districtId });
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, max-age=300" } },
    );
  } catch {
    return NextResponse.json({ code: "unavailable" }, { status: 502 });
  }
}
