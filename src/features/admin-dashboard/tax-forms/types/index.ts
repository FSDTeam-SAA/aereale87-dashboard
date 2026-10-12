export type KycStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface AdminTaxFormRecord {
  id: string;
  authId: string;
  idFrontUrl: string | null;
  idFrontKey: string | null;
  idBackUrl: string | null;
  idBackKey: string | null;
  taxFormType: string | null;
  taxpayerName: string | null;
  taxId: string | null;
  taxCountry: string | null;
  taxFormFileUrl: string | null;
  taxFormFileKey: string | null;
  kycStatus: KycStatus;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    username: string;
    userProfile: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}
