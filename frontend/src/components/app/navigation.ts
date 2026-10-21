/**
 * Main menu, matching the old app's sidebar (application/views/template/tw_app_nav.php):
 * the same groups, order, labels and icons. Labels are English texts and are translated.
 */

export type NavIcon =
  | "house"
  | "star"
  | "user"
  | "badge"
  | "euro"
  | "briefcase"
  | "money"
  | "bell"
  | "shield"
  | "sliders"
  | "gears"
  | "card";

export type NavChild = { label: string; href: string; external?: boolean };

export type NavItem = {
  label: string;
  icon: NavIcon;
  href?: string;
  children?: NavChild[];
  /** Small warning dot, e.g. while the profile is not set up. */
  alert?: boolean;
};

export type NavContext = {
  isBusiness: boolean;
  isAdmin: boolean;
  /** Public page name, for the "Tip Profile" link. */
  slug: string | null;
  showSubscription: boolean;
  setupIncomplete: boolean;
};

export function buildNav({ isBusiness, isAdmin, slug, showSubscription, setupIncomplete }: NavContext): NavItem[] {
  const business: NavChild[] = isBusiness
    ? [
        { label: "Employee", href: "/dashboard/team" },
        { label: "Agreement", href: "/dashboard/agreements" },
        { label: "Spot Report", href: "/dashboard/team/report" },
        { label: "Tip Report", href: "/dashboard/tips" },
        { label: "Profile QR", href: "/dashboard/qr" },
        { label: "Manage spot", href: "/dashboard/spots" },
      ]
    : [
        { label: "Join Business", href: "/dashboard/work" },
        { label: "Profile QR", href: "/dashboard/qr" },
        { label: "Tip Report", href: "/dashboard/tips" },
        { label: "Manage spot", href: "/dashboard/work#spots" },
      ];

  const reviews: NavChild[] = [{ label: "Reviews", href: "/dashboard/reviews" }];
  if (isBusiness) {
    reviews.push({ label: "Widgets", href: "/dashboard/widget" });
  }

  const finance: NavChild[] = isBusiness
    ? [
        { label: "Payment", href: "/dashboard/payouts" },
        { label: "Bank", href: "/dashboard/bank" },
        { label: "Statement", href: "/dashboard/statement" },
      ]
    : [
        { label: "Bank", href: "/dashboard/bank" },
        { label: "Payment", href: "/dashboard/payouts" },
      ];

  const profile: NavChild[] = [
    { label: "Profile Details", href: "/dashboard/profile" },
    { label: "Tip Settings", href: "/dashboard/tip-page" },
    { label: "Cards Settings", href: "/dashboard/vcard" },
  ];
  if (slug) {
    profile.push({ label: "Tip Profile", href: `/paytips/${slug}`, external: true });
  }

  const nav: NavItem[] = [
    { label: "Home", icon: "house", href: "/dashboard", alert: setupIncomplete },
    { label: "Reviews", icon: "star", children: reviews },
    { label: "Profile", icon: "user", children: profile },
    { label: "Account", icon: "badge", href: "/dashboard/account" },
    { label: "Finance", icon: "euro", children: finance },
    { label: "Business", icon: "briefcase", children: business },
  ];

  if (showSubscription) {
    nav.push({ label: "Subscription", icon: "money", href: "/dashboard/plan" });
  }

  nav.push({
    label: "Notification",
    icon: "bell",
    children: [
      { label: "Notification", href: "/dashboard/notifications" },
      { label: "Settings", href: "/dashboard/notification-settings" },
    ],
  });

  if (isAdmin) {
    nav.push(
      {
        label: "Administration",
        icon: "shield",
        children: [
          { label: "Overview", href: "/admin" },
          { label: "Payout", href: "/admin/payouts" },
          { label: "Bank Payout", href: "/admin/settings#payout-account" },
          { label: "User Fees", href: "/admin/users" },
          { label: "Service Fees", href: "/admin/fees" },
          { label: "Subscription", href: "/admin/subscriptions" },
          { label: "Tip Counter", href: "/admin/users?sort=tips" },
        ],
      },
      {
        label: "System",
        icon: "sliders",
        children: [
          { label: "Translation", href: "/admin/translations" },
          { label: "Email Template", href: "/admin/email-templates" },
          { label: "Compose SMS", href: "/admin/sms" },
          { label: "SMS Report", href: "/admin/sms#report" },
          { label: "Visitor Logs", href: "/admin/visitors" },
          { label: "Auto Signup", href: "/admin/import" },
          { label: "App Settings", href: "/admin/settings" },
        ],
      },
    );
  }

  nav.push({ label: "Settings", icon: "gears", href: "/dashboard/settings" }, { label: "Verification", icon: "card", href: "/dashboard/verification" });

  return nav;
}
