import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import type { Shifts } from "@/app/actions/business";
import { ShiftEditor } from "@/components/app/business/ShiftEditor";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { businessSpots, requireBusinessOwner } from "@/lib/business";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Spot shifts" };

export default function Page({ params }: PageProps<"/dashboard/spots/shifts/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <SpotShifts params={params} />
    </Suspense>
  );
}

async function SpotShifts({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getI18n();
  await requireBusinessOwner();
  const { id } = await params;
  const spots = await businessSpots();
  const spot = spots.find((candidate) => candidate.staff.some((member) => String(member.id) === id));
  const member = spot?.staff.find((candidate) => String(candidate.id) === id);

  if (!spot || !member) {
    notFound();
  }

  const { data } = await api<{ data: Shifts }>(`/me/business/spot-staff/${member.id}/shifts`, { token: await requireToken() });

  return (
    <>
      <PageHeader
        title={t("{name} at {spot}", { name: member.name, spot: spot.name })}
        description="During these hours they share in tips given at this spot."
        actions={
          <Link href="/dashboard/spots" className="btn btn-outline btn-sm">
            {t("← Spots")}
          </Link>
        }
      />
      <ShiftEditor path={`/me/business/spot-staff/${member.id}/shifts`} initial={data} />
    </>
  );
}
