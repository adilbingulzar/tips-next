import type { Metadata } from "next";
import { Suspense } from "react";

import { NewSpotForm, SpotCard } from "@/components/app/business/SpotsPage";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { businessMembers, businessRoles, businessSpots, requireBusinessOwner } from "@/lib/business";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Manage Spot" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Manage Spot"
        description="Tables, bars and terraces, each with its own QR code. Tips there are shared by the staff working at the spot."
        actions={<SpotDownloads />}
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Spots />
      </Suspense>
    </>
  );
}

async function Spots() {
  await requireBusinessOwner();
  const [spots, members, roles] = await Promise.all([businessSpots(), businessMembers(), businessRoles()]);
  const team = members.filter((member) => member.status === "accepted");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {spots.length === 0 ? (
          <EmptyState>No spots yet. Add your first table or bar.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} members={team} roles={roles} />
            ))}
          </ul>
        )}
      </div>
      <NewSpotForm />
    </div>
  );
}

/** CSV downloads: the spot list with QR addresses, and this month's tips at spots. */
async function SpotDownloads() {
  const { t } = await getI18n();
  return (
    <>
      <a href="/dashboard/spots/export" className="btn btn-outline btn-sm" download>
        {t("Download spot list")}
      </a>
      <a href="/dashboard/spots/tips-export?period=this_month" className="btn btn-outline btn-sm" download>
        {t("Download tips at spots")}
      </a>
    </>
  );
}
