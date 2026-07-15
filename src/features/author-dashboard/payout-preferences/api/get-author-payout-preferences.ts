import type { AuthorPayoutPreferencesData } from "../types";

export async function getAuthorPayoutPreferences(): Promise<AuthorPayoutPreferencesData> {
  return Promise.resolve({
    entriesLabel: "Showing 1 to 4 of 24 entries",
    payouts: [
      {
        id: "payout-1",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Pending",
        amount: "$845.00",
      },
      {
        id: "payout-2",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Completed",
        amount: "$845.00",
      },
      {
        id: "payout-3",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Pending",
        amount: "$845.00",
      },
      {
        id: "payout-4",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Completed",
        amount: "$845.00",
      },
      {
        id: "payout-5",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Pending",
        amount: "$845.00",
      },
      {
        id: "payout-6",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Completed",
        amount: "$845.00",
      },
      {
        id: "payout-7",
        date: "Jun 15, 2026",
        transactionId: "TXN-45892",
        method: "Bank Transfer",
        status: "Pending",
        amount: "$845.00",
      },
    ],
  });
}
