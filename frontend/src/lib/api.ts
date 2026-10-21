import "server-only";

import { headers } from "next/headers";

import { visitorIpFrom } from "./visitor-ip";

/**
 * Server-side client for the Laravel API. Only pages and server actions use it:
 * the browser never calls the API directly.
 *
 * The visitor's IP address is passed on in X-Forwarded-For, so the API's rate
 * limits and logs see the visitor and not this server (the API trusts this
 * server as a proxy, see TRUSTED_PROXIES in the backend).
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  token?: string;
  /** Set to false inside "use cache" functions: those may not read the request, and their answer is the same for everyone. */
  forwardVisitorIp?: boolean;
};

function baseUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("API_URL is not set.");
  }
  return url.replace(/\/$/, "");
}

async function visitorIp(): Promise<string | undefined> {
  return visitorIpFrom(await headers());
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = new URL(`${baseUrl()}/api/v1${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const isUpload = options.body instanceof FormData;
  const requestHeaders: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined && !isUpload) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (options.token) {
    requestHeaders.Authorization = `Bearer ${options.token}`;
  }
  const ip = options.forwardVisitorIp === false ? undefined : await visitorIp();
  if (ip) {
    requestHeaders["X-Forwarded-For"] = ip;
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: requestHeaders,
    // FormData (file uploads) sets its own multipart Content-Type.
    body: options.body === undefined ? undefined : isUpload ? (options.body as FormData) : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, payload.message ?? "Something went wrong. Please try again.", payload.errors ?? {});
  }

  return payload as T;
}
