"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { isSlugAvailable, removeAvatar, updateProfileDetails, uploadAvatar } from "@/app/actions/settings";
import { useT } from "@/components/i18n/I18nProvider";
import type { CurrentUser } from "@/lib/types";

import { Feedback, Field, SaveButton, TextArea } from "./forms";
import { SolidIcon } from "./SolidIcons";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** The old "Profile Details" page: business info (owners only) and user info, saved together. */
export function ProfileDetailsForm({ user, appUrl }: { user: CurrentUser; appUrl: string }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updateProfileDetails, {});
  const [firstName, ...rest] = user.name.split(" ");

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      <Feedback state={state} />

      {user.business && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <SolidIcon name="briefcase" className="h-5 w-5 text-orange-500" />
              {t("Business Info")}
            </h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs text-stone-600">{user.business.code}</span>
          </div>
          <div className="card-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field state={state} name="business_name" label="Business Name" defaultValue={user.business.name} required autoComplete="organization" />
              <Field state={state} name="business_email" label="Business Email" type="email" defaultValue={user.business.email ?? ""} />
            </div>
            <TextArea state={state} name="business_address" label="Business Address" defaultValue={user.business.address ?? ""} rows={3} />
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-orange-500" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 14a8 8 0 0 1-6.2-2.9C7 15.4 9.4 14.5 12 14.5s5 .9 6.2 2.6A8 8 0 0 1 12 20z" />
            </svg>
            {t("User Info")}
          </h2>
        </div>

        <div className="card-body space-y-5">
          <PhotoField user={user}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field state={state} name="first_name" label="First name" defaultValue={firstName} required autoComplete="given-name" />
              <Field state={state} name="last_name" label="Last name" defaultValue={rest.join(" ")} autoComplete="family-name" />
            </div>
            {state.errors?.name && <p className="field-error">{state.errors.name[0]}</p>}
          </PhotoField>


          <Field state={state} name="birth_date" label="Birth Date" type="date" defaultValue={user.birth_date ?? ""} />

          <label className="flex items-start gap-3 text-sm text-stone-600">
            <input type="checkbox" name="accepts_individual_tips" defaultChecked={user.accepts_individual_tips} className="mt-0.5 h-4 w-4 accent-orange-500" />
            <span>{t("I will accept tip for individual account")}</span>
          </label>

          <SlugField state={state} current={user.slug} appUrl={appUrl} />

          <TextArea state={state} name="address" label="Address" defaultValue={user.address ?? ""} rows={3} autoComplete="street-address" />
          <TextArea state={state} name="bio" label="Profile Status (160 words)" defaultValue={user.bio ?? ""} maxLength={300} rows={5} />
        </div>

        <div className="border-t border-stone-100 p-6">
          <SaveButton className="btn btn-primary btn-lg btn-block">Update Profile</SaveButton>
        </div>
      </section>
    </form>
  );
}

/** "User Name" with a live check that the name is free, like the old page. */
function SlugField({ state, current, appUrl }: { state: FormState; current: string; appUrl: string }) {
  const t = useT();
  const [slug, setSlug] = useState(current);
  const [available, setAvailable] = useState<boolean | null>(true);
  const [, startTransition] = useTransition();
  const latest = useRef(slug);

  useEffect(() => {
    latest.current = slug;
    if (slug === current) {
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const free = await isSlugAvailable(slug);
        if (latest.current === slug) {
          setAvailable(free);
        }
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, current]);

  const status = slug === current ? true : available;
  const error = state.errors?.slug?.[0];

  return (
    <div className="space-y-3">
      <div className="field">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label className="label" htmlFor="slug">
            {t("User Name")}
          </label>
          <span className="text-xs text-stone-400">
            {appUrl}/paytips/{slug}
          </span>
        </div>
        <div className="relative">
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setAvailable(null);
              setSlug(event.target.value.replace(/[^A-Za-z0-9]/g, ""));
            }}
            required
            minLength={3}
            maxLength={50}
            className="input pe-11"
            aria-invalid={Boolean(error) || status === false}
            aria-describedby="slug-help"
          />
          {status !== null && (
            <span className={`absolute inset-y-0 end-4 flex items-center ${status ? "text-emerald-500" : "text-red-500"}`} aria-hidden="true">
              {status ? "✓" : "✕"}
            </span>
          )}
        </div>
        {error ? (
          <p id="slug-help" className="field-error">
            {error}
          </p>
        ) : status === false ? (
          <p id="slug-help" className="field-error">
            {t("This name is already taken.")}
          </p>
        ) : slug !== current ? (
          <p id="slug-help" className="alert alert-warning">
            {t("QR codes you already printed point to /review/{slug}. They stop working when you change this name.", { slug: current })}
          </p>
        ) : null}
      </div>
      <a href={`/review/${current}`} target="_blank" rel="noopener" className="btn btn-outline btn-block">
        {t("View Profile")}
      </a>
    </div>
  );
}

/** "User Icon": drag and drop or click to upload; the photo is saved straight away. */
function PhotoField({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const t = useT();
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<FormState>({});
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const photo = preview ?? user.avatar;

  function send(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      setMessage({ message: "JPG, PNG or WebP, up to 5 MB." });
      return;
    }
    setPreview(URL.createObjectURL(file));
    const body = new FormData();
    body.set("image", file);
    startTransition(async () => {
      setMessage(await uploadAvatar({}, body));
    });
  }

  function remove() {
    startTransition(async () => {
      setPreview(null);
      setMessage(await removeAvatar());
    });
  }

  return (
    <div className="space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- photos come from the API or the old app's domain */}
      <img src={photo ?? "/images/user-image.jpg"} alt="" width={96} height={96} className="tip-avatar mx-auto bg-stone-200" />

      {children}

      <div className="field">
        <div className="flex items-baseline justify-between gap-2">
          <span className="label">{t("User Icon")}</span>
          <span className="text-xs text-stone-400">{t("Size")} — 200x200 px</span>
        </div>
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            send(event.dataTransfer.files[0]);
          }}
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${dragging ? "border-orange-400 bg-orange-50" : "border-stone-300 hover:border-orange-300"}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="mb-2 h-7 w-7 text-stone-300" aria-hidden="true">
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 12 4-5 3 4 2-2 3 3H4zm11-8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
          <span className="font-bold text-orange-600">{t(pending ? "Uploading…" : "Drag and drop or click")}</span>
          <span className="text-xs text-stone-500">{t("PNG or JPEG format")}</span>
          <span className="text-xs text-stone-500">{t("For best results use image size 200 x 200 px")}</span>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => send(event.target.files?.[0])} disabled={pending} />
        </label>
      </div>

      {photo && (
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- photos come from the API or the old app's domain */}
          <img src={photo} alt="" className="h-14 w-14 rounded-lg object-cover" />
          <button type="button" onClick={() => input.current?.click()} className="flex-1 text-start text-sm text-stone-500">
            {t("Drag and drop or click to replace")}
          </button>
          <button type="button" onClick={remove} disabled={pending} className="btn btn-secondary btn-sm">
            {t("Remove")}
          </button>
        </div>
      )}
      <Feedback state={message} />
    </div>
  );
}
