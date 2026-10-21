import type { Metadata } from "next";
import { Suspense } from "react";

import { EmploymentList, JoinBusinessForm } from "@/components/app/business/WorkPage";
import { WorkSpots } from "@/components/app/business/WorkSpots";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import type { Employment, WorkSpot } from "@/lib/types";

export const metadata: Metadata = { title: "Join Business" };

/** The old "Join Business" page; the spots the user works at follow ("Manage spot" in the menu). */
export default function Page() {
  return (
    <>
      <PageHeader title="Manage" description="Search and join business e.g. BIZ12354123" />
      <JoinBusinessForm />
      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Work />
      </Suspense>
    </>
  );
}

async function Work() {
  await requireVerifiedUser();
  const token = await requireToken();
  const [{ data }, { data: spots }] = await Promise.all([api<{ data: Employment[] }>("/me/employments", { token }), api<{ data: WorkSpot[] }>("/me/spots", { token })]);

  return (
    <>
      <EmploymentList employments={data} />
      <div className="mt-8">
        <WorkSpots spots={spots} />
      </div>
    </>
  );
}
