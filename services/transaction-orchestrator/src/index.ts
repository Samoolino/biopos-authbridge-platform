import { AuthorizationDecision, AuthorizationRequest } from "../../../packages/shared-types/src";
import { IdentityService } from "../../identity-service/src";
import { AuthenticationService } from "../../auth-service/src";
import { PolicyEngine } from "../../policy-engine/src";
import { ConsentService } from "../../consent-service/src";

export class TransactionOrchestrator {
  constructor(
    private readonly identityService: IdentityService,
    private readonly authService: AuthenticationService,
    private readonly policyEngine: PolicyEngine,
    private readonly consentService: ConsentService,
  ) {}

  async authorize(req: AuthorizationRequest): Promise<AuthorizationDecision> {
    const eligible = await this.identityService.verifyEligibility(req.customerRef);
    if (!eligible) {
      return {
        requestId: req.requestId,
        status: "failed",
        amlFlag: false,
        riskScore: 100,
        reasonCode: "IDENTITY_NOT_ELIGIBLE",
        consentId: "",
      };
    }

    const biometric = await this.authService.verifyBiometricToken(req.biometricProofToken);
    if (!biometric.success) {
      return {
        requestId: req.requestId,
        status: "failed",
        amlFlag: false,
        riskScore: 100,
        reasonCode: biometric.reasonCode ?? "BIOMETRIC_FAILED",
        consentId: "",
      };
    }

    const profile = await this.identityService.getCustomerProfile(req.customerRef);
    const policy = await this.policyEngine.evaluate({
      amount: req.amount,
      transactionType: req.transactionType,
      kycTier: profile?.kycTier ?? 0,
      merchantRiskTier: "medium",
      livenessPassed: biometric.livenessPassed,
    });

    const consent = await this.consentService.createConsentArtifact({
      requestId: req.requestId,
      customerRef: req.customerRef,
      merchantId: req.merchantId,
      terminalId: req.terminalId,
      policyOutcome: policy.approved ? "approved" : "declined",
    });

    if (!policy.approved) {
      return {
        requestId: req.requestId,
        status: "under_review",
        amlFlag: policy.amlFlag,
        riskScore: policy.riskScore,
        reasonCode: policy.reasonCode,
        consentId: consent.consentId,
      };
    }

    return {
      requestId: req.requestId,
      status: "approved",
      amlFlag: policy.amlFlag,
      riskScore: policy.riskScore,
      consentId: consent.consentId,
      settlementRef: `settle_${Date.now()}`,
    };
  }
}
