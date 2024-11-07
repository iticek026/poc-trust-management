import { Interaction, InteractionInterface } from "../common/interaction";
import { timestamp } from "../simulation/simulation";
import { ConstantsInstance } from "./consts";
import { erosion } from "./trust/utils";
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
  public trustScores: { trust: Trust; timestamp: number }[] = [
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
      },
      timestamp: 0,
    },
  ];

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

  public updateAnalyticsData(trust: Trust): void {
    this.trustScores.push({
      trust: {
        ...trust,
        value: this.currentTrustLevel,
      },
      timestamp,
    });
  }

  public updateTrustScore(trust: number): void {
    const newTrust = (this.currentTrustLevel + trust) / 2;

    this.currentTrustLevel = newTrust;
  }
}
