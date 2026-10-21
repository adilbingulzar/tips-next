"use server";

import { refresh } from "next/cache";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";

import type { FormState } from "./auth";
import { saveBio } from "./settings";

/** Server functions behind the business card settings. The API validates everything. */

const COLOR_KEYS = [
  "primary_background",
  "secondary_background",
  "primary_text",
  "secondary_text",
  "primary_button",
  "secondary_button",
  "primary_button_text",
  "secondary_button_text",
  "border",
  "return_button",
] as const;

function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

async function send(path: string, method: "PUT" | "POST" | "DELETE", body: unknown, success: string): Promise<FormState> {
  try {
    await api(path, { method, token: await requireToken(), body });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.status === 422 ? (Object.values(error.errors)[0]?.[0] ?? error.message) : error.message, errors: error.errors };
    }
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }
  refresh();
  return { success };
}

export async function updateVcard(_state: FormState, formData: FormData): Promise<FormState> {
  const flag = (name: string) => formData.get(name) === "on";
  const colors = Object.fromEntries(COLOR_KEYS.map((key) => [key, text(formData, `color_${key}`)]).filter(([, value]) => value !== null));

  const saved = await send(
    "/me/vcard",
    "PUT",
    {
      is_active: flag("is_active"),
      theme: Number(formData.get("theme") ?? 1),
      show_business_name: formData.get("name_or_logo") !== "logo",
      business_name: text(formData, "business_name"),
      business_title: text(formData, "business_title"),
      business_email: text(formData, "business_email"),
      show_location: flag("show_location"),
      business_address: text(formData, "business_address"),
      show_opening_hours: flag("show_opening_hours"),
      show_review: flag("show_review"),
      show_business_icon: flag("show_business_icon"),
      show_email_icon: flag("show_email_icon"),
      show_phone_icon: flag("show_phone_icon"),
      show_address_icon: flag("show_address_icon"),
      appointment_url: text(formData, "appointment_url"),
      google_review_url: text(formData, "google_review_url"),
      ambassador_url: text(formData, "ambassador_url"),
      social_links: formData
        .getAll("social_links")
        .map((link) => String(link).trim())
        .filter((link) => link !== ""),
      colors,
    },
    "Your business card was saved.",
  );
  // "Vcard Status" is the profile bio, as in the old app.
  if (saved.success && formData.has("bio")) {
    const bio = await saveBio(text(formData, "bio"));
    return bio.success ? saved : bio;
  }
  return saved;
}

export async function uploadVcardImage(type: "logo" | "banner", _state: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { image: ["Choose an image first."] } };
  }
  const body = new FormData();
  body.set("image", file);
  return send(`/me/vcard/${type === "logo" ? "logo" : "banner"}`, "POST", body, type === "logo" ? "Your logo was updated." : "Your banner was updated.");
}

export async function removeVcardImage(type: "logo" | "banner"): Promise<FormState> {
  return send(`/me/vcard/${type === "logo" ? "logo" : "banner"}`, "DELETE", undefined, "Removed.");
}
