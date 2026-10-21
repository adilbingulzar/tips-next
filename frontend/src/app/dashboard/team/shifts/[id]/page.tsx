import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import type { Shifts } from "@/app/actions/business";
import { ShiftEditor } from "@/components/app/business/ShiftEditor";
import { PageHeader } from "@/components/app/ui";
import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { businessMembers, requireBusinessOwner } from "@/lib/business";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Shifts" };

export default function Page({ params }: PageProps<"/dashboard/team/shifts/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <MemberShifts params={params} />
    </Suspense>
  );
}

async function MemberShifts({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getI18n();
  await requireBusinessOwner();
  const { id } = await params;
  const member = (await businessMembers()).find((candidate) => String(candidate.id) === id && candidate.status === "accepted");

  if (!member) {
    notFound();
  }

  let shifts: Shifts;
  try {
    shifts = (await api<{ data: Shifts }>(`/me/business/employees/${member.id}/shifts`, { token: await requireToken() })).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <PageHeader
        title={t("Shifts of {name}", { name: member.user.name })}
        description="During these hours they share in team tips, even without going live."
        actions={
          <Link href="/dashboard/team" className="btn btn-outline btn-sm">
            {t("← Team")}
          </Link>
        }
      />
      <ShiftEditor path={`/me/business/employees/${member.id}/shifts`} initial={shifts} />
    </>
  );
}
