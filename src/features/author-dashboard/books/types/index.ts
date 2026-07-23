export type BookStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type BackendBook = {
  id: string;
  title: string;
  description: string | null;
  bookCover: string | null;
  status: BookStatus;
  category: string | null;
  language: string | null;
  formats: Array<{ formatType: string; listPrice: number }>;
  sellingPrice?: number;
  ebookAvailable?: boolean;
  audiobookAvailable?: boolean;
  printAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthorBooksSummary = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
};

export type AuthorBooksData = {
  summary: AuthorBooksSummary[];
  books: BackendBook[];
};
