import { Interaction, InteractionInterface } from "../common/interaction";
import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";
import { ContextInformation } from "./trust/contextInformation";
import { Trust } from "./trustService";

export interface TrustRecordInterface {
  currentTrustLevel: number;
  lastUpdate: Date;
  interactions: InteractionInterface[];
}

export class TrustRecord implements TrustRecordInterface {
  public currentTrustLevel: number;
  public lastUpdate: Date;
  public interactions: Interaction[];
  public trustScores: { trust: Trust; timestamp: number; isTransporting: boolean }[] = [
    {
      trust: {
        value: ConstantsInstance.INIT_TRUST_VALUE,
        directTrust: {
          value: ConstantsInstance.INIT_TRUST_VALUE,
          wasApplied: true,
          pastExperience: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          presentExperience: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
        },
        indirectTrust: {
          value: ConstantsInstance.INIT_TRUST_VALUE,
          wasApplied: true,
          authorityTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          leaderTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          trustedPeersTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
          otherPeersTrust: {
            value: ConstantsInstance.INIT_TRUST_VALUE,
            wasApplied: true,
          },
        },
        contextInformation: {
          context: new ContextInformation(),
          value: new ContextInformation().getThreshold(),
        },
      },
      timestamp: 0,
      isTransporting: false,
    },
  ];

  constructor(lastUpdate?: Date) {
    this.currentTrustLevel = ConstantsInstance.INIT_TRUST_VALUE;
    this.interactions = [];
    this.lastUpdate = lastUpdate ?? new Date();
  }

  public addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
    this.lastUpdate = interaction.timestamp;
  }

  public updateAnalyticsData(trust: Trust, isTransporting: boolean): void {
    this.trustScores.push({
      trust: {
        ...trust,
        value: this.currentTrustLevel,
      },
      timestamp,
      isTransporting,
    });
  }

  public updateTrustScore(trust: number): void {
    this.currentTrustLevel = trust;
  }
}
