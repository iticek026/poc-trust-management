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

export function erosion(trustScore: number, interactionTimestamp: Date, currectSimTime: Date): number;
export function erosion(trustScore: number, diff: number): number;

export function erosion(trustScore: number, arg: Date | number, currectSimTime?: Date): number {
  let lambda = 0.1;

  if (typeof arg === "number") {
    return INIT_TRUST_VALUE + (trustScore - INIT_TRUST_VALUE) / (1 + lambda * arg);
  }

  const timeDifference = Math.round(
    Math.round((currectSimTime as Date).getTime() / 1000 - (arg as Date).getTime() / 1000),
  );
  return INIT_TRUST_VALUE + (trustScore - INIT_TRUST_VALUE) / (1 + lambda * timeDifference);

  // const erosionFactor = 0.1;
  // const defferrence = trustScore - INIT_TRUST_VALUE;
  // const timeDifference =
  //   Math.round(interactionTimestamp.getTime() / 1000) - Math.round(currectSimTime.getTime() / 1000);
  // const power = -erosionFactor * timeDifference;
  // return INIT_TRUST_VALUE + defferrence * Math.E ** power;
}

// export function erosion(trustScore: number, diff: number): number {
//   let lambda = 0.1;
//   const timeDifference = diff;
//   return trustScore + timeDifference * lambda * (INIT_TRUST_VALUE - trustScore);
// }
