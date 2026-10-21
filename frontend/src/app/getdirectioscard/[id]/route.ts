import { redirectToWallet } from "@/lib/old-card-links";

/** Old QR code for the Apple Wallet pass: /getdirectioscard/{user id}. */
export async function GET(_request: Request, { params }: RouteContext<"/getdirectioscard/[id]">) {
  const { id } = await params;
  return redirectToWallet(id, "apple");
}
