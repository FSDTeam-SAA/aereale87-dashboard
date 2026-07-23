export type BookStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PUBLISHED";

export type BookFileType = "COVER" | "EBOOK" | "AUDIOBOOK" | "INTERIOR_PDF" | "COVER_PDF";

export type AdminPendingBookFile = {
  id: string;
  bookId: string;
  type: BookFileType;
  url: string | null;
  fileKey: string | null;
  mimeType: string | null;
  size: number | null;
};

export type AdminPendingBook = {
  id: string;
  title: string;
  description: string | null;
  isbn: string | null;
  category: string | null;
  tags: string[];
  language: string | null;
  ageGroup: string | null;
  authorId: string;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  formats: Array<{
    formatType: string;
    listPrice: number;
    pageCount?: number;
    trimSize?: string;
    coverUrl?: string | null;
    interiorUrl?: string | null;
  }>;
  bookCover: string | null;
  files: AdminPendingBookFile[];
  author?: {
    id: string;
    username: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
      bio: string | null;
      avatarUrl: string | null;
    } | null;
    isFoundingAuthor: boolean;
  };
};

export type AdminPendingBooksData = {
  books: AdminPendingBook[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export function getBookFileUrl(book: AdminPendingBook, type: BookFileType): string | null {
  const file = book.files?.find((f) => f.type === type);
  return file?.url ?? null;
}
