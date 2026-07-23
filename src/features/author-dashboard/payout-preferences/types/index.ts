export type AuthorPayoutStatus =
  | "Not connected"
  | "Pending request"
  | "Requested"
  | "Approved"
  | "Paid"
  | "Rejected";

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
  stripeStatus: {
    status: "NOT_CREATED" | "CREATED";
    stripeAccountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  };
};
