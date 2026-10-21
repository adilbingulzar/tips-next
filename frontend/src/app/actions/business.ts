"use server";

import { refresh } from "next/cache";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";

import type { FormState } from "./auth";

/**
 * Server functions of the team, spot and agreement pages, and "My work".
 * The API checks that every record belongs to the signed-in user's business.
 */

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

async function call(path: string, method: Method, body: unknown, success: string): Promise<FormState> {
  try {
    await api(path, { method, token: await requireToken(), body });
  } catch (error) {
    if (error instanceof ApiError) {
      const first = Object.values(error.errors)[0]?.[0];
      return { message: first ?? error.message, errors: error.errors };
    }
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }
  refresh();
  return { success };
}

const text = (formData: FormData, name: string): string | null => {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
};
const id = (formData: FormData, name: string): number | null => (text(formData, name) ? Number(text(formData, name)) : null);

/* My work */

export async function joinBusiness(_state: FormState, formData: FormData): Promise<FormState> {
  return call("/me/employments", "POST", { business_code: text(formData, "business_code") }, "Your request was sent. The business will let you know.");
}

export async function answerInvitation(employmentId: number, answer: "accept" | "decline", reason?: string): Promise<FormState> {
  return call(`/me/employments/${employmentId}/${answer}`, "POST", answer === "decline" && reason ? { reason } : {}, answer === "accept" ? "Welcome to the team!" : "Invitation declined.");
}

/** The signed-in user's own working hours at a business. */
export async function loadOwnShifts(employmentId: number): Promise<Shifts | null> {
  try {
    const { data } = await api<{ data: Shifts }>(`/me/employments/${employmentId}/shifts`, { token: await requireToken() });
    return data;
  } catch {
    return null;
  }
}

export async function leaveBusiness(employmentId: number): Promise<FormState> {
  return call(`/me/employments/${employmentId}`, "DELETE", undefined, "Done.");
}

/* Roles */

export async function saveRole(roleId: number | null, _state: FormState, formData: FormData): Promise<FormState> {
  const body = {
    name: text(formData, "name"),
    receives_tips: formData.get("receives_tips") === "on",
    ...(formData.has("level") ? { level: Number(formData.get("level")) } : {}),
    ...(formData.has("parent_id") ? { parent_id: id(formData, "parent_id") } : {}),
  };
  return roleId === null
    ? call("/me/business/roles", "POST", body, "Role added.")
    : call(`/me/business/roles/${roleId}`, "PUT", body, "Role saved.");
}

export async function deleteRole(roleId: number): Promise<FormState> {
  return call(`/me/business/roles/${roleId}`, "DELETE", undefined, "Role deleted.");
}

/* Team */

export async function inviteMember(_state: FormState, formData: FormData): Promise<FormState> {
  return call(
    "/me/business/employees",
    "POST",
    { identifier: text(formData, "identifier"), business_role_id: id(formData, "business_role_id"), agreement_id: id(formData, "agreement_id") },
    "Invitation sent.",
  );
}

export async function updateMember(employeeId: number, _state: FormState, formData: FormData): Promise<FormState> {
  return call(
    `/me/business/employees/${employeeId}`,
    "PATCH",
    { business_role_id: id(formData, "business_role_id"), agreement_id: id(formData, "agreement_id") },
    "Saved.",
  );
}

export async function removeMember(employeeId: number): Promise<FormState> {
  return call(`/me/business/employees/${employeeId}`, "DELETE", undefined, "Removed from the team.");
}

export async function answerJoinRequest(employeeId: number, answer: "accept" | "reject", _state: FormState, formData: FormData): Promise<FormState> {
  return call(
    `/me/business/employees/${employeeId}/${answer}`,
    "POST",
    answer === "accept" ? { business_role_id: id(formData, "business_role_id") } : { reason: text(formData, "reason") },
    answer === "accept" ? "Added to the team." : "Request declined.",
  );
}

export type Shifts = Record<string, { from: string; to: string }[]>;

export async function saveShifts(path: string, days: Shifts): Promise<FormState> {
  // Only the shift and opening-hours endpoints are allowed, so a crafted call cannot reach other API paths.
  if (path === "/me/vcard-hours") {
    return call(path, "PUT", { days }, "Opening hours saved.");
  }
  if (!/^\/me\/(business\/(employees|spot-staff)|employments)\/\d+\/shifts$/.test(path)) {
    return { message: "Not allowed." };
  }
  return call(path, "PUT", { days }, "Shifts saved.");
}

/* Agreements */

export async function saveAgreement(agreementId: number | null, _state: FormState, formData: FormData): Promise<FormState> {
  const shares = formData
    .getAll("share_role")
    .map((role, index) => ({ role_id: Number(role), percent: Number(String(formData.getAll("share_percent")[index] ?? "0").replace(",", ".")) }))
    .filter((share) => share.percent > 0);

  const body = { title: text(formData, "title"), content: text(formData, "content"), is_for_spots: formData.get("is_for_spots") === "on", role_shares: shares };
  return agreementId === null
    ? call("/me/business/agreements", "POST", body, "Agreement created.")
    : call(`/me/business/agreements/${agreementId}`, "PUT", body, "Agreement saved.");
}

export async function makeDefaultAgreement(agreementId: number): Promise<FormState> {
  return call(`/me/business/agreements/${agreementId}/default`, "POST", {}, "This is now the default agreement.");
}

export async function deleteAgreement(agreementId: number): Promise<FormState> {
  return call(`/me/business/agreements/${agreementId}`, "DELETE", undefined, "Agreement deleted.");
}

/* Spots */

/** The old "Create new spot" form: one spot, or numbered spots in one go. */
export async function createSpots(state: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("multispot") !== "on") {
    return saveSpot(null, state, formData);
  }
  return call(
    "/me/business/spots/bulk",
    "POST",
    { name: text(formData, "name"), count: Number(formData.get("count") ?? 0), space: formData.get("space") === "on" },
    "Spots added.",
  );
}

export async function saveSpot(spotId: number | null, _state: FormState, formData: FormData): Promise<FormState> {
  const body = { name: text(formData, "name"), slug: text(formData, "slug"), is_active: formData.get("is_active") === "on" };
  return spotId === null
    ? call("/me/business/spots", "POST", body, "Spot added.")
    : call(`/me/business/spots/${spotId}`, "PUT", body, "Spot saved.");
}

export async function deleteSpot(spotId: number): Promise<FormState> {
  return call(`/me/business/spots/${spotId}`, "DELETE", undefined, "Spot deleted.");
}

export async function saveSpotStaff(spotId: number, _state: FormState, formData: FormData): Promise<FormState> {
  const members = formData
    .getAll("member")
    .map((userId) => ({ user_id: Number(userId), business_role_id: Number(formData.get(`role_${String(userId)}`)) }));
  return call(`/me/business/spots/${spotId}/staff`, "PUT", { members }, "Staff saved.");
}

/* Spots the user works at */

export async function setSpotLive(spotEmployeeId: number, isLive: boolean): Promise<FormState> {
  return call(`/me/spots/${spotEmployeeId}/live`, "PUT", { is_live: isLive }, isLive ? "You are live at this spot." : "You are offline at this spot.");
}

export async function leaveSpot(spotEmployeeId: number): Promise<FormState> {
  return call(`/me/spots/${spotEmployeeId}`, "DELETE", undefined, "You left the spot.");
}

/* Reviews */

export async function pinReview(tipId: number, isPinned: boolean): Promise<FormState> {
  return call(`/me/reviews/${tipId}/pin`, "PUT", { is_pinned: isPinned }, isPinned ? "Review pinned." : "Review unpinned.");
}

/* Review widget */

export async function saveWidgetSettings(_state: FormState, formData: FormData): Promise<FormState> {
  return call(
    "/me/business/widget",
    "PUT",
    {
      frame: formData.get("frame") === "fixed" ? "fixed" : "full",
      width: Number(formData.get("width") ?? 100),
      height: Number(formData.get("height") ?? 500),
      dark: formData.get("dark") === "on",
      scrollable: formData.get("scrollable") === "on",
    },
    "Widget settings saved.",
  );
}
