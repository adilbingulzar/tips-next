"use client";

import { type ReactNode, useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { removeVcardImage, updateVcard, uploadVcardImage } from "@/app/actions/vcard";
import { useT } from "@/components/i18n/I18nProvider";
import type { CardColors, MyVcard, WeeklyHours } from "@/lib/types";

import { ShiftEditor } from "./business/ShiftEditor";
import { Feedback } from "./forms";
import { SolidIcon, type SolidIconName } from "./SolidIcons";

const COLOR_GROUPS: { title?: string; fields: { key: keyof CardColors; label: string }[] }[] = [
  {
    fields: [
      { key: "primary_background", label: "Primary Color" },
      { key: "secondary_background", label: "Secondary Color" },
      { key: "primary_text", label: "Primary Text Color" },
      { key: "secondary_text", label: "Secondary Text Color" },
    ],
  },
  {
    title: "Button Settings",
    fields: [
      { key: "primary_button", label: "Primary Button Color" },
      { key: "secondary_button", label: "Secondary Button Color" },
      { key: "primary_button_text", label: "Primary Button Text Color" },
      { key: "secondary_button_text", label: "Secondary Button Text Color" },
    ],
  },
  {
    title: "Border and Ratings",
    fields: [
      { key: "border", label: "Primary Border Color" },
      { key: "return_button", label: "Ratings Color" },
    ],
  },
];

const MAX_SOCIAL_LINKS = 10;

function Card({ icon, title, children }: { icon?: SolidIconName; title?: string; children: ReactNode }) {
  const t = useT();
  return (
    <section className="card">
      {title && (
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2">
            {icon && <SolidIcon name={icon} className="h-5 w-5 text-orange-500" />}
            {t(title)}
          </h2>
        </div>
      )}
      <div className="card-body space-y-4">{children}</div>
    </section>
  );
}

function Switch({ label, name, checked, onChange, form }: { label: string; name: string; checked: boolean; onChange: (value: boolean) => void; form?: string }) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-3">
      <span className="text-sm font-semibold text-stone-700">{t(label)}</span>
      <input type="checkbox" name={name} form={form} checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-orange-500 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
    </label>
  );
}

function TextInput({ state, name, label, ...input }: { state: FormState; name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const t = useT();
  const error = state.errors?.[name]?.[0];
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {t(label)}
      </label>
      <input id={name} name={name} className="input" aria-invalid={Boolean(error)} {...input} />
      {error && <p className="field-error">{t(error)}</p>}
    </div>
  );
}

/** Uploads straight away; used for the logo and the custom background. */
function useImageUpload(type: "logo" | "banner", initial: string | null, onSaved: () => void) {
  const [image, setImage] = useState(initial);
  const [message, setMessage] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    const body = new FormData();
    body.set("image", file);
    startTransition(async () => {
      const result = await uploadVcardImage(type, {}, body);
      setMessage(result);
      if (result.success) {
        setImage(URL.createObjectURL(file));
        onSaved();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeVcardImage(type);
      setMessage(result);
      if (result.success) {
        setImage(null);
        onSaved();
      }
    });
  }

  return { image, message, pending, upload, remove };
}

/**
 * The old "Card Settings" page: theme, card info, background, location,
 * status and links, and business hours on the left; a live preview of the
 * card and the wallet buttons on the right.
 */
export function VcardSettings({ card, hours, slug, bio }: { card: MyVcard; hours: WeeklyHours; slug: string; bio: string | null }) {
  const t = useT();
  const [preview, setPreview] = useState(0);
  const reloadPreview = () => setPreview((count) => count + 1);
  const [state, action, saving] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await updateVcard(previous, formData);
    if (result.success) {
      reloadPreview();
    }
    return result;
  }, {});
  const [theme, setTheme] = useState<number>(card.theme);
  const [customise, setCustomise] = useState(false);
  const [showName, setShowName] = useState(card.show_business_name);
  const [showLocation, setShowLocation] = useState(card.show_location);
  const [address, setAddress] = useState(card.business_address ?? "");
  const [showHours, setShowHours] = useState(card.show_opening_hours);
  const [editHours, setEditHours] = useState(false);
  const [icons, setIcons] = useState({ show_email_icon: card.show_email_icon, show_phone_icon: card.show_phone_icon, show_business_icon: card.show_business_icon, show_address_icon: card.show_address_icon });
  const [active, setActive] = useState(card.is_active);
  const [showReview, setShowReview] = useState(card.show_review);
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<string[]>(card.social_links.length > 0 ? card.social_links : [""]);
  const logo = useImageUpload("logo", card.logo, reloadPreview);
  const banner = useImageUpload("banner", card.banner, reloadPreview);
  const socialError = Object.entries(state.errors ?? {}).find(([key]) => key.startsWith("social_links"))?.[1]?.[0];
  const colorError = Object.entries(state.errors ?? {}).find(([key]) => key.startsWith("colors"))?.[1]?.[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <form id="vcard-form" action={action} className="space-y-6">
          <Card icon="money" title="Card Theme">
            <div className="field">
              <label className="label" htmlFor="theme">
                {t("Card Theme")}
              </label>
              <select id="theme" name="theme" value={theme} onChange={(event) => setTheme(Number(event.target.value))} className="input">
                <option value={1}>{t("Yellow Black")}</option>
                <option value={2}>{t("Black White Custom")}</option>
              </select>
            </div>
            {theme === 2 && (
              <div>
                <button type="button" aria-expanded={customise} onClick={() => setCustomise(!customise)} className="btn btn-secondary btn-block justify-between">
                  {t("Customize theme")}
                  <span aria-hidden="true">{customise ? "▴" : "▾"}</span>
                </button>
                <div hidden={!customise} className="mt-4 space-y-4">
                  {COLOR_GROUPS.map((group, index) => (
                    <div key={index} className="space-y-3">
                      {group.title && <h3 className="text-sm">{t(group.title)}</h3>}
                      <div className="grid grid-cols-2 gap-3">
                        {group.fields.map((field) => (
                          <label key={field.key} className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                            <input type="color" name={`color_${field.key}`} defaultValue={card.colors[field.key]} className="h-9 w-12 shrink-0 cursor-pointer rounded border border-stone-200 p-0.5" />
                            {t(field.label)}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {colorError && <p className="field-error mt-2">{t(colorError)}</p>}
              </div>
            )}
          </Card>

          <Card icon="briefcase" title="vCard info">
            <Switch label="Card is online" name="is_active" checked={active} onChange={setActive} />
            <Switch label="Business Name on vCard" name="show_name" checked={showName} onChange={setShowName} />
            <input type="hidden" name="name_or_logo" value={showName ? "name" : "logo"} />
            {state.errors?.show_business_name && <p className="field-error">{t(state.errors.show_business_name[0] ?? "")}</p>}
            {showName ? (
              <TextInput state={state} name="business_name" label="Business Name" defaultValue={card.business_name ?? ""} required />
            ) : (
              <input type="hidden" name="business_name" value={card.business_name ?? ""} />
            )}

            <div className="field">
              <span className="label">{t("Business Logo")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label={t("Business Logo")}
                disabled={logo.pending}
                onChange={(event) => logo.upload(event.target.files?.[0])}
                className="input py-2.5 file:me-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
              />
              {!showName && <p className="text-xs text-stone-400">{t("A logo is required while the business name is hidden.")}</p>}
              <p className="text-xs text-stone-400">{t("JPG or PNG, 40x40 to 500x500 px, max 1 MB.")}</p>
              {logo.image && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-stone-200 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served by the API or the old app */}
                  <img src={logo.image} alt="" className="h-16 w-16 object-contain" />
                  <p className="flex-1 text-sm text-stone-500">{t("Current Logo")}</p>
                  {showName && (
                    <button type="button" onClick={logo.remove} disabled={logo.pending} className="btn btn-secondary btn-sm">
                      {t("Remove")}
                    </button>
                  )}
                </div>
              )}
              <Feedback state={logo.message} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["show_email_icon", "Email Icon"],
                  ["show_phone_icon", "Phone Icon"],
                  ["show_business_icon", "Business Icon"],
                  ["show_address_icon", "Address Icon"],
                ] as const
              ).map(([key, label]) => (
                <Switch key={key} label={label} name={key} checked={icons[key]} onChange={(value) => setIcons((current) => ({ ...current, [key]: value }))} />
              ))}
            </div>

            <TextInput state={state} name="business_email" label="Business Email" type="email" defaultValue={card.business_email ?? ""} required />
            <TextInput state={state} name="business_title" label="Business Title" defaultValue={card.business_title ?? ""} />
          </Card>

          <Card icon="fileLines" title="Select default background image">
            <p className="alert alert-info">
              {t(theme === 1 ? "On the Yellow Black theme the card uses a fixed background, so this image only appears on your Google / iOS wallet card." : "Used as the header of your vCard and as the image on your Google / iOS wallet card.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <button
                  type="button"
                  onClick={banner.remove}
                  disabled={banner.pending || !banner.image}
                  title={t("Use default background")}
                  className="relative grid h-24 w-24 place-items-center rounded-xl text-2xl text-white"
                  style={{ backgroundColor: card.colors.primary_background }}
                >
                  {!banner.image && "✓"}
                </button>
                <p className="mt-1 text-xs text-stone-500">{t("Default")}</p>
              </div>
              {banner.image && (
                <div className="text-center">
                  <span className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element -- served by the API or the old app */}
                    <img src={banner.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="relative text-2xl text-white drop-shadow">✓</span>
                  </span>
                  <p className="mt-1 text-xs text-stone-500">{t("Custom")}</p>
                </div>
              )}
            </div>
            <div className="field">
              <span className="label">{t("Custom background Image : max image size upto 1MB")}</span>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  banner.upload(event.dataTransfer.files[0]);
                }}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-6 text-center transition-colors hover:border-orange-400 hover:bg-orange-50"
              >
                <span className="font-bold text-orange-600">{t(banner.pending ? "Uploading…" : "Drag and drop or click")}</span>
                <span className="text-xs text-stone-500">{t("JPG or PNG, max 1 MB")}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={banner.pending} onChange={(event) => banner.upload(event.target.files?.[0])} />
              </label>
              <Feedback state={banner.message} />
            </div>
          </Card>

          <Card icon="bank" title="Business Location on vCard">
            <Switch label="Business Location on vCard" name="show_location" checked={showLocation} onChange={setShowLocation} />
            {showLocation ? (
              <>
                <TextInput state={state} name="business_address" label="Business Address" value={address} onChange={(event) => setAddress(event.target.value)} required autoComplete="street-address" />
                {address.trim().length > 3 && (
                  <iframe
                    title={t("Map")}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-64 w-full rounded-xl border border-stone-200"
                  />
                )}
              </>
            ) : (
              <input type="hidden" name="business_address" value={address} />
            )}
          </Card>

          <Card icon="fileLines" title="Vcard Status">
            <div className="field">
              <label className="label" htmlFor="bio">
                {t("Vcard Status")}
              </label>
              <textarea id="bio" name="bio" defaultValue={bio ?? ""} maxLength={300} rows={3} className="textarea" />
            </div>
            <TextInput state={state} name="appointment_url" label="Appointment Link (paste Google calendar or Microsoft agenda link)" type="url" defaultValue={card.appointment_url ?? ""} placeholder="https://" />
            <TextInput state={state} name="ambassador_url" label="Ambassador Link (paste ambassador link)" type="url" defaultValue={card.ambassador_url ?? ""} placeholder="https://" />
            <TextInput state={state} name="google_review_url" label="Google Review Link (paste google review link)" type="url" defaultValue={card.google_review_url ?? ""} placeholder="https://" />
            <Switch label='Show "Write a review"' name="show_review" checked={showReview} onChange={setShowReview} />

            <button type="button" aria-expanded={socialOpen} onClick={() => setSocialOpen(!socialOpen)} className="btn btn-secondary btn-block justify-between">
              {t("Click below to add social media links")}
              <span aria-hidden="true">{socialOpen ? "▴" : "▾"}</span>
            </button>
            <div hidden={!socialOpen} className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    name="social_links"
                    value={link}
                    onChange={(event) => setSocialLinks((links) => links.map((item, i) => (i === index ? event.target.value : item)))}
                    placeholder="https://www.instagram.com/yourname"
                    aria-label={t("Social media link {number}", { number: index + 1 })}
                    className="input"
                  />
                  <button type="button" onClick={() => setSocialLinks((links) => (links.length === 1 ? [""] : links.filter((_, i) => i !== index)))} className="btn btn-ghost btn-sm" aria-label={t("Remove link {number}", { number: index + 1 })}>
                    ✕
                  </button>
                </div>
              ))}
              {socialLinks.length < MAX_SOCIAL_LINKS && (
                <button type="button" onClick={() => setSocialLinks((links) => [...links, ""])} className="btn btn-outline btn-sm">
                  {t("+ Add link")}
                </button>
              )}
            </div>
            {socialError && <p className="field-error">{t(socialError)}</p>}
          </Card>
        </form>

        {/* Outside the main form: the hours editor saves on its own. */}
        <section className="card">
          <div className="card-body space-y-4">
            <Switch label="Business Hours on vCard" name="show_opening_hours" form="vcard-form" checked={showHours} onChange={setShowHours} />
            {showHours && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-stone-700">{t("Business Hours")}</span>
                <button type="button" onClick={() => setEditHours(!editHours)} aria-expanded={editHours} className="btn btn-secondary btn-sm">
                  {t("Set Working Hours")}
                </button>
              </div>
            )}
            {showHours && editHours && <ShiftEditor path="/me/vcard-hours" initial={hours} kind="opening" />}
          </div>
          <div className="space-y-3 border-t border-stone-100 p-6">
            <Feedback state={state} />
            <a href={`/vcards/${slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-block">
              {t("View Card")}
            </a>
            <button type="submit" form="vcard-form" disabled={saving} className="btn btn-primary btn-lg btn-block">
              {t(saving ? "Saving…" : "Update Card")}
            </button>
          </div>
        </section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card icon="userGear" title="vCard Preview">
          {card.exists && active ? (
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-8 border-stone-800 bg-stone-800">
              <iframe key={preview} title={t("vCard Preview")} src={`/vcards/${slug}`} className="h-[640px] w-full rounded-[1.4rem] bg-surface" />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">{t("Fill in the form and save to put your card online.")}</p>
          )}
        </Card>
        <Card title="Get Card in Wallet">
          <a href={`/vcards/${slug}/wallet/google`} className="btn btn-secondary btn-block">
            {t("Get Vcard in Google Wallet")}
          </a>
          <a href={`/vcards/${slug}/wallet/apple`} className="btn btn-secondary btn-block">
            {t("Get Vcard in IOS Wallet")}
          </a>
        </Card>
      </div>
    </div>
  );
}
