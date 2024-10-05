import { ConstantsInstance } from "./consts";

export class ReputationRecord {
  public reputationScore: number;
  public lastUpdate: Date;

  constructor(lastUpdate: Date) {
    this.reputationScore = ConstantsInstance.INIT_TRUST_VALUE;
    this.lastUpdate = lastUpdate;
  }
}
