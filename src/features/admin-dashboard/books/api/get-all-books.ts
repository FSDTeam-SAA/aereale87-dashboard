import { AdminPendingBooksData } from "../types";

type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

export async function getAllBooks(accessToken: string): Promise<AdminPendingBooksData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/admin/all?limit=100`, {
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
    throw new Error(`Unable to load books (${response.status}): ${detail}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<AdminPendingBooksData>;
  return envelope.data;
}
