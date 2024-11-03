import { Interaction, InteractionInterface } from "../common/interaction";
import { ConstantsInstance } from "./consts";
import { erosion } from "./trust/utils";

export interface TrustRecordInterface {
  currentTrustLevel: number;
  lastUpdate: Date;
  interactions: InteractionInterface[];
}

export class TrustRecord implements TrustRecordInterface {
  public currentTrustLevel: number;
  public lastUpdate: Date;
  public interactions: Interaction[];

  constructor(lastUpdate?: Date) {
    this.currentTrustLevel = ConstantsInstance.INIT_TRUST_VALUE;
    this.interactions = [];
    this.lastUpdate = lastUpdate ?? new Date();
  }

  getTrustLevel(): number {
    return erosion(this.currentTrustLevel, this.lastUpdate, new Date());
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
    this.lastUpdate = interaction.timestamp;
  }

  public updateTrustScore(trust: number): void {
    this.currentTrustLevel = (this.currentTrustLevel + trust) / 2;
  }
}
