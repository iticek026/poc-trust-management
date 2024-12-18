import { isValue } from "../../../utils/checks";
import { calculateRE } from "../../../utils/utils";
import { ConstantsInstance } from "../consts";
import { TrustCalculationData } from "../interfaces";
import { TrustRecord } from "../trustRecord";
import { ContextInformation } from "./contextInformation";
import { erosion } from "./utils";

export type DirectTrustCalculationData = TrustCalculationData & {
  presentExperience: TrustCalculationData;
  pastExperience: TrustCalculationData;
};

export class DirectTrust {
  public static calculate(trustRecord: TrustRecord, actualContext?: ContextInformation): DirectTrustCalculationData {
    if (!actualContext) {
      throw new Error("Actual context is required to calculate direct trust");
    }

    const T_present = this.calculatePresentExperience(trustRecord);
    const T_past = this.calculatePastExperience(trustRecord);

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
    return {
      value: T_d * ConstantsInstance.DIRECT_TRUST_WEIGHT,
      wasApplied: denominator > 0,
      presentExperience: T_present,
      pastExperience: T_past,
    };
  }

  private static calculatePresentExperience(trustRecord: TrustRecord): TrustCalculationData {
    const interactions = trustRecord.interactions;

    const recentInteractions = interactions.slice(-1);

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
        const wasThereSusBehaviour = interaction.observedBehaviors.some((b) => !b);
        sumBehaviors += wasThereSusBehaviour ? 0 : 1;
        countBehaviors += 1;
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

  private static calculatePastExperience(trustRecord: TrustRecord): TrustCalculationData {
    const T_past = erosion(trustRecord.trustScore, trustRecord.lastUpdate, new Date());
    return { value: T_past, wasApplied: true };
  }
}
