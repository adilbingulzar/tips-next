import { forwardApiFile } from "@/lib/api-files";

/** All spots with their QR addresses, as CSV. */
export async function GET() {
  return forwardApiFile("/me/business/spots-export");
}
