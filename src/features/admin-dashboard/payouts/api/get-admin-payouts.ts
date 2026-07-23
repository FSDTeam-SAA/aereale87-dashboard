import type { AdminPayoutsData } from "../types";

type ApiEnvelope<T> = {
  data: T;
};

type BackendPayout = {
  id: string;
  amount: number;
  platformFee: number;
  status: AdminPayoutsData["payouts"][number]["status"];
  createdAt: string;
  author: {
    email: string;
    username: string;
  };
  order: {
    id: string;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export async function getAdminPayouts(
  accessToken: string,
): Promise<AdminPayoutsData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/admin`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load admin payouts.");
  }

  const payload = (await response.json()) as ApiEnvelope<BackendPayout[]>;
  const payouts = payload.data;

  return {
    payouts: payouts.map((payout) => ({
      id: payout.id,
      authorName: payout.author.username,
      authorEmail: payout.author.email,
      orderId: payout.order.id,
      amount: formatCurrency(payout.amount),
      platformFee: formatCurrency(payout.platformFee),
      status: payout.status,
      createdAt: new Date(payout.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
    requestedCount: payouts.filter((item) => item.status === "REQUESTED").length,
    approvedCount: payouts.filter((item) => item.status === "APPROVED").length,
    paidCount: payouts.filter((item) => item.status === "PAID").length,
    backendOrdersAvailable: false,
  };
}
