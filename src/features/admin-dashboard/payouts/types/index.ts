export type AdminPayoutStatus =
  | "PENDING_REQUEST"
  | "REQUESTED"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

export type AdminPayoutRecord = {
  id: string;
  authorName: string;
  authorEmail: string;
  orderId: string;
  amount: string;
  platformFee: string;
  status: AdminPayoutStatus;
  createdAt: string;
};

export type AdminPayoutsData = {
  payouts: AdminPayoutRecord[];
  requestedCount: number;
  approvedCount: number;
  paidCount: number;
  backendOrdersAvailable: boolean;
};
