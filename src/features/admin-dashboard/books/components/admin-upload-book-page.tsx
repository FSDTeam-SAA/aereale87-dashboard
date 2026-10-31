"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileAudio,
  FileText,
  Upload,
  CheckCircle,
  X,
  ArrowLeft,
  Loader2,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Library,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminAuthor } from "@/features/admin-dashboard/authors/types";

interface Props {
  authors: AdminAuthor[];
  accessToken: string;
  bookId?: string;
}

type FormatKey = "EBOOK" | "AUDIOBOOK" | "PAPERBACK" | "HARDCOVER";

export function AdminUploadBookPage({ authors, accessToken, bookId }: Props) {
  const router = useRouter();

  // Loaded book state for edit mode
  const [initialLoading, setInitialLoading] = useState(Boolean(bookId));
  const [bookTitle, setBookTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCategory, setBookCategory] = useState("Fiction");
  const [bookAgeGroup, setBookAgeGroup] = useState("Adult");
  const [bookLanguage, setBookLanguage] = useState("English");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookTags, setBookTags] = useState("");

  // Author assignment
  const [attributionMode, setAttributionMode] = useState<"OWNER" | "AUTHOR">("OWNER");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");

  // Public domain / free title
  const [isPublicDomain, setIsPublicDomain] = useState(false);

  // Publish Status
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Formats
  const [selectedFormats, setSelectedFormats] = useState<FormatKey[]>(["EBOOK", "AUDIOBOOK"]);

  // Files state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [audiobookFile, setAudiobookFile] = useState<File | null>(null);
  const [interiorPdf, setInteriorPdf] = useState<File | null>(null);
  const [coverPdf, setCoverPdf] = useState<File | null>(null);

  // Existing file indicators
  const [existingEbookUrl, setExistingEbookUrl] = useState<string | null>(null);
  const [existingAudiobookUrl, setExistingAudiobookUrl] = useState<string | null>(null);

  // Pricing
  const [prices, setPrices] = useState<Record<FormatKey, string>>({
    EBOOK: "9.99",
    AUDIOBOOK: "14.99",
    PAPERBACK: "19.99",
    HARDCOVER: "29.99",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing book when bookId is provided
  useEffect(() => {
    if (!bookId) return;
    setInitialLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || "Failed to load book.");
        const data = payload.data || payload;

        if (data.title) setBookTitle(data.title);
        if (data.authorName) setAuthorName(data.authorName);
        if (data.description) setBookDescription(data.description);
        if (data.category) setBookCategory(data.category);
        if (data.ageGroup) setBookAgeGroup(data.ageGroup);
        if (data.language) setBookLanguage(data.language);
        if (data.isbn) setBookIsbn(data.isbn);
        if (Array.isArray(data.tags)) setBookTags(data.tags.join(", "));

        if (data.bookCover) setCoverPreview(data.bookCover);

        if (data.status === "APPROVED") {
          setPublishImmediately(true);
        } else {
          setPublishImmediately(false);
        }

        if (data.authorId) {
          setSelectedAuthorId(data.authorId);
          setAttributionMode("AUTHOR");
        } else {
          setAttributionMode("OWNER");
        }

        if (Array.isArray(data.formats) && data.formats.length > 0) {
          const fmts = data.formats.map((f: { formatType: FormatKey }) => f.formatType);
          setSelectedFormats(fmts);
          const newPrices = { ...prices };
          data.formats.forEach((f: { formatType: FormatKey; listPrice: number }) => {
            if (f.formatType && f.listPrice !== undefined) {
              newPrices[f.formatType] = String(f.listPrice);
            }
          });
          setPrices(newPrices);
        }

        if (Array.isArray(data.files)) {
          const eb = data.files.find((f: { type: string; url: string }) => f.type === "EBOOK");
          if (eb?.url) setExistingEbookUrl(eb.url);
          const ab = data.files.find((f: { type: string; url: string }) => f.type === "AUDIOBOOK");
          if (ab?.url) setExistingAudiobookUrl(ab.url);
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Error fetching book details.");
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [bookId, accessToken]);

  function handlePublicDomainToggle(checked: boolean) {
    setIsPublicDomain(checked);
    if (checked) {
      setAttributionMode("OWNER");
      setSelectedAuthorId("");
      setPrices((prev) => ({
        ...prev,
        EBOOK: "0.00",
        AUDIOBOOK: "0.00",
      }));
    } else {
      setPrices((prev) => ({
        ...prev,
        EBOOK: "9.99",
        AUDIOBOOK: "14.99",
      }));
    }
  }

  function toggleFormat(format: FormatKey) {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!coverPreview && !coverFile) {
      toast.error("Please upload a cover image for the book.");
      return;
    }

    if (!selectedFormats.length) {
      toast.error("Please select at least one format (eBook, Audiobook, etc.).");
      return;
    }

    if (selectedFormats.includes("EBOOK") && !ebookFile && !existingEbookUrl) {
      toast.error("Please upload an eBook file (.epub or .pdf).");
      return;
    }

    if (selectedFormats.includes("AUDIOBOOK") && !audiobookFile && !existingAudiobookUrl) {
      toast.error("Please upload an Audiobook audio file.");
      return;
    }

    if (attributionMode === "AUTHOR" && !selectedAuthorId) {
      toast.error("Please select an author from the list.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const body = new FormData();

    // Basic Metadata
    body.append("title", String(formData.get("title") || ""));
    const authorNameVal = String(formData.get("authorName") || authorName || "").trim();
    if (authorNameVal) body.append("authorName", authorNameVal);
    body.append("description", String(formData.get("description") || ""));
    body.append("category", String(formData.get("category") || ""));
    body.append("language", String(formData.get("language") || "English"));
    body.append("ageGroup", String(formData.get("ageGroup") || "Adult"));

    const isbn = formData.get("isbn");
    if (isbn) body.append("isbn", String(isbn));

    const tags = formData.get("tags");
    const tagList = tags
      ? String(tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (isPublicDomain && !tagList.some((t) => t.toLowerCase() === "public domain")) {
      tagList.push("Public Domain");
    }
    if (tagList.length > 0) {
      body.append("tags", JSON.stringify(tagList));
    }

    // Author Assignment & Royalty
    if (isPublicDomain) {
      // Public domain books carry no author royalty
      body.append("authorEarnings", "0");
    } else if (attributionMode === "AUTHOR" && selectedAuthorId) {
      body.append("authorId", selectedAuthorId);
    }

    // Direct Status for Admin
    body.append("status", publishImmediately ? "APPROVED" : "DRAFT");

    // Files
    if (coverFile) {
      body.append("bookCover", coverFile);
    }
    if (ebookFile && selectedFormats.includes("EBOOK")) {
      body.append("ebook", ebookFile);
    }
    if (audiobookFile && selectedFormats.includes("AUDIOBOOK")) {
      body.append("audiobook", audiobookFile);
    }
    if (interiorPdf && (selectedFormats.includes("PAPERBACK") || selectedFormats.includes("HARDCOVER"))) {
      body.append("interiorPdf", interiorPdf);
    }
    if (coverPdf && (selectedFormats.includes("PAPERBACK") || selectedFormats.includes("HARDCOVER"))) {
      body.append("coverPdf", coverPdf);
    }

    // Formats & Pricing
    const formatsPayload = selectedFormats.map((format) => ({
      formatType: format,
      listPrice: isPublicDomain ? 0 : parseFloat(prices[format] || "0"),
    }));
    body.append("formats", JSON.stringify(formatsPayload));

    setIsSubmitting(true);
    try {
      const url = bookId
        ? `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/books`;
      const method = bookId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (bookId ? "Failed to update book." : "Failed to upload book."));
      }

      toast.success(
        bookId
          ? "Book updated successfully!"
          : publishImmediately
          ? "Book published successfully! It is now live in the mobile app."
          : "Book saved as draft."
      );
      router.push("/admin-dashboard/books");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (bookId ? "Error updating book." : "Error uploading book."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin-dashboard/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6e19] hover:underline mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Books & Catalog</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {bookId ? "Edit Book" : "Upload New Book"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {bookId
              ? "Update book details, file attachments, and pricing in the catalog."
              : "Publish e-books and audiobooks directly to the Wonder Emporium mobile app."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin-dashboard/books"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#24352f] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#192621] transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{bookId ? "Updating Book..." : "Uploading to App..."}</span>
              </>
            ) : (
              <>
                <BookOpen className="size-4 text-[#cfaf45]" />
                <span>
                  {bookId
                    ? "Update Book"
                    : publishImmediately
                    ? "Publish to App Now"
                    : "Save as Draft"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Form Fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Author Attribution & App Status */}
          <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="size-5 text-[#24352f]" />
                <h2 className="text-base font-bold text-slate-900">Author Attribution & Publishing Status</h2>
              </div>

              {/* Attribution Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Publish As
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAttributionMode("OWNER")}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
                      attributionMode === "OWNER"
                        ? "border-[#24352f] bg-[#24352f]/5 ring-2 ring-[#24352f]/20"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <Library className="size-5 text-[#24352f] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Wonder Emporium (Owner)</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Published under the platform / owner catalog.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttributionMode("AUTHOR")}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
                      attributionMode === "AUTHOR"
                        ? "border-[#24352f] bg-[#24352f]/5 ring-2 ring-[#24352f]/20"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <UserCheck className="size-5 text-[#24352f] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Assign to Registered Author</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attribute to a specific author on the platform.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Author Dropdown if mode is AUTHOR */}
              {attributionMode === "AUTHOR" && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Select Author *
                  </label>
                  <select
                    value={selectedAuthorId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedAuthorId(id);
                      const found = authors.find((a) => a.id === id);
                      if (found) {
                        const calculated =
                          `${found.profile?.firstName || ""} ${found.profile?.lastName || ""}`.trim() ||
                          found.username;
                        if (calculated) setAuthorName(calculated);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  >
                    <option value="">Choose an author...</option>
                    {authors.map((author) => {
                      const name =
                        `${author.profile?.firstName || ""} ${author.profile?.lastName || ""}`.trim() ||
                        author.username;
                      return (
                        <option key={author.id} value={author.id}>
                          {name} ({author.email})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Direct Publish Option */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-4 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-950">Publish directly to Mobile App & Website</p>
                    <p className="text-xs text-emerald-700">
                      When enabled, the book is approved immediately and appears in the app and website catalog.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(e) => setPublishImmediately(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Public Domain / Free Title Option */}
              <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-4 border border-amber-200">
                <div className="flex items-center gap-3">
                  <Library className="size-5 text-[#8a6e19] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-950">Public Domain / Free Title</p>
                    <p className="text-xs text-amber-800">
                      Free for readers and listeners on the app and website. Carries zero author royalty ($0.00).
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublicDomain}
                    onChange={(e) => handlePublicDomainToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Book Details */}
          <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="size-5 text-[#24352f]" />
                <h2 className="text-base font-bold text-slate-900">Book Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Book Title *</label>
                  <input
                    name="title"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Echoes of the Enchanted Grove"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Author / Writer Name *</label>
                  <input
                    name="authorName"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. A.L Sykes or Eleanor Whitfield"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Compelling synopsis for readers..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Category *</label>
                  <select
                    name="category"
                    required
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Sci-Fi">Science Fiction</option>
                    <option value="Mystery">Mystery & Thriller</option>
                    <option value="Romance">Romance</option>
                    <option value="Children">Children's Books</option>
                    <option value="Young Adult">Young Adult</option>
                    <option value="Self-Help">Self-Help & Personal Growth</option>
                    <option value="Biography">Biography & Memoir</option>
                    <option value="Poetry">Poetry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Age Group</label>
                  <select
                    name="ageGroup"
                    value={bookAgeGroup}
                    onChange={(e) => setBookAgeGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Young Adult">Young Adult (12-18)</option>
                    <option value="Middle Grade">Middle Grade (8-12)</option>
                    <option value="Children">Children (0-8)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Language</label>
                  <input
                    name="language"
                    value={bookLanguage}
                    onChange={(e) => setBookLanguage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">ISBN (optional)</label>
                  <input
                    name="isbn"
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                    placeholder="e.g. 978-3-16-148410-0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Tags (comma-separated)</label>
                <input
                  name="tags"
                  value={bookTags}
                  onChange={(e) => setBookTags(e.target.value)}
                  placeholder="e.g. adventure, magic, bestseller, audio"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Formats & Digital Files */}
          <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="size-5 text-[#24352f]" />
                <h2 className="text-base font-bold text-slate-900">Formats & Digital Content Files</h2>
              </div>

              {/* Format Checkboxes */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Formats</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["EBOOK", "AUDIOBOOK", "PAPERBACK", "HARDCOVER"] as FormatKey[]).map((fmt) => (
                    <label
                      key={fmt}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-bold transition",
                        selectedFormats.includes(fmt)
                          ? "border-[#24352f] bg-[#24352f]/5 text-[#24352f]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(fmt)}
                        onChange={() => toggleFormat(fmt)}
                        className="rounded border-slate-300 text-[#24352f] focus:ring-[#cfaf45]"
                      />
                      <span>
                        {fmt === "EBOOK" ? "eBook" : fmt === "AUDIOBOOK" ? "Audiobook" : fmt === "PAPERBACK" ? "Paperback" : "Hardcover"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section: eBook */}
              {selectedFormats.includes("EBOOK") && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-[#8a6e19]" />
                      <h3 className="text-sm font-bold text-slate-900">eBook Configuration</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Price ($):</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPublicDomain}
                        value={isPublicDomain ? "0.00" : prices.EBOOK}
                        onChange={(e) => setPrices((prev) => ({ ...prev, EBOOK: e.target.value }))}
                        className={cn(
                          "w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-right font-semibold",
                          isPublicDomain && "bg-slate-100 text-slate-500 cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">eBook File (.epub or .pdf) *</label>
                    <input
                      type="file"
                      accept=".epub,.pdf,application/pdf,application/epub+zip"
                      onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#24352f] file:text-white hover:file:bg-[#1a2823] cursor-pointer"
                    />
                    {ebookFile && (
                      <p className="mt-1 text-xs text-emerald-600 font-medium">
                        ✓ Selected: {ebookFile.name} ({(ebookFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Audiobook */}
              {selectedFormats.includes("AUDIOBOOK") && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileAudio className="size-4 text-purple-600" />
                      <h3 className="text-sm font-bold text-slate-900">Audiobook Configuration</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Price ($):</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPublicDomain}
                        value={isPublicDomain ? "0.00" : prices.AUDIOBOOK}
                        onChange={(e) => setPrices((prev) => ({ ...prev, AUDIOBOOK: e.target.value }))}
                        className={cn(
                          "w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-right font-semibold",
                          isPublicDomain && "bg-slate-100 text-slate-500 cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Audiobook Audio File (.mp3, .m4a, .m4b) *</label>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.m4a,.m4b"
                      onChange={(e) => setAudiobookFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#24352f] file:text-white hover:file:bg-[#1a2823] cursor-pointer"
                    />
                    {audiobookFile && (
                      <p className="mt-1 text-xs text-emerald-600 font-medium">
                        ✓ Selected: {audiobookFile.name} ({(audiobookFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Print Editions (optional) */}
              {(selectedFormats.includes("PAPERBACK") || selectedFormats.includes("HARDCOVER")) && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Print Files (Interior & Cover PDF)</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Interior PDF</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setInteriorPdf(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Cover PDF</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setCoverPdf(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Cover Image & Preview */}
        <div className="space-y-6">
          <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5 sticky top-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Book Cover Image *</h2>
              <p className="text-xs text-slate-500">
                Used in the mobile app store, reader library, and audiobook player.
              </p>

              {coverPreview ? (
                <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover Preview" className="h-72 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-100/50 transition">
                  <Upload className="size-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to upload cover</p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP (Ratio 1:1.5 recommended)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Ready summary */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800">Publishing Checklist:</p>
                <div className="space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5">
                    {coverFile ? <CheckCircle className="size-3.5 text-emerald-500" /> : <span className="size-3.5 rounded-full border border-slate-300 inline-block" />}
                    <span>Cover Image</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    {selectedFormats.includes("EBOOK") && ebookFile ? <CheckCircle className="size-3.5 text-emerald-500" /> : selectedFormats.includes("EBOOK") ? <span className="size-3.5 rounded-full border border-slate-300 inline-block" /> : null}
                    {selectedFormats.includes("EBOOK") && <span>eBook File (.epub / .pdf)</span>}
                  </p>
                  <p className="flex items-center gap-1.5">
                    {selectedFormats.includes("AUDIOBOOK") && audiobookFile ? <CheckCircle className="size-3.5 text-emerald-500" /> : selectedFormats.includes("AUDIOBOOK") ? <span className="size-3.5 rounded-full border border-slate-300 inline-block" /> : null}
                    {selectedFormats.includes("AUDIOBOOK") && <span>Audiobook File (.mp3 / audio)</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
