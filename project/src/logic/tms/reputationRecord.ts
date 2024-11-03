import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";
import { erosion } from "./trust/utils";

export class ReputationRecord {
  public reputationScore: number;
  public lastUpdate: Date;
  public reputationScores: { reputationScore: number; timestamp: number }[] = [
    { reputationScore: ConstantsInstance.INIT_TRUST_VALUE, timestamp: 0 },
  ];

  constructor(lastUpdate: Date) {
    this.reputationScore = ConstantsInstance.INIT_TRUST_VALUE;
    this.lastUpdate = lastUpdate;
  }

  updateReputationScore(trustValue: number): void {
    const newReputation = erosion((trustValue + this.reputationScore) / 2, this.lastUpdate, new Date());
    this.reputationScores.push({ reputationScore: newReputation, timestamp: timestamp });
    this.reputationScore = newReputation;
    this.lastUpdate = new Date();
  }
}
