import { Interaction } from "../common/interaction";
import { INIT_TRUST_VALUE } from "./consts";

export class TrustRecord {
  public currentTrustLevel: number;
  public interactions: Interaction[];

  constructor() {
    this.currentTrustLevel = INIT_TRUST_VALUE;
    this.interactions = [];
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
  }

  public calculateTrustLevel(trust: number): void {
    // let totalTrust = 0;
    // this.interactions.forEach((interaction) => {
    //   const contextInfluence = this.evaluateContextInfluence(interaction.context);
    //   const outcomeValue = interaction.outcome ? 1 : -1;
    //   totalTrust += outcomeValue * contextInfluence;
    // });
    // this.currentTrustLevel = totalTrust / this.interactions.length;

    // let contextInfluence = new ContextInformation(interaction.context).getThreshold();

    // if (interaction.expectedValue !== undefined && interaction.receivedValue !== undefined) {
    //   contextInfluence *= 1 - calculateRE(interaction.expectedValue, interaction.receivedValue);
    // }

    // // new ContextInformation(interaction.context);
    // const outcomeValue = interaction.outcome ? 1 : -1;

    // const newInteractionTrust = outcomeValue * contextInfluence;
    this.currentTrustLevel = (this.currentTrustLevel + trust) / 2;
  }
}
