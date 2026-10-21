"use client";

import { type ReactNode, useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { removeBackground, updateTipPage, uploadBackground } from "@/app/actions/settings";
import { useT } from "@/components/i18n/I18nProvider";
import { buttonClass, emojiColor, inputStyle, pageStyle, textStyle } from "@/components/tips/branding";
import { methodLabel, methodLogo } from "@/components/tips/payment-methods";
import { RatingInput } from "@/components/tips/RatingInput";
import type { ButtonStyle, PageMode, TipPage } from "@/lib/types";

import { Feedback, SaveButton } from "./forms";
import { SolidIcon } from "./SolidIcons";

export type TipPageSettings = {
  mode: PageMode;
  header: string | null;
  title: string | null;
  success_header: string | null;
  success_message: string | null;
  page_color: string | null;
  panel_color: string | null;
  text_color: string | null;
  emoji_color: string | null;
  button_style: ButtonStyle;
  emoji_type: number;
  show_email_field: boolean;
  show_review_field: boolean;
  preset_amounts: string[];
  background_image: string | null;
  pattern: string | null;
  pin_reviews: boolean;
  review_style: number;
  payment_methods: { id: number; name: string; icon: string; chosen: boolean }[];
};

type Owner = { name: string; avatar: string | null; bio: string | null };

type Tab = "pages" | "review" | "tip" | "payment" | "success";

const TABS: { value: Tab; label: string; title: string }[] = [
  { value: "pages", label: "Pages", title: "Page Area" },
  { value: "review", label: "Review", title: "Review Area" },
  { value: "tip", label: "Tip", title: "Tip Area" },
  { value: "payment", label: "Payment", title: "Payment Methods Area" },
  { value: "success", label: "Success", title: "Success Page Area" },
];

const MODES: { value: PageMode; label: string; hint: string }[] = [
  { value: "review", label: "Review", hint: "Get customer reviews" },
  { value: "tip", label: "Tip", hint: "Receive tip from customer" },
  { value: "tip_and_review", label: "Review & Tip", hint: "Get customer reviews and receive tip" },
];

const BUTTONS: { value: ButtonStyle; label: string; swatch: string }[] = [
  { value: "orange", label: "Orange Button", swatch: "bg-orange-500" },
  { value: "blue", label: "Lite Blue Button", swatch: "bg-sky-500" },
  { value: "red", label: "Red Button", swatch: "bg-red-600" },
  { value: "light", label: "White Button", swatch: "bg-white border border-stone-300" },
  { value: "dark", label: "Dark Button", swatch: "bg-stone-900" },
];

const PATTERNS = ["patern1", "pattern2", "pattern3", "pattern4", "pattern5", "pattern6"];

const DEFAULT_HEADER = "How did you like my service ?";
const DEFAULT_TITLE = "Please rate your experience below";

/**
 * The old "Page Area" editor: tabs show a live preview of each step of the
 * tip page, and the panel on the side edits it. One Save button stores it all.
 */
export function TipPageEditor({ settings, owner }: { settings: TipPageSettings; owner: Owner }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updateTipPage, {});
  const [tab, setTab] = useState<Tab>("pages");
  const [open, setOpen] = useState<Tab | null>(null);
  const [values, setValues] = useState(settings);
  const [bio, setBio] = useState(owner.bio ?? "");
  const [menu, setMenu] = useState<"pattern" | "button" | null>(null);
  const set = <K extends keyof TipPageSettings>(key: K, value: TipPageSettings[K]) => setValues((current) => ({ ...current, [key]: value }));

  const background = values.pattern ? `/images/pattern/${values.pattern}.png` : values.background_image;
  const page: TipPage = {
    mode: values.mode,
    header: values.header,
    title: values.title,
    success_header: values.success_header,
    success_message: values.success_message,
    show_email_field: values.show_email_field,
    show_review_field: values.show_review_field,
    preset_amounts: values.preset_amounts,
    theme: {
      background_image: background,
      panel_color: values.panel_color,
      page_color: values.page_color,
      text_color: values.text_color,
      button_style: values.button_style,
      emoji_color: values.emoji_color,
      emoji_type: values.emoji_type,
      review_style: values.review_style,
    },
  };

  function showTab(next: Tab) {
    setTab(next);
    setOpen(next === "pages" ? null : next);
  }

  return (
    <>
      <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-stone-100 p-1" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => showTab(item.value)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === item.value ? "bg-menu text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <form action={action} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Values the preview and the side panel share. */}
        <input type="hidden" name="mode" value={values.mode} />
        <input type="hidden" name="button_style" value={values.button_style} />
        <input type="hidden" name="pattern" value={values.pattern ?? ""} />
        <input type="hidden" name="methods_shown" value="1" />
        {(["page_color", "panel_color", "text_color", "emoji_color"] as const).map((key) => values[key] && <input key={key} type="hidden" name={`use_${key}`} value="on" />)}

        <div>
          <p className="mb-3 text-sm font-semibold text-stone-500">{t(TABS.find((item) => item.value === tab)!.title)}</p>
          <section data-theme="light" className="rounded-2xl p-4" style={pageStyle(page)}>
            {tab === "pages" ? (
              <div className="tip-panel px-6 py-8 sm:px-10">
                <h2 className="flex items-center justify-center gap-2 text-xl">
                  <SolidIcon name="userGear" className="h-5 w-5 text-orange-500" />
                  {t("Landing page")}
                </h2>
                <div className="mt-6 divide-y divide-stone-200">
                  {MODES.map((mode) => (
                    <label key={mode.value} className="flex cursor-pointer items-center gap-4 py-4">
                      <input type="radio" checked={values.mode === mode.value} onChange={() => set("mode", mode.value)} className="h-5 w-5 accent-orange-500" />
                      <span className="text-sm">
                        <span className="font-bold text-stone-900">{t(mode.label)}</span> <span className="text-stone-500">( {t(mode.hint)} )</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <section className="tip-panel" style={previewPanelStyle(values)}>
                <div className="px-6 py-8 sm:px-10" style={textStyle(page)}>
                  <Preview tab={tab} page={page} owner={{ ...owner, bio }} methods={values.payment_methods} />
                </div>
              </section>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <div className="card divide-y divide-stone-100 overflow-hidden">
            <Accordion title="Review Area" open={open === "review"} onToggle={() => setOpen(open === "review" ? null : "review")}>
              <Input label="Page header" name="header" value={values.header ?? ""} placeholder={t(DEFAULT_HEADER)} onChange={(value) => set("header", value)} maxLength={150} />
              <Input label="Review title" name="title" value={values.title ?? ""} placeholder={t(DEFAULT_TITLE)} onChange={(value) => set("title", value)} maxLength={150} />
              <Switch label="Review box" name="show_review_field" checked={values.show_review_field} onChange={(value) => set("show_review_field", value)} />
              <Switch label="User email" name="show_email_field" checked={values.show_email_field} onChange={(value) => set("show_email_field", value)} />
              <Switch label="Emoji Face" checked={values.emoji_type === 0} onChange={(value) => set("emoji_type", value ? 0 : 1)} />
              <input type="hidden" name="emoji_type" value={values.emoji_type} />
              <Switch label="Sticky Review" name="pin_reviews" checked={values.pin_reviews} onChange={(value) => set("pin_reviews", value)} />
              <div className="field">
                <label className="label" htmlFor="review_style">
                  {t("Review List")}
                </label>
                <select id="review_style" name="review_style" value={values.review_style} onChange={(event) => set("review_style", Number(event.target.value))} className="input">
                  <option value={1}>{t("Vertical List")}</option>
                  <option value={2}>{t("Horizontal Single")}</option>
                </select>
              </div>
            </Accordion>

            <Accordion title="Tip Area" open={open === "tip"} onToggle={() => setOpen(open === "tip" ? null : "tip")}>
              <div className="field">
                <label className="label" htmlFor="bio">
                  {t("User Status (160 Words)")}
                </label>
                <textarea id="bio" name="bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={300} className="textarea" />
              </div>
              <div className="field">
                <span className="label">{t("Default Tip Amount")}</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <input
                      key={index}
                      name={`amount_${index + 1}`}
                      value={values.preset_amounts[index] ?? ""}
                      onChange={(event) => set("preset_amounts", values.preset_amounts.map((amount, position) => (position === index ? event.target.value : amount)))}
                      inputMode="decimal"
                      required
                      aria-label={t("Amount {number}", { number: index + 1 })}
                      className="input"
                    />
                  ))}
                </div>
                {state.errors && Object.entries(state.errors).find(([key]) => key.startsWith("preset_amounts")) && (
                  <p className="field-error">{Object.entries(state.errors).find(([key]) => key.startsWith("preset_amounts"))?.[1][0]}</p>
                )}
              </div>
            </Accordion>

            <Accordion title="Payment Methods Area" open={open === "payment"} onToggle={() => setOpen(open === "payment" ? null : "payment")}>
              <div className="grid grid-cols-2 gap-2">
                {values.payment_methods.map((method) => (
                  <label key={method.id} className="flex items-center gap-2 text-sm text-stone-700 capitalize">
                    <input
                      type="checkbox"
                      name="methods"
                      value={method.id}
                      checked={method.chosen}
                      onChange={(event) => set("payment_methods", values.payment_methods.map((item) => (item.id === method.id ? { ...item, chosen: event.target.checked } : item)))}
                      className="h-4 w-4 accent-orange-500"
                    />
                    {method.name}
                  </label>
                ))}
              </div>
              <p className="text-xs text-stone-500">{t("None ticked: customers can use all of them.")}</p>
            </Accordion>

            <Accordion title="Success Page Area" open={open === "success"} onToggle={() => setOpen(open === "success" ? null : "success")}>
              <Input label="Thanks header" name="success_header" value={values.success_header ?? ""} placeholder={t("Thank you!")} onChange={(value) => set("success_header", value)} maxLength={150} />
              <div className="field">
                <label className="label" htmlFor="success_message">
                  {t("Thanks message (160 Words)")}
                </label>
                <textarea
                  id="success_message"
                  name="success_message"
                  value={values.success_message ?? ""}
                  onChange={(event) => set("success_message", event.target.value)}
                  rows={4}
                  maxLength={500}
                  className="textarea"
                />
              </div>
            </Accordion>
          </div>

          <div className="card">
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Color label="Box Color" name="panel_color" value={values.panel_color} fallback="#FFFFFF" onChange={(value) => set("panel_color", value)} />
                <Color label="Background" name="page_color" value={values.page_color} fallback="#F5F5F4" onChange={(value) => set("page_color", value)} />
                <Color label="Text Color" name="text_color" value={values.text_color} fallback="#1C1917" onChange={(value) => set("text_color", value)} />
                <Color label="Emoji Color" name="emoji_color" value={values.emoji_color} fallback="#FBC721" onChange={(value) => set("emoji_color", value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <button type="button" aria-expanded={menu === "pattern"} onClick={() => setMenu(menu === "pattern" ? null : "pattern")} className="btn btn-secondary btn-sm w-full">
                    {t("Pattern")}
                  </button>
                  {menu === "pattern" && (
                    <div className="menu-panel absolute start-0 z-20 mt-2 w-full">
                      <button type="button" onClick={() => (set("pattern", null), setMenu(null))} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50">
                        {t("No pattern")}
                      </button>
                      {PATTERNS.map((pattern, index) => (
                        <button
                          key={pattern}
                          type="button"
                          onClick={() => (set("pattern", pattern), setMenu(null))}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50 ${values.pattern === pattern ? "font-bold text-orange-600" : ""}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- small static pattern swatch */}
                          <img src={`/images/pattern/${pattern}.png`} alt="" width={20} height={20} className="rounded" />
                          {t("Pattern")} {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button type="button" aria-expanded={menu === "button"} onClick={() => setMenu(menu === "button" ? null : "button")} className="btn btn-secondary btn-sm w-full">
                    {t("Button")}
                  </button>
                  {menu === "button" && (
                    <div className="menu-panel absolute end-0 z-20 mt-2 w-48">
                      {BUTTONS.map((button) => (
                        <button
                          key={button.value}
                          type="button"
                          onClick={() => (set("button_style", button.value), setMenu(null))}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50 ${values.button_style === button.value ? "font-bold" : ""}`}
                        >
                          <span className={`h-3 w-3 rounded-full ${button.swatch}`} />
                          {t(button.label)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <BackgroundField image={values.pattern ? null : values.background_image} onChange={(image) => setValues((current) => ({ ...current, background_image: image, pattern: image ? null : current.pattern }))} />
            </div>
            <div className="space-y-3 border-t border-stone-100 p-6">
              <Feedback state={state} />
              <SaveButton className="btn btn-primary btn-lg btn-block">Save</SaveButton>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

/** The card behind the preview: a pattern tiles, an uploaded photo covers it, as in the old app. */
function previewPanelStyle(values: TipPageSettings): React.CSSProperties {
  if (values.pattern) {
    return { backgroundImage: `url("/images/pattern/${values.pattern}.png")`, backgroundSize: "auto" };
  }
  if (values.background_image) {
    return { backgroundImage: `url("${encodeURI(values.background_image)}")` };
  }
  return { backgroundColor: values.panel_color ?? undefined };
}

/** What the customer sees on each step, drawn with the settings being edited. */
function Preview({ tab, page, owner, methods }: { tab: Tab; page: TipPage; owner: Owner; methods: TipPageSettings["payment_methods"] }) {
  const t = useT();
  const [rating, setRating] = useState(3);
  const shown = methods.some((method) => method.chosen) ? methods.filter((method) => method.chosen) : methods;

  const header = (heading: ReactNode) => (
    <header className="text-center">
      <h3 className="text-xl" style={textStyle(page)}>
        {heading}
      </h3>
      {/* eslint-disable-next-line @next/next/no-img-element -- photos come from the API or the old app's domain */}
      <img src={owner.avatar ?? "/images/user-image.jpg"} alt="" width={96} height={96} className="tip-avatar mx-auto mt-6 bg-stone-200" />
      <p className="mt-4 text-lg font-bold">{owner.name}</p>
    </header>
  );

  if (tab === "review") {
    return (
      <div className="space-y-5">
        {header(page.header || t(DEFAULT_HEADER))}
        <p className="text-center text-sm font-semibold">{page.title || t(DEFAULT_TITLE)}</p>
        <RatingInput value={rating} onChange={setRating} emojiType={page.theme.emoji_type} color={emojiColor(page)} />
        {page.show_review_field && <textarea readOnly rows={3} placeholder={t("Your review")} className="textarea" style={inputStyle(page)} tabIndex={-1} />}
        {page.show_review_field && <input readOnly placeholder={t("Your Name")} className="input" style={inputStyle(page)} tabIndex={-1} />}
        {page.show_email_field && <input readOnly placeholder={t("Email ID")} className="input" style={inputStyle(page)} tabIndex={-1} />}
        <span className={`btn btn-pill btn-block ${buttonClass(page)}`}>{t("Next ›")}</span>
      </div>
    );
  }

  if (tab === "tip") {
    return (
      <div className="space-y-5">
        {header(
          <>
            {t("We")} <span className="text-red-500">❤</span> {t("Tips")}
          </>,
        )}
        {owner.bio && <blockquote className="mx-auto max-w-sm text-center text-sm italic opacity-80">“{owner.bio}”</blockquote>}
        <p className="text-center text-sm font-semibold">{t("Select your tip")}</p>
        <div className="tip-amounts">
          {page.preset_amounts.map((amount, index) => (
            <span key={index} className={`amount-btn ${buttonClass(page)}`}>
              € {amount.replace(/\.00$/, "")}
            </span>
          ))}
        </div>
        <p className="text-center text-sm font-semibold">{t("or enter amount")}</p>
        <div className="mx-auto flex max-w-xs gap-2">
          <input readOnly value={`€ ${page.preset_amounts[0] ?? ""}`} className="input text-center" style={inputStyle(page)} tabIndex={-1} />
          <span className={`btn btn-pill shrink-0 ${buttonClass(page)}`}>{t("Pay Tip")}</span>
        </div>
      </div>
    );
  }

  if (tab === "payment") {
    return (
      <div className="space-y-5">
        <p className="text-center text-lg font-bold">{t("Choose payment method")}</p>
        <div className="grid grid-cols-2 gap-3">
          {shown.map((method) => (
            <span key={method.id} className="flex flex-col items-center gap-2 card p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- payment method logo */}
              <img src={methodLogo(method)} alt="" className="h-10 w-auto object-contain" />
              <span className="text-sm font-bold text-stone-900">{t(methodLabel(method))}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-6 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</span>
      <h3 className="text-2xl" style={textStyle(page)}>
        {page.success_header || t("Thank you!")}
      </h3>
      <p className="opacity-80">{page.success_message || t("Your tip was received.")}</p>
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  const t = useT();
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start text-sm font-bold text-stone-900 hover:bg-stone-50">
        {t(title)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {/* Hidden, not removed, so closed panels still submit their fields. */}
      <div hidden={!open} className="space-y-4 px-5 pb-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, ...input }: { label: string; name: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const t = useT();
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {t(label)}
      </label>
      <input id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} className="input" {...input} />
    </div>
  );
}

function Switch({ label, name, checked, onChange }: { label: string; name?: string; checked: boolean; onChange: (value: boolean) => void }) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-3">
      <span className="text-sm font-semibold text-stone-700">{t(label)}</span>
      <input type="checkbox" name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-orange-500 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
    </label>
  );
}

function Color({ label, name, value, fallback, onChange }: { label: string; name: string; value: string | null; fallback: string; onChange: (value: string | null) => void }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <input type="color" name={name} value={value ?? fallback} onChange={(event) => onChange(event.target.value)} aria-label={t(label)} className="h-9 w-12 shrink-0 cursor-pointer rounded border border-stone-200 p-0.5" />
      <span className="text-sm font-semibold text-stone-700">{t(label)}</span>
      {value && (
        <button type="button" onClick={() => onChange(null)} title={t("Reset")} aria-label={`${t("Reset")}: ${t(label)}`} className="ms-auto text-stone-400 hover:text-red-600">
          ✕
        </button>
      )}
    </div>
  );
}

/** "Background Image": uploaded straight away, like the profile photo. */
function BackgroundField({ image, onChange }: { image: string | null; onChange: (image: string | null) => void }) {
  const t = useT();
  const [message, setMessage] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  function send(file: File | undefined) {
    if (!file) {
      return;
    }
    const body = new FormData();
    body.set("image", file);
    startTransition(async () => {
      const result = await uploadBackground({}, body);
      setMessage(result);
      if (result.success) {
        onChange(URL.createObjectURL(file));
      }
    });
  }

  return (
    <div className="field">
      <span className="label">{t("Background Image")}</span>
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          send(event.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-6 text-center transition-colors hover:border-orange-400 hover:bg-orange-50"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-stone-300" aria-hidden="true">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 12 4-5 3 4 2-2 3 3H4zm11-8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
        <span className="font-bold text-orange-600">{t(pending ? "Uploading…" : "Drag and drop or click")}</span>
        <span className="text-xs text-stone-500">{t("PNG or JPEG format")}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => send(event.target.files?.[0])} disabled={pending} />
      </label>
      {image && (
        <div className="mt-3 flex items-center gap-4 rounded-xl border border-stone-200 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- served by the API or the old app */}
          <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-stone-100 object-contain" />
          <p className="flex-1 text-sm text-stone-500">{t("Drag and drop or click to replace")}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await removeBackground();
                setMessage(result);
                if (result.success) {
                  onChange(null);
                }
              })
            }
            className="btn btn-secondary btn-sm"
          >
            {t("Remove")}
          </button>
        </div>
      )}
      <Feedback state={message} />
    </div>
  );
}
