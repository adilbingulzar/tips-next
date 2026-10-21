import type { Metadata } from "next";
import { Suspense } from "react";

import { ImportForm } from "@/components/admin/AdminForms";
import { PageHeader, plainQuery } from "@/components/app/ui";
import type { AdminBusiness } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import type { Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Auto User Signup" };

export default function Page({ searchParams }: PageProps<"/admin/import">) {
  return (
    <>
      <PageHeader title="Auto User Signup" description="Create accounts for a list of people, each with a business card, optionally in one business." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Import searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Import({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["q"]);
  const businesses = query.q ? (await api<Paginated<AdminBusiness>>("/admin/businesses", { token: await requireToken(), query })).data : [];

  return <ImportForm businesses={businesses} query={query.q ?? ""} />;
}
