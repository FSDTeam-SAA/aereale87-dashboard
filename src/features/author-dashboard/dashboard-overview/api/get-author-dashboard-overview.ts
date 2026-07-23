import type {
  AuthorDashboardOverviewData,
  AuthorStatisticsResponse,
} from "../types";

type ApiEnvelope<T> = {
  data: T;
};

type BackendBook = {
  id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  authorEarnings?: number | null;
};

type BackendBooksResponse = {
  books: BackendBook[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getLastSevenDaysRevenue(
  revenueByDay: AuthorStatisticsResponse["revenueByDay"],
) {
  const lookup = new Map(revenueByDay.map((item) => [item.date, item.revenue]));
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const iso = date.toISOString().split("T")[0];
    const revenue = lookup.get(iso) ?? 0;

    return {
      day: formatter.format(date),
      value: revenue,
      tooltip: `${formatter.format(date)} ${formatCurrency(revenue)}`,
    };
  });
}

export async function getAuthorDashboardOverview(
  accessToken: string,
): Promise<AuthorDashboardOverviewData> {
  const [statisticsResponse, booksResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/statistics/author`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/mine?limit=6`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
  ]);

  if (!statisticsResponse.ok) {
    throw new Error("Failed to load author statistics.");
  }

  if (!booksResponse.ok) {
    throw new Error("Failed to load author books.");
  }

  const statisticsPayload =
    (await statisticsResponse.json()) as ApiEnvelope<AuthorStatisticsResponse>;
  const booksPayload =
    (await booksResponse.json()) as ApiEnvelope<BackendBooksResponse>;

  const statistics = statisticsPayload.data;
  const books = booksPayload.data.books ?? [];
  const recentRevenue = getLastSevenDaysRevenue(statistics.revenueByDay);
  const recentTotal = recentRevenue.reduce((sum, item) => sum + item.value, 0);
  const monthlyRevenue = statistics.revenueByMonth.at(-1)?.revenue ?? 0;
  const pendingBooks = books.filter((book) =>
    ["DRAFT", "SUBMITTED", "REJECTED"].includes(book.status),
  ).length;

  return {
    stats: [
      {
        title: "Total Revenue",
        subtitle: "All completed payouts",
        value: formatCurrency(statistics.totalRevenue),
        change: `${recentRevenue.filter((item) => item.value > 0).length} active days`,
        detail: "earned",
        previousLabel: "Based on author payout records",
        accent: "emerald",
        icon: "sales",
      },
      {
        title: "Total Orders",
        subtitle: "Completed order items",
        value: formatCompact(statistics.totalSales),
        change: `${statistics.totalPublishedBooks} approved books`,
        detail: "sales",
        previousLabel: "Pulled from completed order items",
        accent: "emerald",
        icon: "orders",
      },
      {
        title: "Pending & Canceled",
        subtitle: "Books needing attention",
        value: String(pendingBooks),
        change: `${books.filter((book) => book.status === "REJECTED").length} rejected`,
        detail: `${books.filter((book) => book.status === "SUBMITTED").length} submitted`,
        previousLabel: "Draft, submitted, and rejected books",
        accent: pendingBooks > 0 ? "rose" : "emerald",
        icon: "pending",
      },
    ],
    weeklyMetrics: [
      {
        label: "Approved Books",
        value: String(statistics.totalPublishedBooks),
        detail: "Live approved catalog count",
      },
      {
        label: "Recent Revenue",
        value: formatCurrency(recentTotal),
        detail: "Last 7 days from payout activity",
      },
      {
        label: "Monthly Revenue",
        value: formatCurrency(monthlyRevenue),
        detail: "Latest month in backend report",
      },
      {
        label: "Tracked Books",
        value: String(books.length),
        detail: "Most recent author book records",
      },
    ],
    chartPoints: recentRevenue,
    products: books.map((book, index) => ({
      id: book.id,
      title: book.title,
      views: 0,
      sales: 0,
      status:
        book.status === "APPROVED"
          ? "Published"
          : book.status === "DRAFT"
            ? "Draft"
            : "Archived",
      revenue: formatCurrency(book.authorEarnings ?? 0),
      coverTone: [
        "from-[#cb5f2f] via-[#e38f54] to-[#6a221a]",
        "from-[#9e3826] via-[#e5a04c] to-[#8a2b1c]",
        "from-[#ce6b31] via-[#efb55b] to-[#773228]",
        "from-[#8e2c34] via-[#cb6d54] to-[#4d1d36]",
        "from-[#cb7637] via-[#f0c46c] to-[#68412a]",
        "from-[#aa382d] via-[#e57e49] to-[#712820]",
      ][index % 6],
    })),
  };
}
