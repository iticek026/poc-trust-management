import { Interaction } from "../common/interaction";
import { INIT_TRUST_VALUE } from "./consts";

export abstract class Trust {
  constructor() {}

  public erosion(trustScore: number, interactionTimestamp: Date, currectSimTime: Date): number {
    const erosionFactor = 0.1;
    return (
      INIT_TRUST_VALUE +
      (trustScore - INIT_TRUST_VALUE) *
        Math.E ** (-erosionFactor * interactionTimestamp.getTime() - currectSimTime.getTime())
    );
  }
}
