import { INIT_TRUST_VALUE } from "./consts";
import { TrustUpdateRecord } from "./trustUpdateRecord";

export class ReputationRecord {
  public robotId: number;
  public reputationScore: number;
  private trustUpdates: TrustUpdateRecord[];

  constructor(robotId: number) {
    this.robotId = robotId;
    this.reputationScore = INIT_TRUST_VALUE; // Default starting reputation
    this.trustUpdates = [];
  }

  public addTrustUpdate(trustUpdate: TrustUpdateRecord): void {
    this.trustUpdates.push(trustUpdate);
  }

  public calculateReputation(): void {
    if (this.trustUpdates.length === 0) {
      this.reputationScore = INIT_TRUST_VALUE;
      return;
    }

    // Calculate the average trust value from trust updates
    const totalTrust = this.trustUpdates.reduce((sum, update) => sum + update.trustValue, 0);
    this.reputationScore = totalTrust / this.trustUpdates.length;

    // Ensure reputation score is within [0, 1]
    this.reputationScore = Math.max(0, Math.min(1, this.reputationScore));
  }
}
