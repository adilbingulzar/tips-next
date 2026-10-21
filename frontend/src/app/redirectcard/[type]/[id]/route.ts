import { redirectToWallet } from "@/lib/old-card-links";

/** Old QR code: /redirectcard/google/{user id} (also "ios"). */
export async function GET(_request: Request, { params }: RouteContext<"/redirectcard/[type]/[id]">) {
  const { type, id } = await params;
  return redirectToWallet(id, type === "google" ? "google" : "apple");
}
