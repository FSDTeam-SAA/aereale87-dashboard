"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Ban } from "lucide-react";
import { toast } from "sonner";

import { approveAuthor, suspendAuthor } from "../api/authors.api";
import type { AuthorStatus } from "../types";

export function AuthorStatusAction({
  id,
  status,
  accessToken,
}: {
  id: string;
  status: AuthorStatus;
  accessToken: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function approve() {
    setPending(true);
    try {
      await approveAuthor(id, accessToken);
      toast.success("Author approved and notified by email.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed.");
    } finally {
      setPending(false);
    }
  }

  async function suspend() {
    setPending(true);
    try {
      await suspendAuthor(id, accessToken);
      toast.success("Author suspended.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suspend failed.");
    } finally {
      setPending(false);
    }
  }

  if (status === "ACTIVE") {
    return (
      <button
        disabled={pending}
        onClick={suspend}
        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        <Ban className="size-4" />
        {pending ? "Suspending..." : "Suspend"}
      </button>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={approve}
      className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
    >
      <CheckCircle2 className="size-4" />
      {pending ? "Approving..." : "Approve"}
    </button>
  );
}

