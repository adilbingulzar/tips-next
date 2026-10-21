import "server-only";

import { cache } from "react";

import { ApiError, api } from "./api";
import type { PublicPayment, PublicProfile, PublicSpot, PublicVcard } from "./types";

/** null when the page does not exist, so the caller can show a 404. */
async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export const getProfile = cache(async (slug: string, page: "tip" | "review"): Promise<PublicProfile | null> => {
  const response = await orNull(api<{ data: PublicProfile }>(`/public/profiles/${encodeURIComponent(slug)}`, { query: { page } }));
  return response?.data ?? null;
});

export const getSpot = cache(async (businessId: string, spotSlug: string, page: "tip" | "review"): Promise<PublicSpot | null> => {
  if (!/^\d+$/.test(businessId)) {
    return null;
  }
  const response = await orNull(
    api<{ data: PublicSpot }>(`/public/businesses/${businessId}/spots/${encodeURIComponent(spotSlug)}`, { query: { page } }),
  );
  return response?.data ?? null;
});

export const getPayment = cache(async (id: string): Promise<PublicPayment | null> => {
  const response = await orNull(api<{ data: PublicPayment }>(`/public/payments/${encodeURIComponent(id)}`));
  return response?.data ?? null;
});

export const getVcard = cache(async (slug: string): Promise<PublicVcard | null> => {
  const response = await orNull(api<{ data: PublicVcard }>(`/public/vcards/${encodeURIComponent(slug)}`));
  return response?.data ?? null;
});
