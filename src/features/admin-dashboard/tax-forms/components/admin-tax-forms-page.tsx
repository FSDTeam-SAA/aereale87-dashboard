"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  User,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { PageTitle } from "@/components/shared/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminTaxFormRecord, KycStatus } from "../types";

interface Props {
  initialData: AdminTaxFormRecord[];
  accessToken: string;
}

export function AdminTaxFormsPage({ initialData, accessToken }: Props) {
  const router = useRouter();
  const safeInitial = useMemo(() => {
    if (Array.isArray(initialData)) return initialData;
    if (Array.isArray((initialData as any)?.data)) return (initialData as any).data;
    return [];
  }, [initialData]);

  const [data, setData] = useState<AdminTaxFormRecord[]>(safeInitial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<KycStatus | "ALL">("ALL");
  const [formTypeFilter, setFormTypeFilter] = useState<string>("ALL");

  // Inspect Modal State
  const [inspectRecord, setInspectRecord] = useState<AdminTaxFormRecord | null>(null);

  // Review Decision Modal State
  const [reviewRecord, setReviewRecord] = useState<AdminTaxFormRecord | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Stat Counts
  const stats = useMemo(() => {
    return {
      total: safeData.length,
      pending: safeData.filter((d) => d.kycStatus === "SUBMITTED").length,
      approved: safeData.filter((d) => d.kycStatus === "APPROVED").length,
      rejected: safeData.filter((d) => d.kycStatus === "REJECTED").length,
    };
  }, [safeData]);

  // Filtered List
  const filteredData = useMemo(() => {
    return safeData.filter((item) => {
      const authorName =
        `${item.author?.userProfile?.firstName || ""} ${item.author?.userProfile?.lastName || ""} ${item.author?.username || ""}`.toLowerCase();
      const email = (item.author?.email || "").toLowerCase();
      const taxpayer = (item.taxpayerName || "").toLowerCase();
      const matchesSearch =
        authorName.includes(query.toLowerCase()) ||
        email.includes(query.toLowerCase()) ||
        taxpayer.includes(query.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || item.kycStatus === statusFilter;
      const matchesType =
        formTypeFilter === "ALL" || (item.taxFormType || "").toUpperCase() === formTypeFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data, query, statusFilter, formTypeFilter]);

  async function handleReviewSubmit() {
    if (!reviewRecord) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/${reviewRecord.authId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          decision,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      const resData = (await res.json()) as { kycStatus?: KycStatus; error?: string };
      if (!res.ok) throw new Error(resData.error ?? "Failed to update review status.");

      toast.success(
        `Tax form ${decision === "APPROVED" ? "approved" : "rejected"} successfully.`
      );

      // Optimistically update local state
      setData((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) =>
          item.authId === reviewRecord.authId
            ? {
                ...item,
                kycStatus: decision,
                adminNote: adminNote.trim() || null,
                reviewedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setReviewRecord(null);
      setInspectRecord(null);
      setAdminNote("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Compliance & Verification"
        title="Author W-9 & Tax Forms"
        description="Access and review uploaded W-9 forms, foreign tax certificates (W-8BEN), taxpayer IDs, and identity documents."
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Filings</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Awaiting Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved W-9s</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{stats.rejected}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(["ALL", "SUBMITTED", "APPROVED", "REJECTED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    statusFilter === tab
                      ? "bg-[#cfaf45] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {tab === "SUBMITTED" ? "Awaiting Review" : tab}
                </button>
              ))}

              <span className="hidden h-5 w-px bg-slate-200 sm:inline-block mx-1" />

              {/* Form Type Filter */}
              <select
                value={formTypeFilter}
                onChange={(e) => setFormTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#cfaf45]/50"
              >
                <option value="ALL">All Form Types</option>
                <option value="W-9">W-9 Only</option>
                <option value="W-8BEN">W-8BEN Only</option>
                <option value="W-8BEN-E">W-8BEN-E Only</option>
              </select>
            </div>

            {/* Search Input */}
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 bg-white">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search author, email, or taxpayer..."
                className="bg-transparent text-sm outline-none w-56 sm:w-64"
              />
            </label>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Author</th>
                  <th className="p-4 font-semibold">Form Type</th>
                  <th className="p-4 font-semibold">Taxpayer / Legal Name</th>
                  <th className="p-4 font-semibold">Tax ID / SSN</th>
                  <th className="p-4 font-semibold">Submitted</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Documents & Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => {
                  const authorName =
                    `${item.author?.userProfile?.firstName || ""} ${item.author?.userProfile?.lastName || ""}`.trim() ||
                    item.author?.username ||
                    "Author";

                  const maskedTaxId = item.taxId
                    ? `•••-••-${item.taxId.slice(-4)}`
                    : "Not provided";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Author */}
                      <td className="p-4">
                        <Link
                          href={`/admin-dashboard/authors/${item.authId}`}
                          className="font-semibold text-slate-900 hover:text-[#a88922] transition-colors"
                        >
                          {authorName}
                        </Link>
                        <p className="text-xs text-slate-500">{item.author?.email}</p>
                      </td>

                      {/* Form Type */}
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-[#24352f]/10 px-2.5 py-1 text-xs font-bold text-[#24352f] ring-1 ring-[#24352f]/20">
                          {item.taxFormType || "W-9"}
                        </span>
                      </td>

                      {/* Taxpayer Name */}
                      <td className="p-4">
                        <p className="font-medium text-slate-900">{item.taxpayerName || "—"}</p>
                        <p className="text-xs text-slate-500">{item.taxCountry || "United States"}</p>
                      </td>

                      {/* Tax ID */}
                      <td className="p-4 font-mono text-xs text-slate-700">{maskedTaxId}</td>

                      {/* Submitted Date */}
                      <td className="p-4 text-xs text-slate-600">
                        {item.submittedAt
                          ? new Date(item.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {item.kycStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle className="size-3.5 text-emerald-500" />
                            Approved
                          </span>
                        ) : item.kycStatus === "SUBMITTED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                            <Clock className="size-3.5 text-amber-500 animate-pulse" />
                            Awaiting Review
                          </span>
                        ) : item.kycStatus === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                            <XCircle className="size-3.5 text-red-500" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            Not Submitted
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* W-9 PDF view */}
                          {item.taxFormFileUrl ? (
                            <a
                              href={item.taxFormFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                              title="Open uploaded W-9 PDF"
                            >
                              <FileText className="size-3.5 text-amber-600" />
                              <span>View W-9</span>
                              <ExternalLink className="size-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No PDF</span>
                          )}

                          {/* Inspect Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setInspectRecord(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            <Eye className="size-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>

                          {/* Review Action Trigger (if submitted) */}
                          {item.kycStatus === "SUBMITTED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewRecord(item);
                                setDecision("APPROVED");
                                setAdminNote("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              <ShieldCheck className="size-3.5" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredData.length && (
              <p className="py-12 text-center text-slate-500">No tax forms match this view.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspect KYC & ID Documents Modal */}
      {inspectRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setInspectRecord(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectRecord(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#24352f] text-white">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {inspectRecord.author?.userProfile?.firstName || ""}{" "}
                  {inspectRecord.author?.userProfile?.lastName || inspectRecord.author?.username} — Tax Review
                </h3>
                <p className="text-xs text-slate-500">{inspectRecord.author?.email}</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Tax Details Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Tax Form Type</p>
                  <p className="font-semibold text-slate-900">{inspectRecord.taxFormType || "W-9"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Country of Tax Residence</p>
                  <p className="font-semibold text-slate-900">{inspectRecord.taxCountry || "United States"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Taxpayer / Legal Entity Name</p>
                  <p className="font-semibold text-slate-900">{inspectRecord.taxpayerName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tax ID (SSN / EIN / TIN)</p>
                  <p className="font-semibold font-mono text-slate-900">
                    {inspectRecord.taxId ? `•••-••-${inspectRecord.taxId.slice(-4)}` : "—"}
                  </p>
                </div>
              </div>

              {/* Uploaded W-9 PDF link */}
              {inspectRecord.taxFormFileUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-6 text-amber-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Uploaded Tax Form PDF</p>
                      <p className="text-xs text-slate-500">Signed official W-9 / W-8BEN document</p>
                    </div>
                  </div>
                  <a
                    href={inspectRecord.taxFormFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#24352f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1a2823] transition-colors"
                  >
                    <Eye className="size-4" />
                    <span>View Form PDF</span>
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                  No tax form PDF uploaded by author.
                </div>
              )}

              {/* ID Document Photos */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Government ID Photos</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-600">ID Front Side</p>
                    {inspectRecord.idFrontUrl ? (
                      <a href={inspectRecord.idFrontUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={inspectRecord.idFrontUrl} alt="ID Front" className="h-40 w-full object-cover group-hover:opacity-90 transition" />
                      </a>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                        Not uploaded
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-600">ID Back Side</p>
                    {inspectRecord.idBackUrl ? (
                      <a href={inspectRecord.idBackUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={inspectRecord.idBackUrl} alt="ID Back" className="h-40 w-full object-cover group-hover:opacity-90 transition" />
                      </a>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                        Not uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Previous Admin Note */}
              {inspectRecord.adminNote && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs">
                  <p className="font-semibold text-amber-800">Admin Note on Record:</p>
                  <p className="mt-0.5 text-amber-900">{inspectRecord.adminNote}</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {inspectRecord.kycStatus === "SUBMITTED" && (
                <button
                  type="button"
                  onClick={() => {
                    setReviewRecord(inspectRecord);
                    setDecision("APPROVED");
                    setAdminNote("");
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Make Review Decision
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Decision Modal */}
      {reviewRecord && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setReviewRecord(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setReviewRecord(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="size-5 text-[#24352f]" />
              <h3 className="text-base font-bold text-slate-900">Review W-9 & Tax Submission</h3>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Author: <strong>{reviewRecord.author?.userProfile?.firstName || ""} {reviewRecord.author?.userProfile?.lastName || reviewRecord.author?.username}</strong> ({reviewRecord.author?.email})
              </p>

              {/* Decision Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("APPROVED")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-bold transition",
                      decision === "APPROVED"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle className="size-4 text-emerald-600" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("REJECTED")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-bold transition",
                      decision === "REJECTED"
                        ? "border-red-600 bg-red-50 text-red-800 ring-2 ring-red-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <XCircle className="size-4 text-red-600" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Admin Note {decision === "REJECTED" ? "(shown to author as rejection reason)" : "(optional)"}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    decision === "REJECTED"
                      ? "e.g. W-9 signature missing or ID blurry. Please resubmit."
                      : "Optional note for records..."
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#cfaf45]/50 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setReviewRecord(null)}
                disabled={actionLoading}
                className="w-1/2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={actionLoading}
                className={cn(
                  "w-1/2 rounded-xl py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5",
                  decision === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Decision</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
