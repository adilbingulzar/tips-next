import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LiveBusinessSelect } from "@/components/app/LiveBusinessSelect";
import { CircleCheck, SolidIcon, type SolidIconName } from "@/components/app/SolidIcons";
import { TipChart } from "@/components/app/TipChart";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import type { Translate } from "@/lib/i18n-shared";
import { money } from "@/lib/format";
import type { BusinessDashboard, Dashboard, DashboardPerson } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

/** Role levels as the old app named them. */
const LEVELS: Record<number, string> = { 1: "Admin", 2: "Auditor", 3: "Employee" };

type Step = { icon: SolidIconName; title: string; description: string; href: string; done: boolean };

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await requireVerifiedUser();
  const { data } = await api<{ data: Dashboard }>("/me/dashboard", { token: await requireToken() });
  const { t } = await getI18n();
  const business = data.business;

  const steps: Step[] = business
    ? [
        { icon: "userGear", title: "Management", description: "Create or setup business role", href: "/dashboard/team/roles", done: business.setup.roles },
        { icon: "fileLines", title: "Agreement", description: "Create agreement and assign sharing ratio", href: "/dashboard/agreements", done: business.setup.agreement },
        { icon: "briefcase", title: "Networks", description: "Search employee and send the request", href: "/dashboard/team", done: business.setup.employees },
        { icon: "userCheck", title: "Role Assignment", description: "Assign role to employee for business", href: "/dashboard/team", done: business.setup.roles_assigned },
      ]
    : [
        { icon: "userGear", title: "Profile Setup", description: "Update and customize your profile", href: "/dashboard/tip-page", done: data.setup.tip_page },
        { icon: "bank", title: "Bank Account", description: "Update your bank account details", href: "/dashboard/bank#bank-account", done: data.setup.bank_account },
        { icon: "briefcase", title: "Networks", description: "Search business and send the request", href: "/dashboard/work", done: data.setup.networks },
        { icon: "money", title: "Payout Settings", description: "Set payout duration and tax deduction", href: "/dashboard/bank#payout-settings", done: data.setup.payout_settings },
      ];
  const setupDone = business ? business.setup_done : data.setup_done;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Total review and tips"
        actions={!business && data.employments.length > 0 ? <LiveBusinessSelect employments={data.employments} /> : undefined}
      />

      {user.status === "deactivated" && (
        <div className="alert alert-warning mb-6">
          <span className="flex-1">{t("Your account is temporarily deactivated. please activate")}</span>
          <Link href="/dashboard/account" className="font-bold underline">
            {t("Account")}
          </Link>
        </div>
      )}

      {data.subscription_prompt && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-orange-500 to-orange-600 p-5 text-white shadow-lg shadow-orange-500/25">
          <p className="font-semibold">{t("Select best subscription plan for you")}</p>
          <Link href="/dashboard/plan" className="btn btn-pill bg-white text-[#ea580c] hover:bg-[#fff7ed]">
            {t("Get Subscription")}
          </Link>
        </div>
      )}

      {setupDone ? <Figures data={data} t={t} /> : <Checklist steps={steps} title={business ? "Setup your business in just four steps" : "Set up your profile and start receiving tips"} t={t} />}

      {business && <StaffLists business={business} t={t} />}
    </>
  );
}

function Checklist({ steps, title, t }: { steps: Step[]; title: string; t: Translate }) {
  const next = steps.find((step) => !step.done);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">{t(title)}</h2>
        </div>
        <ul className="divide-y divide-stone-100">
          {steps.map((step) => (
            <li key={step.title} className="flex items-start gap-4 p-5">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${step.done ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                <SolidIcon name={step.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold text-stone-900">
                  {t(step.title)}
                  {step.done && (
                    <span className="text-emerald-500">
                      <CircleCheck />
                      <span className="sr-only">{t("Done")}</span>
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-stone-500">{t(step.description)}</p>
              </div>
              <Link href={step.href} className={`btn btn-sm btn-pill shrink-0 ${step.done ? "btn-secondary" : "btn-primary"}`}>
                {t("Setup")}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {next && (
        <Link
          href={next.href}
          className="group grid place-items-center rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 p-10 text-center text-white shadow-lg shadow-orange-500/25 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <SolidIcon name={next.icon} className="mx-auto mb-4 h-11 w-11" />
            <p className="text-xl font-bold">{t(next.title)}</p>
            <p className="mt-1 text-white/80">{t(next.description)}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-bold underline-offset-4 group-hover:underline">
              {t("Setup")} <SolidIcon name="arrowRight" className="h-4 w-4 rtl:rotate-180" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

/** Old-style percentage: this period as a share of the previous one. */
function percentOf(current: string, previous: string): number {
  return Number(previous) > 0 ? Math.round((Number(current) / Number(previous)) * 100) : 0;
}

function Caret({ up, className = "" }: { up: boolean; className?: string }) {
  return <SolidIcon name={up ? "caretUp" : "caretDown"} className={`h-4 w-4 ${up ? "text-emerald-500" : "text-red-500"} ${className}`} />;
}

function Figures({ data, t }: { data: Dashboard; t: Translate }) {
  const { totals } = data;
  const weekUp = Number(totals.this_week.amount) >= Number(totals.last_week.amount);
  const monthUp = Number(totals.this_month.amount) >= Number(totals.last_month.amount);
  const weekPercent = percentOf(totals.this_week.amount, totals.last_week.amount);
  const ratingTotal = data.rating.count;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat">
          <p className="stat-label">{t("Today")}</p>
          <p className="stat-value">{money(totals.today.amount)}</p>
          <p className="mt-2 text-sm text-stone-500">
            {t("Review")} <span className="badge badge-neutral ms-1">{data.reviews.today}</span>
          </p>
        </div>
        <div className="stat">
          <p className="stat-label">{t("Yesterday")}</p>
          <p className="stat-value">{money(totals.yesterday.amount)}</p>
          <p className="mt-2 text-sm text-stone-500">
            {t("Review")} <span className="badge badge-neutral ms-1">{data.reviews.yesterday}</span>
          </p>
        </div>
        <div className="stat">
          <p className="stat-label">{t("Trend")}</p>
          <p className="stat-value flex items-center gap-2">
            {weekPercent}% <Caret up={weekUp} />
          </p>
          <p className="text-sm text-stone-500">{t(weekUp ? "This week increased" : "This week dropped")}</p>
          <p className="mt-3 flex items-center gap-2 text-xl font-bold text-stone-900">
            {percentOf(totals.this_month.amount, totals.last_month.amount)}% <Caret up={monthUp} />
          </p>
          <p className="text-sm text-stone-500">{t(monthUp ? "This month increased" : "This month dropped")}</p>
        </div>
        <div className="stat">
          <p className="stat-label">{t("Balance")}</p>
          <p className="stat-value">{money(data.balance.total)}</p>
          <p className="mt-2 text-sm text-stone-500">
            {t("Referral rewards")} <span className="badge badge-primary ms-1">{money(data.balance.referrals)}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
        {data.business ? <ServiceReviews reviews={data.business.reviews} t={t} /> : <TipChart daily={data.trend} weekly={data.weekly} today={totals.today.amount} />}

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t("Weekly Perform")}</h2>
            <span className="badge badge-primary">{weekPercent}%</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {data.trend.map((day, index) => {
              const previous = index === 0 ? data.before_trend : data.trend[index - 1]!.amount;
              return (
                <li key={day.date} className="flex items-center justify-between px-6 py-3 text-sm">
                  <span className="text-stone-600">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-2 font-bold text-stone-900">
                    {money(day.amount)} <Caret up={Number(day.amount) >= Number(previous)} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              {t("Reviews")} ({ratingTotal})
            </h2>
            <span className="flex items-center gap-1 text-xl font-bold text-stone-900">
              <SolidIcon name="star" className="h-4 w-4 text-orange-500" />
              {data.rating.average}
              <span className="text-sm font-medium text-stone-400">{t("out of 5")}</span>
            </span>
          </div>
          <ul className="card-body space-y-3">
            {(["5", "4", "3", "2", "1"] as const).map((stars) => {
              const count = data.rating.distribution[stars] ?? 0;
              const percent = ratingTotal > 0 ? Math.round((count / ratingTotal) * 100) : 0;
              return (
                <li key={stars} className="flex items-center gap-3">
                  <span className="flex w-12 shrink-0 items-center gap-1 text-sm font-semibold text-stone-600">
                    {stars} <SolidIcon name="star" className="h-3 w-3 text-stone-300" />
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                  <span className="w-8 shrink-0 text-end text-sm text-stone-500">{count}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}

function NoData({ t }: { t: Translate }) {
  return (
    <div className="card-body flex flex-col items-center gap-2 py-10 text-stone-400">
      <SolidIcon name="database" className="h-8 w-8" />
      <p className="text-sm">{t("Sorry, no data found!")}</p>
    </div>
  );
}

function ServiceReviews({ reviews, t }: { reviews: BusinessDashboard["reviews"]; t: Translate }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">{t("Service Review")}</h2>
        <Link href="/dashboard/reviews" className="btn btn-secondary btn-sm">
          {t("View All")}
        </Link>
      </div>
      {reviews.length === 0 ? (
        <NoData t={t} />
      ) : (
        <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
          {reviews.map((review) => (
            <li key={review.id} className="flex items-start gap-3 px-6 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- static placeholder, as in the old app */}
              <img src="/images/user-image.jpg" alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-900">{review.reviewer_name || t("Anonymous")}</p>
                <p className="line-clamp-2 text-sm text-stone-500">{review.review}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex gap-0.5" aria-label={t("{count} of 5 stars", { count: review.rating ?? 0 })}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <SolidIcon key={star} name="star" className={`h-3 w-3 ${star <= (review.rating ?? 0) ? "text-amber-400" : "text-stone-200"}`} />
                    ))}
                  </span>
                  {review.at && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <SolidIcon name="clock" className="h-3 w-3" />
                      {new Date(review.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" })}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PersonRow({ person, t, children }: { person: DashboardPerson; t: Translate; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <span className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- photos come from the API or the old app's domain */}
        <img src={person.avatar ?? "/images/user-image.jpg"} alt="" className="h-10 w-10 rounded-full bg-stone-200 object-cover" />
        {person.is_live && <span className="absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" title={t("online")} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-stone-900 capitalize">{person.name}</p>
        <p className="truncate text-sm text-stone-500">{person.role ? `${t(person.role)} (${t(LEVELS[person.level ?? 3] ?? "Employee")})` : `(${t("Not Set")})`}</p>
      </div>
      {children}
    </li>
  );
}

function StaffLists({ business, t }: { business: BusinessDashboard; t: Translate }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">{t("Tip User Profiles")}</h2>
        </div>
        {business.tip_profiles.length === 0 ? (
          <NoData t={t} />
        ) : (
          <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
            {business.tip_profiles.map((person) => (
              <PersonRow key={person.id} person={person} t={t}>
                <a href={`/review/${person.slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm shrink-0">
                  {t("Tip Profile")}
                </a>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">{t("Business Employee")}</h2>
          <Link href="/dashboard/team" className="btn btn-secondary btn-sm">
            {t("View All")}
          </Link>
        </div>
        {business.employees.length === 0 ? (
          <NoData t={t} />
        ) : (
          <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
            {business.employees.map((person) => (
              <PersonRow key={person.id} person={person} t={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-10 w-56 animate-pulse rounded-full bg-stone-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-stone-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}
