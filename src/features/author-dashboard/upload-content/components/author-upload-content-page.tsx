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
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookPreviewModal } from "@/features/author-dashboard/books/components/book-preview-modal";

type FormatKey = "EBOOK" | "AUDIOBOOK" | "HARDCOVER" | "PAPERBACK";
type PrintFormatKey = Extract<FormatKey, "HARDCOVER" | "PAPERBACK">;

type EditBook = {
  title: string;
  authorName?: string | null;
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
  pageCount?: number;
  trimSize?: string;
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

async function fileToJpegOrPngBuffer(file: File): Promise<{ buffer: ArrayBuffer; isPng: boolean }> {
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return { buffer: await file.arrayBuffer(), isPng: true };
  }
  if (file.type === "image/jpeg" || file.type === "image/jpg" || /\.(jpe?g)$/i.test(file.name)) {
    return { buffer: await file.arrayBuffer(), isPng: false };
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context initialization failed"));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Image conversion failed"));
        resolve({ buffer: await blob.arrayBuffer(), isPng: false });
      }, "image/jpeg", 0.95);
    };
    img.onerror = () => reject(new Error("Failed to load image for conversion"));
    img.src = URL.createObjectURL(file);
  });
}

async function prepareCoverPdf(file: File): Promise<File> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return file;
  }
  const { buffer, isPng } = await fileToJpegOrPngBuffer(file);
  const pdfDoc = await PDFDocument.create();
  const image = isPng ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);

  // At 300 DPI: points = px * (72 / 300) = px * 0.24
  let widthPoints: number;
  let heightPoints: number;
  if (image.width > 1200) {
    widthPoints = image.width * (72 / 300);
    heightPoints = image.height * (72 / 300);
  } else {
    widthPoints = image.width;
    heightPoints = image.height;
  }

  const page = pdfDoc.addPage([widthPoints, heightPoints]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: widthPoints,
    height: heightPoints,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([pdfBlob], `${baseName}-spread.pdf`, { type: "application/pdf" });
}

function PrintCoverSizingGuide({
  format,
  pageCount = 32,
  trimSize = "US Trade (5 x 8)",
}: {
  format: "HARDCOVER" | "PAPERBACK";
  pageCount?: number;
  trimSize?: string;
}) {
  const isHardcover = format === "HARDCOVER";
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <Info className="size-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900">
            {isHardcover ? "Hardcover (Casewrap) Full Spread Requirements" : "Paperback Full Spread Requirements"}
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            {isHardcover ? (
              <>
                Lulu casewrap hardcovers require a <strong>single full-spread file</strong> covering the <strong>Back Cover + Spine + Front Cover</strong> plus <strong>0.625&quot; fold-over casing wrap</strong> on all 4 sides. A single front cover alone (e.g. 5&quot; x 8&quot; or 5.06&quot; x 7.18&quot;) will be rejected by the printer because it cannot wrap around the book boards.
              </>
            ) : (
              <>
                Paperbacks require a <strong>single full-spread file</strong> covering the <strong>Back Cover + Spine + Front Cover</strong> plus <strong>0.125&quot; trim bleed</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="rounded border border-amber-200 bg-white p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
          <span>Required Spread Dimensions for {isHardcover ? "Hardcover" : "Paperback"} (5 x 8 in, ~{pageCount || 32} pages):</span>
          <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-amber-900 font-bold">
            {isHardcover ? "12.44\" - 12.56\" x 9.69\" - 9.81\"" : "10.30\" x 8.25\""}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded bg-slate-100 p-2 text-center text-[11px] font-medium text-slate-600 border border-slate-200">
          <div className="rounded bg-white p-1.5 shadow-xs border border-slate-200">
            <span className="block font-bold text-slate-800">Back Cover</span>
            <span>~5.0 in</span>
          </div>
          <div className="rounded bg-amber-50 p-1.5 shadow-xs border border-amber-200">
            <span className="block font-bold text-amber-900">Spine</span>
            <span>~{isHardcover ? "0.25 - 0.40" : "0.15 - 0.25"} in</span>
          </div>
          <div className="rounded bg-white p-1.5 shadow-xs border border-slate-200">
            <span className="block font-bold text-slate-800">Front Cover</span>
            <span>~5.0 in</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          💡 <strong>Pixel recommendation at 300 DPI:</strong> {isHardcover ? "3,750 x 2,925 pixels" : "3,100 x 2,475 pixels"}. Upload either a PDF spread or a high-res JPEG/PNG (we automatically format it into a print-ready container).
        </p>
      </div>
    </div>
  );
}

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
  const [previewAuthorName, setPreviewAuthorName] = useState(authorName);
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
        if (payload.data.authorName) setPreviewAuthorName(payload.data.authorName);
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
    let coverPdf = source.get("coverPdf");
    const match = matchedSpecs[format];
    if (!match?.sku) return toast.error("Choose a valid print configuration before validating files.");
    if (!(interiorPdf instanceof File) || !interiorPdf.size || !(coverPdf instanceof File) || !coverPdf.size) {
      return toast.error("Choose both Interior PDF and Cover file before validation.");
    }

    if (coverPdf.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(coverPdf.name)) {
      try {
        toast.info("Packaging cover image into print spread PDF...");
        coverPdf = await prepareCoverPdf(coverPdf);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return toast.error("Could not prepare cover image: " + errorMsg);
      }
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
    ["title", "authorName", "description", "isbn", "category", "language", "ageGroup"].forEach((key) => {
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

    const fileFields = ["bookCover", "ebook", "audiobook", "interiorPdf"] as const;
    fileFields.forEach((field) => {
      const file = source.get(field);
      if (file instanceof File && file.size > 0) body.set(field, file);
    });

    let coverFile = source.get("coverPdf");
    if (coverFile instanceof File && coverFile.size > 0) {
      if (coverFile.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(coverFile.name)) {
        try {
          coverFile = await prepareCoverPdf(coverFile);
        } catch {
          // fallback to original file if preparation fails
        }
      }
      body.set("coverPdf", coverFile);
    }

    const printFormat = formats.find((format): format is PrintFormatKey => format === "HARDCOVER" || format === "PAPERBACK");
    const hasPrint = Boolean(printFormat);
    if (hasPrint) {
      const interiorPdf = source.get("interiorPdf");
      const coverPdf = source.get("coverPdf");
      if (!bookId && (!(interiorPdf instanceof File) || !interiorPdf.size || !(coverPdf instanceof File) || !coverPdf.size)) {
        return toast.error("Print editions require both interior and cover files.");
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Book title"
                name="title"
                defaultValue={book?.title}
                onChange={(e) => setPreviewTitle(e.target.value)}
                required
              />
              <div>
                <Field
                  label="Author / Pen Name"
                  name="authorName"
                  defaultValue={book?.authorName || authorName}
                  onChange={(e) => setPreviewAuthorName(e.target.value)}
                  placeholder="e.g. Pen name or display name"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Author name or pen name to display on this book. Defaults to your account name.
                </p>
              </div>
            </div>
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
                      Print editions require print-ready interior PDF and full-spread cover (PDF, JPEG, or PNG).
                    </p>
                    <PrintCoverSizingGuide
                      format={format as "HARDCOVER" | "PAPERBACK"}
                      pageCount={matchedSpecs[format]?.pageCount || book?.formats.find((item) => item.formatType === format)?.pageCount || 32}
                      trimSize={matchedSpecs[format]?.trimSize}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FileField label="Interior PDF" name="interiorPdf" accept="application/pdf" onChange={handleEbookFileChange} />
                      <FileField
                        label="Cover File (Spread PDF, JPEG, or PNG)"
                        name="coverPdf"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                      />
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
            formats={formats}
            matchedSpecs={matchedSpecs}
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
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 rounded-md bg-[#cfaf45] px-6 font-semibold text-white hover:bg-[#b79731] disabled:opacity-50 shadow-sm"
        >
          <Save className="size-4" />
          {pending ? "Saving..." : bookId ? "Save changes" : "Create draft"}
        </button>
        {book?.status === "APPROVED" && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500" />
            Live Book — changes will update the published listing
          </span>
        )}
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
          initialTab={previewTab}
          coverUrl={coverPreviewUrl}
          title={previewTitle || (book?.title ?? "")}
          authorName={previewAuthorName || authorName || "Author Name"}
          description={previewDescription || (book?.description ?? "")}
          category={previewCategory || (book?.category ?? "General")}
          language={previewLanguage || (book?.language ?? "English")}
          ageGroup={previewAgeGroup || (book?.ageGroup ?? "Adult")}
          formats={formats}
          ebookFileName={ebookFileName}
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
          const enriched: MatchResult = {
            ...data,
            pageCount: Number(pageCount),
            trimSize: selectedBookType,
          };
          setMatchResult(enriched);
          onMatch(format, enriched);
        }
      } catch {
        setMatchResult(null);
        onMatch(format, { found: false, sku: null, minPage: null, maxPage: null, pricing: null, pageCount: Number(pageCount), trimSize: selectedBookType });
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
  formats = ["EBOOK"],
  matchedSpecs = {},
}: {
  isFoundingAuthor?: boolean;
  distributionPath?: "exclusive" | "wide";
  onDistributionPathChange?: (path: "exclusive" | "wide") => void;
  formats?: FormatKey[];
  matchedSpecs?: Record<string, MatchResult>;
}) {
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>(
    formats.includes("HARDCOVER")
      ? "HARDCOVER"
      : formats.includes("PAPERBACK")
      ? "PAPERBACK"
      : formats[0] || "EBOOK"
  );

  useEffect(() => {
    if (!formats.includes(selectedFormat) && formats.length > 0) {
      setSelectedFormat(formats[0]);
    }
  }, [formats, selectedFormat]);

  const [listingPrice, setListingPrice] = useState<string>("24.99");
  const price = parseFloat(listingPrice) || 0;

  const isPrint = selectedFormat === "HARDCOVER" || selectedFormat === "PAPERBACK";

  const match = matchedSpecs[selectedFormat];
  const defaultBaseCost = selectedFormat === "HARDCOVER" ? 10.68 : 3.50;
  const defaultPerPage = selectedFormat === "HARDCOVER" ? 0.037 : 0.018;
  const baseCost = match?.pricing?.basePriceUSD ?? defaultBaseCost;
  const perPageCost = match?.pricing?.perPagePriceUSD ?? defaultPerPage;
  const pageCount = match?.pageCount ?? 32;

  const [customPages, setCustomPages] = useState<string>(String(pageCount));
  useEffect(() => {
    if (match?.pageCount) setCustomPages(String(match.pageCount));
  }, [match?.pageCount]);

  const activePages = parseInt(customPages, 10) || pageCount;
  const manufacturingCost = isPrint ? +(baseCost + (perPageCost * activePages)).toFixed(2) : 0;

  const authorPercentage = isFoundingAuthor
    ? 0.85
    : distributionPath === "exclusive"
    ? 0.65
    : 0.45;
  const adminPercentage = 1 - authorPercentage;

  const netPool = Math.max(0, price - manufacturingCost);
  const authorEarnings = netPool * authorPercentage;
  const adminEarnings = netPool * adminPercentage;

  const isBelowCost = isPrint && price > 0 && price < manufacturingCost;
  const recommendedMinPrice = isPrint ? (manufacturingCost * 1.25).toFixed(2) : "4.99";

  return (
    <div className="space-y-6">
      {/* Format Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
          Calculate For Format:
        </span>
        {(["EBOOK", "HARDCOVER", "PAPERBACK", "AUDIOBOOK"] as FormatKey[]).map((fmt) => {
          const isEnabled = formats.includes(fmt);
          const isSelected = selectedFormat === fmt;
          return (
            <button
              key={fmt}
              type="button"
              onClick={() => {
                setSelectedFormat(fmt);
                if (fmt === "EBOOK") setListingPrice("9.99");
                else if (fmt === "HARDCOVER") setListingPrice("24.99");
                else if (fmt === "PAPERBACK") setListingPrice("14.99");
                else if (fmt === "AUDIOBOOK") setListingPrice("19.99");
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#cfaf45] text-white shadow-sm"
                  : isEnabled
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{formatLabels[fmt]}</span>
              {isEnabled && <span className="size-1.5 rounded-full bg-white/70" />}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="listing-price" className="block text-sm font-semibold text-slate-700">
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
            {isPrint && (
              <div>
                <label htmlFor="calc-pages" className="block text-sm font-semibold text-slate-700">
                  Page Count for Printing
                </label>
                <Input
                  id="calc-pages"
                  type="number"
                  min="1"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  className="mt-1 bg-slate-50 focus-visible:ring-[#cb9f10]"
                />
              </div>
            )}
          </div>

          {/* Print Cost Explanation Box */}
          {isPrint ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Lulu Print-on-Demand Manufacturing Cost:</span>
                <span className="font-mono text-sm font-bold text-slate-900">${manufacturingCost.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <div>Base Binding Cost: ${baseCost.toFixed(2)}</div>
                <div>Per Page ({activePages} pgs @ ${perPageCost.toFixed(3)}): ${(perPageCost * activePages).toFixed(2)}</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Print manufacturing costs are deducted directly from customer payment before royalties are split.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Digital Delivery: </span>
              Zero printing cost. 100% of the sale price goes directly into the royalty split pool.
            </div>
          )}

          {isFoundingAuthor ? (
            <div className="rounded-md border border-[#d6c38a] bg-[#fbf9f2] p-3 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#8c7423]">
                ★ Founding Author Royalty: 85% Author / 15% Platform
              </p>
              <p className="text-slate-600">
                Your royalty rate is permanently locked at 85% net earnings across all formats.
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
            </div>
          )}
        </div>

        {/* Breakdown Card */}
        <div className="rounded-lg bg-gradient-to-br from-amber-50/60 to-slate-50 p-5 border border-[#e8e0cc] flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Earnings Breakdown ({formatLabels[selectedFormat]})
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-slate-700">
                <span>Retail List Price</span>
                <span className="font-bold font-mono">${price.toFixed(2)}</span>
              </div>

              {isPrint && (
                <div className="flex justify-between items-center text-red-600 text-xs">
                  <span>Less Print Manufacturing Cost</span>
                  <span className="font-mono font-semibold">-${manufacturingCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-semibold text-slate-900">
                <span>Net Royalty Pool</span>
                <span className="font-mono">${netPool.toFixed(2)}</span>
              </div>
            </div>

            {isBelowCost && (
              <div className="rounded border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
                ⚠️ <strong>Notice:</strong> List price (${price.toFixed(2)}) is below the print cost (${manufacturingCost.toFixed(2)}). Books cannot be printed at a loss. Recommended minimum price is <strong>${recommendedMinPrice}</strong>.
              </div>
            )}

            {/* Visual Profit Distribution Bar */}
            {price > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  {isPrint && manufacturingCost > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (manufacturingCost / price) * 100)}%` }}
                      className="bg-amber-400"
                      title={`Print Cost: $${manufacturingCost.toFixed(2)}`}
                    />
                  )}
                  {authorEarnings > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (authorEarnings / price) * 100)}%` }}
                      className="bg-emerald-600"
                      title={`Author Royalty: $${authorEarnings.toFixed(2)}`}
                    />
                  )}
                  {adminEarnings > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (adminEarnings / price) * 100)}%` }}
                      className="bg-slate-400"
                      title={`Platform Fee: $${adminEarnings.toFixed(2)}`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  {isPrint && <span>🟡 Print Mfg</span>}
                  <span>🟢 Your Royalty</span>
                  <span>⚪ Platform</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 border border-emerald-200/80 shadow-xs space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Your Net Royalties ({Math.round(authorPercentage * 100)}%)
                </span>
                <span className="text-xs text-slate-500">Per book sold</span>
              </div>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                ${authorEarnings.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Platform Share ({Math.round(adminPercentage * 100)}%)</span>
              <span className="font-semibold text-slate-700 font-mono">${adminEarnings.toFixed(2)}</span>
            </div>
          </div>
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

