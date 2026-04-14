import { CustomerIdentityProfile } from "../../../packages/shared-types/src";

export class IdentityService {
  async getCustomerProfile(customerRef: string): Promise<CustomerIdentityProfile | null> {
    return {
      customerRef,
      kycTier: 3,
      biometricEnrollmentId: "bio_enroll_123",
      accountLinked: true,
      isRevoked: false,
    };
  }

  async verifyEligibility(customerRef: string): Promise<boolean> {
    const profile = await this.getCustomerProfile(customerRef);
    return !!profile && profile.accountLinked && !profile.isRevoked;
  }
}
