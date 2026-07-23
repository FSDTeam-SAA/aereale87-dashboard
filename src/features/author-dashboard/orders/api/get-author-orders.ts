import type { AuthorOrderStatus, AuthorOrdersData } from "../types";

type ApiEnvelope<T> = {
  data: T;
};

type StatisticsResponse = {
  totalSales: number;
  totalRevenue: number;
};

type AuthorPayout = {
  id: string;
  amount: number;
  status: string;
  order: {
    id: string;
    status: string;
    createdAt: string;
    totalAmount: number;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPayoutStatus(status: string): AuthorOrderStatus {
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
      return "Pending request";
  }
}

export async function getAuthorOrders(
  accessToken: string,
): Promise<AuthorOrdersData> {
  const [statisticsResponse, payoutsResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/statistics/author`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/author`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
  ]);

  if (!statisticsResponse.ok || !payoutsResponse.ok) {
    throw new Error("Failed to load author order data.");
  }

  const statisticsPayload =
    (await statisticsResponse.json()) as ApiEnvelope<StatisticsResponse>;
  const payoutsPayload =
    (await payoutsResponse.json()) as ApiEnvelope<AuthorPayout[]>;

  const statistics = statisticsPayload.data;
  const payouts = payoutsPayload.data;

  return {
    summary: [
      {
        id: "total-orders",
        label: "Total Orders",
        value: String(statistics.totalSales),
      },
      {
        id: "completed-orders",
        label: "Payout Records",
        value: String(payouts.length),
      },
      {
        id: "revenue-generated",
        label: "Revenue Generated",
        value: formatCurrency(statistics.totalRevenue),
      },
    ],
    tabs: [
      { id: "all", label: `All Orders (${payouts.length})`, active: true },
      {
        id: "requested",
        label: `Requested (${payouts.filter((item) => item.status === "REQUESTED").length})`,
      },
      {
        id: "paid",
        label: `Paid (${payouts.filter((item) => item.status === "PAID").length})`,
      },
    ],
    orders: payouts.map((payout) => ({
      id: payout.id,
      payoutId: payout.id,
      orderId: payout.order.id,
      customer: "Customer details pending backend order detail API",
      products: payout.order.status,
      amount: formatCurrency(payout.amount),
      date: new Date(payout.order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: formatPayoutStatus(payout.status),
      payoutStatus: payout.status,
      canRequestPayout: payout.status === "PENDING_REQUEST",
    })),
  };
}
