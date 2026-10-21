import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { getI18n } from "@/lib/i18n";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = { title: "Set a new password" };

/** Opened from the reset email: /reset-password?token=…&email=… */
export default function Page({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthLayout title="Set a new password">
      <Suspense fallback={null}>
        <Reset searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function Reset({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token, email } = await searchParams;
  const { t } = await getI18n();

  if (typeof token !== "string" || typeof email !== "string") {
    return (
      <p className="alert alert-error">
        {t("This link is not complete.")}{" "}
        <Link href="/forgot-password" className="font-bold underline">
          {t("Request a new one")}
        </Link>
        .
      </p>
    );
  }

  return <ResetPasswordForm token={token} email={email} />;
}
