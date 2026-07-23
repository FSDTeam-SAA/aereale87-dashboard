import { AdminPendingBooksData } from "../types";

type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

export async function getPendingBooks(accessToken: string): Promise<AdminPendingBooksData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/pending?limit=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.message || JSON.stringify(body);
    } catch {
      detail = response.statusText;
    }
    throw new Error(`Unable to load pending books (${response.status}): ${detail}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<AdminPendingBooksData>;
  return envelope.data;
}
