"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Edit3 } from "lucide-react";
import { BookPreviewModal } from "./book-preview-modal";

interface Props {
  book: {
    id: string;
    title: string;
    authorName?: string | null;
    description?: string | null;
    bookCover?: string | null;
    status: string;
    category?: string | null;
    language?: string | null;
    ageGroup?: string | null;
    formats?: Array<{ formatType: string; listPrice?: number }>;
  };
  userName?: string | null;
}

export function AuthorBookDetailActions({ book, userName }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#cfaf45] bg-[#faf8f2] px-4 py-2 text-sm font-bold text-[#8c7423] hover:bg-[#cfaf45] hover:text-white transition shadow-sm"
        >
          <Eye className="size-4" />
          <span>Preview Book</span>
        </button>

        <Link
          href={`/author-dashboard/upload-content?bookId=${book.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#24352f] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a2621] transition shadow-sm"
        >
          <Edit3 className="size-4" />
          <span>Edit Book</span>
        </Link>
      </div>

      <BookPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        coverUrl={book.bookCover}
        title={book.title}
        authorName={book.authorName || userName || "Author Name"}
        description={book.description}
        category={book.category}
        language={book.language}
        ageGroup={book.ageGroup}
        formats={book.formats?.map((f) => f.formatType) || ["EBOOK"]}
      />
    </>
  );
}
