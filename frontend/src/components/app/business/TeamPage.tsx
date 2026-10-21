"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { answerJoinRequest, deleteRole, inviteMember, removeMember, saveRole, updateMember } from "@/app/actions/business";
import { Feedback, Field, SaveButton } from "@/components/app/forms";
import { EmptyState } from "@/components/app/EmptyState";
import { SolidIcon } from "@/components/app/SolidIcons";
import { Avatar } from "@/components/tips/Avatar";
import type { Agreement, Member, Role } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";

function RoleSelect({ roles, value, name = "business_role_id", required = false }: { roles: Role[]; value?: number | null; name?: string; required?: boolean }) {
  const t = useT();
  return (
    <select name={name} defaultValue={value ?? ""} required={required} className="input py-2" aria-label={t("Role")}>
      <option value="">{required ? t("Choose a role") : t("No role")}</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}

function AgreementSelect({ agreements, value }: { agreements: Agreement[]; value?: number | null }) {
  const t = useT();
  return (
    <select name="agreement_id" defaultValue={value ?? ""} className="input py-2" aria-label={t("Agreement")}>
      <option value="">{t("Default agreement")}</option>
      {agreements
        .filter((agreement) => !agreement.is_for_spots)
        .map((agreement) => (
          <option key={agreement.id} value={agreement.id}>
            {agreement.title}
          </option>
        ))}
    </select>
  );
}

function SmallAvatar({ name, src }: { name: string; src: string | null }) {
  return (
    <div className="shrink-0 [&_.tip-avatar]:h-10 [&_.tip-avatar]:w-10 [&_.tip-avatar]:border-2 [&_.tip-avatar]:text-sm [&_.tip-avatar]:shadow-none">
      <Avatar name={name} src={src} />
    </div>
  );
}

export function JoinRequest({ member, roles }: { member: Member; roles: Role[] }) {
  const t = useT();
  const [acceptState, accept] = useActionState<FormState, FormData>(answerJoinRequest.bind(null, member.id, "accept"), {});
  const [rejectState, reject] = useActionState<FormState, FormData>(answerJoinRequest.bind(null, member.id, "reject"), {});

  return (
    <li className="space-y-3 py-4">
      <div className="flex items-center gap-3">
        <SmallAvatar name={member.user.name} src={member.user.avatar} />
        <p className="font-bold text-stone-900">{t("{name} wants to join your team", { name: member.user.name })}</p>
      </div>
      <Feedback state={acceptState.message ? acceptState : rejectState} />
      <div className="flex flex-wrap items-center gap-2">
        <form action={accept} className="flex flex-1 flex-wrap gap-2">
          <div className="min-w-40 flex-1">
            <RoleSelect roles={roles} required />
          </div>
          <SaveButton className="btn btn-primary btn-sm">Accept</SaveButton>
        </form>
        <form action={reject}>
          <SaveButton className="btn btn-outline btn-sm" pendingText="…">
            {t("Decline")}
          </SaveButton>
        </form>
      </div>
    </li>
  );
}

/** The old search bar: find a person by public name (or email) and send them a request. */
export function InviteForm({ roles, agreements }: { roles: Role[]; agreements: Agreement[] }) {
  const t = useT();
  const [state, action, pending] = useActionState<FormState, FormData>(inviteMember, {});

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input name="identifier" required autoComplete="off" placeholder={t("Search by name or username")} aria-label={t("Username or email")} className="input ps-10" />
        </div>
        <div className="w-40">
          <RoleSelect roles={roles} />
        </div>
        <div className="w-44">
          <AgreementSelect agreements={agreements} />
        </div>
        <button type="submit" disabled={pending} className="btn btn-secondary shrink-0">
          {t(pending ? "Sending…" : "Send Request")}
        </button>
      </div>
      <p className="text-xs text-stone-500">{t("Enter the exact username (public name) or email address of the person.")}</p>
      {state.errors?.identifier ? <p className="field-error">{t(state.errors.identifier[0] ?? "")}</p> : <Feedback state={state} />}
    </form>
  );
}

const joined = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Europe/Amsterdam" }) : "";

/** One team member with the old row menu: Remove, Assign Role, Finance Agreement, working hours. */
export function MemberRow({ member, roles, agreements }: { member: Member; roles: Role[]; agreements: Agreement[] }) {
  const t = useT();
  const [menu, setMenu] = useState<"main" | "role" | "agreement" | null>(null);
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();
  const accepted = member.status === "accepted";

  function assign(change: { business_role_id?: number | null; agreement_id?: number | null }) {
    setMenu(null);
    const body = new FormData();
    const roleId = "business_role_id" in change ? change.business_role_id : member.role?.id;
    const agreementId = "agreement_id" in change ? change.agreement_id : member.agreement?.id;
    if (roleId) body.set("business_role_id", String(roleId));
    if (agreementId) body.set("agreement_id", String(agreementId));
    startTransition(async () => setState(await updateMember(member.id, {}, body)));
  }

  function remove() {
    setMenu(null);
    if (window.confirm(member.status === "pending" ? t("Withdraw this invitation?") : t("Remove {name} from the team?", { name: member.user.name }))) {
      startTransition(async () => setState(await removeMember(member.id)));
    }
  }

  const item = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50";

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-4">
      <span className="relative">
        <SmallAvatar name={member.user.name} src={member.user.avatar} />
        {member.is_live && <span className="absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" title={t("online")} />}
      </span>
      <div className="min-w-40 flex-1">
        <p className="font-bold text-stone-900">{member.user.name}</p>
        <p className="flex items-center gap-1 text-sm text-stone-500">
          <SolidIcon name="clock" className="h-3.5 w-3.5" /> {joined(member.since)}
          {member.status === "pending" && <span className="badge ms-2 bg-amber-100 text-amber-800">{t("Invitation sent")}</span>}
        </p>
        {accepted && (
          <p className="text-xs text-stone-500">
            {member.role ? t(member.role.name) : `(${t("Not Set")})`}
            {member.agreement && ` · ${member.agreement.title}`}
          </p>
        )}
        {(state.message || state.success) && <p className={`mt-1 text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}>{t(state.message ?? state.success ?? "")}</p>}
      </div>
      <div className="relative">
        <button type="button" disabled={pending} onClick={() => setMenu(menu ? null : "main")} aria-expanded={menu !== null} aria-label={t("Options")} className="grid h-9 w-9 place-items-center rounded-full text-orange-500 hover:bg-stone-100">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
        {menu && (
          <div className="menu-panel absolute end-0 z-20 mt-2 w-60">
            {menu === "main" && (
              <>
                <button type="button" onClick={remove} className={`${item} text-red-600`}>
                  {t(member.status === "pending" ? "Withdraw" : "Remove")}
                </button>
                {accepted && (
                  <>
                    <button type="button" onClick={() => setMenu("role")} className={item}>
                      {t("Assign Role")} »
                    </button>
                    <button type="button" onClick={() => setMenu("agreement")} className={item}>
                      {t("Finance Agreement")} »
                    </button>
                    <Link href={`/dashboard/team/shifts/${member.id}`} className={item}>
                      {t("Set Working Hours")}
                    </Link>
                  </>
                )}
              </>
            )}
            {menu === "role" && (
              <>
                {roles.map((role) => (
                  <button key={role.id} type="button" onClick={() => assign({ business_role_id: role.id })} className={`${item} ${member.role?.id === role.id ? "font-bold text-orange-600" : ""}`}>
                    <SolidIcon name="userCheck" className="h-4 w-4 text-orange-500" /> {role.name}
                  </button>
                ))}
                <Link href="/dashboard/team/roles" className={item}>
                  ＋ {t("Add New")}
                </Link>
              </>
            )}
            {menu === "agreement" && (
              <>
                <button type="button" onClick={() => assign({ agreement_id: null })} className={`${item} ${!member.agreement ? "font-bold text-orange-600" : ""}`}>
                  {t("Default agreement")}
                </button>
                {agreements
                  .filter((agreement) => !agreement.is_for_spots)
                  .map((agreement) => (
                    <button key={agreement.id} type="button" onClick={() => assign({ agreement_id: agreement.id })} className={`${item} ${member.agreement?.id === agreement.id ? "font-bold text-orange-600" : ""}`}>
                      {agreement.title}
                    </button>
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function TeamList({ members, roles, agreements }: { members: Member[]; roles: Role[]; agreements: Agreement[] }) {
  const t = useT();
  const team = members.filter((member) => member.status === "accepted" || (member.status === "pending" && member.requested_by === "business"));

  return (
    <>
      <p className="mt-4 mb-2 text-sm font-semibold text-stone-500">{t("Result {count}", { count: team.length })}</p>
      {team.length === 0 ? (
        <EmptyState>No team members yet. Invite your first colleague.</EmptyState>
      ) : (
        <ul className="card divide-y divide-stone-100">
          {team.map((member) => (
            <MemberRow key={member.id} member={member} roles={roles} agreements={agreements} />
          ))}
        </ul>
      )}
    </>
  );
}

const LEVELS = [
  [1, "Admin"],
  [2, "Auditor"],
  [3, "Employee"],
] as const;

/** The old "Manage Role" page: a form to create or edit a role, and the list of roles. */
export function RoleManager({ roles }: { roles: Role[] }) {
  const t = useT();
  const [editing, setEditing] = useState<Role | null>(null);
  const [state, action] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await saveRole(editing?.id ?? null, previous, formData);
    if (result.success) {
      setEditing(null);
    }
    return result;
  }, {});
  const [listState, setListState] = useState<FormState>({});
  const [, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form key={editing?.id ?? "new"} action={action} className="card self-start">
        <div className="card-header">
          <h2 className="card-title">{t(editing ? "Edit" : "Create new role")}</h2>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary btn-sm">
              {t("Back")}
            </button>
          )}
        </div>
        <div className="card-body space-y-4">
          <Feedback state={state} />
          <Field state={state} name="name" label="Role Name" placeholder={t("Enter Role Name")} defaultValue={editing?.name ?? ""} required maxLength={150} />
          <div className="field">
            <label className="label" htmlFor="parent_id">
              {t("Parent Role")}
            </label>
            <select id="parent_id" name="parent_id" defaultValue={editing?.parent_id ?? ""} className="input">
              <option value="">–</option>
              {roles
                .filter((role) => role.id !== editing?.id)
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="level">
              {t("Select Level")}
            </label>
            <select id="level" name="level" defaultValue={editing?.level ?? 3} className="input">
              {LEVELS.map(([value, label]) => (
                <option key={value} value={value}>
                  {t(label)}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-start gap-3 text-sm text-stone-700">
            <input type="checkbox" name="receives_tips" defaultChecked={editing?.receives_tips ?? true} className="mt-0.5 h-4 w-4 accent-orange-500" />
            {t("This user can accept tips from customer")}
          </label>
        </div>
        <div className="border-t border-stone-100 p-6">
          <SaveButton className="btn btn-primary btn-block">Submit</SaveButton>
        </div>
      </form>

      <section className="card self-start">
        <div className="card-header">
          <h2 className="card-title">{t("Manage Role")}</h2>
        </div>
        {listState.message && (
          <div className="px-6 pt-4">
            <Feedback state={listState} />
          </div>
        )}
        {roles.length === 0 ? (
          <EmptyState>Sorry, no data found!</EmptyState>
        ) : (
          <ul className="divide-y divide-stone-100">
            {roles.map((role) => (
              <li key={role.id} className="flex items-center gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-stone-900">{role.name}</p>
                  <p className="text-xs text-stone-500">
                    {t(LEVELS.find(([value]) => value === role.level)?.[1] ?? "Employee")}
                    {role.receives_tips ? ` · ${t("Accepts tips")}` : ""}
                    {role.parent_id ? ` · ${roles.find((parent) => parent.id === role.parent_id)?.name ?? ""}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(role)} className="btn btn-secondary btn-sm">
                  {t("Edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t("Delete the role {name}?", { name: role.name }))) {
                      startTransition(async () => setListState(await deleteRole(role.id)));
                    }
                  }}
                  className="btn btn-ghost btn-sm text-red-600"
                >
                  {t("Delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
