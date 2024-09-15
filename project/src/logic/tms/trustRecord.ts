import { Interaction } from "../common/interaction";
import { INIT_TRUST_VALUE } from "./consts";
import { ContextInformation } from "./trust/contextInformation";

export class TrustRecord {
  public currentTrustLevel: number;
  public interactions: Interaction[];

  constructor() {
    this.currentTrustLevel = INIT_TRUST_VALUE;
    this.interactions = [];
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
    this.calculateTrustLevel();
  }

  public calculateTrustLevel(): void {
    let totalTrust = 0;
    this.interactions.forEach((interaction) => {
      const contextInfluence = this.evaluateContextInfluence(interaction.context);
      const outcomeValue = interaction.outcome ? 1 : -1;
      totalTrust += outcomeValue * contextInfluence;
    });
    this.currentTrustLevel = totalTrust / this.interactions.length;
  }

  private evaluateContextInfluence(context: ContextInformation): number {
    // TODO
    // Determine how the context affects trust
    // Placeholder logic:
    return 1; // Neutral influence
  }
}
