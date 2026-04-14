export class StripeAdapter {
  readonly providerName = "stripe";

  async authorize(requestId: string) {
    return {
      providerName: this.providerName,
      providerReference: `stripe_${requestId}`,
      status: "approved" as const,
    };
  }
}
