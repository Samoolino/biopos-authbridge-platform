export class RapydAdapter {
  readonly providerName = "rapyd";

  async authorize(requestId: string) {
    return {
      providerName: this.providerName,
      providerReference: `rapyd_${requestId}`,
      status: "approved" as const,
    };
  }
}
