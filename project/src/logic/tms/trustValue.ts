export interface ITrustValue {
  updateTrust(trust: number): void;
}

export abstract class TrustValue implements ITrustValue {
  public trustScore: number;
  public lastUpdate: Date;

  constructor(trustScore: number, lastUpdate: Date) {
    this.trustScore = trustScore;
    this.lastUpdate = lastUpdate;
  }

  abstract updateTrust(trust: number): void;
}
