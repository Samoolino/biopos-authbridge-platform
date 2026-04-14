import crypto from "crypto";

export class WebhookValidationService {
  constructor(private readonly signingSecret: string) {}

  validateHmacSha256(payload: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", this.signingSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
