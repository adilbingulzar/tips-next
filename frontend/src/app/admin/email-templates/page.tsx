import type { Metadata } from "next";
import { Suspense } from "react";

import { EmailTemplateEditor } from "@/components/admin/AdminForms";
import { PageHeader } from "@/components/app/ui";
import type { AdminEmailTemplate } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Email Template" };

export default function Page() {
  return (
    <>
      <PageHeader title="Email Template" description="The wording of every email the site sends. Placeholders are filled in when an email goes out." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Templates />
      </Suspense>
    </>
  );
}

async function Templates() {
  await requireAdmin();
  const { data } = await api<{ data: AdminEmailTemplate[] }>("/admin/email-templates", { token: await requireToken() });

  return (
    <div className="space-y-3">
      {data.map((template) => (
        <EmailTemplateEditor key={`${template.name}-${template.updated_at}`} template={template} />
      ))}
    </div>
  );
}
