import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { InviteForm, JoinRequest, TeamList } from "@/components/app/business/TeamPage";
import { InvitationLinkButton } from "@/components/app/PayoutForms";
import { PageHeader } from "@/components/app/ui";
import { businessAgreements, businessMembers, businessRoles, requireBusinessOwner } from "@/lib/business";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Employee" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  const { t } = await getI18n();
  const owner = await requireBusinessOwner();
  const [members, roles, agreements] = await Promise.all([businessMembers(), businessRoles(), businessAgreements()]);
  const requests = members.filter((member) => member.status === "pending" && member.requested_by === "employee");

  const invitation = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/register?ref=${encodeURIComponent(owner.slug)}`;

  return (
    <>
      <PageHeader
        title="Employee"
        description="Search and send request"
        actions={
          <>
            <InvitationLinkButton link={invitation} />
            <Link href="/dashboard/team/roles" className="btn btn-primary btn-sm btn-pill">
              ＋ {t("Create Role")}
            </Link>
          </>
        }
      />
      <p className="mb-4 text-sm text-stone-500">{t("People join with business code {code}.", { code: owner.business?.code ?? "" })}</p>

      {requests.length > 0 && (
        <section className="card mb-6 border-amber-200 bg-amber-50/50 px-6">
          <h2 className="pt-5 text-lg">{t("Join requests")}</h2>
          <ul className="divide-y divide-amber-100">
            {requests.map((member) => (
              <JoinRequest key={member.id} member={member} roles={roles} />
            ))}
          </ul>
        </section>
      )}

      <InviteForm roles={roles} agreements={agreements} />
      <TeamList members={members} roles={roles} agreements={agreements} />
    </>
  );
}
