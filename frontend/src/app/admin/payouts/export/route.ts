import type { NextRequest } from "next/server";

import { forwardApiFile } from "@/lib/api-files";

/** Download of the selected open payouts as a SEPA file or CSV (form post from the Payouts page). */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const ids = form.getAll("ids").map(Number).filter(Number.isInteger);
  const format = form.get("format") === "csv" ? "csv" : "sepa";
  return forwardApiFile("/admin/payouts/export", { method: "POST", body: { ids, format } });
}
