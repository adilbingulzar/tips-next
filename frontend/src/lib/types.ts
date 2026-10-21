/** Shapes returned by the Laravel API (backend/app/Http/Resources). */

export type ButtonStyle = "orange" | "red" | "blue" | "light" | "dark";

export type PageMode = "review" | "tip" | "tip_and_review";

export type PaymentMethod = {
  id: number;
  name: string;
  icon: string;
  fee_percent: string;
  fee_fixed: string;
};

export type TipPage = {
  mode: PageMode;
  header: string | null;
  title: string | null;
  success_header: string | null;
  success_message: string | null;
  show_email_field: boolean;
  show_review_field: boolean;
  theme: {
    /** Full URL of the image behind the card. */
    background_image: string | null;
    /** Background of the card. */
    panel_color: string | null;
    /** Background of the whole page. */
    page_color: string | null;
    text_color: string | null;
    button_style: ButtonStyle;
    emoji_color: string | null;
    /** 0 = faces, 1 = stars. */
    emoji_type: number;
    /** How pinned reviews are shown: 1 = stacked, 2 = one per swipe, 3 = several per row. */
    review_style: number;
  };
  preset_amounts: string[];
};

export type TipOptions = {
  currency: string;
  min_amount: string;
  max_amount: string;
  payment_methods: PaymentMethod[];
};

export type Rating = { average: number; count: number };

export type PublicProfile = {
  name: string;
  slug: string;
  avatar: string | null;
  bio: string | null;
  can_receive_tips: boolean;
  page: TipPage;
  tips: TipOptions;
  rating: Rating;
  pinned_reviews: { rating: number | null; review: string }[];
};

export type PublicSpot = {
  name: string;
  slug: string;
  business: { id: number; name: string; avatar: string | null };
  can_receive_tips: boolean;
  page: TipPage;
  tips: TipOptions;
  rating: Rating;
  pinned_reviews: { rating: number | null; review: string }[];
};

export type TipQuote = {
  tip: string;
  platform_fee: string;
  method_fee: string;
  total: string;
  platform_fee_paid_by: "customer" | "recipient";
};

export type PaymentStatus =
  | "pending"
  | "paid"
  | "authorised"
  | "verify"
  | "cancelled"
  | "expired"
  | "denied"
  | "failed"
  | "refunded";

export type PublicPayment = {
  id: string;
  /** "subscription" for a plan payment: the page then links back to the plan instead of a tip page. */
  purpose: "tip" | "subscription";
  status: PaymentStatus;
  is_final: boolean;
  tip_amount: string;
  total_amount: string;
  currency: string;
  spot: { name: string; slug: string; business_id: number; business_name: string } | null;
  recipient: {
    name: string;
    slug: string;
    success_header: string | null;
    success_message: string | null;
  } | null;
};

/** The signed-in user's own account (backend UserResource). */
export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  slug: string;
  role: "user" | "admin";
  account_type: "private" | "business";
  status: "pending" | "active" | "deactivated";
  phone: string | null;
  country_code: string | null;
  country: string | null;
  birth_date: string | null;
  address: string | null;
  bio: string | null;
  avatar: string | null;
  accepts_individual_tips: boolean;
  business?: { id: number; name: string; code: string; email: string | null; address: string | null } | null;
  created_at: string | null;
};

export type PeriodTotal = { amount: string; count: number };

export type Dashboard = {
  balance: { tips: string; referrals: string; total: string };
  totals: Record<"today" | "yesterday" | "last_7_days" | "previous_7_days" | "this_week" | "last_week" | "this_month" | "last_month", PeriodTotal>;
  reviews: { today: number; yesterday: number };
  trend: { date: string; amount: string; count: number }[];
  /** Tips on the day before the first day of `trend`. */
  before_trend: string;
  weekly: { week_start: string; amount: string }[];
  rating: { average: number; count: number; distribution: Record<"1" | "2" | "3" | "4" | "5", number> };
  recent: {
    id: number;
    type: "online" | "rating";
    amount: string;
    rating: number | null;
    review: string | null;
    reviewer_name: string | null;
    spot: string | null;
    at: string | null;
  }[];
  setup: { profile: boolean; bank_account: boolean; payout_settings: boolean; tip_page: boolean; networks: boolean };
  setup_done: boolean;
  subscription_prompt: boolean;
  employments: { id: number; business_name: string; role: string | null; is_live: boolean }[];
  business: BusinessDashboard | null;
};

export type DashboardPerson = { id: number; name: string; slug: string; avatar: string | null; role: string | null; level: number | null; is_live: boolean };

export type BusinessDashboard = {
  setup: { roles: boolean; agreement: boolean; employees: boolean; roles_assigned: boolean };
  setup_done: boolean;
  tip_profiles: DashboardPerson[];
  employees: DashboardPerson[];
  reviews: { id: number; rating: number | null; review: string; reviewer_name: string | null; at: string | null }[];
};

/** A Laravel paginated resource collection. */
export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
};

export type OwnTip = {
  id: number;
  type: "online" | "rating";
  amount: string;
  currency: string;
  payment_status: PaymentStatus;
  paid_out: boolean;
  rating: number | null;
  review: string | null;
  reviewer_name: string | null;
  business?: string | null;
  spot?: string | null;
  paid_at: string | null;
  created_at: string | null;
};

export type Withdrawal = {
  id: number;
  reference: string;
  amount: string;
  fee: string;
  status: "requested" | "paid";
  requested_at: string | null;
  paid_at: string | null;
};

export type Role = { id: number; name: string; receives_tips: boolean; level: number; parent_id: number | null; members?: number };

export type Agreement = {
  id: number;
  title: string;
  content: string;
  is_for_spots: boolean;
  is_default: boolean;
  role_shares: { role_id: number; percent: number }[];
  /** Team members on this agreement (in the business's own list only). */
  employees?: number;
  created_at?: string | null;
};

export type EmployeeStatus = "pending" | "accepted" | "rejected";

export type Member = {
  id: number;
  user: { id: number; name: string; slug: string; avatar: string | null };
  role: { id: number; name: string } | null;
  agreement: { id: number; title: string } | null;
  status: EmployeeStatus;
  requested_by: "business" | "employee";
  reason: string | null;
  is_live: boolean;
  last_live_at: string | null;
  /** When the invitation or join request was made. */
  since: string | null;
};

export type Employment = {
  id: number;
  business: { id: number; name: string; code: string };
  role: string | null;
  agreement: { title: string; content: string } | null;
  status: EmployeeStatus;
  requested_by: "business" | "employee";
  reason: string | null;
  is_live: boolean;
};

export type SpotStaff = { id: number; user_id: number; name: string; role: { id: number; name: string } | null; is_live: boolean };

export type ManagedSpot = { id: number; name: string; slug: string; is_active: boolean; url: string; staff: SpotStaff[] };

export type BusinessReport = {
  total: { amount: string; count: number };
  per_member: { user_id: number; name: string; amount: string; count: number }[];
  per_spot: { spot_id: number; name: string; amount: string; count: number }[];
};

/** Where a tip goes: a person, or a spot of a business. */
export type TipTarget =
  | { kind: "person"; slug: string }
  | { kind: "spot"; businessId: number; spotSlug: string };

export type UserNotification = {
  id: number;
  type: string | null;
  audience: "user" | "business";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationList = Paginated<UserNotification> & { meta: { unread_count: number } };

export type NotificationPreference = {
  event: string;
  label: string;
  enabled: boolean;
  /** Only for ratings: the star counts to notify about; empty means all. */
  stars: number[];
};

export type WeeklyHours = Record<string, { from: string; to: string }[]>;

export type CardColors = {
  primary_background: string;
  secondary_background: string;
  primary_text: string;
  secondary_text: string;
  primary_button: string;
  secondary_button: string;
  primary_button_text: string;
  secondary_button_text: string;
  border: string;
  return_button: string;
};

/** The public business card at /vcards/{slug}. Hidden parts are null. */
export type PublicVcard = {
  name: string;
  slug: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  theme: "classic" | "custom";
  colors: CardColors;
  business: {
    name: string | null;
    logo: string | null;
    title: string | null;
    email: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    banner: string | null;
  };
  icons: { business: boolean; email: boolean; phone: boolean; address: boolean };
  links: { appointment: string | null; google_review: string | null; tickets: string | null };
  social_links: string[];
  opening_hours: WeeklyHours | null;
  can_review: boolean;
  reviews: { rating: number | null; review: string; name: string | null; date: string | null }[];
  wallets: { google: boolean; apple: boolean };
};

/** The signed-in user's own card settings. */
export type MyVcard = {
  exists: boolean;
  is_active: boolean;
  theme: 1 | 2;
  business_name: string | null;
  business_title: string | null;
  business_email: string | null;
  business_address: string | null;
  latitude: string | null;
  longitude: string | null;
  logo: string | null;
  banner: string | null;
  social_links: string[];
  appointment_url: string | null;
  google_review_url: string | null;
  ambassador_url: string | null;
  show_business_name: boolean;
  show_location: boolean;
  show_opening_hours: boolean;
  show_review: boolean;
  show_business_icon: boolean;
  show_email_icon: boolean;
  show_phone_icon: boolean;
  show_address_icon: boolean;
  colors: CardColors;
};

/** A spot the business put the signed-in user on. */
export type WorkSpot = {
  id: number;
  spot: { id: number; name: string; slug: string };
  business: { id: number; name: string };
  role: string | null;
  is_live: boolean;
  shifts: WeeklyHours;
};

export type MyReview = {
  id: number;
  rating: number | null;
  review: string;
  name: string | null;
  email: string | null;
  recipient: string | null;
  spot: string | null;
  is_pinned: boolean;
  created_at: string;
};
