/** How the old app named and showed payment methods. */

const LABELS: Record<string, string> = {
  ideal: "Ideal Payment",
  "credit-card": "Credit Card Payment",
  bancontact: "Bancontact Payment",
  giropay: "Giro Payment",
  payconiq: "Payconiq Payment",
};

/** Logos the old app showed; the other methods use Pay.nl's own logos. */
const LOGOS: Record<string, string> = {
  ideal: "/images/pay/ideal.png",
  "credit-card": "/images/pay/credit-card.png",
  bancontact: "/images/pay/bancontact.png",
  giropay: "/images/pay/giropay.png",
  payconiq: "/images/pay/payconiq.png",
  paypal: "/images/pay/paypal.png",
};

type Method = { id: number; name: string; icon: string };

export function methodLabel(method: Method): string {
  return LABELS[method.icon] ?? method.name;
}

export function methodLogo(method: Method): string {
  return LOGOS[method.icon] ?? `https://static.pay.nl/payment_profiles/100x100/${method.id}.png`;
}
