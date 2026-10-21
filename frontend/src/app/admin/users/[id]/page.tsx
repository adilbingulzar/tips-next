import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GrantPlanForm, UserFeesForm } from "@/components/admin/AdminForms";
import { PageHeader, dateTime } from "@/components/app/ui";
import type { AdminSettings, AdminUser } from "@/lib/admin-types";
import { ApiError, api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "User" };

export default function Page({ params }: PageProps<"/admin/users/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <UserDetail params={params} />
    </Suspense>
  );
}

async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }
  const token = await requireToken();
  const [user, settings] = await Promise.all([
    api<{ data: AdminUser }>(`/admin/users/${id}`, { token })
      .then((response) => response.data)
      .catch((error) => {
        if (error instanceof ApiError && error.status === 404) {
          notFound();
        }
        throw error;
      }),
    api<{ data: AdminSettings }>("/admin/settings", { token }).then((response) => response.data),
  ]);
  const plan = user.subscription;

  return (
    <>
      <PageHeader
        title={user.name}
        description={`${user.email} · ${user.account_type === "business" ? "Business account" : "Personal account"} · joined ${dateTime(user.created_at)}`}
        actions={
          <a href={`/paytips/${user.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Tip page
          </a>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <section className="card space-y-3 p-6 text-sm">
            <h2 className="text-lg">Details</h2>
            <dl className="space-y-2">
              {[
                ["Email confirmed", user.email_verified ? "Yes" : "No"],
                ["Identity", { none: "Not checked", pending: "Check in progress", verified: "Verified", rejected: "Rejected" }[user.identity_status]],
                ["Phone", user.phone ?? "–"],
                ["Country", user.country ?? "–"],
                ["Business", user.business ? `${user.business.name} (${user.business.code})${user.business.is_active ? "" : " – closed"}` : "–"],
                ["Bank account", user.bank_account ? `${user.bank_account.account_name}, ${user.bank_account.account_number}` : "None yet"],
                ["Received in total", money(user.tips_total)],
                ["Balance now", money(user.balance)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="text-end font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card space-y-3 p-6 text-sm">
            <h2 className="text-lg">Plan</h2>
            <p className="text-stone-600">
              {!plan.required
                ? "This account type does not need a plan."
                : plan.active
                  ? `${plan.granted ? "Free plan given by an admin" : `Paid ${plan.plan} plan`} until ${plan.ends_on}.`
                  : plan.trial_ends_on
                    ? `Free trial until ${plan.trial_ends_on}.`
                    : "No plan: cannot transfer the balance."}
            </p>
            <GrantPlanForm userId={user.id} />
            <Link href={`/admin/subscriptions?status=all&q=${encodeURIComponent(user.email)}`} className="inline-block text-sm font-semibold text-orange-600 hover:underline">
              All plans of this user
            </Link>
          </section>
        </div>
        <div className="lg:col-span-2">
          <UserFeesForm user={user} tipFee={`${settings.tip_fee_percent}% + ${money(settings.tip_fee_fixed)}`} />
        </div>
      </div>
    </>
  );
}
