"use server";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";

/** Go live (on shift) or offline at a business. The API checks the employment is the user's own. */
export async function setEmploymentLive(employmentId: number, isLive: boolean): Promise<{ ok: boolean; message?: string }> {
  const token = await requireToken();

  try {
    await api(`/me/employments/${employmentId}/live`, { method: "PUT", token, body: { is_live: isLive } });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." };
  }
}
