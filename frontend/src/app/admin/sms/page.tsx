import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SmsForm } from "@/components/admin/AdminForms";
import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import type { AdminSms } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import type { Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Promotional / Offer SMS" };

const STATUS: Record<AdminSms["status"], string> = {
  queued: "bg-amber-100 text-amber-800",
  sent: "bg-emerald-100 text-emerald-700",
  logged: "bg-stone-100 text-stone-600",
  failed: "bg-red-100 text-red-700",
};

export default function Page({ searchParams }: PageProps<"/admin/sms">) {
  return (
    <>
      <PageHeader title="Promotional / Offer SMS" description="Send a message, and see every message the site sent. “Logged” means no SMS gateway is set up yet." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Sms searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Sms({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "purpose", "status"]);
  const messages = await api<Paginated<AdminSms>>("/admin/sms", { token: await requireToken(), query });
  const chip = (active: boolean) => `tab ${active ? "tab-active" : ""}`;

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div>
        <SmsForm />
      </div>
      <div className="space-y-4 xl:col-span-2">
        <nav aria-label="Filter messages" className="tabs">
          {[
            ["", "All"],
            ["admin", "Written by admins"],
            ["verification", "Codes"],
            ["password_reset", "Password resets"],
          ].map(([value, label]) => (
            <Link key={value} href={value ? `/admin/sms?purpose=${value}` : "/admin/sms"} className={chip((query.purpose ?? "") === value)}>
              {label}
            </Link>
          ))}
        </nav>
        {messages.data.length === 0 ? (
          <EmptyState>No messages yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-stone-100 card">
            {messages.data.map((sms) => (
              <li key={sms.id} className="space-y-1 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-stone-900">
                    {sms.to}
                    {sms.user && <span className="ms-2 font-normal text-stone-500">{sms.user}</span>}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[sms.status]}`}>{sms.status}</span>
                </div>
                <p className="break-words text-stone-700">{sms.message}</p>
                <p className="text-xs text-stone-500">
                  {dateTime(sms.created_at)}
                  {sms.sent_by ? ` · by ${sms.sent_by}` : ""}
                  {sms.error ? ` · ${sms.error}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={messages.meta.current_page} lastPage={messages.meta.last_page} basePath="/admin/sms" query={query} />
      </div>
    </div>
  );
}
