export type MerchantTransactionState =
  | "initiated"
  | "biometric_verified"
  | "policy_approved"
  | "settlement_pending"
  | "approved"
  | "failed"
  | "reversed"
  | "under_review";

const allowedTransitions: Record<MerchantTransactionState, MerchantTransactionState[]> = {
  initiated: ["biometric_verified", "failed", "under_review"],
  biometric_verified: ["policy_approved", "failed", "under_review"],
  policy_approved: ["settlement_pending", "approved", "failed"],
  settlement_pending: ["approved", "failed", "reversed"],
  approved: ["reversed"],
  failed: [],
  reversed: [],
  under_review: ["approved", "failed", "reversed"],
};

export function canTransition(
  from: MerchantTransactionState,
  to: MerchantTransactionState,
): boolean {
  return allowedTransitions[from].includes(to);
}
