"use client";

import { useActionState } from "react";

import { changeEmail, updateNotificationPreferences } from "@/app/actions/account";
import type { FormState } from "@/app/actions/auth";
import type { NotificationPreference } from "@/lib/types";

import { Feedback, Field, SaveButton } from "./forms";
import { SolidIcon, type SolidIconName } from "./SolidIcons";
import { useT } from "@/components/i18n/I18nProvider";

const STARS = [1, 2, 3, 4, 5];

/** The old page's groups, with its wording; events the API adds later are listed under "Other". */
const GROUPS: { title: string; icon: SolidIconName; events: [string, string][] }[] = [
  {
    title: "Business",
    icon: "briefcase",
    events: [
      ["join_request", "Receive notification on business join requests"],
      ["accept_join_request", "Receive notification on accept business join requests"],
      ["reject_agreement", "Receive notification on reject business agreement"],
      ["decline_join_request", "Receive notification on decline business join requests"],
    ],
  },
  {
    title: "Review and Rating",
    icon: "star",
    events: [
      ["service_review", "Receive notification on service review"],
      ["service_rating", "Receive notification on rating by stars"],
    ],
  },
  {
    title: "Service Tips",
    icon: "money",
    events: [
      ["service_tip_self", "Receive notification on you receive service tip"],
      ["service_tip_group", "Receive notification on employee or group receive service tip"],
    ],
  },
  {
    title: "Payment Withdrawal",
    icon: "bank",
    events: [
      ["payment_transfer", "Receive notifications when payment is transferred to the bank"],
      ["payment_processing", "Receive notification on payments in processing"],
    ],
  },
];

function PreferenceSwitch({ preference, label }: { preference: NotificationPreference; label: string }) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <input type="hidden" name="events" value={preference.event} />
      <span className="text-sm font-semibold text-stone-800">{t(label)}</span>
      <input type="checkbox" name={`enabled_${preference.event}`} defaultChecked={preference.enabled} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-orange-500 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
    </label>
  );
}

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreference[] }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updateNotificationPreferences, {});
  const byEvent = new Map(preferences.map((preference) => [preference.event, preference]));
  const grouped = new Set(GROUPS.flatMap((group) => group.events.map(([event]) => event)));
  const other = preferences.filter((preference) => !grouped.has(preference.event));

  return (
    <form action={action} className="space-y-6">
      <Feedback state={state} />
      {[...GROUPS, ...(other.length > 0 ? [{ title: "Other", icon: "fileLines" as const, events: other.map((preference) => [preference.event, preference.label] as [string, string]) }] : [])].map((group) => (
        <section key={group.title} className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <SolidIcon name={group.icon} className="h-5 w-5 text-orange-500" />
              {t(group.title)}
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            {group.events.map(([event, label]) => {
              const preference = byEvent.get(event);
              if (!preference) {
                return null;
              }
              return (
                <div key={event} className="px-5 py-5">
                  <PreferenceSwitch preference={preference} label={label} />
                  {event === "service_rating" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {STARS.map((star) => (
                        <label key={star} className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-bold text-stone-700">
                          <input type="checkbox" name="stars" value={star} defaultChecked={preference.stars.length === 0 || preference.stars.includes(star)} className="h-4 w-4 accent-orange-500" />
                          {star} <SolidIcon name="star" className="h-3.5 w-3.5 text-amber-400" />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <SaveButton className="btn btn-primary btn-lg btn-block">Update Notification</SaveButton>
    </form>
  );
}

export function EmailForm({ email, compact = false }: { email: string; compact?: boolean }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(changeEmail, {});

  return (
    <form action={action} className={compact ? "space-y-4" : "card space-y-4 p-6"}>
      {!compact && (
        <div>
          <h2 className="text-lg">{t("Email address")}</h2>
          <p className="text-sm text-stone-500">{t("We send a code to the new address to confirm it.")}</p>
        </div>
      )}
      <Feedback state={state} />
      <Field state={state} name="email" label="Email" type="email" defaultValue={email} required autoComplete="email" />
      <Field state={state} name="email_password" label="Your password" type="password" required autoComplete="current-password" />
      <div className="flex justify-end">
        <SaveButton pendingText="Sending code…">Change email</SaveButton>
      </div>
    </form>
  );
}
