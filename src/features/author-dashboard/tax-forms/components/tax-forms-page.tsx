"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileImage,
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Loader2,
  CreditCard,
  Clock,
  FileText,
  RefreshCcw,
  Globe,
  User,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type KycStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";

type FileState = {
  file: File | null;
  preview: string | null;
  status: UploadStatus;
  errorMessage: string | null;
};

const initialFileState: FileState = {
  file: null,
  preview: null,
  status: "idle",
  errorMessage: null,
};

// --- Drop Zone Sub-component ---
type DropZoneProps = {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  state: FileState;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  id: string;
};

function DropZone({ label, sublabel, icon, state, onFileSelect, onClear, id }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const hasFile = !!state.file;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-sm font-bold text-neutral-800">{label}</p>
          <p className="text-xs text-neutral-500">{sublabel}</p>
        </div>
      </div>

      {hasFile && state.preview ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-[#66756d] bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.preview} alt={label} className="h-44 w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <button
              type="button"
              onClick={onClear}
              className="ml-auto flex size-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center justify-between rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
              <span className="truncate text-xs font-medium text-white">{state.file?.name}</span>
              {state.status === "success" && <CheckCircle className="ml-2 size-4 shrink-0 text-green-400" />}
              {state.status === "uploading" && <Loader2 className="ml-2 size-4 shrink-0 animate-spin text-white" />}
              {state.status === "error" && <AlertCircle className="ml-2 size-4 shrink-0 text-red-400" />}
            </div>
          </div>
        </div>
      ) : hasFile ? (
        <div className="flex items-center justify-between rounded-xl border-2 border-[#66756d] bg-[#66756d]/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[#66756d]" />
            <span className="text-sm font-medium text-neutral-700 truncate max-w-[160px]">{state.file?.name}</span>
          </div>
          <button type="button" onClick={onClear} className="size-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200">
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all",
            isDragging ? "border-[#cfaf45] bg-[#cfaf45]/5" : "border-stone-300 bg-stone-50 hover:border-[#66756d] hover:bg-[#66756d]/5"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-200">
            <Upload className="size-5 text-stone-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700">
              Drop here, or <span className="text-[#66756d] underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1 text-xs text-neutral-400">JPG, PNG, WEBP or PDF — max 5MB</p>
          </div>
        </div>
      )}

      {state.status === "error" && state.errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-200">
          <AlertCircle className="size-3.5 shrink-0" />
          {state.errorMessage}
        </div>
      )}
      {state.status === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 ring-1 ring-green-200">
          <CheckCircle className="size-3.5 shrink-0" />
          Uploaded successfully!
        </div>
      )}

      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }} />
    </div>
  );
}

// --- KYC Status Banner ---
const statusConfig: Record<KycStatus, { label: string; color: string; bg: string; ring: string; icon: React.ReactNode; description: string }> = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    color: "text-neutral-600",
    bg: "bg-neutral-50",
    ring: "ring-neutral-200",
    icon: <Clock className="size-5 text-neutral-500" />,
    description: "Submit your ID documents and tax form below to unlock book publishing.",
  },
  SUBMITTED: {
    label: "Under Review",
    color: "text-[#cfaf45]",
    bg: "bg-[#cfaf45]/10",
    ring: "ring-[#cfaf45]/30",
    icon: <Clock className="size-5 text-[#cfaf45]" />,
    description: "Your documents have been submitted and are awaiting admin review (1–3 business days).",
  },
  APPROVED: {
    label: "Verified ✓",
    color: "text-green-700",
    bg: "bg-green-50",
    ring: "ring-green-200",
    icon: <CheckCircle className="size-5 text-green-600" />,
    description: "Your identity and tax forms have been verified. You can now publish books.",
  },
  REJECTED: {
    label: "Action Required",
    color: "text-red-600",
    bg: "bg-red-50",
    ring: "ring-red-200",
    icon: <AlertCircle className="size-5 text-red-500" />,
    description: "Your submission was rejected. Please review the note below and resubmit.",
  },
};

// --- Main Component ---
type TaxFormsPageProps = {
  accessToken: string;
};

export function TaxFormsPage({ accessToken }: TaxFormsPageProps) {
  const [idFront, setIdFront] = useState<FileState>(initialFileState);
  const [idBack, setIdBack] = useState<FileState>(initialFileState);
  const [taxFormFile, setTaxFormFile] = useState<FileState>(initialFileState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // KYC status
  const [kycStatus, setKycStatus] = useState<KycStatus>("NOT_SUBMITTED");
  const [kycAdminNote, setKycAdminNote] = useState<string | null>(null);
  const [kycSubmittedAt, setKycSubmittedAt] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Tax form fields
  const [taxFormType, setTaxFormType] = useState("W-9");
  const [taxpayerName, setTaxpayerName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [taxCountry, setTaxCountry] = useState("US");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/author/tax-forms", { headers: { Authorization: `Bearer ${accessToken}` } });
        if (res.ok) {
          const data = (await res.json()) as { kycStatus?: KycStatus; adminNote?: string; submittedAt?: string };
          setKycStatus(data.kycStatus ?? "NOT_SUBMITTED");
          setKycAdminNote(data.adminNote ?? null);
          setKycSubmittedAt(data.submittedAt ?? null);
        }
      } catch {
        // ignore
      } finally {
        setStatusLoading(false);
      }
    })();
  }, [accessToken]);

  const handleFileSelect = (setter: typeof setIdFront) => (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setter({ file: null, preview: null, status: "error", errorMessage: "File too large. Maximum size is 5MB." });
      return;
    }
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setter({ file, preview, status: "idle", errorMessage: null });
  };

  const handleClear = (setter: typeof setIdFront, prev: FileState) => () => {
    if (prev.preview) URL.revokeObjectURL(prev.preview);
    setter(initialFileState);
  };

  const canResubmit = kycStatus === "NOT_SUBMITTED" || kycStatus === "REJECTED";
  const isApproved = kycStatus === "APPROVED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFront.file || !idBack.file) {
      setSubmitStatus("error");
      setSubmitMessage("Please upload both front and back sides of your ID.");
      return;
    }
    if (!taxpayerName.trim() || !taxId.trim() || !taxCountry.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Please fill in all tax form fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setIdFront((p) => ({ ...p, status: "uploading" }));
    setIdBack((p) => ({ ...p, status: "uploading" }));

    try {
      const formData = new FormData();
      formData.append("idFront", idFront.file);
      formData.append("idBack", idBack.file);
      if (taxFormFile.file) formData.append("taxFormFile", taxFormFile.file);
      formData.append("taxFormType", taxFormType);
      formData.append("taxpayerName", taxpayerName.trim());
      formData.append("taxId", taxId.trim());
      formData.append("taxCountry", taxCountry.trim());

      const res = await fetch("/api/author/tax-forms", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const json = (await res.json()) as { message?: string; error?: string; kycStatus?: KycStatus };
      if (!res.ok) throw new Error(json.error ?? json.message ?? "Upload failed");

      setIdFront((p) => ({ ...p, status: "success" }));
      setIdBack((p) => ({ ...p, status: "success" }));
      setSubmitStatus("success");
      setSubmitMessage(json.message ?? "Documents submitted successfully.");
      setKycStatus(json.kycStatus ?? "SUBMITTED");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setIdFront((p) => ({ ...p, status: "error", errorMessage: message }));
      setIdBack((p) => ({ ...p, status: "error", errorMessage: message }));
      setSubmitStatus("error");
      setSubmitMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!idFront.file && !!idBack.file && !!taxpayerName.trim() && !!taxId.trim() && !!taxCountry.trim() && !isSubmitting && canResubmit;

  const statusInfo = statusConfig[kycStatus];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-[#24352f] px-8 py-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#cfaf45]">
            <ShieldCheck className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Tax Forms & Identity Verification</h1>
            <p className="mt-1 text-sm text-white/70">
              Complete both steps below to unlock book publishing on your account.
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status Banner */}
      {!statusLoading && (
        <div className={cn("flex items-start gap-3 rounded-xl px-4 py-4 ring-1", statusInfo.bg, statusInfo.ring)}>
          <div className="mt-0.5 shrink-0">{statusInfo.icon}</div>
          <div>
            <p className={cn("text-sm font-bold", statusInfo.color)}>Verification Status: {statusInfo.label}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{statusInfo.description}</p>
            {kycAdminNote && (
              <div className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                <span className="font-semibold">Admin note: </span>{kycAdminNote}
              </div>
            )}
            {kycSubmittedAt && (
              <p className="mt-1 text-xs text-neutral-400">
                Submitted {new Date(kycSubmittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* GATE 1 Notice */}
      {isApproved && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-5 py-4 ring-1 ring-green-200">
          <CheckCircle className="size-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">
            You are fully verified and can create and publish books.
          </p>
        </div>
      )}

      {canResubmit && (
        <div className="flex items-start gap-3 rounded-xl bg-[#cfaf45]/10 px-4 py-4 ring-1 ring-[#cfaf45]/30">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#cfaf45]" />
          <div className="text-sm text-neutral-700">
            <p className="font-semibold">Two-step verification required</p>
            <p className="mt-0.5 text-neutral-500">
              Upload your government-issued ID (front & back) and fill in your tax information. Both are required
              before you can publish books. Documents are reviewed within 1–3 business days.
            </p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {canResubmit && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">

          {/* ID Upload Section */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="mb-6 flex items-center gap-2 border-b border-stone-100 pb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#66756d]">
                <CreditCard className="size-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Step 1 — Government-Issued ID</h2>
                <p className="text-xs text-neutral-500">Passport, National ID, or Driver's License</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <DropZone
                id="id-front"
                label="Front Side"
                sublabel="Photo / information page"
                icon={<FileImage className="size-5 text-[#66756d]" />}
                state={idFront}
                onFileSelect={handleFileSelect(setIdFront)}
                onClear={handleClear(setIdFront, idFront)}
              />
              <DropZone
                id="id-back"
                label="Back Side"
                sublabel="Signature / barcode page"
                icon={<FileImage className="size-5 text-[#cfaf45]" />}
                state={idBack}
                onFileSelect={handleFileSelect(setIdBack)}
                onClear={handleClear(setIdBack, idBack)}
              />
            </div>
          </div>

          {/* Tax Form Section */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="mb-6 flex items-center gap-2 border-b border-stone-100 pb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#cfaf45]">
                <FileText className="size-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Step 2 — Tax Information</h2>
                <p className="text-xs text-neutral-500">Required by financial regulations for authors receiving payouts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Tax Form Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Tax Form Type
                </label>
                <select
                  value={taxFormType}
                  onChange={(e) => setTaxFormType(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-800 focus:border-[#66756d] focus:outline-none focus:ring-2 focus:ring-[#66756d]/20"
                >
                  <option value="W-9">W-9 (US Person / Entity)</option>
                  <option value="W-8BEN">W-8BEN (Non-US Individual)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tax Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Country of Tax Residence
                </label>
                <input
                  type="text"
                  value={taxCountry}
                  onChange={(e) => setTaxCountry(e.target.value)}
                  placeholder="e.g. US, GB, IN"
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#66756d] focus:outline-none focus:ring-2 focus:ring-[#66756d]/20"
                />
              </div>

              {/* Taxpayer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                  <User className="size-3.5" /> Full Legal Name / Entity Name
                </label>
                <input
                  type="text"
                  value={taxpayerName}
                  onChange={(e) => setTaxpayerName(e.target.value)}
                  placeholder="As it appears on your tax documents"
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#66756d] focus:outline-none focus:ring-2 focus:ring-[#66756d]/20"
                />
              </div>

              {/* Tax ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                  <Hash className="size-3.5" /> Tax Identification Number
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="SSN, EIN, or foreign TIN"
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#66756d] focus:outline-none focus:ring-2 focus:ring-[#66756d]/20"
                />
              </div>
            </div>

            {/* Optional tax form PDF upload */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Optional — Upload completed tax form PDF
              </p>
              <DropZone
                id="tax-form-file"
                label="Tax Form Document (Optional)"
                sublabel="Upload your signed W-9, W-8BEN, or equivalent"
                icon={<FileText className="size-5 text-neutral-400" />}
                state={taxFormFile}
                onFileSelect={handleFileSelect(setTaxFormFile)}
                onClear={handleClear(setTaxFormFile, taxFormFile)}
              />
            </div>
          </div>

          {/* Submit Status Messages */}
          {submitStatus === "success" && submitMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
              <CheckCircle className="size-4 shrink-0" />
              {submitMessage}
            </div>
          )}
          {submitStatus === "error" && submitMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              <AlertCircle className="size-4 shrink-0" />
              {submitMessage}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-stone-200">
            <div>
              <p className="text-xs font-medium text-neutral-700">
                {kycStatus === "REJECTED" ? "Resubmitting will replace your previous submission." : "Both steps must be completed before submitting."}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">Documents reviewed within 1–3 business days.</p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all",
                canSubmit ? "bg-[#24352f] hover:bg-[#1a2620] active:scale-[0.98]" : "cursor-not-allowed bg-stone-300 text-stone-400"
              )}
            >
              {isSubmitting ? (
                <><Loader2 className="size-4 animate-spin" /> Uploading…</>
              ) : kycStatus === "REJECTED" ? (
                <><RefreshCcw className="size-4" /> Resubmit Documents</>
              ) : (
                <><Upload className="size-4" /> Submit Documents</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Accepted Documents */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 text-base font-bold text-neutral-900">Accepted ID Documents</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["Passport", "National ID Card", "Driver's License"].map((doc) => (
            <div key={doc} className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#66756d]/10">
                <ShieldCheck className="size-4 text-[#66756d]" />
              </div>
              <span className="text-sm font-medium text-neutral-700">{doc}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Document must be government-issued, valid (not expired), and clearly legible.
        </p>
      </div>
    </div>
  );
}
