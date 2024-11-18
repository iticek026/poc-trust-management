import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";

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
    const newReputation = (trustValue + this.reputationScore) / 2;
    this.reputationScores.push({ reputationScore: newReputation, timestamp: timestamp });
    this.reputationScore = newReputation;
    this.lastUpdate = new Date();
  }
}
