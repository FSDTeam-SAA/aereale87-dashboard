import type {
  AdminDashboardOverviewData,
  AdminStatisticsResponse,
} from "../types";

type ApiEnvelope<T> = {
  data: T;
};

type AdminPayout = {
  id: string;
  status: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export async function getAdminDashboardOverview(
  accessToken: string,
): Promise<AdminDashboardOverviewData> {
  const [statisticsResponse, payoutsResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/statistics/admin`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/admin`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
  ]);

  if (!statisticsResponse.ok || !payoutsResponse.ok) {
    throw new Error("Failed to load admin dashboard overview.");
  }

  const statisticsPayload =
    (await statisticsResponse.json()) as ApiEnvelope<AdminStatisticsResponse>;
  const payoutsPayload =
    (await payoutsResponse.json()) as ApiEnvelope<AdminPayout[]>;

  const statistics = statisticsPayload.data;
  const payouts = payoutsPayload.data;

  return {
    stats: [
      {
        title: "Total users",
        value: String(statistics.totalUsers),
        change: `${statistics.totalPublishedBooks} approved books`,
        detail: "registered accounts",
        icon: "traffic",
      },
      {
        title: "Completed sales",
        value: String(statistics.totalSales),
        change: `${payouts.filter((item) => item.status === "REQUESTED").length} awaiting approval`,
        detail: "orders completed",
        icon: "tickets",
      },
      {
        title: "Gross revenue",
        value: formatCurrency(statistics.totalGrossRevenue),
        change: formatCurrency(statistics.totalPlatformRevenue),
        detail: "platform gross",
        icon: "authors",
      },
      {
        title: "Platform revenue",
        value: formatCurrency(statistics.totalPlatformRevenue),
        change: `${payouts.filter((item) => item.status === "PAID").length} payouts paid`,
        detail: "fees retained",
        icon: "uptime",
      },
    ],
    approvals: [
      {
        label: "Requested payouts",
        value: String(payouts.filter((item) => item.status === "REQUESTED").length),
      },
      {
        label: "Approved payouts",
        value: String(payouts.filter((item) => item.status === "APPROVED").length),
      },
      {
        label: "Paid payouts",
        value: String(payouts.filter((item) => item.status === "PAID").length),
      },
    ],
    activity: payouts.slice(0, 5).map((payout, index) => ({
      id: payout.id,
      label: `Payout ${payout.id.slice(0, 8)} is currently ${payout.status.toLowerCase().replaceAll("_", " ")}`,
      meta: `Recent commerce record ${index + 1}`,
    })),
  };
}
