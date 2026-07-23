import type { AdminAuthor, PaginatedAuthors } from "../types";

type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

async function adminFetch<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    cache: "no-store",
  });

  // Guard against non-JSON error bodies (e.g. 502 gateway HTML pages)
  let payload: ApiEnvelope<T> & { message?: string | string[] };
  try {
    payload = (await response.json()) as ApiEnvelope<T> & { message?: string | string[] };
  } catch {
    throw new Error(`Admin request failed (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    // NestJS validation errors return message as string[]
    const msg = Array.isArray(payload.message)
      ? payload.message.join("; ")
      : payload.message || "Admin request failed.";
    throw new Error(msg);
  }

  return payload.data;
}

export function getAuthors(accessToken: string) {
  return adminFetch<PaginatedAuthors>("/admin/users/authors?limit=100", accessToken);
}

export function getAuthor(id: string, accessToken: string) {
  return adminFetch<AdminAuthor>(`/admin/users/authors/${id}`, accessToken);
}

export function approveAuthor(id: string, accessToken: string) {
  return adminFetch<{ message: string }>(
    `/admin/users/${id}/approve`,
    accessToken,
    { method: "PATCH" },
  );
}

export function suspendAuthor(id: string, accessToken: string) {
  return adminFetch<{ message: string }>(
    `/admin/users/${id}/suspend`,
    accessToken,
    { method: "PATCH" },
  );
}
