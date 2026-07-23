"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AdminPayoutsData } from "../types";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusTone(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-800";
    case "REQUESTED":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-sky-100 text-sky-800";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function AdminPayoutsPage({
  data,
  accessToken,
}: {
  data: AdminPayoutsData;
  accessToken: string;
}) {
  const router = useRouter();
  const approveMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payouts/admin/${payoutId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to approve payout.");
      }
      return payload;
    },
    onSuccess: () => {
      toast.success("Payout approved.");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white">
          <CardHeader><CardTitle>Requested</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{data.requestedCount}</CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{data.approvedCount}</CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader><CardTitle>Paid</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{data.paidCount}</CardContent>
        </Card>
      </section>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Platform payouts</CardTitle>
          {!data.backendOrdersAvailable ? (
            <p className="text-sm text-slate-500">
              Admin all-orders view is still blocked by missing backend contract. This screen uses the live payouts API that is available today.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="p-3">Author</th>
                <th className="p-3">Order</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Platform Fee</th>
                <th className="p-3">Created</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{payout.authorName}</div>
                    <div className="text-xs text-slate-500">{payout.authorEmail}</div>
                  </td>
                  <td className="p-3 font-mono text-xs">{payout.orderId}</td>
                  <td className="p-3">{payout.amount}</td>
                  <td className="p-3">{payout.platformFee}</td>
                  <td className="p-3">{payout.createdAt}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(payout.status)}`}>
                      {formatStatus(payout.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {payout.status === "REQUESTED" ? (
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(payout.id)}
                        disabled={approveMutation.isPending}
                        className="rounded-md bg-[#cfaf45] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve payout
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
