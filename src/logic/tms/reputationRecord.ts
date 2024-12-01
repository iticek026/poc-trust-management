import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";
import { TrustValue } from "./trustValue";

export class ReputationRecord extends TrustValue {
  public trustScores: { trustScore: number; timestamp: number }[] = [
    { trustScore: ConstantsInstance.INIT_TRUST_VALUE, timestamp: 0 },
  ];

  constructor(lastUpdate: Date) {
    super(ConstantsInstance.INIT_TRUST_VALUE, lastUpdate);
  }

  updateTrust(trustValue: number): void {
    const newReputation =
      (ConstantsInstance.AUTHORITY_PROPAGATION_WEIGHT * this.trustScore +
        ConstantsInstance.ROBOT_PROPAGATION_WEIGHT * trustValue) /
      (ConstantsInstance.AUTHORITY_PROPAGATION_WEIGHT + ConstantsInstance.ROBOT_PROPAGATION_WEIGHT);

    this.trustScores.push({ trustScore: newReputation, timestamp: timestamp });
    this.trustScore = newReputation;
    this.lastUpdate = new Date();
  }
}
