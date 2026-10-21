import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Photo and background uploads go through server actions; the API accepts up to 5 MB per image.
      bodySizeLimit: "6mb",
    },
  },
  // This folder is the project root. Without this, Next.js can pick a parent folder that has
  // its own lockfile (as on the dev server) and write build files in the wrong place.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  /** Old app URLs that are bookmarked or linked in emails keep working. */
  async redirects() {
    return [
      { source: "/signup", destination: "/register", permanent: true },
      { source: "/signup/referral/:code", destination: "/register?ref=:code", permanent: true },
      { source: "/recovery", destination: "/forgot-password", permanent: true },
      { source: "/confirm/account/email", destination: "/verify-email", permanent: true },
      { source: "/paytips/thank-you", destination: "/paytips/thanks-review", permanent: true },
      { source: "/cards/downloadvcf/:slug", destination: "/vcards/:slug/vcf", permanent: true },
      { source: "/vcardsettings", destination: "/dashboard/vcard", permanent: true },
      // Pages of the old signed-in area, for bookmarks and links in old emails.
      { source: "/tipreport", destination: "/dashboard/tips", permanent: true },
      { source: "/statement", destination: "/dashboard/statement", permanent: true },
      { source: "/bankdetails", destination: "/dashboard/bank", permanent: true },
      { source: "/bank_account", destination: "/dashboard/bank", permanent: true },
      { source: "/profile", destination: "/dashboard/profile", permanent: true },
      { source: "/editprofile", destination: "/dashboard/tip-page", permanent: true },
      { source: "/notification", destination: "/dashboard/notifications", permanent: true },
      { source: "/notifysettings", destination: "/dashboard/notification-settings", permanent: true },
      { source: "/settings", destination: "/dashboard/settings", permanent: true },
      { source: "/account", destination: "/dashboard/account", permanent: true },
      { source: "/businessqr", destination: "/dashboard/qr", permanent: true },
      { source: "/employee", destination: "/dashboard/team", permanent: true },
      { source: "/agreement", destination: "/dashboard/agreements", permanent: true },
      { source: "/createspot", destination: "/dashboard/spots", permanent: true },
      { source: "/business_spot", destination: "/dashboard/spots", permanent: true },
      { source: "/spotcollection", destination: "/dashboard/spots", permanent: true },
      { source: "/managespot", destination: "/dashboard/work", permanent: true },
      { source: "/spotfortask", destination: "/dashboard/work", permanent: true },
      { source: "/invitations", destination: "/dashboard/work", permanent: true },
      { source: "/servicereview", destination: "/dashboard/reviews", permanent: true },
      { source: "/getsubscription/:option*", destination: "/dashboard/plan", permanent: true },
      { source: "/servicereview/widgetsetting", destination: "/dashboard/widget", permanent: true },
      { source: "/managespot/tipcollection", destination: "/dashboard/team/report", permanent: true },
      { source: "/getpayment", destination: "/dashboard/payouts", permanent: true },
      { source: "/verification", destination: "/dashboard/verification", permanent: true },
    ];
  },
};

export default nextConfig;
