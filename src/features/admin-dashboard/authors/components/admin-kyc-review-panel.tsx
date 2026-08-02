"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type KycStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";

interface KycRecord {
  kycStatus: KycStatus;
  idFrontUrl: string | null;
  idBackUrl: string | null;
  taxFormFileUrl: string | null;
  taxFormType: string | null;
  taxpayerName: string | null;
  taxId: string | null;
  taxCountry: string | null;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

interface Props {
  authorId: string;
  accessToken: string;
}

const statusConfig: Record<KycStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  NOT_SUBMITTED: { label: "Not Submitted", color: "text-neutral-600", bg: "bg-neutral-50 ring-neutral-200", icon: <Clock className="size-4 text-neutral-500" /> },
  SUBMITTED: { label: "Awaiting Review", color: "text-amber-600", bg: "bg-amber-50 ring-amber-200", icon: <Clock className="size-4 text-amber-500" /> },
  APPROVED: { label: "Approved", color: "text-green-700", bg: "bg-green-50 ring-green-200", icon: <CheckCircle className="size-4 text-green-600" /> },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50 ring-red-200", icon: <XCircle className="size-4 text-red-500" /> },
};

export function AdminKycReviewPanel({ authorId, accessToken }: Props) {
  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/kyc/${authorId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = (await res.json()) as KycRecord;
          setKyc(data);
        } else {
          setKyc(null);
        }
      } catch {
        setKyc(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [authorId, accessToken]);

  const handleReview = async (decision: "APPROVED" | "REJECTED") => {
    if (!kyc) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/kyc/${authorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ decision, adminNote: adminNote.trim() || undefined }),
      });
      const data = (await res.json()) as { kycStatus?: KycStatus; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to update KYC status.");
      setKyc((prev) => prev ? { ...prev, kycStatus: data.kycStatus ?? decision, adminNote: adminNote.trim() || null } : prev);
      setMessage({ type: "success", text: `KYC ${decision === "APPROVED" ? "approved" : "rejected"} successfully. Author will be notified by email.` });
      setAdminNote("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-stone-400" />
        <span className="text-sm text-stone-500">Loading KYC information…</span>
      </div>
    );
  }

  const statusInfo = statusConfig[kyc?.kycStatus ?? "NOT_SUBMITTED"];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#24352f]">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">KYC / Tax Form Review</h2>
            <p className="text-xs text-neutral-500">Gate 2 — Identity & Tax Verification</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1", statusInfo.bg, statusInfo.color)}>
          {statusInfo.icon}
          {statusInfo.label}
        </div>
      </div>

      {/* Not submitted yet */}
      {(!kyc || kyc.kycStatus === "NOT_SUBMITTED") && (
        <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-4 ring-1 ring-neutral-200">
          <Clock className="size-5 text-neutral-400 shrink-0" />
          <p className="text-sm text-neutral-500">This author has not yet submitted their KYC documents.</p>
        </div>
      )}

      {/* Submitted / reviewed */}
      {kyc && kyc.kycStatus !== "NOT_SUBMITTED" && (
        <>
          {/* Tax Form Info */}
          <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200 space-y-3">
            <h3 className="text-sm font-bold text-neutral-800">Tax Form Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <KycDetail label="Form Type" value={kyc.taxFormType ?? "—"} />
              <KycDetail label="Country" value={kyc.taxCountry ?? "—"} />
              <KycDetail label="Taxpayer Name" value={kyc.taxpayerName ?? "—"} />
              <KycDetail label="Tax ID" value={kyc.taxId ? `•••-${kyc.taxId.slice(-4)}` : "—"} />
            </div>
            {kyc.submittedAt && (
              <p className="text-xs text-neutral-400 pt-1">
                Submitted {new Date(kyc.submittedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>

          {/* ID Document Photos */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-800">ID Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <IdCard label="Front Side" url={kyc.idFrontUrl} />
              <IdCard label="Back Side" url={kyc.idBackUrl} />
            </div>
            {kyc.taxFormFileUrl && (
              <a
                href={kyc.taxFormFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#24352f]/5 px-4 py-2.5 text-sm font-medium text-[#24352f] ring-1 ring-[#24352f]/20 hover:bg-[#24352f]/10 transition-colors"
              >
                <Eye className="size-4" />
                View uploaded tax form PDF
              </a>
            )}
          </div>

          {/* Admin Note (previous) */}
          {kyc.adminNote && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <p className="text-xs font-semibold text-amber-700">Previous admin note:</p>
              <p className="mt-0.5 text-sm text-amber-800">{kyc.adminNote}</p>
            </div>
          )}

          {/* Review Actions — only show if SUBMITTED */}
          {kyc.kycStatus === "SUBMITTED" && (
            <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-800">Review Decision</h3>
              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">
                  Admin Note (optional — shown to author on rejection)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. ID photo is blurry. Please resubmit a clearer photo."
                  rows={3}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#66756d] focus:outline-none focus:ring-2 focus:ring-[#66756d]/20 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleReview("APPROVED")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                  Approve KYC
                </button>
                <button
                  onClick={() => void handleReview("REJECTED")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                  Reject KYC
                </button>
              </div>
            </div>
          )}

          {/* Reviewed at */}
          {kyc.reviewedAt && (
            <p className="text-xs text-neutral-400">
              Reviewed on {new Date(kyc.reviewedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </>
      )}

      {/* Result message */}
      {message && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm ring-1",
          message.type === "success" ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-600 ring-red-200"
        )}>
          {message.type === "success" ? <CheckCircle className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          {message.text}
        </div>
      )}
    </div>
  );
}

function KycDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-semibold text-neutral-800 mt-0.5">{value}</p>
    </div>
  );
}

function IdCard({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-stone-100 ring-1 ring-stone-200">
        <p className="text-xs text-stone-400">{label} — not uploaded</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-neutral-500">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block group relative overflow-hidden rounded-xl ring-1 ring-stone-200 hover:ring-[#66756d] transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="h-40 w-full object-cover group-hover:opacity-90 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <Eye className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
    </div>
  );
}
