"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { removePushSubscription, savePushSubscription } from "@/app/actions/account";
import { useT } from "@/components/i18n/I18nProvider";

function keyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

const noSubscription = () => () => undefined;
const browserSupportsPush = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** Switches push notifications on or off for this browser. */
export function PushToggle({ publicKey }: { publicKey: string }) {
  const t = useT();
  const canPush = useSyncExternalStore(noSubscription, browserSupportsPush, () => null);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const supported = canPush === null ? null : canPush && !registrationFailed;
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (canPush) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => registration.pushManager.getSubscription())
        .then(setSubscription)
        .catch(() => setRegistrationFailed(true));
    }
  }, [canPush]);

  async function turnOn() {
    setBusy(true);
    setMessage(null);
    try {
      if ((await Notification.requestPermission()) !== "granted") {
        setMessage({ text: t("Notifications are blocked in your browser settings."), error: true });
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const created = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
      const json = created.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const result = await savePushSubscription(json);
      if (result.message) {
        await created.unsubscribe();
        setMessage({ text: t(result.message), error: true });
        return;
      }
      setSubscription(created);
      setMessage({ text: t(result.success ?? ""), error: false });
    } catch {
      setMessage({ text: t("Notifications could not be switched on in this browser."), error: true });
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    if (!subscription) {
      return;
    }
    setBusy(true);
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe().catch(() => undefined);
    const result = await removePushSubscription(endpoint);
    setSubscription(null);
    setMessage({ text: t(result.success ?? result.message ?? ""), error: Boolean(result.message) });
    setBusy(false);
  }

  return (
    <section className="card space-y-3 p-6">
      <div>
        <h2 className="text-lg">{t("Notifications on this device")}</h2>
        <p className="text-sm text-stone-500">{t("Get a message on your phone or computer when you receive a tip or review, even when this page is closed.")}</p>
      </div>
      {message && (
        <p role={message.error ? "alert" : "status"} className={`alert ${message.error ? "alert-error" : "alert-success"}`}>
          {message.text}
        </p>
      )}
      {supported === false ? (
        <p className="text-sm text-stone-500">{t("This browser does not support push notifications. On iPhone, add this site to your home screen first.")}</p>
      ) : subscription ? (
        <button type="button" onClick={turnOff} disabled={busy} className="btn btn-outline">
          {t("Turn off on this device")}
        </button>
      ) : (
        <button type="button" onClick={turnOn} disabled={busy || supported === null} className="btn btn-primary">
          {t("Turn on on this device")}
        </button>
      )}
    </section>
  );
}
