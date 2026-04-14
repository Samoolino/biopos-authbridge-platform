export interface RailAdapterAuthorizeInput {
  requestId: string;
  amount: number;
  currency: string;
  customerRef: string;
}

export interface RailAdapterAuthorizeOutput {
  providerName: string;
  providerReference: string;
  status: "approved" | "pending" | "failed";
}

export class MonnifyAdapter {
  readonly providerName = "monnify";

  async authorize(input: RailAdapterAuthorizeInput): Promise<RailAdapterAuthorizeOutput> {
    return {
      providerName: this.providerName,
      providerReference: `monnify_${input.requestId}`,
      status: "approved",
    };
  }

  validateWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }
}
