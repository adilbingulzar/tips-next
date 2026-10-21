import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getI18n } from "@/lib/i18n";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default async function Page({ searchParams }: PageProps<"/register">) {
  const { t } = await getI18n();
  return (
    <AuthLayout
      title="Welcome to Digital Business Card"
      subtitle="Register your account"
      tagline={["Set up your account and start", "collecting tips today."]}
      footer={
        <>
          {t("Already have an account?")}{" "}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            {t("login")}
          </Link>
        </>
      }
    >
      <Suspense fallback={<RegisterForm />}>
        <RegisterWithReferral searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function RegisterWithReferral({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ref } = await searchParams;
  return <RegisterForm referral={typeof ref === "string" ? ref : undefined} />;
}
