import type { Paginated } from "./types";

/** Shapes returned by the admin API (/api/v1/admin/...). */

export type AdminDashboard = {
  users: { total: number; business: number; new_this_month: number };
  tips: { total: string; count: number; this_month: string };
  platform_fees: { total: string; this_month: string };
  payouts: { open_count: number; open_amount: string; paid_this_month: string; fees_total: string };
  subscriptions_active: number;
  visits_last_30_days: number;
};

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  slug: string;
  account_type: "private" | "business";
  role: "user" | "admin";
  status: "pending" | "active";
  tips_total: string;
  tips_count: number;
  created_at: string;
  /** End date of the plan running today, if any. */
  plan_ends_on?: string | null;
};

export type FeeRate = { percent: string; fixed: string } | null;

export type SubscriptionInfo = {
  required: boolean;
  active: boolean;
  allows_payout: boolean;
  trial_ends_on: string | null;
  plan: string | null;
  ends_on: string | null;
  granted: boolean;
  prices: { monthly: string; yearly: string };
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  slug: string;
  phone: string | null;
  country: string | null;
  account_type: "private" | "business";
  role: "user" | "admin";
  status: "pending" | "active";
  business: { id: number; name: string; code: string; is_active: boolean } | null;
  bank_account: { account_name: string; bank_name: string; account_number: string } | null;
  balance: string;
  tips_total: string;
  fees: { tip: FeeRate; payout: Record<"manual" | "daily" | "weekly" | "monthly", FeeRate> };
  default_fees: { payout: Record<string, { percent: string; fixed: string }> };
  subscription: SubscriptionInfo;
  identity_status: "none" | "pending" | "verified" | "rejected";
  created_at: string;
};

export type AdminPayout = {
  id: number;
  reference: string;
  user: { id: number; name: string | null; email: string | null };
  bank_account: { account_name: string; account_number: string } | null;
  amount: string;
  fee: string;
  status: "requested" | "paid";
  requested_at: string | null;
  paid_at: string | null;
};

export type AdminPayoutList = Paginated<AdminPayout> & { meta: { totals: { amount: string; fee: string } } };

export type AdminFee = {
  id: number;
  user: { id: number; name: string; email: string } | null;
  business: string | null;
  spot: string | null;
  paid_by: "customer" | "recipient";
  tip_amount: string;
  fee_amount: string;
  created_at: string;
};

export type AdminFeeList = Paginated<AdminFee> & { meta: { totals: { tips: string; fees: string; count: number } } };

export type AdminSubscription = {
  id: number;
  user: { id: number; name: string; email: string } | null;
  plan: string;
  amount: string;
  payment_status: string;
  granted: boolean;
  is_active: boolean;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
};

export type AdminSettings = {
  tip_fee_percent: string;
  tip_fee_fixed: string;
  user_subscription_required: boolean;
  business_subscription_required: boolean;
  user_plan_monthly: string;
  user_plan_yearly: string;
  business_plan_monthly: string;
  business_plan_yearly: string;
  free_trial_days: number;
  support_url: string | null;
  support_email: string | null;
  terms_and_conditions: string | null;
  payout_debtor_name: string | null;
  payout_debtor_iban: string | null;
  payout_debtor_bic: string | null;
};

export type AdminTranslation = { key: string; group: string | null; source: string; text: string | null };

export type AdminTranslationList = Paginated<AdminTranslation> & { meta: { locale: string; locales: string[] } };

export type AdminEmailTemplate = {
  name: string;
  label: string;
  placeholders: string[];
  subject: string;
  html: string;
  is_custom: boolean;
  updated_at: string | null;
};

export type AdminVisit = { id: number; page_type: string; page_url: string; ip_address: string | null; completed: boolean; created_at: string };

export type AdminVisitList = Paginated<AdminVisit> & { meta: { by_type: Record<string, number> } };

export type AdminSms = {
  id: number;
  to: string;
  user: string | null;
  sent_by: string | null;
  purpose: "verification" | "password_reset" | "admin";
  message: string;
  status: "queued" | "sent" | "logged" | "failed";
  error: string | null;
  created_at: string;
};

export type AdminBusiness = { id: number; name: string; code: string; owner: { id: number; name: string; email: string } | null; team_size: number; is_active: boolean };
