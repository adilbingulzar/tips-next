import type { NextRequest } from "next/server";

import { forwardApiFile } from "@/lib/api-files";

/** Tips given at spots in a period, as CSV. */
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["period", "from", "until"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) {
      query.set(key, value);
    }
  }
  return forwardApiFile(`/me/business/spot-tips-export?${query}`);
}
