import type { NextRequest } from "next/server";

import { forwardCardFile } from "@/lib/card-files";
import { visitorIpFrom } from "@/lib/visitor-ip";

/** The card as an Apple Wallet pass; iPhones offer to add it straight away. */
export async function GET(request: NextRequest, { params }: RouteContext<"/vcards/[slug]/wallet/apple">) {
  const { slug } = await params;
  return forwardCardFile(slug, "wallet/apple", visitorIpFrom(request.headers) ?? null);
}
