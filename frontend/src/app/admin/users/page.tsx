import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import type { AdminUserRow } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";
import type { Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Users" };

export default function Page({ searchParams }: PageProps<"/admin/users">) {
  return (
    <>
      <PageHeader title="Users" description="Everyone with an account, with the tips they received." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Users searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Users({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "q", "type", "sort"]);
  const users = await api<Paginated<AdminUserRow>>("/admin/users", { token: await requireToken(), query });

  return (
    <>
      <form method="get" className="mb-6 flex flex-wrap items-end gap-2">
        <input name="q" defaultValue={query.q ?? ""} placeholder="Name, email or page name" aria-label="Search" className="input max-w-xs" />
        <select name="type" defaultValue={query.type ?? ""} aria-label="Account type" className="input w-auto">
          <option value="">All accounts</option>
          <option value="private">Personal</option>
          <option value="business">Business</option>
        </select>
        <select name="sort" defaultValue={query.sort ?? "newest"} aria-label="Sort" className="input w-auto">
          <option value="newest">Newest first</option>
          <option value="tips">Most tips first</option>
        </select>
        <button type="submit" className="btn btn-outline">
          Show
        </button>
      </form>

      {users.data.length === 0 ? (
        <EmptyState>No users found.</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-end">Tips</th>
                <th className="px-4 py-3 text-end">Received</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="font-bold text-stone-900 hover:underline">
                      {user.name}
                    </Link>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {user.account_type === "business" ? "Business" : "Personal"}
                    {user.role === "admin" && <span className="ms-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">Admin</span>}
                    {user.status === "pending" && <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">Unconfirmed</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(user.created_at)}</td>
                  <td className="px-4 py-3 text-end text-stone-600">{user.tips_count}</td>
                  <td className="px-4 py-3 text-end font-bold text-stone-900">{money(user.tips_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={users.meta.current_page} lastPage={users.meta.last_page} basePath="/admin/users" query={query} />
    </>
  );
}
