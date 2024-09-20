import { calculateRE } from "../../../utils/utils";
import { Interaction } from "../../common/interaction";
import {
  COMMUNICATION_TRUST_WEIGHT,
  OBSERVATION_TRUST_WEIGHT,
  PAST_CONTEXT_WEIGHT,
  PAST_TRUST_WEIGHT,
  PAST_TRUSTEE_WEIGHT,
  PRESENT_TRUST_WEIGHT,
} from "../consts";
import { Trust } from "../trust";
import { TrustRecord } from "../trustRecord";
import { ContextInformation } from "./contextInformation";

export class DirectTrust extends Trust {
  public calculate(
    trustRecord: TrustRecord,
    allInteractions: Interaction[],
    actualContext?: ContextInformation,
  ): number {
    if (!actualContext) {
      throw new Error("Actual context is required to calculate direct trust");
    }
    const w_present = PRESENT_TRUST_WEIGHT;
    const w_past = PAST_TRUST_WEIGHT;

    const T_present = this.calculatePresentExperience(trustRecord);
    const T_past = this.calculatePastExperience(trustRecord, actualContext, allInteractions);

    const T_d = (w_present * T_present + w_past * T_past) / (w_present + w_past);
    return T_d;
  }

  private calculatePresentExperience(trustRecord: TrustRecord): number {
    const interactions = trustRecord.interactions;

    const recentInteractions = interactions.slice(-5); // TODO better calculate recent interactions

    const w_communication = COMMUNICATION_TRUST_WEIGHT;
    const w_observation = OBSERVATION_TRUST_WEIGHT;

    let T_communication = 0;
    let T_observation = 0;

    // Calculate T_communication
    let sumCommunicationTrust = 0;
    let countCommunication = 0;
    for (const interaction of recentInteractions) {
      if (interaction.expectedValue !== undefined && interaction.receivedValue !== undefined) {
        const RE = calculateRE(interaction.expectedValue, interaction.receivedValue);
        const T_comm = 1 - RE;
        sumCommunicationTrust += T_comm;
        countCommunication++;
      }
    }
    T_communication = countCommunication > 0 ? sumCommunicationTrust / countCommunication : 0;

    // Calculate T_observation
    let sumBehaviors = 0;
    let countBehaviors = 0;
    for (const interaction of recentInteractions) {
      if (interaction.observedBehaviors && interaction.observedBehaviors.length > 0) {
        sumBehaviors += interaction.observedBehaviors.filter((b) => b).length;
        countBehaviors += interaction.observedBehaviors.length;
      }
    }
    T_observation = countBehaviors > 0 ? sumBehaviors / countBehaviors : 0;

    // Calculate T_present
    const T_present =
      (w_communication * T_communication + w_observation * T_observation) / (w_communication + w_observation);
    return T_present;
  }

  private calculatePastExperience(
    trustRecord: TrustRecord,
    currentContext: ContextInformation,
    allInteractions: Interaction[],
  ): number {
    const T_pastTrustee = this.calculateTrustScoreWithSpecificMember(trustRecord);
    const T_pastContext = this.calculateTrustScoreFromAllInteractionsUsingContext(allInteractions, currentContext);
    const T_past =
      (PAST_TRUSTEE_WEIGHT * T_pastTrustee + PAST_CONTEXT_WEIGHT * T_pastContext) /
      (PAST_TRUSTEE_WEIGHT + PAST_CONTEXT_WEIGHT);
    return T_past;
  }

  private calculateTrustScoreWithSpecificMember(trustRecord: TrustRecord): number {
    const interactions = trustRecord.interactions;

    let numerator = 0;
    let denominator = 0;

    for (const interaction of interactions) {
      const TrustScore_in = interaction.trustScore;

      if (TrustScore_in === undefined) continue;

      // TODO create simulation time
      const erodedTrustScore = this.erosion(interaction.trustScore as number, interaction.timestamp, new Date());

      numerator += erodedTrustScore;
      denominator += 1;
    }

    const T_pastTrustee = denominator > 0 ? numerator / denominator : 0;

    return T_pastTrustee;
  }

  private calculateTrustScoreFromAllInteractionsUsingContext(
    allInteractions: Interaction[],
    currentContext: ContextInformation,
  ): number {
    let numerator = 0;
    let denominator = 0;

    for (const interaction of allInteractions) {
      const Trust_kj = interaction.outcome ? 1 : 0;
      const S_kj = this.calculateSimilarityScore(currentContext, interaction.context);

      numerator += Trust_kj * S_kj;
      denominator += S_kj;
    }

    const T_pastContext = denominator > 0 ? numerator / denominator : 0;

    return T_pastContext;
  }

  private calculateSimilarityScore(currentContext: ContextInformation, pastContext: ContextInformation): number {
    const components = ["stateOfTheTrustor", "missionState", "timeLeft", "dataSensitivity"];
    let S_kj = 0;

    for (const component of components) {
      const C_current = currentContext.getContextComponent(component);
      const C_past = pastContext.getContextComponent(component);

      const alpha = C_current > C_past ? 1 : -1;
      const S_component = (1 - Math.abs(C_current - C_past)) * alpha;
      S_kj += S_component;
    }

    return S_kj;
  }
}
