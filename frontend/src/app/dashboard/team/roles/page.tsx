import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RoleManager } from "@/components/app/business/TeamPage";
import { PageHeader } from "@/components/app/ui";
import { businessRoles, requireBusinessOwner } from "@/lib/business";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Manage Role" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader
        title="Manage Role"
        description="Create new role"
        actions={
          <Link href="/dashboard/team" className="btn btn-secondary btn-sm">
            ‹ {t("Back")}
          </Link>
        }
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Roles />
      </Suspense>
    </>
  );
}

async function Roles() {
  await requireBusinessOwner();
  return <RoleManager roles={await businessRoles()} />;
}
