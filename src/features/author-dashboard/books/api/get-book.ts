import type { BackendBook } from "../types";

export async function getBook(id: string, accessToken: string): Promise<BackendBook> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Book not found");
  return payload.data;
}
