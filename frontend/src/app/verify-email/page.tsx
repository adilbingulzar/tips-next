import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { logout } from "@/app/actions/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { EmailForm } from "@/components/app/SettingsForms";
import { requireUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Confirm your email" };

export default function Page() {
  return (
    <AuthLayout title="Confirm your email">
      <Suspense fallback={<p className="text-stone-500">…</p>}>
        <VerifyEmail />
      </Suspense>
    </AuthLayout>
  );
}

async function VerifyEmail() {
  const user = await requireUser();
  const { t } = await getI18n();
  if (user.email_verified) {
    redirect("/dashboard");
  }

  return (
    <>
      <p className="-mt-4 mb-6 text-stone-500">
        {t("We sent a 6-digit code to")} <strong className="text-stone-900">{user.email}</strong>. {t("Enter it below.")}
      </p>
      <VerifyEmailForm />
      <details className="mt-6 rounded-xl border border-stone-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-stone-600">{t("Use a different email address")}</summary>
        <div className="mt-4">
          <EmailForm email={user.email} compact />
        </div>
      </details>
      <form action={logout} className="mt-6 text-center">
        <button type="submit" className="text-sm font-semibold text-stone-500 hover:text-stone-900 hover:underline">
          {t("Log out")}
        </button>
      </form>
    </>
  );
}
