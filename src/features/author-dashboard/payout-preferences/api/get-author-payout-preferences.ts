import type { AuthorPayoutPreferencesData } from "../types";

type ApiEnvelope<T> = {
  data: T;
};

type BackendPayout = {
  id: string;
  amount: number;
  stripeTransferId: string | null;
  status: string;
  createdAt: string;
};

type StripeStatus = {
  status: "NOT_CREATED" | "CREATED";
  stripeAccountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatStatus(status: string): AuthorPayoutPreferencesData["payouts"][number]["status"] {
  switch (status) {
    case "PENDING_REQUEST":
      return "Pending request";
    case "REQUESTED":
      return "Requested";
    case "APPROVED":
      return "Approved";
    case "PAID":
      return "Paid";
    case "REJECTED":
      return "Rejected";
    default:
      return "Not connected";
  }
}

export async function getAuthorPayoutPreferences(
  accessToken: string,
): Promise<AuthorPayoutPreferencesData> {
  const [payoutsResponse, stripeStatusResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/author`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/commerce/author/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
  ]);

  if (!payoutsResponse.ok || !stripeStatusResponse.ok) {
    throw new Error("Failed to load payout preferences.");
  }

  const payoutsPayload =
    (await payoutsResponse.json()) as ApiEnvelope<BackendPayout[]>;
  const stripeStatusPayload =
    (await stripeStatusResponse.json()) as ApiEnvelope<StripeStatus> | StripeStatus;

  const stripeStatus =
    "data" in stripeStatusPayload ? stripeStatusPayload.data : stripeStatusPayload;
  const payouts = payoutsPayload.data;

  return {
    entriesLabel: `Showing 1 to ${payouts.length} of ${payouts.length} entries`,
    stripeStatus,
    payouts: payouts.map((payout) => ({
      id: payout.id,
      date: new Date(payout.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      transactionId: payout.stripeTransferId || payout.id,
      method: stripeStatus.status === "CREATED" ? "Stripe Connect" : "Not connected",
      status: formatStatus(payout.status),
      amount: formatCurrency(payout.amount),
    })),
  };
}
