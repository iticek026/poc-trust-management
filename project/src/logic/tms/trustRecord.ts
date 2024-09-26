import { Interaction } from "../common/interaction";
import { INIT_TRUST_VALUE } from "./consts";

export class TrustRecord {
  public currentTrustLevel: number;
  public lastUpdate: Date;
  public interactions: Interaction[];

  constructor(lastUpdate: Date = new Date()) {
    this.currentTrustLevel = INIT_TRUST_VALUE;
    this.interactions = [];
    this.lastUpdate = lastUpdate;
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
  }

  public calculateTrustLevel(trust: number): void {
    this.currentTrustLevel = (this.currentTrustLevel + trust) / 2;
  }
}
