import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getI18n } from "@/lib/i18n";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { t } = await getI18n();
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to your account"
      footer={
        <>
          {t("Don't have an account?")}{" "}
          <Link href="/register" className="font-bold text-orange-600 hover:underline">
            {t("Join free today")}
          </Link>
        </>
      }
    >
      <Suspense fallback={<LoginForm />}>
        <LoginWithParams searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function LoginWithParams({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice = params.reset === "1" ? "Your password was changed. You can log in now." : params.deleted === "1" ? "Your account was deleted." : undefined;
  // Set by /login/sso when a login from itsmycontact.info fails and that site has no page to return to.
  const error = typeof params.sso_error === "string" ? params.sso_error.slice(0, 200) : undefined;

  return <LoginForm next={next} notice={notice} error={error} />;
}
