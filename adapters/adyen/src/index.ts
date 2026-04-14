export class AdyenAdapter {
  readonly providerName = "adyen";

  async authorize(requestId: string) {
    return {
      providerName: this.providerName,
      providerReference: `adyen_${requestId}`,
      status: "approved" as const,
    };
  }
}
