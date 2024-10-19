import { isValue } from "../../../utils/checks";
import { calculateRE } from "../../../utils/utils";
import { Interaction } from "../../common/interaction";
import { ConstantsInstance } from "../consts";
import { TrustCalculationData } from "../interfaces";
import { TrustRecord } from "../trustRecord";
import { ContextInformation } from "./contextInformation";
import { erosion } from "./utils";

export class DirectTrust {
  public static calculate(
    trustRecord: TrustRecord,
    allInteractions: Interaction[],
    actualContext?: ContextInformation,
  ): TrustCalculationData {
    if (!actualContext) {
      throw new Error("Actual context is required to calculate direct trust");
    }

    const T_present = this.calculatePresentExperience(trustRecord);
    const T_past = this.calculatePastExperience(trustRecord, actualContext, allInteractions);

    let numerator = 0;
    let denominator = 0;

    if (T_present.wasApplied) {
      numerator += ConstantsInstance.PRESENT_TRUST_WEIGHT * T_present.value;
      denominator += ConstantsInstance.PRESENT_TRUST_WEIGHT;
    }

    if (T_past.wasApplied) {
      numerator += ConstantsInstance.PAST_TRUST_WEIGHT * T_past.value;
      denominator += ConstantsInstance.PAST_TRUST_WEIGHT;
    }

    const T_d = denominator > 0 ? numerator / denominator : 0;
    return { value: T_d, wasApplied: denominator > 0 };
  }

  private static calculatePresentExperience(trustRecord: TrustRecord): TrustCalculationData {
    const interactions = trustRecord.interactions;

    const recentInteractions = interactions.slice(-5); // TODO better calculate recent interactions

    const w_communication = ConstantsInstance.COMMUNICATION_TRUST_WEIGHT;
    const w_observation = ConstantsInstance.OBSERVATION_TRUST_WEIGHT;

    let T_communication = 0;
    let T_observation = 0;

    // Calculate T_communication
    let sumCommunicationTrust = 0;
    let countCommunication = 0;
    for (const interaction of recentInteractions) {
      if (isValue(interaction.expectedValue)) {
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

    let communicationTrust = 0;
    let denominator = 0;
    if (countCommunication > 0) {
      communicationTrust = w_communication * T_communication;
      denominator += w_communication;
    }

    let observationTrust = 0;
    if (countBehaviors > 0) {
      observationTrust += w_observation * T_observation;
      denominator += w_observation;
    }
    // Calculate T_present
    const T_present = denominator > 0 ? (communicationTrust + observationTrust) / denominator : 0;
    return { value: T_present, wasApplied: denominator > 0 };
  }

  private static calculatePastExperience(
    trustRecord: TrustRecord,
    currentContext: ContextInformation,
    allInteractions: Interaction[],
  ): TrustCalculationData {
    const T_pastTrustee = this.calculateTrustScoreWithSpecificMember(trustRecord);
    const T_pastContext = this.calculateTrustScoreFromAllInteractionsUsingContext(allInteractions, currentContext);

    let denominator = 0;
    let numerator = 0;

    if (T_pastTrustee.wasApplied) {
      numerator += ConstantsInstance.PAST_TRUSTEE_WEIGHT * T_pastTrustee.value;
      denominator += ConstantsInstance.PAST_TRUSTEE_WEIGHT;
    }

    if (T_pastContext.wasApplied) {
      numerator += ConstantsInstance.PAST_CONTEXT_WEIGHT * T_pastContext.value;
      denominator += ConstantsInstance.PAST_CONTEXT_WEIGHT;
    }
    const T_past = denominator > 0 ? numerator / denominator : 0;

    return { value: T_past, wasApplied: denominator > 0 };
  }

  private static calculateTrustScoreWithSpecificMember(trustRecord: TrustRecord): TrustCalculationData {
    const trustScore = erosion(trustRecord.currentTrustLevel, trustRecord.lastUpdate, new Date());
    return { value: trustScore, wasApplied: true };
  }

  private static calculateTrustScoreFromAllInteractionsUsingContext(
    allInteractions: Interaction[],
    currentContext: ContextInformation,
  ): TrustCalculationData {
    let numerator = 0;
    let denominator = 0;

    for (const interaction of allInteractions) {
      if (interaction.outcome === null) continue;
      const Trust_kj = interaction.outcome ? 1 : 0;
      const S_kj = this.calculateSimilarityScore(currentContext, interaction.context);

      numerator += Trust_kj * S_kj;
      denominator += S_kj;
    }

    const T_pastContext = denominator > 0 ? numerator / denominator : 0;

    return { value: T_pastContext, wasApplied: denominator !== 0 };
  }

  private static calculateSimilarityScore(currentContext: ContextInformation, pastContext: ContextInformation): number {
    const components = ["stateOfTheTrustor", "missionState", "timeLeft", "dataSensitivity"];
    let S_kj = 0;

    for (const component of components) {
      const C_current = currentContext.getContextComponent(component);
      const C_past = pastContext.getContextComponent(component);

      const alpha = C_current >= C_past ? 1 : -1;
      const S_component = (1 - Math.abs(C_current - C_past)) * alpha;
      S_kj += S_component;
    }

    return S_kj;
  }
}
