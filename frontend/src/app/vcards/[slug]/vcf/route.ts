import type { NextRequest } from "next/server";

import { forwardCardFile } from "@/lib/card-files";
import { visitorIpFrom } from "@/lib/visitor-ip";

/** "Save card": the card as a contact file. */
export async function GET(request: NextRequest, { params }: RouteContext<"/vcards/[slug]/vcf">) {
  const { slug } = await params;
  return forwardCardFile(slug, "vcf", visitorIpFrom(request.headers) ?? null);
}
