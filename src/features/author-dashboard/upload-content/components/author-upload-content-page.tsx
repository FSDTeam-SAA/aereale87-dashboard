"use client";

import { FormEvent, useEffect, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  FileAudio,
  FileText,
  Save,
  Package,
  Calculator,
  Eye,
  X,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  ExternalLink,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormatKey = "EBOOK" | "AUDIOBOOK" | "HARDCOVER" | "PAPERBACK";
type PrintFormatKey = Extract<FormatKey, "HARDCOVER" | "PAPERBACK">;

type EditBook = {
  title: string;
  description: string | null;
  bookCover?: string | null;
  isbn: string | null;
  category: string | null;
  tags: string[];
  language: string | null;
  ageGroup: string | null;
  formats: Array<{ formatType: FormatKey; listPrice: number; pageCount?: number; trimSize?: string }>;
  status: string;
};

type BookTypeOption = { value: string; label: string; trimSku: string };
type SkuOption = { value: string; label?: string; sku: string; minPage?: number; maxPage?: number };

type SpecificationOptions = {
  bookTypes: BookTypeOption[];
  interiorColors: SkuOption[];
  printQualities: SkuOption[];
  bindings: { paperback: SkuOption[]; hardcover: SkuOption[] };
  paperTypes: SkuOption[];
  laminations: SkuOption[];
  linenColors: SkuOption[];
  foilColors: SkuOption[];
  printInsideCover: SkuOption[];
};

type AvailableSpecificationOptions = Omit<SpecificationOptions, "bindings"> & {
  bindings: SkuOption[];
  count?: number;
  valid?: boolean;
  validPageRange?: { minPage: number; maxPage: number } | null;
};

type MatchResult = {
  found: boolean;
  sku: string | null;
  minPage: number | null;
  maxPage: number | null;
  pricing: {
    basePriceUSD: number;
    perPagePriceUSD: number;
  } | null;
};

type PrintFileValidationResult = {
  valid: boolean;
  message?: string;
  podPackageId?: string;
  interiorPageCount?: number;
  coverDimensions?: { width: string; height: string; unit: string };
};

type PrintOptionsResponse = {
  paperback: Array<{ newSku: string }>;
  hardcover: Array<{ newSku: string }>;
  categories: {
    bookTypes: Array<{ value: string; label: string }>;
    paperbackBindings: Array<{ value: string; label: string }>;
    hardcoverBindings: Array<{ value: string; label: string }>;
  };
};

const formatLabels: Record<FormatKey, string> = {
  EBOOK: "eBook",
  AUDIOBOOK: "Audiobook",
  HARDCOVER: "Hardcover",
  PAPERBACK: "Paperback",
};

export function AuthorUploadContentPage({
  accessToken,
  isFoundingAuthor,
  authorName = "Author",
}: {
  accessToken: string;
  isFoundingAuthor?: boolean;
  authorName?: string;
}) {
  const router = useRouter();
  const bookId = useSearchParams().get("bookId");
  const [book, setBook] = useState<EditBook | null>(null);
  const [formats, setFormats] = useState<FormatKey[]>(["EBOOK"]);
  const [pending, setPending] = useState(false);
  const [specOptions, setSpecOptions] = useState<SpecificationOptions | null>(null);
  const [printOptions, setPrintOptions] = useState<PrintOptionsResponse | null>(null);
  const [matchedSpecs, setMatchedSpecs] = useState<Record<string, MatchResult>>({});
  const [fileValidationPending, setFileValidationPending] = useState<Record<string, boolean>>({});
  const [fileValidations, setFileValidations] = useState<Record<string, PrintFileValidationResult>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/print/specifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        setSpecOptions(unwrapApiData<SpecificationOptions>(payload));
      })
      .catch((error: Error) => toast.error(error.message || "Unable to load print specifications."));
  }, [accessToken]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/print/options`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        setPrintOptions(unwrapApiData<PrintOptionsResponse>(payload));
      })
      .catch((error: Error) =>
        toast.error(error.message || "Unable to load print option catalog."),
      );
  }, [accessToken]);

  const [distributionPath, setDistributionPath] = useState<"exclusive" | "wide">("exclusive");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [ebookFileName, setEbookFileName] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"cover" | "reader">("cover");
  const [readerPage, setReaderPage] = useState(1);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState<number>(18);

  // Form field mirrors for live preview
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");
  const [previewCategory, setPreviewCategory] = useState("Fiction");
  const [previewLanguage, setPreviewLanguage] = useState("English");
  const [previewAgeGroup, setPreviewAgeGroup] = useState("Adult");

  const [tagInputs, setTagInputs] = useState<string[]>(["", "", "", "", "", ""]);

  useEffect(() => {
    if (!bookId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        setBook(payload.data);
        setFormats(payload.data.formats.map((format: { formatType: FormatKey }) => format.formatType));
        if (payload.data.bookCover) {
          setCoverPreviewUrl(payload.data.bookCover);
        }
        if (payload.data.title) setPreviewTitle(payload.data.title);
        if (payload.data.description) setPreviewDescription(payload.data.description);
        if (payload.data.category) setPreviewCategory(payload.data.category);
        if (payload.data.language) setPreviewLanguage(payload.data.language);
        if (payload.data.ageGroup) setPreviewAgeGroup(payload.data.ageGroup);
        if (payload.data.distributionPath) {
          setDistributionPath(payload.data.distributionPath);
        }
        if (Array.isArray(payload.data.tags)) {
          const loadedTags = [...payload.data.tags];
          while (loadedTags.length < 6) {
            loadedTags.push("");
          }
          setTagInputs(loadedTags.slice(0, 6));
        }
      })
      .catch((error: Error) => toast.error(error.message || "Unable to load book."));
  }, [accessToken, bookId]);

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  }

  function handleEbookFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setEbookFileName(file.name);
    }
  }

  function toggleFormat(format: FormatKey) {
    setFormats((current) => (current.includes(format) ? current.filter((item) => item !== format) : [...current, format]));
  }

  const handleSpecMatch = useCallback((format: string, result: MatchResult) => {
    setMatchedSpecs((prev) => ({ ...prev, [format]: result }));
    setFileValidations((prev) => ({ ...prev, [format]: { valid: false, message: "Validate files after choosing print options." } }));
  }, []);

  async function validatePrintFiles(format: PrintFormatKey, button: HTMLButtonElement) {
    const form = button.form;
    if (!form) return;
    const source = new FormData(form);
    const interiorPdf = source.get("interiorPdf");
    const coverPdf = source.get("coverPdf");
    const match = matchedSpecs[format];
    if (!match?.sku) return toast.error("Choose a valid print configuration before validating files.");
    if (!(interiorPdf instanceof File) || !interiorPdf.size || !(coverPdf instanceof File) || !coverPdf.size) {
      return toast.error("Choose both Interior PDF and Cover PDF before validation.");
    }

    const body = new FormData();
    body.set("interiorPdf", interiorPdf);
    body.set("coverPdf", coverPdf);
    body.set("podPackageId", match.sku);
    body.set("pageCount", String(source.get(`${format}-pages`) || ""));

    setFileValidationPending((prev) => ({ ...prev, [format]: true }));
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/validate-print-files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    });
    const payload = await response.json();
    const data = unwrapApiData<PrintFileValidationResult>(payload);
    setFileValidationPending((prev) => ({ ...prev, [format]: false }));
    setFileValidations((prev) => ({ ...prev, [format]: data }));
    if (!response.ok || !data.valid) return toast.error(data.message || payload.message || "Print files did not validate.");
    toast.success("Print files validated.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    if (!formats.length) return toast.error("Select at least one book format.");
    const body = new FormData();
    ["title", "description", "isbn", "category", "language", "ageGroup"].forEach((key) => {
      const value = source.get(key);
      if (value) body.set(key, value);
    });
    const processedTags = tagInputs
      .map((t) => t.trim())
      .filter(Boolean);
    body.set("tags", JSON.stringify(processedTags));
    body.set(
      "formats",
      JSON.stringify(
        formats.map((formatType) => ({
          formatType,
          listPrice: Number(source.get(`${formatType}-price`) || 0),
          pageCount: ["HARDCOVER", "PAPERBACK"].includes(formatType) ? Number(source.get(`${formatType}-pages`) || 0) : undefined,
          trimSize: ["HARDCOVER", "PAPERBACK"].includes(formatType) ? String(source.get(`${formatType}-bookType`) || "US Trade") : undefined,
        })),
      ),
    );

    const fileFields = ["bookCover", "ebook", "audiobook", "interiorPdf", "coverPdf"] as const;
    fileFields.forEach((field) => {
      const file = source.get(field);
      if (file instanceof File && file.size > 0) body.set(field, file);
    });

    const printFormat = formats.find((format): format is PrintFormatKey => format === "HARDCOVER" || format === "PAPERBACK");
    const hasPrint = Boolean(printFormat);
    if (hasPrint) {
      const interiorPdf = source.get("interiorPdf");
      const coverPdf = source.get("coverPdf");
      if (!bookId && (!(interiorPdf instanceof File) || !interiorPdf.size || !(coverPdf instanceof File) || !coverPdf.size)) {
        return toast.error("Print editions require both interior and cover PDF files.");
      }
      const selectedPrintFormat = printFormat as PrintFormatKey;
      const matchResult = matchedSpecs[selectedPrintFormat];
      const fileValidation = fileValidations[selectedPrintFormat];
      if (!fileValidation?.valid) {
        return toast.error("Validate the interior and cover PDFs before saving.");
      }
      const paper = parsePaperSelection(String(source.get(`${selectedPrintFormat}-paperType`) || ""));
      body.set(
        "printEdition",
        JSON.stringify({
          enabled: true,
          bookType: String(source.get(`${selectedPrintFormat}-bookType`) || "US Trade"),
          trimSize: String(source.get(`${selectedPrintFormat}-bookType`) || "US Trade"),
          interiorColor: String(source.get(`${selectedPrintFormat}-interiorColor`) || "Black & White"),
          printQuality: String(source.get(`${selectedPrintFormat}-printQuality`) || "Standard"),
          bindingType: String(source.get(`${selectedPrintFormat}-binding`) || "Perfect"),
          paperType: paper.paperType,
          interiorPpi: paper.interiorPpi,
          coverFinish: String(source.get(`${selectedPrintFormat}-lamination`) || "Gloss"),
          linenColor: String(source.get(`${selectedPrintFormat}-linenColor`) || "X"),
          foilColor: String(source.get(`${selectedPrintFormat}-foilColor`) || "X"),
          printInsideCover: String(source.get(`${selectedPrintFormat}-printInsideCover`) || "No"),
          podPackageId: matchResult?.sku || "",
          authorProfit: 0,
          sellingPrice: Number(source.get(`${selectedPrintFormat}-price`) || 0),
        }),
      );
    }

    setPending(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books${bookId ? `/${bookId}` : ""}`, {
      method: bookId ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) return toast.error(payload.message || "Unable to save book.");
    toast.success(bookId ? "Book updated." : "Draft book created.");
    router.push("/author-dashboard/books");
    router.refresh();
  }

  return (
    <form key={`${bookId || "new"}-${book?.title || "loading"}`} onSubmit={submit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a88922]">Author workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{bookId ? "Edit book" : "List a new book"}</h1>
          <p className="mt-2 text-slate-500">Save the listing as a draft, then submit it for review from My Books.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-[#cfaf45] bg-[#faf8f2] px-5 text-sm font-bold text-[#8c7423] shadow-sm transition hover:bg-[#cfaf45] hover:text-white"
        >
          <Eye className="size-4" />
          <span>Preview Book</span>
        </button>
      </div>
      <div className="grid gap-6">
        <Card className="rounded-none bg-white">
          <CardContent className="space-y-5 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="size-5" />
              Book information
            </h2>
            {printOptions ? (
              <div className="rounded-md border border-[#eadfbf] bg-[#fff9ea] p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Live print option catalog loaded</p>
                <p className="mt-1">
                  {printOptions.categories.bookTypes.length} book types,{" "}
                  {printOptions.paperback.length} paperback combinations, and{" "}
                  {printOptions.hardcover.length} hardcover combinations are available from the backend print options API.
                </p>
              </div>
            ) : null}
            <Field
              label="Book title"
              name="title"
              defaultValue={book?.title}
              onChange={(e) => setPreviewTitle(e.target.value)}
              required
            />
            <TextArea
              label="Description"
              name="description"
              defaultValue={book?.description || ""}
              onChange={(e) => setPreviewDescription(e.target.value)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ISBN (optional)" name="isbn" defaultValue={book?.isbn || ""} />
              <Field
                label="Category"
                name="category"
                defaultValue={book?.category || ""}
                onChange={(e) => setPreviewCategory(e.target.value)}
                required
              />
              <Field
                label="Language"
                name="language"
                defaultValue={book?.language || "English"}
                onChange={(e) => setPreviewLanguage(e.target.value)}
                required
              />
              <SelectField
                label="Age group"
                name="ageGroup"
                defaultValue={book?.ageGroup || "Adult"}
                onChange={(e) => setPreviewAgeGroup(e.target.value)}
                required
              >
                <option value="Adult">Adult</option>
                <option value="Teen (ages 15–18)">Teen (ages 15–18)</option>
                <option value="Preteen (ages 9–14)">Preteen (ages 9–14)</option>
                <option value="Children (ages 0–8)">Children (ages 0–8)</option>
              </SelectField>
            </div>
            {/* Redesigned Tags Section: Separate individual fields (6 tags) */}
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-[#cfaf45]" />
                  <span className="text-sm font-bold text-slate-800">
                    Book Tags & Keywords
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Add up to 6 individual tags to help readers discover your book
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tagInputs.map((tagVal, index) => (
                  <div key={index} className="relative">
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600">
                        Tag {index + 1}
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          name={`tag_${index + 1}`}
                          value={tagVal}
                          placeholder={
                            index === 0
                              ? "e.g. Fantasy"
                              : index === 1
                              ? "e.g. Young Adult"
                              : index === 2
                              ? "e.g. Magic"
                              : index === 3
                              ? "e.g. Adventure"
                              : index === 4
                              ? "e.g. Mystery"
                              : "e.g. Best Seller"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setTagInputs((prev) => {
                              const updated = [...prev];
                              updated[index] = val;
                              return updated;
                            });
                          }}
                          className="h-10 w-full rounded border border-slate-300 bg-white px-3 pr-8 text-xs text-slate-800 outline-none transition focus:border-[#cfaf45] focus:ring-1 focus:ring-[#cfaf45]"
                        />
                        {tagVal && (
                          <button
                            type="button"
                            onClick={() => {
                              setTagInputs((prev) => {
                                const updated = [...prev];
                                updated[index] = "";
                                return updated;
                              });
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={`Clear tag ${index + 1}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Live Tag Pills Preview */}
              {tagInputs.some((t) => t.trim().length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-medium text-slate-500 mr-1">Preview:</span>
                  {tagInputs
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-[#cfaf45]/15 border border-[#cfaf45]/40 px-2.5 py-0.5 text-xs font-semibold text-[#8c7423]"
                      >
                        #{t}
                      </span>
                    ))}
                </div>
              )}
            </div>
            <div>
              <FileField
                label="Book cover (used for all formats)"
                name="bookCover"
                accept="image/*"
                required={!bookId && !coverPreviewUrl}
                onChange={handleCoverFileChange}
              />
              {coverPreviewUrl && (
                <div className="mt-3 flex items-center gap-4 rounded border border-slate-200 bg-slate-50 p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded border border-slate-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreviewUrl} alt="Cover preview thumbnail" className="size-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700">Cover image selected</p>
                    <p className="text-xs text-slate-500">Ready to preview on website mockups.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTab("cover");
                      setShowPreviewModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#8c7423] hover:underline"
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-none bg-white">
        <CardContent className="space-y-5 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <FileText className="size-5" />
            Formats and pricing
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(formatLabels) as FormatKey[]).map((format) => (
              <label key={format} className="flex cursor-pointer items-center gap-2 border border-slate-200 p-3">
                <input type="checkbox" checked={formats.includes(format)} onChange={() => toggleFormat(format)} />
                {formatLabels[format]}
              </label>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {formats.map((format) => (
              <div key={format} className="space-y-4 rounded border border-slate-200 p-5 bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">{formatLabels[format]} Details</h3>
                {format === "EBOOK" && <FileField label="eBook file (.pdf, .epub)" name="ebook" accept=".pdf,.epub" onChange={handleEbookFileChange} />}
                {format === "AUDIOBOOK" && <FileField label="Audiobook file" name="audiobook" accept="audio/*" />}
                {["HARDCOVER", "PAPERBACK"].includes(format) && (
                  <>
                    <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
                      Print editions require print-ready interior and cover PDF files.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FileField label="Interior PDF" name="interiorPdf" accept="application/pdf" onChange={handleEbookFileChange} />
                      <FileField label="Cover PDF" name="coverPdf" accept="application/pdf" />
                    </div>
                    <PrintSpecSelector format={format as PrintFormatKey} accessToken={accessToken} specOptions={specOptions} onMatch={handleSpecMatch} defaultPageCount={book?.formats.find((item) => item.formatType === format)?.pageCount} />
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <button
                        type="button"
                        disabled={fileValidationPending[format]}
                        onClick={(event) => validatePrintFiles(format as PrintFormatKey, event.currentTarget)}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {fileValidationPending[format] ? "Validating..." : "Validate print files"}
                      </button>
                      {fileValidations[format]?.valid && (
                        <p className="mt-3 text-sm text-emerald-700">
                          Files validated. Cover size: {fileValidations[format].coverDimensions?.width} x {fileValidations[format].coverDimensions?.height} {fileValidations[format].coverDimensions?.unit}.
                        </p>
                      )}
                      {fileValidations[format] && !fileValidations[format].valid && (
                        <p className="mt-3 text-sm text-red-700">{fileValidations[format].message || "Files are not validated yet."}</p>
                      )}
                    </div>
                  </>
                )}
                <div className="grid gap-4 sm:grid-cols-2 items-end">
                  <Field label="List price (USD)" name={`${format}-price`} type="number" step="0.01" min="0" defaultValue={book?.formats.find((item) => item.formatType === format)?.listPrice ?? ""} required />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-none bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <CardHeader className="px-5 py-4 border-b border-[#e7e1d5]">
          <CardTitle className="flex items-center gap-2 text-[18px] font-bold text-[#23272e]">
            <Calculator className="size-5 text-[#cb9f10]" />
            Royalty Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <RoyaltyCalculator
            isFoundingAuthor={isFoundingAuthor}
            distributionPath={distributionPath}
            onDistributionPathChange={setDistributionPath}
          />
        </CardContent>
      </Card>
      <Card className="rounded-none bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <CardHeader className="px-5 py-4 border-b border-[#e7e1d5]">
          <CardTitle className="text-[18px] font-bold text-[#23272e]">
            Distribution Path & Royalty Tier <span className="text-[#d16b37]">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {/* Hidden input to include selected distribution path in formData */}
          <input type="hidden" name="distributionPath" value={distributionPath} />
          {isFoundingAuthor ? (
            <div className="rounded-lg border-2 border-[#cfaf45] bg-[#faf8f2] p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-3 rounded-full bg-[#cfaf45]" />
                  <h3 className="text-xl font-bold text-[#23272e]">
                    Founding Author Royalty Tier (First 100 Authors)
                  </h3>
                </div>
                <span className="rounded-full bg-[#cfaf45]/20 px-3 py-1 text-xs font-bold text-[#8c7423]">
                  Lifetime Locked Rate
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#23272e]">85%</span>
                <span className="text-sm font-semibold text-slate-600">
                  Author Royalty / 15% Company Fee
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                As a Founding Author, you receive an <strong>85% royalty split</strong> across all formats and distribution channels. Exclusivity-based percentage reductions apply only to standard authors who join after the founding group closes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Select your distribution path below. Your royalty split and calculator will automatically update based on your selection:
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                <DistributionPathCard
                  title="WE Exclusive"
                  percentage="65%"
                  description="Maximum standard earnings. Your book is sold exclusively through the Wonder Emporium marketplace."
                  selected={distributionPath === "exclusive"}
                  onSelect={() => setDistributionPath("exclusive")}
                />
                <DistributionPathCard
                  title="Wide Distribution"
                  percentage="45%"
                  description="Expanded reach. Distribute to Amazon, Barnes & Noble, and independent bookstores globally."
                  selected={distributionPath === "wide"}
                  onSelect={() => setDistributionPath("wide")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={pending || (book != null && !["DRAFT", "REJECTED"].includes(book.status))}
          className="inline-flex h-12 items-center gap-2 rounded-md bg-[#cfaf45] px-6 font-semibold text-white hover:bg-[#b79731] disabled:opacity-50 shadow-sm"
        >
          <Save className="size-4" />
          {pending ? "Saving..." : bookId ? "Save changes" : "Create draft"}
        </button>
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="inline-flex h-12 items-center gap-2 rounded-md border-2 border-[#cfaf45] bg-[#faf8f2] px-6 text-sm font-bold text-[#8c7423] hover:bg-[#cfaf45] hover:text-white transition shadow-sm"
        >
          <Eye className="size-4" />
          <span>Preview Book</span>
        </button>
      </div>

      {showPreviewModal && (
        <BookPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          activeTab={previewTab}
          onTabChange={setPreviewTab}
          coverUrl={coverPreviewUrl}
          title={previewTitle || (book?.title ?? "")}
          authorName={authorName || "Author Name"}
          description={previewDescription || (book?.description ?? "")}
          category={previewCategory || (book?.category ?? "General")}
          language={previewLanguage || (book?.language ?? "English")}
          ageGroup={previewAgeGroup || (book?.ageGroup ?? "Adult")}
          formats={formats}
          ebookFileName={ebookFileName}
          readerPage={readerPage}
          onPageChange={setReaderPage}
          readerTheme={readerTheme}
          onThemeChange={setReaderTheme}
          readerFontSize={readerFontSize}
          onFontSizeChange={setReaderFontSize}
        />
      )}
    </form>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input {...props} className="h-11 w-full border border-slate-300 bg-slate-50 px-3 outline-none focus:border-[#cfaf45]" />
    </label>
  );
}

function SelectField({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <select
        {...props}
        className="h-11 w-full border border-slate-300 bg-slate-50 px-3 outline-none focus:border-[#cfaf45] text-sm text-slate-900"
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <textarea {...props} rows={5} className="w-full border border-slate-300 bg-slate-50 p-3 outline-none focus:border-[#cfaf45]" />
    </label>
  );
}

function FileField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <FileAudio className="size-4" />
        {label}
      </span>
      <input type="file" {...props} className="block w-full border border-dashed border-slate-300 bg-slate-50 p-3 text-sm" />
    </label>
  );
}

function PrintSpecSelector({
  format,
  accessToken,
  specOptions,
  onMatch,
  defaultPageCount,
}: {
  format: PrintFormatKey;
  accessToken: string;
  specOptions: SpecificationOptions | null;
  onMatch: (format: string, result: MatchResult) => void;
  defaultPageCount?: number;
}) {
  const [bookType, setBookType] = useState("");
  const [pageCount, setPageCount] = useState(defaultPageCount ? String(defaultPageCount) : "");
  const [availableOptions, setAvailableOptions] = useState<AvailableSpecificationOptions | null>(null);
  const [interiorColor, setInteriorColor] = useState("");
  const [printQuality, setPrintQuality] = useState("");
  const [binding, setBinding] = useState("");
  const [paperType, setPaperType] = useState("");
  const [lamination, setLamination] = useState("");
  const [linenColor, setLinenColor] = useState("X");
  const [foilColor, setFoilColor] = useState("X");
  const [printInsideCover, setPrintInsideCover] = useState("No");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const availableBindings = useMemo(() => {
    if (availableOptions?.bindings?.length) return availableOptions.bindings;
    if (!specOptions?.bindings) return [];
    return format === "HARDCOVER" ? (specOptions.bindings.hardcover ?? []) : (specOptions.bindings.paperback ?? []);
  }, [availableOptions, specOptions, format]);

  const bookTypes = useMemo(() => specOptions?.bookTypes?.map((bt) => bt.value) ?? [], [specOptions]);
  const bookTypeLabels = useMemo(
    () => Object.fromEntries((specOptions?.bookTypes ?? []).map((bookType) => [bookType.value, bookType.label])),
    [specOptions],
  );
  const selectedBookType = bookType || bookTypes[0] || "";
  const interiorColors = availableOptions?.interiorColors?.map((c) => c.value) ?? [];
  const printQualities = availableOptions?.printQualities?.map((q) => q.value) ?? [];
  const paperTypes = availableOptions?.paperTypes?.map((p) => p.value) ?? [];
  const laminations = availableOptions?.laminations?.map((l) => l.value) ?? [];
  const linenColors = availableOptions?.linenColors?.map((c) => c.value) ?? [];
  const foilColors = availableOptions?.foilColors?.map((f) => f.value) ?? [];
  const printInsideCoverOptions = availableOptions?.printInsideCover?.map((f) => f.value) ?? [];

  useEffect(() => {
    if (!specOptions || !selectedBookType || !pageCount) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/print/specifications/available`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ format, bookType: selectedBookType, pageCount: Number(pageCount) }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        const data = unwrapApiData<AvailableSpecificationOptions>(payload);
        setAvailableOptions(data);
        setInteriorColor(data.interiorColors?.[0]?.value || "");
        setPrintQuality(data.printQualities?.[0]?.value || "");
        setBinding(data.bindings?.[0]?.value || "");
        setPaperType(data.paperTypes?.[0]?.value || "");
        setLamination(data.laminations?.[0]?.value || "");
        setLinenColor("X");
        setFoilColor("X");
        setPrintInsideCover(data.printInsideCover?.[0]?.value || "No");
        setMatchResult(null);
      })
      .catch(() => setAvailableOptions(null));
  }, [specOptions, selectedBookType, pageCount, format, accessToken]);

  const isLinenWrap = binding === "Linen Wrap";

  const allSelectionsReady = selectedBookType && pageCount && interiorColor && printQuality && binding && paperType && lamination;

  useEffect(() => {
    if (!specOptions || !allSelectionsReady) return;

    const fetchMatch = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/print/match`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookType: selectedBookType,
            pageCount: Number(pageCount),
            interiorColor,
            printQuality,
            bind: binding,
            paperType,
            interiorPpi: parsePaperSelection(paperType).interiorPpi,
            lamination,
            linenColor,
            foilColor,
            printInsideCover,
          }),
        });
        const payload = await response.json();
        const data = unwrapApiData<MatchResult>(payload);
        if (response.ok && data) {
          setMatchResult(data);
          onMatch(format, data);
        }
      } catch {
        setMatchResult(null);
        onMatch(format, { found: false, sku: null, minPage: null, maxPage: null, pricing: null });
      }
    };

    fetchMatch();
  }, [specOptions, allSelectionsReady, selectedBookType, pageCount, interiorColor, printQuality, binding, paperType, lamination, linenColor, foilColor, printInsideCover, format, accessToken, onMatch]);

  if (!specOptions) {
    return (
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-400">Loading print specifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SpecSelectField label="Book type / trim" name={`${format}-bookType`} options={bookTypes} labels={bookTypeLabels} value={selectedBookType} onChange={setBookType} />
        <Field label="Page count" name={`${format}-pages`} type="number" min="1" value={pageCount} onChange={(event) => setPageCount(event.target.value)} required />
      </div>

      {availableOptions?.valid === false && (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">No Lulu package supports this book type with {pageCount} pages. Change the page count or book type.</p>
        </div>
      )}

      {availableOptions?.validPageRange && (
        <div className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-600">
          Valid package range for current selection: {availableOptions.validPageRange.minPage} - {availableOptions.validPageRange.maxPage} pages.
        </div>
      )}

      {availableOptions?.valid ? <div className="grid gap-4 sm:grid-cols-2">
        <SpecSelectField label="Interior color" name={`${format}-interiorColor`} options={interiorColors} value={interiorColor} onChange={setInteriorColor} />
        <SpecSelectField label="Print quality" name={`${format}-printQuality`} options={printQualities} value={printQuality} onChange={setPrintQuality} />
        <SpecSelectField label="Binding type" name={`${format}-binding`} options={availableBindings.map((b) => b.value)} labels={Object.fromEntries(availableBindings.map((b) => [b.value, b.label || b.value]))} value={binding} onChange={setBinding} />
        <SpecSelectField label="Paper type" name={`${format}-paperType`} options={paperTypes} value={paperType} onChange={setPaperType} />
        <SpecSelectField label="Cover finish" name={`${format}-lamination`} options={laminations} value={lamination} onChange={setLamination} />
        {isLinenWrap && (
          <SpecSelectField label="Linen color" name={`${format}-linenColor`} options={linenColors} value={linenColor} onChange={setLinenColor} />
        )}
        {isLinenWrap && (
          <SpecSelectField label="Foil color" name={`${format}-foilColor`} options={foilColors} value={foilColor} onChange={setFoilColor} />
        )}
        {!isLinenWrap && <input type="hidden" name={`${format}-linenColor`} value="X" />}
        {!isLinenWrap && <input type="hidden" name={`${format}-foilColor`} value="X" />}
        <SpecSelectField label="Print inside cover" name={`${format}-printInsideCover`} options={printInsideCoverOptions} value={printInsideCover} onChange={setPrintInsideCover} />
      </div> : <div className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-500">Select a book type and page count to reveal valid Lulu options.</div>}

      {matchResult?.found && (
        <div className="rounded border-2 border-[#cfaf45] bg-amber-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-[#997b1e]" />
            <p className="text-sm font-bold text-[#997b1e]">Print Edition Summary</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">SKU (Pod Package ID)</p>
              <p className="font-mono text-base font-bold text-[#997b1e]">{matchResult.sku}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Manufacturing Cost</p>
              <p className="text-base font-bold text-slate-800">
                ${matchResult.pricing?.basePriceUSD.toFixed(2)} + (${matchResult.pricing?.perPagePriceUSD.toFixed(4)} per page)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Page Range</p>
              <p className="text-sm text-slate-700">
                {matchResult.minPage} - {matchResult.maxPage} pages
              </p>
            </div>
          </div>
        </div>
      )}
      {matchResult && !matchResult.found && (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">No matching configuration found. Please adjust your selections.</p>
        </div>
      )}
    </div>
  );
}

function SpecSelectField({
  label,
  name,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}) {
  if (!options.length) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <div className="h-11 w-full border border-slate-200 bg-slate-100 px-3 flex items-center text-sm text-slate-400">
          No options available
        </div>
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <select
        name={name}
        value={options.includes(value) ? value : options[0]}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-slate-300 bg-slate-50 px-3 outline-none focus:border-[#cfaf45]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] || (option === "X" ? "None" : option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function parsePaperSelection(value: string) {
  const [paperType, ppiPart] = value.split(" / ");
  const interiorPpi = Number(ppiPart?.replace(/\D/g, "")) || 0;
  return {
    paperType: paperType || "60# Uncoated White",
    interiorPpi,
  };
}

function unwrapApiData<T>(payload: unknown): T {
  const first = payload && typeof payload === "object" && "data" in payload ? (payload as { data?: unknown }).data : payload;
  return (first && typeof first === "object" && "data" in first ? (first as { data?: unknown }).data : first) as T;
}

function RoyaltyCalculator({
  isFoundingAuthor = false,
  distributionPath = "exclusive",
  onDistributionPathChange,
}: {
  isFoundingAuthor?: boolean;
  distributionPath?: "exclusive" | "wide";
  onDistributionPathChange?: (path: "exclusive" | "wide") => void;
}) {
  const [listingPrice, setListingPrice] = useState<string>("");
  const price = parseFloat(listingPrice) || 0;

  // Founding authors: 85% author, 15% platform across the board
  // Standard authors: 65% for WE Exclusive, 45% for Wide Distribution
  const authorPercentage = isFoundingAuthor
    ? 0.85
    : distributionPath === "exclusive"
    ? 0.65
    : 0.45;
  const adminPercentage = 1 - authorPercentage;
  const authorEarnings = price * authorPercentage;
  const adminEarnings = price * adminPercentage;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label htmlFor="listing-price" className="block text-sm font-medium text-slate-700">
            Book Listing Price (USD)
          </label>
          <Input
            id="listing-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            className="mt-1 bg-slate-50 focus-visible:ring-[#cb9f10]"
          />
        </div>

        {isFoundingAuthor ? (
          <div className="rounded border border-[#d6c38a] bg-[#fbf9f2] p-3 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-[#8c7423]">
              ★ Founding Author Royalty: 85% Author / 15% Company
            </p>
            <p className="text-slate-600">
              Your royalty rate is permanently locked at 85% across all formats. Exclusivity tier variations do not apply to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Distribution Model (Exclusivity)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onDistributionPathChange?.("exclusive")}
                className={`rounded border px-3 py-2 text-xs font-semibold transition ${
                  distributionPath === "exclusive"
                    ? "border-[#cfaf45] bg-[#cfaf45]/15 text-[#8c7423] font-bold shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                WE Exclusive (65%)
              </button>
              <button
                type="button"
                onClick={() => onDistributionPathChange?.("wide")}
                className={`rounded border px-3 py-2 text-xs font-semibold transition ${
                  distributionPath === "wide"
                    ? "border-[#cfaf45] bg-[#cfaf45]/15 text-[#8c7423] font-bold shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Wide (45%)
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Exclusivity percentages apply to authors joining after the founding 100 authors.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-lime-50 p-4 border border-[#e8e0cc] flex flex-col justify-center">
        <div className="flex justify-between items-center border-b border-[#d5d2cb] pb-2 mb-2">
          <span className="text-sm font-medium text-slate-600">
            Your Earnings ({Math.round(authorPercentage * 100)}%)
          </span>
          <span className="text-xl font-bold text-teal-950">${authorEarnings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-600">
            Platform Fee ({Math.round(adminPercentage * 100)}%)
          </span>
          <span className="text-lg font-bold text-slate-700">${adminEarnings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function DistributionPathCard({
  title,
  percentage,
  description,
  selected = false,
  onSelect,
}: {
  title: string;
  percentage: string;
  description: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full text-left p-5 flex flex-col justify-start items-start gap-2.5 rounded-lg border-2 transition-all cursor-pointer shadow-sm ${
        selected
          ? "border-[#cfaf45] bg-[#faf8f2] ring-2 ring-[#cfaf45]/30 shadow-md"
          : "border-stone-300 bg-white hover:border-[#cfaf45]/60 hover:bg-stone-50/70"
      }`}
    >
      <div className="inline-flex w-full items-start justify-between">
        <div className={`text-xl sm:text-2xl font-bold leading-7 transition ${
          selected ? "text-[#8c7423]" : "text-neutral-800 group-hover:text-neutral-900"
        }`}>
          {title}
        </div>
        <div
          className={`flex size-6 items-center justify-center rounded-full border-2 transition ${
            selected
              ? "border-[#cfaf45] bg-[#cfaf45]"
              : "border-stone-300 bg-white group-hover:border-stone-400"
          }`}
        >
          {selected ? (
            <div className="size-2 rounded-full bg-white" />
          ) : (
            <div className="size-2 rounded-full bg-transparent group-hover:bg-stone-200" />
          )}
        </div>
      </div>
      <div className="w-full">
        <div className={`text-2xl font-extrabold leading-7 ${
          selected ? "text-[#24352f]" : "text-neutral-800"
        }`}>
          {percentage}
        </div>
      </div>
      <div className="w-full">
        <div className="text-sm font-normal leading-relaxed text-neutral-600">
          {description}
        </div>
      </div>
      {selected && (
        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#8c7423]">
          <span className="size-1.5 rounded-full bg-[#cfaf45]" />
          <span>Active Selection</span>
        </div>
      )}
    </button>
  );
}

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "cover" | "reader";
  onTabChange: (tab: "cover" | "reader") => void;
  coverUrl: string | null;
  title: string;
  authorName: string;
  description: string;
  category: string;
  language: string;
  ageGroup: string;
  formats: FormatKey[];
  ebookFileName: string | null;
  readerPage: number;
  onPageChange: (page: number) => void;
  readerTheme: "light" | "sepia" | "dark";
  onThemeChange: (theme: "light" | "sepia" | "dark") => void;
  readerFontSize: number;
  onFontSizeChange: (size: number) => void;
}

function BookPreviewModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  coverUrl,
  title,
  authorName,
  description,
  category,
  language,
  ageGroup,
  formats,
  ebookFileName,
  readerPage,
  onPageChange,
  readerTheme,
  onThemeChange,
  readerFontSize,
  onFontSizeChange,
}: BookPreviewModalProps) {
  if (!isOpen) return null;

  const displayTitle = title.trim() || "Untitled Book";
  const displayAuthor = authorName.trim() || "Author Name";
  const displayCategory = category || "Fiction";
  const displayLanguage = language || "English";
  const displayDescription =
    description.trim() ||
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
                onClick={() => onTabChange("cover")}
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
                onClick={() => onTabChange("reader")}
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
            /* ============================================================== */
            /* TAB 1: WEBSITE STOREFRONT / COVER PREVIEW                      */
            /* ============================================================== */
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
                        {displayCategory} • {displayLanguage} • {ageGroup}
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
                        <span className="font-bold text-slate-700">5.0</span>
                        <span>(New Release)</span>
                      </div>

                      {/* Available Formats Bar */}
                      <div className="mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                          Available Formats
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {formats.length > 0 ? (
                            formats.map((fmt) => (
                              <div
                                key={fmt}
                                className="rounded-lg border-2 border-[#cfaf45] bg-[#faf8f2] p-3 text-left shadow-sm"
                              >
                                <p className="text-xs font-bold text-[#24352f]">{formatLabels[fmt]}</p>
                                <p className="mt-0.5 text-xs font-extrabold text-[#8c7423]">$19.99</p>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full rounded border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                              No format selected yet. Choose eBook, Audiobook, Hardcover, or Paperback below.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Book Synopsis Excerpt */}
                      <div className="mt-6 space-y-2 border-t border-stone-200 pt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          About this Book
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-600 line-clamp-4">
                          {displayDescription}
                        </p>
                      </div>
                    </div>

                    {/* Mock Action Row */}
                    <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onTabChange("reader")}
                        className="inline-flex h-11 items-center gap-2 rounded-md bg-[#24352f] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a2823] transition"
                      >
                        <BookOpen className="size-4 text-[#cfaf45]" />
                        <span>Read Inside Sample</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 items-center gap-2 rounded-md border border-[#cfaf45] bg-white px-5 text-sm font-bold text-[#8c7423] shadow-sm hover:bg-[#faf8f2] transition pointer-events-none"
                      >
                        <ShoppingBag className="size-4" />
                        <span>Add to Cart ($19.99)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* TAB 2: INSIDE OF THE BOOK / READER PREVIEW                     */
            /* ============================================================== */
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Reader Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theme:</span>
                  <div className="flex rounded-md border border-stone-300 overflow-hidden text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => onThemeChange("light")}
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
                      onClick={() => onThemeChange("sepia")}
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
                      onClick={() => onThemeChange("dark")}
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
                      onClick={() => onFontSizeChange(Math.max(14, readerFontSize - 2))}
                      disabled={readerFontSize <= 14}
                      className="rounded px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      A-
                    </button>
                    <span className="px-2 text-xs font-semibold text-slate-600">{readerFontSize}px</span>
                    <button
                      type="button"
                      onClick={() => onFontSizeChange(Math.min(26, readerFontSize + 2))}
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
                  onClick={() => onPageChange(Math.max(1, readerPage - 1))}
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
                      onClick={() => onPageChange(p.page)}
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
                  onClick={() => onPageChange(Math.min(samplePages.length, readerPage + 1))}
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
