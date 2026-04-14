export type TransactionStatus =
  | "pending"
  | "approved"
  | "failed"
  | "reversed"
  | "under_review";

export interface CustomerIdentityProfile {
  customerRef: string;
  kycTier: number;
  biometricEnrollmentId: string;
  accountLinked: boolean;
  isRevoked: boolean;
}

export interface AuthorizationRequest {
  requestId: string;
  merchantId: string;
  terminalId: string;
  customerRef: string;
  amount: number;
  currency: string;
  transactionType: "payment" | "cash_out" | "transfer" | "approval";
  biometricProofToken: string;
  timestamp: string;
}

export interface AuthorizationDecision {
  requestId: string;
  status: TransactionStatus;
  reasonCode?: string;
  amlFlag: boolean;
  riskScore: number;
  consentId: string;
  settlementRef?: string;
}
