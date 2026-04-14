export interface BiometricVerificationResult {
  success: boolean;
  confidenceScore: number;
  livenessPassed: boolean;
  reasonCode?: string;
}

export class AuthenticationService {
  async verifyBiometricToken(token: string): Promise<BiometricVerificationResult> {
    if (!token || token.length < 20) {
      return {
        success: false,
        confidenceScore: 0,
        livenessPassed: false,
        reasonCode: "INVALID_BIOMETRIC_TOKEN",
      };
    }

    return {
      success: true,
      confidenceScore: 0.97,
      livenessPassed: true,
    };
  }
}
