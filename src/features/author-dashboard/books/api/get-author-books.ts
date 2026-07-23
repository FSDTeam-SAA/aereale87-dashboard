import type { AuthorBooksData, BackendBook, BookStatus } from "../types";

type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

export async function getAuthorBooks(
  accessToken: string,
): Promise<AuthorBooksData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/books/mine?limit=100`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (!response.ok) {
    let message = "Unable to load your books.";
    try {
      const errBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errBody.message)) message = errBody.message.join(", ");
      else if (errBody.message) message = errBody.message;
    } catch {
      // ignore JSON parse errors — fall back to generic message
    }
    throw new Error(message);
  }
  const envelope = (await response.json()) as ApiEnvelope<{
    books: BackendBook[];
    total: number;
  }>;
  const books = envelope.data.books;
  const count = (status: BookStatus) => books.filter((book) => book.status === status).length;

  return {
    summary: [
      { id: "approved", title: "Published Books", value: String(count("APPROVED")), subtitle: "Approved and live" },
      { id: "submitted", title: "Pending Review", value: String(count("SUBMITTED")), subtitle: "Waiting for moderation" },
      { id: "draft", title: "Draft Books", value: String(count("DRAFT")), subtitle: "Not submitted" },
      { id: "rejected", title: "Needs Changes", value: String(count("REJECTED")), subtitle: "Editable and resubmittable" },
    ],
    books,
  };
}
