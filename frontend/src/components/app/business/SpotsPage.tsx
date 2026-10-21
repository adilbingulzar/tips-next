"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useActionState, useState } from "react";

import type { FormState } from "@/app/actions/auth";
import { createSpots, deleteSpot, saveSpot, saveSpotStaff } from "@/app/actions/business";
import { ActionButton } from "@/components/app/ActionButton";
import { Feedback, SaveButton } from "@/components/app/forms";
import type { ManagedSpot, Member, Role } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";

/** "Create new spot", with the old "Create one click multiple spot" option. */
export function NewSpotForm() {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(createSpots, {});
  const [multiple, setMultiple] = useState(false);

  return (
    <form action={action} className="card self-start">
      <div className="card-header">
        <h2 className="card-title">{t("Create new spot")}</h2>
      </div>
      <div className="card-body space-y-4">
        <Feedback state={state} />
        <div className="field">
          <label className="label" htmlFor="new-spot-name">
            {t("Spot Name")}
          </label>
          <input id="new-spot-name" name="name" required maxLength={95} placeholder={t("Enter Spot Name")} className="input" />
          {state.errors?.name && <p className="field-error">{t(state.errors.name[0] ?? "")}</p>}
        </div>
        <label className="flex items-start gap-3 text-sm text-stone-700">
          <input type="checkbox" name="multispot" checked={multiple} onChange={(event) => setMultiple(event.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" />
          {t("Create one click multiple spot")}
        </label>
        {multiple ? (
          <>
            <div className="field">
              <label className="label" htmlFor="new-spot-count">
                {t("Total Spots")} — {t("Limit")} (100)
              </label>
              <input id="new-spot-count" name="count" type="number" min={1} max={100} required placeholder={t("Enter number")} className="input" />
              {state.errors?.count && <p className="field-error">{t(state.errors.count[0] ?? "")}</p>}
            </div>
            <label className="flex items-start gap-3 text-sm text-stone-700">
              <input type="checkbox" name="space" className="mt-0.5 h-4 w-4 accent-orange-500" />
              {t("Space between spot name and number")}
            </label>
            <p className="text-xs text-stone-500">{t("For example: Table1, Table2, … or with a space: Table 1, Table 2, …")}</p>
          </>
        ) : (
          <>
            <div className="field">
              <label className="label" htmlFor="new-spot-slug">
                {t("Spot URI")}
              </label>
              <input id="new-spot-slug" name="slug" maxLength={100} placeholder={t("made from the name")} className="input" />
              {state.errors?.slug && <p className="field-error">{t(state.errors.slug[0] ?? "")}</p>}
            </div>
            <input type="hidden" name="is_active" value="on" />
          </>
        )}
      </div>
      <div className="border-t border-stone-100 p-6">
        <SaveButton className="btn btn-primary btn-block">Submit</SaveButton>
      </div>
    </form>
  );
}

export function SpotForm({ spot, onDone }: { spot: ManagedSpot | null; onDone?: () => void }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await saveSpot(spot?.id ?? null, previous, formData);
    if (result.success) {
      onDone?.();
    }
    return result;
  }, {});
  const key = spot?.id ?? "new";

  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <div className="field">
        <label className="label" htmlFor={`spot-name-${key}`}>
          {t("Name")}
        </label>
        <input id={`spot-name-${key}`} name="name" defaultValue={spot?.name} required maxLength={100} placeholder={t("Table 1")} className="input" />
      </div>
      <div className="field">
        <label className="label" htmlFor={`spot-slug-${key}`}>
          {spot ? t("URL name") : t("URL name (optional)")}
        </label>
        <input id={`spot-slug-${key}`} name="slug" defaultValue={spot?.slug} maxLength={100} placeholder={t("made from the name")} className="input" />
        {spot && <p className="text-xs text-amber-700">{t("Changing it stops QR codes you already printed for this spot.")}</p>}
        {state.errors?.slug && <p className="field-error">{t(state.errors.slug[0] ?? "")}</p>}
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-stone-800">
        <input type="checkbox" name="is_active" defaultChecked={spot?.is_active ?? true} className="h-5 w-5 accent-orange-500" />
        {t("Accept tips at this spot")}
      </label>
      <div className="flex justify-end">
        <SaveButton>{spot ? "Save spot" : "Add spot"}</SaveButton>
      </div>
    </form>
  );
}

function StaffForm({ spot, members, roles }: { spot: ManagedSpot; members: Member[]; roles: Role[] }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(saveSpotStaff.bind(null, spot.id), {});
  const current = new Map(spot.staff.map((member) => [member.user_id, member.role?.id]));

  if (members.length === 0) {
    return <p className="text-sm text-stone-500">{t("Add team members first.")}</p>;
  }

  return (
    <form action={action} className="space-y-2">
      <Feedback state={state} />
      {members.map((member) => (
        <div key={member.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 px-3 py-2">
          <label className="flex flex-1 items-center gap-3 text-sm font-semibold text-stone-800">
            <input type="checkbox" name="member" value={member.user.id} defaultChecked={current.has(member.user.id)} className="h-4 w-4 accent-orange-500" />
            {member.user.name}
          </label>
          <select name={`role_${member.user.id}`} defaultValue={current.get(member.user.id) ?? member.role?.id ?? roles[0]?.id} className="input w-40 py-1.5" aria-label={t("Role of {name} at this spot", { name: member.user.name })}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <SaveButton className="btn btn-primary btn-sm">Save staff</SaveButton>
      </div>
    </form>
  );
}

async function downloadQr(spot: ManagedSpot) {
  const link = document.createElement("a");
  link.href = await QRCode.toDataURL(spot.url, { errorCorrectionLevel: "M", margin: 2, width: 1200 });
  link.download = `qr-${spot.slug}.png`;
  link.click();
}

export function SpotCard({ spot, members, roles }: { spot: ManagedSpot; members: Member[]; roles: Role[] }) {
  const t = useT();
  const [panel, setPanel] = useState<"none" | "edit" | "staff">("none");
  const toggle = (next: "edit" | "staff") => setPanel((current) => (current === next ? "none" : next));

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-stone-900">
            {spot.name} {!spot.is_active && <span className="ms-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{t("Paused")}</span>}
          </p>
          <a href={spot.url} target="_blank" rel="noopener" className="block truncate text-xs text-orange-600 hover:underline">
            {spot.url}
          </a>
          <p className="mt-1 text-xs text-stone-500">{spot.staff.length === 0 ? "No staff: tips go to the business owner" : spot.staff.map((member) => member.name).join(", ")}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => downloadQr(spot)} className="btn btn-outline btn-sm">
            {t("QR code")}
          </button>
          <button type="button" onClick={() => toggle("staff")} className="btn btn-outline btn-sm">
            {t("Staff")}
          </button>
          <button type="button" onClick={() => toggle("edit")} className="btn btn-outline btn-sm">
            {t("Edit")}
          </button>
          <ActionButton action={() => deleteSpot(spot.id)} confirm={t("Delete {name}? Its QR code stops working.", { name: spot.name })} className="btn btn-ghost btn-sm text-red-600">
            {t("Delete")}
          </ActionButton>
        </div>
      </div>

      {panel === "edit" && (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <SpotForm spot={spot} onDone={() => setPanel("none")} />
        </div>
      )}
      {panel === "staff" && (
        <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
          <StaffForm spot={spot} members={members} roles={roles} />
          {spot.staff.length > 0 && (
            <p className="text-xs text-stone-500">
              {t("Shift hours at this spot:")}{" "}
              {spot.staff.map((member, index) => (
                <span key={member.id}>
                  {index > 0 && ", "}
                  <Link href={`/dashboard/spots/shifts/${member.id}`} className="font-semibold text-orange-600 hover:underline">
                    {member.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
