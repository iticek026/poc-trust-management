import { DIRECT_TRUST_WEIGHT, INDIRECT_TRUST_WEIGHT, INIT_TRUST_VALUE } from "../consts";
import { TrustCalculationData } from "../interfaces";

export function calculateTrust(directTrust: TrustCalculationData, indirectTrust: TrustCalculationData): number {
  let numerator = 0;
  let denominator = 0;

  if (directTrust.wasApplied) {
    numerator += DIRECT_TRUST_WEIGHT * directTrust.value;
    denominator += DIRECT_TRUST_WEIGHT;
  }

  if (indirectTrust.wasApplied) {
    numerator += INDIRECT_TRUST_WEIGHT * indirectTrust.value;
    denominator += INDIRECT_TRUST_WEIGHT;
  }

  return denominator > 0 ? numerator / denominator : INIT_TRUST_VALUE;
}
