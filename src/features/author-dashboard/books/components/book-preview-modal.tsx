"use client";

import { useState } from "react";
import {
  BookOpen,
  Eye,
  X,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export type PreviewFormatKey = "EBOOK" | "AUDIOBOOK" | "HARDCOVER" | "PAPERBACK";

export interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverUrl?: string | null;
  title: string;
  authorName?: string | null;
  description?: string | null;
  category?: string | null;
  language?: string | null;
  ageGroup?: string | null;
  formats?: PreviewFormatKey[] | string[];
  ebookFileName?: string | null;
  initialTab?: "cover" | "reader";
}

export function BookPreviewModal({
  isOpen,
  onClose,
  coverUrl,
  title,
  authorName,
  description,
  category,
  language,
  ageGroup,
  formats = ["EBOOK"],
  ebookFileName,
  initialTab = "cover",
}: BookPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"cover" | "reader">(initialTab);
  const [readerPage, setReaderPage] = useState(1);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState(18);

  if (!isOpen) return null;

  const displayTitle = title?.trim() || "Untitled Book";
  const displayAuthor = authorName?.trim() || "Author Name";
  const displayCategory = category || "Fiction";
  const displayLanguage = language || "English";
  const displayAgeGroup = ageGroup || "Adult";
  const displayDescription =
    description?.trim() ||
    "No book description provided yet. Add your synopsis in the details section to preview how readers will discover your story on Wonder Emporium.";

  // Reader sample text generation based on description or book theme
  const samplePages = [
    {
      page: 1,
      chapter: "Chapter I",
      subtitle: "The Beginning of the Journey",
      content: [
        displayDescription,
        "The wind carried an ancient whisper through the quiet corridors of the emporium, stirring pages that had remained unturned for decades. Every book held a secret, but this particular volume seemed alive with quiet anticipation.",
        "As morning light filtered through the stained-glass arches, illuminating dust motes dancing in the amber glow, the realization dawned: some stories do not merely ask to be read—they demand to be lived.",
      ],
    },
    {
      page: 2,
      chapter: "Chapter I (Continued)",
      subtitle: "Voices in the Archive",
      content: [
        "In the heart of the library stood the Great Index, bound in dark morocco leather and edged in tarnished gold. Generations of storytellers had inscribed their thoughts upon its vellum leaves.",
        "To hold a book is to hold the mind of another across distance and time. Here, between gilded covers and parchment sheets, memory transforms into something enduring, untouchable by the passing years.",
        "She ran her fingers along the embossed lettering of the spine, feeling the subtle press of history beneath her fingertips.",
      ],
    },
    {
      page: 3,
      chapter: "Chapter II",
      subtitle: "The Unfolding Tale",
      content: [
        "The subsequent days brought answers that only posed deeper questions. What began as a simple discovery rapidly unfolded into an adventure beyond the boundaries of the ordinary world.",
        "Characters once confined to whispered rumors stepped forward into sharp relief. Each chapter drew the reader deeper into the heart of Wonder Emporium, where art, craft, and imagination converged.",
      ],
    },
  ];

  const currentPageData = samplePages.find((p) => p.page === readerPage) || samplePages[0];

  const themeClasses = {
    light: "bg-[#fcfbf7] text-[#24352f] border-stone-200",
    sepia: "bg-[#f4ecd8] text-[#433422] border-[#e2d5bc]",
    dark: "bg-[#1a2321] text-[#e8eee9] border-[#2f3d38]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#faf8f2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#cfaf45]/20 text-[#8c7423]">
              <Eye className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">Book Preview</h2>
              <p className="text-xs text-slate-500">
                Experience how readers will see your book on the Wonder Emporium marketplace and inside the reader.
              </p>
            </div>
          </div>

          {/* Preview Tab Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-stone-200/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("cover")}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition ${
                  activeTab === "cover"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="size-3.5 text-[#cfaf45]" />
                <span>Storefront Cover</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reader")}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition ${
                  activeTab === "reader"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="size-3.5 text-[#cfaf45]" />
                <span>Inside the Book</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-2 flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-stone-200 hover:text-slate-700 transition"
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-stone-100 p-4 sm:p-8">
          {activeTab === "cover" ? (
            /* TAB 1: WEBSITE STOREFRONT / COVER PREVIEW */
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1 font-medium">
                  <ExternalLink className="size-3.5 text-[#cfaf45]" />
                  Website Storefront View: Wonder Emporium Book Details
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-900">
                  Live Mockup
                </span>
              </div>

              {/* Website Book Hero Card Mockup */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Left Column: Cover Showcase */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="relative aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-lg border-2 border-stone-300 bg-gradient-to-br from-[#24352f] to-[#121c18] shadow-xl">
                      {coverUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={coverUrl}
                          alt={displayTitle}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center p-6 text-center text-white">
                          <BookOpen className="size-16 text-[#cfaf45] opacity-80 mb-3" />
                          <h4 className="font-serif text-lg font-bold leading-snug line-clamp-2 text-[#fcfbf7]">
                            {displayTitle}
                          </h4>
                          <p className="mt-2 text-xs text-[#cfaf45] font-medium tracking-wider uppercase">
                            {displayAuthor}
                          </p>
                          <span className="mt-4 rounded border border-[#cfaf45]/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#cfaf45]">
                            Cover Placeholder
                          </span>
                        </div>
                      )}
                      {/* Storefront Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        <span className="inline-flex min-h-[22px] items-center bg-[#cfaf45] px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1a2321] rounded-sm shadow-sm">
                          Wonder Selection
                        </span>
                        <span className="inline-flex min-h-[22px] items-center bg-[#24352f] px-2.5 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm shadow-sm">
                          {displayCategory}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-xs text-slate-400">
                      High-resolution book cover as seen by marketplace readers
                    </p>
                  </div>

                  {/* Right Column: Book Details & Format Selector */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#a88922]">
                        {displayCategory} • {displayLanguage} • {displayAgeGroup}
                      </p>
                      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#24352f] leading-tight font-serif">
                        {displayTitle}
                      </h1>
                      <p className="mt-2 text-base text-slate-600">
                        By <span className="font-semibold text-[#24352f] underline decoration-[#cfaf45] underline-offset-4">{displayAuthor}</span>
                      </p>

                      {/* Mock Rating */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center text-[#cfaf45]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="size-4 fill-current stroke-current" />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-700">5.0</span>
                        <span>(New Release)</span>
                      </div>

                      {/* Available Formats Bar */}
                      <div className="mt-6 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Available Formats:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {formats.map((fmt) => (
                            <div
                              key={String(fmt)}
                              className="flex items-center gap-2 rounded-lg border-2 border-[#cfaf45] bg-[#faf8f2] px-3.5 py-2 text-xs font-bold text-[#8c7423]"
                            >
                              <BookOpen className="size-3.5" />
                              <span>{String(fmt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Synopsis */}
                      <div className="mt-6 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Synopsis & Description
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-700 line-clamp-6">
                          {displayDescription}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar Mockup */}
                    <div className="border-t border-stone-200 pt-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("reader")}
                          className="flex items-center gap-2 rounded-lg bg-[#24352f] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#1a2823] transition"
                        >
                          <BookOpen className="size-4 text-[#cfaf45]" />
                          <span>Read Free Sample</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-stone-50 transition"
                        >
                          <ShoppingBag className="size-4 text-[#8c7423]" />
                          <span>Buy Book</span>
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Readers can preview opening chapters directly inside the browser or mobile reader.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: INSIDE THE BOOK / READER VIEW */
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Reader Preferences Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theme:</span>
                  <div className="flex rounded-md border border-stone-300 overflow-hidden text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setReaderTheme("light")}
                      className={`px-3 py-1 transition ${
                        readerTheme === "light"
                          ? "bg-[#24352f] text-white"
                          : "bg-white text-slate-700 hover:bg-stone-50"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme("sepia")}
                      className={`px-3 py-1 transition ${
                        readerTheme === "sepia"
                          ? "bg-[#8c7423] text-white"
                          : "bg-[#f4ecd8] text-[#433422] hover:bg-[#ebd8b3]"
                      }`}
                    >
                      Sepia
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme("dark")}
                      className={`px-3 py-1 transition ${
                        readerTheme === "dark"
                          ? "bg-[#121c18] text-white border-l border-stone-700"
                          : "bg-[#24352f] text-stone-200 hover:bg-[#1a2823]"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Size:</span>
                  <div className="flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setReaderFontSize(Math.max(14, readerFontSize - 2))}
                      disabled={readerFontSize <= 14}
                      className="rounded px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      A-
                    </button>
                    <span className="px-2 text-xs font-semibold text-slate-600">{readerFontSize}px</span>
                    <button
                      type="button"
                      onClick={() => setReaderFontSize(Math.min(26, readerFontSize + 2))}
                      disabled={readerFontSize >= 26}
                      className="rounded px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  Page {readerPage} of {samplePages.length}
                  {ebookFileName && (
                    <span className="ml-2 font-normal text-slate-400">({ebookFileName})</span>
                  )}
                </div>
              </div>

              {/* Reader Book Page Simulation */}
              <div
                className={`relative min-h-[480px] rounded-xl border p-8 sm:p-14 shadow-md transition-colors duration-200 ${
                  themeClasses[readerTheme]
                }`}
              >
                {/* Book Header Inside Reader */}
                <div className="mb-8 flex items-center justify-between border-b border-current/15 pb-4 text-xs opacity-70">
                  <span className="truncate font-serif italic tracking-wide">{displayTitle}</span>
                  <span className="tracking-widest uppercase font-semibold">{currentPageData.chapter}</span>
                </div>

                {/* Chapter Title & Interior Layout */}
                <div className="space-y-6">
                  <div className="text-center space-y-1 mb-8">
                    <h3 className="font-serif text-2xl font-bold tracking-tight">
                      {currentPageData.chapter}
                    </h3>
                    <p className="font-serif italic text-sm opacity-80">
                      {currentPageData.subtitle}
                    </p>
                    <div className="mx-auto mt-3 h-0.5 w-12 bg-[#cfaf45]/80" />
                  </div>

                  <div
                    className="font-serif leading-relaxed space-y-5"
                    style={{ fontSize: `${readerFontSize}px` }}
                  >
                    {currentPageData.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className={`text-justify ${
                          idx === 0 && readerPage === 1 ? "first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-bold first-letter:text-[#cfaf45]" : ""
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Book Footer Inside Reader */}
                <div className="mt-12 flex items-center justify-between border-t border-current/15 pt-4 text-xs opacity-70">
                  <span>Wonder Emporium Reader</span>
                  <span className="font-serif font-bold">~ {readerPage} ~</span>
                </div>
              </div>

              {/* Reader Pagination Controls */}
              <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  onClick={() => setReaderPage(Math.max(1, readerPage - 1))}
                  disabled={readerPage <= 1}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous Page</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {samplePages.map((p) => (
                    <button
                      key={p.page}
                      type="button"
                      onClick={() => setReaderPage(p.page)}
                      className={`flex size-8 items-center justify-center rounded text-xs font-bold transition ${
                        readerPage === p.page
                          ? "bg-[#24352f] text-white"
                          : "text-slate-600 hover:bg-stone-100"
                      }`}
                    >
                      {p.page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReaderPage(Math.min(samplePages.length, readerPage + 1))}
                  disabled={readerPage >= samplePages.length}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-50 disabled:opacity-40 transition"
                >
                  <span>Next Page</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-[#faf8f2] px-6 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Interactive Author Preview Mode</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
