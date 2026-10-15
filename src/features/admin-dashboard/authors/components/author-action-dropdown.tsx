"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  Ban,
  FileText,
  User,
  Loader2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { approveAuthor, suspendAuthor } from "../api/authors.api";
import { cn } from "@/lib/utils";
import type { AuthorStatus } from "../types";

interface AuthorActionDropdownProps {
  id: string;
  name: string;
  status: AuthorStatus;
  accessToken: string;
  taxFormFileUrl?: string | null;
  compact?: boolean;
}

export function AuthorActionDropdown({
  id,
  name,
  status,
  accessToken,
  taxFormFileUrl,
  compact = false,
}: AuthorActionDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "suspend" | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleApprove() {
    setPendingAction("approve");
    setIsOpen(false);
    try {
      await approveAuthor(id, accessToken);
      toast.success(`${name} has been approved and notified by email.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSuspend() {
    setPendingAction("suspend");
    setShowSuspendModal(false);
    try {
      await suspendAuthor(id, accessToken);
      toast.success(`${name} has been suspended. Active sessions revoked.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suspension failed.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={pendingAction !== null}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#cfaf45]/50 disabled:opacity-50"
      >
        {pendingAction ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-[#997b1e]" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <span>Choose Action</span>
            <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
          <div className="border-b border-slate-100 px-3 py-1.5">
            <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Current: <span className="font-bold text-slate-700">{status === "INACTIVE" ? "PENDING" : status}</span>
            </p>
          </div>

          <div className="py-1">
            {/* Action: Approve */}
            <button
              type="button"
              disabled={status === "ACTIVE"}
              onClick={handleApprove}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors",
                status === "ACTIVE"
                  ? "text-slate-400 cursor-not-allowed bg-slate-50/50"
                  : "text-emerald-700 hover:bg-emerald-50"
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Approve Author</span>
              </div>
              {status === "ACTIVE" && (
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Current
                </span>
              )}
            </button>

            {/* Action: Suspend */}
            <button
              type="button"
              disabled={status === "SUSPENDED"}
              onClick={() => {
                setIsOpen(false);
                setShowSuspendModal(true);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors",
                status === "SUSPENDED"
                  ? "text-slate-400 cursor-not-allowed bg-slate-50/50"
                  : "text-red-600 hover:bg-red-50"
              )}
            >
              <div className="flex items-center gap-2">
                <Ban className="size-4 text-red-500" />
                <span>Suspend Author</span>
              </div>
              {status === "SUSPENDED" && (
                <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  Current
                </span>
              )}
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Action: View Tax / W-9 Form */}
            {taxFormFileUrl ? (
              <a
                href={taxFormFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="size-4 text-amber-600" />
                <span>View W-9 / Tax PDF</span>
                <ExternalLink className="ml-auto size-3 text-slate-400" />
              </a>
            ) : (
              <Link
                href={`/admin-dashboard/tax-forms`}
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="size-4 text-slate-500" />
                <span>Tax & W-9 Center</span>
              </Link>
            )}

            {/* Action: View Profile */}
            <Link
              href={`/admin-dashboard/authors/${id}`}
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="size-4 text-slate-500" />
              <span>View Author Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowSuspendModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSuspendModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="size-6" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-slate-900">Suspend Author</h3>
              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to suspend <strong className="text-slate-800">{name}</strong>?
              </p>
              <p className="mt-1 text-xs text-red-600">
                Their active login sessions will be immediately invalidated and they will be blocked from listing or editing books.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="w-1/2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSuspend}
                className="w-1/2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800"
              >
                Yes, Suspend Author
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
