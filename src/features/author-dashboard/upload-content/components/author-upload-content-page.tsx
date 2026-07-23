"use client";

import { FormEvent, useEffect, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, FileAudio, FileText, Save, Package } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";

type FormatKey = "EBOOK" | "AUDIOBOOK" | "HARDCOVER" | "PAPERBACK";
type PrintFormatKey = Extract<FormatKey, "HARDCOVER" | "PAPERBACK">;

type EditBook = {
  title: string;
  description: string | null;
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

const formatLabels: Record<FormatKey, string> = {
  EBOOK: "eBook",
  AUDIOBOOK: "Audiobook",
  HARDCOVER: "Hardcover",
  PAPERBACK: "Paperback",
};

export function AuthorUploadContentPage({ accessToken, isFoundingAuthor }: { accessToken: string; isFoundingAuthor?: boolean }) {
  const router = useRouter();
  const bookId = useSearchParams().get("bookId");
  const [book, setBook] = useState<EditBook | null>(null);
  const [formats, setFormats] = useState<FormatKey[]>(["EBOOK"]);
  const [pending, setPending] = useState(false);
  const [specOptions, setSpecOptions] = useState<SpecificationOptions | null>(null);
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
    if (!bookId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        setBook(payload.data);
        setFormats(payload.data.formats.map((format: { formatType: FormatKey }) => format.formatType));
      })
      .catch((error: Error) => toast.error(error.message || "Unable to load book."));
  }, [accessToken, bookId]);

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
    body.set(
      "tags",
      JSON.stringify(
        String(source.get("tags") || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    );
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
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a88922]">Author workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">{bookId ? "Edit book" : "List a new book"}</h1>
        <p className="mt-2 text-slate-500">Save the listing as a draft, then submit it for review from My Books.</p>
      </div>
      <div className="grid gap-6">
        <Card className="rounded-none bg-white">
          <CardContent className="space-y-5 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="size-5" />
              Book information
            </h2>
            <Field label="Book title" name="title" defaultValue={book?.title} required />
            <TextArea label="Description" name="description" defaultValue={book?.description || ""} required />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ISBN (optional)" name="isbn" defaultValue={book?.isbn || ""} />
              <Field label="Category" name="category" defaultValue={book?.category || ""} required />
              <Field label="Language" name="language" defaultValue={book?.language || "English"} required />
              <Field label="Age group" name="ageGroup" defaultValue={book?.ageGroup || "Adult"} required />
            </div>
            <Field label="Tags (comma separated)" name="tags" defaultValue={book?.tags.join(", ")} />
            <FileField label="Book cover (used for all formats)" name="bookCover" accept="image/*" required={!bookId} />
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
                {format === "EBOOK" && <FileField label="eBook file (.pdf, .epub)" name="ebook" accept=".pdf,.epub" />}
                {format === "AUDIOBOOK" && <FileField label="Audiobook file" name="audiobook" accept="audio/*" />}
                {["HARDCOVER", "PAPERBACK"].includes(format) && (
                  <>
                    <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
                      Print editions require print-ready interior and cover PDF files.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FileField label="Interior PDF" name="interiorPdf" accept="application/pdf" />
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
          <RoyaltyCalculator isFoundingAuthor={isFoundingAuthor} />
        </CardContent>
      </Card>
      <button
        disabled={pending || (book != null && !["DRAFT", "REJECTED"].includes(book.status))}
        className="inline-flex h-12 items-center gap-2 rounded-md bg-[#cfaf45] px-6 font-semibold text-white hover:bg-[#b79731] disabled:opacity-50"
      >
        <Save className="size-4" />
        {pending ? "Saving..." : bookId ? "Save changes" : "Create draft"}
      </button>
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

function RoyaltyCalculator({ isFoundingAuthor = false }: { isFoundingAuthor?: boolean }) {
  const [listingPrice, setListingPrice] = useState<string>("");
  const price = parseFloat(listingPrice) || 0;
  const authorPercentage = isFoundingAuthor ? 0.65 : 0.7;
  const adminPercentage = isFoundingAuthor ? 0.35 : 0.3;
  const authorEarnings = price * authorPercentage;
  const adminEarnings = price * adminPercentage;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label htmlFor="listing-price" className="block text-sm font-medium text-slate-700">
            Book Listing Price (USD)
          </label>
          <Input id="listing-price" type="number" min="0" step="0.01" placeholder="0.00" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} className="mt-1 bg-slate-50 focus-visible:ring-[#cb9f10]" />
        </div>
        <p className="text-sm text-slate-500">
          Current author status: <strong className="text-slate-700">{isFoundingAuthor ? "Founding Author (65% Cut)" : "Standard Author (70% Cut)"}</strong>
        </p>
      </div>
      <div className="rounded-lg bg-lime-50 p-4 border border-[#e8e0cc] flex flex-col justify-center">
        <div className="flex justify-between items-center border-b border-[#d5d2cb] pb-2 mb-2">
          <span className="text-sm font-medium text-slate-600">Your Earnings</span>
          <span className="text-lg font-bold text-teal-950">${authorEarnings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-600">Platform Fee</span>
          <span className="text-lg font-bold text-slate-700">${adminEarnings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
