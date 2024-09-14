import { DIRECT_TRUST_WEIGHT, INDIRECT_TRUST_WEIGHT } from "../consts";

export function calculateTrust(directTrust: number, indirectTrust: number): number {
  return (
    (directTrust * DIRECT_TRUST_WEIGHT + indirectTrust * INDIRECT_TRUST_WEIGHT) /
    (DIRECT_TRUST_WEIGHT + INDIRECT_TRUST_WEIGHT)
  );
}
