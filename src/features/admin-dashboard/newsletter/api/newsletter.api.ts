import type { PaginatedNewsletterSubscribers } from "../types";

type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

export async function getNewsletterSubscribers(accessToken: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/newsletter/subscribers?limit=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  let payload: ApiEnvelope<PaginatedNewsletterSubscribers> & { message?: string | string[] };
  try {
    payload = (await response.json()) as ApiEnvelope<PaginatedNewsletterSubscribers> & {
      message?: string | string[];
    };
  } catch {
    throw new Error(`Unable to load newsletter subscribers (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join("; ")
      : payload.message || "Unable to load newsletter subscribers.";
    throw new Error(message);
  }

  return payload.data;
}
