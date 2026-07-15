export type AuthorPayoutStatus = "Pending" | "Completed";

export type AuthorPayoutRecord = {
  id: string;
  date: string;
  transactionId: string;
  method: string;
  status: AuthorPayoutStatus;
  amount: string;
};

export type AuthorPayoutPreferencesData = {
  entriesLabel: string;
  payouts: AuthorPayoutRecord[];
};
