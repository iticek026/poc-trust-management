import { INIT_TRUST_VALUE } from "./consts";

export class ReputationRecord {
  public reputationScore: number;
  public lastUpdate?: Date;

  constructor(lastUpdate?: Date) {
    this.reputationScore = INIT_TRUST_VALUE;
    this.lastUpdate = lastUpdate;
  }
}
