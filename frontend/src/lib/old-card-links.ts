import "server-only";

import { NextResponse } from "next/server";

import { ApiError, api } from "./api";

/**
 * Old printed QR codes for wallet passes used the numeric user id
 * (/redirectcard/google/{id}, /getdirectioscard/{id}). They are sent on to
 * the business card's wallet link; unknown ids get "404 Not Found".
 */
export async function redirectToWallet(id: string, wallet: "google" | "apple"): Promise<NextResponse> {
  if (!/^\d+$/.test(id)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const { data } = await api<{ data: { slug: string } }>(`/public/vcards/by-id/${id}`);
    // A relative address: behind the proxy the server does not know the public host.
    return new NextResponse(null, { status: 308, headers: { Location: `/vcards/${encodeURIComponent(data.slug)}/wallet/${wallet}` } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return new NextResponse("Not found", { status: 404 });
    }
    throw error;
  }
}
