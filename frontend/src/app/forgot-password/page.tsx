import type { Metadata } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/PasswordForms";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Forgot password" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthLayout
      title="Password recovery"
      subtitle="Submit your email id here, We will send you password recovery link on your email"
      tagline={["Locked out? We will get you", "back in a moment."]}
      footer={
        <span className="block space-y-1">
          <span className="block">
            {t("Remembered it?")}{" "}
            <Link href="/login" className="font-bold text-orange-600 hover:underline">
              {t("login")}
            </Link>
          </span>
          <span className="block">
            {t("Don't have an account?")}{" "}
            <Link href="/register" className="font-bold text-orange-600 hover:underline">
              {t("Join free today")}
            </Link>
          </span>
        </span>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
