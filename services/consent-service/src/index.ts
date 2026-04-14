export interface ConsentArtifact {
  consentId: string;
  requestId: string;
  customerRef: string;
  merchantId: string;
  terminalId: string;
  policyOutcome: string;
  createdAt: string;
}

export class ConsentService {
  async createConsentArtifact(input: {
    requestId: string;
    customerRef: string;
    merchantId: string;
    terminalId: string;
    policyOutcome: string;
  }): Promise<ConsentArtifact> {
    return {
      consentId: `consent_${Date.now()}`,
      requestId: input.requestId,
      customerRef: input.customerRef,
      merchantId: input.merchantId,
      terminalId: input.terminalId,
      policyOutcome: input.policyOutcome,
      createdAt: new Date().toISOString(),
    };
  }
}
