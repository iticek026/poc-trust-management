import { INIT_TRUST_VALUE } from "../consts";

export class Authority {
  private reputation: Map<number, number>;

  constructor() {
    this.reputation = new Map();
  }

  public getReputation(robotId: number): number {
    return this.reputation.get(robotId) || INIT_TRUST_VALUE; // Default reputation
  }

  public updateReputation(robotId: number, trustValue: number): void {
    const currentReputation = this.reputation.get(robotId) || INIT_TRUST_VALUE;
    this.reputation.set(robotId, (currentReputation + trustValue) / 2);
  }

  public ageReputations(): void {
    this.reputation.forEach((value, robotId) => {
      // Apply aging factor
      const agedValue = value * 0.99; // Example aging factor
      this.reputation.set(robotId, agedValue);
    });
  }
}

export const AuthorityInstance = new Authority();
