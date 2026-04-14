export interface PolicyEvaluationResult {
  approved: boolean;
  amlFlag: boolean;
  riskScore: number;
  reasonCode?: string;
}

export class PolicyEngine {
  async evaluate(input: {
    amount: number;
    transactionType: string;
    kycTier: number;
    merchantRiskTier: "low" | "medium" | "high";
    livenessPassed: boolean;
  }): Promise<PolicyEvaluationResult> {
    if (!input.livenessPassed) {
      return {
        approved: false,
        amlFlag: false,
        riskScore: 95,
        reasonCode: "LIVENESS_FAILED",
      };
    }

    if (input.kycTier < 2 && input.amount > 50000) {
      return {
        approved: false,
        amlFlag: true,
        riskScore: 88,
        reasonCode: "KYC_THRESHOLD_EXCEEDED",
      };
    }

    return {
      approved: true,
      amlFlag: false,
      riskScore: input.merchantRiskTier === "high" ? 60 : 25,
    };
  }
}
